<template>
  <div class="page">
    <!-- ── L4 KPI 卡片 ──────────────────────────────────── -->
    <el-row :gutter="14" class="kpi-row">
      <el-col :xs="12" :sm="8" :md="4">
        <StatCard label="TCP 流" :value="formatNumber(tcpFlowCount)"
                  :sub="tcpPct + '% 占比'" :icon="Connection" tone="#3b82f6" />
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <StatCard label="UDP 流" :value="formatNumber(udpFlowCount)"
                  :sub="udpPct + '% 占比'" :icon="Position" tone="#22c55e" />
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <StatCard label="加密流" :value="formatNumber(encryptedCount)"
                  :sub="encRatio + '% 加密'" :icon="Lock" tone="#8b5cf6" />
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <StatCard label="唯一端口" :value="formatNumber(uniquePorts)"
                  sub="目的端口多样性" :icon="SetUp" tone="#f59e0b" />
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <StatCard label="短连接" :value="formatNumber(shortConnCount)"
                  sub="< 1s 时长" :icon="Promotion" tone="#06b6d4" />
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <StatCard label="总连接数" :value="formatNumber(allFlows.length)"
                  sub="L4 会话" :icon="DataLine" tone="#64748b" />
      </el-col>
    </el-row>

    <!-- ── 图表行：L4 协议分布 + 源端口 + 目的端口 ──────── -->
    <el-row :gutter="14" class="body-row">
      <el-col :xs="24" :md="8">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="section-header">
              <el-icon><PieChart /></el-icon>
              <span>传输协议占比</span>
            </div>
          </template>
          <div ref="pieEl" class="chart-canvas"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="8">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="section-header">
              <el-icon><Histogram /></el-icon>
              <span>Top 源端口</span>
              <span class="muted small">按流数</span>
            </div>
          </template>
          <div ref="srcBarEl" class="chart-canvas"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="8">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="section-header">
              <el-icon><Histogram /></el-icon>
              <span>Top 目的端口</span>
              <span class="muted small">按流数</span>
            </div>
          </template>
          <div ref="barEl" class="chart-canvas"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- ── 传输层流表 ────────────────────────────────────── -->
    <el-card shadow="never" class="body-row">
      <template #header>
        <div class="section-header">
          <el-icon><Grid /></el-icon>
          <span>传输层流量明细</span>
          <el-tag size="small" :type="mode === 'history' ? 'success' : 'info'" class="count-tag" disable-transitions>
            {{ mode === 'history' ? `历史 ${historyTotal} 条` : `${tableRows.length} / ${allFlows.length}` }}
          </el-tag>
          <div class="table-toolbar">
            <el-radio-group v-model="mode" size="small" @change="onModeChange">
              <el-radio-button value="live">实时</el-radio-button>
              <el-radio-button value="history" :disabled="chDisabled">历史</el-radio-button>
            </el-radio-group>
            <el-date-picker v-if="mode === 'history' && !chDisabled"
              v-model="range" type="datetimerange" size="small" range-separator="至"
              start-placeholder="开始" end-placeholder="结束" :shortcuts="rangeShortcuts"
              value-format="YYYY-MM-DDTHH:mm:ss.SSSZ" @change="onRangeChange" style="width: 360px" />
            <el-input v-model="flowSearch" placeholder="搜索 IP / 协议 / 主机名…" clearable
                      :prefix-icon="Search" size="small" style="width: 220px" />
            <el-select v-model="flowProtoFilter" placeholder="L4 协议" clearable size="small" style="width: 100px">
              <el-option label="TCP" value="TCP" />
              <el-option label="UDP" value="UDP" />
              <el-option label="SCTP" value="SCTP" />
              <el-option label="ICMP" value="ICMP" />
            </el-select>
            <el-select v-model="flowEncFilter" placeholder="加密" clearable size="small" style="width: 100px">
              <el-option label="加密" value="encrypted" />
              <el-option label="明文" value="plain" />
            </el-select>
            <el-button size="small" :icon="Refresh" @click="reload">刷新</el-button>
          </div>
        </div>
      </template>

      <el-table :data="tableRows" v-loading="detailLoading" size="small" stripe :max-height="520"
                :default-sort="{ prop: 'timestamp', order: 'descending' }"
                empty-text="暂无数据，等待 Capture 抓包…">
        <el-table-column prop="timestamp" label="时间" width="170" sortable>
          <template #default="{ row }"><span class="mono xs">{{ formatTime(row.timestamp) }}</span></template>
        </el-table-column>
        <el-table-column label="类型" width="62" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="l4TagType(row.five_tuple.protocol)" disable-transitions>
              {{ row.five_tuple.protocol }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="源地址" min-width="130" align="center">
          <template #default="{ row }">
            <span class="mono xs">{{ prettyIP(row.five_tuple.src_ip) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="源端口" width="70" align="center">
          <template #default="{ row }">
            <span class="mono xs port">{{ row.five_tuple.src_port }}</span>
          </template>
        </el-table-column>
        <el-table-column label="目的地址" min-width="130" align="center">
          <template #default="{ row }">
            <span class="mono xs">{{ prettyIP(row.five_tuple.dst_ip) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="目的端口" width="70" align="center">
          <template #default="{ row }">
            <span class="mono xs port">{{ row.five_tuple.dst_port }}</span>
          </template>
        </el-table-column>
        <el-table-column label="加密" width="60" align="center">
          <template #default="{ row }">
            <el-icon v-if="isEncrypted(row)" class="enc-yes" :title="encLabel(row)"><Lock /></el-icon>
            <span v-else class="enc-no">—</span>
          </template>
        </el-table-column>
        <el-table-column label="应用协议" width="120" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.app_proto || row.master_proto" size="small" type="success" disable-transitions>
              {{ row.app_proto || row.master_proto }}
            </el-tag>
            <span v-else class="muted xs">—</span>
          </template>
        </el-table-column>
        <el-table-column label="方向" width="70" align="center">
          <template #default="{ row }">
            <span :class="'dir dir-' + (row.direction || 'unknown')">{{ dirLabel(row.direction) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="packet_count" label="包数" width="72" align="right" sortable>
          <template #default="{ row }">{{ formatNumber(row.packet_count) }}</template>
        </el-table-column>
        <el-table-column prop="bytes_count" label="字节" width="90" align="right" sortable>
          <template #default="{ row }">{{ formatBytes(row.bytes_count) }}</template>
        </el-table-column>
        <el-table-column prop="duration_ms" label="时长" width="82" align="right" sortable>
          <template #default="{ row }">{{ formatDurationMs(row.duration_ms) }}</template>
        </el-table-column>
      </el-table>

      <div v-if="mode === 'history'" class="pager">
        <el-pagination size="small" layout="total, sizes, prev, pager, next, jumper"
          :total="historyTotal" :page-sizes="[50, 100, 200, 500]" :page-size="pageSize" :current-page="page"
          @size-change="onPageSizeChange" @current-change="onPageChange" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts/core'
import { PieChart as PieChartComponent, BarChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { Connection, DataLine, Grid, Histogram, Lock, PieChart, Position, Promotion, Refresh, Search, SetUp } from '@element-plus/icons-vue'

import StatCard from '@/components/StatCard.vue'
import { api } from '@/api/client'
import type { Flow, HistoryQuery } from '@/api/types'
import { ellipsis, formatBytes, formatDurationMs, formatNumber, formatTime, prettyIP } from '@/utils/format'

echarts.use([PieChartComponent, BarChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer])

const ENCRYPTED_NAMES = new Set(['TLS', 'DTLS', 'QUIC'])

// ── 流加载 ──
const allFlows = ref<Flow[]>([])

async function loadFlows() {
  try { allFlows.value = await api.recentFlows(500) } catch { /* ignore */ }
}

// ── L4 计数 from flows ──
const tcpFlowCount = computed(() => allFlows.value.filter(f => f.five_tuple.protocol === 'TCP').length)
const udpFlowCount = computed(() => allFlows.value.filter(f => f.five_tuple.protocol === 'UDP').length)
const tcpPct = computed(() => {
  const t = allFlows.value.length
  return t > 0 ? ((tcpFlowCount.value / t) * 100).toFixed(1) : '0'
})
const udpPct = computed(() => {
  const t = allFlows.value.length
  return t > 0 ? ((udpFlowCount.value / t) * 100).toFixed(1) : '0'
})
const encryptedCount = computed(() => allFlows.value.filter(isEncrypted).length)
const encRatio = computed(() => {
  const t = allFlows.value.length
  return t > 0 ? Math.round(encryptedCount.value / t * 100) : 0
})
const uniquePorts = computed(() => new Set(allFlows.value.map(f => f.five_tuple.dst_port)).size)
const shortConnCount = computed(() => allFlows.value.filter(f => (f.duration_ms || 0) < 1000).length)

// ── 饼图：TCP/UDP/SCTP/其他 占比 ──
const pieCounts = computed(() => {
  const m = new Map<string, number>()
  for (const f of allFlows.value) {
    const p = f.five_tuple.protocol || 'Other'
    m.set(p, (m.get(p) ?? 0) + 1)
  }
  return [...m.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }))
})

// ── 柱图：Top 目的端口 ──
const portBarData = computed(() => {
  const totals = new Map<number, number>()
  for (const f of allFlows.value) {
    const port = f.five_tuple.dst_port
    if (port > 0) totals.set(port, (totals.get(port) ?? 0) + 1)
  }
  return [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)
})

// ── 柱图：Top 源端口 ──
const srcPortBarData = computed(() => {
  const totals = new Map<number, number>()
  for (const f of allFlows.value) {
    const port = f.five_tuple.src_port
    if (port > 0) totals.set(port, (totals.get(port) ?? 0) + 1)
  }
  return [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)
})

// ── 加密判断 ──
function isEncrypted(f: Flow): boolean {
  const proto = (f.master_proto || '') + ' ' + (f.app_proto || '')
  return ENCRYPTED_NAMES.has(f.master_proto || '') || ENCRYPTED_NAMES.has(f.app_proto || '') || proto.includes('TLS') || proto.includes('QUIC')
}
function encLabel(f: Flow): string {
  if ((f.master_proto || '').includes('QUIC') || (f.app_proto || '').includes('QUIC')) return 'QUIC'
  if ((f.master_proto || '').includes('DTLS') || (f.app_proto || '').includes('DTLS')) return 'DTLS'
  return 'TLS'
}

// ── 流表筛选 ──
const flowSearch = ref('')
const flowProtoFilter = ref('')
const flowEncFilter = ref('')

function applyClientFilters(src: Flow[]): Flow[] {
  let list = src
  const proto = flowProtoFilter.value
  const enc = flowEncFilter.value
  const q = flowSearch.value.toLowerCase().trim()

  if (proto) list = list.filter(f => f.five_tuple.protocol === proto)
  if (enc === 'encrypted') list = list.filter(isEncrypted)
  else if (enc === 'plain') list = list.filter(f => !isEncrypted(f))

  if (q) {
    list = list.filter(f => {
      const haystack = [
        f.five_tuple.src_ip, f.five_tuple.dst_ip,
        f.master_proto, f.app_proto, f.host,
        f.five_tuple.protocol,
      ].filter(Boolean).join(' ').toLowerCase()
      return haystack.includes(q)
    })
  }
  return list
}
const filteredFlows = computed(() => applyClientFilters(allFlows.value))

// ── 实时/历史 数据源（仅作用于明细表；图表/KPI 始终用实时样本）──
type Mode = 'live' | 'history'
const mode = ref<Mode>('live')
const chDisabled = ref(false)
const range = ref<[string, string] | null>(null)
const page = ref(1)
const pageSize = ref(100)
const historyTotal = ref(0)
const detailRows = ref<Flow[]>([])
const detailLoading = ref(false)
const rangeShortcuts = [
  { text: '最近 1 小时', value: () => rangeFromMin(60) },
  { text: '最近 24 小时', value: () => rangeFromMin(60 * 24) },
  { text: '最近 7 天', value: () => rangeFromMin(60 * 24 * 7) },
]
function rangeFromMin(min: number): [Date, Date] {
  const end = new Date()
  return [new Date(end.getTime() - min * 60 * 1000), end]
}
const tableRows = computed(() =>
  mode.value === 'history' ? applyClientFilters(detailRows.value) : filteredFlows.value,
)
async function fetchHistory() {
  detailLoading.value = true
  try {
    const params: HistoryQuery = {
      since: range.value?.[0],
      until: range.value?.[1],
      q: flowSearch.value.trim() || undefined,
      limit: pageSize.value,
      offset: (page.value - 1) * pageSize.value,
    }
    const env = await api.historyFlows(params)
    if (env.disabled) { chDisabled.value = true; mode.value = 'live'; return }
    detailRows.value = env.items
    historyTotal.value = env.total
  } catch { detailRows.value = []; historyTotal.value = 0 } finally { detailLoading.value = false }
}
function reload() {
  if (mode.value === 'history') void fetchHistory()
  else void loadFlows()
}
function onModeChange() {
  page.value = 1
  if (mode.value === 'history' && !range.value) {
    const [s, e] = rangeFromMin(60 * 24)
    range.value = [s.toISOString(), e.toISOString()]
  }
  reload()
}
function onRangeChange() { page.value = 1; void fetchHistory() }
function onPageChange(p: number) { page.value = p; void fetchHistory() }
function onPageSizeChange(s: number) { pageSize.value = s; page.value = 1; void fetchHistory() }
let searchTimer: number | null = null
watch(flowSearch, () => {
  if (mode.value !== 'history') return
  if (searchTimer != null) window.clearTimeout(searchTimer)
  searchTimer = window.setTimeout(() => { page.value = 1; void fetchHistory() }, 300)
})

// ── 标签 helpers ──
function l4TagType(proto: string): string {
  if (proto === 'TCP') return 'primary'
  if (proto === 'UDP') return 'success'
  if (proto === 'ICMP') return 'warning'
  return 'info'
}
function dirLabel(dir?: string): string {
  if (dir === 'inbound') return '↓ 入'
  if (dir === 'outbound') return '↑ 出'
  if (dir === 'internal') return '↔ 内'
  return '?'
}

// ── ECharts ──
const pieEl = ref<HTMLElement>()
const barEl = ref<HTMLElement>()
const srcBarEl = ref<HTMLElement>()
let pieChart: echarts.ECharts | null = null
let barChart: echarts.ECharts | null = null
let srcBarChart: echarts.ECharts | null = null

function initPie() {
  if (!pieEl.value) return
  pieChart = echarts.init(pieEl.value)
  pieChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} 流 ({d}%)' },
    legend: { bottom: 0, type: 'scroll' },
    color: ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#64748b'],
    series: [{
      type: 'pie', radius: ['40%', '70%'], center: ['50%', '45%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 1 },
      label: { show: false }, data: [],
    }],
  })
}

function initPortBar(el: HTMLElement | undefined, color: string): echarts.ECharts | null {
  if (!el) return null
  const chart = echarts.init(el)
  chart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 90, right: 50, top: 10, bottom: 10 },
    xAxis: { type: 'value', axisLabel: { fontSize: 10 } },
    yAxis: { type: 'category', data: [], axisLabel: { fontSize: 10 }, inverse: true },
    series: [{
      type: 'bar', barMaxWidth: 20,
      itemStyle: { borderRadius: [0, 3, 3, 0], color },
      label: { show: true, position: 'right', fontSize: 10, formatter: (p: any) => String(p.value) },
      data: [],
    }],
  })
  return chart
}

function rebuildPie() {
  pieChart?.setOption({ series: [{ data: pieCounts.value }] })
}
function rebuildBar() {
  if (!barChart) return
  const d = portBarData.value
  barChart.setOption({
    yAxis: { data: d.map(([p]) => portLabel(p)) },
    series: [{ data: d.map(([, v]) => v) }],
  })
}
function rebuildSrcBar() {
  if (!srcBarChart) return
  const d = srcPortBarData.value
  srcBarChart.setOption({
    yAxis: { data: d.map(([p]) => portLabel(p)) },
    series: [{ data: d.map(([, v]) => v) }],
  })
}

const WELL_KNOWN_PORTS: Record<number, string> = {
  22: 'SSH', 53: 'DNS', 80: 'HTTP', 443: 'HTTPS', 993: 'IMAPS',
  3306: 'MySQL', 5432: 'PG', 6379: 'Redis', 8080: 'HTTP-Alt', 8443: 'HTTPS-Alt',
}
function portLabel(port: number): string {
  const name = WELL_KNOWN_PORTS[port]
  return name ? `${port} (${name})` : String(port)
}

const onResize = () => { pieChart?.resize(); barChart?.resize(); srcBarChart?.resize() }
let flowTimer: number | null = null

onMounted(() => {
  initPie()
  barChart = initPortBar(barEl.value, '#8b5cf6')
  srcBarChart = initPortBar(srcBarEl.value, '#3b82f6')
  rebuildPie(); rebuildBar(); rebuildSrcBar()
  void loadFlows()
  flowTimer = window.setInterval(loadFlows, 5000)
  window.addEventListener('resize', onResize)
})
onBeforeUnmount(() => {
  pieChart?.dispose(); barChart?.dispose(); srcBarChart?.dispose()
  pieChart = null; barChart = null; srcBarChart = null
  if (flowTimer != null) window.clearInterval(flowTimer)
  if (searchTimer != null) window.clearTimeout(searchTimer)
  window.removeEventListener('resize', onResize)
})

watch(pieCounts, rebuildPie, { deep: true })
watch(portBarData, rebuildBar, { deep: true })
watch(srcPortBarData, rebuildSrcBar, { deep: true })
</script>

<style scoped>
.kpi-row { margin-bottom: 14px; }
.body-row { margin-bottom: 14px; }
.section-header { display: flex; align-items: center; gap: 8px; font-weight: 600; flex-wrap: wrap; }
.count-tag { margin-left: auto; }
.chart-card :deep(.el-card__body) { padding: 12px; }
.chart-canvas { width: 100%; height: 260px; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.small { font-size: 12px; }
.xs { font-size: 11px; }
.muted { color: var(--el-text-color-secondary); }
.table-toolbar { display: flex; align-items: center; gap: 8px; margin-left: auto; flex-wrap: wrap; }
.pager { margin-top: 12px; display: flex; justify-content: flex-end; }
.proto-stack { display: inline-flex; align-items: center; gap: 2px; flex-wrap: wrap; }
.proto-sep { color: var(--el-text-color-placeholder); font-size: 11px; }
.port { color: var(--el-text-color-secondary); }
.enc-yes { color: var(--el-color-success); font-size: 16px; }
.enc-no { color: var(--el-text-color-placeholder); }
.dir { font-size: 12px; font-weight: 600; }
.dir-inbound { color: #3b82f6; }
.dir-outbound { color: #22c55e; }
.dir-internal { color: #a855f7; }
.dir-unknown { color: var(--el-text-color-placeholder); }
</style>
