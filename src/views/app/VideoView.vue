<template>
  <div class="page">
    <!-- ── KPI 卡片 — 带宽与质量视角 ─────────────────── -->
    <el-row :gutter="14" class="kpi-row">
      <el-col :xs="12" :sm="8" :md="4">
        <StatCard label="总带宽消耗" :value="formatBytes(totalBandwidth)"
                  :sub="formatNumber(totalFlows) + ' 会话'" :icon="DataLine" tone="#ef4444" />
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <StatCard label="平均码率" :value="avgBitrate"
                  sub="估算流媒体质量" :icon="Odometer" tone="#f59e0b" />
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <StatCard label="最长会话" :value="longestSession"
                  sub="持续观看" :icon="Timer" tone="#3b82f6" />
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <StatCard label="峰值流量" :value="formatBytes(peakFlow)"
                  sub="单次最大" :icon="Top" tone="#8b5cf6" />
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <StatCard label="活跃平台" :value="formatNumber(activeApps)"
                  :sub="topPlatform" :icon="Monitor" tone="#06b6d4" />
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <StatCard label="高清占比" :value="hdRatio + '%'"
                  sub="> 2 Mbps 码率" :icon="VideoCamera" tone="#22c55e" />
      </el-col>
    </el-row>

    <!-- ── 图表行：带宽 Treemap + 会话时长分布 ─────────── -->
    <el-row :gutter="14" class="body-row">
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="section-header">
              <el-icon><Grid /></el-icon>
              <span>平台带宽消耗</span>
              <span class="muted small">面积 = 字节量</span>
            </div>
          </template>
          <div ref="treemapEl" class="chart-canvas"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="section-header">
              <el-icon><Histogram /></el-icon>
              <span>会话时长分布</span>
              <span class="muted small">流媒体特征</span>
            </div>
          </template>
          <div ref="histEl" class="chart-canvas"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- ── 流表 ──────────────────────────────────────── -->
    <el-card shadow="never" class="body-row">
      <template #header>
        <div class="section-header">
          <el-icon><VideoCamera /></el-icon>
          <span>视频流量明细</span>
          <el-tag size="small" type="info" class="count-tag">{{ filteredFlows.length }} 条</el-tag>
          <div class="table-toolbar">
            <el-input v-model="flowSearch" placeholder="搜索 IP / 平台 / CDN…" clearable
                      :prefix-icon="Search" size="small" style="width: 200px" />
            <el-select v-model="flowFilter" placeholder="平台" clearable size="small" style="width: 130px">
              <el-option label="YouTube" value="YOUTUBE" />
              <el-option label="Netflix" value="NETFLIX" />
              <el-option label="TikTok" value="TIKTOK" />
              <el-option label="RTSP/RTMP" value="RT" />
              <el-option label="其他" value="OTHER" />
            </el-select>
            <el-select v-model="qualityFilter" placeholder="码率" clearable size="small" style="width: 110px">
              <el-option label="高清 (>2M)" value="hd" />
              <el-option label="标清 (>500K)" value="sd" />
              <el-option label="低码率" value="low" />
            </el-select>
            <el-button size="small" :icon="Refresh" @click="loadFlows">刷新</el-button>
          </div>
        </div>
      </template>

      <el-table :data="filteredFlows" size="small" stripe :max-height="520"
                :default-sort="{ prop: 'bytes_count', order: 'descending' }"
                empty-text="暂无视频流量…">
        <el-table-column prop="timestamp" label="时间" width="160" sortable>
          <template #default="{ row }"><span class="mono xs">{{ formatTime(row.timestamp) }}</span></template>
        </el-table-column>
        <el-table-column label="平台" width="110">
          <template #default="{ row }">
            <el-tag size="small" :type="appTagType(row)" disable-transitions>{{ appLabel(row) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="源" min-width="130">
          <template #default="{ row }">
            <span class="mono xs">{{ prettyIP(row.five_tuple.src_ip) }}<span class="port">:{{ row.five_tuple.src_port }}</span></span>
          </template>
        </el-table-column>
        <el-table-column label="CDN / 目的" min-width="130">
          <template #default="{ row }">
            <span class="mono xs">{{ prettyIP(row.five_tuple.dst_ip) }}<span class="port">:{{ row.five_tuple.dst_port }}</span></span>
          </template>
        </el-table-column>
        <el-table-column prop="bytes_count" label="带宽" width="90" align="right" sortable>
          <template #default="{ row }">
            <span class="bandwidth-cell">{{ formatBytes(row.bytes_count) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="码率" width="95" align="right">
          <template #default="{ row }">
            <span :class="bitrateClass(row)">{{ bitrateLabel(row) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="duration_ms" label="时长" width="85" align="right" sortable>
          <template #default="{ row }">
            <span :class="{ 'long-session': row.duration_ms > 60000 }">{{ formatDurationMs(row.duration_ms) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="CDN 域名" min-width="160">
          <template #default="{ row }">
            <span class="mono xs" :title="row.host">{{ ellipsis(row.host, 30) || '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="packet_count" label="包数" width="70" align="right" sortable>
          <template #default="{ row }">{{ formatNumber(row.packet_count) }}</template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts/core'
import { TreemapChart, BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { DataLine, Monitor, Odometer, Refresh, Search, Timer, Top, VideoCamera } from '@element-plus/icons-vue'

import StatCard from '@/components/StatCard.vue'
import { api } from '@/api/client'
import type { Flow } from '@/api/types'
import { ellipsis, formatBytes, formatDurationMs, formatNumber, formatTime, prettyIP } from '@/utils/format'

echarts.use([TreemapChart, BarChart, GridComponent, TooltipComponent, CanvasRenderer])

// ── 视频/流媒体协议集 ──
const YOUTUBE_NAMES = new Set(['YouTube', 'YouTube_Upload'])
const NETFLIX_NAMES = new Set(['Netflix'])
const TIKTOK_NAMES = new Set(['TikTok'])
const RT_NAMES = new Set(['RTSP', 'RTMP', 'RTP', 'HLS', 'MPEG_DASH', 'MPEG-DASH'])
const OTHER_STREAM_NAMES = new Set([
  'Twitch', 'Disney+', 'Disney', 'Amazon_Video', 'AmazonVideo', 'Hulu', 'DAZN',
  'Vimeo', 'Dailymotion', 'Livestream', 'iQIYI', 'Tencent_Video', 'Apple_TV',
  'HBO', 'Paramount', 'Vudu', 'Showtime', 'Zattoo', 'Bilibili',
])
const ALL_VIDEO_NAMES = new Set([...YOUTUBE_NAMES, ...NETFLIX_NAMES, ...TIKTOK_NAMES, ...RT_NAMES, ...OTHER_STREAM_NAMES])

const PLATFORM_COLORS: Record<string, string> = {
  YouTube: '#ff0000', Netflix: '#e50914', TikTok: '#010101', 'RTSP/RTMP': '#06b6d4',
  Twitch: '#9146ff', 'Disney+': '#113ccf', Bilibili: '#fb7299', iQIYI: '#00be06',
}

// ── 流加载 ──
const allFlows = ref<Flow[]>([])
function isVideoFlow(f: Flow): boolean {
  const proto = ((f.master_proto || '') + ' ' + (f.app_proto || '')).toUpperCase()
  for (const n of ALL_VIDEO_NAMES) if (proto.includes(n.toUpperCase())) return true
  return false
}
async function loadFlows() {
  try { const flows = await api.recentFlows(500); allFlows.value = flows.filter(isVideoFlow) } catch { /* */ }
}

// ── KPI ──
const totalFlows = computed(() => allFlows.value.length)
const totalBandwidth = computed(() => allFlows.value.reduce((s, f) => s + (f.bytes_count || 0), 0))
const peakFlow = computed(() => allFlows.value.reduce((m, f) => Math.max(m, f.bytes_count || 0), 0))
const avgBitrate = computed(() => {
  const flows = allFlows.value.filter(f => f.duration_ms > 0)
  if (!flows.length) return '—'
  const totalBits = flows.reduce((s, f) => s + (f.bytes_count || 0) * 8, 0)
  const totalSec = flows.reduce((s, f) => s + f.duration_ms / 1000, 0)
  const bps = totalBits / totalSec
  if (bps > 1e6) return (bps / 1e6).toFixed(1) + ' Mbps'
  if (bps > 1e3) return (bps / 1e3).toFixed(0) + ' Kbps'
  return Math.round(bps) + ' bps'
})
const longestSession = computed(() => {
  const max = allFlows.value.reduce((m, f) => Math.max(m, f.duration_ms || 0), 0)
  return max > 0 ? formatDurationMs(max) : '—'
})
const activeApps = computed(() => {
  const seen = new Set<string>()
  for (const f of allFlows.value) seen.add(appLabel(f))
  return seen.size
})
const topPlatform = computed(() => {
  const counts = new Map<string, number>()
  for (const f of allFlows.value) { const l = appLabel(f); counts.set(l, (counts.get(l) ?? 0) + (f.bytes_count || 0)) }
  let top = '—'; let max = 0
  for (const [k, v] of counts) if (v > max) { max = v; top = k }
  return top
})
const hdRatio = computed(() => {
  const flows = allFlows.value.filter(f => f.duration_ms > 0)
  if (!flows.length) return 0
  const hd = flows.filter(f => ((f.bytes_count || 0) * 8) / (f.duration_ms / 1000) > 2e6)
  return Math.round(hd.length / flows.length * 100)
})

// ── 标签 helpers ──
function appLabel(row: Flow): string {
  const proto = ((row.master_proto || '') + ' ' + (row.app_proto || '')).toUpperCase()
  if ([...YOUTUBE_NAMES].some(n => proto.includes(n.toUpperCase()))) return 'YouTube'
  if (proto.includes('NETFLIX')) return 'Netflix'
  if (proto.includes('TIKTOK')) return 'TikTok'
  if (proto.includes('TWITCH')) return 'Twitch'
  if (proto.includes('DISNEY')) return 'Disney+'
  if (proto.includes('BILIBILI')) return 'Bilibili'
  if (proto.includes('IQIYI')) return 'iQIYI'
  if ([...RT_NAMES].some(n => proto.includes(n.toUpperCase()))) return 'RTSP/RTMP'
  return row.app_proto || '视频'
}
function appTagType(row: Flow): string {
  const l = appLabel(row)
  if (l === 'YouTube') return 'danger'
  if (l === 'Netflix') return 'primary'
  if (l === 'TikTok') return ''
  if (l === 'RTSP/RTMP') return 'warning'
  return 'info'
}
function bitrateLabel(row: Flow): string {
  if (!row.duration_ms) return '—'
  const bps = ((row.bytes_count || 0) * 8) / (row.duration_ms / 1000)
  if (bps > 1e6) return (bps / 1e6).toFixed(1) + 'M'
  if (bps > 1e3) return (bps / 1e3).toFixed(0) + 'K'
  return Math.round(bps) + 'b'
}
function bitrateClass(row: Flow): string {
  if (!row.duration_ms) return 'mono xs muted'
  const bps = ((row.bytes_count || 0) * 8) / (row.duration_ms / 1000)
  if (bps > 2e6) return 'mono xs bitrate-hd'
  if (bps > 500e3) return 'mono xs bitrate-sd'
  return 'mono xs bitrate-low'
}

// ── 流表筛选 ──
const flowSearch = ref('')
const flowFilter = ref('')
const qualityFilter = ref('')

function matchesFilter(f: Flow, filter: string): boolean {
  const proto = ((f.master_proto || '') + ' ' + (f.app_proto || '')).toUpperCase()
  if (filter === 'YOUTUBE') return [...YOUTUBE_NAMES].some(n => proto.includes(n.toUpperCase()))
  if (filter === 'NETFLIX') return proto.includes('NETFLIX')
  if (filter === 'TIKTOK') return proto.includes('TIKTOK')
  if (filter === 'RT') return [...RT_NAMES].some(n => proto.includes(n.toUpperCase()))
  if (filter === 'OTHER') return [...OTHER_STREAM_NAMES].some(n => proto.includes(n.toUpperCase()))
  return true
}
function matchesQuality(f: Flow, q: string): boolean {
  if (!f.duration_ms) return q === 'low'
  const bps = ((f.bytes_count || 0) * 8) / (f.duration_ms / 1000)
  if (q === 'hd') return bps > 2e6
  if (q === 'sd') return bps > 500e3 && bps <= 2e6
  return bps <= 500e3
}

const filteredFlows = computed(() => {
  let list = allFlows.value
  if (flowFilter.value) list = list.filter(f => matchesFilter(f, flowFilter.value))
  if (qualityFilter.value) list = list.filter(f => matchesQuality(f, qualityFilter.value))
  const q = flowSearch.value.toLowerCase().trim()
  if (q) list = list.filter(f => [f.five_tuple.src_ip, f.five_tuple.dst_ip, f.master_proto, f.app_proto, f.host].filter(Boolean).join(' ').toLowerCase().includes(q))
  return list
})

// ── ECharts: Treemap + Duration Histogram ──
const treemapEl = ref<HTMLElement>()
const histEl = ref<HTMLElement>()
let treemapChart: echarts.ECharts | null = null
let histChart: echarts.ECharts | null = null

function treemapData() {
  const totals = new Map<string, number>()
  for (const f of allFlows.value) {
    const label = appLabel(f)
    totals.set(label, (totals.get(label) ?? 0) + (f.bytes_count || 0))
  }
  return [...totals.entries()].map(([name, value]) => ({
    name, value,
    itemStyle: { color: PLATFORM_COLORS[name] || '#64748b' },
  }))
}

function durationHistData() {
  const buckets = [
    { label: '<5s', max: 5000 },
    { label: '5-30s', max: 30000 },
    { label: '30s-2m', max: 120000 },
    { label: '2-10m', max: 600000 },
    { label: '10-30m', max: 1800000 },
    { label: '>30m', max: Infinity },
  ]
  const counts = new Array(buckets.length).fill(0)
  for (const f of allFlows.value) {
    const d = f.duration_ms || 0
    for (let i = 0; i < buckets.length; i++) {
      if (d < buckets[i].max || i === buckets.length - 1) { counts[i]++; break }
    }
  }
  return { labels: buckets.map(b => b.label), values: counts }
}

function initTreemap() {
  if (!treemapEl.value) return
  treemapChart = echarts.init(treemapEl.value)
  treemapChart.setOption({
    tooltip: { formatter: (p: any) => `${p.name}: ${formatBytes(p.value)}` },
    series: [{
      type: 'treemap', roam: false, width: '100%', height: '100%',
      breadcrumb: { show: false },
      label: { show: true, formatter: '{b}\n{c}', fontSize: 11 },
      itemStyle: { borderColor: '#fff', borderWidth: 2, gapWidth: 2 },
      data: [],
    }],
  })
}
function initHist() {
  if (!histEl.value) return
  histChart = echarts.init(histEl.value)
  histChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 50, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: [], axisLabel: { fontSize: 11 } },
    yAxis: { type: 'value', name: '会话数', axisLabel: { fontSize: 10 } },
    series: [{
      type: 'bar', barMaxWidth: 36,
      itemStyle: { borderRadius: [4, 4, 0, 0], color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#ef4444' }, { offset: 1, color: '#fca5a5' }]) },
      data: [],
    }],
  })
}
function rebuildTreemap() {
  if (!treemapChart) return
  const d = treemapData()
  treemapChart.setOption({ series: [{ data: d }] })
}
function rebuildHist() {
  if (!histChart) return
  const { labels, values } = durationHistData()
  histChart.setOption({ xAxis: { data: labels }, series: [{ data: values }] })
}

const onResize = () => { treemapChart?.resize(); histChart?.resize() }
let flowTimer: number | null = null

onMounted(() => {
  initTreemap(); initHist()
  void loadFlows()
  flowTimer = window.setInterval(loadFlows, 5000)
  window.addEventListener('resize', onResize)
})
onBeforeUnmount(() => {
  treemapChart?.dispose(); histChart?.dispose(); treemapChart = null; histChart = null
  if (flowTimer != null) window.clearInterval(flowTimer)
  window.removeEventListener('resize', onResize)
})
watch(allFlows, () => { rebuildTreemap(); rebuildHist() }, { deep: true })
</script>

<style scoped>
.kpi-row { margin-bottom: 14px; }
.body-row { margin-bottom: 14px; }
.section-header { display: flex; align-items: center; gap: 8px; font-weight: 600; flex-wrap: wrap; }
.count-tag { margin-left: auto; }
.chart-card :deep(.el-card__body) { padding: 12px; }
.chart-canvas { width: 100%; height: 280px; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.small { font-size: 12px; }
.xs { font-size: 11px; }
.muted { color: var(--el-text-color-secondary); }
.table-toolbar { display: flex; align-items: center; gap: 8px; margin-left: auto; }
.port { color: var(--el-text-color-secondary); }
.bandwidth-cell { font-weight: 600; font-size: 12px; }
.bitrate-hd { color: #22c55e; font-weight: 700; }
.bitrate-sd { color: #f59e0b; font-weight: 600; }
.bitrate-low { color: var(--el-text-color-secondary); }
.long-session { color: #3b82f6; font-weight: 600; }
</style>
