<template>
  <div class="pf-page">
    <!-- Row 1: KPI stat cards -->
    <div class="pf-row pf-row-5">
      <div class="pf-card pf-kpi">
        <div class="pf-kpi-label">上行</div>
        <div class="pf-kpi-value pf-blue">{{ upstreamRate }}</div>
        <div class="pf-kpi-label" style="margin-top:8px">下行</div>
        <div class="pf-kpi-value pf-green">{{ downstreamRate }}</div>
      </div>
      <div class="pf-card pf-kpi">
        <div class="pf-kpi-label">连接数</div>
        <div class="pf-kpi-value pf-big">{{ totalConns }}</div>
        <div class="pf-kpi-sub">
          <span>TCP <strong>{{ tcpConns }}</strong></span>
          <span>UDP <strong>{{ udpConns }}</strong></span>
          <span>ICMP <strong>{{ icmpConns }}</strong></span>
        </div>
      </div>
      <div class="pf-card pf-kpi">
        <div class="pf-kpi-label">PPS</div>
        <div class="pf-kpi-value">{{ ppsVal }}</div>
        <div class="pf-kpi-label" style="margin-top:8px">SYN</div>
        <div class="pf-kpi-value">{{ synVal }}</div>
      </div>
      <div class="pf-card pf-kpi">
        <div class="pf-kpi-label">SYN ACK</div>
        <div class="pf-kpi-value">{{ synAckVal }}</div>
        <div class="pf-kpi-label" style="margin-top:8px">新建/s</div>
        <div class="pf-kpi-value">{{ newConnRate }}</div>
      </div>
      <div class="pf-card pf-kpi">
        <div class="pf-kpi-label">丢包</div>
        <div class="pf-kpi-value pf-red">{{ lossRate }}</div>
        <div class="pf-kpi-label" style="margin-top:8px">时延</div>
        <div class="pf-kpi-value">{{ latencyVal }}</div>
      </div>
    </div>

    <!-- Row 2: Trend charts -->
    <div class="pf-row pf-row-2">
      <div class="pf-card">
        <div class="pf-card-title">时延趋势</div>
        <div class="pf-chart" ref="chartLatencyEl"></div>
      </div>
      <div class="pf-card">
        <div class="pf-card-title">丢包率趋势</div>
        <div class="pf-chart" ref="chartLossEl"></div>
      </div>
    </div>

    <!-- Row 3: PPS & Retransmission -->
    <div class="pf-row pf-row-2">
      <div class="pf-card">
        <div class="pf-card-title">PPS 趋势</div>
        <div class="pf-chart" ref="chartPpsEl"></div>
      </div>
      <div class="pf-card">
        <div class="pf-card-title">重传趋势</div>
        <div class="pf-chart" ref="chartRetransEl"></div>
      </div>
    </div>

    <!-- Row 4: Bandwidth trend -->
    <div class="pf-card pf-full-card">
      <div class="pf-card-title">带宽趋势</div>
      <div class="pf-chart-wide" ref="chartBwEl"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as echarts from 'echarts'
import { api } from '@/api/client'

// KPI refs
const upstreamRate = ref('0 B/s')
const downstreamRate = ref('0 B/s')
const totalConns = ref('0')
const tcpConns = ref('0')
const udpConns = ref('0')
const icmpConns = ref('0')
const ppsVal = ref('0')
const synVal = ref('N/A')
const synAckVal = ref('N/A')
const newConnRate = ref('0')
const lossRate = ref('0%')
const latencyVal = ref('— ms')

// Chart refs
const chartLatencyEl = ref<HTMLElement | null>(null)
const chartLossEl = ref<HTMLElement | null>(null)
const chartPpsEl = ref<HTMLElement | null>(null)
const chartRetransEl = ref<HTMLElement | null>(null)
const chartBwEl = ref<HTMLElement | null>(null)

let latencyChart: echarts.ECharts | null = null
let lossChart: echarts.ECharts | null = null
let ppsChart: echarts.ECharts | null = null
let retransChart: echarts.ECharts | null = null
let bwChart: echarts.ECharts | null = null

// Rolling buffers
const latencyBuf: { t: string; v: number }[] = []
const lossBuf: { t: string; v: number }[] = []
const ppsBuf: { t: string; v: number }[] = []
const retransBuf: { t: string; v: number }[] = []
const bwUpBuf: { t: string; v: number }[] = []
const bwDownBuf: { t: string; v: number }[] = []

let prevPkts = 0
let prevTs = 0
let timer: any = null

