<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav" role="tablist" aria-label="遥测服务">
        <button type="button" class="nv-tab" :class="{ active: tab === 'service-list' }" role="tab" @click="tab = 'service-list'">服务列表</button>
        <button type="button" class="nv-tab" :class="{ active: tab === 'service-map' }" role="tab" @click="tab = 'service-map'">服务映射</button>
        <button type="button" class="nv-tab" :class="{ active: tab === 'online-user' }" role="tab" @click="tab = 'online-user'">在线用户</button>
        <button type="button" class="nv-tab" :class="{ active: tab === 'service-log' }" role="tab" @click="tab = 'service-log'">服务日志</button>
      </div>
    </div>
    <div class="nv-tabs-body">
      <div class="om-oms-page">
        <!-- ============ 服务列表 Tab ============ -->
        <div class="om-oms-panel" :class="{ active: tab === 'service-list' }" role="tabpanel">
          <div class="ou-toolbar om-oms-toolbar">
            <div class="om-oms-toolbar-left">
              <label class="tdh-filter-field">
                <span class="ou-toolbar-label">自动刷新</span>
                <el-select v-model="autoRefresh" size="small" style="width:100px">
                  <el-option label="关闭" :value="0" />
                  <el-option label="10 秒" :value="10000" />
                  <el-option label="30 秒" :value="30000" />
                  <el-option label="100 秒" :value="100000" />
                </el-select>
              </label>
              <el-input v-model="keyword" size="small" placeholder="关键字搜索" style="width:200px" clearable>
                <template #prefix><el-icon><Search /></el-icon></template>
              </el-input>
              <button class="ou-search-btn" @click="doSearch"><el-icon><Search /></el-icon>&nbsp;搜索</button>
              <button class="secondary td-reset-btn" @click="doReset">重置</button>
            </div>
            <div class="om-oms-toolbar-right">
              <button class="link-btn" @click="batchAct('enable')">⏸ 启用</button>
              <button class="link-btn" @click="batchAct('start')">▶ 启动</button>
              <button class="link-btn" @click="batchAct('del')">删除</button>
              <button class="link-btn add-btn" @click="openAdd">+ 添加</button>
              <button class="link-btn" title="列设置" @click="ElMessage.info('列设置（Mock）')">☰</button>
            </div>
          </div>

          <div class="ou-table-wrap om-oms-table-wrap">
            <table class="ou-table om-oms-table">
              <thead>
                <tr>
                  <th class="col-check"><el-checkbox v-model="selectAll" @change="onSelectAll" /></th>
                  <th class="col-idx" style="width:60px">序号</th>
                  <th class="col-name">名称</th>
                  <th class="col-gw">服务网关</th>
                  <th class="col-dns">DNS</th>
                  <th class="col-mtu">MTU</th>
                  <th class="col-group">用户组</th>
                  <th class="col-auth">认证方式</th>
                  <th class="col-radius">RADIUS</th>
                  <th class="col-online ou-num">在线用户</th>
                  <th class="col-rate ou-num">流入速率</th>
                  <th class="col-rate ou-num">流出速率</th>
                  <th class="col-lines">可访问域</th>
                  <th class="col-actions">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in pagedRows" :key="row.id">
                  <td class="col-check"><el-checkbox v-model="row.checked" /></td>
                  <td class="col-idx">{{ (page - 1) * pageSize + i + 1 }}</td>
                  <td><span class="nvt-link" @click="openEdit(row)">{{ row.name }}</span></td>
                  <td>{{ row.gw }}</td>
                  <td>{{ row.dns }}</td>
                  <td class="ou-num">{{ row.mtu }}</td>
                  <td>{{ row.group }}</td>
                  <td>{{ row.auth }}</td>
                  <td>{{ row.radius }}</td>
                  <td class="ou-num">{{ row.online.toLocaleString() }}</td>
                  <td class="ou-num">{{ row.inRate }}</td>
                  <td class="ou-num">{{ row.outRate }}</td>
                  <td>{{ row.lines }}</td>
                  <td class="col-actions">
                    <el-switch v-model="row.enabled" size="small" />
                    <button class="link-btn" @click="openEdit(row)">编辑</button>
                    <button class="link-btn" @click="delRow(row)">删除</button>
                  </td>
                </tr>
                <tr v-if="pagedRows.length === 0">
                  <td colspan="14" class="ou-empty">无数据</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="ou-footer">
            <div class="ou-footer-left">
              <div class="ou-pager">
                <button class="ou-page-btn" :disabled="page <= 1" @click="page > 1 && page--">‹</button>
                <button v-for="pg in pageArr" :key="pg" class="ou-page-btn" :class="{ active: pg === page }" @click="page = pg">{{ pg }}</button>
                <button class="ou-page-btn" :disabled="page >= totalPages" @click="page < totalPages && page++">›</button>
              </div>
              <label class="ou-page-goto">
                到第
                <input v-model.number="gotoPage" class="ou-page-goto-input" type="text" />
                页
                <button class="ou-page-goto-btn" @click="goToPage">确定</button>
              </label>
            </div>
            <div class="ou-footer-right">
              <span>共 {{ filteredRows.length }} 条</span>
              <el-select v-model="pageSize" size="small" style="width:110px">
                <el-option :value="20" label="20 条/页" />
                <el-option :value="50" label="50 条/页" />
                <el-option :value="100" label="100 条/页" />
              </el-select>
            </div>
          </div>
        </div>

        <!-- ============ 服务映射 Tab ============ -->
        <div class="om-oms-panel" :class="{ active: tab === 'service-map' }" role="tabpanel">
          <div class="om-oms-map-form">
            <div class="om-oms-map-field">
              <span class="ou-toolbar-label">映射线路</span>
              <el-select v-model="mapForm.line" placeholder="请选择" size="small" clearable style="width:100%">
                <el-option v-for="l in mapLineOptions" :key="l.value" :label="l.label" :value="l.value" />
              </el-select>
            </div>
            <div class="om-oms-map-field">
              <span class="ou-toolbar-label">映射端口</span>
              <el-input v-model="mapForm.port" size="small" placeholder="8080" style="width:100%" />
            </div>
            <div class="om-oms-map-field">
              <span class="ou-toolbar-label">IWAN服务</span>
              <el-select v-model="mapForm.svc" placeholder="请选择" size="small" clearable style="width:100%">
                <el-option v-for="s in mapSvcOptions" :key="s.value" :label="s.label" :value="s.value" />
              </el-select>
            </div>
            <div class="om-oms-map-field om-oms-map-field-static">
              <span class="ou-toolbar-label">访问次数</span>
              <span class="om-oms-map-count">{{ accessCount }} 次</span>
            </div>
            <div class="om-oms-map-field om-oms-map-field-action">
              <span class="ou-toolbar-label">&nbsp;</span>
              <button class="link-btn" @click="submitMap">添加</button>
            </div>
          </div>

          <div class="ou-table-wrap om-oms-table-wrap om-oms-map-table-wrap">
            <table class="ou-table om-oms-table">
              <thead>
                <tr>
                  <th class="col-idx" style="width:60px">序号</th>
                  <th>映射线路</th>
                  <th>映射端口</th>
                  <th>IWAN服务</th>
                  <th class="ou-num">访问次数</th>
                  <th>创建时间</th>
                  <th class="col-actions">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in filteredMapRows" :key="row.id">
                  <td class="col-idx">{{ i + 1 }}</td>
                  <td>{{ row.line }}</td>
                  <td>{{ row.port }}</td>
                  <td>{{ row.svc }}</td>
                  <td class="ou-num">{{ row.count.toLocaleString() }}</td>
                  <td>{{ row.createdAt }}</td>
                  <td class="col-actions">
                    <button class="link-btn" @click="ElMessage.info('编辑（Mock）')">编辑</button>
                    <button class="link-btn" @click="delMap(row)">删除</button>
                  </td>
                </tr>
                <tr v-if="filteredMapRows.length === 0">
                  <td colspan="7" class="ou-empty">无数据</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ============ 在线用户 Tab ============ -->
        <div class="om-oms-panel" :class="{ active: tab === 'online-user' }" role="tabpanel">
          <div class="ou-toolbar om-oms-toolbar">
            <div class="om-oms-toolbar-left">
              <label class="tdh-filter-field">
                <span class="ou-toolbar-label">自动刷新</span>
                <el-select v-model="autoRefresh" size="small" style="width:100px">
                  <el-option label="关闭" :value="0" />
                  <el-option label="10 秒" :value="10000" />
                  <el-option label="30 秒" :value="30000" />
                  <el-option label="100 秒" :value="100000" />
                </el-select>
              </label>
              <label class="tdh-filter-field">
                <span class="ou-toolbar-label">IWAN服务</span>
                <el-select v-model="onlineSvcFilter" size="small" style="width:140px" clearable>
                  <el-option label="所有服务" value="" />
                  <el-option v-for="s in mapSvcOptions" :key="s.value" :label="s.label" :value="s.value" />
                </el-select>
              </label>
              <el-input v-model="onlineKeyword" size="small" placeholder="关键字搜索" style="width:200px" clearable>
                <template #prefix><el-icon><Search /></el-icon></template>
              </el-input>
              <button class="ou-search-btn" @click="doOnlineSearch"><el-icon><Search /></el-icon></button>
            </div>
            <div class="om-oms-toolbar-right">
              <button class="link-btn" @click="forceOffline">⏸ 强制下线</button>
              <button class="link-btn" @click="ElMessage.info('列设置（Mock）')">☰</button>
            </div>
          </div>
          <div class="ou-table-wrap om-oms-table-wrap">
            <table class="ou-table om-oms-table">
              <thead>
                <tr>
                  <th class="col-check"><el-checkbox v-model="onlineSelectAll" @change="onOnlineSelectAll" /></th>
                  <th class="col-idx" style="width:50px">序号</th>
                  <th>IWAN服务</th>
                  <th>账号</th>
                  <th>IP</th>
                  <th>状态</th>
                  <th class="ou-num">MTU</th>
                  <th>路由地址</th>
                  <th>连接信息</th>
                  <th class="ou-num">连接数</th>
                  <th class="ou-num">上行速率</th>
                  <th class="ou-num">下行速率</th>
                  <th>时长</th>
                  <th>在线时长</th>
                  <th>高级信息</th>
                  <th class="col-actions">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in pagedOnlineRows" :key="row.id">
                  <td class="col-check"><el-checkbox v-model="row.checked" /></td>
                  <td class="col-idx">{{ (onlinePage - 1) * onlinePageSize + i + 1 }}</td>
                  <td>{{ row.svc }}</td>
                  <td>{{ row.user }}</td>
                  <td><span class="nvt-link" @click="ElMessage.info(`IP画像 ${row.ip}（Mock）`)">{{ row.ip }}</span></td>
                  <td>
                    <span class="om-oms-status" :class="row.status">{{ row.statusText }}</span>
                  </td>
                  <td class="ou-num">{{ row.mtu }}</td>
                  <td>{{ row.route }}</td>
                  <td>{{ row.connInfo }}</td>
                  <td class="ou-num">{{ row.connCount }}</td>
                  <td class="ou-num">{{ row.upRate }}</td>
                  <td class="ou-num">{{ row.downRate }}</td>
                  <td>{{ row.duration }}</td>
                  <td>{{ row.onlineTime }}</td>
                  <td>{{ row.advanced }}</td>
                  <td class="col-actions">
                    <button class="link-btn" @click="ElMessage.info('诊断（Mock）')">诊断</button>
                    <button class="link-btn" @click="ElMessage.info('查看（Mock）')">查看</button>
                  </td>
                </tr>
                <tr v-if="pagedOnlineRows.length === 0">
                  <td colspan="16" class="ou-empty">无数据</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="ou-footer">
            <div class="ou-footer-left">
              <div class="ou-pager">
                <button class="ou-page-btn" :disabled="onlinePage <= 1" @click="onlinePage > 1 && onlinePage--">‹</button>
                <button v-for="pg in onlinePageArr" :key="pg" class="ou-page-btn" :class="{ active: pg === onlinePage }" @click="onlinePage = pg">{{ pg }}</button>
                <button class="ou-page-btn" :disabled="onlinePage >= onlineTotalPages" @click="onlinePage < onlineTotalPages && onlinePage++">›</button>
              </div>
              <label class="ou-page-goto">
                到第
                <input v-model.number="onlineGotoPage" class="ou-page-goto-input" type="text" />
                页
                <button class="ou-page-goto-btn" @click="goToOnlinePage">确定</button>
              </label>
            </div>
            <div class="ou-footer-right">
              <span>共 {{ filteredOnlineRows.length }} 条</span>
              <el-select v-model="onlinePageSize" size="small" style="width:110px">
                <el-option :value="20" label="20 条/页" />
                <el-option :value="50" label="50 条/页" />
                <el-option :value="100" label="100 条/页" />
              </el-select>
            </div>
          </div>
        </div>

        <!-- ============ 服务日志 Tab ============ -->
        <div class="om-oms-panel" :class="{ active: tab === 'service-log' }" role="tabpanel">
          <div class="ou-toolbar om-oms-toolbar">
            <el-input v-model="logKeyword" size="small" placeholder="关键字搜索" style="width:200px" clearable>
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
            <button class="ou-search-btn" @click="doLogSearch">搜索</button>
            <div class="om-oms-toolbar-right">
              <button class="link-btn" @click="ElMessage.info('导出（Mock）')">⬇ 导出</button>
            </div>
          </div>
          <div class="ou-table-wrap om-oms-table-wrap">
            <table class="ou-table om-oms-table">
              <thead>
                <tr>
                  <th class="col-idx" style="width:60px">序号</th>
                  <th>时间</th>
                  <th>服务</th>
                  <th>级别</th>
                  <th>内容</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in filteredLogRows" :key="i">
                  <td class="col-idx">{{ i + 1 }}</td>
                  <td>{{ row.time }}</td>
                  <td>{{ row.svc }}</td>
                  <td><span class="om-oms-level" :class="row.level === 'WARN' ? 'warn' : row.level === 'ERROR' ? 'error' : 'info'">{{ row.level }}</span></td>
                  <td>{{ row.content }}</td>
                </tr>
                <tr v-if="filteredLogRows.length === 0">
                  <td colspan="5" class="ou-empty">无数据</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 添加/编辑 服务 弹窗 ==================== -->
    <el-dialog v-model="addVisible" :title="isEdit ? `编辑服务 - ${form.name}` : '添加到NADIUS服务'" width="480px" :close-on-click-modal="false" destroy-on-close>
      <div class="om-oms-form">
        <div class="om-oms-row">
          <div class="om-oms-lbl"><span class="req">*</span>服务端名称</div>
          <div class="om-oms-ctrl"><el-input v-model="form.name" size="small" /></div>
        </div>
        <div class="om-oms-row">
          <div class="om-oms-lbl">服务端网关</div>
          <div class="om-oms-ctrl"><el-input v-model="form.gw" size="small" /></div>
        </div>
        <div class="om-oms-row">
          <div class="om-oms-lbl">MTU</div>
          <div class="om-oms-ctrl"><el-input-number v-model="form.mtu" :min="576" :max="9000" size="small" controls-position="right" style="width:100%" /></div>
        </div>
        <div class="om-oms-row">
          <div class="om-oms-lbl">认证方式</div>
          <div class="om-oms-ctrl">
            <el-select v-model="form.auth" size="small" style="width:100%">
              <el-option label="本地认证" value="local" />
              <el-option label="RADIUS" value="radius" />
              <el-option label="LDAP" value="ldap" />
              <el-option label="本地 + RADIUS" value="local+radius" />
            </el-select>
          </div>
        </div>
        <div class="om-oms-row">
          <div class="om-oms-lbl">地址组</div>
          <div class="om-oms-ctrl">
            <el-select v-model="form.group" size="small" style="width:100%">
              <el-option label="TempAccounts" value="TempAccounts" />
              <el-option label="DefaultGroup" value="DefaultGroup" />
              <el-option label="VIP" value="VIP" />
              <el-option label="Guest" value="Guest" />
            </el-select>
          </div>
        </div>
        <div class="om-oms-divider"></div>
        <div class="om-oms-row">
          <div class="om-oms-lbl">IPv6</div>
          <div class="om-oms-ctrl">
            <el-select v-model="form.ipv6" size="small" style="width:100%">
              <el-option label="关闭" value="off" />
              <el-option label="开启" value="on" />
            </el-select>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" size="small" @click="submitAdd">确定</el-button>
        <el-button size="small" @click="addVisible = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import '@/views/netvisor/nv-shared.css'

