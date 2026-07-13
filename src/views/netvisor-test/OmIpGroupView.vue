<template>
  <div class="om-split-page">
    <div class="om-split-left">
      <div class="om-split-head">IP群组</div>
      <div class="ou-toolbar">
        <input class="ou-toolbar-input" type="search" placeholder="输入IP或群组名称关键字查询" disabled />
        <button type="button" class="ou-search-btn" disabled>搜索</button>
        <div class="om-split-toolbar-right">
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
              <th class="col-count">成员数量</th>
              <th class="col-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr><td colspan="5" class="ou-empty">无数据</td></tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="om-split-right">
      <div class="om-split-head">群组IP展示</div>
      <div class="ou-toolbar">
        <label class="tdh-filter-field">
          <span class="ou-toolbar-label">IP群组</span>
          <select class="ou-toolbar-select" disabled>
            <option selected>请选择</option>
          </select>
        </label>
        <input class="ou-toolbar-input" type="search" placeholder="输入IP关键字查询" disabled />
        <button type="button" class="ou-search-btn" disabled>搜索</button>
        <div class="om-split-toolbar-right">
          <button type="button" class="link-btn" disabled>+ 添加导入</button>
          <button type="button" class="link-btn" disabled>清空</button>
          <button type="button" class="link-btn" disabled>🗑 删除</button>
          <button type="button" class="link-btn" disabled>☁ 导出</button>
        </div>
      </div>
      <div class="ou-table-wrap">
        <table class="ou-table">
          <thead>
            <tr>
              <th class="col-check"><input type="checkbox" disabled aria-label="全选" /></th>
              <th class="col-idx">序号</th>
              <th class="col-group">所属群组</th>
              <th class="col-ip">IP</th>
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
  </div>
</template>

<script setup lang="ts">
import './nv-shared.css'
</script>

<style scoped>
.om-split-page {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  height: 100%;
  min-height: 600px;
}

.om-split-left,
.om-split-right {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.om-split-head {
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  border-bottom: 1px solid #ebeef5;
  background: #fafafa;
}

.om-split-toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.col-check { width: 42px; text-align: center; }
.col-id { width: 60px; }
.col-name { min-width: 150px; }
.col-count { min-width: 80px; text-align: right; }
.col-actions { width: 100px; text-align: center; }
.col-idx { width: 60px; text-align: center; }
.col-group { min-width: 120px; }
.col-ip { min-width: 150px; }
.col-remark { min-width: 150px; }
</style>
