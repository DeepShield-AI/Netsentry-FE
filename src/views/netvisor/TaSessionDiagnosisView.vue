<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav" role="tablist" aria-label="会话诊断">
        <button type="button" class="nv-tab active" role="tab">会话诊断</button>
      </div>
    </div>
    <div class="nv-tabs-body">
      <div class="tsd-page">
        <div class="tdh-filters">
          <div class="tdh-filter-row">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">源IP</span><select class="ou-toolbar-select" disabled><option selected>任意IP</option></select><input class="ou-toolbar-input" type="text" placeholder="任意IP" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">过滤源</span><select class="ou-toolbar-select" disabled><option selected>否</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">源端口</span><input class="ou-toolbar-input" type="text" placeholder="80 / 8000-8080" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">目标IP</span><select class="ou-toolbar-select" disabled><option selected>任意IP</option></select><input class="ou-toolbar-input" type="text" placeholder="任意IP" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">过滤目标</span><select class="ou-toolbar-select" disabled><option selected>否</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">目标端口</span><input class="ou-toolbar-input" type="text" placeholder="80 / 8000-8080" disabled /></label>
            <div class="tdh-ip-version"><button type="button" class="tio-range-btn active" disabled>IPv4</button><button type="button" class="tio-range-btn" disabled>IPv6</button></div>
          </div>
          <div class="tdh-filter-row">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">MAC</span><input class="ou-toolbar-input" type="text" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">应用协议</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">传输协议</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">源IP ISP</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">目标IP ISP</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
          </div>
          <div class="tdh-filter-row tdh-filter-row-actions">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" type="text" value="2026-06-15 14:01:17 - 2026-06-15 14:16:17" disabled /></label>
            <button type="button" class="ou-search-btn" disabled>搜索</button>
            <button type="button" class="secondary" disabled>重置</button>
            <button type="button" class="link-btn" disabled>⬇ 导出</button>
          </div>
        </div>
        <div class="tsd-grid">
          <section class="tsd-chart-panel"><div class="tsd-chart-head"><span class="tsd-chart-title">连接数</span></div><div class="tsd-chart-body"><div class="tsd-chart-placeholder"></div></div><div class="tsd-chart-stats"><span>MAX 最大值 <strong>257089</strong></span><span>MIN 最小值 <strong>128642</strong></span><span>AVG 平均值 <strong>186428</strong></span></div></section>
          <section class="tsd-chart-panel"><div class="tsd-chart-head"><span class="tsd-chart-title">流量（上行/下行）</span></div><div class="tsd-chart-body"><div class="tsd-chart-placeholder"></div></div><div class="tsd-chart-stats"><span>上行最大 <strong>428.64 M</strong></span><span>下行最大 <strong>1.28 G</strong></span></div></section>
          <section class="tsd-side-panel">
            <div class="tsd-side-head"><span class="tsd-chart-title">应用协议</span></div>
            <table class="ou-table"><thead><tr><th>序号</th><th>应用协议</th><th>总请求数</th><th>上行</th><th>下行</th></tr></thead><tbody><tr><td>1</td><td>DNS</td><td class="ou-num">4286428</td><td class="ou-num">128.86 M</td><td class="ou-num">286.42 M</td></tr><tr><td>2</td><td>ICMP</td><td class="ou-num">128642</td><td class="ou-num">4.28 M</td><td class="ou-num">2.18 M</td></tr><tr><td>3</td><td>其它HTTPS</td><td class="ou-num">986428</td><td class="ou-num">1.28 G</td><td class="ou-num">4.86 G</td></tr><tr><td>4</td><td>WWW</td><td class="ou-num">642864</td><td class="ou-num">428.64 M</td><td class="ou-num">1.86 G</td></tr></tbody></table>
          </section>
        </div>
        <div class="tsd-bottom-grid">
          <section class="tsd-mini-panel"><div class="tsd-side-head"><span class="tsd-chart-title">源IP</span></div><table class="ou-table"><thead><tr><th>序号</th><th>源IP</th><th>总请求数</th><th>上行</th><th>下行</th></tr></thead><tbody><tr><td>1</td><td>166.111.7.7</td><td class="ou-num">136513</td><td class="ou-num">361.21 M</td><td class="ou-num">11.69 G</td></tr><tr><td>2</td><td>166.111.7.8</td><td class="ou-num">128642</td><td class="ou-num">286.42 M</td><td class="ou-num">8.64 G</td></tr></tbody></table></section>
          <section class="tsd-mini-panel"><div class="tsd-side-head"><span class="tsd-chart-title">目标IP</span></div><table class="ou-table"><thead><tr><th>序号</th><th>目标IP</th><th>总请求数</th><th>上行</th><th>下行</th></tr></thead><tbody><tr><td>1</td><td>101.6.6.6</td><td class="ou-num">128642</td><td class="ou-num">286.42 M</td><td class="ou-num">8.64 G</td></tr><tr><td>2</td><td>101.6.15.130</td><td class="ou-num">98642</td><td class="ou-num">128.86 M</td><td class="ou-num">4.28 G</td></tr></tbody></table></section>
          <section class="tsd-mini-panel"><div class="tsd-side-head"><span class="tsd-chart-title">目标域名</span></div><table class="ou-table"><thead><tr><th>序号</th><th>目标域名</th><th>总请求数</th><th>上行</th><th>下行</th></tr></thead><tbody><tr><td>1</td><td>mirrors.tuna.tsinghua.edu.cn</td><td class="ou-num">642864</td><td class="ou-num">428.64 M</td><td class="ou-num">1.86 G</td></tr><tr><td>2</td><td>work.weixin.qq.com</td><td class="ou-num">128642</td><td class="ou-num">128.86 M</td><td class="ou-num">642.18 M</td></tr></tbody></table></section>
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

