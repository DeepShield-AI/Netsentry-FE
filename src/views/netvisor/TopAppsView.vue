<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav" role="tablist">
        <button type="button" class="nv-tab" :class="{ active: activeTab === 'top' }" role="tab" @click="activeTab = 'top'">Top应用</button>
        <button type="button" class="nv-tab" :class="{ active: activeTab === 'protocol' }" role="tab" @click="activeTab = 'protocol'">协议统计</button>
      </div>
    </div>
    <div class="nv-tabs-body">
      <!-- Top应用 Tab -->
      <div v-show="activeTab === 'top'" class="to-dashboard-scroll">
        <div class="to-dashboard">
          <!-- 过滤栏面板 -->
          <div class="to-chart-row">
            <div class="to-chart-panel to-chart-panel-full" data-chart="filter-top">
              <!-- 过滤条件：只保留自动刷新和搜索 -->
              <div class="to-filter-container">
                <div class="to-filter-row-simple">
                  <label class="to-filter-item">
                    <span class="to-filter-label">自动刷新</span>
                    <select class="to-filter-select" v-model="refreshInterval">
                      <option value="0">不刷新</option>
                      <option value="5">5秒</option>
                      <option value="10">10秒</option>
                      <option value="30">30秒</option>
                      <option value="60">1分钟</option>
                    </select>
                  </label>

                  <label class="to-filter-item">
                    <span class="to-filter-label">网桥链路</span>
                    <select class="to-filter-select" v-model="linkFilter">
                      <option value="all">所有链路</option>
                      <option value="eth0">eth0</option>
                      <option value="eth1">eth1</option>
                      <option value="br0">br0</option>
                      <option value="br1">br1</option>
                    </select>
                  </label>

                  <label class="to-filter-item">
                    <span class="to-filter-label">协议类型</span>
                    <select class="to-filter-select" v-model="protocolType">
                      <option value="IPv4">IPv4</option>
                      <option value="IPv6">IPv6</option>
                      <option value="all">全部</option>
                    </select>
                  </label>

                  <label class="to-filter-item">
                    <span class="to-filter-label">应用协议</span>
                    <select class="to-filter-select" v-model="appProtocol">
                      <option value="any">任意协议</option>
                      <option value="HTTP">HTTP</option>
                      <option value="HTTPS">HTTPS</option>
                      <option value="TCP">TCP</option>
                      <option value="UDP">UDP</option>
                      <option value="DNS">DNS</option>
                      <option value="SSH">SSH</option>
                    </select>
                  </label>

                  <div class="to-search-box">
                    <input type="text" class="to-input" placeholder="关键字搜索..." v-model="keyword" />
                    <button type="button" class="to-btn-primary" @click="handleSearch">搜索</button>
                  </div>
                </div>
              </div>

              <!-- 分界线 -->
              <div class="to-divider"></div>

              <!-- Top应用表格 -->
              <div class="to-table-wrapper">
                <table class="to-table-data">
                  <thead>
                    <tr>
                      <th style="width:40px"><input type="checkbox" /></th>
                      <th>协议名称</th>
                      <th>连接数 <span class="sort-icon">⇅</span></th>
                      <th>流入bps <span class="sort-icon">⇅</span></th>
                      <th>流出bps <span class="sort-icon">⇅</span></th>
                      <th>代理流入bps <span class="sort-icon">⇅</span></th>
                      <th>代理流出bps <span class="sort-icon">⇅</span></th>
                      <th style="width:180px">累计流量 <span class="sort-icon">⇅</span></th>
                      <th style="width:180px">最近10分钟流量 <span class="sort-icon">⇅</span></th>
                      <th style="width:80px">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, idx) in pagedTopApps" :key="row.name" :class="{ 'to-row-active': idx % 2 === 0 }">
                      <td><input type="checkbox" /></td>
                      <td><a href="#" class="to-link-text">{{ row.name }}</a></td>
                      <td class="to-num-cell">{{ row.connections.toLocaleString() }}</td>
                      <td class="to-num-cell">{{ row.inBps }}</td>
                      <td class="to-num-cell">{{ row.outBps }}</td>
                      <td class="to-num-cell">{{ row.proxyInBps || '-' }}</td>
                      <td class="to-num-cell">{{ row.proxyOutBps || '-' }}</td>
                      <td>
                        <div class="to-progress-wrap">
                          <div class="to-progress-track">
                            <div class="to-progress-bar" :style="{ width: row.totalPercent + '%' }"></div>
                          </div>
                          <span class="to-progress-text">{{ row.totalPercent }}%</span>
                        </div>
                        <div class="to-value-below">{{ row.totalTraffic }}</div>
                      </td>
                      <td>
                        <div class="to-progress-wrap">
                          <div class="to-progress-track to-progress-blue">
                            <div class="to-progress-bar to-bar-blue" :style="{ width: row.recentPercent + '%' }"></div>
                          </div>
                          <span class="to-progress-text">{{ row.recentPercent }}%</span>
                        </div>
                        <div class="to-value-below">{{ row.recentTraffic }}</div>
                      </td>
                      <td>
                        <div class="to-action-group">
                          <button type="button" class="to-icon-btn" title="详情" @click="handleDetailView(row)">📊</button>
                          <button type="button" class="to-icon-btn" title="下载" @click="handleDownload(row)">📥</button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- 分页 -->
              <div class="to-pagination-bar">
                <div class="to-page-info">
                  <span>共 {{ filteredTopApps.length }} 条</span>
                </div>
                <div class="to-page-controls">
                  <button type="button" class="to-page-btn" :disabled="currentPage === 1" @click="currentPage--">&lt;</button>
                  <template v-for="p in visiblePages" :key="'tp-' + p">
                    <button v-if="p !== '...'" type="button" 
                            class="to-page-num" 
                            :class="{ active: p === currentPage }" 
                            @click="currentPage = p">{{ p }}</button>
                    <span v-else class="to-page-dots">...</span>
                  </template>
                  <button type="button" class="to-page-btn" :disabled="currentPage === totalPages" @click="currentPage++">&gt;</button>
                </div>
                <div class="to-page-jump">
                  <span>到第</span>
                  <input type="text" class="to-jump-input" v-model.number="gotoPage" />
                  <span>页</span>
                  <button type="button" class="to-btn-default" @click="jumpToPage">确定</button>
                  <select class="to-size-selector" v-model="pageSize">
                      <option value="20">20条/页</option>
                      <option value="50">50条/页</option>
                      <option value="100">100条/页</option>
                    </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 协议统计 Tab -->
      <div v-show="activeTab === 'protocol'" class="to-dashboard-scroll">
        <div class="to-dashboard">
          <!-- 过滤栏面板 -->
          <div class="to-chart-row">
            <div class="to-chart-panel to-chart-panel-full" data-chart="filter-proto">
              <!-- 过滤条件：只保留核心过滤项 -->
              <div class="to-filter-container">
                <div class="to-filter-row-simple">
                  <label class="to-filter-item">
                    <span class="to-filter-label">网桥链路</span>
                    <select class="to-filter-select" v-model="linkFilterProto">
                      <option value="all">所有链路</option>
                      <option value="eth0">eth0</option>
                      <option value="eth1">eth1</option>
                      <option value="br0">br0</option>
                      <option value="br1">br1</option>
                    </select>
                  </label>

                  <label class="to-filter-item">
                    <span class="to-filter-label">协议类型</span>
                    <select class="to-filter-select" v-model="protocolTypeProto">
                      <option value="IPv4">IPv4</option>
                      <option value="IPv6">IPv6</option>
                      <option value="all">全部</option>
                    </select>
                  </label>

                  <label class="to-filter-item">
                    <span class="to-filter-label">应用协议</span>
                    <select class="to-filter-select" v-model="protoAppFilter">
                      <option value="any">任意协议</option>
                      <option value="HTTP">HTTP</option>
                      <option value="HTTPS">HTTPS</option>
                      <option value="TCP">TCP</option>
                      <option value="UDP">UDP</option>
                      <option value="DNS">DNS</option>
                      <option value="SSH">SSH</option>
                    </select>
                  </label>

                  <label class="to-filter-item">
                    <span class="to-filter-label">任意协议</span>
                    <select class="to-filter-select" v-model="anyProtoFilter">
                      <option value="all">全部</option>
                      <option value="tcp">TCP</option>
                      <option value="udp">UDP</option>
                    </select>
                  </label>

                  <div class="to-search-box">
                    <input type="text" class="to-input" placeholder="关键字搜索..." v-model="protoKeyword" />
                    <button type="button" class="to-btn-primary" @click="handleProtoSearch">搜索</button>
                  </div>
                </div>
              </div>

              <!-- 分界线 -->
              <div class="to-divider"></div>

              <!-- 协议统计表格 -->
              <div class="to-table-wrapper">
                <table class="to-table-data">
                  <thead>
                    <tr>
                      <th style="width:60px">序号</th>
                      <th>应用/协议</th>
                      <th>连接数 <span class="sort-icon">⇅</span></th>
                      <th>流入bps <span class="sort-icon">⇅</span></th>
                      <th>流出bps <span class="sort-icon">⇅</span></th>
                      <th>总bps <span class="sort-icon">⇅</span></th>
                      <th>流入流量 <span class="sort-icon">⇅</span></th>
                      <th>流出流量 <span class="sort-icon">⇅</span></th>
                      <th style="width:180px">总流量 <span class="sort-icon">⇅</span></th>
                      <th style="width:80px">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, idx) in pagedProtocols" :key="row.name" :class="{ 'to-row-active': idx % 2 === 0 }">
                      <td>{{ (currentPageProto - 1) * pageSizeProto + idx + 1 }}</td>
                      <td><a href="#" class="to-link-text">{{ row.name }}</a></td>
                      <td class="to-num-cell">{{ row.connections.toLocaleString() }}</td>
                      <td class="to-num-cell">{{ row.inBps }}</td>
                      <td class="to-num-cell">{{ row.outBps }}</td>
                      <td class="to-num-cell">{{ row.totalBps }}</td>
                      <td class="to-num-cell">{{ row.inTraffic }}</td>
                      <td class="to-num-cell">{{ row.outTraffic }}</td>
                      <td>
                        <div class="to-progress-wrap">
                          <div class="to-progress-track">
                            <div class="to-progress-bar" :style="{ width: row.totalPercent + '%' }"></div>
                          </div>
                          <span class="to-progress-text">{{ row.totalPercent }}%</span>
                        </div>
                        <div class="to-value-below">{{ row.totalTraffic }}</div>
                      </td>
                      <td>
                        <div class="to-action-group">
                          <button type="button" class="to-icon-btn" title="详情" @click="handleProtoView(row)">📊</button>
                          <button type="button" class="to-icon-btn" title="趋势" @click="handleProtoTrend(row)">📈</button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- 分页 -->
              <div class="to-pagination-bar">
                <div class="to-page-info">
                  <span>共 {{ filteredProtocols.length }} 条</span>
                </div>
                <div class="to-page-controls">
                  <button type="button" class="to-page-btn" :disabled="currentPageProto === 1" @click="currentPageProto--">&lt;</button>
                  <template v-for="p in visiblePagesProto" :key="'pp-' + p">
                    <button v-if="p !== '...'" type="button" 
                            class="to-page-num" 
                            :class="{ active: p === currentPageProto }" 
                            @click="currentPageProto = p">{{ p }}</button>
                    <span v-else class="to-page-dots">...</span>
                  </template>
                  <button type="button" class="to-page-btn" :disabled="currentPageProto === totalPagesProto" @click="currentPageProto++">&gt;</button>
                </div>
                <div class="to-page-jump">
                  <span>到第</span>
                  <input type="text" class="to-jump-input" v-model.number="gotoPageProto" />
                  <span>页</span>
                  <button type="button" class="to-btn-default" @click="jumpToPageProto">确定</button>
                  <select class="to-size-selector" v-model="pageSizeProto">
                      <option value="20">20条/页</option>
                      <option value="50">50条/页</option>
                      <option value="100">100条/页</option>
                    </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { mockTopApps, mockStats } from './mock-data'

