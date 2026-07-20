<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav" role="tablist" aria-label="协议重传">
        <button type="button" class="nv-tab active" role="tab" aria-selected="true">协议重传</button>
      </div>
    </div>
    <div class="nv-tabs-body">
      <div class="pqr-page">
        <!-- ============ 左侧树 ============ -->
        <aside class="pqr-sidebar">
          <div class="pqr-tree-head"><span class="pqr-tree-title">应用协议</span></div>
          <ul class="pqr-tree-list">
            <li
              v-for="(item, idx) in treeItems"
              :key="item.key"
              class="pqr-tree-item"
              :class="{ 'pqr-tree-leaf': item.kind === 'leaf', 'pqr-tree-group': item.kind === 'group', 'pqr-tree-group-open': item.kind === 'group' && item.open, 'active': item.key === selectedTreeKey }"
              @click="onTreeClick(item)"
            >
              <span v-if="item.kind === 'group'" class="pqr-tree-toggle-icon" @click.stop="toggleGroup(item)">{{ item.open ? '−' : '+' }}</span>
              <span v-else class="pqr-tree-leaf-icon">·</span>
              <span class="pqr-tree-label">{{ item.label }}</span>
              <ul v-show="item.kind === 'group' && item.open" class="pqr-tree-children">
                <li
                  v-for="c in item.children"
                  :key="c.key"
                  class="pqr-tree-item pqr-tree-leaf"
                  :class="{ active: c.key === selectedTreeKey }"
                  @click.stop="onTreeClick(c)"
                >
                  <span class="pqr-tree-leaf-icon">·</span>
                  <span class="pqr-tree-label">{{ c.label }}</span>
                </li>
              </ul>
            </li>
          </ul>
        </aside>

        <!-- ============ 右侧主区 ============ -->
        <div class="pqr-main">
          <div class="pqr-filters">
            <label class="pqr-field">
              <span class="ou-toolbar-label">应用协议</span>
              <el-select v-model="filterProto" size="small" style="width:160px" clearable filterable>
                <el-option label="任意协议" value="" />
                <el-option v-for="p in allProtoNames" :key="p" :label="p" :value="p" />
              </el-select>
            </label>
            <label class="pqr-field">
              <span class="ou-toolbar-label">重传率&gt;=</span>
              <el-input-number v-model="rateMin" :min="0" :max="100" :step="1" size="small" style="width:90px" controls-position="right" />
              <span class="pqr-unit">%</span>
            </label>
            <label class="pqr-field">
              <span class="ou-toolbar-label">事件等=</span>
              <el-input v-model="eventEq" size="small" placeholder="事件数" style="width:140px" clearable>
                <template #prefix><el-icon><Search /></el-icon></template>
              </el-input>
            </label>
            <label class="pqr-field">
              <span class="ou-toolbar-label">关键字搜索</span>
              <el-input v-model="keyword" size="small" placeholder="协议名" style="width:160px" clearable>
                <template #prefix><el-icon><Search /></el-icon></template>
              </el-input>
            </label>
            <button class="ou-search-btn" @click="doSearch"><el-icon><Search /></el-icon>&nbsp;搜索</button>
            <button class="secondary td-reset-btn" @click="doReset">重置</button>
            <button class="link-btn" @click="doExport" style="margin-left:auto">⬇ 导出</button>
          </div>

          <div class="pqr-card-grid">
            <div
              v-for="(r, i) in pagedRows"
              :key="r.name + i"
              class="pqr-card"
              @click="openDetail(r)"
            >
              <div class="pqr-card-top">
                <span class="pqr-card-name">{{ r.name }}</span>
                <span class="pqr-card-conn">连接数 {{ r.conn }}</span>
              </div>
              <div class="pqr-card-mid">
                <span class="pqr-card-rate" :class="rateCls(r.rate)">{{ r.rate.toFixed(2) }}%</span>
                <span class="pqr-card-pkgs">{{ r.rt }} / {{ r.total }}</span>
              </div>
              <div class="pqr-card-bot">
                <span class="pqr-card-sub-label">率件率</span>
                <v-chart :option="r.chartOption" autoresize style="width:100%;height:60px" />
              </div>
            </div>
            <div v-if="pagedRows.length === 0" class="pqr-card-empty">无数据</div>
          </div>

          <div class="ou-footer">
            <div class="ou-footer-left">
              <div class="ou-pager">
                <button class="ou-page-btn" :disabled="page <= 1" @click="page > 1 && page--">‹</button>
                <button v-for="pg in pageArr" :key="pg" class="ou-page-btn" :class="{ active: pg === page }" @click="page = pg">{{ pg }}</button>
                <span v-if="totalPages > 7" style="margin:0 4px;color:#909399">...</span>
                <button v-if="totalPages > 7" class="ou-page-btn" :class="{ active: page === totalPages }" @click="page = totalPages">{{ totalPages }}</button>
                <button class="ou-page-btn" :disabled="page >= totalPages" @click="page < totalPages && page++">›</button>
              </div>
            </div>
            <div class="ou-footer-right">
              <span>共 {{ filteredRows.length }} 条</span>
              <el-select v-model="pageSize" size="small" style="width:110px">
                <el-option :value="24" label="24 条/页" />
                <el-option :value="48" label="48 条/页" />
                <el-option :value="100" label="100 条/页" />
              </el-select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 协议重传详情弹窗 ==================== -->
    <el-dialog v-model="detailVisible" :title="`协议重传 -> ${detailProto}`" width="98%" top="2vh" destroy-on-close class="pqr-detail-dialog">
      <template #header>
        <div class="pqr-detail-head">
          <span class="pqr-detail-title">协议重传 -&gt; {{ detailProto }}</span>
        </div>
      </template>

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
                <div>源:<span class="pqr-ip-link" @click="openSessionDiag(r.srcIp)">{{ r.srcIp }}</span>:{{ r.srcPort }}</div>
                <div>目:<span class="pqr-ip-link" @click="openSessionDiag(r.dstIp)">{{ r.dstIp }}</span>:{{ r.dstPort }}</div>
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
                <el-icon class="pqr-act-icon" title="报文" @click="openPacket(r)"><Document /></el-icon>
              </td>
            </tr>
            <tr v-if="sessionRows.length === 0">
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
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart } from 'echarts/charts'
import {
  TitleComponent, TooltipComponent, LegendComponent, GridComponent
} from 'echarts/components'
import { ElMessage } from 'element-plus'
import {
  Search, Sort, Connection, Refresh, Box, DataLine, Histogram,
  DataAnalysis, Warning, TrendCharts, Document, Location
} from '@element-plus/icons-vue'
import './nv-shared.css'

