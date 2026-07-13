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
        <!-- 操作日志面板 -->
        <div v-show="activeTab === 'operation'">
          <div class="ou-toolbar sm-toolbar">
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">日期</span>
              <input class="ou-toolbar-input sm-note-input" type="text" value="2026.06.17 - 2026.06.18" disabled />
            </label>
            <input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled />
            <button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button>
            <div class="sm-toolbar-right">
              <button type="button" class="link-btn" disabled title="暂未开放">📄 历史日志</button>
              <button type="button" class="link-btn" disabled title="暂未开放">☁ 导出</button>
            </div>
          </div>

          <div class="nvt-table-wrap">
            <table class="ou-table sm-syslog-table">
              <thead>
                <tr>
                  <th class="col-idx">序号</th>
                  <th class="ou-th-sort">用户</th>
                  <th class="ou-th-sort">登录地址</th>
                  <th class="ou-th-sort">操作时间</th>
                  <th>操作</th>
                  <th>参数</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="log in operationLogs" :key="log.idx">
                  <td class="col-idx">{{ log.idx }}</td>
                  <td>{{ log.user }}</td>
                  <td>{{ log.ip }}</td>
                  <td>{{ log.time }}</td>
                  <td>{{ log.action }}</td>
                  <td>{{ log.param }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="ou-footer ou-footer-td om-footer">
            <div class="ou-footer-left">
              <div class="ou-pager ou-pager-static">
                <button type="button" class="ou-page-btn" disabled aria-label="上一页">‹</button>
                <button type="button" class="ou-page-btn active" disabled>1</button>
                <button type="button" class="ou-page-btn" disabled aria-label="下一页">›</button>
              </div>
            </div>
            <div class="ou-footer-right">
              <label class="ou-page-goto">
                到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页
                <button type="button" class="ou-page-goto-btn" disabled>确定</button>
              </label>
              <span>共 26 条</span>
              <label class="ou-page-size">
                <select disabled>
                  <option selected>500 条/页</option>
                </select>
              </label>
            </div>
          </div>
        </div>

        <!-- 告警日志面板 -->
        <div v-show="activeTab === 'alarm'">
          <div class="ou-toolbar sm-toolbar">
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">日期</span>
              <input class="ou-toolbar-input sm-note-input" type="text" value="2026.06.12 - 2026.06.18" disabled />
            </label>
            <input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled />
            <button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button>
            <div class="sm-toolbar-right">
              <button type="button" class="link-btn" disabled title="暂未开放">⚙ 参数设置</button>
              <button type="button" class="link-btn" disabled title="暂未开放">📄 历史日志</button>
              <button type="button" class="link-btn" disabled title="暂未开放">☁ 导出</button>
            </div>
          </div>

          <div class="nvt-table-wrap">
            <table class="ou-table sm-alarm-log-table">
              <thead>
                <tr>
                  <th class="col-idx">序号</th>
                  <th class="ou-th-sort">用户</th>
                  <th class="ou-th-sort">登录地址</th>
                  <th class="ou-th-sort">操作时间</th>
                  <th>操作</th>
                  <th>结果</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="alarmLogs.length === 0">
                  <td colspan="6" class="ou-empty">无数据</td>
                </tr>
                <tr v-for="log in alarmLogs" :key="log.idx">
                  <td class="col-idx">{{ log.idx }}</td>
                  <td>{{ log.user }}</td>
                  <td>{{ log.ip }}</td>
                  <td>{{ log.time }}</td>
                  <td>{{ log.action }}</td>
                  <td>{{ log.result }}</td>
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
                  <option selected>500 条/页</option>
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

const tabs = [
  { key: 'operation', label: '操作日志' },
  { key: 'alarm', label: '告警日志' }
]
const activeTab = ref('operation')

const operationLogs = ref([
  {
    idx: 1,
    user: 'test',
    ip: '192.168.2.205',
    time: '2026.06.18/00:41:36',
    action: '用户登录系统',
    param: '—'
  },
  {
    idx: 2,
    user: '_system_',
    ip: '127.0.0.1',
    time: '2026.06.18/00:35:25',
    action: 'NTP 同步',
    param: 'server=166.111.4.19'
  }
])

const alarmLogs = ref([
  { idx: 1, user: '_system_', ip: '127.0.0.1', time: '2026.06.18/00:41:36', action: '存储池容量告警', result: 'ntmlog 已用 89%' },
  { idx: 2, user: '_system_', ip: '127.0.0.1', time: '2026.06.18/00:30:00', action: '网卡状态告警', result: 'swgrp1 连接断开' },
  { idx: 3, user: '_system_', ip: '127.0.0.1', time: '2026.06.18/00:15:00', action: 'DNS牵引失败', result: '目标IP不可达' },
])
</script>

<style scoped>
.ou-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  flex-wrap: wrap;
}

.ou-toolbar-label {
  font-size: 13px;
  color: #606266;
  margin-right: 4px;
}

.ou-toolbar-input {
  padding: 6px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
}

.sm-note-input {
  width: 200px;
}

.ou-search-btn {
  padding: 6px 16px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
  background: #fff;
  cursor: not-allowed;
}

.sm-toolbar-right {
  margin-left: auto;
  display: flex;
  gap: 12px;
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

.ou-page-btn.active {
  background: #409eff;
  color: #fff;
  border-color: #409eff;
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

.ou-th-sort {
  cursor: pointer;
}

.ou-th-sort::after {
  content: ' ↕';
  font-size: 10px;
  color: #c0c4cc;
}
</style>
