<template>
  <div class="stats-view">
    <div class="stats-header">
      <h2>捕获统计</h2>
      <button class="btn" @click="load">
        <svg viewBox="0 0 24 24" width="12" height="12"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" fill="none" stroke="currentColor" stroke-width="2"/></svg>
        刷新
      </button>
    </div>

    <div v-if="loading" class="stats-loading">加载统计中...</div>

    <template v-else>
      <!-- KPI Cards -->
      <div class="stats-kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">总会话 (环形缓冲)</div>
          <div class="kpi-value">{{ formatNumber(totals.flows) }}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">DNS 会话</div>
          <div class="kpi-value">{{ formatNumber(totals.dns) }}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">HTTP 会话</div>
          <div class="kpi-value">{{ formatNumber(totals.http) }}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">TLS 会话</div>
          <div class="kpi-value">{{ formatNumber(totals.tls) }}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">ICMP 会话</div>
          <div class="kpi-value">{{ formatNumber(totals.icmp) }}</div>
        </div>
      </div>

      <!-- Agent Stats -->
      <div v-if="agentStats" class="stats-section">
        <h3>代理状态</h3>
        <table class="stats-table">
          <tbody>
            <tr><td class="label">运行时间</td><td>{{ agentStats.uptime || '—' }}</td></tr>
            <tr><td class="label">版本</td><td>{{ agentStats.version || '—' }}</td></tr>
            <tr><td class="label">CPU 使用率</td><td>{{ agentStats.cpu_percent != null ? agentStats.cpu_percent.toFixed(1) + '%' : '—' }}</td></tr>
            <tr><td class="label">内存</td><td>{{ agentStats.mem_rss != null ? formatBytes(agentStats.mem_rss) : '—' }}</td></tr>
            <tr><td class="label">协程数</td><td>{{ agentStats.goroutines || '—' }}</td></tr>
          </tbody>
        </table>
      </div>

      <!-- PCAP Storage -->
      <div v-if="pcapStats" class="stats-section">
        <h3>PCAP 存储</h3>
        <table class="stats-table">
          <tbody>
            <tr><td class="label">状态</td><td>{{ pcapStats.enabled ? '已启用' : '已禁用' }}</td></tr>
            <tr><td class="label">存储目录</td><td class="mono">{{ pcapStats.dir || '—' }}</td></tr>
            <tr><td class="label">总大小</td><td>{{ formatBytes(pcapStats.total_bytes || 0) }}</td></tr>
            <tr><td class="label">文件数</td><td>{{ formatNumber(pcapStats.file_count || 0) }}</td></tr>
            <tr><td class="label">活动分段</td><td>{{ pcapStats.active || 0 }}</td></tr>
            <tr v-if="pcapStats.oldest"><td class="label">最旧分段</td><td class="mono">{{ fmtTime(pcapStats.oldest) }}</td></tr>
            <tr v-if="pcapStats.newest"><td class="label">最新分段</td><td class="mono">{{ fmtTime(pcapStats.newest) }}</td></tr>
          </tbody>
        </table>
      </div>

      <!-- nDPI Protocol Distribution -->
      <div v-if="ndpiData.length" class="stats-section">
        <h3>协议分布 (nDPI)</h3>
        <div ref="ndpiChartEl" class="stats-chart"></div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import * as echarts from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { LegendComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { api } from '@/api/client'
import { formatBytes, formatNumber } from '@/utils/format'

echarts.use([PieChart, LegendComponent, TooltipComponent, CanvasRenderer])

const loading = ref(false)
const totals = ref({ dns: 0, http: 0, tls: 0, icmp: 0, flows: 0 })
const agentStats = ref<any>(null)
const pcapStats = ref<any>(null)
const ndpiData = ref<{ name: string; value: number }[]>([])
const ndpiChartEl = ref<HTMLElement>()
let ndpiChart: echarts.ECharts | null = null

function fmtTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
}

