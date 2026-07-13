<template>
  <div class="nvt-page">
    <div class="nvt-tabs-header">
      <div class="nvt-tabs-nav" role="tablist">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="nvt-tab"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- 参数设置 Panel -->
    <div v-show="activeTab === 'params'" class="nvt-card">
      <div class="nvt-card-body">
        <h3 class="om-section-title">参数设置</h3>
        <form class="ar-params-form" @submit.prevent>
          <label v-for="param in engineParams" :key="param.key" class="om-form-row">
            <span class="om-form-label">{{ param.label }}</span>
            <button
              type="button"
              class="ti-switch"
              :class="{ 'is-checked': param.value }"
              :aria-pressed="param.value"
              @click="param.value = !param.value"
            >
              <span class="ti-switch-core">
                <span class="ti-switch-inner">{{ param.value ? '开启' : '关闭' }}</span>
                <span class="ti-switch-action" aria-hidden="true"></span>
              </span>
            </button>
            <span v-if="param.hint" class="om-form-hint">{{ param.hint }}</span>
            <span v-if="param.info" class="om-th-info" :title="param.info">ⓘ</span>
          </label>
        </form>
      </div>
    </div>

    <!-- 合法IP列表 Panel -->
    <div v-show="activeTab === 'legal-ip'" class="nvt-card">
      <div class="nvt-card-body">
        <div class="ou-toolbar ar-toolbar">
          <input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled />
          <button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button>
          <div class="ar-toolbar-right">
            <button type="button" class="link-btn" disabled title="暂未开放">🗑 删除</button>
            <button type="button" class="link-btn" disabled title="暂未开放">+ 添加</button>
            <button type="button" class="link-btn" disabled title="暂未开放">☁ 导入</button>
            <button type="button" class="link-btn" disabled title="暂未开放">☁ 导出</button>
          </div>
        </div>
        <div class="ou-table-wrap ar-table-wrap">
          <table class="ou-table ar-legal-ip-table">
            <thead>
              <tr>
                <th class="col-check"><input type="checkbox" disabled aria-label="全选" /></th>
                <th class="col-idx">序号</th>
                <th class="col-ip">IP</th>
                <th class="col-remark">备注</th>
                <th class="col-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="legalIpList.length === 0">
                <td colspan="5" class="ou-empty">无数据</td>
              </tr>
              <tr v-for="(item, idx) in legalIpList" :key="idx">
                <td class="col-check"><input type="checkbox" disabled /></td>
                <td class="col-idx">{{ idx + 1 }}</td>
                <td class="col-ip">{{ item.ip }}</td>
                <td class="col-remark">{{ item.remark }}</td>
                <td class="col-actions">
                  <button type="button" class="link-btn" disabled title="暂未开放">✎</button>
                  <button type="button" class="link-btn" disabled title="暂未开放">🗑</button>
                </td>
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
            <span>共 {{ legalIpList.length }} 条</span>
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
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import './nv-test-shared.css'

const tabs = [
  { key: 'params', label: '参数设置' },
  { key: 'legal-ip', label: '合法IP列表' }
]

const activeTab = ref('params')

const engineParams = reactive([
  { key: 'ipv6', label: 'IPv6流量识别', value: true, hint: '', info: '' },
  { key: 'npm', label: 'NPM时延分析', value: true, hint: '', info: '' },
  { key: 'gre', label: 'GRE隧道分析', value: true, hint: '当有GRE线路时，开启此参数将会让线路无法工作', info: '' },
  { key: 'https', label: 'HTTPS协商分析', value: true, hint: '', info: '' },
  { key: 'quic', label: 'QUIC解密', value: true, hint: '', info: '' },
  { key: 'udp', label: 'UDP增强代理', value: false, hint: '', info: '' },
  { key: 'share-limit', label: '共享限速', value: false, hint: '', info: '共享限速' },
  { key: 'p2p', label: '智能P2P识别', value: false, hint: '当流量不完整或网络内P2P加密流量较多时，开启智能P2P识别引擎能提升识别率，但是会消耗更多资源', info: '' },
  { key: 'xunlei', label: '迅雷增强识别', value: true, hint: '开启迅雷增强识别引擎可以更好地识别迅雷的加密流量', info: '' },
  { key: 'www', label: 'WWW加强代理', value: false, hint: '单独分流WWW协议时，需要开启此选项', info: '' },
  { key: 'fake-ip', label: '伪IP防护功能', value: false, hint: '启用伪IP防护后，请填写"合法IP列表"，不在列表里的IP的流量识别成"内网IP伪装"', info: '' }
])

const legalIpList = ref([
  { ip: '192.168.1.0/24', remark: '内网段A' },
  { ip: '10.0.0.0/8', remark: '内网段B' },
  { ip: '172.16.0.0/12', remark: '内网段C' }
])
</script>

<style scoped>
.om-section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
}

.ar-params-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.om-form-row {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

.om-form-label {
  min-width: 140px;
  color: #606266;
  font-weight: 500;
}

.ti-switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 60px;
  height: 28px;
  padding: 0;
  border: 1px solid #dcdfe6;
  border-radius: 14px;
  background: #f0f2f5;
  cursor: pointer;
  transition: all 0.3s;
}

.ti-switch.is-checked {
  background: #409eff;
  border-color: #409eff;
}

.ti-switch-core {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  position: relative;
}

.ti-switch-inner {
  flex: 1;
  text-align: center;
  font-size: 12px;
  color: #fff;
  z-index: 1;
}

.ti-switch:not(.is-checked) .ti-switch-inner {
  color: #909399;
}

.ti-switch-action {
  position: absolute;
  left: 2px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #fff;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.ti-switch.is-checked .ti-switch-action {
  left: calc(100% - 26px);
}

.om-form-hint {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}

.om-th-info {
  color: #909399;
  cursor: help;
  font-size: 14px;
}

.ar-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.ou-toolbar-input {
  padding: 6px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
  min-width: 200px;
}

.ou-search-btn {
  padding: 6px 16px;
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.ar-toolbar-right {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.link-btn {
  padding: 6px 12px;
  background: transparent;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  color: #606266;
}

.ou-table-wrap {
  overflow-x: auto;
  margin-bottom: 16px;
}

.ou-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.ou-table th,
.ou-table td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid #ebeef5;
}

.ou-table th {
  background: #f5f7fa;
  font-weight: 600;
  color: #606266;
}

.ou-table tbody tr:hover {
  background: #f5f7fa;
}

.col-check {
  width: 40px;
}

.col-idx {
  width: 60px;
}

.col-ip {
  width: 200px;
}

.col-remark {
  width: 200px;
}

.col-actions {
  width: 120px;
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
  padding: 12px 0;
  border-top: 1px solid #ebeef5;
}

.ou-footer-left {
  display: flex;
  align-items: center;
}

.ou-footer-right {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
  color: #606266;
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
  cursor: pointer;
  font-size: 13px;
}

.ou-page-goto {
  display: flex;
  align-items: center;
  gap: 4px;
}

.ou-page-goto-input {
  width: 50px;
  padding: 4px 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  text-align: center;
}

.ou-page-goto-btn {
  padding: 4px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
}

.ou-page-size select {
  padding: 4px 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}
</style>
