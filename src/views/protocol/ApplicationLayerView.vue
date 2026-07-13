<template>
  <div class="page">
    <!-- ── L7 KPI 卡片 ──────────────────────────────────── -->
    <el-row :gutter="14" class="kpi-row">
      <el-col :xs="12" :sm="8" :md="3">
        <StatCard label="HTTP 请求" :value="formatNumber(stats?.http_parsed ?? 0)"
                  sub="深度解析" :icon="ChromeFilled" tone="#3b82f6" />
      </el-col>
      <el-col :xs="12" :sm="8" :md="3">
        <StatCard label="DNS 查询" :value="formatNumber(stats?.dns_parsed ?? 0)"
                  sub="深度解析" :icon="Search" tone="#22c55e" />
      </el-col>
      <el-col :xs="12" :sm="8" :md="3">
        <StatCard label="TLS 握手" :value="formatNumber(stats?.tls_parsed ?? 0)"
                  sub="JA3 / SNI" :icon="Lock" tone="#f59e0b" />
      </el-col>
      <el-col :xs="12" :sm="8" :md="3">
        <StatCard label="nDPI 已识别" :value="formatNumber(stats?.ndpi_classified ?? 0)"
                  sub="应用协议分类" :icon="Promotion" tone="#ec4899" />
      </el-col>
      <el-col :xs="12" :sm="8" :md="3">
        <StatCard label="活跃协议" :value="formatNumber(activeAppCount)"
                  :sub="'Top: ' + topAppName" :icon="DataLine" tone="#64748b" />
      </el-col>
      <el-col :xs="12" :sm="8" :md="3">
        <StatCard label="总流数" :value="formatNumber(allFlows.length)"
                  sub="最近采集" :icon="Connection" tone="#06b6d4" />
      </el-col>
      <el-col :xs="12" :sm="8" :md="3">
        <StatCard label="独立源 IP" :value="formatNumber(uniqueSrcIps)"
                  sub="应用层去重" :icon="Connection" tone="#10b981" />
      </el-col>
    </el-row>

    <!-- ── 应用协议 Tabs ──────────────────────────────────── -->
    <el-tabs v-model="activeTab" class="app-tabs" @tab-change="onTabChange">
      <!-- ═══════ 总览 ═══════ -->
      <el-tab-pane name="overview">
        <el-row :gutter="14" class="body-row">
          <el-col :xs="24" :md="12">
            <el-card shadow="never" class="chart-card">
              <template #header>
                <div class="section-header">
                  <el-icon><PieChart /></el-icon>
                  <span>应用协议分布</span>
                  <span class="muted small">Top {{ appPieData.length }}</span>
                </div>
              </template>
              <div ref="pieEl" class="chart-canvas"></div>
            </el-card>
          </el-col>
          <el-col :xs="24" :md="12">
            <el-card shadow="never" class="chart-card">
              <template #header>
                <div class="section-header">
                  <el-icon><Histogram /></el-icon>
                  <span>Top 应用协议流量排行</span>
                </div>
              </template>
              <div ref="barEl" class="chart-canvas"></div>
            </el-card>
          </el-col>
        </el-row>
        <!-- 总览：应用协议汇总卡片 -->
        <el-card shadow="never" style="margin-top: 14px;">
          <template #header>
            <div class="section-header">
              <el-button size="small" :icon="Refresh" style="margin-left: auto" @click="preloadOverview">刷新</el-button>
            </div>
          </template>
          <el-row :gutter="14">
            <!-- 协议卡片（基于 PROTO_TABS 定义） -->
            <el-col v-for="p in protoOverviewCards" :key="p.key" :xs="24" :sm="12" :md="6" class="proto-col">
              <div class="proto-card proto-card-other" :class="{ 'proto-card-empty': p.flows === 0 }" @click="goTab(p.key)">
                <div class="proto-card-head">
                  <el-icon class="proto-ico"><component :is="p.icon" /></el-icon>
                  <span class="proto-card-title">{{ p.name }}</span>
                  <el-tag size="small" :type="p.flows > 0 ? 'info' : 'info'" disable-transitions>{{ formatNumber(p.flows) }} 流</el-tag>
                </div>
                <div class="proto-card-body">
                  <div class="proto-metric"><span class="pm-label">源 IP 数</span><span class="pm-value">{{ formatNumber(p.srcIps) }}</span></div>
                  <div class="proto-metric"><span class="pm-label">目的 IP 数</span><span class="pm-value">{{ formatNumber(p.dstIps) }}</span></div>
                  <div class="proto-metric"><span class="pm-label">总字节</span><span class="pm-value">{{ formatBytes(p.bytes) }}</span></div>
                  <div class="proto-metric"><span class="pm-label">总包数</span><span class="pm-value">{{ formatNumber(p.packets) }}</span></div>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-tab-pane>



      <!-- ═══════ 端口级协议 Tab（通用模板）═══════ -->
      <el-tab-pane v-for="p in PROTO_TABS" :key="p.key" :name="p.key">
        <template #label><span></span></template>
        <!-- 统计 -->
        <el-row :gutter="12" class="cat-stats-row">
          <el-col :xs="12" :sm="6" :md="4"><div class="cat-stat-card"><div class="cat-stat-value">{{ formatNumber(protoStat(p).flows) }}</div><div class="cat-stat-label">流数量</div></div></el-col>
          <el-col :xs="12" :sm="6" :md="4"><div class="cat-stat-card"><div class="cat-stat-value">{{ formatBytes(protoStat(p).bytes) }}</div><div class="cat-stat-label">总字节</div></div></el-col>
          <el-col :xs="12" :sm="6" :md="4"><div class="cat-stat-card"><div class="cat-stat-value">{{ formatNumber(protoStat(p).packets) }}</div><div class="cat-stat-label">总包数</div></div></el-col>
          <el-col :xs="12" :sm="6" :md="4"><div class="cat-stat-card"><div class="cat-stat-value">{{ protoStat(p).srcIps }}</div><div class="cat-stat-label">源 IP 数</div></div></el-col>
          <el-col :xs="12" :sm="6" :md="4"><div class="cat-stat-card"><div class="cat-stat-value">{{ protoStat(p).dstIps }}</div><div class="cat-stat-label">目的 IP 数</div></div></el-col>
          <el-col :xs="12" :sm="6" :md="4"><div class="cat-stat-card"><div class="cat-stat-value mono xs">{{ p.ports.join(', ') }}</div><div class="cat-stat-label">端口</div></div></el-col>
        </el-row>
        <div class="tab-toolbar">
          <el-input v-model="protoSearch" placeholder="搜索 IP / 主机名…" clearable :prefix-icon="Search" size="small" style="width: 220px" />
          <el-button size="small" :icon="Refresh" @click="loadAllFlows">刷新</el-button>
        </div>
        <el-table :data="protoTableRows(p)" v-loading="allFlowsLoading" size="small" stripe :max-height="480"
                  @row-click="openProtoDetail"
                  :default-sort="{ prop: 'timestamp', order: 'descending' }" :empty-text="'暂无 ' + p.label + ' 流量'">
          <el-table-column prop="timestamp" label="时间" width="170" sortable>
            <template #default="{ row }"><span class="mono xs">{{ formatTime(row.timestamp) }}</span></template>
          </el-table-column>
          <el-table-column label="协议" width="90" align="center">
            <template #default="{ row }"><el-tag size="small" type="success" disable-transitions>{{ row.app_proto || row.master_proto || '—' }}</el-tag></template>
          </el-table-column>
          <el-table-column label="客户端 IP" min-width="130">
            <template #default="{ row }"><span class="mono xs">{{ prettyIP(row.five_tuple.src_ip) }}</span></template>
          </el-table-column>
          <el-table-column label="客户端端口" width="90" align="center">
            <template #default="{ row }"><span class="mono xs">{{ row.five_tuple.src_port }}</span></template>
          </el-table-column>
          <el-table-column label="服务端 IP" min-width="130">
            <template #default="{ row }"><span class="mono xs">{{ prettyIP(row.five_tuple.dst_ip) }}</span></template>
          </el-table-column>
          <el-table-column label="服务端端口" width="90" align="center">
            <template #default="{ row }"><span class="mono xs">{{ row.five_tuple.dst_port }}</span></template>
          </el-table-column>
          <el-table-column label="主机名" min-width="160">
            <template #default="{ row }"><span class="mono xs host-cell">{{ ellipsis(row.host, 36) || '—' }}</span></template>
          </el-table-column>
          <el-table-column prop="bytes_count" label="字节" width="85" align="right" sortable>
            <template #default="{ row }">{{ formatBytes(row.bytes_count) }}</template>
          </el-table-column>
          <el-table-column prop="duration_ms" label="时长" width="80" align="right" sortable>
            <template #default="{ row }">{{ formatDurationMs(row.duration_ms) }}</template>
          </el-table-column>
          <el-table-column label="方向" width="60" align="center">
            <template #default="{ row }"><span :class="'dir dir-' + (row.direction || 'unknown')">{{ dirLabel(row.direction) }}</span></template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- ── 事务详情对话框 ── -->
    <el-dialog v-model="detailVisible" :title="detailTitle" width="640px" destroy-on-close>
      <el-descriptions :column="2" border size="small">
        <template v-for="item in detailItems" :key="item.label">
          <el-descriptions-item :label="item.label" :span="item.span || 1">
            <span v-if="item.mono" class="mono xs">{{ item.value }}</span>
            <el-tag v-else-if="item.tag" size="small" :type="item.tagType || ''" disable-transitions>{{ item.value }}</el-tag>
            <span v-else :class="item.class || ''">{{ item.value }}</span>
          </el-descriptions-item>
        </template>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import * as echarts from 'echarts/core'
