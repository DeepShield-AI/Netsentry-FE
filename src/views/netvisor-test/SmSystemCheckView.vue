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
        <!-- 基础检测面板 -->
        <div v-show="activeTab === 'basic'">
          <div class="sm-check-intro">
            <span>集中检查系统硬件和软件信息</span>
            <button type="button" class="primary" disabled title="暂未开放">开始检测</button>
          </div>
          <div class="sm-check-result" aria-live="polite"></div>
        </div>

        <!-- Ping 检测面板 -->
        <div v-show="activeTab === 'ping'">
          <div class="ou-toolbar sm-toolbar">
            <label class="tdh-filter-field dba-refresh-field">
              <span class="ou-toolbar-label">自动刷新</span>
              <select class="ou-toolbar-select" disabled>
                <option selected>5 秒</option>
              </select>
            </label>
            <input class="ou-toolbar-input" type="search" placeholder="备注名称搜索" disabled />
            <button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button>
            <span class="sm-ping-status">状态：未启动</span>
            <div class="sm-toolbar-right">
              <button type="button" class="link-btn" disabled title="暂未开放">⚙ 设置</button>
              <button type="button" class="link-btn" disabled title="暂未开放">+ 添加</button>
              <button type="button" class="link-btn" disabled title="暂未开放">☁ 导入</button>
              <button type="button" class="link-btn" disabled title="暂未开放">🗑 删除</button>
              <button type="button" class="link-btn" disabled title="暂未开放">🧹 清空</button>
              <button type="button" class="link-btn" disabled title="暂未开放">📄 告警日志</button>
              <span class="sm-view-toggle" role="group">
                <button type="button" class="sm-view-btn active" disabled>列表</button>
                <button type="button" class="sm-view-btn" disabled>卡片</button>
              </span>
            </div>
          </div>

          <div class="nvt-table-wrap">
            <table class="ou-table sm-ping-table">
              <thead>
                <tr>
                  <th class="col-check">
                    <input type="checkbox" disabled aria-label="全选" />
                  </th>
                  <th class="col-idx">序号</th>
                  <th>Ping 对象</th>
                  <th>Ping 接口</th>
                  <th>下一跳</th>
                  <th>告警</th>
                  <th>对象备注</th>
                  <th class="ou-th-sort">当前时延</th>
                  <th class="ou-th-sort">平均时延</th>
                  <th class="ou-th-sort">最大时延</th>
                  <th class="ou-th-sort">最小时延</th>
                  <th class="ou-th-sort">丢包次数</th>
                  <th class="ou-th-sort">丢包率</th>
                  <th class="col-actions">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in pingData" :key="item.idx">
                  <td class="col-check">
                    <input type="checkbox" disabled />
                  </td>
                  <td class="col-idx">{{ item.idx }}</td>
                  <td>{{ item.target }}</td>
                  <td>{{ item.iface }}</td>
                  <td>{{ item.nextHop }}</td>
                  <td>{{ item.alarm }}</td>
                  <td>{{ item.remark }}</td>
                  <td class="ou-num">{{ item.curLatency }}</td>
                  <td class="ou-num">{{ item.avgLatency }}</td>
                  <td class="ou-num">{{ item.maxLatency }}</td>
                  <td class="ou-num">{{ item.minLatency }}</td>
                  <td class="ou-num">{{ item.lossCount }}</td>
                  <td class="ou-num">{{ item.lossRate }}</td>
                  <td class="col-actions">
                    <button type="button" class="link-btn" disabled title="暂未开放">✎</button>
                  </td>
                </tr>
                <tr v-if="pingData.length === 0">
                  <td colspan="14" class="ou-empty">数据加载中</td>
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

const tabs = [
  { key: 'basic', label: '基础检测' },
  { key: 'ping', label: 'Ping 检测' }
]
const activeTab = ref('basic')

const pingData = ref([
  { idx: 1, target: '192.168.1.254', iface: 'eth0', nextHop: '—', alarm: '正常', remark: '网关', curLatency: '28ms', avgLatency: '25ms', maxLatency: '35ms', minLatency: '20ms', lossCount: '0', lossRate: '0%' },
  { idx: 2, target: '10.0.0.254', iface: 'eth1', nextHop: '—', alarm: '正常', remark: '生产网关', curLatency: '18ms', avgLatency: '15ms', maxLatency: '22ms', minLatency: '12ms', lossCount: '0', lossRate: '0%' },
  { idx: 3, target: '8.8.8.8', iface: 'eth0', nextHop: '192.168.1.254', alarm: '告警', remark: 'DNS服务器', curLatency: '128ms', avgLatency: '115ms', maxLatency: '156ms', minLatency: '98ms', lossCount: '3', lossRate: '0.5%' },
  { idx: 4, target: '114.114.114.114', iface: 'eth0', nextHop: '192.168.1.254', alarm: '正常', remark: '备用DNS', curLatency: '45ms', avgLatency: '42ms', maxLatency: '58ms', minLatency: '35ms', lossCount: '0', lossRate: '0%' },
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

.ou-toolbar-select {
  padding: 6px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
  background: #fff;
}

.ou-search-btn {
  padding: 6px 16px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
  background: #fff;
  cursor: not-allowed;
}

.sm-ping-status {
  font-size: 13px;
  color: #909399;
  padding: 0 8px;
}

.sm-toolbar-right {
  margin-left: auto;
  display: flex;
  gap: 12px;
  align-items: center;
}

.sm-view-toggle {
  display: inline-flex;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.sm-view-btn {
  padding: 4px 12px;
  border: none;
  background: #fff;
  font-size: 13px;
  cursor: not-allowed;
  color: #606266;
}

.sm-view-btn.active {
  background: #409eff;
  color: #fff;
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

.col-check {
  width: 40px;
  text-align: center;
}

.col-idx {
  width: 60px;
  text-align: center;
}

.col-actions {
  width: 80px;
  text-align: center;
}

.ou-num {
  text-align: right;
  font-variant-numeric: tabular-nums;
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

.sm-check-intro {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 16px;
}

.sm-check-intro span {
  font-size: 14px;
  color: #606266;
}

button.primary {
  padding: 8px 20px;
  border-radius: 4px;
  font-size: 13px;
  cursor: not-allowed;
  background: #409eff;
  color: #fff;
  border: 1px solid #409eff;
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

.ou-th-sort {
  cursor: pointer;
}

.ou-th-sort::after {
  content: ' ↕';
  font-size: 10px;
  color: #c0c4cc;
}
</style>