const activeTab = ref<'top' | 'protocol'>('top')

// Top应用相关状态
const refreshInterval = ref('0')
const linkFilter = ref('all')
const protocolType = ref('IPv4')
const appProtocol = ref('any')
const keyword = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const gotoPage = ref(1)

// 协议统计相关状态
const protoAppFilter = ref('any')
const anyProtoFilter = ref('all')
const linkFilterProto = ref('all')
const protocolTypeProto = ref('IPv4')
const timeRange = ref('2026-07-15 10:42:51 - 2026-07-15 10:57:51')
const currentPageProto = ref(1)
const pageSizeProto = ref(20)
const gotoPageProto = ref(1)

// Top应用基础名称列表
const appNames = [
  '其它HTTPS', 'WWW', 'RSync', '其它下载', 'TCP下载及视频', '无连接TCP',
  'RTMP', '未知应用', 'IMAP', '未知80端口', 'HTTP', 'HTTPS', 'DNS',
  'SSH', 'FTP', 'SMTP', 'POP3', 'Telnet', 'SNMP', 'LDAP', 'MySQL',
  'PostgreSQL', 'MongoDB', 'Redis', 'Memcached', 'RabbitMQ', 'Kafka',
  'Elasticsearch', 'Docker', 'Kubernetes', 'gRPC', 'WebSocket', 'QUIC'
]

