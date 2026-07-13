<template>
  <div class="nvt-page">
    <div class="nvt-card">
      <div class="nvt-card-header">
        <span>配置管理</span>
      </div>
      <div class="nvt-card-body">
        <section class="sm-form-section">
          <div class="sm-form-section-head">配置导入</div>
          <p class="sm-form-desc">导入主配置文件，导入过程中，网络会暂时中断</p>
          <button type="button" class="primary" disabled title="暂未开放">☁ 导入</button>
        </section>

        <section class="sm-form-section">
          <div class="sm-form-section-head">配置导出</div>
          <p class="sm-form-desc">导出主配置文件，不包含本地账号，以及 APP 的配置</p>
          <button type="button" class="primary" disabled title="暂未开放">☁ 导出</button>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import './nv-test-shared.css'
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
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 3px solid #409eff;
}

.sm-form-desc {
  margin: 0 0 16px;
  font-size: 13px;
  color: #909399;
  line-height: 1.6;
}

button.primary {
  padding: 8px 20px;
  border-radius: 4px;
  font-size: 13px;
  cursor: not-allowed;
  background: #409eff;
  color: #fff;
  border: 1px solid #409eff;
  opacity: 0.6;
}
</style>
