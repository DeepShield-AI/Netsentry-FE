<template>
  <div class="sc-page">
    <div class="sc-card">
      <div class="sc-tabs-header">
        <div class="sc-tabs-nav">
          <button :class="['sc-tab', { active: tab === 'basic' }]" @click="tab = 'basic'">基础检测</button>
          <button :class="['sc-tab', { active: tab === 'ping' }]" @click="tab = 'ping'">Ping监测</button>
        </div>
      </div>

      <!-- 基础检测 -->
      <div v-show="tab === 'basic'" class="sc-body">
        <div class="sc-intro">
          <span>集中检查系统硬件和软件信息</span>
          <button class="sc-btn-primary" disabled>开始检测</button>
        </div>
        <div class="sc-result" v-if="checkResult">
          <p>{{ checkResult }}</p>
        </div>
      </div>

      <!-- Ping监测 -->
      <div v-show="tab === 'ping'" class="sc-body">
        <div class="sc-toolbar">
          <label class="sc-filter"><span class="sc-filter-label">自动刷新</span><select class="sc-select" disabled><option selected>5秒</option></select></label>
          <input class="sc-search" type="search" placeholder="备注名称搜索" disabled />
          <button class="sc-search-btn" disabled>搜索</button>
          <span class="sc-ping-status">状态：未启动</span>
          <div class="sc-toolbar-right">
            <button class="sc-link-btn" disabled>⚙ 设置</button>
            <button class="sc-link-btn" disabled>+ 添加</button>
            <button class="sc-link-btn" disabled>☁ 导入</button>
            <button class="sc-link-btn" disabled>🗑 删除</button>
            <button class="sc-link-btn" disabled>🧹 清空</button>
            <button class="sc-link-btn" disabled>📄 告警日志</button>
          </div>
        </div>
        <table class="sc-table">
          <thead>
            <tr>
              <th style="width:40px"><input type="checkbox" disabled /></th>
              <th style="width:60px">序号</th>
              <th>Ping对象</th><th>Ping接口</th><th>下一跳</th><th>告警</th><th>对象备注</th>
              <th>当前时延</th><th>平均时延</th><th>最大时延</th><th>最小时延</th>
              <th>丢包次数</th><th>丢包率</th><th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr><td colspan="14" class="sc-empty">数据加载中</td></tr>
          </tbody>
        </table>
        <div class="sc-pagination">
          <span class="sc-page-total">共 0 条</span>
          <button class="sc-page-btn" disabled>&lt;</button>
          <button class="sc-page-btn" disabled>&gt;</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const tab = ref<'basic' | 'ping'>('basic')
const checkResult = ref('')
</script>

<style scoped>
.sc-page { padding: 0 4px; }
.sc-card {
  background: #fff; border-radius: 6px; border: 1px solid #e8e8e8;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06); overflow: hidden;
}
.sc-tabs-header { display: flex; align-items: center; padding: 0 20px; border-bottom: 1px solid #f0f0f0; }
.sc-tabs-nav { display: flex; }
.sc-tab {
  padding: 12px 20px; border: none; background: none; font-size: 14px; font-weight: 500;
  color: #606266; cursor: pointer; border-bottom: 2px solid transparent;
}
.sc-tab.active { color: #1890ff; border-bottom-color: #1890ff; }
.sc-tab:hover:not(.active) { color: #303133; }

.sc-body { padding: 20px; }

.sc-intro { display: flex; align-items: center; gap: 16px; font-size: 14px; color: #606266; }
.sc-btn-primary {
  padding: 7px 20px; background: #1890ff; color: #fff;
  border: none; border-radius: 4px; font-size: 13px; cursor: not-allowed; opacity: 0.6;
}
.sc-result { margin-top: 16px; padding: 12px; background: #f6ffed; border: 1px solid #b7eb8f; border-radius: 4px; font-size: 13px; color: #52c41a; }

.sc-toolbar {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 12px;
}
.sc-filter { display: flex; align-items: center; gap: 4px; }
.sc-filter-label { font-size: 13px; color: #606266; }
.sc-select { height: 30px; padding: 0 8px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 13px; background: #fafafa; }
.sc-search { height: 30px; padding: 0 10px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 13px; width: 180px; }
.sc-search-btn { height: 30px; padding: 0 12px; background: #1890ff; color: #fff; border: none; border-radius: 4px; font-size: 13px; cursor: not-allowed; opacity: 0.6; }
.sc-ping-status { font-size: 13px; color: #909399; }
.sc-toolbar-right { margin-left: auto; display: flex; gap: 10px; }
.sc-link-btn { background: none; border: none; color: #409eff; font-size: 13px; cursor: not-allowed; opacity: 0.6; }

.sc-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.sc-table th {
  text-align: left; padding: 10px 12px; background: #fafafa;
  color: #606266; font-weight: 600; border-bottom: 1px solid #ebeef5; white-space: nowrap;
}
.sc-table td { padding: 9px 12px; border-bottom: 1px solid #f0f0f0; color: #303133; }
.sc-empty { text-align: center; color: #909399; padding: 40px 0 !important; }

.sc-pagination {
  display: flex; align-items: center; justify-content: flex-end; gap: 8px; padding: 12px 0; border-top: 1px solid #f0f0f0;
}
.sc-page-total { font-size: 13px; color: #909399; margin-right: 8px; }
.sc-page-btn {
  width: 28px; height: 28px; border: 1px solid #d9d9d9; border-radius: 4px;
  background: #fff; font-size: 13px; color: #c0c4cc; cursor: not-allowed;
}
</style>
