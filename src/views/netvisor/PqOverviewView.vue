<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav" role="tablist" aria-label="质量概况">
        <button type="button" class="nv-tab" :class="{ active: activeTab === 'realtime' }" @click="activeTab = 'realtime'">实时分析</button>
        <button type="button" class="nv-tab" :class="{ active: activeTab === 'history' }" @click="activeTab = 'history'">历史分析</button>
      </div>
    </div>
    <div class="nv-tabs-body">

      <!-- ==================== 实时分析 ==================== -->
      <div class="pq-tab-content" :class="{ active: activeTab === 'realtime' }">
        <div class="pq-layout">
          <!-- 左侧：3个图表 -->
          <div class="pq-left">
            <div class="pq-card">
              <div class="pq-card-header">
                <span class="pq-card-title">时延趋势</span>
                <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
              </div>
              <div class="pq-card-body">
                <v-chart :option="rtLatencyTrendOption" autoresize style="width:100%;height:280px" />
                <div class="pq-stats">
                  <span class="pq-stat"><span class="pq-stat-label">最大值</span><span class="pq-stat-val">{{ rtLatencyMax }} ms</span></span>
                  <span class="pq-stat"><span class="pq-stat-label">最小值</span><span class="pq-stat-val">{{ rtLatencyMin }}</span></span>
                  <span class="pq-stat"><span class="pq-stat-label">平均值</span><span class="pq-stat-val">{{ rtLatencyAvg }}</span></span>
                </div>
              </div>
            </div>
            <div class="pq-card">
              <div class="pq-card-header">
                <span class="pq-card-title">平均时延趋势</span>
                <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
              </div>
              <div class="pq-card-body">
                <v-chart :option="rtAvgLatencyOption" autoresize style="width:100%;height:200px" />
                <div class="pq-stats">
                  <span class="pq-stat"><span class="pq-stat-label">最大值</span><span class="pq-stat-val">{{ rtAvgMax }} ms</span></span>
                  <span class="pq-stat"><span class="pq-stat-label">最小值</span><span class="pq-stat-val">{{ rtAvgMin }} ms</span></span>
                  <span class="pq-stat"><span class="pq-stat-label">平均值</span><span class="pq-stat-val">{{ rtAvgAvg }} ms</span></span>
                </div>
              </div>
            </div>
            <div class="pq-card">
              <div class="pq-card-header">
                <span class="pq-card-title">失败率趋势</span>
                <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
              </div>
              <div class="pq-card-body">
                <v-chart :option="rtFailRateOption" autoresize style="width:100%;height:200px" />
                <div class="pq-stats">
                  <span class="pq-stat"><span class="pq-stat-label">最大值</span><span class="pq-stat-val">{{ rtFailMax }}%</span></span>
                  <span class="pq-stat"><span class="pq-stat-label">最小值</span><span class="pq-stat-val">{{ rtFailMin }}%</span></span>
                  <span class="pq-stat"><span class="pq-stat-label">平均值</span><span class="pq-stat-val">{{ rtFailAvg }}%</span></span>
                </div>
              </div>
            </div>
          </div>
          <!-- 右侧：饼图 + 2个表格 -->
          <div class="pq-right">
            <div class="pq-card">
              <div class="pq-card-header">
                <span class="pq-card-title">时延分布</span>
                <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
              </div>
              <div class="pq-card-body pq-pie-body">
                <v-chart :option="rtPieOption" autoresize style="width:100%;height:220px" />
              </div>
            </div>
            <div class="pq-card">
              <div class="pq-card-header">
                <span class="pq-card-title">质量源</span>
                <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
              </div>
              <div class="pq-card-body pq-table-body">
                <table class="pq-table">
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
                    <tr v-for="(row, idx) in rtSrcPageData" :key="idx">
                      <td>{{ (rtSrcPage - 1) * rtSrcPageSize + idx + 1 }}</td>
                      <td><span class="pq-ip-link" @click="openSrcPopup(row.ip)">{{ row.ip }}</span></td>
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
                    <button v-for="p in rtSrcPages" :key="p" class="pq-page-btn" :class="{ active: p === rtSrcPage }" @click="rtSrcPage = p">{{ p }}</button>
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
            <div class="pq-card">
              <div class="pq-card-header">
                <span class="pq-card-title">质量目标</span>
                <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
              </div>
              <div class="pq-card-body pq-table-body">
                <table class="pq-table">
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
                    <tr v-for="(row, idx) in rtDstPageData" :key="idx">
                      <td>{{ (rtDstPage - 1) * rtDstPageSize + idx + 1 }}</td>
                      <td><span class="pq-ip-link" @click="openDstPopup(row.ip)">{{ row.ip }}</span></td>
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
                    <button v-for="p in rtDstPages" :key="p" class="pq-page-btn" :class="{ active: p === rtDstPage }" @click="rtDstPage = p">{{ p }}</button>
                    <button class="pq-page-btn" @click="rtDstPage < rtDstPages && rtDstPage++">›</button>
                  </div>
                  <span style="font-size:12px;color:#909399">共 {{ rtDstData.length }} 条</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ==================== 历史分析 ==================== -->
      <div class="pq-tab-content" :class="{ active: activeTab === 'history' }">
        <div class="pq-history-toolbar">
          <div class="pq-history-time">
            <span class="pq-history-time-label">时间范围</span>
            <el-date-picker v-model="historyDateRange" type="datetimerange" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" style="width:360px" size="default" />
          </div>
          <div class="pq-history-latency">
            <span class="pq-history-latency-label">质量时延=</span>
            <el-input-number v-model="historyQualityLatency" :min="0" :step="1" controls-position="right" style="width:100px" size="default" />
          </div>
          <button class="ou-search-btn" @click="doHistorySearch">
            <el-icon><Search /></el-icon>
          </button>
          <button class="secondary pq-reset-btn" @click="resetHistoryFilters">重置</button>
        </div>
        <div class="pq-layout">
          <div class="pq-left">
            <div class="pq-card">
              <div class="pq-card-header">
                <span class="pq-card-title">时延趋势</span>
                <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
              </div>
              <div class="pq-card-body">
                <v-chart :option="hdLatencyTrendOption" autoresize style="width:100%;height:280px" />
                <div class="pq-stats">
                  <span class="pq-stat"><span class="pq-stat-label">最大值</span><span class="pq-stat-val">{{ hdLatencyMax }}</span></span>
                  <span class="pq-stat"><span class="pq-stat-label">最小值</span><span class="pq-stat-val">{{ hdLatencyMin }}</span></span>
                  <span class="pq-stat"><span class="pq-stat-label">平均值</span><span class="pq-stat-val">{{ hdLatencyAvg }}</span></span>
                </div>
              </div>
            </div>
            <div class="pq-card">
              <div class="pq-card-header">
                <span class="pq-card-title">平均时延趋势</span>
                <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
              </div>
              <div class="pq-card-body">
                <v-chart :option="hdAvgLatencyOption" autoresize style="width:100%;height:200px" />
                <div class="pq-stats">
                  <span class="pq-stat"><span class="pq-stat-label">最大值</span><span class="pq-stat-val">{{ hdAvgMax }} ms</span></span>
                  <span class="pq-stat"><span class="pq-stat-label">最小值</span><span class="pq-stat-val">{{ hdAvgMin }} ms</span></span>
                  <span class="pq-stat"><span class="pq-stat-label">平均值</span><span class="pq-stat-val">{{ hdAvgAvg }} ms</span></span>
                </div>
              </div>
            </div>
            <div class="pq-card">
              <div class="pq-card-header">
                <span class="pq-card-title">失败率趋势</span>
                <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
              </div>
              <div class="pq-card-body">
                <v-chart :option="hdFailRateOption" autoresize style="width:100%;height:200px" />
                <div class="pq-stats">
                  <span class="pq-stat"><span class="pq-stat-label">最大值</span><span class="pq-stat-val">{{ hdFailMax }}%</span></span>
                  <span class="pq-stat"><span class="pq-stat-label">最小值</span><span class="pq-stat-val">{{ hdFailMin }}%</span></span>
                  <span class="pq-stat"><span class="pq-stat-label">平均值</span><span class="pq-stat-val">{{ hdFailAvg }}%</span></span>
                </div>
              </div>
            </div>
          </div>
          <div class="pq-right">
            <div class="pq-card">
              <div class="pq-card-header">
                <span class="pq-card-title">时延分布</span>
                <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
              </div>
              <div class="pq-card-body pq-pie-body">
                <v-chart :option="hdPieOption" autoresize style="width:100%;height:220px" />
              </div>
            </div>
            <div class="pq-card">
              <div class="pq-card-header">
                <span class="pq-card-title">质量源</span>
                <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
              </div>
              <div class="pq-card-body pq-table-body">
                <table class="pq-table">
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
                    <tr v-for="(row, idx) in hdSrcPageData" :key="idx">
                      <td>{{ (hdSrcPage - 1) * hdSrcPageSize + idx + 1 }}</td>
                      <td><span class="pq-ip-link" @click="openHistorySrcPopup(row.ip)">{{ row.ip }}</span></td>
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
                    <button v-for="p in hdSrcPages" :key="p" class="pq-page-btn" :class="{ active: p === hdSrcPage }" @click="hdSrcPage = p">{{ p }}</button>
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
            <div class="pq-card">
              <div class="pq-card-header">
                <span class="pq-card-title">质量目标</span>
                <el-icon class="pq-collapse-icon"><MoreFilled /></el-icon>
              </div>
              <div class="pq-card-body pq-table-body">
                <table class="pq-table">
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
                    <tr v-for="(row, idx) in hdDstPageData" :key="idx">
                      <td>{{ (hdDstPage - 1) * hdDstPageSize + idx + 1 }}</td>
                      <td><span class="pq-ip-link" @click="openHistoryDstPopup(row.ip)">{{ row.ip }}</span></td>
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
                    <button v-for="p in hdDstPages" :key="p" class="pq-page-btn" :class="{ active: p === hdDstPage }" @click="hdDstPage = p">{{ p }}</button>
                    <button class="pq-page-btn" @click="hdDstPage < hdDstPages && hdDstPage++">›</button>
                  </div>
                  <span style="font-size:12px;color:#909399">共 {{ hdDstData.length }} 条</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 实时-质量源详情弹窗 ==================== -->
    <el-dialog v-model="srcPopupVisible" :title="'访问对象 -> ' + srcPopupIp" width="70%" destroy-on-close class="pq-detail-dialog">
      <div style="padding:12px">
        <div style="display:flex;gap:12px;margin-bottom:12px;align-items:center">
          <input class="pq-search-input" v-model="srcPopupKeyword" placeholder="关键字搜索" />
          <button class="ou-search-btn" @click="doSrcPopupSearch">
            <el-icon><Search /></el-icon>
          </button>
        </div>
        <table class="pq-table">
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
            <tr v-for="(row, idx) in srcPopupPageData" :key="idx">
              <td>{{ (srcPopupPage - 1) * srcPopupPageSize + idx + 1 }}</td>
              <td><span class="pq-ip-link">{{ row.domain }}</span></td>
              <td class="pq-num">{{ row.totalReq }}</td>
              <td class="pq-num">{{ row.failCount }}</td>
              <td class="pq-num">{{ row.avgLatency }}</td>
            </tr>
            <tr v-if="srcPopupData.length === 0">
              <td colspan="5" class="ou-empty">无数据</td>
            </tr>
          </tbody>
        </table>
        <div class="pq-footer" style="margin-top:12px">
          <div class="pq-pager">
            <button class="pq-page-btn" @click="srcPopupPage > 1 && srcPopupPage--">‹</button>
            <button v-for="p in srcPopupPages" :key="p" class="pq-page-btn" :class="{ active: p === srcPopupPage }" @click="srcPopupPage = p">{{ p }}</button>
            <button class="pq-page-btn" @click="srcPopupPage < srcPopupPages && srcPopupPage++">›</button>
            <span style="margin-left:8px;font-size:12px;color:#909399">到第</span>
            <input class="pq-page-goto" v-model.number="srcPopupGoto" />
            <span style="font-size:12px;color:#909399">页</span>
            <button class="pq-page-goto-btn" @click="srcPopupPage = srcPopupGoto; srcPopupGoto = srcPopupPage">确定</button>
          </div>
          <div style="display:flex;gap:12px;align-items:center">
            <span style="font-size:12px;color:#909399">共 {{ srcPopupData.length }} 条</span>
            <select v-model="srcPopupPageSize" style="height:24px;border:1px solid #dcdfe6;border-radius:3px;font-size:12px;padding:0 4px">
              <option :value="100">100 条/页</option>
            </select>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- ==================== 实时-质量目标详情弹窗 ==================== -->
    <el-dialog v-model="dstPopupVisible" :title="'访问对象 -> ' + dstPopupIp" width="70%" destroy-on-close class="pq-detail-dialog">
      <div style="padding:12px">
        <div style="display:flex;gap:12px;margin-bottom:12px;align-items:center">
          <input class="pq-search-input" v-model="dstPopupKeyword" placeholder="关键字搜索" />
          <button class="ou-search-btn" @click="doDstPopupSearch">
            <el-icon><Search /></el-icon>
          </button>
        </div>
        <table class="pq-table">
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
            <tr v-for="(row, idx) in dstPopupPageData" :key="idx">
              <td>{{ (dstPopupPage - 1) * dstPopupPageSize + idx + 1 }}</td>
              <td><span class="pq-ip-link">{{ row.domain }}</span></td>
              <td class="pq-num">{{ row.totalReq }}</td>
              <td class="pq-num">{{ row.failCount }}</td>
              <td class="pq-num">{{ row.avgLatency }}</td>
            </tr>
            <tr v-if="dstPopupData.length === 0">
              <td colspan="5" class="ou-empty">无数据</td>
            </tr>
          </tbody>
        </table>
        <div class="pq-footer" style="margin-top:12px">
          <div class="pq-pager">
            <button class="pq-page-btn" @click="dstPopupPage > 1 && dstPopupPage--">‹</button>
            <button v-for="p in dstPopupPages" :key="p" class="pq-page-btn" :class="{ active: p === dstPopupPage }" @click="dstPopupPage = p">{{ p }}</button>
            <button class="pq-page-btn" @click="dstPopupPage < dstPopupPages && dstPopupPage++">›</button>
            <span style="margin-left:8px;font-size:12px;color:#909399">到第</span>
            <input class="pq-page-goto" v-model.number="dstPopupGoto" />
            <span style="font-size:12px;color:#909399">页</span>
            <button class="pq-page-goto-btn" @click="dstPopupPage = dstPopupGoto; dstPopupGoto = dstPopupPage">确定</button>
          </div>
          <div style="display:flex;gap:12px;align-items:center">
            <span style="font-size:12px;color:#909399">共 {{ dstPopupData.length }} 条</span>
            <select v-model="dstPopupPageSize" style="height:24px;border:1px solid #dcdfe6;border-radius:3px;font-size:12px;padding:0 4px">
              <option :value="100">100 条/页</option>
            </select>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- ==================== 历史-质量源详情弹窗 ==================== -->
    <el-dialog v-model="hdSrcPopupVisible" :title="'访问对象 -> ' + hdSrcPopupIp" width="70%" destroy-on-close class="pq-detail-dialog">
      <div style="padding:12px">
        <div style="display:flex;gap:12px;margin-bottom:12px;align-items:center">
          <span style="font-size:13px;color:#606266">时间范围</span>
          <input class="pq-search-input" v-model="hdSrcPopupTimeRange" style="width:320px" />
          <button class="ou-search-btn" @click="doHdSrcPopupSearch">
            <el-icon><Search /></el-icon>
          </button>
        </div>
        <table class="pq-table">
          <thead>
            <tr>
              <th style="width:40px">序号</th>
              <th>请求目标</th>
              <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>失败次数 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>平均时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in hdSrcPopupPageData" :key="idx">
              <td>{{ (hdSrcPopupPage - 1) * hdSrcPopupPageSize + idx + 1 }}</td>
              <td><span class="pq-ip-link">{{ row.target }}</span></td>
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
            <select v-model="hdSrcPopupPageSize" style="height:24px;border:1px solid #dcdfe6;border-radius:3px;font-size:12px;padding:0 4px">
              <option :value="100">100 条/页</option>
            </select>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- ==================== 历史-质量目标详情弹窗 ==================== -->
    <el-dialog v-model="hdDstPopupVisible" :title="'访问对象 -> ' + hdDstPopupIp" width="70%" destroy-on-close class="pq-detail-dialog">
      <div style="padding:12px">
        <div style="display:flex;gap:12px;margin-bottom:12px;align-items:center">
          <span style="font-size:13px;color:#606266">时间范围</span>
          <input class="pq-search-input" v-model="hdDstPopupTimeRange" style="width:320px" />
          <button class="ou-search-btn" @click="doHdDstPopupSearch">
            <el-icon><Search /></el-icon>
          </button>
        </div>
        <table class="pq-table">
          <thead>
            <tr>
              <th style="width:40px">序号</th>
              <th>请求目标</th>
              <th>总请求数 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>失败次数 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>平均时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in hdDstPopupPageData" :key="idx">
              <td>{{ (hdDstPopupPage - 1) * hdDstPopupPageSize + idx + 1 }}</td>
              <td><span class="pq-ip-link">{{ row.target }}</span></td>
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
            <select v-model="hdDstPopupPageSize" style="height:24px;border:1px solid #dcdfe6;border-radius:3px;font-size:12px;padding:0 4px">
              <option :value="100">100 条/页</option>
            </select>
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
import { LineChart, BarChart, PieChart } from 'echarts/charts'
import {
  TitleComponent, TooltipComponent, LegendComponent, GridComponent
} from 'echarts/components'
import { Search, Sort, MoreFilled } from '@element-plus/icons-vue'

