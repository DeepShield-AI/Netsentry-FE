<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav nv-tabs-nav-wrap" role="tablist" aria-label="数据库审计">
        <button v-for="t in tabs" :key="t.key" type="button" class="nv-tab" :class="{ active: activeTab === t.key }" @click="activeTab = t.key">{{ t.label }}</button>
      </div>
    </div>
    <div class="nv-tabs-body">

      <!-- ==================== 实时会话 Tab ==================== -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'realtime-sessions' }">
        <!-- 筛选区域 -->
        <div class="tdh-filters">
          <div class="tdh-filter-row">
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">会话ID</span>
              <select class="ou-toolbar-select" v-model="rtFilter.sessionId">
                <option value="10s">10秒</option>
                <option value="30s">30秒</option>
                <option value="60s">60秒</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">源IP</span>
              <select class="ou-toolbar-select" v-model="rtFilter.srcIpType">
                <option value="any">任意IP</option>
                <option value="single">单个IP</option>
                <option value="range">IP范围</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">目标IP</span>
              <select class="ou-toolbar-select" v-model="rtFilter.dstIpType">
                <option value="any">任意IP</option>
                <option value="single">单个IP</option>
                <option value="range">IP范围</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">数据库</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="rtFilter.database" placeholder="" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">用户名称</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="rtFilter.userName" placeholder="" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">用户组</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="rtFilter.userGroup" placeholder="" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">SQL</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="rtFilter.sql" placeholder="" />
            </label>
          </div>
          <div class="tdh-filter-row">
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">MAC</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="rtFilter.mac" placeholder="" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">用户名</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="rtFilter.loginName" placeholder="" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">用户IP</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="rtFilter.userIp" placeholder="" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">链路</span>
              <select class="ou-toolbar-select" v-model="rtFilter.link">
                <option value="">任意</option>
                <option value="默认">默认</option>
              </select>
            </label>
            <button class="ou-search-btn" @click="doRtSearch">
              <el-icon><Search /></el-icon>
            </button>
            <button class="secondary td-reset-btn" @click="resetRtFilters">重置</button>
            <div class="tdh-filter-right">
              <button class="td-icon-btn" title="列设置" @click="ElMessage.info('列设置（Mock）')">
                <el-icon><Setting /></el-icon>
              </button>
            </div>
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
                <th>用户名称</th>
                <th>源IP</th>
                <th>目标IP</th>
                <th>目标地址</th>
                <th>用户名</th>
                <th>登录状态</th>
                <th>请求次数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>响应时间 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th style="min-width:260px">SQL语句</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in rtPageData" :key="idx">
                <td>{{ (rtPage - 1) * rtPageSize + idx + 1 }}</td>
                <td style="white-space:nowrap">{{ row.opTime }}</td>
                <td style="font-size:12px">{{ row.mac }}</td>
                <td>{{ row.userName }}</td>
                <td><span class="tid-link" @click="openSessionDiagPopup(row.srcIp, 'src')">{{ row.srcIp }}</span></td>
                <td><span class="tid-link" @click="openSessionDiagPopup(row.dstIp, 'dst')">{{ row.dstIp }}</span></td>
                <td style="font-size:12px">
                  <span class="db-location">
                    <el-icon style="color:#409eff;margin-right:2px"><Location /></el-icon>
                    {{ row.dstLocation }}
                  </span>
                </td>
                <td style="font-size:12px">{{ row.loginName }}</td>
                <td>
                  <span :class="row.loginStatus === '成功' ? 'db-status-success' : 'db-status-fail'">
                    <el-icon style="margin-right:2px"><component :is="row.loginStatus === '成功' ? CircleCheck : CircleClose" /></el-icon>
                    {{ row.loginStatus }}
                  </span>
                </td>
                <td class="ou-num">{{ row.reqCount }}</td>
                <td class="ou-num">{{ row.respTime }}</td>
                <td style="font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:300px" :title="row.sql">{{ row.sql }}</td>
              </tr>
              <tr v-if="rtData.length === 0">
                <td colspan="12" class="ou-empty">无数据</td>
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

      <!-- ==================== 实时概况 Tab ==================== -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'realtime-overview' }">
        <!-- 上半部分：KPI + 饼图 -->
        <div class="db-ov-top-grid">
          <!-- 左侧 KPI 卡片 -->
          <div class="db-ov-kpi-grid">
            <div class="db-ov-kpi-card">
              <div class="db-ov-kpi-value">{{ ovKpi.totalSessions }}</div>
              <div class="db-ov-kpi-label">累计会话数</div>
            </div>
            <div class="db-ov-kpi-card">
              <div class="db-ov-kpi-value">{{ ovKpi.totalRequests }}</div>
              <div class="db-ov-kpi-label">累计请求数</div>
            </div>
            <div class="db-ov-kpi-card">
              <div class="db-ov-kpi-value">{{ ovKpi.totalQueries }}</div>
              <div class="db-ov-kpi-label">累计查询数</div>
            </div>
            <div class="db-ov-kpi-card">
              <div class="db-ov-kpi-value" style="color:#f56c6c">{{ ovKpi.totalFails }}</div>
              <div class="db-ov-kpi-label">累计失败数</div>
            </div>
            <div class="db-ov-kpi-card">
              <div class="db-ov-kpi-value">{{ ovKpi.totalSessionCount }}</div>
              <div class="db-ov-kpi-label">累计会话数</div>
            </div>
            <div class="db-ov-kpi-card">
              <div class="db-ov-kpi-value">{{ ovKpi.totalQueryCount }}</div>
              <div class="db-ov-kpi-label">累计查询数</div>
            </div>
            <div class="db-ov-kpi-card">
              <div class="db-ov-kpi-value">{{ ovKpi.totalDeletes }}</div>
              <div class="db-ov-kpi-label">累计删除数</div>
            </div>
            <div class="db-ov-kpi-card">
              <div class="db-ov-kpi-value">{{ ovKpi.totalInserts }}</div>
              <div class="db-ov-kpi-label">累计插入数</div>
            </div>
            <div class="db-ov-kpi-card">
              <div class="db-ov-kpi-value">{{ ovKpi.totalLoadFiles }}</div>
              <div class="db-ov-kpi-label">累计加载文件数</div>
            </div>
            <div class="db-ov-kpi-card">
              <div class="db-ov-kpi-value">{{ ovKpi.totalCreates }}</div>
              <div class="db-ov-kpi-label">累计创建数</div>
            </div>
          </div>

          <!-- 右侧饼图 -->
          <div class="db-ov-pie-grid">
            <div class="db-ov-pie-panel">
              <div class="db-ov-pie-title">SQL状态</div>
              <v-chart :option="sqlStatusPieOption" autoresize style="width:100%;height:220px" />
            </div>
            <div class="db-ov-pie-panel">
              <div class="db-ov-pie-title">SQL命令</div>
              <v-chart :option="sqlCmdPieOption" autoresize style="width:100%;height:220px" />
            </div>
          </div>
        </div>

        <!-- 下半部分：四个折线图 -->
        <div class="db-ov-line-grid">
          <div class="db-ov-line-panel">
            <div class="db-ov-line-title">SQL会话数趋势图</div>
            <v-chart :option="sqlSessionTrendOption" autoresize style="width:100%;height:220px" />
            <div class="db-ov-line-stats">
              <span>最大值: 19.61</span>
              <span>最小值: 20.00</span>
              <span>平均值: 18.00</span>
            </div>
          </div>
          <div class="db-ov-line-panel">
            <div class="db-ov-line-title">SQL趋势图</div>
            <v-chart :option="sqlTrendOption" autoresize style="width:100%;height:220px" />
            <div class="db-ov-line-stats">
              <span>最大值: 19.61</span>
              <span>最小值: 20.00</span>
              <span>平均值: 18.00</span>
            </div>
          </div>
          <div class="db-ov-line-panel">
            <div class="db-ov-line-title">SQL状态趋势图</div>
            <v-chart :option="sqlStatusTrendOption" autoresize style="width:100%;height:220px" />
            <div class="db-ov-line-stats">
              <span>最大值: 19.61</span>
              <span>最小值: 20.00</span>
              <span>平均值: 18.00</span>
            </div>
          </div>
          <div class="db-ov-line-panel">
            <div class="db-ov-line-title">SQL命令趋势图</div>
            <v-chart :option="sqlCmdTrendOption" autoresize style="width:100%;height:220px" />
            <div class="db-ov-line-stats">
              <span>最大值: 19.61</span>
              <span>最小值: 20.00</span>
              <span>平均值: 18.00</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ==================== 历史会话 Tab ==================== -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'history-sessions' }">
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
                <option value="single">单个IP</option>
                <option value="range">IP范围</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">用户IP</span>
              <select class="ou-toolbar-select" v-model="htFilter.userIpType">
                <option value="any">任意IP</option>
                <option value="single">单个IP</option>
                <option value="range">IP范围</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">源端口</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="htFilter.srcPort" placeholder="80 / 8000-8080" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">目标IP</span>
              <select class="ou-toolbar-select" v-model="htFilter.dstIpType">
                <option value="any">任意IP</option>
                <option value="single">单个IP</option>
                <option value="range">IP范围</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">目标端口</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="htFilter.dstPort" placeholder="80 / 8000-8080" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">用户名</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="htFilter.loginName" placeholder="" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">用户组</span>
              <select class="ou-toolbar-select" v-model="htFilter.userGroup">
                <option value="">任意</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">用户名称</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="htFilter.userName" placeholder="" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">SQL命令</span>
              <select class="ou-toolbar-select" v-model="htFilter.sqlCmd">
                <option value="">任意</option>
                <option value="SELECT">SELECT</option>
                <option value="INSERT">INSERT</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
                <option value="SET">SET</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">SQL</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="htFilter.sql" placeholder="" />
            </label>
          </div>
          <div class="tdh-filter-row">
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">链路</span>
              <select class="ou-toolbar-select" v-model="htFilter.link">
                <option value="">任意</option>
                <option value="默认">默认</option>
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

        <div class="ou-table-wrap" style="flex:1;min-height:0">
          <table class="ou-table audit-table">
            <thead>
              <tr>
                <th style="width:40px">序号</th>
                <th>请求时间 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>MAC</th>
                <th>MAC厂商</th>
                <th>用户名称</th>
                <th>源IP</th>
                <th>目标IP</th>
                <th>目标地理位置</th>
                <th>用户名</th>
                <th>时延</th>
                <th>登录状态</th>
                <th style="min-width:260px">当前SQL</th>
                <th>请求状态</th>
                <th>链路</th>
                <th>状态码</th>
                <th style="width:80px">操作</th>
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
                <td style="font-size:12px">
                  <span class="db-location">
                    <el-icon style="color:#409eff;margin-right:2px"><Location /></el-icon>
                    {{ row.dstLocation }}
                  </span>
                </td>
                <td style="font-size:12px">{{ row.loginName }}</td>
                <td class="ou-num">{{ row.latency }}</td>
                <td>
                  <span :class="row.loginStatus === '成功' ? 'db-status-success' : 'db-status-fail'">
                    <el-icon style="margin-right:2px"><component :is="row.loginStatus === '成功' ? CircleCheck : CircleClose" /></el-icon>
                    {{ row.loginStatus }}
                  </span>
                </td>
                <td style="font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:300px" :title="row.sql">{{ row.sql }}</td>
                <td>
                  <span :class="row.reqStatus === '成功' ? 'db-status-success' : 'db-status-fail'">
                    <el-icon style="margin-right:2px"><component :is="row.reqStatus === '成功' ? CircleCheck : CircleClose" /></el-icon>
                    {{ row.reqStatus }}
                  </span>
                </td>
                <td style="font-size:12px">{{ row.link }}</td>
                <td style="font-size:12px">{{ row.statusCode }}</td>
                <td>
                  <span class="link-btn" @click.stop="openPacketPopup(row)"><el-icon><InfoFilled /></el-icon> 数据包</span>
                </td>
              </tr>
              <tr v-if="htData.length === 0">
                <td colspan="16" class="ou-empty">无数据</td>
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

      <!-- ==================== 历史概况 Tab ==================== -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'history-overview' }">
        <div class="tdh-filters">
          <div class="tdh-filter-row">
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">MAC</span>
              <select class="ou-toolbar-select" v-model="hovFilter.mac">
                <option value="">任意</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">源IP</span>
              <select class="ou-toolbar-select" v-model="hovFilter.srcIpType">
                <option value="any">任意IP</option>
                <option value="single">单个IP</option>
                <option value="range">IP范围</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">源端口</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="hovFilter.srcPort" placeholder="80 / 8000-8080" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">目标IP</span>
              <select class="ou-toolbar-select" v-model="hovFilter.dstIpType">
                <option value="any">任意IP</option>
                <option value="single">单个IP</option>
                <option value="range">IP范围</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">目标端口</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="hovFilter.dstPort" placeholder="80 / 8000-8080" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">用户名</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="hovFilter.userName" placeholder="" />
            </label>
          </div>
          <div class="tdh-filter-row">
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">用户组</span>
              <select class="ou-toolbar-select" v-model="hovFilter.userGroup">
                <option value="">任意</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">用户名称</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="hovFilter.displayName" placeholder="" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">SQL命令</span>
              <select class="ou-toolbar-select" v-model="hovFilter.sqlCmd">
                <option value="">任意</option>
                <option value="SELECT">SELECT</option>
                <option value="INSERT">INSERT</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
                <option value="SET">SET</option>
              </select>
            </label>
            <label class="tdh-filter-field tdh-filter-time">
              <span class="ou-toolbar-label">时间范围</span>
              <input class="ou-toolbar-input tdh-time-range" v-model="hovFilter.timeRange" />
            </label>
            <button class="ou-search-btn" @click="doHovSearch">
              <el-icon><Search /></el-icon>
            </button>
            <button class="secondary td-reset-btn" @click="resetHovFilters">重置</button>
          </div>
        </div>

        <!-- 三列表格区域 -->
        <div class="db-hov-table-grid">
          <!-- 源IP 表格 -->
          <div class="db-hov-table-panel">
            <table class="ou-table audit-table" style="margin:0">
              <thead>
                <tr>
                  <th style="width:40px">序号</th>
                  <th>源IP <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th>总数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th>查询 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th>更新 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th>删除 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th>插入 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th>创建 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th>加载 <el-icon class="sort-icon"><Sort /></el-icon></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in hovSrcIpData" :key="idx">
                  <td>{{ idx + 1 }}</td>
                  <td><span class="tid-link" @click="openHovDetailPopup(row.ip, 'src')">{{ row.ip }}</span></td>
                  <td class="ou-num">{{ row.total }}</td>
                  <td class="ou-num" style="color:#409eff">{{ row.query }}</td>
                  <td class="ou-num" style="color:#67c23a">{{ row.update }}</td>
                  <td class="ou-num" style="color:#f56c6c">{{ row.delete }}</td>
                  <td class="ou-num" style="color:#e6a23c">{{ row.insert }}</td>
                  <td class="ou-num">{{ row.create }}</td>
                  <td class="ou-num">{{ row.load }}</td>
                </tr>
                <tr v-if="hovSrcIpData.length === 0">
                  <td colspan="9" class="ou-empty">无数据</td>
                </tr>
              </tbody>
            </table>
            <div class="ou-footer" style="margin-top:8px">
              <div class="ou-pager">
                <button class="ou-page-btn" @click="hovSrcIpPage > 1 && hovSrcIpPage--">‹</button>
                <button class="ou-page-btn active">1</button>
                <button class="ou-page-btn" @click="hovSrcIpPage < hovSrcIpPages && hovSrcIpPage++">›</button>
              </div>
              <span style="font-size:12px;color:#909399">共 {{ hovSrcIpData.length }} 条</span>
            </div>
          </div>

          <!-- 目标IP 表格 -->
          <div class="db-hov-table-panel">
            <table class="ou-table audit-table" style="margin:0">
              <thead>
                <tr>
                  <th style="width:40px">序号</th>
                  <th>目标IP <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th>总数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th>查询 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th>更新 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th>删除 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th>插入 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th>创建 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th>加载 <el-icon class="sort-icon"><Sort /></el-icon></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in hovDstIpData" :key="idx">
                  <td>{{ idx + 1 }}</td>
                  <td><span class="tid-link" @click="openHovDetailPopup(row.ip, 'dst')">{{ row.ip }}</span></td>
                  <td class="ou-num">{{ row.total }}</td>
                  <td class="ou-num" style="color:#409eff">{{ row.query }}</td>
                  <td class="ou-num" style="color:#67c23a">{{ row.update }}</td>
                  <td class="ou-num" style="color:#f56c6c">{{ row.delete }}</td>
                  <td class="ou-num" style="color:#e6a23c">{{ row.insert }}</td>
                  <td class="ou-num">{{ row.create }}</td>
                  <td class="ou-num">{{ row.load }}</td>
                </tr>
                <tr v-if="hovDstIpData.length === 0">
                  <td colspan="9" class="ou-empty">无数据</td>
                </tr>
              </tbody>
            </table>
            <div class="ou-footer" style="margin-top:8px">
              <div class="ou-pager">
                <button class="ou-page-btn" @click="hovDstIpPage > 1 && hovDstIpPage--">‹</button>
                <button class="ou-page-btn active">1</button>
                <button class="ou-page-btn" @click="hovDstIpPage < hovDstIpPages && hovDstIpPage++">›</button>
              </div>
              <span style="font-size:12px;color:#909399">共 {{ hovDstIpData.length }} 条</span>
            </div>
          </div>

          <!-- 用户名 表格 -->
          <div class="db-hov-table-panel">
            <table class="ou-table audit-table" style="margin:0">
              <thead>
                <tr>
                  <th style="width:40px">序号</th>
                  <th>用户名 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th>总数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th>查询 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th>更新 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th>删除 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th>插入 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th>创建 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th>加载 <el-icon class="sort-icon"><Sort /></el-icon></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in hovUserData" :key="idx">
                  <td>{{ idx + 1 }}</td>
                  <td>{{ row.userName }}</td>
                  <td class="ou-num">{{ row.total }}</td>
                  <td class="ou-num" style="color:#409eff">{{ row.query }}</td>
                  <td class="ou-num" style="color:#67c23a">{{ row.update }}</td>
                  <td class="ou-num" style="color:#f56c6c">{{ row.delete }}</td>
                  <td class="ou-num" style="color:#e6a23c">{{ row.insert }}</td>
                  <td class="ou-num">{{ row.create }}</td>
                  <td class="ou-num">{{ row.load }}</td>
                </tr>
                <tr v-if="hovUserData.length === 0">
                  <td colspan="9" class="ou-empty">无数据</td>
                </tr>
              </tbody>
            </table>
            <div class="ou-footer" style="margin-top:8px">
              <div class="ou-pager">
                <button class="ou-page-btn" @click="hovUserPage > 1 && hovUserPage--">‹</button>
                <button class="ou-page-btn active">1</button>
                <button class="ou-page-btn" @click="hovUserPage < hovUserPages && hovUserPage++">›</button>
              </div>
              <span style="font-size:12px;color:#909399">共 {{ hovUserData.length }} 条</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ==================== SQL分析 Tab ==================== -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'sql-analysis' }">
        <!-- 筛选区域 -->
        <div class="tdh-filters">
          <div class="tdh-filter-row">
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">MAC</span>
              <select class="ou-toolbar-select" v-model="saFilter.mac">
                <option value="">任意</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">源IP</span>
              <select class="ou-toolbar-select" v-model="saFilter.srcIpType">
                <option value="any">任意IP</option>
                <option value="single">单个IP</option>
                <option value="range">IP范围</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">源端口</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="saFilter.srcPort" placeholder="80 / 8000-8080" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">目标IP</span>
              <select class="ou-toolbar-select" v-model="saFilter.dstIpType">
                <option value="any">任意IP</option>
                <option value="single">单个IP</option>
                <option value="range">IP范围</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">目标端口</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="saFilter.dstPort" placeholder="80 / 8000-8080" />
            </label>
            <button class="ou-search-btn" @click="doSaSearch">
              <el-icon><Search /></el-icon>
            </button>
            <button class="secondary td-reset-btn" @click="resetSaFilters">重置</button>
            <div class="tdh-filter-right">
              <button style="border:none;background:none;cursor:pointer;color:#409eff;font-size:13px" @click="doSaExport">
                更多条件 <el-icon><ArrowDown /></el-icon>
              </button>
            </div>
          </div>
        </div>

        <!-- KPI 卡片 -->
        <div class="sa-kpi-row">
          <div class="sa-kpi-card">
            <div class="sa-kpi-value">{{ saKpi.recordCount }}</div>
            <div class="sa-kpi-label">记录数</div>
          </div>
          <div class="sa-kpi-card">
            <div class="sa-kpi-value">{{ saKpi.selectCount }}</div>
            <div class="sa-kpi-label">SELECT数</div>
          </div>
          <div class="sa-kpi-card">
            <div class="sa-kpi-value">{{ saKpi.updateCount }}</div>
            <div class="sa-kpi-label">UPDATE数</div>
          </div>
          <div class="sa-kpi-card">
            <div class="sa-kpi-value">{{ saKpi.deleteCount }}</div>
            <div class="sa-kpi-label">DELETE数</div>
          </div>
          <div class="sa-kpi-card">
            <div class="sa-kpi-value">{{ saKpi.insertCount }}</div>
            <div class="sa-kpi-label">INSERT数</div>
          </div>
          <div class="sa-kpi-card">
            <div class="sa-kpi-value">{{ saKpi.createCount }}</div>
            <div class="sa-kpi-label">CREATE数</div>
          </div>
          <div class="sa-kpi-card">
            <div class="sa-kpi-value">{{ saKpi.loadCount }}</div>
            <div class="sa-kpi-label">LOAD数</div>
          </div>
          <div class="sa-kpi-card">
            <div class="sa-kpi-value">{{ saKpi.otherCount }}</div>
            <div class="sa-kpi-label">其 它</div>
          </div>
          <div class="sa-kpi-card">
            <div class="sa-kpi-value">{{ saKpi.avgLatency }}</div>
            <div class="sa-kpi-label">平均时延</div>
          </div>
        </div>

        <!-- 折线图区域 -->
        <div class="sa-charts-row">
          <div class="sa-chart-panel">
            <div class="sa-chart-title">
              <el-icon style="margin-right:4px"><DataAnalysis /></el-icon> 平均时延趋势图
            </div>
            <v-chart :option="saAvgLatencyOption" autoresize style="width:100%;height:240px" />
          </div>
          <div class="sa-chart-panel">
            <div class="sa-chart-title">
              <el-icon style="margin-right:4px"><DataAnalysis /></el-icon> SQL执行数趋势图
            </div>
            <v-chart :option="saExecCountOption" autoresize style="width:100%;height:240px" />
          </div>
        </div>

        <!-- 子Tab 切换 -->
        <div class="sa-subtabs">
          <span class="sa-subtab" :class="{ active: saSubTab === 'advanced' }" @click="saSubTab = 'advanced'">高级SQL</span>
          <span class="sa-subtab" :class="{ active: saSubTab === 'user' }" @click="saSubTab = 'user'">访问用户</span>
          <span class="sa-subtab" :class="{ active: saSubTab === 'data' }" @click="saSubTab = 'data'">数据受影响量</span>
          <span class="sa-subtab" :class="{ active: saSubTab === 'server' }" @click="saSubTab = 'server'">服务器SQL</span>
        </div>

        <!-- 高级SQL 表格 -->
        <div v-if="saSubTab === 'advanced'" class="ou-table-wrap" style="flex:1;min-height:0">
          <table class="ou-table audit-table">
            <thead>
              <tr>
                <th style="width:40px">序号</th>
                <th>当前SQL <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>总数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th style="width:100px">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in saAdvancedData" :key="idx">
                <td>{{ idx + 1 }}</td>
                <td style="font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:600px" :title="row.sql">{{ row.sql }}</td>
                <td class="ou-num">{{ row.total }}</td>
                <td class="ou-num">{{ row.latency }}</td>
                <td><span class="link-btn" @click="openSqlHistoryPopup(row)">SQL详情</span></td>
              </tr>
              <tr v-if="saAdvancedData.length === 0">
                <td colspan="5" class="ou-empty">无数据</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 访问用户 表格 -->
        <div v-if="saSubTab === 'user'" class="ou-table-wrap" style="flex:1;min-height:0">
          <table class="ou-table audit-table">
            <thead>
              <tr>
                <th style="width:40px">序号</th>
                <th>源IP <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>总数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in saUserData" :key="idx">
                <td>{{ idx + 1 }}</td>
                <td><span class="tid-link" @click="openSessionDiagPopup(row.ip, 'src')">{{ row.ip }}</span></td>
                <td class="ou-num">{{ row.total }}</td>
                <td class="ou-num">{{ row.latency }}</td>
              </tr>
              <tr v-if="saUserData.length === 0">
                <td colspan="4" class="ou-empty">无数据</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 数据受影响量 表格 -->
        <div v-if="saSubTab === 'data'" class="ou-table-wrap" style="flex:1;min-height:0">
          <table class="ou-table audit-table">
            <thead>
              <tr>
                <th style="width:40px">序号</th>
                <th>当前SQL <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>总数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th style="width:100px">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in saDataAffectedData" :key="idx">
                <td>{{ idx + 1 }}</td>
                <td style="font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:600px" :title="row.sql">{{ row.sql }}</td>
                <td class="ou-num">{{ row.total }}</td>
                <td class="ou-num">{{ row.latency }}</td>
                <td><span class="link-btn" @click="openSqlHistoryPopup(row)">SQL详情</span></td>
              </tr>
              <tr v-if="saDataAffectedData.length === 0">
                <td colspan="5" class="ou-empty">无数据</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 服务器SQL 表格 -->
        <div v-if="saSubTab === 'server'" class="ou-table-wrap" style="flex:1;min-height:0">
          <table class="ou-table audit-table">
            <thead>
              <tr>
                <th style="width:40px">序号</th>
                <th>当前SQL <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>总数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th style="width:100px">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in saServerData" :key="idx">
                <td>{{ idx + 1 }}</td>
                <td style="font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:600px" :title="row.sql">{{ row.sql }}</td>
                <td class="ou-num">{{ row.total }}</td>
                <td class="ou-num">{{ row.latency }}</td>
                <td><span class="link-btn" @click="openSqlHistoryPopup(row)">SQL详情</span></td>
              </tr>
              <tr v-if="saServerData.length === 0">
                <td colspan="5" class="ou-empty">无数据</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="ou-footer">
          <div class="ou-footer-left">
            <div class="ou-pager">
              <button class="ou-page-btn" @click="saPage > 1 && saPage--">‹</button>
              <button v-for="p in saPages" :key="p" class="ou-page-btn" :class="{ active: p === saPage }" @click="saPage = p">{{ p }}</button>
              <button class="ou-page-btn" @click="saPage < saPages && saPage++">›</button>
              <span style="margin-left:8px;font-size:12px;color:#909399">到第</span>
              <input class="ou-page-goto-input" v-model.number="saGotoPage" style="width:36px;height:24px;text-align:center;border:1px solid #dcdfe6;border-radius:3px;font-size:12px" />
              <span style="font-size:12px;color:#909399">页</span>
              <button class="ou-page-goto-btn" @click="goToSaPage" style="height:24px;padding:0 8px;border:1px solid #dcdfe6;border-radius:3px;background:#fff;font-size:12px;cursor:pointer">确定</button>
            </div>
          </div>
          <div class="ou-footer-right">
            <span>共 {{ saData.length }} 条</span>
            <label class="ou-page-size">
              <select v-model="saPageSize" style="height:24px;border:1px solid #dcdfe6;border-radius:3px;font-size:12px;padding:0 4px">
                <option :value="100">100 条/页</option>
              </select>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 历史概况详情弹窗 ==================== -->
    <el-dialog v-model="hovDetailVisible" width="95%" top="2vh" destroy-on-close class="hov-detail-dialog">
      <template #header>
        <div class="hov-detail-header">
          <span class="hov-detail-title">数据库审计->历史概况</span>
        </div>
      </template>

      <!-- 筛选区域 -->
      <div class="tdh-filters" style="padding:12px">
        <div class="tdh-filter-row">
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">MAC</span>
            <select class="ou-toolbar-select" v-model="hovDetailFilter.mac">
              <option value="">任意</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">源IP</span>
            <select class="ou-toolbar-select" v-model="hovDetailFilter.srcIpType">
              <option value="any">任意IP</option>
              <option value="single">单个IP</option>
              <option value="range">IP范围</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">源端口</span>
            <input class="ou-toolbar-input tdh-filter-input" v-model="hovDetailFilter.srcPort" placeholder="80 / 8000-8080" />
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">目标IP</span>
            <select class="ou-toolbar-select" v-model="hovDetailFilter.dstIpType">
              <option value="any">任意IP</option>
              <option value="single">单个IP</option>
              <option value="range">IP范围</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">目标端口</span>
            <input class="ou-toolbar-input tdh-filter-input" v-model="hovDetailFilter.dstPort" placeholder="80 / 8000-8080" />
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">用户名</span>
            <input class="ou-toolbar-input tdh-filter-input" v-model="hovDetailFilter.userName" placeholder="" />
          </label>
        </div>
        <div class="tdh-filter-row">
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">用户组</span>
            <select class="ou-toolbar-select" v-model="hovDetailFilter.userGroup">
              <option value="">任意</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">用户名称</span>
            <input class="ou-toolbar-input tdh-filter-input" v-model="hovDetailFilter.displayName" placeholder="" />
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">SQL命令</span>
            <select class="ou-toolbar-select" v-model="hovDetailFilter.sqlCmd">
              <option value="">任意</option>
              <option value="SELECT">SELECT</option>
              <option value="INSERT">INSERT</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
              <option value="SET">SET</option>
            </select>
          </label>
          <label class="tdh-filter-field tdh-filter-time">
            <span class="ou-toolbar-label">时间范围</span>
            <input class="ou-toolbar-input tdh-time-range" v-model="hovDetailFilter.timeRange" />
          </label>
          <button class="ou-search-btn" @click="doHovDetailSearch">
            <el-icon><Search /></el-icon>
          </button>
          <button class="secondary td-reset-btn" @click="resetHovDetailFilters">重置</button>
        </div>
      </div>

      <!-- 三列表格区域 -->
      <div class="db-hov-table-grid">
        <!-- 源IP 表格 -->
        <div class="db-hov-table-panel">
          <table class="ou-table audit-table" style="margin:0">
            <thead>
              <tr>
                <th style="width:40px">序号</th>
                <th>源IP <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>总数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>查询 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>更新 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>删除 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>插入 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>创建 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>加载 <el-icon class="sort-icon"><Sort /></el-icon></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in hovDetailSrcIpData" :key="idx">
                <td>{{ idx + 1 }}</td>
                <td><span class="tid-link" @click="openSessionDiagPopup(row.ip, 'src')">{{ row.ip }}</span></td>
                <td class="ou-num">{{ row.total }}</td>
                <td class="ou-num" style="color:#409eff">{{ row.query }}</td>
                <td class="ou-num" style="color:#67c23a">{{ row.update }}</td>
                <td class="ou-num" style="color:#f56c6c">{{ row.delete }}</td>
                <td class="ou-num" style="color:#e6a23c">{{ row.insert }}</td>
                <td class="ou-num">{{ row.create }}</td>
                <td class="ou-num">{{ row.load }}</td>
              </tr>
              <tr v-if="hovDetailSrcIpData.length === 0">
                <td colspan="9" class="ou-empty">无数据</td>
              </tr>
            </tbody>
          </table>
          <div class="ou-footer" style="margin-top:8px">
            <div class="ou-pager">
              <button class="ou-page-btn" @click="hovDetailSrcIpPage > 1 && hovDetailSrcIpPage--">‹</button>
              <button class="ou-page-btn active">1</button>
              <button class="ou-page-btn" @click="hovDetailSrcIpPage < hovDetailSrcIpPages && hovDetailSrcIpPage++">›</button>
            </div>
            <span style="font-size:12px;color:#909399">共 {{ hovDetailSrcIpData.length }} 条</span>
          </div>
        </div>

        <!-- 目标IP 表格 -->
        <div class="db-hov-table-panel">
          <table class="ou-table audit-table" style="margin:0">
            <thead>
              <tr>
                <th style="width:40px">序号</th>
                <th>目标IP <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>总数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>查询 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>更新 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>删除 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>插入 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>创建 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>加载 <el-icon class="sort-icon"><Sort /></el-icon></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in hovDetailDstIpData" :key="idx">
                <td>{{ idx + 1 }}</td>
                <td><span class="tid-link" @click="openSessionDiagPopup(row.ip, 'dst')">{{ row.ip }}</span></td>
                <td class="ou-num">{{ row.total }}</td>
                <td class="ou-num" style="color:#409eff">{{ row.query }}</td>
                <td class="ou-num" style="color:#67c23a">{{ row.update }}</td>
                <td class="ou-num" style="color:#f56c6c">{{ row.delete }}</td>
                <td class="ou-num" style="color:#e6a23c">{{ row.insert }}</td>
                <td class="ou-num">{{ row.create }}</td>
                <td class="ou-num">{{ row.load }}</td>
              </tr>
              <tr v-if="hovDetailDstIpData.length === 0">
                <td colspan="9" class="ou-empty">无数据</td>
              </tr>
            </tbody>
          </table>
          <div class="ou-footer" style="margin-top:8px">
            <div class="ou-pager">
              <button class="ou-page-btn" @click="hovDetailDstIpPage > 1 && hovDetailDstIpPage--">‹</button>
              <button class="ou-page-btn active">1</button>
              <button class="ou-page-btn" @click="hovDetailDstIpPage < hovDetailDstIpPages && hovDetailDstIpPage++">›</button>
            </div>
            <span style="font-size:12px;color:#909399">共 {{ hovDetailDstIpData.length }} 条</span>
          </div>
        </div>

        <!-- 用户名 表格 -->
        <div class="db-hov-table-panel">
          <table class="ou-table audit-table" style="margin:0">
            <thead>
              <tr>
                <th style="width:40px">序号</th>
                <th>用户名 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>总数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>查询 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>更新 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>删除 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>插入 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>创建 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>加载 <el-icon class="sort-icon"><Sort /></el-icon></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in hovDetailUserData" :key="idx">
                <td>{{ idx + 1 }}</td>
                <td>{{ row.userName }}</td>
                <td class="ou-num">{{ row.total }}</td>
                <td class="ou-num" style="color:#409eff">{{ row.query }}</td>
                <td class="ou-num" style="color:#67c23a">{{ row.update }}</td>
                <td class="ou-num" style="color:#f56c6c">{{ row.delete }}</td>
                <td class="ou-num" style="color:#e6a23c">{{ row.insert }}</td>
                <td class="ou-num">{{ row.create }}</td>
                <td class="ou-num">{{ row.load }}</td>
              </tr>
              <tr v-if="hovDetailUserData.length === 0">
                <td colspan="9" class="ou-empty">无数据</td>
              </tr>
            </tbody>
          </table>
          <div class="ou-footer" style="margin-top:8px">
            <div class="ou-pager">
              <button class="ou-page-btn" @click="hovDetailUserPage > 1 && hovDetailUserPage--">‹</button>
              <button class="ou-page-btn active">1</button>
              <button class="ou-page-btn" @click="hovDetailUserPage < hovDetailUserPages && hovDetailUserPage++">›</button>
            </div>
            <span style="font-size:12px;color:#909399">共 {{ hovDetailUserData.length }} 条</span>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- ==================== 会话诊断弹窗 ==================== -->
    <el-dialog v-model="sessionDiagVisible" title="会话诊断" width="600px" destroy-on-close>
      <div style="padding:12px">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="IP地址">{{ sessionDiagData.ip }}</el-descriptions-item>
          <el-descriptions-item label="方向">{{ sessionDiagData.direction === 'src' ? '源IP' : '目标IP' }}</el-descriptions-item>
          <el-descriptions-item label="地区">北京市</el-descriptions-item>
          <el-descriptions-item label="ISP">中国联通</el-descriptions-item>
          <el-descriptions-item label="会话数" :span="2">156</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <!-- ==================== 报文分析弹窗 ==================== -->
    <el-dialog v-model="packetPopupVisible" width="95%" top="2vh" destroy-on-close class="packet-analysis-dialog">
      <template #header>
        <div class="pa-header">
          <span class="pa-header-title">报文分析->sql</span>
          <div class="pa-header-actions">
            <span class="pa-protocol">应用协议: <strong>sql</strong></span>
            <span class="pa-action-link" @click="downloadPacket(packetPopupData)"><el-icon><Download /></el-icon> 报文下载</span>
            <span class="pa-action-link" @click="downloadContent(packetPopupData)"><el-icon><Download /></el-icon> 内容下载</span>
          </div>
        </div>
      </template>

      <!-- Tab 导航 -->
      <div class="pa-tabs">
        <span class="pa-tab active">报文解析</span>
        <span class="pa-tab">报文交互</span>
        <span class="pa-tab">元数据</span>
        <span class="pa-tab">证书分析</span>
        <span class="pa-tab">报文播放</span>
        <span class="pa-tab">时序图</span>
      </div>

      <!-- 过滤器栏 -->
      <div class="pa-filter-bar">
        <input class="pa-filter-input" v-model="paFilter" placeholder="报文显示过滤器" />
        <select class="pa-filter-select" v-model="paTopN">
          <option value="100">TOP 100</option>
          <option value="50">TOP 50</option>
          <option value="20">TOP 20</option>
        </select>
      </div>

      <!-- 数据包表格 -->
      <div class="pa-table-wrap">
        <table class="pa-table">
          <thead>
            <tr>
              <th style="width:50px">序号 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th style="width:100px">时间 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th style="width:130px">源地址 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th style="width:130px">目标地址 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th style="width:80px">网络协议 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th style="width:60px">长度 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>详情 <el-icon class="sort-icon"><Sort /></el-icon></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="pkt in paPacketData" :key="pkt.no"
                :class="{ 'pa-row-selected': paSelectedPkt === pkt.no }"
                @click="paSelectedPkt = pkt.no">
              <td>{{ pkt.no }}</td>
              <td>{{ pkt.time }}</td>
              <td>{{ pkt.srcAddr }}</td>
              <td>{{ pkt.dstAddr }}</td>
              <td>{{ pkt.protocol }}</td>
              <td>{{ pkt.length }}</td>
              <td style="font-size:12px">{{ pkt.detail }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 协议树 -->
      <div class="pa-tree-wrap">
        <div v-for="(item, idx) in paTreeData" :key="idx" class="pa-tree-item">
          <span class="pa-tree-toggle" @click="item.expanded = !item.expanded">
            <span v-if="item.expanded">▾</span><span v-else>▸</span>
          </span>
          <span class="pa-tree-label">{{ item.label }}</span>
        </div>
      </div>

      <!-- 十六进制 dump -->
      <div class="pa-hex-wrap">
        <div class="pa-hex-row" v-for="row in paHexData" :key="row.offset">
          <span class="pa-hex-offset">{{ row.offset }}</span>
          <span class="pa-hex-bytes">{{ row.bytes }}</span>
          <span class="pa-hex-ascii">{{ row.ascii }}</span>
        </div>
      </div>
    </el-dialog>

    <!-- ==================== 报文播放弹窗 ==================== -->
    <el-dialog v-model="packetPlayVisible" title="报文播放" width="70%" destroy-on-close>
      <div style="padding:12px;text-align:center;color:#909399">
        <el-icon style="font-size:48px;color:#c0c4cc"><VideoPlay /></el-icon>
        <div style="margin-top:8px">报文播放功能（Mock）</div>
      </div>
    </el-dialog>

    <!-- ==================== SQL分析->历史会话弹窗 ==================== -->
    <el-dialog v-model="sqlHistoryVisible" width="98%" top="2vh" destroy-on-close class="sql-history-dialog">
      <template #header>
        <div class="sql-his-header">
          <span class="sql-his-title">SQL分析 -> 历史会话</span>
        </div>
      </template>

      <!-- 筛选区域 -->
      <div class="tdh-filters" style="padding:12px">
        <div class="tdh-filter-row">
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">MAC</span>
            <select class="ou-toolbar-select" v-model="sqlHisFilter.mac">
              <option value="">任意</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">源IP</span>
            <select class="ou-toolbar-select" v-model="sqlHisFilter.srcIpType">
              <option value="any">任意IP</option>
              <option value="single">单个IP</option>
              <option value="range">IP范围</option>
            </select>
          </label>
          <label class="tdh-filter-field" v-if="sqlHisFilter.srcIpType !== 'any'">
            <input class="ou-toolbar-input tdh-filter-input" v-model="sqlHisFilter.srcIp" placeholder="IP地址" />
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">源端口</span>
            <input class="ou-toolbar-input tdh-filter-input" v-model="sqlHisFilter.srcPort" placeholder="80 / 8000-8080" />
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">目标IP</span>
            <select class="ou-toolbar-select" v-model="sqlHisFilter.dstIpType">
              <option value="any">任意IP</option>
              <option value="single">单个IP</option>
              <option value="range">IP范围</option>
            </select>
          </label>
          <label class="tdh-filter-field" v-if="sqlHisFilter.dstIpType !== 'any'">
            <input class="ou-toolbar-input tdh-filter-input" v-model="sqlHisFilter.dstIp" placeholder="IP地址" />
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">目标端口</span>
            <input class="ou-toolbar-input tdh-filter-input" v-model="sqlHisFilter.dstPort" placeholder="80 / 8000-8080" />
          </label>
        </div>
        <div class="tdh-filter-row">
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">用户名</span>
            <input class="ou-toolbar-input tdh-filter-input" v-model="sqlHisFilter.loginName" placeholder="" />
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">用户组</span>
            <select class="ou-toolbar-select" v-model="sqlHisFilter.userGroup">
              <option value="">任意</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">用户名称</span>
            <input class="ou-toolbar-input tdh-filter-input" v-model="sqlHisFilter.userName" placeholder="" />
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">SQL命令</span>
            <select class="ou-toolbar-select" v-model="sqlHisFilter.sqlCmd">
              <option value="">任意</option>
              <option value="SELECT">SELECT</option>
              <option value="INSERT">INSERT</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
              <option value="SET">SET</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">SQL</span>
            <input class="ou-toolbar-input tdh-filter-input" v-model="sqlHisFilter.sql" placeholder="" />
          </label>
        </div>
        <div class="tdh-filter-row">
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">链路</span>
            <select class="ou-toolbar-select" v-model="sqlHisFilter.link">
              <option value="">任意</option>
              <option value="默认">默认</option>
            </select>
          </label>
          <label class="tdh-filter-field tdh-filter-time">
            <span class="ou-toolbar-label">时间范围</span>
            <input class="ou-toolbar-input tdh-time-range" v-model="sqlHisFilter.timeRange" />
          </label>
          <button class="ou-search-btn" @click="doSqlHisSearch">
            <el-icon><Search /></el-icon>
          </button>
          <button class="secondary td-reset-btn" @click="resetSqlHisFilters">重置</button>
        </div>
      </div>

      <!-- 数据表格 -->
      <div class="ou-table-wrap" style="flex:1;min-height:300px;max-height:500px">
        <table class="ou-table audit-table">
          <thead>
            <tr>
              <th style="width:40px">序号</th>
              <th>请求时间 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>MAC</th>
              <th>MAC厂商</th>
              <th>用户名称</th>
              <th>源IP</th>
              <th>目标IP</th>
              <th>目标地理位置</th>
              <th>用户名</th>
              <th>时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>登录状态</th>
              <th style="min-width:260px">当前SQL</th>
              <th style="width:80px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in sqlHisPageData" :key="idx">
              <td>{{ (sqlHisPage - 1) * sqlHisPageSize + idx + 1 }}</td>
              <td style="white-space:nowrap">{{ row.opTime }}</td>
              <td style="font-size:12px">{{ row.mac }}</td>
              <td style="font-size:12px">{{ row.macVendor }}</td>
              <td>{{ row.userName }}</td>
              <td><span class="tid-link" @click="openSessionDiagPopup(row.srcIp, 'src')">{{ row.srcIp }}</span></td>
              <td><span class="tid-link" @click="openSessionDiagPopup(row.dstIp, 'dst')">{{ row.dstIp }}</span></td>
              <td style="font-size:12px">
                <span class="db-location">
                  <el-icon style="color:#f56c6c;margin-right:2px"><Location /></el-icon>
                  {{ row.dstLocation }}
                </span>
              </td>
              <td style="font-size:12px">{{ row.loginName }}</td>
              <td class="ou-num">{{ row.latency }}</td>
              <td>
                <span class="db-status-success">
                  <el-icon style="margin-right:2px"><CircleCheck /></el-icon>
                  {{ row.loginStatus }}
                </span>
              </td>
              <td style="font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:300px" :title="row.sql">{{ row.sql }}</td>
              <td>
                <span class="link-btn" @click.stop="openPacketPopup(row)"><el-icon><InfoFilled /></el-icon> 数据包</span>
              </td>
            </tr>
            <tr v-if="sqlHisData.length === 0">
              <td colspan="13" class="ou-empty">无数据</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="ou-footer">
        <div class="ou-footer-left">
          <div class="ou-pager">
            <button class="ou-page-btn" @click="sqlHisPage > 1 && sqlHisPage--">‹</button>
            <button v-for="p in sqlHisPages" :key="p" class="ou-page-btn" :class="{ active: p === sqlHisPage }" @click="sqlHisPage = p">{{ p }}</button>
            <button class="ou-page-btn" @click="sqlHisPage < sqlHisPages && sqlHisPage++">›</button>
            <span style="margin-left:8px;font-size:12px;color:#909399">到第</span>
            <input class="ou-page-goto-input" v-model.number="sqlHisGotoPage" style="width:36px;height:24px;text-align:center;border:1px solid #dcdfe6;border-radius:3px;font-size:12px" />
            <span style="font-size:12px;color:#909399">页</span>
            <button class="ou-page-goto-btn" @click="goToSqlHisPage" style="height:24px;padding:0 8px;border:1px solid #dcdfe6;border-radius:3px;background:#fff;font-size:12px;cursor:pointer">确定</button>
          </div>
        </div>
        <div class="ou-footer-right">
          <span>共 {{ sqlHisData.length }} 条</span>
          <label class="ou-page-size">
            <select v-model="sqlHisPageSize" style="height:24px;border:1px solid #dcdfe6;border-radius:3px;font-size:12px;padding:0 4px">
              <option :value="100">100 条/页</option>
            </select>
          </label>
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
import { LineChart, BarChart, PieChart } from 'echarts/charts'
import {
  TitleComponent, TooltipComponent, LegendComponent, GridComponent
} from 'echarts/components'
import {
  Search, Sort, DataAnalysis, Download, Setting,
  InfoFilled, VideoPlay, Location, CircleCheck, CircleClose, ArrowDown
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import './nv-shared.css'

use([CanvasRenderer, LineChart, BarChart, PieChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent])

// ── Tabs ──
const tabs = [
  { key: 'realtime-sessions', label: '实时会话' },
  { key: 'realtime-overview', label: '实时概况' },
  { key: 'history-sessions', label: '历史会话' },
  { key: 'history-overview', label: '历史概况' },
  { key: 'sql-analysis', label: 'SQL分析' },
]
const activeTab = ref('realtime-sessions')

// ── 实时会话 Tab ──
const rtPage = ref(1)
const rtPageSize = ref(100)
const rtGotoPage = ref(1)

const rtFilter = reactive({
  sessionId: '10s',
  srcIpType: 'any',
  dstIpType: 'any',
  database: '',
  userName: '',
  userGroup: '',
  sql: '',
  mac: '',
  loginName: '',
  userIp: '',
  link: '',
})

interface RtRow {
  opTime: string; mac: string; userName: string; srcIp: string; dstIp: string
  dstLocation: string; loginName: string; loginStatus: string
  reqCount: number; respTime: number; sql: string
}

const rtData = ref<RtRow[]>([])

const rtPages = computed(() => Math.max(1, Math.ceil(rtData.value.length / rtPageSize.value)))
const rtPageData = computed(() => rtData.value.slice((rtPage.value - 1) * rtPageSize.value, rtPage.value * rtPageSize.value))

function generateRtData(): RtRow[] {
  const rows: RtRow[] = []
  const baseTime = new Date('2026-07-15T09:17:48')
  const locations = ['北京市', '上海市', '广州市', '深圳市', '杭州市', '成都市', '武汉市', '南京市']
  const loginStatuses = ['成功', '成功', '成功', '成功', '失败']
  const sqlStatements = [
    'SELECT @@session.transaction_read_only',
    'SELECT * FROM users WHERE id = 1',
    'INSERT INTO logs (action, time) VALUES (\'login\', NOW())',
    'UPDATE users SET last_login = NOW() WHERE id = 1',
    'DELETE FROM temp_data WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 DAY)',
    'SELECT COUNT(*) FROM orders WHERE status = \'pending\'',
    'SELECT u.name, o.total FROM users u JOIN orders o ON u.id = o.user_id',
    'SHOW TABLES',
    'DESCRIBE users',
    'SELECT @@version',
  ]

  for (let i = 0; i < 30; i++) {
    const time = new Date(baseTime.getTime() - i * 1000)
    const h = String(time.getHours()).padStart(2, '0')
    const m = String(time.getMinutes()).padStart(2, '0')
    const s = String(time.getSeconds()).padStart(2, '0')
    rows.push({
      opTime: `2026-07-15 ${h}:${m}:${s}`,
      mac: '30-8b-8a-6d-90-01',
      userName: 'admin',
      srcIp: `10.16.12.33`,
      dstIp: `10.131.11.240-${3300 + (i % 5)}`,
      dstLocation: locations[i % locations.length],
      loginName: 'modeltest',
      loginStatus: loginStatuses[i % loginStatuses.length],
      reqCount: 1500 + Math.floor(Math.random() * 2000),
      respTime: Math.floor(Math.random() * 50) + 1,
      sql: sqlStatements[i % sqlStatements.length],
    })
  }
  return rows
}

rtData.value = generateRtData()

function doRtSearch() { ElMessage.success('搜索完成（Mock）') }
function resetRtFilters() {
  rtFilter.sessionId = '10s'; rtFilter.srcIpType = 'any'; rtFilter.dstIpType = 'any'
  rtFilter.database = ''; rtFilter.userName = ''; rtFilter.userGroup = ''; rtFilter.sql = ''
  rtFilter.mac = ''; rtFilter.loginName = ''; rtFilter.userIp = ''; rtFilter.link = ''
}
function goToRtPage() {
  const p = rtGotoPage.value
  if (p >= 1 && p <= rtPages.value) rtPage.value = p
}

// ── 实时概况 Tab ──
const ovFilter = reactive({
  mac: '', srcIpType: 'any', dstIpType: 'any',
  database: '', userName: '',
  timeRange: '2026-07-15 08:45:59 - 2026-07-15 09:00:59'
})

const ovKpi = reactive({
  totalSessions: 23469075,
  totalRequests: 23469075,
  totalQueries: 23317476,
  totalFails: 3173,
  totalSessionCount: 19305812,
  totalQueryCount: 205307,
  totalDeletes: 55,
  totalInserts: 172156,
  totalLoadFiles: 0,
  totalCreates: 3726646,
})

// ── SQL状态饼图 ──
const sqlStatusPieOption = ref({
  tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
  legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { fontSize: 11 } },
  series: [{
    type: 'pie',
    radius: ['40%', '70%'],
    center: ['35%', '50%'],
    avoidLabelOverlap: false,
    label: { show: true, fontSize: 11, formatter: '{b}\n{d}%' },
    data: [
      { value: 23465902, name: '成功', itemStyle: { color: '#67c23a' } },
      { value: 3173, name: '失败', itemStyle: { color: '#f56c6c' } },
    ],
  }],
})

// ── SQL命令饼图 ─
const sqlCmdPieOption = ref({
  tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
  legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { fontSize: 11 } },
  series: [{
    type: 'pie',
    radius: ['40%', '70%'],
    center: ['35%', '50%'],
    avoidLabelOverlap: false,
    label: { show: true, fontSize: 11, formatter: '{b}\n{d}%' },
    data: [
      { value: 23317476, name: '查询', itemStyle: { color: '#67c23a' } },
      { value: 172156, name: '插入', itemStyle: { color: '#409eff' } },
      { value: 3726646, name: '创建', itemStyle: { color: '#e6a23c' } },
      { value: 55, name: '删除', itemStyle: { color: '#f56c6c' } },
      { value: 205307, name: '更新', itemStyle: { color: '#909399' } },
    ],
  }],
})

