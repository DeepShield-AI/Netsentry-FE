<template>
  <div class="nvt-page">
    <!-- Filters -->
    <div class="tdh-filters tip-filters">
      <div class="tdh-filter-row tdh-filter-row-actions">
        <label class="tdh-filter-field"><span class="ou-toolbar-label">MAC</span><input class="ou-toolbar-input tdh-filter-input" type="text" disabled /></label>
        <label class="tdh-filter-field"><span class="ou-toolbar-label">IP</span><select class="ou-toolbar-select" disabled><option selected>请选择</option></select><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="任意IP" disabled /></label>
        <label class="tdh-filter-field"><span class="ou-toolbar-label">用户名称</span><input class="ou-toolbar-input tdh-filter-input" type="text" disabled /></label>
        <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" type="text" value="2026-06-17 23:03:38 - 2026-06-17 23:18:38" disabled /></label>
        <button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button>
        <button type="button" class="secondary td-reset-btn" disabled title="暂未开放">重置</button>
      </div>
    </div>

    <!-- Tab bar -->
    <div class="nvt-tabs-header">
      <div class="nvt-tabs-nav" style="flex-wrap:wrap;">
        <button v-for="t in tabs" :key="t.key" class="nvt-tab" :class="{ active: activeTab === t.key }" @click="activeTab = t.key">{{ t.label }}</button>
      </div>
    </div>

    <div class="tip-page">
      <!-- 应用排行 -->
      <div v-show="activeTab === 'app-rank'" class="tip-chart-page">
        <section class="tid-chart-panel tip-app-rank-panel">
          <div class="tid-chart-head">
            <div class="tid-legend" aria-hidden="true">
              <span class="tid-legend-item"><i class="tid-legend-dot" style="background:#5470c6"></i>访问次数</span>
              <span class="tid-legend-item"><i class="tid-legend-dot" style="background:#fc8452"></i>失败次数</span>
              <span class="tid-legend-item"><i class="tid-legend-dot" style="background:#fac858"></i>时延</span>
            </div>
          </div>
          <div class="tip-dual-yaxis"><span class="tip-y-left">访问次数</span><span class="tip-y-right">时延</span></div>
          <div class="tid-chart-body tip-app-rank-body">
            <div class="to-chart-plot tid-chart-plot tip-app-rank-plot">
              <div class="to-chart-ylabels tip-app-rank-yleft" aria-hidden="true"></div>
              <svg class="to-chart-svg tip-app-rank-svg" aria-hidden="true"></svg>
              <div class="to-chart-ylabels tip-app-rank-yright" aria-hidden="true"></div>
              <div class="to-chart-xlabels tip-app-rank-xlabels tip-x-slant"></div>
            </div>
          </div>
        </section>
      </div>

      <!-- 访问域名 -->
      <div v-show="activeTab === 'visited-domain'" class="tip-table-page">
        <div class="ou-table-wrap tip-table-wrap">
          <table class="ou-table tip-domain-table">
            <thead><tr><th class="col-idx">序号</th><th class="col-domain">访问域名</th><th class="col-req-fail ou-th-sort">请求 / 失败</th><th class="col-latency ou-th-sort">平均时延</th></tr></thead>
            <tbody>
              <tr v-for="r in domainRows" :key="r.idx"><td class="col-idx">{{ r.idx }}</td><td class="col-domain"><span class="tid-link hsa-ellipsis">{{ r.domain }}</span></td><td class="col-req-fail"><span class="ou-num">{{ r.reqs }}</span> / <span class="tip-fail ou-num">{{ r.fails }}</span></td><td class="col-latency ou-num">{{ r.lat }}</td></tr>
            </tbody>
          </table>
        </div>
        <div class="ou-footer cbm-ro-mini-footer"><div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn active" disabled>1</button><button type="button" class="ou-page-btn" disabled>2</button><button type="button" class="ou-page-btn" disabled>3</button><span class="ou-page-ellipsis">…</span><button type="button" class="ou-page-btn" disabled>254</button><button type="button" class="ou-page-btn" disabled>›</button></div></div><div class="ou-footer-right"><span>共 25395 条</span></div></div>
      </div>

      <!-- 开放域名 -->
      <div v-show="activeTab === 'open-domain'" class="tip-table-page">
        <div class="ou-table-wrap tip-table-wrap">
          <table class="ou-table tip-domain-table">
            <thead><tr><th class="col-idx">序号</th><th class="col-domain">开放的域名</th><th class="col-req-fail ou-th-sort">请求 / 失败</th><th class="col-latency ou-th-sort">平均时延</th></tr></thead>
            <tbody>
              <tr v-for="r in domainRows" :key="r.idx"><td class="col-idx">{{ r.idx }}</td><td class="col-domain"><span class="tid-link hsa-ellipsis">{{ r.domain }}</span></td><td class="col-req-fail"><span class="ou-num">{{ r.reqs }}</span> / <span class="tip-fail ou-num">{{ r.fails }}</span></td><td class="col-latency ou-num">{{ r.lat }}</td></tr>
            </tbody>
          </table>
        </div>
        <div class="ou-footer cbm-ro-mini-footer"><div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn active" disabled>1</button><button type="button" class="ou-page-btn" disabled>2</button><button type="button" class="ou-page-btn" disabled>3</button><span class="ou-page-ellipsis">…</span><button type="button" class="ou-page-btn" disabled>254</button><button type="button" class="ou-page-btn" disabled>›</button></div></div><div class="ou-footer-right"><span>共 25395 条</span></div></div>
      </div>

      <!-- 开放端口 -->
      <div v-show="activeTab === 'open-port'" class="tip-chart-page">
        <section class="tid-chart-panel tip-port-chart-panel">
          <div class="tid-chart-head"><h3 class="tid-mini-title">访问次数</h3></div>
          <div class="tid-chart-body">
            <div class="to-chart-plot tid-chart-plot">
              <div class="to-chart-ylabels" aria-hidden="true"></div>
              <svg class="to-chart-svg" aria-hidden="true"></svg>
              <div class="to-chart-xlabels"></div>
            </div>
          </div>
        </section>
      </div>

      <!-- 访问IP -->
      <div v-show="activeTab === 'visited-ip'" class="tip-table-page">
        <div class="ou-table-wrap tip-table-wrap">
          <table class="ou-table tip-ip-table">
            <thead><tr><th class="col-idx">序号</th><th class="col-ip">访问的IP</th><th class="col-req-fail ou-th-sort">请求 / 失败</th><th class="col-latency ou-th-sort">平均时延</th></tr></thead>
            <tbody>
              <tr v-for="r in ipRows" :key="r.idx"><td class="col-idx">{{ r.idx }}</td><td class="col-ip"><span class="tid-link">{{ r.ip }}</span></td><td class="col-req-fail"><span class="ou-num">{{ r.reqs }}</span> / <span class="tip-fail ou-num">{{ r.fails }}</span></td><td class="col-latency ou-num">{{ r.lat }}</td></tr>
            </tbody>
          </table>
        </div>
        <div class="ou-footer cbm-ro-mini-footer"><div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn active" disabled>1</button><button type="button" class="ou-page-btn" disabled>2</button><button type="button" class="ou-page-btn" disabled>3</button><span class="ou-page-ellipsis">…</span><button type="button" class="ou-page-btn" disabled>172</button><button type="button" class="ou-page-btn" disabled>›</button></div></div><div class="ou-footer-right"><span>共 17165 条</span></div></div>
      </div>

      <!-- 接入IP -->
      <div v-show="activeTab === 'access-ip'" class="tip-table-page">
        <div class="ou-table-wrap tip-table-wrap">
          <table class="ou-table tip-ip-table">
            <thead><tr><th class="col-idx">序号</th><th class="col-ip">接入的IP</th><th class="col-req-fail ou-th-sort">请求 / 失败</th><th class="col-latency ou-th-sort">平均时延</th></tr></thead>
            <tbody>
              <tr v-for="r in ipRows" :key="r.idx"><td class="col-idx">{{ r.idx }}</td><td class="col-ip"><span class="tid-link">{{ r.ip }}</span></td><td class="col-req-fail"><span class="ou-num">{{ r.reqs }}</span> / <span class="tip-fail ou-num">{{ r.fails }}</span></td><td class="col-latency ou-num">{{ r.lat }}</td></tr>
            </tbody>
          </table>
        </div>
        <div class="ou-footer cbm-ro-mini-footer"><div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn active" disabled>1</button><button type="button" class="ou-page-btn" disabled>2</button><button type="button" class="ou-page-btn" disabled>3</button><span class="ou-page-ellipsis">…</span><button type="button" class="ou-page-btn" disabled>172</button><button type="button" class="ou-page-btn" disabled>›</button></div></div><div class="ou-footer-right"><span>共 17165 条</span></div></div>
      </div>

      <!-- 客户趋势 -->
      <div v-show="activeTab === 'client-trend'" class="tip-trend-page">
        <div class="tip-trend-grid">
          <section v-for="c in trendCharts" :key="c.title" class="tid-chart-panel tip-trend-chart">
            <div class="tid-chart-head"><h3 class="tid-mini-title">{{ c.title }}</h3></div>
            <div class="tip-dual-yaxis"><span class="tip-y-left">时延/毫秒</span><span class="tip-y-right">抖动/毫秒</span></div>
            <div class="tid-chart-body">
              <div class="to-chart-plot tid-chart-plot">
                <div class="to-chart-ylabels" aria-hidden="true"></div>
                <svg class="to-chart-svg" aria-hidden="true"></svg>
                <div class="to-chart-ylabels tip-y-right-labels" aria-hidden="true"></div>
                <div class="to-chart-xlabels"></div>
              </div>
            </div>
            <div class="dtt-chart-stats dba-trend-stats">
              <span class="dtt-stat"><i class="dtt-stat-badge max">MAX</i>最大值 <strong>—</strong></span>
              <span class="dtt-stat"><i class="dtt-stat-badge min">MIN</i>最小值 <strong>—</strong></span>
              <span class="dtt-stat"><i class="dtt-stat-badge avg">AVG</i>平均值 <strong>—</strong></span>
            </div>
          </section>
        </div>
      </div>

      <!-- 用户时长 -->
      <div v-show="activeTab === 'user-duration'" class="tip-duration-page tid-page">
        <div class="tip-duration-top">
          <section class="tid-chart-panel tip-duration-stack">
            <div class="tid-chart-head"><h3 class="tid-mini-title">用户协议时长</h3><div class="tip-legend-pager"><button type="button" class="td-icon-btn" disabled>‹</button><span>1/4</span><button type="button" class="td-icon-btn" disabled>›</button></div></div>
            <div class="tid-chart-body">
              <div class="to-chart-plot tid-chart-plot">
                <div class="to-chart-ylabels" aria-hidden="true"></div>
                <svg class="to-chart-svg" aria-hidden="true"></svg>
                <div class="to-chart-xlabels"></div>
              </div>
            </div>
          </section>
          <section class="tid-chart-panel tid-chart-panel-pie">
            <div class="tid-chart-head"><h3 class="tid-mini-title">用户协议时长占比</h3></div>
            <div class="tid-chart-body tid-chart-body-pie">
              <div class="to-pie-wrap tid-pie-wrap">
                <svg class="to-pie-svg-ref" aria-hidden="true"></svg>
              </div>
            </div>
          </section>
        </div>
        <div class="ou-table-wrap tip-duration-table-wrap">
          <table class="ou-table tip-duration-table">
            <thead><tr><th class="col-idx">序号</th><th class="col-proto">协议名称</th><th class="col-dur ou-th-sort">时长</th><th class="col-traffic ou-th-sort">上行流量</th><th class="col-traffic ou-th-sort">下行流量</th><th class="col-traffic ou-th-sort">总流量</th><th class="col-ratio ou-th-sort">流量占比</th><th class="col-actions">操作</th></tr></thead>
            <tbody>
              <tr v-for="r in durationRows" :key="r.idx">
                <td class="col-idx">{{ r.idx }}</td><td class="col-proto">{{ r.proto }}</td><td class="col-dur">{{ r.dur }}</td>
                <td class="col-traffic ou-num">{{ r.up }}</td><td class="col-traffic ou-num">{{ r.dn }}</td><td class="col-traffic ou-num">{{ r.total }}</td>
                <td class="col-ratio"><span class="tip-ratio-bar" :style="{ width: r.ratioWidth }"></span>{{ r.ratio }}</td>
                <td class="col-actions"><button type="button" class="link-btn" disabled>查看会话</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 会话日志 -->
      <div v-show="activeTab === 'session-log'" class="tip-session-page hsa-hs-page">
        <div class="ou-table-wrap hsa-hs-table-wrap tip-session-table-wrap">
          <table class="ou-table hsa-hs-table tip-session-table">
            <thead><tr><th class="col-check"><input type="checkbox" disabled /></th><th class="col-time ou-th-sort">请求时间</th><th class="col-mac">MAC</th><th class="col-user">用户名称</th><th class="col-endpoint">源IP</th><th class="col-endpoint">目标IP</th><th class="col-geo">目标地理位置</th><th class="col-trans">传输协议</th><th class="col-app">应用协议</th><th class="col-split">上行包数</th><th class="col-split">下行包数</th><th class="col-split">重置包数</th><th class="col-traffic">流量</th><th class="col-iface">首包接口</th><th class="col-domain">请求域名</th><th class="col-status">状态</th><th class="col-actions">操作</th></tr></thead>
            <tbody>
              <tr v-for="r in sessionRows" :key="r.idx">
                <td class="col-check"><input type="checkbox" disabled /></td>
                <td class="col-time">{{ r.time }}</td><td class="col-mac"><span class="hsa-ellipsis">{{ r.mac }}</span></td><td class="col-user">—</td>
                <td class="col-endpoint"><span class="hsa-endpoint">{{ r.src }}</span></td><td class="col-endpoint"><span class="hsa-endpoint">{{ r.dst }}</span></td>
                <td class="col-geo"><span class="hsa-geo">{{ r.geo }}</span></td><td class="col-trans">{{ r.proto }}</td><td class="col-app">{{ r.app }}</td>
                <td class="col-split">{{ r.upPkts }}</td><td class="col-split">{{ r.dnPkts }}</td><td class="col-split">{{ r.rstPkts }}</td>
                <td class="col-traffic">{{ r.traffic }}</td><td class="col-iface">{{ r.iface }}</td>
                <td class="col-domain"><span class="tid-link hsa-ellipsis">{{ r.domain }}</span></td>
                <td class="col-status" :class="{ 'hsa-status-fail': r.status === '失败' }">{{ r.status }}</td>
                <td class="col-actions"><button type="button" class="link-btn" disabled>数据包</button></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="ou-footer ou-footer-td tip-session-footer">
          <div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn active" disabled>1</button><button type="button" class="ou-page-btn" disabled>2</button><button type="button" class="ou-page-btn" disabled>3</button><span class="ou-page-ellipsis">…</span><button type="button" class="ou-page-btn" disabled>204391</button><button type="button" class="ou-page-btn" disabled>›</button></div></div>
          <div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页 <button type="button" class="ou-page-goto-btn" disabled>确定</button></label><span>共 20439035 条</span></div>
        </div>
      </div>

      <!-- 访问关系 -->
      <div v-show="activeTab === 'access-relation'" class="tip-relation-page">
        <div class="tdh-filters tip-relation-filters"><div class="tdh-filter-row tdh-filter-row-actions">
          <label class="tdh-filter-field"><span class="ou-toolbar-label">显示条数</span><select class="ou-toolbar-select" disabled><option selected>20</option></select></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">源端口</span><select class="ou-toolbar-select" disabled><option selected>否</option></select></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">目标端口</span><select class="ou-toolbar-select" disabled><option selected>否</option></select></label>
        </div></div>
        <div class="tip-relation-body">
          <div class="tip-sankey-panel"><h3 class="tip-sankey-title">主动访问</h3><div class="tip-sankey-head"><span>源</span><span></span><span>目标</span></div><div class="tip-sankey-chart"><span class="ou-empty">桑基图区域 (mock)</span></div></div>
          <div class="tip-sankey-panel"><h3 class="tip-sankey-title">被动访问</h3><div class="tip-sankey-head"><span>源</span><span></span><span>目标</span></div><div class="tip-sankey-chart"><span class="ou-empty">桑基图区域 (mock)</span></div></div>
        </div>
      </div>

      <!-- 威胁情报 -->
      <div v-show="activeTab === 'threat-intel'" class="tip-threat-page">
        <div class="ou-table-wrap tip-threat-table-wrap">
          <table class="ou-table tip-threat-table">
            <thead><tr><th class="col-check"><input type="checkbox" disabled /></th><th class="col-time ou-th-sort">最新命中时间</th><th class="col-mac">MAC</th><th class="col-vendor">MAC厂商</th><th class="col-user">用户账号</th><th class="col-endpoint">源IP:端口</th><th class="col-endpoint">目标IP:端口</th><th class="col-proto">协议</th><th class="col-source">情报源</th><th class="col-link">链路</th><th class="col-level ou-th-sort">威胁等级</th><th class="col-cat">情报类型</th><th class="col-family">恶意家族</th><th class="col-ioc">IOC</th><th class="col-actions">操作</th></tr></thead>
            <tbody>
              <tr v-for="r in threatRows" :key="r.idx">
                <td class="col-check"><input type="checkbox" disabled /></td>
                <td class="col-time">{{ r.time }}</td><td class="col-mac"><span class="hsa-ellipsis">{{ r.mac }}</span></td><td class="col-vendor"><span class="hsa-ellipsis">{{ r.vendor }}</span></td><td class="col-user">—</td>
                <td class="col-endpoint">{{ r.src }}</td><td class="col-endpoint">{{ r.dst }}</td><td class="col-proto">{{ r.proto }}</td>
                <td class="col-source"><span class="hsa-ellipsis">{{ r.source }}</span></td><td class="col-link">—</td>
                <td class="col-level"><span class="tip-level-dot" :class="r.levelClass"></span>{{ r.level }}</td>
                <td class="col-cat">{{ r.cat }}</td><td class="col-family">{{ r.family }}</td>
                <td class="col-ioc"><span class="hsa-ellipsis">{{ r.ioc }}</span></td>
                <td class="col-actions"><button type="button" class="link-btn" disabled>情报校验</button><button type="button" class="link-btn" disabled>报文分析</button></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="ou-footer ou-footer-td tip-threat-footer">
          <div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn active" disabled>1</button><button type="button" class="ou-page-btn" disabled>2</button><button type="button" class="ou-page-btn" disabled>3</button><button type="button" class="ou-page-btn" disabled>4</button><button type="button" class="ou-page-btn" disabled>›</button></div></div>
          <div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页 <button type="button" class="ou-page-goto-btn" disabled>确定</button></label><span>共 317 条</span></div>
        </div>
      </div>

      <!-- 跨境 -->
      <div v-show="activeTab === 'cross-border'" class="tip-cb-page">
        <div class="ou-table-wrap tip-cb-table-wrap">
          <table class="ou-table tip-cb-table">
            <thead><tr><th class="col-check"><input type="checkbox" disabled /></th><th class="col-time ou-th-sort">请求时间</th><th class="col-mac">MAC</th><th class="col-vendor">MAC厂商</th><th class="col-user">用户名称</th><th class="col-endpoint">用户IP</th><th class="col-endpoint">节点IP</th><th class="col-geo">目标地理位置</th><th class="col-trans">传输协议</th><th class="col-proto">协议名称</th><th class="col-traffic ou-th-sort">上行流量</th><th class="col-traffic ou-th-sort">下行流量</th><th class="col-traffic ou-th-sort">总流量</th><th class="col-type">协议类型</th><th class="col-domain">域名</th><th class="col-link">链路</th><th class="col-susp ou-th-sort">疑似度</th><th class="col-model">分析模型</th><th class="col-actions">操作</th></tr></thead>
            <tbody>
              <tr v-for="r in cbRows" :key="r.idx">
                <td class="col-check"><input type="checkbox" disabled /></td>
                <td class="col-time">{{ r.time }}</td><td class="col-mac"><span class="hsa-ellipsis">{{ r.mac }}</span></td><td class="col-vendor"><span class="hsa-ellipsis">{{ r.vendor }}</span></td><td class="col-user">—</td>
                <td class="col-endpoint">{{ r.userIp }}</td><td class="col-endpoint">{{ r.nodeIp }}</td><td class="col-geo"><span class="hsa-geo">{{ r.geo }}</span></td>
                <td class="col-trans">{{ r.proto }}</td><td class="col-proto">{{ r.appName }}</td>
                <td class="col-traffic ou-num">{{ r.up }}</td><td class="col-traffic ou-num">{{ r.dn }}</td><td class="col-traffic ou-num">{{ r.total }}</td>
                <td class="col-type">—</td><td class="col-domain"><span class="hsa-ellipsis">{{ r.domain }}</span></td><td class="col-link">—</td>
                <td class="col-susp"><span class="tip-susp-tag">{{ r.susp }}</span></td><td class="col-model">{{ r.model }}</td>
                <td class="col-actions"><button type="button" class="link-btn" disabled>数据包</button></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="ou-footer ou-footer-td tip-cb-footer">
          <div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn active" disabled>1</button><button type="button" class="ou-page-btn" disabled>2</button><button type="button" class="ou-page-btn" disabled>›</button></div></div>
          <div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页 <button type="button" class="ou-page-goto-btn" disabled>确定</button></label><span>共 52 条</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import './nv-shared.css'

