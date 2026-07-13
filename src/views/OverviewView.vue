<template>
  <div class="page">
    <!-- ── KPI cards ───────────────────────────────────────────────── -->
    <el-row :gutter="14" class="kpi-row">
      <el-col :xs="24" :sm="12" :md="6">
        <StatCard
          label="包数"
          :value="formatNumber(stats?.packets ?? 0)"
          :sub="formatRate(rates.pps) + ' 实时'"
          :icon="Connection"
          tone="#3b82f6"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <StatCard
          label="吞吐"
          :value="formatBytes(stats?.bytes ?? 0)"
          :sub="formatBitsPerSec(rates.bps) + ' 实时'"
          :icon="DataLine"
          tone="#22c55e"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <StatCard
          label="活跃流"
          :value="formatNumber(stats?.flows ?? 0)"
          :sub="ndpiClassifiedLabel"
          :icon="Share"
          tone="#a855f7"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <StatCard
          label="告警"
          :value="formatNumber(stats?.alerts_emitted ?? 0)"
          :sub="suppressedLabel"
          :icon="WarningFilled"
          tone="#ef4444"
        />
      </el-col>
    </el-row>

    <!-- ── two-column body: traffic trend + protocol pie ───────────── -->
    <el-row :gutter="14" class="body-row">
      <el-col :xs="24" :md="14">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>流量趋势</span>
              <span class="muted small">最近 {{ store.history.length }} 个采样点（约 2 分钟）</span>
            </div>
          </template>
          <div ref="trendEl" class="chart-canvas"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="10">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>协议分布（nDPI）</span>
              <span class="muted small">{{ topProtos.length }} 种</span>
            </div>
          </template>
          <div ref="pieEl" class="chart-canvas"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- ── (1) 整体性能 ──────────────────────────────────────────── -->
    <el-row :gutter="14" class="body-row">
      <el-col :span="24">
        <el-card shadow="never">
          <template #header>
            <div class="chart-header"><span>整体性能</span></div>
          </template>
          <el-row :gutter="14">
            <el-col :xs="12" :md="4">
              <StatCard label="收包" :value="formatNumber(stats?.capture_rx_packets ?? 0)" :sub="formatRate(rates.pps) + ' pps'" tone="#3b82f6" />
            </el-col>
            <el-col :xs="12" :md="4">
              <StatCard label="收字节" :value="formatBytes(stats?.capture_rx_bytes ?? 0)" :sub="formatBitsPerSec(rates.bps)" tone="#22c55e" />
            </el-col>
            <el-col :xs="12" :md="4">
              <StatCard label="IPC 丢包" :value="formatNumber(stats?.capture_ipc_drops ?? 0)" :sub="ipcDropRateText" :tone="ipcDropTone" />
            </el-col>
            <el-col :xs="12" :md="4">
              <StatCard label="处理包数" :value="formatNumber(stats?.packets ?? 0)" sub="agent 侧已处理" tone="#3b82f6" />
            </el-col>
            <el-col :xs="12" :md="4">
              <StatCard label="活跃流" :value="formatNumber(stats?.capture_flow_count ?? 0)" :sub="formatNumber(stats?.flows ?? 0) + ' 已入库'" tone="#a855f7" />
            </el-col>
            <el-col :xs="12" :md="4">
              <StatCard label="解析错误" :value="formatNumber(stats?.parse_errors ?? 0)" :sub="parseErrorRate" tone="#ef4444" />
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <!-- ── (2) 协议解析 ──────────────────────────────────────────── -->
    <el-row :gutter="14" class="body-row">
      <el-col :span="24">
        <el-card shadow="never">
          <template #header>
            <div class="chart-header">
              <span>协议解析（近 {{ overviewWindowLabel }}）</span>
              <el-radio-group v-model="overviewWindow" size="small" @change="loadOverviewStats">
                <el-radio-button value="5m">5 分钟</el-radio-button>
                <el-radio-button value="1h">1 小时</el-radio-button>
                <el-radio-button value="24h">24 小时</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="sub-title">网络层</div>
          <el-row :gutter="14">
            <el-col :xs="12" :md="4">
              <StatCard label="源 IP 数" :value="formatNumber(overview?.unique_src_ips ?? 0)" tone="#3b82f6" />
            </el-col>
            <el-col :xs="12" :md="4">
              <StatCard label="目的 IP 数" :value="formatNumber(overview?.unique_dst_ips ?? 0)" tone="#3b82f6" />
            </el-col>
            <el-col :xs="12" :md="4">
              <StatCard label="IPv4 会话" :value="formatNumber(overview?.ipv4_flows ?? 0)" />
            </el-col>
            <el-col :xs="12" :md="4">
              <StatCard label="IPv6 会话" :value="formatNumber(overview?.ipv6_flows ?? 0)" />
            </el-col>
          </el-row>
          <div class="sub-title" style="margin-top: 14px">传输层</div>
          <el-row :gutter="14">
            <el-col :xs="12" :md="4">
              <StatCard label="TCP 连接" :value="formatNumber(overview?.tcp_flows ?? 0)" tone="#22c55e" />
            </el-col>
            <el-col :xs="12" :md="4">
              <StatCard label="UDP 连接" :value="formatNumber(overview?.udp_flows ?? 0)" tone="#22c55e" />
            </el-col>
            <el-col :xs="12" :md="4">
              <StatCard label="其他 L4" :value="formatNumber(overview?.other_l4_flows ?? 0)" />
            </el-col>
            <el-col :xs="12" :md="4">
              <StatCard label="目的端口数" :value="formatNumber(overview?.unique_dst_ports ?? 0)" tone="#f59e0b" />
            </el-col>
          </el-row>
          <div class="sub-title" style="margin-top: 14px">应用层</div>
          <el-row :gutter="14">
            <el-col :xs="12" :md="4">
              <StatCard label="DNS" :value="formatNumber(stats?.dns_parsed ?? 0)" />
            </el-col>
            <el-col :xs="12" :md="4">
              <StatCard label="HTTP" :value="formatNumber(stats?.http_parsed ?? 0)" />
            </el-col>
            <el-col :xs="12" :md="4">
              <StatCard label="TLS" :value="formatNumber(stats?.tls_parsed ?? 0)" />
            </el-col>
            <el-col :xs="12" :md="4">
              <StatCard label="ICMP" :value="formatNumber(stats?.icmp_parsed ?? 0)" />
            </el-col>
            <el-col :xs="12" :md="4">
              <StatCard label="nDPI 识别率" :value="(overview?.classified_pct ?? 0).toFixed(1) + '%'" :sub="formatNumber(overview?.total_flows ?? 0) + ' 总会话'" tone="#a855f7" />
            </el-col>
            <el-col :xs="12" :md="4">
              <StatCard label="风险流量" :value="formatNumber(stats?.ndpi_risk_flagged ?? 0)" tone="#ef4444" />
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <!-- ── (3) 事务洞察 (ClickHouse 聚合) ── -->
    <el-row v-if="!insightsDisabled" :gutter="14" class="body-row">
      <el-col :span="24">
        <el-card shadow="never">
          <template #header>
            <div class="chart-header">
              <span>事务洞察（近 {{ insightsWindowLabel }}）</span>
              <el-radio-group v-model="insightsWindow" size="small" @change="loadInsights">
                <el-radio-button value="5m">5 分钟</el-radio-button>
                <el-radio-button value="1h">1 小时</el-radio-button>
                <el-radio-button value="24h">24 小时</el-radio-button>
              </el-radio-group>
            </div>
          </template>

          <el-row :gutter="14">
            <el-col :xs="24" :md="6">
              <StatCard label="DNS 配对" :value="formatNumber(stats?.dns_tx_paired ?? 0)" tone="#22c55e" />
            </el-col>
            <el-col :xs="24" :md="6">
              <StatCard label="DNS 超时" :value="formatNumber(stats?.dns_tx_timeout ?? 0)" tone="#f59e0b" />
            </el-col>
            <el-col :xs="24" :md="6">
              <StatCard label="HTTP 配对" :value="formatNumber(stats?.http_tx_paired ?? 0)" tone="#22c55e" />
            </el-col>
            <el-col :xs="24" :md="6">
              <StatCard label="HTTP 超时" :value="formatNumber(stats?.http_tx_timeout ?? 0)" tone="#f59e0b" />
            </el-col>
          </el-row>

          <el-row :gutter="14" style="margin-top: 14px">
            <el-col :xs="24" :md="12">
              <div class="sub-title">DNS 延迟分布</div>
              <el-row :gutter="10">
                <el-col :span="6"><el-statistic :value="insights?.dns.total ?? 0" title="总量" /></el-col>
                <el-col :span="6"><el-statistic :value="insights?.dns.p50_ms ?? 0" :precision="1" title="p50 (ms)" /></el-col>
                <el-col :span="6"><el-statistic :value="insights?.dns.p95_ms ?? 0" :precision="1" title="p95 (ms)" :value-style="{ color: '#ef4444' }" /></el-col>
                <el-col :span="6"><div class="muted small" style="margin-top: 18px">错误率 {{ ((insights?.dns.error_rate ?? 0) * 100).toFixed(1) }}%</div></el-col>
              </el-row>
            </el-col>
            <el-col :xs="24" :md="12">
              <div class="sub-title">HTTP 延迟分布</div>
              <el-row :gutter="10">
                <el-col :span="6"><el-statistic :value="insights?.http.total ?? 0" title="总量" /></el-col>
                <el-col :span="6"><el-statistic :value="insights?.http.p50_ms ?? 0" :precision="1" title="p50 (ms)" /></el-col>
                <el-col :span="6"><el-statistic :value="insights?.http.p95_ms ?? 0" :precision="1" title="p95 (ms)" :value-style="{ color: '#ef4444' }" /></el-col>
                <el-col :span="6"><div class="muted small" style="margin-top: 18px">错误率 {{ ((insights?.http.error_rate ?? 0) * 100).toFixed(1) }}%</div></el-col>
              </el-row>
            </el-col>
          </el-row>

          <el-row :gutter="14" style="margin-top: 14px">
            <el-col :xs="24" :md="8">
              <div class="sub-title">最慢域名 Top10 (DNS p95)</div>
              <el-table :data="insights?.top_slow_domains ?? []" size="small" :show-header="false" empty-text="暂无数据">
                <el-table-column type="index" width="40" />
                <el-table-column prop="key"><template #default="{ row }"><span class="mono small">{{ ellipsis(row.key, 36) }}</span></template></el-table-column>
                <el-table-column width="100" align="right"><template #default="{ row }"><span class="mono small">{{ row.p95_ms.toFixed(1) }} ms</span></template></el-table-column>
              </el-table>
            </el-col>
            <el-col :xs="24" :md="8">
              <div class="sub-title">最慢主机 Top10 (HTTP p95)</div>
              <el-table :data="insights?.top_slow_hosts ?? []" size="small" :show-header="false" empty-text="暂无数据">
                <el-table-column type="index" width="40" />
                <el-table-column prop="key"><template #default="{ row }"><span class="mono small">{{ ellipsis(row.key, 36) }}</span></template></el-table-column>
                <el-table-column width="100" align="right"><template #default="{ row }"><span class="mono small">{{ row.p95_ms.toFixed(1) }} ms</span></template></el-table-column>
              </el-table>
            </el-col>
            <el-col :xs="24" :md="8">
              <div class="sub-title">错误主机 Top10 (HTTP)</div>
              <el-table :data="insights?.top_error_hosts ?? []" size="small" :show-header="false" empty-text="无错误">
                <el-table-column type="index" width="40" />
                <el-table-column><template #default="{ row }"><span class="mono small">{{ ellipsis(row.host, 32) }}</span></template></el-table-column>
                <el-table-column width="110" align="right"><template #default="{ row }">
                  <el-tag size="small" :type="row.worst_code >= 500 ? 'danger' : 'warning'">{{ row.errors }}/{{ row.total }} · {{ row.worst_code }}</el-tag>
                </template></el-table-column>
              </el-table>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts/core'
