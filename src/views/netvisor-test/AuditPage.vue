<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav nv-tabs-nav-wrap" role="tablist" :aria-label="title">
        <button v-for="t in tabs" :key="t.key" type="button" class="nv-tab" :class="{ active: active === t.key }" role="tab" @click="active = t.key">{{ t.label }}</button>
      </div>
    </div>
    <div class="nv-tabs-body">
      <div v-for="t in tabs" :key="t.key" class="nv-tab-panel" :class="{ active: active === t.key }">
        <!-- 概况类 tab（有 KPI/迷你表） -->
        <template v-if="t.type === 'overview'">
          <div class="tdh-filters">
            <div class="tdh-filter-row">
              <label class="tdh-filter-field" v-for="(f, i) in t.filters || defaultFilters" :key="i">
                <span class="ou-toolbar-label">{{ f.label }}</span>
                <select v-if="f.kind === 'select'" class="ou-toolbar-select" disabled><option>任意</option></select>
                <input v-else class="ou-toolbar-input tdh-filter-input" :placeholder="f.placeholder || ''" disabled />
              </label>
              <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" value="2026-06-14 14:29:08 - 2026-06-14 14:44:08" disabled /></label>
              <button class="ou-search-btn" disabled>搜索</button>
              <button class="secondary td-reset-btn" disabled>重置</button>
            </div>
          </div>
          <div class="audit-scroll">
            <div class="audit-kpi-row" v-if="t.kpis">
              <div class="audit-kpi" v-for="k in t.kpis" :key="k.label"><div class="audit-kpi-label">{{ k.label }}</div><div class="audit-kpi-value">{{ k.value }}</div></div>
            </div>
            <section class="tid-chart-panel" v-if="t.chart !== false">
              <div class="tid-chart-head"><h3 class="tid-mini-title">{{ t.chartTitle || '请求趋势' }}</h3></div>
              <div class="tid-chart-body"><v-chart class="to-chart-plot" :option="getChartOption(t)" autoresize /></div>
              <div class="dtt-chart-stats"><span class="dtt-stat"><i class="dtt-stat-badge max">MAX</i>最大值 <strong>{{ t.chartMax || '—' }}</strong></span><span class="dtt-stat"><i class="dtt-stat-badge min">MIN</i>最小值 <strong>{{ t.chartMin || '—' }}</strong></span><span class="dtt-stat"><i class="dtt-stat-badge avg">AVG</i>平均值 <strong>{{ t.chartAvg || '—' }}</strong></span></div>
            </section>
            <div class="audit-mini-grid">
              <section v-for="m in t.miniTables || defaultMinis" :key="m.title" class="tid-mini-panel">
                <div class="tid-mini-head"><h3 class="tid-mini-title">{{ m.title }}</h3><button class="tid-expand-btn" disabled>⛶</button></div>
                <div class="ou-table-wrap tid-mini-table-wrap">
                  <table class="ou-table tid-mini-table">
                    <thead><tr><th class="col-idx">序号</th><th v-for="c in m.columns" :key="c">{{ c }}</th></tr></thead>
                    <tbody>
                      <tr v-if="!m.rows || m.rows.length === 0"><td :colspan="m.columns.length + 1" class="ou-empty">无数据</td></tr>
                      <tr v-else v-for="(row, ri) in m.rows" :key="ri">
                        <td class="col-idx">{{ ri + 1 }}</td>
                        <td v-for="c in m.columns" :key="c">{{ row[c] }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="ou-footer"><div class="ou-pager"><button class="ou-page-btn" disabled>‹</button><button class="ou-page-btn active" disabled>1</button><button class="ou-page-btn" disabled>›</button></div><span>共 {{ m.rows?.length || 0 }} 条</span></div>
              </section>
            </div>
          </div>
        </template>

        <!-- 会话/日志类 tab（筛选 + 大表） -->
        <template v-else>
          <div class="tdh-filters">
            <div class="tdh-filter-row" v-for="(row, ri) in filterRows(t)" :key="ri">
              <label class="tdh-filter-field" v-for="(f, fi) in row" :key="fi">
                <span class="ou-toolbar-label">{{ f.label }}</span>
                <select v-if="f.kind === 'select'" class="ou-toolbar-select" disabled><option>任意</option></select>
                <input v-else class="ou-toolbar-input tdh-filter-input" :placeholder="f.placeholder || ''" disabled />
              </label>
              <template v-if="ri === filterRows(t).length - 1">
                <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" value="2026-06-14 14:29:08 - 2026-06-14 14:44:08" disabled /></label>
                <button class="ou-search-btn" disabled>搜索</button>
                <button class="secondary td-reset-btn" disabled>重置</button>
                <button class="td-icon-btn" disabled title="列设置">☰</button>
              </template>
            </div>
          </div>
          <div class="ou-table-wrap">
            <table class="ou-table audit-table">
              <thead><tr><th class="col-idx">序号</th><th v-for="c in t.columns" :key="c">{{ c }}</th></tr></thead>
              <tbody>
                <tr v-if="!t.data || t.data.length === 0"><td :colspan="(t.columns?.length || 0) + 1" class="ou-empty">无数据</td></tr>
                <tr v-else v-for="(row, ri) in t.data" :key="ri">
                  <td class="col-idx">{{ ri + 1 }}</td>
                  <td v-for="c in t.columns" :key="c">{{ row[c] }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="ou-footer">
            <div class="ou-footer-left"><div class="ou-pager"><button class="ou-page-btn" disabled>‹</button><button class="ou-page-btn active" disabled>1</button><button class="ou-page-btn" disabled>›</button></div></div>
            <div class="ou-footer-right"><span>共 0 条</span><label class="ou-page-size"><select disabled><option>100 条/页</option></select></label></div>
          </div>
        </template>
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
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'
import './nv-shared.css'

use([
  CanvasRenderer,
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
])

interface Filter { label: string; kind?: 'select' | 'input'; placeholder?: string }
interface MiniTable { title: string; columns: string[]; rows?: any[] }
interface Kpi { label: string; value: string | number }
export interface AuditTab {
  key: string
  label: string
  type?: 'overview' | 'sessions'
  columns?: string[]
  filters?: Filter[]
  filterRows?: Filter[][]
  miniTables?: MiniTable[]
  kpis?: Kpi[]
  chart?: boolean
  chartTitle?: string
  chartData?: number[]
  chartMax?: string
  chartMin?: string
  chartAvg?: string
  data?: any[]
}

const props = defineProps<{ title: string; tabs: AuditTab[] }>()
const active = ref(props.tabs[0]?.key || '')

const defaultFilters: Filter[] = [
  { label: 'MAC' },
  { label: '源IP', placeholder: '任意IP' },
  { label: '目标IP', placeholder: '任意IP' },
  { label: '用户名称' },
  { label: '链路', kind: 'select' },
]
const defaultMinis: MiniTable[] = [
  { title: '源IP', columns: ['源IP', '总请求数'] },
  { title: '目标IP', columns: ['目标IP', '总请求数'] },
]

function filterRows(t: AuditTab): Filter[][] {
  if (t.filterRows) return t.filterRows
  const f = t.filters || [
    { label: 'MAC' },
    { label: '源IP', placeholder: '任意IP' },
    { label: '源端口', placeholder: '80 / 8000-8080' },
    { label: '目标IP', placeholder: '任意IP' },
    { label: '目标端口', placeholder: '80 / 8000-8080' },
    { label: '用户名称' },
    { label: '链路', kind: 'select' },
  ]
  const rows: Filter[][] = []
  for (let i = 0; i < f.length; i += 5) rows.push(f.slice(i, i + 5))
  return rows
}

function getChartOption(t: AuditTab) {
  const data = t.chartData || [120, 200, 150, 80, 250, 180, 220, 160, 240, 190, 280, 210]
  const hours = Array.from({ length: 12 }, (_, i) => `${i + 12}:00`)
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: hours },
    yAxis: { type: 'value' },
    series: [{
      name: t.chartTitle || '请求数',
      type: 'line',
      smooth: true,
      data,
      lineStyle: { color: '#409EFF' },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(64,158,255,0.3)' }, { offset: 1, color: 'rgba(64,158,255,0.05)' }] } },
    }],
  }
}
</script>

<style scoped>
.audit-scroll { flex:1; min-height:0; overflow:auto; display:flex; flex-direction:column; gap:12px; padding:12px; }
.audit-kpi-row { display:grid; grid-template-columns:repeat(auto-fit, minmax(160px, 1fr)); gap:12px; }
.audit-kpi { background:#fff; border:1px solid #e4e7ed; border-radius:4px; padding:14px; text-align:center; }
.audit-kpi-label { font-size:12px; color:#909399; }
.audit-kpi-value { font-size:20px; font-weight:600; color:#303133; margin-top:4px; }
.audit-mini-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:12px; }
.audit-table th, .audit-table td { font-size:12px; padding:6px 8px; }
.audit-table { min-width:1200px; }
</style>
