<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav" role="tablist">
        <button type="button" class="nv-tab" :class="{ active: activeTab === 'traffic' }" role="tab" @click="activeTab = 'traffic'">流量概况</button>
        <button type="button" class="nv-tab" :class="{ active: activeTab === 'performance' }" role="tab" @click="activeTab = 'performance'">性能概况</button>
      </div>
    </div>
    <div class="nv-tabs-body">
      <!-- 性能概况 tab -->
      <div v-if="activeTab === 'performance'" class="to-dashboard-scroll">
        <PerformanceView />
      </div>
      <!-- 流量概况 tab -->
      <div v-show="activeTab === 'traffic'" class="to-dashboard-scroll">
        <div class="to-dashboard">
          <!-- 4 张统计卡 -->
          <div class="to-summary-row-5">
            <div class="to-stat-card-v2 to-stat-v2-traffic">
              <div class="to-stat-v2-icon to-stat-v2-icon-traffic" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false"><path d="M12 2.5c-3.2 3.8-5.5 6.8-5.5 10.2a5.5 5.5 0 1 0 11 0c0-3.4-2.3-6.4-5.5-10.2z" fill="currentColor"/></svg>
              </div>
              <div class="to-stat-v2-body">
                <div class="to-stat-v2-metric">
                  <span class="to-stat-v2-key">当前</span>
                  <span class="to-stat-v2-val" id="toUpstream">&mdash;</span>
                </div>
                <div class="to-stat-v2-metric">
                  <span class="to-stat-v2-key">峰值</span>
                  <span class="to-stat-v2-val" id="toDownstream">&mdash;</span>
                </div>
              </div>
            </div>
            <div class="to-stat-card-v2 to-stat-v2-conn">
              <div class="to-stat-v2-icon to-stat-v2-icon-conn" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <circle cx="6" cy="12" r="2.5" fill="currentColor"/>
                  <circle cx="18" cy="6" r="2.5" fill="currentColor"/>
                  <circle cx="18" cy="18" r="2.5" fill="currentColor"/>
                  <path d="M8.5 11.2 15.2 7.2M8.5 12.8l6.7 4" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/>
                </svg>
              </div>
              <div class="to-stat-v2-body">
                <div class="to-stat-v2-metric to-stat-v2-metric-main">
                  <span class="to-stat-v2-key">连接数</span>
                  <span class="to-stat-v2-val to-stat-v2-val-lg" id="toConnValue">&mdash;</span>
                </div>
                <div class="to-stat-v2-subgrid">
                  <div class="to-stat-v2-sub"><span>TCP</span><strong id="toConnTcp">&mdash;</strong></div>
                  <div class="to-stat-v2-sub"><span>UDP</span><strong id="toConnUdp">&mdash;</strong></div>
                  <div class="to-stat-v2-sub"><span>ICMP</span><strong id="toConnIcmp">&mdash;</strong></div>
                </div>
              </div>
            </div>
            <div class="to-stat-card-v2 to-stat-v2-users">
              <div class="to-stat-v2-icon to-stat-v2-icon-user" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <circle cx="12" cy="8" r="3.5" fill="currentColor"/>
                  <path d="M5 20.5c0-3.6 3.1-6.5 7-6.5s7 2.9 7 6.5" fill="currentColor"/>
                </svg>
              </div>
              <div class="to-stat-v2-body">
                <div class="to-stat-v2-metric">
                  <span class="to-stat-v2-key">当前</span>
                  <span class="to-stat-v2-val" id="toUsersCurrent">&mdash;</span>
                </div>
                <div class="to-stat-v2-metric">
                  <span class="to-stat-v2-key">峰值</span>
                  <span class="to-stat-v2-val" id="toUsersPeak">&mdash;</span>
                </div>
              </div>
            </div>
            <div class="to-stat-card-v2 to-stat-v2-pps">
              <div class="to-stat-v2-icon to-stat-v2-icon-pps" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <path d="M4 14h3v6H4zM10.5 10H14v10h-3.5zM17 6h3v14h-3z" fill="currentColor"/>
                </svg>
              </div>
              <div class="to-stat-v2-body">
                <div class="to-stat-v2-metric">
                  <span class="to-stat-v2-key">PPS</span>
                  <span class="to-stat-v2-val" id="toPpsValue">&mdash;</span>
                </div>
                <div class="to-stat-v2-metric">
                  <span class="to-stat-v2-key">包/流</span>
                  <span class="to-stat-v2-val" id="toSynAckValue">&mdash;</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 图1行：上行趋势 + 流量概况 -->
          <div class="to-chart-row">
            <div class="to-chart-panel to-chart-panel-wide" data-chart="upstream">
              <div class="to-panel-head">
                <div class="to-panel-head-left">
                  <h3 class="to-panel-title">带宽趋势</h3>
                  <span class="to-panel-stats"></span>
                </div>
                <button type="button" class="to-panel-menu" title="更多" aria-label="更多">&#9776;</button>
              </div>
              <div class="to-cat-legend" aria-hidden="true"></div>
              <div class="to-panel-chart to-panel-chart-tall">
                <span class="to-yunit-label">Mbps</span>
                <div class="to-chart-plot to-chart-plot-tall">
                  <div class="to-chart-ylabels" aria-hidden="true"></div>
                  <svg class="to-chart-svg" aria-hidden="true"></svg>
                  <div class="to-chart-xlabels"></div>
                </div>
              </div>
            </div>
            <div class="to-chart-panel to-chart-panel-narrow" data-chart="overview">
              <div class="to-panel-head">
                <div class="to-panel-head-left">
                  <h3 class="to-panel-title">流量概况</h3>
                </div>
                <button type="button" class="to-panel-menu" title="更多" aria-label="更多">&#9776;</button>
              </div>
              <div class="to-combo-legend" aria-hidden="true"></div>
              <div class="to-panel-chart to-panel-chart-combo">
                <div class="to-combo-yaxis">
                  <span class="to-yunit-label to-yunit-left">Mbps</span>
                  <span class="to-yunit-label to-yunit-right">Session#</span>
                </div>
                <div class="to-combo-plot">
                  <div class="to-combo-ylabels-left" aria-hidden="true"></div>
                  <svg class="to-combo-svg" aria-hidden="true"></svg>
                  <div class="to-combo-ylabels-right" aria-hidden="true"></div>
                  <div class="to-combo-xlabels"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 图2行：下行趋势 + 流量分布 -->
          <div class="to-chart-row">
            <div class="to-chart-panel to-chart-panel-wide" data-chart="downstream">
              <div class="to-panel-head">
                <div class="to-panel-head-left">
                  <h3 class="to-panel-title">包速率趋势</h3>
                  <span class="to-panel-stats"></span>
                </div>
                <button type="button" class="to-panel-menu" title="更多" aria-label="更多">&#9776;</button>
              </div>
              <div class="to-cat-legend" aria-hidden="true"></div>
              <div class="to-panel-chart to-panel-chart-tall">
                <span class="to-yunit-label">pps</span>
                <div class="to-chart-plot to-chart-plot-tall">
                  <div class="to-chart-ylabels" aria-hidden="true"></div>
                  <svg class="to-chart-svg" aria-hidden="true"></svg>
                  <div class="to-chart-xlabels"></div>
                </div>
              </div>
            </div>
            <div class="to-chart-panel to-chart-panel-narrow to-chart-panel-pie">
              <div class="to-panel-head">
                <div class="to-panel-head-left">
                  <h3 class="to-panel-title">流量分布</h3>
                </div>
                <button type="button" class="to-panel-menu" title="更多" aria-label="更多">&#9776;</button>
              </div>
              <div class="to-pie-wrap">
                <svg class="to-pie-svg-ref" aria-hidden="true"></svg>
              </div>
            </div>
          </div>

          <!-- 图3行：连接趋势 + 连接分布 -->
          <div class="to-chart-row">
            <div class="to-chart-panel to-chart-panel-wide" data-chart="connections">
              <div class="to-panel-head">
                <div class="to-panel-head-left">
                  <h3 class="to-panel-title">连接趋势</h3>
                  <span class="to-panel-stats"></span>
                </div>
                <button type="button" class="to-panel-menu" title="更多" aria-label="更多">&#9776;</button>
              </div>
              <div class="to-cat-legend" aria-hidden="true"></div>
              <div class="to-panel-chart to-panel-chart-tall">
                <span class="to-yunit-label">Session#</span>
                <div class="to-chart-plot to-chart-plot-tall">
                  <div class="to-chart-ylabels" aria-hidden="true"></div>
                  <svg class="to-chart-svg" aria-hidden="true"></svg>
                  <div class="to-chart-xlabels"></div>
                </div>
              </div>
            </div>
            <div class="to-chart-panel to-chart-panel-narrow to-chart-panel-pie">
              <div class="to-panel-head">
                <div class="to-panel-head-left">
                  <h3 class="to-panel-title">连接分布</h3>
                </div>
                <button type="button" class="to-panel-menu" title="更多" aria-label="更多">&#9776;</button>
              </div>
              <div class="to-pie-wrap">
                <svg class="to-pie-svg-ref" aria-hidden="true"></svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as echarts from 'echarts'
