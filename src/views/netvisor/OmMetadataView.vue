<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav" role="tablist" aria-label="元数据">
        <button type="button" class="nv-tab active" role="tab">元数据</button>
      </div>
    </div>
    <div class="nv-tabs-body">
      <div class="pqpl-page om-md-page">
        <aside class="pqpl-sidebar om-md-sidebar" aria-label="协议列表">
          <div class="pqpl-tree-head"><span class="pqpl-tree-title">协议列表</span></div>
          <ul class="pqpl-tree-list om-md-proto-list">
            <li v-for="p in protocols" :key="p.key" class="pqpl-tree-item" :class="{ active: activeProto === p.key }" @click="activeProto = p.key">
              <span class="pqpl-tree-icon">{{ activeProto === p.key ? '▣' : '▢' }}</span><span class="pqpl-tree-label">{{ p.label }}</span>
            </li>
          </ul>
        </aside>
        <div class="pqpl-main om-md-main">
          <div class="om-md-panel active" role="tabpanel">
            <div class="ou-toolbar om-md-toolbar">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">属性状态</span><select class="ou-toolbar-select" disabled><option selected>所有状态</option></select></label>
              <input class="ou-toolbar-input om-md-search-input" type="search" placeholder="关键字搜索" disabled /><button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button>
              <button type="button" class="secondary td-reset-btn" disabled title="暂未开放">重置</button>
            </div>
            <div class="ou-table-wrap om-md-table-wrap">
              <table class="ou-table om-md-table">
                <thead><tr><th class="col-idx">序号</th><th class="col-name">属性名称</th><th class="col-desc">描述</th><th class="col-enable">操作</th></tr></thead>
                <tbody v-if="activeProto === 'http'">
                  <tr v-for="(attr, i) in httpAttrs" :key="attr.name"><td class="col-idx">{{ i + 1 }}</td><td class="col-name">{{ attr.name }}</td><td class="col-desc">{{ attr.desc }}</td><td class="col-enable"><button type="button" class="ti-switch is-checked" disabled aria-pressed="true"><span class="ti-switch-core"><span class="ti-switch-inner">启用</span><span class="ti-switch-action" aria-hidden="true"></span></span></button></td></tr>
                </tbody>
                <tbody v-else><tr><td colspan="4" class="ou-empty">无数据</td></tr></tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import '@/views/netvisor/nv-shared.css'

const activeProto = ref('http')
const protocols = [
  { key: 'http', label: 'HTTP' }, { key: 'smtp', label: 'SMTP' }, { key: 'pop3', label: 'POP3' },
  { key: 'imap', label: 'IMAP' }, { key: 'dns', label: 'DNS' }, { key: 'sip', label: 'SIP' },
  { key: 'mysql', label: 'MYSQL' }, { key: 'oracle', label: 'ORACLE' }, { key: 'h323', label: 'H323' },
  { key: 'ftp', label: 'FTP' }, { key: 'icmp', label: 'ICMP' }, { key: 'arp', label: 'ARP' },
  { key: 'snmp', label: 'SNMP' }, { key: 'pgsql', label: 'PGSQL' }, { key: 'mssql', label: 'MSSQL' },
  { key: 'radius', label: 'RADIUS' }, { key: 'telnet', label: 'TELNET' },
]
const httpAttrs = [
  { name: 'x_forwarded_for', desc: 'X-Forwarded-For' }, { name: 'user_agent', desc: 'User-Agent' },
  { name: 'upgrade', desc: 'Upgrade' }, { name: 'unknown_header', desc: 'Unknown header' },
  { name: 'time', desc: 'Time since request' }, { name: 'set_cookie', desc: 'Set-Cookie' },
  { name: 'response.code', desc: 'Status Code' }, { name: 'request.uri.query', desc: 'Request URI Query' },
  { name: 'request.uri.path', desc: 'Request URI Path' }, { name: 'request.uri', desc: 'Request URI' },
  { name: 'request.method', desc: 'Request Method' }, { name: 'request.line', desc: 'Request line' },
  { name: 'request.full_uri', desc: 'Full request URI' }, { name: 'referer', desc: 'Referer' },
  { name: 'location', desc: 'Location' }, { name: 'host', desc: 'Host' },
  { name: 'date', desc: 'Date' }, { name: 'cookie', desc: 'Cookie' },
  { name: 'content_type', desc: 'Content-Type' }, { name: 'content_length', desc: 'Content length' },
]
</script>

<style scoped>
.om-md-page { display:flex; height:100%; }
.om-md-sidebar { width:180px; min-width:180px; border-right:1px solid #ebeef5; background:#fafbfc; display:flex; flex-direction:column; }
.pqpl-tree-head { padding:10px 14px; border-bottom:1px solid #ebeef5; font-weight:600; font-size:13px; color:#303133; }
.pqpl-tree-list { list-style:none; margin:0; padding:0; overflow-y:auto; flex:1; }
.pqpl-tree-item { display:flex; align-items:center; gap:6px; padding:8px 14px; cursor:pointer; font-size:13px; color:#606266; border-bottom:1px solid #f5f7fa; }
.pqpl-tree-item:hover { background:#ecf5ff; }
.pqpl-tree-item.active { background:#ecf5ff; color:#409eff; font-weight:600; }
.pqpl-tree-icon { font-size:12px; }
.om-md-main { flex:1; min-width:0; display:flex; flex-direction:column; }
.om-md-panel { display:flex; flex-direction:column; flex:1; min-height:0; }
.om-md-search-input { width:180px; }
.ti-switch { display:inline-flex; align-items:center; height:20px; border:none; background:none; cursor:pointer; padding:0; }
.ti-switch-core { display:inline-flex; align-items:center; position:relative; width:40px; height:20px; border-radius:10px; background:#409eff; transition:background .3s; }
.ti-switch-inner { font-size:11px; color:#fff; padding:0 6px; white-space:nowrap; }
.ti-switch-action { position:absolute; right:2px; top:2px; width:16px; height:16px; border-radius:50%; background:#fff; transition:left .3s; }
.ti-switch:disabled { opacity:.55; cursor:not-allowed; }
</style>
