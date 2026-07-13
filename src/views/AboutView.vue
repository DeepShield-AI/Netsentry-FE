<template>
  <div class="page">
    <el-card shadow="never">
      <template #header>
        <div class="hdr"><span>About this probe</span></div>
      </template>
      <el-descriptions :column="1" border size="small">
        <el-descriptions-item label="Service">
          {{ store.version?.service ?? '—' }}
        </el-descriptions-item>
        <el-descriptions-item label="Version">
          {{ store.version?.version ?? '—' }}
        </el-descriptions-item>
        <el-descriptions-item label="Connection">
          <el-tag :type="store.connState === 'connected' ? 'success' : 'danger'" size="small">
            {{ store.connState }}
          </el-tag>
          <span v-if="store.lastError" class="mono small muted" style="margin-left: 8px">
            {{ store.lastError }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="Last update">
          <span class="mono">{{ lastUpdateLabel }}</span>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card shadow="never" style="margin-top: 14px">
      <template #header>
        <div class="hdr"><span>Endpoints used</span></div>
      </template>
      <el-table :data="endpoints" size="small" stripe>
        <el-table-column prop="path" label="Path" min-width="200">
          <template #default="{ row }"><code class="mono">{{ row.path }}</code></template>
        </el-table-column>
        <el-table-column prop="purpose" label="Purpose" min-width="320" />
      </el-table>
    </el-card>

    <el-card shadow="never" style="margin-top: 14px">
      <template #header>
        <div class="hdr"><span>Architecture</span></div>
      </template>
      <p class="muted">
        NetSentry's probe is a two-process design:
      </p>
      <ul class="muted">
        <li>
          <b>capture</b> (Rust) — AF_PACKET v3 + PACKET_FANOUT_CPU rings,
          per-core worker pinning, nDPI 4.12 classification, hands flow
          snapshots over SHM SPSC ring to the agent.
        </li>
        <li>
          <b>agent</b> (Go) — consumes IPC frames, runs L7 parsers
          (DNS / HTTP / TLS / ICMP) on top of nDPI, persists to ClickHouse,
          and exposes this dashboard.
        </li>
      </ul>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProbeStore } from '@/stores/probe'

const store = useProbeStore()

const endpoints = [
  { path: '/health', purpose: 'liveness probe' },
  { path: '/version', purpose: 'service / version banner' },
  { path: '/stats', purpose: 'aggregated counters (packets/parsers/alerts)' },
  { path: '/recent/{dns,http,tls,icmp}', purpose: 'in-memory ring of recent sessions' },
  { path: '/ndpi', purpose: 'raw nDPI (master, app) histogram' },
  { path: '/ndpi/named', purpose: 'nDPI histogram with resolved names' },
  { path: '/alert/limiter', purpose: 'alert rate-limiter counters' },
  { path: '/store/stats', purpose: 'ClickHouse batcher counters' },
]

const lastUpdateLabel = computed(() => {
  if (!store.lastUpdateMs) return '—'
  return new Date(store.lastUpdateMs).toLocaleString()
})
</script>

<style scoped>
.hdr {
  font-weight: 600;
}
.small {
  font-size: 12px;
}
ul {
  padding-left: 20px;
  line-height: 1.7;
}
code {
  font-size: 12px;
}
</style>
