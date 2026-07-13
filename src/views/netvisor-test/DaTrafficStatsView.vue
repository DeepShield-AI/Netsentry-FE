<template>
  <div class="da-ts-page">
    <div class="ou-toolbar da-ts-toolbar">
      <div class="da-ts-toolbar-left">
        <label class="tdh-filter-field dba-refresh-field"><span class="ou-toolbar-label">自动刷新</span><select class="ou-toolbar-select" disabled><option value="10000" selected>10 秒</option><option value="30000">30 秒</option></select></label>
        <input class="ou-toolbar-input da-ts-search-input" type="search" placeholder="关键字搜索" disabled />
        <button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button>
      </div>
      <div class="da-ts-toolbar-right">
        <button type="button" class="link-btn da-ts-action-btn" disabled title="暂未开放">+ 添加</button>
      </div>
    </div>
    <div class="ou-table-wrap da-ts-table-wrap">
      <table class="ou-table da-ts-table">
        <thead>
          <tr>
            <th class="col-idx">序号</th>
            <th class="col-name ou-th-sort">名称</th>
            <th class="col-rate ou-th-sort">上行速率</th>
            <th class="col-rate ou-th-sort">下行速率</th>
            <th class="col-traffic ou-th-sort">上行流量</th>
            <th class="col-traffic ou-th-sort">下行流量</th>
            <th class="col-actions">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in mockData" :key="i">
            <td class="col-idx">{{ i + 1 }}</td>
            <td>{{ row.name }}</td>
            <td class="ou-num">{{ row.upRate }}</td>
            <td class="ou-num">{{ row.downRate }}</td>
            <td class="ou-num">{{ row.upTraffic }}</td>
            <td class="ou-num">{{ row.downTraffic }}</td>
            <td><button class="link-btn" disabled>详情</button></td>
          </tr>
          <tr v-if="mockData.length === 0"><td colspan="7" class="ou-empty">无数据</td></tr>
        </tbody>
      </table>
    </div>
    <div class="ou-footer ou-footer-td da-ts-footer">
      <div class="ou-footer-left">
        <div class="ou-pager ou-pager-static">
          <button type="button" class="ou-page-btn" disabled aria-label="上一页">‹</button>
          <button type="button" class="ou-page-btn" disabled aria-label="下一页">›</button>
        </div>
      </div>
      <div class="ou-footer-right">
        <label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页 <button type="button" class="ou-page-goto-btn" disabled>确定</button></label>
        <span>共 {{ mockData.length }} 条</span>
        <label class="ou-page-size"><select disabled><option selected>100 条/页</option></select></label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import './nv-test-shared.css'

const mockData = [
  { name: '链路A-流量统计', upRate: '12.5 Mbps', downRate: '45.3 Mbps', upTraffic: '1.2 GB', downTraffic: '4.5 GB' },
  { name: '链路B-流量统计', upRate: '8.2 Mbps', downRate: '32.1 Mbps', upTraffic: '860 MB', downTraffic: '3.2 GB' },
  { name: '链路C-流量统计', upRate: '3.6 Mbps', downRate: '18.9 Mbps', upTraffic: '320 MB', downTraffic: '1.8 GB' },
  { name: '链路D-流量统计', upRate: '1.8 Mbps', downRate: '8.5 Mbps', upTraffic: '128 MB', downTraffic: '620 MB' },
  { name: '链路E-流量统计', upRate: '0.5 Mbps', downRate: '2.1 Mbps', upTraffic: '42 MB', downTraffic: '180 MB' },
]
</script>

