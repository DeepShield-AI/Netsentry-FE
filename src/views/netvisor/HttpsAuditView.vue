<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav nv-tabs-nav-wrap" role="tablist" aria-label="HTTPS审计">
        <button v-for="t in tabs" :key="t.key" type="button" class="nv-tab" :class="{ active: activeTab === t.key }" @click="activeTab = t.key">{{ t.label }}</button>
      </div>
    </div>
    <div class="nv-tabs-body">

      <!-- ==================== HTTPS诊断 Tab ==================== -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'diagnosis' }">
        <!-- 筛选区域 -->
        <div class="tdh-filters">
          <div class="tdh-filter-row">
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">源IP</span>
              <select class="ou-toolbar-select" v-model="diagFilter.srcIpType">
                <option value="single">单个IP</option>
                <option value="any">任意IP</option>
              </select>
              <input v-if="diagFilter.srcIpType === 'single'" class="ou-toolbar-input tdh-filter-input" v-model="diagFilter.srcIp" placeholder="112.120.182.56" style="width:120px" />
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
              <input class="ou-toolbar-input tdh-filter-input" v-model="diagFilter.dstPort" placeholder="80 / 8000-8080" />
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
              <span class="ou-toolbar-label">应用协议</span>
              <select class="ou-toolbar-select" v-model="diagFilter.appProtocol">
                <option value="">任意协议</option>
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
        <div class="hd-chart-grid">
          <div style="background:#fff;border:1px solid #ebeef5;border-radius:4px;padding:12px">
            <v-chart :option="diagAreaChartOption" autoresize style="width:100%;height:280px" />
          </div>
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
                  <td style="font-size:12px">{{ row.protocol }}</td>
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
        </div>

        <!-- 三个表格 -->
        <div class="hd-table-grid">
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

      <!-- ==================== HTTPS会话 Tab ==================== -->
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
                <th>过滤源</th>
                <th>时延</th>
                <th>MAC</th>
                <th>MAC厂商</th>
                <th>用户名称</th>
                <th>源IP</th>
                <th>目标IP</th>
                <th>目标IP地理位置</th>
                <th>传输协议</th>
                <th>请求域名</th>
                <th>响应域名</th>
                <th>应用协议</th>
                <th>响应码/ID</th>
                <th>链路</th>
                <th>上行 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>下行 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th style="width:120px">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in sessPageData" :key="idx">
                <td><input type="checkbox" v-model="row._selected" /></td>
                <td style="white-space:nowrap">{{ row.sendTime }}</td>
                <td>{{ row.filterSrc }}</td>
                <td class="ou-num">{{ row.latency }}</td>
                <td style="font-size:12px">{{ row.mac }}</td>
                <td style="font-size:12px">{{ row.macVendor }}</td>
                <td>{{ row.userName }}</td>
                <td><span class="tid-link" @click="openSessionDiagPopup(row.srcIp, 'src')">{{ row.srcIp }}</span></td>
                <td><span class="tid-link" @click="openSessionDiagPopup(row.dstIp, 'dst')">{{ row.dstIp }}</span></td>
                <td><span class="tid-link" style="display:inline-flex;align-items:center;gap:2px"><el-icon :size="12"><MapLocation /></el-icon> {{ row.geoLocation }}</span></td>
                <td style="font-size:12px">{{ row.transportProto }}</td>
                <td><span class="tid-link" @click="openDomainProfilePopup(row.requestDomain)">{{ row.requestDomain }}</span></td>
                <td style="font-size:12px">{{ row.responseDomain }}</td>
                <td style="font-size:12px">{{ row.appProtocol }}</td>
                <td style="font-size:12px">{{ row.responseCode }}</td>
                <td>{{ row.link }}</td>
                <td class="ou-num">{{ row.upload }}</td>
                <td class="ou-num">{{ row.download }}</td>
                <td style="position:relative">
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
            <input class="ou-toolbar-input tdh-filter-input" v-model="sessionDiagFilter.dstPort" placeholder="80 / 8000-8080" />
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
              <option value="">任意协议</option>
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
      <div class="hd-chart-grid" style="margin-bottom:12px">
        <div style="background:#fff;border:1px solid #ebeef5;border-radius:4px;padding:12px">
          <v-chart :option="sdAreaChartOption" autoresize style="width:100%;height:200px" />
        </div>
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
                <td style="font-size:12px">{{ row.protocol }}</td>
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
      </div>

      <!-- 三个表格 -->
      <div class="hd-table-grid">
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
    <el-dialog v-model="packetVisible" title="报文分析->其它HTTPS - Google Chrome" width="95%" top="3vh" destroy-on-close class="hd-detail-dialog">
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
          <div style="padding:8px;background:#f5f7fa;border-radius:4px;font-size:12px"><div style="color:#909399">目标端口</div><div style="color:#303133;margin-top:4px;font-weight:500">443</div></div>
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
import { LineChart, PieChart, BarChart } from 'echarts/charts'
import {
  TitleComponent, TooltipComponent, LegendComponent, GridComponent
} from 'echarts/components'
import {
  Search, Download, Sort, Monitor, Connection, MapLocation,
  Filter, ArrowUp, ArrowDown, Close, FullScreen, Fold,
  ArrowRight, Upload, DataAnalysis, Picture,
  InfoFilled, VideoPlay
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import './nv-shared.css'

use([CanvasRenderer, LineChart, PieChart, BarChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent])

// ── Tabs ──
const tabs = [
  { key: 'diagnosis', label: 'HTTPS诊断' },
  { key: 'sessions', label: 'HTTPS会话' },
]
const activeTab = ref('diagnosis')

// ── HTTPS诊断 Tab ──
const diagIpVersion = ref('v4')

const diagFilter = reactive({
  srcIpType: 'single', srcIp: '112.120.182.56', filterSrc: 'no', srcPort: '80 / 8000-8080',
  dstIpType: 'any', filterDst: 'no', dstPort: '80 / 8000-8080',
  mac: '', appProtocol: '', srcIpIsp: 'any', dstIpIsp: 'any',
  srcIpRegion: 'any', dstIpRegion: 'any',
  transportProtocol: '', userGroup: '', userName: '', domain: '', link: '',
  timeRange: '2026-07-14 09:13:50 - 2026-07-14 09:28:50'
})

// 面积图
const diagAreaChartOption = ref({
  tooltip: { trigger: 'axis' },
  legend: { data: ['上行流量', '下行流量'], textStyle: { fontSize: 10 } },
  grid: { left: 60, right: 20, top: 30, bottom: 40 },
  xAxis: {
    type: 'category',
    data: ['09:13:50', '09:14:20', '09:14:50', '09:15:20', '09:15:50', '09:16:20', '09:16:50', '09:17:20', '09:17:50', '09:18:20', '09:18:50', '09:19:20', '09:19:50', '09:20:20', '09:20:50', '09:21:20', '09:21:50', '09:22:20', '09:22:50', '09:23:20', '09:23:50', '09:24:20', '09:24:50', '09:25:20', '09:25:50', '09:26:20', '09:26:50', '09:27:20', '09:27:50', '09:28:20', '09:28:50'],
    axisLabel: { rotate: 45, fontSize: 9 }
  },
  yAxis: { type: 'value', name: 'bps', axisLabel: { formatter: (v: number) => v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v } },
  series: [
    {
      name: '上行流量', type: 'line', areaStyle: { opacity: 0.3 },
      data: [25000, 28000, 30000, 32000, 35000, 38000, 40000, 42000, 45000, 48000, 50000, 52000, 55000, 58000, 60000, 62000, 65000, 68000, 70000, 72000, 75000, 78000, 80000, 82000, 85000, 88000, 90000, 92000, 95000, 98000, 100000],
      itemStyle: { color: '#5b8ff9' }, lineStyle: { width: 1 }
    },
    {
      name: '下行流量', type: 'line', areaStyle: { opacity: 0.1 },
      data: [5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000, 21000, 22000, 23000, 24000, 25000, 26000, 27000, 28000, 29000, 30000, 31000, 32000, 33000, 34000, 35000],
      itemStyle: { color: '#f56c6c' }, lineStyle: { width: 1 }
    }
  ]
})

// 协议数据
const protoPage = ref(1)
const protoPageSize = ref(100)
const protoData = ref([
  { protocol: '其它HTTPS', totalReq: 775219, upload: '2.91 G', download: '147.95 G' },
  { protocol: 'IMAP', totalReq: 14805, upload: '67.03 M', download: '1.03 G' },
  { protocol: '企业微信', totalReq: 1859, upload: '14.16 M', download: '11.89 M' },
  { protocol: '微信聊天', totalReq: 1532, upload: '3.94 M', download: '14.78 M' },
  { protocol: 'SMTP', totalReq: 1247, upload: '139.78 M', download: '10.17 M' },
  { protocol: 'POP3', totalReq: 887, upload: '3.47 M', download: '289.59 M' },
])
const protoPages = computed(() => Math.max(1, Math.ceil(protoData.value.length / protoPageSize.value)))
const protoPageData = computed(() => protoData.value.slice((protoPage.value - 1) * protoPageSize.value, protoPage.value * protoPageSize.value))

// 源IP数据
const srcIpPage = ref(1)
const srcIpPageSize = ref(100)
const srcIpData = ref([
  { ip: '112.120.182.56', totalReq: 25405, upload: '25.59 M', download: '174.77 M' },
  { ip: '221.11.26.90', totalReq: 10198, upload: '9.92 M', download: '220.90 M' },
  { ip: '51.51.205.18', totalReq: 9266, upload: '7.51 M', download: '0' },
  { ip: '101.230.11.41', totalReq: 8257, upload: '5.93 M', download: '66.67 M' },
  { ip: '101.230.11.25', totalReq: 8242, upload: '5.93 M', download: '66.66 M' },
  { ip: '101.230.11.24', totalReq: 8231, upload: '5.92 M', download: '66.65 M' },
  { ip: '101.230.11.23', totalReq: 8136, upload: '5.88 M', download: '0' },
  { ip: '101.230.11.36', totalReq: 8135, upload: '5.87 M', download: '0' },
  { ip: '101.230.11.37', totalReq: 8101, upload: '5.87 M', download: '0' },
  { ip: '101.230.11.38', totalReq: 8084, upload: '5.83 M', download: '0' },
  { ip: '101.230.11.21', totalReq: 8083, upload: '5.82 M', download: '0' },
  { ip: '101.230.11.39', totalReq: 8078, upload: '5.82 M', download: '0' },
  { ip: '101.230.11.22', totalReq: 8045, upload: '5.79 M', download: '0' },
  { ip: '101.230.11.20', totalReq: 8039, upload: '5.81 M', download: '0' },
  { ip: '101.230.11.35', totalReq: 8028, upload: '5.79 M', download: '0' },
  { ip: '101.230.11.40', totalReq: 8020, upload: '5.87 M', download: '0' },
  { ip: '101.230.11.19', totalReq: 8010, upload: '5.79 M', download: '0' },
  { ip: '101.230.11.18', totalReq: 7955, upload: '5.73 M', download: '0' },
  { ip: '101.230.11.34', totalReq: 7906, upload: '5.70 M', download: '0' },
])
const srcIpPages = computed(() => Math.max(1, Math.ceil(srcIpData.value.length / srcIpPageSize.value)))
const srcIpPageData = computed(() => srcIpData.value.slice((srcIpPage.value - 1) * srcIpPageSize.value, srcIpPage.value * srcIpPageSize.value))

// 目标IP数据
const dstIpPage = ref(1)
const dstIpPageSize = ref(100)
const dstIpData = ref([
  { ip: '101.6.15.130', totalReq: 607312, upload: '922.73 M', download: '91.78 G' },
  { ip: '101.6.16.99', totalReq: 47026, upload: '97.78 M', download: '17.27 G' },
  { ip: '101.6.15.70', totalReq: 38822, upload: '53.97 M', download: '11.76 G' },
  { ip: '101.6.16.67', totalReq: 26592, upload: '63.97 M', download: '955.62 M' },
  { ip: '101.6.16.68', totalReq: 13552, upload: '42.63 M', download: '879.33 M' },
  { ip: '101.6.16.69', totalReq: 13353, upload: '1.36 G', download: '15.74 G' },
  { ip: '101.11.204.8', totalReq: 11783, upload: '278.39 M', download: '1.36 G' },
  { ip: '101.6.9.234', totalReq: 9613, upload: '10.67 M', download: '39.69 M' },
  { ip: '166.111.204.9', totalReq: 9129, upload: '10.15 M', download: '186.95 M' },
  { ip: '101.6.4.100', totalReq: 5776, upload: '20.16 M', download: '330.71 M' },
  { ip: '101.6.9.99', totalReq: 2699, upload: '1.88 M', download: '15.39 M' },
  { ip: '101.6.6.6', totalReq: 2683, upload: '1.39 M', download: '14.64 M' },
  { ip: '101.6.4.9', totalReq: 1608, upload: '1.62 M', download: '16.35 M' },
  { ip: '166.111.6.70', totalReq: 1417, upload: '2.16 M', download: '1010.20 K' },
  { ip: '166.111.4.40', totalReq: 1328, upload: '3.41 M', download: '132.25 M' },
  { ip: '100.204.184.161', totalReq: 960, upload: '6.29 M', download: '6.16 M' },
  { ip: '100.244.169.22', totalReq: 556, upload: '7.86 M', download: '5.69 M' },
  { ip: '101.11.5.99', totalReq: 815, upload: '18.32 M', download: '897.91 M' },
  { ip: '101.6.4.110', totalReq: 691, upload: '6.61 M', download: '206.08 M' },
])
const dstIpPages = computed(() => Math.max(1, Math.ceil(dstIpData.value.length / dstIpPageSize.value)))
const dstIpPageData = computed(() => dstIpData.value.slice((dstIpPage.value - 1) * dstIpPageSize.value, dstIpPage.value * dstIpPageSize.value))

// 目标域名数据
const domainPage = ref(1)
const domainPageSize = ref(100)
const domainData = ref([
  { domain: 'mirrors.tuna.tsinghua...', totalReq: 479858, upload: '490.00 M', download: '31.86 G' },
  { domain: 'pypi.tuna.tsinghua.e...', totalReq: 83017, upload: '362.09 M', download: '94.86 G' },
  { domain: 'www.pbcsl.tsinghua...', totalReq: 24640, upload: '23.08 M', download: '887.90 M' },
  { domain: 'yoga.tsinghua.edu.cn', totalReq: 23013, upload: '27.37 M', download: '195.71 M' },
  { domain: 'cloud.tsinghua.edu.cn', totalReq: 13112, upload: '1.24 G', download: '18.71 G' },
  { domain: 'weixin.weixin.qq.com', totalReq: 8590, upload: '6.87 M', download: '0' },
  { domain: 'pypi.org', totalReq: 7353, upload: '12.01 G', download: '5.33 G' },
  { domain: 'pypi-ng', totalReq: 6591, upload: '4.13 M', download: '99.58 M' },
  { domain: 'mails.tsinghua.edu.cn', totalReq: 6496, upload: '14.05 M', download: '137.60 M' },
  { domain: 'mail.tsinghua.edu.cn', totalReq: 5639, upload: '142.65 M', download: '743.84 M' },
  { domain: 'auth4.tsinghua.edu.cn', totalReq: 5667, upload: '15.86 M', download: '325.19 M' },
  { domain: 'mirror.tsinghua.edu...', totalReq: 4314, upload: '29.68 M', download: '14.29 M' },
  { domain: 'faculty.dsec.tsinghua...', totalReq: 2686, upload: '2.37 M', download: '19.96 M' },
  { domain: 'traffic.tsinghua.edu...', totalReq: 2674, upload: '3.22 M', download: '13.89 M' },
  { domain: 'campuswifi.tsinghua...', totalReq: 2544, upload: '7.47 M', download: '58.81 M' },
  { domain: 'dts.tsinghua.edu.cn', totalReq: 1933, upload: '777.04 K', download: '6.45 M' },
  { domain: 'local.work.weixin.qq...', totalReq: 1921, upload: '14.01 M', download: '11.67 M' },
  { domain: 'fuv.myhome.tsinghua...', totalReq: 1918, upload: '2.69 M', download: '17.48 M' },
  { domain: 'mcdn.pri.tsinghua.e...', totalReq: 1832, upload: '1.72 M', download: '104.62 M' },
])
const domainPages = computed(() => Math.max(1, Math.ceil(domainData.value.length / domainPageSize.value)))
const domainPageData = computed(() => domainData.value.slice((domainPage.value - 1) * domainPageSize.value, domainPage.value * domainPageSize.value))

function doDiagSearch() { /* mock */ }
function resetDiagFilters() {
  diagFilter.srcIpType = 'single'; diagFilter.srcIp = '112.120.182.56'; diagFilter.filterSrc = 'no'; diagFilter.srcPort = '80 / 8000-8080'
  diagFilter.dstIpType = 'any'; diagFilter.filterDst = 'no'; diagFilter.dstPort = '80 / 8000-8080'
  diagFilter.mac = ''; diagFilter.appProtocol = ''; diagFilter.srcIpIsp = 'any'; diagFilter.dstIpIsp = 'any'
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
  dstIp: '', dstIpType: 'any', filterDst: 'no', dstPort: '80 / 8000-8080',
  mac: '', appProtocol: '', srcIpIsp: 'any', dstIpIsp: 'any',
  srcIpRegion: 'any', dstIpRegion: 'any',
  transportProtocol: '', userGroup: '', userName: '',
  domain: '', domainSelect: '', link: '',
  timeRange: '2026-07-14 09:13:50 - 2026-07-14 09:28:50'
})

