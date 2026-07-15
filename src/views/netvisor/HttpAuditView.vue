<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav nv-tabs-nav-wrap" role="tablist" aria-label="HTTP审计">
        <button v-for="t in tabs" :key="t.key" type="button" class="nv-tab" :class="{ active: activeTab === t.key }" @click="activeTab = t.key">{{ t.label }}</button>
      </div>
    </div>
    <div class="nv-tabs-body">

      <!-- ==================== HTTP诊断 Tab ==================== -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'diagnosis' }">
        <!-- 筛选区域 -->
        <div class="tdh-filters">
          <div class="tdh-filter-row">
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">MAC</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="f.mac" placeholder="任意" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">源IP</span>
              <select class="ou-toolbar-select" v-model="f.srcIpType">
                <option value="any">任意IP</option>
                <option value="single">单个IP</option>
              </select>
              <input v-if="f.srcIpType === 'single'" class="ou-toolbar-input tdh-filter-input" v-model="f.srcIp" placeholder="101.6.4.110" style="width:120px" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">源端口</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="f.srcPort" placeholder="80 / 8000-8080" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">目标IP</span>
              <select class="ou-toolbar-select" v-model="f.dstIpType">
                <option value="any">任意IP</option>
                <option value="single">任意IP</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">目标端口</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="f.dstPort" placeholder="80 / 8000-8080" />
            </label>
          </div>
          <div class="tdh-filter-row">
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">应用协议</span>
              <select class="ou-toolbar-select" v-model="f.appProtocol">
                <option value="">任意协议</option>
                <option value="HTTP">HTTP</option>
                <option value="HTTPS">HTTPS</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">源IP ISP</span>
              <select class="ou-toolbar-select" v-model="f.srcIsp">
                <option value="">任意</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">目标IP ISP</span>
              <select class="ou-toolbar-select" v-model="f.dstIsp">
                <option value="">任意</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">源IP区域</span>
              <select class="ou-toolbar-select" v-model="f.srcArea">
                <option value="">任意</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">目标IP区域</span>
              <select class="ou-toolbar-select" v-model="f.dstArea">
                <option value="">任意</option>
              </select>
            </label>
          </div>
          <div class="tdh-filter-row">
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">HTTP状态码</span>
              <select class="ou-toolbar-select" v-model="f.statusCode">
                <option value="">任意</option>
                <option value="2xx">2xx</option>
                <option value="3xx">3xx</option>
                <option value="4xx">4xx</option>
                <option value="5xx">5xx</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">请求方法</span>
              <select class="ou-toolbar-select" v-model="f.method">
                <option value="">任意</option>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">域名</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="f.domain" placeholder="任意" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">URI</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="f.uri" placeholder="任意" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">Agent</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="f.agent" placeholder="Cookie" />
            </label>
          </div>
          <div class="tdh-filter-row">
            <label class="tdh-filter-field tdh-filter-time">
              <span class="ou-toolbar-label">时间范围</span>
              <input class="ou-toolbar-input tdh-time-range" v-model="f.timeRange" />
            </label>
            <button class="ou-search-btn" @click="doSearch">
              <el-icon><Search /></el-icon>
            </button>
            <button class="secondary td-reset-btn" @click="resetFilters">重置</button>
            <div class="tdh-filter-right">
              <div class="tio-range-btns">
                <button class="tio-range-btn" :class="{ active: ipVersion === 'v4' }" @click="ipVersion = 'v4'">IPv4</button>
                <button class="tio-range-btn" :class="{ active: ipVersion === 'v6' }" @click="ipVersion = 'v6'">IPv6</button>
              </div>
              <button class="tid-export-btn" style="border:none;background:none;cursor:pointer;color:#409eff;font-size:13px;display:inline-flex;align-items:center;gap:4px;margin-left:8px" @click="doExport">
                <el-icon><Download /></el-icon> 导出
              </button>
            </div>
          </div>
        </div>

        <!-- 图表区域 -->
        <div class="hd-chart-grid">
          <section class="tid-chart-panel" style="flex:2">
            <div class="tid-chart-head" style="justify-content:space-between">
              <div class="tid-legend">
                <span class="tid-legend-item"><i class="tid-legend-dot" style="background:#91cc75"></i>HTTP20X</span>
                <span class="tid-legend-item"><i class="tid-legend-dot" style="background:#fac858"></i>HTTP30X</span>
                <span class="tid-legend-item"><i class="tid-legend-dot" style="background:#a78bfa"></i>HTTP40X</span>
                <span class="tid-legend-item"><i class="tid-legend-dot" style="background:#f56c6c"></i>HTTP50X</span>
                <span class="tid-legend-item"><i class="tid-legend-dot" style="background:#5470c6"></i>总请求</span>
              </div>
            </div>
            <div class="tid-chart-body">
              <span class="tid-yunit">次数</span>
              <div class="to-chart-plot">
                <v-chart :option="trendOption" autoresize style="width:100%;height:300px;" />
              </div>
            </div>
            <div class="dtt-chart-stats">
              <span class="dtt-stat"><i class="dtt-stat-badge max">MAX</i>最大值 <strong>{{ trendMax }}</strong></span>
              <span class="dtt-stat"><i class="dtt-stat-badge min">MIN</i>最小值 <strong>{{ trendMin }}</strong></span>
              <span class="dtt-stat"><i class="dtt-stat-badge avg">AVG</i>平均值 <strong>{{ trendAvg }}</strong></span>
            </div>
          </section>
          <section class="tid-chart-panel" style="flex:1">
            <div class="tid-chart-head"><h3 class="tid-mini-title"></h3></div>
            <div class="tid-chart-body">
              <div class="to-chart-plot">
                <v-chart :option="pieOption" autoresize style="width:100%;height:300px;" />
              </div>
            </div>
          </section>
        </div>

        <!-- 三个并列表格 -->
        <div class="hd-table-grid">
          <!-- 源IP表 -->
          <section class="tid-mini-panel">
            <div class="tid-mini-head">
              <h3 class="tid-mini-title">
                <el-icon style="margin-right:4px"><Monitor /></el-icon> 源IP
              </h3>
            </div>
            <div class="ou-table-wrap tid-mini-table-wrap">
              <table class="ou-table tid-mini-table">
                <thead>
                  <tr>
                    <th class="col-idx">序号</th>
                    <th>源IP <el-icon class="sort-icon" @click="sortSrcIp"><Sort /></el-icon></th>
                    <th>总请求数 <el-icon class="sort-icon" @click="sortSrcReq"><Sort /></el-icon></th>
                    <th>失败数 <el-icon class="sort-icon" @click="sortSrcFail"><Sort /></el-icon></th>
                    <th>状态码</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, idx) in srcIpPageData" :key="idx">
                    <td class="col-idx">{{ (srcIpPage - 1) * srcIpPageSize + idx + 1 }}</td>
                    <td><span class="tid-link" @click="openDiagDetail(row.ip)">{{ row.ip }}</span></td>
                    <td class="ou-num">{{ row.totalReq }}</td>
                    <td class="ou-num">{{ row.failCount }}</td>
                    <td><div class="status-bar" :style="getStatusBarStyle(row)"></div></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="ou-footer">
              <div class="ou-pager">
                <button class="ou-page-btn" @click="srcIpPage > 1 && srcIpPage--">‹</button>
                <button v-for="p in srcIpPages" :key="p" class="ou-page-btn" :class="{ active: p === srcIpPage }" @click="srcIpPage = p">{{ p }}</button>
                <button class="ou-page-btn" @click="srcIpPage < srcIpPages && srcIpPage++">›</button>
              </div>
              <span>共 {{ srcIpData.length }} 条</span>
            </div>
          </section>

          <!-- 目标IP表 -->
          <section class="tid-mini-panel">
            <div class="tid-mini-head">
              <h3 class="tid-mini-title">
                <el-icon style="margin-right:4px"><Connection /></el-icon> 目标IP
              </h3>
            </div>
            <div class="ou-table-wrap tid-mini-table-wrap">
              <table class="ou-table tid-mini-table">
                <thead>
                  <tr>
                    <th class="col-idx">序号</th>
                    <th>目标IP <el-icon class="sort-icon" @click="sortDstIp"><Sort /></el-icon></th>
                    <th>总请求数 <el-icon class="sort-icon" @click="sortDstReq"><Sort /></el-icon></th>
                    <th>失败数 <el-icon class="sort-icon" @click="sortDstFail"><Sort /></el-icon></th>
                    <th>状态码</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, idx) in dstIpPageData" :key="idx">
                    <td class="col-idx">{{ (dstIpPage - 1) * dstIpPageSize + idx + 1 }}</td>
                    <td><span class="tid-link" @click="openDiagDetail(row.ip)">{{ row.ip }}</span></td>
                    <td class="ou-num">{{ row.totalReq }}</td>
                    <td class="ou-num">{{ row.failCount }}</td>
                    <td><div class="status-bar" :style="getStatusBarStyle(row)"></div></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="ou-footer">
              <div class="ou-pager">
                <button class="ou-page-btn" @click="dstIpPage > 1 && dstIpPage--">‹</button>
                <button v-for="p in dstIpPages" :key="p" class="ou-page-btn" :class="{ active: p === dstIpPage }" @click="dstIpPage = p">{{ p }}</button>
                <button class="ou-page-btn" @click="dstIpPage < dstIpPages && dstIpPage++">›</button>
              </div>
              <span>共 {{ dstIpData.length }} 条</span>
            </div>
          </section>

          <!-- 目标域名表 -->
          <section class="tid-mini-panel">
            <div class="tid-mini-head">
              <h3 class="tid-mini-title">
                <el-icon style="margin-right:4px"><MapLocation /></el-icon> 目标域名
              </h3>
            </div>
            <div class="ou-table-wrap tid-mini-table-wrap">
              <table class="ou-table tid-mini-table">
                <thead>
                  <tr>
                    <th class="col-idx">序号</th>
                    <th>目标域名 <el-icon class="sort-icon" @click="sortDomain"><Sort /></el-icon></th>
                    <th>总请求数 <el-icon class="sort-icon" @click="sortDomainReq"><Sort /></el-icon></th>
                    <th>失败数 <el-icon class="sort-icon" @click="sortDomainFail"><Sort /></el-icon></th>
                    <th>状态码</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, idx) in domainPageData" :key="idx">
                    <td class="col-idx">{{ (domainPage - 1) * domainPageSize + idx + 1 }}</td>
                    <td><span class="tid-link" :title="row.domain" @click="openDiagDetail(row.domain)">{{ truncateDomain(row.domain) }}</span></td>
                    <td class="ou-num">{{ row.totalReq }}</td>
                    <td class="ou-num">{{ row.failCount }}</td>
                    <td><div class="status-bar" :style="getStatusBarStyle(row)"></div></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="ou-footer">
              <div class="ou-pager">
                <button class="ou-page-btn" @click="domainPage > 1 && domainPage--">‹</button>
                <button v-for="p in domainPages" :key="p" class="ou-page-btn" :class="{ active: p === domainPage }" @click="domainPage = p">{{ p }}</button>
                <button class="ou-page-btn" @click="domainPage < domainPages && domainPage++">›</button>
              </div>
              <span>共 {{ domainData.length }} 条</span>
            </div>
          </section>
        </div>
      </div>

      <!-- ==================== HTTP概况 Tab ==================== -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'overview' }">
        <!-- 筛选区域 -->
        <div class="tdh-filters">
          <div class="tdh-filter-row">
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">MAC</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="ovFilter.mac" placeholder="任意" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">源IP</span>
              <select class="ou-toolbar-select" v-model="ovFilter.srcIpType">
                <option value="any">任意IP</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">源端口</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="ovFilter.srcPort" placeholder="80 / 8000-8080" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">目标IP</span>
              <select class="ou-toolbar-select" v-model="ovFilter.dstIpType">
                <option value="any">任意IP</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">目标端口</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="ovFilter.dstPort" placeholder="80 / 8000-8080" />
            </label>
          </div>
          <div class="tdh-filter-row">
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">应用协议</span>
              <select class="ou-toolbar-select" v-model="ovFilter.appProtocol">
                <option value="">任意协议</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">源IP ISP</span>
              <select class="ou-toolbar-select" v-model="ovFilter.srcIsp">
                <option value="">任意</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">目标IP ISP</span>
              <select class="ou-toolbar-select" v-model="ovFilter.dstIsp">
                <option value="">任意</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">源IP区域</span>
              <select class="ou-toolbar-select" v-model="ovFilter.srcArea">
                <option value="">任意</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">目标IP区域</span>
              <select class="ou-toolbar-select" v-model="ovFilter.dstArea">
                <option value="">任意</option>
              </select>
            </label>
          </div>
          <div class="tdh-filter-row">
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">HTTP状态码</span>
              <select class="ou-toolbar-select" v-model="ovFilter.statusCode">
                <option value="">任意</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">请求方法</span>
              <select class="ou-toolbar-select" v-model="ovFilter.method">
                <option value="">任意</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">域名</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="ovFilter.domain" placeholder="任意" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">URI</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="ovFilter.uri" placeholder="任意" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">Agent</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="ovFilter.agent" placeholder="任意" />
            </label>
          </div>
          <div class="tdh-filter-row">
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">Cookie</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="ovFilter.cookie" placeholder="任意" />
            </label>
            <label class="tdh-filter-field tdh-filter-time">
              <span class="ou-toolbar-label">时间范围</span>
              <input class="ou-toolbar-input tdh-time-range" v-model="ovFilter.timeRange" />
            </label>
            <button class="ou-search-btn" @click="doOvSearch">
              <el-icon><Search /></el-icon>
            </button>
            <button class="secondary td-reset-btn" @click="resetOvFilters">重置</button>
            <div class="tdh-filter-right">
              <div class="tio-range-btns">
                <button class="tio-range-btn" :class="{ active: ovIpVersion === 'v4' }" @click="ovIpVersion = 'v4'">IPv4</button>
                <button class="tio-range-btn" :class="{ active: ovIpVersion === 'v6' }" @click="ovIpVersion = 'v6'">IPv6</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 4个面板: 2x2 -->
        <div class="ov-panel-grid">
          <!-- 前20源IP 柱状图 -->
          <section class="tid-mini-panel">
            <div class="tid-mini-head">
              <h3 class="tid-mini-title">
                <el-icon style="margin-right:4px"><Monitor /></el-icon> 前20源IP
              </h3>
            </div>
            <div class="ov-chart-body">
              <v-chart :option="ovSrcBarOption" autoresize style="width:100%;height:260px;" />
            </div>
          </section>

          <!-- 源IP表格 -->
          <section class="tid-mini-panel">
            <div class="tid-mini-head">
              <h3 class="tid-mini-title">
                <el-icon style="margin-right:4px"><Monitor /></el-icon> 源IP
              </h3>
              <button class="tid-expand-btn" @click="expandOvSrcTable = !expandOvSrcTable" :title="expandOvSrcTable ? '收起' : '展开'">
                <el-icon><FullScreen v-if="!expandOvSrcTable" /><Fold v-else /></el-icon>
              </button>
            </div>
            <div class="ou-table-wrap tid-mini-table-wrap" :style="{ maxHeight: expandOvSrcTable ? '400px' : '260px' }">
              <table class="ou-table tid-mini-table">
                <thead>
                  <tr>
                    <th class="col-idx">序号</th>
                    <th>源IP <el-icon class="sort-icon" @click="sortOvSrcIp"><Sort /></el-icon></th>
                    <th>总请求数 <el-icon class="sort-icon" @click="sortOvSrcReq"><Sort /></el-icon></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, idx) in ovSrcIpPageData" :key="idx">
                    <td class="col-idx">{{ (ovSrcIpPage - 1) * ovSrcIpPageSize + idx + 1 }}</td>
                    <td><span class="tid-link" @click="openSessionPopup(row.ip)">{{ row.ip }}</span></td>
                    <td class="ou-num">{{ row.totalReq.toLocaleString() }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="ou-footer">
              <div class="ou-pager">
                <button class="ou-page-btn" @click="ovSrcIpPage > 1 && ovSrcIpPage--">‹</button>
                <button v-for="p in ovSrcIpPages" :key="p" class="ou-page-btn" :class="{ active: p === ovSrcIpPage }" @click="ovSrcIpPage = p">{{ p }}</button>
                <button class="ou-page-btn" @click="ovSrcIpPage < ovSrcIpPages && ovSrcIpPage++">›</button>
              </div>
              <span>共 {{ ovSrcIpData.length }} 条</span>
            </div>
          </section>

          <!-- 前20目标IP 柱状图 -->
          <section class="tid-mini-panel">
            <div class="tid-mini-head">
              <h3 class="tid-mini-title">
                <el-icon style="margin-right:4px"><Connection /></el-icon> 前20目标IP
              </h3>
            </div>
            <div class="ov-chart-body">
              <v-chart :option="ovDstBarOption" autoresize style="width:100%;height:260px;" />
            </div>
          </section>

          <!-- 目标IP表格 -->
          <section class="tid-mini-panel">
            <div class="tid-mini-head">
              <h3 class="tid-mini-title">
                <el-icon style="margin-right:4px"><Connection /></el-icon> 目标IP
              </h3>
              <button class="tid-expand-btn" @click="expandOvDstTable = !expandOvDstTable" :title="expandOvDstTable ? '收起' : '展开'">
                <el-icon><FullScreen v-if="!expandOvDstTable" /><Fold v-else /></el-icon>
              </button>
            </div>
            <div class="ou-table-wrap tid-mini-table-wrap" :style="{ maxHeight: expandOvDstTable ? '400px' : '260px' }">
              <table class="ou-table tid-mini-table">
                <thead>
                  <tr>
                    <th class="col-idx">序号</th>
                    <th>目标IP <el-icon class="sort-icon" @click="sortOvDstIp"><Sort /></el-icon></th>
                    <th>总请求数 <el-icon class="sort-icon" @click="sortOvDstReq"><Sort /></el-icon></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, idx) in ovDstIpPageData" :key="idx">
                    <td class="col-idx">{{ (ovDstIpPage - 1) * ovDstIpPageSize + idx + 1 }}</td>
                    <td><span class="tid-link" @click="openSessionPopup(row.ip)">{{ row.ip }}</span></td>
                    <td class="ou-num">{{ row.totalReq.toLocaleString() }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="ou-footer">
              <div class="ou-pager">
                <button class="ou-page-btn" @click="ovDstIpPage > 1 && ovDstIpPage--">‹</button>
                <button v-for="p in ovDstIpPages" :key="p" class="ou-page-btn" :class="{ active: p === ovDstIpPage }" @click="ovDstIpPage = p">{{ p }}</button>
                <button class="ou-page-btn" @click="ovDstIpPage < ovDstIpPages && ovDstIpPage++">›</button>
              </div>
              <span>共 {{ ovDstIpData.length }} 条</span>
            </div>
          </section>
        </div>
      </div>

      <!-- ==================== HTTP会话 Tab ==================== -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'sessions' }">
        <!-- 筛选区域 -->
        <div class="tdh-filters">
          <div class="tdh-filter-row">
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">源IP</span>
              <select class="ou-toolbar-select" v-model="sessFilter.srcIpType">
                <option value="any">任意IP</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">目标IP</span>
              <select class="ou-toolbar-select" v-model="sessFilter.dstIpType">
                <option value="any">任意IP</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">
                <el-icon><Filter /></el-icon> 过滤源
              </span>
              <select class="ou-toolbar-select" v-model="sessFilter.filterSrc">
                <option value="no">否</option>
                <option value="yes">是</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">源端口</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="sessFilter.srcPort" placeholder="80 / 8000-8080" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">目标IP</span>
              <select class="ou-toolbar-select" v-model="sessFilter.dstIpType2">
                <option value="any">任意IP</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">
                <el-icon><Filter /></el-icon> 过滤目标
              </span>
              <select class="ou-toolbar-select" v-model="sessFilter.filterDst">
                <option value="no">否</option>
                <option value="yes">是</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">目标端口</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="sessFilter.dstPort" placeholder="80 / 8000-8080" />
            </label>
          </div>
          <div class="tdh-filter-row">
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">MAC</span>
              <select class="ou-toolbar-select" v-model="sessFilter.mac">
                <option value="">任意</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">应用协议</span>
              <select class="ou-toolbar-select" v-model="sessFilter.appProtocol">
                <option value="">任意协议</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">客户时延>=</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="sessFilter.clientLatencyMin" placeholder="ms" style="width:80px" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">服务时延>=</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="sessFilter.serverLatencyMin" placeholder="ms" style="width:80px" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">应用时延>=</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="sessFilter.appLatencyMin" placeholder="ms" style="width:80px" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">请求方法</span>
              <select class="ou-toolbar-select" v-model="sessFilter.method">
                <option value="">任意</option>
              </select>
            </label>
          </div>
          <div class="tdh-filter-row">
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">域名</span>
              <select class="ou-toolbar-select" v-model="sessFilter.domain">
                <option value="">任意</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">用户组</span>
              <select class="ou-toolbar-select" v-model="sessFilter.userGroup">
                <option value="">任意</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">用户名称</span>
              <select class="ou-toolbar-select" v-model="sessFilter.userName">
                <option value="">任意</option>
              </select>
            </label>
            <label class="tdh-filter-field tdh-filter-time">
              <span class="ou-toolbar-label">时间范围</span>
              <input class="ou-toolbar-input tdh-time-range" v-model="sessFilter.timeRange" />
            </label>
            <button class="ou-search-btn" @click="doSessSearch">
              <el-icon><Search /></el-icon>
            </button>
            <button class="secondary td-reset-btn" @click="resetSessFilters">重置</button>
            <button class="td-icon-btn" @click="sessShowMore = !sessShowMore" :title="sessShowMore ? '收起' : '更多条件'">
              <el-icon><ArrowUp v-if="sessShowMore" /><ArrowDown v-else /></el-icon>
            </button>
            <div class="tdh-filter-right">
              <div class="tio-range-btns">
                <button class="tio-range-btn" :class="{ active: sessIpVersion === 'v4' }" @click="sessIpVersion = 'v4'">IPv4</button>
                <button class="tio-range-btn" :class="{ active: sessIpVersion === 'v6' }" @click="sessIpVersion = 'v6'">IPv6</button>
              </div>
              <button style="border:none;background:none;cursor:pointer;color:#409eff;font-size:13px;margin-left:8px" @click="doSessExport">
                <el-icon><Download /></el-icon>
              </button>
            </div>
          </div>
        </div>

        <!-- 会话表格 -->
        <div class="ou-table-wrap" style="flex:1;min-height:0">
          <table class="ou-table audit-table">
            <thead>
              <tr>
                <th style="width:40px"><input type="checkbox" v-model="sessSelectAll" @change="toggleSessSelectAll" /></th>
                <th>发送时间 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>MAC</th>
                <th>MAC厂商</th>
                <th>用户名称</th>
                <th>源IP</th>
                <th>目标IP</th>
                <th>目标地理位置</th>
                <th>应用协议</th>
                <th>请求方法</th>
                <th>状态码</th>
                <th>链路</th>
                <th>客户时延</th>
                <th>服务时延</th>
                <th>应用时延</th>
                <th>信息摘要</th>
                <th style="width:120px">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in sessPageData" :key="idx">
                <td><input type="checkbox" v-model="row._selected" /></td>
                <td style="white-space:nowrap">{{ row.sendTime }}</td>
                <td style="font-size:12px">{{ row.mac }}</td>
                <td style="font-size:12px">{{ row.macVendor }}</td>
                <td>{{ row.userName }}</td>
                <td><span class="tid-link">{{ row.srcIp }}</span></td>
                <td><span class="tid-link">{{ row.dstIp }}</span></td>
                <td>
                  <span class="geo-tag">
                    <span class="geo-flag">🇨🇳</span>
                    {{ row.geoLocation }}
                  </span>
                </td>
                <td style="font-size:12px">{{ row.appProtocol }}</td>
                <td>
                  <span class="method-tag" :class="'method-' + row.method.toLowerCase()">{{ row.method }}</span>
                </td>
                <td>
                  <span class="status-code-tag" :class="getStatusCodeClass(row.statusCode)">{{ row.statusCode }}</span>
                </td>
                <td>{{ row.link }}</td>
                <td class="ou-num">{{ row.clientLatency }}</td>
                <td class="ou-num">{{ row.serverLatency }}</td>
                <td class="ou-num">{{ row.appLatency }}</td>
                <td style="font-size:11px;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#909399" :title="row.infoSummary">{{ row.infoSummary }}</td>
                <td>
                  <button class="link-btn" @click="openPacketPopup(row)">数据包</button>
                  <button class="link-btn" style="margin-left:6px" @click="openLogDetailPopup(row)">日志详情</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="ou-footer">
          <div class="ou-footer-left">
            <div class="ou-pager">
              <button class="ou-page-btn" @click="sessPage > 1 && sessPage--">‹</button>
              <button v-for="p in sessPages" :key="p" class="ou-page-btn" :class="{ active: p === sessPage }" @click="sessPage = p">{{ p }}</button>
              <button class="ou-page-btn" @click="sessPage < sessPages && sessPage++">›</button>
              <span style="margin-left:8px;font-size:12px;color:#909399">到第</span>
              <input class="ou-page-goto-input" v-model.number="sessGotoPage" style="width:36px;height:24px;text-align:center;border:1px solid #dcdfe6;border-radius:3px;font-size:12px" />
              <span style="font-size:12px;color:#909399">页</span>
              <button class="ou-page-goto-btn" @click="goToSessPage" style="height:24px;padding:0 8px;border:1px solid #dcdfe6;border-radius:3px;background:#fff;font-size:12px;cursor:pointer">确定</button>
            </div>
          </div>
          <div class="ou-footer-right">
            <span>共 {{ sessData.length }} 条</span>
            <label class="ou-page-size">
              <select v-model="sessPageSize" style="height:24px;border:1px solid #dcdfe6;border-radius:3px;font-size:12px;padding:0 4px">
                <option :value="100">100 条/页</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      <!-- ==================== URL统计 Tab ==================== -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'url-stats' }">
        <!-- 筛选区域 -->
        <div class="tdh-filters">
          <div class="tdh-filter-row">
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">源IP</span>
              <select class="ou-toolbar-select" v-model="urlFilter.srcIpType">
                <option value="any">任意IP</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">目标IP</span>
              <select class="ou-toolbar-select" v-model="urlFilter.dstIpType">
                <option value="any">任意IP</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">
                <el-icon><Filter /></el-icon> 过滤源
              </span>
              <select class="ou-toolbar-select" v-model="urlFilter.filterSrc">
                <option value="no">否</option>
                <option value="yes">是</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">源端口</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="urlFilter.srcPort" placeholder="80 / 8000-8080" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">目标IP</span>
              <select class="ou-toolbar-select" v-model="urlFilter.dstIpType2">
                <option value="any">任意IP</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">
                <el-icon><Filter /></el-icon> 过滤目标
              </span>
              <select class="ou-toolbar-select" v-model="urlFilter.filterDst">
                <option value="no">否</option>
                <option value="yes">是</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">目标端口</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="urlFilter.dstPort" placeholder="80 / 8000-8080" />
            </label>
          </div>
          <div class="tdh-filter-row">
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">MAC</span>
              <select class="ou-toolbar-select" v-model="urlFilter.mac">
                <option value="">任意</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">应用协议</span>
              <select class="ou-toolbar-select" v-model="urlFilter.appProtocol">
                <option value="">应用协议</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">客户时延>=</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="urlFilter.clientLatencyMin" placeholder="ms" style="width:80px" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">服务时延>=</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="urlFilter.serverLatencyMin" placeholder="ms" style="width:80px" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">应用时延>=</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="urlFilter.appLatencyMin" placeholder="ms" style="width:80px" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">请求方法</span>
              <select class="ou-toolbar-select" v-model="urlFilter.method">
                <option value="">任意</option>
              </select>
            </label>
          </div>
          <div class="tdh-filter-row">
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">域名</span>
              <select class="ou-toolbar-select" v-model="urlFilter.domain">
                <option value="">任意</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">用户组</span>
              <select class="ou-toolbar-select" v-model="urlFilter.userGroup">
                <option value="">任意</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">用户名称</span>
              <select class="ou-toolbar-select" v-model="urlFilter.userName">
                <option value="">任意</option>
              </select>
            </label>
            <label class="tdh-filter-field tdh-filter-time">
              <span class="ou-toolbar-label">时间范围</span>
              <input class="ou-toolbar-input tdh-time-range" v-model="urlFilter.timeRange" />
            </label>
            <button class="ou-search-btn" @click="doUrlSearch">
              <el-icon><Search /></el-icon>
            </button>
            <button class="secondary td-reset-btn" @click="resetUrlFilters">重置</button>
            <button class="td-icon-btn" @click="urlShowMore = !urlShowMore" :title="urlShowMore ? '收起' : '更多条件'">
              <el-icon><ArrowUp v-if="urlShowMore" /><ArrowDown v-else /></el-icon>
            </button>
            <div class="tdh-filter-right">
              <div class="tio-range-btns">
                <button class="tio-range-btn" :class="{ active: urlIpVersion === 'v4' }" @click="urlIpVersion = 'v4'">IPv4</button>
                <button class="tio-range-btn" :class="{ active: urlIpVersion === 'v6' }" @click="urlIpVersion = 'v6'">IPv6</button>
              </div>
              <button style="border:none;background:none;cursor:pointer;color:#409eff;font-size:13px;margin-left:8px" @click="doUrlExport">
                <el-icon><Download /></el-icon>
              </button>
            </div>
          </div>
        </div>

        <!-- URL统计表格 -->
        <div class="ou-table-wrap" style="flex:1;min-height:0">
          <table class="ou-table audit-table">
            <thead>
              <tr>
                <th style="width:50px">序号</th>
                <th>域名</th>
                <th>URL</th>
                <th>访问次数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>应用平均时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>HTTP20X <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>HTTP30X <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>HTTP40X <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>HTTP50X <el-icon class="sort-icon"><Sort /></el-icon></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in urlPageData" :key="idx" @contextmenu.prevent="showUrlContextMenu($event, row)">
                <td>{{ (urlPage - 1) * urlPageSize + idx + 1 }}</td>
                <td><span class="tid-link" @click="openDomainDiagPopup(row)">{{ row.domain }}</span></td>
                <td style="font-size:12px;color:#606266;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" :title="row.url">{{ row.url }}</td>
                <td class="ou-num">{{ row.visitCount }}</td>
                <td class="ou-num">{{ row.avgLatency }} ms</td>
                <td class="ou-num">{{ row.http20x }}</td>
                <td class="ou-num">{{ row.http30x }}</td>
                <td class="ou-num">{{ row.http40x }}</td>
                <td class="ou-num">{{ row.http50x }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="ou-footer">
          <div class="ou-footer-left">
            <div class="ou-pager">
              <button class="ou-page-btn" @click="urlPage > 1 && urlPage--">‹</button>
              <button v-for="p in urlPages" :key="p" class="ou-page-btn" :class="{ active: p === urlPage }" @click="urlPage = p">{{ p }}</button>
              <button class="ou-page-btn" @click="urlPage < urlPages && urlPage++">›</button>
              <span style="margin-left:8px;font-size:12px;color:#909399">到第</span>
              <input class="ou-page-goto-input" v-model.number="urlGotoPage" style="width:36px;height:24px;text-align:center;border:1px solid #dcdfe6;border-radius:3px;font-size:12px" />
              <span style="font-size:12px;color:#909399">页</span>
              <button class="ou-page-goto-btn" @click="goToUrlPage" style="height:24px;padding:0 8px;border:1px solid #dcdfe6;border-radius:3px;background:#fff;font-size:12px;cursor:pointer">确定</button>
            </div>
          </div>
          <div class="ou-footer-right">
            <span>共 {{ urlData.length }} 条</span>
            <label class="ou-page-size">
              <select v-model="urlPageSize" style="height:24px;border:1px solid #dcdfe6;border-radius:3px;font-size:12px;padding:0 4px">
                <option :value="100">100 条/页</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      <!-- 右键菜单 -->
      <div v-if="urlContextMenuVisible" class="url-context-menu" :style="{ top: urlContextMenuY + 'px', left: urlContextMenuX + 'px' }" @click.stop>
        <div class="url-context-item" @click="openUrlStatPopup(urlContextMenuRow)">
          <el-icon><DataAnalysis /></el-icon> URL统计
        </div>
        <div class="url-context-item" @click="openDomainDiagPopup(urlContextMenuRow)">
          <el-icon><Monitor /></el-icon> HTTP诊断
        </div>
        <div class="url-context-item" @click="openDomainProfilePopup(urlContextMenuRow)">
          <el-icon><Picture /></el-icon> 域名画像
        </div>
        <div class="url-context-item" @click="openDomainSessionPopup(urlContextMenuRow)">
          <el-icon><Connection /></el-icon> 会话诊断
        </div>
      </div>
    </div>

    <!-- ==================== HTTP诊断详情弹窗 ==================== -->
    <el-dialog
      v-model="diagDetailVisible"
      title="HTTP诊断"
      width="95%"
      top="3vh"
      destroy-on-close
      class="hd-detail-dialog"
    >
      <!-- 弹窗内筛选 -->
      <div class="tdh-filters" style="background:#f5f7fa;border-radius:4px;margin-bottom:12px">
        <div class="tdh-filter-row">
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">MAC</span>
            <select class="ou-toolbar-select" v-model="popFilter.mac">
              <option value="">任意</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">源IP</span>
            <select class="ou-toolbar-select" v-model="popFilter.srcIpType">
              <option value="any">任意IP</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">源端口</span>
            <input class="ou-toolbar-input tdh-filter-input" v-model="popFilter.srcPort" placeholder="80 / 8000-8080" />
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">目标IP</span>
            <select class="ou-toolbar-select" v-model="popFilter.dstIpType">
              <option value="any">任意IP</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">目标端口</span>
            <input class="ou-toolbar-input tdh-filter-input" v-model="popFilter.dstPort" placeholder="80 / 8000-8080" />
          </label>
        </div>
        <div class="tdh-filter-row">
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">应用协议</span>
            <select class="ou-toolbar-select" v-model="popFilter.appProtocol">
              <option value="">任意协议</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">源IP ISP</span>
            <select class="ou-toolbar-select" v-model="popFilter.srcIsp">
              <option value="">任意</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">目标IP ISP</span>
            <select class="ou-toolbar-select" v-model="popFilter.dstIsp">
              <option value="">任意</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">源IP区域</span>
            <select class="ou-toolbar-select" v-model="popFilter.srcArea">
              <option value="">任意</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">目标IP区域</span>
            <select class="ou-toolbar-select" v-model="popFilter.dstArea">
              <option value="">任意</option>
            </select>
          </label>
        </div>
        <div class="tdh-filter-row">
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">HTTP状态码</span>
            <select class="ou-toolbar-select" v-model="popFilter.statusCode">
              <option value="">任意</option>
              <option value="2xx">2xx</option>
              <option value="3xx">3xx</option>
              <option value="4xx">4xx</option>
              <option value="5xx">5xx</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">请求方法</span>
            <select class="ou-toolbar-select" v-model="popFilter.method">
              <option value="">任意</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">域名</span>
            <input class="ou-toolbar-input tdh-filter-input" v-model="popFilter.domain" placeholder="任意" />
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">URI</span>
            <input class="ou-toolbar-input tdh-filter-input" v-model="popFilter.uri" placeholder="任意" />
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">Agent</span>
            <input class="ou-toolbar-input tdh-filter-input" v-model="popFilter.agent" placeholder="Cookie" />
          </label>
        </div>
        <div class="tdh-filter-row">
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">Cookie</span>
            <input class="ou-toolbar-input tdh-filter-input" v-model="popFilter.cookie" placeholder="任意" />
          </label>
          <label class="tdh-filter-field tdh-filter-time">
            <span class="ou-toolbar-label">时间范围</span>
            <input class="ou-toolbar-input tdh-time-range" v-model="popFilter.timeRange" />
          </label>
          <button class="ou-search-btn" @click="doPopSearch">
            <el-icon><Search /></el-icon>
          </button>
          <button class="secondary td-reset-btn" @click="resetPopFilters">重置</button>
          <div class="tdh-filter-right">
            <div class="tio-range-btns">
              <button class="tio-range-btn" :class="{ active: popIpVersion === 'v4' }" @click="popIpVersion = 'v4'">IPv4</button>
              <button class="tio-range-btn" :class="{ active: popIpVersion === 'v6' }" @click="popIpVersion = 'v6'">IPv6</button>
            </div>
            <button style="border:none;background:none;cursor:pointer;color:#409eff;font-size:13px;margin-left:8px;display:inline-flex;align-items:center;gap:4px" @click="doPopExport">
              <el-icon><Download /></el-icon> 导出
            </button>
          </div>
        </div>
      </div>

      <!-- 弹窗图表 -->
      <div class="hd-chart-grid">
        <section class="tid-chart-panel" style="flex:2">
          <div class="tid-chart-head" style="justify-content:space-between">
            <div class="tid-legend">
              <span class="tid-legend-item"><i class="tid-legend-dot" style="background:#fac858"></i>HTTP20X</span>
              <span class="tid-legend-item"><i class="tid-legend-dot" style="background:#a78bfa"></i>HTTP30X</span>
              <span class="tid-legend-item"><i class="tid-legend-dot" style="background:#f56c6c"></i>HTTP40X</span>
              <span class="tid-legend-item"><i class="tid-legend-dot" style="background:#5470c6"></i>总请求</span>
            </div>
          </div>
          <div class="tid-chart-body">
            <span class="tid-yunit">次数</span>
            <div class="to-chart-plot">
              <v-chart :option="popTrendOption" autoresize style="width:100%;height:220px;" />
            </div>
          </div>
          <div class="dtt-chart-stats">
            <span class="dtt-stat"><i class="dtt-stat-badge max">MAX</i>最大值 <strong>{{ popTrendMax }}</strong></span>
            <span class="dtt-stat"><i class="dtt-stat-badge min">MIN</i>最小值 <strong>{{ popTrendMin }}</strong></span>
            <span class="dtt-stat"><i class="dtt-stat-badge avg">AVG</i>平均值 <strong>{{ popTrendAvg }}</strong></span>
          </div>
        </section>
        <section class="tid-chart-panel" style="flex:1">
          <div class="tid-chart-head"><h3 class="tid-mini-title"></h3></div>
          <div class="tid-chart-body">
            <div class="to-chart-plot">
              <v-chart :option="popPieOption" autoresize style="width:100%;height:220px;" />
            </div>
          </div>
        </section>
      </div>

      <!-- 弹窗三列表格 -->
      <div class="hd-table-grid">
        <!-- 源IP -->
        <section class="tid-mini-panel">
          <div class="tid-mini-head">
            <h3 class="tid-mini-title">
              <el-icon style="margin-right:4px"><Monitor /></el-icon> 源IP
            </h3>
          </div>
          <div class="ou-table-wrap tid-mini-table-wrap">
            <table class="ou-table tid-mini-table">
              <thead>
                <tr>
                  <th class="col-idx">序号</th>
                  <th>源IP <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th>失败数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th>状态码</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in popSrcIpData" :key="idx">
                  <td class="col-idx">{{ idx + 1 }}</td>
                  <td><span class="tid-link" @click="openDiagDetail(row.ip)">{{ row.ip }}</span></td>
                  <td class="ou-num">{{ row.totalReq }}</td>
                  <td class="ou-num">{{ row.failCount }}</td>
                  <td><div class="status-bar" :style="getStatusBarStyle(row)"></div></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="ou-footer">
            <div class="ou-pager">
              <button class="ou-page-btn" disabled>‹</button>
              <button class="ou-page-btn active">1</button>
              <button class="ou-page-btn" disabled>›</button>
            </div>
            <span>共 {{ popSrcIpData.length }} 条</span>
          </div>
        </section>

        <!-- 目标IP -->
        <section class="tid-mini-panel">
          <div class="tid-mini-head">
            <h3 class="tid-mini-title">
              <el-icon style="margin-right:4px"><Connection /></el-icon> 目标IP
            </h3>
          </div>
          <div class="ou-table-wrap tid-mini-table-wrap">
            <table class="ou-table tid-mini-table">
              <thead>
                <tr>
                  <th class="col-idx">序号</th>
                  <th>目标IP <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th>失败数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th>状态码</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in popDstIpData" :key="idx">
                  <td class="col-idx">{{ idx + 1 }}</td>
                  <td><span class="tid-link" @click="openDiagDetail(row.ip)">{{ row.ip }}</span></td>
                  <td class="ou-num">{{ row.totalReq }}</td>
                  <td class="ou-num">{{ row.failCount }}</td>
                  <td><div class="status-bar" :style="getStatusBarStyle(row)"></div></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="ou-footer">
            <div class="ou-pager">
              <button class="ou-page-btn" disabled>‹</button>
              <button class="ou-page-btn active">1</button>
              <button class="ou-page-btn" disabled>›</button>
            </div>
            <span>共 {{ popDstIpData.length }} 条</span>
          </div>
        </section>

        <!-- 目标域名 -->
        <section class="tid-mini-panel">
          <div class="tid-mini-head">
            <h3 class="tid-mini-title">
              <el-icon style="margin-right:4px"><MapLocation /></el-icon> 目标域名
            </h3>
          </div>
          <div class="ou-table-wrap tid-mini-table-wrap">
            <table class="ou-table tid-mini-table">
              <thead>
                <tr>
                  <th class="col-idx">序号</th>
                  <th>目标域名 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th>失败数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th>状态码</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in popDomainData" :key="idx">
                  <td class="col-idx">{{ idx + 1 }}</td>
                  <td><span class="tid-link" :title="row.domain" @click="openDiagDetail(row.domain)">{{ truncateDomain(row.domain) }}</span></td>
                  <td class="ou-num">{{ row.totalReq }}</td>
                  <td class="ou-num">{{ row.failCount }}</td>
                  <td><div class="status-bar" :style="getStatusBarStyle(row)"></div></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="ou-footer">
            <div class="ou-pager">
              <button class="ou-page-btn" disabled>‹</button>
              <button class="ou-page-btn active">1</button>
              <button class="ou-page-btn" disabled>›</button>
            </div>
            <span>共 {{ popDomainData.length }} 条</span>
          </div>
        </section>
      </div>
    </el-dialog>

    <!-- ==================== HTTP会话弹窗 ==================== -->
    <el-dialog
      v-model="sessionPopupVisible"
      title="HTTP会话"
      width="95%"
      top="3vh"
      destroy-on-close
      class="hd-detail-dialog"
    >
      <!-- 弹窗筛选 -->
      <div class="tdh-filters" style="background:#f5f7fa;border-radius:4px;margin-bottom:12px">
        <div class="tdh-filter-row">
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">单个IP</span>
            <div style="display:flex;align-items:center;gap:4px">
              <input class="ou-toolbar-input tdh-filter-input" v-model="sessionFilter.ip" style="width:130px" />
              <el-icon v-if="sessionFilter.ip" style="cursor:pointer;color:#909399" @click="sessionFilter.ip=''"><Close /></el-icon>
            </div>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">
              <el-icon><Filter /></el-icon> 过滤源
            </span>
            <select class="ou-toolbar-select" v-model="sessionFilter.filterSrc">
              <option value="no">否</option>
              <option value="yes">是</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">源端口</span>
            <input class="ou-toolbar-input tdh-filter-input" v-model="sessionFilter.srcPort" placeholder="80 / 8000-8080" />
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">目标IP</span>
            <select class="ou-toolbar-select" v-model="sessionFilter.dstIpType">
              <option value="any">任意IP</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">
              <el-icon><Filter /></el-icon> 过滤目标
            </span>
            <select class="ou-toolbar-select" v-model="sessionFilter.filterDst">
              <option value="no">否</option>
              <option value="yes">是</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">目标端口</span>
            <input class="ou-toolbar-input tdh-filter-input" v-model="sessionFilter.dstPort" placeholder="80 / 8000-8080" />
          </label>
        </div>
        <div class="tdh-filter-row">
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">MAC</span>
            <select class="ou-toolbar-select" v-model="sessionFilter.mac">
              <option value="">任意</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">应用协议</span>
            <select class="ou-toolbar-select" v-model="sessionFilter.appProtocol">
              <option value="">任意协议</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">客户时延>=</span>
            <input class="ou-toolbar-input tdh-filter-input" v-model="sessionFilter.clientLatencyMin" placeholder="ms" style="width:80px" />
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">服务时延>=</span>
            <input class="ou-toolbar-input tdh-filter-input" v-model="sessionFilter.serverLatencyMin" placeholder="ms" style="width:80px" />
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">应用时延>=</span>
            <input class="ou-toolbar-input tdh-filter-input" v-model="sessionFilter.appLatencyMin" placeholder="ms" style="width:80px" />
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">请求方法</span>
            <select class="ou-toolbar-select" v-model="sessionFilter.method">
              <option value="">任意</option>
            </select>
          </label>
        </div>
        <div class="tdh-filter-row">
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">域名</span>
            <select class="ou-toolbar-select" v-model="sessionFilter.domain">
              <option value="">任意</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">用户组</span>
            <select class="ou-toolbar-select" v-model="sessionFilter.userGroup">
              <option value="">任意</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">用户名称</span>
            <select class="ou-toolbar-select" v-model="sessionFilter.userName">
              <option value="">任意</option>
            </select>
          </label>
          <label class="tdh-filter-field tdh-filter-time">
            <span class="ou-toolbar-label">时间范围</span>
            <input class="ou-toolbar-input tdh-time-range" v-model="sessionFilter.timeRange" />
          </label>
          <button class="ou-search-btn" @click="doSessionSearch">
            <el-icon><Search /></el-icon>
          </button>
          <button class="secondary td-reset-btn" @click="resetSessionFilters">重置</button>
          <button class="td-icon-btn" @click="sessionShowMore = !sessionShowMore" :title="sessionShowMore ? '收起' : '更多条件'">
            <el-icon><ArrowUp v-if="sessionShowMore" /><ArrowDown v-else /></el-icon>
          </button>
          <div class="tdh-filter-right">
            <div class="tio-range-btns">
              <button class="tio-range-btn" :class="{ active: sessionIpVersion === 'v4' }" @click="sessionIpVersion = 'v4'">IPv4</button>
              <button class="tio-range-btn" :class="{ active: sessionIpVersion === 'v6' }" @click="sessionIpVersion = 'v6'">IPv6</button>
            </div>
            <button style="border:none;background:none;cursor:pointer;color:#409eff;font-size:13px;margin-left:8px" @click="doSessionExport">
              <el-icon><Download /></el-icon>
            </button>
            <button style="border:none;background:none;cursor:pointer;color:#409eff;font-size:13px" @click="doSessionFilter">
              <el-icon><Filter /></el-icon>
            </button>
          </div>
        </div>
      </div>

      <!-- 会话表格 -->
      <div class="ou-table-wrap" style="max-height:55vh">
        <table class="ou-table audit-table">
          <thead>
            <tr>
              <th style="width:40px"><input type="checkbox" v-model="sessionSelectAll" @change="toggleSessionSelectAll" /></th>
              <th>发送时间 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>MAC</th>
              <th>MAC厂商</th>
              <th>用户名称</th>
              <th>源IP</th>
              <th>目标IP</th>
              <th>目标地理位置</th>
              <th>应用协议</th>
              <th>请求方法</th>
              <th>状态码</th>
              <th>链路</th>
              <th>客户时延</th>
              <th style="width:120px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in sessionPageData" :key="idx">
              <td><input type="checkbox" v-model="row._selected" /></td>
              <td style="white-space:nowrap">{{ row.sendTime }}</td>
              <td style="font-size:12px">{{ row.mac }}</td>
              <td style="font-size:12px">{{ row.macVendor }}</td>
              <td>{{ row.userName }}</td>
              <td><span class="tid-link">{{ row.srcIp }}</span></td>
              <td><span class="tid-link">{{ row.dstIp }}</span></td>
              <td>
                <span class="geo-tag">
                  <span class="geo-flag">🇨🇳</span>
                  {{ row.geoLocation }}
                </span>
              </td>
              <td style="font-size:12px">{{ row.appProtocol }}</td>
              <td>
                <span class="method-tag" :class="'method-' + row.method.toLowerCase()">{{ row.method }}</span>
              </td>
              <td>
                <span class="status-code-tag" :class="getStatusCodeClass(row.statusCode)">{{ row.statusCode }}</span>
              </td>
              <td>{{ row.link }}</td>
              <td class="ou-num">{{ row.clientLatency }}</td>
              <td>
                <button class="link-btn" @click="openPacketPopup(row)">数据包</button>
                <button class="link-btn" style="margin-left:6px" @click="openLogDetailPopup(row)">日志详情</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="ou-footer">
        <div class="ou-footer-left">
          <div class="ou-pager">
            <button class="ou-page-btn" @click="sessionPage > 1 && sessionPage--">‹</button>
            <button v-for="p in sessionPages" :key="p" class="ou-page-btn" :class="{ active: p === sessionPage }" @click="sessionPage = p">{{ p }}</button>
            <button class="ou-page-btn" @click="sessionPage < sessionPages && sessionPage++">›</button>
            <span style="margin-left:8px;font-size:12px;color:#909399">到第</span>
            <input class="ou-page-goto-input" v-model.number="sessionGotoPage" style="width:36px;height:24px;text-align:center;border:1px solid #dcdfe6;border-radius:3px;font-size:12px" />
            <span style="font-size:12px;color:#909399">页</span>
            <button class="ou-page-goto-btn" @click="goToSessionPage" style="height:24px;padding:0 8px;border:1px solid #dcdfe6;border-radius:3px;background:#fff;font-size:12px;cursor:pointer">确定</button>
          </div>
        </div>
        <div class="ou-footer-right">
          <span>共 {{ sessionData.length }} 条</span>
          <label class="ou-page-size">
            <select v-model="sessionPageSize" style="height:24px;border:1px solid #dcdfe6;border-radius:3px;font-size:12px;padding:0 4px">
              <option :value="100">100 条/页</option>
            </select>
          </label>
        </div>
      </div>
    </el-dialog>

    <!-- ==================== 报文分析弹窗 ==================== -->
    <el-dialog
      v-model="packetPopupVisible"
      :title="'报文分析->' + packetPopupProtocol"
      width="95%"
      top="2vh"
      destroy-on-close
      class="hd-detail-dialog"
    >
      <!-- Tabs -->
      <div style="border-bottom:1px solid #e4e7ed;margin-bottom:12px">
        <button
          v-for="tab in packetTabs"
          :key="tab"
          class="nv-tab"
          :class="{ active: packetActiveTab === tab }"
          @click="packetActiveTab = tab"
          style="border:none;background:none;padding:8px 16px;cursor:pointer;font-size:13px;color:#606266;border-bottom:2px solid transparent"
        >{{ tab }}</button>
      </div>

      <!-- 顶部工具栏 -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:13px;color:#606266">应用协议: <strong>{{ packetPopupProtocol }}</strong></span>
          <button style="border:none;background:none;cursor:pointer;color:#409eff;font-size:13px;display:inline-flex;align-items:center;gap:4px">
            <el-icon><Download /></el-icon> 报文下载
          </button>
          <button style="border:none;background:none;cursor:pointer;color:#409eff;font-size:13px;display:inline-flex;align-items:center;gap:4px">
            <el-icon><Download /></el-icon> 内容下载
          </button>
        </div>
      </div>

      <!-- ========== 报文解析 Tab ========== -->
      <div v-if="packetActiveTab === '报文解析'">
        <!-- 过滤器 -->
        <div style="display:flex;gap:8px;margin-bottom:12px;align-items:center">
          <input class="ou-toolbar-input" v-model="packetFilterText" placeholder="报文显示过滤器" style="flex:1" />
          <select class="ou-toolbar-select" v-model="packetTopN" style="width:100px">
            <option value="100">TOP 100</option>
            <option value="200">TOP 200</option>
            <option value="500">TOP 500</option>
          </select>
        </div>

        <!-- 报文表格 -->
        <div class="ou-table-wrap" style="max-height:40vh">
          <table class="ou-table audit-table">
            <thead>
              <tr>
                <th class="col-idx">序号 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>时间 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>源地址 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>目标地址 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>网络协议 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>长度 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>详情 <el-icon class="sort-icon"><Sort /></el-icon></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, idx) in packetData"
                :key="idx"
                :style="{ background: row.bgColor || '' }"
                @click="packetExpandedRow = packetExpandedRow === idx ? -1 : idx"
                style="cursor:pointer"
              >
                <td class="col-idx">{{ row.idx }}</td>
                <td>{{ row.time }}</td>
                <td>{{ row.srcAddr }}</td>
                <td>{{ row.dstAddr }}</td>
                <td>{{ row.protocol }}</td>
                <td>{{ row.length }}</td>
                <td style="font-size:11px;max-width:400px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ row.detail }}</td>
              </tr>
              <tr v-if="packetExpandedRow >= 0" :key="'exp-' + packetExpandedRow">
                <td colspan="7" style="padding:8px 16px;background:#fafafa;font-size:12px;color:#606266">
                  <div v-for="(line, li) in packetExpandedLines" :key="li" style="margin-bottom:4px">
                    <span style="color:#409eff;cursor:pointer">▸</span> {{ line }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Hex dump -->
        <div style="margin-top:12px;background:#1e1e1e;color:#d4d4d4;padding:12px;font-family:monospace;font-size:12px;max-height:200px;overflow:auto">
          <div v-for="(line, li) in hexDumpLines" :key="li" style="display:flex;gap:16px">
            <span style="color:#858585;min-width:40px">{{ line.offset }}</span>
            <span style="color:#ce9178;min-width:200px">{{ line.hex }}</span>
            <span style="color:#d4d4d4">{{ line.ascii }}</span>
          </div>
        </div>
      </div>

      <!-- ========== 报文交互 Tab ========== -->
      <div v-else-if="packetActiveTab === '报文交互'">
        <!-- 连接信息 -->
        <div style="background:#f5f7fa;border:1px solid #e4e7ed;border-radius:4px;padding:16px;margin-bottom:16px">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div>
              <div style="display:flex;gap:16px;margin-bottom:8px">
                <span style="color:#909399;font-size:13px">连接时间</span>
                <span style="font-size:13px;color:#303133">2026-07-15 13:19:49 - 2026-07-15 13:20:50</span>
              </div>
              <div style="display:flex;gap:16px;margin-bottom:8px">
                <span style="color:#909399;font-size:13px">源MAC</span>
                <span style="font-size:13px;color:#303133">54:2b:de:6d:10:ae</span>
              </div>
              <div style="display:flex;gap:16px;margin-bottom:8px">
                <span style="color:#909399;font-size:13px">源IP:端口</span>
                <span style="font-size:13px;color:#303133">1.55.221.90:43423</span>
              </div>
              <div style="margin-top:8px;font-size:13px;color:#303133">
                <span style="color:#909399">源</span> Packets: 13 &nbsp; Bytes: 1816 &nbsp; Databytes: 950
              </div>
              <div style="margin-top:8px;font-size:13px;color:#303133">
                <span style="color:#909399">TCP Flags</span> &nbsp; SYN: 1, SYN_ACK: 0, ACK: 12, FIN: 0, PSH: 0, RST: 0, URG: 0
              </div>
            </div>
            <div>
              <div style="display:flex;gap:16px;margin-bottom:8px">
                <span style="color:#909399;font-size:13px">协议</span>
                <span style="font-size:13px;color:#303133">TCP</span>
              </div>
              <div style="display:flex;gap:16px;margin-bottom:8px">
                <span style="color:#909399;font-size:13px">目标MAC</span>
                <span style="font-size:13px;color:#303133">30:80:9b:8d:90:01</span>
              </div>
              <div style="display:flex;gap:16px;margin-bottom:8px">
                <span style="color:#909399;font-size:13px">目标IP:端口</span>
                <span style="font-size:13px;color:#303133">101.6.15.130:443</span>
              </div>
              <div style="margin-top:8px;font-size:13px;color:#303133">
                <span style="color:#909399">目</span> Packets: 0 &nbsp; Bytes: 0 &nbsp; Databytes: 0
              </div>
            </div>
          </div>
        </div>

        <!-- 交互过程 -->
        <div style="margin-bottom:12px">
          <h4 style="font-size:14px;font-weight:600;color:#303133;margin-bottom:12px">交互过程</h4>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
            <!-- Source -->
            <div>
              <h5 style="font-size:13px;font-weight:600;color:#303133;margin-bottom:8px">Source</h5>
              <div v-for="(block, bi) in interactionSourceBlocks" :key="'src-'+bi" style="background:#f5f7fa;border:1px solid #e4e7ed;border-radius:4px;padding:12px;margin-bottom:8px">
                <div style="display:flex;gap:16px;margin-bottom:8px">
                  <div style="flex:1">
                    <div style="font-family:monospace;font-size:11px;color:#606266;white-space:pre;line-height:1.6">{{ block.hex }}</div>
                  </div>
                  <div style="min-width:200px">
                    <div style="font-size:12px;color:#303133;margin-bottom:4px">Num: {{ block.num }}. {{ block.time }} {{ block.bytes }} bytes</div>
                    <div style="font-family:monospace;font-size:11px;color:#606266;white-space:pre;line-height:1.6">{{ block.ascii }}</div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Destination -->
            <div>
              <h5 style="font-size:13px;font-weight:600;color:#303133;margin-bottom:8px">Destination</h5>
              <div v-for="(block, bi) in interactionDstBlocks" :key="'dst-'+bi" style="background:#f5f7fa;border:1px solid #e4e7ed;border-radius:4px;padding:12px;margin-bottom:8px;min-height:60px">
                <div v-if="block" style="display:flex;gap:16px">
                  <div style="flex:1">
                    <div style="font-family:monospace;font-size:11px;color:#606266;white-space:pre;line-height:1.6">{{ block.hex }}</div>
                  </div>
                  <div style="min-width:200px">
                    <div style="font-size:12px;color:#303133;margin-bottom:4px">Num: {{ block.num }}. {{ block.time }} {{ block.bytes }} bytes</div>
                    <div style="font-family:monospace;font-size:11px;color:#606266;white-space:pre;line-height:1.6">{{ block.ascii }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div class="ou-footer" style="margin-top:12px">
          <div class="ou-footer-left">
            <div class="ou-pager">
              <button class="ou-page-btn" @click="interactionPage > 1 && interactionPage--">‹</button>
              <button class="ou-page-btn active">1</button>
              <button class="ou-page-btn" @click="interactionPage++">›</button>
              <span style="margin-left:8px;font-size:12px;color:#909399">到第</span>
              <input class="ou-page-goto-input" style="width:36px;height:24px;text-align:center;border:1px solid #dcdfe6;border-radius:3px;font-size:12px" />
              <span style="font-size:12px;color:#909399">页</span>
              <button class="ou-page-goto-btn" style="height:24px;padding:0 8px;border:1px solid #dcdfe6;border-radius:3px;background:#fff;font-size:12px;cursor:pointer">确定</button>
            </div>
          </div>
          <div class="ou-footer-right">
            <span>共 {{ interactionTotal }} 条</span>
            <label class="ou-page-size">
              <select style="height:24px;border:1px solid #dcdfe6;border-radius:3px;font-size:12px;padding:0 4px">
                <option :value="20">20 条/页</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      <!-- ========== 元数据 Tab ========== -->
      <div v-else-if="packetActiveTab === '元数据'">
        <div style="display:flex;gap:8px;margin-bottom:12px;align-items:center">
          <span style="font-size:13px;color:#606266">展示方式</span>
          <select class="ou-toolbar-select" v-model="metadataDisplayMode" style="width:120px">
            <option value="attribute">按属性</option>
          </select>
        </div>
        <div style="text-align:center;color:#c0c4cc;padding:80px 0;font-size:14px">无数据</div>
      </div>

      <!-- ========== 证书分析 Tab ========== -->
      <div v-else-if="packetActiveTab === '证书分析'">
        <div style="text-align:center;color:#c0c4cc;padding:80px 0;font-size:14px">无数据</div>
      </div>

      <!-- ========== 报文播放 Tab ========== -->
      <div v-else-if="packetActiveTab === '报文播放'">
        <!-- 播放选项 -->
        <div style="border:1px solid #e4e7ed;border-radius:4px;padding:16px;margin-bottom:16px">
          <h4 style="font-size:14px;font-weight:600;color:#303133;margin-bottom:16px">播放选项</h4>
          <div style="display:grid;grid-template-columns:120px 1fr;gap:8px 16px;align-items:center">
            <span style="font-size:13px;color:#606266">播放网卡</span>
            <select class="ou-toolbar-select" v-model="playNic" style="width:200px">
              <option value="igb1">igb1</option>
              <option value="igb2">igb2</option>
              <option value="eth0">eth0</option>
            </select>
            <span style="font-size:13px;color:#606266">播放次数</span>
            <div style="display:flex;align-items:center;gap:8px">
              <input class="ou-toolbar-input" v-model.number="playCount" type="number" style="width:80px" />
              <span style="font-size:13px;color:#606266">次</span>
            </div>
            <span style="font-size:13px;color:#606266">播放速度</span>
            <div style="display:flex;align-items:center;gap:4px">
              <span style="font-size:12px;color:#909399">1/8x</span>
              <span style="font-size:12px;color:#909399">1/4x</span>
              <span style="font-size:12px;color:#909399">1/2x</span>
              <span style="font-size:12px;color:#409eff;cursor:pointer" @click="playSpeed = '原速'">原速</span>
              <span style="font-size:12px;color:#909399">2x</span>
              <span style="font-size:12px;color:#909399">4x</span>
              <span style="font-size:12px;color:#909399">8x</span>
              <span style="font-size:12px;color:#909399">最高</span>
            </div>
          </div>
          <div style="margin-top:16px">
            <button style="background:#409eff;color:#fff;border:none;padding:8px 24px;border-radius:4px;cursor:pointer;font-size:13px;display:inline-flex;align-items:center;gap:4px" @click="startPlayback">
              <el-icon><VideoPlay /></el-icon> 开始
            </button>
          </div>
        </div>

        <!-- 播放信息 -->
        <div style="border:1px solid #e4e7ed;border-radius:4px;padding:16px">
          <h4 style="font-size:14px;font-weight:600;color:#303133;margin-bottom:16px">播放信息</h4>
          <table style="width:100%;font-size:13px">
            <tbody>
              <tr v-for="item in playInfoItems" :key="item.label">
                <td style="padding:6px 12px;color:#909399;width:120px">{{ item.label }}</td>
                <td style="padding:6px 12px;color:#303133">{{ item.value }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ========== 时序图 Tab ========== -->
      <div v-else-if="packetActiveTab === '时序图'">
        <!-- 时间差阈值 -->
        <div style="display:flex;gap:8px;margin-bottom:12px;align-items:center">
          <span style="font-size:13px;color:#606266">时间差阈值</span>
          <input class="ou-toolbar-input" v-model="timeGapThreshold" style="width:80px" />
          <span style="font-size:13px;color:#606266">毫秒</span>
          <button class="ou-search-btn" @click="doTimeGapSearch" style="padding:4px 12px">
            <el-icon><Search /></el-icon>
          </button>
        </div>

        <div style="display:grid;grid-template-columns:1fr 300px;gap:12px">
          <!-- 时序表格 -->
          <div class="ou-table-wrap" style="max-height:50vh">
            <table class="ou-table audit-table">
              <thead>
                <tr>
                  <th style="width:40px">序号</th>
                  <th>相对时间</th>
                  <th>时间差</th>
                  <th style="background:#e8f5e9">1.55.221.90:43423(客户端)</th>
                  <th style="background:#e3f2fd">101.6.15.130:443(服务端)</th>
                  <th>载荷长度</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in timelineData" :key="idx">
                  <td>{{ row.idx }}</td>
                  <td>{{ row.relTime }}</td>
                  <td>{{ row.timeGap }}</td>
                  <td :style="{ background: row.fromClient ? '#e8f5e9' : '' }" :colspan="row.fromClient ? 2 : 1">
                    <div v-if="row.fromClient" style="text-align:center">
                      <div style="font-size:12px;color:#303133">{{ row.label }}</div>
                      <div style="font-size:11px;color:#409eff">{{ row.seqInfo }}</div>
                    </div>
                  </td>
                  <td v-if="!row.fromClient" :style="{ background: '#e3f2fd' }">
                    <div style="text-align:center">
                      <div style="font-size:12px;color:#303133">{{ row.label }}</div>
                      <div style="font-size:11px;color:#409eff">{{ row.seqInfo }}</div>
                    </div>
                  </td>
                  <td v-if="row.payloadLen" style="text-align:center">
                    <div style="display:inline-block;background:#e0e0e0;padding:2px 8px;border-radius:3px;font-size:11px">载荷长度 = {{ row.payloadLen }}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 右侧协议树 + hex -->
          <div>
            <div style="font-size:12px;color:#606266;margin-bottom:8px">
              <div v-for="(line, li) in timelineProtocolTree" :key="li" style="margin-bottom:4px">
                <span style="color:#409eff;cursor:pointer">▸</span> {{ line }}
              </div>
            </div>
            <div style="background:#1e1e1e;color:#d4d4d4;padding:8px;font-family:monospace;font-size:11px;margin-top:12px;max-height:200px;overflow:auto">
              <div v-for="(line, li) in timelineHexDump" :key="li" style="display:flex;gap:8px">
                <span style="color:#858585;min-width:32px">{{ line.offset }}</span>
                <span style="color:#ce9178;min-width:160px">{{ line.hex }}</span>
                <span style="color:#d4d4d4">{{ line.ascii }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div class="ou-footer" style="margin-top:12px">
          <div class="ou-footer-left">
            <div class="ou-pager">
              <button class="ou-page-btn" @click="timelinePage > 1 && timelinePage--">‹</button>
              <button class="ou-page-btn active">1</button>
              <button class="ou-page-btn" @click="timelinePage++">›</button>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- ==================== 日志详情弹窗 ==================== -->
    <el-dialog
      v-model="logDetailVisible"
      title="日志详情"
      width="70%"
      top="10vh"
      destroy-on-close
      class="hd-detail-dialog"
    >
      <!-- 顶部信息 -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;padding:12px;background:#f5f7fa;border-radius:4px">
        <div style="display:flex;align-items:center;gap:8px">
          <div style="width:48px;height:48px;border-radius:50%;background:#fff;border:2px solid #e4e7ed;display:flex;align-items:center;justify-content:center">
            <el-icon style="font-size:24px;color:#409eff"><Monitor /></el-icon>
          </div>
          <div>
            <div style="font-size:12px;color:#909399">源IP:</div>
            <div style="font-size:14px;font-weight:600">{{ logDetailData.srcIp }}</div>
            <div style="font-size:12px;color:#909399">源端口: {{ logDetailData.srcPort }}</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:16px;font-weight:600;color:#409eff">{{ logDetailData.protocol }}</span>
          <el-icon style="font-size:20px;color:#409eff"><ArrowRight /></el-icon>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <div style="width:48px;height:48px;border-radius:50%;background:#fff;border:2px solid #e4e7ed;display:flex;align-items:center;justify-content:center">
            <el-icon style="font-size:24px;color:#67c23a"><Connection /></el-icon>
          </div>
          <div>
            <div style="font-size:12px;color:#909399">目标IP:</div>
            <div style="font-size:14px;font-weight:600">{{ logDetailData.dstIp }}</div>
            <div style="font-size:12px;color:#909399">目标端口: {{ logDetailData.dstPort }}</div>
          </div>
        </div>
      </div>

      <!-- 请求和响应 -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <!-- 请求 -->
        <div>
          <h4 style="margin:0 0 12px 0;padding-bottom:8px;border-bottom:1px solid #e4e7ed;color:#409eff">
            <el-icon style="margin-right:4px"><Upload /></el-icon> 请求
          </h4>
          <div style="margin-bottom:12px">
            <div style="font-size:12px;color:#909399;margin-bottom:4px">请求头</div>
            <pre style="background:#f5f7fa;padding:12px;border-radius:4px;font-size:12px;margin:0;white-space:pre-wrap;word-break:break-all">{{ logDetailData.requestHeaders }}</pre>
          </div>
          <div>
            <div style="font-size:12px;color:#909399;margin-bottom:4px">请求体</div>
            <div style="background:#f5f7fa;padding:12px;border-radius:4px;font-size:12px;min-height:60px;color:#c0c4cc">— 请求体 —</div>
          </div>
        </div>

        <!-- 响应 -->
        <div>
          <h4 style="margin:0 0 12px 0;padding-bottom:8px;border-bottom:1px solid #e4e7ed;color:#67c23a">
            <el-icon style="margin-right:4px"><Download /></el-icon> 响应
          </h4>
          <div style="margin-bottom:12px">
            <div style="font-size:12px;color:#909399;margin-bottom:4px">响应头</div>
            <pre style="background:#f5f7fa;padding:12px;border-radius:4px;font-size:12px;margin:0;white-space:pre-wrap;word-break:break-all">{{ logDetailData.responseHeaders }}</pre>
          </div>
          <div>
            <div style="font-size:12px;color:#909399;margin-bottom:4px">响应体</div>
            <div style="background:#f5f7fa;padding:12px;border-radius:4px;font-size:12px;min-height:60px;color:#c0c4cc">— 响应体 —</div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- ==================== URL统计弹窗 ==================== -->
    <el-dialog
      v-model="urlStatVisible"
      title="URL统计"
      width="95%"
      top="3vh"
      destroy-on-close
      class="hd-detail-dialog"
    >
      <div class="tdh-filters" style="background:#f5f7fa;border-radius:4px;margin-bottom:12px">
        <div class="tdh-filter-row">
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">源IP</span>
            <select class="ou-toolbar-select" v-model="urlStatFilter.srcIpType">
              <option value="any">任意IP</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">
              <el-icon><Filter /></el-icon> 过滤源
            </span>
            <select class="ou-toolbar-select" v-model="urlStatFilter.filterSrc">
              <option value="no">否</option>
              <option value="yes">是</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">源端口</span>
            <input class="ou-toolbar-input tdh-filter-input" v-model="urlStatFilter.srcPort" placeholder="80 / 8000-8080" />
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">目标IP</span>
            <select class="ou-toolbar-select" v-model="urlStatFilter.dstIpType2">
              <option value="any">任意IP</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">
              <el-icon><Filter /></el-icon> 过滤目标
            </span>
            <select class="ou-toolbar-select" v-model="urlStatFilter.filterDst">
              <option value="no">否</option>
              <option value="yes">是</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">目标端口</span>
            <input class="ou-toolbar-input tdh-filter-input" v-model="urlStatFilter.dstPort" placeholder="80 / 8000-8080" />
          </label>
        </div>
        <div class="tdh-filter-row">
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">MAC</span>
            <select class="ou-toolbar-select" v-model="urlStatFilter.mac">
              <option value="">任意</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">应用协议</span>
            <select class="ou-toolbar-select" v-model="urlStatFilter.appProtocol">
              <option value="">应用协议</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">客户时延>=</span>
            <input class="ou-toolbar-input tdh-filter-input" v-model="urlStatFilter.clientLatencyMin" placeholder="ms" style="width:80px" />
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">服务时延>=</span>
            <input class="ou-toolbar-input tdh-filter-input" v-model="urlStatFilter.serverLatencyMin" placeholder="ms" style="width:80px" />
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">应用时延>=</span>
            <input class="ou-toolbar-input tdh-filter-input" v-model="urlStatFilter.appLatencyMin" placeholder="ms" style="width:80px" />
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">请求方法</span>
            <select class="ou-toolbar-select" v-model="urlStatFilter.method">
              <option value="">任意</option>
            </select>
          </label>
        </div>
        <div class="tdh-filter-row">
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">域名</span>
            <select class="ou-toolbar-select" v-model="urlStatFilter.domain">
              <option value="">任意</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">用户组</span>
            <select class="ou-toolbar-select" v-model="urlStatFilter.userGroup">
              <option value="">任意</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">用户名称</span>
            <select class="ou-toolbar-select" v-model="urlStatFilter.userName">
              <option value="">任意</option>
            </select>
          </label>
          <label class="tdh-filter-field tdh-filter-time">
            <span class="ou-toolbar-label">时间范围</span>
            <input class="ou-toolbar-input tdh-time-range" v-model="urlStatFilter.timeRange" />
          </label>
          <button class="ou-search-btn">
            <el-icon><Search /></el-icon>
          </button>
          <button class="secondary td-reset-btn">重置</button>
          <button class="td-icon-btn" @click="urlStatShowMore = !urlStatShowMore">
            <el-icon><ArrowUp v-if="urlStatShowMore" /><ArrowDown v-else /></el-icon>
          </button>
          <div class="tdh-filter-right">
            <div class="tio-range-btns">
              <button class="tio-range-btn" :class="{ active: urlStatIpVersion === 'v4' }" @click="urlStatIpVersion = 'v4'">IPv4</button>
              <button class="tio-range-btn" :class="{ active: urlStatIpVersion === 'v6' }" @click="urlStatIpVersion = 'v6'">IPv6</button>
            </div>
            <button style="border:none;background:none;cursor:pointer;color:#409eff;font-size:13px;margin-left:8px">
              <el-icon><Download /></el-icon>
            </button>
          </div>
        </div>
      </div>

      <div class="ou-table-wrap" style="flex:1;min-height:0">
        <table class="ou-table audit-table">
          <thead>
            <tr>
              <th style="width:50px">序号</th>
              <th>域名</th>
              <th>URL</th>
              <th>访问次数 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>应用平均时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>HTTP20X <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>HTTP30X <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>HTTP40X <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>HTTP50X <el-icon class="sort-icon"><Sort /></el-icon></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in urlStatPageData" :key="idx">
              <td>{{ (urlStatPage - 1) * urlStatPageSize + idx + 1 }}</td>
              <td><span class="tid-link">{{ row.domain }}</span></td>
              <td style="font-size:12px;color:#606266;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" :title="row.url">{{ row.url }}</td>
              <td class="ou-num">{{ row.visitCount }}</td>
              <td class="ou-num">{{ row.avgLatency }} ms</td>
              <td class="ou-num">{{ row.http20x }}</td>
              <td class="ou-num">{{ row.http30x }}</td>
              <td class="ou-num">{{ row.http40x }}</td>
              <td class="ou-num">{{ row.http50x }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="ou-footer">
        <div class="ou-footer-left">
          <div class="ou-pager">
            <button class="ou-page-btn" @click="urlStatPage > 1 && urlStatPage--">‹</button>
            <button v-for="p in urlStatPages" :key="p" class="ou-page-btn" :class="{ active: p === urlStatPage }" @click="urlStatPage = p">{{ p }}</button>
            <button class="ou-page-btn" @click="urlStatPage < urlStatPages && urlStatPage++">›</button>
            <span style="margin-left:8px;font-size:12px;color:#909399">到第</span>
            <input class="ou-page-goto-input" v-model.number="urlStatGotoPage" style="width:36px;height:24px;text-align:center;border:1px solid #dcdfe6;border-radius:3px;font-size:12px" />
            <span style="font-size:12px;color:#909399">页</span>
            <button class="ou-page-goto-btn" @click="goToUrlStatPage" style="height:24px;padding:0 8px;border:1px solid #dcdfe6;border-radius:3px;background:#fff;font-size:12px;cursor:pointer">确定</button>
          </div>
        </div>
        <div class="ou-footer-right">
          <span>共 {{ urlStatData.length }} 条</span>
          <label class="ou-page-size">
            <select v-model="urlStatPageSize" style="height:24px;border:1px solid #dcdfe6;border-radius:3px;font-size:12px;padding:0 4px">
              <option :value="100">100 条/页</option>
            </select>
          </label>
        </div>
      </div>
    </el-dialog>

    <!-- ==================== 域名画像弹窗 ==================== -->
    <el-dialog
      v-model="domainProfileVisible"
      title="域名画像"
      width="95%"
      top="3vh"
      destroy-on-close
      class="hd-detail-dialog"
    >
      <div class="tdh-filters" style="background:#f5f7fa;border-radius:4px;margin-bottom:12px">
        <div class="tdh-filter-row">
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">源IP</span>
            <select class="ou-toolbar-select" v-model="domainProfileFilter.srcIpType">
              <option value="any">任意IP</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">源端口</span>
            <input class="ou-toolbar-input tdh-filter-input" v-model="domainProfileFilter.srcPort" placeholder="80 / 8000-8080" />
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">目标IP</span>
            <select class="ou-toolbar-select" v-model="domainProfileFilter.dstIpType">
              <option value="any">任意IP</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">目标端口</span>
            <input class="ou-toolbar-input tdh-filter-input" v-model="domainProfileFilter.dstPort" placeholder="80 / 8000-8080" />
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">请求域名</span>
            <select class="ou-toolbar-select" v-model="domainProfileFilter.domain">
              <option value="">任意</option>
            </select>
          </label>
        </div>
        <div class="tdh-filter-row">
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">源IP ISP</span>
            <select class="ou-toolbar-select" v-model="domainProfileFilter.srcIpIsp">
              <option value="any">任意</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">目标ISP</span>
            <select class="ou-toolbar-select" v-model="domainProfileFilter.dstIpIsp">
              <option value="any">任意</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">源IP区域</span>
            <select class="ou-toolbar-select" v-model="domainProfileFilter.srcIpRegion">
              <option value="any">任意</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">目标IP区域</span>
            <select class="ou-toolbar-select" v-model="domainProfileFilter.dstIpRegion">
              <option value="any">任意</option>
            </select>
          </label>
          <label class="tdh-filter-field tdh-filter-time">
            <span class="ou-toolbar-label">时间范围</span>
            <input class="ou-toolbar-input tdh-time-range" v-model="domainProfileFilter.timeRange" />
          </label>
          <button class="ou-search-btn">
            <el-icon><Search /></el-icon>
          </button>
          <button class="secondary td-reset-btn">重置</button>
          <div class="tdh-filter-right">
            <div class="tio-range-btns">
              <button class="tio-range-btn" :class="{ active: domainProfileIpVersion === 'v4' }" @click="domainProfileIpVersion = 'v4'">IPv4</button>
              <button class="tio-range-btn" :class="{ active: domainProfileIpVersion === 'v6' }" @click="domainProfileIpVersion = 'v6'">IPv6</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 6个图表 -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
        <div style="background:#fff;border:1px solid #ebeef5;border-radius:4px;padding:12px">
          <div style="font-size:13px;font-weight:600;margin-bottom:8px;color:#303133">访问最多用户</div>
          <v-chart :option="topUsersChartOption" autoresize style="width:100%;height:200px" />
        </div>
        <div style="background:#fff;border:1px solid #ebeef5;border-radius:4px;padding:12px">
          <div style="font-size:13px;font-weight:600;margin-bottom:8px;color:#303133">最多访问服务器</div>
          <v-chart :option="topServersChartOption" autoresize style="width:100%;height:200px" />
        </div>
        <div style="background:#fff;border:1px solid #ebeef5;border-radius:4px;padding:12px">
          <div style="font-size:13px;font-weight:600;margin-bottom:8px;color:#303133">最慢访问用户</div>
          <v-chart :option="slowUsersChartOption" autoresize style="width:100%;height:200px" />
        </div>
        <div style="background:#fff;border:1px solid #ebeef5;border-radius:4px;padding:12px">
          <div style="font-size:13px;font-weight:600;margin-bottom:8px;color:#303133">最慢访问服务器</div>
          <v-chart :option="slowServersChartOption" autoresize style="width:100%;height:200px" />
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
        <div style="background:#fff;border:1px solid #ebeef5;border-radius:4px;padding:12px">
          <div style="font-size:13px;font-weight:600;margin-bottom:8px;color:#303133">连接分布图</div>
          <v-chart :option="connDistChartOption" autoresize style="width:100%;height:250px" />
        </div>
        <div style="background:#fff;border:1px solid #ebeef5;border-radius:4px;padding:12px">
          <div style="font-size:13px;font-weight:600;margin-bottom:8px;color:#303133">连接趋势图</div>
          <v-chart :option="connTrendChartOption" autoresize style="width:100%;height:250px" />
        </div>
        <div style="background:#fff;border:1px solid #ebeef5;border-radius:4px;padding:12px">
          <div style="font-size:13px;font-weight:600;margin-bottom:8px;color:#303133">时延趋势图</div>
          <v-chart :option="latencyTrendChartOption" autoresize style="width:100%;height:250px" />
        </div>
      </div>
    </el-dialog>

    <!-- ==================== 会话诊断弹窗 ==================== -->
    <el-dialog
      v-model="domainSessionVisible"
      title="会话诊断"
      width="95%"
      top="3vh"
      destroy-on-close
      class="hd-detail-dialog"
    >
      <div class="tdh-filters" style="background:#f5f7fa;border-radius:4px;margin-bottom:12px">
        <div class="tdh-filter-row">
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">MAC</span>
            <select class="ou-toolbar-select" v-model="domainSessionFilter.mac">
              <option value="">任意</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">源IP</span>
            <select class="ou-toolbar-select" v-model="domainSessionFilter.srcIpType">
              <option value="any">任意IP</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">源端口</span>
            <input class="ou-toolbar-input tdh-filter-input" v-model="domainSessionFilter.srcPort" placeholder="80 / 8000-8080" />
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">目标IP</span>
            <select class="ou-toolbar-select" v-model="domainSessionFilter.dstIpType2">
              <option value="any">任意IP</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">目标端口</span>
            <input class="ou-toolbar-input tdh-filter-input" v-model="domainSessionFilter.dstPort" placeholder="80 / 8000-8080" />
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">请求域名</span>
            <select class="ou-toolbar-select" v-model="domainSessionFilter.domain">
              <option value="">任意</option>
            </select>
          </label>
        </div>
        <div class="tdh-filter-row">
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">源IP ISP</span>
            <select class="ou-toolbar-select" v-model="domainSessionFilter.srcIpIsp">
              <option value="any">任意</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">目标IP ISP</span>
            <select class="ou-toolbar-select" v-model="domainSessionFilter.dstIpIsp">
              <option value="any">任意</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">源IP区域</span>
            <select class="ou-toolbar-select" v-model="domainSessionFilter.srcIpRegion">
              <option value="any">任意</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">目标IP区域</span>
            <select class="ou-toolbar-select" v-model="domainSessionFilter.dstIpRegion">
              <option value="any">任意</option>
            </select>
          </label>
          <label class="tdh-filter-field tdh-filter-time">
            <span class="ou-toolbar-label">时间范围</span>
            <input class="ou-toolbar-input tdh-time-range" v-model="domainSessionFilter.timeRange" />
          </label>
          <button class="ou-search-btn">
            <el-icon><Search /></el-icon>
          </button>
          <button class="secondary td-reset-btn">重置</button>
          <div class="tdh-filter-right">
            <div class="tio-range-btns">
              <button class="tio-range-btn" :class="{ active: domainSessionIpVersion === 'v4' }" @click="domainSessionIpVersion = 'v4'">IPv4</button>
              <button class="tio-range-btn" :class="{ active: domainSessionIpVersion === 'v6' }" @click="domainSessionIpVersion = 'v6'">IPv6</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div style="display:grid;grid-template-columns:2fr 1fr;gap:12px;margin-bottom:12px">
        <div style="background:#fff;border:1px solid #ebeef5;border-radius:4px;padding:12px">
          <v-chart :option="dsAreaChartOption" autoresize style="width:100%;height:250px" />
        </div>
        <div style="background:#fff;border:1px solid #ebeef5;border-radius:4px;padding:12px">
          <v-chart :option="dsPieChartOption" autoresize style="width:100%;height:250px" />
        </div>
      </div>

      <!-- 三个表格 -->
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
        <!-- 源IP表 -->
        <div style="background:#fff;border:1px solid #ebeef5;border-radius:4px;padding:12px">
          <table class="ou-table audit-table" style="margin:0">
            <thead>
              <tr>
                <th style="width:40px">序号</th>
                <th>源IP</th>
                <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>失败数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>状态码</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in dsSrcIpData.slice((dsSrcPage-1)*dsSrcPageSize, dsSrcPage*dsSrcPageSize)" :key="idx">
                <td>{{ idx + 1 }}</td>
                <td><span class="tid-link">{{ row.ip }}</span></td>
                <td class="ou-num">{{ row.totalReq }}</td>
                <td class="ou-num">{{ row.failCount }}</td>
                <td>
                  <div style="display:flex;height:16px;border-radius:2px;overflow:hidden">
                    <div :style="{width:(row.s2xx/row.totalReq*100)+'%',background:'#67c23a'}"></div>
                    <div :style="{width:(row.s3xx/row.totalReq*100)+'%',background:'#e6a23c'}"></div>
                    <div :style="{width:(row.s4xx/row.totalReq*100)+'%',background:'#f56c6c'}"></div>
                    <div :style="{width:(row.s5xx/row.totalReq*100)+'%',background:'#909399'}"></div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="ou-footer" style="margin-top:8px">
            <div class="ou-pager">
              <button class="ou-page-btn" @click="dsSrcPage > 1 && dsSrcPage--">‹</button>
              <button class="ou-page-btn active">1</button>
              <button class="ou-page-btn" @click="dsSrcPage++">›</button>
            </div>
            <span style="font-size:12px;color:#909399">共 {{ dsSrcIpData.length }} 条</span>
          </div>
        </div>

        <!-- 目标IP表 -->
        <div style="background:#fff;border:1px solid #ebeef5;border-radius:4px;padding:12px">
          <table class="ou-table audit-table" style="margin:0">
            <thead>
              <tr>
                <th style="width:40px">序号</th>
                <th>目标IP</th>
                <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>失败数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>状态码</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in dsDstIpData.slice((dsDstPage-1)*dsDstPageSize, dsDstPage*dsDstPageSize)" :key="idx">
                <td>{{ idx + 1 }}</td>
                <td><span class="tid-link">{{ row.ip }}</span></td>
                <td class="ou-num">{{ row.totalReq }}</td>
                <td class="ou-num">{{ row.failCount }}</td>
                <td>
                  <div style="display:flex;height:16px;border-radius:2px;overflow:hidden">
                    <div :style="{width:(row.s2xx/row.totalReq*100)+'%',background:'#67c23a'}"></div>
                    <div :style="{width:(row.s3xx/row.totalReq*100)+'%',background:'#e6a23c'}"></div>
                    <div :style="{width:(row.s4xx/row.totalReq*100)+'%',background:'#f56c6c'}"></div>
                    <div :style="{width:(row.s5xx/row.totalReq*100)+'%',background:'#909399'}"></div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="ou-footer" style="margin-top:8px">
            <div class="ou-pager">
              <button class="ou-page-btn" @click="dsDstPage > 1 && dsDstPage--">‹</button>
              <button class="ou-page-btn active">1</button>
              <button class="ou-page-btn" @click="dsDstPage++">›</button>
            </div>
            <span style="font-size:12px;color:#909399">共 {{ dsDstIpData.length }} 条</span>
          </div>
        </div>

        <!-- 目标域名表 -->
        <div style="background:#fff;border:1px solid #ebeef5;border-radius:4px;padding:12px">
          <table class="ou-table audit-table" style="margin:0">
            <thead>
              <tr>
                <th style="width:40px">序号</th>
                <th>目标域名</th>
                <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>失败数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>状态码</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in dsDomainData.slice((dsDomainPage-1)*dsDomainPageSize, dsDomainPage*dsDomainPageSize)" :key="idx">
                <td>{{ idx + 1 }}</td>
                <td><span class="tid-link">{{ row.domain }}</span></td>
                <td class="ou-num">{{ row.totalReq }}</td>
                <td class="ou-num">{{ row.failCount }}</td>
                <td>
                  <div style="display:flex;height:16px;border-radius:2px;overflow:hidden">
                    <div :style="{width:(row.s2xx/row.totalReq*100)+'%',background:'#67c23a'}"></div>
                    <div :style="{width:(row.s3xx/row.totalReq*100)+'%',background:'#e6a23c'}"></div>
                    <div :style="{width:(row.s4xx/row.totalReq*100)+'%',background:'#f56c6c'}"></div>
                    <div :style="{width:(row.s5xx/row.totalReq*100)+'%',background:'#909399'}"></div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="ou-footer" style="margin-top:8px">
            <div class="ou-pager">
              <button class="ou-page-btn" @click="dsDomainPage > 1 && dsDomainPage--">‹</button>
              <button class="ou-page-btn active">1</button>
              <button class="ou-page-btn" @click="dsDomainPage++">›</button>
            </div>
            <span style="font-size:12px;color:#909399">共 {{ dsDomainData.length }} 条</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, PieChart, BarChart } from 'echarts/charts'
import {
  TitleComponent, TooltipComponent, LegendComponent, GridComponent
} from 'echarts/components'
import {
  Search, Download, Sort, Monitor, Connection, MapLocation,
  Filter, ArrowUp, ArrowDown, Close, FullScreen, Fold,
  ArrowRight, Upload, DataAnalysis, Picture
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import './nv-shared.css'

use([CanvasRenderer, LineChart, PieChart, BarChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent])

// ── Tabs ──
const tabs = [
  { key: 'diagnosis', label: 'HTTP诊断' },
  { key: 'overview', label: 'HTTP概况' },
  { key: 'sessions', label: 'HTTP会话' },
  { key: 'url-stats', label: 'URL统计' },
]
const activeTab = ref('diagnosis')

// ── 筛选条件 ──
const ipVersion = ref('v4')
const f = reactive({
  mac: '', srcIpType: 'any', srcIp: '', srcPort: '',
  dstIpType: 'any', dstPort: '', appProtocol: '',
  srcIsp: '', dstIsp: '', srcArea: '', dstArea: '',
  statusCode: '', method: '', domain: '', uri: '', agent: '',
  timeRange: '2026-07-13 14:07:03 - 2026-07-13 14:22:03'
})

function doSearch() { /* mock */ }
function resetFilters() {
  f.mac = ''; f.srcIpType = 'any'; f.srcIp = ''; f.srcPort = ''
  f.dstIpType = 'any'; f.dstPort = ''; f.appProtocol = ''
  f.srcIsp = ''; f.dstIsp = ''; f.srcArea = ''; f.dstArea = ''
  f.statusCode = ''; f.method = ''; f.domain = ''; f.uri = ''; f.agent = ''
}
function doExport() { ElMessage.info('导出功能（Mock）') }

// ── 趋势图数据 ──
const trendDates = ['14:07', '14:08', '14:09', '14:10', '14:11', '14:12', '14:13', '14:14', '14:15', '14:16', '14:17', '14:18', '14:19', '14:20', '14:21']
const http20x = [4200, 5800, 12500, 8200, 6100, 9800, 7200, 5400, 11200, 6800, 4900, 7600, 5200, 3800, 4500]
const http30x = [200, 350, 680, 420, 310, 520, 380, 290, 610, 370, 250, 410, 280, 190, 230]
const http40x = [80, 120, 250, 160, 110, 190, 140, 100, 220, 130, 90, 150, 100, 70, 85]
const http50x = [20, 35, 70, 45, 30, 55, 40, 28, 62, 38, 25, 42, 30, 20, 24]
const totalReq = http20x.map((v, i) => v + http30x[i] + http40x[i] + http50x[i])

const trendMax = Math.max(...totalReq).toLocaleString()
const trendMin = Math.min(...totalReq).toLocaleString()
const trendAvg = Math.round(totalReq.reduce((a, b) => a + b, 0) / totalReq.length).toLocaleString()

const trendOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { show: false },
  grid: { left: 50, right: 20, top: 10, bottom: 30 },
  xAxis: { type: 'category', data: trendDates, axisLine: { lineStyle: { color: '#e4e7ed' } }, axisLabel: { color: '#909399', fontSize: 11 } },
  yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: '#f0f2f5' } }, axisLabel: { color: '#909399', fontSize: 11, formatter: (v: number) => v >= 1000 ? (v / 1000) + 'k' : v } },
  series: [
    { name: 'HTTP20X', type: 'line', stack: 'total', areaStyle: { opacity: 0.6 }, itemStyle: { color: '#91cc75' }, showSymbol: false, smooth: true, data: http20x },
    { name: 'HTTP30X', type: 'line', stack: 'total', areaStyle: { opacity: 0.6 }, itemStyle: { color: '#fac858' }, showSymbol: false, smooth: true, data: http30x },
    { name: 'HTTP40X', type: 'line', stack: 'total', areaStyle: { opacity: 0.6 }, itemStyle: { color: '#a78bfa' }, showSymbol: false, smooth: true, data: http40x },
    { name: 'HTTP50X', type: 'line', stack: 'total', areaStyle: { opacity: 0.6 }, itemStyle: { color: '#f56c6c' }, showSymbol: false, smooth: true, data: http50x },
    { name: '总请求', type: 'line', itemStyle: { color: '#5470c6' }, showSymbol: false, smooth: true, data: totalReq },
  ]
}))

