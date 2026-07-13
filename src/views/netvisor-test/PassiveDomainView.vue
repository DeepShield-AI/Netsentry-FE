<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav" role="tablist" aria-label="被动域名">
        <button v-for="t in tabs" :key="t.key" type="button" class="nv-tab" :class="{ active: activeTab === t.key }" role="tab" :aria-selected="activeTab === t.key" @click="activeTab = t.key">{{ t.label }}</button>
      </div>
    </div>
    <div class="nv-tabs-body">

      <!-- 历史概况 -->
      <div class="pd-panel" :class="{ active: activeTab === 'history-overview' }" role="tabpanel">
        <div class="pd-ho-page">
          <div class="tdh-filters pd-ho-filters">
            <div class="tdh-filter-row">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">MAC</span><input class="ou-toolbar-input tdh-filter-input" type="text" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">源IP</span><select class="ou-toolbar-select pd-hs-select" disabled><option selected>任意IP</option></select><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="任意IP" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">源端口</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="80 / 8000-8080" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">目标IP</span><select class="ou-toolbar-select pd-hs-select" disabled><option selected>任意IP</option></select><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="任意IP" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">目标端口</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="80 / 8000-8080" disabled /></label>
            </div>
            <div class="tdh-filter-row">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">源IP ISP</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">目标IP ISP</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">源IP区域</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">目标IP区域</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">解析结果</span><input class="ou-toolbar-input tdh-filter-input" type="text" disabled /></label>
            </div>
            <div class="tdh-filter-row tdh-filter-row-actions">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">响应类型</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">域名</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select><input class="ou-toolbar-input tdh-filter-input" type="text" disabled /></label>
              <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" type="text" value="2026-06-13 22:41:44 - 2026-06-13 22:56:44" disabled /></label>
              <button type="button" class="ou-search-btn" disabled>搜索</button>
              <button type="button" class="secondary td-reset-btn" disabled>重置</button>
              <button type="button" class="link-btn tid-export-btn pd-ho-export" disabled>⬇ 导出</button>
            </div>
          </div>

          <div class="pd-ho-scroll">
            <div class="tid-bottom-grid pd-ho-bottom-grid">
              <section v-for="tbl in hoTables" :key="tbl.title" class="tid-mini-panel">
                <div class="tid-mini-head">
                  <h3 class="tid-mini-title">{{ tbl.title }}</h3>
                  <button type="button" class="tid-expand-btn" disabled title="全屏">⛶</button>
                </div>
                <div class="ou-table-wrap tid-mini-table-wrap">
                  <table class="ou-table tid-mini-table pd-ho-table">
                    <thead><tr><th class="col-idx">序号</th><th class="col-name">{{ tbl.title }}</th><th class="col-metric">请求数</th></tr></thead>
                    <tbody>
                      <tr v-for="(r, i) in tbl.rows" :key="i"><td class="col-idx">{{ i + 1 }}</td><td class="col-name"><span class="tid-link" :class="{ 'pd-ho-ellipsis': tbl.title === '请求域名' }">{{ r[0] }}</span></td><td class="col-metric ou-num">{{ r[1] }}</td></tr>
                    </tbody>
                  </table>
                </div>
                <div class="ou-footer pd-ho-footer">
                  <div class="ou-pager">
                    <button type="button" class="ou-page-btn" disabled>‹</button>
                    <button type="button" class="ou-page-btn active" disabled>1</button>
                    <button type="button" class="ou-page-btn" disabled>2</button>
                    <button type="button" class="ou-page-btn" disabled>3</button>
                    <button type="button" class="ou-page-btn" disabled>4</button>
                    <button type="button" class="ou-page-btn" disabled>›</button>
                  </div>
                  <span>共 330 条</span>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <!-- 历史会话 -->
      <div class="pd-panel" :class="{ active: activeTab === 'history-sessions' }" role="tabpanel">
        <div class="pd-hs-page">
          <div class="tdh-filters pd-hs-filters">
            <div class="tdh-filter-row">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">MAC</span><input class="ou-toolbar-input tdh-filter-input" type="text" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">源IP</span><select class="ou-toolbar-select pd-hs-select" disabled><option selected>任意IP</option></select><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="任意IP" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">源端口</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="80 / 8000-8080" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">目标IP</span><select class="ou-toolbar-select pd-hs-select" disabled><option selected>任意IP</option></select><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="任意IP" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">目标端口</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="80 / 8000-8080" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">源IP ISP</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
            </div>
            <div class="tdh-filter-row">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">目标IP ISP</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">源IP区域</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">目标IP区域</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">解析结果</span><input class="ou-toolbar-input tdh-filter-input" type="text" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">响应类型</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">域名</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select><input class="ou-toolbar-input tdh-filter-input" type="text" disabled /></label>
            </div>
            <div class="tdh-filter-row tdh-filter-row-actions">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">用户名称</span><input class="ou-toolbar-input tdh-filter-input" type="text" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">链路</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
              <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" type="text" value="2026-06-13 22:41:44 - 2026-06-13 22:56:44" disabled /></label>
              <button type="button" class="ou-search-btn" disabled>搜索</button>
              <button type="button" class="secondary td-reset-btn" disabled>重置</button>
            </div>
          </div>

          <div class="tdh-table-bar pd-hs-table-bar">
            <div class="td-toolbar-actions">
              <button type="button" class="td-icon-btn" disabled title="导出">⬇</button>
              <button type="button" class="td-icon-btn" disabled title="列设置">☰</button>
            </div>
          </div>

          <div class="ou-table-wrap pd-hs-table-wrap">
            <table class="ou-table pd-hs-table">
              <thead><tr><th class="col-idx">序号</th><th class="col-time">操作时间</th><th class="col-mac">MAC</th><th class="col-mac-vendor">MAC厂商</th><th class="col-user">用户名称</th><th class="col-endpoint">源IP</th><th class="col-endpoint">目标IP</th><th class="col-geo">目标地理位置</th><th class="col-domain">请求域名</th><th class="col-link">链路</th><th class="col-resolve">解析结果</th><th class="col-actions">操作</th></tr></thead>
              <tbody>
                <tr v-for="(r, i) in hsRows" :key="i">
                  <td class="col-idx">{{ i + 1 }}</td>
                  <td class="col-time">{{ r.t }}</td>
                  <td class="col-mac">54-2b-de-6d-10-ae</td>
                  <td class="col-mac-vendor"><span class="pd-hs-ellipsis">NewH3CTechnc...</span></td>
                  <td class="col-user">—</td>
                  <td class="col-endpoint"><span class="pd-hs-endpoint">{{ r.src }}</span></td>
                  <td class="col-endpoint"><span class="pd-hs-endpoint">{{ r.dst }}</span></td>
                  <td class="col-geo"><span class="pd-hs-geo">{{ r.geo }}</span></td>
                  <td class="col-domain"><span class="tid-link pd-hs-ellipsis">{{ r.domain }}</span></td>
                  <td class="col-link">—</td>
                  <td class="col-resolve"><span class="tid-link">{{ r.resolve }}</span></td>
                  <td class="col-actions"><button type="button" class="link-btn" disabled>数据包</button></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="ou-footer ou-footer-td pd-hs-footer">
            <div class="ou-footer-left"><div class="ou-pager"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn active" disabled>1</button><button type="button" class="ou-page-btn" disabled>2</button><button type="button" class="ou-page-btn" disabled>3</button><button type="button" class="ou-page-btn" disabled>4</button><button type="button" class="ou-page-btn" disabled>5</button><span class="ou-page-ellipsis">…</span><button type="button" class="ou-page-btn" disabled>207</button><button type="button" class="ou-page-btn" disabled>›</button></div></div>
            <div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页 <button type="button" class="ou-page-goto-btn" disabled>确定</button></label><span>共 20670 条</span><label class="ou-page-size"><select disabled><option selected>100 条/页</option></select></label></div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const activeTab = ref('history-overview')