// 协议统计基础名称列表
const protocolNames = [
  '其它HTTPS', 'WWW', 'RSync', '其它下载', '无连接TCP', 'RTMP',
  'TCP下载及视频', '未知应用', 'IMAP', '未知80端口', 'HTTP/2', 'SPDY',
  'DNS-UDP', 'DNS-TCP', 'TLSv1.2', 'TLSv1.3', 'SSHv2', 'SFTP',
  'FTP-Control', 'FTP-Data', 'SMTP-TLS', 'IMAPS', 'POP3S', 'Telnet-SSL',
  'SNMPv3', 'LDAPS', 'MySQL-SSL', 'PostgreSQL-SSL', 'MongoDB-SCRAM',
  'Redis-AUTH', 'AMQP-SSL', 'Kafka-SASL', 'ES-HTTPS', 'Docker-API',
  'K8s-API', 'gRPC-TLS', 'WSS', 'QUIC-HTTP3'
]

// 随机数生成辅助函数
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const randomFloat = (min: number, max: number, decimals: number = 2) => (Math.random() * (max - min) + min).toFixed(decimals)

// 格式化流量单位
function formatBps(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(2)} G`
  if (value >= 1000) return `${(value / 1000).toFixed(2)} M`
  return `${value.toFixed(2)} K`
}

function formatTraffic(value: number): string {
  if (value >= 1024) return `${(value / 1024).toFixed(2)} T`
  return `${value.toFixed(2)} G`
}

// 生成Top应用模拟数据（500条）
function generateTopAppsData(count: number = 500) {
  const data = []
  
  // 前10条使用固定的大流量数据
  const topItems = [
    { name: '其它HTTPS', baseConn: 112232, baseIn: 23058.60, weight: 64.31 },
    { name: 'WWW', baseConn: 17474, baseIn: 6452.77, weight: 8.70 },
    { name: 'RSync', baseConn: 602, baseIn: 2246.38, weight: 16.67 },
    { name: '其它下载', baseConn: 4734, baseIn: 2099.27, weight: 2.06 },
    { name: 'TCP下载及视频', baseConn: 0, baseIn: 612.67, weight: 2.08 },
    { name: '无连接TCP', baseConn: 11816, baseIn: 686.49, weight: 2.33 },
    { name: 'RTMP', baseConn: 306, baseIn: 509.62, weight: 1.26 },
    { name: '未知应用', baseConn: 17684, baseIn: 192.33, weight: 0.49 },
    { name: 'IMAP', baseConn: 6180, baseIn: 123.80, weight: 0.17 },
    { name: '未知80端口', baseConn: 109, baseIn: 60.65, weight: 0.10 }
  ]
  
  for (let i = 0; i < count; i++) {
    let item
    
    if (i < topItems.length) {
      // 前10条使用固定的真实数据
      const t = topItems[i]
      item = {
        name: t.name,
        connections: t.baseConn,
        inBps: `${t.baseIn.toFixed(2)}M`,
        outBps: `${(t.baseIn * randomFloat(0.02, 0.15)).toFixed(2)}M`,
        proxyInBps: 0,
        proxyOutBps: 0,
        totalPercent: t.weight,
        totalTraffic: `${(t.baseIn * randomFloat(150, 200)).toFixed(2)}G`,
        recentPercent: parseFloat(randomFloat(t.weight * 0.8, t.weight * 1.2)),
        recentTraffic: `${(t.baseIn * randomFloat(0.005, 0.02)).toFixed(2)}G`
      }
    } else {
      // 后面的数据随机生成
      const appName = appNames[(i - 10) % appNames.length] + (Math.floor((i - 10) / appNames.length) > 0 ? `-${Math.floor((i - 10) / appNames.length) + 1}` : '')
      const conn = randomInt(0, 50000)
      const inVal = randomFloat(0.1, 800)
      const percent = parseFloat(randomFloat(0.01, 2))
      
      item = {
        name: appName,
        connections: conn,
        inBps: `${inVal}M`,
        outBps: `${(parseFloat(inVal) * randomFloat(0.02, 0.15)).toFixed(2)}M`,
        proxyInBps: 0,
        proxyOutBps: 0,
        totalPercent: percent,
        totalTraffic: `${(parseFloat(inVal) * randomFloat(50, 300)).toFixed(2)}G`,
        recentPercent: parseFloat(randomFloat(percent * 0.8, percent * 1.2)),
        recentTraffic: `${(parseFloat(inVal) * randomFloat(0.005, 0.02)).toFixed(2)}G`
      }
    }
    
    data.push(item)
  }
  
  return data
}

// 生成协议统计数据（200条）
function generateProtocolsData(count: number = 200) {
  const data = []
  
  for (let i = 0; i < count; i++) {
    const protoName = protocolNames[i % protocolNames.length] + (Math.floor(i / protocolNames.length) > 0 ? `-${Math.floor(i / protocolNames.length) + 1}` : '')
    const conn = randomInt(100, 80000)
    const inBps = randomFloat(50, 2000)
    const outBps = randomFloat(20, 800)
    const totalBps = parseFloat(inBps) + parseFloat(outBps)
    const inTraffic = randomFloat(100, 5000)
    const outTraffic = randomFloat(50, 2000)
    const totalTraffic = parseFloat(inTraffic) + parseFloat(outTraffic)
    const percent = parseFloat(randomFloat(0.5, 25))
    
    data.push({
      name: protoName,
      connections: conn,
      inBps: `${inBps}M`,
      outBps: `${outBps}M`,
      totalBps: `${totalBps.toFixed(2)}M`,
      inTraffic: `${inTraffic}G`,
      outTraffic: `${outTraffic}G`,
      totalTraffic: `${totalTraffic.toFixed(2)}G`,
      totalPercent: percent
    })
  }
  
  return data
}

// 数据状态
const topAppsData = ref<any[]>(generateTopAppsData())
const protocolsData = ref<any[]>(generateProtocolsData())

let timer: any = null

// KPI计算属性
const totalConnections = computed(() => topAppsData.value.reduce((sum, app) => sum + app.connections, 0).toLocaleString())
const activeConnections = computed(() => Math.floor(topAppsData.value.reduce((sum, app) => sum + app.connections, 0) * 0.85).toLocaleString())
const totalTraffic = computed(() => '5.21 PB')
const inTraffic = computed(() => '3.68 PB')
const outTraffic = computed(() => '1.53 PB')
const proxyTraffic = computed(() => '128 TB')
const appCount = computed(() => topAppsData.value.length)
const protocolCount = computed(() => protocolsData.value.length)
const avgBps = computed(() => '28.45 Gbps')
const peakBps = computed(() => '156.78 Gbps')

// 协议统计KPI
const protoTotalCount = computed(() => protocolsData.value.length)
const protoActiveCount = computed(() => Math.floor(protocolsData.value.length * 0.92))
const protoTotalConn = computed(() => protocolsData.value.reduce((sum, p) => sum + p.connections, 0).toLocaleString())
const protoTcpConn = computed(() => Math.floor(protocolsData.value.reduce((sum, p) => sum + p.connections, 0) * 0.75).toLocaleString())
const protoUdpConn = computed(() => Math.floor(protocolsData.value.reduce((sum, p) => sum + p.connections, 0) * 0.23).toLocaleString())
const protoOtherConn = computed(() => Math.floor(protocolsData.value.reduce((sum, p) => sum + p.connections, 0) * 0.02).toLocaleString())
const protoInTotal = computed(() => '4.18 PB')
const protoOutTotal = computed(() => '1.89 PB')
const protoAvgRate = computed(() => '32.67 Gbps')
const protoPeakRate = computed(() => '189.34 Gbps')

// 过滤计算属性
const filteredTopApps = computed(() => {
  let data = [...topAppsData.value]
  if (keyword.value) {
    data = data.filter(item => item.name.toLowerCase().includes(keyword.value.toLowerCase()))
  }
  return data
})

const filteredProtocols = computed(() => {
  let data = [...protocolsData.value]
  if (protoAppFilter.value !== 'any') {
    data = data.filter(item => item.name.includes(protoAppFilter.value))
  }
  return data
})

// 分页计算属性
const totalPages = computed(() => Math.max(1, Math.ceil(filteredTopApps.value.length / parseInt(pageSize.value))))
const pagedTopApps = computed(() => {
  const start = (currentPage.value - 1) * parseInt(pageSize.value)
  return filteredTopApps.value.slice(start, start + parseInt(pageSize.value))
})

const totalPagesProto = computed(() => Math.max(1, Math.ceil(filteredProtocols.value.length / parseInt(pageSizeProto.value))))
const pagedProtocols = computed(() => {
  const start = (currentPageProto - 1) * parseInt(pageSizeProto.value)
  return filteredProtocols.value.slice(start, start + parseInt(pageSizeProto.value))
})

// 可见页码
const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const current = currentPage.value
  const total = totalPages.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3) pages.push('...')
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i)
    }
    if (current < total - 2) pages.push('...')
    pages.push(total)
  }
  
  return pages
})

const visiblePagesProto = computed(() => {
  const pages: (number | string)[] = []
  const current = currentPageProto.value
  const total = totalPagesProto.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3) pages.push('...')
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i)
    }
    if (current < total - 2) pages.push('...')
    pages.push(total)
  }
  
  return pages
})

function handleSearch() {
  currentPage.value = 1
}

function handleProtoSearch() {
  currentPageProto.value = 1
}

function resetProtoFilters() {
  protoAppFilter.value = 'any'
  anyProtoFilter.value = 'all'
  currentPageProto.value = 1
}

function jumpToPage() {
  const page = Math.max(1, Math.min(parseInt(String(gotoPage.value)) || 1, totalPages.value))
  currentPage.value = page
}

function jumpToPageProto() {
  const page = Math.max(1, Math.min(parseInt(String(gotoPageProto.value)) || 1, totalPagesProto.value))
  currentPageProto.value = page
}

function handleDetailView(row: any) {
  console.log('查看详情:', row.name)
}

function handleDownload(row: any) {
  console.log('下载数据:', row.name)
}

function handleProtoView(row: any) {
  console.log('协议详情:', row.name)
}

function handleProtoTrend(row: any) {
  console.log('协议趋势:', row.name)
}

onMounted(() => {
  if (parseInt(refreshInterval.value) > 0) {
    timer = setInterval(() => {}, parseInt(refreshInterval.value) * 1000)
  }
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
/* ===== 完全复制流量概况的样式（与 TrafficOverviewView.vue 一致） ===== */

:root {
  --bg-page: #f0f2f5;
  --bg-white: #ffffff;
  --border: #e8e8e8;
  --border-light: #f0f0f0;
  --text: #303133;
  --text-secondary: #606266;
  --text-muted: #909399;
  --accent: #409eff;
}

.nv-border-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background: #f0f2f5;
  overflow: hidden;
}

.nv-tabs-header {
  flex-shrink: 0;
  padding: 0 16px;
  border-bottom: 1px solid #e4e7ed;
  background: #fafafa;
}

.nv-tabs-nav {
  display: flex;
  gap: 0;
}

.nv-tab {
  position: relative;
  padding: 12px 20px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  color: #606266;
  cursor: pointer;
  white-space: nowrap;
}

.nv-tab.active {
  color: #409eff;
}

.nv-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20px;
  right: 20px;
  height: 2px;
  background: #409eff;
  border-radius: 1px 1px 0 0;
}

.nv-tabs-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.to-dashboard-scroll {
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.to-dashboard {
  padding: 12px;
  background: #f0f2f5;
}

.to-dashboard > * + * {
  margin-top: 12px;
}

.to-summary-row-5 {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.to-stat-card-v2 {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 12px 14px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.to-stat-v2-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #409eff;
  background: linear-gradient(145deg, #e6f4ff 0%, #ecf5ff 100%);
  box-shadow: inset 0 0 0 1px rgba(64, 158, 255, 0.12);
}

.to-stat-v2-icon svg {
  width: 20px;
  height: 20px;
  display: block;
}

.to-stat-v2-icon-conn { color: #597ef7; background: linear-gradient(145deg, #eef2ff 0%, #f0f5ff 100%); }
.to-stat-v2-icon-user { color: #13c2c2; background: linear-gradient(145deg, #e6fffb 0%, #ecfefe 100%); }
.to-stat-v2-icon-pps { color: #fa8c16; background: linear-gradient(145deg, #fff7e6 0%, #fffbe6 100%); }

.to-stat-v2-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.to-stat-v2-metric {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}

.to-stat-v2-metric-main {
  margin-bottom: 2px;
}

.to-stat-v2-key {
  font-size: 12px;
  color: #606266;
  white-space: nowrap;
  font-weight: 600;
}

.to-stat-v2-val {
  font-size: 16px;
  font-weight: 700;
  color: #303133;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.to-stat-v2-val-lg {
  font-size: 18px;
}

.to-stat-v2-subgrid {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 4px;
  margin-top: 4px;
  width: 100%;
}

.to-stat-v2-sub {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
  font-size: 12px;
  color: #909399;
}

.to-stat-v2-sub:first-child {
  align-items: flex-start;
  text-align: left;
}

.to-stat-v2-sub:nth-child(2) {
  align-items: center;
  text-align: center;
}

.to-stat-v2-sub:last-child {
  align-items: flex-end;
  text-align: right;
}

.to-stat-v2-sub strong {
  font-size: 14px;
  font-weight: 700;
  color: #303133;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.to-chart-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.to-chart-panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.to-chart-panel-full {
  grid-column: 1 / -1;
}

.to-panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 14px 6px;
  flex-shrink: 0;
}

.to-panel-head-left {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px 14px;
  min-width: 0;
}

.to-panel-head-right {
  display: flex;
  gap: 8px;
  align-items: center;
}

.to-panel-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #303133;
  white-space: nowrap;
}

.to-panel-stats {
  font-size: 12px;
  color: #909399;
  font-weight: 500;
  white-space: nowrap;
}

.to-panel-menu {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  background: transparent;
  color: #909399;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  border-radius: 4px;
}

.to-panel-menu:hover {
  background: #f5f7fa;
  color: #606266;
}

/* ===== 表格相关样式（新增） ===== */

.to-filter-container {
  padding: 16px 20px;
  background: #fafbfc;
  border-bottom: 2px solid #e4e7ed;
}

.to-filter-row-simple {
  display: flex;
  align-items: center;
  gap: 16px;
}

.to-divider {
  height: 1px;
  background: linear-gradient(to right, transparent, #e4e7ed 20%, #e4e7ed 80%, transparent);
  margin: 0 -20px;
}

.to-filter-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.to-filter-label {
  font-size: 13px;
  color: #606266;
  white-space: nowrap;
  font-weight: 500;
}

.to-filter-select {
  height: 32px;
  padding: 0 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
  background: #fff;
  color: #303133;
  min-width: 120px;
}

.to-search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.to-input {
  height: 32px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
  width: 200px;
  color: #303133;
}

.to-input:focus {
  outline: none;
  border-color: #409eff;
}

.to-input-time {
  height: 32px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
  background: #f5f7fa;
  color: #606266;
  min-width: 280px;
  cursor: default;
}

.to-btn-primary {
  height: 32px;
  padding: 0 16px;
  border: 1px solid #409eff;
  border-radius: 4px;
  background: #409eff;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
}

.to-btn-primary:hover {
  background: #66b1ff;
  border-color: #66b1ff;
}

.to-btn-default {
  height: 28px;
  padding: 0 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  color: #606266;
  font-size: 12px;
  cursor: pointer;
}

.to-btn-small {
  height: 28px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  color: #606266;
  font-size: 12px;
  cursor: pointer;
}

.to-btn-reset {
  height: 32px;
  padding: 0 14px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  color: #606266;
  font-size: 13px;
  cursor: pointer;
}

.to-filter-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.to-link-action {
  color: #409eff;
  text-decoration: none;
  font-size: 13px;
  cursor: pointer;
}

.to-link-action:hover {
  text-decoration: underline;
}

/* 表格容器 */
.to-table-wrapper {
  overflow-x: auto;
  padding: 14px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.to-table-data {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 13px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
}

.to-table-data thead {
  position: sticky;
  top: 0;
  z-index: 10;
}

.to-table-data th {
  background: linear-gradient(180deg, #f5f7fa 0%, #ecf5ff 100%);
  border-right: 1px solid #dcdfe6;
  border-bottom: 2px solid #409eff;
  padding: 12px 14px;
  text-align: left;
  font-weight: 700;
  color: #1a1a1a;
  white-space: nowrap;
  font-size: 12.5px;
  position: relative;
  letter-spacing: 0.3px;
}

.to-table-data th:last-child {
  border-right: none;
}

.to-table-data td {
  border-right: 1px solid #f0f0f0;
  border-bottom: 1px solid #f5f5f5;
  padding: 10px 14px;
  color: #303133;
  vertical-align: middle;
  transition: all 0.15s ease;
}

.to-table-data td:last-child {
  border-right: none;
}

.to-table-data tr:hover td {
  background: #f0f9ff;
  border-bottom-color: #bae7ff;
}

.to-table-data tbody tr:nth-child(even) td {
  background: #fafcff;
}

.to-table-data tbody tr:nth-child(even):hover td {
  background: #e6f7ff;
}

.to-row-active {
  background: #fafcff !important;
}

.to-row-active:hover {
  background: #e6f7ff !important;
}

.sort-icon {
  color: #909399;
  font-size: 11px;
  margin-left: 6px;
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.2s ease;
}

.sort-icon:hover {
  color: #409eff;
  opacity: 1;
  transform: scale(1.1);
}

.to-link-text {
  color: #1890ff;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
  display: inline-block;
}

.to-link-text:hover {
  text-decoration: underline;
  color: #096dd9;
  transform: translateX(2px);
}

.to-num-cell {
  text-align: right;
  font-variant-numeric: tabular-nums;
  font-family: 'SF Mono', 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 12.5px;
  color: #262626;
  font-weight: 500;
  letter-spacing: -0.3px;
}

/* 进度条 */
.to-progress-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.to-progress-track {
  flex: 1;
  height: 16px;
  background: #f0f2f5;
  border-radius: 3px;
  overflow: hidden;
  position: relative;
  max-width: 140px;
}

.to-progress-blue {
  background: #e6f7ff;
}

.to-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #409eff 0%, #66b1ff 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
  position: relative;
}

.to-bar-blue {
  background: linear-gradient(90deg, #1890ff 0%, #40a9ff 100%);
}

.to-progress-text {
  font-size: 12px;
  font-weight: 600;
  color: #606266;
  min-width: 36px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.to-value-below {
  font-size: 11px;
  color: #909399;
  padding-left: 4px;
  font-variant-numeric: tabular-nums;
}

/* 操作按钮组 */
.to-action-group {
  display: flex;
  gap: 4px;
  align-items: center;
}

.to-icon-btn {
  width: 26px;
  height: 26px;
  padding: 0;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.to-icon-btn:hover {
  border-color: #409eff;
  color: #409eff;
  background: #ecf5ff;
}

/* 分页栏 */
.to-pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 14px;
  border-top: 1px solid #ebeef5;
  background: #fafbfc;
  flex-shrink: 0;
}

.to-page-info {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.to-page-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.to-page-btn {
  min-width: 30px;
  height: 30px;
  padding: 0 6px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  color: #606266;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.to-page-btn:hover:not(:disabled) {
  border-color: #409eff;
  color: #409eff;
}

.to-page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f5f7fa;
}

.to-page-num {
  min-width: 30px;
  height: 30px;
  padding: 0 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  color: #606266;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.to-page-num:hover {
  border-color: #409eff;
  color: #409eff;
}

.to-page-num.active {
  background: #409eff;
  color: #fff;
  border-color: #409eff;
  font-weight: 700;
}

.to-page-dots {
  color: #c0c4cc;
  padding: 0 4px;
  font-size: 13px;
}

.to-page-jump {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #606266;
}

.to-jump-input {
  width: 46px;
  height: 30px;
  text-align: center;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
  color: #303133;
}

.to-jump-input:focus {
  outline: none;
  border-color: #409eff;
}

.to-size-selector {
  height: 30px;
  padding: 0 6px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
  background: #fff;
  color: #606266;
  cursor: pointer;
}

/* 响应式布局 */
@media (max-width: 1280px) {
  .to-summary-row-5 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 960px) {
  .to-summary-row-5 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  
  .to-chart-row {
    grid-template-columns: 1fr;
  }
  
  .to-pagination-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .to-page-controls,
  .to-page-jump {
    justify-content: center;
  }
}

@media (max-width: 560px) {
  .to-summary-row-5 {
    grid-template-columns: 1fr;
  }
  
  .to-filter-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .to-search-box {
    margin-left: 0;
    width: 100%;
  }
  
  .to-input {
    flex: 1;
  }
}
</style>