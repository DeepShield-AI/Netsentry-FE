<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav" role="tablist">
        <button type="button" class="nv-tab" :class="{ active: activeTab === 'online' }" role="tab" @click="activeTab = 'online'">在线用户</button>
        <button type="button" class="nv-tab" :class="{ active: activeTab === 'traffic' }" role="tab" @click="activeTab = 'traffic'">流量统计</button>
      </div>
    </div>
    <div class="nv-tabs-body">
      <!-- 在线用户 Tab -->
      <div v-show="activeTab === 'online'" class="to-dashboard-scroll">
        <div class="to-dashboard">
          <!-- 过滤栏面板 -->
          <div class="to-chart-row">
            <div class="to-chart-panel to-chart-panel-full" data-chart="filter-online">
              <!-- 过滤条件 -->
              <div class="to-filter-container">
                <div class="to-filter-row-simple">
                  <label class="to-filter-item">
                    <span class="to-filter-label">自动刷新</span>
                    <select class="to-filter-select" v-model="refreshInterval">
                      <option value="0">不刷新</option>
                      <option value="5">5秒</option>
                      <option value="10">10秒</option>
                      <option value="30">30秒</option>
                      <option value="60">1分钟</option>
                    </select>
                  </label>

                  <label class="to-filter-item">
                    <span class="to-filter-label">用户类型</span>
                    <select class="to-filter-select" v-model="userType">
                      <option value="all">所有类型</option>
                      <option value="normal">普通用户</option>
                      <option value="vip">VIP用户</option>
                      <option value="guest">访客</option>
                    </select>
                  </label>

                  <label class="to-filter-item">
                    <span class="to-filter-label">IP范围</span>
                    <input type="text" class="to-input to-input-short" placeholder="xxx-xxx/y" v-model="ipRange" />
                  </label>

                  <div class="to-search-box">
                    <input type="text" class="to-input" placeholder="关键字..." v-model="keyword" />
                    <button type="button" class="to-btn-primary" @click="handleSearch">🔍</button>
                    <button type="button" class="to-btn-small" @click="showMoreFilters = !showMoreFilters">更多条件 ▼</button>
                  </div>
                </div>
              </div>

              <!-- 分界线 -->
              <div class="to-divider"></div>

              <!-- 在线用户表格 -->
              <div class="to-table-wrapper">
                <table class="to-table-data">
                  <thead>
                    <tr>
                      <th style="width:50px">序号</th>
                      <th>IP <span class="sort-icon">⇅</span></th>
                      <th>MAC <span class="sort-icon">⇅</span></th>
                      <th>连接数 <span class="sort-icon">⇅</span></th>
                      <th>流入bps <span class="sort-icon">⇅</span></th>
                      <th>流出bps <span class="sort-icon">⇅</span></th>
                      <th>流入限速 <span class="sort-icon">⇅</span></th>
                      <th>流出限速 <span class="sort-icon">⇅</span></th>
                      <th>身份信息 <span class="sort-icon">⇅</span></th>
                      <th>移动终端 <span class="sort-icon">⇅</span></th>
                      <th>共享 <span class="sort-icon">⇅</span></th>
                      <th>在线时长 <span class="sort-icon">⇅</span></th>
                      <th>流入流量 <span class="sort-icon">⇅</span></th>
                      <th>流出流量 <span class="sort-icon">⇅</span></th>
                      <th>策略 <span class="sort-icon">⇅</span></th>
                      <th>账号备注 <span class="sort-icon">⇅</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, idx) in pagedOnlineUsers" :key="row.ip" :class="{ 'to-row-active': idx % 2 === 0 }">
                      <td>{{ (currentPage - 1) * pageSize + idx + 1 }}</td>
                      <td><a href="#" class="to-link-text">{{ row.ip }}</a></td>
                      <td>{{ row.mac }}</td>
                      <td class="to-num-cell">{{ row.connections }}</td>
                      <td class="to-num-cell">{{ row.inBps }}</td>
                      <td class="to-num-cell">{{ row.outBps }}</td>
                      <td class="to-num-cell">{{ row.inLimit || 0 }}</td>
                      <td class="to-num-cell">{{ row.outLimit || 0 }}</td>
                      <td>{{ row.identity || 0 }}</td>
                      <td class="to-num-cell">{{ row.mobile || 0 }}</td>
                      <td class="to-num-cell">{{ row.share }}</td>
                      <td class="to-num-cell">{{ row.onlineTime }}</td>
                      <td class="to-num-cell">{{ row.inTraffic }}</td>
                      <td class="to-num-cell">{{ row.outTraffic }}</td>
                      <td>{{ row.policy || '-' }}</td>
                      <td>{{ row.accountNote || '-' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- 分页 -->
              <div class="to-pagination-bar">
                <div class="to-page-info">
                  <span>共 {{ filteredOnlineUsers.length }} 条</span>
                  <span style="margin-left:12px;color:#909399;">100 条/页 ▼</span>
                </div>
                <div class="to-page-controls">
                  <button type="button" class="to-page-btn" :disabled="currentPage === 1" @click="currentPage--">&lt;</button>
                  <template v-for="p in visiblePages" :key="'tp-' + p">
                    <button v-if="p !== '...'" type="button"
                            class="to-page-num"
                            :class="{ active: p === currentPage }"
                            @click="currentPage = p">{{ p }}</button>
                    <span v-else class="to-page-dots">...</span>
                  </template>
                  <button type="button" class="to-page-btn" :disabled="currentPage === totalPages" @click="currentPage++">&gt;</button>
                  <span style="margin-left:8px;font-size:13px;color:#606266;">到第</span>
                  <input type="text" class="to-jump-input" v-model.number="gotoPage" style="width:46px;" />
                  <span style="font-size:13px;color:#606266;">页</span>
                  <button type="button" class="to-btn-default" @click="jumpToPage">确定</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 流量统计 Tab -->
      <div v-show="activeTab === 'traffic'" class="to-dashboard-scroll">
        <div class="to-dashboard">
          <!-- 过滤栏面板 -->
          <div class="to-chart-row">
            <div class="to-chart-panel to-chart-panel-full" data-chart="filter-traffic">
              <!-- 过滤条件 -->
              <div class="to-filter-container">
                <div class="to-filter-row-simple">
                  <label class="to-filter-item">
                    <span class="to-filter-label">选择IP</span>
                    <select class="to-filter-select" v-model="selectedIP">
                      <option value="any">任意IP</option>
                      <option value="166.111.7.8">166.111.7.8</option>
                      <option value="166.111.7.7">166.111.7.7</option>
                      <option value="101.6.4.110">101.6.4.110</option>
                    </select>
                  </label>

                  <label class="to-filter-item">
                    <span class="to-filter-label">时间范围</span>
                    <input type="text" class="to-input-time" v-model="timeRange" readonly />
                  </label>

                  <div class="to-search-box">
                    <button type="button" class="to-btn-primary" @click="handleTrafficSearch">🔍</button>
                    <button type="button" class="to-btn-reset" @click="resetTrafficFilters">重置</button>
                  </div>
                </div>
              </div>

              <!-- 分界线 -->
              <div class="to-divider"></div>

              <!-- 流量统计表格 -->
              <div class="to-table-wrapper">
                <table class="to-table-data">
                  <thead>
                    <tr>
                      <th style="width:50px">序号</th>
                      <th>IP <span class="sort-icon">⇅</span></th>
                      <th>平均连接数 <span class="sort-icon">⇅</span></th>
                      <th>流入bps <span class="sort-icon">⇅</span></th>
                      <th>流出bps <span class="sort-icon">⇅</span></th>
                      <th>总bps <span class="sort-icon">⇅</span></th>
                      <th>流入流量/B <span class="sort-icon">⇅</span></th>
                      <th>流出流量/B <span class="sort-icon">⇅</span></th>
                      <th style="width:180px">总流量/B <span class="sort-icon">⇅</span></th>
                      <th>用户名称 <span class="sort-icon">⇅</span></th>
                      <th style="width:80px">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, idx) in pagedTrafficStats" :key="row.ip + idx" :class="{ 'to-row-active': idx % 2 === 0 }">
                      <td>{{ (currentPageTraffic - 1) * pageSizeTraffic + idx + 1 }}</td>
                      <td><a href="#" class="to-link-text">{{ row.ip }}</a></td>
                      <td class="to-num-cell">{{ row.avgConnections }}</td>
                      <td class="to-num-cell">{{ row.inBps }}</td>
                      <td class="to-num-cell">{{ row.outBps }}</td>
                      <td class="to-num-cell">{{ row.totalBps }}</td>
                      <td class="to-num-cell">{{ row.inTraffic }}</td>
                      <td class="to-num-cell">{{ row.outTraffic }}</td>
                      <td>
                        <div class="to-progress-wrap">
                          <div class="to-progress-track">
                            <div class="to-progress-bar" :style="{ width: row.totalPercent + '%' }"></div>
                          </div>
                          <span class="to-progress-text">{{ row.totalPercent }}%</span>
                        </div>
                        <div class="to-value-below">{{ row.totalTraffic }}</div>
                      </td>
                      <td>{{ row.userName || '-' }}</td>
                      <td>
                        <div class="to-action-group">
                          <button type="button" class="to-icon-btn" title="详情" @click="handleTrafficDetail(row)">📊</button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- 分页 -->
              <div class="to-pagination-bar">
                <div class="to-page-info">
                  <span>共 {{ filteredTrafficStats.length }} 条</span>
                  <span style="margin-left:12px;color:#909399;">100 条/页 ▼</span>
                </div>
                <div class="to-page-controls">
                  <button type="button" class="to-page-btn" :disabled="currentPageTraffic === 1" @click="currentPageTraffic--">&lt;</button>
                  <template v-for="p in visiblePagesTraffic" :key="'tt-' + p">
                    <button v-if="p !== '...'" type="button"
                            class="to-page-num"
                            :class="{ active: p === currentPageTraffic }"
                            @click="currentPageTraffic = p">{{ p }}</button>
                    <span v-else class="to-page-dots">...</span>
                  </template>
                  <button type="button" class="to-page-btn" :disabled="currentPageTraffic === totalPagesTraffic" @click="currentPageTraffic++">&gt;</button>
                  <span style="margin-left:8px;font-size:13px;color:#606266;">到第</span>
                  <input type="text" class="to-jump-input" v-model.number="gotoPageTraffic" style="width:46px;" />
                  <span style="font-size:13px;color:#606266;">页</span>
                  <button type="button" class="to-btn-default" @click="jumpToPageTraffic">确定</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const activeTab = ref<'online' | 'traffic'>('online')

// 在线用户相关状态
const refreshInterval = ref('0')
const userType = ref('all')
const ipRange = ref('')
const keyword = ref('')
const showMoreFilters = ref(false)
const currentPage = ref(1)
const pageSize = ref(100)
const gotoPage = ref(1)

// 流量统计相关状态
const selectedIP = ref('any')
const timeRange = ref('2026-07-15 15:58:23 - 2026-07-15 16:13:23')
const currentPageTraffic = ref(1)
const pageSizeTraffic = ref(100)
const gotoPageTraffic = ref(1)

// 在线用户模拟数据
interface OnlineUser {
  ip: string
  mac: string
  connections: number
  inBps: string
  outBps: string
  inLimit: number
  outLimit: number
  identity: number
  mobile: number
  share: string
  onlineTime: string
  inTraffic: string
  outTraffic: string
  policy: string
  accountNote: string
}

function generateIP(): string {
  return `${Math.floor(Math.random() * 255) + 1}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 254) + 1}`
}

function generateMAC(): string {
  const hex = () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()
  return `${hex()}:${hex()}:${hex()}:${hex()}:${hex()}:${hex()}`
}

function generateOnlineUsersData(count: number = 8672): OnlineUser[] {
  const data: OnlineUser[] = []
  for (let i = 0; i < count; i++) {
    const conn = Math.floor(Math.random() * 200)
    const inBpsVal = (Math.random() * 1000).toFixed(0)
    const outBpsVal = (Math.random() * 500).toFixed(0)
    const hours = Math.floor(Math.random() * 24)
    const mins = Math.floor(Math.random() * 60)
    const secs = Math.floor(Math.random() * 60)

    data.push({
      ip: generateIP(),
      mac: generateMAC(),
      connections: conn,
      inBps: `${inBpsVal}M`,
      outBps: `${outBpsVal}M`,
      inLimit: 0,
      outLimit: 0,
      identity: 0,
      mobile: Math.random() > 0.8 ? Math.floor(Math.random() * 50) : 0,
      share: '0/0/0',
      onlineTime: `20${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`,
      inTraffic: `${(Math.random() * 10000).toFixed(2)}G`,
      outTraffic: `${(Math.random() * 2000).toFixed(2)}G`,
      policy: '',
      accountNote: ''
    })
  }
  return data
}

const onlineUsersData = ref<OnlineUser[]>(generateOnlineUsersData())

// 流量统计模拟数据
interface TrafficStat {
  ip: string
  avgConnections: number
  inBps: string
  outBps: string
  totalBps: string
  inTraffic: string
  outTraffic: string
  totalPercent: number
  totalTraffic: string
  userName: string
}

function generateTrafficStatsData(count: number = 165): TrafficStat[] {
  const data: TrafficStat[] = []
  const ips = ['166.111.7.8', '166.111.7.7', '166.111.5.68', '101.6.4.110', '211.71.82.10']

  for (let i = 0; i < count; i++) {
    const ip = ips[i % ips.length] || generateIP()
    const avgConn = Math.floor(Math.random() * 3000)
    const inBpsVal = (Math.random() * 8000).toFixed(1)
    const outBpsVal = (Math.random() * 3000).toFixed(1)
    const totalBpsVal = (parseFloat(inBpsVal) + parseFloat(outBpsVal)).toFixed(1)
    const percent = parseFloat((Math.random() * 40).toFixed(2))
    const totalTrafficG = (Math.random() * 10).toFixed(2)

    data.push({
      ip,
      avgConnections: avgConn,
      inBps: `${inBpsVal}M`,
      outBps: `${outBpsVal}M`,
      totalBps: `${totalBpsVal}M`,
      inTraffic: `${(parseFloat(totalBpsVal) * 60).toFixed(1)}M`,
      outTraffic: `${(parseFloat(outBpsVal) * 50).toFixed(1)}M`,
      totalPercent: percent,
      totalTraffic: `${totalTrafficG}G`,
      userName: i < 5 ? `用户${i + 1}` : ''
    })
  }
  return data
}

const trafficStatsData = ref<TrafficStat[]>(generateTrafficStatsData())

// 在线用户过滤和分页
const filteredOnlineUsers = computed(() => {
  let data = [...onlineUsersData.value]
  if (keyword.value) {
    data = data.filter(item =>
      item.ip.includes(keyword.value) ||
      item.mac.toLowerCase().includes(keyword.value.toLowerCase())
    )
  }
  return data
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredOnlineUsers.value.length / parseInt(pageSize.value))))
const pagedOnlineUsers = computed(() => {
  const start = (currentPage.value - 1) * parseInt(pageSize.value)
  return filteredOnlineUsers.value.slice(start, start + parseInt(pageSize.value))
})

