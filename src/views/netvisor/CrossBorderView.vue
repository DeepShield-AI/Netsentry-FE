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
              <label class="tdh-filter-field"><span class="ou-toolbar-label">分析模型</span><select class="ou-toolbar-select" v-model="cbRoModel"><option value="">任意</option><option value="基于VPN协议">基于VPN协议</option><option value="基于VPN应用">基于VPN应用</option><option value="基于网络代理">基于网络代理</option><option value="基于跨境监测情报">基于跨境监测情报</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">疑似度</span><select class="ou-toolbar-select" v-model="cbRoSuspect"><option value="">任意</option><option value="高">高</option><option value="中">中</option><option value="低">低</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">请求数&gt;=</span><input class="ou-toolbar-input tdh-filter-input" type="text" v-model="cbRoReqMin" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">链路</span><select class="ou-toolbar-select" v-model="cbRoLink"><option value="">任意</option><option value="链路1">链路1</option><option value="链路2">链路2</option></select></label>
              <button type="button" class="ou-search-btn" @click="searchCbRo">搜索</button>
              <button type="button" class="secondary td-reset-btn" @click="resetCbRoFilters">重置</button>
              <div class="tio-range-btns" style="margin-left:auto"><button class="tio-range-btn active">IPv4</button><button class="tio-range-btn">IPv6</button></div>
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
                  <div class="tio-range-btns"><button class="tio-range-btn active" @click="cbRoRange = 'day'">日</button><button class="tio-range-btn" @click="cbRoRange = 'week'">周</button><button class="tio-range-btn" @click="cbRoRange = 'month'">月</button></div>
                </div>
                <div class="tid-chart-body"><span class="tid-yunit">#Session</span><div class="to-chart-plot"><v-chart :option="cbRoTrendOption" autoresize style="width:100%;height:300px;" /></div></div>
                <div class="dtt-chart-stats"><span class="dtt-stat"><i class="dtt-stat-badge max">MAX</i>最大值 <strong>116</strong></span><span class="dtt-stat"><i class="dtt-stat-badge min">MIN</i>最小值 <strong>1</strong></span><span class="dtt-stat"><i class="dtt-stat-badge avg">AVG</i>平均值 <strong>22</strong></span></div>
              </section>
              <section class="tid-chart-panel">
                <div class="tid-chart-head"><h3 class="tid-mini-title">类型分布</h3></div>
                <div class="tid-chart-body"><div class="to-chart-plot"><v-chart :option="cbRoPieOption" autoresize style="width:100%;height:300px;" /></div></div>
              </section>
            </div>

            <div class="cbm-bottom-grid">
              <section class="tid-mini-panel">
                <div class="tid-mini-head"><h3 class="tid-mini-title">源IP</h3><button class="tid-expand-btn">⛶</button></div>
                <div class="ou-table-wrap tid-mini-table-wrap">
                  <table class="ou-table tid-mini-table">
                    <thead><tr><th class="col-idx">序号</th><th>源IP</th><th>用户名称</th><th class="ou-num">请求数</th><th class="ou-num">流量</th><th>分析模型</th></tr></thead>
                    <tbody>
                      <tr v-for="(r,i) in cbmRoSrc.slice((cbmRoSrcPage - 1) * cbmRoSrcPageSize, cbmRoSrcPage * cbmRoSrcPageSize)" :key="i" @contextmenu.prevent="showIpContextMenu($event, r[0])">
                        <td class="col-idx">{{ (cbmRoSrcPage - 1) * cbmRoSrcPageSize + i + 1 }}</td>
                        <td><span class="tid-link" @click="openRealtimeSession('源IP', r[0])">{{ r[0] }}</span></td>
                        <td>—</td>
                        <td class="ou-num">{{ r[1] }}</td>
                        <td class="ou-num">{{ r[2] }}</td>
                        <td>{{ r[3] }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="ou-footer">
                  <div class="ou-footer-left"><div class="ou-pager"><button class="ou-page-btn" :disabled="cbmRoSrcPage <= 1" @click="cbmRoSrcPage--">‹</button><button v-for="p in getPageList(cbmRoSrcPage, Math.ceil(cbmRoSrcTotal / cbmRoSrcPageSize))" :key="p" class="ou-page-btn" :class="{ active: cbmRoSrcPage === p }" @click="cbmRoSrcPage = p">{{ p }}</button><button class="ou-page-btn" :disabled="cbmRoSrcPage >= Math.ceil(cbmRoSrcTotal / cbmRoSrcPageSize)" @click="cbmRoSrcPage++">›</button></div></div>
                  <div class="ou-footer-right"><label class="ou-page-goto">到第 <input class="ou-page-goto-input" v-model.number="cbmRoSrcPage" /> 页 <button class="ou-page-goto-btn" @click="cbmRoSrcPage = Math.min(Math.max(1, cbmRoSrcPage), Math.ceil(cbmRoSrcTotal / cbmRoSrcPageSize))">确定</button></label><span>共 {{ cbmRoSrcTotal }} 条</span><label class="ou-page-size"><select v-model.number="cbmRoSrcPageSize"><option :value="20">20条/页</option><option :value="50">50条/页</option><option :value="100">100条/页</option></select></label></div>
                </div>
              </section>
              <section class="tid-mini-panel">
                <div class="tid-mini-head"><h3 class="tid-mini-title">目标IP</h3><button class="tid-expand-btn">⛶</button></div>
                <div class="ou-table-wrap tid-mini-table-wrap">
                  <table class="ou-table tid-mini-table">
                    <thead><tr><th class="col-idx">序号</th><th>目标IP</th><th class="ou-num">请求数</th><th class="ou-num">流量</th><th>分析模型</th></tr></thead>
                    <tbody>
                      <tr v-for="(r,i) in cbmRoDst.slice((cbmRoDstPage - 1) * cbmRoDstPageSize, cbmRoDstPage * cbmRoDstPageSize)" :key="i">
                        <td class="col-idx">{{ (cbmRoDstPage - 1) * cbmRoDstPageSize + i + 1 }}</td>
                        <td><span class="tid-link" @click="openRealtimeSession('目标IP', r[0])">{{ r[0] }}</span></td>
                        <td class="ou-num">{{ r[1] }}</td>
                        <td class="ou-num">{{ r[2] }}</td>
                        <td>{{ r[3] }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="ou-footer">
                  <div class="ou-footer-left"><div class="ou-pager"><button class="ou-page-btn" :disabled="cbmRoDstPage <= 1" @click="cbmRoDstPage--">‹</button><button v-for="p in getPageList(cbmRoDstPage, Math.ceil(cbmRoDstTotal / cbmRoDstPageSize))" :key="p" class="ou-page-btn" :class="{ active: cbmRoDstPage === p }" @click="cbmRoDstPage = p">{{ p }}</button><button class="ou-page-btn" :disabled="cbmRoDstPage >= Math.ceil(cbmRoDstTotal / cbmRoDstPageSize)" @click="cbmRoDstPage++">›</button></div></div>
                  <div class="ou-footer-right"><label class="ou-page-goto">到第 <input class="ou-page-goto-input" v-model.number="cbmRoDstPage" /> 页 <button class="ou-page-goto-btn" @click="cbmRoDstPage = Math.min(Math.max(1, cbmRoDstPage), Math.ceil(cbmRoDstTotal / cbmRoDstPageSize))">确定</button></label><span>共 {{ cbmRoDstTotal }} 条</span><label class="ou-page-size"><select v-model.number="cbmRoDstPageSize"><option :value="20">20条/页</option><option :value="50">50条/页</option><option :value="100">100条/页</option></select></label></div>
                </div>
              </section>
              <section class="tid-mini-panel">
                <div class="tid-mini-head"><h3 class="tid-mini-title">请求域名</h3><button class="tid-expand-btn"></button></div>
                <div class="ou-table-wrap tid-mini-table-wrap">
                  <table class="ou-table tid-mini-table">
                    <thead><tr><th class="col-idx">序号</th><th>请求域名</th><th class="ou-num">请求数</th><th class="ou-num">流量</th><th>分析模型</th></tr></thead>
                    <tbody>
                      <tr v-for="(r,i) in cbmRoDom.slice((cbmRoDomPage - 1) * cbmRoDomPageSize, cbmRoDomPage * cbmRoDomPageSize)" :key="i">
                        <td class="col-idx">{{ (cbmRoDomPage - 1) * cbmRoDomPageSize + i + 1 }}</td>
                        <td><span class="tid-link dt-ellipsis" @click="openRealtimeSession('请求域名', r[0])">{{ r[0] }}</span></td>
                        <td class="ou-num">{{ r[1] }}</td>
                        <td class="ou-num">{{ r[2] }}</td>
                        <td>{{ r[3] }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="ou-footer">
                  <div class="ou-footer-left"><div class="ou-pager"><button class="ou-page-btn" :disabled="cbmRoDomPage <= 1" @click="cbmRoDomPage--">‹</button><button v-for="p in getPageList(cbmRoDomPage, Math.ceil(cbmRoDomTotal / cbmRoDomPageSize))" :key="p" class="ou-page-btn" :class="{ active: cbmRoDomPage === p }" @click="cbmRoDomPage = p">{{ p }}</button><button class="ou-page-btn" :disabled="cbmRoDomPage >= Math.ceil(cbmRoDomTotal / cbmRoDomPageSize)" @click="cbmRoDomPage++">›</button></div></div>
                  <div class="ou-footer-right"><label class="ou-page-goto">到第 <input class="ou-page-goto-input" v-model.number="cbmRoDomPage" /> 页 <button class="ou-page-goto-btn" @click="cbmRoDomPage = Math.min(Math.max(1, cbmRoDomPage), Math.ceil(cbmRoDomTotal / cbmRoDomPageSize))">确定</button></label><span>共 {{ cbmRoDomTotal }} 条</span><label class="ou-page-size"><select v-model.number="cbmRoDomPageSize"><option :value="20">20条/页</option><option :value="50">50条/页</option><option :value="100">100条/页</option></select></label></div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <!-- IP右键菜单 -->
      <div v-if="ipCtxVisible" class="cbm-ip-ctx-menu" :style="{ top: ipCtxY + 'px', left: ipCtxX + 'px' }" @click="ipCtxVisible = false">
        <a class="cbm-ip-ctx-item" @click.stop="openRealtimeSession('源IP', ipCtxIp); ipCtxVisible = false">查看实时会话</a>
        <a class="cbm-ip-ctx-item cbm-ip-ctx-danger" @click.stop="blockIp(ipCtxIp); ipCtxVisible = false">阻断</a>
      </div>

      <!-- 2. 实时会话 -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'realtime-sessions' }">
        <div class="tdh-filters">
          <div class="tdh-filter-row">
            <label class="tdh-filter-field"><select class="ou-toolbar-select" v-model="rsSrcType"><option value="任意IP">任意IP</option><option value="源IP">源IP</option><option value="目标IP">目标IP</option></select><input class="ou-toolbar-input tdh-filter-input" placeholder="任意IP" v-model="rsSrcValue" /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">源端口</span><input class="ou-toolbar-input tdh-filter-input" placeholder="80 / 8000-8080" v-model="rsSrcPort" /></label>
            <label class="tdh-filter-field"><select class="ou-toolbar-select" v-model="rsDstType"><option value="任意IP">任意IP</option><option value="源IP">源IP</option><option value="目标IP">目标IP</option></select><input class="ou-toolbar-input tdh-filter-input" placeholder="任意IP" v-model="rsDstValue" /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">目标端口</span><input class="ou-toolbar-input tdh-filter-input" placeholder="80 / 8000-8080" v-model="rsDstPort" /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">应用协议</span><input class="ou-toolbar-input tdh-filter-input" placeholder="任意协议" v-model="rsAppProto" /></label>
            <div class="tio-range-btns"><button class="tio-range-btn active">IPv4</button><button class="tio-range-btn">IPv6</button></div>
          </div>
          <div class="tdh-filter-row">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">MAC</span><input class="ou-toolbar-input tdh-filter-input" v-model="rsMac" /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">传输协议</span><select class="ou-toolbar-select" v-model="rsProto"><option value="任意">任意</option><option value="TCP">TCP</option><option value="UDP">UDP</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">疑似度</span><select class="ou-toolbar-select" v-model="rsSuspect"><option value="任意">任意</option><option value="高">高</option><option value="中">中</option><option value="低">低</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">域名</span><input class="ou-toolbar-input tdh-filter-input" v-model="rsDomain" /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">用户名称</span><input class="ou-toolbar-input tdh-filter-input" v-model="rsUser" /></label>
          </div>
          <div class="tdh-filter-row tdh-filter-row-actions">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">分析模型</span><select class="ou-toolbar-select" v-model="rsModel"><option value="任意">任意</option><option value="基于VPN协议">基于VPN协议</option><option value="基于VPN应用">基于VPN应用</option><option value="基于网络代理">基于网络代理</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">协议类型</span><select class="ou-toolbar-select" v-model="rsProtoType"><option value="任意">任意</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">链路</span><select class="ou-toolbar-select" v-model="rsLink"><option value="任意">任意</option><option value="链路1">链路1</option></select></label>
            <button type="button" class="ou-search-btn" @click="searchRsData">搜索</button>
            <button type="button" class="secondary td-reset-btn" @click="resetRsFilters">重置</button>
            <button type="button" class="td-icon-btn">⚙</button>
          </div>
        </div>
        <div class="ou-table-wrap cbm-rs-scroll">
          <table class="ou-table cbm-rs-table">
            <thead><tr><th class="col-idx">序号</th><th>时间</th><th>MAC</th><th>MAC厂商</th><th>用户名称</th><th>源IP</th><th>目标IP</th><th>传输协议</th><th>协议类型</th><th>协议名称</th><th>地理位置</th><th>上行流量</th><th>下行流量</th><th>域名</th><th>链路</th><th>疑似度</th><th>分析模型</th><th class="col-actions">操作</th></tr></thead>
            <tbody>
              <tr v-for="(r, i) in cbmRs.slice((rsPage - 1) * rsPageSize, rsPage * rsPageSize)" :key="i">
                <td class="col-idx">{{ (rsPage - 1) * rsPageSize + i + 1 }}</td>
                <td>{{ r.t }}</td>
                <td>{{ r.mac }}</td>
                <td><span class="dt-ellipsis" style="max-width:100px">{{ r.vendor }}</span></td>
                <td>—</td>
                <td><span class="tid-link" @click="openRsPacket(r)">{{ r.src }}</span></td>
                <td><span class="tid-link" @click="openRsPacket(r)">{{ r.dst }}</span></td>
                <td>{{ r.proto }}</td>
                <td>—</td>
                <td>{{ r.protoName }}</td>
                <td><span class="sp-geo-tag">{{ getGeoFlagUrl(getGeoFlag('北京')) }} 北京</span></td>
                <td class="ou-num">{{ r.up }}</td>
                <td class="ou-num">{{ r.down }}</td>
                <td>{{ r.domain || '—' }}</td>
                <td>—</td>
                <td><span class="cbm-suspect-badge cbm-suspect-high">高</span></td>
                <td>基于VPN应用</td>
                <td class="col-actions">
                  <div class="sahs-dropdown">
                    <button type="button" class="link-btn sahs-packet-btn" @click="toggleRsPacketDropdown(i)">数据包</button>
                    <div v-if="rsPacketDropdownIndex === i" class="sahs-dropdown-menu">
                      <a class="sahs-dropdown-item" @click="openPacketAnalysisFromRs(r)">报文分析</a>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="ou-footer">
          <div class="ou-footer-left"><div class="ou-pager"><button class="ou-page-btn" :disabled="rsPage <= 1" @click="rsPage--">‹</button><button v-for="p in getPageList(rsPage, Math.ceil(rsTotal / rsPageSize))" :key="p" class="ou-page-btn" :class="{ active: rsPage === p }" @click="rsPage = p">{{ p }}</button><button class="ou-page-btn" :disabled="rsPage >= Math.ceil(rsTotal / rsPageSize)" @click="rsPage++">›</button></div></div>
          <div class="ou-footer-right"><label class="ou-page-goto">到第 <input class="ou-page-goto-input" v-model.number="rsPage" /> 页 <button class="ou-page-goto-btn" @click="rsPage = Math.min(Math.max(1, rsPage), Math.ceil(rsTotal / rsPageSize))">确定</button></label><span>共 {{ rsTotal }} 条</span><label class="ou-page-size"><select v-model.number="rsPageSize"><option :value="20">20条/页</option><option :value="50">50条/页</option><option :value="100">100条/页</option></select></label></div>
        </div>
      </div>

      <!-- 3. 模型概况 -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'model-overview' }">
        <div class="tid-page">
          <div class="tdh-filters">
            <div class="tdh-filter-row">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">MAC</span><input class="ou-toolbar-input tdh-filter-input" v-model="moMac" /></label>
              <label class="tdh-filter-field"><select class="ou-toolbar-select" v-model="moSrcType"><option value="任意IP">任意IP</option><option value="源IP">源IP</option><option value="目标IP">目标IP</option></select><input class="ou-toolbar-input tdh-filter-input" placeholder="任意IP" v-model="moSrcValue" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">源端口</span><input class="ou-toolbar-input tdh-filter-input" placeholder="80 / 8000-80" v-model="moSrcPort" /></label>
              <label class="tdh-filter-field"><select class="ou-toolbar-select" v-model="moDstType"><option value="任意IP">任意IP</option><option value="源IP">源IP</option><option value="目标IP">目标IP</option></select><input class="ou-toolbar-input tdh-filter-input" placeholder="任意IP" v-model="moDstValue" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">目标端口</span><input class="ou-toolbar-input tdh-filter-input" placeholder="80 / 8000-80" v-model="moDstPort" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">传输协议</span><select class="ou-toolbar-select" v-model="moProto"><option value="任意">任意</option><option value="TCP">TCP</option><option value="UDP">UDP</option></select></label>
            </div>
            <div class="tdh-filter-row tdh-filter-row-actions">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">域名</span><input class="ou-toolbar-input tdh-filter-input" v-model="moDomain" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">请求数&gt;=</span><input class="ou-toolbar-input tdh-filter-input" v-model="moReqMin" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">目标IP区域</span><select class="ou-toolbar-select" v-model="moRegion"><option value="任意">任意</option><option value="国内">国内</option><option value="国外">国外</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">链路</span><select class="ou-toolbar-select" v-model="moLink"><option value="任意">任意</option><option value="链路1">链路1</option></select></label>
              <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" v-model="moTimeRange" /></label>
              <button type="button" class="ou-search-btn" @click="searchMoData">搜索</button>
              <button type="button" class="secondary td-reset-btn" @click="resetMoFilters">重置</button>
              <button type="button" class="td-more-btn">更多条件 ∨</button>
              <div class="tio-range-btns" style="margin-left:auto"><button class="tio-range-btn active">IPv4</button><button class="tio-range-btn">IPv6</button></div>
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
                </div>
                <div class="tid-chart-body"><span class="tid-yunit">#Session</span><div class="to-chart-plot"><v-chart :option="moTrendOption" autoresize style="width:100%;height:300px;" /></div></div>
                <div class="dtt-chart-stats"><span class="dtt-stat"><i class="dtt-stat-badge max">MAX</i>最大值 <strong>8</strong></span><span class="dtt-stat"><i class="dtt-stat-badge min">MIN</i>最小值 <strong>2</strong></span><span class="dtt-stat"><i class="dtt-stat-badge avg">AVG</i>平均值 <strong>4</strong></span></div>
              </section>
              <section class="tid-chart-panel">
                <div class="tid-chart-head"><h3 class="tid-mini-title">类型分布</h3></div>
                <div class="tid-chart-body"><div class="to-chart-plot"><v-chart :option="moPieOption" autoresize style="width:100%;height:300px;" /></div></div>
              </section>
            </div>
            <div class="cbm-bottom-grid">
              <section class="tid-mini-panel">
                <div class="tid-mini-head"><h3 class="tid-mini-title">请求用户数:<em class="cbm-count">52</em></h3><button class="tid-expand-btn">⛶</button></div>
                <div class="ou-table-wrap tid-mini-table-wrap">
                  <table class="ou-table tid-mini-table">
                    <thead><tr><th class="col-idx">序号</th><th>源IP</th><th>用户名称</th><th class="ou-num">请求数</th><th class="ou-num">失败数</th><th class="ou-num">流量</th><th>分析模型</th></tr></thead>
                    <tbody>
                      <tr v-for="(r,i) in moSrcRows.slice((moSrcPage-1)*moSrcPageSize, moSrcPage*moSrcPageSize)" :key="i" @contextmenu.prevent="showMoIpCtx($event, r[0])">
                        <td class="col-idx">{{ (moSrcPage-1)*moSrcPageSize + i + 1 }}</td>
                        <td><span class="tid-link" @click="openMoSession('源IP', r[0])">{{ r[0] }}</span></td>
                        <td>—</td>
                        <td class="ou-num">{{ r[1] }}</td>
                        <td class="ou-num">{{ r[2] }}</td>
                        <td class="ou-num">{{ r[3] }}</td>
                        <td>{{ r[4] }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="ou-footer">
                  <div class="ou-footer-left"><div class="ou-pager"><button class="ou-page-btn" :disabled="moSrcPage<=1" @click="moSrcPage--">‹</button><button v-for="p in getPageList(moSrcPage, Math.ceil(moSrcTotal/moSrcPageSize))" :key="p" class="ou-page-btn" :class="{active:moSrcPage===p}" @click="moSrcPage=p">{{ p }}</button><button class="ou-page-btn" :disabled="moSrcPage>=Math.ceil(moSrcTotal/moSrcPageSize)" @click="moSrcPage++">›</button></div></div>
                  <div class="ou-footer-right"><label class="ou-page-goto">到第 <input class="ou-page-goto-input" v-model.number="moSrcPage" /> 页 <button class="ou-page-goto-btn" @click="moSrcPage=Math.min(Math.max(1,moSrcPage),Math.ceil(moSrcTotal/moSrcPageSize))">确定</button></label><span>共 {{ moSrcTotal }} 条</span><label class="ou-page-size"><select v-model.number="moSrcPageSize"><option :value="20">20条/页</option><option :value="50">50条/页</option><option :value="100">100条/页</option></select></label></div>
                </div>
              </section>
              <section class="tid-mini-panel">
                <div class="tid-mini-head"><h3 class="tid-mini-title">目标节点数:<em class="cbm-count">11</em> <span class="cbm-sub-title">国外节点数:<em class="cbm-count">3</em></span></h3><button class="tid-expand-btn">⛶</button></div>
                <div class="ou-table-wrap tid-mini-table-wrap">
                  <table class="ou-table tid-mini-table">
                    <thead><tr><th class="col-idx">序号</th><th>目标IP</th><th>位置</th><th class="ou-num">请求数</th><th class="ou-num">失败数</th><th class="ou-num">流量</th><th>分析模型</th></tr></thead>
                    <tbody>
                      <tr v-for="(r,i) in moDstRows.slice((moDstPage-1)*moDstPageSize, moDstPage*moDstPageSize)" :key="i">
                        <td class="col-idx">{{ (moDstPage-1)*moDstPageSize + i + 1 }}</td>
                        <td><span class="tid-link" @click="openMoSession('目标IP', r[0])">{{ r[0] }}</span></td>
                        <td>{{ r[1] }}</td>
                        <td class="ou-num">{{ r[2] }}</td>
                        <td class="ou-num">{{ r[3] }}</td>
                        <td class="ou-num">{{ r[4] }}</td>
                        <td>{{ r[5] }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="ou-footer">
                  <div class="ou-footer-left"><div class="ou-pager"><button class="ou-page-btn" :disabled="moDstPage<=1" @click="moDstPage--">‹</button><button v-for="p in getPageList(moDstPage, Math.ceil(moDstTotal/moDstPageSize))" :key="p" class="ou-page-btn" :class="{active:moDstPage===p}" @click="moDstPage=p">{{ p }}</button><button class="ou-page-btn" :disabled="moDstPage>=Math.ceil(moDstTotal/moDstPageSize)" @click="moDstPage++">›</button></div></div>
                  <div class="ou-footer-right"><label class="ou-page-goto">到第 <input class="ou-page-goto-input" v-model.number="moDstPage" /> 页 <button class="ou-page-goto-btn" @click="moDstPage=Math.min(Math.max(1,moDstPage),Math.ceil(moDstTotal/moDstPageSize))">确定</button></label><span>共 {{ moDstTotal }} 条</span><label class="ou-page-size"><select v-model.number="moDstPageSize"><option :value="20">20条/页</option><option :value="50">50条/页</option><option :value="100">100条/页</option></select></label></div>
                </div>
              </section>
              <section class="tid-mini-panel">
                <div class="tid-mini-head"><h3 class="tid-mini-title">节点域名数:<em class="cbm-count">1</em></h3><button class="tid-expand-btn"></button></div>
                <div class="ou-table-wrap tid-mini-table-wrap">
                  <table class="ou-table tid-mini-table">
                    <thead><tr><th class="col-idx">序号</th><th>目标域名</th><th class="ou-num">请求数</th><th class="ou-num">失败数</th><th class="ou-num">流量</th><th>分析模型</th></tr></thead>
                    <tbody>
                      <tr v-for="(r,i) in moDomRows.slice((moDomPage-1)*moDomPageSize, moDomPage*moDomPageSize)" :key="i">
                        <td class="col-idx">{{ (moDomPage-1)*moDomPageSize + i + 1 }}</td>
                        <td><span class="tid-link dt-ellipsis" @click="openMoSession('请求域名', r[0])">{{ r[0] }}</span></td>
                        <td class="ou-num">{{ r[1] }}</td>
                        <td class="ou-num">{{ r[2] }}</td>
                        <td class="ou-num">{{ r[3] }}</td>
                        <td>{{ r[4] }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="ou-footer">
                  <div class="ou-footer-left"><div class="ou-pager"><button class="ou-page-btn" :disabled="moDomPage<=1" @click="moDomPage--">‹</button><button v-for="p in getPageList(moDomPage, Math.ceil(moDomTotal/moDomPageSize))" :key="p" class="ou-page-btn" :class="{active:moDomPage===p}" @click="moDomPage=p">{{ p }}</button><button class="ou-page-btn" :disabled="moDomPage>=Math.ceil(moDomTotal/moDomPageSize)" @click="moDomPage++">›</button></div></div>
                  <div class="ou-footer-right"><label class="ou-page-goto">到第 <input class="ou-page-goto-input" v-model.number="moDomPage" /> 页 <button class="ou-page-goto-btn" @click="moDomPage=Math.min(Math.max(1,moDomPage),Math.ceil(moDomTotal/moDomPageSize))">确定</button></label><span>共 {{ moDomTotal }} 条</span><label class="ou-page-size"><select v-model.number="moDomPageSize"><option :value="20">20条/页</option><option :value="50">50条/页</option><option :value="100">100条/页</option></select></label></div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <!-- 模型概况 IP右键菜单 -->
      <div v-if="moIpCtxVisible" class="cbm-ip-ctx-menu" :style="{ top: moIpCtxY + 'px', left: moIpCtxX + 'px' }" @click="moIpCtxVisible = false">
        <a class="cbm-ip-ctx-item" @click.stop="openMoSession('源IP', moIpCtxIp); moIpCtxVisible = false">会话详细</a>
        <a class="cbm-ip-ctx-item cbm-ip-ctx-danger" @click.stop="blockIp(moIpCtxIp); moIpCtxVisible = false">阻断</a>
      </div>

      <!-- 模型概况 - 历史会话弹窗 -->
      <el-dialog v-model="moSessionVisible" :title="moSessionTitle" width="1400px" :close-on-click-modal="false" @close="moSessionVisible = false">
        <div class="sp-page">
          <div class="tdh-filters sp-filters">
            <div class="tdh-filter-row">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">MAC</span><input class="ou-toolbar-input tdh-filter-input" v-model="moSpMac" /></label>
              <label class="tdh-filter-field"><select class="ou-toolbar-select" v-model="moSpIpType"><option value="单个IP">单个IP</option><option value="任意IP">任意IP</option></select><input class="ou-toolbar-input tdh-filter-input" placeholder="任意IP" v-model="moSpIpValue" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">用户端口</span><input class="ou-toolbar-input tdh-filter-input" placeholder="80 / 8000-80" v-model="moSpUserPort" /></label>
              <label class="tdh-filter-field"><select class="ou-toolbar-select" v-model="moSpNodeType"><option value="任意IP">任意IP</option><option value="源IP">源IP</option><option value="目标IP">目标IP</option></select><input class="ou-toolbar-input tdh-filter-input" placeholder="任意IP" v-model="moSpNodeValue" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">节点端口</span><input class="ou-toolbar-input tdh-filter-input" placeholder="80 / 8000-80" v-model="moSpNodePort" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">传输协议</span><select class="ou-toolbar-select" v-model="moSpProto"><option value="任意">任意</option><option value="TCP">TCP</option><option value="UDP">UDP</option></select></label>
            </div>
            <div class="tdh-filter-row tdh-filter-row-actions">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">域名</span><input class="ou-toolbar-input tdh-filter-input" v-model="moSpDomain" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">应用协议</span><select class="ou-toolbar-select" v-model="moSpAppProto"><option value="任意协议">任意协议</option></select></label>
              <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" v-model="moSpTimeRange" /></label>
              <button type="button" class="ou-search-btn" @click="searchMoSpData">搜索</button>
              <button type="button" class="secondary td-reset-btn" @click="resetMoSpFilters">重置</button>
              <button type="button" class="td-more-btn">更多条件 </button>
            </div>
          </div>
          <div class="ou-table-wrap sp-table-wrap">
            <table class="ou-table sp-table">
              <thead><tr><th class="col-check"><input type="checkbox" /></th><th class="col-time">请求时间</th><th class="col-mac">MAC</th><th class="col-mac-vendor">MAC厂商</th><th class="col-user">用户名称</th><th class="col-endpoint">用户IP</th><th class="col-endpoint">节点IP</th><th class="col-geo">目标地理位置</th><th class="col-proto">传输协议</th><th class="col-proto-name">协议名称</th><th class="col-traffic">上行流量</th><th class="col-traffic">下行流量</th><th class="col-traffic">总流量</th><th class="col-proto-type">协议类型</th><th class="col-domain">域名</th><th class="col-link">链路</th><th class="col-suspect">疑似度</th><th class="col-model">分析模型</th><th class="col-actions">操作</th></tr></thead>
              <tbody>
                <tr v-for="(r, i) in moSpData.slice((moSpPage-1)*moSpPageSize, moSpPage*moSpPageSize)" :key="i">
                  <td class="col-check"><input type="checkbox" /></td>
                  <td class="col-time">{{ r.t }}</td>
                  <td class="col-mac">{{ r.mac }}</td>
                  <td class="col-mac-vendor"><span class="dt-ellipsis" style="max-width:100px">{{ r.vendor }}</span></td>
                  <td class="col-user">—</td>
                  <td class="col-endpoint"><span class="sp-endpoint">{{ r.userIp }}</span></td>
                  <td class="col-endpoint"><span class="sp-endpoint">{{ r.nodeIp }}</span></td>
                  <td class="col-geo"><span class="sp-geo-tag">{{ getGeoFlagUrl(getGeoFlag('美国')) }} 美国</span></td>
                  <td class="col-proto">{{ r.proto }}</td>
                  <td class="col-proto-name">{{ r.protoName }}</td>
                  <td class="col-traffic ou-num">{{ r.up }}</td>
                  <td class="col-traffic ou-num">{{ r.dn }}</td>
                  <td class="col-traffic ou-num">{{ r.total }}</td>
                  <td class="col-proto-type">—</td>
                  <td class="col-domain">—</td>
                  <td class="col-link">—</td>
                  <td class="col-suspect"><span class="cbm-suspect-badge cbm-suspect-high">高</span></td>
                  <td class="col-model">基于VPN应用</td>
                  <td class="col-actions"><button class="link-btn" @click="openPacketAnalysis(r)">数据包</button></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="ou-footer sp-footer">
            <div class="ou-footer-left"><div class="ou-pager"><button class="ou-page-btn" :disabled="moSpPage<=1" @click="moSpPage--">‹</button><button v-for="p in getPageList(moSpPage, Math.ceil(moSpTotal/moSpPageSize))" :key="p" class="ou-page-btn" :class="{active:moSpPage===p}" @click="moSpPage=p">{{ p }}</button><button class="ou-page-btn" :disabled="moSpPage>=Math.ceil(moSpTotal/moSpPageSize)" @click="moSpPage++">›</button></div></div>
            <div class="ou-footer-right"><label class="ou-page-goto">到第 <input class="ou-page-goto-input" v-model.number="moSpPage" /> 页 <button class="ou-page-goto-btn" @click="moSpPage=Math.min(Math.max(1,moSpPage),Math.ceil(moSpTotal/moSpPageSize))">确定</button></label><span>共 {{ moSpTotal }} 条</span><label class="ou-page-size"><select v-model.number="moSpPageSize"><option :value="20">20条/页</option><option :value="50">50条/页</option><option :value="100">100条/页</option></select></label></div>
          </div>
        </div>
      </el-dialog>

      <!-- 4. VPN应用 -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'vpn-apps' }">
        <div class="tid-page">
          <div class="tdh-filters">
            <div class="tdh-filter-row">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">MAC</span><input class="ou-toolbar-input tdh-filter-input" v-model="vaMac" /></label>
              <label class="tdh-filter-field"><select class="ou-toolbar-select" v-model="vaSrcType"><option value="任意IP">任意IP</option><option value="源IP">源IP</option><option value="目标IP">目标IP</option></select><input class="ou-toolbar-input tdh-filter-input" placeholder="任意IP" v-model="vaSrcValue" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">源端口</span><input class="ou-toolbar-input tdh-filter-input" placeholder="80 / 8000-8080" v-model="vaSrcPort" /></label>
              <label class="tdh-filter-field"><select class="ou-toolbar-select" v-model="vaDstType"><option value="任意IP">任意IP</option><option value="源IP">源IP</option><option value="目标IP">目标IP</option></select><input class="ou-toolbar-input tdh-filter-input" placeholder="任意IP" v-model="vaDstValue" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">目标端口</span><input class="ou-toolbar-input tdh-filter-input" placeholder="80 / 8000-8080" v-model="vaDstPort" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">应用协议</span><input class="ou-toolbar-input tdh-filter-input" placeholder="任意协议" v-model="vaAppProto" /></label>
            </div>
            <div class="tdh-filter-row tdh-filter-row-actions">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">应用协议</span><select class="ou-toolbar-select" v-model="vaProtoType"><option value="任意协议">任意协议</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">域名</span><select class="ou-toolbar-select" v-model="vaDomain"><option value="">任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">请求数&gt;=</span><input class="ou-toolbar-input tdh-filter-input" v-model="vaReqMin" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">目标IP区域</span><select class="ou-toolbar-select" v-model="vaRegion"><option value="任意">任意</option><option value="国内">国内</option><option value="国外">国外</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">链路</span><select class="ou-toolbar-select" v-model="vaLink"><option value="任意">任意</option></select></label>
              <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" v-model="vaTimeRange" /></label>
              <button type="button" class="ou-search-btn" @click="searchVaData">搜索</button>
              <button type="button" class="secondary td-reset-btn" @click="resetVaFilters">重置</button>
              <div class="tio-range-btns" style="margin-left:auto"><button class="tio-range-btn active">IPv4</button><button class="tio-range-btn">IPv6</button></div>
            </div>
          </div>
          <div class="cbm-scroll">
            <div class="cbm-mid-grid">
              <section class="tid-chart-panel">
                <div class="tid-chart-head" style="justify-content:space-between">
                  <div class="tid-legend"><span class="tid-legend-item"><i class="tid-legend-dot" style="background:#5470c6"></i>所有协议</span></div>
                </div>
                <div class="tid-chart-body"><span class="tid-yunit">#Session</span><div class="to-chart-plot"><v-chart :option="vaTrendOption" autoresize style="width:100%;height:300px;" /></div></div>
                <div class="dtt-chart-stats"><span class="dtt-stat"><i class="dtt-stat-badge max">MAX</i>最大值 <strong>7</strong></span><span class="dtt-stat"><i class="dtt-stat-badge min">MIN</i>最小值 <strong>0</strong></span><span class="dtt-stat"><i class="dtt-stat-badge avg">AVG</i>平均值 <strong>3</strong></span></div>
              </section>
              <section class="tid-chart-panel">
                <div class="tid-chart-body"><div class="to-chart-plot"><v-chart :option="vaPieOption" autoresize style="width:100%;height:300px;" /></div></div>
              </section>
            </div>
            <div class="cbm-bottom-grid">
              <section class="tid-mini-panel">
                <div class="tid-mini-head"><h3 class="tid-mini-title">应用数:<em class="cbm-count">4</em></h3><button class="tid-expand-btn">⛶</button></div>
                <div class="ou-table-wrap tid-mini-table-wrap">
                  <table class="ou-table tid-mini-table">
                    <thead><tr><th class="col-idx">序号</th><th>应用名称</th><th class="ou-num">请求数</th><th class="ou-num">流量</th></tr></thead>
                    <tbody>
                      <tr v-for="(r,i) in vaAppRows" :key="i">
                        <td class="col-idx">{{ i+1 }}</td>
                        <td><span class="tid-link" @click="openVaAppDetail(r[0])">{{ r[0] }}</span></td>
                        <td class="ou-num">{{ r[1] }}</td>
                        <td class="ou-num">{{ r[2] }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
              <section class="tid-mini-panel">
                <div class="tid-mini-head"><h3 class="tid-mini-title">目标节点数:<em class="cbm-count">9</em> <span class="cbm-sub-title">国外节点数:<em class="cbm-count">3</em></span></h3><button class="tid-expand-btn">⛶</button></div>
                <div class="ou-table-wrap tid-mini-table-wrap">
                  <table class="ou-table tid-mini-table">
                    <thead><tr><th class="col-idx">序号</th><th>目标IP</th><th>位置</th><th class="ou-num">请求数</th><th class="ou-num">流量</th></tr></thead>
                    <tbody>
                      <tr v-for="(r,i) in vaDstRows.slice((vaDstPage-1)*vaDstPageSize, vaDstPage*vaDstPageSize)" :key="i">
                        <td class="col-idx">{{ (vaDstPage-1)*vaDstPageSize + i + 1 }}</td>
                        <td><span class="tid-link" @click="openVaAppDetail('泡芙云')">{{ r[0] }}</span></td>
                        <td>{{ r[1] }}</td>
                        <td class="ou-num">{{ r[2] }}</td>
                        <td class="ou-num">{{ r[3] }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="ou-footer">
                  <div class="ou-footer-left"><div class="ou-pager"><button class="ou-page-btn" :disabled="vaDstPage<=1" @click="vaDstPage--">‹</button><button v-for="p in getPageList(vaDstPage, Math.ceil(vaDstTotal/vaDstPageSize))" :key="p" class="ou-page-btn" :class="{active:vaDstPage===p}" @click="vaDstPage=p">{{ p }}</button><button class="ou-page-btn" :disabled="vaDstPage>=Math.ceil(vaDstTotal/vaDstPageSize)" @click="vaDstPage++">›</button></div></div>
                  <div class="ou-footer-right"><label class="ou-page-goto">到第 <input class="ou-page-goto-input" v-model.number="vaDstPage" /> 页 <button class="ou-page-goto-btn" @click="vaDstPage=Math.min(Math.max(1,vaDstPage),Math.ceil(vaDstTotal/vaDstPageSize))">确定</button></label><span>共 {{ vaDstTotal }} 条</span><label class="ou-page-size"><select v-model.number="vaDstPageSize"><option :value="20">20条/页</option><option :value="50">50条/页</option><option :value="100">100条/页</option></select></label></div>
                </div>
              </section>
              <section class="tid-mini-panel">
                <div class="tid-mini-head"><h3 class="tid-mini-title">节点域名数:<em class="cbm-count">1</em></h3><button class="tid-expand-btn"></button></div>
                <div class="ou-table-wrap tid-mini-table-wrap">
                  <table class="ou-table tid-mini-table">
                    <thead><tr><th class="col-idx">序号</th><th>目标域名</th><th class="ou-num">请求数</th><th class="ou-num">流量</th></tr></thead>
                    <tbody>
                      <tr v-for="(r,i) in vaDomRows" :key="i">
                        <td class="col-idx">{{ i+1 }}</td>
                        <td><span class="tid-link dt-ellipsis">{{ r[0] }}</span></td>
                        <td class="ou-num">{{ r[1] }}</td>
                        <td class="ou-num">{{ r[2] }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="ou-footer">
                  <div class="ou-footer-left"><div class="ou-pager"><button class="ou-page-btn" disabled>‹</button><button class="ou-page-btn active">1</button><button class="ou-page-btn" disabled>›</button></div></div>
                  <div class="ou-footer-right"><span>共 1 条</span></div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <!-- VPN应用 - 应用详情弹窗 -->
      <el-dialog v-model="vaAppDetailVisible" :title="vaAppDetailTitle" width="1400px" :close-on-click-modal="false" @close="vaAppDetailVisible = false">
        <div class="sp-page">
          <div class="tdh-filters sp-filters">
            <div class="tdh-filter-row">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">MAC</span><input class="ou-toolbar-input tdh-filter-input" v-model="vaAdMac" /></label>
              <label class="tdh-filter-field"><select class="ou-toolbar-select" v-model="vaAdSrcType"><option value="任意IP">任意IP</option><option value="源IP">源IP</option></select><input class="ou-toolbar-input tdh-filter-input" placeholder="任意IP" v-model="vaAdSrcValue" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">源端口</span><input class="ou-toolbar-input tdh-filter-input" placeholder="80 / 8000-8080" v-model="vaAdSrcPort" /></label>
              <label class="tdh-filter-field"><select class="ou-toolbar-select" v-model="vaAdDstType"><option value="任意IP">任意IP</option><option value="目标IP">目标IP</option></select><input class="ou-toolbar-input tdh-filter-input" placeholder="任意IP" v-model="vaAdDstValue" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">目标端口</span><input class="ou-toolbar-input tdh-filter-input" placeholder="80 / 8000-8080" v-model="vaAdDstPort" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">应用协议</span><select class="ou-toolbar-select" v-model="vaAdAppProto"><option value="泡芙云">泡芙云</option></select></label>
            </div>
            <div class="tdh-filter-row tdh-filter-row-actions">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">域名</span><select class="ou-toolbar-select" v-model="vaAdDomain"><option value="">任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">请求数&gt;=</span><input class="ou-toolbar-input tdh-filter-input" v-model="vaAdReqMin" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">目标IP区域</span><select class="ou-toolbar-select" v-model="vaAdRegion"><option value="任意">任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">链路</span><select class="ou-toolbar-select" v-model="vaAdLink"><option value="任意">任意</option></select></label>
              <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" v-model="vaAdTimeRange" /></label>
              <button type="button" class="ou-search-btn" @click="searchVaAdData">搜索</button>
              <button type="button" class="secondary td-reset-btn" @click="resetVaAdFilters">重置</button>
              <button type="button" class="td-export-btn" style="margin-left:auto"> 导出</button>
              <div class="tio-range-btns"><button class="tio-range-btn active">IPv4</button><button class="tio-range-btn">IPv6</button></div>
            </div>
          </div>
          <div class="cbm-scroll" style="padding:0">
            <div class="cbm-mid-grid">
              <section class="tid-chart-panel">
                <div class="tid-chart-head" style="justify-content:space-between">
                  <div class="tid-legend"><span class="tid-legend-item"><i class="tid-legend-dot" style="background:#5470c6"></i>所有协议</span></div>
                </div>
                <div class="tid-chart-body"><span class="tid-yunit">#Session</span><div class="to-chart-plot"><v-chart :option="vaAdTrendOption" autoresize style="width:100%;height:250px;" /></div></div>
                <div class="dtt-chart-stats"><span class="dtt-stat"><i class="dtt-stat-badge max">MAX</i>最大值 <strong>7</strong></span><span class="dtt-stat"><i class="dtt-stat-badge min">MIN</i>最小值 <strong>0</strong></span><span class="dtt-stat"><i class="dtt-stat-badge avg">AVG</i>平均值 <strong>3</strong></span></div>
              </section>
              <section class="tid-chart-panel">
                <div class="tid-chart-body"><div class="to-chart-plot"><v-chart :option="vaAdPieOption" autoresize style="width:100%;height:250px;" /></div></div>
              </section>
            </div>
            <div class="cbm-bottom-grid">
              <section class="tid-mini-panel">
                <div class="tid-mini-head"><h3 class="tid-mini-title">应用数:<em class="cbm-count">1</em></h3><button class="tid-expand-btn">⛶</button></div>
                <div class="ou-table-wrap tid-mini-table-wrap">
                  <table class="ou-table tid-mini-table">
                    <thead><tr><th class="col-idx">序号</th><th>应用名称</th><th class="ou-num">请求数</th><th class="ou-num">流量</th></tr></thead>
                    <tbody><tr><td class="col-idx">1</td><td>泡芙云</td><td class="ou-num">45</td><td class="ou-num">3.59 M</td></tr></tbody>
                  </table>
                </div>
              </section>
              <section class="tid-mini-panel">
                <div class="tid-mini-head"><h3 class="tid-mini-title">目标节点数:<em class="cbm-count">4</em> <span class="cbm-sub-title">国外节点数:<em class="cbm-count">0</em></span></h3><button class="tid-expand-btn">⛶</button></div>
                <div class="ou-table-wrap tid-mini-table-wrap">
                  <table class="ou-table tid-mini-table">
                    <thead><tr><th class="col-idx">序号</th><th>目标IP</th><th class="ou-num">请求数</th><th class="ou-num">流量</th></tr></thead>
                    <tbody>
                      <tr v-for="(r,i) in vaAdDstRows" :key="i">
                        <td class="col-idx">{{ i+1 }}</td>
                        <td><span class="tid-link">{{ r[0] }}</span></td>
                        <td class="ou-num">{{ r[1] }}</td>
                        <td class="ou-num">{{ r[2] }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="ou-footer">
                  <div class="ou-footer-left"><div class="ou-pager"><button class="ou-page-btn" disabled>‹</button><button class="ou-page-btn active">1</button><button class="ou-page-btn" disabled>›</button></div></div>
                  <div class="ou-footer-right"><span>共 4 条</span></div>
                </div>
              </section>
              <section class="tid-mini-panel">
                <div class="tid-mini-head"><h3 class="tid-mini-title">节点域名数:<em class="cbm-count">0</em></h3><button class="tid-expand-btn"></button></div>
                <div class="ou-table-wrap tid-mini-table-wrap">
                  <table class="ou-table tid-mini-table">
                    <thead><tr><th class="col-idx">序号</th><th>目标域名</th><th class="ou-num">请求数</th><th class="ou-num">流量</th></tr></thead>
                    <tbody><tr><td colspan="4" class="ou-empty">无数据</td></tr></tbody>
                  </table>
                </div>
                <div class="ou-footer">
                  <div class="ou-footer-left"><div class="ou-pager"><button class="ou-page-btn" disabled>‹</button><button class="ou-page-btn" disabled>›</button></div></div>
                  <div class="ou-footer-right"><span>共 0 条</span></div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </el-dialog>

      <!-- 5. 历史会话 -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'history-sessions' }">
        <div class="tdh-filters">
          <div class="tdh-filter-row">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">MAC</span><input class="ou-toolbar-input tdh-filter-input" v-model="hsMac" /></label>
            <label class="tdh-filter-field"><select class="ou-toolbar-select" v-model="hsUserIpType"><option value="任意IP">任意IP</option><option value="用户IP">用户IP</option><option value="节点IP">节点IP</option></select><input class="ou-toolbar-input tdh-filter-input" placeholder="任意IP" v-model="hsUserIpValue" /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">用户端口</span><input class="ou-toolbar-input tdh-filter-input" placeholder="80 / 8000-80" v-model="hsUserPort" /></label>
            <label class="tdh-filter-field"><select class="ou-toolbar-select" v-model="hsNodeIpType"><option value="任意IP">任意IP</option><option value="用户IP">用户IP</option><option value="节点IP">节点IP</option></select><input class="ou-toolbar-input tdh-filter-input" placeholder="任意IP" v-model="hsNodeIpValue" /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">节点端口</span><input class="ou-toolbar-input tdh-filter-input" placeholder="80 / 8000-80" v-model="hsNodePort" /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">传输协议</span><select class="ou-toolbar-select" v-model="hsProto"><option value="任意">任意</option><option value="TCP">TCP</option><option value="UDP">UDP</option></select></label>
          </div>
          <div class="tdh-filter-row tdh-filter-row-actions">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">域名</span><input class="ou-toolbar-input tdh-filter-input" v-model="hsDomain" /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">应用协议</span><input class="ou-toolbar-input tdh-filter-input" placeholder="任意协议" v-model="hsAppProto" /></label>
            <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" v-model="hsTimeRange" /></label>
            <button type="button" class="ou-search-btn" @click="searchHsData">搜索</button>
            <button type="button" class="secondary td-reset-btn" @click="resetHsFilters">重置</button>
            <button type="button" class="td-more-btn">更多条件 ∨</button>
            <div class="tio-range-btns" style="margin-left:auto"><button class="tio-range-btn active">IPv4</button><button class="tio-range-btn">IPv6</button></div>
          </div>
        </div>
        <div class="ou-table-wrap cbm-rs-scroll">
          <table class="ou-table cbm-rs-table">
            <thead><tr><th class="col-check"><input type="checkbox" /></th><th>请求时间</th><th>MAC</th><th>MAC厂商</th><th>用户名称</th><th>用户IP</th><th>节点IP</th><th>目标地理位置</th><th>传输协议</th><th>协议名称</th><th>上行流量</th><th>下行流量</th><th>总流量</th><th>协议类型</th><th>域名</th><th>链路</th><th>疑似度</th><th>分析模型</th><th class="col-actions">操作</th></tr></thead>
            <tbody>
              <tr v-for="(r, i) in hsData.slice((hsPage - 1) * hsPageSize, hsPage * hsPageSize)" :key="i">
                <td class="col-check"><input type="checkbox" /></td>
                <td>{{ r.t }}</td>
                <td>{{ r.mac }}</td>
                <td><span class="dt-ellipsis" style="max-width:100px">{{ r.vendor }}</span></td>
                <td>—</td>
                <td><span class="tid-link" @click="openHsPacket(r)">{{ r.userIp }}</span></td>
                <td><span class="tid-link" @click="openHsPacket(r)">{{ r.nodeIp }}</span></td>
                <td><span class="sp-geo-tag">{{ getGeoFlagUrl(getGeoFlag('北京')) }} 北京</span></td>
                <td>{{ r.proto }}</td>
                <td>{{ r.protoName }}</td>
                <td class="ou-num">{{ r.up }}</td>
                <td class="ou-num">{{ r.dn }}</td>
                <td class="ou-num">{{ r.total }}</td>
                <td>—</td>
                <td>{{ r.domain || '—' }}</td>
                <td>—</td>
                <td><span class="cbm-suspect-badge cbm-suspect-high">高</span></td>
                <td>{{ r.model }}</td>
                <td class="col-actions">
                  <div class="sahs-dropdown">
                    <button type="button" class="link-btn sahs-packet-btn" @click="toggleHsDropdown(i)">数据包</button>
                    <div v-if="hsDropdownIndex === i" class="sahs-dropdown-menu">
                      <a class="sahs-dropdown-item" @click="openPacketAnalysisFromHs(r)">报文分析</a>
                      <a class="sahs-dropdown-item" @click="openPacketPlayFromHs(r)">报文播放</a>
                      <a class="sahs-dropdown-item" @click="downloadPacket(r)">报文下载</a>
                      <a class="sahs-dropdown-item" @click="downloadContent(r)">内容下载</a>
                      <a class="sahs-dropdown-item" @click="openPacketAnalysisFromHs(r)">尾包查询</a>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="ou-footer">
          <div class="ou-footer-left"><div class="ou-pager"><button class="ou-page-btn" :disabled="hsPage <= 1" @click="hsPage--">‹</button><button v-for="p in getPageList(hsPage, Math.ceil(hsTotal / hsPageSize))" :key="p" class="ou-page-btn" :class="{ active: hsPage === p }" @click="hsPage = p">{{ p }}</button><button class="ou-page-btn" :disabled="hsPage >= Math.ceil(hsTotal / hsPageSize)" @click="hsPage++">›</button></div></div>
          <div class="ou-footer-right"><label class="ou-page-goto">到第 <input class="ou-page-goto-input" v-model.number="hsPage" /> 页 <button class="ou-page-goto-btn" @click="hsPage = Math.min(Math.max(1, hsPage), Math.ceil(hsTotal / hsPageSize))">确定</button></label><span>共 {{ hsTotal }} 条</span><label class="ou-page-size"><select v-model.number="hsPageSize"><option :value="20">20条/页</option><option :value="50">50条/页</option><option :value="100">100条/页</option></select></label></div>
        </div>
      </div>

      <!-- 6. 账号统计 -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'account-stats' }">
        <div class="tdh-filters">
          <div class="tdh-filter-row">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">MAC</span><input class="ou-toolbar-input tdh-filter-input" v-model="asMac" /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">应用协议</span><input class="ou-toolbar-input tdh-filter-input" placeholder="任意协议" v-model="asAppProto" /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">分析模型</span><select class="ou-toolbar-select" v-model="asModel"><option value="任意">任意</option><option value="基于VPN协议">基于VPN协议</option><option value="基于VPN应用">基于VPN应用</option><option value="基于网络代理">基于网络代理</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">目标IP区域</span><select class="ou-toolbar-select" v-model="asRegion"><option value="任意">任意</option><option value="国内">国内</option><option value="国外">国外</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">用户名称</span><input class="ou-toolbar-input tdh-filter-input" v-model="asUserName" /></label>
          </div>
          <div class="tdh-filter-row tdh-filter-row-actions">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">域名</span><input class="ou-toolbar-input tdh-filter-input" v-model="asDomain" /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">敏感网站</span><select class="ou-toolbar-select" v-model="asSensitive"><option value="任意">任意</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">链路</span><select class="ou-toolbar-select" v-model="asLink"><option value="任意">任意</option></select></label>
            <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" v-model="asTimeRange" /></label>
            <button type="button" class="ou-search-btn" @click="searchAsData">搜索</button>
            <button type="button" class="secondary td-reset-btn" @click="resetAsFilters">重置</button>
            <button type="button" class="td-more-btn">更多条件 ∨</button>
            <button type="button" class="td-export-btn" style="margin-left:auto">⬇ 导出</button>
          </div>
        </div>
        <div class="ou-table-wrap">
          <table class="ou-table cbm-rs-table">
            <thead><tr><th style="width:40px">详情</th><th class="col-idx">序号</th><th>用户名称</th><th>用户IP</th><th class="ou-num">访问次数</th><th class="ou-num">访问频次</th><th>流量行为</th><th class="ou-num">上行流量</th><th class="ou-num">下行流量</th><th class="ou-num">总流量</th><th>VPN伪装/通信域名</th><th>分析模型</th><th>链路</th><th>应用场景</th><th class="col-actions">操作</th></tr></thead>
            <tbody><tr><td colspan="15" class="ou-empty">无数据</td></tr></tbody>
          </table>
        </div>
        <div class="ou-footer">
          <div class="ou-footer-left"><div class="ou-pager"><button class="ou-page-btn" disabled>‹</button><button class="ou-page-btn active">1</button><button class="ou-page-btn" disabled>›</button></div></div>
          <div class="ou-footer-right"><label class="ou-page-goto">到第 <input class="ou-page-goto-input" value="1" /> 页 <button class="ou-page-goto-btn">确定</button></label><span>共 0 条</span><label class="ou-page-size"><select v-model.number="asPageSize"><option :value="20">20条/页</option><option :value="50">50条/页</option><option :value="100">100条/页</option></select></label></div>
        </div>
      </div>

      <!-- 7. IP统计 -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'ip-stats' }">
        <div class="tdh-filters">
          <div class="tdh-filter-row">
            <label class="tdh-filter-field"><select class="ou-toolbar-select" v-model="ipUserIpType"><option value="任意IP">任意IP</option><option value="用户IP">用户IP</option><option value="节点IP">节点IP</option></select><input class="ou-toolbar-input tdh-filter-input" placeholder="任意IP" v-model="ipUserIpValue" /></label>
            <label class="tdh-filter-field"><select class="ou-toolbar-select" v-model="ipNodeIpType"><option value="任意IP">任意IP</option><option value="节点IP">节点IP</option></select><input class="ou-toolbar-input tdh-filter-input" placeholder="任意IP" v-model="ipNodeIpValue" /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">节点端口</span><input class="ou-toolbar-input tdh-filter-input" placeholder="80 / 8000-8080" v-model="ipNodePort" /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">应用协议</span><select class="ou-toolbar-select" v-model="ipAppProto"><option value="任意协议">任意协议</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">用户名称</span><input class="ou-toolbar-input tdh-filter-input" v-model="ipUserName" /></label>
          </div>
          <div class="tdh-filter-row tdh-filter-row-actions">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">条件关系</span><select class="ou-toolbar-select" v-model="ipCondRelation"><option value="与">与</option><option value="或">或</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">用户组</span><select class="ou-toolbar-select" v-model="ipUserGroup"><option value="任意">任意</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">访问频次</span><select class="ou-toolbar-select" v-model="ipFreq"><option value="任意">任意</option></select></label>
            <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" v-model="ipTimeRange" /></label>
            <button type="button" class="ou-search-btn" @click="searchIpData">搜索</button>
            <button type="button" class="secondary td-reset-btn" @click="resetIpFilters">重置</button>
            <button type="button" class="td-more-btn">更多条件 ∨</button>
          </div>
        </div>
        <div class="ou-table-wrap cbm-rs-scroll">
          <table class="ou-table cbm-rs-table">
            <thead><tr><th style="width:40px">详情</th><th class="col-idx">序号</th><th>用户IP</th><th>用户名称</th><th>外部代理节点</th><th>VPN代理端口</th><th>VPN伪装/通信域名</th><th>协议类型</th><th class="ou-num">访问次数</th><th class="ou-num">访问频次</th><th>流量行为</th><th class="ou-num">上行流量</th><th class="ou-num">下行流量</th><th class="ou-num">总流量</th><th>应用协议</th><th>应用场景</th><th>链路</th><th class="col-actions">操作</th></tr></thead>
            <tbody>
              <tr v-for="(r, i) in ipData.slice((ipPage - 1) * ipPageSize, ipPage * ipPageSize)" :key="i">
                <td style="width:40px"><span class="tid-expand-icon" @click="r._expanded = !r._expanded">{{ r._expanded ? '' : '›' }}</span></td>
                <td class="col-idx">{{ (ipPage - 1) * ipPageSize + i + 1 }}</td>
                <td><span class="tid-link" @click="openIpDnsSession(r)">{{ r.userIp }}</span></td>
                <td>—</td>
                <td><span class="tid-link">{{ r.nodeIp }}</span> <span class="sp-geo-tag">{{ getGeoFlagUrl(getGeoFlag(r.geo)) }} {{ r.geo }}</span></td>
                <td>{{ r.port }}</td>
                <td>{{ r.domain || '—' }}</td>
                <td>{{ r.protoType }}</td>
                <td class="ou-num">{{ r.visitCount }}</td>
                <td class="ou-num">{{ r.freq }}</td>
                <td><span class="cbm-behavior-badge" :class="'cbm-behavior-' + r.behavior">{{ r.behaviorLabel }}</span></td>
                <td class="ou-num">{{ r.up }}</td>
                <td class="ou-num">{{ r.dn }}</td>
                <td class="ou-num">{{ r.total }}</td>
                <td>{{ r.appProto }}</td>
                <td>{{ r.scene }}</td>
                <td>{{ r.link }}</td>
                <td class="col-actions">
                  <span class="tid-link" @click="openIpDnsSession(r)">DNS会话</span>
                  <span class="tid-link" style="margin-left:8px" @click="openIpHistorySession(r)">会话详细</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="ou-footer">
          <div class="ou-footer-left"><div class="ou-pager"><button class="ou-page-btn" :disabled="ipPage <= 1" @click="ipPage--">‹</button><button v-for="p in getPageList(ipPage, Math.ceil(ipTotal / ipPageSize))" :key="p" class="ou-page-btn" :class="{ active: ipPage === p }" @click="ipPage = p">{{ p }}</button><button class="ou-page-btn" :disabled="ipPage >= Math.ceil(ipTotal / ipPageSize)" @click="ipPage++">›</button></div></div>
          <div class="ou-footer-right"><label class="ou-page-goto">到第 <input class="ou-page-goto-input" v-model.number="ipPage" /> 页 <button class="ou-page-goto-btn" @click="ipPage = Math.min(Math.max(1, ipPage), Math.ceil(ipTotal / ipPageSize))">确定</button></label><span>共 {{ ipTotal }} 条</span><label class="ou-page-size"><select v-model.number="ipPageSize"><option :value="20">20条/页</option><option :value="50">50条/页</option><option :value="100">100条/页</option></select></label></div>
        </div>
      </div>

      <!-- IP统计 - DNS会话弹窗 -->
      <el-dialog v-model="ipDnsSessionVisible" title="DNS会话" width="1400px" :close-on-click-modal="false" @close="ipDnsSessionVisible = false">
        <div class="sp-page">
          <div class="tdh-filters sp-filters">
            <div class="tdh-filter-row">
              <label class="tdh-filter-field"><select class="ou-toolbar-select" v-model="ipDnsIpType"><option value="单个IP">单个IP</option><option value="任意IP">任意IP</option></select><input class="ou-toolbar-input tdh-filter-input" v-model="ipDnsIpValue" /><span v-if="ipDnsIpValue" class="tdh-filter-tag" @click="ipDnsIpValue = ''">✕</span></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">过滤源</span><select class="ou-toolbar-select" v-model="ipDnsFilterSrc"><option value="否">否</option><option value="是">是</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">源端口</span><input class="ou-toolbar-input tdh-filter-input" placeholder="80 / 8000-8080" v-model="ipDnsSrcPort" /></label>
              <label class="tdh-filter-field"><select class="ou-toolbar-select" v-model="ipDnsDstIpType"><option value="任意IP">任意IP</option><option value="目标IP">目标IP</option></select><input class="ou-toolbar-input tdh-filter-input" placeholder="任意IP" v-model="ipDnsDstIpValue" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">过滤目标</span><select class="ou-toolbar-select" v-model="ipDnsFilterDst"><option value="否">否</option><option value="是">是</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">目标端口</span><input class="ou-toolbar-input tdh-filter-input" placeholder="80 / 8000-8080" v-model="ipDnsDstPort" /></label>
            </div>
            <div class="tdh-filter-row tdh-filter-row-actions">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">MAC</span><input class="ou-toolbar-input tdh-filter-input" v-model="ipDnsMac" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">域名</span><select class="ou-toolbar-select" v-model="ipDnsDomain"><option value="">任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">客户时延&gt;=</span><input class="ou-toolbar-input tdh-filter-input" placeholder="ms" v-model="ipDnsClientLatency" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">服务时延&gt;=</span><input class="ou-toolbar-input tdh-filter-input" placeholder="ms" v-model="ipDnsServerLatency" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">应用时延&gt;=</span><input class="ou-toolbar-input tdh-filter-input" placeholder="ms" v-model="ipDnsAppLatency" /></label>
            </div>
            <div class="tdh-filter-row tdh-filter-row-actions">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">传输协议</span><select class="ou-toolbar-select" v-model="ipDnsProto"><option value="任意">任意</option><option value="TCP">TCP</option><option value="UDP">UDP</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">连接类型</span><select class="ou-toolbar-select" v-model="ipDnsConnType"><option value="所有">所有</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">条件关系</span><select class="ou-toolbar-select" v-model="ipDnsCondRelation"><option value="与">与</option><option value="或">或</option></select></label>
              <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" v-model="ipDnsTimeRange" /></label>
              <button type="button" class="ou-search-btn" @click="searchIpDnsData">搜索</button>
              <button type="button" class="secondary td-reset-btn" @click="resetIpDnsFilters">重置</button>
              <button type="button" class="td-more-btn">更多条件 ∧</button>
              <div class="tio-range-btns" style="margin-left:auto"><button class="tio-range-btn active">IPv4</button><button class="tio-range-btn">IPv6</button></div>
            </div>
          </div>
          <div class="ou-table-wrap cbm-rs-scroll" style="max-height:400px">
            <table class="ou-table cbm-rs-table">
              <thead><tr><th class="col-check"><input type="checkbox" /></th><th>请求时间</th><th>MAC</th><th>MAC厂商</th><th>用户名称</th><th>源IP</th><th>目标IP</th><th>目标地理位置</th><th>传输协议</th><th>请求域名</th><th>敏感网站</th><th class="col-actions">操作</th></tr></thead>
              <tbody>
                <tr v-for="(r, i) in ipDnsRows" :key="i">
                  <td class="col-check"><input type="checkbox" /></td>
                  <td>{{ r.t }}</td>
                  <td>{{ r.mac }}</td>
                  <td><span class="dt-ellipsis" style="max-width:100px">{{ r.vendor }}</span></td>
                  <td>—</td>
                  <td><span class="tid-link">{{ r.srcIp }}</span></td>
                  <td><span class="tid-link">{{ r.dstIp }}</span></td>
                  <td><span class="sp-geo-tag">{{ getGeoFlagUrl(getGeoFlag('美国')) }} 美国</span></td>
                  <td>{{ r.proto }}</td>
                  <td>{{ r.domain || '-' }}</td>
                  <td>—</td>
                  <td class="col-actions"><span class="tid-link" @click="openPacketAnalysisFromIp(r)">数据包</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="ou-footer">
            <div class="ou-footer-left"><div class="ou-pager"><button class="ou-page-btn" disabled>‹</button><button class="ou-page-btn active">1</button><button class="ou-page-btn">›</button></div></div>
            <div class="ou-footer-right"><label class="ou-page-goto">到第 <input class="ou-page-goto-input" value="1" /> 页 <button class="ou-page-goto-btn">确定</button></label><span>共 700 条</span></div>
          </div>
        </div>
      </el-dialog>

      <!-- IP统计 - 历史会话弹窗 -->
      <el-dialog v-model="ipHistorySessionVisible" title="历史会话" width="1400px" :close-on-click-modal="false" @close="ipHistorySessionVisible = false">
        <div class="sp-page">
          <div class="tdh-filters sp-filters">
            <div class="tdh-filter-row">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">MAC</span><input class="ou-toolbar-input tdh-filter-input" v-model="ipHsMac" /></label>
              <label class="tdh-filter-field"><select class="ou-toolbar-select" v-model="ipHsIpType"><option value="单个IP">单个IP</option><option value="任意IP">任意IP</option></select><input class="ou-toolbar-input tdh-filter-input" v-model="ipHsIpValue" /><span v-if="ipHsIpValue" class="tdh-filter-tag" @click="ipHsIpValue = ''">✕</span></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">用户端口</span><input class="ou-toolbar-input tdh-filter-input" placeholder="80 / 8000-80" v-model="ipHsUserPort" /></label>
              <label class="tdh-filter-field"><select class="ou-toolbar-select" v-model="ipHsNodeIpType"><option value="任意IP">任意IP</option><option value="节点IP">节点IP</option></select><input class="ou-toolbar-input tdh-filter-input" placeholder="任意IP" v-model="ipHsNodeIpValue" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">节点端口</span><input class="ou-toolbar-input tdh-filter-input" placeholder="80 / 8000-80" v-model="ipHsNodePort" /></label>
            </div>
            <div class="tdh-filter-row tdh-filter-row-actions">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">传输协议</span><select class="ou-toolbar-select" v-model="ipHsProto"><option value="任意">任意</option><option value="TCP">TCP</option><option value="UDP">UDP</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">域名</span><select class="ou-toolbar-select" v-model="ipHsDomain"><option value="">任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">应用协议</span><input class="ou-toolbar-input tdh-filter-input" placeholder="任意协议" v-model="ipHsAppProto" /></label>
              <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" v-model="ipHsTimeRange" /></label>
              <button type="button" class="ou-search-btn" @click="searchIpHsData">搜索</button>
              <button type="button" class="secondary td-reset-btn" @click="resetIpHsFilters">重置</button>
              <button type="button" class="td-more-btn">更多条件 ∨</button>
            </div>
          </div>
          <div class="ou-table-wrap cbm-rs-scroll" style="max-height:400px">
            <table class="ou-table cbm-rs-table">
              <thead><tr><th class="col-check"><input type="checkbox" /></th><th>请求时间</th><th>MAC</th><th>MAC厂商</th><th>用户名称</th><th>用户IP</th><th>节点IP</th><th>目标地理位置</th><th>传输协议</th><th>协议名称</th><th>上行流量</th><th>下行流量</th><th>总流量</th><th>协议类型</th><th class="col-actions">操作</th></tr></thead>
              <tbody>
                <tr v-for="(r, i) in ipHsRows" :key="i">
                  <td class="col-check"><input type="checkbox" /></td>
                  <td>{{ r.t }}</td>
                  <td>{{ r.mac }}</td>
                  <td><span class="dt-ellipsis" style="max-width:100px">{{ r.vendor }}</span></td>
                  <td>—</td>
                  <td><span class="tid-link">{{ r.userIp }}</span></td>
                  <td><span class="tid-link">{{ r.nodeIp }}</span></td>
                  <td><span class="sp-geo-tag">{{ getGeoFlagUrl(getGeoFlag('美国')) }} 美国</span></td>
                  <td>{{ r.proto }}</td>
                  <td>{{ r.protoName }}</td>
                  <td class="ou-num">{{ r.up }}</td>
                  <td class="ou-num">{{ r.dn }}</td>
                  <td class="ou-num">{{ r.total }}</td>
                  <td>—</td>
                  <td class="col-actions"><span class="tid-link" @click="openPacketAnalysisFromIp(r)">数据包</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="ou-footer">
            <div class="ou-footer-left"><div class="ou-pager"><button class="ou-page-btn" disabled>‹</button><button class="ou-page-btn active">1</button><button class="ou-page-btn" disabled>›</button></div></div>
            <div class="ou-footer-right"><label class="ou-page-goto">到第 <input class="ou-page-goto-input" value="1" /> 页 <button class="ou-page-goto-btn">确定</button></label><span>共 3 条</span></div>
          </div>
        </div>
      </el-dialog>

      <!-- 8. VPS节点 -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'vps-nodes' }">
        <div class="tdh-filters">
          <div class="tdh-filter-row">
            <label class="tdh-filter-field"><select class="ou-toolbar-select" v-model="vpsNodeIpType"><option value="任意IP">任意IP</option><option value="节点IP">节点IP</option></select><input class="ou-toolbar-input tdh-filter-input" placeholder="任意IP" v-model="vpsNodeIpValue" /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">节点端口</span><input class="ou-toolbar-input tdh-filter-input" placeholder="80 / 8000-8080" v-model="vpsNodePort" /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">协议类型</span><select class="ou-toolbar-select" v-model="vpsProtoType"><option value="任意">任意</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">用户名称</span><select class="ou-toolbar-select" v-model="vpsUserName"><option value="任意">任意</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">敏感网站</span><select class="ou-toolbar-select" v-model="vpsSensitive"><option value="任意">任意</option></select></label>
          </div>
          <div class="tdh-filter-row tdh-filter-row-actions">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">目标节点区域</span><select class="ou-toolbar-select" v-model="vpsRegion"><option value="任意">任意</option><option value="国内">国内</option><option value="国外">国外</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">域名</span><input class="ou-toolbar-input tdh-filter-input" v-model="vpsDomain" /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">链路</span><select class="ou-toolbar-select" v-model="vpsLink"><option value="任意">任意</option></select></label>
            <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" v-model="vpsTimeRange" /></label>
            <button type="button" class="ou-search-btn" @click="searchVpsData">搜索</button>
            <button type="button" class="secondary td-reset-btn" @click="resetVpsFilters">重置</button>
            <button type="button" class="td-more-btn">更多条件 ∨</button>
            <div class="tio-range-btns" style="margin-left:auto"><button class="tio-range-btn active">IPv4</button><button class="tio-range-btn">IPv6</button></div>
          </div>
        </div>
        <div class="ou-table-wrap cbm-rs-scroll">
          <table class="ou-table cbm-rs-table">
            <thead><tr><th class="col-idx">序号</th><th>外部代理节点 <span class="tid-sort-icon">⇅</span></th><th>节点地理位置</th><th>VPN代理端口</th><th>VPN伪装/通信域名</th><th>协议类型</th><th class="ou-num">访问次数</th><th class="ou-num">访问频次 <span class="tid-sort-icon">⇅</span></th><th class="ou-num">上行流量 <span class="tid-sort-icon">⇅</span></th><th class="ou-num">下行流量 <span class="tid-sort-icon">⇅</span></th><th class="ou-num">总流量 <span class="tid-sort-icon">⇅</span></th><th>用户名称</th><th class="col-actions">操作</th></tr></thead>
            <tbody>
              <tr v-for="(r, i) in vpsData.slice((vpsPage - 1) * vpsPageSize, vpsPage * vpsPageSize)" :key="i">
                <td class="col-idx">{{ (vpsPage - 1) * vpsPageSize + i + 1 }}</td>
                <td><span class="tid-link" @click="openVpsSession(r)">{{ r.nodeIp }}</span></td>
                <td><span class="sp-geo-tag">{{ getGeoFlagUrl(getGeoFlag(r.geo)) }} {{ r.geo }}</span></td>
                <td>{{ r.port }}</td>
                <td><span v-if="r.domain" class="tid-link dt-ellipsis">{{ r.domain }}</span><span v-else>—</span></td>
                <td>{{ r.protoType }}</td>
                <td class="ou-num">{{ r.visitCount }}</td>
                <td class="ou-num"><span class="cbm-freq-badge" :class="'cbm-freq-' + r.freqType">{{ r.freqLabel }}</span></td>
                <td class="ou-num">{{ r.up }}</td>
                <td class="ou-num">{{ r.dn }}</td>
                <td class="ou-num">{{ r.total }}</td>
                <td>—</td>
                <td class="col-actions"><span class="tid-link" @click="openVpsSession(r)"> 会话详细</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="ou-footer">
          <div class="ou-footer-left"><div class="ou-pager"><button class="ou-page-btn" :disabled="vpsPage <= 1" @click="vpsPage--">‹</button><button v-for="p in getPageList(vpsPage, Math.ceil(vpsTotal / vpsPageSize))" :key="p" class="ou-page-btn" :class="{ active: vpsPage === p }" @click="vpsPage = p">{{ p }}</button><button class="ou-page-btn" :disabled="vpsPage >= Math.ceil(vpsTotal / vpsPageSize)" @click="vpsPage++">›</button></div></div>
          <div class="ou-footer-right"><label class="ou-page-goto">到第 <input class="ou-page-goto-input" v-model.number="vpsPage" /> 页 <button class="ou-page-goto-btn" @click="vpsPage = Math.min(Math.max(1, vpsPage), Math.ceil(vpsTotal / vpsPageSize))">确定</button></label><span>共 {{ vpsTotal }} 条</span><label class="ou-page-size"><select v-model.number="vpsPageSize"><option :value="20">20条/页</option><option :value="50">50条/页</option><option :value="100">100条/页</option></select></label></div>
        </div>
      </div>

      <!-- VPS节点 - 历史会话弹窗 -->
      <el-dialog v-model="vpsSessionVisible" title="历史会话" width="1400px" :close-on-click-modal="false" @close="vpsSessionVisible = false">
        <div class="sp-page">
          <div class="tdh-filters sp-filters">
            <div class="tdh-filter-row">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">MAC</span><input class="ou-toolbar-input tdh-filter-input" v-model="vpsHsMac" /></label>
              <label class="tdh-filter-field"><select class="ou-toolbar-select" v-model="vpsHsUserIpType"><option value="任意IP">任意IP</option><option value="用户IP">用户IP</option></select><input class="ou-toolbar-input tdh-filter-input" placeholder="任意IP" v-model="vpsHsUserIpValue" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">用户端口</span><input class="ou-toolbar-input tdh-filter-input" placeholder="80 / 8000-80" v-model="vpsHsUserPort" /></label>
              <label class="tdh-filter-field"><select class="ou-toolbar-select" v-model="vpsHsSingleIpType"><option value="单个IP">单个IP</option><option value="任意IP">任意IP</option></select><input class="ou-toolbar-input tdh-filter-input" v-model="vpsHsSingleIpValue" /><span v-if="vpsHsSingleIpValue" class="tdh-filter-tag" @click="vpsHsSingleIpValue = ''">✕</span></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">节点端口</span><input class="ou-toolbar-input tdh-filter-input" placeholder="443" v-model="vpsHsNodePort" /><span v-if="vpsHsNodePort" class="tdh-filter-tag" @click="vpsHsNodePort = ''">✕</span></label>
            </div>
            <div class="tdh-filter-row tdh-filter-row-actions">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">传输协议</span><select class="ou-toolbar-select" v-model="vpsHsProto"><option value="任意">任意</option><option value="TCP">TCP</option><option value="UDP">UDP</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">域名</span><select class="ou-toolbar-select" v-model="vpsHsDomain"><option value="">任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">应用协议</span><input class="ou-toolbar-input tdh-filter-input" placeholder="任意协议" v-model="vpsHsAppProto" /></label>
              <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" v-model="vpsHsTimeRange" /></label>
              <button type="button" class="ou-search-btn" @click="searchVpsHsData">搜索</button>
              <button type="button" class="secondary td-reset-btn" @click="resetVpsHsFilters">重置</button>
              <button type="button" class="td-more-btn">更多条件 ∨</button>
            </div>
          </div>
          <div class="ou-table-wrap cbm-rs-scroll" style="max-height:400px">
            <table class="ou-table cbm-rs-table">
              <thead><tr><th class="col-check"><input type="checkbox" /></th><th>请求时间</th><th>MAC</th><th>MAC厂商</th><th>用户名称</th><th>用户IP</th><th>节点IP</th><th>目标地理位置</th><th>传输协议</th><th>协议名称</th><th>上行流量</th><th>下行流量</th><th>总流量</th><th>协议类型</th><th class="col-actions">操作</th></tr></thead>
              <tbody>
                <tr v-for="(r, i) in vpsHsRows" :key="i">
                  <td class="col-check"><input type="checkbox" /></td>
                  <td>{{ r.t }}</td>
                  <td>{{ r.mac }}</td>
                  <td><span class="dt-ellipsis" style="max-width:100px">{{ r.vendor }}</span></td>
                  <td>—</td>
                  <td><span class="tid-link">{{ r.userIp }}</span></td>
                  <td><span class="tid-link">{{ r.nodeIp }}</span></td>
                  <td><span class="sp-geo-tag">{{ getGeoFlagUrl(getGeoFlag(r.geo)) }} {{ r.geo }}</span></td>
                  <td>{{ r.proto }}</td>
                  <td>{{ r.protoName }}</td>
                  <td class="ou-num">{{ r.up }}</td>
                  <td class="ou-num">{{ r.dn }}</td>
                  <td class="ou-num">{{ r.total }}</td>
                  <td>—</td>
                  <td class="col-actions"><span class="tid-link" @click="openPacketAnalysisFromVps(r)">📦 数据包</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="ou-footer">
            <div class="ou-footer-left"><div class="ou-pager"><button class="ou-page-btn" disabled>‹</button><button class="ou-page-btn active">1</button><button class="ou-page-btn" disabled>›</button></div></div>
            <div class="ou-footer-right"><label class="ou-page-goto">到第 <input class="ou-page-goto-input" value="1" /> 页 <button class="ou-page-goto-btn">确定</button></label><span>共 2 条</span></div>
          </div>
        </div>
      </el-dialog>

      <!-- 9. 跨境阻断 -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'cross-border-block' }">
        <div class="cbm-cb-page">
          <aside class="cbm-cb-sidebar">
            <div class="cbm-cb-sidebar-head">
              <span class="cbm-cb-sidebar-title"><span class="cbm-cb-sidebar-icon">🖥</span> 设备</span>
              <button type="button" class="cbm-cb-add-btn" title="添加设备" @click="openAddDeviceDialog">+</button>
            </div>
            <div class="cbm-cb-sidebar-body">
              <ul class="cbm-cb-device-list">
                <li v-for="(dev, idx) in cbDevices" :key="idx" class="cbm-cb-device-item" :class="{ active: cbSelectedDevice === idx }" @click="cbSelectedDevice = idx">
                  <span class="cbm-cb-device-icon"></span>
                  <span class="cbm-cb-device-name">{{ dev.name }}</span>
                  <span class="cbm-cb-device-ip">{{ dev.ip }}</span>
                </li>
              </ul>
              <p v-if="cbDevices.length === 0" class="ou-empty" style="padding:24px">暂无设备</p>
            </div>
          </aside>
          <div class="cbm-cb-main">
            <template v-if="cbSelectedDevice >= 0">
              <div class="cbm-cb-detail-head">
                <h3 class="cbm-cb-detail-title">🖥 {{ cbDevices[cbSelectedDevice].name }}</h3>
                <div class="cbm-cb-detail-actions">
                  <button class="cbm-cb-action-btn" @click="openEditDeviceDialog">✏️ 编辑</button>
                  <button class="cbm-cb-action-btn cbm-cb-action-danger" @click="deleteDevice">🗑 删除</button>
                </div>
              </div>
              <div class="cbm-cb-detail-body">
                <table class="cbm-cb-detail-table">
                  <tr><th>设备类型</th><td>{{ cbDevices[cbSelectedDevice].type }}</td></tr>
                  <tr><th>设备名称</th><td>{{ cbDevices[cbSelectedDevice].name }}</td></tr>
                  <tr><th>管理口IP</th><td>{{ cbDevices[cbSelectedDevice].ip }}</td></tr>
                  <tr><th>端口</th><td>{{ cbDevices[cbSelectedDevice].port }}</td></tr>
                  <tr><th>状态</th><td><span class="cbm-cb-status online">● 在线</span></td></tr>
                  <tr><th>版本</th><td>{{ cbDevices[cbSelectedDevice].version }}</td></tr>
                  <tr><th>许可证</th><td>{{ cbDevices[cbSelectedDevice].license }}</td></tr>
                  <tr><th>添加时间</th><td>{{ cbDevices[cbSelectedDevice].addTime }}</td></tr>
                </table>
              </div>
            </template>
            <p v-else class="ou-empty" style="padding:48px">请从左侧选择设备</p>
          </div>
        </div>
      </div>

      <!-- 添加/编辑设备弹窗 -->
      <el-dialog v-model="cbDeviceDialogVisible" :title="cbDeviceDialogTitle" width="560px" :close-on-click-modal="false" @close="closeDeviceDialog">
        <div class="cbm-cb-form">
          <div class="cbm-cb-form-row">
            <label class="cbm-cb-form-label">设备类型</label>
            <select class="cbm-cb-form-select" v-model="cbDeviceForm.type">
              <option value="Panabit">Panabit</option>
              <option value="深信服">深信服</option>
              <option value="天融信">天融信</option>
            </select>
          </div>
          <div class="cbm-cb-form-row">
            <label class="cbm-cb-form-label">设备名称</label>
            <input class="cbm-cb-form-input" type="text" v-model="cbDeviceForm.name" placeholder="请输入设备名称" />
          </div>
          <div class="cbm-cb-form-row">
            <label class="cbm-cb-form-label">管理口IP</label>
            <input class="cbm-cb-form-input" type="text" v-model="cbDeviceForm.ip" placeholder="请输入管理口IP" />
          </div>
          <div class="cbm-cb-form-row">
            <label class="cbm-cb-form-label">端口</label>
            <input class="cbm-cb-form-input" type="text" v-model="cbDeviceForm.port" placeholder="请输入端口" />
          </div>
        </div>
        <div class="cbm-cb-dialog-footer">
          <button class="cbm-cb-btn-primary" @click="saveDevice">确定</button>
          <button class="cbm-cb-btn-default" @click="closeDeviceDialog">取消</button>
        </div>
      </el-dialog>

      <!-- 10. 参数配置 -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'param-config' }">
        <div class="cbm-pc-page">
          <div class="cbm-pc-subtabs-header">
            <div class="cbm-pc-subtabs" role="tablist">
              <button v-for="s in pcSubtabs" :key="s" type="button" class="cbm-pc-subtab" :class="{ active: pcActive === s }" @click="pcActive = s">{{ s }}</button>
            </div>
          </div>

          <!-- 分析模型 -->
          <div v-if="pcActive === '分析模型'" class="cbm-pc-body">
            <div class="cbm-pc-notice">
              <p>1. "匹配港澳台"和"匹配国外"的开关，全部不开启，则全部进行匹配</p>
              <p>2. 开启"匹配港澳台"，表示仅对去往"港澳台"的地址进行匹配</p>
              <p>3. 开启"匹配国外"，表示仅对去往"国外"的地址进行匹配</p>
              <p>4. 同时开启"匹配港澳台"和"匹配国外"，表示仅对去往"港澳台"和"国外"的地址进行匹配</p>
            </div>
            <div class="ou-table-wrap">
              <table class="ou-table cbm-pc-model-table">
                <thead>
                  <tr>
                    <th class="col-idx">序号</th>
                    <th>分析模型</th>
                    <th>疑似度</th>
                    <th class="ou-num">命中次数</th>
                    <th class="ou-num">白名单次数</th>
                    <th>最后更新时间</th>
                    <th>最近2小时匹配趋势</th>
                    <th>量程</th>
                    <th>告警通知</th>
                    <th>匹配港澳台</th>
                    <th>匹配国外</th>
                    <th>监测</th>
                    <th>自动阻断</th>
                    <th class="col-actions">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(r, i) in pcModelData" :key="i">
                    <td class="col-idx">{{ i + 1 }}</td>
                    <td>{{ r.name }}</td>
                    <td><span class="cbm-pc-suspect" :class="'cbm-pc-suspect-' + r.level">{{ r.levelLabel }}</span></td>
                    <td class="ou-num">{{ r.hits }}</td>
                    <td class="ou-num">{{ r.whitelistHits }}</td>
                    <td>{{ r.lastUpdate }}</td>
                    <td class="cbm-pc-trend-cell"><div class="cbm-pc-trend-bar" :style="{ width: r.trendPct + '%' }"></div></td>
                    <td>{{ r.range }}</td>
                    <td>
                      <label class="cbm-pc-toggle"><input type="checkbox" v-model="r.alertNotify" /><span class="cbm-pc-toggle-slider"></span></label>
                    </td>
                    <td>
                      <label class="cbm-pc-toggle"><input type="checkbox" v-model="r.matchHK" /><span class="cbm-pc-toggle-slider"></span></label>
                    </td>
                    <td>
                      <label class="cbm-pc-toggle"><input type="checkbox" v-model="r.matchForeign" /><span class="cbm-pc-toggle-slider"></span></label>
                    </td>
                    <td>
                      <label class="cbm-pc-toggle"><input type="checkbox" v-model="r.monitor" /><span class="cbm-pc-toggle-slider"></span></label>
                    </td>
                    <td>
                      <label class="cbm-pc-toggle"><input type="checkbox" v-model="r.autoBlock" /><span class="cbm-pc-toggle-slider"></span></label>
                      <span v-if="r.autoBlockCustom" class="cbm-pc-custom-link" @click="openAutoBlockDialog(r)">自定义</span>
                    </td>
                    <td><span class="cbm-pc-action-link" @click="openModelConfig(r)">配置</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- DNS会话过滤 -->
          <div v-if="pcActive === 'DNS会话过滤'" class="cbm-pc-body">
            <div class="cbm-pc-dns-row">
              <span class="cbm-pc-dns-label">DNS会话过滤</span>
              <label class="cbm-pc-toggle cbm-pc-toggle-lg"><input type="checkbox" v-model="pcDnsFilterEnabled" /><span class="cbm-pc-toggle-slider"></span></label>
              <span class="cbm-pc-dns-desc">开启后，将会过滤跨境VPN软件中域名的DNS解析日志。</span>
            </div>
          </div>

          <!-- 访问频次设置 -->
          <div v-if="pcActive === '访问频次设置'" class="cbm-pc-body">
            <div class="cbm-pc-threshold-row">
              <span class="cbm-pc-threshold-label">访问频次设置</span>
              <span class="cbm-pc-threshold-item"><span class="cbm-pc-badge cbm-pc-badge-low">低频 &lt;</span><input class="cbm-pc-threshold-input" type="number" v-model.number="pcFreqLow" /></span>
              <span class="cbm-pc-threshold-item"><span class="cbm-pc-badge cbm-pc-badge-mid">&lt;= 中频 &lt;</span><input class="cbm-pc-threshold-input" type="number" v-model.number="pcFreqMid" /></span>
              <span class="cbm-pc-threshold-item"><span class="cbm-pc-badge cbm-pc-badge-high">&lt;= 高频</span><span class="cbm-pc-threshold-unit">(会话数量)</span></span>
            </div>
            <div class="cbm-pc-btn-row">
              <button class="cbm-pc-btn-primary" @click="saveFreqConfig">提交</button>
              <button class="cbm-pc-btn-default" @click="resetFreqConfig">恢复默认</button>
            </div>
          </div>

          <!-- 流量行为设置 -->
          <div v-if="pcActive === '流量行为设置'" class="cbm-pc-body">
            <div class="cbm-pc-threshold-row">
              <span class="cbm-pc-threshold-label">流量行为设置</span>
              <span class="cbm-pc-threshold-item"><span class="cbm-pc-badge cbm-pc-badge-low">低频访问 &lt;</span><input class="cbm-pc-threshold-input" type="number" v-model.number="pcTrafficLow" /></span>
              <span class="cbm-pc-threshold-item"><span class="cbm-pc-badge cbm-pc-badge-mid">&lt;= 中频访问 &lt;</span><input class="cbm-pc-threshold-input" type="number" v-model.number="pcTrafficMid" /></span>
              <span class="cbm-pc-threshold-item"><span class="cbm-pc-badge cbm-pc-badge-high">&lt;= 高频访问</span><span class="cbm-pc-threshold-unit">(单位:MB)</span></span>
            </div>
            <div class="cbm-pc-btn-row">
              <button class="cbm-pc-btn-primary" @click="saveTrafficConfig">提交</button>
              <button class="cbm-pc-btn-default" @click="resetTrafficConfig">恢复默认</button>
            </div>
          </div>

          <!-- 内网学校 -->
          <div v-if="pcActive === '内网学校'" class="cbm-pc-body">
            <div class="cbm-pc-school-row">
              <span class="cbm-pc-school-label">内网IP</span>
              <select class="cbm-pc-school-select" v-model="pcSchoolIp">
                <option value="">请选择</option>
                <option value="10.0.0.0/8">10.0.0.0/8</option>
                <option value="172.16.0.0/12">172.16.0.0/12</option>
                <option value="192.168.0.0/16">192.168.0.0/16</option>
              </select>
              <span class="cbm-pc-school-edit" @click="editSchoolIp">编辑</span>
            </div>
            <p class="cbm-pc-school-hint">设置源IP内网IP段白名单</p>
            <div class="cbm-pc-btn-row" style="margin-top:16px">
              <button class="cbm-pc-btn-primary" @click="saveSchoolConfig">提交</button>
            </div>
          </div>

        </div>
      </div>

      <!-- 自动阻断自定义弹窗 -->
      <el-dialog v-model="pcAutoBlockDialogVisible" title="自动阻断自定义" width="500px" :close-on-click-modal="false" @close="pcAutoBlockDialogVisible = false">
        <div class="cbm-pc-form">
          <div class="cbm-pc-form-row">
            <label class="cbm-pc-form-label">阻断阈值</label>
            <input class="cbm-pc-form-input" type="number" v-model.number="pcAutoBlockThreshold" placeholder="请输入阈值" />
            <span class="cbm-pc-form-unit">(次)</span>
          </div>
          <div class="cbm-pc-form-row">
            <label class="cbm-pc-form-label">阻断时长</label>
            <input class="cbm-pc-form-input" type="number" v-model.number="pcAutoBlockDuration" placeholder="请输入时长" />
            <span class="cbm-pc-form-unit">(分钟)</span>
          </div>
        </div>
        <div class="cbm-pc-dialog-footer">
          <button class="cbm-pc-btn-primary" @click="saveAutoBlockConfig">确定</button>
          <button class="cbm-pc-btn-default" @click="pcAutoBlockDialogVisible = false">取消</button>
        </div>
      </el-dialog>

      <!-- 11. 白名单 -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'whitelist' }">
        <div class="ou-toolbar" style="justify-content:space-between">
          <div style="display:flex;gap:8px 12px;flex-wrap:wrap;align-items:center">
            <div class="ou-toolbar-item"><span class="ou-toolbar-label">类型</span><select class="ou-toolbar-select" v-model="wlFilterType"><option value="">任意</option><option value="ip">IP</option><option value="domain">域名</option><option value="mac">MAC</option></select></div>
            <input class="ou-toolbar-input" type="search" placeholder="关键字搜索" v-model="wlFilterKeyword" />
            <button class="ou-search-btn" @click="wlSearch">🔍 搜索</button>
            <button class="secondary td-reset-btn" @click="wlReset">重置</button>
          </div>
          <div style="display:flex;gap:12px;align-items:center">
            <button class="link-btn" @click="wlAutoSync">🔄 自动同步</button>
            <button class="link-btn" @click="openWlAddDialog">➕ 添加</button>
            <button class="link-btn" @click="wlBatchDelete" :disabled="wlSelectedIds.length === 0">🗑 删除</button>
            <button class="link-btn" @click="openWlClearDialog">🧹 清空</button>
            <button class="link-btn">📥 导入</button>
            <button class="link-btn">📤 导出</button>
          </div>
        </div>
        <div class="ou-table-wrap">
          <table class="ou-table">
            <thead><tr><th style="width:40px"><input type="checkbox" @change="wlToggleAll" :checked="wlAllSelected" /></th><th class="col-idx">序号</th><th>白名单对象</th><th class="col-actions" style="width:120px">操作</th></tr></thead>
            <tbody>
              <tr v-for="(r, i) in wlFilteredData" :key="r.id">
                <td><input type="checkbox" :checked="wlSelectedIds.includes(r.id)" @change="wlToggleSelect(r.id)" /></td>
                <td class="col-idx">{{ (wlPage - 1) * wlPageSize + i + 1 }}</td>
                <td><span class="wl-object-tag">{{ r.type === 'ip' ? '🌐' : r.type === 'domain' ? '🔗' : '' }} {{ r.value }}</span></td>
                <td class="col-actions"><span class="wl-action-link" @click="wlDelete(r.id)">删除</span></td>
              </tr>
              <tr v-if="wlFilteredData.length === 0"><td colspan="4" class="ou-empty">无数据</td></tr>
            </tbody>
          </table>
        </div>
        <div class="ou-footer">
          <div class="ou-footer-left"><div class="ou-pager"><button class="ou-page-btn" @click="wlPage > 1 && wlPage--" :disabled="wlPage <= 1">‹</button><button class="ou-page-btn active" disabled>{{ wlPage }}</button><button class="ou-page-btn" @click="wlPage < wlTotalPages && wlPage++" :disabled="wlPage >= wlTotalPages">›</button></div></div>
          <div class="ou-footer-right"><label class="ou-page-goto">到第 <input class="ou-page-goto-input" type="number" v-model.number="wlGotoPage" min="1" :max="wlTotalPages" /> 页 <button class="ou-page-goto-btn" @click="wlGoToPage">确定</button></label><span>共 {{ wlData.length }} 条</span><label class="ou-page-size"><select v-model.number="wlPageSize" @change="wlPage = 1"><option :value="50">50 条/页</option><option :value="100">100 条/页</option><option :value="200">200 条/页</option></select></label></div>
        </div>
      </div>

      <!-- 添加白名单弹窗 -->
      <el-dialog v-model="wlAddDialogVisible" title="添加" width="520px" :close-on-click-modal="false" @close="closeWlAddDialog">
        <div class="wl-add-form">
          <div class="wl-add-row">
            <label class="wl-add-label">白名单对象</label>
            <input class="wl-add-input" type="text" v-model="wlAddValue" placeholder="请输入IP、域名或MAC地址" />
          </div>
          <div class="wl-add-check-row">
            <label class="wl-add-checkbox"><input type="checkbox" v-model="wlAutoClose" /><span class="wl-check-text">执行成功后，自动关闭窗口</span></label>
          </div>
        </div>
        <div class="wl-dialog-footer">
          <button class="wl-btn-primary" @click="wlAdd">确定</button>
          <button class="wl-btn-default" @click="closeWlAddDialog">取消</button>
        </div>
      </el-dialog>

      <!-- 清空确认弹窗 -->
      <el-dialog v-model="wlClearDialogVisible" title="操作确认" width="420px" :close-on-click-modal="false" @close="wlClearDialogVisible = false">
        <div class="wl-clear-body">
          <span class="wl-clear-icon">️</span>
          <span class="wl-clear-text">确定要清空白名单列表吗？</span>
        </div>
        <div class="wl-dialog-footer">
          <button class="wl-btn-primary" @click="wlClear">确定</button>
          <button class="wl-btn-default" @click="wlClearDialogVisible = false">取消</button>
        </div>
      </el-dialog>

      <!-- 12. 告警通知 -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'alert-notify' }">
        <div class="cbm-pc-page">
          <div class="cbm-pc-subtabs-header">
            <div class="cbm-pc-subtabs">
              <button v-for="s in anSubtabs" :key="s" type="button" class="cbm-pc-subtab" :class="{ active: anActive === s }" @click="anActive = s">{{ s }}</button>
            </div>
          </div>

          <!-- 告警设置 -->
          <div v-if="anActive === '告警设置'" class="cbm-pc-body">
            <div class="an-settings-form">
              <div class="an-settings-row">
                <span class="an-settings-label">告警状态</span>
                <span class="an-status-icon">🔴</span>
              </div>
              <div class="an-settings-row">
                <span class="an-settings-label">统计间隔</span>
                <input class="an-settings-input" type="number" v-model.number="anStatInterval" style="width:120px" />
                <span class="an-settings-unit">秒</span>
                <span class="an-settings-desc">设置统计时间间隔N，N秒后根据阈值触发告警通知；为0，则关闭告警事件。</span>
              </div>
              <div class="an-settings-row">
                <span class="an-settings-label">告警阈值</span>
                <input class="an-settings-input" type="number" v-model.number="anAlertThreshold" style="width:120px" />
              </div>
              <div class="an-settings-row an-settings-actions">
                <button class="an-btn-primary" @click="saveAnSettings">提交</button>
                <span class="an-notify-link" @click="openNotifyDialog">通知方式 ↗</span>
              </div>
            </div>
          </div>

          <!-- 告警日志 -->
          <div v-if="anActive === '告警日志'" class="cbm-pc-body">
            <div class="tdh-filters" style="padding:0 0 12px 0">
              <div class="tdh-filter-row">
                <label class="tdh-filter-field"><span class="ou-toolbar-label">源IP</span><input class="ou-toolbar-input tdh-filter-input" type="text" v-model="anLogFilterIp" placeholder="请输入源IP" /></label>
                <button class="ou-search-btn" @click="anLogSearch">搜索</button>
                <button class="secondary td-reset-btn" @click="anLogReset">重置</button>
              </div>
            </div>
            <div class="ou-table-wrap">
              <table class="ou-table">
                <thead><tr><th class="col-idx">序号</th><th>源IP</th><th class="ou-num">访问次数</th><th>访问时间段</th><th>应用协议</th><th>访问协议</th><th class="col-actions">操作</th></tr></thead>
                <tbody>
                  <tr v-for="(r, i) in anLogFilteredData" :key="r.id">
                    <td class="col-idx">{{ (anLogPage - 1) * anLogPageSize + i + 1 }}</td>
                    <td><span class="tid-link">{{ r.srcIp }}</span></td>
                    <td class="ou-num">{{ r.visitCount }}</td>
                    <td>{{ r.timeRange }}</td>
                    <td>{{ r.appProto }}</td>
                    <td>{{ r.proto }}</td>
                    <td class="col-actions"><span class="an-log-action" @click="viewAnLogDetail(r)">详情</span></td>
                  </tr>
                  <tr v-if="anLogFilteredData.length === 0"><td colspan="7" class="ou-empty">数据加载中</td></tr>
                </tbody>
              </table>
            </div>
            <div class="ou-footer">
              <div class="ou-footer-left"><div class="ou-pager"><button class="ou-page-btn" @click="anLogPage > 1 && anLogPage--" :disabled="anLogPage <= 1">‹</button><button class="ou-page-btn active" disabled>{{ anLogPage }}</button><button class="ou-page-btn" @click="anLogPage < anLogTotalPages && anLogPage++" :disabled="anLogPage >= anLogTotalPages">›</button></div></div>
              <div class="ou-footer-right"><span>共 {{ anLogData.length }} 条</span><label class="ou-page-size"><select v-model.number="anLogPageSize" @change="anLogPage = 1"><option :value="50">50 条/页</option><option :value="100">100 条/页</option></select></label></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 通知方式弹窗 -->
      <el-dialog v-model="anNotifyDialogVisible" title="告警通知" width="960px" :close-on-click-modal="false" @close="anNotifyDialogVisible = false">
        <div class="an-notify-page">
          <div class="an-notify-tabs">
            <button v-for="t in anNotifyTabs" :key="t" type="button" class="an-notify-tab" :class="{ active: anNotifyActive === t }" @click="anNotifyActive = t">{{ t }}</button>
          </div>
          <div class="an-notify-body">
            <!-- 参数设置 -->
            <div class="an-notify-section">
              <h4 class="an-notify-section-title">参数设置</h4>
              <div class="an-notify-params">
                <ol class="an-notify-steps">
                  <li>关注官方公众号；<span class="an-notify-link-text" @click="viewQrCode('公众号')">查看公众号二维码</span>。</li>
                  <li>启用微信通知，并扫码绑定设备；<span class="an-notify-link-text" @click="viewQrCode('设备')">查看设备二维码</span>。</li>
                </ol>
                <p class="an-notify-notice"><strong>注意：</strong>系统通知功能，需要管理口可以上网。</p>
                <div class="an-notify-toggle-row">
                  <span class="an-notify-toggle-label">微信通知</span>
                  <label class="an-toggle"><input type="checkbox" v-model="anWechatEnabled" /><span class="an-toggle-slider"></span></label>
                  <span class="an-toggle-status">{{ anWechatEnabled ? '开启' : '关闭' }}</span>
                </div>
                <button class="an-btn-primary" @click="saveNotifyConfig">提交</button>
              </div>
            </div>
            <!-- 已绑定用户 -->
            <div class="an-notify-section">
              <h4 class="an-notify-section-title">已绑定用户</h4>
              <div class="ou-table-wrap">
                <table class="ou-table an-notify-user-table">
                  <thead><tr><th>用户ID</th><th>用户备注</th><th class="col-actions">操作</th></tr></thead>
                  <tbody>
                    <tr v-for="u in anBoundUsers" :key="u.id">
                      <td>{{ u.userId }}</td>
                      <td>{{ u.remark }}</td>
                      <td class="col-actions"><span class="an-log-action" @click="unbindUser(u.id)">解绑</span></td>
                    </tr>
                    <tr v-if="anBoundUsers.length === 0"><td colspan="3" class="ou-empty">数据加载中</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </el-dialog>

      <!-- 13. 被动域名 - 历史概况 -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'pd-overview' }">
        <div class="pd-page">
          <div class="tdh-filters">
            <div class="tdh-filter-row">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">MAC</span><input class="ou-toolbar-input tdh-filter-input" v-model="pdOvMac" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">源IP</span><select class="ou-toolbar-select" v-model="pdOvSrcIpType"><option value="任意IP">任意IP</option><option value="源IP">源IP</option></select><input class="ou-toolbar-input tdh-filter-input" v-model="pdOvSrcIp" placeholder="任意IP" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">源端口</span><input class="ou-toolbar-input tdh-filter-input" v-model="pdOvSrcPort" placeholder="80 / 8000-8080" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">目标IP</span><select class="ou-toolbar-select" v-model="pdOvDstIpType"><option value="任意IP">任意IP</option><option value="目标IP">目标IP</option></select><input class="ou-toolbar-input tdh-filter-input" v-model="pdOvDstIp" placeholder="任意IP" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">目标端口</span><input class="ou-toolbar-input tdh-filter-input" v-model="pdOvDstPort" placeholder="80 / 8000-8080" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">解析结果</span><input class="ou-toolbar-input tdh-filter-input" v-model="pdOvResolve" /></label>
            </div>
            <div class="tdh-filter-row">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">源IP ISP</span><select class="ou-toolbar-select" v-model="pdOvSrcIsp"><option value="任意">任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">目标IP ISP</span><select class="ou-toolbar-select" v-model="pdOvDstIsp"><option value="任意">任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">源IP区域</span><select class="ou-toolbar-select" v-model="pdOvSrcRegion"><option value="任意">任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">目标IP区域</span><select class="ou-toolbar-select" v-model="pdOvDstRegion"><option value="任意">任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">疑似结果</span><select class="ou-toolbar-select" v-model="pdOvSuspect"><option value="任意">任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">域名</span><input class="ou-toolbar-input tdh-filter-input" v-model="pdOvDomain" /></label>
            </div>
            <div class="tdh-filter-row">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">协议类型</span><select class="ou-toolbar-select" v-model="pdOvProtoType"><option value="任意">任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">域名</span><select class="ou-toolbar-select" v-model="pdOvDomainType"><option value="任意">任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-filter-input" type="text" v-model="pdOvTimeRange" placeholder="2026-07-13 09:22:33 - 2026-07-13 09:37:33" /></label>
              <button type="button" class="ou-search-btn" @click="pdOvSearch">🔍 搜索</button>
              <button type="button" class="secondary td-reset-btn" @click="pdOvReset">重置</button>
              <div style="margin-left:auto"><button class="link-btn" @click="pdOvExport">📤 导出</button></div>
            </div>
          </div>

          <div class="pd-overview-grid">
            <!-- 源IP -->
            <div class="pd-ov-panel">
              <div class="pd-ov-head"><span class="pd-ov-title">源IP</span><span class="pd-ov-count">共 {{ pdOvSrcIpData.length }} 条</span></div>
              <div class="ou-table-wrap pd-ov-table-wrap">
                <table class="ou-table pd-ov-table">
                  <thead><tr><th class="col-idx">序号</th><th>源IP</th><th class="ou-num">请求数</th></tr></thead>
                  <tbody>
                    <tr v-for="(r, i) in pdOvSrcIpPageData" :key="'s'+i">
                      <td class="col-idx">{{ (pdOvSrcIpPage - 1) * pdOvPageSize + i + 1 }}</td>
                      <td><span class="tid-link">{{ r.ip }}</span></td>
                      <td class="ou-num">{{ r.count }}</td>
                    </tr>
                    <tr v-if="pdOvSrcIpData.length === 0"><td colspan="3" class="ou-empty">无数据</td></tr>
                  </tbody>
                </table>
              </div>
              <div class="pd-ov-footer">
                <div class="ou-pager">
                  <button class="ou-page-btn" @click="pdOvSrcIpPage > 1 && pdOvSrcIpPage--" :disabled="pdOvSrcIpPage <= 1">‹</button>
                  <button class="ou-page-btn active" disabled>{{ pdOvSrcIpPage }}</button>
                  <button class="ou-page-btn" @click="pdOvSrcIpPage < pdOvSrcIpTotalPages && pdOvSrcIpPage++" :disabled="pdOvSrcIpPage >= pdOvSrcIpTotalPages">›</button>
                </div>
                <span class="pd-ov-total">共 {{ pdOvSrcIpData.length }} 条</span>
              </div>
            </div>

            <!-- 目标IP -->
            <div class="pd-ov-panel">
              <div class="pd-ov-head"><span class="pd-ov-title">目标IP</span><span class="pd-ov-count">共 {{ pdOvDstIpData.length }} 条</span></div>
              <div class="ou-table-wrap pd-ov-table-wrap">
                <table class="ou-table pd-ov-table">
                  <thead><tr><th class="col-idx">序号</th><th>目标IP</th><th class="ou-num">请求数</th></tr></thead>
                  <tbody>
                    <tr v-for="(r, i) in pdOvDstIpPageData" :key="'d'+i">
                      <td class="col-idx">{{ (pdOvDstIpPage - 1) * pdOvPageSize + i + 1 }}</td>
                      <td><span class="tid-link">{{ r.ip }}</span></td>
                      <td class="ou-num">{{ r.count }}</td>
                    </tr>
                    <tr v-if="pdOvDstIpData.length === 0"><td colspan="3" class="ou-empty">无数据</td></tr>
                  </tbody>
                </table>
              </div>
              <div class="pd-ov-footer">
                <div class="ou-pager">
                  <button class="ou-page-btn" @click="pdOvDstIpPage > 1 && pdOvDstIpPage--" :disabled="pdOvDstIpPage <= 1">‹</button>
                  <button class="ou-page-btn active" disabled>{{ pdOvDstIpPage }}</button>
                  <button class="ou-page-btn" @click="pdOvDstIpPage < pdOvDstIpTotalPages && pdOvDstIpPage++" :disabled="pdOvDstIpPage >= pdOvDstIpTotalPages">›</button>
                </div>
                <span class="pd-ov-total">共 {{ pdOvDstIpData.length }} 条</span>
              </div>
            </div>

            <!-- 请求域名 -->
            <div class="pd-ov-panel">
              <div class="pd-ov-head"><span class="pd-ov-title">请求域名</span><span class="pd-ov-count">共 {{ pdOvDomainData.length }} 条</span></div>
              <div class="ou-table-wrap pd-ov-table-wrap">
                <table class="ou-table pd-ov-table">
                  <thead><tr><th class="col-idx">序号</th><th>请求域名</th><th class="ou-num">请求数</th></tr></thead>
                  <tbody>
                    <tr v-for="(r, i) in pdOvDomainPageData" :key="'dm'+i">
                      <td class="col-idx">{{ (pdOvDomainPage - 1) * pdOvPageSize + i + 1 }}</td>
                      <td><span class="tid-link">{{ r.domain }}</span></td>
                      <td class="ou-num">{{ r.count }}</td>
                    </tr>
                    <tr v-if="pdOvDomainData.length === 0"><td colspan="3" class="ou-empty">无数据</td></tr>
                  </tbody>
                </table>
              </div>
              <div class="pd-ov-footer">
                <div class="ou-pager">
                  <button class="ou-page-btn" @click="pdOvDomainPage > 1 && pdOvDomainPage--" :disabled="pdOvDomainPage <= 1">‹</button>
                  <button class="ou-page-btn active" disabled>{{ pdOvDomainPage }}</button>
                  <button class="ou-page-btn" @click="pdOvDomainPage < pdOvDomainTotalPages && pdOvDomainPage++" :disabled="pdOvDomainPage >= pdOvDomainTotalPages">›</button>
                </div>
                <span class="pd-ov-total">共 {{ pdOvDomainData.length }} 条</span>
              </div>
            </div>

            <!-- 解析结果 -->
            <div class="pd-ov-panel">
              <div class="pd-ov-head"><span class="pd-ov-title">解析结果</span><span class="pd-ov-count">共 {{ pdOvResolveData.length }} 条</span></div>
              <div class="ou-table-wrap pd-ov-table-wrap">
                <table class="ou-table pd-ov-table">
                  <thead><tr><th class="col-idx">序号</th><th>解析结果</th><th class="ou-num">请求数</th></tr></thead>
                  <tbody>
                    <tr v-for="(r, i) in pdOvResolvePageData" :key="'rs'+i">
                      <td class="col-idx">{{ (pdOvResolvePage - 1) * pdOvPageSize + i + 1 }}</td>
                      <td><span class="tid-link">{{ r.result }}</span></td>
                      <td class="ou-num">{{ r.count }}</td>
                    </tr>
                    <tr v-if="pdOvResolveData.length === 0"><td colspan="3" class="ou-empty">无数据</td></tr>
                  </tbody>
                </table>
              </div>
              <div class="pd-ov-footer">
                <div class="ou-pager">
                  <button class="ou-page-btn" @click="pdOvResolvePage > 1 && pdOvResolvePage--" :disabled="pdOvResolvePage <= 1">‹</button>
                  <button class="ou-page-btn active" disabled>{{ pdOvResolvePage }}</button>
                  <button class="ou-page-btn" @click="pdOvResolvePage < pdOvResolveTotalPages && pdOvResolvePage++" :disabled="pdOvResolvePage >= pdOvResolveTotalPages">›</button>
                </div>
                <span class="pd-ov-total">共 {{ pdOvResolveData.length }} 条</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 14. 被动域名 - 历史会话 -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'pd-sessions' }">
        <div class="pd-page">
          <div class="tdh-filters">
            <div class="tdh-filter-row">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">MAC</span><input class="ou-toolbar-input tdh-filter-input" v-model="pdSsMac" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">源IP</span><select class="ou-toolbar-select" v-model="pdSsSrcIpType"><option value="任意IP">任意IP</option><option value="源IP">源IP</option></select><input class="ou-toolbar-input tdh-filter-input" v-model="pdSsSrcIp" placeholder="任意IP" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">目标IP</span><select class="ou-toolbar-select" v-model="pdSsDstIpType"><option value="任意IP">任意IP</option><option value="目标IP">目标IP</option></select><input class="ou-toolbar-input tdh-filter-input" v-model="pdSsDstIp" placeholder="任意IP" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">目标端口</span><input class="ou-toolbar-input tdh-filter-input" v-model="pdSsDstPort" placeholder="80 / 8000-8080" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">源IP ISP</span><select class="ou-toolbar-select" v-model="pdSsSrcIsp"><option value="任意">任意</option></select></label>
            </div>
            <div class="tdh-filter-row">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">目标IP ISP</span><select class="ou-toolbar-select" v-model="pdSsDstIsp"><option value="任意">任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">源IP区域</span><select class="ou-toolbar-select" v-model="pdSsSrcRegion"><option value="任意">任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">目标IP区域</span><select class="ou-toolbar-select" v-model="pdSsDstRegion"><option value="任意">任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">疑似结果</span><select class="ou-toolbar-select" v-model="pdSsSuspect"><option value="任意">任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">用户名称</span><input class="ou-toolbar-input tdh-filter-input" v-model="pdSsUser" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">链路</span><select class="ou-toolbar-select" v-model="pdSsLink"><option value="任意">任意</option></select></label>
            </div>
            <div class="tdh-filter-row">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-filter-input" type="text" v-model="pdSsTimeRange" placeholder="2026-07-13 09:25:53 - 2026-07-13 09:40:58" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">确定结果</span><select class="ou-toolbar-select" v-model="pdSsConfirm"><option value="任意">任意</option></select></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">域名</span><input class="ou-toolbar-input tdh-filter-input" v-model="pdSsDomain" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">源IP ISP</span><select class="ou-toolbar-select" v-model="pdSsSrcIsp2"><option value="任意">任意</option></select></label>
              <button type="button" class="ou-search-btn" @click="pdSsSearch">🔍 搜索</button>
              <button type="button" class="secondary td-reset-btn" @click="pdSsReset">重置</button>
              <div style="margin-left:auto"><button class="link-btn" @click="pdSsExport">📤 导出</button></div>
            </div>
          </div>

          <div class="ou-table-wrap">
            <table class="ou-table pd-ss-table">
              <thead>
                <tr>
                  <th class="col-idx">序号</th>
                  <th>操作时间</th>
                  <th>MAC</th>
                  <th>MAC厂商</th>
                  <th>用户名称</th>
                  <th>源IP</th>
                  <th>目标IP</th>
                  <th>目标地理位置</th>
                  <th>请求域名</th>
                  <th>链路</th>
                  <th>解析结果</th>
                  <th>响应码</th>
                  <th class="col-actions">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(r, i) in pdSsPageData" :key="r.id">
                  <td class="col-idx">{{ (pdSsPage - 1) * pdSsPageSize + i + 1 }}</td>
                  <td>{{ r.time }}</td>
                  <td>{{ r.mac }}</td>
                  <td>{{ r.vendor }}</td>
                  <td>{{ r.userName }}</td>
                  <td><span class="tid-link">{{ r.srcIp }}</span></td>
                  <td><span class="tid-link">{{ r.dstIp }}</span></td>
                  <td>{{ r.geo }}</td>
                  <td><span class="tid-link">{{ r.domain }}</span></td>
                  <td>{{ r.link }}</td>
                  <td>{{ r.resolveResult }}</td>
                  <td>{{ r.responseCode }}</td>
                  <td class="col-actions"><span class="an-log-action" @click="openPdSsDetail(r)">详情</span></td>
                </tr>
                <tr v-if="pdSsData.length === 0"><td colspan="13" class="ou-empty">数据加载中</td></tr>
              </tbody>
            </table>
          </div>

          <div class="ou-footer">
            <div class="ou-footer-left">
              <div class="ou-pager">
                <button class="ou-page-btn" @click="pdSsPage > 1 && pdSsPage--" :disabled="pdSsPage <= 1">‹</button>
                <button class="ou-page-btn active" disabled>{{ pdSsPage }}</button>
                <button class="ou-page-btn" @click="pdSsPage < pdSsTotalPages && pdSsPage++" :disabled="pdSsPage >= pdSsTotalPages">›</button>
              </div>
            </div>
            <div class="ou-footer-right">
              <label class="ou-page-goto">到第 <input class="ou-page-goto-input" type="number" v-model.number="pdSsGotoPage" min="1" :max="pdSsTotalPages" /> 页 <button class="ou-page-goto-btn" @click="pdSsGoToPage">确定</button></label>
              <span>共 {{ pdSsData.length }} 条</span>
              <label class="ou-page-size"><select v-model.number="pdSsPageSize" @change="pdSsPage = 1"><option :value="50">50 条/页</option><option :value="100">100 条/页</option></select></label>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- 实时会话弹窗 -->
    <el-dialog v-model="cbRoSessionVisible" :title="cbRoSessionTitle" width="1400px" :close-on-click-modal="false" @close="cbRoSessionVisible = false">
      <div class="sp-page">
        <div class="tdh-filters sp-filters">
          <div class="tdh-filter-row">
            <label class="tdh-filter-field"><select class="ou-toolbar-select" v-model="spFilterType"><option value="任意IP">任意IP</option><option value="源IP">源IP</option><option value="目标IP">目标IP</option></select><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="任意IP" v-model="spFilterValue" /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">源端口</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="80 / 8000-8080" v-model="spFilterSrcPort" /></label>
            <label class="tdh-filter-field"><select class="ou-toolbar-select" v-model="spFilterTargetType"><option value="任意IP">任意IP</option><option value="源IP">源IP</option><option value="目标IP">目标IP</option></select><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="任意IP" v-model="spFilterTargetValue" /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">目标端口</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="80 / 8000-8080" v-model="spFilterDstPort" /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">应用协议</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="任意协议" v-model="spFilterAppProto" /></label>
          </div>
          <div class="tdh-filter-row">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">MAC</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="" v-model="spFilterMac" /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">传输协议</span><select class="ou-toolbar-select" v-model="spFilterProto"><option value="任意">任意</option><option value="TCP">TCP</option><option value="UDP">UDP</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">疑似度</span><select class="ou-toolbar-select" v-model="spFilterSuspect"><option value="任意">任意</option><option value="高">高</option><option value="中">中</option><option value="低">低</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">域名</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="" v-model="spFilterDomain" /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">用户名称</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="" v-model="spFilterUser" /></label>
          </div>
          <div class="tdh-filter-row tdh-filter-row-actions">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">分析模型</span><select class="ou-toolbar-select" v-model="spFilterModel"><option value="任意">任意</option><option value="基于VPN协议">基于VPN协议</option><option value="基于VPN应用">基于VPN应用</option><option value="基于网络代理">基于网络代理</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">协议类型</span><select class="ou-toolbar-select" v-model="spFilterProtoType"><option value="任意">任意</option></select></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">链路</span><select class="ou-toolbar-select" v-model="spFilterLink"><option value="任意">任意</option><option value="链路1">链路1</option></select></label>
            <button type="button" class="ou-search-btn" @click="searchSpData">搜索</button>
            <button type="button" class="secondary td-reset-btn" @click="resetSpFilters">重置</button>
          </div>
        </div>

        <div class="ou-table-wrap sp-table-wrap">
          <table class="ou-table sp-table">
            <thead><tr><th class="col-idx">序号</th><th class="col-time">时间</th><th class="col-mac">MAC</th><th class="col-mac-vendor">MAC厂商</th><th class="col-user">用户名称</th><th class="col-endpoint">源IP</th><th class="col-endpoint">目标IP</th><th class="col-proto">传输协议</th><th class="col-proto-type">协议类型</th><th class="col-proto-name">协议名称</th><th class="col-geo">地理位置</th><th class="col-traffic">上行流量</th><th class="col-traffic">下行流量</th><th class="col-domain">域名</th><th class="col-link">链路</th><th class="col-suspect">疑似度</th><th class="col-model">分析模型</th><th class="col-actions">操作</th></tr></thead>
            <tbody>
              <tr v-for="(r, i) in spData.slice((spPage - 1) * spPageSize, spPage * spPageSize)" :key="i">
                <td class="col-idx">{{ (spPage - 1) * spPageSize + i + 1 }}</td>
                <td class="col-time">{{ r.t }}</td>
                <td class="col-mac">{{ r.mac }}</td>
                <td class="col-mac-vendor"><span class="dt-ellipsis" style="max-width:100px">{{ r.vendor }}</span></td>
                <td class="col-user">—</td>
                <td class="col-endpoint"><span class="sp-endpoint">{{ r.src }}</span></td>
                <td class="col-endpoint"><span class="sp-endpoint">{{ r.dst }}</span></td>
                <td class="col-proto">{{ r.proto }}</td>
                <td class="col-proto-type">—</td>
                <td class="col-proto-name">{{ r.protoName }}</td>
                <td class="col-geo"><span class="sp-geo-tag">{{ getGeoFlagUrl(getGeoFlag('北京')) }} 北京</span></td>
                <td class="col-traffic ou-num">{{ r.up }}</td>
                <td class="col-traffic ou-num">{{ r.dn }}</td>
                <td class="col-domain">—</td>
                <td class="col-link">—</td>
                <td class="col-suspect"><span class="cbm-suspect-badge cbm-suspect-high">高</span></td>
                <td class="col-model">基于VPN应用</td>
                <td class="col-actions"><button class="link-btn" @click="openPacketAnalysis(r)">数据包</button></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="ou-footer sp-footer">
          <div class="ou-footer-left"><div class="ou-pager"><button class="ou-page-btn" :disabled="spPage <= 1" @click="spPage--">‹</button><button v-for="p in getPageList(spPage, Math.ceil(spTotal / spPageSize))" :key="p" class="ou-page-btn" :class="{ active: spPage === p }" @click="spPage = p">{{ p }}</button><button class="ou-page-btn" :disabled="spPage >= Math.ceil(spTotal / spPageSize)" @click="spPage++">›</button></div></div>
          <div class="ou-footer-right"><label class="ou-page-goto">到第 <input class="ou-page-goto-input" v-model.number="spPage" /> 页 <button class="ou-page-goto-btn" @click="spPage = Math.min(Math.max(1, spPage), Math.ceil(spTotal / spPageSize))">确定</button></label><span>共 {{ spTotal }} 条</span><label class="ou-page-size"><select v-model.number="spPageSize"><option :value="20">20条/页</option><option :value="50">50条/页</option><option :value="100">100条/页</option></select></label></div>
        </div>
      </div>
    </el-dialog>

    <!-- 报文分析弹窗 -->
    <el-dialog v-model="cbPacketVisible" title="报文分析" width="1100px" :close-on-click-modal="false" @close="cbPacketVisible = false">
      <div class="pa-page">
        <div class="pa-tabs">
          <button type="button" class="pa-tab" :class="{ active: cbPacketTab === 'parse' }" @click="cbPacketTab = 'parse'">报文解析</button>
          <button type="button" class="pa-tab" :class="{ active: cbPacketTab === 'interact' }" @click="cbPacketTab = 'interact'">报文交互</button>
          <button type="button" class="pa-tab" :class="{ active: cbPacketTab === 'meta' }" @click="cbPacketTab = 'meta'">元数据</button>
        </div>
        <div class="pa-body">
          <div v-if="cbPacketTab === 'parse'" class="pa-parse">
            <div class="ou-table-wrap pa-table_wrap">
              <table class="ou-table pa-table">
                <thead><tr><th class="col-idx">序号</th><th class="col-time">时间</th><th class="col-src">源IP</th><th class="col-dst">目标IP</th><th class="col-proto">协议</th><th class="col-len">长度</th><th class="col-info">信息</th></tr></thead>
                <tbody>
                  <tr v-for="(p, idx) in cbPacketParseData" :key="idx">
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
          <div v-if="cbPacketTab === 'interact'" class="pa-interact">
            <div class="ou-table-wrap pa-table_wrap">
              <table class="ou-table pa-table">
                <thead><tr><th class="col-idx">序号</th><th class="col-time">时间</th><th class="col-src">源IP</th><th class="col-dst">目标IP</th><th class="col-proto">协议</th><th class="col-info">交互信息</th></tr></thead>
                <tbody>
                  <tr v-for="(p, idx) in cbPacketInteractData" :key="idx">
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
          <div v-if="cbPacketTab === 'meta'" class="pa-meta">
            <table class="cd-detail-table">
              <tbody>
                <tr v-for="(row, ri) in cbPacketMetaData" :key="ri">
                  <th class="cd-detail-key">{{ row.key }}</th>
                  <td class="cd-detail-val">{{ row.val }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import VChart from 'vue-echarts'
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
  { key: 'pd-overview', label: '历史概况' },
  { key: 'pd-sessions', label: '历史会话' },
]

