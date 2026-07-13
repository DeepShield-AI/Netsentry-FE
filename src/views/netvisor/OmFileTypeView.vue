<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav" role="tablist" aria-label="文件类型">
        <button type="button" class="nv-tab active" role="tab">文件类型</button>
      </div>
    </div>
    <div class="nv-tabs-body">
      <div class="om-ft-page">
        <div class="ou-toolbar om-ft-toolbar">
          <input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled /><button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button>
          <div class="om-ft-toolbar-right"><button type="button" class="link-btn" disabled title="暂未开放">🗑 删除</button><button type="button" class="link-btn" disabled title="暂未开放">+ 添加</button></div>
        </div>
        <div class="ou-table-wrap om-ft-table-wrap"><table class="ou-table om-ft-table"><thead><tr><th class="col-check"><input type="checkbox" disabled aria-label="全选" /></th><th class="col-idx">序号</th><th class="col-name">文件类型名称</th><th class="col-ext">后缀列表</th><th class="col-actions">操作</th></tr></thead><tbody><tr><td colspan="5" class="ou-empty">无数据</td></tr></tbody></table></div>
        <div class="ou-footer ou-footer-td om-footer"><div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn" disabled>›</button></div></div><div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页 <button type="button" class="ou-page-goto-btn" disabled>确定</button></label><span>共 0 条</span><label class="ou-page-size"><select disabled><option selected>100 条/页</option></select></label></div></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import '@/views/netvisor/nv-shared.css'
</script>

<style scoped>
.om-ft-page { display:flex; flex-direction:column; height:100%; }
.om-ft-toolbar { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.om-ft-toolbar-right { margin-left:auto; display:flex; gap:8px; }
</style>
