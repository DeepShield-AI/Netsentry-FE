<template>
  <div class="ss-page">
    <div class="ss-card">
      <div class="ss-tabs-header">
        <div class="ss-tabs-nav">
          <button :class="['ss-tab', { active: tab === 'basic' }]" @click="tab = 'basic'">基础设置</button>
          <button :class="['ss-tab', { active: tab === 'web' }]" @click="tab = 'web'">WEB设置</button>
        </div>
      </div>

      <!-- 基础设置 -->
      <div v-show="tab === 'basic'" class="ss-body">
        <section class="ss-section">
          <div class="ss-section-head">系统名称</div>
          <div class="ss-form">
            <label class="ss-row"><span class="ss-label">系统名称</span><input class="ss-input" type="text" value="Panabit" disabled /></label>
            <button class="ss-btn-primary" disabled>提交</button>
          </div>
        </section>
        <section class="ss-section">
          <div class="ss-section-head">管理接口</div>
          <div class="ss-form">
            <label class="ss-row"><span class="ss-label">名称</span><span class="ss-static">igb0</span></label>
            <label class="ss-row"><span class="ss-label">MAC</span><span class="ss-static muted">3C:EC:EF:A3:9A:A4</span></label>
            <label class="ss-row"><span class="ss-label">IP地址</span><input class="ss-input" type="text" value="192.168.6.252" disabled /></label>
            <label class="ss-row"><span class="ss-label">子网掩码</span><input class="ss-input" type="text" value="255.255.255.0" disabled /></label>
            <label class="ss-row"><span class="ss-label">默认网关</span><input class="ss-input" type="text" value="192.168.6.1" disabled /></label>
            <label class="ss-row"><span class="ss-label">附加IP / 掩码</span><span class="ss-inline"><input class="ss-input ss-input-sm" type="text" value="0.0.0.0" disabled /><span>/</span><input class="ss-input ss-input-sm" type="text" value="0.0.0.0" disabled /></span><span class="ss-hint">管理口配置附加IP，0.0.0.0表示不配置</span></label>
            <label class="ss-row"><span class="ss-label">IPv6地址</span><input class="ss-input" type="text" value="" disabled /></label>
            <label class="ss-row"><span class="ss-label">地址前缀</span><input class="ss-input" type="text" placeholder="例：64" disabled /></label>
            <label class="ss-row"><span class="ss-label">IPv6网关</span><input class="ss-input" type="text" value="" disabled /></label>
            <button class="ss-btn-primary" disabled>提交</button>
          </div>
        </section>
        <section class="ss-section">
          <div class="ss-section-head">DNS Server</div>
          <div class="ss-form">
            <label class="ss-row"><span class="ss-label">DNS1</span><input class="ss-input" type="text" value="114.114.114.114" disabled /></label>
            <label class="ss-row"><span class="ss-label">DNS2</span><input class="ss-input" type="text" value="166.111.4.5" disabled /></label>
            <button class="ss-btn-primary" disabled>提交</button>
          </div>
        </section>
        <section class="ss-section">
          <div class="ss-section-head">系统时间</div>
          <div class="ss-form">
            <label class="ss-row"><span class="ss-label">NTP服务器</span><span class="ss-inline"><label class="ss-check"><input type="checkbox" checked disabled /> NTP对时</label><input class="ss-input" type="text" value="166.111.4.19" disabled /><button class="ss-btn-secondary" disabled>立即对时</button></span></label>
            <label class="ss-row"><span class="ss-label">系统时区</span><span class="ss-inline"><select class="ss-select" disabled><option selected>Asia</option></select><select class="ss-select" disabled><option selected>Shanghai</option></select></span></label>
            <label class="ss-row"><span class="ss-label">系统时间</span><input class="ss-input ss-input-lg" type="text" value="2026-06-18 00:35:25" disabled /></label>
            <button class="ss-btn-primary" disabled>提交</button>
          </div>
        </section>
      </div>

      <!-- WEB设置 -->
      <div v-show="tab === 'web'" class="ss-body">
        <section class="ss-section">
          <div class="ss-section-head">WEB访问</div>
          <div class="ss-form">
            <label class="ss-row"><span class="ss-label">界面闲置退出时间</span><span class="ss-inline"><input class="ss-input ss-input-sm" type="text" value="30" disabled /><span>分钟</span></span></label>
            <label class="ss-row"><span class="ss-label">界面全屏后不退出</span><select class="ss-select" disabled><option selected>否</option></select></label>
            <label class="ss-row"><span class="ss-label">登录验证码</span><select class="ss-select" disabled><option selected>登录失败后显示</option></select></label>
            <label class="ss-row"><span class="ss-label">登录失败次数</span><span class="ss-inline"><input class="ss-input ss-input-sm" type="text" value="0" disabled /><span class="ss-hint">超过后登录页面将锁定，0表示不锁定</span></span></label>
            <label class="ss-row"><span class="ss-label">WEB API接口</span><select class="ss-select" disabled><option selected>关闭</option></select></label>
            <label class="ss-row"><span class="ss-label">XSS过滤</span><select class="ss-select" disabled><option selected>关闭</option></select><span class="ss-hint">开启后无法提交&lt;'()'等字符</span></label>
            <button class="ss-btn-primary" disabled>提交</button>
          </div>
        </section>
        <section class="ss-section">
          <div class="ss-section-head">WEB服务器</div>
          <div class="ss-form">
            <label class="ss-row"><span class="ss-label">证书管理</span><span class="ss-inline"><button class="ss-link-btn" disabled>查看示例</button><button class="ss-link-btn" disabled>上传证书</button><button class="ss-link-btn" disabled>恢复默认</button></span></label>
            <label class="ss-row"><span class="ss-label">HTTPS</span><select class="ss-select" disabled><option selected>开启</option></select></label>
            <label class="ss-row"><span class="ss-label">WEB端口</span><span class="ss-inline"><input class="ss-input ss-input-sm" type="text" value="443" disabled /><span class="ss-hint">( 1 ~ 65535 )</span></span></label>
            <label class="ss-row"><span class="ss-label">HTTP读取超时时间</span><span class="ss-inline"><input class="ss-input ss-input-sm" type="text" value="60" disabled /><span class="ss-hint">秒；用于应对"缓慢HTTP拒绝服务攻击"</span></span></label>
            <button class="ss-btn-primary" disabled>提交</button>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const tab = ref<'basic' | 'web'>('basic')