// ── 生成时间轴数据 ──
function generateTimeLabels24h(): string[] {
  const labels: string[] = []
  const now = new Date()
  for (let i = 23; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 3600000)
    labels.push(`${String(t.getMonth() + 1).padStart(2, '0')}/${String(t.getDate()).padStart(2, '0')} ${String(t.getHours()).padStart(2, '0')}:00`)
  }
  return labels
}

function generateRandomData(count: number, min: number, max: number): number[] {
  return Array.from({ length: count }, () => Math.floor(Math.random() * (max - min)) + min)
}

// ── SQL会话数趋势图 ─
const sqlSessionTrendOption = ref({
  tooltip: { trigger: 'axis' },
  grid: { left: 40, right: 20, top: 10, bottom: 40 },
  xAxis: {
    type: 'category',
    data: generateTimeLabels24h(),
    axisLabel: { rotate: 45, fontSize: 9 },
  },
  yAxis: { type: 'value', name: '次数', nameTextStyle: { fontSize: 10 } },
  series: [{
    name: '会话',
    type: 'line',
    smooth: true,
    showSymbol: false,
    data: generateRandomData(24, 5, 15),
    itemStyle: { color: '#409eff' },
  }],
})

// ── SQL趋势图 ──
const sqlTrendOption = ref({
  tooltip: { trigger: 'axis' },
  grid: { left: 40, right: 20, top: 10, bottom: 40 },
  xAxis: {
    type: 'category',
    data: generateTimeLabels24h(),
    axisLabel: { rotate: 45, fontSize: 9 },
  },
  yAxis: { type: 'value', name: '次数', nameTextStyle: { fontSize: 10 } },
  series: [{
    name: 'SQL',
    type: 'line',
    smooth: true,
    showSymbol: false,
    data: generateRandomData(24, 8, 20),
    itemStyle: { color: '#409eff' },
  }],
})

