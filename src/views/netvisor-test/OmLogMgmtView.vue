<template>
  <div class="om-omlg-page">
    <div class="om-omlg-panel" :class="{ active: activePanel === 'blacklist' }">
      <div class="om-omlg-form-card">
        <div class="om-omlg-alert">黑名单中的IP，除了流量日志，其它日志都不记录</div>
        <form class="om-omlg-form" onsubmit="return false">
          <div class="om-form-row">
            <span class="om-form-label">日志黑名单</span>
            <select class="ou-toolbar-select" disabled>
              <option selected>不设置</option>
            </select>
          </div>
          <button type="button" class="primary" disabled title="暂未开放">提交</button>
        </form>
      </div>
    </div>
    <div class="om-omlg-panel" :class="{ active: activePanel === 'whitelist' }">
      <div class="om-omlg-form-card">
        <form class="om-omlg-form" onsubmit="return false">
          <div class="om-form-row">
            <span class="om-form-label">IP群组</span>
            <select class="ou-toolbar-select" disabled>
              <option selected>任意</option>
            </select>
          </div>
          <div class="om-form-row">
            <span class="om-form-label">应用协议</span>
            <input class="ou-toolbar-input" type="text" value="任意协议" disabled />
          </div>
          <button type="button" class="primary" disabled title="暂未开放">提交</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import './nv-shared.css'

const activePanel = ref('blacklist')
</script>

<style scoped>
.om-omlg-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 600px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
}

.om-omlg-panel {
  display: none;
  flex-direction: column;
  flex: 1;
}

.om-omlg-panel.active {
  display: flex;
}

.om-omlg-form-card {
  padding: 24px;
}

.om-omlg-alert {
  padding: 12px 16px;
  background: #fef0f0;
  border: 1px solid #fde2e2;
  border-radius: 4px;
  color: #f56c6c;
  font-size: 13px;
  margin-bottom: 16px;
}

.om-omlg-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.om-form-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.om-form-label {
  min-width: 120px;
  font-size: 13px;
  color: #606266;
}

.primary {
  height: 32px;
  padding: 0 20px;
  border: 1px solid #409eff;
  border-radius: 4px;
  background: #409eff;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.primary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
</style>
