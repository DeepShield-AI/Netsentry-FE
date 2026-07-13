<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav" role="tablist" aria-label="证书分析">
        <button v-for="tab in tabs" :key="tab.key" type="button" class="nv-tab" :class="{ active: activeTab === tab.key }" role="tab" :aria-selected="activeTab === tab.key" @click="activeTab = tab.key">{{ tab.label }}</button>
      </div>
    </div>
    <div class="nv-tabs-body">

      <!-- 实时概况 -->
      <div class="ca-panel" :class="{ active: activeTab === 'realtime' }" data-ca-panel="realtime" role="tabpanel">
        <div class="car-page">
          <div class="car-top-row">
            <div class="car-stats-grid">
              <div v-for="s in statCards" :key="s.label" class="car-stat-card">
                <div class="car-stat-icon" :class="'car-stat-icon--' + s.type" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false" v-html="s.svg"></svg>
                </div>
                <div class="car-stat-body">
                  <div class="car-stat-val">{{ s.val }}</div>
                  <div class="car-stat-label">{{ s.label }}</div>
                </div>
              </div>
            </div>
            <section class="car-pie-panel">
              <h3 class="car-pie-title">类型分布</h3>
              <v-chart class="car-pie-vchart" :option="pieOption" autoresize />
            </section>
          </div>

          <div class="car-table-row">
            <section class="car-table-panel car-table-panel--expiring">
              <div class="car-table-head"><h3 class="car-table-title">即将到期的证书</h3><button type="button" class="car-table-menu" disabled title="列设置">☰</button></div>
              <div class="ou-table-wrap car-table-wrap">
                <table class="ou-table car-table">
                  <thead><tr><th class="col-idx">序号</th><th class="col-cert">证书…</th><th class="col-period">证书期限</th><th class="col-target-ip">目标IP</th><th class="col-ca">CA证书</th><th class="col-geo">地理…</th></tr></thead>
                  <tbody><tr v-for="item in expiringCertData" :key="item.idx"><td>{{ item.idx }}</td><td>{{ item.cert }}</td><td>{{ item.period }}</td><td>{{ item.targetIp }}</td><td>{{ item.ca }}</td><td>{{ item.geo }}</td></tr></tbody>
                </table>
              </div>
              <div class="ou-footer car-table-footer">
                <div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn active" disabled>1</button><button type="button" class="ou-page-btn" disabled>›</button></div></div>
                <div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页 <button type="button" class="ou-page-goto-btn" disabled>确定</button></label><span>共 {{ expiringCertData.length }} 条</span><label class="ou-page-size"><select disabled><option selected>100 条/页</option></select></label></div>
              </div>
            </section>
            <section class="car-table-panel car-table-panel--expired">
              <div class="car-table-head"><h3 class="car-table-title">已经到期的证书</h3><button type="button" class="car-table-menu" disabled title="列设置">☰</button></div>
              <div class="ou-table-wrap car-table-wrap">
                <table class="ou-table car-table">
                  <thead><tr><th class="col-idx">序号</th><th class="col-cert">证书…</th><th class="col-period">证书期限</th><th class="col-target-ip">目标IP</th><th class="col-ca">CA证书</th><th class="col-geo">地理…</th></tr></thead>
                  <tbody><tr v-for="item in expiredCertData" :key="item.idx"><td>{{ item.idx }}</td><td>{{ item.cert }}</td><td>{{ item.period }}</td><td>{{ item.targetIp }}</td><td>{{ item.ca }}</td><td>{{ item.geo }}</td></tr></tbody>
                </table>
              </div>
              <div class="ou-footer car-table-footer">
                <div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn active" disabled>1</button><button type="button" class="ou-page-btn" disabled>›</button></div></div>
                <div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页 <button type="button" class="ou-page-goto-btn" disabled>确定</button></label><span>共 {{ expiredCertData.length }} 条</span><label class="ou-page-size"><select disabled><option selected>100 条/页</option></select></label></div>
              </div>
            </section>
          </div>

          <div class="car-table-row">
            <section class="car-table-panel car-table-panel--temp">
              <div class="car-table-head"><h3 class="car-table-title">临时证书</h3><button type="button" class="car-table-menu" disabled title="列设置">☰</button></div>
              <div class="ou-table-wrap car-table-wrap">
                <table class="ou-table car-table">
                  <thead><tr><th class="col-idx">序号</th><th class="col-cert">证书…</th><th class="col-period">证书期限</th><th class="col-target-ip">目标IP</th><th class="col-ca">CA证书</th><th class="col-geo">地理…</th></tr></thead>
                  <tbody><tr v-for="item in tempCertData" :key="item.idx"><td>{{ item.idx }}</td><td>{{ item.cert }}</td><td>{{ item.period }}</td><td>{{ item.targetIp }}</td><td>{{ item.ca }}</td><td>{{ item.geo }}</td></tr></tbody>
                </table>
              </div>
              <div class="ou-footer car-table-footer">
                <div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn active" disabled>1</button><button type="button" class="ou-page-btn" disabled>›</button></div></div>
                <div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页 <button type="button" class="ou-page-goto-btn" disabled>确定</button></label><span>共 {{ tempCertData.length }} 条</span><label class="ou-page-size"><select disabled><option selected>100 条/页</option></select></label></div>
              </div>
            </section>
            <section class="car-table-panel car-table-panel--normal">
              <div class="car-table-head"><h3 class="car-table-title">正常证书</h3><button type="button" class="car-table-menu" disabled title="列设置">☰</button></div>
              <div class="ou-table-wrap car-table-wrap">
                <table class="ou-table car-table">
                  <thead><tr><th class="col-idx">序号</th><th class="col-cert">证书…</th><th class="col-period">证书期限</th><th class="col-target-ip">目标IP</th><th class="col-ca">CA证书</th><th class="col-geo">地理…</th></tr></thead>
                  <tbody><tr v-for="item in normalCertData" :key="item.idx"><td>{{ item.idx }}</td><td>{{ item.cert }}</td><td>{{ item.period }}</td><td>{{ item.targetIp }}</td><td>{{ item.ca }}</td><td>{{ item.geo }}</td></tr></tbody>
                </table>
              </div>
              <div class="ou-footer car-table-footer">
                <div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn active" disabled>1</button><button type="button" class="ou-page-btn" disabled>›</button></div></div>
                <div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页 <button type="button" class="ou-page-goto-btn" disabled>确定</button></label><span>共 {{ normalCertData.length }} 条</span><label class="ou-page-size"><select disabled><option selected>100 条/页</option></select></label></div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <!-- 历史概况 -->
      <div class="ca-panel" :class="{ active: activeTab === 'history-overview' }" data-ca-panel="history-overview" role="tabpanel">
        <div class="car-page cah-page">
          <div class="cah-filters tdh-filters">
            <div class="tdh-filter-row tdh-filter-row-actions">
              <label class="tdh-filter-field"><select class="ou-toolbar-select" disabled><option selected>目标IP</option></select><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="任意IP" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">目标端口</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="80 / 8000-8080" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">域名</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="" disabled /></label>
              <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" type="text" value="— - —" disabled /></label>
              <button type="button" class="ou-search-btn" disabled>搜索</button>
              <button type="button" class="secondary td-reset-btn" disabled>重置</button>
            </div>
          </div>

          <div class="car-top-row">
            <div class="car-stats-grid">
              <div v-for="s in statCards" :key="'h-'+s.label" class="car-stat-card">
                <div class="car-stat-icon" :class="'car-stat-icon--' + s.type" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false" v-html="s.svg"></svg>
                </div>
                <div class="car-stat-body">
                  <div class="car-stat-val">0</div>
                  <div class="car-stat-label">{{ s.label }}</div>
                </div>
              </div>
            </div>
            <section class="car-pie-panel">
              <h3 class="car-pie-title">类型分布</h3>
              <v-chart class="car-pie-vchart" :option="pieOption" autoresize />
            </section>
          </div>

          <div class="car-table-row">
            <section class="car-table-panel car-table-panel--expiring">
              <div class="car-table-head"><h3 class="car-table-title">即将到期的证书数量</h3><button type="button" class="car-table-menu" disabled>☰</button></div>
              <div class="ou-table-wrap car-table-wrap"><table class="ou-table car-table"><thead><tr><th class="col-idx">序号</th><th class="col-cert">证书…</th><th class="col-period">证书期限</th><th class="col-target-ip">目标IP</th><th class="col-ca">CA证书</th><th class="col-geo">地理…</th></tr></thead><tbody><tr v-for="item in expiringCertData" :key="'h-'+item.idx"><td>{{ item.idx }}</td><td>{{ item.cert }}</td><td>{{ item.period }}</td><td>{{ item.targetIp }}</td><td>{{ item.ca }}</td><td>{{ item.geo }}</td></tr></tbody></table></div>
              <div class="ou-footer car-table-footer"><div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn active" disabled>1</button><button type="button" class="ou-page-btn" disabled>›</button></div></div><div class="ou-footer-right"><span>共 {{ expiringCertData.length }} 条</span></div></div>
            </section>
            <section class="car-table-panel car-table-panel--expired">
              <div class="car-table-head"><h3 class="car-table-title">已经到期的证书数量</h3><button type="button" class="car-table-menu" disabled>☰</button></div>
              <div class="ou-table-wrap car-table-wrap"><table class="ou-table car-table"><thead><tr><th class="col-idx">序号</th><th class="col-cert">证书…</th><th class="col-period">证书期限</th><th class="col-target-ip">目标IP</th><th class="col-ca">CA证书</th><th class="col-geo">地理…</th></tr></thead><tbody><tr v-for="item in expiredCertData" :key="'h-'+item.idx"><td>{{ item.idx }}</td><td>{{ item.cert }}</td><td>{{ item.period }}</td><td>{{ item.targetIp }}</td><td>{{ item.ca }}</td><td>{{ item.geo }}</td></tr></tbody></table></div>
              <div class="ou-footer car-table-footer"><div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn active" disabled>1</button><button type="button" class="ou-page-btn" disabled>›</button></div></div><div class="ou-footer-right"><span>共 {{ expiredCertData.length }} 条</span></div></div>
            </section>
          </div>
          <div class="car-table-row">
            <section class="car-table-panel car-table-panel--temp">
              <div class="car-table-head"><h3 class="car-table-title">临时证书</h3><button type="button" class="car-table-menu" disabled>☰</button></div>
              <div class="ou-table-wrap car-table-wrap"><table class="ou-table car-table"><thead><tr><th class="col-idx">序号</th><th class="col-cert">证书…</th><th class="col-period">证书期限</th><th class="col-target-ip">目标IP</th><th class="col-ca">CA证书</th><th class="col-geo">地理…</th></tr></thead><tbody><tr v-for="item in tempCertData" :key="'h-'+item.idx"><td>{{ item.idx }}</td><td>{{ item.cert }}</td><td>{{ item.period }}</td><td>{{ item.targetIp }}</td><td>{{ item.ca }}</td><td>{{ item.geo }}</td></tr></tbody></table></div>
              <div class="ou-footer car-table-footer"><div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn active" disabled>1</button><button type="button" class="ou-page-btn" disabled>›</button></div></div><div class="ou-footer-right"><span>共 {{ tempCertData.length }} 条</span></div></div>
            </section>
            <section class="car-table-panel car-table-panel--normal">
              <div class="car-table-head"><h3 class="car-table-title">正常证书</h3><button type="button" class="car-table-menu" disabled>☰</button></div>
              <div class="ou-table-wrap car-table-wrap"><table class="ou-table car-table"><thead><tr><th class="col-idx">序号</th><th class="col-cert">证书…</th><th class="col-period">证书期限</th><th class="col-target-ip">目标IP</th><th class="col-ca">CA证书</th><th class="col-geo">地理…</th></tr></thead><tbody><tr v-for="item in normalCertData" :key="'h-'+item.idx"><td>{{ item.idx }}</td><td>{{ item.cert }}</td><td>{{ item.period }}</td><td>{{ item.targetIp }}</td><td>{{ item.ca }}</td><td>{{ item.geo }}</td></tr></tbody></table></div>
              <div class="ou-footer car-table-footer"><div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn active" disabled>1</button><button type="button" class="ou-page-btn" disabled>›</button></div></div><div class="ou-footer-right"><span>共 {{ normalCertData.length }} 条</span></div></div>
            </section>
          </div>
        </div>
      </div>

      <!-- 历史会话 -->
      <div class="ca-panel" :class="{ active: activeTab === 'history-sessions' }" data-ca-panel="history-sessions" role="tabpanel">
        <div class="cas-page">
          <div class="tdh-filters cas-filters">
            <div class="tdh-filter-row">
              <label class="tdh-filter-field"><select class="ou-toolbar-select" disabled><option selected>源IP</option></select><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="任意IP" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">源端口</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="80 / 8000-8080" disabled /></label>
              <label class="tdh-filter-field"><select class="ou-toolbar-select" disabled><option selected>目标IP</option></select><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="任意IP" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">目标端口</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="80 / 8000-8080" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">关键字</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="" disabled /></label>
            </div>
            <div class="tdh-filter-row tdh-filter-row-actions">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">MAC</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">备用名称</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="" disabled /></label>
              <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" type="text" value="— - —" disabled /></label>
              <div class="tdh-filter-field cas-filter-actions">
                <button type="button" class="ou-search-btn" disabled>搜索</button>
                <button type="button" class="secondary td-reset-btn" disabled>重置</button>
              </div>
            </div>
          </div>

          <div class="ou-table-wrap cas-table-wrap">
            <table class="ou-table cas-table">
              <thead><tr><th class="col-idx">序号</th><th class="col-time">请求时间</th><th class="col-mac">MAC</th><th class="col-mac-vendor">MAC厂商</th><th class="col-endpoint">源IP</th><th class="col-endpoint">目标IP</th><th class="col-geo">地理位置</th><th class="col-cert-summary">证书摘要</th><th class="col-actions">操作</th></tr></thead>
              <tbody><tr v-for="item in historySessionsData" :key="item.idx"><td>{{ item.idx }}</td><td>{{ item.time }}</td><td>{{ item.mac }}</td><td>{{ item.vendor }}</td><td>{{ item.srcIp }}</td><td>{{ item.dstIp }}</td><td>{{ item.geo }}</td><td>{{ item.summary }}</td><td><button type="button" class="link-btn" disabled>{{ item.actions[0] }}</button></td></tr></tbody>
            </table>
          </div>

          <div class="ou-footer ou-footer-td cas-footer">
            <div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn active" disabled>1</button><button type="button" class="ou-page-btn" disabled>›</button></div></div>
            <div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页 <button type="button" class="ou-page-goto-btn" disabled>确定</button></label><span>共 0 条</span><label class="ou-page-size"><select disabled><option selected>100 条/页</option></select></label></div>
          </div>
        </div>
      </div>

      <!-- 证书告警 -->
      <div class="ca-panel" :class="{ active: activeTab === 'cert-alerts' }" data-ca-panel="cert-alerts" role="tabpanel">
        <div class="caa-page">
          <div class="ou-toolbar caa-toolbar">
            <div class="caa-toolbar-actions">
              <button type="button" class="link-btn caa-link-btn" disabled>通知方式</button>
              <button type="button" class="link-btn caa-link-btn" disabled>告警设置</button>
              <span class="caa-toolbar-sep" aria-hidden="true"></span>
              <button type="button" class="link-btn caa-action-btn" disabled>+ 添加</button>
              <button type="button" class="link-btn caa-action-btn" disabled>删除选中</button>
            </div>
          </div>

          <div class="ou-table-wrap caa-table-wrap">
            <table class="ou-table caa-table">
              <thead><tr><th class="col-check"><input type="checkbox" aria-label="全选" disabled /></th><th class="col-idx">序号</th><th class="col-domain">域名</th><th class="col-date">颁发日期</th><th class="col-date">结束日期</th><th class="col-period">使用期限</th><th class="col-usage-pct">使用占比</th><th class="col-remain">剩余天数</th><th class="col-type">类型</th><th class="col-threshold">告警阈值</th><th class="col-name">名称</th><th class="col-actions">操作</th></tr></thead>
              <tbody><tr v-for="item in certAlertsData" :key="item.idx"><td><input type="checkbox" disabled /></td><td>{{ item.idx }}</td><td>{{ item.domain }}</td><td>{{ item.issueDate }}</td><td>{{ item.endDate }}</td><td>{{ item.period }}</td><td>{{ item.usagePct }}</td><td>{{ item.remain }}</td><td>{{ item.type }}</td><td>{{ item.threshold }}</td><td>{{ item.name }}</td><td><button type="button" class="link-btn" disabled>{{ item.actions[0] }}</button> <button type="button" class="link-btn" disabled>{{ item.actions[1] }}</button></td></tr></tbody>
            </table>
          </div>

          <div class="ou-footer ou-footer-td caa-footer">
            <div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn active" disabled>1</button><button type="button" class="ou-page-btn" disabled>›</button></div></div>
            <div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页 <button type="button" class="ou-page-goto-btn" disabled>确定</button></label><span>共 0 条</span><label class="ou-page-size"><select disabled><option selected>100 条/页</option></select></label></div>
          </div>
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
import { PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components'

use([CanvasRenderer, PieChart, TitleComponent, TooltipComponent, LegendComponent])

const activeTab = ref('realtime')
const tabs = [
  { key: 'realtime', label: '实时概况' },
  { key: 'history-overview', label: '历史概况' },
  { key: 'history-sessions', label: '历史会话' },
  { key: 'cert-alerts', label: '证书告警' },
]

const SVG_EXPIRING = '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'
const SVG_EXPIRED = '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 8v5M12 16.5v.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'
const SVG_NORMAL = '<path d="M12 3 4 7v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V7l-8-4z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="m9 12 2 2 4-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'
const SVG_TEMP = '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 12h18M12 3a15 15 0 0 1 4 9 15 15 0 0 1-4 9 15 15 0 0 1-4-9 15 15 0 0 1 4-9z" fill="none" stroke="currentColor" stroke-width="1.4"/>'
const SVG_SELF = '<path d="M12 2 4 6v6c0 5.2 3.4 9.6 8 10.8C16.6 21.6 20 17.2 20 12V6l-8-4z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 12h8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'
const SVG_CA = '<path d="M12 2 4 6v6c0 5.2 3.4 9.6 8 10.8C16.6 21.6 20 17.2 20 12V6l-8-4z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="m9 12 2 2 4-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'

const statCards = [
  { type: 'expiring', label: '即将到期的证书数量', val: 15, svg: SVG_EXPIRING },
  { type: 'expired', label: '已经到期的证书数量', val: 8, svg: SVG_EXPIRED },
  { type: 'normal', label: '正常证书', val: 156, svg: SVG_NORMAL },
  { type: 'temp', label: '临时证书', val: 12, svg: SVG_TEMP },
  { type: 'self', label: '自签名证书', val: 23, svg: SVG_SELF },
  { type: 'ca', label: 'CA证书', val: 45, svg: SVG_CA },
]

const pieData = ref([
  { name: '正常证书', value: 156, itemStyle: { color: '#67c23a' } },
  { name: 'CA证书', value: 45, itemStyle: { color: '#409eff' } },
  { name: '自签名证书', value: 23, itemStyle: { color: '#e6a23c' } },
  { name: '临时证书', value: 12, itemStyle: { color: '#f56c6c' } },
  { name: '即将到期', value: 15, itemStyle: { color: '#e6a23c' } },
  { name: '已过期', value: 8, itemStyle: { color: '#909399' } },
])

const pieOption = computed(() => ({
  tooltip: { trigger: 'item', backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#e4e7ed', borderWidth: 1, textStyle: { color: '#303133' }, padding: [10, 14], formatter: '{b}: {c} ({d}%)' },
  legend: { orient: 'vertical', right: '5%', top: 'center', textStyle: { fontSize: 12, color: '#606266' }, itemWidth: 12, itemHeight: 8 },
  series: [{
    name: '证书类型分布', type: 'pie', radius: ['45%', '75%'], center: ['35%', '50%'],
    avoidLabelOverlap: true, itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
    label: { show: true, position: 'inside', fontSize: 11, fontWeight: 600, color: '#fff', formatter: '{d}%' },
    emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
    labelLine: { show: false },
    data: pieData.value,
  }]
}))

const expiringCertData = ref([
  { idx: 1, cert: '*.example.com', period: '2025-07-01 - 2026-07-15', targetIp: '104.16.181.15', ca: 'Let\'s Encrypt', geo: '美国' },
  { idx: 2, cert: 'api.test.net', period: '2025-08-10 - 2026-08-10', targetIp: '198.51.100.20', ca: 'DigiCert', geo: '英国' },
  { idx: 3, cert: 'secure.dev.io', period: '2025-09-01 - 2026-09-01', targetIp: '104.16.181.17', ca: 'GlobalSign', geo: '新加坡' },
])

const expiredCertData = ref([
  { idx: 1, cert: 'old.example.org', period: '2024-01-01 - 2025-01-01', targetIp: '104.16.181.18', ca: 'Comodo', geo: '美国' },
  { idx: 2, cert: 'expired.test.cn', period: '2023-06-15 - 2024-06-15', targetIp: '198.51.100.25', ca: 'VeriSign', geo: '中国' },
])

const tempCertData = ref([
  { idx: 1, cert: 'temp.local.net', period: '2026-07-01 - 2026-07-08', targetIp: '192.168.1.100', ca: 'Self', geo: '内网' },
  { idx: 2, cert: 'dev.local', period: '2026-07-05 - 2026-07-12', targetIp: '192.168.1.101', ca: 'Self', geo: '内网' },
])

const normalCertData = ref([
  { idx: 1, cert: '*.google.com', period: '2025-03-01 - 2027-03-01', targetIp: '142.250.185.14', ca: 'Google Trust Services', geo: '美国' },
  { idx: 2, cert: '*.baidu.com', period: '2025-04-15 - 2027-04-15', targetIp: '220.181.38.148', ca: 'GlobalSign', geo: '中国' },
  { idx: 3, cert: '*.github.com', period: '2025-05-01 - 2027-05-01', targetIp: '140.82.121.4', ca: 'DigiCert', geo: '美国' },
])

const historySessionsData = ref([
  { idx: 1, time: '2026-07-08 09:30:45', mac: '00:11:22:33:44:55', vendor: 'Huawei', srcIp: '192.168.1.105', dstIp: '104.16.181.15', geo: '美国', summary: 'SHA-256: abc123...', actions: ['详情'] },
  { idx: 2, time: '2026-07-08 09:28:12', mac: '00:11:22:33:44:56', vendor: 'Lenovo', srcIp: '192.168.1.108', dstIp: '220.181.38.148', geo: '中国', summary: 'SHA-256: def456...', actions: ['详情'] },
  { idx: 3, time: '2026-07-08 09:25:30', mac: '00:11:22:33:44:57', vendor: 'Dell', srcIp: '192.168.1.112', dstIp: '142.250.185.14', geo: '美国', summary: 'SHA-256: ghi789...', actions: ['详情'] },
])

const certAlertsData = ref([
  { idx: 1, domain: 'example.com', issueDate: '2025-07-01', endDate: '2026-07-15', period: '380天', usagePct: '96%', remain: '12天', type: '即将到期', threshold: '30天', name: 'example-cert', actions: ['编辑', '删除'] },
  { idx: 2, domain: 'test.net', issueDate: '2025-08-10', endDate: '2026-08-10', period: '365天', usagePct: '88%', remain: '32天', type: '即将到期', threshold: '30天', name: 'test-cert', actions: ['编辑', '删除'] },
])
</script>

<style scoped>
/* Layout */
.nv-border-card { display:flex; flex-direction:column; height:100%; min-height:0; border:1px solid #e4e7ed; border-radius:4px; background:#fff; overflow:hidden; }
.nv-tabs-header { flex-shrink:0; padding:0 16px; border-bottom:1px solid #e4e7ed; background:#fafafa; }
.nv-tabs-nav { display:flex; gap:0; }
.nv-tab { position:relative; padding:12px 20px; border:none; background:transparent; font-size:14px; font-weight:600; color:#606266; cursor:pointer; white-space:nowrap; }
.nv-tab.active { color:#409eff; }
.nv-tab.active::after { content:''; position:absolute; bottom:0; left:20px; right:20px; height:2px; background:#409eff; border-radius:1px 1px 0 0; }
.nv-tabs-body { flex:1; min-height:0; display:flex; flex-direction:column; overflow:hidden; }

/* Panel visibility */
.ca-panel { flex:1; min-height:0; display:none; flex-direction:column; }
.ca-panel.active { display:flex; }

/* Common table/footer */
.ou-table-wrap { flex:1; min-height:0; overflow:auto; }
.ou-table { width:100%; border-collapse:collapse; font-size:13px; }
.ou-table th { background:#fafbfc; border-bottom:1px solid #ebeef5; padding:8px 10px; text-align:left; font-weight:600; color:#606266; white-space:nowrap; font-size:12px; }
.ou-table td { border-bottom:1px solid #f0f2f5; padding:8px 10px; color:#303133; }
.ou-empty { text-align:center; color:#909399; padding:32px 10px !important; }
.col-idx { width:48px; text-align:center; }
.col-check { width:40px; text-align:center; }
.ou-footer { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:8px 14px; border-top:1px solid #ebeef5; font-size:12px; color:#606266; flex-shrink:0; }
.ou-footer-td { flex-shrink:0; }
.ou-footer-left { display:flex; align-items:center; gap:10px; }
.ou-footer-right { display:flex; align-items:center; flex-wrap:wrap; gap:8px 12px; }
.ou-pager { display:inline-flex; align-items:center; gap:4px; }
.ou-page-btn { min-width:28px; height:28px; padding:0 6px; border:1px solid #dcdfe6; border-radius:3px; background:#fff; color:#303133; font-size:12px; cursor:pointer; }
.ou-page-btn.active { background:#409eff; color:#fff; border-color:#409eff; }
.ou-page-btn:disabled { opacity:.5; cursor:not-allowed; }
.ou-page-goto { display:inline-flex; align-items:center; gap:4px; font-size:12px; color:#606266; }
.ou-page-goto-input { width:36px; height:24px; text-align:center; border:1px solid #dcdfe6; border-radius:3px; font-size:12px; }
.ou-page-goto-btn { height:24px; padding:0 8px; border:1px solid #dcdfe6; border-radius:3px; background:#fff; font-size:12px; cursor:pointer; }
.ou-page-goto-btn:disabled { opacity:.5; cursor:not-allowed; }
.ou-page-size select { height:24px; border:1px solid #dcdfe6; border-radius:3px; font-size:12px; padding:0 4px; }
.link-btn { padding:0; border:none; background:none; color:#409eff; cursor:pointer; font-size:13px; font-weight:500; }
.link-btn:disabled { opacity:.55; cursor:not-allowed; }

/* Toolbar / filters common */
.ou-toolbar { display:flex; flex-wrap:wrap; align-items:center; gap:8px 12px; padding:10px 15px; border-bottom:1px solid #ebeef5; }
.ou-toolbar-label { font-size:13px; color:#606266; white-space:nowrap; }
.ou-toolbar-input { height:30px; padding:0 8px; border:1px solid #dcdfe6; border-radius:4px; font-size:13px; color:#303133; }
.ou-toolbar-select { height:30px; padding:0 6px; border:1px solid #dcdfe6; border-radius:4px; font-size:13px; color:#303133; background:#fff; }
.ou-search-btn { height:30px; padding:0 14px; border:1px solid #409eff; border-radius:4px; background:#409eff; color:#fff; font-size:13px; font-weight:500; cursor:pointer; }
.ou-search-btn:disabled { opacity:.55; cursor:not-allowed; }
.secondary { height:30px; padding:0 14px; border:1px solid #dcdfe6; border-radius:4px; background:#fff; color:#606266; font-size:13px; cursor:pointer; }
.secondary:disabled { opacity:.55; cursor:not-allowed; }
.tdh-filters { padding:10px 15px; background:#fff; border-bottom:1px solid #ebeef5; }
.tdh-filter-row { display:flex; flex-wrap:wrap; align-items:center; gap:8px 12px; margin-bottom:6px; }
.tdh-filter-row:last-child { margin-bottom:0; }
.tdh-filter-row-actions { margin-top:2px; }
.tdh-filter-field { display:inline-flex; align-items:center; gap:6px; }
.tdh-filter-input { width:140px; }
.tdh-filter-time { flex:1; min-width:200px; }
.tdh-time-range { width:100%; min-width:260px; }
.td-reset-btn { height:30px; padding:0 14px; border:1px solid #dcdfe6; border-radius:4px; background:#fff; color:#606266; font-size:13px; cursor:pointer; }
.td-reset-btn:disabled { opacity:.55; cursor:not-allowed; }

/* CAR - 实时概况 / 历史概况 */
.car-page { flex:1; min-height:0; overflow:auto; padding:12px; display:flex; flex-direction:column; gap:12px; }
.car-top-row { display:grid; grid-template-columns:1fr min(340px,34%); gap:12px; align-items:stretch; }
.car-stats-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px; }
.car-stat-card { display:flex; align-items:center; gap:8px; padding:10px 12px; background:#fff; border:1px solid #e4e7ed; border-radius:4px; box-shadow:0 1px 4px rgba(0,0,0,0.04); }
.car-stat-icon { flex-shrink:0; width:34px; height:34px; border-radius:6px; display:flex; align-items:center; justify-content:center; }
.car-stat-icon svg { width:18px; height:18px; display:block; }
.car-stat-icon--expiring { color:#e6a23c; background:linear-gradient(145deg,#fdf6ec 0%,#faecd8 100%); }
.car-stat-icon--expired { color:#909399; background:linear-gradient(145deg,#f4f4f5 0%,#e9e9eb 100%); }
.car-stat-icon--normal { color:#67c23a; background:linear-gradient(145deg,#f0f9eb 0%,#e1f3d8 100%); }
.car-stat-icon--temp { color:#f56c6c; background:linear-gradient(145deg,#fef0f0 0%,#fde2e2 100%); }
.car-stat-icon--self { color:#e6a23c; background:linear-gradient(145deg,#fdf6ec 0%,#faecd8 100%); }
.car-stat-icon--ca { color:#67c23a; background:linear-gradient(145deg,#f0f9eb 0%,#e1f3d8 100%); }
.car-stat-body { flex:1; min-width:0; display:flex; flex-direction:column; gap:4px; }
.car-stat-val { font-size:18px; font-weight:700; color:#303133; font-variant-numeric:tabular-nums; line-height:1.2; }
.car-stat-label { font-size:11px; color:#909399; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.car-pie-panel { background:#fff; border:1px solid #e4e7ed; border-radius:4px; padding:10px 8px 4px; display:flex; flex-direction:column; min-height:0; overflow:visible; }
.car-pie-title { margin:0 0 2px 4px; font-size:14px; font-weight:600; color:#303133; }
.car-pie-wrap { flex:1; min-height:220px; display:flex; align-items:center; justify-content:center; padding:0 4px; overflow:visible; }
.car-pie-vchart { flex:1; min-height:220px; }
.car-pie-wrap .to-pie-svg-ref { display:block; width:100%; max-width:340px; height:auto; min-height:210px; overflow:visible; }
.car-table-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; min-width:0; }
.car-table-panel { background:#fff; border:1px solid #e4e7ed; border-radius:4px; display:flex; flex-direction:column; min-width:0; min-height:0; }
.car-table-head { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; border-bottom:1px solid #ebeef5; position:relative; }
.car-table-head::before { content:""; position:absolute; left:0; top:50%; transform:translateY(-50%); width:3px; height:16px; border-radius:2px; background:var(--car-accent,#e6a23c); }
.car-table-panel--expiring { --car-accent:#e6a23c; }
.car-table-panel--expired { --car-accent:#909399; }
.car-table-panel--temp { --car-accent:#f56c6c; }
.car-table-panel--normal { --car-accent:#67c23a; }
.car-table-title { margin:0; font-size:14px; font-weight:600; color:#303133; }
.car-table-menu { border:none; background:transparent; color:#909399; font-size:16px; line-height:1; padding:2px 4px; cursor:default; }
.car-table-menu:disabled { opacity:0.6; }
.car-table-wrap { max-height:320px; overflow:auto; }
.car-table .col-cert { min-width:72px; max-width:100px; }
.car-table .col-period { min-width:180px; white-space:nowrap; font-size:12px; }
.car-table .col-target-ip { min-width:120px; max-width:140px; }
.car-table .col-ca { width:64px; text-align:center; }
.car-table .col-geo { min-width:72px; }
.car-table-footer { flex-shrink:0; padding:8px 12px; border-top:1px solid #ebeef5; font-size:12px; }
.car-table-footer .ou-footer-right { flex-wrap:wrap; gap:8px 12px; }

/* CAH - 历史概况 filters */
.cah-filters { flex-shrink:0; margin:-4px 0 4px; }

/* CAS - 历史会话 */
.cas-page { flex:1; min-height:0; display:flex; flex-direction:column; overflow:hidden; background:#fff; }
.cas-filters .cas-filter-actions { display:flex; flex-direction:column; gap:6px; margin-left:auto; align-self:flex-end; }
.cas-table-wrap { flex:1; min-height:0; }
.cas-table { min-width:1560px; table-layout:fixed; }
.cas-table .col-idx { width:52px; }
.cas-table .col-time { width:148px; white-space:nowrap; font-size:12px; }
.cas-table .col-mac { width:128px; font-family:ui-monospace,monospace; font-size:12px; }
.cas-table .col-mac-vendor { width:120px; }
.cas-table .col-endpoint { width:142px; font-size:12px; }
.cas-table .col-geo { width:200px; }
.cas-table .col-cert-summary { width:300px; vertical-align:top; }
.cas-table .col-actions { width:72px; vertical-align:top; }
.cas-footer .ou-footer-left { display:flex; align-items:center; gap:12px; }

/* CAA - 证书告警 */
.caa-page { flex:1; min-height:0; display:flex; flex-direction:column; overflow:hidden; background:#fff; }
.caa-toolbar { justify-content:flex-end; flex-shrink:0; }
.caa-toolbar-actions { display:flex; align-items:center; flex-wrap:wrap; justify-content:flex-end; gap:4px 18px; margin-left:auto; }
.caa-link-btn, .caa-action-btn { padding:0; border:none; background:none; font-size:13px; font-weight:500; color:#409eff; cursor:default; white-space:nowrap; }
.caa-link-btn:disabled, .caa-action-btn:disabled { opacity:.55; cursor:not-allowed; }
.caa-toolbar-sep { width:1px; height:14px; background:#dcdfe6; margin:0 2px; }
.caa-table-wrap { flex:1; min-height:0; }
.caa-table { min-width:1320px; table-layout:fixed; }
.caa-table .col-domain { width:140px; }
.caa-table .col-date { width:108px; white-space:nowrap; font-size:12px; }
.caa-table .col-period { width:88px; text-align:center; }
.caa-table .col-usage-pct { width:88px; text-align:center; }
.caa-table .col-remain { width:80px; text-align:center; }
.caa-table .col-type { width:88px; }
.caa-table .col-threshold { width:100px; }
.caa-table .col-name { width:120px; }
.caa-table .col-actions { width:88px; text-align:center; }

/* Responsive */
@media (max-width:1100px) {
  .car-top-row { grid-template-columns:1fr; }
  .car-table-row { grid-template-columns:1fr; }
  .car-stats-grid { grid-template-columns:repeat(2,1fr); }
}
</style>
