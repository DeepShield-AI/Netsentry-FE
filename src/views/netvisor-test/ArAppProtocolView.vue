<template>
  <div class="nvt-page ar-arap-page">
    <div class="ar-arap-layout">
      <!-- Sidebar tree -->
      <aside class="pqpl-sidebar ar-ap-sidebar" aria-label="应用协议">
        <div class="pqpl-tree-head">
          <span class="pqpl-tree-title">应用协议</span>
          <button type="button" class="td-icon-btn pqpl-tree-toggle" disabled title="收起">◀</button>
        </div>
        <ul class="pqpl-tree-list">
          <li
            v-for="(item, idx) in treeItems"
            :key="idx"
            class="pqpl-tree-item"
            :class="{ 'pqpl-tree-group': item.group, active: selectedTree === idx }"
            @click="selectedTree = idx"
          >
            <span v-if="item.group" class="pqpl-tree-toggle-icon">{{ item.expanded ? '−' : '+' }}</span>
            <span v-else class="pqpl-tree-icon">▢</span>
            <span class="pqpl-tree-label">{{ item.label }}</span>
          </li>
        </ul>
      </aside>

      <!-- Main content -->
      <div class="pqpl-main ar-ap-main">
        <!-- Overview panel -->
        <div v-show="activePanel === 'overview'" class="ar-ap-panel active">
          <div class="ou-toolbar ar-toolbar">
            <div class="ar-toolbar-left">
              <label class="tdh-filter-field dba-refresh-field">
                <span class="ou-toolbar-label">自动刷新</span>
                <select class="ou-toolbar-select" disabled><option selected>不刷新</option></select>
              </label>
              <label class="tdh-filter-field">
                <span class="ou-toolbar-label">网桥链路</span>
                <select class="ou-toolbar-select" disabled><option selected>所有链路</option></select>
              </label>
              <label class="tdh-filter-field">
                <span class="ou-toolbar-label">协议类型</span>
                <select class="ou-toolbar-select" disabled><option selected>IPv4</option></select>
              </label>
              <label class="tdh-filter-field">
                <span class="ou-toolbar-label">应用协议</span>
                <select class="ou-toolbar-select" disabled><option selected>HTTP协议</option></select>
              </label>
              <input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled />
              <button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button>
            </div>
            <div class="ar-toolbar-right">
              <button type="button" class="primary" disabled title="暂未开放">选中应用对比分析</button>
            </div>
          </div>
          <div class="ou-table-wrap ar-table-wrap ar-ap-table-wrap">
            <table class="ou-table ar-ap-table">
              <thead>
                <tr>
                  <th class="col-check"><input type="checkbox" disabled aria-label="全选" /></th>
                  <th class="col-name ou-th-sort">协议名称</th>
                  <th class="col-metric ou-th-sort">连接数</th>
                  <th class="col-rate ou-th-sort">流入bps</th>
                  <th class="col-rate ou-th-sort">流出bps</th>
                  <th class="col-rate ou-th-sort">代理流入bps</th>
                  <th class="col-rate ou-th-sort">代理流出bps</th>
                  <th class="col-traffic ou-th-sort">累计流量</th>
                  <th class="col-traffic ou-th-sort">最近10分钟流量</th>
                  <th class="col-actions">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in tableData" :key="idx">
                  <td class="col-check"><input type="checkbox" disabled /></td>
                  <td class="col-name"><button type="button" class="link-btn" disabled>{{ row.name }}</button></td>
                  <td class="col-metric ou-num">{{ row.connections }}</td>
                  <td class="col-rate ou-num">{{ row.inBps }}</td>
                  <td class="col-rate ou-num">{{ row.outBps }}</td>
                  <td class="col-rate ou-num">{{ row.proxyInBps }}</td>
                  <td class="col-rate ou-num">{{ row.proxyOutBps }}</td>
                  <td class="col-traffic">
                    <span class="ar-traffic-cell">
                      <span class="ar-traffic-pct">{{ row.totalPct }}</span>
                      <span class="ar-traffic-bar"><i :style="{ width: row.totalPct }"></i></span>
                      <span class="ar-traffic-val">{{ row.totalVal }}</span>
                    </span>
                  </td>
                  <td class="col-traffic">
                    <span class="ar-traffic-cell">
                      <span class="ar-traffic-pct">{{ row.recentPct }}</span>
                      <span class="ar-traffic-bar"><i :style="{ width: row.recentPct }"></i></span>
                      <span class="ar-traffic-val">{{ row.recentVal }}</span>
                    </span>
                  </td>
                  <td class="col-actions">
                    <button type="button" class="link-btn" disabled title="暂未开放">⚙</button>
                    <button type="button" class="link-btn" disabled title="暂未开放">🖥</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="ou-footer ou-footer-td om-footer ar-ap-footer">
            <div class="ou-footer-left">
              <div class="ou-pager ou-pager-static">
                <button type="button" class="ou-page-btn" disabled aria-label="上一页">‹</button>
                <button type="button" class="ou-page-btn active" disabled>1</button>
                <button type="button" class="ou-page-btn" disabled>2</button>
                <button type="button" class="ou-page-btn" disabled>3</button>
                <button type="button" class="ou-page-btn" disabled aria-label="下一页">›</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Trend panel -->
        <div v-show="activePanel === 'trend'" class="ar-ap-panel">
          <div class="ar-ap-trend-stack">
            <div class="ar-ap-trend-card">
              <div class="ar-ap-trend-head">
                <h3 class="om-section-title">上行流量 -&gt; HTTP协议</h3>
                <div class="om-omw-range-toggle" role="group">
                  <button type="button" class="om-omw-range-btn active" disabled>最近三天</button>
                  <button type="button" class="om-omw-range-btn" disabled>最近一月</button>
                </div>
              </div>
              <div class="ar-ap-trend-plot">
                <svg class="om-omw-trend-svg" viewBox="0 0 960 180" preserveAspectRatio="none" aria-hidden="true">
                  <line x1="48" y1="150" x2="920" y2="150" stroke="#e4e7ed"/>
                  <polyline fill="none" stroke="#409eff" stroke-width="2" points="48,120 168,90 288,110 408,70 528,100 648,80 768,95 888,85 920,90"/>
                </svg>
              </div>
            </div>
            <div class="ar-ap-trend-card">
              <div class="ar-ap-trend-head">
                <h3 class="om-section-title">下行流量 -&gt; HTTP协议</h3>
                <div class="om-omw-range-toggle" role="group">
                  <button type="button" class="om-omw-range-btn active" disabled>最近三天</button>
                  <button type="button" class="om-omw-range-btn" disabled>最近一月</button>
                </div>
              </div>
              <div class="ar-ap-trend-plot">
                <svg class="om-omw-trend-svg" viewBox="0 0 960 180" preserveAspectRatio="none" aria-hidden="true">
                  <line x1="48" y1="150" x2="920" y2="150" stroke="#e4e7ed"/>
                  <polyline fill="none" stroke="#409eff" stroke-width="2" points="48,130 168,100 288,115 408,90 528,105 648,95 768,110 888,100 920,105"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import './nv-test-shared.css'

