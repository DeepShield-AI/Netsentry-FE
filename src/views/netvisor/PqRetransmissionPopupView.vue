<template>
  <div class="pqr-popup-root">
    <!-- 模拟浏览器 Chrome 标题栏 -->
    <div class="pqr-chrome">
      <div class="pqr-chrome-tabs">
        <div class="pqr-chrome-tab active">
          <el-icon style="color:#1976d2"><Connection /></el-icon>
          <span>协议重传 -&gt; {{ detailProto }} - Google Chrome</span>
          <span class="pqr-chrome-tab-close">×</span>
        </div>
      </div>
      <div class="pqr-chrome-nav">
        <span class="pqr-chrome-btn">←</span>
        <span class="pqr-chrome-btn">→</span>
        <span class="pqr-chrome-btn">⟳</span>
        <div class="pqr-chrome-url">
          🔒 <span class="pqr-chrome-url-text">https://192.168.6.252/cgi-bin/common/popup?appname={{ urlProto }}</span>
        </div>
        <span class="pqr-chrome-btn">⋮</span>
      </div>
    </div>

    <div class="pqr-popup-body">
      <!-- 顶部统计卡 -->
      <div class="pqr-stats-grid">
        <div class="pqr-stat-card pqr-stat-name">
          <div class="pqr-stat-name-icon"><el-icon><Connection /></el-icon></div>
          <div class="pqr-stat-name-info">
            <div class="pqr-stat-name-label">协议名称</div>
            <div class="pqr-stat-name-val">{{ detailProto }}</div>
          </div>
          <div class="pqr-stat-name-num">
            <div class="pqr-stat-num-cell">
              <div class="pqr-stat-num-val">{{ detailConn }}</div>
              <div class="pqr-stat-num-label">当前连接</div>
            </div>
            <div class="pqr-stat-num-cell">
              <div class="pqr-stat-num-val">{{ detailNew }}</div>
              <div class="pqr-stat-num-label">最近新建</div>
            </div>
          </div>
        </div>

        <div class="pqr-stat-card">
          <div class="pqr-stat-cell">
            <div class="pqr-stat-cell-icon"><el-icon><Refresh /></el-icon></div>
            <div class="pqr-stat-cell-val">{{ detailRtPkts }}</div>
            <div class="pqr-stat-cell-label">重传包数</div>
          </div>
          <div class="pqr-stat-cell">
            <div class="pqr-stat-cell-icon"><el-icon><Box /></el-icon></div>
            <div class="pqr-stat-cell-val">{{ formatNum(detailTotalPkts) }}</div>
            <div class="pqr-stat-cell-label">总包数</div>
          </div>
          <div class="pqr-stat-cell">
            <div class="pqr-stat-cell-icon"><el-icon><DataLine /></el-icon></div>
            <div class="pqr-stat-cell-val" :class="rateCls(detailRate)">{{ formatRate(detailRate) }}%</div>
            <div class="pqr-stat-cell-label">重传率</div>
          </div>
        </div>

        <div class="pqr-stat-card">
          <div class="pqr-stat-cell">
            <div class="pqr-stat-cell-icon"><el-icon><Histogram /></el-icon></div>
            <div class="pqr-stat-cell-val">{{ formatLat(detailAvgLat) }} ms</div>
            <div class="pqr-stat-cell-label">平均时延</div>
          </div>
          <div class="pqr-stat-cell">
            <div class="pqr-stat-cell-icon"><el-icon><DataAnalysis /></el-icon></div>
            <div class="pqr-stat-cell-val">{{ formatLat(detailMaxLat) }} ms</div>
            <div class="pqr-stat-cell-label">最大时延</div>
          </div>
          <div class="pqr-stat-cell">
            <div class="pqr-stat-cell-icon"><el-icon><Warning /></el-icon></div>
            <div class="pqr-stat-cell-val" :class="rateCls(detailFailRate)">{{ detailFailRate }}%</div>
            <div class="pqr-stat-cell-label">失败率</div>
          </div>
        </div>
      </div>

      <!-- 弹窗工具栏 -->
      <div class="pqr-detail-toolbar">
        <div class="pqr-detail-tabs">
          <span v-for="t in detailTabs" :key="t.key" class="pqr-dtab" :class="{ active: detailActiveTab === t.key }" @click="detailActiveTab = t.key">{{ t.label }}</span>
        </div>
        <div class="pqr-detail-actions">
          <span class="pqr-dlink"><el-icon><TrendCharts /></el-icon>&nbsp;流量趋势</span>
          <span class="pqr-dlink"><el-icon><Histogram /></el-icon>&nbsp;协议时延</span>
          <span class="pqr-dlink"><el-icon><Document /></el-icon>&nbsp;历史会话</span>
        </div>
      </div>

      <!-- 重传会话 -->
      <div v-if="detailActiveTab === 'session'" class="pqr-detail-table-wrap">
        <table class="ou-table pqr-detail-table">
          <thead>
            <tr>
              <th style="width:80px">传输协议</th>
              <th>连接</th>
              <th>地理位置</th>
              <th class="ou-num">时长 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>HOST</th>
              <th colspan="3" class="pqr-dir-th">上行</th>
              <th colspan="3" class="pqr-dir-th">下行</th>
              <th class="col-actions" style="width:80px">操作</th>
            </tr>
            <tr class="pqr-subhead">
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th class="ou-num" style="font-weight:600">重传 / 总数 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th class="ou-num" style="font-weight:600">重传率 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th class="ou-num" style="font-weight:600">流量 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th class="ou-num" style="font-weight:600">重传 / 总数 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th class="ou-num" style="font-weight:600">重传率 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th class="ou-num" style="font-weight:600">流量 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in pagedSessionRows" :key="i">
              <td>{{ r.proto }}</td>
              <td style="font-size:11px">
                <div>源:{{ r.srcIp }}:{{ r.srcPort }}</div>
                <div>目:{{ r.dstIp }}:{{ r.dstPort }}</div>
              </td>
              <td>
                <span class="pqr-loc">
                  <el-icon style="color:#409eff"><Location /></el-icon>
                  {{ r.geo }}
                </span>
              </td>
              <td class="ou-num">{{ r.duration }}</td>
              <td style="font-size:12px">{{ r.host }}</td>
              <td class="ou-num">{{ r.upRt }} / {{ r.upTotal }}</td>
              <td class="ou-num" :class="rateCls(r.upRate)">{{ r.upRate }}%</td>
              <td class="ou-num">{{ r.upFlow }}</td>
              <td class="ou-num">{{ r.downRt }} / {{ r.downTotal }}</td>
              <td class="ou-num" :class="rateCls(r.downRate)">{{ r.downRate }}%</td>
              <td class="ou-num">{{ r.downFlow }}</td>
              <td class="col-actions">
                <el-icon class="pqr-act-icon" title="报文"><Document /></el-icon>
              </td>
            </tr>
            <tr v-if="pagedSessionRows.length === 0">
              <td colspan="12" class="ou-empty">无数据</td>
            </tr>
          </tbody>
        </table>
        <div class="ou-footer" style="padding:6px 0 0">
          <div class="ou-footer-left">
            <div class="ou-pager">
              <button class="ou-page-btn" :disabled="sessionPage <= 1" @click="sessionPage > 1 && sessionPage--">‹</button>
              <button v-for="pg in sessionPageArr" :key="pg" class="ou-page-btn" :class="{ active: pg === sessionPage }" @click="sessionPage = pg">{{ pg }}</button>
              <button class="ou-page-btn" :disabled="sessionPage >= sessionPages" @click="sessionPage < sessionPages && sessionPage++">›</button>
              <span style="margin-left:8px;font-size:12px;color:#909399">到第</span>
              <input v-model.number="sessionGoto" class="ou-page-goto-input" style="width:36px;height:24px;text-align:center;border:1px solid #dcdfe6;border-radius:3px;font-size:12px" />
              <span style="font-size:12px;color:#909399">页</span>
              <button class="ou-page-goto-btn" @click="goSessionPage" style="height:24px;padding:0 8px;border:1px solid #dcdfe6;border-radius:3px;background:#fff;font-size:12px;cursor:pointer">确定</button>
            </div>
          </div>
          <div class="ou-footer-right">
            <span>共 {{ sessionTotal }} 条</span>
            <select v-model="sessionPageSize" style="height:24px;border:1px solid #dcdfe6;border-radius:3px;font-size:12px;padding:0 4px">
              <option :value="100">100 条/页</option>
              <option :value="200">200 条/页</option>
              <option :value="500">500 条/页</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 重传趋势 -->
      <div v-else-if="detailActiveTab === 'trend'" class="pqr-trend-grid">
        <section class="pqr-trend-card">
          <div class="pqr-trend-head"><span class="pqr-trend-title">重传包趋势</span></div>
          <div class="pqr-trend-body">
            <v-chart :option="rtTrendOption" autoresize style="width:100%;height:260px" />
          </div>
        </section>
        <section class="pqr-trend-card">
          <div class="pqr-trend-head"><span class="pqr-trend-title">重传率趋势</span></div>
          <div class="pqr-trend-body">
            <v-chart :option="rtRateTrendOption" autoresize style="width:100%;height:260px" />
          </div>
        </section>
        <section class="pqr-trend-card">
          <div class="pqr-trend-head"><span class="pqr-trend-title">上行/下行流量趋势</span></div>
          <div class="pqr-trend-body">
            <v-chart :option="rtFlowTrendOption" autoresize style="width:100%;height:260px" />
          </div>
        </section>
        <section class="pqr-trend-card">
          <div class="pqr-trend-head"><span class="pqr-trend-title">连接数趋势</span></div>
          <div class="pqr-trend-body">
            <v-chart :option="rtConnTrendOption" autoresize style="width:100%;height:260px" />
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart } from 'echarts/charts'
import {
  TitleComponent, TooltipComponent, LegendComponent, GridComponent
} from 'echarts/components'
import {
  Connection, Refresh, Box, DataLine, Histogram,
  DataAnalysis, Warning, TrendCharts, Document, Location, Sort
} from '@element-plus/icons-vue'
import './nv-shared.css'

