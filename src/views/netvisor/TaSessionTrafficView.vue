<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav nv-tabs-nav-wrap" role="tablist" aria-label="会话流量">
        <button v-for="t in tabs" :key="t.key" type="button" class="nv-tab" :class="{ active: activeTab === t.key }" role="tab" @click="activeTab = t.key">{{ t.label }}</button>
      </div>
    </div>
    <div class="nv-tabs-body">
      <!-- 会话流量 tab -->
      <div class="ta-panel" :class="{ active: activeTab === 'traffic' }">
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
            <label class="tdh-filter-field"><span class="ou-toolbar-label">域名</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select><input class="ou-toolbar-input" type="text" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">应用协议</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">连接类型</span><select class="ou-toolbar-select" disabled><option selected>所有</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">上行字节&gt;=</span><input class="ou-toolbar-input" type="text" disabled /><span class="hsa-unit">Byte</span></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">下行字节&gt;=</span><input class="ou-toolbar-input" type="text" disabled /><span class="hsa-unit">Byte</span></label>
          </div>
          <div class="tdh-filter-row tdh-filter-row-actions">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">传输协议</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" type="text" value="2026-06-15 14:01:17 - 2026-06-15 14:16:17" disabled /></label>
            <button type="button" class="ou-search-btn" disabled>搜索</button>
            <button type="button" class="secondary" disabled>重置</button>
            <button type="button" class="secondary" disabled>更多条件 ▾</button>
          </div>
        </div>
        <div class="tdh-table-bar"><button type="button" class="td-icon-btn" disabled>▶</button><button type="button" class="td-icon-btn" disabled>⬇</button><button type="button" class="td-icon-btn" disabled>📊</button><button type="button" class="td-icon-btn" disabled>☰</button></div>
        <div class="ou-table-wrap">
          <table class="ou-table">
            <thead><tr><th><input type="checkbox" disabled /></th><th>请求时间</th><th>结束时间</th><th>时长</th><th>MAC</th><th>源IP</th><th>目标IP</th><th>传输协议</th><th>应用协议</th><th>上行包数</th><th>下行包数</th><th>上行流量</th><th>下行流量</th><th>状态</th></tr></thead>
            <tbody>
              <tr v-for="r in mockRows" :key="r.id"><td><input type="checkbox" disabled /></td><td>{{ r.start }}</td><td>{{ r.end }}</td><td>{{ r.dur }}</td><td>{{ r.mac }}</td><td>{{ r.src }}</td><td>{{ r.dst }}</td><td>{{ r.trans }}</td><td>{{ r.app }}</td><td class="ou-num">{{ r.upPkt }}</td><td class="ou-num">{{ r.dnPkt }}</td><td class="ou-num">{{ r.upTraffic }}</td><td class="ou-num">{{ r.dnTraffic }}</td><td>{{ r.status }}</td></tr>
            </tbody>
          </table>
        </div>
        <div class="ou-footer"><div class="ou-pager"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn active" disabled>1</button><button type="button" class="ou-page-btn" disabled>2</button><span>…</span><button type="button" class="ou-page-btn" disabled>›</button></div><span class="ou-total">共 22375688 条</span></div>
      </div>
      <!-- 历史关系 tab -->
      <div class="ta-panel" :class="{ active: activeTab === 'history-relation' }">
        <div class="tdh-filters"><div class="tdh-filter-row tdh-filter-row-actions">
          <label class="tdh-filter-field"><span class="ou-toolbar-label">源IP</span><select class="ou-toolbar-select" disabled><option selected>任意IP</option></select><input class="ou-toolbar-input" type="text" placeholder="任意IP" disabled /></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">目标IP</span><select class="ou-toolbar-select" disabled><option selected>任意IP</option></select><input class="ou-toolbar-input" type="text" placeholder="任意IP" disabled /></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">应用协议</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
          <button type="button" class="ou-search-btn" disabled>搜索</button>
          <button type="button" class="secondary" disabled>重置</button>
        </div></div>
        <div class="tst-hr-body">
          <div class="tst-sankey-panel"><div class="tst-sankey-head"><span>源</span><span>主动访问</span><span>目标</span></div><div class="tst-sankey-chart"></div></div>
          <div class="tid-mini-panel">
            <table class="ou-table"><thead><tr><th>序号</th><th>IP</th><th>连接数</th><th>上行流量</th><th>下行流量</th></tr></thead><tbody><tr><td>1</td><td>166.111.7.7</td><td class="ou-num">136513</td><td class="ou-num">361.21 M</td><td class="ou-num">11.69 G</td></tr><tr><td>2</td><td>166.111.7.8</td><td class="ou-num">136440</td><td class="ou-num">365.74 M</td><td class="ou-num">16.58 G</td></tr><tr><td>3</td><td>101.6.10.23</td><td class="ou-num">128642</td><td class="ou-num">286.42 M</td><td class="ou-num">8.64 G</td></tr></tbody></table>
          </div>
        </div>
      </div>
      <!-- 实时会话 tab -->
      <div class="ta-panel" :class="{ active: activeTab === 'realtime-session' }">
        <div class="ta-placeholder">实时会话 — 暂未开放</div>
      </div>
      <!-- 实时关系 tab -->
      <div class="ta-panel" :class="{ active: activeTab === 'realtime-relation' }">
        <div class="ta-placeholder">实时关系 — 暂未开放</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const tabs = [
  { key: 'traffic', label: '会话流量' },
  { key: 'history-relation', label: '历史关系' },
  { key: 'realtime-session', label: '实时会话' },
  { key: 'realtime-relation', label: '实时关系' },
]
const activeTab = ref('traffic')
const mockRows = [
  { id:1, start:'2026-06-15 14:03:50', end:'2026-06-15 14:23:27', dur:'1177s', mac:'54-2b-de-6d-10-ae', src:'1.24.19.125:17629', dst:'101.6.15.130:443', trans:'TCP', app:'其它HTTPS', upPkt:'186', dnPkt:'428', upTraffic:'28.6 K', dnTraffic:'186.4 K', status:'完成' },
  { id:2, start:'2026-06-15 14:05:12', end:'2026-06-15 14:18:43', dur:'811s', mac:'54-2b-de-6d-10-ae', src:'166.111.7.7:53', dst:'101.6.10.23:8080', trans:'TCP', app:'WWW', upPkt:'642', dnPkt:'1286', upTraffic:'86.4 K', dnTraffic:'1.28 M', status:'完成' },
  { id:3, start:'2026-06-15 14:06:28', end:'2026-06-15 14:16:55', dur:'627s', mac:'00-1c-42-a8-b2-f6', src:'183.222.90.184:443', dst:'166.111.7.8:52186', trans:'TCP', app:'其它HTTPS', upPkt:'428', dnPkt:'864', upTraffic:'42.8 K', dnTraffic:'428.6 K', status:'完成' },
]
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
.ta-placeholder { padding:40px; text-align:center; color:#909399; font-size:14px; }

.tdh-filters { padding:10px 14px; border-bottom:1px solid #ebeef5; }
.tdh-filter-row { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:8px; align-items:center; }
.tdh-filter-row:last-child { margin-bottom:0; }
.tdh-filter-field { display:flex; align-items:center; gap:4px; }
.ou-toolbar-label { font-size:13px; color:#606266; white-space:nowrap; }
.ou-toolbar-select { height:28px; padding:0 8px; border:1px solid #dcdfe6; border-radius:4px; font-size:13px; background:#fff; }
.ou-toolbar-input { height:28px; padding:0 8px; border:1px solid #dcdfe6; border-radius:4px; font-size:13px; width:100px; }
.tdh-time-range { width:260px; }
.tdh-ip-version { display:flex; gap:0; }
.tio-range-btn { height:28px; padding:0 10px; border:1px solid #dcdfe6; background:#fff; font-size:12px; cursor:pointer; }
.tio-range-btn:first-child { border-radius:4px 0 0 4px; }
.tio-range-btn:last-child { border-radius:0 4px 4px 0; border-left:none; }
.tio-range-btn.active { background:#409eff; color:#fff; border-color:#409eff; }
.hsa-unit { font-size:12px; color:#909399; }
.ou-search-btn { height:30px; padding:0 14px; border:1px solid #409eff; border-radius:4px; background:#409eff; color:#fff; font-size:13px; cursor:pointer; }
.ou-search-btn:disabled { opacity:.55; cursor:not-allowed; }
.secondary { height:30px; padding:0 14px; border:1px solid #dcdfe6; border-radius:4px; background:#fff; color:#606266; font-size:13px; cursor:pointer; }
.secondary:disabled { opacity:.55; cursor:not-allowed; }

.tdh-table-bar { display:flex; gap:6px; padding:6px 14px; border-bottom:1px solid #ebeef5; }
.td-icon-btn { width:28px; height:28px; border:1px solid #dcdfe6; border-radius:4px; background:#fff; cursor:pointer; font-size:14px; display:flex; align-items:center; justify-content:center; }
.td-icon-btn:disabled { opacity:.55; cursor:not-allowed; }

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

.tst-hr-body { display:grid; grid-template-columns:1fr 1fr; gap:12px; padding:12px 14px; }
.tst-sankey-panel { border:1px solid #ebeef5; border-radius:4px; padding:12px; }
.tst-sankey-head { display:flex; justify-content:space-between; font-size:13px; color:#606266; margin-bottom:8px; }
.tst-sankey-chart { height:200px; background:#f9fafb; border-radius:4px; }
.tid-mini-panel { border:1px solid #ebeef5; border-radius:4px; overflow:auto; }
</style>
