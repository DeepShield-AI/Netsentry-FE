<template>
  <div class="page">
    <!-- ── Status banner ──────────────────────────────────────────────── -->
    <el-card shadow="never" class="status-banner" :class="status?.connected ? 'connected' : 'disconnected'">
      <div class="banner-inner">
        <el-icon :size="40">
          <CircleCheckFilled v-if="status?.connected" />
          <CircleCloseFilled v-else />
        </el-icon>
        <div class="banner-text">
          <div class="banner-title">
            {{ status?.connected ? '已连接 DeepShield Server' : '未连接 DeepShield Server' }}
          </div>
          <div class="banner-sub" v-if="status?.connected">
            <a :href="status.server_url" target="_blank" class="server-link">{{ status.server_url }}</a> · Agent ID: {{ status.agent_id }} · Probe: {{ status.probe_id }}
          </div>
          <div class="banner-sub" v-else>
            点击下方"连接"按钮，或编辑 config.yaml 中的 deepshield 段落来启用数据上送
          </div>
        </div>
        <div class="banner-actions">
          <el-button
            v-if="!status?.connected"
            type="primary"
            :icon="Link"
            @click="showConnectDialog = true"
          >
            连接 Server
          </el-button>
          <el-button
            v-if="status?.connected"
            type="danger"
            plain
            :icon="Delete"
            :loading="disconnecting"
            @click="handleDisconnect"
          >
            断开连接
          </el-button>
          <el-button :icon="Refresh" @click="fetchStatus">刷新</el-button>
        </div>
      </div>
    </el-card>

    <!-- ── KPI cards ──────────────────────────────────────────────────── -->
    <el-row :gutter="14" class="kpi-row" v-if="status?.connected">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="never" class="kpi-card">
          <div class="kpi-label">已发送批次</div>
          <div class="kpi-value">{{ status.sent_batches }}</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="never" class="kpi-card">
          <div class="kpi-label">发送失败</div>
          <div class="kpi-value" :class="{ 'text-danger': status.failed_batches > 0 }">
            {{ status.failed_batches }}
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="never" class="kpi-card">
          <div class="kpi-label">总上传量</div>
          <div class="kpi-value-sm">{{ formatBytes(status.total_bytes_sent || 0) }}</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="never" class="kpi-card">
          <div class="kpi-label">上次心跳</div>
          <div class="kpi-value-sm" :class="{ 'text-danger': status.heartbeat_error }">{{ heartbeatLabel }}</div>
          <div v-if="status.heartbeat_error" class="kpi-error">{{ status.heartbeat_error }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- ── Summary KPI row 2 ──────────────────────────────────────────── -->
    <el-row :gutter="14" class="kpi-row" v-if="status?.connected">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="never" class="kpi-card">
          <div class="kpi-label">总行数推送</div>
          <div class="kpi-value-sm">{{ formatNum(totalRowsPushed) }}</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="never" class="kpi-card">
          <div class="kpi-label">总行数发送成功</div>
          <div class="kpi-value-sm" :class="{ 'text-success': totalRowsSent > 0 }">{{ formatNum(totalRowsSent) }}</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="never" class="kpi-card">
          <div class="kpi-label">总行数发送失败</div>
          <div class="kpi-value-sm" :class="{ 'text-danger': totalRowsFailed > 0 }">{{ formatNum(totalRowsFailed) }}</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="never" class="kpi-card">
          <div class="kpi-label">待发送队列</div>
          <div class="kpi-value-sm" :class="{ 'text-warning': totalPending > 0 }">{{ formatNum(totalPending) }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- ── Connection details ─────────────────────────────────────────── -->
    <el-card shadow="never" class="detail-card" v-if="status?.connected">
      <template #header><span>连接详情</span></template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="Server URL">{{ status.server_url }}</el-descriptions-item>
        <el-descriptions-item label="API Key">{{ status.api_key_masked }}</el-descriptions-item>
        <el-descriptions-item label="Agent ID">{{ status.agent_id || '未注册' }}</el-descriptions-item>
        <el-descriptions-item label="Probe ID">{{ status.probe_id }}</el-descriptions-item>
        <el-descriptions-item label="组织 ID">{{ status.org_id }}</el-descriptions-item>
        <el-descriptions-item label="Gzip 压缩">{{ status.gzip ? '启用' : '禁用' }}</el-descriptions-item>
        <el-descriptions-item label="批量行数">{{ status.batch_rows }}</el-descriptions-item>
        <el-descriptions-item label="刷新间隔">{{ status.flush_interval_s }}s</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- ── Per-table upload stats ──────────────────────────────────────── -->
    <el-card shadow="never" class="detail-card" v-if="status?.connected && status.table_stats?.length">
      <template #header><span>数据上传明细</span></template>
      <el-table :data="status.table_stats" stripe size="small" :default-sort="{ prop: 'rows_pushed', order: 'descending' }">
        <el-table-column prop="table" label="数据表" min-width="140" sortable>
          <template #default="{ row }">
            <span class="mono">{{ row.table }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="rows_pushed" label="推送行数" width="100" sortable :formatter="numFmt" />
        <el-table-column prop="rows_sent" label="成功行数" width="100" sortable :formatter="numFmt">
          <template #default="{ row }">
            <span :class="{ 'text-success': row.rows_sent > 0 }">{{ formatNum(row.rows_sent) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="rows_failed" label="失败行数" width="100" sortable :formatter="numFmt">
          <template #default="{ row }">
            <span :class="{ 'text-danger': row.rows_failed > 0 }">{{ formatNum(row.rows_failed) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="flush_success" label="成功批次" width="90" sortable :formatter="numFmt" />
        <el-table-column prop="flush_failed" label="失败批次" width="90" sortable :formatter="numFmt">
          <template #default="{ row }">
            <span :class="{ 'text-danger': row.flush_failed > 0 }">{{ row.flush_failed }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="bytes_sent" label="已传字节" width="100" sortable :formatter="bytesFmt" />
        <el-table-column prop="pending" label="待发" width="70" sortable>
          <template #default="{ row }">
            <span :class="{ 'text-warning': row.pending > 0 }">{{ row.pending }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="last_flush_at" label="上次发送" width="140" sortable>
          <template #default="{ row }">
            {{ row.last_flush_at ? formatTime(row.last_flush_at) : '—' }}
          </template>
        </el-table-column>
        <el-table-column prop="last_error" label="错误" min-width="200">
          <template #default="{ row }">
            <span v-if="row.last_error" class="text-danger xs">{{ row.last_error }}</span>
            <span v-else class="text-muted">—</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- ── Connect dialog ─────────────────────────────────────────────── -->
    <el-dialog v-model="showConnectDialog" title="连接 DeepShield Server" width="520px">
      <el-form label-width="140px" :model="connectForm">
        <el-form-item label="Server URL" required>
          <el-input v-model="connectForm.server_url" placeholder="http://server-1.deepshields.com:30417" />
        </el-form-item>
        <el-form-item label="API Key" required>
          <el-input v-model="connectForm.api_key" placeholder="sk-sg-probe-001" show-password />
        </el-form-item>
        <el-form-item label="组织 ID">
          <el-input-number v-model="connectForm.org_id" :min="1" />
        </el-form-item>
        <el-form-item label="批量行数">
          <el-input-number v-model="connectForm.batch_rows" :min="10" :max="10000" :step="100" />
        </el-form-item>
        <el-form-item label="刷新间隔(秒)">
          <el-input-number v-model="connectForm.flush_interval_s" :min="1" :max="300" />
        </el-form-item>
        <el-form-item label="心跳间隔(秒)">
          <el-input-number v-model="connectForm.heartbeat_interval_s" :min="5" :max="600" />
        </el-form-item>
        <el-form-item label="Gzip 压缩">
          <el-switch v-model="connectForm.gzip" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showConnectDialog = false">取消</el-button>
        <el-button type="primary" :loading="connecting" @click="handleConnect">连接</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Link, Delete } from '@element-plus/icons-vue'
import { CircleCheckFilled, CircleCloseFilled } from '@element-plus/icons-vue'
import { api } from '@/api/client'
import type { UplinkStatus, UplinkConnectRequest, TableStat } from '@/api/types'

const status = ref<UplinkStatus | null>(null)
const showConnectDialog = ref(false)
const connecting = ref(false)
const disconnecting = ref(false)
const nowTick = ref(Date.now())

const connectForm = ref<UplinkConnectRequest>({
  server_url: 'http://server-1.deepshields.com:30417',
  api_key: '',
  org_id: 1,
  batch_rows: 500,
  flush_interval_s: 5,
  heartbeat_interval_s: 30,
  gzip: true,
})

let pollTimer: number | null = null

const fetchStatus = async () => {
  try {
    status.value = await api.uplinkStatus()
  } catch (e) {
    console.error('uplink status failed', e)
  }
}

const handleConnect = async () => {
  if (!connectForm.value.server_url || !connectForm.value.api_key) {
    ElMessage.warning('请填写 Server URL 和 API Key')
    return
  }
  connecting.value = true
  try {
    await api.uplinkConnect(connectForm.value)
    ElMessage.success('已连接到 DeepShield Server')
    showConnectDialog.value = false
    await fetchStatus()
  } catch (e: any) {
    ElMessage.error('连接失败: ' + (e?.message ?? String(e)))
  } finally {
    connecting.value = false
  }
}

const handleDisconnect = async () => {
  disconnecting.value = true
  try {
    await api.uplinkDisconnect()
    ElMessage.success('已断开连接')
    await fetchStatus()
  } catch (e: any) {
    ElMessage.error('断开失败: ' + (e?.message ?? String(e)))
  } finally {
    disconnecting.value = false
  }
}

const heartbeatLabel = computed(() => {
  if (!status.value?.last_heartbeat) return '—'
  const ts = new Date(status.value.last_heartbeat).getTime()
  const age = Math.max(0, Math.round((nowTick.value - ts) / 1000))
  if (age < 1) return '刚刚'
  if (age < 60) return `${age} 秒前`
  return `${Math.floor(age / 60)} 分钟前`
})

const totalRowsPushed = computed(() =>
  status.value?.table_stats?.reduce((s, t) => s + t.rows_pushed, 0) || 0
)
const totalRowsSent = computed(() =>
  status.value?.table_stats?.reduce((s, t) => s + t.rows_sent, 0) || 0
)
const totalRowsFailed = computed(() =>
  status.value?.table_stats?.reduce((s, t) => s + t.rows_failed, 0) || 0
)
const totalPending = computed(() =>
  status.value?.table_stats?.reduce((s, t) => s + t.pending, 0) || 0
)

function formatNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return String(n)
}

function formatBytes(n: number): string {
  if (n >= 1_073_741_824) return (n / 1_073_741_824).toFixed(2) + ' GiB'
  if (n >= 1_048_576) return (n / 1_048_576).toFixed(1) + ' MiB'
  if (n >= 1024) return (n / 1024).toFixed(1) + ' KiB'
  return n + ' B'
}

function formatTime(ts: string): string {
  const d = new Date(ts)
  const age = Math.max(0, Math.round((nowTick.value - d.getTime()) / 1000))
  if (age < 60) return `${age}秒前`
  if (age < 3600) return `${Math.floor(age / 60)}分钟前`
  return d.toLocaleTimeString('zh-CN')
}

function numFmt(_row: any, _col: any, val: number) {
  return formatNum(val)
}
function bytesFmt(_row: any, _col: any, val: number) {
  return formatBytes(val)
}

onMounted(() => {
  fetchStatus()
  pollTimer = window.setInterval(fetchStatus, 3000)
  const tick = window.setInterval(() => (nowTick.value = Date.now()), 1000)
  // store tick for cleanup
  pollTimer = pollTimer! // keep poll
  window._uplinkTick = tick
})

onBeforeUnmount(() => {
  if (pollTimer) window.clearInterval(pollTimer)
  if (window._uplinkTick) window.clearInterval(window._uplinkTick)
})
</script>

<script lang="ts">
// Global tick cleanup hack (avoid TS error for window property)
declare global {
  interface Window {
    _uplinkTick?: number
  }
}
export default {}
</script>

<style scoped>
.status-banner {
  margin-bottom: 16px;
  border: none;
}
.status-banner.connected {
  border-left: 4px solid var(--sg-success, #52c41a);
}
.status-banner.disconnected {
  border-left: 4px solid var(--sg-danger, #ff4d4f);
}
.banner-inner {
  display: flex;
  align-items: center;
  gap: 16px;
}
.banner-text {
  flex: 1;
}
.banner-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--sg-text, #303133);
}
.banner-sub {
  font-size: 13px;
  color: var(--sg-text-muted, #909399);
  margin-top: 4px;
}
.banner-actions {
  display: flex;
  gap: 8px;
}

.kpi-row {
  margin-bottom: 16px;
}
.kpi-card {
  text-align: center;
  padding: 8px 0;
}
.kpi-label {
  font-size: 12px;
  color: var(--sg-text-muted, #909399);
}
.kpi-value {
  font-size: 28px;
  font-weight: 700;
  margin-top: 4px;
}
.kpi-value-sm {
  font-size: 16px;
  font-weight: 600;
  margin-top: 8px;
}
.kpi-error {
  font-size: 11px;
  color: var(--sg-danger, #ff4d4f);
  margin-top: 4px;
  word-break: break-all;
}
.text-danger {
  color: var(--sg-danger, #ff4d4f);
}
.text-success {
  color: var(--sg-success, #52c41a);
}
.text-warning {
  color: #faad14;
}
.text-muted {
  color: var(--sg-text-muted, #909399);
}
.mono {
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
}
.xs {
  font-size: 11px;
}

.detail-card {
  margin-bottom: 16px;
}
.server-link {
  color: var(--sg-brand, #409eff);
  text-decoration: none;
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
}
.server-link:hover {
  text-decoration: underline;
}
</style>