// ── 饼图数据 ─
const pieOption = computed(() => ({
  tooltip: { trigger: 'item', formatter: '{b}: {d}%' },
  legend: { orient: 'vertical', left: 'left', top: 'center', textStyle: { fontSize: 11, color: '#606266' } },
  series: [{
    type: 'pie', radius: ['30%', '65%'], center: ['60%', '50%'],
    label: { fontSize: 11, formatter: '{b} {d}%' },
    data: [
      { value: 67.4, name: 'HTTP20x', itemStyle: { color: '#91cc75' } },
      { value: 16.0, name: 'HTTP30x', itemStyle: { color: '#fac858' } },
      { value: 0.6, name: 'HTTP40x', itemStyle: { color: '#a78bfa' } },
      { value: 0.4, name: 'HTTP50x', itemStyle: { color: '#f56c6c' } },
    ]
  }]
}))

// ── 源IP数据 ──
interface TableRow {
  ip: string; totalReq: number; failCount: number;
  s2xx: number; s3xx: number; s4xx: number; s5xx: number;
}

const srcIpData = ref<TableRow[]>([
  { ip: '101.6.4.110', totalReq: 88128, failCount: 183, s2xx: 85000, s3xx: 2000, s4xx: 900, s5xx: 228 },
  { ip: '166.111.7.7', totalReq: 78702, failCount: 1362, s2xx: 75000, s3xx: 1500, s4xx: 1200, s5xx: 1002 },
  { ip: '166.111.7.6', totalReq: 70804, failCount: 1203, s2xx: 68000, s3xx: 1200, s4xx: 800, s5xx: 804 },
  { ip: '183.173.73.36', totalReq: 33895, failCount: 3, s2xx: 33500, s3xx: 300, s4xx: 92, s5xx: 3 },
  { ip: '101.6.8.80', totalReq: 17981, failCount: 26, s2xx: 17500, s3xx: 400, s4xx: 55, s5xx: 26 },
  { ip: '183.173.110.58', totalReq: 7559, failCount: 1, s2xx: 7400, s3xx: 150, s4xx: 8, s5xx: 1 },
  { ip: '60.173.232.227', totalReq: 6670, failCount: 19, s2xx: 6400, s3xx: 200, s4xx: 51, s5xx: 19 },
  { ip: '101.6.10.23', totalReq: 6058, failCount: 142, s2xx: 5700, s3xx: 150, s4xx: 66, s5xx: 142 },
  { ip: '166.111.5.88', totalReq: 6443, failCount: 4, s2xx: 6300, s3xx: 130, s4xx: 9, s5xx: 4 },
  { ip: '166.111.21.30', totalReq: 5338, failCount: 5, s2xx: 5200, s3xx: 120, s4xx: 13, s5xx: 5 },
  { ip: '101.6.8.2', totalReq: 3880, failCount: 15, s2xx: 3750, s3xx: 100, s4xx: 15, s5xx: 15 },
  { ip: '211.71.92.10', totalReq: 3522, failCount: 72, s2xx: 3350, s3xx: 80, s4xx: 20, s5xx: 72 },
  { ip: '101.6.210.2', totalReq: 3420, failCount: 13, s2xx: 3300, s3xx: 100, s4xx: 7, s5xx: 13 },
  { ip: '59.111.240.10', totalReq: 1870, failCount: 1, s2xx: 1830, s3xx: 35, s4xx: 4, s5xx: 1 },
  { ip: '166.111.174.167', totalReq: 1832, failCount: 1, s2xx: 1800, s3xx: 28, s4xx: 3, s5xx: 1 },
  { ip: '166.111.21.28', totalReq: 1647, failCount: 7, s2xx: 1600, s3xx: 35, s4xx: 5, s5xx: 7 },
  { ip: '124.112.191.82', totalReq: 1473, failCount: 6, s2xx: 1430, s3xx: 30, s4xx: 7, s5xx: 6 },
  { ip: '166.111.118.138', totalReq: 1528, failCount: 30, s2xx: 1460, s3xx: 30, s4xx: 8, s5xx: 30 },
  { ip: '166.111.247.232', totalReq: 1053, failCount: 0, s2xx: 1030, s3xx: 20, s4xx: 3, s5xx: 0 },
])