use([CanvasRenderer, LineChart, BarChart, PieChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent])

// ── Tabs ──
const activeTab = ref('realtime')

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

// ── 实时分析 X轴 ──
const rtXLabels = ['12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '15.Jun', '02:00', '04:00', '06:00', '08:00', '10:00']

// ── 实时分析 Mock数据 ──
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
  yAxis: { type: 'value', axisLabel: { formatter: (v: number) => v >= 1000 ? (v / 1000).toFixed(1) + 'K' : v } },
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
  { ip: '2001:250:ff08:fc:2458...', totalReq: 5191, failCount: 5191, avgLatency: '-' },
  { ip: '36.152.132.180', totalReq: 5191, failCount: 5191, avgLatency: '-' },
  { ip: '160.116.76.33', totalReq: 4375, failCount: 4375, avgLatency: '-' },
  { ip: '101.6.6.90', totalReq: 2603, failCount: 2603, avgLatency: '-' },
]
const rtSrcPage = ref(1)
const rtSrcPageSize = ref(100)
const rtSrcGoto = ref(1)
const rtSrcPageData = computed(() => rtSrcData)
const rtSrcPages = computed(() => Math.ceil(rtSrcData.length / rtSrcPageSize.value) || 1)

// ── 实时-质量目标表格 ──
const rtDstData: IpRow[] = [
  { ip: '101.6.15.130', totalReq: 202347, failCount: 198014, avgLatency: '633.93' },
  { ip: '2402:800:1:400:6506...', totalReq: 179157, failCount: 179157, avgLatency: '-' },
  { ip: '2402:800:1:400:2...', totalReq: 157280, failCount: 154576, avgLatency: '516.69' },
  { ip: '166.111.96.91', totalReq: 1440, failCount: 1440, avgLatency: '-' },
  { ip: '100.115.82.151', totalReq: 1095, failCount: 1095, avgLatency: '-' },
  { ip: '100.115.82.241', totalReq: 1000, failCount: 1000, avgLatency: '-' },
]
const rtDstPage = ref(1)
const rtDstPageSize = ref(100)
const rtDstPageData = computed(() => rtDstData)
const rtDstPages = computed(() => Math.ceil(rtDstData.length / rtDstPageSize.value) || 1)

