<template>
  <div class="page">
    <!-- ── 时间范围选择：实时 / 历史区间（统一控制 KPI + 图表 + 明细）─── -->
    <el-card shadow="never" class="range-bar">
      <div class="range-inner">
        <el-icon><Clock /></el-icon>
        <span class="range-title">时间范围</span>
        <el-radio-group v-model="mode" size="small" @change="onModeChange">
          <el-radio-button value="live">实时</el-radio-button>
          <el-radio-button value="history" :disabled="chDisabled">历史区间</el-radio-button>
        </el-radio-group>
        <el-date-picker v-if="mode === 'history' && !chDisabled"
          v-model="range" type="datetimerange" size="small" range-separator="至"
          start-placeholder="开始" end-placeholder="结束" :shortcuts="rangeShortcuts"
          value-format="YYYY-MM-DDTHH:mm:ss.SSSZ" @change="onRangeChange" style="width: 380px" />
        <el-tag v-if="chDisabled" size="small" type="warning" disable-transitions>
          ClickHouse 未启用 · 仅实时视图
        </el-tag>
        <span class="muted small range-hint">
          {{ mode === 'live' ? '实时刷新（每 5 秒），展示内存环最新样本' : '区间内聚合统计（含 KPI / 图表 / 明细）' }}
        </span>
        <span class="media-dist">
          <span class="muted small">链路介质：</span>
          <template v-if="view.mediaDist.length">
            <el-tag v-for="m in view.mediaDist" :key="m.media" size="small"
                    :type="mediaColor(m.media)" class="media-pill" disable-transitions>
              {{ mediaLabel(m.media) }} · {{ formatNumber(m.count) }}
            </el-tag>
          </template>
          <span v-else class="muted small">—</span>
        </span>
        <el-button class="range-refresh" size="small" :icon="Refresh" @click="reloadAll">刷新</el-button>
      </div>
    </el-card>

    <!-- ── L2 链路层统计卡片 ──────────────────────────────── -->
    <el-row :gutter="14" class="kpi-row">
      <el-col :xs="12" :sm="8" :md="4">
        <StatCard label="总帧数" :value="formatNumber(view.total)"
                  :sub="view.totalSub" :icon="Connection" tone="#3b82f6" />
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <StatCard label="广播帧" :value="formatNumber(view.broadcast)"
                  :sub="view.broadcastPct + '%'" :icon="Promotion" tone="#f59e0b" />
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <StatCard label="组播帧" :value="formatNumber(view.multicast)"
                  :sub="view.multicastPct + '%'" :icon="Share" tone="#a855f7" />
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <StatCard label="VLAN 帧" :value="formatNumber(view.vlan)"
                  :sub="view.uniqueVlan + ' 个 VLAN'" :icon="SetUp" tone="#06b6d4" />
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <StatCard label="ARP 帧" :value="formatNumber(view.arp)"
                  sub="地址解析协议" :icon="Position" tone="#22c55e" />
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <StatCard label="唯一 MAC" :value="formatNumber(view.uniqueMac)"
                  sub="源+目的 MAC" :icon="DataLine" tone="#64748b" />
      </el-col>
    </el-row>

    <!-- ── 图表行：L2 协议分布 + EtherType 分布 ───────────── -->
    <el-row :gutter="14" class="body-row">
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="section-header">
              <el-icon><PieChart /></el-icon>
              <span>L2 协议分布</span>
              <span class="muted small">按帧类型分类</span>
            </div>
          </template>
          <div ref="l2PieEl" class="chart-canvas"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="section-header">
              <el-icon><Histogram /></el-icon>
              <span>Top MAC 地址</span>
              <span class="muted small">按流数排行</span>
            </div>
          </template>
          <div ref="macBarEl" class="chart-canvas"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- ── 链路层趋势（异常发现：广播/ARP 突增、组播波动）──── -->
    <el-card shadow="never" class="body-row">
      <template #header>
        <div class="section-header">
          <el-icon><TrendCharts /></el-icon>
          <span>链路层趋势</span>
          <span class="muted small">{{ mode === 'live' ? '内存样本时间分布' : '区间内分桶聚合' }}</span>
          <span class="muted small trend-hint">用于发现广播风暴 / ARP 突增 / 组播异常</span>
        </div>
      </template>
      <div ref="trendEl" class="chart-canvas trend-canvas"></div>
      <div v-if="!trendData.length" class="trend-empty muted small">暂无趋势数据…</div>
    </el-card>

    <!-- ── 链路层帧明细（按二层协议分页） ─────────────────── -->
    <el-card shadow="never" class="body-row">
      <template #header>
        <div class="section-header">
          <el-icon><Grid /></el-icon>
          <span>链路层帧明细</span>
          <el-tag size="small" :type="mode === 'live' ? 'info' : 'success'" class="ml-tag" disable-transitions>
            {{ mode === 'live' ? '实时' : '历史区间' }}
          </el-tag>
          <div class="table-toolbar">
            <el-select v-model="mediaFilter" size="small" style="width: 130px" @change="onMediaChange">
              <el-option v-for="m in MEDIA_OPTIONS" :key="m.value" :label="m.label" :value="m.value" />
            </el-select>
            <el-input v-model="search" placeholder="搜索 MAC / IP…" clearable
                      :prefix-icon="Search" size="small" style="width: 200px" @input="onSearch" />
            <el-button size="small" :icon="Refresh" @click="fetchDetail">刷新</el-button>
          </div>
        </div>
      </template>

      <!-- 按二层协议分标签页（IPv4/IPv6 属三层，不在此处） -->
      <el-tabs v-model="activeTab" class="l2-tabs" @tab-change="onTabChange">
        <el-tab-pane v-for="t in TABS" :key="t.key" :name="t.key" :label="t.label" />
      </el-tabs>

      <el-table :data="detailRows" v-loading="detailLoading" size="small" stripe :max-height="520"
                empty-text="暂无链路层数据…">
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="frame-detail">
              <div class="fd-item"><span class="fd-k">源 MAC</span><span class="mono">{{ row.src_mac || '—' }}</span></div>
              <div class="fd-item"><span class="fd-k">目的 MAC</span><span class="mono">{{ row.dst_mac || '—' }}</span></div>
              <div class="fd-item"><span class="fd-k">L2 协议</span><span>{{ l2ProtoName(row.l2_proto) }}</span></div>
              <div class="fd-item"><span class="fd-k">链路介质</span><span>{{ mediaLabel(row.media) }}</span></div>
              <div class="fd-item"><span class="fd-k">EtherType</span><span class="mono">{{ etherTypeHex(row.ether_type) }}</span></div>
              <div class="fd-item"><span class="fd-k">内层 EtherType</span><span class="mono">{{ etherTypeHex(row.inner_ether_type) }}</span></div>
              <div class="fd-item"><span class="fd-k">VLAN</span><span>{{ row.vlan_id ? `${row.vlan_id} (深度 ${row.vlan_depth ?? 0})` : '—' }}</span></div>
              <div class="fd-item"><span class="fd-k">帧类型</span><span>{{ row.has_l3 ? '数据帧 (含 L3)' : '纯 L2 控制帧' }}</span></div>
              <div class="fd-item"><span class="fd-k">L3 协议</span><span>{{ l3ProtoName(row.l3_proto) }}</span></div>
              <div class="fd-item"><span class="fd-k">寻址</span><span>{{ row.is_broadcast ? '广播' : row.is_multicast ? '组播' : '单播' }}</span></div>
              <div class="fd-item"><span class="fd-k">源</span><span class="mono">{{ prettyIP(row.five_tuple.src_ip) || '—' }}<template v-if="row.five_tuple.src_port">:{{ row.five_tuple.src_port }}</template></span></div>
              <div class="fd-item"><span class="fd-k">目的</span><span class="mono">{{ prettyIP(row.five_tuple.dst_ip) || '—' }}<template v-if="row.five_tuple.dst_port">:{{ row.five_tuple.dst_port }}</template></span></div>
              <div class="fd-item"><span class="fd-k">传输协议</span><span>{{ row.five_tuple.protocol || '—' }}</span></div>
              <div class="fd-item"><span class="fd-k">包数 / 字节</span><span>{{ formatNumber(row.packet_count) }} 包 · {{ formatBytes(row.bytes_count) }}</span></div>
              <div class="fd-item"><span class="fd-k">FlowHash</span><span class="mono">{{ row.flow_hash ?? '—' }}</span></div>
              <div class="fd-actions">
                <el-button v-if="row.src_mac" size="small" text type="primary" @click="openAddress(row.src_mac)">下钻源 MAC ›</el-button>
                <el-button v-if="row.dst_mac" size="small" text type="primary" @click="openAddress(row.dst_mac)">下钻目的 MAC ›</el-button>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="timestamp" label="时间" width="170">
          <template #default="{ row }"><span class="mono xs">{{ formatTime(row.timestamp) }}</span></template>
        </el-table-column>
        <el-table-column label="L2 协议" width="110">
          <template #default="{ row }">
            <el-tag size="small" :type="l2TagColor(row.l2_proto)" disable-transitions>
              {{ l2ProtoName(row.l2_proto) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="链路介质" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="mediaColor(row.media)" disable-transitions>
              {{ mediaLabel(row.media) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="源 MAC" width="145">
          <template #default="{ row }">
            <span v-if="row.src_mac" class="mono xs mac-link" @click="openAddress(row.src_mac)">{{ row.src_mac }}</span>
            <span v-else class="mono xs">—</span>
          </template>
        </el-table-column>
        <el-table-column label="目的 MAC" width="145">
          <template #default="{ row }">
            <span v-if="row.dst_mac" class="mono xs mac-link" @click="openAddress(row.dst_mac)">{{ row.dst_mac }}</span>
            <span v-else class="mono xs">—</span>
            <el-tag v-if="row.is_broadcast" size="small" type="warning" class="ml-tag" disable-transitions>广播</el-tag>
            <el-tag v-else-if="row.is_multicast" size="small" type="info" class="ml-tag" disable-transitions>组播</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="EtherType" width="100" align="center">
          <template #default="{ row }">
            <span class="mono xs">{{ etherTypeLabel(row.ether_type) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="VLAN" width="75" align="center">
          <template #default="{ row }">
            <span v-if="row.vlan_id" class="mono xs vlan-badge">{{ row.vlan_id }}</span>
            <span v-else class="muted small">—</span>
          </template>
        </el-table-column>
        <el-table-column label="源 IP" min-width="130">
          <template #default="{ row }">
            <span class="mono xs">{{ prettyIP(row.five_tuple.src_ip) || '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="目的 IP" min-width="130">
          <template #default="{ row }">
            <span class="mono xs">{{ prettyIP(row.five_tuple.dst_ip) || '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="packet_count" label="包数" width="72" align="right" sortable>
          <template #default="{ row }">{{ formatNumber(row.packet_count) }}</template>
        </el-table-column>
        <el-table-column prop="bytes_count" label="字节" width="90" align="right" sortable>
          <template #default="{ row }">{{ formatBytes(row.bytes_count) }}</template>
        </el-table-column>
        <el-table-column label="L3+" width="60" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.has_l3" size="small" type="success" disable-transitions>IP</el-tag>
            <el-tag v-else size="small" type="danger" disable-transitions>L2</el-tag>
          </template>
        </el-table-column>
      </el-table>

      <div class="pager">
        <span class="muted small">共 {{ formatNumber(total) }} 条</span>
        <el-pagination
          background layout="sizes, prev, pager, next, jumper"
          :total="total" :current-page="page" :page-size="pageSize"
          :page-sizes="[20, 50, 100, 200]"
          @current-change="onPageChange" @size-change="onSizeChange" />
      </div>
    </el-card>

    <!-- ── 二层会话配对（端点对 A↔B）──────────────────────── -->
    <el-card shadow="never" class="body-row">
      <template #header>
        <div class="section-header">
          <el-icon><Connection /></el-icon>
          <span>二层会话配对</span>
          <span class="muted small">按 MAC 端点对（A↔B）聚合，反映通信关系</span>
          <el-button class="count-tag" size="small" :icon="Refresh" @click="fetchConversations">刷新</el-button>
        </div>
      </template>
      <el-alert type="info" :closable="false" class="pair-note"
        title="ARP 请求/应答等事务级配对需要抓包侧解析 ARP opcode 与 sender/target 地址（当前探针未导出），暂以端点对会话呈现。"
        show-icon />
      <el-table :data="conversations" v-loading="convLoading" size="small" stripe :max-height="360"
                empty-text="暂无会话配对数据…">
        <el-table-column label="端点 A" min-width="150">
          <template #default="{ row }">
            <span class="mono xs mac-link" @click="openAddress(row.mac_a)">{{ row.mac_a }}</span>
          </template>
        </el-table-column>
        <el-table-column label="" width="40" align="center"><template #default>↔</template></el-table-column>
        <el-table-column label="端点 B" min-width="150">
          <template #default="{ row }">
            <span class="mono xs mac-link" @click="openAddress(row.mac_b)">{{ row.mac_b }}</span>
          </template>
        </el-table-column>
        <el-table-column label="帧数" width="90" align="right" sortable prop="frames">
          <template #default="{ row }">{{ formatNumber(row.frames) }}</template>
        </el-table-column>
        <el-table-column label="字节" width="100" align="right" sortable prop="bytes">
          <template #default="{ row }">{{ formatBytes(row.bytes) }}</template>
        </el-table-column>
        <el-table-column label="最近活动" width="180">
          <template #default="{ row }"><span class="mono xs">{{ formatTime(row.last_ts) }}</span></template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- ── 地址下钻抽屉（趋势 / KPI / Top 对端）────────────── -->
    <el-drawer v-model="drawerVisible" :title="`地址下钻 · ${drawerMac}`" size="46%" direction="rtl">
      <div v-loading="drawerLoading" class="drawer-body">
        <el-row :gutter="10" class="drawer-kpis">
          <el-col :span="8"><StatCard label="帧数" :value="formatNumber(drawerData.frames)" :icon="DataLine" tone="#3b82f6" /></el-col>
          <el-col :span="8"><StatCard label="字节" :value="formatBytes(drawerData.bytes)" :icon="Share" tone="#22c55e" /></el-col>
          <el-col :span="8"><StatCard label="对端数" :value="formatNumber(drawerData.peers)" :icon="Position" tone="#f59e0b" /></el-col>
        </el-row>

        <div class="drawer-section-title">趋势</div>
        <div ref="drawerTrendEl" class="chart-canvas drawer-trend"></div>
        <div v-if="!drawerData.trend.length" class="muted small">暂无趋势数据…</div>

        <div class="drawer-section-title">Top 对端</div>
        <el-table :data="drawerData.peers_list" size="small" stripe :max-height="220" empty-text="暂无对端…">
          <el-table-column label="对端 MAC" min-width="150">
            <template #default="{ row }">
              <span class="mono xs mac-link" @click="openAddress(row.mac)">{{ row.mac }}</span>
            </template>
          </el-table-column>
          <el-table-column label="帧数" width="90" align="right">
            <template #default="{ row }">{{ formatNumber(row.frames) }}</template>
          </el-table-column>
          <el-table-column label="字节" width="100" align="right">
            <template #default="{ row }">{{ formatBytes(row.bytes) }}</template>
          </el-table-column>
        </el-table>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts/core'
import { PieChart as PieChartComponent, BarChart, LineChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { nextTick } from 'vue'
import { Clock, Connection, DataLine, Share, SetUp, Search, Refresh, Promotion, Position, PieChart, Histogram, Grid, TrendCharts } from '@element-plus/icons-vue'

import StatCard from '@/components/StatCard.vue'
import { useProbeStore } from '@/stores/probe'
import { api } from '@/api/client'
import type { Flow, L2Bucket, L2Conversation, L2HistoryQuery, L2Stats } from '@/api/types'
import { formatBytes, formatNumber, formatRate, formatTime, prettyIP } from '@/utils/format'

echarts.use([PieChartComponent, BarChart, LineChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer])

const store = useProbeStore()
const stats = computed(() => store.stats)
const rates = computed(() => store.rates)

// ── L2Proto 枚举名映射 ──
const L2_PROTO_NAMES: Record<number, string> = {
  0: 'Ethernet II',
  1: 'ARP',
  2: 'RARP',
  3: 'LLDP',
  4: 'EAPOL',
  5: 'VLAN',
  6: 'Q-in-Q',
  7: 'MPLS',
  8: 'PPPoE-D',
  9: 'PPPoE-S',
  10: 'Wi-Fi',
  11: 'STP',
  12: 'LLC',
}

function l2ProtoName(proto?: number): string {
  if (proto == null) return 'Ethernet II'
  return L2_PROTO_NAMES[proto] ?? `L2(${proto})`
}

function l2TagColor(proto?: number): string {
  if (proto === 1 || proto === 2) return 'success'    // ARP/RARP
  if (proto === 3) return 'warning'                   // LLDP
  if (proto === 5 || proto === 6) return 'primary'    // VLAN/QinQ
  if (proto === 7) return ''                          // MPLS
  if (proto === 4) return 'danger'                    // EAPOL
  return 'info'
}

// ── EtherType 标签 ──
const ETHER_NAMES: Record<number, string> = {
  0x0800: 'IPv4',
  0x86DD: 'IPv6',
  0x0806: 'ARP',
  0x8035: 'RARP',
  0x8100: '802.1Q',
  0x88A8: 'Q-in-Q',
  0x8847: 'MPLS',
  0x8848: 'MPLS-MC',
  0x88CC: 'LLDP',
  0x888E: 'EAPOL',
  0x8863: 'PPPoE-D',
  0x8864: 'PPPoE-S',
}

function etherTypeLabel(et?: number): string {
  if (!et) return '—'
  return ETHER_NAMES[et] ?? `0x${et.toString(16).padStart(4, '0')}`
}
function etherTypeHex(et?: number): string {
  if (!et) return '—'
  const name = ETHER_NAMES[et]
  const hex = `0x${et.toString(16).padStart(4, '0')}`
  return name ? `${hex} (${name})` : hex
}

// ── L3 协议名映射（用于展开明细）──
const L3_PROTO_NAMES: Record<number, string> = {
  0: 'Unknown', 1: 'TCP', 2: 'UDP', 3: 'ICMP', 4: 'ICMPv6', 5: 'IGMP',
  6: 'GRE', 7: 'ESP', 8: 'AH', 9: 'OSPF', 10: 'VRRP', 11: 'SCTP',
  12: 'IP-in-IP', 13: 'IPv6-Encap',
}
function l3ProtoName(p?: number): string {
  if (p == null) return '—'
  return L3_PROTO_NAMES[p] ?? `L3(${p})`
}

// ── 链路介质（按抓包网卡推断：以太网 / Wi-Fi / 蜂窝 / 回环 / 其他）──
const MEDIA_LABELS: Record<string, string> = {
  ethernet: '以太网',
  wifi: 'Wi-Fi',
  cellular: '蜂窝',
  loopback: '回环',
  other: '其他',
  unknown: '未知',
}
// Filter dropdown options for the detail table ('' = 全部介质).
const MEDIA_OPTIONS = [
  { value: '', label: '全部介质' },
  { value: 'ethernet', label: '以太网' },
  { value: 'wifi', label: 'Wi-Fi' },
  { value: 'cellular', label: '蜂窝' },
  { value: 'loopback', label: '回环' },
  { value: 'other', label: '其他' },
]

function mediaLabel(m?: string): string {
  if (!m) return '未知'
  return MEDIA_LABELS[m] ?? m
}
function mediaColor(m?: string): string {
  switch (m) {
    case 'ethernet': return 'primary'
    case 'wifi': return 'success'
    case 'cellular': return 'warning'
    case 'loopback': return 'info'
    default: return 'info'
  }
}

// ── 流数据（合并 IP 流 + L2 事件）──
const allFlows = ref<Flow[]>([])

async function loadFlows() {
  try {
    const [flows, l2events] = await Promise.all([
      api.recentFlows(1000).catch(() => [] as Flow[]),
      api.recentL2Events(500).catch(() => [] as Flow[]),
    ])
    // Merge and deduplicate by flow_hash, L2 events take priority
    const merged = new Map<number | string, Flow>()
    for (const f of flows) merged.set(f.flow_hash ?? Math.random(), f)
    for (const f of l2events) merged.set(`l2-${f.flow_hash ?? Math.random()}-${f.timestamp}`, f)
    // Sort by timestamp descending (newest first)
    allFlows.value = [...merged.values()].sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  } catch { /* ignore */ }
}

// ── 实时/历史 模式 + 时间范围（统一控制 KPI / 图表 / 明细）──
type Mode = 'live' | 'history'
const mode = ref<Mode>('live')
const range = ref<[string, string] | null>(null)
const histStats = ref<L2Stats | null>(null)
const rangeShortcuts = [
  { text: '最近 1 小时', value: () => rangeFromMin(60) },
  { text: '最近 24 小时', value: () => rangeFromMin(60 * 24) },
  { text: '最近 7 天', value: () => rangeFromMin(60 * 24 * 7) },
]
function rangeFromMin(min: number): [Date, Date] {
  const end = new Date()
  return [new Date(end.getTime() - min * 60 * 1000), end]
}
function rangeParams(): L2HistoryQuery {
  return { since: range.value?.[0], until: range.value?.[1] }
}

// ── 实时 KPI / 图表数据（从内存环样本计算）──
const liveBroadcast = computed(() => allFlows.value.filter(f => f.is_broadcast).length)
const liveMulticast = computed(() => allFlows.value.filter(f => f.is_multicast).length)
const liveVlan = computed(() => allFlows.value.filter(f => (f.vlan_id ?? 0) > 0).length)
const liveArp = computed(() => allFlows.value.filter(f => f.l2_proto === 1 || f.l2_proto === 2).length)
const liveUniqueVlan = computed(() => {
  const ids = new Set<number>()
  for (const f of allFlows.value) if (f.vlan_id && f.vlan_id > 0) ids.add(f.vlan_id)
  return ids.size
})
const liveUniqueMac = computed(() => {
  const macs = new Set<string>()
  for (const f of allFlows.value) {
    if (f.src_mac) macs.add(f.src_mac)
    if (f.dst_mac) macs.add(f.dst_mac)
  }
  return macs.size
})
const liveProtoDist = computed<{ proto: number; count: number }[]>(() => {
  const counts = new Map<number, number>()
  for (const f of allFlows.value) {
    const p = f.l2_proto ?? 0
    counts.set(p, (counts.get(p) ?? 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([proto, count]) => ({ proto, count }))
})
const liveTopMacs = computed<[string, number][]>(() => {
  const counts = new Map<string, number>()
  for (const f of allFlows.value) {
    if (f.src_mac) counts.set(f.src_mac, (counts.get(f.src_mac) ?? 0) + 1)
    if (f.dst_mac) counts.set(f.dst_mac, (counts.get(f.dst_mac) ?? 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)
})
const liveMediaDist = computed<{ media: string; count: number }[]>(() => {
  const counts = new Map<string, number>()
  for (const f of allFlows.value) {
    const m = f.media || 'unknown'
    counts.set(m, (counts.get(m) ?? 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([media, count]) => ({ media, count }))
})

// ── 统一视图：按 mode 在实时样本 / 历史聚合之间切换 ──
const view = computed(() => {
  if (mode.value === 'history' && histStats.value && !histStats.value.disabled) {
    const s = histStats.value
    const pct = (n: number) => (s.total > 0 ? ((n / s.total) * 100).toFixed(1) : '0')
    return {
      total: s.total, totalSub: '区间内帧数',
      broadcast: s.broadcast, broadcastPct: pct(s.broadcast),
      multicast: s.multicast, multicastPct: pct(s.multicast),
      vlan: s.vlan, uniqueVlan: s.unique_vlan,
      arp: s.arp, uniqueMac: s.unique_mac,
      protoDist: s.proto_dist,
      topMacs: s.top_macs.map(m => [m.mac, m.count] as [string, number]),
      mediaDist: s.media_dist ?? [],
    }
  }
  const total = allFlows.value.length
  const pct = (n: number) => (total > 0 ? ((n / total) * 100).toFixed(1) : '0')
  return {
    total: stats.value?.packets ?? 0, totalSub: formatRate(rates.value.pps) + ' pps',
    broadcast: liveBroadcast.value, broadcastPct: pct(liveBroadcast.value),
    multicast: liveMulticast.value, multicastPct: pct(liveMulticast.value),
    vlan: liveVlan.value, uniqueVlan: liveUniqueVlan.value,
    arp: liveArp.value, uniqueMac: liveUniqueMac.value,
    protoDist: liveProtoDist.value,
    topMacs: liveTopMacs.value,
    mediaDist: liveMediaDist.value,
  }
})

// ── 链路层帧明细：按二层协议分标签页（IPv4/IPv6 属三层，已移除）──
type TabDef = { key: string; label: string; params: L2HistoryQuery }
const TABS: TabDef[] = [
  { key: 'all',    label: '全部',       params: {} },
  { key: 'data',   label: '数据帧',     params: { only_l3: true } },
  { key: 'arp',    label: 'ARP',       params: { l2proto: 1 } },
  { key: 'vlan',   label: 'VLAN',      params: { l2proto: 5 } },
  { key: 'lldp',   label: 'LLDP',      params: { l2proto: 3 } },
  { key: 'l2only', label: '纯 L2 控制帧', params: { only_l2: true } },
]

const search = ref('')
const mediaFilter = ref('')   // '' = 全部介质; else ethernet/wifi/cellular/...
const activeTab = ref('all')
const page = ref(1)
const pageSize = ref(50)
const total = ref(0)
const detailRows = ref<Flow[]>([])
const detailLoading = ref(false)
const chDisabled = ref(false)

function currentTabParams(): L2HistoryQuery {
  return TABS.find(t => t.key === activeTab.value)?.params ?? {}
}

// Client-side predicate matching a tab (live mode + no-ClickHouse fallback).
function matchesTab(f: Flow): boolean {
  const p = currentTabParams()
  if (p.l2proto != null && f.l2_proto !== p.l2proto) return false
  if (p.only_l2 && f.has_l3) return false
  if (p.only_l3 && !f.has_l3) return false
  if (mediaFilter.value && (f.media || 'unknown') !== mediaFilter.value) return false
  return true
}

async function fetchDetail() {
  detailLoading.value = true
  const q = search.value.trim()
  try {
    // History mode → query ClickHouse scoped to the selected range.
    if (mode.value === 'history' && !chDisabled.value) {
      const resp = await api.historyL2Frames({
        ...currentTabParams(),
        ...rangeParams(),
        q: q || undefined,
        media: mediaFilter.value || undefined,
        limit: pageSize.value,
        offset: (page.value - 1) * pageSize.value,
      })
      if (resp.disabled) {
        chDisabled.value = true
        mode.value = 'live'
      } else {
        detailRows.value = resp.items ?? []
        total.value = resp.total ?? 0
        return
      }
    }
    // Live mode (or fallback): filter + paginate the in-memory ring sample.
    const ql = q.toLowerCase()
    let list = allFlows.value.filter(matchesTab)
    if (ql) {
      list = list.filter(f => [
        f.src_mac, f.dst_mac, f.five_tuple.src_ip, f.five_tuple.dst_ip,
        l2ProtoName(f.l2_proto),
      ].filter(Boolean).join(' ').toLowerCase().includes(ql))
    }
    total.value = list.length
    const start = (page.value - 1) * pageSize.value
    detailRows.value = list.slice(start, start + pageSize.value)
  } catch {
    detailRows.value = []
    total.value = 0
  } finally {
    detailLoading.value = false
  }
}

// Fetch time-windowed KPIs + chart series for history mode.
async function fetchStats() {
  if (mode.value !== 'history') return
  try {
    const s = await api.historyL2Stats(rangeParams())
    if (s.disabled) {
      chDisabled.value = true
      mode.value = 'live'
      histStats.value = null
    } else {
      histStats.value = s
    }
  } catch {
    histStats.value = null
  }
}

// ── 趋势：历史取后端分桶；实时由内存样本客户端分桶 ──
const histBuckets = ref<L2Bucket[]>([])

// bucketize buckets in-memory flows into ~count time buckets for the live trend.
function bucketize(flows: Flow[], count = 40): L2Bucket[] {
  if (!flows.length) return []
  const times = flows.map(f => new Date(f.timestamp).getTime()).filter(t => !isNaN(t))
  if (!times.length) return []
  const min = Math.min(...times), max = Math.max(...times)
  const span = Math.max(max - min, 1)
  const width = Math.ceil(span / count)
  const buckets = new Map<number, L2Bucket>()
  for (const f of flows) {
    const t = new Date(f.timestamp).getTime()
    if (isNaN(t)) continue
    const key = Math.floor((t - min) / width)
    const ts = new Date(min + key * width).toISOString()
    let b = buckets.get(key)
    if (!b) { b = { ts, frames: 0, bytes: 0, broadcast: 0, multicast: 0, arp: 0 }; buckets.set(key, b) }
    b.frames += 1
    b.bytes += f.bytes_count ?? 0
    if (f.is_broadcast) b.broadcast += 1
    if (f.is_multicast) b.multicast += 1
    if (f.l2_proto === 1 || f.l2_proto === 2) b.arp += 1
  }
  return [...buckets.entries()].sort((a, b) => a[0] - b[0]).map(([, b]) => b)
}

const trendData = computed<L2Bucket[]>(() =>
  mode.value === 'history' ? histBuckets.value : bucketize(allFlows.value),
)

async function fetchTrend() {
  if (mode.value !== 'history' || chDisabled.value) return
  try {
    const r = await api.historyL2Timeseries(rangeParams())
    histBuckets.value = r.disabled ? [] : (r.buckets ?? [])
  } catch { histBuckets.value = [] }
}

// ── 二层会话配对（端点对）──
const conversations = ref<L2Conversation[]>([])
const convLoading = ref(false)

// Compute MAC-pair conversations client-side for the live sample.
function liveConversations(flows: Flow[], limit = 50): L2Conversation[] {
  const m = new Map<string, L2Conversation>()
  for (const f of flows) {
    if (!f.src_mac || !f.dst_mac) continue
    const [a, b] = f.src_mac < f.dst_mac ? [f.src_mac, f.dst_mac] : [f.dst_mac, f.src_mac]
    const key = `${a}|${b}`
    let cv = m.get(key)
    if (!cv) { cv = { mac_a: a, mac_b: b, frames: 0, bytes: 0, last_ts: f.timestamp }; m.set(key, cv) }
    cv.frames += 1
    cv.bytes += f.bytes_count ?? 0
    if (f.timestamp > cv.last_ts) cv.last_ts = f.timestamp
  }
  return [...m.values()].sort((x, y) => y.frames - x.frames).slice(0, limit)
}

async function fetchConversations() {
  convLoading.value = true
  try {
    if (mode.value === 'history' && !chDisabled.value) {
      const r = await api.historyL2Conversations({ ...rangeParams(), limit: 50 })
      conversations.value = r.disabled ? liveConversations(allFlows.value) : (r.items ?? [])
    } else {
      conversations.value = liveConversations(allFlows.value)
    }
  } catch {
    conversations.value = liveConversations(allFlows.value)
  } finally {
    convLoading.value = false
  }
}

// ── 地址下钻抽屉 ──
const drawerVisible = ref(false)
const drawerMac = ref('')
const drawerLoading = ref(false)
const drawerData = ref<{
  frames: number; bytes: number; peers: number
  trend: L2Bucket[]
  peers_list: { mac: string; frames: number; bytes: number }[]
}>({ frames: 0, bytes: 0, peers: 0, trend: [], peers_list: [] })

async function openAddress(mac: string) {
  if (!mac) return
  drawerMac.value = mac
  drawerVisible.value = true
  drawerLoading.value = true
  try {
    if (mode.value === 'history' && !chDisabled.value) {
      const [stats, ts, convs] = await Promise.all([
        api.historyL2Stats({ ...rangeParams(), mac }),
        api.historyL2Timeseries({ ...rangeParams(), mac }),
        api.historyL2Conversations({ ...rangeParams(), mac, limit: 10 }),
      ])
      const peersList = (convs.items ?? []).map(c => ({
        mac: c.mac_a === mac ? c.mac_b : c.mac_a,
        frames: c.frames, bytes: c.bytes,
      }))
      const frames = (convs.items ?? []).reduce((s, c) => s + c.frames, 0)
      const bytes = (convs.items ?? []).reduce((s, c) => s + c.bytes, 0)
      drawerData.value = {
        frames: stats.disabled ? frames : stats.total,
        bytes,
        peers: peersList.length,
        trend: ts.disabled ? [] : (ts.buckets ?? []),
        peers_list: peersList,
      }
    } else {
      const mine = allFlows.value.filter(f => f.src_mac === mac || f.dst_mac === mac)
      const convs = liveConversations(mine, 10).filter(c => c.mac_a === mac || c.mac_b === mac)
      const peersList = convs.map(c => ({
        mac: c.mac_a === mac ? c.mac_b : c.mac_a, frames: c.frames, bytes: c.bytes,
      }))
      drawerData.value = {
        frames: mine.length,
        bytes: mine.reduce((s, f) => s + (f.bytes_count ?? 0), 0),
        peers: peersList.length,
        trend: bucketize(mine),
        peers_list: peersList,
      }
    }
    await nextTick()
    rebuildDrawerTrend()
  } finally {
    drawerLoading.value = false
  }
}

// Reload everything for the current mode/range.
function reloadAll() {
  if (mode.value === 'history') {
    void fetchStats()
    void fetchTrend()
    void fetchConversations()
    void fetchDetail()
  } else {
    void loadFlows().then(() => { fetchDetail(); fetchConversations() })
  }
}

function onModeChange() {
  page.value = 1
  if (mode.value === 'history' && !range.value) {
    const [s, e] = rangeFromMin(60)
    range.value = [s.toISOString(), e.toISOString()]
  }
  reloadAll()
}
function onRangeChange() { page.value = 1; reloadAll() }
function onTabChange() { page.value = 1; void fetchDetail() }
function onMediaChange() { page.value = 1; void fetchDetail() }
function onPageChange(p: number) { page.value = p; void fetchDetail() }
function onSizeChange(s: number) { pageSize.value = s; page.value = 1; void fetchDetail() }

let searchTimer: number | null = null
function onSearch() {
  if (searchTimer != null) window.clearTimeout(searchTimer)
  searchTimer = window.setTimeout(() => { page.value = 1; void fetchDetail() }, 300)
}

// ── 图表数据（统一来自 view）──
const l2PieData = computed(() =>
  view.value.protoDist.map(d => ({ name: l2ProtoName(d.proto), value: d.count })),
)
const topMacData = computed<[string, number][]>(() => view.value.topMacs)

// ── ECharts: L2 协议饼图 ──
const l2PieEl = ref<HTMLElement>()
let l2PieChart: echarts.ECharts | null = null

function initL2Pie() {
  if (!l2PieEl.value) return
  l2PieChart = echarts.init(l2PieEl.value)
  l2PieChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} 流 ({d}%)' },
    legend: { bottom: 0, type: 'scroll' },
    color: ['#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#06b6d4', '#ef4444', '#64748b', '#ec4899'],
    series: [{
      type: 'pie', radius: ['40%', '70%'], center: ['50%', '45%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 1 },
      label: { show: false }, data: [],
    }],
  })
}

function rebuildL2Pie() {
  if (!l2PieChart) return
  l2PieChart.setOption({ series: [{ data: l2PieData.value }] })
}

// ── ECharts: Top MAC 柱图 ──
const macBarEl = ref<HTMLElement>()
let macBarChart: echarts.ECharts | null = null

function initMacBar() {
  if (!macBarEl.value) return
  macBarChart = echarts.init(macBarEl.value)
  macBarChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 120, right: 20, top: 10, bottom: 20 },
    xAxis: { type: 'value', name: '流数', axisLabel: { fontSize: 10 } },
    yAxis: { type: 'category', data: [], axisLabel: { fontSize: 10 }, inverse: true },
    series: [{
      type: 'bar', barMaxWidth: 18,
      itemStyle: { borderRadius: [0, 4, 4, 0], color: '#3b82f6' },
      data: [],
    }],
  })
}

function rebuildMacBar() {
  if (!macBarChart) return
  const d = topMacData.value
  macBarChart.setOption({
    yAxis: { data: d.map(([mac]) => mac) },
    series: [{ data: d.map(([, count]) => count) }],
  })
}

// ── ECharts: 链路层趋势折线图 ──
const trendEl = ref<HTMLElement>()
let trendChart: echarts.ECharts | null = null

function trendBaseOption(): echarts.EChartsCoreOption {
  return {
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0, data: ['总帧', '广播', '组播', 'ARP'] },
    grid: { left: 50, right: 20, top: 16, bottom: 36 },
    xAxis: { type: 'category', data: [] as string[], axisLabel: { fontSize: 10 } },
    yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
    color: ['#3b82f6', '#f59e0b', '#06b6d4', '#ef4444'],
    series: [
      { name: '总帧', type: 'line', smooth: true, showSymbol: false, data: [] as number[] },
      { name: '广播', type: 'line', smooth: true, showSymbol: false, data: [] as number[] },
      { name: '组播', type: 'line', smooth: true, showSymbol: false, data: [] as number[] },
      { name: 'ARP', type: 'line', smooth: true, showSymbol: false, data: [] as number[] },
    ],
  }
}

function initTrend() {
  if (!trendEl.value) return
  trendChart = echarts.init(trendEl.value)
  trendChart.setOption(trendBaseOption())
}

function fmtBucketTs(ts: string): string {
  const d = new Date(ts)
  return isNaN(d.getTime()) ? ts : `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function rebuildTrend() {
  if (!trendChart) return
  const d = trendData.value
  trendChart.setOption({
    xAxis: { data: d.map(b => fmtBucketTs(b.ts)) },
    series: [
      { data: d.map(b => b.frames) },
      { data: d.map(b => b.broadcast) },
      { data: d.map(b => b.multicast) },
      { data: d.map(b => b.arp) },
    ],
  })
}

// ── ECharts: 抽屉内地址趋势 ──
const drawerTrendEl = ref<HTMLElement>()
let drawerTrendChart: echarts.ECharts | null = null

function rebuildDrawerTrend() {
  const d = drawerData.value.trend
  if (!drawerTrendEl.value) return
  if (!drawerTrendChart) drawerTrendChart = echarts.init(drawerTrendEl.value)
  drawerTrendChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 50, right: 16, top: 16, bottom: 24 },
    xAxis: { type: 'category', data: d.map(b => fmtBucketTs(b.ts)), axisLabel: { fontSize: 10 } },
    yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
    color: ['#3b82f6'],
    series: [{ name: '帧数', type: 'line', smooth: true, showSymbol: false, areaStyle: {}, data: d.map(b => b.frames) }],
  })
  drawerTrendChart.resize()
}

// ── 生命周期 ──
const onResize = () => { l2PieChart?.resize(); macBarChart?.resize(); trendChart?.resize(); drawerTrendChart?.resize() }
let flowTimer: number | null = null

// Refresh KPIs/charts (live sample) every 5s; also refresh the detail
// table only while sitting on page 1 so paging through history isn't
// disrupted by the timer.
async function tick() {
  // History mode is a fixed range — don't disturb it with the live timer.
  if (mode.value !== 'live') return
  await loadFlows()
  if (page.value === 1) void fetchDetail()
}

async function tickConversations() {
  if (mode.value !== 'live') return
  await fetchConversations()
}

onMounted(() => {
  initL2Pie(); initMacBar(); initTrend()
  void loadFlows().then(() => { fetchDetail(); fetchConversations() })
  flowTimer = window.setInterval(() => { void tick(); void tickConversations() }, 5000)
  window.addEventListener('resize', onResize)
})
onBeforeUnmount(() => {
  l2PieChart?.dispose(); macBarChart?.dispose(); trendChart?.dispose(); drawerTrendChart?.dispose()
  l2PieChart = null; macBarChart = null; trendChart = null; drawerTrendChart = null
  if (flowTimer != null) window.clearInterval(flowTimer)
  if (searchTimer != null) window.clearTimeout(searchTimer)
  window.removeEventListener('resize', onResize)
})

watch(l2PieData, rebuildL2Pie, { deep: true })
watch(topMacData, rebuildMacBar, { deep: true })
watch(trendData, rebuildTrend, { deep: true })
</script>

<style scoped>
.kpi-row { margin-bottom: 14px; }
.body-row { margin-bottom: 14px; }

/* ── 时间范围工具栏 ── */
.range-bar { margin-bottom: 14px; }
.range-bar :deep(.el-card__body) { padding: 10px 14px; }
.range-inner { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.range-title { font-weight: 600; }
.range-hint { margin-left: 4px; }
.media-dist { display: inline-flex; align-items: center; gap: 4px; flex-wrap: wrap; }
.media-pill { margin-left: 2px; }
.range-refresh { margin-left: auto; }
.section-header { display: flex; align-items: center; gap: 8px; font-weight: 600; flex-wrap: wrap; }
.count-tag { margin-left: auto; }
.chart-card :deep(.el-card__body) { padding: 12px; }
.chart-canvas { width: 100%; height: 260px; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.small { font-size: 12px; }
.xs { font-size: 11px; }
.muted { color: var(--el-text-color-secondary); }

/* ── 流表工具栏 ── */
.table-toolbar { display: flex; align-items: center; gap: 8px; margin-left: auto; }

/* ── 分页器 ── */
.pager { display: flex; align-items: center; justify-content: flex-end; gap: 12px; margin-top: 12px; }
.l2-tabs { margin-bottom: 4px; }

/* ── VLAN badge ── */
.vlan-badge {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  padding: 1px 6px;
  border-radius: 3px;
  font-weight: 600;
}

/* ── MAC 旁小标签 ── */
.ml-tag { margin-left: 4px; vertical-align: middle; }

/* ── 趋势图 ── */
.trend-canvas { height: 240px; }
.trend-hint { margin-left: auto; }
.trend-empty { text-align: center; padding: 8px 0; }

/* ── 可点击 MAC ── */
.mac-link { color: var(--el-color-primary); cursor: pointer; }
.mac-link:hover { text-decoration: underline; }

/* ── 展开行明细 ── */
.frame-detail {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 6px 18px;
  padding: 8px 16px;
}
.fd-item { display: flex; gap: 8px; font-size: 12px; }
.fd-k { color: var(--el-text-color-secondary); min-width: 84px; }
.fd-actions { grid-column: 1 / -1; display: flex; gap: 12px; margin-top: 4px; }

/* ── 会话配对 / 抽屉 ── */
.pair-note { margin-bottom: 10px; }
.drawer-body { padding: 0 4px; }
.drawer-kpis { margin-bottom: 12px; }
.drawer-section-title { font-weight: 600; margin: 10px 0 6px; }
.drawer-trend { height: 200px; }
</style>