import { PieChart as PieChartComponent, BarChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import {
  ChromeFilled, Connection, DataLine, Headset, Histogram,
  Lock, Monitor, PieChart, Promotion, Refresh, Search, VideoCamera,
} from '@element-plus/icons-vue'

import StatCard from '@/components/StatCard.vue'
import { useProbeStore } from '@/stores/probe'
import { api } from '@/api/client'
import type { Flow } from '@/api/types'
import { ellipsis, formatBytes, formatDurationMs, formatNumber, formatTime, prettyIP } from '@/utils/format'

echarts.use([PieChartComponent, BarChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer])

const route = useRoute()
const store = useProbeStore()
const stats = computed(() => store.stats)
function dirLabel(dir?: string): string {
  if (dir === 'inbound') return '↓ 入'
  if (dir === 'outbound') return '↑ 出'
  if (dir === 'internal') return '↔ 内'
  return '?'
}

// ── Tab 管理 ──
const resolveTab = () => (route.meta.tab as string) || (route.query.tab as string) || 'overview'
const activeTab = ref(resolveTab())

// Watch for route changes (same component, different route via sidebar navigation)
watch(() => [route.meta.tab, route.query.tab, route.path], () => {
  const t = resolveTab()
  if (t !== activeTab.value) {
    activeTab.value = t
    nextTick(() => onTabChange())
  }
})

function onTabChange() {
  if (activeTab.value === 'overview') { nextTick(() => { rebuildPie(); rebuildBar() }) }
  // 端口级协议 Tab
  const protoKeys = PROTO_TABS.map(p => p.key)
  if (protoKeys.includes(activeTab.value)) {
    protoSearch.value = ''
    if (allFlows.value.length === 0) void loadAllFlows()
  }
}

function goTab(tab: string) {
  activeTab.value = tab
  onTabChange()
}

async function preloadOverview() {
  void loadAllFlows()
}

// ── 总览：nDPI 统计 ──
const appPieData = computed(() => {
  const rows = store.ndpi?.protocols ?? []
  const totals = new Map<string, number>()
  for (const r of rows) {
    const name = r.app_name || r.master_name
    if (name) totals.set(name, (totals.get(name) ?? 0) + r.count)
  }
  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([name, value]) => ({ name, value }))
})

