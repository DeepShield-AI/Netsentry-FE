<template>
  <div class="zeek-dns">
    <el-card shadow="never">
      <template #header>
        <div class="section-header">
          <el-icon><Search /></el-icon>
          <span>Zeek dns.log — DNS 分析</span>
        </div>
      </template>

      <div class="toolbar">
        <el-input v-model="filter" placeholder="搜索域名 / IP" clearable style="width:260px" @keyup.enter="reload" />
        <el-button type="primary" @click="reload">刷新</el-button>
      </div>

      <el-table :data="rows" stripe border size="small" max-height="600" v-loading="loading">
        <el-table-column prop="ts" label="时间" width="170" :formatter="fmtTime" sortable />
        <el-table-column prop="src_ip" label="源 IP" width="140" />
        <el-table-column prop="dst_ip" label="DNS 服务器" width="140" />
        <el-table-column prop="query" label="查询域名" min-width="200" show-overflow-tooltip />
        <el-table-column prop="qtype_name" label="类型" width="70" />
        <el-table-column prop="rcode_name" label="响应码" width="100" />
        <el-table-column prop="answers" label="应答" min-width="200" show-overflow-tooltip />
        <el-table-column prop="pcap_segment" label="PCAP段" width="160" show-overflow-tooltip />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { api } from '@/api/client'

const rows = ref<any[]>([])
const loading = ref(false)
const filter = ref('')

async function reload() {
  loading.value = true
  try {
    const data = await api.get('/zeek/dns', { params: { limit: 200 } })
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
