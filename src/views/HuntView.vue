<template>
  <div class="sessions-page">
    <!-- ── Search bar (Arkime style) ──────────────────────────────────── -->
    <div class="search-bar">
      <div class="search-row">
        <div class="search-input-wrap">
          <svg class="search-icon" viewBox="0 0 24 24" width="14" height="14"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" stroke-width="2"/></svg>
          <input
            v-model="expression"
            class="search-input"
            placeholder="搜索表达式... (ip:x.x.x.x port:443 proto:TCP app:TLS)"
            @keyup.enter="runHunt"
          />
        </div>
        <button class="btn btn-theme" :disabled="loading" @click="runHunt">
          <svg v-if="!loading" viewBox="0 0 24 24" width="12" height="12"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" stroke-width="2"/></svg>
          <svg v-else class="spin" viewBox="0 0 24 24" width="12" height="12"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="31 31"/></svg>
          搜索
        </button>
        <button class="btn" @click="resetFilters" title="清除">✕</button>
      </div>
      <div class="time-bar">
        <div class="time-btns">
          <button
            v-for="t in timePresets"
            :key="t.label"
            class="time-btn"
            :class="{ active: activePreset === t.label }"
            @click="selectPreset(t)"
          >{{ t.label }}</button>
        </div>
        <span class="time-display">{{ rangeLabel }}</span>
      </div>
    </div>

    <!-- ── Disabled warning ───────────────────────────────────────────── -->
    <div v-if="chDisabled" class="disabled-banner">
      <strong>ClickHouse 未启用</strong> — 全流量取证需要 ClickHouse。请在 agent.yaml 中配置 store.clickhouse。
    </div>

    <template v-if="!chDisabled">
      <!-- ── Sessions Graph ─────────────────────────────────────────── -->
      <div class="graph-section">
        <div class="graph-header">
          <button class="graph-toggle" @click="graphVisible = !graphVisible">
            {{ graphVisible ? '▾' : '▸' }} 会话图表
          </button>
          <div class="graph-totals">
            <span><strong>{{ formatNumber(total) }}</strong> 会话</span>
            <span><strong>{{ formatNumber(totalPackets) }}</strong> 数据包</span>
            <span><strong>{{ formatBytes(totalBytes) }}</strong></span>
          </div>
        </div>
        <div v-show="graphVisible" ref="graphEl" class="graph-canvas"></div>
      </div>

      <!-- ── Table toolbar ──────────────────────────────────────────── -->
      <div class="table-toolbar">
        <div class="toolbar-left">
          <span class="records-info">
            显示 <strong>{{ rows.length }}</strong> / <strong>{{ formatNumber(total) }}</strong> 会话
          </span>
          <span v-if="selected.size" class="selected-info">
            (已选 {{ selected.size }})
          </span>
        </div>
        <div class="toolbar-right">
          <button class="btn btn-sm" :disabled="selected.size === 0" @click="downloadSelected">
            <svg viewBox="0 0 24 24" width="12" height="12"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" fill="none" stroke="currentColor" stroke-width="2"/></svg>
            下载 PCAP ({{ selected.size }})
          </button>
          <select v-model.number="pageSize" class="page-select" @change="onPageSizeChange(pageSize)">
            <option :value="50">50 条/页</option>
            <option :value="100">100 条/页</option>
            <option :value="200">200 条/页</option>
            <option :value="500">500 条/页</option>
          </select>
        </div>
      </div>

      <!-- ── Sessions Table ─────────────────────────────────────────── -->
      <div class="table-wrap">
        <table class="sessions-table">
          <thead>
            <tr>
              <th class="col-exp"></th>
              <th class="col-sel"><input type="checkbox" @change="toggleAll" /></th>
              <th class="col-time sortable" @click="sortBy('start')">开始时间 <span class="sort-arrow">{{ sortIcon('start') }}</span></th>
              <th class="col-time sortable" @click="sortBy('stop')">结束时间 <span class="sort-arrow">{{ sortIcon('stop') }}</span></th>
              <th class="col-ip sortable" @click="sortBy('srcip')">源 IP <span class="sort-arrow">{{ sortIcon('srcip') }}</span></th>
              <th class="col-port sortable" @click="sortBy('srcport')">源端口 <span class="sort-arrow">{{ sortIcon('srcport') }}</span></th>
              <th class="col-arrow"></th>
              <th class="col-ip sortable" @click="sortBy('dstip')">目的 IP <span class="sort-arrow">{{ sortIcon('dstip') }}</span></th>
              <th class="col-port sortable" @click="sortBy('dstport')">目的端口 <span class="sort-arrow">{{ sortIcon('dstport') }}</span></th>
              <th class="col-num sortable" @click="sortBy('packets')">数据包 <span class="sort-arrow">{{ sortIcon('packets') }}</span></th>
              <th class="col-num sortable" @click="sortBy('bytes')">字节 <span class="sort-arrow">{{ sortIcon('bytes') }}</span></th>
              <th class="col-num sortable" @click="sortBy('databytes')">数据字节 <span class="sort-arrow">{{ sortIcon('databytes') }}</span></th>
              <th class="col-info">信息</th>
            </tr>
          </thead>
          <tbody v-if="loading">
            <tr><td colspan="13" class="loading-cell">加载会话中...</td></tr>
          </tbody>
          <tbody v-else-if="rows.length === 0">
            <tr><td colspan="13" class="empty-cell">无匹配会话。请调整时间范围或搜索表达式。</td></tr>
          </tbody>
          <tbody v-else>
            <template v-for="(row, idx) in rows" :key="rowKey(row)">
              <tr
                class="session-row"
                :class="{ odd: idx % 2 === 0, expanded: expandedId === rowKey(row) }"
                @click="toggleExpand(row)"
              >
                <td class="col-exp"><span class="caret">{{ expandedId === rowKey(row) ? '▾' : '▸' }}</span></td>
                <td class="col-sel" @click.stop><input type="checkbox" :checked="isSelected(row)" @change="toggleSelect(row)" /></td>
                <td class="col-time mono">{{ fmtTs(row.timestamp) }}</td>
                <td class="col-time mono">{{ fmtTsEnd(row) }}</td>
                <td class="col-ip mono src-color">{{ prettyIP(row.five_tuple.src_ip) }}</td>
                <td class="col-port mono">{{ row.five_tuple.src_port }}</td>
                <td class="col-arrow">
                  <svg viewBox="0 0 24 24" width="10" height="10"><path d="M5 12h14m-4-4l4 4-4 4" fill="none" stroke="#999" stroke-width="2"/></svg>
                </td>
                <td class="col-ip mono dst-color">{{ prettyIP(row.five_tuple.dst_ip) }}</td>
                <td class="col-port mono">{{ row.five_tuple.dst_port }}</td>
                <td class="col-num">{{ formatNumber(row.packet_count) }}</td>
                <td class="col-num">{{ formatBytes(row.bytes_count) }}</td>
                <td class="col-num">{{ formatBytes(Math.max(0, row.bytes_count - row.packet_count * 54)) }}</td>
                <td class="col-info">
                  <span class="info-proto">{{ row.app_proto || row.master_proto || protoName(row.five_tuple.protocol) }}</span>
                  <span v-if="row.host" class="info-host">{{ row.host }}</span>
                </td>
              </tr>
              <!-- Expanded detail row -->
              <tr v-if="expandedId === rowKey(row)" class="detail-row">
                <td colspan="13">
                  <div class="session-detail">
                    <div class="detail-actions">
                      <button class="btn btn-sm btn-theme" @click.stop="downloadOne(row)">
                        <svg viewBox="0 0 24 24" width="11" height="11"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" fill="none" stroke="currentColor" stroke-width="2"/></svg>
                        下载 PCAP
                      </button>
                      <button class="btn btn-sm" @click.stop="addToExpression('ip', prettyIP(row.five_tuple.src_ip))">+ 源IP过滤</button>
                      <button class="btn btn-sm" @click.stop="addToExpression('ip', prettyIP(row.five_tuple.dst_ip))">+ 目IP过滤</button>
                    </div>

                    <div class="detail-grid">
                      <!-- General -->
                      <div class="detail-card">
                        <h4>基本信息</h4>
                        <dl>
                          <dt>节点</dt><dd>NetSentry 探针</dd>
                          <dt>协议链</dt><dd>{{ [row.five_tuple.protocol, row.master_proto, row.app_proto].filter(Boolean).join(' → ') }}</dd>
                          <dt>首包时间</dt><dd class="mono">{{ fmtTs(row.timestamp) }}</dd>
                          <dt>末包时间</dt><dd class="mono">{{ fmtTsEnd(row) }}</dd>
                          <dt>持续时间</dt><dd>{{ formatDurationMs(row.duration_ms) }}</dd>
                          <dt v-if="row.direction">方向</dt><dd v-if="row.direction">{{ row.direction }}</dd>
                          <dt>流哈希</dt><dd class="mono">{{ row.flow_hash }}</dd>
                        </dl>
                      </div>

                      <!-- Source -->
                      <div class="detail-card">
                        <h4>源</h4>
                        <dl>
                          <dt>IP</dt><dd class="mono src-color">{{ prettyIP(row.five_tuple.src_ip) }}</dd>
                          <dt>Port</dt><dd>{{ row.five_tuple.src_port }}</dd>
                          <dt v-if="row.src_mac">MAC</dt><dd v-if="row.src_mac" class="mono">{{ row.src_mac }}</dd>
                          <dt>Packets</dt><dd>{{ formatNumber(row.packet_count) }}</dd>
                          <dt>Bytes</dt><dd>{{ formatBytes(row.bytes_count) }}</dd>
                        </dl>
                      </div>

                      <!-- Destination -->
                      <div class="detail-card">
                        <h4>目的</h4>
                        <dl>
                          <dt>IP</dt><dd class="mono dst-color">{{ prettyIP(row.five_tuple.dst_ip) }}</dd>
                          <dt>Port</dt><dd>{{ row.five_tuple.dst_port }}</dd>
                          <dt v-if="row.dst_mac">MAC</dt><dd v-if="row.dst_mac" class="mono">{{ row.dst_mac }}</dd>
                        </dl>
                      </div>

                      <!-- Network -->
                      <div class="detail-card">
                        <h4>网络</h4>
                        <dl>
                          <dt>IP 协议</dt><dd>{{ protoName(row.five_tuple.protocol) }} ({{ row.five_tuple.protocol }})</dd>
                          <dt>总包数</dt><dd>{{ formatNumber(row.packet_count) }}</dd>
                          <dt>总字节</dt><dd>{{ formatNumber(row.bytes_count) }} ({{ formatBytes(row.bytes_count) }})</dd>
                          <dt>数据字节</dt><dd>{{ formatNumber(Math.max(0, row.bytes_count - row.packet_count * 54)) }}</dd>
                          <dt v-if="row.tcp_connect_ms">TCP 连接延迟</dt><dd v-if="row.tcp_connect_ms">{{ row.tcp_connect_ms.toFixed(2) }} ms</dd>
                          <dt v-if="row.vlan_id">VLAN ID</dt><dd v-if="row.vlan_id">{{ row.vlan_id }}</dd>
                        </dl>
                      </div>

                      <!-- Application (conditional) -->
                      <div v-if="row.app_proto || row.host || row.category" class="detail-card">
                        <h4>应用层</h4>
                        <dl>
                          <dt v-if="row.app_proto">协议</dt><dd v-if="row.app_proto">{{ row.app_proto }}</dd>
                          <dt v-if="row.master_proto">主协议</dt><dd v-if="row.master_proto">{{ row.master_proto }}</dd>
                          <dt v-if="row.category">分类</dt><dd v-if="row.category">{{ row.category }}</dd>
                          <dt v-if="row.host">主机 / SNI</dt><dd v-if="row.host" class="mono">{{ row.host }}</dd>
                        </dl>
                      </div>

                      <!-- Process (conditional) -->
                      <div v-if="row.process_name" class="detail-card">
                        <h4>进程</h4>
                        <dl>
                          <dt>名称</dt><dd>{{ row.process_name }}</dd>
                          <dt v-if="row.process_pid">PID</dt><dd v-if="row.process_pid">{{ row.process_pid }}</dd>
                          <dt v-if="row.process_exe">路径</dt><dd v-if="row.process_exe" class="mono">{{ row.process_exe }}</dd>
                        </dl>
                      </div>

                      <!-- Risk (conditional) -->
                      <div v-if="row.ndpi_risk" class="detail-card">
                        <h4>风险</h4>
                        <dl>
                          <dt>标志</dt>
                          <dd>
                            <span v-for="r in decodeRisks(row.ndpi_risk)" :key="r.bit" class="risk-badge" :title="r.name">{{ r.short }}</span>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- ── Pagination ─────────────────────────────────────────────── -->
      <div class="pagination-bar">
        <button class="btn btn-sm" :disabled="page <= 1" @click="goPage(page - 1)">‹ 上一页</button>
        <span class="page-info">第 {{ page }} 页 / 共 {{ Math.max(1, Math.ceil(total / pageSize)) }} 页</span>
        <button class="btn btn-sm" :disabled="page >= Math.ceil(total / pageSize)" @click="goPage(page + 1)">下一页 ›</button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import * as echarts from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { ElMessage } from 'element-plus'
