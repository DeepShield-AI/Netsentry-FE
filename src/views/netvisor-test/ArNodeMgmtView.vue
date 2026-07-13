<template>
  <div class="nvt-page">
    <div class="ou-toolbar ar-toolbar">
      <label class="tdh-filter-field">
        <span class="ou-toolbar-label">协议类型</span>
        <select class="ou-toolbar-select" disabled><option selected>所有</option></select>
      </label>
      <label class="tdh-filter-field">
        <span class="ou-toolbar-label">应用协议</span>
        <select class="ou-toolbar-select" disabled><option selected>任意协议</option></select>
      </label>
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
      <table class="ou-table ar-nm-table">
        <thead>
          <tr>
            <th class="col-check"><input type="checkbox" disabled aria-label="全选" /></th>
            <th class="col-idx">序号</th>
            <th class="col-ip">节点IP</th>
            <th class="col-port">节点端口</th>
            <th class="col-proto">所属协议</th>
            <th class="col-actions">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="tableData.length === 0">
            <td colspan="6" class="ou-empty">无数据</td>
          </tr>
          <tr v-for="(row, idx) in tableData" :key="idx">
            <td class="col-check"><input type="checkbox" disabled /></td>
            <td class="col-idx">{{ idx + 1 }}</td>
            <td class="col-ip">{{ row.ip }}</td>
            <td class="col-port">{{ row.port }}</td>
            <td class="col-proto">{{ row.protocol }}</td>
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
        <span>共 {{ tableData.length }} 条</span>
        <label class="ou-page-size">
          <select disabled><option selected>100 条/页</option></select>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import './nv-test-shared.css'

const tableData = ref([
  { ip: '192.168.1.1', port: '80', protocol: 'HTTP' },
  { ip: '192.168.1.2', port: '443', protocol: 'HTTPS' },
  { ip: '10.0.0.1', port: '53', protocol: 'DNS' },
  { ip: '10.0.0.2', port: '22', protocol: 'SSH' },
  { ip: '172.16.0.1', port: '3306', protocol: 'MySQL' }
])
</script>

<style scoped>
.ar-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.tdh-filter-field {
  display: flex;
  align-items: center;
  gap: 4px;
}

.ou-toolbar-label {
  font-size: 13px;
  color: #606266;
  white-space: nowrap;
}

.ou-toolbar-select {
  padding: 4px 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
  background: #fff;
}

.ou-toolbar-input {
  padding: 6px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
  min-width: 160px;
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

.col-check { width: 40px; }
.col-idx { width: 60px; }
.col-ip { min-width: 160px; }
.col-port { min-width: 100px; }
.col-proto { min-width: 120px; }
.col-actions { width: 100px; }

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

.ou-footer-left { display: flex; align-items: center; }

.ou-footer-right {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
  color: #606266;
}

.ou-pager { display: flex; gap: 4px; }

.ou-page-btn {
  padding: 4px 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
}

.ou-page-goto { display: flex; align-items: center; gap: 4px; }

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