const selectedTree = ref(12)
const activePanel = ref('overview')

const treeItems = ref([
  { label: 'HTTP协议', group: true, expanded: false },
  { label: '常用协议', group: true, expanded: false },
  { label: 'P2P下载', group: true, expanded: false },
  { label: '网络电视', group: true, expanded: false },
  { label: '社交', group: true, expanded: false },
  { label: '金融财经', group: true, expanded: false },
  { label: '流媒体', group: true, expanded: false },
  { label: '网络电话', group: true, expanded: false },
  { label: '网络游戏', group: true, expanded: false },
  { label: '商业系统', group: true, expanded: false },
  { label: '其它', group: true, expanded: false },
  { label: '移动应用', group: true, expanded: false },
  { label: '自定义协议', group: false, expanded: false }
])

const tableData = ref([
  { name: '其它HTTPS', connections: '428642', inBps: '16072.90M', outBps: '4286.42M', proxyInBps: '0', proxyOutBps: '1286.42M', totalPct: '84.62%', totalVal: '3558436.09G', recentPct: '72.18%', recentVal: '1286.42G' },
  { name: 'WWW', connections: '128642', inBps: '4286.42M', outBps: '1286.42M', proxyInBps: '0', proxyOutBps: '428.64M', totalPct: '12.42%', totalVal: '428642.18G', recentPct: '8.64%', recentVal: '86.42G' },
  { name: '其它下载', connections: '86428', inBps: '1286.42M', outBps: '4286.42M', proxyInBps: '0', proxyOutBps: '128.64M', totalPct: '2.86%', totalVal: '128642.86G', recentPct: '1.28%', recentVal: '42.86G' }
])
</script>