const tabs = [
  { key: 'app-rank', label: '应用排行' },
  { key: 'visited-domain', label: '访问域名' },
  { key: 'open-domain', label: '开放域名' },
  { key: 'open-port', label: '开放端口' },
  { key: 'visited-ip', label: '访问IP' },
  { key: 'access-ip', label: '接入IP' },
  { key: 'client-trend', label: '客户趋势' },
  { key: 'user-duration', label: '用户时长' },
  { key: 'session-log', label: '会话日志' },
  { key: 'access-relation', label: '访问关系' },
  { key: 'threat-intel', label: '威胁情报' },
  { key: 'cross-border', label: '跨境' },
]
const activeTab = ref('app-rank')

const domainRows = [
  { idx: 1, domain: 'mirrors.tuna.tsinghua.edu.cn', reqs: '436058', fails: '324867', lat: '13.64' },
  { idx: 2, domain: 'www.liepin.com', reqs: '128642', fails: '9864', lat: '8.42' },
  { idx: 3, domain: 'www.douyin.com', reqs: '98642', fails: '4286', lat: '-' },
  { idx: 4, domain: 'pypi.tuna.tsinghua.edu.cn', reqs: '72864', fails: '2864', lat: '6.28' },
  { idx: 5, domain: 'work.weixin.qq.com', reqs: '48628', fails: '1286', lat: '18.86' },
  { idx: 6, domain: 'cn.bing.com', reqs: '38642', fails: '864', lat: '4.18' },
]

