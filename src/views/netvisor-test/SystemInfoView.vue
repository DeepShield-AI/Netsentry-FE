<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav" role="tablist">
        <button type="button" class="nv-tab active" role="tab" aria-selected="true">系统信息</button>
      </div>
    </div>
    <div class="nv-tabs-body">
      <div class="si-dashboard-scroll">
        <div class="si-charts-stack">
          <!-- 在线用户 -->
          <div class="si-chart-panel" data-chart="online-users">
            <div class="si-panel-head">
              <div class="si-panel-head-left">
                <h3 class="si-panel-title">在线用户</h3>
                <span class="si-panel-current">[<span id="siUsersCurrent">&mdash;</span>]</span>
                <span class="si-panel-stats"></span>
              </div>
              <div class="si-range-tabs" role="tablist" aria-label="时间范围">
                <button type="button" class="si-range-tab" :class="{ active: activeRange === 'realtime' }" @click="activeRange = 'realtime'">实时</button>
                <button type="button" class="si-range-tab" :class="{ active: activeRange === 'day' }" :disabled="historyDisabled" :title="historyDisabled ? '需要 ClickHouse 长期存储' : ''" @click="activeRange = 'day'">日</button>
                <button type="button" class="si-range-tab" :class="{ active: activeRange === 'week' }" :disabled="historyDisabled" :title="historyDisabled ? '需要 ClickHouse 长期存储' : ''" @click="activeRange = 'week'">周</button>
                <button type="button" class="si-range-tab" :class="{ active: activeRange === 'month' }" :disabled="historyDisabled" :title="historyDisabled ? '需要 ClickHouse 长期存储' : ''" @click="activeRange = 'month'">月</button>
              </div>
            </div>
            <div class="si-dual-legend" aria-hidden="true"></div>
            <div class="si-panel-chart">
              <span class="si-yunit">用户数</span>
              <div class="to-chart-plot to-chart-plot-tall si-chart-plot">
                <div class="to-chart-ylabels" aria-hidden="true"></div>
                <svg class="to-chart-svg" aria-hidden="true"></svg>
                <div class="to-chart-xlabels"></div>
              </div>
            </div>
          </div>

          <!-- 连接新建 -->
          <div class="si-chart-panel" data-chart="new-connections">
            <div class="si-panel-head">
              <div class="si-panel-head-left">
                <h3 class="si-panel-title">连接新建</h3>
                <span class="si-panel-current">[<span id="siNewConnCurrent">&mdash;</span>]</span>
                <span class="si-panel-stats"></span>
              </div>
              <div class="si-range-tabs" role="tablist" aria-label="时间范围">
                <button type="button" class="si-range-tab" :class="{ active: activeRange === 'realtime' }" @click="activeRange = 'realtime'">实时</button>
                <button type="button" class="si-range-tab" :class="{ active: activeRange === 'day' }" :disabled="historyDisabled" :title="historyDisabled ? '需要 ClickHouse 长期存储' : ''" @click="activeRange = 'day'">日</button>
                <button type="button" class="si-range-tab" :class="{ active: activeRange === 'week' }" :disabled="historyDisabled" :title="historyDisabled ? '需要 ClickHouse 长期存储' : ''" @click="activeRange = 'week'">周</button>
                <button type="button" class="si-range-tab" :class="{ active: activeRange === 'month' }" :disabled="historyDisabled" :title="historyDisabled ? '需要 ClickHouse 长期存储' : ''" @click="activeRange = 'month'">月</button>
              </div>
            </div>
            <div class="si-dual-legend" aria-hidden="true"></div>
            <div class="si-panel-chart">
              <span class="si-yunit">Session/s</span>
              <div class="to-chart-plot to-chart-plot-tall si-chart-plot">
                <div class="to-chart-ylabels" aria-hidden="true"></div>
                <svg class="to-chart-svg" aria-hidden="true"></svg>
                <div class="to-chart-xlabels"></div>
              </div>
            </div>
          </div>

          <!-- 网络PPS -->
          <div class="si-chart-panel" data-chart="network-pps">
            <div class="si-panel-head">
              <div class="si-panel-head-left">
                <h3 class="si-panel-title">网络PPS</h3>
                <span class="si-panel-current">[<span id="siNetworkPpsCurrent">&mdash;</span>]</span>
                <span class="si-panel-stats"></span>
              </div>
              <div class="si-range-tabs" role="tablist" aria-label="时间范围">
                <button type="button" class="si-range-tab" :class="{ active: activeRange === 'realtime' }" @click="activeRange = 'realtime'">实时</button>
                <button type="button" class="si-range-tab" :class="{ active: activeRange === 'day' }" :disabled="historyDisabled" :title="historyDisabled ? '需要 ClickHouse 长期存储' : ''" @click="activeRange = 'day'">日</button>
                <button type="button" class="si-range-tab" :class="{ active: activeRange === 'week' }" :disabled="historyDisabled" :title="historyDisabled ? '需要 ClickHouse 长期存储' : ''" @click="activeRange = 'week'">周</button>
                <button type="button" class="si-range-tab" :class="{ active: activeRange === 'month' }" :disabled="historyDisabled" :title="historyDisabled ? '需要 ClickHouse 长期存储' : ''" @click="activeRange = 'month'">月</button>
              </div>
            </div>
            <div class="si-panel-chart">
              <span class="si-yunit">PPS</span>
              <div class="to-chart-plot to-chart-plot-tall si-chart-plot">
                <div class="to-chart-ylabels" aria-hidden="true"></div>
                <svg class="to-chart-svg" aria-hidden="true"></svg>
                <div class="to-chart-xlabels"></div>
              </div>
            </div>
          </div>

          <!-- SYN PPS -->
          <div class="si-chart-panel" data-chart="syn-pps">
            <div class="si-panel-head">
              <div class="si-panel-head-left">
                <h3 class="si-panel-title">SYN PPS</h3>
                <span class="si-panel-current">[<span id="siSynPpsCurrent">&mdash;</span>]</span>
                <span class="si-panel-stats"></span>
              </div>
              <div class="si-range-tabs" role="tablist" aria-label="时间范围">
                <button type="button" class="si-range-tab" :class="{ active: activeRange === 'realtime' }" @click="activeRange = 'realtime'">实时</button>
                <button type="button" class="si-range-tab" :class="{ active: activeRange === 'day' }" :disabled="historyDisabled" :title="historyDisabled ? '需要 ClickHouse 长期存储' : ''" @click="activeRange = 'day'">日</button>
                <button type="button" class="si-range-tab" :class="{ active: activeRange === 'week' }" :disabled="historyDisabled" :title="historyDisabled ? '需要 ClickHouse 长期存储' : ''" @click="activeRange = 'week'">周</button>
                <button type="button" class="si-range-tab" :class="{ active: activeRange === 'month' }" :disabled="historyDisabled" :title="historyDisabled ? '需要 ClickHouse 长期存储' : ''" @click="activeRange = 'month'">月</button>
              </div>
            </div>
            <div class="si-panel-chart">
              <span class="si-yunit">PPS</span>
              <div class="to-chart-plot to-chart-plot-tall si-chart-plot">
                <div class="to-chart-ylabels" aria-hidden="true"></div>
                <svg class="to-chart-svg" aria-hidden="true"></svg>
                <div class="to-chart-xlabels"></div>
              </div>
            </div>
          </div>

          <!-- SYNACK PPS -->
          <div class="si-chart-panel" data-chart="syn-ack-pps">
            <div class="si-panel-head">
              <div class="si-panel-head-left">
                <h3 class="si-panel-title">SYNACK PPS</h3>
                <span class="si-panel-current">[<span id="siSynAckPpsCurrent">&mdash;</span>]</span>
                <span class="si-panel-stats"></span>
              </div>
              <div class="si-range-tabs" role="tablist" aria-label="时间范围">
                <button type="button" class="si-range-tab" :class="{ active: activeRange === 'realtime' }" @click="activeRange = 'realtime'">实时</button>
                <button type="button" class="si-range-tab" :class="{ active: activeRange === 'day' }" :disabled="historyDisabled" :title="historyDisabled ? '需要 ClickHouse 长期存储' : ''" @click="activeRange = 'day'">日</button>
                <button type="button" class="si-range-tab" :class="{ active: activeRange === 'week' }" :disabled="historyDisabled" :title="historyDisabled ? '需要 ClickHouse 长期存储' : ''" @click="activeRange = 'week'">周</button>
                <button type="button" class="si-range-tab" :class="{ active: activeRange === 'month' }" :disabled="historyDisabled" :title="historyDisabled ? '需要 ClickHouse 长期存储' : ''" @click="activeRange = 'month'">月</button>
              </div>
            </div>
            <div class="si-panel-chart">
              <span class="si-yunit">PPS</span>
              <div class="to-chart-plot to-chart-plot-tall si-chart-plot">
                <div class="to-chart-ylabels" aria-hidden="true"></div>
                <svg class="to-chart-svg" aria-hidden="true"></svg>
                <div class="to-chart-xlabels"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import * as echarts from 'echarts'
