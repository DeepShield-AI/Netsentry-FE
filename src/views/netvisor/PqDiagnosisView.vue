<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav" role="tablist" aria-label="质量诊断">
        <button type="button" class="nv-tab active" role="tab" aria-selected="true">质量诊断</button>
      </div>
    </div>
    <div class="nv-tabs-body">
      <div class="tid-page pqd-page">
        <!-- ============ 工具栏 ============ -->
        <div class="tdh-filters">
          <div class="tdh-filter-row">
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">源IP</span>
              <el-select v-model="srcIpType" size="small" style="width:90px" clearable>
                <el-option label="任意IP" value="" />
                <el-option label="等于" value="eq" />
                <el-option label="不等于" value="ne" />
                <el-option label="属于" value="in" />
                <el-option label="不属于" value="nin" />
              </el-select>
              <el-input v-model="srcIpValue" placeholder="任意IP" size="small" style="width:160px" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">过滤源</span>
              <el-select v-model="filterSrc" size="small" style="width:90px" clearable>
                <el-option label="否" :value="false" />
                <el-option label="是" :value="true" />
              </el-select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">源端口</span>
              <el-input v-model="srcPort" placeholder="80 / 8000-8080" size="small" style="width:160px" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">目标IP</span>
              <el-select v-model="dstIpType" size="small" style="width:90px" clearable>
                <el-option label="任意IP" value="" />
                <el-option label="等于" value="eq" />
                <el-option label="不属于" value="nin" />
              </el-select>
              <el-input v-model="dstIpValue" placeholder="任意IP" size="small" style="width:160px" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">过滤目标</span>
              <el-select v-model="filterDst" size="small" style="width:90px" clearable>
                <el-option label="否" :value="false" />
                <el-option label="是" :value="true" />
              </el-select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">目标端口</span>
              <el-input v-model="dstPort" placeholder="80 / 8000-8080" size="small" style="width:160px" />
            </label>
            <div class="tio-range-btns">
              <button class="tio-range-btn" :class="{ active: ipFamily === 'ipv4' }" @click="ipFamily = 'ipv4'">IPv4</button>
              <button class="tio-range-btn" :class="{ active: ipFamily === 'ipv6' }" @click="ipFamily = 'ipv6'">IPv6</button>
            </div>
          </div>

          <div class="tdh-filter-row">
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">MAC</span>
              <el-input v-model="mac" size="small" style="width:200px" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">应用协议</span>
              <el-select v-model="appProto" size="small" style="width:160px" clearable>
                <el-option label="任意协议" value="" />
                <el-option label="HTTP" value="HTTP" />
                <el-option label="HTTPS" value="HTTPS" />
                <el-option label="DNS" value="DNS" />
                <el-option label="SSH" value="SSH" />
                <el-option label="FTP" value="FTP" />
                <el-option label="SMTP" value="SMTP" />
                <el-option label="TELNET" value="TELNET" />
                <el-option label="其它下载" value="其它下载" />
                <el-option label="其它HTTPS" value="其它HTTPS" />
              </el-select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">源IP ISP</span>
              <el-select v-model="srcIsp" size="small" style="width:140px" clearable>
                <el-option label="任意" value="" />
                <el-option label="电信" value="telecom" />
                <el-option label="联通" value="unicom" />
                <el-option label="移动" value="mobile" />
                <el-option label="教育网" value="edu" />
                <el-option label="境外" value="oversea" />
              </el-select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">目标IP ISP</span>
              <el-select v-model="dstIsp" size="small" style="width:140px" clearable>
                <el-option label="任意" value="" />
                <el-option label="电信" value="telecom" />
                <el-option label="联通" value="unicom" />
                <el-option label="移动" value="mobile" />
                <el-option label="教育网" value="edu" />
                <el-option label="境外" value="oversea" />
              </el-select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">源IP区域</span>
              <el-select v-model="srcArea" size="small" style="width:140px" clearable>
                <el-option label="任意" value="" />
                <el-option label="北京市" value="beijing" />
                <el-option label="上海市" value="shanghai" />
                <el-option label="广东省" value="guangdong" />
                <el-option label="香港" value="hk" />
                <el-option label="境外" value="oversea" />
              </el-select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">目标IP区域</span>
              <el-select v-model="dstArea" size="small" style="width:140px" clearable>
                <el-option label="任意" value="" />
                <el-option label="北京市" value="beijing" />
                <el-option label="上海市" value="shanghai" />
                <el-option label="广东省" value="guangdong" />
                <el-option label="香港" value="hk" />
                <el-option label="境外" value="oversea" />
              </el-select>
            </label>
          </div>

          <div class="tdh-filter-row">
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">传输协议</span>
              <el-select v-model="transport" size="small" style="width:120px" clearable>
                <el-option label="任意" value="" />
                <el-option label="TCP" value="TCP" />
                <el-option label="UDP" value="UDP" />
                <el-option label="ICMP" value="ICMP" />
              </el-select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">域名</span>
              <el-input v-model="domain" size="small" style="width:160px" clearable>
                <template #prefix><el-icon style="margin-right:2px"><Search /></el-icon></template>
              </el-input>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">客户时延&gt;=</span>
              <el-input-number v-model="clientLatency" :min="0" :step="10" size="small" style="width:90px" controls-position="right" />
              <span class="pq-unit">ms</span>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">服务时延&gt;=</span>
              <el-input-number v-model="serverLatency" :min="0" :step="10" size="small" style="width:90px" controls-position="right" />
              <span class="pq-unit">ms</span>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">应用时延&gt;=</span>
              <el-input-number v-model="appLatency" :min="0" :step="10" size="small" style="width:90px" controls-position="right" />
              <span class="pq-unit">ms</span>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">账号备注</span>
              <el-input v-model="accountRemark" size="small" style="width:140px" />
            </label>
          </div>

          <div class="tdh-filter-row">
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">链路</span>
              <el-select v-model="link" size="small" style="width:140px" clearable>
                <el-option label="任意" value="" />
                <el-option label="线路A" value="A" />
                <el-option label="线路B" value="B" />
                <el-option label="线路C" value="C" />
              </el-select>
            </label>
            <label class="tdh-filter-field tdh-filter-time">
              <span class="ou-toolbar-label">时间范围</span>
              <el-date-picker
                v-model="dateRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                size="small"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width:340px"
              />
            </label>
            <button class="ou-search-btn" @click="doSearch"><el-icon><Search /></el-icon>&nbsp;搜索</button>
            <button class="secondary td-reset-btn" @click="doReset">重置</button>
            <button class="link-btn" @click="doExport">⬇ 导出</button>
          </div>
        </div>

        <!-- ============ 图表+应用协议表 ============ -->
        <div class="pq-scroll">
          <div class="pqd-mid-grid">
            <section class="tid-chart-panel">
              <div class="tid-chart-head"><h3 class="tid-mini-title">会话趋势</h3></div>
              <div class="tid-chart-body">
                <span class="tid-yunit">Session#</span>
                <div class="to-chart-plot">
                  <v-chart :option="sessionTrendOption" autoresize style="width:100%;height:340px" />
                </div>
              </div>
              <div class="dtt-chart-stats">
                <span class="dtt-stat"><i class="dtt-stat-badge max">MAX</i>最大值 <strong>{{ sessionMax }}</strong></span>
                <span class="dtt-stat"><i class="dtt-stat-badge min">MIN</i>最小值 <strong>{{ sessionMin }}</strong></span>
                <span class="dtt-stat"><i class="dtt-stat-badge avg">AVG</i>平均值 <strong>{{ sessionAvg }}</strong></span>
              </div>
            </section>

            <section class="tid-mini-panel">
              <div class="tid-mini-head">
                <h3 class="tid-mini-title">应用协议</h3>
                <el-button size="small" text @click="openProtoExpand('appProto')"><el-icon><FullScreen /></el-icon></el-button>
              </div>
              <div class="ou-table-wrap tid-mini-table-wrap">
                <table class="ou-table tid-mini-table pq-table">
                  <thead>
                    <tr>
                      <th class="col-idx">序号</th>
                      <th>应用协议</th>
                      <th class="ou-num">总请求数</th>
                      <th class="ou-num">失败次数</th>
                      <th class="ou-num">平均时延</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(r, i) in pagedProtoRows" :key="i">
                      <td class="col-idx">{{ (appProtoPage - 1) * appProtoPageSize + i + 1 }}</td>
                      <td><span class="tid-link dt-ellipsis" @click="openProtoDetail(r)">{{ r.name }}</span></td>
                      <td class="pq-bar-col">
                        <span class="pq-bar-cell">
                          <span class="pq-bar-track"><span class="pq-bar-fill" :style="{ width: r.reqW + '%' }"></span></span>
                          <span class="pq-bar-val">{{ r.req }}</span>
                        </span>
                      </td>
                      <td class="pq-bar-col">
                        <span class="pq-bar-cell">
                          <span class="pq-bar-track"><span class="pq-bar-fill pq-bar-fill-fail" :style="{ width: r.failW + '%' }"></span></span>
                          <span class="pq-bar-val">{{ r.fail }}</span>
                        </span>
                      </td>
                      <td><span class="pq-latency-badge" :class="{ 'pq-latency-good': r.good }">{{ r.lat }}</span></td>
                    </tr>
                    <tr v-if="pagedProtoRows.length === 0">
                      <td colspan="5" class="ou-empty">无数据</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="ou-footer">
                <div class="ou-pager">
                  <button class="ou-page-btn" @click="appProtoPage > 1 && appProtoPage--">‹</button>
                  <button v-for="pg in appProtoPagesArr" :key="pg" class="ou-page-btn" :class="{ active: pg === appProtoPage }" @click="appProtoPage = pg">{{ pg }}</button>
                  <button class="ou-page-btn" @click="appProtoPage < appProtoPages && appProtoPage++">›</button>
                </div>
                <span>共 {{ appProtoRows.length }} 条</span>
              </div>
            </section>
          </div>

          <!-- ============ 三个明细表 ============ -->
          <div class="pqd-bottom-grid">
            <section class="tid-mini-panel">
              <div class="tid-mini-head">
                <h3 class="tid-mini-title">源IP</h3>
                <el-button size="small" text @click="openSrcExpand"><el-icon><FullScreen /></el-icon></el-button>
              </div>
              <div class="ou-table-wrap tid-mini-table-wrap">
                <table class="ou-table tid-mini-table pq-table">
                  <thead>
                    <tr>
                      <th class="col-idx">序号</th>
                      <th>源IP</th>
                      <th class="ou-num">总请求数</th>
                      <th class="ou-num">失败次数</th>
                      <th class="ou-num">平均时延</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(r, i) in pagedSrcRows" :key="i">
                      <td class="col-idx">{{ (srcPage - 1) * srcPageSize + i + 1 }}</td>
                      <td><span class="tid-link dt-ellipsis" @click="openSrcDetail(r)">{{ r.name }}</span></td>
                      <td class="pq-bar-col">
                        <span class="pq-bar-cell">
                          <span class="pq-bar-track"><span class="pq-bar-fill" :style="{ width: r.reqW + '%' }"></span></span>
                          <span class="pq-bar-val">{{ r.req }}</span>
                        </span>
                      </td>
                      <td class="pq-bar-col">
                        <span class="pq-bar-cell">
                          <span class="pq-bar-track"><span class="pq-bar-fill pq-bar-fill-fail" :style="{ width: r.failW + '%' }"></span></span>
                          <span class="pq-bar-val">{{ r.fail }}</span>
                        </span>
                      </td>
                      <td><span class="pq-latency-badge" :class="{ 'pq-latency-good': r.good }">{{ r.lat }}</span></td>
                    </tr>
                    <tr v-if="pagedSrcRows.length === 0">
                      <td colspan="5" class="ou-empty">无数据</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="ou-footer">
                <div class="ou-pager">
                  <button class="ou-page-btn" @click="srcPage > 1 && srcPage--">‹</button>
                  <button v-for="pg in srcPagesArr" :key="pg" class="ou-page-btn" :class="{ active: pg === srcPage }" @click="srcPage = pg">{{ pg }}</button>
                  <button class="ou-page-btn" @click="srcPage < srcPages && srcPage++">›</button>
                </div>
                <span>共 {{ srcRows.length }} 条</span>
              </div>
            </section>

            <section class="tid-mini-panel">
              <div class="tid-mini-head">
                <h3 class="tid-mini-title">目标IP</h3>
                <el-button size="small" text @click="openDstExpand"><el-icon><FullScreen /></el-icon></el-button>
              </div>
              <div class="ou-table-wrap tid-mini-table-wrap">
                <table class="ou-table tid-mini-table pq-table">
                  <thead>
                    <tr>
                      <th class="col-idx">序号</th>
                      <th>目标IP</th>
                      <th class="ou-num">总请求数</th>
                      <th class="ou-num">失败次数</th>
                      <th class="ou-num">平均时延</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(r, i) in pagedDstRows" :key="i">
                      <td class="col-idx">{{ (dstPage - 1) * dstPageSize + i + 1 }}</td>
                      <td><span class="tid-link dt-ellipsis" @click="openDstDetail(r)">{{ r.name }}</span></td>
                      <td class="pq-bar-col">
                        <span class="pq-bar-cell">
                          <span class="pq-bar-track"><span class="pq-bar-fill" :style="{ width: r.reqW + '%' }"></span></span>
                          <span class="pq-bar-val">{{ r.req }}</span>
                        </span>
                      </td>
                      <td class="pq-bar-col">
                        <span class="pq-bar-cell">
                          <span class="pq-bar-track"><span class="pq-bar-fill pq-bar-fill-fail" :style="{ width: r.failW + '%' }"></span></span>
                          <span class="pq-bar-val">{{ r.fail }}</span>
                        </span>
                      </td>
                      <td><span class="pq-latency-badge" :class="{ 'pq-latency-good': r.good }">{{ r.lat }}</span></td>
                    </tr>
                    <tr v-if="pagedDstRows.length === 0">
                      <td colspan="5" class="ou-empty">无数据</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="ou-footer">
                <div class="ou-pager">
                  <button class="ou-page-btn" @click="dstPage > 1 && dstPage--">‹</button>
                  <button v-for="pg in dstPagesArr" :key="pg" class="ou-page-btn" :class="{ active: pg === dstPage }" @click="dstPage = pg">{{ pg }}</button>
                  <button class="ou-page-btn" @click="dstPage < dstPages && dstPage++">›</button>
                </div>
                <span>共 {{ dstRows.length }} 条</span>
              </div>
            </section>

            <section class="tid-mini-panel">
              <div class="tid-mini-head">
                <h3 class="tid-mini-title">目标域名</h3>
                <el-button size="small" text @click="openDomainExpand"><el-icon><FullScreen /></el-icon></el-button>
              </div>
              <div class="ou-table-wrap tid-mini-table-wrap">
                <table class="ou-table tid-mini-table pq-table">
                  <thead>
                    <tr>
                      <th class="col-idx">序号</th>
                      <th>目标域名</th>
                      <th class="ou-num">总请求数</th>
                      <th class="ou-num">失败次数</th>
                      <th class="ou-num">平均时延</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(r, i) in pagedDomainRows" :key="i">
                      <td class="col-idx">{{ (domainPage - 1) * domainPageSize + i + 1 }}</td>
                      <td><span class="tid-link dt-ellipsis" @click="openDomainDetail(r)">{{ r.name }}</span></td>
                      <td class="pq-bar-col">
                        <span class="pq-bar-cell">
                          <span class="pq-bar-track"><span class="pq-bar-fill" :style="{ width: r.reqW + '%' }"></span></span>
                          <span class="pq-bar-val">{{ r.req }}</span>
                        </span>
                      </td>
                      <td class="pq-bar-col">
                        <span class="pq-bar-cell">
                          <span class="pq-bar-track"><span class="pq-bar-fill pq-bar-fill-fail" :style="{ width: r.failW + '%' }"></span></span>
                          <span class="pq-bar-val">{{ r.fail }}</span>
                        </span>
                      </td>
                      <td><span class="pq-latency-badge" :class="{ 'pq-latency-good': r.good }">{{ r.lat }}</span></td>
                    </tr>
                    <tr v-if="pagedDomainRows.length === 0">
                      <td colspan="5" class="ou-empty">无数据</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="ou-footer">
                <div class="ou-pager">
                  <button class="ou-page-btn" @click="domainPage > 1 && domainPage--">‹</button>
                  <button v-for="pg in domainPagesArr" :key="pg" class="ou-page-btn" :class="{ active: pg === domainPage }" @click="domainPage = pg">{{ pg }}</button>
                  <button class="ou-page-btn" @click="domainPage < domainPages && domainPage++">›</button>
                </div>
                <span>共 {{ domainRows.length }} 条</span>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 应用协议详情弹窗 ==================== -->
    <el-dialog v-model="protoDialogVisible" :title="'应用协议 -> ' + protoDialogTitle" width="80%" destroy-on-close class="pq-detail-dialog">
      <div style="padding:12px">
        <v-chart :option="protoDialogChartOption" autoresize style="width:100%;height:280px" />
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px">
          <span style="font-size:13px;color:#606266">访问对象</span>
          <el-input v-model="protoDetailKeyword" size="small" placeholder="关键字搜索" style="width:220px" clearable>
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </div>
        <table class="ou-table pq-table" style="margin-top:10px">
          <thead>
            <tr>
              <th class="col-idx">序号</th>
              <th>对象</th>
              <th class="ou-num">总请求数</th>
              <th class="ou-num">失败次数</th>
              <th class="ou-num">平均时延</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in protoDetailRows" :key="i">
              <td class="col-idx">{{ (protoDetailPage - 1) * protoDetailPageSize + i + 1 }}</td>
              <td><span class="tid-link dt-ellipsis">{{ r.name }}</span></td>
              <td class="pq-bar-col">
                <span class="pq-bar-cell">
                  <span class="pq-bar-track"><span class="pq-bar-fill" :style="{ width: r.reqW + '%' }"></span></span>
                  <span class="pq-bar-val">{{ r.req }}</span>
                </span>
              </td>
              <td class="pq-bar-col">
                <span class="pq-bar-cell">
                  <span class="pq-bar-track"><span class="pq-bar-fill pq-bar-fill-fail" :style="{ width: r.failW + '%' }"></span></span>
                  <span class="pq-bar-val">{{ r.fail }}</span>
                </span>
              </td>
              <td><span class="pq-latency-badge" :class="{ 'pq-latency-good': r.good }">{{ r.lat }}</span></td>
            </tr>
            <tr v-if="protoDetailRows.length === 0">
              <td colspan="5" class="ou-empty">无数据</td>
            </tr>
          </tbody>
        </table>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">
          <div class="ou-pager">
            <button class="ou-page-btn" :disabled="protoDetailPage <= 1" @click="protoDetailPage > 1 && protoDetailPage--">‹</button>
            <button v-for="pg in protoDetailPagesArr" :key="pg" class="ou-page-btn" :class="{ active: pg === protoDetailPage }" @click="protoDetailPage = pg">{{ pg }}</button>
            <button class="ou-page-btn" :disabled="protoDetailPage >= protoDetailPages" @click="protoDetailPage < protoDetailPages && protoDetailPage++">›</button>
          </div>
          <div style="display:flex;gap:12px;align-items:center">
            <span style="font-size:12px;color:#909399">共 {{ protoDetailAllRows.length }} 条</span>
            <el-select v-model="protoDetailPageSize" size="small" style="width:110px">
              <el-option :value="20" label="20 条/页" />
              <el-option :value="50" label="50 条/页" />
              <el-option :value="100" label="100 条/页" />
            </el-select>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- ==================== 源IP 详情弹窗 ==================== -->
    <el-dialog v-model="srcDialogVisible" :title="'源IP -> ' + srcDialogTitle" width="80%" destroy-on-close class="pq-detail-dialog">
      <div style="padding:12px">
        <v-chart :option="srcDialogChartOption" autoresize style="width:100%;height:280px" />
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px">
          <span style="font-size:13px;color:#606266">访问对象</span>
          <el-input v-model="srcDetailKeyword" size="small" placeholder="关键字搜索" style="width:220px" clearable>
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </div>
        <table class="ou-table pq-table" style="margin-top:10px">
          <thead>
            <tr>
              <th class="col-idx">序号</th>
              <th>对象</th>
              <th class="ou-num">总请求数</th>
              <th class="ou-num">失败次数</th>
              <th class="ou-num">平均时延</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in srcDetailRows" :key="i">
              <td class="col-idx">{{ (srcDetailPage - 1) * srcDetailPageSize + i + 1 }}</td>
              <td><span class="tid-link dt-ellipsis">{{ r.name }}</span></td>
              <td class="pq-bar-col">
                <span class="pq-bar-cell">
                  <span class="pq-bar-track"><span class="pq-bar-fill" :style="{ width: r.reqW + '%' }"></span></span>
                  <span class="pq-bar-val">{{ r.req }}</span>
                </span>
              </td>
              <td class="pq-bar-col">
                <span class="pq-bar-cell">
                  <span class="pq-bar-track"><span class="pq-bar-fill pq-bar-fill-fail" :style="{ width: r.failW + '%' }"></span></span>
                  <span class="pq-bar-val">{{ r.fail }}</span>
                </span>
              </td>
              <td><span class="pq-latency-badge" :class="{ 'pq-latency-good': r.good }">{{ r.lat }}</span></td>
            </tr>
            <tr v-if="srcDetailRows.length === 0">
              <td colspan="5" class="ou-empty">无数据</td>
            </tr>
          </tbody>
        </table>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">
          <div class="ou-pager">
            <button class="ou-page-btn" :disabled="srcDetailPage <= 1" @click="srcDetailPage > 1 && srcDetailPage--">‹</button>
            <button v-for="pg in srcDetailPagesArr" :key="pg" class="ou-page-btn" :class="{ active: pg === srcDetailPage }" @click="srcDetailPage = pg">{{ pg }}</button>
            <button class="ou-page-btn" :disabled="srcDetailPage >= srcDetailPages" @click="srcDetailPage < srcDetailPages && srcDetailPage++">›</button>
          </div>
          <div style="display:flex;gap:12px;align-items:center">
            <span style="font-size:12px;color:#909399">共 {{ srcDetailAllRows.length }} 条</span>
            <el-select v-model="srcDetailPageSize" size="small" style="width:110px">
              <el-option :value="20" label="20 条/页" />
              <el-option :value="50" label="50 条/页" />
              <el-option :value="100" label="100 条/页" />
            </el-select>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- ==================== 目标IP 详情弹窗 ==================== -->
    <el-dialog v-model="dstDialogVisible" :title="'目标IP -> ' + dstDialogTitle" width="80%" destroy-on-close class="pq-detail-dialog">
      <div style="padding:12px">
        <v-chart :option="dstDialogChartOption" autoresize style="width:100%;height:280px" />
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px">
          <span style="font-size:13px;color:#606266">访问对象</span>
          <el-input v-model="dstDetailKeyword" size="small" placeholder="关键字搜索" style="width:220px" clearable>
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </div>
        <table class="ou-table pq-table" style="margin-top:10px">
          <thead>
            <tr>
              <th class="col-idx">序号</th>
              <th>对象</th>
              <th class="ou-num">总请求数</th>
              <th class="ou-num">失败次数</th>
              <th class="ou-num">平均时延</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in dstDetailRows" :key="i">
              <td class="col-idx">{{ (dstDetailPage - 1) * dstDetailPageSize + i + 1 }}</td>
              <td><span class="tid-link dt-ellipsis">{{ r.name }}</span></td>
              <td class="pq-bar-col">
                <span class="pq-bar-cell">
                  <span class="pq-bar-track"><span class="pq-bar-fill" :style="{ width: r.reqW + '%' }"></span></span>
                  <span class="pq-bar-val">{{ r.req }}</span>
                </span>
              </td>
              <td class="pq-bar-col">
                <span class="pq-bar-cell">
                  <span class="pq-bar-track"><span class="pq-bar-fill pq-bar-fill-fail" :style="{ width: r.failW + '%' }"></span></span>
                  <span class="pq-bar-val">{{ r.fail }}</span>
                </span>
              </td>
              <td><span class="pq-latency-badge" :class="{ 'pq-latency-good': r.good }">{{ r.lat }}</span></td>
            </tr>
            <tr v-if="dstDetailRows.length === 0">
              <td colspan="5" class="ou-empty">无数据</td>
            </tr>
          </tbody>
        </table>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">
          <div class="ou-pager">
            <button class="ou-page-btn" :disabled="dstDetailPage <= 1" @click="dstDetailPage > 1 && dstDetailPage--">‹</button>
            <button v-for="pg in dstDetailPagesArr" :key="pg" class="ou-page-btn" :class="{ active: pg === dstDetailPage }" @click="dstDetailPage = pg">{{ pg }}</button>
            <button class="ou-page-btn" :disabled="dstDetailPage >= dstDetailPages" @click="dstDetailPage < dstDetailPages && dstDetailPage++">›</button>
          </div>
          <div style="display:flex;gap:12px;align-items:center">
            <span style="font-size:12px;color:#909399">共 {{ dstDetailAllRows.length }} 条</span>
            <el-select v-model="dstDetailPageSize" size="small" style="width:110px">
              <el-option :value="20" label="20 条/页" />
              <el-option :value="50" label="50 条/页" />
              <el-option :value="100" label="100 条/页" />
            </el-select>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- ==================== 目标域名 详情弹窗 ==================== -->
    <el-dialog v-model="domainDialogVisible" :title="'目标域名 -> ' + domainDialogTitle" width="80%" destroy-on-close class="pq-detail-dialog">
      <div style="padding:12px">
        <v-chart :option="domainDialogChartOption" autoresize style="width:100%;height:280px" />
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px">
          <span style="font-size:13px;color:#606266">访问对象</span>
          <el-input v-model="domainDetailKeyword" size="small" placeholder="关键字搜索" style="width:220px" clearable>
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </div>
        <table class="ou-table pq-table" style="margin-top:10px">
          <thead>
            <tr>
              <th class="col-idx">序号</th>
              <th>对象</th>
              <th class="ou-num">总请求数</th>
              <th class="ou-num">失败次数</th>
              <th class="ou-num">平均时延</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in domainDetailRows" :key="i">
              <td class="col-idx">{{ (domainDetailPage - 1) * domainDetailPageSize + i + 1 }}</td>
              <td><span class="tid-link dt-ellipsis">{{ r.name }}</span></td>
              <td class="pq-bar-col">
                <span class="pq-bar-cell">
                  <span class="pq-bar-track"><span class="pq-bar-fill" :style="{ width: r.reqW + '%' }"></span></span>
                  <span class="pq-bar-val">{{ r.req }}</span>
                </span>
              </td>
              <td class="pq-bar-col">
                <span class="pq-bar-cell">
                  <span class="pq-bar-track"><span class="pq-bar-fill pq-bar-fill-fail" :style="{ width: r.failW + '%' }"></span></span>
                  <span class="pq-bar-val">{{ r.fail }}</span>
                </span>
              </td>
              <td><span class="pq-latency-badge" :class="{ 'pq-latency-good': r.good }">{{ r.lat }}</span></td>
            </tr>
            <tr v-if="domainDetailRows.length === 0">
              <td colspan="5" class="ou-empty">无数据</td>
            </tr>
          </tbody>
        </table>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">
          <div class="ou-pager">
            <button class="ou-page-btn" :disabled="domainDetailPage <= 1" @click="domainDetailPage > 1 && domainDetailPage--">‹</button>
            <button v-for="pg in domainDetailPagesArr" :key="pg" class="ou-page-btn" :class="{ active: pg === domainDetailPage }" @click="domainDetailPage = pg">{{ pg }}</button>
            <button class="ou-page-btn" :disabled="domainDetailPage >= domainDetailPages" @click="domainDetailPage < domainDetailPages && domainDetailPage++">›</button>
          </div>
          <div style="display:flex;gap:12px;align-items:center">
            <span style="font-size:12px;color:#909399">共 {{ domainDetailAllRows.length }} 条</span>
            <el-select v-model="domainDetailPageSize" size="small" style="width:110px">
              <el-option :value="20" label="20 条/页" />
              <el-option :value="50" label="50 条/页" />
              <el-option :value="100" label="100 条/页" />
            </el-select>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart } from 'echarts/charts'