import { LineChart, PieChart } from 'echarts/charts'
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { Connection, DataLine, Share, WarningFilled } from '@element-plus/icons-vue'

import StatCard from '@/components/StatCard.vue'
import { useProbeStore } from '@/stores/probe'
import { ellipsis, formatBitsPerSec, formatBytes, formatNumber, formatRate } from '@/utils/format'
import { api } from '@/api/client'
import type { TxInsights, OverviewStats } from '@/api/types'

echarts.use([
  LineChart,
  PieChart,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  CanvasRenderer,
])

const store = useProbeStore()
const stats = computed(() => store.stats)
const rates = computed(() => store.rates)

const ndpiClassifiedLabel = computed(() => {
  const n = stats.value?.ndpi_classified ?? 0
  const pkts = stats.value?.packets ?? 0
  if (pkts === 0) return '—'
  return `${formatNumber(n)} classified (${((n / pkts) * 100).toFixed(0)}%)`
})

const suppressedLabel = computed(() => {
  const sup = stats.value?.alerts_suppressed ?? 0
  return sup ? `${formatNumber(sup)} duplicates suppressed` : 'no duplicates'
})

// ── parse error & IPC drop rate ────────────────────────────────────────
const parseErrorRate = computed(() => {
  const errs = stats.value?.parse_errors ?? 0
  const pkts = stats.value?.packets ?? 0
  if (pkts === 0) return '—'
  return `${((errs / pkts) * 100).toFixed(3)}%`
})

