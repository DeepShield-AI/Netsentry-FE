<template>
  <el-drawer
    v-model="open"
    title="因果链分析"
    direction="rtl"
    size="640px"
    :destroy-on-close="false"
  >
    <div class="causal-drawer">
      <!-- Alert context banner -->
      <div v-if="alert" class="alert-ctx">
        <el-tag :type="severityTone(alert.alert_level)" size="small">{{ alert.alert_level }}</el-tag>
        <span class="mono small">{{ alert.rule_name }}</span>
        <span class="muted small">{{ prettyIP(alert.five_tuple.src_ip) }} → {{ prettyIP(alert.five_tuple.dst_ip) }}:{{ alert.five_tuple.dst_port }}</span>
      </div>

      <p class="hint">
        输入事务 ID (Transaction ID) 展开因果链 DAG。事务 ID 可从
        <strong>会话分析</strong> 或 <strong>全流量分析</strong> 页面的详情中获取。
      </p>

      <div class="controls">
        <el-input
          v-model="txIdInput"
          type="number"
          placeholder="事务 ID"
          style="width: 160px"
          @keyup.enter="fetchChain"
        />
        <el-select v-model="depth" style="width: 90px">
          <el-option :value="5" label="5" />
          <el-option :value="10" label="10" />
          <el-option :value="20" label="20" />
          <el-option :value="50" label="50" />
        </el-select>
        <el-button type="primary" :loading="loading" @click="fetchChain">展开</el-button>
      </div>

      <el-alert v-if="error" :title="error" type="error" :closable="false" style="margin-bottom: 12px" />

      <div v-if="chain" class="chain-result">
        <div class="summary">
          <el-tag size="small" effect="plain">{{ chain.nodes.length }} 节点</el-tag>
          <el-tag size="small" effect="plain">{{ chain.edges.length }} 边</el-tag>
          <el-tag size="small" effect="plain">root: #{{ chain.root_tx_id }}</el-tag>
        </div>

        <div v-if="chain.nodes.length === 0" class="empty">
          该事务未发现因果边。
        </div>

        <div v-else class="dag-container">
          <div class="columns">
            <div
              v-for="(col, i) in layout.columns"
              :key="i"
              class="column"
            >
              <div class="col-header">Depth {{ i }}</div>
              <div
                v-for="node in col"
                :key="node.tx_id"
                class="node"
                :class="{ root: node.tx_id === chain.root_tx_id }"
              >
                <div class="node-type">{{ node.tx_type }}</div>
                <div class="node-id">#{{ node.tx_id }}</div>
                <div class="node-ts">{{ fmtTime(node.ts) }}</div>
                <div v-if="node.rule_id" class="node-rule">
                  <span
                    class="rule-badge"
                    :style="{ background: ruleColor(node.rule_id) }"
                  >{{ node.rule_id }}</span>
                  <span class="conf">{{ ((node.confidence ?? 0) * 100).toFixed(0) }}%</span>
                </div>
              </div>
            </div>
          </div>

          <el-collapse style="margin-top: 12px">
            <el-collapse-item :title="`边详情 (${chain.edges.length})`">
              <el-table :data="chain.edges" size="small" stripe>
                <el-table-column label="Cause" prop="cause_tx_id" width="100">
                  <template #default="{ row }">#{{ row.cause_tx_id }}</template>
                </el-table-column>
                <el-table-column label="Effect" prop="effect_tx_id" width="100">
                  <template #default="{ row }">#{{ row.effect_tx_id }}</template>
                </el-table-column>
                <el-table-column label="Rule" width="80">
                  <template #default="{ row }">
                    <span class="rule-badge" :style="{ background: ruleColor(row.rule_id) }">{{ row.rule_id }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="Confidence" width="100">
                  <template #default="{ row }">{{ ((row.confidence ?? 0) * 100).toFixed(1) }}%</template>
                </el-table-column>
              </el-table>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { api } from '@/api/client'
import type { Alert, CausalChain, CausalChainNode } from '@/api/types'
import { prettyIP } from '@/utils/format'

const props = defineProps<{
  modelValue: boolean
  alert?: Alert | null
}>()
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()

const open = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const txIdInput = ref('')
const depth = ref(10)
const chain = ref<CausalChain | null>(null)
const loading = ref(false)
const error = ref('')

// Reset state when drawer opens
watch(() => props.modelValue, (v) => {
  if (v) {
    chain.value = null
    error.value = ''
  }
})

async function fetchChain() {
  const id = parseInt(txIdInput.value, 10)
  if (!id || id <= 0) {
    error.value = '请输入有效的事务 ID'
    return
  }
  loading.value = true
  error.value = ''
  try {
    chain.value = await api.causalChain(id, depth.value)
  } catch (e: any) {
    error.value = e.message || '获取因果链失败'
    chain.value = null
  } finally {
    loading.value = false
  }
}

const layout = computed(() => {
  if (!chain.value) return { columns: [] as CausalChainNode[][] }
  const maxDepth = Math.max(...chain.value.nodes.map(n => n.depth), 0)
  const columns: CausalChainNode[][] = Array.from({ length: maxDepth + 1 }, () => [])
  for (const n of chain.value.nodes) {
    if (n.depth >= 0 && n.depth <= maxDepth) {
      columns[n.depth].push(n)
    }
  }
  return { columns }
})

const ruleColors: Record<string, string> = {
  R1: '#3b82f6',
  R2: '#10b981',
  R3: '#f59e0b',
  R4: '#ef4444',
  R5: '#8b5cf6',
  R6: '#ec4899',
  R7: '#14b8a6',
  R8: '#f97316',
}

function ruleColor(rule: string): string {
  return ruleColors[rule] || '#6b7280'
}

function fmtTime(ts: string): string {
  if (!ts) return ''
  return new Date(ts).toLocaleTimeString()
}

function severityTone(level: string): 'success' | 'info' | 'warning' | 'danger' {
  switch (level) {
    case 'critical':
    case 'error':
      return 'danger'
    case 'warning':
      return 'warning'
    case 'info':
      return 'info'
    default:
      return 'success'
  }
}
</script>

<style scoped>
.causal-drawer {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.alert-ctx {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 8px 12px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
  border-left: 3px solid var(--el-color-danger);
}
.hint {
  color: var(--el-text-color-secondary);
  font-size: 13px;
  margin: 0;
}
.controls {
  display: flex;
  gap: 8px;
  align-items: center;
}
.summary {
  display: flex;
  gap: 6px;
}
.empty {
  color: var(--el-text-color-secondary);
  padding: 2rem;
  text-align: center;
}
.dag-container {
  overflow-x: auto;
}
.columns {
  display: flex;
  gap: 1.5rem;
  min-width: max-content;
  padding-bottom: 8px;
}
.column {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 160px;
}
.col-header {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 2px;
}
.node {
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  padding: 8px 10px;
  transition: border-color 0.2s;
}
.node:hover {
  border-color: var(--el-color-primary);
}
.node.root {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 1px var(--el-color-primary);
}
.node-type {
  font-weight: 600;
  font-size: 13px;
}
.node-id {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
.node-ts {
  color: var(--el-text-color-secondary);
  font-size: 11px;
}
.node-rule {
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.rule-badge {
  display: inline-block;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 600;
  color: white;
}
.conf {
  color: var(--el-text-color-secondary);
  font-size: 11px;
}
.mono {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}
.small {
  font-size: 12px;
}
.muted {
  color: var(--el-text-color-secondary);
}
</style>