// ══════════════════════════════════════════════════════════════
// Tab 状态
// ═══════════════════════════════════════════════════════════
const tab = ref('service-list')

// ══════════════════════════════════════════════════════════════
// 服务列表
// ═══════════════════════════════════════════════════════════
const autoRefresh = ref(100000)
const keyword = ref('')
const page = ref(1)
const pageSize = ref(100)
const gotoPage = ref(1)
const selectAll = ref(false)

interface ServiceRow {
  id: number
  name: string
  gw: string
  dns: string
  mtu: number
  group: string
  auth: string
  radius: string
  online: number
  inRate: string
  outRate: string
  lines: string
  enabled: boolean
  checked: boolean
}

const serviceRows = ref<ServiceRow[]>([
  { id: 1, name: 'NADIUS-Default', gw: '192.168.6.1/24', dns: '8.8.8.8, 114.114.114.114', mtu: 1430, group: 'TempAccounts', auth: '本地认证', radius: '—', online: 128, inRate: '25.3 Mbps', outRate: '48.6 Mbps', lines: 'eth0, eth1', enabled: true, checked: false },
  { id: 2, name: 'NADIUS-VIP', gw: '10.0.0.1/16', dns: '8.8.4.4, 1.1.1.1', mtu: 1500, group: 'VIP', auth: 'RADIUS', radius: 'RADIUS-1', online: 32, inRate: '8.2 Mbps', outRate: '15.4 Mbps', lines: 'eth0', enabled: true, checked: false },
  { id: 3, name: 'NADIUS-Guest', gw: '172.16.0.1/12', dns: '114.114.114.114', mtu: 1430, group: 'Guest', auth: '本地 + RADIUS', radius: 'RADIUS-2', online: 8, inRate: '1.5 Mbps', outRate: '2.8 Mbps', lines: 'eth2', enabled: false, checked: false },
])

