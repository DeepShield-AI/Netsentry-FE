<template>
  <div class="so-page">
    <!-- Row 1: Donut + Rate Chart -->
    <div class="so-row so-row-2">
      <!-- Storage Overview Donut -->
      <div class="so-card">
        <div class="so-card-head">
          <span class="so-card-title">存储概况</span>
          <button class="so-icon-btn" disabled title="暂未开放">⚙</button>
        </div>
        <div class="so-donut-wrap">
          <div class="so-donut" ref="donutEl"></div>
          <ul class="so-legend">
            <li><i class="so-dot so-dot-blue"></i>使用量 ({{ usedPct }}%)</li>
            <li><i class="so-dot so-dot-gray"></i>剩余容量 ({{ freePct }}%)</li>
          </ul>
        </div>
      </div>
      <!-- Read/Write Rate Chart -->
      <div class="so-card">
        <div class="so-card-head">
          <span class="so-card-title">读写速率</span>
          <button class="so-icon-btn" disabled title="暂未开放">☰</button>
        </div>
        <div class="so-rate-chart" ref="rateChartEl"></div>
      </div>
    </div>

    <!-- Row 2: Storage Pools -->
    <div class="so-card so-full">
      <div class="so-card-head">
        <span class="so-card-title">存储池</span>
        <div class="so-section-actions">
          <button class="so-link-btn" disabled>状态通知</button>
          <span class="so-badge">待入库文件数: <strong>{{ pendingFiles }}</strong></span>
          <button class="so-link-btn" disabled>+ 添加</button>
        </div>
      </div>
      <table class="so-table">
        <thead>
          <tr>
            <th>存储池名</th>
            <th>池容量</th>
            <th>已用容量</th>
            <th>剩余容量</th>
            <th>容量占比</th>
            <th>索引最小时间</th>
            <th>索引最大时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pool in pools" :key="pool.name">
            <td>{{ pool.name }}</td>
            <td class="num">{{ pool.total }}</td>
            <td class="num">{{ pool.used }}</td>
            <td class="num">{{ pool.free }}</td>
            <td class="num">
              <div class="so-bar-wrap">
                <div class="so-bar-fill" :style="{ width: pool.pct + '%' }"></div>
                <span>{{ pool.pct }}%</span>
              </div>
            </td>
            <td>{{ pool.indexMin }}</td>
            <td>{{ pool.indexMax }}</td>
          </tr>
          <tr v-if="!pools.length">
            <td colspan="7" class="so-empty">暂无存储池数据</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Row 3: Disk Overview -->
    <div class="so-card so-full">
      <div class="so-card-head">
        <span class="so-card-title">硬盘概况</span>
      </div>
      <table class="so-table">
        <thead>
          <tr>
            <th style="width:60px">序号</th>
            <th>存储名</th>
            <th>型号 / 序列号</th>
            <th>固件版本</th>
            <th>容量</th>
            <th>转速</th>
            <th>自检状态</th>
            <th>坏道数</th>
            <th>温度</th>
            <th>读取速率</th>
            <th>写入速率</th>
            <th>IO繁忙度</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(disk, idx) in disks" :key="disk.name">
            <td>{{ idx + 1 }}</td>
            <td><strong>{{ disk.name }}</strong></td>
            <td>{{ disk.model }}</td>
            <td>{{ disk.firmware }}</td>
            <td class="num">{{ disk.capacity }}</td>
            <td>{{ disk.rpm || '—' }}</td>
            <td><span :class="['so-tag', disk.health === '正常' ? 'so-tag-green' : 'so-tag-default']">{{ disk.health }}</span></td>
            <td class="num">{{ disk.badSectors }}</td>
            <td>{{ disk.temp }}</td>
            <td class="num">{{ fmtBps(disk.readBps) }}</td>
            <td class="num">{{ fmtBps(disk.writeBps) }}</td>
            <td :class="disk.ioBusy > 80 ? 'so-warn' : ''">{{ disk.ioBusy }}%</td>
            <td>
              <button class="so-link-btn" disabled>闪烁</button>
              <button class="so-link-btn" disabled>格式化</button>
            </td>
          </tr>
          <tr v-if="!disks.length">
            <td colspan="13" class="so-empty">暂无硬盘数据</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { api } from '@/api/client'

