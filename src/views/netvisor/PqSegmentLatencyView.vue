<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav nv-tabs-nav-wrap" role="tablist" aria-label="分段时延">
        <button v-for="t in tabs" :key="t.key" type="button" class="nv-tab" :class="{ active: activeTab === t.key }" role="tab" @click="activeTab = t.key">{{ t.label }}</button>
      </div>
    </div>
    <div class="nv-tabs-body">

      <!-- 参数设置 -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'settings' }">
        <div class="pqs-settings-wrap">
          <!-- 描述区 -->
          <div class="pqs-desc">
            <div class="pqs-desc-line"><span class="pqs-desc-key">迟时：</span>设置适当的时延值，时长小于指定时延为优（如 0-1）进行统计，如：时延&lt;200为好，200-800为正常，800-2000为差，&gt;2000为有害；</div>
            <div class="pqs-desc-line"><span class="pqs-desc-key">时延：</span>编写时延基准值为ms。</div>
            <div class="pqs-desc-line"><span class="pqs-desc-key">颜色：</span>优选择的色，可以设置不同时延定义规则颜色；</div>
            <div class="pqs-desc-line"><span class="pqs-desc-key">排序：</span>颜色主要是按区块的规则来的。单击主控选项卡可换整行颜色。点击质量级配置菜单，点击可改。</div>
          </div>

          <!-- 阈值配色设置 -->
          <div class="pqs-thresholds">
            <div class="pqs-th-row">
              <div class="pqs-th-cell">
                <el-color-picker v-model="levelCfg.excellent.color" size="small" />
                <span class="pqs-th-tag" :style="{ background: levelCfg.excellent.color, color: getContrastColor(levelCfg.excellent.color) }">优</span>
                <el-input-number v-model="levelCfg.excellent.min" :min="0" :step="10" size="small" :controls="false" style="width:90px" />
                <span class="pqs-th-op">&lt;</span>
                <span class="pqs-th-label">时延</span>
                <el-input-number v-model="levelCfg.excellent.max" :min="0" :step="10" size="small" :controls="false" style="width:90px" />
                <span class="pqs-th-unit">ms</span>
              </div>
              <div class="pqs-th-cell">
                <el-color-picker v-model="levelCfg.normal.color" size="small" />
                <span class="pqs-th-tag" :style="{ background: levelCfg.normal.color, color: getContrastColor(levelCfg.normal.color) }">正常</span>
                <el-input-number v-model="levelCfg.normal.min" :min="0" :step="10" size="small" :controls="false" style="width:90px" />
                <span class="pqs-th-op">&lt;</span>
                <span class="pqs-th-label">时延</span>
                <el-input-number v-model="levelCfg.normal.max" :min="0" :step="50" size="small" :controls="false" style="width:90px" />
                <span class="pqs-th-unit">ms</span>
              </div>
              <div class="pqs-th-cell">
                <el-color-picker v-model="levelCfg.poor.color" size="small" />
                <span class="pqs-th-tag" :style="{ background: levelCfg.poor.color, color: getContrastColor(levelCfg.poor.color) }">差</span>
                <el-input-number v-model="levelCfg.poor.min" :min="0" :step="50" size="small" :controls="false" style="width:90px" />
                <span class="pqs-th-op">&lt;</span>
                <span class="pqs-th-label">时延</span>
                <el-input-number v-model="levelCfg.poor.max" :min="0" :step="100" size="small" :controls="false" style="width:90px" />
                <span class="pqs-th-unit">ms</span>
              </div>
              <div class="pqs-th-cell">
                <el-color-picker v-model="levelCfg.bad.color" size="small" />
                <span class="pqs-th-tag" :style="{ background: levelCfg.bad.color, color: getContrastColor(levelCfg.bad.color) }">有害</span>
                <el-input-number v-model="levelCfg.bad.min" :min="0" :step="100" size="small" :controls="false" style="width:90px" />
                <span class="pqs-th-label">以上时延</span>
              </div>
            </div>
            <div class="pqs-th-actions">
              <el-button type="primary" size="small" @click="submitConfig">提交配置</el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 时延概况 -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'overview' }">
        <div class="pq-scroll">
          <!-- 顶部：整体时延 + 时延分布 -->
          <div class="pqs-top-grid">
            <section class="pqs-card pqs-card-wide">
              <div class="pqs-card-head">
                <span class="pqs-card-title">整体时延</span>
                <div class="pqs-range-tabs">
                  <button v-for="r in rangeTabs" :key="r.key" class="pqs-range-btn" :class="{ active: topRange === r.key }" @click="topRange = r.key">{{ r.label }}</button>
                </div>
              </div>
              <div class="pqs-card-body">
                <v-chart :option="overallTrendOption" autoresize style="width:100%;height:280px" />
              </div>
            </section>

            <section class="pqs-card pqs-card-narrow">
              <div class="pqs-card-head">
                <span class="pqs-card-title">时延分布</span>
              </div>
              <div class="pqs-card-body">
                <v-chart :option="overallDistOption" autoresize style="width:100%;height:280px" />
              </div>
            </section>
          </div>

          <!-- 底部：6个协议图表 -->
          <div class="pqs-proto-grid">
            <section v-for="p in perProto" :key="p.name" class="pqs-card pqs-proto-card">
              <div class="pqs-card-head">
                <span class="pqs-card-title">{{ p.name }}</span>
                <div class="pqs-range-tabs">
                  <button v-for="r in rangeTabs" :key="r.key" class="pqs-range-btn" :class="{ active: p.range === r.key }" @click="p.range = r.key">{{ r.label }}</button>
                </div>
                <div class="pqs-proto-legend">
                  <span class="pqs-legend-item"><b class="pqs-legend-dot" style="background:#67c23a"></b>优</span>
                  <span class="pqs-legend-item"><b class="pqs-legend-dot" style="background:#409eff"></b>正常</span>
                  <span class="pqs-legend-item"><b class="pqs-legend-dot" style="background:#e6a23c"></b>差</span>
                  <span class="pqs-legend-item"><b class="pqs-legend-dot" style="background:#f56c6c"></b>有害</span>
                </div>
              </div>
              <div class="pqs-card-body">
                <v-chart :option="buildProtoChart(p)" autoresize style="width:100%;height:200px" />
                <div class="pqs-proto-stats">
                  <span>最大值: <strong>{{ p.stats.max }}</strong></span>
                  <span>最小值: <strong>{{ p.stats.min }}</strong></span>
                  <span>平均值: <strong>{{ p.stats.avg }}</strong></span>
                  <span>平均时延: <strong>{{ p.stats.avgLat }} ms</strong></span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, PieChart } from 'echarts/charts'
