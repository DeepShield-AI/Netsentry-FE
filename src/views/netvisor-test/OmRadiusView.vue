<template>
  <div class="om-radius-page">
    <section class="om-radius-section">
      <h3 class="om-section-title">参数设置</h3>
      <form class="om-radius-form" onsubmit="return false">
        <label class="om-form-row">
          <span class="om-form-label">Radius服务</span>
          <button type="button" class="ti-switch" disabled aria-pressed="false">
            <span class="ti-switch-core">
              <span class="ti-switch-inner">禁用</span>
              <span class="ti-switch-action" aria-hidden="true"></span>
            </span>
          </button>
        </label>
        <label class="om-form-row">
          <span class="om-form-label">NAS标识</span>
          <input class="ou-toolbar-input" type="text" value="Panabit" disabled />
        </label>
        <label class="om-form-row">
          <span class="om-form-label">计费发送间隔</span>
          <input class="ou-toolbar-input om-form-input-sm" type="text" value="300" disabled />
          <span class="om-form-unit">秒</span>
        </label>
        <label class="om-form-row">
          <span class="om-form-label">响应等待时间</span>
          <input class="ou-toolbar-input om-form-input-sm" type="text" value="10" disabled />
          <span class="om-form-hint">秒，超过此时间的RADIUS应答将被丢弃</span>
        </label>
        <button type="button" class="primary" disabled title="暂未开放">确定</button>
      </form>
    </section>
    <section class="om-radius-section om-radius-list-section">
      <h3 class="om-section-title">服务列表</h3>
      <div class="ou-toolbar">
        <label class="tdh-filter-field">
          <span class="ou-toolbar-label">自动刷新</span>
          <select class="ou-toolbar-select" disabled>
            <option selected>10 秒</option>
          </select>
        </label>
        <input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled />
        <button type="button" class="ou-search-btn" disabled>搜索</button>
        <div class="om-radius-toolbar-right">
          <button type="button" class="link-btn" disabled>🗑 删除</button>
          <button type="button" class="link-btn" disabled>+ 添加</button>
        </div>
      </div>
      <div class="ou-table-wrap">
        <table class="ou-table">
          <thead>
            <tr>
              <th class="col-check"><input type="checkbox" disabled aria-label="全选" /></th>
              <th class="col-id">ID</th>
              <th class="col-name">名称</th>
              <th class="col-ip">IP地址</th>
              <th class="col-status">状态</th>
              <th class="col-port">认证端口</th>
              <th class="col-port">计费端口</th>
              <th class="col-secret">共享密钥</th>
              <th class="col-domain">RAAS域名</th>
              <th class="col-route">主路由线路</th>
              <th class="col-route">备份线路</th>
              <th class="col-stat">认证(请求/超时/拒绝)</th>
              <th class="col-stat">计费(请求/超时)</th>
              <th class="col-route-num">路线</th>
              <th class="col-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="col-check"><input type="checkbox" disabled /></td>
              <td class="col-id">0</td>
              <td class="col-name"><button type="button" class="link-btn" disabled>DefaultRadius</button></td>
              <td class="col-ip">0.0.0.0</td>
              <td class="col-status"><span class="om-status-bad" aria-label="异常">✕</span></td>
              <td class="col-port">1812</td>
              <td class="col-port">1813</td>
              <td class="col-secret">panabit</td>
              <td class="col-domain">0</td>
              <td class="col-route"></td>
              <td class="col-route"></td>
              <td class="col-stat">0/0/0</td>
              <td class="col-stat">0/0</td>
              <td class="col-route-num">0</td>
              <td class="col-actions">
                <button type="button" class="link-btn" disabled>✎</button>
                <button type="button" class="link-btn" disabled>🗑</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import './nv-shared.css'
</script>

<style scoped>
.om-radius-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  height: 100%;
  min-height: 600px;
  background: #f5f7fa;
}

.om-radius-section {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 16px;
}

.om-section-title {
  margin: 0 0 16px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.om-radius-form {
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

.om-form-unit,
.om-form-hint {
  font-size: 12px;
  color: #909399;
}

.om-radius-list-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.om-radius-toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.col-check { width: 42px; text-align: center; }
.col-id { width: 60px; }
.col-name { min-width: 150px; }
.col-ip { min-width: 120px; }
.col-status { width: 80px; }
.col-port { width: 80px; }
.col-secret { min-width: 100px; }
.col-domain { min-width: 100px; }
.col-route { min-width: 100px; }
.col-stat { min-width: 120px; }
.col-route-num { width: 80px; }
.col-actions { width: 100px; text-align: center; }

.om-status-bad {
  color: #f56c6c;
  font-weight: 600;
}

.ti-switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 60px;
  height: 24px;
  border-radius: 12px;
  background: #dcdfe6;
  cursor: pointer;
  transition: all 0.3s;
}

.ti-switch-core {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 8px;
  font-size: 12px;
  color: #fff;
}

.ti-switch-inner {
  font-size: 12px;
}

.ti-switch-action {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.3s;
}

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
