<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header"><div class="nv-tabs-nav" role="tablist" aria-label="网卡抓包"><button type="button" class="nv-tab active" role="tab">网卡抓包</button></div></div>
    <div class="nv-tabs-body"><div class="ta-placeholder">网卡抓包配置 — 暂未开放</div></div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.nv-border-card { display:flex; flex-direction:column; height:100%; min-height:0; border:1px solid #e4e7ed; border-radius:4px; background:#fff; overflow:hidden; }
.nv-tabs-header { flex-shrink:0; padding:0 16px; border-bottom:1px solid #e4e7ed; background:#fafafa; }
.nv-tabs-nav { display:flex; }
.nv-tab { position:relative; padding:12px 20px; border:none; background:transparent; font-size:14px; font-weight:600; color:#409eff; cursor:pointer; }
.nv-tab::after { content:''; position:absolute; bottom:0; left:20px; right:20px; height:2px; background:#409eff; }
.nv-tabs-body { flex:1; display:flex; align-items:center; justify-content:center; }
.ta-placeholder { color:#909399; font-size:14px; }
</style>
