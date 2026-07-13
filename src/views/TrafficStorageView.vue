<template>
  <div class="page">
    <!-- ── 存储状态 KPI ──────────────────────────────────────── -->
    <el-row :gutter="14" class="kpi-row">
      <el-col :xs="12" :sm="6">
        <StatCard label="存储状态" :value="stats?.enabled ? '已开启' : '未开启'"
                  :sub="stats?.dir || '—'" :icon="FolderOpened"
                  :tone="stats?.enabled ? '#22c55e' : '#94a3b8'" />
      </el-col>
      <el-col :xs="12" :sm="6">
        <StatCard label="占用空间" :value="formatBytes(stats?.total_bytes ?? 0)"
                  :sub="`${formatNumber(stats?.file_count ?? 0)} 个段文件`" :icon="Coin" tone="#3b82f6" />
      </el-col>
      <el-col :xs="12" :sm="6">
        <StatCard label="活跃写入段" :value="formatNumber(stats?.active ?? 0)"
                  sub="正在写入 (.active)" :icon="EditPen" tone="#f59e0b" />
      </el-col>
      <el-col :xs="12" :sm="6">
        <StatCard label="时间跨度" :value="spanText"
                  :sub="stats?.newest ? `最新 ${formatTime(stats.newest)}` : '—'" :icon="Timer" tone="#a855f7" />
      </el-col>
    </el-row>

    <el-alert v-if="stats && !stats.enabled" type="warning" :closable="false" class="hint"
      show-icon title="全流量存储未开启或暂无数据"
      description="在 capture.toml 的 [storage] 段设置 enabled=true 并配置 dir / max_disk_mb / retention_seconds，然后重启探针。落盘由 capture 完成；本页面读取该目录用于状态展示与按 IP 提取下载。" />

    <!-- ── 按 IP 提取下载 ────────────────────────────────────── -->
    <el-card shadow="never" class="body-row">
      <template #header>
        <div class="section-header">
          <el-icon><Download /></el-icon>
          <span>按 IP 提取全流量</span>
          <span class="muted small">从已存储的 PCAP 段中过滤指定 IP 的数据包，打包为 .pcap 下载</span>
        </div>
      </template>
      <el-form :inline="true" class="extract-form" @submit.prevent="onDownload">
        <el-form-item label="IP 地址">
          <el-input v-model="ip" placeholder="如 192.168.1.10 或 2001:db8::1" style="width: 240px"
                    clearable @keyup.enter="onDownload" />
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker v-model="range" type="datetimerange" range-separator="至"
            start-placeholder="开始(可选)" end-placeholder="结束(可选)"
            value-format="YYYY-MM-DDTHH:mm:ss.SSSZ" style="width: 380px" />
        </el-form-item>
        <el-form-item label="大小上限(MB)">
          <el-input-number v-model="limitMb" :min="1" :max="4096" :step="50" controls-position="right" style="width: 130px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Download" :disabled="!ipValid" @click="onDownload">下载 PCAP</el-button>
        </el-form-item>
      </el-form>
      <div class="muted small">
        提示：提取在服务端逐段过滤，达到大小上限即停止；下载的 .pcap 可用 Wireshark / tcpdump 直接打开。
      </div>
    </el-card>

    <!-- ── 按会话(五元组)提取下载 ─────────────────────────────── -->
    <el-card shadow="never" class="body-row">
      <template #header>
        <div class="section-header">
          <el-icon><Connection /></el-icon>
          <span>按会话(五元组)提取全流量</span>
          <span class="muted small">用 .idx 偏移索引直接定位该会话的包（双向），无需扫描整段，速度快</span>
        </div>
      </template>
      <el-form :inline="true" class="extract-form" @submit.prevent="onDownloadSession">
        <el-form-item label="源 IP">
          <el-input v-model="sSrcIp" placeholder="src ip" style="width: 170px" clearable />
        </el-form-item>
        <el-form-item label="源端口">
          <el-input v-model="sSrcPort" placeholder="可选" style="width: 90px" clearable />
        </el-form-item>
        <el-form-item label="目的 IP">
          <el-input v-model="sDstIp" placeholder="dst ip" style="width: 170px" clearable />
        </el-form-item>
        <el-form-item label="目的端口">
          <el-input v-model="sDstPort" placeholder="可选" style="width: 90px" clearable />
        </el-form-item>
        <el-form-item label="协议">
          <el-select v-model="sProto" style="width: 110px">
            <el-option label="TCP" value="TCP" />
            <el-option label="UDP" value="UDP" />
            <el-option label="ICMP" value="ICMP" />
            <el-option label="ICMPv6" value="ICMPv6" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Download" :disabled="!sessionValid" @click="onDownloadSession">下载会话 PCAP</el-button>
        </el-form-item>
      </el-form>
      <div class="muted small">
        默认匹配双向（src↔dst）；复用上方「时间范围 / 大小上限」。仅能提取开启存储之后产生的会话。
      </div>
    </el-card>

    <!-- ── 段文件列表 ────────────────────────────────────────── -->
    <el-card shadow="never" class="body-row">
      <template #header>
        <div class="section-header">
          <el-icon><Files /></el-icon>
          <span>PCAP 段文件</span>
          <span class="muted small">环形缓冲：容量超限按最旧优先删除；到达保留时长清除</span>
          <el-button class="count-tag" size="small" :icon="Refresh" @click="reload">刷新</el-button>
        </div>
      </template>
      <el-table :data="files" v-loading="loading" size="small" stripe :max-height="460"
                empty-text="暂无段文件…">
        <el-table-column label="段文件名" min-width="260">
          <template #default="{ row }"><span class="mono xs">{{ row.name }}</span></template>
        </el-table-column>
        <el-table-column label="大小" width="120" align="right" sortable prop="bytes">
          <template #default="{ row }">{{ formatBytes(row.bytes) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="row.sealed ? 'success' : 'warning'" disable-transitions>
              {{ row.sealed ? '已封口' : '写入中' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="修改时间" width="190">
          <template #default="{ row }"><span class="mono xs">{{ formatTime(row.mod_time) }}</span></template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Coin, Connection, Download, EditPen, Files, FolderOpened, Refresh, Timer } from '@element-plus/icons-vue'

import StatCard from '@/components/StatCard.vue'
import { api } from '@/api/client'
import type { PcapSegment, PcapStats } from '@/api/types'
import { formatBytes, formatNumber, formatTime } from '@/utils/format'
import { downloadFile } from '@/utils/download'

const stats = ref<PcapStats | null>(null)
const files = ref<PcapSegment[]>([])
const loading = ref(false)

const ip = ref('')
const range = ref<[string, string] | null>(null)
const limitMb = ref(200)

// Session (five-tuple) extraction form.
const sSrcIp = ref('')
const sDstIp = ref('')
const sSrcPort = ref('')
const sDstPort = ref('')
const sProto = ref('TCP')

const ipLike = (v: string) => {
  const t = v.trim()
  if (!t) return false
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(t) || (t.includes(':') && /^[0-9a-fA-F:]+$/.test(t))
}
const sessionValid = computed(() => ipLike(sSrcIp.value) && ipLike(sDstIp.value))

// Loose but useful client-side IPv4/IPv6 sanity check.
const ipValid = computed(() => {
  const v = ip.value.trim()
  if (!v) return false
  const v4 = /^(\d{1,3}\.){3}\d{1,3}$/
  const v6 = /^[0-9a-fA-F:]+$/
  return v4.test(v) || (v.includes(':') && v6.test(v))
})

const spanText = computed(() => {
  if (!stats.value?.oldest || !stats.value?.newest) return '—'
  return `${formatTime(stats.value.oldest)} →`
})

async function reload() {
  loading.value = true
  try {
    const [s, f] = await Promise.all([
      api.pcapStats().catch(() => null),
      api.pcapFiles().then(r => r.items).catch(() => [] as PcapSegment[]),
    ])
    stats.value = s
    files.value = f
  } finally {
    loading.value = false
  }
}

function onDownload() {
  if (!ipValid.value) {
    ElMessage.warning('请输入有效的 IP 地址')
    return
  }
  const url = api.pcapExtractUrl({
    ip: ip.value.trim(),
    since: range.value?.[0],
    until: range.value?.[1],
    limit_mb: limitMb.value,
  })
  void downloadFile(url, `netsentry-${ip.value.trim()}.pcap`)
}

function onDownloadSession() {
  if (!sessionValid.value) {
    ElMessage.warning('请输入有效的源 IP 和目的 IP')
    return
  }
  const url = api.pcapSessionUrl({
    src_ip: sSrcIp.value.trim(),
    dst_ip: sDstIp.value.trim(),
    src_port: sSrcPort.value.trim() ? Number(sSrcPort.value.trim()) : undefined,
    dst_port: sDstPort.value.trim() ? Number(sDstPort.value.trim()) : undefined,
    proto: sProto.value,
    since: range.value?.[0],
    until: range.value?.[1],
    limit_mb: limitMb.value,
  })
  void downloadFile(url, `netsentry-session-${sSrcIp.value.trim()}-${sDstIp.value.trim()}.pcap`)
}

let timer: number | null = null
onMounted(() => {
  void reload()
  timer = window.setInterval(reload, 5000)
})
onBeforeUnmount(() => { if (timer != null) window.clearInterval(timer) })
</script>

<style scoped>
.kpi-row { margin-bottom: 14px; }
.body-row { margin-bottom: 14px; }
.hint { margin-bottom: 14px; }
.section-header { display: flex; align-items: center; gap: 8px; font-weight: 600; flex-wrap: wrap; }
.count-tag { margin-left: auto; }
.extract-form { margin-bottom: 6px; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.small { font-size: 12px; }
.xs { font-size: 11px; }
.muted { color: var(--el-text-color-secondary); }
</style>