import {
  TitleComponent, TooltipComponent, LegendComponent, GridComponent
} from 'echarts/components'
import { Search, FullScreen } from '@element-plus/icons-vue'
import './nv-shared.css'

use([CanvasRenderer, LineChart, BarChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent])

// ══════════════════════════════════════════════════════════════
// 工具栏状态
// ═══════════════════════════════════════════════════════════
const srcIpType = ref<string>('')
const srcIpValue = ref('')
const filterSrc = ref<boolean | ''>('')
const srcPort = ref('')
const dstIpType = ref<string>('')
const dstIpValue = ref('')
const filterDst = ref<boolean | ''>('')
const dstPort = ref('')
const ipFamily = ref<'ipv4' | 'ipv6'>('ipv4')
const mac = ref('')
const appProto = ref<string>('')
const srcIsp = ref<string>('')
const dstIsp = ref<string>('')
const srcArea = ref<string>('')
const dstArea = ref<string>('')
const transport = ref<string>('')
const domain = ref('')
const clientLatency = ref<number>(0)
const serverLatency = ref<number>(0)
const appLatency = ref<number>(0)
const accountRemark = ref('')
const link = ref<string>('')
const dateRange = ref<[string, string]>(['2026-07-16 15:16:21', '2026-07-16 16:32:25'])

