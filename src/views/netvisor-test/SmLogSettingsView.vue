<template>
  <div class="nvt-page">
    <div class="nvt-card">
      <div class="nvt-card-header">
        <span>日志设置</span>
      </div>
      <div class="nvt-card-body">
        <section class="sm-form-section">
          <div class="sm-form-section-head">日志设置</div>
          <div class="nvt-table-wrap">
            <table class="ou-table sm-log-settings-table">
              <thead>
                <tr>
                  <th class="col-idx">端口</th>
                  <th>日志类型</th>
                  <th>IP</th>
                  <th>端口</th>
                  <th>发送成功数</th>
                  <th>发送失败数</th>
                  <th class="col-actions">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in logSettings" :key="item.idx">
                  <td class="col-idx">{{ item.idx }}</td>
                  <td>{{ item.type }}</td>
                  <td>{{ item.ip }}</td>
                  <td class="ou-num">{{ item.port }}</td>
                  <td class="ou-num">{{ item.successCount }}</td>
                  <td class="ou-num">{{ item.failCount }}</td>
                  <td class="col-actions">
                    <button type="button" class="link-btn" disabled title="暂未开放">编辑</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="sm-form-section">
          <div class="sm-form-section-head">设备编号</div>
          <form class="sm-form" @submit.prevent>
            <label class="om-form-row">
              <span class="om-form-label">兼容编号</span>
              <span class="sm-form-inline">
                <input class="ou-toolbar-input sm-form-input sm-form-input-sm" type="text" value="0" disabled />
                <span class="om-form-hint">0 ~ 65535</span>
              </span>
            </label>
            <button type="button" class="primary" disabled title="暂未开放">提交</button>
          </form>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import './nv-test-shared.css'

const logSettings = ref([
  {
    idx: 1,
    type: '跨境日志',
    ip: '0.0.0.0',
    port: 0,
    successCount: 0,
    failCount: 0
  },
  {
    idx: 2,
    type: '被动域名',
    ip: '0.0.0.0',
    port: 0,
    successCount: 0,
    failCount: 0
  },
  {
    idx: 3,
    type: '会话日志',
    ip: '0.0.0.0',
    port: 0,
    successCount: 48764683564,
    failCount: 0
  },
  {
    idx: 4,
    type: 'DNS 隧道',
    ip: '0.0.0.0',
    port: 0,
    successCount: 0,
    failCount: 0
  },
  {
    idx: 5,
    type: '流量日志',
    ip: '127.0.0.1',
    port: 8000,
    successCount: 918544652,
    failCount: 0
  }
])
</script>

<style scoped>
.sm-form-section {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.sm-form-section:last-child {
  border-bottom: none;
}

.sm-form-section-head {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-left: 8px;
  border-left: 3px solid #409eff;
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
  width: 80px;
  text-align: center;
}

.ou-num {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.sm-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.om-form-row {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
}

.om-form-label {
  flex-shrink: 0;
  width: 100px;
  text-align: right;
  color: #606266;
}

.sm-form-inline {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.ou-toolbar-input {
  padding: 6px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
}

.sm-form-input-sm {
  max-width: 120px;
}

.om-form-hint {
  font-size: 12px;
  color: #909399;
  margin-left: 4px;
}

button.primary {
  align-self: flex-end;
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
</style>
