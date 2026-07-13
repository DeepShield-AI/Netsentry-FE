<template>
  <div class="nv-page">
    <el-card shadow="never">
      <template #header><div class="card-header"><span>质量白名单</span></div></template>
      <el-table :data="items" stripe size="small" max-height="600">
        <el-table-column prop="ip" label="IP地址" min-width="130"  show-overflow-tooltip />
        <el-table-column prop="protocol" label="协议" min-width="80"  show-overflow-tooltip />
        <el-table-column prop="port" label="端口" min-width="70"  show-overflow-tooltip />
        <el-table-column prop="reason" label="原因" min-width="160"  show-overflow-tooltip />
        <el-table-column prop="created" label="添加时间" min-width="140"  show-overflow-tooltip />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const items = ref([
  { ip: '10.0.0.1', protocol: 'TCP', port: 443, reason: '内部监控服务', created: '2024-06-15' },
  { ip: '192.168.1.100', protocol: 'UDP', port: 53, reason: 'DNS服务器', created: '2024-05-20' },
])
</script>

<style scoped>
.card-header { display: flex; align-items: center; justify-content: space-between; }
</style>
