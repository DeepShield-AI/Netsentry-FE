<template>
  <div class="nvt-page">
    <div class="nvt-card">
      <div class="nvt-card-header">
        <div class="nv-tabs-nav" role="tablist">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            class="nvt-tab"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key"
          >{{ tab.label }}</button>
        </div>
      </div>
      <div class="nvt-card-body">
        <!-- 接口面板 -->
        <div v-show="activeTab === 'iface'">
          <div class="nvt-table-wrap">
            <table class="ou-table">
              <thead>
                <tr>
                  <th>名称</th>
                  <th>状态</th>
                  <th>工作模式</th>
                  <th>接入模式</th>
                  <th>方向</th>
                  <th>对端接口</th>
                  <th>链路捆绑</th>
                  <th>SWGRP</th>
                  <th>流入速率</th>
                  <th>流出速率</th>
                  <th>流入 PPS</th>
                  <th>流出 PPS</th>
                  <th>硬件信息</th>
                  <th>备注</th>
                  <th class="col-actions">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in ifaceData" :key="item.name">
                  <td><button type="button" class="link-btn" disabled>{{ item.name }}</button></td>
                  <td :class="item.ok ? 'sm-status-ok' : 'sm-status-bad'">{{ item.ok ? '✓' : '✕' }}</td>
                  <td>{{ item.workMode }}</td>
                  <td>{{ item.accessMode }}</td>
                  <td>{{ item.direction }}</td>
                  <td>{{ item.peer }}</td>
                  <td>{{ item.bond }}</td>
                  <td>{{ item.swgrp }}</td>
                  <td class="ou-num">{{ item.inRate }}</td>
                  <td class="ou-num">{{ item.outRate }}</td>
                  <td class="ou-num">{{ item.inPps }}</td>
                  <td class="ou-num">{{ item.outPps }}</td>
                  <td class="sm-hw-info">
                    <span>驱动 {{ item.driver }}</span>
                    <span>型号 {{ item.model }}</span>
                    <span>MAC {{ item.mac }}</span>
                  </td>
                  <td>{{ item.remark }}</td>
                  <td class="col-actions">
                    <button type="button" class="link-btn" disabled title="暂未开放">✎</button>
                    <button type="button" class="link-btn" disabled title="暂未开放">📈</button>
                  </td>
                </tr>
                <tr class="sm-summary-row">
                  <td>合计</td>
                  <td colspan="7"></td>
                  <td class="ou-num">{{ ifaceTotal.inRate }}</td>
                  <td class="ou-num">{{ ifaceTotal.outRate }}</td>
                  <td class="ou-num">{{ ifaceTotal.inPps }}</td>
                  <td class="ou-num">{{ ifaceTotal.outPps }}</td>
                  <td colspan="3"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 交换组面板 -->
        <div v-show="activeTab === 'switch'">
          <div class="nvt-table-wrap">
            <table class="ou-table">
              <thead>
                <tr>
                  <th>名称</th>
                  <th>状态</th>
                  <th>工作模式</th>
                  <th>接入模式</th>
                  <th>方向</th>
                  <th>流入速率</th>
                  <th>流出速率</th>
                  <th>流入 PPS</th>
                  <th>流出 PPS</th>
                  <th>硬件信息</th>
                  <th class="col-actions">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in switchData" :key="item.name">
                  <td><button type="button" class="link-btn" disabled>{{ item.name }}</button></td>
                  <td :class="item.ok ? 'sm-status-ok' : 'sm-status-bad'">{{ item.ok ? '✓' : '✕' }}</td>
                  <td>{{ item.workMode }}</td>
                  <td>{{ item.accessMode }}</td>
                  <td>{{ item.direction }}</td>
                  <td class="ou-num">{{ item.inRate }}</td>
                  <td class="ou-num">{{ item.outRate }}</td>
                  <td class="ou-num">{{ item.inPps }}</td>
                  <td class="ou-num">{{ item.outPps }}</td>
                  <td class="sm-hw-info">
                    <span>驱动 {{ item.driver }}</span>
                    <span>型号 {{ item.model }}</span>
                    <span>MAC {{ item.mac }}</span>
                  </td>
                  <td class="col-actions">
                    <button type="button" class="link-btn" disabled title="暂未开放">📈</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 网卡调度面板 -->
        <div v-show="activeTab === 'nicSched'" class="sm-nic-sched-grid">
          <section class="sm-nic-sched-panel">
            <h3 class="om-section-title">核心列表</h3>
            <div class="nvt-table-wrap">
              <table class="ou-table">
                <thead>
                  <tr>
                    <th>合计</th>
                    <th>等待包</th>
                    <th>突发值</th>
                    <th>PPs</th>
                    <th>网卡队列</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in coreData" :key="item.total">
                    <td class="ou-num">{{ item.total }}</td>
                    <td class="ou-num">{{ item.waitPkt }}</td>
                    <td class="ou-num">{{ item.burst }}</td>
                    <td class="ou-num">{{ item.pps }}</td>
                    <td>
                      <span v-for="q in item.queues" :key="q" class="sm-nic-tag">{{ q }}</span>
                    </td>
                  </tr>
                  <tr class="sm-summary-row">
                    <td>合计</td>
                    <td class="ou-num">0</td>
                    <td class="ou-num">0</td>
                    <td class="ou-num">{{ coreTotalPps }}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
          <section class="sm-nic-sched-panel">
            <h3 class="om-section-title">网卡队列</h3>
            <div class="nvt-table-wrap">
              <table class="ou-table">
                <thead>
                  <tr>
                    <th>网卡</th>
                    <th>处理单元 1</th>
                    <th>处理单元 2</th>
                    <th>PPS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in nicQueueData" :key="item.nic">
                    <td>{{ item.nic }}</td>
                    <td>
                      <select class="ou-toolbar-select" disabled>
                        <option selected>{{ item.unit1 }}</option>
                      </select>
                    </td>
                    <td>
                      <select class="ou-toolbar-select" disabled>
                        <option selected>{{ item.unit2 }}</option>
                      </select>
                    </td>
                    <td class="ou-num">{{ item.pps }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import './nv-test-shared.css'

const tabs = [
  { key: 'iface', label: '接口' },
  { key: 'switch', label: '交换组' },
  { key: 'nicSched', label: '网卡调度' }
]
const activeTab = ref('iface')

const ifaceData = ref([
  {
    name: 'igb1', ok: true, workMode: '—', accessMode: '监控模式', direction: '接内',
    peer: '—', bond: '—', swgrp: '—',
    inRate: 681217, outRate: 1004984, inPps: 428642, outPps: 86428,
    driver: '增强型', model: 'I210_COPPER', mac: '3c:ec:ef:a3:9a:a5', remark: '—'
  },
  {
    name: 'xe2', ok: true, workMode: '—', accessMode: '监控模式', direction: '接内',
    peer: '—', bond: '—', swgrp: '—',
    inRate: 375093, outRate: 391315, inPps: 128642, outPps: 42864,
    driver: '增强型', model: 'XL710_SFP', mac: '3c:ec:ef:a3:9a:b2', remark: '—'
  }
])

const ifaceTotal = computed(() => ({
  inRate: ifaceData.value.reduce((s, i) => s + i.inRate, 0),
  outRate: ifaceData.value.reduce((s, i) => s + i.outRate, 0),
  inPps: ifaceData.value.reduce((s, i) => s + i.inPps, 0),
  outPps: ifaceData.value.reduce((s, i) => s + i.outPps, 0)
}))

const switchData = ref([
  {
    name: 'swgrp1', ok: false, workMode: '—', accessMode: '监控模式', direction: '接内',
    inRate: 0, outRate: 0, inPps: 0, outPps: 0,
    driver: '增强型', model: 'swgrp', mac: '8e-83-cc-f9-77-01'
  },
  {
    name: 'swgrp2', ok: false, workMode: '—', accessMode: '监控模式', direction: '接内',
    inRate: 0, outRate: 0, inPps: 0, outPps: 0,
    driver: '增强型', model: 'swgrp', mac: '8e-83-cc-f9-77-02'
  }
])

const coreData = ref([
  { total: 3, waitPkt: 0, burst: 0, pps: 681217, queues: ['igb1-1 1', 'xe3-1 285130'] },
  { total: 2, waitPkt: 0, burst: 0, pps: 1004984, queues: ['xe4-2 540422'] }
])

const coreTotalPps = computed(() => coreData.value.reduce((s, i) => s + i.pps, 0))

const nicQueueData = ref([
  { nic: 'igb1-1', unit1: '核心 3', unit2: '未配置', pps: 5 },
  { nic: 'xe2-1', unit1: '核心 1', unit2: '未配置', pps: 375093 },
  { nic: 'xe3-1', unit1: '核心 2', unit2: '未配置', pps: 285130 }
])
</script>

<style scoped>
.om-section-title {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
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

.col-actions {
  width: 100px;
  text-align: center;
}

.link-btn {
  background: none;
  border: none;
  color: #409eff;
  cursor: pointer;
  padding: 0 4px;
  font-size: 13px;
}

.link-btn:disabled {
  color: #909399;
  cursor: not-allowed;
}

.sm-status-ok {
  color: #67c23a;
  font-weight: 700;
}

.sm-status-bad {
  color: #f56c6c;
  font-weight: 700;
}

.sm-hw-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12px;
  color: #606266;
}

.sm-summary-row {
  background: #fafafa;
  font-weight: 600;
}

.sm-summary-row td {
  border-top: 1px solid #e4e7ed;
}

.sm-nic-sched-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.sm-nic-tag {
  display: inline-block;
  padding: 2px 8px;
  margin: 2px;
  background: #ecf5ff;
  color: #409eff;
  border: 1px solid #d9ecff;
  border-radius: 4px;
  font-size: 12px;
}

.ou-toolbar-select {
  padding: 4px 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
  background: #fff;
}
</style>
