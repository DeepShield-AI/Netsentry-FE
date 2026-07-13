<template>
  <div class="ug-page">
    <div class="ug-card">
      <div class="ug-tabs-header">
        <div class="ug-tabs-nav">
          <button :class="['ug-tab', { active: tab === 'upgrade' }]" @click="tab = 'upgrade'">系统升级</button>
          <button :class="['ug-tab', { active: tab === 'check' }]" @click="tab = 'check'">更新检查</button>
          <button :class="['ug-tab', { active: tab === 'log' }]" @click="tab = 'log'">升级日志</button>
        </div>
      </div>

      <!-- 系统升级 -->
      <div v-show="tab === 'upgrade'" class="ug-body">
        <div class="ug-info-block">
          <dl class="ug-info-list">
            <div><dt>CPU架构</dt><dd>x86</dd></div>
            <div><dt>操作系统</dt><dd>Linux 5.4</dd></div>
            <div><dt>软件版本</dt><dd>TANG(唐)r7p8, Build date 2026-05-19 05:03:41</dd></div>
            <div><dt>DPI特征库</dt><dd>20260403.150344</dd></div>
          </dl>
          <div class="ug-actions">
            <button class="ug-btn-secondary" disabled>☁ 升级系统</button>
            <button class="ug-btn-secondary" disabled>☁ 升级特征库</button>
          </div>
        </div>
        <div class="ug-lic-tabs">
          <button :class="['ug-lic-tab', { active: licTab === 'system' }]" @click="licTab = 'system'">系统授权</button>
          <button :class="['ug-lic-tab', { active: licTab === 'module' }]" @click="licTab = 'module'">模块授权</button>
        </div>
        <div v-show="licTab === 'system'" class="ug-lic-panel">
          <dl class="ug-info-list">
            <div><dt>授权编号</dt><dd>PZGJ619-05CO</dd></div>
            <div><dt>使用许可时间</dt><dd class="ug-highlight">可永久使用授权</dd></div>
            <div><dt>升级许可时间</dt><dd>2025-11-01 00:00:00 → 2030-12-05 00:00:00</dd></div>
            <div><dt>当前系统时间</dt><dd>2026-06-18 00:48:10</dd></div>
            <div><dt>许可信息</dt><dd>带宽: 10000Mb/s, 存储: 192TB</dd></div>
            <div><dt>系统编号</dt><dd class="ug-sysid">16593dd8e4f2a1b0c9d7e6f5a4b3c2d1 <button class="ug-link-btn" disabled>📋</button></dd></div>
          </dl>
          <div class="ug-actions">
            <button class="ug-btn-secondary" disabled>☁ 导入授权</button>
            <button class="ug-btn-secondary" disabled>☁ 导出授权</button>
          </div>
        </div>
        <div v-show="licTab === 'module'" class="ug-lic-panel">
          <table class="ug-table">
            <thead><tr><th style="width:60px">序号</th><th>模块名称</th><th>授权状态</th><th>到期时间</th></tr></thead>
            <tbody><tr><td colspan="4" class="ug-empty">无数据</td></tr></tbody>
          </table>
        </div>
      </div>

      <!-- 更新检查 -->
      <div v-show="tab === 'check'" class="ug-body">
        <div class="ug-alert">升级检查功能用于检查当前系统、特征库、APP是否可以更新；升级检查功能需要连接互联网，请确保管理口的网络可以正常访问。</div>
        <table class="ug-table">
          <thead>
            <tr><th style="width:60px">序号</th><th>检查类型</th><th>自动检查</th><th>自动升级</th><th>新版本通知</th><th>检查时间</th><th>检查结果</th><th>更新说明</th><th>操作</th></tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in checkItems" :key="idx">
              <td>{{ idx + 1 }}</td>
              <td>{{ item.type }}</td>
              <td><span class="ug-switch-off">禁用</span></td>
              <td><span class="ug-switch-off">{{ item.autoUpgrade ? '禁用' : '—' }}</span></td>
              <td><span class="ug-switch-off">禁用</span></td>
              <td>—</td><td>—</td><td>—</td>
              <td><button class="ug-link-btn" disabled>立即检查</button></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 升级日志 -->
      <div v-show="tab === 'log'" class="ug-body">
        <table class="ug-table">
          <thead><tr><th style="width:60px">序号</th><th>用户</th><th>登录地址</th><th>升级时间</th><th>升级详情</th></tr></thead>
          <tbody><tr><td colspan="5" class="ug-empty">无数据</td></tr></tbody>
        </table>
        <div class="ug-footer"><span class="ug-page-total">共 0 条</span></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const tab = ref<'upgrade' | 'check' | 'log'>('upgrade')