// 流量统计过滤和分页
const filteredTrafficStats = computed(() => {
  let data = [...trafficStatsData.value]
  if (selectedIP.value !== 'any') {
    data = data.filter(item => item.ip === selectedIP.value)
  }
  return data
})

const totalPagesTraffic = computed(() => Math.max(1, Math.ceil(filteredTrafficStats.value.length / parseInt(pageSizeTraffic.value))))
const pagedTrafficStats = computed(() => {
  const start = (currentPageTraffic.value - 1) * parseInt(pageSizeTraffic.value)
  return filteredTrafficStats.value.slice(start, start + parseInt(pageSizeTraffic.value))
})

// 可见页码 - 在线用户
const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const current = currentPage.value
  const total = totalPages.value

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3) pages.push('...')
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i)
    }
    if (current < total - 2) pages.push('...')
    pages.push(total)
  }

  return pages
})

// 可见页码 - 流量统计
const visiblePagesTraffic = computed(() => {
  const pages: (number | string)[] = []
  const current = currentPageTraffic.value
  const total = totalPagesTraffic.value

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3) pages.push('...')
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i)
    }
    if (current < total - 2) pages.push('...')
    pages.push(total)
  }

  return pages
})

// 事件处理函数
function handleSearch() {
  currentPage.value = 1
}

