<template>
  <div class="om-account-page">
    <div class="om-account-top-tabs">
      <button
        v-for="tp in topPanels"
        :key="tp.key"
        type="button"
        class="om-account-top-tab"
        :class="{ active: activeTopPanel === tp.key }"
        @click="activeTopPanel = tp.key"
      >{{ tp.label }}</button>
    </div>
    <div class="om-account-top-panel" :class="{ active: activeTopPanel === 'account' }">
      <div class="om-account-subpage">
        <div class="om-account-inner-tabs">
          <div class="nv-tabs-nav nv-tabs-nav-wrap" role="tablist" aria-label="账号管理">
            <button
              v-for="tab in innerTabs"
              :key="tab.key"
              type="button"
              class="nv-tab"
              :class="{ active: activeInnerTab === tab.key }"
              role="tab"
              :aria-selected="activeInnerTab === tab.key"
              @click="activeInnerTab = tab.key"
            >{{ tab.label }}</button>
          </div>
        </div>
        <div class="om-account-inner-panels">
          <!-- 本地账号 -->
          <div class="om-account-inner-panel" :class="{ active: activeInnerTab === 'local' }">
            <div class="ou-toolbar">
              <div class="om-account-toolbar-left">
                <label class="tdh-filter-field">
                  <span class="ou-toolbar-label">账号状态</span>
                  <select class="ou-toolbar-select" disabled><option selected>所有</option></select>
                </label>
                <label class="tdh-filter-field">
                  <span class="ou-toolbar-label">账号期限</span>
                  <select class="ou-toolbar-select" disabled><option selected>所有</option></select>
                </label>
                <input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled />
                <button type="button" class="ou-search-btn" disabled>搜索</button>
              </div>
              <div class="om-account-toolbar-right">
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
                    <th class="col-idx">序号</th>
                    <th class="col-group">用户组</th>
                    <th class="col-account">用户账号</th>
                    <th class="col-name">姓名</th>
                    <th class="col-mac">绑定MAC</th>
                    <th class="col-ip">绑定IP</th>
                    <th class="col-vlan">绑定VLAN</th>
                    <th class="col-online-ip">在线IP</th>
                    <th class="col-online-user">在线用户</th>
                    <th class="col-date">起始日期</th>
                    <th class="col-date">截止日期</th>
                    <th class="col-date">最后下线</th>
                    <th class="col-info">其他信息</th>
                    <th class="col-actions">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in localAccounts" :key="row.idx">
                    <td class="col-check"><input type="checkbox" disabled /></td>
                    <td class="col-idx">{{ row.idx }}</td>
                    <td class="col-group">{{ row.group }}</td>
                    <td class="col-account">{{ row.account }}</td>
                    <td class="col-name">{{ row.name }}</td>
                    <td class="col-mac">{{ row.mac }}</td>
                    <td class="col-ip">{{ row.ip }}</td>
                    <td class="col-vlan">{{ row.vlan }}</td>
                    <td class="col-online-ip">{{ row.onlineIp }}</td>
                    <td class="col-online-user"><span class="nvt-tag" :class="row.onlineUser === '在线' ? 'nvt-tag-green' : 'nvt-tag-silver'">{{ row.onlineUser }}</span></td>
                    <td class="col-date">{{ row.startDate }}</td>
                    <td class="col-date">{{ row.endDate }}</td>
                    <td class="col-date">{{ row.lastOffline }}</td>
                    <td class="col-info">{{ row.info }}</td>
                    <td class="col-actions"><button class="link-btn" disabled>编辑</button></td>
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
                <label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页 <button type="button" class="ou-page-goto-btn" disabled>确定</button></label>
                <span>共 0 条</span>
                <label class="ou-page-size"><select disabled><option selected>100 条/页</option></select></label>
              </div>
            </div>
          </div>

          <!-- 代理账号 -->
          <div class="om-account-inner-panel" :class="{ active: activeInnerTab === 'proxy' }">
            <div class="ou-toolbar">
              <div class="om-account-toolbar-left">
                <label class="tdh-filter-field">
                  <span class="ou-toolbar-label">账号状态</span>
                  <select class="ou-toolbar-select" disabled><option selected>所有</option></select>
                </label>
                <input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled />
                <button type="button" class="ou-search-btn" disabled>搜索</button>
              </div>
              <div class="om-account-toolbar-right">
                <button type="button" class="link-btn" disabled>⚙ 批量操作 ▾</button>
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
                    <th class="col-group">用户组</th>
                    <th class="col-account">用户账号</th>
                    <th class="col-mac">在线MAC</th>
                    <th class="col-ip">在线IP</th>
                    <th class="col-date">开始日期</th>
                    <th class="col-date">截止日期</th>
                    <th class="col-iface">网络接口</th>
                    <th class="col-vlan">外出VLAN</th>
                    <th class="col-date">最后下线</th>
                    <th class="col-info">其他信息</th>
                    <th class="col-actions">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in proxyAccounts" :key="row.idx">
                    <td class="col-check"><input type="checkbox" disabled /></td>
                    <td class="col-idx">{{ row.idx }}</td>
                    <td class="col-group">{{ row.group }}</td>
                    <td class="col-account">{{ row.account }}</td>
                    <td class="col-mac">{{ row.mac }}</td>
                    <td class="col-ip">{{ row.ip }}</td>
                    <td class="col-date">{{ row.startDate }}</td>
                    <td class="col-date">{{ row.endDate }}</td>
                    <td class="col-iface">{{ row.iface }}</td>
                    <td class="col-vlan">{{ row.vlan }}</td>
                    <td class="col-date">{{ row.lastOffline }}</td>
                    <td class="col-info">{{ row.info }}</td>
                    <td class="col-actions"><button class="link-btn" disabled>编辑</button></td>
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
                <label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页 <button type="button" class="ou-page-goto-btn" disabled>确定</button></label>
                <span>共 0 条</span>
                <label class="ou-page-size"><select disabled><option selected>100 条/页</option></select></label>
              </div>
            </div>
          </div>

          <!-- IP/MAC备注 -->
          <div class="om-account-inner-panel" :class="{ active: activeInnerTab === 'remark' }">
            <div class="ou-table-wrap">
              <table class="ou-table">
                <thead>
                  <tr>
                    <th class="col-check"><input type="checkbox" disabled aria-label="全选" /></th>
                    <th class="col-idx">序号</th>
                    <th class="col-object">备注对象</th>
                    <th class="col-group">用户组</th>
                    <th class="col-remark">备注</th>
                    <th class="col-actions">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in remarks" :key="row.idx">
                    <td class="col-check"><input type="checkbox" disabled /></td>
                    <td class="col-idx">{{ row.idx }}</td>
                    <td class="col-object">{{ row.object }}</td>
                    <td class="col-group">{{ row.group }}</td>
                    <td class="col-remark">{{ row.remark }}</td>
                    <td class="col-actions"><button class="link-btn" disabled>编辑</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="ou-footer">
              <div class="ou-footer-right"><span>共 0 条</span></div>
            </div>
          </div>

          <!-- 在线用户 -->
          <div class="om-account-inner-panel" :class="{ active: activeInnerTab === 'online' }">
            <div class="ou-table-wrap">
              <table class="ou-table">
                <thead>
                  <tr>
                    <th class="col-idx">序号</th>
                    <th class="col-account">用户账号</th>
                    <th class="col-ip">在线IP</th>
                    <th class="col-mac">在线MAC</th>
                    <th class="col-time">上线时间</th>
                    <th class="col-actions">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in onlineUsers" :key="row.idx">
                    <td class="col-idx">{{ row.idx }}</td>
                    <td class="col-account">{{ row.account }}</td>
                    <td class="col-ip">{{ row.ip }}</td>
                    <td class="col-mac">{{ row.mac }}</td>
                    <td class="col-time">{{ row.time }}</td>
                    <td class="col-actions"><button class="link-btn" disabled>下线</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="ou-footer">
              <div class="ou-footer-right"><span>共 {{ onlineUsers.length }} 条</span></div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- 用户组 -->
    <div class="om-account-top-panel" :class="{ active: activeTopPanel === 'user-group' }">
      <div class="ou-toolbar">
        <input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled />
        <button type="button" class="ou-search-btn" disabled>搜索</button>
        <div class="om-account-toolbar-right">
          <button type="button" class="link-btn" disabled>🗑 清空</button>
          <button type="button" class="link-btn" disabled>+ 添加用户组</button>
        </div>
      </div>
      <div class="ou-table-wrap">
        <table class="ou-table">
          <thead>
            <tr>
              <th class="col-name">名称</th>
              <th class="col-ipv4">IPV4地址</th>
              <th class="col-ipv6">IPV6地址</th>
              <th class="col-rate">上行速率</th>
              <th class="col-rate">下行速率</th>
              <th class="col-dns">DNS</th>
              <th class="col-count">用户账号#</th>
              <th class="col-count">可分配IP#</th>
              <th class="col-time">在线时间</th>
              <th class="col-expired">过期用户</th>
              <th class="col-iface">代拨接口</th>
              <th class="col-vlan">代拨VLAN</th>
              <th class="col-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in userGroups" :key="row.name">
              <td class="col-name">{{ row.name }}</td>
              <td class="col-ipv4">{{ row.ipv4 }}</td>
              <td class="col-ipv6">{{ row.ipv6 }}</td>
              <td class="col-rate">{{ row.upRate }}</td>
              <td class="col-rate">{{ row.downRate }}</td>
              <td class="col-dns">{{ row.dns }}</td>
              <td class="col-count">{{ row.userCount }}</td>
              <td class="col-count">{{ row.ipCount }}</td>
              <td class="col-time">{{ row.onlineTime }}</td>
              <td class="col-expired">{{ row.expired }}</td>
              <td class="col-iface">{{ row.iface }}</td>
              <td class="col-vlan">{{ row.vlan }}</td>
              <td class="col-actions"><button class="link-btn" disabled>编辑</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import './nv-shared.css'

