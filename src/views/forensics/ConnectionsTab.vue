<template>
  <div class="connections-view">
    <!-- Toolbar -->
    <div class="conn-toolbar">
      <div class="conn-left">
        <label class="conn-label">源:</label>
        <select v-model="srcField" class="conn-select" @change="load">
          <option value="src_ip">源 IP</option>
          <option value="src_port">源端口</option>
        </select>
        <label class="conn-label">目的:</label>
        <select v-model="dstField" class="conn-select" @change="load">
          <option value="dst_ip">目的 IP</option>
          <option value="dst_port">目的端口</option>
        </select>
        <label class="conn-label">颜色:</label>
        <select v-model="colorBy" class="conn-select">
          <option value="sessions">会话数</option>
          <option value="bytes">字节</option>
        </select>
      </div>
      <div class="conn-right">
        <button
          v-for="t in timePresets"
          :key="t.label"
          class="time-btn"
          :class="{ active: activePreset === t.label }"
          @click="selectPreset(t)"
        >{{ t.label }}</button>
      </div>
    </div>

    <div v-if="loading" class="conn-loading">加载连接中...</div>

    <!-- Connection Table (Chord-style info) -->
    <div v-if="!loading && connections.length" class="conn-content">
      <div class="conn-summary">
        <span><strong>{{ nodes.size }}</strong> 节点</span>
        <span><strong>{{ connections.length }}</strong> 连接</span>
        <span><strong>{{ formatNumber(totalSessions) }}</strong> 会话</span>
        <span><strong>{{ formatBytes(totalBytesCnt) }}</strong> 传输</span>
      </div>
      <div ref="chartEl" class="conn-chart"></div>
      <table class="conn-table">
        <thead>
          <tr>
            <th class="sortable" @click="sortConnections('src')">源</th>
            <th class="sortable" @click="sortConnections('dst')">目的</th>
            <th class="sortable num" @click="sortConnections('sessions')">会话数</th>
            <th class="sortable num" @click="sortConnections('bytes')">字节</th>
            <th class="num">平均时长</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in connections.slice(0, showCount)" :key="c.src + c.dst">
            <td class="mono src-color">{{ c.src }}</td>
            <td class="mono dst-color">{{ c.dst }}</td>
            <td class="num">{{ formatNumber(c.sessions) }}</td>
            <td class="num">{{ formatBytes(c.bytes) }}</td>
            <td class="num">{{ (c.avgDuration / 1000).toFixed(1) }}s</td>
          </tr>
        </tbody>
      </table>
      <button v-if="connections.length > showCount" class="conn-more" @click="showCount += 50">
        加载更多 (剩余 {{ connections.length - showCount }} 条)
      </button>
    </div>
    <div v-if="!loading && !connections.length" class="conn-empty">所选时间范围内无连接。</div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import * as echarts from 'echarts/core'
