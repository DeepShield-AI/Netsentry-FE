<template>
  <div class="nvt-page">
    <div class="nvt-card">
      <div class="nvt-card-header">
        <span>域名概况</span>
        <span style="font-size: 13px; font-weight: 400; color: #909399;">
          共 {{ mockData.length }} 个域名
        </span>
      </div>
      <div class="nvt-card-body">
        <div class="nvt-charts-row">
          <div ref="pieChart" class="nvt-chart-lg"></div>
          <div ref="barChart" class="nvt-chart-lg"></div>
        </div>
        <table class="nvt-table-wrap">
          <thead>
            <tr>
              <th>排名</th>
              <th>域名</th>
              <th>分类</th>
              <th>查询次数</th>
              <th>用户数</th>
              <th>平均时延</th>
              <th>成功率</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="domain in mockData" :key="domain.key">
              <td>
                <span v-if="domain.rank <= 3" class="nvt-tag" :class="domain.rank === 1 ? 'nvt-tag-gold' : domain.rank === 2 ? 'nvt-tag-silver' : 'nvt-tag-orange'">
                  {{ domain.rank }}
                </span>
                <span v-else>{{ domain.rank }}</span>
              </td>
              <td>{{ domain.domain }}</td>
              <td>
                <span class="nvt-tag" :class="getCategoryClass(domain.category)">
                  {{ domain.category }}
                </span>
              </td>
              <td>{{ fmtInt(domain.queries) }}</td>
              <td>{{ fmtInt(domain.users) }}</td>
              <td>{{ domain.avgLatency }}</td>
              <td>{{ domain.successRate }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import './nv-test-shared.css'

const mockData = ref(
  Array.from({ length: 25 }, (_, i) => {
    const domains = [
      'www.baidu.com', 'www.google.com', 'www.taobao.com', 'www.jd.com', 'www.qq.com',
      'www.weibo.com', 'www.bilibili.com', 'www.zhihu.com', 'www.douyin.com', 'www.kuaishou.com',
      'www.tmall.com', 'www.163.com', 'www.sohu.com', 'www.sina.com.cn', 'www.csdn.net',
      'www.github.com', 'www.stackoverflow.com', 'www.microsoft.com', 'www.apple.com', 'www.amazon.com',
      'www.netflix.com', 'www.youtube.com', 'www.twitter.com', 'www.facebook.com', 'www.linkedin.com',
    ]
    const queries = Math.floor(Math.random() * 50000 + 1000)
    const users = Math.floor(Math.random() * 500 + 10)
    return {
      key: String(i + 1),
      rank: i + 1,
      domain: domains[i],
      queries,
      users,
      avgLatency: `${(Math.random() * 50 + 5).toFixed(1)} ms`,
      successRate: `${(95 + Math.random() * 5).toFixed(1)}%`,
      category: ['搜索引擎', '电商', '社交', '视频', '新闻', '技术', '其他'][i % 7],
    }
  })
)

const pieChart = ref(null)
const barChart = ref(null)
let pieInstance = null
let barInstance = null

const fmtInt = (n) => Number(n).toLocaleString('zh-CN')

const getCategoryClass = (category) => {
  const map = {
    '搜索引擎': 'blue',
    '电商': 'green',
    '社交': 'purple',
    '视频': 'red',
    '新闻': 'orange',
    '技术': 'cyan',
    '其他': 'default',
  }
  return 'nvt-tag-' + (map[category] || 'default')
}

onMounted(() => {
  // Pie chart
  if (pieChart.value) {
    pieInstance = echarts.init(pieChart.value)
    pieInstance.setOption({
      title: { text: '域名分类分布', left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { trigger: 'item' },
      legend: { bottom: 0 },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
          label: { show: true, formatter: '{b}: {d}%' },
          data: [
            { value: Math.floor(Math.random() * 1000 + 100), name: '搜索引擎', itemStyle: { color: '#409eff' } },
            { value: Math.floor(Math.random() * 1000 + 100), name: '电商', itemStyle: { color: '#67c23a' } },
            { value: Math.floor(Math.random() * 1000 + 100), name: '社交', itemStyle: { color: '#909399' } },
            { value: Math.floor(Math.random() * 1000 + 100), name: '视频', itemStyle: { color: '#f56c6c' } },
            { value: Math.floor(Math.random() * 1000 + 100), name: '新闻', itemStyle: { color: '#e6a23c' } },
            { value: Math.floor(Math.random() * 1000 + 100), name: '技术', itemStyle: { color: '#67c23a' } },
            { value: Math.floor(Math.random() * 1000 + 100), name: '其他', itemStyle: { color: '#909399' } },
          ],
        },
      ],
    })
  }

  // Bar chart
  if (barChart.value) {
    barInstance = echarts.init(barChart.value)
    barInstance.setOption({
      title: { text: 'Top域名查询次数', left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      xAxis: {
        type: 'category',
        data: mockData.value.slice(0, 10).map((d) => d.domain),
        axisLabel: { rotate: 30, fontSize: 10 },
      },
      yAxis: { type: 'value', name: '查询次数' },
      series: [
        {
          type: 'bar',
          data: mockData.value.slice(0, 10).map((d) => d.queries),
          itemStyle: { color: '#2a88e6' },
        },
      ],
      grid: { left: 60, right: 20, top: 40, bottom: 60 },
    })
  }
})

onBeforeUnmount(() => {
  if (pieInstance) pieInstance.dispose()
  if (barInstance) barInstance.dispose()
})
</script>
