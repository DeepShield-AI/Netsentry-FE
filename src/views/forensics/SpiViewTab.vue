<template>
  <div class="spi-view">
    <!-- Search + Time -->
    <div class="spi-toolbar">
      <div class="spi-search">
        <input v-model="expression" class="spi-input" placeholder="搜索表达式..." @keyup.enter="load" />
        <button class="btn btn-theme" @click="load">搜索</button>
      </div>
      <div class="spi-time">
        <button
          v-for="t in timePresets"
          :key="t.label"
          class="time-btn"
          :class="{ active: activePreset === t.label }"
          @click="selectPreset(t)"
        >{{ t.label }}</button>
      </div>
    </div>

    <div v-if="loading" class="spi-loading">加载字段聚合中...</div>

    <!-- SPI Aggregation Cards -->
    <div v-else class="spi-grid">
      <div v-for="field in fields" :key="field.name" class="spi-card">
        <div class="spi-card-header">
          <h3>{{ field.label }}</h3>
          <span class="spi-card-count">{{ field.items.length }} 个值</span>
        </div>
        <table class="spi-table">
          <thead>
            <tr>
              <th>值</th>
              <th class="num">会话数</th>
              <th class="num">字节</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in field.items.slice(0, field.expanded ? 100 : 10)" :key="item.value">
              <td class="spi-value mono">{{ item.value }}</td>
              <td class="num">{{ formatNumber(item.count) }}</td>
              <td class="num">{{ formatBytes(item.bytes) }}</td>
            </tr>
          </tbody>
        </table>
        <button v-if="field.items.length > 10" class="spi-more" @click="field.expanded = !field.expanded">
          {{ field.expanded ? '收起' : `展开全部 ${field.items.length} 个` }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { api } from '@/api/client'
import type { Flow, HuntQuery } from '@/api/types'
import { formatBytes, formatNumber } from '@/utils/format'

interface TimePreset { label: string; mins: number }
const timePresets: TimePreset[] = [
  { label: '1h', mins: 60 },
  { label: '6h', mins: 360 },
  { label: '24h', mins: 1440 },
  { label: '7d', mins: 10080 },
  { label: '30d', mins: 43200 },
]
const activePreset = ref('24h')
const expression = ref('')
const loading = ref(false)

interface SpiItem { value: string; count: number; bytes: number }
interface SpiField { name: string; label: string; items: SpiItem[]; expanded: boolean }
const fields = ref<SpiField[]>([])

function selectPreset(t: TimePreset) {
  activePreset.value = t.label
  load()
}

function getTimeRange(): { since: string; until: string } {
  const preset = timePresets.find(t => t.label === activePreset.value)
  const now = new Date()
  const since = preset && preset.mins > 0 ? new Date(now.getTime() - preset.mins * 60000) : new Date(0)
  return { since: since.toISOString(), until: now.toISOString() }
}

async function load() {
  loading.value = true
  try {
    const { since, until } = getTimeRange()
    const q: HuntQuery = { since, until, limit: 500 }
    if (expression.value.trim()) q.q = expression.value.trim()
    const env = await api.historyHunt(q)
    if (env.disabled || !env.items) { fields.value = []; return }
    fields.value = aggregateFields(env.items)
  } catch { /* silent */ } finally { loading.value = false }
}

function aggregateFields(flows: Flow[]): SpiField[] {
  const agg = (extract: (f: Flow) => string | undefined, label: string, name: string): SpiField => {
    const map = new Map<string, { count: number; bytes: number }>()
    for (const f of flows) {
      const v = extract(f)
      if (!v) continue
      const e = map.get(v) || { count: 0, bytes: 0 }
      e.count++; e.bytes += f.bytes_count
      map.set(v, e)
    }
    const items = [...map.entries()]
      .map(([value, { count, bytes }]) => ({ value, count, bytes }))
      .sort((a, b) => b.count - a.count)
    return { name, label, items, expanded: false }
  }

  return [
    agg(f => f.five_tuple.src_ip, '源 IP', 'src_ip'),
    agg(f => f.five_tuple.dst_ip, '目的 IP', 'dst_ip'),
    agg(f => String(f.five_tuple.dst_port), '目的端口', 'dst_port'),
    agg(f => f.app_proto || f.master_proto, '应用协议', 'app_proto'),
    agg(f => f.category, '分类', 'category'),
    agg(f => f.host, '主机 / SNI', 'host'),
    agg(f => f.process_name, '进程', 'process'),
    agg(f => { const p = parseInt(f.five_tuple.protocol, 10); return p === 6 ? 'TCP' : p === 17 ? 'UDP' : p === 1 ? 'ICMP' : String(p) }, 'IP 协议', 'proto'),
  ].filter(f => f.items.length > 0)
}

onMounted(load)
</script>

<style scoped>
.spi-view { font-size: 13px; }
.spi-toolbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 16px; background: #fff; border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
}
.spi-search { display: flex; gap: 6px; flex: 1; max-width: 600px; }
.spi-input {
  flex: 1; padding: 7px 10px; border: 1px solid var(--el-border-color, #dcdfe6); border-radius: 4px;
  font-size: 13px; outline: none; color: var(--el-text-color-primary, #303030);
}
.spi-input:focus { border-color: var(--el-color-primary, #409eff); }
.spi-time { display: flex; gap: 2px; }
.time-btn {
  padding: 3px 10px; border: 1px solid var(--el-border-color, #dcdfe6); border-radius: 4px;
  background: #fff; color: var(--el-text-color-regular, #606266); font-size: 12px; cursor: pointer;
}
.time-btn:hover { background: var(--el-fill-color-light, #f5f7fa); }
.time-btn.active { background: var(--el-color-primary, #409eff); border-color: var(--el-color-primary, #409eff); color: #fff; }
.btn { display: inline-flex; align-items: center; gap: 4px; padding: 5px 12px; border: 1px solid var(--el-border-color, #dcdfe6); border-radius: 4px; background: #fff; color: var(--el-text-color-regular, #606266); font-size: 12px; cursor: pointer; }
.btn-theme { background: var(--el-color-primary, #409eff); border-color: var(--el-color-primary, #409eff); color: #fff; }
.btn-theme:hover { background: var(--el-color-primary-dark-2, #337ecc); }
.spi-loading { padding: 48px; text-align: center; color: var(--el-text-color-secondary, #909399); }
.spi-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 14px; padding: 16px;
}
.spi-card {
  border: 1px solid var(--el-border-color-lighter, #ebeef5); border-radius: var(--sg-card-radius, 8px); background: #fff; overflow: hidden;
}
.spi-card-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px; background: var(--el-fill-color-lighter, #fafcff); border-bottom: 1px solid var(--el-border-color-extra-light, #f2f6fc);
}
.spi-card-header h3 { margin: 0; font-size: 13px; font-weight: 600; color: var(--el-color-primary, #409eff); }
.spi-card-count { font-size: 11px; color: var(--el-text-color-secondary, #909399); }
.spi-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.spi-table th {
  padding: 6px 10px; text-align: left; font-size: 11px; font-weight: 600;
  color: var(--el-text-color-secondary, #909399); text-transform: uppercase; border-bottom: 1px solid var(--el-border-color-extra-light, #f2f6fc);
}
.spi-table td { padding: 5px 10px; border-bottom: 1px solid var(--el-border-color-extra-light, #f2f6fc); }
.spi-table tr:hover { background: var(--el-color-primary-light-9, #ecf5ff); }
.spi-value { color: var(--el-text-color-primary, #303030); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.num { text-align: right; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; }
.spi-more {
  display: block; width: 100%; padding: 8px; border: none; background: var(--el-fill-color-lighter, #fafcff);
  color: var(--el-color-primary, #409eff); font-size: 12px; cursor: pointer; text-align: center;
}
.spi-more:hover { background: var(--el-fill-color-light, #f5f7fa); }
</style>
