<template>
  <div class="om-omgeo-page">
    <div class="om-omgeo-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        class="om-omgeo-tab"
        :class="{ active: activePanel === tab.key }"
        @click="activePanel = tab.key"
      >{{ tab.label }}</button>
    </div>
    <div class="om-omgeo-panel" :class="{ active: activePanel === 'system' }">
      <div class="om-omgeo-system">
        <div class="ou-toolbar">
          <input class="ou-toolbar-input" type="search" placeholder="输入IP地址查询地理位置" disabled />
          <button type="button" class="ou-search-btn" disabled>搜索</button>
        </div>
        <p class="om-omgeo-hint"><span class="om-omgeo-hint-label">说明</span> 导入地址库后，可在会话信息中查看目标IP的地理位置</p>
        <div class="om-omgeo-upload">
          <label class="om-form-row"><span class="om-form-label">当前版本库文件:</span><span class="om-omgeo-version">—</span></label>
          <label class="om-form-row"><span class="om-form-label">选择文件</span><button type="button" class="link-btn" disabled>☁ 上传</button><button type="button" class="primary" disabled>升级</button></label>
        </div>
      </div>
    </div>
    <div class="om-omgeo-panel" :class="{ active: activePanel === 'custom' }">
      <div class="ou-toolbar">
        <input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled />
        <button type="button" class="ou-search-btn" disabled>搜索</button>
        <div class="om-omgeo-toolbar-right">
          <button type="button" class="link-btn" disabled>🗑 删除</button>
          <button type="button" class="link-btn" disabled>✎ 编辑</button>
          <button type="button" class="link-btn" disabled>+ 添加</button>
          <button type="button" class="link-btn" disabled>☁ 导入</button>
          <button type="button" class="link-btn" disabled>☁ 导出</button>
        </div>
      </div>
      <div class="ou-table-wrap">
        <table class="ou-table">
          <thead>
            <tr>
              <th class="col-check"><input type="checkbox" disabled aria-label="全选" /></th>
              <th class="col-idx">序号</th>
              <th class="col-ip">IP</th>
              <th class="col-loc">位置描述</th>
              <th class="col-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr><td colspan="5" class="ou-empty">无数据</td></tr>
          </tbody>
        </table>
      </div>
      <div class="ou-footer">
        <div class="ou-footer-left">
          <div class="ou-pager">
            <button type="button" class="ou-page-btn" disabled>‹</button>
            <button type="button" class="ou-page-btn" disabled>›</button>
          </div>
        </div>
        <div class="ou-footer-right">
          <label>到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页 <button type="button" class="ou-page-goto-btn" disabled>确定</button></label>
          <span>共 0 条</span>
          <label><select disabled><option selected>100 条/页</option></select></label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import './nv-shared.css'

const activePanel = ref('system')
const tabs = [
  { key: 'system', label: '系统地址库' },
  { key: 'custom', label: '自定义地址库' },
]
</script>

<style scoped>
.om-omgeo-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 600px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
}

.om-omgeo-tabs {
  display: flex;
  gap: 0;
  padding: 0 16px;
  border-bottom: 1px solid #ebeef5;
  background: #fafafa;
}

.om-omgeo-tab {
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

.om-omgeo-tab.active {
  color: #409eff;
}

.om-omgeo-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20px;
  right: 20px;
  height: 2px;
  background: #409eff;
  border-radius: 1px 1px 0 0;
}

.om-omgeo-panel {
  display: none;
  flex-direction: column;
  flex: 1;
}

.om-omgeo-panel.active {
  display: flex;
}

.om-omgeo-system {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.om-omgeo-hint {
  margin: 0;
  font-size: 13px;
  color: #606266;
}

.om-omgeo-hint-label {
  font-weight: 600;
  color: #409eff;
}

.om-omgeo-upload {
  display: flex;
  flex-direction: column;
  gap: 12px;
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

.om-omgeo-version {
  color: #909399;
  font-size: 13px;
}

.om-omgeo-toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.col-check { width: 42px; text-align: center; }
.col-idx { width: 60px; text-align: center; }
.col-ip { min-width: 120px; }
.col-loc { min-width: 200px; }
.col-actions { width: 100px; text-align: center; }

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
