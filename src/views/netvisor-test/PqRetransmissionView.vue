<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav nv-tabs-nav-wrap" role="tablist" aria-label="协议重传">
        <button v-for="t in tabs" :key="t.key" type="button" class="nv-tab" :class="{ active: activeTab === t.key }" role="tab" @click="activeTab = t.key">{{ t.label }}</button>
      </div>
    </div>
    <div class="nv-tabs-body">

      <!-- 协议重传 -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'protocol' }">
        <div class="ou-toolbar">
          <div class="ou-toolbar-item"><span class="ou-toolbar-label">应用协议</span><select class="ou-toolbar-select" disabled><option>任意</option></select></div>
          <div class="ou-toolbar-item"><span class="ou-toolbar-label">重传率&gt;=</span><input class="ou-toolbar-input" placeholder="0" disabled style="width:80px" /><span class="pq-unit">%</span></div>
          <div class="ou-toolbar-item"><span class="ou-toolbar-label">关键字搜索</span><input class="ou-toolbar-input" disabled /></div>
          <button class="ou-search-btn" disabled>搜索</button>
          <button class="secondary td-reset-btn" disabled>重置</button>
        </div>
        <div class="ou-table-wrap">
          <table class="ou-table pqr-table">
            <thead><tr><th class="col-idx">序号</th><th>应用协议</th><th class="ou-num">连接数</th><th class="ou-num">总包数</th><th class="ou-num">重传包数</th><th class="ou-num">重传率</th></tr></thead>
            <tbody>
              <tr v-for="(r,i) in protoRows" :key="i"><td class="col-idx">{{ i+1 }}</td><td>{{ r.name }}</td><td class="ou-num">{{ r.conn }}</td><td class="ou-num">{{ r.total }}</td><td class="ou-num">{{ r.rt }}</td><td><span class="pq-latency-badge" :class="{ 'pq-latency-good': r.rate < 1 }">{{ r.rate }}%</span></td></tr>
            </tbody>
          </table>
        </div>
        <div class="ou-footer"><div class="ou-footer-left"><div class="ou-pager"><button class="ou-page-btn" disabled>‹</button><button class="ou-page-btn active" disabled>1</button><button class="ou-page-btn" disabled>›</button></div></div><div class="ou-footer-right"><span>共 {{ protoRows.length }} 条</span></div></div>
      </div>

      <!-- 重传趋势 -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'trend' }">
        <div class="pqr-trend-grid">
          <section class="tid-chart-panel" v-for="(c, idx) in trendCharts" :key="c">
            <div class="tid-chart-head"><h3 class="tid-mini-title">{{ c }}</h3></div>
            <div class="tid-chart-body"><v-chart class="to-chart-plot" :option="getTrendChartOption(c, idx)" autoresize /></div>
          </section>
        </div>
      </div>

      <!-- 历史重传 -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'history' }">
        <div class="tdh-filters">
          <div class="tdh-filter-row">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">MAC</span><input class="ou-toolbar-input tdh-filter-input" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">源IP</span><input class="ou-toolbar-input tdh-filter-input" placeholder="任意IP" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">源端口</span><input class="ou-toolbar-input tdh-filter-input" placeholder="80 / 8000-8080" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">目标IP</span><input class="ou-toolbar-input tdh-filter-input" placeholder="任意IP" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">目标端口</span><input class="ou-toolbar-input tdh-filter-input" placeholder="80 / 8000-8080" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">传输协议</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
          </div>
          <div class="tdh-filter-row">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">应用协议</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">源IP ISP</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">目标IP ISP</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">源IP区域</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">目标IP区域</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">链路</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
          </div>
          <div class="tdh-filter-row">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">请求域名</span><input class="ou-toolbar-input tdh-filter-input" disabled /></label>
            <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" value="2026-06-15 10:33:11 - 2026-06-15 10:48:11" disabled /></label>
            <button class="ou-search-btn" disabled>搜索</button>
            <button class="secondary td-reset-btn" disabled>重置</button>
          </div>
        </div>
        <div class="pq-scroll">
          <section class="tid-chart-panel">
            <div class="tid-chart-head"><h3 class="tid-mini-title">重传率</h3></div>
            <div class="tid-chart-body"><v-chart class="to-chart-plot" :option="getHistoryChartOption()" autoresize /></div>
          </section>
          <div class="pq-bottom-grid pqr-history-grid">
            <section class="tid-mini-panel" v-for="mini in historyMinis" :key="mini.title">
              <div class="tid-mini-head"><h3 class="tid-mini-title">{{ mini.title }}</h3></div>
              <div class="ou-table-wrap tid-mini-table-wrap">
                <table class="ou-table tid-mini-table pq-table">
                  <thead><tr><th class="col-idx">序号</th><th>{{ mini.title }}</th><th class="ou-num">连接数</th><th class="ou-num">总包数</th><th class="ou-num">重传包数</th><th class="ou-num">重传率</th></tr></thead>
                  <tbody>
                    <tr v-if="!mini.rows || mini.rows.length === 0"><td colspan="6" class="ou-empty">无数据</td></tr>
                    <tr v-else v-for="(r, i) in mini.rows" :key="i"><td class="col-idx">{{ i+1 }}</td><td><span class="tid-link dt-ellipsis">{{ r.name }}</span></td><td class="ou-num">{{ r.conn }}</td><td class="ou-num">{{ r.total }}</td><td class="ou-num">{{ r.rt }}</td><td><span class="pq-latency-badge" :class="{ 'pq-latency-good': parseFloat(r.rate) < 1 }">{{ r.rate }}</span></td></tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent } from 'echarts/components'