// ── 目标IP数据 ──
const dstIpData = ref<TableRow[]>([
  { ip: '161.6.15.130', totalReq: 202023, failCount: 138607, s2xx: 50000, s3xx: 10000, s4xx: 3416, s5xx: 138607 },
  { ip: '166.111.21.30', totalReq: 49850, failCount: 113, s2xx: 48500, s3xx: 1000, s4xx: 237, s5xx: 113 },
  { ip: '166.111.21.28', totalReq: 39178, failCount: 70, s2xx: 38200, s3xx: 800, s4xx: 108, s5xx: 70 },
  { ip: '101.6.9.106', totalReq: 33895, failCount: 3, s2xx: 33500, s3xx: 300, s4xx: 92, s5xx: 3 },
  { ip: '101.6.16.67', totalReq: 31140, failCount: 190, s2xx: 30000, s3xx: 800, s4xx: 150, s5xx: 190 },
  { ip: '101.6.15.68', totalReq: 27400, failCount: 508, s2xx: 26000, s3xx: 700, s4xx: 192, s5xx: 508 },
  { ip: '166.111.14.2', totalReq: 27367, failCount: 478, s2xx: 26000, s3xx: 700, s4xx: 189, s5xx: 478 },
  { ip: '101.6.15.70', totalReq: 26755, failCount: 1246, s2xx: 25000, s3xx: 400, s4xx: 109, s5xx: 1246 },
  { ip: '166.111.120.52', totalReq: 20861, failCount: 351, s2xx: 20000, s3xx: 400, s4xx: 110, s5xx: 351 },
  { ip: '47.93.18.203', totalReq: 17661, failCount: 28, s2xx: 17200, s3xx: 400, s4xx: 33, s5xx: 28 },
  { ip: '166.111.14.4', totalReq: 13334, failCount: 235, s2xx: 12800, s3xx: 250, s4xx: 49, s5xx: 235 },
  { ip: '101.6.4.100', totalReq: 9592, failCount: 85, s2xx: 9300, s3xx: 180, s4xx: 27, s5xx: 85 },
  { ip: '166.111.120.190', totalReq: 9580, failCount: 152, s2xx: 9200, s3xx: 180, s4xx: 48, s5xx: 152 },
  { ip: '101.6.16.86', totalReq: 7944, failCount: 230, s2xx: 7500, s3xx: 180, s4xx: 34, s5xx: 230 },
  { ip: '166.111.122.238', totalReq: 7537, failCount: 121, s2xx: 7250, s3xx: 140, s4xx: 25, s5xx: 121 },
  { ip: '166.111.120.183', totalReq: 7441, failCount: 130, s2xx: 7150, s3xx: 130, s4xx: 31, s5xx: 130 },
  { ip: '166.111.120.6', totalReq: 6469, failCount: 120, s2xx: 6200, s3xx: 120, s4xx: 29, s5xx: 120 },
  { ip: '162.140.198.236', totalReq: 6428, failCount: 4, s2xx: 6300, s3xx: 110, s4xx: 14, s5xx: 4 },
  { ip: '106.111.122.251', totalReq: 6133, failCount: 118, s2xx: 5850, s3xx: 130, s4xx: 35, s5xx: 118 },
])