async function load() {
  loading.value = true
  try {
    const [t, s, p, n] = await Promise.all([
      api.sessionTotals().catch(() => ({ dns: 0, http: 0, tls: 0, icmp: 0, flows: 0 })),
      api.stats().catch(() => null),
      api.pcapStats().catch(() => null),
      api.ndpiNamed().catch(() => null),
    ])
    totals.value = t
    agentStats.value = s
    pcapStats.value = p
    if (n && typeof n === 'object') {
      const entries: { name: string; value: number }[] = []
      for (const [name, val] of Object.entries(n)) {
        if (typeof val === 'number' && val > 0) entries.push({ name, value: val })
      }
      entries.sort((a, b) => b.value - a.value)
      ndpiData.value = entries.slice(0, 20)
    }
    await nextTick()
    buildNdpiChart()
  } catch { /* silent */ } finally { loading.value = false }
}

function buildNdpiChart() {
  if (!ndpiChart || !ndpiData.value.length) return
  ndpiChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { show: true, type: 'scroll', orient: 'vertical', right: 10, top: 20, textStyle: { fontSize: 11 } },
    series: [{
      type: 'pie',
      radius: ['30%', '65%'],
      center: ['35%', '50%'],
      data: ndpiData.value,
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 12, fontWeight: 'bold' } },
    }],
  }, true)
}

function handleResize() { ndpiChart?.resize() }

onMounted(() => {
  load()
  setTimeout(() => {
    if (ndpiChartEl.value) { ndpiChart = echarts.init(ndpiChartEl.value) ; buildNdpiChart() }
  }, 100)
  window.addEventListener('resize', handleResize)
})
onBeforeUnmount(() => { ndpiChart?.dispose(); window.removeEventListener('resize', handleResize) })
</script>

<style scoped>
.stats-view { font-size: 13px; padding: 16px; }
.stats-header {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;
}
.stats-header h2 { margin: 0; font-size: 16px; font-weight: 600; color: var(--el-text-color-primary, #303030); }
.btn {
  display: inline-flex; align-items: center; gap: 4px; padding: 5px 12px;
  border: 1px solid var(--el-border-color, #dcdfe6); border-radius: 4px; background: #fff; color: var(--el-text-color-regular, #606266);
  font-size: 12px; cursor: pointer;
}
.btn:hover { background: var(--el-fill-color-light, #f5f7fa); }
.stats-loading { padding: 48px; text-align: center; color: var(--el-text-color-secondary, #909399); }

/* KPI Grid */
.stats-kpi-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 14px; margin-bottom: 20px;
}
.kpi-card {
  border: 1px solid var(--el-border-color-lighter, #ebeef5); border-radius: var(--sg-card-radius, 8px); padding: 14px 16px;
  background: #fff; text-align: center;
}
.kpi-label { font-size: 11px; color: var(--el-text-color-secondary, #909399); text-transform: uppercase; letter-spacing: 0.03em; margin-bottom: 4px; }
.kpi-value { font-size: 22px; font-weight: 700; color: var(--el-color-primary, #409eff); }

/* Sections */
.stats-section {
  margin-bottom: 16px; border: 1px solid var(--el-border-color-lighter, #ebeef5); border-radius: var(--sg-card-radius, 8px); overflow: hidden; background: #fff;
}
.stats-section h3 {
  margin: 0; padding: 10px 14px; font-size: 13px; font-weight: 600;
  color: var(--el-color-primary, #409eff); background: var(--el-fill-color-lighter, #fafcff); border-bottom: 1px solid var(--el-border-color-extra-light, #f2f6fc);
}
.stats-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.stats-table td { padding: 8px 14px; border-bottom: 1px solid var(--el-border-color-extra-light, #f2f6fc); }
.stats-table td.label { font-weight: 500; color: var(--el-text-color-secondary, #909399); width: 180px; }
.stats-table tr:last-child td { border-bottom: none; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; }
.stats-chart { width: 100%; height: 280px; }
</style>