import { api } from '@/api/client'
import type { Flow, HuntQuery, PcapSessionSpec } from '@/api/types'
import { formatBytes, formatDurationMs, formatNumber, prettyIP } from '@/utils/format'
import { decodeRisks } from '@/utils/ndpiRisk'
import { downloadFile } from '@/utils/download'

echarts.use([BarChart, LineChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer])

// ── State ─────────────────────────────────────────────────────────────
const expression = ref('')
const rows = ref<Flow[]>([])
const total = ref(0)
const loading = ref(false)
const chDisabled = ref(false)
const page = ref(1)
const pageSize = ref(100)
const limitMb = ref(200)
const graphVisible = ref(true)

const selected = ref<Set<string>>(new Set())
const expandedId = ref<string | null>(null)

// ── Computed totals ───────────────────────────────────────────────────
const totalPackets = computed(() => rows.value.reduce((s, r) => s + r.packet_count, 0))
const totalBytes = computed(() => rows.value.reduce((s, r) => s + r.bytes_count, 0))

// ── Time presets (Arkime style) ───────────────────────────────────────
interface TimePreset { label: string; mins: number }
const timePresets: TimePreset[] = [
  { label: '1h', mins: 60 },
  { label: '6h', mins: 360 },
  { label: '24h', mins: 1440 },
  { label: '2d', mins: 2880 },
  { label: '7d', mins: 10080 },
  { label: '30d', mins: 43200 },
  { label: 'All', mins: 0 },
]
const activePreset = ref('24h')
const rangeStart = ref<Date>(new Date(Date.now() - 24 * 60 * 60 * 1000))
const rangeEnd = ref<Date>(new Date())