const filteredRows = computed(() => {
  if (!keyword.value) return serviceRows.value
  const k = keyword.value.toLowerCase()
  return serviceRows.value.filter(r =>
    r.name.toLowerCase().includes(k) ||
    r.gw.toLowerCase().includes(k) ||
    r.dns.toLowerCase().includes(k) ||
    r.group.toLowerCase().includes(k) ||
    r.auth.toLowerCase().includes(k) ||
    r.radius.toLowerCase().includes(k)
  )
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / pageSize.value)))
const pageArr = computed(() => {
  const t = totalPages.value
  if (t <= 5) return Array.from({ length: t }, (_, i) => i + 1)
  const arr: number[] = []
  const cur = page.value
  if (cur <= 3) arr.push(1, 2, 3, 4, 5)
  else if (cur >= t - 2) arr.push(t - 4, t - 3, t - 2, t - 1, t)
  else arr.push(cur - 2, cur - 1, cur, cur + 1, cur + 2)
  return arr
})
const pagedRows = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredRows.value.slice(start, start + pageSize.value)
})

function doSearch() { page.value = 1 }
function doReset() { keyword.value = ''; page.value = 1 }
function goToPage() {
  const p = Number(gotoPage.value)
  if (p >= 1 && p <= totalPages.value) page.value = p
}
function onSelectAll(v: boolean) { serviceRows.value.forEach(r => r.checked = v) }
function batchAct(act: string) {
  const cnt = serviceRows.value.filter(r => r.checked).length
  if (cnt === 0) { ElMessage.warning('请先勾选条目'); return }
  const actMap: Record<string, string> = { enable: '启用', start: '启动', del: '删除' }
  if (act === 'del') {
    ElMessageBox.confirm(`确定删除已选中的 ${cnt} 条服务吗？`, '提示', { type: 'warning' })
      .then(() => {
        for (let i = serviceRows.value.length - 1; i >= 0; i--) {
          if (serviceRows.value[i].checked) serviceRows.value.splice(i, 1)
        }
        ElMessage.success('已删除（Mock）')
      }).catch(() => {})
  } else {
    ElMessage.success(`已对 ${cnt} 条服务执行${actMap[act]}（Mock）`)
  }
}
function delRow(r: ServiceRow) {
  ElMessageBox.confirm(`确定删除服务 ${r.name} 吗？`, '提示', { type: 'warning' })
    .then(() => {
      const i = serviceRows.value.findIndex(x => x.id === r.id)
      if (i > -1) serviceRows.value.splice(i, 1)
      ElMessage.success('已删除（Mock）')
    }).catch(() => {})
}

