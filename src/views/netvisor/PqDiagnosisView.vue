<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav" role="tablist" aria-label="质量诊断">
        <button type="button" class="nv-tab active" role="tab" aria-selected="true">质量诊断</button>
      </div>
    </div>
    <div class="nv-tabs-body">
      <div class="tid-page pqd-page">
        <div class="tdh-filters">
          <div class="tdh-filter-row">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">源IP</span><select class="ou-toolbar-select" disabled><option>任意IP</option></select><input class="ou-toolbar-input tdh-filter-input" placeholder="任意IP" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">过滤源</span><select class="ou-toolbar-select" disabled><option>否</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">源端口</span><input class="ou-toolbar-input tdh-filter-input" placeholder="80 / 8000-8080" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">目标IP</span><select class="ou-toolbar-select" disabled><option>任意IP</option></select><input class="ou-toolbar-input tdh-filter-input" placeholder="任意IP" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">过滤目标</span><select class="ou-toolbar-select" disabled><option>否</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">目标端口</span><input class="ou-toolbar-input tdh-filter-input" placeholder="80 / 8000-8080" disabled /></label>
            <div class="tio-range-btns"><button class="tio-range-btn active" disabled>IPv4</button><button class="tio-range-btn" disabled>IPv6</button></div>
          </div>
          <div class="tdh-filter-row">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">MAC</span><input class="ou-toolbar-input tdh-filter-input" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">应用协议</span><select class="ou-toolbar-select" disabled><option>任意协议</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">源IP ISP</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">目标IP ISP</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">源IP区域</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">目标IP区域</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
          </div>
          <div class="tdh-filter-row">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">传输协议</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">域名</span><input class="ou-toolbar-input tdh-filter-input" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">客户时延&gt;=</span><input class="ou-toolbar-input tdh-filter-input pq-unit-input" disabled /><span class="pq-unit">ms</span></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">服务时延&gt;=</span><input class="ou-toolbar-input tdh-filter-input pq-unit-input" disabled /><span class="pq-unit">ms</span></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">应用时延&gt;=</span><input class="ou-toolbar-input tdh-filter-input pq-unit-input" disabled /><span class="pq-unit">ms</span></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">账号备注</span><input class="ou-toolbar-input tdh-filter-input" disabled /></label>
          </div>
          <div class="tdh-filter-row">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">链路</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
            <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" value="2026-06-15 10:33:11 - 2026-06-15 10:48:11" disabled /></label>
            <button class="ou-search-btn" disabled>搜索</button>
            <button class="secondary td-reset-btn" disabled>重置</button>
            <button class="link-btn" disabled>⬇ 导出</button>
          </div>
        </div>

        <div class="pq-scroll">
          <div class="pq-mid-grid">
            <section class="tid-chart-panel">
              <div class="tid-chart-head"><h3 class="tid-mini-title">会话趋势</h3></div>
              <div class="tid-chart-body"><span class="tid-yunit">Session#</span><div class="to-chart-plot"><div class="to-chart-placeholder">趋势图占位</div></div></div>
              <div class="dtt-chart-stats"><span class="dtt-stat"><i class="dtt-stat-badge max">MAX</i>最大值 <strong>924133</strong></span><span class="dtt-stat"><i class="dtt-stat-badge min">MIN</i>最小值 <strong>178494</strong></span><span class="dtt-stat"><i class="dtt-stat-badge avg">AVG</i>平均值 <strong>755133</strong></span></div>
            </section>
            <section class="tid-mini-panel">
              <div class="tid-mini-head"><h3 class="tid-mini-title">应用协议</h3><button class="tid-expand-btn" disabled>⛶</button></div>
              <div class="ou-table-wrap tid-mini-table-wrap">
                <table class="ou-table tid-mini-table pq-table">
                  <thead><tr><th class="col-idx">序号</th><th>应用协议</th><th class="ou-num">总请求数</th><th class="ou-num">失败次数</th><th class="ou-num">平均时延</th></tr></thead>
                  <tbody>
                    <tr v-for="(r,i) in protos" :key="i"><td class="col-idx">{{ i+1 }}</td><td>{{ r.name }}</td><td class="pq-bar-col"><span class="pq-bar-cell"><span class="pq-bar-track"><span class="pq-bar-fill" :style="{ width: r.reqW + '%' }"></span></span><span class="pq-bar-val">{{ r.req }}</span></span></td><td class="pq-bar-col"><span class="pq-bar-cell"><span class="pq-bar-track"><span class="pq-bar-fill pq-bar-fill-fail" :style="{ width: r.failW + '%' }"></span></span><span class="pq-bar-val">{{ r.fail }}</span></span></td><td><span class="pq-latency-badge" :class="{ 'pq-latency-good': r.good }">{{ r.lat }}</span></td></tr>
                  </tbody>
                </table>
              </div>
              <div class="ou-footer"><div class="ou-pager"><button class="ou-page-btn" disabled>‹</button><button class="ou-page-btn active" disabled>1</button><button class="ou-page-btn" disabled>2</button><button class="ou-page-btn" disabled>›</button></div><span>共 193 条</span></div>
            </section>
          </div>

          <div class="pq-bottom-grid">
            <section class="tid-mini-panel" v-for="mini in minis" :key="mini.title">
              <div class="tid-mini-head"><h3 class="tid-mini-title">{{ mini.title }}</h3><button class="tid-expand-btn" disabled>⛶</button></div>
              <div class="ou-table-wrap tid-mini-table-wrap">
                <table class="ou-table tid-mini-table pq-table">
                  <thead><tr><th class="col-idx">序号</th><th>{{ mini.title }}</th><th class="ou-num">总请求数</th><th class="ou-num">失败次数</th><th class="ou-num">平均时延</th></tr></thead>
                  <tbody>
                    <tr v-for="(r,i) in mini.rows" :key="i"><td class="col-idx">{{ i+1 }}</td><td><span class="tid-link dt-ellipsis">{{ r.name }}</span></td><td class="pq-bar-col"><span class="pq-bar-cell"><span class="pq-bar-track"><span class="pq-bar-fill" :style="{ width: r.reqW + '%' }"></span></span><span class="pq-bar-val">{{ r.req }}</span></span></td><td class="pq-bar-col"><span class="pq-bar-cell"><span class="pq-bar-track"><span class="pq-bar-fill pq-bar-fill-fail" :style="{ width: r.failW + '%' }"></span></span><span class="pq-bar-val">{{ r.fail }}</span></span></td><td><span class="pq-latency-badge" :class="{ 'pq-latency-good': r.good }">{{ r.lat }}</span></td></tr>
                  </tbody>
                </table>
              </div>
              <div class="ou-footer"><div class="ou-pager"><button class="ou-page-btn" disabled>‹</button><button class="ou-page-btn active" disabled>1</button><button class="ou-page-btn" disabled>2</button><button class="ou-page-btn" disabled>3</button><span class="ou-page-ellipsis">…</span><button class="ou-page-btn" disabled>{{ mini.pages }}</button><button class="ou-page-btn" disabled>›</button></div><span>共 {{ mini.total }} 条</span></div>
            </section>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import './nv-shared.css'
