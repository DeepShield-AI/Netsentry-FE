<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav" role="tablist" aria-label="其他审计">
        <button v-for="t in protoTabs" :key="t.key" type="button" class="nv-tab" :class="{ active: activeProto === t.key }" role="tab" @click="activeProto = t.key">{{ t.label }}</button>
      </div>
    </div>
    <div class="nv-tabs-body">
      <div v-for="t in protoTabs" :key="t.key" class="nv-tab-panel oa-proto-panel" :class="{ active: activeProto === t.key }">
        <div class="oa-sub-header">
          <div class="cbm-pc-subtabs">
            <button v-for="s in subTabs" :key="s.key" type="button" class="cbm-pc-subtab" :class="{ active: activeSub[t.key] === s.key }" @click="activeSub[t.key] = s.key">{{ s.label }}</button>
          </div>
        </div>
        <div v-for="s in subTabs" :key="s.key" class="oa-sub-panel" :class="{ active: activeSub[t.key] === s.key }">
          <div class="tdh-filters">
            <div class="tdh-filter-row">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">MAC</span><input class="ou-toolbar-input tdh-filter-input" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">源IP</span><input class="ou-toolbar-input tdh-filter-input" placeholder="任意IP" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">目标IP</span><input class="ou-toolbar-input tdh-filter-input" placeholder="任意IP" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">用户名称</span><input class="ou-toolbar-input tdh-filter-input" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">链路</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
              <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" value="2026-06-14 14:29:08 - 2026-06-14 14:44:08" disabled /></label>
              <button class="ou-search-btn" disabled>搜索</button>
              <button class="secondary td-reset-btn" disabled>重置</button>
            </div>
          </div>
          <template v-if="s.key === 'history-overview'">
            <div class="oa-scroll">
              <section class="tid-chart-panel"><div class="tid-chart-head"><h3 class="tid-mini-title">{{ t.label }} 趋势</h3></div><div class="tid-chart-body"><div class="to-chart-plot"><div class="to-chart-placeholder">趋势图占位</div></div></div></section>
              <div class="audit-mini-grid">
                <section class="tid-mini-panel"><div class="tid-mini-head"><h3 class="tid-mini-title">源IP</h3></div><div class="ou-table-wrap tid-mini-table-wrap"><table class="ou-table tid-mini-table"><thead><tr><th class="col-idx">序号</th><th>源IP</th><th>会话数</th></tr></thead><tbody><tr><td colspan="3" class="ou-empty">无数据</td></tr></tbody></table></div></section>
                <section class="tid-mini-panel"><div class="tid-mini-head"><h3 class="tid-mini-title">目标IP</h3></div><div class="ou-table-wrap tid-mini-table-wrap"><table class="ou-table tid-mini-table"><thead><tr><th class="col-idx">序号</th><th>目标IP</th><th>会话数</th></tr></thead><tbody><tr><td colspan="3" class="ou-empty">无数据</td></tr></tbody></table></div></section>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="ou-table-wrap">
              <table class="ou-table audit-table">
                <thead><tr><th class="col-idx">序号</th><th v-for="c in cols(t.key)" :key="c">{{ c }}</th></tr></thead>
                <tbody><tr><td :colspan="cols(t.key).length + 1" class="ou-empty">无数据</td></tr></tbody>
              </table>
            </div>
            <div class="ou-footer"><div class="ou-footer-left"><div class="ou-pager"><button class="ou-page-btn" disabled>‹</button><button class="ou-page-btn active" disabled>1</button><button class="ou-page-btn" disabled>›</button></div></div><div class="ou-footer-right"><span>共 0 条</span></div></div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import './nv-shared.css'

const protoTabs = [
  { key: 'syslog', label: 'Syslog审计' },
  { key: 'ssh', label: 'SSH审计' },
  { key: 'tls', label: 'TLS审计' },
  { key: 'netbios', label: 'NETBIOS' },
]
const subTabs = [
  { key: 'realtime-sessions', label: '实时会话' },
  { key: 'history-sessions', label: '历史会话' },
  { key: 'history-overview', label: '历史概况' },
]
const activeProto = ref('syslog')
const activeSub = reactive<Record<string, string>>(Object.fromEntries(protoTabs.map(p => [p.key, 'realtime-sessions'])))

const colMap: Record<string, string[]> = {
  syslog: ['时间', 'MAC', '用户名称', '源IP', '目标IP', '设施(Facility)', '级别(Severity)', '主机名', '标签', '消息', '链路', '操作'],
  ssh: ['时间', 'MAC', '用户名称', '源IP', 'SSH服务器', '端口', '账号', '认证方式', '客户端版本', '服务端版本', '登录结果', '会话时长', '链路', '操作'],
  tls: ['时间', 'MAC', '用户名称', '源IP', '目标IP', 'SNI', 'TLS版本', '密码套件', 'JA3', 'JA3S', '证书主体', '证书颁发者', '链路', '操作'],
  netbios: ['时间', 'MAC', '用户名称', '源IP', '目标IP', '协议', 'NetBIOS 名称', '服务类型', '操作(Op)', '资源', '状态', '链路'],
}
function cols(k: string): string[] { return colMap[k] || [] }
</script>

<style scoped>
.oa-proto-panel { display:none; }
.oa-proto-panel.active { display:flex; flex-direction:column; flex:1; min-height:0; }
.oa-sub-header { padding:0 16px; background:#fafbfc; border-bottom:1px solid #ebeef5; }
.cbm-pc-subtabs { display:flex; }
.cbm-pc-subtab { padding:10px 16px; border:none; background:transparent; font-size:13px; font-weight:500; color:#606266; cursor:pointer; position:relative; }
.cbm-pc-subtab.active { color:#409eff; }
.cbm-pc-subtab.active::after { content:''; position:absolute; bottom:0; left:16px; right:16px; height:2px; background:#409eff; }
.oa-sub-panel { display:none; flex:1; min-height:0; flex-direction:column; }
.oa-sub-panel.active { display:flex; }
.oa-scroll { flex:1; overflow:auto; padding:12px; display:flex; flex-direction:column; gap:12px; }
.audit-table th, .audit-table td { font-size:12px; padding:6px 8px; }
.audit-table { min-width:1200px; }
.audit-mini-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:12px; }
</style>