const ipcDropRateText = computed(() => {
  const rate = stats.value?.ipc_drop_rate ?? 0
  return `${(rate * 100).toFixed(3)}%`
})

const ipcDropDetail = computed(() => {
  const drops = stats.value?.capture_ipc_drops ?? 0
  const pushed = stats.value?.capture_ipc_pushed ?? 0
  return `${formatNumber(drops)} / ${formatNumber(pushed + drops)}`
})

const ipcDropTone = computed(() => {
  const rate = stats.value?.ipc_drop_rate ?? 0
  if (rate >= 0.01) return '#ef4444' // ≥1% red
  if (rate >= 0.001) return '#f59e0b' // ≥0.1% amber
  return '#22c55e' // green
})

// ── overview stats (ClickHouse: network/transport/app layer) ──────────
const overview = ref<OverviewStats | null>(null)
const overviewWindow = ref<'5m' | '1h' | '24h'>('1h')
const overviewWindowLabel = computed(() =>
  ({ '5m': '5 分钟', '1h': '1 小时', '24h': '24 小时' })[overviewWindow.value],
)
async function loadOverviewStats() {
  try {
    const data = await api.overviewStats(overviewWindow.value)
    if (data.disabled) {
      overview.value = null
    } else {
      overview.value = data
    }
  } catch (err) {
    console.warn('overview stats fetch failed', err)
  }
}

