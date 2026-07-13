<template>
  <div class="page">
    <!-- ── KPI 卡片 — 传输量视角 ─────────────────────── -->
    <el-row :gutter="14" class="kpi-row">
      <el-col :xs="12" :sm="8" :md="4">
        <StatCard label="总传输量" :value="formatBytes(totalBytes)"
                  :sub="formatNumber(totalCount) + ' 条流'" :icon="DataLine" tone="#3b82f6" />
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <StatCard label="最大单次" :value="formatBytes(maxTransfer)"
                  sub="峰值传输" :icon="Upload" tone="#ef4444" />
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <StatCard label="平均速率" :value="avgSpeed"
                  sub="字节/秒" :icon="Odometer" tone="#f59e0b" />
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <StatCard label="上传 / 下载" :value="uploadRatio + '%'"
                  :sub="'↑' + formatBytes(uploadBytes) + ' ↓' + formatBytes(downloadBytes)" :icon="Sort" tone="#22c55e" />
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <StatCard label="P2P 占比" :value="p2pRatio + '%'"
                  :sub="formatNumber(btCount) + ' BT流'" :icon="Share" tone="#a855f7" />
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <StatCard label="活跃协议" :value="formatNumber(activeApps)"
                  sub="文件传输类型" :icon="FolderOpened" tone="#64748b" />
      </el-col>
    </el-row>

    <!-- ── 图表行：散点图 + 协议带宽堆叠 ──────────────── -->
    <el-row :gutter="14" class="body-row">
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="section-header">
              <el-icon><ScaleToOriginal /></el-icon>
              <span>传输体积 vs 时长分布</span>
              <span class="muted small">气泡 = 包数</span>
            </div>
          </template>
          <div ref="scatterEl" class="chart-canvas"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="section-header">
              <el-icon><Histogram /></el-icon>
              <span>协议传输量对比</span>
              <span class="muted small">按字节</span>
            </div>
          </template>
          <div ref="barEl" class="chart-canvas"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- ── 流表 ──────────────────────────────────────── -->
    <el-card shadow="never" class="body-row">
      <template #header>
        <div class="section-header">
          <el-icon><Grid /></el-icon>
          <span>文件传输明细</span>
          <el-tag size="small" type="info" class="count-tag">{{ filteredFlows.length }} 条</el-tag>
          <div class="table-toolbar">
            <el-input v-model="flowSearch" placeholder="搜索 IP / 协议 / 主机名…" clearable
                      :prefix-icon="Search" size="small" style="width: 200px" />
            <el-select v-model="flowFilter" placeholder="协议" clearable size="small" style="width: 130px">
              <el-option label="FTP" value="FTP" />
              <el-option label="SMB" value="SMB" />
              <el-option label="NFS" value="NFS" />
              <el-option label="BitTorrent" value="BT" />
              <el-option label="云盘" value="CLOUD" />
            </el-select>
            <el-select v-model="sizeFilter" placeholder="体积" clearable size="small" style="width: 110px">
              <el-option label="> 10 MB" value="huge" />
              <el-option label="> 1 MB" value="large" />
              <el-option label="> 100 KB" value="medium" />
              <el-option label="< 100 KB" value="small" />
            </el-select>
            <el-button size="small" :icon="Refresh" @click="loadFlows">刷新</el-button>
          </div>
        </div>
      </template>

      <el-table :data="filteredFlows" size="small" stripe :max-height="520"
                :default-sort="{ prop: 'bytes_count', order: 'descending' }"
                empty-text="暂无文件传输流量…">
        <el-table-column prop="timestamp" label="时间" width="160" sortable>
          <template #default="{ row }"><span class="mono xs">{{ formatTime(row.timestamp) }}</span></template>
        </el-table-column>
        <el-table-column label="协议" width="110">
          <template #default="{ row }">
            <el-tag size="small" :type="appTagType(row)" disable-transitions>{{ appLabel(row) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="源" min-width="135">
          <template #default="{ row }">
            <span class="mono xs">{{ prettyIP(row.five_tuple.src_ip) }}<span class="port">:{{ row.five_tuple.src_port }}</span></span>
          </template>
        </el-table-column>
        <el-table-column label="目的" min-width="135">
          <template #default="{ row }">
            <span class="mono xs">{{ prettyIP(row.five_tuple.dst_ip) }}<span class="port">:{{ row.five_tuple.dst_port }}</span></span>
          </template>
        </el-table-column>
        <el-table-column prop="bytes_count" label="传输量" width="100" align="right" sortable>
          <template #default="{ row }">
            <span :class="sizeClass(row.bytes_count)">{{ formatBytes(row.bytes_count) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="速率" width="90" align="right">
          <template #default="{ row }">
            <span class="mono xs">{{ speedLabel(row) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="方向" width="60" align="center">
          <template #default="{ row }">
            <span :class="'dir dir-' + (row.direction || 'unknown')">{{ dirIcon(row.direction) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="主机" min-width="150">
          <template #default="{ row }">
            <span class="mono xs" :title="row.host">{{ ellipsis(row.host, 28) || '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="duration_ms" label="时长" width="80" align="right" sortable>
          <template #default="{ row }">{{ formatDurationMs(row.duration_ms) }}</template>
        </el-table-column>
        <el-table-column prop="packet_count" label="包数" width="70" align="right" sortable>
          <template #default="{ row }">{{ formatNumber(row.packet_count) }}</template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts/core'
import { ScatterChart, BarChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { DataLine, FolderOpened, Odometer, Refresh, Search, Share, Sort, Upload } from '@element-plus/icons-vue'

import StatCard from '@/components/StatCard.vue'
import { useProbeStore } from '@/stores/probe'
import { api } from '@/api/client'
import type { Flow } from '@/api/types'
import { ellipsis, formatBytes, formatDurationMs, formatNumber, formatTime, prettyIP } from '@/utils/format'

echarts.use([ScatterChart, BarChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer])

const store = useProbeStore()

// ── 文件传输协议集 ──
const FTP_NAMES = new Set(['FTP_CONTROL', 'FTP_DATA', 'FTP', 'FTPS'])
const SMB_NAMES = new Set(['SMB', 'SMBv1', 'SMBv23', 'SMBv2', 'SMBv3'])
const NFS_NAMES = new Set(['NFS'])
const BT_NAMES = new Set(['BitTorrent', 'Gnutella', 'eDonkey'])
const CLOUD_NAMES = new Set(['Dropbox', 'Google_Drive', 'GoogleDrive', 'OneDrive', 'Syncthing'])
const ALL_FILE_NAMES = new Set([...FTP_NAMES, ...SMB_NAMES, ...NFS_NAMES, ...BT_NAMES, ...CLOUD_NAMES, 'TFTP', 'AFP', 'Rsync', 'UFTP'])

// ── nDPI 计数 ──
function setProtoCount(names: Set<string>): number {
  const rows = store.ndpi?.protocols ?? []
  let total = 0
  for (const r of rows) { const n = r.app_name || r.master_name; if (names.has(n)) total += r.count }
  return total
}
const btCount = computed(() => setProtoCount(BT_NAMES))
const totalCount = computed(() => {
  const rows = store.ndpi?.protocols ?? []
  let total = 0
  for (const r of rows) { const n = r.app_name || r.master_name; if (ALL_FILE_NAMES.has(n)) total += r.count }
  return total
})
const activeApps = computed(() => {
  const rows = store.ndpi?.protocols ?? []
  const seen = new Set<string>()
  for (const r of rows) { const n = r.app_name || r.master_name; if (ALL_FILE_NAMES.has(n) && r.count > 0) seen.add(n) }
  return seen.size
})

// ── 流级别 KPI ──
const allFlows = ref<Flow[]>([])
const totalBytes = computed(() => allFlows.value.reduce((s, f) => s + (f.bytes_count || 0), 0))
const maxTransfer = computed(() => allFlows.value.reduce((m, f) => Math.max(m, f.bytes_count || 0), 0))
const avgSpeed = computed(() => {
  const flows = allFlows.value.filter(f => f.duration_ms > 0)
  if (!flows.length) return '—'
  const totalB = flows.reduce((s, f) => s + (f.bytes_count || 0), 0)
  const totalMs = flows.reduce((s, f) => s + f.duration_ms, 0)
  return formatBytes(Math.round(totalB / (totalMs / 1000))) + '/s'
})
const uploadBytes = computed(() => allFlows.value.filter(f => f.direction === 'outbound').reduce((s, f) => s + (f.bytes_count || 0), 0))
const downloadBytes = computed(() => allFlows.value.filter(f => f.direction === 'inbound').reduce((s, f) => s + (f.bytes_count || 0), 0))
const uploadRatio = computed(() => {
  const total = uploadBytes.value + downloadBytes.value
  return total > 0 ? Math.round(uploadBytes.value / total * 100) : 0
})
const p2pRatio = computed(() => {
  if (!allFlows.value.length) return 0
  const btFlows = allFlows.value.filter(f => {
    const p = ((f.master_proto || '') + ' ' + (f.app_proto || '')).toUpperCase()
    return [...BT_NAMES].some(n => p.includes(n.toUpperCase()))
  })
  return Math.round(btFlows.length / allFlows.value.length * 100)
})

// ── 流加载 ──
function isFileFlow(f: Flow): boolean {
  const proto = ((f.master_proto || '') + ' ' + (f.app_proto || '')).toUpperCase()
  for (const n of ALL_FILE_NAMES) if (proto.includes(n.toUpperCase())) return true
  return false
}
async function loadFlows() {
  try { const flows = await api.recentFlows(500); allFlows.value = flows.filter(isFileFlow) } catch { /* */ }
}

// ── 流表筛选 ──
const flowSearch = ref('')
const flowFilter = ref('')
const sizeFilter = ref('')

function matchesFilter(f: Flow, filter: string): boolean {
  const proto = ((f.master_proto || '') + ' ' + (f.app_proto || '')).toUpperCase()
  if (filter === 'FTP') return [...FTP_NAMES].some(n => proto.includes(n.toUpperCase()))
  if (filter === 'SMB') return [...SMB_NAMES].some(n => proto.includes(n.toUpperCase()))
  if (filter === 'NFS') return proto.includes('NFS')
  if (filter === 'BT') return [...BT_NAMES].some(n => proto.includes(n.toUpperCase()))
  if (filter === 'CLOUD') return [...CLOUD_NAMES].some(n => proto.includes(n.toUpperCase()))
  return true
}
function matchesSize(f: Flow, sz: string): boolean {
  const b = f.bytes_count || 0
  if (sz === 'huge') return b > 10 * 1024 * 1024
  if (sz === 'large') return b > 1024 * 1024
  if (sz === 'medium') return b > 100 * 1024
  if (sz === 'small') return b <= 100 * 1024
  return true
}

const filteredFlows = computed(() => {
  let list = allFlows.value
  if (flowFilter.value) list = list.filter(f => matchesFilter(f, flowFilter.value))
  if (sizeFilter.value) list = list.filter(f => matchesSize(f, sizeFilter.value))
  const q = flowSearch.value.toLowerCase().trim()
  if (q) list = list.filter(f => [f.five_tuple.src_ip, f.five_tuple.dst_ip, f.master_proto, f.app_proto, f.host].filter(Boolean).join(' ').toLowerCase().includes(q))
  return list
})

// ── 标签 helpers ──
function appLabel(row: Flow): string {
  const proto = ((row.master_proto || '') + ' ' + (row.app_proto || '')).toUpperCase()
  for (const n of FTP_NAMES) if (proto.includes(n.toUpperCase())) return 'FTP'
  for (const n of SMB_NAMES) if (proto.includes(n.toUpperCase())) return 'SMB'
  if (proto.includes('NFS')) return 'NFS'
  for (const n of BT_NAMES) if (proto.includes(n.toUpperCase())) return 'BitTorrent'
  for (const n of CLOUD_NAMES) if (proto.includes(n.toUpperCase())) return 'Cloud'
  return row.app_proto || '文件'
}
function appTagType(row: Flow): string {
  const l = appLabel(row)
  if (l === 'FTP') return 'primary'
  if (l === 'SMB') return 'warning'
  if (l === 'NFS') return 'success'
  if (l === 'BitTorrent') return 'danger'
  return 'info'
}
function sizeClass(bytes: number): string {
  if (bytes > 10 * 1024 * 1024) return 'size-huge'
  if (bytes > 1024 * 1024) return 'size-large'
  return 'size-normal'
}
function speedLabel(row: Flow): string {
  if (!row.duration_ms) return '—'
  return formatBytes(Math.round((row.bytes_count || 0) / (row.duration_ms / 1000))) + '/s'
}
function dirIcon(dir?: string): string {
  if (dir === 'inbound') return '↓'
  if (dir === 'outbound') return '↑'
  if (dir === 'internal') return '↔'
  return '·'
}

// ── 散点图：transfer size vs duration ──
const scatterEl = ref<HTMLElement>()
const barEl = ref<HTMLElement>()
let scatterChart: echarts.ECharts | null = null
let barChart: echarts.ECharts | null = null

const PROTO_COLORS: Record<string, string> = { FTP: '#3b82f6', SMB: '#f59e0b', NFS: '#22c55e', BitTorrent: '#ef4444', Cloud: '#8b5cf6' }

function scatterData() {
  const series: Record<string, [number, number, number][]> = {}
  for (const f of allFlows.value) {
    const label = appLabel(f)
    if (!series[label]) series[label] = []
    series[label].push([f.duration_ms || 1, f.bytes_count || 0, Math.min(f.packet_count || 1, 200)])
  }
  return Object.entries(series).map(([name, data]) => ({
    name, type: 'scatter' as const, data,
    symbolSize: (val: number[]) => Math.max(4, Math.sqrt(val[2]) * 2),
    itemStyle: { color: PROTO_COLORS[name] || '#64748b' },
  }))
}

function bytesBarData() {
  const totals = new Map<string, number>()
  for (const f of allFlows.value) {
    const label = appLabel(f)
    totals.set(label, (totals.get(label) ?? 0) + (f.bytes_count || 0))
  }
  return [...totals.entries()].sort((a, b) => a[1] - b[1])
}

function initScatter() {
  if (!scatterEl.value) return
  scatterChart = echarts.init(scatterEl.value)
  scatterChart.setOption({
    tooltip: { trigger: 'item', formatter: (p: any) => `${p.seriesName}<br/>时长: ${formatDurationMs(p.value[0])}<br/>体积: ${formatBytes(p.value[1])}<br/>包数: ${p.value[2]}` },
    legend: { bottom: 0, type: 'scroll' },
    grid: { left: 70, right: 20, top: 20, bottom: 40 },
    xAxis: { type: 'value', name: '时长(ms)', nameLocation: 'center', nameGap: 24, axisLabel: { fontSize: 10, formatter: (v: number) => v >= 1000 ? (v / 1000).toFixed(0) + 's' : v + 'ms' } },
    yAxis: { type: 'value', name: '字节', axisLabel: { fontSize: 10, formatter: (v: number) => formatBytes(v) } },
    series: [],
  })
}
function initBar() {
  if (!barEl.value) return
  barChart = echarts.init(barEl.value)
  barChart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: (p: any) => p[0] ? `${p[0].name}: ${formatBytes(p[0].value)}` : '' },
    grid: { left: 90, right: 20, top: 10, bottom: 10 },
    xAxis: { type: 'value', axisLabel: { fontSize: 10, formatter: (v: number) => formatBytes(v) } },
    yAxis: { type: 'category', data: [], axisLabel: { fontSize: 11 } },
    series: [{ type: 'bar', barMaxWidth: 28, itemStyle: { borderRadius: [0, 4, 4, 0] }, data: [] }],
  })
}
function rebuildScatter() { scatterChart?.setOption({ series: scatterData() }, true) }
function rebuildBar() {
  if (!barChart) return
  const d = bytesBarData()
  barChart.setOption({
    yAxis: { data: d.map(([n]) => n) },
    series: [{ data: d.map(([n, v]) => ({ value: v, itemStyle: { color: PROTO_COLORS[n] || '#64748b' } })) }],
  })
}

const onResize = () => { scatterChart?.resize(); barChart?.resize() }
let flowTimer: number | null = null

onMounted(() => {
  initScatter(); initBar()
  void loadFlows()
  flowTimer = window.setInterval(loadFlows, 5000)
  window.addEventListener('resize', onResize)
})
onBeforeUnmount(() => {
  scatterChart?.dispose(); barChart?.dispose(); scatterChart = null; barChart = null
  if (flowTimer != null) window.clearInterval(flowTimer)
  window.removeEventListener('resize', onResize)
})
watch(allFlows, () => { rebuildScatter(); rebuildBar() }, { deep: true })
</script>

<style scoped>
.kpi-row { margin-bottom: 14px; }
.body-row { margin-bottom: 14px; }
.section-header { display: flex; align-items: center; gap: 8px; font-weight: 600; flex-wrap: wrap; }
.count-tag { margin-left: auto; }
.chart-card :deep(.el-card__body) { padding: 12px; }
.chart-canvas { width: 100%; height: 280px; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.small { font-size: 12px; }
.xs { font-size: 11px; }
.muted { color: var(--el-text-color-secondary); }
.table-toolbar { display: flex; align-items: center; gap: 8px; margin-left: auto; }
.port { color: var(--el-text-color-secondary); }
.dir { font-size: 14px; font-weight: 700; }
.dir-inbound { color: #3b82f6; }
.dir-outbound { color: #22c55e; }
.dir-internal { color: #a855f7; }
.dir-unknown { color: var(--el-text-color-placeholder); }
.size-huge { color: #ef4444; font-weight: 700; font-size: 12px; }
.size-large { color: #f59e0b; font-weight: 600; font-size: 12px; }
.size-normal { font-size: 12px; }
</style>
