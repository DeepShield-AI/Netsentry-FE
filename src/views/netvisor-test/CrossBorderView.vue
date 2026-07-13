<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav nv-tabs-nav-wrap" role="tablist" aria-label="跨境监测">
        <button v-for="t in tabs" :key="t.key" type="button" class="nv-tab" :class="{ active: activeTab === t.key }" role="tab" :aria-selected="activeTab === t.key" @click="activeTab = t.key">{{ t.label }}</button>
      </div>
    </div>
    <div class="nv-tabs-body">

      <!-- 1. 实时概况 -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'realtime-overview' }">
        <div class="tid-page">
          <div class="tdh-filters">
            <div class="tdh-filter-row">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">分析模型</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">疑似度</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">请求数&gt;=</span><input class="ou-toolbar-input tdh-filter-input" type="text" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">链路</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
              <button type="button" class="ou-search-btn" disabled>搜索</button>
              <button type="button" class="secondary td-reset-btn" disabled>重置</button>
              <div class="tio-range-btns" style="margin-left:auto"><button class="tio-range-btn active" disabled>IPv4</button><button class="tio-range-btn" disabled>IPv6</button></div>
            </div>
          </div>
          <div class="cbm-scroll">
            <div class="cbm-mid-grid">
              <section class="tid-chart-panel">
                <div class="tid-chart-head" style="justify-content:space-between">
                  <div class="tid-legend">
                    <span class="tid-legend-item"><i class="tid-legend-dot" style="background:#5470c6"></i>基于VPN协议</span>
                    <span class="tid-legend-item"><i class="tid-legend-dot" style="background:#fac858"></i>基于VPN应用</span>
                    <span class="tid-legend-item"><i class="tid-legend-dot" style="background:#91cc75"></i>基于网络代理</span>
                    <span class="tid-legend-item"><i class="tid-legend-dot" style="background:#ee6666"></i>基于跨境监测情报</span>
                  </div>
                  <div class="tio-range-btns"><button class="tio-range-btn active" disabled>日</button><button class="tio-range-btn" disabled>周</button><button class="tio-range-btn" disabled>月</button></div>
                </div>
                <div class="tid-chart-body"><span class="tid-yunit">#Session</span><div class="to-chart-plot"><v-chart class="cbm-trend-chart" :option="cbmTrendOption" autoresize /></div></div>
                <div class="dtt-chart-stats"><span class="dtt-stat"><i class="dtt-stat-badge max">MAX</i>最大值 <strong>81</strong></span><span class="dtt-stat"><i class="dtt-stat-badge min">MIN</i>最小值 <strong>1</strong></span><span class="dtt-stat"><i class="dtt-stat-badge avg">AVG</i>平均值 <strong>16</strong></span></div>
              </section>
              <section class="tid-chart-panel">
                <div class="tid-chart-head"><h3 class="tid-mini-title">类型分布</h3></div>
                <div class="tid-chart-body"><div class="to-chart-plot"><v-chart class="cbm-pie-chart" :option="cbmPieOption" autoresize /></div></div>
              </section>
            </div>

            <div class="cbm-bottom-grid">
              <section class="tid-mini-panel">
                <div class="tid-mini-head"><h3 class="tid-mini-title">源IP</h3><button class="tid-expand-btn" disabled>⛶</button></div>
                <div class="ou-table-wrap tid-mini-table-wrap">
                  <table class="ou-table tid-mini-table">
                    <thead><tr><th class="col-idx">序号</th><th>源IP</th><th>用户名</th><th class="ou-num">请求数</th><th class="ou-num">流量</th><th>分析模型</th></tr></thead>
                    <tbody><tr v-for="(r,i) in cbmRoSrc" :key="i"><td class="col-idx">{{ i+1 }}</td><td><span class="tid-link">{{ r[0] }}</span></td><td>—</td><td class="ou-num">{{ r[1] }}</td><td class="ou-num">{{ r[2] }}</td><td>{{ r[3] }}</td></tr></tbody>
                  </table>
                </div>
                <div class="ou-footer"><div class="ou-pager"><button class="ou-page-btn" disabled>‹</button><button class="ou-page-btn active" disabled>1</button><button class="ou-page-btn" disabled>2</button><button class="ou-page-btn" disabled>3</button><span class="ou-page-ellipsis">…</span><button class="ou-page-btn" disabled>140</button><button class="ou-page-btn" disabled>›</button></div><span>共 13902 条</span></div>
              </section>
              <section class="tid-mini-panel">
                <div class="tid-mini-head"><h3 class="tid-mini-title">目标IP</h3><button class="tid-expand-btn" disabled>⛶</button></div>
                <div class="ou-table-wrap tid-mini-table-wrap">
                  <table class="ou-table tid-mini-table">
                    <thead><tr><th class="col-idx">序号</th><th>目标IP</th><th class="ou-num">请求数</th><th class="ou-num">流量</th><th>分析模型</th></tr></thead>
                    <tbody><tr v-for="(r,i) in cbmRoDst" :key="i"><td class="col-idx">{{ i+1 }}</td><td><span class="tid-link">{{ r[0] }}</span></td><td class="ou-num">{{ r[1] }}</td><td class="ou-num">{{ r[2] }}</td><td>{{ r[3] }}</td></tr></tbody>
                  </table>
                </div>
                <div class="ou-footer"><div class="ou-pager"><button class="ou-page-btn" disabled>‹</button><button class="ou-page-btn active" disabled>1</button><button class="ou-page-btn" disabled>›</button></div><span>共 53 条</span></div>
              </section>
              <section class="tid-mini-panel">
                <div class="tid-mini-head"><h3 class="tid-mini-title">请求域名</h3><button class="tid-expand-btn" disabled>⛶</button></div>
                <div class="ou-table-wrap tid-mini-table-wrap">
                  <table class="ou-table tid-mini-table">
                    <thead><tr><th class="col-idx">序号</th><th>请求域名</th><th class="ou-num">请求数</th><th class="ou-num">流量</th><th>分析模型</th></tr></thead>
                    <tbody><tr v-for="(r,i) in cbmRoDom" :key="i"><td class="col-idx">{{ i+1 }}</td><td><span class="tid-link dt-ellipsis">{{ r[0] }}</span></td><td class="ou-num">{{ r[1] }}</td><td class="ou-num">{{ r[2] }}</td><td>{{ r[3] }}</td></tr></tbody>
                  </table>
                </div>
                <div class="ou-footer"><div class="ou-pager"><button class="ou-page-btn" disabled>‹</button><button class="ou-page-btn active" disabled>1</button><button class="ou-page-btn" disabled>›</button></div><span>共 7 条</span></div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. 实时会话 -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'realtime-sessions' }">
        <div class="tdh-filters">
          <div class="tdh-filter-row">
            <label class="tdh-filter-field"><select class="ou-toolbar-select" disabled><option>源IP</option></select><input class="ou-toolbar-input tdh-filter-input" placeholder="任意IP" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">源端口</span><input class="ou-toolbar-input tdh-filter-input" placeholder="80 / 8000-8080" disabled /></label>
            <label class="tdh-filter-field"><select class="ou-toolbar-select" disabled><option>目标IP</option></select><input class="ou-toolbar-input tdh-filter-input" placeholder="任意IP" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">目标端口</span><input class="ou-toolbar-input tdh-filter-input" placeholder="80 / 8000-8080" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">应用协议</span><input class="ou-toolbar-input tdh-filter-input" placeholder="任意协议" disabled /></label>
            <div class="tio-range-btns"><button class="tio-range-btn active" disabled>IPv4</button><button class="tio-range-btn" disabled>IPv6</button></div>
          </div>
          <div class="tdh-filter-row">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">MAC</span><input class="ou-toolbar-input tdh-filter-input" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">传输协议</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">疑似度</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">域名</span><input class="ou-toolbar-input tdh-filter-input" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">用户名称</span><input class="ou-toolbar-input tdh-filter-input" disabled /></label>
          </div>
          <div class="tdh-filter-row">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">分析模型</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">协议类型</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">链路</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
            <button class="ou-search-btn" disabled>搜索</button>
            <button class="secondary td-reset-btn" disabled>重置</button>
            <button class="td-icon-btn" disabled>⚙</button>
          </div>
        </div>
        <div class="ou-table-wrap">
          <table class="ou-table cbm-rs-table">
            <thead><tr><th class="col-idx">序号</th><th>时间</th><th>MAC</th><th>MAC厂商</th><th>用户名称</th><th>源IP</th><th>目标IP</th><th>传输协议</th><th>协议类型</th><th>协议名称</th><th>地理位置</th><th>上行流量</th><th>下行流量</th><th>域名</th><th>链路</th><th>疑似度</th><th>分析模型</th><th class="col-actions">操作</th></tr></thead>
            <tbody>
              <tr v-for="(r,i) in cbmRs" :key="i">
                <td class="col-idx">{{ i+1 }}</td><td>{{ r.t }}</td><td>{{ r.mac }}</td><td><span class="dt-ellipsis" style="max-width:100px">{{ r.vendor }}</span></td><td>—</td><td>{{ r.src }}</td><td>{{ r.dst }}</td><td>{{ r.proto }}</td><td>—</td><td>{{ r.protoName }}</td><td>🇨🇳 北京|</td><td class="ou-num">{{ r.up }}</td><td class="ou-num">{{ r.down }}</td><td>—</td><td>—</td><td><span class="cbm-suspect-badge cbm-suspect-high">高</span></td><td>基于VPN应用</td><td class="col-actions"><button class="link-btn" disabled>数据包</button></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="ou-footer">
          <div class="ou-footer-left"><div class="ou-pager"><button class="ou-page-btn" disabled>‹</button><button class="ou-page-btn active" disabled>1</button><button class="ou-page-btn" disabled>2</button><button class="ou-page-btn" disabled>3</button><button class="ou-page-btn" disabled>4</button><button class="ou-page-btn" disabled>5</button><span class="ou-page-ellipsis">…</span><button class="ou-page-btn" disabled>189</button><button class="ou-page-btn" disabled>›</button></div></div>
          <div class="ou-footer-right"><label class="ou-page-goto">到第 <input class="ou-page-goto-input" value="1" disabled /> 页 <button class="ou-page-goto-btn" disabled>确定</button></label><span>共 18839 条</span><label class="ou-page-size"><select disabled><option>100 条/页</option></select></label></div>
        </div>
      </div>

      <!-- 3. 模型概况 -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'model-overview' }">
        <div class="tid-page">
          <div class="tdh-filters">
            <div class="tdh-filter-row">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">MAC</span><input class="ou-toolbar-input tdh-filter-input" disabled /></label>
              <label class="tdh-filter-field"><select class="ou-toolbar-select" disabled><option>源IP</option></select><input class="ou-toolbar-input tdh-filter-input" placeholder="任意IP" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">源端口</span><input class="ou-toolbar-input tdh-filter-input" disabled /></label>
              <label class="tdh-filter-field"><select class="ou-toolbar-select" disabled><option>目标IP</option></select><input class="ou-toolbar-input tdh-filter-input" placeholder="任意IP" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">目标端口</span><input class="ou-toolbar-input tdh-filter-input" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">传输协议</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
            </div>
            <div class="tdh-filter-row">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">域名</span><input class="ou-toolbar-input tdh-filter-input" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">请求数&gt;=</span><input class="ou-toolbar-input tdh-filter-input" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">目标IP区域</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">链路</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
              <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" value="2026-06-13 22:41:44 - 2026-06-13 22:56:44" disabled /></label>
              <button class="ou-search-btn" disabled>搜索</button>
              <button class="secondary td-reset-btn" disabled>重置</button>
            </div>
          </div>
          <div class="cbm-scroll">
            <div class="cbm-mid-grid">
              <section class="tid-chart-panel"><div class="tid-chart-head"><h3 class="tid-mini-title">趋势</h3></div><div class="tid-chart-body"><div class="to-chart-plot"><div class="to-chart-placeholder">趋势图占位</div></div></div></section>
              <section class="tid-chart-panel"><div class="tid-chart-head"><h3 class="tid-mini-title">类型分布</h3></div><div class="tid-chart-body"><div class="to-chart-plot"><v-chart class="cbm-pie-chart" :option="cbmPieOption" autoresize /></div></div></section>
            </div>
            <div class="cbm-bottom-grid">
              <section class="tid-mini-panel">
                <div class="tid-mini-head"><h3 class="tid-mini-title">请求用户数:<em class="cbm-count">26</em></h3><button class="tid-expand-btn" disabled>⛶</button></div>
                <div class="ou-table-wrap tid-mini-table-wrap"><table class="ou-table tid-mini-table"><thead><tr><th class="col-idx">序号</th><th>源IP</th><th>用户</th><th class="ou-num">请求数</th><th class="ou-num">失败数</th><th class="ou-num">流量</th><th>分析模型</th></tr></thead><tbody><tr v-for="(r,i) in cbmModelUsers" :key="i"><td class="col-idx">{{ r[0] }}</td><td><span class="tid-link">{{ r[1] }}</span></td><td>{{ r[2] }}</td><td class="ou-num">{{ r[3] }}</td><td class="ou-num">{{ r[4] }}</td><td class="ou-num">{{ r[5] }}</td><td>{{ r[6] }}</td></tr></tbody></table></div>
              </section>
              <section class="tid-mini-panel">
                <div class="tid-mini-head"><h3 class="tid-mini-title">目标节点数:<em class="cbm-count">8</em> <span class="cbm-sub-title">国外节点数:<em class="cbm-count">3</em></span></h3><button class="tid-expand-btn" disabled>⛶</button></div>
                <div class="ou-table-wrap tid-mini-table-wrap"><table class="ou-table tid-mini-table"><thead><tr><th class="col-idx">序号</th><th>目标IP</th><th>位置</th><th class="ou-num">请求数</th><th class="ou-num">失败数</th><th class="ou-num">流量</th><th>分析模型</th></tr></thead><tbody><tr v-for="(r,i) in cbmModelNodes" :key="i"><td class="col-idx">{{ r[0] }}</td><td><span class="tid-link">{{ r[1] }}</span></td><td>{{ r[2] }}</td><td class="ou-num">{{ r[3] }}</td><td class="ou-num">{{ r[4] }}</td><td class="ou-num">{{ r[5] }}</td><td>{{ r[6] }}</td></tr></tbody></table></div>
              </section>
              <section class="tid-mini-panel">
                <div class="tid-mini-head"><h3 class="tid-mini-title">节点域名数:<em class="cbm-count">1</em></h3><button class="tid-expand-btn" disabled>⛶</button></div>
                <div class="ou-table-wrap tid-mini-table-wrap"><table class="ou-table tid-mini-table"><thead><tr><th class="col-idx">序号</th><th>目标域名</th><th class="ou-num">请求数</th><th class="ou-num">失败数</th><th class="ou-num">流量</th><th>分析模型</th></tr></thead><tbody><tr v-for="(r,i) in cbmModelDomains" :key="i"><td class="col-idx">{{ r[0] }}</td><td><span class="tid-link">{{ r[1] }}</span></td><td class="ou-num">{{ r[2] }}</td><td class="ou-num">{{ r[3] }}</td><td class="ou-num">{{ r[4] }}</td><td>{{ r[5] }}</td></tr></tbody></table></div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. VPN应用 -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'vpn-apps' }">
        <div class="tid-page">
          <div class="tdh-filters">
            <div class="tdh-filter-row">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">MAC</span><input class="ou-toolbar-input tdh-filter-input" disabled /></label>
              <label class="tdh-filter-field"><select class="ou-toolbar-select" disabled><option>源IP</option></select><input class="ou-toolbar-input tdh-filter-input" placeholder="任意IP" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">源端口</span><input class="ou-toolbar-input tdh-filter-input" disabled /></label>
              <label class="tdh-filter-field"><select class="ou-toolbar-select" disabled><option>目标IP</option></select><input class="ou-toolbar-input tdh-filter-input" placeholder="任意IP" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">目标端口</span><input class="ou-toolbar-input tdh-filter-input" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">应用协议</span><input class="ou-toolbar-input tdh-filter-input" placeholder="任意协议" disabled /></label>
            </div>
            <div class="tdh-filter-row">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">域名</span><input class="ou-toolbar-input tdh-filter-input" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">请求数&gt;=</span><input class="ou-toolbar-input tdh-filter-input" disabled /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">目标IP区域</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">链路</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
              <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" value="2026-06-13 22:41:44 - 2026-06-13 22:56:44" disabled /></label>
              <button class="ou-search-btn" disabled>搜索</button>
              <button class="secondary td-reset-btn" disabled>重置</button>
            </div>
          </div>
          <div class="cbm-scroll">
            <div class="cbm-mid-grid">
              <section class="tid-chart-panel"><div class="tid-chart-head"><h3 class="tid-mini-title">趋势</h3></div><div class="tid-chart-body"><div class="to-chart-plot"><div class="to-chart-placeholder">趋势图占位</div></div></div></section>
              <section class="tid-chart-panel"><div class="tid-chart-head"><h3 class="tid-mini-title">类型分布</h3></div><div class="tid-chart-body"><div class="to-chart-plot"><v-chart class="cbm-pie-chart" :option="cbmPieOption" autoresize /></div></div></section>
            </div>
            <div class="cbm-bottom-grid">
              <section class="tid-mini-panel">
                <div class="tid-mini-head"><h3 class="tid-mini-title">应用数:<em class="cbm-count">4</em></h3><button class="tid-expand-btn" disabled>⛶</button></div>
                <div class="ou-table-wrap tid-mini-table-wrap"><table class="ou-table tid-mini-table"><thead><tr><th class="col-idx">序号</th><th>应用名称</th><th class="ou-num">请求数</th><th class="ou-num">流量</th></tr></thead><tbody><tr><td colspan="4" class="ou-empty">无数据</td></tr></tbody></table></div>
              </section>
              <section class="tid-mini-panel">
                <div class="tid-mini-head"><h3 class="tid-mini-title">目标节点数:<em class="cbm-count">8</em> <span class="cbm-sub-title">国外节点数:<em class="cbm-count">3</em></span></h3><button class="tid-expand-btn" disabled>⛶</button></div>
                <div class="ou-table-wrap tid-mini-table-wrap"><table class="ou-table tid-mini-table"><thead><tr><th class="col-idx">序号</th><th>目标IP</th><th>位置</th><th class="ou-num">请求数</th><th class="ou-num">流量</th></tr></thead><tbody><tr><td colspan="5" class="ou-empty">无数据</td></tr></tbody></table></div>
              </section>
              <section class="tid-mini-panel">
                <div class="tid-mini-head"><h3 class="tid-mini-title">节点域名数:<em class="cbm-count">1</em></h3><button class="tid-expand-btn" disabled>⛶</button></div>
                <div class="ou-table-wrap tid-mini-table-wrap"><table class="ou-table tid-mini-table"><thead><tr><th class="col-idx">序号</th><th>目标域名</th><th class="ou-num">请求数</th><th class="ou-num">流量</th></tr></thead><tbody><tr><td colspan="4" class="ou-empty">无数据</td></tr></tbody></table></div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <!-- 5. 历史会话 -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'history-sessions' }">
        <div class="tdh-filters">
          <div class="tdh-filter-row">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">MAC</span><input class="ou-toolbar-input tdh-filter-input" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">用户IP</span><input class="ou-toolbar-input tdh-filter-input" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">用户端口</span><input class="ou-toolbar-input tdh-filter-input" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">节点IP</span><input class="ou-toolbar-input tdh-filter-input" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">节点端口</span><input class="ou-toolbar-input tdh-filter-input" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">传输协议</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
          </div>
          <div class="tdh-filter-row">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">域名</span><input class="ou-toolbar-input tdh-filter-input" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">应用协议</span><input class="ou-toolbar-input tdh-filter-input" disabled /></label>
            <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" value="2026-06-13 22:41:44 - 2026-06-13 22:56:44" disabled /></label>
            <button class="ou-search-btn" disabled>搜索</button>
            <button class="secondary td-reset-btn" disabled>重置</button>
          </div>
        </div>
        <div class="ou-table-wrap">
          <table class="ou-table cbm-rs-table">
            <thead><tr><th class="col-check"><input type="checkbox" disabled /></th><th>请求时间</th><th>MAC</th><th>MAC厂商</th><th>用户名称</th><th>用户IP</th><th>节点IP</th><th>目标地理位置</th><th>传输协议</th><th>协议名称</th><th>上行流量</th><th>下行流量</th><th>总流量</th><th>协议类型</th><th>域名</th><th>链路</th><th>疑似度</th><th>分析模型</th><th class="col-actions">操作</th></tr></thead>
            <tbody><tr><td colspan="19" class="ou-empty">无数据</td></tr></tbody>
          </table>
        </div>
      </div>

      <!-- 6. 账号统计 -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'account-stats' }">
        <div class="tdh-filters">
          <div class="tdh-filter-row">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">MAC</span><input class="ou-toolbar-input tdh-filter-input" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">应用协议</span><input class="ou-toolbar-input tdh-filter-input" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">分析模型</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">目标IP区域</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">用户名称</span><input class="ou-toolbar-input tdh-filter-input" disabled /></label>
          </div>
          <div class="tdh-filter-row">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">域名</span><input class="ou-toolbar-input tdh-filter-input" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">敏感网站</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">链路</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
            <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" value="2026-06-13 22:41:44 - 2026-06-13 22:56:44" disabled /></label>
            <button class="ou-search-btn" disabled>搜索</button>
            <button class="secondary td-reset-btn" disabled>重置</button>
          </div>
        </div>
        <div class="ou-table-wrap">
          <table class="ou-table cbm-rs-table">
            <thead><tr><th style="width:40px">详情</th><th class="col-idx">序号</th><th>用户名称</th><th>用户IP</th><th class="ou-num">访问次数</th><th class="ou-num">访问频率</th><th>流量行为</th><th class="ou-num">上行流量</th><th class="ou-num">下行流量</th><th class="ou-num">总流量</th><th>VPN伪装/通信域名</th><th>分析模型</th><th>链路</th><th>应用场景</th></tr></thead>
            <tbody><tr><td colspan="14" class="ou-empty">无数据</td></tr></tbody>
          </table>
        </div>
      </div>

      <!-- 7. IP统计 -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'ip-stats' }">
        <div class="tdh-filters">
          <div class="tdh-filter-row">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">用户IP</span><input class="ou-toolbar-input tdh-filter-input" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">节点IP</span><input class="ou-toolbar-input tdh-filter-input" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">节点端口</span><input class="ou-toolbar-input tdh-filter-input" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">应用协议</span><input class="ou-toolbar-input tdh-filter-input" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">用户名称</span><input class="ou-toolbar-input tdh-filter-input" disabled /></label>
          </div>
          <div class="tdh-filter-row">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">条件关系</span><select class="ou-toolbar-select" disabled><option>与</option><option>或</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">用户组</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">访问频次</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
            <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" value="2026-06-13 22:41:44 - 2026-06-13 22:56:44" disabled /></label>
            <button class="ou-search-btn" disabled>搜索</button>
            <button class="secondary td-reset-btn" disabled>重置</button>
          </div>
        </div>
        <div class="ou-table-wrap">
          <table class="ou-table cbm-rs-table">
            <thead><tr><th style="width:40px">详情</th><th class="col-idx">序号</th><th>用户IP</th><th>用户名称</th><th>外部代理节点</th><th>VPN代理端口</th><th>VPN伪装/通信域名</th><th>协议类型</th><th class="ou-num">访问次数</th><th class="ou-num">访问频率</th><th>流量行为</th><th class="ou-num">上行流量</th><th class="ou-num">下行流量</th><th class="ou-num">总流量</th><th>应用协议</th><th>应用场景</th><th>链路</th><th class="col-actions">操作</th></tr></thead>
            <tbody><tr><td colspan="18" class="ou-empty">无数据</td></tr></tbody>
          </table>
        </div>
      </div>

      <!-- 8. VPS节点 -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'vps-nodes' }">
        <div class="tdh-filters">
          <div class="tdh-filter-row">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">节点IP</span><select class="ou-toolbar-select" disabled><option>任意IP</option></select><input class="ou-toolbar-input tdh-filter-input" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">节点端口</span><input class="ou-toolbar-input tdh-filter-input" placeholder="80 / 8000-8080" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">协议类型</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">用户名称</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">敏感网站</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
          </div>
          <div class="tdh-filter-row">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">目标节点区域</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">域名</span><input class="ou-toolbar-input tdh-filter-input" disabled /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">链路</span><select class="ou-toolbar-select" disabled><option>任意</option></select></label>
            <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" value="2026-06-13 22:41:44 - 2026-06-13 22:56:44" disabled /></label>
            <button class="ou-search-btn" disabled>搜索</button>
            <button class="secondary td-reset-btn" disabled>重置</button>
          </div>
        </div>
        <div class="ou-table-wrap">
          <table class="ou-table cbm-rs-table">
            <thead><tr><th class="col-idx">序号</th><th>外部代理节点</th><th>节点地理位置</th><th>VPN代理端口</th><th>VPN伪装/通信域名</th><th>协议类型</th><th class="ou-num">访问次数</th><th class="ou-num">访问频率</th><th class="ou-num">上行流量</th><th class="ou-num">下行流量</th><th class="ou-num">总流量</th><th>用户名称</th><th class="col-actions">操作</th></tr></thead>
            <tbody><tr><td colspan="13" class="ou-empty">无数据</td></tr></tbody>
          </table>
        </div>
      </div>

      <!-- 9. 跨境阻断 -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'cross-border-block' }">
        <div class="cbm-cb-page">
          <aside class="cbm-cb-sidebar">
            <div class="cbm-cb-sidebar-head">
              <span class="cbm-cb-sidebar-title"><span class="cbm-cb-sidebar-icon">▦</span> 设备</span>
              <button type="button" class="cbm-cb-add-btn" disabled title="添加设备">+</button>
            </div>
            <div class="cbm-cb-sidebar-body"><p class="ou-empty" style="padding:24px">暂无设备</p></div>
          </aside>
          <div class="cbm-cb-main"><p class="ou-empty" style="padding:48px">请从左侧选择设备</p></div>
        </div>
      </div>

      <!-- 10. 参数配置 -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'param-config' }">
        <div class="cbm-pc-page">
          <div class="cbm-pc-subtabs-header">
            <div class="cbm-pc-subtabs" role="tablist">
              <button v-for="s in pcSubtabs" :key="s" type="button" class="cbm-pc-subtab" :class="{ active: pcActive === s }" @click="pcActive = s">{{ s }}</button>
            </div>
          </div>
          <div class="ou-table-wrap">
            <table class="ou-table cbm-rs-table">
              <thead><tr><th class="col-idx">序号</th><th>分析模型</th><th>疑似度</th><th class="ou-num">命中次数</th><th class="ou-num">白名单次数</th><th>最后更新时间</th><th>最近2小时匹配趋势</th><th>量程</th><th>告警通知</th><th>匹配港澳台</th><th>匹配国外</th><th>监测</th><th>自动阻断</th><th class="col-actions">操作</th></tr></thead>
              <tbody><tr><td colspan="14" class="ou-empty">无数据</td></tr></tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 11. 白名单 -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'whitelist' }">
        <div class="ou-toolbar" style="justify-content:space-between">
          <div style="display:flex;gap:8px 12px;flex-wrap:wrap;align-items:center">
            <div class="ou-toolbar-item"><span class="ou-toolbar-label">类型</span><select class="ou-toolbar-select" disabled><option>任意</option></select></div>
            <input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled />
            <button class="ou-search-btn" disabled>搜索</button>
            <button class="secondary td-reset-btn" disabled>重置</button>
          </div>
          <div style="display:flex;gap:12px">
            <button class="link-btn" disabled>+ 添加</button>
            <button class="link-btn" disabled>批量删除</button>
            <button class="link-btn" disabled>清空</button>
            <button class="link-btn" disabled>导入</button>
            <button class="link-btn" disabled>导出</button>
          </div>
        </div>
        <div class="ou-table-wrap">
          <table class="ou-table">
            <thead><tr><th style="width:40px"><input type="checkbox" disabled /></th><th class="col-idx">序号</th><th>白名单对象</th><th class="col-actions" style="width:120px">操作</th></tr></thead>
            <tbody><tr><td colspan="4" class="ou-empty">无数据</td></tr></tbody>
          </table>
        </div>
        <div class="ou-footer">
          <div class="ou-footer-left"><div class="ou-pager"><button class="ou-page-btn" disabled>‹</button><button class="ou-page-btn active" disabled>1</button><button class="ou-page-btn" disabled>›</button></div></div>
          <div class="ou-footer-right"><label class="ou-page-goto">到第 <input class="ou-page-goto-input" value="1" disabled /> 页 <button class="ou-page-goto-btn" disabled>确定</button></label><span>共 0 条</span><label class="ou-page-size"><select disabled><option>100 条/页</option></select></label></div>
        </div>
      </div>

      <!-- 12. 告警通知 -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'alert-notify' }">
        <div class="cbm-pc-page">
          <div class="cbm-pc-subtabs-header">
            <div class="cbm-pc-subtabs">
              <button v-for="s in anSubtabs" :key="s" type="button" class="cbm-pc-subtab" :class="{ active: anActive === s }" @click="anActive = s">{{ s }}</button>
            </div>
          </div>
          <div class="tdh-filters">
            <div class="tdh-filter-row">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">源IP</span><input class="ou-toolbar-input tdh-filter-input" disabled /></label>
              <button class="ou-search-btn" disabled>搜索</button>
              <button class="secondary td-reset-btn" disabled>重置</button>
            </div>
          </div>
          <div class="ou-table-wrap">
            <table class="ou-table">
              <thead><tr><th class="col-idx">序号</th><th>源IP</th><th class="ou-num">访问次数</th><th>访问时间段</th><th>应用协议</th><th>访问协议</th></tr></thead>
              <tbody><tr><td colspan="6" class="ou-empty">无数据</td></tr></tbody>
            </table>
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
import './nv-shared.css'

