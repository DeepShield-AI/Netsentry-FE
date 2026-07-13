<template>
  <div class="page">
    <!-- ── KPI 卡片 ──────────────────────────────────────── -->
    <el-row :gutter="14" class="kpi-row">
      <el-col :xs="24" :sm="12" :md="6">
        <StatCard label="VPN 检测总数" :value="formatNumber(stats.total_detections)"
                  :sub="detectedProtoCount + ' 种协议'" :icon="Lock" tone="#ef4444" />
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <StatCard label="匿名网络" :value="formatNumber(stats.anon_flows)"
                  sub="Tor / Psiphon / Ultrasurf" :icon="View" tone="#f97316" />
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <StatCard label="代理流量" :value="formatNumber(stats.proxy_flows)"
                  sub="SOCKS / HTTP Proxy / SS" :icon="SwitchButton" tone="#8b5cf6" />
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <StatCard label="高置信度"
                  :value="formatNumber(stats.high_conf)"
                  :sub="'中: ' + stats.medium_conf + '  低: ' + stats.low_conf"
                  :icon="CircleCheckFilled" tone="#06b6d4" />
      </el-col>
    </el-row>

    <!-- ── 图表行 ────────────────────────────────────────── -->
    <el-row :gutter="14" class="body-row">
      <el-col :xs="24" :md="10">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="section-header">
              <el-icon><PieChart /></el-icon>
              <span>VPN / 匿名 / 代理分布</span>
            </div>
          </template>
          <div ref="pieEl" class="chart-canvas"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="14">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="section-header">
              <el-icon><Histogram /></el-icon>
              <span>检测协议 Top 15</span>
            </div>
          </template>
          <div ref="barEl" class="chart-canvas-tall"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- ── 实时检测事件表 ──────────────────────────────────── -->
    <el-card shadow="never" class="body-row">
      <template #header>
        <div class="section-header">
          <el-icon><List /></el-icon>
          <span>最近 VPN / 匿名 / 代理检测</span>
          <el-tag size="small" type="info" class="count-tag">{{ detections.length }}</el-tag>
          <div style="margin-left:auto;display:flex;gap:8px;align-items:center">
            <el-select v-model="typeFilter" placeholder="类型" size="small" clearable style="width:100px">
              <el-option label="VPN" value="vpn" />
              <el-option label="匿名" value="anon" />
              <el-option label="代理" value="proxy" />
            </el-select>
            <el-select v-model="confFilter" placeholder="置信度" size="small" clearable style="width:100px">
              <el-option label="高" value="high" />
              <el-option label="中" value="medium" />
              <el-option label="低" value="low" />
            </el-select>
            <el-button size="small" :icon="Refresh" @click="loadData">刷新</el-button>
          </div>
        </div>
      </template>
      <el-table :data="filteredDetections" size="small" stripe :max-height="500"
                empty-text="暂无检测到的 VPN/匿名/代理连接">
        <el-table-column prop="timestamp" label="时间" width="180">
          <template #default="{ row }"><span class="mono small">{{ formatTime(row.timestamp) }}</span></template>
        </el-table-column>
        <el-table-column label="协议" width="140">
          <template #default="{ row }">
            <el-tag size="small" :type="detTagType(row.type)">{{ row.proto_name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="80">
          <template #default="{ row }">
            <el-tag size="small" :type="detTagType(row.type)" effect="plain">{{ typeLabel(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="置信度" width="80">
          <template #default="{ row }">
            <el-tag size="small" :type="confTagType(row.confidence)" effect="plain">{{ confLabel(row.confidence) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="源" min-width="160">
          <template #default="{ row }">
            <span class="mono small">{{ prettyIP(row.src_ip) }}:{{ row.src_port }}</span>
          </template>
        </el-table-column>
        <el-table-column label="目的" min-width="160">
          <template #default="{ row }">
            <span class="mono small">{{ prettyIP(row.dst_ip) }}:{{ row.dst_port }}</span>
          </template>
        </el-table-column>
        <el-table-column label="SNI / Host" min-width="180">
          <template #default="{ row }">
            <span class="mono small">{{ ellipsis(row.host, 40) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="检测信号" min-width="200">
          <template #default="{ row }">
            <el-tag v-for="s in row.signals" :key="s" size="small" type="info"
                    style="margin:1px 2px" effect="plain">{{ s }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="字节" width="100" align="right">
          <template #default="{ row }">{{ formatBytes(row.bytes_count) }}</template>
        </el-table-column>
        <el-table-column label="持续" width="90" align="right">
          <template #default="{ row }">{{ formatDurationMs(row.duration_ms) }}</template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- ── 协议能力表 ─────────────────────────────────────── -->
    <el-row :gutter="14" class="body-row">
      <el-col :xs="24" :md="8">
        <el-card shadow="never">
          <template #header>
            <div class="section-header">
              <el-icon><Lock /></el-icon>
              <span>VPN 协议检测能力</span>
              <el-tag size="small" type="danger" class="count-tag">{{ vpnProtos.length }}</el-tag>
            </div>
          </template>
          <el-table :data="vpnTableData" size="small" stripe :max-height="400">
            <el-table-column prop="name" label="协议" width="140">
              <template #default="{ row }">
                <el-tag size="small" type="danger">{{ row.name }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="desc" label="说明" />
            <el-table-column prop="flows" label="检测数" width="80" align="right">
              <template #default="{ row }">
                <span :class="{ active: row.flows > 0 }">{{ row.flows }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="8">
        <el-card shadow="never">
          <template #header>
            <div class="section-header">
              <el-icon><View /></el-icon>
              <span>匿名网络</span>
              <el-tag size="small" type="warning" class="count-tag">{{ anonProtos.length }}</el-tag>
            </div>
          </template>
          <el-table :data="anonTableData" size="small" stripe>
            <el-table-column prop="name" label="协议" width="120">
              <template #default="{ row }">
                <el-tag size="small" type="warning">{{ row.name }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="desc" label="说明" />
            <el-table-column prop="flows" label="检测数" width="80" align="right">
              <template #default="{ row }">
                <span :class="{ active: row.flows > 0 }">{{ row.flows }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="8">
        <el-card shadow="never">
          <template #header>
            <div class="section-header">
              <el-icon><SwitchButton /></el-icon>
              <span>代理协议</span>
              <el-tag size="small" type="" class="count-tag">{{ proxyProtos.length }}</el-tag>
            </div>
          </template>
          <el-table :data="proxyTableData" size="small" stripe>
            <el-table-column prop="name" label="协议" width="120">
              <template #default="{ row }">
                <el-tag size="small">{{ row.name }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="desc" label="说明" />
            <el-table-column prop="flows" label="检测数" width="80" align="right">
              <template #default="{ row }">
                <span :class="{ active: row.flows > 0 }">{{ row.flows }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts/core'
import { PieChart as PieChartComponent, BarChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { Lock, Refresh, View, SwitchButton, CircleCheckFilled, PieChart, Histogram, List } from '@element-plus/icons-vue'

import StatCard from '@/components/StatCard.vue'
import { api } from '@/api/client'
import type { VpnDetection, VpnDetectionStats } from '@/api/types'
import {
  ellipsis,
  formatBytes,
  formatDurationMs,
  formatNumber,
  formatTime,
  prettyIP,
} from '@/utils/format'

echarts.use([PieChartComponent, BarChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer])

// ── 后端检测数据 ──
const detections = ref<VpnDetection[]>([])
const stats = ref<VpnDetectionStats>({
  total_detections: 0, vpn_flows: 0, anon_flows: 0, proxy_flows: 0,
  high_conf: 0, medium_conf: 0, low_conf: 0,
})

const typeFilter = ref('')
const confFilter = ref('')

const filteredDetections = computed(() => {
  let list = detections.value
  if (typeFilter.value) list = list.filter(d => d.type === typeFilter.value)
  if (confFilter.value) list = list.filter(d => d.confidence === confFilter.value)
  return list
})

// 从检测结果统计各协议出现次数
const protoCounts = computed(() => {
  const m = new Map<string, number>()
  for (const d of detections.value) {
    m.set(d.proto_name, (m.get(d.proto_name) ?? 0) + 1)
  }
  return m
})

const detectedProtoCount = computed(() => protoCounts.value.size)

async function loadData() {
  try {
    const [detsResp, statsResp] = await Promise.all([
      api.vpnDetections(200),
      api.vpnStats(),
    ])
    detections.value = detsResp.detections ?? []
    stats.value = statsResp
  } catch { /* ignore */ }
}

// ── 协议定义 ──
interface Proto { name: string; desc: string }

const vpnProtos: Proto[] = [
  { name: 'IPSec', desc: 'IP 安全协议 — ESP/AH 封装' },
  { name: 'IPSec/IKE', desc: 'IKE 密钥交换 (500/UDP)' },
  { name: 'IPSec/NAT-T', desc: 'IPSec NAT 穿越 (4500/UDP)' },
  { name: 'PPTP', desc: '点对点隧道协议' },
  { name: 'OpenVPN', desc: 'OpenVPN 加密隧道' },
  { name: 'CiscoVPN', desc: 'Cisco AnyConnect / IPSec VPN' },
  { name: 'WireGuard', desc: '现代高性能 VPN' },
  { name: 'SoftEther', desc: 'SoftEther 多协议隧道' },
  { name: 'Tailscale', desc: 'WireGuard 封装的网格 VPN' },
  { name: 'Tinc', desc: 'Tinc Mesh VPN 隧道' },
  { name: 'TunnelBear', desc: 'TunnelBear VPN' },
  { name: 'Cloudflare WARP', desc: 'Cloudflare 1.1.1.1 WARP' },
  { name: 'Hotspot Shield', desc: 'Hotspot Shield VPN' },
  { name: 'Opera VPN', desc: 'Opera 内置 VPN' },
  { name: 'ProtonVPN', desc: 'ProtonVPN 隧道' },
  { name: 'Mullvad', desc: 'Mullvad VPN' },
  { name: 'PIA', desc: 'Private Internet Access' },
  { name: 'NordVPN', desc: 'NordVPN 隧道' },
  { name: 'Surfshark', desc: 'Surfshark VPN' },
  { name: 'CactusVPN', desc: 'CactusVPN 隧道' },
  { name: 'Windscribe', desc: 'Windscribe VPN' },
  { name: 'ExpressVPN', desc: 'ExpressVPN 隧道' },
  { name: 'CyberGhost', desc: 'CyberGhost VPN' },
  { name: 'GRE Tunnel', desc: 'GRE 隧道封装' },
  { name: 'IP-in-IP', desc: 'IP-in-IP 隧道' },
  { name: 'L2TP', desc: 'L2TP 二层隧道' },
  { name: 'SSTP', desc: 'SSTP 安全套接字隧道' },
  { name: 'ZeroTier', desc: 'ZeroTier SD-WAN 网络' },
  { name: 'Nebula', desc: 'Nebula 网格 VPN' },
  { name: 'Suspected Tunnel', desc: '行为分析检测的可疑隧道' },
]

const anonProtos: Proto[] = [
  { name: 'Tor', desc: 'Tor 洋葱路由匿名网络' },
  { name: 'Tor Directory', desc: 'Tor 目录服务' },
  { name: 'Psiphon', desc: 'Psiphon 审查规避工具' },
  { name: 'Ultrasurf', desc: 'Ultrasurf 代理' },
  { name: 'Lantern', desc: 'Lantern 翻墙工具' },
  { name: 'Freegate', desc: 'Freegate 自由门' },
]

const proxyProtos: Proto[] = [
  { name: 'SOCKS', desc: 'SOCKS4/5 代理协议' },
  { name: 'HTTP CONNECT', desc: 'HTTP CONNECT 隧道代理' },
  { name: 'HTTP Proxy', desc: 'HTTP 代理' },
  { name: 'Shadowsocks', desc: 'Shadowsocks 加密代理' },
  { name: 'V2Ray', desc: 'V2Ray / Xray 代理工具' },
]

// 用后端 proto_name 匹配协议表
function enrichTable(protos: Proto[]) {
  return computed(() => {
    const counts = protoCounts.value
    return protos.map(p => ({ ...p, flows: counts.get(p.name) ?? 0 }))
  })
}
const vpnTableData = enrichTable(vpnProtos)
const anonTableData = enrichTable(anonProtos)
const proxyTableData = enrichTable(proxyProtos)

// ── 标签样式 ──
function detTagType(type: string): string {
  if (type === 'anon') return 'danger'
  if (type === 'vpn') return 'warning'
  return ''
}
function confTagType(conf: string): string {
  if (conf === 'high') return 'danger'
  if (conf === 'medium') return 'warning'
  return 'info'
}
function typeLabel(type: string): string {
  if (type === 'vpn') return 'VPN'
  if (type === 'anon') return '匿名'
  if (type === 'proxy') return '代理'
  return type
}
function confLabel(conf: string): string {
  if (conf === 'high') return '高'
  if (conf === 'medium') return '中'
  if (conf === 'low') return '低'
  return conf
}

// ── ECharts: 分类饼图 ──
const pieEl = ref<HTMLElement>()
let pieChart: echarts.ECharts | null = null

const pieData = computed(() => {
  const s = stats.value
  const items: { name: string; value: number; itemStyle: { color: string } }[] = []
  if (s.vpn_flows > 0) items.push({ name: 'VPN', value: s.vpn_flows, itemStyle: { color: '#ef4444' } })
  if (s.anon_flows > 0) items.push({ name: '匿名网络', value: s.anon_flows, itemStyle: { color: '#f97316' } })
  if (s.proxy_flows > 0) items.push({ name: '代理', value: s.proxy_flows, itemStyle: { color: '#8b5cf6' } })
  return items
})

function initPie() {
  if (!pieEl.value) return
  pieChart = echarts.init(pieEl.value)
  pieChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} 次 ({d}%)' },
    legend: { bottom: 0 },
    series: [{
      type: 'pie', radius: ['45%', '72%'], center: ['50%', '45%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{b}\n{c}', fontSize: 12 },
      data: [],
    }],
  })
}

function rebuildPie() {
  pieChart?.setOption({ series: [{ data: pieData.value }] })
}

// ── ECharts: 协议柱图 ──
const barEl = ref<HTMLElement>()
let barChart: echarts.ECharts | null = null

const barData = computed(() => {
  return [...protoCounts.value.entries()]
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
})

function initBar() {
  if (!barEl.value) return
  barChart = echarts.init(barEl.value)
  barChart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 140, right: 30, top: 10, bottom: 10 },
    xAxis: { type: 'value', axisLabel: { fontSize: 11 } },
    yAxis: { type: 'category', data: [], axisLabel: { fontSize: 11 }, inverse: true },
    series: [{
      type: 'bar', barMaxWidth: 22,
      itemStyle: {
        borderRadius: [0, 3, 3, 0],
        color(params: { dataIndex: number }) {
          const colors = ['#ef4444', '#f97316', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899']
          return colors[params.dataIndex % colors.length]
        },
      },
      data: [],
    }],
  })
}

function rebuildBar() {
  if (!barChart) return
  const d = barData.value
  barChart.setOption({
    yAxis: { data: d.map(([n]) => n) },
    series: [{ data: d.map(([, v]) => v) }],
  })
}

// ── 生命周期 ──
const onResize = () => { pieChart?.resize(); barChart?.resize() }
let pollTimer: number | null = null

onMounted(() => {
  initPie(); initBar()
  void loadData()
  pollTimer = window.setInterval(loadData, 5000)
  window.addEventListener('resize', onResize)
})
onBeforeUnmount(() => {
  pieChart?.dispose(); barChart?.dispose()
  pieChart = null; barChart = null
  if (pollTimer != null) window.clearInterval(pollTimer)
  window.removeEventListener('resize', onResize)
})

watch(pieData, rebuildPie, { deep: true })
watch(barData, rebuildBar, { deep: true })
</script>

<style scoped>
.kpi-row { margin-bottom: 14px; }
.body-row { margin-bottom: 14px; }
.section-header { display: flex; align-items: center; gap: 8px; font-weight: 600; }
.count-tag { margin-left: auto; }
.chart-card :deep(.el-card__body) { padding: 12px; }
.chart-canvas { width: 100%; height: 280px; }
.chart-canvas-tall { width: 100%; height: 320px; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.small { font-size: 12px; }
.muted { color: var(--el-text-color-secondary); }
.active { color: var(--el-color-danger); font-weight: 600; }
</style>
