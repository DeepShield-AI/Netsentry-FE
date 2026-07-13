<template>
  <div class="nvt-page">
    <div class="nvt-card">
      <div class="nvt-card-header">
        <span>SNMP 服务</span>
      </div>
      <div class="nvt-card-body">
        <section class="sm-form-section">
          <div class="sm-form-section-head">常用 OID</div>
          <ul class="sm-oid-list">
            <li v-for="oid in oids" :key="oid.label">
              <span class="sm-oid-label">{{ oid.label }}</span>
              <span class="sm-oid-val">{{ oid.value }}</span>
            </li>
          </ul>
          <button type="button" class="link-btn" disabled title="暂未开放">More</button>
        </section>

        <section class="sm-form-section">
          <div class="sm-form-section-head">参数设置</div>
          <form class="sm-form" @submit.prevent>
            <label class="om-form-row">
              <span class="om-form-label">SNMP 服务</span>
              <button type="button" class="ti-switch" disabled aria-pressed="false">
                <span class="ti-switch-core">
                  <span class="ti-switch-inner">关闭</span>
                  <span class="ti-switch-action" aria-hidden="true"></span>
                </span>
              </button>
            </label>
            <label class="om-form-row">
              <span class="om-form-label">支持版本</span>
              <select class="ou-toolbar-select" disabled>
                <option selected>同时支持 v1/v2c/v3 版本</option>
              </select>
            </label>
            <label class="om-form-row">
              <span class="om-form-label">SNMP 端口</span>
              <input class="ou-toolbar-input sm-form-input sm-form-input-sm" type="text" value="161" disabled />
            </label>
            <label class="om-form-row">
              <span class="om-form-label">服务白名单</span>
              <input class="ou-toolbar-input sm-form-input sm-form-input-lg" type="text" value="" disabled />
              <span class="om-form-hint">格式：x.x.x.x 或 x.x.x.x/y，多个 IP 用逗号分隔；为空表示任意 IP 都可以来获取数据</span>
            </label>
            <label class="om-form-row">
              <span class="om-form-label">服务团体名</span>
              <input class="ou-toolbar-input sm-form-input" type="text" value="panabit" disabled />
            </label>
            <label class="om-form-row">
              <span class="om-form-label">用户名</span>
              <input class="ou-toolbar-input sm-form-input" type="text" value="" disabled />
            </label>
            <label class="om-form-row">
              <span class="om-form-label">认证模式</span>
              <select class="ou-toolbar-select" disabled>
                <option selected>MD5</option>
              </select>
            </label>
            <label class="om-form-row">
              <span class="om-form-label">认证密码</span>
              <input class="ou-toolbar-input sm-form-input" type="password" value="" disabled />
            </label>
            <label class="om-form-row">
              <span class="om-form-label">加密模式</span>
              <select class="ou-toolbar-select" disabled>
                <option selected>AES</option>
              </select>
            </label>
            <label class="om-form-row">
              <span class="om-form-label">加密密码</span>
              <input class="ou-toolbar-input sm-form-input" type="password" value="" disabled />
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

const oids = ref([
  { label: '系统信息', value: '1.3.6.1.2.1.1' },
  { label: '网络接口', value: '1.3.6.1.2.1.2' },
  { label: '内存及磁盘', value: '1.3.6.1.2.1.25' },
  { label: 'CPU', value: '.1.3.6.1.4.1.2021.11' }
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

.sm-oid-list {
  list-style: none;
  padding: 0;
  margin: 0 0 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sm-oid-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 13px;
}

.sm-oid-label {
  color: #606266;
  min-width: 100px;
}

.sm-oid-val {
  color: #303133;
  font-family: 'Courier New', monospace;
  font-weight: 500;
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
  width: 140px;
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

.sm-form-input {
  flex: 1;
  max-width: 300px;
}

.sm-form-input-sm {
  max-width: 120px;
}

.sm-form-input-lg {
  max-width: 400px;
}

.ou-toolbar-select {
  padding: 6px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
  background: #fff;
}

.om-form-hint {
  font-size: 12px;
  color: #909399;
  margin-left: 4px;
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
