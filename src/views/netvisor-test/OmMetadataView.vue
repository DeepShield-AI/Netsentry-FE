<template>
  <div class="om-md-page">
    <aside class="om-md-sidebar">
      <div class="om-md-sidebar-head">协议列表</div>
      <ul class="om-md-proto-list">
        <li
          v-for="proto in protocols"
          :key="proto.key"
          class="om-md-proto-item"
          :class="{ active: selectedProto === proto.key }"
          @click="selectedProto = proto.key"
        >
          <span class="om-md-proto-icon">{{ selectedProto === proto.key ? '▣' : '▢' }}</span>
          <span class="om-md-proto-label">{{ proto.label }}</span>
        </li>
      </ul>
    </aside>
    <div class="om-md-main">
      <div class="ou-toolbar">
        <label class="tdh-filter-field">
          <span class="ou-toolbar-label">属性状态</span>
          <select class="ou-toolbar-select" disabled>
            <option selected>所有状态</option>
          </select>
        </label>
        <input class="ou-toolbar-input om-md-search" type="search" placeholder="关键字搜索" disabled />
        <button type="button" class="ou-search-btn" disabled>搜索</button>
        <button type="button" class="secondary" disabled>重置</button>
      </div>
      <div class="ou-table-wrap om-md-table-wrap">
        <table class="ou-table">
          <thead>
            <tr>
              <th class="col-idx">序号</th>
              <th class="col-name">属性名称</th>
              <th class="col-desc">描述</th>
              <th class="col-enable">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="currentAttrs.length === 0">
              <td colspan="4" class="ou-empty">无数据</td>
            </tr>
            <tr v-else v-for="(attr, idx) in currentAttrs" :key="attr.name">
              <td class="col-idx">{{ idx + 1 }}</td>
              <td class="col-name">{{ attr.name }}</td>
              <td class="col-desc">{{ attr.desc }}</td>
              <td class="col-enable">
                <button type="button" class="ti-switch is-checked" disabled>
                  <span class="ti-switch-core">
                    <span class="ti-switch-inner">启用</span>
                    <span class="ti-switch-action"></span>
                  </span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import './nv-shared.css'

const protocols = [
  { key: 'http', label: 'HTTP' },
  { key: 'smtp', label: 'SMTP' },
  { key: 'pop3', label: 'POP3' },
  { key: 'imap', label: 'IMAP' },
  { key: 'dns', label: 'DNS' },
  { key: 'sip', label: 'SIP' },
  { key: 'mysql', label: 'MYSQL' },
  { key: 'oracle', label: 'ORACLE' },
  { key: 'h323', label: 'H323' },
  { key: 'ftp', label: 'FTP' },
  { key: 'icmp', label: 'ICMP' },
  { key: 'arp', label: 'ARP' },
  { key: 'snmp', label: 'SNMP' },
  { key: 'pgsql', label: 'PGSQL' },
  { key: 'mssql', label: 'MSSQL' },
  { key: 'radius', label: 'RADIUS' },
  { key: 'telnet', label: 'TELNET' },
]

const httpAttrs = [
  { name: 'x_forwarded_for', desc: 'X-Forwarded-For' },
  { name: 'user_agent', desc: 'User-Agent' },
  { name: 'upgrade', desc: 'Upgrade' },
  { name: 'unknown_header', desc: 'Unknown header' },
  { name: 'time', desc: 'Time since request' },
  { name: 'set_cookie', desc: 'Set-Cookie' },
  { name: 'response.code', desc: 'Status Code' },
  { name: 'request.uri.query', desc: 'Request URI Query' },
  { name: 'request.uri.path', desc: 'Request URI Path' },
  { name: 'request.uri', desc: 'Request URI' },
  { name: 'request.method', desc: 'Request Method' },
  { name: 'request.line', desc: 'Request line' },
  { name: 'request.full_uri', desc: 'Full request URI' },
  { name: 'referer', desc: 'Referer' },
  { name: 'location', desc: 'Location' },
  { name: 'host', desc: 'Host' },
  { name: 'date', desc: 'Date' },
  { name: 'cookie', desc: 'Cookie' },
  { name: 'content_type', desc: 'Content-Type' },
  { name: 'content_length', desc: 'Content length' },
]

const selectedProto = ref('http')
const currentAttrs = computed(() => {
  return selectedProto.value === 'http' ? httpAttrs : []
})
</script>

<style scoped>
.om-md-page {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 16px;
  height: 100%;
  min-height: 600px;
}

.om-md-sidebar {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.om-md-sidebar-head {
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  border-bottom: 1px solid #ebeef5;
  background: #fafafa;
}

.om-md-proto-list {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  overflow-y: auto;
}

.om-md-proto-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  cursor: pointer;
  transition: all 0.15s;
  border-bottom: 1px solid #f0f2f5;
}

.om-md-proto-item:hover {
  background: #f5f7fa;
}

.om-md-proto-item.active {
  background: #ecf5ff;
  color: #409eff;
}

.om-md-proto-icon {
  font-size: 14px;
}

.om-md-proto-label {
  font-size: 13px;
  font-weight: 500;
}

.om-md-main {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.om-md-search {
  flex: 1;
  max-width: 300px;
}

.om-md-table-wrap {
  flex: 1;
  overflow: auto;
}

.col-idx {
  width: 60px;
  text-align: center;
}

.col-name {
  min-width: 180px;
}

.col-desc {
  min-width: 200px;
}

.col-enable {
  width: 100px;
  text-align: center;
}

.ti-switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 60px;
  height: 24px;
  border-radius: 12px;
  background: #dcdfe6;
  cursor: pointer;
  transition: all 0.3s;
}

.ti-switch.is-checked {
  background: #409eff;
}

.ti-switch-core {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 8px;
  font-size: 12px;
  color: #fff;
}

.ti-switch-inner {
  font-size: 12px;
}

.ti-switch-action {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.3s;
}

.ti-switch.is-checked .ti-switch-action {
  transform: translateX(0);
}
</style>