use([CanvasRenderer, LineChart, BarChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent])

// ══════════════════════════════════════════════════════════════
// 左侧树
// ═══════════════════════════════════════════════════════════
interface TreeLeaf { key: string; label: string; kind: 'leaf' }
interface TreeGroup {
  key: string; label: string; kind: 'group'
  open: boolean
  children: TreeLeaf[]
}
type TreeItem = TreeLeaf | TreeGroup

const treeItems = reactive<TreeItem[]>([
  { key: 'any', label: '应用协议', kind: 'leaf' },
  { key: 'g_http', label: 'HTTP协议', kind: 'group', open: true, children: [
    { key: 'HTTP下载', label: 'HTTP下载', kind: 'leaf' },
    { key: 'HTTP上传', label: 'HTTP上传', kind: 'leaf' },
    { key: 'HTTPDNS', label: 'HTTPDNS', kind: 'leaf' },
    { key: 'HTTP代理', label: 'HTTP代理', kind: 'leaf' },
    { key: 'IP查询应用', label: 'IP查询应用', kind: 'leaf' },
    { key: '常用测速', label: '常用测速', kind: 'leaf' },
    { key: 'Web视频', label: 'Web视频', kind: 'leaf' },
    { key: 'WEB音乐', label: 'WEB音乐', kind: 'leaf' },
    { key: 'WebMail', label: 'WebMail', kind: 'leaf' },
    { key: '去哪儿', label: '去哪儿', kind: 'leaf' },
    { key: '其它DNS', label: '其它DNS', kind: 'leaf' },
    { key: 'XMPP', label: 'XMPP', kind: 'leaf' },
    { key: 'Flash', label: 'Flash', kind: 'leaf' },
    { key: 'QQ旋风', label: 'QQ旋风', kind: 'leaf' },
    { key: '网络游戏', label: '网络游戏', kind: 'leaf' },
    { key: '易迅购物', label: '易迅购物', kind: 'leaf' },
    { key: '有道词典', label: '有道词典', kind: 'leaf' },
    { key: 'HTTPS应用', label: 'HTTPS应用', kind: 'leaf' },
    { key: '在线教育', label: '在线教育', kind: 'leaf' },
    { key: '网上购物', label: '网上购物', kind: 'leaf' },
  ]},
  { key: 'g_key', label: '重点协议', kind: 'group', open: false, children: [
    { key: 'DNS', label: 'DNS', kind: 'leaf' },
    { key: 'SSH', label: 'SSH', kind: 'leaf' },
    { key: 'FTP', label: 'FTP', kind: 'leaf' },
    { key: 'TELNET', label: 'TELNET', kind: 'leaf' },
    { key: 'SMTP', label: 'SMTP', kind: 'leaf' },
    { key: 'POP3', label: 'POP3', kind: 'leaf' },
    { key: 'IMAP', label: 'IMAP', kind: 'leaf' },
  ]},
  { key: 'g_p2p', label: 'P2P下载', kind: 'group', open: false, children: [
    { key: 'BitTorrent', label: 'BitTorrent', kind: 'leaf' },
    { key: 'eMule', label: 'eMule', kind: 'leaf' },
    { key: '迅雷下载', label: '迅雷下载', kind: 'leaf' },
    { key: '百度网盘', label: '百度网盘', kind: 'leaf' },
  ]},
  { key: 'g_tv', label: '网络电视', kind: 'group', open: false, children: [] },
  { key: 'g_social', label: '社交', kind: 'group', open: false, children: [] },
  { key: 'g_fin', label: '金融财经', kind: 'group', open: false, children: [] },
  { key: 'g_stream', label: '流量主体', kind: 'group', open: false, children: [] },
  { key: 'g_game', label: '网络游戏', kind: 'group', open: false, children: [
    { key: '腾讯游戏通用/Wegame', label: '腾讯游戏通用/Wegame', kind: 'leaf' },
    { key: 'TelegramWegame', label: 'TelegramWegame', kind: 'leaf' },
  ]},
  { key: 'g_biz', label: '商业系统', kind: 'group', open: false, children: [
    { key: 'MySQL', label: 'MySQL', kind: 'leaf' },
    { key: 'Redis', label: 'Redis', kind: 'leaf' },
  ]},
  { key: 'g_other', label: '其它', kind: 'group', open: false, children: [
    { key: '其它HTTPS', label: '其它HTTPS', kind: 'leaf' },
    { key: '其它TCP', label: '其它TCP', kind: 'leaf' },
  ]},
  { key: 'g_mobile', label: '移动流媒体', kind: 'group', open: false, children: [] },
  { key: 'custom', label: '自定义协议', kind: 'leaf' },
])

