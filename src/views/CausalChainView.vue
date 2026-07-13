<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/api/client'
import type { CausalChain, CausalChainNode } from '@/api/types'

const route = useRoute()
const txIdInput = ref('')
const depth = ref(10)
const chain = ref<CausalChain | null>(null)
const loading = ref(false)
const error = ref('')

async function fetchChain() {
  const id = parseInt(txIdInput.value, 10)
  if (!id || id <= 0) {
    error.value = 'Enter a valid transaction ID'
    return
  }
  loading.value = true
  error.value = ''
  try {
    chain.value = await api.causalChain(id, depth.value)
  } catch (e: any) {
    error.value = e.message || 'Failed to fetch causal chain'
    chain.value = null
  } finally {
    loading.value = false
  }
}

// Auto-load if tx_id query param is present
onMounted(() => {
  const qid = route.query.tx_id
  if (qid) {
    txIdInput.value = String(qid)
    void fetchChain()
  }
})

// Build a layout: group nodes by depth, left to right.
const layout = computed(() => {
  if (!chain.value) return { columns: [] as CausalChainNode[][], edges: [] as any[] }
  const maxDepth = Math.max(...chain.value.nodes.map(n => n.depth), 0)
  const columns: CausalChainNode[][] = Array.from({ length: maxDepth + 1 }, () => [])
  for (const n of chain.value.nodes) {
    if (n.depth >= 0 && n.depth <= maxDepth) {
      columns[n.depth].push(n)
    }
  }
  return { columns, edges: chain.value.edges }
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
  const d = new Date(ts)
  return d.toLocaleTimeString()
}
</script>

<template>
  <div class="causal-chain-view">
    <h2>Causal Chain Explorer</h2>
    <p class="hint">
      Enter a transaction ID to visualize its causal chain (DAG). The graph shows
      cause → effect relationships discovered by the causal linker, traversed up
      to the specified depth.
    </p>

    <div class="controls">
      <input
        v-model="txIdInput"
        type="number"
        placeholder="Transaction ID"
        @keyup.enter="fetchChain"
      />
      <select v-model="depth">
        <option :value="5">5</option>
        <option :value="10">10</option>
        <option :value="20">20</option>
        <option :value="50">50</option>
      </select>
      <button @click="fetchChain" :disabled="loading">
        {{ loading ? 'Loading...' : 'Expand Chain' }}
      </button>
    </div>

    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="chain" class="chain-result">
      <div class="summary">
        <span class="badge">{{ chain.nodes.length }} nodes</span>
        <span class="badge">{{ chain.edges.length }} edges</span>
        <span class="badge">root: {{ chain.root_tx_id }}</span>
      </div>

      <div v-if="chain.nodes.length === 0" class="empty">
        No causal edges found for this transaction.
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
                <span class="conf">{{ (node.confidence * 100).toFixed(0) }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Edge list for detailed inspection -->
        <details class="edge-list">
          <summary>Edge details ({{ chain.edges.length }})</summary>
          <table>
            <thead>
              <tr>
                <th>Cause</th>
                <th>Effect</th>
                <th>Rule</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(e, i) in chain.edges" :key="i">
                <td>#{{ e.cause_tx_id }}</td>
                <td>#{{ e.effect_tx_id }}</td>
                <td>
                  <span class="rule-badge" :style="{ background: ruleColor(e.rule_id) }">{{ e.rule_id }}</span>
                </td>
                <td>{{ (e.confidence * 100).toFixed(1) }}%</td>
              </tr>
            </tbody>
          </table>
        </details>
      </div>
    </div>
  </div>
</template>

<style scoped>
.causal-chain-view {
  padding: 1.5rem;
}
.hint {
  color: #94a3b8;
  margin-bottom: 1rem;
}
.controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.controls input {
  flex: 0 0 200px;
  padding: 0.5rem;
  border: 1px solid #334155;
  border-radius: 4px;
  background: #1e293b;
  color: #e2e8f0;
}
.controls select {
  padding: 0.5rem;
  border: 1px solid #334155;
  border-radius: 4px;
  background: #1e293b;
  color: #e2e8f0;
}
.controls button {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.controls button:disabled {
  opacity: 0.5;
}
.error {
  color: #ef4444;
  margin-bottom: 1rem;
}
.summary {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.badge {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 4px;
  padding: 0.25rem 0.75rem;
  font-size: 0.85rem;
  color: #94a3b8;
}
.empty {
  color: #64748b;
  padding: 2rem;
  text-align: center;
}
.dag-container {
  overflow-x: auto;
}
.columns {
  display: flex;
  gap: 2rem;
  min-width: max-content;
  padding-bottom: 1rem;
}
.column {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 180px;
}
.col-header {
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}
.node {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 0.75rem;
  cursor: default;
  transition: border-color 0.2s;
}
.node:hover {
  border-color: #3b82f6;
}
.node.root {
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}
.node-type {
  font-weight: 600;
  color: #e2e8f0;
  font-size: 0.9rem;
}
.node-id {
  color: #64748b;
  font-size: 0.8rem;
}
.node-ts {
  color: #94a3b8;
  font-size: 0.75rem;
}
.node-rule {
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.rule-badge {
  display: inline-block;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 0.7rem;
  font-weight: 600;
  color: white;
}
.conf {
  color: #94a3b8;
  font-size: 0.7rem;
}
.edge-list {
  margin-top: 1.5rem;
}
.edge-list summary {
  cursor: pointer;
  color: #94a3b8;
  font-size: 0.9rem;
}
.edge-list table {
  width: 100%;
  margin-top: 0.5rem;
  border-collapse: collapse;
}
.edge-list th,
.edge-list td {
  text-align: left;
  padding: 0.4rem 0.6rem;
  border-bottom: 1px solid #1e293b;
  font-size: 0.85rem;
}
.edge-list th {
  color: #64748b;
  font-weight: 600;
}
.edge-list td {
  color: #cbd5e1;
}
</style>