// ── 历史分析 ──
const historyTimeRange = ref('2026-07-16 08:38:46 - 2026-07-16 08:53:46')
const historyQualityLatency = ref(0)

const hdXLabels = Array.from({ length: 14 }, (_, i) => {
  const min = 38 + i
  const h = min >= 60 ? 9 : 8
  const m = min >= 60 ? min - 60 : min
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
})

function genHdStackData() {
  const totals = [285, 310, 347, 298, 265, 278, 320, 75, 168, 240, 305, 252, 290, 268]
  const pcts = [0.3558, 0.0482, 0.0316, 0.0228, 0.0164, 0.0118, 0.0142, 0.0086, 0.0052, 0.0055, 0.4799]
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

const hdLatencyTrendOption = ref({
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
  yAxis: { type: 'value', axisLabel: { formatter: (v: number) => v >= 1000 ? (v / 1000).toFixed(1) + 'K' : v } },
  series: genHdStackData(),
})

const hdLatencyMax = ref('978462')
const hdLatencyMin = ref('395166')
const hdLatencyAvg = ref('965074')

const hdAvgData = [42, 58, 36, 72, 48, 64, 88, 28, 32, 52, 44, 38, 46, 31]
const hdAvgLatencyOption = ref({
  tooltip: { trigger: 'axis' },
  grid: { left: 40, right: 20, top: 10, bottom: 30 },
  xAxis: { type: 'category', data: hdXLabels, axisLabel: { rotate: 30, fontSize: 9 } },
  yAxis: { type: 'value' },
  series: [{ type: 'line', smooth: true, data: hdAvgData, itemStyle: { color: '#5470c6' }, symbol: 'none' }],
})
const hdAvgMax = ref('91.63')
const hdAvgMin = ref('28.99')
const hdAvgAvg = ref('30')

const hdFailData = [59, 48, 46, 44, 45, 46, 44, 45, 46, 47, 45, 44, 46, 45]
const hdFailRateOption = ref({
  tooltip: { trigger: 'axis' },
  grid: { left: 40, right: 20, top: 10, bottom: 30 },
  xAxis: { type: 'category', data: hdXLabels, axisLabel: { rotate: 30, fontSize: 9 } },
  yAxis: { type: 'value', axisLabel: { formatter: '{value}%' } },
  series: [{ type: 'line', smooth: true, data: hdFailData, itemStyle: { color: '#5470c6' }, symbol: 'none' }],
})
const hdFailMax = ref('62.16')
const hdFailMin = ref('44.16')
const hdFailAvg = ref('59')

const hdPieData = [
  { value: 35.58, name: '(0,5]' }, { value: 4.82, name: '(5,10]' },
  { value: 3.16, name: '(10,20]' }, { value: 2.28, name: '(20,40]' },
  { value: 1.64, name: '(40,80]' }, { value: 1.18, name: '(80,120]' },
  { value: 1.42, name: '(120,200]' }, { value: 0.86, name: '(200,500]' },
  { value: 0.52, name: '(500,1000]' }, { value: 0.55, name: '>=1000ms' },
  { value: 47.99, name: '无应答' },
]
const hdPieOption = ref({
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
    data: hdPieData.map(d => ({ ...d, itemStyle: { color: BUCKETS.find(b => b.name === d.name)?.color } })),
  }],
})

