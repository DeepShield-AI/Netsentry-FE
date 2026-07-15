<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav" role="tablist">
        <button type="button" class="nv-tab active" role="tab">Top连接</button>
      </div>
    </div>
    <div class="nv-tabs-body">
      <div class="to-dashboard-scroll">
        <div class="to-dashboard">
          <!-- 过滤栏面板 -->
          <div class="to-chart-row">
            <div class="to-chart-panel to-chart-panel-full" data-chart="filter-top-conn">
              <!-- 过滤条件 -->
              <div class="to-filter-container">
                <div class="to-filter-row-simple">
                  <label class="to-filter-item">
                    <span class="to-filter-label">IP类型</span>
                    <select class="to-filter-select" v-model="ipType">
                      <option value="all">所有类型</option>
                      <option value="internal">内网IP</option>
                      <option value="external">外网IP</option>
                    </select>
                  </label>

                  <label class="to-filter-item">
                    <span class="to-filter-label">所有类型</span>
                    <select class="to-filter-select" v-model="allTypes">
                      <option value="all">全部</option>
                      <option value="ipv4">IPv4</option>
                      <option value="ipv6">IPv6</option>
                    </select>
                  </label>

                  <label class="to-filter-item">
                    <span class="to-filter-label">用户类型</span>
                    <select class="to-filter-select" v-model="userType">
                      <option value="all">内网用户</option>
                      <option value="normal">普通用户</option>
                      <option value="vip">VIP用户</option>
                      <option value="guest">访客</option>
                    </select>
                  </label>

                  <label class="to-filter-item">
                    <span class="to-filter-label">应用协议</span>
                    <select class="to-filter-select" v-model="appProtocol">
                      <option value="any">任意协议</option>
                      <option value="HTTP">HTTP</option>
                      <option value="HTTPS">HTTPS</option>
                      <option value="TCP">TCP</option>
                      <option value="UDP">UDP</option>
                      <option value="DNS">DNS</option>
                      <option value="SSH">SSH</option>
                    </select>
                  </label>

                  <div class="to-search-box">
                    <input type="text" class="to-input" placeholder="任意协议" v-model="keyword" />
                    <button type="button" class="to-btn-primary" @click="handleSearch">🔍</button>
                  </div>
                </div>
              </div>

              <!-- 分界线 -->
              <div class="to-divider"></div>

              <!-- Top连接表格 -->
              <div class="to-table-wrapper">
                <table class="to-table-data">
                  <thead>
                    <tr>
                      <th style="width:50px">序号</th>
                      <th>IP <span class="sort-icon">⇅</span></th>
                      <th>连接数 <span class="sort-icon">⇅</span></th>
                      <th>IP备注 <span class="sort-icon">⇅</span></th>
                      <th style="width:120px">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, idx) in pagedConnections" :key="row.ip + idx" :class="{ 'to-row-active': idx % 2 === 0 }">
                      <td>{{ (currentPage - 1) * pageSize + idx + 1 }}</td>
                      <td><a href="#" class="to-link-text">{{ row.ip }}</a></td>
                      <td class="to-num-cell">{{ row.connections.toLocaleString() }}</td>
                      <td>{{ row.remark || '-' }}</td>
                      <td>
                        <div class="to-action-group">
                          <button type="button" class="to-icon-btn" title="备注" @click="handleRemark(row)">备注</button>
                          <button type="button" class="to-icon-btn" title="画像" @click="handleProfile(row)">画像</button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- 分页 -->
              <div class="to-pagination-bar">
                <div class="to-page-info">
                  <span>共 {{ filteredConnections.length }} 条</span>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

// 状态管理
const ipType = ref('all')
const allTypes = ref('all')
const userType = ref('all')
const appProtocol = ref('any')
const keyword = ref('')
const currentPage = ref(1)
const pageSize = ref(100)
const gotoPage = ref(1)

// Top连接模拟数据接口
interface TopConnection {
  ip: string
  connections: number
  remark: string
}

function generateIP(): string {
  return `${Math.floor(Math.random() * 255) + 1}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 254) + 1}`
}

function generateTopConnectionsData(count: number = 26394): TopConnection[] {
  const data: TopConnection[] = []

  // 前10条使用固定的真实数据（从截图提取）
  const topItems = [
    { ip: '2402:e000:1:400::6506:f822', connections: 58975 },
    { ip: '2402:e000:1:416:101:8:6:172', connections: 21870 },
    { ip: '101.8.10.23', connections: 1587 },
    { ip: '192.144.253.229', connections: 1286 },
    { ip: '166.111.7.8', connections: 1280 },
    { ip: '166.111.7.7', connections: 1189 },
    { ip: '2402:e000:1:400::2', connections: 1182 },
    { ip: '166.111.8.81', connections: 1138 },
    { ip: '166.111.5.85', connections: 1126 },
    { ip: '202.119.42.58', connections: 687 }
  ]

  for (let i = 0; i < count; i++) {
    let item: TopConnection

    if (i < topItems.length) {
      // 前10条使用固定数据
      item = {
        ip: topItems[i].ip,
        connections: topItems[i].connections,
        remark: ''
      }
    } else {
      // 后面的数据随机生成
      const conn = Math.floor(Math.random() * 600) + 250
      const useIPv6 = Math.random() > 0.7
      let ip: string

      if (useIPv6) {
        // 生成IPv6地址
        ip = `2402:${Math.floor(Math.random() * 16).toString(16)}000:${Math.floor(Math.random() * 256)}:${Math.floor(Math.random() * 256)}:${Math.floor(Math.random() * 256)}::${Math.floor(Math.random() * 256)}`
      } else {
        // 生成IPv4地址
        ip = generateIP()
      }

      item = {
        ip,
        connections: conn,
        remark: ''
      }
    }

    data.push(item)
  }

  return data
}

const connectionsData = ref<TopConnection[]>(generateTopConnectionsData())

// 过滤计算属性
const filteredConnections = computed(() => {
  let data = [...connectionsData.value]
  if (keyword.value && keyword.value.trim()) {
    data = data.filter(item =>
      item.ip.toLowerCase().includes(keyword.value.toLowerCase().trim())
    )
  }
  return data
})

// 分页计算属性
const totalPages = computed(() => Math.max(1, Math.ceil(filteredConnections.value.length / parseInt(pageSize.value))))
const pagedConnections = computed(() => {
  const start = (currentPage.value - 1) * parseInt(pageSize.value)
  return filteredConnections.value.slice(start, start + parseInt(pageSize.value))
})

// 可见页码
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

// 事件处理函数
function handleSearch() {
  currentPage.value = 1
}

function jumpToPage() {
  const page = Math.max(1, Math.min(parseInt(String(gotoPage.value)) || 1, totalPages.value))
  currentPage.value = page
}

function handleRemark(row: any) {
  console.log('添加备注:', row.ip)
}

function handleProfile(row: any) {
  console.log('查看画像:', row.ip)
}

let timer: any = null

onMounted(() => {
  // 可以在这里添加自动刷新逻辑
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
/* ===== 完全复制在线用户的样式 ===== */

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
  font-size: 11px;
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