// ── SQL状态趋势图 ──
const sqlStatusTrendOption = ref({
  tooltip: { trigger: 'axis' },
  legend: { data: ['成功', '失败'], bottom: 0, textStyle: { fontSize: 10 } },
  grid: { left: 40, right: 20, top: 10, bottom: 30 },
  xAxis: {
    type: 'category',
    data: generateTimeLabels24h(),
    axisLabel: { rotate: 45, fontSize: 9 },
  },
  yAxis: { type: 'value', name: '次数', nameTextStyle: { fontSize: 10 } },
  series: [
    {
      name: '成功',
      type: 'line',
      smooth: true,
      showSymbol: false,
      data: generateRandomData(24, 10, 20),
      itemStyle: { color: '#409eff' },
    },
    {
      name: '失败',
      type: 'line',
      smooth: true,
      showSymbol: false,
      data: generateRandomData(24, 0, 3),
      itemStyle: { color: '#f56c6c' },
    },
  ],
})

// ── SQL命令趋势图 ──
const sqlCmdTrendOption = ref({
  tooltip: { trigger: 'axis' },
  legend: { data: ['查询', '更新', '删除', '创建', '插入', '加载'], bottom: 0, textStyle: { fontSize: 9 } },
  grid: { left: 40, right: 20, top: 10, bottom: 30 },
  xAxis: {
    type: 'category',
    data: generateTimeLabels24h(),
    axisLabel: { rotate: 45, fontSize: 9 },
  },
  yAxis: { type: 'value', name: '次数', nameTextStyle: { fontSize: 10 } },
  series: [
    { name: '查询', type: 'line', smooth: true, showSymbol: false, data: generateRandomData(24, 10, 20), itemStyle: { color: '#409eff' } },
    { name: '更新', type: 'line', smooth: true, showSymbol: false, data: generateRandomData(24, 0, 2), itemStyle: { color: '#67c23a' } },
    { name: '删除', type: 'line', smooth: true, showSymbol: false, data: generateRandomData(24, 0, 1), itemStyle: { color: '#f56c6c' } },
    { name: '创建', type: 'line', smooth: true, showSymbol: false, data: generateRandomData(24, 0, 1), itemStyle: { color: '#e6a23c' } },
    { name: '插入', type: 'line', smooth: true, showSymbol: false, data: generateRandomData(24, 0, 2), itemStyle: { color: '#909399' } },
    { name: '加载', type: 'line', smooth: true, showSymbol: false, data: generateRandomData(24, 0, 1), itemStyle: { color: '#c0c4cc' } },
  ],
})

