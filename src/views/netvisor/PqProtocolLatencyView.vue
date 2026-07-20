<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav" role="tablist" aria-label="协议时延">
        <button type="button" class="nv-tab active" role="tab">协议时延</button>
      </div>
    </div>
    <div class="nv-tabs-body">
      <div class="pqpl-page">
        <!-- ============ 左侧树 ============ -->
        <aside class="pqpl-sidebar">
          <div class="pqpl-tree-head"><span class="pqpl-tree-title">应用协议</span></div>
          <ul class="pqpl-tree-list">
            <li
              v-for="(item, idx) in treeItems"
              :key="item.key"
              class="pqpl-tree-item"
              :class="{ 'pqpl-tree-leaf': item.kind === 'leaf', 'pqpl-tree-group': item.kind === 'group', 'pqpl-tree-group-open': item.kind === 'group' && item.open, 'active': item.key === selectedTreeKey }"
              @click="onTreeClick(item)"
            >
              <span v-if="item.kind === 'group'" class="pqpl-tree-toggle-icon" @click.stop="toggleGroup(item)">{{ item.open ? '−' : '+' }}</span>
              <span v-else class="pqpl-tree-leaf-icon">·</span>
              <span class="pqpl-tree-label">{{ item.label }}</span>
              <ul v-show="item.kind === 'group' && item.open" class="pqpl-tree-children">
                <li
                  v-for="c in item.children"
                  :key="c.key"
                  class="pqpl-tree-item pqpl-tree-leaf"
                  :class="{ active: c.key === selectedTreeKey }"
                  @click.stop="onTreeClick(c)"
                >
                  <span class="pqpl-tree-leaf-icon">·</span>
                  <span class="pqpl-tree-label">{{ c.label }}</span>
                </li>
              </ul>
            </li>
          </ul>
        </aside>

        <!-- ============ 右侧主区 ============ -->
        <div class="pqpl-main">
          <div class="pqpl-filters">
            <label class="pqpl-field">
              <span class="ou-toolbar-label">自动刷新</span>
              <el-select v-model="autoRefresh" size="small" style="width:100px">
                <el-option label="关闭" :value="0" />
                <el-option label="5 秒" :value="5000" />
                <el-option label="10 秒" :value="10000" />
                <el-option label="30 秒" :value="30000" />
                <el-option label="60 秒" :value="60000" />
              </el-select>
            </label>
            <label class="pqpl-field">
              <span class="ou-toolbar-label">应用协议</span>
              <el-select v-model="filterProto" size="small" style="width:160px" clearable filterable>
                <el-option label="任意协议" value="" />
                <el-option v-for="p in allProtoNames" :key="p" :label="p" :value="p" />
              </el-select>
            </label>
            <label class="pqpl-field">
              <span class="ou-toolbar-label">平均时延&gt;=</span>
              <el-input-number v-model="avgLatencyMin" :min="0" :step="10" size="small" style="width:90px" controls-position="right" />
              <span class="pqpl-unit">ms</span>
            </label>
            <label class="pqpl-field">
              <span class="ou-toolbar-label">关键字搜索</span>
              <el-input v-model="keyword" size="small" placeholder="协议名" style="width:160px" clearable>
                <template #prefix><el-icon><Search /></el-icon></template>
              </el-input>
            </label>
            <label class="pqpl-field">
              <el-checkbox v-model="focusAbnormal">关注时延异常</el-checkbox>
            </label>
            <button class="ou-search-btn" @click="doSearch"><el-icon><Search /></el-icon>&nbsp;搜索</button>
            <button class="secondary td-reset-btn" @click="doReset">重置</button>
            <button class="link-btn" @click="doExport" style="margin-left:auto">⬇ 导出</button>
          </div>

          <div class="ou-table-wrap">
            <table class="ou-table pqpl-table">
              <thead>
                <tr>
                  <th style="width:50px">序号 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th>应用名称 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th class="ou-num">最大时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th class="ou-num">最小时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th class="ou-num">客户时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th class="ou-num">服务时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th class="ou-num">应用时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th class="ou-num" style="width:140px">平均时延 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th class="ou-num">当前在线 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th class="ou-num">最近新建连 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th class="ou-num">失败率 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th class="ou-num">下行速率 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th class="ou-num">上行速率 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th class="col-actions">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(r, i) in pagedRows" :key="i" @click="openDetail(r)" style="cursor:pointer">
                  <td>{{ (page - 1) * pageSize + i + 1 }}</td>
                  <td>
                    <span class="pqpl-name-link">{{ r.name }}</span>
                  </td>
                  <td class="ou-num">{{ r.maxLat }}</td>
                  <td class="ou-num">{{ r.minLat }}</td>
                  <td class="ou-num">{{ r.clientLat }}</td>
                  <td class="ou-num">{{ r.serverLat }}</td>
                  <td class="ou-num">{{ r.appLat }}</td>
                  <td class="ou-num">
                    <span class="pqpl-avg-cell">
                      <span class="pqpl-avg-track"><span class="pqpl-avg-fill" :style="{ width: Math.min(100, (r.avgLatRaw / 200) * 100) + '%' }"></span></span>
                      <span class="pqpl-avg-val">{{ r.avgLat }}</span>
                    </span>
                  </td>
                  <td class="ou-num">{{ r.online }}</td>
                  <td class="ou-num">{{ r.newConn }}</td>
                  <td class="ou-num">
                    <span :class="['pqpl-rate', r.failRate > 50 ? 'bad' : r.failRate > 20 ? 'warn' : 'ok']">{{ r.failRate }}%</span>
                  </td>
                  <td class="ou-num">{{ r.downRate }}</td>
                  <td class="ou-num">{{ r.upRate }}</td>
                  <td class="col-actions" @click.stop>
                    <button class="link-btn" @click="openDetail(r)">详情</button>
                  </td>
                </tr>
                <tr v-if="pagedRows.length === 0">
                  <td :colspan="14" class="ou-empty">无数据</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="ou-footer">
            <div class="ou-footer-left">
              <div class="ou-pager">
                <button class="ou-page-btn" :disabled="page <= 1" @click="page > 1 && page--">‹</button>
                <button v-for="pg in pageArr" :key="pg" class="ou-page-btn" :class="{ active: pg === page }" @click="page = pg">{{ pg }}</button>
                <button class="ou-page-btn" :disabled="page >= totalPages" @click="page < totalPages && page++">›</button>
              </div>
            </div>
            <div class="ou-footer-right">
              <span>共 {{ filteredRows.length }} 条</span>
              <el-select v-model="pageSize" size="small" style="width:110px">
                <el-option :value="20" label="20 条/页" />
                <el-option :value="50" label="50 条/页" />
                <el-option :value="100" label="100 条/页" />
              </el-select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 协议时延详情弹窗 ==================== -->
    <el-dialog v-model="detailVisible" :title="`协议时延 -> ${detailProto}`" width="98%" top="2vh" destroy-on-close class="pqpl-detail-dialog">
      <template #header>
        <div class="pqpl-detail-head">
          <div style="display:flex;gap:18px">
            <span v-for="t in detailTabs" :key="t.key" class="pqpl-pkt-tab" :class="{ active: detailActiveTab === t.key }" @click="detailActiveTab = t.key">{{ t.label }}</span>
          </div>
          <div v-if="detailActiveTab === 'history'" class="pqpl-history-filters">
            <label class="pqpl-field">
              <span class="ou-toolbar-label">时间范围</span>
              <el-date-picker
                v-model="historyDateRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                size="small"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width:300px"
              />
            </label>
            <label class="pqpl-field">
              <span class="ou-toolbar-label">质量时延&gt;=</span>
              <el-input-number v-model="historyMinLatency" :min="0" :step="10" size="small" style="width:80px" controls-position="right" />
            </label>
            <button class="ou-search-btn" @click="reloadHistory">搜索</button>
            <button class="secondary td-reset-btn" @click="resetHistory">重置</button>
          </div>
        </div>
      </template>

      <!-- 实时分析 -->
      <div v-if="detailActiveTab === 'realtime'" class="pqpl-rt-grid">
        <section class="pqpl-card">
          <div class="pqpl-card-head">
            <span class="pqpl-card-title">时延趋势</span>
            <span class="pqpl-card-toggles">⋯</span>
          </div>
          <div class="pqpl-card-body">
            <span class="pqpl-yunit">session#</span>
            <v-chart :option="rtLatencyTrendOption" autoresize style="width:100%;height:300px" />
            <div class="pqpl-stats">
              <span class="pqpl-stat"><b class="pqpl-stat-badge max">MAX</b>最大值 <strong>{{ rtMax }}</strong></span>
              <span class="pqpl-stat"><b class="pqpl-stat-badge min">MIN</b>最小值 <strong>{{ rtMin }}</strong></span>
              <span class="pqpl-stat"><b class="pqpl-stat-badge avg">AVG</b>平均值 <strong>{{ rtAvg }}</strong></span>
            </div>
          </div>
        </section>

        <section class="pqpl-card">
          <div class="pqpl-card-head">
            <span class="pqpl-card-title">时延分布</span>
            <span class="pqpl-card-toggles">⋯</span>
          </div>
          <div class="pqpl-card-body">
            <v-chart :option="rtPieOption" autoresize style="width:100%;height:300px" />
          </div>
        </section>

        <section class="pqpl-card">
          <div class="pqpl-card-head">
            <span class="pqpl-card-title">平均时延趋势</span>
            <span class="pqpl-card-toggles">⋯</span>
          </div>
          <div class="pqpl-card-body">
            <span class="pqpl-yunit">ms</span>
            <v-chart :option="rtAvgTrendOption" autoresize style="width:100%;height:300px" />
            <div class="pqpl-stats">
              <span class="pqpl-stat"><b class="pqpl-stat-badge max">MAX</b>最大值 <strong>{{ rtAvgMax }}</strong></span>
              <span class="pqpl-stat"><b class="pqpl-stat-badge min">MIN</b>最小值 <strong>{{ rtAvgMin }}</strong></span>
              <span class="pqpl-stat"><b class="pqpl-stat-badge avg">AVG</b>平均值 <strong>{{ rtAvgAvg }}</strong></span>
            </div>
          </div>
        </section>

        <section class="pqpl-card">
          <div class="pqpl-card-head">
            <span class="pqpl-card-title">质量源</span>
            <span class="pqpl-card-toggles">⋯</span>
          </div>
          <div class="pqpl-card-body pqpl-src-body">
            <table class="ou-table pqpl-src-table">
              <thead>
                <tr>
                  <th style="width:40px">序号</th>
                  <th>IP地址</th>
                  <th class="ou-num">总请求数</th>
                  <th class="ou-num">失败次数</th>
                  <th class="ou-num">平均时延</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(s, i) in rtSrcRows" :key="i">
                  <td>{{ i + 1 }}</td>
                  <td><span class="pqpl-ip-link" @click="openIpDetail(s.ip)">{{ s.ip }}</span></td>
                  <td class="ou-num">{{ s.total }}</td>
                  <td class="ou-num">{{ s.fail }}</td>
                  <td class="ou-num">{{ s.avg }}</td>
                </tr>
                <tr v-if="rtSrcRows.length === 0">
                  <td colspan="5" class="ou-empty">无数据</td>
                </tr>
              </tbody>
            </table>
            <div class="pqpl-src-footer">
              <div class="ou-pager">
                <button class="ou-page-btn" :disabled="rtSrcPage <= 1" @click="rtSrcPage > 1 && rtSrcPage--">‹</button>
                <button v-for="pg in rtSrcPageArr" :key="pg" class="ou-page-btn" :class="{ active: pg === rtSrcPage }" @click="rtSrcPage = pg">{{ pg }}</button>
                <button class="ou-page-btn" :disabled="rtSrcPage >= rtSrcPages" @click="rtSrcPage < rtSrcPages && rtSrcPage++">›</button>
              </div>
              <span>共 {{ rtSrcTotal }} 条</span>
            </div>
          </div>
        </section>
      </div>

      <!-- 历史分析 -->
      <div v-if="detailActiveTab === 'history'" class="pqpl-rt-grid">
        <section class="pqpl-card">
          <div class="pqpl-card-head">
            <span class="pqpl-card-title">时延趋势</span>
            <span class="pqpl-card-toggles">⋯</span>
          </div>
          <div class="pqpl-card-body">
            <span class="pqpl-yunit">session#</span>
            <v-chart :option="hdLatencyTrendOption" autoresize style="width:100%;height:300px" />
            <div class="pqpl-stats">
              <span class="pqpl-stat"><b class="pqpl-stat-badge max">MAX</b>最大值 <strong>{{ hdMax }}</strong></span>
              <span class="pqpl-stat"><b class="pqpl-stat-badge min">MIN</b>最小值 <strong>{{ hdMin }}</strong></span>
              <span class="pqpl-stat"><b class="pqpl-stat-badge avg">AVG</b>平均值 <strong>{{ hdAvg }}</strong></span>
            </div>
          </div>
        </section>

        <section class="pqpl-card">
          <div class="pqpl-card-head">
            <span class="pqpl-card-title">时延分布</span>
            <span class="pqpl-card-toggles">⋯</span>
          </div>
          <div class="pqpl-card-body">
            <v-chart :option="hdPieOption" autoresize style="width:100%;height:300px" />
          </div>
        </section>

        <section class="pqpl-card">
          <div class="pqpl-card-head">
            <span class="pqpl-card-title">平均时延趋势</span>
            <span class="pqpl-card-toggles">⋯</span>
          </div>
          <div class="pqpl-card-body">
            <span class="pqpl-yunit">ms</span>
            <v-chart :option="hdAvgTrendOption" autoresize style="width:100%;height:300px" />
            <div class="pqpl-stats">
              <span class="pqpl-stat"><b class="pqpl-stat-badge max">MAX</b>最大值 <strong>{{ hdAvgMax }}</strong></span>
              <span class="pqpl-stat"><b class="pqpl-stat-badge min">MIN</b>最小值 <strong>{{ hdAvgMin }}</strong></span>
              <span class="pqpl-stat"><b class="pqpl-stat-badge avg">AVG</b>平均值 <strong>{{ hdAvgAvg }}</strong></span>
            </div>
          </div>
        </section>

        <section class="pqpl-card">
          <div class="pqpl-card-head">
            <span class="pqpl-card-title">质量源</span>
            <span class="pqpl-card-toggles">⋯</span>
          </div>
          <div class="pqpl-card-body pqpl-src-body">
            <table class="ou-table pqpl-src-table">
              <thead>
                <tr>
                  <th style="width:40px">序号</th>
                  <th>IP地址</th>
                  <th class="ou-num">总请求数</th>
                  <th class="ou-num">失败次数</th>
                  <th class="ou-num">平均时延</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(s, i) in hdSrcRows" :key="i">
                  <td>{{ (hdSrcPage - 1) * hdSrcPageSize + i + 1 }}</td>
                  <td><span class="pqpl-ip-link" @click="openIpDetail(s.ip)">{{ s.ip }}</span></td>
                  <td class="ou-num">{{ s.total }}</td>
                  <td class="ou-num">{{ s.fail }}</td>
                  <td class="ou-num">{{ s.avg }}</td>
                </tr>
                <tr v-if="hdSrcRows.length === 0">
                  <td colspan="5" class="ou-empty">无数据</td>
                </tr>
              </tbody>
            </table>
            <div class="pqpl-src-footer">
              <div class="ou-pager">
                <button class="ou-page-btn" :disabled="hdSrcPage <= 1" @click="hdSrcPage > 1 && hdSrcPage--">‹</button>
                <button v-for="pg in hdSrcPageArr" :key="pg" class="ou-page-btn" :class="{ active: pg === hdSrcPage }" @click="hdSrcPage = pg">{{ pg }}</button>
                <button class="ou-page-btn" :disabled="hdSrcPage >= hdSrcPages" @click="hdSrcPage < hdSrcPages && hdSrcPage++">›</button>
              </div>
              <span>共 {{ hdSrcTotal }} 条</span>
            </div>
          </div>
        </section>
      </div>
    </el-dialog>

    <!-- ==================== IP详情弹窗（弹窗中的IP点击触发） ==================== -->
    <el-dialog v-model="ipDetailVisible" :title="`访问对象 -> ${ipDetailIp}`" width="80%" destroy-on-close class="pqpl-ip-detail-dialog">
      <div class="pqpl-ip-filters">
        <label class="pqpl-field">
          <span class="ou-toolbar-label">关键字</span>
          <el-input v-model="ipDetailKeyword" size="small" placeholder="对象关键字" style="width:200px" clearable>
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </label>
        <label class="pqpl-field">
          <span class="ou-toolbar-label">平均时延&gt;=</span>
          <el-input-number v-model="ipDetailMinLat" :min="0" :step="10" size="small" style="width:80px" controls-position="right" />
          <span class="pqpl-unit">ms</span>
        </label>
        <label class="pqpl-field">
          <el-checkbox v-model="ipDetailFailedOnly">仅显示失败</el-checkbox>
        </label>
        <button class="ou-search-btn" @click="reloadIpDetail">搜索</button>
        <button class="secondary td-reset-btn" @click="resetIpDetail">重置</button>
      </div>

      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:12px 0">
        <div class="pqpl-ip-stat"><div class="pqpl-ip-stat-label">总请求数</div><div class="pqpl-ip-stat-val">{{ ipStatTotal }}</div></div>
        <div class="pqpl-ip-stat"><div class="pqpl-ip-stat-label">失败次数</div><div class="pqpl-ip-stat-val">{{ ipStatFail }}</div></div>
        <div class="pqpl-ip-stat"><div class="pqpl-ip-stat-label">平均时延</div><div class="pqpl-ip-stat-val">{{ ipStatAvg }} ms</div></div>
        <div class="pqpl-ip-stat"><div class="pqpl-ip-stat-label">失败率</div><div class="pqpl-ip-stat-val">{{ ipStatFailRate }}%</div></div>
      </div>

      <div style="margin-bottom:10px">
        <v-chart :option="ipDetailChartOption" autoresize style="width:100%;height:240px" />
      </div>

      <table class="ou-table">
        <thead>
          <tr>
            <th style="width:40px">序号</th>
            <th>目标</th>
            <th class="ou-num">总请求数</th>
            <th class="ou-num">失败次数</th>
            <th class="ou-num">平均时延</th>
            <th class="col-actions">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(r, i) in pagedIpDetailRows" :key="i">
            <td>{{ (ipDetailPage - 1) * ipDetailPageSize + i + 1 }}</td>
            <td><span class="pqpl-ip-link">{{ r.target }}</span></td>
            <td class="ou-num">{{ r.total }}</td>
            <td class="ou-num">{{ r.fail }}</td>
            <td class="ou-num">
              <span :class="['pqpl-rate', r.avgRaw > 200 ? 'bad' : r.avgRaw > 80 ? 'warn' : 'ok']">{{ r.avg }}</span>
            </td>
            <td class="col-actions">
              <button class="link-btn" @click="openSessionDiag(r.target)">会话诊断</button>
            </td>
          </tr>
          <tr v-if="pagedIpDetailRows.length === 0">
            <td colspan="6" class="ou-empty">无数据</td>
          </tr>
        </tbody>
      </table>
      <div class="ou-footer" style="margin-top:8px">
        <div class="ou-pager">
          <button class="ou-page-btn" :disabled="ipDetailPage <= 1" @click="ipDetailPage > 1 && ipDetailPage--">‹</button>
          <button v-for="pg in ipDetailPageArr" :key="pg" class="ou-page-btn" :class="{ active: pg === ipDetailPage }" @click="ipDetailPage = pg">{{ pg }}</button>
          <button class="ou-page-btn" :disabled="ipDetailPage >= ipDetailPages" @click="ipDetailPage < ipDetailPages && ipDetailPage++">›</button>
        </div>
        <span>共 {{ filteredIpDetailRows.length }} 条</span>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, PieChart, BarChart } from 'echarts/charts'