const tabs = [
  { key: 'history-overview', label: '历史概况' },
  { key: 'history-sessions', label: '历史会话' },
]

const hoTables = [
  { title: '源IP', rows: [
    ['101.6.15.28', 1864], ['183.159.168.190', 1286], ['111.226.166.248', 942], ['172.28.8.9', 628],
    ['10.0.12.36', 486], ['36.170.9.48', 312], ['101.6.68.247', 268], ['5.231.242.20', 224],
    ['81.177.6.131', 198], ['166.111.5.212', 172], ['101.6.28.183', 146], ['47.96.147.121', 128],
  ] },
  { title: '目标IP', rows: [
    ['101.6.15.130', 1428], ['8.8.8.8', 986], ['1.1.1.1', 742], ['101.6.6.6', 512],
    ['47.96.147.121', 386], ['101.6.8.149', 248], ['101.6.15.67', 212], ['101.6.28.183', 186],
    ['106.11.248.134', 164], ['202.205.184.10', 142], ['111.203.29.114', 118], ['166.111.5.212', 96],
  ] },
  { title: '请求域名', rows: [
    ['microsoft.com', 864], ['baidu.com', 628], ['qq.com', 486], ['raw.githubusercontent.com', 312],
    ['cn.bing.com', 248], ['dns.google', 186], ['api.github.com', 164], ['st.todesk.com', 142],
    ['slapi.oray.net', 128], ['update.microsoft.com', 112], ['www.baidu.com', 98], ['clients2.google.com', 86],
  ] },
  { title: '解析结果', rows: [
    ['101.6.15.130', 742], ['20.205.243.166', 628], ['182.254.118.119', 486], ['8.8.8.8', 312],
    ['47.96.147.121', 248], ['1.1.1.1', 186], ['182.254.118.119', 164], ['185.199.108.153', 142],
    ['106.11.248.134', 128], ['202.205.184.10', 112], ['111.203.29.114', 98], ['101.6.15.67', 86],
  ] },
]