function doOvSearch() { ElMessage.success('搜索完成（Mock）') }
function resetOvFilters() {
  ovFilter.mac = ''; ovFilter.srcIpType = 'any'; ovFilter.dstIpType = 'any'
  ovFilter.database = ''; ovFilter.userName = ''
  ovFilter.timeRange = '2026-07-15 08:45:59 - 2026-07-15 09:00:59'
}

// ── 历史会话 Tab ──
const htPage = ref(1)
const htPageSize = ref(100)
const htGotoPage = ref(1)

const htFilter = reactive({
  mac: '', srcIpType: 'any', userIpType: 'any', srcPort: '',
  dstIpType: 'any', dstPort: '', loginName: '', userGroup: '',
  userName: '', sqlCmd: '', sql: '', link: '',
  timeRange: '2026-07-15 09:15:03 - 2026-07-15 09:29:03'
})

interface HtRow {
  opTime: string; mac: string; macVendor: string; userName: string
  srcIp: string; dstIp: string; dstLocation: string
  loginName: string; latency: number; loginStatus: string
  sql: string; reqStatus: string; link: string; statusCode: string
}

const htData = ref<HtRow[]>([])

const htPages = computed(() => Math.max(1, Math.ceil(htData.value.length / htPageSize.value)))
const htPageData = computed(() => htData.value.slice((htPage.value - 1) * htPageSize.value, htPage.value * htPageSize.value))

