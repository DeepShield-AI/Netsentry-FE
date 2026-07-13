<template>
  <div class="nvt-page">
    <div class="tma-page tid-page">
      <div class="tdh-filters tma-filters">
        <div class="tdh-filter-row tdh-filter-row-actions">
          <label class="tdh-filter-field"><span class="ou-toolbar-label">MAC</span><input class="ou-toolbar-input tdh-filter-input" type="text" disabled /></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">传输协议</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
          <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" type="text" value="2026-06-15 14:38:32 - 2026-06-15 14:43:32" disabled /></label>
          <button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button>
          <button type="button" class="secondary td-reset-btn" disabled title="暂未开放">重置</button>
          <div class="td-toolbar-actions tma-toolbar"><button type="button" class="td-icon-btn" disabled title="列设置">☰</button></div>
        </div>
      </div>
      <div class="tma-result-area">
        <div class="tma-grid">
          <section class="tid-mini-panel">
            <div class="tid-mini-head"><h3 class="tid-mini-title">MAC设备</h3></div>
            <div class="ou-table-wrap tid-mini-table-wrap">
              <table class="ou-table til-table tid-mini-table">
                <thead><tr><th class="col-idx">序号</th><th class="col-mac">MAC</th><th class="col-vendor">厂商</th><th class="col-metric ou-th-sort">连接数</th><th class="col-traffic ou-th-sort">流量</th></tr></thead>
                <tbody>
                  <tr v-for="r in macRows" :key="r.idx"><td class="col-idx">{{ r.idx }}</td><td class="col-mac">{{ r.mac }}</td><td class="col-vendor"><span class="hsa-ellipsis">{{ r.vendor }}</span></td><td class="col-metric ou-num">{{ r.conns }}</td><td class="col-traffic ou-num">{{ r.traffic }}</td></tr>
                </tbody>
              </table>
            </div>
          </section>
          <section class="tid-mini-panel">
            <div class="tid-mini-head"><h3 class="tid-mini-title">连接趋势</h3></div>
            <div class="tid-chart-body"><div class="to-chart-plot"><div class="to-chart-placeholder">趋势图</div></div></div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import './nv-shared.css'

const macRows = [
  { idx: 1, mac: '54-2b-de-6d-10-ae', vendor: 'NewH3CTechnology', conns: '12864', traffic: '428.64 M' },
  { idx: 2, mac: '00-1b-21-a8-3c-4d', vendor: 'Huawei', conns: '8642', traffic: '286.42 M' },
  { idx: 3, mac: '00-25-90-0a-1b-2c', vendor: 'Dell', conns: '4286', traffic: '128.86 M' },
  { idx: 4, mac: '00-e0-4c-36-0a-1b', vendor: 'TP-Link', conns: '2864', traffic: '86.42 M' },
  { idx: 5, mac: '00-50-b6-2a-3b-4c', vendor: 'Cisco', conns: '1864', traffic: '42.18 M' },
]
</script>

<style scoped>
@import './nv-test-shared.css';
</style>
