<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav" role="tablist" aria-label="报文搜索">
        <button type="button" class="nv-tab active" role="tab">报文搜索</button>
      </div>
    </div>
    <div class="nv-tabs-body">
      <div class="tps-page">
        <div class="tdh-filters">
          <div class="tdh-filter-row">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">源IP</span><input class="ou-toolbar-input" type="text" placeholder="x.x.x.x" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">源端口</span><input class="ou-toolbar-input" type="text" placeholder="单个端口" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">目标IP</span><input class="ou-toolbar-input" type="text" placeholder="x.x.x.x" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">目标端口</span><input class="ou-toolbar-input" type="text" placeholder="单个端口" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">偏移量</span><input class="ou-toolbar-input" type="text" disabled /></label>
          </div>
          <div class="tdh-filter-row tdh-filter-row-actions">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">关键字</span><select class="ou-toolbar-select" disabled><option selected>1</option></select><input class="ou-toolbar-input" type="text" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" type="text" value="2026-06-15 14:28:48 - 2026-06-15 14:43:48" disabled /></label>
            <button type="button" class="ou-search-btn" disabled>搜索</button>
            <button type="button" class="secondary" disabled>重置</button>
            <label class="tdh-filter-field"><input type="checkbox" disabled /><span class="ou-toolbar-label">后台查询</span></label>
            <button type="button" class="link-btn" disabled>任务列表</button>
          </div>
        </div>
        <div class="ou-table-wrap">
          <table class="ou-table">
            <thead><tr><th>序号</th><th>MAC</th><th>源IP</th><th>目标IP</th><th>开始时间</th><th>结束时间</th><th>传输协议</th><th>总包数</th><th>总流量</th><th>操作</th></tr></thead>
            <tbody>
              <tr v-for="r in mockRows" :key="r.id"><td>{{ r.id }}</td><td>{{ r.mac }}</td><td>{{ r.src }}</td><td>{{ r.dst }}</td><td>{{ r.start }}</td><td>{{ r.end }}</td><td>{{ r.proto }}</td><td class="ou-num">{{ r.pkts }}</td><td class="ou-num">{{ r.traffic }}</td><td><button type="button" class="link-btn" disabled>数据包</button></td></tr>
            </tbody>
          </table>
        </div>
        <div class="ou-footer"><div class="ou-pager"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn active" disabled>1</button><button type="button" class="ou-page-btn" disabled>2</button><span>…</span><button type="button" class="ou-page-btn" disabled>5243</button><button type="button" class="ou-page-btn" disabled>›</button></div><span class="ou-total">共 524288 条</span></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const mockRows = [
  { id:1, mac:'54-2b-de-6d-10-ae', src:'27.209.87.219:326', dst:'101.6.6.6:49785', start:'2026-06-15 14:28:42', end:'2026-06-15 14:28:42', proto:'ICMP', pkts:'1', traffic:'64' },
  { id:2, mac:'54-2b-de-6d-10-ae', src:'101.6.15.28:52816', dst:'101.6.6.6:53', start:'2026-06-15 14:28:40', end:'2026-06-15 14:28:41', proto:'UDP', pkts:'4', traffic:'226' },
  { id:3, mac:'54-2b-de-6d-10-ae', src:'119.186.228.221:49218', dst:'101.6.15.130:443', start:'2026-06-15 14:28:38', end:'2026-06-15 14:28:40', proto:'TCP', pkts:'16', traffic:'1.00 K' },
]
</script>

<style scoped>
.nv-border-card { display:flex; flex-direction:column; height:100%; min-height:0; border:1px solid #e4e7ed; border-radius:4px; background:#fff; overflow:hidden; }
.nv-tabs-header { flex-shrink:0; padding:0 16px; border-bottom:1px solid #e4e7ed; background:#fafafa; }
.nv-tabs-nav { display:flex; }
.nv-tab { position:relative; padding:12px 20px; border:none; background:transparent; font-size:14px; font-weight:600; color:#606266; cursor:pointer; }
.nv-tab.active { color:#409eff; }
.nv-tab.active::after { content:''; position:absolute; bottom:0; left:20px; right:20px; height:2px; background:#409eff; }
.nv-tabs-body { flex:1; min-height:0; overflow:hidden; display:flex; flex-direction:column; }

.tps-page { display:flex; flex-direction:column; height:100%; }
.tdh-filters { padding:10px 14px; border-bottom:1px solid #ebeef5; }
.tdh-filter-row { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:8px; align-items:center; }
.tdh-filter-row:last-child { margin-bottom:0; }
.tdh-filter-field { display:flex; align-items:center; gap:4px; }
.ou-toolbar-label { font-size:13px; color:#606266; white-space:nowrap; }
.ou-toolbar-select { height:28px; padding:0 8px; border:1px solid #dcdfe6; border-radius:4px; font-size:13px; background:#fff; }
.ou-toolbar-input { height:28px; padding:0 8px; border:1px solid #dcdfe6; border-radius:4px; font-size:13px; width:100px; }
.tdh-time-range { width:260px; }
.ou-search-btn { height:30px; padding:0 14px; border:1px solid #409eff; border-radius:4px; background:#409eff; color:#fff; font-size:13px; cursor:pointer; }
.ou-search-btn:disabled { opacity:.55; cursor:not-allowed; }
.secondary { height:30px; padding:0 14px; border:1px solid #dcdfe6; border-radius:4px; background:#fff; color:#606266; font-size:13px; cursor:pointer; }
.secondary:disabled { opacity:.55; cursor:not-allowed; }
.link-btn { border:none; background:transparent; color:#409eff; font-size:13px; cursor:pointer; padding:4px 8px; }
.link-btn:disabled { color:#c0c4cc; cursor:not-allowed; }

.ou-table-wrap { flex:1; overflow:auto; }
.ou-table { width:100%; border-collapse:collapse; font-size:12px; white-space:nowrap; }
.ou-table th { background:#fafbfc; border-bottom:1px solid #ebeef5; padding:8px 10px; text-align:left; font-weight:600; color:#606266; position:sticky; top:0; }
.ou-table td { border-bottom:1px solid #f0f2f5; padding:7px 10px; color:#303133; }
.ou-num { text-align:right; font-variant-numeric:tabular-nums; }
.ou-footer { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; border-top:1px solid #ebeef5; font-size:12px; color:#606266; }
.ou-pager { display:flex; gap:4px; align-items:center; }
.ou-page-btn { min-width:28px; height:28px; border:1px solid #dcdfe6; border-radius:4px; background:#fff; font-size:12px; cursor:pointer; }
.ou-page-btn.active { background:#409eff; color:#fff; border-color:#409eff; }
.ou-page-btn:disabled { opacity:.55; cursor:not-allowed; }
.ou-total { color:#909399; }
</style>
