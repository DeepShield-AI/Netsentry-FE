<template>
  <div class="nvt-page">
    <div class="ou-toolbar ar-toolbar">
      <input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled />
      <button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button>
      <div class="ar-toolbar-right">
        <button type="button" class="link-btn" disabled title="暂未开放">🗑 删除</button>
        <button type="button" class="link-btn" disabled title="暂未开放">+ 添加</button>
      </div>
    </div>
    <div class="ou-table-wrap ar-table-wrap">
      <table class="ou-table ar-cg-table">
        <thead>
          <tr>
            <th class="col-check"><input type="checkbox" disabled aria-label="全选" /></th>
            <th class="col-idx">序号</th>
            <th class="col-name">协议组名称</th>
            <th class="col-members">成员列表</th>
            <th class="col-actions">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in tableData" :key="idx">
            <td class="col-check"><input type="checkbox" disabled /></td>
            <td class="col-idx">{{ idx + 1 }}</td>
            <td class="col-name">
              <button type="button" class="link-btn" disabled>{{ row.name }}</button>
            </td>
            <td class="col-members">{{ row.members }}</td>
            <td class="col-actions">
              <button type="button" class="link-btn" disabled title="暂未开放">✎</button>
              <button type="button" class="link-btn" disabled title="暂未开放">📈</button>
              <button type="button" class="link-btn" disabled title="暂未开放">🗑</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import './nv-test-shared.css'

const tableData = ref([
  { name: '告警_扫描DDOS', members: 'NTP MSDS SSDP' },
  { name: '告警_远程访问', members: 'SSH Telnet TeamViewer 向日葵远控 PCAnyWhere' },
  { name: '告警_文件传输', members: 'FTP TFTP POP3 SMTP IMAP' }
])
</script>

<style scoped>
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
  background: transparent;
  border: none;
  color: #409eff;
  cursor: pointer;
  padding: 2px 4px;
  font-size: 13px;
}

.link-btn:not(:has(+ .link-btn)) {
  padding: 6px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
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
.col-name { min-width: 180px; }
.col-members { min-width: 300px; }
.col-actions { width: 120px; }

.ou-action-btn {
  padding: 6px 12px;
  background: transparent;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  color: #606266;
}
</style>