function doSearch() {
  // mock 重新生成数据
  appProtoPage.value = 1
  srcPage.value = 1
  dstPage.value = 1
  domainPage.value = 1
}

function doReset() {
  srcIpType.value = ''
  srcIpValue.value = ''
  filterSrc.value = ''
  srcPort.value = ''
  dstIpType.value = ''
  dstIpValue.value = ''
  filterDst.value = ''
  dstPort.value = ''
  ipFamily.value = 'ipv4'
  mac.value = ''
  appProto.value = ''
  srcIsp.value = ''
  dstIsp.value = ''
  srcArea.value = ''
  dstArea.value = ''
  transport.value = ''
  domain.value = ''
  clientLatency.value = 0
  serverLatency.value = 0
  appLatency.value = 0
  accountRemark.value = ''
  link.value = ''
  dateRange.value = ['2026-07-16 15:16:21', '2026-07-16 16:32:25']
}

function doExport() {
  // mock 导出
}

// ══════════════════════════════════════════════════════════════
// 会话趋势
// ═══════════════════════════════════════════════════════════
const sessionMax = ref('924133')
const sessionMin = ref('178494')
const sessionAvg = ref('755133')

const sessionTrendOption = computed(() => {
  const x: string[] = []
  const total: number[] = []
  const fail: number[] = []
  for (let h = 15; h <= 16; h++) {
    for (let m = 0; m < 60; m += 5) {
      if (h === 15 && m < 16) continue
      if (h === 16 && m > 32) continue
      const t = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      x.push(t)
      total.push(Math.round(820000 + Math.sin(m / 10) * 80000 + (h - 15) * 10000))
      fail.push(Math.round(160000 + Math.cos(m / 12) * 20000 + (h - 15) * 5000))
    }
  }
  return {
    tooltip: { trigger: 'axis' },
    legend: { data: ['最大值', '最小值', '平均值'], bottom: 0, textStyle: { fontSize: 11 } },
    grid: { left: 60, right: 20, top: 20, bottom: 40 },
    xAxis: { type: 'category', data: x, axisLabel: { fontSize: 10, rotate: 0 } },
    yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
    series: [
      { name: '最大值', type: 'line', smooth: true, symbol: 'none', itemStyle: { color: '#f56c6c' }, data: total.map(v => v + 150000) },
      { name: '最小值', type: 'line', smooth: true, symbol: 'none', itemStyle: { color: '#67c23a' }, data: fail.map(v => Math.max(100000, v - 80000)) },
      { name: '平均值', type: 'line', smooth: true, symbol: 'none', itemStyle: { color: '#409eff' }, areaStyle: { color: 'rgba(64,158,255,0.15)' }, data: total },
    ],
  }
})