// 会话诊断 - 面积图
const sdAreaChartOption = ref({
  tooltip: { trigger: 'axis' },
  legend: { data: ['上行流量', '下行流量'], textStyle: { fontSize: 10 } },
  grid: { left: 60, right: 20, top: 30, bottom: 40 },
  xAxis: {
    type: 'category',
    data: ['09:13:50', '09:14:20', '09:14:50', '09:15:20', '09:15:50', '09:16:20', '09:16:50', '09:17:20', '09:17:50', '09:18:20', '09:18:50', '09:19:20', '09:19:50', '09:20:20', '09:20:50', '09:21:20', '09:21:50', '09:22:20', '09:22:50', '09:23:20', '09:23:50', '09:24:20', '09:24:50', '09:25:20', '09:25:50', '09:26:20', '09:26:50', '09:27:20', '09:27:50', '09:28:20', '09:28:50'],
    axisLabel: { rotate: 45, fontSize: 9 }
  },
  yAxis: { type: 'value', name: 'bps' },
  series: [
    { name: '上行流量', type: 'line', areaStyle: { opacity: 0.3 }, data: Array(31).fill(0).map((_, i) => 20000 + i * 2500 + Math.random() * 5000), itemStyle: { color: '#5b8ff9' } },
    { name: '下行流量', type: 'line', areaStyle: { opacity: 0.1 }, data: Array(31).fill(0).map((_, i) => 5000 + i * 1000 + Math.random() * 2000), itemStyle: { color: '#f56c6c' } }
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
      sdDstIpData.value = [{ ip: '101.6.15.130', totalReq: 486133, upload: '498.52 M', download: '33.50 G' }]
    }, 500)
  } else if (type === 'dst') {
    sessionDiagFilter.dstIp = value
    sessionDiagFilter.srcIp = ''
    sessionDiagFilter.domain = ''
    setTimeout(() => {
      sdDomainData.value = [{ domain: 'www.pbcsl.tsingh...', totalReq: 24461, upload: '22.72 M', download: '168.30 M' }]
    }, 500)
  } else if (type === 'domain') {
    sessionDiagFilter.domain = value
    sessionDiagFilter.srcIp = ''
    sessionDiagFilter.dstIp = ''
    setTimeout(() => {
      sdDstIpData.value = [{ ip: '101.6.15.130', totalReq: 486133, upload: '498.52 M', download: '33.50 G' }]
    }, 500)
  }
}

