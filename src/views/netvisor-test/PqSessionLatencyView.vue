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
          <thead><tr><th class="col-check"><input type="checkbox" disabled /></th><th>请求时间</th><th>MAC</th><th>MAC厂商</th><th>用户名称</th><th>源IP</th><th>目标IP</th><th>目标地理位置</th><th>传输协议</th><th>请求域名</th><th>敏感网站</th><th>应用协议</th><th>客户时延(ms)</th><th>服务时延(ms)</th><th>应用时延(ms)</th><th class="col-actions">操作</th></tr></thead>
          <tbody>
            <tr v-for="(r,i) in rows" :key="i">
              <td><input type="checkbox" disabled /></td><td>{{ r.t }}</td><td>{{ r.mac }}</td><td><span class="dt-ellipsis">{{ r.vendor }}</span></td><td>—</td><td>{{ r.src }}</td><td>{{ r.dst }}</td><td>{{ r.geo }}</td><td>{{ r.proto }}</td><td><span class="dt-ellipsis">{{ r.domain }}</span></td><td>—</td><td>{{ r.app }}</td><td class="ou-num">{{ r.clientLat }}</td><td class="ou-num">{{ r.serverLat }}</td><td class="ou-num">{{ r.appLat }}</td><td class="col-actions"><button class="link-btn" disabled>数据包</button></td>
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
const rows = [
  { t: '2026-06-15 10:34:27', mac: '54-2b-de-6d-10-ae', vendor: 'NewH3CTechno...', src: '223.86.154.174:18963', dst: '101.6.6.6:9409', geo: '🇨🇳 北京|BGP', proto: 'TCP', domain: 'mirrors.tuna.tsinghua.edu.cn', app: '其它HTTPS', clientLat: '42', serverLat: '28', appLat: '12' },
  { t: '2026-06-15 10:34:26', mac: '54-2b-de-6d-10-ae', vendor: 'NewH3CTechno...', src: '113.120.243.33:18962', dst: '101.6.15.130:443', geo: '🇨🇳 北京|BGP', proto: 'TCP', domain: 'work.weixin.qq.com', app: '其它HTTPS', clientLat: '86', serverLat: '45', appLat: '28' },
  { t: '2026-06-15 10:34:25', mac: '54-2b-de-6d-10-ae', vendor: 'NewH3CTechno...', src: '101.6.15.28:18961', dst: '101.6.6.6:53', geo: '🇨🇳 北京|BGP', proto: 'UDP', domain: 'www.qq.com', app: 'DNS', clientLat: '8', serverLat: '4', appLat: '2' },
  { t: '2026-06-15 10:34:24', mac: '54-2b-de-6d-10-ae', vendor: 'NewH3CTechno...', src: '183.221.5.29:18960', dst: '166.111.5.212:443', geo: '🇨🇳 北京|BGP', proto: 'TCP', domain: 'pypi.tuna.tsinghua.edu.cn', app: '其它下载', clientLat: '120', serverLat: '68', appLat: '35' },
  { t: '2026-06-15 10:34:23', mac: '54-2b-de-6d-10-ae', vendor: 'NewH3CTechno...', src: '101.6.10.23:18959', dst: '101.6.8.149:80', geo: '🇨🇳 北京|BGP', proto: 'TCP', domain: 'cn.bing.com', app: 'WWW', clientLat: '65', serverLat: '32', appLat: '18' },
  { t: '2026-06-15 10:34:22', mac: '54-2b-de-6d-10-ae', vendor: 'NewH3CTechno...', src: '36.170.12.75:18958', dst: '101.6.15.67:993', geo: '🇨🇳 北京|BGP', proto: 'TCP', domain: '', app: 'IMAP', clientLat: '240', serverLat: '120', appLat: '60' },
  { t: '2026-06-15 10:34:21', mac: '54-2b-de-6d-10-ae', vendor: 'NewH3CTechno...', src: '101.6.15.130:18957', dst: '101.6.6.6:22', geo: '🇨🇳 北京|BGP', proto: 'TCP', domain: '', app: 'SSH', clientLat: '752', serverLat: '386', appLat: '128' },
  { t: '2026-06-15 10:34:20', mac: '54-2b-de-6d-10-ae', vendor: 'NewH3CTechno...', src: '223.86.154.174:18956', dst: '101.6.6.6:123', geo: '🇨🇳 北京|BGP', proto: 'UDP', domain: '', app: 'NTP', clientLat: '2', serverLat: '1', appLat: '0' },
]
</script>

<style scoped>
.pqsl-toolbar { display:flex; gap:6px; padding:6px 12px; border-bottom:1px solid #ebeef5; background:#fafbfc; justify-content:flex-end; }
.pqsl-table th, .pqsl-table td { font-size:12px; padding:6px 8px; }
.pqsl-table { min-width:1400px; }
.pq-unit { font-size:12px; color:#909399; margin-left:-4px; }
.pq-unit-input { width:80px; }
.dt-ellipsis { display:inline-block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; vertical-align:bottom; max-width:120px; }
</style>