import {
  TitleComponent, TooltipComponent, LegendComponent, GridComponent, DataZoomComponent
} from 'echarts/components'
import './nv-shared.css'

use([CanvasRenderer, LineChart, BarChart, PieChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent, DataZoomComponent])

const tabs = [
  { key: 'settings', label: '参数设置' },
  { key: 'overview', label: '时延概况' },
]
const activeTab = ref('overview')

// ══════════════════════════════════════════════════════════════
// 参数设置（保留）
// ═══════════════════════════════════════════════════════════
interface LevelConfig {
  min: number
  max: number
  color: string
}

const levelCfg = reactive<Record<'excellent' | 'normal' | 'poor' | 'bad', LevelConfig>>({
  excellent: { min: 0, max: 200, color: '#67c23a' },
  normal: { min: 200, max: 800, color: '#409eff' },
  poor: { min: 800, max: 2000, color: '#e6a23c' },
  bad: { min: 2000, max: 99999, color: '#f56c6c' },
})

function getContrastColor(hex: string): string {
  const c = hex.replace('#', '')
  if (c.length !== 6) return '#fff'
  const r = parseInt(c.substr(0, 2), 16)
  const g = parseInt(c.substr(2, 2), 16)
  const b = parseInt(c.substr(4, 2), 16)
  const yiq = (r * 299 + g * 587 + b * 114) / 1000
  return yiq >= 160 ? '#303133' : '#fff'
}

function submitConfig() {
  if (levelCfg.excellent.max >= levelCfg.normal.min) {
    ElMessage.warning('"优"的上限必须小于"正常"的下限')
    return
  }
  if (levelCfg.normal.max >= levelCfg.poor.min) {
    ElMessage.warning('"正常"的上限必须小于"差"的下限')
    return
  }
  if (levelCfg.poor.max > levelCfg.bad.min) {
    ElMessage.warning('"差"的上限必须小于等于"有害"的下限')
    return
  }
  ElMessage.success('配置已提交（Mock）')
}

// ══════════════════════════════════════════════════════════════
// 时延概况
// ═══════════════════════════════════════════════════════════
const rangeTabs = [
  { key: 'day', label: '日' },
  { key: 'week', label: '周' },
  { key: 'month', label: '月' },
]
const topRange = ref('day')

// 协议数据
interface ProtoCard {
  name: string
  range: 'day' | 'week' | 'month'
  stats: { max: number; min: number; avg: number; avgLat: number }
  baseRange: [number, number]
}

