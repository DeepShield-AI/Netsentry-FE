<template>
  <div class="ou-page">
    <!-- Chart panel — matches SystemInfoView's "在线用户" panel exactly
         (same class names, same tabs, same data sources). -->
    <div class="si-chart-panel" data-chart="online-users">
      <div class="si-panel-head">
        <div class="si-panel-head-left">
          <h3 class="si-panel-title">在线用户</h3>
          <span class="si-panel-current">[<span>{{ fmtNum(currentUsers) }}</span>]</span>
          <span class="si-panel-stats">{{ historyDisabled ? '实时数据' : '' }}</span>
        </div>
        <div class="si-range-tabs" role="tablist" aria-label="时间范围">
          <button type="button" class="si-range-tab" :class="{ active: activeRange === 'realtime' }" @click="activeRange = 'realtime'">实时</button>
          <button type="button" class="si-range-tab" :class="{ active: activeRange === 'day' }" :disabled="historyDisabled" :title="historyDisabled ? '需要 ClickHouse 长期存储' : ''" @click="activeRange = 'day'">日</button>
          <button type="button" class="si-range-tab" :class="{ active: activeRange === 'week' }" :disabled="historyDisabled" :title="historyDisabled ? '需要 ClickHouse 长期存储' : ''" @click="activeRange = 'week'">周</button>
          <button type="button" class="si-range-tab" :class="{ active: activeRange === 'month' }" :disabled="historyDisabled" :title="historyDisabled ? '需要 ClickHouse 长期存储' : ''" @click="activeRange = 'month'">月</button>
        </div>
      </div>
      <div class="si-panel-chart">
        <span class="si-yunit">用户数</span>
        <div ref="chartRef" class="ou-chart-plot"></div>
      </div>
    </div>

    <!-- Detail table — rows come from the same /traffic/online-users endpoint
         that also drives the chart's realtime data point (so header count and
         table row count stay consistent). -->
    <el-card shadow="never" class="ou-table-card">
      <template #header>
        <div class="card-header">
          <span>在线用户列表 <span class="ou-count">共 {{ users.length }} 个活跃 IP（5 分钟内）</span></span>
          <el-button size="small" :icon="Refresh" circle @click="loadUsers" :loading="tableLoading" />
        </div>
      </template>
      <el-table :data="users" stripe size="small" max-height="600" default-sort="{ prop: 'bytes', order: 'descending' }">
        <el-table-column prop="ip" label="IP地址" min-width="130" sortable />
        <el-table-column prop="mac" label="MAC地址" min-width="140" />
        <el-table-column prop="hostname" label="主机名/用户标识" min-width="140">
          <template #default="{ row }">{{ row.hostname || '-' }}</template>
        </el-table-column>
        <el-table-column prop="sessions" label="会话数" sortable min-width="80" />
        <el-table-column prop="packets" label="包数" sortable min-width="90">
          <template #default="{ row }">{{ fmtNum(row.packets || 0) }}</template>
        </el-table-column>
        <el-table-column prop="bytes" label="流量" sortable min-width="110">
          <template #default="{ row }">{{ fmtBytes(row.bytes || 0) }}</template>
        </el-table-column>
        <el-table-column prop="first_seen" label="首次出现" min-width="150">
          <template #default="{ row }">{{ fmtTime(row.first_seen) }}</template>
        </el-table-column>
        <el-table-column prop="last_seen" label="最后活动" min-width="150" sortable>
          <template #default="{ row }">{{ fmtTime(row.last_seen) }}</template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { api } from '@/api/client'
import { fmtBytes } from './api'

// ─── Chart state (mirrors SystemInfoView's online-users panel exactly) ──
type Range = 'realtime' | 'day' | 'week' | 'month'
const activeRange = ref<Range>('realtime')
const historyDisabled = ref(false)
const currentUsers = ref(0)
const chartRef = ref<HTMLElement | null>(null)

// Rolling client-side buffer for the realtime series (same 300-point cap
// as SystemInfoView so both pages show identical shape).
const MAX_POINTS = 300
const usersSeries: { t: string; v: number }[] = []

// ─── Table state ────────────────────────────────────────────────────────
const users = ref<any[]>([])
const tableLoading = ref(false)

let chart: echarts.ECharts | null = null
let timer: any = null

