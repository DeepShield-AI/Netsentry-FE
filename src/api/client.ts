// Thin fetch wrapper around the NetSentry probe agent's HTTP API.
//
// Base path is configurable via `VITE_AGENT_BASE`. Defaults:
//   - dev:  '/api'      (Vite proxies /api/* → http://127.0.0.1:7080)
//   - prod: ''           (dashboard is served by the agent itself at /ui/)
//
// If you point `VITE_AGENT_BASE` at a different host (e.g. for remote
// inspection), make sure that agent has CORS enabled.

import type {
  AgentStats,
  Alert,
  AlertLimiterStats,
  CausalChain,
  DNSTransaction,
  Envelope,
  Flow,
  FlowFeature,
  FlowFeatureQuery,
  HistoryEnvelope,
  HistoryQuery,
  HTTPTransaction,
  HuntQuery,
  L2Bucket,
  L2Conversation,
  L2HistoryQuery,
  L2Stats,
  NdpiHistogram,
  NdpiNamedHistogram,
  PcapExtractQuery,
  PcapSessionQuery,
  PcapSessionSpec,
  PcapSegment,
  PcapStats,
  ProbeConfig,
  Session,
  StoreStats,
  TxInsights,
  OverviewStats,
  UplinkStatus,
  UplinkConnectRequest,
  VpnDetection,
  VpnDetectionStats,
  IPInfo,
} from './types'

// historyQS serialises a HistoryQuery into a `?k=v&...` string. Empty /
// undefined fields are omitted; Date instances are sent as RFC3339.
function historyQS(p: HistoryQuery): string {
  const u = new URLSearchParams()
  if (p.since) u.set('since', p.since instanceof Date ? p.since.toISOString() : p.since)
  if (p.until) u.set('until', p.until instanceof Date ? p.until.toISOString() : p.until)
  if (p.q) u.set('q', p.q)
  if (p.timeouts) u.set('timeouts', '1')
  if (p.paired) u.set('paired', '1')
  if (p.dir) u.set('dir', p.dir)
  if (p.level) u.set('level', p.level)
  if (p.limit != null) u.set('limit', String(p.limit))
  if (p.offset != null) u.set('offset', String(p.offset))
  const s = u.toString()
  return s ? `?${s}` : ''
}

// l2QS serialises an L2HistoryQuery into a `?k=v&...` string.
function l2QS(p: L2HistoryQuery): string {
  const u = new URLSearchParams()
  if (p.since) u.set('since', p.since instanceof Date ? p.since.toISOString() : p.since)
  if (p.until) u.set('until', p.until instanceof Date ? p.until.toISOString() : p.until)
  if (p.q) u.set('q', p.q)
  if (p.l2proto != null) u.set('l2proto', String(p.l2proto))
  if (p.ipv != null) u.set('ipv', String(p.ipv))
  if (p.only_l2) u.set('only_l2', '1')
  if (p.only_l3) u.set('only_l3', '1')
  if (p.media) u.set('media', p.media)
  if (p.mac) u.set('mac', p.mac)
  if (p.bucket != null) u.set('bucket', String(p.bucket))
  if (p.limit != null) u.set('limit', String(p.limit))
  if (p.offset != null) u.set('offset', String(p.offset))
  const s = u.toString()
  return s ? `?${s}` : ''
}

// huntQS serialises a HuntQuery into a `?k=v&...` string. Empty / undefined
// fields are omitted; Date instances are sent as RFC3339.
function huntQS(p: HuntQuery): string {
  const u = new URLSearchParams()
  if (p.since) u.set('since', p.since instanceof Date ? p.since.toISOString() : p.since)
  if (p.until) u.set('until', p.until instanceof Date ? p.until.toISOString() : p.until)
  if (p.q) u.set('q', p.q)
  if (p.ip) u.set('ip', p.ip)
  if (p.port != null && p.port > 0) u.set('port', String(p.port))
  if (p.proto) u.set('proto', p.proto)
  if (p.app_proto) u.set('app_proto', p.app_proto)
  if (p.category) u.set('category', p.category)
  if (p.process) u.set('process', p.process)
  if (p.risk_bit != null && p.risk_bit >= 0) u.set('risk_bit', String(p.risk_bit))
  if (p.risk_only) u.set('risk_only', '1')
  if (p.limit != null) u.set('limit', String(p.limit))
  if (p.offset != null) u.set('offset', String(p.offset))
  const s = u.toString()
  return s ? `?${s}` : ''
}

