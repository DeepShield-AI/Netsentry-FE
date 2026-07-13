<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav nv-tabs-nav-wrap" role="tablist" aria-label="域名画像">
        <button v-for="t in tabs" :key="t.key" type="button" class="nv-tab" :class="{ active: activeTab === t.key }" role="tab" @click="activeTab = t.key">{{ t.label }}</button>
      </div>
    </div>
    <div class="nv-tabs-body">
      <div class="tdh-filters">
        <div class="tdh-filter-row tdh-filter-row-actions">
          <label class="tdh-filter-field"><span class="ou-toolbar-label">MAC</span><input class="ou-toolbar-input" type="text" disabled /></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">域名</span><select class="ou-toolbar-select" disabled><option selected>请选择</option></select><input class="ou-toolbar-input" type="text" placeholder="任意域名" disabled /></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">用户名称</span><input class="ou-toolbar-input" type="text" disabled /></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" type="text" value="2026-06-17 23:03:38 - 2026-06-17 23:18:38" disabled /></label>
          <button type="button" class="ou-search-btn" disabled>搜索</button>
          <button type="button" class="secondary" disabled>重置</button>
        </div>
      </div>
      <div class="tdp-page">
        <div class="tdp-panel" :class="{ active: activeTab === 'source-ip' }">
          <table class="ou-table"><thead><tr><th>序号</th><th>访问源IP</th><th>请求/失败</th><th>平均时延</th></tr></thead><tbody><tr><td>1</td><td>166.111.7.7</td><td>436058 / 324867</td><td class="ou-num">13.64</td></tr><tr><td>2</td><td>166.111.7.8</td><td>128642 / 9864</td><td class="ou-num">8.42</td></tr><tr><td>3</td><td>101.6.10.23</td><td>98642 / 4286</td><td class="ou-num">6.28</td></tr></tbody></table>
        </div>
        <div class="tdp-panel" :class="{ active: activeTab === 'request-trend' }">
          <section class="tdp-chart-section"><div class="tdp-chart-head"><span>请求趋势</span></div><div class="tdp-chart-placeholder"></div></section>
        </div>
        <div class="tdp-panel" :class="{ active: activeTab === 'related-domain' }">
          <table class="ou-table"><thead><tr><th>序号</th><th>关联域名</th><th>解析IP</th><th>请求次数</th></tr></thead><tbody><tr><td colspan="4" class="ou-empty">暂无数据</td></tr></tbody></table>
        </div>
        <div class="tdp-panel" :class="{ active: activeTab === 'session-log' }">
          <div class="ta-placeholder">会话日志 — 暂未开放</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const tabs = [
  { key: 'source-ip', label: '访问源IP' },
  { key: 'request-trend', label: '请求趋势' },
  { key: 'related-domain', label: '关联域名' },
  { key: 'session-log', label: '会话日志' },
]
const activeTab = ref('source-ip')
</script>

<style scoped>
.nv-border-card { display:flex; flex-direction:column; height:100%; min-height:0; border:1px solid #e4e7ed; border-radius:4px; background:#fff; overflow:hidden; }
.nv-tabs-header { flex-shrink:0; padding:0 16px; border-bottom:1px solid #e4e7ed; background:#fafafa; }
.nv-tabs-nav { display:flex; }
.nv-tab { position:relative; padding:12px 20px; border:none; background:transparent; font-size:14px; font-weight:600; color:#606266; cursor:pointer; white-space:nowrap; }
.nv-tab.active { color:#409eff; }
.nv-tab.active::after { content:''; position:absolute; bottom:0; left:20px; right:20px; height:2px; background:#409eff; }
.nv-tabs-body { flex:1; min-height:0; overflow:auto; display:flex; flex-direction:column; }

.tdh-filters { padding:10px 14px; border-bottom:1px solid #ebeef5; flex-shrink:0; }
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

.tdp-page { flex:1; overflow:auto; }
.tdp-panel { display:none; padding:12px 14px; }
.tdp-panel.active { display:block; }
.tdp-chart-section { border:1px solid #ebeef5; border-radius:4px; padding:10px; }
.tdp-chart-head { font-size:13px; font-weight:600; color:#303133; margin-bottom:8px; }
.tdp-chart-placeholder { height:180px; background:#f9fafb; border-radius:4px; }
.ta-placeholder { padding:40px; text-align:center; color:#909399; font-size:14px; }

.ou-table { width:100%; border-collapse:collapse; font-size:12px; }
.ou-table th { background:#fafbfc; border-bottom:1px solid #ebeef5; padding:8px 10px; text-align:left; font-weight:600; color:#606266; white-space:nowrap; }
.ou-table td { border-bottom:1px solid #f0f2f5; padding:7px 10px; color:#303133; white-space:nowrap; }
.ou-num { text-align:right; font-variant-numeric:tabular-nums; }
.ou-empty { text-align:center; color:#909399; padding:24px 10px !important; }
</style>