function generateHtData(): HtRow[] {
  const rows: HtRow[] = []
  const baseTime = new Date('2026-07-15T09:29:03')
  const macVendors = ['NewH3CTechno...', 'NewH3CTechno...', 'NewH3CTechno...']
  const locations = ['北京市', '北京市', '北京市', '北京市', '北京市']
  const loginStatuses = ['成功', '成功', '成功', '成功', '成功']
  const reqStatuses = ['成功', '成功', '成功', '成功', '成功']
  const statusCodes = ['200', '200', '200', '200', '200']
  const sqlStatements = [
    'select @@session.transaction_read_only',
    'SELECT @@session.transaction_isolation',
    'SET autocommit=1',
    'SET character_set_results = NULL',
    '// mysql-connector-java-5.1.46 ( Revision: 9cc6b30287110c61761179265075426b0)',
    'select @@session.transaction_read_only',
    'SET autocommit=1',
    'SET character_set_results = NULL',
    'SET NAMES utf8mb4',
    '// mysql-connector-java-5.1.46 ( Revision: 9cc6b30287110c61761179265075426b0)',
    'SELECT @@session.transaction_read_only',
    'SET autocommit=1',
    'SET character_set_results = NULL',
    '// mysql-connector-java-5.1.46 ( Revision: 7f21511da32d9f710b116538f9)',
    'SET character_set_results = NULL',
    'SET autocommit=1',
    'SET character_set_results = NULL',
    'SELECT @@session.transaction_read_only',
    'SET autocommit=1',
    '// mysql-connector-java-5.0.28 ( Revision: 7f21511da32d9f710b116538f9)',
    'SELECT @@session.transaction_read_only',
    'SET autocommit=1',
    'SET character_set_results = NULL',
    'SET character_set_results = NULL',
    'SET autocommit=1',
    'SELECT @@session.transaction_read_only',
    '// mysql-connector-java-5.0.28 ( Revision: 7f21511da32d9f710b116538f9)',
    'SET character_set_results = NULL',
    'SELECT @@session.transaction_read_only',
    'SET autocommit=1',
  ]
  const userNames = ['thu_backup', 'thu_backup', 'thu_backup', 'thu_backup', 'thu_backup']
  const loginNames = ['thu_backup', 'thu_backup', 'thu_backup', 'thu_backup', 'thu_backup']

  for (let i = 0; i < 30; i++) {
    const time = new Date(baseTime.getTime() - i * 30000)
    const h = String(time.getHours()).padStart(2, '0')
    const m = String(time.getMinutes()).padStart(2, '0')
    const s = String(time.getSeconds()).padStart(2, '0')
    rows.push({
      opTime: `2026-07-15 ${h}:${m}:${s}`,
      mac: '30-8b-8a-6d-90-01',
      macVendor: macVendors[i % macVendors.length],
      userName: userNames[i % userNames.length],
      srcIp: `101.6.6.2:${43710 + (i % 10)}`,
      dstIp: `140.179.3.145:3306`,
      dstLocation: locations[i % locations.length],
      loginName: loginNames[i % loginNames.length],
      latency: 2000 + Math.floor(Math.random() * 2000),
      loginStatus: loginStatuses[i % loginStatuses.length],
      sql: sqlStatements[i % sqlStatements.length],
      reqStatus: reqStatuses[i % reqStatuses.length],
      link: '默认',
      statusCode: statusCodes[i % statusCodes.length],
    })
  }
  return rows
}

