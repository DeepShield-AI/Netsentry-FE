<template>
  <div class="sl-page">
    <div class="sl-card">
      <div class="sl-tabs-header">
        <div class="sl-tabs-nav">
          <button :class="['sl-tab', { active: tab === 'operation' }]" @click="tab = 'operation'">操作日志</button>
          <button :class="['sl-tab', { active: tab === 'alarm' }]" @click="tab = 'alarm'">告警日志</button>
        </div>
      </div>

      <!-- 操作日志 -->
      <div v-show="tab === 'operation'" class="sl-body">
        <div class="sl-toolbar">
          <label class="sl-filter"><span class="sl-filter-label">日期</span><input class="sl-date-input" type="text" value="2026.06.17 - 2026.06.18" disabled /></label>
          <input class="sl-search" type="search" placeholder="关键字搜索" disabled />
          <button class="sl-search-btn" disabled>搜索</button>
          <div class="sl-toolbar-right">
            <button class="sl-link-btn" disabled>📄 历史日志</button>
            <button class="sl-link-btn" disabled>☁ 导出</button>
          </div>
        </div>
        <table class="sl-table">
          <thead>
            <tr><th style="width:60px">序号</th><th>用户</th><th>登录地址</th><th>操作时间</th><th>操作</th><th>参数</th></tr>
          </thead>
          <tbody>
            <tr v-for="(log, idx) in opLogs" :key="idx">
              <td>{{ idx + 1 }}</td>
              <td>{{ log.user }}</td>
              <td>{{ log.ip }}</td>
              <td>{{ log.time }}</td>
              <td>{{ log.action }}</td>
              <td>{{ log.params || '—' }}</td>
            </tr>
          </tbody>
        </table>
        <div class="sl-footer">
          <span class="sl-page-total">共 {{ opLogs.length }} 条</span>
        </div>
      </div>

      <!-- 告警日志 -->
      <div v-show="tab === 'alarm'" class="sl-body">
        <div class="sl-toolbar">
          <label class="sl-filter"><span class="sl-filter-label">日期</span><input class="sl-date-input" type="text" value="2026.06.12 - 2026.06.18" disabled /></label>
          <input class="sl-search" type="search" placeholder="关键字搜索" disabled />
          <button class="sl-search-btn" disabled>搜索</button>
          <div class="sl-toolbar-right">
            <button class="sl-link-btn" disabled>⚙ 参数设置</button>
            <button class="sl-link-btn" disabled>📄 历史日志</button>
            <button class="sl-link-btn" disabled>☁ 导出</button>
          </div>
        </div>
        <table class="sl-table">
          <thead>
            <tr><th style="width:60px">序号</th><th>用户</th><th>登录地址</th><th>操作时间</th><th>操作</th><th>结果</th></tr>
          </thead>
          <tbody>
            <tr><td colspan="6" class="sl-empty">无数据</td></tr>
          </tbody>
        </table>
        <div class="sl-footer">
          <span class="sl-page-total">共 0 条</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const tab = ref<'operation' | 'alarm'>('operation')
const opLogs = [
  { user: 'test', ip: '192.168.2.205', time: '2026.06.18/00:41:36', action: '用户登录系统', params: '' },
  { user: '_system_', ip: '127.0.0.1', time: '2026.06.18/00:35:25', action: 'NTP同步', params: 'server=166.111.4.19' },
]
</script>

<style scoped>
.sl-page { padding: 0 4px; }
.sl-card {
  background: #fff; border-radius: 6px; border: 1px solid #e8e8e8;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06); overflow: hidden;
}
.sl-tabs-header { display: flex; align-items: center; padding: 0 20px; border-bottom: 1px solid #f0f0f0; }
.sl-tabs-nav { display: flex; }
.sl-tab {
  padding: 12px 20px; border: none; background: none; font-size: 14px; font-weight: 500;
  color: #606266; cursor: pointer; border-bottom: 2px solid transparent;
}
.sl-tab.active { color: #1890ff; border-bottom-color: #1890ff; }
.sl-tab:hover:not(.active) { color: #303133; }

.sl-body { padding: 0; }
.sl-toolbar {
  display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-bottom: 1px solid #f0f0f0;
}
.sl-filter { display: flex; align-items: center; gap: 4px; }
.sl-filter-label { font-size: 13px; color: #606266; }
.sl-date-input { height: 30px; padding: 0 10px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 13px; width: 200px; background: #fafafa; }
.sl-search { height: 30px; padding: 0 10px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 13px; width: 180px; }
.sl-search-btn { height: 30px; padding: 0 12px; background: #1890ff; color: #fff; border: none; border-radius: 4px; font-size: 13px; cursor: not-allowed; opacity: 0.6; }
.sl-toolbar-right { margin-left: auto; display: flex; gap: 12px; }
.sl-link-btn { background: none; border: none; color: #409eff; font-size: 13px; cursor: not-allowed; opacity: 0.6; }

.sl-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.sl-table th {
  text-align: left; padding: 10px 12px; background: #fafafa;
  color: #606266; font-weight: 600; border-bottom: 1px solid #ebeef5; white-space: nowrap;
}
.sl-table td { padding: 9px 12px; border-bottom: 1px solid #f0f0f0; color: #303133; }
.sl-table tbody tr:hover { background: #f5f7fa; }
.sl-empty { text-align: center; color: #909399; padding: 40px 0 !important; }

.sl-footer {
  display: flex; align-items: center; justify-content: flex-end; padding: 10px 16px; border-top: 1px solid #f0f0f0;
}
.sl-page-total { font-size: 13px; color: #909399; }
</style>