import {
  TitleComponent, TooltipComponent, LegendComponent, GridComponent
} from 'echarts/components'
import { ElMessage } from 'element-plus'
import { Search, Sort } from '@element-plus/icons-vue'
import './nv-shared.css'

use([CanvasRenderer, LineChart, PieChart, BarChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent])

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
  { key: 'any', label: '任意协议', kind: 'leaf' },
  { key: 'unknown', label: '未知应用', kind: 'leaf' },
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
  { key: 'g_common', label: '常用协议', kind: 'group', open: false, children: [
    { key: 'DNS', label: 'DNS', kind: 'leaf' },
    { key: 'SSH', label: 'SSH', kind: 'leaf' },
    { key: 'FTP', label: 'FTP', kind: 'leaf' },
    { key: 'SMTP', label: 'SMTP', kind: 'leaf' },
    { key: 'POP3', label: 'POP3', kind: 'leaf' },
    { key: 'IMAP', label: 'IMAP', kind: 'leaf' },
    { key: 'Telnet', label: 'Telnet', kind: 'leaf' },
    { key: 'RDP', label: 'RDP', kind: 'leaf' },
    { key: 'ICMP', label: 'ICMP', kind: 'leaf' },
    { key: 'NTP', label: 'NTP', kind: 'leaf' },
  ]},
  { key: 'g_p2p', label: 'P2P下载', kind: 'group', open: false, children: [
    { key: 'BitTorrent', label: 'BitTorrent', kind: 'leaf' },
    { key: 'eMule', label: 'eMule', kind: 'leaf' },
    { key: '迅雷下载', label: '迅雷下载', kind: 'leaf' },
    { key: '百度网盘', label: '百度网盘', kind: 'leaf' },
  ]},
  { key: 'g_dh', label: '电话电邮', kind: 'group', open: false, children: [] },
  { key: 'g_im', label: '即时通讯', kind: 'group', open: false, children: [] },
  { key: 'g_media', label: '流媒体', kind: 'group', open: false, children: [] },
  { key: 'g_business', label: '商业系统', kind: 'group', open: false, children: [
    { key: 'MySQL', label: 'MySQL', kind: 'leaf' },
    { key: 'Redis', label: 'Redis', kind: 'leaf' },
  ]},
  { key: 'g_game', label: '网络游戏', kind: 'group', open: false, children: [] },
  { key: 'g_other', label: '其它', kind: 'group', open: false, children: [
    { key: '其它HTTPS', label: '其它HTTPS', kind: 'leaf' },
    { key: '其它TCP', label: '其它TCP', kind: 'leaf' },
  ]},
  { key: 'g_unk', label: '未知协议', kind: 'group', open: false, children: [] },
  { key: 'custom', label: '自定义协议', kind: 'leaf' },
])

