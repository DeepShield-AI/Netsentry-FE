<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav nv-tabs-nav-wrap" role="tablist" aria-label="流量诊断">
        <button v-for="t in tabs" :key="t.key" type="button" class="nv-tab" :class="{ active: activeTab === t.key }" role="tab" @click="activeTab = t.key">{{ t.label }}</button>
      </div>
    </div>
    <div class="nv-tabs-body">
      <div v-for="t in tabs" :key="t.key" class="ta-panel" :class="{ active: activeTab === t.key }">
        <template v-if="t.key === 'settings'">
          <div class="ttd-settings">
            <div class="ttd-settings-alert">若预期并发连接数接近或超过100万，建议不要开启此功能；保存最近7天数据。</div>
            <div class="ttd-settings-form">
              <label class="ttd-field"><span class="ou-toolbar-label">状态</span><span class="ttd-switch-text">关闭</span></label>
              <label class="ttd-field"><span class="ou-toolbar-label">TTL</span><input class="ou-toolbar-input" type="text" value="60" disabled /><span class="ttd-hint">单位:秒 缓冲区最大存储时间</span></label>
              <button type="button" class="ou-search-btn" disabled>提交</button>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="tdh-filters"><div class="tdh-filter-row tdh-filter-row-actions">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" type="text" value="2026-06-15 14:24 - 2026-06-15 14:39" disabled /></label>
            <button type="button" class="ou-search-btn" disabled>搜索</button>
            <button type="button" class="secondary" disabled>重置</button>
            <button type="button" class="secondary" disabled>过滤条件 ▾</button>
            <div class="tdh-ip-version"><button type="button" class="tio-range-btn active" disabled>IPv4</button><button type="button" class="tio-range-btn" disabled>IPv6</button></div>
            <button type="button" class="link-btn" disabled>⬇ 导出</button>
          </div></div>
          <div class="ttd-rate-grid">
            <section class="ttd-rate-chart"><div class="ttd-chart-head"><span class="ttd-chart-title">上行平均速率趋势</span></div><div class="ttd-chart-body"><span class="ttd-yunit">bps</span><div class="ttd-chart-placeholder"></div></div></section>
            <section class="ttd-rate-chart"><div class="ttd-chart-head"><span class="ttd-chart-title">下行平均速率趋势</span></div><div class="ttd-chart-body"><span class="ttd-yunit">bps</span><div class="ttd-chart-placeholder"></div></div></section>
            <section class="ttd-rate-chart"><div class="ttd-chart-head"><span class="ttd-chart-title">上行最大速率趋势</span></div><div class="ttd-chart-body"><span class="ttd-yunit">bps</span><div class="ttd-chart-placeholder"></div></div></section>
            <section class="ttd-rate-chart"><div class="ttd-chart-head"><span class="ttd-chart-title">下行最大速率趋势</span></div><div class="ttd-chart-body"><span class="ttd-yunit">bps</span><div class="ttd-chart-placeholder"></div></div></section>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const tabs = [
  { key: 'user-traffic', label: '用户流量' },
  { key: 'target-traffic', label: '目标流量' },
  { key: 'settings', label: '设置' },
]
const activeTab = ref('user-traffic')
</script>

<style scoped>
.nv-border-card { display:flex; flex-direction:column; height:100%; min-height:0; border:1px solid #e4e7ed; border-radius:4px; background:#fff; overflow:hidden; }
.nv-tabs-header { flex-shrink:0; padding:0 16px; border-bottom:1px solid #e4e7ed; background:#fafafa; }
.nv-tabs-nav { display:flex; }
.nv-tab { position:relative; padding:12px 20px; border:none; background:transparent; font-size:14px; font-weight:600; color:#606266; cursor:pointer; white-space:nowrap; }
.nv-tab.active { color:#409eff; }
.nv-tab.active::after { content:''; position:absolute; bottom:0; left:20px; right:20px; height:2px; background:#409eff; }
.nv-tabs-body { flex:1; min-height:0; overflow:hidden; }

.ta-panel { display:none; height:100%; flex-direction:column; overflow:auto; }
.ta-panel.active { display:flex; }

.tdh-filters { padding:10px 14px; border-bottom:1px solid #ebeef5; }
.tdh-filter-row { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
.tdh-filter-field { display:flex; align-items:center; gap:4px; }
.ou-toolbar-label { font-size:13px; color:#606266; white-space:nowrap; }
.ou-toolbar-input { height:28px; padding:0 8px; border:1px solid #dcdfe6; border-radius:4px; font-size:13px; width:100px; }
.tdh-time-range { width:260px; }
.tdh-ip-version { display:flex; }
.tio-range-btn { height:28px; padding:0 10px; border:1px solid #dcdfe6; background:#fff; font-size:12px; cursor:pointer; }
.tio-range-btn:first-child { border-radius:4px 0 0 4px; }
.tio-range-btn:last-child { border-radius:0 4px 4px 0; border-left:none; }
.tio-range-btn.active { background:#409eff; color:#fff; border-color:#409eff; }
.ou-search-btn { height:30px; padding:0 14px; border:1px solid #409eff; border-radius:4px; background:#409eff; color:#fff; font-size:13px; cursor:pointer; }
.ou-search-btn:disabled { opacity:.55; cursor:not-allowed; }
.secondary { height:30px; padding:0 14px; border:1px solid #dcdfe6; border-radius:4px; background:#fff; color:#606266; font-size:13px; cursor:pointer; }
.secondary:disabled { opacity:.55; cursor:not-allowed; }
.link-btn { border:none; background:transparent; color:#409eff; font-size:13px; cursor:pointer; padding:4px 8px; }
.link-btn:disabled { color:#c0c4cc; cursor:not-allowed; }

.ttd-rate-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; padding:12px 14px; }
.ttd-rate-chart { border:1px solid #ebeef5; border-radius:4px; padding:10px; }
.ttd-chart-head { margin-bottom:8px; }
.ttd-chart-title { font-size:13px; font-weight:600; color:#303133; }
.ttd-chart-body { height:140px; background:#f9fafb; border-radius:4px; position:relative; display:flex; align-items:center; justify-content:center; }
.ttd-yunit { position:absolute; top:4px; left:6px; font-size:11px; color:#909399; }
.ttd-chart-placeholder { color:#c0c4cc; font-size:12px; }

.ttd-settings { padding:14px; }
.ttd-settings-alert { background:#fdf6ec; border:1px solid #faecd8; border-radius:4px; padding:10px 14px; color:#e6a23c; font-size:13px; margin-bottom:14px; }
.ttd-settings-form { display:flex; flex-wrap:wrap; align-items:center; gap:12px; }
.ttd-field { display:flex; align-items:center; gap:6px; }
.ttd-switch-text { font-size:13px; color:#909399; }
.ttd-hint { font-size:12px; color:#909399; }
</style>