const selectedTreeKey = ref('any')

function isGroup(item: TreeItem): item is TreeGroup { return item.kind === 'group' }

function toggleGroup(item: TreeItem) {
  if (isGroup(item)) item.open = !item.open
}

function onTreeClick(item: TreeItem) {
  selectedTreeKey.value = item.key
  filterProto.value = item.key === 'any' ? '' : item.key
  page.value = 1
}

const allProtoNames = computed(() => {
  const names: string[] = []
  treeItems.forEach(item => {
    if (item.kind === 'group') item.children.forEach(c => names.push(c.label))
    else names.push(item.label)
  })
  return names
})

// ══════════════════════════════════════════════════════════════
// 工具栏
// ═══════════════════════════════════════════════════════════
const filterProto = ref<string>('')
const rateMin = ref<number>(0)
const eventEq = ref<string>('')
const keyword = ref('')

function doSearch() { page.value = 1 }
function doReset() {
  filterProto.value = ''
  rateMin.value = 0
  eventEq.value = ''
  keyword.value = ''
  selectedTreeKey.value = 'any'
  page.value = 1
}
function doExport() { ElMessage.info('导出（Mock）') }

function rateCls(rate: number) {
  if (rate >= 50) return 'pqr-rate-bad'
  if (rate >= 5) return 'pqr-rate-warn'
  return 'pqr-rate-ok'
}

