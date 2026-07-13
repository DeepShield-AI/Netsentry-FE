<template>
  <div class="page">
    <el-row :gutter="14" class="kpi-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="never" class="health-badge" :class="statusClass">
          <div class="badge-inner">
            <el-icon :size="32"><CircleCheckFilled v-if="data?.status === 'ok'" /><WarningFilled v-else-if="data?.status === 'degraded'" /><CircleCloseFilled v-else /></el-icon>
            <div>
              <div class="badge-label">存储状态</div>
              <div class="badge-value">{{ statusLabel }}</div>
              <div v-if="data?.reasons?.length" class="badge-reasons">
                <span v-for="r in data.reasons" :key="r" class="reason-tag">{{ r }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <StatCard label="磁盘使用" :value="diskUsedPctText" :sub="diskDetailText" tone="#f59e0b" />
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <StatCard label="PCAP 段" :value="segCountText" :sub="totalSizeText" tone="#3b82f6" />
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <StatCard label="时间跨度" :value="timeSpanText" :sub="dirText" tone="#a855f7" />
      </el-col>
    </el-row>

    <el-row :gutter="14" class="body-row">
      <el-col :span="24">
        <el-card shadow="never">
          <template #header><span class="card-title">存储详情</span></template>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="存储目录">{{ data?.dir ?? '—' }}</el-descriptions-item>
            <el-descriptions-item label="磁盘总量">{{ data?.disk_total_str ?? '—' }}</el-descriptions-item>
            <el-descriptions-item label="磁盘可用">{{ data?.disk_free_str ?? '—' }}</el-descriptions-item>
            <el-descriptions-item label="使用率">
              <el-progress :percentage="Math.round(data?.disk_used_pct ?? 0)" :stroke-width="14" :text-inside="true" />
            </el-descriptions-item>
            <el-descriptions-item label="段文件总数">{{ data?.segment_count?.toLocaleString() ?? '—' }}</el-descriptions-item>
            <el-descriptions-item label="段文件总大小">{{ data?.total_size_str ?? '—' }}</el-descriptions-item>
            <el-descriptions-item label="最老段文件">{{ data?.oldest_segment ?? '—' }}</el-descriptions-item>
            <el-descriptions-item label="最新段文件">{{ data?.newest_segment ?? '—' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="14" class="body-row">
      <el-col :span="24">
        <el-card shadow="never">
          <template #header><span class="card-title">容量规划</span></template>
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="推荐操作">
              <template v-if="data?.status === 'critical'">
                <el-tag type="danger" size="small">立即清理</el-tag>
                <span style="margin-left:8px;font-size:12px">磁盘空间极低，全流量存储可能已停止写入</span>
              </template>
              <template v-else-if="data?.status === 'degraded'">
                <el-tag type="warning" size="small">建议扩容</el-tag>
                <span style="margin-left:8px;font-size:12px">磁盘空间不足 2GB，请扩容或配置更短的保留策略</span>
              </template>
              <template v-else>
                <el-tag type="success" size="small">正常</el-tag>
                <span style="margin-left:8px;font-size:12px">磁盘空间充足</span>
              </template>
            </el-descriptions-item>
          </el-descriptions>
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
  'badge-critical': data.value?.status === 'critical' || !data.value,
}))
const statusLabel = computed(() => {
  const m: Record<string, string> = { ok: '正常', degraded: '空间偏低', critical: '空间不足' }
  return m[data.value?.status] ?? '未知'
})
const diskUsedPctText = computed(() => {
  const p = data.value?.disk_used_pct ?? 0
  return `${p.toFixed(1)}%`
})
const diskDetailText = computed(() => {
  return `可用 ${data.value?.disk_free_str ?? '—'} / 总量 ${data.value?.disk_total_str ?? '—'}`
})
const segCountText = computed(() => {
  const n = data.value?.segment_count ?? 0
  return n > 0 ? `${n} 个` : '—'
})
const totalSizeText = computed(() => data.value?.total_size_str ?? '—')
const timeSpanText = computed(() => {
  const o = data.value?.oldest_segment
  const n = data.value?.newest_segment
  if (!o || !n) return '—'
  // Extract date from filename pattern like 20260615_120000.pcap
  const oDate = o.substring(0, 8)
  const nDate = n.substring(0, 8)
  if (oDate === nDate) return oDate
  return `${oDate} ~ ${nDate}`
})
const dirText = computed(() => data.value?.dir ?? '—')

async function fetchData() {
  try { data.value = await api.opsStorage() } catch { /* ignore */ }
}

onMounted(() => {
  fetchData()
  timer = window.setInterval(fetchData, 15000)
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