// ══════════════════════════════════════════════════════════════
// 添加/编辑 弹窗
// ═══════════════════════════════════════════════════════════
const addVisible = ref(false)
const isEdit = ref(false)
const form = reactive({
  id: 0,
  name: '',
  gw: '',
  mtu: 1430,
  auth: 'local',
  group: 'TempAccounts',
  ipv6: 'off',
})

function openAdd() {
  isEdit.value = false
  Object.assign(form, { id: 0, name: '', gw: '', mtu: 1430, auth: 'local', group: 'TempAccounts', ipv6: 'off' })
  addVisible.value = true
}
function openEdit(r: ServiceRow) {
  isEdit.value = true
  Object.assign(form, {
    id: r.id, name: r.name, gw: r.gw, mtu: r.mtu,
    auth: r.auth === '本地认证' ? 'local' : r.auth === 'RADIUS' ? 'radius' : r.auth === '本地 + RADIUS' ? 'local+radius' : 'local',
    group: r.group, ipv6: 'off',
  })
  addVisible.value = true
}
function submitAdd() {
  if (!form.name) { ElMessage.warning('请输入服务端名称'); return }
  const authMap: Record<string, string> = { local: '本地认证', radius: 'RADIUS', ldap: 'LDAP', 'local+radius': '本地 + RADIUS' }
  if (isEdit.value) {
    const r = serviceRows.value.find(x => x.id === form.id)
    if (r) {
      r.name = form.name
      r.gw = form.gw
      r.mtu = form.mtu
      r.group = form.group
      r.auth = authMap[form.auth] || form.auth
    }
    ElMessage.success('已保存（Mock）')
  } else {
    serviceRows.value.unshift({
      id: Date.now(), name: form.name, gw: form.gw, dns: '', mtu: form.mtu,
      group: form.group, auth: authMap[form.auth] || form.auth, radius: form.auth.includes('radius') ? 'RADIUS-1' : '—',
      online: 0, inRate: '0', outRate: '0', lines: 'all',
      enabled: true, checked: false,
    })
    ElMessage.success('已添加（Mock）')
  }
  addVisible.value = false
}