import './nv-shared.css'

use([CanvasRenderer, LineChart, BarChart, TitleComponent, TooltipComponent, GridComponent])

const tabs = [{ key: 'protocol', label: '协议重传' }, { key: 'trend', label: '重传趋势' }, { key: 'history', label: '历史重传' }]
const activeTab = ref('protocol')
const trendCharts = ['TCP重传率', 'TCP重传包数', 'HTTP重传率', 'HTTP重传包数', 'HTTPS重传率', 'HTTPS重传包数']

const trendDatasets = [
  [1.2, 1.8, 1.5, 0.8, 2.2, 1.6, 1.9, 1.3, 2.1, 1.7, 2.4, 1.8],
  [8642, 12864, 10240, 5864, 14286, 9864, 11864, 7286, 12864, 9286, 15286, 10864],
  [0.8, 1.2, 0.9, 0.5, 1.5, 1.1, 1.3, 0.9, 1.4, 1.2, 1.6, 1.3],
  [4286, 6428, 5120, 2932, 7143, 4932, 5932, 3643, 6428, 4643, 7643, 5432],
  [0.6, 1.0, 0.8, 0.4, 1.2, 0.9, 1.1, 0.7, 1.2, 1.0, 1.4, 1.1],
  [3286, 4864, 3840, 2286, 5432, 3864, 4486, 2728, 4864, 3528, 5786, 4286],
]

const colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272']

function getTrendChartOption(title: string, idx: number) {
  const data = trendDatasets[idx]
  const hours = Array.from({ length: 12 }, (_, i) => `${i + 12}:00`)
  const isRate = idx % 2 === 0
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: hours },
    yAxis: { type: 'value', axisLabel: isRate ? { formatter: '{value}%' } : {} },
    series: [{
      name: title,
      type: 'line',
      smooth: true,
      data,
      lineStyle: { color: colors[idx] },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: `${colors[idx]}33` }, { offset: 1, color: `${colors[idx]}08` }] } },
    }],
  }
}

function getHistoryChartOption() {
  const hours = Array.from({ length: 12 }, (_, i) => `${i + 12}:00`)
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: hours },
    yAxis: { type: 'value', axisLabel: { formatter: '{value}%' } },
    series: [{
      name: '重传率',
      type: 'line',
      smooth: true,
      data: [1.2, 1.8, 1.5, 0.8, 2.2, 1.6, 1.9, 1.3, 2.1, 1.7, 2.4, 1.8],
      lineStyle: { color: '#ee6666' },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(238,102,102,0.3)' }, { offset: 1, color: 'rgba(238,102,102,0.05)' }] } },
    }],
  }
}

