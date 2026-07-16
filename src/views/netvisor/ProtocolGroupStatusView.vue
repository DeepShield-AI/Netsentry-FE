<template>
  <div class="nvt-page">
    <!-- Tab 切换 -->
    <div class="nvt-tabs-header">
      <div class="nvt-tabs-nav">
        <button
          class="nvt-tab"
          :class="{ active: activeTab === 'overview' }"
          @click="activeTab = 'overview'"
        >
          协议概览
        </button>
        <button
          class="nvt-tab"
          :class="{ active: activeTab === 'trend' }"
          @click="activeTab = 'trend'"
        >
          趋势分析
        </button>
      </div>
    </div>

    <!-- 协议概览 Tab -->
    <div v-if="activeTab === 'overview'" class="pgs-page">
      <!-- 过滤行 -->
      <div class="pgs-toolbar">
        <div class="pgs-toolbar-left">
          <label class="pgs-filter-field">
            <span class="pgs-toolbar-label">自动刷新</span>
            <select class="pgs-toolbar-select" v-model="refreshInterval">
              <option value="0">关闭</option>
              <option value="5">5秒</option>
              <option value="10">10秒</option>
              <option value="30">30秒</option>
              <option value="60">1分钟</option>
            </select>
          </label>
          <label class="pgs-filter-field">
            <span class="pgs-toolbar-label">网桥链路</span>
            <select class="pgs-toolbar-select" v-model="bridgeLink">
              <option value="all">全部</option>
              <option value="eth0">eth0</option>
              <option value="eth1">eth1</option>
              <option value="eth2">eth2</option>
            </select>
          </label>
          <label class="pgs-filter-field">
            <span class="pgs-toolbar-label">协议类型</span>
            <select class="pgs-toolbar-select" v-model="protocolType">
              <option value="all">全部</option>
              <option value="tcp">TCP</option>
              <option value="udp">UDP</option>
              <option value="icmp">ICMP</option>
            </select>
          </label>
          <label class="pgs-filter-field">
            <span class="pgs-toolbar-label">应用协议</span>
            <select class="pgs-toolbar-select" v-model="appProtocol">
              <option value="all">全部</option>
              <option value="http">HTTP</option>
              <option value="https">HTTPS</option>
              <option value="dns">DNS</option>
              <option value="ftp">FTP</option>
              <option value="ssh">SSH</option>
            </select>
          </label>
        </div>
        <div class="pgs-toolbar-right">
          <input
            class="pgs-toolbar-input"
            type="search"
            placeholder="关键字搜索"
            v-model="keyword"
          />
          <button class="pgs-search-btn" @click="handleSearch">搜索</button>
        </div>
      </div>

      <!-- 协议组状态表格 -->
      <div class="pgs-table-wrap">
        <table class="pgs-table">
          <thead>
            <tr>
              <th>协议名称</th>
              <th>连接数</th>
              <th>流入BPS</th>
              <th>流出BPS</th>
              <th>代理流入BPS</th>
              <th>代理流出BPS</th>
              <th>累计流量</th>
              <th>最近十分钟流量</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in protocolData" :key="item.key">
              <td>
                <span class="pgs-tag" :style="{ background: item.color, color: '#fff' }">{{ item.name }}</span>
              </td>
              <td>{{ fmtInt(item.connections) }}</td>
              <td>{{ item.in_bps }}</td>
              <td>{{ item.out_bps }}</td>
              <td>{{ item.proxy_in_bps }}</td>
              <td>{{ item.proxy_out_bps }}</td>
              <td>{{ item.total_traffic }}</td>
              <td>{{ item.recent_traffic }}</td>
              <td>
                <button class="pgs-action-btn" @click="handleView(item)">查看</button>
                <button class="pgs-action-btn" @click="handleExport(item)">导出</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="pgs-footer">
        <div class="pgs-footer-left">
          <div class="pgs-pager">
            <button class="pgs-page-btn" :disabled="currentPage === 1" @click="currentPage--">‹</button>
            <button class="pgs-page-btn" :disabled="currentPage === totalPages" @click="currentPage++">›</button>
          </div>
        </div>
        <div class="pgs-footer-right">
          <label class="pgs-page-goto">
            到第
            <input type="text" class="pgs-page-goto-input" v-model="gotoPage" />
            页
            <button class="pgs-page-goto-btn" @click="handleGotoPage">确定</button>
          </label>
          <span>共 {{ totalItems }} 条</span>
          <label class="pgs-page-size">
            <select v-model="pageSize">
              <option value="10">10 条/页</option>
              <option value="20">20 条/页</option>
              <option value="50">50 条/页</option>
              <option value="100">100 条/页</option>
            </select>
          </label>
        </div>
      </div>
    </div>

    <!-- 趋势分析 Tab -->
    <div v-if="activeTab === 'trend'" class="pgs-trend-page">
      <!-- 统计卡片行 -->
      <div class="nvt-stat-row">
        <div class="nvt-stat-card">
          <div class="nvt-stat-label">峰值带宽</div>
          <div class="nvt-stat-value nvt-stat-value-blue">{{ fmtRate(trendStats.peak_bps) }}</div>
          <div class="nvt-stat-label" style="margin-top: 4px;">平均带宽</div>
          <div class="nvt-stat-value">{{ fmtRate(trendStats.avg_bps) }}</div>
        </div>
        <div class="nvt-stat-card">
          <div class="nvt-stat-label">峰值连接</div>
          <div class="nvt-stat-value nvt-stat-value-lg">{{ fmtInt(trendStats.peak_conns) }}</div>
          <div class="nvt-stat-label" style="margin-top: 4px;">平均连接</div>
          <div class="nvt-stat-value">{{ fmtInt(trendStats.avg_conns) }}</div>
        </div>
        <div class="nvt-stat-card">
          <div class="nvt-stat-label">采样点数</div>
          <div class="nvt-stat-value">{{ fmtInt(trendStats.sample_count) }}</div>
          <div class="nvt-stat-label" style="margin-top: 4px;">时间范围</div>
          <div class="nvt-stat-value" style="font-size: 12px;">{{ trendStats.time_range }}</div>
        </div>
      </div>

      <!-- 上行流量趋势 -->
      <div class="nvt-panel-row nvt-panel-row-1">
        <div class="nvt-card">
          <div class="nvt-card-header">
            <span>上行流量 → HTTP协议</span>
          </div>
          <div class="nvt-card-body">
            <div ref="upstreamChart" class="nvt-chart"></div>
          </div>
        </div>
      </div>

      <!-- 下行流量趋势 -->
      <div class="nvt-panel-row nvt-panel-row-1">
        <div class="nvt-card">
          <div class="nvt-card-header">
            <span>下行流量 → HTTP协议</span>
          </div>
          <div class="nvt-card-body">
            <div ref="downstreamChart" class="nvt-chart"></div>
          </div>
        </div>
      </div>

      <!-- 连接数趋势 -->
      <div class="nvt-panel-row nvt-panel-row-1">
        <div class="nvt-card">
          <div class="nvt-card-header">
            <span>连接数 → HTTP协议</span>
          </div>
          <div class="nvt-card-body">
            <div ref="connChart" class="nvt-chart"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, computed, watch } from 'vue'
