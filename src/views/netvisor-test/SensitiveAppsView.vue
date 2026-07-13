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
              <label class="tdh-filter-field"><span class="ou-toolbar-label">隧道类型</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">链路</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">图表类型</span><select class="ou-toolbar-select" disabled><option selected>下行流量</option></select></label>
              <button type="button" class="ou-search-btn" disabled>搜索</button>
              <button type="button" class="secondary td-reset-btn" disabled>重置</button>
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
                    <button type="button" class="tio-range-btn active" disabled>日</button>
                    <button type="button" class="tio-range-btn" disabled>周</button>
                    <button type="button" class="tio-range-btn" disabled>月</button>
                  </div>
                </div>
                <div class="tid-chart-body tid-chart-body-stack">
                  <span class="tid-yunit">Bytes</span>
                  <div class="to-chart-plot tid-chart-plot"><v-chart class="sap-ro-chart" :option="roStackOption" autoresize /></div>
                </div>
                <div class="dtt-chart-stats">
                  <span class="dtt-stat"><i class="dtt-stat-badge max">MAX</i>最大值 <strong>3.82 G</strong></span>
                  <span class="dtt-stat"><i class="dtt-stat-badge min">MIN</i>最小值 <strong>1.56 M</strong></span>
                  <span class="dtt-stat"><i class="dtt-stat-badge avg">AVG</i>平均值 <strong>137.01 M</strong></span>
                </div>
              </section>

              <section class="tid-chart-panel tid-chart-panel-pie">
                <div class="sap-ro-pie-head"><h3 class="sap-ro-pie-title">隧道类型分布</h3></div>
                <div class="tid-chart-body tid-chart-body-pie">
                  <div class="to-pie-wrap tid-pie-wrap"><v-chart class="sap-ro-pie-chart" :option="roPieOption" autoresize /></div>
                </div>
              </section>
            </div>

            <div class="tid-bottom-grid sap-ro-bottom-grid">
              <section v-for="m in sapRoMinis" :key="m.title" class="tid-mini-panel">
                <div class="tid-mini-head">
                  <h3 class="tid-mini-title">{{ m.title }}</h3>
                  <button type="button" class="tid-expand-btn" disabled>⛶</button>
                </div>
                <div class="ou-table-wrap tid-mini-table-wrap sap-ro-table-wrap">
                  <table class="ou-table tid-mini-table sap-ro-table">
                    <thead><tr><th class="col-idx">序号</th><th :class="m.firstCol">{{ m.firstLabel }}</th><th class="col-metric">请求…</th><th class="col-metric">失败…</th><th class="col-tunnel">隧道…</th></tr></thead>
                    <tbody>
                      <tr v-for="(r, i) in m.rows" :key="i"><td class="col-idx">{{ i + 1 }}</td><td :class="m.firstCol"><span class="tid-link" :class="{ 'sap-ro-domain': m.firstCol === 'col-domain' }">{{ r[0] }}</span></td><td class="col-metric ou-num">{{ r[1] }}</td><td class="col-metric ou-num">{{ r[2] }}</td><td class="col-tunnel">{{ r[3] }}</td></tr>
                    </tbody>
                  </table>
                </div>
                <div class="ou-footer sap-ro-mini-footer">
                  <div class="ou-footer-left"><div class="ou-pager"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn active" disabled>1</button><span class="ou-page-ellipsis">…</span><button type="button" class="ou-page-btn" disabled>{{ m.lastPage }}</button><button type="button" class="ou-page-btn" disabled>›</button></div></div>
                  <div class="ou-footer-right"><span>共 {{ m.total }} 条</span></div>
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
              <label class="tdh-filter-field"><select class="ou-toolbar-select" disabled><option selected>源IP</option></select><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="任意IP" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">源端口</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="80 / 8000-8080" disabled /></label>
              <label class="tdh-filter-field"><select class="ou-toolbar-select" disabled><option selected>目标IP</option></select><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="任意IP" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">目标端口</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="80 / 8000-8080" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">传输协议</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
            </div>
            <div class="tdh-filter-row tdh-filter-row-actions">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">应用协议</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">域名</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">隧道类型</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">用户名称</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">链路</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
              <button type="button" class="ou-search-btn" disabled>搜索</button>
              <button type="button" class="secondary td-reset-btn" disabled>重置</button>
            </div>
          </div>

          <div class="ou-table-wrap sas-table-wrap">
            <table class="ou-table sas-table">
              <thead><tr><th class="col-idx">序号</th><th class="col-time">时间</th><th class="col-user">用户名称</th><th class="col-endpoint">源IP</th><th class="col-endpoint">目标IP</th><th class="col-proto">传输协议</th><th class="col-app-proto">应用协议</th><th class="col-tunnel">隧道类型</th><th class="col-traffic">上行流量</th><th class="col-traffic">下行流量</th><th class="col-link">链路</th><th class="col-domain">域名</th></tr></thead>
              <tbody>
                <tr v-for="(r, i) in sasRows" :key="i"><td class="col-idx">{{ i + 1 }}</td><td class="col-time">{{ r.t }}</td><td class="col-user">—</td><td class="col-endpoint"><span class="sas-endpoint">{{ r.src }}</span></td><td class="col-endpoint"><span class="sas-endpoint">{{ r.dst }}</span></td><td class="col-proto">TCP</td><td class="col-app-proto">SSH</td><td class="col-tunnel">敏感协议</td><td class="col-traffic ou-num">{{ r.up }}</td><td class="col-traffic ou-num">{{ r.dn }}</td><td class="col-link">—</td><td class="col-domain">—</td></tr>
              </tbody>
            </table>
          </div>

          <div class="ou-footer ou-footer-td sas-footer">
            <div class="ou-footer-left"><div class="ou-pager"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn active" disabled>1</button><button type="button" class="ou-page-btn" disabled>2</button><button type="button" class="ou-page-btn" disabled>3</button><button type="button" class="ou-page-btn" disabled>4</button><button type="button" class="ou-page-btn" disabled>5</button><span class="ou-page-ellipsis">…</span><button type="button" class="ou-page-btn" disabled>82</button><button type="button" class="ou-page-btn" disabled>›</button></div></div>
            <div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页 <button type="button" class="ou-page-goto-btn" disabled>确定</button></label><span>共 8192 条</span><label class="ou-page-size"><select disabled><option selected>100 条/页</option></select></label></div>
          </div>
        </div>
      </div>

      <!-- 敏感应用 -->
      <div class="sap-panel" :class="{ active: activeTab === 'sensitive-apps' }" role="tabpanel">
        <div class="saa-page tid-page">
          <div class="tdh-filters saa-filters">
            <div class="tdh-filter-row tdh-filter-row-actions">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">敏感应用</span><select class="ou-toolbar-select" disabled><option selected>SYN_ACK</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">链路</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
              <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" type="text" value="2026-06-13 19:05:01 - 2026-06-13 19:20:01" disabled /></label>
              <button type="button" class="ou-search-btn" disabled>搜索</button>
              <button type="button" class="secondary td-reset-btn" disabled>重置</button>
              <button type="button" class="link-btn tid-export-btn" disabled>⬇ 导出</button>
            </div>
          </div>

          <div class="tid-scroll saa-scroll">
            <div class="saa-grid">
              <section class="tid-chart-panel saa-chart-panel">
                <div class="tid-mini-head"><h3 class="tid-mini-title">连接数趋势</h3></div>
                <div class="tid-chart-body tid-chart-body-stack saa-chart-body">
                  <span class="tid-yunit">Session#</span>
                  <div class="to-chart-plot saa-chart-plot"><v-chart class="saa-chart" :option="saaConnTrendOption" autoresize /></div>
                </div>
                <div class="dtt-chart-stats">
                  <span class="dtt-stat"><i class="dtt-stat-badge max">MAX</i>最大值 <strong>29874</strong></span>
                  <span class="dtt-stat"><i class="dtt-stat-badge min">MIN</i>最小值 <strong>315</strong></span>
                  <span class="dtt-stat"><i class="dtt-stat-badge avg">AVG</i>平均值 <strong>25935</strong></span>
                </div>
              </section>

              <section v-for="tbl in saaTables" :key="tbl.title" class="tid-mini-panel saa-table-panel">
                <div class="tid-mini-head"><h3 class="tid-mini-title">{{ tbl.title }}</h3></div>
                <div class="ou-table-wrap tid-mini-table-wrap saa-table-wrap">
                  <table class="ou-table tid-mini-table saa-table">
                    <thead><tr><th class="col-idx">序号</th><th class="col-ip">IP地址</th><th class="col-metric">总请求数</th><th class="col-fail">失败次数</th><th class="col-latency">平均时延</th></tr></thead>
                    <tbody>
                      <tr v-for="(r, i) in tbl.rows" :key="i"><td class="col-idx">{{ i + 1 }}</td><td class="col-ip"><span class="tid-link">{{ r.ip }}</span></td><td class="col-metric ou-num">{{ r.total }}</td><td class="col-fail"><div class="saa-fail-cell"><span class="saa-fail-bar" :style="{ '--saa-fail-pct': r.pct + '%' }"><i></i></span><span class="saa-fail-num ou-num">{{ r.fail }}</span></div></td><td class="col-latency" :class="{ 'ou-num': r.lat !== '—' }">{{ r.lat }}</td></tr>
                    </tbody>
                  </table>
                </div>
                <div class="ou-footer saa-mini-footer saa-mini-footer--stacked">
                  <div class="ou-footer-left"><div class="ou-pager"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn active" disabled>1</button><button type="button" class="ou-page-btn" disabled>2</button><button type="button" class="ou-page-btn" disabled>3</button><span class="ou-page-ellipsis">…</span><button type="button" class="ou-page-btn" disabled>{{ tbl.last }}</button><button type="button" class="ou-page-btn" disabled>›</button></div></div>
                  <div class="ou-footer-right"><span>共 {{ tbl.total }} 条</span></div>
                </div>
              </section>

              <section v-for="dl in saaDual" :key="dl.title" class="tid-chart-panel saa-chart-panel">
                <div class="saa-dual-head">
                  <h3 class="tid-mini-title">{{ dl.title }}</h3>
                  <div class="dtt-legend"><span class="dtt-legend-item"><i class="dtt-legend-dot" style="background:#5470c6"></i>时延</span><span class="dtt-legend-item"><i class="dtt-legend-dot" style="background:#fc8452"></i>抖动</span></div>
                </div>
                <div class="saa-dual-body">
                  <div class="saa-dual-yaxis"><span>ms</span><span>ms</span></div>
                  <div class="saa-dual-plot"><v-chart class="saa-dual-chart" :option="saaDualOption" autoresize /></div>
                </div>
                <div class="dtt-chart-stats saa-dual-stats">
                  <span class="saa-stat-group"><em class="saa-stat-tag">时延</em><span class="dtt-stat"><i class="dtt-stat-badge max">MAX</i>最大值 <strong>{{ dl.d[0] }}</strong></span><span class="dtt-stat"><i class="dtt-stat-badge min">MIN</i>最小值 <strong>{{ dl.d[1] }}</strong></span><span class="dtt-stat"><i class="dtt-stat-badge avg">AVG</i>平均值 <strong>{{ dl.d[2] }}</strong></span></span>
                  <span class="saa-stat-group"><em class="saa-stat-tag saa-stat-tag-jitter">抖动</em><span class="dtt-stat"><i class="dtt-stat-badge saa-badge-jitter max">MAX</i>最大值 <strong>{{ dl.j[0] }}</strong></span><span class="dtt-stat"><i class="dtt-stat-badge saa-badge-jitter min">MIN</i>最小值 <strong>{{ dl.j[1] }}</strong></span><span class="dtt-stat"><i class="dtt-stat-badge saa-badge-jitter avg">AVG</i>平均值 <strong>{{ dl.j[2] }}</strong></span></span>
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
              <label class="tdh-filter-field"><span class="ou-toolbar-label">MAC</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="" disabled /></label>
              <label class="tdh-filter-field"><select class="ou-toolbar-select" disabled><option selected>源IP</option></select><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="任意IP" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">源端口</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="80 / 8000-8080" disabled /></label>
              <label class="tdh-filter-field"><select class="ou-toolbar-select" disabled><option selected>目标IP</option></select><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="任意IP" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">目标端口</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="80 / 8000-8080" disabled /></label>
            </div>
            <div class="tdh-filter-row">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">传输协议</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">源IP ISP</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">目标IP ISP</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">源IP区域</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">目标IP区域</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
            </div>
            <div class="tdh-filter-row tdh-filter-row-actions">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">隧道类型</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">请求域名</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">链路</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
              <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" type="text" value="2026-06-13 19:18:34 - 2026-06-13 19:33:34" disabled /></label>
              <button type="button" class="ou-search-btn" disabled>搜索</button>
              <button type="button" class="secondary td-reset-btn" disabled>重置</button>
              <button type="button" class="link-btn tid-export-btn" disabled>⬇ 导出</button>
            </div>
          </div>

          <div class="tid-scroll sahd-scroll">
            <div class="tid-mid-grid sahd-mid-grid">
              <section v-for="c in sahdCharts" :key="c.k" class="tid-chart-panel">
                <div class="tid-chart-head">
                  <div class="tid-legend">
                    <span class="tid-legend-item"><i class="tid-legend-dot" style="background:#ee6666"></i>上行流量</span>
                    <span class="tid-legend-item"><i class="tid-legend-dot" style="background:#5470c6"></i>下行流量</span>
                    <span class="tid-legend-item"><i class="tid-legend-dot" style="background:#fac858"></i>连接数</span>
                  </div>
                </div>
                <div class="to-panel-chart sahd-combo-wrap">
                  <div class="to-combo-yaxis"><span>Bytes</span><span>Session#</span></div>
                  <div class="to-combo-plot sahd-combo-plot"><v-chart class="sahd-combo-chart" :option="sahdComboOption" autoresize /></div>
                </div>
                <div class="dtt-chart-stats sahd-chart-stats">
                  <span class="sahd-stat-group"><em class="sahd-stat-tag">总流量</em><span class="dtt-stat"><i class="dtt-stat-badge max">MAX</i>最大值 <strong>{{ c.t[0] }}</strong></span><span class="dtt-stat"><i class="dtt-stat-badge min">MIN</i>最小值 <strong>{{ c.t[1] }}</strong></span><span class="dtt-stat"><i class="dtt-stat-badge avg">AVG</i>平均值 <strong>{{ c.t[2] }}</strong></span></span>
                  <span class="sahd-stat-group"><em class="sahd-stat-tag sahd-stat-tag-conn">连接数</em><span class="dtt-stat"><i class="dtt-stat-badge sahd-badge-conn max">MAX</i>最大值 <strong>{{ c.n[0] }}</strong></span><span class="dtt-stat"><i class="dtt-stat-badge sahd-badge-conn min">MIN</i>最小值 <strong>{{ c.n[1] }}</strong></span><span class="dtt-stat"><i class="dtt-stat-badge sahd-badge-conn avg">AVG</i>平均值 <strong>{{ c.n[2] }}</strong></span></span>
                </div>
              </section>
            </div>

            <div class="tid-bottom-grid sahd-bottom-grid">
              <section v-for="mp in sahdMinis" :key="mp.title" class="tid-mini-panel">
                <div class="tid-mini-head"><h3 class="tid-mini-title">{{ mp.title }}</h3></div>
                <div class="ou-table-wrap tid-mini-table-wrap sahd-table-wrap">
                  <table class="ou-table tid-mini-table sahd-table">
                    <thead><tr><th class="col-idx">序号</th><th :class="mp.firstCol">{{ mp.firstLabel }}</th><th class="col-metric">请求数</th><th class="col-metric">上行</th><th class="col-metric">下行</th><th class="col-tunnel">隧道事件</th></tr></thead>
                    <tbody>
                      <tr v-for="(r, i) in mp.rows" :key="i"><td class="col-idx">{{ i + 1 }}</td><td :class="mp.firstCol"><span class="tid-link">{{ r[0] }}</span></td><td class="col-metric ou-num">{{ r[1] }}</td><td class="col-metric ou-num">{{ r[2] }}</td><td class="col-metric ou-num">{{ r[3] }}</td><td class="col-tunnel">{{ r[4] }}</td></tr>
                    </tbody>
                  </table>
                </div>
                <div class="ou-footer sahd-mini-footer sahd-mini-footer--stacked">
                  <div class="ou-footer-left"><div class="ou-pager"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn active" disabled>1</button><button type="button" class="ou-page-btn" disabled>›</button></div></div>
                  <div class="ou-footer-right"><span>共 {{ mp.total }} 条</span></div>
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
              <label class="tdh-filter-field"><span class="ou-toolbar-label">MAC</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="" disabled /></label>
              <label class="tdh-filter-field"><select class="ou-toolbar-select" disabled><option selected>源IP</option></select><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="任意IP" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">源端口</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="80 / 8000-8080" disabled /></label>
              <label class="tdh-filter-field"><select class="ou-toolbar-select" disabled><option selected>目标IP</option></select><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="任意IP" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">目标端口</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="80 / 8000-8080" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">传输协议</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
            </div>
            <div class="tdh-filter-row">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">请求域名</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">隧道类型</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">连接类型</span><select class="ou-toolbar-select" disabled><option selected>所有</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">条件关系</span><select class="ou-toolbar-select" disabled><option selected>与</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">应用协议</span><select class="ou-toolbar-select" disabled><option selected>任意协议</option></select></label>
            </div>
            <div class="tdh-filter-row tdh-filter-row-actions">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">用户组</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">用户名称</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">链路</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
              <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" type="text" value="2026-06-13 19:28:51 - 2026-06-13 19:43:51" disabled /></label>
              <button type="button" class="ou-search-btn" disabled>搜索</button>
              <button type="button" class="secondary td-reset-btn" disabled>重置</button>
            </div>
          </div>

          <div class="tdh-table-bar sahs-table-bar">
            <div class="td-toolbar-actions">
              <button type="button" class="td-icon-btn" disabled title="导出">⬇</button>
              <button type="button" class="td-icon-btn" disabled title="帮助">?</button>
              <button type="button" class="td-icon-btn" disabled title="列设置">☰</button>
              <button type="button" class="td-icon-btn" disabled title="视图切换">▦</button>
            </div>
          </div>

          <div class="ou-table-wrap sahs-table-wrap">
            <table class="ou-table sahs-table">
              <thead><tr><th class="col-check"><input type="checkbox" disabled /></th><th class="col-time">请求时间</th><th class="col-mac">MAC</th><th class="col-mac-vendor">MAC厂商</th><th class="col-user">用户名称</th><th class="col-endpoint">源IP</th><th class="col-endpoint">目标IP</th><th class="col-app-proto">应用协议</th><th class="col-geo">目标地理位置</th><th class="col-traffic">上行流量</th><th class="col-traffic">下行流量</th><th class="col-proto">传输协议</th><th class="col-tunnel">隧道类型</th><th class="col-domain">请求域名</th><th class="col-actions">操作</th></tr></thead>
              <tbody>
                <tr v-for="(r, i) in sahsRows" :key="i">
                  <td class="col-check"><input type="checkbox" disabled /></td>
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
                  <td class="col-actions"><button type="button" class="link-btn" disabled>数据包</button></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="ou-footer ou-footer-td sahs-footer">
            <div class="ou-footer-left"><div class="ou-pager"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn active" disabled>1</button><button type="button" class="ou-page-btn" disabled>2</button><button type="button" class="ou-page-btn" disabled>3</button><button type="button" class="ou-page-btn" disabled>4</button><button type="button" class="ou-page-btn" disabled>5</button><span class="ou-page-ellipsis">…</span><button type="button" class="ou-page-btn" disabled>19</button><button type="button" class="ou-page-btn" disabled>›</button></div></div>
            <div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页 <button type="button" class="ou-page-goto-btn" disabled>确定</button></label><span>共 1890 条</span><label class="ou-page-size"><select disabled><option selected>100 条/页</option></select></label></div>
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
import { LineChart, PieChart, BarChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'

use([CanvasRenderer, LineChart, PieChart, BarChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent])

const activeTab = ref('realtime-overview')
const tabs = [
  { key: 'realtime-overview', label: '实时概况' },
  { key: 'realtime-sessions', label: '实时会话' },
  { key: 'sensitive-apps', label: '敏感应用' },
  { key: 'history-diagnosis', label: '历史诊断' },
  { key: 'history-sessions', label: '历史会话' },
]

const sapRoMinis = [
  { title: '源IP', firstCol: 'col-ip', firstLabel: '源IP', lastPage: 7, total: 699, rows: [
    ['5.231.242.20', 4521, 12, '敏感协议'], ['81.177.6.131', 3892, 8, '敏感协议'], ['172.28.8.9', 2106, 3, 'VPN应用'],
    ['10.0.12.36', 1864, 5, '敏感协议'], ['192.168.1.18', 1520, 2, '远程应用'], ['101.6.68.247', 1288, 1, '敏感协议'],
    ['47.96.147.121', 986, 0, 'VPN协议'], ['223.5.5.5', 742, 1, '网络代理'],
  ] },
  { title: '目标IP', firstCol: 'col-ip', firstLabel: '目标IP', lastPage: 3, total: 270, rows: [
    ['101.6.8.149', 5210, 15, '敏感协议'], ['166.111.5.212', 4688, 9, '敏感协议'], ['101.6.4.100', 3124, 4, 'VPN应用'],
    ['202.205.184.10', 2456, 2, '敏感协议'], ['106.11.248.134', 1988, 3, '远程应用'], ['8.8.8.8', 1562, 1, '敏感协议'],
    ['114.114.114.114', 1124, 0, 'VPN协议'], ['111.203.29.114', 896, 2, '敏感协议'],
  ] },
  { title: '请求域名', firstCol: 'col-domain', firstLabel: '请求域名', lastPage: 1, total: 4, rows: [
    ['slapi.oray.net', 1862, 4, '远程应用'], ['raw.githubusercont...', 1248, 2, '敏感协议'],
    ['st.todesk.com', 986, 1, '远程应用'], ['update.example.com', 512, 0, 'VPN应用'],
  ] },
]

const sasRows = [
  { t: '2025-6-13/16:48:23', src: '213.209.159.233:31234', dst: '101.6.4.137:57322', up: '1.90 K', dn: '2.23 K' },
  { t: '2025-6-13/16:48:22', src: '81.177.6.131:42108', dst: '101.6.4.137:57323', up: '2.14 K', dn: '1.88 K' },
  { t: '2025-6-13/16:48:21', src: '5.231.242.20:53240', dst: '101.6.8.149:22', up: '3.02 K', dn: '2.56 K' },
  { t: '2025-6-13/16:48:20', src: '172.28.8.9:49822', dst: '101.6.15.67:22', up: '1.62 K', dn: '1.45 K' },
  { t: '2025-6-13/16:48:19', src: '10.0.12.36:52108', dst: '166.111.5.212:22', up: '2.48 K', dn: '2.12 K' },
  { t: '2025-6-13/16:48:18', src: '192.168.1.18:44312', dst: '101.6.28.183:22', up: '1.28 K', dn: '1.06 K' },
  { t: '2025-6-13/16:48:17', src: '101.6.68.247:38422', dst: '101.6.9.234:22', up: '4.16 K', dn: '3.82 K' },
  { t: '2025-6-13/16:48:16', src: '47.96.147.121:51234', dst: '202.205.184.10:22', up: '0.96 K', dn: '0.88 K' },
  { t: '2025-6-13/16:48:15', src: '223.5.5.5:60102', dst: '106.11.248.134:22', up: '2.72 K', dn: '2.34 K' },
  { t: '2025-6-13/16:48:14', src: '114.114.114.114:33445', dst: '111.203.29.114:22', up: '1.54 K', dn: '1.32 K' },
]

const saaTables = [
  { title: '请求源', last: 259, total: 25818, rows: [
    { ip: '101.6.4.137', total: 8521, fail: 128, pct: 100, lat: '45.20' },
    { ip: '172.28.8.9', total: 6210, fail: 86, pct: 67, lat: '38.60' },
    { ip: '5.231.242.20', total: 4892, fail: 64, pct: 50, lat: '—' },
    { ip: '81.177.6.131', total: 3560, fail: 42, pct: 33, lat: '52.10' },
    { ip: '10.0.12.36', total: 2108, fail: 18, pct: 14, lat: '41.30' },
    { ip: '192.168.1.18', total: 1864, fail: 12, pct: 9, lat: '—' },
  ] },
  { title: '请求目标', last: 22, total: 2133, rows: [
    { ip: '213.209.159.233', total: 4521, fail: 96, pct: 100, lat: '82.54' },
    { ip: '101.6.8.149', total: 3892, fail: 72, pct: 75, lat: '65.12' },
    { ip: '166.111.5.212', total: 2106, fail: 38, pct: 40, lat: '—' },
    { ip: '101.6.15.67', total: 1864, fail: 24, pct: 25, lat: '91.20' },
    { ip: '47.96.147.121', total: 1288, fail: 15, pct: 16, lat: '74.33' },
    { ip: '223.5.5.5', total: 986, fail: 8, pct: 8, lat: '—' },
  ] },
]

const saaDual = [
  { title: '客户时延', d: ['151', '78', '109'], j: ['9783', '567', '7337'] },
  { title: '服务时延', d: ['12', '0', '3'], j: ['7095', '0', '2868'] },
  { title: '应用时延', d: ['0', '0', '0'], j: ['0', '0', '0'] },
]

const sahdCharts = [
  { k: 'total', t: ['38.00 M', '8.00 M', '22.15 M'], n: [260, 70, 178] },
  { k: 'cat', t: ['66.00 M', '3.60 M', '22.05 M'], n: [268, 18, 89] },
]

const sahdMinis = [
  { title: '源IP', firstCol: 'col-ip', firstLabel: '源IP', total: 398, rows: [
    ['81.177.6.131', 1286, '4.82 M', '6.14 M', '敏感协议'], ['5.231.242.20', 986, '3.56 M', '4.28 M', '敏感协议'],
    ['172.28.8.9', 742, '2.18 M', '2.86 M', '敏感协议'], ['10.0.12.36', 628, '1.92 M', '2.44 M', '敏感协议'],
    ['101.6.4.137', 512, '1.46 M', '1.88 M', 'VPN应用'], ['192.168.1.18', 386, '1.12 M', '1.36 M', '远程应用'],
  ] },
  { title: '目标IP', firstCol: 'col-ip', firstLabel: '目标IP', total: 132, rows: [
    ['101.6.8.149', 892, '3.28 M', '4.12 M', '敏感协议'], ['101.6.15.67', 648, '2.46 M', '3.08 M', '敏感协议'],
    ['166.111.5.212', 512, '1.86 M', '2.42 M', '敏感协议'], ['101.6.15.130', 386, '1.24 M', '1.68 M', '敏感协议'],
    ['101.6.28.183', 268, '0.96 M', '1.22 M', '敏感协议'], ['202.205.184.10', 186, '0.68 M', '0.92 M', '敏感协议'],
  ] },
  { title: '目标域名', firstCol: 'col-domain', firstLabel: '目标域名', total: 2, rows: [
    ['raw.githubusercontent.com', 128, '0.86 M', '1.12 M', 'VPN应用'], ['st.todesk.com', 96, '0.52 M', '0.68 M', '远程应用'],
  ] },
]

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

const trendXData = ref(['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00'])

const roStackData = ref([
  { name: '远程应用', data: [120, 90, 70, 60, 50, 45, 80, 180, 220, 250] },
  { name: 'VPN应用', data: [80, 60, 45, 35, 30, 25, 50, 120, 150, 180] },
  { name: '网络代理', data: [60, 45, 35, 30, 25, 20, 40, 90, 110, 130] },
  { name: '敏感协议', data: [200, 150, 120, 100, 85, 75, 120, 280, 350, 420] },
  { name: 'VPN协议', data: [50, 35, 30, 25, 20, 18, 35, 80, 100, 120] },
])

const roStackOption = computed(() => ({
  tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#e4e7ed', borderWidth: 1, textStyle: { color: '#303133' }, padding: [10, 14], axisPointer: { type: 'shadow' } },
  grid: { left: '50', right: '20', top: '20', bottom: '35' },
  xAxis: { type: 'category', data: trendXData.value, axisLine: { lineStyle: { color: '#c8ccd0' } }, axisLabel: { fontSize: 11, color: '#909399' }, axisTick: { show: false } },
  yAxis: { type: 'value', axisLine: { show: false }, axisLabel: { fontSize: 11, color: '#909399' }, splitLine: { lineStyle: { color: '#f0f2f5', type: 'dashed' } } },
  series: roStackData.value.map((s, i) => ({
    name: s.name, type: 'bar', stack: 'total', data: s.data,
    itemStyle: { color: ['#5470c6', '#fac858', '#91cc75', '#ee6666', '#9a60b4'][i], borderRadius: [0, 0, 0, 0] },
  }))
}))

const roPieData = ref([
  { name: '敏感协议', value: 42, itemStyle: { color: '#ee6666' } },
  { name: '远程应用', value: 25, itemStyle: { color: '#5470c6' } },
  { name: 'VPN应用', value: 18, itemStyle: { color: '#fac858' } },
  { name: '网络代理', value: 10, itemStyle: { color: '#91cc75' } },
  { name: 'VPN协议', value: 5, itemStyle: { color: '#9a60b4' } },
])

const roPieOption = computed(() => ({
  tooltip: { trigger: 'item', backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#e4e7ed', borderWidth: 1, textStyle: { color: '#303133' }, padding: [10, 14], formatter: '{b}: {c}%' },
  legend: { orient: 'vertical', right: '5%', top: 'center', textStyle: { fontSize: 12, color: '#606266' }, itemWidth: 12, itemHeight: 8 },
  series: [{
    name: '隧道类型', type: 'pie', radius: ['45%', '75%'], center: ['35%', '50%'],
    avoidLabelOverlap: true, itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
    label: { show: true, position: 'inside', fontSize: 11, fontWeight: 600, color: '#fff', formatter: '{d}%' },
    emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
    labelLine: { show: false },
    data: roPieData.value,
  }]
}))

const saaConnTrendData = ref([
  { name: '连接数', data: [150, 120, 100, 85, 75, 70, 100, 220, 280, 320] },
])

const saaConnTrendOption = computed(() => ({
  tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#e4e7ed', borderWidth: 1, textStyle: { color: '#303133' }, padding: [10, 14] },
  grid: { left: '50', right: '20', top: '10', bottom: '35' },
  xAxis: { type: 'category', data: trendXData.value, axisLine: { lineStyle: { color: '#c8ccd0' } }, axisLabel: { fontSize: 11, color: '#909399' }, axisTick: { show: false } },
  yAxis: { type: 'value', axisLine: { show: false }, axisLabel: { fontSize: 11, color: '#909399' }, splitLine: { lineStyle: { color: '#f0f2f5', type: 'dashed' } } },
  series: saaConnTrendData.value.map((s, i) => ({
    name: s.name, type: 'line', smooth: true, data: s.data,
    lineStyle: { width: 2, color: '#409eff' },
    itemStyle: { color: '#409eff' },
    areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(64,158,255,0.2)' }, { offset: 1, color: 'rgba(64,158,255,0.02)' }] } },
    symbol: 'circle', symbolSize: 6,
  }))
}))

const saaDualOption = computed(() => ({
  tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#e4e7ed', borderWidth: 1, textStyle: { color: '#303133' }, padding: [10, 14] },
  grid: { left: '60', right: '30', top: '20', bottom: '35' },
  xAxis: { type: 'category', data: trendXData.value, axisLine: { lineStyle: { color: '#c8ccd0' } }, axisLabel: { fontSize: 11, color: '#909399' }, axisTick: { show: false } },
  yAxis: [
    { type: 'value', name: '时延(ms)', position: 'left', axisLine: { show: false }, axisLabel: { fontSize: 11, color: '#5470c6' }, splitLine: { show: false } },
    { type: 'value', name: '抖动(ms)', position: 'right', axisLine: { show: false }, axisLabel: { fontSize: 11, color: '#fc8452' }, splitLine: { lineStyle: { color: '#f0f2f5', type: 'dashed' } } },
  ],
  series: [
    { name: '时延', type: 'line', smooth: true, data: [85, 78, 92, 88, 95, 82, 88, 105, 115, 109], yAxisIndex: 0, lineStyle: { width: 2, color: '#5470c6' }, itemStyle: { color: '#5470c6' }, symbol: 'circle', symbolSize: 6 },
    { name: '抖动', type: 'line', smooth: true, data: [6500, 5670, 7200, 6800, 7800, 6200, 6900, 8500, 9200, 7500], yAxisIndex: 1, lineStyle: { width: 2, color: '#fc8452' }, itemStyle: { color: '#fc8452' }, symbol: 'circle', symbolSize: 6 },
  ]
}))

const sahdComboOption = computed(() => ({
  tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#e4e7ed', borderWidth: 1, textStyle: { color: '#303133' }, padding: [10, 14] },
  grid: { left: '60', right: '30', top: '20', bottom: '35' },
  xAxis: { type: 'category', data: trendXData.value, axisLine: { lineStyle: { color: '#c8ccd0' } }, axisLabel: { fontSize: 11, color: '#909399' }, axisTick: { show: false } },
  yAxis: [
    { type: 'value', name: '流量(Bytes)', position: 'left', axisLine: { show: false }, axisLabel: { fontSize: 11, color: '#606266' }, splitLine: { lineStyle: { color: '#f0f2f5', type: 'dashed' } } },
    { type: 'value', name: '连接数', position: 'right', axisLine: { show: false }, axisLabel: { fontSize: 11, color: '#fac858' }, splitLine: { show: false } },
  ],
  series: [
    { name: '上行流量', type: 'bar', data: [80, 65, 55, 45, 40, 35, 55, 120, 160, 190], itemStyle: { color: '#ee6666', borderRadius: [4, 4, 0, 0] } },
    { name: '下行流量', type: 'bar', data: [120, 95, 80, 65, 55, 50, 80, 180, 240, 280], itemStyle: { color: '#5470c6', borderRadius: [4, 4, 0, 0] } },
    { name: '连接数', type: 'line', smooth: true, data: [120, 95, 80, 65, 55, 50, 85, 190, 250, 290], yAxisIndex: 1, lineStyle: { width: 2, color: '#fac858' }, itemStyle: { color: '#fac858' }, symbol: 'circle', symbolSize: 6 },
  ]
}))
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
.sahd-mid-grid { grid-template-columns:repeat(2, minmax(0,1fr)); }
.sahd-combo-wrap { padding:0 6px 4px; }
.sahd-combo-plot { min-height:180px; }
.to-combo-yaxis { display:flex; justify-content:space-between; padding:6px 6px 0; font-size:11px; color:#909399; }
.sahd-chart-stats { flex-direction:column; align-items:flex-start; gap:8px; }
.sahd-stat-group { display:flex; flex-wrap:wrap; align-items:center; gap:8px 16px; }
.sahd-stat-tag { font-style:normal; font-size:12px; font-weight:600; color:#5470c6; min-width:42px; }
.sahd-stat-tag-conn { color:#fac858; }
.dtt-stat-badge.sahd-badge-conn.max { background:#fac858; color:#333; }
.dtt-stat-badge.sahd-badge-conn.min { background:#ffe58f; color:#333; }
.dtt-stat-badge.sahd-badge-conn.avg { background:#ffd666; color:#333; }
.sahd-table .col-tunnel { width:80px; font-size:12px; }
.sahd-table-wrap { max-height:220px; }
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

@media (max-width:1400px) { .saa-grid { grid-template-columns:repeat(2, minmax(0,1fr)); } }
@media (max-width:1200px) {
  .tid-mid-grid, .tid-bottom-grid, .sahd-mid-grid { grid-template-columns:1fr; }
}
@media (max-width:960px) { .saa-grid { grid-template-columns:1fr; } }
</style>