// ── 历史-质量源表格 ──
const hdSrcData: IpRow[] = [
  { ip: '113.120.243.171', totalReq: 77714, failCount: 77714, avgLatency: '-' },
  { ip: '101.6.14.166', totalReq: 25151, failCount: 23485, avgLatency: '711.86' },
  { ip: '36.152.132.180', totalReq: 22871, failCount: 22871, avgLatency: '-' },
  { ip: '160.116.76.33', totalReq: 20004, failCount: 20004, avgLatency: '-' },
  { ip: '101.6.6.90', totalReq: 12439, failCount: 12439, avgLatency: '-' },
  { ip: '103.63.161.65', totalReq: 8859, failCount: 8842, avgLatency: '-' },
]
const hdSrcPage = ref(1)
const hdSrcPageSize = ref(100)
const hdSrcGoto = ref(1)
const hdSrcPageData = computed(() => hdSrcData)
const hdSrcPages = computed(() => Math.ceil(hdSrcData.length / hdSrcPageSize.value) || 1)

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
const hdDstPageSize = ref(100)
const hdDstPageData = computed(() => hdDstData)
const hdDstPages = computed(() => Math.ceil(hdDstData.length / hdDstPageSize.value) || 1)

// ── 弹窗 ──
const srcPopupVisible = ref(false)
const srcPopupIp = ref('')
const srcPopupKeyword = ref('')
const srcPopupPage = ref(1)
const srcPopupPageSize = ref(100)
const srcPopupGoto = ref(1)