const licTab = ref<'system' | 'module'>('system')
const checkItems = [
  { type: '系统版本', autoUpgrade: false },
  { type: '特征库', autoUpgrade: true },
  { type: 'App', autoUpgrade: true },
]
</script>

<style scoped>
.ug-page { padding: 0 4px; }
.ug-card {
  background: #fff; border-radius: 6px; border: 1px solid #e8e8e8;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06); overflow: hidden;
}
.ug-tabs-header { display: flex; align-items: center; padding: 0 20px; border-bottom: 1px solid #f0f0f0; }
.ug-tabs-nav { display: flex; }
.ug-tab {
  padding: 12px 20px; border: none; background: none; font-size: 14px; font-weight: 500;
  color: #606266; cursor: pointer; border-bottom: 2px solid transparent;
}
.ug-tab.active { color: #1890ff; border-bottom-color: #1890ff; }
.ug-tab:hover:not(.active) { color: #303133; }

.ug-body { padding: 20px; }

.ug-info-block { margin-bottom: 20px; }
.ug-info-list { margin: 0 0 12px; padding: 0; }
.ug-info-list div { display: flex; gap: 12px; margin-bottom: 8px; }
.ug-info-list dt { width: 100px; font-size: 13px; color: #909399; text-align: right; flex-shrink: 0; }
.ug-info-list dd { font-size: 13px; color: #303133; margin: 0; }
.ug-highlight { color: #52c41a; font-weight: 600; }
.ug-sysid { font-family: monospace; font-size: 12px; }

.ug-actions { display: flex; gap: 12px; margin-top: 12px; }
.ug-btn-secondary {
  padding: 6px 16px; background: #fff; color: #303133;
  border: 1px solid #d9d9d9; border-radius: 4px; font-size: 13px; cursor: not-allowed; opacity: 0.6;
}

.ug-lic-tabs { display: flex; gap: 0; margin-bottom: 16px; border-bottom: 1px solid #f0f0f0; }
.ug-lic-tab {
  padding: 8px 16px; border: none; background: none; font-size: 13px;
  color: #606266; cursor: pointer; border-bottom: 2px solid transparent;
}
.ug-lic-tab.active { color: #1890ff; border-bottom-color: #1890ff; }
.ug-lic-panel { }

.ug-alert {
  padding: 10px 14px; background: #e6f7ff; border: 1px solid #91d5ff; border-radius: 4px;
  font-size: 13px; color: #303133; margin-bottom: 16px;
}

.ug-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.ug-table th {
  text-align: left; padding: 10px 12px; background: #fafafa;
  color: #606266; font-weight: 600; border-bottom: 1px solid #ebeef5; white-space: nowrap;
}
.ug-table td { padding: 9px 12px; border-bottom: 1px solid #f0f0f0; color: #303133; }
.ug-table tbody tr:hover { background: #f5f7fa; }
.ug-empty { text-align: center; color: #909399; padding: 40px 0 !important; }

.ug-switch-off {
  display: inline-block; padding: 2px 8px; background: #f5f5f5; border: 1px solid #d9d9d9;
  border-radius: 10px; font-size: 11px; color: #909399;
}

.ug-link-btn { background: none; border: none; color: #409eff; font-size: 13px; cursor: not-allowed; opacity: 0.6; }
.ug-footer { display: flex; justify-content: flex-end; padding: 10px 0; border-top: 1px solid #f0f0f0; }
.ug-page-total { font-size: 13px; color: #909399; }
</style>