// ── 总览：其他协议卡片（基于 PROTO_TABS 定义，始终展示）──
const protoOverviewCards = computed(() => {
  return PROTO_TABS.map(p => {
    const flows = protoFlows(p)
    let bytes = 0, packets = 0, inbound = 0
    const srcIps = new Set<string>(), dstIps = new Set<string>()
    for (const f of flows) {
      bytes += f.bytes_count ?? 0
      packets += f.packet_count ?? 0
      srcIps.add(f.five_tuple.src_ip)
      dstIps.add(f.five_tuple.dst_ip)
      if (f.direction === 'inbound') inbound++
    }
    return {
      key: p.key,
      name: p.label,
      icon: p.icon,
      flows: flows.length,
      bytes,
      packets,
      srcIps: srcIps.size,
      dstIps: dstIps.size,
      inbound,
    }
  })
})
const appBarData = computed(() => {
  const rows = store.ndpi?.protocols ?? []
  const totals = new Map<string, number>()
  for (const r of rows) {
    const name = r.app_name || r.master_name
    if (name && r.count > 0) totals.set(name, (totals.get(name) ?? 0) + r.count)
  }
  return [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15).reverse()
})
const activeAppCount = computed(() => {
  const rows = store.ndpi?.protocols ?? []
  const seen = new Set<string>()
  for (const r of rows) {
    const name = r.app_name || r.master_name
    if (name && r.count > 0) seen.add(name)
  }
  return seen.size
})
const topAppName = computed(() => appPieData.value[0]?.name ?? '—')
const uniqueSrcIps = computed(() => {
  const ips = new Set<string>()
  for (const f of allFlows.value) {
    ips.add(f.five_tuple.src_ip)
  }
  return ips.size
})



