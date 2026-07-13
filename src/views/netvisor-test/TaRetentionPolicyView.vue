<template>
  <div class="nv-page">
    <el-card shadow="never">
      <template #header><div class="card-header"><span>数据留存策略</span></div></template>
      <el-empty description="留存策略配置 — 开发中">
        <template #image><el-icon :size="64" color="#c0c4cc"><Setting /></el-icon></template>
      </el-empty>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { Setting } from '@element-plus/icons-vue'
import './nv-shared.css'
</script>

<style scoped>
.card-header { display: flex; align-items: center; justify-content: space-between; }
</style>