use([CanvasRenderer, LineChart, BarChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent])

// ══════════════════════════════════════════════════════════════
// 协议数据
// ═══════════════════════════════════════════════════════════
const detailProto = ref('腾讯游戏通用/Wegame')
const urlProto = ref('qqgamecommon')

const detailDataMap: Record<string, { conn: number; newConn: number; rtPkts: number; totalPkts: number; rate: number; avgLat: number; maxLat: number; failRate: number; appCname: string }> = {
  '腾讯游戏通用/Wegame': { conn: 129, newConn: 8, rtPkts: 30, totalPkts: 33, rate: 90.91, avgLat: 1798.32, maxLat: 3955.12, failRate: 12.5, appCname: 'qqgamecommon' },
  'TelegramWegame': { conn: 750, newConn: 32, rtPkts: 729, totalPkts: 750, rate: 97.20, avgLat: 2103.50, maxLat: 4211.30, failRate: 18.6, appCname: 'telegram' },
  'DECIPHC': { conn: 1, newConn: 0, rtPkts: 1, totalPkts: 73930, rate: 100.00, avgLat: 50.00, maxLat: 80.00, failRate: 0.0, appCname: 'deciphc' },
  'BitTorrent': { conn: 12, newConn: 1, rtPkts: 8, totalPkts: 12, rate: 66.67, avgLat: 850.40, maxLat: 1820.60, failRate: 8.4, appCname: 'bittorrent' },
  'SSH': { conn: 27847, newConn: 412, rtPkts: 15071, totalPkts: 27847, rate: 54.12, avgLat: 320.50, maxLat: 1200.00, failRate: 4.2, appCname: 'ssh' },
  'Android': { conn: 138, newConn: 6, rtPkts: 19, totalPkts: 138, rate: 13.77, avgLat: 220.10, maxLat: 580.00, failRate: 2.1, appCname: 'android' },
  '未知应用': { conn: 33181, newConn: 512, rtPkts: 3516, totalPkts: 33181, rate: 10.60, avgLat: 145.30, maxLat: 460.20, failRate: 1.8, appCname: 'unknown' },
  '其它下载': { conn: 125882, newConn: 1800, rtPkts: 12681, totalPkts: 125882, rate: 10.07, avgLat: 180.00, maxLat: 520.00, failRate: 1.5, appCname: 'other_download' },
  'HTTP传输错误': { conn: 7892, newConn: 88, rtPkts: 558, totalPkts: 7892, rate: 7.07, avgLat: 95.40, maxLat: 240.00, failRate: 1.2, appCname: 'http_error' },
  '其它HTTPS': { conn: 2155578, newConn: 22000, rtPkts: 153407, totalPkts: 2155578, rate: 6.94, avgLat: 110.00, maxLat: 280.00, failRate: 0.8, appCname: 'other_https' },
  '域名系统': { conn: 22, newConn: 1, rtPkts: 1, totalPkts: 22, rate: 4.55, avgLat: 38.20, maxLat: 120.00, failRate: 0.4, appCname: 'dns' },
  'RSync': { conn: 26941, newConn: 320, rtPkts: 1152, totalPkts: 26941, rate: 3.85, avgLat: 72.00, maxLat: 180.00, failRate: 0.6, appCname: 'rsync' },
  'WhatsApp': { conn: 420, newConn: 5, rtPkts: 15, totalPkts: 420, rate: 3.57, avgLat: 240.00, maxLat: 520.00, failRate: 0.9, appCname: 'whatsapp' },
  'SMTP': { conn: 2336, newConn: 18, rtPkts: 60, totalPkts: 2336, rate: 2.57, avgLat: 165.30, maxLat: 380.00, failRate: 0.7, appCname: 'smtp' },
  'RSAP': { conn: 24081, newConn: 280, rtPkts: 598, totalPkts: 24081, rate: 2.48, avgLat: 130.20, maxLat: 320.00, failRate: 0.5, appCname: 'rsap' },
  '市巴下载': { conn: 32268, newConn: 380, rtPkts: 744, totalPkts: 32268, rate: 2.31, avgLat: 220.00, maxLat: 480.00, failRate: 0.6, appCname: 'shiba' },
  'Redis': { conn: 2482, newConn: 32, rtPkts: 55, totalPkts: 2482, rate: 2.22, avgLat: 18.30, maxLat: 45.20, failRate: 0.1, appCname: 'redis' },
  'WWW': { conn: 2280335, newConn: 32000, rtPkts: 3928, totalPkts: 2280335, rate: 1.68, avgLat: 88.50, maxLat: 230.00, failRate: 0.3, appCname: 'www' },
}

