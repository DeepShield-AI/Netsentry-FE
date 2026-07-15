<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav nv-tabs-nav-wrap" role="tablist" aria-label="Telnet审计">
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
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">执行命令</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="rtFilter.command" placeholder="" />
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
                <th style="min-width:200px">执行命令</th>
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
                <td style="font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:250px" :title="row.command">{{ row.command }}</td>
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

      <!-- ==================== Telnet概况 Tab ==================== -->
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
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">协议等级</span>
              <select class="ou-toolbar-select" v-model="ovFilter.protocolLevel">
                <option value="">任意</option>
              </select>
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
              <span class="ou-toolbar-label">用户组</span>
              <select class="ou-toolbar-select" v-model="ovFilter.userGroup">
                <option value="">任意</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">用户名称</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="ovFilter.userName" placeholder="" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">用户名</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="ovFilter.displayName" placeholder="" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">执行命令</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="ovFilter.command" placeholder="" />
            </label>
            <label class="tdh-filter-field tdh-filter-time">
              <span class="ou-toolbar-label">时间范围</span>
              <input class="ou-toolbar-input tdh-time-range" v-model="ovFilter.timeRange" />
            </label>
            <button class="ou-search-btn" @click="doOvSearch">
              <el-icon><Search /></el-icon>
            </button>
            <button class="secondary td-reset-btn" @click="resetOvFilters">重置</button>
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
              <span class="ou-toolbar-label">执行命令</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="htFilter.command" placeholder="" />
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
                <th>协议等级</th>
                <th>链路</th>
                <th style="min-width:200px">执行命令</th>
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
                <td style="font-size:12px">{{ row.protocolLevel }}</td>
                <td style="font-size:12px">{{ row.link }}</td>
                <td style="font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:250px" :title="row.command">{{ row.command }}</td>
                <td>
                  <span class="link-btn pkt-dropdown-trigger" @click.stop="togglePacketMenu($event, row)">数据包</span>
                </td>
              </tr>
              <tr v-if="htData.length === 0">
                <td colspan="13" class="ou-empty">无数据</td>
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
            <input class="ou-toolbar-input tdh-filter-input" v-model="sessionDiagFilter.dstPort" placeholder="23" />
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
              <option value="Telnet">Telnet</option>
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
    <el-dialog v-model="packetVisible" title="报文分析->Telnet" width="95%" top="3vh" destroy-on-close class="hd-detail-dialog">
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
          <div style="padding:8px;background:#f5f7fa;border-radius:4px;font-size:12px"><div style="color:#909399">目标端口</div><div style="color:#303133;margin-top:4px;font-weight:500">23</div></div>
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
  InfoFilled, VideoPlay
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import './nv-shared.css'

use([CanvasRenderer, BarChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent])

// ── Tabs ─
const tabs = [
  { key: 'realtime', label: '实时查询' },
  { key: 'overview', label: 'Telnet概况' },
  { key: 'history', label: '历史查询' },
]
const activeTab = ref('realtime')

// ── 实时查询 Tab ──
const rtPage = ref(1)
const rtPageSize = ref(100)
const rtGotoPage = ref(1)

const rtFilter = reactive({
  mac: '', ip: 'any', userName: '',
  userGroup: '', displayName: '', command: ''
})

interface RtRow {
  opTime: string; mac: string; macVendor: string; userName: string
  srcIp: string; dstIp: string; loginName: string; command: string
}

const rtData = ref<RtRow[]>([])

const rtPages = computed(() => Math.max(1, Math.ceil(rtData.value.length / rtPageSize.value)))
const rtPageData = computed(() => rtData.value.slice((rtPage.value - 1) * rtPageSize.value, rtPage.value * rtPageSize.value))

function generateRtData(): RtRow[] {
  const rows: RtRow[] = []
  const baseTime = new Date('2026-07-20T15:00:50')
  const macVendors = ['NewH3CTechno...', 'NewH3CTechno...', 'NewH3CTechno...']
  const commands = [
    'admin',
    'localhost',
    'localhost',
    'ls -la',
    'cat /etc/passwd',
    'whoami',
    'pwd',
    'ps aux',
    'netstat -an',
    'ifconfig',
  ]

  for (let i = 0; i < 3; i++) {
    const time = new Date(baseTime.getTime() - i * 1000)
    const h = String(time.getHours()).padStart(2, '0')
    const m = String(time.getMinutes()).padStart(2, '0')
    const s = String(time.getSeconds()).padStart(2, '0')
    const port = 44217 + i
    rows.push({
      opTime: `2026-07-20 ${h}:${m}:${s}`,
      mac: '54-2b-de-6d-10-ae',
      macVendor: macVendors[i % macVendors.length],
      userName: '—',
      srcIp: `166.111.9.181:${port}`,
      dstIp: '101.6.4.191:23',
      loginName: 'admin',
      command: commands[i % commands.length],
    })
  }
  return rows
}

