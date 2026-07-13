<template>
  <div class="nvt-page">
    <div class="nvt-card">
      <div class="nvt-card-header">
        <span>Top连接</span>
        <span style="font-size: 13px; font-weight: 400; color: #909399;">
          共 {{ mockData.length }} 条连接
        </span>
      </div>
      <div class="nvt-card-body">
        <div ref="chartContainer" class="nvt-chart-lg" style="margin-bottom: 16px;"></div>
        <table class="nvt-table-wrap">
          <thead>
            <tr>
              <th>排名</th>
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
            <tr v-for="conn in mockData" :key="conn.key">
              <td>
                <span v-if="conn.rank <= 3" class="nvt-tag" :class="conn.rank === 1 ? 'nvt-tag-gold' : conn.rank === 2 ? 'nvt-tag-silver' : 'nvt-tag-orange'">
                  {{ conn.rank }}
                </span>
                <span v-else>{{ conn.rank }}</span>
              </td>
              <td>{{ conn.srcIp }}</td>
              <td>{{ conn.dstIp }}</td>
              <td>{{ conn.dstPort }}</td>
              <td>
                <span class="nvt-tag" :class="conn.protocol === 'TCP' ? 'nvt-tag-blue' : conn.protocol === 'UDP' ? 'nvt-tag-green' : 'nvt-tag-orange'">
                  {{ conn.protocol }}
                </span>
              </td>
              <td>
                <span class="nvt-tag" :class="getStatusClass(conn.status)">
                  {{ conn.status }}
                </span>
              </td>
              <td>
                <div class="nvt-conn-bar-wrap">
                  <div class="nvt-conn-bar">
                    <div class="nvt-conn-bar-fill" :style="{ width: (conn.connections / maxConn * 100) + '%' }"></div>
                  </div>
                  <span>{{ fmtInt(conn.connections) }}</span>
                </div>
              </td>
              <td>{{ conn.duration }}</td>
              <td>{{ conn.upstream }}</td>
              <td>{{ conn.downstream }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import './nv-test-shared.css'

const mockData = ref(
  Array.from({ length: 30 }, (_, i) => {
    const protocols = ['TCP', 'UDP', 'ICMP']
    const statuses = ['ESTABLISHED', 'TIME_WAIT', 'SYN_SENT', 'CLOSE_WAIT', 'FIN_WAIT']
    const srcIp = `192.168.1.${100 + Math.floor(i / 3)}`
    const dstIp = `10.${Math.floor(i / 256)}.${i % 256}.${Math.floor(Math.random() * 255)}`
    const connections = Math.floor(Math.random() * 8000 + 200)
    return {
      key: String(i + 1),
      rank: i + 1,
      srcIp,
      dstIp,
      dstPort: [80, 443, 8080, 22, 3306, 6379, 53, 25, 110, 143][i % 10],
      protocol: protocols[i % 3],
      status: statuses[i % 5],
      connections,
      duration: `${Math.floor(Math.random() * 24)}小时${Math.floor(Math.random() * 60)}分钟`,
      upstream: `${(Math.random() * 50 + 1).toFixed(2)} MB`,
      downstream: `${(Math.random() * 200 + 10).toFixed(2)} MB`,
    }
  })
)

const maxConn = computed(() => Math.max(...mockData.value.map((d) => d.connections)))

const chartContainer = ref(null)
let chart = null

const fmtInt = (n) => Number(n).toLocaleString('zh-CN')

const getStatusClass = (status) => {
  const map = {
    'ESTABLISHED': 'green',
    'TIME_WAIT': 'blue',
    'SYN_SENT': 'orange',
    'CLOSE_WAIT': 'red',
    'FIN_WAIT': 'default'
  }
  return 'nvt-tag-' + (map[status] || 'default')
}

onMounted(() => {
  if (chartContainer.value) {
    chart = echarts.init(chartContainer.value)
    chart.setOption({
      title: { text: 'Top连接分布', left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      xAxis: {
        type: 'category',
        data: mockData.value.slice(0, 10).map((d) => d.srcIp),
        axisLabel: { rotate: 30, fontSize: 10 },
      },
      yAxis: { type: 'value', name: '连接数' },
      series: [
        {
          type: 'bar',
          data: mockData.value.slice(0, 10).map((d) => d.connections),
          itemStyle: { color: '#2a88e6' },
        },
      ],
      grid: { left: 60, right: 20, top: 40, bottom: 60 },
    })
  }
})

onBeforeUnmount(() => {
  if (chart) chart.dispose()
})
</script>
