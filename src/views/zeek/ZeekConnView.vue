<template>
  <div class="zeek-conn">
    <el-card shadow="never">
      <template #header>
        <div class="section-header">
          <el-icon><Connection /></el-icon>
          <span>Zeek conn.log — 连接日志</span>
        </div>
      </template>

      <div class="toolbar">
        <el-input v-model="filter" placeholder="搜索 IP / 服务 / 状态" clearable style="width:260px" @keyup.enter="reload" />
        <el-select v-model="proto" placeholder="协议" clearable style="width:100px" @change="reload">
          <el-option label="tcp" value="tcp" />
          <el-option label="udp" value="udp" />
          <el-option label="icmp" value="icmp" />
        </el-select>
        <el-button type="primary" @click="reload">刷新</el-button>
      </div>

      <el-table :data="rows" stripe border size="small" max-height="600" v-loading="loading">
        <el-table-column prop="ts" label="时间" width="170" :formatter="fmtTime" sortable />
        <el-table-column prop="src_ip" label="源 IP" width="140" />
        <el-table-column prop="src_port" label="源端口" width="80" />
        <el-table-column prop="dst_ip" label="目的 IP" width="140" />
        <el-table-column prop="dst_port" label="目的端口" width="90" />
        <el-table-column prop="proto" label="协议" width="70" />
        <el-table-column prop="service" label="服务" width="80" />
        <el-table-column prop="duration_ms" label="时长(ms)" width="100" :formatter="fmtDur" sortable />
        <el-table-column prop="orig_bytes" label="发送字节" width="100" sortable />
        <el-table-column prop="resp_bytes" label="接收字节" width="100" sortable />
        <el-table-column prop="conn_state" label="状态" width="70" />
        <el-table-column prop="history" label="历史" width="120" show-overflow-tooltip />
        <el-table-column prop="pcap_segment" label="PCAP段" width="180" show-overflow-tooltip />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Connection } from '@element-plus/icons-vue'
import { api } from '@/api/client'

const rows = ref<any[]>([])
const loading = ref(false)
const filter = ref('')
const proto = ref('')

async function reload() {
  loading.value = true
  try {
    const data = await api.get('/zeek/conn', { params: { limit: 200 } })
    rows.value = Array.isArray(data) ? data : []
  } catch { rows.value = [] }
  loading.value = false
}

function fmtTime(_row: any, _col: any, val: string) {
  if (!val) return '-'
  return new Date(val).toLocaleString('zh-CN')
}

function fmtDur(_row: any, _col: any, val: number) {
  if (val == null) return '-'
  return val.toFixed(1)
}

onMounted(reload)
</script>

<style scoped>
.toolbar { display: flex; gap: 8px; margin-bottom: 12px; }
.section-header { display: flex; align-items: center; gap: 8px; }
</style>