rtData.value = generateRtData()

function doRtSearch() { /* mock */ }
function resetRtFilters() {
  rtFilter.mac = ''; rtFilter.ip = 'any'; rtFilter.userName = ''
  rtFilter.userGroup = ''; rtFilter.displayName = ''; rtFilter.command = ''
}
function goToRtPage() {
  const p = rtGotoPage.value
  if (p >= 1 && p <= rtPages.value) rtPage.value = p
}

// ── Telnet概况 Tab ─
const ovFilter = reactive({
  mac: '', srcIpType: 'any', dstIpType: 'any',
  srcPort: '80 / 8000-8080', dstIpType2: 'any', dstPort: '80 / 8000-8080',
  protocolLevel: '', srcIpIsp: '', dstIpIsp: '',
  srcIpRegion: '', dstIpRegion: '',
  userGroup: '', userName: '', displayName: '', command: '',
  timeRange: '2026-07-14 16:10:46 - 2026-07-14 16:25:46'
})

interface OvIpRow { ip: string; totalReq: number }

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
    ip: `166.111.9.${181 + i}`,
    totalReq: Math.max(100, 500 - i * 20 + Math.floor(Math.random() * 50)),
  }))
  const dstIps = Array.from({ length: 20 }, (_, i) => ({
    ip: `101.6.4.${191 + i}`,
    totalReq: Math.max(50, 400 - i * 15 + Math.floor(Math.random() * 40)),
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
function resetOvFilters() {
  ovFilter.mac = ''; ovFilter.srcIpType = 'any'; ovFilter.dstIpType = 'any'
  ovFilter.srcPort = '80 / 8000-8080'; ovFilter.dstIpType2 = 'any'; ovFilter.dstPort = '80 / 8000-8080'
  ovFilter.protocolLevel = ''; ovFilter.srcIpIsp = ''; ovFilter.dstIpIsp = ''
  ovFilter.srcIpRegion = ''; ovFilter.dstIpRegion = ''
  ovFilter.userGroup = ''; ovFilter.userName = ''; ovFilter.displayName = ''; ovFilter.command = ''
  ovFilter.timeRange = '2026-07-14 16:10:46 - 2026-07-14 16:25:46'
}

// ── 历史查询 Tab ──
const htPage = ref(1)
const htPageSize = ref(100)
const htGotoPage = ref(1)

const htFilter = reactive({
  mac: '', srcIpType: 'any', dstIpType: 'any',
  srcPort: '80 / 8000-8080', dstIpType2: 'any', dstPort: '80 / 8000-8080',
  protocolLevel: '', srcIpIsp: '', dstIpIsp: '',
  srcIpRegion: '', dstIpRegion: '',
  userGroup: '', userName: '', displayName: '', command: '',
  timeRange: '2026-07-14 16:28:13 - 2026-07-14 16:41:13'
})

interface HtRow {
  opTime: string; mac: string; macVendor: string; userName: string
  srcIp: string; dstIp: string; geoLocation: string; loginName: string
  protocolLevel: string; link: string; command: string
}

const htData = ref<HtRow[]>([])

const htPages = computed(() => Math.max(1, Math.ceil(htData.value.length / htPageSize.value)))
const htPageData = computed(() => htData.value.slice((htPage.value - 1) * htPageSize.value, htPage.value * htPageSize.value))

function generateHtData(): HtRow[] {
  const rows: HtRow[] = []
  const baseTime = new Date('2026-07-14T16:41:13')
  const macVendors = ['NewH3CTechno...', 'NewH3CTechno...', 'NewH3CTechno...']
  const geoLocations = ['北京市', '上海市', '广州市', '深圳市', '杭州市']
  const protocolLevels = ['普通', '普通', '普通', '普通', '普通']
  const links = ['默认', '默认', '默认', '默认', '默认']
  const commands = [
    'ls -la',
    'cat /etc/passwd',
    'whoami',
    'pwd',
    'ps aux',
    'netstat -an',
    'ifconfig',
    'top',
    'df -h',
    'free -m',
  ]

  for (let i = 0; i < 30; i++) {
    const time = new Date(baseTime.getTime() - i * 1000)
    const h = String(time.getHours()).padStart(2, '0')
    const m = String(time.getMinutes()).padStart(2, '0')
    const s = String(time.getSeconds()).padStart(2, '0')
    const port = 44217 + (i % 100)
    rows.push({
      opTime: `2026-07-14 ${h}:${m}:${s}`,
      mac: '54-2b-de-6d-10-ae',
      macVendor: macVendors[i % macVendors.length],
      userName: '—',
      srcIp: `166.111.9.181:${port}`,
      dstIp: '101.6.4.191:23',
      geoLocation: geoLocations[i % geoLocations.length],
      loginName: 'admin',
      protocolLevel: protocolLevels[i % protocolLevels.length],
      link: links[i % links.length],
      command: commands[i % commands.length],
    })
  }
  return rows
}

htData.value = generateHtData()

function doHtSearch() { /* mock */ }
function resetHtFilters() {
  htFilter.mac = ''; htFilter.srcIpType = 'any'; htFilter.dstIpType = 'any'
  htFilter.srcPort = '80 / 8000-8080'; htFilter.dstIpType2 = 'any'; htFilter.dstPort = '80 / 8000-8080'
  htFilter.protocolLevel = ''; htFilter.srcIpIsp = ''; htFilter.dstIpIsp = ''
  htFilter.srcIpRegion = ''; htFilter.dstIpRegion = ''
  htFilter.userGroup = ''; htFilter.userName = ''; htFilter.displayName = ''; htFilter.command = ''
  htFilter.timeRange = '2026-07-14 16:28:13 - 2026-07-14 16:41:13'
}
function goToHtPage() {
  const p = htGotoPage.value
  if (p >= 1 && p <= htPages.value) htPage.value = p
}

// ── 数据包下拉菜单 ─
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

// ─ 会话诊断弹窗 ──
const sessionDiagVisible = ref(false)
const sessionDiagType = ref<'src' | 'dst'>('src')
const sessionDiagIpVersion = ref('v4')

const sessionDiagFilter = reactive({
  srcIp: '', srcIpType: 'any', filterSrc: 'no', srcPort: '80 / 8000-8080',
  dstIp: '', dstIpType: 'any', filterDst: 'no', dstPort: '23',
  mac: '', appProtocol: 'Telnet', srcIpIsp: 'any', dstIpIsp: 'any',
  srcIpRegion: 'any', dstIpRegion: 'any',
  transportProtocol: '', userGroup: '', userName: '', link: '',
  timeRange: '2026-07-20 14:45:00 - 2026-07-20 15:00:50'
})

const sdConnChartOption = ref({
  tooltip: { trigger: 'axis' },
  grid: { left: 60, right: 20, top: 20, bottom: 40 },
  xAxis: {
    type: 'category',
    data: ['14:45', '14:50', '14:55', '15:00'],
    axisLabel: { rotate: 45, fontSize: 9 }
  },
  yAxis: { type: 'value', name: '连接数' },
  series: [{
    type: 'bar',
    data: [5, 8, 12, 3],
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
    data: ['14:45', '14:50', '14:55', '15:00'],
    axisLabel: { rotate: 45, fontSize: 9 }
  },
  yAxis: { type: 'value', name: 'bps' },
  series: [
    {
      name: '上行流量', type: 'bar',
      data: [50000, 80000, 120000, 30000],
      itemStyle: { color: '#f56c6c' },
      barWidth: '40%'
    },
    {
      name: '下行流量', type: 'bar',
      data: [30000, 50000, 80000, 20000],
      itemStyle: { color: '#5b8ff9' },
      barWidth: '40%'
    }
  ]
})

const sdProtoData = ref([{ protocol: 'Telnet', totalReq: 3 }])
const sdSrcIpData = ref([{ ip: '166.111.9.181', totalReq: 3 }])
const sdDstIpData = ref([{ ip: '101.6.4.191', totalReq: 3 }])
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

// ── 报文分析弹窗 ─
const packetVisible = ref(false)
const packetSelectedIdx = ref(0)
const packetData = ref({
  protocol: 'Telnet',
  packets: [
    { time: '0.000000', src: '166.111.9.181', dst: '101.6.4.191', protocol: 'TCP', length: '66', detail: '44217 -> 23 SYN, Seq=0 Win=64636 Len=0 MSS=1360 SACK_PERM=1' },
    { time: '0.000086', src: '101.6.4.191', dst: '166.111.9.181', protocol: 'TCP', length: '66', detail: '23 -> 44217 SYN, ACK, Seq=0 Ack=1 Win=1096 Len=0 MSS=1360 SACK_PERM=1' },
    { time: '0.001483', src: '166.111.9.181', dst: '101.6.4.191', protocol: 'TCP', length: '60', detail: '44217 -> 23 ACK, Seq=1 Ack=1 Win=66280 Len=0' },
    { time: '0.014140', src: '101.6.4.191', dst: '166.111.9.181', protocol: 'TELNET', length: '72', detail: 'Telnet Data ...' },
    { time: '0.076733', src: '166.111.9.181', dst: '101.6.4.191', protocol: 'TCP', length: '60', detail: '44217 -> 23 ACK, Seq=1 Ack=19 Win=66280 Len=0' },
    { time: '0.129968', src: '166.111.9.181', dst: '101.6.4.191', protocol: 'TELNET', length: '79', detail: 'Telnet Data ...' },
  ],
  detailTree: [
    {
      label: 'Frame 1: 66 bytes on wire (528 bits), 66 bytes captured (528 bits)',
      expanded: false,
      children: [
        { label: 'Frame Number: 1', expanded: false, children: [] as any[] },
        { label: 'Frame Length: 66 bytes', expanded: false, children: [] as any[] },
        { label: 'Capture Time: 2026-07-20 15:00:50.000000', expanded: false, children: [] as any[] },
      ],
    },
    {
      label: 'Ethernet II, Src: 54:2b:de:6d:10:ae, Dst: 30:80:9b:8d:90:01',
      expanded: false,
      children: [
        { label: 'Destination: 30:80:9b:8d:90:01', expanded: false, children: [] as any[] },
        { label: 'Source: 54:2b:de:6d:10:ae', expanded: false, children: [] as any[] },
        { label: 'Type: IPv4 (0x0800)', expanded: false, children: [] as any[] },
      ],
    },
    {
      label: 'Internet Protocol Version 4, Src: 166.111.9.181, Dst: 101.6.4.191',
      expanded: false,
      children: [
        { label: 'Version: 4', expanded: false, children: [] as any[] },
        { label: 'Header Length: 20 bytes', expanded: false, children: [] as any[] },
        { label: 'Source Address: 166.111.9.181', expanded: false, children: [] as any[] },
        { label: 'Destination Address: 101.6.4.191', expanded: false, children: [] as any[] },
      ],
    },
    {
      label: 'Transmission Control Protocol, Src Port: 44217, Dst Port: 23',
      expanded: false,
      children: [
        { label: 'Source Port: 44217', expanded: false, children: [] as any[] },
        { label: 'Destination Port: 23 (Telnet)', expanded: false, children: [] as any[] },
        { label: 'Flags: SYN', expanded: false, children: [] as any[] },
      ],
    },
  ],
  hexDump: [
    '0000  30 80 9b 8d  90 01 54 2b  de 6d 10 ae  08 00 45 00    0...T+..m....E.',
    '0010  00 34 9a 3f  40 00 74 06  49 9b e6 6f  09 b5 65 06    .4.?@.t.I..o..e.',
    '0020  04 bf ac b9  00 17 13 54  df 17 00 00  00 00 80 02    .......T........',
    '0030  ff ff b6 46  00 00 02 04  05 50 01 03  03 08 01 01    ...F....P.......',
    '0040  04 02                                                   ..'
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
  { time: '0.000000', src: '166.111.9.181', dst: '101.6.4.191', length: '66', status: '待播放' }
])

const timeGapThreshold = ref(100)
const timelinePage = ref(1)
const timelineData = ref([
  { no: 1, time: '0.000000', src: '166.111.9.181', dst: '101.6.4.191', protocol: 'TCP', info: '44217 -> 23 SYN' }
])
const timelineProtocolTree = ref([
  { label: 'Frame 1: 66 bytes', expanded: false, children: [] as any[] }
])
const timelineHexDump = ref([
  '0000  30 80 9b 8d  90 01 54 2b  de 6d 10 ae  08 00 45 00'
])

function downloadPacketFromPopup() { ElMessage.info('报文下载功能（Mock）') }
function downloadContentFromPopup() { ElMessage.info('内容下载功能（Mock）') }
function startPacketPlayback() { ElMessage.info(`开始播放：网卡 ${playNic.value}，次数 ${playCount.value}，速度 ${playSpeed.value}x（Mock）`) }

function openPacketPopup(row: RtRow | HtRow | null) {
  hidePacketMenu()
  if (!row) return
  packetData.value.protocol = 'Telnet'
  packetSelectedIdx.value = 0
  packetExpandedRow.value = 0
  packetActiveTab.value = 'parse'
  packetVisible.value = true
}

function openPacketPlayPopup(row: RtRow | HtRow | null) {
  hidePacketMenu()
  if (!row) return
  packetData.value.protocol = 'Telnet'
  packetSelectedIdx.value = 0
  packetExpandedRow.value = 0
  packetActiveTab.value = 'playback'
  packetVisible.value = true
}

function downloadPacket(row: RtRow | HtRow | null) {
  hidePacketMenu()
  if (!row) return
  ElMessage.info('报文下载功能（Mock）')
}

function downloadContent(row: RtRow | HtRow | null) {
  hidePacketMenu()
  if (!row) return
  ElMessage.info('内容下载功能（Mock）')
}

function queryTailPacket(row: RtRow | HtRow | null) {
  hidePacketMenu()
  if (!row) return
  ElMessage.info('尾包查询功能（Mock）')
}

function stitchSession(row: RtRow | HtRow | null) {
  hidePacketMenu()
  if (!row) return
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
</style>
