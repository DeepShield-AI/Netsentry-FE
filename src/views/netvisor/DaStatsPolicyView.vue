<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header da-sp-tabs-header">
      <div class="nv-tabs-nav" role="tablist" aria-label="统计策略">
        <button type="button" class="nv-tab active" role="tab">流量控制 <span class="da-new-badge">NEW</span></button>
      </div>
      <div class="da-sp-head-right"><span class="da-sp-count">策略条数：<strong>0</strong></span></div>
    </div>
    <div class="nv-tabs-body">
      <div class="da-sp-page">
        <div class="ou-toolbar da-sp-toolbar">
          <div class="da-sp-toolbar-left">
            <label class="tdh-filter-field dba-refresh-field"><span class="ou-toolbar-label">自动刷新</span><select class="ou-toolbar-select" disabled><option value="10000" selected>10 秒</option><option value="30000">30 秒</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">策略组</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">状态</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
            <input class="ou-toolbar-input da-sp-search-input" type="search" placeholder="关键字搜索" disabled /><button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button>
          </div>
          <div class="da-sp-toolbar-right">
            <span class="da-sp-ip-hint">0.0.0.0</span>
            <button type="button" class="link-btn da-sp-link-btn" disabled title="暂未开放">★ 不限速IP</button>
            <button type="button" class="link-btn da-sp-link-btn" disabled title="暂未开放">ⓘ 说明</button>
            <button type="button" class="link-btn da-sp-link-btn" disabled title="暂未开放">◎ 动态限速</button>
            <button type="button" class="link-btn da-sp-link-btn" disabled title="暂未开放">+ 添加策略组</button>
            <div class="da-sp-view-toggle" role="group" aria-label="视图切换"><button type="button" class="da-sp-view-btn active" disabled>列表</button><button type="button" class="da-sp-view-btn" disabled>树形</button></div>
          </div>
        </div>
        <div class="da-sp-body" aria-label="策略列表"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import '@/views/netvisor/nv-shared.css'
</script>

<style scoped>
.da-new-badge { display:inline-block; padding:1px 5px; border-radius:3px; background:#f56c6c; color:#fff; font-size:10px; font-weight:700; margin-left:4px; vertical-align:middle; line-height:1.4; }
.da-sp-tabs-header { display:flex; align-items:center; justify-content:space-between; }
.da-sp-head-right { display:flex; align-items:center; gap:8px; padding-right:16px; font-size:13px; color:#606266; }
.da-sp-page { display:flex; flex-direction:column; height:100%; }
.da-sp-toolbar { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; }
.da-sp-toolbar-left, .da-sp-toolbar-right { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.da-sp-search-input { width:180px; }
.da-sp-ip-hint { font-size:12px; color:#909399; }
.da-sp-view-toggle { display:inline-flex; border:1px solid #dcdfe6; border-radius:3px; overflow:hidden; }
.da-sp-view-btn { padding:4px 10px; border:none; background:#fff; color:#606266; font-size:12px; cursor:pointer; border-right:1px solid #dcdfe6; }
.da-sp-view-btn:last-child { border-right:none; }
.da-sp-view-btn.active { background:#ecf5ff; color:#409eff; }
.da-sp-view-btn:disabled { opacity:.55; cursor:not-allowed; }
.da-sp-body { flex:1; min-height:200px; }
</style>