import { api } from '@/api/client'
import PerformanceView from './PerformanceView.vue'

const activeTab = ref<'traffic' | 'performance'>('traffic')

// Keep chart instances alive across refreshes so ECharts can diff & animate
// incrementally (smooth line sliding, bars fading in) instead of the whole
// panel flashing on every tick. Keyed by a stable chart id.
const charts: Map<string, echarts.ECharts> = new Map()
const chartTypes: Map<string, string> = new Map() // tracks chart type (e.g. 'area' vs 'stacked')
let timer: any = null

function fmtBps(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + ' Gbps'
  if (n >= 1e6) return (n / 1e6).toFixed(1) + ' Mbps'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + ' Kbps'
  return n.toFixed(0) + ' bps'
}
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

// Get-or-init an ECharts instance keyed by id. First call installs the
// full option (axes, styles, animation config); subsequent calls only push
// new data via setOption which triggers ECharts' internal diff/animation.
function getChart(id: string, container: HTMLElement, baseOption: any, chartType = 'default'): echarts.ECharts {
  let c = charts.get(id)
  const prevType = chartTypes.get(id)
  // If chart type changed, dispose old instance and recreate.
  if (c && prevType && prevType !== chartType) {
    c.dispose()
    c = undefined
    charts.delete(id)
  }
  if (!c) {
    c = echarts.init(container)
    c.setOption(baseOption)
    charts.set(id, c)
    chartTypes.set(id, chartType)
  }
  return c
}

