<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav" role="tablist" aria-label="流量统计">
        <button type="button" class="nv-tab active" role="tab">流量统计</button>
      </div>
    </div>
    <div class="nv-tabs-body">
      <div class="da-ts-page">
        <div class="ou-toolbar da-ts-toolbar">
          <div class="da-ts-toolbar-left">
            <label class="tdh-filter-field dba-refresh-field"><span class="ou-toolbar-label">自动刷新</span><select class="ou-toolbar-select" disabled><option value="10000" selected>10 秒</option><option value="30000">30 秒</option></select></label>
            <input class="ou-toolbar-input da-ts-search-input" type="search" placeholder="关键字搜索" disabled /><button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button>
          </div>
          <div class="da-ts-toolbar-right">
            <button type="button" class="link-btn da-ts-action-btn" disabled title="暂未开放">+ 添加</button>
          </div>
        </div>
        <div class="ou-table-wrap da-ts-table-wrap"><table class="ou-table da-ts-table"><thead><tr><th class="col-idx">序号</th><th class="col-name ou-th-sort">名称</th><th class="col-rate ou-th-sort">上行速率</th><th class="col-rate ou-th-sort">下行速率</th><th class="col-traffic ou-th-sort">上行流量</th><th class="col-traffic ou-th-sort">下行流量</th><th class="col-actions">操作</th></tr></thead><tbody><tr><td colspan="7" class="ou-empty">无数据</td></tr></tbody></table></div>
        <div class="ou-footer ou-footer-td da-ts-footer"><div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled aria-label="上一页">‹</button><button type="button" class="ou-page-btn" disabled aria-label="下一页">›</button></div></div><div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页 <button type="button" class="ou-page-goto-btn" disabled>确定</button></label><span>共 0 条</span><label class="ou-page-size"><select disabled><option selected>100 条/页</option></select></label></div></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import '@/views/netvisor/nv-shared.css'
</script>

<style scoped>
.da-ts-page { display:flex; flex-direction:column; height:100%; }
.da-ts-toolbar { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; }
.da-ts-toolbar-left, .da-ts-toolbar-right { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.da-ts-search-input { width:180px; }
</style>
