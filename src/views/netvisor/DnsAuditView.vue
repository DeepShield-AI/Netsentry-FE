<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav nv-tabs-nav-wrap" role="tablist" aria-label="DNS审计">
        <button v-for="t in tabs" :key="t.key" type="button" class="nv-tab" :class="{ active: activeTab === t.key }" @click="activeTab = t.key">{{ t.label }}</button>
      </div>
    </div>
    <div class="nv-tabs-body">

      <!-- ==================== DNS诊断 Tab ==================== -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'diagnosis' }">
        <!-- 筛选区域 -->
        <div class="tdh-filters">
          <div class="tdh-filter-row">
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">源IP</span>
              <select class="ou-toolbar-select" v-model="diagFilter.srcIpType">
                <option value="any">任意IP</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">
                <el-icon><Filter /></el-icon> 过滤源
              </span>
              <select class="ou-toolbar-select" v-model="diagFilter.filterSrc">
                <option value="no">否</option>
                <option value="yes">是</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">源端口</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="diagFilter.srcPort" placeholder="80 / 8000-8080" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">目标IP</span>
              <select class="ou-toolbar-select" v-model="diagFilter.dstIpType">
                <option value="any">任意IP</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">
                <el-icon><Filter /></el-icon> 过滤目标
              </span>
              <select class="ou-toolbar-select" v-model="diagFilter.filterDst">
                <option value="no">否</option>
                <option value="yes">是</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">目标端口</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="diagFilter.dstPort" placeholder="53" />
            </label>
          </div>
          <div class="tdh-filter-row">
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">MAC</span>
              <select class="ou-toolbar-select" v-model="diagFilter.mac">
                <option value="">任意</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">源IP ISP</span>
              <select class="ou-toolbar-select" v-model="diagFilter.srcIpIsp">
                <option value="any">任意</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">目标IP ISP</span>
              <select class="ou-toolbar-select" v-model="diagFilter.dstIpIsp">
                <option value="any">任意</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">源IP区域</span>
              <select class="ou-toolbar-select" v-model="diagFilter.srcIpRegion">
                <option value="any">任意</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">目标IP区域</span>
              <select class="ou-toolbar-select" v-model="diagFilter.dstIpRegion">
                <option value="any">任意</option>
              </select>
            </label>
          </div>
          <div class="tdh-filter-row">
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">传输协议</span>
              <select class="ou-toolbar-select" v-model="diagFilter.transportProtocol">
                <option value="">任意</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">用户组</span>
              <select class="ou-toolbar-select" v-model="diagFilter.userGroup">
                <option value="">任意</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">用户名称</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="diagFilter.userName" placeholder="" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">域名</span>
              <select class="ou-toolbar-select" v-model="diagFilter.domain">
                <option value="">任意</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">链路</span>
              <select class="ou-toolbar-select" v-model="diagFilter.link">
                <option value="">任意</option>
              </select>
            </label>
          </div>
          <div class="tdh-filter-row">
            <label class="tdh-filter-field tdh-filter-time">
              <span class="ou-toolbar-label">时间范围</span>
              <input class="ou-toolbar-input tdh-time-range" v-model="diagFilter.timeRange" />
            </label>
            <button class="ou-search-btn" @click="doDiagSearch">
              <el-icon><Search /></el-icon>
            </button>
            <button class="secondary td-reset-btn" @click="resetDiagFilters">重置</button>
            <div class="tdh-filter-right">
              <div class="tio-range-btns">
                <button class="tio-range-btn" :class="{ active: diagIpVersion === 'v4' }" @click="diagIpVersion = 'v4'">IPv4</button>
                <button class="tio-range-btn" :class="{ active: diagIpVersion === 'v6' }" @click="diagIpVersion = 'v6'">IPv6</button>
              </div>
              <button style="border:none;background:none;cursor:pointer;color:#409eff;font-size:13px;margin-left:8px" @click="doDiagExport">
                <el-icon><Download /></el-icon> 导出
              </button>
            </div>
          </div>
        </div>

        <!-- 图表区域 -->
        <div class="dns-chart-grid">
          <div style="background:#fff;border:1px solid #ebeef5;border-radius:4px;padding:12px">
            <div style="font-size:13px;font-weight:600;margin-bottom:8px;color:#303133">
              <el-icon style="margin-right:4px"><DataAnalysis /></el-icon> 连接数
            </div>
            <v-chart :option="connChartOption" autoresize style="width:100%;height:300px" />
          </div>
          <div style="background:#fff;border:1px solid #ebeef5;border-radius:4px;padding:12px">
            <div style="font-size:13px;font-weight:600;margin-bottom:8px;color:#303133">
              <el-icon style="margin-right:4px"><DataAnalysis /></el-icon> 上行流量 / 下行流量
            </div>
            <v-chart :option="trafficChartOption" autoresize style="width:100%;height:300px" />
          </div>
        </div>

        <!-- 协议表格 + 三个数据表格 -->
        <div class="dns-content-grid">
          <!-- 应用协议表 -->
          <div style="background:#fff;border:1px solid #ebeef5;border-radius:4px;padding:12px">
            <div style="font-size:13px;font-weight:600;margin-bottom:8px;color:#303133">
              <el-icon style="margin-right:4px"><DataAnalysis /></el-icon> 应用协议
            </div>
            <table class="ou-table audit-table" style="margin:0">
              <thead>
                <tr>
                  <th style="width:40px">序号</th>
                  <th>应用协议</th>
                  <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th>上行 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th>下行 <el-icon class="sort-icon"><Sort /></el-icon></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in protoPageData" :key="idx">
                  <td>{{ (protoPage - 1) * protoPageSize + idx + 1 }}</td>
                  <td style="font-size:12px;color:#409eff">{{ row.protocol }}</td>
                  <td class="ou-num">{{ row.totalReq }}</td>
                  <td class="ou-num">{{ row.upload }}</td>
                  <td class="ou-num">{{ row.download }}</td>
                </tr>
              </tbody>
            </table>
            <div class="ou-footer" style="margin-top:8px">
              <div class="ou-pager">
                <button class="ou-page-btn" @click="protoPage > 1 && protoPage--">‹</button>
                <button v-for="p in protoPages" :key="p" class="ou-page-btn" :class="{ active: p === protoPage }" @click="protoPage = p">{{ p }}</button>
                <button class="ou-page-btn" @click="protoPage < protoPages && protoPage++">›</button>
              </div>
              <span style="font-size:12px;color:#909399">共 {{ protoData.length }} 条</span>
            </div>
          </div>

          <!-- 源IP表 -->
          <div style="background:#fff;border:1px solid #ebeef5;border-radius:4px;padding:12px">
            <table class="ou-table audit-table" style="margin:0">
              <thead>
                <tr>
                  <th style="width:40px">序号</th>
                  <th>源IP</th>
                  <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th>上行 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th>下行 <el-icon class="sort-icon"><Sort /></el-icon></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in srcIpPageData" :key="idx">
                  <td>{{ (srcIpPage - 1) * srcIpPageSize + idx + 1 }}</td>
                  <td><span class="tid-link" @click="openSessionDiagPopup(row.ip, 'src')">{{ row.ip }}</span></td>
                  <td class="ou-num">{{ row.totalReq }}</td>
                  <td class="ou-num">{{ row.upload }}</td>
                  <td class="ou-num">{{ row.download }}</td>
                </tr>
              </tbody>
            </table>
            <div class="ou-footer" style="margin-top:8px">
              <div class="ou-pager">
                <button class="ou-page-btn" @click="srcIpPage > 1 && srcIpPage--">‹</button>
                <button v-for="p in srcIpPages" :key="p" class="ou-page-btn" :class="{ active: p === srcIpPage }" @click="srcIpPage = p">{{ p }}</button>
                <button class="ou-page-btn" @click="srcIpPage < srcIpPages && srcIpPage++">›</button>
              </div>
              <span style="font-size:12px;color:#909399">共 {{ srcIpData.length }} 条</span>
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
                  <th>上行 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th>下行 <el-icon class="sort-icon"><Sort /></el-icon></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in dstIpPageData" :key="idx">
                  <td>{{ (dstIpPage - 1) * dstIpPageSize + idx + 1 }}</td>
                  <td><span class="tid-link" @click="openSessionDiagPopup(row.ip, 'dst')">{{ row.ip }}</span></td>
                  <td class="ou-num">{{ row.totalReq }}</td>
                  <td class="ou-num">{{ row.upload }}</td>
                  <td class="ou-num">{{ row.download }}</td>
                </tr>
              </tbody>
            </table>
            <div class="ou-footer" style="margin-top:8px">
              <div class="ou-pager">
                <button class="ou-page-btn" @click="dstIpPage > 1 && dstIpPage--">‹</button>
                <button v-for="p in dstIpPages" :key="p" class="ou-page-btn" :class="{ active: p === dstIpPage }" @click="dstIpPage = p">{{ p }}</button>
                <button class="ou-page-btn" @click="dstIpPage < dstIpPages && dstIpPage++">›</button>
              </div>
              <span style="font-size:12px;color:#909399">共 {{ dstIpData.length }} 条</span>
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
                  <th>上行 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th>下行 <el-icon class="sort-icon"><Sort /></el-icon></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in domainPageData" :key="idx">
                  <td>{{ (domainPage - 1) * domainPageSize + idx + 1 }}</td>
                  <td><span class="tid-link" @click="openSessionDiagPopup(row.domain, 'domain')">{{ row.domain }}</span></td>
                  <td class="ou-num">{{ row.totalReq }}</td>
                  <td class="ou-num">{{ row.upload }}</td>
                  <td class="ou-num">{{ row.download }}</td>
                </tr>
              </tbody>
            </table>
            <div class="ou-footer" style="margin-top:8px">
              <div class="ou-pager">
                <button class="ou-page-btn" @click="domainPage > 1 && domainPage--">‹</button>
                <button v-for="p in domainPages" :key="p" class="ou-page-btn" :class="{ active: p === domainPage }" @click="domainPage = p">{{ p }}</button>
                <button class="ou-page-btn" @click="domainPage < domainPages && domainPage++">›</button>
              </div>
              <span style="font-size:12px;color:#909399">共 {{ domainData.length }} 条</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ==================== DNS会话 Tab ==================== -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'sessions' }">
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
              <input class="ou-toolbar-input tdh-filter-input" v-model="sessFilter.dstPort" placeholder="53" />
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
              <span class="ou-toolbar-label">响应时间>=</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="sessFilter.responseTimeMin" placeholder="ms" style="width:80px" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">查询类型</span>
              <select class="ou-toolbar-select" v-model="sessFilter.queryType">
                <option value="">任意</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">RCODE</span>
              <select class="ou-toolbar-select" v-model="sessFilter.rcode">
                <option value="">任意</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">异常</span>
              <select class="ou-toolbar-select" v-model="sessFilter.anomaly">
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
                <th>请求时间 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>MAC</th>
                <th>MAC厂商</th>
                <th>用户名称</th>
                <th>源IP</th>
                <th>DNS服务器</th>
                <th>目标IP地理位置</th>
                <th>查询域名</th>
                <th>查询类型</th>
                <th>响应记录</th>
                <th>TTL</th>
                <th>响应大小</th>
                <th>响应时间(ms)</th>
                <th>传输协议</th>
                <th>链路</th>
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
                <td><span class="tid-link" @click="openSessionDiagPopup(row.srcIp, 'src')">{{ row.srcIp }}</span></td>
                <td><span class="tid-link" @click="openSessionDiagPopup(row.dnsServer, 'dst')">{{ row.dnsServer }}</span></td>
                <td style="font-size:12px">{{ row.geoLocation }}</td>
                <td><span class="tid-link" @click="openSessionDiagPopup(row.queryDomain, 'domain')">{{ row.queryDomain }}</span></td>
                <td style="font-size:12px">{{ row.queryType }}</td>
                <td style="font-size:11px;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" :title="row.responseRecord">{{ row.responseRecord }}</td>
                <td class="ou-num">{{ row.ttl }}</td>
                <td class="ou-num">{{ row.responseSize }}</td>
                <td class="ou-num">{{ row.responseTime }}</td>
                <td style="font-size:12px">{{ row.transportProtocol }}</td>
                <td>{{ row.link }}</td>
                <td>
                  <span class="link-btn" @click.stop="openPacketPopup(row)">数据包</span>
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

        <!-- 数据包下拉菜单 -->
        <div v-if="packetMenuVisible" class="packet-context-menu" :style="{ left: packetMenuX + 'px', top: packetMenuY + 'px' }" @click.stop>
          <div class="packet-menu-item" @click="openPacketPopup(packetMenuRow)"><el-icon><InfoFilled /></el-icon> 报文分析</div>
          <div class="packet-menu-item" @click="openPacketPlayPopup(packetMenuRow)"><el-icon><VideoPlay /></el-icon> 报文播放</div>
          <div class="packet-menu-item" @click="downloadPacket(packetMenuRow)"><el-icon><Download /></el-icon> 报文下载</div>
          <div class="packet-menu-item" @click="downloadContent(packetMenuRow)"><el-icon><Download /></el-icon> 内容下载</div>
          <div class="packet-menu-item" @click="queryTailPacket(packetMenuRow)"><el-icon><InfoFilled /></el-icon> 尾包查询</div>
          <div class="packet-menu-item" @click="stitchSession(packetMenuRow)"><el-icon><InfoFilled /></el-icon> 会话缝合</div>
        </div>
      </div>
    </div>

    <!-- ==================== 会话诊断弹窗 ==================== -->
    <el-dialog
      v-model="sessionDiagVisible"
      title="会话诊断"
      width="95%"
      top="3vh"
      destroy-on-close
      class="hd-detail-dialog"
    >
      <div class="tdh-filters" style="background:#f5f7fa;border-radius:4px;margin-bottom:12px">
        <div class="tdh-filter-row">
          <label class="tdh-filter-field" v-if="sessionDiagType === 'src'">
            <span class="ou-toolbar-label">单个IP</span>
            <input class="ou-toolbar-input tdh-filter-input" v-model="sessionDiagFilter.srcIp" style="width:120px" readonly />
            <el-icon style="cursor:pointer;color:#909399" @click="sessionDiagFilter.srcIp = ''"><Close /></el-icon>
          </label>
          <label class="tdh-filter-field" v-else>
            <span class="ou-toolbar-label">源IP</span>
            <select class="ou-toolbar-select" v-model="sessionDiagFilter.srcIpType">
              <option value="any">任意IP</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">
              <el-icon><Filter /></el-icon> 过滤源
            </span>
            <select class="ou-toolbar-select" v-model="sessionDiagFilter.filterSrc">
              <option value="no">否</option>
              <option value="yes">是</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">源端口</span>
            <input class="ou-toolbar-input tdh-filter-input" v-model="sessionDiagFilter.srcPort" placeholder="80 / 8000-8080" />
          </label>
          <label class="tdh-filter-field" v-if="sessionDiagType === 'dst'">
            <span class="ou-toolbar-label">目标IP</span>
            <input class="ou-toolbar-input tdh-filter-input" v-model="sessionDiagFilter.dstIp" style="width:120px" readonly />
            <el-icon style="cursor:pointer;color:#909399" @click="sessionDiagFilter.dstIp = ''"><Close /></el-icon>
          </label>
          <label class="tdh-filter-field" v-else>
            <span class="ou-toolbar-label">目标IP</span>
            <select class="ou-toolbar-select" v-model="sessionDiagFilter.dstIpType">
              <option value="any">任意IP</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">
              <el-icon><Filter /></el-icon> 过滤目标
            </span>
            <select class="ou-toolbar-select" v-model="sessionDiagFilter.filterDst">
              <option value="no">否</option>
              <option value="yes">是</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">目标端口</span>
            <input class="ou-toolbar-input tdh-filter-input" v-model="sessionDiagFilter.dstPort" placeholder="53" />
          </label>
        </div>
        <div class="tdh-filter-row">
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">MAC</span>
            <select class="ou-toolbar-select" v-model="sessionDiagFilter.mac">
              <option value="">任意</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">应用协议</span>
            <select class="ou-toolbar-select" v-model="sessionDiagFilter.appProtocol">
              <option value="DNS">DNS</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">源IP ISP</span>
            <select class="ou-toolbar-select" v-model="sessionDiagFilter.srcIpIsp">
              <option value="any">任意</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">目标IP ISP</span>
            <select class="ou-toolbar-select" v-model="sessionDiagFilter.dstIpIsp">
              <option value="any">任意</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">源IP区域</span>
            <select class="ou-toolbar-select" v-model="sessionDiagFilter.srcIpRegion">
              <option value="any">任意</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">目标IP区域</span>
            <select class="ou-toolbar-select" v-model="sessionDiagFilter.dstIpRegion">
              <option value="any">任意</option>
            </select>
          </label>
        </div>
        <div class="tdh-filter-row">
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">传输协议</span>
            <select class="ou-toolbar-select" v-model="sessionDiagFilter.transportProtocol">
              <option value="">任意</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">用户组</span>
            <select class="ou-toolbar-select" v-model="sessionDiagFilter.userGroup">
              <option value="">任意</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">用户名称</span>
            <input class="ou-toolbar-input tdh-filter-input" v-model="sessionDiagFilter.userName" placeholder="" />
          </label>
          <label class="tdh-filter-field" v-if="sessionDiagType === 'domain'">
            <span class="ou-toolbar-label">域名</span>
            <input class="ou-toolbar-input tdh-filter-input" v-model="sessionDiagFilter.domain" style="width:120px" readonly />
            <el-icon style="cursor:pointer;color:#909399" @click="sessionDiagFilter.domain = ''"><Close /></el-icon>
          </label>
          <label class="tdh-filter-field" v-else>
            <span class="ou-toolbar-label">域名</span>
            <select class="ou-toolbar-select" v-model="sessionDiagFilter.domainSelect">
              <option value="">任意</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">链路</span>
            <select class="ou-toolbar-select" v-model="sessionDiagFilter.link">
              <option value="">任意</option>
            </select>
          </label>
        </div>
        <div class="tdh-filter-row">
          <label class="tdh-filter-field tdh-filter-time">
            <span class="ou-toolbar-label">时间范围</span>
            <input class="ou-toolbar-input tdh-time-range" v-model="sessionDiagFilter.timeRange" />
          </label>
          <button class="ou-search-btn">
            <el-icon><Search /></el-icon>
          </button>
          <button class="secondary td-reset-btn">重置</button>
          <div class="tdh-filter-right">
            <div class="tio-range-btns">
              <button class="tio-range-btn" :class="{ active: sessionDiagIpVersion === 'v4' }" @click="sessionDiagIpVersion = 'v4'">IPv4</button>
              <button class="tio-range-btn" :class="{ active: sessionDiagIpVersion === 'v6' }" @click="sessionDiagIpVersion = 'v6'">IPv6</button>
            </div>
            <button style="border:none;background:none;cursor:pointer;color:#409eff;font-size:13px;margin-left:8px">
              <el-icon><Download /></el-icon> 导出
            </button>
          </div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="dns-chart-grid" style="margin-bottom:12px">
        <div style="background:#fff;border:1px solid #ebeef5;border-radius:4px;padding:12px">
          <div style="font-size:13px;font-weight:600;margin-bottom:8px;color:#303133">
            <el-icon style="margin-right:4px"><DataAnalysis /></el-icon> 连接数
          </div>
          <v-chart :option="sdConnChartOption" autoresize style="width:100%;height:180px" />
        </div>
        <div style="background:#fff;border:1px solid #ebeef5;border-radius:4px;padding:12px">
          <div style="font-size:13px;font-weight:600;margin-bottom:8px;color:#303133">
            <el-icon style="margin-right:4px"><DataAnalysis /></el-icon> 上行流量 / 下行流量
          </div>
          <v-chart :option="sdTrafficChartOption" autoresize style="width:100%;height:180px" />
        </div>
      </div>

      <!-- 协议表 + 三个表格 -->
      <div class="dns-content-grid">
        <!-- 应用协议表 -->
        <div style="background:#fff;border:1px solid #ebeef5;border-radius:4px;padding:12px">
          <table class="ou-table audit-table" style="margin:0">
            <thead>
              <tr>
                <th style="width:40px">序号</th>
                <th>应用协议</th>
                <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>上行 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>下行 <el-icon class="sort-icon"><Sort /></el-icon></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="sdProtoData.length === 0">
                <td colspan="5" class="ou-empty">数据加载中</td>
              </tr>
              <tr v-for="(row, idx) in sdProtoData" :key="idx">
                <td>{{ idx + 1 }}</td>
                <td style="font-size:12px;color:#409eff">{{ row.protocol }}</td>
                <td class="ou-num">{{ row.totalReq }}</td>
                <td class="ou-num">{{ row.upload }}</td>
                <td class="ou-num">{{ row.download }}</td>
              </tr>
            </tbody>
          </table>
          <div class="ou-footer" style="margin-top:8px">
            <div class="ou-pager">
              <button class="ou-page-btn">‹</button>
              <button class="ou-page-btn">›</button>
            </div>
            <span style="font-size:12px;color:#909399">共 {{ sdProtoData.length }} 条</span>
          </div>
        </div>

        <!-- 源IP表 -->
        <div style="background:#fff;border:1px solid #ebeef5;border-radius:4px;padding:12px">
          <table class="ou-table audit-table" style="margin:0">
            <thead>
              <tr>
                <th style="width:40px">序号</th>
                <th>源IP</th>
                <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>上行 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>下行 <el-icon class="sort-icon"><Sort /></el-icon></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="sdSrcIpData.length === 0">
                <td colspan="5" class="ou-empty">数据加载中</td>
              </tr>
              <tr v-for="(row, idx) in sdSrcIpData" :key="idx">
                <td>{{ idx + 1 }}</td>
                <td><span class="tid-link">{{ row.ip }}</span></td>
                <td class="ou-num">{{ row.totalReq }}</td>
                <td class="ou-num">{{ row.upload }}</td>
                <td class="ou-num">{{ row.download }}</td>
              </tr>
            </tbody>
          </table>
          <div class="ou-footer" style="margin-top:8px">
            <div class="ou-pager">
              <button class="ou-page-btn">‹</button>
              <button class="ou-page-btn">›</button>
            </div>
            <span style="font-size:12px;color:#909399">共 {{ sdSrcIpData.length }} 条</span>
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
                <th>上行 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>下行 <el-icon class="sort-icon"><Sort /></el-icon></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="sdDstIpData.length === 0">
                <td colspan="5" class="ou-empty">数据加载中</td>
              </tr>
              <tr v-for="(row, idx) in sdDstIpData" :key="idx">
                <td>{{ idx + 1 }}</td>
                <td><span class="tid-link">{{ row.ip }}</span></td>
                <td class="ou-num">{{ row.totalReq }}</td>
                <td class="ou-num">{{ row.upload }}</td>
                <td class="ou-num">{{ row.download }}</td>
              </tr>
            </tbody>
          </table>
          <div class="ou-footer" style="margin-top:8px">
            <div class="ou-pager">
              <button class="ou-page-btn">‹</button>
              <button class="ou-page-btn">›</button>
            </div>
            <span style="font-size:12px;color:#909399">共 {{ sdDstIpData.length }} 条</span>
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
                <th>上行 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>下行 <el-icon class="sort-icon"><Sort /></el-icon></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="sdDomainData.length === 0">
                <td colspan="5" class="ou-empty">数据加载中</td>
              </tr>
              <tr v-for="(row, idx) in sdDomainData" :key="idx">
                <td>{{ idx + 1 }}</td>
                <td><span class="tid-link">{{ row.domain }}</span></td>
                <td class="ou-num">{{ row.totalReq }}</td>
                <td class="ou-num">{{ row.upload }}</td>
                <td class="ou-num">{{ row.download }}</td>
              </tr>
            </tbody>
          </table>
          <div class="ou-footer" style="margin-top:8px">
            <div class="ou-pager">
              <button class="ou-page-btn">‹</button>
              <button class="ou-page-btn">›</button>
            </div>
            <span style="font-size:12px;color:#909399">共 {{ sdDomainData.length }} 条</span>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- ==================== 报文分析弹窗 ==================== -->
    <el-dialog v-model="packetVisible" title="报文分析->DNS - Google Chrome" width="95%" top="3vh" destroy-on-close class="hd-detail-dialog">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div style="display:flex;gap:16px">
          <span v-for="t in packetTabs" :key="t.key" style="font-size:13px;cursor:pointer;padding-bottom:4px;border-bottom:2px solid transparent" :style="{ color: packetActiveTab === t.key ? '#409eff' : '#909399', borderColor: packetActiveTab === t.key ? '#409eff' : 'transparent' }" @click="packetActiveTab = t.key">{{ t.label }}</span>
        </div>
        <div style="display:flex;align-items:center;gap:12px">
          <span style="font-size:13px;color:#606266">应用协议: <b>{{ packetData.protocol }}</b></span>
          <button style="border:none;background:none;cursor:pointer;color:#409eff;font-size:13px" @click="downloadPacketFromPopup"><el-icon><Download /></el-icon> 报文下载</button>
          <button style="border:none;background:none;cursor:pointer;color:#409eff;font-size:13px" @click="downloadContentFromPopup"><el-icon><Download /></el-icon> 内容下载</button>
        </div>
      </div>

      <!-- 报文解析 -->
      <div v-if="packetActiveTab === 'parse'">
        <div style="display:flex;gap:8px;margin-bottom:12px">
          <el-input v-model="packetFilterText" class="ou-toolbar-input" placeholder="报文显示过滤器" :prefix-icon="Search" style="flex:1" />
          <select v-model="packetTopN" class="ou-toolbar-select" style="width:100px">
            <option value="100">TOP 100</option>
            <option value="200">TOP 200</option>
            <option value="500">TOP 500</option>
          </select>
        </div>
        <table class="ou-table" style="width:100%;border-collapse:collapse;font-size:12px">
          <thead>
            <tr style="background:#f5f7fa">
              <th style="padding:6px 8px;text-align:left;border:1px solid #ebeef5">序号 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th style="padding:6px 8px;text-align:left;border:1px solid #ebeef5">时间 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th style="padding:6px 8px;text-align:left;border:1px solid #ebeef5">源地址 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th style="padding:6px 8px;text-align:left;border:1px solid #ebeef5">目标地址 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th style="padding:6px 8px;text-align:left;border:1px solid #ebeef5">网络协议 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th style="padding:6px 8px;text-align:left;border:1px solid #ebeef5">长度 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th style="padding:6px 8px;text-align:left;border:1px solid #ebeef5">详情 <el-icon class="sort-icon"><Sort /></el-icon></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(pkt, i) in packetData.packets" :key="i" :style="{background: i === 0 ? '#e8f5e9' : i === 1 ? '#e3f2fd' : 'transparent'}" @click="packetSelectedIdx = i; packetExpandedRow = i" :class="{ 'pkt-row-selected': packetSelectedIdx === i }">
              <td style="padding:6px 8px;border:1px solid #ebeef5">{{ i + 1 }}</td>
              <td style="padding:6px 8px;border:1px solid #ebeef5">{{ pkt.time }}</td>
              <td style="padding:6px 8px;border:1px solid #ebeef5">{{ pkt.src }}</td>
              <td style="padding:6px 8px;border:1px solid #ebeef5">{{ pkt.dst }}</td>
              <td style="padding:6px 8px;border:1px solid #ebeef5">{{ pkt.protocol }}</td>
              <td style="padding:6px 8px;border:1px solid #ebeef5">{{ pkt.length }}</td>
              <td style="padding:6px 8px;border:1px solid #ebeef5;font-size:11px">{{ pkt.detail }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="packetExpandedRow >= 0" style="margin-top:12px;padding:8px 12px;background:#fff;border:1px solid #ebeef5;border-radius:4px;font-size:12px">
          <div v-for="(item, idx) in packetData.detailTree" :key="idx" style="margin-bottom:4px">
            <span style="color:#409eff;cursor:pointer;user-select:none" @click="item.expanded = !item.expanded">{{ item.expanded ? '▼' : '▶' }}</span>
            <span style="margin-left:4px;color:#303133">{{ item.label }}</span>
            <div v-if="item.expanded" v-for="(sub, sIdx) in item.children" :key="sIdx" style="margin-left:20px;margin-top:2px;color:#606266">
              <span style="color:#409eff;cursor:pointer;user-select:none" @click="sub.expanded = !sub.expanded">{{ sub.expanded ? '▼' : '▶' }}</span>
              <span style="margin-left:4px">{{ sub.label }}</span>
            </div>
          </div>
        </div>
        <div v-if="packetExpandedRow >= 0" style="margin-top:12px;background:#1e1e1e;color:#d4d4d4;padding:12px;border-radius:4px;font-family:monospace;font-size:12px;overflow-x:auto">
          <div v-for="(line, i) in packetData.hexDump" :key="i">{{ line }}</div>
        </div>
      </div>

      <!-- 报文交互 -->
      <div v-if="packetActiveTab === 'interaction'">
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:12px">
          <div style="padding:8px;background:#f5f7fa;border-radius:4px;font-size:12px"><div style="color:#909399">源IP</div><div style="color:#303133;margin-top:4px;font-weight:500">{{ packetData.packets[0]?.src || '-' }}</div></div>
          <div style="padding:8px;background:#f5f7fa;border-radius:4px;font-size:12px"><div style="color:#909399">目标IP</div><div style="color:#303133;margin-top:4px;font-weight:500">{{ packetData.packets[0]?.dst || '-' }}</div></div>
          <div style="padding:8px;background:#f5f7fa;border-radius:4px;font-size:12px"><div style="color:#909399">源端口</div><div style="color:#303133;margin-top:4px;font-weight:500">{{ packetData.packets[0]?.src?.split(':')[1] || '-' }}</div></div>
          <div style="padding:8px;background:#f5f7fa;border-radius:4px;font-size:12px"><div style="color:#909399">目标端口</div><div style="color:#303133;margin-top:4px;font-weight:500">53</div></div>
        </div>
        <div style="margin-bottom:12px;font-size:13px;color:#303133;font-weight:500">交互过程</div>
        <div style="display:flex;gap:16px;margin-bottom:12px">
          <div style="flex:1">
            <div style="font-size:12px;color:#606266;margin-bottom:6px">Source</div>
            <div style="background:#1e1e1e;color:#d4d4d4;padding:12px;border-radius:4px;font-family:monospace;font-size:12px;overflow-x:auto;min-height:120px">
              <div v-for="(line, i) in interactionSourceBlocks" :key="i">{{ line }}</div>
            </div>
          </div>
          <div style="flex:1">
            <div style="font-size:12px;color:#606266;margin-bottom:6px">Destination</div>
            <div style="background:#1e1e1e;color:#d4d4d4;padding:12px;border-radius:4px;font-family:monospace;font-size:12px;overflow-x:auto;min-height:120px">
              <div v-for="(line, i) in interactionDstBlocks" :key="i">{{ line }}</div>
            </div>
          </div>
        </div>
        <div style="display:flex;justify-content:flex-end;align-items:center;gap:8px">
          <button class="ou-btn ou-btn-sm" :disabled="interactionPage <= 1" @click="interactionPage--">上一页</button>
          <span style="font-size:12px;color:#606266">{{ interactionPage }} / {{ Math.max(1, Math.ceil(interactionTotal / 20)) }}</span>
          <button class="ou-btn ou-btn-sm" :disabled="interactionPage >= Math.max(1, Math.ceil(interactionTotal / 20))" @click="interactionPage++">下一页</button>
        </div>
      </div>

      <!-- 元数据 -->
      <div v-if="packetActiveTab === 'metadata'">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
          <span style="font-size:13px;color:#606266">展示方式</span>
          <select v-model="metadataDisplayMode" class="ou-toolbar-select" style="width:120px">
            <option value="attr">按属性</option>
            <option value="raw">原始</option>
          </select>
        </div>
        <div style="text-align:center;padding:60px 0;color:#909399">
          <el-icon :size="48"><DataAnalysis /></el-icon>
          <div style="margin-top:12px">暂无元数据</div>
        </div>
      </div>

      <!-- 证书分析 -->
      <div v-if="packetActiveTab === 'cert'">
        <div style="text-align:center;padding:60px 0;color:#909399">
          <el-icon :size="48"><InfoFilled /></el-icon>
          <div style="margin-top:12px">暂无证书信息</div>
        </div>
      </div>

      <!-- 报文播放 -->
      <div v-if="packetActiveTab === 'playback'">
        <div style="display:flex;gap:16px;align-items:center;margin-bottom:16px;flex-wrap:wrap">
          <label style="display:flex;align-items:center;gap:6px;font-size:13px;color:#606266">
            网卡
            <select v-model="playNic" class="ou-toolbar-select" style="width:160px">
              <option value="eth0">eth0</option>
              <option value="lo">lo</option>
            </select>
          </label>
          <label style="display:flex;align-items:center;gap:6px;font-size:13px;color:#606266">
            播放次数
            <input v-model="playCount" type="number" min="1" class="ou-toolbar-input" style="width:80px" />
          </label>
          <label style="display:flex;align-items:center;gap:6px;font-size:13px;color:#606266">
            速度选择
            <select v-model="playSpeed" class="ou-toolbar-select" style="width:100px">
              <option value="1">1x</option>
              <option value="2">2x</option>
              <option value="0.5">0.5x</option>
            </select>
          </label>
          <button class="ou-btn ou-btn-primary" @click="startPacketPlayback"><el-icon><VideoPlay /></el-icon> 开始播放</button>
        </div>
        <table class="ou-table" style="width:100%;border-collapse:collapse;font-size:12px">
          <thead>
            <tr style="background:#f5f7fa">
              <th style="padding:6px 8px;text-align:left;border:1px solid #ebeef5">时间</th>
              <th style="padding:6px 8px;text-align:left;border:1px solid #ebeef5">源地址</th>
              <th style="padding:6px 8px;text-align:left;border:1px solid #ebeef5">目标地址</th>
              <th style="padding:6px 8px;text-align:left;border:1px solid #ebeef5">长度</th>
              <th style="padding:6px 8px;text-align:left;border:1px solid #ebeef5">状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in playInfoItems" :key="i">
              <td style="padding:6px 8px;border:1px solid #ebeef5">{{ item.time }}</td>
              <td style="padding:6px 8px;border:1px solid #ebeef5">{{ item.src }}</td>
              <td style="padding:6px 8px;border:1px solid #ebeef5">{{ item.dst }}</td>
              <td style="padding:6px 8px;border:1px solid #ebeef5">{{ item.length }}</td>
              <td style="padding:6px 8px;border:1px solid #ebeef5">{{ item.status }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 时序图 -->
      <div v-if="packetActiveTab === 'timeline'">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
          <span style="font-size:13px;color:#606266">时间间隔阈值 (ms)</span>
          <input v-model="timeGapThreshold" type="number" min="0" class="ou-toolbar-input" style="width:100px" />
        </div>
        <table class="ou-table" style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:12px">
          <thead>
            <tr style="background:#f5f7fa">
              <th style="padding:6px 8px;text-align:left;border:1px solid #ebeef5">序号</th>
              <th style="padding:6px 8px;text-align:left;border:1px solid #ebeef5">时间</th>
              <th style="padding:6px 8px;text-align:left;border:1px solid #ebeef5">源</th>
              <th style="padding:6px 8px;text-align:left;border:1px solid #ebeef5">目标</th>
              <th style="padding:6px 8px;text-align:left;border:1px solid #ebeef5">协议</th>
              <th style="padding:6px 8px;text-align:left;border:1px solid #ebeef5">信息</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in timelineData" :key="i">
              <td style="padding:6px 8px;border:1px solid #ebeef5">{{ row.no }}</td>
              <td style="padding:6px 8px;border:1px solid #ebeef5">{{ row.time }}</td>
              <td style="padding:6px 8px;border:1px solid #ebeef5">{{ row.src }}</td>
              <td style="padding:6px 8px;border:1px solid #ebeef5">{{ row.dst }}</td>
              <td style="padding:6px 8px;border:1px solid #ebeef5">{{ row.protocol }}</td>
              <td style="padding:6px 8px;border:1px solid #ebeef5">{{ row.info }}</td>
            </tr>
          </tbody>
        </table>
        <div style="margin-bottom:12px;padding:8px 12px;background:#fff;border:1px solid #ebeef5;border-radius:4px;font-size:12px">
          <div v-for="(node, idx) in timelineProtocolTree" :key="idx" style="margin-bottom:4px">
            <span style="color:#409eff;cursor:pointer;user-select:none" @click="node.expanded = !node.expanded">{{ node.expanded ? '▼' : '▶' }}</span>
            <span style="margin-left:4px;color:#303133">{{ node.label }}</span>
          </div>
        </div>
        <div style="background:#1e1e1e;color:#d4d4d4;padding:12px;border-radius:4px;font-family:monospace;font-size:12px;overflow-x:auto;margin-bottom:12px">
          <div v-for="(line, i) in timelineHexDump" :key="i">{{ line }}</div>
        </div>
        <div style="display:flex;justify-content:flex-end;align-items:center;gap:8px">
          <button class="ou-btn ou-btn-sm" :disabled="timelinePage <= 1" @click="timelinePage--">上一页</button>
          <span style="font-size:12px;color:#606266">{{ timelinePage }}</span>
          <button class="ou-btn ou-btn-sm" @click="timelinePage++">下一页</button>
        </div>
      </div>
    </el-dialog>

    <!-- ==================== 日志详情弹窗 ==================== -->
    <el-dialog v-model="logDetailVisible" title="日志详情" width="60%" destroy-on-close class="hd-detail-dialog">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid #e4e7ed">
        <div style="display:flex;align-items:center;gap:12px">
          <div style="text-align:center">
            <div style="width:48px;height:48px;border:2px solid #e4e7ed;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto"><el-icon :size="24"><Monitor /></el-icon></div>
            <div style="font-size:12px;color:#606266;margin-top:4px">源IP: {{ logDetailData.srcIp }}</div>
            <div style="font-size:12px;color:#606266">源端口: {{ logDetailData.srcPort }}</div>
          </div>
          <div style="flex:1;text-align:center">
            <div style="font-size:14px;font-weight:600;color:#409eff">{{ logDetailData.protocol }}</div>
            <el-icon :size="20" style="color:#909399"><ArrowRight /></el-icon>
          </div>
          <div style="text-align:center">
            <div style="width:48px;height:48px;border:2px solid #e4e7ed;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto"><el-icon :size="24"><Connection /></el-icon></div>
            <div style="font-size:12px;color:#606266;margin-top:4px">目标IP: {{ logDetailData.dstIp }}</div>
            <div style="font-size:12px;color:#606266">目标端口: {{ logDetailData.dstPort }}</div>
          </div>
        </div>
      </div>
      <div style="margin-bottom:12px">
        <div style="font-size:13px;font-weight:600;color:#409eff;margin-bottom:8px"><el-icon style="margin-right:4px"><Upload /></el-icon> 请求</div>
        <div style="background:#f5f7fa;padding:12px;border-radius:4px;font-size:12px;min-height:60px;white-space:pre-wrap;word-break:break-all">{{ logDetailData.requestHeaders }}</div>
      </div>
      <div>
        <div style="font-size:13px;font-weight:600;color:#67c23a;margin-bottom:8px"><el-icon style="margin-right:4px"><Download /></el-icon> 响应</div>
        <div style="background:#f5f7fa;padding:12px;border-radius:4px;font-size:12px;min-height:60px;white-space:pre-wrap;word-break:break-all">{{ logDetailData.responseHeaders }}</div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import {
  TitleComponent, TooltipComponent, LegendComponent, GridComponent
} from 'echarts/components'
import {
  Search, Download, Sort, Monitor, Connection,
  Filter, ArrowUp, ArrowDown, Close,
  ArrowRight, Upload, DataAnalysis,
  InfoFilled, VideoPlay
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import './nv-shared.css'

use([CanvasRenderer, BarChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent])

// ── Tabs ──
const tabs = [
  { key: 'diagnosis', label: 'DNS诊断' },
  { key: 'sessions', label: 'DNS会话' },
]
const activeTab = ref('diagnosis')

// ── DNS诊断 Tab ──
const diagIpVersion = ref('v4')

const diagFilter = reactive({
  srcIpType: 'any', filterSrc: 'no', srcPort: '80 / 8000-8080',
  dstIpType: 'any', filterDst: 'no', dstPort: '53',
  mac: '', srcIpIsp: 'any', dstIpIsp: 'any',
  srcIpRegion: 'any', dstIpRegion: 'any',
  transportProtocol: '', userGroup: '', userName: '', domain: '', link: '',
  timeRange: '2026-07-14 10:31:22 - 2026-07-14 10:46:22'
})

// 连接数柱状图
const connChartOption = ref({
  tooltip: { trigger: 'axis' },
  grid: { left: 60, right: 20, top: 20, bottom: 40 },
  xAxis: {
    type: 'category',
    data: ['10:32:00', '10:33:00', '10:34:00', '10:35:00', '10:36:00', '10:37:00', '10:38:00', '10:39:00', '10:40:00', '10:41:00', '10:42:00', '10:43:00', '10:44:00', '10:45:00', '10:46:00'],
    axisLabel: { rotate: 45, fontSize: 9 }
  },
  yAxis: { type: 'value', name: '连接数', axisLabel: { formatter: (v: number) => v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v } },
  series: [{
    type: 'bar',
    data: [18000, 22000, 19000, 25000, 21000, 23000, 20000, 24000, 22000, 26000, 21000, 23000, 20000, 25000, 22000],
    itemStyle: { color: '#5b8ff9' },
    barWidth: '60%'
  }]
})

// 上行/下行流量柱状图
const trafficChartOption = ref({
  tooltip: { trigger: 'axis' },
  legend: { data: ['上行流量', '下行流量'], textStyle: { fontSize: 10 } },
  grid: { left: 60, right: 20, top: 30, bottom: 40 },
  xAxis: {
    type: 'category',
    data: ['10:32:00', '10:33:00', '10:34:00', '10:35:00', '10:36:00', '10:37:00', '10:38:00', '10:39:00', '10:40:00', '10:41:00', '10:42:00', '10:43:00', '10:44:00', '10:45:00', '10:46:00'],
    axisLabel: { rotate: 45, fontSize: 9 }
  },
  yAxis: { type: 'value', name: 'bps', axisLabel: { formatter: (v: number) => v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v } },
  series: [
    {
      name: '上行流量', type: 'bar',
      data: [120000, 110000, 130000, 115000, 125000, 118000, 122000, 128000, 116000, 132000, 119000, 126000, 121000, 129000, 123000],
      itemStyle: { color: '#f56c6c' },
      barWidth: '40%'
    },
    {
      name: '下行流量', type: 'bar',
      data: [100000, 95000, 105000, 98000, 102000, 96000, 101000, 104000, 97000, 108000, 99000, 103000, 100000, 106000, 101000],
      itemStyle: { color: '#5b8ff9' },
      barWidth: '40%'
    }
  ]
})

// 协议数据
const protoPage = ref(1)
const protoPageSize = ref(100)
const protoData = ref([
  { protocol: 'DNS', totalReq: 13036169, upload: '1.08 G', download: '155.99 M' },
])
const protoPages = computed(() => Math.max(1, Math.ceil(protoData.value.length / protoPageSize.value)))
const protoPageData = computed(() => protoData.value.slice((protoPage.value - 1) * protoPageSize.value, protoPage.value * protoPageSize.value))

// 源IP数据
const srcIpPage = ref(1)
const srcIpPageSize = ref(100)
const srcIpData = ref([
  { ip: '101.6.6.191', totalReq: 23616, upload: '2.51 M', download: '3.40 M' },
  { ip: '58.212.214.186', totalReq: 19591, upload: '1.44 M', download: '0.62 M' },
  { ip: '101.6.6.6', totalReq: 18097, upload: '1.43 M', download: '203.24 K' },
  { ip: '101.6.4.71', totalReq: 15252, upload: '1.21 M', download: '2.12 M' },
  { ip: '1.71.254.59', totalReq: 9835, upload: '850.05 K', download: '47.70 K' },
  { ip: '101.6.63.103', totalReq: 8127, upload: '1.08 M', download: '1.45 K' },
  { ip: '114.255.110.139', totalReq: 6962, upload: '550.93 K', download: '2.80 K' },
  { ip: '202.115.22.187', totalReq: 6853, upload: '569.76 K', download: '944.17 K' },
  { ip: '166.111.4.6', totalReq: 5314, upload: '628.05 K', download: '649.50 K' },
  { ip: '101.6.4.75', totalReq: 4407, upload: '358.67 K', download: '643.72 K' },
  { ip: '42.247.110.164', totalReq: 3958, upload: '376.32 K', download: '76.64 K' },
  { ip: '117.72.112.169', totalReq: 3865, upload: '276.02 K', download: '48.36 K' },
  { ip: '101.6.4.250', totalReq: 3337, upload: '273.62 K', download: '525.79 K' },
  { ip: '172.28.19.155', totalReq: 3067, upload: '253.28 K', download: '473.66 K' },
  { ip: '101.6.8.173', totalReq: 2954, upload: '540.01 K', download: '54.53 K' },
  { ip: '166.111.237.163', totalReq: 2974, upload: '303.70 K', download: '546.26 K' },
  { ip: '36.142.62.7', totalReq: 2670, upload: '225.33 K', download: '41.06 K' },
  { ip: '101.6.8.172', totalReq: 2624, upload: '485.80 K', download: '5.09 K' },
  { ip: '101.6.6.47', totalReq: 2372, upload: '207.81 K', download: '343.67 K' },
])
const srcIpPages = computed(() => Math.max(1, Math.ceil(srcIpData.value.length / srcIpPageSize.value)))
const srcIpPageData = computed(() => srcIpData.value.slice((srcIpPage.value - 1) * srcIpPageSize.value, srcIpPage.value * srcIpPageSize.value))

// 目标IP数据
const dstIpPage = ref(1)
const dstIpPageSize = ref(100)
const dstIpData = ref([
  { ip: '101.6.6.6', totalReq: 12839360, upload: '1.04 G', download: '90.74 M' },
  { ip: '101.6.6.172', totalReq: 116876, upload: '16.45 M', download: '25.02 M' },
  { ip: '101.6.6.173', totalReq: 114921, upload: '14.44 M', download: '25.02 M' },
  { ip: '166.111.8.28', totalReq: 26517, upload: '2.46 M', download: '4.25 M' },
  { ip: '166.111.4.9', totalReq: 16397, upload: '1.47 M', download: '2.39 M' },
  { ip: '166.111.4.30', totalReq: 14974, upload: '1.31 M', download: '2.20 M' },
  { ip: '166.111.101', totalReq: 7432, upload: '1.53 M', download: '0' },
  { ip: '166.111.8.30', totalReq: 2107, upload: '244.26 K', download: '364.33 K' },
  { ip: '114.114.114.114', totalReq: 2251, upload: '204.16 K', download: '252.20 K' },
  { ip: '42.187.255.2', totalReq: 974, upload: '95.80 K', download: '147.70 K' },
  { ip: '49.7.107.152', totalReq: 794, upload: '83.54 K', download: '116.72 K' },
  { ip: '117.135.128.152', totalReq: 750, upload: '78.16 K', download: '112.08 K' },
  { ip: '39.97.243.225', totalReq: 731, upload: '86.20 K', download: '111.70 K' },
  { ip: '39.97.243.225', totalReq: 731, upload: '86.20 K', download: '111.70 K' },
  { ip: '102.90.83.83', totalReq: 726, upload: '97.08 K', download: '0' },
  { ip: '140.205.1.6', totalReq: 682, upload: '73.32 K', download: '102.57 K' },
  { ip: '38.103.28.212', totalReq: 676, upload: '73.45 K', download: '101.70 K' },
  { ip: '140.205.1.5', totalReq: 603, upload: '65.74 K', download: '92.17 K' },
  { ip: '114.115.192.11', totalReq: 587, upload: '64.23 K', download: '56.72 K' },
  { ip: '114.115.192.208', totalReq: 586, upload: '64.19 K', download: '56.23 K' },
])
const dstIpPages = computed(() => Math.max(1, Math.ceil(dstIpData.value.length / dstIpPageSize.value)))
const dstIpPageData = computed(() => dstIpData.value.slice((dstIpPage.value - 1) * dstIpPageSize.value, dstIpPage.value * dstIpPageSize.value))

// 目标域名数据
const domainPage = ref(1)
const domainPageSize = ref(100)
const domainData = ref([
  { domain: 'aporta.sina.com.cn', totalReq: 183106, upload: '21.35 M', download: '1.45 M' },
  { domain: 'www.vmall.com', totalReq: 170871, upload: '15.78 M', download: '1.46 M' },
  { domain: 'mcg.baidu.com', totalReq: 159388, upload: '11.24 M', download: '1913.71 K' },
  { domain: 'www.huawei.com', totalReq: 124897, upload: '12.78 M', download: '1.58 M' },
  { domain: 'thevoice.sina.com.cn', totalReq: 106822, upload: '12.05 M', download: '1.10 M' },
  { domain: 'www.taobao.com', totalReq: 102654, upload: '7.37 M', download: '881.56 K' },
  { domain: 'www.sohu.com', totalReq: 102430, upload: '7.61 M', download: '743.04 K' },
  { domain: 'www.edu.cn', totalReq: 101734, upload: '6.88 M', download: '651.00 K' },
  { domain: 'www.alipayobjects.com', totalReq: 94215, upload: '7.19 M', download: '680.82 K' },
  { domain: 'www.mybank.cn', totalReq: 93314, upload: '9.48 M', download: '592.90 K' },
  { domain: 'www.360.com', totalReq: 85458, upload: '9.10 M', download: '763.48 K' },
  { domain: 'www.163.com', totalReq: 63061, upload: '4.45 M', download: '491.74 K' },
  { domain: 'www.baidu.com', totalReq: 62020, upload: '5.10 M', download: '771.02 K' },
  { domain: 'work.weixin.qq.com', totalReq: 60067, upload: '4.51 M', download: '415.89 K' },
  { domain: 'music.163.com', totalReq: 59888, upload: '4.34 M', download: '440.35 K' },
  { domain: 'game.163.com', totalReq: 59653, upload: '4.03 M', download: '374.25 K' },
  { domain: 'alfa.tuna.tsinghua.edu.cn', totalReq: 57761, upload: '5.69 M', download: '19.99 M' },
  { domain: 'www.csdn.net', totalReq: 57719, upload: '4.14 M', download: '366.57 K' },
  { domain: 'www.teng.com', totalReq: 55250, upload: '7.20 M', download: '508.64 K' },
])
const domainPages = computed(() => Math.max(1, Math.ceil(domainData.value.length / domainPageSize.value)))
const domainPageData = computed(() => domainData.value.slice((domainPage.value - 1) * domainPageSize.value, domainPage.value * domainPageSize.value))

function doDiagSearch() { /* mock */ }
function resetDiagFilters() {
  diagFilter.srcIpType = 'any'; diagFilter.filterSrc = 'no'; diagFilter.srcPort = '80 / 8000-8080'
  diagFilter.dstIpType = 'any'; diagFilter.filterDst = 'no'; diagFilter.dstPort = '53'
  diagFilter.mac = ''; diagFilter.srcIpIsp = 'any'; diagFilter.dstIpIsp = 'any'
  diagFilter.srcIpRegion = 'any'; diagFilter.dstIpRegion = 'any'
  diagFilter.transportProtocol = ''; diagFilter.userGroup = ''; diagFilter.userName = ''
  diagFilter.domain = ''; diagFilter.link = ''
}
function doDiagExport() { ElMessage.info('导出功能（Mock）') }

// ── 会话诊断弹窗 ──
const sessionDiagVisible = ref(false)
const sessionDiagType = ref<'src' | 'dst' | 'domain'>('src')
const sessionDiagIpVersion = ref('v4')

const sessionDiagFilter = reactive({
  srcIp: '', srcIpType: 'any', filterSrc: 'no', srcPort: '80 / 8000-8080',
  dstIp: '', dstIpType: 'any', filterDst: 'no', dstPort: '53',
  mac: '', appProtocol: 'DNS', srcIpIsp: 'any', dstIpIsp: 'any',
  srcIpRegion: 'any', dstIpRegion: 'any',
  transportProtocol: '', userGroup: '', userName: '',
  domain: '', domainSelect: '', link: '',
  timeRange: '2026-07-14 10:31:22 - 2026-07-14 10:46:22'
})

// 会话诊断 - 连接数柱状图
const sdConnChartOption = ref({
  tooltip: { trigger: 'axis' },
  grid: { left: 60, right: 20, top: 20, bottom: 40 },
  xAxis: {
    type: 'category',
    data: ['10:32:00', '10:33:00', '10:34:00', '10:35:00', '10:36:00', '10:37:00', '10:38:00', '10:39:00', '10:40:00', '10:41:00', '10:42:00', '10:43:00', '10:44:00', '10:45:00', '10:46:00'],
    axisLabel: { rotate: 45, fontSize: 9 }
  },
  yAxis: { type: 'value', name: '连接数' },
  series: [{
    type: 'bar',
    data: Array(15).fill(0).map(() => Math.floor(Math.random() * 100 + 20)),
    itemStyle: { color: '#5b8ff9' },
    barWidth: '60%'
  }]
})

// 会话诊断 - 上行/下行流量柱状图
const sdTrafficChartOption = ref({
  tooltip: { trigger: 'axis' },
  legend: { data: ['上行流量', '下行流量'], textStyle: { fontSize: 10 } },
  grid: { left: 60, right: 20, top: 30, bottom: 40 },
  xAxis: {
    type: 'category',
    data: ['10:32:00', '10:33:00', '10:34:00', '10:35:00', '10:36:00', '10:37:00', '10:38:00', '10:39:00', '10:40:00', '10:41:00', '10:42:00', '10:43:00', '10:44:00', '10:45:00', '10:46:00'],
    axisLabel: { rotate: 45, fontSize: 9 }
  },
  yAxis: { type: 'value', name: 'bps' },
  series: [
    {
      name: '上行流量', type: 'bar',
      data: Array(15).fill(0).map(() => Math.floor(Math.random() * 200000 + 50000)),
      itemStyle: { color: '#f56c6c' },
      barWidth: '40%'
    },
    {
      name: '下行流量', type: 'bar',
      data: Array(15).fill(0).map(() => Math.floor(Math.random() * 150000 + 30000)),
      itemStyle: { color: '#5b8ff9' },
      barWidth: '40%'
    }
  ]
})

// 会话诊断 - 协议表
const sdProtoData = ref<any[]>([])

// 会话诊断 - 源IP表
const sdSrcIpData = ref<any[]>([])

// 会话诊断 - 目标IP表
const sdDstIpData = ref<any[]>([])

// 会话诊断 - 域名表
const sdDomainData = ref<any[]>([])

function openSessionDiagPopup(value: string, type: 'src' | 'dst' | 'domain') {
  sessionDiagType.value = type
  sessionDiagVisible.value = true

  // 重置数据为加载中状态
  sdProtoData.value = []
  sdSrcIpData.value = []
  sdDstIpData.value = []
  sdDomainData.value = []

  if (type === 'src') {
    sessionDiagFilter.srcIp = value
    sessionDiagFilter.dstIp = ''
    sessionDiagFilter.domain = ''
    // 模拟加载数据
    setTimeout(() => {
      sdProtoData.value = [{ protocol: 'DNS', totalReq: 23616, upload: '2.51 M', download: '3.40 M' }]
      sdDstIpData.value = [{ ip: '101.6.6.6', totalReq: 23616, upload: '2.51 M', download: '3.40 M' }]
      sdDomainData.value = [
        { domain: 'fc513ah2-6e6d.ap...', totalReq: 2568, upload: '278.37 K', download: '242.57 K' },
        { domain: '2ad330g6-fc51.ap...', totalReq: 1450, upload: '157.18 K', download: '137.00 K' },
        { domain: '6e068g26-2ad3.a...', totalReq: 1381, upload: '149.70 K', download: '130.90 K' },
        { domain: '8cd98f00b204e98...', totalReq: 244, upload: '31.93 K', download: '28.95 K' },
        { domain: 'ns-edu1.qq.com', totalReq: 239, upload: '22.64 K', download: '33.30 K' },
      ]
    }, 500)
  } else if (type === 'dst') {
    sessionDiagFilter.dstIp = value
    sessionDiagFilter.srcIp = ''
    sessionDiagFilter.domain = ''
    setTimeout(() => {
      sdProtoData.value = [{ protocol: 'DNS', totalReq: 170871, upload: '15.78 M', download: '1.46 M' }]
      sdSrcIpData.value = [{ ip: '101.6.6.6', totalReq: 170871, upload: '15.78 M', download: '1.46 M' }]
      sdDomainData.value = [{ domain: 'www.vmall.com', totalReq: 170871, upload: '15.78 M', download: '1.46 M' }]
    }, 500)
  } else if (type === 'domain') {
    sessionDiagFilter.domain = value
    sessionDiagFilter.srcIp = ''
    sessionDiagFilter.dstIp = ''
    setTimeout(() => {
      sdProtoData.value = [{ protocol: 'DNS', totalReq: 170871, upload: '15.78 M', download: '1.46 M' }]
      sdDstIpData.value = [{ ip: '101.6.6.6', totalReq: 170871, upload: '15.78 M', download: '1.46 M' }]
      sdSrcIpData.value = [
        { ip: '39.163.135.238', totalReq: 11, upload: '1.00 K', download: '0' },
        { ip: '39.130.17.53', totalReq: 10, upload: '886', download: '73' },
        { ip: '27.29.182.82', totalReq: 9, upload: '657', download: '657' },
        { ip: '221.179.239.246', totalReq: 8, upload: '803', download: '293' },
        { ip: '39.129.205.137', totalReq: 7, upload: '804', download: '74' },
      ]
    }, 500)
  }
}

// ── DNS会话 Tab ──
const sessIpVersion = ref('v4')
const sessShowMore = ref(false)
const sessSelectAll = ref(false)
const sessPage = ref(1)
const sessPageSize = ref(100)
const sessGotoPage = ref(1)

const sessFilter = reactive({
  srcIpType: 'any', dstIpType: 'any', filterSrc: 'no', srcPort: '',
  dstIpType2: 'any', filterDst: 'no', dstPort: '53',
  mac: '', appProtocol: '', responseTimeMin: '',
  queryType: '', rcode: '', anomaly: '',
  domain: '', userGroup: '', userName: '',
  timeRange: '2026-07-14 10:31:22 - 2026-07-14 10:46:22'
})

interface SessRow {
  _selected: boolean
  sendTime: string; mac: string; macVendor: string; userName: string
  srcIp: string; dnsServer: string; geoLocation: string; queryDomain: string
  queryType: string; responseRecord: string; ttl: string
  responseSize: string; responseTime: string; transportProtocol: string; link: string
}

const sessData = ref<SessRow[]>([])

const sessPages = computed(() => Math.max(1, Math.ceil(sessData.value.length / sessPageSize.value)))
const sessPageData = computed(() => sessData.value.slice((sessPage.value - 1) * sessPageSize.value, sessPage.value * sessPageSize.value))

function generateSessData(): SessRow[] {
  const rows: SessRow[] = []
  const baseTime = new Date('2026-07-14T10:31:22')
  const domains = ['www.vmall.com', 'www.baidu.com', 'www.taobao.com', 'www.sohu.com', 'www.edu.cn', 'www.huawei.com', 'mcg.baidu.com', 'aporta.sina.com.cn']
  const queryTypes = ['A', 'AAAA', 'CNAME', 'MX', 'TXT']
  const dnsServers = ['101.6.6.6', '114.114.114.114', '8.8.8.8', '223.5.5.5']
  const geoLocations = ['北京 BGP', '北京 BGP', '北京 BGP', '北京 BGP', '北京 BGP', '北京 BGP', '北京 BGP', '北京 BGP', '北京 BGP', '北京 BGP']
  const transportProtocols = ['UDP', 'UDP', 'UDP', 'UDP', 'UDP', 'UDP', 'UDP', 'UDP', 'UDP', 'UDP']

  for (let i = 0; i < 500; i++) {
    const time = new Date(baseTime.getTime() + i * 1800)
    const h = String(time.getHours()).padStart(2, '0')
    const m = String(time.getMinutes()).padStart(2, '0')
    const s = String(time.getSeconds()).padStart(2, '0')
    const port = 40000 + (i % 1000)
    const responseSize = Math.floor(Math.random() * 500 + 50)
    const responseTime = (Math.random() * 100 + 1).toFixed(0)
    rows.push({
      _selected: false,
      sendTime: `2026-07-14 ${h}:${m}:${s}`,
      mac: '54-2b-de-6d-10-ae',
      macVendor: 'NewH3CTechno...',
      userName: '—',
      srcIp: `101.6.6.191:${port}`,
      dnsServer: dnsServers[i % dnsServers.length],
      geoLocation: geoLocations[i % geoLocations.length],
      queryDomain: domains[i % domains.length],
      queryType: queryTypes[i % queryTypes.length],
      responseRecord: `101.6.6.6`,
      ttl: String(Math.floor(Math.random() * 3600 + 60)),
      responseSize: `${responseSize} B`,
      responseTime: responseTime,
      transportProtocol: transportProtocols[i % transportProtocols.length],
      link: '0'
    })
  }
  return rows
}

sessData.value = generateSessData()

function doSessSearch() { /* mock */ }
function resetSessFilters() {
  sessFilter.srcIpType = 'any'; sessFilter.dstIpType = 'any'; sessFilter.filterSrc = 'no'; sessFilter.srcPort = ''
  sessFilter.dstIpType2 = 'any'; sessFilter.filterDst = 'no'; sessFilter.dstPort = '53'
  sessFilter.mac = ''; sessFilter.appProtocol = ''
  sessFilter.responseTimeMin = ''; sessFilter.queryType = ''; sessFilter.rcode = ''; sessFilter.anomaly = ''
  sessFilter.domain = ''; sessFilter.userGroup = ''; sessFilter.userName = ''
}
function toggleSessSelectAll() { sessData.value.forEach(r => { r._selected = sessSelectAll.value }) }
function goToSessPage() {
  const p = sessGotoPage.value
  if (p >= 1 && p <= sessPages.value) sessPage.value = p
}
function doSessExport() { ElMessage.info('导出功能（Mock）') }

// ── 报文分析弹窗 ─
const packetVisible = ref(false)
const packetSelectedIdx = ref(0)
const packetData = ref({
  protocol: 'DNS',
  packets: [
    { time: '0.000000', src: '101.6.6.191', dst: '101.6.6.6', protocol: 'DNS', length: '74', detail: 'Standard query 0x1234 A www.vmall.com' },
    { time: '0.005246', src: '101.6.6.6', dst: '101.6.6.191', protocol: 'DNS', length: '90', detail: 'Standard query response 0x1234 A 101.6.6.6' },
    { time: '0.010000', src: '101.6.6.191', dst: '101.6.6.6', protocol: 'DNS', length: '68', detail: 'Standard query 0x1235 A www.baidu.com' },
    { time: '0.015282', src: '101.6.6.6', dst: '101.6.6.191', protocol: 'DNS', length: '84', detail: 'Standard query response 0x1235 A 39.156.66.10' },
    { time: '0.020000', src: '101.6.6.191', dst: '101.6.6.6', protocol: 'DNS', length: '72', detail: 'Standard query 0x1236 AAAA www.taobao.com' },
    { time: '0.025288', src: '101.6.6.6', dst: '101.6.6.191', protocol: 'DNS', length: '96', detail: 'Standard query response 0x1236 AAAA 2400:3200::1' },
  ],
  detailTree: [
    {
      label: 'Frame 1: 74 bytes on wire (592 bits), 74 bytes captured (592 bits)',
      expanded: false,
      children: [] as any[]
    },
    {
      label: 'Ethernet II, Src: 54:2b:de:6d:10:ae (54:2b:de:6d:10:ae), Dst: 30:80:9b:8d:90:01 (30:80:9b:8d:90:01)',
      expanded: false,
      children: [] as any[]
    },
    {
      label: 'Internet Protocol Version 4, Src: 101.6.6.191, Dst: 101.6.6.6',
      expanded: false,
      children: [] as any[]
    },
    {
      label: 'User Datagram Protocol, Src Port: 52341, Dst Port: 53',
      expanded: false,
      children: [] as any[]
    },
    {
      label: 'Domain Name System (query)',
      expanded: false,
      children: [
        { label: 'Transaction ID: 0x1234', expanded: false, children: [] as any[] },
        { label: 'Flags: 0x0100 Standard query', expanded: false, children: [] as any[] },
        { label: 'Questions: 1', expanded: false, children: [] as any[] },
        { label: 'Query: www.vmall.com, Type: A, Class: IN', expanded: false, children: [] as any[] },
      ]
    }
  ],
  hexDump: [
    '0000  30 80 9b 8d  90 01 54 2b  de 6d 10 ae  08 00 45 00    0.....T+  .m....E.',
    '0010  00 3c 24 37  40 00 31 11  97 04 01 18  18 e1 65 06    .<$7@.1.  ......e.',
    '0020  0f 82 1f 05  01 bb 90 a1  8e 3b 00 00  00 00 a0 02    ........  .;......',
    '0030  fa f0 77 cf  00 00 02 04  05 a0 04 02  08 0a 0c 08    ..w.....  ........',
    '0040  fb 2d 00 00  00 00 01 03  03 07                     .-......  .'
  ]
})

const packetTabs = [
  { key: 'parse', label: '报文解析' },
  { key: 'interaction', label: '报文交互' },
  { key: 'metadata', label: '元数据' },
  { key: 'cert', label: '证书分析' },
  { key: 'playback', label: '报文播放' },
  { key: 'timeline', label: '时序图' },
]
const packetActiveTab = ref('parse')
const packetFilterText = ref('')
const packetTopN = ref('100')
const packetExpandedRow = ref<number>(0)

const interactionSourceBlocks = ref<string[]>([
  '00 00 00 00  00 00 00 00  00 00 00 00  00 00 00 00',
  '11 11 11 11  11 11 11 11  11 11 11 11  11 11 11 11'
])
const interactionDstBlocks = ref<string[]>([
  '00 00 00 00  00 00 00 00  00 00 00 00  00 00 00 00',
  '22 22 22 22  22 22 22 22  22 22 22 22  22 22 22 22'
])
const interactionPage = ref(1)
const interactionTotal = ref(40)

const metadataDisplayMode = ref('attr')

const playNic = ref('eth0')
const playCount = ref(1)
const playSpeed = ref('1')
const playInfoItems = ref([
  { time: '0.000000', src: '101.6.6.191', dst: '101.6.6.6', length: '74', status: '待播放' }
])

const timeGapThreshold = ref(100)
const timelinePage = ref(1)
const timelineData = ref([
  { no: 1, time: '0.000000', src: '101.6.6.191', dst: '101.6.6.6', protocol: 'DNS', info: 'Standard query A www.vmall.com' }
])
const timelineProtocolTree = ref([
  { label: 'Frame 1: 74 bytes', expanded: false, children: [] as any[] }
])
const timelineHexDump = ref([
  '0000  30 80 9b 8d  90 01 54 2b  de 6d 10 ae  08 00 45 00'
])

function downloadPacketFromPopup() { ElMessage.info('报文下载功能（Mock）') }
function downloadContentFromPopup() { ElMessage.info('内容下载功能（Mock）') }
function startPacketPlayback() { ElMessage.info(`开始播放：网卡 ${playNic.value}，次数 ${playCount.value}，速度 ${playSpeed.value}x（Mock）`) }

// ── 数据包下拉菜单 ──
const packetMenuVisible = ref(false)
const packetMenuRow = ref<SessRow | null>(null)
const packetMenuX = ref(0)
const packetMenuY = ref(0)

function hidePacketMenu() {
  packetMenuVisible.value = false
  packetMenuRow.value = null
}

if (typeof window !== 'undefined') {
  window.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.classList.contains('pkt-dropdown-trigger') && !target.closest('.packet-context-menu')) {
      hidePacketMenu()
    }
  })
}

