<template>
  <div class="ls-page">
    <div class="ls-card">
      <div class="ls-card-head"><span class="ls-card-title">日志设置</span></div>
      <div class="ls-body">
        <section class="ls-section">
          <div class="ls-section-head">日志设置</div>
          <table class="ls-table">
            <thead>
              <tr><th style="width:60px">端口</th><th>日志类型</th><th>IP</th><th>端口</th><th>发送成功数</th><th>发送失败数</th><th>操作</th></tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in logItems" :key="idx">
                <td>{{ idx + 1 }}</td>
                <td>{{ item.type }}</td>
                <td>{{ item.ip }}</td>
                <td class="num">{{ item.port }}</td>
                <td class="num">{{ item.success.toLocaleString() }}</td>
                <td class="num">{{ item.fail }}</td>
                <td><button class="ls-link-btn" disabled>编辑</button></td>
              </tr>
            </tbody>
          </table>
        </section>
        <section class="ls-section">
          <div class="ls-section-head">设备编号</div>
          <div class="ls-form">
            <label class="ls-row">
              <span class="ls-label">兼容编号</span>
              <span class="ls-inline"><input class="ls-input ls-input-sm" type="text" value="0" disabled /><span class="ls-hint">0 ~ 65535</span></span>
            </label>
            <button class="ls-btn-primary" disabled>提交</button>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const logItems = [
  { type: '跨境日志', ip: '0.0.0.0', port: 0, success: 0, fail: 0 },
  { type: '被动域名', ip: '0.0.0.0', port: 0, success: 0, fail: 0 },
  { type: '会话日志', ip: '0.0.0.0', port: 0, success: 48764683564, fail: 0 },
  { type: 'DNS隧道', ip: '0.0.0.0', port: 0, success: 0, fail: 0 },
  { type: '流量日志', ip: '127.0.0.1', port: 8000, success: 918544652, fail: 0 },
]
</script>

<style scoped>
.ls-page { padding: 0 4px; }
.ls-card {
  background: #fff; border-radius: 6px; border: 1px solid #e8e8e8;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06); overflow: hidden;
}
.ls-card-head { display: flex; align-items: center; padding: 14px 20px; border-bottom: 1px solid #f0f0f0; }
.ls-card-title { font-size: 15px; font-weight: 600; color: #303133; }
.ls-body { padding: 20px; }

.ls-section { margin-bottom: 28px; }
.ls-section-head {
  font-size: 14px; font-weight: 600; color: #303133;
  padding-bottom: 10px; margin-bottom: 16px; border-bottom: 1px solid #f0f0f0;
}

.ls-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 12px; }
.ls-table th {
  text-align: left; padding: 10px 12px; background: #fafafa;
  color: #606266; font-weight: 600; border-bottom: 1px solid #ebeef5; white-space: nowrap;
}
.ls-table td { padding: 9px 12px; border-bottom: 1px solid #f0f0f0; color: #303133; }
.ls-table tbody tr:hover { background: #f5f7fa; }
.ls-table .num { font-variant-numeric: tabular-nums; text-align: right; }

.ls-form { max-width: 400px; }
.ls-row { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
.ls-label { width: 80px; flex-shrink: 0; font-size: 13px; color: #606266; text-align: right; }
.ls-inline { display: flex; align-items: center; gap: 8px; }
.ls-input {
  height: 32px; padding: 0 10px; border: 1px solid #d9d9d9; border-radius: 4px;
  font-size: 13px; color: #303133; background: #fafafa; width: 180px;
}
.ls-input-sm { width: 80px; }
.ls-hint { font-size: 12px; color: #909399; }
.ls-link-btn { background: none; border: none; color: #409eff; font-size: 13px; cursor: not-allowed; opacity: 0.6; }
.ls-btn-primary {
  margin-top: 8px; padding: 7px 20px; background: #1890ff; color: #fff;
  border: none; border-radius: 4px; font-size: 13px; cursor: not-allowed; opacity: 0.6;
}
</style>
