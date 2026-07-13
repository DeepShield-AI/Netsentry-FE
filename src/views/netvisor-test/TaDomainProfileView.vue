<template>
  <div class="nvt-page">
    <!-- Filters -->
    <div class="tdh-filters tdp-filters">
      <div class="tdh-filter-row tdh-filter-row-actions">
        <label class="tdh-filter-field"><span class="ou-toolbar-label">MAC</span><input class="ou-toolbar-input tdh-filter-input" type="text" disabled /></label>
        <label class="tdh-filter-field"><span class="ou-toolbar-label">域名</span><select class="ou-toolbar-select" disabled><option selected>请选择</option></select><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="任意域名" disabled /></label>
        <label class="tdh-filter-field"><span class="ou-toolbar-label">用户名称</span><input class="ou-toolbar-input tdh-filter-input" type="text" disabled /></label>
        <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" type="text" value="2026-06-17 23:03:38 - 2026-06-17 23:18:38" disabled /></label>
        <button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button>
        <button type="button" class="secondary td-reset-btn" disabled title="暂未开放">重置</button>
      </div>
    </div>

    <!-- Tab bar -->
    <div class="nvt-tabs-header">
      <div class="nvt-tabs-nav">
        <button v-for="t in tabs" :key="t.key" class="nvt-tab" :class="{ active: activeTab === t.key }" @click="activeTab = t.key">{{ t.label }}</button>
      </div>
    </div>

    <div class="tdp-page">
      <!-- 访问源IP -->
      <div v-show="activeTab === 'source-ip'" class="tdp-table-page">
        <div class="ou-table-wrap tdp-table-wrap">
          <table class="ou-table tdp-table">
            <thead>
              <tr>
                <th class="col-idx">序号</th>
                <th class="col-ip">访问源IP</th>
                <th class="col-req-fail ou-th-sort">请求 / 失败</th>
                <th class="col-latency ou-th-sort">平均时延</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in sourceIpRows" :key="r.idx">
                <td class="col-idx">{{ r.idx }}</td>
                <td class="col-ip"><span class="tid-link">{{ r.ip }}</span></td>
                <td class="col-req-fail ou-num">{{ r.reqFail }}</td>
                <td class="col-latency ou-num">{{ r.latency }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="ou-footer cbm-ro-mini-footer cbm-ro-mini-footer--stacked">
          <div class="ou-footer-left">
            <div class="ou-pager ou-pager-static">
              <button type="button" class="ou-page-btn" disabled aria-label="上一页">‹</button>
              <button type="button" class="ou-page-btn" disabled aria-label="下一页">›</button>
            </div>
          </div>
          <div class="ou-footer-right"><span>共 0 条</span></div>
        </div>
      </div>

      <!-- 请求趋势 -->
      <div v-show="activeTab === 'request-trend'" class="tdp-chart-page tid-page">
        <section class="tid-chart-panel dba-trend-panel">
          <div class="dba-trend-head"><h3 class="dba-trend-title">请求趋势</h3></div>
          <div class="tid-chart-body tid-chart-body-stack dba-trend-body tdp-trend-empty">
            <span class="ou-empty">无数据</span>
          </div>
        </section>
      </div>

      <!-- 关联域名 -->
      <div v-show="activeTab === 'related-domain'" class="tdp-table-page">
        <div class="ou-table-wrap tdp-table-wrap">
          <table class="ou-table tdp-table">
            <thead>
              <tr>
                <th class="col-idx">序号</th>
                <th class="col-domain">关联域名</th>
                <th class="col-req-fail ou-th-sort">请求 / 失败</th>
                <th class="col-latency ou-th-sort">平均时延</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in relatedDomainRows" :key="r.idx">
                <td class="col-idx">{{ r.idx }}</td>
                <td class="col-domain"><span class="tid-link hsa-ellipsis">{{ r.domain }}</span></td>
                <td class="col-req-fail ou-num">{{ r.reqFail }}</td>
                <td class="col-latency ou-num">{{ r.latency }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="ou-footer cbm-ro-mini-footer cbm-ro-mini-footer--stacked">
          <div class="ou-footer-right"><span>共 0 条</span></div>
        </div>
      </div>

      <!-- 会话日志 -->
      <div v-show="activeTab === 'session-log'" class="tdp-session-page">
        <div class="ou-table-wrap tdp-session-table-wrap">
          <table class="ou-table hsa-hs-table tdp-session-table">
            <thead>
              <tr>
                <th class="col-time ou-th-sort">请求时间</th>
                <th class="col-mac">MAC</th>
                <th class="col-endpoint">源IP</th>
                <th class="col-endpoint">目标IP</th>
                <th class="col-trans">传输协议</th>
                <th class="col-app">应用协议</th>
                <th class="col-domain">请求域名</th>
                <th class="col-status">状态</th>
                <th class="col-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in sessionLogRows" :key="r.idx">
                <td class="col-time">{{ r.time }}</td>
                <td class="col-mac">{{ r.mac }}</td>
                <td class="col-endpoint"><span class="hsa-endpoint">{{ r.srcIp }}</span></td>
                <td class="col-endpoint"><span class="hsa-endpoint">{{ r.dstIp }}</span></td>
                <td class="col-trans">{{ r.proto }}</td>
                <td class="col-app">{{ r.app }}</td>
                <td class="col-domain"><span class="tid-link hsa-ellipsis">{{ r.domain }}</span></td>
                <td class="col-status">{{ r.status }}</td>
                <td class="col-actions"><button type="button" class="link-btn" disabled>详情</button></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="ou-footer ou-footer-td">
          <div class="ou-footer-right"><span>共 0 条</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import './nv-shared.css'

const tabs = [
  { key: 'source-ip', label: '访问源IP' },
  { key: 'request-trend', label: '请求趋势' },
  { key: 'related-domain', label: '关联域名' },
  { key: 'session-log', label: '会话日志' },
]
const activeTab = ref('source-ip')

const sourceIpRows = [
  { idx: 1, ip: '192.168.1.100', reqFail: '1286 / 42', latency: '28.6ms' },
  { idx: 2, ip: '192.168.1.101', reqFail: '986 / 28', latency: '32.4ms' },
  { idx: 3, ip: '192.168.1.102', reqFail: '642 / 18', latency: '42.8ms' },
  { idx: 4, ip: '192.168.1.103', reqFail: '428 / 12', latency: '56.2ms' },
  { idx: 5, ip: '192.168.1.104', reqFail: '286 / 8', latency: '68.4ms' },
]

const relatedDomainRows = [
  { idx: 1, domain: 'www.example.com', reqFail: '2864 / 86', latency: '32.8ms' },
  { idx: 2, domain: 'api.example.com', reqFail: '1986 / 64', latency: '42.6ms' },
  { idx: 3, domain: 'cdn.example.com', reqFail: '1286 / 42', latency: '28.4ms' },
  { idx: 4, domain: 'static.example.com', reqFail: '986 / 28', latency: '36.2ms' },
  { idx: 5, domain: 'img.example.com', reqFail: '642 / 18', latency: '48.6ms' },
]

const sessionLogRows = [
  { idx: 1, time: '2026-06-17 23:15:42', mac: '54-2b-de-6d-10-ae', srcIp: '192.168.1.100:48624', dstIp: '101.6.15.130:443', proto: 'TCP', app: 'HTTPS', domain: 'www.example.com', status: '成功' },
  { idx: 2, time: '2026-06-17 23:15:38', mac: '54-2b-de-6d-10-ae', srcIp: '192.168.1.101:52816', dstIp: '101.6.6.6:80', proto: 'TCP', app: 'HTTP', domain: 'api.example.com', status: '成功' },
  { idx: 3, time: '2026-06-17 23:15:34', mac: '54-2b-de-6d-10-ae', srcIp: '192.168.1.102:39876', dstIp: '166.111.7.7:443', proto: 'TCP', app: 'HTTPS', domain: 'cdn.example.com', status: '失败' },
  { idx: 4, time: '2026-06-17 23:15:30', mac: '54-2b-de-6d-10-ae', srcIp: '192.168.1.103:44328', dstIp: '101.6.8.149:443', proto: 'TCP', app: 'HTTPS', domain: 'static.example.com', status: '成功' },
  { idx: 5, time: '2026-06-17 23:15:26', mac: '54-2b-de-6d-10-ae', srcIp: '192.168.1.104:51234', dstIp: '101.6.10.23:53', proto: 'UDP', app: 'DNS', domain: 'img.example.com', status: '成功' },
]
</script>

<style scoped>
@import './nv-test-shared.css';
</style>
