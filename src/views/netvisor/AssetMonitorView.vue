<template>
  <div class="nv-asset-card">
    <!-- Tabs -->
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav nv-tabs-nav-wrap" role="tablist" aria-label="资产监测">
        <button
          v-for="t in tabs"
          :key="t.key"
          type="button"
          class="nv-tab"
          :class="{ active: activeTab === t.key }"
          role="tab"
          :aria-selected="activeTab === t.key"
          @click="activeTab = t.key"
        >{{ t.label }}</button>
      </div>
    </div>
    <div class="nv-tabs-body">

      <!-- ==================== 资产监测 Tab ==================== -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'monitor' }">
        <!-- Toolbar -->
        <div class="am-toolbar">
          <div class="am-toolbar-left">
            <label class="am-filter-field">
              <span class="am-filter-label">自动刷新</span>
              <select class="am-filter-select" v-model="refreshInterval">
                <option value="10">10秒</option>
                <option value="30">30秒</option>
                <option value="60">60秒</option>
                <option value="0">关闭</option>
              </select>
            </label>
            <label class="am-filter-field">
              <span class="am-filter-label">主机组</span>
              <select class="am-filter-select" v-model="filterGroup">
                <option value="">所有主机组</option>
                <option v-for="g in hostGroups" :key="g" :value="g">{{ g }}</option>
              </select>
            </label>
            <label class="am-filter-field">
              <span class="am-filter-label">分组</span>
              <select class="am-filter-select" v-model="filterSubGroup">
                <option value="">所有组</option>
                <option v-for="sg in subGroups" :key="sg" :value="sg">{{ sg }}</option>
              </select>
            </label>
            <label class="am-filter-field am-search-field">
              <el-icon class="am-search-icon"><Search /></el-icon>
              <input class="am-filter-input" type="text" placeholder="关键字搜索" v-model="keyword" />
            </label>
            <button type="button" class="am-btn am-btn-primary" @click="doSearch">
              <el-icon><Search /></el-icon> 搜索
            </button>
            <button type="button" class="am-btn am-btn-default" @click="resetFilters">重置</button>
          </div>
          <div class="am-toolbar-right">
            <button type="button" class="am-btn am-btn-primary" @click="openAddHostModal">
              <el-icon><Plus /></el-icon> 添加
            </button>
            <button type="button" class="am-btn am-btn-default" @click="doImport">
              <el-icon><Upload /></el-icon> 导入
            </button>
            <button type="button" class="am-btn am-btn-default" @click="doExport">
              <el-icon><Download /></el-icon> 导出
            </button>
            <div class="am-view-switch">
              <button type="button" class="am-view-btn" :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'" title="列表">
                <el-icon><List /></el-icon>
              </button>
              <button type="button" class="am-view-btn" :class="{ active: viewMode === 'category' }" @click="viewMode = 'category'" title="分类">
                <el-icon><Grid /></el-icon>
              </button>
              <button type="button" class="am-view-btn" :class="{ active: viewMode === 'card' }" @click="viewMode = 'card'" title="卡片">
                <el-icon><Menu /></el-icon>
              </button>
            </div>
          </div>
        </div>

        <!-- Table -->
        <div class="am-table-wrap">
          <table class="am-table">
            <thead>
              <tr>
                <th style="width:40px"><input type="checkbox" v-model="selectAll" @change="toggleSelectAll" /></th>
                <th>名称</th>
                <th>主机</th>
                <th class="am-num-col">流入速率</th>
                <th class="am-num-col">流出速率</th>
                <th class="am-num-col">进入流量</th>
                <th class="am-num-col">流出流量</th>
                <th class="am-num-col">连接数</th>
                <th class="am-num-col">PPS</th>
                <th class="am-num-col">失败率</th>
                <th class="am-num-col">平均时延</th>
                <th style="width:120px">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredHosts.length === 0">
                <td :colspan="12" class="am-empty">加载数据，返回空值</td>
              </tr>
              <tr v-for="(row, idx) in filteredHosts" :key="idx">
                <td><input type="checkbox" v-model="row._selected" /></td>
                <td class="am-name-cell">
                  <el-icon class="am-host-icon"><Monitor /></el-icon>
                  {{ row.name }}
                </td>
                <td>
                  <span class="am-ip-link" @click="openHostDetail(row)">{{ row.host }}</span>
                </td>
                <td class="am-num-col">{{ row.inRate }}</td>
                <td class="am-num-col">{{ row.outRate }}</td>
                <td class="am-num-col">{{ row.inTraffic }}</td>
                <td class="am-num-col">{{ row.outTraffic }}</td>
                <td class="am-num-col">{{ row.connections }}</td>
                <td class="am-num-col">{{ row.pps }}</td>
                <td class="am-num-col">
                  <span class="am-fail-rate" :class="getFailRateClass(row.failRate)">{{ row.failRate }}</span>
                </td>
                <td class="am-num-col">{{ row.avgLatency }}</td>
                <td>
                  <button class="am-action-btn" @click="openHostDetail(row)" title="详情">
                    <el-icon><View /></el-icon>
                  </button>
                  <button class="am-action-btn" @click="openEditHostModal(row)" title="编辑">
                    <el-icon><Edit /></el-icon>
                  </button>
                  <button class="am-action-btn am-action-danger" @click="deleteHost(idx)" title="删除">
                    <el-icon><Delete /></el-icon>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="am-pagination" v-if="filteredHosts.length > 0">
          <span class="am-page-info">共 {{ filteredHosts.length }} 条</span>
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50]"
            :total="filteredHosts.length"
            layout="sizes, prev, pager, next"
            small
          />
        </div>
      </div>

      <!-- ==================== 资产运维 Tab ==================== -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'ops' }">
        <!-- Toolbar -->
        <div class="am-toolbar am-toolbar-ops">
          <div class="am-toolbar-left"></div>
          <div class="am-toolbar-right">
            <label class="am-filter-field am-search-field">
              <el-icon class="am-search-icon"><Search /></el-icon>
              <input class="am-filter-input" type="text" placeholder="关键字搜索" v-model="opsKeyword" />
            </label>
            <button type="button" class="am-btn am-btn-primary" @click="doOpsSearch">
              <el-icon><Search /></el-icon>
            </button>
            <button type="button" class="am-btn am-btn-primary" @click="openAddIpModal">
              <el-icon><Plus /></el-icon> 添加
            </button>
          </div>
        </div>

        <!-- Table -->
        <div class="am-table-wrap">
          <table class="am-table">
            <thead>
              <tr>
                <th style="width:40px"><input type="checkbox" v-model="opsSelectAll" @change="toggleOpsSelectAll" /></th>
                <th>名称</th>
                <th>IP</th>
                <th>主机组</th>
                <th>状态</th>
                <th>最后活跃时间</th>
                <th style="width:120px">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredIps.length === 0">
                <td :colspan="7" class="am-empty">无数据</td>
              </tr>
              <tr v-for="(row, idx) in filteredIps" :key="idx">
                <td><input type="checkbox" v-model="row._selected" /></td>
                <td class="am-name-cell">
                  <el-icon class="am-host-icon"><Monitor /></el-icon>
                  {{ row.name }}
                </td>
                <td>
                  <span class="am-ip-link">{{ row.ip }}</span>
                </td>
                <td>{{ row.group }}</td>
                <td>
                  <span class="am-status-tag" :class="row.status === '在线' ? 'am-status-online' : 'am-status-offline'">
                    <el-icon v-if="row.status === '在线'"><SuccessFilled /></el-icon>
                    <el-icon v-else><CircleCloseFilled /></el-icon>
                    {{ row.status }}
                  </span>
                </td>
                <td>{{ row.lastActive }}</td>
                <td>
                  <button class="am-action-btn" @click="openEditIpModal(row)" title="编辑">
                    <el-icon><Edit /></el-icon>
                  </button>
                  <button class="am-action-btn am-action-danger" @click="deleteIp(idx)" title="删除">
                    <el-icon><Delete /></el-icon>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="am-pagination" v-if="filteredIps.length > 0">
          <span class="am-page-info">共 {{ filteredIps.length }} 条</span>
          <el-pagination
            v-model:current-page="opsCurrentPage"
            v-model:page-size="opsPageSize"
            :page-sizes="[10, 20, 50]"
            :total="filteredIps.length"
            layout="sizes, prev, pager, next"
            small
          />
        </div>
      </div>
    </div>

    <!-- ==================== 添加/编辑主机弹窗 ==================== -->
    <el-dialog
      v-model="hostModalVisible"
      :title="hostModalMode === 'add' ? '添加主机' : '编辑主机'"
      width="520px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form label-width="80px" class="am-modal-form">
        <el-form-item label="类型">
          <el-radio-group v-model="hostForm.type">
            <el-radio value="group">主机组</el-radio>
            <el-radio value="host">主机</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="主机组">
          <el-select v-model="hostForm.group" placeholder="点击选择主机组" style="width:100%">
            <el-option v-for="g in hostGroups" :key="g" :label="g" :value="g" />
          </el-select>
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="hostForm.name" />
        </el-form-item>
        <el-form-item label="主机地址">
          <el-input v-model="hostForm.address" />
        </el-form-item>
        <el-form-item label="端口">
          <el-input v-model.number="hostForm.port" type="number" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="confirmHost">确定</el-button>
        <el-button @click="hostModalVisible = false">取消</el-button>
      </template>
    </el-dialog>

    <!-- ==================== 添加/编辑IP弹窗 ==================== -->
    <el-dialog
      v-model="ipModalVisible"
      :title="ipModalMode === 'add' ? '添加IP' : '编辑IP'"
      width="420px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form label-width="60px" class="am-modal-form">
        <el-form-item label="名称">
          <el-input v-model="ipForm.name" />
        </el-form-item>
        <el-form-item label="IP">
          <el-input v-model="ipForm.ip" placeholder="请输入IP地址" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="confirmIp">确定</el-button>
        <el-button @click="ipModalVisible = false">取消</el-button>
      </template>
    </el-dialog>

    <!-- ==================== 主机详情弹窗 ==================== -->
    <el-dialog
      v-model="detailModalVisible"
      title="主机详情"
      width="640px"
      destroy-on-close
    >
      <el-descriptions :column="2" border v-if="currentHost">
        <el-descriptions-item label="名称">{{ currentHost.name }}</el-descriptions-item>
        <el-descriptions-item label="主机地址">{{ currentHost.host }}</el-descriptions-item>
        <el-descriptions-item label="主机组">{{ currentHost.group }}</el-descriptions-item>
        <el-descriptions-item label="端口">{{ currentHost.port }}</el-descriptions-item>
        <el-descriptions-item label="流入速率">{{ currentHost.inRate }}</el-descriptions-item>
        <el-descriptions-item label="流出速率">{{ currentHost.outRate }}</el-descriptions-item>
        <el-descriptions-item label="进入流量">{{ currentHost.inTraffic }}</el-descriptions-item>
        <el-descriptions-item label="流出流量">{{ currentHost.outTraffic }}</el-descriptions-item>
        <el-descriptions-item label="连接数">{{ currentHost.connections }}</el-descriptions-item>
        <el-descriptions-item label="PPS">{{ currentHost.pps }}</el-descriptions-item>
        <el-descriptions-item label="失败率">{{ currentHost.failRate }}</el-descriptions-item>
        <el-descriptions-item label="平均时延">{{ currentHost.avgLatency }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Search, Plus, Upload, Download, List, Grid, Menu,
  Monitor, View, Edit, Delete, SuccessFilled, CircleCloseFilled
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// ── Tabs ──
const tabs = [
  { key: 'monitor', label: '资产监测' },
  { key: 'ops', label: '资产运维' },
]
const activeTab = ref('monitor')

// ── 资产监测 Tab ─
const refreshInterval = ref('10')
const filterGroup = ref('')
const filterSubGroup = ref('')
const keyword = ref('')
const viewMode = ref('list')
const selectAll = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)

