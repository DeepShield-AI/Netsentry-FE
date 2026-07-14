<template>
  <div class="ta-page">
    <div class="ta-card">
      <div class="ta-card-header">
        <span class="ta-card-title">Top应用</span>
        <span class="ta-card-extra">📦 共 {{ apps.length }} 个应用</span>
      </div>
      <div class="ta-card-body">
        <div class="ta-chart" ref="chartEl"></div>
        <table class="ta-table">
          <thead>
            <tr>
              <th style="width:70px">排名</th>
              <th>应用名称</th>
              <th>连接数</th>
              <th>上行速率</th>
              <th>下行速率</th>
              <th>总流量</th>
              <th>流量占比</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in pagedApps" :key="row.name">
              <td><span v-if="globalIdx(idx) <= 3" :class="['ta-rank', 'ta-rank-' + globalIdx(idx)]">{{ globalIdx(idx) }}</span><span v-else>{{ globalIdx(idx) }}</span></td>
              <td><strong>{{ row.name }}</strong></td>
              <td>{{ fmtNum(row.flows || 0) }}</td>
              <td>{{ fmtRate(row.bytes_out || 0) }}</td>
              <td>{{ fmtRate(row.bytes_in || 0) }}</td>
              <td>{{ fmtBytes(row.bytes || 0) }}</td>
              <td>{{ row.pct.toFixed(1) }}%</td>
            </tr>
            <tr v-if="!apps.length">
              <td colspan="7" class="ta-empty">暂无数据</td>
            </tr>
          </tbody>
        </table>
        <div class="ta-pagination" v-if="apps.length > pageSize">
          <span class="ta-page-total">共 {{ apps.length }} 条</span>
          <button class="ta-page-btn" :disabled="currentPage <= 1" @click="currentPage--">&lt;</button>
          <span class="ta-page-num">{{ currentPage }} / {{ totalPages }}</span>
          <button class="ta-page-btn" :disabled="currentPage >= totalPages" @click="currentPage++">&gt;</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { mockTopApps } from './mock-data'

const apps = ref<any[]>([])
const currentPage = ref(1)
const pageSize = 20
const chartEl = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

const totalPages = computed(() => Math.max(1, Math.ceil(apps.value.length / pageSize)))
const pagedApps = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return apps.value.slice(start, start + pageSize)
})
function globalIdx(idx: number) { return (currentPage.value - 1) * pageSize + idx + 1 }

function fmtBytes(b: number): string {
  if (!b) return '0 B'
  if (b >= 1e9) return (b / 1e9).toFixed(1) + ' GB'
  if (b >= 1e6) return (b / 1e6).toFixed(1) + ' MB'
  if (b >= 1e3) return (b / 1e3).toFixed(1) + ' KB'
  return b.toFixed(0) + ' B'
}
function fmtRate(b: number): string {
  if (b >= 1e6) return (b / 1e6).toFixed(2) + ' MB/s'
  if (b >= 1e3) return (b / 1e3).toFixed(2) + ' KB/s'
  return b.toFixed(0) + ' B/s'
}
function fmtNum(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return String(Math.round(n))
}

function renderChart() {
  if (!chartEl.value) return
  if (!chart) chart = echarts.init(chartEl.value)
  const top10 = apps.value.slice(0, 10)
  chart.setOption({
    title: { text: 'Top应用流量分布', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['上行', '下行'], bottom: 0 },
    grid: { left: 60, right: 20, top: 40, bottom: 60 },
    xAxis: { type: 'category', data: top10.map(d => d.name), axisLabel: { rotate: 30 } },
    yAxis: { type: 'value', name: 'MB/s' },
    series: [
      { name: '上行', type: 'bar', stack: 'total', data: top10.map(d => +((d.bytes_out || 0) / 1e6).toFixed(2)), itemStyle: { color: '#2a88e6' } },
      { name: '下行', type: 'bar', stack: 'total', data: top10.map(d => +((d.bytes_in || 0) / 1e6).toFixed(2)), itemStyle: { color: '#52c41a' } },
    ],
  })
}

async function load() {
  try {
    const data: any[] = await fetch('/traffic/top-apps?n=50').then(r => r.json()).catch(() => mockTopApps())
    const arr = Array.isArray(data) ? data : []
    const totalBytes = arr.reduce((s: number, p: any) => s + (p.bytes || 0), 0) || 1
    apps.value = arr.map((p: any) => ({
      name: p.key || 'Unknown',
      flows: p.sessions || 0,
      bytes: p.bytes || 0,
      packets: p.packets || 0,
      bytes_in: p.bytes_in || 0,
      bytes_out: p.bytes_out || 0,
      pct: (p.bytes || 0) / totalBytes * 100,
    }))
    renderChart()
  } catch { /* silent */ }
}

function handleResize() { chart?.resize() }

let timer: any = null
onMounted(() => {
  load()
  timer = setInterval(load, 5000)
  window.addEventListener('resize', handleResize)
})
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  chart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.ta-page { padding: 0 4px; }
.ta-card {
  background: #fff;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  overflow: hidden;
}
.ta-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid #f0f0f0;
}
.ta-card-title { font-size: 16px; font-weight: 600; color: #303133; }
.ta-card-extra { font-size: 13px; color: #606266; }
.ta-card-body { padding: 0; }

.ta-chart { height: 350px; padding: 16px; }

.ta-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.ta-table th {
  text-align: left; padding: 10px 12px; background: #fafafa;
  color: #606266; font-weight: 600; border-bottom: 1px solid #ebeef5; white-space: nowrap;
}
.ta-table td { padding: 9px 12px; border-bottom: 1px solid #f0f0f0; color: #303133; }
.ta-table tbody tr:hover { background: #f5f7fa; }
.ta-empty { text-align: center; color: #909399; padding: 40px 0 !important; }

.ta-rank {
  display: inline-block; width: 22px; height: 22px; line-height: 22px;
  text-align: center; border-radius: 4px; font-size: 12px; font-weight: 700; color: #fff;
}
.ta-rank-1 { background: #faad14; }
.ta-rank-2 { background: #bfbfbf; }
.ta-rank-3 { background: #d48806; }

.ta-pagination {
  display: flex; align-items: center; justify-content: flex-end;
  gap: 8px; padding: 12px 20px; border-top: 1px solid #f0f0f0;
}
.ta-page-total { font-size: 13px; color: #909399; margin-right: 8px; }
.ta-page-btn {
  width: 28px; height: 28px; border: 1px solid #d9d9d9; border-radius: 4px;
  background: #fff; cursor: pointer; font-size: 13px; color: #303133;
}
.ta-page-btn:disabled { color: #c0c4cc; cursor: not-allowed; }
.ta-page-btn:hover:not(:disabled) { border-color: #1890ff; color: #1890ff; }
.ta-page-num { font-size: 13px; color: #303133; }
</style>