const activeTab = ref('realtime-overview')
const tabs = [
  { key: 'realtime-overview', label: '实时概况' },
  { key: 'realtime-sessions', label: '实时会话' },
  { key: 'model-overview', label: '模型概况' },
  { key: 'vpn-apps', label: 'VPN应用' },
  { key: 'history-sessions', label: '历史会话' },
  { key: 'account-stats', label: '账号统计' },
  { key: 'ip-stats', label: 'IP统计' },
  { key: 'vps-nodes', label: 'VPS节点' },
  { key: 'cross-border-block', label: '跨境阻断' },
  { key: 'param-config', label: '参数配置' },
  { key: 'whitelist', label: '白名单' },
  { key: 'alert-notify', label: '告警通知' },
]

const pcSubtabs = ['分析模型', '模型参数', '协议参数', '流量阈值']
const pcActive = ref(pcSubtabs[0])
const anSubtabs = ['告警规则', '通知方式', '通知记录']
const anActive = ref(anSubtabs[0])

const cbmRoSrc: any[][] = [
  ['101.6.15.28', 2864, '760.55 M', '基于VPN应用'],
  ['183.159.168.190', 1928, '512.38 M', '基于VPN应用'],
  ['111.226.166.248', 1456, '386.12 M', '基于VPN应用'],
  ['101.6.68.247', 986, '248.76 M', '基于VPN应用'],
  ['172.28.8.9', 742, '186.42 M', '基于VPN协议'],
  ['10.0.12.36', 628, '152.18 M', '基于VPN应用'],
  ['81.177.6.131', 512, '128.64 M', '基于VPN应用'],
  ['5.231.242.20', 386, '96.28 M', '基于VPN应用'],
]
const cbmRoDst: any[][] = [
  ['101.6.15.130', 1864, '738.40 M', '基于VPN应用'],
  ['101.6.6.6', 986, '412.56 M', '基于VPN应用'],
  ['101.6.15.67', 742, '286.18 M', '基于VPN应用'],
  ['101.6.8.149', 628, '198.42 M', '基于VPN应用'],
  ['166.111.5.212', 512, '156.88 M', '基于VPN应用'],
  ['101.6.28.183', 386, '128.24 M', '基于VPN应用'],
]
const cbmRoDom: any[][] = [
  ['raw.githubusercontent.com', 128, '10.95 M', '基于VPN应用'],
  ['cn.bing.com', 86, '6.82 M', '基于VPN应用'],
  ['api.github.com', 42, '3.18 M', '基于VPN应用'],
  ['st.todesk.com', 28, '2.46 M', '基于VPN应用'],
  ['slapi.oray.net', 18, '1.52 M', '基于VPN协议'],
  ['update.example.com', 12, '0.86 M', '基于VPN应用'],
  ['dns.google', 8, '0.42 M', '基于VPN应用'],
]
const cbmRs = [
  { t: '2026-6-13/19:50:23', mac: 'ec:8e:b5:12:34:56', vendor: 'NewH3CTechnc...', src: '183.159.168.190:59822', dst: '101.6.6.6:5353', proto: 'UDP', protoName: 'FastVPN/…', up: 74, down: 74 },
  { t: '2026-6-13/19:50:22', mac: 'a4:1a:3a:56:78:90', vendor: 'HuaweiTechno...', src: '111.226.166.248:42108', dst: '101.6.15.130:443', proto: 'TCP', protoName: 'Clash', up: '1.36 K', down: '18.66 K' },
  { t: '2026-6-13/19:50:21', mac: '00:1a:2b:3c:4d:5e', vendor: 'IntelCorpora...', src: '101.6.68.247:53240', dst: '101.6.8.149:22', proto: 'TCP', protoName: '泡芙云', up: '2.84 K', down: '29.30 K' },
  { t: '2026-6-13/19:50:20', mac: 'f8:e4:3b:aa:bb:cc', vendor: 'Apple, Inc.', src: '81.177.6.131:42108', dst: '101.6.15.67:22', proto: 'TCP', protoName: 'Clash', up: '1.62 K', down: '10.14 K' },
  { t: '2026-6-13/19:50:19', mac: 'd0:67:e5:11:22:33', vendor: 'Dell Inc.', src: '172.28.8.9:49822', dst: '166.111.5.212:22', proto: 'TCP', protoName: '泡芙云', up: '2.48 K', down: '5.01 K' },
  { t: '2026-6-13/19:50:18', mac: 'b8:27:eb:44:55:66', vendor: 'Raspberry Pi', src: '10.0.12.36:52108', dst: '101.6.28.183:443', proto: 'TCP', protoName: 'FastVPN/…', up: 0, down: '7.92 K' },
  { t: '2026-6-13/19:50:17', mac: '00:50:56:a1:b2:c3', vendor: 'VMware, Inc.', src: '213.209.159.233:31234', dst: '101.6.4.100:443', proto: 'TCP', protoName: 'Clash', up: '1.90 K', down: '17.55 K' },
  { t: '2026-6-13/19:50:16', mac: 'ac:de:48:00:11:22', vendor: 'Private', src: '5.231.242.20:53240', dst: '101.6.9.234:8443', proto: 'TCP', protoName: '泡芙云', up: '2.14 K', down: 0 },
]

