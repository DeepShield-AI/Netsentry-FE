<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav" role="tablist" aria-label="会话时延">
        <button type="button" class="nv-tab active" role="tab" aria-selected="true">会话时延</button>
      </div>
    </div>
    <div class="nv-tabs-body">
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
          <label class="tdh-filter-field"><span class="ou-toolbar-label">域名</span><select class="ou-toolbar-select" disabled><option>任意</option></select><input class="ou-toolbar-input tdh-filter-input" disabled /></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">应用协议</span><select class="ou-toolbar-select" disabled><option>应用协议</option></select></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">客户时延&gt;=</span><input class="ou-toolbar-input tdh-filter-input pq-unit-input" disabled /><span class="pq-unit">ms</span></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">服务时延&gt;=</span><input class="ou-toolbar-input tdh-filter-input pq-unit-input" disabled /><span class="pq-unit">ms</span></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">应用时延&gt;=</span><input class="ou-toolbar-input tdh-filter-input pq-unit-input" disabled /><span class="pq-unit">ms</span></label>
        </div>
        <div class="tdh-filter-row">
          <label class="tdh-filter-field"><span class="ou-toolbar-label">传输协议</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">连接类型</span><select class="ou-toolbar-select" disabled><option>所有</option></select></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">条件关系</span><select class="ou-toolbar-select" disabled><option>与</option><option>或</option></select></label>
          <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" value="2026-06-15 10:33:30 - 2026-06-15 10:48:30" disabled /></label>
          <button class="ou-search-btn" disabled>搜索</button>
          <button class="secondary td-reset-btn" disabled>重置</button>
          <button class="secondary" disabled>更多条件 ▾</button>
        </div>
      </div>

      <div class="td-toolbar-actions pqsl-toolbar">
        <button class="td-icon-btn" disabled title="播放">▶</button>
        <button class="td-icon-btn" disabled title="导出">⬇</button>
        <button class="td-icon-btn" disabled title="刷新">↻</button>
        <button class="td-icon-btn" disabled title="列设置">☰</button>
      </div>

      <div class="ou-table-wrap">
        <table class="ou-table pqsl-table">
          <thead><tr><th class="col-check"><input type="checkbox" disabled /></th><th>请求时间</th><th>MAC</th><th>MAC厂商</th><th>用户名称</th><th>源IP</th><th>目标IP</th><th>目标地理位置</th><th>传输协议</th><th>请求域名</th><th>敏感网站</th><th>应用协议</th><th class="col-actions">操作</th></tr></thead>
          <tbody>
            <tr v-for="(r,i) in rows" :key="i">
              <td><input type="checkbox" disabled /></td><td>{{ r.t }}</td><td>{{ r.mac }}</td><td><span class="dt-ellipsis">{{ r.vendor }}</span></td><td>—</td><td>{{ r.src }}</td><td>{{ r.dst }}</td><td>🇨🇳 北京|BGP</td><td>{{ r.proto }}</td><td>—</td><td>—</td><td>{{ r.app }}</td><td class="col-actions"><button class="link-btn" disabled>数据包</button></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="ou-footer">
        <div class="ou-footer-left"><div class="ou-pager"><button class="ou-page-btn" disabled>‹</button><button class="ou-page-btn active" disabled>1</button><button class="ou-page-btn" disabled>2</button><button class="ou-page-btn" disabled>3</button><span class="ou-page-ellipsis">…</span><button class="ou-page-btn" disabled>2381</button><button class="ou-page-btn" disabled>›</button></div></div>
        <div class="ou-footer-right"><label class="ou-page-goto">到第 <input class="ou-page-goto-input" value="1" disabled /> 页 <button class="ou-page-goto-btn" disabled>确定</button></label><span>共 238046 条</span><label class="ou-page-size"><select disabled><option>100 条/页</option></select></label></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import './nv-shared.css'
const rows = Array.from({ length: 8 }, (_, i) => ({
  t: `2026-06-15 10:34:${(27 - i).toString().padStart(2, '0')}`,
  mac: '54-2b-de-6d-10-ae', vendor: 'NewH3CTechno...',
  src: `223.86.154.174:${18963 - i}`, dst: `101.6.6.6:${9409 - i}`,
  proto: 'ICMP', app: 'ICMP',
}))
</script>

<style scoped>
.pqsl-toolbar { display:flex; gap:6px; padding:6px 12px; border-bottom:1px solid #ebeef5; background:#fafbfc; justify-content:flex-end; }
.pqsl-table th, .pqsl-table td { font-size:12px; padding:6px 8px; }
.pqsl-table { min-width:1400px; }
.pq-unit { font-size:12px; color:#909399; margin-left:-4px; }
.pq-unit-input { width:80px; }
.dt-ellipsis { display:inline-block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; vertical-align:bottom; max-width:120px; }
</style>
