<template>
  <div class="nv-embed">
    <iframe
      ref="frame"
      :key="pageName"
      :src="iframeSrc"
      class="nv-frame"
      frameborder="0"
      allowfullscreen
      @load="onLoad"
    />
    <div v-if="loading" class="nv-loading">
      <el-icon class="is-loading" :size="32"><Loading /></el-icon>
      <span>加载 NetVisor…</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Loading } from '@element-plus/icons-vue'

const route = useRoute()
const frame = ref<HTMLIFrameElement | null>(null)
const loading = ref(true)

// Derive the NetVisor page name from the Vue route path.
const pageName = computed(() => route.path.replace(/^\/nv\//, ''))

// Iframe src is reactive — forces reload when navigating between /nv/* pages.
const iframeSrc = computed(() => '/api/nv/#' + pageName.value)

function onLoad() {
  loading.value = false
  // Retry postMessage several times to handle JS init timing in the iframe.
  let n = 0
  const retry = () => {
    sendNav()
    if (++n < 10) setTimeout(retry, 300)
  }
  setTimeout(retry, 150)
}

function sendNav() {
  const page = pageName.value
  if (!page || !frame.value?.contentWindow) return
  frame.value.contentWindow.postMessage({ type: 'nv:navigate', page }, '*')
}
</script>

<style scoped>
.nv-embed {
  position: relative;
  width: 100%;
  height: calc(100vh - 48px);
  overflow: hidden;
}
.nv-frame {
  width: 100%;
  height: 100%;
  border: none;
}
.nv-loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: var(--el-bg-color);
  color: var(--el-text-color-secondary);
  font-size: 14px;
}
</style>