const cbmTrendX = ref(['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00'])
const cbmTrendData = ref([
  { name: '基于VPN协议', data: [15, 12, 8, 6, 5, 4, 8, 22, 35, 42] },
  { name: '基于VPN应用', data: [25, 18, 12, 10, 8, 6, 15, 38, 52, 68] },
  { name: '基于网络代理', data: [8, 6, 4, 3, 2, 2, 5, 12, 18, 25] },
  { name: '基于跨境监测情报', data: [12, 8, 5, 4, 3, 2, 6, 15, 22, 30] },
])

const cbmTrendOption = computed(() => ({
  tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#e4e7ed', borderWidth: 1, textStyle: { color: '#303133' }, padding: [10, 14] },
  legend: { data: cbmTrendData.value.map(s => s.name), bottom: 0, textStyle: { fontSize: 11, color: '#606266' }, itemWidth: 10, itemHeight: 6 },
  grid: { left: '50', right: '20', top: '20', bottom: '40' },
  xAxis: { type: 'category', data: cbmTrendX.value, axisLine: { lineStyle: { color: '#c8ccd0' } }, axisLabel: { fontSize: 11, color: '#909399' }, axisTick: { show: false } },
  yAxis: { type: 'value', axisLine: { show: false }, axisLabel: { fontSize: 11, color: '#909399' }, splitLine: { lineStyle: { color: '#f0f2f5', type: 'dashed' } } },
  series: cbmTrendData.value.map((s, i) => ({
    name: s.name, type: 'line', smooth: true, data: s.data,
    lineStyle: { width: 2 },
    itemStyle: { color: ['#5470c6', '#fac858', '#91cc75', '#ee6666'][i] },
    areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: ['rgba(84,112,198,0.2)', 'rgba(250,200,88,0.2)', 'rgba(145,204,117,0.2)', 'rgba(238,102,102,0.2)'][i] }, { offset: 1, color: ['rgba(84,112,198,0.02)', 'rgba(250,200,88,0.02)', 'rgba(145,204,117,0.02)', 'rgba(238,102,102,0.02)'][i] }] } },
    symbol: 'circle', symbolSize: 6,
  }))
}))