// ── 目标域名数据 ──
const domainData = ref<(TableRow & { domain: string })[]>([
  { domain: 'mirrors.tuna.tsinghua.edu.cn', ip: '', totalReq: 191682, failCount: 130349, s2xx: 50000, s3xx: 8000, s4xx: 3333, s5xx: 130349 },
  { domain: 'webvpn.tsinghua.edu.cn', ip: '', totalReq: 88091, failCount: 184, s2xx: 86000, s3xx: 1500, s4xx: 407, s5xx: 184 },
  { domain: '101.6.109.91:80', ip: '', totalReq: 33895, failCount: 3, s2xx: 33500, s3xx: 300, s4xx: 92, s5xx: 3 },
  { domain: 'lib.tsinghua.edu.cn', ip: '', totalReq: 21143, failCount: 349, s2xx: 20200, s3xx: 450, s4xx: 144, s5xx: 349 },
  { domain: 'wafu.tsinghua.edu.cn', ip: '', totalReq: 16749, failCount: 328, s2xx: 16000, s3xx: 350, s4xx: 71, s5xx: 328 },
  { domain: '47.93.18.203:8000', ip: '', totalReq: 17661, failCount: 26, s2xx: 17200, s3xx: 400, s4xx: 35, s5xx: 26 },
  { domain: 'docured.tsinghua.edu.cn', ip: '', totalReq: 13377, failCount: 233, s2xx: 12800, s3xx: 280, s4xx: 64, s5xx: 233 },
  { domain: 'libsec.tsinghua.edu.cn', ip: '', totalReq: 11767, failCount: 225, s2xx: 11200, s3xx: 280, s4xx: 62, s5xx: 225 },
  { domain: 'pypi.tuna.tsinghua.edu.cn', ip: '', totalReq: 9847, failCount: 8378, s2xx: 1200, s3xx: 200, s4xx: 69, s5xx: 8378 },
  { domain: 'auth.tsinghua.edu.cn', ip: '', totalReq: 9544, failCount: 84, s2xx: 9250, s3xx: 180, s4xx: 30, s5xx: 84 },
  { domain: 'zhidao.baidu.com', ip: '', totalReq: 8552, failCount: 95, s2xx: 8250, s3xx: 170, s4xx: 37, s5xx: 95 },
  { domain: 'cas02.tsinghua.edu.cn', ip: '', totalReq: 7746, failCount: 134, s2xx: 7400, s3xx: 160, s4xx: 52, s5xx: 134 },
  { domain: 'wz.tsinghua.edu.cn', ip: '', totalReq: 7359, failCount: 0, s2xx: 7200, s3xx: 140, s4xx: 19, s5xx: 0 },
  { domain: 'liburl.lib.tsinghua.edu.cn', ip: '', totalReq: 6834, failCount: 130, s2xx: 6550, s3xx: 130, s4xx: 24, s5xx: 130 },
  { domain: 'moodle.lib.tsinghua.edu.cn', ip: '', totalReq: 6385, failCount: 107, s2xx: 6100, s3xx: 150, s4xx: 28, s5xx: 107 },
  { domain: 'eprss.lib.tsinghua.edu.cn', ip: '', totalReq: 5473, failCount: 120, s2xx: 5200, s3xx: 120, s4xx: 33, s5xx: 120 },
  { domain: '162.140.198.226:443', ip: '', totalReq: 6428, failCount: 4, s2xx: 6300, s3xx: 110, s4xx: 14, s5xx: 4 },
  { domain: 'discover.lib.tsinghua.edu.cn', ip: '', totalReq: 6134, failCount: 118, s2xx: 5850, s3xx: 130, s4xx: 36, s5xx: 118 },
  { domain: 'tuna.tsinghua.edu.cn', ip: '', totalReq: 5964, failCount: 93, s2xx: 5720, s3xx: 120, s4xx: 31, s5xx: 93 },
])