const ipRows = [
  { idx: 1, ip: '101.6.6.6', reqs: '10166821', fails: '2678', lat: '1.92' },
  { idx: 2, ip: '101.6.15.130', reqs: '8642864', fails: '128642', lat: '16.86' },
  { idx: 3, ip: '101.6.15.67', reqs: '4286428', fails: '86428', lat: '8.64' },
  { idx: 4, ip: '166.111.5.212', reqs: '1286428', fails: '42864', lat: '12.42' },
  { idx: 5, ip: '101.6.8.149', reqs: '986428', fails: '28642', lat: '6.28' },
  { idx: 6, ip: '8.8.8.8', reqs: '728642', fails: '18642', lat: '4.18' },
]

const trendCharts = [
  { title: '连接趋势' },
  { title: '客户时延' },
  { title: '服务时延' },
  { title: '应用时延' },
]

const durationRows = [
  { idx: 1, proto: '其它HTTPS', dur: '28m', up: '11.44 G', dn: '283.58 G', total: '295.02 G', ratioWidth: '71%', ratio: '70.99%' },
  { idx: 2, proto: 'WWW', dur: '28m', up: '188.25 M', dn: '65.11 G', total: '65.30 G', ratioWidth: '16%', ratio: '15.71%' },
  { idx: 3, proto: 'DNS', dur: '28m', up: '128.86 M', dn: '42.18 G', total: '42.31 G', ratioWidth: '10%', ratio: '10.18%' },
  { idx: 4, proto: '微信聊天', dur: '28m', up: '86.42 M', dn: '8.64 G', total: '8.73 G', ratioWidth: '2%', ratio: '2.10%' },
]

