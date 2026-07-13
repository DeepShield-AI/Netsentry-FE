<template>
  <div class="nv-page">
    <el-card shadow="never">
      <template #header><div class="card-header"><span>Top 连接</span>
        <el-button size="small" :icon="Refresh" circle @click="load" :loading="loading" /></div></template>
      <el-table :data="items" stripe size="small" max-height="600">
        <el-table-column type="index" width="50" />
        <el-table-column prop="src_ip" label="源IP" min-width="120" />
        <el-table-column prop="dst_ip" label="目的IP" min-width="120" />
        <el-table-column prop="dst_port" label="端口" min-width="70" />
        <el-table-column prop="protocol" label="协议" min-width="80" />
        <el-table-column prop="bytes" label="流量" sortable min-width="100">
          <template #default="{ row }">{{ fmtBytes(row.bytes || 0) }}</template>
        </el-table-column>
        <el-table-column prop="packets" label="包数" sortable min-width="80">
          <template #default="{ row }">{{ fmtNum(row.packets || 0) }}</template>
        </el-table-column>
        <el-table-column prop="duration" label="持续(s)" sortable min-width="80" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { fmtBytes, fmtNum } from './api'

const loading = ref(false)
const items = ref<any[]>([])

async function load() {
  loading.value = true
  try {
    const data = await fetch('/traffic/top-connections?n=50').then(r => r.json())
    const arr: any[] = Array.isArray(data) ? data : []
    items.value = arr.map(e => {
      const parts = (e.key || '').split('→')
      const src = (parts[0] || '').trim()
      const dst = (parts[1] || '').trim()
      const srcIp = src.split(':')[0] || src
      const dstParts = dst.split(':')
      return { src_ip: srcIp, dst_ip: dstParts[0] || dst, dst_port: dstParts[1] || '', protocol: e.key?.includes('/') ? e.key.split('/').pop() : '', bytes: e.bytes, packets: e.packets, duration: e.sessions }
    })
  } catch { items.value = [] } finally { loading.value = false }
}

onMounted(load)
</script>

<style scoped>
.card-header { display: flex; align-items: center; justify-content: space-between; }
</style>