const rangeLabel = computed(() => {
  const o: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }
  return `${rangeStart.value.toLocaleString(undefined, o)} — ${rangeEnd.value.toLocaleString(undefined, o)}`
})

function selectPreset(t: TimePreset) {
  activePreset.value = t.label
  rangeEnd.value = new Date()
  rangeStart.value = t.mins > 0 ? new Date(Date.now() - t.mins * 60 * 1000) : new Date(0)
  page.value = 1
  void runHunt()
}

// ── Expression parsing ────────────────────────────────────────────────
function parseExpression(): Partial<HuntQuery> {
  const q: Partial<HuntQuery> = {}
  const expr = expression.value.trim()
  if (!expr) return q
  const parts = expr.split(/\s+(?:AND\s+)?/i)
  for (const p of parts) {
    const m = p.match(/^(\w+)[=:](.+)$/)
    if (m) {
      const [, key, val] = m
      switch (key.toLowerCase()) {
        case 'ip': case 'src': case 'dst': q.ip = val; break
        case 'port': q.port = parseInt(val, 10) || undefined; break
        case 'proto': case 'protocol': q.proto = val.toUpperCase(); break
        case 'app': case 'app_proto': q.app_proto = val; break
        case 'category': case 'cat': q.category = val; break
        case 'process': case 'proc': q.process = val; break
        case 'risk': q.risk_only = true; break
        default: q.q = (q.q ? q.q + ' ' : '') + p
      }
    } else {
      q.q = (q.q ? q.q + ' ' : '') + p
    }
  }
  return q
}