// ── HTTPS会话 Tab ──
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
  timeRange: '2026-07-14 09:13:50 - 2026-07-14 09:28:50'
})

interface SessRow {
  _selected: boolean
  sendTime: string; filterSrc: string; latency: string
  mac: string; macVendor: string; userName: string
  srcIp: string; dstIp: string; geoLocation: string
  transportProto: string; requestDomain: string; responseDomain: string
  appProtocol: string; responseCode: string; link: string
  upload: string; download: string
}

const sessData = ref<SessRow[]>([])

const sessPages = computed(() => Math.max(1, Math.ceil(sessData.value.length / sessPageSize.value)))
const sessPageData = computed(() => sessData.value.slice((sessPage.value - 1) * sessPageSize.value, sessPage.value * sessPageSize.value))

function generateSessData(): SessRow[] {
  const rows: SessRow[] = []
  const baseTime = new Date('2026-07-14T09:13:50')
  const domains = ['mirrors.tuna.tsinghua.edu.cn', 'pypi.tuna.tsinghua.edu.cn', 'www.pbcsl.tsinghua.edu.cn', 'yoga.tsinghua.edu.cn', 'cloud.tsinghua.edu.cn']
  const geoLocations = ['北京高校', '北京高校', '北京高校', '北京高校', '北京高校']
  const transportProtos = ['TCP', 'TCP', 'TCP']
  const appProtocols = ['其它HTTPS', '其它HTTPS', '其它HTTPS']
  const responseCodes = ['200/500', '304/0', '200/1234']

  for (let i = 0; i < 500; i++) {
    const time = new Date(baseTime.getTime() + i * 3000)
    const h = String(time.getHours()).padStart(2, '0')
    const m = String(time.getMinutes()).padStart(2, '0')
    const s = String(time.getSeconds()).padStart(2, '0')
    const port = 33088 + (i % 100)
    const uploadMB = (Math.random() * 50 + 0.1).toFixed(2)
    const downloadMB = (Math.random() * 500 + 1).toFixed(2)
    const latencyMs = (Math.random() * 50 + 1).toFixed(0)
    rows.push({
      _selected: false,
      sendTime: `2026-07-14 ${h}:${m}:${s}`,
      filterSrc: '否',
      latency: `${latencyMs}ms`,
      mac: '54-2b-de-6d-10-ae',
      macVendor: 'NewH3CTechno...',
      userName: '—',
      srcIp: `112.120.182.56:${port}`,
      dstIp: '101.6.15.130:443',
      geoLocation: geoLocations[i % geoLocations.length],
      transportProto: transportProtos[i % transportProtos.length],
      requestDomain: domains[i % domains.length],
      responseDomain: domains[i % domains.length],
      appProtocol: appProtocols[i % appProtocols.length],
      responseCode: responseCodes[i % responseCodes.length],
      link: '0',
      upload: `${uploadMB} M`,
      download: `${downloadMB} M`
    })
  }
  return rows
}

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