const detailConn = ref(0)
const detailNew = ref(0)
const detailRtPkts = ref(0)
const detailTotalPkts = ref(0)
const detailRate = ref(0)
const detailAvgLat = ref(0)
const detailMaxLat = ref(0)
const detailFailRate = ref(0)

const detailActiveTab = ref<'session' | 'trend'>('session')
const detailTabs = [
  { key: 'session', label: '重传会话' },
  { key: 'trend', label: '重传趋势' },
]

function applyDetail(name: string) {
  detailProto.value = name
  const d = detailDataMap[name]
  if (d) {
    detailConn.value = d.conn
    detailNew.value = d.newConn
    detailRtPkts.value = d.rtPkts
    detailTotalPkts.value = d.totalPkts
    detailRate.value = d.rate
    detailAvgLat.value = d.avgLat
    detailMaxLat.value = d.maxLat
    detailFailRate.value = d.failRate
    urlProto.value = d.appCname
  }
}

onMounted(() => {
  const hash = window.location.hash
  const m = hash.match(/[?&]proto=([^&]+)/)
  if (m) {
    applyDetail(decodeURIComponent(m[1]))
  } else {
    applyDetail('腾讯游戏通用/Wegame')
  }
  // 强制去除滚动条
  document.documentElement.style.overflow = 'hidden'
  document.body.style.overflow = 'hidden'
  // 替换标题
  document.title = `协议重传 -> ${detailProto.value} - Google Chrome`
})