import * as echarts from 'echarts'
import { mockTrafficBandwidthByCategory, mockTopApps, mockStats } from './mock-data'
import '../netvisor-test/nv-test-shared.css'

const activeTab = ref<'overview' | 'trend'>('overview')

const refreshInterval = ref('10')
const bridgeLink = ref('all')
const protocolType = ref('all')
const appProtocol = ref('all')
const keyword = ref('')

const currentPage = ref(1)
const pageSize = ref('10')
const gotoPage = ref('1')

const upstreamChart = ref<HTMLElement | null>(null)
const downstreamChart = ref<HTMLElement | null>(null)
const connChart = ref<HTMLElement | null>(null)
let upstreamChartInstance: echarts.ECharts | null = null
let downstreamChartInstance: echarts.ECharts | null = null
let connChartInstance: echarts.ECharts | null = null

function fmtInt(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return String(Math.round(n))
}

function fmtRate(bps: number): string {
  if (bps >= 1e6) return (bps / 1e6).toFixed(2) + ' MB/s'
  if (bps >= 1e3) return (bps / 1e3).toFixed(2) + ' KB/s'
  return bps.toFixed(1) + ' bps'
}

function fmtBytes(bytes: number): string {
  if (bytes >= 1e9) return (bytes / 1e9).toFixed(1) + ' GB'
  if (bytes >= 1e6) return (bytes / 1e6).toFixed(1) + ' MB'
  if (bytes >= 1e3) return (bytes / 1e3).toFixed(1) + ' KB'
  return bytes + ' B'
}

const colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#fc8452', '#9a60b4', '#ea7ccc']

const protocolData = computed(() => {
  const apps = mockTopApps()
  const stats = mockStats()
  const totalBytes = apps.reduce((sum, app) => sum + app.bytes, 0)
  
  return apps.map((app, idx) => {
    const inBps = Math.round(app.bytes_in / 300)
    const outBps = Math.round(app.bytes_out / 300)
    const proxyRatio = 0.3 + Math.random() * 0.2
    
    return {
      key: app.key,
      name: app.key,
      color: colors[idx % colors.length],
      connections: app.sessions,
      in_bps: fmtRate(inBps),
      out_bps: fmtRate(outBps),
      proxy_in_bps: fmtRate(Math.round(inBps * proxyRatio)),
      proxy_out_bps: fmtRate(Math.round(outBps * proxyRatio)),
      total_traffic: fmtBytes(app.bytes),
      recent_traffic: fmtBytes(Math.round(app.bytes * 0.02)),
    }
  })
})

const totalItems = computed(() => protocolData.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / parseInt(pageSize.value)))

const trendStats = computed(() => {
  const bandwidthData = mockTrafficBandwidthByCategory()
  const httpCat = bandwidthData.categories.find(c => c.key === 'web' || c.label === 'Web')
  
  if (!httpCat) {
    return {
      peak_bps: 0,
      avg_bps: 0,
      peak_conns: 0,
      avg_conns: 0,
      sample_count: 60,
      time_range: '最近 5 分钟',
    }
  }

  const httpBandwidth = bandwidthData.series[httpCat.key] || []
  const httpConn = bandwidthData.conn_series[httpCat.key] || []
  
  const peakBps = httpBandwidth.length > 0 ? Math.max(...httpBandwidth.map(d => d.value)) : 0
  const avgBps = httpBandwidth.length > 0 ? httpBandwidth.reduce((s, d) => s + d.value, 0) / httpBandwidth.length : 0
  
  const peakConns = httpConn.length > 0 ? Math.max(...httpConn.map(d => d.value)) : 0
  const avgConns = httpConn.length > 0 ? httpConn.reduce((s, d) => s + d.value, 0) / httpConn.length : 0
  
  return {
    peak_bps: peakBps,
    avg_bps: avgBps,
    peak_conns: peakConns,
    avg_conns: avgConns,
    sample_count: httpBandwidth.length,
    time_range: '最近 5 分钟',
  }
})

function handleSearch() {
  console.log('搜索:', keyword.value)
}

function handleView(item: any) {
  console.log('查看:', item.name)
}

function handleExport(item: any) {
  console.log('导出:', item.name)
}

