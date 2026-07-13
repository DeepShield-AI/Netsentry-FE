<template>
  <div class="page">
    <el-row :gutter="14" class="kpi-row">
      <el-col :xs="12" :md="6"><StatCard label="文件下载" :value="formatNumber(rows.length)" sub="文档 / 压缩包 / 安装包" :icon="FolderOpened" tone="#f97316" /></el-col>
      <el-col :xs="12" :md="6"><StatCard label="唯一服务器" :value="formatNumber(uniqueServers)" sub="目的 IP 去重" :icon="Connection" tone="#3b82f6" /></el-col>
      <el-col :xs="12" :md="6"><StatCard label="识别应用" :value="formatNumber(appTypes)" sub="去重" :icon="Monitor" tone="#22c55e" /></el-col>
      <el-col :xs="12" :md="6"><StatCard label="总流量" :value="formatBytes(totalBytes)" sub="下载字节" :icon="DataLine" tone="#64748b" /></el-col>
    </el-row>

    <div class="toolbar">
      <el-radio-group v-model="subCat" size="small">
        <el-radio-button value="">全部</el-radio-button>
        <el-radio-button v-for="c in SUB_CATS" :key="c.key" :value="c.key">{{ c.label }}</el-radio-button>
      </el-radio-group>
      <el-input v-model="search" placeholder="搜索 IP / 应用…" clearable :prefix-icon="Search" size="small" style="width: 260px" />
      <el-button size="small" :icon="Refresh" @click="load">刷新</el-button>
      <span class="muted small">显示 {{ filtered.length }} / {{ rows.length }} 条</span>
    </div>

    <el-table :data="filtered" size="small" stripe :max-height="560" empty-text="暂无文件下载事务…"
              :default-sort="{ prop: 'timestamp', order: 'descending' }">
      <el-table-column prop="timestamp" label="时间" width="160" sortable>
        <template #default="{ row }"><span class="mono xs">{{ formatTime(row.timestamp) }}</span></template>
      </el-table-column>
      <el-table-column label="类型" width="90">
        <template #default="{ row }">
          <el-tag size="small" :type="typeTag(row)" disable-transitions>{{ subCatLabel(row) }}</el-tag>
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
import { Connection, DataLine, FolderOpened, Monitor, Refresh, Search } from '@element-plus/icons-vue'
import StatCard from '@/components/StatCard.vue'
import { api } from '@/api/client'
import type { Flow } from '@/api/types'
import { formatBytes, formatDurationMs, formatNumber, formatTime, prettyIP } from '@/utils/format'

const DOC_APPS = new Set(['Microsoft.Office', 'Google.Docs', 'WPS', 'Adobe.PDF'])
const ARCHIVE_APPS = new Set(['7zip', 'WinRAR'])
const INSTALLER_APPS = new Set(['WindowsUpdate', 'Apple.Update', 'APT', 'YUM', 'Snap', 'Flatpak'])
const FTP_APPS = new Set(['FTP', 'SFTP', 'FTPS', 'SCP', 'BitTorrent', 'eDonkey', 'Thunder', 'BaiduNetdisk', 'Xunlei', 'qBittorrent', 'Transmission'])
const CLOUD_APPS = new Set(['Dropbox', 'OneDrive', 'Google.Drive', 'iCloud', 'Box', 'Mega', 'AliYunDrive', 'BaiduNetdisk', '115Netdisk', 'WeTransfer'])
const ALL_FILE = new Set([...DOC_APPS, ...ARCHIVE_APPS, ...INSTALLER_APPS, ...FTP_APPS, ...CLOUD_APPS])
const FILE_PORTS = new Set([20, 21, 69, 115])

const SUB_CATS = [
  { key: 'doc', label: '办公文档', set: DOC_APPS },
  { key: 'cloud', label: '网盘传输', set: CLOUD_APPS },
  { key: 'p2p', label: 'P2P/下载', set: FTP_APPS },
  { key: 'update', label: '系统更新', set: INSTALLER_APPS },
]

const allFlows = ref<Flow[]>([])
const search = ref('')
const subCat = ref('')

function isFileDownload(f: Flow): boolean {
  const app = f.app_proto || f.master_proto || ''
  return ALL_FILE.has(app) || FILE_PORTS.has(f.five_tuple.dst_port)
}

function getSubCat(f: Flow): string {
  const app = f.app_proto || f.master_proto || ''
  if (DOC_APPS.has(app)) return 'doc'
  if (CLOUD_APPS.has(app)) return 'cloud'
  if (FTP_APPS.has(app)) return 'p2p'
  if (INSTALLER_APPS.has(app)) return 'update'
  if (ARCHIVE_APPS.has(app)) return 'doc'
  return 'p2p'
}

function subCatLabel(f: Flow): string {
  const m: Record<string, string> = { doc: '文档', cloud: '网盘', p2p: '下载', update: '更新' }
  return m[getSubCat(f)] || '文件'
}
function typeTag(f: Flow): '' | 'success' | 'warning' | 'danger' {
  const c = getSubCat(f)
  if (c === 'cloud') return 'success'
  if (c === 'update') return 'warning'
  if (c === 'p2p') return 'danger'
  return ''
}

async function load() {
  try {
    const items = await api.recentFlows(500)
    allFlows.value = items.filter(isFileDownload)
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