interface PopupRow { domain: string; totalReq: number; failCount: number; avgLatency: string }
const srcPopupData = ref<PopupRow[]>([])
const srcPopupPageData = computed(() => srcPopupData.value)
const srcPopupPages = computed(() => Math.ceil(srcPopupData.value.length / srcPopupPageSize.value) || 1)

const dstPopupVisible = ref(false)
const dstPopupIp = ref('')
const dstPopupKeyword = ref('')
const dstPopupPage = ref(1)
const dstPopupPageSize = ref(100)
const dstPopupGoto = ref(1)
const dstPopupData = ref<PopupRow[]>([])
const dstPopupPageData = computed(() => dstPopupData.value)
const dstPopupPages = computed(() => Math.ceil(dstPopupData.value.length / dstPopupPageSize.value) || 1)

const hdSrcPopupVisible = ref(false)
const hdSrcPopupIp = ref('')
const hdSrcPopupTimeRange = ref('2026-07-16 08:38:46 - 2026-07-16 08:53:46')
const hdSrcPopupPage = ref(1)
const hdSrcPopupPageSize = ref(100)
const hdSrcPopupGoto = ref(1)

interface HdPopupRow { target: string; totalReq: number; failCount: number; avgLatency: string }
const hdSrcPopupData = ref<HdPopupRow[]>([])
const hdSrcPopupPageData = computed(() => hdSrcPopupData.value)
const hdSrcPopupPages = computed(() => Math.ceil(hdSrcPopupData.value.length / hdSrcPopupPageSize.value) || 1)