function handleGotoPage() {
  const page = parseInt(gotoPage.value)
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

function tsToLabel(ts: string): string {
  const d = new Date(ts)
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function fmtBps(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + ' Gbps'
  if (n >= 1e6) return (n / 1e6).toFixed(1) + ' Mbps'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + ' Kbps'
  return n.toFixed(0) + ' bps'
}

function renderTrendCharts() {
  const data = mockTrafficBandwidthByCategory()
  const BITS_PER_MBIT = 1e6
  
  const httpCat = data.categories.find(c => c.key === 'web' || c.label === 'Web')
  if (!httpCat) {
    console.warn('HTTP protocol category not found')
    return
  }

  const allTsSet = new Set<string>()
  const pts = data.series[httpCat.key] || []
  pts.forEach((p: any) => allTsSet.add(p.ts))
  const allTs = [...allTsSet].sort()
  const xLabels = allTs.map(tsToLabel)

  const httpBandwidthByTs = new Map<string, number>()
  pts.forEach((p: any) => httpBandwidthByTs.set(p.ts, p.value))
  
  const httpConnByTs = new Map<string, number>()
  const connPts = data.conn_series[httpCat.key] || []
  connPts.forEach((p: any) => httpConnByTs.set(p.ts, p.value))

  const upstreamData = allTs.map(ts => (httpBandwidthByTs.get(ts) || 0) / BITS_PER_MBIT * 0.4)
  const downstreamData = allTs.map(ts => (httpBandwidthByTs.get(ts) || 0) / BITS_PER_MBIT * 0.6)
  const connData = allTs.map(ts => httpConnByTs.get(ts) || 0)

  const baseOption = {
    animation: true,
    animationDuration: 300,
    animationDurationUpdate: 500,
    animationEasingUpdate: 'cubicOut',
    tooltip: { trigger: 'axis' as const },
    grid: { left: 70, right: 15, top: 15, bottom: 30 },
    xAxis: { 
      type: 'category' as const, 
      data: xLabels, 
      boundaryGap: false, 
      axisLabel: { fontSize: 10, interval: Math.floor(xLabels.length / 6) } 
    },
  }

  if (upstreamChart.value) {
    if (upstreamChartInstance) upstreamChartInstance.dispose()
    upstreamChartInstance = echarts.init(upstreamChart.value)
    upstreamChartInstance.setOption({
      ...baseOption,
      yAxis: {
        type: 'value',
        axisLabel: { fontSize: 10, formatter: (v: number) => v >= 1e3 ? (v / 1e3).toFixed(1) + ' Gbps' : v.toFixed(1) + ' Mbps' },
        splitLine: { lineStyle: { type: 'dashed' } },
      },
      series: [{
        type: 'line',
        data: upstreamData,
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: '#5470c6' },
        areaStyle: { opacity: 0.2, color: '#5470c6' },
        itemStyle: { color: '#5470c6' },
      }],
    })
  }

  if (downstreamChart.value) {
    if (downstreamChartInstance) downstreamChartInstance.dispose()
    downstreamChartInstance = echarts.init(downstreamChart.value)
    downstreamChartInstance.setOption({
      ...baseOption,
      yAxis: {
        type: 'value',
        axisLabel: { fontSize: 10, formatter: (v: number) => v >= 1e3 ? (v / 1e3).toFixed(1) + ' Gbps' : v.toFixed(1) + ' Mbps' },
        splitLine: { lineStyle: { type: 'dashed' } },
      },
      series: [{
        type: 'line',
        data: downstreamData,
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: '#91cc75' },
        areaStyle: { opacity: 0.2, color: '#91cc75' },
        itemStyle: { color: '#91cc75' },
      }],
    })
  }

  if (connChart.value) {
    if (connChartInstance) connChartInstance.dispose()
    connChartInstance = echarts.init(connChart.value)
    connChartInstance.setOption({
      ...baseOption,
      yAxis: {
        type: 'value',
        axisLabel: { fontSize: 10, formatter: (v: number) => v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : v >= 1e3 ? (v / 1e3).toFixed(0) + 'K' : String(v) },
        splitLine: { lineStyle: { type: 'dashed' } },
      },
      series: [{
        type: 'line',
        data: connData,
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: '#fac858' },
        areaStyle: { opacity: 0.2, color: '#fac858' },
        itemStyle: { color: '#fac858' },
      }],
    })
  }
}

function handleResize() {
  if (upstreamChartInstance) upstreamChartInstance.resize()
  if (downstreamChartInstance) downstreamChartInstance.resize()
  if (connChartInstance) connChartInstance.resize()
}