// ── 端口级协议 Tab 定义 ──
interface ProtoTabDef { key: string; label: string; ports: number[]; protos: string[]; icon: any }
const PROTO_TABS: ProtoTabDef[] = [
  { key: 'ftp',        label: 'FTP',        ports: [20, 21],         protos: ['FTP', 'FTP_DATA', 'FTP_CONTROL'], icon: DataLine },
  { key: 'sftp',       label: 'SFTP',       ports: [],               protos: ['SFTP'],            icon: Lock },
  { key: 'tftp',       label: 'TFTP',       ports: [69],             protos: ['TFTP'],            icon: DataLine },
  { key: 'telnet',     label: 'Telnet',     ports: [23],             protos: ['TELNET'],          icon: Monitor },
  { key: 'rdp',        label: 'RDP',        ports: [3389],           protos: ['RDP'],             icon: Monitor },
  { key: 'vnc',        label: 'VNC',        ports: [5900],           protos: ['VNC'],             icon: Monitor },
  { key: 'ldap',       label: 'LDAP',       ports: [389, 636],       protos: ['LDAP', 'LDAPS'],   icon: Connection },
  { key: 'radius',     label: 'RADIUS',     ports: [1812, 1813],     protos: ['RADIUS'],          icon: Connection },
  { key: 'kerberos',   label: 'Kerberos',   ports: [88],             protos: ['KERBEROS'],        icon: Lock },
  { key: 'mqtt',       label: 'MQTT',       ports: [1883, 8883],     protos: ['MQTT'],            icon: Connection },
  { key: 'amqp',       label: 'AMQP',       ports: [5672],           protos: ['AMQP'],            icon: Connection },
  { key: 'rtsp',       label: 'RTSP/RTP',   ports: [554],            protos: ['RTSP', 'RTP'],     icon: VideoCamera },
  { key: 'sip',        label: 'SIP',        ports: [5060, 5061],     protos: ['SIP'],             icon: Headset },
]

const allFlows = ref<Flow[]>([])
const allFlowsLoading = ref(false)
const protoSearch = ref('')

// 按端口或协议名匹配流
function protoFlows(p: ProtoTabDef): Flow[] {
  const portSet = new Set(p.ports)
  const protoSet = new Set(p.protos.map(s => s.toUpperCase()))
  return allFlows.value.filter(f => {
    const ap = (f.app_proto || '').toUpperCase()
    const mp = (f.master_proto || '').toUpperCase()
    if (protoSet.has(ap) || protoSet.has(mp)) return true
    if (portSet.has(f.five_tuple.dst_port) || portSet.has(f.five_tuple.src_port)) return true
    return false
  })
}