const activeTopPanel = ref('account')
const activeInnerTab = ref('local')

const topPanels = [
  { key: 'account', label: '账号管理' },
  { key: 'user-group', label: '用户组' },
]

const innerTabs = [
  { key: 'local', label: '本地账号' },
  { key: 'proxy', label: '代理账号' },
  { key: 'remark', label: 'IP/MAC备注' },
  { key: 'online', label: '在线用户' },
]

const localAccounts = [
  { idx: 1, group: '办公区', account: 'user001', name: '张三', mac: '54-2b-de-6d-10-ae', ip: '192.168.1.100', vlan: 10, onlineIp: '192.168.1.100', onlineUser: '在线', startDate: '2026-01-01', endDate: '2027-12-31', lastOffline: '—', info: '—' },
  { idx: 2, group: '办公区', account: 'user002', name: '李四', mac: '00-1b-21-a8-3c-4d', ip: '192.168.1.101', vlan: 10, onlineIp: '192.168.1.101', onlineUser: '在线', startDate: '2026-01-01', endDate: '2027-12-31', lastOffline: '—', info: '—' },
  { idx: 3, group: '生产区', account: 'prod001', name: '王五', mac: '00-25-90-0a-1b-2c', ip: '10.0.0.100', vlan: 20, onlineIp: '—', onlineUser: '离线', startDate: '2026-01-01', endDate: '2027-12-31', lastOffline: '2026-06-14 18:30:00', info: '—' },
]