const protoRows = [
  { name: 'WWW', conn: 128642, total: '12.86 M', rt: 92864, rate: 0.72 },
  { name: '其它HTTPS', conn: 98642, total: '9.86 M', rt: 128420, rate: 1.30 },
  { name: 'SSH', conn: 42864, total: '4.28 M', rt: 68420, rate: 1.60 },
  { name: 'DNS', conn: 218420, total: '2.18 M', rt: 8642, rate: 0.40 },
  { name: 'ICMP', conn: 98640, total: '986 K', rt: 428, rate: 0.04 },
]
const historyMinis = [
  { title: '应用协议', rows: [
    { name: 'WWW', conn: '128642', total: '12.86 M', rt: '92864', rate: '0.72%' },
    { name: '其它HTTPS', conn: '98642', total: '9.86 M', rt: '128420', rate: '1.30%' },
    { name: 'SSH', conn: '42864', total: '4.28 M', rt: '68420', rate: '1.60%' },
    { name: 'DNS', conn: '218420', total: '2.18 M', rt: '8642', rate: '0.40%' },
  ]},
  { title: '源IP', rows: [
    { name: '166.111.7.7', conn: '136513', total: '8.64 M', rt: '68420', rate: '0.80%' },
    { name: '166.111.7.8', conn: '128642', total: '7.86 M', rt: '52864', rate: '0.67%' },
    { name: '101.6.10.23', conn: '98642', total: '5.28 M', rt: '38642', rate: '0.73%' },
    { name: '183.222.90.184', conn: '72864', total: '3.86 M', rt: '28642', rate: '0.74%' },
  ]},
  { title: '目标IP', rows: [
    { name: '101.6.15.130', conn: '98642', total: '6.86 M', rt: '86420', rate: '1.26%' },
    { name: '101.6.6.6', conn: '128642', total: '8.28 M', rt: '42864', rate: '0.52%' },
    { name: '166.111.5.212', conn: '48628', total: '3.28 M', rt: '18642', rate: '0.57%' },
    { name: '8.8.8.8', conn: '28642', total: '1.86 M', rt: '8642', rate: '0.46%' },
  ]},
  { title: '目标域名', rows: [
    { name: 'mirrors.tuna.tsinghua.edu.cn', conn: '642864', total: '42.86 M', rt: '286420', rate: '0.67%' },
    { name: 'work.weixin.qq.com', conn: '128642', total: '8.64 M', rt: '42864', rate: '0.50%' },
    { name: 'pypi.tuna.tsinghua.edu.cn', conn: '98642', total: '6.28 M', rt: '32864', rate: '0.52%' },
    { name: 'cn.bing.com', conn: '72864', total: '4.86 M', rt: '22864', rate: '0.47%' },
  ]},
]
</script>

<style scoped>
.pqr-table th, .pqr-table td { font-size:12px; padding:6px 8px; }
.pqr-trend-grid { display:grid; grid-template-columns:repeat(2, 1fr); gap:12px; padding:12px; }
.pq-scroll { flex:1; min-height:0; overflow:auto; display:flex; flex-direction:column; gap:12px; padding:12px; }
.pq-bottom-grid { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:12px; }
.pq-unit { font-size:12px; color:#909399; margin-left:-4px; }
.pq-latency-badge { display:inline-block; padding:1px 8px; border-radius:2px; font-size:11px; font-weight:600; background:#fef0f0; color:#f56c6c; }
.pq-latency-good { background:#f0f9eb; color:#67c23a; }
.pq-table th, .pq-table td { font-size:12px; padding:6px 8px; }
@media (max-width:1200px){ .pqr-trend-grid { grid-template-columns:1fr; } .pq-bottom-grid { grid-template-columns:1fr; } }
</style>