const pcSubtabs = ['分析模型', 'DNS会话过滤', '访问频次设置', '流量行为设置', '内网学校']
const pcActive = ref(pcSubtabs[0])

// 分析模型 mock数据
interface PcModelRow {
  name: string
  level: string
  levelLabel: string
  hits: number
  whitelistHits: number
  lastUpdate: string
  trendPct: number
  range: number
  alertNotify: boolean
  matchHK: boolean
  matchForeign: boolean
  monitor: boolean
  autoBlock: boolean
  autoBlockCustom: boolean
}

const pcModelData = ref<PcModelRow[]>([
  { name: '基于域名访问特征', level: 'low', levelLabel: '低', hits: 0, whitelistHits: 0, lastUpdate: '无更新', trendPct: 0, range: 2, alertNotify: true, matchHK: false, matchForeign: false, monitor: true, autoBlock: false, autoBlockCustom: false },
  { name: '基于VPN应用', level: 'mid', levelLabel: '中', hits: 5227, whitelistHits: 0, lastUpdate: '2026-07-13 09:28:15', trendPct: 65, range: 2, alertNotify: true, matchHK: true, matchForeign: true, monitor: true, autoBlock: false, autoBlockCustom: false },
  { name: '基于隧道代理', level: 'high', levelLabel: '高', hits: 0, whitelistHits: 0, lastUpdate: '无更新', trendPct: 0, range: 2, alertNotify: true, matchHK: true, matchForeign: true, monitor: true, autoBlock: false, autoBlockCustom: false },
  { name: '基于VPN协议', level: 'mid', levelLabel: '中', hits: 9, whitelistHits: 0, lastUpdate: '2026-07-13 09:28:41', trendPct: 15, range: 2, alertNotify: true, matchHK: true, matchForeign: true, monitor: true, autoBlock: false, autoBlockCustom: false },
])

