<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav" role="tablist" aria-label="MAC分析">
        <button type="button" class="nv-tab active" role="tab">MAC分析</button>
      </div>
    </div>
    <div class="nv-tabs-body">
      <div class="tma-page">
        <div class="tdh-filters">
          <div class="tdh-filter-row tdh-filter-row-actions">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">MAC</span><input class="ou-toolbar-input" type="text" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">传输协议</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" type="text" value="2026-06-15 14:38:32 - 2026-06-15 14:43:32" disabled /></label>
            <button type="button" class="ou-search-btn" disabled>搜索</button>
            <button type="button" class="secondary" disabled>重置</button>
            <button type="button" class="td-icon-btn" disabled title="列设置">☰</button>
          </div>
        </div>
        <div class="tma-result">
          <div class="tma-empty"><span class="ou-empty-text">暂无数据</span></div>
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

.tma-page { display:flex; flex-direction:column; height:100%; }
.tdh-filters { padding:10px 14px; border-bottom:1px solid #ebeef5; }
.tdh-filter-row { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
.tdh-filter-field { display:flex; align-items:center; gap:4px; }
.ou-toolbar-label { font-size:13px; color:#606266; white-space:nowrap; }
.ou-toolbar-select { height:28px; padding:0 8px; border:1px solid #dcdfe6; border-radius:4px; font-size:13px; background:#fff; }
.ou-toolbar-input { height:28px; padding:0 8px; border:1px solid #dcdfe6; border-radius:4px; font-size:13px; width:100px; }
.tdh-time-range { width:260px; }
.ou-search-btn { height:30px; padding:0 14px; border:1px solid #409eff; border-radius:4px; background:#409eff; color:#fff; font-size:13px; cursor:pointer; }
.ou-search-btn:disabled { opacity:.55; cursor:not-allowed; }
.secondary { height:30px; padding:0 14px; border:1px solid #dcdfe6; border-radius:4px; background:#fff; color:#606266; font-size:13px; cursor:pointer; }
.secondary:disabled { opacity:.55; cursor:not-allowed; }
.td-icon-btn { width:28px; height:28px; border:1px solid #dcdfe6; border-radius:4px; background:#fff; cursor:pointer; font-size:14px; display:flex; align-items:center; justify-content:center; }
.td-icon-btn:disabled { opacity:.55; cursor:not-allowed; }
.tma-result { flex:1; display:flex; align-items:center; justify-content:center; }
.tma-empty { padding:40px; }
.ou-empty-text { color:#909399; font-size:14px; }
</style>
