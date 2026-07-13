<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav" role="tablist" aria-label="质量概况">
        <button type="button" class="nv-tab" :class="{ active: activeTab === 'realtime' }" role="tab" @click="activeTab = 'realtime'">实时分析</button>
        <button type="button" class="nv-tab" :class="{ active: activeTab === 'history' }" role="tab" @click="activeTab = 'history'">历史分析</button>
      </div>
    </div>
    <div class="nv-tabs-body">
      <!-- 实时分析 -->
      <div class="pq-tab-content" :class="{ active: activeTab === 'realtime' }">
        <div class="pq-rt-layout">
          <div class="pq-rt-left">
            <div class="pq-rt-card">
              <div class="pq-rt-card-header"><span class="pq-rt-card-title">时延趋势</span></div>
              <div class="pq-rt-card-body"><div class="pq-rt-chart pq-chart-placeholder"></div>
                <div class="pq-rt-stats"><span class="pq-rt-stat"><span class="pq-rt-stat-label">最大值</span><span class="pq-rt-stat-val">0</span></span><span class="pq-rt-stat"><span class="pq-rt-stat-label">最小值</span><span class="pq-rt-stat-val">0</span></span><span class="pq-rt-stat"><span class="pq-rt-stat-label">平均值</span><span class="pq-rt-stat-val">0</span></span></div>
              </div>
            </div>
            <div class="pq-rt-card">
              <div class="pq-rt-card-header"><span class="pq-rt-card-title">平均时延趋势</span></div>
              <div class="pq-rt-card-body"><div class="pq-rt-chart pq-chart-placeholder"></div>
                <div class="pq-rt-stats"><span class="pq-rt-stat"><span class="pq-rt-stat-label">最大值</span><span class="pq-rt-stat-val">0</span></span><span class="pq-rt-stat"><span class="pq-rt-stat-label">最小值</span><span class="pq-rt-stat-val">0</span></span><span class="pq-rt-stat"><span class="pq-rt-stat-label">平均值</span><span class="pq-rt-stat-val">0</span></span></div>
              </div>
            </div>
            <div class="pq-rt-card">
              <div class="pq-rt-card-header"><span class="pq-rt-card-title">失败率趋势</span></div>
              <div class="pq-rt-card-body"><div class="pq-rt-chart pq-chart-placeholder"></div>
                <div class="pq-rt-stats"><span class="pq-rt-stat"><span class="pq-rt-stat-label">最大值</span><span class="pq-rt-stat-val">0</span></span><span class="pq-rt-stat"><span class="pq-rt-stat-label">最小值</span><span class="pq-rt-stat-val">0</span></span><span class="pq-rt-stat"><span class="pq-rt-stat-label">平均值</span><span class="pq-rt-stat-val">0</span></span></div>
              </div>
            </div>
          </div>
          <div class="pq-rt-right">
            <div class="pq-rt-card">
              <div class="pq-rt-card-header"><span class="pq-rt-card-title">时延分布</span></div>
              <div class="pq-rt-card-body pq-rt-pie-body"><div class="pq-rt-pie-chart pq-chart-placeholder"></div></div>
            </div>
            <div class="pq-rt-card">
              <div class="pq-rt-card-header"><span class="pq-rt-card-title">质差源</span></div>
              <div class="pq-rt-card-body pq-rt-table-body">
                <table class="pq-rt-table"><thead><tr><th style="width:40px;">序号</th><th>IP地址</th><th>总请求数</th><th>失败次数</th><th>平均时延</th></tr></thead><tbody><tr><td colspan="5" class="ou-empty">无数据</td></tr></tbody></table>
              </div>
            </div>
            <div class="pq-rt-card">
              <div class="pq-rt-card-header"><span class="pq-rt-card-title">质差目标</span></div>
              <div class="pq-rt-card-body pq-rt-table-body">
                <table class="pq-rt-table"><thead><tr><th style="width:40px;">序号</th><th>IP地址</th><th>总请求数</th><th>失败次数</th><th>平均时延</th></tr></thead><tbody><tr><td colspan="5" class="ou-empty">无数据</td></tr></tbody></table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 历史分析 -->
      <div class="pq-tab-content" :class="{ active: activeTab === 'history' }">
        <div class="pq-history-toolbar">
          <div class="pq-history-time-range"><span class="pq-history-time-label">时间范围</span><span class="pq-history-time-value">2026-07-02 08:40:30 - 2026-07-02 08:55:30</span></div>
          <div class="pq-history-latency-info"><span class="pq-history-latency-label">质量时延</span><span class="pq-history-latency-value">= 0</span></div>
          <button type="button" class="ou-search-btn" disabled>搜索</button>
          <button type="button" class="secondary" disabled>重置</button>
        </div>
        <div class="pq-rt-layout">
          <div class="pq-rt-left">
            <div class="pq-rt-card"><div class="pq-rt-card-header"><span class="pq-rt-card-title">时延趋势</span></div><div class="pq-rt-card-body"><div class="pq-rt-chart pq-chart-placeholder"></div></div></div>
            <div class="pq-rt-card"><div class="pq-rt-card-header"><span class="pq-rt-card-title">平均时延趋势</span></div><div class="pq-rt-card-body"><div class="pq-rt-chart pq-chart-placeholder"></div></div></div>
            <div class="pq-rt-card"><div class="pq-rt-card-header"><span class="pq-rt-card-title">失败率趋势</span></div><div class="pq-rt-card-body"><div class="pq-rt-chart pq-chart-placeholder"></div></div></div>
          </div>
          <div class="pq-rt-right">
            <div class="pq-rt-card"><div class="pq-rt-card-header"><span class="pq-rt-card-title">时延分布</span></div><div class="pq-rt-card-body pq-rt-pie-body"><div class="pq-rt-pie-chart pq-chart-placeholder"></div></div></div>
            <div class="pq-rt-card">
              <div class="pq-rt-card-header"><span class="pq-rt-card-title">质量源</span></div>
              <div class="pq-rt-card-body pq-rt-table-body">
                <table class="pq-rt-table"><thead><tr><th style="width:40px;">序号</th><th>IP地址</th><th>总请求数</th><th>失败次数</th><th>平均时延</th></tr></thead><tbody><tr><td colspan="5" class="ou-empty">无数据</td></tr></tbody></table>
              </div>
            </div>
            <div class="pq-rt-card">
              <div class="pq-rt-card-header"><span class="pq-rt-card-title">质量目标</span></div>
              <div class="pq-rt-card-body pq-rt-table-body">
                <table class="pq-rt-table"><thead><tr><th style="width:40px;">序号</th><th>IP地址</th><th>总请求数</th><th>失败次数</th><th>平均时延</th></tr></thead><tbody><tr><td colspan="5" class="ou-empty">无数据</td></tr></tbody></table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const activeTab = ref('realtime')