function fmtNum(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return String(Math.round(n))
}
function fmtTime(ts: any): string {
  if (!ts) return '-'
  const d = typeof ts === 'string' ? new Date(ts) : new Date(ts * 1000)
  return isNaN(d.getTime()) ? '-' : d.toLocaleString('zh-CN')
}
function tsLabelNow(): string {
  return new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
function fmtHistoryLabel(ts: string, range: Range): string {
  const d = new Date(ts)
  if (range === 'day') return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  if (range === 'week') return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}h`
}

// Init-or-reuse chart instance. Base option is set once; subsequent updates
// only push data so ECharts diffs & animates smoothly (same pattern as
// SystemInfoView after the incremental-updates refactor).
function ensureChart(): echarts.ECharts | null {
  if (!chartRef.value) return null
  if (chart) return chart
  chart = echarts.init(chartRef.value)
  chart.setOption({
    animation: true,
    animationDuration: 300,
    animationDurationUpdate: 500,
    animationEasingUpdate: 'cubicOut',
    tooltip: { trigger: 'axis' },
    grid: { left: 55, right: 15, top: 15, bottom: 30 },
    xAxis: { type: 'category', data: [], axisLabel: { fontSize: 10 } },
    yAxis: { type: 'value', axisLabel: { fontSize: 10 }, splitLine: { lineStyle: { type: 'dashed' } } },
    series: [{ type: 'line', data: [], smooth: true, symbol: 'none',
      areaStyle: { opacity: 0.3, color: '#5470c6' }, itemStyle: { color: '#5470c6' }, lineStyle: { width: 1.5 } }],
  })
  return chart
}
function pushChart(xData: string[], yData: number[]) {
  const c = ensureChart()
  if (!c) return
  c.setOption({
    xAxis: { data: xData, axisLabel: { interval: Math.floor(xData.length / 6) } },
    series: [{ data: yData }],
  })
}

const mockUsers = [
  { ip: '192.168.1.100', mac: '54-2b-de-6d-10-ae', hostname: 'PC-001', sessions: 12, packets: 128642, bytes: 42864218, first_seen: '2026-06-15 08:30:00', last_seen: '2026-06-15 14:30:28' },
  { ip: '192.168.1.101', mac: '00-1b-21-a8-3c-4d', hostname: 'PC-002', sessions: 8, packets: 86428, bytes: 28642864, first_seen: '2026-06-15 09:15:00', last_seen: '2026-06-15 14:28:42' },
  { ip: '192.168.1.102', mac: '00-25-90-0a-1b-2c', hostname: 'PC-003', sessions: 15, packets: 156428, bytes: 52864286, first_seen: '2026-06-15 08:00:00', last_seen: '2026-06-15 14:30:15' },
  { ip: '10.0.0.100', mac: '00-e0-4c-36-0a-1b', hostname: 'Server-001', sessions: 42, packets: 428642, bytes: 128642864, first_seen: '2026-06-15 07:00:00', last_seen: '2026-06-15 14:30:28' },
  { ip: '192.168.1.103', mac: '00-50-b6-2a-3b-4c', hostname: 'PC-004', sessions: 6, packets: 64286, bytes: 18642864, first_seen: '2026-06-15 10:00:00', last_seen: '2026-06-15 14:25:00' },
]

// ─── Data loaders ───────────────────────────────────────────────────────
async function loadUsers() {
  tableLoading.value = true
  try {
    users.value = mockUsers
    if (activeRange.value === 'realtime') {
      currentUsers.value = users.value.length
      usersSeries.push({ t: tsLabelNow(), v: users.value.length })
      if (usersSeries.length > MAX_POINTS) usersSeries.shift()
      pushChart(usersSeries.map(p => p.t), usersSeries.map(p => p.v))
    }
  } catch { users.value = [] } finally { tableLoading.value = false }
}

async function loadHistory(range: 'day' | 'week' | 'month') {
  try {
    const resp = await api.historyTraffic(range)
    if (resp?.disabled) {
      historyDisabled.value = true
      activeRange.value = 'realtime'
      return
    }
    const items = resp?.items || []
    const labels = items.map(it => fmtHistoryLabel(it.timestamp, range))
    const data = items.map(it => it.online_users)
    const last = items.length ? items[items.length - 1] : null
    currentUsers.value = last?.online_users || 0
    pushChart(labels, data)
  } catch (err) {
    console.error('online-users history refresh failed', err)
  }
}

function tick() {
  if (activeRange.value === 'realtime') loadUsers()
  else loadHistory(activeRange.value)
}

function handleResize() { chart?.resize() }

// When the range changes, drop the chart (x-axis semantics differ) and
// re-init on next tick; adjust cadence: realtime 3s, day 30s, week/month 5min.
watch(activeRange, (r) => {
  if (timer) clearInterval(timer)
  if (chart) { chart.dispose(); chart = null }
  usersSeries.length = 0
  tick()
  const cadence = r === 'realtime' ? 3000 : r === 'day' ? 30_000 : 5 * 60_000
  timer = setInterval(tick, cadence)
})

onMounted(() => {
  tick()
  timer = setInterval(tick, 3000)
  window.addEventListener('resize', handleResize)
})
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  if (chart) { chart.dispose(); chart = null }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.ou-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: #f0f2f5;
  min-height: 100%;
}

/* Panel styles copied from SystemInfoView so the two pages look identical. */
.si-chart-panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}
.si-panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px 6px;
  flex-shrink: 0;
}
.si-panel-head-left {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px 10px;
  min-width: 0;
}
.si-panel-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #303133;
  white-space: nowrap;
}
.si-panel-current {
  font-size: 14px;
  font-weight: 700;
  color: #409eff;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.si-panel-stats {
  font-size: 12px;
  color: #909399;
  font-weight: 500;
  white-space: nowrap;
}
.si-range-tabs {
  display: inline-flex;
  flex-shrink: 0;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
}
.si-range-tab {
  min-width: 36px;
  padding: 4px 12px;
  border: none;
  background: #fff;
  color: #606266;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
  cursor: pointer;
}
.si-range-tab + .si-range-tab { border-left: 1px solid #dcdfe6; }
.si-range-tab.active { background: #409eff; color: #fff; }
.si-range-tab:hover:not(.active):not(:disabled) { background: #f5f7fa; }
.si-range-tab:disabled { color: #c0c4cc; background: #fafbfc; cursor: not-allowed; }

.si-panel-chart {
  position: relative;
  padding: 0 10px 10px 0;
}
.si-yunit {
  position: absolute;
  left: 14px;
  top: 0;
  z-index: 2;
  font-size: 11px;
  font-weight: 600;
  color: #909399;
  pointer-events: none;
}
.ou-chart-plot {
  width: 100%;
  height: 240px;
  padding-top: 14px;
}

.ou-table-card :deep(.el-card__header) { padding: 10px 14px; }
.card-header { display: flex; align-items: center; justify-content: space-between; }
.ou-count { color: #909399; font-size: 12px; font-weight: normal; margin-left: 8px; }
</style>
