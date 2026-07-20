<template>
  <div class="nv-border-card">
    <!-- Protocol tabs -->
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav" role="tablist" aria-label="重点协议">
        <button v-for="p in protocols" :key="p" type="button" class="nv-tab" :class="{ active: activeProtocol === p }" @click="activeProtocol = p">{{ p }}</button>
      </div>
    </div>
    <div class="nv-tabs-body">
      <div v-for="p in protocols" :key="p" class="kp-protocol-content" :class="{ active: activeProtocol === p }">
        <!-- Sub tabs -->
        <div class="kp-subtabs">
          <button type="button" class="kp-subtab" :class="{ active: subTab === 'realtime' }" @click="subTab = 'realtime'">实时分析</button>
          <button type="button" class="kp-subtab" :class="{ active: subTab === 'history' }" @click="subTab = 'history'">历史分析</button>
        </div>

        <!-- ==================== TCP 实时分析 ==================== -->
        <div v-if="subTab === 'realtime' && p === 'TCP'" class="pq-rt-layout">
          <div class="pq-rt-left">
            <!-- 时延趋势 -->
            <div class="pq-rt-card">
              <div class="pq-rt-card-header">
                <span class="pq-rt-card-title">时延趋势</span>
                <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
              </div>
              <div class="pq-rt-card-body">
                <v-chart :option="rtLatencyTrendOption" autoresize style="width:100%;height:280px" />
                <div class="pq-rt-stats">
                  <span class="pq-rt-stat"><span class="pq-rt-stat-label">最大值</span><span class="pq-rt-stat-val">{{ rtLatencyMax }}</span></span>
                  <span class="pq-rt-stat"><span class="pq-rt-stat-label">最小值</span><span class="pq-rt-stat-val">{{ rtLatencyMin }}</span></span>
                  <span class="pq-rt-stat"><span class="pq-rt-stat-label">平均值</span><span class="pq-rt-stat-val">{{ rtLatencyAvg }}</span></span>
                </div>
              </div>
            </div>
            <!-- 平均时延趋势 -->
            <div class="pq-rt-card">
              <div class="pq-rt-card-header">
                <span class="pq-rt-card-title">平均时延趋势</span>
                <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
              </div>
              <div class="pq-rt-card-body">
                <v-chart :option="rtAvgLatencyOption" autoresize style="width:100%;height:200px" />
                <div class="pq-rt-stats">
                  <span class="pq-rt-stat"><span class="pq-rt-stat-label">最大值</span><span class="pq-rt-stat-val">{{ rtAvgMax }} ms</span></span>
                  <span class="pq-rt-stat"><span class="pq-rt-stat-label">最小值</span><span class="pq-rt-stat-val">{{ rtAvgMin }} ms</span></span>
                  <span class="pq-rt-stat"><span class="pq-rt-stat-label">平均值</span><span class="pq-rt-stat-val">{{ rtAvgAvg }} ms</span></span>
                </div>
              </div>
            </div>
            <!-- 失败率趋势 -->
            <div class="pq-rt-card">
              <div class="pq-rt-card-header">
                <span class="pq-rt-card-title">失败率趋势</span>
                <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
              </div>
              <div class="pq-rt-card-body">
                <v-chart :option="rtFailRateOption" autoresize style="width:100%;height:200px" />
                <div class="pq-rt-stats">
                  <span class="pq-rt-stat"><span class="pq-rt-stat-label">最大值</span><span class="pq-rt-stat-val">{{ rtFailMax }}%</span></span>
                  <span class="pq-rt-stat"><span class="pq-rt-stat-label">最小值</span><span class="pq-rt-stat-val">{{ rtFailMin }}%</span></span>
                  <span class="pq-rt-stat"><span class="pq-rt-stat-label">平均值</span><span class="pq-rt-stat-val">{{ rtFailAvg }}%</span></span>
                </div>
              </div>
            </div>
          </div>
          <div class="pq-rt-right">
            <!-- 时延分布 -->
            <div class="pq-rt-card">
              <div class="pq-rt-card-header">
                <span class="pq-rt-card-title">时延分布</span>
                <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
              </div>
              <div class="pq-rt-card-body pq-rt-pie-body">
                <v-chart :option="rtPieOption" autoresize style="width:100%;height:220px" />
              </div>
            </div>
            <!-- 质量源 -->
            <div class="pq-rt-card">
              <div class="pq-rt-card-header">
                <span class="pq-rt-card-title">质量源</span>
                <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
              </div>
              <div class="pq-rt-card-body pq-rt-table-body">
                <table class="pq-rt-table">
                  <thead>
                    <tr>
                      <th style="width:40px">序号</th>
                      <th>IP地址</th>
                      <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                      <th>失败次数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                      <th>平均时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, idx) in rtSrcData" :key="idx">
                      <td>{{ idx + 1 }}</td>
                      <td><span class="pq-ip-link" @click="openRtSrcPopup(row.ip)">{{ row.ip }}</span></td>
                      <td class="pq-num">{{ row.totalReq }}</td>
                      <td class="pq-num">{{ row.failCount }}</td>
                      <td class="pq-num">{{ row.avgLatency }}</td>
                    </tr>
                    <tr v-if="rtSrcData.length === 0">
                      <td colspan="5" class="ou-empty">无数据</td>
                    </tr>
                  </tbody>
                </table>
                <div class="pq-footer">
                  <div class="pq-pager">
                    <button class="pq-page-btn" @click="rtSrcPage > 1 && rtSrcPage--">‹</button>
                    <button v-for="pg in rtSrcPages" :key="pg" class="pq-page-btn" :class="{ active: pg === rtSrcPage }" @click="rtSrcPage = pg">{{ pg }}</button>
                    <button class="pq-page-btn" @click="rtSrcPage < rtSrcPages && rtSrcPage++">›</button>
                    <span style="margin-left:8px;font-size:12px;color:#909399">到第</span>
                    <input class="pq-page-goto" v-model.number="rtSrcGoto" />
                    <span style="font-size:12px;color:#909399">页</span>
                    <button class="pq-page-goto-btn" @click="rtSrcPage = rtSrcGoto; rtSrcGoto = rtSrcPage">确定</button>
                  </div>
                  <span style="font-size:12px;color:#909399">共 {{ rtSrcData.length }} 条</span>
                </div>
              </div>
            </div>
            <!-- 质量目标 -->
            <div class="pq-rt-card">
              <div class="pq-rt-card-header">
                <span class="pq-rt-card-title">质量目标</span>
                <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
              </div>
              <div class="pq-rt-card-body pq-rt-table-body">
                <table class="pq-rt-table">
                  <thead>
                    <tr>
                      <th style="width:40px">序号</th>
                      <th>IP地址</th>
                      <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                      <th>失败次数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                      <th>平均时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, idx) in rtDstData" :key="idx">
                      <td>{{ idx + 1 }}</td>
                      <td><span class="pq-ip-link" @click="openRtDstPopup(row.ip)">{{ row.ip }}</span></td>
                      <td class="pq-num">{{ row.totalReq }}</td>
                      <td class="pq-num">{{ row.failCount }}</td>
                      <td class="pq-num">{{ row.avgLatency }}</td>
                    </tr>
                    <tr v-if="rtDstData.length === 0">
                      <td colspan="5" class="ou-empty">无数据</td>
                    </tr>
                  </tbody>
                </table>
                <div class="pq-footer">
                  <div class="pq-pager">
                    <button class="pq-page-btn" @click="rtDstPage > 1 && rtDstPage--">‹</button>
                    <button v-for="pg in rtDstPages" :key="pg" class="pq-page-btn" :class="{ active: pg === rtDstPage }" @click="rtDstPage = pg">{{ pg }}</button>
                    <button class="pq-page-btn" @click="rtDstPage < rtDstPages && rtDstPage++">›</button>
                  </div>
                  <span style="font-size:12px;color:#909399">共 {{ rtDstData.length }} 条</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ==================== DNS 实时分析 ==================== -->
        <div v-if="subTab === 'realtime' && p === 'DNS'" class="pq-rt-layout">
          <div class="pq-rt-left">
            <!-- 时延趋势 -->
            <div class="pq-rt-card">
              <div class="pq-rt-card-header">
                <span class="pq-rt-card-title">时延趋势</span>
                <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
              </div>
              <div class="pq-rt-card-body">
                <v-chart :option="dnsRtLatencyTrendOption" autoresize style="width:100%;height:280px" />
                <div class="pq-rt-stats">
                  <span class="pq-rt-stat"><span class="pq-rt-stat-label">最大值</span><span class="pq-rt-stat-val">{{ dnsRtLatencyMax }}</span></span>
                  <span class="pq-rt-stat"><span class="pq-rt-stat-label">最小值</span><span class="pq-rt-stat-val">{{ dnsRtLatencyMin }}</span></span>
                  <span class="pq-rt-stat"><span class="pq-rt-stat-label">平均值</span><span class="pq-rt-stat-val">{{ dnsRtLatencyAvg }}</span></span>
                </div>
              </div>
            </div>
            <!-- 请求趋势 -->
            <div class="pq-rt-card">
              <div class="pq-rt-card-header">
                <span class="pq-rt-card-title">请求趋势</span>
                <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
              </div>
              <div class="pq-rt-card-body">
                <v-chart :option="dnsRtRequestTrendOption" autoresize style="width:100%;height:200px" />
                <div class="pq-rt-stats">
                  <span class="pq-rt-stat"><span class="pq-rt-stat-label">最大值</span><span class="pq-rt-stat-val">{{ dnsRtReqMax }}</span></span>
                  <span class="pq-rt-stat"><span class="pq-rt-stat-label">最小值</span><span class="pq-rt-stat-val">{{ dnsRtReqMin }}</span></span>
                  <span class="pq-rt-stat"><span class="pq-rt-stat-label">平均值</span><span class="pq-rt-stat-val">{{ dnsRtReqAvg }}</span></span>
                </div>
              </div>
            </div>
            <!-- 失败率趋势 -->
            <div class="pq-rt-card">
              <div class="pq-rt-card-header">
                <span class="pq-rt-card-title">失败率趋势</span>
                <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
              </div>
              <div class="pq-rt-card-body">
                <v-chart :option="dnsRtFailRateOption" autoresize style="width:100%;height:200px" />
                <div class="pq-rt-stats">
                  <span class="pq-rt-stat"><span class="pq-rt-stat-label">最大值</span><span class="pq-rt-stat-val">{{ dnsRtFailMax }}%</span></span>
                  <span class="pq-rt-stat"><span class="pq-rt-stat-label">最小值</span><span class="pq-rt-stat-val">{{ dnsRtFailMin }}%</span></span>
                  <span class="pq-rt-stat"><span class="pq-rt-stat-label">平均值</span><span class="pq-rt-stat-val">{{ dnsRtFailAvg }}%</span></span>
                </div>
              </div>
            </div>
            <!-- 平均时延 -->
            <div class="pq-rt-card">
              <div class="pq-rt-card-header">
                <span class="pq-rt-card-title">平均时延</span>
                <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
              </div>
              <div class="pq-rt-card-body" style="display:flex;align-items:center;justify-content:center;min-height:120px">
                <span style="font-size:36px;font-weight:700;color:#303133">{{ dnsRtAvgLatency }}</span>
              </div>
            </div>
          </div>
          <div class="pq-rt-right">
            <!-- 时延分布 -->
            <div class="pq-rt-card">
              <div class="pq-rt-card-header">
                <span class="pq-rt-card-title">时延分布</span>
                <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
              </div>
              <div class="pq-rt-card-body pq-rt-pie-body">
                <v-chart :option="dnsRtPieOption" autoresize style="width:100%;height:220px" />
              </div>
            </div>
            <!-- Top服务器 -->
            <div class="pq-rt-card">
              <div class="pq-rt-card-header">
                <span class="pq-rt-card-title">Top服务器</span>
                <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
              </div>
              <div class="pq-rt-card-body pq-rt-table-body">
                <table class="pq-rt-table">
                  <thead>
                    <tr>
                      <th style="width:40px">序号</th>
                      <th>IP地址</th>
                      <th>总请求 <el-icon class="sort-icon"><Sort /></el-icon></th>
                      <th>失败次数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                      <th>平均时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, idx) in dnsRtTopServerData" :key="idx">
                      <td>{{ idx + 1 }}</td>
                      <td><span class="pq-ip-link" @click="openDnsRtTopServerPopup(row.ip)">{{ row.ip }}</span></td>
                      <td class="pq-num">{{ row.totalReq }}</td>
                      <td class="pq-num">{{ row.failCount }}</td>
                      <td class="pq-num">{{ row.avgLatency }}</td>
                    </tr>
                    <tr v-if="dnsRtTopServerData.length === 0">
                      <td colspan="5" class="ou-empty">无数据</td>
                    </tr>
                  </tbody>
                </table>
                <div class="pq-footer">
                  <div class="pq-pager">
                    <button class="pq-page-btn" @click="dnsRtTopServerPage > 1 && dnsRtTopServerPage--">‹</button>
                    <button v-for="pg in dnsRtTopServerPages" :key="pg" class="pq-page-btn" :class="{ active: pg === dnsRtTopServerPage }" @click="dnsRtTopServerPage = pg">{{ pg }}</button>
                    <button class="pq-page-btn" @click="dnsRtTopServerPage < dnsRtTopServerPages && dnsRtTopServerPage++">›</button>
                    <span style="margin-left:8px;font-size:12px;color:#909399">到第</span>
                    <input class="pq-page-goto" v-model.number="dnsRtTopServerGoto" />
                    <span style="font-size:12px;color:#909399">页</span>
                    <button class="pq-page-goto-btn" @click="dnsRtTopServerPage = dnsRtTopServerGoto; dnsRtTopServerGoto = dnsRtTopServerPage">确定</button>
                  </div>
                  <span style="font-size:12px;color:#909399">共 {{ dnsRtTopServerData.length }} 条</span>
                </div>
              </div>
            </div>
            <!-- 质量域名 -->
            <div class="pq-rt-card">
              <div class="pq-rt-card-header">
                <span class="pq-rt-card-title">质量域名</span>
                <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
              </div>
              <div class="pq-rt-card-body pq-rt-table-body">
                <table class="pq-rt-table">
                  <thead>
                    <tr>
                      <th style="width:40px">序号</th>
                      <th>域名</th>
                      <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                      <th>失败次数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                      <th>平均时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, idx) in dnsRtQualityDomainData" :key="idx">
                      <td>{{ idx + 1 }}</td>
                      <td><span class="pq-ip-link" @click="openDnsRtDomainPopup(row.domain)">{{ row.domain }}</span></td>
                      <td class="pq-num">{{ row.totalReq }}</td>
                      <td class="pq-num">{{ row.failCount }}</td>
                      <td class="pq-num">{{ row.avgLatency }}</td>
                    </tr>
                    <tr v-if="dnsRtQualityDomainData.length === 0">
                      <td colspan="5" class="ou-empty">无数据</td>
                    </tr>
                  </tbody>
                </table>
                <div class="pq-footer">
                  <div class="pq-pager">
                    <button class="pq-page-btn" @click="dnsRtDomainPage > 1 && dnsRtDomainPage--">‹</button>
                    <button v-for="pg in dnsRtDomainPages" :key="pg" class="pq-page-btn" :class="{ active: pg === dnsRtDomainPage }" @click="dnsRtDomainPage = pg">{{ pg }}</button>
                    <button class="pq-page-btn" @click="dnsRtDomainPage < dnsRtDomainPages && dnsRtDomainPage++">›</button>
                  </div>
                  <span style="font-size:12px;color:#909399">共 {{ dnsRtQualityDomainData.length }} 条</span>
                </div>
              </div>
            </div>
            <!-- 质量源 -->
            <div class="pq-rt-card">
              <div class="pq-rt-card-header">
                <span class="pq-rt-card-title">质量源</span>
                <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
              </div>
              <div class="pq-rt-card-body pq-rt-table-body">
                <table class="pq-rt-table">
                  <thead>
                    <tr>
                      <th style="width:40px">序号</th>
                      <th>IP地址</th>
                      <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                      <th>失败次数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                      <th>平均时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, idx) in dnsRtSrcData" :key="idx">
                      <td>{{ idx + 1 }}</td>
                      <td><span class="pq-ip-link" @click="openDnsRtSrcPopup(row.ip)">{{ row.ip }}</span></td>
                      <td class="pq-num">{{ row.totalReq }}</td>
                      <td class="pq-num">{{ row.failCount }}</td>
                      <td class="pq-num">{{ row.avgLatency }}</td>
                    </tr>
                    <tr v-if="dnsRtSrcData.length === 0">
                      <td colspan="5" class="ou-empty">无数据</td>
                    </tr>
                  </tbody>
                </table>
                <div class="pq-footer">
                  <div class="pq-pager">
                    <button class="pq-page-btn" @click="dnsRtSrcPage > 1 && dnsRtSrcPage--">‹</button>
                    <button v-for="pg in dnsRtSrcPages" :key="pg" class="pq-page-btn" :class="{ active: pg === dnsRtSrcPage }" @click="dnsRtSrcPage = pg">{{ pg }}</button>
                    <button class="pq-page-btn" @click="dnsRtSrcPage < dnsRtSrcPages && dnsRtSrcPage++">›</button>
                  </div>
                  <span style="font-size:12px;color:#909399">共 {{ dnsRtSrcData.length }} 条</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ==================== TCP 历史分析 ==================== -->
        <div v-if="subTab === 'history' && p === 'TCP'" class="pq-history-wrapper">
          <!-- Toolbar -->
          <div class="pq-history-toolbar">
            <div class="pq-history-time">
              <span class="pq-history-time-label">时间范围</span>
              <el-date-picker
                v-model="historyDateRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width:380px"
                size="default"
              />
            </div>
            <div class="pq-history-latency">
              <span class="pq-history-latency-label">质量时延=</span>
              <el-input-number
                v-model="historyQualityLatency"
                :min="0"
                :step="1"
                controls-position="right"
                style="width:100px"
                size="default"
              />
            </div>
            <button class="ou-search-btn" @click="doHistorySearch">
              <el-icon><Search /></el-icon>
            </button>
            <button class="secondary pq-reset-btn" @click="resetHistoryFilters">重置</button>
          </div>
          <!-- Content grid -->
          <div class="pq-rt-layout">
            <div class="pq-rt-left">
              <!-- 客户端时延趋势 -->
              <div class="pq-rt-card">
                <div class="pq-rt-card-header">
                  <span class="pq-rt-card-title">客户端时延趋势</span>
                  <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
                </div>
                <div class="pq-rt-card-body">
                  <v-chart :option="hdClientLatencyOption" autoresize style="width:100%;height:220px" />
                  <div class="pq-rt-stats">
                    <span class="pq-rt-stat"><span class="pq-rt-stat-label">最大值</span><span class="pq-rt-stat-val">{{ hdClientMax }}</span></span>
                    <span class="pq-rt-stat"><span class="pq-rt-stat-label">最小值</span><span class="pq-rt-stat-val">{{ hdClientMin }}</span></span>
                    <span class="pq-rt-stat"><span class="pq-rt-stat-label">平均值</span><span class="pq-rt-stat-val">{{ hdClientAvg }}</span></span>
                  </div>
                </div>
              </div>
              <!-- 服务端时延趋势 -->
              <div class="pq-rt-card">
                <div class="pq-rt-card-header">
                  <span class="pq-rt-card-title">服务端时延趋势</span>
                  <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
                </div>
                <div class="pq-rt-card-body">
                  <v-chart :option="hdServerLatencyOption" autoresize style="width:100%;height:220px" />
                  <div class="pq-rt-stats">
                    <span class="pq-rt-stat"><span class="pq-rt-stat-label">最大值</span><span class="pq-rt-stat-val">{{ hdServerMax }}</span></span>
                    <span class="pq-rt-stat"><span class="pq-rt-stat-label">最小值</span><span class="pq-rt-stat-val">{{ hdServerMin }}</span></span>
                    <span class="pq-rt-stat"><span class="pq-rt-stat-label">平均值</span><span class="pq-rt-stat-val">{{ hdServerAvg }}</span></span>
                  </div>
                </div>
              </div>
              <!-- 连接失败率 -->
              <div class="pq-rt-card">
                <div class="pq-rt-card-header">
                  <span class="pq-rt-card-title">连接失败率</span>
                  <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
                </div>
                <div class="pq-rt-card-body">
                  <v-chart :option="hdFailRateOption" autoresize style="width:100%;height:200px" />
                  <div class="pq-rt-stats">
                    <span class="pq-rt-stat"><span class="pq-rt-stat-label">最大值</span><span class="pq-rt-stat-val">{{ hdFailMax }}%</span></span>
                    <span class="pq-rt-stat"><span class="pq-rt-stat-label">最小值</span><span class="pq-rt-stat-val">{{ hdFailMin }}%</span></span>
                    <span class="pq-rt-stat"><span class="pq-rt-stat-label">平均值</span><span class="pq-rt-stat-val">{{ hdFailAvg }}%</span></span>
                  </div>
                </div>
              </div>
              <!-- 平均时延趋势 -->
              <div class="pq-rt-card">
                <div class="pq-rt-card-header">
                  <span class="pq-rt-card-title">平均时延趋势</span>
                  <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
                </div>
                <div class="pq-rt-card-body">
                  <v-chart :option="hdAvgLatencyOption" autoresize style="width:100%;height:160px" />
                </div>
              </div>
            </div>
            <div class="pq-rt-right">
              <!-- 客户端时延分布 -->
              <div class="pq-rt-card">
                <div class="pq-rt-card-header">
                  <span class="pq-rt-card-title">客户端时延分布</span>
                  <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
                </div>
                <div class="pq-rt-card-body pq-rt-pie-body">
                  <v-chart :option="hdClientPieOption" autoresize style="width:100%;height:200px" />
                </div>
              </div>
              <!-- 服务端时延分布 -->
              <div class="pq-rt-card">
                <div class="pq-rt-card-header">
                  <span class="pq-rt-card-title">服务端时延分布</span>
                  <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
                </div>
                <div class="pq-rt-card-body pq-rt-pie-body">
                  <v-chart :option="hdServerPieOption" autoresize style="width:100%;height:200px" />
                </div>
              </div>
              <!-- 质量源 -->
              <div class="pq-rt-card">
                <div class="pq-rt-card-header">
                  <span class="pq-rt-card-title">质量源</span>
                  <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
                </div>
                <div class="pq-rt-card-body pq-rt-table-body">
                  <table class="pq-rt-table">
                    <thead>
                      <tr>
                        <th style="width:40px">序号</th>
                        <th>IP地址</th>
                        <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                        <th>失败次数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                        <th>平均时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, idx) in hdSrcData" :key="idx">
                        <td>{{ idx + 1 }}</td>
                        <td><span class="pq-ip-link" @click="openHdSrcPopup(row.ip)">{{ row.ip }}</span></td>
                        <td class="pq-num">{{ row.totalReq }}</td>
                        <td class="pq-num">{{ row.failCount }}</td>
                        <td class="pq-num">{{ row.avgLatency }}</td>
                      </tr>
                      <tr v-if="hdSrcData.length === 0">
                        <td colspan="5" class="ou-empty">无数据</td>
                      </tr>
                    </tbody>
                  </table>
                  <div class="pq-footer">
                    <div class="pq-pager">
                      <button class="pq-page-btn" @click="hdSrcPage > 1 && hdSrcPage--">‹</button>
                      <button v-for="pg in hdSrcPages" :key="pg" class="pq-page-btn" :class="{ active: pg === hdSrcPage }" @click="hdSrcPage = pg">{{ pg }}</button>
                      <button class="pq-page-btn" @click="hdSrcPage < hdSrcPages && hdSrcPage++">›</button>
                      <span style="margin-left:8px;font-size:12px;color:#909399">到第</span>
                      <input class="pq-page-goto" v-model.number="hdSrcGoto" />
                      <span style="font-size:12px;color:#909399">页</span>
                      <button class="pq-page-goto-btn" @click="hdSrcPage = hdSrcGoto; hdSrcGoto = hdSrcPage">确定</button>
                    </div>
                    <span style="font-size:12px;color:#909399">共 {{ hdSrcData.length }} 条</span>
                  </div>
                </div>
              </div>
              <!-- 质量目标 -->
              <div class="pq-rt-card">
                <div class="pq-rt-card-header">
                  <span class="pq-rt-card-title">质量目标</span>
                  <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
                </div>
                <div class="pq-rt-card-body pq-rt-table-body">
                  <table class="pq-rt-table">
                    <thead>
                      <tr>
                        <th style="width:40px">序号</th>
                        <th>IP地址</th>
                        <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                        <th>失败次数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                        <th>平均时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, idx) in hdDstData" :key="idx">
                        <td>{{ idx + 1 }}</td>
                        <td><span class="pq-ip-link" @click="openHdDstPopup(row.ip)">{{ row.ip }}</span></td>
                        <td class="pq-num">{{ row.totalReq }}</td>
                        <td class="pq-num">{{ row.failCount }}</td>
                        <td class="pq-num">{{ row.avgLatency }}</td>
                      </tr>
                      <tr v-if="hdDstData.length === 0">
                        <td colspan="5" class="ou-empty">无数据</td>
                      </tr>
                    </tbody>
                  </table>
                  <div class="pq-footer">
                    <div class="pq-pager">
                      <button class="pq-page-btn" @click="hdDstPage > 1 && hdDstPage--">‹</button>
                      <button v-for="pg in hdDstPages" :key="pg" class="pq-page-btn" :class="{ active: pg === hdDstPage }" @click="hdDstPage = pg">{{ pg }}</button>
                      <button class="pq-page-btn" @click="hdDstPage < hdDstPages && hdDstPage++">›</button>
                    </div>
                    <span style="font-size:12px;color:#909399">共 {{ hdDstData.length }} 条</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ==================== DNS 历史分析 ==================== -->
        <div v-if="subTab === 'history' && p === 'DNS'" class="pq-history-wrapper">
          <!-- Toolbar -->
          <div class="pq-history-toolbar">
            <div class="pq-history-time">
              <span class="pq-history-time-label">时间范围</span>
              <el-date-picker
                v-model="dnsHistoryDateRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width:380px"
                size="default"
              />
            </div>
            <div class="pq-history-latency">
              <span class="pq-history-latency-label">质量时延=</span>
              <el-input-number
                v-model="dnsHistoryQualityLatency"
                :min="0"
                :step="1"
                controls-position="right"
                style="width:100px"
                size="default"
              />
            </div>
            <button class="ou-search-btn" @click="doDnsHistorySearch">
              <el-icon><Search /></el-icon>
            </button>
            <button class="secondary pq-reset-btn" @click="resetDnsHistoryFilters">重置</button>
          </div>
          <!-- Content grid -->
          <div class="pq-rt-layout">
            <div class="pq-rt-left">
              <!-- 时延趋势 -->
              <div class="pq-rt-card">
                <div class="pq-rt-card-header">
                  <span class="pq-rt-card-title">时延趋势</span>
                  <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
                </div>
                <div class="pq-rt-card-body">
                  <v-chart :option="dnsHdLatencyTrendOption" autoresize style="width:100%;height:220px" />
                  <div class="pq-rt-stats">
                    <span class="pq-rt-stat"><span class="pq-rt-stat-label">最大值</span><span class="pq-rt-stat-val">{{ dnsHdLatencyMax }}</span></span>
                    <span class="pq-rt-stat"><span class="pq-rt-stat-label">最小值</span><span class="pq-rt-stat-val">{{ dnsHdLatencyMin }}</span></span>
                    <span class="pq-rt-stat"><span class="pq-rt-stat-label">平均值</span><span class="pq-rt-stat-val">{{ dnsHdLatencyAvg }}</span></span>
                  </div>
                </div>
              </div>
              <!-- 请求趋势 -->
              <div class="pq-rt-card">
                <div class="pq-rt-card-header">
                  <span class="pq-rt-card-title">请求趋势</span>
                  <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
                </div>
                <div class="pq-rt-card-body">
                  <v-chart :option="dnsHdRequestTrendOption" autoresize style="width:100%;height:200px" />
                  <div class="pq-rt-stats">
                    <span class="pq-rt-stat"><span class="pq-rt-stat-label">最大值</span><span class="pq-rt-stat-val">{{ dnsHdReqMax }}</span></span>
                    <span class="pq-rt-stat"><span class="pq-rt-stat-label">最小值</span><span class="pq-rt-stat-val">{{ dnsHdReqMin }}</span></span>
                    <span class="pq-rt-stat"><span class="pq-rt-stat-label">平均值</span><span class="pq-rt-stat-val">{{ dnsHdReqAvg }}</span></span>
                  </div>
                </div>
              </div>
              <!-- 失败率趋势 -->
              <div class="pq-rt-card">
                <div class="pq-rt-card-header">
                  <span class="pq-rt-card-title">失败率趋势</span>
                  <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
                </div>
                <div class="pq-rt-card-body">
                  <v-chart :option="dnsHdFailRateOption" autoresize style="width:100%;height:200px" />
                  <div class="pq-rt-stats">
                    <span class="pq-rt-stat"><span class="pq-rt-stat-label">最大值</span><span class="pq-rt-stat-val">{{ dnsHdFailMax }}%</span></span>
                    <span class="pq-rt-stat"><span class="pq-rt-stat-label">最小值</span><span class="pq-rt-stat-val">{{ dnsHdFailMin }}%</span></span>
                    <span class="pq-rt-stat"><span class="pq-rt-stat-label">平均值</span><span class="pq-rt-stat-val">{{ dnsHdFailAvg }}%</span></span>
                  </div>
                </div>
              </div>
              <!-- 平均时延 -->
              <div class="pq-rt-card">
                <div class="pq-rt-card-header">
                  <span class="pq-rt-card-title">平均时延</span>
                  <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
                </div>
                <div class="pq-rt-card-body" style="display:flex;align-items:center;justify-content:center;min-height:120px">
                  <span style="font-size:36px;font-weight:700;color:#303133">{{ dnsHdAvgLatency }}</span>
                </div>
              </div>
            </div>
            <div class="pq-rt-right">
              <!-- 时延分布 -->
              <div class="pq-rt-card">
                <div class="pq-rt-card-header">
                  <span class="pq-rt-card-title">时延分布</span>
                  <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
                </div>
                <div class="pq-rt-card-body pq-rt-pie-body">
                  <v-chart :option="dnsHdPieOption" autoresize style="width:100%;height:200px" />
                </div>
              </div>
              <!-- Top服务器 -->
              <div class="pq-rt-card">
                <div class="pq-rt-card-header">
                  <span class="pq-rt-card-title">Top服务器</span>
                  <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
                </div>
                <div class="pq-rt-card-body pq-rt-table-body">
                  <table class="pq-rt-table">
                    <thead>
                      <tr>
                        <th style="width:40px">序号</th>
                        <th>IP地址</th>
                        <th>总请求 <el-icon class="sort-icon"><Sort /></el-icon></th>
                        <th>失败次数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                        <th>平均时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, idx) in dnsHdTopServerData" :key="idx">
                        <td>{{ idx + 1 }}</td>
                        <td><span class="pq-ip-link" @click="openDnsHdTopServerPopup(row.ip)">{{ row.ip }}</span></td>
                        <td class="pq-num">{{ row.totalReq }}</td>
                        <td class="pq-num">{{ row.failCount }}</td>
                        <td class="pq-num">{{ row.avgLatency }}</td>
                      </tr>
                      <tr v-if="dnsHdTopServerData.length === 0">
                        <td colspan="5" class="ou-empty">无数据</td>
                      </tr>
                    </tbody>
                  </table>
                  <div class="pq-footer">
                    <div class="pq-pager">
                      <button class="pq-page-btn" @click="dnsHdTopServerPage > 1 && dnsHdTopServerPage--">‹</button>
                      <button v-for="pg in dnsHdTopServerPages" :key="pg" class="pq-page-btn" :class="{ active: pg === dnsHdTopServerPage }" @click="dnsHdTopServerPage = pg">{{ pg }}</button>
                      <button class="pq-page-btn" @click="dnsHdTopServerPage < dnsHdTopServerPages && dnsHdTopServerPage++">›</button>
                      <span style="margin-left:8px;font-size:12px;color:#909399">到第</span>
                      <input class="pq-page-goto" v-model.number="dnsHdTopServerGoto" />
                      <span style="font-size:12px;color:#909399">页</span>
                      <button class="pq-page-goto-btn" @click="dnsHdTopServerPage = dnsHdTopServerGoto; dnsHdTopServerGoto = dnsHdTopServerPage">确定</button>
                    </div>
                    <span style="font-size:12px;color:#909399">共 {{ dnsHdTopServerData.length }} 条</span>
                  </div>
                </div>
              </div>
              <!-- 质量域名 -->
              <div class="pq-rt-card">
                <div class="pq-rt-card-header">
                  <span class="pq-rt-card-title">质量域名</span>
                  <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
                </div>
                <div class="pq-rt-card-body pq-rt-table-body">
                  <table class="pq-rt-table">
                    <thead>
                      <tr>
                        <th style="width:40px">序号</th>
                        <th>域名</th>
                        <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                        <th>失败次数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                        <th>平均时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, idx) in dnsHdQualityDomainData" :key="idx">
                        <td>{{ idx + 1 }}</td>
                        <td><span class="pq-ip-link" @click="openDnsHdDomainPopup(row.domain)">{{ row.domain }}</span></td>
                        <td class="pq-num">{{ row.totalReq }}</td>
                        <td class="pq-num">{{ row.failCount }}</td>
                        <td class="pq-num">{{ row.avgLatency }}</td>
                      </tr>
                      <tr v-if="dnsHdQualityDomainData.length === 0">
                        <td colspan="5" class="ou-empty">无数据</td>
                      </tr>
                    </tbody>
                  </table>
                  <div class="pq-footer">
                    <div class="pq-pager">
                      <button class="pq-page-btn" @click="dnsHdDomainPage > 1 && dnsHdDomainPage--">‹</button>
                      <button v-for="pg in dnsHdDomainPages" :key="pg" class="pq-page-btn" :class="{ active: pg === dnsHdDomainPage }" @click="dnsHdDomainPage = pg">{{ pg }}</button>
                      <button class="pq-page-btn" @click="dnsHdDomainPage < dnsHdDomainPages && dnsHdDomainPage++">›</button>
                    </div>
                    <span style="font-size:12px;color:#909399">共 {{ dnsHdQualityDomainData.length }} 条</span>
                  </div>
                </div>
              </div>
              <!-- 质量源 -->
              <div class="pq-rt-card">
                <div class="pq-rt-card-header">
                  <span class="pq-rt-card-title">质量源</span>
                  <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
                </div>
                <div class="pq-rt-card-body pq-rt-table-body">
                  <table class="pq-rt-table">
                    <thead>
                      <tr>
                        <th style="width:40px">序号</th>
                        <th>IP地址</th>
                        <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                        <th>失败次数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                        <th>平均时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, idx) in dnsHdSrcData" :key="idx">
                        <td>{{ idx + 1 }}</td>
                        <td><span class="pq-ip-link" @click="openDnsHdSrcPopup(row.ip)">{{ row.ip }}</span></td>
                        <td class="pq-num">{{ row.totalReq }}</td>
                        <td class="pq-num">{{ row.failCount }}</td>
                        <td class="pq-num">{{ row.avgLatency }}</td>
                      </tr>
                      <tr v-if="dnsHdSrcData.length === 0">
                        <td colspan="5" class="ou-empty">无数据</td>
                      </tr>
                    </tbody>
                  </table>
                  <div class="pq-footer">
                    <div class="pq-pager">
                      <button class="pq-page-btn" @click="dnsHdSrcPage > 1 && dnsHdSrcPage--">‹</button>
                      <button v-for="pg in dnsHdSrcPages" :key="pg" class="pq-page-btn" :class="{ active: pg === dnsHdSrcPage }" @click="dnsHdSrcPage = pg">{{ pg }}</button>
                      <button class="pq-page-btn" @click="dnsHdSrcPage < dnsHdSrcPages && dnsHdSrcPage++">›</button>
                    </div>
                    <span style="font-size:12px;color:#909399">共 {{ dnsHdSrcData.length }} 条</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ==================== HTTP 实时分析 ==================== -->
        <div v-if="subTab === 'realtime' && p === 'HTTP'" class="pq-rt-layout">
          <div class="pq-rt-left">
            <!-- 时延趋势 -->
            <div class="pq-rt-card">
              <div class="pq-rt-card-header">
                <span class="pq-rt-card-title">时延趋势</span>
                <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
              </div>
              <div class="pq-rt-card-body">
                <v-chart :option="httpRtLatencyTrendOption" autoresize style="width:100%;height:280px" />
                <div class="pq-rt-stats">
                  <span class="pq-rt-stat"><span class="pq-rt-stat-label">最大值</span><span class="pq-rt-stat-val">{{ httpRtLatencyMax }}</span></span>
                  <span class="pq-rt-stat"><span class="pq-rt-stat-label">最小值</span><span class="pq-rt-stat-val">{{ httpRtLatencyMin }}</span></span>
                  <span class="pq-rt-stat"><span class="pq-rt-stat-label">平均值</span><span class="pq-rt-stat-val">{{ httpRtLatencyAvg }}</span></span>
                </div>
              </div>
            </div>
            <!-- 平均时延趋势 -->
            <div class="pq-rt-card">
              <div class="pq-rt-card-header">
                <span class="pq-rt-card-title">平均时延趋势</span>
                <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
              </div>
              <div class="pq-rt-card-body">
                <v-chart :option="httpRtAvgLatencyOption" autoresize style="width:100%;height:200px" />
                <div class="pq-rt-stats">
                  <span class="pq-rt-stat"><span class="pq-rt-stat-label">最大值</span><span class="pq-rt-stat-val">{{ httpRtAvgMax }} ms</span></span>
                  <span class="pq-rt-stat"><span class="pq-rt-stat-label">最小值</span><span class="pq-rt-stat-val">{{ httpRtAvgMin }} ms</span></span>
                  <span class="pq-rt-stat"><span class="pq-rt-stat-label">平均值</span><span class="pq-rt-stat-val">{{ httpRtAvgAvg }} ms</span></span>
                </div>
              </div>
            </div>
            <!-- HTTP状态码 -->
            <div class="pq-rt-card">
              <div class="pq-rt-card-header">
                <span class="pq-rt-card-title">HTTP状态码</span>
                <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
              </div>
              <div class="pq-rt-card-body">
                <v-chart :option="httpRtStatusCodeOption" autoresize style="width:100%;height:200px" />
                <div class="pq-rt-stats">
                  <span class="pq-rt-stat"><span class="pq-rt-stat-label">HTTP 2xx</span><span class="pq-rt-stat-val">{{ httpRt2xx }}</span></span>
                  <span class="pq-rt-stat"><span class="pq-rt-stat-label">HTTP 3xx</span><span class="pq-rt-stat-val">{{ httpRt3xx }}</span></span>
                  <span class="pq-rt-stat"><span class="pq-rt-stat-label">HTTP 4xx</span><span class="pq-rt-stat-val">{{ httpRt4xx }}</span></span>
                  <span class="pq-rt-stat"><span class="pq-rt-stat-label">HTTP 5xx</span><span class="pq-rt-stat-val">{{ httpRt5xx }}</span></span>
                </div>
              </div>
            </div>
          </div>
          <div class="pq-rt-right">
            <!-- 时延分布 -->
            <div class="pq-rt-card">
              <div class="pq-rt-card-header">
                <span class="pq-rt-card-title">时延分布</span>
                <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
              </div>
              <div class="pq-rt-card-body pq-rt-pie-body">
                <v-chart :option="httpRtPieOption" autoresize style="width:100%;height:220px" />
              </div>
            </div>
            <!-- 质量源 -->
            <div class="pq-rt-card">
              <div class="pq-rt-card-header">
                <span class="pq-rt-card-title">质量源</span>
                <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
              </div>
              <div class="pq-rt-card-body pq-rt-table-body">
                <table class="pq-rt-table">
                  <thead>
                    <tr>
                      <th style="width:40px">序号</th>
                      <th>IP地址</th>
                      <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                      <th>失败次数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                      <th>平均时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, idx) in httpRtSrcData" :key="idx">
                      <td>{{ idx + 1 }}</td>
                      <td><span class="pq-ip-link" @click="openHttpRtSrcPopup(row.ip)">{{ row.ip }}</span></td>
                      <td class="pq-num">{{ row.totalReq }}</td>
                      <td class="pq-num">{{ row.failCount }}</td>
                      <td class="pq-num">{{ row.avgLatency }}</td>
                    </tr>
                    <tr v-if="httpRtSrcData.length === 0">
                      <td colspan="5" class="ou-empty">无数据</td>
                    </tr>
                  </tbody>
                </table>
                <div class="pq-footer">
                  <div class="pq-pager">
                    <button class="pq-page-btn" @click="httpRtSrcPage > 1 && httpRtSrcPage--">‹</button>
                    <button v-for="pg in httpRtSrcPages" :key="pg" class="pq-page-btn" :class="{ active: pg === httpRtSrcPage }" @click="httpRtSrcPage = pg">{{ pg }}</button>
                    <button class="pq-page-btn" @click="httpRtSrcPage < httpRtSrcPages && httpRtSrcPage++">›</button>
                    <span style="margin-left:8px;font-size:12px;color:#909399">到第</span>
                    <input class="pq-page-goto" v-model.number="httpRtSrcGoto" />
                    <span style="font-size:12px;color:#909399">页</span>
                    <button class="pq-page-goto-btn" @click="httpRtSrcPage = httpRtSrcGoto; httpRtSrcGoto = httpRtSrcPage">确定</button>
                  </div>
                  <span style="font-size:12px;color:#909399">共 {{ httpRtSrcData.length }} 条</span>
                </div>
              </div>
            </div>
            <!-- 质量域名 -->
            <div class="pq-rt-card">
              <div class="pq-rt-card-header">
                <span class="pq-rt-card-title">质量域名</span>
                <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
              </div>
              <div class="pq-rt-card-body pq-rt-table-body">
                <table class="pq-rt-table">
                  <thead>
                    <tr>
                      <th style="width:40px">序号</th>
                      <th>域名</th>
                      <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                      <th>失败次数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                      <th>平均时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, idx) in httpRtDomainData" :key="idx">
                      <td>{{ idx + 1 }}</td>
                      <td><span class="pq-ip-link" @click="openHttpRtDomainPopup(row.domain)">{{ row.domain }}</span></td>
                      <td class="pq-num">{{ row.totalReq }}</td>
                      <td class="pq-num">{{ row.failCount }}</td>
                      <td class="pq-num">{{ row.avgLatency }}</td>
                    </tr>
                    <tr v-if="httpRtDomainData.length === 0">
                      <td colspan="5" class="ou-empty">无数据</td>
                    </tr>
                  </tbody>
                </table>
                <div class="pq-footer">
                  <div class="pq-pager">
                    <button class="pq-page-btn" @click="httpRtDomainPage > 1 && httpRtDomainPage--">‹</button>
                    <button v-for="pg in httpRtDomainPages" :key="pg" class="pq-page-btn" :class="{ active: pg === httpRtDomainPage }" @click="httpRtDomainPage = pg">{{ pg }}</button>
                    <button class="pq-page-btn" @click="httpRtDomainPage < httpRtDomainPages && httpRtDomainPage++">›</button>
                  </div>
                  <span style="font-size:12px;color:#909399">共 {{ httpRtDomainData.length }} 条</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ==================== HTTP 历史分析 ==================== -->
        <div v-if="subTab === 'history' && p === 'HTTP'" class="pq-history-wrapper">
          <!-- Toolbar -->
          <div class="pq-history-toolbar">
            <div class="pq-history-time">
              <span class="pq-history-time-label">时间范围</span>
              <el-date-picker
                v-model="httpHistoryDateRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width:380px"
                size="default"
              />
            </div>
            <div class="pq-history-latency">
              <span class="pq-history-latency-label">质量时延=</span>
              <el-input-number
                v-model="httpHistoryQualityLatency"
                :min="0"
                :step="1"
                controls-position="right"
                style="width:100px"
                size="default"
              />
            </div>
            <button class="ou-search-btn" @click="doHttpHistorySearch">
              <el-icon><Search /></el-icon>
            </button>
            <button class="secondary pq-reset-btn" @click="resetHttpHistoryFilters">重置</button>
          </div>
          <!-- Content grid -->
          <div class="pq-rt-layout">
            <div class="pq-rt-left">
              <!-- 时延趋势 -->
              <div class="pq-rt-card">
                <div class="pq-rt-card-header">
                  <span class="pq-rt-card-title">时延趋势</span>
                  <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
                </div>
                <div class="pq-rt-card-body">
                  <v-chart :option="httpHdLatencyTrendOption" autoresize style="width:100%;height:220px" />
                  <div class="pq-rt-stats">
                    <span class="pq-rt-stat"><span class="pq-rt-stat-label">最大值</span><span class="pq-rt-stat-val">{{ httpHdLatencyMax }}</span></span>
                    <span class="pq-rt-stat"><span class="pq-rt-stat-label">最小值</span><span class="pq-rt-stat-val">{{ httpHdLatencyMin }}</span></span>
                    <span class="pq-rt-stat"><span class="pq-rt-stat-label">平均值</span><span class="pq-rt-stat-val">{{ httpHdLatencyAvg }}</span></span>
                  </div>
                </div>
              </div>
              <!-- HTTP状态码 -->
              <div class="pq-rt-card">
                <div class="pq-rt-card-header">
                  <span class="pq-rt-card-title">HTTP状态码</span>
                  <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
                </div>
                <div class="pq-rt-card-body">
                  <v-chart :option="httpHdStatusCodeOption" autoresize style="width:100%;height:220px" />
                  <div class="pq-rt-stats">
                    <span class="pq-rt-stat"><span class="pq-rt-stat-label">HTTP 2xx</span><span class="pq-rt-stat-val">{{ httpHd2xx }}</span></span>
                    <span class="pq-rt-stat"><span class="pq-rt-stat-label">HTTP 3xx</span><span class="pq-rt-stat-val">{{ httpHd3xx }}</span></span>
                    <span class="pq-rt-stat"><span class="pq-rt-stat-label">HTTP 4xx</span><span class="pq-rt-stat-val">{{ httpHd4xx }}</span></span>
                    <span class="pq-rt-stat"><span class="pq-rt-stat-label">HTTP 5xx</span><span class="pq-rt-stat-val">{{ httpHd5xx }}</span></span>
                  </div>
                </div>
              </div>
              <!-- 平均时延趋势 -->
              <div class="pq-rt-card">
                <div class="pq-rt-card-header">
                  <span class="pq-rt-card-title">平均时延趋势</span>
                  <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
                </div>
                <div class="pq-rt-card-body">
                  <v-chart :option="httpHdAvgLatencyOption" autoresize style="width:100%;height:200px" />
                  <div class="pq-rt-stats">
                    <span class="pq-rt-stat"><span class="pq-rt-stat-label">最大值</span><span class="pq-rt-stat-val">{{ httpHdAvgMax }} ms</span></span>
                    <span class="pq-rt-stat"><span class="pq-rt-stat-label">最小值</span><span class="pq-rt-stat-val">{{ httpHdAvgMin }} ms</span></span>
                    <span class="pq-rt-stat"><span class="pq-rt-stat-label">平均值</span><span class="pq-rt-stat-val">{{ httpHdAvgAvg }} ms</span></span>
                  </div>
                </div>
              </div>
            </div>
            <div class="pq-rt-right">
              <!-- 时延分布 -->
              <div class="pq-rt-card">
                <div class="pq-rt-card-header">
                  <span class="pq-rt-card-title">时延分布</span>
                  <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
                </div>
                <div class="pq-rt-card-body pq-rt-pie-body">
                  <v-chart :option="httpHdPieOption" autoresize style="width:100%;height:220px" />
                </div>
              </div>
              <!-- 质量源 -->
              <div class="pq-rt-card">
                <div class="pq-rt-card-header">
                  <span class="pq-rt-card-title">质量源</span>
                  <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
                </div>
                <div class="pq-rt-card-body pq-rt-table-body">
                  <table class="pq-rt-table">
                    <thead>
                      <tr>
                        <th style="width:40px">序号</th>
                        <th>IP地址</th>
                        <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                        <th>失败次数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                        <th>平均时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, idx) in httpHdSrcData" :key="idx">
                        <td>{{ idx + 1 }}</td>
                        <td><span class="pq-ip-link" @click="openHttpHdSrcPopup(row.ip)">{{ row.ip }}</span></td>
                        <td class="pq-num">{{ row.totalReq }}</td>
                        <td class="pq-num">{{ row.failCount }}</td>
                        <td class="pq-num">{{ row.avgLatency }}</td>
                      </tr>
                      <tr v-if="httpHdSrcData.length === 0">
                        <td colspan="5" class="ou-empty">无数据</td>
                      </tr>
                    </tbody>
                  </table>
                  <div class="pq-footer">
                    <div class="pq-pager">
                      <button class="pq-page-btn" @click="httpHdSrcPage > 1 && httpHdSrcPage--">‹</button>
                      <button v-for="pg in httpHdSrcPages" :key="pg" class="pq-page-btn" :class="{ active: pg === httpHdSrcPage }" @click="httpHdSrcPage = pg">{{ pg }}</button>
                      <button class="pq-page-btn" @click="httpHdSrcPage < httpHdSrcPages && httpHdSrcPage++">›</button>
                      <span style="margin-left:8px;font-size:12px;color:#909399">到第</span>
                      <input class="pq-page-goto" v-model.number="httpHdSrcGoto" />
                      <span style="font-size:12px;color:#909399">页</span>
                      <button class="pq-page-goto-btn" @click="httpHdSrcPage = httpHdSrcGoto; httpHdSrcGoto = httpHdSrcPage">确定</button>
                    </div>
                    <span style="font-size:12px;color:#909399">共 {{ httpHdSrcData.length }} 条</span>
                  </div>
                </div>
              </div>
              <!-- 质量域名 -->
              <div class="pq-rt-card">
                <div class="pq-rt-card-header">
                  <span class="pq-rt-card-title">质量域名</span>
                  <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
                </div>
                <div class="pq-rt-card-body pq-rt-table-body">
                  <table class="pq-rt-table">
                    <thead>
                      <tr>
                        <th style="width:40px">序号</th>
                        <th>域名</th>
                        <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                        <th>失败次数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                        <th>平均时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, idx) in httpHdDomainData" :key="idx">
                        <td>{{ idx + 1 }}</td>
                        <td><span class="pq-ip-link" @click="openHttpHdDomainPopup(row.domain)">{{ row.domain }}</span></td>
                        <td class="pq-num">{{ row.totalReq }}</td>
                        <td class="pq-num">{{ row.failCount }}</td>
                        <td class="pq-num">{{ row.avgLatency }}</td>
                      </tr>
                      <tr v-if="httpHdDomainData.length === 0">
                        <td colspan="5" class="ou-empty">无数据</td>
                      </tr>
                    </tbody>
                  </table>
                  <div class="pq-footer">
                    <div class="pq-pager">
                      <button class="pq-page-btn" @click="httpHdDomainPage > 1 && httpHdDomainPage--">‹</button>
                      <button v-for="pg in httpHdDomainPages" :key="pg" class="pq-page-btn" :class="{ active: pg === httpHdDomainPage }" @click="httpHdDomainPage = pg">{{ pg }}</button>
                      <button class="pq-page-btn" @click="httpHdDomainPage < httpHdDomainPages && httpHdDomainPage++">›</button>
                      <span style="margin-left:8px;font-size:12px;color:#909399">到第</span>
                      <input class="pq-page-goto" v-model.number="httpHdDomainGoto" />
                      <span style="font-size:12px;color:#909399">页</span>
                      <button class="pq-page-goto-btn" @click="httpHdDomainPage = httpHdDomainGoto; httpHdDomainGoto = httpHdDomainPage">确定</button>
                    </div>
                    <span style="font-size:12px;color:#909399">共 {{ httpHdDomainData.length }} 条</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ==================== HTTPS 实时分析 ==================== -->
        <div v-if="subTab === 'realtime' && p === 'HTTPS'" class="pq-rt-layout">
          <div class="pq-rt-left">
            <!-- 时延趋势 -->
            <div class="pq-rt-card">
              <div class="pq-rt-card-header">
                <span class="pq-rt-card-title">时延趋势</span>
                <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
              </div>
              <div class="pq-rt-card-body">
                <v-chart :option="httpsRtLatencyTrendOption" autoresize style="width:100%;height:280px" />
                <div class="pq-rt-stats">
                  <span class="pq-rt-stat"><span class="pq-rt-stat-label">最大值</span><span class="pq-rt-stat-val">{{ httpsRtLatencyMax }}</span></span>
                  <span class="pq-rt-stat"><span class="pq-rt-stat-label">最小值</span><span class="pq-rt-stat-val">{{ httpsRtLatencyMin }}</span></span>
                  <span class="pq-rt-stat"><span class="pq-rt-stat-label">平均值</span><span class="pq-rt-stat-val">{{ httpsRtLatencyAvg }}</span></span>
                </div>
              </div>
            </div>
            <!-- 平均时延趋势 -->
            <div class="pq-rt-card">
              <div class="pq-rt-card-header">
                <span class="pq-rt-card-title">平均时延趋势</span>
                <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
              </div>
              <div class="pq-rt-card-body">
                <v-chart :option="httpsRtAvgLatencyOption" autoresize style="width:100%;height:200px" />
                <div class="pq-rt-stats">
                  <span class="pq-rt-stat"><span class="pq-rt-stat-label">最大值</span><span class="pq-rt-stat-val">{{ httpsRtAvgMax }} ms</span></span>
                  <span class="pq-rt-stat"><span class="pq-rt-stat-label">最小值</span><span class="pq-rt-stat-val">{{ httpsRtAvgMin }} ms</span></span>
                  <span class="pq-rt-stat"><span class="pq-rt-stat-label">平均值</span><span class="pq-rt-stat-val">{{ httpsRtAvgAvg }} ms</span></span>
                </div>
              </div>
            </div>
            <!-- HTTP状态码 -->
            <div class="pq-rt-card">
              <div class="pq-rt-card-header">
                <span class="pq-rt-card-title">HTTP状态码</span>
                <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
              </div>
              <div class="pq-rt-card-body">
                <v-chart :option="httpsRtStatusCodeOption" autoresize style="width:100%;height:200px" />
                <div class="pq-rt-stats">
                  <span class="pq-rt-stat"><span class="pq-rt-stat-label">HTTP 2xx</span><span class="pq-rt-stat-val">{{ httpsRt2xx }}</span></span>
                  <span class="pq-rt-stat"><span class="pq-rt-stat-label">HTTP 3xx</span><span class="pq-rt-stat-val">{{ httpsRt3xx }}</span></span>
                  <span class="pq-rt-stat"><span class="pq-rt-stat-label">HTTP 4xx</span><span class="pq-rt-stat-val">{{ httpsRt4xx }}</span></span>
                  <span class="pq-rt-stat"><span class="pq-rt-stat-label">HTTP 5xx</span><span class="pq-rt-stat-val">{{ httpsRt5xx }}</span></span>
                </div>
              </div>
            </div>
          </div>
          <div class="pq-rt-right">
            <!-- 时延分布 -->
            <div class="pq-rt-card">
              <div class="pq-rt-card-header">
                <span class="pq-rt-card-title">时延分布</span>
                <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
              </div>
              <div class="pq-rt-card-body pq-rt-pie-body">
                <v-chart :option="httpsRtPieOption" autoresize style="width:100%;height:220px" />
              </div>
            </div>
            <!-- 质量源 -->
            <div class="pq-rt-card">
              <div class="pq-rt-card-header">
                <span class="pq-rt-card-title">质量源</span>
                <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
              </div>
              <div class="pq-rt-card-body pq-rt-table-body">
                <table class="pq-rt-table">
                  <thead>
                    <tr>
                      <th style="width:40px">序号</th>
                      <th>IP地址</th>
                      <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                      <th>失败次数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                      <th>平均时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, idx) in httpsRtSrcData" :key="idx">
                      <td>{{ idx + 1 }}</td>
                      <td><span class="pq-ip-link" @click="openHttpsRtSrcPopup(row.ip)">{{ row.ip }}</span></td>
                      <td class="pq-num">{{ row.totalReq }}</td>
                      <td class="pq-num">{{ row.failCount }}</td>
                      <td class="pq-num">{{ row.avgLatency }}</td>
                    </tr>
                    <tr v-if="httpsRtSrcData.length === 0">
                      <td colspan="5" class="ou-empty">无数据</td>
                    </tr>
                  </tbody>
                </table>
                <div class="pq-footer">
                  <div class="pq-pager">
                    <button class="pq-page-btn" @click="httpsRtSrcPage > 1 && httpsRtSrcPage--">‹</button>
                    <button v-for="pg in httpsRtSrcPages" :key="pg" class="pq-page-btn" :class="{ active: pg === httpsRtSrcPage }" @click="httpsRtSrcPage = pg">{{ pg }}</button>
                    <button class="pq-page-btn" @click="httpsRtSrcPage < httpsRtSrcPages && httpsRtSrcPage++">›</button>
                    <span style="margin-left:8px;font-size:12px;color:#909399">到第</span>
                    <input class="pq-page-goto" v-model.number="httpsRtSrcGoto" />
                    <span style="font-size:12px;color:#909399">页</span>
                    <button class="pq-page-goto-btn" @click="httpsRtSrcPage = httpsRtSrcGoto; httpsRtSrcGoto = httpsRtSrcPage">确定</button>
                  </div>
                  <span style="font-size:12px;color:#909399">共 {{ httpsRtSrcData.length }} 条</span>
                </div>
              </div>
            </div>
            <!-- 质量域名 -->
            <div class="pq-rt-card">
              <div class="pq-rt-card-header">
                <span class="pq-rt-card-title">质量域名</span>
                <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
              </div>
              <div class="pq-rt-card-body pq-rt-table-body">
                <table class="pq-rt-table">
                  <thead>
                    <tr>
                      <th style="width:40px">序号</th>
                      <th>域名</th>
                      <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                      <th>失败次数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                      <th>平均时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, idx) in httpsRtDomainData" :key="idx">
                      <td>{{ idx + 1 }}</td>
                      <td><span class="pq-ip-link" @click="openHttpsRtDomainPopup(row.domain)">{{ row.domain }}</span></td>
                      <td class="pq-num">{{ row.totalReq }}</td>
                      <td class="pq-num">{{ row.failCount }}</td>
                      <td class="pq-num">{{ row.avgLatency }}</td>
                    </tr>
                    <tr v-if="httpsRtDomainData.length === 0">
                      <td colspan="5" class="ou-empty">无数据</td>
                    </tr>
                  </tbody>
                </table>
                <div class="pq-footer">
                  <div class="pq-pager">
                    <button class="pq-page-btn" @click="httpsRtDomainPage > 1 && httpsRtDomainPage--">‹</button>
                    <button v-for="pg in httpsRtDomainPages" :key="pg" class="pq-page-btn" :class="{ active: pg === httpsRtDomainPage }" @click="httpsRtDomainPage = pg">{{ pg }}</button>
                    <button class="pq-page-btn" @click="httpsRtDomainPage < httpsRtDomainPages && httpsRtDomainPage++">›</button>
                  </div>
                  <span style="font-size:12px;color:#909399">共 {{ httpsRtDomainData.length }} 条</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ==================== HTTPS 历史分析 ==================== -->
        <div v-if="subTab === 'history' && p === 'HTTPS'" class="pq-history-wrapper">
          <!-- Toolbar -->
          <div class="pq-history-toolbar">
            <div class="pq-history-time">
              <span class="pq-history-time-label">时间范围</span>
              <el-date-picker
                v-model="httpsHistoryDateRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width:380px"
                size="default"
              />
            </div>
            <div class="pq-history-latency">
              <span class="pq-history-latency-label">质量时延=</span>
              <el-input-number
                v-model="httpsHistoryQualityLatency"
                :min="0"
                :step="1"
                controls-position="right"
                style="width:100px"
                size="default"
              />
            </div>
            <button class="ou-search-btn" @click="doHttpsHistorySearch">
              <el-icon><Search /></el-icon>
            </button>
            <button class="secondary pq-reset-btn" @click="resetHttpsHistoryFilters">重置</button>
          </div>
          <!-- Content grid -->
          <div class="pq-rt-layout">
            <div class="pq-rt-left">
              <!-- 时延趋势 -->
              <div class="pq-rt-card">
                <div class="pq-rt-card-header">
                  <span class="pq-rt-card-title">时延趋势</span>
                  <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
                </div>
                <div class="pq-rt-card-body">
                  <v-chart :option="httpsHdLatencyTrendOption" autoresize style="width:100%;height:220px" />
                  <div class="pq-rt-stats">
                    <span class="pq-rt-stat"><span class="pq-rt-stat-label">最大值</span><span class="pq-rt-stat-val">{{ httpsHdLatencyMax }}</span></span>
                    <span class="pq-rt-stat"><span class="pq-rt-stat-label">最小值</span><span class="pq-rt-stat-val">{{ httpsHdLatencyMin }}</span></span>
                    <span class="pq-rt-stat"><span class="pq-rt-stat-label">平均值</span><span class="pq-rt-stat-val">{{ httpsHdLatencyAvg }}</span></span>
                  </div>
                </div>
              </div>
              <!-- HTTP状态码 -->
              <div class="pq-rt-card">
                <div class="pq-rt-card-header">
                  <span class="pq-rt-card-title">HTTP状态码</span>
                  <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
                </div>
                <div class="pq-rt-card-body">
                  <v-chart :option="httpsHdStatusCodeOption" autoresize style="width:100%;height:220px" />
                  <div class="pq-rt-stats">
                    <span class="pq-rt-stat"><span class="pq-rt-stat-label">HTTP 2xx</span><span class="pq-rt-stat-val">{{ httpsHd2xx }}</span></span>
                    <span class="pq-rt-stat"><span class="pq-rt-stat-label">HTTP 3xx</span><span class="pq-rt-stat-val">{{ httpsHd3xx }}</span></span>
                    <span class="pq-rt-stat"><span class="pq-rt-stat-label">HTTP 4xx</span><span class="pq-rt-stat-val">{{ httpsHd4xx }}</span></span>
                    <span class="pq-rt-stat"><span class="pq-rt-stat-label">HTTP 5xx</span><span class="pq-rt-stat-val">{{ httpsHd5xx }}</span></span>
                  </div>
                </div>
              </div>
              <!-- 平均时延趋势 -->
              <div class="pq-rt-card">
                <div class="pq-rt-card-header">
                  <span class="pq-rt-card-title">平均时延趋势</span>
                  <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
                </div>
                <div class="pq-rt-card-body">
                  <v-chart :option="httpsHdAvgLatencyOption" autoresize style="width:100%;height:200px" />
                  <div class="pq-rt-stats">
                    <span class="pq-rt-stat"><span class="pq-rt-stat-label">最大值</span><span class="pq-rt-stat-val">{{ httpsHdAvgMax }} ms</span></span>
                    <span class="pq-rt-stat"><span class="pq-rt-stat-label">最小值</span><span class="pq-rt-stat-val">{{ httpsHdAvgMin }} ms</span></span>
                    <span class="pq-rt-stat"><span class="pq-rt-stat-label">平均值</span><span class="pq-rt-stat-val">{{ httpsHdAvgAvg }} ms</span></span>
                  </div>
                </div>
              </div>
            </div>
            <div class="pq-rt-right">
              <!-- 时延分布 -->
              <div class="pq-rt-card">
                <div class="pq-rt-card-header">
                  <span class="pq-rt-card-title">时延分布</span>
                  <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
                </div>
                <div class="pq-rt-card-body pq-rt-pie-body">
                  <v-chart :option="httpsHdPieOption" autoresize style="width:100%;height:220px" />
                </div>
              </div>
              <!-- 质量源 -->
              <div class="pq-rt-card">
                <div class="pq-rt-card-header">
                  <span class="pq-rt-card-title">质量源</span>
                  <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
                </div>
                <div class="pq-rt-card-body pq-rt-table-body">
                  <table class="pq-rt-table">
                    <thead>
                      <tr>
                        <th style="width:40px">序号</th>
                        <th>IP地址</th>
                        <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                        <th>失败次数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                        <th>平均时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, idx) in httpsHdSrcData" :key="idx">
                        <td>{{ idx + 1 }}</td>
                        <td><span class="pq-ip-link" @click="openHttpsHdSrcPopup(row.ip)">{{ row.ip }}</span></td>
                        <td class="pq-num">{{ row.totalReq }}</td>
                        <td class="pq-num">{{ row.failCount }}</td>
                        <td class="pq-num">{{ row.avgLatency }}</td>
                      </tr>
                      <tr v-if="httpsHdSrcData.length === 0">
                        <td colspan="5" class="ou-empty">无数据</td>
                      </tr>
                    </tbody>
                  </table>
                  <div class="pq-footer">
                    <div class="pq-pager">
                      <button class="pq-page-btn" @click="httpsHdSrcPage > 1 && httpsHdSrcPage--">‹</button>
                      <button v-for="pg in httpsHdSrcPages" :key="pg" class="pq-page-btn" :class="{ active: pg === httpsHdSrcPage }" @click="httpsHdSrcPage = pg">{{ pg }}</button>
                      <button class="pq-page-btn" @click="httpsHdSrcPage < httpsHdSrcPages && httpsHdSrcPage++">›</button>
                      <span style="margin-left:8px;font-size:12px;color:#909399">到第</span>
                      <input class="pq-page-goto" v-model.number="httpsHdSrcGoto" />
                      <span style="font-size:12px;color:#909399">页</span>
                      <button class="pq-page-goto-btn" @click="httpsHdSrcPage = httpsHdSrcGoto; httpsHdSrcGoto = httpsHdSrcPage">确定</button>
                    </div>
                    <span style="font-size:12px;color:#909399">共 {{ httpsHdSrcData.length }} 条</span>
                  </div>
                </div>
              </div>
              <!-- 质量域名 -->
              <div class="pq-rt-card">
                <div class="pq-rt-card-header">
                  <span class="pq-rt-card-title">质量域名</span>
                  <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
                </div>
                <div class="pq-rt-card-body pq-rt-table-body">
                  <table class="pq-rt-table">
                    <thead>
                      <tr>
                        <th style="width:40px">序号</th>
                        <th>域名</th>
                        <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                        <th>失败次数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                        <th>平均时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, idx) in httpsHdDomainData" :key="idx">
                        <td>{{ idx + 1 }}</td>
                        <td><span class="pq-ip-link" @click="openHttpsHdDomainPopup(row.domain)">{{ row.domain }}</span></td>
                        <td class="pq-num">{{ row.totalReq }}</td>
                        <td class="pq-num">{{ row.failCount }}</td>
                        <td class="pq-num">{{ row.avgLatency }}</td>
                      </tr>
                      <tr v-if="httpsHdDomainData.length === 0">
                        <td colspan="5" class="ou-empty">无数据</td>
                      </tr>
                    </tbody>
                  </table>
                  <div class="pq-footer">
                    <div class="pq-pager">
                      <button class="pq-page-btn" @click="httpsHdDomainPage > 1 && httpsHdDomainPage--">‹</button>
                      <button v-for="pg in httpsHdDomainPages" :key="pg" class="pq-page-btn" :class="{ active: pg === httpsHdDomainPage }" @click="httpsHdDomainPage = pg">{{ pg }}</button>
                      <button class="pq-page-btn" @click="httpsHdDomainPage < httpsHdDomainPages && httpsHdDomainPage++">›</button>
                      <span style="margin-left:8px;font-size:12px;color:#909399">到第</span>
                      <input class="pq-page-goto" v-model.number="httpsHdDomainGoto" />
                      <span style="font-size:12px;color:#909399">页</span>
                      <button class="pq-page-goto-btn" @click="httpsHdDomainPage = httpsHdDomainGoto; httpsHdDomainGoto = httpsHdDomainPage">确定</button>
                    </div>
                    <span style="font-size:12px;color:#909399">共 {{ httpsHdDomainData.length }} 条</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 实时-质量源详情弹窗 ==================== -->
    <el-dialog v-model="rtSrcPopupVisible" :title="'访问对象 -> ' + rtSrcPopupIp" width="70%" destroy-on-close class="pq-detail-dialog">
      <div style="padding:12px">
        <div style="display:flex;gap:12px;margin-bottom:12px;align-items:center">
          <el-input v-model="rtSrcPopupKeyword" placeholder="关键字搜索" style="width:220px" />
          <button class="ou-search-btn" @click="rtSrcPopupPage = 1">
            <el-icon><Search /></el-icon>
          </button>
        </div>
        <table class="pq-rt-table">
          <thead>
            <tr>
              <th style="width:40px">序号</th>
              <th>域名</th>
              <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>失败次数 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>平均时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in rtSrcPopupData" :key="idx">
              <td>{{ (rtSrcPopupPage - 1) * rtSrcPopupPageSize + idx + 1 }}</td>
              <td><span class="pq-ip-link">{{ row.domain }}</span></td>
              <td class="pq-num">{{ row.totalReq }}</td>
              <td class="pq-num">{{ row.failCount }}</td>
              <td class="pq-num">{{ row.avgLatency }}</td>
            </tr>
            <tr v-if="rtSrcPopupData.length === 0">
              <td colspan="5" class="ou-empty">无数据</td>
            </tr>
          </tbody>
        </table>
        <div class="pq-footer" style="margin-top:12px">
          <div class="pq-pager">
            <button class="pq-page-btn" @click="rtSrcPopupPage > 1 && rtSrcPopupPage--">‹</button>
            <button v-for="p in rtSrcPopupPages" :key="p" class="pq-page-btn" :class="{ active: p === rtSrcPopupPage }" @click="rtSrcPopupPage = p">{{ p }}</button>
            <button class="pq-page-btn" @click="rtSrcPopupPage < rtSrcPopupPages && rtSrcPopupPage++">›</button>
            <span style="margin-left:8px;font-size:12px;color:#909399">到第</span>
            <input class="pq-page-goto" v-model.number="rtSrcPopupGoto" />
            <span style="font-size:12px;color:#909399">页</span>
            <button class="pq-page-goto-btn" @click="rtSrcPopupPage = rtSrcPopupGoto; rtSrcPopupGoto = rtSrcPopupPage">确定</button>
          </div>
          <div style="display:flex;gap:12px;align-items:center">
            <span style="font-size:12px;color:#909399">共 {{ rtSrcPopupData.length }} 条</span>
            <el-select v-model="rtSrcPopupPageSize" style="width:110px" size="small">
              <el-option :value="100" label="100 条/页" />
            </el-select>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- ==================== 实时-质量目标详情弹窗 ==================== -->
    <el-dialog v-model="rtDstPopupVisible" :title="'访问对象 -> ' + rtDstPopupIp" width="70%" destroy-on-close class="pq-detail-dialog">
      <div style="padding:12px">
        <div style="display:flex;gap:12px;margin-bottom:12px;align-items:center">
          <el-input v-model="rtDstPopupKeyword" placeholder="关键字搜索" style="width:220px" />
          <button class="ou-search-btn" @click="rtDstPopupPage = 1">
            <el-icon><Search /></el-icon>
          </button>
        </div>
        <table class="pq-rt-table">
          <thead>
            <tr>
              <th style="width:40px">序号</th>
              <th>域名</th>
              <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>失败次数 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>平均时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in rtDstPopupData" :key="idx">
              <td>{{ (rtDstPopupPage - 1) * rtDstPopupPageSize + idx + 1 }}</td>
              <td><span class="pq-ip-link">{{ row.domain }}</span></td>
              <td class="pq-num">{{ row.totalReq }}</td>
              <td class="pq-num">{{ row.failCount }}</td>
              <td class="pq-num">{{ row.avgLatency }}</td>
            </tr>
            <tr v-if="rtDstPopupData.length === 0">
              <td colspan="5" class="ou-empty">无数据</td>
            </tr>
          </tbody>
        </table>
        <div class="pq-footer" style="margin-top:12px">
          <div class="pq-pager">
            <button class="pq-page-btn" @click="rtDstPopupPage > 1 && rtDstPopupPage--">‹</button>
            <button v-for="p in rtDstPopupPages" :key="p" class="pq-page-btn" :class="{ active: p === rtDstPopupPage }" @click="rtDstPopupPage = p">{{ p }}</button>
            <button class="pq-page-btn" @click="rtDstPopupPage < rtDstPopupPages && rtDstPopupPage++">›</button>
            <span style="margin-left:8px;font-size:12px;color:#909399">到第</span>
            <input class="pq-page-goto" v-model.number="rtDstPopupGoto" />
            <span style="font-size:12px;color:#909399">页</span>
            <button class="pq-page-goto-btn" @click="rtDstPopupPage = rtDstPopupGoto; rtDstPopupGoto = rtDstPopupPage">确定</button>
          </div>
          <div style="display:flex;gap:12px;align-items:center">
            <span style="font-size:12px;color:#909399">共 {{ rtDstPopupData.length }} 条</span>
            <el-select v-model="rtDstPopupPageSize" style="width:110px" size="small">
              <el-option :value="100" label="100 条/页" />
            </el-select>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- ==================== 历史-质量源详情弹窗 ==================== -->
    <el-dialog v-model="hdSrcPopupVisible" :title="'访问对象 -> ' + hdSrcPopupIp" width="70%" destroy-on-close class="pq-detail-dialog">
      <div style="padding:12px">
        <div style="display:flex;gap:12px;margin-bottom:12px;align-items:center">
          <el-input v-model="hdSrcPopupKeyword" placeholder="关键字搜索" style="width:220px" />
          <button class="ou-search-btn" @click="hdSrcPopupPage = 1">
            <el-icon><Search /></el-icon>
          </button>
        </div>
        <table class="pq-rt-table">
          <thead>
            <tr>
              <th style="width:40px">序号</th>
              <th>域名</th>
              <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>失败次数 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>平均时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in hdSrcPopupData" :key="idx">
              <td>{{ (hdSrcPopupPage - 1) * hdSrcPopupPageSize + idx + 1 }}</td>
              <td><span class="pq-ip-link">{{ row.domain }}</span></td>
              <td class="pq-num">{{ row.totalReq }}</td>
              <td class="pq-num">{{ row.failCount }}</td>
              <td class="pq-num">{{ row.avgLatency }}</td>
            </tr>
            <tr v-if="hdSrcPopupData.length === 0">
              <td colspan="5" class="ou-empty">无数据</td>
            </tr>
          </tbody>
        </table>
        <div class="pq-footer" style="margin-top:12px">
          <div class="pq-pager">
            <button class="pq-page-btn" @click="hdSrcPopupPage > 1 && hdSrcPopupPage--">‹</button>
            <button v-for="p in hdSrcPopupPages" :key="p" class="pq-page-btn" :class="{ active: p === hdSrcPopupPage }" @click="hdSrcPopupPage = p">{{ p }}</button>
            <button class="pq-page-btn" @click="hdSrcPopupPage < hdSrcPopupPages && hdSrcPopupPage++">›</button>
            <span style="margin-left:8px;font-size:12px;color:#909399">到第</span>
            <input class="pq-page-goto" v-model.number="hdSrcPopupGoto" />
            <span style="font-size:12px;color:#909399">页</span>
            <button class="pq-page-goto-btn" @click="hdSrcPopupPage = hdSrcPopupGoto; hdSrcPopupGoto = hdSrcPopupPage">确定</button>
          </div>
          <div style="display:flex;gap:12px;align-items:center">
            <span style="font-size:12px;color:#909399">共 {{ hdSrcPopupData.length }} 条</span>
            <el-select v-model="hdSrcPopupPageSize" style="width:110px" size="small">
              <el-option :value="100" label="100 条/页" />
            </el-select>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- ==================== 历史-质量目标详情弹窗 ==================== -->
    <el-dialog v-model="hdDstPopupVisible" :title="'访问对象 -> ' + hdDstPopupIp" width="70%" destroy-on-close class="pq-detail-dialog">
      <div style="padding:12px">
        <div style="display:flex;gap:12px;margin-bottom:12px;align-items:center">
          <el-input v-model="hdDstPopupKeyword" placeholder="关键字搜索" style="width:220px" />
          <button class="ou-search-btn" @click="hdDstPopupPage = 1">
            <el-icon><Search /></el-icon>
          </button>
        </div>
        <table class="pq-rt-table">
          <thead>
            <tr>
              <th style="width:40px">序号</th>
              <th>域名</th>
              <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>失败次数 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>平均时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in hdDstPopupData" :key="idx">
              <td>{{ (hdDstPopupPage - 1) * hdDstPopupPageSize + idx + 1 }}</td>
              <td><span class="pq-ip-link">{{ row.domain }}</span></td>
              <td class="pq-num">{{ row.totalReq }}</td>
              <td class="pq-num">{{ row.failCount }}</td>
              <td class="pq-num">{{ row.avgLatency }}</td>
            </tr>
            <tr v-if="hdDstPopupData.length === 0">
              <td colspan="5" class="ou-empty">无数据</td>
            </tr>
          </tbody>
        </table>
        <div class="pq-footer" style="margin-top:12px">
          <div class="pq-pager">
            <button class="pq-page-btn" @click="hdDstPopupPage > 1 && hdDstPopupPage--">‹</button>
            <button v-for="p in hdDstPopupPages" :key="p" class="pq-page-btn" :class="{ active: p === hdDstPopupPage }" @click="hdDstPopupPage = p">{{ p }}</button>
            <button class="pq-page-btn" @click="hdDstPopupPage < hdDstPopupPages && hdDstPopupPage++">›</button>
            <span style="margin-left:8px;font-size:12px;color:#909399">到第</span>
            <input class="pq-page-goto" v-model.number="hdDstPopupGoto" />
            <span style="font-size:12px;color:#909399">页</span>
            <button class="pq-page-goto-btn" @click="hdDstPopupPage = hdDstPopupGoto; hdDstPopupGoto = hdDstPopupPage">确定</button>
          </div>
          <div style="display:flex;gap:12px;align-items:center">
            <span style="font-size:12px;color:#909399">共 {{ hdDstPopupData.length }} 条</span>
            <el-select v-model="hdDstPopupPageSize" style="width:110px" size="small">
              <el-option :value="100" label="100 条/页" />
            </el-select>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- ==================== DNS 实时-Top服务器详情弹窗 ==================== -->
    <el-dialog v-model="dnsRtTopServerPopupVisible" :title="'访问对象 -> ' + dnsRtTopServerPopupIp" width="70%" destroy-on-close class="pq-detail-dialog">
      <div style="padding:12px">
        <div style="display:flex;gap:12px;margin-bottom:12px;align-items:center">
          <el-input v-model="dnsRtTopServerPopupKeyword" placeholder="关键字搜索" style="width:220px" />
          <button class="ou-search-btn" @click="dnsRtTopServerPopupPage = 1">
            <el-icon><Search /></el-icon>
          </button>
        </div>
        <table class="pq-rt-table">
          <thead>
            <tr>
              <th style="width:40px">序号</th>
              <th>域名</th>
              <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>失败次数 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>平均时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in dnsRtTopServerPopupData" :key="idx">
              <td>{{ (dnsRtTopServerPopupPage - 1) * dnsRtTopServerPopupPageSize + idx + 1 }}</td>
              <td><span class="pq-ip-link">{{ row.domain }}</span></td>
              <td class="pq-num">{{ row.totalReq }}</td>
              <td class="pq-num">{{ row.failCount }}</td>
              <td class="pq-num">{{ row.avgLatency }}</td>
            </tr>
            <tr v-if="dnsRtTopServerPopupData.length === 0">
              <td colspan="5" class="ou-empty">无数据</td>
            </tr>
          </tbody>
        </table>
        <div class="pq-footer" style="margin-top:12px">
          <div class="pq-pager">
            <button class="pq-page-btn" @click="dnsRtTopServerPopupPage > 1 && dnsRtTopServerPopupPage--">‹</button>
            <button v-for="p in dnsRtTopServerPopupPages" :key="p" class="pq-page-btn" :class="{ active: p === dnsRtTopServerPopupPage }" @click="dnsRtTopServerPopupPage = p">{{ p }}</button>
            <button class="pq-page-btn" @click="dnsRtTopServerPopupPage < dnsRtTopServerPopupPages && dnsRtTopServerPopupPage++">›</button>
            <span style="margin-left:8px;font-size:12px;color:#909399">到第</span>
            <input class="pq-page-goto" v-model.number="dnsRtTopServerPopupGoto" />
            <span style="font-size:12px;color:#909399">页</span>
            <button class="pq-page-goto-btn" @click="dnsRtTopServerPopupPage = dnsRtTopServerPopupGoto; dnsRtTopServerPopupGoto = dnsRtTopServerPopupPage">确定</button>
          </div>
          <div style="display:flex;gap:12px;align-items:center">
            <span style="font-size:12px;color:#909399">共 {{ dnsRtTopServerPopupData.length }} 条</span>
            <el-select v-model="dnsRtTopServerPopupPageSize" style="width:110px" size="small">
              <el-option :value="100" label="100 条/页" />
            </el-select>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- ==================== DNS 实时-质量域名详情弹窗 ==================== -->
    <el-dialog v-model="dnsRtDomainPopupVisible" :title="'访问对象 -> ' + dnsRtDomainPopupDomain" width="70%" destroy-on-close class="pq-detail-dialog">
      <div style="padding:12px">
        <div style="display:flex;gap:12px;margin-bottom:12px;align-items:center">
          <el-input v-model="dnsRtDomainPopupKeyword" placeholder="关键字搜索" style="width:220px" />
          <button class="ou-search-btn" @click="dnsRtDomainPopupPage = 1">
            <el-icon><Search /></el-icon>
          </button>
        </div>
        <table class="pq-rt-table">
          <thead>
            <tr>
              <th style="width:40px">序号</th>
              <th>域名</th>
              <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>失败次数 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>平均时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in dnsRtDomainPopupData" :key="idx">
              <td>{{ (dnsRtDomainPopupPage - 1) * dnsRtDomainPopupPageSize + idx + 1 }}</td>
              <td><span class="pq-ip-link">{{ row.domain }}</span></td>
              <td class="pq-num">{{ row.totalReq }}</td>
              <td class="pq-num">{{ row.failCount }}</td>
              <td class="pq-num">{{ row.avgLatency }}</td>
            </tr>
            <tr v-if="dnsRtDomainPopupData.length === 0">
              <td colspan="5" class="ou-empty">无数据</td>
            </tr>
          </tbody>
        </table>
        <div class="pq-footer" style="margin-top:12px">
          <div class="pq-pager">
            <button class="pq-page-btn" @click="dnsRtDomainPopupPage > 1 && dnsRtDomainPopupPage--">‹</button>
            <button v-for="p in dnsRtDomainPopupPages" :key="p" class="pq-page-btn" :class="{ active: p === dnsRtDomainPopupPage }" @click="dnsRtDomainPopupPage = p">{{ p }}</button>
            <button class="pq-page-btn" @click="dnsRtDomainPopupPage < dnsRtDomainPopupPages && dnsRtDomainPopupPage++">›</button>
            <span style="margin-left:8px;font-size:12px;color:#909399">到第</span>
            <input class="pq-page-goto" v-model.number="dnsRtDomainPopupGoto" />
            <span style="font-size:12px;color:#909399">页</span>
            <button class="pq-page-goto-btn" @click="dnsRtDomainPopupPage = dnsRtDomainPopupGoto; dnsRtDomainPopupGoto = dnsRtDomainPopupPage">确定</button>
          </div>
          <div style="display:flex;gap:12px;align-items:center">
            <span style="font-size:12px;color:#909399">共 {{ dnsRtDomainPopupData.length }} 条</span>
            <el-select v-model="dnsRtDomainPopupPageSize" style="width:110px" size="small">
              <el-option :value="100" label="100 条/页" />
            </el-select>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- ==================== DNS 实时-质量源详情弹窗 ==================== -->
    <el-dialog v-model="dnsRtSrcPopupVisible" :title="'访问对象 -> ' + dnsRtSrcPopupIp" width="70%" destroy-on-close class="pq-detail-dialog">
      <div style="padding:12px">
        <div style="display:flex;gap:12px;margin-bottom:12px;align-items:center">
          <el-input v-model="dnsRtSrcPopupKeyword" placeholder="关键字搜索" style="width:220px" />
          <button class="ou-search-btn" @click="dnsRtSrcPopupPage = 1">
            <el-icon><Search /></el-icon>
          </button>
        </div>
        <table class="pq-rt-table">
          <thead>
            <tr>
              <th style="width:40px">序号</th>
              <th>域名</th>
              <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>失败次数 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>平均时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in dnsRtSrcPopupData" :key="idx">
              <td>{{ (dnsRtSrcPopupPage - 1) * dnsRtSrcPopupPageSize + idx + 1 }}</td>
              <td><span class="pq-ip-link">{{ row.domain }}</span></td>
              <td class="pq-num">{{ row.totalReq }}</td>
              <td class="pq-num">{{ row.failCount }}</td>
              <td class="pq-num">{{ row.avgLatency }}</td>
            </tr>
            <tr v-if="dnsRtSrcPopupData.length === 0">
              <td colspan="5" class="ou-empty">无数据</td>
            </tr>
          </tbody>
        </table>
        <div class="pq-footer" style="margin-top:12px">
          <div class="pq-pager">
            <button class="pq-page-btn" @click="dnsRtSrcPopupPage > 1 && dnsRtSrcPopupPage--">‹</button>
            <button v-for="p in dnsRtSrcPopupPages" :key="p" class="pq-page-btn" :class="{ active: p === dnsRtSrcPopupPage }" @click="dnsRtSrcPopupPage = p">{{ p }}</button>
            <button class="pq-page-btn" @click="dnsRtSrcPopupPage < dnsRtSrcPopupPages && dnsRtSrcPopupPage++">›</button>
            <span style="margin-left:8px;font-size:12px;color:#909399">到第</span>
            <input class="pq-page-goto" v-model.number="dnsRtSrcPopupGoto" />
            <span style="font-size:12px;color:#909399">页</span>
            <button class="pq-page-goto-btn" @click="dnsRtSrcPopupPage = dnsRtSrcPopupGoto; dnsRtSrcPopupGoto = dnsRtSrcPopupPage">确定</button>
          </div>
          <div style="display:flex;gap:12px;align-items:center">
            <span style="font-size:12px;color:#909399">共 {{ dnsRtSrcPopupData.length }} 条</span>
            <el-select v-model="dnsRtSrcPopupPageSize" style="width:110px" size="small">
              <el-option :value="100" label="100 条/页" />
            </el-select>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- ==================== DNS 历史-Top服务器详情弹窗 ==================== -->
    <el-dialog v-model="dnsHdTopServerPopupVisible" :title="'访问对象 -> ' + dnsHdTopServerPopupIp" width="70%" destroy-on-close class="pq-detail-dialog">
      <div style="padding:12px">
        <div style="display:flex;gap:12px;margin-bottom:12px;align-items:center">
          <el-input v-model="dnsHdTopServerPopupKeyword" placeholder="关键字搜索" style="width:220px" />
          <button class="ou-search-btn" @click="dnsHdTopServerPopupPage = 1">
            <el-icon><Search /></el-icon>
          </button>
        </div>
        <table class="pq-rt-table">
          <thead>
            <tr>
              <th style="width:40px">序号</th>
              <th>域名</th>
              <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>失败次数 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>平均时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in dnsHdTopServerPopupData" :key="idx">
              <td>{{ (dnsHdTopServerPopupPage - 1) * dnsHdTopServerPopupPageSize + idx + 1 }}</td>
              <td><span class="pq-ip-link">{{ row.domain }}</span></td>
              <td class="pq-num">{{ row.totalReq }}</td>
              <td class="pq-num">{{ row.failCount }}</td>
              <td class="pq-num">{{ row.avgLatency }}</td>
            </tr>
            <tr v-if="dnsHdTopServerPopupData.length === 0">
              <td colspan="5" class="ou-empty">无数据</td>
            </tr>
          </tbody>
        </table>
        <div class="pq-footer" style="margin-top:12px">
          <div class="pq-pager">
            <button class="pq-page-btn" @click="dnsHdTopServerPopupPage > 1 && dnsHdTopServerPopupPage--">‹</button>
            <button v-for="p in dnsHdTopServerPopupPages" :key="p" class="pq-page-btn" :class="{ active: p === dnsHdTopServerPopupPage }" @click="dnsHdTopServerPopupPage = p">{{ p }}</button>
            <button class="pq-page-btn" @click="dnsHdTopServerPopupPage < dnsHdTopServerPopupPages && dnsHdTopServerPopupPage++">›</button>
            <span style="margin-left:8px;font-size:12px;color:#909399">到第</span>
            <input class="pq-page-goto" v-model.number="dnsHdTopServerPopupGoto" />
            <span style="font-size:12px;color:#909399">页</span>
            <button class="pq-page-goto-btn" @click="dnsHdTopServerPopupPage = dnsHdTopServerPopupGoto; dnsHdTopServerPopupGoto = dnsHdTopServerPopupPage">确定</button>
          </div>
          <div style="display:flex;gap:12px;align-items:center">
            <span style="font-size:12px;color:#909399">共 {{ dnsHdTopServerPopupData.length }} 条</span>
            <el-select v-model="dnsHdTopServerPopupPageSize" style="width:110px" size="small">
              <el-option :value="100" label="100 条/页" />
            </el-select>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- ==================== DNS 历史-质量域名详情弹窗 ==================== -->
    <el-dialog v-model="dnsHdDomainPopupVisible" :title="'访问对象 -> ' + dnsHdDomainPopupDomain" width="70%" destroy-on-close class="pq-detail-dialog">
      <div style="padding:12px">
        <div style="display:flex;gap:12px;margin-bottom:12px;align-items:center">
          <el-input v-model="dnsHdDomainPopupKeyword" placeholder="关键字搜索" style="width:220px" />
          <button class="ou-search-btn" @click="dnsHdDomainPopupPage = 1">
            <el-icon><Search /></el-icon>
          </button>
        </div>
        <table class="pq-rt-table">
          <thead>
            <tr>
              <th style="width:40px">序号</th>
              <th>域名</th>
              <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>失败次数 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>平均时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in dnsHdDomainPopupData" :key="idx">
              <td>{{ (dnsHdDomainPopupPage - 1) * dnsHdDomainPopupPageSize + idx + 1 }}</td>
              <td><span class="pq-ip-link">{{ row.domain }}</span></td>
              <td class="pq-num">{{ row.totalReq }}</td>
              <td class="pq-num">{{ row.failCount }}</td>
              <td class="pq-num">{{ row.avgLatency }}</td>
            </tr>
            <tr v-if="dnsHdDomainPopupData.length === 0">
              <td colspan="5" class="ou-empty">无数据</td>
            </tr>
          </tbody>
        </table>
        <div class="pq-footer" style="margin-top:12px">
          <div class="pq-pager">
            <button class="pq-page-btn" @click="dnsHdDomainPopupPage > 1 && dnsHdDomainPopupPage--">‹</button>
            <button v-for="p in dnsHdDomainPopupPages" :key="p" class="pq-page-btn" :class="{ active: p === dnsHdDomainPopupPage }" @click="dnsHdDomainPopupPage = p">{{ p }}</button>
            <button class="pq-page-btn" @click="dnsHdDomainPopupPage < dnsHdDomainPopupPages && dnsHdDomainPopupPage++">›</button>
            <span style="margin-left:8px;font-size:12px;color:#909399">到第</span>
            <input class="pq-page-goto" v-model.number="dnsHdDomainPopupGoto" />
            <span style="font-size:12px;color:#909399">页</span>
            <button class="pq-page-goto-btn" @click="dnsHdDomainPopupPage = dnsHdDomainPopupGoto; dnsHdDomainPopupGoto = dnsHdDomainPopupPage">确定</button>
          </div>
          <div style="display:flex;gap:12px;align-items:center">
            <span style="font-size:12px;color:#909399">共 {{ dnsHdDomainPopupData.length }} 条</span>
            <el-select v-model="dnsHdDomainPopupPageSize" style="width:110px" size="small">
              <el-option :value="100" label="100 条/页" />
            </el-select>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- ==================== DNS 历史-质量源详情弹窗 ==================== -->
    <el-dialog v-model="dnsHdSrcPopupVisible" :title="'访问对象 -> ' + dnsHdSrcPopupIp" width="70%" destroy-on-close class="pq-detail-dialog">
      <div style="padding:12px">
        <div style="display:flex;gap:12px;margin-bottom:12px;align-items:center">
          <el-input v-model="dnsHdSrcPopupKeyword" placeholder="关键字搜索" style="width:220px" />
          <button class="ou-search-btn" @click="dnsHdSrcPopupPage = 1">
            <el-icon><Search /></el-icon>
          </button>
        </div>
        <table class="pq-rt-table">
          <thead>
            <tr>
              <th style="width:40px">序号</th>
              <th>域名</th>
              <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>失败次数 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>平均时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in dnsHdSrcPopupData" :key="idx">
              <td>{{ (dnsHdSrcPopupPage - 1) * dnsHdSrcPopupPageSize + idx + 1 }}</td>
              <td><span class="pq-ip-link">{{ row.domain }}</span></td>
              <td class="pq-num">{{ row.totalReq }}</td>
              <td class="pq-num">{{ row.failCount }}</td>
              <td class="pq-num">{{ row.avgLatency }}</td>
            </tr>
            <tr v-if="dnsHdSrcPopupData.length === 0">
              <td colspan="5" class="ou-empty">无数据</td>
            </tr>
          </tbody>
        </table>
        <div class="pq-footer" style="margin-top:12px">
          <div class="pq-pager">
            <button class="pq-page-btn" @click="dnsHdSrcPopupPage > 1 && dnsHdSrcPopupPage--">‹</button>
            <button v-for="p in dnsHdSrcPopupPages" :key="p" class="pq-page-btn" :class="{ active: p === dnsHdSrcPopupPage }" @click="dnsHdSrcPopupPage = p">{{ p }}</button>
            <button class="pq-page-btn" @click="dnsHdSrcPopupPage < dnsHdSrcPopupPages && dnsHdSrcPopupPage++">›</button>
            <span style="margin-left:8px;font-size:12px;color:#909399">到第</span>
            <input class="pq-page-goto" v-model.number="dnsHdSrcPopupGoto" />
            <span style="font-size:12px;color:#909399">页</span>
            <button class="pq-page-goto-btn" @click="dnsHdSrcPopupPage = dnsHdSrcPopupGoto; dnsHdSrcPopupGoto = dnsHdSrcPopupPage">确定</button>
          </div>
          <div style="display:flex;gap:12px;align-items:center">
            <span style="font-size:12px;color:#909399">共 {{ dnsHdSrcPopupData.length }} 条</span>
            <el-select v-model="dnsHdSrcPopupPageSize" style="width:110px" size="small">
              <el-option :value="100" label="100 条/页" />
            </el-select>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- ==================== HTTP 实时-质量源详情弹窗 ==================== -->
    <el-dialog v-model="httpRtSrcPopupVisible" :title="'访问对象 -> ' + httpRtSrcPopupIp" width="70%" destroy-on-close class="pq-detail-dialog">
      <div style="padding:12px">
        <div style="display:flex;gap:12px;margin-bottom:12px;align-items:center">
          <el-input v-model="httpRtSrcPopupKeyword" placeholder="关键字搜索" style="width:220px" />
          <button class="ou-search-btn" @click="httpRtSrcPopupPage = 1">
            <el-icon><Search /></el-icon>
          </button>
        </div>
        <table class="pq-rt-table">
          <thead>
            <tr>
              <th style="width:40px">序号</th>
              <th>域名</th>
              <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>失败次数 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>平均时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in httpRtSrcPopupData" :key="idx">
              <td>{{ (httpRtSrcPopupPage - 1) * httpRtSrcPopupPageSize + idx + 1 }}</td>
              <td><span class="pq-ip-link">{{ row.domain }}</span></td>
              <td class="pq-num">{{ row.totalReq }}</td>
              <td class="pq-num">{{ row.failCount }}</td>
              <td class="pq-num">{{ row.avgLatency }}</td>
            </tr>
            <tr v-if="httpRtSrcPopupData.length === 0">
              <td colspan="5" class="ou-empty">无数据</td>
            </tr>
          </tbody>
        </table>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">
          <div class="pq-pager">
            <button class="pq-page-btn" @click="httpRtSrcPopupPage > 1 && httpRtSrcPopupPage--">‹</button>
            <button v-for="pg in httpRtSrcPopupPages" :key="pg" class="pq-page-btn" :class="{ active: pg === httpRtSrcPopupPage }" @click="httpRtSrcPopupPage = pg">{{ pg }}</button>
            <button class="pq-page-btn" @click="httpRtSrcPopupPage < httpRtSrcPopupPages && httpRtSrcPopupPage++">›</button>
            <span style="margin-left:8px;font-size:12px;color:#909399">到第</span>
            <input class="pq-page-goto" v-model.number="httpRtSrcPopupGoto" />
            <span style="font-size:12px;color:#909399">页</span>
            <button class="pq-page-goto-btn" @click="httpRtSrcPopupPage = httpRtSrcPopupGoto; httpRtSrcPopupGoto = httpRtSrcPopupPage">确定</button>
          </div>
          <div style="display:flex;gap:12px;align-items:center">
            <span style="font-size:12px;color:#909399">共 {{ httpRtSrcPopupData.length }} 条</span>
            <el-select v-model="httpRtSrcPopupPageSize" style="width:110px" size="small">
              <el-option :value="100" label="100 条/页" />
            </el-select>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- ==================== HTTP 实时-质量域名详情弹窗 ==================== -->
    <el-dialog v-model="httpRtDomainPopupVisible" :title="'访问对象 -> ' + httpRtDomainPopupDomain" width="70%" destroy-on-close class="pq-detail-dialog">
      <div style="padding:12px">
        <div style="display:flex;gap:12px;margin-bottom:12px;align-items:center">
          <el-input v-model="httpRtDomainPopupKeyword" placeholder="关键字搜索" style="width:220px" />
          <button class="ou-search-btn" @click="httpRtDomainPopupPage = 1">
            <el-icon><Search /></el-icon>
          </button>
        </div>
        <table class="pq-rt-table">
          <thead>
            <tr>
              <th style="width:40px">序号</th>
              <th>IP地址</th>
              <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>失败次数 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>平均时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in httpRtDomainPopupData" :key="idx">
              <td>{{ (httpRtDomainPopupPage - 1) * httpRtDomainPopupPageSize + idx + 1 }}</td>
              <td><span class="pq-ip-link">{{ row.ip }}</span></td>
              <td class="pq-num">{{ row.totalReq }}</td>
              <td class="pq-num">{{ row.failCount }}</td>
              <td class="pq-num">{{ row.avgLatency }}</td>
            </tr>
            <tr v-if="httpRtDomainPopupData.length === 0">
              <td colspan="5" class="ou-empty">无数据</td>
            </tr>
          </tbody>
        </table>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">
          <div class="pq-pager">
            <button class="pq-page-btn" @click="httpRtDomainPopupPage > 1 && httpRtDomainPopupPage--">‹</button>
            <button v-for="pg in httpRtDomainPopupPages" :key="pg" class="pq-page-btn" :class="{ active: pg === httpRtDomainPopupPage }" @click="httpRtDomainPopupPage = pg">{{ pg }}</button>
            <button class="pq-page-btn" @click="httpRtDomainPopupPage < httpRtDomainPopupPages && httpRtDomainPopupPage++">›</button>
            <span style="margin-left:8px;font-size:12px;color:#909399">到第</span>
            <input class="pq-page-goto" v-model.number="httpRtDomainPopupGoto" />
            <span style="font-size:12px;color:#909399">页</span>
            <button class="pq-page-goto-btn" @click="httpRtDomainPopupPage = httpRtDomainPopupGoto; httpRtDomainPopupGoto = httpRtDomainPopupPage">确定</button>
          </div>
          <div style="display:flex;gap:12px;align-items:center">
            <span style="font-size:12px;color:#909399">共 {{ httpRtDomainPopupData.length }} 条</span>
            <el-select v-model="httpRtDomainPopupPageSize" style="width:110px" size="small">
              <el-option :value="100" label="100 条/页" />
            </el-select>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- ==================== HTTP 历史-质量源详情弹窗 ==================== -->
    <el-dialog v-model="httpHdSrcPopupVisible" :title="'访问对象 -> ' + httpHdSrcPopupIp" width="70%" destroy-on-close class="pq-detail-dialog">
      <div style="padding:12px">
        <div style="display:flex;gap:12px;margin-bottom:12px;align-items:center">
          <el-input v-model="httpHdSrcPopupKeyword" placeholder="关键字搜索" style="width:220px" />
          <button class="ou-search-btn" @click="httpHdSrcPopupPage = 1">
            <el-icon><Search /></el-icon>
          </button>
        </div>
        <table class="pq-rt-table">
          <thead>
            <tr>
              <th style="width:40px">序号</th>
              <th>域名</th>
              <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>失败次数 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>平均时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in httpHdSrcPopupData" :key="idx">
              <td>{{ (httpHdSrcPopupPage - 1) * httpHdSrcPopupPageSize + idx + 1 }}</td>
              <td><span class="pq-ip-link">{{ row.domain }}</span></td>
              <td class="pq-num">{{ row.totalReq }}</td>
              <td class="pq-num">{{ row.failCount }}</td>
              <td class="pq-num">{{ row.avgLatency }}</td>
            </tr>
            <tr v-if="httpHdSrcPopupData.length === 0">
              <td colspan="5" class="ou-empty">无数据</td>
            </tr>
          </tbody>
        </table>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">
          <div class="pq-pager">
            <button class="pq-page-btn" @click="httpHdSrcPopupPage > 1 && httpHdSrcPopupPage--">‹</button>
            <button v-for="pg in httpHdSrcPopupPages" :key="pg" class="pq-page-btn" :class="{ active: pg === httpHdSrcPopupPage }" @click="httpHdSrcPopupPage = pg">{{ pg }}</button>
            <button class="pq-page-btn" @click="httpHdSrcPopupPage < httpHdSrcPopupPages && httpHdSrcPopupPage++">›</button>
            <span style="margin-left:8px;font-size:12px;color:#909399">到第</span>
            <input class="pq-page-goto" v-model.number="httpHdSrcPopupGoto" />
            <span style="font-size:12px;color:#909399">页</span>
            <button class="pq-page-goto-btn" @click="httpHdSrcPopupPage = httpHdSrcPopupGoto; httpHdSrcPopupGoto = httpHdSrcPopupPage">确定</button>
          </div>
          <div style="display:flex;gap:12px;align-items:center">
            <span style="font-size:12px;color:#909399">共 {{ httpHdSrcPopupData.length }} 条</span>
            <el-select v-model="httpHdSrcPopupPageSize" style="width:110px" size="small">
              <el-option :value="100" label="100 条/页" />
            </el-select>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- ==================== HTTP 历史-质量域名详情弹窗 ==================== -->
    <el-dialog v-model="httpHdDomainPopupVisible" :title="'访问对象 -> ' + httpHdDomainPopupDomain" width="70%" destroy-on-close class="pq-detail-dialog">
      <div style="padding:12px">
        <div style="display:flex;gap:12px;margin-bottom:12px;align-items:center">
          <el-input v-model="httpHdDomainPopupKeyword" placeholder="关键字搜索" style="width:220px" />
          <button class="ou-search-btn" @click="httpHdDomainPopupPage = 1">
            <el-icon><Search /></el-icon>
          </button>
        </div>
        <table class="pq-rt-table">
          <thead>
            <tr>
              <th style="width:40px">序号</th>
              <th>IP地址</th>
              <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>失败次数 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>平均时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in httpHdDomainPopupData" :key="idx">
              <td>{{ (httpHdDomainPopupPage - 1) * httpHdDomainPopupPageSize + idx + 1 }}</td>
              <td><span class="pq-ip-link">{{ row.ip }}</span></td>
              <td class="pq-num">{{ row.totalReq }}</td>
              <td class="pq-num">{{ row.failCount }}</td>
              <td class="pq-num">{{ row.avgLatency }}</td>
            </tr>
            <tr v-if="httpHdDomainPopupData.length === 0">
              <td colspan="5" class="ou-empty">无数据</td>
            </tr>
          </tbody>
        </table>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">
          <div class="pq-pager">
            <button class="pq-page-btn" @click="httpHdDomainPopupPage > 1 && httpHdDomainPopupPage--">‹</button>
            <button v-for="pg in httpHdDomainPopupPages" :key="pg" class="pq-page-btn" :class="{ active: pg === httpHdDomainPopupPage }" @click="httpHdDomainPopupPage = pg">{{ pg }}</button>
            <button class="pq-page-btn" @click="httpHdDomainPopupPage < httpHdDomainPopupPages && httpHdDomainPopupPage++">›</button>
            <span style="margin-left:8px;font-size:12px;color:#909399">到第</span>
            <input class="pq-page-goto" v-model.number="httpHdDomainPopupGoto" />
            <span style="font-size:12px;color:#909399">页</span>
            <button class="pq-page-goto-btn" @click="httpHdDomainPopupPage = httpHdDomainPopupGoto; httpHdDomainPopupGoto = httpHdDomainPopupPage">确定</button>
          </div>
          <div style="display:flex;gap:12px;align-items:center">
            <span style="font-size:12px;color:#909399">共 {{ httpHdDomainPopupData.length }} 条</span>
            <el-select v-model="httpHdDomainPopupPageSize" style="width:110px" size="small">
              <el-option :value="100" label="100 条/页" />
            </el-select>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- ==================== HTTPS 实时-质量源详情弹窗 ==================== -->
    <el-dialog v-model="httpsRtSrcPopupVisible" :title="'访问对象 -> ' + httpsRtSrcPopupIp" width="70%" destroy-on-close class="pq-detail-dialog">
      <div style="padding:12px">
        <div style="display:flex;gap:12px;margin-bottom:12px;align-items:center">
          <el-input v-model="httpsRtSrcPopupKeyword" placeholder="关键字搜索" style="width:220px" />
          <button class="ou-search-btn" @click="httpsRtSrcPopupPage = 1">
            <el-icon><Search /></el-icon>
          </button>
        </div>
        <table class="pq-rt-table">
          <thead>
            <tr>
              <th style="width:40px">序号</th>
              <th>域名</th>
              <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>失败次数 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>平均时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in httpsRtSrcPopupData" :key="idx">
              <td>{{ (httpsRtSrcPopupPage - 1) * httpsRtSrcPopupPageSize + idx + 1 }}</td>
              <td><span class="pq-ip-link">{{ row.domain }}</span></td>
              <td class="pq-num">{{ row.totalReq }}</td>
              <td class="pq-num">{{ row.failCount }}</td>
              <td class="pq-num">{{ row.avgLatency }}</td>
            </tr>
            <tr v-if="httpsRtSrcPopupData.length === 0">
              <td colspan="5" class="ou-empty">无数据</td>
            </tr>
          </tbody>
        </table>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">
          <div class="pq-pager">
            <button class="pq-page-btn" @click="httpsRtSrcPopupPage > 1 && httpsRtSrcPopupPage--">‹</button>
            <button v-for="pg in httpsRtSrcPopupPages" :key="pg" class="pq-page-btn" :class="{ active: pg === httpsRtSrcPopupPage }" @click="httpsRtSrcPopupPage = pg">{{ pg }}</button>
            <button class="pq-page-btn" @click="httpsRtSrcPopupPage < httpsRtSrcPopupPages && httpsRtSrcPopupPage++">›</button>
            <span style="margin-left:8px;font-size:12px;color:#909399">到第</span>
            <input class="pq-page-goto" v-model.number="httpsRtSrcPopupGoto" />
            <span style="font-size:12px;color:#909399">页</span>
            <button class="pq-page-goto-btn" @click="httpsRtSrcPopupPage = httpsRtSrcPopupGoto; httpsRtSrcPopupGoto = httpsRtSrcPopupPage">确定</button>
          </div>
          <div style="display:flex;gap:12px;align-items:center">
            <span style="font-size:12px;color:#909399">共 {{ httpsRtSrcPopupData.length }} 条</span>
            <el-select v-model="httpsRtSrcPopupPageSize" style="width:110px" size="small">
              <el-option :value="100" label="100 条/页" />
            </el-select>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- ==================== HTTPS 实时-质量域名详情弹窗 ==================== -->
    <el-dialog v-model="httpsRtDomainPopupVisible" :title="'访问对象 -> ' + httpsRtDomainPopupDomain" width="70%" destroy-on-close class="pq-detail-dialog">
      <div style="padding:12px">
        <div style="display:flex;gap:12px;margin-bottom:12px;align-items:center">
          <el-input v-model="httpsRtDomainPopupKeyword" placeholder="关键字搜索" style="width:220px" />
          <button class="ou-search-btn" @click="httpsRtDomainPopupPage = 1">
            <el-icon><Search /></el-icon>
          </button>
        </div>
        <table class="pq-rt-table">
          <thead>
            <tr>
              <th style="width:40px">序号</th>
              <th>IP地址</th>
              <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>失败次数 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>平均时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in httpsRtDomainPopupData" :key="idx">
              <td>{{ (httpsRtDomainPopupPage - 1) * httpsRtDomainPopupPageSize + idx + 1 }}</td>
              <td><span class="pq-ip-link">{{ row.ip }}</span></td>
              <td class="pq-num">{{ row.totalReq }}</td>
              <td class="pq-num">{{ row.failCount }}</td>
              <td class="pq-num">{{ row.avgLatency }}</td>
            </tr>
            <tr v-if="httpsRtDomainPopupData.length === 0">
              <td colspan="5" class="ou-empty">无数据</td>
            </tr>
          </tbody>
        </table>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">
          <div class="pq-pager">
            <button class="pq-page-btn" @click="httpsRtDomainPopupPage > 1 && httpsRtDomainPopupPage--">‹</button>
            <button v-for="pg in httpsRtDomainPopupPages" :key="pg" class="pq-page-btn" :class="{ active: pg === httpsRtDomainPopupPage }" @click="httpsRtDomainPopupPage = pg">{{ pg }}</button>
            <button class="pq-page-btn" @click="httpsRtDomainPopupPage < httpsRtDomainPopupPages && httpsRtDomainPopupPage++">›</button>
            <span style="margin-left:8px;font-size:12px;color:#909399">到第</span>
            <input class="pq-page-goto" v-model.number="httpsRtDomainPopupGoto" />
            <span style="font-size:12px;color:#909399">页</span>
            <button class="pq-page-goto-btn" @click="httpsRtDomainPopupPage = httpsRtDomainPopupGoto; httpsRtDomainPopupGoto = httpsRtDomainPopupPage">确定</button>
          </div>
          <div style="display:flex;gap:12px;align-items:center">
            <span style="font-size:12px;color:#909399">共 {{ httpsRtDomainPopupData.length }} 条</span>
            <el-select v-model="httpsRtDomainPopupPageSize" style="width:110px" size="small">
              <el-option :value="100" label="100 条/页" />
            </el-select>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- ==================== HTTPS 历史-质量源详情弹窗 ==================== -->
    <el-dialog v-model="httpsHdSrcPopupVisible" :title="'访问对象 -> ' + httpsHdSrcPopupIp" width="70%" destroy-on-close class="pq-detail-dialog">
      <div style="padding:12px">
        <div style="display:flex;gap:12px;margin-bottom:12px;align-items:center">
          <el-input v-model="httpsHdSrcPopupKeyword" placeholder="关键字搜索" style="width:220px" />
          <button class="ou-search-btn" @click="httpsHdSrcPopupPage = 1">
            <el-icon><Search /></el-icon>
          </button>
        </div>
        <table class="pq-rt-table">
          <thead>
            <tr>
              <th style="width:40px">序号</th>
              <th>域名</th>
              <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>失败次数 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>平均时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in httpsHdSrcPopupData" :key="idx">
              <td>{{ (httpsHdSrcPopupPage - 1) * httpsHdSrcPopupPageSize + idx + 1 }}</td>
              <td><span class="pq-ip-link">{{ row.domain }}</span></td>
              <td class="pq-num">{{ row.totalReq }}</td>
              <td class="pq-num">{{ row.failCount }}</td>
              <td class="pq-num">{{ row.avgLatency }}</td>
            </tr>
            <tr v-if="httpsHdSrcPopupData.length === 0">
              <td colspan="5" class="ou-empty">无数据</td>
            </tr>
          </tbody>
        </table>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">
          <div class="pq-pager">
            <button class="pq-page-btn" @click="httpsHdSrcPopupPage > 1 && httpsHdSrcPopupPage--">‹</button>
            <button v-for="pg in httpsHdSrcPopupPages" :key="pg" class="pq-page-btn" :class="{ active: pg === httpsHdSrcPopupPage }" @click="httpsHdSrcPopupPage = pg">{{ pg }}</button>
            <button class="pq-page-btn" @click="httpsHdSrcPopupPage < httpsHdSrcPopupPages && httpsHdSrcPopupPage++">›</button>
            <span style="margin-left:8px;font-size:12px;color:#909399">到第</span>
            <input class="pq-page-goto" v-model.number="httpsHdSrcPopupGoto" />
            <span style="font-size:12px;color:#909399">页</span>
            <button class="pq-page-goto-btn" @click="httpsHdSrcPopupPage = httpsHdSrcPopupGoto; httpsHdSrcPopupGoto = httpsHdSrcPopupPage">确定</button>
          </div>
          <div style="display:flex;gap:12px;align-items:center">
            <span style="font-size:12px;color:#909399">共 {{ httpsHdSrcPopupData.length }} 条</span>
            <el-select v-model="httpsHdSrcPopupPageSize" style="width:110px" size="small">
              <el-option :value="100" label="100 条/页" />
            </el-select>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- ==================== HTTPS 历史-质量域名详情弹窗 ==================== -->
    <el-dialog v-model="httpsHdDomainPopupVisible" :title="'访问对象 -> ' + httpsHdDomainPopupDomain" width="70%" destroy-on-close class="pq-detail-dialog">
      <div style="padding:12px">
        <div style="display:flex;gap:12px;margin-bottom:12px;align-items:center">
          <el-input v-model="httpsHdDomainPopupKeyword" placeholder="关键字搜索" style="width:220px" />
          <button class="ou-search-btn" @click="httpsHdDomainPopupPage = 1">
            <el-icon><Search /></el-icon>
          </button>
        </div>
        <table class="pq-rt-table">
          <thead>
            <tr>
              <th style="width:40px">序号</th>
              <th>IP地址</th>
              <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>失败次数 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>平均时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in httpsHdDomainPopupData" :key="idx">
              <td>{{ (httpsHdDomainPopupPage - 1) * httpsHdDomainPopupPageSize + idx + 1 }}</td>
              <td><span class="pq-ip-link">{{ row.ip }}</span></td>
              <td class="pq-num">{{ row.totalReq }}</td>
              <td class="pq-num">{{ row.failCount }}</td>
              <td class="pq-num">{{ row.avgLatency }}</td>
            </tr>
            <tr v-if="httpsHdDomainPopupData.length === 0">
              <td colspan="5" class="ou-empty">无数据</td>
            </tr>
          </tbody>
        </table>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">
          <div class="pq-pager">
            <button class="pq-page-btn" @click="httpsHdDomainPopupPage > 1 && httpsHdDomainPopupPage--">‹</button>
            <button v-for="pg in httpsHdDomainPopupPages" :key="pg" class="pq-page-btn" :class="{ active: pg === httpsHdDomainPopupPage }" @click="httpsHdDomainPopupPage = pg">{{ pg }}</button>
            <button class="pq-page-btn" @click="httpsHdDomainPopupPage < httpsHdDomainPopupPages && httpsHdDomainPopupPage++">›</button>
            <span style="margin-left:8px;font-size:12px;color:#909399">到第</span>
            <input class="pq-page-goto" v-model.number="httpsHdDomainPopupGoto" />
            <span style="font-size:12px;color:#909399">页</span>
            <button class="pq-page-goto-btn" @click="httpsHdDomainPopupPage = httpsHdDomainPopupGoto; httpsHdDomainPopupGoto = httpsHdDomainPopupPage">确定</button>
          </div>
          <div style="display:flex;gap:12px;align-items:center">
            <span style="font-size:12px;color:#909399">共 {{ httpsHdDomainPopupData.length }} 条</span>
            <el-select v-model="httpsHdDomainPopupPageSize" style="width:110px" size="small">
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
import { LineChart, PieChart } from 'echarts/charts'
import {
  TitleComponent, TooltipComponent, LegendComponent, GridComponent
} from 'echarts/components'
import { Search, Sort, MoreFilled } from '@element-plus/icons-vue'

