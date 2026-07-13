<template>
  <div class="page">
    <!-- ── KPI 卡片 — 通信安全视角 ───────────────────── -->
    <el-row :gutter="14" class="kpi-row">
      <el-col :xs="12" :sm="8" :md="4">
        <StatCard label="加密覆盖" :value="encryptedRatio + '%'"
                  :sub="formatNumber(encryptedCount) + '/' + formatNumber(totalFlows) + ' 流'" :icon="Lock" tone="#22c55e" />
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <StatCard label="活跃会话" :value="formatNumber(totalFlows)"
                  :sub="activeApps + ' 种 IM'" :icon="ChatDotRound" tone="#3b82f6" />
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <StatCard label="总流量" :value="formatBytes(totalBytes)"
                  sub="IM 带宽消耗" :icon="DataLine" tone="#f59e0b" />
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <StatCard label="最长通话" :value="longestCall"
                  sub="持续连接" :icon="Phone" tone="#8b5cf6" />
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <StatCard label="国内 IM" :value="formatNumber(domesticCount)"
                  sub="微信/QQ/钉钉" :icon="ChatLineSquare" tone="#07c160" />
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <StatCard label="国际 IM" :value="formatNumber(internationalCount)"
                  sub="Telegram/WhatsApp/…" :icon="Promotion" tone="#0088cc" />
      </el-col>
    </el-row>

    <!-- ── 图表行：加密仪表盘 + 雷达图 ────────────────── -->
    <el-row :gutter="14" class="body-row">
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="section-header">
              <el-icon><Lock /></el-icon>
              <span>通信加密覆盖率</span>
              <span class="muted small">安全态势</span>
            </div>
          </template>
          <div ref="gaugeEl" class="chart-canvas"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="section-header">
              <el-icon><DataAnalysis /></el-icon>
              <span>应用多维对比</span>
              <span class="muted small">流量/会话/时长/包数</span>
            </div>
          </template>
          <div ref="radarEl" class="chart-canvas"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- ── 流表 ──────────────────────────────────────── -->
    <el-card shadow="never" class="body-row">
      <template #header>
        <div class="section-header">
          <el-icon><ChatDotRound /></el-icon>
          <span>聊天流量明细</span>
          <el-tag size="small" type="info" class="count-tag">{{ filteredFlows.length }} 条</el-tag>
          <div class="table-toolbar">
            <el-input v-model="flowSearch" placeholder="搜索 IP / 应用 / 主机…" clearable
                      :prefix-icon="Search" size="small" style="width: 200px" />
            <el-select v-model="flowFilter" placeholder="应用" clearable size="small" style="width: 140px">
              <el-option label="微信/QQ" value="WECHAT" />
              <el-option label="Telegram" value="TELEGRAM" />
              <el-option label="WhatsApp" value="WHATSAPP" />
              <el-option label="Discord/Slack" value="DISCORD" />
              <el-option label="其他" value="OTHER" />
            </el-select>
            <el-select v-model="encFilter" placeholder="加密" clearable size="small" style="width: 100px">
              <el-option label="加密" value="enc" />
              <el-option label="明文" value="plain" />
            </el-select>
            <el-button size="small" :icon="Refresh" @click="loadFlows">刷新</el-button>
          </div>
        </div>
      </template>

      <el-table :data="filteredFlows" size="small" stripe :max-height="520"
                :default-sort="{ prop: 'timestamp', order: 'descending' }"
                empty-text="暂无聊天流量…">
        <el-table-column prop="timestamp" label="时间" width="160" sortable>
          <template #default="{ row }"><span class="mono xs">{{ formatTime(row.timestamp) }}</span></template>
        </el-table-column>
        <el-table-column label="应用" width="110">
          <template #default="{ row }">
            <el-tag size="small" :type="appTagType(row)" disable-transitions>{{ appLabel(row) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="🔒" width="42" align="center">
          <template #default="{ row }">
            <span :class="isEncrypted(row) ? 'enc-yes' : 'enc-no'">{{ isEncrypted(row) ? '🔒' : '⚠' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="源" min-width="130">
          <template #default="{ row }">
            <span class="mono xs">{{ prettyIP(row.five_tuple.src_ip) }}<span class="port">:{{ row.five_tuple.src_port }}</span></span>
          </template>
        </el-table-column>
        <el-table-column label="目的" min-width="130">
          <template #default="{ row }">
            <span class="mono xs">{{ prettyIP(row.five_tuple.dst_ip) }}<span class="port">:{{ row.five_tuple.dst_port }}</span></span>
          </template>
        </el-table-column>
        <el-table-column prop="bytes_count" label="流量" width="85" align="right" sortable>
          <template #default="{ row }">{{ formatBytes(row.bytes_count) }}</template>
        </el-table-column>
        <el-table-column prop="duration_ms" label="时长" width="80" align="right" sortable>
          <template #default="{ row }">
            <span :class="{ 'long-call': row.duration_ms > 120000 }">{{ formatDurationMs(row.duration_ms) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="主机" min-width="150">
          <template #default="{ row }">
            <span class="mono xs" :title="row.host">{{ ellipsis(row.host, 28) || '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="方向" width="55" align="center">
          <template #default="{ row }">
            <span :class="'dir dir-' + (row.direction || 'unknown')">{{ dirIcon(row.direction) }}</span>
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
import { GaugeChart, RadarChart } from 'echarts/charts'
import { LegendComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { ChatDotRound, ChatLineSquare, DataAnalysis, DataLine, Lock, Phone, Promotion, Refresh, Search } from '@element-plus/icons-vue'

import StatCard from '@/components/StatCard.vue'
import { api } from '@/api/client'
import type { Flow } from '@/api/types'
import { ellipsis, formatBytes, formatDurationMs, formatNumber, formatTime, prettyIP } from '@/utils/format'

echarts.use([GaugeChart, RadarChart, LegendComponent, TooltipComponent, CanvasRenderer])

// ── 聊天/IM 协议集 ──
const WECHAT_NAMES = new Set(['WeChat', 'QQ', 'DingTalk'])
const TELEGRAM_NAMES = new Set(['Telegram', 'Telegram_VoIP'])
const WHATSAPP_NAMES = new Set(['WhatsApp', 'WhatsApp_Call', 'WhatsApp_Files'])
const DISCORD_SLACK_NAMES = new Set(['Discord', 'Slack'])
const OTHER_IM_NAMES = new Set([
  'Signal', 'Signal_VoIP', 'FB_Messenger', 'LINE', 'LINE_Call',
  'Viber', 'Viber_VoIP', 'KakaoTalk', 'KakaoTalk_Voice',
  'IMO', 'Threema', 'Jabber', 'XMPP', 'IRC', 'Google_Chat', 'Paltalk',
])
const ALL_CHAT_NAMES = new Set([...WECHAT_NAMES, ...TELEGRAM_NAMES, ...WHATSAPP_NAMES, ...DISCORD_SLACK_NAMES, ...OTHER_IM_NAMES])
const DOMESTIC_NAMES = WECHAT_NAMES
const INTERNATIONAL_NAMES = new Set([...TELEGRAM_NAMES, ...WHATSAPP_NAMES, ...DISCORD_SLACK_NAMES, ...OTHER_IM_NAMES])

const TLS_KEYWORDS = ['TLS', 'DTLS', 'SSL', 'QUIC']

// ── 流加载 ──
const allFlows = ref<Flow[]>([])
function isChatFlow(f: Flow): boolean {
  const proto = ((f.master_proto || '') + ' ' + (f.app_proto || '')).toUpperCase()
  for (const n of ALL_CHAT_NAMES) if (proto.includes(n.toUpperCase())) return true
  return false
}
function isEncrypted(f: Flow): boolean {
  const proto = ((f.master_proto || '') + ' ' + (f.app_proto || '')).toUpperCase()
  return TLS_KEYWORDS.some(k => proto.includes(k)) || f.five_tuple.dst_port === 443
}
async function loadFlows() {
  try { const flows = await api.recentFlows(500); allFlows.value = flows.filter(isChatFlow) } catch { /* */ }
}

// ── KPI ──
const totalFlows = computed(() => allFlows.value.length)
const totalBytes = computed(() => allFlows.value.reduce((s, f) => s + (f.bytes_count || 0), 0))
const encryptedCount = computed(() => allFlows.value.filter(isEncrypted).length)
const encryptedRatio = computed(() => totalFlows.value > 0 ? Math.round(encryptedCount.value / totalFlows.value * 100) : 0)
const activeApps = computed(() => {
  const seen = new Set<string>()
  for (const f of allFlows.value) seen.add(appLabel(f))
  return seen.size
})
const longestCall = computed(() => {
  const max = allFlows.value.reduce((m, f) => Math.max(m, f.duration_ms || 0), 0)
  return max > 0 ? formatDurationMs(max) : '—'
})
const domesticCount = computed(() => {
  return allFlows.value.filter(f => {
    const proto = ((f.master_proto || '') + ' ' + (f.app_proto || '')).toUpperCase()
    return [...DOMESTIC_NAMES].some(n => proto.includes(n.toUpperCase()))
  }).length
})
const internationalCount = computed(() => {
  return allFlows.value.filter(f => {
    const proto = ((f.master_proto || '') + ' ' + (f.app_proto || '')).toUpperCase()
    return [...INTERNATIONAL_NAMES].some(n => proto.includes(n.toUpperCase()))
  }).length
})

// ── 标签 helpers ──
function appLabel(row: Flow): string {
  const proto = ((row.master_proto || '') + ' ' + (row.app_proto || '')).toUpperCase()
  if (proto.includes('WECHAT')) return 'WeChat'
  if (proto.includes('DINGTALK')) return 'DingTalk'
  if (proto.includes('QQ')) return 'QQ'
  if ([...TELEGRAM_NAMES].some(n => proto.includes(n.toUpperCase()))) return 'Telegram'
  if ([...WHATSAPP_NAMES].some(n => proto.includes(n.toUpperCase()))) return 'WhatsApp'
  if (proto.includes('DISCORD')) return 'Discord'
  if (proto.includes('SLACK')) return 'Slack'
  if (proto.includes('SIGNAL')) return 'Signal'
  if (proto.includes('LINE')) return 'LINE'
  if (proto.includes('VIBER')) return 'Viber'
  if (proto.includes('KAKAO')) return 'KakaoTalk'
  if (proto.includes('FB_MESSENGER') || proto.includes('MESSENGER')) return 'Messenger'
  return row.app_proto || 'IM'
}
function appTagType(row: Flow): string {
  const label = appLabel(row)
  if (label === 'WeChat' || label === 'QQ' || label === 'DingTalk') return 'success'
  if (label === 'Telegram') return 'primary'
  if (label === 'WhatsApp') return ''
  if (label === 'Discord' || label === 'Slack') return 'warning'
  return 'info'
}
function dirIcon(dir?: string): string {
  if (dir === 'inbound') return '↓'
  if (dir === 'outbound') return '↑'
  if (dir === 'internal') return '↔'
  return '·'
}

// ── 流表筛选 ──
const flowSearch = ref('')
const flowFilter = ref('')
const encFilter = ref('')

function matchesFilter(f: Flow, filter: string): boolean {
  const proto = ((f.master_proto || '') + ' ' + (f.app_proto || '')).toUpperCase()
  if (filter === 'WECHAT') return [...WECHAT_NAMES].some(n => proto.includes(n.toUpperCase()))
  if (filter === 'TELEGRAM') return [...TELEGRAM_NAMES].some(n => proto.includes(n.toUpperCase()))
  if (filter === 'WHATSAPP') return [...WHATSAPP_NAMES].some(n => proto.includes(n.toUpperCase()))
  if (filter === 'DISCORD') return [...DISCORD_SLACK_NAMES].some(n => proto.includes(n.toUpperCase()))
  if (filter === 'OTHER') return [...OTHER_IM_NAMES].some(n => proto.includes(n.toUpperCase()))
  return true
}

const filteredFlows = computed(() => {
  let list = allFlows.value
  if (flowFilter.value) list = list.filter(f => matchesFilter(f, flowFilter.value))
  if (encFilter.value === 'enc') list = list.filter(isEncrypted)
  if (encFilter.value === 'plain') list = list.filter(f => !isEncrypted(f))
  const q = flowSearch.value.toLowerCase().trim()
  if (q) list = list.filter(f => [f.five_tuple.src_ip, f.five_tuple.dst_ip, f.master_proto, f.app_proto, f.host].filter(Boolean).join(' ').toLowerCase().includes(q))
  return list
})

// ── ECharts: Gauge + Radar ──
const gaugeEl = ref<HTMLElement>()
const radarEl = ref<HTMLElement>()
let gaugeChart: echarts.ECharts | null = null
let radarChart: echarts.ECharts | null = null

function initGauge() {
  if (!gaugeEl.value) return
  gaugeChart = echarts.init(gaugeEl.value)
  gaugeChart.setOption({
    series: [{
      type: 'gauge', startAngle: 200, endAngle: -20,
      min: 0, max: 100,
      pointer: { show: true, length: '60%', width: 4 },
      axisLine: { lineStyle: { width: 20, color: [[0.3, '#ef4444'], [0.7, '#f59e0b'], [1, '#22c55e']] } },
      axisTick: { show: false },
      splitLine: { distance: -20, length: 20, lineStyle: { color: '#fff', width: 2 } },
      axisLabel: { distance: -15, fontSize: 10, color: '#999' },
      detail: { valueAnimation: true, formatter: '{value}%', fontSize: 28, offsetCenter: [0, '60%'], color: 'inherit' },
      title: { offsetCenter: [0, '85%'], fontSize: 13, color: '#666' },
      data: [{ value: 0, name: '加密覆盖率' }],
    }],
  })
}

function initRadar() {
  if (!radarEl.value) return
  radarChart = echarts.init(radarEl.value)
  radarChart.setOption({
    tooltip: {},
    legend: { bottom: 0, type: 'scroll', textStyle: { fontSize: 10 } },
    radar: {
      indicator: [
        { name: '会话数', max: 1 },
        { name: '总流量', max: 1 },
        { name: '平均时长', max: 1 },
        { name: '包速率', max: 1 },
      ],
      radius: '60%', center: ['50%', '45%'],
    },
    series: [{ type: 'radar', data: [] }],
  })
}

function rebuildGauge() {
  if (!gaugeChart) return
  gaugeChart.setOption({ series: [{ data: [{ value: encryptedRatio.value, name: '加密覆盖率' }] }] })
}

function rebuildRadar() {
  if (!radarChart) return
  // Group flows by top apps, compute multi-dimensional metrics
  const appGroups = new Map<string, Flow[]>()
  for (const f of allFlows.value) {
    const l = appLabel(f)
    if (!appGroups.has(l)) appGroups.set(l, [])
    appGroups.get(l)!.push(f)
  }
  // Only show top 5 apps by flow count
  const sorted = [...appGroups.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 5)
  if (!sorted.length) { radarChart.setOption({ series: [{ data: [] }] }); return }

  // Compute max for each dimension for normalization
  const maxFlows = Math.max(...sorted.map(([, fs]) => fs.length))
  const maxBytes = Math.max(...sorted.map(([, fs]) => fs.reduce((s, f) => s + (f.bytes_count || 0), 0)))
  const maxDur = Math.max(...sorted.map(([, fs]) => fs.reduce((s, f) => s + (f.duration_ms || 0), 0) / fs.length))
  const maxPps = Math.max(...sorted.map(([, fs]) => fs.reduce((s, f) => s + (f.packet_count || 0), 0) / fs.length))

  const APP_COLORS: Record<string, string> = {
    WeChat: '#07c160', QQ: '#12b7f5', DingTalk: '#3072f6', Telegram: '#0088cc',
    WhatsApp: '#25d366', Discord: '#5865f2', Slack: '#4a154b', Signal: '#3a76f0',
  }

  const data = sorted.map(([name, fs]) => {
    const flows = fs.length / (maxFlows || 1)
    const bytes = fs.reduce((s, f) => s + (f.bytes_count || 0), 0) / (maxBytes || 1)
    const dur = (fs.reduce((s, f) => s + (f.duration_ms || 0), 0) / fs.length) / (maxDur || 1)
    const pps = (fs.reduce((s, f) => s + (f.packet_count || 0), 0) / fs.length) / (maxPps || 1)
    return {
      name, value: [flows, bytes, dur, pps],
      lineStyle: { color: APP_COLORS[name] || undefined },
      itemStyle: { color: APP_COLORS[name] || undefined },
      areaStyle: { opacity: 0.1 },
    }
  })

  radarChart.setOption({
    radar: { indicator: [{ name: '会话数', max: 1 }, { name: '总流量', max: 1 }, { name: '平均时长', max: 1 }, { name: '包速率', max: 1 }] },
    series: [{ data }],
  })
}

const onResize = () => { gaugeChart?.resize(); radarChart?.resize() }
let flowTimer: number | null = null

onMounted(() => {
  initGauge(); initRadar()
  void loadFlows()
  flowTimer = window.setInterval(loadFlows, 5000)
  window.addEventListener('resize', onResize)
})
onBeforeUnmount(() => {
  gaugeChart?.dispose(); radarChart?.dispose(); gaugeChart = null; radarChart = null
  if (flowTimer != null) window.clearInterval(flowTimer)
  window.removeEventListener('resize', onResize)
})
watch(allFlows, () => { rebuildGauge(); rebuildRadar() }, { deep: true })
watch(encryptedRatio, rebuildGauge)
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
.dir { font-size: 14px; font-weight: 700; }
.dir-inbound { color: #3b82f6; }
.dir-outbound { color: #22c55e; }
.dir-internal { color: #a855f7; }
.dir-unknown { color: var(--el-text-color-placeholder); }
.enc-yes { font-size: 14px; }
.enc-no { font-size: 14px; opacity: 0.5; }
.long-call { color: #8b5cf6; font-weight: 600; }
</style>