const proxyAccounts = [
  { idx: 1, group: '访客区', account: 'guest001', mac: '00-e0-4c-36-0a-1b', ip: '192.168.100.100', startDate: '2026-06-15', endDate: '2026-06-16', iface: 'eth0', vlan: 100, lastOffline: '—', info: '—' },
  { idx: 2, group: '访客区', account: 'guest002', mac: '00-50-b6-2a-3b-4c', ip: '192.168.100.101', startDate: '2026-06-15', endDate: '2026-06-16', iface: 'eth0', vlan: 100, lastOffline: '—', info: '—' },
]

const remarks = [
  { idx: 1, object: '192.168.1.100', group: '办公区', remark: '总经理办公室' },
  { idx: 2, object: '192.168.1.101', group: '办公区', remark: '财务部门' },
  { idx: 3, object: '54-2b-de-6d-10-ae', group: '办公区', remark: '部门负责人' },
]

const onlineUsers = [
  { idx: 1, account: 'user001', ip: '192.168.1.100', mac: '54-2b-de-6d-10-ae', time: '2026-06-15 08:30:00' },
  { idx: 2, account: 'user002', ip: '192.168.1.101', mac: '00-1b-21-a8-3c-4d', time: '2026-06-15 09:15:00' },
  { idx: 3, account: 'guest001', ip: '192.168.100.100', mac: '00-e0-4c-36-0a-1b', time: '2026-06-15 10:00:00' },
]