use([CanvasRenderer, LineChart, PieChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent])

// ── Tabs ──
const protocols = ['TCP', 'DNS', 'HTTP', 'HTTPS']
const activeProtocol = ref('TCP')
const protocolSubTabs = ref<Record<string, string>>({
  TCP: 'realtime',
  DNS: 'realtime',
  HTTP: 'realtime',
  HTTPS: 'realtime',
})
const subTab = computed({
  get: () => protocolSubTabs.value[activeProtocol.value] || 'realtime',
  set: (val: string) => {
    protocolSubTabs.value[activeProtocol.value] = val
  },
})

// ── 时延桶定义 ──
const BUCKETS = [
  { name: '(0,5]', color: '#5470c6' },
  { name: '(5,10]', color: '#91cc75' },
  { name: '(10,20]', color: '#fac858' },
  { name: '(20,40]', color: '#ee6666' },
  { name: '(40,80]', color: '#73c0de' },
  { name: '(80,120]', color: '#3ba272' },
  { name: '(120,200]', color: '#fc8452' },
  { name: '(200,500]', color: '#9a60b4' },
  { name: '(500,1000]', color: '#ea7ccc' },
  { name: '>=1000ms', color: '#ff9f7f' },
  { name: '无应答', color: '#dcdfe6' },
]