// ── 报文分析弹窗 ─
const packetVisible = ref(false)
const packetSelectedIdx = ref(0)
const packetData = ref({
  protocol: '其它HTTPS',
  packets: [
    { time: '0.000000', src: '1.24.24.225', dst: '101.6.15.130', protocol: 'TCP', length: '74', detail: '7941 --> 443 [SYN] Seq=0 Win=64240 Len=0 MSS=1440 SACK_PERM=1 TSval=201915181 TSecr=0 WS=128' },
    { time: '0.070246', src: '1.24.24.225', dst: '101.6.15.130', protocol: 'TCP', length: '66', detail: '7941 --> 443 [ACK] Seq=1 Ack=1 Win=64256 Len=0 TSval=201915252 TSecr=2888937753' },
    { time: '0.095266', src: '1.24.24.225', dst: '101.6.15.130', protocol: 'TLSv1', length: '583', detail: 'Client Hello' },
    { time: '0.171282', src: '1.24.24.225', dst: '101.6.15.130', protocol: 'TCP', length: '66', detail: '7941 --> 443 [ACK] Seq=518 Ack=1421 Win=63872 Len=0 TSval=201915354 TSecr=2888937860' },
    { time: '0.171282', src: '1.24.24.225', dst: '101.6.15.130', protocol: 'TCP', length: '66', detail: '7941 --> 443 [ACK] Seq=518 Ack=2841 Win=62848 Len=0 TSval=201915354 TSecr=2888937860' },
    { time: '0.171288', src: '1.24.24.225', dst: '101.6.15.130', protocol: 'TCP', length: '66', detail: '7941 --> 443 [ACK] Seq=518 Ack=4097 Win=61696 Len=0 TSval=201915354 TSecr=2888937860' },
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
      label: 'Internet Protocol Version 4, Src: 1.24.24.225, Dst: 101.6.15.130',
      expanded: false,
      children: [] as any[]
    },
    {
      label: 'Transmission Control Protocol, Src Port: 7941, Dst Port: 443, Seq: 0, Len: 0',
      expanded: false,
      children: [] as any[]
    }
  ],
  hexDump: [
    '0000  30 80 9b 8d  90 01 54 2b  de 6d 10 ae  08 00 45 00    0.....T+  .m....E.',
    '0010  00 3c 24 37  40 00 31 06  97 04 01 18  18 e1 65 06    .<$7@.1.  ......e.',
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
  { time: '0.000000', src: '1.24.24.225', dst: '101.6.15.130', length: '74', status: '待播放' }
])

