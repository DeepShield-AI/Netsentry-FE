<template>
  <div class="nvt-page">
    <div class="sm-smso-grid">
      <section class="sm-smso-card sm-smso-donut-card nvt-card">
        <div class="sm-smso-card-head">
          <h3 class="om-section-title">存储概况</h3>
          <button type="button" class="nvt-more-btn" disabled title="暂未开放">⚙</button>
        </div>
        <div class="sm-smso-donut-wrap">
          <div class="sm-smso-donut" aria-hidden="true">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="46" fill="none" stroke="#ebeef5" stroke-width="16"/>
              <circle cx="60" cy="60" r="46" fill="none" stroke="#409eff" stroke-width="16" stroke-dasharray="220 69" transform="rotate(-90 60 60)"/>
            </svg>
            <div class="sm-smso-donut-center">
              <span>总容量</span>
              <strong>161.89 T</strong>
            </div>
          </div>
          <ul class="sm-smso-legend">
            <li><i class="dot dot-blue"></i>使用量 (75.84%)</li>
            <li><i class="dot dot-gray"></i>剩余容量 (24.16%)</li>
          </ul>
        </div>
      </section>
      <section class="sm-smso-card sm-smso-chart-card nvt-card">
        <div class="sm-smso-card-head">
          <h3 class="om-section-title">读写速率</h3>
          <button type="button" class="nvt-more-btn" disabled title="暂未开放">☰</button>
        </div>
        <div class="sm-smso-chart-plot">
          <svg class="om-omw-trend-svg" viewBox="0 0 960 180" preserveAspectRatio="none" aria-hidden="true">
            <line x1="48" y1="150" x2="920" y2="150" stroke="#e4e7ed"/>
            <polyline fill="none" stroke="#67c23a" stroke-width="2" points="48,120 200,90 352,100 504,80 656,95 808,85 920,90"/>
            <polyline fill="none" stroke="#409eff" stroke-width="2" points="48,130 200,110 352,115 504,100 656,105 808,100 920,105"/>
            <polyline fill="none" stroke="#f56c6c" stroke-width="2" points="48,140 200,135 352,138 504,132 656,136 808,134 920,135"/>
          </svg>
        </div>
        <div class="sm-smso-chart-legend">
          <span class="dot-line dot-green">读取速率</span>
          <span class="dot-line dot-blue">写入速率</span>
          <span class="dot-line dot-red">丢包速率</span>
        </div>
      </section>
    </div>
    <section class="sm-smso-section">
      <div class="sm-smso-section-head">
        <h3 class="om-section-title">存储池</h3>
        <div class="sm-smso-section-actions">
          <button type="button" class="nvt-filter-btn" disabled title="暂未开放">状态通知</button>
          <span class="sm-smso-badge">待入库文件数: <strong>197</strong></span>
          <button type="button" class="nvt-filter-btn" disabled title="暂未开放">+ 添加</button>
        </div>
      </div>
      <div class="nvt-table-wrap">
        <table class="ou-table sm-pool-table">
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
            <tr v-for="pool in storagePools" :key="pool.name">
              <td>{{ pool.name }}</td>
              <td class="ou-num">{{ pool.capacity }}</td>
              <td class="ou-num">{{ pool.used }}</td>
              <td class="ou-num">{{ pool.free }}</td>
              <td class="ou-num">{{ pool.percent }}</td>
              <td>{{ pool.minTime }}</td>
              <td>{{ pool.maxTime }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
    <section class="sm-smso-section">
      <div class="sm-smso-section-head">
        <h3 class="om-section-title">硬盘概况</h3>
      </div>
      <div class="nvt-table-wrap">
        <table class="ou-table sm-disk-table">
          <thead>
            <tr>
              <th class="col-idx">序号</th>
              <th>存储名</th>
              <th>型号 / 序列号</th>
              <th>固件版本</th>
              <th>容量</th>
              <th>转速</th>
              <th>自检状态</th>
              <th>坏道数</th>
              <th>温度</th>
              <th>读取速率 (Bps)</th>
              <th>写入速率 (Bps)</th>
              <th>IO 繁忙度</th>
              <th class="col-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="disk in disks" :key="disk.idx">
              <td class="col-idx">{{ disk.idx }}</td>
              <td>{{ disk.name }}</td>
              <td>{{ disk.model }}</td>
              <td>{{ disk.firmware }}</td>
              <td class="ou-num">{{ disk.capacity }}</td>
              <td>{{ disk.rpm }}</td>
              <td>{{ disk.status }}</td>
              <td class="ou-num">{{ disk.badSectors }}</td>
              <td>{{ disk.temp }}</td>
              <td class="ou-num">{{ disk.readRate }}</td>
              <td class="ou-num">{{ disk.writeRate }}</td>
              <td :class="{'sm-io-busy': disk.ioBusy > 80, 'warn': disk.ioBusy > 80}">{{ disk.ioBusy }}%</td>
              <td class="col-actions">
                <button type="button" class="nvt-filter-btn" disabled title="暂未开放">闪烁</button>
                <button type="button" class="nvt-filter-btn" disabled title="暂未开放">格式化</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import './nv-test-shared.css'

const storagePools = ref([
  {
    name: 'ntmlog',
    capacity: '160.07 T',
    used: '142.46 T',
    free: '17.61 T',
    percent: '89%',
    minTime: '2024.01.01/00:00:00',
    maxTime: '2026.06.18/00:00:00'
  },
  {
    name: 'ntmpcap',
    capacity: '1.82 T',
    used: '1.38 T',
    free: '0.44 T',
    percent: '76%',
    minTime: '2025.06.01/00:00:00',
    maxTime: '2026.06.18/00:00:00'
  }
])

const disks = ref([
  {
    idx: 1,
    name: 'sda',
    model: 'KINGSTON / 50026B738...',
    firmware: 'SBFK62J7',
    capacity: '119.24 G',
    rpm: '—',
    status: '正常',
    badSectors: 0,
    temp: '35 °C',
    readRate: 128642,
    writeRate: 86428,
    ioBusy: 85.3
  },
  {
    idx: 2,
    name: 'sdb',
    model: 'Samsung / S3Z1NX0K...',
    firmware: 'SN03',
    capacity: '1.82 T',
    rpm: '7200',
    status: '正常',
    badSectors: 0,
    temp: '43 °C',
    readRate: 428642,
    writeRate: 128642,
    ioBusy: 12.6
  },
  {
    idx: 3,
    name: 'sdc',
    model: 'AVAGO / 5000C500...',
    firmware: '—',
    capacity: '160.07 T',
    rpm: '—',
    status: '未知',
    badSectors: 0,
    temp: '0 °C',
    readRate: 0,
    writeRate: 0,
    ioBusy: 0
  }
])
</script>

<style scoped>
.sm-smso-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 16px;
  margin-bottom: 16px;
}

