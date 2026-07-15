<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav" role="tablist" aria-label="其他审计">
        <button v-for="t in protoTabs" :key="t.key" type="button" class="nv-tab" :class="{ active: activeProto === t.key }" role="tab" @click="activeProto = t.key">{{ t.label }}</button>
      </div>
    </div>
    <div class="nv-tabs-body">
      <div v-for="t in protoTabs" :key="t.key" class="nv-tab-panel oa-proto-panel" :class="{ active: activeProto === t.key }">
        <div class="oa-sub-header">
          <div class="cbm-pc-subtabs">
            <button v-for="s in subTabs" :key="s.key" type="button" class="cbm-pc-subtab" :class="{ active: activeSub[t.key] === s.key }" @click="activeSub[t.key] = s.key">{{ s.label }}</button>
          </div>
        </div>

        <!-- ============== 实时会话 ============== -->
        <div v-for="s in subTabs" :key="s.key" class="oa-sub-panel" :class="{ active: activeSub[t.key] === s.key }">
          <div v-if="s.key === 'realtime-sessions'" class="oa-sub-content">
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
                  <span class="ou-toolbar-label">源IP</span>
                  <select class="ou-toolbar-select" v-model="rtFilter.srcIpType">
                    <option value="any">任意IP</option>
                    <option value="single">单个IP</option>
                  </select>
                </label>
                <label class="tdh-filter-field">
                  <span class="ou-toolbar-label">源端口</span>
                  <input class="ou-toolbar-input tdh-filter-input" v-model="rtFilter.srcPort" placeholder="" />
                </label>
                <label class="tdh-filter-field">
                  <span class="ou-toolbar-label">目标IP</span>
                  <select class="ou-toolbar-select" v-model="rtFilter.dstIpType">
                    <option value="any">任意IP</option>
                    <option value="single">单个IP</option>
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
                    <th>请求时间 <el-icon class="sort-icon"><Sort /></el-icon></th>
                    <th>MAC</th>
                    <th>用户名称</th>
                    <th>源IP</th>
                    <th>目标IP</th>
                    <th style="min-width:280px">SYSLOG</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, idx) in rtPageData" :key="idx">
                    <td>{{ (rtPage - 1) * rtPageSize + idx + 1 }}</td>
                    <td style="white-space:nowrap">{{ row.opTime }}</td>
                    <td style="font-size:12px">{{ row.mac }}</td>
                    <td>{{ row.userName }}</td>
                    <td><span class="tid-link" @click="openSyslogPopup(row)">{{ row.srcIp }}</span></td>
                    <td>{{ row.dstIp }}</td>
                    <td style="font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:350px" :title="row.syslog">{{ row.syslog }}</td>
                  </tr>
                  <tr v-if="rtData.length === 0">
                    <td colspan="7" class="ou-empty">无数据</td>
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

          <!-- ============== 历史会话 ============== -->
          <div v-else-if="s.key === 'history-sessions'" class="oa-sub-content">
            <!-- 筛选区域 -->
            <div class="tdh-filters">
              <div class="tdh-filter-row">
                <label class="tdh-filter-field">
                  <span class="ou-toolbar-label">MAC</span>
                  <select class="ou-toolbar-select" v-model="hsFilter.mac">
                    <option value="">任意</option>
                  </select>
                </label>
                <label class="tdh-filter-field">
                  <span class="ou-toolbar-label">源IP</span>
                  <select class="ou-toolbar-select" v-model="hsFilter.srcIpType">
                    <option value="any">任意IP</option>
                  </select>
                </label>
                <label class="tdh-filter-field">
                  <span class="ou-toolbar-label">源端口</span>
                  <input class="ou-toolbar-input tdh-filter-input" v-model="hsFilter.srcPort" placeholder="80 / 8000-8080" />
                </label>
                <label class="tdh-filter-field">
                  <span class="ou-toolbar-label">目标IP</span>
                  <select class="ou-toolbar-select" v-model="hsFilter.dstIpType">
                    <option value="any">任意IP</option>
                  </select>
                </label>
                <label class="tdh-filter-field">
                  <span class="ou-toolbar-label">目标端口</span>
                  <input class="ou-toolbar-input tdh-filter-input" v-model="hsFilter.dstPort" placeholder="80 / 8000-8080" />
                </label>
                <label class="tdh-filter-field">
                  <span class="ou-toolbar-label">用户名</span>
                  <input class="ou-toolbar-input tdh-filter-input" v-model="hsFilter.userName" placeholder="" />
                </label>
                <label class="tdh-filter-field">
                  <span class="ou-toolbar-label">用户组</span>
                  <select class="ou-toolbar-select" v-model="hsFilter.userGroup">
                    <option value="">任意</option>
                  </select>
                </label>
                <label class="tdh-filter-field">
                  <span class="ou-toolbar-label">用户名称</span>
                  <input class="ou-toolbar-input tdh-filter-input" v-model="hsFilter.displayName" placeholder="" />
                </label>
                <label class="tdh-filter-field">
                  <span class="ou-toolbar-label">关键字</span>
                  <input class="ou-toolbar-input tdh-filter-input" v-model="hsFilter.keyword" placeholder="" />
                </label>
              </div>
              <div class="tdh-filter-row">
                <label class="tdh-filter-field">
                  <span class="ou-toolbar-label">链路</span>
                  <select class="ou-toolbar-select" v-model="hsFilter.link">
                    <option value="">任意</option>
                  </select>
                </label>
                <label class="tdh-filter-field tdh-filter-time">
                  <span class="ou-toolbar-label">时间范围</span>
                  <input class="ou-toolbar-input tdh-time-range" v-model="hsFilter.timeRange" />
                </label>
                <button class="ou-search-btn" @click="doHsSearch">
                  <el-icon><Search /></el-icon>
                </button>
                <button class="secondary td-reset-btn" @click="resetHsFilters">重置</button>
                <div class="tdh-filter-right">
                  <button style="border:none;background:none;cursor:pointer;color:#409eff;font-size:13px;margin-right:8px" @click="doHsExport">
                    <el-icon><Download /></el-icon> 导出
                  </button>
                  <button style="border:none;background:none;cursor:pointer;color:#409eff;font-size:13px" @click="doHsChart">
                    <el-icon><DataAnalysis /></el-icon> 图表
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
                    <th>请求时间 <el-icon class="sort-icon"><Sort /></el-icon></th>
                    <th>MAC</th>
                    <th>用户名称</th>
                    <th>源IP</th>
                    <th>目标IP</th>
                    <th style="min-width:280px">SYSLOG</th>
                    <th>链路</th>
                    <th>协议等级</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, idx) in hsPageData" :key="idx">
                    <td>{{ (hsPage - 1) * hsPageSize + idx + 1 }}</td>
                    <td style="white-space:nowrap">{{ row.opTime }}</td>
                    <td style="font-size:12px">{{ row.mac }}</td>
                    <td>{{ row.userName }}</td>
                    <td><span class="tid-link" @click="openSyslogPopup(row)">{{ row.srcIp }}</span></td>
                    <td>{{ row.dstIp }}</td>
                    <td style="font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:350px" :title="row.syslog">{{ row.syslog }}</td>
                    <td style="font-size:12px">{{ row.link }}</td>
                    <td style="font-size:12px">{{ row.protoLevel }}</td>
                  </tr>
                  <tr v-if="hsData.length === 0">
                    <td colspan="9" class="ou-empty">无数据</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="ou-footer">
              <div class="ou-footer-left">
                <div class="ou-pager">
                  <button class="ou-page-btn" @click="hsPage > 1 && hsPage--">‹</button>
                  <button v-for="p in hsPages" :key="p" class="ou-page-btn" :class="{ active: p === hsPage }" @click="hsPage = p">{{ p }}</button>
                  <button class="ou-page-btn" @click="hsPage < hsPages && hsPage++">›</button>
                  <span style="margin-left:8px;font-size:12px;color:#909399">到第</span>
                  <input class="ou-page-goto-input" v-model.number="hsGotoPage" style="width:36px;height:24px;text-align:center;border:1px solid #dcdfe6;border-radius:3px;font-size:12px" />
                  <span style="font-size:12px;color:#909399">页</span>
                  <button class="ou-page-goto-btn" @click="goToHsPage" style="height:24px;padding:0 8px;border:1px solid #dcdfe6;border-radius:3px;background:#fff;font-size:12px;cursor:pointer">确定</button>
                </div>
              </div>
              <div class="ou-footer-right">
                <span>共 {{ hsData.length }} 条</span>
                <label class="ou-page-size">
                  <select v-model="hsPageSize" style="height:24px;border:1px solid #dcdfe6;border-radius:3px;font-size:12px;padding:0 4px">
                    <option :value="100">100 条/页</option>
                  </select>
                </label>
              </div>
            </div>
          </div>

          <!-- ============== 历史概况 ============== -->
          <div v-else-if="s.key === 'history-overview'" class="oa-sub-content">
            <!-- 筛选区域 -->
            <div class="tdh-filters">
              <div class="tdh-filter-row">
                <label class="tdh-filter-field">
                  <span class="ou-toolbar-label">MAC</span>
                  <select class="ou-toolbar-select" v-model="hoFilter.mac">
                    <option value="">任意</option>
                  </select>
                </label>
                <label class="tdh-filter-field">
                  <span class="ou-toolbar-label">源IP</span>
                  <select class="ou-toolbar-select" v-model="hoFilter.srcIpType">
                    <option value="any">任意IP</option>
                  </select>
                </label>
                <label class="tdh-filter-field">
                  <span class="ou-toolbar-label">源端口</span>
                  <input class="ou-toolbar-input tdh-filter-input" v-model="hoFilter.srcPort" placeholder="80 / 8000-8080" />
                </label>
                <label class="tdh-filter-field">
                  <span class="ou-toolbar-label">目标IP</span>
                  <select class="ou-toolbar-select" v-model="hoFilter.dstIpType">
                    <option value="any">任意IP</option>
                  </select>
                </label>
                <label class="tdh-filter-field">
                  <span class="ou-toolbar-label">目标端口</span>
                  <input class="ou-toolbar-input tdh-filter-input" v-model="hoFilter.dstPort" placeholder="80 / 8000-8080" />
                </label>
                <label class="tdh-filter-field">
                  <span class="ou-toolbar-label">协议等级</span>
                  <select class="ou-toolbar-select" v-model="hoFilter.protoLevel">
                    <option value="">任意</option>
                  </select>
                </label>
              </div>
              <div class="tdh-filter-row">
                <label class="tdh-filter-field">
                  <span class="ou-toolbar-label">用户组</span>
                  <select class="ou-toolbar-select" v-model="hoFilter.userGroup">
                    <option value="">任意</option>
                  </select>
                </label>
                <label class="tdh-filter-field">
                  <span class="ou-toolbar-label">用户名称</span>
                  <input class="ou-toolbar-input tdh-filter-input" v-model="hoFilter.userName" placeholder="" />
                </label>
                <label class="tdh-filter-field">
                  <span class="ou-toolbar-label">关键字</span>
                  <input class="ou-toolbar-input tdh-filter-input" v-model="hoFilter.keyword" placeholder="" />
                </label>
                <label class="tdh-filter-field tdh-filter-time">
                  <span class="ou-toolbar-label">时间范围</span>
                  <input class="ou-toolbar-input tdh-time-range" v-model="hoFilter.timeRange" />
                </label>
                <button class="ou-search-btn" @click="doHoSearch">
                  <el-icon><Search /></el-icon>
                </button>
                <button class="secondary td-reset-btn" @click="resetHoFilters">重置</button>
                <div class="tdh-filter-right">
                  <button style="border:none;background:none;cursor:pointer;color:#409eff;font-size:13px" @click="doHoExport">
                    <el-icon><Download /></el-icon> 导出
                  </button>
                </div>
              </div>
            </div>

            <!-- 概况内容 -->
            <div class="oa-overview-content">
              <!-- 左侧图表 -->
              <div class="oa-overview-left">
                <section class="tid-chart-panel">
                  <div class="tid-chart-head">
                    <h3 class="tid-mini-title">
                      <el-icon style="margin-right:4px"><DataAnalysis /></el-icon> 柱20源IP
                    </h3>
                  </div>
                  <div class="tid-chart-body">
                    <div class="to-chart-plot">
                      <v-chart :option="srcIpBarOption" autoresize style="width:100%;height:240px" />
                    </div>
                  </div>
                </section>
                <section class="tid-chart-panel">
                  <div class="tid-chart-head">
                    <h3 class="tid-mini-title">
                      <el-icon style="margin-right:4px"><DataAnalysis /></el-icon> 柱20目标ISP
                    </h3>
                  </div>
                  <div class="tid-chart-body">
                    <div class="to-chart-plot">
                      <v-chart :option="dstIspBarOption" autoresize style="width:100%;height:240px" />
                    </div>
                  </div>
                </section>
              </div>

              <!-- 右侧表格 -->
              <div class="oa-overview-right">
                <section class="tid-mini-panel">
                  <div class="tid-mini-head">
                    <h3 class="tid-mini-title">源IP</h3>
                  </div>
                  <div class="ou-table-wrap tid-mini-table-wrap">
                    <table class="ou-table tid-mini-table">
                      <thead>
                        <tr>
                          <th class="col-idx">序号</th>
                          <th>源IP</th>
                          <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(row, idx) in hoSrcIpData" :key="idx">
                          <td class="col-idx">{{ idx + 1 }}</td>
                          <td><span class="tid-link" @click="openSyslogOverviewPopup(row.ip)">{{ row.ip }}</span></td>
                          <td class="ou-num">{{ row.total }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div class="ou-footer">
                    <div class="ou-pager">
                      <button class="ou-page-btn" @click="hoSrcIpPage > 1 && hoSrcIpPage--">‹</button>
                      <button class="ou-page-btn active">1</button>
                      <button class="ou-page-btn" @click="hoSrcIpPage < 1 && hoSrcIpPage++">›</button>
                    </div>
                    <span>共 {{ hoSrcIpData.length }} 条</span>
                  </div>
                </section>
                <section class="tid-mini-panel">
                  <div class="tid-mini-head">
                    <h3 class="tid-mini-title">目标IP</h3>
                  </div>
                  <div class="ou-table-wrap tid-mini-table-wrap">
                    <table class="ou-table tid-mini-table">
                      <thead>
                        <tr>
                          <th class="col-idx">序号</th>
                          <th>目标IP</th>
                          <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(row, idx) in hoDstIpData" :key="idx">
                          <td class="col-idx">{{ idx + 1 }}</td>
                          <td><span class="tid-link" @click="openSyslogOverviewPopup(row.ip)">{{ row.ip }}</span></td>
                          <td class="ou-num">{{ row.total }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div class="ou-footer">
                    <div class="ou-pager">
                      <button class="ou-page-btn" @click="hoDstIpPage > 1 && hoDstIpPage--">‹</button>
                      <button class="ou-page-btn active">1</button>
                      <button class="ou-page-btn" @click="hoDstIpPage < 1 && hoDstIpPage++">›</button>
                    </div>
                    <span>共 {{ hoDstIpData.length }} 条</span>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============== Syslog详情弹窗 ============== -->
    <el-dialog v-model="syslogDetailVisible" width="98%" top="2vh" destroy-on-close class="syslog-detail-dialog">
      <template #header>
        <div class="syslog-detail-header">
          <span class="syslog-detail-title">Syslog审计</span>
        </div>
      </template>

      <!-- 弹窗内筛选 -->
      <div class="tdh-filters" style="background:#f5f7fa;border-radius:4px;margin-bottom:12px;padding:12px">
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
              <option value="single">单个IP</option>
            </select>
          </label>
          <label class="tdh-filter-field" v-if="popFilter.srcIpType === 'single'">
            <input class="ou-toolbar-input tdh-filter-input" v-model="popFilter.srcIp" placeholder="192.168.32.2" />
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">源端口</span>
            <input class="ou-toolbar-input tdh-filter-input" v-model="popFilter.srcPort" placeholder="80 / 8000-8080" />
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">目标IP</span>
            <select class="ou-toolbar-select" v-model="popFilter.dstIpType">
              <option value="any">任意IP</option>
              <option value="single">单个IP</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">目标端口</span>
            <input class="ou-toolbar-input tdh-filter-input" v-model="popFilter.dstPort" placeholder="80 / 8000-8080" />
          </label>
        </div>
        <div class="tdh-filter-row">
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">协议等级</span>
            <select class="ou-toolbar-select" v-model="popFilter.protoLevel">
              <option value="">任意</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">用户组</span>
            <select class="ou-toolbar-select" v-model="popFilter.userGroup">
              <option value="">任意</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">用户名称</span>
            <input class="ou-toolbar-input tdh-filter-input" v-model="popFilter.userName" placeholder="" />
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">关键字</span>
            <input class="ou-toolbar-input tdh-filter-input" v-model="popFilter.keyword" placeholder="" />
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">链路</span>
            <select class="ou-toolbar-select" v-model="popFilter.link">
              <option value="">任意</option>
            </select>
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
            <button style="border:none;background:none;cursor:pointer;color:#409eff;font-size:13px;margin-right:8px" @click="doPopExport">
              <el-icon><Download /></el-icon> 导出
            </button>
            <button style="border:none;background:none;cursor:pointer;color:#409eff;font-size:13px" @click="doPopChart">
              <el-icon><DataAnalysis /></el-icon> 图表
            </button>
          </div>
        </div>
      </div>

      <!-- 弹窗数据表格 -->
      <div class="ou-table-wrap" style="flex:1;min-height:300px;max-height:500px">
        <table class="ou-table audit-table">
          <thead>
            <tr>
              <th style="width:40px">序号</th>
              <th>请求时间 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>MAC</th>
              <th>用户名称</th>
              <th>源IP</th>
              <th>目标IP</th>
              <th style="min-width:280px">SYSLOG</th>
              <th>链路</th>
              <th>协议等级</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in popPageData" :key="idx">
              <td>{{ (popPage - 1) * popPageSize + idx + 1 }}</td>
              <td style="white-space:nowrap">{{ row.opTime }}</td>
              <td style="font-size:12px">{{ row.mac }}</td>
              <td>{{ row.userName }}</td>
              <td><span class="tid-link">{{ row.srcIp }}</span></td>
              <td>{{ row.dstIp }}</td>
              <td style="font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:350px" :title="row.syslog">{{ row.syslog }}</td>
              <td style="font-size:12px">{{ row.link }}</td>
              <td style="font-size:12px">{{ row.protoLevel }}</td>
            </tr>
            <tr v-if="popData.length === 0">
              <td colspan="9" class="ou-empty">无数据</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="ou-footer">
        <div class="ou-footer-left">
          <div class="ou-pager">
            <button class="ou-page-btn" @click="popPage > 1 && popPage--">‹</button>
            <button v-for="p in popPages" :key="p" class="ou-page-btn" :class="{ active: p === popPage }" @click="popPage = p">{{ p }}</button>
            <button class="ou-page-btn" @click="popPage < popPages && popPage++">›</button>
            <span style="margin-left:8px;font-size:12px;color:#909399">到第</span>
            <input class="ou-page-goto-input" v-model.number="popGotoPage" style="width:36px;height:24px;text-align:center;border:1px solid #dcdfe6;border-radius:3px;font-size:12px" />
            <span style="font-size:12px;color:#909399">页</span>
            <button class="ou-page-goto-btn" @click="goToPopPage" style="height:24px;padding:0 8px;border:1px solid #dcdfe6;border-radius:3px;background:#fff;font-size:12px;cursor:pointer">确定</button>
          </div>
        </div>
        <div class="ou-footer-right">
          <span>共 {{ popData.length }} 条</span>
          <label class="ou-page-size">
            <select v-model="popPageSize" style="height:24px;border:1px solid #dcdfe6;border-radius:3px;font-size:12px;padding:0 4px">
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
import { BarChart, LineChart } from 'echarts/charts'
import {
  TitleComponent, TooltipComponent, LegendComponent, GridComponent
} from 'echarts/components'
import { Search, Sort, DataAnalysis, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import './nv-shared.css'

use([CanvasRenderer, BarChart, LineChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent])

const protoTabs = [
  { key: 'syslog', label: 'Syslog审计' },
  { key: 'ssh', label: 'SSH审计' },
  { key: 'tls', label: 'TLS审计' },
  { key: 'netbios', label: 'NETBIOS' },
]
const subTabs = [
  { key: 'realtime-sessions', label: '实时会话' },
  { key: 'history-sessions', label: '历史会话' },
  { key: 'history-overview', label: '历史概况' },
]
const activeProto = ref('syslog')
const activeSub = reactive<Record<string, string>>(Object.fromEntries(protoTabs.map(p => [p.key, 'realtime-sessions'])))

// ── 实时会话 ──
const rtFilter = reactive({ mac: '', srcIpType: 'any', srcPort: '', dstIpType: 'any', userGroup: '', userName: '' })

interface SyslogRow {
  opTime: string; mac: string; userName: string
  srcIp: string; dstIp: string; syslog: string
  link?: string; protoLevel?: string
}

const rtData = ref<SyslogRow[]>([])
const rtPage = ref(1)
const rtPageSize = ref(100)
const rtGotoPage = ref(1)
const rtPages = computed(() => Math.max(1, Math.ceil(rtData.value.length / rtPageSize.value)))
const rtPageData = computed(() => rtData.value.slice((rtPage.value - 1) * rtPageSize.value, rtPage.value * rtPageSize.value))

function generateRtData(): SyslogRow[] {
  const rows: SyslogRow[] = []
  const baseTime = new Date('2026-07-15T11:22:24')
  const userNames = ['root', 'admin', 'thu_backup...', 'user1', 'kyy_data', 'modeltest']
  const mac = '30-80-8b-8d-90-01'
  const syslogs = [
    '<189>Jul 15 11:22:24 2026 LZJ-FZ-S12504X-AF-123, 124-IBF %%10LLD...',
    '<190>Jul 15 11:22:21 2026 LZJ-FZ-MGT-S5130X-125, 126-IBF %%10LLD...',
    '<187>Jul 15 11:22:20 2026 LZJ-FZ-S12504X-AF-123, 124-IBF %%10FNL...',
    '<191>Jul 15 11:22:19 2026 LZJ-FZ-MGT-S5130X-125, 126-IBF %%10FNL...',
    '<188>Jul 15 11:22:19 2026 LZJ-FZ-S12504X-AF-123, 124-IBF %%10FRA...',
    '<189>Jul 15 11:22:18 2026 LZJ-FZ-S12504X-AF-123, 124-IBF %%10FLA...',
    '<187>Jul 15 11:22:17 2026 LZJ-FZ-MGT-S5130X-125, 126-IBF %%10FLA...',
    '<190>Jul 15 11:22:16 2026 LZJ-FZ-S12504X-AF-123, 124-IBF %%10FRA...',
    '<191>Jul 15 11:22:15 2026 LZJ-FZ-MGT-S5130X-125, 126-IBF %%10FRA...',
    '<188>Jul 15 11:22:14 2026 LZJ-FZ-S12504X-AF-123, 124-IBF %%10FLA...',
  ]

  for (let i = 0; i < 28; i++) {
    const time = new Date(baseTime.getTime() - i * 1000)
    const h = String(time.getHours()).padStart(2, '0')
    const m = String(time.getMinutes()).padStart(2, '0')
    const s = String(time.getSeconds()).padStart(2, '0')
    rows.push({
      opTime: `2026-07-15 ${h}:${m}:${s}`,
      mac: mac,
      userName: userNames[i % userNames.length],
      srcIp: '192.168.32.2:60736',
      dstIp: i % 2 === 0 ? '172.16.198.4:514' : '172.20.0.3:514',
      syslog: syslogs[i % syslogs.length],
    })
  }
  return rows
}

rtData.value = generateRtData()

function doRtSearch() { ElMessage.success('搜索完成（Mock）') }
function resetRtFilters() {
  rtFilter.mac = ''; rtFilter.srcIpType = 'any'; rtFilter.srcPort = ''
  rtFilter.dstIpType = 'any'; rtFilter.userGroup = ''; rtFilter.userName = ''
}
function goToRtPage() {
  const p = rtGotoPage.value
  if (p >= 1 && p <= rtPages.value) rtPage.value = p
}

// ── 历史会话 ──
const hsFilter = reactive({
  mac: '', srcIpType: 'any', srcPort: '', dstIpType: 'any', dstPort: '',
  userName: '', userGroup: '', displayName: '', keyword: '', link: '',
  timeRange: '2026-07-15 11:02:28 - 2026-07-15 11:17:28'
})

const hsData = ref<SyslogRow[]>([])
const hsPage = ref(1)
const hsPageSize = ref(100)
const hsGotoPage = ref(1)
const hsPages = computed(() => Math.max(1, Math.ceil(hsData.value.length / hsPageSize.value)))
const hsPageData = computed(() => hsData.value.slice((hsPage.value - 1) * hsPageSize.value, hsPage.value * hsPageSize.value))

function generateHsData(): SyslogRow[] {
  const rows: SyslogRow[] = []
  const baseTime = new Date('2026-07-15T11:06:27')
  const userNames = ['root', 'admin', 'thu_backup...', 'user1']
  const mac = '30-80-8b-8d-90-01'
  const syslogs = [
    '<189>Jul 15 11:06:27 2026 LZJ-FZ-S12504X-AF-12...',
    '<189>Jul 15 11:05:50 2026 LZJ-FZ-S12504X-AF-12...',
    '<187>Jul 15 11:04:34 2026 LZJ-FZ-S12504X-AF-12...',
    '<190>Jul 15 11:04:33 2026 LZJ-FZ-MGT-S5130X-1...',
    '<190>Jul 15 11:04:33 2026 LZJ-FZ-MGT-S5130X-1...',
    '<189>Jul 15 11:04:33 2026 LZJ-FZ-MGT-S5130X-1...',
    '<189>Jul 15 11:04:33 2026 LZJ-FZ-MGT-S5130X-1...',
    '<187>Jul 15 11:04:33 2026 LZJ-FZ-MGT-S5130X-1...',
    '<190>Jul 15 11:03:52 2026 LZJ-FZ-S12504X-AF-12...',
    '<190>Jul 15 11:03:52 2026 LZJ-FZ-S12504X-AF-12...',
  ]

  for (let i = 0; i < 32; i++) {
    const time = new Date(baseTime.getTime() - i * 1000)
    const h = String(time.getHours()).padStart(2, '0')
    const m = String(time.getMinutes()).padStart(2, '0')
    const s = String(time.getSeconds()).padStart(2, '0')
    rows.push({
      opTime: `2026-07-15 ${h}:${m}:${s}`,
      mac: mac,
      userName: userNames[i % userNames.length],
      srcIp: '192.168.32.2:60736',
      dstIp: i % 2 === 0 ? '172.16.198.4:514' : '172.20.0.3:514',
      syslog: syslogs[i % syslogs.length],
      link: '默认',
      protoLevel: '网络协议',
    })
  }
  return rows
}

hsData.value = generateHsData()

function doHsSearch() { ElMessage.success('搜索完成（Mock）') }
function doHsExport() { ElMessage.success('导出成功（Mock）') }
function doHsChart() { ElMessage.info('图表视图（Mock）') }
function resetHsFilters() {
  hsFilter.mac = ''; hsFilter.srcIpType = 'any'; hsFilter.srcPort = ''
  hsFilter.dstIpType = 'any'; hsFilter.dstPort = ''; hsFilter.userName = ''
  hsFilter.userGroup = ''; hsFilter.displayName = ''; hsFilter.keyword = ''
  hsFilter.link = ''; hsFilter.timeRange = '2026-07-15 11:02:28 - 2026-07-15 11:17:28'
}
function goToHsPage() {
  const p = hsGotoPage.value
  if (p >= 1 && p <= hsPages.value) hsPage.value = p
}

// ── 历史概况 ──
const hoFilter = reactive({
  mac: '', srcIpType: 'any', srcPort: '', dstIpType: 'any', dstPort: '',
  protoLevel: '', userGroup: '', userName: '', keyword: '',
  timeRange: '2026-07-15 11:02:42 - 2026-07-15 11:17:42'
})

interface HoIpRow { ip: string; total: number }

const hoSrcIpData = ref<HoIpRow[]>([
  { ip: '192.168.32.2', total: 16 },
  { ip: '192.168.63.72', total: 16 },
])
const hoDstIpData = ref<HoIpRow[]>([
  { ip: '172.20.0.3', total: 16 },
  { ip: '172.16.198.4', total: 16 },
])
const hoSrcIpPage = ref(1)
const hoDstIpPage = ref(1)

const srcIpBarOption = ref({
  tooltip: { trigger: 'axis' },
  grid: { left: 50, right: 20, top: 20, bottom: 30 },
  xAxis: {
    type: 'category',
    data: ['192.168.32.2', '192.168.63.72'],
    axisLabel: { rotate: 30, fontSize: 10 },
  },
  yAxis: { type: 'value', name: '请求数' },
  series: [{
    name: '总请求数',
    type: 'bar',
    data: [16, 16],
    itemStyle: { color: '#7eb6ff' },
    barWidth: 60,
  }],
})

const dstIspBarOption = ref({
  tooltip: { trigger: 'axis' },
  grid: { left: 50, right: 20, top: 20, bottom: 30 },
  xAxis: {
    type: 'category',
    data: ['172.20.0.3', '172.16.198.4'],
    axisLabel: { rotate: 30, fontSize: 10 },
  },
  yAxis: { type: 'value', name: '请求数' },
  series: [{
    name: '总请求数',
    type: 'bar',
    data: [16, 16],
    itemStyle: { color: '#7eb6ff' },
    barWidth: 60,
  }],
})

function doHoSearch() { ElMessage.success('搜索完成（Mock）') }
function doHoExport() { ElMessage.success('导出成功（Mock）') }
function resetHoFilters() {
  hoFilter.mac = ''; hoFilter.srcIpType = 'any'; hoFilter.srcPort = ''
  hoFilter.dstIpType = 'any'; hoFilter.dstPort = ''; hoFilter.protoLevel = ''
  hoFilter.userGroup = ''; hoFilter.userName = ''; hoFilter.keyword = ''
  hoFilter.timeRange = '2026-07-15 11:02:42 - 2026-07-15 11:17:42'
}

// ── Syslog详情弹窗 ──
const syslogDetailVisible = ref(false)

const popFilter = reactive({
  mac: '', srcIpType: 'any', srcIp: '', srcPort: '',
  dstIpType: 'any', dstPort: '', protoLevel: '',
  userGroup: '', userName: '', keyword: '', link: '',
  timeRange: '2026-07-15 11:02:42 - 2026-07-15 11:17:42'
})

const popData = ref<SyslogRow[]>([])
const popPage = ref(1)
const popPageSize = ref(100)
const popGotoPage = ref(1)
const popPages = computed(() => Math.max(1, Math.ceil(popData.value.length / popPageSize.value)))
const popPageData = computed(() => popData.value.slice((popPage.value - 1) * popPageSize.value, popPage.value * popPageSize.value))

function generatePopData(srcIp: string, count: number): SyslogRow[] {
  const rows: SyslogRow[] = []
  const baseTime = new Date('2026-07-15T11:06:27')
  const userNames = ['root', 'admin', 'thu_backup...', 'user1']
  const mac = '30-80-8b-8d-90-01'
  const syslogs = [
    '<189>Jul 15 11:06:27 2026 LZJ-FZ-S12504X-AF-12...',
    '<189>Jul 15 11:05:50 2026 LZJ-FZ-S12504X-AF-12...',
    '<187>Jul 15 11:04:34 2026 LZJ-FZ-S12504X-AF-12...',
    '<190>Jul 15 11:04:33 2026 LZJ-FZ-MGT-S5130X-1...',
  ]

  for (let i = 0; i < count; i++) {
    const time = new Date(baseTime.getTime() - i * 1000)
    const h = String(time.getHours()).padStart(2, '0')
    const m = String(time.getMinutes()).padStart(2, '0')
    const s = String(time.getSeconds()).padStart(2, '0')
    rows.push({
      opTime: `2026-07-15 ${h}:${m}:${s}`,
      mac: mac,
      userName: userNames[i % userNames.length],
      srcIp: srcIp,
      dstIp: i % 2 === 0 ? '172.16.198.4:514' : '172.20.0.3:514',
      syslog: syslogs[i % syslogs.length],
      link: '默认',
      protoLevel: '网络协议',
    })
  }
  return rows
}

function openSyslogPopup(row: SyslogRow) {
  popData.value = generatePopData(row.srcIp, 16)
  popFilter.srcIp = row.srcIp.split(':')[0]
  popFilter.srcIpType = 'single'
  syslogDetailVisible.value = true
}

function openSyslogOverviewPopup(ip: string) {
  popData.value = generatePopData(ip, 16)
  popFilter.srcIp = ip
  popFilter.srcIpType = 'single'
  syslogDetailVisible.value = true
}

function doPopSearch() { ElMessage.success('搜索完成（Mock）') }
function doPopExport() { ElMessage.success('导出成功（Mock）') }
function doPopChart() { ElMessage.info('图表视图（Mock）') }
function resetPopFilters() {
  popFilter.mac = ''; popFilter.srcIpType = 'any'; popFilter.srcIp = ''; popFilter.srcPort = ''
  popFilter.dstIpType = 'any'; popFilter.dstPort = ''; popFilter.protoLevel = ''
  popFilter.userGroup = ''; popFilter.userName = ''; popFilter.keyword = ''
  popFilter.link = ''; popFilter.timeRange = '2026-07-15 11:02:42 - 2026-07-15 11:17:42'
}
function goToPopPage() {
  const p = popGotoPage.value
  if (p >= 1 && p <= popPages.value) popPage.value = p
}
</script>

<style scoped>
.oa-proto-panel { display:none; }
.oa-proto-panel.active { display:flex; flex-direction:column; flex:1; min-height:0; }
.oa-sub-header { padding:0 16px; background:#fafbfc; border-bottom:1px solid #ebeef5; }
.cbm-pc-subtabs { display:flex; }
.cbm-pc-subtab { padding:10px 16px; border:none; background:transparent; font-size:13px; font-weight:500; color:#606266; cursor:pointer; position:relative; }
.cbm-pc-subtab.active { color:#409eff; }
.cbm-pc-subtab.active::after { content:''; position:absolute; bottom:0; left:16px; right:16px; height:2px; background:#409eff; }
.oa-sub-panel { display:none; flex:1; min-height:0; flex-direction:column; }
.oa-sub-panel.active { display:flex; }
.oa-sub-content { display:flex; flex-direction:column; flex:1; min-height:0; }
.oa-overview-content { display:flex; flex:1; min-height:0; gap:12px; padding:12px; overflow:auto; }
.oa-overview-left { display:flex; flex-direction:column; gap:12px; flex:1; }
.oa-overview-right { display:flex; flex-direction:column; gap:12px; flex:1; }
.audit-table th, .audit-table td { font-size:12px; padding:6px 8px; }
.audit-table { min-width:1200px; }

.tid-chart-panel {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 12px;
}
.tid-chart-head { display:flex; align-items:center; margin-bottom:8px; }
.tid-mini-title { font-size:13px; font-weight:600; color:#303133; display:flex; align-items:center; }
.tid-mini-panel {
  background:#fff;
  border:1px solid #ebeef5;
  border-radius:4px;
  padding:12px;
  display:flex;
  flex-direction:column;
}
.tid-mini-head { margin-bottom:8px; }
.tid-mini-table-wrap { flex:1; min-height:0; }

.tid-link {
  color: #409eff;
  cursor: pointer;
  text-decoration: underline;
}
.tid-link:hover { color: #66b1ff; }

.syslog-detail-dialog :deep(.el-dialog__header) {
  padding: 12px 20px;
  border-bottom: 1px solid #ebeef5;
}
.syslog-detail-dialog :deep(.el-dialog__body) { padding: 0; }
.syslog-detail-header { display:flex; align-items:center; }
.syslog-detail-title { font-size:14px; font-weight:600; color:#303133; }
</style>
