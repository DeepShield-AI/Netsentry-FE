<template>
  <div class="snmp-page">
    <div class="snmp-card">
      <div class="snmp-card-head">
        <span class="snmp-card-title">SNMP服务</span>
      </div>
      <div class="snmp-body">
        <!-- 常用OID -->
        <section class="snmp-section">
          <div class="snmp-section-head">常用OID</div>
          <ul class="snmp-oid-list">
            <li v-for="oid in oids" :key="oid.label">
              <span class="snmp-oid-label">{{ oid.label }}</span>
              <span class="snmp-oid-val">{{ oid.value }}</span>
            </li>
          </ul>
          <button class="snmp-link-btn" disabled>More</button>
        </section>

        <!-- 参数设置 -->
        <section class="snmp-section">
          <div class="snmp-section-head">参数设置</div>
          <div class="snmp-form">
            <label class="snmp-row">
              <span class="snmp-label">SNMP服务</span>
              <span class="snmp-switch"><span class="snmp-switch-inner">关闭</span></span>
            </label>
            <label class="snmp-row"><span class="snmp-label">支持版本</span><select class="snmp-select" disabled><option selected>同时支持v1/v2c/v3版本</option></select></label>
            <label class="snmp-row"><span class="snmp-label">SNMP端口</span><input class="snmp-input snmp-input-sm" type="text" value="161" disabled /></label>
            <label class="snmp-row"><span class="snmp-label">服务白名单</span><input class="snmp-input snmp-input-lg" type="text" value="" disabled /><span class="snmp-hint">格式：x.x.x.x 或 x.x.x.x/y，多个IP用逗号分隔</span></label>
            <label class="snmp-row"><span class="snmp-label">服务团体名</span><input class="snmp-input" type="text" value="panabit" disabled /></label>
            <label class="snmp-row"><span class="snmp-label">用户名</span><input class="snmp-input" type="text" value="" disabled /></label>
            <label class="snmp-row"><span class="snmp-label">认证模式</span><select class="snmp-select" disabled><option selected>MD5</option></select></label>
            <label class="snmp-row"><span class="snmp-label">认证密码</span><input class="snmp-input" type="password" value="" disabled /></label>
            <label class="snmp-row"><span class="snmp-label">加密模式</span><select class="snmp-select" disabled><option selected>AES</option></select></label>
            <label class="snmp-row"><span class="snmp-label">加密密码</span><input class="snmp-input" type="password" value="" disabled /></label>
            <button class="snmp-btn-primary" disabled>提交</button>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const oids = [
  { label: '系统信息', value: '1.3.6.1.2.1.1' },
  { label: '网络接口', value: '1.3.6.1.2.1.2' },
  { label: '内存及磁盘', value: '1.3.6.1.2.1.25' },
  { label: 'CPU', value: '.1.3.6.1.4.1.2021.11' },
]
</script>

<style scoped>
.snmp-page { padding: 0 4px; }
.snmp-card {
  background: #fff; border-radius: 6px; border: 1px solid #e8e8e8;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06); overflow: hidden;
}
.snmp-card-head {
  display: flex; align-items: center; padding: 14px 20px; border-bottom: 1px solid #f0f0f0;
}
.snmp-card-title { font-size: 15px; font-weight: 600; color: #303133; }
.snmp-body { padding: 20px; }

.snmp-section { margin-bottom: 28px; }
.snmp-section-head {
  font-size: 14px; font-weight: 600; color: #303133;
  padding-bottom: 10px; margin-bottom: 16px; border-bottom: 1px solid #f0f0f0;
}

.snmp-oid-list { list-style: none; padding: 0; margin: 0 0 12px; }
.snmp-oid-list li {
  display: flex; align-items: center; gap: 16px; padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}
.snmp-oid-label { width: 100px; font-size: 13px; color: #606266; font-weight: 500; }
.snmp-oid-val { font-size: 13px; color: #303133; font-family: monospace; }

.snmp-link-btn { background: none; border: none; color: #409eff; font-size: 13px; cursor: not-allowed; opacity: 0.6; }

.snmp-form { max-width: 640px; }
.snmp-row {
  display: flex; align-items: center; gap: 12px; margin-bottom: 14px;
}
.snmp-label { width: 120px; flex-shrink: 0; font-size: 13px; color: #606266; text-align: right; }
.snmp-input {
  height: 32px; padding: 0 10px; border: 1px solid #d9d9d9; border-radius: 4px;
  font-size: 13px; color: #303133; background: #fafafa; width: 220px;
}
.snmp-input-sm { width: 100px; }
.snmp-input-lg { width: 320px; }
.snmp-select {
  height: 32px; padding: 0 8px; border: 1px solid #d9d9d9; border-radius: 4px;
  font-size: 13px; color: #303133; background: #fafafa;
}
.snmp-hint { font-size: 12px; color: #909399; }
.snmp-switch {
  display: inline-flex; align-items: center; padding: 4px 12px;
  background: #f5f5f5; border: 1px solid #d9d9d9; border-radius: 12px;
  font-size: 12px; color: #909399; cursor: not-allowed;
}
.snmp-btn-primary {
  margin-top: 8px; padding: 7px 20px; background: #1890ff; color: #fff;
  border: none; border-radius: 4px; font-size: 13px; cursor: not-allowed; opacity: 0.6;
}
</style>