import { GraphChart } from 'echarts/charts'
import { TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { api } from '@/api/client'
import type { Flow, HuntQuery } from '@/api/types'
import { formatBytes, formatNumber } from '@/utils/format'

echarts.use([GraphChart, TooltipComponent, CanvasRenderer])

interface TimePreset { label: string; mins: number }
const timePresets: TimePreset[] = [
  { label: '1h', mins: 60 },
  { label: '6h', mins: 360 },
  { label: '24h', mins: 1440 },
  { label: '7d', mins: 10080 },
]
const activePreset = ref('24h')
const srcField = ref('src_ip')
const dstField = ref('dst_ip')
const colorBy = ref('sessions')
const loading = ref(false)
const showCount = ref(50)

interface Conn { src: string; dst: string; sessions: number; bytes: number; avgDuration: number }
const connections = ref<Conn[]>([])
const nodes = ref<Set<string>>(new Set())
const totalSessions = computed(() => connections.value.reduce((s, c) => s + c.sessions, 0))
const totalBytesCnt = computed(() => connections.value.reduce((s, c) => s + c.bytes, 0))

const chartEl = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

function selectPreset(t: TimePreset) { activePreset.value = t.label; load() }

function getTimeRange() {
  const preset = timePresets.find(t => t.label === activePreset.value)
  const now = new Date()
  const since = preset && preset.mins > 0 ? new Date(now.getTime() - preset.mins * 60000) : new Date(0)
  return { since: since.toISOString(), until: now.toISOString() }
}

function extractSrc(f: Flow): string {
  return srcField.value === 'src_ip' ? f.five_tuple.src_ip : String(f.five_tuple.src_port)
}
function extractDst(f: Flow): string {
  return dstField.value === 'dst_ip' ? f.five_tuple.dst_ip : String(f.five_tuple.dst_port)
}

async function load() {
  loading.value = true
  showCount.value = 50
  if (chart) { chart.dispose(); chart = null }
  try {
    const { since, until } = getTimeRange()
    const q: HuntQuery = { since, until, limit: 5000 }
    const env = await api.historyHunt(q)
    if (env.disabled || !env.items) { connections.value = []; nodes.value = new Set(); return }
    buildConnections(env.items)
    loading.value = false  // allow v-if to render the chart container
    await nextTick()
    await nextTick()
    // Init chart after DOM has rendered the chartEl
    if (chartEl.value) {
      chart = echarts.init(chartEl.value)
      buildGraph()
    }
  } catch (e) { console.error('Connections load:', e) } finally { loading.value = false }
}

function buildConnections(flows: Flow[]) {
  const map = new Map<string, { sessions: number; bytes: number; totalDuration: number }>()
  const ns = new Set<string>()
  for (const f of flows) {
    const src = extractSrc(f), dst = extractDst(f)
    ns.add(src); ns.add(dst)
    const key = `${src}→${dst}`
    const e = map.get(key) || { sessions: 0, bytes: 0, totalDuration: 0 }
    e.sessions++; e.bytes += f.bytes_count; e.totalDuration += (f.duration_ms || 0)
    map.set(key, e)
  }
  nodes.value = ns
  connections.value = [...map.entries()].map(([key, e]) => {
    const [src, dst] = key.split('→')
    return { src, dst, sessions: e.sessions, bytes: e.bytes, avgDuration: e.totalDuration / e.sessions }
  }).sort((a, b) => b.sessions - a.sessions)
}

function buildGraph() {
  if (!chartEl.value || connections.value.length === 0) return
  if (!chart) chart = echarts.init(chartEl.value)

  const top = connections.value.slice(0, 60)
  const nodeSet = new Set<string>()
  for (const c of top) { nodeSet.add(c.src); nodeSet.add(c.dst) }

  // Compute node weight (total sessions touching this node)
  const nodeWeight = new Map<string, number>()
  for (const n of nodeSet) {
    const w = top.filter(c => c.src === n || c.dst === n).reduce((s, c) => s + c.sessions, 0)
    nodeWeight.set(n, w)
  }
  const maxWeight = Math.max(...nodeWeight.values(), 1)

  // Determine if node is a "source" type or "destination" type
  const srcNodes = new Set(top.map(c => c.src))
  const dstNodes = new Set(top.map(c => c.dst))

  const nodeData = [...nodeSet].map(n => {
    const w = nodeWeight.get(n) || 1
    const isSrc = srcNodes.has(n)
    const isDst = dstNodes.has(n)
    let category = 0 // both
    if (isSrc && !isDst) category = 0 // source only
    else if (isDst && !isSrc) category = 1 // dest only
    else category = 2 // both
    return {
      name: n,
      symbolSize: Math.max(12, Math.min(50, (w / maxWeight) * 50)),
      category,
      itemStyle: {
        color: category === 0 ? '#e6522c' : category === 1 ? '#409eff' : '#67c23a',
        borderColor: '#fff',
        borderWidth: 1,
      },
    }
  })

  const maxSess = Math.max(...top.map(c => c.sessions), 1)
  const links = top.map(c => ({
    source: c.src,
    target: c.dst,
    value: c.sessions,
    lineStyle: {
      width: Math.max(1, (c.sessions / maxSess) * 8),
      color: colorBy.value === 'bytes' ? '#67c23a' : '#adb5bd',
      opacity: 0.5,
      curveness: 0.2,
    },
  }))

  chart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        if (params.dataType === 'edge') {
          return `${params.data.source} → ${params.data.target}<br/>会话: <b>${params.data.value}</b>`
        }
        return `<b>${params.name}</b><br/>连接权重: ${nodeWeight.get(params.name) || 0}`
      },
    },
    legend: {
      data: ['源', '目的', '双向'],
      top: 10,
      right: 16,
      textStyle: { fontSize: 11 },
    },
    series: [{
      type: 'graph',
      layout: 'force',
      data: nodeData,
      links,
      categories: [
        { name: '源' },
        { name: '目的' },
        { name: '双向' },
      ],
      roam: true,
      draggable: true,
      label: {
        show: true,
        position: 'right',
        fontSize: 10,
        color: '#303030',
        formatter: '{b}',
      },
      force: {
        repulsion: 300,
        gravity: 0.1,
        edgeLength: [80, 250],
        layoutAnimation: true,
      },
      emphasis: {
        focus: 'adjacency',
        lineStyle: { width: 6, opacity: 0.8 },
        label: { fontSize: 12, fontWeight: 'bold' },
      },
      lineStyle: { curveness: 0.2 },
    }],
  }, true)
}

