<template>
  <div class="nvt-page">
    <div class="nvt-card">
      <div class="nvt-card-header">
        <span>系统用户</span>
      </div>
      <div class="nvt-card-body">
        <div class="ou-toolbar sm-toolbar">
          <input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled />
          <button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button>
          <div class="sm-toolbar-right">
            <button type="button" class="link-btn" disabled title="暂未开放">🗑 删除</button>
            <button type="button" class="link-btn" disabled title="暂未开放">+ 添加</button>
          </div>
        </div>

        <div class="nvt-table-wrap">
          <table class="ou-table sm-users-table">
            <thead>
              <tr>
                <th class="col-check">
                  <input type="checkbox" disabled aria-label="全选" />
                </th>
                <th class="col-idx">序号</th>
                <th>用户名</th>
                <th>角色</th>
                <th>最后登录</th>
                <th class="col-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.idx">
                <td class="col-check">
                  <input type="checkbox" disabled />
                </td>
                <td class="col-idx">{{ user.idx }}</td>
                <td>
                  <button type="button" class="link-btn" disabled>{{ user.name }}</button>
                </td>
                <td>{{ user.role }}</td>
                <td>{{ user.lastLogin }}</td>
                <td class="col-actions">
                  <button type="button" class="link-btn" disabled title="暂未开放">✎ 编辑</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <section class="sm-user-edit-card" hidden aria-hidden="true">
          <h3 class="om-section-title">账号编辑</h3>
          <form class="sm-form sm-user-edit-form" @submit.prevent>
            <label class="om-form-row">
              <span class="om-form-label">用户名</span>
              <span class="sm-form-static">test</span>
            </label>
            <label class="om-form-row">
              <span class="om-form-label">当前密码</span>
              <input class="ou-toolbar-input sm-form-input" type="password" value="" disabled />
            </label>
            <label class="om-form-row">
              <span class="om-form-label">新密码</span>
              <input class="ou-toolbar-input sm-form-input" type="password" placeholder="为空则不修改" disabled />
            </label>
            <label class="om-form-row">
              <span class="om-form-label">确认密码</span>
              <input class="ou-toolbar-input sm-form-input" type="password" placeholder="为空则不修改" disabled />
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

const users = ref([
  {
    idx: 1,
    name: 'test',
    role: '管理员',
    lastLogin: '2026.06.18/00:41:36'
  },
  {
    idx: 2,
    name: 'admin',
    role: '超级管理员',
    lastLogin: '2026.06.17/18:22:10'
  }
])
</script>

<style scoped>
.ou-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
}

.ou-toolbar-input {
  padding: 6px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
  flex: 1;
  max-width: 300px;
}

.ou-search-btn {
  padding: 6px 16px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
  background: #fff;
  cursor: not-allowed;
}

.sm-toolbar-right {
  margin-left: auto;
  display: flex;
  gap: 12px;
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

.col-check {
  width: 40px;
  text-align: center;
}

.col-idx {
  width: 60px;
  text-align: center;
}

.col-actions {
  width: 100px;
  text-align: center;
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

.sm-user-edit-card {
  margin-top: 24px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 4px;
}

.om-section-title {
  margin: 0 0 16px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.sm-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 500px;
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

.sm-form-static {
  color: #303133;
}

.sm-form-input {
  flex: 1;
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
</style>