const selectedTreeKey = ref('any')

function isGroup(item: TreeItem): item is TreeGroup { return item.kind === 'group' }

function toggleGroup(item: TreeItem) {
  if (isGroup(item)) item.open = !item.open
}

function onTreeClick(item: TreeItem) {
  selectedTreeKey.value = item.key
  filterProto.value = item.key
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
const autoRefresh = ref<number>(10000)
const filterProto = ref<string>('')
const avgLatencyMin = ref<number>(0)
const keyword = ref('')
const focusAbnormal = ref(false)

function doSearch() { page.value = 1 }
function doReset() {
  autoRefresh.value = 10000
  filterProto.value = ''
  avgLatencyMin.value = 0
  keyword.value = ''
  focusAbnormal.value = false
  selectedTreeKey.value = 'any'
  page.value = 1
}
function doExport() { ElMessage.info('导出（Mock）') }

// ══════════════════════════════════════════════════════════════
// 表格数据
// ═══════════════════════════════════════════════════════════
interface ProtoRow {
  name: string
  maxLat: string; minLat: string; clientLat: string; serverLat: string; appLat: string; avgLat: string; avgLatRaw: number
  online: string; newConn: string; failRate: number; downRate: string; upRate: string
}

const allProtoRows: ProtoRow[] = [
  { name: 'SYN_ACK', maxLat: '11111.081', minLat: '0.001', clientLat: '61.744', serverLat: '7.91', appLat: '62.356', avgLat: '62.881', avgLatRaw: 62.881, online: '402899', newConn: '1980800', failRate: 92.6, downRate: '3.02 M', upRate: '4.30 M' },
  { name: '其它HTTPS', maxLat: '10472.377', minLat: '0.001', clientLat: '67.4', serverLat: '15.696', appLat: '94.938', avgLat: '95.379', avgLatRaw: 95.379, online: '117772', newConn: '981650', failRate: 63.6, downRate: '31.52 G', upRate: '947.23 M' },
  { name: 'WWW', maxLat: '10099.716', minLat: '0.002', clientLat: '11.691', serverLat: '4.917', appLat: '56.211', avgLat: '56.311', avgLatRaw: 56.311, online: '14543', newConn: '292927', failRate: 44.3, downRate: '2.30 G', upRate: '12.79 M' },
  { name: '其它下载', maxLat: '9236.872', minLat: '0.001', clientLat: '55.382', serverLat: '26.355', appLat: '107.802', avgLat: '140.827', avgLatRaw: 140.827, online: '4731', newConn: '76010', failRate: 74.6, downRate: '791.13 M', upRate: '36.51 M' },
  { name: 'Redis', maxLat: '1001.491', minLat: '0.021', clientLat: '0.37', serverLat: '0.069', appLat: '0.719', avgLat: '0.84', avgLatRaw: 0.84, online: '1530', newConn: '70454', failRate: 6.2, downRate: '1.35 M', upRate: '3.22 M' },
  { name: '未知应用', maxLat: '9281.173', minLat: '0.043', clientLat: '18.388', serverLat: '4.568', appLat: '65.057', avgLat: '63.676', avgLatRaw: 63.676, online: '17657', newConn: '39067', failRate: 51.3, downRate: '204.80 M', upRate: '7.33 M' },
  { name: '其它HTTP上传', maxLat: '10286.961', minLat: '0.007', clientLat: '6.919', serverLat: '3.129', appLat: '123.569', avgLat: '62.088', avgLatRaw: 62.088, online: '1165', newConn: '34826', failRate: 4.2, downRate: '25.54 M', upRate: '1.30 M' },
  { name: 'IMAP', maxLat: '9162.591', minLat: '0.012', clientLat: '144.949', serverLat: '1.253', appLat: '145.98', avgLat: '287.344', avgLatRaw: 287.344, online: '6203', newConn: '19720', failRate: 5.1, downRate: '36.79 M', upRate: '27.54 M' },
  { name: 'MSDS', maxLat: '320.216', minLat: '0.001', clientLat: '0.211', serverLat: '0.211', appLat: '18.005', avgLat: '22.379', avgLatRaw: 22.379, online: '104', newConn: '9476', failRate: 86.3, downRate: '4.09 K', upRate: '8.90 K' },
  { name: 'SMTP', maxLat: '9733.08', minLat: '0.039', clientLat: '138.911', serverLat: '5.567', appLat: '415.169', avgLat: '885.713', avgLatRaw: 885.713, online: '426', newConn: '9083', failRate: 9.4, downRate: '759.29 K', upRate: '12.37 M' },
  { name: 'NETBIOS', maxLat: '217.457', minLat: '0.021', clientLat: '0.23', serverLat: '0.23', appLat: '29.256', avgLat: '20.406', avgLatRaw: 20.406, online: '120', newConn: '8889', failRate: 93.5, downRate: '3.24 K', upRate: '6.71 M' },
  { name: 'HTTPS传传输', maxLat: '9013.881', minLat: '6.638', clientLat: '33.476', serverLat: '28.322', appLat: '120.997', avgLat: '188.091', avgLatRaw: 188.091, online: '458', newConn: '6153', failRate: 74, downRate: '5.94 M', upRate: '788.46 K' },
  { name: '为卡下载', maxLat: '9199.381', minLat: '0.019', clientLat: '89.59', serverLat: '1.845', appLat: '96.893', avgLat: '112.793', avgLatRaw: 112.793, online: '183', newConn: '5019', failRate: 8.2, downRate: '66.55 M', upRate: '1.82 M' },
  { name: '网页浏览', maxLat: '7448.666', minLat: '3.355', clientLat: '0.367', serverLat: '12.949', appLat: '38.608', avgLat: '136.929', avgLatRaw: 136.929, online: '307', newConn: '4980', failRate: 0.2, downRate: '66.63 K', upRate: '305.04 K' },
  { name: '论坛ms', maxLat: '8494.628', minLat: '1.158', clientLat: '34.188', serverLat: '30.657', appLat: '156.985', avgLat: '421.185', avgLatRaw: 421.185, online: '509', newConn: '2136', failRate: 96, downRate: '1.58 G', upRate: '41.77 M' },
  { name: '海淘类公', maxLat: '1030.341', minLat: '1.119', clientLat: '2.695', serverLat: '1.911', appLat: '46.478', avgLat: '40.811', avgLatRaw: 40.811, online: '40', newConn: '1586', failRate: 4, downRate: '13.72 K', upRate: '16.01 K' },
  { name: 'SSH', maxLat: '7145.094', minLat: '0.529', clientLat: '45.578', serverLat: '13.447', appLat: '231.382', avgLat: '237.025', avgLatRaw: 237.025, online: '105', newConn: '1626', failRate: 4.1, downRate: '951.42 K', upRate: '471.32 K' },
  { name: 'IPInfo', maxLat: '9157.391', minLat: '0.444', clientLat: '27.766', serverLat: '0.439', appLat: '124.535', avgLat: '92.198', avgLatRaw: 92.198, online: '37', newConn: '1515', failRate: 7.8, downRate: '123.96 K', upRate: '28.68 K' },
  { name: 'POP3', maxLat: '7772.276', minLat: '0.947', clientLat: '73.386', serverLat: '0.865', appLat: '114.514', avgLat: '179.768', avgLatRaw: 179.768, online: '54', newConn: '1510', failRate: 4.9, downRate: '4.23 M', upRate: '766.89 K' },
  { name: 'NFS', maxLat: '0 ms', minLat: '0 ms', clientLat: '0 ms', serverLat: '0 ms', appLat: '0 ms', avgLat: '0', avgLatRaw: 0, online: '35', newConn: '1483', failRate: 100, downRate: '2.24 K', upRate: '2.96 K' },
  { name: '其它Web传', maxLat: '1005.783', minLat: '0.616', clientLat: '5.606', serverLat: '0.172', appLat: '26.342', avgLat: '9.478', avgLatRaw: 9.478, online: '147', newConn: '1470', failRate: 5, downRate: '38.94 M', upRate: '819.55 K' },
  { name: '企业微信', maxLat: '1101.946', minLat: '2.717', clientLat: '0.698', serverLat: '45.386', appLat: '52.057', avgLat: '134.279', avgLatRaw: 134.279, online: '43', newConn: '1250', failRate: 5.6, downRate: '203.98 K', upRate: '176.39 K' },
  { name: '绿头属大', maxLat: '9008.994', minLat: '2.636', clientLat: '3.641', serverLat: '41.729', appLat: '131.819', avgLat: '135.43', avgLatRaw: 135.43, online: '62', newConn: '1120', failRate: 0.7, downRate: '189.90 K', upRate: '68.02 K' },
  { name: 'Android', maxLat: '9376.228', minLat: '0.606', clientLat: '30.597', serverLat: '0.188', appLat: '119.269', avgLat: '179.987', avgLatRaw: 179.987, online: '60', newConn: '666', failRate: 3.6, downRate: '96.53 K', upRate: '15.13 K' },
  { name: 'Cross', maxLat: '1128.079', minLat: '0.807', clientLat: '0.308', serverLat: '0.208', appLat: '36.591', avgLat: '88.325', avgLatRaw: 88.325, online: '108', newConn: '601', failRate: 0.4, downRate: '48.16 K', upRate: '46.99 K' },
  { name: 'HTTP代理', maxLat: '3424.4', minLat: '25.985', clientLat: '31.333', serverLat: '14.687', appLat: '135.69', avgLat: '153.492', avgLatRaw: 153.492, online: '34', newConn: '568', failRate: 81.1, downRate: '366', upRate: '264' },
  { name: '未知下载口', maxLat: '666.768', minLat: '0.001', clientLat: '15.654', serverLat: '1.264', appLat: '20.696', avgLat: '15.974', avgLatRaw: 15.974, online: '120', newConn: '507', failRate: 63.9, downRate: '17.64 M', upRate: '6.30 K' },
  { name: '录音', maxLat: '7202.279', minLat: '0.391', clientLat: '0.319', serverLat: '10.039', appLat: '23.827', avgLat: '63.608', avgLatRaw: 63.608, online: '7', newConn: '530', failRate: 4.3, downRate: '11.22 K', upRate: '2.92 K' },
  { name: 'WhatsApp', maxLat: '1148.376', minLat: '13.541', clientLat: '67.352', serverLat: '0.068', appLat: '77.831', avgLat: '100.785', avgLatRaw: 100.785, online: '26', newConn: '458', failRate: 6.3, downRate: '86.69 K', upRate: '26.27 K' },
  { name: 'MySQL', maxLat: '12.253', minLat: '1.554', clientLat: '0.365', serverLat: '3.168', appLat: '4.308', avgLat: '6.902', avgLatRaw: 6.902, online: '1046', newConn: '421', failRate: 3.3, downRate: '116.53 M', upRate: '685.21 K' },
  { name: '旅游', maxLat: '3145.012', minLat: '5.631', clientLat: '0.152', serverLat: '40.674', appLat: '127.931', avgLat: '178.7', avgLatRaw: 178.7, online: '3', newConn: '306', failRate: 2.4, downRate: '0', upRate: '0' },
]

const filteredRows = computed(() => {
  let rows = allProtoRows
  if (filterProto.value) {
    const k = filterProto.value
    rows = rows.filter(r => r.name === k || r.name.includes(k))
  }
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    rows = rows.filter(r => r.name.toLowerCase().includes(kw))
  }
  if (avgLatencyMin.value > 0) {
    rows = rows.filter(r => r.avgLatRaw >= avgLatencyMin.value)
  }
  if (focusAbnormal.value) {
    rows = rows.filter(r => r.avgLatRaw > 100 || r.failRate > 50)
  }
  return rows
})

