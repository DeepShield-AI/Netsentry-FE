<template>
  <div class="nvt-page">
    <div class="nvt-card">
      <div class="nvt-card-header">
        <div class="nv-tabs-nav" role="tablist">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            class="nvt-tab"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key"
          >{{ tab.label }}</button>
        </div>
      </div>
      <div class="nvt-card-body">
        <!-- 基础设置面板 -->
        <div v-show="activeTab === 'basic'">
          <section class="sm-form-section">
            <div class="sm-form-section-head">系统名称</div>
            <form class="sm-form" @submit.prevent>
              <label class="om-form-row">
                <span class="om-form-label">系统名称</span>
                <input class="ou-toolbar-input sm-form-input" type="text" value="Panabit" disabled />
              </label>
              <button type="button" class="primary" disabled title="暂未开放">提交</button>
            </form>
          </section>

          <section class="sm-form-section">
            <div class="sm-form-section-head">管理接口</div>
            <form class="sm-form" @submit.prevent>
              <label class="om-form-row">
                <span class="om-form-label">名称</span>
                <span class="sm-form-static">igb0</span>
              </label>
              <label class="om-form-row">
                <span class="om-form-label">MAC</span>
                <span class="sm-form-static muted">3C:EC:EF:A3:9A:A4</span>
              </label>
              <label class="om-form-row">
                <span class="om-form-label">IP 地址</span>
                <input class="ou-toolbar-input sm-form-input" type="text" value="192.168.6.252" disabled />
              </label>
              <label class="om-form-row">
                <span class="om-form-label">子网掩码</span>
                <input class="ou-toolbar-input sm-form-input" type="text" value="255.255.255.0" disabled />
              </label>
              <label class="om-form-row">
                <span class="om-form-label">默认网关</span>
                <input class="ou-toolbar-input sm-form-input" type="text" value="192.168.6.1" disabled />
              </label>
              <label class="om-form-row">
                <span class="om-form-label">附加 IP / 掩码</span>
                <span class="sm-form-inline">
                  <input class="ou-toolbar-input sm-form-input sm-form-input-sm" type="text" value="0.0.0.0" disabled />
                  <span>/</span>
                  <input class="ou-toolbar-input sm-form-input sm-form-input-sm" type="text" value="0.0.0.0" disabled />
                </span>
                <span class="om-form-hint">管理口配置附加 IP，0.0.0.0 表示不配置</span>
              </label>
              <label class="om-form-row">
                <span class="om-form-label">IPv6 地址</span>
                <input class="ou-toolbar-input sm-form-input" type="text" value="" disabled />
              </label>
              <label class="om-form-row">
                <span class="om-form-label">地址前缀</span>
                <input class="ou-toolbar-input sm-form-input" type="text" placeholder="例：64" disabled />
              </label>
              <label class="om-form-row">
                <span class="om-form-label">IPv6 网关</span>
                <input class="ou-toolbar-input sm-form-input" type="text" value="" disabled />
              </label>
              <button type="button" class="primary" disabled title="暂未开放">提交</button>
            </form>
          </section>

          <section class="sm-form-section">
            <div class="sm-form-section-head">DNS Server</div>
            <form class="sm-form" @submit.prevent>
              <label class="om-form-row">
                <span class="om-form-label">DNS1</span>
                <input class="ou-toolbar-input sm-form-input" type="text" value="114.114.114.114" disabled />
              </label>
              <label class="om-form-row">
                <span class="om-form-label">DNS2</span>
                <input class="ou-toolbar-input sm-form-input" type="text" value="166.111.4.5" disabled />
              </label>
              <button type="button" class="primary" disabled title="暂未开放">提交</button>
            </form>
          </section>

          <section class="sm-form-section">
            <div class="sm-form-section-head">系统时间</div>
            <form class="sm-form" @submit.prevent>
              <label class="om-form-row">
                <span class="om-form-label">NTP 服务器</span>
                <span class="sm-form-inline">
                  <label class="sm-check">
                    <input type="checkbox" checked disabled /> NTP 对时
                  </label>
                  <input class="ou-toolbar-input sm-form-input" type="text" value="166.111.4.19" disabled />
                  <button type="button" class="secondary" disabled title="暂未开放">立即对时</button>
                </span>
              </label>
              <label class="om-form-row">
                <span class="om-form-label">系统时区</span>
                <span class="sm-form-inline">
                  <select class="ou-toolbar-select" disabled>
                    <option selected>Asia</option>
                  </select>
                  <select class="ou-toolbar-select" disabled>
                    <option selected>Shanghai</option>
                  </select>
                </span>
              </label>
              <label class="om-form-row">
                <span class="om-form-label">系统时间</span>
                <input class="ou-toolbar-input sm-form-input sm-form-input-lg" type="text" value="2026-06-18 00:35:25" disabled />
              </label>
              <button type="button" class="primary" disabled title="暂未开放">提交</button>
            </form>
          </section>
        </div>

        <!-- WEB 设置面板 -->
        <div v-show="activeTab === 'web'">
          <section class="sm-form-section">
            <div class="sm-form-section-head">WEB 访问</div>
            <form class="sm-form" @submit.prevent>
              <label class="om-form-row">
                <span class="om-form-label">界面闲置退出时间</span>
                <span class="sm-form-inline">
                  <input class="ou-toolbar-input sm-form-input sm-form-input-sm" type="text" value="30" disabled />
                  <span>分钟</span>
                </span>
              </label>
              <label class="om-form-row">
                <span class="om-form-label">界面全屏后不退出</span>
                <select class="ou-toolbar-select" disabled>
                  <option selected>否</option>
                </select>
              </label>
              <label class="om-form-row">
                <span class="om-form-label">登录验证码</span>
                <select class="ou-toolbar-select" disabled>
                  <option selected>登录失败后显示</option>
                </select>
              </label>
              <label class="om-form-row">
                <span class="om-form-label">登录失败次数</span>
                <span class="sm-form-inline">
                  <input class="ou-toolbar-input sm-form-input sm-form-input-sm" type="text" value="0" disabled />
                  <span class="om-form-hint">超过后登录页面将锁定，0 表示不锁定</span>
                </span>
              </label>
              <label class="om-form-row">
                <span class="om-form-label">WEB API 接口</span>
                <select class="ou-toolbar-select" disabled>
                  <option selected>关闭</option>
                </select>
              </label>
              <label class="om-form-row">
                <span class="om-form-label">XSS 过滤</span>
                <select class="ou-toolbar-select" disabled>
                  <option selected>关闭</option>
                </select>
                <span class="om-form-hint">开启后无法提交&lt;'()'等字符</span>
              </label>
              <button type="button" class="primary" disabled title="暂未开放">提交</button>
            </form>
          </section>

          <section class="sm-form-section">
            <div class="sm-form-section-head">WEB 服务器</div>
            <form class="sm-form" @submit.prevent>
              <label class="om-form-row">
                <span class="om-form-label">证书管理</span>
                <span class="sm-form-inline">
                  <button type="button" class="link-btn" disabled title="暂未开放">查看示例</button>
                  <button type="button" class="link-btn" disabled title="暂未开放">上传证书</button>
                  <button type="button" class="link-btn" disabled title="暂未开放">恢复默认</button>
                </span>
              </label>
              <label class="om-form-row">
                <span class="om-form-label">HTTPS</span>
                <select class="ou-toolbar-select" disabled>
                  <option selected>开启</option>
                </select>
              </label>
              <label class="om-form-row">
                <span class="om-form-label">WEB 端口</span>
                <span class="sm-form-inline">
                  <input class="ou-toolbar-input sm-form-input sm-form-input-sm" type="text" value="443" disabled />
                  <span class="om-form-hint">( 1 ~ 65535 )</span>
                </span>
              </label>
              <label class="om-form-row">
                <span class="om-form-label">HTTP 读取超时时间</span>
                <span class="sm-form-inline">
                  <input class="ou-toolbar-input sm-form-input sm-form-input-sm" type="text" value="60" disabled />
                  <span class="om-form-hint">秒；用于应对"缓慢 HTTP 拒绝服务攻击"。一般不建议修改！</span>
                </span>
              </label>
              <button type="button" class="primary" disabled title="暂未开放">提交</button>
            </form>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import './nv-test-shared.css'