const perProto = reactive<ProtoCard[]>([
  { name: 'WWW', range: 'day', stats: { max: 145, min: 0, avg: 56, avgLat: 86 }, baseRange: [20, 145] },
  { name: 'SSH', range: 'day', stats: { max: 480, min: 0, avg: 32, avgLat: 102 }, baseRange: [0, 480] },
  { name: 'SMTP', range: 'day', stats: { max: 50, min: 0, avg: 18, avgLat: 38 }, baseRange: [0, 50] },
  { name: '其它HTTPS', range: 'day', stats: { max: 900, min: 0, avg: 312, avgLat: 156 }, baseRange: [0, 900] },
  { name: 'DNS', range: 'day', stats: { max: 60, min: 0, avg: 6, avgLat: 18 }, baseRange: [0, 60] },
  { name: '微信', range: 'day', stats: { max: 70, min: 0, avg: 8, avgLat: 22 }, baseRange: [0, 70] },
])

function genXAxis(range: 'day' | 'week' | 'month'): string[] {
  if (range === 'day') {
    return Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, '0')}:00`)
  } else if (range === 'week') {
    return ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  } else {
    return Array.from({ length: 30 }, (_, d) => `${d + 1}日`)
  }
}

function makeProtoData(seed: number, len: number, baseRange: [number, number]) {
  const [lo, hi] = baseRange
  const result: { excellent: number[]; normal: number[]; poor: number[]; bad: number[] } = {
    excellent: [], normal: [], poor: [], bad: [],
  }
  for (let i = 0; i < len; i++) {
    const t = i / len
    const noise = (i + seed * 17) % 7
    result.excellent.push(Math.max(0, Math.round((hi * 0.7) * (0.4 + 0.4 * Math.sin(t * 6 + seed) + noise * 0.04))))
    result.normal.push(Math.max(0, Math.round((hi * 0.2) * (0.5 + 0.3 * Math.cos(t * 5 + seed) + noise * 0.05))))
    result.poor.push(Math.max(0, Math.round((hi * 0.06) * (0.4 + 0.3 * Math.sin(t * 4 + seed * 2) + noise * 0.03))))
    result.bad.push(Math.max(0, Math.round((hi * 0.03) * (0.3 + 0.2 * Math.cos(t * 3 + seed * 3) + noise * 0.02))))
  }
  return result
}

function buildProtoChart(p: ProtoCard) {
  const xAxis = genXAxis(p.range)
  const len = xAxis.length
  const data = makeProtoData(p.name.charCodeAt(0) || 0, len, p.baseRange)
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 12, bottom: 28 },
    xAxis: { type: 'category', boundaryGap: false, data: xAxis, axisLabel: { fontSize: 10 } },
    yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
    series: [
      { name: '优', type: 'line', stack: 's', smooth: true, symbol: 'none', itemStyle: { color: '#67c23a' }, areaStyle: { color: 'rgba(103,194,58,0.5)' }, data: data.excellent },
      { name: '正常', type: 'line', stack: 's', smooth: true, symbol: 'none', itemStyle: { color: '#409eff' }, areaStyle: { color: 'rgba(64,158,255,0.45)' }, data: data.normal },
      { name: '差', type: 'line', stack: 's', smooth: true, symbol: 'none', itemStyle: { color: '#e6a23c' }, areaStyle: { color: 'rgba(230,162,60,0.45)' }, data: data.poor },
      { name: '有害', type: 'line', stack: 's', smooth: true, symbol: 'none', itemStyle: { color: '#f56c6c' }, areaStyle: { color: 'rgba(245,108,108,0.45)' }, data: data.bad },
    ],
  }
}

const overallTrendOption = computed(() => {
  const xAxis = genXAxis(topRange.value)
  const len = xAxis.length
  const excellent: number[] = []
  const normal: number[] = []
  const poor: number[] = []
  const bad: number[] = []
  for (let i = 0; i < len; i++) {
    const t = i / len
    const wave = Math.sin(t * 6) * 600 + Math.cos(t * 4) * 300 + (i % 5) * 100
    excellent.push(Math.max(0, Math.round(800 + wave * 0.7)))
    normal.push(Math.max(0, Math.round(220 + wave * 0.25)))
    poor.push(Math.max(0, Math.round(40 + (i % 3) * 20)))
    bad.push(Math.max(0, Math.round(15 + (i % 4) * 8)))
  }
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: 50, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: xAxis, axisLabel: { fontSize: 10 } },
    yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
    series: [
      { name: '优', type: 'line', stack: 's', smooth: true, symbol: 'none', itemStyle: { color: '#67c23a' }, areaStyle: { color: 'rgba(103,194,58,0.45)' }, data: excellent },
      { name: '正常', type: 'line', stack: 's', smooth: true, symbol: 'none', itemStyle: { color: '#409eff' }, areaStyle: { color: 'rgba(64,158,255,0.4)' }, data: normal },
      { name: '差', type: 'line', stack: 's', smooth: true, symbol: 'none', itemStyle: { color: '#e6a23c' }, areaStyle: { color: 'rgba(230,162,60,0.4)' }, data: poor },
      { name: '有害', type: 'line', stack: 's', smooth: true, symbol: 'none', itemStyle: { color: '#f56c6c' }, areaStyle: { color: 'rgba(245,108,108,0.4)' }, data: bad },
    ],
  }
})

const overallDistOption = computed(() => ({
  tooltip: { trigger: 'item', formatter: '{a}<br/>{b}: {c} ({d}%)' },
  legend: { orient: 'vertical', right: 10, top: 'middle', textStyle: { fontSize: 11 } },
  series: [{
    name: '时延分布',
    type: 'pie',
    radius: ['40%', '70%'],
    center: ['40%', '50%'],
    avoidLabelOverlap: false,
    label: { show: false },
    data: [
      { value: 12509, name: '优 (25.03%)', itemStyle: { color: '#67c23a' } },
      { value: 20041, name: '正常 (40.14%)', itemStyle: { color: '#409eff' } },
      { value: 9998, name: '差 (20.20%)', itemStyle: { color: '#e6a23c' } },
      { value: 7269, name: '有害 (14.62%)', itemStyle: { color: '#f56c6c' } },
    ],
  }],
}))
</script>

<style scoped>
/* 参数设置 */
.pqs-settings-wrap { padding:18px 20px; }
.pqs-desc { color:#606266; font-size:13px; line-height:2; padding:8px 14px; background:#f8fafc; border-left:3px solid #409eff; border-radius:3px; margin-bottom:18px; }
.pqs-desc-line { margin:2px 0; }
.pqs-desc-key { color:#303133; font-weight:500; margin-right:4px; }
.pqs-thresholds { padding:0 8px; }
.pqs-th-row { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.pqs-th-cell { display:flex; align-items:center; gap:6px; padding:8px 12px; background:#fafbfc; border:1px solid #ebeef5; border-radius:4px; }
.pqs-th-tag { display:inline-block; min-width:38px; padding:3px 10px; border-radius:3px; font-size:12px; font-weight:500; text-align:center; }
.pqs-th-op { color:#909399; font-size:13px; }
.pqs-th-label { color:#606266; font-size:13px; }
.pqs-th-unit { color:#909399; font-size:12px; margin-left:-2px; }
.pqs-th-actions { margin-top:14px; }

/* 时延概况 */
.pq-scroll { flex:1; min-height:0; overflow:auto; display:flex; flex-direction:column; gap:12px; padding:12px; }
.pqs-top-grid { display:grid; grid-template-columns:2fr 1fr; gap:12px; }
.pqs-proto-grid { display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; }
.pqs-card { background:#fff; border:1px solid #ebeef5; border-radius:4px; display:flex; flex-direction:column; }
.pqs-card-head { display:flex; align-items:center; gap:10px; padding:8px 12px; border-bottom:1px solid #f0f2f5; }
.pqs-card-title { font-size:13px; font-weight:600; color:#303133; }
.pqs-card-body { padding:8px 12px; }
.pqs-range-tabs { display:flex; gap:2px; margin-left:auto; }
.pqs-range-btn { padding:2px 10px; font-size:11px; border:1px solid #dcdfe6; background:#fafbfc; color:#606266; cursor:pointer; }
.pqs-range-btn:first-child { border-radius:3px 0 0 3px; }
.pqs-range-btn:last-child { border-radius:0 3px 3px 0; }
.pqs-range-btn + .pqs-range-btn { border-left:none; }
.pqs-range-btn.active { background:#409eff; color:#fff; border-color:#409eff; }

.pqs-proto-legend { display:flex; gap:8px; font-size:11px; color:#606266; }
.pqs-legend-item { display:inline-flex; align-items:center; gap:3px; }
.pqs-legend-dot { display:inline-block; width:8px; height:8px; border-radius:50%; }

.pqs-proto-stats { display:flex; gap:14px; margin-top:4px; font-size:11px; color:#909399; flex-wrap:wrap; }
.pqs-proto-stats strong { color:#303133; font-weight:600; }

.pqs-table th, .pqs-table td { font-size:12px; padding:6px 8px; }
@media (max-width:1200px){ .pqs-top-grid { grid-template-columns:1fr; } .pqs-proto-grid { grid-template-columns:1fr 1fr; } }
</style>
