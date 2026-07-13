<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav nv-tabs-nav-wrap" role="tablist" aria-label="IP画像">
        <button v-for="t in tabs" :key="t.key" type="button" class="nv-tab" :class="{ active: activeTab === t.key }" role="tab" @click="activeTab = t.key">{{ t.label }}</button>
      </div>
    </div>
    <div class="nv-tabs-body">
      <div class="tdh-filters">
        <div class="tdh-filter-row tdh-filter-row-actions">
          <label class="tdh-filter-field"><span class="ou-toolbar-label">MAC</span><input class="ou-toolbar-input" type="text" disabled /></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">IP</span><select class="ou-toolbar-select" disabled><option selected>请选择</option></select><input class="ou-toolbar-input" type="text" placeholder="任意IP" disabled /></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">用户名称</span><input class="ou-toolbar-input" type="text" disabled /></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" type="text" value="2026-06-17 23:03:38 - 2026-06-17 23:18:38" disabled /></label>
          <button type="button" class="ou-search-btn" disabled>搜索</button>
          <button type="button" class="secondary" disabled>重置</button>
        </div>
      </div>
      <div class="tip-page">
        <!-- 应用排行 -->
        <div class="tip-panel" :class="{ active: activeTab === 'app-rank' }">
          <section class="tip-chart-section"><div class="tip-chart-head"><span class="tip-legend-item">访问次数</span><span class="tip-legend-item">失败次数</span><span class="tip-legend-item">时延</span></div><div class="tip-chart-placeholder"></div></section>
        </div>
        <!-- 访问域名 -->
        <div class="tip-panel" :class="{ active: activeTab === 'visited-domain' }">
          <table class="ou-table"><thead><tr><th>序号</th><th>访问域名</th><th>请求/失败</th><th>平均时延</th></tr></thead><tbody><tr><td>1</td><td>mirrors.tuna.tsinghua.edu.cn</td><td>436058 / 324867</td><td class="ou-num">13.64</td></tr><tr><td>2</td><td>www.liepin.com</td><td>128642 / 9864</td><td class="ou-num">8.42</td></tr><tr><td>3</td><td>www.douyin.com</td><td>98642 / 4286</td><td class="ou-num">-</td></tr></tbody></table>
        </div>
        <!-- 开放域名 -->
        <div class="tip-panel" :class="{ active: activeTab === 'open-domain' }">
          <table class="ou-table"><thead><tr><th>序号</th><th>域名</th><th>请求/失败</th><th>平均时延</th></tr></thead><tbody><tr><td colspan="4" class="ou-empty">暂无数据</td></tr></tbody></table>
        </div>
        <!-- 开放端口 -->
        <div class="tip-panel" :class="{ active: activeTab === 'open-port' }">
          <section class="tip-chart-section"><div class="tip-chart-head"><span>访问次数</span></div><div class="tip-chart-placeholder"></div></section>
        </div>
        <!-- 访问的IP -->
        <div class="tip-panel" :class="{ active: activeTab === 'visited-ip' }">
          <table class="ou-table"><thead><tr><th>序号</th><th>访问的IP</th><th>请求/失败</th><th>平均时延</th></tr></thead><tbody><tr><td>1</td><td>101.6.6.6</td><td>10166821 / 2678</td><td class="ou-num">1.92</td></tr><tr><td>2</td><td>101.6.15.130</td><td>8642864 / 128642</td><td class="ou-num">16.86</td></tr><tr><td>3</td><td>101.6.15.67</td><td>4286428 / 86428</td><td class="ou-num">8.64</td></tr></tbody></table>
        </div>
        <!-- 接入的IP -->
        <div class="tip-panel" :class="{ active: activeTab === 'access-ip' }">
          <table class="ou-table"><thead><tr><th>序号</th><th>接入的IP</th><th>请求/失败</th><th>平均时延</th></tr></thead><tbody><tr><td colspan="4" class="ou-empty">暂无数据</td></tr></tbody></table>
        </div>
        <!-- 客户端趋势 -->
        <div class="tip-panel" :class="{ active: activeTab === 'client-trend' }">
          <section class="tip-chart-section"><div class="tip-chart-head"><span>客户端趋势</span></div><div class="tip-chart-placeholder"></div></section>
        </div>
        <!-- 用户时长 -->
        <div class="tip-panel" :class="{ active: activeTab === 'user-duration' }">
          <table class="ou-table"><thead><tr><th>序号</th><th>协议名称</th><th>时长</th><th>上行流量</th><th>下行流量</th><th>总流量</th><th>流量占比</th></tr></thead><tbody><tr><td>1</td><td>其它HTTPS</td><td>28m</td><td class="ou-num">11.44 G</td><td class="ou-num">283.58 G</td><td class="ou-num">295.02 G</td><td class="ou-num">70.99%</td></tr><tr><td>2</td><td>WWW</td><td>28m</td><td class="ou-num">188.25 M</td><td class="ou-num">65.11 G</td><td class="ou-num">65.30 G</td><td class="ou-num">15.71%</td></tr></tbody></table>
        </div>
        <!-- 会话日志 -->
        <div class="tip-panel" :class="{ active: activeTab === 'session-log' }">
          <div class="ta-placeholder">会话日志 — 暂未开放</div>
        </div>
        <!-- 威胁情报 -->
        <div class="tip-panel" :class="{ active: activeTab === 'threat-intel' }">
          <div class="ta-placeholder">威胁情报 — 暂未开放</div>
        </div>
        <!-- 跨境监测 -->
        <div class="tip-panel" :class="{ active: activeTab === 'cross-border' }">
          <div class="ta-placeholder">跨境监测 — 暂未开放</div>
        </div>
        <!-- 访问关系 -->
        <div class="tip-panel" :class="{ active: activeTab === 'access-relation' }">
          <div class="ta-placeholder">访问关系 — 暂未开放</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const tabs = [
  { key: 'app-rank', label: '应用排行' },
  { key: 'visited-domain', label: '访问域名' },
  { key: 'open-domain', label: '开放域名' },
  { key: 'open-port', label: '开放端口' },
  { key: 'visited-ip', label: '访问的IP' },
  { key: 'access-ip', label: '接入的IP' },
  { key: 'client-trend', label: '客户端趋势' },
  { key: 'user-duration', label: '用户时长' },
  { key: 'session-log', label: '会话日志' },
  { key: 'threat-intel', label: '威胁情报' },
  { key: 'cross-border', label: '跨境监测' },
  { key: 'access-relation', label: '访问关系' },
]
const activeTab = ref('app-rank')
</script>

