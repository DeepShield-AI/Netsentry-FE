<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav" role="tablist" aria-label="虚拟链路">
        <button v-for="tab in tabs" :key="tab.key" type="button" class="nv-tab" :class="{ active: activeTab === tab.key }" role="tab" :aria-selected="activeTab === tab.key" @click="activeTab = tab.key">{{ tab.label }}</button>
      </div>
    </div>
    <div class="nv-tabs-body">

      <!-- 虚拟链路 -->
      <div class="da-vl-panel" :class="{ active: activeTab === 'virtual-link' }" data-dvl-panel="virtual-link" role="tabpanel">
        <div class="ou-toolbar da-vl-toolbar">
          <div class="da-vl-toolbar-left">
            <label class="tdh-filter-field dba-refresh-field"><span class="ou-toolbar-label">自动刷新</span><select class="ou-toolbar-select" disabled><option value="10000" selected>10 秒</option><option value="30000">30 秒</option></select></label>
            <button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button>
          </div>
          <div class="da-vl-toolbar-right">
            <button type="button" class="link-btn da-vl-action-btn" disabled title="暂未开放">🗑 删除</button>
            <button type="button" class="link-btn da-vl-action-btn" disabled title="暂未开放">+ 添加</button>
          </div>
        </div>
        <div class="ou-table-wrap da-vl-table-wrap">
          <table class="ou-table da-vl-table">
            <thead>
              <tr>
                <th class="col-check"><input type="checkbox" disabled aria-label="全选" /></th>
                <th class="col-idx">序号</th>
                <th class="col-name">链路名称</th>
                <th class="col-iface">流入接口</th>
                <th class="col-ip">内网地址</th>
                <th class="col-ip">外网地址</th>
                <th class="col-rate ou-th-sort">上行速率(bps)</th>
                <th class="col-rate ou-th-sort">下行速率(bps)</th>
                <th class="col-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in vlMockData" :key="i">
                <td class="col-check"><input type="checkbox" disabled /></td>
                <td class="col-idx">{{ i + 1 }}</td>
                <td>{{ row.name }}</td>
                <td>{{ row.iface }}</td>
                <td>{{ row.lan }}</td>
                <td>{{ row.wan }}</td>
                <td class="ou-num">{{ row.upRate }}</td>
                <td class="ou-num">{{ row.downRate }}</td>
                <td><button class="link-btn" disabled>编辑</button></td>
              </tr>
              <tr v-if="vlMockData.length === 0"><td colspan="9" class="ou-empty">无数据</td></tr>
            </tbody>
          </table>
        </div>
        <div class="ou-footer ou-footer-td da-vl-footer">
          <div class="ou-footer-left">
            <div class="ou-pager ou-pager-static">
              <button type="button" class="ou-page-btn" disabled aria-label="上一页">‹</button>
              <button type="button" class="ou-page-btn" disabled aria-label="下一页">›</button>
            </div>
          </div>
        </div>
      </div>

      <!-- IP群组 -->
      <div class="da-vl-panel" :class="{ active: activeTab === 'ip-group' }" data-dvl-panel="ip-group" role="tabpanel">
        <div class="ou-toolbar da-vl-toolbar">
          <div class="da-vl-toolbar-left">
            <label class="tdh-filter-field dba-refresh-field"><span class="ou-toolbar-label">自动刷新</span><select class="ou-toolbar-select" disabled><option value="10000" selected>10 秒</option><option value="30000">30 秒</option></select></label>
            <input class="ou-toolbar-input da-vl-search-input" type="search" placeholder="关键字搜索" disabled />
            <button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button>
          </div>
          <div class="da-vl-toolbar-right">
            <button type="button" class="link-btn da-vl-action-btn" disabled title="暂未开放">🗑 删除</button>
            <button type="button" class="link-btn da-vl-action-btn" disabled title="暂未开放">+ 添加</button>
          </div>
        </div>
        <div class="ou-table-wrap da-vl-table-wrap">
          <table class="ou-table da-vl-table da-vl-ipgroup-table">
            <thead>
              <tr>
                <th class="col-check"><input type="checkbox" disabled aria-label="全选" /></th>
                <th class="col-idx">序号</th>
                <th class="col-name">链路名称</th>
                <th class="col-group">IP群组</th>
                <th class="col-iface">网卡</th>
                <th class="col-rate ou-th-sort">流入bps</th>
                <th class="col-rate ou-th-sort">流出bps</th>
                <th class="col-traffic ou-th-sort">流入总流量</th>
                <th class="col-traffic ou-th-sort">流出总流量</th>
                <th class="col-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in ipGroupMockData" :key="i">
                <td class="col-check"><input type="checkbox" disabled /></td>
                <td class="col-idx">{{ i + 1 }}</td>
                <td>{{ row.name }}</td>
                <td>{{ row.group }}</td>
                <td>{{ row.nic }}</td>
                <td class="ou-num">{{ row.inBps }}</td>
                <td class="ou-num">{{ row.outBps }}</td>
                <td class="ou-num">{{ row.inTotal }}</td>
                <td class="ou-num">{{ row.outTotal }}</td>
                <td><button class="link-btn" disabled>编辑</button></td>
              </tr>
              <tr v-if="ipGroupMockData.length === 0"><td colspan="10" class="ou-empty">无数据</td></tr>
            </tbody>
          </table>
        </div>
        <div class="ou-footer ou-footer-td da-vl-footer">
          <div class="ou-footer-left">
            <div class="ou-pager ou-pager-static">
              <button type="button" class="ou-page-btn" disabled aria-label="上一页">‹</button>
              <button type="button" class="ou-page-btn" disabled aria-label="下一页">›</button>
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

const activeTab = ref('virtual-link')
const tabs = [
  { key: 'virtual-link', label: '虚拟链路' },
  { key: 'ip-group', label: 'IP群组' },
]