const hsRows = [
  { t: '2026-06-13 22:45:12', src: '101.6.15.28:52816', dst: '101.6.15.130:53', geo: '🇨🇳 北京|BGP', domain: 'microsoft.com', resolve: '20.205.243.166' },
  { t: '2026-06-13 22:45:08', src: '183.159.168.190:49218', dst: '8.8.8.8:53', geo: '🇺🇸 美国', domain: 'baidu.com', resolve: '182.254.118.119' },
  { t: '2026-06-13 22:44:56', src: '111.226.166.248:38412', dst: '101.6.6.6:53', geo: '🇨🇳 北京|BGP', domain: 'qq.com', resolve: '101.6.15.130' },
  { t: '2026-06-13 22:44:41', src: '172.28.8.9:60124', dst: '1.1.1.1:53', geo: '🇺🇸 美国', domain: 'raw.githubusercontent.com', resolve: '185.199.108.153' },
  { t: '2026-06-13 22:44:28', src: '10.0.12.36:44328', dst: '101.6.8.149:53', geo: '🇨🇳 北京|BGP', domain: 'cn.bing.com', resolve: '202.205.184.10' },
  { t: '2026-06-13 22:44:15', src: '36.170.9.48:51206', dst: '47.96.147.121:53', geo: '🇨🇳 浙江', domain: 'dns.google', resolve: '8.8.8.8' },
  { t: '2026-06-13 22:44:02', src: '101.6.68.247:39876', dst: '101.6.15.67:53', geo: '🇨🇳 北京|BGP', domain: 'api.github.com', resolve: '20.205.243.166' },
  { t: '2026-06-13 22:43:48', src: '5.231.242.20:55602', dst: '101.6.28.183:53', geo: '🇨🇳 北京|BGP', domain: 'st.todesk.com', resolve: '101.6.15.130' },
]
</script>