const userGroups = [
  { name: '办公区', ipv4: '192.168.1.0/24', ipv6: '—', upRate: '100Mbps', downRate: '1000Mbps', dns: '114.114.114.114', userCount: 128, ipCount: 254, onlineTime: '7x24', expired: 0, iface: 'eth0', vlan: 10 },
  { name: '生产区', ipv4: '10.0.0.0/16', ipv6: '—', upRate: '1000Mbps', downRate: '1000Mbps', dns: '166.111.4.5', userCount: 42, ipCount: 65534, onlineTime: '7x24', expired: 0, iface: 'eth1', vlan: 20 },
  { name: '访客区', ipv4: '192.168.100.0/24', ipv6: '—', upRate: '50Mbps', downRate: '500Mbps', dns: '8.8.8.8', userCount: 8, ipCount: 254, onlineTime: '7x24', expired: 0, iface: 'eth0', vlan: 100 },
]
</script>

<style scoped>
.om-account-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 600px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
}

.om-account-top-panel {
  display: none;
  flex-direction: column;
  flex: 1;
}

.om-account-top-panel.active {
  display: flex;
}

.om-account-subpage {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.om-account-inner-tabs {
  padding: 0 16px;
  border-bottom: 1px solid #ebeef5;
  background: #fafafa;
}

.nv-tabs-nav-wrap {
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

.om-account-inner-panels {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.om-account-inner-panel {
  display: none;
  flex-direction: column;
  flex: 1;
}

.om-account-inner-panel.active {
  display: flex;
}

.om-account-toolbar-left,
.om-account-toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.om-account-toolbar-right {
  margin-left: auto;
}

.col-check { width: 42px; text-align: center; }
.col-idx { width: 60px; text-align: center; }
.col-group { min-width: 100px; }
.col-account { min-width: 120px; }
.col-name { min-width: 100px; }
.col-mac { min-width: 120px; }
.col-ip { min-width: 120px; }
.col-vlan { width: 80px; }
.col-online-ip { min-width: 120px; }
.col-online-user { min-width: 100px; }
.col-date { min-width: 120px; }
.col-info { min-width: 120px; }
.col-actions { width: 100px; text-align: center; }
.col-object { min-width: 120px; }
.col-remark { min-width: 150px; }
.col-time { min-width: 120px; }
.col-ipv4 { min-width: 120px; }
.col-ipv6 { min-width: 120px; }
.col-rate { min-width: 100px; text-align: right; }
.col-dns { min-width: 100px; }
.col-count { min-width: 80px; text-align: right; }
.col-expired { min-width: 80px; text-align: right; }
.col-iface { min-width: 100px; }
</style>
