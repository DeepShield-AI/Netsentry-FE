<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav nv-tabs-nav-wrap" role="tablist" aria-label="FTP审计">
        <button v-for="t in tabs" :key="t.key" type="button" class="nv-tab" :class="{ active: activeTab === t.key }" @click="activeTab = t.key">{{ t.label }}</button>
      </div>
    </div>
    <div class="nv-tabs-body">

      <!-- ==================== 实时查询 Tab ==================== -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'realtime' }">
        <!-- 筛选区域 -->
        <div class="tdh-filters">
          <div class="tdh-filter-row">
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">MAC</span>
              <select class="ou-toolbar-select" v-model="rtFilter.mac">
                <option value="">任意</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">IP</span>
              <select class="ou-toolbar-select" v-model="rtFilter.ip">
                <option value="any">任意IP</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">用户名</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="rtFilter.userName" placeholder="" />
            </label>
          </div>
          <div class="tdh-filter-row">
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">操作名称</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="rtFilter.operationName" placeholder="" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">FTP动作</span>
              <select class="ou-toolbar-select" v-model="rtFilter.ftpAction">
                <option value="">任意</option>
                <option value="上传">上传</option>
                <option value="下载">下载</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">用户组</span>
              <select class="ou-toolbar-select" v-model="rtFilter.userGroup">
                <option value="">任意</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">用户名称</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="rtFilter.displayName" placeholder="" />
            </label>
            <button class="ou-search-btn" @click="doRtSearch">
              <el-icon><Search /></el-icon>
            </button>
            <button class="secondary td-reset-btn" @click="resetRtFilters">重置</button>
          </div>
        </div>

        <!-- 数据表格 -->
        <div class="ou-table-wrap" style="flex:1;min-height:0">
          <table class="ou-table audit-table">
            <thead>
              <tr>
                <th style="width:40px">序号</th>
                <th>操作时间 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>MAC</th>
                <th>MAC厂商</th>
                <th>用户名称</th>
                <th>源IP</th>
                <th>目标IP</th>
                <th>用户名</th>
                <th>FTP动作</th>
                <th style="min-width:280px">附件名称</th>
                <th style="width:100px">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in rtPageData" :key="idx">
                <td>{{ (rtPage - 1) * rtPageSize + idx + 1 }}</td>
                <td style="white-space:nowrap">{{ row.opTime }}</td>
                <td style="font-size:12px">{{ row.mac }}</td>
                <td style="font-size:12px">{{ row.macVendor }}</td>
                <td>{{ row.userName }}</td>
                <td><span class="tid-link" @click="openSessionDiagPopup(row.srcIp, 'src')">{{ row.srcIp }}</span></td>
                <td><span class="tid-link" @click="openSessionDiagPopup(row.dstIp, 'dst')">{{ row.dstIp }}</span></td>
                <td style="font-size:12px">{{ row.loginName }}</td>
                <td style="font-size:12px">{{ row.ftpAction }}</td>
                <td style="font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:300px" :title="row.fileName">{{ row.fileName }}</td>
                <td>
                  <span class="link-btn pkt-dropdown-trigger" @click.stop="togglePacketMenu($event, row)">数据包</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="ou-footer">
          <div class="ou-footer-left">
            <div class="ou-pager">
              <button class="ou-page-btn" @click="rtPage > 1 && rtPage--">‹</button>
              <button v-for="p in rtPages" :key="p" class="ou-page-btn" :class="{ active: p === rtPage }" @click="rtPage = p">{{ p }}</button>
              <button class="ou-page-btn" @click="rtPage < rtPages && rtPage++">›</button>
              <span style="margin-left:8px;font-size:12px;color:#909399">到第</span>
              <input class="ou-page-goto-input" v-model.number="rtGotoPage" style="width:36px;height:24px;text-align:center;border:1px solid #dcdfe6;border-radius:3px;font-size:12px" />
              <span style="font-size:12px;color:#909399">页</span>
              <button class="ou-page-goto-btn" @click="goToRtPage" style="height:24px;padding:0 8px;border:1px solid #dcdfe6;border-radius:3px;background:#fff;font-size:12px;cursor:pointer">确定</button>
            </div>
          </div>
          <div class="ou-footer-right">
            <span>共 {{ rtData.length }} 条</span>
            <label class="ou-page-size">
              <select v-model="rtPageSize" style="height:24px;border:1px solid #dcdfe6;border-radius:3px;font-size:12px;padding:0 4px">
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

      <!-- ==================== FTP概况 Tab ==================== -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'overview' }">
        <!-- 筛选区域 -->
        <div class="tdh-filters">
          <div class="tdh-filter-row">
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">MAC</span>
              <select class="ou-toolbar-select" v-model="ovFilter.mac">
                <option value="">任意</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">源IP</span>
              <select class="ou-toolbar-select" v-model="ovFilter.srcIpType">
                <option value="any">任意IP</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">目标IP</span>
              <select class="ou-toolbar-select" v-model="ovFilter.dstIpType">
                <option value="any">任意IP</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">源端口</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="ovFilter.srcPort" placeholder="80 / 8000-8080" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">目标IP</span>
              <select class="ou-toolbar-select" v-model="ovFilter.dstIpType2">
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
              <span class="ou-toolbar-label">源IP ISP</span>
              <select class="ou-toolbar-select" v-model="ovFilter.srcIpIsp">
                <option value="">任意</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">目标IP ISP</span>
              <select class="ou-toolbar-select" v-model="ovFilter.dstIpIsp">
                <option value="">任意</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">源IP区域</span>
              <select class="ou-toolbar-select" v-model="ovFilter.srcIpRegion">
                <option value="">任意</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">目标IP区域</span>
              <select class="ou-toolbar-select" v-model="ovFilter.dstIpRegion">
                <option value="">任意</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">用户名</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="ovFilter.userName" placeholder="" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">FTP动作</span>
              <select class="ou-toolbar-select" v-model="ovFilter.ftpAction">
                <option value="">任意</option>
                <option value="上传">上传</option>
                <option value="下载">下载</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">操作名称</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="ovFilter.operationName" placeholder="" />
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
              <button style="border:none;background:none;cursor:pointer;color:#409eff;font-size:13px" @click="doOvExport">
                <el-icon><Download /></el-icon> 导出
              </button>
            </div>
          </div>
        </div>

        <!-- 内容区域：左侧柱状图 + 右侧表格 -->
        <div class="ov-content-grid">
          <!-- 左侧：前20源IP 柱状图 -->
          <div style="background:#fff;border:1px solid #ebeef5;border-radius:4px;padding:12px">
            <div style="font-size:13px;font-weight:600;margin-bottom:8px;color:#303133">
              <el-icon style="margin-right:4px"><DataAnalysis /></el-icon> 前20源IP
            </div>
            <v-chart :option="ovSrcIpChartOption" autoresize style="width:100%;height:300px" />
          </div>

          <!-- 右侧：源IP表格 -->
          <div style="background:#fff;border:1px solid #ebeef5;border-radius:4px;padding:12px">
            <table class="ou-table audit-table" style="margin:0">
              <thead>
                <tr>
                  <th style="width:40px">序号</th>
                  <th>源IP</th>
                  <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in ovSrcIpData" :key="idx">
                  <td>{{ idx + 1 }}</td>
                  <td><span class="tid-link" @click="openSessionDiagPopup(row.ip, 'src')">{{ row.ip }}</span></td>
                  <td class="ou-num">{{ row.totalReq }}</td>
                </tr>
                <tr v-if="ovSrcIpData.length === 0">
                  <td colspan="3" class="ou-empty">无数据</td>
                </tr>
              </tbody>
            </table>
            <div class="ou-footer" style="margin-top:8px">
              <div class="ou-pager">
                <button class="ou-page-btn">‹</button>
                <button class="ou-page-btn active">1</button>
                <button class="ou-page-btn">›</button>
              </div>
              <span style="font-size:12px;color:#909399">共 {{ ovSrcIpData.length }} 条</span>
            </div>
          </div>

          <!-- 左侧：前20目标IP 柱状图 -->
          <div style="background:#fff;border:1px solid #ebeef5;border-radius:4px;padding:12px">
            <div style="font-size:13px;font-weight:600;margin-bottom:8px;color:#303133">
              <el-icon style="margin-right:4px"><DataAnalysis /></el-icon> 前20目标IP
            </div>
            <v-chart :option="ovDstIpChartOption" autoresize style="width:100%;height:300px" />
          </div>

          <!-- 右侧：目标IP表格 -->
          <div style="background:#fff;border:1px solid #ebeef5;border-radius:4px;padding:12px">
            <table class="ou-table audit-table" style="margin:0">
              <thead>
                <tr>
                  <th style="width:40px">序号</th>
                  <th>目标IP</th>
                  <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in ovDstIpData" :key="idx">
                  <td>{{ idx + 1 }}</td>
                  <td><span class="tid-link" @click="openSessionDiagPopup(row.ip, 'dst')">{{ row.ip }}</span></td>
                  <td class="ou-num">{{ row.totalReq }}</td>
                </tr>
                <tr v-if="ovDstIpData.length === 0">
                  <td colspan="3" class="ou-empty">无数据</td>
                </tr>
              </tbody>
            </table>
            <div class="ou-footer" style="margin-top:8px">
              <div class="ou-pager">
                <button class="ou-page-btn">‹</button>
                <button class="ou-page-btn active">1</button>
                <button class="ou-page-btn">›</button>
              </div>
              <span style="font-size:12px;color:#909399">共 {{ ovDstIpData.length }} 条</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ==================== 历史查询 Tab ==================== -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'history' }">
        <!-- 筛选区域 -->
        <div class="tdh-filters">
          <div class="tdh-filter-row">
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">MAC</span>
              <select class="ou-toolbar-select" v-model="htFilter.mac">
                <option value="">任意</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">源IP</span>
              <select class="ou-toolbar-select" v-model="htFilter.srcIpType">
                <option value="any">任意IP</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">目标IP</span>
              <select class="ou-toolbar-select" v-model="htFilter.dstIpType">
                <option value="any">任意IP</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">源端口</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="htFilter.srcPort" placeholder="80 / 8000-8080" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">目标IP</span>
              <select class="ou-toolbar-select" v-model="htFilter.dstIpType2">
                <option value="any">任意IP</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">目标端口</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="htFilter.dstPort" placeholder="80 / 8000-8080" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">协议等级</span>
              <select class="ou-toolbar-select" v-model="htFilter.protocolLevel">
                <option value="">任意</option>
              </select>
            </label>
          </div>
          <div class="tdh-filter-row">
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">源IP ISP</span>
              <select class="ou-toolbar-select" v-model="htFilter.srcIpIsp">
                <option value="">任意</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">目标IP ISP</span>
              <select class="ou-toolbar-select" v-model="htFilter.dstIpIsp">
                <option value="">任意</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">源IP区域</span>
              <select class="ou-toolbar-select" v-model="htFilter.srcIpRegion">
                <option value="">任意</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">目标IP区域</span>
              <select class="ou-toolbar-select" v-model="htFilter.dstIpRegion">
                <option value="">任意</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">用户组</span>
              <select class="ou-toolbar-select" v-model="htFilter.userGroup">
                <option value="">任意</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">用户名</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="htFilter.userName" placeholder="" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">用户名</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="htFilter.displayName" placeholder="" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">FTP动作</span>
              <select class="ou-toolbar-select" v-model="htFilter.ftpAction">
                <option value="">任意</option>
                <option value="上传">上传</option>
                <option value="下载">下载</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">账号备注</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="htFilter.accountNote" placeholder="" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">链路</span>
              <select class="ou-toolbar-select" v-model="htFilter.link">
                <option value="">任意</option>
              </select>
            </label>
            <label class="tdh-filter-field tdh-filter-time">
              <span class="ou-toolbar-label">时间范围</span>
              <input class="ou-toolbar-input tdh-time-range" v-model="htFilter.timeRange" />
            </label>
            <button class="ou-search-btn" @click="doHtSearch">
              <el-icon><Search /></el-icon>
            </button>
            <button class="secondary td-reset-btn" @click="resetHtFilters">重置</button>
          </div>
        </div>

        <!-- 数据表格 -->
        <div class="ou-table-wrap" style="flex:1;min-height:0">
          <table class="ou-table audit-table">
            <thead>
              <tr>
                <th style="width:40px">序号</th>
                <th>操作时间 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>MAC</th>
                <th>MAC厂商</th>
                <th>用户名称</th>
                <th>源IP</th>
                <th>目标IP</th>
                <th>目标地理位置</th>
                <th>用户名</th>
                <th>FTP动作</th>
                <th>协议等级</th>
                <th>链路</th>
                <th style="min-width:280px">附件名称</th>
                <th style="width:100px">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in htPageData" :key="idx">
                <td>{{ (htPage - 1) * htPageSize + idx + 1 }}</td>
                <td style="white-space:nowrap">{{ row.opTime }}</td>
                <td style="font-size:12px">{{ row.mac }}</td>
                <td style="font-size:12px">{{ row.macVendor }}</td>
                <td>{{ row.userName }}</td>
                <td><span class="tid-link" @click="openSessionDiagPopup(row.srcIp, 'src')">{{ row.srcIp }}</span></td>
                <td><span class="tid-link" @click="openSessionDiagPopup(row.dstIp, 'dst')">{{ row.dstIp }}</span></td>
                <td style="font-size:12px">{{ row.geoLocation }}</td>
                <td style="font-size:12px">{{ row.loginName }}</td>
                <td style="font-size:12px">{{ row.ftpAction }}</td>
                <td style="font-size:12px">{{ row.protocolLevel }}</td>
                <td style="font-size:12px">{{ row.link }}</td>
                <td style="font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:300px" :title="row.fileName">{{ row.fileName }}</td>
                <td>
                  <span class="link-btn pkt-dropdown-trigger" @click.stop="togglePacketMenu($event, row)">数据包</span>
                </td>
              </tr>
              <tr v-if="htData.length === 0">
                <td colspan="14" class="ou-empty">无数据</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="ou-footer">
          <div class="ou-footer-left">
            <div class="ou-pager">
              <button class="ou-page-btn" @click="htPage > 1 && htPage--">‹</button>
              <button v-for="p in htPages" :key="p" class="ou-page-btn" :class="{ active: p === htPage }" @click="htPage = p">{{ p }}</button>
              <button class="ou-page-btn" @click="htPage < htPages && htPage++">›</button>
              <span style="margin-left:8px;font-size:12px;color:#909399">到第</span>
              <input class="ou-page-goto-input" v-model.number="htGotoPage" style="width:36px;height:24px;text-align:center;border:1px solid #dcdfe6;border-radius:3px;font-size:12px" />
              <span style="font-size:12px;color:#909399">页</span>
              <button class="ou-page-goto-btn" @click="goToHtPage" style="height:24px;padding:0 8px;border:1px solid #dcdfe6;border-radius:3px;background:#fff;font-size:12px;cursor:pointer">确定</button>
            </div>
          </div>
          <div class="ou-footer-right">
            <span>共 {{ htData.length }} 条</span>
            <label class="ou-page-size">
              <select v-model="htPageSize" style="height:24px;border:1px solid #dcdfe6;border-radius:3px;font-size:12px;padding:0 4px">
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
            <span class="ou-toolbar-label"><el-icon><Filter /></el-icon> 过滤源</span>
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
            <span class="ou-toolbar-label"><el-icon><Filter /></el-icon> 过滤目标</span>
            <select class="ou-toolbar-select" v-model="sessionDiagFilter.filterDst">
              <option value="no">否</option>
              <option value="yes">是</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">目标端口</span>
            <input class="ou-toolbar-input tdh-filter-input" v-model="sessionDiagFilter.dstPort" placeholder="21" />
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
              <option value="FTP">FTP</option>
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
          <button class="ou-search-btn"><el-icon><Search /></el-icon></button>
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

      <!-- 会话诊断图表 -->
      <div class="dns-chart-grid">
        <div style="background:#fff;border:1px solid #ebeef5;border-radius:4px;padding:12px">
          <div style="font-size:13px;font-weight:600;margin-bottom:8px;color:#303133">
            <el-icon style="margin-right:4px"><DataAnalysis /></el-icon> 连接数
          </div>
          <v-chart :option="sdConnChartOption" autoresize style="width:100%;height:300px" />
        </div>
        <div style="background:#fff;border:1px solid #ebeef5;border-radius:4px;padding:12px">
          <div style="font-size:13px;font-weight:600;margin-bottom:8px;color:#303133">
            <el-icon style="margin-right:4px"><DataAnalysis /></el-icon> 上行流量 / 下行流量
          </div>
          <v-chart :option="sdTrafficChartOption" autoresize style="width:100%;height:300px" />
        </div>
      </div>

      <!-- 会话诊断表格 -->
      <div class="dns-content-grid" style="grid-template-columns:repeat(4,minmax(0,1fr))">
        <!-- 协议表 -->
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
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in sdProtoData" :key="idx">
                <td>{{ idx + 1 }}</td>
                <td style="font-size:12px;color:#409eff">{{ row.protocol }}</td>
                <td class="ou-num">{{ row.totalReq }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- 源IP表 -->
        <div style="background:#fff;border:1px solid #ebeef5;border-radius:4px;padding:12px">
          <table class="ou-table audit-table" style="margin:0">
            <thead>
              <tr>
                <th style="width:40px">序号</th>
                <th>源IP</th>
                <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in sdSrcIpData" :key="idx">
                <td>{{ idx + 1 }}</td>
                <td><span class="tid-link">{{ row.ip }}</span></td>
                <td class="ou-num">{{ row.totalReq }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- 目标IP表 -->
        <div style="background:#fff;border:1px solid #ebeef5;border-radius:4px;padding:12px">
          <table class="ou-table audit-table" style="margin:0">
            <thead>
              <tr>
                <th style="width:40px">序号</th>
                <th>目标IP</th>
                <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in sdDstIpData" :key="idx">
                <td>{{ idx + 1 }}</td>
                <td><span class="tid-link">{{ row.ip }}</span></td>
                <td class="ou-num">{{ row.totalReq }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- 域名表 -->
        <div style="background:#fff;border:1px solid #ebeef5;border-radius:4px;padding:12px">
          <table class="ou-table audit-table" style="margin:0">
            <thead>
              <tr>
                <th style="width:40px">序号</th>
                <th>目标域名</th>
                <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in sdDomainData" :key="idx">
                <td>{{ idx + 1 }}</td>
                <td><span class="tid-link">{{ row.domain }}</span></td>
                <td class="ou-num">{{ row.totalReq }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </el-dialog>

    <!-- ==================== 报文分析弹窗 ==================== -->
    <el-dialog
      v-model="packetVisible"
      title="报文分析 -> FTP"
      width="95%"
      top="3vh"
      destroy-on-close
      class="hd-detail-dialog"
    >
      <!-- 顶部 Tab 栏 -->
      <div style="display:flex;align-items:center;border-bottom:1px solid #e4e7ed;margin-bottom:12px">
        <span
          v-for="tab in pktTabs"
          :key="tab.key"
          :class="pktActiveTab === tab.key ? 'pkt-tab-active' : 'pkt-tab'"
          style="margin-right:20px"
          @click="pktActiveTab = tab.key"
        >{{ tab.label }}</span>
        <div style="margin-left:auto;display:flex;align-items:center;gap:12px;font-size:12px;color:#909399">
          <span>应用协议: FTP</span>
          <span style="cursor:pointer;color:#409eff"><el-icon><Download /></el-icon> 报文下载</span>
          <span style="cursor:pointer;color:#409eff"><el-icon><Download /></el-icon> 内容下载</span>
        </div>
      </div>

      <!-- 报文解析 Tab -->
      <div v-if="pktActiveTab === 'parse'">
        <!-- 过滤器 -->
        <div style="margin-bottom:12px;display:flex;align-items:center;gap:8px">
          <span style="font-size:12px;color:#909399">报文显示过滤器</span>
          <input class="ou-toolbar-input tdh-filter-input" v-model="pktFilter" placeholder="" style="width:200px;height:24px;font-size:12px" />
          <select style="margin-left:auto;height:24px;border:1px solid #dcdfe6;border-radius:3px;font-size:12px;padding:0 4px">
            <option>TOP 100</option>
          </select>
        </div>

        <!-- 数据包列表 -->
        <div style="border:1px solid #e4e7ed;border-radius:4px;overflow:hidden">
          <table class="ou-table audit-table" style="margin:0">
            <thead>
              <tr>
                <th style="width:40px">序号 <el-icon class="sort-icon"><Sort /></el-icon></th>
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
                v-for="(pkt, idx) in packetData.list"
                :key="idx"
                :class="{ 'pkt-row-selected': pktSelectedIdx === idx }"
                @click="selectPacket(idx)"
                style="cursor:pointer"
              >
                <td>{{ idx + 1 }}</td>
                <td style="white-space:nowrap">{{ pkt.time }}</td>
                <td style="font-size:12px">{{ pkt.src }}</td>
                <td style="font-size:12px">{{ pkt.dst }}</td>
                <td style="font-size:12px">{{ pkt.protocol }}</td>
                <td class="ou-num">{{ pkt.length }}</td>
                <td style="font-size:12px;color:#909399">{{ pkt.detail }}</td>
              </tr>
              <tr v-if="packetData.list.length === 0">
                <td colspan="7" class="ou-empty">无数据</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 详情面板 -->
        <div v-if="pktSelectedIdx >= 0" style="margin-top:12px;border:1px solid #e4e7ed;border-radius:4px;padding:12px;background:#fafafa">
          <div style="font-size:13px;font-weight:600;margin-bottom:8px;color:#303133">
            <el-icon style="margin-right:4px"><InfoFilled /></el-icon> 数据包详情
          </div>
          <div v-for="(item, idx) in packetData.detailTree" :key="idx" style="margin-bottom:4px">
            <span style="color:#409eff;cursor:pointer;user-select:none" @click="item.expanded = !item.expanded">{{ item.expanded ? '▼' : '▶' }}</span>
            <span style="margin-left:4px;color:#303133">{{ item.label }}</span>
            <div v-if="item.expanded" v-for="(sub, sIdx) in item.children" :key="sIdx" style="margin-left:20px;margin-top:2px;color:#606266">
              <span style="color:#409eff;cursor:pointer;user-select:none" @click="sub.expanded = !sub.expanded">{{ sub.expanded ? '▼' : '▶' }}</span>
              <span style="margin-left:4px">{{ sub.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 报文交互 Tab -->
      <div v-if="pktActiveTab === 'interaction'">
        <div style="text-align:center;padding:40px;color:#909399">
          <el-icon :size="48"><DataAnalysis /></el-icon>
          <div style="margin-top:12px">报文交互（Mock）</div>
        </div>
      </div>

      <!-- 元数据 Tab -->
      <div v-if="pktActiveTab === 'metadata'">
        <div style="text-align:center;padding:40px;color:#909399">
          <el-icon :size="48"><DataAnalysis /></el-icon>
          <div style="margin-top:12px">元数据（Mock）</div>
        </div>
      </div>

      <!-- 证书分析 Tab -->
      <div v-if="pktActiveTab === 'cert'">
        <div style="text-align:center;padding:40px;color:#909399">
          <el-icon :size="48"><DataAnalysis /></el-icon>
          <div style="margin-top:12px">证书分析（Mock）</div>
        </div>
      </div>

      <!-- 报文播放 Tab -->
      <div v-if="pktActiveTab === 'play'">
        <div style="text-align:center;padding:40px;color:#909399">
          <el-icon :size="48"><VideoPlay /></el-icon>
          <div style="margin-top:12px">报文播放（Mock）</div>
        </div>
      </div>

      <!-- 时序图 Tab -->
      <div v-if="pktActiveTab === 'sequence'">
        <div style="text-align:center;padding:40px;color:#909399">
          <el-icon :size="48"><DataAnalysis /></el-icon>
          <div style="margin-top:12px">时序图（Mock）</div>
        </div>
      </div>
    </el-dialog>

    <!-- ==================== 报文播放弹窗 ==================== -->
    <el-dialog v-model="packetPlayVisible" title="报文播放" width="70%" destroy-on-close class="hd-detail-dialog">
      <div style="text-align:center;padding:40px;color:#909399">
        <el-icon :size="48"><VideoPlay /></el-icon>
        <div style="margin-top:12px">报文播放功能（Mock）</div>
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
  Search, Download, Sort, Filter, Close, DataAnalysis,
  InfoFilled, VideoPlay, Clock
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import './nv-shared.css'

use([CanvasRenderer, BarChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent])

// ── Tabs ──
const tabs = [
  { key: 'realtime', label: '实时查询' },
  { key: 'overview', label: 'FTP概况' },
  { key: 'history', label: '历史查询' },
]
const activeTab = ref('realtime')

// ── 实时查询 Tab ──
const rtPage = ref(1)
const rtPageSize = ref(100)
const rtGotoPage = ref(1)

const rtFilter = reactive({
  mac: '', ip: 'any', userName: '',
  operationName: '', ftpAction: '', userGroup: '', displayName: ''
})

interface RtRow {
  opTime: string; mac: string; macVendor: string; userName: string
  srcIp: string; dstIp: string; loginName: string; ftpAction: string; fileName: string
}

const rtData = ref<RtRow[]>([])

const rtPages = computed(() => Math.max(1, Math.ceil(rtData.value.length / rtPageSize.value)))
const rtPageData = computed(() => rtData.value.slice((rtPage.value - 1) * rtPageSize.value, rtPage.value * rtPageSize.value))

function generateRtData(): RtRow[] {
  const rows: RtRow[] = []
  const baseTime = new Date('2026-07-14T11:12:07')
  const macVendors = ['NewH3CTechno...', 'NewH3CTechno...', 'NewH3CTechno...']
  const ftpActions = ['上传(STOR)', '上传(STOR)', '上传(STOR)', '上传(STOR)', '上传(STOR)']
  const fileNames = [
    '1.关于组建部门协议的申请（草稿）.docx',
    '2.部门培训方案修改稿(第二版).docx',
    '3.关于提高员工工作效率的提案.docx',
    '4.通知：部门第二次内部培训材料(最终版).docx',
    '5.关于部门第三季度工作总结报告.docx',
    '6.2026年度部门工作计划.docx',
    '7.关于部门人员调整的通知.docx',
    '8.部门月度工作报告(2026年7月).docx',
    '9.关于部门预算调整的申请.docx',
    '10.部门季度工作总结(2026年Q2).docx',
    '11.关于部门绩效考核的通知.docx',
    '12.部门年度培训计划(2026).docx',
    '13.关于部门项目进度汇报.docx',
    '14.部门会议纪要(2026-07-14).docx',
    '15.关于部门人员招聘计划.docx',
    '16.部门工作总结(2026年上半年).docx',
    '17.关于部门技术选型的讨论.docx',
    '18.部门项目验收报告.docx',
    '19.关于部门流程优化的建议.docx',
    '20.部门季度预算报告.docx',
    'ZV_JUL_2025_PZ_3FESFA15A1554CBAE3004AAB6B5360_1BODY_00010.jpg',
    'ZV_JUL_2025_PZ_3FESFA15A1554CBAE3004AAB6B5360_1BODY_00011.jpg',
    'ZV_JUL_2025_PZ_3FESFA15A1554CBAE3004AAB6B5360_1BODY_00001.jpg',
    'ZV_JUL_2025_PZ_3FESFA15A1554CBAE3004AAB6B5360_1BODY_00002.jpg',
    'ZV_JUL_2025_PZ_3FESFA15A1554CBAE3004AAB6B5360_1BODY_00003.jpg',
    'ZV_JUL_2025_PZ_3FESFA15A1554CBAE3004AAB6B5360_1BODY_00004.jpg',
    'ZV_JUL_2025_PZ_3FESFA15A1554CBAE3004AAB6B5360_1BODY_00005.jpg',
    'ZV_JUL_2025_PZ_3FESFA15A1554CBAE3004AAB6B5360_1BODY_00006.jpg',
    'ZV_JUL_2025_PZ_3FESFA15A1554CBAE3004AAB6B5360_1BODY_00007.jpg',
    'ZV_JUL_2025_PZ_3FESFA15A1554CBAE3004AAB6B5360_1BODY_00008.jpg',
    'ZV_JUL_2025_PZ_3FESFA15A1554CBAE3004AAB6B5360_1BODY_00009.jpg',
    'ZV_JUL_2025_PZ_3FESFA15A1554CBAE3004AAB6B5360_1BODY_00012.jpg',
    'ZV_JUL_2025_PZ_3FESFA15A1554CBAE3004AAB6B5360_1BODY_00013.jpg',
    'ZV_JUL_2025_PZ_3FESFA15A1554CBAE3004AAB6B5360_1BODY_00014.jpg',
    'ZV_JUL_2025_PZ_3FESFA15A1554CBAE3004AAB6B5360_1BODY_00015.jpg',
    'ZV_JUL_2025_PZ_3FESFA15A1554CBAE3004AAB6B5360_1BODY_00016.jpg',
    'ZV_JUL_2025_PZ_3FESFA15A1554CBAE3004AAB6B5360_1BODY_00017.jpg',
    'ZV_JUL_2025_PZ_3FESFA15A1554CBAE3004AAB6B5360_1BODY_00018.jpg',
    'ZV_JUL_2025_PZ_3FESFA15A1554CBAE3004AAB6B5360_1BODY_00019.jpg',
    'ZV_JUL_2025_PZ_3FESFA15A1554CBAE3004AAB6B5360_1BODY_00020.jpg',
  ]

  for (let i = 0; i < 13167; i++) {
    const time = new Date(baseTime.getTime() - i * 1000)
    const h = String(time.getHours()).padStart(2, '0')
    const m = String(time.getMinutes()).padStart(2, '0')
    const s = String(time.getSeconds()).padStart(2, '0')
    const port = 64899 + (i % 100)
    rows.push({
      opTime: `2026-07-14 ${h}:${m}:${s}`,
      mac: '54-2b-de-6d-10-ae',
      macVendor: macVendors[i % macVendors.length],
      userName: '—',
      srcIp: `183.173.155.154:${port}`,
      dstIp: '101.6.6.84:21',
      loginName: 'ftpuser',
      ftpAction: ftpActions[i % ftpActions.length],
      fileName: fileNames[i % fileNames.length],
    })
  }
  return rows
}

rtData.value = generateRtData()

function doRtSearch() { /* mock */ }
function resetRtFilters() {
  rtFilter.mac = ''; rtFilter.ip = 'any'; rtFilter.userName = ''
  rtFilter.operationName = ''; rtFilter.ftpAction = ''
  rtFilter.userGroup = ''; rtFilter.displayName = ''
}
function goToRtPage() {
  const p = rtGotoPage.value
  if (p >= 1 && p <= rtPages.value) rtPage.value = p
}

// ── FTP概况 Tab ──
const ovFilter = reactive({
  mac: '',
  srcIpType: 'any',
  dstIpType: 'any',
  srcPort: '80 / 8000-8080',
  dstIpType2: 'any',
  dstPort: '80 / 8000-8080',
  srcIpIsp: '',
  dstIpIsp: '',
  srcIpRegion: '',
  dstIpRegion: '',
  userName: '',
  ftpAction: '',
  operationName: '',
  timeRange: '2026-07-14 14:47:11 - 2026-07-14 15:02:11'
})

interface OvIpRow {
  ip: string
  totalReq: number
}

const ovSrcIpData = ref<OvIpRow[]>([])
const ovDstIpData = ref<OvIpRow[]>([])

// 柱状图选项
const ovSrcIpChartOption = ref({
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  grid: { left: 120, right: 20, top: 10, bottom: 10 },
  xAxis: { type: 'value' },
  yAxis: {
    type: 'category',
    data: [] as string[],
    axisLabel: { fontSize: 10, width: 110, overflow: 'truncate' },
    inverse: true,
  },
  series: [{
    type: 'bar',
    data: [] as number[],
    itemStyle: { color: '#5b8ff9' },
    barWidth: '60%',
  }],
})

const ovDstIpChartOption = ref({
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  grid: { left: 120, right: 20, top: 10, bottom: 10 },
  xAxis: { type: 'value' },
  yAxis: {
    type: 'category',
    data: [] as string[],
    axisLabel: { fontSize: 10, width: 110, overflow: 'truncate' },
    inverse: true,
  },
  series: [{
    type: 'bar',
    data: [] as number[],
    itemStyle: { color: '#5b8ff9' },
    barWidth: '60%',
  }],
})

function generateOvData() {
  const srcIps = Array.from({ length: 20 }, (_, i) => ({
    ip: `183.173.155.${154 + i}`,
    totalReq: Math.max(100, 13167 - i * 650 + Math.floor(Math.random() * 200)),
  }))
  const dstIps = Array.from({ length: 20 }, (_, i) => ({
    ip: `101.6.6.${84 + i}`,
    totalReq: Math.max(50, 13167 - i * 600 + Math.floor(Math.random() * 150)),
  }))

  ovSrcIpData.value = srcIps
  ovDstIpData.value = dstIps

  // 更新柱状图
  ovSrcIpChartOption.value.yAxis.data = srcIps.map(r => r.ip)
  ovSrcIpChartOption.value.series[0].data = srcIps.map(r => r.totalReq)
  ovDstIpChartOption.value.yAxis.data = dstIps.map(r => r.ip)
  ovDstIpChartOption.value.series[0].data = dstIps.map(r => r.totalReq)
}

generateOvData()

function doOvSearch() { /* mock */ }
function doOvExport() { /* mock */ }
function resetOvFilters() {
  ovFilter.mac = ''
  ovFilter.srcIpType = 'any'
  ovFilter.dstIpType = 'any'
  ovFilter.srcPort = '80 / 8000-8080'
  ovFilter.dstIpType2 = 'any'
  ovFilter.dstPort = '80 / 8000-8080'
  ovFilter.srcIpIsp = ''
  ovFilter.dstIpIsp = ''
  ovFilter.srcIpRegion = ''
  ovFilter.dstIpRegion = ''
  ovFilter.userName = ''
  ovFilter.ftpAction = ''
  ovFilter.operationName = ''
  ovFilter.timeRange = '2026-07-14 14:47:11 - 2026-07-14 15:02:11'
}

// ── 历史查询 Tab ──
const htPage = ref(1)
const htPageSize = ref(100)
const htGotoPage = ref(1)

const htFilter = reactive({
  mac: '',
  srcIpType: 'any',
  dstIpType: 'any',
  srcPort: '80 / 8000-8080',
  dstIpType2: 'any',
  dstPort: '80 / 8000-8080',
  protocolLevel: '',
  srcIpIsp: '',
  dstIpIsp: '',
  srcIpRegion: '',
  dstIpRegion: '',
  userGroup: '',
  userName: '',
  displayName: '',
  ftpAction: '',
  accountNote: '',
  link: '',
  timeRange: '2026-07-14 15:18:39 - 2026-07-14 15:33:39'
})

interface HtRow {
  opTime: string; mac: string; macVendor: string; userName: string
  srcIp: string; dstIp: string; geoLocation: string; loginName: string
  ftpAction: string; protocolLevel: string; link: string; fileName: string
}

const htData = ref<HtRow[]>([])

const htPages = computed(() => Math.max(1, Math.ceil(htData.value.length / htPageSize.value)))
const htPageData = computed(() => htData.value.slice((htPage.value - 1) * htPageSize.value, htPage.value * htPageSize.value))

function generateHtData(): HtRow[] {
  const rows: HtRow[] = []
  const baseTime = new Date('2026-07-14T15:33:39')
  const macVendors = ['NewH3CTechno...', 'NewH3CTechno...', 'NewH3CTechno...']
  const ftpActions = ['上传(STOR)', '下载(RETR)', '上传(STOR)', '下载(RETR)', '上传(STOR)']
  const protocolLevels = ['普通', '普通', '普通', '普通', '普通']
  const links = ['默认', '默认', '默认', '默认', '默认']
  const geoLocations = ['北京市', '上海市', '广州市', '深圳市', '杭州市']
  const fileNames = [
    '1.关于组建部门协议的申请（草稿）.docx',
    '2.部门培训方案修改稿(第二版).docx',
    '3.关于提高员工工作效率的提案.docx',
    '4.通知：部门第二次内部培训材料(最终版).docx',
    '5.关于部门第三季度工作总结报告.docx',
  ]

  for (let i = 0; i < 30; i++) {
    const time = new Date(baseTime.getTime() - i * 1000)
    const h = String(time.getHours()).padStart(2, '0')
    const m = String(time.getMinutes()).padStart(2, '0')
    const s = String(time.getSeconds()).padStart(2, '0')
    const port = 64899 + (i % 100)
    rows.push({
      opTime: `2026-07-14 ${h}:${m}:${s}`,
      mac: '54-2b-de-6d-10-ae',
      macVendor: macVendors[i % macVendors.length],
      userName: '—',
      srcIp: `183.173.155.154:${port}`,
      dstIp: '101.6.6.84:21',
      geoLocation: geoLocations[i % geoLocations.length],
      loginName: 'ftpuser',
      ftpAction: ftpActions[i % ftpActions.length],
      protocolLevel: protocolLevels[i % protocolLevels.length],
      link: links[i % links.length],
      fileName: fileNames[i % fileNames.length],
    })
  }
  return rows
}

htData.value = generateHtData()

function doHtSearch() { /* mock */ }
function resetHtFilters() {
  htFilter.mac = ''
  htFilter.srcIpType = 'any'
  htFilter.dstIpType = 'any'
  htFilter.srcPort = '80 / 8000-8080'
  htFilter.dstIpType2 = 'any'
  htFilter.dstPort = '80 / 8000-8080'
  htFilter.protocolLevel = ''
  htFilter.srcIpIsp = ''
  htFilter.dstIpIsp = ''
  htFilter.srcIpRegion = ''
  htFilter.dstIpRegion = ''
  htFilter.userGroup = ''
  htFilter.userName = ''
  htFilter.displayName = ''
  htFilter.ftpAction = ''
  htFilter.accountNote = ''
  htFilter.link = ''
  htFilter.timeRange = '2026-07-14 15:18:39 - 2026-07-14 15:33:39'
}
function goToHtPage() {
  const p = htGotoPage.value
  if (p >= 1 && p <= htPages.value) htPage.value = p
}

// ── 数据包下拉菜单 ──
const packetMenuVisible = ref(false)
const packetMenuX = ref(0)
const packetMenuY = ref(0)
const packetMenuRow = ref<RtRow | null>(null)

function togglePacketMenu(event: MouseEvent, row: RtRow) {
  event.stopPropagation()
  packetMenuRow.value = row
  packetMenuX.value = event.clientX
  packetMenuY.value = event.clientY
  packetMenuVisible.value = true
  setTimeout(() => {
    document.addEventListener('click', hidePacketMenu, { once: true })
  }, 0)
}
function hidePacketMenu() {
  packetMenuVisible.value = false
}

// ── 会话诊断弹窗 ──
const sessionDiagVisible = ref(false)
const sessionDiagType = ref<'src' | 'dst'>('src')
const sessionDiagIpVersion = ref('v4')

const sessionDiagFilter = reactive({
  srcIp: '', srcIpType: 'any', filterSrc: 'no', srcPort: '80 / 8000-8080',
  dstIp: '', dstIpType: 'any', filterDst: 'no', dstPort: '21',
  mac: '', appProtocol: 'FTP', srcIpIsp: 'any', dstIpIsp: 'any',
  srcIpRegion: 'any', dstIpRegion: 'any',
  transportProtocol: '', userGroup: '', userName: '', link: '',
  timeRange: '2026-07-14 10:57:00 - 2026-07-14 11:12:07'
})

const sdConnChartOption = ref({
  tooltip: { trigger: 'axis' },
  grid: { left: 60, right: 20, top: 20, bottom: 40 },
  xAxis: {
    type: 'category',
    data: ['10:57', '11:00', '11:03', '11:06', '11:09', '11:12'],
    axisLabel: { rotate: 45, fontSize: 9 }
  },
  yAxis: { type: 'value', name: '连接数' },
  series: [{
    type: 'bar',
    data: [12, 18, 25, 20, 15, 10],
    itemStyle: { color: '#5b8ff9' },
    barWidth: '60%'
  }]
})

const sdTrafficChartOption = ref({
  tooltip: { trigger: 'axis' },
  legend: { data: ['上行流量', '下行流量'], textStyle: { fontSize: 10 } },
  grid: { left: 60, right: 20, top: 30, bottom: 40 },
  xAxis: {
    type: 'category',
    data: ['10:57', '11:00', '11:03', '11:06', '11:09', '11:12'],
    axisLabel: { rotate: 45, fontSize: 9 }
  },
  yAxis: { type: 'value', name: 'bps' },
  series: [
    {
      name: '上行流量', type: 'bar',
      data: [120000, 180000, 250000, 200000, 150000, 100000],
      itemStyle: { color: '#f56c6c' },
      barWidth: '40%'
    },
    {
      name: '下行流量', type: 'bar',
      data: [80000, 120000, 180000, 150000, 100000, 70000],
      itemStyle: { color: '#5b8ff9' },
      barWidth: '40%'
    }
  ]
})

const sdProtoData = ref([{ protocol: 'FTP', totalReq: 13167 }])
const sdSrcIpData = ref([{ ip: '183.173.155.154', totalReq: 13167 }])
const sdDstIpData = ref([{ ip: '101.6.6.84', totalReq: 13167 }])
const sdDomainData = ref<any[]>([])

function openSessionDiagPopup(value: string, type: 'src' | 'dst') {
  sessionDiagType.value = type
  sessionDiagVisible.value = true
  if (type === 'src') {
    sessionDiagFilter.srcIp = value.split(':')[0]
    sessionDiagFilter.dstIp = ''
  } else {
    sessionDiagFilter.dstIp = value.split(':')[0]
    sessionDiagFilter.srcIp = ''
  }
}

// ── 报文分析弹窗 ──
const packetVisible = ref(false)

const pktTabs = [
  { key: 'parse', label: '报文解析' },
  { key: 'interaction', label: '报文交互' },
  { key: 'metadata', label: '元数据' },
  { key: 'cert', label: '证书分析' },
  { key: 'play', label: '报文播放' },
  { key: 'sequence', label: '时序图' },
]
const pktActiveTab = ref('parse')
const pktFilter = ref('')
const pktSelectedIdx = ref(-1)

interface PktItem {
  time: string; src: string; dst: string; protocol: string; length: number; detail: string
}

const packetData = reactive({
  list: [] as PktItem[],
  detailTree: [] as { label: string; expanded: boolean; children: { label: string; expanded: boolean }[] }[],
})

function openPacketPopup(row: RtRow) {
  hidePacketMenu()
  pktActiveTab.value = 'parse'
  pktSelectedIdx.value = -1
  packetVisible.value = true

  // 生成mock数据包列表
  const baseTime = new Date('2026-07-14T11:12:07')
  packetData.list = []
  for (let i = 0; i < 30; i++) {
    const time = new Date(baseTime.getTime() - i * 500)
    const h = String(time.getHours()).padStart(2, '0')
    const m = String(time.getMinutes()).padStart(2, '0')
    const s = String(time.getSeconds()).padStart(2, '0')
    const ms = String(time.getMilliseconds()).padStart(3, '0')
    packetData.list.push({
      time: `${h}:${m}:${s}.${ms}`,
      src: '183.173.155.154',
      dst: '101.6.6.84',
      protocol: i % 3 === 0 ? 'TCP' : 'FTP',
      length: Math.floor(Math.random() * 1400 + 60),
      detail: i % 3 === 0 ? 'TCP Flags: ACK' : 'FTP Command',
    })
  }

  // 生成详情树
  packetData.detailTree = [
    {
      label: 'Frame 1: 142 bytes on wire',
      expanded: false,
      children: [
        { label: 'Frame Number: 1', expanded: false },
        { label: 'Frame Length: 142 bytes', expanded: false },
        { label: 'Capture Time: 2026-07-14 11:12:07.000', expanded: false },
      ],
    },
    {
      label: 'Ethernet II, Src: 54:2b:de:6d:10:ae, Dst: 00:0c:29:xx:xx:xx',
      expanded: false,
      children: [
        { label: 'Destination: 00:0c:29:xx:xx:xx', expanded: false },
        { label: 'Source: 54:2b:de:6d:10:ae', expanded: false },
        { label: 'Type: IPv4 (0x0800)', expanded: false },
      ],
    },
    {
      label: 'Internet Protocol Version 4, Src: 183.173.155.154, Dst: 101.6.6.84',
      expanded: false,
      children: [
        { label: 'Version: 4', expanded: false },
        { label: 'Header Length: 20 bytes', expanded: false },
        { label: 'Source Address: 183.173.155.154', expanded: false },
        { label: 'Destination Address: 101.6.6.84', expanded: false },
      ],
    },
    {
      label: 'Transmission Control Protocol, Src Port: 64899, Dst Port: 21',
      expanded: false,
      children: [
        { label: 'Source Port: 64899', expanded: false },
        { label: 'Destination Port: 21 (FTP)', expanded: false },
        { label: 'Flags: ACK', expanded: false },
      ],
    },
    {
      label: 'File Transfer Protocol',
      expanded: false,
      children: [
        { label: 'Request Command: STOR', expanded: false },
        { label: 'Request Argument: 1.关于组建部门协议的申请.docx', expanded: false },
      ],
    },
  ]
}

function selectPacket(idx: number) {
  pktSelectedIdx.value = idx
}

function openPacketPlayPopup(row: RtRow) {
  hidePacketMenu()
  packetPlayVisible.value = true
}

function downloadPacket(row: RtRow) {
  hidePacketMenu()
  ElMessage.info('报文下载功能（Mock）')
}

function downloadContent(row: RtRow) {
  hidePacketMenu()
  ElMessage.info('内容下载功能（Mock）')
}

function queryTailPacket(row: RtRow) {
  hidePacketMenu()
  ElMessage.info('尾包查询功能（Mock）')
}

function stitchSession(row: RtRow) {
  hidePacketMenu()
  ElMessage.info('会话缝合功能（Mock）')
}

// ── 报文播放弹窗 ──
const packetPlayVisible = ref(false)
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

/* 报文分析弹窗 Tab 样式 */
.pkt-tab {
  font-size: 13px;
  color: #909399;
  cursor: pointer;
  padding-bottom: 4px;
}
.pkt-tab:hover {
  color: #409eff;
}
.pkt-tab-active {
  font-size: 13px;
  color: #409eff;
  cursor: pointer;
  border-bottom: 2px solid #409eff;
  padding-bottom: 4px;
  font-weight: 600;
}

/* 报文行选中样式 */
.pkt-row-selected {
  background: #e8f5e9 !important;
}

/* 数据包下拉菜单 */
.packet-context-menu {
  position: fixed;
  z-index: 9999;
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

/* 详情弹窗 */
:deep(.hd-detail-dialog .el-dialog__body) {
  padding: 12px 20px;
}

/* 概况 Tab 内容网格（图表+表格） */
.ov-content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 12px;
  background: #f5f7fa;
  flex: 1;
  min-height: 0;
}
</style>