function protoTableRows(p: ProtoTabDef): Flow[] {
  let list = protoFlows(p)
  const q = protoSearch.value.toLowerCase().trim()
  if (q) list = list.filter(f =>
    [f.five_tuple.src_ip, f.five_tuple.dst_ip, f.host, f.app_proto, f.master_proto]
      .filter(Boolean).join(' ').toLowerCase().includes(q)
  )
  return list
}

interface ProtoStatResult { flows: number; bytes: number; packets: number; srcIps: number; dstIps: number }
function protoStat(p: ProtoTabDef): ProtoStatResult {
  const flows = protoFlows(p)
  let bytes = 0, packets = 0
  const srcIps = new Set<string>(), dstIps = new Set<string>()
  for (const f of flows) {
    bytes += f.bytes_count ?? 0
    packets += f.packet_count ?? 0
    srcIps.add(f.five_tuple.src_ip)
    dstIps.add(f.five_tuple.dst_ip)
  }
  return { flows: flows.length, bytes, packets, srcIps: srcIps.size, dstIps: dstIps.size }
}

async function loadAllFlows() {
  allFlowsLoading.value = true
  try { allFlows.value = await api.recentFlows(500) } catch { /* ignore */ } finally { allFlowsLoading.value = false }
}

// ── ECharts ──
const pieEl = ref<HTMLElement>()
const barEl = ref<HTMLElement>()
let pieChart: echarts.ECharts | null = null
let barChart: echarts.ECharts | null = null

function initPie() {
  if (!pieEl.value) return
  pieChart = echarts.init(pieEl.value)
  pieChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} 流 ({d}%)' },
    legend: { bottom: 0, type: 'scroll' },
    series: [{ type: 'pie', radius: ['40%', '70%'], center: ['50%', '45%'], avoidLabelOverlap: true, itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 1 }, label: { show: false }, data: [] }],
  })
}
function initBar() {
  if (!barEl.value) return
  barChart = echarts.init(barEl.value)
  barChart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 100, right: 20, top: 10, bottom: 10 },
    xAxis: { type: 'value', axisLabel: { fontSize: 11 } },
    yAxis: { type: 'category', data: [], axisLabel: { fontSize: 11 }, inverse: true },
    series: [{ type: 'bar', barMaxWidth: 24, itemStyle: { borderRadius: [0, 3, 3, 0], color: '#3b82f6' }, data: [] }],
  })
}
function rebuildPie() { pieChart?.setOption({ series: [{ data: appPieData.value }] }); pieChart?.resize() }
function rebuildBar() {
  if (!barChart) return
  const d = appBarData.value
  barChart.setOption({ yAxis: { data: d.map(([n]) => n) }, series: [{ data: d.map(([, v]) => v) }] })
  barChart.resize()
}

const onResize = () => { pieChart?.resize(); barChart?.resize() }

onMounted(() => {
  initPie(); initBar(); rebuildPie(); rebuildBar()
  void preloadOverview()
  window.addEventListener('resize', onResize)
  // Auto-load data for tab specified via route meta or query param
  if (resolveTab() !== 'overview') onTabChange()
})
onBeforeUnmount(() => {
  pieChart?.dispose(); barChart?.dispose()
  pieChart = null; barChart = null
  window.removeEventListener('resize', onResize)
})

watch(appPieData, rebuildPie, { deep: true })
watch(appBarData, rebuildBar, { deep: true })

// ── 事务详情对话框 ──
interface DetailItem { label: string; value: string; span?: number; mono?: boolean; tag?: boolean; tagType?: string; class?: string }
const detailVisible = ref(false)
const detailTitle = ref('')
const detailItems = ref<DetailItem[]>([])