const hostGroups = ['默认组', '服务器组', '网络设备组', '安全设备组']
const subGroups = ['所有组', '生产环境', '测试环境', '办公网络']

interface HostRow {
  _selected: boolean
  name: string
  host: string
  group: string
  port: number
  inRate: string
  outRate: string
  inTraffic: string
  outTraffic: string
  connections: number
  pps: number
  failRate: string
  avgLatency: string
}

const hosts = ref<HostRow[]>([
  { _selected: false, name: '核心交换机-01', host: '192.168.1.1', group: '网络设备组', port: 161, inRate: '125.6 Mbps', outRate: '98.3 Mbps', inTraffic: '1.2 GB', outTraffic: '980 MB', connections: 1523, pps: 45200, failRate: '0.02%', avgLatency: '1.2 ms' },
  { _selected: false, name: 'Web服务器-01', host: '10.0.1.10', group: '服务器组', port: 80, inRate: '56.2 Mbps', outRate: '120.8 Mbps', inTraffic: '560 MB', outTraffic: '1.5 GB', connections: 892, pps: 12800, failRate: '0.15%', avgLatency: '3.5 ms' },
  { _selected: false, name: '数据库服务器', host: '10.0.2.20', group: '服务器组', port: 3306, inRate: '32.1 Mbps', outRate: '28.7 Mbps', inTraffic: '320 MB', outTraffic: '290 MB', connections: 456, pps: 8900, failRate: '0.05%', avgLatency: '2.1 ms' },
  { _selected: false, name: '防火墙-主', host: '192.168.0.1', group: '安全设备组', port: 443, inRate: '200.5 Mbps', outRate: '180.2 Mbps', inTraffic: '2.1 GB', outTraffic: '1.8 GB', connections: 3200, pps: 68000, failRate: '0.01%', avgLatency: '0.8 ms' },
  { _selected: false, name: '应用服务器-02', host: '10.0.1.12', group: '服务器组', port: 8080, inRate: '45.3 Mbps', outRate: '62.1 Mbps', inTraffic: '450 MB', outTraffic: '620 MB', connections: 678, pps: 9500, failRate: '0.08%', avgLatency: '4.2 ms' },
])