function upsertAreaChart(id: string, container: HTMLElement, xData: string[], yData: number[], color: string, unit = '') {
  const isMbps = unit === 'Mbps'
  const c = getChart(id, container, {
    animation: true,
    animationDuration: 300,
    animationDurationUpdate: 500,
    animationEasingUpdate: 'cubicOut',
    tooltip: {
      trigger: 'axis',
      valueFormatter: (v: any) => (isMbps ? Number(v).toFixed(2) + ' Mbps' : String(v)),
    },
    grid: { left: 55, right: 15, top: 15, bottom: 30 },
    xAxis: { type: 'category', data: [], axisLabel: { fontSize: 10 } },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 10,
        formatter: isMbps ? (v: number) => v.toFixed(v >= 10 ? 0 : 1) : undefined,
      },
      splitLine: { lineStyle: { type: 'dashed' } },
    },
    series: [{ type: 'line', data: [], smooth: true, symbol: 'none', areaStyle: { opacity: 0.3, color }, itemStyle: { color }, lineStyle: { width: 1.5 } }],
  }, 'area')
  // Only push the changing bits so ECharts animates the transition.
  c.setOption({
    xAxis: { data: xData, axisLabel: { interval: Math.floor(xData.length / 6) } },
    series: [{ data: yData }],
  })
}

