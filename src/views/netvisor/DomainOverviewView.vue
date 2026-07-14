<template>
  <div class="nv-page">
    <el-card shadow="never">
      <template #header><div class="card-header"><span>域名概况</span>
        <el-button size="small" :icon="Refresh" circle @click="load" :loading="loading" /></div></template>
      <el-row :gutter="16">
        <el-col :span="10"><div ref="pieRef" class="chart-box" /></el-col>
        <el-col :span="14"><div ref="barRef" class="chart-box" /></el-col>
      </el-row>
      <el-table :data="items" stripe size="small" style="margin-top:12px" max-height="320">
        <el-table-column type="index" width="50" />
        <el-table-column prop="domain" label="域名" min-width="200" />
        <el-table-column prop="count" label="请求次数" sortable min-width="100" />
        <el-table-column prop="bytes" label="流量" sortable min-width="100">
          <template #default="{ row }">{{ fmtBytes(row.bytes || 0) }}</template>
        </el-table-column>
        <el-table-column prop="users" label="用户数" sortable min-width="80" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { fmtBytes } from './api'
import { mockTopDomains } from './mock-data'

const loading = ref(false)
const pieRef = ref<HTMLElement | null>(null)
const barRef = ref<HTMLElement | null>(null)
const items = ref<any[]>([])
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
    const data = await fetch('/traffic/top-domains?n=30').then(r => r.json()).catch(() => mockTopDomains())
    const arr: any[] = Array.isArray(data) ? data : []
    items.value = arr.map(e => ({
      domain: e.key || '',
      count: e.sessions || 0,
      bytes: e.bytes || 0,
      packets: e.packets || 0,
      users: '-',
    }))
    renderCharts()
  } catch { items.value = [] } finally { loading.value = false }
}

function renderCharts() {
  const top10 = items.value.slice(0, 10)
  if (pieRef.value && top10.length) {
    const c = getChart('pie', pieRef.value, {
      animation: true, animationDurationUpdate: 500,
      tooltip: { trigger: 'item' },
      series: [{ type: 'pie', radius: ['35%','65%'], label: { fontSize: 10 }, data: [] }],
    })
    c.setOption({ series: [{ data: top10.map((d, i) => ({ name: d.domain, value: d.count || d.bytes || 1, itemStyle: { color: COLORS[i % COLORS.length] } })) }] })
  }
  if (barRef.value && top10.length) {
    const c = getChart('bar', barRef.value, {
      animation: true, animationDurationUpdate: 500, animationEasingUpdate: 'cubicOut',
      tooltip: { trigger: 'axis' }, grid: { left: 140, right: 20, top: 10, bottom: 20 },
      xAxis: { type: 'value' }, yAxis: { type: 'category', data: [], axisLabel: { fontSize: 10, width: 120, overflow: 'truncate' } },
      series: [{ type: 'bar', data: [] }],
    })
    c.setOption({
      yAxis: { data: top10.map(d => d.domain).reverse() },
      series: [{ data: top10.map((d, i) => ({ value: d.count || d.bytes || 0, itemStyle: { color: COLORS[i % COLORS.length] } })).reverse() }],
    })
  }
}

let timer: any = null
onMounted(() => { load(); timer = setInterval(load, 10000); window.addEventListener('resize', resizeCharts) })
onBeforeUnmount(() => { if (timer) clearInterval(timer); charts.forEach(c => c.dispose()); charts.clear(); window.removeEventListener('resize', resizeCharts) })
</script>

<style scoped>
.card-header { display: flex; align-items: center; justify-content: space-between; }
.chart-box { height: 300px; }
</style>