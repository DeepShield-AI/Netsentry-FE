<template>
  <div class="nvt-page">
    <div class="nvt-card">
      <div class="nvt-card-header">
        <span>{{ pageTitle }}</span>
      </div>
      <div class="nvt-card-body" style="padding: 40px; text-align: center; color: #909399;">
        <div style="font-size: 48px; margin-bottom: 16px;">📋</div>
        <div style="font-size: 16px; margin-bottom: 8px;">{{ pageTitle }}</div>
        <div style="font-size: 13px;">页面开发中，敬请期待...</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import './nv-test-shared.css'

const route = useRoute()
const pageTitle = computed(() => (route.meta?.title as string) ?? '页面')
</script>
