<template>
  <div class="stat-card">
    <div class="stat-icon-wrap" :style="iconBgStyle">
      <el-icon v-if="icon" class="stat-icon" :style="{ color: tone }">
        <component :is="icon" />
      </el-icon>
    </div>
    <div class="stat-body">
      <span class="stat-label">{{ label }}</span>
      <div class="stat-value mono">{{ value }}</div>
      <div v-if="sub" class="stat-sub">{{ sub }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label: string
  value: string
  sub?: string
  icon?: unknown
  tone?: string
}>()

const iconBgStyle = computed(() => {
  const c = props.tone || '#6366f1'
  return { background: `${c}12` }
})
</script>

<style scoped>
.stat-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 18px;
  border-radius: var(--sg-card-radius, 6px);
  border: 1px solid var(--sg-card-border, #e8e8e8);
  background: var(--sg-card-bg, #ffffff);
  box-shadow: var(--sg-card-shadow, 0 1px 4px rgba(0,0,0,0.06));
}
.stat-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 8px;
  flex-shrink: 0;
}
.stat-icon {
  font-size: 20px;
}
.stat-body {
  min-width: 0;
  flex: 1;
}
.stat-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--sg-text-secondary, #475569);
  letter-spacing: 0.02em;
}
.stat-value {
  font-size: 24px;
  font-weight: 700;
  margin-top: 4px;
  color: var(--sg-text, #1e293b);
  line-height: 1.2;
  letter-spacing: -0.02em;
}
.stat-sub {
  margin-top: 4px;
  font-size: 12px;
  color: var(--sg-text-muted, #94a3b8);
  font-weight: 400;
}
</style>