function formatNum(n: number): string {
  if (n >= 10000) return n.toLocaleString('en-US')
  return String(n)
}

function formatRate(r: number): string {
  if (r >= 10) return r.toFixed(2)
  return r.toFixed(2)
}

function formatLat(n: number): string {
  if (Number.isInteger(n)) return String(n)
  return n.toFixed(2)
}

// ══════════════════════════════════════════════════════════════
// 卡片数据
// ═══════════════════════════════════════════════════════════
interface CardRow {
  name: string
  conn: number
  total: string
  rt: number
  rate: number
  chartOption: any
}

function makeMiniChart(seed: number) {
  const arr: number[] = []
  for (let i = 0; i < 30; i++) {
    arr.push(Math.round(20 + Math.sin(i / 4 + seed) * 15 + Math.random() * 12))
  }
  return {
    grid: { left: 0, right: 0, top: 2, bottom: 0 },
    xAxis: { type: 'category', show: false, data: arr.map((_, i) => i) },
    yAxis: { type: 'value', show: false },
    tooltip: { show: false },
    series: [{
      type: 'line',
      smooth: true,
      symbol: 'none',
      data: arr,
      lineStyle: { color: '#67c23a', width: 1.4 },
      areaStyle: { color: 'rgba(103,194,58,0.2)' }
    }]
  }
}