<style scoped>
/* Layout & tabs */
.nv-border-card { display:flex; flex-direction:column; height:100%; min-height:0; border:1px solid #e4e7ed; border-radius:4px; background:#fff; overflow:hidden; }
.nv-tabs-header { flex-shrink:0; padding:0 16px; border-bottom:1px solid #e4e7ed; background:#fafafa; }
.nv-tabs-nav { display:flex; gap:0; }
.nv-tab { position:relative; padding:12px 20px; border:none; background:transparent; font-size:14px; font-weight:600; color:#606266; cursor:pointer; white-space:nowrap; }
.nv-tab.active { color:#409eff; }
.nv-tab.active::after { content:''; position:absolute; bottom:0; left:20px; right:20px; height:2px; background:#409eff; }
.nv-tabs-body { flex:1; min-height:0; display:flex; flex-direction:column; overflow:hidden; }
.pd-panel { flex:1; min-height:0; display:none; flex-direction:column; }
.pd-panel.active { display:flex; }

/* Common ou-* / tdh-* */
.ou-table-wrap { flex:1; min-height:0; overflow:auto; }
.ou-table { width:100%; border-collapse:collapse; font-size:13px; }
.ou-table th { background:#fafbfc; border-bottom:1px solid #ebeef5; padding:8px 10px; text-align:left; font-weight:600; color:#606266; white-space:nowrap; font-size:12px; }
.ou-table td { border-bottom:1px solid #f0f2f5; padding:6px 10px; color:#303133; }
.ou-num { text-align:right; font-variant-numeric:tabular-nums; }
.col-idx { width:48px; text-align:center; }
.ou-footer { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:8px 14px; border-top:1px solid #ebeef5; font-size:12px; color:#606266; flex-shrink:0; }
.ou-footer-left { display:flex; align-items:center; gap:10px; }
.ou-footer-right { display:flex; align-items:center; flex-wrap:wrap; gap:8px 12px; }
.ou-pager { display:inline-flex; align-items:center; gap:4px; }
.ou-page-btn { min-width:28px; height:28px; padding:0 6px; border:1px solid #dcdfe6; border-radius:3px; background:#fff; color:#303133; font-size:12px; cursor:pointer; }
.ou-page-btn.active { background:#409eff; color:#fff; border-color:#409eff; }
.ou-page-btn:disabled { opacity:.5; cursor:not-allowed; }
.ou-page-ellipsis { color:#909399; padding:0 2px; }
.ou-page-goto { display:inline-flex; align-items:center; gap:4px; }
.ou-page-goto-input { width:36px; height:24px; text-align:center; border:1px solid #dcdfe6; border-radius:3px; font-size:12px; }
.ou-page-goto-btn { height:24px; padding:0 8px; border:1px solid #dcdfe6; border-radius:3px; background:#fff; font-size:12px; }
.ou-page-goto-btn:disabled { opacity:.5; cursor:not-allowed; }
.ou-page-size select { height:24px; border:1px solid #dcdfe6; border-radius:3px; font-size:12px; padding:0 4px; }
.link-btn { padding:0; border:none; background:none; color:#409eff; cursor:pointer; font-size:13px; }
.link-btn:disabled { opacity:.55; cursor:not-allowed; }

.tdh-filters { padding:10px 15px; background:#fff; border-bottom:1px solid #ebeef5; }
.tdh-filter-row { display:flex; flex-wrap:wrap; align-items:center; gap:8px 12px; margin-bottom:6px; }
.tdh-filter-row:last-child { margin-bottom:0; }
.tdh-filter-row-actions { margin-top:2px; }
.tdh-filter-field { display:inline-flex; align-items:center; gap:6px; }
.tdh-filter-input { width:140px; }
.tdh-filter-time { flex:1; min-width:260px; }
.tdh-time-range { width:100%; min-width:260px; }
.ou-toolbar-label { font-size:13px; color:#606266; white-space:nowrap; }
.ou-toolbar-input { height:30px; padding:0 8px; border:1px solid #dcdfe6; border-radius:4px; font-size:13px; }
.ou-toolbar-select { height:30px; padding:0 6px; border:1px solid #dcdfe6; border-radius:4px; font-size:13px; background:#fff; }
.ou-search-btn { height:30px; padding:0 14px; border:1px solid #409eff; border-radius:4px; background:#409eff; color:#fff; font-size:13px; font-weight:500; cursor:pointer; }
.ou-search-btn:disabled { opacity:.55; cursor:not-allowed; }
.secondary, .td-reset-btn { height:30px; padding:0 14px; border:1px solid #dcdfe6; border-radius:4px; background:#fff; color:#606266; font-size:13px; cursor:pointer; }
.secondary:disabled, .td-reset-btn:disabled { opacity:.55; cursor:not-allowed; }
.tid-export-btn { color:#409eff; font-size:13px; }
.td-icon-btn { width:28px; height:28px; padding:0; border:1px solid #dcdfe6; border-radius:3px; background:#fff; color:#606266; cursor:pointer; margin-left:6px; font-size:13px; }
.td-icon-btn:disabled { opacity:.55; cursor:not-allowed; }
.tdh-table-bar { display:flex; padding:6px 12px; border-bottom:1px solid #ebeef5; flex-shrink:0; }

/* tid- shared */
.tid-bottom-grid { display:grid; gap:12px; padding:12px; }
.tid-mini-panel { background:#fff; border:1px solid #e4e7ed; border-radius:4px; display:flex; flex-direction:column; min-width:0; min-height:0; }
.tid-mini-head { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; border-bottom:1px solid #ebeef5; }
.tid-mini-title { margin:0; font-size:14px; font-weight:600; color:#303133; }
.tid-expand-btn { border:none; background:transparent; color:#909399; cursor:default; font-size:14px; }
.tid-expand-btn:disabled { opacity:.6; }
.tid-link { color:#409eff; cursor:pointer; }
.tid-mini-table-wrap { flex:1; min-height:0; overflow:auto; }
.tid-mini-table th, .tid-mini-table td { padding:6px 8px; font-size:12px; }

/* pd-ho */
.pd-ho-page { flex:1; min-height:0; display:flex; flex-direction:column; overflow:hidden; background:#f5f7fa; }
.pd-ho-filters { flex-shrink:0; background:#fff; border-bottom:1px solid #ebeef5; }
.pd-ho-filters .tdh-time-range { min-width:320px; }
.pd-ho-filters .pd-ho-export { margin-left:auto; }
.pd-ho-scroll { flex:1; min-height:0; overflow:hidden; display:flex; flex-direction:column; }
.pd-ho-bottom-grid { grid-template-columns:repeat(4, minmax(0,1fr)); flex:1; min-height:0; align-content:stretch; }
.pd-ho-table .col-idx { width:48px; text-align:center; }
.pd-ho-table .col-name { min-width:0; font-size:12px; }
.pd-ho-table .col-metric { width:72px; text-align:right; font-size:12px; }
.pd-ho-ellipsis { display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.pd-ho-footer { display:flex; align-items:center; flex-wrap:wrap; gap:8px 12px; padding:8px 10px; border-top:1px solid #f0f2f5; font-size:12px; flex-shrink:0; justify-content:space-between; }

/* pd-hs */
.pd-hs-page { flex:1; min-height:0; display:flex; flex-direction:column; overflow:hidden; background:#fff; }
.pd-hs-filters .tdh-time-range { min-width:320px; }
.pd-hs-select { min-width:88px; }
.pd-hs-table-bar { justify-content:flex-end; }
.pd-hs-table-wrap { flex:1; min-height:0; }
.pd-hs-table { min-width:1960px; table-layout:fixed; }
.pd-hs-table .col-idx { width:52px; text-align:center; }
.pd-hs-table .col-time { width:148px; white-space:nowrap; font-size:12px; }
.pd-hs-table .col-mac { width:128px; font-family:ui-monospace, monospace; font-size:12px; }
.pd-hs-table .col-mac-vendor { width:112px; font-size:12px; }
.pd-hs-table .col-user { width:72px; }
.pd-hs-table .col-endpoint { width:148px; font-size:12px; }
.pd-hs-table .col-geo { width:120px; font-size:12px; }
.pd-hs-table .col-domain { width:140px; font-size:12px; }
.pd-hs-table .col-link { width:64px; font-size:12px; }
.pd-hs-table .col-resolve { width:120px; font-size:12px; }
.pd-hs-table .col-actions { width:72px; text-align:center; }
.pd-hs-endpoint, .pd-hs-ellipsis { display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.pd-hs-geo { display:inline-flex; align-items:center; gap:4px; font-size:12px; white-space:nowrap; }

@media (max-width:1400px) { .pd-ho-bottom-grid { grid-template-columns:repeat(2, minmax(0,1fr)); } }
@media (max-width:900px) { .pd-ho-bottom-grid { grid-template-columns:1fr; } }
</style>
