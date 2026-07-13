// Pinia store: holds the live snapshot of probe state.
//
// A single timer polls the agent every `intervalMs` (default 2 s) and
// fans out four parallel fetches. We track a connection state so the UI
// can show a banner when the agent is unreachable.
//
// The store also computes a couple of cheap derived series that several
// views need (e.g. rolling rate-of-change for the KPI sparklines).

import { defineStore } from 'pinia'
import { ref, computed, shallowRef } from 'vue'
import { api } from '@/api/client'
import type {
  AgentStats,
  AlertLimiterStats,
  NdpiNamedHistogram,
  StoreStats,
} from '@/api/types'

// Maximum number of historical samples kept in memory for trend charts.
const HISTORY_LEN = 60 // ~2 minutes at 2 s polling

export type ConnState = 'idle' | 'connecting' | 'connected' | 'error'

export interface VersionInfo {
  service: string
  version: string
}

interface Sample {
  ts: number
  packets: number
  bytes: number
  alerts: number
}

export const useProbeStore = defineStore('probe', () => {
  // ── connection ──────────────────────────────────────────────────────
  const connState = ref<ConnState>('idle')
  const lastError = ref<string>('')
  const lastUpdateMs = ref<number>(0)
  const version = ref<VersionInfo | null>(null)

  // ── live counters (full last snapshot) ──────────────────────────────
  // Use shallowRef for objects — we replace the whole object on each
  // refresh, no need for deep reactivity.
  const stats = shallowRef<AgentStats | null>(null)
  const ndpi = shallowRef<NdpiNamedHistogram | null>(null)
  const alertLimiter = shallowRef<AlertLimiterStats | null>(null)
  const storeStats = shallowRef<StoreStats | null>(null)

  // ── rolling history for charts ──────────────────────────────────────
  const history = ref<Sample[]>([])

  // ── derived ─────────────────────────────────────────────────────────
  // Rate per second between the last two samples, for KPI cards.
  const rates = computed(() => {
    const h = history.value
    if (h.length < 2) return { pps: 0, bps: 0, alertRate: 0 }
    const a = h[h.length - 2]
    const b = h[h.length - 1]
    const dt = (b.ts - a.ts) / 1000
    if (dt <= 0) return { pps: 0, bps: 0, alertRate: 0 }
    return {
      pps: Math.max(0, (b.packets - a.packets) / dt),
      bps: Math.max(0, (b.bytes - a.bytes) / dt),
      alertRate: Math.max(0, (b.alerts - a.alerts) / dt),
    }
  })

  // ── polling driver ──────────────────────────────────────────────────
  let pollTimer: number | null = null
  let inFlight = false

  async function refresh() {
    if (inFlight) return
    inFlight = true
    if (connState.value === 'idle') connState.value = 'connecting'

    try {
      const [s, n, al, ss] = await Promise.all([
        api.stats(),
        api.ndpiNamed(),
        api.alertLimiter(),
        api.storeStats(),
      ])
      stats.value = s
      ndpi.value = n
      alertLimiter.value = al
      storeStats.value = ss

      const sample: Sample = {
        ts: Date.now(),
        packets: s.packets,
        bytes: s.bytes,
        alerts: s.alerts_emitted,
      }
      const h = history.value
      h.push(sample)
      if (h.length > HISTORY_LEN) h.splice(0, h.length - HISTORY_LEN)

      lastUpdateMs.value = sample.ts
      lastError.value = ''
      connState.value = 'connected'
    } catch (err) {
      lastError.value = err instanceof Error ? err.message : String(err)
      connState.value = 'error'
    } finally {
      inFlight = false
    }
  }

  async function loadVersion() {
    try {
      version.value = await api.version()
    } catch {
      version.value = null
    }
  }

  function startPolling(intervalMs = 2000) {
    if (pollTimer != null) return
    void loadVersion()
    void refresh()
    pollTimer = window.setInterval(() => {
      void refresh()
    }, intervalMs)
  }

  function stopPolling() {
    if (pollTimer != null) {
      window.clearInterval(pollTimer)
      pollTimer = null
    }
  }

  return {
    // state
    connState,
    lastError,
    lastUpdateMs,
    version,
    stats,
    ndpi,
    alertLimiter,
    storeStats,
    history,
    // derived
    rates,
    // actions
    refresh,
    startPolling,
    stopPolling,
  }
})
