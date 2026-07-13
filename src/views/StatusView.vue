<template>
  <div class="page">
    <!-- ── KPI cards ───────────────────────────────────────────────── -->
    <el-row :gutter="14" class="kpi-row">
      <el-col :xs="24" :sm="12" :md="6">
        <StatCard
          label="包数"
          :value="formatNumber(stats?.packets ?? 0)"
          :sub="formatRate(rates.pps) + ' pps'"
          tone="#3b82f6"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <StatCard
          label="吞吐"
          :value="formatBytes(stats?.bytes ?? 0)"
          :sub="formatBitsPerSec(rates.bps)"
          tone="#22c55e"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <StatCard
          label="活跃流"
          :value="formatNumber(stats?.flows ?? 0)"
          tone="#a855f7"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <StatCard
          label="解析错误"
          :value="formatNumber(stats?.parse_errors ?? 0)"
          :sub="parseErrorRate"
          tone="#ef4444"
        />
      </el-col>
    </el-row>

    <!-- ── 探针健康总览 ──────────────────────────────────────────────── -->
    <el-row :gutter="14" class="kpi-row">
      <el-col :xs="24" :sm="12" :md="5">
        <el-card shadow="never" class="health-badge" :class="statusClass">
          <div class="badge-inner">
            <el-icon :size="32"><CircleCheckFilled v-if="healthStatus === 'ok'" /><WarningFilled v-else-if="healthStatus === 'degraded'" /><CircleCloseFilled v-else /></el-icon>
            <div>
              <div class="badge-label">探针状态</div>
              <div class="badge-value">{{ statusLabel }}</div>
              <div v-if="statusReasons.length" class="badge-reasons">
                <span v-for="r in statusReasons" :key="r" class="reason-tag">{{ r }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="5">
        <StatCard label="稳定运行" :value="agentUptimeText" :sub="sysUptimeText" tone="#06b6d4" />
      </el-col>
      <el-col :xs="24" :sm="12" :md="5">
        <StatCard label="CPU" :value="cpuText" :sub="memText" tone="#3b82f6" />
      </el-col>
      <el-col :xs="24" :sm="12" :md="5">
        <StatCard label="磁盘" :value="diskFreeText" :sub="diskTotalText" tone="#22c55e" />
      </el-col>
      <el-col :xs="24" :sm="12" :md="4">
        <StatCard label="网卡" :value="ifaceStatus" :sub="ifaceErrors" tone="#a855f7" />
      </el-col>
    </el-row>

    <!-- ── Capture + 解析 ──────────────────────────────────────────── -->
    <el-row :gutter="14" class="body-row">
      <el-col :xs="24" :md="12">
        <el-card shadow="never">
          <template #header><span class="card-title">Capture 进程</span></template>
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="状态">
              <el-tag :type="stats ? 'success' : 'danger'" size="small">
                {{ stats ? '运行中' : '未连接' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="Capture 存活">
              <el-tag :type="health?.capture_alive ? 'success' : 'danger'" size="small">
                {{ health?.capture_alive ? '正常' : '异常' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="收包数">{{ fmt(health?.rx_packets) }}</el-descriptions-item>
            <el-descriptions-item label="收字节">{{ fmtBytes(health?.rx_bytes) }}</el-descriptions-item>
            <el-descriptions-item label="解析错误">{{ fmt(health?.parse_errors) }}</el-descriptions-item>
            <el-descriptions-item label="IPC 推送">{{ fmt(health?.ipc_pushed) }}</el-descriptions-item>
            <el-descriptions-item label="IPC 丢弃">
              <span :class="{ 'text-danger': (health?.ipc_drops ?? 0) > 0 }">{{ fmt(health?.ipc_drops) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="活跃流">{{ fmt(health?.flow_count) }}</el-descriptions-item>
            <el-descriptions-item label="nDPI 已分类">{{ formatNumber(stats?.ndpi_classified ?? 0) }}</el-descriptions-item>
            <el-descriptions-item label="DNS 解析数">{{ formatNumber(stats?.dns_parsed ?? 0) }}</el-descriptions-item>
            <el-descriptions-item label="HTTP 解析数">{{ formatNumber(stats?.http_parsed ?? 0) }}</el-descriptions-item>
            <el-descriptions-item label="TLS 解析数">{{ formatNumber(stats?.tls_parsed ?? 0) }}</el-descriptions-item>
            <el-descriptions-item label="ICMP 解析数">{{ formatNumber(stats?.icmp_parsed ?? 0) }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card shadow="never">
          <template #header><span class="card-title">鲁棒性指标</span></template>
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="Worker 重启">
              <span :class="{ 'text-warning': (health?.worker_restarts ?? 0) > 0 }">{{ fmt(health?.worker_restarts) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="Worker 卡死">
              <span :class="{ 'text-danger': (health?.worker_stalls ?? 0) > 0 }">{{ fmt(health?.worker_stalls) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="网卡断连(秒)">{{ fmt(health?.iface_down_seconds) }}</el-descriptions-item>
            <el-descriptions-item label="PCAP 跳过">{{ fmt(health?.pcap_skipped) }}</el-descriptions-item>
            <el-descriptions-item label="IPC 背压">{{ fmt(health?.ipc_backpressure) }}</el-descriptions-item>
            <el-descriptions-item label="流驱逐">{{ fmt(health?.flow_evictions) }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>

    <!-- ── Agent + 存储 + 系统资源 ─────────────────────────────────── -->
    <el-row :gutter="14" class="body-row">
      <el-col :xs="24" :md="12">
        <el-card shadow="never">
          <template #header><span class="card-title">Agent + 存储</span></template>
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="Agent 存活">
              <el-tag :type="health?.agent_alive ? 'success' : 'danger'" size="small">
                {{ health?.agent_alive ? '正常' : '异常' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="ClickHouse">
              <el-tag :type="health?.clickhouse_alive ? 'success' : 'danger'" size="small">
                {{ health?.clickhouse_alive ? '正常' : '异常' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="Store 推送">{{ fmt(health?.store_pushed) }}</el-descriptions-item>
            <el-descriptions-item label="Store 丢弃">
              <span :class="{ 'text-danger': (health?.store_dropped ?? 0) > 0 }">{{ fmt(health?.store_dropped) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="Store 写入">{{ fmt(health?.store_inserted) }}</el-descriptions-item>
            <el-descriptions-item label="Batch 失败">
              <span :class="{ 'text-danger': (health?.store_batch_fail ?? 0) > 0 }">{{ fmt(health?.store_batch_fail) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="告警已发出">{{ fmt(health?.alerts_emitted) }}</el-descriptions-item>
            <el-descriptions-item label="告警已抑制">{{ formatNumber(stats?.alerts_suppressed ?? 0) }}</el-descriptions-item>
            <el-descriptions-item label="nDPI 风险标记">{{ formatNumber(stats?.ndpi_risk_flagged ?? 0) }}</el-descriptions-item>
            <el-descriptions-item label="IPC 丢包率">
              <span :class="{ 'text-danger': ipcDropRate > 1, 'text-warning': ipcDropRate > 0 }">{{ ipcDropRate.toFixed(3) }}%</span>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card shadow="never">
          <template #header><span class="card-title">系统资源</span></template>
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="CPU 使用率">
              <el-progress :percentage="health?.cpu_percent ?? 0" :stroke-width="14" :text-inside="true" />
            </el-descriptions-item>
            <el-descriptions-item label="内存使用">{{ fmtBytes(health?.mem_used_bytes) }} / {{ fmtBytes(health?.mem_total_bytes) }}</el-descriptions-item>
            <el-descriptions-item label="磁盘可用">{{ fmtBytes(health?.disk_free_bytes) }} / {{ fmtBytes(health?.disk_total_bytes) }}</el-descriptions-item>
            <el-descriptions-item label="网卡 Link">
              <el-tag :type="health?.iface_link_up ? 'success' : 'danger'" size="small">
                {{ health?.iface_link_up ? 'UP' : 'DOWN' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="网卡 RX 错误">{{ fmt(health?.iface_rx_errors) }}</el-descriptions-item>
            <el-descriptions-item label="网卡 TX 错误">{{ fmt(health?.iface_tx_errors) }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>

    <!-- ── 健康历史 ──────────────────────────────────────────────────── -->
    <el-row :gutter="14" class="body-row">
      <el-col :span="24">
        <el-card shadow="never">
          <template #header>
            <div style="display:flex;align-items:center;justify-content:space-between">
              <span class="card-title">健康历史</span>
              <el-radio-group v-model="histRange" size="small" @change="loadHistory">
                <el-radio-button label="30m">30分钟</el-radio-button>
                <el-radio-button label="1h">1小时</el-radio-button>
                <el-radio-button label="6h">6小时</el-radio-button>
                <el-radio-button label="24h">24小时</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div v-if="historyItems.length === 0" class="empty-hist">
            <el-empty description="暂无历史数据" :image-size="60" />
          </div>
          <el-table v-else :data="historyItems" size="small" max-height="400" stripe>
            <el-table-column prop="timestamp" label="时间" width="180" :formatter="fmtTime" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 'ok' ? 'success' : row.status === 'degraded' ? 'warning' : 'danger'" size="small">
                  {{ row.status === 'ok' ? '正常' : row.status === 'degraded' ? '降级' : '严重' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="cpu_percent" label="CPU%" width="80">
              <template #default="{ row }">{{ row.cpu_percent?.toFixed(1) }}%</template>
            </el-table-column>
            <el-table-column prop="rx_packets" label="收包" width="110" :formatter="(r:any) => fmt(r.rx_packets)" />
            <el-table-column prop="ipc_drops" label="IPC丢" width="90" :formatter="(r:any) => fmt(r.ipc_drops)" />
            <el-table-column prop="worker_restarts" label="重启" width="70" />
            <el-table-column prop="worker_stalls" label="卡死" width="70" />
            <el-table-column prop="store_batch_fail" label="写失败" width="80" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- ── connection badge ────────────────────────────────────────── -->
    <el-row :gutter="14" class="body-row">
      <el-col :span="24">
        <el-card shadow="never">
          <template #header><span class="card-title">连接状态</span></template>
          <ConnectionBadge />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useProbeStore } from '@/stores/probe'
import { api } from '@/api/client'
import StatCard from '@/components/StatCard.vue'
import ConnectionBadge from '@/components/ConnectionBadge.vue'
import { CircleCheckFilled, WarningFilled, CircleCloseFilled } from '@element-plus/icons-vue'
import { formatBitsPerSec, formatBytes, formatNumber, formatRate } from '@/utils/format'

const store = useProbeStore()
const stats = computed(() => store.stats)
const rates = computed(() => store.rates)

// ── health (from watchdog /ops/health) ──────────────────────────────
const health = ref<any>(null)
const histRange = ref('30m')
const historyItems = ref<any[]>([])
let healthTimer: number | null = null

const healthStatus = computed(() => health.value?.status ?? 'unknown')
const statusClass = computed(() => ({
  'badge-ok': healthStatus.value === 'ok',
  'badge-degraded': healthStatus.value === 'degraded',
  'badge-critical': healthStatus.value === 'critical' || healthStatus.value === 'unknown',
}))
const statusLabel = computed(() => {
  const m: Record<string, string> = { ok: '正常', degraded: '降级', critical: '严重', unknown: '未知' }
  return m[healthStatus.value] ?? '未知'
})
const statusReasons = computed(() => health.value?.status_reasons ?? [])

const agentUptimeText = computed(() => fmtDuration(health.value?.agent_uptime_seconds ?? 0))
const sysUptimeText = computed(() => `系统 ${fmtDuration(health.value?.uptime_seconds ?? 0)}`)

const cpuText = computed(() => `${(health.value?.cpu_percent ?? 0).toFixed(1)}%`)
const memText = computed(() => {
  const used = health.value?.mem_used_bytes ?? 0
  const total = health.value?.mem_total_bytes ?? 0
  return `${fmtBytes(used)} / ${fmtBytes(total)}`
})
const diskFreeText = computed(() => fmtBytes(health.value?.disk_free_bytes ?? 0))
const diskTotalText = computed(() => `总量 ${fmtBytes(health.value?.disk_total_bytes ?? 0)}`)
const ifaceStatus = computed(() => health.value?.iface_link_up ? 'UP' : 'DOWN')
const ifaceErrors = computed(() => {
  const rx = health.value?.iface_rx_errors ?? 0
  const tx = health.value?.iface_tx_errors ?? 0
  return `RX错误 ${rx} / TX错误 ${tx}`
})
const ipcDropRate = computed(() => {
  const pushed = health.value?.ipc_pushed ?? 0
  const drops = health.value?.ipc_drops ?? 0
  const total = pushed + drops
  if (total === 0) return 0
  return (drops / total) * 100
})

const parseErrorRate = computed(() => {
  const errs = stats.value?.parse_errors ?? 0
  const pkts = stats.value?.packets ?? 0
  if (pkts === 0) return '—'
  return `${((errs / pkts) * 100).toFixed(3)}%`
})

function fmtDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '—'
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (d > 0) return `${d}天${h}时${m}分`
  if (h > 0) return `${h}时${m}分`
  return `${m}分${seconds % 60}秒`
}

function fmt(v: number | undefined): string {
  if (v == null) return '—'
  return v.toLocaleString()
}

function fmtBytes(v: number | undefined): string {
  if (v == null || v === 0) return '—'
  if (v < 1024) return `${v} B`
  if (v < 1024 * 1024) return `${(v / 1024).toFixed(1)} KB`
  if (v < 1024 * 1024 * 1024) return `${(v / 1024 / 1024).toFixed(1)} MB`
  return `${(v / 1024 / 1024 / 1024).toFixed(2)} GB`
}

function fmtTime(_row: any, _col: any, val: string): string {
  if (!val) return '—'
  const d = new Date(val)
  return d.toLocaleTimeString('zh-CN', { hour12: false })
}

async function fetchHealth() {
  try {
    health.value = await api.opsHealth()
  } catch { /* ignore */ }
}

async function loadHistory() {
  const now = new Date()
  const rangeMs: Record<string, number> = {
    '30m': 30 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '6h': 6 * 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
  }
  const since = new Date(now.getTime() - (rangeMs[histRange.value] ?? 30 * 60 * 1000))
  try {
    const res = await api.opsHealthHistory(since.toISOString(), now.toISOString())
    historyItems.value = res?.items ?? []
  } catch {
    historyItems.value = []
  }
}

onMounted(() => {
  fetchHealth()
  loadHistory()
  healthTimer = window.setInterval(fetchHealth, 5000)
})

onBeforeUnmount(() => {
  if (healthTimer != null) window.clearInterval(healthTimer)
})
</script>

<style scoped>
.kpi-row { margin-bottom: 14px; }
.body-row { margin-bottom: 14px; }
.card-title { font-weight: 600; color: var(--sg-text, #303133); }
.empty-hist { padding: 20px 0; text-align: center; color: var(--sg-text-muted, #909399); }

.health-badge { border-left: 4px solid #e8e8e8; }
.health-badge.badge-ok { border-left-color: #52c41a; }
.health-badge.badge-degraded { border-left-color: #faad14; }
.health-badge.badge-critical { border-left-color: #ff4d4f; }

.badge-inner { display: flex; align-items: center; gap: 12px; }
.badge-label { font-size: 12px; color: var(--sg-text-muted, #909399); }
.badge-value { font-size: 18px; font-weight: 700; }
.badge-ok .badge-value { color: #52c41a; }
.badge-degraded .badge-value { color: #faad14; }
.badge-critical .badge-value { color: #ff4d4f; }

.badge-reasons { margin-top: 4px; display: flex; flex-wrap: wrap; gap: 4px; }
.reason-tag {
  display: inline-block; font-size: 11px; padding: 1px 6px;
  border-radius: 3px; background: rgba(250, 173, 20, 0.1);
  color: #d48806; line-height: 1.5;
}
.badge-critical .reason-tag { background: rgba(255, 77, 79, 0.1); color: #cf1322; }

.text-danger { color: #ff4d4f; font-weight: 600; }
.text-warning { color: #faad14; font-weight: 600; }
</style>
