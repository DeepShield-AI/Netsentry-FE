<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav nv-tabs-nav-wrap" role="tablist" aria-label="DNS隧道">
        <button v-for="t in tabs" :key="t.key" type="button" class="nv-tab" :class="{ active: activeTab === t.key }" role="tab" :aria-selected="activeTab === t.key" @click="activeTab = t.key">{{ t.label }}</button>
      </div>
    </div>
    <div class="nv-tabs-body">

      <!-- 实时概况 -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'realtime-overview' }">
        <div class="tid-page dt-ro-page">
          <div class="tdh-filters">
            <div class="tdh-filter-row">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">源IP</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="x.x.x.x" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">源端口</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="0 ~ 65535" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">目标IP</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="x.x.x.x" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">目标端口</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="0 ~ 65535" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">传输协议</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">解析类型</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
            </div>
            <div class="tdh-filter-row">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">疑似度</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">域名</span><input class="ou-toolbar-input tdh-filter-input" type="text" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">MAC</span><input class="ou-toolbar-input tdh-filter-input" type="text" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">用户名称</span><input class="ou-toolbar-input tdh-filter-input" type="text" disabled /></label>
              <button type="button" class="ou-search-btn" disabled>搜索</button>
              <button type="button" class="secondary td-reset-btn" disabled>重置</button>
              <button type="button" class="link-btn tid-export-btn" style="margin-left:auto" disabled>⬇ 导出</button>
            </div>
          </div>
          <div class="dt-scroll">
            <section class="tid-chart-panel">
              <div class="tid-chart-head"><h3 class="tid-mini-title">访问趋势</h3><div class="tio-range-btns"><button type="button" class="tio-range-btn active" disabled>最近三天</button><button type="button" class="tio-range-btn" disabled>最近一月</button></div></div>
              <div class="tid-chart-body"><span class="tid-yunit">#Session</span><div class="to-chart-plot"><v-chart class="dt-trend-chart" :option="dtTrendOption" autoresize /></div></div>
              <div class="dtt-chart-stats"><span class="dtt-stat"><i class="dtt-stat-badge max">MAX</i>最大值 <strong>2</strong></span><span class="dtt-stat"><i class="dtt-stat-badge min">MIN</i>最小值 <strong>0</strong></span><span class="dtt-stat"><i class="dtt-stat-badge avg">AVG</i>平均值 <strong>1</strong></span></div>
            </section>
            <div class="tid-bottom-grid">
              <section v-for="tbl in roTables" :key="tbl.title" class="tid-mini-panel">
                <div class="tid-mini-head"><h3 class="tid-mini-title">{{ tbl.title }}</h3><button type="button" class="tid-expand-btn" disabled>⛶</button></div>
                <div class="ou-table-wrap tid-mini-table-wrap">
                  <table class="ou-table tid-mini-table">
                    <thead><tr><th class="col-idx">序号</th><th class="col-name">{{ tbl.title }}</th><th class="col-metric">次数</th><th class="col-type">类型</th></tr></thead>
                    <tbody>
                      <template v-if="tbl.rows.length">
                        <tr v-for="(r, i) in tbl.rows" :key="i"><td class="col-idx">{{ i + 1 }}</td><td class="col-name"><span class="tid-link dt-ellipsis">{{ r[0] }}</span></td><td class="col-metric ou-num">{{ r[1] }}</td><td class="col-type"><span class="dt-type-bar-wrap"><span class="dt-type-bar" :style="{ width: r[2] + '%' }"></span></span></td></tr>
                      </template>
                      <tr v-else><td colspan="4" class="ou-empty">无数据</td></tr>
                    </tbody>
                  </table>
                </div>
                <div class="ou-footer">
                  <div v-if="tbl.total" class="ou-pager"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn active" disabled>1</button><button type="button" class="ou-page-btn" disabled>›</button></div>
                  <span>共 {{ tbl.total }} 条</span>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <!-- 实时会话 -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'realtime-sessions' }">
        <div class="tdh-filters">
          <div class="tdh-filter-row">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">源IP</span><select class="ou-toolbar-select" disabled><option>任意IP</option></select><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="任意IP" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">源端口</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="80 / 8000-8080" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">目标IP</span><select class="ou-toolbar-select" disabled><option>任意IP</option></select><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="任意IP" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">目标端口</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="80 / 8000-8080" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">传输协议</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">解析类型</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
          </div>
          <div class="tdh-filter-row">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">疑似度</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">域名</span><input class="ou-toolbar-input tdh-filter-input" type="text" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">MAC</span><input class="ou-toolbar-input tdh-filter-input" type="text" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">用户名称</span><input class="ou-toolbar-input tdh-filter-input" type="text" disabled /></label>
            <button type="button" class="ou-search-btn" disabled>搜索</button>
            <button type="button" class="secondary td-reset-btn" disabled>重置</button>
            <button type="button" class="link-btn tid-export-btn" disabled>⬇ 导出</button>
          </div>
        </div>
        <div class="ou-table-wrap">
          <table class="ou-table dt-rs-table">
            <thead><tr><th class="col-idx">序号</th><th class="col-time">时间</th><th class="col-mac">MAC</th><th class="col-user">用户名称</th><th class="col-endpoint">源IP</th><th class="col-endpoint">目标IP</th><th class="col-geo">地理位置</th><th class="col-proto">传输协议</th><th class="col-resolve">解析类型</th><th class="col-suspect">疑似度</th><th class="col-domain">域名</th></tr></thead>
            <tbody>
              <tr v-for="(r, i) in rsRows" :key="i"><td class="col-idx">{{ i + 1 }}</td><td class="col-time">{{ r.t }}</td><td class="col-mac">{{ r.mac }}</td><td class="col-user">—</td><td class="col-endpoint">{{ r.src }}</td><td class="col-endpoint">{{ r.dst }}</td><td class="col-geo">{{ r.geo }}</td><td class="col-proto">UDP</td><td class="col-resolve">TXT</td><td class="col-suspect"><span class="cbm-suspect-badge cbm-suspect-high">高</span></td><td class="col-domain"><span class="dt-ellipsis tid-link">{{ r.domain }}</span></td></tr>
            </tbody>
          </table>
        </div>
        <div class="ou-footer">
          <div class="ou-footer-left"><div class="ou-pager"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn active" disabled>1</button><button type="button" class="ou-page-btn" disabled>2</button><button type="button" class="ou-page-btn" disabled>3</button><button type="button" class="ou-page-btn" disabled>4</button><button type="button" class="ou-page-btn" disabled>5</button><span class="ou-page-ellipsis">…</span><button type="button" class="ou-page-btn" disabled>16</button><button type="button" class="ou-page-btn" disabled>›</button></div></div>
          <div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页 <button type="button" class="ou-page-goto-btn" disabled>确定</button></label><span>共 1598 条</span><label class="ou-page-size"><select disabled><option>100 条/页</option></select></label></div>
        </div>
      </div>

      <!-- 历史会话 -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'history-sessions' }">
        <div class="tdh-filters">
          <div class="tdh-filter-row">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">MAC</span><input class="ou-toolbar-input tdh-filter-input" type="text" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">源IP</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="任意IP" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">源端口</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="80 / 8000-8080" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">目标IP</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="任意IP" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">目标端口</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="80 / 8000-8080" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">传输协议</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
          </div>
          <div class="tdh-filter-row">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">疑似度</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">解析类型</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">用户名称</span><input class="ou-toolbar-input tdh-filter-input" type="text" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">请求域名</span><input class="ou-toolbar-input tdh-filter-input" type="text" disabled /></label>
          </div>
          <div class="tdh-filter-row">
            <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" type="text" value="2026-06-13 23:00:01 - 2026-06-13 23:15:01" disabled /></label>
            <button type="button" class="ou-search-btn" disabled>搜索</button>
            <button type="button" class="secondary td-reset-btn" disabled>重置</button>
            <button type="button" class="link-btn tid-export-btn" disabled>⬇ 导出</button>
          </div>
        </div>
        <div class="tdh-table-bar"><button type="button" class="td-icon-btn" disabled>☰</button></div>
        <div class="ou-table-wrap">
          <table class="ou-table">
            <thead><tr><th class="col-idx">序号</th><th class="col-time">请求时间</th><th class="col-mac">MAC</th><th class="col-user">用户名称</th><th class="col-endpoint">源IP</th><th class="col-endpoint">目标IP</th><th class="col-geo">目标地理位置</th><th class="col-proto">传输协议</th><th class="col-resolve">解析类型</th><th class="col-suspect">疑似度</th><th class="col-domain">请求域名</th><th class="col-actions">操作</th></tr></thead>
            <tbody><tr><td colspan="12" class="ou-empty">无数据</td></tr></tbody>
          </table>
        </div>
      </div>

      <!-- 历史诊断 -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'history-diagnosis' }">
        <div class="tid-page">
          <div class="tdh-filters">
            <div class="tdh-filter-row">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">MAC</span><input class="ou-toolbar-input tdh-filter-input" type="text" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">源IP</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="任意IP" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">源端口</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="80 / 8000-8080" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">目标IP</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="任意IP" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">目标端口</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="80 / 8000-8080" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">传输协议</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
            </div>
            <div class="tdh-filter-row">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">疑似度</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">解析类型</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">账号备注</span><input class="ou-toolbar-input tdh-filter-input" type="text" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">域名</span><input class="ou-toolbar-input tdh-filter-input" type="text" disabled /></label>
            </div>
            <div class="tdh-filter-row">
              <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" type="text" value="2026-06-13 23:00:18 - 2026-06-13 23:15:18" disabled /></label>
              <button type="button" class="ou-search-btn" disabled>搜索</button>
              <button type="button" class="secondary td-reset-btn" disabled>重置</button>
            </div>
          </div>
          <div class="dt-scroll">
            <section class="tid-chart-panel">
              <div class="tid-chart-head"><div class="tid-legend"><span class="tid-legend-item"><i class="tid-legend-dot" style="background:#5470c6"></i>次数</span></div></div>
              <div class="tid-chart-body"><span class="tid-yunit">#Session</span><div class="to-chart-plot"><v-chart class="dt-trend-chart" :option="dtTrendOption" autoresize /></div></div>
              <div class="dtt-chart-stats"><span class="dtt-stat"><i class="dtt-stat-badge max">MAX</i>最大值 <strong>0</strong></span><span class="dtt-stat"><i class="dtt-stat-badge min">MIN</i>最小值 <strong>0</strong></span><span class="dtt-stat"><i class="dtt-stat-badge avg">AVG</i>平均值 <strong>0</strong></span></div>
            </section>
            <div class="tid-bottom-grid">
              <section v-for="title in ['源IP', '域名 / 目标IP', '域名', '用户账号']" :key="title" class="tid-mini-panel">
                <div class="tid-mini-head"><h3 class="tid-mini-title">{{ title }}</h3><button type="button" class="tid-expand-btn" disabled>⛶</button></div>
                <div class="ou-table-wrap tid-mini-table-wrap">
                  <table class="ou-table tid-mini-table">
                    <thead>
                      <tr v-if="title === '域名 / 目标IP'"><th class="col-name">域名</th><th class="col-ip">目标IP</th><th class="col-metric">次数</th><th class="col-type">类型</th></tr>
                      <tr v-else><th class="col-idx">序号</th><th class="col-name">{{ title }}</th><th class="col-metric">次数</th><th class="col-type">类型</th></tr>
                    </thead>
                    <tbody><tr><td colspan="4" class="ou-empty">无数据</td></tr></tbody>
                  </table>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <!-- 白名单 -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'whitelist' }">
        <div class="ou-toolbar" style="justify-content:space-between">
          <div style="display:flex;align-items:center;gap:8px 12px;flex-wrap:wrap">
            <div class="ou-toolbar-item"><span class="ou-toolbar-label">类型</span><select class="ou-toolbar-select" disabled><option>任意</option></select></div>
            <div class="ou-toolbar-item"><input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled /><button type="button" class="ou-search-btn" style="margin-left:6px" disabled>搜索</button></div>
            <button type="button" class="secondary td-reset-btn" disabled>重置</button>
          </div>
          <div style="display:flex;gap:12px">
            <button type="button" class="link-btn" disabled>+ 添加</button>
            <button type="button" class="link-btn" disabled>批量删除</button>
            <button type="button" class="link-btn" disabled>清空</button>
            <button type="button" class="link-btn" disabled>导入</button>
            <button type="button" class="link-btn" disabled>导出</button>
          </div>
        </div>
        <div class="ou-table-wrap">
          <table class="ou-table">
            <thead><tr><th class="col-check" style="width:40px"><input type="checkbox" disabled /></th><th class="col-idx">序号</th><th>白名单对象</th><th class="col-actions" style="width:120px">操作</th></tr></thead>
            <tbody><tr><td colspan="4" class="ou-empty">无数据</td></tr></tbody>
          </table>
        </div>
        <div class="ou-footer">
          <div class="ou-footer-left"><div class="ou-pager"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn active" disabled>1</button><button type="button" class="ou-page-btn" disabled>›</button></div></div>
          <div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页 <button type="button" class="ou-page-goto-btn" disabled>确定</button></label><span>共 0 条</span><label class="ou-page-size"><select disabled><option>100 条/页</option></select></label></div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'