// ══════════════════════════════════════════════════════════════
// 应用协议表
// ═══════════════════════════════════════════════════════════
interface ProtoRow { name: string; req: number; reqW: number; fail: number; failW: number; lat: string; good: boolean }
const appProtoRows: ProtoRow[] = [
  { name: 'SYN_ACK', req: 1364963, reqW: 100, fail: 1339237, failW: 100, lat: '122.99', good: false },
  { name: '其它HTTPS', req: 680190, reqW: 50, fail: 49764, failW: 4, lat: '86.58', good: true },
  { name: 'NETBIOS', req: 123467, reqW: 9, fail: 123467, failW: 9, lat: '12.66', good: true },
  { name: 'MSDS', req: 123087, reqW: 9, fail: 123456, failW: 9, lat: '10.39', good: true },
  { name: '其它下载', req: 110063, reqW: 8, fail: 88909, failW: 7, lat: '111.82', good: false },
  { name: 'WWW', req: 226086, reqW: 17, fail: 32161, failW: 2, lat: '81.46', good: true },
]
const appProtoPage = ref(1)
const appProtoPageSize = ref(20)
const appProtoPages = computed(() => Math.max(1, Math.ceil(appProtoRows.length / appProtoPageSize.value)))
const appProtoPagesArr = computed(() => {
  const total = appProtoPages.value
  const cur = appProtoPage.value
  const arr: number[] = []
  for (let i = 1; i <= total; i++) arr.push(i)
  return arr.slice(Math.max(0, cur - 1), Math.min(arr.length, cur + 1))
})
const pagedProtoRows = computed(() => {
  const start = (appProtoPage.value - 1) * appProtoPageSize.value
  return appProtoRows.slice(start, start + appProtoPageSize.value)
})