htData.value = generateHtData()

function doHtSearch() { ElMessage.success('搜索完成（Mock）') }
function resetHtFilters() {
  htFilter.mac = ''; htFilter.srcIpType = 'any'; htFilter.userIpType = 'any'; htFilter.srcPort = ''
  htFilter.dstIpType = 'any'; htFilter.dstPort = ''; htFilter.loginName = ''; htFilter.userGroup = ''
  htFilter.userName = ''; htFilter.sqlCmd = ''; htFilter.sql = ''; htFilter.link = ''
  htFilter.timeRange = '2026-07-15 09:15:03 - 2026-07-15 09:29:03'
}
function goToHtPage() {
  const p = htGotoPage.value
  if (p >= 1 && p <= htPages.value) htPage.value = p
}

// ── 历史概况 Tab ──
const hovFilter = reactive({
  mac: '', srcIpType: 'any', srcPort: '', dstIpType: 'any', dstPort: '',
  userName: '', userGroup: '', displayName: '', sqlCmd: '',
  timeRange: '2026-07-15 09:28:54 - 2026-07-15 09:43:54'
})

interface HovRow {
  ip: string; userName: string; total: number; query: number
  update: number; delete: number; insert: number; create: number; load: number
}

const hovSrcIpData = ref<HovRow[]>([
  { ip: '101.6.6.2', userName: '', total: 1088, query: 1412, update: 0, delete: 0, insert: 0, create: 0, load: 0 },
  { ip: '166.111.4.77', userName: '', total: 43, query: 37, update: 0, delete: 0, insert: 0, create: 0, load: 0 },
  { ip: '101.6.10.16', userName: '', total: 937, query: 909, update: 10, delete: 0, insert: 4, create: 0, load: 0 },
  { ip: '101.6.10.23', userName: '', total: 2316, query: 1453, update: 0, delete: 0, insert: 76, create: 152, load: 0 },
  { ip: '101.6.4.26', userName: '', total: 2, query: 0, update: 0, delete: 0, insert: 2, create: 0, load: 0 },
])

const hovDstIpData = ref<HovRow[]>([
  { ip: '166.111.121.165', userName: '', total: 43, query: 37, update: 0, delete: 0, insert: 0, create: 0, load: 0 },
  { ip: '140.179.3.145', userName: '', total: 1088, query: 1412, update: 0, delete: 0, insert: 0, create: 0, load: 0 },
  { ip: '35.103.11.245', userName: '', total: 2316, query: 1453, update: 0, delete: 0, insert: 76, create: 152, load: 0 },
  { ip: '101.6.215.38', userName: '', total: 937, query: 909, update: 10, delete: 0, insert: 4, create: 0, load: 0 },
  { ip: '166.111.5.245', userName: '', total: 2, query: 0, update: 0, delete: 0, insert: 2, create: 0, load: 0 },
])

const hovUserData = ref<HovRow[]>([
  { ip: '', userName: 'root', total: 937, query: 909, update: 10, delete: 0, insert: 4, create: 0, load: 0 },
  { ip: '', userName: 'kyy_data', total: 43, query: 37, update: 0, delete: 0, insert: 0, create: 0, load: 0 },
  { ip: '', userName: 'admin', total: 2, query: 0, update: 0, delete: 0, insert: 2, create: 0, load: 0 },
  { ip: '', userName: 'modeltest', total: 2316, query: 1453, update: 0, delete: 0, insert: 76, create: 152, load: 0 },
  { ip: '', userName: 'thu_backup_a...', total: 1088, query: 1412, update: 0, delete: 0, insert: 0, create: 0, load: 0 },
])

const hovSrcIpPage = ref(1)
const hovSrcIpPages = ref(1)
const hovDstIpPage = ref(1)
const hovDstIpPages = ref(1)
const hovUserPage = ref(1)
const hovUserPages = ref(1)

function doHovSearch() { ElMessage.success('搜索完成（Mock）') }
function resetHovFilters() {
  hovFilter.mac = ''; hovFilter.srcIpType = 'any'; hovFilter.srcPort = ''
  hovFilter.dstIpType = 'any'; hovFilter.dstPort = ''; hovFilter.userName = ''
  hovFilter.userGroup = ''; hovFilter.displayName = ''; hovFilter.sqlCmd = ''
  hovFilter.timeRange = '2026-07-15 09:28:54 - 2026-07-15 09:43:54'
}

// ── SQL分析 Tab ──
const saPage = ref(1)
const saPageSize = ref(100)
const saGotoPage = ref(1)

const saFilter = reactive({
  mac: '', srcIpType: 'any', srcPort: '', dstIpType: 'any', dstPort: ''
})

const saKpi = reactive({
  recordCount: 6030, selectCount: 4411, updateCount: 7, deleteCount: 0,
  insertCount: 137, createCount: 362, loadCount: 0, otherCount: 1113, avgLatency: '35ms'
})

const saSubTab = ref<'advanced' | 'user' | 'data' | 'server'>('advanced')

interface SaSqlRow { sql: string; total: number; latency: string }
interface SaIpRow { ip: string; total: number; latency: string }

const saAdvancedData = ref<SaSqlRow[]>([
  { sql: 'SELECT u.id, title, url, info_type, source, type, content_url, content_attachments, status, publish_time, publisher, is_public, is_official_source, cover_img, content_encoding, url, content_type, content_length, images, description, account, opus_id, is_live, dx_storage, split_path...', total: 1345, latency: '4.08 ms' },
  { sql: 'SET autocommit=1', total: 1149, latency: '21.18 ms' },
  { sql: 'SET character_set_results = NULL', total: 787, latency: '3.09 ms' },
  { sql: '/* mysql-connector-java-5.0.28 (Revision: 7f21511da32d9f710b116538f9) */SELECT @@session.auto_increment_increment AS auto_increment_increment, @@character_set_client AS character_set_client, @@character_set_connection AS...', total: 455, latency: '3.7 ms' },
  { sql: 'SELECT @@session.transaction_read_only', total: 494, latency: '3.56 ms' },
  { sql: 'select', total: 427, latency: '272.50 ms' },
  { sql: 'ROLLBACK', total: 414, latency: '145.85 ms' },
  { sql: 'SELECT id, user_unique_id, survey_id, user_id, fw, keywords, status, result, task, type, error_message, success_count, time_completed, time_cost, duration, msg_id, answer_msg_id, answer_msg_id_agent, kcjs_send, email_send, email_status, queue, position, is_use, del, download...', total: 377, latency: '34.78 ms' },
  { sql: 'commit', total: 371, latency: '14.78 ms' },
  { sql: 'SET autocommit=0', total: 368, latency: '3.61 ms' },
  { sql: 'COMMIT', total: 355, latency: '3.4 ms' },
  { sql: 'SET NAMES utf8mb4', total: 282, latency: '2.35 ms' },
  { sql: '/* mysql-connector-java-5.1.46 (Revision: 9dc6b46a7c3c2d0e7d1a2d802dd2e2e51cb2d3b6) */SELECT @@session.auto_increment_increment AS auto_increment_increment, @@character_set_client AS character_set_client, @@character_set_connection AS...', total: 298, latency: '2.46 ms' },
  { sql: 'SELECT @@session.transaction_isolation', total: 281, latency: '2.36 ms' },
  { sql: 'select @@session.transaction_read_only', total: 277, latency: '2.37 ms' },
  { sql: 'SELECT mcp_servers.id AS mcp_servers_id, mcp_servers.name AS mcp_servers_name, mcp_servers.description AS mcp_servers_description, mcp_servers.category AS mcp_servers_category, mcp_servers.tags AS mcp_servers_tags, mcp_servers.es_icon...', total: 175, latency: '3.51 ms' },
  { sql: 'SELECT 1', total: 127, latency: '0.68 ms' },
])

const saUserData = ref<SaIpRow[]>([
  { ip: '101.6.10.23', total: 6319, latency: '22.68 ms' },
  { ip: '101.6.6.2', total: 1898, latency: '2.39 ms' },
  { ip: '101.6.10.19', total: 727, latency: '183.32 ms' },
  { ip: '166.111.4.77', total: 28, latency: '182.06 ms' },
  { ip: '166.111.4.78', total: 15, latency: '148.06 ms' },
  { ip: '101.6.4.26', total: 2, latency: '0.90 ms' },
])

const saDataAffectedData = ref<SaSqlRow[]>([
  { sql: 'SELECT count(*) FROM `tdata`.`test_list_v`', total: 3, latency: '2236.26 ms' },
  { sql: 'select', total: 370, latency: '312.7 ms' },
  { sql: 'select OBJ_ID,CODE_VALUE,CODE_DESC,MSG,PHONE', total: 61, latency: '53.34 ms' },
  { sql: 'SELECT id, title, url, info_type, source, type, content_url, content_attachments, status, publish_time, publisher, is_public, is_official_source, cover_img, content_encoding, url, content_type, content_length, images, description, account, opus_id, is_live, dx_storage, split_path...', total: 87, latency: '13.73 ms' },
  { sql: 'select t.*, j.FOUR from BP_REFUND_PUBUO_RECORD, CLMS_ORDER_DETAIL b', total: 60, latency: '9.46 ms' },
  { sql: 'SELECT id, type, code, name, value, description, sort, enabled, parent_id, sort, create_time, update_time, time FROM iim_dict', total: 3, latency: '5.33 ms' },
  { sql: "SELECT id, unique_id, user_unique_id, name, icon, description, type, agent_type AS medicalAgentType, source_url, url, key_module_name, prompt, status, labels, opening_question, guiding, session, rules, hint, redirect, end, developed, organization, contribution, stream, chat, rev... +5", total: 1, latency: '4.44 ms' },
  { sql: 'SELECT id, knowledge_id, unique_id, name, path, type, explanation, matches, score, upload, percent, size, source, time, source_link, link, public_id, official_source, cover_img, resource_type, publisher, source, is_public, is_official_source, content_encoding, url, content_type, content_length, images, description, account, opus_id, is_live, dx_storage, split_path...', total: 4, latency: '4.39 ms' },
  { sql: 'COMMIT', total: 30, latency: '4.3 ms' },
  { sql: 'START TRANSACTION', total: 33, latency: '4.27 ms' },
  { sql: 'SELECT', total: 9, latency: '4.14 ms' },
  { sql: 'SELECT id, unique_id, name, auto, user_id, space_id, description, state, collection_id, name, collection_type, source, user_id, create_time, update_time, time FROM knowledge WHERE id IN (', total: 7, latency: '3.85 ms' },
  { sql: '/* mysql-connector-java-5.0.28 (Revision: 7f21511da32d9f710b116538f9) */SELECT @@session.auto_increment_increment AS auto_increment_increment, @@character_set_client AS character_set_client, @@character_set_connection AS...', total: 447, latency: '3.6 ms' },
  { sql: "select * from knowledge_splitter where publish_time between '2026-07-12 00:00:00' and '2026-07-15 23:59:59' and source_type is (4,7)", total: 2, latency: '3.73 ms' },
  { sql: 'with cors as (select c.id, cid, INI_CONNS_NO, com.DAY_ID, conn.inator_id', total: 1, latency: '3.57 ms' },
  { sql: 'SELECT @@session.transaction_read_only', total: 436, latency: '3.54 ms' },
  { sql: 'SET SESSION sort_buffer_size=8388608', total: 2, latency: '3.52 ms' },
])