use([CanvasRenderer, LineChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent])
import './nv-shared.css'

const activeTab = ref('realtime-overview')
const tabs = [
  { key: 'realtime-overview', label: '实时概况' },
  { key: 'realtime-sessions', label: '实时会话' },
  { key: 'history-sessions', label: '历史会话' },
  { key: 'history-diagnosis', label: '历史诊断' },
  { key: 'whitelist', label: '白名单' },
]

const roTables = [
  { title: '源IP', total: 86, rows: [
    ['101.6.4.70', 128, 92], ['101.6.4.71', 96, 72], ['30:80:9b:8d:90:01', 64, 48], ['172.28.8.9', 42, 32],
    ['10.0.12.36', 28, 22], ['183.159.168.190', 18, 14], ['111.226.166.248', 12, 10], ['36.170.9.48', 8, 6],
  ] as any[][] },
  { title: '目标IP', total: 52, rows: [
    ['166.111.8.28', 186, 100], ['101.6.15.130', 128, 68], ['8.8.8.8', 96, 52], ['101.6.6.6', 64, 34],
    ['1.1.1.1', 42, 22], ['114.114.114.114', 28, 15], ['223.5.5.5', 16, 9], ['47.96.147.121', 8, 5],
  ] as any[][] },
  { title: '域名', total: 38, rows: [
    ['_domainkey.example.com', 64, 88], ['tunnel.dns.test', 48, 66], ['data.exfil.net', 32, 44], ['abc123.cdn-node.io', 24, 33],
    ['query.dns-tunnel.cn', 16, 22], ['sub.domainkey.local', 12, 16], ['txt.payload.net', 8, 11], ['enc.dns.example.org', 4, 6],
  ] as any[][] },
  { title: '用户账号', total: 0, rows: [] as any[][] },
]

