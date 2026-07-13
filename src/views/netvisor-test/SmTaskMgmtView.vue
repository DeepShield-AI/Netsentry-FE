<template>
  <div class="nvt-page">
    <div class="nvt-card">
      <div class="nvt-card-header">
        <span>任务管理</span>
      </div>
      <div class="nvt-card-body">
        <div class="sm-task-grid">
          <section class="sm-task-panel">
            <div class="nvt-table-wrap">
              <table class="ou-table sm-task-table">
                <thead>
                  <tr>
                    <th class="col-idx">序号</th>
                    <th class="ou-th-sort">创建时间</th>
                    <th>任务类型</th>
                    <th>任务状态</th>
                    <th>查询文件数</th>
                    <th>查询进度</th>
                    <th class="col-actions">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="task in tasks" :key="task.idx">
                    <td class="col-idx">{{ task.idx }}</td>
                    <td>{{ task.createTime }}</td>
                    <td>{{ task.type }}</td>
                    <td>{{ task.status }}</td>
                    <td class="ou-num">{{ task.fileCount }}</td>
                    <td>
                      <span class="sm-progress">
                        <span class="sm-progress-bar" :style="{ width: task.progress + '%' }"></span>
                        <span class="sm-progress-text">{{ task.progressText }}</span>
                      </span>
                    </td>
                    <td class="col-actions">
                      <button type="button" class="link-btn" disabled title="暂未开放">🗑</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section class="sm-task-panel">
            <div class="nvt-table-wrap">
              <table class="ou-table sm-task-detail-table">
                <thead>
                  <tr>
                    <th class="col-idx">序号</th>
                    <th>任务 ID</th>
                    <th>处理时长</th>
                    <th>已读记录数</th>
                    <th>内存使用率</th>
                    <th class="col-actions">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="detail in taskDetails" :key="detail.idx">
                    <td class="col-idx">{{ detail.idx }}</td>
                    <td class="sm-task-id">{{ detail.taskId }}</td>
                    <td>{{ detail.duration }}</td>
                    <td class="ou-num">{{ detail.readCount }}</td>
                    <td class="ou-num">{{ detail.memUsage }}</td>
                    <td class="col-actions">
                      <button type="button" class="link-btn" disabled title="暂未开放">⏸</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import './nv-test-shared.css'

const tasks = ref([
  {
    idx: 1,
    createTime: '2026-06-18 00:41:36',
    type: '日志统计',
    status: '正在查询',
    fileCount: 0,
    progress: 0,
    progressText: 'NaN'
  }
])

const taskDetails = ref([
  {
    idx: 1,
    taskId: 'qid_7',
    duration: '347.336735s',
    readCount: 128642,
    memUsage: 42.6
  },
  {
    idx: 2,
    taskId: 'd78e2c0b-4a1f-4b2c-9d3e-5f6a7b8c9d0e',
    duration: '128.42s',
    readCount: 86428,
    memUsage: 38.2
  }
])
</script>

<style scoped>
.sm-task-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
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

.col-idx {
  width: 60px;
  text-align: center;
}

.col-actions {
  width: 80px;
  text-align: center;
}

.ou-num {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.sm-task-id {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #606266;
}

.sm-progress {
  position: relative;
  display: inline-block;
  width: 100%;
  height: 20px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.sm-progress-bar {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: #409eff;
  transition: width 0.3s;
}

.sm-progress-text {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 12px;
  color: #606266;
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

.ou-th-sort {
  cursor: pointer;
}

.ou-th-sort::after {
  content: ' ↕';
  font-size: 10px;
  color: #c0c4cc;
}
</style>