// ══════════════════════════════════════════════════════════════
// 源IP表
// ═══════════════════════════════════════════════════════════
interface IpRow { name: string; req: number; reqW: number; fail: number; failW: number; lat: string; good: boolean }
const srcRows: IpRow[] = [
  { name: '166.111.6.66', req: 706210, reqW: 100, fail: 339505, failW: 95, lat: '5.51', good: true },
  { name: '166.111.8.64', req: 697554, reqW: 99, fail: 697991, failW: 100, lat: '62.91', good: true },
  { name: '101.6.14.166', req: 50027, reqW: 7, fail: 25377, failW: 4, lat: '900.23', good: false },
  { name: '113.120.243.171', req: 12844, reqW: 2, fail: 12844, failW: 2, lat: '-', good: false },
  { name: '101.6.6.30', req: 11981, reqW: 2, fail: 11581, failW: 2, lat: '-', good: false },
  { name: '36.152.132.190', req: 11400, reqW: 2, fail: 11400, failW: 2, lat: '-', good: false },
  { name: '183.119.78.20', req: 11308, reqW: 2, fail: 11308, failW: 2, lat: '-', good: false },
  { name: '61.51.205.18', req: 7808, reqW: 1, fail: 7808, failW: 1, lat: '-', good: false },
  { name: '183.119.78.33', req: 7769, reqW: 1, fail: 7769, failW: 1, lat: '-', good: false },
  { name: '47.93.39.174', req: 6569, reqW: 1, fail: 6569, failW: 1, lat: '-', good: false },
  { name: '101.6.6.32', req: 5942, reqW: 1, fail: 5942, failW: 1, lat: '-', good: false },
  { name: '166.111.7.8', req: 101500, reqW: 14, fail: 5907, failW: 1, lat: '88.3', good: true },
  { name: '101.6.6.91', req: 5153, reqW: 1, fail: 5153, failW: 1, lat: '-', good: false },
  { name: '120.56.74.73', req: 5039, reqW: 1, fail: 5039, failW: 1, lat: '-', good: false },
  { name: '192.144.253.229', req: 4904, reqW: 1, fail: 4901, failW: 1, lat: '-', good: false },
  { name: '36.103.167.65', req: 4713, reqW: 1, fail: 4713, failW: 1, lat: '-', good: false },
  { name: '166.111.7.7', req: 101689, reqW: 14, fail: 4361, failW: 1, lat: '88.61', good: true },
  { name: '47.92.151.123', req: 2375, reqW: 1, fail: 2375, failW: 1, lat: '-', good: false },
  { name: '111.205.134.59', req: 1123, reqW: 1, fail: 1123, failW: 1, lat: '-', good: false },
]
const srcPage = ref(1)
const srcPageSize = ref(20)
const srcPages = computed(() => Math.max(1, Math.ceil(srcRows.length / srcPageSize.value)))
const srcPagesArr = computed(() => {
  const total = srcPages.value
  const cur = srcPage.value
  const arr: number[] = []
  for (let i = 1; i <= Math.min(3, total); i++) arr.push(i)
  if (total > 3) arr.push(total)
  return arr
})
const pagedSrcRows = computed(() => {
  const start = (srcPage.value - 1) * srcPageSize.value
  return srcRows.slice(start, start + srcPageSize.value)
})