// ── traffic trend chart ───────────────────────────────────────────────
const trendEl = ref<HTMLElement>()
let trendChart: echarts.ECharts | null = null

function rebuildTrend() {
  if (!trendChart) return
  const h = store.history
  if (h.length < 2) {
    trendChart.setOption({ series: [{ data: [] }, { data: [] }] }, false)
    return
  }
  const pps: [number, number][] = []
  const bps: [number, number][] = []
  for (let i = 1; i < h.length; i++) {
    const a = h[i - 1]
    const b = h[i]
    const dt = (b.ts - a.ts) / 1000
    if (dt <= 0) continue
    pps.push([b.ts, Math.max(0, (b.packets - a.packets) / dt)])
    bps.push([b.ts, Math.max(0, (b.bytes - a.bytes) / dt * 8 / 1e6)])
  }
  trendChart.setOption({
    series: [
      { name: 'Packets/s', data: pps },
      { name: 'Mbps', data: bps },
    ],
  })
}

function initTrend() {
  if (!trendEl.value) return
  trendChart = echarts.init(trendEl.value)
  trendChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0 },
    grid: { left: 55, right: 65, top: 30, bottom: 40 },
    xAxis: { type: 'time' },
    yAxis: [
      { type: 'value', name: 'pps', position: 'left', nameGap: 28 },
      { type: 'value', name: 'Mbps', position: 'right', nameGap: 28, axisLabel: { formatter: (v: number) => v.toFixed(1) } },
    ],
    series: [
      {
        name: 'Packets/s',
        type: 'line',
        smooth: true,
        showSymbol: false,
        yAxisIndex: 0,
        itemStyle: { color: '#3b82f6' },
        areaStyle: { opacity: 0.15 },
        data: [],
      },
      {
        name: 'Mbps',
        type: 'line',
        smooth: true,
        showSymbol: false,
        yAxisIndex: 1,
        itemStyle: { color: '#22c55e' },
        data: [],
      },
    ],
  })
}

