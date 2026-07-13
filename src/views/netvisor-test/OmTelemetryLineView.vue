<template>
  <div class="om-oml-page">
    <div class="om-oml-panel" :class="{ active: activePanel === 'telemetry-line' }">
      <div class="ou-toolbar">
        <div class="om-oml-toolbar-left">
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">自动刷新</span>
            <select class="ou-toolbar-select" disabled>
              <option value="10000" selected>10 秒</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <select class="ou-toolbar-select" disabled>
              <option selected>所有类型</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <select class="ou-toolbar-select" disabled>
              <option selected>所有状态</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <select class="ou-toolbar-select" disabled>
              <option selected>所有组</option>
            </select>
          </label>
          <input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled />
          <button type="button" class="ou-search-btn" disabled>搜索</button>
        </div>
        <div class="om-oml-toolbar-right">
          <button type="button" class="link-btn" disabled>⚙ 批量操作 ▾</button>
          <button type="button" class="link-btn" disabled>+ 添加</button>
          <button type="button" class="link-btn" disabled>☁ 导入</button>
          <button type="button" class="link-btn" disabled>☁ 导出</button>
          <button type="button" class="link-btn" disabled aria-label="筛选">☰</button>
        </div>
      </div>
      <div class="ou-table-wrap">
        <table class="ou-table">
          <thead>
            <tr>
              <th class="col-check"><input type="checkbox" disabled aria-label="全选" /></th>
              <th class="col-id">ID</th>
              <th class="col-name">名称</th>
              <th class="col-iface">网卡</th>
              <th class="col-status">状态</th>
              <th class="col-ip">IP</th>
              <th class="col-gw">线路网关</th>
              <th class="col-mtu">MTU</th>
              <th class="col-vlan">VLAN</th>
              <th class="col-dns">DNS牵引/失败</th>
              <th class="col-rate">流入速率</th>
              <th class="col-rate">流出速率</th>
              <th class="col-conn">连接数</th>
              <th class="col-time">连接时间</th>
              <th class="col-info">其他信息</th>
              <th class="col-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in lineRows" :key="i">
              <td class="col-check"><input type="checkbox" disabled /></td>
              <td>{{ row.id }}</td>
              <td>{{ row.name }}</td>
              <td>{{ row.iface }}</td>
              <td><span class="nvt-tag" :class="row.status === '在线' ? 'nvt-tag-green' : 'nvt-tag-silver'">{{ row.status }}</span></td>
              <td>{{ row.ip }}</td>
              <td>{{ row.gw }}</td>
              <td>{{ row.mtu }}</td>
              <td>{{ row.vlan }}</td>
              <td>{{ row.dns }}</td>
              <td class="ou-num">{{ row.inRate }}</td>
              <td class="ou-num">{{ row.outRate }}</td>
              <td class="ou-num">{{ row.conns }}</td>
              <td>{{ row.time }}</td>
              <td>{{ row.info }}</td>
              <td><button class="link-btn" disabled>编辑</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="ou-footer">
        <div class="ou-footer-left">
          <div class="ou-pager">
            <button type="button" class="ou-page-btn" disabled aria-label="上一页">‹</button>
            <button type="button" class="ou-page-btn" disabled aria-label="下一页">›</button>
          </div>
        </div>
        <div class="ou-footer-right">
          <label class="ou-page-goto">
            到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页
            <button type="button" class="ou-page-goto-btn" disabled>确定</button>
          </label>
          <span>共 {{ lineRows.length }} 条</span>
          <label class="ou-page-size">
            <select disabled>
              <option selected>100 条/页</option>
            </select>
          </label>
        </div>
      </div>
    </div>

    <div class="om-oml-panel" :class="{ active: activePanel === 'line-log' }">
      <div class="ou-toolbar">
        <input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled />
        <button type="button" class="ou-search-btn" disabled>搜索</button>
        <div class="om-oml-toolbar-right">
          <button type="button" class="link-btn" disabled>☁ 导出</button>
        </div>
      </div>
      <div class="ou-table-wrap">
        <table class="ou-table">
          <thead>
            <tr>
              <th class="col-idx">序号</th>
              <th class="col-time">时间</th>
              <th class="col-line">线路</th>
              <th class="col-content">内容</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in logRows" :key="i">
              <td class="col-idx">{{ i + 1 }}</td>
              <td>{{ row.time }}</td>
              <td>{{ row.line }}</td>
              <td>{{ row.content }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="ou-footer">
        <div class="ou-footer-left">
          <div class="ou-pager">
            <button type="button" class="ou-page-btn" disabled aria-label="上一页">‹</button>
            <button type="button" class="ou-page-btn" disabled aria-label="下一页">›</button>
          </div>
        </div>
        <div class="ou-footer-right">
          <label class="ou-page-goto">
            到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页
            <button type="button" class="ou-page-goto-btn" disabled>确定</button>
          </label>
          <span>共 {{ logRows.length }} 条</span>
          <label class="ou-page-size">
            <select disabled>
              <option selected>100 条/页</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import './nv-shared.css'

const activePanel = ref('telemetry-line')

const lineRows = [
  { id: 1, name: '链路A', iface: 'eth0', status: '在线', ip: '192.168.1.1/24', gw: '192.168.1.254', mtu: 1500, vlan: 10, dns: '12864/0', inRate: '12.5 Mbps', outRate: '45.3 Mbps', conns: 4286, time: '2026-06-15 10:30:00', info: '—' },
  { id: 2, name: '链路B', iface: 'eth1', status: '在线', ip: '10.0.0.1/16', gw: '10.0.0.254', mtu: 1500, vlan: 20, dns: '8642/0', inRate: '8.2 Mbps', outRate: '32.1 Mbps', conns: 2864, time: '2026-06-15 10:30:00', info: '—' },
  { id: 3, name: '链路C', iface: 'eth2', status: '离线', ip: '172.16.0.1/12', gw: '172.16.0.254', mtu: 1500, vlan: 30, dns: '0/0', inRate: '0', outRate: '0', conns: 0, time: '—', info: '链路故障' },
]

const logRows = [
  { time: '2026-06-15 14:30:28', line: '链路A', content: 'DNS牵引成功，IP: 192.168.1.100' },
  { time: '2026-06-15 14:30:15', line: '链路B', content: 'DNS牵引成功，IP: 10.0.0.100' },
  { time: '2026-06-15 14:28:42', line: '链路C', content: '链路断开，原因: 端口故障' },
  { time: '2026-06-15 14:25:00', line: '链路A', content: '流量超过阈值，当前速率: 50.2 Mbps' },
]
</script>

<style scoped>
.om-oml-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 600px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
}

.om-oml-panel {
  display: none;
  flex-direction: column;
  flex: 1;
}

.om-oml-panel.active {
  display: flex;
}

.om-oml-toolbar-left,
.om-oml-toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.om-oml-toolbar-right {
  margin-left: auto;
}

.col-check {
  width: 42px;
  text-align: center;
}

.col-id {
  width: 60px;
}

.col-name {
  min-width: 120px;
}

.col-iface {
  min-width: 100px;
}

.col-status {
  width: 80px;
}

.col-ip {
  min-width: 120px;
}

.col-gw {
  min-width: 120px;
}

.col-mtu {
  width: 70px;
}

.col-vlan {
  width: 70px;
}

.col-dns {
  min-width: 120px;
}

.col-rate {
  min-width: 100px;
  text-align: right;
}

.col-conn {
  min-width: 80px;
  text-align: right;
}

.col-time {
  min-width: 120px;
}

.col-info {
  min-width: 120px;
}

.col-actions {
  width: 100px;
  text-align: center;
}

.col-idx {
  width: 60px;
  text-align: center;
}

.col-line {
  min-width: 120px;
}

.col-content {
  min-width: 300px;
}
</style>