const saServerData = ref<SaSqlRow[]>([
  { sql: 'SELECT count(*) FROM `tdata`.`test_list_v`', total: 3, latency: '2236.26 ms' },
  { sql: 'select', total: 370, latency: '312.7 ms' },
])

// 平均时延趋势图
const saAvgLatencyOption = ref({
  tooltip: { trigger: 'axis' },
  grid: { left: 50, right: 20, top: 20, bottom: 30 },
  xAxis: {
    type: 'category',
    data: ['08-30', '08-35', '08-40', '08-45', '08-50', '08-55', '09-00', '09-05', '09-10', '09-15', '09-20'],
    axisLabel: { fontSize: 10 },
  },
  yAxis: { type: 'value', name: 'ms' },
  series: [{
    name: '平均时延',
    type: 'line',
    smooth: true,
    data: [70, 50, 35, 20, 25, 30, 35, 130, 60, 20, 18],
    itemStyle: { color: '#5b8ff9' },
    areaStyle: { color: 'rgba(91,143,249,0.1)' },
  }],
})

// SQL执行数趋势图
const saExecCountOption = ref({
  tooltip: { trigger: 'axis' },
  grid: { left: 50, right: 20, top: 20, bottom: 30 },
  xAxis: {
    type: 'category',
    data: ['08-30', '08-35', '08-40', '08-45', '08-50', '08-55', '09-00', '09-05', '09-10', '09-15', '09-20'],
    axisLabel: { fontSize: 10 },
  },
  yAxis: { type: 'value', name: '次数' },
  series: [{
    name: 'SQL执行数',
    type: 'line',
    smooth: true,
    data: [1200, 800, 600, 500, 350, 250, 200, 150, 120, 100, 80],
    itemStyle: { color: '#5b8ff9' },
    areaStyle: { color: 'rgba(91,143,249,0.1)' },
  }],
})

const saData = ref<SaSqlRow[]>([])

const saPages = computed(() => 1)

function doSaSearch() { ElMessage.success('查询任务提交成功') }
function doSaExport() { ElMessage.info('更多条件（Mock）') }
function resetSaFilters() {
  saFilter.mac = ''; saFilter.srcIpType = 'any'; saFilter.srcPort = ''
  saFilter.dstIpType = 'any'; saFilter.dstPort = ''
}
function goToSaPage() {}
function openSqlDetailPopup(row: SaSqlRow) {
  ElMessage.success(`SQL详情：${row.sql.substring(0, 50)}...`)
}

// ── SQL分析->历史会话弹窗 ──
const sqlHistoryVisible = ref(false)
const sqlHisFilter = reactive({
  mac: '', srcIpType: 'any', srcIp: '', srcPort: '',
  dstIpType: 'any', dstIp: '', dstPort: '',
  loginName: '', userGroup: '', userName: '',
  sqlCmd: '', sql: '', link: '',
  timeRange: '2026-07-15 10:06:45 - 2026-07-15 10:21:45'
})

interface SqlHisRow {
  opTime: string; mac: string; macVendor: string; userName: string
  srcIp: string; dstIp: string; dstLocation: string
  loginName: string; latency: number; loginStatus: string; sql: string
}

const sqlHisData = ref<SqlHisRow[]>([])
const sqlHisPage = ref(1)
const sqlHisPageSize = ref(100)
const sqlHisGotoPage = ref(1)
const sqlHisPages = computed(() => Math.max(1, Math.ceil(sqlHisData.value.length / sqlHisPageSize.value)))
const sqlHisPageData = computed(() => sqlHisData.value.slice((sqlHisPage.value - 1) * sqlHisPageSize.value, sqlHisPage.value * sqlHisPageSize.value))

function generateSqlHisData(baseTime: Date, count: number, srcIp: string, dstIp: string, dstPort: string, loginName: string, sql: string): SqlHisRow[] {
  const rows: SqlHisRow[] = []
  const macVendors = ['NewH3CTechno...', 'NewH3CTechno...', 'NewH3CTechno...']
  const locations = ['北京市', '北京市', '北京市', '北京市', '北京市']

  for (let i = 0; i < count; i++) {
    const time = new Date(baseTime.getTime() - i * 1000)
    const h = String(time.getHours()).padStart(2, '0')
    const m = String(time.getMinutes()).padStart(2, '0')
    const s = String(time.getSeconds()).padStart(2, '0')
    rows.push({
      opTime: `2026-07-15 ${h}:${m}:${s}`,
      mac: '30-8b-8a-6d-90-01',
      macVendor: macVendors[i % macVendors.length],
      userName: loginName,
      srcIp: srcIp,
      dstIp: dstIp.includes(':') ? dstIp : `${dstIp}:${dstPort}`,
      dstLocation: locations[i % locations.length],
      loginName: loginName,
      latency: 1500 + Math.floor(Math.random() * 3000),
      loginStatus: '成功',
      sql: sql,
    })
  }
  return rows
}

function openSqlHistoryPopup(row: SaSqlRow) {
  // 根据不同SQL生成不同的mock数据
  if (row.sql.includes('SET character_set_results')) {
    sqlHisData.value = generateSqlHisData(new Date('2026-07-15T10:21:45'), 15, '101.6.6.2:59814', '140.179.3.145:3306', '3306', 'thu_backup...', 'SET character_set_results = NULL')
  } else if (row.sql.includes('SELECT u.id')) {
    sqlHisData.value = generateSqlHisData(new Date('2026-07-15T10:21:44'), 15, '101.6.10.23:45246', '39.103.11.249:3306', '3306', 'modeltest', 'SELECT @@session.transaction_read_only')
  } else if (row.sql.includes('101.6.6.2') || row.sql.includes('140.179')) {
    sqlHisData.value = generateSqlHisData(new Date('2026-07-15T10:21:45'), 15, '101.6.6.2:59814', '140.179.3.145:3306', '3306', 'thu_backup...', 'select @@session.transaction_read_only')
  } else {
    sqlHisData.value = generateSqlHisData(new Date('2026-07-15T10:21:44'), 15, '101.6.10.23:45246', '39.103.11.249:3306', '3306', 'modeltest', row.sql.substring(0, 80))
  }
  sqlHistoryVisible.value = true
}

function doSqlHisSearch() { ElMessage.success('搜索完成（Mock）') }
function resetSqlHisFilters() {
  sqlHisFilter.mac = ''; sqlHisFilter.srcIpType = 'any'; sqlHisFilter.srcIp = ''; sqlHisFilter.srcPort = ''
  sqlHisFilter.dstIpType = 'any'; sqlHisFilter.dstIp = ''; sqlHisFilter.dstPort = ''
  sqlHisFilter.loginName = ''; sqlHisFilter.userGroup = ''; sqlHisFilter.userName = ''
  sqlHisFilter.sqlCmd = ''; sqlHisFilter.sql = ''; sqlHisFilter.link = ''
  sqlHisFilter.timeRange = '2026-07-15 10:06:45 - 2026-07-15 10:21:45'
}
function goToSqlHisPage() {
  const p = sqlHisGotoPage.value
  if (p >= 1 && p <= sqlHisPages.value) sqlHisPage.value = p
}

// ── 数据包下拉菜单 ──
const packetMenuVisible = ref(false)
const packetMenuX = ref(0)
const packetMenuY = ref(0)
const packetMenuRow = ref<RtRow | HtRow | null>(null)

function togglePacketMenu(event: MouseEvent, row: RtRow | HtRow) {
  packetMenuRow.value = row
  packetMenuX.value = event.clientX
  packetMenuY.value = event.clientY
  packetMenuVisible.value = !packetMenuVisible.value
}

function closePacketMenu() {
  packetMenuVisible.value = false
  packetMenuRow.value = null
}

function openPacketPopup(row: RtRow | HtRow | null) {
  closePacketMenu()
  if (row) {
    packetPopupData.value = { srcIp: row.srcIp, dstIp: row.dstIp }
    packetPopupVisible.value = true
  }
}

function openPacketPlayPopup(row: RtRow | HtRow | null) {
  closePacketMenu()
  packetPlayVisible.value = true
}

function downloadPacket(row: RtRow | HtRow | null) {
  closePacketMenu()
  ElMessage.info('报文下载（Mock）')
}

function downloadContent(row: RtRow | HtRow | null) {
  closePacketMenu()
  ElMessage.info('内容下载（Mock）')
}

function queryTailPacket(row: RtRow | HtRow | null) {
  closePacketMenu()
  ElMessage.info('尾包查询（Mock）')
}

function stitchSession(row: RtRow | HtRow | null) {
  closePacketMenu()
  ElMessage.info('会话缝合（Mock）')
}

// 点击外部关闭菜单
if (typeof document !== 'undefined') {
  document.addEventListener('click', () => {
    if (packetMenuVisible.value) closePacketMenu()
  })
}

// ── 会话诊断弹窗 ──
const sessionDiagVisible = ref(false)
const sessionDiagData = ref({ ip: '', direction: 'src' })

function openSessionDiagPopup(ip: string, direction: 'src' | 'dst') {
  sessionDiagData.value = { ip, direction }
  sessionDiagVisible.value = true
}

// ── 报文分析弹窗 ──
const packetPopupVisible = ref(false)
const packetPopupData = ref<{ srcIp: string; dstIp: string } | null>(null)

// 报文分析弹窗内部数据
const paFilter = ref('')
const paTopN = ref('100')
const paSelectedPkt = ref(1)

interface PaPacket {
  no: number; time: string; srcAddr: string; dstAddr: string
  protocol: string; length: number; detail: string
}

const paPacketData = ref<PaPacket[]>([
  { no: 1, time: '0.000000', srcAddr: '101.6.6.2', dstAddr: '140.179.3.145', protocol: 'TCP', length: 74, detail: '43718 --> 3306 [SYN] Seq=0 Win=29200 Len=0 MSS=1460 TSval=561234666 TSecr=0 WS=128' },
  { no: 2, time: '0.002882', srcAddr: '140.179.3.145', dstAddr: '101.6.6.2', protocol: 'TCP', length: 74, detail: '3306 --> 43718 [SYN, ACK] Seq=0 Ack=1 Win=62643 Len=0 MSS=1460 TSval=3446637919 TSecr=561234666 WS=128' },
  { no: 3, time: '0.003022', srcAddr: '101.6.6.2', dstAddr: '140.179.3.145', protocol: 'TCP', length: 66, detail: '43718 --> 3306 [ACK] Seq=1 Ack=1 Win=29312 Len=0 TSval=561234669 TSecr=3446637919' },
  { no: 4, time: '0.005977', srcAddr: '140.179.3.145', dstAddr: '101.6.6.2', protocol: 'MySQL', length: 148, detail: 'Server Greeting proto=10 version=5.7.44-log' },
  { no: 5, time: '0.006347', srcAddr: '101.6.6.2', dstAddr: '140.179.3.145', protocol: 'TCP', length: 66, detail: '43718 --> 3306 [ACK] Seq=1 Ack=83 Win=29312 Len=0 TSval=561234672 TSecr=3446637922' },
  { no: 6, time: '0.006395', srcAddr: '101.6.6.2', dstAddr: '140.179.3.145', protocol: 'MySQL', length: 331, detail: 'Login Request user=thu_backup_admin_user db=thu_backup' },
])

