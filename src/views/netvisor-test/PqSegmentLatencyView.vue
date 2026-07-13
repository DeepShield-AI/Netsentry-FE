<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav nv-tabs-nav-wrap" role="tablist" aria-label="分段时延">
        <button v-for="t in tabs" :key="t.key" type="button" class="nv-tab" :class="{ active: activeTab === t.key }" role="tab" @click="activeTab = t.key">{{ t.label }}</button>
      </div>
    </div>
    <div class="nv-tabs-body">

      <!-- 分段设置 -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'settings' }">
        <div class="ou-toolbar" style="justify-content:space-between">
          <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
            <div class="ou-toolbar-item"><span class="ou-toolbar-label">自动刷新</span><select class="ou-toolbar-select" disabled><option>不刷新</option><option>30秒</option><option>60秒</option></select></div>
            <div class="ou-toolbar-item"><span class="ou-toolbar-label">状态</span><select class="ou-toolbar-select" disabled><option>全部</option><option>启用</option><option>禁用</option></select></div>
            <button class="ou-search-btn" disabled>搜索</button>
            <button class="secondary td-reset-btn" disabled>重置</button>
          </div>
          <div style="display:flex;gap:8px">
            <button class="link-btn" disabled>+ 新建分段</button>
            <button class="link-btn" disabled>生效</button>
            <button class="link-btn" disabled>批量删除</button>
          </div>
        </div>
        <div class="ou-table-wrap">
          <table class="ou-table pqs-table">
            <thead><tr><th class="col-idx">序号</th><th>内网地址</th><th>外网地址</th><th>协议</th><th>应用</th><th class="ou-num">匹配次数</th><th class="col-actions">操作</th></tr></thead>
            <tbody>
              <tr v-for="(row, i) in segmentRows" :key="i">
                <td class="col-idx">{{ i + 1 }}</td><td>{{ row.inner }}</td><td>{{ row.outer }}</td><td>{{ row.proto }}</td><td>{{ row.app }}</td><td class="ou-num">{{ row.count }}</td><td class="col-actions"><button class="link-btn" disabled>编辑</button></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="ou-footer"><div class="ou-footer-left"><div class="ou-pager"><button class="ou-page-btn" disabled>‹</button><button class="ou-page-btn active" disabled>1</button><button class="ou-page-btn" disabled>›</button></div></div><div class="ou-footer-right"><span>共 {{ segmentRows.length }} 条</span></div></div>
      </div>

      <!-- 分段概况 -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'overview' }">
        <div class="tdh-filters">
          <div class="tdh-filter-row">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">源IP</span><select class="ou-toolbar-select" disabled><option>任意IP</option></select><input class="ou-toolbar-input tdh-filter-input" placeholder="任意IP" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">过滤源</span><select class="ou-toolbar-select" disabled><option>否</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">源端口</span><input class="ou-toolbar-input tdh-filter-input" placeholder="80 / 8000-8080" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">目标IP</span><select class="ou-toolbar-select" disabled><option>任意IP</option></select><input class="ou-toolbar-input tdh-filter-input" placeholder="任意IP" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">过滤目标</span><select class="ou-toolbar-select" disabled><option>否</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">目标端口</span><input class="ou-toolbar-input tdh-filter-input" placeholder="80 / 8000-8080" disabled /></label>
          </div>
          <div class="tdh-filter-row">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">MAC</span><input class="ou-toolbar-input tdh-filter-input" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">域名</span><input class="ou-toolbar-input tdh-filter-input" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">应用协议</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">连接类型</span><select class="ou-toolbar-select" disabled><option>所有</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">上行字节&gt;=</span><input class="ou-toolbar-input tdh-filter-input" style="width:100px" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">下行字节&gt;=</span><input class="ou-toolbar-input tdh-filter-input" style="width:100px" disabled /></label>
          </div>
          <div class="tdh-filter-row">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">传输协议</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">上行包数&gt;=</span><input class="ou-toolbar-input tdh-filter-input" style="width:100px" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">下行包数&gt;=</span><input class="ou-toolbar-input tdh-filter-input" style="width:100px" disabled /></label>
            <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" value="2026-06-15 10:33:11 - 2026-06-15 10:48:11" disabled /></label>
            <button class="ou-search-btn" disabled>搜索</button>
            <button class="secondary td-reset-btn" disabled>重置</button>
          </div>
        </div>

        <div class="pq-scroll">
          <div class="pqs-overview-grid">
            <section class="tid-chart-panel">
              <div class="tid-chart-head"><h3 class="tid-mini-title">整体时延</h3></div>
              <div class="tid-chart-body"><v-chart class="to-chart-plot" :option="getOverallLatencyChart()" autoresize /></div>
            </section>
            <section class="tid-chart-panel">
              <div class="tid-chart-head"><h3 class="tid-mini-title">时延分布</h3></div>
              <div class="tid-chart-body"><v-chart class="to-chart-plot" :option="getLatencyDistributionChart()" autoresize /></div>
            </section>
          </div>
          <div class="pqs-per-proto-grid">
            <section class="tid-chart-panel" v-for="(p, idx) in perProto" :key="p">
              <div class="tid-chart-head"><h3 class="tid-mini-title">{{ p }}</h3></div>
              <div class="tid-chart-body"><v-chart class="to-chart-plot" :option="getProtoChartOption(p, idx)" autoresize /></div>
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
import { LineChart, PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components'
import './nv-shared.css'

use([CanvasRenderer, LineChart, PieChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent])

const tabs = [{ key: 'settings', label: '分段设置' }, { key: 'overview', label: '分段概况' }]
const activeTab = ref('settings')
const perProto = ['WWW', 'SSH', 'SMTP', '其它HTTPS', 'DNS', '微信']

const segmentRows = [
  { inner: '10.0.0.0/8', outer: '0.0.0.0/0', proto: 'TCP', app: '全部', count: '128,642' },
  { inner: '172.16.0.0/12', outer: '0.0.0.0/0', proto: 'UDP', app: '全部', count: '86,428' },
  { inner: '192.168.0.0/16', outer: '0.0.0.0/0', proto: 'TCP', app: 'WWW', count: '42,864' },
  { inner: '192.168.0.0/16', outer: '0.0.0.0/0', proto: 'TCP', app: 'SSH', count: '18,642' },
]

const protoDatasets = [
  [42, 58, 46, 82, 68, 54, 72, 48, 64, 56, 78, 62],
  [286, 324, 298, 428, 364, 318, 382, 284, 348, 326, 418, 368],
  [186, 212, 196, 286, 248, 218, 258, 192, 228, 212, 278, 248],
  [58, 72, 64, 98, 82, 74, 86, 62, 76, 68, 92, 78],
  [8, 12, 10, 18, 14, 12, 16, 10, 14, 12, 18, 14],
  [32, 46, 38, 64, 52, 42, 56, 36, 48, 42, 62, 52],
]

const colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272']

function getOverallLatencyChart() {
  const hours = Array.from({ length: 12 }, (_, i) => `${i + 12}:00`)
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: hours },
    yAxis: { type: 'value', axisLabel: { formatter: '{value}ms' } },
    series: [{
      name: '整体时延',
      type: 'line',
      smooth: true,
      data: [42, 58, 46, 82, 68, 54, 72, 48, 64, 56, 78, 62],
      lineStyle: { color: '#5470c6' },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(84,112,198,0.3)' }, { offset: 1, color: 'rgba(84,112,198,0.05)' }] } },
    }],
  }
}

