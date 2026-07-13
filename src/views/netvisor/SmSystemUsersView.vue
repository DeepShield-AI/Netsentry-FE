<template>
  <div class="su-page">
    <div class="su-card">
      <div class="su-card-head"><span class="su-card-title">系统用户</span></div>
      <div class="su-body">
        <div class="su-toolbar">
          <input class="su-search" type="search" placeholder="关键字搜索" disabled />
          <button class="su-search-btn" disabled>搜索</button>
          <div class="su-toolbar-right">
            <button class="su-link-btn" disabled>🗑 删除</button>
            <button class="su-link-btn" disabled>+ 添加</button>
          </div>
        </div>
        <table class="su-table">
          <thead>
            <tr>
              <th style="width:40px"><input type="checkbox" disabled /></th>
              <th style="width:60px">序号</th>
              <th>用户名</th>
              <th>角色</th>
              <th>最后登录</th>
              <th style="width:80px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(u, idx) in users" :key="u.name">
              <td><input type="checkbox" disabled /></td>
              <td>{{ idx + 1 }}</td>
              <td><strong>{{ u.name }}</strong></td>
              <td><span :class="['su-tag', u.role === '超级管理员' ? 'su-tag-blue' : 'su-tag-green']">{{ u.role }}</span></td>
              <td>{{ u.lastLogin }}</td>
              <td><button class="su-link-btn" disabled>✎ 编辑</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const users = [
  { name: 'test', role: '管理员', lastLogin: '2026.06.18/00:41:36' },
  { name: 'admin', role: '超级管理员', lastLogin: '2026.06.17/18:22:10' },
]
</script>

<style scoped>
.su-page { padding: 0 4px; }
.su-card {
  background: #fff; border-radius: 6px; border: 1px solid #e8e8e8;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06); overflow: hidden;
}
.su-card-head { display: flex; align-items: center; padding: 14px 20px; border-bottom: 1px solid #f0f0f0; }
.su-card-title { font-size: 15px; font-weight: 600; color: #303133; }
.su-body { padding: 0; }

.su-toolbar {
  display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-bottom: 1px solid #f0f0f0;
}
.su-search {
  height: 30px; padding: 0 10px; border: 1px solid #d9d9d9; border-radius: 4px;
  font-size: 13px; width: 200px;
}
.su-search-btn {
  height: 30px; padding: 0 12px; background: #1890ff; color: #fff;
  border: none; border-radius: 4px; font-size: 13px; cursor: not-allowed; opacity: 0.6;
}
.su-toolbar-right { margin-left: auto; display: flex; gap: 12px; }
.su-link-btn { background: none; border: none; color: #409eff; font-size: 13px; cursor: not-allowed; opacity: 0.6; }

.su-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.su-table th {
  text-align: left; padding: 10px 12px; background: #fafafa;
  color: #606266; font-weight: 600; border-bottom: 1px solid #ebeef5; white-space: nowrap;
}
.su-table td { padding: 9px 12px; border-bottom: 1px solid #f0f0f0; color: #303133; }
.su-table tbody tr:hover { background: #f5f7fa; }

.su-tag {
  display: inline-block; padding: 2px 8px; border-radius: 4px;
  font-size: 12px; font-weight: 500;
}
.su-tag-blue { background: #e6f7ff; color: #1890ff; border: 1px solid #91d5ff; }
.su-tag-green { background: #f6ffed; color: #52c41a; border: 1px solid #b7eb8f; }
</style>