const page = ref(1)
const pageSize = ref(20)
const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / pageSize.value)))
const pageArr = computed(() => {
  const total = totalPages.value
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  const cur = page.value
  const arr: number[] = []
  for (let i = 1; i <= Math.min(3, total); i++) arr.push(i)
  if (total > 4) arr.push(total)
  return arr
})
const pagedRows = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredRows.value.slice(start, start + pageSize.value)
})

// ══════════════════════════════════════════════════════════════
// 协议详情弹窗
// ═══════════════════════════════════════════════════════════
const detailVisible = ref(false)
const detailProto = ref('')
const detailActiveTab = ref<'realtime' | 'history'>('realtime')
const detailTabs = [
  { key: 'realtime', label: '实时分析' },
  { key: 'history', label: '历史分析' },
]

// 实时-时延趋势
const rtMax = ref('1027481')
const rtMin = ref('329686')
const rtAvg = ref('590462')
const rtLatencyTrendOption = computed(() => buildStackedLatencyOption('15:55', '16:55', [8000, 4000, 1200, 800, 600, 400, 250, 200, 150, 100, 50, 30]))
const rtPieOption = computed(() => buildPieOption([
  { value: 2.61, name: '[0,5)', color: '#5470c6' },
  { value: 0.33, name: '[5,10)', color: '#91cc75' },
  { value: 0.22, name: '[10,20)', color: '#fac858' },
  { value: 1.91, name: '[20,30)', color: '#ee6666' },
  { value: 4.38, name: '[30,40)', color: '#73c0de' },
  { value: 3.51, name: '[40,50)', color: '#3ba272' },
  { value: 4.35, name: '[50,60)', color: '#fc8452' },
  { value: 0.75, name: '[60,80)', color: '#9a60b4' },
  { value: 0.27, name: '[80,120)', color: '#ea7ccc' },
  { value: 0.77, name: '>=200', color: '#c1232b' },
  { value: 80.31, name: '无应答', color: '#d0d0d0' },
]))
const rtAvgMax = ref('79.870')
const rtAvgMin = ref('52.69')
const rtAvgAvg = ref('61ms')
const rtAvgTrendOption = computed(() => buildAvgTrendOption('15:55', '16:55', [60, 65, 62, 70, 75, 60, 65, 58, 55, 60, 62, 58, 60, 65, 62, 64]))
const rtSrcRows = ref([
  { ip: '166.111.6.64', total: '34738', fail: '34733', avg: '250.66' },
  { ip: '166.111.6.66', total: '26101', fail: '26100', avg: '174.00' },
  { ip: '101.6.14.166', total: '5926', fail: '5926', avg: '-' },
  { ip: '101.6.6.80', total: '2854', fail: '2854', avg: '-' },
  { ip: '240e:370:4610:466d:...', total: '2833', fail: '2833', avg: '-' },
  { ip: '113.120.243.171', total: '2670', fail: '2670', avg: '-' },
])
const rtSrcPage = ref(1)
const rtSrcPageSize = ref(5)
const rtSrcTotal = ref(150)
const rtSrcPages = computed(() => Math.max(1, Math.ceil(rtSrcTotal.value / rtSrcPageSize.value)))
const rtSrcPageArr = computed(() => {
  const total = rtSrcPages.value
  const cur = rtSrcPage.value
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  const arr: number[] = []
  for (let i = 1; i <= 5; i++) arr.push(i)
  if (total > 6) arr.push(total)
  return arr
})

