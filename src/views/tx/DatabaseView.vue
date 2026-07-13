<template>
  <div class="page">
    <el-row :gutter="14" class="kpi-row">
      <el-col :xs="12" :md="6"><StatCard label="数据库会话" :value="formatNumber(rows.length)" sub="MySQL/PG/Redis/Mongo" :icon="Coin" tone="#f59e0b" /></el-col>
      <el-col :xs="12" :md="6"><StatCard label="唯一服务器" :value="formatNumber(uniqueServers)" sub="目的 IP 去重" :icon="Connection" tone="#3b82f6" /></el-col>
      <el-col :xs="12" :md="6"><StatCard label="协议类型" :value="formatNumber(protoTypes)" sub="去重" :icon="Coin" tone="#22c55e" /></el-col>
      <el-col :xs="12" :md="6"><StatCard label="总流量" :value="formatBytes(totalBytes)" sub="数据库字节" :icon="DataLine" tone="#64748b" /></el-col>
    </el-row>

    <div class="toolbar">
      <el-input v-model="search" placeholder="搜索 IP / 协议…" clearable :prefix-icon="Search" size="small" style="width: 280px" />
      <el-button size="small" :icon="Refresh" @click="load">刷新</el-button>
      <span class="muted small">显示 {{ filtered.length }} / {{ rows.length }} 条 · 每 5 秒自动刷新</span>
    </div>

    <el-table :data="filtered" size="small" stripe :max-height="560" empty-text="暂无数据库会话…"
              :default-sort="{ prop: 'timestamp', order: 'descending' }">
      <el-table-column prop="timestamp" label="时间" width="160" sortable>
        <template #default="{ row }"><span class="mono xs">{{ formatTime(row.timestamp) }}</span></template>
      </el-table-column>
      <el-table-column label="协议" width="120">
        <template #default="{ row }">
          <el-tag size="small" type="warning" disable-transitions>
            {{ row.app_proto || row.master_proto || '—' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="客户端" min-width="155">
        <template #default="{ row }"><span class="mono xs">{{ prettyIP(row.five_tuple.src_ip) }}:{{ row.five_tuple.src_port }}</span></template>
      </el-table-column>
      <el-table-column label="服务器" min-width="155">
        <template #default="{ row }"><span class="mono xs">{{ prettyIP(row.five_tuple.dst_ip) }}:{{ row.five_tuple.dst_port }}</span></template>
      </el-table-column>
      <el-table-column label="方向" width="60" align="center">
        <template #default="{ row }"><span class="dir">{{ row.direction === 'inbound' ? '↓' : row.direction === 'outbound' ? '↑' : '↔' }}</span></template>
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
import { Coin, Connection, DataLine, Refresh, Search } from '@element-plus/icons-vue'
import StatCard from '@/components/StatCard.vue'
import { api } from '@/api/client'
import type { Flow } from '@/api/types'
import { formatBytes, formatDurationMs, formatNumber, formatTime, prettyIP } from '@/utils/format'

const DB_PROTOS = new Set(['MySQL', 'PostgreSQL', 'Redis', 'MongoDB', 'MSSQL', 'Oracle', 'Memcached', 'CouchDB', 'Cassandra'])
const DB_PORTS = new Set([3306, 5432, 6379, 27017, 1433, 1521, 11211, 5984, 9042])
const allFlows = ref<Flow[]>([])
const search = ref('')

function isDB(f: Flow): boolean {
  return DB_PROTOS.has(f.master_proto || '') || DB_PROTOS.has(f.app_proto || '') ||
    DB_PORTS.has(f.five_tuple.dst_port)
}

async function load() {
  try {
    const items = await api.recentFlows(500)
    allFlows.value = items.filter(isDB)
  } catch { /* */ }
}

const rows = computed(() => allFlows.value)
const filtered = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return rows.value
  return rows.value.filter(f =>
    [f.five_tuple.src_ip, f.five_tuple.dst_ip, f.master_proto, f.app_proto]
      .filter(Boolean).join(' ').toLowerCase().includes(q)
  )
})
const uniqueServers = computed(() => new Set(rows.value.map(f => f.five_tuple.dst_ip)).size)
const protoTypes = computed(() => new Set(rows.value.map(f => f.app_proto || f.master_proto).filter(Boolean)).size)
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