// ── protocol pie ──────────────────────────────────────────────────────
const pieEl = ref<HTMLElement>()
let pieChart: echarts.ECharts | null = null

const topProtos = computed(() => {
  const rows = store.ndpi?.protocols ?? []
  // Roll up by app_name (master is often empty until classification finalises).
  const totals = new Map<string, number>()
  for (const r of rows) {
    const name = r.app_name || r.master_name || `app#${r.app}`
    totals.set(name, (totals.get(name) ?? 0) + r.count)
  }
  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }))
})

function rebuildPie() {
  if (!pieChart) return
  pieChart.setOption({ series: [{ data: topProtos.value }] })
}

function initPie() {
  if (!pieEl.value) return
  pieChart = echarts.init(pieEl.value)
  pieChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, type: 'scroll' },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 1 },
        label: { show: false },
        data: [],
      },
    ],
  })
}

// ── lifecycle ─────────────────────────────────────────────────────────
const onResize = () => {
  trendChart?.resize()
  pieChart?.resize()
}

onMounted(() => {
  initTrend()
  initPie()
  rebuildTrend()
  rebuildPie()
  window.addEventListener('resize', onResize)
})
onBeforeUnmount(() => {
  trendChart?.dispose()
  pieChart?.dispose()
  trendChart = null
  pieChart = null
  window.removeEventListener('resize', onResize)
})

watch(() => store.history.length, rebuildTrend)
watch(topProtos, rebuildPie, { deep: true })

// ── 事务洞察（调 /insights/transactions）──
const insights = ref<TxInsights | null>(null)
const insightsDisabled = ref(false)
const insightsWindow = ref<'5m' | '1h' | '24h'>('5m')
const insightsWindowLabel = computed(() =>
  ({ '5m': '5 分钟', '1h': '1 小时', '24h': '24 小时' })[insightsWindow.value],
)
async function loadInsights() {
  try {
    const data = await api.insights(insightsWindow.value)
    if (data.disabled) {
      insightsDisabled.value = true
      insights.value = null
    } else {
      insightsDisabled.value = false
      insights.value = data
    }
  } catch (err) {
    console.warn('insights fetch failed', err)
  }
}
let insightsTimer: number | null = null
let overviewTimer: number | null = null
onMounted(() => {
  void loadInsights()
  void loadOverviewStats()
  insightsTimer = window.setInterval(() => void loadInsights(), 10_000)
  overviewTimer = window.setInterval(() => void loadOverviewStats(), 10_000)
})
onBeforeUnmount(() => {
  if (insightsTimer != null) window.clearInterval(insightsTimer)
  if (overviewTimer != null) window.clearInterval(overviewTimer)
})
</script>

<style scoped>
.kpi-row {
  margin-bottom: 20px;
}
.body-row {
  margin-bottom: 20px;
}
.chart-card {
  border-radius: var(--sg-card-radius, 6px) !important;
  border: 1px solid var(--sg-card-border, #e8e8e8) !important;
  box-shadow: var(--sg-card-shadow, 0 1px 4px rgba(0,0,0,0.06)) !important;
}
.chart-card :deep(.el-card__header) {
  padding: 16px 20px 12px;
  border-bottom: 1px solid #f1f5f9;
}
.chart-card :deep(.el-card__body) {
  padding: 12px 16px 16px;
}
.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  font-size: 14px;
  color: var(--sg-text, #1e293b);
}
.small {
  font-size: 12px;
  font-weight: 400;
  color: var(--sg-text-muted, #94a3b8);
}
.chart-canvas {
  width: 100%;
  height: 280px;
}
.sub-title {
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--sg-text, #1e293b);
  border-left: 3px solid var(--sg-brand, #1677ff);
  padding-left: 10px;
  font-size: 14px;
}
.mono {
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
}
</style>
