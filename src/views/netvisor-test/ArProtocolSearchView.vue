<template>
  <div class="nvt-page">
    <div class="ou-toolbar ar-toolbar ar-ps-toolbar">
      <input
        class="ou-toolbar-input ar-ps-search"
        type="search"
        placeholder="请输入协议名称关键字进行搜索"
        disabled
      />
      <button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button>
    </div>
    <div class="ar-ps-empty" aria-live="polite">请输入协议名称关键字进行搜索</div>
  </div>
</template>

<script setup lang="ts">
import './nv-test-shared.css'
</script>

<style scoped>
.ar-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.ar-ps-toolbar {
  justify-content: center;
}

.ar-ps-search {
  min-width: 400px;
  text-align: center;
}

.ou-toolbar-input {
  padding: 6px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
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

.ar-ps-empty {
  text-align: center;
  padding: 80px 0;
  color: #909399;
  font-size: 14px;
}
</style>
