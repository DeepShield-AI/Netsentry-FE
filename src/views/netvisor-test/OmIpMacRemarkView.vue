<template>
  <div class="om-omr-page">
    <div class="om-omr-panel" :class="{ active: activePanel === 'ip-mac' }">
      <div class="ou-toolbar">
        <input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled />
        <button type="button" class="ou-search-btn" disabled>搜索</button>
        <div class="om-omr-toolbar-right">
          <button type="button" class="link-btn" disabled>🗑 删除</button>
          <button type="button" class="link-btn" disabled>✎ 编辑</button>
          <button type="button" class="link-btn" disabled>+ 添加</button>
          <button type="button" class="link-btn" disabled>☁ 导入</button>
          <button type="button" class="link-btn" disabled>☁ 导出</button>
          <button type="button" class="link-btn" disabled>✎ 自定义列</button>
        </div>
      </div>
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
            <tr><td colspan="6" class="ou-empty">无数据</td></tr>
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
    <div class="om-omr-panel" :class="{ active: activePanel === 'ip-segment' }">
      <div class="ou-toolbar">
        <input class="ou-toolbar-input" type="search" placeholder="输入单个IP进行匹配搜索" disabled />
        <button type="button" class="ou-search-btn" disabled>搜索</button>
        <div class="om-omr-toolbar-right">
          <button type="button" class="link-btn" disabled>ⓘ 说明</button>
          <button type="button" class="link-btn" disabled>🗑 删除</button>
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
              <th class="col-remark">备注</th>
              <th class="col-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr><td colspan="5" class="ou-empty">无数据</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import './nv-shared.css'

const activePanel = ref('ip-mac')
</script>

<style scoped>
.om-omr-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 600px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
}

.om-omr-panel {
  display: none;
  flex-direction: column;
  flex: 1;
}

.om-omr-panel.active {
  display: flex;
}

.om-omr-toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.col-check { width: 42px; text-align: center; }
.col-idx { width: 60px; text-align: center; }
.col-object { min-width: 120px; }
.col-group { min-width: 100px; }
.col-remark { min-width: 150px; }
.col-actions { width: 100px; text-align: center; }
.col-ip { min-width: 120px; }
</style>