// ══════════════════════════════════════════════════════════
// 实时分析
// ══════════════════════════════════════════════════════════

const rtXLabels = ['12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '15.Jun', '02:00', '04:00', '06:00', '08:00', '10:00']

function genRtStackData() {
  const totals = [1200, 1285, 1150, 1350, 1240, 1310, 1616, 1180, 1125, 1290, 1380, 1420]
  const pcts = [0.1125, 0.0582, 0.0416, 0.0328, 0.0264, 0.0218, 0.0342, 0.0286, 0.0212, 0.0323, 0.5904]
  return BUCKETS.map((b, layer) => ({
    name: b.name,
    type: 'line' as const,
    stack: 'latency',
    smooth: true,
    symbol: 'none',
    itemStyle: { color: b.color },
    areaStyle: { color: b.color, opacity: 0.3 },
    data: totals.map((t, i) => Math.round(t * pcts[layer] * (1 + Math.sin(i * 0.65 + layer * 1.1) * 0.06))),
  }))
}

const rtLatencyTrendOption = ref({
  tooltip: { trigger: 'axis' },
  legend: {
    data: BUCKETS.map(b => b.name),
    top: 0,
    textStyle: { fontSize: 10 },
    itemWidth: 12,
    itemHeight: 8,
  },
  grid: { left: 60, right: 20, top: 40, bottom: 30 },
  xAxis: { type: 'category', data: rtXLabels, axisLabel: { rotate: 30, fontSize: 9 } },
  yAxis: { type: 'value', axisLabel: { formatter: (v: number) => v >= 1000 ? (v / 1000).toFixed(1) + 'K' : String(v) } },
  series: genRtStackData(),
})

const rtLatencyMax = ref('176616')
const rtLatencyMin = ref('110392')
const rtLatencyAvg = ref('1449510')

// 平均时延
const rtAvgData = [72, 86, 68, 92, 78, 84, 125, 58, 64, 88, 76, 82]
const rtAvgLatencyOption = ref({
  tooltip: { trigger: 'axis' },
  grid: { left: 40, right: 20, top: 10, bottom: 30 },
  xAxis: { type: 'category', data: rtXLabels, axisLabel: { rotate: 30, fontSize: 9 } },
  yAxis: { type: 'value' },
  series: [{ type: 'line', smooth: true, data: rtAvgData, itemStyle: { color: '#5470c6' }, symbol: 'none' }],
})
const rtAvgMax = ref('166.60')
const rtAvgMin = ref('66.98')
const rtAvgAvg = ref('81')

// 失败率
const rtFailData = [58, 62, 56, 68, 64, 60, 74, 66, 58, 62, 60, 56]
const rtFailRateOption = ref({
  tooltip: { trigger: 'axis' },
  grid: { left: 40, right: 20, top: 10, bottom: 30 },
  xAxis: { type: 'category', data: rtXLabels, axisLabel: { rotate: 30, fontSize: 9 } },
  yAxis: { type: 'value', axisLabel: { formatter: '{value}%' } },
  series: [{ type: 'line', smooth: true, data: rtFailData, itemStyle: { color: '#5470c6' }, symbol: 'none' }],
})
const rtFailMax = ref('77.06')
const rtFailMin = ref('60.16')
const rtFailAvg = ref('66')

// 饼图
const rtPieData = [
  { value: 11.25, name: '(0,5]' }, { value: 5.82, name: '(5,10]' },
  { value: 4.16, name: '(10,20]' }, { value: 3.28, name: '(20,40]' },
  { value: 2.64, name: '(40,80]' }, { value: 2.18, name: '(80,120]' },
  { value: 3.42, name: '(120,200]' }, { value: 2.86, name: '(200,500]' },
  { value: 2.12, name: '(500,1000]' }, { value: 3.23, name: '>=1000ms' },
  { value: 59.04, name: '无应答' },
]
const rtPieOption = ref({
  tooltip: { trigger: 'item', formatter: '{b}: {c}%' },
  legend: {
    orient: 'vertical',
    right: 10,
    top: 'center',
    textStyle: { fontSize: 10 },
    itemWidth: 10,
    itemHeight: 10,
  },
  series: [{
    type: 'pie',
    radius: ['30%', '65%'],
    center: ['35%', '50%'],
    label: { show: false },
    data: rtPieData.map(d => ({ ...d, itemStyle: { color: BUCKETS.find(b => b.name === d.name)?.color } })),
  }],
})

// ── 实时-质量源表格 ──
interface IpRow { ip: string; totalReq: number; failCount: number; avgLatency: string }
const rtSrcData: IpRow[] = [
  { ip: '113.120.243.171', totalReq: 15734, failCount: 15734, avgLatency: '-' },
  { ip: '101.6.14.166', totalReq: 8227, failCount: 8227, avgLatency: '721.71' },
  { ip: '2001:250:ff08:fc:2458:84be::', totalReq: 5191, failCount: 5191, avgLatency: '-' },
  { ip: '36.152.132.180', totalReq: 5191, failCount: 5191, avgLatency: '-' },
  { ip: '160.116.76.33', totalReq: 4375, failCount: 4375, avgLatency: '-' },
  { ip: '101.6.6.90', totalReq: 2603, failCount: 2603, avgLatency: '-' },
]
const rtSrcPage = ref(1)
const rtSrcGoto = ref(1)
const rtSrcPages = computed(() => Math.ceil(rtSrcData.length / 100) || 1)

// ── 实时-质量目标表格 ─
const rtDstData: IpRow[] = [
  { ip: '101.6.15.130', totalReq: 202347, failCount: 198014, avgLatency: '633.93' },
  { ip: '2402:800:1:400:6506:f82::', totalReq: 179157, failCount: 179157, avgLatency: '-' },
  { ip: '2402:800:1:400:2:402:2...', totalReq: 157280, failCount: 154576, avgLatency: '516.69' },
  { ip: '166.111.96.91', totalReq: 1440, failCount: 1440, avgLatency: '-' },
  { ip: '100.115.82.151', totalReq: 1095, failCount: 1095, avgLatency: '-' },
  { ip: '100.115.82.241', totalReq: 1000, failCount: 1000, avgLatency: '-' },
]
const rtDstPage = ref(1)
const rtDstPages = computed(() => Math.ceil(rtDstData.length / 100) || 1)

// ══════════════════════════════════════════════════════════
// DNS 实时分析
// ══════════════════════════════════════════════════════════

const dnsRtXLabels = ['12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '15.Jun', '02:00', '04:00', '06:00', '08:00', '10:00']

// DNS 时延趋势
function genDnsRtLatencyStackData() {
  const totals = [200, 220, 180, 240, 210, 230, 300, 190, 170, 250, 260, 280]
  const pcts = [0.08, 0.06, 0.05, 0.04, 0.03, 0.02, 0.03, 0.02, 0.02, 0.03, 0.65]
  return BUCKETS.map((b, layer) => ({
    name: b.name,
    type: 'line' as const,
    stack: 'latency',
    smooth: true,
    symbol: 'none',
    itemStyle: { color: b.color },
    areaStyle: { color: b.color, opacity: 0.3 },
    data: totals.map((t, i) => Math.round(t * pcts[layer] * (1 + Math.sin(i * 0.65 + layer * 1.1) * 0.06))),
  }))
}

const dnsRtLatencyTrendOption = ref({
  tooltip: { trigger: 'axis' },
  legend: {
    data: BUCKETS.map(b => b.name),
    top: 0,
    textStyle: { fontSize: 10 },
    itemWidth: 12,
    itemHeight: 8,
  },
  grid: { left: 60, right: 20, top: 40, bottom: 30 },
  xAxis: { type: 'category', data: dnsRtXLabels, axisLabel: { rotate: 30, fontSize: 9 } },
  yAxis: { type: 'value', axisLabel: { formatter: (v: number) => v >= 1000 ? (v / 1000).toFixed(1) + 'K' : String(v) } },
  series: genDnsRtLatencyStackData(),
})

const dnsRtLatencyMax = ref('634168')
const dnsRtLatencyMin = ref('525436')
const dnsRtLatencyAvg = ref('570797')

// DNS 请求趋势（双线：总请求数 + 请求次数）
const dnsRtTotalReqData = [100, 110, 95, 120, 105, 115, 150, 90, 85, 125, 130, 140]
const dnsRtReqCountData = [80, 88, 76, 96, 84, 92, 120, 72, 68, 100, 104, 112]
const dnsRtRequestTrendOption = ref({
  tooltip: { trigger: 'axis' },
  legend: {
    data: ['总请求数', '请求次数'],
    top: 0,
    textStyle: { fontSize: 10 },
  },
  grid: { left: 60, right: 20, top: 30, bottom: 30 },
  xAxis: { type: 'category', data: dnsRtXLabels, axisLabel: { rotate: 30, fontSize: 9 } },
  yAxis: { type: 'value', axisLabel: { formatter: (v: number) => v >= 1000 ? (v / 1000).toFixed(1) + 'K' : String(v) } },
  series: [
    { name: '总请求数', type: 'line', smooth: true, data: dnsRtTotalReqData, itemStyle: { color: '#5470c6' }, symbol: 'none' },
    { name: '请求次数', type: 'line', smooth: true, data: dnsRtReqCountData, itemStyle: { color: '#91cc75' }, symbol: 'none' },
  ],
})
const dnsRtReqMax = ref('273861')
const dnsRtReqMin = ref('125484')
const dnsRtReqAvg = ref('19667')

// DNS 失败率趋势
const dnsRtFailData = [70, 72, 68, 74, 71, 73, 80, 66, 64, 75, 76, 78]
const dnsRtFailRateOption = ref({
  tooltip: { trigger: 'axis' },
  grid: { left: 40, right: 20, top: 10, bottom: 30 },
  xAxis: { type: 'category', data: dnsRtXLabels, axisLabel: { rotate: 30, fontSize: 9 } },
  yAxis: { type: 'value', axisLabel: { formatter: '{value}%' } },
  series: [{ type: 'line', smooth: true, data: dnsRtFailData, itemStyle: { color: '#5470c6' }, symbol: 'none' }],
})
const dnsRtFailMax = ref('82.16')
const dnsRtFailMin = ref('66.16')
const dnsRtFailAvg = ref('75')

const dnsRtAvgLatency = ref('683')

// DNS 时延分布
const dnsRtPieData = [
  { value: 8.00, name: '(0,5]' }, { value: 6.00, name: '(5,10]' },
  { value: 5.00, name: '(10,20]' }, { value: 4.00, name: '(20,40]' },
  { value: 3.00, name: '(40,80]' }, { value: 2.00, name: '(80,120]' },
  { value: 3.00, name: '(120,200]' }, { value: 2.00, name: '(200,500]' },
  { value: 2.00, name: '(500,1000]' }, { value: 3.00, name: '>=1000ms' },
  { value: 62.00, name: '无应答' },
]
const dnsRtPieOption = ref({
  tooltip: { trigger: 'item', formatter: '{b}: {c}%' },
  legend: {
    orient: 'vertical',
    right: 10,
    top: 'center',
    textStyle: { fontSize: 10 },
    itemWidth: 10,
    itemHeight: 10,
  },
  series: [{
    type: 'pie',
    radius: ['30%', '65%'],
    center: ['35%', '50%'],
    label: { show: false },
    data: dnsRtPieData.map(d => ({ ...d, itemStyle: { color: BUCKETS.find(b => b.name === d.name)?.color } })),
  }],
})

// DNS 实时-Top服务器
interface DnsTopServerRow { ip: string; totalReq: number; failCount: number; avgLatency: string }
const dnsRtTopServerData: DnsTopServerRow[] = [
  { ip: '101.6.6.6', totalReq: 3844540260, failCount: 2825919500, avgLatency: '335.089' },
  { ip: '91.127.0.0', totalReq: 422168890, failCount: 82312911, avgLatency: '4.465' },
  { ip: '101.6.6.172', totalReq: 282643971, failCount: 3256042, avgLatency: '0.206' },
  { ip: '101.6.6.173', totalReq: 277104418, failCount: 3183602, avgLatency: '0.291' },
  { ip: '114.114.114.114', totalReq: 4469357, failCount: 2734573, avgLatency: '7.016' },
  { ip: '62.80.53.83', totalReq: 1260539, failCount: 1260539, avgLatency: '-' },
  { ip: '10.8.8.8', totalReq: 1069407, failCount: 1069407, avgLatency: '-' },
]
const dnsRtTopServerPage = ref(1)
const dnsRtTopServerGoto = ref(1)
const dnsRtTopServerPages = computed(() => Math.ceil(dnsRtTopServerData.length / 100) || 1)

// DNS 实时-质量域名
interface DnsDomainRow { domain: string; totalReq: number; failCount: number; avgLatency: string }
const dnsRtQualityDomainData: DnsDomainRow[] = [
  { domain: 'www.aliexpress.com', totalReq: 66588, failCount: 66588, avgLatency: '-' },
  { domain: 'www.dingtalk.com', totalReq: 65714, failCount: 65714, avgLatency: '-' },
  { domain: 'www.feishu.cn', totalReq: 63611, failCount: 63611, avgLatency: '-' },
  { domain: 'www.zhenai.com', totalReq: 56623, failCount: 56623, avgLatency: '-' },
  { domain: 'www.mybank.cn', totalReq: 56714, failCount: 56714, avgLatency: '-' },
  { domain: 'map.qq.com', totalReq: 56635, failCount: 56635, avgLatency: '-' },
]
const dnsRtDomainPage = ref(1)
const dnsRtDomainPages = computed(() => Math.ceil(dnsRtQualityDomainData.length / 100) || 1)

// DNS 实时-质量源
const dnsRtSrcData: IpRow[] = [
  { ip: '101.6.6.6', totalReq: 3844540260, failCount: 2825919500, avgLatency: '335.089' },
  { ip: '91.127.0.0', totalReq: 422168890, failCount: 82312911, avgLatency: '4.465' },
  { ip: '101.6.6.172', totalReq: 282643971, failCount: 3256042, avgLatency: '0.206' },
  { ip: '101.6.6.173', totalReq: 277104418, failCount: 3183602, avgLatency: '0.291' },
  { ip: '114.114.114.114', totalReq: 4469357, failCount: 2734573, avgLatency: '7.016' },
  { ip: '62.80.53.83', totalReq: 1260539, failCount: 1260539, avgLatency: '-' },
]
const dnsRtSrcPage = ref(1)
const dnsRtSrcPages = computed(() => Math.ceil(dnsRtSrcData.length / 100) || 1)

// ══════════════════════════════════════════════════════════
// DNS 历史分析
// ═════════════════════════════════════════════════════════

const dnsHistoryDateRange = ref<[string, string]>(['2026-07-16 10:15:58', '2026-07-16 10:30:58'])
const dnsHistoryQualityLatency = ref(0)

const dnsHdXLabels = Array.from({ length: 14 }, (_, i) => {
  const min = 15 + i
  const h = Math.floor(min / 60) + 10
  const m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
})

// DNS 历史-时延趋势
function genDnsHdLatencyStackData() {
  const totals = [500, 480, 460, 440, 420, 400, 380, 360, 340, 320, 300, 280, 260, 240]
  const pcts = [0.45, 0.08, 0.06, 0.04, 0.03, 0.02, 0.02, 0.01, 0.01, 0.01, 0.27]
  return BUCKETS.map((b, layer) => ({
    name: b.name,
    type: 'line' as const,
    stack: 'latency',
    smooth: true,
    symbol: 'none',
    itemStyle: { color: b.color },
    areaStyle: { color: b.color, opacity: 0.3 },
    data: totals.map((t, i) => Math.round(t * pcts[layer] * (1 + Math.sin(i * 0.65 + layer * 1.1) * 0.06))),
  }))
}

const dnsHdLatencyTrendOption = ref({
  tooltip: { trigger: 'axis' },
  legend: {
    data: BUCKETS.map(b => b.name),
    top: 0,
    textStyle: { fontSize: 10 },
    itemWidth: 12,
    itemHeight: 8,
  },
  grid: { left: 60, right: 20, top: 40, bottom: 30 },
  xAxis: { type: 'category', data: dnsHdXLabels, axisLabel: { rotate: 30, fontSize: 9 } },
  yAxis: { type: 'value', axisLabel: { formatter: (v: number) => v >= 1000 ? (v / 1000).toFixed(1) + 'K' : String(v) } },
  series: genDnsHdLatencyStackData(),
})

const dnsHdLatencyMax = ref('583003')
const dnsHdLatencyMin = ref('147986')
const dnsHdLatencyAvg = ref('300466')

// DNS 历史-请求趋势
const dnsHdTotalReqData = [100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35]
const dnsHdReqCountData = [80, 76, 72, 68, 64, 60, 56, 52, 48, 44, 40, 36, 32, 28]
const dnsHdRequestTrendOption = ref({
  tooltip: { trigger: 'axis' },
  legend: {
    data: ['总请求数', '请求次数'],
    top: 0,
    textStyle: { fontSize: 10 },
  },
  grid: { left: 60, right: 20, top: 30, bottom: 30 },
  xAxis: { type: 'category', data: dnsHdXLabels, axisLabel: { rotate: 30, fontSize: 9 } },
  yAxis: { type: 'value', axisLabel: { formatter: (v: number) => v >= 1000 ? (v / 1000).toFixed(1) + 'K' : String(v) } },
  series: [
    { name: '总请求数', type: 'line', smooth: true, data: dnsHdTotalReqData, itemStyle: { color: '#5470c6' }, symbol: 'none' },
    { name: '请求次数', type: 'line', smooth: true, data: dnsHdReqCountData, itemStyle: { color: '#91cc75' }, symbol: 'none' },
  ],
})
const dnsHdReqMax = ref('244')
const dnsHdReqMin = ref('216')
const dnsHdReqAvg = ref('3006')

// DNS 历史-失败率趋势
const dnsHdFailData = [85, 82, 80, 78, 75, 72, 70, 68, 65, 62, 60, 58, 55, 52]
const dnsHdFailRateOption = ref({
  tooltip: { trigger: 'axis' },
  grid: { left: 40, right: 20, top: 10, bottom: 30 },
  xAxis: { type: 'category', data: dnsHdXLabels, axisLabel: { rotate: 30, fontSize: 9 } },
  yAxis: { type: 'value', axisLabel: { formatter: '{value}%' } },
  series: [{ type: 'line', smooth: true, data: dnsHdFailData, itemStyle: { color: '#5470c6' }, symbol: 'none' }],
})
const dnsHdFailMax = ref('87.06')
const dnsHdFailMin = ref('52.06')
const dnsHdFailAvg = ref('70')

const dnsHdAvgLatency = ref('193')

// DNS 历史-时延分布
const dnsHdPieData = [
  { value: 45.00, name: '(0,5]' }, { value: 8.00, name: '(5,10]' },
  { value: 6.00, name: '(10,20]' }, { value: 4.00, name: '(20,40]' },
  { value: 3.00, name: '(40,80]' }, { value: 2.00, name: '(80,120]' },
  { value: 2.00, name: '(120,200]' }, { value: 1.00, name: '(200,500]' },
  { value: 1.00, name: '(500,1000]' }, { value: 1.00, name: '>=1000ms' },
  { value: 27.00, name: '无应答' },
]
const dnsHdPieOption = ref({
  tooltip: { trigger: 'item', formatter: '{b}: {c}%' },
  legend: {
    orient: 'vertical',
    right: 10,
    top: 'center',
    textStyle: { fontSize: 10 },
    itemWidth: 10,
    itemHeight: 10,
  },
  series: [{
    type: 'pie',
    radius: ['30%', '65%'],
    center: ['35%', '50%'],
    label: { show: false },
    data: dnsHdPieData.map(d => ({ ...d, itemStyle: { color: BUCKETS.find(b => b.name === d.name)?.color } })),
  }],
})

// DNS 历史-Top服务器
const dnsHdTopServerData: DnsTopServerRow[] = [
  { ip: '101.6.6.6', totalReq: 9310321, failCount: 2861587, avgLatency: '235.52' },
  { ip: '101.6.6.191', totalReq: 7918, failCount: 7918, avgLatency: '-' },
  { ip: '101.6.6.172', totalReq: 445422, failCount: 3284, avgLatency: '0.22' },
  { ip: '101.6.6.173', totalReq: 136059, failCount: 3151, avgLatency: '0.34' },
  { ip: '114.114.114.114', totalReq: 2053, failCount: 1286, avgLatency: '10.8' },
  { ip: '168.111.8.20', totalReq: 11068, failCount: 821, avgLatency: '51.13' },
]
const dnsHdTopServerPage = ref(1)
const dnsHdTopServerGoto = ref(1)
const dnsHdTopServerPages = computed(() => Math.ceil(dnsHdTopServerData.length / 100) || 1)

// DNS 历史-质量域名
const dnsHdQualityDomainData: DnsDomainRow[] = [
  { domain: 'www.aliexpress.com', totalReq: 124092, failCount: 113874, avgLatency: '26.34' },
  { domain: 'www.google.com.cn', totalReq: 120040, failCount: 113022, avgLatency: '616.97' },
  { domain: 'www.qq.com', totalReq: 116150, failCount: 106052, avgLatency: '26.35' },
  { domain: 'finance.sina.com.cn', totalReq: 110201, failCount: 100469, avgLatency: '113.11' },
  { domain: 'www.yuntan.com', totalReq: 105629, failCount: 99840, avgLatency: '25.22' },
  { domain: 'cloud.tencent.com', totalReq: 89786, failCount: 83327, avgLatency: '178.96' },
]
const dnsHdDomainPage = ref(1)
const dnsHdDomainPages = computed(() => Math.ceil(dnsHdQualityDomainData.length / 100) || 1)

// DNS 历史-质量源
const dnsHdSrcData: IpRow[] = [
  { ip: '101.6.6.6', totalReq: 9310321, failCount: 2861587, avgLatency: '235.52' },
  { ip: '101.6.6.191', totalReq: 7918, failCount: 7918, avgLatency: '-' },
  { ip: '101.6.6.172', totalReq: 445422, failCount: 3284, avgLatency: '0.22' },
  { ip: '101.6.6.173', totalReq: 136059, failCount: 3151, avgLatency: '0.34' },
  { ip: '114.114.114.114', totalReq: 2053, failCount: 1286, avgLatency: '10.8' },
  { ip: '168.111.8.20', totalReq: 11068, failCount: 821, avgLatency: '51.13' },
]
const dnsHdSrcPage = ref(1)
const dnsHdSrcPages = computed(() => Math.ceil(dnsHdSrcData.length / 100) || 1)

// ══════════════════════════════════════════════════════════
// TCP 历史分析
// ══════════════════════════════════════════════════════════

const historyDateRange = ref<[string, string]>(['2026-07-16 08:38:46', '2026-07-16 09:08:46'])
const historyQualityLatency = ref(0)

const hdXLabels = Array.from({ length: 14 }, (_, i) => {
  const min = 38 + i * 2
  const h = Math.floor(min / 60) + 8
  const m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
})

function genHdStackData(baseTotals: number[]) {
  const pcts = [0.3558, 0.0482, 0.0316, 0.0228, 0.0164, 0.0118, 0.0142, 0.0086, 0.0052, 0.0055, 0.4799]
  return BUCKETS.map((b, layer) => ({
    name: b.name,
    type: 'line' as const,
    stack: 'latency',
    smooth: true,
    symbol: 'none',
    itemStyle: { color: b.color },
    areaStyle: { color: b.color, opacity: 0.3 },
    data: baseTotals.map((t, i) => Math.round(t * pcts[layer] * (1 + Math.sin(i * 0.65 + layer * 1.1) * 0.06))),
  }))
}

// 客户端时延趋势
const hdClientTotals = [285, 310, 347, 298, 265, 278, 320, 75, 168, 240, 305, 252, 290, 268]
const hdClientLatencyOption = ref({
  tooltip: { trigger: 'axis' },
  legend: {
    data: BUCKETS.map(b => b.name),
    top: 0,
    textStyle: { fontSize: 10 },
    itemWidth: 12,
    itemHeight: 8,
  },
  grid: { left: 60, right: 20, top: 40, bottom: 30 },
  xAxis: { type: 'category', data: hdXLabels, axisLabel: { rotate: 30, fontSize: 9 } },
  yAxis: { type: 'value', axisLabel: { formatter: (v: number) => v >= 1000 ? (v / 1000).toFixed(1) + 'K' : String(v) } },
  series: genHdStackData(hdClientTotals),
})
const hdClientMax = ref('978462')
const hdClientMin = ref('395166')
const hdClientAvg = ref('965074')

// 服务端时延趋势
const hdServerTotals = [142, 155, 173, 149, 132, 139, 160, 37, 84, 120, 152, 126, 145, 134]
const hdServerLatencyOption = ref({
  tooltip: { trigger: 'axis' },
  legend: {
    data: BUCKETS.map(b => b.name),
    top: 0,
    textStyle: { fontSize: 10 },
    itemWidth: 12,
    itemHeight: 8,
  },
  grid: { left: 60, right: 20, top: 40, bottom: 30 },
  xAxis: { type: 'category', data: hdXLabels, axisLabel: { rotate: 30, fontSize: 9 } },
  yAxis: { type: 'value', axisLabel: { formatter: (v: number) => v >= 1000 ? (v / 1000).toFixed(1) + 'K' : String(v) } },
  series: genHdStackData(hdServerTotals),
})
const hdServerMax = ref('489231')
const hdServerMin = ref('197583')
const hdServerAvg = ref('482537')

// 连接失败率
const hdFailData = [53, 54, 55, 54, 53, 52, 51, 50, 49, 48, 50, 52, 53, 54]
const hdFailRateOption = ref({
  tooltip: { trigger: 'axis' },
  grid: { left: 40, right: 20, top: 10, bottom: 30 },
  xAxis: { type: 'category', data: hdXLabels, axisLabel: { rotate: 30, fontSize: 9 } },
  yAxis: { type: 'value', axisLabel: { formatter: '{value}%' }, min: 47, max: 56 },
  series: [{ type: 'line', smooth: true, data: hdFailData, itemStyle: { color: '#ee6666' }, symbol: 'none' }],
})
const hdFailMax = ref('55.16')
const hdFailMin = ref('48.16')
const hdFailAvg = ref('52')

// 平均时延趋势
const hdAvgData = [42, 58, 36, 72, 48, 64, 88, 28, 32, 52, 44, 38, 46, 31]
const hdAvgLatencyOption = ref({
  tooltip: { trigger: 'axis' },
  grid: { left: 40, right: 20, top: 10, bottom: 30 },
  xAxis: { type: 'category', data: hdXLabels, axisLabel: { rotate: 30, fontSize: 9 } },
  yAxis: { type: 'value' },
  series: [
    { type: 'line', smooth: true, name: '客户端', data: hdAvgData, itemStyle: { color: '#5470c6' }, symbol: 'none' },
    { type: 'line', smooth: true, name: '服务端', data: hdAvgData.map(v => Math.round(v * 0.6)), itemStyle: { color: '#91cc75' }, symbol: 'none' },
  ],
})

// 客户端时延分布
const hdClientPieData = [
  { value: 35.58, name: '(0,5]' }, { value: 4.82, name: '(5,10]' },
  { value: 3.16, name: '(10,20]' }, { value: 2.28, name: '(20,40]' },
  { value: 1.64, name: '(40,80]' }, { value: 1.18, name: '(80,120]' },
  { value: 1.42, name: '(120,200]' }, { value: 0.86, name: '(200,500]' },
  { value: 0.52, name: '(500,1000]' }, { value: 0.55, name: '>=1000ms' },
  { value: 47.99, name: '无应答' },
]
const hdClientPieOption = ref({
  tooltip: { trigger: 'item', formatter: '{b}: {c}%' },
  legend: {
    orient: 'vertical',
    right: 10,
    top: 'center',
    textStyle: { fontSize: 10 },
    itemWidth: 10,
    itemHeight: 10,
  },
  series: [{
    type: 'pie',
    radius: ['30%', '65%'],
    center: ['35%', '50%'],
    label: { show: false },
    data: hdClientPieData.map(d => ({ ...d, itemStyle: { color: BUCKETS.find(b => b.name === d.name)?.color } })),
  }],
})

// 服务端时延分布
const hdServerPieData = [
  { value: 45.00, name: '(0,5]' }, { value: 8.00, name: '(5,10]' },
  { value: 5.00, name: '(10,20]' }, { value: 3.50, name: '(20,40]' },
  { value: 2.50, name: '(40,80]' }, { value: 1.80, name: '(80,120]' },
  { value: 1.20, name: '(120,200]' }, { value: 0.80, name: '(200,500]' },
  { value: 0.40, name: '(500,1000]' }, { value: 0.30, name: '>=1000ms' },
  { value: 31.50, name: '无应答' },
]
const hdServerPieOption = ref({
  tooltip: { trigger: 'item', formatter: '{b}: {c}%' },
  legend: {
    orient: 'vertical',
    right: 10,
    top: 'center',
    textStyle: { fontSize: 10 },
    itemWidth: 10,
    itemHeight: 10,
  },
  series: [{
    type: 'pie',
    radius: ['30%', '65%'],
    center: ['35%', '50%'],
    label: { show: false },
    data: hdServerPieData.map(d => ({ ...d, itemStyle: { color: BUCKETS.find(b => b.name === d.name)?.color } })),
  }],
})

// ─ 历史-质量源表格 ──
const hdSrcData: IpRow[] = [
  { ip: '113.120.243.171', totalReq: 29042, failCount: 29042, avgLatency: '-' },
  { ip: '101.6.14.166', totalReq: 23572, failCount: 23024, avgLatency: '734.31' },
  { ip: '36.152.132.180', totalReq: 19636, failCount: 19636, avgLatency: '-' },
  { ip: '101.6.6.90', totalReq: 12665, failCount: 12665, avgLatency: '-' },
  { ip: '160.116.76.45', totalReq: 8479, failCount: 8479, avgLatency: '-' },
  { ip: '61.51.205.18', totalReq: 8108, failCount: 8108, avgLatency: '-' },
]
const hdSrcPage = ref(1)
const hdSrcGoto = ref(1)
const hdSrcPages = computed(() => Math.ceil(hdSrcData.length / 100) || 1)

// ── 历史-质量目标表格 ──
const hdDstData: IpRow[] = [
  { ip: '101.6.15.130', totalReq: 1069171, failCount: 890753, avgLatency: '74.87' },
  { ip: '166.111.96.91', totalReq: 11499, failCount: 6560, avgLatency: '-' },
  { ip: '100.115.82.151', totalReq: 5033, failCount: 5033, avgLatency: '-' },
  { ip: '100.115.82.241', totalReq: 5030, failCount: 5030, avgLatency: '-' },
  { ip: '166.111.5.103', totalReq: 3892, failCount: 3867, avgLatency: '-' },
  { ip: '176.27.22.2', totalReq: 3373, failCount: 3373, avgLatency: '-' },
]
const hdDstPage = ref(1)
const hdDstPages = computed(() => Math.ceil(hdDstData.length / 100) || 1)

// ══════════════════════════════════════════════════════════
// 弹窗
// ══════════════════════════════════════════════════════════

interface PopupRow { domain: string; totalReq: number; failCount: number; avgLatency: string }

// 实时-质量源弹窗
const rtSrcPopupVisible = ref(false)
const rtSrcPopupIp = ref('')
const rtSrcPopupKeyword = ref('')
const rtSrcPopupPage = ref(1)
const rtSrcPopupPageSize = ref(100)
const rtSrcPopupGoto = ref(1)
const rtSrcPopupData = ref<PopupRow[]>([])
const rtSrcPopupPages = computed(() => Math.ceil(rtSrcPopupData.value.length / rtSrcPopupPageSize.value) || 1)

// 实时-质量目标弹窗
const rtDstPopupVisible = ref(false)
const rtDstPopupIp = ref('')
const rtDstPopupKeyword = ref('')
const rtDstPopupPage = ref(1)
const rtDstPopupPageSize = ref(100)
const rtDstPopupGoto = ref(1)
const rtDstPopupData = ref<PopupRow[]>([])
const rtDstPopupPages = computed(() => Math.ceil(rtDstPopupData.value.length / rtDstPopupPageSize.value) || 1)

// 历史-质量源弹窗
const hdSrcPopupVisible = ref(false)
const hdSrcPopupIp = ref('')
const hdSrcPopupKeyword = ref('')
const hdSrcPopupPage = ref(1)
const hdSrcPopupPageSize = ref(100)
const hdSrcPopupGoto = ref(1)
const hdSrcPopupData = ref<PopupRow[]>([])
const hdSrcPopupPages = computed(() => Math.ceil(hdSrcPopupData.value.length / hdSrcPopupPageSize.value) || 1)

// 历史-质量目标弹窗
const hdDstPopupVisible = ref(false)
const hdDstPopupIp = ref('')
const hdDstPopupKeyword = ref('')
const hdDstPopupPage = ref(1)
const hdDstPopupPageSize = ref(100)
const hdDstPopupGoto = ref(1)
const hdDstPopupData = ref<PopupRow[]>([])
const hdDstPopupPages = computed(() => Math.ceil(hdDstPopupData.value.length / hdDstPopupPageSize.value) || 1)

function openRtSrcPopup(ip: string) {
  rtSrcPopupIp.value = ip
  rtSrcPopupKeyword.value = ''
  rtSrcPopupPage.value = 1
  rtSrcPopupData.value = [
    { domain: '2402:f000:1:400:6506:f82::', totalReq: 3015, failCount: 3015, avgLatency: '-' },
  ]
  rtSrcPopupVisible.value = true
}

function openRtDstPopup(ip: string) {
  rtDstPopupIp.value = ip
  rtDstPopupKeyword.value = ''
  rtDstPopupPage.value = 1
  rtDstPopupData.value = [
    { domain: '2402:f000:1:400:6506:f82::', totalReq: 3015, failCount: 3015, avgLatency: '-' },
  ]
  rtDstPopupVisible.value = true
}

function openHdSrcPopup(ip: string) {
  hdSrcPopupIp.value = ip
  hdSrcPopupKeyword.value = ''
  hdSrcPopupPage.value = 1
  hdSrcPopupData.value = [
    { domain: '2402:f000:1:400:6506:f82::', totalReq: 3015, failCount: 3015, avgLatency: '-' },
  ]
  hdSrcPopupVisible.value = true
}

function openHdDstPopup(ip: string) {
  hdDstPopupIp.value = ip
  hdDstPopupKeyword.value = ''
  hdDstPopupPage.value = 1
  hdDstPopupData.value = [
    { domain: '2402:f000:1:400:6506:f82::', totalReq: 3015, failCount: 3015, avgLatency: '-' },
  ]
  hdDstPopupVisible.value = true
}

// ── DNS 弹窗 ──
const dnsRtTopServerPopupVisible = ref(false)
const dnsRtTopServerPopupIp = ref('')
const dnsRtTopServerPopupKeyword = ref('')
const dnsRtTopServerPopupPage = ref(1)
const dnsRtTopServerPopupPageSize = ref(100)
const dnsRtTopServerPopupGoto = ref(1)
const dnsRtTopServerPopupData = ref<PopupRow[]>([])
const dnsRtTopServerPopupPages = computed(() => Math.ceil(dnsRtTopServerPopupData.value.length / dnsRtTopServerPopupPageSize.value) || 1)

const dnsRtDomainPopupVisible = ref(false)
const dnsRtDomainPopupDomain = ref('')
const dnsRtDomainPopupKeyword = ref('')
const dnsRtDomainPopupPage = ref(1)
const dnsRtDomainPopupPageSize = ref(100)
const dnsRtDomainPopupGoto = ref(1)
const dnsRtDomainPopupData = ref<PopupRow[]>([])
const dnsRtDomainPopupPages = computed(() => Math.ceil(dnsRtDomainPopupData.value.length / dnsRtDomainPopupPageSize.value) || 1)

const dnsRtSrcPopupVisible = ref(false)
const dnsRtSrcPopupIp = ref('')
const dnsRtSrcPopupKeyword = ref('')
const dnsRtSrcPopupPage = ref(1)
const dnsRtSrcPopupPageSize = ref(100)
const dnsRtSrcPopupGoto = ref(1)
const dnsRtSrcPopupData = ref<PopupRow[]>([])
const dnsRtSrcPopupPages = computed(() => Math.ceil(dnsRtSrcPopupData.value.length / dnsRtSrcPopupPageSize.value) || 1)

const dnsHdTopServerPopupVisible = ref(false)
const dnsHdTopServerPopupIp = ref('')
const dnsHdTopServerPopupKeyword = ref('')
const dnsHdTopServerPopupPage = ref(1)
const dnsHdTopServerPopupPageSize = ref(100)
const dnsHdTopServerPopupGoto = ref(1)
const dnsHdTopServerPopupData = ref<PopupRow[]>([])
const dnsHdTopServerPopupPages = computed(() => Math.ceil(dnsHdTopServerPopupData.value.length / dnsHdTopServerPopupPageSize.value) || 1)

const dnsHdDomainPopupVisible = ref(false)
const dnsHdDomainPopupDomain = ref('')
const dnsHdDomainPopupKeyword = ref('')
const dnsHdDomainPopupPage = ref(1)
const dnsHdDomainPopupPageSize = ref(100)
const dnsHdDomainPopupGoto = ref(1)
const dnsHdDomainPopupData = ref<PopupRow[]>([])
const dnsHdDomainPopupPages = computed(() => Math.ceil(dnsHdDomainPopupData.value.length / dnsHdDomainPopupPageSize.value) || 1)

const dnsHdSrcPopupVisible = ref(false)
const dnsHdSrcPopupIp = ref('')
const dnsHdSrcPopupKeyword = ref('')
const dnsHdSrcPopupPage = ref(1)
const dnsHdSrcPopupPageSize = ref(100)
const dnsHdSrcPopupGoto = ref(1)
const dnsHdSrcPopupData = ref<PopupRow[]>([])
const dnsHdSrcPopupPages = computed(() => Math.ceil(dnsHdSrcPopupData.value.length / dnsHdSrcPopupPageSize.value) || 1)

function openDnsRtTopServerPopup(ip: string) {
  dnsRtTopServerPopupIp.value = ip
  dnsRtTopServerPopupKeyword.value = ''
  dnsRtTopServerPopupPage.value = 1
  dnsRtTopServerPopupData.value = [
    { domain: '2402:f000:1:400:6506:f82::', totalReq: 3015, failCount: 3015, avgLatency: '-' },
  ]
  dnsRtTopServerPopupVisible.value = true
}

function openDnsRtDomainPopup(domain: string) {
  dnsRtDomainPopupDomain.value = domain
  dnsRtDomainPopupKeyword.value = ''
  dnsRtDomainPopupPage.value = 1
  dnsRtDomainPopupData.value = [
    { domain: '2402:f000:1:400:6506:f82::', totalReq: 3015, failCount: 3015, avgLatency: '-' },
  ]
  dnsRtDomainPopupVisible.value = true
}

function openDnsRtSrcPopup(ip: string) {
  dnsRtSrcPopupIp.value = ip
  dnsRtSrcPopupKeyword.value = ''
  dnsRtSrcPopupPage.value = 1
  dnsRtSrcPopupData.value = [
    { domain: '2402:f000:1:400:6506:f82::', totalReq: 3015, failCount: 3015, avgLatency: '-' },
  ]
  dnsRtSrcPopupVisible.value = true
}

function openDnsHdTopServerPopup(ip: string) {
  dnsHdTopServerPopupIp.value = ip
  dnsHdTopServerPopupKeyword.value = ''
  dnsHdTopServerPopupPage.value = 1
  dnsHdTopServerPopupData.value = [
    { domain: '2402:f000:1:400:6506:f82::', totalReq: 3015, failCount: 3015, avgLatency: '-' },
  ]
  dnsHdTopServerPopupVisible.value = true
}

function openDnsHdDomainPopup(domain: string) {
  dnsHdDomainPopupDomain.value = domain
  dnsHdDomainPopupKeyword.value = ''
  dnsHdDomainPopupPage.value = 1
  dnsHdDomainPopupData.value = [
    { domain: '2402:f000:1:400:6506:f82::', totalReq: 3015, failCount: 3015, avgLatency: '-' },
  ]
  dnsHdDomainPopupVisible.value = true
}

function openDnsHdSrcPopup(ip: string) {
  dnsHdSrcPopupIp.value = ip
  dnsHdSrcPopupKeyword.value = ''
  dnsHdSrcPopupPage.value = 1
  dnsHdSrcPopupData.value = [
    { domain: '2402:f000:1:400:6506:f82::', totalReq: 3015, failCount: 3015, avgLatency: '-' },
  ]
  dnsHdSrcPopupVisible.value = true
}

function doDnsHistorySearch() {
  // Mock: re-generate data
}

function resetDnsHistoryFilters() {
  dnsHistoryDateRange.value = ['2026-07-16 10:15:58', '2026-07-16 10:30:58']
  dnsHistoryQualityLatency.value = 0
}

function doHistorySearch() {
  // Mock: re-generate data
}

function resetHistoryFilters() {
  historyDateRange.value = ['2026-07-16 08:38:46', '2026-07-16 09:08:46']
  historyQualityLatency.value = 0
}

// ══════════════════════════════════════════════════════════════
// HTTP 实时分析
// ═══════════════════════════════════════════════════════════════

// HTTP 实时-时延趋势
const httpRtLatencyMax = ref('167.955')
const httpRtLatencyMin = ref('49.609')
const httpRtLatencyAvg = ref('129.034')
const httpRtLatencyTrendOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { data: ['0-20', '20-50', '50-100', '100-200', '200-400', '400-800', '800-1000', '1000-3000', '>3000ms', '无数据'], bottom: 0, textStyle: { fontSize: 10 }, itemWidth: 12, itemHeight: 8 },
  grid: { left: 50, right: 14, top: 10, bottom: 40 },
  xAxis: { type: 'category', data: ['12:00', '12:05', '12:10', '12:15', '12:20', '12:25', '12:30', '12:35', '12:40', '12:45', '12:50', '12:55', '13:00', '13:05', '13:10', '13:15', '13:20', '13:25', '13:30', '13:35', '13:40', '13:45', '13:50', '13:55'], axisLabel: { fontSize: 10, rotate: 30 } },
  yAxis: { type: 'value', name: '个', nameTextStyle: { fontSize: 10 }, axisLabel: { fontSize: 10 } },
  series: [
    { name: '0-20', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#5470c6' }, areaStyle: { color: '#5470c6', opacity: 0.7 }, data: [1200, 1300, 1100, 1400, 1250, 1350, 1150, 1450, 1200, 1300, 1100, 1400, 1250, 1350, 1150, 1450, 1200, 1300, 1100, 1400, 1250, 1350, 1150, 1450] },
    { name: '20-50', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#91cc75' }, areaStyle: { color: '#91cc75', opacity: 0.7 }, data: [800, 900, 750, 950, 850, 920, 780, 960, 800, 900, 750, 950, 850, 920, 780, 960, 800, 900, 750, 950, 850, 920, 780, 960] },
    { name: '50-100', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#fac858' }, areaStyle: { color: '#fac858', opacity: 0.7 }, data: [500, 550, 480, 600, 520, 580, 490, 610, 500, 550, 480, 600, 520, 580, 490, 610, 500, 550, 480, 600, 520, 580, 490, 610] },
    { name: '100-200', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#ee6666' }, areaStyle: { color: '#ee6666', opacity: 0.7 }, data: [300, 320, 280, 350, 310, 340, 290, 360, 300, 320, 280, 350, 310, 340, 290, 360, 300, 320, 280, 350, 310, 340, 290, 360] },
    { name: '200-400', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#73c0de' }, areaStyle: { color: '#73c0de', opacity: 0.7 }, data: [200, 210, 190, 230, 205, 220, 195, 240, 200, 210, 190, 230, 205, 220, 195, 240, 200, 210, 190, 230, 205, 220, 195, 240] },
    { name: '400-800', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#3ba272' }, areaStyle: { color: '#3ba272', opacity: 0.7 }, data: [100, 110, 95, 120, 105, 115, 98, 125, 100, 110, 95, 120, 105, 115, 98, 125, 100, 110, 95, 120, 105, 115, 98, 125] },
    { name: '800-1000', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#fc8452' }, areaStyle: { color: '#fc8452', opacity: 0.7 }, data: [50, 55, 48, 60, 52, 58, 49, 62, 50, 55, 48, 60, 52, 58, 49, 62, 50, 55, 48, 60, 52, 58, 49, 62] },
    { name: '1000-3000', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#9a60b4' }, areaStyle: { color: '#9a60b4', opacity: 0.7 }, data: [20, 22, 18, 25, 21, 24, 19, 26, 20, 22, 18, 25, 21, 24, 19, 26, 20, 22, 18, 25, 21, 24, 19, 26] },
    { name: '>3000ms', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#ea7ccc' }, areaStyle: { color: '#ea7ccc', opacity: 0.7 }, data: [10, 12, 8, 15, 11, 14, 9, 16, 10, 12, 8, 15, 11, 14, 9, 16, 10, 12, 8, 15, 11, 14, 9, 16] },
    { name: '无数据', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#d0d0d0' }, areaStyle: { color: '#d0d0d0', opacity: 0.7 }, data: [5, 6, 4, 7, 5, 6, 4, 8, 5, 6, 4, 7, 5, 6, 4, 8, 5, 6, 4, 7, 5, 6, 4, 8] },
  ],
}))

// HTTP 实时-平均时延趋势
const httpRtAvgMax = ref('161.7')
const httpRtAvgMin = ref('49.08')
const httpRtAvgAvg = ref('89')
const httpRtAvgLatencyOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  grid: { left: 50, right: 14, top: 10, bottom: 30 },
  xAxis: { type: 'category', data: ['12:00', '12:05', '12:10', '12:15', '12:20', '12:25', '12:30', '12:35', '12:40', '12:45', '12:50', '12:55', '13:00', '13:05', '13:10', '13:15', '13:20', '13:25', '13:30', '13:35', '13:40', '13:45', '13:50', '13:55'], axisLabel: { fontSize: 10, rotate: 30 } },
  yAxis: { type: 'value', name: 'ms', nameTextStyle: { fontSize: 10 }, axisLabel: { fontSize: 10 } },
  series: [{ type: 'line', smooth: true, symbol: 'none', itemStyle: { color: '#5470c6' }, data: [120, 115, 125, 110, 130, 108, 135, 105, 140, 100, 145, 95, 150, 90, 155, 85, 160, 80, 165, 75, 170, 70, 175, 65] }],
}))

// HTTP 实时-HTTP状态码
const httpRt2xx = ref('217320')
const httpRt3xx = ref('11583')
const httpRt4xx = ref('16818')
const httpRt5xx = ref('16818')
const httpRtStatusCodeOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { data: ['HTTP 2xx', 'HTTP 3xx', 'HTTP 4xx', 'HTTP 5xx'], bottom: 0, textStyle: { fontSize: 10 }, itemWidth: 12, itemHeight: 8 },
  grid: { left: 50, right: 14, top: 10, bottom: 40 },
  xAxis: { type: 'category', data: ['12:00', '12:05', '12:10', '12:15', '12:20', '12:25', '12:30', '12:35', '12:40', '12:45', '12:50', '12:55', '13:00', '13:05', '13:10', '13:15', '13:20', '13:25', '13:30', '13:35', '13:40', '13:45', '13:50', '13:55'], axisLabel: { fontSize: 10, rotate: 30 } },
  yAxis: { type: 'value', name: '个', nameTextStyle: { fontSize: 10 }, axisLabel: { fontSize: 10 } },
  series: [
    { name: 'HTTP 2xx', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#5470c6' }, areaStyle: { color: '#5470c6', opacity: 0.7 }, data: [9000, 9200, 8800, 9500, 9100, 9300, 8900, 9600, 9000, 9200, 8800, 9500, 9100, 9300, 8900, 9600, 9000, 9200, 8800, 9500, 9100, 9300, 8900, 9600] },
    { name: 'HTTP 3xx', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#91cc75' }, areaStyle: { color: '#91cc75', opacity: 0.7 }, data: [500, 520, 480, 550, 510, 530, 490, 560, 500, 520, 480, 550, 510, 530, 490, 560, 500, 520, 480, 550, 510, 530, 490, 560] },
    { name: 'HTTP 4xx', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#fac858' }, areaStyle: { color: '#fac858', opacity: 0.7 }, data: [700, 720, 680, 750, 710, 730, 690, 760, 700, 720, 680, 750, 710, 730, 690, 760, 700, 720, 680, 750, 710, 730, 690, 760] },
    { name: 'HTTP 5xx', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#ee6666' }, areaStyle: { color: '#ee6666', opacity: 0.7 }, data: [300, 320, 280, 350, 310, 340, 290, 360, 300, 320, 280, 350, 310, 340, 290, 360, 300, 320, 280, 350, 310, 340, 290, 360] },
  ],
}))

// HTTP 实时-时延分布
const httpRtPieOption = computed(() => ({
  tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
  legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { fontSize: 10 }, itemWidth: 10, itemHeight: 8 },
  series: [{
    type: 'pie', radius: ['40%', '70%'], center: ['35%', '50%'],
    label: { show: false },
    data: [
      { value: 35, name: '0-5s (35.0%)', itemStyle: { color: '#5470c6' } },
      { value: 20, name: '5-10s (20.0%)', itemStyle: { color: '#91cc75' } },
      { value: 15, name: '10-20s (15.0%)', itemStyle: { color: '#fac858' } },
      { value: 10, name: '20-30s (10.0%)', itemStyle: { color: '#ee6666' } },
      { value: 8, name: '30-60s (8.0%)', itemStyle: { color: '#73c0de' } },
      { value: 5, name: '60-120s (5.0%)', itemStyle: { color: '#3ba272' } },
      { value: 4, name: '120-180s (4.0%)', itemStyle: { color: '#fc8452' } },
      { value: 3, name: '>300s (3.0%)', itemStyle: { color: '#9a60b4' } },
    ],
  }],
}))

// HTTP 实时-质量源
interface HttpSrcRow { ip: string; totalReq: number; failCount: number; avgLatency: string }
const httpRtSrcData: HttpSrcRow[] = [
  { ip: '166.111.7.8', totalReq: 3593, failCount: 810, avgLatency: '549.70' },
  { ip: '166.111.7.7', totalReq: 3435, failCount: 677, avgLatency: '346.69' },
  { ip: '59.42.88.155', totalReq: 174, failCount: 174, avgLatency: '-' },
  { ip: '2001:250:600:3::', totalReq: 160, failCount: 160, avgLatency: '-' },
  { ip: '220.194.174.142', totalReq: 152, failCount: 152, avgLatency: '-' },
  { ip: '2001:250:600:4::', totalReq: 151, failCount: 151, avgLatency: '-' },
]
const httpRtSrcPage = ref(1)
const httpRtSrcPageSize = ref(100)
const httpRtSrcGoto = ref(1)
const httpRtSrcPages = computed(() => Math.ceil(httpRtSrcData.length / httpRtSrcPageSize.value) || 1)

// HTTP 实时-质量域名
interface HttpDomainRow { domain: string; totalReq: number; failCount: number; avgLatency: string }
const httpRtDomainData: HttpDomainRow[] = [
  { domain: 'nsbna.tuna.tsinghu...', totalReq: 27735, failCount: 26620, avgLatency: '44.39' },
  { domain: 'pypl.tuna.tsinghua.ed...', totalReq: 382, failCount: 370, avgLatency: '540.00' },
  { domain: 'www.cits.tsinghua.ed...', totalReq: 311, failCount: 142, avgLatency: '666.58' },
  { domain: 'lib.tsinghua.edu.cn', totalReq: 171, failCount: 132, avgLatency: '449.49' },
  { domain: 'ecollection.lib.tsingh...', totalReq: 160, failCount: 111, avgLatency: '700.45' },
  { domain: 'wzlx.tsinghua.edu.cn', totalReq: 303, failCount: 106, avgLatency: '469.12' },
]
const httpRtDomainPage = ref(1)
const httpRtDomainPageSize = ref(100)
const httpRtDomainPages = computed(() => Math.ceil(httpRtDomainData.length / httpRtDomainPageSize.value) || 1)

// HTTP 实时-弹窗
const httpRtSrcPopupVisible = ref(false)
const httpRtSrcPopupIp = ref('')
const httpRtSrcPopupKeyword = ref('')
const httpRtSrcPopupPage = ref(1)
const httpRtSrcPopupPageSize = ref(100)
const httpRtSrcPopupGoto = ref(1)
const httpRtSrcPopupData = ref<PopupRow[]>([])
const httpRtSrcPopupPages = computed(() => Math.ceil(httpRtSrcPopupData.value.length / httpRtSrcPopupPageSize.value) || 1)

const httpRtDomainPopupVisible = ref(false)
const httpRtDomainPopupDomain = ref('')
const httpRtDomainPopupKeyword = ref('')
const httpRtDomainPopupPage = ref(1)
const httpRtDomainPopupPageSize = ref(100)
const httpRtDomainPopupGoto = ref(1)
const httpRtDomainPopupData = ref<PopupRow[]>([])
const httpRtDomainPopupPages = computed(() => Math.ceil(httpRtDomainPopupData.value.length / httpRtDomainPopupPageSize.value) || 1)

function openHttpRtSrcPopup(ip: string) {
  httpRtSrcPopupIp.value = ip
  httpRtSrcPopupKeyword.value = ''
  httpRtSrcPopupPage.value = 1
  httpRtSrcPopupData.value = [
    { domain: 'nsbna.tuna.tsinghua.edu.cn', totalReq: 27735, failCount: 26620, avgLatency: '44.39' },
    { domain: 'pypl.tuna.tsinghua.edu.cn', totalReq: 382, failCount: 370, avgLatency: '540.00' },
  ]
  httpRtSrcPopupVisible.value = true
}

function openHttpRtDomainPopup(domain: string) {
  httpRtDomainPopupDomain.value = domain
  httpRtDomainPopupKeyword.value = ''
  httpRtDomainPopupPage.value = 1
  httpRtDomainPopupData.value = [
    { ip: '166.111.7.8', totalReq: 3593, failCount: 810, avgLatency: '549.70' },
    { ip: '166.111.7.7', totalReq: 3435, failCount: 677, avgLatency: '346.69' },
  ]
  httpRtDomainPopupVisible.value = true
}

// ══════════════════════════════════════════════════════════════
// HTTP 历史分析
// ═══════════════════════════════════════════════════════════════
const httpHistoryDateRange = ref(['2026-07-16 10:15:58', '2026-07-16 10:30:58'])
const httpHistoryQualityLatency = ref(0)

// HTTP 历史-时延趋势
const httpHdLatencyMax = ref('15.07')
const httpHdLatencyMin = ref('41.64')
const httpHdLatencyAvg = ref('48.07')
const httpHdLatencyTrendOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { data: ['0-20', '20-50', '50-100', '100-200', '200-400', '400-800', '800-1000', '1000-3000', '>3000ms', '无数据'], bottom: 0, textStyle: { fontSize: 10 }, itemWidth: 12, itemHeight: 8 },
  grid: { left: 50, right: 14, top: 10, bottom: 40 },
  xAxis: { type: 'category', data: ['10:15', '10:16', '10:17', '10:18', '10:19', '10:20', '10:21', '10:22', '10:23', '10:24', '10:25', '10:26', '10:27', '10:28', '10:29', '10:30'], axisLabel: { fontSize: 10, rotate: 30 } },
  yAxis: { type: 'value', name: '个', nameTextStyle: { fontSize: 10 }, axisLabel: { fontSize: 10 } },
  series: [
    { name: '0-20', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#5470c6' }, areaStyle: { color: '#5470c6', opacity: 0.7 }, data: [4000, 4100, 4200, 4150, 4300, 4250, 4400, 4350, 4500, 4450, 4600, 4550, 4700, 4650, 4800, 4750] },
    { name: '20-50', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#91cc75' }, areaStyle: { color: '#91cc75', opacity: 0.7 }, data: [2000, 2050, 2100, 2080, 2150, 2120, 2200, 2180, 2250, 2220, 2300, 2280, 2350, 2320, 2400, 2380] },
    { name: '50-100', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#fac858' }, areaStyle: { color: '#fac858', opacity: 0.7 }, data: [1000, 1020, 1050, 1040, 1080, 1060, 1100, 1090, 1120, 1110, 1150, 1140, 1180, 1170, 1200, 1190] },
    { name: '100-200', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#ee6666' }, areaStyle: { color: '#ee6666', opacity: 0.7 }, data: [500, 510, 520, 515, 530, 525, 540, 535, 550, 545, 560, 555, 570, 565, 580, 575] },
    { name: '200-400', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#73c0de' }, areaStyle: { color: '#73c0de', opacity: 0.7 }, data: [200, 210, 220, 215, 230, 225, 240, 235, 250, 245, 260, 255, 270, 265, 280, 275] },
    { name: '400-800', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#3ba272' }, areaStyle: { color: '#3ba272', opacity: 0.7 }, data: [100, 105, 110, 108, 115, 112, 120, 118, 125, 122, 130, 128, 135, 132, 140, 138] },
    { name: '800-1000', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#fc8452' }, areaStyle: { color: '#fc8452', opacity: 0.7 }, data: [50, 52, 55, 54, 58, 56, 60, 59, 62, 61, 65, 64, 68, 66, 70, 69] },
    { name: '1000-3000', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#9a60b4' }, areaStyle: { color: '#9a60b4', opacity: 0.7 }, data: [20, 22, 24, 23, 26, 25, 28, 27, 30, 29, 32, 31, 34, 33, 36, 35] },
    { name: '>3000ms', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#ea7ccc' }, areaStyle: { color: '#ea7ccc', opacity: 0.7 }, data: [10, 11, 12, 11, 13, 12, 14, 13, 15, 14, 16, 15, 17, 16, 18, 17] },
    { name: '无数据', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#d0d0d0' }, areaStyle: { color: '#d0d0d0', opacity: 0.7 }, data: [5, 6, 6, 6, 7, 7, 7, 7, 8, 8, 8, 8, 9, 9, 9, 9] },
  ],
}))

// HTTP 历史-HTTP状态码
const httpHd2xx = ref('2177')
const httpHd3xx = ref('14195')
const httpHd4xx = ref('16818')
const httpHd5xx = ref('16818')
const httpHdStatusCodeOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { data: ['HTTP 2xx', 'HTTP 3xx', 'HTTP 4xx', 'HTTP 5xx'], bottom: 0, textStyle: { fontSize: 10 }, itemWidth: 12, itemHeight: 8 },
  grid: { left: 50, right: 14, top: 10, bottom: 40 },
  xAxis: { type: 'category', data: ['10:15', '10:16', '10:17', '10:18', '10:19', '10:20', '10:21', '10:22', '10:23', '10:24', '10:25', '10:26', '10:27', '10:28', '10:29', '10:30'], axisLabel: { fontSize: 10, rotate: 30 } },
  yAxis: { type: 'value', name: '个', nameTextStyle: { fontSize: 10 }, axisLabel: { fontSize: 10 } },
  series: [
    { name: 'HTTP 2xx', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#5470c6' }, areaStyle: { color: '#5470c6', opacity: 0.7 }, data: [100, 110, 105, 115, 108, 120, 112, 125, 118, 130, 122, 135, 128, 140, 132, 145] },
    { name: 'HTTP 3xx', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#91cc75' }, areaStyle: { color: '#91cc75', opacity: 0.7 }, data: [600, 620, 610, 640, 630, 660, 650, 680, 670, 700, 690, 720, 710, 740, 730, 760] },
    { name: 'HTTP 4xx', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#fac858' }, areaStyle: { color: '#fac858', opacity: 0.7 }, data: [700, 720, 710, 740, 730, 760, 750, 780, 770, 800, 790, 820, 810, 840, 830, 860] },
    { name: 'HTTP 5xx', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#ee6666' }, areaStyle: { color: '#ee6666', opacity: 0.7 }, data: [300, 310, 305, 320, 315, 330, 325, 340, 335, 350, 345, 360, 355, 370, 365, 380] },
  ],
}))

// HTTP 历史-平均时延趋势
const httpHdAvgMax = ref('106.49')
const httpHdAvgMin = ref('77.22')
const httpHdAvgAvg = ref('98.06')
const httpHdAvgLatencyOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  grid: { left: 50, right: 14, top: 10, bottom: 30 },
  xAxis: { type: 'category', data: ['10:15', '10:16', '10:17', '10:18', '10:19', '10:20', '10:21', '10:22', '10:23', '10:24', '10:25', '10:26', '10:27', '10:28', '10:29', '10:30'], axisLabel: { fontSize: 10, rotate: 30 } },
  yAxis: { type: 'value', name: 'ms', nameTextStyle: { fontSize: 10 }, axisLabel: { fontSize: 10 } },
  series: [{ type: 'line', smooth: true, symbol: 'none', itemStyle: { color: '#5470c6' }, data: [100, 95, 98, 92, 96, 90, 94, 88, 92, 86, 90, 84, 88, 82, 86, 80] }],
}))

// HTTP 历史-时延分布
const httpHdPieOption = computed(() => ({
  tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
  legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { fontSize: 10 }, itemWidth: 10, itemHeight: 8 },
  series: [{
    type: 'pie', radius: ['40%', '70%'], center: ['35%', '50%'],
    label: { show: false },
    data: [
      { value: 35, name: '0-5s (35.0%)', itemStyle: { color: '#5470c6' } },
      { value: 20, name: '5-10s (20.0%)', itemStyle: { color: '#91cc75' } },
      { value: 15, name: '10-20s (15.0%)', itemStyle: { color: '#fac858' } },
      { value: 10, name: '20-30s (10.0%)', itemStyle: { color: '#ee6666' } },
      { value: 8, name: '30-60s (8.0%)', itemStyle: { color: '#73c0de' } },
      { value: 5, name: '60-120s (5.0%)', itemStyle: { color: '#3ba272' } },
      { value: 4, name: '120-180s (4.0%)', itemStyle: { color: '#fc8452' } },
      { value: 3, name: '>300s (3.0%)', itemStyle: { color: '#9a60b4' } },
    ],
  }],
}))

// HTTP 历史-质量源
const httpHdSrcData: HttpSrcRow[] = [
  { ip: '166.111.7.8', totalReq: 80172, failCount: 5120, avgLatency: '101.16' },
  { ip: '166.111.7.7', totalReq: 80191, failCount: 4063, avgLatency: '100.69' },
  { ip: '111.40.181.18', totalReq: 1441, failCount: 1441, avgLatency: '-' },
  { ip: '14.23.44.18', totalReq: 669, failCount: 669, avgLatency: '-' },
  { ip: '101.6.10.23', totalReq: 8831, failCount: 898, avgLatency: '61.65' },
  { ip: '36.189.234.237', totalReq: 375, failCount: 375, avgLatency: '-' },
]
const httpHdSrcPage = ref(1)
const httpHdSrcPageSize = ref(100)
const httpHdSrcGoto = ref(1)
const httpHdSrcPages = computed(() => Math.ceil(httpHdSrcData.length / httpHdSrcPageSize.value) || 1)

// HTTP 历史-质量域名
const httpHdDomainData: HttpDomainRow[] = [
  { domain: 'nsbna.tuna.tsinghu...', totalReq: 138321, failCount: 114748, avgLatency: '116.31' },
  { domain: 'pypl.tuna.tsinghua.ed...', totalReq: 2210, failCount: 1851, avgLatency: '112.18' },
  { domain: 'archive.ubuntu.com', totalReq: 1231, failCount: 1231, avgLatency: '-' },
  { domain: 'lib.tsinghua.edu.cn', totalReq: 15136, failCount: 532, avgLatency: '13.85' },
  { domain: 'bot.medi.tsinghua.ed...', totalReq: 11915, failCount: 517, avgLatency: '80.07' },
  { domain: 'wzlx.tsinghua.edu.cn', totalReq: 14430, failCount: 401, avgLatency: '83.36' },
]
const httpHdDomainPage = ref(1)
const httpHdDomainPageSize = ref(100)
const httpHdDomainGoto = ref(1)
const httpHdDomainPages = computed(() => Math.ceil(httpHdDomainData.length / httpHdDomainPageSize.value) || 1)

// HTTP 历史-弹窗
const httpHdSrcPopupVisible = ref(false)
const httpHdSrcPopupIp = ref('')
const httpHdSrcPopupKeyword = ref('')
const httpHdSrcPopupPage = ref(1)
const httpHdSrcPopupPageSize = ref(100)
const httpHdSrcPopupGoto = ref(1)
const httpHdSrcPopupData = ref<PopupRow[]>([])
const httpHdSrcPopupPages = computed(() => Math.ceil(httpHdSrcPopupData.value.length / httpHdSrcPopupPageSize.value) || 1)

const httpHdDomainPopupVisible = ref(false)
const httpHdDomainPopupDomain = ref('')
const httpHdDomainPopupKeyword = ref('')
const httpHdDomainPopupPage = ref(1)
const httpHdDomainPopupPageSize = ref(100)
const httpHdDomainPopupGoto = ref(1)
const httpHdDomainPopupData = ref<PopupRow[]>([])
const httpHdDomainPopupPages = computed(() => Math.ceil(httpHdDomainPopupData.value.length / httpHdDomainPopupPageSize.value) || 1)

function openHttpHdSrcPopup(ip: string) {
  httpHdSrcPopupIp.value = ip
  httpHdSrcPopupKeyword.value = ''
  httpHdSrcPopupPage.value = 1
  httpHdSrcPopupData.value = [
    { domain: 'nsbna.tuna.tsinghua.edu.cn', totalReq: 138321, failCount: 114748, avgLatency: '116.31' },
    { domain: 'pypl.tuna.tsinghua.edu.cn', totalReq: 2210, failCount: 1851, avgLatency: '112.18' },
  ]
  httpHdSrcPopupVisible.value = true
}

function openHttpHdDomainPopup(domain: string) {
  httpHdDomainPopupDomain.value = domain
  httpHdDomainPopupKeyword.value = ''
  httpHdDomainPopupPage.value = 1
  httpHdDomainPopupData.value = [
    { ip: '166.111.7.8', totalReq: 80172, failCount: 5120, avgLatency: '101.16' },
    { ip: '166.111.7.7', totalReq: 80191, failCount: 4063, avgLatency: '100.69' },
  ]
  httpHdDomainPopupVisible.value = true
}

function doHttpHistorySearch() {
  // Mock: re-generate data
}

function resetHttpHistoryFilters() {
  httpHistoryDateRange.value = ['2026-07-16 10:15:58', '2026-07-16 10:30:58']
  httpHistoryQualityLatency.value = 0
}

// ══════════════════════════════════════════════════════════════
// HTTPS 实时分析
// ═══════════════════════════════════════════════════════════════

// HTTPS 实时-时延趋势
const httpsRtLatencyMax = ref('189.432')
const httpsRtLatencyMin = ref('52.118')
const httpsRtLatencyAvg = ref('142.567')
const httpsRtLatencyTrendOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { data: ['0-20', '20-50', '50-100', '100-200', '200-400', '400-800', '800-1000', '1000-3000', '>3000ms', '无数据'], bottom: 0, textStyle: { fontSize: 10 }, itemWidth: 12, itemHeight: 8 },
  grid: { left: 50, right: 14, top: 10, bottom: 40 },
  xAxis: { type: 'category', data: ['12:00', '12:05', '12:10', '12:15', '12:20', '12:25', '12:30', '12:35', '12:40', '12:45', '12:50', '12:55', '13:00', '13:05', '13:10', '13:15', '13:20', '13:25', '13:30', '13:35', '13:40', '13:45', '13:50', '13:55'], axisLabel: { fontSize: 10, rotate: 30 } },
  yAxis: { type: 'value', name: '个', nameTextStyle: { fontSize: 10 }, axisLabel: { fontSize: 10 } },
  series: [
    { name: '0-20', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#5470c6' }, areaStyle: { color: '#5470c6', opacity: 0.7 }, data: [1100, 1200, 1050, 1300, 1150, 1250, 1100, 1350, 1100, 1200, 1050, 1300, 1150, 1250, 1100, 1350, 1100, 1200, 1050, 1300, 1150, 1250, 1100, 1350] },
    { name: '20-50', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#91cc75' }, areaStyle: { color: '#91cc75', opacity: 0.7 }, data: [750, 850, 700, 900, 800, 870, 730, 910, 750, 850, 700, 900, 800, 870, 730, 910, 750, 850, 700, 900, 800, 870, 730, 910] },
    { name: '50-100', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#fac858' }, areaStyle: { color: '#fac858', opacity: 0.7 }, data: [480, 530, 460, 580, 500, 560, 470, 590, 480, 530, 460, 580, 500, 560, 470, 590, 480, 530, 460, 580, 500, 560, 470, 590] },
    { name: '100-200', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#ee6666' }, areaStyle: { color: '#ee6666', opacity: 0.7 }, data: [280, 300, 260, 330, 290, 320, 270, 340, 280, 300, 260, 330, 290, 320, 270, 340, 280, 300, 260, 330, 290, 320, 270, 340] },
    { name: '200-400', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#73c0de' }, areaStyle: { color: '#73c0de', opacity: 0.7 }, data: [190, 200, 180, 220, 195, 210, 185, 230, 190, 200, 180, 220, 195, 210, 185, 230, 190, 200, 180, 220, 195, 210, 185, 230] },
    { name: '400-800', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#3ba272' }, areaStyle: { color: '#3ba272', opacity: 0.7 }, data: [95, 105, 90, 115, 100, 110, 93, 120, 95, 105, 90, 115, 100, 110, 93, 120, 95, 105, 90, 115, 100, 110, 93, 120] },
    { name: '800-1000', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#fc8452' }, areaStyle: { color: '#fc8452', opacity: 0.7 }, data: [48, 53, 46, 58, 50, 56, 47, 60, 48, 53, 46, 58, 50, 56, 47, 60, 48, 53, 46, 58, 50, 56, 47, 60] },
    { name: '1000-3000', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#9a60b4' }, areaStyle: { color: '#9a60b4', opacity: 0.7 }, data: [18, 20, 16, 23, 19, 22, 17, 24, 18, 20, 16, 23, 19, 22, 17, 24, 18, 20, 16, 23, 19, 22, 17, 24] },
    { name: '>3000ms', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#ea7ccc' }, areaStyle: { color: '#ea7ccc', opacity: 0.7 }, data: [9, 11, 7, 14, 10, 13, 8, 15, 9, 11, 7, 14, 10, 13, 8, 15, 9, 11, 7, 14, 10, 13, 8, 15] },
    { name: '无数据', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#d0d0d0' }, areaStyle: { color: '#d0d0d0', opacity: 0.7 }, data: [4, 5, 3, 6, 4, 5, 3, 7, 4, 5, 3, 6, 4, 5, 3, 7, 4, 5, 3, 6, 4, 5, 3, 7] },
  ],
}))

// HTTPS 实时-平均时延趋势
const httpsRtAvgMax = ref('175.8')
const httpsRtAvgMin = ref('52.45')
const httpsRtAvgAvg = ref('98.32')
const httpsRtAvgLatencyOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  grid: { left: 50, right: 14, top: 10, bottom: 30 },
  xAxis: { type: 'category', data: ['12:00', '12:05', '12:10', '12:15', '12:20', '12:25', '12:30', '12:35', '12:40', '12:45', '12:50', '12:55', '13:00', '13:05', '13:10', '13:15', '13:20', '13:25', '13:30', '13:35', '13:40', '13:45', '13:50', '13:55'], axisLabel: { fontSize: 10, rotate: 30 } },
  yAxis: { type: 'value', name: 'ms', nameTextStyle: { fontSize: 10 }, axisLabel: { fontSize: 10 } },
  series: [{ type: 'line', smooth: true, symbol: 'none', itemStyle: { color: '#5470c6' }, data: [130, 125, 135, 120, 140, 118, 145, 115, 150, 110, 155, 105, 160, 100, 165, 95, 170, 90, 175, 85, 180, 80, 185, 75] }],
}))

// HTTPS 实时-HTTP状态码
const httpsRt2xx = ref('198450')
const httpsRt3xx = ref('10234')
const httpsRt4xx = ref('15678')
const httpsRt5xx = ref('14532')
const httpsRtStatusCodeOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { data: ['HTTP 2xx', 'HTTP 3xx', 'HTTP 4xx', 'HTTP 5xx'], bottom: 0, textStyle: { fontSize: 10 }, itemWidth: 12, itemHeight: 8 },
  grid: { left: 50, right: 14, top: 10, bottom: 40 },
  xAxis: { type: 'category', data: ['12:00', '12:05', '12:10', '12:15', '12:20', '12:25', '12:30', '12:35', '12:40', '12:45', '12:50', '12:55', '13:00', '13:05', '13:10', '13:15', '13:20', '13:25', '13:30', '13:35', '13:40', '13:45', '13:50', '13:55'], axisLabel: { fontSize: 10, rotate: 30 } },
  yAxis: { type: 'value', name: '个', nameTextStyle: { fontSize: 10 }, axisLabel: { fontSize: 10 } },
  series: [
    { name: 'HTTP 2xx', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#5470c6' }, areaStyle: { color: '#5470c6', opacity: 0.7 }, data: [8200, 8400, 8000, 8700, 8300, 8500, 8100, 8800, 8200, 8400, 8000, 8700, 8300, 8500, 8100, 8800, 8200, 8400, 8000, 8700, 8300, 8500, 8100, 8800] },
    { name: 'HTTP 3xx', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#91cc75' }, areaStyle: { color: '#91cc75', opacity: 0.7 }, data: [450, 470, 430, 500, 460, 480, 440, 510, 450, 470, 430, 500, 460, 480, 440, 510, 450, 470, 430, 500, 460, 480, 440, 510] },
    { name: 'HTTP 4xx', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#fac858' }, areaStyle: { color: '#fac858', opacity: 0.7 }, data: [650, 670, 630, 700, 660, 680, 640, 710, 650, 670, 630, 700, 660, 680, 640, 710, 650, 670, 630, 700, 660, 680, 640, 710] },
    { name: 'HTTP 5xx', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#ee6666' }, areaStyle: { color: '#ee6666', opacity: 0.7 }, data: [280, 300, 260, 330, 290, 320, 270, 340, 280, 300, 260, 330, 290, 320, 270, 340, 280, 300, 260, 330, 290, 320, 270, 340] },
  ],
}))

// HTTPS 实时-时延分布
const httpsRtPieOption = computed(() => ({
  tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
  legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { fontSize: 10 }, itemWidth: 10, itemHeight: 8 },
  series: [{
    type: 'pie', radius: ['40%', '70%'], center: ['35%', '50%'],
    label: { show: false },
    data: [
      { value: 38, name: '0-5s (38.0%)', itemStyle: { color: '#5470c6' } },
      { value: 22, name: '5-10s (22.0%)', itemStyle: { color: '#91cc75' } },
      { value: 14, name: '10-20s (14.0%)', itemStyle: { color: '#fac858' } },
      { value: 9, name: '20-30s (9.0%)', itemStyle: { color: '#ee6666' } },
      { value: 7, name: '30-60s (7.0%)', itemStyle: { color: '#73c0de' } },
      { value: 5, name: '60-120s (5.0%)', itemStyle: { color: '#3ba272' } },
      { value: 3, name: '120-180s (3.0%)', itemStyle: { color: '#fc8452' } },
      { value: 2, name: '>300s (2.0%)', itemStyle: { color: '#9a60b4' } },
    ],
  }],
}))

// HTTPS 实时-质量源
interface HttpsSrcRow { ip: string; totalReq: number; failCount: number; avgLatency: string }
const httpsRtSrcData: HttpsSrcRow[] = [
  { ip: '202.112.58.10', totalReq: 4215, failCount: 923, avgLatency: '612.45' },
  { ip: '202.112.58.11', totalReq: 3890, failCount: 756, avgLatency: '398.23' },
  { ip: '101.6.10.50', totalReq: 198, failCount: 198, avgLatency: '-' },
  { ip: '2001:250:600:5::', totalReq: 175, failCount: 175, avgLatency: '-' },
  { ip: '220.194.174.150', totalReq: 168, failCount: 168, avgLatency: '-' },
  { ip: '2001:250:600:6::', totalReq: 162, failCount: 162, avgLatency: '-' },
]
const httpsRtSrcPage = ref(1)
const httpsRtSrcPageSize = ref(100)
const httpsRtSrcGoto = ref(1)
const httpsRtSrcPages = computed(() => Math.ceil(httpsRtSrcData.length / httpsRtSrcPageSize.value) || 1)

// HTTPS 实时-质量域名
interface HttpsDomainRow { domain: string; totalReq: number; failCount: number; avgLatency: string }
const httpsRtDomainData: HttpsDomainRow[] = [
  { domain: 'secure.tuna.tsinghu...', totalReq: 31250, failCount: 29870, avgLatency: '52.18' },
  { domain: 'api.tuna.tsinghua.ed...', totalReq: 425, failCount: 410, avgLatency: '598.32' },
  { domain: 'portal.tsinghua.edu...', totalReq: 348, failCount: 158, avgLatency: '712.45' },
  { domain: 'ssl.lib.tsinghua.edu.cn', totalReq: 195, failCount: 148, avgLatency: '498.67' },
  { domain: 'encrypted.lib.tsingh...', totalReq: 178, failCount: 125, avgLatency: '756.89' },
  { domain: 'wzlx-ssl.tsinghua.ed...', totalReq: 335, failCount: 118, avgLatency: '512.34' },
]
const httpsRtDomainPage = ref(1)
const httpsRtDomainPageSize = ref(100)
const httpsRtDomainPages = computed(() => Math.ceil(httpsRtDomainData.length / httpsRtDomainPageSize.value) || 1)

// HTTPS 实时-弹窗
const httpsRtSrcPopupVisible = ref(false)
const httpsRtSrcPopupIp = ref('')
const httpsRtSrcPopupKeyword = ref('')
const httpsRtSrcPopupPage = ref(1)
const httpsRtSrcPopupPageSize = ref(100)
const httpsRtSrcPopupGoto = ref(1)
const httpsRtSrcPopupData = ref<PopupRow[]>([])
const httpsRtSrcPopupPages = computed(() => Math.ceil(httpsRtSrcPopupData.value.length / httpsRtSrcPopupPageSize.value) || 1)

const httpsRtDomainPopupVisible = ref(false)
const httpsRtDomainPopupDomain = ref('')
const httpsRtDomainPopupKeyword = ref('')
const httpsRtDomainPopupPage = ref(1)
const httpsRtDomainPopupPageSize = ref(100)
const httpsRtDomainPopupGoto = ref(1)
const httpsRtDomainPopupData = ref<PopupRow[]>([])
const httpsRtDomainPopupPages = computed(() => Math.ceil(httpsRtDomainPopupData.value.length / httpsRtDomainPopupPageSize.value) || 1)

function openHttpsRtSrcPopup(ip: string) {
  httpsRtSrcPopupIp.value = ip
  httpsRtSrcPopupKeyword.value = ''
  httpsRtSrcPopupPage.value = 1
  httpsRtSrcPopupData.value = [
    { domain: 'secure.tuna.tsinghua.edu.cn', totalReq: 31250, failCount: 29870, avgLatency: '52.18' },
    { domain: 'api.tuna.tsinghua.edu.cn', totalReq: 425, failCount: 410, avgLatency: '598.32' },
  ]
  httpsRtSrcPopupVisible.value = true
}

function openHttpsRtDomainPopup(domain: string) {
  httpsRtDomainPopupDomain.value = domain
  httpsRtDomainPopupKeyword.value = ''
  httpsRtDomainPopupPage.value = 1
  httpsRtDomainPopupData.value = [
    { ip: '202.112.58.10', totalReq: 4215, failCount: 923, avgLatency: '612.45' },
    { ip: '202.112.58.11', totalReq: 3890, failCount: 756, avgLatency: '398.23' },
  ]
  httpsRtDomainPopupVisible.value = true
}

// ══════════════════════════════════════════════════════════════
// HTTPS 历史分析
// ═══════════════════════════════════════════════════════════
const httpsHistoryDateRange = ref(['2026-07-16 10:15:58', '2026-07-16 10:30:58'])
const httpsHistoryQualityLatency = ref(0)

// HTTPS 历史-时延趋势
const httpsHdLatencyMax = ref('16.82')
const httpsHdLatencyMin = ref('43.91')
const httpsHdLatencyAvg = ref('51.34')
const httpsHdLatencyTrendOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { data: ['0-20', '20-50', '50-100', '100-200', '200-400', '400-800', '800-1000', '1000-3000', '>3000ms', '无数据'], bottom: 0, textStyle: { fontSize: 10 }, itemWidth: 12, itemHeight: 8 },
  grid: { left: 50, right: 14, top: 10, bottom: 40 },
  xAxis: { type: 'category', data: ['10:15', '10:16', '10:17', '10:18', '10:19', '10:20', '10:21', '10:22', '10:23', '10:24', '10:25', '10:26', '10:27', '10:28', '10:29', '10:30'], axisLabel: { fontSize: 10, rotate: 30 } },
  yAxis: { type: 'value', name: '个', nameTextStyle: { fontSize: 10 }, axisLabel: { fontSize: 10 } },
  series: [
    { name: '0-20', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#5470c6' }, areaStyle: { color: '#5470c6', opacity: 0.7 }, data: [3800, 3900, 4000, 3950, 4100, 4050, 4200, 4150, 4300, 4250, 4400, 4350, 4500, 4450, 4600, 4550] },
    { name: '20-50', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#91cc75' }, areaStyle: { color: '#91cc75', opacity: 0.7 }, data: [1900, 1950, 2000, 1980, 2050, 2020, 2100, 2080, 2150, 2120, 2200, 2180, 2250, 2220, 2300, 2280] },
    { name: '50-100', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#fac858' }, areaStyle: { color: '#fac858', opacity: 0.7 }, data: [950, 970, 1000, 990, 1030, 1010, 1050, 1040, 1070, 1060, 1100, 1090, 1130, 1120, 1150, 1140] },
    { name: '100-200', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#ee6666' }, areaStyle: { color: '#ee6666', opacity: 0.7 }, data: [480, 490, 500, 495, 510, 505, 520, 515, 530, 525, 540, 535, 550, 545, 560, 555] },
    { name: '200-400', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#73c0de' }, areaStyle: { color: '#73c0de', opacity: 0.7 }, data: [190, 200, 210, 205, 220, 215, 230, 225, 240, 235, 250, 245, 260, 255, 270, 265] },
    { name: '400-800', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#3ba272' }, areaStyle: { color: '#3ba272', opacity: 0.7 }, data: [95, 100, 105, 103, 110, 107, 115, 113, 120, 117, 125, 123, 130, 127, 135, 133] },
    { name: '800-1000', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#fc8452' }, areaStyle: { color: '#fc8452', opacity: 0.7 }, data: [48, 50, 53, 52, 56, 54, 58, 57, 60, 59, 63, 62, 66, 64, 68, 67] },
    { name: '1000-3000', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#9a60b4' }, areaStyle: { color: '#9a60b4', opacity: 0.7 }, data: [19, 21, 23, 22, 25, 24, 27, 26, 29, 28, 31, 30, 33, 32, 35, 34] },
    { name: '>3000ms', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#ea7ccc' }, areaStyle: { color: '#ea7ccc', opacity: 0.7 }, data: [9, 10, 11, 10, 12, 11, 13, 12, 14, 13, 15, 14, 16, 15, 17, 16] },
    { name: '无数据', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#d0d0d0' }, areaStyle: { color: '#d0d0d0', opacity: 0.7 }, data: [4, 5, 5, 5, 6, 6, 6, 6, 7, 7, 7, 7, 8, 8, 8, 8] },
  ],
}))

// HTTPS 历史-HTTP状态码
const httpsHd2xx = ref('1998')
const httpsHd3xx = ref('13450')
const httpsHd4xx = ref('15230')
const httpsHd5xx = ref('14120')
const httpsHdStatusCodeOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { data: ['HTTP 2xx', 'HTTP 3xx', 'HTTP 4xx', 'HTTP 5xx'], bottom: 0, textStyle: { fontSize: 10 }, itemWidth: 12, itemHeight: 8 },
  grid: { left: 50, right: 14, top: 10, bottom: 40 },
  xAxis: { type: 'category', data: ['10:15', '10:16', '10:17', '10:18', '10:19', '10:20', '10:21', '10:22', '10:23', '10:24', '10:25', '10:26', '10:27', '10:28', '10:29', '10:30'], axisLabel: { fontSize: 10, rotate: 30 } },
  yAxis: { type: 'value', name: '个', nameTextStyle: { fontSize: 10 }, axisLabel: { fontSize: 10 } },
  series: [
    { name: 'HTTP 2xx', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#5470c6' }, areaStyle: { color: '#5470c6', opacity: 0.7 }, data: [95, 105, 100, 110, 103, 115, 107, 120, 113, 125, 117, 130, 123, 135, 127, 140] },
    { name: 'HTTP 3xx', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#91cc75' }, areaStyle: { color: '#91cc75', opacity: 0.7 }, data: [580, 600, 590, 620, 610, 640, 630, 660, 650, 680, 670, 700, 690, 720, 710, 740] },
    { name: 'HTTP 4xx', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#fac858' }, areaStyle: { color: '#fac858', opacity: 0.7 }, data: [680, 700, 690, 720, 710, 740, 730, 760, 750, 780, 770, 800, 790, 820, 810, 840] },
    { name: 'HTTP 5xx', type: 'line', stack: 'Total', smooth: true, symbol: 'none', itemStyle: { color: '#ee6666' }, areaStyle: { color: '#ee6666', opacity: 0.7 }, data: [290, 300, 295, 310, 305, 320, 315, 330, 325, 340, 335, 350, 345, 360, 355, 370] },
  ],
}))

// HTTPS 历史-平均时延趋势
const httpsHdAvgMax = ref('112.75')
const httpsHdAvgMin = ref('81.48')
const httpsHdAvgAvg = ref('103.62')
const httpsHdAvgLatencyOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  grid: { left: 50, right: 14, top: 10, bottom: 30 },
  xAxis: { type: 'category', data: ['10:15', '10:16', '10:17', '10:18', '10:19', '10:20', '10:21', '10:22', '10:23', '10:24', '10:25', '10:26', '10:27', '10:28', '10:29', '10:30'], axisLabel: { fontSize: 10, rotate: 30 } },
  yAxis: { type: 'value', name: 'ms', nameTextStyle: { fontSize: 10 }, axisLabel: { fontSize: 10 } },
  series: [{ type: 'line', smooth: true, symbol: 'none', itemStyle: { color: '#5470c6' }, data: [105, 100, 103, 97, 101, 95, 99, 93, 97, 91, 95, 89, 93, 87, 91, 85] }],
}))

// HTTPS 历史-时延分布
const httpsHdPieOption = computed(() => ({
  tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
  legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { fontSize: 10 }, itemWidth: 10, itemHeight: 8 },
  series: [{
    type: 'pie', radius: ['40%', '70%'], center: ['35%', '50%'],
    label: { show: false },
    data: [
      { value: 37, name: '0-5s (37.0%)', itemStyle: { color: '#5470c6' } },
      { value: 21, name: '5-10s (21.0%)', itemStyle: { color: '#91cc75' } },
      { value: 14, name: '10-20s (14.0%)', itemStyle: { color: '#fac858' } },
      { value: 10, name: '20-30s (10.0%)', itemStyle: { color: '#ee6666' } },
      { value: 8, name: '30-60s (8.0%)', itemStyle: { color: '#73c0de' } },
      { value: 5, name: '60-120s (5.0%)', itemStyle: { color: '#3ba272' } },
      { value: 3, name: '120-180s (3.0%)', itemStyle: { color: '#fc8452' } },
      { value: 2, name: '>300s (2.0%)', itemStyle: { color: '#9a60b4' } },
    ],
  }],
}))

// HTTPS 历史-质量源
const httpsHdSrcData: HttpsSrcRow[] = [
  { ip: '202.112.58.10', totalReq: 85420, failCount: 5680, avgLatency: '108.45' },
  { ip: '202.112.58.11', totalReq: 85690, failCount: 4520, avgLatency: '107.82' },
  { ip: '111.40.181.25', totalReq: 1580, failCount: 1580, avgLatency: '-' },
  { ip: '14.23.44.25', totalReq: 720, failCount: 720, avgLatency: '-' },
  { ip: '101.6.10.30', totalReq: 9450, failCount: 965, avgLatency: '65.38' },
  { ip: '36.189.234.245', totalReq: 410, failCount: 410, avgLatency: '-' },
]
const httpsHdSrcPage = ref(1)
const httpsHdSrcPageSize = ref(100)
const httpsHdSrcGoto = ref(1)
const httpsHdSrcPages = computed(() => Math.ceil(httpsHdSrcData.length / httpsHdSrcPageSize.value) || 1)

// HTTPS 历史-质量域名
const httpsHdDomainData: HttpsDomainRow[] = [
  { domain: 'secure.tuna.tsinghu...', totalReq: 148560, failCount: 123450, avgLatency: '124.58' },
  { domain: 'api.tuna.tsinghua.ed...', totalReq: 2450, failCount: 2050, avgLatency: '118.92' },
  { domain: 'archive.ubuntu-ssl.com', totalReq: 1350, failCount: 1350, avgLatency: '-' },
  { domain: 'ssl.lib.tsinghua.edu.cn', totalReq: 16280, failCount: 578, avgLatency: '14.92' },
  { domain: 'bot.medi-ssl.tsinghu...', totalReq: 12850, failCount: 556, avgLatency: '85.43' },
  { domain: 'wzlx-ssl.tsinghua.ed...', totalReq: 15580, failCount: 435, avgLatency: '88.76' },
]
const httpsHdDomainPage = ref(1)
const httpsHdDomainPageSize = ref(100)
const httpsHdDomainGoto = ref(1)
const httpsHdDomainPages = computed(() => Math.ceil(httpsHdDomainData.length / httpsHdDomainPageSize.value) || 1)

// HTTPS 历史-弹窗
const httpsHdSrcPopupVisible = ref(false)
const httpsHdSrcPopupIp = ref('')
const httpsHdSrcPopupKeyword = ref('')
const httpsHdSrcPopupPage = ref(1)
const httpsHdSrcPopupPageSize = ref(100)
const httpsHdSrcPopupGoto = ref(1)
const httpsHdSrcPopupData = ref<PopupRow[]>([])
const httpsHdSrcPopupPages = computed(() => Math.ceil(httpsHdSrcPopupData.value.length / httpsHdSrcPopupPageSize.value) || 1)

const httpsHdDomainPopupVisible = ref(false)
const httpsHdDomainPopupDomain = ref('')
const httpsHdDomainPopupKeyword = ref('')
const httpsHdDomainPopupPage = ref(1)
const httpsHdDomainPopupPageSize = ref(100)
const httpsHdDomainPopupGoto = ref(1)
const httpsHdDomainPopupData = ref<PopupRow[]>([])
const httpsHdDomainPopupPages = computed(() => Math.ceil(httpsHdDomainPopupData.value.length / httpsHdDomainPopupPageSize.value) || 1)

function openHttpsHdSrcPopup(ip: string) {
  httpsHdSrcPopupIp.value = ip
  httpsHdSrcPopupKeyword.value = ''
  httpsHdSrcPopupPage.value = 1
  httpsHdSrcPopupData.value = [
    { domain: 'secure.tuna.tsinghua.edu.cn', totalReq: 148560, failCount: 123450, avgLatency: '124.58' },
    { domain: 'api.tuna.tsinghua.edu.cn', totalReq: 2450, failCount: 2050, avgLatency: '118.92' },
  ]
  httpsHdSrcPopupVisible.value = true
}

function openHttpsHdDomainPopup(domain: string) {
  httpsHdDomainPopupDomain.value = domain
  httpsHdDomainPopupKeyword.value = ''
  httpsHdDomainPopupPage.value = 1
  httpsHdDomainPopupData.value = [
    { ip: '202.112.58.10', totalReq: 85420, failCount: 5680, avgLatency: '108.45' },
    { ip: '202.112.58.11', totalReq: 85690, failCount: 4520, avgLatency: '107.82' },
  ]
  httpsHdDomainPopupVisible.value = true
}

function doHttpsHistorySearch() {
  // Mock: re-generate data
}

function resetHttpsHistoryFilters() {
  httpsHistoryDateRange.value = ['2026-07-16 10:15:58', '2026-07-16 10:30:58']
  httpsHistoryQualityLatency.value = 0
}
</script>

<style scoped>
.nv-border-card { display: flex; flex-direction: column; height: 100%; min-height: 0; border: 1px solid #e4e7ed; border-radius: 4px; background: #fff; overflow: hidden; }
.nv-tabs-header { flex-shrink: 0; padding: 0 16px; border-bottom: 1px solid #e4e7ed; background: #fafafa; }
.nv-tabs-nav { display: flex; gap: 0; }
.nv-tab { position: relative; padding: 12px 20px; border: none; background: transparent; font-size: 14px; font-weight: 600; color: #606266; cursor: pointer; white-space: nowrap; }
.nv-tab.active { color: #409eff; }
.nv-tab.active::after { content: ''; position: absolute; bottom: 0; left: 20px; right: 20px; height: 2px; background: #409eff; border-radius: 1px 1px 0 0; }
.nv-tabs-body { flex: 1; min-height: 0; overflow: hidden; }

.kp-protocol-content { display: none; height: 100%; flex-direction: column; overflow: auto; }
.kp-protocol-content.active { display: flex; }
.kp-subtabs { display: flex; gap: 0; padding: 0 16px; border-bottom: 1px solid #ebeef5; flex-shrink: 0; }
.kp-subtab { padding: 10px 18px; border: none; background: transparent; font-size: 13px; font-weight: 500; color: #606266; cursor: pointer; position: relative; }
.kp-subtab.active { color: #409eff; }
.kp-subtab.active::after { content: ''; position: absolute; bottom: 0; left: 18px; right: 18px; height: 2px; background: #409eff; border-radius: 1px 1px 0 0; }

.pq-rt-layout { display: grid; grid-template-columns: 2fr 1fr; gap: 12px; padding: 12px; align-content: start; flex: 1; overflow: auto; }
.pq-rt-left, .pq-rt-right { display: flex; flex-direction: column; gap: 12px; }
.pq-rt-card { border: 1px solid #ebeef5; border-radius: 4px; background: #fff; display: flex; flex-direction: column; }
.pq-rt-card-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-bottom: 1px solid #f0f2f5; flex-shrink: 0; }
.pq-rt-card-title { font-size: 13px; font-weight: 600; color: #303133; }
.pq-collapse-icon { color: #909399; cursor: pointer; font-size: 14px; }
.pq-rt-card-body { padding: 10px 14px; flex: 1; }
.pq-rt-pie-body { display: flex; align-items: center; justify-content: center; min-height: 200px; }
.pq-rt-table-body { padding: 0; overflow: auto; }

.pq-rt-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.pq-rt-table th { background: #fafbfc; border-bottom: 1px solid #ebeef5; padding: 6px 10px; text-align: left; font-weight: 600; color: #606266; white-space: nowrap; }
.pq-rt-table td { border-bottom: 1px solid #f0f2f5; padding: 6px 10px; color: #303133; }
.pq-num { text-align: right; }
.pq-ip-link { color: #409eff; cursor: pointer; text-decoration: none; }
.pq-ip-link:hover { text-decoration: underline; }
.sort-icon { font-size: 12px; color: #c0c4cc; vertical-align: middle; margin-left: 2px; }

.pq-rt-stats { display: flex; gap: 16px; padding: 8px 0 0; }
.pq-rt-stat { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; color: #606266; }
.pq-rt-stat-label { color: #909399; }
.pq-rt-stat-val { font-weight: 600; color: #303133; }

.pq-footer { display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; border-top: 1px solid #f0f2f5; }
.pq-pager { display: flex; align-items: center; gap: 4px; }
.pq-page-btn { height: 24px; min-width: 24px; padding: 0 6px; border: 1px solid #dcdfe6; border-radius: 3px; background: #fff; font-size: 12px; cursor: pointer; color: #606266; }
.pq-page-btn.active { background: #409eff; color: #fff; border-color: #409eff; }
.pq-page-goto { width: 36px; height: 24px; text-align: center; border: 1px solid #dcdfe6; border-radius: 3px; font-size: 12px; }
.pq-page-goto-btn { height: 24px; padding: 0 8px; border: 1px solid #dcdfe6; border-radius: 3px; background: #fff; font-size: 12px; cursor: pointer; }

/* 历史分析 toolbar */
.pq-history-wrapper { display: flex; flex-direction: column; height: 100%; overflow: auto; }
.pq-history-toolbar { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-bottom: 1px solid #ebeef5; flex-shrink: 0; flex-wrap: wrap; }
.pq-history-time { display: flex; align-items: center; gap: 6px; }
.pq-history-time-label { font-size: 13px; color: #606266; white-space: nowrap; }
.pq-history-latency { display: flex; align-items: center; gap: 6px; margin-left: 16px; }
.pq-history-latency-label { font-size: 13px; color: #606266; white-space: nowrap; }
.ou-search-btn { height: 30px; padding: 0 14px; border: 1px solid #409eff; border-radius: 4px; background: #409eff; color: #fff; font-size: 13px; font-weight: 500; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; }
.secondary.pq-reset-btn { height: 30px; padding: 0 14px; border: 1px solid #dcdfe6; border-radius: 4px; background: #fff; color: #606266; font-size: 13px; cursor: pointer; }

.ou-empty { text-align: center; color: #909399; padding: 24px 10px !important; }

/* Dialog overrides */
:deep(.pq-detail-dialog .el-dialog__body) { padding: 0; }
</style>