function rateCls(rate: number) {
  if (rate >= 50) return 'pqr-rate-bad'
  if (rate >= 5) return 'pqr-rate-warn'
  return 'pqr-rate-ok'
}

function formatNum(n: number): string {
  if (n >= 10000) return n.toLocaleString('en-US')
  return String(n)
}

function formatRate(r: number): string { return r.toFixed(2) }

function formatLat(n: number): string {
  if (Number.isInteger(n)) return String(n)
  return n.toFixed(2)
}

// ══════════════════════════════════════════════════════════════
// 会话表格数据
// ═══════════════════════════════════════════════════════════
interface SessionRow {
  proto: string
  srcIp: string; srcPort: number
  dstIp: string; dstPort: number
  geo: string
  duration: string
  host: string
  upRt: number; upTotal: number; upRate: number; upFlow: string
  downRt: number; downTotal: number; downRate: number; downFlow: string
}

const allSessionRows = ref<SessionRow[]>([])
const sessionTotal = ref(0)

function buildSessionRows() {
  const rows: SessionRow[] = []
  const count = 120
  const ports = [443, 80, 8080, 22, 21, 3389, 3306, 6379, 25, 110, 143, 53, 123]
  const dstIps = ['166.111.204.9', '202.114.32.146', '210.32.158.231', '101.6.15.40', '166.111.8.21']
  const srcIps = ['166.111.20.190', '166.111.21.45', '166.111.22.78', '101.6.6.99', '210.32.159.20']
  const geos = ['北京|教育网|清华大学', '北京|教育网|北京大学', '上海|电信|', '广州|联通|', '深圳|移动|']
  const hosts = ['cgi-bin/common/popup', 'api.wegame.qq.com', 'tcpconn.tencent.com', 'speed.cloudflare.com', 'download.adobe.com']
  for (let i = 0; i < count; i++) {
    const upTotal = 73000 + Math.floor(Math.random() * 2000)
    const upRt = i < 12 ? upTotal : Math.floor(upTotal * (0.6 + Math.random() * 0.4))
    const upRate = +(upRt / upTotal * 100).toFixed(2)
    const downTotal = 73000 + Math.floor(Math.random() * 2000)
    const downRt = Math.floor(downTotal * Math.random() * 0.05)
    const downRate = +(downRt / downTotal * 100).toFixed(2)
    const duration = 110000 + Math.floor(Math.random() * 3000)
    rows.push({
      proto: 'tcp',
      srcIp: srcIps[i % srcIps.length],
      srcPort: 11000 + i,
      dstIp: dstIps[i % dstIps.length],
      dstPort: ports[i % ports.length],
      geo: geos[i % geos.length],
      duration: String(duration),
      host: hosts[i % hosts.length],
      upRt, upTotal, upRate,
      upFlow: (4 + Math.random()).toFixed(2) + ' M',
      downRt, downTotal, downRate,
      downFlow: '0',
    })
  }
  allSessionRows.value = rows
  sessionTotal.value = rows.length
}