const protos = [
  { name: '其它HTTPS', req: 792044, reqW: 100, fail: 379081, failW: 48, lat: '83.71', good: true },
  { name: 'SYN_ACK', req: 402592, reqW: 51, fail: 371160, failW: 92, lat: '147.67', good: false },
  { name: 'WWW', req: 298640, reqW: 38, fail: 48620, failW: 12, lat: '136.41', good: true },
  { name: 'DNS', req: 218420, reqW: 28, fail: 28640, failW: 8, lat: '62.18', good: true },
  { name: 'SSH', req: 118640, reqW: 15, fail: 86420, failW: 22, lat: '752.80', good: false },
  { name: 'ICMP', req: 98640, reqW: 12, fail: 4280, failW: 3, lat: '18.42', good: true },
]
const minis = [
  { title: '源IP', total: 770202, pages: 7703, rows: [
    { name: '101.6.14.166', req: 4624, reqW: 100, fail: 4621, failW: 100, lat: '219.00', good: false },
    { name: '113.120.243.33', req: 4486, reqW: 97, fail: 4480, failW: 100, lat: '200.56', good: false },
    { name: '101.6.15.28', req: 3286, reqW: 72, fail: 842, failW: 18, lat: '86.24', good: true },
    { name: '183.221.5.29', req: 2684, reqW: 58, fail: 520, failW: 12, lat: '78.42', good: true },
    { name: '101.6.10.23', req: 1986, reqW: 42, fail: 286, failW: 8, lat: '62.18', good: true },
    { name: '223.86.154.174', req: 1642, reqW: 35, fail: 128, failW: 5, lat: '42.86', good: true },
  ]},
  { title: '目标IP', total: 25995, pages: 260, rows: [
    { name: '101.6.15.130', req: 761010, reqW: 100, fail: 621216, failW: 82, lat: '152.22', good: false },
    { name: '101.6.8.99', req: 518420, reqW: 68, fail: 286420, failW: 45, lat: '186.42', good: false },
    { name: '101.6.6.6', req: 398640, reqW: 52, fail: 5289, failW: 12, lat: '88.15', good: true },
    { name: '101.6.15.70', req: 286420, reqW: 38, fail: 6910, failW: 8, lat: '86.99', good: true },
    { name: '8.8.8.8', req: 168420, reqW: 22, fail: 4280, failW: 5, lat: '72.18', good: true },
    { name: '101.6.15.66', req: 141035, reqW: 18, fail: 6663, failW: 5, lat: '78.59', good: true },
  ]},
  { title: '目标域名', total: 29311, pages: 294, rows: [
    { name: 'mirrors.tuna.tsinghua.edu.cn', req: 128642, reqW: 100, fail: 36420, failW: 28, lat: '68.42', good: true },
    { name: 'pypi.tuna.tsinghua.edu.cn', req: 92864, reqW: 72, fail: 18642, failW: 18, lat: '72.18', good: true },
    { name: 'www.qq.com', req: 72864, reqW: 58, fail: 8642, failW: 12, lat: '86.24', good: true },
    { name: 'lib.tsinghua.edu.cn', req: 50680, reqW: 42, fail: 3240, failW: 8, lat: '42.18', good: true },
    { name: 'cloud.tsinghua.edu.cn', req: 26819, reqW: 28, fail: 627, failW: 3, lat: '34.40', good: true },
    { name: 'dns.google', req: 16842, reqW: 18, fail: 286, failW: 2, lat: '28.64', good: true },
  ]},
]
</script>