function sortConnections(by: 'src' | 'dst' | 'sessions' | 'bytes') {
  switch (by) {
    case 'src': connections.value.sort((a, b) => a.src.localeCompare(b.src)); break
    case 'dst': connections.value.sort((a, b) => a.dst.localeCompare(b.dst)); break
    case 'sessions': connections.value.sort((a, b) => b.sessions - a.sessions); break
    case 'bytes': connections.value.sort((a, b) => b.bytes - a.bytes); break
  }
}

function handleResize() { chart?.resize() }

onMounted(() => {
  window.addEventListener('resize', handleResize)
  load()
})
onBeforeUnmount(() => { chart?.dispose(); window.removeEventListener('resize', handleResize) })
</script>

<style scoped>
.connections-view { font-size: 13px; }
.conn-toolbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 16px; background: #fff; border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5); flex-wrap: wrap; gap: 8px;
}
.conn-left { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.conn-right { display: flex; gap: 2px; }
.conn-label { font-size: 12px; color: var(--el-text-color-secondary, #909399); font-weight: 500; }
.conn-select { padding: 5px 10px; border: 1px solid var(--el-border-color, #dcdfe6); border-radius: 4px; font-size: 12px; background: #fff; color: var(--el-text-color-primary, #303030); }
.time-btn { padding: 3px 10px; border: 1px solid var(--el-border-color, #dcdfe6); border-radius: 4px; background: #fff; color: var(--el-text-color-regular, #606266); font-size: 12px; cursor: pointer; }
.time-btn:hover { background: var(--el-fill-color-light, #f5f7fa); }
.time-btn.active { background: var(--el-color-primary, #409eff); border-color: var(--el-color-primary, #409eff); color: #fff; }
.conn-loading { padding: 48px; text-align: center; color: var(--el-text-color-secondary, #909399); }
.conn-empty { padding: 48px; text-align: center; color: var(--el-text-color-secondary, #909399); }
.conn-content { padding: 0; }
.conn-summary {
  display: flex; gap: 20px; padding: 10px 16px;
  font-size: 12px; color: var(--el-text-color-secondary, #909399); border-bottom: 1px solid var(--el-border-color-extra-light, #f2f6fc);
}
.conn-summary strong { color: var(--el-text-color-primary, #303030); }
.conn-chart { width: calc(100% - 32px); height: 500px; margin: 16px; background: #fafcff; border-radius: var(--sg-card-radius, 8px); border: 1px solid var(--el-border-color-lighter, #ebeef5); }
.conn-table { width: calc(100% - 32px); margin: 0 16px 16px; border-collapse: collapse; font-size: 12px; background: #fff; border-radius: var(--sg-card-radius, 8px); border: 1px solid var(--el-border-color-lighter, #ebeef5); overflow: hidden; }
.conn-table th {
  padding: 8px 10px; text-align: left; font-weight: 600; font-size: 12px;
  color: var(--el-text-color-secondary, #909399); background: var(--el-fill-color-lighter, #fafcff); border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5); user-select: none;
}
.conn-table th.sortable { cursor: pointer; }
.conn-table th.sortable:hover { color: var(--el-color-primary, #409eff); }
.conn-table td { padding: 6px 10px; border-bottom: 1px solid var(--el-border-color-extra-light, #f2f6fc); }
.conn-table tr:hover { background: var(--el-color-primary-light-9, #ecf5ff); }
.num { text-align: right; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; }
.src-color { color: #e6522c; }
.dst-color { color: var(--el-color-primary, #409eff); }
.conn-more {
  display: block; width: calc(100% - 32px); margin: 0 16px 16px; padding: 10px; border: 1px solid var(--el-border-color-lighter, #ebeef5); border-radius: var(--sg-card-radius, 8px); background: #fff;
  color: var(--el-color-primary, #409eff); font-size: 12px; cursor: pointer; text-align: center;
}
.conn-more:hover { background: var(--el-fill-color-light, #f5f7fa); }
</style>
