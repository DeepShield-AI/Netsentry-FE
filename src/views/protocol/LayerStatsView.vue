<template>
  <div class="page">
    <el-tabs v-model="activeTab" type="border-card" class="layer-tabs">
      <el-tab-pane label="链路层" name="link">
        <LinkLayerView v-if="activeTab === 'link'" />
      </el-tab-pane>
      <el-tab-pane label="网络层" name="network">
        <NetworkLayerView v-if="activeTab === 'network'" />
      </el-tab-pane>
      <el-tab-pane label="传输层" name="transport">
        <TransportLayerView v-if="activeTab === 'transport'" />
      </el-tab-pane>
      <el-tab-pane label="应用层" name="application">
        <ApplicationLayerView v-if="activeTab === 'application'" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LinkLayerView from './LinkLayerView.vue'
import NetworkLayerView from './NetworkLayerView.vue'
import TransportLayerView from './TransportLayerView.vue'
import ApplicationLayerView from './ApplicationLayerView.vue'

const route = useRoute()
const router = useRouter()

// Use 'layer' query param (not 'tab') to avoid conflict with
// sub-views that use route.query.tab internally.
const validLayers = ['link', 'network', 'transport', 'application']

function resolveLayer(): string {
  const q = route.query.layer as string
  if (q && validLayers.includes(q)) return q
  return 'link'
}

const activeTab = ref(resolveLayer())

watch(activeTab, (layer) => {
  router.replace({ path: '/nv/pq-layer-stats', query: { layer } })
})

watch(() => route.query.layer, () => {
  const l = resolveLayer()
  if (l !== activeTab.value) activeTab.value = l
})
</script>

<style scoped>
.layer-tabs {
  border: none;
  background: transparent;
}
.layer-tabs :deep(.el-tabs__content) {
  padding: 0;
}
.layer-tabs :deep(.el-tab-pane .page) {
  padding: 0;
}
</style>
