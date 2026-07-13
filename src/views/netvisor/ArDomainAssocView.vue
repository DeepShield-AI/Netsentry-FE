<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav" role="tablist" aria-label="域名关联">
        <button type="button" class="nv-tab active" role="tab">域名关联</button>
      </div>
    </div>
    <div class="nv-tabs-body">
      <div class="ar-da-page">
        <div class="ou-toolbar ar-da-toolbar"><div class="ar-da-toolbar-left"><input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled /><button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button></div><div class="ar-da-toolbar-right"><button type="button" class="link-btn" disabled title="暂未开放">🗑 删除</button><button type="button" class="link-btn" disabled title="暂未开放">+ 添加</button><button type="button" class="link-btn" disabled title="暂未开放">☁ 导入</button><button type="button" class="link-btn" disabled title="暂未开放">☁ 导出</button></div></div>
        <div class="ou-table-wrap ar-da-table-wrap"><table class="ou-table ar-da-table"><thead><tr><th class="col-check"><input type="checkbox" disabled aria-label="全选" /></th><th class="col-idx">序号</th><th class="col-domain ou-th-sort">域名</th><th class="col-proto ou-th-sort">关联协议</th><th class="col-type ou-th-sort">类型</th><th class="col-remark">备注</th><th class="col-actions">操作</th></tr></thead><tbody><tr><td colspan="7" class="ou-empty">无数据</td></tr></tbody></table></div>
        <div class="ou-footer ou-footer-td"><div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn" disabled>›</button></div></div><div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页 <button type="button" class="ou-page-goto-btn" disabled>确定</button></label><span>共 0 条</span><label class="ou-page-size"><select disabled><option selected>100 条/页</option></select></label></div></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import '@/views/netvisor/nv-shared.css'
</script>

<style scoped>
.ar-da-page { display:flex; flex-direction:column; height:100%; }
.ar-da-toolbar { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; }
.ar-da-toolbar-left, .ar-da-toolbar-right { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
</style>
