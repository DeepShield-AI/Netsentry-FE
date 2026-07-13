<template>
  <div class="om-omw-page">
    <div class="om-omw-panel" :class="{ active: activePanel === 'params' }">
      <div class="om-omw-section-card">
        <section class="om-omw-section">
          <h3 class="om-section-title">参数设置</h3>
          <p class="om-omw-hint"><span class="om-omw-hint-label">说明</span> 选择一个IP群组作为白名单后，不在群组里面的IP都为非法IP</p>
          <form class="om-omw-form" onsubmit="return false">
            <label class="om-form-row">
              <span class="om-form-label">白名单IP群组</span>
              <select class="ou-toolbar-select" disabled>
                <option selected>不设置</option>
              </select>
            </label>
            <label class="om-form-row">
              <span class="om-form-label">离线老化时间</span>
              <input class="ou-toolbar-input om-form-input-sm" type="text" value="120" disabled />
              <span class="om-form-unit">秒</span>
            </label>
            <button type="button" class="primary" disabled title="暂未开放">提交</button>
          </form>
        </section>
      </div>
      <div class="om-omw-section-card om-omw-section-list">
        <section class="om-omw-section">
          <div class="om-split-head">IP列表</div>
          <div class="ou-toolbar">
            <input class="ou-toolbar-input" type="search" placeholder="关键词搜索" disabled />
            <button type="button" class="ou-search-btn" disabled>搜索</button>
            <div class="om-omw-toolbar-right">
              <button type="button" class="link-btn" disabled>🗑 删除</button>
              <button type="button" class="link-btn" disabled>+ 添加</button>
              <button type="button" class="link-btn" disabled>☁ 导入</button>
              <button type="button" class="link-btn" disabled>☁ 导出</button>
            </div>
          </div>
          <div class="ou-table-wrap">
            <table class="ou-table">
              <thead>
                <tr>
                  <th class="col-check"><input type="checkbox" disabled aria-label="全选" /></th>
                  <th class="col-idx">序号</th>
                  <th class="col-ip">IP</th>
                  <th class="col-remark">备注</th>
                  <th class="col-actions">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr><td colspan="5" class="ou-empty">无数据</td></tr>
              </tbody>
            </table>
          </div>
          <div class="ou-footer">
            <div class="ou-footer-left">
              <div class="ou-pager">
                <button type="button" class="ou-page-btn" disabled>‹</button>
                <button type="button" class="ou-page-btn" disabled>›</button>
              </div>
            </div>
            <div class="ou-footer-right">
              <label>到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页 <button type="button" class="ou-page-goto-btn" disabled>确定</button></label>
              <span>共 0 条</span>
              <label><select disabled><option selected>100 条/页</option></select></label>
            </div>
          </div>
        </section>
      </div>
    </div>
    <div class="om-omw-panel" :class="{ active: activePanel === 'overview' }">
      <div class="om-omw-overview">
        <div class="om-omw-stat-row">
          <div class="om-omw-stat-card">
            <span class="om-omw-stat-icon om-omw-stat-icon-user" aria-hidden="true"></span>
            <div class="om-omw-stat-body">
              <strong class="om-omw-stat-val">0</strong>
              <span class="om-omw-stat-label">总IP数</span>
            </div>
          </div>
          <div class="om-omw-stat-card">
            <span class="om-omw-stat-icon om-omw-stat-icon-legal" aria-hidden="true"></span>
            <div class="om-omw-stat-body">
              <strong class="om-omw-stat-val">0</strong>
              <span class="om-omw-stat-label">合法IP</span>
            </div>
          </div>
          <div class="om-omw-stat-card">
            <span class="om-omw-stat-icon om-omw-stat-icon-illegal" aria-hidden="true"></span>
            <div class="om-omw-stat-body">
              <strong class="om-omw-stat-val">0</strong>
              <span class="om-omw-stat-label">非法IP</span>
            </div>
          </div>
        </div>
        <div class="om-omw-trend-card">
          <div class="om-omw-trend-head">
            <h3 class="om-section-title">合法IP在线趋势</h3>
            <div class="om-omw-range-toggle" role="group">
              <button type="button" class="om-omw-range-btn active" disabled>日</button>
              <button type="button" class="om-omw-range-btn" disabled>周</button>
              <button type="button" class="om-omw-range-btn" disabled>月</button>
            </div>
          </div>
          <div class="om-omw-trend-plot" aria-label="合法IP在线趋势图">
            <svg class="om-omw-trend-svg" viewBox="0 0 960 180" preserveAspectRatio="none" role="img" aria-hidden="true">
              <line x1="48" y1="150" x2="920" y2="150" stroke="#e4e7ed" stroke-width="1"/>
              <line x1="48" y1="20" x2="48" y2="150" stroke="#e4e7ed" stroke-width="1"/>
              <text x="8" y="154" fill="#909399" font-size="11">0</text>
              <text x="48" y="170" fill="#909399" font-size="11">02:00</text>
              <text x="168" y="170" fill="#909399" font-size="11">04:00</text>
              <text x="288" y="170" fill="#909399" font-size="11">06:00</text>
              <text x="408" y="170" fill="#909399" font-size="11">08:00</text>
              <text x="528" y="170" fill="#909399" font-size="11">10:00</text>
              <text x="648" y="170" fill="#909399" font-size="11">12:00</text>
              <text x="768" y="170" fill="#909399" font-size="11">14:00</text>
              <text x="888" y="170" fill="#909399" font-size="11">16:00</text>
              <polyline fill="none" stroke="#409eff" stroke-width="2" points="48,150 168,150 288,150 408,150 528,150 648,150 768,150 888,150 920,150"/>
            </svg>
          </div>
        </div>
        <div class="om-omw-dual-tables">
          <div class="om-omw-mini-table">
            <div class="om-split-head">合法IP</div>
            <div class="ou-table-wrap">
              <table class="ou-table">
                <thead>
                  <tr>
                    <th class="col-idx">序号</th>
                    <th class="col-user">用户</th>
                    <th class="col-conn">连接数</th>
                    <th class="col-time">上线时间</th>
                    <th class="col-remark">账号备注</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td colspan="5" class="ou-empty">无数据</td></tr>
                </tbody>
              </table>
            </div>
            <div class="ou-footer om-footer-mini">
              <div class="ou-footer-left">
                <div class="ou-pager">
                  <button type="button" class="ou-page-btn" disabled>‹</button>
                  <button type="button" class="ou-page-btn" disabled>›</button>
                </div>
              </div>
              <div class="ou-footer-right"><span>共 0 条</span></div>
            </div>
          </div>
          <div class="om-omw-mini-table">
            <div class="om-split-head">非法IP</div>
            <div class="ou-table-wrap">
              <table class="ou-table">
                <thead>
                  <tr>
                    <th class="col-idx">序号</th>
                    <th class="col-ip">IP地址</th>
                    <th class="col-conn">连接数</th>
                    <th class="col-time">上线时间</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td colspan="4" class="ou-empty">无数据</td></tr>
                </tbody>
              </table>
            </div>
            <div class="ou-footer om-footer-mini">
              <div class="ou-footer-left">
                <div class="ou-pager">
                  <button type="button" class="ou-page-btn" disabled>‹</button>
                  <button type="button" class="ou-page-btn" disabled>›</button>
                </div>
              </div>
              <div class="ou-footer-right"><span>共 0 条</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="om-omw-panel" :class="{ active: activePanel === 'illegal' }">
      <div class="ou-toolbar">
        <div class="om-omw-toolbar-left">
          <label class="tdh-filter-field">
            <span class="ou-toolbar-label">自动刷新</span>
            <select class="ou-toolbar-select" disabled>
              <option selected>10秒</option>
            </select>
          </label>
        </div>
        <div class="om-omw-toolbar-right om-omw-search-group">
          <select class="ou-toolbar-select" disabled>
            <option selected>IP地址</option>
          </select>
          <input class="ou-toolbar-input" type="text" disabled />
          <button type="button" class="ou-search-btn" disabled>搜索</button>
        </div>
      </div>
      <div class="ou-table-wrap">
        <table class="ou-table">
          <thead>
            <tr>
              <th class="col-idx">序号</th>
              <th class="col-mac">源MAC</th>
              <th class="col-ip">源IP</th>
              <th class="col-ip">目标IP</th>
              <th class="col-proto">协议</th>
              <th class="col-time">建立时间</th>
            </tr>
          </thead>
          <tbody>
            <tr><td colspan="6" class="ou-empty">无数据</td></tr>
          </tbody>
        </table>
      </div>
      <div class="ou-footer">
        <div class="ou-footer-left">
          <div class="ou-pager">
            <button type="button" class="ou-page-btn" disabled>‹</button>
            <button type="button" class="ou-page-btn" disabled>›</button>
          </div>
        </div>
        <div class="ou-footer-right">
          <label>到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页 <button type="button" class="ou-page-goto-btn" disabled>确定</button></label>
          <span>共 0 条</span>
          <label><select disabled><option selected>100 条/页</option></select></label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import './nv-shared.css'

