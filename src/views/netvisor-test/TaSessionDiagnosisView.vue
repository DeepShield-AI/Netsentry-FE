<template>
  <div class="nvt-page">
    <div class="tsd-page tid-page">
      <!-- Filters -->
      <div class="tdh-filters tsd-filters">
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
          <label class="tdh-filter-field"><span class="ou-toolbar-label">应用协议</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">传输协议</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">源IP ISP</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">目标IP ISP</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">源IP区域</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
        </div>
        <div class="tdh-filter-row">
          <label class="tdh-filter-field"><span class="ou-toolbar-label">目标IP区域</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">用户组</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">用户名称</span><input class="ou-toolbar-input tdh-filter-input" type="text" disabled /></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">域名</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select><input class="ou-toolbar-input tdh-filter-input" type="text" disabled /></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">链路</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
        </div>
        <div class="tdh-filter-row tdh-filter-row-actions">
          <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" type="text" value="2026-06-15 14:01:17 - 2026-06-15 14:16:17" disabled /></label>
          <button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button>
          <button type="button" class="secondary td-reset-btn" disabled title="暂未开放">重置</button>
          <button type="button" class="link-btn tid-export-btn" disabled title="暂未开放">⬇ 导出</button>
        </div>
      </div>

      <div class="tsd-scroll tid-scroll">
        <!-- Charts grid -->
        <div class="tid-mid-grid tsd-mid-grid">
          <!-- Connection count chart -->
          <section class="tid-chart-panel tsd-chart-panel">
            <div class="tid-chart-head"><h3 class="tid-mini-title">连接数</h3><button type="button" class="td-icon-btn" disabled title="全屏">⛶</button></div>
            <div class="tid-chart-body tid-chart-body-stack dba-trend-body">
              <span class="tid-yunit">Session#</span>
              <div class="to-chart-plot tid-chart-plot">
                <div class="to-chart-ylabels" aria-hidden="true"></div>
                <svg class="to-chart-svg" aria-hidden="true"></svg>
                <div class="to-chart-xlabels"></div>
              </div>
            </div>
            <div class="dtt-chart-stats dba-trend-stats">
              <span class="dtt-stat"><i class="dtt-stat-badge max">MAX</i>最大值 <strong>257089</strong></span>
              <span class="dtt-stat"><i class="dtt-stat-badge min">MIN</i>最小值 <strong>128642</strong></span>
              <span class="dtt-stat"><i class="dtt-stat-badge avg">AVG</i>平均值 <strong>186428</strong></span>
            </div>
          </section>

          <!-- Traffic trend chart -->
          <section class="tid-chart-panel tsd-chart-panel">
            <div class="tid-chart-head">
              <div class="tid-legend" aria-hidden="true">
                <span class="tid-legend-item"><i class="tid-legend-dot" style="background:#ee6666"></i>上行流量</span>
                <span class="tid-legend-item"><i class="tid-legend-dot" style="background:#5470c6"></i>下行流量</span>
              </div>
              <button type="button" class="td-icon-btn" disabled title="全屏">⛶</button>
            </div>
            <div class="tid-chart-body tid-chart-body-stack dba-trend-body">
              <span class="tid-yunit">bps</span>
              <div class="to-chart-plot tid-chart-plot">
                <div class="to-chart-ylabels" aria-hidden="true"></div>
                <svg class="to-chart-svg" aria-hidden="true"></svg>
                <div class="to-chart-xlabels"></div>
              </div>
            </div>
            <div class="dtt-chart-stats dba-trend-stats tsd-traffic-stats">
              <span class="dtt-stat"><i class="dtt-stat-badge max">MAX</i>上行最大值 <strong>428.64 M</strong></span>
              <span class="dtt-stat"><i class="dtt-stat-badge min">MIN</i>上行最小值 <strong>86.42 M</strong></span>
              <span class="dtt-stat"><i class="dtt-stat-badge avg">AVG</i>上行平均值 <strong>186.28 M</strong></span>
              <span class="dtt-stat"><i class="dtt-stat-badge max">MAX</i>下行最大值 <strong>1.28 G</strong></span>
              <span class="dtt-stat"><i class="dtt-stat-badge min">MIN</i>下行最小值 <strong>286.42 M</strong></span>
              <span class="dtt-stat"><i class="dtt-stat-badge avg">AVG</i>下行平均值 <strong>642.18 M</strong></span>
            </div>
          </section>

          <!-- App protocol table -->
          <section class="tid-mini-panel tsd-side-panel">
            <div class="tid-mini-head"><h3 class="tid-mini-title">应用协议</h3><button type="button" class="td-icon-btn" disabled title="全屏">⛶</button></div>
            <div class="ou-table-wrap tid-mini-table-wrap">
              <table class="ou-table til-table tid-mini-table tsd-table">
                <thead><tr><th class="col-idx">序号</th><th class="col-proto">应用协议</th><th class="col-metric ou-th-sort">总请求数</th><th class="col-traffic ou-th-sort">上行</th><th class="col-traffic ou-th-sort">下行</th></tr></thead>
                <tbody>
                  <tr v-for="r in appRows" :key="r.idx"><td class="col-idx">{{ r.idx }}</td><td class="col-proto">{{ r.proto }}</td><td class="col-metric ou-num">{{ r.reqs }}</td><td class="col-traffic ou-num">{{ r.up }}</td><td class="col-traffic ou-num">{{ r.dn }}</td></tr>
                </tbody>
              </table>
            </div>
            <div class="ou-footer cbm-ro-mini-footer"><div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn active" disabled>1</button><button type="button" class="ou-page-btn" disabled>2</button><span class="ou-page-ellipsis">…</span><button type="button" class="ou-page-btn" disabled>1286</button><button type="button" class="ou-page-btn" disabled>›</button></div></div><div class="ou-footer-right"><span>共 804998 条</span></div></div>
          </section>
        </div>

        <!-- Bottom tables -->
        <div class="tid-bottom-grid tsd-bottom-grid">
          <!-- Source IP table -->
          <section class="tid-mini-panel">
            <div class="tid-mini-head"><h3 class="tid-mini-title">源IP</h3><button type="button" class="td-icon-btn" disabled title="全屏">⛶</button></div>
            <div class="ou-table-wrap tid-mini-table-wrap">
              <table class="ou-table til-table tid-mini-table tsd-table">
                <thead><tr><th class="col-idx">序号</th><th class="col-ip">源IP</th><th class="col-metric ou-th-sort">总请求数</th><th class="col-traffic ou-th-sort">上行</th><th class="col-traffic ou-th-sort">下行</th></tr></thead>
                <tbody>
                  <tr v-for="r in srcIpRows" :key="r.idx"><td class="col-idx">{{ r.idx }}</td><td class="col-ip"><span class="tid-link">{{ r.ip }}</span></td><td class="col-metric ou-num">{{ r.reqs }}</td><td class="col-traffic ou-num">{{ r.up }}</td><td class="col-traffic ou-num">{{ r.dn }}</td></tr>
                </tbody>
              </table>
            </div>
            <div class="ou-footer cbm-ro-mini-footer"><div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn active" disabled>1</button><button type="button" class="ou-page-btn" disabled>2</button><span class="ou-page-ellipsis">…</span><button type="button" class="ou-page-btn" disabled>8046</button><button type="button" class="ou-page-btn" disabled>›</button></div></div><div class="ou-footer-right"><span>共 804535 条</span></div></div>
          </section>

          <!-- Target IP table -->
          <section class="tid-mini-panel">
            <div class="tid-mini-head"><h3 class="tid-mini-title">目标IP</h3><button type="button" class="td-icon-btn" disabled title="全屏">⛶</button></div>
            <div class="ou-table-wrap tid-mini-table-wrap">
              <table class="ou-table til-table tid-mini-table tsd-table">
                <thead><tr><th class="col-idx">序号</th><th class="col-ip">目标IP</th><th class="col-metric ou-th-sort">总请求数</th><th class="col-traffic ou-th-sort">上行</th><th class="col-traffic ou-th-sort">下行</th></tr></thead>
                <tbody>
                  <tr v-for="r in dstIpRows" :key="r.idx"><td class="col-idx">{{ r.idx }}</td><td class="col-ip"><span class="tid-link">{{ r.ip }}</span></td><td class="col-metric ou-num">{{ r.reqs }}</td><td class="col-traffic ou-num">{{ r.up }}</td><td class="col-traffic ou-num">{{ r.dn }}</td></tr>
                </tbody>
              </table>
            </div>
            <div class="ou-footer cbm-ro-mini-footer"><div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn active" disabled>1</button><button type="button" class="ou-page-btn" disabled>2</button><span class="ou-page-ellipsis">…</span><button type="button" class="ou-page-btn" disabled>8046</button><button type="button" class="ou-page-btn" disabled>›</button></div></div><div class="ou-footer-right"><span>共 804535 条</span></div></div>
          </section>

          <!-- Target domain table -->
          <section class="tid-mini-panel">
            <div class="tid-mini-head"><h3 class="tid-mini-title">目标域名</h3><button type="button" class="td-icon-btn" disabled title="全屏">⛶</button></div>
            <div class="ou-table-wrap tid-mini-table-wrap">
              <table class="ou-table til-table tid-mini-table tsd-table">
                <thead><tr><th class="col-idx">序号</th><th class="col-domain">目标域名</th><th class="col-metric ou-th-sort">总请求数</th><th class="col-traffic ou-th-sort">上行</th><th class="col-traffic ou-th-sort">下行</th></tr></thead>
                <tbody>
                  <tr v-for="r in domainRows" :key="r.idx"><td class="col-idx">{{ r.idx }}</td><td class="col-domain"><span class="tid-link hsa-ellipsis">{{ r.domain }}</span></td><td class="col-metric ou-num">{{ r.reqs }}</td><td class="col-traffic ou-num">{{ r.up }}</td><td class="col-traffic ou-num">{{ r.dn }}</td></tr>
                </tbody>
              </table>
            </div>
            <div class="ou-footer cbm-ro-mini-footer"><div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn active" disabled>1</button><button type="button" class="ou-page-btn" disabled>2</button><span class="ou-page-ellipsis">…</span><button type="button" class="ou-page-btn" disabled>4286</button><button type="button" class="ou-page-btn" disabled>›</button></div></div><div class="ou-footer-right"><span>共 428642 条</span></div></div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import './nv-shared.css'

