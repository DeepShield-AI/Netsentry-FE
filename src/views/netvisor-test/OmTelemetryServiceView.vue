<template>
  <div class="om-oms-page">
    <div class="om-oms-panel" :class="{ active: activePanel === 'service-list' }">
      <div class="ou-toolbar">
        <div class="om-oms-toolbar-left">
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">自动刷新</span>
            <select class="ou-toolbar-select" disabled>
              <option selected>10 秒</option>
            </select>
          </label>
          <input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled />
          <button type="button" class="ou-search-btn" disabled>搜索</button>
        </div>
        <div class="om-oms-toolbar-right">
          <button type="button" class="link-btn" disabled>⏸ 禁用</button>
          <button type="button" class="link-btn" disabled>▶ 启用</button>
          <button type="button" class="link-btn" disabled>删除</button>
          <button type="button" class="link-btn" disabled>+ 添加</button>
          <button type="button" class="link-btn" disabled aria-label="筛选">☰</button>
        </div>
      </div>
      <div class="ou-table-wrap">
        <table class="ou-table">
          <thead>
            <tr>
              <th class="col-check"><input type="checkbox" disabled aria-label="全选" /></th>
              <th class="col-idx">序号</th>
              <th class="col-name">名称</th>
              <th class="col-gw">服务网关</th>
              <th class="col-dns">DNS</th>
              <th class="col-mtu">MTU</th>
              <th class="col-group">用户组</th>
              <th class="col-auth">认证方式</th>
              <th class="col-radius">RADIUS</th>
              <th class="col-online">在线用户</th>
              <th class="col-rate">流入速率</th>
              <th class="col-rate">流出速率</th>
              <th class="col-lines">可访问线路</th>
              <th class="col-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in serviceRows" :key="i">
              <td class="col-check"><input type="checkbox" disabled /></td>
              <td class="col-idx">{{ i + 1 }}</td>
              <td>{{ row.name }}</td>
              <td>{{ row.gw }}</td>
              <td>{{ row.dns }}</td>
              <td>{{ row.mtu }}</td>
              <td>{{ row.group }}</td>
              <td>{{ row.auth }}</td>
              <td>{{ row.radius }}</td>
              <td class="ou-num">{{ row.online }}</td>
              <td class="ou-num">{{ row.inRate }}</td>
              <td class="ou-num">{{ row.outRate }}</td>
              <td>{{ row.lines }}</td>
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
          <span>共 {{ serviceRows.length }} 条</span>
          <label class="ou-page-size">
            <select disabled>
              <option selected>100 条/页</option>
            </select>
          </label>
        </div>
      </div>
    </div>

    <div class="om-oms-panel" :class="{ active: activePanel === 'service-map' }">
      <div class="om-oms-map-card">
        <div class="ou-table-wrap">
          <table class="ou-table">
            <thead>
              <tr>
                <th class="col-line">映射线路</th>
                <th class="col-port">映射端口</th>
                <th class="col-svc">iWAN服务</th>
                <th class="col-count">访问次数</th>
                <th class="col-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in mapRows" :key="i">
                <td>{{ row.line }}</td>
                <td>{{ row.port }}</td>
                <td>{{ row.service }}</td>
                <td class="ou-num">{{ row.count }}</td>
                <td class="col-actions"><button type="button" class="link-btn" disabled>删除</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="om-oms-panel" :class="{ active: activePanel === 'online-users' }">
      <div class="ou-toolbar">
        <div class="om-oms-toolbar-left">
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">自动刷新</span>
            <select class="ou-toolbar-select" disabled>
              <option selected>10 秒</option>
            </select>
          </label>
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">iWAN服务</span>
            <select class="ou-toolbar-select" disabled>
              <option selected>所有服务</option>
            </select>
          </label>
          <input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled />
          <button type="button" class="ou-search-btn" disabled>搜索</button>
        </div>
        <div class="om-oms-toolbar-right">
          <button type="button" class="link-btn" disabled>⏻ 强制下线</button>
          <button type="button" class="link-btn" disabled aria-label="筛选">☰</button>
        </div>
      </div>
      <div class="ou-table-wrap">
        <table class="ou-table">
          <thead>
            <tr>
              <th class="col-check"><input type="checkbox" disabled aria-label="全选" /></th>
              <th class="col-idx">序号</th>
              <th class="col-svc">iWAN服务</th>
              <th class="col-account">账号</th>
              <th class="col-ip">IP</th>
              <th class="col-status">状态</th>
              <th class="col-mtu">MTU</th>
              <th class="col-gw">网关地址</th>
              <th class="col-conn-info">连接信息</th>
              <th class="col-conn">连接数</th>
              <th class="col-rate">上行速率</th>
              <th class="col-rate">下行速率</th>
              <th class="col-latency">时延</th>
              <th class="col-duration">在线时长</th>
              <th class="col-adv">高级信息</th>
              <th class="col-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in onlineUsers" :key="i">
              <td class="col-check"><input type="checkbox" disabled /></td>
              <td class="col-idx">{{ i + 1 }}</td>
              <td>{{ row.service }}</td>
              <td>{{ row.account }}</td>
              <td>{{ row.ip }}</td>
              <td><span class="nvt-tag nvt-tag-green">{{ row.status }}</span></td>
              <td>{{ row.mtu }}</td>
              <td>{{ row.gw }}</td>
              <td>{{ row.connInfo }}</td>
              <td class="ou-num">{{ row.conns }}</td>
              <td class="ou-num">{{ row.upRate }}</td>
              <td class="ou-num">{{ row.downRate }}</td>
              <td class="ou-num">{{ row.latency }}</td>
              <td>{{ row.duration }}</td>
              <td>{{ row.adv }}</td>
              <td><button class="link-btn" disabled>下线</button></td>
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
          <span>共 {{ onlineUsers.length }} 条</span>
          <label class="ou-page-size">
            <select disabled>
              <option selected>100 条/页</option>
            </select>
          </label>
        </div>
      </div>
    </div>

    <div class="om-oms-panel" :class="{ active: activePanel === 'service-log' }">
      <div class="ou-toolbar">
        <input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled />
        <button type="button" class="ou-search-btn" disabled>搜索</button>
      </div>
      <div class="ou-table-wrap">
        <table class="ou-table">
          <thead>
            <tr>
              <th class="col-idx">序号</th>
              <th class="col-time">时间</th>
              <th class="col-account">账号</th>
              <th class="col-content">内容</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in logRows" :key="i">
              <td class="col-idx">{{ i + 1 }}</td>
              <td>{{ row.time }}</td>
              <td>{{ row.account }}</td>
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