// ══════════════════════════════════════════════════════════════
// 目标IP表
// ═══════════════════════════════════════════════════════════
const dstRows: IpRow[] = [
  { name: '101.6.15.130', req: 912009, reqW: 100, fail: 634835, failW: 100, lat: '156.72', good: false },
  { name: '101.6.4.13', req: 117255, reqW: 13, fail: 8471, failW: 1, lat: '6.82', good: true },
  { name: '166.111.86.91', req: 11254, reqW: 1, fail: 8327, failW: 1, lat: '-', good: false },
  { name: '101.6.16.70', req: 131130, reqW: 14, fail: 5316, failW: 1, lat: '80.61', good: true },
  { name: '100.110.12.151', req: 8200, reqW: 1, fail: 5000, failW: 1, lat: '-', good: false },
  { name: '100.116.62.241', req: 8044, reqW: 1, fail: 5044, failW: 1, lat: '-', good: false },
  { name: '101.6.15.66', req: 123939, reqW: 14, fail: 5463, failW: 1, lat: '83.43', good: true },
  { name: '175.27.22.2', req: 3322, reqW: 1, fail: 3322, failW: 1, lat: '-', good: false },
  { name: '140.111.5.103', req: 9235, reqW: 1, fail: 3234, failW: 1, lat: '-', good: false },
  { name: '101.6.5.211', req: 2771, reqW: 1, fail: 2771, failW: 1, lat: '-', good: false },
  { name: '101.6.6.89', req: 7670, reqW: 1, fail: 2548, failW: 1, lat: '75.6', good: true },
  { name: '101.6.15.58', req: 51750, reqW: 6, fail: 2546, failW: 1, lat: '83.51', good: true },
  { name: '101.6.15.67', req: 64172, reqW: 7, fail: 2117, failW: 1, lat: '81.86', good: true },
  { name: '166.111.254.6', req: 36910, reqW: 4, fail: 5512, failW: 1, lat: '218.12', good: false },
  { name: '1.116.105.181', req: 1897, reqW: 1, fail: 1897, failW: 1, lat: '-', good: false },
  { name: '8.139.5.120', req: 1893, reqW: 1, fail: 1893, failW: 1, lat: '-', good: false },
  { name: '166.111.254.8', req: 94098, reqW: 10, fail: 1791, failW: 1, lat: '188.52', good: false },
  { name: '101.6.6.6', req: 823555, reqW: 90, fail: 1266, failW: 1, lat: '41.68', good: true },
  { name: '10.62.1.60', req: 1017, reqW: 1, fail: 1017, failW: 1, lat: '-', good: false },
]
const dstPage = ref(1)
const dstPageSize = ref(20)
const dstPages = computed(() => Math.max(1, Math.ceil(dstRows.length / dstPageSize.value)))
const dstPagesArr = computed(() => {
  const total = dstPages.value
  const cur = dstPage.value
  const arr: number[] = []
  for (let i = 1; i <= Math.min(3, total); i++) arr.push(i)
  if (total > 3) arr.push(total)
  return arr
})
const pagedDstRows = computed(() => {
  const start = (dstPage.value - 1) * dstPageSize.value
  return dstRows.slice(start, start + dstPageSize.value)
})

