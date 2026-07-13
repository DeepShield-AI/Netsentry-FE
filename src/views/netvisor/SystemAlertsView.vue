<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav" role="tablist">
        <button type="button" class="nv-tab" :class="{ active: activeTab === 'feed' }" role="tab" @click="activeTab = 'feed'">告警列表</button>
        <button type="button" class="nv-tab" :class="{ active: activeTab === 'rules' }" role="tab" @click="activeTab = 'rules'">告警策略</button>
      </div>
    </div>
    <div class="nv-tabs-body">

      <!-- 告警列表 -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'feed' }">
        <div class="ou-toolbar">
          <div class="ou-toolbar-item"><span class="ou-toolbar-label">威胁等级</span>
            <select v-model="filterLevel" class="ou-toolbar-select">
              <option value="">全部</option><option value="critical">严重 (critical)</option><option value="error">错误 (error)</option><option value="warning">警告 (warning)</option><option value="info">信息 (info)</option>
            </select>
          </div>
          <div class="ou-toolbar-item"><span class="ou-toolbar-label">规则类型</span>
            <select v-model="filterRuleType" class="ou-toolbar-select">
              <option value="">全部</option><option value="dst_ip">目标 IP</option><option value="dns">DNS</option><option value="http">HTTP</option><option value="icmp">ICMP</option><option value="process">进程</option>
            </select>
          </div>
          <div class="ou-toolbar-item"><span class="ou-toolbar-label">确认状态</span>
            <select v-model="filterAck" class="ou-toolbar-select"><option value="">全部</option><option value="false">未确认</option><option value="true">已确认</option></select>
          </div>
          <div class="ou-toolbar-item"><span class="ou-toolbar-label">自动刷新</span>
            <select v-model.number="refreshInterval" class="ou-toolbar-select" @change="onRefreshChange">
              <option :value="0">不刷新</option><option :value="30000">30 秒</option><option :value="60000">60 秒</option>
            </select>
          </div>
          <button type="button" class="ou-search-btn" @click="load">刷新</button>
          <button type="button" class="ou-search-btn" @click="reset">重置</button>
        </div>
        <div class="ou-table-wrap">
          <table class="ou-table sa-table">
            <thead><tr><th class="col-idx">序号</th><th>探针</th><th>最近触发</th><th>威胁等级</th><th>规则名称</th><th>规则类型</th><th>触发对象</th><th>源 IP</th><th>目标 IP</th><th>协议</th><th>确认状态</th><th class="col-actions">操作</th></tr></thead>
            <tbody>
              <tr v-if="!filtered.length"><td colspan="12" class="ou-empty">{{ loading ? '加载中…' : '无数据' }}</td></tr>
              <tr v-for="(a, i) in pageRows" :key="i">
                <td class="col-idx">{{ (page - 1) * pageSize + i + 1 }}</td>
                <td>{{ a.probe || '—' }}</td>
                <td>{{ a.created_at ? new Date(a.created_at).toLocaleString('zh-CN') : '—' }}</td>
                <td><span class="sa-level" :class="'sa-level-' + a.severity">{{ a.severity }}</span></td>
                <td>{{ a.rule_name || '—' }}</td>
                <td>{{ a.rule_type || '—' }}</td>
                <td><span class="dt-ellipsis" style="max-width:180px">{{ a.trigger || a.message || '—' }}</span></td>
                <td>{{ a.source_ip || '—' }}</td>
                <td>{{ a.dst_ip || '—' }}</td>
                <td>{{ a.proto || '—' }}</td>
                <td><span class="sa-ack" :class="{ 'sa-ack-yes': a.acknowledged }">{{ a.acknowledged ? '已确认' : '未确认' }}</span></td>
                <td class="col-actions"><button type="button" class="link-btn" disabled>详情</button></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="ou-footer">
          <div class="ou-footer-left"><span>共 {{ filtered.length }} 条</span></div>
          <div class="ou-footer-right">
            <label class="ou-page-size">每页 <select v-model.number="pageSize"><option :value="20">20</option><option :value="50">50</option><option :value="100">100</option></select> 条</label>
            <div class="ou-pager">
              <button type="button" class="ou-page-btn" :disabled="page <= 1" @click="page--">‹</button>
              <button type="button" class="ou-page-btn active">{{ page }}</button>
              <button type="button" class="ou-page-btn" :disabled="page >= totalPages" @click="page++">›</button>
              <span style="margin-left:6px">/ {{ totalPages }} 页</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 告警策略 -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'rules' }">
        <div class="ou-toolbar">
          <div class="ou-toolbar-item"><span class="ou-toolbar-label">探针范围</span><select class="ou-toolbar-select" disabled><option>全部探针</option></select></div>
          <div class="ou-toolbar-item"><span class="ou-toolbar-label">筛选类型</span><select class="ou-toolbar-select" disabled><option>全部</option><option>目标 IP</option><option>DNS</option><option>HTTP</option><option>ICMP</option><option>进程</option></select></div>
          <div class="ou-toolbar-item"><span class="ou-toolbar-label">筛选状态</span><select class="ou-toolbar-select" disabled><option>全部</option><option>启用</option><option>禁用</option></select></div>
          <button type="button" class="ou-search-btn" disabled>刷新</button>
          <span style="width:1px;height:20px;background:#dcdfe6;margin:0 4px"></span>
          <button type="button" class="ou-search-btn" disabled>新建规则</button>
        </div>
        <div class="ou-table-wrap">
          <table class="ou-table sa-table">
            <thead><tr><th class="col-idx">序号</th><th>探针</th><th>规则名称</th><th>类型</th><th>匹配条件</th><th>告警级别</th><th>启用</th><th>描述</th><th class="col-actions">操作</th></tr></thead>
            <tbody><tr><td colspan="9" class="ou-empty">无数据</td></tr></tbody>
          </table>
        </div>
        <div class="ou-footer"><div class="ou-footer-left"><span>共 0 条</span></div></div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import './nv-shared.css'