// ffQS serialises a FlowFeatureQuery into a `?k=v&...` string.
function ffQS(p: FlowFeatureQuery): string {
  const u = new URLSearchParams()
  if (p.since) u.set('since', p.since instanceof Date ? p.since.toISOString() : p.since)
  if (p.until) u.set('until', p.until instanceof Date ? p.until.toISOString() : p.until)
  if (p.q) u.set('q', p.q)
  if (p.ip) u.set('ip', p.ip)
  if (p.port != null && p.port > 0) u.set('port', String(p.port))
  if (p.proto) u.set('proto', p.proto)
  if (p.flow_hash != null && String(p.flow_hash) !== '' && String(p.flow_hash) !== '0') {
    u.set('flow_hash', String(p.flow_hash))
  }
  if (p.limit != null) u.set('limit', String(p.limit))
  if (p.offset != null) u.set('offset', String(p.offset))
  const s = u.toString()
  return s ? `?${s}` : ''
}

const BASE: string =
  (import.meta.env.VITE_AGENT_BASE as string | undefined) ??
  (import.meta.env.DEV ? '/api' : '')

async function getJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Accept: 'application/json' },
    ...init,
  })
  // 503 from /history /insights means ClickHouse is disabled — surface
  // the typed body to the caller (it will carry `{disabled:true,...}`)
  // instead of throwing, so the UI can render an empty-state nicely.
  if (res.status === 503) {
    try {
      return (await res.json()) as T
    } catch {
      throw new Error(`${path}: HTTP 503 (no body)`)
    }
  }
  if (!res.ok) {
    throw new Error(`${path}: HTTP ${res.status} ${res.statusText}`)
  }
  return (await res.json()) as T
}

