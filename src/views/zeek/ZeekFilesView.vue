<template>
  <div class="zeek-files">
    <el-card shadow="never">
      <template #header>
        <div class="section-header">
          <el-icon><FolderOpened /></el-icon>
          <span>Zeek files.log — 文件传输</span>
        </div>
      </template>

      <div class="toolbar">
        <el-input v-model="filter" placeholder="搜索 MIME / 文件名 / 哈希" clearable style="width:280px" @keyup.enter="reload" />
        <el-button type="primary" @click="reload">刷新</el-button>
      </div>

      <el-table :data="rows" stripe border size="small" max-height="600" v-loading="loading">
        <el-table-column prop="ts" label="时间" width="170" :formatter="fmtTime" sortable />
        <el-table-column prop="src_ip" label="源 IP" width="130" />
        <el-table-column prop="dst_ip" label="目的 IP" width="130" />
        <el-table-column prop="source" label="来源协议" width="90" />
        <el-table-column prop="mime_type" label="MIME" width="150" show-overflow-tooltip />
        <el-table-column prop="filename" label="文件名" width="180" show-overflow-tooltip />
        <el-table-column prop="seen_bytes" label="已见字节" width="100" sortable />
        <el-table-column prop="total_bytes" label="总字节" width="100" sortable />
        <el-table-column prop="md5" label="MD5" width="260" show-overflow-tooltip />
        <el-table-column prop="sha256" label="SHA256" width="280" show-overflow-tooltip />
        <el-table-column prop="pcap_segment" label="PCAP段" width="150" show-overflow-tooltip />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FolderOpened } from '@element-plus/icons-vue'
import { api } from '@/api/client'

const rows = ref<any[]>([])
const loading = ref(false)
const filter = ref('')

async function reload() {
  loading.value = true
  try {
    const data = await api.get('/zeek/files', { params: { limit: 200 } })
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
