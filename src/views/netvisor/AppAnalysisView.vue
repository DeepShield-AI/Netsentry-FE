<template>
  <div class="application-view">
    <!-- 顶部统计卡片 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="4">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #61afef 0%, #4596d9 100%);">
              <el-icon :size="24"><Operation /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">活跃应用</div>
              <div class="stat-value">{{ appTotal }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="5">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #98c379 0%, #7eb368 100%);">
              <el-icon :size="24"><Upload /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">总上传流量</div>
              <div class="stat-value">{{ formatBytes(totalUpload) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="5">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #e5c07b 0%, #d5ad65 100%);">
              <el-icon :size="24"><Download /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">总下载流量</div>
              <div class="stat-value">{{ formatBytes(totalDownload) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="5">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #c678dd 0%, #b562cc 100%);">
              <el-icon :size="24"><Connection /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">活跃连接</div>
              <div class="stat-value">{{ totalConnections }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="5">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #56b6c2 0%, #3ea0ad 100%);">
              <el-icon :size="24"><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">协议识别率</div>
              <div class="stat-value">{{ classificationAccuracy }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 应用流量表格 -->
    <el-card shadow="hover" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span class="card-title">
            <el-icon><TrendCharts /></el-icon>
            应用流量统计
          </span>
          <div class="header-actions">
            <el-button type="primary" size="small" @click="loadData" :icon="Refresh">
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        :data="applications"
        style="width: 100%"
        :max-height="600"
        stripe
        v-loading="loading"
        :default-sort="{ prop: 'total_bytes', order: 'descending' }"
        row-key="name"
      >
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="app-detail">
              <el-descriptions :column="2" border size="small">
                <el-descriptions-item label="应用名称">
                  <el-tag type="success" size="small">{{ row.name }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="协议分类">{{ row.category || '-' }}</el-descriptions-item>
                <el-descriptions-item label="活跃连接">{{ row.connections }}</el-descriptions-item>
                <el-descriptions-item label="总连接数">{{ row.total_connections }}</el-descriptions-item>
                <el-descriptions-item label="上传数据包">{{ row.packets_sent.toLocaleString() }}</el-descriptions-item>
                <el-descriptions-item label="下载数据包">{{ row.packets_recv.toLocaleString() }}</el-descriptions-item>
                <el-descriptions-item label="上传流量">
                  <span style="color: #e5c07b; font-weight: 600;">{{ formatBytes(row.bytes_sent) }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="下载流量">
                  <span style="color: #61afef; font-weight: 600;">{{ formatBytes(row.bytes_recv) }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="总流量" :span="2">
                  <span style="color: #98c379; font-weight: 700; font-size: 14px;">
                    {{ formatBytes(row.bytes_sent + row.bytes_recv) }}
                  </span>
                </el-descriptions-item>
                <el-descriptions-item label="首次活动">{{ formatTimestamp(row.first_seen) }}</el-descriptions-item>
                <el-descriptions-item label="最后活动">{{ formatTimestamp(row.last_seen) }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#" width="60" />
        <el-table-column prop="name" label="应用名称" width="180" sortable show-overflow-tooltip>
          <template #default="{ row }">
            <el-tag type="success" size="small">{{ row.name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="process_name" label="进程名" width="120" sortable show-overflow-tooltip />
        <el-table-column prop="connections" label="活跃连接" width="120" sortable align="right" />
        <el-table-column prop="packets_sent" label="上传包数" width="120" sortable align="right">
          <template #default="{ row }">
            {{ row.packets_sent.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="packets_recv" label="下载包数" width="120" sortable align="right">
          <template #default="{ row }">
            {{ row.packets_recv.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="bytes_sent" label="上传流量" width="120" sortable align="right">
          <template #default="{ row }">
            <span style="color: #e5c07b;">{{ formatBytes(row.bytes_sent) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="bytes_recv" label="下载流量" width="120" sortable align="right">
          <template #default="{ row }">
            <span style="color: #61afef;">{{ formatBytes(row.bytes_recv) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="总流量" width="140" sortable align="right" :sort-by="(row: any) => row.bytes_sent + row.bytes_recv">
          <template #default="{ row }">
            <strong style="color: #98c379;">{{ formatBytes(row.bytes_sent + row.bytes_recv) }}</strong>
          </template>
        </el-table-column>
        <el-table-column prop="last_seen" label="最后活动" width="180" sortable>
          <template #default="{ row }">
            {{ formatTimestamp(row.last_seen) }}
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[20, 50, 100, 200]"
          :total="appTotal"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="paginate"
          @current-change="paginate"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Operation, Upload, Download, Connection, TrendCharts, Refresh
} from '@element-plus/icons-vue'

interface Application {
  name: string
  process_name: string
  category: string
  connections: number
  total_connections: number
  bytes_sent: number
  bytes_recv: number
  packets_sent: number
  packets_recv: number
  first_seen: number
  last_seen: number
}

const allApps = ref<Application[]>([])
const applications = ref<Application[]>([])
const appTotal = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const loading = ref(false)
const classificationAccuracy = ref('N/A')

let refreshTimer: any = null

// 计算总统计
const totalUpload = computed(() => {
  return allApps.value.reduce((sum, app) => sum + (app.bytes_sent || 0), 0)
})

const totalDownload = computed(() => {
  return allApps.value.reduce((sum, app) => sum + (app.bytes_recv || 0), 0)
})

const totalConnections = computed(() => {
  return allApps.value.reduce((sum, app) => sum + (app.connections || 0), 0)
})

onMounted(() => {
  loadData()
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})

async function loadData() {
  loading.value = true
  try {
    // 从 /recent/flows 获取流数据（含 process_name）
    const resp = await fetch('/recent/flows?n=500')
    if (!resp.ok) throw new Error('fetch failed')
    const flows: any[] = await resp.json()

    // 按应用协议名称聚合（优先 app_proto，退回 master_proto）
    const appMap = new Map<string, Application>()
    let identified = 0

    flows.forEach(flow => {
      const appName = flow.app_proto || flow.master_proto || '未知协议'
      if (flow.app_proto || flow.master_proto) identified++

      const ts = new Date(flow.timestamp).getTime() / 1000

      if (!appMap.has(appName)) {
        appMap.set(appName, {
          name: appName,
          process_name: flow.process_name || '-',
          category: flow.category || '',
          connections: 0,
          total_connections: 0,
          bytes_sent: 0,
          bytes_recv: 0,
          packets_sent: 0,
          packets_recv: 0,
          first_seen: ts,
          last_seen: ts,
        })
      }

      const app = appMap.get(appName)!
      app.connections += 1
      app.total_connections += 1

      // 根据方向分配上传/下载
      const bytes = flow.bytes_count || 0
      const packets = flow.packet_count || 0
      if (flow.direction === 'outbound') {
        app.bytes_sent += bytes
        app.packets_sent += packets
      } else if (flow.direction === 'inbound') {
        app.bytes_recv += bytes
        app.packets_recv += packets
      } else {
        // 平分
        app.bytes_sent += Math.floor(bytes / 2)
        app.bytes_recv += Math.ceil(bytes / 2)
        app.packets_sent += Math.floor(packets / 2)
        app.packets_recv += Math.ceil(packets / 2)
      }

      if (ts < app.first_seen) app.first_seen = ts
      if (ts > app.last_seen) app.last_seen = ts

      // 保留进程名（取最后一个非空的）
      if (flow.process_name && app.process_name === '-') {
        app.process_name = flow.process_name
      }
    })

    // 转换为数组并排序
    allApps.value = Array.from(appMap.values())
      .sort((a, b) => (b.bytes_sent + b.bytes_recv) - (a.bytes_sent + a.bytes_recv))

    appTotal.value = allApps.value.length

    // 计算协议识别率
    if (flows.length > 0) {
      classificationAccuracy.value = ((identified / flows.length) * 100).toFixed(1) + '%'
    }

    paginate()
  } catch (error) {
    console.error('Load applications failed:', error)
    ElMessage.error(`加载应用数据失败: ${error}`)
  } finally {
    loading.value = false
  }
}

function paginate() {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  applications.value = allApps.value.slice(start, end)
}

function startAutoRefresh() {
  refreshTimer = setInterval(() => {
    loadData()
  }, 5000)
}

function stopAutoRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

function formatTimestamp(timestamp: any): string {
  if (!timestamp) return '-'
  const date = new Date(timestamp * 1000)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'

  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}
</script>

<style scoped>
.application-view {
  padding: 24px;
  height: calc(100vh - 120px);
  overflow-y: auto;
}

.app-detail {
  padding: 16px 24px;
  background: var(--el-fill-color-lighter);
}
.app-detail :deep(.el-descriptions) {
  background: var(--el-fill-color-blank);
}
.app-detail :deep(.el-descriptions__label) {
  font-weight: 600;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
}
.app-detail :deep(.el-descriptions__content) {
  color: var(--el-text-color-primary);
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  transition: all 0.3s ease;
  border-radius: 12px;
}
.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--el-box-shadow);
}
.stat-card :deep(.el-card__body) {
  padding: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.header-actions {
  display: flex;
  gap: 8px;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-card) {
  border-radius: 12px;
  border: 1px solid var(--el-border-color-light);
}

:deep(.el-table) {
  --el-table-border-color: var(--el-border-color-lighter);
  background-color: var(--el-fill-color-blank);
  color: var(--el-text-color-regular);
}
:deep(.el-table .el-table__header) {
  font-weight: 600;
  color: var(--el-text-color-secondary);
  background-color: var(--el-fill-color-light);
}
:deep(.el-table .el-table__row:hover) {
  background-color: var(--el-fill-color-light);
}
:deep(.el-table .el-table__cell) {
  border-bottom: 1px solid var(--el-border-color-lighter);
}
</style>
