<template>
  <div class="nvt-page">
    <div class="nvt-tabs-header">
      <div class="nvt-tabs-nav">
        <button v-for="t in tabs" :key="t.key" class="nvt-tab" :class="{ active: activeTab === t.key }" @click="activeTab = t.key">{{ t.label }}</button>
      </div>
    </div>

    <!-- 搜索 tab -->
    <div v-show="activeTab === 'search'" class="tps-search-page">
      <div class="tdh-filters tps-search-filters">
        <div class="tdh-filter-row">
          <label class="tdh-filter-field"><span class="ou-toolbar-label">源IP</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="x.x.x.x" disabled /></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">源端口</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="单个端口" disabled /></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">目标IP</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="x.x.x.x" disabled /></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">目标端口</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="单个端口" disabled /></label>
          <label class="tdh-filter-field"><span class="ou-toolbar-label">偏移量</span><input class="ou-toolbar-input tdh-filter-input" type="text" disabled /></label>
        </div>
        <div class="tdh-filter-row tdh-filter-row-actions">
          <label class="tdh-filter-field tps-keyword-field"><span class="ou-toolbar-label">关键字</span><select class="ou-toolbar-select" disabled><option selected>1</option></select><input class="ou-toolbar-input tdh-filter-input" type="text" disabled /></label>
          <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" type="text" value="2026-06-15 14:28:48 - 2026-06-15 14:43:48" disabled /></label>
          <button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button>
          <button type="button" class="secondary td-reset-btn" disabled title="暂未开放">重置</button>
          <label class="tdh-filter-field tps-bg-query"><input type="checkbox" disabled /><span>后台查询</span></label>
          <button type="button" class="link-btn tps-task-list" disabled title="暂未开放">任务列表</button>
        </div>
      </div>
      <div class="ou-table-wrap tps-search-table-wrap">
        <table class="ou-table tps-search-table">
          <thead><tr><th class="col-idx">序号</th><th class="col-mac">MAC</th><th class="col-endpoint">源IP</th><th class="col-endpoint">目标IP</th><th class="col-time">开始时间</th><th class="col-time">结束时间</th><th class="col-proto">传输协议</th><th class="col-metric ou-th-sort">总包数</th><th class="col-traffic ou-th-sort">总流量</th><th class="col-actions">操作</th></tr></thead>
          <tbody>
            <tr v-for="r in searchRows" :key="r.idx">
              <td class="col-idx">{{ r.idx }}</td><td class="col-mac">{{ r.mac }}</td>
              <td class="col-endpoint"><span class="hsa-endpoint">{{ r.src }}</span></td>
              <td class="col-endpoint"><span class="hsa-endpoint">{{ r.dst }}</span></td>
              <td class="col-time">{{ r.startTime }}</td><td class="col-time">{{ r.endTime }}</td>
              <td class="col-proto">{{ r.proto }}</td><td class="col-metric ou-num">{{ r.pkts }}</td>
              <td class="col-traffic ou-num">{{ r.traffic }}</td>
              <td class="col-actions"><button type="button" class="link-btn" disabled>数据包</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="ou-footer ou-footer-td tps-search-footer">
        <div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn active" disabled>1</button><button type="button" class="ou-page-btn" disabled>2</button><button type="button" class="ou-page-btn" disabled>3</button><span class="ou-page-ellipsis">…</span><button type="button" class="ou-page-btn" disabled>5243</button><button type="button" class="ou-page-btn" disabled>›</button></div></div>
        <div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页 <button type="button" class="ou-page-goto-btn" disabled>确定</button></label><span>共 524288 条</span><label class="ou-page-size"><select disabled><option selected>100 条/页</option></select></label></div>
      </div>
    </div>

    <!-- pcap文件 tab -->
    <div v-show="activeTab === 'pcap'" class="tps-pcap-page">
      <div class="tdh-filters tps-pcap-filters">
        <div class="tdh-filter-row tdh-filter-row-actions">
          <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" type="text" value="2026-06-15 14:30:19 - 2026-06-15 14:45:19" disabled /></label>
          <button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button>
          <button type="button" class="secondary td-reset-btn" disabled title="暂未开放">重置</button>
          <div class="td-toolbar-actions tps-pcap-toolbar"><button type="button" class="td-icon-btn" disabled title="下载">⬇</button><button type="button" class="td-icon-btn" disabled title="列设置">☰</button></div>
        </div>
      </div>
      <div class="ou-table-wrap tps-pcap-table-wrap">
        <table class="ou-table tps-pcap-table">
          <thead><tr><th class="col-check"><input type="checkbox" disabled /></th><th class="col-name">文件名称</th><th class="col-time ou-th-sort">最大时间</th><th class="col-time ou-th-sort">最小时间</th><th class="col-actions">操作</th></tr></thead>
          <tbody>
            <tr v-for="r in pcapRows" :key="r.idx">
              <td class="col-check"><input type="checkbox" disabled /></td>
              <td class="col-name"><span class="tps-pcap-name">{{ r.name }}</span></td>
              <td class="col-time">{{ r.maxTime }}</td><td class="col-time">{{ r.minTime }}</td>
              <td class="col-actions"><button type="button" class="link-btn" disabled>下载</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="ou-footer ou-footer-td tps-pcap-footer">
        <div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn active" disabled>1</button><button type="button" class="ou-page-btn" disabled>2</button><button type="button" class="ou-page-btn" disabled>3</button><span class="ou-page-ellipsis">…</span><button type="button" class="ou-page-btn" disabled>22</button><button type="button" class="ou-page-btn" disabled>›</button></div></div>
        <div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页 <button type="button" class="ou-page-goto-btn" disabled>确定</button></label><span>共 432 条</span></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import './nv-shared.css'

