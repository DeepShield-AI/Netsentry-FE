<template>
  <div class="page">
    <el-row :gutter="14" class="kpi-row">
      <el-col :xs="12" :md="6"><StatCard label="TLS 会话" :value="formatNumber(rows.length)" sub="当前样本" :icon="Lock" tone="#8b5cf6" /></el-col>
      <el-col :xs="12" :md="6"><StatCard label="唯一域名" :value="formatNumber(uniqueHosts)" sub="SNI 去重" :icon="Connection" tone="#3b82f6" /></el-col>
      <el-col :xs="12" :md="6"><StatCard label="QUIC 流" :value="formatNumber(quicCount)" sub="UDP/443" :icon="Position" tone="#22c55e" /></el-col>
      <el-col :xs="12" :md="6"><StatCard label="总流量" :value="formatBytes(totalBytes)" sub="TLS 字节" :icon="DataLine" tone="#64748b" /></el-col>
    </el-row>

    <div class="toolbar">
      <el-input v-model="search" placeholder="搜索域名 / IP…" clearable :prefix-icon="Search" size="small" style="width: 280px" />
      <el-button size="small" :icon="Refresh" @click="load">刷新</el-button>
      <span class="muted small">显示 {{ filtered.length }} / {{ rows.length }} 条 · 每 5 秒自动刷新</span>
    </div>

    <el-table :data="filtered" size="small" stripe :max-height="560" empty-text="暂无 TLS/HTTPS 会话…"
              :default-sort="{ prop: 'timestamp', order: 'descending' }">
      <el-table-column prop="timestamp" label="时间" width="160" sortable>
        <template #default="{ row }"><span class="mono xs">{{ formatTime(row.timestamp) }}</span></template>
      </el-table-column>
      <el-table-column label="域名 / SNI" min-width="220">
        <template #default="{ row }"><span class="mono xs">{{ row.host || '—' }}</span></template>
      </el-table-column>
      <el-table-column label="协议" width="100">
        <template #default="{ row }">
          <el-tag size="small" :type="row.app_proto === 'QUIC' ? 'success' : 'info'" disable-transitions>
            {{ row.master_proto }}{{ row.app_proto && row.app_proto !== row.master_proto ? '/' + row.app_proto : '' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="源地址" min-width="150">
        <template #default="{ row }"><span class="mono xs">{{ prettyIP(row.five_tuple.src_ip) }}:{{ row.five_tuple.src_port }}</span></template>
      </el-table-column>
      <el-table-column label="目的地址" min-width="150">
        <template #default="{ row }"><span class="mono xs">{{ prettyIP(row.five_tuple.dst_ip) }}:{{ row.five_tuple.dst_port }}</span></template>
      </el-table-column>
      <el-table-column label="方向" width="60" align="center">
        <template #default="{ row }"><span class="dir">{{ row.direction === 'inbound' ? '↓' : row.direction === 'outbound' ? '↑' : '↔' }}</span></template>
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
import { Connection, DataLine, Lock, Position, Refresh, Search } from '@element-plus/icons-vue'
import StatCard from '@/components/StatCard.vue'
import { api } from '@/api/client'
import type { Flow } from '@/api/types'
import { formatBytes, formatDurationMs, formatNumber, formatTime, prettyIP } from '@/utils/format'

const TLS_PROTOS = new Set(['TLS', 'DTLS', 'QUIC'])
const allFlows = ref<Flow[]>([])
const search = ref('')

async function load() {
  try {
    const items = await api.recentFlows(500)
    allFlows.value = items.filter(f =>
      TLS_PROTOS.has(f.master_proto || '') || TLS_PROTOS.has(f.app_proto || '')
    )
  } catch { /* */ }
}

const rows = computed(() => allFlows.value)
const filtered = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return rows.value
  return rows.value.filter(f =>
    [f.host, f.five_tuple.src_ip, f.five_tuple.dst_ip, f.master_proto, f.app_proto]
      .filter(Boolean).join(' ').toLowerCase().includes(q)
  )
})
const uniqueHosts = computed(() => new Set(rows.value.map(f => f.host).filter(Boolean)).size)
const quicCount = computed(() => rows.value.filter(f => (f.master_proto || f.app_proto || '').includes('QUIC')).length)
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
.dir { font-size: 13px; font-weight: 600; }
</style>
