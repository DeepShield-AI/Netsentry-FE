<template>
  <div class="nvt-page">
    <!-- Tab 切换 -->
    <div class="nvt-tabs-header">
      <div class="nvt-tabs-nav">
        <button
          class="nvt-tab"
          :class="{ active: activeTab === 'traffic' }"
          @click="activeTab = 'traffic'"
        >
          流量概况
        </button>
        <button
          class="nvt-tab"
          :class="{ active: activeTab === 'performance' }"
          @click="activeTab = 'performance'"
        >
          性能概况
        </button>
      </div>
      <div v-if="activeTab === 'traffic'" class="nvt-filter-bar" ref="filterRef">
        <button class="nvt-filter-btn" @click="filterOpen = !filterOpen">
          <span>🔍</span> 筛选
        </button>
        <div v-if="filterOpen" class="nvt-filter-panel">
          <div
            v-for="item in filterItems"
            :key="item.key"
            class="nvt-filter-item"
          >
            <input
              type="checkbox"
              :checked="visibility[item.key]"
              @change="toggleFilter(item.key)"
            />
            <label>{{ item.label }}</label>
          </div>
        </div>
      </div>
    </div>

    <!-- 流量概况 Tab -->
    <div v-if="activeTab === 'traffic'">
      <!-- 统计卡片行 -->
      <div class="nvt-stat-row">
        <div class="nvt-stat-card">
          <div class="nvt-stat-label">上行</div>
          <div class="nvt-stat-value nvt-stat-value-blue">{{ fmtRate(summary.upstream_bps) }}</div>
          <div class="nvt-stat-label" style="margin-top: 4px;">下行</div>
          <div class="nvt-stat-value nvt-stat-value-green">{{ fmtRate(summary.downstream_bps) }}</div>
        </div>
        <div class="nvt-stat-card">
          <div class="nvt-stat-label">连接数</div>
          <div class="nvt-stat-value nvt-stat-value-lg">{{ fmtInt(summary.connections) }}</div>
          <div class="nvt-stat-sub">
            <span>TCP <strong>{{ fmtInt(summary.tcp_connections) }}</strong></span>
            <span>UDP <strong>{{ fmtInt(summary.udp_connections) }}</strong></span>
            <span>ICMP <strong>{{ fmtInt(summary.icmp_connections) }}</strong></span>
          </div>
        </div>
        <div class="nvt-stat-card">
          <div class="nvt-stat-label">当前</div>
          <div class="nvt-stat-value">{{ fmtInt(summary.users_current) }}</div>
          <div class="nvt-stat-label" style="margin-top: 4px;">峰值</div>
          <div class="nvt-stat-value">{{ fmtInt(summary.users_peak) }}</div>
        </div>
        <div class="nvt-stat-card">
          <div class="nvt-stat-label">PPS</div>
          <div class="nvt-stat-value">{{ fmtInt(summary.pps_current) }}</div>
          <div class="nvt-stat-label" style="margin-top: 4px;">SYN</div>
          <div class="nvt-stat-value">{{ fmtInt(summary.syn_pps_current) }}</div>
        </div>
        <div class="nvt-stat-card">
          <div class="nvt-stat-label">SYN ACK</div>
          <div class="nvt-stat-value">{{ fmtInt(summary.synack_pps_current) }}</div>
          <div class="nvt-stat-label" style="margin-top: 4px;">并发</div>
          <div class="nvt-stat-value">{{ fmtInt(summary.new_connections_current) }}</div>
        </div>
      </div>

      <!-- 图表行 1: 上行趋势 / 流量概况 -->
      <div v-if="visibility['upstream'] || visibility['overview']" class="nvt-panel-row nvt-panel-row-2">
        <div v-if="visibility['upstream']" class="nvt-card">
          <div class="nvt-card-header">
            <span>上行趋势</span>
            <button class="nvt-more-btn" @click="hidePanel('upstream')">⋮</button>
          </div>
          <div class="nvt-card-body">
            <div ref="upstreamChart" class="nvt-chart"></div>
          </div>
        </div>
        <div v-if="visibility['overview']" class="nvt-card">
          <div class="nvt-card-header">
            <span>流量概况</span>
            <button class="nvt-more-btn" @click="hidePanel('overview')">⋮</button>
          </div>
          <div class="nvt-card-body">
            <div ref="overviewChart" class="nvt-chart"></div>
          </div>
        </div>
      </div>

      <!-- 图表行 2: 下行趋势 / 流量分布 -->
      <div v-if="visibility['downstream'] || visibility['traffic-dist']" class="nvt-panel-row nvt-panel-row-2">
        <div v-if="visibility['downstream']" class="nvt-card">
          <div class="nvt-card-header">
            <span>下行趋势</span>
            <button class="nvt-more-btn" @click="hidePanel('downstream')">⋮</button>
          </div>
          <div class="nvt-card-body">
            <div ref="downstreamChart" class="nvt-chart"></div>
          </div>
        </div>
        <div v-if="visibility['traffic-dist']" class="nvt-card">
          <div class="nvt-card-header">
            <span>流量分布</span>
            <button class="nvt-more-btn" @click="hidePanel('traffic-dist')">⋮</button>
          </div>
          <div class="nvt-card-body">
            <div ref="trafficDistChart" class="nvt-chart"></div>
          </div>
        </div>
      </div>

      <!-- 图表行 3: 连接趋势 / 连接分布 -->
      <div v-if="visibility['connections'] || visibility['conn-dist']" class="nvt-panel-row nvt-panel-row-2">
        <div v-if="visibility['connections']" class="nvt-card">
          <div class="nvt-card-header">
            <span>连接趋势</span>
            <button class="nvt-more-btn" @click="hidePanel('connections')"></button>
          </div>
          <div class="nvt-card-body">
            <div ref="connectionsChart" class="nvt-chart"></div>
          </div>
        </div>
        <div v-if="visibility['conn-dist']" class="nvt-card">
          <div class="nvt-card-header">
            <span>连接分布</span>
            <button class="nvt-more-btn" @click="hidePanel('conn-dist')">⋮</button>
          </div>
          <div class="nvt-card-body">
            <div ref="connDistChart" class="nvt-chart"></div>
          </div>
        </div>
      </div>

      <!-- 图表行 4: 系统信息 / 接口线路 -->
      <div v-if="visibility['sys-info'] || visibility['iface']" class="nvt-panel-row nvt-panel-row-2">
        <div v-if="visibility['sys-info']" class="nvt-card">
          <div class="nvt-card-header">
            <span>系统信息</span>
            <button class="nvt-more-btn" @click="hidePanel('sys-info')">⋮</button>
          </div>
          <div class="nvt-card-body">
            <div class="nvt-sysinfo-grid">
              <div><span class="nvt-sysinfo-label">系统时间：</span>{{ sysInfo.system_time }}</div>
              <div><span class="nvt-sysinfo-label">软件版本：</span>{{ sysInfo.software_version }}</div>
              <div>
                <span class="nvt-sysinfo-label">内存使用率：</span>{{ sysInfo.memory_usage }}%
                <div class="nvt-progress-track">
                  <div class="nvt-progress-fill" :style="{ width: sysInfo.memory_usage + '%', background: '#2a88e6' }"></div>
                </div>
              </div>
              <div><span class="nvt-sysinfo-label">DPI特征库：</span>{{ sysInfo.dpi_lib }}</div>
              <div>
                <span class="nvt-sysinfo-label">CPU使用率：</span>{{ sysInfo.cpu_usage }}%
                <div class="nvt-progress-track">
                  <div class="nvt-progress-fill" :style="{ width: sysInfo.cpu_usage + '%', background: '#52c41a' }"></div>
                </div>
              </div>
              <div><span class="nvt-sysinfo-label">授权编号：</span>{{ sysInfo.license }}</div>
              <div><span class="nvt-sysinfo-label">CPU温度：</span>{{ sysInfo.cpu_temp }} °C</div>
              <div><span class="nvt-sysinfo-label">使用许可到期：</span>{{ sysInfo.license_expiry }}</div>
            </div>
          </div>
        </div>
        <div v-if="visibility['iface']" class="nvt-card">
          <div class="nvt-card-header">
            <span>接口线路</span>
            <button class="nvt-more-btn" @click="hidePanel('iface')">⋮</button>
          </div>
          <div class="nvt-card-body">
            <table class="nvt-table-wrap">
              <thead>
                <tr>
                  <th>线路名称</th>
                  <th>网卡</th>
                  <th>状态</th>
                  <th>IP</th>
                  <th>流入速率</th>
                  <th>流出速率</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="iface in interfaces" :key="iface.key">
                  <td>{{ iface.name }}</td>
                  <td>{{ iface.card }}</td>
                  <td :style="{ color: iface.status === 'up' ? '#52c41a' : '#f5222d' }">
                    {{ iface.status === 'up' ? 'up' : 'down' }}
                  </td>
                  <td>{{ iface.ip }}</td>
                  <td>{{ iface.in_rate }}</td>
                  <td>{{ iface.out_rate }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 图表行 5: 流量统计 -->
      <div v-if="visibility['traffic-stats']" class="nvt-panel-row nvt-panel-row-1">
        <div class="nvt-card">
          <div class="nvt-card-header">
            <span>流量统计</span>
            <button class="nvt-more-btn" @click="hidePanel('traffic-stats')">⋮</button>
          </div>
          <div class="nvt-card-body">
            <table class="nvt-table-wrap">
              <thead>
                <tr>
                  <th>协议</th>
                  <th>连接数</th>
                  <th>流入BPS</th>
                  <th>流出BPS</th>
                  <th>占比</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="stat in trafficStats" :key="stat.key">
                  <td>{{ stat.protocol }}</td>
                  <td>{{ fmtInt(stat.connections) }}</td>
                  <td>{{ stat.in_bps }}</td>
                  <td>{{ stat.out_bps }}</td>
                  <td>{{ stat.ratio }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 图表行 6: TOP应用 / TOP用户 / 外网连接 -->
      <div v-if="visibility['top-app'] || visibility['top-user'] || visibility['ext-conn']" class="nvt-panel-row nvt-panel-row-3">
        <div v-if="visibility['top-app']" class="nvt-card">
          <div class="nvt-card-header">
            <span>TOP应用</span>
            <button class="nvt-more-btn" @click="hidePanel('top-app')"></button>
          </div>
          <div class="nvt-card-body">
            <table class="nvt-table-wrap">
              <thead>
                <tr>
                  <th>应用名称</th>
                  <th>连接数</th>
                  <th>流入速率</th>
                  <th>流出速率</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="app in topApps" :key="app.key">
                  <td>{{ app.name }}</td>
                  <td>{{ fmtInt(app.connections) }}</td>
                  <td>{{ app.in_rate }}</td>
                  <td>{{ app.out_rate }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-if="visibility['top-user']" class="nvt-card">
          <div class="nvt-card-header">
            <span>TOP用户</span>
            <button class="nvt-more-btn" @click="hidePanel('top-user')">⋮</button>
          </div>
          <div class="nvt-card-body">
            <table class="nvt-table-wrap">
              <thead>
                <tr>
                  <th>IP</th>
                  <th>连接数</th>
                  <th>流入速率</th>
                  <th>流出速率</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in topUsers" :key="user.key">
                  <td>{{ user.ip }}</td>
                  <td>{{ fmtInt(user.connections) }}</td>
                  <td>{{ user.in_rate }}</td>
                  <td>{{ user.out_rate }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-if="visibility['ext-conn']" class="nvt-card">
          <div class="nvt-card-header">
            <span>外网连接</span>
            <button class="nvt-more-btn" @click="hidePanel('ext-conn')">⋮</button>
          </div>
          <div class="nvt-card-body">
            <table class="nvt-table-wrap">
              <thead>
                <tr>
                  <th>源IP</th>
                  <th>目的IP</th>
                  <th>目的端口</th>
                  <th>协议</th>
                  <th>状态</th>
                  <th>持续时间</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="conn in wanConns" :key="conn.key">
                  <td>{{ conn.src_ip }}</td>
                  <td>{{ conn.dst_ip }}</td>
                  <td>{{ conn.dst_port }}</td>
                  <td>
                    <span class="nvt-tag" :class="'nvt-tag-' + (conn.protocol === 'TCP' ? 'blue' : 'green')">
                      {{ conn.protocol }}
                    </span>
                  </td>
                  <td>
                    <span class="nvt-tag" :class="getStatusClass(conn.status)">
                      {{ conn.status }}
                    </span>
                  </td>
                  <td>{{ conn.duration }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- 性能概况 Tab -->
    <div v-if="activeTab === 'performance'">
      <!-- 统计卡片行 -->
      <div class="nvt-stat-row">
        <div class="nvt-stat-card">
          <div class="nvt-stat-label">上行</div>
          <div class="nvt-stat-value nvt-stat-value-blue">{{ fmtRate(perfSummary.upstream_bps) }}</div>
          <div class="nvt-stat-label" style="margin-top: 4px;">下行</div>
          <div class="nvt-stat-value nvt-stat-value-green">{{ fmtRate(perfSummary.downstream_bps) }}</div>
        </div>
        <div class="nvt-stat-card">
          <div class="nvt-stat-label">连接数</div>
          <div class="nvt-stat-value nvt-stat-value-lg">{{ fmtInt(perfSummary.connections) }}</div>
          <div class="nvt-stat-sub">
            <span>TCP <strong>{{ fmtInt(perfSummary.tcp_connections) }}</strong></span>
            <span>UDP <strong>{{ fmtInt(perfSummary.udp_connections) }}</strong></span>
            <span>ICMP <strong>{{ fmtInt(perfSummary.icmp_connections) }}</strong></span>
          </div>
        </div>
        <div class="nvt-stat-card">
          <div class="nvt-stat-label">PPS</div>
          <div class="nvt-stat-value">{{ fmtInt(perfSummary.pps) }}</div>
          <div class="nvt-stat-label" style="margin-top: 4px;">SYN</div>
          <div class="nvt-stat-value">{{ fmtInt(perfSummary.syn_pps) }}</div>
        </div>
        <div class="nvt-stat-card">
          <div class="nvt-stat-label">SYN ACK</div>
          <div class="nvt-stat-value">{{ fmtInt(perfSummary.synack_pps) }}</div>
          <div class="nvt-stat-label" style="margin-top: 4px;">并发</div>
          <div class="nvt-stat-value">{{ fmtInt(perfSummary.concurrent) }}</div>
        </div>
        <div class="nvt-stat-card">
          <div class="nvt-stat-label">丢包</div>
          <div class="nvt-stat-value nvt-stat-value-red">{{ perfSummary.loss_rate.toFixed(2) }}%</div>
          <div class="nvt-stat-label" style="margin-top: 4px;">时延</div>
          <div class="nvt-stat-value">{{ perfSummary.latency.toFixed(2) }} ms</div>
        </div>
      </div>

      <!-- 图表行 1: 时延趋势 / 质量服务 -->
      <div class="nvt-panel-row nvt-panel-row-2">
        <div class="nvt-card">
          <div class="nvt-card-header">
            <span>时延趋势</span>
          </div>
          <div class="nvt-card-body">
            <div ref="latencyChart" class="nvt-chart"></div>
          </div>
        </div>
        <div class="nvt-card">
          <div class="nvt-card-header">
            <span>质量服务</span>
          </div>
          <div class="nvt-card-body">
            <table class="nvt-table-wrap">
              <thead>
                <tr>
                  <th>服务名称</th>
                  <th>平均时延</th>
                  <th>下行速率</th>
                  <th>上行速率</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="service in perfServices" :key="service.key">
                  <td>{{ service.name }}</td>
                  <td>{{ service.avg_latency }}</td>
                  <td>{{ service.downstream_bps }}</td>
                  <td>{{ service.upstream_bps }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 图表行 2: 丢包率 / 质量用户 -->
      <div class="nvt-panel-row nvt-panel-row-2">
        <div class="nvt-card">
          <div class="nvt-card-header">
            <span>丢包率</span>
          </div>
          <div class="nvt-card-body">
            <div ref="lossChart" class="nvt-chart"></div>
          </div>
        </div>
        <div class="nvt-card">
          <div class="nvt-card-header">
            <span>质量用户</span>
          </div>
          <div class="nvt-card-body">
            <table class="nvt-table-wrap">
              <thead>
                <tr>
                  <th>IP</th>
                  <th>总请求数</th>
                  <th>失败次数</th>
                  <th>平均时延</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in perfUsers" :key="user.key">
                  <td>{{ user.ip }}</td>
                  <td>{{ fmtInt(user.total_requests) }}</td>
                  <td>{{ fmtInt(user.failed_requests) }}</td>
                  <td>{{ user.avg_latency }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 图表行 3: 重传趋势 / 质量排名 -->
      <div class="nvt-panel-row nvt-panel-row-2">
        <div class="nvt-card">
          <div class="nvt-card-header">
            <span>重传趋势</span>
          </div>
          <div class="nvt-card-body">
            <div ref="retransChart" class="nvt-chart"></div>
          </div>
        </div>
        <div class="nvt-card">
          <div class="nvt-card-header">
            <span>质量排名</span>
          </div>
          <div class="nvt-card-body">
            <table class="nvt-table-wrap">
              <thead>
                <tr>
                  <th>IP</th>
                  <th>总请求数</th>
                  <th>失败次数</th>
                  <th>平均时延</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="rank in perfRanks" :key="rank.key">
                  <td>{{ rank.ip }}</td>
                  <td>{{ fmtInt(rank.total_requests) }}</td>
                  <td>{{ fmtInt(rank.failed_requests) }}</td>
                  <td>{{ rank.avg_latency }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import './nv-test-shared.css'

// ── Mock data ──
const summary = {
  upstream_bps: 2950000,
  downstream_bps: 6640000,
  connections: 111,
  tcp_connections: 80,
  udp_connections: 26,
  icmp_connections: 5,
  users_current: 84,
  users_peak: 109,
  pps_current: 12500,
  syn_pps_current: 3200,
  synack_pps_current: 2800,
  new_connections_current: 450,
}

const sysInfo = {
  system_time: '2026-07-06 10:52:30',
  memory_usage: 62,
  cpu_usage: 45,
  cpu_temp: 58,
  software_version: 'NetVisor v2.5.1',
  dpi_lib: 'v2026.06.15',
  license: 'ENT-2026-001',
  license_expiry: '2027-12-31',
}

const interfaces = [
  { key: '1', name: 'eth0', card: 'Intel I210', status: 'up', ip: '192.168.1.100', in_rate: '12.5 MB/s', out_rate: '8.3 MB/s' },
  { key: '2', name: 'eth1', card: 'Intel I210', status: 'up', ip: '10.0.0.1', in_rate: '5.2 MB/s', out_rate: '3.1 MB/s' },
  { key: '3', name: 'eth2', card: 'Realtek 8168', status: 'down', ip: '-', in_rate: '-', out_rate: '-' },
]

const trafficStats = [
  { key: '1', protocol: 'HTTP', connections: 45, in_bps: '3.5 MB/s', out_bps: '1.2 MB/s', ratio: '35.2%' },
  { key: '2', protocol: 'HTTPS', connections: 38, in_bps: '5.8 MB/s', out_bps: '2.1 MB/s', ratio: '28.7%' },
  { key: '3', protocol: 'DNS', connections: 12, in_bps: '0.2 MB/s', out_bps: '0.1 MB/s', ratio: '8.5%' },
  { key: '4', protocol: 'FTP', connections: 8, in_bps: '1.2 MB/s', out_bps: '0.8 MB/s', ratio: '5.3%' },
  { key: '5', protocol: 'SSH', connections: 5, in_bps: '0.08 MB/s', out_bps: '0.05 MB/s', ratio: '3.1%' },
]

const topApps = [
  { key: '1', name: 'HTTP', connections: 45, in_rate: '3.5 MB/s', out_rate: '1.2 MB/s' },
  { key: '2', name: 'HTTPS', connections: 38, in_rate: '5.8 MB/s', out_rate: '2.1 MB/s' },
  { key: '3', name: 'DNS', connections: 12, in_rate: '0.2 MB/s', out_rate: '0.1 MB/s' },
  { key: '4', name: 'FTP', connections: 8, in_rate: '1.2 MB/s', out_rate: '0.8 MB/s' },
  { key: '5', name: 'SSH', connections: 5, in_rate: '0.08 MB/s', out_rate: '0.05 MB/s' },
]

const topUsers = [
  { key: '1', ip: '192.168.1.100', connections: 28, in_rate: '2.1 MB/s', out_rate: '0.8 MB/s' },
  { key: '2', ip: '192.168.1.101', connections: 22, in_rate: '1.5 MB/s', out_rate: '0.6 MB/s' },
  { key: '3', ip: '192.168.1.102', connections: 18, in_rate: '1.2 MB/s', out_rate: '0.4 MB/s' },
  { key: '4', ip: '192.168.1.103', connections: 15, in_rate: '0.9 MB/s', out_rate: '0.3 MB/s' },
  { key: '5', ip: '192.168.1.104', connections: 12, in_rate: '0.7 MB/s', out_rate: '0.2 MB/s' },
]

const wanConns = [
  { key: '1', src_ip: '192.168.1.100', dst_ip: '110.242.68.3', dst_port: '443', protocol: 'TCP', status: 'ESTABLISHED', duration: '2小时15分钟' },
  { key: '2', src_ip: '192.168.1.101', dst_ip: '14.215.177.38', dst_port: '80', protocol: 'TCP', status: 'ESTABLISHED', duration: '1小时32分钟' },
  { key: '3', src_ip: '192.168.1.102', dst_ip: '180.101.49.11', dst_port: '443', protocol: 'TCP', status: 'TIME_WAIT', duration: '45分钟' },
  { key: '4', src_ip: '192.168.1.103', dst_ip: '106.11.68.13', dst_port: '53', protocol: 'UDP', status: 'ESTABLISHED', duration: '30分钟' },
  { key: '5', src_ip: '192.168.1.104', dst_ip: '220.181.38.148', dst_port: '8080', protocol: 'TCP', status: 'SYN_SENT', duration: '5分钟' },
]

const perfSummary = {
  upstream_bps: 2950000,
  downstream_bps: 6640000,
  connections: 111,
  tcp_connections: 80,
  udp_connections: 26,
  icmp_connections: 5,
  pps: 12500,
  syn_pps: 3200,
  synack_pps: 2800,
  concurrent: 450,
  loss_rate: 0.15,
  latency: 12.35,
}

const perfServices = [
  { key: '1', name: 'HTTP', avg_latency: '12.5 ms', downstream_bps: '3.5 MB/s', upstream_bps: '1.2 MB/s' },
  { key: '2', name: 'HTTPS', avg_latency: '15.2 ms', downstream_bps: '5.8 MB/s', upstream_bps: '2.1 MB/s' },
  { key: '3', name: 'DNS', avg_latency: '5.1 ms', downstream_bps: '0.2 MB/s', upstream_bps: '0.1 MB/s' },
  { key: '4', name: 'FTP', avg_latency: '25.3 ms', downstream_bps: '1.2 MB/s', upstream_bps: '0.8 MB/s' },
  { key: '5', name: 'SSH', avg_latency: '8.7 ms', downstream_bps: '0.08 MB/s', upstream_bps: '0.05 MB/s' },
]

const perfUsers = [
  { key: '1', ip: '192.168.1.100', total_requests: 1523, failed_requests: 12, avg_latency: '12.5 ms' },
  { key: '2', ip: '192.168.1.101', total_requests: 1205, failed_requests: 8, avg_latency: '15.2 ms' },
  { key: '3', ip: '192.168.1.102', total_requests: 987, failed_requests: 5, avg_latency: '8.3 ms' },
  { key: '4', ip: '192.168.1.103', total_requests: 756, failed_requests: 3, avg_latency: '10.1 ms' },
  { key: '5', ip: '192.168.1.104', total_requests: 623, failed_requests: 2, avg_latency: '9.8 ms' },
]

const perfRanks = [
  { key: '1', ip: '192.168.1.100', total_requests: 1523, failed_requests: 12, avg_latency: '12.5 ms' },
  { key: '2', ip: '192.168.1.105', total_requests: 1401, failed_requests: 18, avg_latency: '22.1 ms' },
  { key: '3', ip: '192.168.1.106', total_requests: 1298, failed_requests: 25, avg_latency: '35.6 ms' },
  { key: '4', ip: '192.168.1.107', total_requests: 1156, failed_requests: 8, avg_latency: '7.2 ms' },
  { key: '5', ip: '192.168.1.108', total_requests: 1089, failed_requests: 15, avg_latency: '18.9 ms' },
]

// ─ Filter items ──
const filterItems = [
  { key: 'upstream', label: '上行趋势', defaultChecked: true },
  { key: 'downstream', label: '下行趋势', defaultChecked: true },
  { key: 'connections', label: '连接趋势', defaultChecked: true },
  { key: 'overview', label: '流量概况', defaultChecked: true },
  { key: 'traffic-dist', label: '流量分布', defaultChecked: true },
  { key: 'conn-dist', label: '连接分布', defaultChecked: true },
  { key: 'sys-info', label: '系统信息', defaultChecked: true },
  { key: 'iface', label: '接口线路', defaultChecked: true },
  { key: 'traffic-stats', label: '流量统计', defaultChecked: false },
  { key: 'top-app', label: 'TOP应用', defaultChecked: true },
  { key: 'top-user', label: 'TOP用户', defaultChecked: false },
  { key: 'ext-conn', label: '外网连接', defaultChecked: false },
]

// ── State ──
const activeTab = ref('traffic')
const filterOpen = ref(false)
const visibility = ref({})
filterItems.forEach(item => {
  visibility.value[item.key] = item.defaultChecked
})

const filterRef = ref(null)

// Chart refs
const upstreamChart = ref(null)
const overviewChart = ref(null)
const downstreamChart = ref(null)
const trafficDistChart = ref(null)
const connectionsChart = ref(null)
const connDistChart = ref(null)
const latencyChart = ref(null)
const lossChart = ref(null)
const retransChart = ref(null)

let charts = []

// ── Methods ──
const fmtRate = (bytes) => {
  if (bytes === 0) return '0 B/s'
  const k = 1024
  const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const fmtInt = (n) => {
  return Number(n).toLocaleString('zh-CN')
}

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

const toggleFilter = (key) => {
  visibility.value[key] = !visibility.value[key]
}

const hidePanel = (key) => {
  visibility.value[key] = false
}

// ── Chart initialization ──
const initCharts = () => {
  const now = Date.now()
  const hours = 24

  // Upstream trend
  if (upstreamChart.value) {
    const chart = echarts.init(upstreamChart.value)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'time', axisLabel: { formatter: '{HH}:{mm}' } },
      yAxis: { type: 'value', axisLabel: { formatter: (v) => fmtRate(v) } },
      series: [{
        type: 'line',
        data: Array.from({ length: hours }, (_, i) => [now - (hours - 1 - i) * 3600000, Math.random() * 3000000 + 1000000]),
        smooth: true,
        areaStyle: { opacity: 0.3 },
        itemStyle: { color: '#2a88e6' },
        lineStyle: { width: 1.5 },
      }],
      grid: { left: 60, right: 20, top: 20, bottom: 30 },
    })
    charts.push(chart)
  }

  // Overview chart
  if (overviewChart.value) {
    const chart = echarts.init(overviewChart.value)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['下行', '上行', '连接数'], bottom: 0, textStyle: { fontSize: 11 } },
      xAxis: { type: 'time', axisLabel: { formatter: '{HH}:{mm}' } },
      yAxis: [
        { type: 'value', name: 'bps', axisLabel: { formatter: (v) => fmtRate(v) } },
        { type: 'value', name: 'Session#', axisLabel: { formatter: (v) => fmtInt(v) } },
      ],
      series: [
        {
          name: '下行', type: 'line', yAxisIndex: 0,
          data: Array.from({ length: hours }, (_, i) => [now - (hours - 1 - i) * 3600000, Math.random() * 7000000 + 2000000]),
          smooth: true, areaStyle: { opacity: 0.2 }, itemStyle: { color: '#2a88e6' }, lineStyle: { width: 1.5 },
        },
        {
          name: '上行', type: 'line', yAxisIndex: 0,
          data: Array.from({ length: hours }, (_, i) => [now - (hours - 1 - i) * 3600000, Math.random() * 3000000 + 1000000]),
          smooth: true, areaStyle: { opacity: 0.2 }, itemStyle: { color: '#52c41a' }, lineStyle: { width: 1.5 },
        },
        {
          name: '连接数', type: 'line', yAxisIndex: 1,
          data: Array.from({ length: hours }, (_, i) => [now - (hours - 1 - i) * 3600000, Math.floor(Math.random() * 150 + 50)]),
          smooth: true, itemStyle: { color: '#fa8c16' }, lineStyle: { width: 1.5, type: 'dashed' },
        },
      ],
      grid: { left: 60, right: 60, top: 20, bottom: 40 },
    })
    charts.push(chart)
  }

  // Downstream trend
  if (downstreamChart.value) {
    const chart = echarts.init(downstreamChart.value)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'time', axisLabel: { formatter: '{HH}:{mm}' } },
      yAxis: { type: 'value', axisLabel: { formatter: (v) => fmtRate(v) } },
      series: [{
        type: 'line',
        data: Array.from({ length: hours }, (_, i) => [now - (hours - 1 - i) * 3600000, Math.random() * 7000000 + 2000000]),
        smooth: true,
        areaStyle: { opacity: 0.3 },
        itemStyle: { color: '#52c41a' },
        lineStyle: { width: 1.5 },
      }],
      grid: { left: 60, right: 20, top: 20, bottom: 30 },
    })
    charts.push(chart)
  }

  // Traffic distribution pie
  if (trafficDistChart.value) {
    const chart = echarts.init(trafficDistChart.value)
    chart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: { show: true, formatter: '{b}: {d}%', fontSize: 11 },
        data: [
          { value: summary.downstream_bps, name: '下行流量', itemStyle: { color: '#2a88e6' } },
          { value: summary.upstream_bps, name: '上行流量', itemStyle: { color: '#52c41a' } },
        ],
      }],
    })
    charts.push(chart)
  }

  // Connections trend
  if (connectionsChart.value) {
    const chart = echarts.init(connectionsChart.value)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'time', axisLabel: { formatter: '{HH}:{mm}' } },
      yAxis: { type: 'value', name: 'Session#' },
      series: [{
        type: 'line',
        data: Array.from({ length: hours }, (_, i) => [now - (hours - 1 - i) * 3600000, Math.floor(Math.random() * 150 + 50)]),
        smooth: true,
        areaStyle: { opacity: 0.3 },
        itemStyle: { color: '#1a78d6' },
        lineStyle: { width: 1.5 },
      }],
      grid: { left: 60, right: 20, top: 20, bottom: 30 },
    })
    charts.push(chart)
  }

  // Connection distribution pie
  if (connDistChart.value) {
    const chart = echarts.init(connDistChart.value)
    chart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: { show: true, formatter: '{b}: {d}%', fontSize: 11 },
        data: [
          { value: summary.tcp_connections, name: 'TCP', itemStyle: { color: '#2a88e6' } },
          { value: summary.udp_connections, name: 'UDP', itemStyle: { color: '#52c41a' } },
          { value: summary.icmp_connections, name: 'ICMP', itemStyle: { color: '#fa8c16' } },
        ],
      }],
    })
    charts.push(chart)
  }

  // Latency trend
  if (latencyChart.value) {
    const chart = echarts.init(latencyChart.value)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'time', axisLabel: { formatter: '{HH}:{mm}' } },
      yAxis: { type: 'value', name: 'ms' },
      series: [{
        type: 'line',
        data: Array.from({ length: hours }, (_, i) => [now - (hours - 1 - i) * 3600000, Math.random() * 20 + 5]),
        smooth: true,
        areaStyle: { opacity: 0.3 },
        itemStyle: { color: '#2a88e6' },
        lineStyle: { width: 1.5 },
      }],
      grid: { left: 60, right: 20, top: 20, bottom: 30 },
    })
    charts.push(chart)
  }

  // Loss rate chart
  if (lossChart.value) {
    const chart = echarts.init(lossChart.value)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'time', axisLabel: { formatter: '{HH}:{mm}' } },
      yAxis: { type: 'value', name: '%' },
      series: [{
        type: 'line',
        data: Array.from({ length: hours }, (_, i) => [now - (hours - 1 - i) * 3600000, Math.random() * 0.5]),
        smooth: true,
        areaStyle: { opacity: 0.3 },
        itemStyle: { color: '#f56c6c' },
        lineStyle: { width: 1.5 },
      }],
      grid: { left: 60, right: 20, top: 20, bottom: 30 },
    })
    charts.push(chart)
  }

  // Retransmission chart
  if (retransChart.value) {
    const chart = echarts.init(retransChart.value)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'time', axisLabel: { formatter: '{HH}:{mm}' } },
      yAxis: { type: 'value', name: '%' },
      series: [{
        type: 'line',
        data: Array.from({ length: hours }, (_, i) => [now - (hours - 1 - i) * 3600000, Math.random() * 2 + 0.1]),
        smooth: true,
        areaStyle: { opacity: 0.3 },
        itemStyle: { color: '#e6a23c' },
        lineStyle: { width: 1.5 },
      }],
      grid: { left: 60, right: 20, top: 20, bottom: 30 },
    })
    charts.push(chart)
  }
}

// ── Lifecycle ─
onMounted(() => {
  initCharts()
  window.addEventListener('resize', () => {
    charts.forEach(chart => chart.resize())
  })
})

onBeforeUnmount(() => {
  charts.forEach(chart => chart.dispose())
})
</script>
