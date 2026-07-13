<template>
  <div class="nvt-page">
    <!-- Tab bar -->
    <div class="nvt-tabs-header">
      <div class="nvt-tabs-nav">
        <button v-for="t in tabs" :key="t.key" class="nvt-tab" :class="{ active: activeTab === t.key }" @click="activeTab = t.key">{{ t.label }}</button>
      </div>
    </div>

    <!-- 用户流量 -->
    <div v-show="activeTab === 'user-traffic'" class="ttd-rate-page tid-page">
      <div class="tdh-filters ttd-rate-filters">
        <div class="tdh-filter-row tdh-filter-row-actions">
          <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" type="text" value="2026-06-15 14:24 - 2026-06-15 14:39" disabled /></label>
          <button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button>
          <button type="button" class="secondary td-reset-btn" disabled title="暂未开放">重置</button>
          <button type="button" class="secondary ttd-filter-more" disabled title="暂未开放">过滤条件 ▾</button>
          <div class="tdh-filter-field tdh-ip-version hsa-ip-version ttd-ip-version" role="group"><div class="tio-range-btns"><button type="button" class="tio-range-btn active" disabled>IPv4</button><button type="button" class="tio-range-btn" disabled>IPv6</button></div></div>
          <button type="button" class="link-btn tid-export-btn ttd-export-btn" disabled title="暂未开放">⬇ 导出</button>
        </div>
      </div>
      <div class="ttd-rate-grid">
        <section v-for="c in userCharts" :key="c.title" class="tid-chart-panel dba-trend-panel ttd-rate-chart">
          <div class="dba-trend-head"><h3 class="dba-trend-title">{{ c.title }}</h3><button type="button" class="td-icon-btn ttd-chart-expand" disabled title="全屏">⛶</button></div>
          <div class="tid-chart-body tid-chart-body-stack dba-trend-body ttd-rate-chart-body">
            <span class="tid-yunit">bps</span>
            <div class="to-chart-plot tid-chart-plot ttd-rate-plot">
              <div class="to-chart-ylabels" aria-hidden="true"></div>
              <svg class="to-chart-svg" aria-hidden="true"></svg>
              <div class="to-chart-xlabels"></div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- 目标流量 -->
    <div v-show="activeTab === 'target-traffic'" class="ttd-rate-page tid-page">
      <div class="tdh-filters ttd-rate-filters">
        <div class="tdh-filter-row tdh-filter-row-actions">
          <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" type="text" value="2026-06-15 14:24 - 2026-06-15 14:39" disabled /></label>
          <button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button>
          <button type="button" class="secondary td-reset-btn" disabled title="暂未开放">重置</button>
          <button type="button" class="secondary ttd-filter-more" disabled title="暂未开放">过滤条件 ▾</button>
          <div class="tdh-filter-field tdh-ip-version hsa-ip-version ttd-ip-version" role="group"><div class="tio-range-btns"><button type="button" class="tio-range-btn active" disabled>IPv4</button><button type="button" class="tio-range-btn" disabled>IPv6</button></div></div>
          <button type="button" class="link-btn tid-export-btn ttd-export-btn" disabled title="暂未开放">⬇ 导出</button>
        </div>
      </div>
      <div class="ttd-rate-grid">
        <section v-for="c in targetCharts" :key="c.title" class="tid-chart-panel dba-trend-panel ttd-rate-chart">
          <div class="dba-trend-head"><h3 class="dba-trend-title">{{ c.title }}</h3><button type="button" class="td-icon-btn ttd-chart-expand" disabled title="全屏">⛶</button></div>
          <div class="tid-chart-body tid-chart-body-stack dba-trend-body ttd-rate-chart-body">
            <span class="tid-yunit">bps</span>
            <div class="to-chart-plot tid-chart-plot ttd-rate-plot">
              <div class="to-chart-ylabels" aria-hidden="true"></div>
              <svg class="to-chart-svg" aria-hidden="true"></svg>
              <div class="to-chart-xlabels"></div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- 设置 -->
    <div v-show="activeTab === 'settings'" class="ttd-settings-page">
      <div class="ttd-settings-alert">若预期并发连接数接近或超过100万，建议不要开启此功能；保存最近7天数据。</div>
      <div class="ttd-settings-form">
        <label class="ttd-settings-field"><span class="ou-toolbar-label">状态</span><span class="ttd-switch-wrap"><input type="checkbox" class="ttd-switch" disabled /><span class="ttd-switch-text">关闭</span></span></label>
        <label class="ttd-settings-field"><span class="ou-toolbar-label">TTL</span><input class="ou-toolbar-input ttd-ttl-input" type="text" value="60" disabled /><span class="ttd-settings-hint">单位:秒 缓冲区最大存储时间</span></label>
        <button type="button" class="ou-search-btn ttd-submit-btn" disabled title="暂未开放">提交</button>
      </div>
      <section class="ttd-buffer-section">
        <h3 class="ttd-buffer-title">缓冲区列表</h3>
        <div class="ttd-buffer-grid">
          <div v-for="b in buffers" :key="b.label" class="ttd-gauge-item">
            <div class="ttd-gauge">
              <svg class="ttd-gauge-svg" viewBox="0 0 80 80" aria-hidden="true">
                <circle class="ttd-gauge-track" cx="40" cy="40" r="34" />
                <circle class="ttd-gauge-fill" cx="40" cy="40" r="34" :stroke-dasharray="`${b.dash} 213.63`" transform="rotate(-90 40 40)" />
              </svg>
              <span class="ttd-gauge-val">{{ b.percent }}</span>
            </div>
            <span class="ttd-gauge-label">{{ b.label }}</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import './nv-shared.css'

const tabs = [
  { key: 'user-traffic', label: '用户流量' },
  { key: 'target-traffic', label: '目标流量' },
  { key: 'settings', label: '设置' },
]
const activeTab = ref('user-traffic')

const userCharts = [
  { title: '上行平均速率趋势' },
  { title: '下行平均速率趋势' },
  { title: '上行最大速率趋势' },
  { title: '下行最大速率趋势' },
]

const targetCharts = [
  { title: '上行平均速率趋势' },
  { title: '下行平均速率趋势' },
  { title: '上行最大速率趋势' },
  { title: '下行最大速率趋势' },
]

const buffers = [
  { label: '缓冲区0', percent: '42.3%', dash: '90.36' },
  { label: '缓冲区1', percent: '28%', dash: '59.82' },
  { label: '缓冲区2', percent: '0%', dash: '0.00' },
  { label: '缓冲区3', percent: '42.1%', dash: '89.94' },
  { label: '缓冲区4', percent: '0%', dash: '0.00' },
  { label: '缓冲区5', percent: '0%', dash: '0.00' },
  { label: '缓冲区6', percent: '0.1%', dash: '0.21' },
  { label: '缓冲区7', percent: '5.7%', dash: '12.18' },
  { label: '缓冲区8', percent: '6.2%', dash: '13.24' },
  { label: '缓冲区9', percent: '3.7%', dash: '7.90' },
  { label: '缓冲区10', percent: '0%', dash: '0.00' },
  { label: '缓冲区11', percent: '0%', dash: '0.00' },
]
</script>

<style scoped>
@import './nv-test-shared.css';
</style>
