<template>
  <div class="ni-page">
    <div class="ni-card">
      <div class="ni-tabs-header">
        <div class="ni-tabs-nav">
          <button :class="['ni-tab', { active: tab === 'iface' }]" @click="tab = 'iface'">网络接口</button>
          <button :class="['ni-tab', { active: tab === 'switch' }]" @click="tab = 'switch'">交换组</button>
          <button :class="['ni-tab', { active: tab === 'nic-sched' }]" @click="tab = 'nic-sched'">网卡调度</button>
        </div>
        <button class="ni-link-btn" disabled>高级设置</button>
      </div>

      <!-- 网络接口 -->
      <div v-show="tab === 'iface'" class="ni-body">
        <table class="ni-table">
          <thead>
            <tr>
              <th>名称</th><th>状态</th><th>工作模式</th><th>接入模式</th><th>方向</th>
              <th>对端接口</th><th>链路捆绑</th><th>SWGRP</th>
              <th>流入速率</th><th>流出速率</th><th>流入PPS</th><th>流出PPS</th>
              <th>硬件信息</th><th>备注</th><th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="iface in interfaces" :key="iface.name">
              <td><strong>{{ iface.name }}</strong></td>
              <td><span :class="iface.up ? 'ni-status-ok' : 'ni-status-bad'">{{ iface.up ? '✓' : '✕' }}</span></td>
              <td>{{ iface.mode || '—' }}</td>
              <td>{{ iface.accessMode }}</td>
              <td>{{ iface.direction }}</td>
              <td>{{ iface.peer || '—' }}</td>
              <td>{{ iface.bond || '—' }}</td>
              <td>{{ iface.swgrp || '—' }}</td>
              <td class="num">{{ fmtNum(iface.rxBps) }}</td>
              <td class="num">{{ fmtNum(iface.txBps) }}</td>
              <td class="num">{{ fmtNum(iface.rxPps) }}</td>
              <td class="num">{{ fmtNum(iface.txPps) }}</td>
              <td class="ni-hw"><span>驱动 {{ iface.driver }}</span><span>型号 {{ iface.model }}</span><span>MAC {{ iface.mac }}</span></td>
              <td>{{ iface.remark || '—' }}</td>
              <td><button class="ni-link-btn" disabled>✎</button><button class="ni-link-btn" disabled>📈</button></td>
            </tr>
            <tr class="ni-summary">
              <td>合计</td><td colspan="7"></td>
              <td class="num">{{ fmtNum(sumRx) }}</td>
              <td class="num">{{ fmtNum(sumTx) }}</td>
              <td class="num">{{ fmtNum(sumRxPps) }}</td>
              <td class="num">{{ fmtNum(sumTxPps) }}</td>
              <td colspan="3"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 交换组 -->
      <div v-show="tab === 'switch'" class="ni-body">
        <table class="ni-table">
          <thead>
            <tr><th>名称</th><th>状态</th><th>工作模式</th><th>接入模式</th><th>方向</th><th>流入速率</th><th>流出速率</th><th>流入PPS</th><th>流出PPS</th><th>硬件信息</th><th>操作</th></tr>
          </thead>
          <tbody>
            <tr v-for="sw in switchGroups" :key="sw.name">
              <td><strong>{{ sw.name }}</strong></td>
              <td><span :class="sw.up ? 'ni-status-ok' : 'ni-status-bad'">{{ sw.up ? '✓' : '✕' }}</span></td>
              <td>{{ sw.mode || '—' }}</td>
              <td>{{ sw.accessMode }}</td>
              <td>{{ sw.direction }}</td>
              <td class="num">{{ fmtNum(sw.rxBps) }}</td>
              <td class="num">{{ fmtNum(sw.txBps) }}</td>
              <td class="num">{{ fmtNum(sw.rxPps) }}</td>
              <td class="num">{{ fmtNum(sw.txPps) }}</td>
              <td class="ni-hw"><span>驱动 增强型</span><span>型号 {{ sw.model }}</span><span>MAC {{ sw.mac }}</span></td>
              <td><button class="ni-link-btn" disabled>📈</button></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 网卡调度 -->
      <div v-show="tab === 'nic-sched'" class="ni-body">
        <div class="ni-sched-grid">
          <div class="ni-sched-panel">
            <h3 class="ni-section-title">核心列表</h3>
            <table class="ni-table">
              <thead><tr><th>合计</th><th>等待包</th><th>突发值</th><th>PPS</th><th>网卡队列</th></tr></thead>
              <tbody>
                <tr v-for="core in cores" :key="core.id">
                  <td class="num">{{ core.id }}</td>
                  <td class="num">{{ core.waiting }}</td>
                  <td class="num">{{ core.burst }}</td>
                  <td class="num">{{ fmtNum(core.pps) }}</td>
                  <td><span class="ni-nic-tag" v-for="q in core.queues" :key="q">{{ q }}</span></td>
                </tr>
                <tr class="ni-summary"><td>合计</td><td class="num">0</td><td class="num">0</td><td class="num">{{ fmtNum(coresPpsTotal) }}</td><td></td></tr>
              </tbody>
            </table>
          </div>
          <div class="ni-sched-panel">
            <h3 class="ni-section-title">网卡队列</h3>
            <table class="ni-table">
              <thead><tr><th>网卡</th><th>处理单元1</th><th>处理单元2</th><th>PPS</th></tr></thead>
              <tbody>
                <tr v-for="q in nicQueues" :key="q.name">
                  <td>{{ q.name }}</td>
                  <td>{{ q.cpu1 }}</td>
                  <td>{{ q.cpu2 }}</td>
                  <td class="num">{{ fmtNum(q.pps) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const tab = ref<'iface' | 'switch' | 'nic-sched'>('iface')

const interfaces = ref([
  { name: 'igb1', up: true, mode: '', accessMode: '监控模式', direction: '接内', peer: '', bond: '', swgrp: '', rxBps: 681217, txBps: 1004984, rxPps: 428642, txPps: 86428, driver: '增强型', model: 'I210_COPPER', mac: '3c:ec:ef:a3:9a:a5', remark: '' },
  { name: 'xe2', up: true, mode: '', accessMode: '监控模式', direction: '接内', peer: '', bond: '', swgrp: '', rxBps: 375093, txBps: 391315, rxPps: 128642, txPps: 42864, driver: '增强型', model: 'XL710_SFP', mac: '3c:ec:ef:a3:9a:b2', remark: '' },
])

const switchGroups = ref([
  { name: 'swgrp1', up: false, mode: '', accessMode: '监控模式', direction: '接内', rxBps: 0, txBps: 0, rxPps: 0, txPps: 0, model: 'swgrp', mac: '8e-83-cc-f9-77-01' },
  { name: 'swgrp2', up: false, mode: '', accessMode: '监控模式', direction: '接内', rxBps: 0, txBps: 0, rxPps: 0, txPps: 0, model: 'swgrp', mac: '8e-83-cc-f9-77-02' },
])

const cores = ref([
  { id: 3, waiting: 0, burst: 0, pps: 681217, queues: ['igb1-1 1', 'xe3-1 285130'] },
  { id: 2, waiting: 0, burst: 0, pps: 1004984, queues: ['xe4-2 540422'] },
])
const coresPpsTotal = computed(() => cores.value.reduce((s, c) => s + c.pps, 0))

const nicQueues = ref([
  { name: 'igb1-1', cpu1: '核心3', cpu2: '未配置', pps: 5 },
  { name: 'xe2-1', cpu1: '核心1', cpu2: '未配置', pps: 375093 },
  { name: 'xe3-1', cpu1: '核心2', cpu2: '未配置', pps: 285130 },
])

const sumRx = computed(() => interfaces.value.reduce((s, i) => s + i.rxBps, 0))
const sumTx = computed(() => interfaces.value.reduce((s, i) => s + i.txBps, 0))
const sumRxPps = computed(() => interfaces.value.reduce((s, i) => s + i.rxPps, 0))
const sumTxPps = computed(() => interfaces.value.reduce((s, i) => s + i.txPps, 0))

function fmtNum(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return String(n)
}
</script>

<style scoped>
.ni-page { padding: 0 4px; }
.ni-card {
  background: #fff; border-radius: 6px; border: 1px solid #e8e8e8;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06); overflow: hidden;
}
.ni-tabs-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 20px; border-bottom: 1px solid #f0f0f0;
}
.ni-tabs-nav { display: flex; gap: 0; }
.ni-tab {
  padding: 12px 20px; border: none; background: none; font-size: 14px; font-weight: 500;
  color: #606266; cursor: pointer; border-bottom: 2px solid transparent;
}
.ni-tab.active { color: #1890ff; border-bottom-color: #1890ff; }
.ni-tab:hover:not(.active) { color: #303133; }
.ni-link-btn { background: none; border: none; color: #409eff; font-size: 13px; cursor: not-allowed; opacity: 0.6; }
.ni-body { padding: 0; overflow-x: auto; }

.ni-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.ni-table th {
  text-align: left; padding: 10px 12px; background: #fafafa;
  color: #606266; font-weight: 600; border-bottom: 1px solid #ebeef5; white-space: nowrap;
}
.ni-table td { padding: 9px 12px; border-bottom: 1px solid #f0f0f0; color: #303133; }
.ni-table tbody tr:hover { background: #f5f7fa; }
.ni-table .num { font-variant-numeric: tabular-nums; text-align: right; }
.ni-summary { background: #fafbfc; font-weight: 600; }

.ni-status-ok { color: #52c41a; font-weight: 700; }
.ni-status-bad { color: #f5222d; font-weight: 700; }

.ni-hw { font-size: 11px; color: #8c8c8c; }
.ni-hw span { display: block; }

.ni-section-title { font-size: 14px; font-weight: 600; color: #303133; margin: 0 0 12px; }
.ni-sched-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 16px; }
.ni-sched-panel { }

.ni-nic-tag {
  display: inline-block; padding: 2px 6px; margin: 2px 4px; border-radius: 3px;
  font-size: 11px; background: #f0f5ff; color: #1890ff; border: 1px solid #adc6ff;
}
</style>
