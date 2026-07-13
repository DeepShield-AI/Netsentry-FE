<template>
  <div class="nv-page">
    <el-card shadow="never">
      <template #header><div class="card-header"><span>协议时延</span></div></template>
      <div ref="chartRef" class="chart-box" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'

const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

function render() {
  if (!chartRef.value) return
  if (!chart) chart = echarts.init(chartRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 50, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: ['12:00','14:00','16:00','18:00','20:00','22:00','00:00','02:00','04:00','06:00','08:00','10:00'] },
    yAxis: { type: 'value' },
    series: [{ type: 'line', smooth: true, data: [12,15,11,22,18,16,28,8,7,14,12,15], areaStyle: { opacity: 0.15 }, itemStyle: { color: '#5470c6' } }]
  })
}

onMounted(() => { render(); window.addEventListener('resize', () => chart?.resize()) })
onBeforeUnmount(() => { chart?.dispose() })
</script>

<style scoped>
.card-header { display: flex; align-items: center; justify-content: space-between; }
.chart-box { height: 400px; }
</style>
