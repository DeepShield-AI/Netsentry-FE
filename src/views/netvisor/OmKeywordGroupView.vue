<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav" role="tablist" aria-label="关键字群组">
        <button type="button" class="nv-tab active" role="tab">关键字群组</button>
      </div>
    </div>
    <div class="nv-tabs-body">
      <div class="om-split-page">
        <div class="om-split-left">
          <div class="om-split-head"><h3 class="om-section-title">群组列表</h3><button type="button" class="link-btn" disabled title="暂未开放">+ 添加</button></div>
          <div class="ou-table-wrap om-split-table-wrap"><table class="ou-table om-split-table"><thead><tr><th class="col-check"><input type="checkbox" disabled aria-label="全选" /></th><th class="col-name">名称</th><th class="col-count">成员数</th><th class="col-actions">操作</th></tr></thead><tbody><tr><td colspan="4" class="ou-empty">无数据</td></tr></tbody></table></div>
        </div>
        <div class="om-split-right">
          <div class="om-split-head"><h3 class="om-section-title">群组成员</h3><div class="om-split-right-actions"><button type="button" class="link-btn" disabled title="暂未开放">🗑 删除</button><button type="button" class="link-btn" disabled title="暂未开放">+ 添加</button><button type="button" class="link-btn" disabled title="暂未开放">☁ 导入</button><button type="button" class="link-btn" disabled title="暂未开放">☁ 导出</button></div></div>
          <div class="ou-toolbar om-split-toolbar"><input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled /><button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button></div>
          <div class="ou-table-wrap om-split-table-wrap"><table class="ou-table om-split-table"><thead><tr><th class="col-check"><input type="checkbox" disabled aria-label="全选" /></th><th class="col-idx">序号</th><th class="col-keyword">关键字</th><th class="col-remark">备注</th><th class="col-actions">操作</th></tr></thead><tbody><tr><td colspan="5" class="ou-empty">请先选择群组</td></tr></tbody></table></div>
          <div class="ou-footer ou-footer-td om-footer"><div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn" disabled>›</button></div></div><div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页 <button type="button" class="ou-page-goto-btn" disabled>确定</button></label><span>共 0 条</span><label class="ou-page-size"><select disabled><option selected>100 条/页</option></select></label></div></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import '@/views/netvisor/nv-shared.css'
</script>

<style scoped>
.om-split-page { display:flex; height:100%; gap:0; }
.om-split-left { width:280px; min-width:220px; border-right:1px solid #ebeef5; display:flex; flex-direction:column; }
.om-split-right { flex:1; min-width:0; display:flex; flex-direction:column; }
.om-split-head { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; border-bottom:1px solid #ebeef5; }
.om-section-title { font-size:14px; font-weight:600; color:#303133; margin:0; }
.om-split-right-actions { display:flex; gap:8px; }
.om-split-toolbar { border-bottom:1px solid #ebeef5; }
</style>