// ══════════════════════════════════════════════════════════════
// 服务映射 Tab
// ═══════════════════════════════════════════════════════════
interface MapRow { id: number; line: string; port: string; svc: string; count: number; createdAt: string }

const mapKeyword = ref('')
const accessCount = ref(0)
const mapForm = reactive({ line: '', port: '8080', svc: '' })
const mapLineOptions = [
  { value: 'eth0', label: 'eth0' },
  { value: 'eth1', label: 'eth1' },
  { value: 'eth2', label: 'eth2' },
]
const mapSvcOptions = [
  { value: 'NADIUS-Default', label: 'NADIUS-Default' },
  { value: 'NADIUS-VIP', label: 'NADIUS-VIP' },
  { value: 'NADIUS-Guest', label: 'NADIUS-Guest' },
]
const mapRows = ref<MapRow[]>([
  { id: 1, line: 'eth0', port: '80', svc: 'NADIUS-Default', count: 5248, createdAt: '2026-06-15 10:30:25' },
  { id: 2, line: 'eth0', port: '443', svc: 'NADIUS-Default', count: 12864, createdAt: '2026-06-15 10:31:00' },
  { id: 3, line: 'eth1', port: '8080', svc: 'NADIUS-VIP', count: 1568, createdAt: '2026-06-15 11:05:42' },
  { id: 4, line: 'eth2', port: '53', svc: 'NADIUS-Guest', count: 32, createdAt: '2026-06-15 12:00:00' },
])
const filteredMapRows = computed(() => {
  if (!mapKeyword.value) return mapRows.value
  const k = mapKeyword.value.toLowerCase()
  return mapRows.value.filter(r => r.line.toLowerCase().includes(k) || r.svc.toLowerCase().includes(k) || String(r.port).includes(k))
})
function doMapSearch() {}
function submitMap() {
  if (!mapForm.line) { ElMessage.warning('请选择映射线路'); return }
  if (!mapForm.port) { ElMessage.warning('请输入映射端口'); return }
  if (!mapForm.svc) { ElMessage.warning('请选择IWAN服务'); return }
  mapRows.value.unshift({
    id: Date.now(), line: mapForm.line, port: mapForm.port, svc: mapForm.svc,
    count: 0, createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
  })
  ElMessage.success('已添加映射（Mock）')
  mapForm.port = '8080'
}
function delMap(r: MapRow) {
  ElMessageBox.confirm(`确定删除该映射吗？`, '提示', { type: 'warning' })
    .then(() => {
      const i = mapRows.value.findIndex(x => x.id === r.id)
      if (i > -1) mapRows.value.splice(i, 1)
      ElMessage.success('已删除（Mock）')
    }).catch(() => {})
}

