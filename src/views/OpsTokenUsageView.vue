<template>
  <div class="ops-token-usage">
    <h2>Token 使用统计</h2>

    <!-- Summary Cards -->
    <div class="summary-cards">
      <div class="card">
        <div class="card-value">{{ stats.total_requests }}</div>
        <div class="card-label">总请求数</div>
      </div>
      <div class="card">
        <div class="card-value">{{ formatNumber(stats.total_tokens) }}</div>
        <div class="card-label">总 Tokens</div>
      </div>
      <div class="card">
        <div class="card-value">{{ formatNumber(stats.total_prompt_tokens) }}</div>
        <div class="card-label">输入 Tokens</div>
      </div>
      <div class="card">
        <div class="card-value">{{ formatNumber(stats.total_completion_tokens) }}</div>
        <div class="card-label">输出 Tokens</div>
      </div>
      <div class="card card-cost">
        <div class="card-value cost-value">¥{{ formatCost(stats.total_cost_yuan) }}</div>
        <div class="card-label">累计费用</div>
      </div>
    </div>

    <!-- Pricing Info -->
    <div class="section pricing-section" v-if="stats.pricing">
      <h3>定价信息</h3>
      <div class="pricing-row">
        <span class="pricing-item">输入: <b>¥{{ stats.pricing.input_price_per_million }}/百万tokens</b></span>
        <span class="pricing-item">输出: <b>¥{{ stats.pricing.output_price_per_million }}/百万tokens</b></span>
        <span class="pricing-item">币种: <b>{{ stats.pricing.currency }}</b></span>
      </div>
    </div>

    <!-- API Key Info -->
    <div class="section">
      <h3>当前 API Key</h3>
      <div class="apikey-info">
        <span class="key-mask">{{ stats.api_key_display || '未配置' }}</span>
        <el-tag size="small" type="success">活跃</el-tag>
      </div>
    </div>

    <!-- Per-user breakdown -->
    <div class="section" v-if="stats.by_user && stats.by_user.length > 0">
      <h3>用户用量分布</h3>
      <div class="user-cards">
        <div v-for="u in stats.by_user" :key="u.username" class="user-card">
          <div class="user-name">{{ u.username }}</div>
          <div class="user-stat">{{ u.requests }} 次请求 · {{ formatNumber(u.total_tokens) }} tokens</div>
          <div class="user-cost">¥{{ formatCost(u.cost_yuan) }}</div>
        </div>
      </div>
    </div>

    <!-- Usage Chart -->
    <div class="section">
      <h3>近期使用趋势</h3>
      <div ref="chartEl" class="usage-chart"></div>
    </div>

    <!-- History Table -->
    <div class="section">
      <h3>请求记录（最近 50 条）</h3>
      <el-table :data="stats.entries" stripe size="small" max-height="400">
        <el-table-column prop="timestamp" label="时间" width="180">
          <template #default="{ row }">{{ formatTime(row.timestamp) }}</template>
        </el-table-column>
        <el-table-column prop="username" label="用户" width="100" />
        <el-table-column prop="api_key_prefix" label="API Key" width="140">
          <template #default="{ row }"><code class="key-cell">{{ row.api_key_prefix }}</code></template>
        </el-table-column>
        <el-table-column prop="question" label="问题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="rounds" label="轮次" width="60" align="center" />
        <el-table-column prop="prompt_tokens" label="输入" width="80" align="right">
          <template #default="{ row }">{{ row.prompt_tokens.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column prop="completion_tokens" label="输出" width="80" align="right">
          <template #default="{ row }">{{ row.completion_tokens.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column prop="total_tokens" label="总计" width="90" align="right">
          <template #default="{ row }">
            <span class="token-total">{{ row.total_tokens.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="cost_yuan" label="费用(¥)" width="90" align="right">
          <template #default="{ row }">{{ formatCost(row.cost_yuan) }}</template>
        </el-table-column>
      </el-table>
    </div>

    <div class="refresh-row">
      <el-button size="small" @click="loadData" :loading="loading">刷新数据</el-button>
      <span class="last-update" v-if="lastUpdate">最后更新: {{ lastUpdate }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { api } from '@/api/client'
import * as echarts from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([BarChart, LineChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer])

interface AuditEntry {
  timestamp: string
  username: string
  api_key_prefix: string
  question: string
  rounds: number
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
  cost_yuan: number
}

interface UserSummary {
  username: string
  requests: number
  total_tokens: number
  cost_yuan: number
}

interface PricingInfo {
  input_price_per_million: number
  output_price_per_million: number
  currency: string
  multiplier_vs_deepseek: number
}

interface AuditStats {
  total_requests: number
  total_prompt_tokens: number
  total_completion_tokens: number
  total_tokens: number
  total_cost_yuan: number
  api_key_display: string
  pricing: PricingInfo | null
  by_user: UserSummary[]
  entries: AuditEntry[]
}

const stats = ref<AuditStats>({
  total_requests: 0,
  total_prompt_tokens: 0,
  total_completion_tokens: 0,
  total_tokens: 0,
  total_cost_yuan: 0,
  api_key_display: '',
  pricing: null,
  by_user: [],
  entries: [],
})

const loading = ref(false)
const lastUpdate = ref('')
const chartEl = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null

async function loadData() {
  loading.value = true
  try {
    const data = await api.chatAudit()
    stats.value = data
    lastUpdate.value = new Date().toLocaleTimeString()
    await nextTick()
    renderChart()
  } catch (err) {
    console.error('Failed to load token audit:', err)
  } finally {
    loading.value = false
  }
}

function formatNumber(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toString()
}

function formatCost(n: number | undefined) {
  if (!n) return '0.00'
  if (n >= 1) return n.toFixed(2)
  if (n >= 0.01) return n.toFixed(4)
  return n.toFixed(6)
}

function formatTime(ts: string) {
  const d = new Date(ts)
  return d.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function renderChart() {
  if (!chartEl.value || stats.value.entries.length === 0) return
  if (!chartInstance) {
    chartInstance = echarts.init(chartEl.value)
  }

  // Aggregate by hour
  const hourMap = new Map<string, { prompt: number; completion: number }>()
  for (const e of stats.value.entries) {
    const d = new Date(e.timestamp)
    const key = `${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:00`
    const existing = hourMap.get(key) || { prompt: 0, completion: 0 }
    existing.prompt += e.prompt_tokens
    existing.completion += e.completion_tokens
    hourMap.set(key, existing)
  }

  const hours = Array.from(hourMap.keys())
  const promptData = hours.map(h => hourMap.get(h)!.prompt)
  const completionData = hours.map(h => hourMap.get(h)!.completion)

  chartInstance.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['输入 Tokens', '输出 Tokens'] },
    grid: { left: 60, right: 20, top: 40, bottom: 30 },
    xAxis: { type: 'category', data: hours },
    yAxis: { type: 'value', name: 'Tokens' },
    series: [
      { name: '输入 Tokens', type: 'bar', stack: 'total', data: promptData, itemStyle: { color: '#409eff' } },
      { name: '输出 Tokens', type: 'bar', stack: 'total', data: completionData, itemStyle: { color: '#67c23a' } },
    ],
  })
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.ops-token-usage {
  padding: 24px;
  max-width: 1100px;
}
h2 {
  margin-bottom: 20px;
  font-size: 20px;
  font-weight: 600;
}
h3 {
  margin-bottom: 12px;
  font-size: 15px;
  font-weight: 500;
  color: #333;
}
.summary-cards {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 28px;
}
.card {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.card-value {
  font-size: 28px;
  font-weight: 700;
  color: #409eff;
}
.card-label {
  font-size: 13px;
  color: #909399;
  margin-top: 6px;
}
.section {
  margin-bottom: 24px;
}
.apikey-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: #f5f7fa;
  border-radius: 6px;
  font-family: monospace;
}
.key-mask {
  font-size: 14px;
  color: #606266;
}
.usage-chart {
  width: 100%;
  height: 260px;
  background: #fafafa;
  border-radius: 6px;
}
.token-total {
  font-weight: 600;
  color: #409eff;
}
.refresh-row {
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.last-update {
  font-size: 12px;
  color: #999;
}
.user-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.user-card {
  background: #f5f7fa;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 12px 18px;
  min-width: 160px;
}
.user-name {
  font-weight: 600;
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
}
.user-stat {
  font-size: 12px;
  color: #909399;
}
.key-cell {
  font-size: 11px;
  color: #606266;
  background: #f0f2f5;
  padding: 2px 4px;
  border-radius: 3px;
}
.card-cost {
  border-color: #f5a623;
}
.cost-value {
  color: #f5a623 !important;
}
.pricing-section .pricing-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 12px 16px;
  background: #f5f7fa;
  border-radius: 6px;
  font-size: 14px;
  color: #606266;
}
.pricing-item b {
  color: #303133;
}
.user-cost {
  font-size: 13px;
  font-weight: 600;
  color: #f5a623;
  margin-top: 4px;
}
</style>
