<template>
  <div class="nv-page">
    <el-card shadow="never">
      <template #header><div class="card-header"><span>{{ title }}</span></div></template>
      <div v-if="chartMode" ref="chartRef" class="chart-box" />
      <el-table v-if="tableMode" :data="tableData" stripe size="small" max-height="500">
        <el-table-column v-for="col in columns" :key="col.prop" :prop="col.prop" :label="col.label" :min-width="col.width || 100" :sortable="col.sortable" show-overflow-tooltip />
      </el-table>
      <el-empty v-if="!chartMode && !tableMode" description="暂无数据，功能开发中" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import * as echarts from 'echarts'

const props = defineProps<{
  title: string
  pageType?: 'chart' | 'table' | 'empty'
  chartOption?: any
  tableData?: any[]
  columns?: { prop: string; label: string; width?: number; sortable?: boolean }[]
}>()

const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

const chartMode = computed(() => props.pageType === 'chart' && props.chartOption)
const tableMode = computed(() => props.pageType === 'table' && props.tableData?.length)

onMounted(() => {
  if (chartMode.value && chartRef.value) {
    chart = echarts.init(chartRef.value)
    chart.setOption(props.chartOption)
    window.addEventListener('resize', () => chart?.resize())
  }
})

onBeforeUnmount(() => { chart?.dispose() })
</script>

<style scoped>
.card-header { display: flex; align-items: center; justify-content: space-between; }
.chart-box { height: 400px; }
</style>