watch(activeTab, (newTab) => {
  if (newTab === 'trend') {
    setTimeout(() => {
      nextTick(() => renderTrendCharts())
    }, 100)
  }
})

onMounted(() => {
  if (activeTab.value === 'trend') {
    nextTick(() => renderTrendCharts())
  }
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  if (upstreamChartInstance) upstreamChartInstance.dispose()
  if (downstreamChartInstance) downstreamChartInstance.dispose()
  if (connChartInstance) connChartInstance.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.pgs-page {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.pgs-trend-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
}

.pgs-trend-page .nvt-stat-row {
  grid-template-columns: repeat(3, 1fr);
}

.pgs-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
}

.pgs-toolbar-left,
.pgs-toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.pgs-filter-field {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pgs-toolbar-label {
  font-size: 13px;
  color: #606266;
}

.pgs-toolbar-select {
  height: 28px;
  padding: 0 8px;
  border: 1px solid #dcdfe6;
  border-radius: 3px;
  font-size: 13px;
  color: #606266;
  background: #fff;
}

.pgs-toolbar-input {
  height: 28px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  border-radius: 3px;
  font-size: 13px;
  width: 180px;
}

.pgs-search-btn {
  height: 28px;
  padding: 0 12px;
  border: 1px solid #409eff;
  border-radius: 3px;
  font-size: 13px;
  color: #fff;
  background: #409eff;
  cursor: pointer;
}

.pgs-search-btn:hover {
  background: #66b1ff;
  border-color: #66b1ff;
}

.pgs-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.pgs-table th {
  text-align: left;
  padding: 10px 12px;
  border-bottom: 1px solid #ebeef5;
  color: #909399;
  font-weight: 500;
  background: #fafafa;
}

.pgs-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #f5f7fa;
  color: #303133;
}

.pgs-table tbody tr:hover {
  background: #f5f7fa;
}

.pgs-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 12px;
}

.pgs-action-btn {
  height: 24px;
  padding: 0 8px;
  border: 1px solid #dcdfe6;
  border-radius: 3px;
  font-size: 12px;
  color: #606266;
  background: #fff;
  cursor: pointer;
  margin-right: 6px;
}

.pgs-action-btn:hover {
  color: #409eff;
  border-color: #c6e2ff;
  background: #ecf5ff;
}

.pgs-table-wrap {
  flex: 1;
  overflow: auto;
  background: #fff;
}

.pgs-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: #fff;
  border-top: 1px solid #ebeef5;
  font-size: 13px;
  color: #606266;
}

.pgs-footer-left,
.pgs-footer-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pgs-pager {
  display: flex;
  gap: 4px;
}

.pgs-page-btn {
  width: 28px;
  height: 28px;
  border: 1px solid #dcdfe6;
  border-radius: 3px;
  background: #fff;
  color: #606266;
  cursor: pointer;
  font-size: 14px;
}

.pgs-page-btn:hover:not(:disabled) {
  color: #409eff;
  border-color: #409eff;
}

.pgs-page-btn:disabled {
  color: #c0c4cc;
  cursor: not-allowed;
}

.pgs-page-goto {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pgs-page-goto-input {
  width: 40px;
  height: 28px;
  padding: 0 8px;
  border: 1px solid #dcdfe6;
  border-radius: 3px;
  text-align: center;
  font-size: 13px;
}

.pgs-page-goto-btn {
  height: 28px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  border-radius: 3px;
  background: #fff;
  color: #606266;
  cursor: pointer;
  font-size: 13px;
}

.pgs-page-goto-btn:hover {
  color: #409eff;
  border-color: #409eff;
}

.pgs-page-size select {
  height: 28px;
  padding: 0 8px;
  border: 1px solid #dcdfe6;
  border-radius: 3px;
  font-size: 13px;
  color: #606266;
  background: #fff;
}

.nvt-chart {
  width: 100%;
  height: 360px;
}
</style>