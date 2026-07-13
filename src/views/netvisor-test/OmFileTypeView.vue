<template>
  <div class="om-ft-page">
    <div class="ou-toolbar">
      <input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled />
      <button type="button" class="ou-search-btn" disabled>搜索</button>
      <div class="om-ft-toolbar-right">
        <button type="button" class="link-btn" disabled>🗑 删除</button>
        <button type="button" class="link-btn" disabled>+ 添加</button>
      </div>
    </div>
    <div class="ou-table-wrap">
      <table class="ou-table">
        <thead>
          <tr>
            <th class="col-check"><input type="checkbox" disabled aria-label="全选" /></th>
            <th class="col-id">ID</th>
            <th class="col-name">群组名称</th>
            <th class="col-summary">文件类型概要</th>
            <th class="col-actions">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colspan="5" class="ou-empty">无数据</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import './nv-shared.css'
</script>

<style scoped>
.om-ft-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 600px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
}

.om-ft-toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.col-check { width: 42px; text-align: center; }
.col-id { width: 60px; }
.col-name { min-width: 150px; }
.col-summary { min-width: 200px; }
.col-actions { width: 100px; text-align: center; }
</style>