function buildQuery(): HuntQuery {
  return {
    since: rangeStart.value.toISOString(),
    until: rangeEnd.value.toISOString(),
    limit: pageSize.value,
    offset: (page.value - 1) * pageSize.value,
    ...parseExpression(),
  }
}

async function runHunt() {
  loading.value = true
  try {
    const env = await api.historyHunt(buildQuery())
    if (env.disabled) { chDisabled.value = true; rows.value = []; total.value = 0; return }
    chDisabled.value = false
    rows.value = env.items
    total.value = env.total
    await nextTick()
    rebuildGraph()
  } catch (err: any) {
    ElMessage.error('Search failed: ' + (err?.message || err))
  } finally {
    loading.value = false
  }
}

function resetFilters() { expression.value = ''; page.value = 1; void runHunt() }

// ── Pagination ────────────────────────────────────────────────────────
function goPage(p: number) { page.value = p; void runHunt() }
function onPageSizeChange(s: number) { pageSize.value = s; page.value = 1; void runHunt() }

// ── Sort ──────────────────────────────────────────────────────────────
type SortField = 'start' | 'stop' | 'srcip' | 'srcport' | 'dstip' | 'dstport' | 'packets' | 'bytes' | 'databytes'
const sortField = ref<SortField>('start')
const sortAsc = ref(false)