const hdDstPopupVisible = ref(false)
const hdDstPopupIp = ref('')
const hdDstPopupTimeRange = ref('2026-07-16 08:38:46 - 2026-07-16 08:53:46')
const hdDstPopupPage = ref(1)
const hdDstPopupPageSize = ref(100)
const hdDstPopupGoto = ref(1)
const hdDstPopupData = ref<HdPopupRow[]>([])
const hdDstPopupPageData = computed(() => hdDstPopupData.value)
const hdDstPopupPages = computed(() => Math.ceil(hdDstPopupData.value.length / hdDstPopupPageSize.value) || 1)

function openSrcPopup(ip: string) {
  srcPopupIp.value = ip
  srcPopupKeyword.value = ''
  srcPopupPage.value = 1
  srcPopupData.value = [
    { domain: '101.6.15.130', totalReq: 15853, failCount: 15853, avgLatency: '-' },
  ]
  srcPopupVisible.value = true
}

function openDstPopup(ip: string) {
  dstPopupIp.value = ip
  dstPopupKeyword.value = ''
  dstPopupPage.value = 1
  dstPopupData.value = [
    { domain: '101.6.15.130', totalReq: 202347, failCount: 198014, avgLatency: '633.93' },
  ]
  dstPopupVisible.value = true
}