// ─ 分页 ──
const srcIpPage = ref(1); const srcIpPageSize = 20
const dstIpPage = ref(1); const dstIpPageSize = 20
const domainPage = ref(1); const domainPageSize = 20

const srcIpPages = computed(() => Math.max(1, Math.ceil(srcIpData.value.length / srcIpPageSize)))
const dstIpPages = computed(() => Math.max(1, Math.ceil(dstIpData.value.length / dstIpPageSize)))
const domainPages = computed(() => Math.max(1, Math.ceil(domainData.value.length / domainPageSize)))

const srcIpPageData = computed(() => srcIpData.value.slice((srcIpPage.value - 1) * srcIpPageSize, srcIpPage.value * srcIpPageSize))
const dstIpPageData = computed(() => dstIpData.value.slice((dstIpPage.value - 1) * dstIpPageSize, dstIpPage.value * dstIpPageSize))
const domainPageData = computed(() => domainData.value.slice((domainPage.value - 1) * domainPageSize, domainPage.value * domainPageSize))

// ── 排序 ──
let srcIpSortDir = 1; let srcReqSortDir = 1; let srcFailSortDir = 1
let dstIpSortDir = 1; let dstReqSortDir = 1; let dstFailSortDir = 1
let domainSortDir = 1; let domainReqSortDir = 1; let domainFailSortDir = 1