<style scoped>
.nv-border-card { display:flex; flex-direction:column; height:100%; min-height:0; border:1px solid #e4e7ed; border-radius:4px; background:#fff; overflow:hidden; }
.nv-tabs-header { flex-shrink:0; padding:0 16px; border-bottom:1px solid #e4e7ed; background:#fafafa; overflow-x:auto; }
.nv-tabs-nav { display:flex; }
.nv-tab { position:relative; padding:12px 16px; border:none; background:transparent; font-size:13px; font-weight:600; color:#606266; cursor:pointer; white-space:nowrap; }
.nv-tab.active { color:#409eff; }
.nv-tab.active::after { content:''; position:absolute; bottom:0; left:16px; right:16px; height:2px; background:#409eff; }
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

.tip-page { flex:1; overflow:auto; }
.tip-panel { display:none; padding:12px 14px; }
.tip-panel.active { display:block; }
.tip-chart-section { border:1px solid #ebeef5; border-radius:4px; padding:10px; }
.tip-chart-head { display:flex; gap:12px; font-size:12px; color:#606266; margin-bottom:8px; }
.tip-legend-item { display:inline-flex; align-items:center; gap:4px; }
.tip-chart-placeholder { height:180px; background:#f9fafb; border-radius:4px; }
.ta-placeholder { padding:40px; text-align:center; color:#909399; font-size:14px; }

.ou-table { width:100%; border-collapse:collapse; font-size:12px; }
.ou-table th { background:#fafbfc; border-bottom:1px solid #ebeef5; padding:8px 10px; text-align:left; font-weight:600; color:#606266; white-space:nowrap; }
.ou-table td { border-bottom:1px solid #f0f2f5; padding:7px 10px; color:#303133; white-space:nowrap; }
.ou-num { text-align:right; font-variant-numeric:tabular-nums; }
.ou-empty { text-align:center; color:#909399; padding:24px 10px !important; }
</style>