function sortBy(field: SortField) {
  if (sortField.value === field) sortAsc.value = !sortAsc.value
  else { sortField.value = field; sortAsc.value = true }
  const dir = sortAsc.value ? 1 : -1
  rows.value.sort((a, b) => {
    let va: number | string = 0, vb: number | string = 0
    switch (field) {
      case 'start': va = new Date(a.timestamp).getTime(); vb = new Date(b.timestamp).getTime(); break
      case 'stop': va = new Date(a.timestamp).getTime() + (a.duration_ms || 0); vb = new Date(b.timestamp).getTime() + (b.duration_ms || 0); break
      case 'srcip': va = a.five_tuple.src_ip; vb = b.five_tuple.src_ip; break
      case 'srcport': va = a.five_tuple.src_port; vb = b.five_tuple.src_port; break
      case 'dstip': va = a.five_tuple.dst_ip; vb = b.five_tuple.dst_ip; break
      case 'dstport': va = a.five_tuple.dst_port; vb = b.five_tuple.dst_port; break
      case 'packets': va = a.packet_count; vb = b.packet_count; break
      case 'bytes': va = a.bytes_count; vb = b.bytes_count; break
      case 'databytes': va = a.bytes_count - a.packet_count * 54; vb = b.bytes_count - b.packet_count * 54; break
    }
    if (typeof va === 'string') return dir * va.localeCompare(vb as string)
    return dir * ((va as number) - (vb as number))
  })
}
function sortIcon(field: SortField): string {
  if (sortField.value !== field) return ''
  return sortAsc.value ? '▲' : '▼'
}

// ── Selection ─────────────────────────────────────────────────────────
function rowKey(row: Flow): string {
  const ft = row.five_tuple
  return `${row.timestamp}|${ft.src_ip}:${ft.src_port}|${ft.dst_ip}:${ft.dst_port}|${ft.protocol}`
}
function isSelected(row: Flow): boolean { return selected.value.has(rowKey(row)) }
function toggleSelect(row: Flow) {
  const k = rowKey(row)
  if (selected.value.has(k)) selected.value.delete(k); else selected.value.add(k)
}
function toggleAll(e: Event) {
  const checked = (e.target as HTMLInputElement).checked
  if (checked) rows.value.forEach(r => selected.value.add(rowKey(r))); else selected.value.clear()
}

// ── Expand ────────────────────────────────────────────────────────────
function toggleExpand(row: Flow) {
  const k = rowKey(row); expandedId.value = expandedId.value === k ? null : k
}

// ── Add to expression ─────────────────────────────────────────────────
function addToExpression(field: string, value: string) {
  const term = `${field}:${value}`
  if (expression.value.includes(term)) return
  expression.value = expression.value ? `${expression.value} ${term}` : term
}