function sortSrcIp() { srcIpSortDir *= -1; srcIpData.value.sort((a, b) => srcIpSortDir * a.ip.localeCompare(b.ip)) }
function sortSrcReq() { srcReqSortDir *= -1; srcIpData.value.sort((a, b) => srcReqSortDir * (a.totalReq - b.totalReq)) }
function sortSrcFail() { srcFailSortDir *= -1; srcIpData.value.sort((a, b) => srcFailSortDir * (a.failCount - b.failCount)) }
function sortDstIp() { dstIpSortDir *= -1; dstIpData.value.sort((a, b) => dstIpSortDir * a.ip.localeCompare(b.ip)) }
function sortDstReq() { dstReqSortDir *= -1; dstIpData.value.sort((a, b) => dstReqSortDir * (a.totalReq - b.totalReq)) }
function sortDstFail() { dstFailSortDir *= -1; dstIpData.value.sort((a, b) => dstFailSortDir * (a.failCount - b.failCount)) }
function sortDomain() { domainSortDir *= -1; domainData.value.sort((a, b) => domainSortDir * a.domain.localeCompare(b.domain)) }
function sortDomainReq() { domainReqSortDir *= -1; domainData.value.sort((a, b) => domainReqSortDir * (a.totalReq - b.totalReq)) }
function sortDomainFail() { domainFailSortDir *= -1; domainData.value.sort((a, b) => domainFailSortDir * (a.failCount - b.failCount)) }

// ── 状态码条 ──
function getStatusBarStyle(row: TableRow) {
  const total = row.totalReq || 1
  const p2 = (row.s2xx / total) * 100
  const p3 = (row.s3xx / total) * 100
  const p4 = (row.s4xx / total) * 100
  const p5 = (row.s5xx / total) * 100
  return `background: linear-gradient(to right, #91cc75 0% ${p2}%, #fac858 ${p2}% ${p2 + p3}%, #a78bfa ${p2 + p3}% ${p2 + p3 + p4}%, #f56c6c ${p2 + p3 + p4}% 100%); height: 16px; border-radius: 2px;`
}

function truncateDomain(d: string) {
  return d.length > 22 ? d.slice(0, 22) + '...' : d
}

// ── 诊断详情弹窗 ──
const diagDetailVisible = ref(false)
const popIpVersion = ref('v4')

const popFilter = reactive({
  mac: '', srcIpType: 'any', srcPort: '',
  dstIpType: 'any', dstPort: '', appProtocol: '',
  srcIsp: '', dstIsp: '', srcArea: '', dstArea: '',
  statusCode: '', method: '', domain: '', uri: '', agent: '',
  cookie: '', timeRange: '2026-07-14 08:25:11 - 2026-07-14 08:40:11'
})

// 弹窗图表数据
const popDates = ['08:26', '08:27', '08:28', '08:29', '08:31', '08:33', '08:34', '08:36', '08:37', '08:39']
const popHttp20x = [1200, 1250, 1300, 1280, 1350, 1320, 1290, 1310, 1270, 1100]
const popHttp30x = [600, 620, 640, 630, 660, 650, 635, 645, 625, 500]
const popHttp40x = [50, 55, 60, 58, 62, 60, 57, 59, 56, 40]
const popTotal = popHttp20x.map((v, i) => v + popHttp30x[i] + popHttp40x[i])

const popTrendMax = Math.max(...popTotal).toLocaleString()
const popTrendMin = Math.min(...popTotal).toLocaleString()
const popTrendAvg = Math.round(popTotal.reduce((a, b) => a + b, 0) / popTotal.length).toLocaleString()

const popTrendOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { show: false },
  grid: { left: 50, right: 20, top: 10, bottom: 30 },
  xAxis: { type: 'category', data: popDates, axisLine: { lineStyle: { color: '#e4e7ed' } }, axisLabel: { color: '#909399', fontSize: 11 } },
  yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: '#f0f2f5' } }, axisLabel: { color: '#909399', fontSize: 11 } },
  series: [
    { name: 'HTTP20X', type: 'line', stack: 'total', areaStyle: { opacity: 0.6 }, itemStyle: { color: '#fac858' }, showSymbol: false, smooth: true, data: popHttp20x },
    { name: 'HTTP30X', type: 'line', stack: 'total', areaStyle: { opacity: 0.6 }, itemStyle: { color: '#a78bfa' }, showSymbol: false, smooth: true, data: popHttp30x },
    { name: 'HTTP40X', type: 'line', stack: 'total', areaStyle: { opacity: 0.6 }, itemStyle: { color: '#f56c6c' }, showSymbol: false, smooth: true, data: popHttp40x },
    { name: '总请求', type: 'line', itemStyle: { color: '#5470c6' }, showSymbol: false, smooth: true, data: popTotal },
  ]
}))

const popPieOption = computed(() => ({
  tooltip: { trigger: 'item', formatter: '{b}: {d}%' },
  legend: { orient: 'vertical', left: 'left', top: 'center', textStyle: { fontSize: 11, color: '#606266' } },
  series: [{
    type: 'pie', radius: ['30%', '65%'], center: ['60%', '50%'],
    label: { fontSize: 11, formatter: '{b} {d}%' },
    data: [
      { value: 66.7, name: 'HTTP30x', itemStyle: { color: '#fac858' } },
      { value: 33.3, name: 'HTTP40x', itemStyle: { color: '#a78bfa' } },
    ]
  }]
}))

// 弹窗表格数据
const popSrcIpData = ref<TableRow[]>([
  { ip: '166.111.7.8', totalReq: 13316, failCount: 13, s2xx: 0, s3xx: 8800, s4xx: 4503, s5xx: 13 },
  { ip: '166.111.7.7', totalReq: 13133, failCount: 51, s2xx: 0, s3xx: 8600, s4xx: 4482, s5xx: 51 },
])

const popDstIpData = ref<TableRow[]>([
  { ip: '166.111.120.253', totalReq: 26449, failCount: 64, s2xx: 0, s3xx: 17400, s4xx: 8985, s5xx: 64 },
])

const popDomainData = ref<(TableRow & { domain: string })[]>([
  { domain: 'tlinkproxy.lib.tsing...', ip: '', totalReq: 26449, failCount: 64, s2xx: 0, s3xx: 17400, s4xx: 8985, s5xx: 64 },
])

function openDiagDetail(_ip: string) {
  diagDetailVisible.value = true
}

function doPopSearch() { /* mock */ }
function resetPopFilters() {
  popFilter.mac = ''; popFilter.srcIpType = 'any'; popFilter.srcPort = ''
  popFilter.dstIpType = 'any'; popFilter.dstPort = ''; popFilter.appProtocol = ''
  popFilter.srcIsp = ''; popFilter.dstIsp = ''; popFilter.srcArea = ''; popFilter.dstArea = ''
  popFilter.statusCode = ''; popFilter.method = ''; popFilter.domain = ''
  popFilter.uri = ''; popFilter.agent = ''; popFilter.cookie = ''
}
function doPopExport() { ElMessage.info('导出功能（Mock）') }

// ── HTTP概况 Tab ──
const ovIpVersion = ref('v4')
const expandOvSrcTable = ref(false)
const expandOvDstTable = ref(false)

const ovFilter = reactive({
  mac: '', srcIpType: 'any', srcPort: '',
  dstIpType: 'any', dstPort: '', appProtocol: '',
  srcIsp: '', dstIsp: '', srcArea: '', dstArea: '',
  statusCode: '', method: '', domain: '', uri: '', agent: '',
  cookie: '', timeRange: '2026-07-14 08:33:16 - 2026-07-14 08:48:16'
})

function doOvSearch() { /* mock */ }
function resetOvFilters() {
  ovFilter.mac = ''; ovFilter.srcIpType = 'any'; ovFilter.srcPort = ''
  ovFilter.dstIpType = 'any'; ovFilter.dstPort = ''; ovFilter.appProtocol = ''
  ovFilter.srcIsp = ''; ovFilter.dstIsp = ''; ovFilter.srcArea = ''; ovFilter.dstArea = ''
  ovFilter.statusCode = ''; ovFilter.method = ''; ovFilter.domain = ''
  ovFilter.uri = ''; ovFilter.agent = ''; ovFilter.cookie = ''
}

// 前20源IP柱状图
const ovSrcIpLabels = ['166.111.7.8', '166.111.7.7', '166.111.7.6', '183.173.73.36', '101.6.8.80', '183.173.110.58', '60.173.232.227', '101.6.10.23', '166.111.5.88', '166.111.21.30', '101.6.8.2', '211.71.92.10', '101.6.210.2', '59.111.240.10', '166.111.174.167', '166.111.21.28', '124.112.191.82', '166.111.118.138', '166.111.247.232', '101.6.4.110']
const ovSrcIpValues = [76210, 76234, 53295, 9119, 6858, 6799, 6670, 6058, 6443, 5338, 3880, 3522, 3420, 1870, 1832, 1647, 1473, 1528, 1053, 88128]

const ovSrcBarOption = computed(() => ({
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  grid: { left: 80, right: 20, top: 10, bottom: 60 },
  xAxis: { type: 'category', data: ovSrcIpLabels, axisLabel: { color: '#909399', fontSize: 10, rotate: 45 } },
  yAxis: { type: 'value', axisLabel: { color: '#909399', fontSize: 11, formatter: (v: number) => v >= 1000 ? (v / 1000) + 'k' : v } },
  series: [{ type: 'bar', data: ovSrcIpValues, itemStyle: { color: '#5470c6' }, barWidth: '60%' }]
}))

// 前20目标IP柱状图
const ovDstIpLabels = ['101.6.15.130', '166.111.21.28', '166.111.120.253', '101.6.15.70', '101.6.15.67', '101.6.15.68', '166.111.21.30', '101.6.9.106', '166.111.14.2', '101.6.16.67', '47.93.18.203', '166.111.14.4', '101.6.4.100', '166.111.120.190', '101.6.16.86', '166.111.122.238', '166.111.120.183', '166.111.120.6', '162.140.198.236', '106.111.122.251']
const ovDstIpValues = [200789, 32298, 26814, 25089, 23915, 20097, 49850, 33895, 27367, 31140, 17661, 13334, 9592, 9580, 7944, 7537, 7441, 6469, 6428, 6133]

const ovDstBarOption = computed(() => ({
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  grid: { left: 80, right: 20, top: 10, bottom: 60 },
  xAxis: { type: 'category', data: ovDstIpLabels, axisLabel: { color: '#909399', fontSize: 10, rotate: 45 } },
  yAxis: { type: 'value', axisLabel: { color: '#909399', fontSize: 11, formatter: (v: number) => v >= 1000 ? (v / 1000) + 'k' : v } },
  series: [{ type: 'bar', data: ovDstIpValues, itemStyle: { color: '#5470c6' }, barWidth: '60%' }]
}))

// 源IP表格数据
const ovSrcIpData = ref<TableRow[]>([
  { ip: '166.111.7.8', totalReq: 76210, failCount: 0, s2xx: 0, s3xx: 0, s4xx: 0, s5xx: 0 },
  { ip: '166.111.7.7', totalReq: 76234, failCount: 0, s2xx: 0, s3xx: 0, s4xx: 0, s5xx: 0 },
  { ip: '166.111.7.6', totalReq: 53295, failCount: 0, s2xx: 0, s3xx: 0, s4xx: 0, s5xx: 0 },
  { ip: '183.173.73.36', totalReq: 9119, failCount: 0, s2xx: 0, s3xx: 0, s4xx: 0, s5xx: 0 },
  { ip: '101.6.8.80', totalReq: 6858, failCount: 0, s2xx: 0, s3xx: 0, s4xx: 0, s5xx: 0 },
  { ip: '183.173.110.58', totalReq: 6799, failCount: 0, s2xx: 0, s3xx: 0, s4xx: 0, s5xx: 0 },
  { ip: '60.173.232.227', totalReq: 6670, failCount: 0, s2xx: 0, s3xx: 0, s4xx: 0, s5xx: 0 },
  { ip: '101.6.10.23', totalReq: 6058, failCount: 0, s2xx: 0, s3xx: 0, s4xx: 0, s5xx: 0 },
  { ip: '166.111.5.88', totalReq: 6443, failCount: 0, s2xx: 0, s3xx: 0, s4xx: 0, s5xx: 0 },
  { ip: '166.111.21.30', totalReq: 5338, failCount: 0, s2xx: 0, s3xx: 0, s4xx: 0, s5xx: 0 },
  { ip: '101.6.8.2', totalReq: 3880, failCount: 0, s2xx: 0, s3xx: 0, s4xx: 0, s5xx: 0 },
  { ip: '211.71.92.10', totalReq: 3522, failCount: 0, s2xx: 0, s3xx: 0, s4xx: 0, s5xx: 0 },
  { ip: '101.6.210.2', totalReq: 3420, failCount: 0, s2xx: 0, s3xx: 0, s4xx: 0, s5xx: 0 },
  { ip: '59.111.240.10', totalReq: 1870, failCount: 0, s2xx: 0, s3xx: 0, s4xx: 0, s5xx: 0 },
  { ip: '166.111.174.167', totalReq: 1832, failCount: 0, s2xx: 0, s3xx: 0, s4xx: 0, s5xx: 0 },
  { ip: '166.111.21.28', totalReq: 1647, failCount: 0, s2xx: 0, s3xx: 0, s4xx: 0, s5xx: 0 },
  { ip: '124.112.191.82', totalReq: 1473, failCount: 0, s2xx: 0, s3xx: 0, s4xx: 0, s5xx: 0 },
  { ip: '166.111.118.138', totalReq: 1528, failCount: 0, s2xx: 0, s3xx: 0, s4xx: 0, s5xx: 0 },
  { ip: '166.111.247.232', totalReq: 1053, failCount: 0, s2xx: 0, s3xx: 0, s4xx: 0, s5xx: 0 },
  { ip: '101.6.4.110', totalReq: 88128, failCount: 0, s2xx: 0, s3xx: 0, s4xx: 0, s5xx: 0 },
])

// 目标IP表格数据
const ovDstIpData = ref<TableRow[]>([
  { ip: '101.6.15.130', totalReq: 200789, failCount: 0, s2xx: 0, s3xx: 0, s4xx: 0, s5xx: 0 },
  { ip: '166.111.21.28', totalReq: 32298, failCount: 0, s2xx: 0, s3xx: 0, s4xx: 0, s5xx: 0 },
  { ip: '166.111.120.253', totalReq: 26814, failCount: 0, s2xx: 0, s3xx: 0, s4xx: 0, s5xx: 0 },
  { ip: '101.6.15.70', totalReq: 25089, failCount: 0, s2xx: 0, s3xx: 0, s4xx: 0, s5xx: 0 },
  { ip: '101.6.15.67', totalReq: 23915, failCount: 0, s2xx: 0, s3xx: 0, s4xx: 0, s5xx: 0 },
  { ip: '101.6.15.68', totalReq: 20097, failCount: 0, s2xx: 0, s3xx: 0, s4xx: 0, s5xx: 0 },
  { ip: '166.111.21.30', totalReq: 49850, failCount: 0, s2xx: 0, s3xx: 0, s4xx: 0, s5xx: 0 },
  { ip: '101.6.9.106', totalReq: 33895, failCount: 0, s2xx: 0, s3xx: 0, s4xx: 0, s5xx: 0 },
  { ip: '166.111.14.2', totalReq: 27367, failCount: 0, s2xx: 0, s3xx: 0, s4xx: 0, s5xx: 0 },
  { ip: '101.6.16.67', totalReq: 31140, failCount: 0, s2xx: 0, s3xx: 0, s4xx: 0, s5xx: 0 },
  { ip: '47.93.18.203', totalReq: 17661, failCount: 0, s2xx: 0, s3xx: 0, s4xx: 0, s5xx: 0 },
  { ip: '166.111.14.4', totalReq: 13334, failCount: 0, s2xx: 0, s3xx: 0, s4xx: 0, s5xx: 0 },
  { ip: '101.6.4.100', totalReq: 9592, failCount: 0, s2xx: 0, s3xx: 0, s4xx: 0, s5xx: 0 },
  { ip: '166.111.120.190', totalReq: 9580, failCount: 0, s2xx: 0, s3xx: 0, s4xx: 0, s5xx: 0 },
  { ip: '101.6.16.86', totalReq: 7944, failCount: 0, s2xx: 0, s3xx: 0, s4xx: 0, s5xx: 0 },
  { ip: '166.111.122.238', totalReq: 7537, failCount: 0, s2xx: 0, s3xx: 0, s4xx: 0, s5xx: 0 },
  { ip: '166.111.120.183', totalReq: 7441, failCount: 0, s2xx: 0, s3xx: 0, s4xx: 0, s5xx: 0 },
  { ip: '166.111.120.6', totalReq: 6469, failCount: 0, s2xx: 0, s3xx: 0, s4xx: 0, s5xx: 0 },
  { ip: '162.140.198.236', totalReq: 6428, failCount: 0, s2xx: 0, s3xx: 0, s4xx: 0, s5xx: 0 },
  { ip: '106.111.122.251', totalReq: 6133, failCount: 0, s2xx: 0, s3xx: 0, s4xx: 0, s5xx: 0 },
])

// 分页
const ovSrcIpPage = ref(1); const ovSrcIpPageSize = 5
const ovDstIpPage = ref(1); const ovDstIpPageSize = 5

