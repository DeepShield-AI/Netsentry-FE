<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav" role="tablist" aria-label="质量白名单">
        <button type="button" class="nv-tab active" role="tab">质量白名单</button>
      </div>
    </div>
    <div class="nv-tabs-body">
      <div class="pqwl-page">
        <!-- 工具栏 -->
        <div class="ou-toolbar pqwl-toolbar">
          <div class="pqwl-toolbar-left">
            <label class="ou-toolbar-item">
              <span class="ou-toolbar-label">自动刷新</span>
              <el-select v-model="autoRefresh" size="small" style="width:100px">
                <el-option label="关闭" :value="0" />
                <el-option label="10 秒" :value="10000" />
                <el-option label="30 秒" :value="30000" />
                <el-option label="60 秒" :value="60000" />
              </el-select>
            </label>
            <label class="ou-toolbar-item">
              <span class="ou-toolbar-label">所有状态</span>
              <el-select v-model="statusFilter" size="small" style="width:110px">
                <el-option label="所有状态" value="all" />
                <el-option label="已启用" value="on" />
                <el-option label="已停用" value="off" />
              </el-select>
            </label>
            <label class="ou-toolbar-item pqwl-search">
              <el-input v-model="keyword" placeholder="关键字搜索" size="small" style="width:200px" clearable>
                <template #prefix><el-icon><Search /></el-icon></template>
              </el-input>
            </label>
            <button class="ou-search-btn" @click="doSearch"><el-icon><Search /></el-icon></button>
            <button class="secondary td-reset-btn" @click="doReset">重置</button>
          </div>
          <div class="pqwl-toolbar-actions">
            <button class="link-btn" @click="batchEnable">启用</button>
            <button class="link-btn" @click="batchOp">批量操作</button>
            <button class="link-btn" @click="openAdd"><el-icon><Plus /></el-icon>&nbsp;添加</button>
          </div>
        </div>

        <!-- 表格 -->
        <div class="ou-table-wrap">
          <table class="ou-table">
            <thead>
              <tr>
                <th class="col-check"><el-checkbox v-model="selectAll" @change="onSelectAll" /></th>
                <th style="width:60px">序号</th>
                <th>内网地址</th>
                <th>外网地址</th>
                <th>协议</th>
                <th>应用</th>
                <th class="ou-num">匹配次数</th>
                <th class="col-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, i) in pagedRows" :key="r.id">
                <td><el-checkbox v-model="r.checked" /></td>
                <td>{{ (page - 1) * pageSize + i + 1 }}</td>
                <td>
                  <div class="pqwl-addr-cell">
                    <span class="pqwl-ip-link" @click="openProfile('inner', r.innerIp)">{{ r.innerIp }}</span>
                    <span class="pqwl-colon">:</span>
                    <span>{{ r.innerPort }}</span>
                  </div>
                </td>
                <td>
                  <div class="pqwl-addr-cell">
                    <span class="pqwl-ip-link" @click="openProfile('outer', r.outerIp)">{{ r.outerIp }}</span>
                    <span class="pqwl-colon">:</span>
                    <span>{{ r.outerPort }}</span>
                  </div>
                </td>
                <td>{{ r.proto }}</td>
                <td>{{ r.app }}</td>
                <td class="ou-num">{{ r.matchCount.toLocaleString() }}</td>
                <td class="col-actions">
                  <el-switch v-model="r.enabled" size="small" />
                  <button class="link-btn" @click="editRow(r)">编辑</button>
                  <button class="link-btn danger" @click="delRow(r)">删除</button>
                </td>
              </tr>
              <tr v-if="pagedRows.length === 0">
                <td colspan="8" class="ou-empty">无数据</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 分页 -->
        <div class="ou-footer">
          <div class="ou-footer-left">
            <div class="ou-pager">
              <button class="ou-page-btn" :disabled="page <= 1" @click="page > 1 && page--">‹</button>
              <button v-for="pg in pageArr" :key="pg" class="ou-page-btn" :class="{ active: pg === page }" @click="page = pg">{{ pg }}</button>
              <button class="ou-page-btn" :disabled="page >= totalPages" @click="page < totalPages && page++">›</button>
            </div>
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
    </div>

    <!-- ==================== 添加/编辑白名单弹窗 ==================== -->
    <el-dialog
      v-model="addVisible"
      :title="editId ? '编辑白名单' : '添加白名单'"
      width="640px"
      :close-on-click-modal="false"
      destroy-on-close
      class="pqwl-add-dialog"
    >
      <div class="pqwl-add-form">
        <div class="pqwl-form-row">
          <div class="pqwl-form-label">策略序号</div>
          <div class="pqwl-form-control">
            <el-input v-model="form.seq" placeholder="" size="small" style="width:240px" />
            <span class="pqwl-form-hint">序号从小到大匹配，范围1-65535</span>
          </div>
        </div>

        <div class="pqwl-form-row">
          <div class="pqwl-form-label">内网地址：端口</div>
          <div class="pqwl-form-control pqwl-addr-row">
            <el-select v-model="form.innerAddrType" size="small" style="width:120px">
              <el-option label="任意" value="any" />
              <el-option label="等于" value="eq" />
              <el-option label="不属于" value="nin" />
            </el-select>
            <el-input v-model="form.innerAddr" placeholder="" size="small" style="width:200px" />
            <span class="pqwl-colon">:</span>
            <el-input v-model="form.innerPort" placeholder="0" size="small" style="width:100px" />
          </div>
        </div>

        <div class="pqwl-form-row">
          <div class="pqwl-form-label">目标地址：端口</div>
          <div class="pqwl-form-control pqwl-addr-row">
            <el-select v-model="form.outerAddrType" size="small" style="width:120px">
              <el-option label="任意" value="any" />
              <el-option label="等于" value="eq" />
              <el-option label="不属于" value="nin" />
            </el-select>
            <el-input v-model="form.outerAddr" placeholder="" size="small" style="width:200px" />
            <span class="pqwl-colon">:</span>
            <el-input v-model="form.outerPort" placeholder="0" size="small" style="width:100px" />
          </div>
        </div>

        <div class="pqwl-form-row">
          <div class="pqwl-form-label">应用协议</div>
          <div class="pqwl-form-control pqwl-addr-row">
            <el-select v-model="form.protoType" size="small" style="width:120px">
              <el-option label="任意" value="any" />
              <el-option label="等于" value="eq" />
              <el-option label="不属于" value="nin" />
            </el-select>
            <el-input v-model="form.proto" placeholder="任意" size="small" style="width:200px" />
            <span class="pqwl-pick-link" @click="openProtoPicker">
              <el-icon><Search /></el-icon>&nbsp;选择协议
            </span>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="pqwl-dialog-footer">
          <el-button type="primary" size="small" @click="submitAdd">确定</el-button>
          <el-button size="small" @click="addVisible = false">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { Search, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import './nv-shared.css'

// ══════════════════════════════════════════════════════════════
// 筛选与分页
// ═══════════════════════════════════════════════════════════
const autoRefresh = ref(10000)
const statusFilter = ref('all')
const keyword = ref('')
const page = ref(1)
const pageSize = ref(20)
const selectAll = ref(false)

function doSearch() {
  page.value = 1
}
function doReset() {
  keyword.value = ''
  statusFilter.value = 'all'
  page.value = 1
}
function onSelectAll(v: boolean) {
  filteredRows.value.forEach(r => r.checked = v)
}

// ══════════════════════════════════════════════════════════════
// Mock 数据
// ═══════════════════════════════════════════════════════════
interface WlRow {
  id: number
  innerIp: string
  innerPort: string
  outerIp: string
  outerPort: string
  proto: string
  app: string
  matchCount: number
  enabled: boolean
  checked: boolean
}

const innerIps = ['192.168.1.10', '192.168.1.11', '10.0.0.1', '10.0.0.2', '172.16.0.5', '172.16.0.6', '192.168.5.21', '192.168.5.22', '10.10.10.8', '172.18.0.99']
const outerIps = ['8.8.8.8', '114.114.114.114', '203.208.32.1', '180.97.33.108', '202.108.22.5', '140.205.94.189', '47.95.164.112', '120.92.49.205', '39.156.69.79', '1.1.1.1']
const protos = ['TCP', 'UDP', 'TCP', 'TCP', 'UDP', 'TCP', 'TCP', 'TCP', 'UDP', 'TCP']
const apps = ['HTTP', 'HTTPS', 'DNS', 'SSH', 'FTP', 'SMTP', 'TELNET', 'MySQL', 'Redis', 'RDP']

const rows = ref<WlRow[]>(Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  innerIp: innerIps[i % innerIps.length],
  innerPort: String([0, 80, 443, 22, 21, 25, 23, 3306, 6379, 3389][i % 10]),
  outerIp: outerIps[i % outerIps.length],
  outerPort: String([0, 80, 443, 53, 22, 8080, 25, 1433, 6379, 3389][i % 10]),
  proto: protos[i % protos.length],
  app: apps[i % apps.length],
  matchCount: Math.floor(Math.random() * 9000) + 100,
  enabled: i % 4 !== 0,
  checked: false,
})))