// DNS会话过滤
const pcDnsFilterEnabled = ref(true)

// 访问频次设置
const pcFreqLow = ref(10)
const pcFreqMid = ref(100)
function saveFreqConfig() { /* mock */ }
function resetFreqConfig() { pcFreqLow.value = 10; pcFreqMid.value = 100 }

// 流量行为设置
const pcTrafficLow = ref(10)
const pcTrafficMid = ref(100)
function saveTrafficConfig() { /* mock */ }
function resetTrafficConfig() { pcTrafficLow.value = 10; pcTrafficMid.value = 100 }

// 内网学校
const pcSchoolIp = ref('')
function editSchoolIp() { /* mock */ }
function saveSchoolConfig() { /* mock */ }

// 自动阻断自定义弹窗
const pcAutoBlockDialogVisible = ref(false)
const pcAutoBlockThreshold = ref(0)
const pcAutoBlockDuration = ref(0)
const pcAutoBlockTarget = ref<PcModelRow | null>(null)

function openAutoBlockDialog(row: PcModelRow) {
  pcAutoBlockTarget.value = row
  pcAutoBlockThreshold.value = 0
  pcAutoBlockDuration.value = 0
  pcAutoBlockDialogVisible.value = true
}

function saveAutoBlockConfig() {
  if (pcAutoBlockTarget.value) {
    pcAutoBlockTarget.value.autoBlockCustom = true
  }
  pcAutoBlockDialogVisible.value = false
}