function openPacketPopup(row: SessRow | null) {
  hidePacketMenu()
  if (!row) return
  packetData.value.protocol = 'DNS'
  packetSelectedIdx.value = 0
  packetActiveTab.value = 'parse'
  packetVisible.value = true
}

function openPacketPlayPopup(row: SessRow | null) {
  hidePacketMenu()
  if (!row) return
  packetData.value.protocol = 'DNS'
  packetSelectedIdx.value = 0
  packetActiveTab.value = 'playback'
  packetVisible.value = true
}

function downloadPacket(row: SessRow | null) {
  hidePacketMenu()
  if (!row) return
  ElMessage.info('报文下载功能（Mock）')
}

function downloadContent(row: SessRow | null) {
  hidePacketMenu()
  if (!row) return
  ElMessage.info('内容下载功能（Mock）')
}

function queryTailPacket(row: SessRow | null) {
  hidePacketMenu()
  if (!row) return
  ElMessage.info('尾包查询功能（Mock）')
}

function stitchSession(row: SessRow | null) {
  hidePacketMenu()
  if (!row) return
  ElMessage.info('会话缝合功能（Mock）')
}

// ── 日志详情弹窗 ──
const logDetailVisible = ref(false)
const logDetailData = ref({
  srcIp: '101.6.6.191', srcPort: '52341',
  dstIp: '101.6.6.6', dstPort: '53',
  protocol: 'DNS',
  requestHeaders: 'Standard query 0x1234 A www.vmall.com\nTransaction ID: 0x1234\nFlags: 0x0100 Standard query\nQuestions: 1\nQuery: www.vmall.com, Type: A, Class: IN',
  responseHeaders: 'Standard query response 0x1234 A 101.6.6.6\nTransaction ID: 0x1234\nFlags: 0x8180 Standard query response, No error\nQuestions: 1\nAnswer RRs: 1\nAnswer: www.vmall.com, Type: A, Class: IN, Addr: 101.6.6.6'
})

