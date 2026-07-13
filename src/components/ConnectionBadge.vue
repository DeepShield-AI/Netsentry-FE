<template>
  <div class="conn-badge" :class="cls">
    <span class="dot"></span>
    <span class="label">{{ label }}</span>
    <el-tooltip v-if="store.lastError" :content="store.lastError" placement="right">
      <el-icon class="info"><WarningFilled /></el-icon>
    </el-tooltip>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProbeStore } from '@/stores/probe'

const store = useProbeStore()

const label = computed(() => {
  switch (store.connState) {
    case 'connected':
      return 'Connected'
    case 'connecting':
      return 'Connecting…'
    case 'error':
      return 'Disconnected'
    default:
      return 'Idle'
  }
})

const cls = computed(() => `state-${store.connState}`)
</script>

<style scoped>
.conn-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--sg-text-muted, #909399);
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #c0c4cc;
  flex-shrink: 0;
}
.state-connected .dot {
  background: #52c41a;
  box-shadow: 0 0 4px rgba(82, 196, 26, 0.4);
}
.state-connecting .dot {
  background: #faad14;
  animation: pulse 1.2s infinite;
}
.state-error .dot {
  background: #ff4d4f;
}
.state-connected .label {
  color: var(--sg-text-secondary, #606266);
}
.state-error .label {
  color: #ff4d4f;
}
.info {
  font-size: 14px;
  color: #fbbf24;
  cursor: help;
}
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
