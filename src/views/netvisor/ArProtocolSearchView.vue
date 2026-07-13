<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav" role="tablist" aria-label="协议搜索定位">
        <button type="button" class="nv-tab active" role="tab">协议搜索定位</button>
      </div>
    </div>
    <div class="nv-tabs-body">
      <div class="ar-ps-page">
        <div class="ar-ps-search-card">
          <form class="ar-ps-form" onsubmit="return false">
            <label class="ar-ps-form-row"><span class="ar-ps-form-label">协议名称</span><input class="ou-toolbar-input ar-ps-form-input" type="text" placeholder="请输入协议名称" disabled /></label>
            <label class="ar-ps-form-row"><span class="ar-ps-form-label">IP地址</span><input class="ou-toolbar-input ar-ps-form-input" type="text" placeholder="请输入IP地址" disabled /></label>
            <label class="ar-ps-form-row"><span class="ar-ps-form-label">端口</span><input class="ou-toolbar-input ar-ps-form-input-sm" type="text" placeholder="端口号" disabled /></label>
            <label class="ar-ps-form-row"><span class="ar-ps-form-label">域名</span><input class="ou-toolbar-input ar-ps-form-input" type="text" placeholder="请输入域名" disabled /></label>
            <div class="ar-ps-form-actions"><button type="button" class="primary" disabled title="暂未开放">搜索</button><button type="button" class="secondary" disabled title="暂未开放">重置</button></div>
          </form>
        </div>
        <div class="ou-table-wrap ar-ps-table-wrap"><table class="ou-table ar-ps-table"><thead><tr><th class="col-idx">序号</th><th class="col-name ou-th-sort">协议名称</th><th class="col-cat ou-th-sort">分类</th><th class="col-level ou-th-sort">等级</th><th class="col-type ou-th-sort">匹配类型</th><th class="col-match">匹配内容</th><th class="col-status ou-th-sort">状态</th></tr></thead><tbody><tr><td colspan="7" class="ou-empty">请输入搜索条件</td></tr></tbody></table></div>
        <div class="ou-footer ou-footer-td"><div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn" disabled>›</button></div></div><div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页 <button type="button" class="ou-page-goto-btn" disabled>确定</button></label><span>共 0 条</span><label class="ou-page-size"><select disabled><option selected>100 条/页</option></select></label></div></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import '@/views/netvisor/nv-shared.css'
</script>

<style scoped>
.ar-ps-page { display:flex; flex-direction:column; height:100%; }
.ar-ps-search-card { padding:15px; border-bottom:1px solid #ebeef5; }
.ar-ps-form { display:flex; flex-wrap:wrap; gap:10px; align-items:flex-end; }
.ar-ps-form-row { display:flex; align-items:center; gap:6px; font-size:13px; color:#606266; }
.ar-ps-form-label { min-width:60px; text-align:right; flex-shrink:0; }
.ar-ps-form-input { width:200px; }
.ar-ps-form-input-sm { width:100px; }
.ar-ps-form-actions { display:flex; gap:8px; margin-left:8px; }
.primary { height:30px; padding:0 16px; border:1px solid #409eff; border-radius:4px; background:#409eff; color:#fff; font-size:13px; cursor:pointer; }
.primary:disabled { opacity:.55; cursor:not-allowed; }
.secondary { height:30px; padding:0 14px; border:1px solid #dcdfe6; border-radius:4px; background:#fff; color:#606266; font-size:13px; cursor:pointer; }
.secondary:disabled { opacity:.55; cursor:not-allowed; }
</style>