.sm-smso-card {
  padding: 16px;
}

.sm-smso-card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.om-section-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.sm-smso-donut-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.sm-smso-donut {
  position: relative;
  width: 160px;
  height: 160px;
}

.sm-smso-donut svg {
  width: 100%;
  height: 100%;
}

.sm-smso-donut-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.sm-smso-donut-center span {
  display: block;
  font-size: 12px;
  color: #909399;
}

.sm-smso-donut-center strong {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: #303133;
}

.sm-smso-legend {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  gap: 24px;
}

.sm-smso-legend li {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #606266;
}

.sm-smso-legend .dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.sm-smso-legend .dot-blue {
  background: #409eff;
}

.sm-smso-legend .dot-gray {
  background: #ebeef5;
}

.sm-smso-chart-plot {
  padding: 8px 0;
}

.sm-smso-chart-plot svg {
  width: 100%;
  height: 180px;
}

.sm-smso-chart-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 8px;
}

.sm-smso-chart-legend .dot-line {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #606266;
}

.sm-smso-chart-legend .dot-line::before {
  content: '';
  width: 20px;
  height: 2px;
}

.sm-smso-chart-legend .dot-green::before {
  background: #67c23a;
}

.sm-smso-chart-legend .dot-blue::before {
  background: #409eff;
}

.sm-smso-chart-legend .dot-red::before {
  background: #f56c6c;
}

.sm-smso-section {
  margin-bottom: 16px;
}

.sm-smso-section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.sm-smso-section-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sm-smso-badge {
  font-size: 13px;
  color: #606266;
}

.sm-smso-badge strong {
  color: #409eff;
  font-weight: 600;
}

.ou-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.ou-table thead tr {
  background: #fafafa;
  border-bottom: 1px solid #e4e7ed;
}

.ou-table th {
  padding: 10px 12px;
  text-align: left;
  font-weight: 600;
  color: #606266;
}

.ou-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #f0f0f0;
  color: #303133;
}

.ou-table tbody tr:hover {
  background: #f5f7fa;
}

.ou-num {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.col-idx {
  width: 60px;
  text-align: center;
}

.col-actions {
  width: 120px;
  text-align: center;
}

.sm-io-busy.warn {
  color: #e6a23c;
  font-weight: 600;
}
</style>