import { api } from '@/api/client'

// Time range selector shared across all panels.
type Range = 'realtime' | 'day' | 'week' | 'month'
const activeRange = ref<Range>('realtime')
const historyDisabled = ref(false) // CH not configured

// Persist chart instances across refreshes; ECharts will diff + animate
// data updates smoothly instead of flashing the whole panel each tick.
const charts: Map<string, echarts.ECharts> = new Map()
let timer: any = null

function fmtNum(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return String(Math.round(n))
}
function setText(id: string, text: string) {
  const el = document.getElementById(id)
  if (el) el.textContent = text
}
function tsToLabel(ts: string): string {
  const d = new Date(ts)
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function renderAreaChart(id: string, container: HTMLElement, xData: string[], yData: number[], color: string) {
  let c = charts.get(id)
  if (!c) {
    c = echarts.init(container)
    c.setOption({
      animation: true,
      animationDuration: 300,
      animationDurationUpdate: 500,
      animationEasingUpdate: 'cubicOut',
      tooltip: { trigger: 'axis' },
      grid: { left: 55, right: 15, top: 15, bottom: 30 },
      xAxis: { type: 'category', data: [], axisLabel: { fontSize: 10 } },
      yAxis: { type: 'value', axisLabel: { fontSize: 10 }, splitLine: { lineStyle: { type: 'dashed' } } },
      series: [{ type: 'line', data: [], smooth: true, symbol: 'none', areaStyle: { opacity: 0.3, color }, itemStyle: { color }, lineStyle: { width: 1.5 } }],
    })
    charts.set(id, c)
  }
  c.setOption({
    xAxis: { data: xData, axisLabel: { interval: Math.floor(xData.length / 6) } },
    series: [{ data: yData }],
  })
}

// Track cumulative counters across polls to derive true per-second rates.
let prevFlows = 0
let prevPkts = 0
let prevTs = 0
// Rolling client-side buffer for rate-derived series (backend only exposes
// 300s bandwidth samples, no history for flow/user rates yet).
const MAX_POINTS = 300
const usersSeries: { t: string; v: number }[] = []
const newConnSeries: { t: string; v: number }[] = []
const ppsSeries: { t: string; v: number }[] = []

function pushSeries(buf: { t: string; v: number }[], t: string, v: number) {
  buf.push({ t, v })
  if (buf.length > MAX_POINTS) buf.shift()
}

async function refresh() {
  try {
    const [bwResp, statsResp, onlineUsersResp] = await Promise.all([
      api.trafficBandwidth(300).catch(() => [] as any[]),
      api.stats().catch(() => ({} as any)),
      api.trafficOnlineUsers().catch(() => [] as any[]),
    ])

    const samples: any[] = Array.isArray(bwResp) ? bwResp : []
    const online: any[] = Array.isArray(onlineUsersResp) ? onlineUsersResp : []
    const s: any = statsResp || {}

    // ─── 在线用户 ──────────────────────────────────────────────────────────
    // Definition: distinct IPs seen on the wire within the last 5 minutes
    // (trafficstats.Aggregator user TTL). Sourced from /traffic/online-users.
    const usersCurrent = online.length

    // ─── 连接新建/s ────────────────────────────────────────────────────────
    // Rate derived from delta of the cumulative `flows` counter (finalized
    // flow count) between refresh calls. First poll shows 0 until we have
    // a baseline.
    const nowSec = Date.now() / 1000
    const flowsCum = Number(s.flows || 0)
    const pktsCum = Number(s.packets || 0)
    let newConnRate = 0
    let netPps = 0
    if (prevTs > 0) {
      const dt = Math.max(nowSec - prevTs, 1)
      newConnRate = Math.max(0, (flowsCum - prevFlows) / dt)
      netPps = Math.max(0, (pktsCum - prevPkts) / dt)
    } else {
      // Fall back to bandwidth-sample PPS on first frame.
      const last = samples.length ? samples[samples.length - 1] : null
      netPps = last ? (last.pkts_in || 0) + (last.pkts_out || 0) : 0
    }
    prevTs = nowSec
    prevFlows = flowsCum
    prevPkts = pktsCum

    // ─── 网络PPS ──────────────────────────────────────────────────────────
    // Total packets/second observed on the capture NIC (heartbeat-delta
    // driven; accurate). Same value shown on 流量概况 → PPS card.

    // Update current values
    setText('siUsersCurrent', fmtNum(usersCurrent))
    setText('siNewConnCurrent', fmtNum(newConnRate))
    setText('siNetworkPpsCurrent', fmtNum(netPps))
    // SYN / SYNACK counters are not tracked by the capture pipeline today.
    setText('siSynPpsCurrent', 'N/A')
    setText('siSynAckPpsCurrent', 'N/A')

    // Push into client-side rolling buffers (rates only — bandwidth samples
    // give us their own 300-point history so we don't need to buffer PPS).
    const nowLabel = tsToLabel(new Date().toISOString())
    pushSeries(usersSeries, nowLabel, usersCurrent)
    pushSeries(newConnSeries, nowLabel, newConnRate)
    pushSeries(ppsSeries, nowLabel, netPps)

    // Render charts (incremental — no dispose, ECharts diffs data & animates)
    const bwLabels = samples.map((x: any) => tsToLabel(x.ts))
    const bwPps = samples.map((x: any) => (x.pkts_in || 0) + (x.pkts_out || 0))

    if (usersSeries.length) {
      const el = document.querySelector('[data-chart="online-users"] .to-chart-plot-tall')
      if (el) renderAreaChart('online-users', el as HTMLElement, usersSeries.map(p => p.t), usersSeries.map(p => p.v), '#5470c6')
    }
    if (newConnSeries.length) {
      const el = document.querySelector('[data-chart="new-connections"] .to-chart-plot-tall')
      if (el) renderAreaChart('new-connections', el as HTMLElement, newConnSeries.map(p => p.t), newConnSeries.map(p => p.v), '#91cc75')
    }
    {
      const el = document.querySelector('[data-chart="network-pps"] .to-chart-plot-tall')
      if (el) {
        if (samples.length) renderAreaChart('network-pps', el as HTMLElement, bwLabels, bwPps, '#fac858')
        else if (ppsSeries.length) renderAreaChart('network-pps', el as HTMLElement, ppsSeries.map(p => p.t), ppsSeries.map(p => p.v), '#fac858')
      }
    }
    // SYN / SYNACK panels: no data source in this build.
    for (const key of ['syn-pps', 'syn-ack-pps']) {
      const el = document.querySelector(`[data-chart="${key}"] .to-chart-plot-tall`)
      if (el) (el as HTMLElement).innerHTML = '<div style="grid-column:1/-1;grid-row:1;display:flex;align-items:center;justify-content:center;color:#909399;font-size:12px">当前构建未采集 TCP 标志位统计</div>'
    }
  } catch (err) {
    console.error('system-info refresh failed', err)
  }
}

function fmtHistoryLabel(ts: string, range: Range): string {
  const d = new Date(ts)
  if (range === 'day') {
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  if (range === 'week') {
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }
  // month
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}h`
}

async function refreshHistory(range: 'day' | 'week' | 'month') {
  try {
    const resp = await api.historyTraffic(range)
    if (resp?.disabled) {
      historyDisabled.value = true
      // Fall back to realtime silently.
      activeRange.value = 'realtime'
      return
    }
    const items = resp?.items || []
    const labels = items.map(it => fmtHistoryLabel(it.timestamp, range))
    const usersData = items.map(it => it.online_users)
    const newConnData = items.map(it => Math.round(it.new_conns / 60)) // per-minute → per-second
    const ppsData = items.map(it => it.avg_pps)

    // Current values = the latest bucket
    const last = items.length ? items[items.length - 1] : null
    setText('siUsersCurrent', fmtNum(last?.online_users || 0))
    setText('siNewConnCurrent', fmtNum(last ? last.new_conns / 60 : 0))
    setText('siNetworkPpsCurrent', fmtNum(last?.avg_pps || 0))
    setText('siSynPpsCurrent', 'N/A')
    setText('siSynAckPpsCurrent', 'N/A')

    if (items.length) {
      const uEl = document.querySelector('[data-chart="online-users"] .to-chart-plot-tall')
      if (uEl) renderAreaChart('online-users', uEl as HTMLElement, labels, usersData, '#5470c6')
      const cEl = document.querySelector('[data-chart="new-connections"] .to-chart-plot-tall')
      if (cEl) renderAreaChart('new-connections', cEl as HTMLElement, labels, newConnData, '#91cc75')
      const pEl = document.querySelector('[data-chart="network-pps"] .to-chart-plot-tall')
      if (pEl) renderAreaChart('network-pps', pEl as HTMLElement, labels, ppsData, '#fac858')
    }
    for (const key of ['syn-pps', 'syn-ack-pps']) {
      const el = document.querySelector(`[data-chart="${key}"] .to-chart-plot-tall`)
      if (el) (el as HTMLElement).innerHTML = '<div style="grid-column:1/-1;grid-row:1;display:flex;align-items:center;justify-content:center;color:#909399;font-size:12px">当前构建未采集 TCP 标志位统计</div>'
    }
  } catch (err) {
    console.error('system-info history refresh failed', err)
  }
}

function tick() {
  if (activeRange.value === 'realtime') {
    refresh()
  } else {
    refreshHistory(activeRange.value)
  }
}

function handleResize() { charts.forEach(c => c.resize()) }

// When range changes, dispose all live charts (x-axis semantics differ so
// they need to be re-initialised from scratch), then refresh immediately
// and adjust polling cadence (realtime = 3s, day = 30s, week/month = 5min).
watch(activeRange, (r) => {
  if (timer) clearInterval(timer)
  charts.forEach(c => c.dispose())
  charts.clear()
  tick()
  const cadence = r === 'realtime' ? 3000 : r === 'day' ? 30_000 : 5 * 60_000
  timer = setInterval(tick, cadence)
})

onMounted(() => {
  tick()
  timer = setInterval(tick, 3000)
  window.addEventListener('resize', handleResize)
})
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  charts.forEach(c => c.dispose())
  charts.clear()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.nv-border-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background: #fff;
  overflow: hidden;
}

.nv-tabs-header {
  flex-shrink: 0;
  padding: 0 16px;
  border-bottom: 1px solid #e4e7ed;
  background: #fafafa;
}

.nv-tabs-nav {
  display: flex;
  gap: 0;
}

.nv-tab {
  position: relative;
  padding: 12px 20px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  color: #606266;
  cursor: pointer;
  white-space: nowrap;
}

.nv-tab.active {
  color: #409eff;
}

.nv-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20px;
  right: 20px;
  height: 2px;
  background: #409eff;
  border-radius: 1px 1px 0 0;
}

.nv-tabs-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.si-dashboard-scroll {
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  background: #f0f2f5;
}

.si-charts-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
}

.si-chart-panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.si-panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px 6px;
  flex-shrink: 0;
}

.si-panel-head-left {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px 10px;
  min-width: 0;
}

.si-panel-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #303133;
  white-space: nowrap;
}

.si-panel-current {
  font-size: 14px;
  font-weight: 700;
  color: #409eff;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.si-panel-stats {
  font-size: 12px;
  color: #909399;
  font-weight: 500;
  white-space: nowrap;
}

.si-range-tabs {
  display: inline-flex;
  flex-shrink: 0;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
}

.si-range-tab {
  min-width: 36px;
  padding: 4px 12px;
  border: none;
  background: #fff;
  color: #606266;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
  cursor: pointer;
}

.si-range-tab + .si-range-tab {
  border-left: 1px solid #dcdfe6;
}

.si-range-tab.active {
  background: #409eff;
  color: #fff;
}

.si-range-tab:hover:not(.active):not(:disabled) {
  background: #f5f7fa;
}

.si-range-tab:disabled {
  color: #c0c4cc;
  background: #fafbfc;
  cursor: not-allowed;
}

.si-dual-legend {
  display: flex;
  justify-content: flex-end;
  gap: 14px;
  padding: 0 14px 6px;
  flex-shrink: 0;
}

.si-panel-chart {
  position: relative;
  padding: 0 10px 10px 0;
}

.si-yunit {
  position: absolute;
  left: 14px;
  top: 0;
  z-index: 2;
  font-size: 11px;
  font-weight: 600;
  color: #909399;
  pointer-events: none;
}

.si-chart-plot {
  position: relative;
  padding-top: 14px;
}

.to-chart-plot-tall {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  grid-template-rows: 200px auto;
  column-gap: 10px;
  align-items: stretch;
  contain: layout style;
  padding-top: 14px;
  position: relative;
}

.to-chart-ylabels {
  grid-column: 1;
  grid-row: 1;
  position: relative;
  height: 200px;
}

.to-chart-svg {
  grid-column: 2;
  grid-row: 1;
  width: 100%;
  height: 200px;
  min-width: 0;
}

.to-chart-xlabels {
  grid-column: 2;
  grid-row: 2;
  position: relative;
  height: 28px;
  margin: 0 8px 0 0;
  border-top: 1px solid #c8ccd0;
}
</style>