// 历史
const historyDateRange = ref<[string, string]>(['2026-07-16 15:55:56', '2026-07-16 16:10:56'])
const historyMinLatency = ref(0)
const hdMax = ref('106871')
const hdMin = ref('35723')
const hdAvg = ref('86713')
const hdLatencyTrendOption = computed(() => buildStackedLatencyOption('15:56', '16:10', [60, 50, 55, 45, 60, 40, 55, 50, 45, 60, 50, 55, 45, 40, 55]))
const hdPieOption = computed(() => buildPieOption([
  { value: 0, name: '[0,5)', color: '#5470c6' },
  { value: 0, name: '[5,10)', color: '#91cc75' },
  { value: 0, name: '[10,20)', color: '#fac858' },
  { value: 0, name: '[20,30)', color: '#ee6666' },
  { value: 0, name: '[30,40)', color: '#73c0de' },
  { value: 0, name: '[40,50)', color: '#3ba272' },
  { value: 0, name: '[50,60)', color: '#fc8452' },
  { value: 0, name: '[60,80)', color: '#9a60b4' },
  { value: 0, name: '[80,120)', color: '#ea7ccc' },
  { value: 0, name: '>=200', color: '#c1232b' },
  { value: 100, name: '无应答', color: '#d0d0d0' },
]))
const hdAvgMax = ref('147.27ms')
const hdAvgMin = ref('72.98ms')
const hdAvgAvg = ref('113ms')
const hdAvgTrendOption = computed(() => buildAvgTrendOption('15:56', '16:10', [85, 75, 80, 95, 110, 100, 120, 105, 130, 115, 110, 100, 95, 105, 135]))
const hdSrcRows = ref([
  { ip: '166.111.6.64', total: '477655', fail: '477655', avg: '-' },
  { ip: '166.111.6.66', total: '456985', fail: '456985', avg: '-' },
  { ip: '101.6.14.166', total: '23262', fail: '23262', avg: '-' },
  { ip: '101.6.6.80', total: '12131', fail: '12131', avg: '-' },
  { ip: '113.120.243.171', total: '9971', fail: '9971', avg: '-' },
  { ip: '160.119.76.43', total: '9618', fail: '9618', avg: '-' },
])
const hdSrcPage = ref(1)
const hdSrcPageSize = ref(5)
const hdSrcTotal = ref(238)
const hdSrcPages = computed(() => Math.max(1, Math.ceil(hdSrcTotal.value / hdSrcPageSize.value)))
const hdSrcPageArr = computed(() => {
  const total = hdSrcPages.value
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  const arr: number[] = []
  for (let i = 1; i <= 5; i++) arr.push(i)
  if (total > 6) arr.push(total)
  return arr
})