const sessionPage = ref(1)
const sessionPageSize = ref(100)
const sessionPages = computed(() => Math.max(1, Math.ceil(sessionTotal.value / sessionPageSize.value)))
const sessionPageArr = computed(() => {
  const total = sessionPages.value
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  return [1, 2, 3, 4, 5]
})
const sessionGoto = ref(1)
function goSessionPage() {
  const p = Math.max(1, Math.min(sessionPages.value, sessionGoto.value || 1))
  sessionPage.value = p
}
const pagedSessionRows = computed(() => {
  const start = (sessionPage.value - 1) * sessionPageSize.value
  return allSessionRows.value.slice(start, start + sessionPageSize.value)
})

buildSessionRows()

// ══════════════════════════════════════════════════════════════
// 趋势图
// ═══════════════════════════════════════════════════════════
const rtTrendOption = computed(() => {
  const x: string[] = []
  for (let h = 0; h < 24; h++) x.push(`${String(h).padStart(2, '0')}:00`)
  const make = (base: number) => x.map((_, i) => Math.round(base + Math.sin(i / 3) * base * 0.3 + (i % 4) * base * 0.1))
  return {
    tooltip: { trigger: 'axis' },
    legend: { data: ['重传包数', '总包数'], bottom: 0, textStyle: { fontSize: 11 } },
    grid: { left: 50, right: 20, top: 20, bottom: 40 },
    xAxis: { type: 'category', data: x, axisLabel: { fontSize: 10 } },
    yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
    series: [
      { name: '重传包数', type: 'bar', itemStyle: { color: '#f56c6c' }, data: make(8000) },
      { name: '总包数', type: 'line', smooth: true, symbol: 'none', itemStyle: { color: '#409eff' }, data: make(12000) },
    ],
  }
})