<style scoped>
.da-ts-page { display:flex; flex-direction:column; height:100%; min-height:0; border:1px solid #e4e7ed; border-radius:4px; background:#fff; overflow:hidden; }

.ou-toolbar { display:flex; flex-wrap:wrap; align-items:center; gap:8px 12px; padding:10px 15px; border-bottom:1px solid #ebeef5; }
.da-ts-toolbar { justify-content:space-between; }
.da-ts-toolbar-left { display:flex; align-items:center; gap:8px 12px; flex-wrap:wrap; }
.da-ts-toolbar-right { display:flex; align-items:center; gap:12px; margin-left:auto; }
.tdh-filter-field { display:inline-flex; align-items:center; gap:6px; }
.ou-toolbar-label { font-size:13px; color:#606266; white-space:nowrap; }
.ou-toolbar-select { height:30px; padding:0 6px; border:1px solid #dcdfe6; border-radius:4px; font-size:13px; color:#303133; background:#fff; }
.ou-toolbar-input { height:30px; padding:0 8px; border:1px solid #dcdfe6; border-radius:4px; font-size:13px; color:#303133; }
.ou-search-btn { height:30px; padding:0 14px; border:1px solid #409eff; border-radius:4px; background:#409eff; color:#fff; font-size:13px; font-weight:500; cursor:pointer; }
.ou-search-btn:disabled { opacity:.55; cursor:not-allowed; }
.link-btn { padding:0; border:none; background:none; color:#409eff; cursor:pointer; font-size:13px; font-weight:500; }
.link-btn:disabled { opacity:.55; cursor:not-allowed; }
.da-ts-action-btn { padding:0; border:none; background:none; color:#409eff; cursor:pointer; font-size:13px; font-weight:500; }
.da-ts-action-btn:disabled { opacity:.55; cursor:not-allowed; }

.ou-table-wrap { flex:1; min-height:0; overflow:auto; }
.ou-table { width:100%; border-collapse:collapse; font-size:13px; }
.ou-table th { background:#fafbfc; border-bottom:1px solid #ebeef5; padding:8px 10px; text-align:left; font-weight:600; color:#606266; white-space:nowrap; font-size:12px; }
.ou-table td { border-bottom:1px solid #f0f2f5; padding:8px 10px; color:#303133; }
.ou-empty { text-align:center; color:#909399; padding:32px 10px !important; }
.ou-num { text-align:right; font-variant-numeric:tabular-nums; }
.col-idx { width:52px; text-align:center; }
.col-name { min-width:140px; }
.col-rate { min-width:110px; text-align:right; }
.col-traffic { min-width:110px; text-align:right; }
.col-actions { width:80px; text-align:center; }
.ou-th-sort { cursor:pointer; }
.ou-th-sort:hover { color:#409eff; }

.ou-footer { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:8px 14px; border-top:1px solid #ebeef5; font-size:12px; color:#606266; flex-shrink:0; }
.ou-footer-td { flex-shrink:0; }
.ou-footer-left { display:flex; align-items:center; gap:10px; }
.ou-footer-right { display:flex; align-items:center; gap:10px; }
.ou-pager { display:inline-flex; align-items:center; gap:4px; }
.ou-pager-static { display:inline-flex; align-items:center; gap:4px; }
.ou-page-btn { min-width:28px; height:28px; padding:0 6px; border:1px solid #dcdfe6; border-radius:3px; background:#fff; color:#303133; font-size:12px; cursor:pointer; }
.ou-page-btn:disabled { opacity:.5; cursor:not-allowed; }
.ou-page-goto { display:inline-flex; align-items:center; gap:4px; }
.ou-page-goto-input { width:40px; height:24px; padding:0 4px; border:1px solid #dcdfe6; border-radius:3px; font-size:12px; text-align:center; }
.ou-page-goto-btn { height:24px; padding:0 8px; border:1px solid #dcdfe6; border-radius:3px; background:#fff; color:#303133; font-size:12px; cursor:pointer; }
.ou-page-goto-btn:disabled { opacity:.5; cursor:not-allowed; }
.ou-page-size { display:inline-flex; align-items:center; gap:4px; }
.ou-page-size select { height:24px; padding:0 6px; border:1px solid #dcdfe6; border-radius:3px; font-size:12px; }
</style>