const tabs = [
  { key: 'basic', label: '基础设置' },
  { key: 'web', label: 'WEB 设置' }
]
const activeTab = ref('basic')
</script>

<style scoped>
.sm-form-section {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.sm-form-section:last-child {
  border-bottom: none;
}

.sm-form-section-head {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-left: 8px;
  border-left: 3px solid #409eff;
}

.sm-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.om-form-row {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
}

.om-form-label {
  flex-shrink: 0;
  width: 140px;
  text-align: right;
  color: #606266;
}

.sm-form-static {
  color: #303133;
}

.sm-form-static.muted {
  color: #909399;
}

.sm-form-inline {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.ou-toolbar-input {
  padding: 6px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
}

.sm-form-input {
  flex: 1;
  max-width: 300px;
}

.sm-form-input-sm {
  max-width: 120px;
}

.sm-form-input-lg {
  max-width: 200px;
}

.ou-toolbar-select {
  padding: 6px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
  background: #fff;
}

.om-form-hint {
  font-size: 12px;
  color: #909399;
  margin-left: 4px;
}

.sm-check {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

button.primary, button.secondary {
  align-self: flex-end;
  padding: 8px 20px;
  border-radius: 4px;
  font-size: 13px;
  cursor: not-allowed;
  border: 1px solid #dcdfe6;
  background: #f5f7fa;
  color: #909399;
}

button.primary {
  background: #409eff;
  color: #fff;
  border-color: #409eff;
  opacity: 0.6;
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
</style>
