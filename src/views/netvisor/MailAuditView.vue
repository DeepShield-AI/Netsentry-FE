<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav nv-tabs-nav-wrap" role="tablist" aria-label="邮件审计">
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
              <select class="ou-toolbar-select" v-model="rtFilter.ipType">
                <option value="any">任意IP</option>
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
              <input class="ou-toolbar-input tdh-filter-input" v-model="rtFilter.userName" placeholder="" />
            </label>
            <label class="tdh-filter-field" style="flex:1;min-width:200px">
              <span class="ou-toolbar-label">邮件关键字</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="rtFilter.keyword" placeholder="支持发件人、收件人、抄送/暗送、主题以及邮件内容" style="width:100%" />
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
                <th>发送时间 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>MAC</th>
                <th>MAC厂商</th>
                <th>用户名称</th>
                <th>源IP</th>
                <th>目标IP</th>
                <th>应用协议</th>
                <th style="min-width:280px">邮件摘要</th>
                <th style="width:100px">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in rtPageData" :key="idx">
                <td>{{ (rtPage - 1) * rtPageSize + idx + 1 }}</td>
                <td style="white-space:nowrap">{{ row.sendTime }}</td>
                <td style="font-size:12px">{{ row.mac }}</td>
                <td style="font-size:12px">{{ row.macVendor }}</td>
                <td>{{ row.userName }}</td>
                <td><span class="tid-link" @click="openSessionDiagPopup(row.srcIp, 'src')">{{ row.srcIp }}</span></td>
                <td><span class="tid-link" @click="openSessionDiagPopup(row.dstIp, 'dst')">{{ row.dstIp }}</span></td>
                <td style="font-size:12px">{{ row.protocol }}</td>
                <td>
                  <div class="mail-summary">
                    <div class="mail-summary-line"><span class="mail-label">发件人:</span> {{ row.sender }}</div>
                    <div class="mail-summary-line"><span class="mail-label">收件人:</span> {{ row.recipient }}</div>
                    <div class="mail-summary-line"><span class="mail-label">主题:</span> {{ row.subject }}</div>
                  </div>
                </td>
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

      <!-- ==================== 邮件概况 Tab ==================== -->
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
              <span class="ou-toolbar-label">邮件协议</span>
              <select class="ou-toolbar-select" v-model="ovFilter.protocol">
                <option value="">任意</option>
                <option value="SMTP">SMTP</option>
                <option value="IMAP">IMAP</option>
                <option value="POP3">POP3</option>
              </select>
            </label>
            <label class="tdh-filter-field" style="flex:1;min-width:200px">
              <span class="ou-toolbar-label">邮件关键字</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="ovFilter.keyword" placeholder="支持发件人、收件人、抄送/暗送、主题以及附件名称" style="width:100%" />
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

        <!-- 迷你表格网格 -->
        <div class="audit-mini-grid">
          <!-- 源IP -->
          <section class="tid-mini-panel">
            <div class="tid-mini-head">
              <h3 class="tid-mini-title">源IP</h3>
              <button class="tid-expand-btn">⛶</button>
            </div>
            <div class="ou-table-wrap tid-mini-table-wrap">
              <table class="ou-table tid-mini-table">
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
            </div>
            <div class="ou-footer">
              <div class="ou-pager">
                <button class="ou-page-btn">‹</button>
                <button class="ou-page-btn active">1</button>
                <button class="ou-page-btn">›</button>
              </div>
              <span>共 {{ ovSrcIpData.length }} 条</span>
            </div>
          </section>

          <!-- 目标IP -->
          <section class="tid-mini-panel">
            <div class="tid-mini-head">
              <h3 class="tid-mini-title">目标IP</h3>
              <button class="tid-expand-btn">⛶</button>
            </div>
            <div class="ou-table-wrap tid-mini-table-wrap">
              <table class="ou-table tid-mini-table">
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
            </div>
            <div class="ou-footer">
              <div class="ou-pager">
                <button class="ou-page-btn">‹</button>
                <button class="ou-page-btn active">1</button>
                <button class="ou-page-btn">›</button>
              </div>
              <span>共 {{ ovDstIpData.length }} 条</span>
            </div>
          </section>

          <!-- 目标IP -->
          <section class="tid-mini-panel">
            <div class="tid-mini-head">
              <h3 class="tid-mini-title">目标IP</h3>
              <button class="tid-expand-btn"></button>
            </div>
            <div class="ou-table-wrap tid-mini-table-wrap">
              <table class="ou-table tid-mini-table">
                <thead>
                  <tr>
                    <th style="width:40px">序号</th>
                    <th>目标IP</th>
                    <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, idx) in ovDstIpData2" :key="idx">
                    <td>{{ idx + 1 }}</td>
                    <td><span class="tid-link" @click="openSessionDiagPopup(row.ip, 'dst')">{{ row.ip }}</span></td>
                    <td class="ou-num">{{ row.totalReq }}</td>
                  </tr>
                  <tr v-if="ovDstIpData2.length === 0">
                    <td colspan="3" class="ou-empty">无数据</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="ou-footer">
              <div class="ou-pager">
                <button class="ou-page-btn">‹</button>
                <button class="ou-page-btn active">1</button>
                <button class="ou-page-btn">›</button>
              </div>
              <span>共 {{ ovDstIpData2.length }} 条</span>
            </div>
          </section>

          <!-- 目标IP -->
          <section class="tid-mini-panel">
            <div class="tid-mini-head">
              <h3 class="tid-mini-title">目标IP</h3>
              <button class="tid-expand-btn">⛶</button>
            </div>
            <div class="ou-table-wrap tid-mini-table-wrap">
              <table class="ou-table tid-mini-table">
                <thead>
                  <tr>
                    <th style="width:40px">序号</th>
                    <th>目标IP</th>
                    <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, idx) in ovDstIpData3" :key="idx">
                    <td>{{ idx + 1 }}</td>
                    <td><span class="tid-link" @click="openSessionDiagPopup(row.ip, 'dst')">{{ row.ip }}</span></td>
                    <td class="ou-num">{{ row.totalReq }}</td>
                  </tr>
                  <tr v-if="ovDstIpData3.length === 0">
                    <td colspan="3" class="ou-empty">无数据</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="ou-footer">
              <div class="ou-pager">
                <button class="ou-page-btn">‹</button>
                <button class="ou-page-btn active">1</button>
                <button class="ou-page-btn">›</button>
              </div>
              <span>共 {{ ovDstIpData3.length }} 条</span>
            </div>
          </section>
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
          </div>
          <div class="tdh-filter-row">
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">用户组</span>
              <select class="ou-toolbar-select" v-model="htFilter.userGroup">
                <option value="">任意</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">账号备注</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="htFilter.accountNote" placeholder="" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">邮件协议</span>
              <select class="ou-toolbar-select" v-model="htFilter.protocol">
                <option value="">任意</option>
                <option value="SMTP">SMTP</option>
                <option value="IMAP">IMAP</option>
                <option value="POP3">POP3</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">筛选</span>
              <select class="ou-toolbar-select" v-model="htFilter.filter">
                <option value="">任意</option>
              </select>
            </label>
            <label class="tdh-filter-field" style="flex:1;min-width:200px">
              <span class="ou-toolbar-label">邮件关键字</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="htFilter.keyword" placeholder="支持发件人、收件人、抄送/暗送、主题以及附件名称" style="width:100%" />
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
                <th>发送时间 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>MAC</th>
                <th>MAC厂商</th>
                <th>源IP</th>
                <th>目标IP</th>
                <th>应用协议</th>
                <th>协议等级</th>
                <th>邮箱</th>
                <th style="min-width:280px">邮件摘要</th>
                <th>账号备注</th>
                <th style="width:100px">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in htPageData" :key="idx">
                <td>{{ (htPage - 1) * htPageSize + idx + 1 }}</td>
                <td style="white-space:nowrap">{{ row.sendTime }}</td>
                <td style="font-size:12px">{{ row.mac }}</td>
                <td style="font-size:12px">{{ row.macVendor }}</td>
                <td><span class="tid-link" @click="openSessionDiagPopup(row.srcIp, 'src')">{{ row.srcIp }}</span></td>
                <td><span class="tid-link" @click="openSessionDiagPopup(row.dstIp, 'dst')">{{ row.dstIp }}</span></td>
                <td style="font-size:12px">{{ row.protocol }}</td>
                <td style="font-size:12px">{{ row.protocolLevel }}</td>
                <td style="font-size:12px">{{ row.email }}</td>
                <td>
                  <div class="mail-summary">
                    <div class="mail-summary-line"><span class="mail-label">发件人:</span> {{ row.sender }}</div>
                    <div class="mail-summary-line"><span class="mail-label">收件人:</span> {{ row.recipient }}</div>
                    <div class="mail-summary-line"><span class="mail-label">主题:</span> {{ row.subject }}</div>
                  </div>
                </td>
                <td style="font-size:12px">{{ row.accountNote }}</td>
                <td>
                  <span class="link-btn pkt-dropdown-trigger" @click.stop="togglePacketMenu($event, row)">数据包</span>
                </td>
              </tr>
              <tr v-if="htData.length === 0">
                <td colspan="12" class="ou-empty">无数据</td>
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
            <input class="ou-toolbar-input tdh-filter-input" v-model="sessionDiagFilter.dstPort" placeholder="25" />
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
              <option value="SMTP">SMTP</option>
              <option value="IMAP">IMAP</option>
              <option value="POP3">POP3</option>
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
          <v-chart :option="sdConnChartOption" autoresize style="width:100%;height:300px" />
        </div>
        <div style="background:#fff;border:1px solid #ebeef5;border-radius:4px;padding:12px">
          <div style="font-size:13px;font-weight:600;margin-bottom:8px;color:#303133">
            <el-icon style="margin-right:4px"><DataAnalysis /></el-icon> 上行流量 / 下行流量
          </div>
          <v-chart :option="sdTrafficChartOption" autoresize style="width:100%;height:300px" />
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
    <el-dialog v-model="packetVisible" title="报文分析" width="95%" top="3vh" destroy-on-close class="hd-detail-dialog">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;border-bottom:1px solid #e4e7ed;padding-bottom:8px">
        <div style="display:flex;gap:20px">
          <span v-for="t in pktTabs" :key="t.key" :class="pktActiveTab === t.key ? 'pkt-tab-active' : 'pkt-tab'" @click="pktActiveTab = t.key">{{ t.label }}</span>
        </div>
        <div style="display:flex;align-items:center;gap:12px">
          <span style="font-size:13px;color:#606266">应用协议: <b>{{ packetData.protocol }}</b></span>
          <button style="border:none;background:none;cursor:pointer;color:#409eff;font-size:13px"><el-icon><Download /></el-icon> 报文下载</button>
          <button style="border:none;background:none;cursor:pointer;color:#409eff;font-size:13px"><el-icon><Download /></el-icon> 内容下载</button>
        </div>
      </div>

      <!-- 报文解析 -->
      <div v-if="pktActiveTab === 'parse'" class="pkt-tab-content">
        <div style="display:flex;gap:8px;margin-bottom:12px">
          <input class="ou-toolbar-input" v-model="packetFilter" placeholder="报文显示过滤器" style="flex:1" />
          <select class="ou-toolbar-select" v-model="packetTop" style="width:100px">
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
            <tr v-for="(pkt, i) in packetData.packets" :key="i" @click="packetSelectedIdx = i" :class="{ 'pkt-row-selected': packetSelectedIdx === i }">
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
        <div style="margin-top:12px;padding:8px 12px;background:#fff;border:1px solid #ebeef5;border-radius:4px;font-size:12px">
          <div v-for="(item, idx) in packetData.detailTree" :key="idx" style="margin-bottom:4px">
            <span style="color:#409eff;cursor:pointer;user-select:none" @click="item.expanded = !item.expanded">{{ item.expanded ? '▼' : '▶' }}</span>
            <span style="margin-left:4px;color:#303133">{{ item.label }}</span>
            <div v-if="item.expanded" v-for="(sub, sIdx) in item.children" :key="sIdx" style="margin-left:20px;margin-top:2px;color:#606266">
              <span style="color:#409eff;cursor:pointer;user-select:none" @click="sub.expanded = !sub.expanded">{{ sub.expanded ? '▼' : '▶' }}</span>
              <span style="margin-left:4px">{{ sub.label }}</span>
            </div>
          </div>
        </div>
        <div style="margin-top:12px;background:#1e1e1e;color:#d4d4d4;padding:12px;border-radius:4px;font-family:monospace;font-size:12px;overflow-x:auto">
          <div v-for="(line, i) in packetData.hexDump" :key="i">{{ line }}</div>
        </div>
      </div>

      <!-- 报文交互 -->
      <div v-if="pktActiveTab === 'interaction'" class="pkt-tab-content">
        <div class="pkt-conn-grid">
          <div class="pkt-conn-item"><span class="pkt-conn-label">源IP</span><span class="pkt-conn-val">{{ pktConnInfo.srcIp }}</span></div>
          <div class="pkt-conn-item"><span class="pkt-conn-label">源端口</span><span class="pkt-conn-val">{{ pktConnInfo.srcPort }}</span></div>
          <div class="pkt-conn-item"><span class="pkt-conn-label">目的IP</span><span class="pkt-conn-val">{{ pktConnInfo.dstIp }}</span></div>
          <div class="pkt-conn-item"><span class="pkt-conn-label">目的端口</span><span class="pkt-conn-val">{{ pktConnInfo.dstPort }}</span></div>
          <div class="pkt-conn-item"><span class="pkt-conn-label">协议</span><span class="pkt-conn-val">{{ pktConnInfo.protocol }}</span></div>
          <div class="pkt-conn-item"><span class="pkt-conn-label">报文数</span><span class="pkt-conn-val">{{ pktConnInfo.packetCount }}</span></div>
          <div class="pkt-conn-item"><span class="pkt-conn-label">总字节数</span><span class="pkt-conn-val">{{ pktConnInfo.totalBytes }}</span></div>
          <div class="pkt-conn-item"><span class="pkt-conn-label">连接时长</span><span class="pkt-conn-val">{{ pktConnInfo.duration }}</span></div>
        </div>
        <div class="pkt-interaction-split">
          <div class="pkt-hex-block">
            <div class="pkt-hex-title">Source</div>
            <div class="pkt-hex-body"><div v-for="(line, i) in pktSourceHex" :key="i">{{ line }}</div></div>
          </div>
          <div class="pkt-hex-block">
            <div class="pkt-hex-title">Destination</div>
            <div class="pkt-hex-body"><div v-for="(line, i) in pktDestHex" :key="i">{{ line }}</div></div>
          </div>
        </div>
        <div class="ou-footer">
          <div class="ou-pager">
            <button class="ou-page-btn" @click="pktInteractionPage > 1 && pktInteractionPage--">‹</button>
            <button v-for="p in pktInteractionPages" :key="p" class="ou-page-btn" :class="{ active: p === pktInteractionPage }" @click="pktInteractionPage = p">{{ p }}</button>
            <button class="ou-page-btn" @click="pktInteractionPage < pktInteractionPages && pktInteractionPage++">›</button>
          </div>
          <span style="font-size:12px;color:#909399">共 {{ pktInteractionTotal }} 条</span>
        </div>
      </div>

      <!-- 元数据 -->
      <div v-if="pktActiveTab === 'metadata'" class="pkt-tab-content">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
          <span style="font-size:13px;color:#606266">展示方式</span>
          <select class="ou-toolbar-select" v-model="metadataViewMode" style="width:140px">
            <option value="attr">按属性</option>
            <option value="raw">原始</option>
          </select>
        </div>
        <div class="ou-empty" style="padding:60px 0;text-align:center;color:#909399">
          <el-icon :size="48"><InfoFilled /></el-icon>
          <div style="margin-top:12px">暂无元数据</div>
        </div>
      </div>

      <!-- 证书分析 -->
      <div v-if="pktActiveTab === 'cert'" class="pkt-tab-content">
        <div class="ou-empty" style="padding:60px 0;text-align:center;color:#909399">
          <el-icon :size="48"><InfoFilled /></el-icon>
          <div style="margin-top:12px">暂无证书数据</div>
        </div>
      </div>

      <!-- 报文播放 -->
      <div v-if="pktActiveTab === 'play'" class="pkt-tab-content">
        <div class="pkt-playbar">
          <label><span>播放速度</span><select class="ou-toolbar-select" v-model="playSpeed"><option value="1">1x</option><option value="2">2x</option><option value="4">4x</option><option value="8">8x</option></select></label>
          <label><span>循环播放</span><input type="checkbox" v-model="playLoop" /></label>
          <label><span>显示时间戳</span><input type="checkbox" v-model="playShowTime" /></label>
          <button class="ou-search-btn" @click="startPacketPlay"><el-icon><VideoPlay /></el-icon> 开始播放</button>
        </div>
        <table class="ou-table" style="width:100%;border-collapse:collapse;font-size:12px;margin-top:12px">
          <thead>
            <tr style="background:#f5f7fa">
              <th style="padding:6px 8px;text-align:left;border:1px solid #ebeef5">序号</th>
              <th style="padding:6px 8px;text-align:left;border:1px solid #ebeef5">时间</th>
              <th style="padding:6px 8px;text-align:left;border:1px solid #ebeef5">源地址</th>
              <th style="padding:6px 8px;text-align:left;border:1px solid #ebeef5">目标地址</th>
              <th style="padding:6px 8px;text-align:left;border:1px solid #ebeef5">状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in playInfoList" :key="i">
              <td style="padding:6px 8px;border:1px solid #ebeef5">{{ i + 1 }}</td>
              <td style="padding:6px 8px;border:1px solid #ebeef5">{{ row.time }}</td>
              <td style="padding:6px 8px;border:1px solid #ebeef5">{{ row.src }}</td>
              <td style="padding:6px 8px;border:1px solid #ebeef5">{{ row.dst }}</td>
              <td style="padding:6px 8px;border:1px solid #ebeef5">{{ row.status }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 时序图 -->
      <div v-if="pktActiveTab === 'sequence'" class="pkt-tab-content">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
          <span style="font-size:13px;color:#606266">时间间隔阈值</span>
          <input class="ou-toolbar-input" v-model="seqTimeGap" style="width:80px" />
          <span style="font-size:12px;color:#909399">秒</span>
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
            <tr v-for="(row, i) in seqTimelinePageData" :key="i" @click="seqSelectedIdx = i" :class="{ 'pkt-row-selected': seqSelectedIdx === i }">
              <td style="padding:6px 8px;border:1px solid #ebeef5">{{ i + 1 }}</td>
              <td style="padding:6px 8px;border:1px solid #ebeef5">{{ row.time }}</td>
              <td style="padding:6px 8px;border:1px solid #ebeef5">{{ row.src }}</td>
              <td style="padding:6px 8px;border:1px solid #ebeef5">{{ row.dst }}</td>
              <td style="padding:6px 8px;border:1px solid #ebeef5">{{ row.protocol }}</td>
              <td style="padding:6px 8px;border:1px solid #ebeef5;font-size:11px">{{ row.info }}</td>
            </tr>
          </tbody>
        </table>
        <div style="margin-top:12px;padding:8px 12px;background:#fff;border:1px solid #ebeef5;border-radius:4px;font-size:12px">
          <div v-for="(item, idx) in seqProtocolTree" :key="idx" style="margin-bottom:4px">
            <span style="color:#409eff;cursor:pointer;user-select:none" @click="item.expanded = !item.expanded">{{ item.expanded ? '▼' : '▶' }}</span>
            <span style="margin-left:4px;color:#303133">{{ item.label }}</span>
            <div v-if="item.expanded" v-for="(sub, sIdx) in item.children" :key="sIdx" style="margin-left:20px;margin-top:2px;color:#606266">
              <span style="color:#409eff;cursor:pointer;user-select:none" @click="sub.expanded = !sub.expanded">{{ sub.expanded ? '▼' : '▶' }}</span>
              <span style="margin-left:4px">{{ sub.label }}</span>
            </div>
          </div>
        </div>
        <div style="margin-top:12px;background:#1e1e1e;color:#d4d4d4;padding:12px;border-radius:4px;font-family:monospace;font-size:12px;overflow-x:auto">
          <div v-for="(line, i) in seqHexDump" :key="i">{{ line }}</div>
        </div>
        <div class="ou-footer" style="margin-top:12px">
          <div class="ou-pager">
            <button class="ou-page-btn" @click="seqPage > 1 && seqPage--">‹</button>
            <button v-for="p in seqPages" :key="p" class="ou-page-btn" :class="{ active: p === seqPage }" @click="seqPage = p">{{ p }}</button>
            <button class="ou-page-btn" @click="seqPage < seqPages && seqPage++">›</button>
          </div>
          <span style="font-size:12px;color:#909399">共 {{ seqTimelineData.length }} 条</span>
        </div>
      </div>
    </el-dialog>

    <!-- ==================== 数据包下拉菜单（使用 Teleport 渲染到 body 层级） ==================== -->
    <Teleport to="body">
      <div v-if="packetMenuVisible" class="packet-context-menu" :style="{ left: packetMenuX + 'px', top: packetMenuY + 'px' }" @click.stop>
        <div class="packet-menu-item" @click="openPacketPopup(packetMenuRow)"><el-icon><InfoFilled /></el-icon> 报文分析</div>
        <div class="packet-menu-item" @click="openPacketPlayPopup(packetMenuRow)"><el-icon><VideoPlay /></el-icon> 报文播放</div>
        <div class="packet-menu-item" @click="downloadPacket(packetMenuRow)"><el-icon><Download /></el-icon> 报文下载</div>
        <div class="packet-menu-item" @click="downloadContent(packetMenuRow)"><el-icon><Download /></el-icon> 内容下载</div>
        <div class="packet-menu-item" @click="queryTailPacket(packetMenuRow)"><el-icon><InfoFilled /></el-icon> 尾包查询</div>
        <div class="packet-menu-item" @click="stitchSession(packetMenuRow)"><el-icon><InfoFilled /></el-icon> 会话缝合</div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart } from 'echarts/charts'