// Per-category stacked area chart (used for bandwidth, PPS, and connections).
// unit: 'bps' (default), 'pps', or 'conn'
function upsertStackedAreaChart(
  id: string,
  container: HTMLElement,
  xData: string[],
  categories: Array<{ key: string; label: string; color: string }>,
  seriesData: Record<string, number[]>,
  unit: 'bps' | 'pps' | 'conn' = 'bps',
) {
  const stackId = id // unique stack per chart
  const seriesList = categories.map(cat => ({
    name: cat.label,
    type: 'line' as const,
    stack: stackId,
    data: seriesData[cat.key] || [],
    smooth: true,
    symbol: 'none',
    lineStyle: { width: 0 },
    areaStyle: { opacity: 0.85, color: cat.color },
    itemStyle: { color: cat.color },
    emphasis: { focus: 'series' as const },
  }))
  const legendData = categories.map(c => c.label)

  // Unit-specific formatting helpers
  const fmtVal = (v: number): string => {
    if (unit === 'bps') return fmtBps(v * 1e6) // values are in Mbps
    if (unit === 'pps') {
      if (v >= 1e6) return (v / 1e6).toFixed(1) + ' Mpps'
      if (v >= 1e3) return (v / 1e3).toFixed(1) + ' Kpps'
      return v.toFixed(0) + ' pps'
    }
    // conn
    if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M'
    if (v >= 1e3) return (v / 1e3).toFixed(1) + 'K'
    return v.toFixed(0)
  }
  const yFormatter = (v: number): string => {
    if (unit === 'bps') {
      if (v >= 1e3) return (v / 1e3).toFixed(1) + ' Gbps'
      if (v >= 1) return v.toFixed(1) + ' Mbps'
      if (v >= 0.001) return (v * 1e3).toFixed(0) + ' Kbps'
      return v.toFixed(0)
    }
    if (unit === 'pps') {
      if (v >= 1e6) return (v / 1e6).toFixed(0) + 'M'
      if (v >= 1e3) return (v / 1e3).toFixed(0) + 'K'
      return v.toFixed(0)
    }
    // conn
    if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M'
    if (v >= 1e3) return (v / 1e3).toFixed(0) + 'K'
    return v.toFixed(0)
  }
  const unitLabel = unit === 'bps' ? '合计' : unit === 'pps' ? '合计' : '合计'

  const c = getChart(id, container, {
    animation: true,
    animationDuration: 300,
    animationDurationUpdate: 500,
    animationEasingUpdate: 'cubicOut',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params: any) => {
        if (!Array.isArray(params) || !params.length) return ''
        let html = `<div style="font-size:12px;font-weight:600;margin-bottom:4px">${params[0].axisValue}</div>`
        let total = 0
        const items = params.filter((p: any) => p.value > 0).sort((a: any, b: any) => b.value - a.value)
        items.forEach((p: any) => {
          total += p.value
          html += `<div style="display:flex;align-items:center;gap:6px;font-size:11px;line-height:1.6">`
          html += `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color}"></span>`
          html += `<span style="flex:1">${p.seriesName}</span>`
          html += `<span style="font-weight:600">${fmtVal(p.value)}</span></div>`
        })
        if (items.length > 1) {
          html += `<div style="border-top:1px solid #eee;margin-top:4px;padding-top:4px;font-size:11px;font-weight:700">${unitLabel}: ${fmtVal(total)}</div>`
        }
        return html
      },
    },
    legend: {
      data: legendData,
      type: 'scroll',
      bottom: 0,
      textStyle: { fontSize: 10 },
      itemWidth: 10,
      itemHeight: 8,
      itemGap: 8,
    },
    grid: { left: 70, right: 15, top: 15, bottom: 52 },
    xAxis: { type: 'category', data: [], boundaryGap: false, axisLabel: { fontSize: 10 } },
    yAxis: {
      type: 'value',
      axisLabel: { fontSize: 10, formatter: yFormatter },
      splitLine: { lineStyle: { type: 'dashed' } },
    },
    series: seriesList,
  }, 'stacked-' + unit)

  // Incremental update: push new data.
  const updateSeries = categories.map(cat => ({ data: seriesData[cat.key] || [] }))
  c.setOption({
    xAxis: { data: xData, axisLabel: { interval: Math.floor(xData.length / 6) } },
    series: updateSeries,
  })
}

function upsertComboChart(id: string, container: HTMLElement, xData: string[], bpsData: number[], ppsData: number[]) {
  const c = getChart(id, container, {
    animation: true,
    animationDuration: 300,
    animationDurationUpdate: 500,
    animationEasingUpdate: 'cubicOut',
    tooltip: { trigger: 'axis' },
    legend: { data: ['带宽', '包速率'], top: 0, textStyle: { fontSize: 11 } },
    grid: { left: 50, right: 50, top: 28, bottom: 30 },
    xAxis: { type: 'category', data: [], axisLabel: { fontSize: 9 } },
    yAxis: [
      {
        type: 'value', name: 'Mbps', nameTextStyle: { fontSize: 10 },
        axisLabel: { fontSize: 10, formatter: (v: number) => v.toFixed(v >= 10 ? 0 : 1) },
        splitLine: { lineStyle: { type: 'dashed' } },
      },
      { type: 'value', name: 'PPS', nameTextStyle: { fontSize: 10 }, splitLine: { show: false } },
    ],
    series: [
      { name: '带宽', type: 'line', data: [], smooth: true, symbol: 'none', areaStyle: { opacity: 0.2, color: '#fac858' }, itemStyle: { color: '#fac858' }, lineStyle: { width: 1.5 }, yAxisIndex: 0 },
      { name: '包速率', type: 'bar', data: [], itemStyle: { color: 'rgba(84,112,198,0.4)' }, barWidth: '40%', yAxisIndex: 1 },
    ],
  })
  c.setOption({
    xAxis: { data: xData, axisLabel: { interval: Math.floor(xData.length / 5) } },
    series: [{ data: bpsData }, { data: ppsData }],
  })
}