export const api = {
  health: () => getJSON<{ status: string }>('/health'),
  version: () => getJSON<{ service: string; version: string }>('/version'),
  stats: () => getJSON<AgentStats>('/stats'),
  ndpi: () => getJSON<NdpiHistogram>('/ndpi'),
  ndpiNamed: () => getJSON<NdpiNamedHistogram>('/ndpi/named'),
  alertLimiter: () => getJSON<AlertLimiterStats>('/alert/limiter'),
  storeStats: () => getJSON<StoreStats>('/store/stats'),
  systemInfo: () => getJSON<{
    system_time: string; uptime_seconds: number; version: string; go_version: string;
    os: string; arch: string; num_cpu: number; hostname: string;
    cpu_usage: number; mem_total: number; mem_used: number; mem_usage: number;
    disk_total: number; disk_used: number; disk_usage: number;
    interfaces: Array<{ name: string; status: string; ip: string; mac: string; rx_bytes: number; tx_bytes: number }>;
    load_avg_1: number; load_avg_5: number; load_avg_15: number;
  }>('/system-info'),
  // Rolling per-second bandwidth samples (up to 300s). Bare array response.
  // Currently-active users (IPs with a 5-minute activity TTL).
  trafficOnlineUsers: () =>
    getJSON<Array<{ ip: string; mac?: string; bytes: number; packets: number; sessions: number; first_seen: string; last_seen: string }>>(
      '/traffic/online-users',
    ),
  // ClickHouse-backed day/week/month traffic rollup (avg/max bps+pps,
  // new_conns, online_users per bucket). 503 {disabled:true} when CH is off.
  historyTraffic: (range: 'day' | 'week' | 'month' = 'day') =>
    getJSON<{
      disabled?: boolean
      range?: string
      count?: number
      items?: Array<{
        timestamp: string
        avg_bps: number
        max_bps: number
        avg_pps: number
        max_pps: number
        new_conns: number
        online_users: number
      }>
    }>(`/history/traffic?range=${range}`),
  trafficBandwidth: (seconds = 300) =>
    getJSON<Array<{ ts: string; bytes_in: number; bytes_out: number; pkts_in: number; pkts_out: number }>>(
      `/traffic/bandwidth?seconds=${seconds}`,
    ),
  trafficBandwidthByCategory: (seconds = 300) =>
    getJSON<{
      categories: Array<{ key: string; label: string; color: string }>
      series: Record<string, Array<{ ts: string; value: number }>>
    }>(`/traffic/bandwidth-by-category?seconds=${seconds}`),
  // /recent/* endpoints all return {count,total,items}; we unwrap to a
  // bare array since views never use count/total.
  recentDNS: (n = 100) =>
    getJSON<Envelope<Session>>(`/recent/dns?n=${n}`).then((e) => e.items),
  recentHTTP: (n = 100) =>
    getJSON<Envelope<Session>>(`/recent/http?n=${n}`).then((e) => e.items),
  recentTLS: (n = 100) =>
    getJSON<Envelope<Session>>(`/recent/tls?n=${n}`).then((e) => e.items),
  recentICMP: (n = 100) =>
    getJSON<Envelope<Session>>(`/recent/icmp?n=${n}`).then((e) => e.items),
  recentAlerts: (n = 200) =>
    getJSON<Envelope<Alert>>(`/recent/alerts?n=${n}`).then((e) => e.items),
  recentFlows: (n = 500) =>
    getJSON<Envelope<Flow>>(`/recent/flows?n=${n}`).then((e) => e.items),
  recentL2Events: (n = 500) =>
    getJSON<Envelope<Flow>>(`/recent/l2events?n=${n}`).then((e) => e.items),
  recentDNSTransactions: (n = 200) =>
    getJSON<Envelope<DNSTransaction>>(`/recent/dns_transactions?n=${n}`).then((e) => e.items),
  recentHTTPTransactions: (n = 200) =>
    getJSON<Envelope<HTTPTransaction>>(`/recent/http_transactions?n=${n}`).then((e) => e.items),

  // ── Historical (ClickHouse-backed) transaction queries. Returns 503
  // with {disabled:true} when ClickHouse is not configured; callers
  // should check `disabled` before treating the response as data.
  historyDNSTransactions: (params: HistoryQuery = {}) =>
    getJSON<HistoryEnvelope<DNSTransaction>>(`/history/dns_transactions${historyQS(params)}`),
  historyHTTPTransactions: (params: HistoryQuery = {}) =>
    getJSON<HistoryEnvelope<HTTPTransaction>>(`/history/http_transactions${historyQS(params)}`),
  // Paginated link-layer frames from the l2_frames table. Returns 503
  // {disabled:true} when ClickHouse is off — callers fall back to /recent/*.
  historyL2Frames: (params: L2HistoryQuery = {}) =>
    getJSON<HistoryEnvelope<Flow>>(`/history/l2frames${l2QS(params)}`),
  // Time-windowed link-layer KPIs + chart series from the l2_frames table.
  // Returns 503 {disabled:true} when ClickHouse is off.
  historyL2Stats: (params: L2HistoryQuery = {}) =>
    getJSON<L2Stats>(`/history/l2stats${l2QS(params)}`),
  // Time-bucketed link-layer trend (frames/bytes/broadcast/multicast/arp).
  historyL2Timeseries: (params: L2HistoryQuery = {}) =>
    getJSON<{ disabled?: boolean; buckets: L2Bucket[] }>(`/history/l2timeseries${l2QS(params)}`),
  // Unordered MAC-pair endpoint conversations (link-layer "pairing").
  historyL2Conversations: (params: L2HistoryQuery = {}) =>
    getJSON<{ disabled?: boolean; items: L2Conversation[]; count: number }>(`/history/l2conversations${l2QS(params)}`),
  // Per-protocol session + alert history (ClickHouse-backed, paginated).
  // Return 503 {disabled:true} when ClickHouse is off.
  historyFlows: (params: HistoryQuery = {}) =>
    getJSON<HistoryEnvelope<Flow>>(`/history/flows${historyQS(params)}`),
  // Forensic Hunt: field-filtered session_flows search. Each row carries the
  // five-tuple + flow_hash that the Hunt page feeds to /pcap/sessions.
  historyHunt: (params: HuntQuery = {}) =>
    getJSON<HistoryEnvelope<Flow>>(`/history/hunt${huntQS(params)}`),
  // Flow features (lzprobe extractor over stored PCAP). `flow_hash` pins the
  // query to a single session for the Hunt-page drawer. 503 {disabled:true}
  // when ClickHouse is off.
  historyFlowFeatures: (params: FlowFeatureQuery = {}) =>
    getJSON<HistoryEnvelope<FlowFeature>>(`/history/flow-features${ffQS(params)}`),
  historyDNS: (params: HistoryQuery = {}) =>
    getJSON<HistoryEnvelope<Session>>(`/history/dns${historyQS(params)}`),
  historyHTTP: (params: HistoryQuery = {}) =>
    getJSON<HistoryEnvelope<Session>>(`/history/http${historyQS(params)}`),
  historyTLS: (params: HistoryQuery = {}) =>
    getJSON<HistoryEnvelope<Session>>(`/history/tls${historyQS(params)}`),
  historyICMP: (params: HistoryQuery = {}) =>
    getJSON<HistoryEnvelope<Session>>(`/history/icmp${historyQS(params)}`),
  historyAlerts: (params: HistoryQuery = {}) =>
    getJSON<HistoryEnvelope<Alert>>(`/history/alerts${historyQS(params)}`),
  // Rolling p50/p95/error-rate + top-N. `window` is a Go duration
  // string (e.g. '5m', '1h', '24h').
  insights: (window = '5m') =>
    getJSON<TxInsights>(`/insights/transactions?window=${encodeURIComponent(window)}`),
  overviewStats: (window = '1h') =>
    getJSON<OverviewStats>(`/insights/overview?window=${encodeURIComponent(window)}`),
  // ── 全流量存储 (full-traffic PCAP storage) ──────────────────────
  pcapStats: () => getJSON<PcapStats>('/pcap/stats'),
  pcapFiles: () => getJSON<{ items: PcapSegment[]; count: number }>('/pcap/files'),
  // Builds the absolute /pcap/extract URL for a per-IP download. The view
  // uses it as an <a href>/window.open target so the browser streams the
  // .pcap straight to disk (no JS buffering of the whole file).
  pcapExtractUrl: (params: PcapExtractQuery): string => {
    const u = new URLSearchParams()
    u.set('ip', params.ip)
    if (params.since) u.set('since', params.since instanceof Date ? params.since.toISOString() : params.since)
    if (params.until) u.set('until', params.until instanceof Date ? params.until.toISOString() : params.until)
    if (params.limit_mb != null) u.set('limit_mb', String(params.limit_mb))
    return `${BASE}/pcap/extract?${u.toString()}`
  },
  // Builds the absolute /pcap/session URL for a per-session (five-tuple)
  // download. Uses the capture's offset index to seek matching packets
  // (both directions by default) instead of scanning whole segments.
  pcapSessionUrl: (params: PcapSessionQuery): string => {
    const u = new URLSearchParams()
    u.set('src_ip', params.src_ip)
    u.set('dst_ip', params.dst_ip)
    if (params.src_port != null) u.set('src_port', String(params.src_port))
    if (params.dst_port != null) u.set('dst_port', String(params.dst_port))
    if (params.proto) u.set('proto', params.proto)
    if (params.bidir === false) u.set('bidir', '0')
    if (params.since) u.set('since', params.since instanceof Date ? params.since.toISOString() : params.since)
    if (params.until) u.set('until', params.until instanceof Date ? params.until.toISOString() : params.until)
    if (params.limit_mb != null) u.set('limit_mb', String(params.limit_mb))
    return `${BASE}/pcap/session?${u.toString()}`
  },
  // Builds the absolute /pcap/sessions URL for a BATCH (merged) download of
  // several sessions at once. Each spec becomes a repeated `s=src,dst,sport,
  // dport,proto` param so the download stays a plain streamed <a href>.
  pcapSessionsUrl: (
    specs: PcapSessionSpec[],
    opts: { since?: Date | string; until?: Date | string; limit_mb?: number; bidir?: boolean } = {},
  ): string => {
    const u = new URLSearchParams()
    for (const s of specs) {
      u.append('s', [
        s.src_ip,
        s.dst_ip,
        s.src_port ?? 0,
        s.dst_port ?? 0,
        s.proto ?? 'TCP',
      ].join(','))
    }
    if (opts.bidir === false) u.set('bidir', '0')
    if (opts.since) u.set('since', opts.since instanceof Date ? opts.since.toISOString() : opts.since)
    if (opts.until) u.set('until', opts.until instanceof Date ? opts.until.toISOString() : opts.until)
    if (opts.limit_mb != null) u.set('limit_mb', String(opts.limit_mb))
    return `${BASE}/pcap/sessions?${u.toString()}`
  },

  // ── 运维健康 (Operations Health) ─────────────────────────────────
  opsHealth: () => getJSON<any>('/ops/health'),
  opsHealthHistory: (since?: string, until?: string) => {
    const u = new URLSearchParams()
    if (since) u.set('since', since)
    if (until) u.set('until', until)
    const qs = u.toString()
    return getJSON<{ source: string; count: number; items: any[] }>(`/ops/health/history${qs ? '?' + qs : ''}`)
  },
  opsDatabase: () => getJSON<any>('/ops/database'),
  opsStorage: () => getJSON<any>('/ops/storage'),

  // Cheap way to read the in-memory ring's `total` counter for each
  // session type (n=1 still returns the envelope's `total` field).
  // ── Config API ──────────────────────────────────────────────────
  getConfig: () => getJSON<ProbeConfig>('/api/config'),
  postConfig: (cfg: ProbeConfig) =>
    getJSON<{ status: string; message: string }>('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(cfg),
    }),
  // Raw YAML config (unified config.yaml)
  getYAMLConfig: async (): Promise<string> => {
    const res = await fetch(`${BASE}/api/config/yaml`, { headers: { Accept: 'text/yaml' } })
    if (!res.ok) throw new Error(`/api/config/yaml: HTTP ${res.status}`)
    return res.text()
  },
  postYAMLConfig: (yaml: string) =>
    getJSON<{ status: string; message: string }>('/api/config/yaml', {
      method: 'POST',
      headers: { 'Content-Type': 'text/yaml', Accept: 'application/json' },
      body: yaml,
    }),

  sessionTotals: async (): Promise<{
    dns: number
    http: number
    tls: number
    icmp: number
    flows: number
  }> => {
    const [dns, http, tls, icmp, flows] = await Promise.all([
      getJSON<Envelope<Session>>('/recent/dns?n=1').then((e) => e.total).catch(() => 0),
      getJSON<Envelope<Session>>('/recent/http?n=1').then((e) => e.total).catch(() => 0),
      getJSON<Envelope<Session>>('/recent/tls?n=1').then((e) => e.total).catch(() => 0),
      getJSON<Envelope<Session>>('/recent/icmp?n=1').then((e) => e.total).catch(() => 0),
      getJSON<Envelope<Flow>>('/recent/flows?n=1').then((e) => e.total).catch(() => 0),
    ])
    return { dns, http, tls, icmp, flows }
  },

  // ── Uplink API ──────────────────────────────────────────────────
  uplinkStatus: () => getJSON<UplinkStatus>('/api/uplink/status'),
  uplinkConnect: (req: UplinkConnectRequest) =>
    getJSON<{ status: string; message: string }>('/api/uplink/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(req),
    }),
  uplinkDisconnect: () =>
    getJSON<{ status: string; message: string }>('/api/uplink/disconnect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    }),

  // ── VPN Detection API ──────────────────────────────────────────
  vpnDetections: (n = 100, type?: string, confidence?: string) => {
    const u = new URLSearchParams()
    u.set('n', String(n))
    if (type) u.set('type', type)
    if (confidence) u.set('confidence', confidence)
    return getJSON<{ count: number; detections: VpnDetection[] }>(`/api/vpn/detections?${u.toString()}`)
  },
  vpnStats: () => getJSON<VpnDetectionStats>('/api/vpn/stats'),

  // ── IP Lookup API ───────────────────────────────────────────────
  ipLookup: (ip: string) => getJSON<IPInfo>(`/api/ip/lookup?ip=${encodeURIComponent(ip)}`),

  // ── Causal Chain API ────────────────────────────────────────────
  causalChain: (txId: number, depth = 10) =>
    getJSON<CausalChain>(`/causal/chain?tx_id=${txId}&depth=${depth}`),

  // ── AI Chat API (SSE streaming) ────────────────────────────────
  chat: (messages: { role: string; content: string }[]) =>
    getJSON<{ content: string }>('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ messages }),
    }),

  chatHistoryLoad: (username: string) =>
    getJSON<{ username: string; sessions: any[] }>(`/api/chat/history?user=${encodeURIComponent(username)}`),

  chatHistorySave: (username: string, sessions: any[]) =>
    getJSON<{ status: string }>('/api/chat/history?user=' + encodeURIComponent(username), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessions }),
    }),

  chatHistoryClear: (username: string, sessionId?: string) =>
    getJSON<{ status: string }>(`/api/chat/history?user=${encodeURIComponent(username)}${sessionId ? '&session=' + sessionId : ''}`, {
      method: 'DELETE',
    }),

  chatAudit: () =>
    getJSON<{ total_requests: number; total_prompt_tokens: number; total_completion_tokens: number; total_tokens: number; total_cost_yuan: number; api_key_display: string; pricing: { input_price_per_million: number; output_price_per_million: number; currency: string; multiplier_vs_deepseek: number } | null; by_user: any[]; entries: any[] }>('/api/chat/audit'),

  chatStream: (messages: { role: string; content: string }[], onEvent: (ev: ChatStreamEvent) => void): Promise<void> => {
    return fetch(`${BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, stream: true }),
    }).then(async (res) => {
      if (!res.ok) {
        const text = await res.text()
        onEvent({ type: 'error', message: `HTTP ${res.status}: ${text}` })
        return
      }
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()! // keep incomplete line
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const ev = JSON.parse(line.slice(6)) as ChatStreamEvent
              onEvent(ev)
            } catch { /* skip malformed */ }
          }
        }
      }
    })
  },
}

export type ChatStreamEvent =
  | { type: 'thinking'; content: string; round?: number; elapsed_ms?: number }
  | { type: 'thought'; content: string; round?: number }
  | { type: 'tool_start'; tool: string; args: string; desc?: string; index?: number; total?: number }
  | { type: 'tool_done'; tool: string; result_len: number; preview?: string; duration_ms?: number }
  | { type: 'chart'; config: string }
  | { type: 'delta'; content: string }
  | { type: 'done'; prompt_tokens?: number; completion_tokens?: number; total_tokens?: number }
  | { type: 'error'; message: string }

export type Api = typeof api