function fmtRate(b: number): string {
  if (b >= 1e9) return (b / 1e9).toFixed(1) + ' Gbps'
  if (b >= 1e6) return (b / 1e6).toFixed(1) + ' Mbps'
  if (b >= 1e3) return (b / 1e3).toFixed(1) + ' Kbps'
  return b.toFixed(0) + ' bps'
}
function fmtNum(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return String(Math.round(n))
}
function tsLabel(): string {
  return new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function initChart(el: HTMLElement, color: string, yName = ''): echarts.ECharts {
  const c = echarts.init(el)
  c.setOption({
    animation: true,
    tooltip: { trigger: 'axis' },
    grid: { left: 55, right: 16, top: 20, bottom: 28 },
    xAxis: { type: 'category', data: [], axisLabel: { fontSize: 10 }, boundaryGap: false },
    yAxis: { type: 'value', name: yName, nameTextStyle: { fontSize: 10 }, axisLabel: { fontSize: 10 }, splitLine: { lineStyle: { type: 'dashed' } } },
    series: [{ type: 'line', data: [], smooth: true, symbol: 'none', areaStyle: { opacity: 0.3, color }, itemStyle: { color }, lineStyle: { width: 1.5 } }],
  })
  return c
}

function initDualChart(el: HTMLElement): echarts.ECharts {
  const c = echarts.init(el)
  c.setOption({
    animation: true,
    tooltip: { trigger: 'axis' },
    legend: { data: ['上行', '下行'], bottom: 0, textStyle: { fontSize: 11 } },
    grid: { left: 55, right: 16, top: 15, bottom: 36 },
    xAxis: { type: 'category', data: [], axisLabel: { fontSize: 10 }, boundaryGap: false },
    yAxis: { type: 'value', axisLabel: { fontSize: 10 }, splitLine: { lineStyle: { type: 'dashed' } } },
    series: [
      { name: '上行', type: 'line', data: [], smooth: true, symbol: 'none', areaStyle: { opacity: 0.2, color: '#2a88e6' }, itemStyle: { color: '#2a88e6' }, lineStyle: { width: 1.5 } },
      { name: '下行', type: 'line', data: [], smooth: true, symbol: 'none', areaStyle: { opacity: 0.2, color: '#52c41a' }, itemStyle: { color: '#52c41a' }, lineStyle: { width: 1.5 } },
    ],
  })
  return c
}

function updateChart(c: echarts.ECharts, buf: { t: string; v: number }[]) {
  c.setOption({
    xAxis: { data: buf.map(p => p.t), axisLabel: { interval: Math.floor(buf.length / 5) } },
    series: [{ data: buf.map(p => p.v) }],
  })
}

function updateDualChart(c: echarts.ECharts, upBuf: { t: string; v: number }[], downBuf: { t: string; v: number }[]) {
  const labels = upBuf.map(p => p.t)
  c.setOption({
    xAxis: { data: labels, axisLabel: { interval: Math.floor(labels.length / 5) } },
    series: [{ data: upBuf.map(p => p.v) }, { data: downBuf.map(p => p.v) }],
  })
}

async function refresh() {
  try {
    // On first call, fetch more history so charts are pre-filled immediately.
    const isFirst = ppsBuf.length === 0
    const bwSeconds = isFirst ? 60 : 10

    const [statsResp, bwResp] = await Promise.all([
      api.stats().catch(() => ({} as any)),
      api.trafficBandwidth(bwSeconds).catch(() => [] as any[]),
    ])
    const s: any = statsResp || {}
    const samples: any[] = Array.isArray(bwResp) ? bwResp : []
    const last = samples.length ? samples[samples.length - 1] : null

    // KPIs
    const bytesOut = last ? (last.bytes_out || 0) * 8 : 0
    const bytesIn = last ? (last.bytes_in || 0) * 8 : 0
    upstreamRate.value = fmtRate(bytesOut)
    downstreamRate.value = fmtRate(bytesIn)
    const flowCount = Number(s.capture_flow_count || 0)
    const tcpPkts = Number(s.tcp_packets || 0)
    const udpPkts = Number(s.udp_packets || 0)
    const icmpPkts = Number(s.icmp_packets || 0)
    const totalPkts = tcpPkts + udpPkts + icmpPkts
    totalConns.value = fmtNum(flowCount)
    // Estimate per-protocol active connections by packet ratio
    if (totalPkts > 0) {
      tcpConns.value = fmtNum(Math.round(flowCount * tcpPkts / totalPkts))
      udpConns.value = fmtNum(Math.round(flowCount * udpPkts / totalPkts))
      icmpConns.value = fmtNum(Math.round(flowCount * icmpPkts / totalPkts))
    } else {
      tcpConns.value = '0'
      udpConns.value = '0'
      icmpConns.value = '0'
    }

    const pps = last ? (last.pkts_in || 0) + (last.pkts_out || 0) : 0
    ppsVal.value = fmtNum(pps)
    synVal.value = fmtNum(Number(s.syn_count || 0))
    synAckVal.value = fmtNum(Number(s.synack_count || 0))
    // New connection rate: SYN packets per second (approximation)
    const synTotal = Number(s.syn_count || 0)
    const uptimeSec = Math.max(Number(s.heartbeats || 1), 1)
    newConnRate.value = fmtNum(Math.round(synTotal / uptimeSec))
    lossRate.value = s.loss_rate != null ? (Number(s.loss_rate) * 100).toFixed(2) + '%' : '0%'
    latencyVal.value = s.avg_latency != null ? Number(s.avg_latency).toFixed(2) + ' ms' : '— ms'

    // Pre-fill rolling buffers from historical bandwidth samples on first load
    if (isFirst && samples.length > 1) {
      for (const sample of samples) {
        const ts = new Date(sample.ts)
        const t = ts.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        const samplePps = (sample.pkts_in || 0) + (sample.pkts_out || 0)
        const sampleBpsUp = (sample.bytes_out || 0) * 8
        const sampleBpsDown = (sample.bytes_in || 0) * 8
        ppsBuf.push({ t, v: samplePps })
        bwUpBuf.push({ t, v: sampleBpsUp / 1e6 })
        bwDownBuf.push({ t, v: sampleBpsDown / 1e6 })
        // latency/loss/retrans not available per-sample, fill with 0
        latencyBuf.push({ t, v: 0 })
        lossBuf.push({ t, v: 0 })
        retransBuf.push({ t, v: 0 })
      }
    } else {
      // Incremental update
      const t = tsLabel()
      const latency = Number(s.avg_latency || 0)
      const loss = Number(s.loss_rate || 0) * 100
      const retrans = 0 // retransmission tracking not yet available

      latencyBuf.push({ t, v: latency }); if (latencyBuf.length > 60) latencyBuf.shift()
      lossBuf.push({ t, v: loss }); if (lossBuf.length > 60) lossBuf.shift()
      ppsBuf.push({ t, v: pps }); if (ppsBuf.length > 60) ppsBuf.shift()
      retransBuf.push({ t, v: retrans }); if (retransBuf.length > 60) retransBuf.shift()
      bwUpBuf.push({ t, v: bytesOut / 1e6 }); if (bwUpBuf.length > 60) bwUpBuf.shift()
      bwDownBuf.push({ t, v: bytesIn / 1e6 }); if (bwDownBuf.length > 60) bwDownBuf.shift()
    }

    // Update charts
    if (latencyChart) updateChart(latencyChart, latencyBuf)
    if (lossChart) updateChart(lossChart, lossBuf)
    if (ppsChart) updateChart(ppsChart, ppsBuf)
    if (retransChart) updateChart(retransChart, retransBuf)
    if (bwChart) updateDualChart(bwChart, bwUpBuf, bwDownBuf)
  } catch (err) {
    console.error('performance refresh failed', err)
  }
}

function handleResize() {
  latencyChart?.resize()
  lossChart?.resize()
  ppsChart?.resize()
  retransChart?.resize()
  bwChart?.resize()
}

onMounted(() => {
  if (chartLatencyEl.value) latencyChart = initChart(chartLatencyEl.value, '#5470c6', 'ms')
  if (chartLossEl.value) lossChart = initChart(chartLossEl.value, '#f56c6c', '%')
  if (chartPpsEl.value) ppsChart = initChart(chartPpsEl.value, '#fac858', 'pps')
  if (chartRetransEl.value) retransChart = initChart(chartRetransEl.value, '#e6a23c', '%')
  if (chartBwEl.value) bwChart = initDualChart(chartBwEl.value)
  refresh()
  timer = setInterval(refresh, 3000)
  window.addEventListener('resize', handleResize)
})
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  latencyChart?.dispose()
  lossChart?.dispose()
  ppsChart?.dispose()
  retransChart?.dispose()
  bwChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.pf-page {
  padding: 0 4px;
}

.pf-row {
  display: grid;
  gap: 16px;
  margin-bottom: 16px;
}
.pf-row-5 { grid-template-columns: repeat(5, 1fr); }
.pf-row-2 { grid-template-columns: repeat(2, 1fr); }

.pf-card {
  background: #fff;
  border-radius: 6px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  border: 1px solid #e8e8e8;
}
.pf-full-card {
  margin-bottom: 16px;
}
.pf-card-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

/* KPI cards */
.pf-kpi {
  text-align: center;
}
.pf-kpi-label {
  font-size: 12px;
  color: #8c8c8c;
}
.pf-kpi-value {
  font-size: 18px;
  font-weight: 700;
  color: #303133;
  margin-top: 2px;
}
.pf-kpi-value.pf-big { font-size: 22px; }
.pf-blue { color: #2a88e6; }
.pf-green { color: #52c41a; }
.pf-red { color: #f56c6c; }
.pf-kpi-sub {
  display: flex;
  justify-content: space-around;
  margin-top: 6px;
  font-size: 11px;
  color: #8c8c8c;
}
.pf-kpi-sub strong { color: #303133; }

/* Charts */
.pf-chart {
  height: 220px;
  width: 100%;
}
.pf-chart-wide {
  height: 260px;
  width: 100%;
}
</style>
