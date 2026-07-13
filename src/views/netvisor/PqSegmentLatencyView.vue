<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav nv-tabs-nav-wrap" role="tablist" aria-label="分段时延">
        <button v-for="t in tabs" :key="t.key" type="button" class="nv-tab" :class="{ active: activeTab === t.key }" role="tab" @click="activeTab = t.key">{{ t.label }}</button>
      </div>
    </div>
    <div class="nv-tabs-body">

      <!-- 分段设置 -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'settings' }">
        <div class="ou-toolbar" style="justify-content:space-between">
          <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
            <div class="ou-toolbar-item"><span class="ou-toolbar-label">自动刷新</span><select class="ou-toolbar-select" disabled><option>不刷新</option><option>30秒</option><option>60秒</option></select></div>
            <div class="ou-toolbar-item"><span class="ou-toolbar-label">状态</span><select class="ou-toolbar-select" disabled><option>全部</option><option>启用</option><option>禁用</option></select></div>
            <button class="ou-search-btn" disabled>搜索</button>
            <button class="secondary td-reset-btn" disabled>重置</button>
          </div>
          <div style="display:flex;gap:8px">
            <button class="link-btn" disabled>+ 新建分段</button>
            <button class="link-btn" disabled>生效</button>
            <button class="link-btn" disabled>批量删除</button>
          </div>
        </div>
        <div class="ou-table-wrap">
          <table class="ou-table pqs-table">
            <thead><tr><th class="col-idx">序号</th><th>内网地址</th><th>外网地址</th><th>协议</th><th>应用</th><th class="ou-num">匹配次数</th><th class="col-actions">操作</th></tr></thead>
            <tbody><tr><td colspan="7" class="ou-empty">无数据</td></tr></tbody>
          </table>
        </div>
        <div class="ou-footer"><div class="ou-footer-left"><div class="ou-pager"><button class="ou-page-btn" disabled>‹</button><button class="ou-page-btn active" disabled>1</button><button class="ou-page-btn" disabled>›</button></div></div><div class="ou-footer-right"><span>共 0 条</span></div></div>
      </div>

      <!-- 分段概况 -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'overview' }">
        <div class="tdh-filters">
          <div class="tdh-filter-row">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">源IP</span><select class="ou-toolbar-select" disabled><option>任意IP</option></select><input class="ou-toolbar-input tdh-filter-input" placeholder="任意IP" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">过滤源</span><select class="ou-toolbar-select" disabled><option>否</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">源端口</span><input class="ou-toolbar-input tdh-filter-input" placeholder="80 / 8000-8080" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">目标IP</span><select class="ou-toolbar-select" disabled><option>任意IP</option></select><input class="ou-toolbar-input tdh-filter-input" placeholder="任意IP" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">过滤目标</span><select class="ou-toolbar-select" disabled><option>否</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">目标端口</span><input class="ou-toolbar-input tdh-filter-input" placeholder="80 / 8000-8080" disabled /></label>
          </div>
          <div class="tdh-filter-row">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">MAC</span><input class="ou-toolbar-input tdh-filter-input" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">域名</span><input class="ou-toolbar-input tdh-filter-input" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">应用协议</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">连接类型</span><select class="ou-toolbar-select" disabled><option>所有</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">上行字节&gt;=</span><input class="ou-toolbar-input tdh-filter-input" style="width:100px" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">下行字节&gt;=</span><input class="ou-toolbar-input tdh-filter-input" style="width:100px" disabled /></label>
          </div>
          <div class="tdh-filter-row">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">传输协议</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">上行包数&gt;=</span><input class="ou-toolbar-input tdh-filter-input" style="width:100px" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">下行包数&gt;=</span><input class="ou-toolbar-input tdh-filter-input" style="width:100px" disabled /></label>
            <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" value="2026-06-15 10:33:11 - 2026-06-15 10:48:11" disabled /></label>
            <button class="ou-search-btn" disabled>搜索</button>
            <button class="secondary td-reset-btn" disabled>重置</button>
          </div>
        </div>

        <div class="pq-scroll">
          <div class="pqs-overview-grid">
            <section class="tid-chart-panel">
              <div class="tid-chart-head"><h3 class="tid-mini-title">整体时延</h3></div>
              <div class="tid-chart-body"><div class="to-chart-plot"><div class="to-chart-placeholder">趋势图占位</div></div></div>
            </section>
            <section class="tid-chart-panel">
              <div class="tid-chart-head"><h3 class="tid-mini-title">时延分布</h3></div>
              <div class="tid-chart-body"><div class="to-chart-plot"><div class="to-chart-placeholder">饼图占位</div></div></div>
            </section>
          </div>
          <div class="pqs-per-proto-grid">
            <section class="tid-chart-panel" v-for="p in perProto" :key="p">
              <div class="tid-chart-head"><h3 class="tid-mini-title">{{ p }}</h3></div>
              <div class="tid-chart-body"><div class="to-chart-plot"><div class="to-chart-placeholder">趋势图占位</div></div></div>
            </section>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import './nv-shared.css'
const tabs = [{ key: 'settings', label: '分段设置' }, { key: 'overview', label: '分段概况' }]
const activeTab = ref('settings')
const perProto = ['WWW', 'SSH', 'SMTP', '其它HTTPS', 'DNS', '微信']
</script>

<style scoped>
.pq-scroll { flex:1; min-height:0; overflow:auto; display:flex; flex-direction:column; gap:12px; padding:12px; }
.pqs-overview-grid { display:grid; grid-template-columns:2fr 1fr; gap:12px; }
.pqs-per-proto-grid { display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; }
.pqs-table th, .pqs-table td { font-size:12px; padding:6px 8px; }
@media (max-width:1200px){ .pqs-overview-grid,.pqs-per-proto-grid { grid-template-columns:1fr; } }
</style>