const rsRows = [
  { t: '2026-05-29 16:45:06', mac: '30:80:9b:8d:90:01', src: '101.6.4.71:11483', dst: '166.111.8.28:53', geo: '🇨🇳 北京|教育网', domain: '_domainkey.abc123.tunnel.example.com' },
  { t: '2026-05-29 16:45:04', mac: '30:80:9b:8d:90:01', src: '101.6.4.70:52816', dst: '166.111.8.28:53', geo: '🇨🇳 北京|教育网', domain: '_domainkey.def456.data.exfil.net' },
  { t: '2026-05-29 16:45:02', mac: '54-2b-de-6d-10-ae', src: '172.28.8.9:49218', dst: '8.8.8.8:53', geo: '🇺🇸 美国', domain: 'enc.payload.dns-tunnel.cn' },
  { t: '2026-05-29 16:44:58', mac: '54-2b-de-6d-10-ae', src: '10.0.12.36:38412', dst: '101.6.15.130:53', geo: '🇨🇳 北京|BGP', domain: 'query.sub.domainkey.local' },
  { t: '2026-05-29 16:44:55', mac: '30:80:9b:8d:90:01', src: '183.159.168.190:60124', dst: '1.1.1.1:53', geo: '🇺🇸 美国', domain: 'txt.abc123.cdn-node.io' },
  { t: '2026-05-29 16:44:52', mac: '30:80:9b:8d:90:01', src: '111.226.166.248:44328', dst: '101.6.6.6:53', geo: '🇨🇳 浙江', domain: '_domainkey.ghi789.tunnel.dns.test' },
  { t: '2026-05-29 16:44:48', mac: '54-2b-de-6d-10-ae', src: '36.170.9.48:51206', dst: '114.114.114.114:53', geo: '🇨🇳 北京|BGP', domain: 'data.exfil.net' },
  { t: '2026-05-29 16:44:44', mac: '30:80:9b:8d:90:01', src: '101.6.68.247:39876', dst: '223.5.5.5:53', geo: '🇨🇳 北京|BGP', domain: 'tunnel.dns.test' },
]

