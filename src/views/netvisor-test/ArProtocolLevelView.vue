<template>
  <div class="nvt-page">
    <div class="ou-toolbar ar-toolbar">
      <input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled />
      <button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button>
      <div class="ar-toolbar-right">
        <button type="button" class="link-btn" disabled title="暂未开放">ⓘ 说明</button>
        <button type="button" class="link-btn" disabled title="暂未开放">🗑 删除</button>
        <button type="button" class="link-btn" disabled title="暂未开放">+ 添加</button>
      </div>
    </div>
    <div class="ou-table-wrap ar-table-wrap">
      <table class="ou-table ar-pl-table">
        <thead>
          <tr>
            <th class="col-check"><input type="checkbox" disabled aria-label="全选" /></th>
            <th class="col-idx">序号</th>
            <th class="col-name">协议名称</th>
            <th class="col-ip">IP</th>
            <th class="col-desc">等级描述</th>
            <th class="col-color">等级颜色</th>
            <th class="col-trend">最近2小时命中趋势</th>
            <th class="col-actions">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="tableData.length === 0">
            <td colspan="8" class="ou-empty">无数据</td>
          </tr>
          <tr v-for="(row, idx) in tableData" :key="idx">
            <td class="col-check"><input type="checkbox" disabled /></td>
            <td class="col-idx">{{ idx + 1 }}</td>
            <td class="col-name">{{ row.name }}</td>
            <td class="col-ip">{{ row.ip }}</td>
            <td class="col-desc">{{ row.levelDesc }}</td>
            <td class="col-color">
              <span class="ar-level-color" :style="{ background: row.color }"></span>
              {{ row.colorName }}
            </td>
            <td class="col-trend">
              <svg class="ar-trend-svg" viewBox="0 0 200 40" preserveAspectRatio="none" aria-hidden="true">
                <polyline fill="none" :stroke="row.color" stroke-width="2" :points="row.trendPoints"/>
              </svg>
            </td>
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
          <select disabled>
            <option selected>100 条/页</option>
          </select>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import './nv-test-shared.css'

const tableData = ref([
  { name: 'HTTP', ip: '0.0.0.0/0', levelDesc: '关键业务协议', color: '#67c23a', colorName: '绿色', trendPoints: '10,30 30,25 50,20 70,28 90,15 110,22 130,18 150,25 170,20 190,28' },
  { name: 'DNS', ip: '8.8.8.8', levelDesc: '重要基础服务', color: '#409eff', colorName: '蓝色', trendPoints: '10,20 30,18 50,22 70,15 90,20 110,25 130,22 150,18 170,20 190,15' },
  { name: 'SSH', ip: '10.0.0.0/8', levelDesc: '管理协议', color: '#e6a23c', colorName: '橙色', trendPoints: '10,25 30,20 50,18 70,22 90,28 110,25 130,20 150,22 170,25 190,20' }
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
.col-name { min-width: 120px; }
.col-ip { min-width: 140px; }
.col-desc { min-width: 160px; }
.col-color { min-width: 120px; }
.col-trend { min-width: 220px; }
.col-actions { width: 100px; }

.ou-empty {
  text-align: center;
  padding: 40px 0;
  color: #909399;
}

.ar-level-color {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 2px;
  margin-right: 6px;
  vertical-align: middle;
}

.ar-trend-svg {
  width: 100%;
  height: 40px;
  display: block;
}

.ou-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-top: 1px solid #ebeef5;
}

.ou-footer-left {
  display: flex;
  align-items: center;
}

.ou-footer-right {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
  color: #606266;
}

.ou-pager {
  display: flex;
  gap: 4px;
}

.ou-page-btn {
  padding: 4px 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
}

.ou-page-goto {
  display: flex;
  align-items: center;
  gap: 4px;
}

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
