<template>
  <div class="cm-page">
    <div class="cm-card">
      <div class="cm-card-head"><span class="cm-card-title">配置管理</span></div>
      <div class="cm-body">
        <section class="cm-section">
          <div class="cm-section-head">配置导入</div>
          <p class="cm-desc">导入主配置文件，导入过程中，网络会暂时中断</p>
          <button class="cm-btn-primary" disabled>☁ 导入</button>
        </section>
        <section class="cm-section">
          <div class="cm-section-head">配置导出</div>
          <p class="cm-desc">导出主配置文件，不包含本地账号，以及APP的配置</p>
          <button class="cm-btn-primary" disabled>☁ 导出</button>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.cm-page { padding: 0 4px; }
.cm-card {
  background: #fff; border-radius: 6px; border: 1px solid #e8e8e8;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06); overflow: hidden;
}
.cm-card-head { display: flex; align-items: center; padding: 14px 20px; border-bottom: 1px solid #f0f0f0; }
.cm-card-title { font-size: 15px; font-weight: 600; color: #303133; }
.cm-body { padding: 20px; }

.cm-section { margin-bottom: 28px; }
.cm-section-head {
  font-size: 14px; font-weight: 600; color: #303133;
  padding-bottom: 10px; margin-bottom: 12px; border-bottom: 1px solid #f0f0f0;
}
.cm-desc { font-size: 13px; color: #606266; margin-bottom: 12px; }
.cm-btn-primary {
  padding: 7px 20px; background: #1890ff; color: #fff;
  border: none; border-radius: 4px; font-size: 13px; cursor: not-allowed; opacity: 0.6;
}
</style>