const filteredRows = computed(() => {
  return rows.value.filter(r => {
    if (statusFilter.value === 'on' && !r.enabled) return false
    if (statusFilter.value === 'off' && r.enabled) return false
    if (keyword.value) {
      const k = keyword.value.toLowerCase()
      const inAddr = `${r.innerIp}:${r.innerPort}`.toLowerCase()
      const outAddr = `${r.outerIp}:${r.outerPort}`.toLowerCase()
      if (!inAddr.includes(k) && !outAddr.includes(k) && !r.proto.toLowerCase().includes(k) && !r.app.toLowerCase().includes(k)) {
        return false
      }
    }
    return true
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / pageSize.value)))
const pageArr = computed(() => {
  const t = totalPages.value
  if (t <= 5) return Array.from({ length: t }, (_, i) => i + 1)
  const arr: number[] = []
  const cur = page.value
  if (cur <= 3) { arr.push(1, 2, 3, 4, 5) }
  else if (cur >= t - 2) { arr.push(t - 4, t - 3, t - 2, t - 1, t) }
  else { arr.push(cur - 2, cur - 1, cur, cur + 1, cur + 2) }
  return arr
})
const pagedRows = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredRows.value.slice(start, start + pageSize.value)
})

// ══════════════════════════════════════════════════════════════
// 表格操作
// ═══════════════════════════════════════════════════════════
function batchEnable() {
  const on = rows.value.filter(r => r.checked).length
  if (on === 0) { ElMessage.warning('请先选择要启用的条目'); return }
  rows.value.forEach(r => { if (r.checked) r.enabled = true })
  ElMessage.success(`已启用 ${on} 条`)
}
function batchOp() {
  ElMessage.info('批量操作（Mock）')
}
function editRow(r: WlRow) {
  editId.value = r.id
  Object.assign(form, {
    seq: String(r.id),
    innerAddrType: 'any', innerAddr: r.innerIp, innerPort: r.innerPort,
    outerAddrType: 'any', outerAddr: r.outerIp, outerPort: r.outerPort,
    protoType: 'eq', proto: r.app,
  })
  addVisible.value = true
}
function delRow(r: WlRow) {
  ElMessageBox.confirm(`确定删除策略 ${r.id} 吗？`, '提示', { type: 'warning' })
    .then(() => {
      const i = rows.value.findIndex(x => x.id === r.id)
      if (i > -1) rows.value.splice(i, 1)
      ElMessage.success('已删除（Mock）')
    }).catch(() => {})
}
function openProfile(type: 'inner' | 'outer', ip: string) {
  ElMessage.info(`打开 ${type === 'inner' ? '内网' : '外网'} IP 画像：${ip}（Mock）`)
}