</script>

<style scoped>
.nv-border-card { display:flex; flex-direction:column; height:100%; min-height:0; border:1px solid #e4e7ed; border-radius:4px; background:#fff; overflow:hidden; }
.nv-tabs-header { flex-shrink:0; padding:0 16px; border-bottom:1px solid #e4e7ed; background:#fafafa; }
.nv-tabs-nav { display:flex; gap:0; }
.nv-tab { position:relative; padding:12px 20px; border:none; background:transparent; font-size:14px; font-weight:600; color:#606266; cursor:pointer; white-space:nowrap; }
.nv-tab.active { color:#409eff; }
.nv-tab.active::after { content:''; position:absolute; bottom:0; left:20px; right:20px; height:2px; background:#409eff; border-radius:1px 1px 0 0; }
.nv-tabs-body { flex:1; min-height:0; overflow:hidden; }

.pq-tab-content { display:none; height:100%; overflow:auto; }
.pq-tab-content.active { display:block; }

.pq-rt-layout { display:grid; grid-template-columns:1fr 1fr; gap:12px; padding:12px; height:100%; align-content:start; }
.pq-rt-left, .pq-rt-right { display:flex; flex-direction:column; gap:12px; }
.pq-rt-card { border:1px solid #ebeef5; border-radius:4px; background:#fff; display:flex; flex-direction:column; }
.pq-rt-card-header { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; border-bottom:1px solid #f0f2f5; }
.pq-rt-card-title { font-size:13px; font-weight:600; color:#303133; }
.pq-rt-card-body { padding:10px 14px; flex:1; }
.pq-rt-chart { height:120px; background:#f9fafb; border-radius:4px; }
.pq-rt-pie-body { display:flex; align-items:center; justify-content:center; min-height:160px; }
.pq-rt-pie-chart { width:140px; height:140px; background:#f9fafb; border-radius:50%; }
.pq-rt-table-body { padding:0; }
.pq-rt-table { width:100%; border-collapse:collapse; font-size:12px; }
.pq-rt-table th { background:#fafbfc; border-bottom:1px solid #ebeef5; padding:6px 10px; text-align:left; font-weight:600; color:#606266; white-space:nowrap; }
.pq-rt-table td { border-bottom:1px solid #f0f2f5; padding:6px 10px; color:#303133; }
.ou-empty { text-align:center; color:#909399; padding:24px 10px !important; }
.pq-rt-stats { display:flex; gap:16px; padding:8px 0 0; }
.pq-rt-stat { display:inline-flex; align-items:center; gap:4px; font-size:12px; color:#606266; }
.pq-rt-stat-label { color:#909399; }
.pq-rt-stat-val { font-weight:600; color:#303133; }
.pq-chart-placeholder { display:flex; align-items:center; justify-content:center; color:#c0c4cc; font-size:12px; }

.pq-history-toolbar { display:flex; align-items:center; gap:12px; padding:10px 14px; border-bottom:1px solid #ebeef5; flex-wrap:wrap; }
.pq-history-time-range { display:flex; align-items:center; gap:6px; }
.pq-history-time-label { font-size:13px; color:#606266; }
.pq-history-time-value { font-size:13px; color:#303133; font-weight:500; }
.pq-history-latency-info { display:flex; align-items:center; gap:6px; margin-left:16px; }
.pq-history-latency-label { font-size:13px; color:#606266; }
.pq-history-latency-value { font-size:13px; color:#303133; }
.ou-search-btn { height:30px; padding:0 14px; border:1px solid #409eff; border-radius:4px; background:#409eff; color:#fff; font-size:13px; font-weight:500; cursor:pointer; }
.ou-search-btn:disabled { opacity:.55; cursor:not-allowed; }
.secondary { height:30px; padding:0 14px; border:1px solid #dcdfe6; border-radius:4px; background:#fff; color:#606266; font-size:13px; cursor:pointer; }
.secondary:disabled { opacity:.55; cursor:not-allowed; }
</style>
