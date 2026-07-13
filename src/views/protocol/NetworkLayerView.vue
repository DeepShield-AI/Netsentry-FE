<template>
  <div class="page">
    <!-- ── IP 网络层统计卡片 ──────────────────────────── -->
    <el-row :gutter="14" class="kpi-row">
      <el-col :xs="12" :sm="8" :md="4">
        <StatCard label="唯一源 IP" :value="formatNumber(uniqueSrcIPs)"
                  sub="对外通信主机" :icon="Position" tone="#3b82f6" />
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <StatCard label="IPv6 流" :value="formatNumber(ipv6Count)"
                  :sub="ipv6Pct + '% IPv6'" :icon="Connection" tone="#a855f7" />
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <StatCard label="隧道协议" :value="formatNumber(tunnelCount)"
                  sub="GRE / IPinIP / ESP" :icon="Top" tone="#22c55e" />
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <StatCard label="总带宽" :value="formatBytes(totalBandwidth) + '/s'"
                  sub="最近采样周期" :icon="Bottom" tone="#f59e0b" />
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <StatCard label="路由协议" :value="formatNumber(routingProtoCount)"
                  sub="OSPF / VRRP" :icon="OfficeBuilding" tone="#06b6d4" />
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <StatCard label="总 L3 流" :value="formatNumber(totalFlows)"
                  sub="所有 L3 会话" :icon="DataLine" tone="#64748b" />
      </el-col>
    </el-row>

    <!-- ── 图表行：网络层协议分布 + Top 源 IP ────────────── -->
    <el-row :gutter="14" class="body-row">
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="section-header">
              <el-icon><PieChart /></el-icon>
              <span>网络层协议分布</span>
              <span class="muted small">IPv4 / IPv6 / ICMP / IGMP …</span>
            </div>
          </template>
          <div ref="l3PieEl" class="chart-canvas"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="section-header">
              <el-icon><Histogram /></el-icon>
              <span>Top 源 IP（按流量）</span>
              <span class="muted small">发送方排行</span>
            </div>
          </template>
          <div ref="srcBarEl" class="chart-canvas"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- ── IP 带宽：入站 + 出站 ─────────────────────────── -->
    <el-row :gutter="14" class="body-row">
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="section-header">
              <el-icon><Bottom /></el-icon>
              <span>入站带宽（Top IP）</span>
              <span class="muted small">按 bytes/s 降序</span>
            </div>
          </template>
          <div ref="bwInEl" class="chart-canvas"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="section-header">
              <el-icon><Top /></el-icon>
              <span>出站带宽（Top IP）</span>
              <span class="muted small">按 bytes/s 降序</span>
            </div>
          </template>
          <div ref="bwOutEl" class="chart-canvas"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- ── IP 查询对话框 ─────────────────────────────────── -->
    <el-dialog v-model="ipDialogVisible" :title="'IP 情报: ' + ipDialogIP" width="520px" destroy-on-close>
      <div v-loading="ipLoading" style="min-height:100px">
        <template v-if="ipData">
          <div v-if="ipData.is_private" class="ip-detail-private">
            <el-result icon="info" title="内网地址" :sub-title="ipData.org" />
          </div>
          <template v-else>
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="IP 地址">
                <span class="mono">{{ ipData.ip }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="国家/地区">
                <span>{{ countryFlag(ipData.country_code) }} {{ ipData.country }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="省/州">{{ ipData.region }}</el-descriptions-item>
              <el-descriptions-item label="城市">{{ ipData.city }}</el-descriptions-item>
              <el-descriptions-item label="经纬度">
                <span class="mono small">{{ ipData.lat }}, {{ ipData.lon }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="时区">{{ ipData.timezone }}</el-descriptions-item>
              <el-descriptions-item label="ISP">
                <el-tag size="small" type="primary">{{ ipData.isp }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="组织">{{ ipData.org }}</el-descriptions-item>
              <el-descriptions-item label="AS 编号">
                <span class="mono small">{{ ipData.as }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="AS 名称">{{ ipData.as_name }}</el-descriptions-item>
              <el-descriptions-item v-if="ipData.reverse" label="反向 DNS">
                <span class="mono small">{{ ipData.reverse }}</span>
              </el-descriptions-item>
            </el-descriptions>
            <div style="margin-top:12px;text-align:right">
              <el-button size="small" @click="askAIAboutIP" :loading="aiLoading" type="primary" plain>
                AI 分析此 IP
              </el-button>
            </div>
            <div v-if="aiResult" class="ai-result">
              <div class="ai-result-header">AI 分析结果</div>
              <div class="ai-result-body" v-html="aiResult"></div>
            </div>
          </template>
        </template>
        <div v-if="ipError" style="color:var(--el-color-danger);padding:12px">{{ ipError }}</div>
      </div>
    </el-dialog>

    <!-- ── 网络层流表 ────────────────────────────────────── -->
    <el-card shadow="never" class="body-row">
      <template #header>
        <div class="section-header">
          <el-icon><Grid /></el-icon>
          <span>网络层流量明细</span>
          <el-tag size="small" :type="mode === 'history' ? 'success' : 'info'" class="count-tag" disable-transitions>
            {{ mode === 'history' ? `历史 ${historyTotal} 条` : `${tableRows.length} 条` }}
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
                      :prefix-icon="Search" size="small" style="width: 200px" />
            <el-select v-model="l3Filter" placeholder="L3 协议" clearable size="small" style="width: 120px">
              <el-option label="TCP" value="TCP" />
              <el-option label="UDP" value="UDP" />
              <el-option label="ICMP" value="ICMP" />
              <el-option label="ICMPv6" value="ICMPv6" />
              <el-option label="GRE" value="GRE" />
              <el-option label="ESP" value="ESP" />
              <el-option label="AH" value="AH" />
              <el-option label="OSPF" value="OSPF" />
              <el-option label="VRRP" value="VRRP" />
              <el-option label="IGMP" value="IGMP" />
              <el-option label="IP-in-IP" value="IP-in-IP" />
              <el-option label="IPv6-Encap" value="IPv6-Encap" />
            </el-select>
            <el-select v-model="flowFilter" placeholder="方向" clearable size="small" style="width: 100px">
              <el-option label="出站" value="outbound" />
              <el-option label="入站" value="inbound" />
              <el-option label="内部" value="internal" />
            </el-select>
            <el-button size="small" :icon="Refresh" @click="reload">刷新</el-button>
          </div>
        </div>
      </template>

      <el-table :data="tableRows" v-loading="detailLoading" size="small" stripe :max-height="520"
                :default-sort="{ prop: 'bytes_count', order: 'descending' }"
                empty-text="暂无流量数据…">
        <el-table-column prop="timestamp" label="时间" width="160" sortable>
          <template #default="{ row }"><span class="mono xs">{{ formatTime(row.timestamp) }}</span></template>
        </el-table-column>
        <el-table-column label="L3 协议" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="l3TagType(row.l3_proto)" disable-transitions>
              {{ l3ProtoName(row.l3_proto) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="源 IP" min-width="130">
          <template #default="{ row }">
            <span class="mono xs ip-link" :class="{ 'ip-private': isPrivateIP(stripIP(row.five_tuple.src_ip)) }"
                  @click.stop="lookupIP(stripIP(row.five_tuple.src_ip))">{{ stripIP(row.five_tuple.src_ip) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="目的 IP" min-width="130">
          <template #default="{ row }">
            <span class="mono xs ip-link" :class="{ 'ip-private': isPrivateIP(stripIP(row.five_tuple.dst_ip)) }"
                  @click.stop="lookupIP(stripIP(row.five_tuple.dst_ip))">{{ stripIP(row.five_tuple.dst_ip) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="方向" width="55" align="center">
          <template #default="{ row }">
            <span :class="'dir dir-' + (row.direction || 'unknown')">{{ dirIcon(row.direction) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="bytes_count" label="流量" width="90" align="right" sortable>
          <template #default="{ row }">{{ formatBytes(row.bytes_count) }}</template>
        </el-table-column>
        <el-table-column prop="packet_count" label="包数" width="72" align="right" sortable>
          <template #default="{ row }">{{ formatNumber(row.packet_count) }}</template>
        </el-table-column>
        <el-table-column prop="duration_ms" label="时长" width="80" align="right" sortable>
          <template #default="{ row }">{{ formatDurationMs(row.duration_ms) }}</template>
        </el-table-column>
        <el-table-column label="带宽" width="100" align="right" sortable :sort-method="sortByBandwidth">
          <template #default="{ row }">
            <span class="mono xs">{{ calcBandwidth(row) }}</span>
          </template>
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
import { Bottom, Connection, DataLine, Grid, Histogram, OfficeBuilding, PieChart, Position, Refresh, Search, Top } from '@element-plus/icons-vue'

import StatCard from '@/components/StatCard.vue'
import { api } from '@/api/client'
import type { Flow, HistoryQuery, IPInfo } from '@/api/types'
import { formatBytes, formatDurationMs, formatNumber, formatTime } from '@/utils/format'

echarts.use([PieChartComponent, BarChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer])

// ── L3Proto 枚举名映射 ──
const L3_PROTO_NAMES: Record<number, string> = {
  0: 'Unknown', 1: 'TCP', 2: 'UDP', 3: 'ICMP', 4: 'ICMPv6',
  5: 'IGMP', 6: 'GRE', 7: 'ESP', 8: 'AH', 9: 'OSPF',
  10: 'VRRP', 11: 'SCTP', 12: 'IP-in-IP', 13: 'IPv6-Encap',
}
function l3ProtoName(proto?: number): string {
  if (proto == null) return 'Unknown'
  return L3_PROTO_NAMES[proto] ?? `L3(${proto})`
}
function l3TagType(proto?: number): string {
  if (proto === 1) return 'primary'     // TCP
  if (proto === 2) return 'success'     // UDP
  if (proto === 3 || proto === 4) return 'warning'  // ICMP/ICMPv6
  if (proto === 6 || proto === 7 || proto === 8) return 'danger' // GRE/ESP/AH
  if (proto === 9 || proto === 10) return ''         // OSPF/VRRP
  return 'info'
}

// ── ICMPv6 类型枚举名映射 ──
const ICMPV6_TYPE_NAMES: Record<number, string> = {
  0: 'Other', 1: 'Echo Req', 2: 'Echo Reply',
  3: 'RS', 4: 'RA', 5: 'NS', 6: 'NA', 7: 'Redirect',
}
function icmpv6TypeName(ty?: number): string {
  if (ty == null) return ''
  return ICMPV6_TYPE_NAMES[ty] ?? `Type(${ty})`
}

// ── IPv6 扩展头位掩码解析 ──
const EXT_HEADER_BITS: [number, string][] = [
  [0, 'HBH'], [1, 'Routing'], [2, 'Frag'], [3, 'Dest'], [4, 'AH'], [5, 'ESP'],
]
function extHeaderTags(mask?: number): string[] {
  if (!mask) return []
  return EXT_HEADER_BITS.filter(([bit]) => (mask! & (1 << bit)) !== 0).map(([, name]) => name)
}

// ── 流加载 ──
const allFlows = ref<Flow[]>([])
async function loadFlows() {
  try { allFlows.value = await api.recentFlows(500) } catch { /* */ }
}

// ── IP 工具函数 ──
function stripIP(ip?: string): string {
  if (!ip) return ''
  return ip.replace(/^::ffff:/i, '')
}

function calcBandwidth(row: Flow): string {
  const dur = row.duration_ms || 0
  if (dur <= 0 || !row.bytes_count) return '—'
  const bps = row.bytes_count / (dur / 1000)
  return formatBytes(Math.round(bps)) + '/s'
}

function sortByBandwidth(a: Flow, b: Flow): number {
  const bwA = (a.duration_ms && a.duration_ms > 0) ? a.bytes_count / a.duration_ms : 0
  const bwB = (b.duration_ms && b.duration_ms > 0) ? b.bytes_count / b.duration_ms : 0
  return bwA - bwB
}

function isPrivateIP(ip: string): boolean {
  if (!ip) return false
  if (ip.startsWith('10.')) return true
  if (ip.startsWith('192.168.')) return true
  if (ip.startsWith('172.')) {
    const second = parseInt(ip.split('.')[1], 10)
    if (second >= 16 && second <= 31) return true
  }
  if (ip.startsWith('127.')) return true
  return false
}

// ── KPI ──
const totalFlows = computed(() => allFlows.value.length)
const uniqueSrcIPs = computed(() => new Set(allFlows.value.map(f => stripIP(f.five_tuple.src_ip))).size)
const ipv6Count = computed(() => allFlows.value.filter(f =>
  f.five_tuple.src_ip?.includes(':') || f.l3_proto === 4 || f.l3_proto === 13
).length)
const ipv6Pct = computed(() => totalFlows.value > 0 ? ((ipv6Count.value / totalFlows.value) * 100).toFixed(1) : '0')
const tunnelCount = computed(() => allFlows.value.filter(f =>
  f.l3_proto === 6 || f.l3_proto === 7 || f.l3_proto === 8 || f.l3_proto === 12 || f.l3_proto === 13
).length)
const totalBandwidth = computed(() => {
  if (allFlows.value.length < 2) return 0
  const sorted = [...allFlows.value].sort((a, b) => {
    const ta = new Date(a.timestamp).getTime()
    const tb = new Date(b.timestamp).getTime()
    return ta - tb
  })
  const first = new Date(sorted[0].timestamp).getTime()
  const last = new Date(sorted[sorted.length - 1].timestamp).getTime()
  const spanSec = (last - first) / 1000
  if (spanSec <= 0) return 0
  const totalBytes = allFlows.value.reduce((s, f) => s + (f.bytes_count || 0), 0)
  return Math.round(totalBytes / spanSec)
})
const routingProtoCount = computed(() => allFlows.value.filter(f => f.l3_proto === 9 || f.l3_proto === 10).length)

// ── 网络层协议饼图数据（IPv4/IPv6/ICMP/IGMP 等真正的 L3 协议）──
function classifyL3(f: Flow): string {
  const ip = f.five_tuple.src_ip || ''
  // ICMP/ICMPv6 单独归类
  if (f.l3_proto === 3) return 'ICMP'
  if (f.l3_proto === 4) return 'ICMPv6'
  if (f.l3_proto === 5) return 'IGMP'
  if (f.l3_proto === 6) return 'GRE'
  if (f.l3_proto === 7) return 'ESP'
  if (f.l3_proto === 8) return 'AH'
  if (f.l3_proto === 9) return 'OSPF'
  if (f.l3_proto === 10) return 'VRRP'
  if (f.l3_proto === 12) return 'IP-in-IP'
  if (f.l3_proto === 13) return 'IPv6-Encap'
  // 根据 IP 地址判断 IPv4/IPv6
  const stripped = stripIP(ip)
  if (stripped !== ip) return 'IPv4'   // had ::ffff: prefix → IPv4-mapped
  if (ip.includes(':')) return 'IPv6'
  return 'IPv4'
}
const l3PieData = computed(() => {
  const counts = new Map<string, number>()
  for (const f of allFlows.value) {
    const name = classifyL3(f)
    counts.set(name, (counts.get(name) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }))
})

// ── 按方向聚合 IP 带宽（bytes/s）──
function ipBandwidth(dir: 'inbound' | 'outbound', limit = 10) {
  const totals = new Map<string, { bytes: number; ms: number }>()
  for (const f of allFlows.value) {
    if (f.direction !== dir) continue
    const ip = dir === 'inbound'
      ? stripIP(f.five_tuple.src_ip)   // 入站：看源 IP
      : stripIP(f.five_tuple.dst_ip)   // 出站：看目的 IP
    const prev = totals.get(ip) || { bytes: 0, ms: 0 }
    prev.bytes += (f.bytes_count || 0)
    prev.ms += (f.duration_ms || 0)
    totals.set(ip, prev)
  }
  return [...totals.entries()]
    .map(([ip, v]) => ({ ip, bw: v.ms > 0 ? Math.round(v.bytes / (v.ms / 1000)) : 0 }))
    .sort((a, b) => b.bw - a.bw)
    .slice(0, limit)
}
const bwInData = computed(() => ipBandwidth('inbound'))
const bwOutData = computed(() => ipBandwidth('outbound'))

// ── Top IP 数据 ──
function topIPs(field: 'src_ip' | 'dst_ip', limit = 10) {
  const totals = new Map<string, number>()
  for (const f of allFlows.value) {
    const ip = stripIP(f.five_tuple[field])
    totals.set(ip, (totals.get(ip) ?? 0) + (f.bytes_count || 0))
  }
  return [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit)
}

// ── 流表筛选 ──
const flowSearch = ref('')
const flowFilter = ref('')
const l3Filter = ref('')

// 客户端筛选：直播模式作用于 allFlows，历史模式作用于当前页 detailRows。
function applyClientFilters(src: Flow[]): Flow[] {
  let list = src
  if (flowFilter.value) list = list.filter(f => f.direction === flowFilter.value)
  if (l3Filter.value) list = list.filter(f => l3ProtoName(f.l3_proto) === l3Filter.value)
  const q = flowSearch.value.toLowerCase().trim()
  if (q) {
    list = list.filter(f =>
      [stripIP(f.five_tuple.src_ip), stripIP(f.five_tuple.dst_ip), f.app_proto, f.host,
       l3ProtoName(f.l3_proto),
      ].filter(Boolean).join(' ').toLowerCase().includes(q)
    )
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

// 表格数据源：历史模式取服务端分页结果（再做一次客户端 L3/方向/搜索筛选）；
// 实时模式直接用 allFlows 的客户端筛选结果。
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
      dir: flowFilter.value || undefined,
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

// History mode: server filters by q/dir → reload (debounced) when they change.
let searchTimer: number | null = null
watch([flowSearch, flowFilter], () => {
  if (mode.value !== 'history') return
  if (searchTimer != null) window.clearTimeout(searchTimer)
  searchTimer = window.setTimeout(() => { page.value = 1; void fetchHistory() }, 300)
})

function dirIcon(dir?: string): string {
  if (dir === 'inbound') return '↓'
  if (dir === 'outbound') return '↑'
  if (dir === 'internal') return '↔'
  return '·'
}

// ── ECharts: 网络层协议饼图 + Top 源 IP 柱图 + 带宽时序 ──
const l3PieEl = ref<HTMLElement>()
const srcBarEl = ref<HTMLElement>()
const bwInEl = ref<HTMLElement>()
const bwOutEl = ref<HTMLElement>()
let l3PieChart: echarts.ECharts | null = null
let srcBarChart: echarts.ECharts | null = null
let bwInChart: echarts.ECharts | null = null
let bwOutChart: echarts.ECharts | null = null

function initL3Pie() {
  if (!l3PieEl.value) return
  l3PieChart = echarts.init(l3PieEl.value)
  l3PieChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} 流 ({d}%)' },
    legend: { bottom: 0, type: 'scroll' },
    color: ['#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#06b6d4', '#ef4444', '#ec4899', '#64748b', '#14b8a6', '#f97316', '#8b5cf6', '#0ea5e9'],
    series: [{
      type: 'pie', radius: ['40%', '70%'], center: ['50%', '45%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 1 },
      label: { show: true, formatter: '{b}\n{d}%', fontSize: 11 }, data: [],
    }],
  })
}

function initBwBar(el: HTMLElement | undefined, color: string): echarts.ECharts | null {
  if (!el) return null
  const chart = echarts.init(el)
  chart.setOption({
    tooltip: { trigger: 'axis', formatter: (p: any) => `${p[0]?.name}<br/>${formatBytes(p[0]?.value)}/s` },
    grid: { left: 130, right: 80, top: 10, bottom: 10 },
    xAxis: { type: 'value', axisLabel: { fontSize: 10, formatter: (v: number) => formatBytes(v) + '/s' } },
    yAxis: { type: 'category', data: [], axisLabel: { fontSize: 10 }, inverse: true },
    series: [{ type: 'bar', barMaxWidth: 20, itemStyle: { borderRadius: [0, 3, 3, 0], color }, data: [],
      label: { show: true, position: 'right', fontSize: 10, formatter: (p: any) => formatBytes(p.value) + '/s' },
    }],
  })
  return chart
}

function initBar(el: HTMLElement | undefined, color: string): echarts.ECharts | null {
  if (!el) return null
  const chart = echarts.init(el)
  chart.setOption({
    tooltip: { trigger: 'axis', formatter: (p: any) => `${p[0]?.name}: ${formatBytes(p[0]?.value)}` },
    grid: { left: 120, right: 70, top: 10, bottom: 10 },
    xAxis: { type: 'value', axisLabel: { fontSize: 10, formatter: (v: number) => formatBytes(v) } },
    yAxis: { type: 'category', data: [], axisLabel: { fontSize: 10 }, inverse: true },
    series: [{ type: 'bar', barMaxWidth: 20, itemStyle: { borderRadius: [0, 3, 3, 0], color }, data: [],
      label: { show: true, position: 'right', fontSize: 10, formatter: (p: any) => formatBytes(p.value) },
    }],
  })
  return chart
}

function rebuildL3Pie() {
  l3PieChart?.setOption({ series: [{ data: l3PieData.value }] })
}

function rebuildSrcBar() {
  if (!srcBarChart) return
  const d = topIPs('src_ip')
  srcBarChart.setOption({ yAxis: { data: d.map(([ip]) => ip) }, series: [{ data: d.map(([, v]) => v) }] })
}

function rebuildBwCharts() {
  if (bwInChart) {
    const d = bwInData.value
    bwInChart.setOption({ yAxis: { data: d.map(i => i.ip) }, series: [{ data: d.map(i => i.bw) }] })
  }
  if (bwOutChart) {
    const d = bwOutData.value
    bwOutChart.setOption({ yAxis: { data: d.map(i => i.ip) }, series: [{ data: d.map(i => i.bw) }] })
  }
}

const onResize = () => { l3PieChart?.resize(); srcBarChart?.resize(); bwInChart?.resize(); bwOutChart?.resize() }
let flowTimer: number | null = null

onMounted(() => {
  initL3Pie()
  srcBarChart = initBar(srcBarEl.value, '#3b82f6')
  bwInChart = initBwBar(bwInEl.value, '#3b82f6')
  bwOutChart = initBwBar(bwOutEl.value, '#22c55e')
  void loadFlows()
  flowTimer = window.setInterval(loadFlows, 5000)
  window.addEventListener('resize', onResize)
})
onBeforeUnmount(() => {
  l3PieChart?.dispose(); srcBarChart?.dispose(); bwInChart?.dispose(); bwOutChart?.dispose()
  l3PieChart = null; srcBarChart = null; bwInChart = null; bwOutChart = null
  if (flowTimer != null) window.clearInterval(flowTimer)
  if (searchTimer != null) window.clearTimeout(searchTimer)
  window.removeEventListener('resize', onResize)
})
watch(l3PieData, rebuildL3Pie, { deep: true })
watch(allFlows, () => { rebuildSrcBar(); rebuildBwCharts() }, { deep: true })

// ── IP Lookup Dialog ──
const ipDialogVisible = ref(false)
const ipDialogIP = ref('')
const ipData = ref<IPInfo | null>(null)
const ipLoading = ref(false)
const ipError = ref('')
const aiLoading = ref(false)
const aiResult = ref('')

function countryFlag(code: string): string {
  if (!code || code.length !== 2) return ''
  const offset = 0x1F1E6 - 65
  return String.fromCodePoint(code.charCodeAt(0) + offset, code.charCodeAt(1) + offset)
}

async function lookupIP(ip: string) {
  if (!ip) return
  ipDialogIP.value = ip
  ipData.value = null
  ipError.value = ''
  aiResult.value = ''
  ipDialogVisible.value = true
  ipLoading.value = true
  try {
    ipData.value = await api.ipLookup(ip)
  } catch (e: any) {
    ipError.value = e?.message || '查询失败'
  } finally {
    ipLoading.value = false
  }
}

async function askAIAboutIP() {
  if (!ipData.value) return
  const d = ipData.value
  aiLoading.value = true
  aiResult.value = ''
  const prompt = `请分析以下 IP 地址的安全情报，判断其是否可能是恶意的、属于哪类组织、是否为已知数据中心/云服务商/CDN，以及其他安全相关信息。用简洁的中文回答。\n\nIP: ${d.ip}\n国家: ${d.country}\n城市: ${d.city}\nISP: ${d.isp}\n组织: ${d.org}\nAS: ${d.as} (${d.as_name})\n反向DNS: ${d.reverse || '无'}`
  try {
    const result = await api.chat([{ role: 'user', content: prompt }])
    aiResult.value = (result.content || '').replace(/\n/g, '<br/>')
  } catch (e: any) {
    aiResult.value = '<span style="color:var(--el-color-danger)">AI 分析失败: ' + (e?.message || '未知错误') + '</span>'
  } finally {
    aiLoading.value = false
  }
}
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
.dir { font-size: 14px; font-weight: 700; }
.dir-inbound { color: #3b82f6; }
.dir-outbound { color: #22c55e; }
.dir-internal { color: #a855f7; }
.dir-unknown { color: var(--el-text-color-placeholder); }
.ip-private { color: #06b6d4; }
.ip-link { cursor: pointer; text-decoration: underline; text-decoration-style: dotted; text-underline-offset: 2px; }
.ip-link:hover { color: var(--el-color-primary); text-decoration-style: solid; }
.ai-result { margin-top: 12px; border: 1px solid var(--el-border-color-lighter); border-radius: 6px; overflow: hidden; }
.ai-result-header { background: var(--el-fill-color-light); padding: 6px 12px; font-weight: 600; font-size: 13px; }
.ai-result-body { padding: 10px 12px; font-size: 13px; line-height: 1.6; }
.ext-tags { display: flex; gap: 2px; flex-wrap: wrap; }
.ext-tag { font-size: 10px !important; padding: 0 4px !important; }
</style>
