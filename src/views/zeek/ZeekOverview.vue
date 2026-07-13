<template>
  <div class="zeek-overview">
    <el-card shadow="never" class="panel">
      <template #header>
        <div class="section-header">
          <el-icon><DataAnalysis /></el-icon>
          <span>Zeek 协议分析</span>
          <span class="muted small">
            离线 PCAP 段深度协议分析 — conn / dns / http / ssl / files
          </span>
        </div>
      </template>

      <!-- Stats cards -->
      <el-row :gutter="16" class="stats-row">
        <el-col :span="4" v-for="s in stats" :key="s.label">
          <el-statistic :title="s.label" :value="s.value" />
        </el-col>
      </el-row>

      <!-- Quick nav -->
      <el-divider />
      <el-row :gutter="16">
        <el-col :span="8" v-for="tab in tabs" :key="tab.route">
          <el-card shadow="hover" class="nav-card" @click="$router.push(tab.route)">
            <el-icon :size="24"><component :is="tab.icon" /></el-icon>
            <h4>{{ tab.title }}</h4>
            <p class="muted">{{ tab.desc }}</p>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { DataAnalysis, Connection, Search, Lock, Document, FolderOpened } from '@element-plus/icons-vue'
import { api } from '@/api/client'

const stats = ref([
  { label: '连接总数', value: 0 },
  { label: 'DNS 查询', value: 0 },
  { label: 'HTTP 请求', value: 0 },
  { label: 'TLS 握手', value: 0 },
  { label: '文件传输', value: 0 },
  { label: '已处理段', value: 0 },
])

const tabs = [
  { route: '/traffic/zeek/conn', title: '连接日志', desc: 'conn.log — 五元组、时长、字节、状态', icon: Connection },
  { route: '/traffic/zeek/dns', title: 'DNS 分析', desc: 'dns.log — 查询、响应、NXDOMAIN', icon: Search },
  { route: '/traffic/zeek/http', title: 'HTTP 请求', desc: 'http.log — URL、UA、状态码、响应体', icon: Document },
  { route: '/traffic/zeek/ssl', title: 'TLS/SSL', desc: 'ssl.log — SNI、JA3、证书、版本', icon: Lock },
  { route: '/traffic/zeek/files', title: '文件传输', desc: 'files.log — MIME、哈希、大小', icon: FolderOpened },
]

onMounted(async () => {
  try {
    const data = await api.get('/zeek/stats')
    if (data) {
      stats.value[0].value = data.conn_count ?? 0
      stats.value[1].value = data.dns_count ?? 0
      stats.value[2].value = data.http_count ?? 0
      stats.value[3].value = data.ssl_count ?? 0
      stats.value[4].value = data.files_count ?? 0
      stats.value[5].value = data.segments_processed ?? 0
    }
  } catch { /* agent may not have zeek data yet */ }
})
</script>

<style scoped>
.stats-row { margin-bottom: 20px; }
.nav-card { cursor: pointer; text-align: center; padding: 20px; margin-bottom: 12px; }
.nav-card h4 { margin: 8px 0 4px; }
.nav-card .muted { font-size: 12px; color: var(--el-text-color-secondary); }
.section-header { display: flex; align-items: center; gap: 8px; }
.muted { color: var(--el-text-color-secondary); }
.small { font-size: 12px; }
</style>