function openHistorySrcPopup(ip: string) {
  hdSrcPopupIp.value = ip
  hdSrcPopupTimeRange.value = historyTimeRange.value
  hdSrcPopupPage.value = 1
  hdSrcPopupData.value = [
    { target: '101.6.15.130', totalReq: 77714, failCount: 77714, avgLatency: '-' },
  ]
  hdSrcPopupVisible.value = true
}

function openHistoryDstPopup(ip: string) {
  hdDstPopupIp.value = ip
  hdDstPopupTimeRange.value = historyTimeRange.value
  hdDstPopupPage.value = 1
  hdDstPopupData.value = [
    { target: '101.6.15.130', totalReq: 1069171, failCount: 890753, avgLatency: '74.87' },
  ]
  hdDstPopupVisible.value = true
}

function doSrcPopupSearch() { srcPopupPage.value = 1 }
function doDstPopupSearch() { dstPopupPage.value = 1 }
function doHdSrcPopupSearch() { hdSrcPopupPage.value = 1 }
function doHdDstPopupSearch() { hdDstPopupPage.value = 1 }

function doHistorySearch() {}
function resetHistoryFilters() {
  historyTimeRange.value = '2026-07-16 08:38:46 - 2026-07-16 08:53:46'
  historyQualityLatency.value = 0
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

.pq-tab-content { display: none; height: 100%; overflow: auto; }
.pq-tab-content.active { display: block; }

.pq-layout { display: grid; grid-template-columns: 2fr 1fr; gap: 12px; padding: 12px; height: 100%; align-content: start; }
.pq-left, .pq-right { display: flex; flex-direction: column; gap: 12px; }
.pq-card { border: 1px solid #ebeef5; border-radius: 4px; background: #fff; display: flex; flex-direction: column; }
.pq-card-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-bottom: 1px solid #f0f2f5; }
.pq-card-title { font-size: 13px; font-weight: 600; color: #303133; }
.pq-collapse-icon { color: #909399; cursor: pointer; font-size: 14px; }
.pq-card-body { padding: 10px 14px; flex: 1; }
.pq-pie-body { display: flex; align-items: center; justify-content: center; min-height: 220px; }
.pq-table-body { padding: 0; overflow: auto; }

.pq-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.pq-table th { background: #fafbfc; border-bottom: 1px solid #ebeef5; padding: 6px 10px; text-align: left; font-weight: 600; color: #606266; white-space: nowrap; }
.pq-table td { border-bottom: 1px solid #f0f2f5; padding: 6px 10px; color: #303133; }
.pq-num { text-align: right; }
.pq-ip-link { color: #409eff; cursor: pointer; text-decoration: none; }
.pq-ip-link:hover { text-decoration: underline; }
.sort-icon { font-size: 12px; color: #c0c4cc; vertical-align: middle; margin-left: 2px; }

.pq-stats { display: flex; gap: 16px; padding: 8px 0 0; }
.pq-stat { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; color: #606266; }
.pq-stat-label { color: #909399; }
.pq-stat-val { font-weight: 600; color: #303133; }

.pq-footer { display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; border-top: 1px solid #f0f2f5; }
.pq-pager { display: flex; align-items: center; gap: 4px; }
.pq-page-btn { height: 24px; min-width: 24px; padding: 0 6px; border: 1px solid #dcdfe6; border-radius: 3px; background: #fff; font-size: 12px; cursor: pointer; color: #606266; }
.pq-page-btn.active { background: #409eff; color: #fff; border-color: #409eff; }
.pq-page-goto { width: 36px; height: 24px; text-align: center; border: 1px solid #dcdfe6; border-radius: 3px; font-size: 12px; }
.pq-page-goto-btn { height: 24px; padding: 0 8px; border: 1px solid #dcdfe6; border-radius: 3px; background: #fff; font-size: 12px; cursor: pointer; }

.pq-history-toolbar { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-bottom: 1px solid #ebeef5; flex-wrap: wrap; }
.pq-history-time { display: flex; align-items: center; gap: 6px; }
.pq-history-time-label { font-size: 13px; color: #606266; }
.pq-history-time-input { height: 28px; padding: 0 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 13px; width: 300px; }
.pq-history-latency { display: flex; align-items: center; gap: 6px; margin-left: 16px; }
.pq-history-latency-label { font-size: 13px; color: #606266; }
.pq-history-latency-input { height: 28px; padding: 0 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 13px; text-align: center; }
.ou-search-btn { height: 30px; padding: 0 14px; border: 1px solid #409eff; border-radius: 4px; background: #409eff; color: #fff; font-size: 13px; font-weight: 500; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; }
.secondary.pq-reset-btn { height: 30px; padding: 0 14px; border: 1px solid #dcdfe6; border-radius: 4px; background: #fff; color: #606266; font-size: 13px; cursor: pointer; }

.pq-search-input { height: 30px; padding: 0 10px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 13px; width: 200px; }

.ou-empty { text-align: center; color: #909399; padding: 24px 10px !important; }
</style>