const allCardRows: CardRow[] = [
  { name: 'DECIPHC', conn: 1, total: '73930', rt: 1, rate: 100.00, chartOption: makeMiniChart(0) },
  { name: 'TelegramWegame', conn: 750, total: '750', rt: 729, rate: 97.20, chartOption: makeMiniChart(1) },
  { name: '腾讯游戏通用/Wegame', conn: 31, total: '33', rt: 30, rate: 90.91, chartOption: makeMiniChart(2) },
  { name: 'BitTorrent', conn: 12, total: '12', rt: 8, rate: 66.67, chartOption: makeMiniChart(3) },
  { name: 'SSH', conn: 27847, total: '27847', rt: 15071, rate: 54.12, chartOption: makeMiniChart(4) },
  { name: 'Android', conn: 138, total: '138', rt: 19, rate: 13.77, chartOption: makeMiniChart(5) },
  { name: '未知应用', conn: 33181, total: '33181', rt: 3516, rate: 10.60, chartOption: makeMiniChart(6) },
  { name: '其它下载', conn: 125882, total: '125882', rt: 12681, rate: 10.07, chartOption: makeMiniChart(7) },
  { name: 'HTTP传输错误', conn: 7892, total: '7892', rt: 558, rate: 7.07, chartOption: makeMiniChart(8) },
  { name: '其它HTTPS', conn: 2155578, total: '2155578', rt: 153407, rate: 6.94, chartOption: makeMiniChart(9) },
  { name: '域名系统', conn: 22, total: '22', rt: 1, rate: 4.55, chartOption: makeMiniChart(10) },
  { name: 'RSync', conn: 26941, total: '26941', rt: 1152, rate: 3.85, chartOption: makeMiniChart(11) },
  { name: 'WhatsApp', conn: 420, total: '420', rt: 15, rate: 3.57, chartOption: makeMiniChart(12) },
  { name: 'SMTP', conn: 2336, total: '2336', rt: 60, rate: 2.57, chartOption: makeMiniChart(13) },
  { name: 'RSAP', conn: 24081, total: '24081', rt: 598, rate: 2.48, chartOption: makeMiniChart(14) },
  { name: '市巴下载', conn: 32268, total: '32268', rt: 744, rate: 2.31, chartOption: makeMiniChart(15) },
  { name: 'Redis', conn: 2482, total: '2482', rt: 55, rate: 2.22, chartOption: makeMiniChart(16) },
  { name: 'WWW', conn: 2280335, total: '2280335', rt: 3928, rate: 1.68, chartOption: makeMiniChart(17) },
  { name: '企业微信', conn: 97, total: '97', rt: 1, rate: 1.03, chartOption: makeMiniChart(18) },
  { name: '网易云音乐', conn: 150, total: '150', rt: 1, rate: 0.67, chartOption: makeMiniChart(19) },
  { name: '腾讯游戏', conn: 864, total: '864', rt: 4, rate: 0.46, chartOption: makeMiniChart(20) },
  { name: 'NTP', conn: 4810, total: '4810', rt: 12, rate: 0.25, chartOption: makeMiniChart(21) },
  { name: 'FTP传输', conn: 651, total: '651', rt: 1, rate: 0.15, chartOption: makeMiniChart(22) },
  { name: 'Web视频', conn: 2243, total: '2243', rt: 2, rate: 0.09, chartOption: makeMiniChart(23) },
  { name: 'POP3', conn: 1500, total: '1500', rt: 1, rate: 0.07, chartOption: makeMiniChart(24) },
  { name: '在线教育', conn: 988, total: '988', rt: 0, rate: 0.00, chartOption: makeMiniChart(25) },
  { name: '网上购物', conn: 7651, total: '7651', rt: 0, rate: 0.00, chartOption: makeMiniChart(26) },
  { name: '有道词典', conn: 432, total: '432', rt: 0, rate: 0.00, chartOption: makeMiniChart(27) },
  { name: '易迅购物', conn: 219, total: '219', rt: 0, rate: 0.00, chartOption: makeMiniChart(28) },
  { name: 'QQ旋风', conn: 1024, total: '1024', rt: 0, rate: 0.00, chartOption: makeMiniChart(29) },
  { name: '网络游戏', conn: 5678, total: '5678', rt: 0, rate: 0.00, chartOption: makeMiniChart(30) },
  { name: 'Flash', conn: 432, total: '432', rt: 0, rate: 0.00, chartOption: makeMiniChart(31) },
  { name: 'XMPP', conn: 211, total: '211', rt: 0, rate: 0.00, chartOption: makeMiniChart(32) },
  { name: 'WebMail', conn: 99, total: '99', rt: 0, rate: 0.00, chartOption: makeMiniChart(33) },
  { name: 'WEB音乐', conn: 88, total: '88', rt: 0, rate: 0.00, chartOption: makeMiniChart(34) },
  { name: 'IP查询应用', conn: 766, total: '766', rt: 0, rate: 0.00, chartOption: makeMiniChart(35) },
  { name: '常用测速', conn: 553, total: '553', rt: 0, rate: 0.00, chartOption: makeMiniChart(36) },
  { name: '去哪儿', conn: 332, total: '332', rt: 0, rate: 0.00, chartOption: makeMiniChart(37) },
  { name: '其它DNS', conn: 410, total: '410', rt: 0, rate: 0.00, chartOption: makeMiniChart(38) },
  { name: 'HTTPDNS', conn: 220, total: '220', rt: 0, rate: 0.00, chartOption: makeMiniChart(39) },
  { name: 'HTTP下载', conn: 1142, total: '1142', rt: 0, rate: 0.00, chartOption: makeMiniChart(40) },
  { name: 'HTTP上传', conn: 226, total: '226', rt: 0, rate: 0.00, chartOption: makeMiniChart(41) },
  { name: 'HTTP代理', conn: 568, total: '568', rt: 0, rate: 0.00, chartOption: makeMiniChart(42) },
  { name: 'HTTPS应用', conn: 4480, total: '4480', rt: 0, rate: 0.00, chartOption: makeMiniChart(43) },
  { name: 'DNS', conn: 12800, total: '12800', rt: 0, rate: 0.00, chartOption: makeMiniChart(44) },
  { key: 'TELNET', name: 'TELNET', conn: 32, total: '32', rt: 0, rate: 0.00, chartOption: makeMiniChart(45) } as any,
  { key: 'IMAP', name: 'IMAP', conn: 19720, total: '19720', rt: 145, rate: 0.74, chartOption: makeMiniChart(46) } as any,
  { key: 'RDP', name: 'RDP', conn: 15, total: '15', rt: 0, rate: 0.00, chartOption: makeMiniChart(47) } as any,
  { key: 'MySQL', name: 'MySQL', conn: 1046, total: '1046', rt: 4, rate: 0.38, chartOption: makeMiniChart(48) } as any,
  { key: 'Redis2', name: 'Redis', conn: 70454, total: '70454', rt: 0, rate: 0.00, chartOption: makeMiniChart(49) } as any,
  { key: '其它HTTPS2', name: '其它HTTPS', conn: 981650, total: '981650', rt: 0, rate: 0.00, chartOption: makeMiniChart(50) } as any,
  { key: '其它TCP', name: '其它TCP', conn: 5110, total: '5110', rt: 0, rate: 0.00, chartOption: makeMiniChart(51) } as any,
  { key: 'BitTorrent2', name: 'BitTorrent', conn: 12, total: '12', rt: 0, rate: 0.00, chartOption: makeMiniChart(52) } as any,
  { key: 'eMule', name: 'eMule', conn: 5, total: '5', rt: 0, rate: 0.00, chartOption: makeMiniChart(53) } as any,
  { key: '迅雷下载', name: '迅雷下载', conn: 880, total: '880', rt: 0, rate: 0.00, chartOption: makeMiniChart(54) } as any,
  { key: '百度网盘', name: '百度网盘', conn: 240, total: '240', rt: 0, rate: 0.00, chartOption: makeMiniChart(55) } as any,
]

