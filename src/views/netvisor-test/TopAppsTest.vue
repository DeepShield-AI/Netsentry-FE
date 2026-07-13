<template>
  <div class="nvt-page">
    <div class="nvt-card">
      <div class="nvt-card-header">
        <span>Top应用</span>
        <span style="font-size: 13px; font-weight: 400; color: #909399;">
          共 {{ mockData.length }} 个应用
        </span>
      </div>
      <div class="nvt-card-body">
        <div ref="chartContainer" class="nvt-chart-xl" style="margin-bottom: 16px;"></div>
        <table class="nvt-table-wrap">
          <thead>
            <tr>
              <th>排名</th>
              <th>应用名称</th>
              <th>连接数</th>
              <th>上行速率</th>
              <th>下行速率</th>
              <th>总流量</th>
              <th>流量占比</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="app in mockData" :key="app.key">
              <td>
                <span v-if="app.rank <= 3" class="nvt-tag" :class="app.rank === 1 ? 'nvt-tag-gold' : app.rank === 2 ? 'nvt-tag-silver' : 'nvt-tag-orange'">
                  {{ app.rank }}
                </span>
                <span v-else>{{ app.rank }}</span>
              </td>
              <td>{{ app.name }}</td>
              <td>{{ fmtInt(app.connections) }}</td>
              <td>{{ app.upstream }}</td>
              <td>{{ app.downstream }}</td>
              <td>{{ app.totalTraffic }}</td>
              <td>{{ app.ratio }}</td>
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
    const apps = ['HTTP', 'HTTPS', 'DNS', 'FTP', 'SSH', 'SMTP', 'POP3', 'IMAP', 'Telnet', 'RDP',
      'MySQL', 'Redis', 'MongoDB', 'BitTorrent', 'eMule', 'QQ', '微信', '钉钉', '企业微信',
      '抖音', '快手', 'B站', '爱奇艺', '腾讯视频', '王者荣耀']
    const upstream = Math.random() * 100 + 1
    const downstream = Math.random() * 500 + 10
    return {
      key: String(i + 1),
      rank: i + 1,
      name: apps[i],
      connections: Math.floor(Math.random() * 5000 + 100),
      upstream: `${upstream.toFixed(2)} MB/s`,
      downstream: `${downstream.toFixed(2)} MB/s`,
      totalTraffic: `${(upstream + downstream).toFixed(2)} MB/s`,
      ratio: `${((upstream + downstream) / 600 * 100).toFixed(1)}%`,
    }
  })
)

const chartContainer = ref(null)
let chart = null

const fmtInt = (n) => Number(n).toLocaleString('zh-CN')

onMounted(() => {
  if (chartContainer.value) {
    chart = echarts.init(chartContainer.value)
    chart.setOption({
      title: { text: 'Top应用流量分布', left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      xAxis: {
        type: 'category',
        data: mockData.value.slice(0, 10).map((d) => d.name),
        axisLabel: { rotate: 30 },
      },
      yAxis: { type: 'value', name: 'MB/s' },
      series: [
        {
          name: '上行',
          type: 'bar',
          stack: 'total',
          data: mockData.value.slice(0, 10).map((d) => parseFloat(d.upstream)),
          itemStyle: { color: '#2a88e6' },
        },
        {
          name: '下行',
          type: 'bar',
          stack: 'total',
          data: mockData.value.slice(0, 10).map((d) => parseFloat(d.downstream)),
          itemStyle: { color: '#52c41a' },
        },
      ],
      legend: { data: ['上行', '下行'], bottom: 0 },
      grid: { left: 60, right: 20, top: 40, bottom: 60 },
    })
  }
})

onBeforeUnmount(() => {
  if (chart) chart.dispose()
})
</script>
