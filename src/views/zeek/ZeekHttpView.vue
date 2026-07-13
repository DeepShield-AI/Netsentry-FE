<template>
  <div class="zeek-http">
    <el-card shadow="never">
      <template #header>
        <div class="section-header">
          <el-icon><Document /></el-icon>
          <span>Zeek http.log — HTTP 请求</span>
        </div>
      </template>

      <div class="toolbar">
        <el-input v-model="filter" placeholder="搜索 Host / URI / UA" clearable style="width:280px" @keyup.enter="reload" />
        <el-button type="primary" @click="reload">刷新</el-button>
      </div>

      <el-table :data="rows" stripe border size="small" max-height="600" v-loading="loading">
        <el-table-column prop="ts" label="时间" width="170" :formatter="fmtTime" sortable />
        <el-table-column prop="src_ip" label="客户端" width="130" />
        <el-table-column prop="dst_ip" label="服务端" width="130" />
        <el-table-column prop="method" label="方法" width="70" />
        <el-table-column prop="host" label="Host" width="160" show-overflow-tooltip />
        <el-table-column prop="uri" label="URI" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status_code" label="状态" width="70" />
        <el-table-column prop="response_body_len" label="响应体" width="90" sortable />
        <el-table-column prop="user_agent" label="User-Agent" width="200" show-overflow-tooltip />
        <el-table-column prop="pcap_segment" label="PCAP段" width="150" show-overflow-tooltip />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Document } from '@element-plus/icons-vue'
import { api } from '@/api/client'

const rows = ref<any[]>([])
const loading = ref(false)
const filter = ref('')

async function reload() {
  loading.value = true
  try {
    const data = await api.get('/zeek/http', { params: { limit: 200 } })
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