const filteredRows = computed(() => {
  let rows = allCardRows
  if (filterProto.value) {
    const k = filterProto.value
    rows = rows.filter(r => r.name === k)
  }
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    rows = rows.filter(r => r.name.toLowerCase().includes(kw))
  }
  if (rateMin.value > 0) {
    rows = rows.filter(r => r.rate >= rateMin.value)
  }
  if (eventEq.value) {
    rows = rows.filter(r => String(r.conn) === eventEq.value)
  }
  return rows
})

const page = ref(1)
const pageSize = ref(24)
const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / pageSize.value)))
const pageArr = computed(() => {
  const total = totalPages.value
  const cur = page.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const arr: number[] = []
  for (let i = Math.max(1, cur - 2); i <= Math.min(total, cur + 2); i++) arr.push(i)
  return arr
})
const pagedRows = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredRows.value.slice(start, start + pageSize.value)
})

// ══════════════════════════════════════════════════════════════
// 详情弹窗
// ═══════════════════════════════════════════════════════════
const detailVisible = ref(false)
const detailProto = ref('')
const detailActiveTab = ref<'session' | 'trend'>('session')
const detailTabs = [
  { key: 'session', label: '重传会话' },
  { key: 'trend', label: '重传趋势' },
]

const detailConn = ref(0)
const detailNew = ref(0)
const detailRtPkts = ref(0)
const detailTotalPkts = ref(0)
const detailRate = ref(0)
const detailAvgLat = ref(0)
const detailMaxLat = ref(0)
const detailFailRate = ref(0)

