<template>
  <div class="page">
    <el-row :gutter="14" class="kpi-row">
      <el-col :xs="12" :md="6"><StatCard label="视频会话" :value="formatNumber(rows.length)" sub="长视频 / 直播 / 短视频" :icon="VideoCamera" tone="#8b5cf6" /></el-col>
      <el-col :xs="12" :md="6"><StatCard label="唯一服务器" :value="formatNumber(uniqueServers)" sub="目的 IP 去重" :icon="Connection" tone="#3b82f6" /></el-col>
      <el-col :xs="12" :md="6"><StatCard label="识别应用" :value="formatNumber(appTypes)" sub="去重" :icon="Monitor" tone="#22c55e" /></el-col>
      <el-col :xs="12" :md="6"><StatCard label="总流量" :value="formatBytes(totalBytes)" sub="视频字节" :icon="DataLine" tone="#64748b" /></el-col>
    </el-row>

    <div class="toolbar">
      <el-radio-group v-model="subCat" size="small">
        <el-radio-button value="">全部</el-radio-button>
        <el-radio-button value="long">长视频</el-radio-button>
        <el-radio-button value="live">直播</el-radio-button>
        <el-radio-button value="short">短视频</el-radio-button>
      </el-radio-group>
      <el-input v-model="search" placeholder="搜索 IP / 应用…" clearable :prefix-icon="Search" size="small" style="width: 260px" />
      <el-button size="small" :icon="Refresh" @click="load">刷新</el-button>
      <span class="muted small">显示 {{ filtered.length }} / {{ rows.length }} 条</span>
    </div>

    <el-table :data="filtered" size="small" stripe :max-height="560" empty-text="暂无视频事务…"
              :default-sort="{ prop: 'timestamp', order: 'descending' }">
      <el-table-column prop="timestamp" label="时间" width="160" sortable>
        <template #default="{ row }"><span class="mono xs">{{ formatTime(row.timestamp) }}</span></template>
      </el-table-column>
      <el-table-column label="分类" width="80">
        <template #default="{ row }">
          <el-tag size="small" :type="subCatTag(row)" disable-transitions>{{ subCatLabel(row) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="应用" width="130">
        <template #default="{ row }">
          <el-tag size="small" type="info" disable-transitions>{{ row.app_proto || row.master_proto || '—' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="客户端" min-width="155">
        <template #default="{ row }"><span class="mono xs">{{ prettyIP(row.five_tuple.src_ip) }}:{{ row.five_tuple.src_port }}</span></template>
      </el-table-column>
      <el-table-column label="服务器" min-width="155">
        <template #default="{ row }"><span class="mono xs">{{ prettyIP(row.five_tuple.dst_ip) }}:{{ row.five_tuple.dst_port }}</span></template>
      </el-table-column>
      <el-table-column prop="packet_count" label="包数" width="80" align="right" sortable>
        <template #default="{ row }">{{ formatNumber(row.packet_count) }}</template>
      </el-table-column>
      <el-table-column prop="bytes_count" label="字节" width="90" align="right" sortable>
        <template #default="{ row }">{{ formatBytes(row.bytes_count) }}</template>
      </el-table-column>
      <el-table-column prop="duration_ms" label="时长" width="80" align="right" sortable>
        <template #default="{ row }">{{ formatDurationMs(row.duration_ms) }}</template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Connection, DataLine, Monitor, Refresh, Search, VideoCamera } from '@element-plus/icons-vue'
import StatCard from '@/components/StatCard.vue'
import { api } from '@/api/client'
import type { Flow } from '@/api/types'
import { formatBytes, formatDurationMs, formatNumber, formatTime, prettyIP } from '@/utils/format'

// ── nDPI app names → sub-category mapping ──
const LONG_VIDEO = new Set(['YouTube', 'Netflix', 'Bilibili', 'iQIYI', 'Youku', 'Tencent.Video', 'MangoTV', 'HBO', 'Disney+', 'Amazon.Video', 'Hulu', 'Vimeo', 'Twitch.TV'])
const LIVE_STREAM = new Set(['Twitch', 'Twitch.TV', 'HuYa', 'DouYu', 'BiliBili.Live', 'YouTube.Live', 'Kick'])
const SHORT_VIDEO = new Set(['TikTok', 'Douyin', 'Kuaishou', 'Instagram.Reels', 'YouTube.Shorts', 'Snapchat'])
const ALL_VIDEO = new Set([...LONG_VIDEO, ...LIVE_STREAM, ...SHORT_VIDEO])

// Port-based fallback: common streaming/RTMP/RTSP/HLS
const VIDEO_PORTS = new Set([1935, 554, 8554])

const allFlows = ref<Flow[]>([])
const search = ref('')
const subCat = ref('')

function isVideo(f: Flow): boolean {
  const app = f.app_proto || f.master_proto || ''
  return ALL_VIDEO.has(app) || VIDEO_PORTS.has(f.five_tuple.dst_port)
}

function getSubCat(f: Flow): string {
  const app = f.app_proto || f.master_proto || ''
  if (LIVE_STREAM.has(app)) return 'live'
  if (SHORT_VIDEO.has(app)) return 'short'
  if (LONG_VIDEO.has(app)) return 'long'
  return 'long' // default for port-based matches
}

function subCatLabel(f: Flow): string {
  const m: Record<string, string> = { long: '长视频', live: '直播', short: '短视频' }
  return m[getSubCat(f)] || '视频'
}
function subCatTag(f: Flow): '' | 'success' | 'warning' {
  const c = getSubCat(f)
  if (c === 'live') return 'warning'
  if (c === 'short') return 'success'
  return ''
}

async function load() {
  try {
    const items = await api.recentFlows(500)
    allFlows.value = items.filter(isVideo)
  } catch { /* */ }
}

const rows = computed(() => {
  if (!subCat.value) return allFlows.value
  return allFlows.value.filter(f => getSubCat(f) === subCat.value)
})
const filtered = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return rows.value
  return rows.value.filter(f =>
    [f.five_tuple.src_ip, f.five_tuple.dst_ip, f.master_proto, f.app_proto]
      .filter(Boolean).join(' ').toLowerCase().includes(q)
  )
})
const uniqueServers = computed(() => new Set(rows.value.map(f => f.five_tuple.dst_ip)).size)
const appTypes = computed(() => new Set(rows.value.map(f => f.app_proto || f.master_proto).filter(Boolean)).size)
const totalBytes = computed(() => rows.value.reduce((s, f) => s + (f.bytes_count || 0), 0))

let timer: number | null = null
onMounted(() => { void load(); timer = window.setInterval(load, 5000) })
onBeforeUnmount(() => { if (timer != null) window.clearInterval(timer) })
</script>

<style scoped>
.kpi-row { margin-bottom: 14px; }
.toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; flex-wrap: wrap; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.xs { font-size: 11px; }
.small { font-size: 12px; }
.muted { color: var(--el-text-color-secondary); }
</style>
