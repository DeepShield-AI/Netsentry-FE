<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav" role="tablist" aria-label="域名概况">
        <button type="button" class="nv-tab" :class="{ active: activeTab === 'realtime' }" role="tab" @click="activeTab = 'realtime'">实时请求</button>
        <button type="button" class="nv-tab" :class="{ active: activeTab === 'history' }" role="tab" @click="activeTab = 'history'">历史请求</button>
        <button type="button" class="nv-tab" :class="{ active: activeTab === 'overview' }" role="tab" @click="activeTab = 'overview'">域名概况</button>
        <button type="button" class="nv-tab" :class="{ active: activeTab === 'trend' }" role="tab" @click="activeTab = 'trend'">域名趋势</button>
      </div>
    </div>
    <div class="nv-tabs-body">
      <!-- 实时请求 Tab -->
      <div v-show="activeTab === 'realtime'" class="to-dashboard-scroll">
        <div class="to-dashboard">
          <div class="to-chart-row">
            <div class="to-chart-panel to-chart-panel-full" data-chart="filter-domain-realtime">
              <!-- 过滤条件 -->
              <div class="to-filter-container">
                <div class="to-filter-row-simple">
                  <label class="to-filter-item">
                    <span class="to-filter-label">自动刷新</span>
                    <select class="to-filter-select" v-model="refreshInterval">
                      <option value="0">不刷新</option>
                      <option value="10">10秒</option>
                      <option value="30">30秒</option>
                      <option value="60">1分钟</option>
                    </select>
                  </label>

                  <label class="to-filter-item">
                    <span class="to-filter-label">IP类型</span>
                    <select class="to-filter-select" v-model="ipType">
                      <option value="all">所有类型</option>
                      <option value="ipv4">IPv4</option>
                      <option value="ipv6">IPv6</option>
                    </select>
                  </label>

                  <label class="to-filter-item">
                    <span class="to-filter-label">源IP</span>
                    <select class="to-filter-select" v-model="sourceIpFilter">
                      <option value="any">任意IP</option>
                      <option value="internal">内网IP</option>
                      <option value="external">外网IP</option>
                    </select>
                  </label>

                  <label class="to-filter-item">
                    <span class="to-filter-label">目标端口</span>
                    <select class="to-filter-select" v-model="portFilter">
                      <option value="any">所有端口</option>
                      <option value="80">80 (HTTP)</option>
                      <option value="443">443 (HTTPS)</option>
                      <option value="53">53 (DNS)</option>
                      <option value="8080">8080 (代理)</option>
                    </select>
                  </label>

                  <div class="to-search-box">
                    <input type="text" class="to-input" placeholder="关键字搜索..." v-model="keyword" />
                    <button type="button" class="to-btn-primary" @click="handleSearch">🔍</button>
                    <button type="button" class="to-btn-small" @click="showMoreFilters = !showMoreFilters">更多条件 ▼</button>
                  </div>
                </div>

                <!-- 更多筛选条件（可展开） -->
                <div v-show="showMoreFilters" class="to-filter-row-simple" style="margin-top:10px;padding-top:10px;border-top:1px dashed #dcdfe6;">
                  <label class="to-filter-item">
                    <span class="to-filter-label">地理位置</span>
                    <select class="to-filter-select" v-model="locationFilter">
                      <option value="all">所有地区</option>
                      <option value="beijing">北京</option>
                      <option value="shanghai">上海</option>
                      <option value="guangzhou">广州</option>
                    </select>
                  </label>

                  <label class="to-filter-item">
                    <span class="to-filter-label">协议类型</span>
                    <select class="to-filter-select" v-model="protocolFilter">
                      <option value="all">全部协议</option>
                      <option value="dns">DNS</option>
                      <option value="http">HTTP</option>
                      <option value="https">HTTPS</option>
                    </select>
                  </label>

                  <label class="to-filter-item">
                    <span class="to-filter-label">ISP运营商</span>
                    <select class="to-filter-select" v-model="ispFilter">
                      <option value="all">所有运营商</option>
                      <option value="education">教育网</option>
                      <option value="telecom">电信</option>
                      <option value="unicom">联通</option>
                      <option value="mobile">移动</option>
                    </select>
                  </label>
                </div>
              </div>

              <!-- 分界线 -->
              <div class="to-divider"></div>

              <!-- 域名实时请求数据表格 -->
              <div class="to-table-wrapper">
                <table class="to-table-data">
                  <thead>
                    <tr>
                      <th style="width:50px">序号</th>
                      <th>域名 <span class="sort-icon">⇅</span></th>
                      <th>请求IP <span class="sort-icon">⇅</span></th>
                      <th>地理位置 <span class="sort-icon">⇅</span></th>
                      <th>请求端口 <span class="sort-icon">⇅</span></th>
                      <th>最后访问时间 <span class="sort-icon">⇅</span></th>
                      <th>总请求数 <span class="sort-icon">⇅</span></th>
                      <th>DNS请求数 <span class="sort-icon">⇅</span></th>
                      <th>HTTP请求数 <span class="sort-icon">⇅</span></th>
                      <th>HTTPS请求数 <span class="sort-icon">⇅</span></th>
                      <th>HTTP2x <span class="sort-icon">⇅</span></th>
                      <th>HTTP3x <span class="sort-icon">⇅</span></th>
                      <th>HTTP4x <span class="sort-icon">⇅</span></th>
                      <th>HTTP5x <span class="sort-icon">⇅</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, idx) in pagedDomains" :key="row.domain + idx" :class="{ 'to-row-active': idx % 2 === 0 }">
                      <td>{{ (currentPage - 1) * pageSize + idx + 1 }}</td>
                      <td><a href="#" class="to-link-text">{{ row.domain }}</a></td>
                      <td>{{ row.requestIp }}</td>
                      <td><span class="location-badge">{{ row.location }}</span></td>
                      <td class="to-num-cell">{{ row.port }}</td>
                      <td>{{ row.lastVisitTime }}</td>
                      <td class="to-num-cell">{{ row.totalRequests.toLocaleString() }}</td>
                      <td class="to-num-cell">{{ row.dnsRequests.toLocaleString() }}</td>
                      <td class="to-num-cell">{{ row.httpRequests.toLocaleString() }}</td>
                      <td class="to-num-cell">{{ row.httpsRequests.toLocaleString() }}</td>
                      <td class="to-num-cell">{{ row.http2x.toLocaleString() }}</td>
                      <td class="to-num-cell">{{ row.http3x.toLocaleString() }}</td>
                      <td class="to-num-cell">{{ row.http4x.toLocaleString() }}</td>
                      <td class="to-num-cell">{{ row.http5x.toLocaleString() }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- 分页栏 -->
              <div class="to-pagination-bar">
                <div class="to-page-info">
                  <span>共 {{ filteredDomains.length }} 条</span>
                  <span style="margin-left:12px;color:#909399;">{{ pageSize }} 条/页 ▼</span>
                </div>
                <div class="to-page-controls">
                  <button type="button" class="to-page-btn" :disabled="currentPage === 1" @click="currentPage--">&lt;</button>
                  <template v-for="p in visiblePages" :key="'tp-' + p">
                    <button v-if="p !== '...'" type="button"
                            class="to-page-num"
                            :class="{ active: p === currentPage }"
                            @click="currentPage = p">{{ p }}</button>
                    <span v-else class="to-page-dots">...</span>
                  </template>
                  <button type="button" class="to-page-btn" :disabled="currentPage === totalPages" @click="currentPage++">&gt;</button>
                  <span style="margin-left:8px;font-size:13px;color:#606266;">到第</span>
                  <input type="text" class="to-jump-input" v-model.number="gotoPage" style="width:46px;" />
                  <span style="font-size:13px;color:#606266;">页</span>
                  <button type="button" class="to-btn-default" @click="jumpToPage">确定</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 历史请求 Tab -->
      <div v-show="activeTab === 'history'" class="to-dashboard-scroll">
        <div class="to-dashboard">
          <div class="to-chart-row">
            <div class="to-chart-panel to-chart-panel-full" data-chart="filter-domain-history">
              <!-- 过滤条件 -->
              <div class="to-filter-container">
                <div class="to-filter-row-simple">
                  <label class="to-filter-item">
                    <span class="to-filter-label">时间范围</span>
                    <input type="text" class="to-input to-input-short" placeholder="2026-07-16 09:03:12 - 2026-07-16 09:18:12" v-model="historyTimeRange" />
                  </label>

                  <label class="to-filter-item">
                    <span class="to-filter-label">IP类型</span>
                    <select class="to-filter-select" v-model="historyIpType">
                      <option value="all">所有类型</option>
                      <option value="ipv4">IPv4</option>
                      <option value="ipv6">IPv6</option>
                    </select>
                  </label>

                  <label class="to-filter-item">
                    <span class="to-filter-label">源IP</span>
                    <select class="to-filter-select" v-model="historySourceIpFilter">
                      <option value="any">任意IP</option>
                      <option value="internal">内网IP</option>
                      <option value="external">外网IP</option>
                    </select>
                  </label>

                  <label class="to-filter-item">
                    <span class="to-filter-label">目标端口</span>
                    <select class="to-filter-select" v-model="historyPortFilter">
                      <option value="any">所有端口</option>
                      <option value="80">80 (HTTP)</option>
                      <option value="443">443 (HTTPS)</option>
                      <option value="53">53 (DNS)</option>
                      <option value="8080">8080 (代理)</option>
                    </select>
                  </label>

                  <div class="to-search-box">
                    <input type="text" class="to-input" placeholder="请求域名..." v-model="historyKeyword" />
                    <button type="button" class="to-btn-primary" @click="handleHistorySearch">🔍</button>
                    <button type="button" class="to-btn-small" @click="showHistoryMoreFilters = !showHistoryMoreFilters">更多条件 ▼</button>
                  </div>
                </div>

                <!-- 更多筛选条件（可展开） -->
                <div v-show="showHistoryMoreFilters" class="to-filter-row-simple" style="margin-top:10px;padding-top:10px;border-top:1px dashed #dcdfe6;">
                  <label class="to-filter-item">
                    <span class="to-filter-label">地理位置</span>
                    <select class="to-filter-select" v-model="historyLocationFilter">
                      <option value="all">所有地区</option>
                      <option value="beijing">北京</option>
                      <option value="shanghai">上海</option>
                      <option value="guangzhou">广州</option>
                    </select>
                  </label>

                  <label class="to-filter-item">
                    <span class="to-filter-label">协议类型</span>
                    <select class="to-filter-select" v-model="historyProtocolFilter">
                      <option value="all">全部协议</option>
                      <option value="dns">DNS</option>
                      <option value="http">HTTP</option>
                      <option value="https">HTTPS</option>
                    </select>
                  </label>

                  <label class="to-filter-item">
                    <span class="to-filter-label">ISP运营商</span>
                    <select class="to-filter-select" v-model="historyIspFilter">
                      <option value="all">所有运营商</option>
                      <option value="education">教育网</option>
                      <option value="telecom">电信</option>
                      <option value="unicom">联通</option>
                      <option value="mobile">移动</option>
                    </select>
                  </label>

                  <label class="to-filter-item">
                    <span class="to-filter-label">源IP ISP</span>
                    <select class="to-filter-select" v-model="historySourceIspFilter">
                      <option value="any">任意</option>
                      <option value="education">教育网</option>
                      <option value="telecom">电信</option>
                      <option value="unicom">联通</option>
                      <option value="mobile">移动</option>
                    </select>
                  </label>

                  <label class="to-filter-item">
                    <span class="to-filter-label">源IP区域</span>
                    <select class="to-filter-select" v-model="historySourceRegionFilter">
                      <option value="any">任意</option>
                      <option value="beijing">北京</option>
                      <option value="shanghai">上海</option>
                      <option value="guangzhou">广州</option>
                    </select>
                  </label>

                  <label class="to-filter-item">
                    <span class="to-filter-label">目标IP ISP</span>
                    <select class="to-filter-select" v-model="historyTargetIspFilter">
                      <option value="any">任意</option>
                      <option value="education">教育网</option>
                      <option value="telecom">电信</option>
                      <option value="unicom">联通</option>
                      <option value="mobile">移动</option>
                    </select>
                  </label>

                  <label class="to-filter-item">
                    <span class="to-filter-label">目标IP区域</span>
                    <select class="to-filter-select" v-model="historyTargetRegionFilter">
                      <option value="any">任意</option>
                      <option value="beijing">北京</option>
                      <option value="shanghai">上海</option>
                      <option value="guangzhou">广州</option>
                    </select>
                  </label>

                  <label class="to-filter-item">
                    <span class="to-filter-label">链路</span>
                    <select class="to-filter-select" v-model="historyLinkFilter">
                      <option value="any">任意</option>
                      <option value="direct">直连</option>
                      <option value="proxy">代理</option>
                    </select>
                  </label>
                </div>
              </div>

              <!-- 分界线 -->
              <div class="to-divider"></div>

              <!-- 域名历史请求数据表格 -->
              <div class="to-table-wrapper">
                <table class="to-table-data">
                  <thead>
                    <tr>
                      <th style="width:50px">序号</th>
                      <th>域名 <span class="sort-icon">⇅</span></th>
                      <th>请求IP <span class="sort-icon">⇅</span></th>
                      <th>地理位置 <span class="sort-icon">⇅</span></th>
                      <th>请求端口 <span class="sort-icon">⇅</span></th>
                      <th>总请求数 <span class="sort-icon">⇅</span></th>
                      <th>DNS请求数 <span class="sort-icon">⇅</span></th>
                      <th>HTTP请求数 <span class="sort-icon">⇅</span></th>
                      <th>HTTPS请求数 <span class="sort-icon">⇅</span></th>
                      <th>HTTP2x <span class="sort-icon">⇅</span></th>
                      <th>HTTP3x <span class="sort-icon">⇅</span></th>
                      <th>HTTP4x <span class="sort-icon">⇅</span></th>
                      <th>HTTP5x <span class="sort-icon">⇅</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, idx) in pagedHistoryDomains" :key="row.domain + idx" :class="{ 'to-row-active': idx % 2 === 0 }">
                      <td>{{ (historyCurrentPage - 1) * historyPageSize + idx + 1 }}</td>
                      <td><a href="#" class="to-link-text">{{ row.domain }}</a></td>
                      <td>{{ row.requestIp }}</td>
                      <td><span class="location-badge">{{ row.location }}</span></td>
                      <td class="to-num-cell">{{ row.port }}</td>
                      <td class="to-num-cell">{{ row.totalRequests.toLocaleString() }}</td>
                      <td class="to-num-cell">{{ row.dnsRequests.toLocaleString() }}</td>
                      <td class="to-num-cell">{{ row.httpRequests.toLocaleString() }}</td>
                      <td class="to-num-cell">{{ row.httpsRequests.toLocaleString() }}</td>
                      <td class="to-num-cell">{{ row.http2x.toLocaleString() }}</td>
                      <td class="to-num-cell">{{ row.http3x.toLocaleString() }}</td>
                      <td class="to-num-cell">{{ row.http4x.toLocaleString() }}</td>
                      <td class="to-num-cell">{{ row.http5x.toLocaleString() }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- 分页栏 -->
              <div class="to-pagination-bar">
                <div class="to-page-info">
                  <span>共 {{ filteredHistoryDomains.length }} 条</span>
                  <span style="margin-left:12px;color:#909399;">{{ historyPageSize }} 条/页 ▼</span>
                </div>
                <div class="to-page-controls">
                  <button type="button" class="to-page-btn" :disabled="historyCurrentPage === 1" @click="historyCurrentPage--">&lt;</button>
                  <template v-for="p in visibleHistoryPages" :key="'thp-' + p">
                    <button v-if="p !== '...'" type="button"
                            class="to-page-num"
                            :class="{ active: p === historyCurrentPage }"
                            @click="historyCurrentPage = p">{{ p }}</button>
                    <span v-else class="to-page-dots">...</span>
                  </template>
                  <button type="button" class="to-page-btn" :disabled="historyCurrentPage === historyTotalPages" @click="historyCurrentPage++">&gt;</button>
                  <span style="margin-left:8px;font-size:13px;color:#606266;">到第</span>
                  <input type="text" class="to-jump-input" v-model.number="historyGotoPage" style="width:46px;" />
                  <span style="font-size:13px;color:#606266;">页</span>
                  <button type="button" class="to-btn-default" @click="jumpToHistoryPage">确定</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 域名概况 Tab -->
      <div v-show="activeTab === 'overview'" class="to-dashboard-scroll">
        <div class="to-dashboard">
          <div class="to-chart-row">
            <div class="to-chart-panel to-chart-panel-full" data-chart="filter-domain-overview">
              <div class="ta-placeholder">域名概况 — 暂未开放</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 域名趋势 Tab -->
      <div v-show="activeTab === 'trend'" class="to-dashboard-scroll">
        <div class="to-dashboard">
          <div class="to-chart-row">
            <div class="to-chart-panel to-chart-panel-full" data-chart="filter-domain-trend">
              <!-- 过滤条件 - 完全复制实时请求的结构 -->
              <div class="to-filter-container">
                <div class="to-filter-row-simple">
                  <label class="to-filter-item">
                    <span class="to-filter-label">源IP</span>
                    <select class="to-filter-select" v-model="trendSourceIpFilter">
                      <option value="any">任意IP</option>
                      <option value="internal">内网IP</option>
                      <option value="external">外网IP</option>
                    </select>
                  </label>

                  <label class="to-filter-item">
                    <span class="to-filter-label">源端口</span>
                    <select class="to-filter-select" v-model="trendPortFilter">
                      <option value="any">所有端口</option>
                      <option value="80">80 (HTTP)</option>
                      <option value="443">443 (HTTPS)</option>
                      <option value="53">53 (DNS)</option>
                      <option value="8080">8080 (代理)</option>
                    </select>
                  </label>

                  <label class="to-filter-item">
                    <span class="to-filter-label">目标IP</span>
                    <select class="to-filter-select" v-model="trendTargetIpFilter">
                      <option value="any">任意IP</option>
                      <option value="internal">内网IP</option>
                      <option value="external">外网IP</option>
                    </select>
                  </label>

                  <label class="to-filter-item">
                    <span class="to-filter-label">目标端口</span>
                    <select class="to-filter-select" v-model="trendTargetPortFilter">
                      <option value="any">所有端口</option>
                      <option value="80">80 (HTTP)</option>
                      <option value="443">443 (HTTPS)</option>
                      <option value="53">53 (DNS)</option>
                      <option value="8080">8080 (代理)</option>
                    </select>
                  </label>

                  <label class="to-filter-item">
                    <span class="to-filter-label">请求域名</span>
                    <input type="text" class="to-input-short" placeholder="域名关键词" v-model="trendKeyword" />
                  </label>

                  <div style="display:flex;gap:4px;align-items:center;">
                    <button :class="['ip-type-btn', { active: trendIpType === 'ipv4' }]" @click="trendIpType = 'ipv4'">IPv4</button>
                    <button :class="['ip-type-btn', { active: trendIpType === 'ipv6' }]" @click="trendIpType = 'ipv6'">IPv6</button>
                  </div>

                  <div class="to-search-box">
                    <button type="button" class="to-btn-primary" @click="handleTrendSearch">🔍 查询</button>
                    <button type="button" class="to-btn-small" @click="handleTrendReset">重置</button>
                    <button type="button" class="to-btn-small" @click="showTrendMoreFilters = !showTrendMoreFilters">更多条件 ▼</button>
                  </div>
                </div>

                <!-- 更多筛选条件（可展开） -->
                <div v-show="showTrendMoreFilters" class="to-filter-row-simple" style="margin-top:10px;padding-top:10px;border-top:1px dashed #dcdfe6;">
                  <label class="to-filter-item">
                    <span class="to-filter-label">源IP ISP</span>
                    <select class="to-filter-select" v-model="trendIspFilter">
                      <option value="all">所有运营商</option>
                      <option value="education">教育网</option>
                      <option value="telecom">电信</option>
                      <option value="unicom">联通</option>
                      <option value="mobile">移动</option>
                    </select>
                  </label>

                  <label class="to-filter-item">
                    <span class="to-filter-label">目标IP ISP</span>
                    <select class="to-filter-select" v-model="trendTargetIspFilter">
                      <option value="all">所有运营商</option>
                      <option value="education">教育网</option>
                      <option value="telecom">电信</option>
                      <option value="unicom">联通</option>
                      <option value="mobile">移动</option>
                    </select>
                  </label>

                  <label class="to-filter-item">
                    <span class="to-filter-label">源IP区域</span>
                    <select class="to-filter-select" v-model="trendLocationFilter">
                      <option value="all">所有地区</option>
                      <option value="beijing">北京</option>
                      <option value="shanghai">上海</option>
                      <option value="guangzhou">广州</option>
                    </select>
                  </label>

                  <label class="to-filter-item">
                    <span class="to-filter-label">目标IP区域</span>
                    <select class="to-filter-select" v-model="trendTargetLocationFilter">
                      <option value="all">所有地区</option>
                      <option value="beijing">北京</option>
                      <option value="shanghai">上海</option>
                      <option value="guangzhou">广州</option>
                    </select>
                  </label>

                  <label class="to-filter-item">
                    <span class="to-filter-label">链路类型</span>
                    <select class="to-filter-select" v-model="trendLinkType">
                      <option value="all">所有类型</option>
                      <option value="inbound">入站</option>
                      <option value="outbound">出站</option>
                      <option value="internal">内部</option>
                    </select>
                  </label>
                </div>

                <!-- 时间范围选择器 -->
                <div class="to-time-range-row">
                  <label class="to-filter-item">
                    <span class="to-filter-label">时间范围</span>
                    <input type="text" class="to-input-medium" v-model="trendTimeRange" placeholder="2026-07-16 09:06:50 - 2026-07-16 10:11:50" />
                  </label>
                </div>
              </div>

              <!-- 分界线 -->
              <div class="to-divider"></div>

              <!-- 图表区域 - 替换原来的表格 -->
              <div class="to-charts-wrapper">

                <!-- 活跃域名个数图表 -->
                <div class="to-chart-block">
                  <div class="to-chart-header">
                    <h4 class="to-chart-title">活跃域名个数</h4>
                    <div class="to-chart-actions">
                      <span class="data-point-info">最大值: {{ activeDomainData.maxValue }} | 最小值: {{ activeDomainData.minValue }} | 平均值: {{ activeDomainData.avgValue }}</span>
                    </div>
                  </div>
                  <div class="to-chart-body" ref="activeDomainChartRef">
                    <canvas :width="800" :height="300" id="activeDomainCanvas"></canvas>
                  </div>
                </div>

                <!-- 域名请求数图表 -->
                <div class="to-chart-block">
                  <div class="to-chart-header">
                    <h4 class="to-chart-title">域名请求数</h4>
                    <div class="to-chart-actions">
                      <div class="to-chart-legend-inline">
                        <span class="legend-dot" style="background:#409eff;">dns</span>
                        <span class="legend-dot" style="background:#67c23a;">https</span>
                        <span class="legend-dot" style="background:#e6a23c;">http2xx</span>
                        <span class="legend-dot" style="background:#f56c6c;">http3xx</span>
                        <span class="legend-dot" style="background:#909399;">http4xx</span>
                        <span class="legend-dot" style="background:#b37feb;">http5xx</span>
                      </div>
                      <span class="data-point-info">总请求: {{ domainRequestData.totalRequests.toLocaleString() }} | 平均值: {{ domainRequestData.avgRequests.toLocaleString() }}</span>
                    </div>
                  </div>
                  <div class="to-chart-body" ref="domainRequestChartRef">
                    <canvas :width="800" :height="300" id="domainRequestCanvas"></canvas>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const activeTab = ref('realtime')

// 实时请求过滤条件状态
const refreshInterval = ref('10')
const ipType = ref('all')
const sourceIpFilter = ref('any')
const portFilter = ref('any')
const keyword = ref('')
const showMoreFilters = ref(false)
const locationFilter = ref('all')
const protocolFilter = ref('all')
const ispFilter = ref('all')
const currentPage = ref(1)
const pageSize = ref(100)
const gotoPage = ref(1)

// 域名趋势过滤条件状态
const trendTimeRange = ref('2026-07-16 09:06:50 - 2026-07-16 10:11:50')
const trendIpType = ref('ipv4')
const trendSourceIpFilter = ref('any')
const trendPortFilter = ref('any')
const trendTargetIpFilter = ref('any')
const trendTargetPortFilter = ref('any')
const trendKeyword = ref('')
const showTrendMoreFilters = ref(false)
const trendLocationFilter = ref('all')
const trendTargetLocationFilter = ref('all')
const trendProtocolFilter = ref('all')
const trendIspFilter = ref('all')
const trendTargetIspFilter = ref('all')
const trendLinkType = ref('all')

// 图表引用
const activeDomainChartRef = ref<HTMLElement | null>(null)
const domainRequestChartRef = ref<HTMLElement | null>(null)

// 活跃域名数据
const activeDomainData = computed(() => {
  const data = generateActiveDomainData()
  return {
    ...data,
    maxValue: Math.max(...data.values),
    minValue: Math.min(...data.values),
    avgValue: Math.round(data.values.reduce((a, b) => a + b, 0) / data.values.length)
  }
})

// 域名请求数据
const domainRequestData = computed(() => {
  const data = generateDomainRequestData()
  let totalRequests = 0
  Object.keys(data.seriesData).forEach(key => {
    totalRequests += data.seriesData[key].reduce((a: number, b: number) => a + b, 0)
  })

  return {
    ...data,
    totalRequests,
    avgRequests: Math.round(totalRequests / (data.timePoints.length * 6))
  }
})

// 历史请求过滤条件状态
const historyTimeRange = ref('2026-07-16 09:03:12 - 2026-07-16 09:18:12')
const historyIpType = ref('ipv4')
const historySourceIpFilter = ref('any')
const historyPortFilter = ref('any')
const historyKeyword = ref('')
const showHistoryMoreFilters = ref(false)
const historyLocationFilter = ref('all')
const historyProtocolFilter = ref('all')
const historyIspFilter = ref('all')
const historySourceIspFilter = ref('any')
const historySourceRegionFilter = ref('any')
const historyTargetIspFilter = ref('any')
const historyTargetRegionFilter = ref('any')
const historyLinkFilter = ref('any')
const historyCurrentPage = ref(1)
const historyPageSize = ref(100)
const historyGotoPage = ref(1)

// 域名实时请求接口
interface DomainRequest {
  domain: string
  requestIp: string
  location: string
  port: string
  lastVisitTime: string
  totalRequests: number
  dnsRequests: number
  httpRequests: number
  httpsRequests: number
  http2x: number
  http3x: number
  http4x: number
  http5x: number
}

function generateDomainData(count: number = 30359): DomainRequest[] {
  const data: DomainRequest[] = []

  // 前35条使用截图中的真实数据
  const topDomains: DomainRequest[] = [
    { domain: 'mirrors.tuna.tsinghua.edu.cn', requestIp: '101.6.15.130', location: '北京教育网清华大学', port: '53,443,80,873,22222', lastVisitTime: '2026-07-16 09:27:58', totalRequests: 892674331, dnsRequests: 150338432, httpRequests: 57859047, httpsRequests: 617876852, http2x: 8812662, http3x: 7065077, http4x: 41981257, http5x: 51 },
    { domain: 'alfa.s.tuna.tsinghua.edu.cn', requestIp: '91.127.0.0', location: '新浪优克', port: '53,22222', lastVisitTime: '2026-07-16 09:27:58', totalRequests: 192424315, dnsRequests: 192424315, httpRequests: 0, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'pypi.tuna.tsinghua.edu.cn', requestIp: '101.6.15.130', location: '北京教育网清华大学', port: '53,443,80,873,22222', lastVisitTime: '2026-07-16 09:27:58', totalRequests: 183555237, dnsRequests: 25343553, httpRequests: 2359568, httpsRequests: 155652116, http2x: 1, http3x: 2335441, http4x: 241226, http5x: 0 },
    { domain: 'www.douyin.com', requestIp: '101.6.15.70', location: '北京教育网清华大学', port: '53,443,80', lastVisitTime: '2026-07-16 08:27:54', totalRequests: 126294445, dnsRequests: 126294224, httpRequests: 20, httpsRequests: 201, http2x: 0, http3x: 0, http4x: 20, http5x: 0 },
    { domain: 'ntp.tuna.tsinghua.edu.cn', requestIp: '91.127.0.0', location: '新浪优克', port: '53,80,443,22222,8443', lastVisitTime: '2026-07-16 09:27:56', totalRequests: 119453506, dnsRequests: 119453501, httpRequests: 0, httpsRequests: 5, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'bdm3.tuna.tsinghua.edu.c...', requestIp: '101.6.15.130', location: '北京教育网清华大学', port: '53,443,80,873,22222', lastVisitTime: '2026-07-16 09:27:58', totalRequests: 118622100, dnsRequests: 118520530, httpRequests: 14, httpsRequests: 1556, http2x: 0, http3x: 0, http4x: 14, http5x: 0 },
    { domain: 'dns3.tuna.tsinghua.edu.cn', requestIp: '', location: '保留', port: '53', lastVisitTime: '2026-07-16 09:27:58', totalRequests: 96092430, dnsRequests: 96092430, httpRequests: 0, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'image.baidu.com', requestIp: '182.61.200.226', location: '北京百度电信', port: '53,443', lastVisitTime: '2026-07-16 09:27:56', totalRequests: 70886959, dnsRequests: 70886956, httpRequests: 0, httpsRequests: 3, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'www.weibo.com', requestIp: '121.194.0.143', location: '北京教育网', port: '53,443', lastVisitTime: '2026-07-16 09:27:58', totalRequests: 70847597, dnsRequests: 70847585, httpRequests: 0, httpsRequests: 12, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'cloud.tsinghua.edu.cn', requestIp: '101.6.15.69', location: '北京教育网清华大学', port: '443,80,53,2222,8888,1521', lastVisitTime: '2026-07-16 09:27:58', totalRequests: 69856935, dnsRequests: 17609, httpRequests: 210797, httpsRequests: 69631529, http2x: 3, http3x: 207100, http4x: 3694, http5x: 0 },
    { domain: 'www.sina.com.cn', requestIp: '58.205.221.44', location: '湖北武汉教育网', port: '53,443,80', lastVisitTime: '2026-07-16 09:27:56', totalRequests: 69868374, dnsRequests: 69689369, httpRequests: 3, httpsRequests: 2, http2x: 0, http3x: 2, http4x: 1, http5x: 0 },
    { domain: 'www.xsami.com', requestIp: '', location: '保留', port: '53', lastVisitTime: '2026-07-16 09:27:53', totalRequests: 68388599, dnsRequests: 68388599, httpRequests: 0, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'map.qq.com', requestIp: '91.127.0.0', location: '新浪优克', port: '53,80,443', lastVisitTime: '2026-07-16 09:27:55', totalRequests: 68331489, dnsRequests: 68331479, httpRequests: 5, httpsRequests: 5, http2x: 0, http3x: 0, http4x: 5, http5x: 0 },
    { domain: 'finance.ifeng.com', requestIp: '', location: '保留', port: '53', lastVisitTime: '2026-07-16 09:27:56', totalRequests: 68319274, dnsRequests: 68319274, httpRequests: 0, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'www.bilibili.com', requestIp: '', location: '保留', port: '53', lastVisitTime: '2026-07-16 09:27:52', totalRequests: 68116537, dnsRequests: 68116537, httpRequests: 0, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'www.baidu.com', requestIp: '91.127.0.0', location: '新浪优克', port: '53,80,443,8880,8888,10001', lastVisitTime: '2026-07-16 09:27:58', totalRequests: 67367668, dnsRequests: 67355585, httpRequests: 769, httpsRequests: 414, http2x: 664, http3x: 16, http4x: 89, http5x: 0 },
    { domain: 'www.ga-me.com', requestIp: '', location: '保留', port: '53', lastVisitTime: '2026-07-16 09:27:56', totalRequests: 67711393, dnsRequests: 67711393, httpRequests: 0, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'www.csdn.com', requestIp: '', location: '保留', port: '53', lastVisitTime: '2026-07-16 09:27:57', totalRequests: 67329766, dnsRequests: 67329766, httpRequests: 0, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'www.58.com', requestIp: '', location: '保留', port: '53', lastVisitTime: '2026-07-16 09:27:54', totalRequests: 67256276, dnsRequests: 67256276, httpRequests: 0, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'wenku.baidu.com', requestIp: '182.61.200.214', location: '北京百度电信', port: '53,443', lastVisitTime: '2026-07-16 09:27:56', totalRequests: 67035337, dnsRequests: 67035335, httpRequests: 2, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'www.alipay.com', requestIp: '91.127.0.0', location: '新浪优克', port: '53,443', lastVisitTime: '2026-07-16 09:27:58', totalRequests: 66645351, dnsRequests: 66645349, httpRequests: 2, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'www.jd.com', requestIp: '111.225.216.3', location: '河北廊坊中国电信', port: '53,80,443', lastVisitTime: '2026-07-16 09:27:56', totalRequests: 66600252, dnsRequests: 66600186, httpRequests: 243, httpsRequests: 43, http2x: 0, http3x: 243, http4x: 0, http5x: 0 },
    { domain: 'cloud.tencent.com', requestIp: '91.127.0.0', location: '新浪优克', port: '53,443', lastVisitTime: '2026-07-16 09:27:57', totalRequests: 66569774, dnsRequests: 66569772, httpRequests: 2, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'www.weixin.com', requestIp: '', location: '保留', port: '53', lastVisitTime: '2026-07-16 09:27:54', totalRequests: 66570948, dnsRequests: 66570948, httpRequests: 0, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'tieba.baidu.com', requestIp: '182.61.200.13', location: '北京百度电信', port: '53,443', lastVisitTime: '2026-07-16 09:27:47', totalRequests: 66280353, dnsRequests: 66280327, httpRequests: 3, httpsRequests: 23, http2x: 0, http3x: 0, http4x: 3, http5x: 0 },
    { domain: 'www.lenovo.com.cn', requestIp: '', location: '保留', port: '53', lastVisitTime: '2026-07-16 09:27:54', totalRequests: 66255026, dnsRequests: 66255026, httpRequests: 0, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'www.tianya.cn', requestIp: '', location: '保留', port: '53', lastVisitTime: '2026-07-16 09:27:56', totalRequests: 66220881, dnsRequests: 66220881, httpRequests: 0, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'www.163.com', requestIp: '101.6.15.130', location: '北京教育网清华大学', port: '53,443,80', lastVisitTime: '2026-07-16 09:27:57', totalRequests: 66143584, dnsRequests: 66143575, httpRequests: 9, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'www.baihe.com', requestIp: '', location: '保留', port: '53', lastVisitTime: '2026-07-16 09:27:47', totalRequests: 66136255, dnsRequests: 66136255, httpRequests: 0, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'sports.sina.com.cn', requestIp: '101.6.15.130', location: '北京教育网清华大学', port: '53,80,443', lastVisitTime: '2026-07-16 09:27:57', totalRequests: 66106939, dnsRequests: 66106936, httpRequests: 3, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 3, http5x: 0 },
    { domain: 'pay.weixin.qq.com', requestIp: '', location: '保留', port: '53', lastVisitTime: '2026-07-16 09:27:42', totalRequests: 65972495, dnsRequests: 65972495, httpRequests: 0, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'www.yeah.net', requestIp: '', location: '保留', port: '53', lastVisitTime: '2026-07-16 09:27:57', totalRequests: 65925333, dnsRequests: 65925333, httpRequests: 0, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'www.51job.com', requestIp: '114.80.176.40', location: '上海中国电信', port: '53,80,443', lastVisitTime: '2026-07-16 09:27:58', totalRequests: 65094516, dnsRequests: 65094512, httpRequests: 3, httpsRequests: 1, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'zhibao.baidu.com', requestIp: '101.6.15.130', location: '北京教育网清华大学', port: '53,443,80,1234', lastVisitTime: '2026-07-16 09:27:53', totalRequests: 65741169, dnsRequests: 65741836, httpRequests: 27, httpsRequests: 106, http2x: 8, http3x: 19, http4x: 0, http5x: 0 },
    { domain: 'www.google.com.cn', requestIp: '', location: '保留', port: '53', lastVisitTime: '2026-07-16 09:27:58', totalRequests: 65699788, dnsRequests: 65699788, httpRequests: 0, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 0, http5x: 0 }
  ]

  for (let i = 0; i < count; i++) {
    let item: DomainRequest

    if (i < topDomains.length) {
      item = topDomains[i]
    } else {
      const domains = [
        'api.example.com', 'cdn.static.net', 'img.photo.org', 'video.stream.io',
        'data.analytics.me', 'auth.login.xyz', 'mail.service.co', 'ftp.transfer.edu',
        'db.database.biz', 'cache.redis.info', 'gateway.api.tech', 'monitor.sys.dev',
        'log.collect.app', 'backup.storage.cloud', 'search.engine.web'
      ]
      const locations = ['北京教育网', '上海电信', '广州联通', '深圳移动', '成都教育网', '杭州电信']

      item = {
        domain: domains[i % domains.length],
        requestIp: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 254) + 1}`,
        location: locations[i % locations.length],
        port: '53,443,80',
        lastVisitTime: `2026-07-16 ${String(9 + Math.floor(i / 10000)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
        totalRequests: Math.floor(Math.random() * 50000000) + 100000,
        dnsRequests: Math.floor(Math.random() * 40000000) + 50000,
        httpRequests: Math.floor(Math.random() * 5000000) + 1000,
        httpsRequests: Math.floor(Math.random() * 45000000) + 50000,
        http2x: Math.floor(Math.random() * 100000) + 100,
        http3x: Math.floor(Math.random() * 200000) + 50,
        http4x: Math.floor(Math.random() * 300000) + 200,
        http5x: Math.floor(Math.random() * 100) + 1
      }
    }

    data.push(item)
  }

  return data
}

const domainsData = ref<DomainRequest[]>(generateDomainData())

// 过滤计算属性
const filteredDomains = computed(() => {
  let data = [...domainsData.value]

  if (keyword.value && keyword.value.trim()) {
    data = data.filter(item =>
      item.domain.toLowerCase().includes(keyword.value.toLowerCase().trim()) ||
      item.requestIp.includes(keyword.value.trim()) ||
      item.location.includes(keyword.value.trim())
    )
  }

  if (ipType.value !== 'all') {
    if (ipType.value === 'ipv4') {
      data = data.filter(item => item.requestIp && !item.requestIp.includes(':'))
    } else {
      data = data.filter(item => item.requestIp && item.requestIp.includes(':'))
    }
  }

  if (locationFilter.value !== 'all') {
    const locationMap: Record<string, string> = {
      beijing: '北京',
      shanghai: '上海',
      guangzhou: '广州'
    }
    data = data.filter(item => item.location.includes(locationMap[locationFilter.value] || ''))
  }

  if (protocolFilter.value !== 'all') {
    // 可以根据协议类型进一步过滤
  }

  return data
})

// 分页计算属性
const totalPages = computed(() => Math.max(1, Math.ceil(filteredDomains.value.length / parseInt(pageSize.value))))
const pagedDomains = computed(() => {
  const start = (currentPage.value - 1) * parseInt(pageSize.value)
  return filteredDomains.value.slice(start, start + parseInt(pageSize.value))
})

// 可见页码
const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const current = currentPage.value
  const total = totalPages.value

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3) pages.push('...')
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i)
    }
    if (current < total - 2) pages.push('...', total)
  }

  return pages
})