const detailDataMap: Record<string, { conn: number; newConn: number; rtPkts: number; totalPkts: number; rate: number; avgLat: number; maxLat: number; failRate: number }> = {
  '腾讯游戏通用/Wegame': { conn: 129, newConn: 8, rtPkts: 30, totalPkts: 33, rate: 90.91, avgLat: 1798.32, maxLat: 3955.12, failRate: 12.5 },
  'TelegramWegame': { conn: 750, newConn: 32, rtPkts: 729, totalPkts: 750, rate: 97.20, avgLat: 2103.50, maxLat: 4211.30, failRate: 18.6 },
  'DECIPHC': { conn: 1, newConn: 0, rtPkts: 1, totalPkts: 73930, rate: 100.00, avgLat: 50.00, maxLat: 80.00, failRate: 0.0 },
  'BitTorrent': { conn: 12, newConn: 1, rtPkts: 8, totalPkts: 12, rate: 66.67, avgLat: 850.40, maxLat: 1820.60, failRate: 8.4 },
  'SSH': { conn: 27847, newConn: 412, rtPkts: 15071, totalPkts: 27847, rate: 54.12, avgLat: 320.50, maxLat: 1200.00, failRate: 4.2 },
  'Android': { conn: 138, newConn: 6, rtPkts: 19, totalPkts: 138, rate: 13.77, avgLat: 220.10, maxLat: 580.00, failRate: 2.1 },
  '未知应用': { conn: 33181, newConn: 512, rtPkts: 3516, totalPkts: 33181, rate: 10.60, avgLat: 145.30, maxLat: 460.20, failRate: 1.8 },
  '其它下载': { conn: 125882, newConn: 1800, rtPkts: 12681, totalPkts: 125882, rate: 10.07, avgLat: 180.00, maxLat: 520.00, failRate: 1.5 },
  'HTTP传输错误': { conn: 7892, newConn: 88, rtPkts: 558, totalPkts: 7892, rate: 7.07, avgLat: 95.40, maxLat: 240.00, failRate: 1.2 },
  '其它HTTPS': { conn: 2155578, newConn: 22000, rtPkts: 153407, totalPkts: 2155578, rate: 6.94, avgLat: 110.00, maxLat: 280.00, failRate: 0.8 },
  '域名系统': { conn: 22, newConn: 1, rtPkts: 1, totalPkts: 22, rate: 4.55, avgLat: 38.20, maxLat: 120.00, failRate: 0.4 },
  'RSync': { conn: 26941, newConn: 320, rtPkts: 1152, totalPkts: 26941, rate: 3.85, avgLat: 72.00, maxLat: 180.00, failRate: 0.6 },
  'WhatsApp': { conn: 420, newConn: 5, rtPkts: 15, totalPkts: 420, rate: 3.57, avgLat: 240.00, maxLat: 520.00, failRate: 0.9 },
  'SMTP': { conn: 2336, newConn: 18, rtPkts: 60, totalPkts: 2336, rate: 2.57, avgLat: 165.30, maxLat: 380.00, failRate: 0.7 },
  'RSAP': { conn: 24081, newConn: 280, rtPkts: 598, totalPkts: 24081, rate: 2.48, avgLat: 130.20, maxLat: 320.00, failRate: 0.5 },
  '市巴下载': { conn: 32268, newConn: 380, rtPkts: 744, totalPkts: 32268, rate: 2.31, avgLat: 220.00, maxLat: 480.00, failRate: 0.6 },
  'Redis': { conn: 2482, newConn: 32, rtPkts: 55, totalPkts: 2482, rate: 2.22, avgLat: 18.30, maxLat: 45.20, failRate: 0.1 },
  'WWW': { conn: 2280335, newConn: 32000, rtPkts: 3928, totalPkts: 2280335, rate: 1.68, avgLat: 88.50, maxLat: 230.00, failRate: 0.3 },
}

function openSessionDiag(ip: string) {
  ElMessage.info(`打开会话诊断：${ip}（Mock）`)
}

function openPacket(row: SessionRow) {
  ElMessage.info(`打开报文分析：${row.srcIp} -> ${row.dstIp}（Mock）`)
}

function openDetail(row: CardRow) {
  // 打开新浏览器窗口（与截图一致），通过 hash 路由定位弹窗视图
  const proto = encodeURIComponent(row.name)
  const hash = `#/nv/pq-retransmission-popup?proto=${proto}`
  const url = `${window.location.origin}${window.location.pathname}${window.location.search}${hash}`
  const win = window.open(url, `_blank`, 'width=1280,height=820,menubar=no,toolbar=no,location=yes,status=no')
  if (!win) {
    // 被浏览器拦截时回退到模态弹窗
    detailProto.value = row.name
    const d = detailDataMap[row.name]
    if (d) {
      detailConn.value = d.conn
      detailNew.value = d.newConn
      detailRtPkts.value = d.rtPkts
      detailTotalPkts.value = d.totalPkts
      detailRate.value = d.rate
      detailAvgLat.value = d.avgLat
      detailMaxLat.value = d.maxLat
      detailFailRate.value = d.failRate
    } else {
      detailConn.value = row.conn
      detailNew.value = Math.floor(row.conn * 0.06)
      detailRtPkts.value = row.rt
      detailTotalPkts.value = parseInt(row.total.replace(/,/g, '')) || row.conn
      detailRate.value = row.rate
      detailAvgLat.value = row.rate > 50 ? 1798.32 : row.rate > 10 ? 320.50 : 65.20
      detailMaxLat.value = row.rate > 50 ? 3955.12 : row.rate > 10 ? 1200.00 : 320.00
      detailFailRate.value = row.rate > 50 ? 12.5 : row.rate > 10 ? 4.2 : 0.8
    }
    detailActiveTab.value = 'session'
    sessionPage.value = 1
    buildSessionRows()
    detailVisible.value = true
  }
}