const rtRateTrendOption = computed(() => {
  const x: string[] = []
  for (let h = 0; h < 24; h++) x.push(`${String(h).padStart(2, '0')}:00`)
  return {
    tooltip: { trigger: 'axis', valueFormatter: (v: any) => `${v}%` },
    grid: { left: 50, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: x, axisLabel: { fontSize: 10 } },
    yAxis: { type: 'value', axisLabel: { fontSize: 10, formatter: '{value}%' } },
    series: [{
      type: 'line', smooth: true, symbol: 'none',
      itemStyle: { color: '#e6a23c' },
      areaStyle: { color: 'rgba(230,162,60,0.25)' },
      data: x.map((_, i) => +(50 + Math.sin(i / 4) * 30 + (i % 3) * 5).toFixed(2)),
    }],
  }
})

const rtFlowTrendOption = computed(() => {
  const x: string[] = []
  for (let h = 0; h < 24; h++) x.push(`${String(h).padStart(2, '0')}:00`)
  return {
    tooltip: { trigger: 'axis' },
    legend: { data: ['上行流量', '下行流量'], bottom: 0, textStyle: { fontSize: 11 } },
    grid: { left: 50, right: 20, top: 20, bottom: 40 },
    xAxis: { type: 'category', data: x, axisLabel: { fontSize: 10 } },
    yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
    series: [
      { name: '上行流量', type: 'line', smooth: true, symbol: 'none', itemStyle: { color: '#67c23a' }, areaStyle: { color: 'rgba(103,194,58,0.25)' }, data: x.map((_, i) => Math.round(40 + Math.sin(i / 3) * 15 + (i % 4) * 5)) },
      { name: '下行流量', type: 'line', smooth: true, symbol: 'none', itemStyle: { color: '#409eff' }, areaStyle: { color: 'rgba(64,158,255,0.25)' }, data: x.map((_, i) => Math.round(30 + Math.cos(i / 4) * 10 + (i % 5) * 4)) },
    ],
  }
})

const rtConnTrendOption = computed(() => {
  const x: string[] = []
  for (let h = 0; h < 24; h++) x.push(`${String(h).padStart(2, '0')}:00`)
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: 50, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: x, axisLabel: { fontSize: 10 } },
    yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
    series: [{
      type: 'line', smooth: true, symbol: 'none', step: 'middle',
      itemStyle: { color: '#909399' },
      areaStyle: { color: 'rgba(144,147,153,0.25)' },
      data: x.map((_, i) => Math.round(100 + Math.sin(i / 3) * 40 + (i % 3) * 10)),
    }],
  }
})
</script>