.tsd-page { padding:0; }
.tdh-filters { padding:10px 14px; border-bottom:1px solid #ebeef5; }
.tdh-filter-row { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:8px; align-items:center; }
.tdh-filter-row:last-child { margin-bottom:0; }
.tdh-filter-field { display:flex; align-items:center; gap:4px; }
.ou-toolbar-label { font-size:13px; color:#606266; white-space:nowrap; }
.ou-toolbar-select { height:28px; padding:0 8px; border:1px solid #dcdfe6; border-radius:4px; font-size:13px; background:#fff; }
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

.tsd-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; padding:12px 14px; }
.tsd-chart-panel { border:1px solid #ebeef5; border-radius:4px; padding:10px; }
.tsd-chart-head { margin-bottom:8px; }
.tsd-chart-title { font-size:13px; font-weight:600; color:#303133; }
.tsd-chart-body { height:120px; background:#f9fafb; border-radius:4px; margin-bottom:8px; }
.tsd-chart-placeholder { height:100%; }
.tsd-chart-stats { display:flex; gap:12px; font-size:12px; color:#606266; flex-wrap:wrap; }
.tsd-chart-stats strong { color:#303133; }
.tsd-side-panel { border:1px solid #ebeef5; border-radius:4px; overflow:auto; }
.tsd-side-head { padding:10px 10px 6px; }

.tsd-bottom-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; padding:0 14px 14px; }
.tsd-mini-panel { border:1px solid #ebeef5; border-radius:4px; overflow:auto; }

.ou-table { width:100%; border-collapse:collapse; font-size:12px; }
.ou-table th { background:#fafbfc; border-bottom:1px solid #ebeef5; padding:6px 10px; text-align:left; font-weight:600; color:#606266; white-space:nowrap; }
.ou-table td { border-bottom:1px solid #f0f2f5; padding:6px 10px; color:#303133; white-space:nowrap; }
.ou-num { text-align:right; font-variant-numeric:tabular-nums; }
</style>