function reloadHistory() { ElMessage.success('历史数据已刷新（Mock）') }
function resetHistory() {
  historyDateRange.value = ['2026-07-16 15:55:56', '2026-07-16 16:10:56']
  historyMinLatency.value = 0
}

function openDetail(row: ProtoRow) {
  detailProto.value = row.name
  detailActiveTab.value = 'realtime'
  detailVisible.value = true
}

// ══════════════════════════════════════════════════════════════
// 弹窗中的IP详情
// ═══════════════════════════════════════════════════════════
const ipDetailVisible = ref(false)
const ipDetailIp = ref('')
const ipDetailKeyword = ref('')
const ipDetailMinLat = ref(0)
const ipDetailFailedOnly = ref(false)
const ipDetailPage = ref(1)
const ipDetailPageSize = ref(10)
const ipDetailAllRows = ref<{ target: string; total: number; fail: number; avg: string; avgRaw: number }[]>([])

const filteredIpDetailRows = computed(() => {
  let rows = ipDetailAllRows.value
  if (ipDetailKeyword.value) {
    const kw = ipDetailKeyword.value.toLowerCase()
    rows = rows.filter(r => r.target.toLowerCase().includes(kw))
  }
  if (ipDetailMinLat.value > 0) {
    rows = rows.filter(r => r.avgRaw >= ipDetailMinLat.value)
  }
  if (ipDetailFailedOnly.value) {
    rows = rows.filter(r => r.fail > 0)
  }
  return rows
})
const ipDetailPages = computed(() => Math.max(1, Math.ceil(filteredIpDetailRows.value.length / ipDetailPageSize.value)))
const ipDetailPageArr = computed(() => {
  const total = ipDetailPages.value
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  const cur = ipDetailPage.value
  const arr: number[] = []
  for (let i = 1; i <= 3; i++) arr.push(i)
  if (total > 4) arr.push(total)
  return arr
})
const pagedIpDetailRows = computed(() => {
  const start = (ipDetailPage.value - 1) * ipDetailPageSize.value
  return filteredIpDetailRows.value.slice(start, start + ipDetailPageSize.value)
})
const ipStatTotal = ref(0)
const ipStatFail = ref(0)
const ipStatAvg = ref('0')
const ipStatFailRate = ref(0)
const ipDetailChartOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { data: ['总请求数', '失败次数'], bottom: 0, textStyle: { fontSize: 11 } },
  grid: { left: 50, right: 20, top: 20, bottom: 40 },
  xAxis: { type: 'category', data: ['00:00','02:00','04:00','06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'], axisLabel: { fontSize: 10 } },
  yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
  series: [
    { name: '总请求数', type: 'bar', itemStyle: { color: '#409eff' }, data: [120, 240, 180, 320, 280, 350, 290, 410, 380, 320, 260, 200] },
    { name: '失败次数', type: 'line', smooth: true, symbol: 'none', itemStyle: { color: '#f56c6c' }, data: [40, 100, 60, 130, 110, 145, 120, 165, 152, 130, 100, 80] },
  ],
}))

