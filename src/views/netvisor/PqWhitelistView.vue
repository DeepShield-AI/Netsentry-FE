<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav" role="tablist" aria-label="质量白名单">
        <button type="button" class="nv-tab active" role="tab">质量白名单</button>
      </div>
    </div>
    <div class="nv-tabs-body">
      <div class="pqwl-page">
        <div class="ou-toolbar pqwl-toolbar">
          <div class="pqwl-toolbar-left">
            <div class="ou-toolbar-item"><span class="ou-toolbar-label">自动刷新</span><select class="ou-toolbar-select" disabled><option value="10000" selected>10 秒</option></select></div>
            <div class="ou-toolbar-item"><span class="ou-toolbar-label">状态</span><select class="ou-toolbar-select" disabled><option selected>所有状态</option></select></div>
            <div class="ou-toolbar-item pqwl-search"><input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled /><button type="button" class="ou-search-btn" disabled>搜索</button></div>
            <button type="button" class="secondary td-reset-btn" disabled>重置</button>
          </div>
          <div class="pqwl-toolbar-actions">
            <button type="button" class="link-btn" disabled>ⓘ 说明</button>
            <button type="button" class="link-btn" disabled>⚙ 批量操作</button>
            <button type="button" class="link-btn" disabled>+ 添加</button>
          </div>
        </div>
        <div class="ou-table-wrap">
          <table class="ou-table">
            <thead><tr><th class="col-check"><input type="checkbox" disabled /></th><th>序号</th><th>内网地址</th><th>外网地址</th><th>协议</th><th>应用</th><th>匹配次数</th><th>操作</th></tr></thead>
            <tbody><tr><td colspan="8" class="ou-empty">无数据</td></tr></tbody>
          </table>
        </div>
        <div class="ou-footer">
          <div class="ou-pager"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn active" disabled>1</button><button type="button" class="ou-page-btn" disabled>›</button></div>
          <div class="ou-footer-right"><label>到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页 <button type="button" class="ou-page-goto-btn" disabled>确定</button></label><span>共 0 条</span><label><select disabled><option selected>100 条/页</option></select></label></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.nv-border-card { display:flex; flex-direction:column; height:100%; min-height:0; border:1px solid #e4e7ed; border-radius:4px; background:#fff; overflow:hidden; }
.nv-tabs-header { flex-shrink:0; padding:0 16px; border-bottom:1px solid #e4e7ed; background:#fafafa; }
.nv-tabs-nav { display:flex; }
.nv-tab { position:relative; padding:12px 20px; border:none; background:transparent; font-size:14px; font-weight:600; color:#606266; cursor:pointer; }
.nv-tab.active { color:#409eff; }
.nv-tab.active::after { content:''; position:absolute; bottom:0; left:20px; right:20px; height:2px; background:#409eff; }
.nv-tabs-body { flex:1; min-height:0; overflow:auto; }

.pqwl-page { display:flex; flex-direction:column; height:100%; }
.ou-toolbar { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; border-bottom:1px solid #ebeef5; flex-wrap:wrap; gap:8px; }
.pqwl-toolbar-left { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.pqwl-toolbar-actions { display:flex; gap:8px; }
.ou-toolbar-item { display:flex; align-items:center; gap:4px; }
.ou-toolbar-label { font-size:13px; color:#606266; white-space:nowrap; }
.ou-toolbar-select { height:28px; padding:0 8px; border:1px solid #dcdfe6; border-radius:4px; font-size:13px; background:#fff; }
.ou-toolbar-input { height:28px; padding:0 8px; border:1px solid #dcdfe6; border-radius:4px; font-size:13px; width:140px; }
.ou-search-btn { height:30px; padding:0 14px; border:1px solid #409eff; border-radius:4px; background:#409eff; color:#fff; font-size:13px; cursor:pointer; }
.ou-search-btn:disabled { opacity:.55; cursor:not-allowed; }
.secondary { height:30px; padding:0 14px; border:1px solid #dcdfe6; border-radius:4px; background:#fff; color:#606266; font-size:13px; cursor:pointer; }
.secondary:disabled { opacity:.55; cursor:not-allowed; }
.link-btn { border:none; background:transparent; color:#409eff; font-size:13px; cursor:pointer; padding:4px 8px; }
.link-btn:disabled { color:#c0c4cc; cursor:not-allowed; }

.ou-table-wrap { flex:1; overflow:auto; }
.ou-table { width:100%; border-collapse:collapse; font-size:12px; }
.ou-table th { background:#fafbfc; border-bottom:1px solid #ebeef5; padding:8px 10px; text-align:left; font-weight:600; color:#606266; white-space:nowrap; }
.ou-table td { border-bottom:1px solid #f0f2f5; padding:7px 10px; color:#303133; }
.ou-empty { text-align:center; color:#909399; padding:24px 10px !important; }
.col-check { width:40px; text-align:center; }

.ou-footer { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; border-top:1px solid #ebeef5; font-size:12px; color:#606266; }
.ou-pager { display:flex; gap:4px; }
.ou-page-btn { min-width:28px; height:28px; border:1px solid #dcdfe6; border-radius:4px; background:#fff; font-size:12px; cursor:pointer; }
.ou-page-btn.active { background:#409eff; color:#fff; border-color:#409eff; }
.ou-page-btn:disabled { opacity:.55; cursor:not-allowed; }
.ou-footer-right { display:flex; align-items:center; gap:10px; }
.ou-page-goto-input { width:40px; height:24px; text-align:center; border:1px solid #dcdfe6; border-radius:4px; }
.ou-page-goto-btn { height:24px; padding:0 8px; border:1px solid #dcdfe6; border-radius:4px; background:#fff; font-size:12px; cursor:pointer; }
</style>
