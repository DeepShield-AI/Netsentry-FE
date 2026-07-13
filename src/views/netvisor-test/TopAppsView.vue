<template>
  <div class="nv-page">
    <el-card shadow="never">
      <template #header><div class="card-header"><span>Top 应用</span>
        <el-button size="small" :icon="Refresh" circle @click="load" :loading="loading" /></div></template>
      <el-row :gutter="16">
        <el-col :span="10">
          <div ref="pieRef" class="chart-box" />
        </el-col>
        <el-col :span="14">
          <div ref="barRef" class="chart-box" />
        </el-col>
      </el-row>
      <el-table :data="apps" stripe size="small" style="margin-top:12px" max-height="320">
        <el-table-column type="index" width="50" />
        <el-table-column prop="name" label="应用" min-width="120" />
        <el-table-column prop="bytes" label="流量" sortable min-width="100">
          <template #default="{ row }">{{ fmtBytes(row.bytes || 0) }}</template>
        </el-table-column>
        <el-table-column prop="packets" label="包数" sortable min-width="80">
          <template #default="{ row }">{{ fmtNum(row.packets || 0) }}</template>
        </el-table-column>
        <el-table-column prop="flows" label="流数" sortable min-width="70" />
        <el-table-column prop="pct" label="占比" min-width="70">
          <template #default="{ row }">{{ row.pct?.toFixed(1) }}%</template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { fmtBytes, fmtNum } from './api'

const loading = ref(false)
const pieRef = ref<HTMLElement | null>(null)
const barRef = ref<HTMLElement | null>(null)
const apps = ref<any[]>([])
// Persist chart instances so ECharts diffs & animates instead of flashing.
const charts: Map<string, echarts.ECharts> = new Map()
const COLORS = ['#5470c6','#91cc75','#fac858','#ee6666','#73c0de','#3ba272','#fc8452','#9a60b4','#ea7ccc','#ff9f7f']

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

async function load() {
  loading.value = true
  try {
    const resp = await fetch('/ndpi/named')
    const data = await resp.json()
    const protocols: any[] = data?.protocols || []
    const total = protocols.reduce((s, p) => s + (p.bytes || 0), 0) || 1
    apps.value = protocols.map(p => ({ ...p, pct: (p.bytes || 0) / total * 100 })).sort((a, b) => b.bytes - a.bytes)
    renderCharts()
  } catch { /* silent */ } finally { loading.value = false }
}

function renderCharts() {
  const top10 = apps.value.slice(0, 10)
  if (pieRef.value) {
    const c = getChart('pie', pieRef.value, {
      animation: true, animationDurationUpdate: 500,
      tooltip: { trigger: 'item', formatter: '{b}: {d}%' },
      series: [{ type: 'pie', radius: ['35%','65%'], label: { fontSize: 11 }, data: [] }],
    })
    c.setOption({ series: [{ data: top10.map((d, i) => ({ name: d.name, value: d.bytes, itemStyle: { color: COLORS[i % COLORS.length] } })) }] })
  }
  if (barRef.value) {
    const c = getChart('bar', barRef.value, {
      animation: true, animationDurationUpdate: 500, animationEasingUpdate: 'cubicOut',
      tooltip: { trigger: 'axis' }, grid: { left: 100, right: 20, top: 10, bottom: 20 },
      xAxis: { type: 'value' }, yAxis: { type: 'category', data: [], axisLabel: { fontSize: 11 } },
      series: [{ type: 'bar', data: [] }],
    })
    c.setOption({
      yAxis: { data: top10.map(d => d.name).reverse() },
      series: [{ data: top10.map((d, i) => ({ value: d.bytes, itemStyle: { color: COLORS[i % COLORS.length] } })).reverse() }],
    })
  }
}

onMounted(() => { load(); window.addEventListener('resize', resizeCharts) })
onBeforeUnmount(() => { charts.forEach(c => c.dispose()); charts.clear(); window.removeEventListener('resize', resizeCharts) })
</script>

<style scoped>
.card-header { display: flex; align-items: center; justify-content: space-between; }
.chart-box { height: 300px; }
</style>