const dtTrendX = ref(['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00'])
const dtTrendData = ref([
  { name: '访问次数', data: [2, 1, 0, 0, 0, 1, 3, 5, 8, 12] },
])

const dtTrendOption = computed(() => ({
  tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#e4e7ed', borderWidth: 1, textStyle: { color: '#303133' }, padding: [10, 14] },
  grid: { left: '50', right: '20', top: '20', bottom: '35' },
  xAxis: { type: 'category', data: dtTrendX.value, axisLine: { lineStyle: { color: '#c8ccd0' } }, axisLabel: { fontSize: 11, color: '#909399' }, axisTick: { show: false } },
  yAxis: { type: 'value', axisLine: { show: false }, axisLabel: { fontSize: 11, color: '#909399' }, splitLine: { lineStyle: { color: '#f0f2f5', type: 'dashed' } } },
  series: dtTrendData.value.map((s, i) => ({
    name: s.name, type: 'line', smooth: true, data: s.data,
    lineStyle: { width: 2, color: '#5470c6' },
    itemStyle: { color: '#5470c6' },
    areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(84,112,198,0.2)' }, { offset: 1, color: 'rgba(84,112,198,0.02)' }] } },
    symbol: 'circle', symbolSize: 6,
  }))
}))

const dtHistoryRows = [
  { t: '2026-05-29 16:45:06', mac: '30:80:9b:8d:90:01', user: 'user01', src: '101.6.4.71:11483', dst: '166.111.8.28:53', geo: '🇨🇳 北京|教育网', proto: 'UDP', resolve: 'TXT', suspect: '高', domain: '_domainkey.abc123.tunnel.example.com' },
  { t: '2026-05-29 16:45:04', mac: '30:80:9b:8d:90:01', user: 'user01', src: '101.6.4.70:52816', dst: '166.111.8.28:53', geo: '🇨🇳 北京|教育网', proto: 'UDP', resolve: 'TXT', suspect: '高', domain: '_domainkey.def456.data.exfil.net' },
]