function openIpDetail(ip: string) {
  ipDetailIp.value = ip
  ipDetailKeyword.value = ''
  ipDetailMinLat.value = 0
  ipDetailFailedOnly.value = false
  ipDetailPage.value = 1
  ipDetailAllRows.value = buildIpDetailRows(ip, 38)
  const rows = ipDetailAllRows.value
  ipStatTotal.value = rows.reduce((s, r) => s + r.total, 0)
  ipStatFail.value = rows.reduce((s, r) => s + r.fail, 0)
  const latSum = rows.reduce((s, r) => s + r.avgRaw, 0)
  ipStatAvg.value = (latSum / Math.max(1, rows.length)).toFixed(2)
  ipStatFailRate.value = ipStatTotal.value === 0 ? 0 : +(ipStatFail.value / ipStatTotal.value * 100).toFixed(2)
  ipDetailVisible.value = true
}

function buildIpDetailRows(ip: string, count: number) {
  const rows: { target: string; total: number; fail: number; avg: string; avgRaw: number }[] = []
  for (let i = 0; i < count; i++) {
    const total = 50 + Math.floor(Math.random() * 4000)
    const fail = Math.random() > 0.4 ? Math.floor(total * (0.3 + Math.random() * 0.5)) : 0
    const avgRaw = Math.round(40 + Math.random() * 300)
    rows.push({
      target: `${ip.split('.').slice(0, 2).join('.')}.${(Math.random() * 255 | 0)}.${(Math.random() * 255 | 0)}`,
      total, fail,
      avg: fail === 0 ? `${avgRaw}.${(Math.random() * 99 | 0).toString().padStart(2, '0')}` : '-',
      avgRaw: fail === 0 ? avgRaw : 0,
    })
  }
  return rows
}

function reloadIpDetail() { ipDetailPage.value = 1; ElMessage.success('IP详情已刷新（Mock）') }
function resetIpDetail() {
  ipDetailKeyword.value = ''
  ipDetailMinLat.value = 0
  ipDetailFailedOnly.value = false
  ipDetailPage.value = 1
}

function openSessionDiag(target: string) {
  ElMessage.info(`打开会话诊断：${target}（Mock）`)
}

// ══════════════════════════════════════════════════════════════
// 通用图表构造函数
// ═══════════════════════════════════════════════════════════
function buildStackedLatencyOption(start: string, end: string, base: number[]): any {
  const x: string[] = []
  const startH = parseInt(start.split(':')[0])
  const startM = parseInt(start.split(':')[1])
  const endH = parseInt(end.split(':')[0])
  const endM = parseInt(end.split(':')[1])
  for (let h = startH; h <= endH; h++) {
    for (let m = 0; m < 60; m += 5) {
      if (h === startH && m < startM) continue
      if (h === endH && m > endM) continue
      x.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }
  const len = x.length
  const b = base
  const make = (idx: number, baseV: number) => Array.from({ length: len }, (_, i) => Math.round(baseV + Math.sin(i / 6 + idx) * baseV * 0.3 + (i % 5) * 5))
  return {
    tooltip: { trigger: 'axis' },
    legend: { data: ['[0,5)', '[5,10)', '[10,20)', '[20,30)', '[30,40)', '[40,50)', '[50,60)', '[60,80)', '[80,120)', '[120,200)', '>=200', '无应答'], bottom: 0, textStyle: { fontSize: 9 }, itemWidth: 10, itemHeight: 6 },
    grid: { left: 50, right: 20, top: 14, bottom: 40 },
    xAxis: { type: 'category', data: x, axisLabel: { fontSize: 9, rotate: 30 } },
    yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
    series: [
      { name: '[0,5)', type: 'line', stack: 'T', smooth: true, symbol: 'none', itemStyle: { color: '#5470c6' }, areaStyle: { color: '#5470c6', opacity: 0.7 }, data: make(0, b[0]) },
      { name: '[5,10)', type: 'line', stack: 'T', smooth: true, symbol: 'none', itemStyle: { color: '#91cc75' }, areaStyle: { color: '#91cc75', opacity: 0.7 }, data: make(1, b[1]) },
      { name: '[10,20)', type: 'line', stack: 'T', smooth: true, symbol: 'none', itemStyle: { color: '#fac858' }, areaStyle: { color: '#fac858', opacity: 0.7 }, data: make(2, b[2]) },
      { name: '[20,30)', type: 'line', stack: 'T', smooth: true, symbol: 'none', itemStyle: { color: '#ee6666' }, areaStyle: { color: '#ee6666', opacity: 0.7 }, data: make(3, b[3]) },
      { name: '[30,40)', type: 'line', stack: 'T', smooth: true, symbol: 'none', itemStyle: { color: '#73c0de' }, areaStyle: { color: '#73c0de', opacity: 0.7 }, data: make(4, b[4]) },
      { name: '[40,50)', type: 'line', stack: 'T', smooth: true, symbol: 'none', itemStyle: { color: '#3ba272' }, areaStyle: { color: '#3ba272', opacity: 0.7 }, data: make(5, b[5]) },
      { name: '[50,60)', type: 'line', stack: 'T', smooth: true, symbol: 'none', itemStyle: { color: '#fc8452' }, areaStyle: { color: '#fc8452', opacity: 0.7 }, data: make(6, b[6]) },
      { name: '[60,80)', type: 'line', stack: 'T', smooth: true, symbol: 'none', itemStyle: { color: '#9a60b4' }, areaStyle: { color: '#9a60b4', opacity: 0.7 }, data: make(7, b[7]) },
      { name: '[80,120)', type: 'line', stack: 'T', smooth: true, symbol: 'none', itemStyle: { color: '#ea7ccc' }, areaStyle: { color: '#ea7ccc', opacity: 0.7 }, data: make(8, b[8]) },
      { name: '[120,200)', type: 'line', stack: 'T', smooth: true, symbol: 'none', itemStyle: { color: '#c1232b' }, areaStyle: { color: '#c1232b', opacity: 0.7 }, data: make(9, b[9]) },
      { name: '>=200', type: 'line', stack: 'T', smooth: true, symbol: 'none', itemStyle: { color: '#9bca63' }, areaStyle: { color: '#9bca63', opacity: 0.7 }, data: make(10, b[10]) },
      { name: '无应答', type: 'line', stack: 'T', smooth: true, symbol: 'none', itemStyle: { color: '#d0d0d0' }, areaStyle: { color: '#d0d0d0', opacity: 0.7 }, data: make(11, b[11]) },
    ],
  }
}

function buildPieOption(data: { value: number; name: string; color: string }[]): any {
  return {
    tooltip: { trigger: 'item', formatter: '{b}: {c}%' },
    legend: { orient: 'vertical', right: 6, top: 'center', textStyle: { fontSize: 10 }, itemWidth: 10, itemHeight: 6 },
    series: [{
      type: 'pie', radius: ['40%', '70%'], center: ['35%', '50%'], label: { show: false },
      data: data.map(d => ({ value: d.value, name: d.name, itemStyle: { color: d.color } })),
    }],
  }
}

function buildAvgTrendOption(start: string, end: string, data: number[]): any {
  const x: string[] = []
  const startH = parseInt(start.split(':')[0])
  const startM = parseInt(start.split(':')[1])
  const endH = parseInt(end.split(':')[0])
  const endM = parseInt(end.split(':')[1])
  for (let h = startH; h <= endH; h++) {
    for (let m = 0; m < 60; m += 5) {
      if (h === startH && m < startM) continue
      if (h === endH && m > endM) continue
      x.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }
  const series = data.length >= x.length ? data.slice(0, x.length) : [...data, ...Array(x.length - data.length).fill(data[data.length - 1] || 60)]
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: 50, right: 20, top: 14, bottom: 30 },
    xAxis: { type: 'category', data: x, axisLabel: { fontSize: 9, rotate: 30 } },
    yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
    series: [{ type: 'line', smooth: true, symbol: 'none', itemStyle: { color: '#409eff' }, data: series }],
  }
}
</script>