// ══════════════════════════════════════════════════════════════
// 在线用户 Tab
// ═══════════════════════════════════════════════════════════
const onlineKeyword = ref('')
const onlineSvcFilter = ref('')
const onlineSelectAll = ref(false)
const onlinePage = ref(1)
const onlinePageSize = ref(100)
const onlineGotoPage = ref(1)

interface OnlineRow {
  id: number
  svc: string
  user: string
  ip: string
  status: 'online' | 'idle' | 'busy'
  statusText: string
  mtu: number
  route: string
  connInfo: string
  connCount: number
  upRate: string
  downRate: string
  duration: string
  onlineTime: string
  advanced: string
  checked: boolean
}

const onlineRows = ref<OnlineRow[]>([
  { id: 1, svc: 'NADIUS-Default', user: 'zhangsan', ip: '192.168.6.100', status: 'online', statusText: '在线', mtu: 1430, route: '192.168.6.0/24', connInfo: 'TCP/8080', connCount: 12, upRate: '125.6 Mbps', downRate: '48.2 Mbps', duration: '2h 15m', onlineTime: '2026-06-15 10:30:25', advanced: 'VIP客户', checked: false },
  { id: 2, svc: 'NADIUS-VIP', user: 'lisi', ip: '192.168.6.101', status: 'online', statusText: '在线', mtu: 1500, route: '10.0.0.0/16', connInfo: 'TCP/443', connCount: 28, upRate: '348.2 Mbps', downRate: '128.5 Mbps', duration: '3h 27m', onlineTime: '2026-06-15 09:18:42', advanced: 'VIP白金', checked: false },
  { id: 3, svc: 'NADIUS-Default', user: 'wangwu', ip: '10.0.0.50', status: 'busy', statusText: '繁忙', mtu: 1430, route: '192.168.6.0/24', connInfo: 'TCP/80', connCount: 45, upRate: '86.5 Mbps', downRate: '24.8 Mbps', duration: '1h 40m', onlineTime: '2026-06-15 11:05:00', advanced: '普通客户', checked: false },
  { id: 4, svc: 'NADIUS-Guest', user: 'guest01', ip: '172.16.0.20', status: 'idle', statusText: '空闲', mtu: 1430, route: '172.16.0.0/12', connInfo: 'TCP/22', connCount: 2, upRate: '12.3 Mbps', downRate: '5.6 Mbps', duration: '45m', onlineTime: '2026-06-15 12:00:00', advanced: '访客', checked: false },
  { id: 5, svc: 'NADIUS-Default', user: 'zhaoliu', ip: '192.168.6.105', status: 'online', statusText: '在线', mtu: 1430, route: '192.168.6.0/24', connInfo: 'TCP/8080', connCount: 8, upRate: '52.4 Mbps', downRate: '18.2 Mbps', duration: '5h 12m', onlineTime: '2026-06-15 07:18:00', advanced: '普通客户', checked: false },
  { id: 6, svc: 'NADIUS-VIP', user: 'sunqi', ip: '10.0.0.88', status: 'busy', statusText: '繁忙', mtu: 1500, route: '10.0.0.0/16', connInfo: 'TCP/443', connCount: 18, upRate: '256.8 Mbps', downRate: '95.4 Mbps', duration: '6h 32m', onlineTime: '2026-06-15 05:58:00', advanced: 'VIP黄金', checked: false },
])