const timeGapThreshold = ref(100)
const timelinePage = ref(1)
const timelineData = ref([
  { no: 1, time: '0.000000', src: '1.24.24.225', dst: '101.6.15.130', protocol: 'TCP', info: 'SYN' }
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
const pktBtnRefs = ref<HTMLElement[]>([])

function togglePacketMenu(event: MouseEvent, row: SessRow, idx: number) {
  // 如果点击的是同一个按钮，则切换菜单
  if (packetMenuVisible.value && packetMenuRow.value === row) {
    hidePacketMenu()
    return
  }

  packetMenuRow.value = row
  // 获取按钮位置，将菜单显示在按钮下方
  const btn = event.currentTarget as HTMLElement
  const rect = btn.getBoundingClientRect()
  packetMenuX.value = rect.left
  packetMenuY.value = rect.bottom + 4
  packetMenuVisible.value = true
}

function hidePacketMenu() {
  packetMenuVisible.value = false
  packetMenuRow.value = null
}

// 点击其他地方关闭菜单
if (typeof window !== 'undefined') {
  window.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.classList.contains('pkt-dropdown-trigger') && !target.closest('.packet-context-menu')) {
      hidePacketMenu()
    }
  })
}

function openPacketPopup(row: SessRow) {
  hidePacketMenu()
  packetData.value.protocol = row.appProtocol
  packetSelectedIdx.value = 0
  packetActiveTab.value = 'parse'
  packetVisible.value = true
}

