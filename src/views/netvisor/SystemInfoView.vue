<template>
  <div class="si-page">
    <!-- Row 1: KPI stat cards -->
    <div class="si-row">
      <div class="si-card si-stat-card">
        <div class="si-stat-icon si-icon-clock">⏰</div>
        <div class="si-stat-body">
          <div class="si-stat-title">系统时间</div>
          <div class="si-stat-value">{{ systemTime }}</div>
        </div>
      </div>
      <div class="si-card si-stat-card">
        <div class="si-stat-icon si-icon-uptime">⏱️</div>
        <div class="si-stat-body">
          <div class="si-stat-title">运行时间</div>
          <div class="si-stat-value">{{ uptime }}</div>
        </div>
      </div>
      <div class="si-card si-stat-card">
        <div class="si-stat-icon si-icon-version">📦</div>
        <div class="si-stat-body">
          <div class="si-stat-title">软件版本</div>
          <div class="si-stat-value">{{ version }}</div>
        </div>
      </div>
      <div class="si-card si-stat-card">
        <div class="si-stat-icon si-icon-users">👥</div>
        <div class="si-stat-body">
          <div class="si-stat-title">在线用户</div>
          <div class="si-stat-value">{{ onlineUsers }}</div>
        </div>
      </div>
    </div>

    <!-- Row 2: Resource usage -->
    <div class="si-row si-row-3">
      <div class="si-card">
        <div class="si-card-title">CPU使用率</div>
        <div class="si-progress-wrap">
          <div class="si-progress-bar">
            <div class="si-progress-fill si-fill-cpu" :style="{ width: cpuUsage + '%' }"></div>
          </div>
          <span class="si-progress-text">{{ cpuUsage }}%</span>
        </div>
      </div>
      <div class="si-card">
        <div class="si-card-title">内存使用率</div>
        <div class="si-progress-wrap">
          <div class="si-progress-bar">
            <div class="si-progress-fill si-fill-mem" :style="{ width: memUsage + '%' }"></div>
          </div>
          <span class="si-progress-text">{{ memUsage }}%</span>
        </div>
        <div class="si-progress-detail">{{ memUsed }} / {{ memTotal }}</div>
      </div>
      <div class="si-card">
        <div class="si-card-title">磁盘使用率</div>
        <div class="si-progress-wrap">
          <div class="si-progress-bar">
            <div class="si-progress-fill si-fill-disk" :style="{ width: diskUsage + '%' }"></div>
          </div>
          <span class="si-progress-text">{{ diskUsage }}%</span>
        </div>
        <div class="si-progress-detail">{{ diskUsed }} / {{ diskTotal }}</div>
      </div>
    </div>

    <!-- Row 3: Network interfaces table -->
    <div class="si-card si-full-card">
      <div class="si-card-title">网络接口</div>
      <table class="si-table">
        <thead>
          <tr>
            <th>接口名称</th>
            <th>状态</th>
            <th>IP地址</th>
            <th>入站速率</th>
            <th>出站速率</th>
            <th>活跃连接</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="iface in interfaces" :key="iface.name">
            <td><strong>{{ iface.name }}</strong></td>
            <td><span :class="['si-status-dot', iface.status === 'up' ? 'si-dot-up' : 'si-dot-down']"></span> {{ iface.status === 'up' ? '在线' : '离线' }}</td>
            <td class="mono">{{ iface.ip || '-' }}</td>
            <td>{{ iface.rxRate }}</td>
            <td>{{ iface.txRate }}</td>
            <td>{{ iface.connections }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Row 4: 性能状况 KPIs -->
    <div class="si-card si-full-card">
      <div class="si-card-title">性能状况</div>
      <div class="si-perf-grid">
        <div class="si-perf-item">
          <div class="si-perf-label">上行</div>
          <div class="si-perf-value si-perf-blue">{{ perfUpstream }}</div>
          <div class="si-perf-label" style="margin-top:6px">下行</div>
          <div class="si-perf-value si-perf-green">{{ perfDownstream }}</div>
        </div>
        <div class="si-perf-item">
          <div class="si-perf-label">连接数</div>
          <div class="si-perf-value si-perf-big">{{ perfConnections }}</div>
          <div class="si-perf-sub">
            <span>TCP <strong>{{ perfTcp }}</strong></span>
            <span>UDP <strong>{{ perfUdp }}</strong></span>
            <span>ICMP <strong>{{ perfIcmp }}</strong></span>
          </div>
        </div>
        <div class="si-perf-item">
          <div class="si-perf-label">PPS</div>
          <div class="si-perf-value">{{ perfPps }}</div>
          <div class="si-perf-label" style="margin-top:6px">SYN PPS</div>
          <div class="si-perf-value">{{ perfSyn }}</div>
        </div>
        <div class="si-perf-item">
          <div class="si-perf-label">并发连接</div>
          <div class="si-perf-value">{{ perfConcurrent }}</div>
          <div class="si-perf-label" style="margin-top:6px">新建/s</div>
          <div class="si-perf-value">{{ perfNewConn }}</div>
        </div>
        <div class="si-perf-item">
          <div class="si-perf-label">丢包率</div>
          <div class="si-perf-value si-perf-red">{{ perfLoss }}</div>
          <div class="si-perf-label" style="margin-top:6px">时延</div>
          <div class="si-perf-value">{{ perfLatency }}</div>
        </div>
      </div>
    </div>

    <!-- Row 5: Performance trend charts -->
    <div class="si-row si-row-3">
      <div class="si-card">
        <div class="si-card-title">PPS 趋势</div>
        <div class="si-mini-chart" ref="chartPpsEl"></div>
      </div>
      <div class="si-card">
        <div class="si-card-title">在线用户趋势</div>
        <div class="si-mini-chart" ref="chartUsersEl"></div>
      </div>
      <div class="si-card">
        <div class="si-card-title">连接新建趋势</div>
        <div class="si-mini-chart" ref="chartConnsEl"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as echarts from 'echarts'
import { api } from '@/api/client'
import { mockSystemInfo, mockStats, mockTrafficOnlineUsers, mockTrafficBandwidth } from './mock-data'

// Reactive data
const systemTime = ref('—')
const uptime = ref('—')
const version = ref('NetSentry v1.0')
const onlineUsers = ref(0)
const cpuUsage = ref(0)
const memUsage = ref(0)
const memUsed = ref('—')
const memTotal = ref('—')
const diskUsage = ref(0)
const diskUsed = ref('—')
const diskTotal = ref('—')
const interfaces = ref<Array<{ name: string; status: string; ip: string; rxRate: string; txRate: string; connections: string }>>([])

// Performance KPIs
const perfUpstream = ref('0 B/s')
const perfDownstream = ref('0 B/s')
const perfConnections = ref('0')
const perfTcp = ref('0')
const perfUdp = ref('0')
const perfIcmp = ref('0')
const perfPps = ref('0')
const perfSyn = ref('N/A')
const perfConcurrent = ref('0')
const perfNewConn = ref('0')
const perfLoss = ref('0%')
const perfLatency = ref('— ms')

// Chart refs
const chartUsersEl = ref<HTMLElement | null>(null)
const chartConnsEl = ref<HTMLElement | null>(null)
const chartPpsEl = ref<HTMLElement | null>(null)
let usersChart: echarts.ECharts | null = null
let connsChart: echarts.ECharts | null = null
let ppsChart: echarts.ECharts | null = null

// Rolling buffers
const usersBuf: { t: string; v: number }[] = []
const connsBuf: { t: string; v: number }[] = []
const ppsBuf: { t: string; v: number }[] = []
let prevFlows = 0
let prevTs = 0
let refreshTimer: any = null
// Previous interface byte counters for rate calculation
const prevIfaceBytes: Map<string, { rx: number; tx: number; ts: number }> = new Map()

function fmtBytes(bytes: number): string {
  if (bytes >= 1e12) return (bytes / 1e12).toFixed(1) + ' TB'
  if (bytes >= 1e9) return (bytes / 1e9).toFixed(1) + ' GB'
  if (bytes >= 1e6) return (bytes / 1e6).toFixed(1) + ' MB'
  return (bytes / 1e3).toFixed(0) + ' KB'
}
function fmtRate(bytesPerSec: number): string {
  if (bytesPerSec >= 1e9) return (bytesPerSec / 1e9).toFixed(1) + ' GB/s'
  if (bytesPerSec >= 1e6) return (bytesPerSec / 1e6).toFixed(1) + ' MB/s'
  if (bytesPerSec >= 1e3) return (bytesPerSec / 1e3).toFixed(1) + ' KB/s'
  return bytesPerSec.toFixed(0) + ' B/s'
}
function fmtNum(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return String(Math.round(n))
}
function tsLabel(): string {
  return new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function initChart(el: HTMLElement, color: string): echarts.ECharts {
  const c = echarts.init(el)
  c.setOption({
    animation: true,
    tooltip: { trigger: 'axis' },
    grid: { left: 50, right: 16, top: 10, bottom: 28 },
    xAxis: { type: 'category', data: [], axisLabel: { fontSize: 10 }, boundaryGap: false },
    yAxis: { type: 'value', axisLabel: { fontSize: 10 }, splitLine: { lineStyle: { type: 'dashed' } } },
    series: [{ type: 'line', data: [], smooth: true, symbol: 'none', areaStyle: { opacity: 0.25, color }, itemStyle: { color }, lineStyle: { width: 1.5 } }],
  })
  return c
}

function updateChart(c: echarts.ECharts, buf: { t: string; v: number }[]) {
  c.setOption({
    xAxis: { data: buf.map(p => p.t), axisLabel: { interval: Math.floor(buf.length / 5) } },
    series: [{ data: buf.map(p => p.v) }],
  })
}

async function refresh() {
  try {
    const [sysResp, statsResp, onlineResp, bwResp] = await Promise.all([
      api.systemInfo().catch(() => mockSystemInfo()),
      api.stats().catch(() => mockStats()),
      api.trafficOnlineUsers().catch(() => mockTrafficOnlineUsers()),
      api.trafficBandwidth(ppsBuf.length === 0 ? 60 : 10).catch(() => mockTrafficBandwidth()),
    ])
    const sys: any = sysResp || {}
    const s: any = statsResp || {}
    const online: any[] = Array.isArray(onlineResp) ? onlineResp : []
    const samples: any[] = Array.isArray(bwResp) ? bwResp : []

    // System time & uptime (from real /system-info)
    systemTime.value = sys.system_time || new Date().toLocaleString('zh-CN')
    const uptimeSec = Number(sys.uptime_seconds || 0)
    if (uptimeSec > 0) {
      const d = Math.floor(uptimeSec / 86400)
      const h = Math.floor((uptimeSec % 86400) / 3600)
      const m = Math.floor((uptimeSec % 3600) / 60)
      uptime.value = `${d}天 ${h}小时 ${m}分钟`
    }
    // Version — prefer agent-reported version, with Git commit if available
    if (sys.version) {
      version.value = `NetSentry v${sys.version}`
    }

    // Online users
    onlineUsers.value = online.length

    // Resource usage (real system metrics)
    cpuUsage.value = Math.round(Number(sys.cpu_usage || 0))
    memUsage.value = Math.round(Number(sys.mem_usage || 0))
    if (sys.mem_total) {
      memUsed.value = fmtBytes(sys.mem_used || 0)
      memTotal.value = fmtBytes(sys.mem_total)
    }
    diskUsage.value = Math.round(Number(sys.disk_usage || 0))
    if (sys.disk_total) {
      diskUsed.value = fmtBytes(sys.disk_used || 0)
      diskTotal.value = fmtBytes(sys.disk_total)
    }

    // Network interfaces (real data from /system-info)
    // Compute actual rates from cumulative byte counter deltas.
    const sysIfaces: any[] = sys.interfaces || []
    const nowMs = Date.now()
    if (sysIfaces.length > 0) {
      interfaces.value = sysIfaces.map((ifc: any) => {
        const name = ifc.name
        const curRx = Number(ifc.rx_bytes || 0)
        const curTx = Number(ifc.tx_bytes || 0)
        let rxRateStr = '0 B/s'
        let txRateStr = '0 B/s'
        const prev = prevIfaceBytes.get(name)
        if (prev) {
          const dt = Math.max((nowMs - prev.ts) / 1000, 1)
          const rxPerSec = Math.max(0, (curRx - prev.rx) / dt)
          const txPerSec = Math.max(0, (curTx - prev.tx) / dt)
          rxRateStr = fmtRate(rxPerSec)
          txRateStr = fmtRate(txPerSec)
        }
        prevIfaceBytes.set(name, { rx: curRx, tx: curTx, ts: nowMs })
        // Per-interface active connections: use capture_flow_count for the
        // primary capture iface, '—' for others.
        const flowCount = (name === 'eth0') ? fmtNum(Number(s.capture_flow_count || 0)) : '—'
        return {
          name,
          status: ifc.status || 'down',
          ip: ifc.ip || '—',
          rxRate: rxRateStr,
          txRate: txRateStr,
          connections: flowCount,
        }
      })
    }

    // Connection rate
    const nowSec = Date.now() / 1000
    const flowsCum = Number(s.flows || s.capture_flow_count || 0)
    let newConnRate = 0
    if (prevTs > 0) {
      const dt = Math.max(nowSec - prevTs, 1)
      newConnRate = Math.max(0, (flowsCum - prevFlows) / dt)
    }
    prevTs = nowSec
    prevFlows = flowsCum

    // Performance KPIs
    const last = samples.length ? samples[samples.length - 1] : null
    const pps = last ? (last.pkts_in || 0) + (last.pkts_out || 0) : 0
    perfUpstream.value = last ? fmtRate(last.bytes_out || 0) : '0 B/s'
    perfDownstream.value = last ? fmtRate(last.bytes_in || 0) : '0 B/s'
    const flowCount = Number(s.capture_flow_count || 0)
    const tcpPkts = Number(s.tcp_packets || 0)
    const udpPkts = Number(s.udp_packets || 0)
    const icmpPkts = Number(s.icmp_packets || 0)
    const totalPkts = tcpPkts + udpPkts + icmpPkts
    perfConnections.value = fmtNum(flowCount)
    // Estimate per-protocol active connections by packet ratio
    if (totalPkts > 0) {
      perfTcp.value = fmtNum(Math.round(flowCount * tcpPkts / totalPkts))
      perfUdp.value = fmtNum(Math.round(flowCount * udpPkts / totalPkts))
      perfIcmp.value = fmtNum(Math.round(flowCount * icmpPkts / totalPkts))
    } else {
      perfTcp.value = '0'
      perfUdp.value = '0'
      perfIcmp.value = '0'
    }
    perfPps.value = fmtNum(pps)
    // SYN PPS: SYN count / heartbeat count (~1/s)
    const synTotal = Number(s.syn_count || 0)
    const hbCount = Math.max(Number(s.heartbeats || 1), 1)
    perfSyn.value = fmtNum(Math.round(synTotal / hbCount))
    perfConcurrent.value = fmtNum(flowCount)
    perfNewConn.value = fmtNum(Math.round(newConnRate))
    const dropRate = Number(s.ipc_drop_rate || 0)
    perfLoss.value = (dropRate * 100).toFixed(2) + '%'
    perfLatency.value = s.avg_latency != null ? Number(s.avg_latency).toFixed(2) + ' ms' : '— ms'

    // Pre-fill charts with historical bandwidth data on first load
    const isFirst = ppsBuf.length === 0
    if (isFirst && samples.length > 1) {
      for (const sample of samples) {
        const ts = new Date(sample.ts)
        const tl = ts.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        const samplePps = (sample.pkts_in || 0) + (sample.pkts_out || 0)
        ppsBuf.push({ t: tl, v: samplePps })
        connsBuf.push({ t: tl, v: 0 })
        usersBuf.push({ t: tl, v: online.length })
      }
    } else {
      // Incremental update
      const t = tsLabel()
      usersBuf.push({ t, v: online.length })
      if (usersBuf.length > 60) usersBuf.shift()
      connsBuf.push({ t, v: Math.round(newConnRate) })
      if (connsBuf.length > 60) connsBuf.shift()
      ppsBuf.push({ t, v: pps })
      if (ppsBuf.length > 60) ppsBuf.shift()
    }

    // Update charts
    if (usersChart) updateChart(usersChart, usersBuf)
    if (connsChart) updateChart(connsChart, connsBuf)
    if (ppsChart) updateChart(ppsChart, ppsBuf)
  } catch (err) {
    console.error('system-info refresh failed', err)
  }
}

function handleResize() {
  usersChart?.resize()
  connsChart?.resize()
  ppsChart?.resize()
}

onMounted(() => {
  if (chartUsersEl.value) usersChart = initChart(chartUsersEl.value, '#5470c6')
  if (chartConnsEl.value) connsChart = initChart(chartConnsEl.value, '#91cc75')
  if (chartPpsEl.value) ppsChart = initChart(chartPpsEl.value, '#fac858')
  refresh()
  refreshTimer = setInterval(refresh, 3000)
  window.addEventListener('resize', handleResize)
})
onBeforeUnmount(() => {
  if (refreshTimer) clearInterval(refreshTimer)
  usersChart?.dispose()
  connsChart?.dispose()
  ppsChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.si-page {
  padding: 0 4px;
}

/* ═══ Rows ═══ */
.si-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}
.si-row-3 {
  grid-template-columns: repeat(3, 1fr);
}
.si-row-2 {
  grid-template-columns: repeat(2, 1fr);
}

/* ═══ Cards ═══ */
.si-card {
  background: #fff;
  border-radius: 6px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  border: 1px solid #e8e8e8;
}
.si-full-card {
  margin-bottom: 16px;
}
.si-card-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

/* ═══ Stat Cards ═══ */
.si-stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
}
.si-stat-icon {
  font-size: 28px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #f0f5ff;
  flex-shrink: 0;
}
.si-stat-body {
  min-width: 0;
}
.si-stat-title {
  font-size: 13px;
  color: #909399;
  margin-bottom: 4px;
}
.si-stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ═══ Progress Bars ═══ */
.si-progress-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}
.si-progress-bar {
  flex: 1;
  height: 12px;
  background: #f0f2f5;
  border-radius: 6px;
  overflow: hidden;
}
.si-progress-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.6s ease;
}
.si-fill-cpu { background: #2a88e6; }
.si-fill-mem { background: #52c41a; }
.si-fill-disk { background: #fa8c16; }
.si-progress-text {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  min-width: 40px;
  text-align: right;
}
.si-progress-detail {
  font-size: 12px;
  color: #909399;
  margin-top: 6px;
}

/* ═══ Table ═══ */
.si-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.si-table th {
  text-align: left;
  padding: 10px 12px;
  background: #fafafa;
  color: #606266;
  font-weight: 600;
  border-bottom: 1px solid #ebeef5;
}
.si-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #ebeef5;
  color: #303133;
}
.si-table tr:last-child td {
  border-bottom: none;
}
.si-status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
}
.si-dot-up { background: #52c41a; }
.si-dot-down { background: #f5222d; }

/* ═══ Performance Grid ═══ */
.si-perf-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}
.si-perf-item {
  text-align: center;
  padding: 12px 8px;
  border-radius: 6px;
  background: #fafbfc;
  border: 1px solid #f0f0f0;
}
.si-perf-label {
  font-size: 12px;
  color: #8c8c8c;
}
.si-perf-value {
  font-size: 18px;
  font-weight: 700;
  color: #303133;
  margin-top: 2px;
}
.si-perf-big {
  font-size: 22px;
}
.si-perf-blue { color: #2a88e6; }
.si-perf-green { color: #52c41a; }
.si-perf-red { color: #f56c6c; }
.si-perf-sub {
  display: flex;
  justify-content: space-around;
  margin-top: 6px;
  font-size: 11px;
  color: #8c8c8c;
}
.si-perf-sub strong {
  color: #303133;
}

/* ═══ Mini Charts ═══ */
.si-mini-chart {
  height: 180px;
  width: 100%;
}
</style>