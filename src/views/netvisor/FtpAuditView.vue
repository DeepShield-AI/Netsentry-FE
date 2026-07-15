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
                  <span class="link-btn" @click.stop="openPacketPopup(row)">数据包</span>
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

    <!-- 数据包下拉菜单（供历史查询等使用） -->
    <div v-if="packetMenuVisible" class="packet-context-menu" :style="{ left: packetMenuX + 'px', top: packetMenuY + 'px' }" @click.stop>
      <div class="packet-menu-item" @click="openPacketPopup(packetMenuRow)"><el-icon><InfoFilled /></el-icon> 报文分析</div>
      <div class="packet-menu-item" @click="openPacketPlaybackTab(packetMenuRow)"><el-icon><VideoPlay /></el-icon> 报文播放</div>
      <div class="packet-menu-item" @click="downloadPacket(packetMenuRow)"><el-icon><Download /></el-icon> 报文下载</div>
      <div class="packet-menu-item" @click="downloadContent(packetMenuRow)"><el-icon><Download /></el-icon> 内容下载</div>
      <div class="packet-menu-item" @click="queryTailPacket(packetMenuRow)"><el-icon><InfoFilled /></el-icon> 尾包查询</div>
      <div class="packet-menu-item" @click="stitchSession(packetMenuRow)"><el-icon><InfoFilled /></el-icon> 会话缝合</div>
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
    <el-dialog v-model="packetVisible" title="报文分析 -> FTP" width="95%" top="3vh" destroy-on-close class="hd-detail-dialog">
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
            <tr v-for="(pkt, i) in packetData.packets" :key="i" :style="{background: i === 0 ? '#e8f5e9' : i === 1 ? '#e3f2fd' : 'transparent'}" @click="packetSelectedIdx = i; packetExpandedRow = i" :class="{ 'pkt-row-selected': packetSelectedIdx === i }" style="cursor:pointer">
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
          <div style="padding:8px;background:#f5f7fa;border-radius:4px;font-size:12px"><div style="color:#909399">目标端口</div><div style="color:#303133;margin-top:4px;font-weight:500">21</div></div>
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
const packetMenuRow = ref<RtRow | HtRow | null>(null)