function upsertPieChart(id: string, container: HTMLElement, data: { name: string; value: number }[]) {
  const c = getChart(id, container, {
    animation: true,
    animationDurationUpdate: 500,
    tooltip: { trigger: 'item', formatter: '{b}: {d}%' },
    series: [{ type: 'pie', radius: ['28%', '58%'], label: { fontSize: 10 }, data: [] }],
  })
  c.setOption({ series: [{ data }] })
}

async function refresh() {
  try {
    const [bwResp, statsResp, flowsResp, catResp, usersResp] = await Promise.all([
      api.trafficBandwidth(300).catch(() => [] as any[]),
      api.stats().catch(() => ({} as any)),
      api.recentFlows(500).catch(() => [] as any[]),
      api.trafficBandwidthByCategory(300).catch(() => ({ categories: [], series: {} } as any)),
      api.trafficOnlineUsers().catch(() => [] as any[]),
    ])

    const samples: any[] = Array.isArray(bwResp) ? bwResp : []
    const flows: any[] = Array.isArray(flowsResp) ? flowsResp : ((flowsResp as any)?.items || [])

    // Pre-compute category data availability (used by both KPI cards and charts).
    const catCategories = catResp?.categories || []
    const catSeries = catResp?.series || {}
    const hasCatData = catCategories.length > 0 && Object.values(catSeries).some((arr: any) => arr && arr.length > 0)

    // Compute KPIs from latest sample
    const last = samples.length ? samples[samples.length - 1] : null
    // Passive mirror: capture only observes one aggregate stream, so we show
    // 当前带宽 (latest sample) and 峰值 (max over the 5-minute window) instead
    // of an artificial up/down split.
    const bpsSeries = samples.map((s: any) => ((s.bytes_in || 0) + (s.bytes_out || 0)) * 8)
    const curBps = last ? ((last.bytes_in || 0) + (last.bytes_out || 0)) * 8 : 0
    const peakBps = bpsSeries.length ? Math.max(...bpsSeries) : 0
    const pps = last ? (last.pkts_in || 0) + (last.pkts_out || 0) : 0

    // Per-protocol connection estimates from packet-ratio × active flow count
    const s = statsResp as any
    const flowCount = Number(s?.capture_flow_count || 0)
    const tcpPkts = Number(s?.tcp_packets || 0)
    const udpPkts = Number(s?.udp_packets || 0)
    const icmpPkts = Number(s?.icmp_packets || 0)
    const totalPkts = tcpPkts + udpPkts + icmpPkts
    const totalConns = flowCount
    let tcpScaled = 0, udpScaled = 0, icmpScaled = 0
    if (totalPkts > 0) {
      tcpScaled = Math.round(flowCount * tcpPkts / totalPkts)
      udpScaled = Math.round(flowCount * udpPkts / totalPkts)
      icmpScaled = Math.round(flowCount * icmpPkts / totalPkts)
    }
    // Online users from dedicated API
    const onlineUsers: any[] = Array.isArray(usersResp) ? usersResp : []

    // If aggregate samples are empty but category data is available,
    // derive current/peak bandwidth from category totals.
    let displayCurBps = curBps
    let displayPeakBps = peakBps
    if (!curBps && hasCatData) {
      const allTsSet0 = new Set<string>()
      for (const cat of catCategories) {
        (catSeries[cat.key] || []).forEach((p: any) => allTsSet0.add(p.ts))
      }
      const allTs0 = [...allTsSet0].sort()
      if (allTs0.length) {
        const perTsBps = allTs0.map(ts => {
          let total = 0
          for (const cat of catCategories) {
            const pt = (catSeries[cat.key] || []).find((p: any) => p.ts === ts)
            if (pt) total += pt.value
          }
          return total
        })
        displayCurBps = perTsBps[perTsBps.length - 1] || 0
        displayPeakBps = Math.max(...perTsBps)
      }
    }
    // Update stat cards
    setText('toUpstream', fmtBps(displayCurBps))
    setText('toDownstream', fmtBps(displayPeakBps))
    setText('toConnValue', fmtNum(totalConns))
    setText('toConnTcp', fmtNum(tcpScaled))
    setText('toConnUdp', fmtNum(udpScaled))
    setText('toConnIcmp', fmtNum(icmpScaled))
    setText('toUsersCurrent', fmtNum(onlineUsers.length))
    setText('toUsersPeak', fmtNum(Math.max(onlineUsers.length, 1)))
    setText('toPpsValue', fmtNum(pps))
    // ndpi_classified is a cumulative counter — showing it as "SYN ACK"
    // instantaneous value is misleading. Show pkts/flow ratio instead.
    setText('toSynAckValue', totalConns > 0 ? (pps / totalConns).toFixed(1) + ' p/s·flow' : '—')

    // Render charts (incremental — no dispose/re-init, ECharts diffs the data)
    const xLabels = samples.map((s: any) => tsToLabel(s.ts))
    const BITS_PER_MBIT = 1e6
    const ppsData = samples.map((s: any) => (s.pkts_in || 0) + (s.pkts_out || 0))
    const totalMbpsData = samples.map((s: any) => (((s.bytes_in || 0) + (s.bytes_out || 0)) * 8) / BITS_PER_MBIT)

    // 带宽趋势: prefer per-category stacked chart; fall back to single line
    const upEl = document.querySelector('[data-chart="upstream"] .to-chart-plot-tall')

    if (upEl && hasCatData) {
      // Build aligned time series: collect all unique timestamps, then build per-category arrays.
      const allTsSet = new Set<string>()
      for (const cat of catCategories) {
        const pts = catSeries[cat.key] || []
        pts.forEach((p: any) => allTsSet.add(p.ts))
      }
      const allTs = [...allTsSet].sort()
      const catXLabels = allTs.map(tsToLabel)
      const alignedSeries: Record<string, number[]> = {}
      for (const cat of catCategories) {
        const pts = catSeries[cat.key] || []
        const byTs = new Map<string, number>()
        pts.forEach((p: any) => byTs.set(p.ts, p.value))
        alignedSeries[cat.key] = allTs.map(ts => (byTs.get(ts) || 0) / BITS_PER_MBIT)
      }
      upsertStackedAreaChart('bandwidth', upEl as HTMLElement, catXLabels, catCategories, alignedSeries, 'bps')
    } else if (upEl && samples.length) {
      upsertAreaChart('bandwidth', upEl as HTMLElement, xLabels, totalMbpsData, '#91cc75', 'Mbps')
    }

    // Helper: build aligned time-series from a sub-series map (no unit conversion).
    function buildAligned(subSeries: Record<string, any[]>, cats: any[], scale = 1) {
      const tsSet = new Set<string>()
      for (const cat of cats) {
        (subSeries[cat.key] || []).forEach((p: any) => tsSet.add(p.ts))
      }
      const allTs = [...tsSet].sort()
      const labels = allTs.map(tsToLabel)
      const aligned: Record<string, number[]> = {}
      for (const cat of cats) {
        const pts = subSeries[cat.key] || []
        const byTs = new Map<string, number>()
        pts.forEach((p: any) => byTs.set(p.ts, p.value))
        aligned[cat.key] = allTs.map(ts => (byTs.get(ts) || 0) * scale)
      }
      return { labels, aligned, allTs }
    }

    // 包速率趋势: per-category stacked area (packets)
    const pktSeriesData = catResp?.pkt_series || {}
    const hasPktData = Object.values(pktSeriesData).some((arr: any) => arr && arr.length > 0)
    const downEl = document.querySelector('[data-chart="downstream"] .to-chart-plot-tall')
    if (downEl && hasPktData) {
      const { labels, aligned } = buildAligned(pktSeriesData, catCategories)
      upsertStackedAreaChart('pps', downEl as HTMLElement, labels, catCategories, aligned, 'pps')
    } else if (downEl && samples.length) {
      upsertAreaChart('pps', downEl as HTMLElement, xLabels, ppsData, '#5470c6')
    }

    // 流量概况 combo (Mbps + PPS) — derive totals from category data
    const comboEl = document.querySelector('[data-chart="overview"] .to-panel-chart-combo')
    if (comboEl) {
      let cXLabels = xLabels, cMbps = totalMbpsData, cPps = ppsData
      if (!samples.length && hasCatData) {
        const { labels, allTs } = buildAligned(catSeries, catCategories)
        cXLabels = labels
        cMbps = allTs.map(ts => {
          let t = 0
          for (const cat of catCategories) {
            const pt = (catSeries[cat.key] || []).find((p: any) => p.ts === ts)
            if (pt) t += pt.value
          }
          return t / BITS_PER_MBIT
        })
        cPps = allTs.map(ts => {
          let t = 0
          for (const cat of catCategories) {
            const pt = (pktSeriesData[cat.key] || []).find((p: any) => p.ts === ts)
            if (pt) t += pt.value
          }
          return t
        })
      }
      if (cMbps.length) upsertComboChart('overview', comboEl as HTMLElement, cXLabels, cMbps, cPps)
    }

    // 连接趋势: per-category stacked area (connections)
    const connSeriesData = catResp?.conn_series || {}
    const hasConnData = Object.values(connSeriesData).some((arr: any) => arr && arr.length > 0)
    const connEl = document.querySelector('[data-chart="connections"] .to-chart-plot-tall')
    if (connEl && hasConnData) {
      const { labels, aligned } = buildAligned(connSeriesData, catCategories)
      upsertStackedAreaChart('connections', connEl as HTMLElement, labels, catCategories, aligned, 'conn')
    } else if (connEl && samples.length) {
      upsertAreaChart('connections', connEl as HTMLElement, xLabels, ppsData, '#ee6666')
    }

    // 流量分布饼图: prefer per-category distribution; fall back to proto mix
    const trafficPieEl = document.querySelector('[data-chart="downstream"]')?.nextElementSibling?.querySelector('.to-pie-wrap')
    if (trafficPieEl) {
      // Sum total bits per category across all time points
      const catTotals = new Map<string, number>()
      for (const cat of catCategories) {
        const pts = catSeries[cat.key] || []
        let sum = 0
        pts.forEach((p: any) => { sum += p.value || 0 })
        if (sum > 0) catTotals.set(cat.key, sum)
      }
      if (catTotals.size > 0) {
        // Build pie data from categories, ordered by value
        const pieCatData = [...catTotals.entries()]
          .map(([key, value]) => {
            const meta = catCategories.find((c: any) => c.key === key)
            return { name: meta?.label || key, value, itemStyle: { color: meta?.color } }
          })
          .sort((a, b) => b.value - a.value)
        upsertPieChart('traffic-pie', trafficPieEl as HTMLElement, pieCatData)
      } else {
        upsertPieChart('traffic-pie', trafficPieEl as HTMLElement, [
          { name: 'TCP', value: tcpScaled || 1 },
          { name: 'UDP', value: udpScaled || 1 },
          { name: 'ICMP', value: icmpScaled || 1 },
        ].filter(d => d.value > 0))
      }
    }

    // 连接分布饼图 (app-proto mix)
    const connPieEl = document.querySelector('[data-chart="connections"]')?.nextElementSibling?.querySelector('.to-pie-wrap')
    if (connPieEl) {
      const appProtoMap = new Map<string, number>()
      flows.forEach((f: any) => {
        const app = f.app_proto || f.session_type || 'Other'
        appProtoMap.set(app, (appProtoMap.get(app) || 0) + 1)
      })
      const pieData = [...appProtoMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, value]) => ({ name, value }))
      if (pieData.length) upsertPieChart('conn-pie', connPieEl as HTMLElement, pieData)
    }
  } catch (err) {
    console.error('traffic-overview refresh failed', err)
  }
}