const dtDiagSrcIp = [
  ['101.6.4.70', 128, 92], ['101.6.4.71', 96, 72], ['172.28.8.9', 42, 32], ['10.0.12.36', 28, 22],
]

const dtDiagDomains = [
  ['_domainkey.example.com', 64, 88], ['tunnel.dns.test', 48, 66], ['data.exfil.net', 32, 44], ['abc123.cdn-node.io', 24, 33],
]

const dtDiagDomainsWithIp = [
  { domain: '_domainkey.example.com', ip: '166.111.8.28', count: 64, type: 88 },
  { domain: 'tunnel.dns.test', ip: '101.6.15.130', count: 48, type: 66 },
]

const dtDiagUsers = [
  ['user01', 128, 92], ['user02', 42, 32],
]

const dtWhitelist = [
  { idx: 1, obj: 'internal.example.com' },
  { idx: 2, obj: '192.168.0.0/16' },
]
</script>

<style scoped>
.dt-scroll { flex:1; min-height:0; overflow:auto; display:flex; flex-direction:column; gap:12px; padding:12px; }
.dt-ellipsis { display:inline-block; max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; vertical-align:bottom; }
.dt-type-bar-wrap { display:inline-block; width:80px; height:6px; background:#f0f2f5; border-radius:3px; overflow:hidden; vertical-align:middle; }
.dt-type-bar { display:block; height:100%; background:linear-gradient(90deg,#5470c6,#409eff); }
.dt-rs-table th, .dt-rs-table td { font-size:12px; }
</style>