const ovSrcIpPages = computed(() => Math.max(1, Math.ceil(ovSrcIpData.value.length / ovSrcIpPageSize)))
const ovDstIpPages = computed(() => Math.max(1, Math.ceil(ovDstIpData.value.length / ovDstIpPageSize)))

const ovSrcIpPageData = computed(() => ovSrcIpData.value.slice((ovSrcIpPage.value - 1) * ovSrcIpPageSize, ovSrcIpPage.value * ovSrcIpPageSize))
const ovDstIpPageData = computed(() => ovDstIpData.value.slice((ovDstIpPage.value - 1) * ovDstIpPageSize, ovDstIpPage.value * ovDstIpPageSize))

// 排序
let ovSrcIpSortDir = 1; let ovSrcReqSortDir = 1
let ovDstIpSortDir = 1; let ovDstReqSortDir = 1

function sortOvSrcIp() { ovSrcIpSortDir *= -1; ovSrcIpData.value.sort((a, b) => ovSrcIpSortDir * a.ip.localeCompare(b.ip)) }
function sortOvSrcReq() { ovSrcReqSortDir *= -1; ovSrcIpData.value.sort((a, b) => ovSrcReqSortDir * (a.totalReq - b.totalReq)) }
function sortOvDstIp() { ovDstIpSortDir *= -1; ovDstIpData.value.sort((a, b) => ovDstIpSortDir * a.ip.localeCompare(b.ip)) }
function sortOvDstReq() { ovDstReqSortDir *= -1; ovDstIpData.value.sort((a, b) => ovDstReqSortDir * (a.totalReq - b.totalReq)) }

// ── HTTP会话弹窗 ─
const sessionPopupVisible = ref(false)
const sessionShowMore = ref(false)
const sessionIpVersion = ref('v4')
const sessionSelectAll = ref(false)
const sessionPage = ref(1)
const sessionPageSize = ref(100)
const sessionGotoPage = ref(1)

const sessionFilter = reactive({
  ip: '', filterSrc: 'no', srcPort: '',
  dstIpType: 'any', filterDst: 'no', dstPort: '',
  mac: '', appProtocol: '', clientLatencyMin: '',
  serverLatencyMin: '', appLatencyMin: '', method: '',
  domain: '', userGroup: '', userName: '',
  timeRange: '2026-07-14 08:33:16 - 2026-07-14 08:48:16'
})

interface SessionRow {
  _selected: boolean
  sendTime: string; mac: string; macVendor: string; userName: string
  srcIp: string; dstIp: string; geoLocation: string
  appProtocol: string; method: string; statusCode: number
  link: string; clientLatency: string
}

const sessionData = ref<SessionRow[]>([])

const sessionPages = computed(() => Math.max(1, Math.ceil(sessionData.value.length / sessionPageSize.value)))
const sessionPageData = computed(() => sessionData.value.slice((sessionPage.value - 1) * sessionPageSize.value, sessionPage.value * sessionPageSize.value))

function openSessionPopup(ip: string) {
  sessionFilter.ip = ip
  sessionPage.value = 1
  sessionData.value = generateSessionData(ip)
  sessionPopupVisible.value = true
}

function generateSessionData(ip: string): SessionRow[] {
  const rows: SessionRow[] = []
  const methods = ['GET', 'POST', 'GET', 'GET', 'GET', 'POST', 'GET', 'GET']
  const protocols = ['WWW', 'HTTP', 'HTTPS', 'WWW']
  const vendors = ['NewH3CTechno...', 'NewH3CTechno...', 'NewH3CTechno...']
  const statusCodes = [200, 304, 404, 500]
  for (let i = 0; i < 6858; i++) {
    const h = String(Math.floor(Math.random() * 24)).padStart(2, '0')
    const m = String(Math.floor(Math.random() * 60)).padStart(2, '0')
    const s = String(Math.floor(Math.random() * 60)).padStart(2, '0')
    rows.push({
      _selected: false,
      sendTime: `2026-07-14 08:${m}:${s}`,
      mac: '54-2b-de-6d-10-ae',
      macVendor: vendors[i % vendors.length],
      userName: '—',
      srcIp: `${ip}:${33088 + (i % 100)}`,
      dstIp: '101.6.15.130:80',
      geoLocation: '北京:BGP',
      appProtocol: protocols[i % protocols.length],
      method: methods[i % methods.length],
      statusCode: statusCodes[i % statusCodes.length],
      link: '0',
      clientLatency: `${(70 + Math.random() * 10).toFixed(3)} ms`
    })
  }
  return rows.slice(0, 500)
}

function doSessionSearch() { /* mock */ }
function resetSessionFilters() {
  sessionFilter.filterSrc = 'no'; sessionFilter.srcPort = ''
  sessionFilter.dstIpType = 'any'; sessionFilter.filterDst = 'no'; sessionFilter.dstPort = ''
  sessionFilter.mac = ''; sessionFilter.appProtocol = ''
  sessionFilter.clientLatencyMin = ''; sessionFilter.serverLatencyMin = ''; sessionFilter.appLatencyMin = ''
  sessionFilter.method = ''; sessionFilter.domain = ''
  sessionFilter.userGroup = ''; sessionFilter.userName = ''
}
function toggleSessionSelectAll() { sessionData.value.forEach(r => { r._selected = sessionSelectAll.value }) }
function goToSessionPage() {
  const p = sessionGotoPage.value
  if (p >= 1 && p <= sessionPages.value) sessionPage.value = p
}
function doSessionExport() { ElMessage.info('导出功能（Mock）') }
function doSessionFilter() { ElMessage.info('筛选功能（Mock）') }

function getStatusCodeClass(code: number) {
  if (code >= 200 && code < 300) return 'status-2xx'
  if (code >= 300 && code < 400) return 'status-3xx'
  if (code >= 400 && code < 500) return 'status-4xx'
  return 'status-5xx'
}

// ── 报文分析弹窗 ──
const packetPopupVisible = ref(false)
const packetPopupProtocol = ref('WWW')
const packetActiveTab = ref('报文解析')
const packetFilterText = ref('')
const packetTopN = ref('100')
const packetExpandedRow = ref(-1)

const packetTabs = ['报文解析', '报文交互', '元数据', '证书分析', '报文播放', '时序图']

interface PacketRow {
  idx: number; time: string; srcAddr: string; dstAddr: string
  protocol: string; length: number; detail: string; bgColor?: string
}

const packetData = ref<PacketRow[]>([
  { idx: 1, time: '0.000000', srcAddr: '60.13.232.227', dstAddr: '101.6.15.130', protocol: 'TCP', length: 74, detail: '33088 --> 80 [SYN] Seq=0 Win=64240 Len=0 MSS=1460 SACK_PERM=1 TSval=1320261984 TSecr=0 WS=128', bgColor: '#e8f5e9' },
  { idx: 2, time: '0.000134', srcAddr: '101.6.15.130', dstAddr: '60.13.232.227', protocol: 'TCP', length: 74, detail: '80 --> 33088 [SYN, ACK] Seq=0 Ack=1 Win=65160 Len=0 MSS=1460 SACK_PERM=1 TSval=874234692 TSecr=1320261984 WS=128', bgColor: '#e8f5e9' },
  { idx: 3, time: '0.077682', srcAddr: '60.13.232.227', dstAddr: '101.6.15.130', protocol: 'TCP', length: 66, detail: '33088 --> 80 [ACK] Seq=1 Ack=1 Win=64256 Len=0 TSval=1320262062 TSecr=874234692', bgColor: '#e8f5e9' },
  { idx: 4, time: '0.121501', srcAddr: '60.13.232.227', dstAddr: '101.6.15.130', protocol: 'HTTP', length: 297, detail: 'GET /ubuntu/dists/jammy/InRelease HTTP/1.1', bgColor: '#fff3e0' },
  { idx: 5, time: '0.121858', srcAddr: '101.6.15.130', dstAddr: '60.13.232.227', protocol: 'TCP', length: 66, detail: '80 --> 33088 [ACK] Seq=1 Ack=232 Win=65024 Len=0 TSval=874234813 TSecr=1320262106', bgColor: '#e8f5e9' },
  { idx: 6, time: '0.122268', srcAddr: '101.6.15.130', dstAddr: '60.13.232.227', protocol: 'HTTP', length: 323, detail: 'HTTP/1.1 304 Not Modified', bgColor: '#fff3e0' },
])

const packetExpandedLines = [
  'Frame 1: 74 bytes on wire (592 bits), 74 bytes captured (592 bits)',
  'Ethernet II, Src: 54:2b:de:6d:10:ae (54:2b:de:6d:10:ae), Dst: 30:80:9b:8d:90:01 (30:80:9b:8d:90:01)',
  'Internet Protocol Version 4, Src: 60.13.232.227, Dst: 101.6.15.130',
  'Transmission Control Protocol, Src Port: 33088, Dst Port: 80, Seq: 0, Len: 0'
]

const hexDumpLines = [
  { offset: '0000', hex: '30 80 9b 8d  90 01 54 2b  de 6d 10 ae  08 00 45 00', ascii: '0.....T+..m...E.' },
  { offset: '0010', hex: '00 3c d1 ce  40 00 33 06  dc 74 3c 0d  e8 e3 65 06', ascii: '.<..@.3..t<...e.' },
  { offset: '0020', hex: '0f 82 81 40  00 50 4d 11  ef 23 00 00  00 00 a0 02', ascii: '...@.PM..#......' },
  { offset: '0030', hex: 'fa f0 0d bf  00 00 02 04  05 b4 04 02  08 0a 4e b1', ascii: '............N.' },
  { offset: '0040', hex: '99 60 00 00  00 00 01 03  03 07', ascii: '.`.........' },
]

function openPacketPopup(row: SessionRow) {
  packetPopupProtocol.value = row.appProtocol
  packetExpandedRow.value = -1
  packetPopupVisible.value = true
}

// ── 日志详情弹窗 ──
const logDetailVisible = ref(false)

interface LogDetailData {
  srcIp: string; srcPort: string; dstIp: string; dstPort: string
  protocol: string; requestHeaders: string; responseHeaders: string
}

const logDetailData = ref<LogDetailData>({
  srcIp: '60.13.232.227',
  srcPort: '33088',
  dstIp: '101.6.15.130',
  dstPort: '80',
  protocol: 'WWW',
  requestHeaders: 'GET /ubuntu/dists/jammy/InRelease HTTP/1.1\nHost: mirrors.tuna.tsinghua.edu.cn\nCache-Control: max-age=0\nAccept: text/*\nIf-Modified-Since: Thu, 21 Apr 2022 17:16:39 GMT\nUser-Agent: Debian APT-HTTP/1.3 (2.4.8) non-interactive',
  responseHeaders: 'HTTP/1.1 304 Not Modified\nServer: nginx/1.22.1\nDate: Tue, 14 Jul 2026 00:33:30 GMT\nLast-Modified: Thu, 21 Apr 2022 17:16:39 GMT\nConnection: keep-alive\nETag: "62619177-41f07"\nStrict-Transport-Security: max-age=31536000'
})

function openLogDetailPopup(row: SessionRow) {
  logDetailData.value = {
    srcIp: row.srcIp.split(':')[0],
    srcPort: row.srcIp.split(':')[1] || '0',
    dstIp: row.dstIp.split(':')[0],
    dstPort: row.dstIp.split(':')[1] || '80',
    protocol: row.appProtocol,
    requestHeaders: `GET /ubuntu/dists/jammy/InRelease HTTP/1.1\nHost: mirrors.tuna.tsinghua.edu.cn\nCache-Control: max-age=0\nAccept: text/*\nIf-Modified-Since: Thu, 21 Apr 2022 17:16:39 GMT\nUser-Agent: Debian APT-HTTP/1.3 (2.4.8) non-interactive`,
    responseHeaders: `HTTP/1.1 304 Not Modified\nServer: nginx/1.22.1\nDate: Tue, 14 Jul 2026 00:33:30 GMT\nLast-Modified: Thu, 21 Apr 2022 17:16:39 GMT\nConnection: keep-alive\nETag: "62619177-41f07"\nStrict-Transport-Security: max-age=31536000`
  }
  logDetailVisible.value = true
}

// ── HTTP会话 Tab ──
const sessIpVersion = ref('v4')
const sessShowMore = ref(false)
const sessSelectAll = ref(false)
const sessPage = ref(1)
const sessPageSize = ref(100)
const sessGotoPage = ref(1)

const sessFilter = reactive({
  srcIpType: 'any', dstIpType: 'any', filterSrc: 'no', srcPort: '',
  dstIpType2: 'any', filterDst: 'no', dstPort: '',
  mac: '', appProtocol: '', clientLatencyMin: '',
  serverLatencyMin: '', appLatencyMin: '', method: '',
  domain: '', userGroup: '', userName: '',
  timeRange: '2026-07-14 08:57:14 - 2026-07-14 09:12:14'
})

interface SessRow {
  _selected: boolean
  sendTime: string; mac: string; macVendor: string; userName: string
  srcIp: string; dstIp: string; geoLocation: string
  appProtocol: string; method: string; statusCode: number
  link: string; clientLatency: string; serverLatency: string; appLatency: string
  infoSummary: string
}

const sessData = ref<SessRow[]>([])

const sessPages = computed(() => Math.max(1, Math.ceil(sessData.value.length / sessPageSize.value)))
const sessPageData = computed(() => sessData.value.slice((sessPage.value - 1) * sessPageSize.value, sessPage.value * sessPageSize.value))

function generateSessData(): SessRow[] {
  const rows: SessRow[] = []
  const baseTime = new Date('2026-07-14T08:58:00')
  for (let i = 0; i < 625745; i++) {
    const time = new Date(baseTime.getTime() + i * 1000)
    const h = String(time.getHours()).padStart(2, '0')
    const m = String(time.getMinutes()).padStart(2, '0')
    const s = String(time.getSeconds()).padStart(2, '0')
    const port = 37406 + (i % 100)
    const clientLat = (70 + Math.random() * 10).toFixed(3)
    const serverLat = (0.1 + Math.random() * 0.3).toFixed(3)
    const appLat = (0.3 + Math.random() * 3).toFixed(3)
    rows.push({
      _selected: false,
      sendTime: `2026-07-14 ${h}:${m}:${s}`,
      mac: '54-2b-de-6d-10-ae',
      macVendor: 'NewH3CTechno...',
      userName: '—',
      srcIp: `60.13.232.227:${port}`,
      dstIp: '101.6.15.130:80',
      geoLocation: '北京:BGP',
      appProtocol: 'WWW',
      method: 'GET',
      statusCode: 304,
      link: '0',
      clientLatency: `${clientLat} ms`,
      serverLatency: `${serverLat} ms`,
      appLatency: `${appLat} ms`,
      infoSummary: `Host: mirrors.tuna.tsinghua...\nURL: /ubuntu/dists/jammy/...\nAgent: Debian APT-HTTP/...`
    })
    if (i >= 500) break // 只生成前500条用于展示
  }
  return rows
}

// 初始化会话数据
sessData.value = generateSessData()

function doSessSearch() { /* mock */ }
function resetSessFilters() {
  sessFilter.srcIpType = 'any'; sessFilter.dstIpType = 'any'; sessFilter.filterSrc = 'no'; sessFilter.srcPort = ''
  sessFilter.dstIpType2 = 'any'; sessFilter.filterDst = 'no'; sessFilter.dstPort = ''
  sessFilter.mac = ''; sessFilter.appProtocol = ''
  sessFilter.clientLatencyMin = ''; sessFilter.serverLatencyMin = ''; sessFilter.appLatencyMin = ''
  sessFilter.method = ''; sessFilter.domain = ''
  sessFilter.userGroup = ''; sessFilter.userName = ''
}
function toggleSessSelectAll() { sessData.value.forEach(r => { r._selected = sessSelectAll.value }) }
function goToSessPage() {
  const p = sessGotoPage.value
  if (p >= 1 && p <= sessPages.value) sessPage.value = p
}
function doSessExport() { ElMessage.info('导出功能（Mock）') }

// ── URL统计 Tab ──
const urlIpVersion = ref('v4')
const urlShowMore = ref(false)
const urlPage = ref(1)
const urlPageSize = ref(100)
const urlGotoPage = ref(1)

const urlFilter = reactive({
  srcIpType: 'any', dstIpType: 'any', filterSrc: 'no', srcPort: '',
  dstIpType2: 'any', filterDst: 'no', dstPort: '',
  mac: '', appProtocol: '', clientLatencyMin: '',
  serverLatencyMin: '', appLatencyMin: '', method: '',
  domain: '', userGroup: '', userName: '',
  timeRange: '2026-07-14 08:23 - 2026-07-14 09:23'
})

// 右键菜单
const urlContextMenuVisible = ref(false)
const urlContextMenuX = ref(0)
const urlContextMenuY = ref(0)
const urlContextMenuRow = ref<UrlRow | null>(null)

interface UrlRow {
  domain: string; url: string; visitCount: number; avgLatency: number
  http20x: number; http30x: number; http40x: number; http50x: number
}

const urlData = ref<UrlRow[]>([
  { domain: 'mirrors.tuna.tsinghua.edu.cn', url: '/debian/pool/main/a/avahi/libavahi-core7_0.8-5%2bdeb11u1_amd64.deb', visitCount: 110195, avgLatency: 6, http20x: 1, http30x: 0, http40x: 17319, http50x: 0 },
  { domain: 'mirrors.tuna.tsinghua.edu.cn', url: '/debian/pool/main/a/avahi/avahi-daemon_0.8-5%2bdeb11u1_amd64.deb', visitCount: 18837, avgLatency: 33, http20x: 0, http30x: 0, http40x: 16822, http50x: 0 },
  { domain: '47.93.10.203:8020', url: '/debian/extras/arial.ttf', visitCount: 14533, avgLatency: 45, http20x: 14531, http30x: 0, http40x: 2, http50x: 0 },
  { domain: 'tbs.med.tsinghua.edu.cn', url: '/api/oa/config/submit_d838E7a_d8d3568-531-4f0-tar.gz', visitCount: 12988, avgLatency: 0, http20x: 2, http30x: 12058, http40x: 0, http50x: 0 },
  { domain: 'pypr.tuna.tsinghua.edu.cn', url: '/', visitCount: 8658, avgLatency: 1, http20x: 0, http30x: 1213, http40x: 1, http50x: 0 },
  { domain: 'mirrors.tuna.tsinghua.edu.cn', url: '/ubuntu/dists/jammy/InRelease', visitCount: 8550, avgLatency: 8, http20x: 25, http30x: 2724, http40x: 15, http50x: 0 },
  { domain: 'tlinkproxy.lib.tsinghua.edu.cn', url: '/groonga', visitCount: 8516, avgLatency: 121, http20x: 2, http30x: 0, http40x: 5604, http50x: 0 },
  { domain: 'tlinkproxy.lib.tsinghua.edu.cn', url: '/kibana4f3/configure/byid/8fa8-4ee6-knowroposed/configuration', visitCount: 8517, avgLatency: 139, http20x: 0, http30x: 8403, http40x: 0, http50x: 0 },
  { domain: 'tlinkproxy.lib.tsinghua.edu.cn', url: '/go', visitCount: 8516, avgLatency: 144, http20x: 1, http30x: 8410, http40x: 1, http50x: 0 },
  { domain: '101.6.9.234:8004', url: '/heartbeat', visitCount: 4395, avgLatency: 144, http20x: 4392, http30x: 0, http40x: 0, http50x: 1 },
  { domain: 'mirrors.tuna.tsinghua.edu.cn', url: '/centos/7.9.2009/updates/x86_64/repodata/repomd.xml', visitCount: 3605, avgLatency: 14, http20x: 0, http30x: 0, http40x: 522, http50x: 0 },
  { domain: 'mirrors.tuna.tsinghua.edu.cn', url: '/centos/7.9.2009/extras/x86_64/repodata/repomd.xml', visitCount: 3394, avgLatency: 2, http20x: 0, http30x: 0, http40x: 458, http50x: 0 },
  { domain: 'fa-online.tsinghua.edu.cn', url: '/zjgl/faq/faq13/faq13.do', visitCount: 3395, avgLatency: 255, http20x: 3278, http30x: 54, http40x: 0, http50x: 0 },
  { domain: '101.6.9.106:8180', url: '/fapi/product/issue_service/notice/topic/1.png', visitCount: 3242, avgLatency: 33, http20x: 0, http30x: 0, http40x: 3242, http50x: 0 },
  { domain: 'mirrors.tuna.tsinghua.edu.cn', url: '/ubuntu/dists/jammy/InRelease', visitCount: 3120, avgLatency: 3, http20x: 78, http30x: 614, http40x: 22, http50x: 0 },
  { domain: 'auth4.tsinghua.edu.cn', url: '/cgi-bin/net_user_info', visitCount: 3075, avgLatency: 1, http20x: 3029, http30x: 0, http40x: 0, http50x: 0 },
  { domain: 'mirrors.tuna.tsinghua.edu.cn', url: '/centos/7.9.2009/extras/x86_64/repodata/repomd.xml', visitCount: 3020, avgLatency: 8, http20x: 0, http30x: 0, http40x: 414, http50x: 0 },
  { domain: '166.111.14.193', url: '/YCRHc9t6dcpjg', visitCount: 2767, avgLatency: 40, http20x: 2757, http30x: 0, http40x: 0, http50x: 0 },
  { domain: 'mirrors.tuna.tsinghua.edu.cn', url: '/ubuntu/dists/focal/InRelease', visitCount: 2702, avgLatency: 2, http20x: 22, http30x: 436, http40x: 2, http50x: 0 },
  { domain: 'webvpn.tsinghua.edu.cn', url: '/login', visitCount: 2474, avgLatency: 220, http20x: 27, http30x: 2446, http40x: 1, http50x: 0 },
  { domain: '47.93.10.203:8020', url: '/debian/extras/arial.ttf', visitCount: 2202, avgLatency: 27, http20x: 2203, http30x: 0, http40x: 0, http50x: 0 },
  { domain: 'mirrors.tuna.tsinghua.edu.cn', url: '/ubuntu/dists/jammy-updates/InRelease', visitCount: 2215, avgLatency: 16, http20x: 497, http30x: 1579, http40x: 29, http50x: 0 },
  { domain: 'mirrors.tuna.tsinghua.edu.cn', url: '/ubuntu/dists/jammy-backports/InRelease', visitCount: 2132, avgLatency: 20, http20x: 469, http30x: 1561, http40x: 12, http50x: 0 },
  { domain: '166.111.14.203:8080', url: '/YCRH_TEST/libvol/aje', visitCount: 2015, avgLatency: 36, http20x: 2015, http30x: 0, http40x: 0, http50x: 0 },
  { domain: 'www.tsinghua.edu.cn', url: '/', visitCount: 1942, avgLatency: 0, http20x: 2, http30x: 1921, http40x: 0, http50x: 0 },
  { domain: 'webvpn.tsinghua.edu.cn', url: '/https/77294787015e697274f6f6f562637374214e4f4e6d69247b5f6700f0f1b69fe', visitCount: 1839, avgLatency: 261, http20x: 1630, http30x: 7, http40x: 1, http50x: 0 },
  { domain: 'fa-online.tsinghua.edu.cn', url: '/zjgl/faq/faq13/faq13time.do', visitCount: 1797, avgLatency: 329, http20x: 1770, http30x: 0, http40x: 0, http50x: 0 },
  { domain: 'icpr.tsinghua.edu.cn:1697', url: '/device/online', visitCount: 1518, avgLatency: 4, http20x: 1503, http30x: 0, http40x: 0, http50x: 0 },
  { domain: 'faculty.dsec.tsinghua.edu.cn', url: '/system/resource/teacher/skill.jpg', visitCount: 1481, avgLatency: 70, http20x: 1460, http30x: 0, http40x: 0, http50x: 0 },
])

