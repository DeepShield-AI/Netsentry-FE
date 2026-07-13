<template>
  <div class="nvt-page">
    <div class="nvt-card">
      <div class="nvt-card-header">
        <div class="nv-tabs-nav" role="tablist">
          <button
            v-for="tab in mainTabs"
            :key="tab.key"
            type="button"
            class="nvt-tab"
            :class="{ active: activeMainTab === tab.key }"
            @click="activeMainTab = tab.key"
          >{{ tab.label }}</button>
        </div>
      </div>
      <div class="nvt-card-body">
        <!-- 升级面板 -->
        <div v-show="activeMainTab === 'upgrade'">
          <div class="sm-upgrade-info">
            <dl class="sm-info-list">
              <div v-for="item in systemInfo" :key="item.label">
                <dt>{{ item.label }}</dt>
                <dd>{{ item.value }}</dd>
              </div>
            </dl>
            <div class="sm-upgrade-actions">
              <button type="button" class="secondary" disabled title="暂未开放">☁ 升级系统</button>
              <button type="button" class="secondary" disabled title="暂未开放">☁ 升级特征库</button>
            </div>
          </div>

          <div class="sm-lic-tabs" role="tablist" aria-label="授权">
            <button
              v-for="tab in licTabs"
              :key="tab.key"
              type="button"
              class="sm-lic-tab"
              :class="{ active: activeLicTab === tab.key }"
              @click="activeLicTab = tab.key"
            >{{ tab.label }}</button>
          </div>

          <div v-show="activeLicTab === 'system'" class="sm-lic-panel active">
            <dl class="sm-info-list sm-lic-info">
              <div v-for="item in licInfo" :key="item.label">
                <dt>{{ item.label }}</dt>
                <dd :class="{ 'sm-lic-highlight': item.highlight }">{{ item.value }}</dd>
              </div>
            </dl>
            <div class="sm-upgrade-actions">
              <button type="button" class="secondary" disabled title="暂未开放">☁ 导入授权</button>
              <button type="button" class="secondary" disabled title="暂未开放">☁ 导出授权</button>
            </div>
          </div>

          <div v-show="activeLicTab === 'module'" class="sm-lic-panel">
            <div class="nvt-table-wrap">
              <table class="ou-table sm-module-lic-table">
                <thead>
                  <tr>
                    <th class="col-idx">序号</th>
                    <th>模块名称</th>
                    <th>授权状态</th>
                    <th>到期时间</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="moduleLic.length === 0">
                    <td colspan="4" class="ou-empty">无数据</td>
                  </tr>
                  <tr v-for="item in moduleLic" :key="item.idx">
                    <td class="col-idx">{{ item.idx }}</td>
                    <td>{{ item.name }}</td>
                    <td>{{ item.status }}</td>
                    <td>{{ item.expireTime }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 升级检查面板 -->
        <div v-show="activeMainTab === 'check'">
          <div class="sm-info-alert">
            升级检查功能用于检查当前系统、特征库、APP 是否可以更新；升级检查功能需要连接互联网，请确保管理口的网络可以正常访问。自动检查到新版本后，通过
            <button type="button" class="link-btn" disabled title="暂未开放">系统通知</button> 功能发送通知
          </div>

          <div class="nvt-table-wrap">
            <table class="ou-table sm-update-check-table">
              <thead>
                <tr>
                  <th class="col-idx">序号</th>
                  <th>检查类型</th>
                  <th>自动检查</th>
                  <th>自动升级</th>
                  <th>新版本通知</th>
                  <th>检查时间</th>
                  <th>检查结果</th>
                  <th>更新说明</th>
                  <th class="col-actions">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in checkData" :key="item.idx">
                  <td class="col-idx">{{ item.idx }}</td>
                  <td>{{ item.type }}</td>
                  <td>
                    <button type="button" class="ti-switch" disabled :aria-pressed="item.autoCheck">
                      <span class="ti-switch-core">
                        <span class="ti-switch-inner">{{ item.autoCheck ? '启用' : '禁用' }}</span>
                        <span class="ti-switch-action" aria-hidden="true"></span>
                      </span>
                    </button>
                  </td>
                  <td>{{ item.autoUpgrade }}</td>
                  <td>
                    <button type="button" class="ti-switch" disabled :aria-pressed="item.notify">
                      <span class="ti-switch-core">
                        <span class="ti-switch-inner">{{ item.notify ? '启用' : '禁用' }}</span>
                        <span class="ti-switch-action" aria-hidden="true"></span>
                      </span>
                    </button>
                  </td>
                  <td>{{ item.checkTime }}</td>
                  <td>{{ item.result }}</td>
                  <td>{{ item.note }}</td>
                  <td class="col-actions">
                    <button type="button" class="link-btn" disabled title="暂未开放">立即检查</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 升级日志面板 -->
        <div v-show="activeMainTab === 'log'">
          <div class="nvt-table-wrap">
            <table class="ou-table sm-upgrade-log-table">
              <thead>
                <tr>
                  <th class="col-idx">序号</th>
                  <th>用户</th>
                  <th>登录地址</th>
                  <th>升级时间</th>
                  <th>升级详情</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="upgradeLogs.length === 0">
                  <td colspan="5" class="ou-empty">无数据</td>
                </tr>
                <tr v-for="log in upgradeLogs" :key="log.idx">
                  <td class="col-idx">{{ log.idx }}</td>
                  <td>{{ log.user }}</td>
                  <td>{{ log.ip }}</td>
                  <td>{{ log.time }}</td>
                  <td>{{ log.detail }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="ou-footer ou-footer-td om-footer">
            <div class="ou-footer-left">
              <div class="ou-pager ou-pager-static">
                <button type="button" class="ou-page-btn" disabled aria-label="上一页">‹</button>
                <button type="button" class="ou-page-btn" disabled aria-label="下一页">›</button>
              </div>
            </div>
            <div class="ou-footer-right">
              <label class="ou-page-goto">
                到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页
                <button type="button" class="ou-page-goto-btn" disabled>确定</button>
              </label>
              <span>共 0 条</span>
              <label class="ou-page-size">
                <select disabled>
                  <option selected>100 条/页</option>
                </select>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import './nv-test-shared.css'

const mainTabs = [
  { key: 'upgrade', label: '系统升级' },
  { key: 'check', label: '升级检查' },
  { key: 'log', label: '升级日志' }
]
const activeMainTab = ref('upgrade')

const licTabs = [
  { key: 'system', label: '系统授权' },
  { key: 'module', label: '模块授权' }
]
const activeLicTab = ref('system')

const systemInfo = ref([
  { label: 'CPU 架构', value: 'x86' },
  { label: '操作系统', value: 'Linux 5.4' },
  { label: '软件版本', value: 'TANG(唐)r7p8, Build date 2026-05-19 05:03:41' },
  { label: 'DPI 特征库', value: '20260403.150344' }
])

const licInfo = ref([
  { label: '授权编号', value: 'PZGJ619-05CO', highlight: false },
  { label: '使用许可时间', value: '可永久使用授权', highlight: true },
  { label: '升级许可时间', value: '2025-11-01 00:00:00 -> 2030-12-05 00:00:00', highlight: false },
  { label: '当前系统时间', value: '2026-06-18 00:48:10', highlight: false },
  { label: '许可信息', value: '带宽：10000Mb/s, 存储：192TB', highlight: false },
  { label: '系统编号', value: '16593dd8e4f2a1b0c9d7e6f5a4b3c2d1', highlight: false }
])

const moduleLic = ref([
  { idx: 1, name: '威胁情报', status: '已授权', expireTime: '2030-12-05' },
  { idx: 2, name: '敏感应用识别', status: '已授权', expireTime: '2030-12-05' },
  { idx: 3, name: '跨境监测', status: '已授权', expireTime: '2030-12-05' },
  { idx: 4, name: 'DNS隧道检测', status: '已授权', expireTime: '2030-12-05' },
])

const checkData = ref([
  {
    idx: 1,
    type: '系统版本',
    autoCheck: false,
    autoUpgrade: '—',
    notify: false,
    checkTime: '—',
    result: '—',
    note: '—'
  },
  {
    idx: 2,
    type: '特征库',
    autoCheck: false,
    autoUpgrade: false,
    notify: false,
    checkTime: '—',
    result: '—',
    note: '—'
  },
  {
    idx: 3,
    type: 'App',
    autoCheck: false,
    autoUpgrade: false,
    notify: false,
    checkTime: '—',
    result: '—',
    note: '—'
  }
])

const upgradeLogs = ref([
  { idx: 1, user: 'admin', ip: '192.168.1.100', time: '2026-06-15 10:30:00', detail: '系统升级至 TANG(唐)r7p8' },
  { idx: 2, user: 'admin', ip: '192.168.1.100', time: '2026-06-10 14:20:00', detail: '特征库更新至 20260403.150344' },
  { idx: 3, user: 'admin', ip: '192.168.1.101', time: '2026-06-01 09:15:00', detail: '系统升级至 TANG(唐)r7p7' },
])
</script>

<style scoped>
.sm-upgrade-info {
  padding: 16px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 20px;
}

.sm-info-list {
  margin: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 24px;
}

.sm-info-list > div {
  display: flex;
  gap: 12px;
  font-size: 13px;
}

.sm-info-list dt {
  color: #909399;
  min-width: 100px;
  font-weight: 500;
}

.sm-info-list dd {
  color: #303133;
  margin: 0;
  flex: 1;
}

.sm-lic-highlight {
  color: #67c23a !important;
  font-weight: 600;
}

.sm-upgrade-actions {
  margin-top: 16px;
  display: flex;
  gap: 12px;
}

.sm-lic-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.sm-lic-tab {
  padding: 10px 20px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}

.sm-lic-tab.active {
  color: #409eff;
  border-bottom-color: #409eff;
}

.sm-lic-panel {
  padding: 16px;
  background: #f5f7fa;
  border-radius: 4px;
}

.sm-lic-info {
  margin-bottom: 16px;
}

.sm-info-alert {
  padding: 12px 16px;
  background: #ecf5ff;
  border: 1px solid #d9ecff;
  border-radius: 4px;
  font-size: 13px;
  color: #606266;
  margin-bottom: 16px;
  line-height: 1.6;
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

.col-idx {
  width: 60px;
  text-align: center;
}

.col-actions {
  width: 100px;
  text-align: center;
}

.ou-empty {
  text-align: center;
  padding: 40px 0;
  color: #909399;
}

.ou-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  margin-top: 16px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 13px;
}

.ou-pager {
  display: flex;
  gap: 4px;
}

.ou-page-btn {
  padding: 4px 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  cursor: not-allowed;
  font-size: 13px;
}

.ou-page-goto {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-right: 12px;
}

.ou-page-goto-input {
  width: 50px;
  padding: 4px 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
  text-align: center;
}

.ou-page-goto-btn {
  padding: 4px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  cursor: not-allowed;
  font-size: 13px;
}

.ou-page-size {
  margin-left: 12px;
}

.ou-page-size select {
  padding: 4px 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
}

.ti-switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: 0;
  border: none;
  background: none;
  cursor: not-allowed;
}

.ti-switch-core {
  position: relative;
  width: 48px;
  height: 24px;
  background: #dcdfe6;
  border-radius: 12px;
  transition: background 0.2s;
}

.ti-switch-inner {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 11px;
  color: #fff;
}

.ti-switch-action {
  position: absolute;
  left: 2px;
  top: 2px;
  width: 20px;
  height: 20px;
  background: #fff;
  border-radius: 50%;
  transition: left 0.2s;
}

button.secondary {
  padding: 8px 20px;
  border-radius: 4px;
  font-size: 13px;
  cursor: not-allowed;
  background: #fff;
  color: #606266;
  border: 1px solid #dcdfe6;
  opacity: 0.6;
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
</style>
