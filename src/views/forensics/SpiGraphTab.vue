<template>
  <div class="spi-graph">
    <!-- Toolbar -->
    <div class="sg-toolbar">
      <div class="sg-left">
        <label class="sg-label">字段:</label>
        <select v-model="selectedField" class="sg-select" @change="load">
          <option value="app_proto">应用协议</option>
          <option value="dst_port">目的端口</option>
          <option value="src_ip">源 IP</option>
          <option value="dst_ip">目的 IP</option>
          <option value="category">分类</option>
          <option value="host">主机 / SNI</option>
          <option value="proto">IP 协议</option>
          <option value="process">进程</option>
        </select>
        <label class="sg-label">最大值数:</label>
        <select v-model.number="maxItems" class="sg-select sg-select-sm" @change="load">
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
        </select>
      </div>
      <div class="sg-right">
        <button
          v-for="t in timePresets"
          :key="t.label"
          class="time-btn"
          :class="{ active: activePreset === t.label }"
          @click="selectPreset(t)"
        >{{ t.label }}</button>
      </div>
    </div>

    <div v-if="loading" class="sg-loading">加载 SPI 图中...</div>

    <!-- Arkime-style per-value rows with canvas sparklines -->
    <div v-show="!loading && rows.length" ref="rowsContainer" class="spigraph-rows">
      <div v-for="(row, idx) in rows" :key="row.name" class="spigraph-row">
        <div class="row-left">
          <span class="row-name" :style="{ color: COLORS[idx % COLORS.length] }">{{ row.name }}</span>
          <span class="row-stats">
            {{ row.sessions.toLocaleString() }} 会话 · {{ fmtBytes(row.bytes) }}
          </span>
        </div>
        <canvas class="row-canvas" width="800" height="40" :data-idx="idx"></canvas>
      </div>
    </div>

    <div v-if="!loading && !rows.length" class="sg-empty">所选时间范围内无数据</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { api } from '@/api/client'
import type { Flow, HuntQuery } from '@/api/types'

interface TimePreset { label: string; mins: number }
const timePresets: TimePreset[] = [
  { label: '1h', mins: 60 },
  { label: '6h', mins: 360 },
  { label: '24h', mins: 1440 },
  { label: '7d', mins: 10080 },
  { label: '30d', mins: 43200 },
]
const activePreset = ref('24h')
const selectedField = ref('app_proto')
const maxItems = ref(20)
const loading = ref(false)

interface SpigraphRow {
  name: string
  sessions: number
  bytes: number
  buckets: number[]
}
const rows = ref<SpigraphRow[]>([])
const rowsContainer = ref<HTMLElement | null>(null)

const COLORS = ['#004C83','#66B689','#2F7D86','#ECB30A','#c0392b','#8e44ad','#2980b9','#27ae60','#d35400','#16a085',
  '#f39c12','#e74c3c','#3498db','#1abc9c','#9b59b6','#e67e22','#34495e','#1f618d','#7d3c98','#2e86c1']

const bucketCount = 50

function selectPreset(t: TimePreset) { activePreset.value = t.label; load() }

function getTimeRange() {
  const preset = timePresets.find(t => t.label === activePreset.value)
  const now = new Date()
  const since = preset && preset.mins > 0 ? new Date(now.getTime() - preset.mins * 60000) : new Date(0)
  return { since: since.toISOString(), until: now.toISOString() }
}

function extractField(f: Flow): string | undefined {
  switch (selectedField.value) {
    case 'app_proto': return f.app_proto || f.master_proto || 'Other'
    case 'dst_port': return String(f.five_tuple.dst_port)
    case 'src_ip': return f.five_tuple.src_ip
    case 'dst_ip': return f.five_tuple.dst_ip
    case 'category': return f.category || 'Unknown'
    case 'host': return f.host || '(empty)'
    case 'proto': { const p = parseInt(f.five_tuple.protocol, 10); return p === 6 ? 'TCP' : p === 17 ? 'UDP' : p === 1 ? 'ICMP' : String(p) }
    case 'process': return f.process_name || '(unknown)'
    default: return undefined
  }
}

function fmtBytes(b: number): string {
  if (b < 1024) return b + ' B'
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB'
  if (b < 1073741824) return (b / 1048576).toFixed(1) + ' MB'
  return (b / 1073741824).toFixed(2) + ' GB'
}