import {
  TitleComponent, TooltipComponent, LegendComponent, GridComponent
} from 'echarts/components'
import {
  Search, Download, Sort, Filter, Close, DataAnalysis,
  InfoFilled, VideoPlay, Clock
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import './nv-shared.css'

use([CanvasRenderer, BarChart, LineChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent])

// ── Tabs ─
const tabs = [
  { key: 'realtime', label: '实时查询' },
  { key: 'overview', label: '邮件概况' },
  { key: 'history', label: '历史查询' },
]
const activeTab = ref('realtime')

// ── 实时查询 Tab ──
const rtPage = ref(1)
const rtPageSize = ref(100)
const rtGotoPage = ref(1)

const rtFilter = reactive({
  mac: '', ipType: 'any', userGroup: '', userName: '', keyword: ''
})

interface RtRow {
  sendTime: string; mac: string; macVendor: string; userName: string
  srcIp: string; dstIp: string; protocol: string
  sender: string; recipient: string; subject: string
}

const rtData = ref<RtRow[]>([])

const rtPages = computed(() => Math.max(1, Math.ceil(rtData.value.length / rtPageSize.value)))
const rtPageData = computed(() => rtData.value.slice((rtPage.value - 1) * rtPageSize.value, rtPage.value * rtPageSize.value))

function generateRtData(): RtRow[] {
  const rows: RtRow[] = []
  const baseTime = new Date('2026-07-14T13:35:09')
  const macVendors = ['NewH3CTechno...', 'NewH3CTechno...', 'NewH3CTechno...']
  const protocols = ['SMTP', 'IMAP', 'SMTP', 'IMAP', 'SMTP']
  const senders = [
    '李强 <liqiang@mail.tsinghua.edu.cn>',
    '张明 <zhangm@tsinghua.edu.cn>',
    '王芳 <wangfang@tsinghua.edu.cn>',
    '刘伟 <liuwei@tsinghua.edu.cn>',
    '陈静 <chenjing@tsinghua.edu.cn>',
    '杨帆 <yangfan@tsinghua.edu.cn>',
    '赵敏 <zhaomin@tsinghua.edu.cn>',
    '孙磊 <sunlei@tsinghua.edu.cn>',
  ]
  const recipients = [
    'geneli@tsinghua.edu.cn;geneli@tsinghua.edu.cn',
    'zhangm@tsinghua.edu.cn',
    'wangfang@tsinghua.edu.cn',
    'liuwei@tsinghua.edu.cn',
    'chenjing@tsinghua.edu.cn',
    'yangfan@tsinghua.edu.cn',
    'zhaomin@tsinghua.edu.cn',
    'sunlei@tsinghua.edu.cn',
  ]
  const subjects = [
    'Re: 关于...',
    '项目进度汇报',
    '会议通知',
    '文件审核',
    'Re: 项目讨论',
    '关于7月工作计划',
    'Re: 技术讨论',
    'Re: 下周会议安排',
    'Re: 关于...',
    'Re: 项目进度',
    'Re: 技术讨论',
    'Re: 下周会议',
    'Re: 文件审核',
    'Re: 关于...',
  ]

  for (let i = 0; i < 115; i++) {
    const time = new Date(baseTime.getTime() - i * 1000)
    const h = String(time.getHours()).padStart(2, '0')
    const m = String(time.getMinutes()).padStart(2, '0')
    const s = String(time.getSeconds()).padStart(2, '0')
    const port = 17000 + (i % 100)
    const dstPort = 25
    rows.push({
      sendTime: `2026-07-14 ${h}:${m}:${s}`,
      mac: '54-2b-de-6d-10-ae',
      macVendor: macVendors[i % macVendors.length],
      userName: '—',
      srcIp: `101.6.4.71:${port}`,
      dstIp: `106.11.232.132:${dstPort}`,
      protocol: protocols[i % protocols.length],
      sender: senders[i % senders.length],
      recipient: recipients[i % recipients.length],
      subject: subjects[i % subjects.length],
    })
  }
  return rows
}

rtData.value = generateRtData()

function doRtSearch() { /* mock */ }
function resetRtFilters() {
  rtFilter.mac = ''; rtFilter.ipType = 'any'; rtFilter.userGroup = ''
  rtFilter.userName = ''; rtFilter.keyword = ''
}
function goToRtPage() {
  const p = rtGotoPage.value
  if (p >= 1 && p <= rtPages.value) rtPage.value = p
}

// ── 邮件概况 Tab ──
const ovFilter = reactive({
  mac: '',
  srcIpType: 'any',
  dstIpType: 'any',
  srcPort: '80 / 8000-8080',
  dstIpType2: 'any',
  dstPort: '80 / 8000-8080',
  protocol: '',
  keyword: '',
  timeRange: '2026-07-14 13:54:00 - 2026-07-14 14:09:00'
})

interface OvIpRow {
  ip: string
  totalReq: number
}

const ovSrcIpData = ref<OvIpRow[]>([])
const ovDstIpData = ref<OvIpRow[]>([])
const ovDstIpData2 = ref<OvIpRow[]>([])
const ovDstIpData3 = ref<OvIpRow[]>([])

function generateOvData() {
  ovSrcIpData.value = [
    { ip: '101.6.4.71', totalReq: 3280 },
    { ip: '101.6.4.72', totalReq: 2150 },
    { ip: '101.6.4.73', totalReq: 1890 },
    { ip: '101.6.4.74', totalReq: 1560 },
    { ip: '101.6.4.75', totalReq: 1230 },
  ]
  ovDstIpData.value = [
    { ip: '106.11.232.132', totalReq: 4520 },
    { ip: '106.11.232.133', totalReq: 3180 },
    { ip: '106.11.232.134', totalReq: 2450 },
    { ip: '106.11.232.135', totalReq: 1890 },
    { ip: '106.11.232.136', totalReq: 1320 },
  ]
  ovDstIpData2.value = []
  ovDstIpData3.value = []
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
  ovFilter.protocol = ''
  ovFilter.keyword = ''
  ovFilter.timeRange = '2026-07-14 13:54:00 - 2026-07-14 14:09:00'
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
  userGroup: '',
  accountNote: '',
  protocol: '',
  filter: '',
  keyword: '',
  timeRange: '2026-07-14 14:14:16 - 2026-07-14 14:29:16'
})