function openModelConfig(_row: PcModelRow) { /* mock */ }

const anSubtabs = ['告警设置', '告警日志']
const anActive = ref(anSubtabs[0])

// 告警设置
const anStatInterval = ref(300)
const anAlertThreshold = ref(5)
function saveAnSettings() { /* mock */ }

// 告警日志 mock数据
interface AnLogItem {
  id: number
  srcIp: string
  visitCount: number
  timeRange: string
  appProto: string
  proto: string
}

const anLogData = ref<AnLogItem[]>([
  { id: 1, srcIp: '192.168.1.100', visitCount: 156, timeRange: '2026-07-13 09:00:00 ~ 09:05:00', appProto: 'HTTPS', proto: 'TCP' },
  { id: 2, srcIp: '10.0.0.50', visitCount: 89, timeRange: '2026-07-13 09:05:00 ~ 09:10:00', appProto: 'HTTP', proto: 'TCP' },
  { id: 3, srcIp: '172.16.0.1', visitCount: 234, timeRange: '2026-07-13 09:10:00 ~ 09:15:00', appProto: 'DNS', proto: 'UDP' },
  { id: 4, srcIp: '192.168.2.200', visitCount: 45, timeRange: '2026-07-13 09:15:00 ~ 09:20:00', appProto: 'SSH', proto: 'TCP' },
  { id: 5, srcIp: '10.0.0.100', visitCount: 312, timeRange: '2026-07-13 09:20:00 ~ 09:25:00', appProto: 'HTTPS', proto: 'TCP' },
])