const cbmPieData = ref([
  { name: '基于VPN应用', value: 68, itemStyle: { color: '#fac858' } },
  { name: '基于VPN协议', value: 22, itemStyle: { color: '#5470c6' } },
  { name: '基于跨境监测情报', value: 6, itemStyle: { color: '#ee6666' } },
  { name: '基于网络代理', value: 4, itemStyle: { color: '#91cc75' } },
])

const cbmPieOption = computed(() => ({
  tooltip: { trigger: 'item', backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#e4e7ed', borderWidth: 1, textStyle: { color: '#303133' }, padding: [10, 14], formatter: '{b}: {c}%' },
  legend: { orient: 'vertical', right: '5%', top: 'center', textStyle: { fontSize: 12, color: '#606266' }, itemWidth: 12, itemHeight: 8 },
  series: [{
    name: '类型分布', type: 'pie', radius: ['45%', '75%'], center: ['35%', '50%'],
    avoidLabelOverlap: true, itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
    label: { show: true, position: 'inside', fontSize: 11, fontWeight: 600, color: '#fff', formatter: '{d}%' },
    emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
    labelLine: { show: false },
    data: cbmPieData.value,
  }]
}))

const cbmModelUsers = [
  [1, '101.6.15.28', 'user01', 2864, 12, '760.55 M', '基于VPN应用'],
  [2, '183.159.168.190', 'user02', 1928, 8, '512.38 M', '基于VPN应用'],
  [3, '111.226.166.248', 'user03', 1456, 5, '386.12 M', '基于VPN应用'],
  [4, '101.6.68.247', 'user04', 986, 3, '248.76 M', '基于VPN应用'],
  [5, '172.28.8.9', 'user05', 742, 2, '186.42 M', '基于VPN协议'],
]

const cbmModelNodes = [
  [1, '101.6.15.130', '🇺🇸 美国|Virginia', 1864, 5, '738.40 M', '基于VPN应用'],
  [2, '101.6.6.6', '🇯🇵 日本|Tokyo', 986, 3, '412.56 M', '基于VPN应用'],
  [3, '101.6.15.67', '🇸🇬 新加坡', 742, 2, '286.18 M', '基于VPN应用'],
  [4, '101.6.8.149', '🇨🇳 香港', 628, 1, '198.42 M', '基于VPN应用'],
  [5, '166.111.5.212', '🇨🇳 台湾', 512, 1, '156.88 M', '基于VPN应用'],
]

const cbmModelDomains = [
  [1, 'raw.githubusercontent.com', 128, 0, '10.95 M', '基于VPN应用'],
  [2, 'api.github.com', 86, 0, '6.82 M', '基于VPN应用'],
  [3, 'st.todesk.com', 42, 0, '3.18 M', '基于VPN应用'],
]

const cbmVpnApps = [
  [1, 'Clash', 2864, '760.55 M'],
  [2, '泡芙云', 1928, '512.38 M'],
  [3, 'FastVPN', 1456, '386.12 M'],
  [4, 'ToDesk', 986, '248.76 M'],
]

const cbmVpnNodes = [
  [1, '101.6.15.130', '🇺🇸 美国|Virginia', 1864, '738.40 M'],
  [2, '101.6.6.6', '🇯🇵 日本|Tokyo', 986, '412.56 M'],
  [3, '101.6.15.67', '🇸🇬 新加坡', 742, '286.18 M'],
]

const cbmVpnDomains = [
  [1, 'raw.githubusercontent.com', 128, '10.95 M'],
  [2, 'api.github.com', 86, '6.82 M'],
]

const cbmHistorySessions = [
  { reqTime: '2026-06-13 19:50:23', mac: 'ec:8e:b5:12:34:56', vendor: 'NewH3CTechnc...', username: 'user01', userIp: '183.159.168.190', nodeIp: '101.6.6.6', geo: '🇺🇸 美国|Virginia', proto: 'UDP', protoName: 'FastVPN', up: 74, down: 74, total: 148, protoType: 'VPN协议', domain: '-', link: '-', suspect: '高', model: '基于VPN应用' },
  { reqTime: '2026-06-13 19:50:22', mac: 'a4:1a:3a:56:78:90', vendor: 'HuaweiTechno...', username: 'user02', userIp: '111.226.166.248', nodeIp: '101.6.15.130', geo: '🇯🇵 日本|Tokyo', proto: 'TCP', protoName: 'Clash', up: '1.36 K', down: '18.66 K', total: '20.02 K', protoType: 'VPN应用', domain: '-', link: '-', suspect: '高', model: '基于VPN应用' },
]

const cbmAccountStats = [
  { detail: '▼', idx: 1, username: 'user01', ip: '183.159.168.190', visits: 2864, freq: '高频', behavior: '持续', up: '760.55 M', down: '1.23 G', total: '1.98 G', vpnDomain: 'raw.githubusercontent.com', model: '基于VPN应用', link: '链路A', scene: '办公' },
  { detail: '▼', idx: 2, username: 'user02', ip: '111.226.166.248', visits: 1928, freq: '中频', behavior: '间歇性', up: '512.38 M', down: '890.24 M', total: '1.38 G', vpnDomain: 'api.github.com', model: '基于VPN应用', link: '链路B', scene: '开发' },
]

const cbmIpStats = [
  { detail: '▼', idx: 1, userIp: '183.159.168.190', username: 'user01', node: '101.6.6.6', port: 5353, vpnDomain: 'raw.githubusercontent.com', protoType: 'VPN协议', visits: 2864, freq: '高频', behavior: '持续', up: '760.55 M', down: '1.23 G', total: '1.98 G', appProto: 'FastVPN', scene: '办公', link: '链路A' },
  { detail: '▼', idx: 2, userIp: '111.226.166.248', username: 'user02', node: '101.6.15.130', port: 443, vpnDomain: 'api.github.com', protoType: 'VPN应用', visits: 1928, freq: '中频', behavior: '间歇性', up: '512.38 M', down: '890.24 M', total: '1.38 G', appProto: 'Clash', scene: '开发', link: '链路B' },
]

const cbmVpsNodes = [
  { idx: 1, node: '101.6.15.130', geo: '🇺🇸 美国|Virginia', port: 443, vpnDomain: 'api.github.com', protoType: 'VPN应用', visits: 1864, freq: '高频', up: '738.40 M', down: '1.12 G', total: '1.84 G', user: 'user02' },
  { idx: 2, node: '101.6.6.6', geo: '🇯🇵 日本|Tokyo', port: 5353, vpnDomain: 'raw.githubusercontent.com', protoType: 'VPN协议', visits: 986, freq: '中频', up: '412.56 M', down: '680.34 M', total: '1.07 G', user: 'user01' },
]

const cbmConfigData = [
  { idx: 1, model: '基于VPN应用', suspect: '高', hit: 2864, white: 12, updateTime: '2026-06-13 19:45:32', trend: '↑', range: '50-100', alert: '开启', hkmac: '是', foreign: '是', monitor: '开启', block: '开启' },
  { idx: 2, model: '基于VPN协议', suspect: '中', hit: 1928, white: 8, updateTime: '2026-06-13 19:40:18', trend: '↓', range: '30-80', alert: '开启', hkmac: '是', foreign: '是', monitor: '开启', block: '开启' },
  { idx: 3, model: '基于网络代理', suspect: '低', hit: 742, white: 3, updateTime: '2026-06-13 19:35:26', trend: '-', range: '10-50', alert: '关闭', hkmac: '否', foreign: '是', monitor: '开启', block: '关闭' },
]

const cbmWhitelist = [
  { idx: 1, obj: '10.0.0.0/8', type: 'IP' },
  { idx: 2, obj: '172.16.0.0/12', type: 'IP' },
  { idx: 3, obj: 'github.com', type: '域名' },
  { idx: 4, obj: 'api.github.com', type: '域名' },
]

const cbmAlertData = [
  { idx: 1, srcIp: '183.159.168.190', visits: 2864, period: '2026-06-13 19:00-19:50', appProto: 'FastVPN', proto: 'UDP' },
  { idx: 2, srcIp: '111.226.166.248', visits: 1928, period: '2026-06-13 19:05-19:48', appProto: 'Clash', proto: 'TCP' },
]

const cbmDevices = [
  { id: 1, name: '防火墙-01', ip: '192.168.1.1', status: '在线' },
  { id: 2, name: '防火墙-02', ip: '192.168.1.2', status: '在线' },
]
</script>

<style scoped>
.cbm-scroll { flex:1; min-height:0; overflow:auto; display:flex; flex-direction:column; gap:12px; padding:12px; }
.cbm-mid-grid { display:grid; grid-template-columns:2fr 1fr; gap:12px; }
.cbm-bottom-grid { display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:12px; }
.cbm-count { color:#409eff; font-style:normal; font-weight:600; margin:0 2px; }
.cbm-sub-title { color:#909399; font-size:12px; font-weight:normal; margin-left:6px; }
.cbm-rs-table th, .cbm-rs-table td { font-size:12px; padding:6px 8px; }
.cbm-rs-table { min-width:1600px; }
.dt-ellipsis { display:inline-block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; vertical-align:bottom; }
.cbm-cb-page { flex:1; min-height:0; display:flex; }
.cbm-cb-sidebar { width:220px; border-right:1px solid #ebeef5; display:flex; flex-direction:column; }
.cbm-cb-sidebar-head { display:flex; align-items:center; justify-content:space-between; padding:10px 12px; border-bottom:1px solid #ebeef5; }
.cbm-cb-sidebar-title { font-weight:600; color:#303133; font-size:13px; }
.cbm-cb-sidebar-icon { color:#409eff; margin-right:4px; }
.cbm-cb-add-btn { width:22px; height:22px; padding:0; border:1px solid #dcdfe6; border-radius:3px; background:#fff; color:#606266; cursor:pointer; }
.cbm-cb-sidebar-body { flex:1; overflow:auto; }
.cbm-cb-main { flex:1; overflow:auto; }
.cbm-pc-page { flex:1; min-height:0; display:flex; flex-direction:column; }
.cbm-pc-subtabs-header { padding:0 16px; background:#fafbfc; border-bottom:1px solid #ebeef5; }
.cbm-pc-subtabs { display:flex; gap:0; }
.cbm-pc-subtab { padding:10px 16px; border:none; background:transparent; font-size:13px; font-weight:500; color:#606266; cursor:pointer; position:relative; }
.cbm-pc-subtab.active { color:#409eff; }
.cbm-pc-subtab.active::after { content:''; position:absolute; bottom:0; left:16px; right:16px; height:2px; background:#409eff; }
@media (max-width:1200px) { .cbm-bottom-grid { grid-template-columns:1fr; } .cbm-mid-grid { grid-template-columns:1fr; } }
</style>