function togglePacketMenu(event: MouseEvent, row: RtRow | HtRow) {
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
const packetSelectedIdx = ref(0)
const packetExpandedRow = ref(-1)

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

const packetData = ref({
  protocol: 'FTP',
  packets: [
    { time: '0.000000', src: '183.173.155.154:64899', dst: '101.6.6.84:21', protocol: 'TCP', length: '74', detail: '64899 --> 21 [SYN] Seq=0 Win=64240 Len=0 MSS=1460' },
    { time: '0.070246', src: '183.173.155.154:64899', dst: '101.6.6.84:21', protocol: 'TCP', length: '66', detail: '64899 --> 21 [ACK] Seq=1 Ack=1 Win=64256 Len=0' },
    { time: '0.095266', src: '183.173.155.154:64899', dst: '101.6.6.84:21', protocol: 'FTP', length: '583', detail: 'USER ftpuser' },
    { time: '0.171282', src: '101.6.6.84:21', dst: '183.173.155.154:64899', protocol: 'FTP', length: '66', detail: '331 Please specify the password.' },
    { time: '0.171288', src: '183.173.155.154:64899', dst: '101.6.6.84:21', protocol: 'FTP', length: '66', detail: 'PASS ftpuser' },
    { time: '0.250000', src: '183.173.155.154:64899', dst: '101.6.6.84:21', protocol: 'FTP', length: '297', detail: 'STOR 1.关于组建部门协议的申请.docx' },
  ],
  detailTree: [
    {
      label: 'Frame 1: 74 bytes on wire (592 bits), 74 bytes captured (592 bits)',
      expanded: false,
      children: [] as any[]
    },
    {
      label: 'Ethernet II, Src: 54:2b:de:6d:10:ae, Dst: 00:0c:29:xx:xx:xx',
      expanded: false,
      children: [] as any[]
    },
    {
      label: 'Internet Protocol Version 4, Src: 183.173.155.154, Dst: 101.6.6.84',
      expanded: false,
      children: [] as any[]
    },
    {
      label: 'Transmission Control Protocol, Src Port: 64899, Dst Port: 21, Seq: 0, Len: 0',
      expanded: false,
      children: [] as any[]
    }
  ],
  hexDump: [
    '0000  30 80 9b 8d  90 01 54 2b  de 6d 10 ae  08 00 45 00    0.....T+  .m....E.',
    '0010  00 3c 24 37  40 00 31 06  97 04 01 18  18 e1 65 06    .<$7@.1.  ......e.',
    '0020  0f 82 1f 05  01 bb 90 a1  8e 3b 00 00  00 00 a0 02    ........  .;......',
    '0030  fa f0 77 cf  00 00 02 04  05 a0 04 02  08 0a 0c 08    ..w.....  ........',
    '0040  fb 2d 00 00  00 00 01 03  03 07                     .-......  .-......'
  ]
})

const interactionSourceBlocks = ref<string[]>([
  '55 53 45 52  20 66 74 70  75 73 65 72  0d 0a',
  '50 41 53 53  20 66 74 70  75 73 65 72  0d 0a',
  '53 54 4f 52  20 31 2e e5  85 b3 e4 ba  8e e7 bb 84 e5'
])
const interactionDstBlocks = ref<string[]>([
  '33 33 31 20  50 6c 65 61  73 65 20 73  70 65 63 69',
  '32 33 30 20  55 73 65 72  20 6c 6f 67  67 65 64 20',
  '31 35 30 20  4f 70 65 6e  69 6e 67 20  64 61 74 61'
])
const interactionPage = ref(1)
const interactionTotal = ref(40)

const metadataDisplayMode = ref('attr')

const playNic = ref('eth0')
const playCount = ref(1)
const playSpeed = ref('1')
const playInfoItems = ref([
  { time: '0.000000', src: '183.173.155.154:64899', dst: '101.6.6.84:21', length: '74', status: '待播放' }
])

const timeGapThreshold = ref(100)
const timelinePage = ref(1)
const timelineData = ref([
  { no: 1, time: '0.000000', src: '183.173.155.154:64899', dst: '101.6.6.84:21', protocol: 'TCP', info: 'SYN' },
  { no: 2, time: '0.070246', src: '183.173.155.154:64899', dst: '101.6.6.84:21', protocol: 'TCP', info: 'ACK' },
  { no: 3, time: '0.095266', src: '183.173.155.154:64899', dst: '101.6.6.84:21', protocol: 'FTP', info: 'USER ftpuser' },
  { no: 4, time: '0.171282', src: '101.6.6.84:21', dst: '183.173.155.154:64899', protocol: 'FTP', info: '331 Password' },
])
const timelineProtocolTree = ref([
  { label: 'Frame 1: 74 bytes', expanded: false, children: [] as any[] }
])
const timelineHexDump = ref([
  '0000  30 80 9b 8d  90 01 54 2b  de 6d 10 ae  08 00 45 00'
])

function openPacketPopup(row: RtRow | HtRow) {
  hidePacketMenu()
  packetData.value.protocol = 'FTP'
  packetExpandedRow.value = -1
  packetSelectedIdx.value = 0
  packetActiveTab.value = 'parse'
  packetVisible.value = true
}

function openPacketPlaybackTab(row: RtRow | HtRow) {
  hidePacketMenu()
  packetData.value.protocol = 'FTP'
  packetExpandedRow.value = -1
  packetSelectedIdx.value = 0
  packetActiveTab.value = 'playback'
  packetVisible.value = true
}

function downloadPacketFromPopup() {
  ElMessage.info('报文下载功能（Mock）')
}

function downloadContentFromPopup() {
  ElMessage.info('内容下载功能（Mock）')
}

function startPacketPlayback() {
  ElMessage.info(`开始播放：网卡 ${playNic.value}，次数 ${playCount.value}，速度 ${playSpeed.value}x（Mock）`)
}

function downloadPacket(row: RtRow | HtRow) {
  hidePacketMenu()
  ElMessage.info('报文下载功能（Mock）')
}

function downloadContent(row: RtRow | HtRow) {
  hidePacketMenu()
  ElMessage.info('内容下载功能（Mock）')
}

function queryTailPacket(row: RtRow | HtRow) {
  hidePacketMenu()
  ElMessage.info('尾包查询功能（Mock）')
}

function stitchSession(row: RtRow | HtRow) {
  hidePacketMenu()
  ElMessage.info('会话缝合功能（Mock）')
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
