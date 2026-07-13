<template>
  <div class="page">
    <!-- ─ 数据源切换：实时 (进程内 LRU) / 历史 (ClickHouse) ─ -->
    <div class="mode-bar">
      <el-radio-group v-model="mode" size="small" @change="onModeChange">
        <el-radio-button value="live">实时</el-radio-button>
        <el-radio-button value="history" :disabled="chDisabled">历史（ClickHouse）</el-radio-button>
      </el-radio-group>
      <template v-if="mode === 'history' && !chDisabled">
        <el-date-picker
          v-model="range"
          type="datetimerange"
          size="small"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          :shortcuts="rangeShortcuts"
          value-format="YYYY-MM-DDTHH:mm:ssZ"
          @change="onRangeChange"
          style="width: 380px"
        />
        <el-button size="small" :icon="Refresh" :loading="loading" @click="loadActive">查询</el-button>
      </template>
      <span v-if="chDisabled" class="muted small">未配置 ClickHouse — 仅有实时进程内环可用</span>
    </div>

    <el-tabs v-model="active" class="tx-tabs" @tab-change="onTabChange">
      <el-tab-pane :label="`DNS 事务 (${counts.dns})`" name="dns" />
      <el-tab-pane :label="`HTTP 事务 (${counts.http})`" name="http" />
    </el-tabs>

    <!-- summary row -->
    <el-row :gutter="10" class="cards">
      <el-col :xs="12" :md="6">
        <div class="stat-card" :class="{ active: statusFilter === 'paired' }" @click="toggleStatus('paired')">
          <el-statistic :value="paired" title="成功配对" :value-style="{ color: '#16a34a' }" />
        </div>
      </el-col>
      <el-col :xs="12" :md="6">
        <div class="stat-card" :class="{ active: statusFilter === 'timeout' }" @click="toggleStatus('timeout')">
          <el-statistic :value="timeouts" title="超时未配对" :value-style="{ color: '#f59e0b' }" />
        </div>
      </el-col>
      <el-col :xs="12" :md="6">
        <el-statistic v-if="pairedCount > 0" :value="p50" title="p50 延迟 (ms)" :precision="2" />
        <el-statistic v-else value="—" title="p50 延迟 (ms)" />
      </el-col>
      <el-col :xs="12" :md="6">
        <el-statistic v-if="pairedCount > 0" :value="p95" title="p95 延迟 (ms)" :precision="2" />
        <el-statistic v-else value="—" title="p95 延迟 (ms)" />
      </el-col>
    </el-row>

    <!-- toolbar -->
    <div class="toolbar">
      <el-input
        v-model="filter"
        size="small"
        :placeholder="active === 'dns' ? '按域名 / IP / Rcode 过滤…' : '按 Host / Path / 状态码 / IP 过滤…'"
        clearable
        :prefix-icon="Search"
        style="width: 320px"
      />
      <el-button size="small" :icon="Refresh" :loading="loading" @click="loadActive">重载</el-button>
      <span class="muted small">
        显示 {{ visibleRows.length }} / 共 {{ rowCount }} 条
        <template v-if="mode === 'history'"> · 服务端匹配 {{ historyTotal.toLocaleString() }} 行</template>
        · 点击行查看详情
        <template v-if="mode === 'live'"> · 每 3 秒自动刷新</template>
      </span>
    </div>

    <!-- DNS transactions -->
    <el-table
      v-if="active === 'dns'"
      :data="visibleRows"
      v-loading="loading"
      stripe
      size="small"
      class="tx-table"
      highlight-current-row
      empty-text="暂无 DNS 事务 — 需要同时抓到查询与应答两个数据包才能配对"
      @row-click="openDNS"
    >
      <el-table-column label="#" type="index" width="60" align="right" />
      <el-table-column prop="query_ts" label="时间" width="160">
        <template #default="{ row }">{{ formatTime(row.query_ts) }}</template>
      </el-table-column>
      <el-table-column label="延迟" width="100" align="right">
        <template #default="{ row }">
          <el-tag v-if="row.timeout" type="warning" size="small">超时</el-tag>
          <span v-else-if="row.latency_ms" class="mono small" :class="latencyClass(row.latency_ms)">
            {{ row.latency_ms.toFixed(2) }} ms
          </span>
          <span v-else class="muted small">—</span>
        </template>
      </el-table-column>
      <el-table-column label="域名" min-width="240">
        <template #default="{ row }">
          <span class="mono">{{ ellipsis(row.domain, 60) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类型" width="70">
        <template #default="{ row }">
          <el-tag size="small" effect="plain">{{ row.query_type }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="应答码" width="110">
        <template #default="{ row }">
          <el-tag v-if="row.rcode_text" size="small" :type="rcodeTone(row.rcode)">
            {{ row.rcode_text }}
          </el-tag>
          <span v-else class="muted small">—</span>
        </template>
      </el-table-column>
      <el-table-column label="应答 IP" min-width="200">
        <template #default="{ row }">
          <span v-if="!row.response_ips || row.response_ips.length === 0" class="muted small">—</span>
          <span v-else-if="row.response_ips.length === 1" class="mono small">
            {{ prettyIP(row.response_ips[0]) }}
          </span>
          <el-tooltip v-else :content="row.response_ips.join(', ')" placement="top">
            <span class="mono small">
              {{ prettyIP(row.response_ips[0]) }}
              <span class="muted">+{{ row.response_ips.length - 1 }}</span>
            </span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="DNS 服务器" min-width="160">
        <template #default="{ row }">
          <span class="mono small">{{ prettyIP(row.server_ip) }}:{{ row.server_port }}</span>
        </template>
      </el-table-column>
      <el-table-column label="客户端" min-width="140">
        <template #default="{ row }">
          <span class="mono small">{{ prettyIP(row.client_ip) }}</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- HTTP transactions -->
    <el-table
      v-else
      :data="visibleRows"
      v-loading="loading"
      stripe
      size="small"
      class="tx-table"
      highlight-current-row
      empty-text="暂无 HTTP 事务 — 只处理明文 HTTP/1.x，需要同时抓到请求与应答"
      @row-click="openHTTP"
    >
      <el-table-column label="#" type="index" width="60" align="right" />
      <el-table-column prop="request_ts" label="时间" width="160">
        <template #default="{ row }">{{ formatTime(row.request_ts) }}</template>
      </el-table-column>
      <el-table-column label="延迟" width="100" align="right">
        <template #default="{ row }">
          <el-tag v-if="row.timeout" type="warning" size="small">超时</el-tag>
          <span v-else-if="row.latency_ms" class="mono small" :class="latencyClass(row.latency_ms)">
            {{ row.latency_ms.toFixed(1) }} ms
          </span>
          <span v-else class="muted small">—</span>
        </template>
      </el-table-column>
      <el-table-column label="方法" width="80">
        <template #default="{ row }">
          <el-tag v-if="row.method" size="small" :type="methodTone(row.method)">
            {{ row.method }}
          </el-tag>
          <span v-else class="muted small">—</span>
        </template>
      </el-table-column>
      <el-table-column label="状态码" width="80">
        <template #default="{ row }">
          <el-tag v-if="row.status_code" size="small" :type="statusTone(row.status_code)">
            {{ row.status_code }}
          </el-tag>
          <span v-else class="muted small">—</span>
        </template>
      </el-table-column>
      <el-table-column label="主机" min-width="180">
        <template #default="{ row }">{{ ellipsis(row.host, 36) }}</template>
      </el-table-column>
      <el-table-column label="路径" min-width="280">
        <template #default="{ row }">
          <el-tooltip v-if="row.path && row.path.length > 60" :content="row.path" placement="top">
            <span class="mono small">{{ ellipsis(row.path, 60) }}</span>
          </el-tooltip>
          <span v-else class="mono small">{{ row.path || '—' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="应答类型" min-width="140">
        <template #default="{ row }">
          <span class="mono small">{{ ellipsis(row.response_content_type, 28) || '—' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="字节数" width="120" align="right">
        <template #default="{ row }">
          <span class="mono small">
            {{ formatNumber(row.request_size || 0) }} ↑ /
            {{ formatNumber(row.response_size || 0) }} ↓
          </span>
        </template>
      </el-table-column>
      <el-table-column label="服务器" min-width="160">
        <template #default="{ row }">
          <span class="mono small">{{ prettyIP(row.server_ip) }}:{{ row.server_port }}</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- ─ 历史模式下的服务端分页 ─ -->
    <div v-if="mode === 'history'" class="pager">
      <el-pagination
        size="small"
        layout="total, sizes, prev, pager, next, jumper"
        :total="historyTotal"
        :page-sizes="[50, 100, 200, 500]"
        :page-size="pageSize"
        :current-page="page"
        @size-change="onPageSizeChange"
        @current-change="onPageChange"
      />
    </div>

    <TransactionDetail v-model="detailOpen" :dns="selectedDNS" :http="selectedHTTP" />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Refresh, Search } from '@element-plus/icons-vue'
import { api } from '@/api/client'
import type { DNSTransaction, HTTPTransaction } from '@/api/types'
import { ellipsis, formatNumber, formatTime, prettyIP } from '@/utils/format'
import TransactionDetail from '@/components/TransactionDetail.vue'

const props = withDefaults(defineProps<{ initialTab?: 'dns' | 'http' }>(), { initialTab: 'dns' })

type Kind = 'dns' | 'http'
type Mode = 'live' | 'history'
const active = ref<Kind>(props.initialTab)
const mode = ref<Mode>('live')
const dnsRows = ref<DNSTransaction[]>([])
const httpRows = ref<HTTPTransaction[]>([])
const loading = ref(false)
const filter = ref('')
const statusFilter = ref<'all' | 'paired' | 'timeout'>('paired')
const counts = ref({ dns: 0, http: 0 })
const chDisabled = ref(false)

// 历史查询参数
const range = ref<[string, string] | null>(null)
const page = ref(1)
const pageSize = ref(100)
const historyTotal = ref(0)

const rangeShortcuts = [
  { text: '最近 5 分钟', value: () => rangeFromMin(5) },
  { text: '最近 30 分钟', value: () => rangeFromMin(30) },
  { text: '最近 1 小时', value: () => rangeFromMin(60) },
  { text: '最近 24 小时', value: () => rangeFromMin(60 * 24) },
  { text: '最近 7 天', value: () => rangeFromMin(60 * 24 * 7) },
]
function rangeFromMin(min: number): [Date, Date] {
  const end = new Date()
  const start = new Date(end.getTime() - min * 60 * 1000)
  return [start, end]
}

async function loadActive() {
  loading.value = true
  try {
    if (mode.value === 'live') {
      if (active.value === 'dns') {
        const items = await api.recentDNSTransactions(400)
        dnsRows.value = items.slice().reverse()
        counts.value.dns = items.length
      } else {
        const items = await api.recentHTTPTransactions(400)
        httpRows.value = items.slice().reverse()
        counts.value.http = items.length
      }
      historyTotal.value = 0
    } else {
      // history mode
      const params = {
        since: range.value?.[0],
        until: range.value?.[1],
        q: filter.value.trim() || undefined,
        limit: pageSize.value,
        offset: (page.value - 1) * pageSize.value,
      }
      if (active.value === 'dns') {
        const env = await api.historyDNSTransactions(params)
        if (env.disabled) {
          chDisabled.value = true
          mode.value = 'live'
          return loadActive()
        }
        dnsRows.value = env.items
        counts.value.dns = env.items.length
        historyTotal.value = env.total
      } else {
        const env = await api.historyHTTPTransactions(params)
        if (env.disabled) {
          chDisabled.value = true
          mode.value = 'live'
          return loadActive()
        }
        httpRows.value = env.items
        counts.value.http = env.items.length
        historyTotal.value = env.total
      }
    }
  } catch (err) {
    console.warn('transactions fetch failed', err)
  } finally {
    loading.value = false
  }
}

function onTabChange() {
  filter.value = ''
  page.value = 1
  void loadActive()
}
function onModeChange() {
  page.value = 1
  filter.value = ''
  if (mode.value === 'history' && !range.value) {
    const [s, e] = rangeFromMin(60)
    range.value = [s.toISOString(), e.toISOString()]
  }
  void loadActive()
}
function onRangeChange() {
  page.value = 1
  void loadActive()
}
function onPageChange(p: number) {
  page.value = p
  void loadActive()
}
function onPageSizeChange(s: number) {
  pageSize.value = s
  page.value = 1
  void loadActive()
}

const rows = computed(() => (active.value === 'dns' ? dnsRows.value : httpRows.value))
const rowCount = computed(() => rows.value.length)

const filteredRows = computed(() => {
  const f = filter.value.trim().toLowerCase()
  if (!f) return rows.value
  if (active.value === 'dns') {
    return dnsRows.value.filter((t) =>
      [t.domain, t.query_type, t.rcode_text, t.client_ip, t.server_ip, ...(t.response_ips ?? [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(f),
    )
  }
  return httpRows.value.filter((t) =>
    [t.host, t.path, t.method, String(t.status_code ?? ''), t.client_ip, t.server_ip, t.user_agent]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(f),
  )
})

const visibleRows = computed(() => {
  const base = filteredRows.value as Array<{ timeout?: boolean }>
  if (statusFilter.value === 'paired') return base.filter((r) => !r.timeout)
  if (statusFilter.value === 'timeout') return base.filter((r) => r.timeout)
  return base
})

// ── statistics ────────────────────────────────────────────────────────
const pairedRows = computed(() =>
  (rows.value as Array<{ timeout?: boolean; latency_ms?: number }>).filter(
    (r) => !r.timeout,
  ),
)
const paired = computed(() => pairedRows.value.length)
const timeouts = computed(
  () => (rows.value as Array<{ timeout?: boolean }>).filter((r) => r.timeout).length,
)
const pairedCount = computed(() =>
  pairedRows.value.filter((r) => (r.latency_ms ?? 0) > 0).length,
)

function toggleStatus(s: 'paired' | 'timeout') {
  statusFilter.value = statusFilter.value === s ? 'all' : s
}
const sortedLatencies = computed(() =>
  pairedRows.value.map((r) => r.latency_ms ?? 0).sort((a, b) => a - b),
)
const p50 = computed(() => {
  const a = sortedLatencies.value
  return a.length ? a[Math.floor(a.length / 2)] : 0
})
const p95 = computed(() => {
  const a = sortedLatencies.value
  return a.length ? a[Math.min(Math.floor(a.length * 0.95), a.length - 1)] : 0
})

// ── tone helpers ──────────────────────────────────────────────────────
function latencyClass(ms: number): string {
  if (ms < 5) return 'lat-fast'
  if (ms < 50) return 'lat-ok'
  if (ms < 500) return 'lat-slow'
  return 'lat-bad'
}
function rcodeTone(code: number | undefined): 'success' | 'warning' | 'danger' | 'info' {
  if (code === 0 || code === undefined) return 'success'
  if (code === 3) return 'warning' // NXDOMAIN
  if (code === 2 || code === 5) return 'danger' // SERVFAIL/REFUSED
  return 'info'
}
function statusTone(code: number): 'success' | 'warning' | 'danger' | 'info' {
  if (code < 300) return 'success'
  if (code < 400) return 'info'
  if (code < 500) return 'warning'
  return 'danger'
}
function methodTone(m: string): 'success' | 'warning' | 'danger' | 'info' {
  switch (m) {
    case 'GET':
    case 'HEAD':
      return 'info'
    case 'POST':
    case 'PUT':
    case 'PATCH':
      return 'warning'
    case 'DELETE':
      return 'danger'
    default:
      return 'success'
  }
}

// ── detail drawer ────────────────────────────────────────────────────
const detailOpen = ref(false)
const selectedDNS = ref<DNSTransaction | null>(null)
const selectedHTTP = ref<HTTPTransaction | null>(null)

function openDNS(row: DNSTransaction) {
  selectedDNS.value = row
  selectedHTTP.value = null
  detailOpen.value = true
}
function openHTTP(row: HTTPTransaction) {
  selectedHTTP.value = row
  selectedDNS.value = null
  detailOpen.value = true
}

let timer: number | null = null
function startTimer() {
  if (timer != null) window.clearInterval(timer)
  // 只在实时模式自动轮询；历史模式需要手动查询以免重复重查货库。
  if (mode.value === 'live') {
    timer = window.setInterval(() => void loadActive(), 3000)
  }
}
onMounted(() => {
  void loadActive()
  startTimer()
})
onBeforeUnmount(() => {
  if (timer != null) window.clearInterval(timer)
})
// 模式切换时调整轮询
watch(mode, startTimer)
</script>

<style scoped>
.mode-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}
.pager {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}
.tx-tabs {
  margin-bottom: 8px;
}
.cards {
  margin-bottom: 12px;
}
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}
.tx-table {
  background: #fff;
  border-radius: var(--sg-card-radius);
}
.small {
  font-size: 12px;
}
.lat-fast {
  color: #16a34a;
}
.lat-ok {
  color: #0ea5e9;
}
.lat-slow {
  color: #f59e0b;
}
.lat-bad {
  color: #dc2626;
  font-weight: 600;
}
.stat-card {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  border: 2px solid transparent;
  transition: border-color 0.2s, background 0.2s;
}
.stat-card:hover {
  background: var(--el-fill-color-light);
}
.stat-card.active {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}
</style>