<style scoped>
.ar-arap-layout {
  display: flex;
  gap: 0;
  min-height: calc(100vh - 120px);
}

/* Sidebar */
.pqpl-sidebar {
  width: 200px;
  min-width: 200px;
  border-right: 1px solid #ebeef5;
  background: #fff;
  overflow-y: auto;
}

.pqpl-tree-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
}

.pqpl-tree-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.pqpl-tree-toggle {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  color: #909399;
  padding: 2px 6px;
  border-radius: 4px;
}

.pqpl-tree-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.pqpl-tree-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 13px;
  color: #606266;
  transition: all 0.15s;
}

.pqpl-tree-item:hover {
  background: #f5f7fa;
}

.pqpl-tree-item.active {
  background: #ecf5ff;
  color: #409eff;
  font-weight: 500;
}

.pqpl-tree-toggle-icon,
.pqpl-tree-icon {
  font-size: 12px;
  width: 16px;
  text-align: center;
  color: #909399;
}

.pqpl-tree-label {
  flex: 1;
}

/* Main content */
.pqpl-main {
  flex: 1;
  min-width: 0;
  padding: 16px;
}

.ar-ap-panel {
  display: flex;
  flex-direction: column;
}

/* Toolbar */
.ar-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.ar-toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.ar-toolbar-right {
  margin-left: auto;
  display: flex;
  gap: 8px;
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

.primary {
  padding: 6px 16px;
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

/* Table */
.ou-table-wrap {
  overflow-x: auto;
  margin-bottom: 0;
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
  white-space: nowrap;
}

.ou-table tbody tr:hover {
  background: #f5f7fa;
}

.col-check { width: 40px; }
.col-name { min-width: 120px; }
.col-metric { min-width: 80px; }
.col-rate { min-width: 100px; }
.col-traffic { min-width: 180px; }
.col-actions { width: 80px; }

.ou-num {
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.ou-th-sort {
  cursor: pointer;
}

.link-btn {
  background: transparent;
  border: none;
  color: #409eff;
  cursor: pointer;
  padding: 2px 4px;
  font-size: 13px;
}

/* Traffic bar */
.ar-traffic-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ar-traffic-pct {
  font-size: 12px;
  color: #606266;
  min-width: 48px;
}

.ar-traffic-bar {
  flex: 1;
  height: 6px;
  background: #f0f2f5;
  border-radius: 3px;
  overflow: hidden;
  min-width: 60px;
}

.ar-traffic-bar i {
  display: block;
  height: 100%;
  background: #409eff;
  border-radius: 3px;
}

.ar-traffic-val {
  font-size: 12px;
  color: #606266;
  min-width: 80px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

/* Footer */
.ou-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-top: 1px solid #ebeef5;
}

.ou-footer-left {
  display: flex;
  align-items: center;
}

.ou-pager {
  display: flex;
  gap: 4px;
}

.ou-page-btn {
  padding: 4px 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
}

.ou-page-btn.active {
  background: #409eff;
  color: #fff;
  border-color: #409eff;
}

/* Trend panel */
.ar-ap-trend-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ar-ap-trend-card {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  overflow: hidden;
}

.ar-ap-trend-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
}

.om-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.om-omw-range-toggle {
  display: flex;
  gap: 0;
}

.om-omw-range-btn {
  padding: 4px 12px;
  border: 1px solid #dcdfe6;
  background: #fff;
  cursor: pointer;
  font-size: 12px;
  color: #606266;
}

.om-omw-range-btn:first-child {
  border-radius: 4px 0 0 4px;
}

.om-omw-range-btn:last-child {
  border-radius: 0 4px 4px 0;
  border-left: none;
}

.om-omw-range-btn.active {
  background: #ecf5ff;
  color: #409eff;
  border-color: #409eff;
}

.ar-ap-trend-plot {
  padding: 16px;
  height: 200px;
}

.om-omw-trend-svg {
  width: 100%;
  height: 100%;
}
</style>