const vlMockData = [
  { name: '链路A', iface: 'eth0', lan: '192.168.1.1/24', wan: '202.96.1.10', upRate: '12,580', downRate: '45,320' },
  { name: '链路B', iface: 'eth1', lan: '10.0.0.1/16', wan: '202.96.1.20', upRate: '8,240', downRate: '32,100' },
  { name: '链路C', iface: 'eth2', lan: '172.16.0.1/12', wan: '202.96.1.30', upRate: '3,680', downRate: '18,900' },
]

const ipGroupMockData = [
  { name: '链路A', group: '办公区A', nic: 'eth0', inBps: '24,500', outBps: '8,200', inTotal: '1.2 GB', outTotal: '420 MB' },
  { name: '链路A', group: '办公区B', nic: 'eth0', inBps: '18,300', outBps: '6,100', inTotal: '860 MB', outTotal: '310 MB' },
  { name: '链路B', group: '生产区', nic: 'eth1', inBps: '42,800', outBps: '15,600', inTotal: '2.4 GB', outTotal: '980 MB' },
  { name: '链路C', group: 'DMZ区域', nic: 'eth2', inBps: '5,200', outBps: '2,100', inTotal: '320 MB', outTotal: '128 MB' },
]
</script>

<style scoped>
.nv-border-card { display:flex; flex-direction:column; height:100%; min-height:0; border:1px solid #e4e7ed; border-radius:4px; background:#fff; overflow:hidden; }
.nv-tabs-header { flex-shrink:0; padding:0 16px; border-bottom:1px solid #e4e7ed; background:#fafafa; }
.nv-tabs-nav { display:flex; gap:0; }
.nv-tab { position:relative; padding:12px 20px; border:none; background:transparent; font-size:14px; font-weight:600; color:#606266; cursor:pointer; white-space:nowrap; }
.nv-tab.active { color:#409eff; }
.nv-tab.active::after { content:''; position:absolute; bottom:0; left:20px; right:20px; height:2px; background:#409eff; border-radius:1px 1px 0 0; }
.nv-tabs-body { flex:1; min-height:0; display:flex; flex-direction:column; overflow:hidden; }

.da-vl-panel { flex:1; min-height:0; display:none; flex-direction:column; }
.da-vl-panel.active { display:flex; }

.ou-toolbar { display:flex; flex-wrap:wrap; align-items:center; gap:8px 12px; padding:10px 15px; border-bottom:1px solid #ebeef5; }
.da-vl-toolbar { justify-content:space-between; }
.da-vl-toolbar-left { display:flex; align-items:center; gap:8px 12px; flex-wrap:wrap; }
.da-vl-toolbar-right { display:flex; align-items:center; gap:12px; margin-left:auto; }
.tdh-filter-field { display:inline-flex; align-items:center; gap:6px; }
.ou-toolbar-label { font-size:13px; color:#606266; white-space:nowrap; }
.ou-toolbar-select { height:30px; padding:0 6px; border:1px solid #dcdfe6; border-radius:4px; font-size:13px; color:#303133; background:#fff; }
.ou-toolbar-input { height:30px; padding:0 8px; border:1px solid #dcdfe6; border-radius:4px; font-size:13px; color:#303133; }
.ou-search-btn { height:30px; padding:0 14px; border:1px solid #409eff; border-radius:4px; background:#409eff; color:#fff; font-size:13px; font-weight:500; cursor:pointer; }
.ou-search-btn:disabled { opacity:.55; cursor:not-allowed; }
.link-btn { padding:0; border:none; background:none; color:#409eff; cursor:pointer; font-size:13px; font-weight:500; }
.link-btn:disabled { opacity:.55; cursor:not-allowed; }
.da-vl-action-btn { padding:0; border:none; background:none; color:#409eff; cursor:pointer; font-size:13px; font-weight:500; }
.da-vl-action-btn:disabled { opacity:.55; cursor:not-allowed; }

.ou-table-wrap { flex:1; min-height:0; overflow:auto; }
.ou-table { width:100%; border-collapse:collapse; font-size:13px; }
.ou-table th { background:#fafbfc; border-bottom:1px solid #ebeef5; padding:8px 10px; text-align:left; font-weight:600; color:#606266; white-space:nowrap; font-size:12px; }
.ou-table td { border-bottom:1px solid #f0f2f5; padding:8px 10px; color:#303133; }
.ou-empty { text-align:center; color:#909399; padding:32px 10px !important; }
.ou-num { text-align:right; font-variant-numeric:tabular-nums; }
.col-idx { width:52px; text-align:center; }
.col-check { width:42px; text-align:center; }
.col-name { min-width:100px; }
.col-iface { min-width:80px; }
.col-ip { min-width:120px; }
.col-rate { min-width:110px; text-align:right; }
.col-traffic { min-width:110px; text-align:right; }
.col-group { min-width:100px; }
.col-actions { width:80px; text-align:center; }
.ou-th-sort { cursor:pointer; }
.ou-th-sort:hover { color:#409eff; }

.ou-footer { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:8px 14px; border-top:1px solid #ebeef5; font-size:12px; color:#606266; flex-shrink:0; }
.ou-footer-td { flex-shrink:0; }
.ou-footer-left { display:flex; align-items:center; gap:10px; }
.ou-pager { display:inline-flex; align-items:center; gap:4px; }
.ou-pager-static { display:inline-flex; align-items:center; gap:4px; }
.ou-page-btn { min-width:28px; height:28px; padding:0 6px; border:1px solid #dcdfe6; border-radius:3px; background:#fff; color:#303133; font-size:12px; cursor:pointer; }
.ou-page-btn:disabled { opacity:.5; cursor:not-allowed; }
</style>