const donutEl = ref<HTMLElement | null>(null)
const rateChartEl = ref<HTMLElement | null>(null)
let donutChart: echarts.ECharts | null = null
let rateChart: echarts.ECharts | null = null

const usedPct = ref('75.84')
const freePct = ref('24.16')
const pendingFiles = ref(197)

const pools = ref<any[]>([
  { name: 'ntmlog', total: '160.07 T', used: '142.46 T', free: '17.61 T', pct: 89, indexMin: '2024.01.01/00:00:00', indexMax: '2026.06.18/00:00:00' },
  { name: 'ntmpcap', total: '1.82 T', used: '1.38 T', free: '0.44 T', pct: 76, indexMin: '2025.06.01/00:00:00', indexMax: '2026.06.18/00:00:00' },
])

const disks = ref<any[]>([
  { name: 'sda', model: 'KINGSTON / 50026B738...', firmware: 'SBFK62J7', capacity: '119.24 G', rpm: '', health: '正常', badSectors: 0, temp: '35 °C', readBps: 128642, writeBps: 86428, ioBusy: 85.3 },
  { name: 'sdb', model: 'Samsung / S3Z1NX0K...', firmware: 'SN03', capacity: '1.82 T', rpm: '7200', health: '正常', badSectors: 0, temp: '43 °C', readBps: 428642, writeBps: 128642, ioBusy: 12.6 },
  { name: 'sdc', model: 'AVAGO / 5000C500...', firmware: '—', capacity: '160.07 T', rpm: '', health: '未知', badSectors: 0, temp: '0 °C', readBps: 0, writeBps: 0, ioBusy: 0 },
])

// Rolling buffers for rate chart
const rateBuf: { t: string; read: number; write: number }[] = []

function fmtBps(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + ' GB/s'
  if (n >= 1e6) return (n / 1e6).toFixed(1) + ' MB/s'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + ' KB/s'
  return n + ' B/s'
}
function tsLabel(): string {
  return new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function renderDonut() {
  if (!donutEl.value) return
  if (!donutChart) donutChart = echarts.init(donutEl.value)
  const used = parseFloat(usedPct.value)
  const free = parseFloat(freePct.value)
  donutChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {d}%' },
    series: [{
      type: 'pie',
      radius: ['55%', '75%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: false,
      label: {
        show: true,
        position: 'center',
        formatter: () => '总容量\n161.89 T',
        fontSize: 14,
        fontWeight: 'bold',
        lineHeight: 22,
        color: '#303133',
      },
      data: [
        { value: used, name: '使用量', itemStyle: { color: '#409eff' } },
        { value: free, name: '剩余', itemStyle: { color: '#ebeef5' } },
      ],
    }],
  })
}

function renderRateChart() {
  if (!rateChartEl.value) return
  if (!rateChart) rateChart = echarts.init(rateChartEl.value)
  rateChart.setOption({
    animation: true,
    tooltip: { trigger: 'axis' },
    legend: { data: ['读取速率', '写入速率'], bottom: 0 },
    grid: { left: 55, right: 16, top: 15, bottom: 40 },
    xAxis: { type: 'category', data: [], boundaryGap: false, axisLabel: { fontSize: 10 } },
    yAxis: { type: 'value', axisLabel: { fontSize: 10 }, splitLine: { lineStyle: { type: 'dashed' } } },
    series: [
      { name: '读取速率', type: 'line', data: [], smooth: true, symbol: 'none', lineStyle: { width: 1.5 }, itemStyle: { color: '#67c23a' } },
      { name: '写入速率', type: 'line', data: [], smooth: true, symbol: 'none', lineStyle: { width: 1.5 }, itemStyle: { color: '#409eff' } },
    ],
  })
}

function updateRateChart() {
  if (!rateChart) return
  rateChart.setOption({
    xAxis: { data: rateBuf.map(p => p.t), axisLabel: { interval: Math.floor(rateBuf.length / 5) } },
    series: [
      { data: rateBuf.map(p => p.read) },
      { data: rateBuf.map(p => p.write) },
    ],
  })
}

