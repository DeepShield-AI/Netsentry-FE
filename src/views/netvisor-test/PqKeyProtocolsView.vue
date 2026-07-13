<template>
  <div class="pq-key-protocols">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>重点协议质量</span>
          <el-radio-group v-model="activeProtocol" size="small">
            <el-radio-button value="tcp">TCP</el-radio-button>
            <el-radio-button value="dns">DNS</el-radio-button>
            <el-radio-button value="http">HTTP</el-radio-button>
            <el-radio-button value="https">HTTPS</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <!-- TCP panel -->
      <div v-show="activeProtocol === 'tcp'">
        <el-row :gutter="16">
          <el-col :span="12">
            <h4 class="chart-title">TCP 重传率趋势</h4>
            <div ref="tcpRetranRef" class="chart-box" />
          </el-col>
          <el-col :span="12">
            <h4 class="chart-title">TCP 连接建立时延 (ms)</h4>
            <div ref="tcpConnRef" class="chart-box" />
          </el-col>
        </el-row>
      </div>

      <!-- DNS panel -->
      <div v-show="activeProtocol === 'dns'">
        <el-row :gutter="16">
          <el-col :span="12">
            <h4 class="chart-title">DNS 查询响应时延 (ms)</h4>
            <div ref="dnsLatencyRef" class="chart-box" />
          </el-col>
          <el-col :span="12">
            <h4 class="chart-title">DNS 查询失败率</h4>
            <div ref="dnsFailRef" class="chart-box" />
          </el-col>
        </el-row>
      </div>

      <!-- HTTP panel -->
      <div v-show="activeProtocol === 'http'">
        <el-row :gutter="16">
          <el-col :span="12">
            <h4 class="chart-title">HTTP 响应时延 (ms)</h4>
            <div ref="httpLatencyRef" class="chart-box" />
          </el-col>
          <el-col :span="12">
            <h4 class="chart-title">HTTP 错误率 (4xx/5xx)</h4>
            <div ref="httpErrorRef" class="chart-box" />
          </el-col>
        </el-row>
      </div>

      <!-- HTTPS panel -->
      <div v-show="activeProtocol === 'https'">
        <el-row :gutter="16">
          <el-col :span="12">
            <h4 class="chart-title">HTTPS 握手时延 (ms)</h4>
            <div ref="httpsHandshakeRef" class="chart-box" />
          </el-col>
          <el-col :span="12">
            <h4 class="chart-title">HTTPS 证书错误率</h4>
            <div ref="httpsCertRef" class="chart-box" />
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'

const activeProtocol = ref('tcp')

const tcpRetranRef = ref<HTMLElement | null>(null)
const tcpConnRef = ref<HTMLElement | null>(null)
const dnsLatencyRef = ref<HTMLElement | null>(null)
const dnsFailRef = ref<HTMLElement | null>(null)
const httpLatencyRef = ref<HTMLElement | null>(null)
const httpErrorRef = ref<HTMLElement | null>(null)
const httpsHandshakeRef = ref<HTMLElement | null>(null)
const httpsCertRef = ref<HTMLElement | null>(null)

const charts: Map<string, echarts.ECharts> = new Map()

const X_LABELS = ['12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '00:00', '02:00', '04:00', '06:00', '08:00', '10:00']

// Demo data
const TCP_RETRAN = [2.1, 1.8, 2.4, 1.9, 2.2, 2.6, 3.1, 1.5, 1.3, 2.0, 1.7, 2.3]
const TCP_CONN = [12, 15, 11, 18, 14, 16, 22, 10, 9, 13, 12, 14]
const DNS_LATENCY = [8, 12, 7, 15, 10, 11, 18, 6, 5, 9, 8, 10]
const DNS_FAIL = [1.2, 0.8, 1.5, 0.9, 1.1, 1.4, 2.0, 0.6, 0.5, 0.9, 0.7, 1.0]
const HTTP_LATENCY = [45, 52, 38, 68, 55, 48, 82, 35, 30, 42, 50, 46]
const HTTP_ERROR = [3.2, 2.8, 3.5, 4.1, 3.0, 2.5, 5.2, 2.0, 1.8, 2.9, 3.1, 2.7]
const HTTPS_HANDSHAKE = [28, 35, 25, 42, 32, 30, 55, 22, 18, 30, 27, 32]
const HTTPS_CERT = [0.5, 0.3, 0.8, 0.4, 0.6, 0.7, 1.2, 0.2, 0.1, 0.4, 0.3, 0.5]

function upsertLine(id: string, el: HTMLElement | null, yData: number[], color: string, unit: string) {
  if (!el) return
  let c = charts.get(id)
  if (!c) {
    c = echarts.init(el)
    c.setOption({
      animation: true, animationDurationUpdate: 500, animationEasingUpdate: 'cubicOut',
      tooltip: { trigger: 'axis', valueFormatter: (v: number) => `${v}${unit}` },
      grid: { left: 50, right: 16, top: 16, bottom: 30 },
      xAxis: { type: 'category', data: X_LABELS },
      yAxis: { type: 'value', axisLabel: { formatter: `{value}${unit}` } },
      series: [{ type: 'line', smooth: true, data: [], areaStyle: { opacity: 0.15 }, itemStyle: { color }, lineStyle: { width: 2 } }],
    })
    charts.set(id, c)
  }
  c.setOption({ series: [{ data: yData }] })
}

function resizeCharts() { charts.forEach(c => c.resize()) }

function renderCharts() {
  // v-show keeps hidden panels mounted, so all refs stay valid and their
  // charts get sized correctly when their panel becomes visible.
  upsertLine('tcp-retran',    tcpRetranRef.value,    TCP_RETRAN,     '#ee6666', '%')
  upsertLine('tcp-conn',      tcpConnRef.value,      TCP_CONN,       '#5470c6', 'ms')
  upsertLine('dns-latency',   dnsLatencyRef.value,   DNS_LATENCY,    '#91cc75', 'ms')
  upsertLine('dns-fail',      dnsFailRef.value,      DNS_FAIL,       '#fc8452', '%')
  upsertLine('http-latency',  httpLatencyRef.value,  HTTP_LATENCY,   '#5470c6', 'ms')
  upsertLine('http-error',    httpErrorRef.value,    HTTP_ERROR,     '#ee6666', '%')
  upsertLine('https-hand',    httpsHandshakeRef.value, HTTPS_HANDSHAKE,'#9a60b4', 'ms')
  upsertLine('https-cert',    httpsCertRef.value,    HTTPS_CERT,     '#ff9f7f', '%')
}

// When the visible protocol switches, echarts' hidden panels may need a
// resize once their container gains layout dimensions.
watch(activeProtocol, () => nextTick(() => { renderCharts(); resizeCharts() }))
onMounted(() => {
  nextTick(renderCharts)
  window.addEventListener('resize', resizeCharts)
})
onBeforeUnmount(() => {
  charts.forEach(c => c.dispose()); charts.clear()
  window.removeEventListener('resize', resizeCharts)
})
</script>

<style scoped>
.card-header { display: flex; align-items: center; justify-content: space-between; }
.chart-title { font-size: 13px; color: var(--el-text-color-secondary); margin: 0 0 8px 0; font-weight: 500; }
.chart-box { height: 260px; }
</style>
