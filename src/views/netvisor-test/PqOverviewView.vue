<template>
  <div class="pq-overview">
    <el-card shadow="never" class="section-card">
      <template #header>
        <div class="card-header">
          <span>协议质量概况</span>
          <el-radio-group v-model="activeTab" size="small">
            <el-radio-button value="realtime">实时</el-radio-button>
            <el-radio-button value="history">历史</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <!-- 时延分布趋势 -->
      <el-row :gutter="16">
        <el-col :span="16">
          <h4 class="chart-title">时延分布趋势</h4>
          <div ref="latencyTrendRef" class="chart-box" />
        </el-col>
        <el-col :span="8">
          <h4 class="chart-title">时延分布占比</h4>
          <div ref="latencyPieRef" class="chart-box" />
        </el-col>
      </el-row>

      <!-- 平均时延 + 无应答率 -->
      <el-row :gutter="16" style="margin-top: 16px;">
        <el-col :span="12">
          <h4 class="chart-title">平均时延 (ms)</h4>
          <div ref="avgLatencyRef" class="chart-box-sm" />
        </el-col>
        <el-col :span="12">
          <h4 class="chart-title">无应答率 (%)</h4>
          <div ref="failRateRef" class="chart-box-sm" />
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'

const activeTab = ref('realtime')

const latencyTrendRef = ref<HTMLElement | null>(null)
const latencyPieRef = ref<HTMLElement | null>(null)
const avgLatencyRef = ref<HTMLElement | null>(null)
const failRateRef = ref<HTMLElement | null>(null)

const charts: Map<string, echarts.ECharts> = new Map()
function getChart(id: string, container: HTMLElement, baseOption: any): echarts.ECharts {
  let c = charts.get(id)
  if (!c) {
    c = echarts.init(container)
    c.setOption(baseOption)
    charts.set(id, c)
  }
  return c
}
function resizeCharts() { charts.forEach(c => c.resize()) }
function disposeAllCharts() { charts.forEach(c => c.dispose()); charts.clear() }

const BUCKETS = [
  { name: '(0, 5]', color: '#5470c6' },
  { name: '(5, 10]', color: '#91cc75' },
  { name: '(10, 20]', color: '#fac858' },
  { name: '(20, 30]', color: '#ee6666' },
  { name: '(30, 40]', color: '#73c0de' },
  { name: '(40, 50]', color: '#3ba272' },
  { name: '(50, 80]', color: '#fc8452' },
  { name: '(80, 120]', color: '#9a60b4' },
  { name: '(120, 200]', color: '#ea7ccc' },
  { name: '>= 200ms', color: '#ff9f7f' },
  { name: '无应答', color: '#dcdfe6' },
]