async function refresh() {
  try {
    const s: any = await api.stats().catch(() => ({}))
    // Update disk IO from system stats if available
    const readBps = Number(s.disk_read_bps || 0)
    const writeBps = Number(s.disk_write_bps || 0)
    const t = tsLabel()
    rateBuf.push({ t, read: readBps / 1e3, write: writeBps / 1e3 })
    if (rateBuf.length > 60) rateBuf.shift()
    updateRateChart()

    // Update disk usage from stats if available
    if (s.disk_total && s.disk_used) {
      const total = Number(s.disk_total)
      const used = Number(s.disk_used)
      if (total > 0) {
        const pct = (used / total * 100).toFixed(2)
        usedPct.value = pct
        freePct.value = (100 - parseFloat(pct)).toFixed(2)
        renderDonut()
      }
    }
  } catch { /* silent */ }
}

function handleResize() {
  donutChart?.resize()
  rateChart?.resize()
}

let timer: any = null

onMounted(() => {
  renderDonut()
  renderRateChart()
  refresh()
  timer = setInterval(refresh, 3000)
  window.addEventListener('resize', handleResize)
})
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  donutChart?.dispose()
  rateChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.so-page { padding: 0 4px; }

.so-row { display: grid; gap: 16px; margin-bottom: 16px; }
.so-row-2 { grid-template-columns: 1fr 1fr; }

.so-card {
  background: #fff; border-radius: 6px; border: 1px solid #e8e8e8;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06); overflow: hidden;
}
.so-full { margin-bottom: 16px; }

.so-card-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px; border-bottom: 1px solid #f0f0f0;
}
.so-card-title { font-size: 15px; font-weight: 600; color: #303133; }
.so-icon-btn {
  width: 28px; height: 28px; border: 1px solid #d9d9d9; border-radius: 4px;
  background: #fff; cursor: not-allowed; color: #c0c4cc; font-size: 14px;
}

.so-section-actions { display: flex; align-items: center; gap: 12px; }
.so-badge { font-size: 13px; color: #606266; }
.so-badge strong { color: #409eff; }
.so-link-btn {
  background: none; border: none; color: #409eff; font-size: 13px;
  cursor: not-allowed; opacity: 0.6;
}

/* Donut */
.so-donut-wrap { display: flex; align-items: center; justify-content: center; gap: 24px; padding: 20px; }
.so-donut { width: 200px; height: 200px; }
.so-legend { list-style: none; padding: 0; margin: 0; font-size: 13px; color: #606266; }
.so-legend li { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.so-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
.so-dot-blue { background: #409eff; }
.so-dot-gray { background: #ebeef5; }

/* Rate chart */
.so-rate-chart { height: 240px; padding: 12px; }

/* Tables */
.so-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.so-table th {
  text-align: left; padding: 10px 12px; background: #fafafa;
  color: #606266; font-weight: 600; border-bottom: 1px solid #ebeef5; white-space: nowrap;
}
.so-table td { padding: 9px 12px; border-bottom: 1px solid #f0f0f0; color: #303133; }
.so-table tbody tr:hover { background: #f5f7fa; }
.so-table .num { font-variant-numeric: tabular-nums; text-align: right; }
.so-empty { text-align: center; color: #909399; padding: 40px 0 !important; }

/* Bar in table */
.so-bar-wrap { display: flex; align-items: center; gap: 8px; justify-content: flex-end; }
.so-bar-fill {
  height: 8px; border-radius: 4px; background: #409eff;
  min-width: 4px; max-width: 80px; transition: width 0.3s;
}

/* Tags */
.so-tag {
  display: inline-block; padding: 2px 8px; border-radius: 4px;
  font-size: 12px; font-weight: 500; line-height: 1.5;
}
.so-tag-green { background: #f6ffed; color: #52c41a; border: 1px solid #b7eb8f; }
.so-tag-default { background: #fafafa; color: #606266; border: 1px solid #d9d9d9; }

.so-warn { color: #e6a23c; font-weight: 600; }
</style>