function openPacketPlayPopup(row: SessRow) {
  hidePacketMenu()
  packetData.value.protocol = row.appProtocol
  packetSelectedIdx.value = 0
  packetActiveTab.value = 'playback'
  packetVisible.value = true
}

function downloadPacket(row: SessRow) {
  hidePacketMenu()
  ElMessage.info('报文下载功能（Mock）')
}

function downloadContent(row: SessRow) {
  hidePacketMenu()
  ElMessage.info('内容下载功能（Mock）')
}

function queryTailPacket(row: SessRow) {
  hidePacketMenu()
  ElMessage.info('尾包查询功能（Mock）')
}

function stitchSession(row: SessRow) {
  hidePacketMenu()
  ElMessage.info('会话缝合功能（Mock）')
}

// ── 日志详情弹窗 ──
const logDetailVisible = ref(false)
const logDetailData = ref({
  srcIp: '60.13.232.227', srcPort: '33088',
  dstIp: '101.6.15.130', dstPort: '80',
  protocol: 'WWW',
  requestHeaders: 'GET /ubuntu/dists/jammy/InRelease HTTP/1.1\nHost: mirrors.tuna.tsinghua.edu.cn\nCache-Control: max-age=0\nAccept: text/*\nIf-Modified-Since: Thu, 21 Apr 2022 17:16:39 GMT\nUser-Agent: Debian APT-HTTP/1.3 (2.4.8) non-interactive',
  responseHeaders: 'HTTP/1.1 304 Not Modified\nServer: nginx/1.22.1\nDate: Tue, 14 Jul 2026 00:33:30 GMT\nLast-Modified: Thu, 21 Apr 2022 17:16:39 GMT\nConnection: keep-alive\nETag: "62619177-41f07"\nStrict-Transport-Security: max-age=31536000'
})