async function load() {
  loading.value = true
  try {
    const { since, until } = getTimeRange()
    const q: HuntQuery = { since, until, limit: 5000 }
    const env = await api.historyHunt(q)
    const items = (env.disabled ? [] : env.items) || []
    const tMin = new Date(since).getTime()
    const tMax = new Date(until).getTime()
    const bucketMs = Math.max((tMax - tMin) / bucketCount, 1)

    // Aggregate per field value
    const agg = new Map<string, { sessions: number; bytes: number; buckets: number[] }>()
    for (const f of items) {
      const v = extractField(f)
      if (!v) continue
      let entry = agg.get(v)
      if (!entry) { entry = { sessions: 0, bytes: 0, buckets: new Array(bucketCount).fill(0) }; agg.set(v, entry) }
      entry.sessions++
      entry.bytes += f.bytes_count || 0
      const t = new Date(f.timestamp).getTime()
      const idx = Math.min(Math.max(0, Math.floor((t - tMin) / bucketMs)), bucketCount - 1)
      entry.buckets[idx]++
    }

    // Sort by sessions desc, take top N
    const sorted = [...agg.entries()].sort((a, b) => b[1].sessions - a[1].sessions).slice(0, maxItems.value)
    rows.value = sorted.map(([name, data]) => ({ name, ...data }))
    loading.value = false

    // Use setTimeout to ensure DOM is fully rendered with v-show
    setTimeout(() => drawSparklines(), 50)
  } catch (e) { console.error('SpiGraph load error:', e); loading.value = false }
}

function drawSparklines(retries = 3) {
  const container = rowsContainer.value
  if (!container) {
    if (retries > 0) setTimeout(() => drawSparklines(retries - 1), 100)
    return
  }
  const canvases = container.querySelectorAll<HTMLCanvasElement>('canvas.row-canvas')
  if (canvases.length === 0 && retries > 0) {
    setTimeout(() => drawSparklines(retries - 1), 100)
    return
  }
  // Find global max for relative sizing
  const globalMax = Math.max(...rows.value.map(r => r.sessions), 1)

  canvases.forEach((canvas, i) => {
    if (i >= rows.value.length) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const row = rows.value[i]
    const w = canvas.width, h = canvas.height
    const color = COLORS[i % COLORS.length]
    ctx.clearRect(0, 0, w, h)

    // Check if time buckets have meaningful spread
    const nonZeroBuckets = row.buckets.filter(v => v > 0).length
    if (nonZeroBuckets > 2) {
      // Draw time-distributed bar chart
      const max = Math.max(...row.buckets, 1)
      const barW = w / bucketCount
      ctx.fillStyle = color
      for (let b = 0; b < bucketCount; b++) {
        const barH = (row.buckets[b] / max) * (h - 2)
        if (barH > 0) {
          ctx.fillRect(Math.round(b * barW) + 1, h - barH, Math.round(barW) - 2, barH)
        }
      }
    } else {
      // Draw single proportional bar (like Arkime's fallback)
      const ratio = row.sessions / globalMax
      const barW = Math.max(4, ratio * w)
      ctx.fillStyle = color
      ctx.fillRect(0, 2, barW, h - 4)
      // Add subtle gradient
      const grad = ctx.createLinearGradient(0, 0, barW, 0)
      grad.addColorStop(0, color)
      grad.addColorStop(1, color + '44')
      ctx.fillStyle = grad
      ctx.fillRect(0, 2, barW, h - 4)
    }
  })
}

onMounted(() => { load() })
</script>

<style scoped>
.spi-graph { font-size: 13px; }
.sg-toolbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 16px; background: #fff; border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
}
.sg-left { display: flex; align-items: center; gap: 10px; }
.sg-right { display: flex; gap: 2px; }
.sg-label { font-size: 12px; color: var(--el-text-color-secondary, #909399); font-weight: 500; }
.sg-select { padding: 5px 10px; border: 1px solid var(--el-border-color, #dcdfe6); border-radius: 4px; font-size: 12px; background: #fff; color: var(--el-text-color-primary, #303030); }
.sg-select-sm { width: 60px; }
.time-btn { padding: 3px 10px; border: 1px solid var(--el-border-color, #dcdfe6); border-radius: 4px; background: #fff; color: var(--el-text-color-regular, #606266); font-size: 12px; cursor: pointer; }
.time-btn:hover { background: var(--el-fill-color-light, #f5f7fa); }
.time-btn.active { background: var(--el-color-primary, #409eff); border-color: var(--el-color-primary, #409eff); color: #fff; }
.sg-loading { padding: 48px; text-align: center; color: var(--el-text-color-secondary, #909399); }
.sg-empty { padding: 48px; text-align: center; color: var(--el-text-color-secondary, #909399); }

/* Arkime-style per-value rows */
.spigraph-rows { padding: 8px 16px; }
.spigraph-row {
  display: flex; align-items: center; gap: 12px;
  background: #fff;
  border: 1px solid var(--el-border-color-lighter, #ebeef5);
  border-radius: 4px;
  margin-bottom: 4px;
  padding: 6px 12px;
}
.row-left { flex: 0 0 200px; min-width: 0; }
.row-name {
  display: block; font-weight: 600; font-size: 13px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.row-stats { font-size: 11px; color: var(--el-text-color-secondary, #909399); }
.row-canvas { flex: 1; height: 36px; border-radius: 3px; background: #fafcff; }
</style>