const appRows = [
  { idx: 1, proto: 'DNS', reqs: '4286428', up: '128.86 M', dn: '286.42 M' },
  { idx: 2, proto: 'ICMP', reqs: '128642', up: '4.28 M', dn: '2.18 M' },
  { idx: 3, proto: '其它HTTPS', reqs: '986428', up: '1.28 G', dn: '4.86 G' },
  { idx: 4, proto: 'WWW', reqs: '642864', up: '428.64 M', dn: '1.86 G' },
  { idx: 5, proto: 'NTP', reqs: '86428', up: '18.42 M', dn: '12.86 M' },
  { idx: 6, proto: 'SSH', reqs: '42864', up: '86.42 M', dn: '42.18 M' },
]

const srcIpRows = [
  { idx: 1, ip: '166.111.7.7', reqs: '136513', up: '361.21 M', dn: '11.69 G' },
  { idx: 2, ip: '166.111.7.8', reqs: '128642', up: '286.42 M', dn: '8.64 G' },
  { idx: 3, ip: '101.6.10.23', reqs: '98642', up: '128.86 M', dn: '4.28 G' },
  { idx: 4, ip: '183.222.90.184', reqs: '72864', up: '86.18 M', dn: '2.18 G' },
  { idx: 5, ip: '119.186.228.221', reqs: '48628', up: '42.64 M', dn: '986.18 M' },
  { idx: 6, ip: '36.170.12.75', reqs: '38642', up: '28.86 M', dn: '642.18 M' },
]