const anLogFilterIp = ref('')
const anLogPage = ref(1)
const anLogPageSize = ref(100)
const anLogTotalPages = computed(() => Math.max(1, Math.ceil(anLogFilteredData.value.length / anLogPageSize.value)))

const anLogFilteredData = computed(() => {
  let data = anLogData.value
  if (anLogFilterIp.value) {
    const kw = anLogFilterIp.value.toLowerCase()
    data = data.filter(r => r.srcIp.toLowerCase().includes(kw))
  }
  return data.slice((anLogPage.value - 1) * anLogPageSize.value, anLogPage.value * anLogPageSize.value)
})

function anLogSearch() { anLogPage.value = 1 }
function anLogReset() { anLogFilterIp.value = ''; anLogPage.value = 1 }
function viewAnLogDetail(_r: AnLogItem) { /* mock */ }

// 通知方式弹窗
const anNotifyDialogVisible = ref(false)
const anNotifyTabs = ['微信', '企业微信', '钉钉', '飞书', '邮箱', 'SaaS', 'Syslog', '消息测试']
const anNotifyActive = ref('微信')
const anWechatEnabled = ref(false)

// 已绑定用户 mock数据
interface AnBoundUser {
  id: number
  userId: string
  remark: string
}

const anBoundUsers = ref<AnBoundUser[]>([
  { id: 1, userId: 'wx_user_001', remark: '管理员A' },
  { id: 2, userId: 'wx_user_002', remark: '运维B' },
])

function openNotifyDialog() { anNotifyDialogVisible.value = true }
function saveNotifyConfig() { /* mock */ }
function viewQrCode(_type: string) { /* mock */ }
function unbindUser(id: number) {
  const idx = anBoundUsers.value.findIndex(u => u.id === id)
  if (idx >= 0) anBoundUsers.value.splice(idx, 1)
}

// 白名单 mock数据
interface WlItem {
  id: number
  type: string
  value: string
}

const wlData = ref<WlItem[]>([
  { id: 1, type: 'ip', value: '192.168.1.100' },
  { id: 2, type: 'ip', value: '10.0.0.50' },
  { id: 3, type: 'domain', value: 'example.com' },
  { id: 4, type: 'domain', value: 'test.example.org' },
  { id: 5, type: 'ip', value: '172.16.0.1' },
  { id: 6, type: 'domain', value: 'api.example.com' },
  { id: 7, type: 'ip', value: '192.168.2.200' },
  { id: 8, type: 'domain', value: 'cdn.example.net' },
])

const wlFilterType = ref('')
const wlFilterKeyword = ref('')
const wlSelectedIds = ref<number[]>([])
const wlAllSelected = computed(() => wlFilteredData.value.length > 0 && wlSelectedIds.value.length === wlFilteredData.value.length)
const wlPage = ref(1)
const wlPageSize = ref(100)
const wlGotoPage = ref(1)
const wlTotalPages = computed(() => Math.max(1, Math.ceil(wlFilteredData.value.length / wlPageSize.value)))

const wlFilteredData = computed(() => {
  let data = wlData.value
  if (wlFilterType.value) {
    data = data.filter(r => r.type === wlFilterType.value)
  }
  if (wlFilterKeyword.value) {
    const kw = wlFilterKeyword.value.toLowerCase()
    data = data.filter(r => r.value.toLowerCase().includes(kw))
  }
  return data.slice((wlPage.value - 1) * wlPageSize.value, wlPage.value * wlPageSize.value)
})

function wlSearch() { wlPage.value = 1 }
function wlReset() { wlFilterType.value = ''; wlFilterKeyword.value = ''; wlPage.value = 1 }
function wlToggleAll(e: Event) {
  const checked = (e.target as HTMLInputElement).checked
  wlSelectedIds.value = checked ? wlFilteredData.value.map(r => r.id) : []
}
function wlToggleSelect(id: number) {
  const idx = wlSelectedIds.value.indexOf(id)
  if (idx >= 0) wlSelectedIds.value.splice(idx, 1)
  else wlSelectedIds.value.push(id)
}
function wlDelete(id: number) {
  const idx = wlData.value.findIndex(r => r.id === id)
  if (idx >= 0) wlData.value.splice(idx, 1)
  wlSelectedIds.value = wlSelectedIds.value.filter(i => i !== id)
}
function wlBatchDelete() {
  wlData.value = wlData.value.filter(r => !wlSelectedIds.value.includes(r.id))
  wlSelectedIds.value = []
}
function wlGoToPage() {
  const p = Math.min(Math.max(1, wlGotoPage.value), wlTotalPages.value)
  wlPage.value = p
}
function wlAutoSync() { /* mock */ }

// 添加白名单弹窗
const wlAddDialogVisible = ref(false)
const wlAddValue = ref('')
const wlAutoClose = ref(true)

function openWlAddDialog() {
  wlAddValue.value = ''
  wlAutoClose.value = true
  wlAddDialogVisible.value = true
}
function closeWlAddDialog() { wlAddDialogVisible.value = false }
function wlAdd() {
  if (!wlAddValue.value.trim()) return
  const val = wlAddValue.value.trim()
  let type = 'ip'
  if (val.includes('.') && !/^\d+\.\d+\.\d+\.\d+$/.test(val)) type = 'domain'
  else if (/^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/.test(val)) type = 'mac'
  wlData.value.push({ id: Date.now(), type, value: val })
  if (wlAutoClose.value) wlAddDialogVisible.value = false
  else { wlAddValue.value = '' }
}

// 清空确认弹窗
const wlClearDialogVisible = ref(false)
function openWlClearDialog() { wlClearDialogVisible.value = true }
function wlClear() { wlData.value = []; wlSelectedIds.value = []; wlClearDialogVisible.value = false }

// 实时概况筛选器状态
function getGeoFlag(geo: string): string {
  if (geo === '北京') return 'cn'
  if (geo === '美国') return 'us'
  return ''
}
function getGeoFlagUrl(code: string): string {
  // 使用emoji国旗图标 + 文字
  if (code === 'cn') return '\u{1F1E8}\u{1F1F3}'
  if (code === 'us') return '\u{1F1FA}\u{1F1F8}'
  return ''
}

// 跨境阻断 - 设备管理
interface CbDevice {
  type: string
  name: string
  ip: string
  port: string
  version: string
  license: string
  addTime: string
}

const cbDevices = ref<CbDevice[]>([
  { type: 'Panabit', name: 'Panabit-01', ip: '192.168.1.100', port: '443', version: 'V3.2.1', license: '企业版（已授权）', addTime: '2026-06-15 10:30:00' },
  { type: 'Panabit', name: 'Panabit-02', ip: '192.168.1.101', port: '443', version: 'V3.2.1', license: '企业版（已授权）', addTime: '2026-06-20 14:22:00' },
  { type: '深信服', name: 'Sangfor-FW', ip: '10.0.0.50', port: '443', version: 'V11.6.0', license: '标准版（已授权）', addTime: '2026-07-01 09:15:00' },
])
const cbSelectedDevice = ref(-1)

// 设备添加/编辑弹窗
const cbDeviceDialogVisible = ref(false)
const cbDeviceDialogTitle = ref('添加')
const cbDeviceForm = ref({ type: 'Panabit', name: '', ip: '', port: '443' })
const cbDeviceEditIndex = ref(-1)

function openAddDeviceDialog() {
  cbDeviceDialogTitle.value = '添加'
  cbDeviceForm.value = { type: 'Panabit', name: '', ip: '', port: '443' }
  cbDeviceEditIndex.value = -1
  cbDeviceDialogVisible.value = true
}

function openEditDeviceDialog() {
  if (cbSelectedDevice.value < 0) return
  const dev = cbDevices.value[cbSelectedDevice.value]
  cbDeviceDialogTitle.value = '编辑'
  cbDeviceForm.value = { type: dev.type, name: dev.name, ip: dev.ip, port: dev.port }
  cbDeviceEditIndex.value = cbSelectedDevice.value
  cbDeviceDialogVisible.value = true
}

function closeDeviceDialog() {
  cbDeviceDialogVisible.value = false
  cbDeviceEditIndex.value = -1
}

function saveDevice() {
  if (!cbDeviceForm.value.name || !cbDeviceForm.value.ip) return
  const form = cbDeviceForm.value
  const now = new Date()
  const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
  if (cbDeviceEditIndex.value >= 0) {
    const dev = cbDevices.value[cbDeviceEditIndex.value]
    dev.type = form.type
    dev.name = form.name
    dev.ip = form.ip
    dev.port = form.port
  } else {
    cbDevices.value.push({
      type: form.type,
      name: form.name,
      ip: form.ip,
      port: form.port,
      version: 'V3.2.1',
      license: '企业版（已授权）',
      addTime: timeStr,
    })
    cbSelectedDevice.value = cbDevices.value.length - 1
  }
  closeDeviceDialog()
}

function deleteDevice() {
  if (cbSelectedDevice.value < 0) return
  cbDevices.value.splice(cbSelectedDevice.value, 1)
  cbSelectedDevice.value = cbDevices.value.length > 0 ? 0 : -1
}

const cbRoModel = ref('')
const cbRoSuspect = ref('')
const cbRoReqMin = ref('')
const cbRoLink = ref('')
const cbRoRange = ref('day')