</script>

<style scoped>
.ss-page { padding: 0 4px; }
.ss-card {
  background: #fff; border-radius: 6px; border: 1px solid #e8e8e8;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06); overflow: hidden;
}
.ss-tabs-header {
  display: flex; align-items: center; padding: 0 20px; border-bottom: 1px solid #f0f0f0;
}
.ss-tabs-nav { display: flex; }
.ss-tab {
  padding: 12px 20px; border: none; background: none; font-size: 14px; font-weight: 500;
  color: #606266; cursor: pointer; border-bottom: 2px solid transparent;
}
.ss-tab.active { color: #1890ff; border-bottom-color: #1890ff; }
.ss-tab:hover:not(.active) { color: #303133; }

.ss-body { padding: 20px; }
.ss-section { margin-bottom: 28px; }
.ss-section-head {
  font-size: 14px; font-weight: 600; color: #303133;
  padding-bottom: 10px; margin-bottom: 16px; border-bottom: 1px solid #f0f0f0;
}
.ss-form { max-width: 640px; }
.ss-row {
  display: flex; align-items: center; gap: 12px; margin-bottom: 14px;
}
.ss-label { width: 140px; flex-shrink: 0; font-size: 13px; color: #606266; text-align: right; }
.ss-input {
  height: 32px; padding: 0 10px; border: 1px solid #d9d9d9; border-radius: 4px;
  font-size: 13px; color: #303133; background: #fafafa; width: 220px;
}
.ss-input-sm { width: 100px; }
.ss-input-lg { width: 300px; }
.ss-select {
  height: 32px; padding: 0 8px; border: 1px solid #d9d9d9; border-radius: 4px;
  font-size: 13px; color: #303133; background: #fafafa;
}
.ss-static { font-size: 13px; color: #303133; }
.ss-static.muted { color: #909399; }
.ss-inline { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.ss-hint { font-size: 12px; color: #909399; }
.ss-check { display: flex; align-items: center; gap: 4px; font-size: 13px; color: #606266; }

.ss-btn-primary {
  margin-top: 8px; padding: 7px 20px; background: #1890ff; color: #fff;
  border: none; border-radius: 4px; font-size: 13px; cursor: not-allowed; opacity: 0.6;
}
.ss-btn-secondary {
  padding: 5px 12px; background: #fff; color: #303133;
  border: 1px solid #d9d9d9; border-radius: 4px; font-size: 12px; cursor: not-allowed; opacity: 0.6;
}
.ss-link-btn { background: none; border: none; color: #409eff; font-size: 13px; cursor: not-allowed; opacity: 0.6; }
</style>