const activePanel = ref('params')
</script>

<style scoped>
.om-omw-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 600px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
}

.om-omw-panel {
  display: none;
  flex-direction: column;
  flex: 1;
}

.om-omw-panel.active {
  display: flex;
}

.om-omw-section-card {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 16px;
  margin: 16px;
}

.om-omw-section-list {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.om-section-title {
  margin: 0 0 16px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.om-omw-hint {
  margin: 0 0 16px;
  font-size: 13px;
  color: #606266;
}

.om-omw-hint-label {
  font-weight: 600;
  color: #409eff;
}

.om-omw-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.om-form-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.om-form-label {
  min-width: 120px;
  font-size: 13px;
  color: #606266;
}

.om-form-input-sm {
  width: 100px;
}

.om-form-unit {
  font-size: 12px;
  color: #909399;
}

.om-split-head {
  padding: 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.om-omw-toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.om-omw-overview {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.om-omw-stat-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.om-omw-stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.om-omw-stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #ecf5ff;
}

.om-omw-stat-icon-user {
  background: #ecf5ff;
}

.om-omw-stat-icon-legal {
  background: #f0f9eb;
}

.om-omw-stat-icon-illegal {
  background: #fef0f0;
}

.om-omw-stat-body {
  display: flex;
  flex-direction: column;
}

.om-omw-stat-val {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
}

.om-omw-stat-label {
  font-size: 13px;
  color: #909399;
}

.om-omw-trend-card {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 16px;
}

.om-omw-trend-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.om-omw-range-toggle {
  display: flex;
  gap: 0;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.om-omw-range-btn {
  padding: 6px 16px;
  border: none;
  background: #fff;
  color: #606266;
  font-size: 13px;
  cursor: pointer;
}

.om-omw-range-btn.active {
  background: #409eff;
  color: #fff;
}

.om-omw-trend-plot {
  height: 180px;
  background: #fafafa;
  border-radius: 4px;
}

.om-omw-trend-svg {
  width: 100%;
  height: 100%;
}

.om-omw-dual-tables {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.om-omw-mini-table {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
}

.om-footer-mini {
  padding: 8px 16px;
  font-size: 12px;
}

.om-omw-search-group {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.col-check { width: 42px; text-align: center; }
.col-idx { width: 60px; text-align: center; }
.col-ip { min-width: 120px; }
.col-remark { min-width: 150px; }
.col-actions { width: 100px; text-align: center; }
.col-user { min-width: 120px; }
.col-conn { min-width: 80px; text-align: right; }
.col-time { min-width: 120px; }
.col-mac { min-width: 120px; }
.col-proto { min-width: 80px; }

.primary {
  height: 32px;
  padding: 0 20px;
  border: 1px solid #409eff;
  border-radius: 4px;
  background: #409eff;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.primary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
</style>
