<template>
  <div class="tc-page">
    <div class="tc-card">
      <div class="tc-card-header">
        <span class="tc-card-title">Top连接</span>
        <span class="tc-card-extra">🔗 共 {{ items.length }} 条连接</span>
      </div>
      <div class="tc-card-body">
        <div class="tc-chart" ref="chartEl"></div>
        <table class="tc-table">
          <thead>
            <tr>
              <th style="width:70px">排名</th>
              <th>源IP</th>
              <th>目的IP</th>
              <th>目的端口</th>
              <th>协议</th>
              <th>状态</th>
              <th>连接数</th>
              <th>持续时间</th>
              <th>上行流量</th>
              <th>下行流量</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in pagedItems" :key="idx">
              <td><span v-if="globalIdx(idx) <= 3" :class="['tc-rank', 'tc-rank-' + globalIdx(idx)]">{{ globalIdx(idx) }}</span><span v-else>{{ globalIdx(idx) }}</span></td>
              <td class="mono">{{ row.src_ip }}</td>
              <td class="mono">{{ row.dst_ip }}</td>
              <td>{{ row.dst_port || '-' }}</td>
              <td><span :class="['tc-tag', protoClass(row.protocol)]">{{ row.protocol || '-' }}</span></td>
              <td><span :class="['tc-tag', statusClass(row.status)]">{{ row.status || 'ACTIVE' }}</span></td>
              <td>
                <div class="tc-conn-bar">
                  <div class="tc-conn-fill" :style="{ width: connPct(row.connections) + '%' }"></div>
                  <span class="tc-conn-num">{{ fmtNum(row.connections || 0) }}</span>
                </div>
              </td>
              <td>{{ row.duration || '-' }}</td>
              <td>{{ fmtBytes(row.bytes_out || 0) }}</td>
              <td>{{ fmtBytes(row.bytes_in || 0) }}</td>
            </tr>
            <tr v-if="!items.length">
              <td colspan="10" class="tc-empty">暂无数据</td>
            </tr>
          </tbody>
        </table>
        <div class="tc-pagination" v-if="items.length > pageSize">
          <span class="tc-page-total">共 {{ items.length }} 条</span>
          <button class="tc-page-btn" :disabled="currentPage <= 1" @click="currentPage--">&lt;</button>
          <span class="tc-page-num">{{ currentPage }} / {{ totalPages }}</span>
          <button class="tc-page-btn" :disabled="currentPage >= totalPages" @click="currentPage++">&gt;</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { mockTopConnections } from './mock-data'

const items = ref<any[]>([])
const currentPage = ref(1)
const pageSize = 20
const chartEl = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null
let maxConn = 1

const totalPages = computed(() => Math.max(1, Math.ceil(items.value.length / pageSize)))
const pagedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return items.value.slice(start, start + pageSize)
})
function globalIdx(idx: number) { return (currentPage.value - 1) * pageSize + idx + 1 }
function connPct(c: number) { return Math.min(100, Math.round((c || 0) / maxConn * 100)) }

function fmtBytes(b: number): string {
  if (!b) return '0 B'
  if (b >= 1e9) return (b / 1e9).toFixed(1) + ' GB'
  if (b >= 1e6) return (b / 1e6).toFixed(1) + ' MB'
  if (b >= 1e3) return (b / 1e3).toFixed(1) + ' KB'
  return b.toFixed(0) + ' B'
}
function fmtNum(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return String(Math.round(n))
}
function protoClass(p: string): string {
  if (!p) return 'tc-tag-default'
  const u = p.toUpperCase()
  if (u === 'TCP') return 'tc-tag-blue'
  if (u === 'UDP') return 'tc-tag-green'
  return 'tc-tag-orange'
}
function statusClass(s: string): string {
  if (!s) return 'tc-tag-green'
  const u = s.toUpperCase()
  if (u === 'ESTABLISHED' || u === 'ACTIVE') return 'tc-tag-green'
  if (u === 'TIME_WAIT') return 'tc-tag-blue'
  if (u === 'SYN_SENT') return 'tc-tag-orange'
  if (u === 'CLOSE_WAIT' || u === 'FIN_WAIT') return 'tc-tag-red'
  return 'tc-tag-default'
}

function renderChart() {
  if (!chartEl.value) return
  if (!chart) chart = echarts.init(chartEl.value)
  const top10 = items.value.slice(0, 10)
  chart.setOption({
    title: { text: 'Top连接分布', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 60, right: 20, top: 40, bottom: 60 },
    xAxis: { type: 'category', data: top10.map(d => d.src_ip), axisLabel: { rotate: 30, fontSize: 10 } },
    yAxis: { type: 'value', name: '连接数' },
    series: [{ type: 'bar', data: top10.map(d => d.connections || 0), itemStyle: { color: '#2a88e6' } }],
  })
}