function getLatencyDistributionChart() {
  return {
    tooltip: { trigger: 'item', formatter: '{b}: {c}%' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      label: { show: false },
      data: [
        { value: 35, name: '0-5ms', itemStyle: { color: '#5470c6' } },
        { value: 28, name: '5-10ms', itemStyle: { color: '#91cc75' } },
        { value: 18, name: '10-20ms', itemStyle: { color: '#fac858' } },
        { value: 12, name: '20-50ms', itemStyle: { color: '#ee6666' } },
        { value: 7, name: '>50ms', itemStyle: { color: '#73c0de' } },
      ],
    }],
  }
}

function getProtoChartOption(title: string, idx: number) {
  const data = protoDatasets[idx]
  const hours = Array.from({ length: 12 }, (_, i) => `${i + 12}:00`)
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: hours, axisLabel: { fontSize: 10 } },
    yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
    series: [{
      name: title,
      type: 'line',
      smooth: true,
      data,
      lineStyle: { color: colors[idx], width: 2 },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: `${colors[idx]}22` }, { offset: 1, color: `${colors[idx]}05` }] } },
    }],
  }
}
</script>

<style scoped>
.pq-scroll { flex:1; min-height:0; overflow:auto; display:flex; flex-direction:column; gap:12px; padding:12px; }
.pqs-overview-grid { display:grid; grid-template-columns:2fr 1fr; gap:12px; }
.pqs-per-proto-grid { display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; }
.pqs-table th, .pqs-table td { font-size:12px; padding:6px 8px; }
@media (max-width:1200px){ .pqs-overview-grid,.pqs-per-proto-grid { grid-template-columns:1fr; } }
</style>