function handleTrafficSearch() {
  currentPageTraffic.value = 1
}

function resetTrafficFilters() {
  selectedIP.value = 'any'
  timeRange.value = '2026-07-15 15:58:23 - 2026-07-15 16:13:23'
  currentPageTraffic.value = 1
}

function jumpToPage() {
  const page = Math.max(1, Math.min(parseInt(String(gotoPage.value)) || 1, totalPages.value))
  currentPage.value = page
}

function jumpToPageTraffic() {
  const page = Math.max(1, Math.min(parseInt(String(gotoPageTraffic.value)) || 1, totalPagesTraffic.value))
  currentPageTraffic.value = page
}

function handleDetailView(row: any) {
  console.log('查看详情:', row.ip)
}

function handleDownload(row: any) {
  console.log('下载数据:', row.ip)
}

function handleTrafficDetail(row: any) {
  console.log('流量详情:', row.ip)
}

let timer: any = null

onMounted(() => {
  if (parseInt(refreshInterval.value) > 0) {
    timer = setInterval(() => {}, parseInt(refreshInterval.value) * 1000)
  }
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
/* ===== 完全复制流量概况的样式（与 TrafficOverviewView.vue 一致） ===== */

:root {
  --bg-page: #f0f2f5;
  --bg-white: #ffffff;
  --border: #e8e8e8;
  --border-light: #f0f0f0;
  --text: #303133;
  --text-secondary: #606266;
  --text-muted: #909399;
  --accent: #409eff;
}

.nv-border-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background: #f0f2f5;
  overflow: hidden;
}

.nv-tabs-header {
  flex-shrink: 0;
  padding: 0 16px;
  border-bottom: 1px solid #e4e7ed;
  background: #fafafa;
}

.nv-tabs-nav {
  display: flex;
  gap: 0;
}

.nv-tab {
  position: relative;
  padding: 12px 20px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  color: #606266;
  cursor: pointer;
  white-space: nowrap;
}

.nv-tab.active {
  color: #409eff;
}

.nv-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20px;
  right: 20px;
  height: 2px;
  background: #409eff;
  border-radius: 1px 1px 0 0;
}

