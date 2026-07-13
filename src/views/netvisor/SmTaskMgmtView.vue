<template>
  <div class="tm-page">
    <div class="tm-card">
      <div class="tm-card-head"><span class="tm-card-title">任务管理</span></div>
      <div class="tm-body">
        <div class="tm-grid">
          <!-- 任务列表 -->
          <div class="tm-panel">
            <table class="tm-table">
              <thead>
                <tr><th style="width:60px">序号</th><th>创建时间</th><th>任务类型</th><th>任务状态</th><th>查询文件数</th><th>查询进度</th><th>操作</th></tr>
              </thead>
              <tbody>
                <tr v-for="(task, idx) in tasks" :key="idx">
                  <td>{{ idx + 1 }}</td>
                  <td>{{ task.created }}</td>
                  <td>{{ task.type }}</td>
                  <td><span class="tm-status">{{ task.status }}</span></td>
                  <td class="num">{{ task.files }}</td>
                  <td>
                    <div class="tm-progress"><div class="tm-progress-bar" :style="{ width: task.progress + '%' }"></div><span class="tm-progress-text">{{ task.progress }}%</span></div>
                  </td>
                  <td><button class="tm-link-btn" disabled>🗑</button></td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- 任务详情 -->
          <div class="tm-panel">
            <table class="tm-table">
              <thead>
                <tr><th style="width:60px">序号</th><th>任务ID</th><th>处理时长</th><th>已读记录数</th><th>内存使用率</th><th>操作</th></tr>
              </thead>
              <tbody>
                <tr v-for="(d, idx) in details" :key="idx">
                  <td>{{ idx + 1 }}</td>
                  <td class="tm-task-id">{{ d.id }}</td>
                  <td>{{ d.duration }}</td>
                  <td class="num">{{ d.records.toLocaleString() }}</td>
                  <td class="num">{{ d.memory }}</td>
                  <td><button class="tm-link-btn" disabled>⏸</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const tasks = [
  { created: '2026-06-18 00:41:36', type: '日志统计', status: '正在查询', files: 0, progress: 0 },
]
const details = [
  { id: 'qid_7', duration: '347.336735s', records: 128642, memory: 42.6 },
  { id: 'd78e2c0b-4a1f-4b2c-9d3e-5f6a7b8c9d0e', duration: '128.42s', records: 86428, memory: 38.2 },
]
</script>

<style scoped>
.tm-page { padding: 0 4px; }
.tm-card {
  background: #fff; border-radius: 6px; border: 1px solid #e8e8e8;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06); overflow: hidden;
}
.tm-card-head { display: flex; align-items: center; padding: 14px 20px; border-bottom: 1px solid #f0f0f0; }
.tm-card-title { font-size: 15px; font-weight: 600; color: #303133; }
.tm-body { padding: 0; }
.tm-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
.tm-panel { overflow-x: auto; border-right: 1px solid #f0f0f0; }
.tm-panel:last-child { border-right: none; }

.tm-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.tm-table th {
  text-align: left; padding: 10px 12px; background: #fafafa;
  color: #606266; font-weight: 600; border-bottom: 1px solid #ebeef5; white-space: nowrap;
}
.tm-table td { padding: 9px 12px; border-bottom: 1px solid #f0f0f0; color: #303133; }
.tm-table tbody tr:hover { background: #f5f7fa; }
.tm-table .num { font-variant-numeric: tabular-nums; text-align: right; }

.tm-status { color: #e6a23c; font-weight: 500; }
.tm-task-id { font-family: monospace; font-size: 11px; color: #8c8c8c; }

.tm-progress { display: flex; align-items: center; gap: 6px; }
.tm-progress-bar { height: 6px; border-radius: 3px; background: #409eff; min-width: 2px; }
.tm-progress-text { font-size: 11px; color: #909399; }

.tm-link-btn { background: none; border: none; color: #409eff; font-size: 13px; cursor: not-allowed; opacity: 0.6; }
</style>