const tabs = [
  { key: 'search', label: '搜索' },
  { key: 'pcap', label: 'pcap文件' },
]
const activeTab = ref('search')

const searchRows = [
  { idx: 1, mac: '54-2b-de-6d-10-ae', src: '27.209.87.219:326', dst: '101.6.6.6:49785', startTime: '2026-06-15 14:28:42', endTime: '2026-06-15 14:28:42', proto: 'ICMP', pkts: '1', traffic: '64' },
  { idx: 2, mac: '54-2b-de-6d-10-ae', src: '101.6.15.28:52816', dst: '101.6.6.6:53', startTime: '2026-06-15 14:28:40', endTime: '2026-06-15 14:28:41', proto: 'UDP', pkts: '4', traffic: '226' },
  { idx: 3, mac: '54-2b-de-6d-10-ae', src: '119.186.228.221:49218', dst: '101.6.15.130:443', startTime: '2026-06-15 14:28:38', endTime: '2026-06-15 14:28:40', proto: 'TCP', pkts: '16', traffic: '1.00 K' },
  { idx: 4, mac: '54-2b-de-6d-10-ae', src: '36.170.12.75:31775', dst: '101.6.15.130:443', startTime: '2026-06-15 14:28:36', endTime: '2026-06-15 14:28:38', proto: 'TCP', pkts: '67', traffic: '91.62 K' },
  { idx: 5, mac: '54-2b-de-6d-10-ae', src: '183.222.90.184:6144', dst: '101.6.6.6:2754', startTime: '2026-06-15 14:28:34', endTime: '2026-06-15 14:28:36', proto: 'ICMP', pkts: '2', traffic: '128' },
  { idx: 6, mac: '54-2b-de-6d-10-ae', src: '101.6.10.23:3389', dst: '101.6.15.130:3389', startTime: '2026-06-15 14:28:32', endTime: '2026-06-15 14:28:34', proto: 'TCP', pkts: '28', traffic: '2.18 K' },
  { idx: 7, mac: '54-2b-de-6d-10-ae', src: '111.226.166.248:44328', dst: '166.111.5.212:443', startTime: '2026-06-15 14:28:30', endTime: '2026-06-15 14:28:32', proto: 'TCP', pkts: '42', traffic: '4.28 K' },
  { idx: 8, mac: '54-2b-de-6d-10-ae', src: '1.24.19.125:17629', dst: '101.6.15.130:443', startTime: '2026-06-15 14:28:28', endTime: '2026-06-15 14:28:30', proto: 'TCP', pkts: '21', traffic: '986' },
]

const pcapRows = [
  { idx: 1, name: 'pa_1781505019_1781505026_134216321_12405023.pcap', maxTime: '2026-06-15 14:30:19', minTime: '2026-06-15 14:30:26' },
  { idx: 2, name: 'pa_1781504986_1781504998_134216128_11864286.pcap', maxTime: '2026-06-15 14:29:46', minTime: '2026-06-15 14:29:58' },
  { idx: 3, name: 'pa_1781504952_1781504964_134215936_9864286.pcap', maxTime: '2026-06-15 14:29:12', minTime: '2026-06-15 14:29:24' },
  { idx: 4, name: 'pa_1781504918_1781504930_134215744_8642864.pcap', maxTime: '2026-06-15 14:28:38', minTime: '2026-06-15 14:28:50' },
  { idx: 5, name: 'pa_1781504884_1781504896_134215552_7286428.pcap', maxTime: '2026-06-15 14:28:04', minTime: '2026-06-15 14:28:16' },
  { idx: 6, name: 'pa_1781504850_1781504862_134215360_6428642.pcap', maxTime: '2026-06-15 14:27:30', minTime: '2026-06-15 14:27:42' },
]
</script>

<style scoped>
@import './nv-test-shared.css';
</style>