.nv-tabs-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.to-dashboard-scroll {
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.to-dashboard {
  padding: 12px;
  background: #f0f2f5;
}

.to-dashboard > * + * {
  margin-top: 12px;
}

.to-chart-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.to-chart-panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.to-chart-panel-full {
  grid-column: 1 / -1;
}

.to-filter-container {
  padding: 16px 20px;
  background: #fafbfc;
  border-bottom: 2px solid #e4e7ed;
}

.to-filter-row-simple {
  display: flex;
  align-items: center;
  gap: 16px;
}

.to-divider {
  height: 1px;
  background: linear-gradient(to right, transparent, #e4e7ed 20%, #e4e7ed 80%, transparent);
  margin: 0 -20px;
}

.to-filter-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.to-filter-label {
  font-size: 13px;
  color: #606266;
  white-space: nowrap;
  font-weight: 500;
}

.to-filter-select {
  height: 32px;
  padding: 0 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
  background: #fff;
  color: #303133;
  min-width: 120px;
}

.to-search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.to-input {
  height: 32px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
  width: 200px;
  color: #303133;
}

.to-input:focus {
  outline: none;
  border-color: #409eff;
}

.to-input-short {
  width: 150px;
}

.to-input-time {
  height: 32px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
  background: #f5f7fa;
  color: #606266;
  min-width: 280px;
  cursor: default;
}

.to-btn-primary {
  height: 32px;
  padding: 0 16px;
  border: 1px solid #409eff;
  border-radius: 4px;
  background: #409eff;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
}

.to-btn-primary:hover {
  background: #66b1ff;
  border-color: #66b1ff;
}

.to-btn-default {
  height: 28px;
  padding: 0 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  color: #606266;
  font-size: 12px;
  cursor: pointer;
}

.to-btn-small {
  height: 28px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  color: #606266;
  font-size: 12px;
  cursor: pointer;
}

.to-btn-reset {
  height: 32px;
  padding: 0 14px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  color: #606266;
  font-size: 13px;
  cursor: pointer;
}

/* 表格容器 */
.to-table-wrapper {
  overflow-x: auto;
  padding: 14px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.to-table-data {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 13px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
}

.to-table-data thead {
  position: sticky;
  top: 0;
  z-index: 10;
}

.to-table-data th {
  background: linear-gradient(180deg, #f5f7fa 0%, #ecf5ff 100%);
  border-right: 1px solid #dcdfe6;
  border-bottom: 2px solid #409eff;
  padding: 12px 14px;
  text-align: left;
  font-weight: 700;
  color: #1a1a1a;
  white-space: nowrap;
  font-size: 12.5px;
  position: relative;
  letter-spacing: 0.3px;
}

.to-table-data th:last-child {
  border-right: none;
}

.to-table-data td {
  border-right: 1px solid #f0f0f0;
  border-bottom: 1px solid #f5f5f5;
  padding: 10px 14px;
  color: #303133;
  vertical-align: middle;
  transition: all 0.15s ease;
}

.to-table-data td:last-child {
  border-right: none;
}

.to-table-data tr:hover td {
  background: #f0f9ff;
  border-bottom-color: #bae7ff;
}

.to-table-data tbody tr:nth-child(even) td {
  background: #fafcff;
}

.to-table-data tbody tr:nth-child(even):hover td {
  background: #e6f7ff;
}

.to-row-active {
  background: #fafcff !important;
}

.to-row-active:hover {
  background: #e6f7ff !important;
}

.sort-icon {
  color: #909399;
  font-size: 11px;
  margin-left: 6px;
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.2s ease;
}

.sort-icon:hover {
  color: #409eff;
  opacity: 1;
  transform: scale(1.1);
}

.to-link-text {
  color: #1890ff;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
  display: inline-block;
}

.to-link-text:hover {
  text-decoration: underline;
  color: #096dd9;
  transform: translateX(2px);
}

.to-num-cell {
  text-align: right;
  font-variant-numeric: tabular-nums;
  font-family: 'SF Mono', 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 12.5px;
  color: #262626;
  font-weight: 500;
  letter-spacing: -0.3px;
}

/* 进度条 */
.to-progress-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.to-progress-track {
  flex: 1;
  height: 16px;
  background: #f0f2f5;
  border-radius: 3px;
  overflow: hidden;
  position: relative;
  max-width: 140px;
}

.to-progress-blue {
  background: #e6f7ff;
}

.to-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #409eff 0%, #66b1ff 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
  position: relative;
}

.to-bar-blue {
  background: linear-gradient(90deg, #1890ff 0%, #40a9ff 100%);
}

.to-progress-text {
  font-size: 12px;
  font-weight: 600;
  color: #606266;
  min-width: 36px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.to-value-below {
  font-size: 11px;
  color: #909399;
  padding-left: 4px;
  font-variant-numeric: tabular-nums;
}

/* 操作按钮组 */
.to-action-group {
  display: flex;
  gap: 4px;
  align-items: center;
}

.to-icon-btn {
  width: 26px;
  height: 26px;
  padding: 0;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.to-icon-btn:hover {
  border-color: #409eff;
  color: #409eff;
  background: #ecf5ff;
}

/* 分页栏 */
.to-pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 14px;
  border-top: 1px solid #ebeef5;
  background: #fafbfc;
  flex-shrink: 0;
}

.to-page-info {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.to-page-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.to-page-btn {
  min-width: 30px;
  height: 30px;
  padding: 0 6px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  color: #606266;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.to-page-btn:hover:not(:disabled) {
  border-color: #409eff;
  color: #409eff;
}

.to-page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f5f7fa;
}

.to-page-num {
  min-width: 30px;
  height: 30px;
  padding: 0 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  color: #606266;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.to-page-num:hover {
  border-color: #409eff;
  color: #409eff;
}

.to-page-num.active {
  background: #409eff;
  color: #fff;
  border-color: #409eff;
  font-weight: 700;
}

.to-page-dots {
  color: #c0c4cc;
  padding: 0 4px;
  font-size: 13px;
}

.to-jump-input {
  width: 46px;
  height: 30px;
  text-align: center;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
  color: #303133;
}

.to-jump-input:focus {
  outline: none;
  border-color: #409eff;
}

/* 响应式布局 */
@media (max-width: 1280px) {
  .to-summary-row-5 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 960px) {
  .to-chart-row {
    grid-template-columns: 1fr;
  }

  .to-pagination-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .to-page-controls {
    justify-content: center;
  }
}

@media (max-width: 560px) {
  .to-filter-row {
    flex-direction: column;
    align-items: stretch;
  }

  .to-search-box {
    margin-left: 0;
    width: 100%;
  }

  .to-input {
    flex: 1;
  }
}
</style>