// 事件处理函数
function handleSearch() {
  currentPage.value = 1
}

function jumpToPage() {
  const page = Math.max(1, Math.min(parseInt(String(gotoPage.value)) || 1, totalPages.value))
  currentPage.value = page
}

// 历史请求数据生成
function generateHistoryData(count: number = 23953): DomainRequest[] {
  const data: DomainRequest[] = []

  // 前35条使用截图中的真实数据
  const historyTopDomains: DomainRequest[] = [
    { domain: 'mirrors.tuna.tsinghua.edu.cn', requestIp: '101.6.15.130', location: '北京BGP', port: '80,443,53', lastVisitTime: '2026-07-16 09:03:12', totalRequests: 694457, dnsRequests: 50087, httpRequests: 156484, httpsRequests: 464917, http2x: 3627, http3x: 3219, http4x: 19069, http5x: 0 },
    { domain: 'www.anjuke.com', requestIp: '101.6.6.6', location: '北京BGP', port: '53', lastVisitTime: '2026-07-16 09:05:23', totalRequests: 292396, dnsRequests: 292396, httpRequests: 0, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'www.faceu.com', requestIp: '101.6.6.6', location: '北京BGP', port: '53', lastVisitTime: '2026-07-16 09:07:45', totalRequests: 201340, dnsRequests: 201340, httpRequests: 0, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'www.huawei.com', requestIp: '101.6.6.6', location: '北京BGP', port: '53', lastVisitTime: '2026-07-16 09:08:12', totalRequests: 198220, dnsRequests: 198220, httpRequests: 0, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'www.tencentmusic.com', requestIp: '101.6.6.6', location: '北京BGP', port: '53', lastVisitTime: '2026-07-16 09:09:34', totalRequests: 193529, dnsRequests: 193529, httpRequests: 0, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'www.1688.com', requestIp: '101.6.6.6', location: '北京BGP', port: '53', lastVisitTime: '2026-07-16 09:10:56', totalRequests: 192738, dnsRequests: 192738, httpRequests: 0, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'tieba.baidu.com', requestIp: '101.6.6.6', location: '北京BGP', port: '53', lastVisitTime: '2026-07-16 09:11:23', totalRequests: 170788, dnsRequests: 170788, httpRequests: 0, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'www.sf-express.com', requestIp: '101.6.6.6', location: '北京BGP', port: '53', lastVisitTime: '2026-07-16 09:12:45', totalRequests: 161863, dnsRequests: 161863, httpRequests: 0, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'pypi.tuna.tsinghua.edu.cn', requestIp: '101.6.15.130', location: '北京BGP', port: '80,443,53', lastVisitTime: '2026-07-16 09:13:12', totalRequests: 160140, dnsRequests: 8976, httpRequests: 2262, httpsRequests: 126242, http2x: 1, http3x: 373, http4x: 1, http5x: 0 },
    { domain: 'www.pingan.com', requestIp: '101.6.6.6', location: '北京BGP', port: '53', lastVisitTime: '2026-07-16 09:14:34', totalRequests: 159281, dnsRequests: 159281, httpRequests: 0, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'www.yto.net.cn', requestIp: '101.6.6.6', location: '北京BGP', port: '53', lastVisitTime: '2026-07-16 09:15:56', totalRequests: 105262, dnsRequests: 105262, httpRequests: 0, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'changduonovel.com', requestIp: '101.6.6.6', location: '北京BGP', port: '53', lastVisitTime: '2026-07-16 09:16:23', totalRequests: 104861, dnsRequests: 104861, httpRequests: 0, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'www.uoweb.com', requestIp: '101.6.6.6', location: '北京BGP', port: '53', lastVisitTime: '2026-07-16 09:17:45', totalRequests: 103813, dnsRequests: 103813, httpRequests: 0, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'image.taishi.com', requestIp: '101.6.6.6', location: '北京BGP', port: '53', lastVisitTime: '2026-07-16 09:18:12', totalRequests: 103287, dnsRequests: 103287, httpRequests: 0, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'www.helloglobal.com', requestIp: '101.6.6.6', location: '北京BGP', port: '53', lastVisitTime: '2026-07-16 09:03:34', totalRequests: 103162, dnsRequests: 103162, httpRequests: 0, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'www.douyin.com', requestIp: '101.6.6.6', location: '北京BGP', port: '53', lastVisitTime: '2026-07-16 09:04:56', totalRequests: 102728, dnsRequests: 102728, httpRequests: 0, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'www.xsami.com', requestIp: '101.6.6.6', location: '北京BGP', port: '53', lastVisitTime: '2026-07-16 09:05:23', totalRequests: 102471, dnsRequests: 102471, httpRequests: 0, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'sports.sohu.com', requestIp: '101.6.6.6', location: '北京BGP', port: '53', lastVisitTime: '2026-07-16 09:06:45', totalRequests: 101220, dnsRequests: 101220, httpRequests: 0, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'www.alibaba.com', requestIp: '101.6.6.6', location: '北京BGP', port: '53', lastVisitTime: '2026-07-16 09:07:12', totalRequests: 99613, dnsRequests: 99613, httpRequests: 0, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'www.chinatitle.com.cn', requestIp: '101.6.6.6', location: '北京BGP', port: '53', lastVisitTime: '2026-07-16 09:08:34', totalRequests: 99269, dnsRequests: 99269, httpRequests: 0, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'www.xiaomi.com', requestIp: '101.6.6.6', location: '北京BGP', port: '53', lastVisitTime: '2026-07-16 09:09:56', totalRequests: 97392, dnsRequests: 97392, httpRequests: 0, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'www.fliggy.com', requestIp: '101.6.6.6', location: '北京BGP', port: '53', lastVisitTime: '2026-07-16 09:10:23', totalRequests: 96843, dnsRequests: 96843, httpRequests: 0, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'www.feishu.cn', requestIp: '101.6.6.6', location: '北京BGP', port: '53', lastVisitTime: '2026-07-16 09:11:45', totalRequests: 95963, dnsRequests: 95963, httpRequests: 0, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'mp.pipis.com', requestIp: '101.6.6.6', location: '北京BGP', port: '53', lastVisitTime: '2026-07-16 09:12:12', totalRequests: 94314, dnsRequests: 94314, httpRequests: 0, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'www.gopkid.com.cn', requestIp: '101.6.6.6', location: '北京BGP', port: '53', lastVisitTime: '2026-07-16 09:13:34', totalRequests: 93578, dnsRequests: 93578, httpRequests: 0, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'www.fang.com', requestIp: '101.6.6.6', location: '北京BGP', port: '53', lastVisitTime: '2026-07-16 09:14:56', totalRequests: 93303, dnsRequests: 93303, httpRequests: 0, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'game.163.com', requestIp: '101.6.6.6', location: '北京BGP', port: '53', lastVisitTime: '2026-07-16 09:15:23', totalRequests: 91143, dnsRequests: 91143, httpRequests: 0, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'www.aliexpress.com', requestIp: '101.6.6.6', location: '北京BGP', port: '53', lastVisitTime: '2026-07-16 09:16:45', totalRequests: 87391, dnsRequests: 87391, httpRequests: 0, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'www.jdpay.com', requestIp: '101.6.6.6', location: '北京BGP', port: '53', lastVisitTime: '2026-07-16 09:17:12', totalRequests: 84697, dnsRequests: 84697, httpRequests: 0, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'www.mobile.com', requestIp: '101.6.6.6', location: '北京BGP', port: '53', lastVisitTime: '2026-07-16 09:18:34', totalRequests: 84176, dnsRequests: 84176, httpRequests: 0, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'www.taobao.com', requestIp: '101.6.6.6', location: '北京BGP', port: '53', lastVisitTime: '2026-07-16 09:03:56', totalRequests: 83472, dnsRequests: 83472, httpRequests: 0, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 0, http5x: 0 },
    { domain: 'open.weixin.qq.com', requestIp: '101.6.6.6', location: '北京BGP', port: '53', lastVisitTime: '2026-07-16 09:04:23', totalRequests: 82196, dnsRequests: 82196, httpRequests: 0, httpsRequests: 0, http2x: 0, http3x: 0, http4x: 0, http5x: 0 }
  ]

  for (let i = 0; i < count; i++) {
    let item: DomainRequest

    if (i < historyTopDomains.length) {
      item = historyTopDomains[i]
    } else {
      const domains = [
        'api.history.example.com', 'cdn.history.static.net', 'img.history.photo.org',
        'video.history.stream.io', 'data.history.analytics.me', 'auth.history.login.xyz',
        'mail.history.service.co', 'ftp.history.transfer.edu', 'db.history.database.biz',
        'cache.history.redis.info'
      ]
      const locations = ['北京BGP', '上海BGP', '广州BGP', '深圳BGP']

      item = {
        domain: domains[i % domains.length],
        requestIp: `101.6.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 254) + 1}`,
        location: locations[i % locations.length],
        port: '53',
        lastVisitTime: `2026-07-16 ${String(9 + Math.floor(i / 10000)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
        totalRequests: Math.floor(Math.random() * 80000) + 10000,
        dnsRequests: Math.floor(Math.random() * 75000) + 5000,
        httpRequests: Math.floor(Math.random() * 3000) + 100,
        httpsRequests: Math.floor(Math.random() * 50000) + 1000,
        http2x: Math.floor(Math.random() * 500) + 10,
        http3x: Math.floor(Math.random() * 200) + 5,
        http4x: Math.floor(Math.random() * 1000) + 20,
        http5x: Math.floor(Math.random() * 50)
      }
    }

    data.push(item)
  }

  return data
}

const historyDomainsData = ref<DomainRequest[]>(generateHistoryData())

// 历史请求过滤计算属性
const filteredHistoryDomains = computed(() => {
  let data = [...historyDomainsData.value]

  if (historyKeyword.value && historyKeyword.value.trim()) {
    data = data.filter(item =>
      item.domain.toLowerCase().includes(historyKeyword.value.toLowerCase().trim()) ||
      item.requestIp.includes(historyKeyword.value.trim()) ||
      item.location.includes(historyKeyword.value.trim())
    )
  }

  if (historyIpType.value !== 'all') {
    if (historyIpType.value === 'ipv4') {
      data = data.filter(item => item.requestIp && !item.requestIp.includes(':'))
    } else {
      data = data.filter(item => item.requestIp && item.requestIp.includes(':'))
    }
  }

  if (historyLocationFilter.value !== 'all') {
    const locationMap: Record<string, string> = {
      beijing: '北京',
      shanghai: '上海',
      guangzhou: '广州'
    }
    data = data.filter(item => item.location.includes(locationMap[historyLocationFilter.value] || ''))
  }

  return data
})

// 历史请求分页计算属性
const historyTotalPages = computed(() => Math.max(1, Math.ceil(filteredHistoryDomains.value.length / parseInt(historyPageSize.value))))
const pagedHistoryDomains = computed(() => {
  const start = (historyCurrentPage.value - 1) * parseInt(historyPageSize.value)
  return filteredHistoryDomains.value.slice(start, start + parseInt(historyPageSize.value))
})

// 历史请求可见页码
const visibleHistoryPages = computed(() => {
  const pages: (number | string)[] = []
  const current = historyCurrentPage.value
  const total = historyTotalPages.value

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3) pages.push('...')
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i)
    }
    if (current < total - 2) pages.push('...', total)
  }

  return pages
})

// 域名趋势事件处理函数
function handleTrendSearch() {
  console.log('查询域名趋势数据', {
    timeRange: trendTimeRange.value,
    ipType: trendIpType.value,
    sourceIp: trendSourceIpFilter.value,
    port: trendPortFilter.value,
    targetIp: trendTargetIpFilter.value,
    targetPort: trendTargetPortFilter.value,
    keyword: trendKeyword.value
  })
}

function handleTrendReset() {
  trendTimeRange.value = '2026-07-16 09:06:50 - 2026-07-16 10:11:50'
  trendIpType.value = 'ipv4'
  trendSourceIpFilter.value = 'any'
  trendPortFilter.value = 'any'
  trendTargetIpFilter.value = 'any'
  trendTargetPortFilter.value = 'any'
  trendKeyword.value = ''
  trendLocationFilter.value = 'all'
  trendTargetLocationFilter.value = 'all'
  trendProtocolFilter.value = 'all'
  trendIspFilter.value = 'all'
  trendTargetIspFilter.value = 'all'
  trendLinkType.value = 'all'
}

// 生成活跃域名数据
function generateActiveDomainData() {
  const timePoints = []
  const values = []
  let baseValue = 4200

  for (let i = 0; i < 24; i++) {
    const hour = Math.floor(i / 2)
    const minute = (i % 2) * 30
    timePoints.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`)

    if (i >= 10 && i <= 14) {
      baseValue += (Math.random() - 0.3) * 300
    } else if (i >= 18 && i <= 20) {
      baseValue += (Math.random() - 0.3) * 250
    } else {
      baseValue += (Math.random() - 0.5) * 100
    }

    values.push(Math.max(3800, Math.min(5500, Math.round(baseValue))))
  }

  return { timePoints, values }
}

// 生成域名请求数据
function generateDomainRequestData() {
  const timePoints = []
  const seriesData: Record<string, number[]> = {
    dns: [],
    https: [],
    http2xx: [],
    http3xx: [],
    http4xx: [],
    http5xx: []
  }

  for (let i = 0; i < 24; i++) {
    const hour = Math.floor(i / 2)
    const minute = (i % 2) * 30
    timePoints.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`)

    seriesData.dns.push(Math.floor(Math.random() * 50000) + 350000)
    seriesData.https.push(Math.floor(Math.random() * 100000) + 200000)
    seriesData.http2xx.push(Math.floor(Math.random() * 80000) + 150000)
    seriesData.http3xx.push(Math.floor(Math.random() * 60000) + 120000)
    seriesData.http4xx.push(Math.floor(Math.random() * 40000) + 90000)
    seriesData.http5xx.push(Math.floor(Math.random() * 20000) + 45000)
  }

  return { timePoints, seriesData }
}

// 历史请求事件处理函数
function handleHistorySearch() {
  historyCurrentPage.value = 1
}

function jumpToHistoryPage() {
  const page = Math.max(1, Math.min(parseInt(String(historyGotoPage.value)) || 1, historyTotalPages.value))
  historyCurrentPage.value = page
}

let timer: any = null

onMounted(() => {
  if (refreshInterval.value !== '0') {
    timer = setInterval(() => {
      console.log('自动刷新域名数据')
    }, parseInt(refreshInterval.value) * 1000)
  }
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
/* ===== 完全复制在线用户/Top连接/Top应用的统一样式 ===== */

.nv-border-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background: #f0f2f5;
  overflow: hidden;
}

.nv-tabs-header {
  flex-shrink: 0;
  padding: 0 16px;
  border-bottom: 1px solid #e4e7ed;
  background: #fafafa;
}

.nv-tabs-nav {
  display: flex;
  gap: 0;
}

.nv-tab {
  position: relative;
  padding: 12px 20px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  color: #606266;
  cursor: pointer;
  white-space: nowrap;
}

.nv-tab.active {
  color: #409eff;
}

.nv-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20px;
  right: 20px;
  height: 2px;
  background: #409eff;
  border-radius: 1px 1px 0 0;
}

.nv-tabs-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.to-dashboard-scroll {
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.to-dashboard {
  padding: 12px;
  background: #f0f2f5;
}

.to-dashboard > * + * {
  margin-top: 12px;
}

.to-chart-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.to-chart-panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.to-chart-panel-full {
  grid-column: 1 / -1;
}

.to-filter-container {
  padding: 16px 20px;
  background: #fafbfc;
  border-bottom: 2px solid #e4e7ed;
}

.to-filter-row-simple {
  display: flex;
  align-items: center;
  gap: 16px;
}

.to-divider {
  height: 1px;
  background: linear-gradient(to right, transparent, #e4e7ed 20%, #e4e7ed 80%, transparent);
  margin: 0 -20px;
}

.to-filter-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.to-filter-label {
  font-size: 13px;
  color: #606266;
  white-space: nowrap;
  font-weight: 500;
}

.to-filter-select {
  height: 32px;
  padding: 0 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
  background: #fff;
  color: #303133;
  min-width: 120px;
}

.to-search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.to-input {
  height: 32px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
  width: 200px;
  color: #303133;
}

.to-input-short {
  width: 140px;
}

.to-input:focus {
  outline: none;
  border-color: #409eff;
}

.to-btn-primary {
  height: 32px;
  padding: 0 16px;
  border: 1px solid #409eff;
  border-radius: 4px;
  background: #409eff;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
}

.to-btn-primary:hover {
  background: #66b1ff;
  border-color: #66b1ff;
}

.to-btn-default {
  height: 28px;
  padding: 0 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  color: #606266;
  font-size: 12px;
  cursor: pointer;
}

.to-btn-small {
  height: 28px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  color: #909399;
  font-size: 12px;
  cursor: pointer;
}

.to-btn-small:hover {
  border-color: #409eff;
  color: #409eff;
}

/* 表格容器 */
.to-table-wrapper {
  overflow-x: auto;
  padding: 14px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.to-table-data {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 13px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
}

.to-table-data thead {
  position: sticky;
  top: 0;
  z-index: 10;
}

.to-table-data th {
  background: linear-gradient(180deg, #f5f7fa 0%, #ecf5ff 100%);
  border-right: 1px solid #dcdfe6;
  border-bottom: 2px solid #409eff;
  padding: 12px 14px;
  text-align: left;
  font-weight: 700;
  color: #1a1a1a;
  white-space: nowrap;
  font-size: 12.5px;
  position: relative;
  letter-spacing: 0.3px;
}

.to-table-data th:last-child {
  border-right: none;
}

.to-table-data td {
  border-right: 1px solid #f0f0f0;
  border-bottom: 1px solid #f5f5f5;
  padding: 10px 14px;
  color: #303133;
  vertical-align: middle;
  transition: all 0.15s ease;
}

.to-table-data td:last-child {
  border-right: none;
}

.to-table-data tr:hover td {
  background: #f0f9ff;
  border-bottom-color: #bae7ff;
}

.to-table-data tbody tr:nth-child(even) td {
  background: #fafcff;
}

.to-table-data tbody tr:nth-child(even):hover td {
  background: #e6f7ff;
}

.to-row-active {
  background: #fafcff !important;
}

.to-row-active:hover {
  background: #e6f7ff !important;
}

.sort-icon {
  color: #909399;
  font-size: 11px;
  margin-left: 6px;
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.2s ease;
}

.sort-icon:hover {
  color: #409eff;
  opacity: 1;
  transform: scale(1.1);
}

.to-link-text {
  color: #1890ff;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
  display: inline-block;
}

.to-link-text:hover {
  text-decoration: underline;
  color: #096dd9;
  transform: translateX(2px);
}

.to-num-cell {
  text-align: right;
  font-variant-numeric: tabular-nums;
  font-family: 'SF Mono', 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 12.5px;
  color: #262626;
  font-weight: 500;
  letter-spacing: -0.3px;
}

.location-badge {
  display: inline-block;
  padding: 2px 8px;
  background: #fef0f0;
  color: #f56c6c;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 600;
}

/* 分页栏 */
.to-pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 14px;
  border-top: 1px solid #ebeef5;
  background: #fafbfc;
  flex-shrink: 0;
}

.to-page-info {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.to-page-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.to-page-btn {
  min-width: 30px;
  height: 30px;
  padding: 0 6px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  color: #606266;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.to-page-btn:hover:not(:disabled) {
  border-color: #409eff;
  color: #409eff;
}

.to-page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f5f7fa;
}

.to-page-num {
  min-width: 30px;
  height: 30px;
  padding: 0 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  color: #606266;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.to-page-num:hover {
  border-color: #409eff;
  color: #409eff;
}

.to-page-num.active {
  background: #409eff;
  color: #fff;
  border-color: #409eff;
  font-weight: 700;
}

.to-page-dots {
  color: #c0c4cc;
  padding: 0 4px;
  font-size: 13px;
}

.to-jump-input {
  width: 46px;
  height: 30px;
  text-align: center;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
  color: #303133;
}

.to-jump-input:focus {
  outline: none;
  border-color: #409eff;
}

.ta-placeholder {
  padding: 40px;
  text-align: center;
  color: #909399;
  font-size: 14px;
}

/* ===== 域名趋势页面样式 - 与实时请求/历史请求保持一致 ===== */

.to-time-range-row {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 10px;
  padding: 8px 0;
  border-top: 1px solid #ebeef5;
}

.to-input-medium {
  width: 320px;
  height: 32px;
  padding: 0 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
  color: #303133;
  background: white;
}

.to-input-medium:focus {
  outline: none;
  border-color: #409eff;
}

.ip-type-btn {
  padding: 6px 16px;
  border: 1px solid #dcdfe6;
  background: white;
  color: #606266;
  cursor: pointer;
  border-radius: 4px;
  font-size: 13px;
  transition: all 0.2s;
}

.ip-type-btn:hover {
  border-color: #409eff;
  color: #409eff;
}

.ip-type-btn.active {
  background: #409eff;
  color: white;
  border-color: #409eff;
}

.to-charts-wrapper {
  width: 100%;
  overflow-x: auto;
}

.to-chart-block {
  margin-bottom: 24px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
  overflow: hidden;
}

.to-chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #fafafa;
  border-bottom: 1px solid #ebeef5;
}

.to-chart-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.to-chart-actions {
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.data-point-info {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}

.to-chart-legend-inline {
  display: flex;
  gap: 12px;
  align-items: center;
}

.legend-dot {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #606266;
  padding: 2px 8px;
  border-radius: 3px;
  background: rgba(64, 158, 255, 0.08);
}

.legend-dot::before {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.to-chart-body {
  padding: 20px;
  min-height: 350px;
  position: relative;
  background: linear-gradient(to bottom, #fafbfc 0%, #f5f7fa 100%);
}

.to-chart-body canvas {
  width: 100% !important;
  height: auto !important;
}
</style>