function openLogDetailPopup(row: SessRow) {
  logDetailData.value = {
    srcIp: row.srcIp.split(':')[0],
    srcPort: row.srcIp.split(':')[1] || '0',
    dstIp: row.dnsServer.split(':')[0],
    dstPort: '53',
    protocol: 'DNS',
    requestHeaders: `Standard query 0x1234 ${row.queryType} ${row.queryDomain}\nTransaction ID: 0x1234\nFlags: 0x0100 Standard query\nQuestions: 1\nQuery: ${row.queryDomain}, Type: ${row.queryType}, Class: IN`,
    responseHeaders: `Standard query response 0x1234 ${row.queryType} ${row.responseRecord}\nTransaction ID: 0x1234\nFlags: 0x8180 Standard query response, No error\nQuestions: 1\nAnswer RRs: 1\nAnswer: ${row.queryDomain}, Type: ${row.queryType}, Class: IN, Addr: ${row.responseRecord}`
  }
  logDetailVisible.value = true
}

</script>

<style scoped>
/* 图表网格 */
.dns-chart-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 12px;
  background: #f5f7fa;
}

/* 内容网格（协议表+三个数据表） */
.dns-content-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  padding: 12px;
  background: #f5f7fa;
  flex: 1;
  min-height: 0;
}

/* 链接 */
.tid-link {
  color: #409eff;
  cursor: pointer;
  text-decoration: underline;
}
.tid-link:hover {
  color: #66b1ff;
}

/* 数字列 */
.ou-num {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

/* 排序图标 */
.sort-icon {
  font-size: 12px;
  color: #c0c4cc;
  vertical-align: middle;
  cursor: pointer;
}

/* 报文行选中样式 */
.pkt-row-selected {
  background: #e8f5e9 !important;
}
.pkt-row-selected td {
  border-color: #c8e6c9 !important;
}

/* 数据包下拉菜单 */
.packet-context-menu {
  position: fixed;
  z-index: 2000;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 4px 0;
  min-width: 140px;
}
.packet-menu-item {
  padding: 8px 16px;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}
.packet-menu-item:hover {
  background: #f5f7fa;
  color: #409eff;
}
.packet-menu-item .el-icon {
  font-size: 14px;
}
</style>
