<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav nv-tabs-nav-wrap" role="tablist" aria-label="用户认证">
        <button v-for="t in tabs" :key="t.key" type="button" class="nv-tab" :class="{ active: activeTab === t.key }" @click="activeTab = t.key">{{ t.label }}</button>
      </div>
    </div>
    <div class="nv-tabs-body">

      <!-- ==================== 实时概况 Tab ==================== -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'overview' }">
        <!-- KPI 卡片 -->
        <div class="ua-kpi-row">
          <div class="ua-kpi-card">
            <div class="ua-kpi-value">{{ kpiData.totalCount }}</div>
            <div class="ua-kpi-label">累计总数</div>
          </div>
          <div class="ua-kpi-card">
            <div class="ua-kpi-value">{{ kpiData.totalLogin }}</div>
            <div class="ua-kpi-label">累计总登录数</div>
          </div>
          <div class="ua-kpi-card">
            <div class="ua-kpi-value">{{ kpiData.totalLogout }}</div>
            <div class="ua-kpi-label">累计总登出数</div>
          </div>
          <div class="ua-kpi-card">
            <div class="ua-kpi-value">{{ kpiData.recentLogin }}</div>
            <div class="ua-kpi-label">最近登录数</div>
          </div>
          <div class="ua-kpi-card">
            <div class="ua-kpi-value">{{ kpiData.recentLogout }}</div>
            <div class="ua-kpi-label">最近登出数</div>
          </div>
        </div>

        <!-- 登录次数趋势图 -->
        <div class="ua-chart-panel">
          <div class="ua-chart-header">
            <div style="font-size:13px;font-weight:600;color:#303133">
              <el-icon style="margin-right:4px"><DataAnalysis /></el-icon> 登录次数趋势图
            </div>
            <div class="ua-range-btns">
              <button class="ua-range-btn" :class="{ active: loginTimeRange === '3days' }" @click="loginTimeRange = '3days'">最近三天</button>
              <button class="ua-range-btn" :class="{ active: loginTimeRange === '1month' }" @click="loginTimeRange = '1month'">最近一月</button>
            </div>
          </div>
          <v-chart :option="loginChartOption" autoresize style="width:100%;height:300px" />
          <div class="ua-chart-legend">
            <span class="ua-legend-item"><span class="ua-legend-color" style="background:#5b8ff9"></span> 登录数 0</span>
            <span class="ua-legend-item"><span class="ua-legend-color" style="background:#5ad8a6"></span> 登出数 0</span>
            <span class="ua-legend-item"><span class="ua-legend-color" style="background:#f6bd16"></span> 失败数 0</span>
          </div>
        </div>

        <!-- 登出次数趋势图 -->
        <div class="ua-chart-panel">
          <div class="ua-chart-header">
            <div style="font-size:13px;font-weight:600;color:#303133">
              <el-icon style="margin-right:4px"><DataAnalysis /></el-icon> 登出次数趋势图
            </div>
            <div class="ua-range-btns">
              <button class="ua-range-btn" :class="{ active: logoutTimeRange === '3days' }" @click="logoutTimeRange = '3days'">最近三天</button>
              <button class="ua-range-btn" :class="{ active: logoutTimeRange === '1month' }" @click="logoutTimeRange = '1month'">最近一月</button>
            </div>
          </div>
          <v-chart :option="logoutChartOption" autoresize style="width:100%;height:300px" />
          <div class="ua-chart-legend">
            <span class="ua-legend-item"><span class="ua-legend-color" style="background:#5b8ff9"></span> 登录数 0</span>
            <span class="ua-legend-item"><span class="ua-legend-color" style="background:#5ad8a6"></span> 登出数 0</span>
            <span class="ua-legend-item"><span class="ua-legend-color" style="background:#f6bd16"></span> 失败数 0</span>
          </div>
        </div>
      </div>

      <!-- ==================== 认证日志 Tab ==================== -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'logs' }">
        <!-- 筛选区域 -->
        <div class="tdh-filters">
          <div class="tdh-filter-row">
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">账号</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="logFilter.account" placeholder="" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">MAC</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="logFilter.mac" placeholder="" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">日志类型</span>
              <select class="ou-toolbar-select" v-model="logFilter.logType">
                <option value="">任意</option>
              </select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">用户IP</span>
              <input class="ou-toolbar-input tdh-filter-input" v-model="logFilter.userIp" placeholder="" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">链路</span>
              <select class="ou-toolbar-select" v-model="logFilter.link">
                <option value="">任意</option>
              </select>
            </label>
          </div>
          <div class="tdh-filter-row">
            <label class="tdh-filter-field tdh-filter-time">
              <span class="ou-toolbar-label">时间范围</span>
              <input class="ou-toolbar-input tdh-time-range" v-model="logFilter.timeRange" />
            </label>
            <button class="ou-search-btn" @click="doLogSearch">
              <el-icon><Search /></el-icon>
            </button>
            <button class="secondary td-reset-btn" @click="resetLogFilters">重置</button>
            <div class="tdh-filter-right">
              <button style="border:none;background:none;cursor:pointer;color:#409eff;font-size:13px" @click="doLogExport">
                <el-icon><Download /></el-icon> 导出
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
                <th>用户地址 <el-icon class="sort-icon"><Sort /></el-icon></th>
                <th>MAC</th>
                <th>MAC厂商</th>
                <th>用户名称</th>
                <th>日志类型</th>
                <th>链路</th>
                <th>操作时间 <el-icon class="sort-icon"><Sort /></el-icon></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in logPageData" :key="idx">
                <td>{{ (logPage - 1) * logPageSize + idx + 1 }}</td>
                <td style="font-size:12px">{{ row.userAddr }}</td>
                <td style="font-size:12px">{{ row.mac }}</td>
                <td style="font-size:12px">{{ row.macVendor }}</td>
                <td>{{ row.userName }}</td>
                <td style="font-size:12px">{{ row.logType }}</td>
                <td style="font-size:12px">{{ row.link }}</td>
                <td style="white-space:nowrap">{{ row.opTime }}</td>
              </tr>
              <tr v-if="logData.length === 0">
                <td colspan="8" class="ou-empty">无数据</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="ou-footer">
          <div class="ou-footer-left">
            <div class="ou-pager">
              <button class="ou-page-btn" @click="logPage > 1 && logPage--">‹</button>
              <button v-for="p in logPages" :key="p" class="ou-page-btn" :class="{ active: p === logPage }" @click="logPage = p">{{ p }}</button>
              <button class="ou-page-btn" @click="logPage < logPages && logPage++">›</button>
              <span style="margin-left:8px;font-size:12px;color:#909399">到第</span>
              <input class="ou-page-goto-input" v-model.number="logGotoPage" style="width:36px;height:24px;text-align:center;border:1px solid #dcdfe6;border-radius:3px;font-size:12px" />
              <span style="font-size:12px;color:#909399">页</span>
              <button class="ou-page-goto-btn" @click="goToLogPage" style="height:24px;padding:0 8px;border:1px solid #dcdfe6;border-radius:3px;background:#fff;font-size:12px;cursor:pointer">确定</button>
            </div>
          </div>
          <div class="ou-footer-right">
            <span>共 {{ logData.length }} 条</span>
            <label class="ou-page-size">
              <select v-model="logPageSize" style="height:24px;border:1px solid #dcdfe6;border-radius:3px;font-size:12px;padding:0 4px">
                <option :value="100">100 条/页</option>
              </select>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 日志详情弹窗 ==================== -->
    <el-dialog v-model="logDetailVisible" title="日志详情" width="60%" destroy-on-close class="hd-detail-dialog">
      <div style="padding:12px">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户地址">{{ logDetail.userAddr }}</el-descriptions-item>
          <el-descriptions-item label="MAC">{{ logDetail.mac }}</el-descriptions-item>
          <el-descriptions-item label="MAC厂商">{{ logDetail.macVendor }}</el-descriptions-item>
          <el-descriptions-item label="用户名称">{{ logDetail.userName }}</el-descriptions-item>
          <el-descriptions-item label="日志类型">{{ logDetail.logType }}</el-descriptions-item>
          <el-descriptions-item label="认证方式">{{ logDetail.authMethod }}</el-descriptions-item>
          <el-descriptions-item label="结果">
            <span :class="logDetail.result === '成功' ? 'ua-result-success' : 'ua-result-fail'">{{ logDetail.result }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="链路">{{ logDetail.link }}</el-descriptions-item>
          <el-descriptions-item label="操作时间" :span="2">{{ logDetail.opTime }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  TitleComponent, TooltipComponent, LegendComponent, GridComponent
} from 'echarts/components'
import {
  Search, Sort, DataAnalysis, Download
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import './nv-shared.css'

use([CanvasRenderer, LineChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent])

// ── Tabs ─
const tabs = [
  { key: 'overview', label: '实时概况' },
  { key: 'logs', label: '认证日志' },
]
const activeTab = ref('overview')

// ── KPI 数据 ──
const kpiData = reactive({
  totalCount: 0,
  totalLogin: 0,
  totalLogout: 0,
  recentLogin: 0,
  recentLogout: 0,
})

// ── 登录次数趋势图 ──
const loginTimeRange = ref('3days')

const loginChartOption = ref({
  tooltip: { trigger: 'axis' },
  legend: {
    data: ['登录数', '登出数', '失败数'],
    bottom: 0,
    textStyle: { fontSize: 10 },
  },
  grid: { left: 60, right: 20, top: 20, bottom: 40 },
  xAxis: {
    type: 'category',
    data: [] as string[],
    axisLabel: { rotate: 45, fontSize: 9 },
  },
  yAxis: { type: 'value', name: '次数' },
  series: [
    {
      name: '登录数',
      type: 'line',
      data: [] as number[],
      smooth: true,
      itemStyle: { color: '#5b8ff9' },
      areaStyle: { color: 'rgba(91,143,249,0.1)' },
    },
    {
      name: '登出数',
      type: 'line',
      data: [] as number[],
      smooth: true,
      itemStyle: { color: '#5ad8a6' },
      areaStyle: { color: 'rgba(90,216,166,0.1)' },
    },
    {
      name: '失败数',
      type: 'line',
      data: [] as number[],
      smooth: true,
      itemStyle: { color: '#f6bd16' },
      areaStyle: { color: 'rgba(246,189,22,0.1)' },
    },
  ],
})

// ── 登出次数趋势图 ──
const logoutTimeRange = ref('3days')

const logoutChartOption = ref({
  tooltip: { trigger: 'axis' },
  legend: {
    data: ['登录数', '登出数', '失败数'],
    bottom: 0,
    textStyle: { fontSize: 10 },
  },
  grid: { left: 60, right: 20, top: 20, bottom: 40 },
  xAxis: {
    type: 'category',
    data: [] as string[],
    axisLabel: { rotate: 45, fontSize: 9 },
  },
  yAxis: { type: 'value', name: '次数' },
  series: [
    {
      name: '登录数',
      type: 'line',
      data: [] as number[],
      smooth: true,
      itemStyle: { color: '#5b8ff9' },
      areaStyle: { color: 'rgba(91,143,249,0.1)' },
    },
    {
      name: '登出数',
      type: 'line',
      data: [] as number[],
      smooth: true,
      itemStyle: { color: '#5ad8a6' },
      areaStyle: { color: 'rgba(90,216,166,0.1)' },
    },
    {
      name: '失败数',
      type: 'line',
      data: [] as number[],
      smooth: true,
      itemStyle: { color: '#f6bd16' },
      areaStyle: { color: 'rgba(246,189,22,0.1)' },
    },
  ],
})

function generateTimeLabels(range: string): string[] {
  const labels: string[] = []
  if (range === '3days') {
    const now = new Date()
    for (let i = 48; i >= 0; i--) {
      const t = new Date(now.getTime() - i * 3600000)
      const m = String(t.getMonth() + 1).padStart(2, '0')
      const d = String(t.getDate()).padStart(2, '0')
      const h = String(t.getHours()).padStart(2, '0')
      labels.push(`${m}-${d} ${h}:00`)
    }
  } else {
    const now = new Date()
    for (let i = 30; i >= 0; i--) {
      const t = new Date(now.getTime() - i * 86400000)
      const m = String(t.getMonth() + 1).padStart(2, '0')
      const d = String(t.getDate()).padStart(2, '0')
      labels.push(`${m}-${d}`)
    }
  }
  return labels
}

function updateCharts() {
  // 登录图表
  const loginLabels = generateTimeLabels(loginTimeRange.value)
  loginChartOption.value.xAxis.data = loginLabels
  loginChartOption.value.series[0].data = loginLabels.map(() => 0)
  loginChartOption.value.series[1].data = loginLabels.map(() => 0)
  loginChartOption.value.series[2].data = loginLabels.map(() => 0)

  // 登出图表
  const logoutLabels = generateTimeLabels(logoutTimeRange.value)
  logoutChartOption.value.xAxis.data = logoutLabels
  logoutChartOption.value.series[0].data = logoutLabels.map(() => 0)
  logoutChartOption.value.series[1].data = logoutLabels.map(() => 0)
  logoutChartOption.value.series[2].data = logoutLabels.map(() => 0)
}

updateCharts()

// ── 认证日志 Tab ──
const logPage = ref(1)
const logPageSize = ref(100)
const logGotoPage = ref(1)

const logFilter = reactive({
  account: '', mac: '', logType: '', userIp: '', link: '',
  timeRange: '2026-07-15 08:45:59 - 2026-07-15 09:00:59'
})

interface LogRow {
  userAddr: string; mac: string; macVendor: string; userName: string
  logType: string; link: string; opTime: string
}

const logData = ref<LogRow[]>([])

const logPages = computed(() => Math.max(1, Math.ceil(logData.value.length / logPageSize.value)))
const logPageData = computed(() => logData.value.slice((logPage.value - 1) * logPageSize.value, logPage.value * logPageSize.value))

function generateLogData(): LogRow[] {
  const rows: LogRow[] = []
  const baseTime = new Date('2026-07-15T09:00:59')
  const macVendors = ['NewH3CTechno...', 'NewH3CTechno...', 'NewH3CTechno...']
  const logTypes = ['登录', '登出', '登录', '登出', '登录']
  const links = ['默认', '默认', '默认', '默认', '默认']
  const userNames = ['admin', 'user1', 'user2', 'guest', 'test']

  for (let i = 0; i < 30; i++) {
    const time = new Date(baseTime.getTime() - i * 1000)
    const h = String(time.getHours()).padStart(2, '0')
    const m = String(time.getMinutes()).padStart(2, '0')
    const s = String(time.getSeconds()).padStart(2, '0')
    rows.push({
      userAddr: `192.168.1.${100 + i}`,
      mac: '54-2b-de-6d-10-ae',
      macVendor: macVendors[i % macVendors.length],
      userName: userNames[i % userNames.length],
      logType: logTypes[i % logTypes.length],
      link: links[i % links.length],
      opTime: `2026-07-15 ${h}:${m}:${s}`,
    })
  }
  return rows
}

logData.value = generateLogData()

function doLogSearch() { /* mock */ }
function resetLogFilters() {
  logFilter.account = ''; logFilter.mac = ''; logFilter.logType = ''
  logFilter.userIp = ''; logFilter.link = ''
  logFilter.timeRange = '2026-07-15 08:45:59 - 2026-07-15 09:00:59'
}
function doLogExport() {
  ElMessage.info('导出功能（Mock）')
}
function goToLogPage() {
  const p = logGotoPage.value
  if (p >= 1 && p <= logPages.value) logPage.value = p
}

// ── 日志详情弹窗 ──
const logDetailVisible = ref(false)
const logDetail = ref<LogRow>({
  userAddr: '', mac: '', macVendor: '', userName: '',
  logType: '', link: '', opTime: ''
})

function viewLogDetail(row: LogRow) {
  logDetail.value = { ...row }
  logDetailVisible.value = true
}
</script>

<style scoped>
/* KPI 卡片行 */
.ua-kpi-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  padding: 12px;
  background: #f5f7fa;
}

.ua-kpi-card {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 20px;
  text-align: center;
}

.ua-kpi-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.ua-kpi-label {
  font-size: 12px;
  color: #909399;
}

/* 图表面板 */
.ua-chart-panel {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 16px;
  margin: 12px;
}

.ua-chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.ua-range-btns {
  display: flex;
  gap: 8px;
}

.ua-range-btn {
  padding: 4px 12px;
  font-size: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 3px;
  background: #fff;
  cursor: pointer;
  color: #606266;
}

.ua-range-btn:hover {
  color: #409eff;
  border-color: #409eff;
}

.ua-range-btn.active {
  color: #409eff;
  border-color: #409eff;
  background: #ecf5ff;
}

/* 图例 */
.ua-chart-legend {
  display: flex;
  gap: 16px;
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.ua-legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.ua-legend-color {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

/* 结果样式 */
.ua-result-success {
  color: #67c23a;
  font-size: 12px;
}

.ua-result-fail {
  color: #f56c6c;
  font-size: 12px;
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

/* 排序图标 */
.sort-icon {
  font-size: 12px;
  color: #c0c4cc;
  vertical-align: middle;
  cursor: pointer;
}

/* 详情弹窗 */
:deep(.hd-detail-dialog .el-dialog__body) {
  padding: 12px 20px;
}
</style>