const sessionRows = [
  { idx: 1, time: '2026-06-17 23:05:00', mac: '54-2b-de-6d-10-ae', src: '1.14.249.89:38122', dst: '101.6.15.130:443', geo: '🇨🇳 北京', proto: 'TCP', app: '其它HTTPS', upPkts: '0/15', dnPkts: '0/0', rstPkts: '0/0', traffic: '941/0', iface: 'xe2', domain: 'pypi.tu...', status: '失败' },
  { idx: 2, time: '2026-06-17 23:04:58', mac: '54-2b-de-6d-10-ae', src: '119.186.228.221:49218', dst: '101.6.6.6:443', geo: '🇨🇳 北京', proto: 'TCP', app: 'Bittorrent', upPkts: '0/42', dnPkts: '0/0', rstPkts: '0/0', traffic: '861/0', iface: 'xe3', domain: 'mirror.t...', status: '失败' },
  { idx: 3, time: '2026-06-17 23:04:56', mac: '54-2b-de-6d-10-ae', src: '101.6.15.28:52816', dst: '101.6.15.67:993', geo: '🇨🇳 北京', proto: 'TCP', app: 'IMAP', upPkts: '12/28', dnPkts: '0/0', rstPkts: '0/0', traffic: '2.18 K/18.42 K', iface: 'xe4', domain: '—', status: '—' },
  { idx: 4, time: '2026-06-17 23:04:54', mac: '54-2b-de-6d-10-ae', src: '36.170.12.75:31775', dst: '101.6.15.130:443', geo: '🇨🇳 北京', proto: 'TCP', app: '无连接TCP', upPkts: '0/18', dnPkts: '0/0', rstPkts: '0/0', traffic: '428/2.86 K', iface: 'xe5', domain: 'lib.tsing...', status: '失败' },
  { idx: 5, time: '2026-06-17 23:04:52', mac: '54-2b-de-6d-10-ae', src: '183.159.168.190:38412', dst: '101.6.8.149:443', geo: '🇨🇳 北京', proto: 'TCP', app: 'WWW', upPkts: '8/36', dnPkts: '0/0', rstPkts: '0/1', traffic: '986/6.28 K', iface: 'xe2', domain: 'cn.bing.com', status: '失败' },
]