// 重传会话表格数据
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

// 重传趋势图表
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

<style scoped>
.pqr-page { display:flex; height:100%; }
.pqr-sidebar { width:200px; min-width:200px; border-right:1px solid #ebeef5; overflow-y:auto; padding:6px 0; font-size:13px; background:#fafbfc; }
.pqr-tree-head { padding:8px 14px; font-weight:600; color:#303133; border-bottom:1px solid #ebeef5; margin-bottom:6px; background:#fff; }
.pqr-tree-title { font-size:13px; }
.pqr-tree-list { list-style:none; padding:0; margin:0; }
.pqr-tree-item { list-style:none; padding:4px 14px 4px 24px; cursor:pointer; color:#606266; line-height:1.7; position:relative; }
.pqr-tree-item:hover { background:#f0f7ff; }
.pqr-tree-item.active { background:#ecf5ff; color:#409eff; }
.pqr-tree-item.active .pqr-tree-label { color:#409eff; font-weight:500; }
.pqr-tree-leaf-icon { display:inline-block; width:12px; color:#c0c4cc; }
.pqr-tree-toggle-icon { position:absolute; left:8px; top:4px; display:inline-block; width:14px; text-align:center; color:#909399; user-select:none; }
.pqr-tree-label { font-size:13px; }
.pqr-tree-children { list-style:none; padding-left:14px; margin:0; }
.pqr-tree-children .pqr-tree-item { padding-left:24px; }

.pqr-main { flex:1; min-width:0; display:flex; flex-direction:column; overflow:hidden; }
.pqr-filters { display:flex; align-items:center; gap:10px; padding:10px 14px; border-bottom:1px solid #ebeef5; flex-wrap:wrap; }
.pqr-field { display:inline-flex; align-items:center; gap:6px; }
.pqr-unit { font-size:12px; color:#909399; }

/* 卡片网格 */
.pqr-card-grid { flex:1; min-height:0; overflow-y:auto; padding:10px 14px; display:grid; grid-template-columns:repeat(4, 1fr); gap:8px; align-content:start; }
.pqr-card { background:#fff; border:1px solid #ebeef5; border-radius:3px; padding:6px 10px; cursor:pointer; transition:box-shadow .15s, border-color .15s; }
.pqr-card:hover { box-shadow:0 2px 8px rgba(64,158,255,.15); border-color:#409eff; }
.pqr-card-top { display:flex; align-items:center; justify-content:space-between; font-size:12px; }
.pqr-card-name { font-weight:600; color:#303133; max-width:60%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.pqr-card-conn { font-size:11px; color:#909399; }
.pqr-card-mid { display:flex; align-items:baseline; gap:8px; margin-top:2px; }
.pqr-card-rate { font-size:14px; font-weight:600; }
.pqr-card-pkgs { font-size:11px; color:#909399; }
.pqr-card-bot { margin-top:2px; }
.pqr-card-sub-label { font-size:10px; color:#c0c4cc; }
.pqr-card-empty { grid-column:1 / -1; padding:30px; text-align:center; color:#909399; font-size:13px; }

.pqr-rate-bad { color:#f56c6c; }
.pqr-rate-warn { color:#e6a23c; }
.pqr-rate-ok { color:#67c23a; }

.col-actions { width:60px; text-align:center; }
.sort-icon { font-size:10px; color:#c0c4cc; vertical-align:middle; margin-left:2px; }

/* 详情弹窗 */
.pqr-detail-head { padding-right:16px; }
.pqr-detail-title { font-size:14px; font-weight:500; color:#303133; }
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
.pqr-ip-link { color:#409eff; cursor:pointer; text-decoration:underline; text-decoration-color:rgba(64,158,255,.4); }
.pqr-ip-link:hover { color:#66b1ff; text-decoration-color:#66b1ff; }

.pqr-trend-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.pqr-trend-card { background:#fff; border:1px solid #ebeef5; border-radius:4px; }
.pqr-trend-head { padding:8px 12px; border-bottom:1px solid #f0f2f5; }
.pqr-trend-title { font-size:13px; font-weight:600; color:#303133; }
.pqr-trend-body { padding:8px 12px; }
</style>
