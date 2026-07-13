<template>
  <div class="flowfeat">
    <el-card shadow="never" class="panel">
      <template #header>
        <div class="section-header">
          <el-icon><Histogram /></el-icon>
          <span>流特征 · lzprobe</span>
          <span class="muted small">
            由 flowfeat worker 定时全量处理已落盘的全流量 PCAP 段，抽取每连接特征向量
            （Zeek conn 状态/历史 + 包长/IAT/RTT 分布 + FFT + TCP 标志统计），写入 flow_features
          </span>
        </div>
      </template>

      <el-alert
        v-if="chDisabled"
        type="info"
        :closable="false"
        show-icon
        title="ClickHouse 未启用"
        description="流特征依赖 ClickHouse。请在 agent.yaml 配置 store.clickhouse 与 flowfeat 段并重启探针。"
        class="hint"
      />

      <!-- 过滤条 -->
      <div class="toolbar">
        <el-date-picker
          v-model="range"
          type="datetimerange"
          unlink-panels
          range-separator="→"
          start-placeholder="开始"
          end-placeholder="结束"
          :shortcuts="rangeShortcuts"
          size="default"
          @change="onFilterChange"
        />
        <el-input v-model="f.ip" placeholder="IP（源或目的）" clearable style="width: 180px" @keyup.enter="reload" />
        <el-input v-model="f.port" placeholder="端口" clearable style="width: 110px" @keyup.enter="reload" />
        <el-select v-model="f.proto" placeholder="协议" clearable style="width: 120px" @change="reload">
          <el-option label="TCP" value="TCP" />
          <el-option label="UDP" value="UDP" />
          <el-option label="ICMP" value="ICMP" />
        </el-select>
        <el-input
          v-model="f.q"
          placeholder="搜索 IP / service / conn_state / uid"
          clearable
          style="width: 240px"
          @keyup.enter="reload"
        />
        <el-button type="primary" :icon="Search" @click="reload">检索</el-button>
        <el-button :icon="RefreshRight" @click="resetFilters">重置</el-button>

        <div class="spacer" />

        <!-- 定时自动刷新 -->
        <span class="muted small">自动刷新</span>
        <el-switch v-model="autoRefresh" @change="startTimer" />
        <el-select v-model="intervalSec" size="small" style="width: 96px" :disabled="!autoRefresh" @change="startTimer">
          <el-option :value="10" label="10s" />
          <el-option :value="30" label="30s" />
          <el-option :value="60" label="60s" />
          <el-option :value="300" label="5m" />
        </el-select>
        <el-button :icon="Refresh" circle :loading="loading" @click="reload" />
      </div>

      <el-table :data="rows" v-loading="loading" size="small" class="tbl" @row-click="openDetail">
        <el-table-column label="时间" width="180">
          <template #default="{ row }">{{ formatTime(row.timestamp) }}</template>
        </el-table-column>
        <el-table-column label="源 → 目的" min-width="260">
          <template #default="{ row }">
            <span class="mono">{{ prettyIP(row.src_ip) }}:{{ row.src_port }}</span>
            <el-icon class="arrow"><Right /></el-icon>
            <span class="mono">{{ prettyIP(row.dst_ip) }}:{{ row.dst_port }}</span>
          </template>
        </el-table-column>
        <el-table-column label="协议/服务" width="130">
          <template #default="{ row }">
            <el-tag size="small" effect="plain">{{ row.protocol }}</el-tag>
            <span v-if="row.service" class="muted small"> {{ row.service }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag size="small" :type="connStateTone(row.conn_state)">{{ row.conn_state || '—' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="history" width="120">
          <template #default="{ row }"><span class="mono small">{{ row.history || '—' }}</span></template>
        </el-table-column>
        <el-table-column label="时长(s)" width="90">
          <template #default="{ row }">{{ row.duration.toFixed(3) }}</template>
        </el-table-column>
        <el-table-column label="上行/下行包" width="120">
          <template #default="{ row }">{{ row.up_pkts }} / {{ row.down_pkts }}</template>
        </el-table-column>
        <el-table-column label="上行/下行字节" width="150">
          <template #default="{ row }">{{ formatNumber(row.up_bytes) }} / {{ formatNumber(row.down_bytes) }}</template>
        </el-table-column>
        <el-table-column label="RTT 均值(↑/↓)" width="150">
          <template #default="{ row }">{{ ms(row.up_rtt_avg) }} / {{ ms(row.down_rtt_avg) }}</template>
        </el-table-column>
        <el-table-column label="重传(↑/↓)" width="110">
          <template #default="{ row }">{{ row.up_rexmt_data_pkts }} / {{ row.down_rexmt_data_pkts }}</template>
        </el-table-column>
        <el-table-column label="" width="70" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click.stop="openDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="footer">
        <span class="muted small">共 {{ total }} 条</span>
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :page-sizes="[50, 100, 200, 500]"
          :total="total"
          layout="sizes, prev, pager, next"
          background
          size="small"
          @current-change="reload"
          @size-change="onSizeChange"
        />
      </div>
    </el-card>

    <!-- 完整特征向量抽屉 -->
    <el-drawer v-model="detailOpen" title="流特征详情 · 全部字段" size="720px">
      <div v-if="selected" class="detail">
        <!-- 基本连接信息 -->
        <el-descriptions :column="2" border size="small" title="基本连接信息">
          <el-descriptions-item label="UID">{{ feat('uid') }}</el-descriptions-item>
          <el-descriptions-item label="flow_hash">{{ selected.flow_hash }}</el-descriptions-item>
          <el-descriptions-item label="源 IP">{{ feat('up_ip') }}</el-descriptions-item>
          <el-descriptions-item label="源端口">{{ feat('up_port') }}</el-descriptions-item>
          <el-descriptions-item label="目的 IP">{{ feat('down_ip') }}</el-descriptions-item>
          <el-descriptions-item label="目的端口">{{ feat('down_port') }}</el-descriptions-item>
          <el-descriptions-item label="协议">{{ feat('proto') }}</el-descriptions-item>
          <el-descriptions-item label="IP 协议号">{{ feat('ip_proto') }}</el-descriptions-item>
          <el-descriptions-item label="服务">{{ feat('service') || '—' }}</el-descriptions-item>
          <el-descriptions-item label="conn_state">{{ feat('conn_state') }}</el-descriptions-item>
          <el-descriptions-item label="history">{{ feat('history') }}</el-descriptions-item>
          <el-descriptions-item label="duration(s)">{{ feat('duration') }}</el-descriptions-item>
          <el-descriptions-item label="missed_bytes">{{ feat('missed_bytes') }}</el-descriptions-item>
          <el-descriptions-item label="time_since_last">{{ feat('time_since_last_conn') }}</el-descriptions-item>
          <el-descriptions-item label="来源段" :span="2">{{ selected.seg_file }}</el-descriptions-item>
        </el-descriptions>

        <!-- 流量统计 -->
        <el-descriptions :column="2" border size="small" title="流量统计" class="section">
          <el-descriptions-item label="上行包数">{{ feat('up_pkts') }}</el-descriptions-item>
          <el-descriptions-item label="下行包数">{{ feat('down_pkts') }}</el-descriptions-item>
          <el-descriptions-item label="上行字节">{{ feat('up_bytes') }}</el-descriptions-item>
          <el-descriptions-item label="下行字节">{{ feat('down_bytes') }}</el-descriptions-item>
          <el-descriptions-item label="上行 IP 字节">{{ feat('up_ip_bytes') }}</el-descriptions-item>
          <el-descriptions-item label="下行 IP 字节">{{ feat('down_ip_bytes') }}</el-descriptions-item>
        </el-descriptions>

        <!-- 上行包大小分布 -->
        <el-descriptions :column="2" border size="small" title="上行包大小分布" class="section">
          <el-descriptions-item label="pkt_count">{{ feat('up_pkt_count') }}</el-descriptions-item>
          <el-descriptions-item label="total_bytes">{{ feat('up_total_bytes') }}</el-descriptions-item>
          <el-descriptions-item label="min">{{ feat('up_min_size') }}</el-descriptions-item>
          <el-descriptions-item label="max">{{ feat('up_max_size') }}</el-descriptions-item>
          <el-descriptions-item label="avg">{{ feat('up_avg_size') }}</el-descriptions-item>
          <el-descriptions-item label="median">{{ feat('up_median_size') }}</el-descriptions-item>
          <el-descriptions-item label="Q1">{{ feat('up_first_quartile') }}</el-descriptions-item>
          <el-descriptions-item label="Q3">{{ feat('up_third_quartile') }}</el-descriptions-item>
          <el-descriptions-item label="skewness">{{ feat('up_size_skewness') }}</el-descriptions-item>
          <el-descriptions-item label="kurtosis">{{ feat('up_size_kurtosis') }}</el-descriptions-item>
        </el-descriptions>

        <!-- 下行包大小分布 -->
        <el-descriptions :column="2" border size="small" title="下行包大小分布" class="section">
          <el-descriptions-item label="pkt_count">{{ feat('down_pkt_count') }}</el-descriptions-item>
          <el-descriptions-item label="total_bytes">{{ feat('down_total_bytes') }}</el-descriptions-item>
          <el-descriptions-item label="min">{{ feat('down_min_size') }}</el-descriptions-item>
          <el-descriptions-item label="max">{{ feat('down_max_size') }}</el-descriptions-item>
          <el-descriptions-item label="avg">{{ feat('down_avg_size') }}</el-descriptions-item>
          <el-descriptions-item label="median">{{ feat('down_median_size') }}</el-descriptions-item>
          <el-descriptions-item label="Q1">{{ feat('down_first_quartile') }}</el-descriptions-item>
          <el-descriptions-item label="Q3">{{ feat('down_third_quartile') }}</el-descriptions-item>
          <el-descriptions-item label="skewness">{{ feat('down_size_skewness') }}</el-descriptions-item>
          <el-descriptions-item label="kurtosis">{{ feat('down_size_kurtosis') }}</el-descriptions-item>
        </el-descriptions>

        <!-- 上行 IAT 分布 -->
        <el-descriptions :column="2" border size="small" title="上行 IAT 分布" class="section">
          <el-descriptions-item label="min">{{ feat('up_min_iat') }}</el-descriptions-item>
          <el-descriptions-item label="max">{{ feat('up_max_iat') }}</el-descriptions-item>
          <el-descriptions-item label="avg">{{ feat('up_avg_iat') }}</el-descriptions-item>
          <el-descriptions-item label="median">{{ feat('up_median_iat') }}</el-descriptions-item>
          <el-descriptions-item label="Q1">{{ feat('up_first_quartile_iat') }}</el-descriptions-item>
          <el-descriptions-item label="Q3">{{ feat('up_third_quartile_iat') }}</el-descriptions-item>
          <el-descriptions-item label="skewness">{{ feat('up_iat_skewness') }}</el-descriptions-item>
          <el-descriptions-item label="kurtosis">{{ feat('up_iat_kurtosis') }}</el-descriptions-item>
          <el-descriptions-item label="FFT 特征" :span="2"><span class="mono small">{{ featArr('up_iat_fft_features') }}</span></el-descriptions-item>
        </el-descriptions>

        <!-- 下行 IAT 分布 -->
        <el-descriptions :column="2" border size="small" title="下行 IAT 分布" class="section">
          <el-descriptions-item label="min">{{ feat('down_min_iat') }}</el-descriptions-item>
          <el-descriptions-item label="max">{{ feat('down_max_iat') }}</el-descriptions-item>
          <el-descriptions-item label="avg">{{ feat('down_avg_iat') }}</el-descriptions-item>
          <el-descriptions-item label="median">{{ feat('down_median_iat') }}</el-descriptions-item>
          <el-descriptions-item label="Q1">{{ feat('down_first_quartile_iat') }}</el-descriptions-item>
          <el-descriptions-item label="Q3">{{ feat('down_third_quartile_iat') }}</el-descriptions-item>
          <el-descriptions-item label="skewness">{{ feat('down_iat_skewness') }}</el-descriptions-item>
          <el-descriptions-item label="kurtosis">{{ feat('down_iat_kurtosis') }}</el-descriptions-item>
          <el-descriptions-item label="FFT 特征" :span="2"><span class="mono small">{{ featArr('down_iat_fft_features') }}</span></el-descriptions-item>
        </el-descriptions>

        <!-- 上行控制字段统计 -->
        <el-descriptions :column="2" border size="small" title="上行控制字段统计" class="section">
          <el-descriptions-item label="pkt_count">{{ feat('up_control_pkt_count') }}</el-descriptions-item>
          <el-descriptions-item label="total_bytes">{{ feat('up_control_total_bytes') }}</el-descriptions-item>
          <el-descriptions-item label="min">{{ feat('up_control_min_size') }}</el-descriptions-item>
          <el-descriptions-item label="max">{{ feat('up_control_max_size') }}</el-descriptions-item>
          <el-descriptions-item label="avg">{{ feat('up_control_avg_size') }}</el-descriptions-item>
          <el-descriptions-item label="median">{{ feat('up_control_median_size') }}</el-descriptions-item>
          <el-descriptions-item label="Q1">{{ feat('up_control_first_quartile') }}</el-descriptions-item>
          <el-descriptions-item label="Q3">{{ feat('up_control_third_quartile') }}</el-descriptions-item>
          <el-descriptions-item label="skewness">{{ feat('up_control_skewness') }}</el-descriptions-item>
          <el-descriptions-item label="kurtosis">{{ feat('up_control_kurtosis') }}</el-descriptions-item>
        </el-descriptions>

        <!-- 下行控制字段统计 -->
        <el-descriptions :column="2" border size="small" title="下行控制字段统计" class="section">
          <el-descriptions-item label="pkt_count">{{ feat('down_control_pkt_count') }}</el-descriptions-item>
          <el-descriptions-item label="total_bytes">{{ feat('down_control_total_bytes') }}</el-descriptions-item>
          <el-descriptions-item label="min">{{ feat('down_control_min_size') }}</el-descriptions-item>
          <el-descriptions-item label="max">{{ feat('down_control_max_size') }}</el-descriptions-item>
          <el-descriptions-item label="avg">{{ feat('down_control_avg_size') }}</el-descriptions-item>
          <el-descriptions-item label="median">{{ feat('down_control_median_size') }}</el-descriptions-item>
          <el-descriptions-item label="Q1">{{ feat('down_control_first_quartile') }}</el-descriptions-item>
          <el-descriptions-item label="Q3">{{ feat('down_control_third_quartile') }}</el-descriptions-item>
          <el-descriptions-item label="skewness">{{ feat('down_control_skewness') }}</el-descriptions-item>
          <el-descriptions-item label="kurtosis">{{ feat('down_control_kurtosis') }}</el-descriptions-item>
        </el-descriptions>

        <!-- 上行 RTT 分布 -->
        <el-descriptions :column="2" border size="small" title="上行 RTT" class="section">
          <el-descriptions-item label="samples">{{ feat('up_rtt_samples') }}</el-descriptions-item>
          <el-descriptions-item label="min">{{ feat('up_rtt_min') }}</el-descriptions-item>
          <el-descriptions-item label="max">{{ feat('up_rtt_max') }}</el-descriptions-item>
          <el-descriptions-item label="avg">{{ feat('up_rtt_avg') }}</el-descriptions-item>
          <el-descriptions-item label="median">{{ feat('up_rtt_median') }}</el-descriptions-item>
          <el-descriptions-item label="Q1">{{ feat('up_rtt_first_quartile') }}</el-descriptions-item>
          <el-descriptions-item label="Q3">{{ feat('up_rtt_third_quartile') }}</el-descriptions-item>
          <el-descriptions-item label="skewness">{{ feat('up_rtt_skewness') }}</el-descriptions-item>
          <el-descriptions-item label="kurtosis">{{ feat('up_rtt_kurtosis') }}</el-descriptions-item>
        </el-descriptions>

        <!-- 下行 RTT 分布 -->
        <el-descriptions :column="2" border size="small" title="下行 RTT" class="section">
          <el-descriptions-item label="samples">{{ feat('down_rtt_samples') }}</el-descriptions-item>
          <el-descriptions-item label="min">{{ feat('down_rtt_min') }}</el-descriptions-item>
          <el-descriptions-item label="max">{{ feat('down_rtt_max') }}</el-descriptions-item>
          <el-descriptions-item label="avg">{{ feat('down_rtt_avg') }}</el-descriptions-item>
          <el-descriptions-item label="median">{{ feat('down_rtt_median') }}</el-descriptions-item>
          <el-descriptions-item label="Q1">{{ feat('down_rtt_first_quartile') }}</el-descriptions-item>
          <el-descriptions-item label="Q3">{{ feat('down_rtt_third_quartile') }}</el-descriptions-item>
          <el-descriptions-item label="skewness">{{ feat('down_rtt_skewness') }}</el-descriptions-item>
          <el-descriptions-item label="kurtosis">{{ feat('down_rtt_kurtosis') }}</el-descriptions-item>
        </el-descriptions>

        <!-- TCP 标志统计 -->
        <el-descriptions :column="2" border size="small" title="TCP 标志统计" class="section">
          <el-descriptions-item label="↑ ACK">{{ feat('up_ack_pkts') }}</el-descriptions-item>
          <el-descriptions-item label="↓ ACK">{{ feat('down_ack_pkts') }}</el-descriptions-item>
          <el-descriptions-item label="↑ Pure ACK">{{ feat('up_pure_acks') }}</el-descriptions-item>
          <el-descriptions-item label="↓ Pure ACK">{{ feat('down_pure_acks') }}</el-descriptions-item>
          <el-descriptions-item label="↑ SACK">{{ feat('up_sack_pkts') }}</el-descriptions-item>
          <el-descriptions-item label="↓ SACK">{{ feat('down_sack_pkts') }}</el-descriptions-item>
          <el-descriptions-item label="↑ DSACK">{{ feat('up_dsack_pkts') }}</el-descriptions-item>
          <el-descriptions-item label="↓ DSACK">{{ feat('down_dsack_pkts') }}</el-descriptions-item>
          <el-descriptions-item label="↑ max SACK blks">{{ feat('up_max_sack_blks') }}</el-descriptions-item>
          <el-descriptions-item label="↓ max SACK blks">{{ feat('down_max_sack_blks') }}</el-descriptions-item>
          <el-descriptions-item label="↑ SYN">{{ feat('up_syn_pkts') }}</el-descriptions-item>
          <el-descriptions-item label="↓ SYN">{{ feat('down_syn_pkts') }}</el-descriptions-item>
          <el-descriptions-item label="↑ FIN">{{ feat('up_fin_pkts') }}</el-descriptions-item>
          <el-descriptions-item label="↓ FIN">{{ feat('down_fin_pkts') }}</el-descriptions-item>
          <el-descriptions-item label="↑ PUSH data">{{ feat('up_pushed_data_pkts') }}</el-descriptions-item>
          <el-descriptions-item label="↓ PUSH data">{{ feat('down_pushed_data_pkts') }}</el-descriptions-item>
        </el-descriptions>

        <!-- 数据传输统计 -->
        <el-descriptions :column="2" border size="small" title="数据传输统计" class="section">
          <el-descriptions-item label="↑ data pkts">{{ feat('up_actual_data_pkts') }}</el-descriptions-item>
          <el-descriptions-item label="↓ data pkts">{{ feat('down_actual_data_pkts') }}</el-descriptions-item>
          <el-descriptions-item label="↑ data bytes">{{ feat('up_actual_data_bytes') }}</el-descriptions-item>
          <el-descriptions-item label="↓ data bytes">{{ feat('down_actual_data_bytes') }}</el-descriptions-item>
          <el-descriptions-item label="↑ unique bytes">{{ feat('up_unique_bytes') }}</el-descriptions-item>
          <el-descriptions-item label="↓ unique bytes">{{ feat('down_unique_bytes') }}</el-descriptions-item>
          <el-descriptions-item label="↑ rexmt pkts">{{ feat('up_rexmt_data_pkts') }}</el-descriptions-item>
          <el-descriptions-item label="↓ rexmt pkts">{{ feat('down_rexmt_data_pkts') }}</el-descriptions-item>
          <el-descriptions-item label="↑ rexmt bytes">{{ feat('up_rexmt_data_bytes') }}</el-descriptions-item>
          <el-descriptions-item label="↓ rexmt bytes">{{ feat('down_rexmt_data_bytes') }}</el-descriptions-item>
          <el-descriptions-item label="↑ zwnd probe">{{ feat('up_zwnd_probe_pkts') }}</el-descriptions-item>
          <el-descriptions-item label="↓ zwnd probe">{{ feat('down_zwnd_probe_pkts') }}</el-descriptions-item>
          <el-descriptions-item label="↑ OOO pkts">{{ feat('up_out_of_order_pkts') }}</el-descriptions-item>
          <el-descriptions-item label="↓ OOO pkts">{{ feat('down_out_of_order_pkts') }}</el-descriptions-item>
        </el-descriptions>

        <!-- Bulk 模式 + 整体 FFT -->
        <el-descriptions :column="2" border size="small" title="Bulk 模式与整体 FFT" class="section">
          <el-descriptions-item label="bulk 转换次数">{{ feat('bulk_trans_transitions') }}</el-descriptions-item>
          <el-descriptions-item label="bulk 时长(s)">{{ feat('time_spent_in_bulk') }}</el-descriptions-item>
          <el-descriptions-item label="flow IAT FFT" :span="2"><span class="mono small">{{ featArr('flow_iat_fft_features') }}</span></el-descriptions-item>
        </el-descriptions>

        <div class="actions">
          <el-button size="small" :icon="Download" :tag="'a'" :href="pcapUrl(selected)">下载该会话 PCAP</el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Download, Histogram, Refresh, RefreshRight, Right, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { api } from '@/api/client'
import type { FlowFeature, FlowFeatureQuery } from '@/api/types'
import { formatNumber, formatTime, prettyIP } from '@/utils/format'

const rows = ref<FlowFeature[]>([])
const total = ref(0)
const loading = ref(false)
const chDisabled = ref(false)

const range = ref<[string, string] | null>(null)
const page = ref(1)
const pageSize = ref(100)

const f = ref<{ ip: string; port: string; proto: string; q: string }>({ ip: '', port: '', proto: '', q: '' })

const autoRefresh = ref(true)
const intervalSec = ref(30)

const detailOpen = ref(false)
const selected = ref<FlowFeature | null>(null)

const rangeShortcuts = [
  { text: '最近 1 小时', value: () => rangeFromMin(60) },
  { text: '最近 24 小时', value: () => rangeFromMin(60 * 24) },
  { text: '最近 7 天', value: () => rangeFromMin(60 * 24 * 7) },
]
function rangeFromMin(min: number): [Date, Date] {
  const end = new Date()
  return [new Date(end.getTime() - min * 60 * 1000), end]
}

function buildQuery(): FlowFeatureQuery {
  const q: FlowFeatureQuery = {
    since: range.value?.[0],
    until: range.value?.[1],
    limit: pageSize.value,
    offset: (page.value - 1) * pageSize.value,
  }
  if (f.value.ip.trim()) q.ip = f.value.ip.trim()
  const port = parseInt(f.value.port, 10)
  if (!Number.isNaN(port) && port > 0) q.port = port
  if (f.value.proto) q.proto = f.value.proto
  if (f.value.q.trim()) q.q = f.value.q.trim()
  return q
}

async function load() {
  loading.value = true
  try {
    const env = await api.historyFlowFeatures(buildQuery())
    if (env.disabled) {
      chDisabled.value = true
      rows.value = []
      total.value = 0
      return
    }
    chDisabled.value = false
    rows.value = env.items
    total.value = env.total
  } catch (err: any) {
    ElMessage.error('加载流特征失败: ' + (err?.message || err))
  } finally {
    loading.value = false
  }
}

function reload() {
  page.value = 1
  void load()
}
function onSizeChange() {
  page.value = 1
  void load()
}
function onFilterChange() {
  reload()
}
function resetFilters() {
  f.value = { ip: '', port: '', proto: '', q: '' }
  reload()
}

function openDetail(row: FlowFeature) {
  selected.value = row
  detailOpen.value = true
}

// Parsed features object for the selected row (memoized).
const parsedFeatures = computed<Record<string, any>>(() => {
  if (!selected.value?.features) return {}
  try {
    return JSON.parse(selected.value.features)
  } catch {
    return {}
  }
})

// Read a scalar field from parsed features JSON.
function feat(key: string): string {
  const v = parsedFeatures.value[key]
  if (v === undefined || v === null) return '—'
  return String(v)
}

// Read an array field and display as comma-separated.
function featArr(key: string): string {
  const v = parsedFeatures.value[key]
  if (!Array.isArray(v) || v.length === 0) return '[]'
  return '[' + v.map((x: number) => typeof x === 'number' ? x.toFixed(4) : String(x)).join(', ') + ']'
}

function pcapUrl(row: FlowFeature): string {
  return api.pcapSessionUrl({
    src_ip: row.src_ip,
    dst_ip: row.dst_ip,
    src_port: row.src_port,
    dst_port: row.dst_port,
    proto: row.protocol,
  })
}

function ms(seconds: number): string {
  if (!seconds) return '—'
  return (seconds * 1000).toFixed(1) + 'ms'
}

function connStateTone(s: string): 'success' | 'info' | 'warning' | 'danger' | '' {
  switch (s) {
    case 'SF':
      return 'success'
    case 'S0':
    case 'REJ':
    case 'RSTO':
    case 'RSTR':
      return 'warning'
    case 'OTH':
      return 'info'
    default:
      return ''
  }
}

// ── 定时自动刷新 ──────────────────────────────────────────────────────────
let timer: number | null = null
function startTimer() {
  if (timer != null) {
    window.clearInterval(timer)
    timer = null
  }
  if (autoRefresh.value) {
    timer = window.setInterval(() => void load(), intervalSec.value * 1000)
  }
}

onMounted(() => {
  const [s, e] = rangeFromMin(60 * 24)
  range.value = [s.toISOString(), e.toISOString()]
  void load()
  startTimer()
})
onBeforeUnmount(() => {
  if (timer != null) window.clearInterval(timer)
})
</script>

<style scoped>
.panel {
  border: none;
}
.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
}
.muted {
  color: var(--el-text-color-secondary);
}
.small {
  font-size: 12px;
}
.hint {
  margin-bottom: 12px;
}
.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.toolbar .spacer {
  flex: 1;
}
.tbl {
  width: 100%;
  cursor: pointer;
}
.mono {
  font-family: var(--el-font-family-mono, monospace);
}
.arrow {
  margin: 0 6px;
  color: var(--el-text-color-secondary);
}
.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
}
.detail .section {
  margin-top: 16px;
}
.detail .actions {
  margin-top: 16px;
}
.json {
  background: var(--el-fill-color-light);
  border-radius: 6px;
  padding: 12px;
  font-size: 12px;
  line-height: 1.5;
  max-height: 50vh;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
