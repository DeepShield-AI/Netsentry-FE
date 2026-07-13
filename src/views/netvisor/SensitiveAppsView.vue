<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav" role="tablist" aria-label="敏感应用">
        <button v-for="t in tabs" :key="t.key" type="button" class="nv-tab" :class="{ active: activeTab === t.key }" role="tab" :aria-selected="activeTab === t.key" @click="activeTab = t.key">{{ t.label }}</button>
      </div>
    </div>
    <div class="nv-tabs-body">

      <!-- 实时概况 -->
      <div class="sap-panel" :class="{ active: activeTab === 'realtime-overview' }" role="tabpanel">
        <div class="sap-ro-page tid-page">
          <div class="tdh-filters sap-ro-filters">
            <div class="tdh-filter-row tdh-filter-row-actions">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">隧道类型</span><select class="ou-toolbar-select" v-model="roTunnelType"><option value="">任意</option><option value="远程应用">远程应用</option><option value="VPN应用">VPN应用</option><option value="网络代理">网络代理</option><option value="敏感协议">敏感协议</option><option value="VPN协议">VPN协议</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">链路</span><select class="ou-toolbar-select" v-model="roLink"><option value="">任意</option><option value="链路1">链路1</option><option value="链路2">链路2</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">图表类型</span><select class="ou-toolbar-select" v-model="roChartType"><option value="下行流量">下行流量</option><option value="上行流量">上行流量</option><option value="连接数">连接数</option></select></label>
              <button type="button" class="ou-search-btn" @click="searchRoData">搜索</button>
              <button type="button" class="secondary td-reset-btn" @click="resetRoFilters">重置</button>
            </div>
          </div>

          <div class="tid-scroll sap-ro-scroll">
            <div class="tid-mid-grid sap-ro-mid-grid">
              <section class="tid-chart-panel">
                <div class="sap-ro-chart-head">
                  <div class="tid-legend">
                    <span class="tid-legend-item"><i class="tid-legend-dot" style="background:#5470c6"></i>远程应用</span>
                    <span class="tid-legend-item"><i class="tid-legend-dot" style="background:#fac858"></i>VPN应用</span>
                    <span class="tid-legend-item"><i class="tid-legend-dot" style="background:#91cc75"></i>网络代理</span>
                    <span class="tid-legend-item"><i class="tid-legend-dot" style="background:#ee6666"></i>敏感协议</span>
                    <span class="tid-legend-item"><i class="tid-legend-dot" style="background:#9a60b4"></i>VPN协议</span>
                  </div>
                  <div class="tio-range-btns" role="group">
                    <button type="button" class="tio-range-btn" :class="{ active: roRange === 'day' }" @click="roRange = 'day'">日</button>
                    <button type="button" class="tio-range-btn" :class="{ active: roRange === 'week' }" @click="roRange = 'week'">周</button>
                    <button type="button" class="tio-range-btn" :class="{ active: roRange === 'month' }" @click="roRange = 'month'">月</button>
                  </div>
                </div>
                <div class="tid-chart-body tid-chart-body-stack sap-ro-chart-body">
                  <span class="tid-yunit">Bytes</span>
                  <div class="to-chart-plot tid-chart-plot sap-ro-chart-plot">
                    <v-chart :option="roTrendChartOption" autoresize style="width:100%;height:300px;" />
                  </div>
                </div>
                <div class="dtt-chart-stats">
                  <span class="dtt-stat"><i class="dtt-stat-badge max">MAX</i>最大值 <strong>{{ roStats.max }}</strong></span>
                  <span class="dtt-stat"><i class="dtt-stat-badge min">MIN</i>最小值 <strong>{{ roStats.min }}</strong></span>
                  <span class="dtt-stat"><i class="dtt-stat-badge avg">AVG</i>平均值 <strong>{{ roStats.avg }}</strong></span>
                </div>
              </section>

              <section class="tid-chart-panel tid-chart-panel-pie">
                <div class="sap-ro-pie-head"><h3 class="sap-ro-pie-title">隧道类型分布</h3></div>
                <div class="tid-chart-body tid-chart-body-pie sap-ro-pie-body">
                  <div class="to-pie-wrap tid-pie-wrap sap-ro-pie-wrap">
                    <v-chart :option="roPieChartOption" autoresize style="width:100%;height:300px;" />
                  </div>
                </div>
              </section>
            </div>

            <div class="tid-bottom-grid sap-ro-bottom-grid">
              <section v-for="m in sapRoMinis" :key="m.title" class="tid-mini-panel">
                <div class="tid-mini-head">
                  <h3 class="tid-mini-title">{{ m.title }}</h3>
                  <button type="button" class="tid-expand-btn">⛶</button>
                </div>
                <div class="ou-table-wrap tid-mini-table-wrap sap-ro-table-wrap">
                  <table class="ou-table tid-mini-table sap-ro-table">
                    <thead><tr><th class="col-idx">序号</th><th :class="m.firstCol">{{ m.firstLabel }}</th><th class="col-metric">请求数↓</th><th class="col-metric">失败数↓</th><th class="col-tunnel">隧道事件</th></tr></thead>
                    <tbody>
                      <tr v-for="(r, i) in m.rows" :key="i">
                        <td class="col-idx">{{ i + 1 }}</td>
                        <td :class="m.firstCol"><span class="tid-link" :class="{ 'sap-ro-domain': m.firstCol === 'col-domain' }" @click="openSessionPopup(m.title, r[0])">{{ r[0] }}</span></td>
                        <td class="col-metric ou-num">{{ r[1] }}</td>
                        <td class="col-metric ou-num">{{ r[2] }}</td>
                        <td class="col-tunnel">{{ r[3] }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="ou-footer sap-ro-mini-footer">
                  <div class="ou-footer-left"><div class="ou-pager"><button type="button" class="ou-page-btn" :disabled="m.page <= 1" @click="m.page--">‹</button><button v-for="p in getPageList(m.page, Math.ceil(m.total / m.pageSize))" :key="p" type="button" class="ou-page-btn" :class="{ active: m.page === p }" @click="m.page = p">{{ p }}</button><button type="button" class="ou-page-btn" :disabled="m.page >= Math.ceil(m.total / m.pageSize)" @click="m.page++">›</button></div></div>
                  <div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" v-model.number="m.page" /> 页 <button type="button" class="ou-page-goto-btn" @click="m.page = Math.min(Math.max(1, m.page), Math.ceil(m.total / m.pageSize))">确定</button></label><span>共 {{ m.total }} 条</span><label class="ou-page-size"><select v-model.number="m.pageSize"><option :value="20">20条/页</option><option :value="50">50条/页</option><option :value="100">100条/页</option></select></label></div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <!-- 实时会话 -->
      <div class="sap-panel" :class="{ active: activeTab === 'realtime-sessions' }" role="tabpanel">
        <div class="sas-page">
          <div class="tdh-filters sas-filters">
            <div class="tdh-filter-row">
              <label class="tdh-filter-field"><select class="ou-toolbar-select" v-model="rsSrcType"><option value="任意IP">任意IP</option><option value="源IP">源IP</option><option value="目标IP">目标IP</option></select><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="任意IP" v-model="rsSrcValue" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">源端口</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="80 / 8000-8080" v-model="rsSrcPort" /></label>
              <label class="tdh-filter-field"><select class="ou-toolbar-select" v-model="rsDstType"><option value="任意IP">任意IP</option><option value="源IP">源IP</option><option value="目标IP">目标IP</option></select><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="任意IP" v-model="rsDstValue" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">目标端口</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="80 / 8000-8080" v-model="rsDstPort" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">传输协议</span><select class="ou-toolbar-select" v-model="rsProto"><option value="任意">任意</option><option value="TCP">TCP</option><option value="UDP">UDP</option></select></label>
            </div>
            <div class="tdh-filter-row tdh-filter-row-actions">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">应用协议</span><select class="ou-toolbar-select" v-model="rsAppProto"><option value="任意协议">任意协议</option><option value="SSH">SSH</option><option value="HTTPS">HTTPS</option><option value="HTTP">HTTP</option><option value="向日葵...">向日葵...</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">域名</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="" v-model="rsDomain" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">隧道类型</span><select class="ou-toolbar-select" v-model="rsTunnel"><option value="任意">任意</option><option value="敏感协议">敏感协议</option><option value="远程应用">远程应用</option><option value="VPN应用">VPN应用</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">用户名称</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="" v-model="rsUser" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">链路</span><select class="ou-toolbar-select" v-model="rsLink"><option value="任意">任意</option><option value="链路1">链路1</option></select></label>
              <button type="button" class="ou-search-btn" @click="searchRsData">搜索</button>
              <button type="button" class="secondary td-reset-btn" @click="resetRsFilters">重置</button>
            </div>
          </div>

          <div class="ou-table-wrap sas-table-wrap">
            <table class="ou-table sas-table">
              <thead><tr><th class="col-idx">序号</th><th class="col-time">时间</th><th class="col-user">用户名称</th><th class="col-endpoint">源IP</th><th class="col-endpoint">目标IP</th><th class="col-proto">传输协议</th><th class="col-app-proto">应用协议</th><th class="col-tunnel">隧道类型</th><th class="col-traffic">上行流量</th><th class="col-traffic">下行流量</th><th class="col-link">链路</th><th class="col-domain">域名</th></tr></thead>
              <tbody>
                <tr v-for="(r, i) in paginatedData(rsRows, rsPage, rsPageSize)" :key="i">
                  <td class="col-idx">{{ (rsPage - 1) * rsPageSize + i + 1 }}</td>
                  <td class="col-time">{{ r.t }}</td>
                  <td class="col-user">—</td>
                  <td class="col-endpoint"><span class="sas-endpoint">{{ r.src }}</span></td>
                  <td class="col-endpoint"><span class="sas-endpoint">{{ r.dst }}</span></td>
                  <td class="col-proto">{{ r.proto }}</td>
                  <td class="col-app-proto">{{ r.appProto }}</td>
                  <td class="col-tunnel">{{ r.tunnel }}</td>
                  <td class="col-traffic ou-num">{{ r.up }}</td>
                  <td class="col-traffic ou-num">{{ r.dn }}</td>
                  <td class="col-link">—</td>
                  <td class="col-domain">{{ r.domain || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="ou-footer ou-footer-td sas-footer">
            <div class="ou-footer-left"><div class="ou-pager"><button type="button" class="ou-page-btn" :disabled="rsPage <= 1" @click="rsPage--">‹</button><button v-for="p in getPageList(rsPage, totalPages(rsTotalCount, rsPageSize))" :key="p" type="button" class="ou-page-btn" :class="{ active: rsPage === p }" @click="rsPage = p">{{ p }}</button><button type="button" class="ou-page-btn" :disabled="rsPage >= totalPages(rsTotalCount, rsPageSize)" @click="rsPage++">›</button></div></div>
            <div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" v-model.number="rsPage" /> 页 <button type="button" class="ou-page-goto-btn" @click="rsPage = Math.min(Math.max(1, rsPage), totalPages(rsTotalCount, rsPageSize))">确定</button></label><span>共 {{ rsTotalCount }} 条</span><label class="ou-page-size"><select v-model.number="rsPageSize"><option :value="20">20条/页</option><option :value="50">50条/页</option><option :value="100">100条/页</option></select></label></div>
          </div>
        </div>
      </div>

      <!-- 敏感应用 -->
      <div class="sap-panel" :class="{ active: activeTab === 'sensitive-apps' }" role="tabpanel">
        <div class="saa-page tid-page">
          <div class="tdh-filters saa-filters">
            <div class="tdh-filter-row tdh-filter-row-actions">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">敏感应用</span><select class="ou-toolbar-select" v-model="saApp"><option value="SYN_ACK">SYN_ACK</option><option value="SSH">SSH</option><option value="L2TP">L2TP</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">链路</span><select class="ou-toolbar-select" v-model="saLink"><option value="任意">任意</option><option value="链路1">链路1</option></select></label>
              <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" type="text" v-model="saTimeRange" /></label>
              <button type="button" class="ou-search-btn" @click="searchSaData">搜索</button>
              <button type="button" class="secondary td-reset-btn" @click="resetSaFilters">重置</button>
              <button type="button" class="link-btn tid-export-btn">⬇ 导出</button>
            </div>
          </div>

          <div class="tid-scroll saa-scroll">
            <div class="saa-grid">
              <!-- 连接数趋势 -->
              <section class="tid-chart-panel saa-chart-panel">
                <div class="tid-mini-head"><h3 class="tid-mini-title">连接数趋势</h3></div>
                <div class="tid-chart-body tid-chart-body-stack saa-chart-body">
                  <span class="tid-yunit">Session#</span>
                  <div class="to-chart-plot saa-chart-plot">
                    <v-chart :option="saTrendOption" autoresize style="width:100%;height:200px;" />
                  </div>
                </div>
                <div class="dtt-chart-stats">
                  <span class="dtt-stat"><i class="dtt-stat-badge max">MAX</i>最大值 <strong>{{ saTrendStats.max }}</strong></span>
                  <span class="dtt-stat"><i class="dtt-stat-badge min">MIN</i>最小值 <strong>{{ saTrendStats.min }}</strong></span>
                  <span class="dtt-stat"><i class="dtt-stat-badge avg">AVG</i>平均值 <strong>{{ saTrendStats.avg }}</strong></span>
                </div>
              </section>

              <!-- 请求源 -->
              <section class="tid-mini-panel saa-table-panel">
                <div class="tid-mini-head"><h3 class="tid-mini-title">请求源</h3></div>
                <div class="ou-table-wrap tid-mini-table-wrap saa-table-wrap">
                  <table class="ou-table tid-mini-table saa-table">
                    <thead><tr><th class="col-idx">序号</th><th class="col-ip">IP地址</th><th class="col-metric">总请求数↓</th><th class="col-fail">失败次数↓</th><th class="col-latency">平均时延↓</th></tr></thead>
                    <tbody>
                      <tr v-for="(r, i) in saSrcRows" :key="i"><td class="col-idx">{{ i + 1 }}</td><td class="col-ip"><span class="tid-link" @click="openSaDetail('源IP', r.ip)">{{ r.ip }}</span></td><td class="col-metric ou-num">{{ r.total }}</td><td class="col-fail"><div class="saa-fail-cell"><span class="saa-fail-bar" :style="{ '--saa-fail-pct': r.pct + '%' }"><i></i></span><span class="saa-fail-num ou-num">{{ r.fail }}</span></div></td><td class="col-latency" :class="{ 'ou-num': r.lat !== '—' }">{{ r.lat }}</td></tr>
                    </tbody>
                  </table>
                </div>
                <div class="ou-footer saa-mini-footer saa-mini-footer--stacked">
                  <div class="ou-footer-left"><div class="ou-pager"><button type="button" class="ou-page-btn" :disabled="saSrcPage <= 1" @click="saSrcPage--">‹</button><button v-for="p in getPageList(saSrcPage, totalPages(saSrcTotal, saSrcPageSize))" :key="p" type="button" class="ou-page-btn" :class="{ active: saSrcPage === p }" @click="saSrcPage = p">{{ p }}</button><button type="button" class="ou-page-btn" :disabled="saSrcPage >= totalPages(saSrcTotal, saSrcPageSize)" @click="saSrcPage++">›</button></div></div>
                  <div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" v-model.number="saSrcPage" /> 页 <button type="button" class="ou-page-goto-btn" @click="saSrcPage = Math.min(Math.max(1, saSrcPage), totalPages(saSrcTotal, saSrcPageSize))">确定</button></label><span>共 {{ saSrcTotal }} 条</span><label class="ou-page-size"><select v-model.number="saSrcPageSize"><option :value="20">20条/页</option><option :value="50">50条/页</option><option :value="100">100条/页</option></select></label></div>
                </div>
              </section>

              <!-- 请求目标 -->
              <section class="tid-mini-panel saa-table-panel">
                <div class="tid-mini-head"><h3 class="tid-mini-title">请求目标</h3></div>
                <div class="ou-table-wrap tid-mini-table-wrap saa-table-wrap">
                  <table class="ou-table tid-mini-table saa-table">
                    <thead><tr><th class="col-idx">序号</th><th class="col-ip">IP地址</th><th class="col-metric">总请求数↓</th><th class="col-fail">失败次数↓</th><th class="col-latency">平均时延↓</th></tr></thead>
                    <tbody>
                      <tr v-for="(r, i) in saDstRows" :key="i"><td class="col-idx">{{ i + 1 }}</td><td class="col-ip"><span class="tid-link" @click="openSaDetail('目标IP', r.ip)">{{ r.ip }}</span></td><td class="col-metric ou-num">{{ r.total }}</td><td class="col-fail"><div class="saa-fail-cell"><span class="saa-fail-bar" :style="{ '--saa-fail-pct': r.pct + '%' }"><i></i></span><span class="saa-fail-num ou-num">{{ r.fail }}</span></div></td><td class="col-latency" :class="{ 'ou-num': r.lat !== '—' }">{{ r.lat }}</td></tr>
                    </tbody>
                  </table>
                </div>
                <div class="ou-footer saa-mini-footer saa-mini-footer--stacked">
                  <div class="ou-footer-left"><div class="ou-pager"><button type="button" class="ou-page-btn" :disabled="saDstPage <= 1" @click="saDstPage--">‹</button><button v-for="p in getPageList(saDstPage, totalPages(saDstTotal, saDstPageSize))" :key="p" type="button" class="ou-page-btn" :class="{ active: saDstPage === p }" @click="saDstPage = p">{{ p }}</button><button type="button" class="ou-page-btn" :disabled="saDstPage >= totalPages(saDstTotal, saDstPageSize)" @click="saDstPage++">›</button></div></div>
                  <div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" v-model.number="saDstPage" /> 页 <button type="button" class="ou-page-goto-btn" @click="saDstPage = Math.min(Math.max(1, saDstPage), totalPages(saDstTotal, saDstPageSize))">确定</button></label><span>共 {{ saDstTotal }} 条</span><label class="ou-page-size"><select v-model.number="saDstPageSize"><option :value="20">20条/页</option><option :value="50">50条/页</option><option :value="100">100条/页</option></select></label></div>
                </div>
              </section>

              <!-- 客户时延 -->
              <section class="tid-chart-panel saa-chart-panel">
                <div class="saa-dual-head">
                  <h3 class="tid-mini-title">客户时延</h3>
                  <div class="dtt-legend"><span class="dtt-legend-item"><i class="dtt-legend-dot" style="background:#5470c6"></i>时延</span><span class="dtt-legend-item"><i class="dtt-legend-dot" style="background:#fc8452"></i>抖动</span></div>
                </div>
                <div class="saa-dual-body">
                  <div class="saa-dual-yaxis"><span>ms</span><span>ms</span></div>
                  <div class="saa-dual-plot">
                    <v-chart :option="saClientDelayOption" autoresize style="width:100%;height:200px;" />
                  </div>
                </div>
                <div class="dtt-chart-stats saa-dual-stats">
                  <span class="saa-stat-group"><em class="saa-stat-tag">时延</em><span class="dtt-stat"><i class="dtt-stat-badge max">MAX</i>最大值 <strong>{{ saClientDelayStats.dMax }}</strong></span><span class="dtt-stat"><i class="dtt-stat-badge min">MIN</i>最小值 <strong>{{ saClientDelayStats.dMin }}</strong></span><span class="dtt-stat"><i class="dtt-stat-badge avg">AVG</i>平均值 <strong>{{ saClientDelayStats.dAvg }}</strong></span></span>
                  <span class="saa-stat-group"><em class="saa-stat-tag saa-stat-tag-jitter">抖动</em><span class="dtt-stat"><i class="dtt-stat-badge saa-badge-jitter max">MAX</i>最大值 <strong>{{ saClientDelayStats.jMax }}</strong></span><span class="dtt-stat"><i class="dtt-stat-badge saa-badge-jitter min">MIN</i>最小值 <strong>{{ saClientDelayStats.jMin }}</strong></span><span class="dtt-stat"><i class="dtt-stat-badge saa-badge-jitter avg">AVG</i>平均值 <strong>{{ saClientDelayStats.jAvg }}</strong></span></span>
                </div>
              </section>

              <!-- 服务时延 -->
              <section class="tid-chart-panel saa-chart-panel">
                <div class="saa-dual-head">
                  <h3 class="tid-mini-title">服务时延</h3>
                  <div class="dtt-legend"><span class="dtt-legend-item"><i class="dtt-legend-dot" style="background:#5470c6"></i>时延</span><span class="dtt-legend-item"><i class="dtt-legend-dot" style="background:#fc8452"></i>抖动</span></div>
                </div>
                <div class="saa-dual-body">
                  <div class="saa-dual-yaxis"><span>ms</span><span>ms</span></div>
                  <div class="saa-dual-plot">
                    <v-chart :option="saServerDelayOption" autoresize style="width:100%;height:200px;" />
                  </div>
                </div>
                <div class="dtt-chart-stats saa-dual-stats">
                  <span class="saa-stat-group"><em class="saa-stat-tag">时延</em><span class="dtt-stat"><i class="dtt-stat-badge max">MAX</i>最大值 <strong>{{ saServerDelayStats.dMax }}</strong></span><span class="dtt-stat"><i class="dtt-stat-badge min">MIN</i>最小值 <strong>{{ saServerDelayStats.dMin }}</strong></span><span class="dtt-stat"><i class="dtt-stat-badge avg">AVG</i>平均值 <strong>{{ saServerDelayStats.dAvg }}</strong></span></span>
                  <span class="saa-stat-group"><em class="saa-stat-tag saa-stat-tag-jitter">抖动</em><span class="dtt-stat"><i class="dtt-stat-badge saa-badge-jitter max">MAX</i>最大值 <strong>{{ saServerDelayStats.jMax }}</strong></span><span class="dtt-stat"><i class="dtt-stat-badge saa-badge-jitter min">MIN</i>最小值 <strong>{{ saServerDelayStats.jMin }}</strong></span><span class="dtt-stat"><i class="dtt-stat-badge saa-badge-jitter avg">AVG</i>平均值 <strong>{{ saServerDelayStats.jAvg }}</strong></span></span>
                </div>
              </section>

              <!-- 应用时延 -->
              <section class="tid-chart-panel saa-chart-panel">
                <div class="saa-dual-head">
                  <h3 class="tid-mini-title">应用时延</h3>
                  <div class="dtt-legend"><span class="dtt-legend-item"><i class="dtt-legend-dot" style="background:#5470c6"></i>时延</span><span class="dtt-legend-item"><i class="dtt-legend-dot" style="background:#fc8452"></i>抖动</span></div>
                </div>
                <div class="saa-dual-body">
                  <div class="saa-dual-yaxis"><span>ms</span><span>ms</span></div>
                  <div class="saa-dual-plot">
                    <v-chart :option="saAppDelayOption" autoresize style="width:100%;height:200px;" />
                  </div>
                </div>
                <div class="dtt-chart-stats saa-dual-stats">
                  <span class="saa-stat-group"><em class="saa-stat-tag">时延</em><span class="dtt-stat"><i class="dtt-stat-badge max">MAX</i>最大值 <strong>{{ saAppDelayStats.dMax }}</strong></span><span class="dtt-stat"><i class="dtt-stat-badge min">MIN</i>最小值 <strong>{{ saAppDelayStats.dMin }}</strong></span><span class="dtt-stat"><i class="dtt-stat-badge avg">AVG</i>平均值 <strong>{{ saAppDelayStats.dAvg }}</strong></span></span>
                  <span class="saa-stat-group"><em class="saa-stat-tag saa-stat-tag-jitter">抖动</em><span class="dtt-stat"><i class="dtt-stat-badge saa-badge-jitter max">MAX</i>最大值 <strong>{{ saAppDelayStats.jMax }}</strong></span><span class="dtt-stat"><i class="dtt-stat-badge saa-badge-jitter min">MIN</i>最小值 <strong>{{ saAppDelayStats.jMin }}</strong></span><span class="dtt-stat"><i class="dtt-stat-badge saa-badge-jitter avg">AVG</i>平均值 <strong>{{ saAppDelayStats.jAvg }}</strong></span></span>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <!-- 历史诊断 -->
      <div class="sap-panel" :class="{ active: activeTab === 'history-diagnosis' }" role="tabpanel">
        <div class="sahd-page tid-page">
          <div class="tdh-filters sahd-filters">
            <div class="tdh-filter-row">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">MAC</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="" v-model="sahdMac" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">单个IP</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="180.76.53.175" v-model="sahdSingleIp" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">源端口</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="80 / 8000-8080" v-model="sahdSrcPort" /></label>
              <label class="tdh-filter-field"><select class="ou-toolbar-select" v-model="sahdDstType"><option value="任意IP">任意IP</option><option value="源IP">源IP</option><option value="目标IP">目标IP</option></select><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="任意IP" v-model="sahdDstValue" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">目标端口</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="80 / 8000-8080" v-model="sahdDstPort" /></label>
            </div>
            <div class="tdh-filter-row">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">传输协议</span><select class="ou-toolbar-select" v-model="sahdProto"><option value="任意">任意</option><option value="TCP">TCP</option><option value="UDP">UDP</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">源IP ISP</span><select class="ou-toolbar-select" v-model="sahdSrcIsp"><option value="任意">任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">目标IP ISP</span><select class="ou-toolbar-select" v-model="sahdDstIsp"><option value="任意">任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">源IP区域</span><select class="ou-toolbar-select" v-model="sahdSrcRegion"><option value="任意">任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">目标IP区域</span><select class="ou-toolbar-select" v-model="sahdDstRegion"><option value="任意">任意</option></select></label>
            </div>
            <div class="tdh-filter-row tdh-filter-row-actions">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">隧道类型</span><select class="ou-toolbar-select" v-model="sahdTunnel"><option value="任意">任意</option><option value="敏感协议">敏感协议</option><option value="远程应用">远程应用</option><option value="VPN应用">VPN应用</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">请求域名</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="" v-model="sahdDomain" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">链路</span><select class="ou-toolbar-select" v-model="sahdLink"><option value="任意">任意</option><option value="链路1">链路1</option></select></label>
              <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" type="text" v-model="sahdTimeRange" /></label>
              <button type="button" class="ou-search-btn" @click="searchSahdData">搜索</button>
              <button type="button" class="secondary td-reset-btn" @click="resetSahdFilters">重置</button>
              <button type="button" class="link-btn tid-export-btn">⬇ 导出</button>
            </div>
          </div>

          <div class="tid-scroll sahd-scroll">
            <div class="tid-mid-grid sahd-mid-grid">
              <!-- 流量趋势图 -->
              <section class="tid-chart-panel">
                <div class="tid-chart-head">
                  <div class="tid-legend">
                    <span class="tid-legend-item"><i class="tid-legend-dot" style="background:#ee6666"></i>上行流量</span>
                    <span class="tid-legend-item"><i class="tid-legend-dot" style="background:#5470c6"></i>下行流量</span>
                    <span class="tid-legend-item"><i class="tid-legend-dot" style="background:#fac858"></i>连接数</span>
                  </div>
                </div>
                <div class="to-panel-chart sahd-combo-wrap">
                  <div class="to-combo-yaxis"><span>Bytes</span><span>Session#</span></div>
                  <div class="to-combo-plot sahd-combo-plot">
                    <v-chart :option="sahdTrafficOption" autoresize style="width:100%;height:200px;" />
                  </div>
                </div>
                <div class="dtt-chart-stats sahd-chart-stats">
                  <span class="sahd-stat-group"><em class="sahd-stat-tag">总流量</em><span class="dtt-stat"><i class="dtt-stat-badge max">MAX</i>最大值 <strong>111.60 K</strong></span><span class="dtt-stat"><i class="dtt-stat-badge min">MIN</i>最小值 <strong>4.64 K</strong></span><span class="dtt-stat"><i class="dtt-stat-badge avg">AVG</i>平均值 <strong>99.16 K</strong></span></span>
                  <span class="sahd-stat-group"><em class="sahd-stat-tag sahd-stat-tag-conn">连接数</em><span class="dtt-stat"><i class="dtt-stat-badge sahd-badge-conn max">MAX</i>最大值 <strong>26</strong></span><span class="dtt-stat"><i class="dtt-stat-badge sahd-badge-conn min">MIN</i>最小值 <strong>20</strong></span><span class="dtt-stat"><i class="dtt-stat-badge sahd-badge-conn avg">AVG</i>平均值 <strong>25</strong></span></span>
                </div>
              </section>
              <!-- 协议分布图 -->
              <section class="tid-chart-panel tid-chart-panel-pie">
                <div class="sahd-pie-head">
                  <div class="tid-legend">
                    <span class="tid-legend-item"><i class="tid-legend-dot" style="background:#ee6666"></i>上行流量</span>
                    <span class="tid-legend-item"><i class="tid-legend-dot" style="background:#5470c6"></i>下行流量</span>
                    <span class="tid-legend-item"><i class="tid-legend-dot" style="background:#fac858"></i>连接数</span>
                  </div>
                </div>
                <div class="tid-chart-body tid-chart-body-pie sahd-pie-body">
                  <div class="to-pie-wrap tid-pie-wrap sahd-pie-wrap">
                    <v-chart :option="sahdProtocolOption" autoresize style="width:100%;height:200px;" />
                  </div>
                </div>
              </section>
            </div>

            <div class="tid-bottom-grid sahd-bottom-grid">
              <!-- 源IP表格 -->
              <section class="tid-mini-panel">
                <div class="tid-mini-head"><h3 class="tid-mini-title">源IP</h3></div>
                <div class="ou-table-wrap tid-mini-table-wrap sahd-table-wrap">
                  <table class="ou-table tid-mini-table sahd-table">
                    <thead><tr><th class="col-idx">序号</th><th class="col-ip">源IP</th><th class="col-metric">请求数 ↓</th><th class="col-metric">上行 ↓</th><th class="col-metric">下行 ↓</th><th class="col-tunnel">隧道事件</th></tr></thead>
                    <tbody>
                      <tr v-for="(r, i) in sahdSrcRows.slice((sahdSrcPage - 1) * sahdSrcPageSize, sahdSrcPage * sahdSrcPageSize)" :key="i">
                        <td class="col-idx">{{ (sahdSrcPage - 1) * sahdSrcPageSize + i + 1 }}</td>
                        <td class="col-ip"><span class="tid-link" @click="openSessionPopup('源IP', r[0])">{{ r[0] }}</span></td>
                        <td class="col-metric ou-num">{{ r[1] }}</td>
                        <td class="col-metric ou-num">{{ r[2] }}</td>
                        <td class="col-metric ou-num">{{ r[3] }}</td>
                        <td class="col-tunnel">{{ r[4] }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="ou-footer sahd-mini-footer sahd-mini-footer--stacked">
                  <div class="ou-footer-left"><div class="ou-pager"><button type="button" class="ou-page-btn" :disabled="sahdSrcPage <= 1" @click="sahdSrcPage--">‹</button><button v-for="p in getPageList(sahdSrcPage, Math.ceil(sahdSrcTotal / sahdSrcPageSize))" :key="p" type="button" class="ou-page-btn" :class="{ active: sahdSrcPage === p }" @click="sahdSrcPage = p">{{ p }}</button><button type="button" class="ou-page-btn" :disabled="sahdSrcPage >= Math.ceil(sahdSrcTotal / sahdSrcPageSize)" @click="sahdSrcPage++">›</button></div></div>
                  <div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" v-model.number="sahdSrcPage" /> 页 <button type="button" class="ou-page-goto-btn" @click="sahdSrcPage = Math.min(Math.max(1, sahdSrcPage), Math.ceil(sahdSrcTotal / sahdSrcPageSize))">确定</button></label><span>共 {{ sahdSrcTotal }} 条</span><label class="ou-page-size"><select v-model.number="sahdSrcPageSize"><option :value="20">20条/页</option><option :value="50">50条/页</option><option :value="100">100条/页</option></select></label></div>
                </div>
              </section>
              <!-- 目标IP表格 -->
              <section class="tid-mini-panel">
                <div class="tid-mini-head"><h3 class="tid-mini-title">目标IP</h3></div>
                <div class="ou-table-wrap tid-mini-table-wrap sahd-table-wrap">
                  <table class="ou-table tid-mini-table sahd-table">
                    <thead><tr><th class="col-idx">序号</th><th class="col-ip">目标IP</th><th class="col-metric">请求数 ↓</th><th class="col-metric">上行 ↓</th><th class="col-metric">下行 ↓</th><th class="col-tunnel">隧道事件</th></tr></thead>
                    <tbody>
                      <tr v-for="(r, i) in sahdDstRows.slice((sahdDstPage - 1) * sahdDstPageSize, sahdDstPage * sahdDstPageSize)" :key="i">
                        <td class="col-idx">{{ (sahdDstPage - 1) * sahdDstPageSize + i + 1 }}</td>
                        <td class="col-ip"><span class="tid-link" @click="openSessionPopup('目标IP', r[0])">{{ r[0] }}</span></td>
                        <td class="col-metric ou-num">{{ r[1] }}</td>
                        <td class="col-metric ou-num">{{ r[2] }}</td>
                        <td class="col-metric ou-num">{{ r[3] }}</td>
                        <td class="col-tunnel">{{ r[4] }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="ou-footer sahd-mini-footer sahd-mini-footer--stacked">
                  <div class="ou-footer-left"><div class="ou-pager"><button type="button" class="ou-page-btn" :disabled="sahdDstPage <= 1" @click="sahdDstPage--">‹</button><button v-for="p in getPageList(sahdDstPage, Math.ceil(sahdDstTotal / sahdDstPageSize))" :key="p" type="button" class="ou-page-btn" :class="{ active: sahdDstPage === p }" @click="sahdDstPage = p">{{ p }}</button><button type="button" class="ou-page-btn" :disabled="sahdDstPage >= Math.ceil(sahdDstTotal / sahdDstPageSize)" @click="sahdDstPage++">›</button></div></div>
                  <div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" v-model.number="sahdDstPage" /> 页 <button type="button" class="ou-page-goto-btn" @click="sahdDstPage = Math.min(Math.max(1, sahdDstPage), Math.ceil(sahdDstTotal / sahdDstPageSize))">确定</button></label><span>共 {{ sahdDstTotal }} 条</span><label class="ou-page-size"><select v-model.number="sahdDstPageSize"><option :value="20">20条/页</option><option :value="50">50条/页</option><option :value="100">100条/页</option></select></label></div>
                </div>
              </section>
              <!-- 目标域名表格 -->
              <section class="tid-mini-panel">
                <div class="tid-mini-head"><h3 class="tid-mini-title">目标域名</h3></div>
                <div class="ou-table-wrap tid-mini-table-wrap sahd-table-wrap">
                  <table class="ou-table tid-mini-table sahd-table">
                    <thead><tr><th class="col-idx">序号</th><th class="col-domain">目标域名</th><th class="col-metric">请求数 ↓</th><th class="col-metric">上行 ↓</th><th class="col-metric">下行 ↓</th><th class="col-tunnel">隧道事件</th></tr></thead>
                    <tbody>
                      <tr v-for="(r, i) in sahdDomainRows.slice((sahdDomainPage - 1) * sahdDomainPageSize, sahdDomainPage * sahdDomainPageSize)" :key="i">
                        <td class="col-idx">{{ (sahdDomainPage - 1) * sahdDomainPageSize + i + 1 }}</td>
                        <td class="col-domain"><span class="tid-link" @click="openSessionPopup('目标域名', r[0])">{{ r[0] }}</span></td>
                        <td class="col-metric ou-num">{{ r[1] }}</td>
                        <td class="col-metric ou-num">{{ r[2] }}</td>
                        <td class="col-metric ou-num">{{ r[3] }}</td>
                        <td class="col-tunnel">{{ r[4] }}</td>
                      </tr>
                    </tbody>
                  </table>
                  <div v-if="sahdDomainRows.length === 0" class="sahd-no-data">无数据</div>
                </div>
                <div class="ou-footer sahd-mini-footer sahd-mini-footer--stacked">
                  <div class="ou-footer-left"><div class="ou-pager"><button type="button" class="ou-page-btn" :disabled="sahdDomainPage <= 1" @click="sahdDomainPage--">‹</button><button v-for="p in getPageList(sahdDomainPage, Math.ceil(sahdDomainTotal / sahdDomainPageSize))" :key="p" type="button" class="ou-page-btn" :class="{ active: sahdDomainPage === p }" @click="sahdDomainPage = p">{{ p }}</button><button type="button" class="ou-page-btn" :disabled="sahdDomainPage >= Math.ceil(sahdDomainTotal / sahdDomainPageSize)" @click="sahdDomainPage++">›</button></div></div>
                  <div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" v-model.number="sahdDomainPage" /> 页 <button type="button" class="ou-page-goto-btn" @click="sahdDomainPage = Math.min(Math.max(1, sahdDomainPage), Math.ceil(sahdDomainTotal / sahdDomainPageSize))">确定</button></label><span>共 {{ sahdDomainTotal }} 条</span><label class="ou-page-size"><select v-model.number="sahdDomainPageSize"><option :value="20">20条/页</option><option :value="50">50条/页</option><option :value="100">100条/页</option></select></label></div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <!-- 历史会话 -->
      <div class="sap-panel" :class="{ active: activeTab === 'history-sessions' }" role="tabpanel">
        <div class="sahs-page">
          <div class="tdh-filters sahs-filters">
            <div class="tdh-filter-row">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">MAC</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="" v-model="sahsMac" /></label>
              <label class="tdh-filter-field"><select class="ou-toolbar-select" v-model="sahsSrcType"><option value="源IP">源IP</option><option value="目标IP">目标IP</option></select><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="任意IP" v-model="sahsSrcValue" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">源端口</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="80 / 8000-8080" v-model="sahsSrcPort" /></label>
              <label class="tdh-filter-field"><select class="ou-toolbar-select" v-model="sahsDstType"><option value="目标IP">目标IP</option><option value="源IP">源IP</option></select><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="任意IP" v-model="sahsDstValue" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">目标端口</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="80 / 8000-8080" v-model="sahsDstPort" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">传输协议</span><select class="ou-toolbar-select" v-model="sahsProto"><option value="任意">任意</option><option value="TCP">TCP</option><option value="UDP">UDP</option></select></label>
            </div>
            <div class="tdh-filter-row">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">请求域名</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="" v-model="sahsDomain" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">隧道类型</span><select class="ou-toolbar-select" v-model="sahsTunnel"><option value="任意">任意</option><option value="敏感协议">敏感协议</option><option value="远程应用">远程应用</option><option value="VPN应用">VPN应用</option><option value="VPN协议">VPN协议</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">连接类型</span><select class="ou-toolbar-select" v-model="sahsConnType"><option value="所有">所有</option><option value="成功">成功</option><option value="失败">失败</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">条件关系</span><select class="ou-toolbar-select" v-model="sahsCondRelation"><option value="与">与</option><option value="或">或</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">应用协议</span><select class="ou-toolbar-select" v-model="sahsAppProto"><option value="任意协议">任意协议</option><option value="SSH">SSH</option><option value="HTTPS">HTTPS</option><option value="HTTP">HTTP</option><option value="L2TP">L2TP</option></select></label>
            </div>
            <div class="tdh-filter-row tdh-filter-row-actions">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">用户组</span><select class="ou-toolbar-select" v-model="sahsUserGroup"><option value="任意">任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">用户名称</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="" v-model="sahsUserName" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">链路</span><select class="ou-toolbar-select" v-model="sahsLink"><option value="任意">任意</option><option value="链路1">链路1</option></select></label>
              <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" type="text" v-model="sahsTimeRange" /></label>
              <button type="button" class="ou-search-btn" @click="searchSahsData">搜索</button>
              <button type="button" class="secondary td-reset-btn" @click="resetSahsFilters">重置</button>
            </div>
          </div>

          <div class="tdh-table-bar sahs-table-bar">
            <div class="td-toolbar-actions">
              <button type="button" class="td-icon-btn" title="导出">⬇</button>
              <button type="button" class="td-icon-btn" title="帮助">?</button>
              <button type="button" class="td-icon-btn" title="列设置">☰</button>
              <button type="button" class="td-icon-btn" title="视图切换">▦</button>
            </div>
          </div>

          <div class="ou-table-wrap sahs-table-wrap">
            <table class="ou-table sahs-table">
              <thead><tr><th class="col-check"><input type="checkbox" /></th><th class="col-time">请求时间</th><th class="col-mac">MAC</th><th class="col-mac-vendor">MAC厂商</th><th class="col-user">用户名称</th><th class="col-endpoint">源IP</th><th class="col-endpoint">目标IP</th><th class="col-app-proto">应用协议</th><th class="col-geo">目标地理位置</th><th class="col-traffic">上行流量</th><th class="col-traffic">下行流量</th><th class="col-proto">传输协议</th><th class="col-tunnel">隧道类型</th><th class="col-domain">请求域名</th><th class="col-actions">操作</th></tr></thead>
              <tbody>
                <tr v-for="(r, i) in sahsRows.slice((sahsPage - 1) * sahsPageSize, sahsPage * sahsPageSize)" :key="i">
                  <td class="col-check"><input type="checkbox" /></td>
                  <td class="col-time">{{ r.t }}</td>
                  <td class="col-mac">{{ r.mac }}</td>
                  <td class="col-mac-vendor"><span class="sahs-mac-vendor">{{ r.vendor }}</span></td>
                  <td class="col-user">—</td>
                  <td class="col-endpoint"><span class="sahs-endpoint">{{ r.src }}</span></td>
                  <td class="col-endpoint"><span class="sahs-endpoint">{{ r.dst }}</span></td>
                  <td class="col-app-proto">{{ r.app }}</td>
                  <td class="col-geo"><span class="sahs-geo">{{ r.geo }}</span></td>
                  <td class="col-traffic ou-num">{{ r.up }}</td>
                  <td class="col-traffic ou-num">{{ r.dn }}</td>
                  <td class="col-proto">TCP</td>
                  <td class="col-tunnel">{{ r.tun }}</td>
                  <td class="col-domain">—</td>
                  <td class="col-actions">
                    <div class="sahs-dropdown">
                      <button type="button" class="link-btn sahs-packet-btn" @click="togglePacketDropdown(i)">数据包</button>
                      <div v-if="sahsDropdownIndex === i" class="sahs-dropdown-menu">
                        <a class="sahs-dropdown-item" @click="openPacketAnalysisModal(r)">报文分析</a>
                        <a class="sahs-dropdown-item" @click="openPacketPlayModal(r)">报文播放</a>
                        <a class="sahs-dropdown-item" @click="downloadPacket(r)">报文下载</a>
                        <a class="sahs-dropdown-item" @click="downloadContent(r)">内容下载</a>
                        <a class="sahs-dropdown-item" @click="openPacketAnalysisModal(r)">尾包查询</a>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="ou-footer ou-footer-td sahs-footer">
            <div class="ou-footer-left"><div class="ou-pager"><button type="button" class="ou-page-btn" :disabled="sahsPage <= 1" @click="sahsPage--">‹</button><button v-for="p in getPageList(sahsPage, Math.ceil(sahsTotal / sahsPageSize))" :key="p" type="button" class="ou-page-btn" :class="{ active: sahsPage === p }" @click="sahsPage = p">{{ p }}</button><button type="button" class="ou-page-btn" :disabled="sahsPage >= Math.ceil(sahsTotal / sahsPageSize)" @click="sahsPage++">›</button></div></div>
            <div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" v-model.number="sahsPage" /> 页 <button type="button" class="ou-page-goto-btn" @click="sahsPage = Math.min(Math.max(1, sahsPage), Math.ceil(sahsTotal / sahsPageSize))">确定</button></label><span>共 {{ sahsTotal }} 条</span><label class="ou-page-size"><select v-model.number="sahsPageSize"><option :value="20">20条/页</option><option :value="50">50条/页</option><option :value="100">100条/页</option></select></label></div>
          </div>
        </div>
      </div>

    </div>

    <!-- 实时会话弹窗 -->
    <el-dialog v-model="sessionPopupVisible" :title="sessionPopupTitle" width="1400px" :close-on-click-modal="false" @close="sessionPopupVisible = false">
      <div class="sp-page">
        <div class="tdh-filters sp-filters">
          <div class="tdh-filter-row">
            <label class="tdh-filter-field"><select class="ou-toolbar-select" v-model="sessionPopupFilterType"><option value="任意IP">任意IP</option><option value="源IP">源IP</option><option value="目标IP">目标IP</option></select><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="任意IP" v-model="sessionPopupFilterValue" /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">源端口</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="80 / 8000-8080" v-model="sessionPopupFilterPort" /></label>
            <label class="tdh-filter-field"><select class="ou-toolbar-select" v-model="sessionPopupFilterTargetType"><option value="任意IP">任意IP</option><option value="源IP">源IP</option><option value="目标IP">目标IP</option></select><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="任意IP" v-model="sessionPopupFilterTargetValue" /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">目标端口</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="80 / 8000-8080" v-model="sessionPopupFilterTargetPort" /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">传输协议</span><select class="ou-toolbar-select" v-model="sessionPopupFilterProto"><option value="任意">任意</option><option value="TCP">TCP</option><option value="UDP">UDP</option></select></label>
          </div>
          <div class="tdh-filter-row tdh-filter-row-actions">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">应用协议</span><select class="ou-toolbar-select" v-model="sessionPopupFilterAppProto"><option value="任意协议">任意协议</option><option value="SSH">SSH</option><option value="HTTPS">HTTPS</option><option value="HTTP">HTTP</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">域名</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="" v-model="sessionPopupFilterDomain" /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">隧道类型</span><select class="ou-toolbar-select" v-model="sessionPopupFilterTunnel"><option value="任意">任意</option><option value="远程应用">远程应用</option><option value="VPN应用">VPN应用</option><option value="敏感协议">敏感协议</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">用户名称</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="" v-model="sessionPopupFilterUser" /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">链路</span><select class="ou-toolbar-select" v-model="sessionPopupFilterLink"><option value="任意">任意</option><option value="链路1">链路1</option></select></label>
            <button type="button" class="ou-search-btn">搜索</button>
            <button type="button" class="secondary td-reset-btn">重置</button>
          </div>
        </div>

        <div class="ou-table-wrap sp-table-wrap">
          <table class="ou-table sp-table">
            <thead><tr><th class="col-idx">序号</th><th class="col-time">时间</th><th class="col-user">用户名称</th><th class="col-endpoint">源IP</th><th class="col-endpoint">目标IP</th><th class="col-proto">传输协议</th><th class="col-app-proto">应用协议</th><th class="col-tunnel">隧道类型</th><th class="col-traffic">上行流量</th><th class="col-traffic">下行流量</th><th class="col-link">链路</th><th class="col-domain">域名</th></tr></thead>
            <tbody>
              <tr v-for="(r, i) in sessionPopupData.slice((sessionPopupPage - 1) * sessionPopupPageSize, sessionPopupPage * sessionPopupPageSize)" :key="i">
                <td class="col-idx">{{ (sessionPopupPage - 1) * sessionPopupPageSize + i + 1 }}</td>
                <td class="col-time">{{ r.time }}</td>
                <td class="col-user">{{ r.userName || '—' }}</td>
                <td class="col-endpoint"><span class="sp-endpoint">{{ r.srcIp }}</span></td>
                <td class="col-endpoint"><span class="sp-endpoint">{{ r.dstIp }}</span></td>
                <td class="col-proto">{{ r.proto }}</td>
                <td class="col-app-proto">{{ r.appProto }}</td>
                <td class="col-tunnel">{{ r.tunnelType }}</td>
                <td class="col-traffic ou-num">{{ r.upTraffic }}</td>
                <td class="col-traffic ou-num">{{ r.dnTraffic }}</td>
                <td class="col-link">{{ r.link || '—' }}</td>
                <td class="col-domain">{{ r.domain || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="ou-footer ou-footer-td sp-footer">
          <div class="ou-footer-left"><div class="ou-pager"><button type="button" class="ou-page-btn" :disabled="sessionPopupPage <= 1" @click="sessionPopupPage--">‹</button><button v-for="p in getPageList(sessionPopupPage, Math.ceil(sessionPopupTotal / sessionPopupPageSize))" :key="p" type="button" class="ou-page-btn" :class="{ active: sessionPopupPage === p }" @click="sessionPopupPage = p">{{ p }}</button><button type="button" class="ou-page-btn" :disabled="sessionPopupPage >= Math.ceil(sessionPopupTotal / sessionPopupPageSize)" @click="sessionPopupPage++">›</button></div></div>
          <div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" v-model.number="sessionPopupPage" /> 页 <button type="button" class="ou-page-goto-btn" @click="sessionPopupPage = Math.min(Math.max(1, sessionPopupPage), Math.ceil(sessionPopupTotal / sessionPopupPageSize))">确定</button></label><span>共 {{ sessionPopupTotal }} 条</span><label class="ou-page-size"><select v-model.number="sessionPopupPageSize"><option :value="20">20条/页</option><option :value="50">50条/页</option><option :value="100">100条/页</option></select></label></div>
        </div>
      </div>
    </el-dialog>

    <!-- 敏感应用详情弹窗 -->
    <el-dialog v-model="saDetailVisible" :title="saDetailTitle" width="1400px" :close-on-click-modal="false" @close="saDetailVisible = false">
      <div class="sad-page">
        <div class="tdh-filters sad-filters">
          <div class="tdh-filter-row">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">单个IP</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="93.123.109.125" v-model="sadIp" /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">过滤源</span><select class="ou-toolbar-select" v-model="sadFilterSrc"><option value="否">否</option><option value="是">是</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">源端口</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="80 / 8000-8080" v-model="sadSrcPort" /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">目标IP</span><select class="ou-toolbar-select" v-model="sadDstType"><option value="任意IP">任意IP</option><option value="源IP">源IP</option><option value="目标IP">目标IP</option></select><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="任意IP" v-model="sadDstValue" /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">过滤目标</span><select class="ou-toolbar-select" v-model="sadFilterDst"><option value="否">否</option><option value="是">是</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">目标端口</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="80 / 8000-8080" v-model="sadDstPort" /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">IPv4</span><select class="ou-toolbar-select" v-model="sadIpVersion"><option value="IPv4">IPv4</option><option value="IPv6">IPv6</option></select></label>
          </div>
          <div class="tdh-filter-row tdh-filter-row-actions">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">传输协议</span><select class="ou-toolbar-select" v-model="sadProto"><option value="任意">任意</option><option value="TCP">TCP</option><option value="UDP">UDP</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">MAC</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="" v-model="sadMac" /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">域名</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="" v-model="sadDomain" /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">应用协议</span><select class="ou-toolbar-select" v-model="sadAppProto"><option value="SYN_ACK">SYN_ACK</option><option value="SSH">SSH</option><option value="HTTPS">HTTPS</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">客户时延>=</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="ms" v-model="sadClientLatency" /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">服务时延>=</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="ms" v-model="sadServerLatency" /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">应用时延>=</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="ms" v-model="sadAppLatency" /></label>
          </div>
          <div class="tdh-filter-row tdh-filter-row-actions">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">连接类型</span><select class="ou-toolbar-select" v-model="sadConnType"><option value="所有">所有</option><option value="成功">成功</option><option value="失败">失败</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">条件关系</span><select class="ou-toolbar-select" v-model="sadCondRelation"><option value="与">与</option><option value="或">或</option></select></label>
            <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" type="text" v-model="sadTimeRange" /></label>
            <button type="button" class="ou-search-btn">搜索</button>
            <button type="button" class="secondary td-reset-btn">重置</button>
            <button type="button" class="link-btn">更多条件 ∧</button>
          </div>
        </div>

        <div class="ou-table-wrap sad-table-wrap">
          <table class="ou-table sad-table">
            <thead><tr><th class="col-check"><input type="checkbox" /></th><th class="col-time">请求时间↓</th><th class="col-mac">MAC</th><th class="col-mac-vendor">MAC厂商</th><th class="col-user">用户名称</th><th class="col-endpoint">源IP</th><th class="col-endpoint">目标IP</th><th class="col-geo">目标地理位置</th><th class="col-proto">传输协议</th><th class="col-domain">请求域名</th><th class="col-site">敏感网站</th><th class="col-app-proto">应用协议</th><th class="col-seq">SEQ</th><th class="col-actions">操作</th></tr></thead>
            <tbody>
              <tr v-for="(r, i) in sadRows.slice((sadPage - 1) * sadPageSize, sadPage * sadPageSize)" :key="i">
                <td class="col-check"><input type="checkbox" /></td>
                <td class="col-time">{{ r.time }}</td>
                <td class="col-mac">{{ r.mac }}</td>
                <td class="col-mac-vendor">{{ r.vendor }}</td>
                <td class="col-user">—</td>
                <td class="col-endpoint"><span class="sad-endpoint">{{ r.srcIp }}</span></td>
                <td class="col-endpoint"><span class="sad-endpoint">{{ r.dstIp }}</span></td>
                <td class="col-geo"><span class="sad-geo-tag">{{ r.geo }}</span></td>
                <td class="col-proto">{{ r.proto }}</td>
                <td class="col-domain">{{ r.domain || '—' }}</td>
                <td class="col-site">—</td>
                <td class="col-app-proto">{{ r.appProto }}</td>
                <td class="col-seq">{{ r.seq }}</td>
                <td class="col-actions"><a class="sad-action-link" @click="openPacketAnalysis(r)">数据包</a></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="ou-footer ou-footer-td sad-footer">
          <div class="ou-footer-left"><div class="ou-pager"><button type="button" class="ou-page-btn" :disabled="sadPage <= 1" @click="sadPage--">‹</button><button v-for="p in getPageList(sadPage, Math.ceil(sadTotal / sadPageSize))" :key="p" type="button" class="ou-page-btn" :class="{ active: sadPage === p }" @click="sadPage = p">{{ p }}</button><button type="button" class="ou-page-btn" :disabled="sadPage >= Math.ceil(sadTotal / sadPageSize)" @click="sadPage++">›</button></div></div>
          <div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" v-model.number="sadPage" /> 页 <button type="button" class="ou-page-goto-btn" @click="sadPage = Math.min(Math.max(1, sadPage), Math.ceil(sadTotal / sadPageSize))">确定</button></label><span>共 {{ sadTotal }} 条</span><label class="ou-page-size"><select v-model.number="sadPageSize"><option :value="20">20条/页</option><option :value="50">50条/页</option><option :value="100">100条/页</option></select></label></div>
        </div>
      </div>
    </el-dialog>

    <!-- 报文分析弹窗 -->
    <el-dialog v-model="packetVisible" title="报文分析" width="1100px" :close-on-click-modal="false" @close="packetVisible = false">
      <div class="pa-page">
        <div class="pa-tabs">
          <button type="button" class="pa-tab" :class="{ active: packetTab === 'parse' }" @click="packetTab = 'parse'">报文解析</button>
          <button type="button" class="pa-tab" :class="{ active: packetTab === 'interact' }" @click="packetTab = 'interact'">报文交互</button>
          <button type="button" class="pa-tab" :class="{ active: packetTab === 'meta' }" @click="packetTab = 'meta'">元数据</button>
        </div>
        <div class="pa-body">
          <!-- 报文解析标签页 -->
          <div v-if="packetTab === 'parse'" class="pa-parse">
            <div class="ou-table-wrap pa-table_wrap">
              <table class="ou-table pa-table">
                <thead><tr><th class="col-idx">序号</th><th class="col-time">时间</th><th class="col-src">源IP</th><th class="col-dst">目标IP</th><th class="col-proto">协议</th><th class="col-len">长度</th><th class="col-info">信息</th></tr></thead>
                <tbody>
                  <tr v-for="(p, idx) in packetParseData" :key="idx">
                    <td class="col-idx">{{ idx + 1 }}</td>
                    <td class="col-time">{{ p.time }}</td>
                    <td class="col-src">{{ p.src }}</td>
                    <td class="col-dst">{{ p.dst }}</td>
                    <td class="col-proto">{{ p.proto }}</td>
                    <td class="col-len">{{ p.len }}</td>
                    <td class="col-info">{{ p.info }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <!-- 报文交互标签页 -->
          <div v-if="packetTab === 'interact'" class="pa-interact">
            <div class="ou-table-wrap pa-table_wrap">
              <table class="ou-table pa-table">
                <thead><tr><th class="col-idx">序号</th><th class="col-time">时间</th><th class="col-src">源IP</th><th class="col-dst">目标IP</th><th class="col-proto">协议</th><th class="col-info">交互信息</th></tr></thead>
                <tbody>
                  <tr v-for="(p, idx) in packetInteractData" :key="idx">
                    <td class="col-idx">{{ idx + 1 }}</td>
                    <td class="col-time">{{ p.time }}</td>
                    <td class="col-src">{{ p.src }}</td>
                    <td class="col-dst">{{ p.dst }}</td>
                    <td class="col-proto">{{ p.proto }}</td>
                    <td class="col-info">{{ p.info }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <!-- 元数据标签页 -->
          <div v-if="packetTab === 'meta'" class="pa-meta">
            <table class="cd-detail-table">
              <tbody>
                <tr v-for="(row, ri) in packetMetaData" :key="ri">
                  <th class="cd-detail-key">{{ row.key }}</th>
                  <td class="cd-detail-val">{{ row.val }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 报文播放弹窗 -->
    <el-dialog v-model="packetPlayVisible" title="报文播放" width="900px" :close-on-click-modal="false" @close="packetPlayVisible = false">
      <div class="pp-page">
        <div class="pp-controls">
          <button type="button" class="pp-btn pp-play-btn">▶ 播放</button>
          <button type="button" class="pp-btn pp-pause-btn">⏸ 暂停</button>
          <button type="button" class="pp-btn pp-stop-btn">⏹ 停止</button>
          <label class="pp-speed">
            <span>速度：</span>
            <select class="ou-toolbar-select">
              <option value="1">1x</option>
              <option value="2">2x</option>
              <option value="4">4x</option>
              <option value="8">8x</option>
            </select>
          </label>
        </div>
        <div class="pp-status">
          <span class="pp-status-label">状态：</span>
          <span class="pp-status-value">就绪</span>
        </div>
        <div class="pp-progress">
          <div class="pp-progress-bar">
            <div class="pp-progress-fill" style="width: 0%"></div>
          </div>
          <span class="pp-progress-text">0 / 8 报文</span>
        </div>
        <div class="pp-current">
          <h4 class="pp-current-title">当前报文：</h4>
          <div class="pp-current-info">
            <p>时间：2026-07-10 13:11:51.123456</p>
            <p>源IP：93.123.109.125 → 目标IP：101.5.3.26</p>
            <p>协议：TCP | 长度：74 字节</p>
            <p>信息：53658 → 2079 [SYN] Seq=0 Win=64240 Len=0 MSS=1460</p>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import VChart from 'vue-echarts'

const activeTab = ref('realtime-overview')
const tabs = [
  { key: 'realtime-overview', label: '实时概况' },
  { key: 'realtime-sessions', label: '实时会话' },
  { key: 'sensitive-apps', label: '敏感应用' },
  { key: 'history-diagnosis', label: '历史诊断' },
  { key: 'history-sessions', label: '历史会话' },
]

// 实时概况 filters
const roTunnelType = ref('')
const roLink = ref('')
const roChartType = ref('下行流量')
const roRange = ref('day')

function searchRoData() { /* mock: no-op */ }
function resetRoFilters() {
  roTunnelType.value = ''
  roLink.value = ''
  roChartType.value = '下行流量'
  roRange.value = 'day'
}

// 实时概况 趋势图 mock 数据
const roTrendChartOption = computed(() => {
  const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`)
  const remoteApp = [120, 132, 101, 134, 90, 230, 210, 180, 200, 150, 170, 190, 220, 240, 260, 280, 300, 320, 290, 270, 250, 230, 200, 180]
  const vpnApp = [80, 90, 70, 100, 60, 150, 140, 120, 130, 100, 110, 120, 140, 160, 170, 180, 190, 200, 180, 170, 160, 150, 130, 110]
  const proxy = [40, 45, 35, 50, 30, 75, 70, 60, 65, 50, 55, 60, 70, 80, 85, 90, 95, 100, 90, 85, 80, 75, 65, 55]
  const sensitive = [200, 220, 180, 240, 160, 380, 350, 300, 320, 250, 280, 310, 360, 400, 430, 470, 500, 530, 480, 450, 420, 380, 330, 300]
  const vpnProto = [60, 68, 53, 75, 45, 115, 105, 90, 100, 75, 83, 90, 105, 120, 128, 135, 143, 150, 135, 128, 120, 113, 98, 83]
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    legend: { show: false },
    grid: { left: 60, right: 20, top: 10, bottom: 30 },
    xAxis: { type: 'category', data: hours, axisLabel: { fontSize: 10, color: '#909399', interval: 2 } },
    yAxis: {
      type: 'value',
      max: 2500,
      axisLabel: {
        fontSize: 10,
        color: '#909399',
        formatter: (v: number) => {
          if (v >= 1000) return (v / 1000).toFixed(1) + 'G'
          return v + 'M'
        }
      }
    },
    series: [
      { name: '远程应用', type: 'bar', stack: 'total', itemStyle: { color: '#5470c6' }, data: remoteApp },
      { name: 'VPN应用', type: 'bar', stack: 'total', itemStyle: { color: '#fac858' }, data: vpnApp },
      { name: '网络代理', type: 'bar', stack: 'total', itemStyle: { color: '#91cc75' }, data: proxy },
      { name: '敏感协议', type: 'bar', stack: 'total', itemStyle: { color: '#ee6666' }, data: sensitive },
      { name: 'VPN协议', type: 'bar', stack: 'total', itemStyle: { color: '#9a60b4' }, data: vpnProto },
    ],
  }
})

const roStats = { max: '3.82 G', min: '1.56 M', avg: '137.01 M' }

const roPieChartOption = computed(() => ({
  tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
  legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { fontSize: 11, color: '#606266' } },
  series: [{
    type: 'pie', radius: ['30%', '60%'], center: ['40%', '50%'],
    label: { show: false },
    data: [
      { value: 11970, name: '远程应用 (11.97%)', itemStyle: { color: '#5470c6' } },
      { value: 7890, name: 'VPN应用 (7.89%)', itemStyle: { color: '#fac858' } },
      { value: 3960, name: '网络代理 (3.96%)', itemStyle: { color: '#91cc75' } },
      { value: 77040, name: '敏感协议 (77.04%)', itemStyle: { color: '#ee6666' } },
      { value: 1140, name: 'VPN协议 (1.14%)', itemStyle: { color: '#9a60b4' } },
    ],
  }],
}))

// 实时概况 底部表格（带分页）
const sapRoMinis = [
  { title: '源IP', firstCol: 'col-ip', firstLabel: '源IP', page: 1, pageSize: 20, total: 699, rows: [
    ['121.27.20.157', 539, 0, '敏感协议'], ['27.0.135.6', 396, 0, '敏感协议'],
    ['106.13.38.13', 296, 0, '敏感协议'], ['121.55.202.69', 285, 0, '敏感协议'],
    ['182.82.151.34', 281, 0, '敏感协议'], ['182.82.221.133', 280, 0, '敏感协议'],
    ['58.223.165.154', 274, 0, '敏感协议'], ['219.231.192.34', 269, 0, '敏感协议'],
    ['1180.240.242', 265, 0, '敏感协议'], ['180.76.63.175', 265, 0, '敏感协议'],
    ['120.26.245.94', 262, 0, '敏感协议'], ['120.27.215.143', 241, 0, '敏感协议'],
    ['125.93.3.29', 234, 0, '敏感协议'], ['36.140.25.110', 228, 0, '敏感协议'],
    ['115.191.79.163', 220, 0, '敏感协议'], ['120.27.122.227', 170, 15, '敏感协议'],
    ['207.148.134.251', 147, 0, '敏感协议'], ['182.82.128.160', 144, 0, '敏感协议'],
    ['115.190.93.236', 139, 0, '敏感协议'], ['120.28.162.163', 121, 0, '敏感协议'],
  ] },
  { title: '目标IP', firstCol: 'col-ip', firstLabel: '目标IP', page: 1, pageSize: 20, total: 119, rows: [
    ['101.6.8.119', 496, 0, '敏感协议'], ['101.6.8.27', 442, 8, '敏感协议'],
    ['101.6.10.99', 349, 5, '敏感协议'], ['101.6.5.242', 307, 0, '敏感协议'],
    ['101.6.10.24', 287, 2, '敏感协议'], ['101.6.8.164', 286, 0, '敏感协议'],
    ['101.6.8.37', 280, 0, '敏感协议'], ['101.6.10.107', 276, 0, '敏感协议'],
    ['101.6.10.93', 273, 0, '敏感协议'], ['101.6.8.171', 272, 0, '敏感协议'],
    ['101.6.8.160', 264, 0, '敏感协议'], ['101.6.10.14', 251, 0, '敏感协议'],
    ['101.6.8.183', 241, 0, '敏感协议'], ['101.6.8.166', 222, 0, '敏感协议'],
    ['101.6.8.141', 215, 0, '敏感协议'], ['101.6.8.235', 214, 0, '敏感协议'],
    ['101.6.8.165', 180, 0, '敏感协议'], ['101.6.10.28', 167, 0, '敏感协议'],
    ['198.11.7.177', 156, 0, '敏感协议'], ['101.6.10.61', 156, 0, '敏感协议'],
  ] },
  { title: '请求域名', firstCol: 'col-domain', firstLabel: '请求域名', page: 1, pageSize: 20, total: 2, rows: [
    ['slapi.oray.net', 6, 0, '远程应用'], ['raw.githubusercontent.c...', 5, 0, 'VPN应用'],
  ] },
]

// 分页工具
function getPageList(current: number, total: number): number[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: number[] = []
  pages.push(1)
  if (current > 4) pages.push(2)
  if (current > 5) pages.push(3)
  if (current > 3 && current < total - 2) pages.push(current - 1)
  if (current > 2 && current < total - 1) pages.push(current)
  if (current < total - 2) pages.push(current + 1)
  if (current < total - 4) pages.push(total - 2)
  if (current < total - 3) pages.push(total - 1)
  pages.push(total)
  return [...new Set(pages)].sort((a, b) => a - b)
}

// 实时会话弹窗
const sessionPopupVisible = ref(false)
const sessionPopupTitle = ref('')
const sessionPopupType = ref('') // '源IP' | '目标IP' | '请求域名'
const sessionPopupValue = ref('')
const sessionPopupFilterType = ref('任意IP')
const sessionPopupFilterValue = ref('')
const sessionPopupFilterPort = ref('80 / 8000-8080')
const sessionPopupFilterTargetType = ref('任意IP')
const sessionPopupFilterTargetValue = ref('')
const sessionPopupFilterTargetPort = ref('80 / 8000-8080')
const sessionPopupFilterProto = ref('任意')
const sessionPopupFilterAppProto = ref('任意协议')
const sessionPopupFilterDomain = ref('')
const sessionPopupFilterTunnel = ref('任意')
const sessionPopupFilterUser = ref('')
const sessionPopupFilterLink = ref('任意')
const sessionPopupPage = ref(1)
const sessionPopupPageSize = ref(100)

interface SessionRow { time: string; userName: string; srcIp: string; dstIp: string; proto: string; appProto: string; tunnelType: string; upTraffic: string; dnTraffic: string; link: string; domain: string }

const sessionPopupData = ref<SessionRow[]>([])
const sessionPopupTotal = ref(0)

function openSessionPopup(type: string, value: string) {
  sessionPopupType.value = type
  sessionPopupValue.value = value
  sessionPopupTitle.value = `实时会话 - ${type}: ${value}`

  // 根据类型设置过滤条件
  if (type === '源IP') {
    sessionPopupFilterType.value = '源IP'
    sessionPopupFilterValue.value = value
    sessionPopupFilterTargetType.value = '任意IP'
    sessionPopupFilterTargetValue.value = ''
    sessionPopupFilterDomain.value = ''
  } else if (type === '目标IP') {
    sessionPopupFilterType.value = '任意IP'
    sessionPopupFilterValue.value = ''
    sessionPopupFilterTargetType.value = '目标IP'
    sessionPopupFilterTargetValue.value = value
    sessionPopupFilterDomain.value = ''
  } else if (type === '请求域名' || type === '目标域名') {
    sessionPopupFilterType.value = '任意IP'
    sessionPopupFilterValue.value = ''
    sessionPopupFilterTargetType.value = '任意IP'
    sessionPopupFilterTargetValue.value = ''
    sessionPopupFilterDomain.value = value
  }

  // 根据域名生成不同的mock数据
  if (value.includes('oray')) {
    sessionPopupData.value = [
      { time: '2026-07-10/10:34:29', userName: '', srcIp: '101.6.15.214:55554', dstIp: '47.98.235.31:443', proto: 'TCP', appProto: '向日葵...', tunnelType: '远程应用', upTraffic: '873', dnTraffic: '4.57 K', link: '', domain: 'slapi.oray.net' },
      { time: '2026-07-10/10:36:32', userName: '', srcIp: '101.6.15.214:55555', dstIp: '47.99.156.250:443', proto: 'TCP', appProto: '向日葵...', tunnelType: '远程应用', upTraffic: '873', dnTraffic: '4.76 K', link: '', domain: 'slapi.oray.net' },
      { time: '2026-07-10/10:38:34', userName: '', srcIp: '101.6.15.214:55556', dstIp: '47.99.156.250:443', proto: 'TCP', appProto: '向日葵...', tunnelType: '远程应用', upTraffic: '873', dnTraffic: '4.76 K', link: '', domain: 'slapi.oray.net' },
      { time: '2026-07-10/10:42:38', userName: '', srcIp: '101.6.15.214:55564', dstIp: '47.99.156.250:443', proto: 'TCP', appProto: '向日葵...', tunnelType: '远程应用', upTraffic: '873', dnTraffic: '4.76 K', link: '', domain: 'slapi.oray.net' },
      { time: '2026-07-10/10:44:41', userName: '', srcIp: '101.6.15.214:55565', dstIp: '47.99.156.250:443', proto: 'TCP', appProto: '向日葵...', tunnelType: '远程应用', upTraffic: '873', dnTraffic: '4.76 K', link: '', domain: 'slapi.oray.net' },
    ]
    sessionPopupTotal.value = 5
  } else if (value.includes('27.0.135.6') || type === '源IP') {
    sessionPopupData.value = Array.from({ length: 16 }, (_, i) => ({
      time: `2026-07-10/10:41:${String(24 + Math.floor(i / 3)).padStart(2, '0')}`,
      userName: '',
      srcIp: `27.0.135.6:${59674 + i}`,
      dstIp: '101.6.8.27:22',
      proto: 'TCP',
      appProto: 'SSH',
      tunnelType: '敏感协议',
      upTraffic: i === 0 ? '1.32 K' : '1.45 K',
      dnTraffic: '1.73 K',
      link: '',
      domain: '',
    }))
    sessionPopupTotal.value = 396
  } else {
    sessionPopupData.value = [
      { time: '2026-07-10/10:30:15', userName: '', srcIp: '101.6.15.200:48234', dstIp: '185.199.108.153:443', proto: 'TCP', appProto: 'HTTPS', tunnelType: 'VPN应用', upTraffic: '1.24 K', dnTraffic: '3.56 K', link: '', domain: value },
      { time: '2026-07-10/10:32:18', userName: '', srcIp: '101.6.15.200:48235', dstIp: '185.199.108.153:443', proto: 'TCP', appProto: 'HTTPS', tunnelType: 'VPN应用', upTraffic: '0.98 K', dnTraffic: '2.87 K', link: '', domain: value },
      { time: '2026-07-10/10:35:22', userName: '', srcIp: '101.6.15.201:48236', dstIp: '185.199.108.154:443', proto: 'TCP', appProto: 'HTTPS', tunnelType: 'VPN应用', upTraffic: '1.56 K', dnTraffic: '4.12 K', link: '', domain: value },
    ]
    sessionPopupTotal.value = 3
  }

  sessionPopupPage.value = 1
  sessionPopupVisible.value = true
}

// 分页工具函数
function paginatedData<T>(data: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize
  return data.slice(start, start + pageSize)
}
function totalPages(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / pageSize))
}

// 实时会话 tab
const rsSrcType = ref('任意IP')
const rsSrcValue = ref('')
const rsSrcPort = ref('80 / 8000-8080')
const rsDstType = ref('任意IP')
const rsDstValue = ref('')
const rsDstPort = ref('80 / 8000-8080')
const rsProto = ref('任意')
const rsAppProto = ref('任意协议')
const rsDomain = ref('')
const rsTunnel = ref('任意')
const rsUser = ref('')
const rsLink = ref('任意')
const rsPage = ref(1)
const rsPageSize = ref(100)
const rsTotalCount = 8192

function searchRsData() { /* mock: no-op */ }
function resetRsFilters() {
  rsSrcType.value = '任意IP'; rsSrcValue.value = ''
  rsSrcPort.value = '80 / 8000-8080'
  rsDstType.value = '任意IP'; rsDstValue.value = ''
  rsDstPort.value = '80 / 8000-8080'
  rsProto.value = '任意'
  rsAppProto.value = '任意协议'
  rsDomain.value = ''
  rsTunnel.value = '任意'
  rsUser.value = ''
  rsLink.value = '任意'
  rsPage.value = 1
}

interface RsRow { t: string; src: string; dst: string; proto: string; appProto: string; tunnel: string; up: string; dn: string; domain?: string }

function generateRsRows(): RsRow[] {
  const rows: RsRow[] = []
  const srcIps = ['136.224.72.95','136.224.72.95','180.213.44.242','101.6.15.214','106.13.38.13','156.225.1.47','120.26.245.94','182.92.221.133','103.153.204.45','13.90.206.6','95.208.74.63','118.180.45.134','136.245.245.50','86.223.165.154','166.111.55.141','219.231.192.34','120.26.48.188','156.225.1.47','156.225.1.47','120.27.215.143','48.7.200.174','182.82.151.34','160.76.63.175','182.3.221.33','103.69.138.111','120.27.25.137','222.134.147.68','108.13.38.126','120.27.25.137']
  const dstIps = ['101.6.8.64:22222','101.6.8.64:22222','101.6.16.99:22222','47.98.232.26:443','101.6.16.99:22222','101.6.15.67:22222','101.6.16.93:22222','101.6.15.67:22222','101.6.8.37:22222','101.6.5.236:22222','101.6.5.119:22222','101.6.15.73:22222','101.6.16.14:22222','101.6.5.242:22222','101.6.5.145:22','101.6.11.7:22222','186.111.7.239:22222','101.6.8.67:22222','101.6.15.67:22222','101.6.5.129:22222','101.6.5.226:22222','101.6.16.99:22222','101.6.5.164:22222','101.6.1.16:22222','101.6.1.141:22222','101.6.5.235:22222','101.6.5.149:22','101.6.119:22222','101.6.1.16:22222']
  const appProtos = ['SSH','SSH','SSH','向日葵...','SSH','SSH','SSH','SSH','SSH','SSH','SSH','SSH','SSH','SSH','SSH','SSH','SSH','SSH','SSH','SSH','TCP','TCP','TCP','TCP','TCP','TCP','TCP','TCP','TCP']
  const tunnels = ['敏感协议','敏感协议','敏感协议','远程应用','敏感协议','敏感协议','敏感协议','敏感协议','敏感协议','敏感协议','敏感协议','敏感协议','敏感协议','敏感协议','敏感协议','敏感协议','敏感协议','敏感协议','敏感协议','敏感协议','敏感协议','敏感协议','敏感协议','敏感协议','敏感协议','敏感协议','敏感协议','敏感协议','敏感协议']
  const upTraffics = ['2.47 K','2.47 K','1.59 K','873','1.03 K','84','1.67 K','0','1.79 K','1.67 K','1.67 K','1.59 K','1.56 K','1.56 K','1.58 K','3.75 K','1.71 K','1.79 K','866','0','1.79 K','1.79 K','1.79 K','676','1.67 K','1.74 K','1.79 K','2.07 K','1.63 K']
  const dnTraffics = ['2.80 K','2.88 K','2.07 K','4.70 K','2.00 K','86','2.20 K','86','2.20 K','2.09 K','2.01 K','2.07 K','2.07 K','1.80 K','2.14 K','3.20 K','2.20 K','2.20 K','86','86','1.77 K','2.37 K','2.36 K','2.36 K','2.07 K','1.10 K','2.23 K','2.62 K','2.06 K']
  const domains = ['','','','','','','','','','','','','','','','','','','','','','','','','','','','slapi.oray.net','']

  for (let i = 0; i < 30; i++) {
    const h = 10 + Math.floor(i / 6)
    const m = 1 + Math.floor(i % 6)
    const s = 27 + i
    rows.push({
      t: `2026-07-10/${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`,
      src: `${srcIps[i]}:${16570 + i}`,
      dst: dstIps[i],
      proto: 'TCP',
      appProto: appProtos[i],
      tunnel: tunnels[i],
      up: upTraffics[i],
      dn: dnTraffics[i],
      domain: domains[i] || undefined,
    })
  }
  return rows
}

const rsRows = generateRsRows()

// 敏感应用 tab
const saApp = ref('SYN_ACK')
const saLink = ref('任意')
const saTimeRange = ref('2026-07-10 13:05:30 - 2026-07-10 13:20:30')

function searchSaData() { /* mock: no-op */ }
function resetSaFilters() {
  saApp.value = 'SYN_ACK'
  saLink.value = '任意'
  saTimeRange.value = '2026-07-10 13:05:30 - 2026-07-10 13:20:30'
}

// 连接数趋势图
const saTrendOption = computed(() => {
  const times = ['13:06', '13:07', '13:08', '13:09', '13:10', '13:11', '13:12', '13:13', '13:14', '13:15', '13:16', '13:17', '13:18', '13:19', '13:20']
  const data = [28500, 29200, 29874, 28900, 27600, 26800, 25400, 24100, 22800, 21500, 19200, 16800, 14200, 11500, 8600]
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: 50, right: 20, top: 10, bottom: 30 },
    xAxis: { type: 'category', data: times, axisLabel: { fontSize: 10, color: '#909399' } },
    yAxis: { type: 'value', axisLabel: { fontSize: 10, color: '#909399', formatter: (v: number) => v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v } },
    series: [{ type: 'line', data, smooth: true, itemStyle: { color: '#5470c6' }, areaStyle: { color: 'rgba(84,112,198,0.15)' } }],
  }
})
const saTrendStats = { max: '29874', min: '315', avg: '25935' }

// 请求源/目标表格数据
const saSrcPage = ref(1); const saSrcPageSize = ref(20); const saSrcTotal = 21643
const saDstPage = ref(1); const saDstPageSize = ref(20); const saDstTotal = 4168

const saSrcRows = [
  { ip: '113.120.243.171', total: 66674, fail: 59074, pct: 88, lat: '—' },
  { ip: '101.6.14.166', total: 23368, fail: 23368, pct: 100, lat: '—' },
  { ip: '211.149.67.126', total: 16020, fail: 16020, pct: 100, lat: '—' },
  { ip: '93.123.109.125', total: 14572, fail: 14570, pct: 100, lat: '0.91' },
  { ip: '101.6.8.90', total: 12064, fail: 12064, pct: 100, lat: '—' },
  { ip: '160.119.76.30', total: 11927, fail: 11927, pct: 100, lat: '—' },
]

const saDstRows = [
  { ip: '101.6.15.130', total: 122538, fail: 116608, pct: 95, lat: '67.54' },
  { ip: '101.6.8.6', total: 8136, fail: 352, pct: 4, lat: '41.56' },
  { ip: '186.111.96.91', total: 6397, fail: 6397, pct: 100, lat: '—' },
  { ip: '100.110.52.151', total: 5039, fail: 5039, pct: 100, lat: '—' },
  { ip: '100.110.52.241', total: 5035, fail: 5035, pct: 100, lat: '—' },
  { ip: '186.111.5.103', total: 3832, fail: 3832, pct: 100, lat: '—' },
]

// 三张时延双轴图
function makeDelayOption(delayData: number[], jitterData: number[]): object {
  const times = ['13:06', '13:07', '13:08', '13:09', '13:10', '13:11', '13:12', '13:13', '13:14', '13:15', '13:16', '13:17', '13:18', '13:19', '13:20']
  return {
    tooltip: { trigger: 'axis' },
    legend: { show: false },
    grid: { left: 40, right: 40, top: 10, bottom: 30 },
    xAxis: { type: 'category', data: times, axisLabel: { fontSize: 10, color: '#909399' } },
    yAxis: [
      { type: 'value', name: 'ms', nameTextStyle: { fontSize: 10 }, axisLabel: { fontSize: 10, color: '#909399' } },
      { type: 'value', name: 'ms', nameTextStyle: { fontSize: 10 }, axisLabel: { fontSize: 10, color: '#909399' } },
    ],
    series: [
      { name: '时延', type: 'line', yAxisIndex: 0, data: delayData, smooth: true, itemStyle: { color: '#5470c6' } },
      { name: '抖动', type: 'line', yAxisIndex: 1, data: jitterData, smooth: true, itemStyle: { color: '#fc8452' } },
    ],
  }
}

const saClientDelayOption = computed(() => makeDelayOption(
  [10.5, 12.3, 22.8, 20.1, 15.6, 18.9, 21.3, 19.7, 16.2, 14.8, 11.5, 9.8, 8.2, 7.5, 6.9],
  [10.2, 11.8, 12.5, 10.8, 9.5, 10.2, 11.5, 10.0, 8.8, 7.6, 6.5, 5.8, 5.2, 4.8, 4.2]
))
const saClientDelayStats = { dMax: '213', dMin: '78', dAvg: '109', jMax: '9783', jMin: '567', jAvg: '7337' }

const saServerDelayOption = computed(() => makeDelayOption(
  [24.5, 24.8, 24.2, 18.6, 15.2, 12.8, 14.5, 16.2, 18.9, 22.1, 24.6, 23.8, 20.5, 16.8, 12.2],
  [10.5, 10.8, 10.2, 8.6, 7.2, 6.5, 7.0, 7.8, 8.9, 10.2, 11.5, 11.0, 9.8, 8.2, 6.5]
))
const saServerDelayStats = { dMax: '12', dMin: '0', dAvg: '3', jMax: '7095', jMin: '0', jAvg: '2868' }

const saAppDelayOption = computed(() => makeDelayOption(
  [28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14],
  [10, 10, 9, 9, 8, 8, 7, 7, 6, 6, 5, 5, 4, 4, 3]
))
const saAppDelayStats = { dMax: '0', dMin: '0', dAvg: '0', jMax: '0', jMin: '0', jAvg: '0' }

// 敏感应用详情弹窗
const saDetailVisible = ref(false)
const saDetailTitle = ref('')
const sadIp = ref('93.123.109.125')
const sadFilterSrc = ref('否')
const sadSrcPort = ref('80 / 8000-8080')
const sadDstType = ref('任意IP')
const sadDstValue = ref('')
const sadFilterDst = ref('否')
const sadDstPort = ref('80 / 8000-8080')
const sadIpVersion = ref('IPv4')
const sadProto = ref('任意')
const sadMac = ref('')
const sadDomain = ref('')
const sadAppProto = ref('SYN_ACK')
const sadClientLatency = ref('')
const sadServerLatency = ref('')
const sadAppLatency = ref('')
const sadConnType = ref('所有')
const sadCondRelation = ref('与')
const sadTimeRange = ref('2026-07-10 13:05:30 - 2026-07-10 13:20:30')
const sadPage = ref(1)
const sadPageSize = ref(100)
const sadTotal = 14572

interface SadRow { time: string; mac: string; vendor: string; srcIp: string; dstIp: string; geo: string; proto: string; domain: string; appProto: string; seq: string }

function generateSadRows(): SadRow[] {
  const rows: SadRow[] = []
  const srcIps = ['93.123.109.125:53658','93.123.109.125:53674','93.123.109.125:53674','93.123.109.125:53674','93.123.109.125:53658','93.123.109.125:53658','93.123.109.125:53658','93.123.109.125:53674','93.123.109.125:53658','93.123.109.125:53658','93.123.109.125:53658','93.123.109.125:53674','93.123.109.125:53674','93.123.109.125:53674']
  const dstIps = ['101.5.3.26:2079','101.5.3.26:6001','101.5.3.26:7065','101.5.3.26:5234','101.5.3.26:5601','101.5.3.26:8699','101.5.3.26:5908','101.5.3.26:15038','101.5.3.26:12323','101.5.3.26:7779','101.5.3.26:1960','101.5.3.26:9175','101.5.3.27:11601','101.5.3.27:1029','101.5.3.27:10900']
  const seqs = ['2125','1886','2825','2121','1851','3972','3546','6836','1706','3617','9555','1795','3274','3092','3947']
  for (let i = 0; i < 15; i++) {
    const m = 11 + Math.floor(i / 3)
    const s = 18 + (i % 3) * 7
    rows.push({
      time: `2026-07-10 13:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`,
      mac: '54-2b-d6-6d-10-ae',
      vendor: 'NewH3CTechno...',
      srcIp: srcIps[i % srcIps.length],
      dstIp: dstIps[i % dstIps.length],
      geo: '🇨 北京|BGP',
      proto: 'TCP',
      domain: '',
      appProto: 'SYN_ACK',
      seq: seqs[i % seqs.length],
    })
  }
  return rows
}

const sadRows = generateSadRows()

function openSaDetail(type: string, ip: string) {
  saDetailTitle.value = `敏感应用 > 连接时延 - ${type}: ${ip}`
  if (type === '源IP') {
    sadIp.value = ip
    sadFilterSrc.value = '否'
    sadDstType.value = '任意IP'
    sadDstValue.value = ''
  } else {
    sadIp.value = '93.123.109.125'
    sadFilterSrc.value = '否'
    sadDstType.value = '目标IP'
    sadDstValue.value = ip
  }
  sadPage.value = 1
  saDetailVisible.value = true
}

// 报文分析弹窗
const packetVisible = ref(false)
const packetTab = ref<'parse' | 'interact' | 'meta'>('parse')

interface PacketParseItem { time: string; src: string; dst: string; proto: string; len: number; info: string }
interface PacketInteractItem { time: string; src: string; dst: string; proto: string; info: string }

const packetParseData = ref<PacketParseItem[]>([
  { time: '13:11:51.123456', src: '93.123.109.125', dst: '101.5.3.26', proto: 'TCP', len: 74, info: '53658 → 2079 [SYN] Seq=0 Win=64240 Len=0 MSS=1460' },
  { time: '13:11:51.234567', src: '101.5.3.26', dst: '93.123.109.125', proto: 'TCP', len: 74, info: '2079 → 53658 [SYN, ACK] Seq=0 Ack=1 Win=65535 Len=0 MSS=1460' },
  { time: '13:11:51.345678', src: '93.123.109.125', dst: '101.5.3.26', proto: 'TCP', len: 66, info: '53658 → 2079 [ACK] Seq=1 Ack=1 Win=64240 Len=0' },
  { time: '13:11:51.456789', src: '93.123.109.125', dst: '101.5.3.26', proto: 'TCP', len: 583, info: '53658 → 2079 [PSH, ACK] Seq=1 Ack=1 Win=64240 Len=517' },
  { time: '13:11:51.567890', src: '101.5.3.26', dst: '93.123.109.125', proto: 'TCP', len: 1420, info: '2079 → 53658 [ACK] Seq=1 Ack=518 Win=65535 Len=1354' },
  { time: '13:11:51.678901', src: '93.123.109.125', dst: '101.5.3.26', proto: 'TCP', len: 329, info: '53658 → 2079 [ACK] Seq=518 Ack=1355 Win=64240 Len=263' },
  { time: '13:11:51.789012', src: '101.5.3.26', dst: '93.123.109.125', proto: 'TCP', len: 118, info: '2079 → 53658 [FIN, ACK] Seq=1355 Ack=781 Win=65535 Len=0' },
  { time: '13:11:52.123456', src: '93.123.109.125', dst: '101.5.3.26', proto: 'TCP', len: 66, info: '53658 → 2079 [FIN, ACK] Seq=781 Ack=1356 Win=64240 Len=0' },
])

const packetInteractData = ref<PacketInteractItem[]>([
  { time: '13:11:51.123456', src: '93.123.109.125', dst: '101.5.3.26', proto: 'TCP', info: 'SYN → (三次握手开始)' },
  { time: '13:11:51.234567', src: '101.5.3.26', dst: '93.123.109.125', proto: 'TCP', info: 'SYN-ACK ← (服务器响应)' },
  { time: '13:11:51.345678', src: '93.123.109.125', dst: '101.5.3.26', proto: 'TCP', info: 'ACK → (握手完成)' },
  { time: '13:11:51.456789', src: '93.123.109.125', dst: '101.5.3.26', proto: 'TCP', info: 'PSH-ACK → (数据发送)' },
  { time: '13:11:51.567890', src: '101.5.3.26', dst: '93.123.109.125', proto: 'TCP', info: 'ACK ← (数据确认)' },
  { time: '13:11:51.678901', src: '93.123.109.125', dst: '101.5.3.26', proto: 'TCP', info: 'ACK → (响应确认)' },
  { time: '13:11:51.789012', src: '101.5.3.26', dst: '93.123.109.125', proto: 'TCP', info: 'FIN-ACK ← (连接关闭请求)' },
  { time: '13:11:52.123456', src: '93.123.109.125', dst: '101.5.3.26', proto: 'TCP', info: 'FIN-ACK → (连接关闭确认)' },
])

const packetMetaData = ref<{ key: string; val: string }[]>([
  { key: '抓包时间', val: '2026-07-10 13:11:51' },
  { key: '抓包时长', val: '1.005678 秒' },
  { key: '总报文数', val: '8' },
  { key: '总字节数', val: '2870' },
  { key: '源MAC', val: '54-2b-d6-6d-10-ae' },
  { key: '目的MAC', val: '00-1a-2b-3c-4d-5e' },
  { key: '源IP', val: '93.123.109.125' },
  { key: '目的IP', val: '101.5.3.26' },
  { key: '源端口', val: '53658' },
  { key: '目的端口', val: '2079' },
  { key: '协议', val: 'TCP' },
  { key: 'TTL', val: '64' },
  { key: '窗口大小', val: '64240' },
  { key: 'MSS', val: '1460' },
])

function openPacketAnalysis(_row: SadRow) {
  packetTab.value = 'parse'
  packetVisible.value = true
}

// 历史诊断筛选器状态
const sahdMac = ref('')
const sahdSingleIp = ref('180.76.53.175')
const sahdSrcPort = ref('80 / 8000-8080')
const sahdDstType = ref('任意IP')
const sahdDstValue = ref('')
const sahdDstPort = ref('80 / 8000-8080')
const sahdProto = ref('任意')
const sahdSrcIsp = ref('任意')
const sahdDstIsp = ref('任意')
const sahdSrcRegion = ref('任意')
const sahdDstRegion = ref('任意')
const sahdTunnel = ref('任意')
const sahdDomain = ref('')
const sahdLink = ref('任意')
const sahdTimeRange = ref('2026-07-10 13:24:02 - 2026-07-10 13:39:02')

function searchSahdData() { /* mock: no-op */ }
function resetSahdFilters() {
  sahdMac.value = ''; sahdSingleIp.value = ''; sahdSrcPort.value = '80 / 8000-8080'
  sahdDstType.value = '任意IP'; sahdDstValue.value = ''; sahdDstPort.value = '80 / 8000-8080'
  sahdProto.value = '任意'; sahdSrcIsp.value = '任意'; sahdDstIsp.value = '任意'
  sahdSrcRegion.value = '任意'; sahdDstRegion.value = '任意'
  sahdTunnel.value = '任意'; sahdDomain.value = ''; sahdLink.value = '任意'
  sahdTimeRange.value = '2026-07-10 13:24:02 - 2026-07-10 13:39:02'
}

// 历史诊断 - 流量趋势图
const sahdTrafficOption = computed(() => {
  const times = ['13:24', '13:25', '13:26', '13:27', '13:28', '13:29', '13:30', '13:31', '13:32', '13:33', '13:34', '13:35', '13:36', '13:37', '13:38', '13:39']
  const up = [55, 58, 60, 62, 65, 68, 70, 72, 75, 78, 80, 82, 85, 88, 90, 95]
  const down = [45, 48, 50, 52, 55, 58, 60, 62, 65, 68, 70, 72, 75, 78, 80, 85]
  const conn = [22, 23, 24, 24, 25, 25, 25, 26, 26, 25, 25, 24, 24, 23, 22, 20]
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: 50, right: 50, top: 10, bottom: 30 },
    xAxis: { type: 'category', data: times, axisLabel: { fontSize: 10, color: '#909399' } },
    yAxis: [
      { type: 'value', name: 'Bytes', nameTextStyle: { fontSize: 10 }, axisLabel: { fontSize: 10, color: '#909399', formatter: (v: number) => v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v + '' } },
      { type: 'value', name: 'Session#', nameTextStyle: { fontSize: 10 }, axisLabel: { fontSize: 10, color: '#909399' } },
    ],
    series: [
      { name: '上行流量', type: 'line', stack: 'traffic', areaStyle: {}, data: up, itemStyle: { color: '#ee6666' }, smooth: true },
      { name: '下行流量', type: 'line', stack: 'traffic', areaStyle: {}, data: down, itemStyle: { color: '#5470c6' }, smooth: true },
      { name: '连接数', type: 'line', yAxisIndex: 1, data: conn, itemStyle: { color: '#fac858' }, smooth: true },
    ],
  }
})

// 历史诊断 - 协议分布图（柱状图）
const sahdProtocolOption = computed(() => {
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: 50, right: 50, top: 10, bottom: 30 },
    xAxis: { type: 'category', data: ['敏感协议'], axisLabel: { fontSize: 10, color: '#909399' } },
    yAxis: [
      { type: 'value', name: 'Bytes', nameTextStyle: { fontSize: 10 }, axisLabel: { fontSize: 10, color: '#909399', formatter: (v: number) => v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v + '' } },
      { type: 'value', name: 'Session#', nameTextStyle: { fontSize: 10 }, axisLabel: { fontSize: 10, color: '#909399' } },
    ],
    series: [
      { name: '上行流量', type: 'bar', stack: 'total', data: [60], itemStyle: { color: '#ee6666' } },
      { name: '下行流量', type: 'bar', stack: 'total', data: [90], itemStyle: { color: '#5470c6' } },
      { name: '连接数', type: 'line', yAxisIndex: 1, data: [25], itemStyle: { color: '#fac858' }, smooth: true },
    ],
  }
})

// 历史诊断 - 源IP表格
const sahdSrcRows: [string, number, string, string, string][] = [
  ['180.76.53.175', 401, '726.12 K', '902.16 K', '敏感协议'],
  ['127.27.22.137', 601, '1.11 M', '1.23 M', '敏感协议'],
  ['180.76.53.175', 401, '726.12 K', '902.16 K', '敏感协议'],
  ['106.13.6.113', 338, '628.23 K', '743.77 K', '敏感协议'],
  ['182.92.221.133', 283, '507.03 K', '650.38 K', '敏感协议'],
  ['182.92.151.34', 270, '488.87 K', '616.45 K', '敏感协议'],
  ['58.225.155.154', 263, '483.80 K', '610.71 K', '敏感协议'],
  ['182.92.151.34', 264, '477.05 K', '601.92 K', '敏感协议'],
  ['182.92.128.160', 257, '466.71 K', '581.02 K', '敏感协议'],
  ['125.103.9.168', 223, '403.31 K', '514.52 K', '敏感协议'],
  ['125.46.63.156', 221, '398.87 K', '542.37 K', '敏感协议'],
  ['121.27.122.227', 189, '370.84 K', '486.00 K', '敏感协议'],
  ['125.26.95.168', 144, '259.37 K', '325.10 K', '敏感协议'],
  ['125.26.162.163', 123, '220.23 K', '280.84 K', '敏感协议'],
  ['45.156.87.147', 122, '221.93 K', '264.78 K', '敏感协议'],
  ['139.224.72.65', 116, '290.83 K', '331.12 K', '敏感协议'],
  ['125.20.200.168', 102, '185.17 K', '232.81 K', '敏感协议'],
  ['101.6.86.160', 98, '649.34 K', '888.74 K', '敏感协议'],
  ['117.50.216.195', 89, '222.30 K', '247.13 K', '敏感协议'],
  ['125.20.202.34', 87, '144.71 K', '181.77 K', '敏感协议'],
]
const sahdSrcTotal = ref(398)
const sahdSrcPage = ref(1)
const sahdSrcPageSize = ref(20)

// 历史诊断 - 目标IP表格
const sahdDstRows: [string, number, string, string, string][] = [
  ['101.6.8.119', 548, '1.02 M', '1.18 M', '敏感协议'],
  ['101.6.10.99', 344, '617.71 K', '778.34 K', '敏感协议'],
  ['101.6.6.171', 283, '509.32 K', '649.82 K', '敏感协议'],
  ['101.6.8.37', 283, '507.03 K', '650.38 K', '敏感协议'],
  ['101.6.8.164', 281, '605.11 K', '635.71 K', '敏感协议'],
  ['101.6.5.242', 278, '500.87 K', '631.91 K', '敏感协议'],
  ['101.6.8.170', 277, '494.88 K', '634.68 K', '敏感协议'],
  ['101.6.8.149', 276, '623.70 K', '740.74 K', '敏感协议'],
  ['101.6.10.25', 264, '459.69 K', '605.06 K', '敏感协议'],
  ['101.6.10.74', 244, '438.27 K', '561.13 K', '敏感协议'],
  ['101.6.8.141', 216, '402.79 K', '377.90 K', '敏感协议'],
  ['101.6.8.235', 208, '373.38 K', '485.70 K', '敏感协议'],
  ['101.6.8.165', 196, '355.96 K', '446.81 K', '敏感协议'],
  ['101.6.8.157', 180, '322.83 K', '388.38 K', '敏感协议'],
  ['101.6.8.64', 172, '383.12 K', '448.70 K', '敏感协议'],
  ['166.111.7.238', 154, '276.30 K', '347.12 K', '敏感协议'],
  ['101.6.10.107', 141, '252.76 K', '314.94 K', '敏感协议'],
  ['101.6.10.98', 140, '248.63 K', '318.40 K', '敏感协议'],
  ['101.6.10.93', 102, '244.37 K', '274.09 K', '敏感协议'],
  ['101.6.6.97', 100, '191.19 K', '198.61 K', '敏感协议'],
]
const sahdDstTotal = ref(138)
const sahdDstPage = ref(1)
const sahdDstPageSize = ref(20)

// 历史诊断 - 目标域名表格
const sahdDomainRows: [string, number, string, string, string][] = [
  ['alapi.cray.net', 7, '6.11 K', '34.10 K', '远程应用'],
  ['raw.githubusercontent.com', 5, '7.14 K', '43.50 K', 'VPN应用'],
  ['yan.8m.cn.com', 1, '1.08 K', '6.60 K', 'VPN应用'],
]
const sahdDomainTotal = ref(3)
const sahdDomainPage = ref(1)
const sahdDomainPageSize = ref(20)

// 历史会话筛选器状态
const sahsMac = ref('')
const sahsSrcType = ref('源IP')
const sahsSrcValue = ref('')
const sahsSrcPort = ref('80 / 8000-8080')
const sahsDstType = ref('目标IP')
const sahsDstValue = ref('')
const sahsDstPort = ref('80 / 8000-8080')
const sahsProto = ref('任意')
const sahsDomain = ref('')
const sahsTunnel = ref('任意')
const sahsConnType = ref('所有')
const sahsCondRelation = ref('与')
const sahsAppProto = ref('任意协议')
const sahsUserGroup = ref('任意')
const sahsUserName = ref('')
const sahsLink = ref('任意')
const sahsTimeRange = ref('2026-07-10 13:24:02 - 2026-07-10 13:44:02')
const sahsPage = ref(1)
const sahsPageSize = ref(100)
const sahsTotal = ref(1890)
const sahsDropdownIndex = ref(-1)

function searchSahsData() { /* mock: no-op */ }
function resetSahsFilters() {
  sahsMac.value = ''
  sahsSrcValue.value = ''
  sahsSrcPort.value = '80 / 8000-8080'
  sahsDstValue.value = ''
  sahsDstPort.value = '80 / 8000-8080'
  sahsProto.value = '任意'
  sahsDomain.value = ''
  sahsTunnel.value = '任意'
  sahsConnType.value = '所有'
  sahsCondRelation.value = '与'
  sahsAppProto.value = '任意协议'
  sahsUserName.value = ''
  sahsLink.value = '任意'
  sahsTimeRange.value = '2026-07-10 13:24:02 - 2026-07-10 13:44:02'
  sahsPage.value = 1
}

// 数据包下拉菜单控制
function togglePacketDropdown(index: number) {
  sahsDropdownIndex.value = sahsDropdownIndex.value === index ? -1 : index
}

// 关闭所有下拉菜单
function closeAllDropdowns() {
  sahsDropdownIndex.value = -1
}

// 报文分析弹窗（复用已有弹窗）
function openPacketAnalysisModal(row: any) {
  closeAllDropdowns()
  packetTab.value = 'parse'
  packetVisible.value = true
}

// 报文播放弹窗
const packetPlayVisible = ref(false)
function openPacketPlayModal(row: any) {
  closeAllDropdowns()
  packetPlayVisible.value = true
}

// 报文下载和内容下载（mock实现）
function downloadPacket(row: any) {
  closeAllDropdowns()
  alert('报文下载功能（Mock）')
}

function downloadContent(row: any) {
  closeAllDropdowns()
  alert('内容下载功能（Mock）')
}

// 历史会话表格数据
const sahsRows = [
  { t: '2026-06-13 19:41:23', mac: 'ec:8e:b5:12:34:56', vendor: 'NewH3CTechnc...', src: '111.226.166.248:38422', dst: '101.6.15.130:443', app: '泡芙云', geo: '🇨🇳 北京|BGP', up: '1.43 K', dn: '2.05 K', tun: 'VPN应用' },
  { t: '2026-06-13 19:41:22', mac: 'a4:1a:3a:56:78:90', vendor: 'HuaweiTechno...', src: '101.6.68.247:53240', dst: '101.6.4.100:1701', app: 'L2TP', geo: '🇨🇳 北京|BGP', up: '2.84 K', dn: '0', tun: 'VPN协议' },
  { t: '2026-06-13 19:41:21', mac: '00:1a:2b:3c:4d:5e', vendor: 'IntelCorpora...', src: '5.231.242.20:53240', dst: '101.6.8.149:22', app: 'SSH', geo: '🇨🇳 北京|BGP', up: '3.02 K', dn: '2.56 K', tun: '敏感协议' },
  { t: '2026-06-13 19:41:20', mac: 'f8:e4:3b:aa:bb:cc', vendor: 'Apple, Inc.', src: '81.177.6.131:42108', dst: '101.6.15.67:22', app: 'SSH', geo: '🇨🇳 北京|BGP', up: '2.14 K', dn: '1.88 K', tun: '敏感协议' },
  { t: '2026-06-13 19:41:19', mac: 'd0:67:e5:11:22:33', vendor: 'Dell Inc.', src: '172.28.8.9:49822', dst: '166.111.5.212:22', app: 'SSH', geo: '🇨🇳 北京|BGP', up: '1.62 K', dn: '1.45 K', tun: '敏感协议' },
  { t: '2026-06-13 19:41:18', mac: 'b8:27:eb:44:55:66', vendor: 'Raspberry Pi', src: '10.0.12.36:52108', dst: '101.6.28.183:22', app: 'SSH', geo: '🇨🇳 北京|BGP', up: '2.48 K', dn: '2.12 K', tun: '敏感协议' },
  { t: '2026-06-13 19:41:17', mac: '00:50:56:a1:b2:c3', vendor: 'VMware, Inc.', src: '213.209.159.233:31234', dst: '202.205.184.10:22', app: 'SSH', geo: '🇨🇳 北京|BGP', up: '1.90 K', dn: '2.23 K', tun: '敏感协议' },
  { t: '2026-06-13 19:41:16', mac: 'ac:de:48:00:11:22', vendor: 'Private', src: '47.96.147.121:51234', dst: '106.11.248.134:443', app: '泡芙云', geo: '🇨🇳 浙江|阿里云', up: '0.96 K', dn: '1.28 K', tun: 'VPN应用' },
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
.sap-panel { flex:1; min-height:0; display:none; flex-direction:column; }
.sap-panel.active { display:flex; }

/* Common ou-* / tdh-* */
.ou-table-wrap { flex:1; min-height:0; overflow:auto; }
.ou-table { width:100%; border-collapse:collapse; font-size:13px; }
.ou-table th { background:#fafbfc; border-bottom:1px solid #ebeef5; padding:8px 10px; text-align:left; font-weight:600; color:#606266; white-space:nowrap; font-size:12px; }
.ou-table td { border-bottom:1px solid #f0f2f5; padding:6px 10px; color:#303133; }
.ou-num { text-align:right; font-variant-numeric:tabular-nums; }
.col-idx { width:48px; text-align:center; }
.col-check { width:40px; text-align:center; }
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

/* tid- shared */
.tid-page { flex:1; min-height:0; display:flex; flex-direction:column; overflow:hidden; background:#f5f7fa; }
.tid-scroll { flex:1; min-height:0; overflow:auto; padding:12px; display:flex; flex-direction:column; gap:12px; }
.tid-mid-grid { display:grid; grid-template-columns:1fr min(360px, 32%); gap:12px; }
.tid-bottom-grid { display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:12px; }
.tid-chart-panel, .tid-mini-panel { background:#fff; border:1px solid #e4e7ed; border-radius:4px; display:flex; flex-direction:column; min-width:0; min-height:0; }
.tid-mini-head { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; border-bottom:1px solid #ebeef5; }
.tid-mini-title { margin:0; font-size:14px; font-weight:600; color:#303133; }
.tid-expand-btn { border:none; background:transparent; color:#909399; cursor:default; font-size:14px; }
.tid-expand-btn:disabled { opacity:.6; }
.tid-legend { display:flex; flex-wrap:wrap; gap:8px 14px; font-size:12px; color:#606266; }
.tid-legend-item { display:inline-flex; align-items:center; gap:4px; }
.tid-legend-dot { display:inline-block; width:10px; height:10px; border-radius:2px; }
.tid-link { color:#409eff; cursor:pointer; }
.tid-chart-body { padding:10px 12px; display:flex; gap:6px; align-items:stretch; }
.tid-chart-body-stack { flex-direction:row; }
.tid-yunit { font-size:11px; color:#909399; }
.to-chart-plot, .to-panel-chart, .to-combo-plot, .saa-chart-plot, .saa-dual-plot, .sahd-combo-plot { flex:1; min-width:0; }
.to-chart-placeholder { display:flex; align-items:center; justify-content:center; min-height:180px; color:#c0c4cc; font-size:12px; background:repeating-linear-gradient(45deg, #fafbfc, #fafbfc 8px, #f2f4f7 8px, #f2f4f7 16px); border-radius:3px; }
.dtt-chart-stats { display:flex; flex-wrap:wrap; gap:8px 16px; padding:8px 12px; border-top:1px solid #ebeef5; font-size:12px; color:#606266; }
.dtt-stat { display:inline-flex; align-items:center; gap:4px; }
.dtt-stat strong { color:#303133; }
.dtt-stat-badge { display:inline-flex; align-items:center; justify-content:center; min-width:28px; padding:0 4px; height:16px; border-radius:2px; font-size:10px; font-weight:700; color:#fff; margin-right:4px; }
.dtt-stat-badge.max { background:#f56c6c; }
.dtt-stat-badge.min { background:#67c23a; }
.dtt-stat-badge.avg { background:#e6a23c; }
.tio-range-btns { display:inline-flex; border:1px solid #dcdfe6; border-radius:3px; overflow:hidden; }
.tio-range-btn { padding:4px 10px; border:none; background:#fff; color:#606266; font-size:12px; cursor:pointer; border-right:1px solid #dcdfe6; }
.tio-range-btn:last-child { border-right:none; }
.tio-range-btn.active { background:#ecf5ff; color:#409eff; }
.tio-range-btn:disabled { opacity:.55; cursor:not-allowed; }
.tid-mini-table-wrap { flex:1; min-height:0; overflow:auto; }
.tid-mini-table th, .tid-mini-table td { padding:6px 8px; font-size:12px; }
.tid-mini-table .col-metric { text-align:right; }
.tid-mini-table .col-tunnel { font-size:12px; }

/* sap-ro */
.sap-ro-page.tid-page { background:#f5f7fa; }
.sap-ro-filters { flex-shrink:0; background:#fff; border-bottom:1px solid #ebeef5; }
.sap-ro-chart-head { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; padding:10px 12px 0; flex-wrap:wrap; }
.sap-ro-chart-head .tid-legend { flex:1; min-width:0; }
.sap-ro-pie-head { padding:10px 12px 0; }
.sap-ro-pie-title { margin:0; font-size:14px; font-weight:700; color:#303133; }
.sap-ro-table-wrap { max-height:240px; }
.sap-ro-table .col-tunnel { min-width:72px; font-size:12px; }
.sap-ro-domain { display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.sap-ro-mini-footer { flex-shrink:0; padding:8px 10px; border-top:1px solid #f0f2f5; font-size:12px; }

/* sas */
.sas-page { flex:1; min-height:0; display:flex; flex-direction:column; overflow:hidden; background:#fff; }
.sas-table-wrap { flex:1; min-height:0; }
.sas-table { min-width:1680px; table-layout:fixed; }
.sas-table .col-idx { width:52px; text-align:center; }
.sas-table .col-time { width:148px; white-space:nowrap; font-size:12px; }
.sas-table .col-user { width:88px; }
.sas-table .col-endpoint { width:148px; font-size:12px; }
.sas-table .col-proto { width:72px; text-align:center; }
.sas-table .col-app-proto { width:88px; text-align:center; }
.sas-table .col-tunnel { width:88px; font-size:12px; }
.sas-table .col-traffic { width:80px; text-align:right; font-size:12px; }
.sas-table .col-link { width:72px; }
.sas-table .col-domain { width:120px; }
.sas-endpoint { display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

/* saa */
.saa-page.tid-page { background:#f5f7fa; }
.saa-filters .tdh-time-range { min-width:320px; }
.saa-grid { display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:12px; padding:12px; align-items:stretch; }
.saa-chart-body { padding-top:0; }
.saa-table-wrap { max-height:200px; }
.saa-table .col-ip { min-width:0; }
.saa-table .col-fail { width:96px; }
.saa-table .col-latency { width:72px; text-align:right; font-size:12px; }
.saa-fail-cell { position:relative; display:flex; align-items:center; justify-content:flex-end; min-height:22px; padding:0 4px; }
.saa-fail-bar { position:absolute; left:0; right:0; top:50%; transform:translateY(-50%); height:14px; background:#f3f4f7; border-radius:2px; overflow:hidden; }
.saa-fail-bar i { display:block; height:100%; width:var(--saa-fail-pct, 0%); background:linear-gradient(90deg, #b8cce8, #91a7e8); border-radius:2px; }
.saa-fail-num { position:relative; z-index:1; font-size:12px; }
.saa-mini-footer { padding:8px 10px; font-size:12px; }
.saa-mini-footer--stacked { flex-direction:column; align-items:stretch; gap:6px; }
.saa-dual-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:10px 12px 6px; flex-wrap:wrap; }
.saa-dual-body { padding:0 6px 4px; }
.saa-dual-yaxis { display:flex; justify-content:space-between; padding:0 4px 2px 36px; font-size:11px; font-weight:600; color:#909399; }
.saa-dual-plot { min-height:132px; }
.saa-dual-stats { flex-direction:column; align-items:flex-start; gap:8px; }
.saa-stat-group { display:flex; flex-wrap:wrap; align-items:center; gap:8px 16px; }
.saa-stat-tag { font-style:normal; font-size:12px; font-weight:600; color:#5470c6; min-width:28px; }
.saa-stat-tag-jitter { color:#fc8452; }
.dtt-stat-badge.saa-badge-jitter.max { background:#fc8452; }
.dtt-stat-badge.saa-badge-jitter.min { background:#fac858; }
.dtt-stat-badge.saa-badge-jitter.avg { background:#eeaa66; }

/* sahd */
.sahd-page.tid-page { background:#f5f7fa; }
.sahd-filters .tdh-time-range { min-width:320px; }
.sahd-mid-grid { grid-template-columns:2fr 1fr; }
.sahd-combo-wrap { padding:0 6px 4px; }
.sahd-combo-plot { min-height:200px; }
.to-combo-yaxis { display:flex; justify-content:space-between; padding:6px 6px 0; font-size:11px; color:#909399; }
.sahd-chart-stats { flex-direction:column; align-items:flex-start; gap:8px; }
.sahd-stat-group { display:flex; flex-wrap:wrap; align-items:center; gap:8px 16px; }
.sahd-stat-tag { font-style:normal; font-size:12px; font-weight:600; color:#5470c6; min-width:42px; }
.sahd-stat-tag-conn { color:#fac858; }
.dtt-stat-badge.sahd-badge-conn.max { background:#fac858; color:#333; }
.dtt-stat-badge.sahd-badge-conn.min { background:#ffe58f; color:#333; }
.dtt-stat-badge.sahd-badge-conn.avg { background:#ffd666; color:#333; }
.sahd-pie-head { padding:8px 12px 0; }
.sahd-pie-body { height:200px; }
.sahd-pie-wrap { height:200px; }
.sahd-table .col-ip { min-width:0; font-size:12px; }
.sahd-table .col-domain { min-width:0; font-size:12px; }
.sahd-table .col-tunnel { width:80px; font-size:12px; }
.sahd-table-wrap { max-height:220px; }
.sahd-no-data { padding:20px; text-align:center; color:#909399; font-size:13px; }
.sahd-mini-footer { padding:8px 10px; font-size:12px; }
.sahd-mini-footer--stacked { flex-direction:column; align-items:stretch; gap:6px; }

/* sahs */
.sahs-page { flex:1; min-height:0; display:flex; flex-direction:column; overflow:hidden; background:#fff; }
.sahs-filters .tdh-time-range { min-width:320px; }
.tdh-table-bar { display:flex; justify-content:flex-end; padding:6px 12px; border-bottom:1px solid #ebeef5; flex-shrink:0; }
.sahs-table-wrap { flex:1; min-height:0; }
.sahs-table { min-width:1960px; table-layout:fixed; }
.sahs-table .col-check { width:42px; text-align:center; }
.sahs-table .col-time { width:148px; white-space:nowrap; font-size:12px; }
.sahs-table .col-mac { width:128px; font-family:ui-monospace, monospace; font-size:12px; }
.sahs-table .col-mac-vendor { width:120px; }
.sahs-table .col-user { width:80px; }
.sahs-table .col-endpoint { width:148px; font-size:12px; }
.sahs-table .col-app-proto { width:88px; }
.sahs-table .col-geo { width:148px; font-size:12px; }
.sahs-table .col-traffic { width:80px; text-align:right; font-size:12px; }
.sahs-table .col-proto { width:72px; text-align:center; }
.sahs-table .col-tunnel { width:88px; font-size:12px; }
.sahs-table .col-domain { width:100px; }
.sahs-table .col-actions { width:72px; text-align:center; }
.sahs-endpoint, .sahs-mac-vendor { display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.sahs-geo { display:inline-flex; align-items:center; gap:4px; font-size:12px; white-space:nowrap; }

/* sahs dropdown */
.sahs-dropdown { position:relative; display:inline-block; }
.sahs-packet-btn { color:#409eff; cursor:pointer; text-decoration:underline; }
.sahs-dropdown-menu { position:absolute; top:100%; left:0; z-index:1000; min-width:100px; padding:4px 0; background:#fff; border:1px solid #dcdfe6; border-radius:4px; box-shadow:0 2px 12px rgba(0,0,0,0.1); }
.sahs-dropdown-item { display:block; padding:6px 12px; color:#606266; font-size:12px; cursor:pointer; white-space:nowrap; }
.sahs-dropdown-item:hover { background:#ecf5ff; color:#409eff; }

/* pp - 报文播放弹窗 */
.pp-page { padding:20px; }
.pp-controls { display:flex; align-items:center; gap:12px; margin-bottom:16px; }
.pp-btn { padding:6px 16px; border:1px solid #dcdfe6; border-radius:4px; background:#fff; color:#606266; font-size:13px; cursor:pointer; }
.pp-btn:hover { background:#ecf5ff; color:#409eff; border-color:#409eff; }
.pp-speed { display:inline-flex; align-items:center; gap:6px; margin-left:auto; }
.pp-status { display:flex; align-items:center; gap:8px; margin-bottom:12px; font-size:13px; }
.pp-status-label { color:#909399; }
.pp-status-value { color:#303133; font-weight:600; }
.pp-progress { display:flex; align-items:center; gap:12px; margin-bottom:16px; }
.pp-progress-bar { flex:1; height:8px; background:#f0f2f5; border-radius:4px; overflow:hidden; }
.pp-progress-fill { height:100%; background:#409eff; border-radius:4px; transition:width 0.3s; }
.pp-progress-text { font-size:12px; color:#606266; white-space:nowrap; }
.pp-current { border:1px solid #ebeef5; border-radius:4px; padding:16px; background:#fafbfc; }
.pp-current-title { margin:0 0 12px; font-size:14px; font-weight:600; color:#303133; }
.pp-current-info { margin:0; }
.pp-current-info p { margin:6px 0; font-size:13px; color:#606266; font-family:ui-monospace, monospace; }

@media (max-width:1400px) { .saa-grid { grid-template-columns:repeat(2, minmax(0,1fr)); } }
@media (max-width:1200px) {
  .tid-mid-grid, .tid-bottom-grid, .sahd-mid-grid { grid-template-columns:1fr; }
}
@media (max-width:960px) { .saa-grid { grid-template-columns:1fr; } }

/* sp - 实时会话弹窗 */
.sp-page { display:flex; flex-direction:column; min-height:500px; }
.sp-filters { flex-shrink:0; background:#fff; border-bottom:1px solid #ebeef5; }
.sp-table-wrap { flex:1; min-height:0; overflow:auto; }
.sp-table { min-width:1680px; table-layout:fixed; }
.sp-table .col-idx { width:52px; text-align:center; }
.sp-table .col-time { width:148px; white-space:nowrap; font-size:12px; }
.sp-table .col-user { width:88px; }
.sp-table .col-endpoint { width:148px; font-size:12px; }
.sp-table .col-proto { width:72px; text-align:center; }
.sp-table .col-app-proto { width:88px; text-align:center; }
.sp-table .col-tunnel { width:88px; font-size:12px; }
.sp-table .col-traffic { width:80px; text-align:right; font-size:12px; }
.sp-table .col-link { width:72px; }
.sp-table .col-domain { width:120px; }
.sp-endpoint { display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.sp-footer { flex-shrink:0; padding:8px 14px; border-top:1px solid #ebeef5; font-size:12px; color:#606266; }

/* sad - 敏感应用详情弹窗 */
.sad-page { display:flex; flex-direction:column; min-height:500px; }
.sad-filters { flex-shrink:0; background:#fff; border-bottom:1px solid #ebeef5; }
.sad-table-wrap { flex:1; min-height:0; overflow:auto; }
.sad-table { min-width:1680px; table-layout:fixed; }
.sad-table .col-check { width:36px; text-align:center; }
.sad-table .col-time { width:148px; white-space:nowrap; font-size:12px; }
.sad-table .col-mac { width:120px; font-size:12px; }
.sad-table .col-mac-vendor { width:110px; font-size:12px; }
.sad-table .col-user { width:80px; }
.sad-table .col-endpoint { width:148px; font-size:12px; }
.sad-table .col-geo { width:100px; font-size:12px; }
.sad-table .col-proto { width:64px; text-align:center; }
.sad-table .col-domain { width:100px; }
.sad-table .col-site { width:80px; }
.sad-table .col-app-proto { width:80px; text-align:center; }
.sad-table .col-seq { width:64px; text-align:right; font-size:12px; }
.sad-table .col-actions { width:64px; text-align:center; }
.sad-endpoint { display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.sad-geo-tag { display:inline-block; padding:1px 6px; border-radius:3px; background:#fef0f0; color:#f56c6c; font-size:11px; }
.sad-action-link { color:#409eff; cursor:pointer; text-decoration:underline; }
.sad-action-link:hover { color:#66b1ff; }
.sad-footer { flex-shrink:0; padding:8px 14px; border-top:1px solid #ebeef5; font-size:12px; color:#606266; }

/* sap-ro 图表样式 */
.sap-ro-mid-grid .tid-chart-panel { min-height:400px !important; }
.sap-ro-mid-grid .tid-chart-body { height:320px; display:flex; }
.sap-ro-mid-grid .to-chart-plot { flex:1; height:300px; }
.sap-ro-mid-grid .to-pie-wrap { flex:1; height:300px; }
.sap-ro-trend-chart { width:100%; height:300px; }
.sap-ro-pie-chart { width:100%; height:300px; }

/* pa - 报文分析弹窗 */
.pa-page { display:flex; flex-direction:column; min-height:500px; }
.pa-tabs { display:flex; gap:0; border-bottom:1px solid #ebeef5; flex-shrink:0; }
.pa-tab { padding:10px 20px; border:none; background:transparent; font-size:14px; color:#606266; cursor:pointer; position:relative; }
.pa-tab.active { color:#409eff; font-weight:600; }
.pa-tab.active::after { content:''; position:absolute; bottom:0; left:20px; right:20px; height:2px; background:#409eff; }
.pa-body { flex:1; min-height:0; display:flex; flex-direction:column; }
.pa-parse, .pa-interact { flex:1; min-height:0; display:flex; flex-direction:column; }
.pa-table_wrap { flex:1; min-height:0; overflow:auto; }
.pa-table { min-width:1000px; table-layout:fixed; }
.pa-table .col-idx { width:52px; text-align:center; }
.pa-table .col-time { width:148px; white-space:nowrap; font-size:12px; font-family:ui-monospace, monospace; }
.pa-table .col-src { width:148px; font-size:12px; }
.pa-table .col-dst { width:148px; font-size:12px; }
.pa-table .col-proto { width:80px; text-align:center; }
.pa-table .col-len { width:80px; text-align:right; font-size:12px; }
.pa-table .col-info { min-width:200px; font-size:12px; word-break:break-all; }
.pa-meta { padding:16px; }
.cd-detail-table { width:100%; border-collapse:collapse; font-size:13px; }
.cd-detail-table th, .cd-detail-table td { padding:8px 12px; border:1px solid #ebeef5; text-align:left; }
.cd-detail-key { width:180px; background:#fafbfc; font-weight:600; color:#606266; }
.cd-detail-val { color:#303133; }
</style>