interface PaTreeItem {
  label: string; expanded: boolean; children?: PaTreeItem[]
}

const paTreeData = ref<PaTreeItem[]>([
  { label: 'Frame 1: 74 bytes on wire (592 bits), 74 bytes captured (592 bits)', expanded: false },
  { label: 'Ethernet II, Src: 30:80:9b:8d:90:01 (30:80:9b:8d:90:01), Dst: 54:2b:de:6d:bc:0e (54:2b:de:6d:bc:0e)', expanded: false },
  { label: 'Internet Protocol Version 4, Src: 101.6.6.2, Dst: 140.179.3.145', expanded: false },
  { label: 'Transmission Control Protocol, Src Port: 43718, Dst Port: 3306, Seq: 0, Len: 0', expanded: true },
])

interface PaHexRow {
  offset: string; bytes: string; ascii: string
}

const paHexData = ref<PaHexRow[]>([
  { offset: '0000', bytes: '54 2b de 6d  bc 0e 30 80  9b 8d 90 01  08 00 45 00', ascii: 'T+.m..0.......E.' },
  { offset: '0010', bytes: '00 3c bf 79  40 00 3d 06  82 f6 65 06  06 02 8c b3', ascii: '.<.y@.=...e.....' },
  { offset: '0020', bytes: '03 91 aa c6  0c ea 39 9d  fb 5d 00 00  00 00 a0 02', ascii: '......9..]......' },
  { offset: '0030', bytes: '72 10 0c 9b  00 00 02 04  05 b4 01 01  08 0a 21 73', ascii: 'r.............!s' },
  { offset: '0040', bytes: 'c2 ea 00 00  00 00 01 03  03 07', ascii: '...........' },
])

// ── 报文播放弹窗 ──
const packetPlayVisible = ref(false)

// ── 历史概况详情弹窗 ──
const hovDetailVisible = ref(false)
const hovDetailFilter = reactive({
  mac: '', srcIpType: 'any', srcPort: '', dstIpType: 'any', dstPort: '',
  userName: '', userGroup: '', displayName: '', sqlCmd: '',
  timeRange: '2026-07-15 09:28:54 - 2026-07-15 09:43:54'
})

const hovDetailSrcIpData = ref<HovRow[]>([
  { ip: '101.6.10.19', userName: '', total: 937, query: 909, update: 10, delete: 0, insert: 4, create: 0, load: 0 },
])

const hovDetailDstIpData = ref<HovRow[]>([
  { ip: '101.6.215.38', userName: '', total: 937, query: 909, update: 10, delete: 0, insert: 4, create: 0, load: 0 },
])

const hovDetailUserData = ref<HovRow[]>([
  { ip: '', userName: 'root', total: 937, query: 909, update: 10, delete: 0, insert: 4, create: 0, load: 0 },
])

const hovDetailSrcIpPage = ref(1)
const hovDetailSrcIpPages = ref(1)
const hovDetailDstIpPage = ref(1)
const hovDetailDstIpPages = ref(1)
const hovDetailUserPage = ref(1)
const hovDetailUserPages = ref(1)

function openHovDetailPopup(ip: string, type: 'src' | 'dst') {
  hovDetailVisible.value = true
}

function doHovDetailSearch() { ElMessage.success('搜索完成（Mock）') }
function resetHovDetailFilters() {
  hovDetailFilter.mac = ''; hovDetailFilter.srcIpType = 'any'; hovDetailFilter.srcPort = ''
  hovDetailFilter.dstIpType = 'any'; hovDetailFilter.dstPort = ''; hovDetailFilter.userName = ''
  hovDetailFilter.userGroup = ''; hovDetailFilter.displayName = ''; hovDetailFilter.sqlCmd = ''
  hovDetailFilter.timeRange = '2026-07-15 09:28:54 - 2026-07-15 09:43:54'
}
</script>

<style scoped>
/* 概况 KPI */
.ov-kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 12px;
}

.ov-kpi-card {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 20px;
  text-align: center;
}

.ov-kpi-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.ov-kpi-label {
  font-size: 12px;
  color: #909399;
}

/* 概况图表 */
.ov-chart-row {
  padding: 0 12px 12px;
}

.ov-chart-panel {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 16px;
}

.ov-chart-title {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}

/* 迷你表格网格 */
.ov-mini-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 12px;
  padding: 0 12px 12px;
}

.ov-mini-panel {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
}

.ov-mini-head {
  padding: 10px 14px;
  border-bottom: 1px solid #ebeef5;
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}

.ov-mini-title {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}

/* 数据库位置 */
.db-location {
  display: inline-flex;
  align-items: center;
  font-size: 12px;
}

/* 状态样式 */
.db-status-success {
  color: #67c23a;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
}

.db-status-fail {
  color: #f56c6c;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
}

/* 排序图标 */
.sort-icon {
  font-size: 12px;
  color: #c0c4cc;
  vertical-align: middle;
  cursor: pointer;
}

/* 数据包下拉菜单 */
.packet-context-menu {
  position: fixed;
  z-index: 3000;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  min-width: 140px;
  padding: 4px 0;
}

.packet-menu-item {
  padding: 8px 16px;
  font-size: 13px;
  color: #303133;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.packet-menu-item:hover {
  background: #ecf5ff;
  color: #409eff;
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

/* 筛选区域右侧按钮 */
.tdh-filter-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 详情弹窗 */
:deep(.hd-detail-dialog .el-dialog__body) {
  padding: 12px 20px;
}

/* 实时概况 - 上半部分网格 */
.db-ov-top-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 12px;
}

/* KPI 卡片网格 */
.db-ov-kpi-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.db-ov-kpi-card {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px 16px;
  text-align: center;
}

.db-ov-kpi-value {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.db-ov-kpi-label {
  font-size: 12px;
  color: #909399;
}

/* 饼图网格 */
.db-ov-pie-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.db-ov-pie-panel {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px;
}

.db-ov-pie-title {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

/* 折线图网格 */
.db-ov-line-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 0 12px 12px;
}

.db-ov-line-panel {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px;
}

.db-ov-line-title {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.db-ov-line-stats {
  display: flex;
  gap: 16px;
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.db-ov-line-stats span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* 历史概况 - 三列表格网格 */
.db-hov-table-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 12px;
}

.db-hov-table-panel {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px;
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.db-hov-table-panel .ou-table {
  flex: 1;
}

.db-hov-table-panel .ou-footer {
  margin-top: auto;
  padding-top: 8px;
}

/* 报文分析弹窗样式 */
.packet-analysis-dialog :deep(.el-dialog__header) {
  padding: 12px 20px;
  border-bottom: 1px solid #ebeef5;
}

.packet-analysis-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.pa-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pa-header-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.pa-header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.pa-protocol {
  font-size: 13px;
  color: #606266;
}

.pa-protocol strong {
  color: #409eff;
  font-weight: 600;
}

.pa-action-link {
  font-size: 13px;
  color: #409eff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.pa-action-link:hover {
  color: #66b1ff;
  text-decoration: underline;
}

.pa-tabs {
  display: flex;
  border-bottom: 1px solid #ebeef5;
  background: #fafafa;
  padding: 0 12px;
}

.pa-tab {
  padding: 10px 16px;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}

.pa-tab.active {
  color: #409eff;
  border-bottom-color: #409eff;
  background: #fff;
}

.pa-tab:hover:not(.active) {
  color: #409eff;
}

.pa-filter-bar {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #ebeef5;
  gap: 8px;
}

.pa-filter-input {
  flex: 1;
  height: 28px;
  padding: 0 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 12px;
  outline: none;
}

.pa-filter-input:focus {
  border-color: #409eff;
}

.pa-filter-select {
  height: 28px;
  padding: 0 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 12px;
  outline: none;
  background: #fff;
}

.pa-table-wrap {
  max-height: 200px;
  overflow-y: auto;
  border-bottom: 1px solid #ebeef5;
}

.pa-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.pa-table thead {
  background: #fafafa;
  position: sticky;
  top: 0;
  z-index: 1;
}

.pa-table th {
  padding: 8px 12px;
  text-align: left;
  font-weight: 600;
  color: #303133;
  border-bottom: 1px solid #ebeef5;
  white-space: nowrap;
}

.pa-table td {
  padding: 6px 12px;
  border-bottom: 1px solid #f0f0f0;
  color: #606266;
}

.pa-table tbody tr {
  cursor: pointer;
}

.pa-table tbody tr:hover {
  background: #f5f7fa;
}

.pa-row-selected {
  background: #ecf5ff !important;
}

.pa-row-selected td {
  color: #409eff;
}

.pa-tree-wrap {
  padding: 8px 12px;
  border-bottom: 1px solid #ebeef5;
  max-height: 150px;
  overflow-y: auto;
}

.pa-tree-item {
  padding: 4px 0;
  font-size: 12px;
  color: #606266;
  display: flex;
  align-items: flex-start;
  gap: 4px;
}

.pa-tree-toggle {
  cursor: pointer;
  width: 16px;
  text-align: center;
  color: #909399;
  flex-shrink: 0;
}

.pa-tree-toggle:hover {
  color: #409eff;
}

.pa-tree-label {
  flex: 1;
  word-break: break-all;
}

.pa-hex-wrap {
  padding: 12px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  background: #fafafa;
  max-height: 150px;
  overflow-y: auto;
}

.pa-hex-row {
  display: flex;
  gap: 16px;
  padding: 2px 0;
  line-height: 1.6;
}

.pa-hex-offset {
  color: #909399;
  min-width: 50px;
}

.pa-hex-bytes {
  color: #606266;
  flex: 1;
  letter-spacing: 1px;
}

.pa-hex-ascii {
  color: #67c23a;
  min-width: 120px;
}

/* SQL分析->历史会话弹窗 */
.sql-history-dialog :deep(.el-dialog__header) {
  padding: 12px 20px;
  border-bottom: 1px solid #ebeef5;
}

.sql-history-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.sql-his-header {
  display: flex;
  align-items: center;
}

.sql-his-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

/* 可点击链接 */
.tid-link {
  color: #409eff;
  cursor: pointer;
  text-decoration: underline;
}

.tid-link:hover {
  color: #66b1ff;
}

/* SQL分析 KPI 卡片 */
.sa-kpi-row {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 8px;
  padding: 12px;
}

.sa-kpi-card {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px;
  text-align: center;
}

.sa-kpi-value {
  font-size: 22px;
  font-weight: 700;
  color: #303133;
  line-height: 1.4;
}

.sa-kpi-label {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

/* SQL分析 折线图区域 */
.sa-charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 0 12px;
  margin-bottom: 12px;
}

.sa-chart-panel {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px;
}

.sa-chart-title {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #303133;
  display: flex;
  align-items: center;
}

/* SQL分析 子Tab */
.sa-subtabs {
  display: flex;
  border-bottom: 1px solid #ebeef5;
  background: #fafafa;
  padding: 0 12px;
  margin: 0 12px 12px 12px;
  border-top: 1px solid #e4e7ed;
}

.sa-subtab {
  padding: 10px 16px;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}

.sa-subtab.active {
  color: #409eff;
  border-bottom-color: #409eff;
  background: #fff;
}

.sa-subtab:hover:not(.active) {
  color: #409eff;
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
  cursor: pointer;
  vertical-align: middle;
  margin-left: 2px;
}

.sort-icon:hover {
  color: #409eff;
}
</style>