const activeTab = ref('feed')
const loading = ref(false)
const alerts = ref<any[]>([])
const filterLevel = ref('')
const filterRuleType = ref('')
const filterAck = ref('')
const refreshInterval = ref(0)
const page = ref(1)
const pageSize = ref(50)
let timer: any = null

async function load() {
  loading.value = true
  try {
    const data = await fetch('/recent/alerts?n=200').then(r => r.json())
    const arr: any[] = Array.isArray(data) ? data : []
    alerts.value = arr.map(a => ({
      probe: a.probe || a.probe_id || '',
      severity: a.level || a.severity || 'info',
      rule_name: a.rule_name || a.rule || a.type || '',
      rule_type: a.rule_type || a.type || '',
      trigger: a.trigger || a.matched || '',
      message: a.message || a.detail || '',
      source_ip: a.src_ip || a.source_ip || '',
      dst_ip: a.dst_ip || a.dest_ip || '',
      proto: a.proto || a.protocol || '',
      created_at: a.timestamp || a.created_at || '',
      acknowledged: !!a.acknowledged,
    }))
  } catch { alerts.value = [] } finally { loading.value = false }
}

function reset() { filterLevel.value = ''; filterRuleType.value = ''; filterAck.value = ''; page.value = 1 }

function onRefreshChange() {
  if (timer) { clearInterval(timer); timer = null }
  if (refreshInterval.value > 0) timer = setInterval(load, refreshInterval.value)
}

const filtered = computed(() => alerts.value.filter(a => {
  if (filterLevel.value && a.severity !== filterLevel.value) return false
  if (filterRuleType.value && a.rule_type !== filterRuleType.value) return false
  if (filterAck.value && String(a.acknowledged) !== filterAck.value) return false
  return true
}))
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize.value)))
const pageRows = computed(() => filtered.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value))

watch([filterLevel, filterRuleType, filterAck, pageSize], () => { page.value = 1 })

onMounted(load)
onBeforeUnmount(() => { if (timer) clearInterval(timer) })
</script>

<style scoped>
.sa-table th, .sa-table td { font-size:12px; }
.sa-level { display:inline-block; padding:1px 6px; border-radius:2px; font-size:11px; font-weight:600; }
.sa-level-critical { background:#fef0f0; color:#f56c6c; }
.sa-level-error { background:#fef0f0; color:#f56c6c; }
.sa-level-warning { background:#fdf6ec; color:#e6a23c; }
.sa-level-info { background:#ecf5ff; color:#409eff; }
.sa-ack { display:inline-block; padding:1px 6px; border-radius:2px; font-size:11px; background:#fdf6ec; color:#e6a23c; }
.sa-ack-yes { background:#f0f9eb; color:#67c23a; }
.dt-ellipsis { display:inline-block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; vertical-align:bottom; }
</style>
