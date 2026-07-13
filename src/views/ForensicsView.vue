<template>
  <div class="forensics-page">
    <!-- Tab navigation integrated with the app's design -->
    <div class="forensics-tabs">
      <button
        v-for="t in tabs"
        :key="t.id"
        class="tab-item"
        :class="{ active: tab === t.id }"
        @click="switchTab(t.id)"
      >{{ t.label }}</button>
    </div>

    <!-- Tab content -->
    <div class="forensics-body">
      <HuntView v-if="tab === 'sessions'" />
      <SpiViewTab v-else-if="tab === 'spiview'" />
      <SpiGraphTab v-else-if="tab === 'spigraph'" />
      <ConnectionsTab v-else-if="tab === 'connections'" />
      <TrafficStorageView v-else-if="tab === 'files'" />
      <StatsTab v-else-if="tab === 'stats'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HuntView from '@/views/HuntView.vue'
import SpiViewTab from '@/views/forensics/SpiViewTab.vue'
import SpiGraphTab from '@/views/forensics/SpiGraphTab.vue'
import ConnectionsTab from '@/views/forensics/ConnectionsTab.vue'
import TrafficStorageView from '@/views/TrafficStorageView.vue'
import StatsTab from '@/views/forensics/StatsTab.vue'

const route = useRoute()
const router = useRouter()

interface Tab { id: string; label: string }
const tabs: Tab[] = [
  { id: 'sessions', label: '会话' },
  { id: 'spiview', label: 'SPI 视图' },
  { id: 'spigraph', label: 'SPI 图' },
  { id: 'connections', label: '连接' },
  { id: 'files', label: '文件' },
  { id: 'stats', label: '统计' },
]

type TabName = 'sessions' | 'spiview' | 'spigraph' | 'connections' | 'files' | 'stats'
const validTab = (v: unknown): v is TabName => tabs.some(t => t.id === v)
const tab = ref<TabName>(validTab(route.query.tab) ? (route.query.tab as TabName) : 'sessions')

function switchTab(id: string) {
  if (validTab(id)) {
    tab.value = id
    void router.replace({ query: { ...route.query, tab: id } })
  }
}

watch(() => route.query.tab, (v) => {
  if (validTab(v) && v !== tab.value) tab.value = v as TabName
})
</script>

<style scoped>
.forensics-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

/* ── Tab bar — blends with the app's content area ──────────────────── */
.forensics-tabs {
  display: flex;
  align-items: stretch;
  gap: 0;
  background: #fff;
  border-bottom: 1px solid var(--el-border-color-light, #e4e7ed);
  padding: 0 16px;
  flex-shrink: 0;
}
.tab-item {
  position: relative;
  padding: 10px 16px;
  border: none;
  background: none;
  color: var(--el-text-color-regular, #606266);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s;
  white-space: nowrap;
}
.tab-item:hover {
  color: var(--el-color-primary, #409eff);
}
.tab-item.active {
  color: var(--el-color-primary, #409eff);
  font-weight: 600;
}
.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 16px;
  right: 16px;
  height: 2px;
  background: var(--el-color-primary, #409eff);
  border-radius: 1px;
}

/* ── Body ──────────────────────────────────────────────────────────── */
.forensics-body {
  flex: 1;
  overflow: auto;
  background: var(--sg-content-bg, #f5f7fa);
}
</style>
