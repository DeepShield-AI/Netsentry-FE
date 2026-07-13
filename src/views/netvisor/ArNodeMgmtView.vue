<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav" role="tablist" aria-label="节点管理">
        <button type="button" class="nv-tab active" role="tab">节点管理</button>
      </div>
    </div>
    <div class="nv-tabs-body">
      <div class="ar-nm-page">
        <div class="ou-toolbar ar-nm-toolbar"><div class="ar-nm-toolbar-left"><label class="tdh-filter-field dba-refresh-field"><span class="ou-toolbar-label">自动刷新</span><select class="ou-toolbar-select" disabled><option selected>10 秒</option></select></label><input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled /><button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button></div><div class="ar-nm-toolbar-right"><button type="button" class="link-btn" disabled title="暂未开放">🗑 删除</button><button type="button" class="link-btn" disabled title="暂未开放">+ 添加</button></div></div>
        <div class="ou-table-wrap ar-nm-table-wrap"><table class="ou-table ar-nm-table"><thead><tr><th class="col-check"><input type="checkbox" disabled aria-label="全选" /></th><th class="col-idx">序号</th><th class="col-name ou-th-sort">节点名称</th><th class="col-ip ou-th-sort">IP地址</th><th class="col-port">端口</th><th class="col-status ou-th-sort">状态</th><th class="col-version">版本</th><th class="col-conn ou-th-sort">连接数</th><th class="col-rate ou-th-sort">流入速率</th><th class="col-rate ou-th-sort">流出速率</th><th class="col-actions">操作</th></tr></thead><tbody><tr><td colspan="11" class="ou-empty">无数据</td></tr></tbody></table></div>
        <div class="ou-footer ou-footer-td"><div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn" disabled>›</button></div></div><div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页 <button type="button" class="ou-page-goto-btn" disabled>确定</button></label><span>共 0 条</span><label class="ou-page-size"><select disabled><option selected>100 条/页</option></select></label></div></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import '@/views/netvisor/nv-shared.css'
</script>

<style scoped>
.ar-nm-page { display:flex; flex-direction:column; height:100%; }
.ar-nm-toolbar { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; }
.ar-nm-toolbar-left, .ar-nm-toolbar-right { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
</style>