// ── Format helpers ────────────────────────────────────────────────────
function fmtTs(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const Y = d.getFullYear(), M = String(d.getMonth()+1).padStart(2,'0'), D = String(d.getDate()).padStart(2,'0')
  const h = String(d.getHours()).padStart(2,'0'), m = String(d.getMinutes()).padStart(2,'0'), s = String(d.getSeconds()).padStart(2,'0')
  return `${Y}-${M}-${D} ${h}:${m}:${s}`
}
function fmtTsEnd(row: Flow): string {
  const start = new Date(row.timestamp).getTime()
  if (Number.isNaN(start)) return '—'
  return fmtTs(new Date(start + (row.duration_ms || 0)).toISOString())
}
function protoName(p: string): string {
  const n = parseInt(p, 10)
  if (!Number.isNaN(n)) { switch (n) { case 6: return 'tcp'; case 17: return 'udp'; case 1: return 'icmp'; case 58: return 'icmp6'; default: return String(n) } }
  return (p || '').toLowerCase()
}

// ── PCAP download ─────────────────────────────────────────────────────
function rowToSpec(row: Flow): PcapSessionSpec {
  const ft = row.five_tuple
  return { src_ip: ft.src_ip, dst_ip: ft.dst_ip, src_port: ft.src_port, dst_port: ft.dst_port, proto: ft.protocol }
}
function downloadOne(row: Flow) {
  const start = new Date(row.timestamp).getTime(), end = start + (row.duration_ms || 0), pad = 30_000
  const spec = rowToSpec(row)
  void downloadFile(api.pcapSessionUrl({ ...spec, since: new Date(start - pad), until: new Date(end + pad), limit_mb: limitMb.value }), `session-${spec.src_ip}-${spec.dst_ip}.pcap`)
}
function downloadSelected() {
  const sel = rows.value.filter(r => selected.value.has(rowKey(r)))
  if (!sel.length) return
  const specs = sel.map(rowToSpec)
  void downloadFile(api.pcapSessionsUrl(specs, { since: rangeStart.value.toISOString(), until: rangeEnd.value.toISOString(), limit_mb: limitMb.value }), `hunt-${specs.length}sess.pcap`)
}

// ── ECharts graph ─────────────────────────────────────────────────────
const graphEl = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

function rebuildGraph() {
  if (!chart || rows.value.length === 0) { chart?.setOption({ series: [{ data: [] }, { data: [] }] }); return }
  const tMin = rangeStart.value.getTime(), tMax = rangeEnd.value.getTime()
  const span = Math.max(tMax - tMin, 1), bucketCount = 80, bucketMs = span / bucketCount
  const sessBuckets = new Array(bucketCount).fill(0)
  const bytesBuckets = new Array(bucketCount).fill(0)
  for (const row of rows.value) {
    const t = new Date(row.timestamp).getTime()
    const idx = Math.min(Math.max(0, Math.floor((t - tMin) / bucketMs)), bucketCount - 1)
    sessBuckets[idx]++
    bytesBuckets[idx] += row.bytes_count
  }
  const xData = Array.from({ length: bucketCount }, (_, i) => new Date(tMin + i * bucketMs + bucketMs / 2))
  chart.setOption({
    series: [
      { data: xData.map((t, i) => [t, sessBuckets[i]]) },
      { data: xData.map((t, i) => [t, bytesBuckets[i]]) },
    ],
  })
}

function initGraph() {
  if (!graphEl.value) return
  chart = echarts.init(graphEl.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { show: true, right: 10, top: 4, textStyle: { fontSize: 11, color: '#555' } },
    grid: { left: 50, right: 50, top: 30, bottom: 26 },
    xAxis: { type: 'time', axisLabel: { fontSize: 10, color: '#777' }, axisLine: { lineStyle: { color: '#ddd' } }, splitLine: { show: false } },
    yAxis: [
      { type: 'value', name: '会话数', nameTextStyle: { fontSize: 10, color: '#777' }, axisLabel: { fontSize: 10, color: '#777' }, splitLine: { lineStyle: { color: '#f0f0f0' } } },
      { type: 'value', name: '字节', nameTextStyle: { fontSize: 10, color: '#777' }, axisLabel: { fontSize: 10, color: '#777', formatter: (v: number) => formatBytes(v) }, splitLine: { show: false } },
    ],
    series: [
      { name: '会话数', type: 'bar', yAxisIndex: 0, itemStyle: { color: '#409eff' }, barMaxWidth: 6, data: [] },
      { name: '字节', type: 'line', yAxisIndex: 1, smooth: true, showSymbol: false, lineStyle: { color: '#67c23a', width: 1.5 }, areaStyle: { color: 'rgba(103,194,58,0.15)' }, data: [] },
    ],
  })
}