const dstIpRows = [
  { idx: 1, ip: '101.6.6.6', reqs: '128642', up: '286.42 M', dn: '8.64 G' },
  { idx: 2, ip: '101.6.15.130', reqs: '98642', up: '128.86 M', dn: '4.28 G' },
  { idx: 3, ip: '101.6.15.67', reqs: '72864', up: '86.18 M', dn: '2.18 G' },
  { idx: 4, ip: '166.111.5.212', reqs: '48628', up: '42.64 M', dn: '986.18 M' },
  { idx: 5, ip: '101.6.8.149', reqs: '38642', up: '28.86 M', dn: '642.18 M' },
  { idx: 6, ip: '8.8.8.8', reqs: '28642', up: '18.42 M', dn: '428.64 M' },
]

const domainRows = [
  { idx: 1, domain: 'mirrors.tuna.tsinghua.edu.cn', reqs: '642864', up: '428.64 M', dn: '1.86 G' },
  { idx: 2, domain: 'work.weixin.qq.com', reqs: '128642', up: '128.86 M', dn: '642.18 M' },
  { idx: 3, domain: 'pypi.tuna.tsinghua.edu.cn', reqs: '98642', up: '86.42 M', dn: '428.64 M' },
  { idx: 4, domain: 'cn.bing.com', reqs: '72864', up: '42.64 M', dn: '286.42 M' },
  { idx: 5, domain: 'lib.tsinghua.edu.cn', reqs: '48628', up: '28.86 M', dn: '128.86 M' },
  { idx: 6, domain: 'www.rwxy.tsinghua.edu.cn', reqs: '38642', up: '18.42 M', dn: '86.42 M' },
]
</script>

<style scoped>
@import './nv-test-shared.css';
</style>
