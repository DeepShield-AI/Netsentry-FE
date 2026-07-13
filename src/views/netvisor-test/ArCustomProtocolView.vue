<template>
  <div class="nvt-page">
    <div class="nvt-tabs-header">
      <div class="nvt-tabs-nav" role="tablist">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="nvt-tab"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- 自定义协议 Panel -->
    <div v-show="activeTab === 'protocol'" class="nvt-card">
      <div class="nvt-card-body">
        <div class="ou-toolbar ar-toolbar">
          <input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled />
          <button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button>
          <div class="ar-toolbar-right">
            <button type="button" class="link-btn" disabled title="暂未开放">🗑 删除</button>
            <button type="button" class="link-btn" disabled title="暂未开放">+ 添加</button>
          </div>
        </div>
        <div class="ou-table-wrap ar-table-wrap">
          <table class="ou-table ar-cp-table">
            <thead>
              <tr>
                <th class="col-check"><input type="checkbox" disabled aria-label="全选" /></th>
                <th class="col-idx">序号</th>
                <th class="col-name">协议名称</th>
                <th class="col-port">TCP端口</th>
                <th class="col-port">UDP端口</th>
                <th class="col-life">节点生存期</th>
                <th class="col-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="protocolData.length === 0">
                <td colspan="7" class="ou-empty">无数据</td>
              </tr>
              <tr v-for="(row, idx) in protocolData" :key="idx">
                <td class="col-check"><input type="checkbox" disabled /></td>
                <td class="col-idx">{{ idx + 1 }}</td>
                <td class="col-name">{{ row.name }}</td>
                <td class="col-port">{{ row.tcpPort }}</td>
                <td class="col-port">{{ row.udpPort }}</td>
                <td class="col-life">{{ row.life }}</td>
                <td class="col-actions">
                  <button type="button" class="link-btn" disabled title="暂未开放">✎</button>
                  <button type="button" class="link-btn" disabled title="暂未开放">🗑</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 节点管理 Panel -->
    <div v-show="activeTab === 'nodes'" class="nvt-card">
      <div class="nvt-card-body">
        <div class="ou-toolbar ar-toolbar">
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">协议类型</span>
            <select class="ou-toolbar-select" disabled><option selected>自定义协议</option></select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">应用协议</span>
            <select class="ou-toolbar-select" disabled><option selected>任意协议</option></select>
          </label>
          <input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled />
          <button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button>
          <div class="ar-toolbar-right">
            <button type="button" class="link-btn" disabled title="暂未开放">🗑 删除</button>
            <button type="button" class="link-btn" disabled title="暂未开放">+ 添加</button>
            <button type="button" class="link-btn" disabled title="暂未开放">☁ 导入</button>
            <button type="button" class="link-btn" disabled title="暂未开放">☁ 导出</button>
          </div>
        </div>
        <div class="ou-table-wrap ar-table-wrap">
          <table class="ou-table ar-cp-node-table">
            <thead>
              <tr>
                <th class="col-check"><input type="checkbox" disabled aria-label="全选" /></th>
                <th class="col-idx">序号</th>
                <th class="col-ip">节点IP</th>
                <th class="col-port">节点端口</th>
                <th class="col-proto">所属协议</th>
                <th class="col-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="nodeData.length === 0">
                <td colspan="6" class="ou-empty">无数据</td>
              </tr>
              <tr v-for="(row, idx) in nodeData" :key="idx">
                <td class="col-check"><input type="checkbox" disabled /></td>
                <td class="col-idx">{{ idx + 1 }}</td>
                <td class="col-ip">{{ row.ip }}</td>
                <td class="col-port">{{ row.port }}</td>
                <td class="col-proto">{{ row.protocol }}</td>
                <td class="col-actions">
                  <button type="button" class="link-btn" disabled title="暂未开放">✎</button>
                  <button type="button" class="link-btn" disabled title="暂未开放">🗑</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="ou-footer ou-footer-td om-footer">
          <div class="ou-footer-left">
            <div class="ou-pager ou-pager-static">
              <button type="button" class="ou-page-btn" disabled aria-label="上一页">‹</button>
              <button type="button" class="ou-page-btn" disabled aria-label="下一页">›</button>
            </div>
          </div>
          <div class="ou-footer-right">
            <label class="ou-page-goto">
              到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页
              <button type="button" class="ou-page-goto-btn" disabled>确定</button>
            </label>
            <span>共 {{ nodeData.length }} 条</span>
            <label class="ou-page-size">
              <select disabled><option selected>100 条/页</option></select>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- 域名关联 Panel -->
    <div v-show="activeTab === 'domain'" class="nvt-card">
      <div class="nvt-card-body">
        <div class="ou-toolbar ar-toolbar">
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">协议类型</span>
            <select class="ou-toolbar-select" disabled><option selected>自定义协议</option></select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">应用协议</span>
            <select class="ou-toolbar-select" disabled><option selected>任意协议</option></select>
          </label>
          <input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled />
          <button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button>
          <div class="ar-toolbar-right">
            <button type="button" class="link-btn" disabled title="暂未开放">🗑 删除</button>
            <button type="button" class="link-btn" disabled title="暂未开放">+ 添加</button>
            <button type="button" class="link-btn" disabled title="暂未开放">☁ 导入</button>
            <button type="button" class="link-btn" disabled title="暂未开放">☁ 导出</button>
          </div>
        </div>
        <div class="ou-table-wrap ar-table-wrap">
          <table class="ou-table ar-cp-domain-table">
            <thead>
              <tr>
                <th class="col-check"><input type="checkbox" disabled aria-label="全选" /></th>
                <th class="col-idx">序号</th>
                <th class="col-domain">域名</th>
                <th class="col-port">端口1</th>
                <th class="col-port">端口2</th>
                <th class="col-dns">跟踪DNS</th>
                <th class="col-host">跟踪HOST</th>
                <th class="col-proto">所属协议</th>
                <th class="col-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="domainData.length === 0">
                <td colspan="9" class="ou-empty">无数据</td>
              </tr>
              <tr v-for="(row, idx) in domainData" :key="idx">
                <td class="col-check"><input type="checkbox" disabled /></td>
                <td class="col-idx">{{ idx + 1 }}</td>
                <td class="col-domain">{{ row.domain }}</td>
                <td class="col-port">{{ row.port1 }}</td>
                <td class="col-port">{{ row.port2 }}</td>
                <td class="col-dns">{{ row.trackDns }}</td>
                <td class="col-host">{{ row.trackHost }}</td>
                <td class="col-proto">{{ row.protocol }}</td>
                <td class="col-actions">
                  <button type="button" class="link-btn" disabled title="暂未开放">✎</button>
                  <button type="button" class="link-btn" disabled title="暂未开放">🗑</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="ou-footer ou-footer-td om-footer">
          <div class="ou-footer-left">
            <div class="ou-pager ou-pager-static">
              <button type="button" class="ou-page-btn" disabled aria-label="上一页">‹</button>
              <button type="button" class="ou-page-btn" disabled aria-label="下一页">›</button>
            </div>
          </div>
          <div class="ou-footer-right">
            <label class="ou-page-goto">
              到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页
              <button type="button" class="ou-page-goto-btn" disabled>确定</button>
            </label>
            <span>共 {{ domainData.length }} 条</span>
            <label class="ou-page-size">
              <select disabled><option selected>100 条/页</option></select>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import './nv-test-shared.css'