// ══════════════════════════════════════════════════════════════
// 目标域名表
// ═══════════════════════════════════════════════════════════
const domainRows: IpRow[] = [
  { name: 'mirrors.tuna.tsinghua...', req: 558916, reqW: 100, fail: 382934, failW: 100, lat: '153.85', good: false },
  { name: 'pypi.tuna.tsinghua.ed...', req: 149111, reqW: 27, fail: 224223, failW: 59, lat: '136.36', good: true },
  { name: 'archivesvrs.tuna.tsin...', req: 10271, reqW: 2, fail: 8474, failW: 2, lat: '193.97', good: false },
  { name: 'mirror.tuna.tsinghu...', req: 7814, reqW: 1, fail: 6041, failW: 2, lat: '183.45', good: false },
  { name: 'mirrors.tuna.tsingh...', req: 8736, reqW: 2, fail: 3919, failW: 1, lat: '278.86', good: false },
  { name: 'mirrors.tuna.tsingh...', req: 2497, reqW: 1, fail: 7739, failW: 2, lat: '150.23', good: true },
  { name: 'maven.ali.opj.com', req: 1063, reqW: 1, fail: 1003, failW: 1, lat: '-', good: false },
  { name: 'vigo.iie.nghua.edu.cn', req: 27642, reqW: 5, fail: 1004, failW: 1, lat: '41.5', good: true },
  { name: 'tsm.tsinghua.edu.cn', req: 24239, reqW: 4, fail: 845, failW: 1, lat: '36.92', good: true },
  { name: 'lib.tsinghua.edu.cn', req: 23134, reqW: 4, fail: 795, failW: 1, lat: '14.36', good: true },
  { name: 'www.tsinghua.edu.cn', req: 19007, reqW: 3, fail: 236, failW: 1, lat: '66.72', good: true },
  { name: 'pok.cn-claffles.macp....', req: 832, reqW: 1, fail: 691, failW: 1, lat: '380.5', good: false },
  { name: 'main.tsinghua.edu.cn', req: 15202, reqW: 3, fail: 862, failW: 1, lat: '104.41', good: true },
  { name: 'bot.med.tsinghua.ed...', req: 13755, reqW: 2, fail: 559, failW: 1, lat: '83.53', good: true },
  { name: 'cloud.tsinghua.edu.cn', req: 16032, reqW: 3, fail: 551, failW: 1, lat: '63.16', good: true },
  { name: 'auth4.tsinghua.edu.cn', req: 11547, reqW: 2, fail: 469, failW: 1, lat: '73.95', good: true },
  { name: 'cob.lib.tsinghua.edu....', req: 13614, reqW: 2, fail: 494, failW: 1, lat: '105.88', good: true },
  { name: 'mirrors.tuna.tengsh...', req: 742, reqW: 1, fail: 221, failW: 1, lat: '220.39', good: false },
  { name: 'if.sal.tsinghua.edu.cn', req: 13312, reqW: 2, fail: 448, failW: 1, lat: '33.99', good: true },
]
const domainPage = ref(1)
const domainPageSize = ref(20)
const domainPages = computed(() => Math.max(1, Math.ceil(domainRows.length / domainPageSize.value)))
const domainPagesArr = computed(() => {
  const total = domainPages.value
  const cur = domainPage.value
  const arr: number[] = []
  for (let i = 1; i <= Math.min(3, total); i++) arr.push(i)
  if (total > 3) arr.push(total)
  return arr
})
const pagedDomainRows = computed(() => {
  const start = (domainPage.value - 1) * domainPageSize.value
  return domainRows.slice(start, start + domainPageSize.value)
})

// ══════════════════════════════════════════════════════════════
// 通用详情弹窗工具
// ═══════════════════════════════════════════════════════════
function buildDetailChart(title: string, base: number): any {
  const x: string[] = []
  const data: number[] = []
  for (let h = 15; h <= 16; h++) {
    for (let m = 0; m < 60; m += 5) {
      if (h === 15 && m < 16) continue
      if (h === 16 && m > 32) continue
      const t = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      x.push(t)
      data.push(Math.round(base + Math.sin(m / 10) * 5000 + (h - 15) * 1000))
    }
  }
  return {
    tooltip: { trigger: 'axis' },
    title: { text: title, left: 'center', textStyle: { fontSize: 13 } },
    legend: { data: ['总请求数', '失败次数'], bottom: 0, textStyle: { fontSize: 11 } },
    grid: { left: 50, right: 20, top: 40, bottom: 40 },
    xAxis: { type: 'category', data: x, axisLabel: { fontSize: 10 } },
    yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
    series: [
      { name: '总请求数', type: 'bar', itemStyle: { color: '#409eff' }, data: data },
      { name: '失败次数', type: 'line', smooth: true, symbol: 'none', itemStyle: { color: '#f56c6c' }, data: data.map(v => Math.round(v * 0.45)) },
    ],
  }
}

function expandAll(title: string, count: number): IpRow[] {
  const rows: IpRow[] = []
  for (let i = 0; i < count; i++) {
    const req = 1000 + Math.floor(Math.random() * 50000)
    const fail = Math.floor(req * (0.2 + Math.random() * 0.5))
    const lat = Math.random() > 0.5 ? (50 + Math.random() * 200).toFixed(2) : '-'
    rows.push({
      name: `${title}-obj-${i + 1}-${(Math.random() * 1e9 | 0).toString(16)}`,
      req, reqW: 100,
      fail, failW: Math.min(100, Math.round((fail / Math.max(req, 1)) * 100)),
      lat, good: lat !== '-' && Number(lat) < 200,
    })
  }
  return rows
}

// ══════════════════════════════════════════════════════════════
// 应用协议 详情弹窗
// ═══════════════════════════════════════════════════════════
const protoDialogVisible = ref(false)
const protoDialogTitle = ref('')
const protoDialogChartOption = ref<any>({})
const protoDetailAllRows = ref<IpRow[]>([])
const protoDetailKeyword = ref('')
const protoDetailPage = ref(1)
const protoDetailPageSize = ref(20)
const protoDetailPages = computed(() => Math.max(1, Math.ceil(protoDetailAllRows.value.length / protoDetailPageSize.value)))
const protoDetailPagesArr = computed(() => {
  const total = protoDetailPages.value
  const cur = protoDetailPage.value
  const arr: number[] = []
  for (let i = 1; i <= total; i++) arr.push(i)
  return arr.slice(Math.max(0, cur - 1), Math.min(arr.length, cur + 2))
})
const protoDetailRows = computed(() => {
  const start = (protoDetailPage.value - 1) * protoDetailPageSize.value
  const filtered = protoDetailKeyword.value
    ? protoDetailAllRows.value.filter(r => r.name.includes(protoDetailKeyword.value))
    : protoDetailAllRows.value
  return filtered.slice(start, start + protoDetailPageSize.value)
})

function openProtoDetail(row: ProtoRow) {
  protoDialogTitle.value = row.name
  protoDialogChartOption.value = buildDetailChart(row.name, row.req / 80)
  protoDetailAllRows.value = expandAll(row.name, 42)
  protoDetailPage.value = 1
  protoDialogVisible.value = true
}

function openProtoExpand(key: string) {
  protoDialogTitle.value = '应用协议-' + key
  protoDialogChartOption.value = buildDetailChart('应用协议', 8000)
  protoDetailAllRows.value = expandAll('proto', 42)
  protoDetailPage.value = 1
  protoDialogVisible.value = true
}

