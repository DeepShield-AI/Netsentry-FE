<template>
  <div class="ou-page">
    <div class="ou-card">
      <div class="ou-card-header">
        <span class="ou-card-title">在线用户</span>
        <span class="ou-card-extra">👥 共 {{ users.length }} 个在线用户</span>
      </div>
      <div class="ou-card-body">
        <table class="ou-table">
          <thead>
            <tr>
              <th style="width:60px">序号</th>
              <th>IP地址</th>
              <th>MAC地址</th>
              <th>用户名</th>
              <th>认证方式</th>
              <th>登录时间</th>
              <th>在线时长</th>
              <th>上行流量</th>
              <th>下行流量</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in pagedUsers" :key="row.ip">
              <td>{{ (currentPage - 1) * pageSize + idx + 1 }}</td>
              <td class="mono">{{ row.ip }}</td>
              <td class="mono">{{ row.mac || '-' }}</td>
              <td>{{ row.hostname || row.user || '-' }}</td>
              <td><span :class="['ou-tag', authTagClass(row.auth_method)]">{{ row.auth_method || '未知' }}</span></td>
              <td>{{ fmtTime(row.first_seen) }}</td>
              <td>{{ fmtDuration(row.first_seen) }}</td>
              <td>{{ fmtBytes(row.bytes_out || row.upstream || 0) }}</td>
              <td>{{ fmtBytes(row.bytes_in || row.downstream || 0) }}</td>
              <td><span :class="['ou-tag', row.status === 'idle' ? 'ou-tag-default' : 'ou-tag-green']">{{ row.status === 'idle' ? '空闲' : '活跃' }}</span></td>
            </tr>
            <tr v-if="!users.length">
              <td colspan="10" class="ou-empty">暂无在线用户数据</td>
            </tr>
          </tbody>
        </table>
        <div class="ou-pagination" v-if="users.length > pageSize">
          <span class="ou-page-total">共 {{ users.length }} 条</span>
          <button class="ou-page-btn" :disabled="currentPage <= 1" @click="currentPage--">&lt;</button>
          <span class="ou-page-num">{{ currentPage }} / {{ totalPages }}</span>
          <button class="ou-page-btn" :disabled="currentPage >= totalPages" @click="currentPage++">&gt;</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { api } from '@/api/client'
import { mockTrafficOnlineUsers } from './mock-data'

const users = ref<any[]>([])
const currentPage = ref(1)
const pageSize = 20
let timer: any = null

const totalPages = computed(() => Math.max(1, Math.ceil(users.value.length / pageSize)))
const pagedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return users.value.slice(start, start + pageSize)
})

function fmtBytes(b: number): string {
  if (!b) return '0 B'
  if (b >= 1e9) return (b / 1e9).toFixed(1) + ' GB'
  if (b >= 1e6) return (b / 1e6).toFixed(1) + ' MB'
  if (b >= 1e3) return (b / 1e3).toFixed(1) + ' KB'
  return b.toFixed(0) + ' B'
}
function fmtTime(ts: any): string {
  if (!ts) return '-'
  const d = typeof ts === 'string' ? new Date(ts) : new Date(ts * 1000)
  return isNaN(d.getTime()) ? '-' : d.toLocaleString('zh-CN')
}
function fmtDuration(ts: any): string {
  if (!ts) return '-'
  const d = typeof ts === 'string' ? new Date(ts) : new Date(ts * 1000)
  if (isNaN(d.getTime())) return '-'
  const diffMs = Date.now() - d.getTime()
  const hours = Math.floor(diffMs / 3600000)
  const mins = Math.floor((diffMs % 3600000) / 60000)
  if (hours > 0) return `${hours}小时${mins}分钟`
  return `${mins}分钟`
}
function authTagClass(method: string): string {
  if (!method) return 'ou-tag-default'
  if (method.includes('802.1x')) return 'ou-tag-blue'
  if (method.includes('Portal')) return 'ou-tag-green'
  if (method.includes('MAC')) return 'ou-tag-orange'
  return 'ou-tag-default'
}

async function loadUsers() {
  try {
    const arr = await api.trafficOnlineUsers().catch(() => mockTrafficOnlineUsers())
    const now = Date.now()
    users.value = Array.isArray(arr) ? arr.map((u: any) => {
      // Determine activity status: idle if no traffic in last 60s
      const lastMs = u.last_seen ? new Date(u.last_seen).getTime() : 0
      const idle = lastMs > 0 && (now - lastMs) > 60000
      return {
        ...u,
        hostname: u.hostname || u.user || '',
        auth_method: u.auth_method || 'Mirror',
        // API provides total bytes; split estimate based on common ratio
        bytes_in: u.bytes_in || Math.round((u.bytes || 0) * 0.7),
        bytes_out: u.bytes_out || Math.round((u.bytes || 0) * 0.3),
        status: idle ? 'idle' : 'active',
      }
    }).sort((a: any, b: any) => (b.bytes || 0) - (a.bytes || 0)) : []
  } catch { users.value = [] }
}

onMounted(() => {
  loadUsers()
  timer = setInterval(loadUsers, 5000)
})
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.ou-page {
  padding: 0 4px;
}
.ou-card {
  background: #fff;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}
.ou-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid #f0f0f0;
}
.ou-card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}
.ou-card-extra {
  font-size: 13px;
  color: #606266;
}
.ou-card-body {
  padding: 0;
}

/* Table */
.ou-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.ou-table th {
  text-align: left;
  padding: 10px 12px;
  background: #fafafa;
  color: #606266;
  font-weight: 600;
  border-bottom: 1px solid #ebeef5;
  white-space: nowrap;
}
.ou-table td {
  padding: 9px 12px;
  border-bottom: 1px solid #f0f0f0;
  color: #303133;
}
.ou-table tbody tr:hover {
  background: #f5f7fa;
}
.ou-empty {
  text-align: center;
  color: #909399;
  padding: 40px 0 !important;
}

/* Tags */
.ou-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.5;
}
.ou-tag-blue { background: #e6f7ff; color: #1890ff; border: 1px solid #91d5ff; }
.ou-tag-green { background: #f6ffed; color: #52c41a; border: 1px solid #b7eb8f; }
.ou-tag-orange { background: #fff7e6; color: #fa8c16; border: 1px solid #ffd591; }
.ou-tag-default { background: #fafafa; color: #606266; border: 1px solid #d9d9d9; }

/* Pagination */
.ou-pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid #f0f0f0;
}
.ou-page-total {
  font-size: 13px;
  color: #909399;
  margin-right: 8px;
}
.ou-page-btn {
  width: 28px;
  height: 28px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  color: #303133;
}
.ou-page-btn:disabled {
  color: #c0c4cc;
  cursor: not-allowed;
}
.ou-page-btn:hover:not(:disabled) {
  border-color: #1890ff;
  color: #1890ff;
}
.ou-page-num {
  font-size: 13px;
  color: #303133;
}
</style>