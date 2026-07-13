<template>
  <div class="page">
    <el-row :gutter="14" class="kpi-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="never" class="health-badge" :class="statusClass">
          <div class="badge-inner">
            <el-icon :size="32"><CircleCheckFilled v-if="data?.status === 'ok'" /><WarningFilled v-else-if="data?.status === 'degraded'" /><CircleCloseFilled v-else /></el-icon>
            <div>
              <div class="badge-label">数据库状态</div>
              <div class="badge-value">{{ statusLabel }}</div>
              <div v-if="data?.reasons?.length" class="badge-reasons">
                <span v-for="r in data.reasons" :key="r" class="reason-tag">{{ r }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <StatCard label="延迟" :value="latencyText" :sub="versionText" tone="#3b82f6" />
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <StatCard label="运行时间" :value="uptimeText" sub="ClickHouse 服务" tone="#06b6d4" />
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <StatCard label="总数据量" :value="totalRowsText" :sub="totalBytesText" tone="#22c55e" />
      </el-col>
    </el-row>

    <el-row :gutter="14" class="body-row">
      <el-col :span="24">
        <el-card shadow="never">
          <template #header><span class="card-title">各表存储统计</span></template>
          <el-table v-if="data?.tables?.length" :data="data.tables" size="small" stripe>
            <el-table-column prop="table" label="表名" width="220" />
            <el-table-column prop="rows" label="行数" width="140">
              <template #default="{ row }">{{ row.rows?.toLocaleString() }}</template>
            </el-table-column>
            <el-table-column prop="bytes_str" label="占用空间" width="140" />
            <el-table-column prop="parts" label="分区数" width="100" />
            <el-table-column label="占比">
              <template #default="{ row }">
                <el-progress
                  :percentage="data.total_bytes > 0 ? Math.round(row.bytes / data.total_bytes * 100) : 0"
                  :stroke-width="12"
                  :text-inside="true"
                />
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-else description="无表信息" :image-size="60" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { api } from '@/api/client'
import StatCard from '@/components/StatCard.vue'

const data = ref<any>(null)
let timer: number | null = null

const statusClass = computed(() => ({
  'badge-ok': data.value?.status === 'ok',
  'badge-degraded': data.value?.status === 'degraded',
  'badge-critical': data.value?.status === 'unreachable' || !data.value,
}))
const statusLabel = computed(() => {
  const m: Record<string, string> = { ok: '正常', degraded: '降级', unreachable: '不可达' }
  return m[data.value?.status] ?? '未知'
})
const latencyText = computed(() => data.value?.latency ?? '—')
const versionText = computed(() => data.value?.version ? `v${data.value.version}` : '—')
const uptimeText = computed(() => {
  const s = data.value?.uptime ?? 0
  if (!s) return '—'
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  if (d > 0) return `${d}天${h}时`
  const m = Math.floor((s % 3600) / 60)
  return `${h}时${m}分`
})
const totalRowsText = computed(() => {
  const r = data.value?.total_rows ?? 0
  return r > 0 ? r.toLocaleString() + ' 行' : '—'
})
const totalBytesText = computed(() => {
  const b = data.value?.total_bytes ?? 0
  if (!b) return '—'
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  if (b < 1024 * 1024 * 1024) return `${(b / 1024 / 1024).toFixed(1)} MB`
  return `${(b / 1024 / 1024 / 1024).toFixed(2)} GB`
})

async function fetchData() {
  try { data.value = await api.opsDatabase() } catch { /* ignore */ }
}

onMounted(() => {
  fetchData()
  timer = window.setInterval(fetchData, 10000)
})
onBeforeUnmount(() => { if (timer != null) window.clearInterval(timer) })
</script>

<style scoped>
.kpi-row { margin-bottom: 14px; }
.body-row { margin-bottom: 14px; }
.card-title { font-weight: 600; }

.health-badge { border-left: 4px solid #ddd; }
.health-badge.badge-ok { border-left-color: #22c55e; }
.health-badge.badge-degraded { border-left-color: #f59e0b; }
.health-badge.badge-critical { border-left-color: #ef4444; }

.badge-inner { display: flex; align-items: center; gap: 12px; }
.badge-label { font-size: 12px; color: #666; }
.badge-value { font-size: 18px; font-weight: 700; }
.badge-ok .badge-value { color: #22c55e; }
.badge-degraded .badge-value { color: #f59e0b; }
.badge-critical .badge-value { color: #ef4444; }
.badge-reasons { margin-top: 4px; display: flex; flex-wrap: wrap; gap: 4px; }
.reason-tag {
  display: inline-block; font-size: 11px; padding: 1px 6px;
  border-radius: 3px; background: rgba(245,158,11,0.12); color: #b45309;
}
.badge-critical .reason-tag { background: rgba(239,68,68,0.12); color: #b91c1c; }
</style>