const filteredHosts = computed(() => {
  let list = hosts.value
  if (filterGroup.value) list = list.filter(h => h.group === filterGroup.value)
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    list = list.filter(h => h.name.toLowerCase().includes(kw) || h.host.toLowerCase().includes(kw))
  }
  return list
})

function doSearch() { currentPage.value = 1 }
function resetFilters() {
  filterGroup.value = ''
  filterSubGroup.value = ''
  keyword.value = ''
  currentPage.value = 1
}
function toggleSelectAll() {
  filteredHosts.value.forEach(h => { h._selected = selectAll.value })
}
function getFailRateClass(rate: string) {
  const v = parseFloat(rate)
  if (v > 1) return 'am-fail-high'
  if (v > 0.1) return 'am-fail-mid'
  return 'am-fail-low'
}

// ── 添加/编辑主机弹窗 ─
const hostModalVisible = ref(false)
const hostModalMode = ref<'add' | 'edit'>('add')
const editingHostIdx = ref(-1)
const hostForm = ref({ type: 'host', group: '', name: '', address: '', port: 0 })

function openAddHostModal() {
  hostModalMode.value = 'add'
  hostForm.value = { type: 'host', group: '', name: '', address: '', port: 0 }
  hostModalVisible.value = true
}
function openEditHostModal(row: HostRow) {
  hostModalMode.value = 'edit'
  editingHostIdx.value = hosts.value.indexOf(row)
  hostForm.value = { type: 'host', group: row.group, name: row.name, address: row.host, port: row.port }
  hostModalVisible.value = true
}
function confirmHost() {
  if (!hostForm.value.name || !hostForm.value.address) {
    ElMessage.warning('请填写名称和主机地址')
    return
  }
  if (hostModalMode.value === 'add') {
    hosts.value.push({
      _selected: false,
      name: hostForm.value.name,
      host: hostForm.value.address,
      group: hostForm.value.group || '默认组',
      port: hostForm.value.port,
      inRate: '0 Mbps', outRate: '0 Mbps',
      inTraffic: '0 B', outTraffic: '0 B',
      connections: 0, pps: 0,
      failRate: '0%', avgLatency: '0 ms'
    })
    ElMessage.success('添加主机成功')
  } else {
    const idx = editingHostIdx.value
    if (idx >= 0 && idx < hosts.value.length) {
      hosts.value[idx].name = hostForm.value.name
      hosts.value[idx].host = hostForm.value.address
      hosts.value[idx].group = hostForm.value.group
      hosts.value[idx].port = hostForm.value.port
      ElMessage.success('编辑主机成功')
    }
  }
  hostModalVisible.value = false
}
function deleteHost(idx: number) {
  ElMessageBox.confirm(`确定删除主机 "${hosts.value[idx].name}" 吗？`, '确认删除', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(() => {
    hosts.value.splice(idx, 1)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

function doImport() { ElMessage.info('导入功能（Mock）') }
function doExport() { ElMessage.info('导出功能（Mock）') }

// ── 主机详情 ─
const detailModalVisible = ref(false)
const currentHost = ref<HostRow | null>(null)
function openHostDetail(row: HostRow) {
  currentHost.value = row
  detailModalVisible.value = true
}

// ── 资产运维 Tab ──
const opsKeyword = ref('')
const opsSelectAll = ref(false)
const opsCurrentPage = ref(1)
const opsPageSize = ref(10)

interface IpRow {
  _selected: boolean
  name: string
  ip: string
  group: string
  status: '在线' | '离线'
  lastActive: string
}

const ips = ref<IpRow[]>([
  { _selected: false, name: '办公PC-001', ip: '192.168.10.101', group: '默认组', status: '在线', lastActive: '2026-07-13 18:25:00' },
  { _selected: false, name: '办公PC-002', ip: '192.168.10.102', group: '默认组', status: '在线', lastActive: '2026-07-13 18:20:00' },
  { _selected: false, name: '打印机-01', ip: '192.168.10.200', group: '默认组', status: '离线', lastActive: '2026-07-12 17:30:00' },
  { _selected: false, name: 'NAS存储', ip: '192.168.10.50', group: '服务器组', status: '在线', lastActive: '2026-07-13 18:28:00' },
  { _selected: false, name: '摄像头-大厅', ip: '192.168.10.150', group: '默认组', status: '在线', lastActive: '2026-07-13 18:27:00' },
])

const filteredIps = computed(() => {
  let list = ips.value
  if (opsKeyword.value) {
    const kw = opsKeyword.value.toLowerCase()
    list = list.filter(h => h.name.toLowerCase().includes(kw) || h.ip.toLowerCase().includes(kw))
  }
  return list
})

function doOpsSearch() { opsCurrentPage.value = 1 }
function toggleOpsSelectAll() {
  filteredIps.value.forEach(h => { h._selected = opsSelectAll.value })
}

// ── 添加/编辑IP弹窗 ──
const ipModalVisible = ref(false)
const ipModalMode = ref<'add' | 'edit'>('add')
const editingIpIdx = ref(-1)
const ipForm = ref({ name: '', ip: '' })

function openAddIpModal() {
  ipModalMode.value = 'add'
  ipForm.value = { name: '', ip: '' }
  ipModalVisible.value = true
}
function openEditIpModal(row: IpRow) {
  ipModalMode.value = 'edit'
  editingIpIdx.value = ips.value.indexOf(row)
  ipForm.value = { name: row.name, ip: row.ip }
  ipModalVisible.value = true
}
function confirmIp() {
  if (!ipForm.value.name || !ipForm.value.ip) {
    ElMessage.warning('请填写名称和IP')
    return
  }
  if (ipModalMode.value === 'add') {
    ips.value.push({
      _selected: false,
      name: ipForm.value.name,
      ip: ipForm.value.ip,
      group: '默认组',
      status: '离线',
      lastActive: '—'
    })
    ElMessage.success('添加IP成功')
  } else {
    const idx = editingIpIdx.value
    if (idx >= 0 && idx < ips.value.length) {
      ips.value[idx].name = ipForm.value.name
      ips.value[idx].ip = ipForm.value.ip
      ElMessage.success('编辑IP成功')
    }
  }
  ipModalVisible.value = false
}
function deleteIp(idx: number) {
  ElMessageBox.confirm(`确定删除IP "${ips.value[idx].name}" 吗？`, '确认删除', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(() => {
    ips.value.splice(idx, 1)
    ElMessage.success('删除成功')
  }).catch(() => {})
}
</script>

<style scoped>
.nv-asset-card {
  background: #fff;
  border-radius: 4px;
  min-height: 100%;
}

/* ── Tabs ── */
.nv-tabs-header {
  border-bottom: 1px solid #e8e8e8;
  padding: 0 16px;
}
.nv-tabs-nav-wrap {
  display: flex;
  gap: 0;
}
.nv-tab {
  padding: 10px 20px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}
.nv-tab:hover {
  color: #409eff;
}
.nv-tab.active {
  color: #409eff;
  border-bottom-color: #409eff;
  font-weight: 500;
}
.nv-tabs-body {
  padding: 16px;
}
.nv-tab-panel {
  display: none;
}
.nv-tab-panel.active {
  display: block;
}

/* ── Toolbar ── */
.am-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 8px;
}
.am-toolbar-left,
.am-toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.am-filter-field {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #606266;
}
.am-filter-label {
  white-space: nowrap;
}
.am-filter-select {
  height: 32px;
  padding: 0 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
  color: #606266;
  background: #fff;
  min-width: 120px;
  outline: none;
}
.am-filter-select:focus {
  border-color: #409eff;
}
.am-search-field {
  position: relative;
}
.am-search-icon {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  color: #909399;
  font-size: 14px;
  pointer-events: none;
}
.am-filter-input {
  height: 32px;
  padding: 0 8px 0 30px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
  width: 180px;
  outline: none;
}
.am-filter-input:focus {
  border-color: #409eff;
}
.am-btn {
  height: 32px;
  padding: 0 14px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 1px solid transparent;
  transition: all 0.2s;
}
.am-btn-primary {
  background: #409eff;
  color: #fff;
  border-color: #409eff;
}
.am-btn-primary:hover {
  background: #66b1ff;
  border-color: #66b1ff;
}
.am-btn-default {
  background: #fff;
  color: #606266;
  border-color: #dcdfe6;
}
.am-btn-default:hover {
  color: #409eff;
  border-color: #c6e2ff;
  background: #ecf5ff;
}

/* View switch */
.am-view-switch {
  display: flex;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}
.am-view-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 14px;
  border-right: 1px solid #dcdfe6;
  transition: all 0.2s;
}
.am-view-btn:last-child {
  border-right: none;
}
.am-view-btn:hover {
  color: #409eff;
  background: #ecf5ff;
}
.am-view-btn.active {
  color: #409eff;
  background: #ecf5ff;
}

/* ── Table ── */
.am-table-wrap {
  overflow-x: auto;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}
.am-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.am-table thead th {
  background: #f5f7fa;
  color: #606266;
  font-weight: 500;
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid #ebeef5;
  white-space: nowrap;
}
.am-table tbody td {
  padding: 10px 12px;
  border-bottom: 1px solid #ebeef5;
  color: #606266;
}
.am-table tbody tr:hover {
  background: #f5f7fa;
}
.am-num-col {
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.am-name-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}
.am-host-icon {
  color: #409eff;
  font-size: 14px;
}
.am-ip-link {
  color: #409eff;
  cursor: pointer;
  text-decoration: underline;
}
.am-ip-link:hover {
  color: #66b1ff;
}
.am-empty {
  text-align: center;
  padding: 40px 0;
  color: #909399;
  font-size: 14px;
}

/* Fail rate colors */
.am-fail-rate {
  font-weight: 500;
}
.am-fail-low { color: #67c23a; }
.am-fail-mid { color: #e6a23c; }
.am-fail-high { color: #f56c6c; }

/* Action buttons */
.am-action-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 14px;
  transition: all 0.2s;
}
.am-action-btn:hover {
  background: #ecf5ff;
  color: #409eff;
}
.am-action-danger:hover {
  background: #fef0f0;
  color: #f56c6c;
}

/* ── Pagination ── */
.am-pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}
.am-page-info {
  font-size: 13px;
  color: #909399;
}

/* ── Ops toolbar ── */
.am-toolbar-ops {
  justify-content: flex-end;
}

/* ─ Status tags ── */
.am-status-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}
.am-status-online {
  background: #f0f9eb;
  color: #67c23a;
}
.am-status-offline {
  background: #fef0f0;
  color: #f56c6c;
}

/* ── Modal form ── */
.am-modal-form {
  padding: 10px 0;
}
</style>