const threatRows = [
  { idx: 1, time: '2026-06-17 23:04:12', mac: '54-2b-de-6d-10-ae', vendor: 'NewH3CTechno...', src: '220.166.36.77:56848', dst: '101.6.6.6:53', proto: 'UDP', source: '奇安信商业情...', levelClass: 'tip-level-high', level: '高', cat: '远控木马', family: 'SilverFox', ioc: 'mal.example.com' },
  { idx: 2, time: '2026-06-17 23:03:48', mac: '54-2b-de-6d-10-ae', vendor: 'NewH3CTechno...', src: '183.222.90.184:6144', dst: '101.6.15.130:443', proto: 'TCP', source: '奇安信商业情...', levelClass: 'tip-level-mid', level: '中', cat: '挖矿病毒', family: 'Generic', ioc: 'pool.mining.io' },
  { idx: 3, time: '2026-06-17 23:03:22', mac: '54-2b-de-6d-10-ae', vendor: 'NewH3CTechno...', src: '36.170.12.75:31775', dst: '8.8.8.8:443', proto: 'TCP', source: '奇安信商业情...', levelClass: 'tip-level-low', level: '低', cat: '流氓推广', family: 'UnknownFamily', ioc: 'ads.track.net' },
]

const cbRows = [
  { idx: 1, time: '2026-06-17 23:04:18', mac: '54-2b-de-6d-10-ae', vendor: 'NewH3CTec...', userIp: '36.161.101.145:29251', nodeIp: '101.6.15.70:443', geo: '🇨🇳 北京', proto: 'TCP', appName: '泡芙云', up: '2.16 K', dn: '9.36 K', total: '11.52 K', domain: 'raw.githubusercontent...', susp: '高', model: '基于VPN应用' },
  { idx: 2, time: '2026-06-17 23:04:02', mac: '54-2b-de-6d-10-ae', vendor: 'NewH3CTec...', userIp: '119.186.228.221:49218', nodeIp: '101.6.6.6:443', geo: '🇺🇸 美国', proto: 'TCP', appName: 'Clash', up: '1.28 K', dn: '6.42 K', total: '7.70 K', domain: '—', susp: '高', model: '基于VPN应用' },
  { idx: 3, time: '2026-06-17 23:03:46', mac: '54-2b-de-6d-10-ae', vendor: 'NewH3CTec...', userIp: '183.222.90.184:6144', nodeIp: '101.6.15.130:443', geo: '🇨🇳 北京', proto: 'TCP', appName: 'Aladdin云', up: '986', dn: '4.28 K', total: '5.27 K', domain: '—', susp: '高', model: '基于VPN应用' },
]
</script>

<style scoped>
@import './nv-test-shared.css';
</style>