// 实时概况图表数据
const cbRoTrendOption = computed(() => {
  const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`)
  const vpnProtocol = [12, 8, 5, 3, 2, 4, 15, 28, 45, 62, 78, 95, 110, 116, 98, 82, 65, 48, 32, 22, 18, 15, 12, 10]
  const vpnApp = [45, 38, 28, 22, 18, 25, 52, 85, 120, 155, 180, 200, 215, 220, 195, 165, 130, 95, 68, 52, 42, 35, 30, 28]
  const networkProxy = [8, 6, 4, 3, 2, 5, 12, 22, 35, 48, 58, 68, 75, 80, 72, 60, 48, 35, 25, 18, 14, 12, 10, 8]
  const intelligence = [3, 2, 1, 1, 0, 2, 5, 10, 18, 25, 32, 38, 42, 45, 40, 32, 25, 18, 12, 8, 6, 5, 4, 3]
  return {
    tooltip: { trigger: 'axis' },
    legend: { show: false },
    grid: { left: 60, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: hours, axisLine: { lineStyle: { color: '#dcdfe6' } }, axisLabel: { color: '#909399', fontSize: 10 } },
    yAxis: { type: 'value', name: '#Session', nameTextStyle: { color: '#909399', fontSize: 11 }, axisLine: { show: false }, splitLine: { lineStyle: { color: '#f0f2f5' } }, axisLabel: { color: '#909399', fontSize: 10 } },
    series: [
      { name: '基于VPN协议', type: 'line', stack: 'total', smooth: true, symbol: 'none', itemStyle: { color: '#5470c6' }, areaStyle: { color: '#5470c6', opacity: 0.3 }, data: vpnProtocol },
      { name: '基于VPN应用', type: 'line', stack: 'total', smooth: true, symbol: 'none', itemStyle: { color: '#fac858' }, areaStyle: { color: '#fac858', opacity: 0.3 }, data: vpnApp },
      { name: '基于网络代理', type: 'line', stack: 'total', smooth: true, symbol: 'none', itemStyle: { color: '#91cc75' }, areaStyle: { color: '#91cc75', opacity: 0.3 }, data: networkProxy },
      { name: '基于跨境监测情报', type: 'line', stack: 'total', smooth: true, symbol: 'none', itemStyle: { color: '#ee6666' }, areaStyle: { color: '#ee6666', opacity: 0.3 }, data: intelligence },
    ],
  }
})

const cbRoPieOption = computed(() => {
  return {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { fontSize: 11, color: '#606266' } },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: false,
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 12 } },
      data: [
        { value: 65, name: '基于VPN协议', itemStyle: { color: '#5470c6' } },
        { value: 25, name: '基于VPN应用', itemStyle: { color: '#fac858' } },
        { value: 8, name: '基于网络代理', itemStyle: { color: '#91cc75' } },
        { value: 2, name: '基于跨境监测情报', itemStyle: { color: '#ee6666' } },
      ],
    }],
  }
})

// 实时概况表格分页状态
const cbmRoSrcPage = ref(1)
const cbmRoSrcPageSize = ref(20)
const cbmRoSrcTotal = ref(637)

const cbmRoDstPage = ref(1)
const cbmRoDstPageSize = ref(20)
const cbmRoDstTotal = ref(29)

const cbmRoDomPage = ref(1)
const cbmRoDomPageSize = ref(20)
const cbmRoDomTotal = ref(2)

// 实时概况表格数据
const cbmRoSrc: any[][] = [
  ['116.21.222.216', 371, '73.19 K', '基于VPN应用'],
  ['101.6.6.146', 235, '2.42 M', '基于VPN应用'],
  ['101.6.6.173', 161, '1.19 M', '基于VPN应用'],
  ['139.226.154.84', 100, '19.73 K', '基于VPN应用'],
  ['101.6.6.177', 79, '863.13 K', '基于VPN应用'],
  ['101.6.6.2', 23, '172.89 K', '基于VPN应用'],
  ['171.83.120.198', 5, '730', '基于VPN应用'],
  ['183.159.168.243', 3, '462', '基于VPN应用'],
  ['186.111.8.166', 3, '222', '基于VPN应用'],
  ['112.8.200.16', 3, '366', '基于VPN应用'],
  ['113.65.25.101', 3, '420', '基于VPN应用'],
  ['36.112.191.236', 3, '434', '基于VPN应用'],
  ['195.211.96.116', 2, '11.95 K', '基于VPN应用'],
  ['113.87.108.146', 2, '280', '基于VPN应用'],
  ['221.0.237.165', 2, '260', '基于VPN应用'],
  ['114.248.18.76', 2, '148', '基于VPN应用'],
  ['58.37.92.204', 2, '412', '基于VPN应用'],
  ['124.243.153.12', 2, '1.34 M', '基于VPN应用'],
  ['222.212.160.112', 2, '268', '基于VPN应用'],
  ['183.34.229.72', 2, '340', '基于VPN应用'],
]
const cbmRoDst: any[][] = [
  ['101.6.6.6', 582, '169.47 K', '基于VPN应用'],
  ['101.6.16.70', 333, '12.60 M', '基于VPN应用'],
  ['101.6.16.130', 296, '6.22 M', '基于VPN应用'],
  ['202.204.128.11', 161, '1.19 M', '基于VPN应用'],
  ['185.199.108.133', 86, '843.09 K', '基于VPN应用'],
  ['101.6.16.66', 85, '8.97 M', '基于VPN应用'],
  ['185.199.111.133', 78, '687.05 K', '基于VPN应用'],
  ['185.199.110.133', 77, '816.32 K', '基于VPN应用'],
  ['185.199.109.133', 73, '790.87 K', '基于VPN应用'],
  ['101.6.16.68', 16, '5.28 M', '基于VPN应用'],
  ['60.29.232.124', 13, '88.54 K', '基于VPN应用'],
  ['101.6.4.110', 9, '221.45 K', '基于VPN应用'],
  ['60.29.232.103', 4, '30.00 K', '基于VPN应用'],
  ['101.6.4.110', 3, '18.90 K', '基于VPN应用'],
  ['101.6.4.93', 3, '222', '基于VPN应用'],
  ['60.29.232.31', 2, '15.00 K', '基于VPN应用'],
  ['69.153.91.76', 1, '578', '基于VPN协议'],
  ['120.170.28.45', 1, '578', '基于VPN协议'],
  ['60.29.232.105', 1, '7.50 K', '基于VPN应用'],
  ['178.36.201.234', 1, '578', '基于VPN应用'],
]
const cbmRoDom: any[][] = [
  ['raw.githubusercontent.com', 291, '3.01 M', '基于VPN应用'],
  ['api.bing.com', 23, '172.89 K', '基于VPN应用'],
]

// 实时会话弹窗状态
const cbRoSessionVisible = ref(false)
const cbRoSessionTitle = ref('实时会话')
const spFilterType = ref('任意IP')
const spFilterValue = ref('')
const spFilterSrcPort = ref('80 / 8000-8080')
const spFilterTargetType = ref('任意IP')
const spFilterTargetValue = ref('')
const spFilterDstPort = ref('80 / 8000-8080')
const spFilterAppProto = ref('')
const spFilterMac = ref('')
const spFilterProto = ref('任意')
const spFilterSuspect = ref('任意')
const spFilterDomain = ref('')
const spFilterUser = ref('')
const spFilterModel = ref('任意')
const spFilterProtoType = ref('任意')
const spFilterLink = ref('任意')
const spPage = ref(1)
const spPageSize = ref(100)
const spTotal = ref(371)

const spData = [
  { t: '2026-07-10/03:41:13', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', src: '116.21.222.216:53422', dst: '101.6.6.6:5353', proto: 'TCP', protoName: 'FastVPN/…', up: 101, dn: 101 },
  { t: '2026-07-10/03:41:11', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', src: '116.21.222.216:62835', dst: '101.6.6.6:5353', proto: 'TCP', protoName: 'FastVPN/…', up: 101, dn: 101 },
  { t: '2026-07-10/03:41:11', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', src: '116.21.222.216:20363', dst: '101.6.6.6:5353', proto: 'TCP', protoName: 'FastVPN/…', up: 101, dn: 101 },
  { t: '2026-07-10/03:41:11', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', src: '116.21.222.216:19904', dst: '101.6.6.6:5353', proto: 'TCP', protoName: 'FastVPN/…', up: 101, dn: 101 },
  { t: '2026-07-10/03:41:10', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', src: '116.21.222.216:5349', dst: '101.6.6.6:5353', proto: 'TCP', protoName: 'FastVPN/…', up: 101, dn: 101 },
  { t: '2026-07-10/03:41:09', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', src: '116.21.222.216:65076', dst: '101.6.6.6:5353', proto: 'TCP', protoName: 'FastVPN/…', up: 101, dn: 101 },
  { t: '2026-07-10/03:41:09', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', src: '116.21.222.216:53793', dst: '101.6.6.6:5353', proto: 'TCP', protoName: 'FastVPN/…', up: 101, dn: 101 },
  { t: '2026-07-10/03:41:09', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', src: '116.21.222.216:7326', dst: '101.6.6.6:5353', proto: 'TCP', protoName: 'FastVPN/…', up: 101, dn: 101 },
  { t: '2026-07-10/03:41:09', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', src: '116.21.222.216:40574', dst: '101.6.6.6:5353', proto: 'TCP', protoName: 'FastVPN/…', up: 101, dn: 101 },
  { t: '2026-07-10/03:41:09', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', src: '116.21.222.216:48626', dst: '101.6.6.6:5353', proto: 'TCP', protoName: 'FastVPN/…', up: 101, dn: 101 },
  { t: '2026-07-10/03:41:08', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', src: '116.21.222.216:28926', dst: '101.6.6.6:5353', proto: 'TCP', protoName: 'FastVPN/…', up: 101, dn: 101 },
  { t: '2026-07-10/03:41:08', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', src: '116.21.222.216:50234', dst: '101.6.6.6:5353', proto: 'TCP', protoName: 'FastVPN/…', up: 101, dn: 101 },
  { t: '2026-07-10/03:25:21', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', src: '116.21.222.216:29640', dst: '101.6.6.6:5353', proto: 'TCP', protoName: 'FastVPN/…', up: 101, dn: 101 },
  { t: '2026-07-10/03:25:21', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', src: '116.21.222.216:32838', dst: '101.6.6.6:5353', proto: 'TCP', protoName: 'FastVPN/…', up: 101, dn: 101 },
  { t: '2026-07-10/03:25:20', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', src: '116.21.222.216:41256', dst: '101.6.6.6:5353', proto: 'TCP', protoName: 'FastVPN/…', up: 101, dn: 101 },
]

// 报文分析弹窗状态
const cbPacketVisible = ref(false)
const cbPacketTab = ref('parse')

const cbPacketParseData = [
  { time: '2026-07-10 03:41:13.123456', src: '116.21.222.216', dst: '101.6.6.6', proto: 'TCP', len: '74 字节', info: '53422 → 5353 [SYN] Seq=0 Win=64240 Len=0 MSS=1460' },
  { time: '2026-07-10 03:41:13.123789', src: '101.6.6.6', dst: '116.21.222.216', proto: 'TCP', len: '74 字节', info: '5353 → 53422 [SYN, ACK] Seq=0 Ack=1 Win=65535 Len=0 MSS=1460' },
  { time: '2026-07-10 03:41:13.124012', src: '116.21.222.216', dst: '101.6.6.6', proto: 'TCP', len: '66 字节', info: '53422 → 5353 [ACK] Seq=1 Ack=1 Win=64240 Len=0' },
  { time: '2026-07-10 03:41:13.124234', src: '116.21.222.216', dst: '101.6.6.6', proto: 'TCP', len: '1514 字节', info: '53422 → 5353 [PSH, ACK] Seq=1 Ack=1 Win=64240 Len=1448' },
  { time: '2026-07-10 03:41:13.124567', src: '101.6.6.6', dst: '116.21.222.216', proto: 'TCP', len: '66 字节', info: '5353 → 53422 [ACK] Seq=1 Ack=1449 Win=64087 Len=0' },
  { time: '2026-07-10 03:41:13.124890', src: '101.6.6.6', dst: '116.21.222.216', proto: 'TCP', len: '1514 字节', info: '5353 → 53422 [PSH, ACK] Seq=1 Ack=1449 Win=64087 Len=1448' },
  { time: '2026-07-10 03:41:13.125123', src: '116.21.222.216', dst: '101.6.6.6', proto: 'TCP', len: '66 字节', info: '53422 → 5353 [ACK] Seq=1449 Ack=1449 Win=62792 Len=0' },
  { time: '2026-07-10 03:41:13.125456', src: '116.21.222.216', dst: '101.6.6.6', proto: 'TCP', len: '1514 字节', info: '53422 → 5353 [PSH, ACK] Seq=1449 Ack=1449 Win=62792 Len=1448' },
]

const cbPacketInteractData = [
  { time: '2026-07-10 03:41:13.123456', src: '116.21.222.216', dst: '101.6.6.6', proto: 'TCP', info: '客户端发起连接请求' },
  { time: '2026-07-10 03:41:13.123789', src: '101.6.6.6', dst: '116.21.222.216', proto: 'TCP', info: '服务端响应连接请求' },
  { time: '2026-07-10 03:41:13.124012', src: '116.21.222.216', dst: '101.6.6.6', proto: 'TCP', info: '客户端确认连接建立' },
  { time: '2026-07-10 03:41:13.124234', src: '116.21.222.216', dst: '101.6.6.6', proto: 'TCP', info: '客户端发送数据' },
  { time: '2026-07-10 03:41:13.124567', src: '101.6.6.6', dst: '116.21.222.216', proto: 'TCP', info: '服务端确认收到数据' },
  { time: '2026-07-10 03:41:13.124890', src: '101.6.6.6', dst: '116.21.222.216', proto: 'TCP', info: '服务端发送响应数据' },
  { time: '2026-07-10 03:41:13.125123', src: '116.21.222.216', dst: '101.6.6.6', proto: 'TCP', info: '客户端确认收到响应' },
  { time: '2026-07-10 03:41:13.125456', src: '116.21.222.216', dst: '101.6.6.6', proto: 'TCP', info: '客户端继续发送数据' },
]

const cbPacketMetaData = [
  { key: '会话ID', val: 'cb-session-20260710-034113-001' },
  { key: '源IP', val: '116.21.222.216' },
  { key: '源端口', val: '53422' },
  { key: '目标IP', val: '101.6.6.6' },
  { key: '目标端口', val: '5353' },
  { key: '协议', val: 'TCP' },
  { key: '开始时间', val: '2026-07-10 03:41:13.123456' },
  { key: '结束时间', val: '2026-07-10 03:41:13.125456' },
  { key: '持续时间', val: '2.000 ms' },
  { key: '上行流量', val: '101 字节' },
  { key: '下行流量', val: '101 字节' },
  { key: '分析模型', val: '基于VPN应用' },
  { key: '疑似度', val: '高' },
  { key: '地理位置', val: '\u{1F1E8}\u{1F1F3} 北京' },
]

// IP右键菜单状态
const ipCtxVisible = ref(false)
const ipCtxIp = ref('')
const ipCtxX = ref(0)
const ipCtxY = ref(0)

// 工具函数
function getPageList(current: number, total: number): number[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: number[] = []
  if (current <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i)
    pages.push(-1)
    pages.push(total)
  } else if (current >= total - 3) {
    pages.push(1)
    pages.push(-1)
    for (let i = total - 4; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    pages.push(-1)
    for (let i = current - 1; i <= current + 1; i++) pages.push(i)
    pages.push(-1)
    pages.push(total)
  }
  return pages
}

// 搜索和重置函数
function searchCbRo() { /* mock: no-op */ }
function resetCbRoFilters() {
  cbRoModel.value = ''
  cbRoSuspect.value = ''
  cbRoReqMin.value = ''
  cbRoLink.value = ''
  cbRoRange.value = 'day'
}

// 实时会话弹窗函数
function openRealtimeSession(type: string, value: string) {
  cbRoSessionTitle.value = `实时会话 - ${type}: ${value}`
  if (type === '源IP') {
    spFilterType.value = '源IP'
    spFilterValue.value = value
    spFilterTargetType.value = '任意IP'
    spFilterTargetValue.value = ''
    spFilterDomain.value = ''
  } else if (type === '目标IP') {
    spFilterType.value = '任意IP'
    spFilterValue.value = ''
    spFilterTargetType.value = '目标IP'
    spFilterTargetValue.value = value
    spFilterDomain.value = ''
  } else if (type === '请求域名') {
    spFilterType.value = '任意IP'
    spFilterValue.value = ''
    spFilterTargetType.value = '任意IP'
    spFilterTargetValue.value = ''
    spFilterDomain.value = value
  }
  spPage.value = 1
  cbRoSessionVisible.value = true
}

function searchSpData() { /* mock: no-op */ }
function resetSpFilters() {
  spFilterType.value = '任意IP'
  spFilterValue.value = ''
  spFilterSrcPort.value = '80 / 8000-8080'
  spFilterTargetType.value = '任意IP'
  spFilterTargetValue.value = ''
  spFilterDstPort.value = '80 / 8000-8080'
  spFilterAppProto.value = ''
  spFilterMac.value = ''
  spFilterProto.value = '任意'
  spFilterSuspect.value = '任意'
  spFilterDomain.value = ''
  spFilterUser.value = ''
  spFilterModel.value = '任意'
  spFilterProtoType.value = '任意'
  spFilterLink.value = '任意'
  spPage.value = 1
}

// 报文分析弹窗函数
function openPacketAnalysis(row: any) {
  cbPacketTab.value = 'parse'
  cbPacketVisible.value = true
}

// IP右键菜单函数
function showIpContextMenu(event: MouseEvent, ip: string) {
  ipCtxIp.value = ip
  ipCtxX.value = event.clientX
  ipCtxY.value = event.clientY
  ipCtxVisible.value = true
}

function blockIp(ip: string) {
  alert(`阻断IP: ${ip}（Mock）`)
}

// ===== 实时会话 tab =====
const rsSrcType = ref('任意IP')
const rsSrcValue = ref('')
const rsSrcPort = ref('80 / 8000-8080')
const rsDstType = ref('任意IP')
const rsDstValue = ref('')
const rsDstPort = ref('80 / 8000-8080')
const rsAppProto = ref('')
const rsMac = ref('')
const rsProto = ref('任意')
const rsSuspect = ref('任意')
const rsDomain = ref('')
const rsUser = ref('')
const rsModel = ref('任意')
const rsProtoType = ref('任意')
const rsLink = ref('任意')
const rsPage = ref(1)
const rsPageSize = ref(100)
const rsTotal = ref(18839)
const rsPacketDropdownIndex = ref(-1)

function searchRsData() { /* mock: no-op */ }
function resetRsFilters() {
  rsSrcType.value = '任意IP'; rsSrcValue.value = ''; rsSrcPort.value = '80 / 8000-8080'
  rsDstType.value = '任意IP'; rsDstValue.value = ''; rsDstPort.value = '80 / 8000-8080'
  rsAppProto.value = ''; rsMac.value = ''; rsProto.value = '任意'
  rsSuspect.value = '任意'; rsDomain.value = ''; rsUser.value = ''
  rsModel.value = '任意'; rsProtoType.value = '任意'; rsLink.value = '任意'
  rsPage.value = 1
}

function toggleRsPacketDropdown(index: number) {
  rsPacketDropdownIndex.value = rsPacketDropdownIndex.value === index ? -1 : index
}

function openRsPacket(row: any) {
  cbPacketTab.value = 'parse'
  cbPacketVisible.value = true
}

function openPacketAnalysisFromRs(row: any) {
  rsPacketDropdownIndex.value = -1
  cbPacketTab.value = 'parse'
  cbPacketVisible.value = true
}

// 实时会话表格mock数据（29行，匹配截图）
const cbmRs = [
  { t: '2026-07-10/14:42:17', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', src: '117.81.246.19:53842', dst: '101.6.15.130:443', proto: 'TCP', protoName: '泡芙云', up: '1.80 K', down: '0', domain: '' },
  { t: '2026-07-10/14:41:40', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', src: '106.8.158.234:47735', dst: '101.6.15.70:443', proto: 'TCP', protoName: '泡芙云', up: '823', down: '38.56 K', domain: '' },
  { t: '2026-07-10/14:41:27', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', src: '120.227.28.226:17600', dst: '101.6.88:443', proto: 'TCP', protoName: '泡芙云', up: '5.47 K', down: '2.66 M', domain: '' },
  { t: '2026-07-10/14:42:44', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', src: '39.140.74.252:53871', dst: '101.6.15.130:443', proto: 'TCP', protoName: '泡芙云', up: '1.62 K', down: '0', domain: '' },
  { t: '2026-07-10/14:42:00', mac: '30-80-9b-8d-90-01', vendor: 'NewH3CTec...', src: '101.6.6.173:43524', dst: '202.204.128.11:29513', proto: 'TCP', protoName: 'Clash', up: '469', down: '6.84 K', domain: '' },
  { t: '2026-07-10/14:42:20', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', src: '223.73.94.181:7273', dst: '101.6.16.66:443', proto: 'TCP', protoName: '泡芙云', up: '1.48 K', down: '7.68 K', domain: '' },
  { t: '2026-07-10/14:42:09', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', src: '223.79.114.187:11711', dst: '101.6.15.130:443', proto: 'TCP', protoName: '泡芙云', up: '1.48 K', down: '8.95 K', domain: '' },
  { t: '2026-07-10/14:42:09', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', src: '111.40.106.188:11313', dst: '101.6.15.130:443', proto: 'TCP', protoName: '泡芙云', up: '1.45 K', down: '10.13 K', domain: '' },
  { t: '2026-07-10/14:42:05', mac: '30-80-9b-8d-90-01', vendor: 'NewH3CTec...', src: '101.6.6.173:27320', dst: '202.204.128.11:29513', proto: 'TCP', protoName: 'Clash', up: '478', down: '7.58 K', domain: '' },
  { t: '2026-07-10/14:39:48', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', src: '223.90.115.74:27733', dst: '101.6.15.130:443', proto: 'TCP', protoName: '泡芙云', up: '1.56 K', down: '0', domain: '' },
  { t: '2026-07-10/14:39:43', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', src: '183.228.119.119:51168', dst: '101.6.15.130:443', proto: 'TCP', protoName: '泡芙云', up: '1.54 K', down: '2.27 K', domain: '' },
  { t: '2026-07-10/14:39:42', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', src: '123.86.224.62:23123', dst: '101.6.15.130:443', proto: 'TCP', protoName: '泡芙云', up: '1.51 K', down: '4.14 K', domain: '' },
  { t: '2026-07-10/14:39:31', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', src: '111.59.45.188:36123', dst: '101.6.15.66:443', proto: 'TCP', protoName: '泡芙云', up: '1.21 K', down: '554.09 K', domain: '' },
  { t: '2026-07-10/14:39:53', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', src: '222.86.233.220:59067', dst: '101.6.15.130:443', proto: 'TCP', protoName: '泡芙云', up: '1.22 K', down: '0', domain: '' },
  { t: '2026-07-10/14:39:32', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', src: '115.223.185.20:52044', dst: '101.6.15.130:443', proto: 'TCP', protoName: '泡芙云', up: '1.51 K', down: '0', domain: '' },
  { t: '2026-07-10/14:39:07', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', src: '121.24.11.92:49917', dst: '101.6.15.130:443', proto: 'TCP', protoName: '泡芙云', up: '583', down: '0', domain: '' },
  { t: '2026-07-10/14:38:05', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', src: '117.189.100.254:46813', dst: '101.6.15.130:443', proto: 'TCP', protoName: 'Clash', up: '450', down: '0', domain: '' },
  { t: '2026-07-10/14:38:00', mac: '30-80-9b-8d-90-01', vendor: 'NewH3CTec...', src: '36.24.169.59:43993', dst: '101.6.6.6:5353', proto: 'UDP', protoName: 'FastVPN/…', up: '75', down: '75', domain: '' },
  { t: '2026-07-10/14:37:37', mac: '30-80-9b-8d-90-01', vendor: 'NewH3CTec...', src: '101.6.6.17:55484', dst: '185.199.108.133:443', proto: 'TCP', protoName: 'Awkrd/…', up: '994', down: '5.52 K', domain: 'raw.githubusercontent.com' },
  { t: '2026-07-10/14:37:26', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', src: '27.224.132.107:22544', dst: '101.6.15.130:443', proto: 'TCP', protoName: '泡芙云', up: '1.57 K', down: '10.06 K', domain: '' },
  { t: '2026-07-10/14:37:22', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', src: '81.241.205.199:63867', dst: '101.6.15.130:443', proto: 'TCP', protoName: '泡芙云', up: '1.56 K', down: '0', domain: '' },
  { t: '2026-07-10/14:37:14', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', src: '117.189.100.186:37367', dst: '101.6.15.130:443', proto: 'TCP', protoName: '泡芙云', up: '1.31 K', down: '0', domain: '' },
  { t: '2026-07-10/14:37:05', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', src: '180.172.22.153:22741', dst: '101.6.4.110:443', proto: 'TCP', protoName: '泡芙云', up: '1.61 K', down: '1.51 K', domain: '' },
  { t: '2026-07-10/14:36:51', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', src: '101.207.139.209:7500', dst: '101.6.15.70:443', proto: 'TCP', protoName: '泡芙云', up: '1.47 K', down: '8.15 K', domain: '' },
  { t: '2026-07-10/14:36:35', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', src: '220.202.203.69:3745', dst: '101.6.15.66:443', proto: 'TCP', protoName: '泡芙云', up: '1.25 K', down: '16.67 K', domain: '' },
  { t: '2026-07-10/14:36:10', mac: '30-80-9b-8d-90-01', vendor: 'NewH3CTec...', src: '101.6.16.166:22374', dst: '185.199.108.133:443', proto: 'TCP', protoName: 'Awkrd/…', up: '840', down: '5.82 K', domain: 'raw.githubusercontent.com' },
  { t: '2026-07-10/14:36:02', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', src: '113.94.243.221:61291', dst: '101.6.15.66:443', proto: 'TCP', protoName: '泡芙云', up: '1.20 K', down: '33.21 K', domain: '' },
  { t: '2026-07-10/14:35:32', mac: '30-80-9b-8d-90-01', vendor: 'NewH3CTec...', src: '60.1.178.10:3470', dst: '101.6.6.6:5353', proto: 'UDP', protoName: 'FastVPN/…', up: '77', down: '77', domain: '' },
  { t: '2026-07-10/14:35:29', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', src: '106.8.139.74:60423', dst: '101.6.15.66:443', proto: 'TCP', protoName: '泡芙云', up: '1.25 K', down: '9.57 K', domain: '' },
]

// ===== 模型概况 tab =====
const moMac = ref('')
const moSrcType = ref('任意IP')
const moSrcValue = ref('')
const moSrcPort = ref('80 / 8000-80')
const moDstType = ref('任意IP')
const moDstValue = ref('')
const moDstPort = ref('80 / 8000-80')
const moProto = ref('任意')
const moDomain = ref('')
const moReqMin = ref('')
const moRegion = ref('任意')
const moLink = ref('任意')
const moTimeRange = ref('2026-07-10 14:27:47 - 2026-07-10 14:42:47')

const moTrendOption = computed(() => {
  const times = ['14:28', '14:29', '14:30', '14:31', '14:32', '14:33', '14:34', '14:35', '14:36', '14:37', '14:38', '14:39', '14:40', '14:41', '14:42']
  const vpnApp = [8, 3, 2, 3, 2, 4, 3, 5, 3, 4, 3, 5, 4, 6, 3]
  return {
    tooltip: { trigger: 'axis' },
    legend: { show: false },
    grid: { left: 60, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: times, axisLine: { lineStyle: { color: '#dcdfe6' } }, axisLabel: { color: '#909399', fontSize: 10 } },
    yAxis: { type: 'value', name: '#Session', nameTextStyle: { color: '#909399', fontSize: 11 }, axisLine: { show: false }, splitLine: { lineStyle: { color: '#f0f2f5' } }, axisLabel: { color: '#909399', fontSize: 10 } },
    series: [
      { name: '基于VPN应用', type: 'line', smooth: true, symbol: 'none', itemStyle: { color: '#fac858' }, areaStyle: { color: '#fac858', opacity: 0.3 }, data: vpnApp },
    ],
  }
})

const moPieOption = computed(() => {
  return {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { fontSize: 11, color: '#606266' } },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: false,
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 12 } },
      data: [
        { value: 100, name: '基于VPN应用', itemStyle: { color: '#fac858' } },
      ],
    }],
  }
})

const moSrcPage = ref(1)
const moSrcPageSize = ref(20)
const moSrcTotal = ref(52)

const moDstPage = ref(1)
const moDstPageSize = ref(20)
const moDstTotal = ref(11)

const moDomPage = ref(1)
const moDomPageSize = ref(20)
const moDomTotal = ref(1)

const moSrcRows: any[][] = [
  ['101.6.6.173', 4, 0, '26.09 K', '基于VPN应用'],
  ['101.6.14.166', 4, 0, '25.25 K', '基于VPN应用'],
  ['36.182.12.241', 2, 0, '260', '基于VPN应用'],
  ['163.203.76.84', 1, 0, '6.10 K', '基于VPN应用'],
  ['36.24.166.69', 1, 0, '150', '基于VPN应用'],
  ['223.90.115.74', 1, 1, '1.56 K', '基于VPN应用'],
  ['117.189.190.254', 1, 1, '450', '基于VPN应用'],
  ['120.227.86.208', 1, 0, '2.87 M', '基于VPN应用'],
  ['117.189.162.107', 1, 0, '8.82 K', '基于VPN应用'],
  ['121.34.51.92', 1, 1, '583', '基于VPN应用'],
  ['113.94.243.221', 1, 0, '34.44 K', '基于VPN应用'],
  ['223.79.114.187', 1, 0, '11.44 K', '基于VPN应用'],
  ['36.146.74.252', 1, 0, '1.62 K', '基于VPN应用'],
  ['111.86.45.188', 1, 0, '555.35 K', '基于VPN应用'],
  ['117.181.15.144', 1, 0, '4.57 K', '基于VPN应用'],
  ['111.40.140.108', 1, 0, '20.60 K', '基于VPN应用'],
  ['123.86.224.62', 1, 0, '5.46 K', '基于VPN应用'],
  ['27.224.132.107', 1, 0, '11.44 K', '基于VPN应用'],
  ['115.223.185.28', 1, 1, '1.51 K', '基于VPN应用'],
  ['101.87.148.30', 1, 0, '148', '基于VPN应用'],
]

const moDstRows: any[][] = [
  ['101.6.6.130', '国内', 21, 16, '69.41 K', '基于VPN应用'],
  ['101.6.15.68', '国内', 10, 0, '3.33 M', '基于VPN应用'],
  ['101.6.16.70', '国内', 9, 0, '157.74 K', '基于VPN应用'],
  ['101.6.6.6', '国内', 6, 0, '878', '基于VPN应用'],
  ['202.204.128.11', '国内', 4, 0, '20.69 K', '基于VPN应用'],
  ['185.199.111.133', '国外', 2, 0, '13.37 K', '基于VPN应用'],
  ['185.199.109.1', '国外', 2, 0, '11.89 K', '基于VPN应用'],
  ['101.6.15.67', '国内', 2, 0, '22.97 K', '基于VPN应用'],
  ['185.199.108.1', '国外', 1, 0, '6.89 K', '基于VPN应用'],
  ['101.6.15.68', '国内', 1, 0, '12.85 K', '基于VPN应用'],
  ['101.6.4.110', '国内', 1, 0, '3.12 K', '基于VPN应用'],
]

const moDomRows: any[][] = [
  ['raw.githubusercontent.com', 4, 0, '25.00 K', '基于VPN应用'],
]

// 模型概况 - IP右键菜单
const moIpCtxVisible = ref(false)
const moIpCtxIp = ref('')
const moIpCtxX = ref(0)
const moIpCtxY = ref(0)

function showMoIpCtx(event: MouseEvent, ip: string) {
  moIpCtxIp.value = ip
  moIpCtxX.value = event.clientX
  moIpCtxY.value = event.clientY
  moIpCtxVisible.value = true
}

// 模型概况 - 历史会话弹窗
const moSessionVisible = ref(false)
const moSessionTitle = ref('历史会话')
const moSpMac = ref('')
const moSpIpType = ref('单个IP')
const moSpIpValue = ref('')
const moSpUserPort = ref('80 / 8000-80')
const moSpNodeType = ref('任意IP')
const moSpNodeValue = ref('')
const moSpNodePort = ref('80 / 8000-80')
const moSpProto = ref('任意')
const moSpDomain = ref('')
const moSpAppProto = ref('任意协议')
const moSpTimeRange = ref('2026-07-10 14:27:47 - 2026-07-10 14:42:47')
const moSpPage = ref(1)
const moSpPageSize = ref(100)
const moSpTotal = ref(4)

const moSpData = [
  { t: '2026-07-10 14:36:10', mac: '30-80-9b-8d-90-01', vendor: 'NewH3CTec...', userIp: '101.6.14.166:22274', nodeIp: '185.199.109.133:443', proto: 'TCP', protoName: 'Aladdin云', up: '840', dn: '5.82 K', total: '6.64 K' },
  { t: '2026-07-10 14:42:34', mac: '30-80-9b-8d-90-01', vendor: 'NewH3CTec...', userIp: '101.6.14.166:22275', nodeIp: '185.199.109.133:443', proto: 'TCP', protoName: 'Aladdin云', up: '918', dn: '4.35 K', total: '5.24 K' },
  { t: '2026-07-10 14:32:34', mac: '30-80-9b-8d-90-01', vendor: 'NewH3CTec...', userIp: '101.6.14.166:22555', nodeIp: '185.199.111.133:443', proto: 'TCP', protoName: 'Aladdin云', up: '918', dn: '5.75 K', total: '6.65 K' },
  { t: '2026-07-10 14:42:27', mac: '30-80-9b-8d-90-01', vendor: 'NewH3CTec...', userIp: '101.6.14.166:22556', nodeIp: '185.199.111.133:443', proto: 'TCP', protoName: 'Aladdin云', up: '5.82 K', dn: '6.72 K', total: '12.54 K' },
]

function openMoSession(type: string, value: string) {
  moSessionTitle.value = `历史会话 - ${type}: ${value}`
  if (type === '源IP') {
    moSpIpType.value = '单个IP'
    moSpIpValue.value = value
    moSpNodeType.value = '任意IP'
    moSpNodeValue.value = ''
  } else if (type === '目标IP') {
    moSpIpType.value = '任意IP'
    moSpIpValue.value = ''
    moSpNodeType.value = '目标IP'
    moSpNodeValue.value = value
  } else if (type === '请求域名') {
    moSpIpType.value = '任意IP'
    moSpIpValue.value = ''
    moSpNodeType.value = '任意IP'
    moSpNodeValue.value = ''
    moSpDomain.value = value
  }
  moSpPage.value = 1
  moSessionVisible.value = true
}

function searchMoData() { /* mock: no-op */ }
function resetMoFilters() {
  moMac.value = ''; moSrcType.value = '任意IP'; moSrcValue.value = ''; moSrcPort.value = '80 / 8000-80'
  moDstType.value = '任意IP'; moDstValue.value = ''; moDstPort.value = '80 / 8000-80'; moProto.value = '任意'
  moDomain.value = ''; moReqMin.value = ''; moRegion.value = '任意'; moLink.value = '任意'
  moTimeRange.value = '2026-07-10 14:27:47 - 2026-07-10 14:42:47'
}

function searchMoSpData() { /* mock: no-op */ }
function resetMoSpFilters() {
  moSpMac.value = ''; moSpIpType.value = '单个IP'; moSpIpValue.value = ''; moSpUserPort.value = '80 / 8000-80'
  moSpNodeType.value = '任意IP'; moSpNodeValue.value = ''; moSpNodePort.value = '80 / 8000-80'; moSpProto.value = '任意'
  moSpDomain.value = ''; moSpAppProto.value = '任意协议'
  moSpTimeRange.value = '2026-07-10 14:27:47 - 2026-07-10 14:42:47'
  moSpPage.value = 1
}

// ===== VPN应用 tab =====
const vaMac = ref('')
const vaSrcType = ref('任意IP')
const vaSrcValue = ref('')
const vaSrcPort = ref('80 / 8000-8080')
const vaDstType = ref('任意IP')
const vaDstValue = ref('')
const vaDstPort = ref('80 / 8000-8080')
const vaAppProto = ref('')
const vaProtoType = ref('任意协议')
const vaDomain = ref('')
const vaReqMin = ref('')
const vaRegion = ref('任意')
const vaLink = ref('任意')
const vaTimeRange = ref('2026-07-10 14:38:21 - 2026-07-10 14:53:21')

const vaTrendOption = computed(() => {
  const times = ['14:38', '14:39', '14:40', '14:41', '14:42', '14:43', '14:44', '14:45', '14:46', '14:47', '14:48', '14:49', '14:50', '14:51', '14:52', '14:53']
  const allProto = [5, 4, 3, 2, 1, 2, 3, 4, 5, 6, 7, 5, 4, 3, 2, 1]
  return {
    tooltip: { trigger: 'axis' },
    legend: { show: false },
    grid: { left: 60, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: times, axisLine: { lineStyle: { color: '#dcdfe6' } }, axisLabel: { color: '#909399', fontSize: 10 } },
    yAxis: { type: 'value', name: '#Session', nameTextStyle: { color: '#909399', fontSize: 11 }, axisLine: { show: false }, splitLine: { lineStyle: { color: '#f0f2f5' } }, axisLabel: { color: '#909399', fontSize: 10 } },
    series: [
      { name: '所有协议', type: 'line', smooth: true, symbol: 'none', itemStyle: { color: '#5470c6' }, areaStyle: { color: '#5470c6', opacity: 0.3 }, data: allProto },
    ],
  }
})

const vaPieOption = computed(() => {
  return {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { fontSize: 11, color: '#606266' } },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: false,
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 12 } },
      data: [
        { value: 77.78, name: 'FastVPN/SuperVPN', itemStyle: { color: '#5470c6' } },
        { value: 28.89, name: '泡芙云', itemStyle: { color: '#91cc75' } },
        { value: 13.33, name: 'Clash', itemStyle: { color: '#fac858' } },
        { value: 13.33, name: 'Aladdin', itemStyle: { color: '#ee6666' } },
      ],
    }],
  }
})

const vaAppRows: any[][] = [
  ['泡芙云', 45, '3.59 M'],
  ['Clash', 13, '97.21 K'],
  ['Aladdin云', 6, '66.19 K'],
  ['FastVPN/SuperVPN', 5, '838'],
]

const vaDstPage = ref(1)
const vaDstPageSize = ref(20)
const vaDstTotal = ref(9)

const vaDstRows: any[][] = [
  ['101.6.15.130', '国内', 28, '86.35 K'],
  ['101.6.15.70', '国内', 13, '205.86 K'],
  ['202.204.128.11', '国内', 9, '64.69 K'],
  ['101.6.15.66', '国内', 7, '3.27 M'],
  ['101.6.6.6', '国内', 5, '838'],
  ['185.199.111.133', '国外', 2, '13.44 K'],
  ['185.199.108.133', '国外', 2, '22.71 K'],
  ['185.199.109.133', '国外', 2, '24.03 K'],
  ['101.6.15.68', '国内', 1, '11.21 K'],
]

const vaDomRows: any[][] = [
  ['raw.githubusercontent.com', 6, '60.19 K'],
]

// VPN应用 - 应用详情弹窗
const vaAppDetailVisible = ref(false)
const vaAppDetailTitle = ref('应用详情')
const vaAdMac = ref('')
const vaAdSrcType = ref('任意IP')
const vaAdSrcValue = ref('')
const vaAdSrcPort = ref('80 / 8000-8080')
const vaAdDstType = ref('任意IP')
const vaAdDstValue = ref('')
const vaAdDstPort = ref('80 / 8000-8080')
const vaAdAppProto = ref('泡芙云')
const vaAdDomain = ref('')
const vaAdReqMin = ref('')
const vaAdRegion = ref('任意')
const vaAdLink = ref('任意')
const vaAdTimeRange = ref('2026-07-10 14:38:21 - 2026-07-10 14:53:21')

const vaAdTrendOption = computed(() => {
  const times = ['14:38', '14:39', '14:40', '14:41', '14:42', '14:43', '14:44', '14:45', '14:46', '14:47', '14:48', '14:49', '14:50', '14:51', '14:52', '14:53']
  const allProto = [5, 4, 3, 2, 1, 2, 3, 4, 5, 6, 7, 5, 4, 3, 2, 1]
  return {
    tooltip: { trigger: 'axis' },
    legend: { show: false },
    grid: { left: 60, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: times, axisLine: { lineStyle: { color: '#dcdfe6' } }, axisLabel: { color: '#909399', fontSize: 10 } },
    yAxis: { type: 'value', name: '#Session', nameTextStyle: { color: '#909399', fontSize: 11 }, axisLine: { show: false }, splitLine: { lineStyle: { color: '#f0f2f5' } }, axisLabel: { color: '#909399', fontSize: 10 } },
    series: [
      { name: '所有协议', type: 'line', smooth: true, symbol: 'none', itemStyle: { color: '#5470c6' }, areaStyle: { color: '#5470c6', opacity: 0.3 }, data: allProto },
    ],
  }
})

const vaAdPieOption = computed(() => {
  return {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { fontSize: 11, color: '#606266' } },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: false,
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 12 } },
      data: [
        { value: 100, name: '泡芙云', itemStyle: { color: '#5470c6' } },
      ],
    }],
  }
})

const vaAdDstRows: any[][] = [
  ['101.6.15.130', 25, '62.90 K'],
  ['101.6.15.70', 12, '236.89 K'],
  ['101.6.15.66', 7, '3.27 M'],
  ['101.6.15.68', 1, '11.21 K'],
]

function openVaAppDetail(appName: string) {
  vaAppDetailTitle.value = `应用详情 - ${appName}`
  vaAdAppProto.value = appName
  vaAppDetailVisible.value = true
}

function searchVaData() { /* mock: no-op */ }
function resetVaFilters() {
  vaMac.value = ''; vaSrcType.value = '任意IP'; vaSrcValue.value = ''; vaSrcPort.value = '80 / 8000-8080'
  vaDstType.value = '任意IP'; vaDstValue.value = ''; vaDstPort.value = '80 / 8000-8080'; vaAppProto.value = ''
  vaProtoType.value = '任意协议'; vaDomain.value = ''; vaReqMin.value = ''; vaRegion.value = '任意'
  vaLink.value = '任意'; vaTimeRange.value = '2026-07-10 14:38:21 - 2026-07-10 14:53:21'
}

function searchVaAdData() { /* mock: no-op */ }
function resetVaAdFilters() {
  vaAdMac.value = ''; vaAdSrcType.value = '任意IP'; vaAdSrcValue.value = ''; vaAdSrcPort.value = '80 / 8000-8080'
  vaAdDstType.value = '任意IP'; vaAdDstValue.value = ''; vaAdDstPort.value = '80 / 8000-8080'; vaAdAppProto.value = '泡芙云'
  vaAdDomain.value = ''; vaAdReqMin.value = ''; vaAdRegion.value = '任意'; vaAdLink.value = '任意'
  vaAdTimeRange.value = '2026-07-10 14:38:21 - 2026-07-10 14:53:21'
}

// ===== 历史会话 tab =====
const hsMac = ref('')
const hsUserIpType = ref('任意IP')
const hsUserIpValue = ref('')
const hsUserPort = ref('80 / 8000-80')
const hsNodeIpType = ref('任意IP')
const hsNodeIpValue = ref('')
const hsNodePort = ref('80 / 8000-80')
const hsProto = ref('任意')
const hsDomain = ref('')
const hsAppProto = ref('')
const hsTimeRange = ref('2026-07-10 14:50:15 - 2026-07-10 15:05:15')
const hsPage = ref(1)
const hsPageSize = ref(100)
const hsTotal = ref(51)
const hsDropdownIndex = ref(-1)

function toggleHsDropdown(index: number) {
  hsDropdownIndex.value = hsDropdownIndex.value === index ? -1 : index
}

function openHsPacket(row: any) {
  hsDropdownIndex.value = -1
  cbPacketTab.value = 'parse'
  cbPacketVisible.value = true
}

function openPacketAnalysisFromHs(row: any) {
  hsDropdownIndex.value = -1
  cbPacketTab.value = 'parse'
  cbPacketVisible.value = true
}

function openPacketPlayFromHs(row: any) {
  hsDropdownIndex.value = -1
  packetPlayVisible.value = true
}

function downloadPacket(row: any) {
  hsDropdownIndex.value = -1
  alert(`报文下载: ${row.userIp} → ${row.nodeIp}（Mock）`)
}

function downloadContent(row: any) {
  hsDropdownIndex.value = -1
  alert(`内容下载: ${row.userIp} → ${row.nodeIp}（Mock）`)
}

function searchHsData() { /* mock: no-op */ }
function resetHsFilters() {
  hsMac.value = ''; hsUserIpType.value = '任意IP'; hsUserIpValue.value = ''; hsUserPort.value = '80 / 8000-80'
  hsNodeIpType.value = '任意IP'; hsNodeIpValue.value = ''; hsNodePort.value = '80 / 8000-80'; hsProto.value = '任意'
  hsDomain.value = ''; hsAppProto.value = ''; hsTimeRange.value = '2026-07-10 14:50:15 - 2026-07-10 15:05:15'
  hsPage.value = 1
}

// 历史会话表格mock数据（29行，匹配截图）
const hsData = [
  { t: '2026-07-10 14:50:53', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', userIp: '27.151.191.98:30756', nodeIp: '101.6.15.130:443', proto: 'TCP', protoName: '泡芙云', up: '1.54 K', dn: '0', total: '1.54 K', domain: '', model: '基于VPN应用' },
  { t: '2026-07-10 14:52:32', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', userIp: '27.216.146.117:34919', nodeIp: '101.6.15.130:443', proto: 'TCP', protoName: '泡芙云', up: '1.57 K', dn: '0', total: '1.57 K', domain: '', model: '基于VPN应用' },
  { t: '2026-07-10 14:50:24', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', userIp: '36.132.154.77:4964', nodeIp: '101.6.15.70:443', proto: 'TCP', protoName: '泡芙云', up: '1.52 K', dn: '12.41 K', total: '13.93 K', domain: '', model: '基于VPN应用' },
  { t: '2026-07-10 14:50:44', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', userIp: '36.142.87.80:43899', nodeIp: '101.6.15.130:443', proto: 'TCP', protoName: '泡芙云', up: '1.38 K', dn: '0', total: '1.38 K', domain: '', model: '基于VPN应用' },
  { t: '2026-07-10 14:56:55', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', userIp: '39.145.0.17:48149', nodeIp: '101.6.15.130:443', proto: 'TCP', protoName: '泡芙云', up: '841', dn: '0', total: '841', domain: '', model: '基于VPN应用' },
  { t: '2026-07-10 14:56:31', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', userIp: '39.164.47.21:5978', nodeIp: '101.6.15.130:443', proto: 'TCP', protoName: '泡芙云', up: '1.46 K', dn: '0', total: '1.46 K', domain: '', model: '基于VPN应用' },
  { t: '2026-07-10 14:51:07', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', userIp: '60.14.71.249:38151', nodeIp: '101.6.15.70:443', proto: 'TCP', protoName: '泡芙云', up: '1.94 K', dn: '29.12 K', total: '30.16 K', domain: '', model: '基于VPN应用' },
  { t: '2026-07-10 14:51:07', mac: '30-80-9b-8d-90-01', vendor: 'NewH3CTec...', userIp: '101.6.6.173:61928', nodeIp: '202.204.128.11:29513', proto: 'TCP', protoName: 'Clash', up: '464', dn: '7.79 K', total: '8.24 K', domain: '', model: '基于VPN应用' },
  { t: '2026-07-10 14:51:11', mac: '30-80-9b-8d-90-01', vendor: 'NewH3CTec...', userIp: '101.6.6.173:47176', nodeIp: '202.204.128.11:29513', proto: 'TCP', protoName: 'Clash', up: '466', dn: '7.05 K', total: '7.50 K', domain: '', model: '基于VPN应用' },
  { t: '2026-07-10 14:53:39', mac: '30-80-9b-8d-90-01', vendor: 'NewH3CTec...', userIp: '101.6.6.173:42258', nodeIp: '202.204.128.11:29513', proto: 'TCP', protoName: 'Clash', up: '468', dn: '7.47 K', total: '7.93 K', domain: '', model: '基于VPN应用' },
  { t: '2026-07-10 14:58:41', mac: '30-80-9b-8d-90-01', vendor: 'NewH3CTec...', userIp: '101.6.6.173:43868', nodeIp: '202.204.128.11:29513', proto: 'TCP', protoName: 'Clash', up: '465', dn: '6.77 K', total: '7.22 K', domain: '', model: '基于VPN应用' },
  { t: '2026-07-10 14:52:34', mac: '30-80-9b-8d-90-01', vendor: 'NewH3CTec...', userIp: '101.6.14.165:22218', nodeIp: '185.199.109.133:443', proto: 'TCP', protoName: 'Aladdin云', up: '918', dn: '5.75 K', total: '6.64 K', domain: 'raw.githubusercontent.com', model: '基于VPN应用' },
  { t: '2026-07-10 14:56:10', mac: '30-80-9b-8d-90-01', vendor: 'NewH3CTec...', userIp: '101.6.14.165:22276', nodeIp: '185.199.109.133:443', proto: 'TCP', protoName: 'Aladdin云', up: '918', dn: '5.78 K', total: '6.68 K', domain: 'raw.githubusercontent.com', model: '基于VPN应用' },
  { t: '2026-07-10 14:52:27', mac: '30-80-9b-8d-90-01', vendor: 'NewH3CTec...', userIp: '101.6.14.165:22557', nodeIp: '185.199.111.133:443', proto: 'TCP', protoName: 'Aladdin云', up: '918', dn: '5.82 K', total: '6.72 K', domain: 'raw.githubusercontent.com', model: '基于VPN应用' },
  { t: '2026-07-10 14:51:56', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', userIp: '101.27.86.164:28582', nodeIp: '101.6.15.130:443', proto: 'TCP', protoName: '泡芙云', up: '1.35 K', dn: '0', total: '1.35 K', domain: '', model: '基于VPN应用' },
  { t: '2026-07-10 14:54:07', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', userIp: '106.68.88.8:11141', nodeIp: '101.6.15.70:443', proto: 'TCP', protoName: '泡芙云', up: '606', dn: '73.75 K', total: '74.34 K', domain: '', model: '基于VPN应用' },
  { t: '2026-07-10 14:57:56', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', userIp: '111.17.145:19604', nodeIp: '101.6.15.130:443', proto: 'TCP', protoName: '泡芙云', up: '1.56 K', dn: '0', total: '1.56 K', domain: '', model: '基于VPN应用' },
  { t: '2026-07-10 14:58:55', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', userIp: '111.16.35:10802', nodeIp: '101.6.15.70:443', proto: 'TCP', protoName: '泡芙云', up: '1.80 K', dn: '16.69 K', total: '18.29 K', domain: '', model: '基于VPN应用' },
  { t: '2026-07-10 14:52:24', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', userIp: '111.52.94.43:6403', nodeIp: '101.6.15.130:443', proto: 'TCP', protoName: '泡芙云', up: '1.49 K', dn: '0', total: '1.49 K', domain: '', model: '基于VPN应用' },
  { t: '2026-07-10 14:56:54', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', userIp: '112.112.120.12:1731', nodeIp: '101.6.15.130:443', proto: 'TCP', protoName: '泡芙云', up: '1.85 K', dn: '11.50 K', total: '12.86 K', domain: '', model: '基于VPN应用' },
  { t: '2026-07-10 14:56:55', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', userIp: '113.120.76.133:21338', nodeIp: '101.6.15.130:443', proto: 'TCP', protoName: '泡芙云', up: '1.49 K', dn: '0', total: '1.49 K', domain: '', model: '基于VPN应用' },
  { t: '2026-07-10 14:56:19', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', userIp: '115.230.233.49:54300', nodeIp: '101.6.15.66:443', proto: 'TCP', protoName: '泡芙云', up: '1.37 K', dn: '19.47 K', total: '20.84 K', domain: '', model: '基于VPN应用' },
  { t: '2026-07-10 14:57:56', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', userIp: '118.74.148.85:6175', nodeIp: '101.6.15.130:443', proto: 'TCP', protoName: '泡芙云', up: '1.80 K', dn: '0', total: '1.80 K', domain: '', model: '基于VPN应用' },
  { t: '2026-07-10 14:52:49', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', userIp: '122.189.107.180:2249', nodeIp: '101.6.15.70:443', proto: 'TCP', protoName: '泡芙云', up: '1.52 K', dn: '18.59 K', total: '20.11 K', domain: '', model: '基于VPN应用' },
  { t: '2026-07-10 14:52:33', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', userIp: '123.162.50.125:52175', nodeIp: '101.6.15.70:443', proto: 'TCP', protoName: '泡芙云', up: '1.86 K', dn: '18.49 K', total: '20.35 K', domain: '', model: '基于VPN应用' },
  { t: '2026-07-10 14:54:04', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', userIp: '139.226.154.84:21385', nodeIp: '101.6.6.6:5353', proto: 'TCP', protoName: 'FastVPN/…', up: '101', dn: '101', total: '202', domain: '', model: '基于VPN应用' },
  { t: '2026-07-10 14:58:08', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', userIp: '139.226.154.84:19697', nodeIp: '101.6.6.6:5353', proto: 'TCP', protoName: 'FastVPN/…', up: '101', dn: '101', total: '202', domain: '', model: '基于VPN应用' },
  { t: '2026-07-10 14:55:21', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', userIp: '160.136.104.183:55...', nodeIp: '101.6.15.130:443', proto: 'TCP', protoName: '泡芙云', up: '3.02 K', dn: '0', total: '3.02 K', domain: '', model: '基于VPN应用' },
  { t: '2026-07-10 14:56:55', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', userIp: '162.38.112.144:20410', nodeIp: '101.6.15.130:443', proto: 'TCP', protoName: '泡芙云', up: '1.47 K', dn: '0', total: '1.47 K', domain: '', model: '基于VPN应用' },
]

// ===== 账号统计 tab =====
const asMac = ref('')
const asAppProto = ref('')
const asModel = ref('任意')
const asRegion = ref('任意')
const asUserName = ref('')
const asDomain = ref('')
const asSensitive = ref('任意')
const asLink = ref('任意')
const asTimeRange = ref('2026-07-10 15:11:29 - 2026-07-10 15:26:29')
const asPageSize = ref(100)

function searchAsData() { /* mock: no-op */ }
function resetAsFilters() {
  asMac.value = ''; asAppProto.value = ''; asModel.value = '任意'; asRegion.value = '任意'
  asUserName.value = ''; asDomain.value = ''; asSensitive.value = '任意'; asLink.value = '任意'
  asTimeRange.value = '2026-07-10 15:11:29 - 2026-07-10 15:26:29'
}

// ===== IP统计 tab =====
const ipUserIpType = ref('任意IP')
const ipUserIpValue = ref('')
const ipNodeIpType = ref('任意IP')
const ipNodeIpValue = ref('')
const ipNodePort = ref('80 / 8000-8080')
const ipAppProto = ref('任意协议')
const ipUserName = ref('')
const ipCondRelation = ref('与')
const ipUserGroup = ref('任意')
const ipFreq = ref('任意')
const ipTimeRange = ref('2026-07-10 15:04:30 - 2026-07-10 15:19:30')
const ipPage = ref(1)
const ipPageSize = ref(100)
const ipTotal = ref(103)

// IP统计表格mock数据（28行，匹配截图）
const ipData = [
  { _expanded: false, userIp: '101.6.6.173', nodeIp: '202.204.128.11', geo: '北京', geoFlag: '🇨', port: '29513', domain: '', protoType: '—', visitCount: 15, freq: '频繁', behavior: 'high', behaviorLabel: '频繁', up: '6.75 K', dn: '102.52 K', total: '109.31 K', appProto: 'Clash', scene: 'DNS会话 会话详细', link: '' },
  { _expanded: false, userIp: '139.226.154.84', nodeIp: '101.6.6.6', geo: '北京', geoFlag: '', port: '5353', domain: '', protoType: '—', visitCount: 4, freq: '一般', behavior: 'normal', behaviorLabel: '一般', up: '404', dn: '404', total: '808', appProto: 'FastVPN/Super…', scene: 'DNS会话 会话详细', link: '' },
  { _expanded: false, userIp: '101.6.14.166', nodeIp: '185.199.111.133', geo: '美国', geoFlag: '🇺', port: '443', domain: 'raw.githubusercontent.com', protoType: '—', visitCount: 3, freq: '一般', behavior: 'normal', behaviorLabel: '一般', up: '3.66 K', dn: '23.92 K', total: '27.78 K', appProto: 'Aladdin云', scene: 'DNS会话 会话详细', link: '' },
  { _expanded: false, userIp: '101.6.6.177', nodeIp: '185.199.108.133', geo: '美国', geoFlag: '🇺', port: '443', domain: 'raw.githubusercontent.com', protoType: '—', visitCount: 2, freq: '一般', behavior: 'normal', behaviorLabel: '一般', up: '1.9 K', dn: '10.19 K', total: '12.13 K', appProto: 'Aladdin云', scene: 'DNS会话 会话详细', link: '' },
  { _expanded: false, userIp: '61.243.37.82', nodeIp: '101.6.15.130', geo: '北京', geoFlag: '🇨', port: '443', domain: '', protoType: '—', visitCount: 1, freq: '一般', behavior: 'normal', behaviorLabel: '一般', up: '1.34 K', dn: '4.80 K', total: '6.15 K', appProto: '泡芙云', scene: 'DNS会话 会话详细', link: '' },
  { _expanded: false, userIp: '27.214.245.11', nodeIp: '101.6.15.130', geo: '北京', geoFlag: '', port: '443', domain: '', protoType: '—', visitCount: 1, freq: '一般', behavior: 'normal', behaviorLabel: '一般', up: '594', dn: '0', total: '934', appProto: '泡芙云', scene: 'DNS会话 会话详细', link: '' },
  { _expanded: false, userIp: '223.90.99.95', nodeIp: '101.6.15.130', geo: '北京', geoFlag: '🇨', port: '443', domain: '', protoType: '—', visitCount: 1, freq: '一般', behavior: 'normal', behaviorLabel: '一般', up: '1.45 K', dn: '0', total: '1.45 K', appProto: '泡芙云', scene: 'DNS会话 会话详细', link: '' },
  { _expanded: false, userIp: '112.102.36.149', nodeIp: '101.6.15.130', geo: '北京', geoFlag: '🇨', port: '443', domain: '', protoType: '—', visitCount: 1, freq: '一般', behavior: 'normal', behaviorLabel: '一般', up: '1.62 K', dn: '0', total: '1.62 K', appProto: '泡芙云', scene: 'DNS会话 会话详细', link: '' },
  { _expanded: false, userIp: '60.219.118.116', nodeIp: '101.6.15.130', geo: '北京', geoFlag: '', port: '443', domain: '', protoType: '—', visitCount: 1, freq: '一般', behavior: 'normal', behaviorLabel: '一般', up: '1.64 K', dn: '0', total: '1.64 K', appProto: '泡芙云', scene: 'DNS会话 会话详细', link: '' },
  { _expanded: false, userIp: '183.199.187.105', nodeIp: '101.6.15.130', geo: '北京', geoFlag: '🇨', port: '443', domain: '', protoType: '—', visitCount: 1, freq: '一般', behavior: 'normal', behaviorLabel: '一般', up: '1.27 K', dn: '4.87 K', total: '6.44 K', appProto: '泡芙云', scene: 'DNS会话 会话详细', link: '' },
  { _expanded: false, userIp: '111.16.15.120', nodeIp: '101.6.15.130', geo: '北京', geoFlag: '🇨', port: '443', domain: '', protoType: '—', visitCount: 1, freq: '一般', behavior: 'normal', behaviorLabel: '一般', up: '1.87 K', dn: '11.08 K', total: '12.95 K', appProto: '泡芙云', scene: 'DNS会话 会话详细', link: '' },
  { _expanded: false, userIp: '39.128.10.42', nodeIp: '101.6.15.70', geo: '北京', geoFlag: '🇨', port: '443', domain: '', protoType: '—', visitCount: 1, freq: '一般', behavior: 'normal', behaviorLabel: '一般', up: '1.40 K', dn: '18.59 K', total: '20.00 K', appProto: '泡芙云', scene: 'DNS会话 会话详细', link: '' },
  { _expanded: false, userIp: '60.221.62.201', nodeIp: '101.6.15.130', geo: '北京', geoFlag: '🇨', port: '443', domain: '', protoType: '—', visitCount: 1, freq: '一般', behavior: 'normal', behaviorLabel: '一般', up: '1.68 K', dn: '10.98 K', total: '12.64 K', appProto: '泡芙云', scene: 'DNS会话 会话详细', link: '' },
  { _expanded: false, userIp: '175.42.26.128', nodeIp: '101.6.15.130', geo: '北京', geoFlag: '🇨', port: '443', domain: '', protoType: '—', visitCount: 1, freq: '一般', behavior: 'normal', behaviorLabel: '一般', up: '1.68 K', dn: '10.90 K', total: '12.58 K', appProto: '泡芙云', scene: 'DNS会话 会话详细', link: '' },
  { _expanded: false, userIp: '171.38.122.120', nodeIp: '101.6.15.130', geo: '北京', geoFlag: '🇨', port: '443', domain: '', protoType: '—', visitCount: 1, freq: '一般', behavior: 'normal', behaviorLabel: '一般', up: '1.62 K', dn: '0', total: '1.62 K', appProto: '泡芙云', scene: 'DNS会话 会话详细', link: '' },
  { _expanded: false, userIp: '39.177.161.138', nodeIp: '101.6.15.130', geo: '北京', geoFlag: '🇨', port: '443', domain: '', protoType: '—', visitCount: 1, freq: '一般', behavior: 'normal', behaviorLabel: '一般', up: '1.60 K', dn: '0', total: '1.60 K', appProto: '泡芙云', scene: 'DNS会话 会话详细', link: '' },
  { _expanded: false, userIp: '111.35.188.15', nodeIp: '101.6.15.130', geo: '北京', geoFlag: '', port: '443', domain: '', protoType: '—', visitCount: 1, freq: '一般', behavior: 'normal', behaviorLabel: '一般', up: '1.57 K', dn: '0', total: '1.57 K', appProto: '泡芙云', scene: 'DNS会话 会话详细', link: '' },
  { _expanded: false, userIp: '219.155.234.87', nodeIp: '101.6.15.130', geo: '北京', geoFlag: '', port: '443', domain: '', protoType: '—', visitCount: 1, freq: '一般', behavior: 'normal', behaviorLabel: '一般', up: '1.36 K', dn: '0', total: '1.36 K', appProto: '泡芙云', scene: 'DNS会话 会话详细', link: '' },
  { _expanded: false, userIp: '123.122.43.226', nodeIp: '101.6.15.130', geo: '北京', geoFlag: '🇨', port: '443', domain: '', protoType: '—', visitCount: 1, freq: '一般', behavior: 'normal', behaviorLabel: '一般', up: '1.59 K', dn: '0', total: '1.59 K', appProto: '泡芙云', scene: 'DNS会话 会话详细', link: '' },
  { _expanded: false, userIp: '115.53.14.194', nodeIp: '101.6.15.130', geo: '北京', geoFlag: '🇨', port: '443', domain: '', protoType: '—', visitCount: 1, freq: '一般', behavior: 'normal', behaviorLabel: '一般', up: '1.62 K', dn: '0', total: '1.62 K', appProto: '泡芙云', scene: 'DNS会话 会话详细', link: '' },
  { _expanded: false, userIp: '119.54.14.215', nodeIp: '101.6.15.130', geo: '北京', geoFlag: '🇨', port: '443', domain: '', protoType: '—', visitCount: 1, freq: '一般', behavior: 'normal', behaviorLabel: '一般', up: '1.52 K', dn: '8.06 K', total: '9.58 K', appProto: '泡芙云', scene: 'DNS会话 会话详细', link: '' },
  { _expanded: false, userIp: '42.245.205.19', nodeIp: '101.6.15.130', geo: '北京', geoFlag: '🇨', port: '443', domain: '', protoType: '—', visitCount: 1, freq: '一般', behavior: 'normal', behaviorLabel: '一般', up: '1.53 K', dn: '0', total: '1.53 K', appProto: '泡芙云', scene: 'DNS会话 会话详细', link: '' },
  { _expanded: false, userIp: '115.63.120.107', nodeIp: '101.6.15.130', geo: '北京', geoFlag: '🇨', port: '443', domain: '', protoType: '—', visitCount: 1, freq: '一般', behavior: 'normal', behaviorLabel: '一般', up: '1.52 K', dn: '0', total: '1.52 K', appProto: '泡芙云', scene: 'DNS会话 会话详细', link: '' },
  { _expanded: false, userIp: '39.149.223.44', nodeIp: '101.6.15.130', geo: '北京', geoFlag: '🇨', port: '443', domain: '', protoType: '—', visitCount: 1, freq: '一般', behavior: 'normal', behaviorLabel: '一般', up: '1.44 K', dn: '0', total: '1.44 K', appProto: '泡芙云', scene: 'DNS会话 会话详细', link: '' },
  { _expanded: false, userIp: '123.12.12.189', nodeIp: '101.6.15.130', geo: '北京', geoFlag: '🇨', port: '443', domain: '', protoType: '—', visitCount: 1, freq: '一般', behavior: 'normal', behaviorLabel: '一般', up: '1.57 K', dn: '0', total: '1.57 K', appProto: '泡芙云', scene: 'DNS会话 会话详细', link: '' },
  { _expanded: false, userIp: '119.162.50.159', nodeIp: '101.6.15.70', geo: '北京', geoFlag: '🇨', port: '443', domain: '', protoType: '—', visitCount: 1, freq: '一般', behavior: 'normal', behaviorLabel: '一般', up: '1.05 K', dn: '10.93 K', total: '11.99 K', appProto: '泡芙云', scene: 'DNS会话 会话详细', link: '' },
  { _expanded: false, userIp: '116.132.235.205', nodeIp: '101.6.15.66', geo: '北京', geoFlag: '🇨', port: '443', domain: '', protoType: '—', visitCount: 1, freq: '一般', behavior: 'normal', behaviorLabel: '一般', up: '813', dn: '9.46 K', total: '10.25 K', appProto: '泡芙云', scene: 'DNS会话 会话详细', link: '' },
  { _expanded: false, userIp: '183.216.147.82', nodeIp: '101.6.15.130', geo: '北京', geoFlag: '🇨', port: '443', domain: '', protoType: '—', visitCount: 1, freq: '一般', behavior: 'normal', behaviorLabel: '一般', up: '1.50 K', dn: '0', total: '1.50 K', appProto: '泡芙云', scene: 'DNS会话 会话详细', link: '' },
]

// DNS会话弹窗
const ipDnsSessionVisible = ref(false)
const ipDnsIpType = ref('单个IP')
const ipDnsIpValue = ref('')
const ipDnsFilterSrc = ref('否')
const ipDnsSrcPort = ref('80 / 8000-8080')
const ipDnsDstIpType = ref('任意IP')
const ipDnsDstIpValue = ref('')
const ipDnsFilterDst = ref('否')
const ipDnsDstPort = ref('80 / 8000-8080')
const ipDnsMac = ref('')
const ipDnsDomain = ref('')
const ipDnsClientLatency = ref('')
const ipDnsServerLatency = ref('')
const ipDnsAppLatency = ref('')
const ipDnsProto = ref('任意')
const ipDnsConnType = ref('所有')
const ipDnsCondRelation = ref('与')
const ipDnsTimeRange = ref('2026-07-10 15:04:30 - 2026-07-10 15:19:30')

const ipDnsRows = [
  { t: '2026-07-10 15:14:32', mac: '30-80-9b-8d-90-01', vendor: 'NewH3CTechno_...', srcIp: '101.6.14.166:33689', dstIp: '8.8.8.8:53', proto: 'UDP', domain: '' },
  { t: '2026-07-10 15:14:39', mac: '30-80-9b-8d-90-01', vendor: 'NewH3CTechno_...', srcIp: '101.6.14.166:33690', dstIp: '8.8.8.8:53', proto: 'UDP', domain: '' },
  { t: '2026-07-10 15:14:43', mac: '30-80-9b-8d-90-01', vendor: 'NewH3CTechno_...', srcIp: '101.6.14.166:33691', dstIp: '8.8.8.8:53', proto: 'UDP', domain: 'polaris-default.woa.com' },
  { t: '2026-07-10 15:14:43', mac: '30-80-9b-8d-90-01', vendor: 'NewH3CTechno_...', srcIp: '101.6.14.166:33690', dstIp: '8.8.8.8:53', proto: 'UDP', domain: 'cmq-queue-gz-internal.api....' },
  { t: '2026-07-10 15:14:48', mac: '30-80-9b-8d-90-01', vendor: 'NewH3CTechno_...', srcIp: '101.6.14.166:33691', dstIp: '8.8.8.8:53', proto: 'UDP', domain: '' },
  { t: '2026-07-10 15:14:50', mac: '30-80-9b-8d-90-01', vendor: 'NewH3CTechno_...', srcIp: '101.6.14.166:33692', dstIp: '8.8.8.8:53', proto: 'UDP', domain: 'api.rainbow.woa.com' },
  { t: '2026-07-10 15:14:52', mac: '30-80-9b-8d-90-01', vendor: 'NewH3CTechno_...', srcIp: '101.6.14.166:33691', dstIp: '8.8.8.8:53', proto: 'UDP', domain: 'cmq-queue-gz-internal.api....' },
  { t: '2026-07-10 15:14:55', mac: '30-80-9b-8d-90-01', vendor: 'NewH3CTechno_...', srcIp: '101.6.14.166:33692', dstIp: '8.8.8.8:53', proto: 'UDP', domain: '' },
  { t: '2026-07-10 15:15:02', mac: '30-80-9b-8d-90-01', vendor: 'NewH3CTechno_...', srcIp: '101.6.14.166:33691', dstIp: '8.8.8.8:53', proto: 'UDP', domain: '' },
  { t: '2026-07-10 15:15:02', mac: '30-80-9b-8d-90-01', vendor: 'NewH3CTechno_...', srcIp: '101.6.14.166:33692', dstIp: '8.8.8.8:53', proto: 'UDP', domain: '' },
  { t: '2026-07-10 15:15:13', mac: '30-80-9b-8d-90-01', vendor: 'NewH3CTechno_...', srcIp: '101.6.14.166:33692', dstIp: '8.8.8.8:53', proto: 'UDP', domain: '' },
  { t: '2026-07-10 15:15:13', mac: '30-80-9b-8d-90-01', vendor: 'NewH3CTechno_...', srcIp: '101.6.14.166:33691', dstIp: '8.8.8.8:53', proto: 'UDP', domain: 'cmq-queue-gz-internal.api....' },
  { t: '2026-07-10 15:15:17', mac: '30-80-9b-8d-90-01', vendor: 'NewH3CTechno_...', srcIp: '101.6.14.166:33692', dstIp: '8.8.8.8:53', proto: 'UDP', domain: '' },
  { t: '2026-07-10 15:15:23', mac: '30-80-9b-8d-90-01', vendor: 'NewH3CTechno_...', srcIp: '101.6.14.166:33692', dstIp: '8.8.8.8:53', proto: 'UDP', domain: 'tcs-authz-api.auth.svc.global' },
  { t: '2026-07-10 15:15:23', mac: '30-80-9b-8d-90-01', vendor: 'NewH3CTechno_...', srcIp: '101.6.14.166:33693', dstIp: '8.8.8.8:53', proto: 'UDP', domain: 'tcs-authz-api.auth.svc.global' },
  { t: '2026-07-10 15:15:32', mac: '30-80-9b-8d-90-01', vendor: 'NewH3CTechno_...', srcIp: '101.6.14.166:33694', dstIp: '8.8.8.8:53', proto: 'UDP', domain: '' },
]

// 历史会话弹窗
const ipHistorySessionVisible = ref(false)
const ipHsMac = ref('')
const ipHsIpType = ref('单个IP')
const ipHsIpValue = ref('')
const ipHsUserPort = ref('80 / 8000-80')
const ipHsNodeIpType = ref('任意IP')
const ipHsNodeIpValue = ref('')
const ipHsNodePort = ref('80 / 8000-80')
const ipHsProto = ref('任意')
const ipHsDomain = ref('')
const ipHsAppProto = ref('')
const ipHsTimeRange = ref('2026-07-10 15:04:30 - 2026-07-10 15:19:30')

const ipHsRows = [
  { t: '2026-07-10 15:12:27', mac: '30-80-9b-8d-90-01', vendor: 'NewH3CTec...', userIp: '101.6.14.166:22150', nodeIp: '185.199.108.133:443', proto: 'TCP', protoName: 'Aladdin云', up: '5.68 K', dn: '6.57 K', total: '6.57 K' },
  { t: '2026-07-10 15:12:34', mac: '30-80-9b-8d-90-01', vendor: 'NewH3CTec...', userIp: '101.6.14.166:22558', nodeIp: '185.199.111.133:443', proto: 'TCP', protoName: 'Aladdin云', up: '5.71 K', dn: '6.61 K', total: '6.61 K' },
  { t: '2026-07-10 15:06:10', mac: '30-80-9b-8d-90-01', vendor: 'NewH3CTec...', userIp: '101.6.14.166:22113', nodeIp: '185.199.110.133:443', proto: 'TCP', protoName: 'Aladdin云', up: '2.07 K', dn: '12.53 K', total: '14.60 K' },
]

function openIpDnsSession(row: any) {
  ipDnsIpValue.value = row.userIp
  ipDnsSessionVisible.value = true
}

function openIpHistorySession(row: any) {
  ipHsIpValue.value = row.userIp
  ipHistorySessionVisible.value = true
}

function openPacketAnalysisFromIp(row: any) {
  cbPacketTab.value = 'parse'
  cbPacketVisible.value = true
}

function searchIpData() { /* mock: no-op */ }
function resetIpFilters() {
  ipUserIpType.value = '任意IP'; ipUserIpValue.value = ''; ipNodeIpType.value = '任意IP'; ipNodeIpValue.value = ''
  ipNodePort.value = '80 / 8000-8080'; ipAppProto.value = '任意协议'; ipUserName.value = ''
  ipCondRelation.value = '与'; ipUserGroup.value = '任意'; ipFreq.value = '任意'
  ipTimeRange.value = '2026-07-10 15:04:30 - 2026-07-10 15:19:30'
  ipPage.value = 1
}

function searchIpDnsData() { /* mock: no-op */ }
function resetIpDnsFilters() {
  ipDnsIpType.value = '单个IP'; ipDnsIpValue.value = ''; ipDnsFilterSrc.value = '否'; ipDnsSrcPort.value = '80 / 8000-8080'
  ipDnsDstIpType.value = '任意IP'; ipDnsDstIpValue.value = ''; ipDnsFilterDst.value = '否'; ipDnsDstPort.value = '80 / 8000-8080'
  ipDnsMac.value = ''; ipDnsDomain.value = ''; ipDnsClientLatency.value = ''; ipDnsServerLatency.value = ''; ipDnsAppLatency.value = ''
  ipDnsProto.value = '任意'; ipDnsConnType.value = '所有'; ipDnsCondRelation.value = '与'
  ipDnsTimeRange.value = '2026-07-10 15:04:30 - 2026-07-10 15:19:30'
}

function searchIpHsData() { /* mock: no-op */ }
function resetIpHsFilters() {
  ipHsMac.value = ''; ipHsIpType.value = '单个IP'; ipHsIpValue.value = ''; ipHsUserPort.value = '80 / 8000-80'
  ipHsNodeIpType.value = '任意IP'; ipHsNodeIpValue.value = ''; ipHsNodePort.value = '80 / 8000-80'
  ipHsProto.value = '任意'; ipHsDomain.value = ''; ipHsAppProto.value = ''
  ipHsTimeRange.value = '2026-07-10 15:04:30 - 2026-07-10 15:19:30'
}

// ===== VPS节点 tab =====
const vpsNodeIpType = ref('任意IP')
const vpsNodeIpValue = ref('')
const vpsNodePort = ref('80 / 8000-8080')
const vpsProtoType = ref('任意')
const vpsUserName = ref('任意')
const vpsSensitive = ref('任意')
const vpsRegion = ref('任意')
const vpsDomain = ref('')
const vpsLink = ref('任意')
const vpsTimeRange = ref('2026-07-10 15:39:21 - 2026-07-10 15:54:21')
const vpsPage = ref(1)
const vpsPageSize = ref(100)
const vpsTotal = ref(8)

// VPS节点表格mock数据（8行，匹配截图）
const vpsData = [
  { nodeIp: '101.6.15.130', geo: '北京', geoFlag: '🇨🇳 ', port: '443', domain: '', protoType: '—', visitCount: 28, freqType: 'high', freqLabel: '频繁', up: '43.51 K', dn: '60.86 K', total: '104.37 K' },
  { nodeIp: '101.6.15.70', geo: '北京', geoFlag: '🇨🇳 ', port: '443', domain: '', protoType: '—', visitCount: 11, freqType: 'medium', freqLabel: '一般', up: '14.45 K', dn: '279.66 K', total: '294.11 K' },
  { nodeIp: '101.6.15.67', geo: '北京', geoFlag: '🇨🇳 ', port: '443', domain: '', protoType: '—', visitCount: 2, freqType: 'medium', freqLabel: '一般', up: '3.04 K', dn: '1023.01 K', total: '1.00 M' },
  { nodeIp: '101.6.15.66', geo: '北京', geoFlag: '🇨🇳 ', port: '443', domain: '', protoType: '—', visitCount: 2, freqType: 'medium', freqLabel: '一般', up: '2.00 K', dn: '844.30 K', total: '846.31 K' },
  { nodeIp: '101.6.4.110', geo: '北京', geoFlag: '🇨 ', port: '443', domain: '', protoType: '—', visitCount: 1, freqType: 'low', freqLabel: '低频', up: '1.12 K', dn: '7.35 K', total: '8.47 K' },
  { nodeIp: '185.199.109.133', geo: '美国', geoFlag: '🇺🇸 ', port: '443', domain: 'raw.githubusercontent.com', protoType: '—', visitCount: 1, freqType: 'low', freqLabel: '低频', up: '918', dn: '6.75 K', total: '6.65 K' },
  { nodeIp: '185.199.108.133', geo: '美国', geoFlag: '🇺🇸 ', port: '443', domain: 'raw.githubusercontent.com', protoType: '—', visitCount: 1, freqType: 'low', freqLabel: '低频', up: '904', dn: '5.92 K', total: '6.88 K' },
  { nodeIp: '185.199.111.133', geo: '美国', geoFlag: '🇺🇸 ', port: '443', domain: 'raw.githubusercontent.com', protoType: '—', visitCount: 1, freqType: 'low', freqLabel: '低频', up: '918', dn: '5.75 K', total: '6.64 K' },
]

// VPS节点 - 历史会话弹窗
const vpsSessionVisible = ref(false)
const vpsHsMac = ref('')
const vpsHsUserIpType = ref('任意IP')
const vpsHsUserIpValue = ref('')
const vpsHsUserPort = ref('80 / 8000-80')
const vpsHsSingleIpType = ref('单个IP')
const vpsHsSingleIpValue = ref('')
const vpsHsNodePort = ref('443')
const vpsHsProto = ref('任意')
const vpsHsDomain = ref('')
const vpsHsAppProto = ref('')
const vpsHsTimeRange = ref('2026-07-10 15:39:21 - 2026-07-10 15:54:21')

const vpsHsRows = [
  { t: '2026-07-10 15:44:38', mac: '54-2b-de-6d-10-ae', vendor: 'NewH3CTec...', userIp: '92.38.13.106:36766', nodeIp: '101.6.15.66:443', geo: '北京', geoFlag: '🇨🇳 ', proto: 'TCP', protoName: '泡芙云', up: '1.19 K', dn: '516.69 K', total: '517.88 K' },
  { t: '2026-07-10 15:47:37', mac: '54-2b-de-6d-10-ae', vendor: 'NewH3CTec...', userIp: '124.239.12.46:41193', nodeIp: '101.6.15.66:443', geo: '北京', geoFlag: '🇳 ', proto: 'TCP', protoName: '泡芙云', up: '829', dn: '27.61 K', total: '28.42 K' },
]

function openVpsSession(row: any) {
  vpsHsSingleIpValue.value = row.nodeIp
  vpsHsNodePort.value = row.port
  vpsSessionVisible.value = true
}

function openPacketAnalysisFromVps(row: any) {
  cbPacketTab.value = 'parse'
  cbPacketVisible.value = true
}

function searchVpsData() { /* mock: no-op */ }
function resetVpsFilters() {
  vpsNodeIpType.value = '任意IP'; vpsNodeIpValue.value = ''; vpsNodePort.value = '80 / 8000-8080'
  vpsProtoType.value = '任意'; vpsUserName.value = '任意'; vpsSensitive.value = '任意'
  vpsRegion.value = '任意'; vpsDomain.value = ''; vpsLink.value = '任意'
  vpsTimeRange.value = '2026-07-10 15:39:21 - 2026-07-10 15:54:21'
  vpsPage.value = 1
}

function searchVpsHsData() { /* mock: no-op */ }
function resetVpsHsFilters() {
  vpsHsMac.value = ''; vpsHsUserIpType.value = '任意IP'; vpsHsUserIpValue.value = ''; vpsHsUserPort.value = '80 / 8000-80'
  vpsHsSingleIpType.value = '单个IP'; vpsHsSingleIpValue.value = ''; vpsHsNodePort.value = '443'
  vpsHsProto.value = '任意'; vpsHsDomain.value = ''; vpsHsAppProto.value = ''
  vpsHsTimeRange.value = '2026-07-10 15:39:21 - 2026-07-10 15:54:21'
}

// ==================== 被动域名 - 历史概况 ====================
const pdOvMac = ref('')
const pdOvSrcIpType = ref('任意IP')
const pdOvSrcIp = ref('')
const pdOvSrcPort = ref('')
const pdOvDstIpType = ref('任意IP')
const pdOvDstIp = ref('')
const pdOvDstPort = ref('')
const pdOvResolve = ref('')
const pdOvSrcIsp = ref('任意')
const pdOvDstIsp = ref('任意')
const pdOvSrcRegion = ref('任意')
const pdOvDstRegion = ref('任意')
const pdOvSuspect = ref('任意')
const pdOvDomain = ref('')
const pdOvProtoType = ref('任意')
const pdOvDomainType = ref('任意')
const pdOvTimeRange = ref('2026-07-13 09:22:33 - 2026-07-13 09:37:33')

// 历史概况 - 源IP mock数据
const pdOvSrcIpData = ref([
  { ip: '192.168.1.100', count: 156 },
  { ip: '10.0.0.50', count: 89 },
  { ip: '172.16.0.1', count: 234 },
  { ip: '192.168.2.200', count: 45 },
  { ip: '10.0.0.100', count: 312 },
])

// 历史概况 - 目标IP mock数据
const pdOvDstIpData = ref([
  { ip: '203.0.113.10', count: 420 },
  { ip: '198.51.100.25', count: 189 },
  { ip: '192.0.2.50', count: 267 },
  { ip: '203.0.113.100', count: 98 },
])

// 历史概况 - 请求域名 mock数据
const pdOvDomainData = ref([
  { domain: 'example.com', count: 523 },
  { domain: 'test.example.org', count: 189 },
  { domain: 'api.example.com', count: 312 },
  { domain: 'cdn.example.net', count: 156 },
])

// 历史概况 - 解析结果 mock数据
const pdOvResolveData = ref([
  { result: '203.0.113.10', count: 420 },
  { result: '198.51.100.25', count: 189 },
  { result: '192.0.2.50', count: 267 },
])

// 分页
const pdOvPageSize = 10
const pdOvSrcIpPage = ref(1)
const pdOvDstIpPage = ref(1)
const pdOvDomainPage = ref(1)
const pdOvResolvePage = ref(1)

const pdOvSrcIpTotalPages = computed(() => Math.max(1, Math.ceil(pdOvSrcIpData.value.length / pdOvPageSize)))
const pdOvDstIpTotalPages = computed(() => Math.max(1, Math.ceil(pdOvDstIpData.value.length / pdOvPageSize)))
const pdOvDomainTotalPages = computed(() => Math.max(1, Math.ceil(pdOvDomainData.value.length / pdOvPageSize)))
const pdOvResolveTotalPages = computed(() => Math.max(1, Math.ceil(pdOvResolveData.value.length / pdOvPageSize)))

const pdOvSrcIpPageData = computed(() => pdOvSrcIpData.value.slice((pdOvSrcIpPage.value - 1) * pdOvPageSize, pdOvSrcIpPage.value * pdOvPageSize))
const pdOvDstIpPageData = computed(() => pdOvDstIpData.value.slice((pdOvDstIpPage.value - 1) * pdOvPageSize, pdOvDstIpPage.value * pdOvPageSize))
const pdOvDomainPageData = computed(() => pdOvDomainData.value.slice((pdOvDomainPage.value - 1) * pdOvPageSize, pdOvDomainPage.value * pdOvPageSize))
const pdOvResolvePageData = computed(() => pdOvResolveData.value.slice((pdOvResolvePage.value - 1) * pdOvPageSize, pdOvResolvePage.value * pdOvPageSize))

function pdOvSearch() { /* mock */ }
function pdOvReset() {
  pdOvMac.value = ''; pdOvSrcIpType.value = '任意IP'; pdOvSrcIp.value = ''; pdOvSrcPort.value = ''
  pdOvDstIpType.value = '任意IP'; pdOvDstIp.value = ''; pdOvDstPort.value = ''; pdOvResolve.value = ''
  pdOvSrcIsp.value = '任意'; pdOvDstIsp.value = '任意'; pdOvSrcRegion.value = '任意'; pdOvDstRegion.value = '任意'
  pdOvSuspect.value = '任意'; pdOvDomain.value = ''; pdOvProtoType.value = '任意'; pdOvDomainType.value = '任意'
  pdOvTimeRange.value = '2026-07-13 09:22:33 - 2026-07-13 09:37:33'
}
function pdOvExport() { /* mock */ }

// ==================== 被动域名 - 历史会话 ====================
const pdSsMac = ref('')
const pdSsSrcIpType = ref('任意IP')
const pdSsSrcIp = ref('')
const pdSsDstIpType = ref('任意IP')
const pdSsDstIp = ref('')
const pdSsDstPort = ref('')
const pdSsSrcIsp = ref('任意')
const pdSsDstIsp = ref('任意')
const pdSsSrcRegion = ref('任意')
const pdSsDstRegion = ref('任意')
const pdSsSuspect = ref('任意')
const pdSsUser = ref('')
const pdSsLink = ref('任意')
const pdSsTimeRange = ref('2026-07-13 09:25:53 - 2026-07-13 09:40:58')
const pdSsConfirm = ref('任意')
const pdSsDomain = ref('')
const pdSsSrcIsp2 = ref('任意')

// 历史会话 mock数据
interface PdSsItem {
  id: number
  time: string
  mac: string
  vendor: string
  userName: string
  srcIp: string
  dstIp: string
  geo: string
  domain: string
  link: string
  resolveResult: string
  responseCode: string
}

const pdSsData = ref<PdSsItem[]>([
  { id: 1, time: '2026-07-13 09:25:53', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', userName: 'user1', srcIp: '192.168.1.100', dstIp: '203.0.113.10', geo: '美国', domain: 'example.com', link: '链路1', resolveResult: '203.0.113.10', responseCode: 'NOERROR' },
  { id: 2, time: '2026-07-13 09:26:15', mac: '30-80-9b-8d-90-01', vendor: 'NewH3CTec...', userName: 'user2', srcIp: '10.0.0.50', dstIp: '198.51.100.25', geo: '日本', domain: 'test.example.org', link: '链路2', resolveResult: '198.51.100.25', responseCode: 'NOERROR' },
  { id: 3, time: '2026-07-13 09:27:42', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', userName: 'user1', srcIp: '172.16.0.1', dstIp: '192.0.2.50', geo: '德国', domain: 'api.example.com', link: '链路1', resolveResult: '192.0.2.50', responseCode: 'NXDOMAIN' },
  { id: 4, time: '2026-07-13 09:28:33', mac: '30-80-9b-8d-90-01', vendor: 'NewH3CTec...', userName: 'user3', srcIp: '192.168.2.200', dstIp: '203.0.113.100', geo: '英国', domain: 'cdn.example.net', link: '链路2', resolveResult: '203.0.113.100', responseCode: 'NOERROR' },
  { id: 5, time: '2026-07-13 09:30:18', mac: '54-2b-d6-6d-10-ae', vendor: 'NewH3CTec...', userName: 'user2', srcIp: '10.0.0.100', dstIp: '203.0.113.10', geo: '美国', domain: 'example.com', link: '链路1', resolveResult: '203.0.113.10', responseCode: 'NOERROR' },
])

const pdSsPage = ref(1)
const pdSsPageSize = ref(100)
const pdSsGotoPage = ref(1)
const pdSsTotalPages = computed(() => Math.max(1, Math.ceil(pdSsData.value.length / pdSsPageSize.value)))
const pdSsPageData = computed(() => pdSsData.value.slice((pdSsPage.value - 1) * pdSsPageSize.value, pdSsPage.value * pdSsPageSize.value))

function pdSsSearch() { pdSsPage.value = 1 }
function pdSsReset() {
  pdSsMac.value = ''; pdSsSrcIpType.value = '任意IP'; pdSsSrcIp.value = ''; pdSsDstIpType.value = '任意IP'
  pdSsDstIp.value = ''; pdSsDstPort.value = ''; pdSsSrcIsp.value = '任意'; pdSsDstIsp.value = '任意'
  pdSsSrcRegion.value = '任意'; pdSsDstRegion.value = '任意'; pdSsSuspect.value = '任意'
  pdSsUser.value = ''; pdSsLink.value = '任意'; pdSsTimeRange.value = '2026-07-13 09:25:53 - 2026-07-13 09:40:58'
  pdSsConfirm.value = '任意'; pdSsDomain.value = ''; pdSsSrcIsp2.value = '任意'; pdSsPage.value = 1
}
function pdSsGoToPage() {
  const p = Math.min(Math.max(1, pdSsGotoPage.value), pdSsTotalPages.value)
  pdSsPage.value = p
}
function pdSsExport() { /* mock */ }
function openPdSsDetail(_row: PdSsItem) { /* mock */ }
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
.cbm-cb-device-list { list-style:none; margin:0; padding:0; }
.cbm-cb-device-item { display:flex; align-items:center; gap:6px; padding:10px 12px; cursor:pointer; border-bottom:1px solid #f5f7fa; font-size:12px; }
.cbm-cb-device-item:hover { background:#ecf5ff; }
.cbm-cb-device-item.active { background:#ecf5ff; border-left:3px solid #409eff; }
.cbm-cb-device-icon { width:8px; height:8px; border-radius:50%; background:#67c23a; flex-shrink:0; }
.cbm-cb-device-name { font-weight:500; color:#303133; flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.cbm-cb-device-ip { color:#909399; font-size:11px; }
.cbm-cb-detail-head { display:flex; align-items:center; justify-content:space-between; padding:16px 20px; border-bottom:1px solid #ebeef5; }
.cbm-cb-detail-title { font-size:15px; font-weight:600; color:#303133; margin:0; }
.cbm-cb-detail-actions { display:flex; gap:8px; }
.cbm-cb-action-btn { padding:5px 14px; border:1px solid #dcdfe6; border-radius:4px; background:#fff; color:#606266; font-size:12px; cursor:pointer; }
.cbm-cb-action-btn:hover { color:#409eff; border-color:#409eff; }
.cbm-cb-action-danger:hover { color:#f56c6c; border-color:#f56c6c; }
.cbm-cb-detail-body { padding:20px; }
.cbm-cb-detail-table { width:100%; border-collapse:collapse; }
.cbm-cb-detail-table th, .cbm-cb-detail-table td { padding:10px 16px; border-bottom:1px solid #ebeef5; font-size:13px; text-align:left; }
.cbm-cb-detail-table th { width:120px; color:#909399; font-weight:500; background:#fafbfc; }
.cbm-cb-detail-table td { color:#303133; }
.cbm-cb-status { font-size:12px; }
.cbm-cb-status.online { color:#67c23a; }
.cbm-cb-form { padding:10px 20px; }
.cbm-cb-form-row { display:flex; align-items:center; margin-bottom:18px; }
.cbm-cb-form-label { width:90px; text-align:right; color:#606266; font-size:13px; margin-right:16px; flex-shrink:0; }
.cbm-cb-form-input, .cbm-cb-form-select { flex:1; padding:7px 12px; border:1px solid #dcdfe6; border-radius:4px; font-size:13px; color:#606266; outline:none; }
.cbm-cb-form-input:focus, .cbm-cb-form-select:focus { border-color:#409eff; }
.cbm-cb-dialog-footer { display:flex; justify-content:flex-end; gap:12px; padding:12px 20px; border-top:1px solid #ebeef5; }
.cbm-cb-btn-primary { padding:8px 24px; background:#409eff; color:#fff; border:none; border-radius:4px; font-size:13px; cursor:pointer; }
.cbm-cb-btn-primary:hover { background:#66b1ff; }
.cbm-cb-btn-default { padding:8px 24px; background:#fff; color:#606266; border:1px solid #dcdfe6; border-radius:4px; font-size:13px; cursor:pointer; }
.cbm-cb-btn-default:hover { color:#409eff; border-color:#409eff; }
.cbm-pc-page { flex:1; min-height:0; display:flex; flex-direction:column; }
.cbm-pc-subtabs-header { padding:0 16px; background:#fafbfc; border-bottom:1px solid #ebeef5; }
.cbm-pc-subtabs { display:flex; gap:0; }
.cbm-pc-subtab { padding:10px 16px; border:none; background:transparent; font-size:13px; font-weight:500; color:#606266; cursor:pointer; position:relative; }
.cbm-pc-subtab.active { color:#409eff; }
.cbm-pc-subtab.active::after { content:''; position:absolute; bottom:0; left:16px; right:16px; height:2px; background:#409eff; }

/* 参数配置 - 通用 */
.cbm-pc-body { padding:16px; overflow:auto; flex:1; }
.cbm-pc-notice { background:#f4f6f9; border-left:3px solid #409eff; padding:12px 16px; margin-bottom:16px; border-radius:0 4px 4px 0; }
.cbm-pc-notice p { margin:4px 0; font-size:12px; color:#606266; line-height:1.6; }

/* 分析模型表格 */
.cbm-pc-model-table { min-width:1200px; }
.cbm-pc-model-table th, .cbm-pc-model-table td { font-size:12px; padding:8px 10px; white-space:nowrap; }
.cbm-pc-suspect { display:inline-block; padding:1px 8px; border-radius:3px; font-size:11px; font-weight:600; }
.cbm-pc-suspect-low { background:#f0f9eb; color:#67c23a; border:1px solid #e1f3d8; }
.cbm-pc-suspect-mid { background:#fdf6ec; color:#e6a23c; border:1px solid #faecd8; }
.cbm-pc-suspect-high { background:#fef0f0; color:#f56c6c; border:1px solid #fde2e2; }
.cbm-pc-trend-cell { width:120px; }
.cbm-pc-trend-bar { height:20px; background:linear-gradient(90deg, #a0cfff 0%, #409eff 100%); border-radius:2px; min-width:2px; }
.cbm-pc-action-link { color:#409eff; cursor:pointer; font-size:12px; }
.cbm-pc-action-link:hover { text-decoration:underline; }
.cbm-pc-custom-link { color:#e6a23c; cursor:pointer; font-size:11px; margin-left:4px; }
.cbm-pc-custom-link:hover { text-decoration:underline; }

/* Toggle开关 */
.cbm-pc-toggle { position:relative; display:inline-block; width:36px; height:18px; cursor:pointer; }
.cbm-pc-toggle input { opacity:0; width:0; height:0; position:absolute; }
.cbm-pc-toggle-slider { position:absolute; top:0; left:0; right:0; bottom:0; background:#dcdfe6; border-radius:9px; transition:0.3s; }
.cbm-pc-toggle-slider::before { content:''; position:absolute; width:14px; height:14px; left:2px; bottom:2px; background:#fff; border-radius:50%; transition:0.3s; }
.cbm-pc-toggle input:checked + .cbm-pc-toggle-slider { background:#409eff; }
.cbm-pc-toggle input:checked + .cbm-pc-toggle-slider::before { transform:translateX(18px); }
.cbm-pc-toggle-lg { width:44px; height:22px; }
.cbm-pc-toggle-lg .cbm-pc-toggle-slider::before { width:18px; height:18px; }
.cbm-pc-toggle-lg input:checked + .cbm-pc-toggle-slider::before { transform:translateX(22px); }

/* DNS会话过滤 */
.cbm-pc-dns-row { display:flex; align-items:center; gap:12px; padding:16px 0; }
.cbm-pc-dns-label { font-size:13px; color:#303133; font-weight:500; }
.cbm-pc-dns-desc { font-size:12px; color:#909399; }

/* 阈值设置 */
.cbm-pc-threshold-row { display:flex; align-items:center; gap:12px; padding:20px 0; flex-wrap:wrap; }
.cbm-pc-threshold-label { font-size:13px; color:#303133; font-weight:500; min-width:90px; }
.cbm-pc-threshold-item { display:flex; align-items:center; gap:4px; }
.cbm-pc-threshold-input { width:60px; padding:5px 8px; border:1px solid #dcdfe6; border-radius:4px; font-size:13px; text-align:center; outline:none; }
.cbm-pc-threshold-input:focus { border-color:#409eff; }
.cbm-pc-threshold-unit { font-size:12px; color:#909399; margin-left:4px; }
.cbm-pc-badge { display:inline-block; padding:3px 10px; border-radius:3px; font-size:12px; font-weight:500; color:#fff; }
.cbm-pc-badge-low { background:#67c23a; }
.cbm-pc-badge-mid { background:#e6a23c; }
.cbm-pc-badge-high { background:#f56c6c; }

/* 按钮行 */
.cbm-pc-btn-row { display:flex; gap:12px; margin-top:16px; }
.cbm-pc-btn-primary { padding:7px 24px; background:#409eff; color:#fff; border:none; border-radius:4px; font-size:13px; cursor:pointer; }
.cbm-pc-btn-primary:hover { background:#66b1ff; }
.cbm-pc-btn-default { padding:7px 24px; background:#fff; color:#606266; border:1px solid #dcdfe6; border-radius:4px; font-size:13px; cursor:pointer; }
.cbm-pc-btn-default:hover { color:#409eff; border-color:#409eff; }

/* 内网学校 */
.cbm-pc-school-row { display:flex; align-items:center; gap:12px; padding:16px 0; }
.cbm-pc-school-label { font-size:13px; color:#303133; font-weight:500; min-width:60px; }
.cbm-pc-school-select { padding:6px 12px; border:1px solid #dcdfe6; border-radius:4px; font-size:13px; color:#606266; outline:none; min-width:160px; }
.cbm-pc-school-select:focus { border-color:#409eff; }
.cbm-pc-school-edit { color:#409eff; cursor:pointer; font-size:12px; }
.cbm-pc-school-edit:hover { text-decoration:underline; }
.cbm-pc-school-hint { font-size:12px; color:#909399; margin:8px 0 0; }

/* 弹窗表单 */
.cbm-pc-form { padding:10px 20px; }
.cbm-pc-form-row { display:flex; align-items:center; margin-bottom:18px; }
.cbm-pc-form-label { width:80px; text-align:right; color:#606266; font-size:13px; margin-right:16px; flex-shrink:0; }
.cbm-pc-form-input { flex:1; padding:7px 12px; border:1px solid #dcdfe6; border-radius:4px; font-size:13px; color:#606266; outline:none; max-width:200px; }
.cbm-pc-form-input:focus { border-color:#409eff; }
.cbm-pc-form-unit { font-size:12px; color:#909399; margin-left:8px; }
.cbm-pc-dialog-footer { display:flex; justify-content:flex-end; gap:12px; padding:12px 20px; border-top:1px solid #ebeef5; }

@media (max-width:1200px) { .cbm-bottom-grid { grid-template-columns:1fr; } .cbm-mid-grid { grid-template-columns:1fr; } }

/* 白名单 */
.wl-object-tag { display:inline-flex; align-items:center; gap:4px; font-size:13px; color:#303133; }
.wl-action-link { color:#409eff; cursor:pointer; font-size:12px; }
.wl-action-link:hover { text-decoration:underline; }
.wl-add-form { padding:20px 24px; }
.wl-add-row { display:flex; align-items:center; margin-bottom:20px; }
.wl-add-label { width:100px; text-align:right; color:#606266; font-size:13px; margin-right:16px; flex-shrink:0; }
.wl-add-input { flex:1; max-width:320px; padding:8px 12px; border:1px solid #dcdfe6; border-radius:4px; font-size:13px; color:#606266; outline:none; }
.wl-add-input:focus { border-color:#409eff; }
.wl-add-check-row { display:flex; justify-content:center; margin-top:8px; }
.wl-add-checkbox { display:flex; align-items:center; gap:6px; cursor:pointer; }
.wl-add-checkbox input[type="checkbox"] { width:16px; height:16px; accent-color:#409eff; }
.wl-check-text { font-size:13px; color:#606266; }
.wl-dialog-footer { display:flex; justify-content:flex-end; gap:12px; padding:16px 24px; border-top:1px solid #ebeef5; }
.wl-btn-primary { padding:8px 24px; background:#409eff; color:#fff; border:none; border-radius:4px; font-size:13px; cursor:pointer; }
.wl-btn-primary:hover { background:#66b1ff; }
.wl-btn-default { padding:8px 24px; background:#fff; color:#606266; border:1px solid #dcdfe6; border-radius:4px; font-size:13px; cursor:pointer; }
.wl-btn-default:hover { color:#409eff; border-color:#409eff; }
.wl-clear-body { display:flex; align-items:center; gap:12px; padding:24px; font-size:14px; color:#303133; }
.wl-clear-icon { font-size:28px; }
.wl-clear-text { font-size:14px; }

/* 告警通知 */
.an-settings-form { padding:20px 24px; }
.an-settings-row { display:flex; align-items:center; gap:12px; margin-bottom:16px; }
.an-settings-label { width:80px; text-align:right; color:#606266; font-size:13px; flex-shrink:0; }
.an-settings-input { padding:6px 12px; border:1px solid #dcdfe6; border-radius:4px; font-size:13px; color:#606266; outline:none; }
.an-settings-input:focus { border-color:#409eff; }
.an-settings-unit { font-size:13px; color:#909399; }
.an-settings-desc { font-size:12px; color:#909399; margin-left:8px; }
.an-status-icon { font-size:18px; }
.an-settings-actions { margin-top:20px; padding-left:92px; }
.an-btn-primary { padding:7px 20px; background:#409eff; color:#fff; border:none; border-radius:4px; font-size:13px; cursor:pointer; }
.an-btn-primary:hover { background:#66b1ff; }
.an-notify-link { color:#409eff; cursor:pointer; font-size:13px; margin-left:16px; }
.an-notify-link:hover { text-decoration:underline; }
.an-log-action { color:#409eff; cursor:pointer; font-size:12px; }
.an-log-action:hover { text-decoration:underline; }

/* 通知方式弹窗 */
.an-notify-page { padding:0; }
.an-notify-tabs { display:flex; border-bottom:1px solid #ebeef5; padding:0 16px; background:#fafbfc; }
.an-notify-tab { padding:12px 20px; border:none; background:transparent; font-size:13px; color:#606266; cursor:pointer; position:relative; }
.an-notify-tab.active { color:#409eff; font-weight:600; }
.an-notify-tab.active::after { content:''; position:absolute; bottom:0; left:0; right:0; height:2px; background:#409eff; }
.an-notify-body { padding:20px; }
.an-notify-section { margin-bottom:24px; }
.an-notify-section-title { font-size:14px; font-weight:600; color:#303133; margin:0 0 16px 0; padding-bottom:8px; border-bottom:1px solid #ebeef5; }
.an-notify-params { padding:16px; background:#fafbfc; border-radius:4px; }
.an-notify-steps { margin:0 0 16px 0; padding-left:24px; }
.an-notify-steps li { margin-bottom:8px; font-size:13px; color:#606266; line-height:1.6; }
.an-notify-link-text { color:#409eff; cursor:pointer; }
.an-notify-link-text:hover { text-decoration:underline; }
.an-notify-notice { font-size:12px; color:#909399; margin:12px 0; }
.an-notify-toggle-row { display:flex; align-items:center; gap:12px; margin:16px 0; }
.an-notify-toggle-label { font-size:13px; color:#606266; }
.an-toggle { position:relative; display:inline-block; width:40px; height:20px; cursor:pointer; }
.an-toggle input { opacity:0; width:0; height:0; position:absolute; }
.an-toggle-slider { position:absolute; top:0; left:0; right:0; bottom:0; background:#dcdfe6; border-radius:10px; transition:0.3s; }
.an-toggle-slider::before { content:''; position:absolute; width:16px; height:16px; left:2px; bottom:2px; background:#fff; border-radius:50%; transition:0.3s; }
.an-toggle input:checked + .an-toggle-slider { background:#409eff; }
.an-toggle input:checked + .an-toggle-slider::before { transform:translateX(20px); }
.an-toggle-status { font-size:13px; color:#606266; }
.an-notify-user-table { min-width:400px; }
.an-notify-user-table th, .an-notify-user-table td { font-size:13px; padding:10px 12px; }

/* 被动域名 - 历史概况/历史会话 */
.pd-page { flex:1; min-height:0; display:flex; flex-direction:column; overflow:auto; }
.pd-overview-grid { display:grid; grid-template-columns:repeat(4, 1fr); gap:12px; padding:12px; flex:1; }
.pd-ov-panel { background:#fff; border:1px solid #ebeef5; border-radius:4px; display:flex; flex-direction:column; overflow:hidden; }
.pd-ov-head { display:flex; align-items:center; justify-content:space-between; padding:10px 12px; border-bottom:1px solid #ebeef5; background:#fafbfc; }
.pd-ov-title { font-size:13px; font-weight:600; color:#303133; }
.pd-ov-count { font-size:12px; color:#909399; }
.pd-ov-table-wrap { flex:1; overflow:auto; }
.pd-ov-table { min-width:100%; }
.pd-ov-table th, .pd-ov-table td { font-size:12px; padding:6px 10px; }
.pd-ov-footer { display:flex; align-items:center; justify-content:space-between; padding:8px 12px; border-top:1px solid #ebeef5; }
.pd-ov-total { font-size:12px; color:#909399; }
.pd-ss-table { min-width:1400px; }
.pd-ss-table th, .pd-ss-table td { font-size:12px; padding:6px 10px; }

/* cbm suspect badge */
.cbm-suspect-badge { display:inline-block; padding:1px 8px; border-radius:3px; font-size:11px; font-weight:600; }
.cbm-suspect-high { background:#fef0f0; color:#f56c6c; border:1px solid #fde2e2; }

/* sp - 实时会话弹窗 */
.sp-page { padding:0; }
.sp-filters { padding:12px 16px; border-bottom:1px solid #ebeef5; }
.sp-table-wrap { max-height:500px; overflow:auto; }
.sp-table th, .sp-table td { font-size:12px; padding:6px 8px; }
.sp-table { min-width:1400px; }
.sp-endpoint { color:#409eff; cursor:pointer; }
.sp-geo-tag { display:inline-flex; align-items:center; gap:2px; font-size:12px; }
.geo-flag-img { width:24px; height:18px; vertical-align:middle; object-fit:cover; border-radius:2px; }
.sp-footer { padding:12px 16px; border-top:1px solid #ebeef5; }

/* pa - 报文分析弹窗 */
.pa-page { padding:0; }
.pa-tabs { display:flex; border-bottom:1px solid #ebeef5; padding:0 16px; }
.pa-tab { padding:10px 16px; border:none; background:transparent; font-size:13px; color:#606266; cursor:pointer; position:relative; }
.pa-tab.active { color:#409eff; font-weight:600; }
.pa-tab.active::after { content:''; position:absolute; bottom:0; left:0; right:0; height:2px; background:#409eff; }
.pa-body { padding:16px; }
.pa-table_wrap { max-height:400px; overflow:auto; }
.pa-table th, .pa-table td { font-size:12px; padding:6px 8px; }
.pa-table { min-width:900px; }
.pa-meta { padding:0; }

/* cd-detail-table for metadata */
.cd-detail-table { width:100%; border-collapse:collapse; }
.cd-detail-table th, .cd-detail-table td { padding:8px 12px; border:1px solid #ebeef5; font-size:13px; text-align:left; }
.cd-detail-key { width:140px; background:#fafbfc; color:#909399; font-weight:500; }
.cd-detail-val { color:#303133; }

/* cbm-ip-ctx-menu - IP右键菜单 */
.cbm-ip-ctx-menu { position:fixed; z-index:9999; min-width:140px; padding:4px 0; background:#fff; border:1px solid #dcdfe6; border-radius:4px; box-shadow:0 2px 12px rgba(0,0,0,0.15); }
.cbm-ip-ctx-item { display:block; padding:8px 16px; color:#606266; font-size:13px; cursor:pointer; text-decoration:none; }
.cbm-ip-ctx-item:hover { background:#ecf5ff; color:#409eff; }
.cbm-ip-ctx-danger { color:#f56c6c; }
.cbm-ip-ctx-danger:hover { background:#fef0f0; color:#f56c6c; }

/* td-more-btn - 更多条件按钮 */
.td-more-btn { background:none; border:none; color:#409eff; font-size:12px; cursor:pointer; padding:4px 8px; }
.td-more-btn:hover { text-decoration:underline; }

/* cbm-rs-scroll - 实时会话表格滚动 */
.cbm-rs-scroll { max-height:600px; overflow:auto; }

/* sahs-dropdown - 数据包下拉菜单 */
.sahs-dropdown { position:relative; display:inline-block; }
.sahs-packet-btn { color:#409eff; cursor:pointer; text-decoration:underline; background:none; border:none; font-size:12px; }
.sahs-dropdown-menu { position:absolute; top:100%; left:0; z-index:1000; min-width:100px; padding:4px 0; background:#fff; border:1px solid #dcdfe6; border-radius:4px; box-shadow:0 2px 12px rgba(0,0,0,0.1); }
.sahs-dropdown-item { display:block; padding:6px 12px; color:#606266; font-size:12px; cursor:pointer; white-space:nowrap; text-decoration:none; }
.sahs-dropdown-item:hover { background:#ecf5ff; color:#409eff; }
</style>