async function load() {
  try {
    const data = await fetch('/traffic/top-connections?n=50').then(r => r.json()).catch(() => mockTopConnections())
    const arr: any[] = Array.isArray(data) ? data : []
    items.value = arr.map(e => {
      // key format: "ip:port→ip:port" (Unicode arrow)
      const parts = (e.key || '').split('\u2192')
      if (parts.length < 2) {
        // fallback: try ASCII arrow
        const parts2 = (e.key || '').split('->')
        if (parts2.length >= 2) { parts[0] = parts2[0]; parts[1] = parts2[1] }
      }
      const src = (parts[0] || '').trim()
      const dst = (parts[1] || '').trim()
      // Parse ip:port — handle IPv6 [addr]:port
      const srcMatch = src.match(/^(.+):(\d+)$/)
      const dstMatch = dst.match(/^(.+):(\d+)$/)
      const srcIp = srcMatch ? srcMatch[1] : src
      const srcPort = srcMatch ? srcMatch[2] : ''
      const dstIp = dstMatch ? dstMatch[1] : dst
      const dstPort = dstMatch ? dstMatch[2] : ''
      // Infer protocol from port
      const port = Number(dstPort)
      let proto = 'TCP'
      if (port === 53) proto = 'DNS/UDP'
      else if (port === 443 || port === 8443) proto = 'TLS'
      else if (port === 80 || port === 8080) proto = 'HTTP'

      // Duration from first_seen/last_seen
      let duration = '-'
      if (e.first_seen && e.last_seen) {
        const dur = (new Date(e.last_seen).getTime() - new Date(e.first_seen).getTime()) / 1000
        if (dur > 0) {
          const h = Math.floor(dur / 3600)
          const m = Math.floor((dur % 3600) / 60)
          duration = h > 0 ? `${h}小时${m}分` : `${m}分钟`
        }
      }
      return {
        src_ip: srcIp,
        src_port: srcPort,
        dst_ip: dstIp,
        dst_port: dstPort,
        protocol: proto,
        status: 'ACTIVE',
        connections: e.sessions || 0,
        bytes_out: e.bytes_out || 0,
        bytes_in: e.bytes_in || 0,
        bytes: e.bytes || 0,
        packets: e.packets || 0,
        duration,
      }
    })
    maxConn = Math.max(1, ...items.value.map(d => d.connections))
    renderChart()
  } catch { items.value = [] }
}

function handleResize() { chart?.resize() }

let timer: any = null
onMounted(() => {
  load()
  timer = setInterval(load, 5000)
  window.addEventListener('resize', handleResize)
})
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  chart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.tc-page { padding: 0 4px; }
.tc-card {
  background: #fff;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  overflow: hidden;
}
.tc-card-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px; border-bottom: 1px solid #f0f0f0;
}
.tc-card-title { font-size: 16px; font-weight: 600; color: #303133; }
.tc-card-extra { font-size: 13px; color: #606266; }
.tc-card-body { padding: 0; }

.tc-chart { height: 300px; padding: 16px; }

.tc-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.tc-table th {
  text-align: left; padding: 10px 12px; background: #fafafa;
  color: #606266; font-weight: 600; border-bottom: 1px solid #ebeef5; white-space: nowrap;
}
.tc-table td { padding: 9px 12px; border-bottom: 1px solid #f0f0f0; color: #303133; }
.tc-table tbody tr:hover { background: #f5f7fa; }
.tc-empty { text-align: center; color: #909399; padding: 40px 0 !important; }

.tc-rank {
  display: inline-block; width: 22px; height: 22px; line-height: 22px;
  text-align: center; border-radius: 4px; font-size: 12px; font-weight: 700; color: #fff;
}
.tc-rank-1 { background: #faad14; }
.tc-rank-2 { background: #bfbfbf; }
.tc-rank-3 { background: #d48806; }

.tc-tag {
  display: inline-block; padding: 2px 8px; border-radius: 4px;
  font-size: 12px; font-weight: 500; line-height: 1.5;
}
.tc-tag-blue { background: #e6f7ff; color: #1890ff; border: 1px solid #91d5ff; }
.tc-tag-green { background: #f6ffed; color: #52c41a; border: 1px solid #b7eb8f; }
.tc-tag-orange { background: #fff7e6; color: #fa8c16; border: 1px solid #ffd591; }
.tc-tag-red { background: #fff1f0; color: #f5222d; border: 1px solid #ffa39e; }
.tc-tag-default { background: #fafafa; color: #606266; border: 1px solid #d9d9d9; }

.tc-conn-bar {
  display: flex; align-items: center; gap: 8px;
}
.tc-conn-fill {
  height: 8px; border-radius: 4px; background: #2a88e6;
  min-width: 4px; max-width: 80px; transition: width 0.3s;
}
.tc-conn-num { font-size: 12px; color: #303133; white-space: nowrap; }

.tc-pagination {
  display: flex; align-items: center; justify-content: flex-end;
  gap: 8px; padding: 12px 20px; border-top: 1px solid #f0f0f0;
}
.tc-page-total { font-size: 13px; color: #909399; margin-right: 8px; }
.tc-page-btn {
  width: 28px; height: 28px; border: 1px solid #d9d9d9; border-radius: 4px;
  background: #fff; cursor: pointer; font-size: 13px; color: #303133;
}
.tc-page-btn:disabled { color: #c0c4cc; cursor: not-allowed; }
.tc-page-btn:hover:not(:disabled) { border-color: #1890ff; color: #1890ff; }
.tc-page-num { font-size: 13px; color: #303133; }
</style>