<style scoped>
.pq-scroll { flex:1; min-height:0; overflow:auto; display:flex; flex-direction:column; gap:12px; padding:12px; }
.pq-mid-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.pq-bottom-grid { display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:12px; }
.pq-unit { font-size:12px; color:#909399; margin-left:-4px; }
.pq-unit-input { width:80px; }
.pq-table th, .pq-table td { font-size:12px; padding:6px 8px; }
.pq-bar-col { width:150px; }
.pq-bar-cell { display:flex; align-items:center; gap:6px; }
.pq-bar-track { flex:1; height:6px; background:#f0f2f5; border-radius:3px; overflow:hidden; min-width:40px; }
.pq-bar-fill { display:block; height:100%; background:#409eff; border-radius:3px; }
.pq-bar-fill-fail { background:#f56c6c; }
.pq-bar-val { font-variant-numeric:tabular-nums; min-width:56px; text-align:right; font-size:11px; color:#606266; }
.pq-latency-badge { display:inline-block; padding:1px 8px; border-radius:2px; font-size:11px; font-weight:600; background:#fef0f0; color:#f56c6c; font-variant-numeric:tabular-nums; }
.pq-latency-good { background:#f0f9eb; color:#67c23a; }
.dt-ellipsis { display:inline-block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; vertical-align:bottom; max-width:180px; }
@media (max-width:1200px){ .pq-mid-grid,.pq-bottom-grid { grid-template-columns:1fr; } }
</style>
