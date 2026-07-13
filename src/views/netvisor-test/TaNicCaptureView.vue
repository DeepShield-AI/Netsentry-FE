<template>
  <div class="nv-page">
    <el-card shadow="never">
      <template #header><div class="card-header"><span>网卡抓包</span></div></template>
      <el-empty description="网卡抓包配置 — 开发中">
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