// ══════════════════════════════════════════════════════════════
// 源IP 详情弹窗
// ═══════════════════════════════════════════════════════════
const srcDialogVisible = ref(false)
const srcDialogTitle = ref('')
const srcDialogChartOption = ref<any>({})
const srcDetailAllRows = ref<IpRow[]>([])
const srcDetailKeyword = ref('')
const srcDetailPage = ref(1)
const srcDetailPageSize = ref(20)
const srcDetailPages = computed(() => Math.max(1, Math.ceil(srcDetailAllRows.value.length / srcDetailPageSize.value)))
const srcDetailPagesArr = computed(() => {
  const total = srcDetailPages.value
  const cur = srcDetailPage.value
  const arr: number[] = []
  for (let i = 1; i <= total; i++) arr.push(i)
  return arr.slice(Math.max(0, cur - 1), Math.min(arr.length, cur + 2))
})
const srcDetailRows = computed(() => {
  const start = (srcDetailPage.value - 1) * srcDetailPageSize.value
  const filtered = srcDetailKeyword.value
    ? srcDetailAllRows.value.filter(r => r.name.includes(srcDetailKeyword.value))
    : srcDetailAllRows.value
  return filtered.slice(start, start + srcDetailPageSize.value)
})

function openSrcDetail(row: IpRow) {
  srcDialogTitle.value = row.name
  srcDialogChartOption.value = buildDetailChart(row.name, row.req / 80)
  srcDetailAllRows.value = expandAll(row.name, 30)
  srcDetailPage.value = 1
  srcDialogVisible.value = true
}

function openSrcExpand() {
  srcDialogTitle.value = '源IP-全量'
  srcDialogChartOption.value = buildDetailChart('源IP', 6000)
  srcDetailAllRows.value = expandAll('src', 30)
  srcDetailPage.value = 1
  srcDialogVisible.value = true
}

// ══════════════════════════════════════════════════════════════
// 目标IP 详情弹窗
// ═══════════════════════════════════════════════════════════
const dstDialogVisible = ref(false)
const dstDialogTitle = ref('')
const dstDialogChartOption = ref<any>({})
const dstDetailAllRows = ref<IpRow[]>([])
const dstDetailKeyword = ref('')
const dstDetailPage = ref(1)
const dstDetailPageSize = ref(20)
const dstDetailPages = computed(() => Math.max(1, Math.ceil(dstDetailAllRows.value.length / dstDetailPageSize.value)))
const dstDetailPagesArr = computed(() => {
  const total = dstDetailPages.value
  const cur = dstDetailPage.value
  const arr: number[] = []
  for (let i = 1; i <= total; i++) arr.push(i)
  return arr.slice(Math.max(0, cur - 1), Math.min(arr.length, cur + 2))
})
const dstDetailRows = computed(() => {
  const start = (dstDetailPage.value - 1) * dstDetailPageSize.value
  const filtered = dstDetailKeyword.value
    ? dstDetailAllRows.value.filter(r => r.name.includes(dstDetailKeyword.value))
    : dstDetailAllRows.value
  return filtered.slice(start, start + dstDetailPageSize.value)
})

function openDstDetail(row: IpRow) {
  dstDialogTitle.value = row.name
  dstDialogChartOption.value = buildDetailChart(row.name, row.req / 80)
  dstDetailAllRows.value = expandAll(row.name, 26)
  dstDetailPage.value = 1
  dstDialogVisible.value = true
}

function openDstExpand() {
  dstDialogTitle.value = '目标IP-全量'
  dstDialogChartOption.value = buildDetailChart('目标IP', 7000)
  dstDetailAllRows.value = expandAll('dst', 26)
  dstDetailPage.value = 1
  dstDialogVisible.value = true
}

// ══════════════════════════════════════════════════════════════
// 目标域名 详情弹窗
// ═══════════════════════════════════════════════════════════
const domainDialogVisible = ref(false)
const domainDialogTitle = ref('')
const domainDialogChartOption = ref<any>({})
const domainDetailAllRows = ref<IpRow[]>([])
const domainDetailKeyword = ref('')
const domainDetailPage = ref(1)
const domainDetailPageSize = ref(20)
const domainDetailPages = computed(() => Math.max(1, Math.ceil(domainDetailAllRows.value.length / domainDetailPageSize.value)))
const domainDetailPagesArr = computed(() => {
  const total = domainDetailPages.value
  const cur = domainDetailPage.value
  const arr: number[] = []
  for (let i = 1; i <= total; i++) arr.push(i)
  return arr.slice(Math.max(0, cur - 1), Math.min(arr.length, cur + 2))
})
const domainDetailRows = computed(() => {
  const start = (domainDetailPage.value - 1) * domainDetailPageSize.value
  const filtered = domainDetailKeyword.value
    ? domainDetailAllRows.value.filter(r => r.name.includes(domainDetailKeyword.value))
    : domainDetailAllRows.value
  return filtered.slice(start, start + domainDetailPageSize.value)
})

function openDomainDetail(row: IpRow) {
  domainDialogTitle.value = row.name
  domainDialogChartOption.value = buildDetailChart(row.name, row.req / 80)
  domainDetailAllRows.value = expandAll(row.name, 24)
  domainDetailPage.value = 1
  domainDialogVisible.value = true
}

function openDomainExpand() {
  domainDialogTitle.value = '目标域名-全量'
  domainDialogChartOption.value = buildDetailChart('目标域名', 5000)
  domainDetailAllRows.value = expandAll('domain', 24)
  domainDetailPage.value = 1
  domainDialogVisible.value = true
}
</script>

<style scoped>
.pq-scroll { flex:1; min-height:0; overflow:auto; display:flex; flex-direction:column; gap:12px; padding:12px; }
.pqd-mid-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.pqd-bottom-grid { display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:12px; }
.pq-unit { font-size:12px; color:#909399; margin-left:-4px; }
.pq-table th, .pq-table td { font-size:12px; padding:6px 8px; }
.pq-bar-col { width:160px; }
.pq-bar-cell { display:flex; align-items:center; gap:6px; }
.pq-bar-track { flex:1; height:6px; background:#f0f2f5; border-radius:3px; overflow:hidden; min-width:40px; }
.pq-bar-fill { display:block; height:100%; background:#409eff; border-radius:3px; }
.pq-bar-fill-fail { background:#f56c6c; }
.pq-bar-val { font-variant-numeric:tabular-nums; min-width:56px; text-align:right; font-size:11px; color:#606266; }
.pq-latency-badge { display:inline-block; padding:1px 8px; border-radius:2px; font-size:11px; font-weight:600; background:#fef0f0; color:#f56c6c; font-variant-numeric:tabular-nums; }
.pq-latency-good { background:#f0f9eb; color:#67c23a; }
.dt-ellipsis { display:inline-block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; vertical-align:bottom; max-width:200px; }
@media (max-width:1280px) {
  .pqd-mid-grid { grid-template-columns:1fr; }
  .pqd-bottom-grid { grid-template-columns:1fr; }
}
</style>
