<template>
  <div class="zeek-ssl">
    <el-card shadow="never">
      <template #header>
        <div class="section-header">
          <el-icon><Lock /></el-icon>
          <span>Zeek ssl.log — TLS/SSL 握手</span>
        </div>
      </template>

      <div class="toolbar">
        <el-input v-model="filter" placeholder="搜索 SNI / JA3 / 证书" clearable style="width:280px" @keyup.enter="reload" />
        <el-button type="primary" @click="reload">刷新</el-button>
      </div>

      <el-table :data="rows" stripe border size="small" max-height="600" v-loading="loading">
        <el-table-column prop="ts" label="时间" width="170" :formatter="fmtTime" sortable />
        <el-table-column prop="src_ip" label="客户端" width="130" />
        <el-table-column prop="dst_ip" label="服务端" width="130" />
        <el-table-column prop="server_name" label="SNI" width="200" show-overflow-tooltip />
        <el-table-column prop="version" label="TLS版本" width="90" />
        <el-table-column prop="cipher" label="密码套件" width="200" show-overflow-tooltip />
        <el-table-column prop="ja3" label="JA3" width="280" show-overflow-tooltip />
        <el-table-column prop="subject" label="证书主题" width="200" show-overflow-tooltip />
        <el-table-column prop="established" label="建立" width="60" />
        <el-table-column prop="pcap_segment" label="PCAP段" width="150" show-overflow-tooltip />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Lock } from '@element-plus/icons-vue'
import { api } from '@/api/client'

const rows = ref<any[]>([])
const loading = ref(false)
const filter = ref('')

async function reload() {
  loading.value = true
  try {
    const data = await api.get('/zeek/ssl', { params: { limit: 200 } })
    rows.value = Array.isArray(data) ? data : []
  } catch { rows.value = [] }
  loading.value = false
}

function fmtTime(_row: any, _col: any, val: string) {
  if (!val) return '-'
  return new Date(val).toLocaleString('zh-CN')
}

onMounted(reload)
</script>

<style scoped>
.toolbar { display: flex; gap: 8px; margin-bottom: 12px; }
.section-header { display: flex; align-items: center; gap: 8px; }
</style>