const RT_X = ['12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '15.Jun', '02:00', '04:00', '06:00', '08:00', '10:00']
const HD_X = Array.from({ length: 14 }, (_, i) => {
  const min = 58 + i
  const h = min >= 60 ? 10 : 9
  const m = min >= 60 ? min - 60 : min
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
})

const RT_BUCKET_PCTS = [0.1125, 0.0582, 0.0416, 0.0328, 0.0264, 0.0218, 0.0342, 0.0286, 0.0212, 0.0323, 0.5904]
const HD_BUCKET_PCTS = [0.3558, 0.0482, 0.0316, 0.0228, 0.0164, 0.0118, 0.0142, 0.0086, 0.0052, 0.0055, 0.4799]

const RT_TOTALS = [1200, 1285, 1150, 1350, 1240, 1310, 1616, 1180, 1125, 1290, 1380, 1420]
const HD_TOTALS = [285, 310, 347, 298, 265, 278, 320, 75, 168, 240, 305, 252, 290, 268]

const RT_PIE = [
  { value: 11.25, name: '(0, 5]' }, { value: 5.82, name: '(5, 10]' },
  { value: 4.16, name: '(10, 20]' }, { value: 3.28, name: '(20, 30]' },
  { value: 2.64, name: '(30, 40]' }, { value: 2.18, name: '(40, 50]' },
  { value: 3.42, name: '(50, 80]' }, { value: 2.86, name: '(80, 120]' },
  { value: 2.12, name: '(120, 200]' }, { value: 3.23, name: '>= 200ms' },
  { value: 59.04, name: '无应答' },
]
const HD_PIE = [
  { value: 35.58, name: '(0, 5]' }, { value: 4.82, name: '(5, 10]' },
  { value: 3.16, name: '(10, 20]' }, { value: 2.28, name: '(20, 30]' },
  { value: 1.64, name: '(30, 40]' }, { value: 1.18, name: '(40, 50]' },
  { value: 1.42, name: '(50, 80]' }, { value: 0.86, name: '(80, 120]' },
  { value: 0.52, name: '(120, 200]' }, { value: 0.55, name: '>= 200ms' },
  { value: 47.99, name: '无应答' },
]

const RT_AVG = [72, 86, 68, 92, 78, 84, 125, 58, 64, 88, 76, 82]
const HD_AVG = [42, 58, 36, 72, 48, 64, 88, 28, 32, 52, 44, 38, 46, 31]
const RT_FAIL = [58, 62, 56, 68, 64, 60, 74, 66, 58, 62, 60, 56]
const HD_FAIL = [59, 48, 46, 44, 45, 46, 44, 45, 46, 47, 45, 44, 46, 45]

function wobble(i: number, layer: number) {
  return 1 + Math.sin(i * 0.65 + layer * 1.1) * 0.06
}

function buildStackData(totals: number[], pcts: number[]) {
  return BUCKETS.map((b, layer) => ({
    name: b.name,
    type: 'bar' as const,
    stack: 'latency',
    itemStyle: { color: b.color },
    data: totals.map((t, i) => Math.round(t * pcts[layer] * wobble(i, layer))),
  }))
}

function renderCharts() {
  const isRT = activeTab.value === 'realtime'
  const xData = isRT ? RT_X : HD_X
  const totals = isRT ? RT_TOTALS : HD_TOTALS
  const pcts = isRT ? RT_BUCKET_PCTS : HD_BUCKET_PCTS
  const pieData = isRT ? RT_PIE : HD_PIE
  const avgData = isRT ? RT_AVG : HD_AVG
  const failData = isRT ? RT_FAIL : HD_FAIL

  // Stacked bar trend
  if (latencyTrendRef.value) {
    const c = getChart('trend', latencyTrendRef.value, {
      animation: true, animationDurationUpdate: 500, animationEasingUpdate: 'cubicOut',
      tooltip: { trigger: 'axis' },
      legend: { show: false },
      grid: { left: 50, right: 10, top: 10, bottom: 30 },
      xAxis: { type: 'category', data: [] },
      yAxis: { type: 'value', axisLabel: { formatter: (v: number) => `${v}k` } },
      series: BUCKETS.map(b => ({ name: b.name, type: 'bar', stack: 'latency', itemStyle: { color: b.color }, data: [] })),
    })
    const stack = buildStackData(totals, pcts)
    c.setOption({
      xAxis: { data: xData },
      series: stack.map(s => ({ data: s.data })),
    })
  }

  // Pie chart
  if (latencyPieRef.value) {
    const c = getChart('pie', latencyPieRef.value, {
      animation: true, animationDurationUpdate: 500,
      tooltip: { trigger: 'item', formatter: '{b}: {c}%' },
      series: [{ type: 'pie', radius: ['40%', '70%'], label: { show: false }, data: [] }],
    })
    c.setOption({
      series: [{ data: pieData.map(d => ({ ...d, itemStyle: { color: BUCKETS.find(b => b.name === d.name)?.color } })) }],
    })
  }

  // Avg latency line
  if (avgLatencyRef.value) {
    const c = getChart('avg', avgLatencyRef.value, {
      animation: true, animationDurationUpdate: 500, animationEasingUpdate: 'cubicOut',
      tooltip: { trigger: 'axis' },
      grid: { left: 40, right: 10, top: 10, bottom: 30 },
      xAxis: { type: 'category', data: [] },
      yAxis: { type: 'value' },
      series: [{ type: 'line', smooth: true, data: [], itemStyle: { color: '#5470c6' } }],
    })
    c.setOption({ xAxis: { data: xData }, series: [{ data: avgData }] })
  }

  // Fail rate line
  if (failRateRef.value) {
    const c = getChart('fail', failRateRef.value, {
      animation: true, animationDurationUpdate: 500, animationEasingUpdate: 'cubicOut',
      tooltip: { trigger: 'axis' },
      grid: { left: 40, right: 10, top: 10, bottom: 30 },
      xAxis: { type: 'category', data: [] },
      yAxis: { type: 'value', axisLabel: { formatter: '{value}%' } },
      series: [{ type: 'line', smooth: true, data: [], itemStyle: { color: '#ee6666' } }],
    })
    c.setOption({ xAxis: { data: xData }, series: [{ data: failData }] })
  }
}

// Tab switch changes x-axis length so we drop instances and re-init.
watch(activeTab, () => { disposeAllCharts(); nextTick(renderCharts) })

onMounted(() => {
  nextTick(renderCharts)
  window.addEventListener('resize', resizeCharts)
})

onBeforeUnmount(() => {
  disposeAllCharts()
  window.removeEventListener('resize', resizeCharts)
})
</script>

<style scoped>
.pq-overview { padding: 0; }
.section-card { margin-bottom: 16px; }
.card-header { display: flex; align-items: center; justify-content: space-between; }
.chart-title { font-size: 13px; color: var(--el-text-color-secondary); margin: 0 0 8px 0; font-weight: 500; }
.chart-box { height: 280px; }
.chart-box-sm { height: 200px; }
</style>
