<template>
  <div class="nvt-page">
    <!-- Stat cards -->
    <div class="nvt-stat-row" style="grid-template-columns: repeat(4, 1fr);">
      <div class="nvt-stat-card">
        <div class="nvt-stat-label">系统时间</div>
        <div class="nvt-stat-value">{{ mockData.systemTime }}</div>
      </div>
      <div class="nvt-stat-card">
        <div class="nvt-stat-label">运行时间</div>
        <div class="nvt-stat-value">{{ mockData.uptime }}</div>
      </div>
      <div class="nvt-stat-card">
        <div class="nvt-stat-label">CPU温度</div>
        <div class="nvt-stat-value">{{ mockData.cpuTemp }} °C</div>
      </div>
      <div class="nvt-stat-card">
        <div class="nvt-stat-label">软件版本</div>
        <div class="nvt-stat-value">{{ mockData.version }}</div>
      </div>
    </div>

    <!-- Progress bars -->
    <div class="nvt-panel-row" style="grid-template-columns: repeat(3, 1fr);">
      <div class="nvt-card">
        <div class="nvt-card-header">CPU使用率</div>
        <div class="nvt-card-body">
          <div style="font-size: 24px; font-weight: 700; color: #2a88e6;">{{ mockData.cpuUsage }}%</div>
          <div class="nvt-progress-track">
            <div class="nvt-progress-fill" :style="{ width: mockData.cpuUsage + '%', background: '#2a88e6' }"></div>
          </div>
        </div>
      </div>
      <div class="nvt-card">
        <div class="nvt-card-header">内存使用率</div>
        <div class="nvt-card-body">
          <div style="font-size: 24px; font-weight: 700; color: #52c41a;">{{ mockData.memoryUsage }}%</div>
          <div class="nvt-progress-track">
            <div class="nvt-progress-fill" :style="{ width: mockData.memoryUsage + '%', background: '#52c41a' }"></div>
          </div>
        </div>
      </div>
      <div class="nvt-card">
        <div class="nvt-card-header">磁盘使用率</div>
        <div class="nvt-card-body">
          <div style="font-size: 24px; font-weight: 700; color: #fa8c16;">{{ mockData.diskUsage }}%</div>
          <div class="nvt-progress-track">
            <div class="nvt-progress-fill" :style="{ width: mockData.diskUsage + '%', background: '#fa8c16' }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Network interfaces -->
    <div class="nvt-card">
      <div class="nvt-card-header">网络接口</div>
      <div class="nvt-card-body">
        <table class="nvt-table-wrap">
          <thead>
            <tr>
              <th>接口名称</th>
              <th>状态</th>
              <th>IP地址</th>
              <th>入站速率</th>
              <th>出站速率</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="iface in mockData.interfaces" :key="iface.key">
              <td>{{ iface.name }}</td>
              <td :style="{ color: iface.status === 'up' ? '#52c41a' : '#f5222d' }">
                {{ iface.status === 'up' ? '在线' : '离线' }}
              </td>
              <td>{{ iface.ip }}</td>
              <td>{{ iface.inRate }}</td>
              <td>{{ iface.outRate }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- License info -->
    <div class="nvt-card" style="margin-top: 16px;">
      <div class="nvt-card-header">许可证信息</div>
      <div class="nvt-card-body">
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
          <div>
            <div class="nvt-stat-label">许可证类型</div>
            <div class="nvt-stat-value">{{ mockData.license }}</div>
          </div>
          <div>
            <div class="nvt-stat-label">到期时间</div>
            <div class="nvt-stat-value">{{ mockData.licenseExpiry }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import './nv-test-shared.css'

const mockData = {
  systemTime: '2026-07-06 10:52:30',
  uptime: '15天 8小时 23分钟',
  cpuUsage: 45,
  memoryUsage: 62,
  diskUsage: 38,
  cpuTemp: 58,
  version: 'NetVisor v2.5.1',
  license: '企业版',
  licenseExpiry: '2027-12-31',
  interfaces: [
    { key: '1', name: 'eth0', status: 'up', ip: '192.168.1.100', inRate: '12.5 MB/s', outRate: '8.3 MB/s' },
    { key: '2', name: 'eth1', status: 'up', ip: '10.0.0.1', inRate: '5.2 MB/s', outRate: '3.1 MB/s' },
    { key: '3', name: 'eth2', status: 'down', ip: '-', inRate: '-', outRate: '-' },
  ],
}
</script>