// ══════════════════════════════════════════════════════════════
// 添加/编辑白名单
// ═══════════════════════════════════════════════════════════
const addVisible = ref(false)
const editId = ref<number | null>(null)

const form = reactive({
  seq: '',
  innerAddrType: 'any',
  innerAddr: '',
  innerPort: '0',
  outerAddrType: 'any',
  outerAddr: '',
  outerPort: '0',
  protoType: 'any',
  proto: '任意',
})

function openAdd() {
  editId.value = null
  Object.assign(form, {
    seq: String(rows.value.length + 1),
    innerAddrType: 'any', innerAddr: '', innerPort: '0',
    outerAddrType: 'any', outerAddr: '', outerPort: '0',
    protoType: 'any', proto: '任意',
  })
  addVisible.value = true
}

function openProtoPicker() {
  ElMessage.info('打开协议选择器（Mock）')
}

function submitAdd() {
  if (!form.seq) { ElMessage.warning('请输入策略序号'); return }
  if (editId.value !== null) {
    const r = rows.value.find(x => x.id === editId.value)
    if (r) {
      r.innerIp = form.innerAddr || r.innerIp
      r.innerPort = form.innerPort
      r.outerIp = form.outerAddr || r.outerIp
      r.outerPort = form.outerPort
      r.proto = form.proto
      r.app = form.proto
    }
    ElMessage.success('修改成功（Mock）')
  } else {
    rows.value.unshift({
      id: Date.now(),
      innerIp: form.innerAddr || '0.0.0.0',
      innerPort: form.innerPort || '0',
      outerIp: form.outerAddr || '0.0.0.0',
      outerPort: form.outerPort || '0',
      proto: form.proto,
      app: form.proto,
      matchCount: 0,
      enabled: true,
      checked: false,
    })
    ElMessage({
      message: '匹配条目将以白名单形式插入到系统中并立即生效。',
      type: 'success',
      duration: 4000,
    })
  }
  addVisible.value = false
}
</script>