const activePanel = ref('service-list')

const serviceRows = [
  { name: '办公区服务', gw: '192.168.1.254', dns: '114.114.114.114', mtu: 1500, group: '办公区', auth: '本地认证', radius: '—', online: 128, inRate: '12.5 Mbps', outRate: '45.3 Mbps', lines: '链路A, 链路B' },
  { name: '生产区服务', gw: '10.0.0.254', dns: '166.111.4.5', mtu: 1500, group: '生产区', auth: 'RADIUS', radius: '启用', online: 42, inRate: '8.2 Mbps', outRate: '32.1 Mbps', lines: '链路B' },
  { name: '访客服务', gw: '192.168.100.254', dns: '8.8.8.8', mtu: 1500, group: '访客', auth: '本地认证', radius: '—', online: 8, inRate: '2.1 Mbps', outRate: '8.6 Mbps', lines: '链路A' },
]

const mapRows = [
  { line: '链路A', port: 8000, service: '办公区服务', count: 1286 },
  { line: '链路B', port: 8000, service: '生产区服务', count: 864 },
  { line: '链路A', port: 8080, service: '访客服务', count: 286 },
]

const onlineUsers = [
  { service: '办公区服务', account: 'user001', ip: '192.168.1.100', status: '在线', mtu: 1500, gw: '192.168.1.254', connInfo: '稳定', conns: 12, upRate: '1.2 Mbps', downRate: '4.5 Mbps', latency: '28ms', duration: '2h 30m', adv: '—' },
  { service: '办公区服务', account: 'user002', ip: '192.168.1.101', status: '在线', mtu: 1500, gw: '192.168.1.254', connInfo: '稳定', conns: 8, upRate: '860 Kbps', downRate: '3.2 Mbps', latency: '32ms', duration: '1h 45m', adv: '—' },
  { service: '生产区服务', account: 'prod001', ip: '10.0.0.100', status: '在线', mtu: 1500, gw: '10.0.0.254', connInfo: '稳定', conns: 24, upRate: '2.5 Mbps', downRate: '8.6 Mbps', latency: '18ms', duration: '4h 12m', adv: '—' },
]

const logRows = [
  { time: '2026-06-15 14:30:28', account: 'user001', content: '成功登录，IP: 192.168.1.100' },
  { time: '2026-06-15 14:25:15', account: 'user002', content: '成功登录，IP: 192.168.1.101' },
  { time: '2026-06-15 14:20:00', account: 'prod001', content: '成功登录，IP: 10.0.0.100' },
  { time: '2026-06-15 14:15:42', account: 'guest001', content: '登录失败，密码错误' },
]
</script>

<style scoped>
.om-oms-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 600px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
}

.om-oms-panel {
  display: none;
  flex-direction: column;
  flex: 1;
}

.om-oms-panel.active {
  display: flex;
}

.om-oms-toolbar-left,
.om-oms-toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.om-oms-toolbar-right {
  margin-left: auto;
}

.om-oms-map-card {
  padding: 16px;
}

.col-check { width: 42px; text-align: center; }
.col-idx { width: 60px; text-align: center; }
.col-name { min-width: 120px; }
.col-gw { min-width: 120px; }
.col-dns { min-width: 100px; }
.col-mtu { width: 70px; }
.col-group { min-width: 100px; }
.col-auth { min-width: 100px; }
.col-radius { min-width: 100px; }
.col-online { min-width: 80px; text-align: right; }
.col-rate { min-width: 100px; text-align: right; }
.col-lines { min-width: 120px; }
.col-actions { width: 100px; text-align: center; }
.col-line { min-width: 120px; }
.col-port { min-width: 100px; }
.col-svc { min-width: 120px; }
.col-count { min-width: 80px; text-align: right; }
.col-account { min-width: 120px; }
.col-ip { min-width: 120px; }
.col-status { width: 80px; }
.col-conn-info { min-width: 120px; }
.col-conn { min-width: 80px; text-align: right; }
.col-latency { min-width: 80px; text-align: right; }
.col-duration { min-width: 100px; }
.col-adv { min-width: 120px; }
.col-time { min-width: 120px; }
.col-content { min-width: 300px; }
</style>