const filteredOnlineRows = computed(() => {
  return onlineRows.value.filter(r => {
    if (onlineSvcFilter.value && r.svc !== onlineSvcFilter.value) return false
    if (onlineKeyword.value) {
      const k = onlineKeyword.value.toLowerCase()
      if (!r.user.toLowerCase().includes(k) && !r.svc.toLowerCase().includes(k) && !r.ip.includes(k) && !r.route.toLowerCase().includes(k)) return false
    }
    return true
  })
})

const onlineTotalPages = computed(() => Math.max(1, Math.ceil(filteredOnlineRows.value.length / onlinePageSize.value)))
const onlinePageArr = computed(() => {
  const t = onlineTotalPages.value
  if (t <= 5) return Array.from({ length: t }, (_, i) => i + 1)
  const arr: number[] = []
  const cur = onlinePage.value
  if (cur <= 3) arr.push(1, 2, 3, 4, 5)
  else if (cur >= t - 2) arr.push(t - 4, t - 3, t - 2, t - 1, t)
  else arr.push(cur - 2, cur - 1, cur, cur + 1, cur + 2)
  return arr
})
const pagedOnlineRows = computed(() => {
  const start = (onlinePage.value - 1) * onlinePageSize.value
  return filteredOnlineRows.value.slice(start, start + onlinePageSize.value)
})

function onOnlineSelectAll(v: boolean) { onlineRows.value.forEach(r => r.checked = v) }
function doOnlineSearch() { onlinePage.value = 1 }
function goToOnlinePage() {
  const p = Number(onlineGotoPage.value)
  if (p >= 1 && p <= onlineTotalPages.value) onlinePage.value = p
}
function forceOffline() {
  const cnt = onlineRows.value.filter(r => r.checked).length
  if (cnt === 0) { ElMessage.warning('请先勾选用户'); return }
  ElMessageBox.confirm(`确定对选中的 ${cnt} 个用户执行强制下线吗？`, '提示', { type: 'warning' })
    .then(() => {
      for (let i = onlineRows.value.length - 1; i >= 0; i--) {
        if (onlineRows.value[i].checked) onlineRows.value.splice(i, 1)
      }
      ElMessage.success(`已下线 ${cnt} 个用户（Mock）`)
    }).catch(() => {})
}

// ══════════════════════════════════════════════════════════════
// 服务日志 Tab
// ═══════════════════════════════════════════════════════════
const logKeyword = ref('')
const logRows = ref([
  { time: '2026-06-15 14:30:28', svc: 'NADIUS-Default', level: 'INFO', content: '用户 zhangsan 登录成功' },
  { time: '2026-06-15 14:28:42', svc: 'NADIUS-Default', level: 'WARN', content: '用户 admin 密码错误' },
  { time: '2026-06-15 14:25:00', svc: 'NADIUS-VIP', level: 'INFO', content: '服务启动完成' },
  { time: '2026-06-15 14:20:00', svc: 'NADIUS-Default', level: 'ERROR', content: 'RADIUS 服务器连接超时' },
  { time: '2026-06-15 14:15:00', svc: 'NADIUS-Guest', level: 'INFO', content: '用户 guest01 登录成功' },
  { time: '2026-06-15 14:10:00', svc: 'NADIUS-Default', level: 'WARN', content: '会话超时，用户 lisi 被强制下线' },
])
const filteredLogRows = computed(() => {
  if (!logKeyword.value) return logRows.value
  const k = logKeyword.value.toLowerCase()
  return logRows.value.filter(r => r.svc.toLowerCase().includes(k) || r.content.toLowerCase().includes(k) || r.level.toLowerCase().includes(k))
})
function doLogSearch() {}
</script>

