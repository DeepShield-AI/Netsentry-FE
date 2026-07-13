<template>
  <div class="page">
    <!-- ── KPI cards ───────────────────────────────────────────────── -->
    <el-row :gutter="14" class="kpi-row">
      <el-col :xs="12" :md="6">
        <StatCard
          label="Emitted"
          :value="formatNumber(stats?.alerts_emitted ?? 0)"
          sub="passed limiter, written to alert_logs"
          tone="#ef4444"
        />
      </el-col>
      <el-col :xs="12" :md="6">
        <StatCard
          label="Suppressed"
          :value="formatNumber(stats?.alerts_suppressed ?? 0)"
          :sub="ratioLabel"
          tone="#94a3b8"
        />
      </el-col>
      <el-col :xs="12" :md="6">
        <StatCard
          label="Live entries"
          :value="formatNumber(limiter?.live ?? 0)"
          sub="(flow, rule) pairs in suppression window"
        />
      </el-col>
      <el-col :xs="12" :md="6">
        <StatCard
          label="Swept"
          :value="formatNumber(limiter?.swept ?? 0)"
          sub="expired entries garbage-collected"
        />
      </el-col>
    </el-row>

    <!-- ── 数据源切换：实时 (进程内环) / 历史 (ClickHouse) ─────────── -->
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
          value-format="YYYY-MM-DDTHH:mm:ss.SSSZ"
          @change="onRangeChange"
        />
        <el-tag size="small" type="success" effect="light">历史（已持久化）</el-tag>
      </template>
      <el-tag v-else-if="!chDisabled" size="small" type="info" effect="light">实时（启动以来）</el-tag>
      <span v-if="chDisabled" class="muted small">未配置 ClickHouse — 仅有实时进程内环可用</span>
    </div>

    <!-- ── recent alerts table ─────────────────────────────────────── -->
    <el-card shadow="never">
      <template #header>
        <div class="hdr">
          <span>{{ mode === 'history' ? '历史告警' : 'Recent alerts' }}</span>
          <div class="hdr-right">
            <el-input
              v-model="search"
              size="small"
              placeholder="按规则 / IP / 域名 / 详情过滤…"
              clearable
              style="width: 220px"
              :prefix-icon="Search"
              @change="onSearchChange"
            />
            <el-select v-model="severityFilter" size="small" style="width: 130px" @change="onSeverityChange">
              <el-option label="All severities" value="" />
              <el-option label="Critical" value="critical" />
              <el-option label="Error" value="error" />
              <el-option label="Warning" value="warning" />
              <el-option label="Info" value="info" />
            </el-select>
            <el-button size="small" :icon="Refresh" :loading="loading" @click="load">
              Reload
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        :data="filtered"
        v-loading="loading"
        stripe
        size="small"
        empty-text="No alerts yet — risks accumulate as flows are classified."
      >
        <el-table-column prop="timestamp" label="Time" width="180">
          <template #default="{ row }">{{ formatTime(row.timestamp) }}</template>
        </el-table-column>
        <el-table-column label="Severity" width="110">
          <template #default="{ row }">
            <el-tag :type="severityTone(row.alert_level)" size="small">
              {{ row.alert_level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Rule" min-width="280">
          <template #default="{ row }">
            <span class="mono small">{{ row.rule_name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Source" min-width="170">
          <template #default="{ row }">
            <span class="mono small">{{ prettyIP(row.five_tuple.src_ip) }}:{{ row.five_tuple.src_port }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Destination" min-width="170">
          <template #default="{ row }">
            <span class="mono small">{{ prettyIP(row.five_tuple.dst_ip) }}:{{ row.five_tuple.dst_port }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Proto" width="80" prop="five_tuple.protocol">
          <template #default="{ row }">{{ row.five_tuple.protocol }}</template>
        </el-table-column>
        <el-table-column label="Details" min-width="240">
          <template #default="{ row }">
            <span class="muted small">{{ ellipsis(row.details, 80) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" align="center">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click.stop="openCausal(row)">因果链</el-button>
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

      <div class="footer-note muted small">
        <template v-if="mode === 'history'">
          正在浏览 <code>netsentry.alert_logs</code> 历史告警（跨重启保留 180 天）。
        </template>
        <template v-else>
          显示进程内环（启动以来最近 500 条）。切换到“历史”可查询 <code>netsentry.alert_logs</code> 全量记录。
        </template>
      </div>
    </el-card>

    <!-- Causal chain drawer -->
    <CausalChainDrawer v-model="causalOpen" :alert="causalAlert" />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Refresh, Search } from '@element-plus/icons-vue'
import { api } from '@/api/client'
import type { Alert, HistoryQuery } from '@/api/types'
import StatCard from '@/components/StatCard.vue'
import CausalChainDrawer from '@/components/CausalChainDrawer.vue'
import { useProbeStore } from '@/stores/probe'
import { ellipsis, formatNumber, formatTime, prettyIP } from '@/utils/format'

const store = useProbeStore()
const stats = computed(() => store.stats)
const limiter = computed(() => store.alertLimiter)

const ratioLabel = computed(() => {
  const a = stats.value?.alerts_emitted ?? 0
  const s = stats.value?.alerts_suppressed ?? 0
  const total = a + s
  if (total === 0) return '—'
  const pct = ((s / total) * 100).toFixed(1)
  return `${pct}% of attempts`
})

// ── alerts table ──────────────────────────────────────────────────────
type Mode = 'live' | 'history'
const rows = ref<Alert[]>([])
const loading = ref(false)
const severityFilter = ref<string>('')
const search = ref('')

// ── 数据源模式：live = 进程内环（启动以来）；history = ClickHouse（跨重启）──
const mode = ref<Mode>('live')
const chDisabled = ref(false)
const range = ref<[string, string] | null>(null)
const page = ref(1)
const pageSize = ref(100)
const historyTotal = ref(0)

const rangeShortcuts = [
  { text: '最近 1 小时', value: () => rangeFromMin(60) },
  { text: '最近 24 小时', value: () => rangeFromMin(60 * 24) },
  { text: '最近 7 天', value: () => rangeFromMin(60 * 24 * 7) },
  { text: '最近 30 天', value: () => rangeFromMin(60 * 24 * 30) },
]
function rangeFromMin(min: number): [Date, Date] {
  const end = new Date()
  const start = new Date(end.getTime() - min * 60 * 1000)
  return [start, end]
}

async function load() {
  loading.value = true
  try {
    if (mode.value === 'history') {
      const params: HistoryQuery = {
        since: range.value?.[0],
        until: range.value?.[1],
        q: search.value.trim() || undefined,
        level: severityFilter.value || undefined,
        limit: pageSize.value,
        offset: (page.value - 1) * pageSize.value,
      }
      const env = await api.historyAlerts(params)
      if (env.disabled) {
        chDisabled.value = true
        mode.value = 'live'
        return load()
      }
      rows.value = env.items
      historyTotal.value = env.total
    } else {
      // Newest first.
      const items = await api.recentAlerts(500)
      rows.value = items.slice().reverse()
      historyTotal.value = 0
    }
  } catch (err) {
    console.warn('alerts fetch failed', err)
    rows.value = []
  } finally {
    loading.value = false
  }
}

function onModeChange() {
  page.value = 1
  if (mode.value === 'history' && !range.value) {
    const [s, e] = rangeFromMin(60 * 24)
    range.value = [s.toISOString(), e.toISOString()]
  }
  void load()
}
function onRangeChange() {
  page.value = 1
  void load()
}
function onSeverityChange() {
  // In history mode severity is a server-side filter → reload from page 1.
  if (mode.value === 'history') {
    page.value = 1
    void load()
  }
}
function onSearchChange() {
  if (mode.value === 'history') {
    page.value = 1
    void load()
  }
}
function onPageChange(p: number) {
  page.value = p
  void load()
}
function onPageSizeChange(s: number) {
  pageSize.value = s
  page.value = 1
  void load()
}

// In live mode, severity filtering is client-side; in history mode the
// server already applied it so we just return the rows as-is.
const filtered = computed(() => {
  if (mode.value === 'history') return rows.value
  if (!severityFilter.value) return rows.value
  return rows.value.filter((a) => a.alert_level === severityFilter.value)
})

function severityTone(
  level: string,
): 'success' | 'info' | 'warning' | 'danger' {
  switch (level) {
    case 'critical':
    case 'error':
      return 'danger'
    case 'warning':
      return 'warning'
    case 'info':
      return 'info'
    default:
      return 'success'
  }
}

let timer: number | null = null
// Auto-refresh only in live mode; history is paged and a periodic re-query
// would fight the user's pagination + re-hit ClickHouse.
function startTimer() {
  if (timer != null) window.clearInterval(timer)
  if (mode.value === 'live') {
    timer = window.setInterval(() => void load(), 5000)
  }
}
onMounted(() => {
  void load()
  startTimer()
})
onBeforeUnmount(() => {
  if (timer != null) window.clearInterval(timer)
})
watch(mode, startTimer)

// ── Causal chain drawer ───────────────────────────────────────────────
const causalOpen = ref(false)
const causalAlert = ref<Alert | null>(null)
function openCausal(row: Alert) {
  causalAlert.value = row
  causalOpen.value = true
}
</script>

<style scoped>
.kpi-row {
  margin-bottom: 14px;
}
.mode-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.pager {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}
.muted {
  color: var(--el-text-color-secondary);
}
.hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
}
.hdr-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.small {
  font-size: 12px;
}
.footer-note {
  margin-top: 10px;
}
.footer-note code {
  background: var(--el-fill-color-light);
  border-radius: 3px;
  padding: 1px 5px;
  font-size: 12px;
}
</style>