function openProtoDetail(row: Flow) {
  detailTitle.value = (row.app_proto || row.master_proto || '协议') + ' 流详情'
  detailItems.value = [
    { label: '时间', value: formatTime(row.timestamp), mono: true },
    { label: '时长', value: formatDurationMs(row.duration_ms), mono: true },
    { label: '客户端 IP', value: prettyIP(row.five_tuple.src_ip), mono: true },
    { label: '客户端端口', value: String(row.five_tuple.src_port), mono: true },
    { label: '服务端 IP', value: prettyIP(row.five_tuple.dst_ip), mono: true },
    { label: '服务端端口', value: String(row.five_tuple.dst_port), mono: true },
    { label: '主机名', value: row.host || '—', span: 2, mono: true },
    { label: '包数', value: formatNumber(row.packet_count), mono: true },
    { label: '字节数', value: formatBytes(row.bytes_count), mono: true },
    { label: 'nDPI 主协议', value: row.master_proto || '—', tag: true },
    { label: 'nDPI 应用协议', value: row.app_proto || '—', tag: true },
    { label: '分类', value: row.category || '—' },
    { label: '方向', value: dirLabel(row.direction), class: 'dir dir-' + (row.direction || 'unknown') },
    { label: '进程', value: row.process_name || '—' },
    { label: '源 MAC', value: row.src_mac || '—', mono: true },
    { label: '目的 MAC', value: row.dst_mac || '—', mono: true },
  ]
  detailVisible.value = true
}
</script>

<style scoped>
.kpi-row { margin-bottom: 14px; }
.body-row { margin-bottom: 14px; }
.section-header { display: flex; align-items: center; gap: 8px; font-weight: 600; flex-wrap: wrap; }
.chart-card :deep(.el-card__body) { padding: 12px; }
.chart-canvas { width: 100%; height: 260px; }
.app-tabs :deep(.el-tabs__header) { margin-bottom: 12px; }
.app-tabs :deep(.el-tabs__nav-wrap)::after { display: none; }
.app-tabs :deep(.el-tabs__nav-wrap) { overflow: visible !important; }
.app-tabs :deep(.el-tabs__header) { display: none !important; }
.app-tabs :deep(.el-table__row) { cursor: pointer; }
.tab-toolbar { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
.pager { margin-top: 12px; display: flex; justify-content: flex-end; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.small { font-size: 12px; }
.xs { font-size: 11px; }
.muted { color: var(--el-text-color-secondary); }
.port { color: var(--el-text-color-secondary); }
.host-cell { word-break: break-all; }
.proto-stack { display: inline-flex; align-items: center; gap: 2px; flex-wrap: wrap; }
.proto-sep { color: var(--el-text-color-placeholder); font-size: 11px; }
.dir { font-size: 12px; font-weight: 600; }
.dir-inbound { color: #3b82f6; }
.dir-outbound { color: #22c55e; }
.dir-internal { color: #a855f7; }
.dir-unknown { color: var(--el-text-color-placeholder); }
.text-warn { color: #f59e0b; font-weight: 600; }
.cat-badge { margin-left: 4px; }
.cat-badge :deep(.el-badge__content) { font-size: 10px; height: 16px; line-height: 16px; padding: 0 5px; }
.cat-stats-row { margin-bottom: 14px; }
.cat-stat-card {
  background: var(--el-fill-color-light, #f5f7fa);
  border-radius: 8px;
  padding: 12px 14px;
  text-align: center;
}
.cat-stat-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cat-stat-label {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  margin-top: 2px;
}
.proto-col { margin-bottom: 14px; box-sizing: border-box; }
.proto-card {
  border: 1px solid var(--el-border-color-light, #e4e7ed);
  border-radius: 10px;
  padding: 14px 16px;
  cursor: pointer;
  transition: box-shadow .2s, border-color .2s;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
.proto-card:hover { box-shadow: 0 2px 12px rgba(0,0,0,.08); border-color: var(--el-color-primary-light-5, #a0cfff); }
.proto-card-head { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.proto-ico { font-size: 18px; }
.proto-card-title { font-weight: 700; font-size: 15px; flex: 1; }
.proto-card-dns .proto-ico { color: #22c55e; }
.proto-card-http .proto-ico { color: #3b82f6; }
.proto-card-tls .proto-ico { color: #f59e0b; }
.proto-card-ssh .proto-ico { color: #8b5cf6; }
.proto-card-other .proto-ico { color: #06b6d4; }
.proto-card-body { display: flex; flex-direction: column; gap: 6px; flex: 1; }
.proto-metric { display: flex; justify-content: space-between; align-items: center; font-size: 12px; line-height: 22px; }
.pm-label { color: var(--el-text-color-secondary); flex-shrink: 0; }
.pm-value { font-weight: 600; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; margin-left: 8px; }
</style>