interface HtRow {
  sendTime: string; mac: string; macVendor: string
  srcIp: string; dstIp: string; protocol: string; protocolLevel: string
  email: string; sender: string; recipient: string; subject: string
  accountNote: string
}

const htData = ref<HtRow[]>([])

const htPages = computed(() => Math.max(1, Math.ceil(htData.value.length / htPageSize.value)))
const htPageData = computed(() => htData.value.slice((htPage.value - 1) * htPageSize.value, htPage.value * htPageSize.value))

function generateHtData(): HtRow[] {
  const rows: HtRow[] = []
  const baseTime = new Date('2026-07-14T14:29:09')
  const macVendors = ['NewH3CTechno...', 'NewH3CTechno...', 'NewH3CTechno...']
  const protocols = ['SMTP', 'IMAP', 'SMTP', 'IMAP', 'SMTP']
  const protocolLevels = ['普通', '普通', '普通', '普通', '普通']
  const emails = [
    'liqiang@mail.tsinghua.edu.cn',
    'zhangm@tsinghua.edu.cn',
    'wangfang@tsinghua.edu.cn',
    'liuwei@tsinghua.edu.cn',
    'chenjing@tsinghua.edu.cn',
  ]
  const senders = [
    '李强 <liqiang@mail.tsinghua.edu.cn>',
    '张明 <zhangm@tsinghua.edu.cn>',
    '王芳 <wangfang@tsinghua.edu.cn>',
    '刘伟 <liuwei@tsinghua.edu.cn>',
    '陈静 <chenjing@tsinghua.edu.cn>',
  ]
  const recipients = [
    'geneli@tsinghua.edu.cn;geneli@tsinghua.edu.cn',
    'zhangm@tsinghua.edu.cn',
    'wangfang@tsinghua.edu.cn',
    'liuwei@tsinghua.edu.cn',
    'chenjing@tsinghua.edu.cn',
  ]
  const subjects = [
    'Re: 关于...',
    '项目进度汇报',
    '会议通知',
    '文件审核',
    'Re: 项目讨论',
  ]

  for (let i = 0; i < 0; i++) {
    const time = new Date(baseTime.getTime() - i * 1000)
    const h = String(time.getHours()).padStart(2, '0')
    const m = String(time.getMinutes()).padStart(2, '0')
    const s = String(time.getSeconds()).padStart(2, '0')
    const port = 17000 + (i % 100)
    const dstPort = 25
    rows.push({
      sendTime: `2026-07-14 ${h}:${m}:${s}`,
      mac: '54-2b-de-6d-10-ae',
      macVendor: macVendors[i % macVendors.length],
      srcIp: `101.6.4.71:${port}`,
      dstIp: `106.11.232.132:${dstPort}`,
      protocol: protocols[i % protocols.length],
      protocolLevel: protocolLevels[i % protocolLevels.length],
      email: emails[i % emails.length],
      sender: senders[i % senders.length],
      recipient: recipients[i % recipients.length],
      subject: subjects[i % subjects.length],
      accountNote: '—',
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
  htFilter.userGroup = ''
  htFilter.accountNote = ''
  htFilter.protocol = ''
  htFilter.filter = ''
  htFilter.keyword = ''
  htFilter.timeRange = '2026-07-14 14:14:16 - 2026-07-14 14:29:16'
}
function goToHtPage() {
  const p = htGotoPage.value
  if (p >= 1 && p <= htPages.value) htPage.value = p
}

// ── 会话诊断弹窗 ──
const sessionDiagVisible = ref(false)
const sessionDiagType = ref<'src' | 'dst'>('src')
const sessionDiagIpVersion = ref('v4')

const sessionDiagFilter = reactive({
  srcIp: '', srcIpType: 'any', filterSrc: 'no', srcPort: '80 / 8000-8080',
  dstIp: '', dstIpType: 'any', filterDst: 'no', dstPort: '25',
  mac: '', appProtocol: 'SMTP', srcIpIsp: 'any', dstIpIsp: 'any',
  srcIpRegion: 'any', dstIpRegion: 'any',
  transportProtocol: '', userGroup: '', userName: '', link: '',
  timeRange: '2026-07-14 13:20:00 - 2026-07-14 13:35:18'
})

// 会话诊断 - 连接数柱状图
const sdConnChartOption = ref({
  tooltip: { trigger: 'axis' },
  grid: { left: 60, right: 20, top: 20, bottom: 40 },
  xAxis: {
    type: 'category',
    data: ['13:20', '13:22', '13:24', '13:26', '13:28', '13:30', '13:32', '13:34'],
    axisLabel: { rotate: 45, fontSize: 9 }
  },
  yAxis: { type: 'value', name: '连接数' },
  series: [{
    type: 'bar',
    data: Array(8).fill(0).map(() => Math.floor(Math.random() * 50 + 10)),
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
    data: ['13:20', '13:22', '13:24', '13:26', '13:28', '13:30', '13:32', '13:34'],
    axisLabel: { rotate: 45, fontSize: 9 }
  },
  yAxis: { type: 'value', name: 'bps' },
  series: [
    {
      name: '上行流量', type: 'bar',
      data: Array(8).fill(0).map(() => Math.floor(Math.random() * 200000 + 50000)),
      itemStyle: { color: '#f56c6c' },
      barWidth: '40%'
    },
    {
      name: '下行流量', type: 'bar',
      data: Array(8).fill(0).map(() => Math.floor(Math.random() * 150000 + 30000)),
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

function openSessionDiagPopup(value: string, type: 'src' | 'dst') {
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
    setTimeout(() => {
      sdProtoData.value = [{ protocol: 'SMTP', totalReq: 1200, upload: '2.51 M', download: '3.40 M' }]
      sdDstIpData.value = [{ ip: '106.11.232.132', totalReq: 1200, upload: '2.51 M', download: '3.40 M' }]
      sdDomainData.value = [
        { domain: 'mail.tsinghua.edu.cn', totalReq: 800, upload: '1.5 M', download: '2.0 M' },
        { domain: 'smtp.163.com', totalReq: 400, upload: '1.0 M', download: '1.4 M' },
      ]
    }, 500)
  } else if (type === 'dst') {
    sessionDiagFilter.dstIp = value
    sessionDiagFilter.srcIp = ''
    setTimeout(() => {
      sdProtoData.value = [{ protocol: 'SMTP', totalReq: 1200, upload: '2.51 M', download: '3.40 M' }]
      sdSrcIpData.value = [{ ip: '101.6.4.71', totalReq: 1200, upload: '2.51 M', download: '3.40 M' }]
      sdDomainData.value = [{ domain: 'mail.tsinghua.edu.cn', totalReq: 1200, upload: '2.51 M', download: '3.40 M' }]
    }, 500)
  }
}

// ── 报文分析弹窗 ─
const packetVisible = ref(false)
const pktActiveTab = ref('parse')
const pktTabs = [
  { key: 'parse', label: '报文解析' },
  { key: 'interaction', label: '报文交互' },
  { key: 'metadata', label: '元数据' },
  { key: 'cert', label: '证书分析' },
  { key: 'play', label: '报文播放' },
  { key: 'sequence', label: '时序图' },
]

const packetFilter = ref('')
const packetTop = ref('100')
const packetSelectedIdx = ref(0)

interface TreeNode {
  label: string
  expanded: boolean
  children: TreeNode[]
}

const packetData = ref({
  protocol: 'SMTP',
  packets: [
    { time: '0.000000', src: '101.6.4.71', dst: '106.11.232.132', protocol: 'TCP', length: '74', detail: '17049 --> 25 [SYN] Seq=0 Win=29200 Len=0 MSS=1460 SACK_PERM=1 WS=128' },
    { time: '0.037607', src: '106.11.232.132', dst: '101.6.4.71', protocol: 'TCP', length: '66', detail: '25 --> 17049 [SYN, ACK] Seq=0 Ack=1 Win=65535 Len=0 MSS=1440 SACK_PERM=1 WS=4' },
    { time: '0.037963', src: '101.6.4.71', dst: '106.11.232.132', protocol: 'TCP', length: '60', detail: '17049 --> 25 [ACK] Seq=1 Ack=1 Win=29312 Len=0' },
    { time: '0.085523', src: '106.11.232.132', dst: '101.6.4.71', protocol: 'SMTP', length: '96', detail: 'S: 220 mail.aliyun-inc.com MX AliMail Server' },
    { time: '0.086708', src: '101.6.4.71', dst: '106.11.232.132', protocol: 'TCP', length: '60', detail: '17049 --> 25 [ACK] Seq=1 Ack=43 Win=29312 Len=0' },
    { time: '0.086858', src: '101.6.4.71', dst: '106.11.232.132', protocol: 'SMTP', length: '76', detail: 'C: EHLO tsinghua.edu.cn' },
  ],
  detailTree: [
    {
      label: 'Frame 1: 74 bytes on wire (592 bits), 74 bytes captured (592 bits)',
      expanded: false,
      children: [] as TreeNode[]
    },
    {
      label: 'Ethernet II, Src: 30:80:9b:8d:90:01 (30:80:9b:8d:90:01), Dst: 54:2b:de:6d:10:ae (54:2b:de:6d:10:ae)',
      expanded: false,
      children: [] as TreeNode[]
    },
    {
      label: 'Internet Protocol Version 4, Src: 101.6.4.71, Dst: 106.11.232.132',
      expanded: false,
      children: [] as TreeNode[]
    },
    {
      label: 'Transmission Control Protocol, Src Port: 17049, Dst Port: 25, Seq: 0, Len: 0',
      expanded: false,
      children: [] as TreeNode[]
    }
  ] as TreeNode[],
  hexDump: [
    '0000  54 2b de 6d  10 ae 30 80  9b 8d 90 01  08 00 45 00    T+.m..0.  ......E.',
    '0010  00 3c ea 70  40 00 3d 06  97 6e 65 06  04 47 6a 06    .<.p@.=.  .ne..Gj.',
    '0020  e8 84 42 99  00 19 a6 fd  eb 6a 00 00  00 00 a0 02    ..B.....  .j......',
    '0030  72 10 47 fd  00 00 02 04  05 b4 04 02  01 01 01 01    r.G.....  ........',
    '0040  01 01 01 01  01 01 01 03  03 07                     ........  ..'
  ]
})

// 报文交互
const pktConnInfo = reactive({
  srcIp: '101.6.4.71',
  srcPort: '17049',
  dstIp: '106.11.232.132',
  dstPort: '25',
  protocol: 'SMTP',
  packetCount: 6,
  totalBytes: '432 bytes',
  duration: '0.086858s'
})
const pktSourceHex = ref<string[]>([
  '0000  54 2b de 6d  10 ae 30 80  9b 8d 90 01  08 00 45 00    T+.m..0.  ......E.',
  '0010  00 3c ea 70  40 00 3d 06  97 6e 65 06  04 47 6a 06    .<.p@.=.  .ne..Gj.',
])
const pktDestHex = ref<string[]>([
  '0000  30 80 9b 8d  90 01 54 2b  de 6d 10 ae  08 00 45 00    0.....T+  .m....E.',
  '0010  00 42 00 00  40 00 3a 06  e3 3c 6a 06  e8 84 65 06    .B..@.:.  .<j...e.',
])
const pktInteractionPage = ref(1)
const pktInteractionPageSize = ref(10)
const pktInteractionTotal = ref(6)
const pktInteractionPages = computed(() => Math.max(1, Math.ceil(pktInteractionTotal.value / pktInteractionPageSize.value)))

// 元数据
const metadataViewMode = ref('attr')

// 报文播放
const playSpeed = ref('1')
const playLoop = ref(false)
const playShowTime = ref(true)
interface PlayInfoRow {
  time: string; src: string; dst: string; status: string
}
const playInfoList = ref<PlayInfoRow[]>([
  { time: '0.000000', src: '101.6.4.71', dst: '106.11.232.132', status: '待播放' },
  { time: '0.037607', src: '106.11.232.132', dst: '101.6.4.71', status: '待播放' },
])
function startPacketPlay() {
  ElMessage.success('开始报文播放（Mock）')
  playInfoList.value.forEach(r => { r.status = '已播放' })
}

// 时序图
const seqTimeGap = ref('1')
const seqPage = ref(1)
const seqPageSize = ref(10)
const seqSelectedIdx = ref(0)
interface SeqTimelineRow {
  time: string; src: string; dst: string; protocol: string; info: string
}
const seqTimelineData = ref<SeqTimelineRow[]>([
  { time: '0.000000', src: '101.6.4.71', dst: '106.11.232.132', protocol: 'TCP', info: 'SYN' },
  { time: '0.037607', src: '106.11.232.132', dst: '101.6.4.71', protocol: 'TCP', info: 'SYN, ACK' },
  { time: '0.037963', src: '101.6.4.71', dst: '106.11.232.132', protocol: 'TCP', info: 'ACK' },
  { time: '0.085523', src: '106.11.232.132', dst: '101.6.4.71', protocol: 'SMTP', info: '220 mail.aliyun-inc.com' },
])
const seqPages = computed(() => Math.max(1, Math.ceil(seqTimelineData.value.length / seqPageSize.value)))
const seqTimelinePageData = computed(() => seqTimelineData.value.slice((seqPage.value - 1) * seqPageSize.value, seqPage.value * seqPageSize.value))
const seqProtocolTree = ref<TreeNode[]>([
  { label: 'Frame 1: 74 bytes on wire', expanded: false, children: [] },
  { label: 'Ethernet II', expanded: false, children: [] },
  { label: 'Internet Protocol Version 4', expanded: false, children: [] },
  { label: 'Transmission Control Protocol', expanded: false, children: [] },
])
const seqHexDump = ref<string[]>([
  '0000  54 2b de 6d  10 ae 30 80  9b 8d 90 01  08 00 45 00    T+.m..0.  ......E.',
  '0010  00 3c ea 70  40 00 3d 06  97 6e 65 06  04 47 6a 06    .<.p@.=.  .ne..Gj.',
])

// ── 数据包下拉菜单 ──
const packetMenuVisible = ref(false)
const packetMenuRow = ref<RtRow | null>(null)
const packetMenuX = ref(0)
const packetMenuY = ref(0)

function togglePacketMenu(event: MouseEvent, row: RtRow) {
  if (packetMenuVisible.value && packetMenuRow.value === row) {
    hidePacketMenu()
    return
  }

  packetMenuRow.value = row
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

if (typeof window !== 'undefined') {
  window.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.classList.contains('pkt-dropdown-trigger') && !target.closest('.packet-context-menu')) {
      hidePacketMenu()
    }
  })
}

function openPacketPopup(row: RtRow) {
  hidePacketMenu()
  packetData.value.protocol = row.protocol
  packetSelectedIdx.value = 0
  packetVisible.value = true
}

function openPacketPlayPopup(row: RtRow) {
  hidePacketMenu()
  packetData.value.protocol = row.protocol
  pktActiveTab.value = 'play'
  packetVisible.value = true
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

/* 邮件摘要样式 */
.mail-summary {
  font-size: 12px;
  line-height: 1.5;
}
.mail-summary-line {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 280px;
}
.mail-label {
  color: #909399;
  font-size: 11px;
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

/* 概况 Tab 迷你表格网格 */
.audit-mini-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  padding: 12px;
  background: #f5f7fa;
  flex: 1;
  min-height: 0;
}

/* 报文交互 */
.pkt-conn-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}
.pkt-conn-item {
  background: #f5f7fa;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.pkt-conn-label {
  font-size: 12px;
  color: #909399;
}
.pkt-conn-val {
  font-size: 13px;
  color: #303133;
  font-weight: 500;
}
.pkt-interaction-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}
.pkt-hex-block {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}
.pkt-hex-title {
  background: #f5f7fa;
  padding: 6px 12px;
  font-size: 13px;
  color: #303133;
  border-bottom: 1px solid #ebeef5;
}
.pkt-hex-body {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 12px;
  font-family: monospace;
  font-size: 12px;
  overflow-x: auto;
  min-height: 120px;
}

/* 报文播放 */
.pkt-playbar {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 12px;
}
.pkt-playbar label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #606266;
}
.pkt-playbar label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}
</style>
