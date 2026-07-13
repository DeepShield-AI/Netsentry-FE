<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav" role="tablist" aria-label="重点协议">
        <button v-for="p in protocols" :key="p" type="button" class="nv-tab" :class="{ active: activeProtocol === p }" role="tab" @click="activeProtocol = p">{{ p }}</button>
      </div>
    </div>
    <div class="nv-tabs-body">
      <div v-for="p in protocols" :key="p" class="kp-protocol-content" :class="{ active: activeProtocol === p }">
        <div class="kp-subtabs">
          <button type="button" class="kp-subtab" :class="{ active: subTab === 'realtime' }" @click="subTab = 'realtime'">实时分析</button>
          <button type="button" class="kp-subtab" :class="{ active: subTab === 'history' }" @click="subTab = 'history'">历史分析</button>
        </div>
        <div class="pq-rt-layout">
          <div class="pq-rt-left">
            <div class="pq-rt-card"><div class="pq-rt-card-header"><span class="pq-rt-card-title">客户时延趋势</span></div><div class="pq-rt-card-body"><div class="pq-rt-chart pq-chart-placeholder"></div><div class="pq-rt-stats"><span class="pq-rt-stat"><span class="pq-rt-stat-label">最大值</span><span class="pq-rt-stat-val">0</span></span><span class="pq-rt-stat"><span class="pq-rt-stat-label">最小值</span><span class="pq-rt-stat-val">0</span></span><span class="pq-rt-stat"><span class="pq-rt-stat-label">平均值</span><span class="pq-rt-stat-val">0</span></span></div></div></div>
            <div class="pq-rt-card"><div class="pq-rt-card-header"><span class="pq-rt-card-title">服务时延趋势</span></div><div class="pq-rt-card-body"><div class="pq-rt-chart pq-chart-placeholder"></div><div class="pq-rt-stats"><span class="pq-rt-stat"><span class="pq-rt-stat-label">最大值</span><span class="pq-rt-stat-val">0</span></span><span class="pq-rt-stat"><span class="pq-rt-stat-label">最小值</span><span class="pq-rt-stat-val">0</span></span><span class="pq-rt-stat"><span class="pq-rt-stat-label">平均值</span><span class="pq-rt-stat-val">0</span></span></div></div></div>
            <div class="pq-rt-card"><div class="pq-rt-card-header"><span class="pq-rt-card-title">PPS趋势</span></div><div class="pq-rt-card-body"><div class="pq-rt-chart pq-chart-placeholder"></div><div class="pq-rt-stats"><span class="pq-rt-stat"><span class="pq-rt-stat-label">最大值</span><span class="pq-rt-stat-val">0</span></span><span class="pq-rt-stat"><span class="pq-rt-stat-label">最小值</span><span class="pq-rt-stat-val">0</span></span><span class="pq-rt-stat"><span class="pq-rt-stat-label">平均值</span><span class="pq-rt-stat-val">0</span></span></div></div></div>
            <div class="pq-rt-card"><div class="pq-rt-card-header"><span class="pq-rt-card-title">平均时延趋势</span></div><div class="pq-rt-card-body"><div class="pq-rt-chart pq-chart-placeholder"></div><div class="pq-rt-stats"><span class="pq-rt-stat"><span class="pq-rt-stat-label">最大值</span><span class="pq-rt-stat-val">0</span></span><span class="pq-rt-stat"><span class="pq-rt-stat-label">最小值</span><span class="pq-rt-stat-val">0</span></span><span class="pq-rt-stat"><span class="pq-rt-stat-label">平均值</span><span class="pq-rt-stat-val">0</span></span></div></div></div>
          </div>
          <div class="pq-rt-right">
            <div class="pq-rt-card"><div class="pq-rt-card-header"><span class="pq-rt-card-title">客户时延分布</span></div><div class="pq-rt-card-body pq-rt-pie-body"><div class="pq-rt-pie-chart pq-chart-placeholder"></div></div></div>
            <div class="pq-rt-card"><div class="pq-rt-card-header"><span class="pq-rt-card-title">服务时延分布</span></div><div class="pq-rt-card-body pq-rt-pie-body"><div class="pq-rt-pie-chart pq-chart-placeholder"></div></div></div>
            <div class="pq-rt-card"><div class="pq-rt-card-header"><span class="pq-rt-card-title">质差源</span></div><div class="pq-rt-card-body pq-rt-table-body"><table class="pq-rt-table"><thead><tr><th style="width:40px;">序号</th><th>IP地址</th><th>总请求数</th><th>失败次数</th><th>平均时延</th></tr></thead><tbody><tr><td colspan="5" class="ou-empty">无数据</td></tr></tbody></table></div></div>
            <div class="pq-rt-card"><div class="pq-rt-card-header"><span class="pq-rt-card-title">质差目标</span></div><div class="pq-rt-card-body pq-rt-table-body"><table class="pq-rt-table"><thead><tr><th style="width:40px;">序号</th><th>IP地址</th><th>总请求数</th><th>失败次数</th><th>平均时延</th></tr></thead><tbody><tr><td colspan="5" class="ou-empty">无数据</td></tr></tbody></table></div></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const protocols = ['TCP', 'DNS', 'HTTP', 'HTTPS']
const activeProtocol = ref('TCP')
const subTab = ref('realtime')
</script>

<style scoped>
.nv-border-card { display:flex; flex-direction:column; height:100%; min-height:0; border:1px solid #e4e7ed; border-radius:4px; background:#fff; overflow:hidden; }
.nv-tabs-header { flex-shrink:0; padding:0 16px; border-bottom:1px solid #e4e7ed; background:#fafafa; }
.nv-tabs-nav { display:flex; gap:0; }
.nv-tab { position:relative; padding:12px 20px; border:none; background:transparent; font-size:14px; font-weight:600; color:#606266; cursor:pointer; white-space:nowrap; }
.nv-tab.active { color:#409eff; }
.nv-tab.active::after { content:''; position:absolute; bottom:0; left:20px; right:20px; height:2px; background:#409eff; border-radius:1px 1px 0 0; }
.nv-tabs-body { flex:1; min-height:0; overflow:hidden; }

.kp-protocol-content { display:none; height:100%; flex-direction:column; overflow:auto; }
.kp-protocol-content.active { display:flex; }
.kp-subtabs { display:flex; gap:0; padding:0 16px; border-bottom:1px solid #ebeef5; }
.kp-subtab { padding:10px 18px; border:none; background:transparent; font-size:13px; font-weight:500; color:#606266; cursor:pointer; position:relative; }
.kp-subtab.active { color:#409eff; }
.kp-subtab.active::after { content:''; position:absolute; bottom:0; left:18px; right:18px; height:2px; background:#409eff; border-radius:1px 1px 0 0; }

.pq-rt-layout { display:grid; grid-template-columns:1fr 1fr; gap:12px; padding:12px; align-content:start; }
.pq-rt-left, .pq-rt-right { display:flex; flex-direction:column; gap:12px; }
.pq-rt-card { border:1px solid #ebeef5; border-radius:4px; background:#fff; display:flex; flex-direction:column; }
.pq-rt-card-header { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; border-bottom:1px solid #f0f2f5; }
.pq-rt-card-title { font-size:13px; font-weight:600; color:#303133; }
.pq-rt-card-body { padding:10px 14px; flex:1; }
.pq-rt-chart { height:120px; background:#f9fafb; border-radius:4px; }
.pq-rt-pie-body { display:flex; align-items:center; justify-content:center; min-height:140px; }
.pq-rt-pie-chart { width:120px; height:120px; background:#f9fafb; border-radius:50%; }
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
</style>