const tabs = [
  { key: 'protocol', label: '自定义协议' },
  { key: 'nodes', label: '节点管理' },
  { key: 'domain', label: '域名关联' }
]

const activeTab = ref('protocol')

const protocolData = ref([
  { name: '自定义协议A', tcpPort: '8080', udpPort: '8080', life: '300s' },
  { name: '自定义协议B', tcpPort: '9090', udpPort: '', life: '600s' },
  { name: '自定义协议C', tcpPort: '7070', udpPort: '7071', life: '120s' }
])

const nodeData = ref([
  { ip: '192.168.10.1', port: '8080', protocol: '自定义协议A' },
  { ip: '192.168.10.2', port: '9090', protocol: '自定义协议B' },
  { ip: '10.0.10.1', port: '7070', protocol: '自定义协议C' }
])

const domainData = ref([
  { domain: 'custom-a.example.com', port1: '8080', port2: '', trackDns: '是', trackHost: '是', protocol: '自定义协议A' },
  { domain: 'custom-b.example.com', port1: '9090', port2: '9091', trackDns: '否', trackHost: '是', protocol: '自定义协议B' },
  { domain: 'custom-c.example.com', port1: '7070', port2: '', trackDns: '是', trackHost: '否', protocol: '自定义协议C' }
])
</script>

<style scoped>
.ar-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.tdh-filter-field {
  display: flex;
  align-items: center;
  gap: 4px;
}

.ou-toolbar-label {
  font-size: 13px;
  color: #606266;
  white-space: nowrap;
}

.ou-toolbar-select {
  padding: 4px 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
  background: #fff;
}

.ou-toolbar-input {
  padding: 6px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
  min-width: 160px;
}

.ou-search-btn {
  padding: 6px 16px;
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.ar-toolbar-right {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.link-btn {
  padding: 6px 12px;
  background: transparent;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  color: #606266;
}

.ou-table-wrap {
  overflow-x: auto;
  margin-bottom: 16px;
}

.ou-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.ou-table th,
.ou-table td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid #ebeef5;
}

.ou-table th {
  background: #f5f7fa;
  font-weight: 600;
  color: #606266;
}

.ou-table tbody tr:hover {
  background: #f5f7fa;
}

.col-check { width: 40px; }
.col-idx { width: 60px; }
.col-name { min-width: 140px; }
.col-port { min-width: 80px; }
.col-life { min-width: 100px; }
.col-ip { min-width: 160px; }
.col-proto { min-width: 120px; }
.col-domain { min-width: 200px; }
.col-dns { min-width: 80px; }
.col-host { min-width: 80px; }
.col-actions { width: 100px; }

.ou-empty {
  text-align: center;
  padding: 40px 0;
  color: #909399;
}

.ou-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-top: 1px solid #ebeef5;
}

.ou-footer-left { display: flex; align-items: center; }

.ou-footer-right {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
  color: #606266;
}

.ou-pager { display: flex; gap: 4px; }

.ou-page-btn {
  padding: 4px 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
}

.ou-page-goto { display: flex; align-items: center; gap: 4px; }

.ou-page-goto-input {
  width: 50px;
  padding: 4px 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  text-align: center;
}

.ou-page-goto-btn {
  padding: 4px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
}

.ou-page-size select {
  padding: 4px 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}
</style>