<style scoped>
.nv-border-card { display:flex; flex-direction:column; height:100%; min-height:0; border:1px solid #e4e7ed; border-radius:4px; background:#fff; overflow:hidden; }
.nv-tabs-header { flex-shrink:0; padding:0 16px; border-bottom:1px solid #e4e7ed; background:#fafafa; }
.nv-tabs-nav { display:flex; }
.nv-tab { position:relative; padding:12px 20px; border:none; background:transparent; font-size:14px; font-weight:600; color:#606266; cursor:pointer; }
.nv-tab.active { color:#409eff; }
.nv-tab.active::after { content:''; position:absolute; bottom:0; left:20px; right:20px; height:2px; background:#409eff; }
.nv-tabs-body { flex:1; min-height:0; overflow:auto; }

.pqwl-page { display:flex; flex-direction:column; height:100%; }
.ou-toolbar { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; border-bottom:1px solid #ebeef5; flex-wrap:wrap; gap:8px; }
.pqwl-toolbar-left { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.pqwl-toolbar-actions { display:flex; align-items:center; gap:8px; }
.ou-toolbar-item { display:flex; align-items:center; gap:4px; }
.ou-toolbar-label { font-size:13px; color:#606266; white-space:nowrap; }
.ou-search-btn { height:30px; padding:0 14px; border:1px solid #409eff; border-radius:4px; background:#409eff; color:#fff; font-size:13px; cursor:pointer; display:flex; align-items:center; }
.secondary { height:30px; padding:0 14px; border:1px solid #dcdfe6; border-radius:4px; background:#fff; color:#606266; font-size:13px; cursor:pointer; }
.link-btn { border:none; background:transparent; color:#409eff; font-size:13px; cursor:pointer; padding:4px 8px; display:inline-flex; align-items:center; }
.link-btn.danger { color:#f56c6c; }

.ou-table-wrap { flex:1; overflow:auto; }
.ou-table { width:100%; border-collapse:collapse; font-size:12px; }
.ou-table th { background:#fafbfc; border-bottom:1px solid #ebeef5; padding:8px 10px; text-align:left; font-weight:600; color:#606266; white-space:nowrap; }
.ou-table td { border-bottom:1px solid #f0f2f5; padding:7px 10px; color:#303133; }
.ou-table .ou-num { text-align:right; }
.ou-empty { text-align:center; color:#909399; padding:24px 10px !important; }
.col-check { width:40px; text-align:center; }
.col-actions { white-space:nowrap; }

.pqwl-addr-cell { display:flex; align-items:center; gap:4px; }
.pqwl-colon { color:#909399; }
.pqwl-ip-link { color:#409eff; cursor:pointer; text-decoration:underline; }

.ou-footer { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; border-top:1px solid #ebeef5; font-size:12px; color:#606266; }
.ou-pager { display:flex; gap:4px; }
.ou-page-btn { min-width:28px; height:28px; border:1px solid #dcdfe6; border-radius:4px; background:#fff; font-size:12px; cursor:pointer; }
.ou-page-btn.active { background:#409eff; color:#fff; border-color:#409eff; }
.ou-page-btn:disabled { opacity:.55; cursor:not-allowed; }
.ou-footer-right { display:flex; align-items:center; gap:10px; }

/* 添加白名单弹窗 */
.pqwl-add-form { padding:4px 0; }
.pqwl-form-row { display:flex; align-items:center; gap:14px; padding:8px 4px; }
.pqwl-form-label { width:120px; text-align:right; color:#606266; font-size:13px; flex-shrink:0; }
.pqwl-form-control { display:flex; align-items:center; gap:8px; flex:1; }
.pqwl-form-hint { color:#909399; font-size:12px; }
.pqwl-addr-row { display:flex; align-items:center; gap:8px; }
.pqwl-pick-link { color:#409eff; cursor:pointer; font-size:12px; display:inline-flex; align-items:center; }
.pqwl-dialog-footer { display:flex; justify-content:flex-end; gap:8px; }
</style>