<style scoped>
.pqpl-page { display:flex; height:100%; }
.pqpl-sidebar { width:220px; min-width:220px; border-right:1px solid #ebeef5; overflow-y:auto; padding:6px 0; font-size:13px; background:#fafbfc; }
.pqpl-tree-head { padding:8px 14px; font-weight:600; color:#303133; border-bottom:1px solid #ebeef5; margin-bottom:6px; background:#fff; }
.pqpl-tree-title { font-size:13px; }
.pqpl-tree-list { list-style:none; padding:0; margin:0; }
.pqpl-tree-item { list-style:none; padding:4px 14px 4px 24px; cursor:pointer; color:#606266; line-height:1.7; position:relative; }
.pqpl-tree-item:hover { background:#f0f7ff; }
.pqpl-tree-item.active { background:#ecf5ff; color:#409eff; }
.pqpl-tree-item.active .pqpl-tree-label { color:#409eff; font-weight:500; }
.pqpl-tree-leaf-icon { display:inline-block; width:12px; color:#c0c4cc; }
.pqpl-tree-toggle-icon { position:absolute; left:8px; top:4px; display:inline-block; width:14px; text-align:center; color:#909399; user-select:none; }
.pqpl-tree-label { font-size:13px; }
.pqpl-tree-children { list-style:none; padding-left:14px; margin:0; }
.pqpl-tree-children .pqpl-tree-item { padding-left:24px; }

.pqpl-main { flex:1; min-width:0; display:flex; flex-direction:column; overflow:hidden; }
.pqpl-filters { display:flex; align-items:center; gap:10px; padding:10px 14px; border-bottom:1px solid #ebeef5; flex-wrap:wrap; }
.pqpl-field { display:inline-flex; align-items:center; gap:6px; }
.pqpl-unit { font-size:12px; color:#909399; }

.pqpl-table th, .pqpl-table td { font-size:12px; padding:6px 10px; }
.pqpl-name-link { color:#409eff; cursor:pointer; }
.pqpl-name-link:hover { text-decoration:underline; }
.pqpl-avg-cell { display:flex; align-items:center; gap:6px; }
.pqpl-avg-track { flex:1; height:8px; background:#f0f9eb; border-radius:4px; overflow:hidden; min-width:40px; }
.pqpl-avg-fill { display:block; height:100%; background:#67c23a; border-radius:4px; }
.pqpl-avg-val { font-variant-numeric:tabular-nums; min-width:60px; text-align:right; font-size:11px; }
.pqpl-rate { display:inline-block; padding:1px 6px; border-radius:2px; font-size:11px; font-weight:600; font-variant-numeric:tabular-nums; }
.pqpl-rate.ok { background:#f0f9eb; color:#67c23a; }
.pqpl-rate.warn { background:#fdf6ec; color:#e6a23c; }
.pqpl-rate.bad { background:#fef0f0; color:#f56c6c; }
.col-actions { width:80px; text-align:center; }
.sort-icon { font-size:10px; color:#c0c4cc; vertical-align:middle; margin-left:2px; }

/* 协议详情弹窗 */
.pqpl-detail-head { display:flex; align-items:center; justify-content:space-between; width:100%; padding-right:16px; gap:12px; }
.pqpl-pkt-tab { font-size:14px; cursor:pointer; padding-bottom:6px; border-bottom:2px solid transparent; color:#909399; }
.pqpl-pkt-tab.active { color:#409eff; border-color:#409eff; font-weight:500; }
.pqpl-history-filters { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.pqpl-rt-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.pqpl-card { background:#fff; border:1px solid #ebeef5; border-radius:4px; display:flex; flex-direction:column; min-height:380px; }
.pqpl-card-head { display:flex; align-items:center; justify-content:space-between; padding:8px 12px; border-bottom:1px solid #f0f2f5; }
.pqpl-card-title { font-size:13px; font-weight:600; color:#303133; }
.pqpl-card-toggles { color:#909399; cursor:pointer; font-size:14px; }
.pqpl-card-body { padding:10px 12px; flex:1; min-height:0; position:relative; }
.pqpl-yunit { position:absolute; top:18px; left:14px; font-size:11px; color:#909399; z-index:1; }
.pqpl-stats { display:flex; align-items:center; gap:14px; margin-top:4px; padding:0 4px; }
.pqpl-stat { font-size:11px; color:#606266; display:inline-flex; align-items:center; gap:4px; }
.pqpl-stat strong { color:#303133; font-weight:600; }
.pqpl-stat-badge { display:inline-block; padding:1px 4px; border-radius:2px; font-size:10px; font-weight:600; }
.pqpl-stat-badge.max { background:#fef0f0; color:#f56c6c; }
.pqpl-stat-badge.min { background:#f0f9eb; color:#67c23a; }
.pqpl-stat-badge.avg { background:#ecf5ff; color:#409eff; }

.pqpl-src-body { display:flex; flex-direction:column; }
.pqpl-src-table { font-size:12px; }
.pqpl-src-table th, .pqpl-src-table td { padding:4px 8px; }
.pqpl-ip-link { color:#409eff; cursor:pointer; }
.pqpl-ip-link:hover { text-decoration:underline; }
.pqpl-src-footer { display:flex; align-items:center; justify-content:space-between; margin-top:6px; padding:0 4px; font-size:12px; color:#606266; }

/* IP详情弹窗 */
.pqpl-ip-filters { display:flex; align-items:center; gap:10px; padding:8px 0; flex-wrap:wrap; border-bottom:1px solid #ebeef5; }
.pqpl-ip-stat { padding:10px 12px; background:#f5f7fa; border-radius:4px; }
.pqpl-ip-stat-label { font-size:12px; color:#909399; }
.pqpl-ip-stat-val { font-size:18px; font-weight:600; color:#303133; margin-top:2px; font-variant-numeric:tabular-nums; }
</style>