function handleResize() { charts.forEach(c => c.resize()) }

onMounted(() => {
  refresh()
  timer = setInterval(refresh, 3000)
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
:root {
  --bg-page: #f0f2f5;
  --bg-white: #ffffff;
  --border: #e8e8e8;
  --border-light: #f0f0f0;
  --text: #303133;
  --text-secondary: #606266;
  --text-muted: #909399;
  --accent: #409eff;
}

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

.to-dashboard-scroll {
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.to-dashboard {
  padding: 12px;
  background: #f0f2f5;
}

.to-dashboard > * + * {
  margin-top: 12px;
}

.to-summary-row-5 {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.to-stat-card-v2 {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 12px 14px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.to-stat-v2-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #409eff;
  background: linear-gradient(145deg, #e6f4ff 0%, #ecf5ff 100%);
  box-shadow: inset 0 0 0 1px rgba(64, 158, 255, 0.12);
}

.to-stat-v2-icon svg {
  width: 20px;
  height: 20px;
  display: block;
}

.to-stat-v2-icon-conn { color: #597ef7; background: linear-gradient(145deg, #eef2ff 0%, #f0f5ff 100%); }
.to-stat-v2-icon-user { color: #13c2c2; background: linear-gradient(145deg, #e6fffb 0%, #ecfefe 100%); }
.to-stat-v2-icon-pps { color: #fa8c16; background: linear-gradient(145deg, #fff7e6 0%, #fffbe6 100%); }

.to-stat-v2-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.to-stat-v2-metric {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}

.to-stat-v2-metric-main {
  margin-bottom: 2px;
}

.to-stat-v2-key {
  font-size: 12px;
  color: #606266;
  white-space: nowrap;
  font-weight: 600;
}

.to-stat-v2-val {
  font-size: 16px;
  font-weight: 700;
  color: #303133;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.to-stat-v2-val-lg {
  font-size: 18px;
}

.to-stat-v2-subgrid {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 4px;
  margin-top: 4px;
  width: 100%;
}

.to-stat-v2-sub {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
  font-size: 12px;
  color: #909399;
}

.to-stat-v2-sub:first-child {
  align-items: flex-start;
  text-align: left;
}

.to-stat-v2-sub:nth-child(2) {
  align-items: center;
  text-align: center;
}

.to-stat-v2-sub:last-child {
  align-items: flex-end;
  text-align: right;
}

.to-stat-v2-sub strong {
  font-size: 14px;
  font-weight: 700;
  color: #303133;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.to-chart-row {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: 12px;
  min-height: 260px;
}

.to-chart-panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 260px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.to-panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 14px 6px;
  flex-shrink: 0;
}

.to-panel-head-left {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px 14px;
  min-width: 0;
}

.to-panel-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #303133;
  white-space: nowrap;
}

.to-panel-stats {
  font-size: 12px;
  color: #909399;
  font-weight: 500;
  white-space: nowrap;
}

.to-panel-menu {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  background: transparent;
  color: #909399;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  border-radius: 4px;
}

.to-panel-menu:hover {
  background: #f5f7fa;
  color: #606266;
}

.to-cat-legend,
.to-combo-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 12px;
  padding: 0 14px 8px;
  flex-shrink: 0;
}

.to-panel-chart {
  position: relative;
  flex: 1;
  min-height: 0;
  padding: 0 10px 8px 0;
}

.to-yunit-label {
  position: absolute;
  left: 14px;
  top: 0;
  z-index: 2;
  font-size: 11px;
  font-weight: 600;
  color: #909399;
  pointer-events: none;
}

.to-panel-chart-tall .to-chart-plot-tall {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  grid-template-rows: 200px auto;
  column-gap: 10px;
  align-items: stretch;
  contain: layout style;
  padding-top: 14px;
  position: relative;
}

.to-panel-chart-tall .to-chart-ylabels {
  grid-column: 1;
  grid-row: 1;
  position: relative;
  height: 200px;
}

.to-panel-chart-tall .to-chart-svg {
  grid-column: 2;
  grid-row: 1;
  width: 100%;
  height: 200px;
  min-width: 0;
}

.to-panel-chart-tall .to-chart-xlabels {
  grid-column: 2;
  grid-row: 2;
  position: relative;
  height: 28px;
  margin: 0 8px 0 0;
  border-top: 1px solid #c8ccd0;
}

.to-panel-chart-combo {
  padding: 0 8px 10px;
}

.to-combo-legend {
  padding-bottom: 4px;
}

.to-combo-yaxis {
  display: flex;
  justify-content: space-between;
  padding: 0 4px 2px 36px;
}

.to-yunit-left { position: static; }
.to-yunit-right { position: static; text-align: right; }

.to-combo-plot {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr) 36px;
  grid-template-rows: 200px auto;
  column-gap: 4px;
  align-items: stretch;
  position: relative;
}

.to-combo-ylabels-left {
  grid-column: 1;
  grid-row: 1;
  position: relative;
  height: 200px;
}

.to-combo-svg {
  grid-column: 2;
  grid-row: 1;
  width: 100%;
  height: 200px;
  min-width: 0;
}

.to-combo-ylabels-right {
  grid-column: 3;
  grid-row: 1;
  position: relative;
  height: 200px;
}

.to-combo-xlabels {
  grid-column: 2;
  grid-row: 2;
  position: relative;
  height: 32px;
  margin: 0 4px 0 0;
  border-top: 1px solid #c8ccd0;
}

.to-chart-panel-pie {
  overflow: visible;
}

.to-chart-panel-pie .to-pie-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 340px;
  min-height: 340px;
  max-height: 340px;
  padding: 4px 8px 12px;
  overflow: visible;
}

.to-pie-svg-ref {
  display: block;
  width: 100%;
  max-width: 100%;
  height: 340px;
  flex-shrink: 0;
  overflow: visible;
}

@media (max-width: 1280px) {
  .to-summary-row-5 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 960px) {
  .to-summary-row-5 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .to-chart-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .to-summary-row-5 {
    grid-template-columns: 1fr;
  }
}
</style>