const urlPages = computed(() => Math.max(1, Math.ceil(urlData.value.length / urlPageSize.value)))
const urlPageData = computed(() => urlData.value.slice((urlPage.value - 1) * urlPageSize.value, urlPage.value * urlPageSize.value))

function doUrlSearch() { /* mock */ }
function resetUrlFilters() {
  urlFilter.srcIpType = 'any'; urlFilter.dstIpType = 'any'; urlFilter.filterSrc = 'no'; urlFilter.srcPort = ''
  urlFilter.dstIpType2 = 'any'; urlFilter.filterDst = 'no'; urlFilter.dstPort = ''
  urlFilter.mac = ''; urlFilter.appProtocol = ''
  urlFilter.clientLatencyMin = ''; urlFilter.serverLatencyMin = ''; urlFilter.appLatencyMin = ''
  urlFilter.method = ''; urlFilter.domain = ''
  urlFilter.userGroup = ''; urlFilter.userName = ''
}
function goToUrlPage() {
  const p = urlGotoPage.value
  if (p >= 1 && p <= urlPages.value) urlPage.value = p
}
function doUrlExport() { ElMessage.info('导出功能（Mock）') }

// 右键菜单
function showUrlContextMenu(e: MouseEvent, row: UrlRow) {
  urlContextMenuVisible.value = true
  urlContextMenuX.value = e.clientX
  urlContextMenuY.value = e.clientY
  urlContextMenuRow.value = row
}
function hideUrlContextMenu() { urlContextMenuVisible.value = false }

// ─ URL统计弹窗（与主页面表格一致）──
const urlStatVisible = ref(false)
const urlStatFilter = reactive({
  srcIpType: 'any', dstIpType: 'any', filterSrc: 'no', srcPort: '',
  dstIpType2: 'any', filterDst: 'no', dstPort: '',
  mac: '', appProtocol: '', clientLatencyMin: '',
  serverLatencyMin: '', appLatencyMin: '', method: '',
  domain: '', userGroup: '', userName: '',
  timeRange: '2026-07-14 08:23 - 2026-07-14 09:23'
})
const urlStatIpVersion = ref('v4')
const urlStatShowMore = ref(false)
const urlStatPage = ref(1)
const urlStatPageSize = ref(100)
const urlStatGotoPage = ref(1)
const urlStatData = ref<UrlRow[]>([])
const urlStatPages = computed(() => Math.max(1, Math.ceil(urlStatData.value.length / urlStatPageSize.value)))
const urlStatPageData = computed(() => urlStatData.value.slice((urlStatPage.value - 1) * urlStatPageSize.value, urlStatPage.value * urlStatPageSize.value))

function openUrlStatPopup(row: UrlRow) {
  hideUrlContextMenu()
  urlStatFilter.domain = row.domain
  urlStatData.value = urlData.value.filter(d => d.domain === row.domain)
  urlStatPage.value = 1
  urlStatVisible.value = true
}
function goToUrlStatPage() {
  const p = urlStatGotoPage.value
  if (p >= 1 && p <= urlStatPages.value) urlStatPage.value = p
}

// ── 域名画像弹窗 ──
const domainProfileVisible = ref(false)
const domainProfileFilter = reactive({
  srcIpType: 'any', srcPort: '', dstIpType: 'any', dstPort: '',
  requestMethod: '', domain: '', srcIpIsp: 'any', dstIpIsp: 'any',
  srcIpRegion: 'any', dstIpRegion: 'any',
  timeRange: '2026-07-14 09:08:23 - 2026-07-14 09:23:23'
})
const domainProfileIpVersion = ref('v4')

// 域名画像 - 访问最多用户
const topUsersChartRef = ref<InstanceType<typeof VChart> | null>(null)
const topUsersChartOption = ref({
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: ['166.111.7.7', '166.111.7.8', '122.237.166.190'], axisLabel: { rotate: 30, fontSize: 10 } },
  yAxis: { type: 'value', name: '访问次数' },
  series: [{ type: 'bar', data: [11000, 10500, 0], itemStyle: { color: '#5b8ff9' } }]
})

// 域名画像 - 最多访问服务器
const topServersChartRef = ref<InstanceType<typeof VChart> | null>(null)
const topServersChartOption = ref({
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: ['101.6.15.130', '101.6.15.70'], axisLabel: { rotate: 30, fontSize: 10 } },
  yAxis: { type: 'value', name: '访问次数' },
  series: [{ type: 'bar', data: [23000, 10000], itemStyle: { color: '#5b8ff9' } }]
})

// 域名画像 - 最慢访问用户
const slowUsersChartRef = ref<InstanceType<typeof VChart> | null>(null)
const slowUsersChartOption = ref({
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: ['166.111.7.7', '166.111.7.8', '122.237.166.190'], axisLabel: { rotate: 30, fontSize: 10 } },
  yAxis: { type: 'value', name: '时延(s)' },
  series: [{ type: 'bar', data: [1.1, 1.05, 0.1], itemStyle: { color: '#5b8ff9' } }]
})

// 域名画像 - 最慢访问服务器
const slowServersChartRef = ref<InstanceType<typeof VChart> | null>(null)
const slowServersChartOption = ref({
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: ['101.6.110.253', '101.6.15.70'], axisLabel: { rotate: 30, fontSize: 10 } },
  yAxis: { type: 'value', name: '时延(s)' },
  series: [{ type: 'bar', data: [1.1, 0.15], itemStyle: { color: '#5b8ff9' } }]
})

// 域名画像 - 连接分布图
const connDistChartRef = ref<InstanceType<typeof VChart> | null>(null)
const connDistChartOption = ref({
  tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
  legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { fontSize: 11 } },
  series: [{
    type: 'pie', radius: ['40%', '70%'],
    data: [
      { value: 0, name: 'DNS (0.00%)', itemStyle: { color: '#91cc75' } },
      { value: 0, name: 'HTTPS (0.00%)', itemStyle: { color: '#5470c6' } },
      { value: 0, name: 'HTTP20x (66.40%)', itemStyle: { color: '#fac858' } },
      { value: 0, name: 'HTTP30x (33.60%)', itemStyle: { color: '#ee6666' } },
      { value: 0, name: 'HTTP50x (0.00%)', itemStyle: { color: '#73c0de' } },
    ]
  }]
})

// 域名画像 - 连接趋势图
const connTrendChartRef = ref<InstanceType<typeof VChart> | null>(null)
const connTrendChartOption = ref({
  tooltip: { trigger: 'axis' },
  legend: { data: ['DNS', 'HTTPS', 'HTTP20X', 'HTTP30X', 'HTTP50X'], textStyle: { fontSize: 10 } },
  xAxis: { type: 'category', data: ['09:08', '09:09', '09:10', '09:11', '09:12', '09:13', '09:14', '09:15', '09:16', '09:17', '09:18', '09:19', '09:20', '09:21', '09:22', '09:23'] },
  yAxis: { type: 'value', name: 'Session数' },
  series: [
    { name: 'DNS', type: 'line', stack: 'total', areaStyle: {}, data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], itemStyle: { color: '#91cc75' } },
    { name: 'HTTPS', type: 'line', stack: 'total', areaStyle: {}, data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], itemStyle: { color: '#5470c6' } },
    { name: 'HTTP20X', type: 'line', stack: 'total', areaStyle: {}, data: [1200,1300,1400,1500,1600,1700,1650,1600,1550,1500,1450,1400,1350,1300,1250,1200], itemStyle: { color: '#fac858' } },
    { name: 'HTTP30X', type: 'line', stack: 'total', areaStyle: {}, data: [400,450,500,550,600,650,620,600,580,560,540,520,500,480,460,440], itemStyle: { color: '#ee6666' } },
    { name: 'HTTP50X', type: 'line', stack: 'total', areaStyle: {}, data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], itemStyle: { color: '#73c0de' } },
  ]
})

// 域名画像 - 时延趋势图
const latencyTrendChartRef = ref<InstanceType<typeof VChart> | null>(null)
const latencyTrendChartOption = ref({
  tooltip: { trigger: 'axis' },
  legend: { data: ['DNS时延', '平均HTTP时延'], textStyle: { fontSize: 10 } },
  xAxis: { type: 'category', data: ['09:08', '09:09', '09:10', '09:11', '09:12', '09:13', '09:14', '09:15', '09:16', '09:17', '09:18', '09:19', '09:20', '09:21', '09:22', '09:23'] },
  yAxis: { type: 'value', name: '毫秒' },
  series: [
    { name: 'DNS时延', type: 'line', data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], itemStyle: { color: '#5b8ff9' } },
    { name: '平均HTTP时延', type: 'line', data: [1.0,1.0,1.0,1.0,1.0,1.0,0.1,0.1,0.1,1.0,1.0,1.0,1.0,0.1,0.1,0.1], itemStyle: { color: '#fac858' } },
  ]
})

function openDomainProfilePopup(row: UrlRow) {
  hideUrlContextMenu()
  domainProfileFilter.domain = row.domain
  domainProfileVisible.value = true
}

// ── 会话诊断弹窗（复用HTTP诊断弹窗结构）──
const domainSessionVisible = ref(false)
const domainSessionFilter = reactive({
  srcIpType: 'any', dstIpType: 'any', filterSrc: 'no', srcPort: '',
  dstIpType2: 'any', filterDst: 'no', dstPort: '',
  mac: '', appProtocol: '', clientLatencyMin: '',
  serverLatencyMin: '', appLatencyMin: '', method: '',
  domain: '', srcIpIsp: 'any', dstIpIsp: 'any',
  srcIpRegion: 'any', dstIpRegion: '', uri: '', agent: '', cookie: '',
  timeRange: '2026-07-14 09:08:23 - 2026-07-14 09:23:23'
})
const domainSessionIpVersion = ref('v4')

// 会话诊断 - 图表
const dsAreaChartRef = ref<InstanceType<typeof VChart> | null>(null)
const dsAreaChartOption = ref({
  tooltip: { trigger: 'axis' },
  legend: { data: ['HTTP20X', 'HTTP30X', 'HTTP40X', 'HTTP50X', '总请求'], textStyle: { fontSize: 10 } },
  xAxis: { type: 'category', data: ['09:08', '09:09', '09:10', '09:11', '09:12', '09:13', '09:14', '09:15', '09:16', '09:17', '09:18', '09:19', '09:20', '09:21', '09:22', '09:23'] },
  yAxis: { type: 'value', name: '次数' },
  series: [
    { name: 'HTTP20X', type: 'line', stack: 'total', areaStyle: {}, data: [12000,12500,13000,13500,14000,14500,14200,14000,13800,13500,13200,13000,12800,12500,12200,5000], itemStyle: { color: '#fac858' } },
    { name: 'HTTP30X', type: 'line', stack: 'total', areaStyle: {}, data: [4000,4200,4400,4600,4800,5000,4800,4600,4400,4200,4000,3800,3600,3400,3200,1500], itemStyle: { color: '#9b59b6' } },
    { name: 'HTTP40X', type: 'line', stack: 'total', areaStyle: {}, data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], itemStyle: { color: '#e74c3c' } },
    { name: 'HTTP50X', type: 'line', stack: 'total', areaStyle: {}, data: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], itemStyle: { color: '#e67e22' } },
    { name: '总请求', type: 'line', data: [16000,16700,17400,18100,18800,19500,19000,18600,18200,17700,17200,16800,16400,15900,15400,6500], itemStyle: { color: '#5b8ff9' }, lineStyle: { width: 2 } },
  ]
})
const dsPieChartRef = ref<InstanceType<typeof VChart> | null>(null)
const dsPieChartOption = ref({
  tooltip: { trigger: 'item', formatter: '{b}: {d}%' },
  series: [{
    type: 'pie', radius: ['40%', '70%'],
    data: [
      { value: 0, name: 'HTTP50x 0.0%', itemStyle: { color: '#e67e22' } },
      { value: 0, name: 'HTTP40x 0.0%', itemStyle: { color: '#e74c3c' } },
      { value: 54.4, name: 'HTTP20x 54.4%', itemStyle: { color: '#fac858' } },
      { value: 45.6, name: 'HTTP30x 45.6%', itemStyle: { color: '#9b59b6' } },
    ]
  }]
})

// 会话诊断 - 表格数据
const dsSrcIpData = ref([
  { ip: '60.13.232.227', totalReq: 5822, failCount: 23, s2xx: 5500, s3xx: 200, s4xx: 99, s5xx: 23 },
  { ip: '59.111.240.10', totalReq: 1889, failCount: 0, s2xx: 1800, s3xx: 50, s4xx: 39, s5xx: 0 },
  { ip: '124.112.181.82', totalReq: 1207, failCount: 3, s2xx: 1150, s3xx: 30, s4xx: 24, s5xx: 3 },
  { ip: '111.198.60.197', totalReq: 906, failCount: 2, s2xx: 860, s3xx: 25, s4xx: 19, s5xx: 2 },
  { ip: '218.247.215.240', totalReq: 640, failCount: 6, s2xx: 600, s3xx: 20, s4xx: 14, s5xx: 6 },
  { ip: '116.147.251.75', totalReq: 515, failCount: 3, s2xx: 490, s3xx: 12, s4xx: 10, s5xx: 3 },
])
const dsDstIpData = ref([
  { ip: '101.6.15.130', totalReq: 203865, failCount: 136974, s2xx: 50000, s3xx: 16000, s4xx: 1200, s5xx: 974 },
])
const dsDomainData = ref([
  { domain: 'mirrors.tuna.tsing...', totalReq: 203865, failCount: 136974, s2xx: 50000, s3xx: 16000, s4xx: 1200, s5xx: 974 },
])
const dsSrcPage = ref(1); const dsSrcPageSize = ref(100)
const dsDstPage = ref(1); const dsDstPageSize = ref(100)
const dsDomainPage = ref(1); const dsDomainPageSize = ref(100)

function openDomainSessionPopup(row: UrlRow) {
  hideUrlContextMenu()
  domainSessionFilter.domain = row.domain
  domainSessionVisible.value = true
}
</script>

<style scoped>
/* 图表网格 */
.hd-chart-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 12px;
  padding: 12px;
  background: #f5f7fa;
}

/* 三列表格网格 */
.hd-table-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  padding: 12px;
  background: #f5f7fa;
  flex: 1;
  min-height: 0;
}

/* 概况面板网格 */
.ov-panel-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 12px;
  background: #f5f7fa;
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.ov-chart-body {
  padding: 8px;
  background: #fff;
  border-radius: 4px;
}

/* 排序图标 */
.sort-icon {
  cursor: pointer;
  font-size: 12px;
  color: #c0c4cc;
  vertical-align: middle;
  margin-left: 2px;
}
.sort-icon:hover {
  color: #409eff;
}

/* 状态码条 */
.status-bar {
  width: 100%;
  min-width: 60px;
}

/* 筛选右侧 */
.tdh-filter-right {
  display: flex;
  align-items: center;
  margin-left: auto;
  gap: 8px;
}

/* 地理位置标签 */
.geo-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}
.geo-flag {
  font-size: 14px;
}

/* 请求方法标签 */
.method-tag {
  display: inline-block;
  padding: 1px 6px;
  border-radius: 2px;
  font-size: 11px;
  font-weight: 600;
}
.method-get { background: #f0f9eb; color: #67c23a; }
.method-post { background: #ecf5ff; color: #409eff; }
.method-put { background: #fdf6ec; color: #e6a23c; }
.method-delete { background: #fef0f0; color: #f56c6c; }

/* 状态码标签 */
.status-code-tag {
  display: inline-block;
  padding: 1px 6px;
  border-radius: 2px;
  font-size: 12px;
  font-weight: 600;
}
.status-2xx { background: #f0f9eb; color: #67c23a; }
.status-3xx { background: #fdf6ec; color: #e6a23c; }
.status-4xx { background: #fef0f0; color: #f56c6c; }
.status-5xx { background: #fef0f0; color: #f56c6c; }

/* 链接按钮 */
.link-btn {
  background: none;
  border: none;
  color: #409eff;
  cursor: pointer;
  font-size: 12px;
  padding: 0;
}
.link-btn:hover {
  text-decoration: underline;
}

/* 审计概况样式 */
.audit-scroll { flex: 1; min-height: 0; overflow: auto; display: flex; flex-direction: column; gap: 12px; padding: 12px; }
.audit-kpi-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; }
.audit-kpi { background: #fff; border: 1px solid #e4e7ed; border-radius: 4px; padding: 14px; text-align: center; }
.audit-kpi-label { font-size: 12px; color: #909399; }
.audit-kpi-value { font-size: 20px; font-weight: 600; color: #303133; margin-top: 4px; }
.audit-mini-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 12px; }
.audit-table th, .audit-table td { font-size: 12px; padding: 6px 8px; }
.audit-table { min-width: 1200px; }

/* 详情弹窗 */
:deep(.hd-detail-dialog .el-dialog__body) {
  padding: 12px 20px;
}

/* 右键菜单 */
.url-context-menu {
  position: fixed;
  z-index: 9999;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  padding: 4px 0;
  min-width: 140px;
}
.url-context-item {
  padding: 8px 16px;
  font-size: 13px;
  color: #303133;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}
.url-context-item:hover {
  background: #f5f7fa;
  color: #409eff;
}
.url-context-item .el-icon {
  font-size: 14px;
}
</style>