function openLogDetailPopup(row: SessRow) {
  logDetailData.value = {
    srcIp: row.srcIp.split(':')[0],
    srcPort: row.srcIp.split(':')[1] || '0',
    dstIp: row.dstIp.split(':')[0],
    dstPort: row.dstIp.split(':')[1] || '443',
    protocol: row.appProtocol,
    requestHeaders: `GET /ubuntu/dists/jammy/InRelease HTTP/1.1\nHost: ${row.requestDomain}\nCache-Control: max-age=0\nAccept: text/*\nIf-Modified-Since: Thu, 21 Apr 2022 17:16:39 GMT\nUser-Agent: Debian APT-HTTP/1.3 (2.4.8) non-interactive`,
    responseHeaders: `HTTP/1.1 304 Not Modified\nServer: nginx/1.22.1\nDate: Tue, 14 Jul 2026 00:33:30 GMT\nLast-Modified: Thu, 21 Apr 2022 17:16:39 GMT\nConnection: keep-alive\nETag: "62619177-41f07"\nStrict-Transport-Security: max-age=31536000`
  }
  logDetailVisible.value = true
}

function openDomainProfilePopup(domain: string) {
  ElMessage.info(`域名画像: ${domain}（Mock）`)
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

/* 状态码标签 */
.status-code-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 500;
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

/* 数据包右键菜单 */
.packet-context-menu {
  position: fixed;
  z-index: 9999;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 4px 0;
  min-width: 140px;
}

.packet-menu-item {
  padding: 8px 16px;
  font-size: 13px;
  color: #409eff;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.packet-menu-item:hover {
  background: #ecf5ff;
}

/* 数据包行选中 */
.pkt-row-selected {
  background: #e6f7ff !important;
}

.pkt-row-selected td {
  border-color: #91d5ff !important;
}
</style>