function handleResize() { chart?.resize() }

onMounted(() => { initGraph(); window.addEventListener('resize', handleResize); void runHunt() })
onBeforeUnmount(() => { chart?.dispose(); window.removeEventListener('resize', handleResize) })
</script>

<style scoped>
/* ══ Sessions page — integrated with NetSentry theme ═══════════════════ */
.sessions-page {
  font-size: 13px;
  color: var(--el-text-color-primary, #303030);
}

/* ── Search Bar ────────────────────────────────────────────────────── */
.search-bar {
  background: #fff;
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
  padding: 10px 16px;
}
.search-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}
.search-input-wrap {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}
.search-icon {
  position: absolute;
  left: 10px;
  color: #999;
  pointer-events: none;
}
.search-input {
  width: 100%;
  padding: 7px 10px 7px 30px;
  border: 1px solid var(--el-border-color, #dcdfe6);
  border-radius: 4px;
  font-size: 13px;
  color: var(--el-text-color-primary, #303030);
  background: var(--el-fill-color-blank, #fff);
  outline: none;
  transition: border-color 0.2s;
}
.search-input:focus { border-color: var(--el-color-primary, #409eff); box-shadow: 0 0 0 1px rgba(64,158,255,0.2); }
.search-input::placeholder { color: var(--el-text-color-placeholder, #a8abb2); }

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  border: 1px solid var(--el-border-color, #dcdfe6);
  border-radius: 4px;
  background: #fff;
  color: var(--el-text-color-regular, #606266);
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}
.btn:hover { background: var(--el-fill-color-light, #f5f7fa); border-color: var(--el-border-color-darker, #cdd0d6); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-sm { padding: 3px 8px; font-size: 11px; }
.btn-theme { background: var(--el-color-primary, #409eff); border-color: var(--el-color-primary, #409eff); color: #fff; }
.btn-theme:hover { background: var(--el-color-primary-dark-2, #337ecc); }

/* Time bar */
.time-bar { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
.time-btns { display: flex; gap: 2px; }
.time-btn {
  padding: 3px 10px;
  border: 1px solid var(--el-border-color, #dcdfe6);
  border-radius: 4px;
  background: #fff;
  color: var(--el-text-color-regular, #606266);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}
.time-btn:hover { background: var(--el-fill-color-light, #f5f7fa); }
.time-btn.active { background: var(--el-color-primary, #409eff); border-color: var(--el-color-primary, #409eff); color: #fff; }
.time-display { color: var(--el-text-color-secondary, #909399); font-size: 12px; margin-left: 8px; }

/* ── Disabled banner ───────────────────────────────────────────────── */
.disabled-banner {
  background: var(--el-color-warning-light-9, #fdf6ec);
  border: 1px solid var(--el-color-warning-light-5, #f3d19e);
  color: var(--el-color-warning-dark-2, #b88230);
  padding: 12px 16px;
  margin: 16px;
  border-radius: var(--sg-card-radius, 8px);
}

/* ── Graph ─────────────────────────────────────────────────────────── */
.graph-section {
  margin: 12px 16px 0;
  background: #fff;
  border-radius: var(--sg-card-radius, 8px);
  border: 1px solid var(--el-border-color-lighter, #ebeef5);
  overflow: hidden;
}
.graph-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  background: var(--el-fill-color-lighter, #fafcff);
  border-bottom: 1px solid var(--el-border-color-extra-light, #f2f6fc);
}
.graph-toggle {
  background: none;
  border: none;
  color: var(--el-color-primary, #409eff);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 2px 4px;
}
.graph-toggle:hover { text-decoration: underline; }
.graph-totals {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--el-text-color-secondary, #909399);
}
.graph-totals strong { color: var(--el-text-color-primary, #303030); }
.graph-canvas { width: 100%; height: 150px; }

/* ── Table toolbar ─────────────────────────────────────────────────── */
.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: #fff;
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
}
.toolbar-left { display: flex; align-items: center; gap: 8px; }
.records-info { font-size: 12px; color: var(--el-text-color-secondary, #909399); }
.records-info strong { color: var(--el-text-color-primary, #303030); }
.selected-info { font-size: 12px; color: var(--el-color-primary, #409eff); font-weight: 500; }
.toolbar-right { display: flex; align-items: center; gap: 8px; }
.page-select {
  padding: 4px 8px;
  border: 1px solid var(--el-border-color, #dcdfe6);
  border-radius: 4px;
  font-size: 12px;
  color: var(--el-text-color-regular, #606266);
  background: #fff;
}

/* ── Sessions Table ────────────────────────────────────────────────── */
.table-wrap {
  overflow-x: auto;
  margin: 12px 16px;
  background: #fff;
  border-radius: var(--sg-card-radius, 8px);
  border: 1px solid var(--el-border-color-lighter, #ebeef5);
}
.sessions-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
.sessions-table thead {
  background: var(--el-fill-color-lighter, #fafcff);
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
  position: sticky;
  top: 0;
  z-index: 10;
}
.sessions-table th {
  padding: 8px 8px;
  text-align: left;
  font-weight: 600;
  font-size: 12px;
  color: var(--el-text-color-secondary, #909399);
  white-space: nowrap;
  user-select: none;
}
.sessions-table th.sortable { cursor: pointer; }
.sessions-table th.sortable:hover { color: var(--el-color-primary, #409eff); }
.sort-arrow { font-size: 9px; color: var(--el-color-primary, #409eff); }
.sessions-table td {
  padding: 6px 8px;
  white-space: nowrap;
  border-bottom: 1px solid var(--el-border-color-extra-light, #f2f6fc);
  vertical-align: middle;
}
.session-row { cursor: pointer; transition: background 0.15s; }
.session-row:hover { background: var(--el-color-primary-light-9, #ecf5ff) !important; }
.session-row.odd { background: var(--el-fill-color-lighter, #fafcff); }
.session-row.expanded { background: var(--el-color-primary-light-9, #ecf5ff) !important; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; }
.src-color { color: #e6522c; }
.dst-color { color: var(--el-color-primary, #409eff); }

.col-exp { width: 24px; text-align: center; }
.col-sel { width: 28px; text-align: center; }
.col-time { min-width: 135px; }
.col-ip { min-width: 115px; }
.col-port { width: 54px; text-align: right; }
.col-arrow { width: 20px; text-align: center; }
.col-num { width: 80px; text-align: right; }
.col-info { min-width: 160px; }

.caret { color: var(--el-text-color-secondary, #909399); font-size: 11px; }
.info-proto { font-weight: 500; color: var(--el-color-primary, #409eff); }
.info-host { margin-left: 6px; color: var(--el-text-color-secondary, #909399); font-size: 11px; }

.loading-cell, .empty-cell {
  text-align: center;
  padding: 48px;
  color: var(--el-text-color-secondary, #909399);
  font-size: 13px;
}

/* ── Session detail (expanded) ─────────────────────────────────────── */
.detail-row td { padding: 0 !important; border-bottom: 2px solid var(--el-color-primary, #409eff) !important; }
.session-detail {
  padding: 14px 16px 14px 48px;
  background: var(--el-fill-color-lighter, #fafcff);
  border-top: 1px solid var(--el-border-color-extra-light, #f2f6fc);
}
.detail-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
}
.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}
.detail-card {
  background: #fff;
  border: 1px solid var(--el-border-color-lighter, #ebeef5);
  border-radius: var(--sg-card-radius, 8px);
  padding: 10px 14px;
}
.detail-card h4 {
  font-size: 11px;
  font-weight: 700;
  color: var(--el-color-primary, #409eff);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 0 0 8px 0;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--el-border-color-extra-light, #f2f6fc);
}
.detail-card dl {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 3px 12px;
  margin: 0;
  font-size: 12px;
}
.detail-card dt {
  color: var(--el-text-color-secondary, #909399);
  font-weight: 500;
  white-space: nowrap;
}
.detail-card dd {
  margin: 0;
  color: var(--el-text-color-primary, #303030);
  word-break: break-all;
}
.risk-badge {
  display: inline-block;
  background: var(--el-color-danger, #f56c6c);
  color: #fff;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 10px;
  margin-right: 4px;
}

/* ── Pagination ────────────────────────────────────────────────────── */
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px 16px;
}
.page-info { font-size: 12px; color: var(--el-text-color-secondary, #909399); }

/* ── Utility ───────────────────────────────────────────────────────── */
.spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