<style>
/* 弹窗根级样式：全屏 + 隐藏全局滚动条 */
html, body { margin:0; padding:0; height:100%; background:#fff; }
#app { height:100%; }
</style>

<style scoped>
.pqr-popup-root { display:flex; flex-direction:column; height:100vh; background:#fff; font-family:'Microsoft YaHei', Arial, sans-serif; }

/* 模拟 Chrome 浏览器标题栏 */
.pqr-chrome { background:#f1f3f4; border-bottom:1px solid #dadce0; flex-shrink:0; }
.pqr-chrome-tabs { display:flex; padding:6px 8px 0 8px; gap:2px; }
.pqr-chrome-tab { display:flex; align-items:center; gap:6px; padding:6px 12px; background:#fff; border:1px solid #dadce0; border-bottom:none; border-radius:6px 6px 0 0; font-size:12px; color:#3c4043; max-width:280px; }
.pqr-chrome-tab.active { background:#fff; }
.pqr-chrome-tab-close { margin-left:auto; color:#5f6368; cursor:pointer; padding:0 4px; border-radius:50%; }
.pqr-chrome-tab-close:hover { background:#f1f3f4; }
.pqr-chrome-nav { display:flex; align-items:center; gap:6px; padding:6px 10px; background:#fff; border-top:1px solid #dadce0; }
.pqr-chrome-btn { width:28px; height:28px; display:inline-flex; align-items:center; justify-content:center; border-radius:50%; color:#5f6368; cursor:pointer; font-size:14px; }
.pqr-chrome-btn:hover { background:#f1f3f4; }
.pqr-chrome-url { flex:1; background:#f1f3f4; border-radius:14px; padding:5px 14px; font-size:12px; color:#3c4043; display:flex; align-items:center; gap:6px; }
.pqr-chrome-url-text { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

/* 弹窗主体 */
.pqr-popup-body { flex:1; overflow:auto; padding:14px 18px; background:#fff; }

.pqr-stats-grid { display:grid; grid-template-columns:1.4fr 1fr 1fr; gap:10px; margin-bottom:10px; }
.pqr-stat-card { background:#fafbfc; border:1px solid #ebeef5; border-radius:4px; padding:10px 14px; display:flex; align-items:center; }
.pqr-stat-name { gap:14px; }
.pqr-stat-name-icon { font-size:22px; color:#909399; }
.pqr-stat-name-info { flex:1; }
.pqr-stat-name-label { font-size:11px; color:#909399; }
.pqr-stat-name-val { font-size:14px; font-weight:600; color:#303133; max-width:240px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.pqr-stat-name-num { display:flex; gap:18px; }
.pqr-stat-num-cell { text-align:right; }
.pqr-stat-num-val { font-size:18px; font-weight:600; color:#303133; font-variant-numeric:tabular-nums; }
.pqr-stat-num-label { font-size:11px; color:#909399; }
.pqr-stat-cell { flex:1; padding:0 8px; }
.pqr-stat-cell-icon { color:#909399; font-size:14px; }
.pqr-stat-cell-val { font-size:18px; font-weight:600; color:#303133; font-variant-numeric:tabular-nums; margin-top:2px; }
.pqr-stat-cell-label { font-size:11px; color:#909399; margin-top:2px; }

.pqr-detail-toolbar { display:flex; align-items:center; justify-content:space-between; padding:8px 0; border-bottom:1px solid #ebeef5; margin-bottom:8px; }
.pqr-detail-tabs { display:flex; gap:18px; }
.pqr-dtab { font-size:14px; cursor:pointer; padding-bottom:4px; border-bottom:2px solid transparent; color:#909399; }
.pqr-dtab.active { color:#409eff; border-color:#409eff; font-weight:500; }
.pqr-detail-actions { display:flex; gap:14px; }
.pqr-dlink { font-size:12px; color:#409eff; cursor:pointer; }
.pqr-dlink:hover { text-decoration:underline; }

.pqr-detail-table { font-size:12px; }
.pqr-detail-table th, .pqr-detail-table td { padding:6px 8px; }
.pqr-dir-th { text-align:center; background:#fafbfc; }
.pqr-subhead th { background:#fafbfc; font-weight:500; }
.pqr-loc { display:inline-flex; align-items:center; gap:4px; }
.pqr-act-icon { cursor:pointer; color:#409eff; font-size:14px; }
.pqr-act-icon:hover { color:#66b1ff; }

.pqr-trend-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.pqr-trend-card { background:#fff; border:1px solid #ebeef5; border-radius:4px; }
.pqr-trend-head { padding:8px 12px; border-bottom:1px solid #f0f2f5; }
.pqr-trend-title { font-size:13px; font-weight:600; color:#303133; }
.pqr-trend-body { padding:8px 12px; }

.col-actions { width:60px; text-align:center; }
.sort-icon { font-size:10px; color:#c0c4cc; vertical-align:middle; margin-left:2px; }
.pqr-rate-bad { color:#f56c6c; }
.pqr-rate-warn { color:#e6a23c; }
.pqr-rate-ok { color:#67c23a; }
</style>
