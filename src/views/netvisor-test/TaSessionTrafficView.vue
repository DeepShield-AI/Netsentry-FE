<template>
  <div class="nvt-page">
    <!-- Tab bar -->
    <div class="nvt-tabs-header">
      <div class="nvt-tabs-nav">
        <button v-for="t in tabs" :key="t.key" class="nvt-tab" :class="{ active: activeTab === t.key }" @click="activeTab = t.key">{{ t.label }}</button>
      </div>
    </div>

    <!-- 历史流量 -->
    <div v-show="activeTab === 'traffic'" class="tst-st-page">
      <div class="tdh-filters tst-st-filters">
        <div class="tdh-filter-row">
          <label class="tdh-filter-field"><span class="ou-toolbar-label">源IP</span><select class="ou-toolbar-select" disabled><option selected>任意IP</option></select><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="任意IP" disabled /></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">过滤源</span><select class="ou-toolbar-select" disabled><option selected>否</option></select></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">源端口</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="80 / 8000-8080" disabled /></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">目标IP</span><select class="ou-toolbar-select" disabled><option selected>任意IP</option></select><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="任意IP" disabled /></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">过滤目标</span><select class="ou-toolbar-select" disabled><option selected>否</option></select></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">目标端口</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="80 / 8000-8080" disabled /></label>
          <div class="tdh-filter-field tdh-ip-version" role="group"><div class="tio-range-btns"><button type="button" class="tio-range-btn active" disabled>IPv4</button><button type="button" class="tio-range-btn" disabled>IPv6</button></div></div>
        </div>
        <div class="tdh-filter-row">
          <label class="tdh-filter-field"><span class="ou-toolbar-label">MAC</span><input class="ou-toolbar-input tdh-filter-input" type="text" disabled /></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">域名</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select><input class="ou-toolbar-input tdh-filter-input" type="text" disabled /></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">应用协议</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">连接类型</span><select class="ou-toolbar-select" disabled><option selected>所有</option></select></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">上行字节>=</span><input class="ou-toolbar-input tdh-filter-input" type="text" disabled /><span class="hsa-unit">Byte</span></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">下行字节>=</span><input class="ou-toolbar-input tdh-filter-input" type="text" disabled /><span class="hsa-unit">Byte</span></label>
        </div>
        <div class="tdh-filter-row tdh-filter-row-actions">
          <label class="tdh-filter-field"><span class="ou-toolbar-label">传输协议</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">上行包数>=</span><input class="ou-toolbar-input tdh-filter-input" type="text" disabled /><span class="hsa-unit">个</span></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">下行包数>=</span><input class="ou-toolbar-input tdh-filter-input" type="text" disabled /><span class="hsa-unit">个</span></label>
          <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" type="text" value="2026-06-15 14:01:17 - 2026-06-15 14:16:17" disabled /></label>
          <button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button>
          <button type="button" class="secondary td-reset-btn" disabled title="暂未开放">重置</button>
          <button type="button" class="secondary hsa-more-btn" disabled title="暂未开放">更多条件 ▾</button>
        </div>
      </div>
      <div class="tdh-table-bar"><div class="td-toolbar-actions"><button type="button" class="td-icon-btn" disabled title="播放">▶</button><button type="button" class="td-icon-btn" disabled title="导出">⬇</button><button type="button" class="td-icon-btn" disabled title="图表">📊</button><button type="button" class="td-icon-btn" disabled title="列设置">☰</button></div></div>
      <div class="ou-table-wrap tst-st-table-wrap">
        <table class="ou-table tst-st-table">
          <thead>
            <tr>
              <th class="col-check" rowspan="2"><input type="checkbox" disabled /></th><th class="col-time ou-th-sort" rowspan="2">请求时间</th><th class="col-time" rowspan="2">结束时间</th><th class="col-dur" rowspan="2">时长</th><th class="col-mac" rowspan="2">MAC</th><th class="col-mac-vendor" rowspan="2">MAC厂商</th><th class="col-user" rowspan="2">用户名称</th><th class="col-endpoint" rowspan="2">源IP</th><th class="col-endpoint" rowspan="2">目标IP</th><th class="col-geo" rowspan="2">目标地理位置</th><th class="col-trans" rowspan="2">传输协议</th><th class="col-domain" rowspan="2">请求域名</th><th class="col-sens" rowspan="2">敏感网站</th><th class="col-intel" rowspan="2">情报命中</th><th class="col-app" rowspan="2">应用协议</th><th class="col-seq" rowspan="2">SEQ/IPID</th><th class="col-link" rowspan="2">链路</th><th class="hsa-th-group" colspan="2">包数</th><th class="hsa-th-group" colspan="2">重置包数</th><th class="hsa-th-group" colspan="2">流量</th><th class="col-iface" rowspan="2">首包接口</th><th class="col-status" rowspan="2">状态</th><th class="col-actions" rowspan="2">操作</th>
            </tr>
            <tr><th class="col-split">上行</th><th class="col-split">下行</th><th class="col-split">上行</th><th class="col-split">下行</th><th class="col-traffic">上行</th><th class="col-traffic">下行</th></tr>
          </thead>
          <tbody>
            <tr v-for="r in trafficRows" :key="r.idx">
              <td class="col-check"><input type="checkbox" disabled /></td>
              <td class="col-time">{{ r.startTime }}</td><td class="col-time">{{ r.endTime }}</td><td class="col-dur">{{ r.duration }}</td>
              <td class="col-mac">{{ r.mac }}</td><td class="col-mac-vendor"><span class="hsa-ellipsis">{{ r.vendor }}</span></td><td class="col-user">—</td>
              <td class="col-endpoint"><span class="hsa-endpoint">{{ r.srcIp }}</span></td><td class="col-endpoint"><span class="hsa-endpoint">{{ r.dstIp }}</span></td>
              <td class="col-geo"><span class="hsa-geo">{{ r.geo }}</span></td><td class="col-trans">{{ r.proto }}</td>
              <td class="col-domain"><span class="tid-link hsa-ellipsis">{{ r.domain }}</span></td><td class="col-sens">—</td><td class="col-intel">—</td>
              <td class="col-app">{{ r.app }}</td><td class="col-seq"><span class="hsa-ellipsis">{{ r.seq }}</span></td><td class="col-link">—</td>
              <td class="col-split">{{ r.upPkts }}</td><td class="col-split">{{ r.dnPkts }}</td><td class="col-split">{{ r.upRst }}</td><td class="col-split">{{ r.dnRst }}</td>
              <td class="col-traffic">{{ r.upTraffic }}</td><td class="col-traffic">{{ r.dnTraffic }}</td><td class="col-iface">{{ r.iface }}</td>
              <td class="col-status" :class="{ 'hsa-status-fail': r.status === '失败' }">{{ r.status }}</td>
              <td class="col-actions"><button type="button" class="link-btn" disabled>数据包</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="ou-footer ou-footer-td tst-st-footer">
        <div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn active" disabled>1</button><button type="button" class="ou-page-btn" disabled>2</button><button type="button" class="ou-page-btn" disabled>3</button><span class="ou-page-ellipsis">…</span><button type="button" class="ou-page-btn" disabled>223757</button><button type="button" class="ou-page-btn" disabled>›</button></div></div>
        <div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页 <button type="button" class="ou-page-goto-btn" disabled>确定</button></label><span>共 22375688 条</span><label class="ou-page-size"><select disabled><option selected>100 条/页</option></select></label></div>
      </div>
    </div>

    <!-- 历史关系 -->
    <div v-show="activeTab === 'history-relation'" class="tst-hr-page">
      <div class="tdh-filters tst-hr-filters">
        <div class="tdh-filter-row tdh-filter-row-actions">
          <label class="tdh-filter-field"><span class="ou-toolbar-label">源IP</span><select class="ou-toolbar-select" disabled><option selected>任意IP</option></select><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="任意IP" disabled /></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">源端口</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="80 / 8000-8080" disabled /></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">目标IP</span><select class="ou-toolbar-select" disabled><option selected>任意IP</option></select><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="任意IP" disabled /></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">目标端口</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="80 / 8000-8080" disabled /></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">应用协议</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
          <button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button>
          <button type="button" class="secondary td-reset-btn" disabled title="暂未开放">重置</button>
          <button type="button" class="secondary hsa-more-btn" disabled title="暂未开放">更多条件 ▾</button>
          <div class="tdh-filter-field tdh-ip-version" role="group"><div class="tio-range-btns"><button type="button" class="tio-range-btn active" disabled>IPv4</button><button type="button" class="tio-range-btn" disabled>IPv6</button></div></div>
        </div>
      </div>
      <div class="tst-hr-body">
        <div class="tst-sankey-panel">
          <div class="tst-sankey-head"><span>源</span><span>主动访问</span><span>目标</span></div>
          <div class="tst-sankey-chart"><span class="ou-empty">桑基图区域 (mock)</span></div>
        </div>
        <div class="tid-mini-panel tst-hr-side-panel">
          <div class="ou-table-wrap tid-mini-table-wrap">
            <table class="ou-table til-table tid-mini-table tst-hr-table">
              <thead><tr><th class="col-idx">序号</th><th class="col-ip">IP</th><th class="col-metric ou-th-sort">连接数</th><th class="col-traffic ou-th-sort">上行流量</th><th class="col-traffic ou-th-sort">下行流量</th></tr></thead>
              <tbody>
                <tr v-for="r in hrRows" :key="r.idx"><td class="col-idx">{{ r.idx }}</td><td class="col-ip"><span class="tid-link">{{ r.ip }}</span></td><td class="col-metric ou-num">{{ r.conns }}</td><td class="col-traffic ou-num">{{ r.up }}</td><td class="col-traffic ou-num">{{ r.dn }}</td></tr>
              </tbody>
            </table>
          </div>
          <div class="ou-footer cbm-ro-mini-footer"><div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn active" disabled>1</button><button type="button" class="ou-page-btn" disabled>2</button><button type="button" class="ou-page-btn" disabled>3</button><span class="ou-page-ellipsis">…</span><button type="button" class="ou-page-btn" disabled>8046</button><button type="button" class="ou-page-btn" disabled>›</button></div></div><div class="ou-footer-right"><span>共 804535 条</span></div></div>
        </div>
      </div>
    </div>

    <!-- 实时会话 -->
    <div v-show="activeTab === 'realtime-session'" class="tst-rs-page">
      <div class="tdh-filters tst-rs-filters">
        <div class="tdh-filter-row">
          <label class="tdh-filter-field dba-refresh-field"><span class="ou-toolbar-label">自动刷新</span><select class="ou-toolbar-select" disabled><option value="0" selected>不刷新</option><option value="2000">2 秒</option><option value="5000">5 秒</option><option value="10000">10 秒</option></select></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">IP</span><input class="ou-toolbar-input tdh-filter-input" type="text" disabled /></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">端口</span><input class="ou-toolbar-input tdh-filter-input" type="text" disabled /></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">接口线路</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">传输协议</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">应用协议</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
        </div>
        <div class="tdh-filter-row tdh-filter-row-actions">
          <label class="tdh-filter-field"><span class="ou-toolbar-label">连接时长>=</span><input class="ou-toolbar-input tdh-filter-input" type="text" disabled /><span class="dsa-unit">秒</span></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">客户时延>=</span><input class="ou-toolbar-input tdh-filter-input" type="text" disabled /><span class="dsa-unit">ms</span></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">服务时延>=</span><input class="ou-toolbar-input tdh-filter-input" type="text" disabled /><span class="dsa-unit">ms</span></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">应用时延>=</span><input class="ou-toolbar-input tdh-filter-input" type="text" disabled /><span class="dsa-unit">ms</span></label>
          <label class="tdh-filter-field tst-rs-keyword"><span class="ou-toolbar-label">其它</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="关键字查询" disabled /></label>
          <button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button>
          <div class="td-toolbar-actions tst-rs-toolbar"><button type="button" class="td-icon-btn" disabled title="说明">ⓘ</button><button type="button" class="td-icon-btn" disabled title="监控">📈</button><button type="button" class="td-icon-btn" disabled title="列设置">☰</button></div>
        </div>
      </div>
      <div class="ou-table-wrap tst-rs-table-wrap">
        <table class="ou-table tst-rs-table">
          <thead><tr><th class="col-app ou-th-sort">应用</th><th class="col-proto ou-th-sort">协议</th><th class="col-status">状态</th><th class="col-conn">首包连接</th><th class="col-geo">地理位置</th><th class="col-dur ou-th-sort">时长</th><th class="col-latency ou-th-sort">客户时延</th><th class="col-latency ou-th-sort">服务时延</th><th class="col-latency ou-th-sort">应用时延</th><th class="col-split">上行报文</th><th class="col-split">下行报文</th><th class="col-split">最大包长</th><th class="col-mss ou-th-sort">MSS</th><th class="col-traffic">流量/B</th><th class="col-rate">速率/b</th><th class="col-host">HOST</th></tr></thead>
          <tbody>
            <tr v-for="r in rsRows" :key="r.idx">
              <td class="col-app">{{ r.app }}</td><td class="col-proto">{{ r.proto }}</td><td class="col-status">{{ r.status }}</td>
              <td class="col-conn"><span class="tst-conn-iface">{{ r.iface }}</span><span class="tst-conn-endpoint">源:{{ r.src }}</span><span class="tst-conn-endpoint">目:{{ r.dst }}</span></td>
              <td class="col-geo">{{ r.geo }}</td><td class="col-dur">{{ r.duration }}</td>
              <td class="col-latency ou-num">{{ r.clientLat }}</td><td class="col-latency ou-num">{{ r.serverLat }}</td><td class="col-latency ou-num">{{ r.appLat }}</td>
              <td class="col-split">{{ r.upPkts }}</td><td class="col-split">{{ r.dnPkts }}</td><td class="col-split">{{ r.maxLen }}</td>
              <td class="col-mss ou-num">{{ r.mss }}</td><td class="col-traffic">{{ r.traffic }}</td><td class="col-rate">{{ r.rate }}</td>
              <td class="col-host"><span class="tid-link hsa-ellipsis">{{ r.host }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="ou-footer ou-footer-td tst-rs-footer">
        <div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn active" disabled>1</button><button type="button" class="ou-page-btn" disabled>2</button><button type="button" class="ou-page-btn" disabled>3</button><span class="ou-page-ellipsis">…</span><button type="button" class="ou-page-btn" disabled>525</button><button type="button" class="ou-page-btn" disabled>›</button></div></div>
        <div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页 <button type="button" class="ou-page-goto-btn" disabled>确定</button></label><span>共 262144 条</span><label class="ou-page-size"><select disabled><option selected>500 条/页</option></select></label></div>
      </div>
    </div>

    <!-- 实时关系 -->
    <div v-show="activeTab === 'realtime-relation'" class="tst-rr-page">
      <div class="tdh-filters tst-rr-filters">
        <div class="tdh-filter-row tdh-filter-row-actions">
          <label class="tdh-filter-field dba-refresh-field"><span class="ou-toolbar-label">自动刷新</span><select class="ou-toolbar-select" disabled><option value="0" selected>不刷新</option><option value="2000">2 秒</option><option value="5000">5 秒</option><option value="10000">10 秒</option></select></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">源IP</span><input class="ou-toolbar-input tdh-filter-input" type="text" disabled /></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">源端口</span><input class="ou-toolbar-input tdh-filter-input" type="text" disabled /></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">目标IP</span><input class="ou-toolbar-input tdh-filter-input" type="text" disabled /></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">目标端口</span><input class="ou-toolbar-input tdh-filter-input" type="text" disabled /></label>
          <button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button>
          <button type="button" class="secondary td-reset-btn" disabled title="暂未开放">重置</button>
          <button type="button" class="secondary hsa-more-btn" disabled title="暂未开放">更多条件 ▾</button>
          <div class="tdh-filter-field tdh-ip-version" role="group"><div class="tio-range-btns"><button type="button" class="tio-range-btn active" disabled>IPv4</button><button type="button" class="tio-range-btn" disabled>IPv6</button></div></div>
        </div>
      </div>
      <div class="tst-rr-body">
        <div class="tst-graph-panel"><div class="tst-graph-empty"><span class="ou-empty">无数据</span></div></div>
        <div class="tid-mini-panel tst-rr-side-panel">
          <div class="ou-table-wrap tid-mini-table-wrap">
            <table class="ou-table til-table tid-mini-table tst-rr-table">
              <thead><tr><th class="col-idx">序号</th><th class="col-ip">IP</th><th class="col-metric ou-th-sort">连接数</th><th class="col-rate ou-th-sort">流入bps</th><th class="col-rate ou-th-sort">流出bps</th></tr></thead>
              <tbody>
                <tr v-for="r in rrRows" :key="r.idx"><td class="col-idx">{{ r.idx }}</td><td class="col-ip"><span class="tid-link">{{ r.ip }}</span></td><td class="col-metric ou-num">{{ r.conns }}</td><td class="col-rate ou-num">{{ r.inBps }}</td><td class="col-rate ou-num">{{ r.outBps }}</td></tr>
              </tbody>
            </table>
          </div>
          <div class="ou-footer cbm-ro-mini-footer"><div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn active" disabled>1</button><button type="button" class="ou-page-btn" disabled>2</button><button type="button" class="ou-page-btn" disabled>3</button><span class="ou-page-ellipsis">…</span><button type="button" class="ou-page-btn" disabled>7486</button><button type="button" class="ou-page-btn" disabled>›</button></div></div><div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页 <button type="button" class="ou-page-goto-btn" disabled>确定</button></label></div></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import './nv-shared.css'

const tabs = [
  { key: 'traffic', label: '历史流量' },
  { key: 'history-relation', label: '历史关系' },
  { key: 'realtime-session', label: '实时会话' },
  { key: 'realtime-relation', label: '实时关系' },
]
const activeTab = ref('traffic')

const trafficRows = [
  { idx: 1, startTime: '2026-06-15 14:03:50', endTime: '2026-06-15 14:23:27', duration: '1177s', mac: '54-2b-de-6d-10-ae', vendor: 'NewH3CTechno...', srcIp: '1.24.19.125:17629', dstIp: '101.6.15.130:443', geo: '🇨🇳 北京|BGP', proto: 'TCP', domain: 'mirrors.tuna.tsinghua.edu.cn', app: '其它HTTPS', seq: '428641286', upPkts: '0/21', dnPkts: '0/0', upRst: '0', dnRst: '0', upTraffic: '1.78 K', dnTraffic: '89.49 K', iface: 'xe4', status: '失败' },
  { idx: 2, startTime: '2026-06-15 14:03:48', endTime: '2026-06-15 14:03:49', duration: '1s', mac: '54-2b-de-6d-10-ae', vendor: 'NewH3CTechno...', srcIp: '119.186.228.221:49218', dstIp: '101.6.6.6:443', geo: '🇨🇳 北京|BGP', proto: 'TCP', domain: 'mirrors.tuna.tsinghua.edu.cn', app: '其它HTTPS', seq: '428641512', upPkts: '0/42', dnPkts: '0/0', upRst: '0', dnRst: '0', upTraffic: '861', dnTraffic: '26.23 K', iface: 'xe3', status: '失败' },
  { idx: 3, startTime: '2026-06-15 14:03:46', endTime: '2026-06-15 14:03:48', duration: '2s', mac: '54-2b-de-6d-10-ae', vendor: 'NewH3CTechno...', srcIp: '101.6.15.28:52816', dstIp: '101.6.15.67:993', geo: '🇨🇳 北京|BGP', proto: 'TCP', domain: '101.6.15.130:443', app: 'IMAP', seq: '428641728', upPkts: '12/28', dnPkts: '0/0', upRst: '0', dnRst: '0', upTraffic: '2.18 K', dnTraffic: '18.42 K', iface: 'xe4', status: '—' },
  { idx: 4, startTime: '2026-06-15 14:03:44', endTime: '2026-06-15 14:03:46', duration: '2s', mac: '54-2b-de-6d-10-ae', vendor: 'NewH3CTechno...', srcIp: '183.159.168.190:38412', dstIp: '101.6.8.149:443', geo: '🇨🇳 北京|BGP', proto: 'TCP', domain: 'cn.bing.com', app: 'WWW', seq: '428641986', upPkts: '8/36', dnPkts: '0/0', upRst: '0', dnRst: '1', upTraffic: '986', dnTraffic: '6.28 K', iface: 'xe5', status: '失败' },
  { idx: 5, startTime: '2026-06-15 14:03:42', endTime: '2026-06-15 14:03:44', duration: '2s', mac: '54-2b-de-6d-10-ae', vendor: 'NewH3CTechno...', srcIp: '111.226.166.248:44328', dstIp: '166.111.5.212:443', geo: '🇨🇳 北京|BGP', proto: 'TCP', domain: 'pypi.tuna.tsinghua.edu.cn', app: '其它下载', seq: '428642128', upPkts: '6/24', dnPkts: '0/0', upRst: '0', dnRst: '0', upTraffic: '505', dnTraffic: '4.18 K', iface: 'xe2', status: '失败' },
  { idx: 6, startTime: '2026-06-15 14:03:40', endTime: '2026-06-15 14:03:42', duration: '2s', mac: '54-2b-de-6d-10-ae', vendor: 'NewH3CTechno...', srcIp: '36.170.12.75:31775', dstIp: '101.6.15.130:443', geo: '🇨🇳 北京|BGP', proto: 'TCP', domain: 'lib.tsinghua.edu.cn', app: '未知应用', seq: '428642386', upPkts: '0/18', dnPkts: '0/0', upRst: '0', dnRst: '0', upTraffic: '428', dnTraffic: '2.86 K', iface: 'xe5', status: '失败' },
]

const hrRows = [
  { idx: 1, ip: '166.111.7.7', conns: '136513', up: '361.21 M', dn: '11.69 G' },
  { idx: 2, ip: '166.111.7.8', conns: '136440', up: '365.74 M', dn: '16.58 G' },
  { idx: 3, ip: '101.6.10.23', conns: '128642', up: '286.42 M', dn: '8.64 G' },
  { idx: 4, ip: '101.6.15.130', conns: '98642', up: '128.86 M', dn: '4.28 G' },
  { idx: 5, ip: '101.6.6.6', conns: '72864', up: '86.18 M', dn: '2.18 G' },
  { idx: 6, ip: '8.8.8.8', conns: '48628', up: '32.64 M', dn: '986.18 M' },
]

const rsRows = [
  { idx: 1, app: 'ICMP', proto: 'icmp', status: 'NIL', iface: 'xe2', src: '183.222.90.184:6144', dst: '101.6.6.6:2754', geo: '🇨🇳 北京教育网/清华大学', duration: '49710d6h28m15s', clientLat: '0.00', serverLat: '0.00', appLat: '0.09', upPkts: '0/1', dnPkts: '0/0', maxLen: '98/98', mss: '0', traffic: '98/98', rate: '0.00/0.00', host: '—' },
  { idx: 2, app: '远程桌面', proto: 'tcp', status: 'OK', iface: 'xe5', src: '101.6.10.23:3389', dst: '101.6.15.130:3389', geo: '🇨🇳 北京|BGP', duration: '128d4h12m8s', clientLat: '28.28', serverLat: '0.21', appLat: '3.44', upPkts: '0/26', dnPkts: '0/18', maxLen: '583/1490', mss: '1460', traffic: '1.37 K/3.16 K', rate: '128.00/86.00', host: 'www.rwxy.tsinghua.edu.cn' },
  { idx: 3, app: 'NTP', proto: 'udp', status: 'OK', iface: 'xe2', src: '101.6.6.6:123', dst: '101.6.10.23:51234', geo: '🇨🇳 内网', duration: '8642d2h18m4s', clientLat: '0.86', serverLat: '0.42', appLat: '1.28', upPkts: '0/2', dnPkts: '0/2', maxLen: '76/76', mss: '0', traffic: '152/152', rate: '0.00/0.00', host: '—' },
  { idx: 4, app: '其它HTTPS', proto: 'tcp', status: 'OK', iface: 'xe4', src: '36.170.9.48:39876', dst: '101.6.15.130:443', geo: '🇨🇳 北京|BGP', duration: '42d8h6m22s', clientLat: '12.42', serverLat: '8.64', appLat: '18.86', upPkts: '0/128', dnPkts: '0/86', maxLen: '1490/1490', mss: '1460', traffic: '18.42 K/128.86 K', rate: '864.00/4286.00', host: 'work.weixin.qq.com' },
  { idx: 5, app: 'WWW', proto: 'tcp', status: 'OK', iface: 'xe3', src: '119.186.228.221:49218', dst: '101.6.6.6:443', geo: '🇨🇳 北京|BGP', duration: '18d12h4m18s', clientLat: '6.28', serverLat: '4.18', appLat: '9.86', upPkts: '0/64', dnPkts: '0/42', maxLen: '1490/1490', mss: '1460', traffic: '8.64 K/62.18 K', rate: '428.00/1286.00', host: 'mirrors.tuna.tsinghua.edu.cn' },
  { idx: 6, app: 'DNS', proto: 'udp', status: 'OK', iface: 'xe5', src: '101.6.15.28:52816', dst: '101.6.6.6:53', geo: '🇨🇳 北京|BGP', duration: '6d2h18m42s', clientLat: '0.42', serverLat: '0.28', appLat: '0.68', upPkts: '0/4', dnPkts: '0/4', maxLen: '98/128', mss: '0', traffic: '226/512', rate: '0.00/0.00', host: '—' },
]

const rrRows = [
  { idx: 1, ip: '166.111.7.8', conns: '1834', inBps: '252.00M', outBps: '7.24M' },
  { idx: 2, ip: '166.111.7.7', conns: '1790', inBps: '252.58M', outBps: '2.51M' },
  { idx: 3, ip: '101.6.10.23', conns: '1765', inBps: '810.84K', outBps: '653.94K' },
  { idx: 4, ip: '101.6.15.130', conns: '1642', inBps: '428.64K', outBps: '286.42K' },
  { idx: 5, ip: '101.6.6.6', conns: '1286', inBps: '128.86K', outBps: '86.42K' },
]
</script>

<style scoped>
@import './nv-test-shared.css';
</style>