<style scoped>
.nv-border-card { display:flex; flex-direction:column; height:100%; min-height:0; border:1px solid #e4e7ed; border-radius:4px; background:#fff; overflow:hidden; }
.nv-tabs-header { flex-shrink:0; padding:0 16px; border-bottom:1px solid #e4e7ed; background:#fafafa; }
.nv-tabs-nav { display:flex; }
.nv-tab { position:relative; padding:12px 20px; border:none; background:transparent; font-size:14px; font-weight:600; color:#606266; cursor:pointer; }
.nv-tab.active { color:#409eff; }
.nv-tab.active::after { content:''; position:absolute; bottom:0; left:20px; right:20px; height:2px; background:#409eff; }
.nv-tabs-body { flex:1; min-height:0; overflow:hidden; }

.om-oms-page { display:flex; flex-direction:column; height:100%; }
.om-oms-panel { display:none; flex-direction:column; flex:1; min-height:0; }
.om-oms-panel.active { display:flex; }
.om-oms-toolbar { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; padding:10px 14px; border-bottom:1px solid #ebeef5; }
.om-oms-toolbar-left, .om-oms-toolbar-right { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.om-oms-toolbar-right { margin-left:auto; }

.ou-table-wrap { flex:1; min-height:0; overflow:auto; }
.ou-table { width:100%; border-collapse:collapse; font-size:12px; }
.ou-table th { background:#fafbfc; border-bottom:1px solid #ebeef5; padding:8px 10px; text-align:left; font-weight:600; color:#606266; white-space:nowrap; }
.ou-table td { border-bottom:1px solid #f0f2f5; padding:7px 10px; color:#303133; }
.ou-table .ou-num { text-align:right; }
.ou-empty { text-align:center; color:#909399; padding:24px 10px !important; }

.col-check { width:40px; text-align:center; }
.col-idx { width:60px; text-align:center; }
.col-mtu { width:60px; text-align:right; }
.col-actions { width:160px; white-space:nowrap; text-align:center; }

.nvt-link { color:#409eff; cursor:pointer; text-decoration:underline; }

.ou-footer { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; border-top:1px solid #ebeef5; font-size:12px; color:#606266; flex-wrap:wrap; gap:8px; }
.ou-footer-left, .ou-footer-right { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.ou-pager { display:flex; gap:4px; }
.ou-page-btn { min-width:28px; height:28px; border:1px solid #dcdfe6; border-radius:4px; background:#fff; font-size:12px; cursor:pointer; }
.ou-page-btn.active { background:#409eff; color:#fff; border-color:#409eff; }
.ou-page-btn:disabled { opacity:.55; cursor:not-allowed; }
.ou-page-goto { display:inline-flex; align-items:center; gap:4px; }
.ou-page-goto-input { width:40px; height:24px; text-align:center; border:1px solid #dcdfe6; border-radius:3px; font-size:12px; }
.ou-page-goto-btn { height:24px; padding:0 8px; border:1px solid #dcdfe6; border-radius:3px; background:#fff; font-size:12px; cursor:pointer; }

.ou-search-btn { height:30px; padding:0 14px; border:1px solid #409eff; border-radius:4px; background:#409eff; color:#fff; font-size:13px; cursor:pointer; display:inline-flex; align-items:center; }
.secondary { height:30px; padding:0 14px; border:1px solid #dcdfe6; border-radius:4px; background:#fff; color:#606266; font-size:13px; cursor:pointer; }
.link-btn { border:none; background:transparent; color:#409eff; font-size:13px; cursor:pointer; padding:4px 6px; display:inline-flex; align-items:center; }
.link-btn.add-btn { color:#f56c6c; font-weight:500; }

/* 服务映射表单 */
.om-oms-map-form {
  display:grid;
  grid-template-columns: 1fr 1fr 1fr 1fr auto;
  gap:14px;
  padding:12px 14px;
  border:1px solid #ebeef5;
  border-radius:4px;
  background:#fafbfc;
  margin:12px 14px;
  align-items:center;
}
.om-oms-map-field { display:flex; align-items:center; gap:8px; }
.om-oms-map-field-static { color:#606266; }
.om-oms-map-field-action { display:flex; align-items:center; gap:8px; }
.om-oms-map-count { font-size:13px; color:#909399; }
.om-oms-map-table-wrap { padding:0 14px 12px; }
.om-oms-map-form .ou-toolbar-label { width:64px; text-align:right; }
.om-oms-form { padding:4px 4px; }
.om-oms-row { display:flex; align-items:center; gap:14px; padding:8px 0; }
.om-oms-lbl { width:100px; text-align:right; color:#606266; font-size:13px; flex-shrink:0; }
.om-oms-ctrl { flex:1; }
.om-oms-divider { height:1px; background:#e4e7ed; margin:14px -4px 8px; }
.req { color:#f56c6c; margin-right:2px; }

/* 日志级别 */
.om-oms-level { display:inline-block; padding:2px 8px; font-size:11px; border-radius:3px; font-weight:500; }
.om-oms-level.info { background:#f0f9eb; color:#67c23a; }
.om-oms-level.warn { background:#fdf6ec; color:#e6a23c; }
.om-oms-level.error { background:#fef0f0; color:#f56c6c; }
</style>
