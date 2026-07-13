// Mirror of the Go agent's JSON shapes, kept hand-written (the agent
// surface is small and stable). When the Go side adds fields, mirror them
// here — TS will surface call-sites that need updating.

// Probe system config — GET/POST /api/config
export interface ProbeConfig {
  iface: string
  snaplen: number
  workers: string
  block_size: number
  block_count: number
  frame_size: number
  block_timeout_ms: number
  flow_table_size: number
  flow_expire_seconds: number
  snapshot_interval_ms: number
  listen: string
  shm_dir: string
  clickhouse_dsn: string
  tenant_id: string
  probe_id: string
  alert_ttl_seconds: number
  ring_capacity: number
  ring_slot_size: number
  // ── 全流量存储 (Full-Traffic PCAP Storage) ──
  storage_enabled: boolean
  storage_dir: string
  storage_max_disk_mb: number
  storage_retention_seconds: number
  storage_segment_mb: number
  storage_segment_seconds: number
  storage_snaplen: number
}

export interface AgentStats {
  packets: number
  bytes: number
  flows: number
  heartbeats: number
  dns_parsed: number
  http_parsed: number
  icmp_parsed: number
  tls_parsed: number
  parse_errors: number
  dns_tx_paired: number
  dns_tx_timeout: number
  http_tx_paired: number
  http_tx_timeout: number
  ndpi_classified: number
  ndpi_final: number
  ndpi_risk_flagged: number
  alerts_emitted: number
  alerts_suppressed: number
  last_hb_worker_id: number
  last_hb_rx_packets: number
  capture_rx_packets: number
  capture_rx_bytes: number
  capture_ipc_pushed: number
  capture_ipc_drops: number
  capture_flow_count: number
  ipc_drop_rate: number
}

export interface NdpiProtoCount {
  master: number
  app: number
  count: number
}
export interface NdpiHistogram {
  protocols: NdpiProtoCount[]
}

// Named variant — what /ndpi/named returns. Use this in the UI so we
// don't have to ship the 441-entry ID→name table.
export interface NdpiNamedRow {
  master: number
  app: number
  master_name: string
  app_name: string
  count: number
}
export interface NdpiNamedHistogram {
  protocols: NdpiNamedRow[]
}

// model.Flow — one nDPI-classified flow snapshot. Used by the Flows tab
// to surface protocols beyond the four with dedicated parsers.
export interface Flow {
  timestamp: string
  five_tuple: FiveTuple
  flow_hash: number
  packet_count: number
  bytes_count: number
  duration_ms: number
  session_type: string         // "DNS" / "HTTP" / "TLS" / "ICMP" / "Other"
  master_proto?: string        // "TLS" / "DNS" / ...
  app_proto?: string           // "GOOGLE" / "GITHUB" / "TLS" / ...
  category?: string            // "MEDIA" / "WEB" / "NETWORK" / ...
  ndpi_risk?: number           // raw bitmap (uint64; serialised as number, lossy beyond 2^53)
  ndpi_final?: boolean
  host?: string                // nDPI host_server_name (DNS query / HTTP Host / TLS SNI / QUIC SNI)
  process_pid?: number
  process_name?: string
  process_exe?: string
  direction?: 'inbound' | 'outbound' | 'internal' | 'unknown'

  // L2 link layer fields (v4)
  src_mac?: string            // "aa:bb:cc:dd:ee:ff"
  dst_mac?: string
  ether_type?: number         // 0x0800=IPv4, 0x86DD=IPv6, 0x0806=ARP, 0x8100=VLAN...
  inner_ether_type?: number   // inner EtherType after VLAN stripping
  l2_proto?: number           // 0=EthernetII, 1=ARP, 2=RARP, 3=LLDP, 5=VLAN, 6=QinQ, 7=MPLS...
  vlan_id?: number            // outer VLAN ID (0=none)
  vlan_depth?: number         // VLAN layers (0/1/2)
  is_broadcast?: boolean
  is_multicast?: boolean
  has_l3?: boolean            // false = pure L2 frame (ARP/LLDP)
  media?: string             // link medium: ethernet/wifi/cellular/loopback/other/unknown

  // L3 protocol classification (v4)
  l3_proto?: number           // 0=Unknown,1=TCP,2=UDP,3=ICMP,4=ICMPv6,5=IGMP,6=GRE,7=ESP,8=AH,9=OSPF,10=VRRP,11=SCTP,12=IPinIP,13=IPv6Encap
  icmpv6_type?: number        // 0=Other,1=EchoReq,2=EchoReply,3=RS,4=RA,5=NS,6=NA,7=Redirect
  ipv6_ext_mask?: number      // bit0=HBH,bit1=Routing,bit2=Fragment,bit3=Dest,bit4=AH,bit5=ESP

  // ARP fields (L2-only frames)
  arp_op?: number             // 0=unknown,1=request,2=reply,3=rarp_req,4=rarp_reply
  arp_sender_ip?: string      // who claims this IP
  arp_target_ip?: string      // who they're asking about

  // TCP connect latency (SYN→SYN-ACK RTT)
  tcp_connect_ms?: number
}

// model.DNSTransaction — paired DNS query+response with latency.
export interface DNSTransaction {
  query_ts: string
  response_ts?: string
  latency_ms?: number
  client_ip: string
  client_port: number
  server_ip: string
  server_port: number
  txid: number
  domain: string
  query_type: string
  rcode?: number
  rcode_text?: string
  response_ips?: string[]
  timeout?: boolean
  request_size?: number
  response_size?: number
  process_pid?: number
  process_name?: string
  direction?: 'inbound' | 'outbound' | 'internal' | 'unknown'
}

// model.HTTPTransaction — paired HTTP request+response with latency.
export interface HTTPTransaction {
  request_ts: string
  response_ts?: string
  latency_ms?: number
  client_ip: string
  client_port: number
  server_ip: string
  server_port: number
  method: string
  host?: string
  path?: string
  user_agent?: string
  status_code?: number
  response_content_type?: string
  request_size?: number
  response_size?: number
  timeout?: boolean
  process_pid?: number
  process_name?: string
  direction?: 'inbound' | 'outbound' | 'internal' | 'unknown'
}

// Common envelope for ring-backed endpoints (/recent/*).
export interface Envelope<T> {
  count: number
  total: number
  items: T[]
}

// /history/* envelope. `disabled` is set when ClickHouse is not configured
// (HTTP 503 is normalised to a typed body by the client wrapper).
export interface HistoryEnvelope<T> {
  count: number
  total: number
  limit: number
  offset: number
  items: T[]
  disabled?: boolean
  reason?: string
}

// Filter/pagination parameters for /history/l2frames (link-layer frames).
export interface L2HistoryQuery {
  since?: Date | string
  until?: Date | string
  q?: string            // substring on MAC / IP
  l2proto?: number      // exact l2_proto enum; omit = all
  ipv?: 4 | 6           // IP version filter; omit = all
  only_l2?: boolean     // only pure-L2 frames (has_l3 = 0)
  only_l3?: boolean     // only data frames carrying L3 (has_l3 = 1)
  media?: string        // link medium filter (ethernet/wifi/cellular/...); omit = all
  mac?: string          // frames where src_mac OR dst_mac == mac; omit = all
  bucket?: number       // time-series bucket width in seconds (0/omit = auto)
  limit?: number
  offset?: number
}

// One time bucket of the link-layer trend series (/history/l2timeseries).
export interface L2Bucket {
  ts: string            // RFC3339 bucket start
  frames: number
  bytes: number
  broadcast: number
  multicast: number
  arp: number
}

// One unordered MAC-pair endpoint conversation (/history/l2conversations).
export interface L2Conversation {
  mac_a: string
  mac_b: string
  frames: number
  bytes: number
  last_ts: string       // RFC3339 of the most recent frame
}

// Time-windowed link-layer KPIs + chart series from /history/l2stats.
// `disabled:true` is returned (with a 503) when ClickHouse is off.
export interface L2Stats {
  disabled?: boolean
  total: number
  broadcast: number
  multicast: number
  vlan: number
  arp: number
  unique_vlan: number
  unique_mac: number
  proto_dist: { proto: number; count: number }[]
  top_macs: { mac: string; count: number }[]
  media_dist: { media: string; count: number }[]
}

// One flow_features row: a connection's lzprobe flow-feature vector, produced
// by the agent's flowfeat worker over stored full-traffic PCAP. Promoted
// scalar columns plus the complete lzprobe conn record (size/IAT/RTT
// distributions, FFT, TCP-flag stats) as a JSON string in `features`.
export interface FlowFeature {
  timestamp: string
  flow_hash: number
  uid: string
  src_ip: string
  dst_ip: string
  src_port: number
  dst_port: number
  protocol: string
  service: string
  conn_state: string
  history: string
  duration: number
  up_bytes: number
  down_bytes: number
  up_pkts: number
  down_pkts: number
  up_iat_skewness: number
  down_iat_skewness: number
  up_rtt_avg: number
  down_rtt_avg: number
  up_rexmt_data_pkts: number
  down_rexmt_data_pkts: number
  bulk_trans_transitions: number
  time_spent_in_bulk: number
  features: string
  seg_file: string
}

// Filter/pagination parameters for /history/flow-features.
export interface FlowFeatureQuery {
  since?: Date | string
  until?: Date | string
  q?: string                  // substring on ip/service/conn_state/uid
  ip?: string
  port?: number
  proto?: string
  flow_hash?: string | number // pin to one flow (drawer use case)
  limit?: number
  offset?: number
}

// Filter parameters for the history endpoints. `timeouts`/`paired` apply
// only to transaction tables; `dir`/`level` apply only to session/alert
// tables. All optional — unused fields are omitted from the query string.
export interface HistoryQuery {
  since?: Date | string
  until?: Date | string
  q?: string
  timeouts?: boolean
  paired?: boolean
  dir?: string    // inbound/outbound/internal/unknown (sessions/flows/alerts)
  level?: string  // info/warning/error/critical (alerts)
  limit?: number
  offset?: number
}

// /insights/transactions response. Mirrors store.Insights in Go.
export interface ProtoInsight {
  total: number
  paired: number
  timeouts: number
  errors: number
  error_rate: number
  p50_ms: number
  p95_ms: number
  p99_ms: number
  avg_ms: number
}
export interface SlowEntry {
  key: string
  p95_ms: number
  count: number
}
export interface ErrorEntry {
  host: string
  errors: number
  total: number
  error_rate: number
  worst_code: number
}
export interface TxInsights {
  window_s: number
  generated_at: string
  dns: ProtoInsight
  http: ProtoInsight
  top_slow_domains: SlowEntry[] | null
  top_slow_hosts: SlowEntry[] | null
  top_error_hosts: ErrorEntry[] | null
  disabled?: boolean
  reason?: string
}

export interface OverviewStats {
  window_seconds: number
  generated_at: string
  unique_src_ips: number
  unique_dst_ips: number
  ipv4_flows: number
  ipv6_flows: number
  tcp_flows: number
  udp_flows: number
  other_l4_flows: number
  unique_dst_ports: number
  total_flows: number
  classified_pct: number
  disabled?: boolean
}

// Alert record matching model.Alert in Go. Mirror new fields here when
// the Go side adds them.
export interface Alert {
  timestamp: string
  rule_id: number
  rule_name: string
  rule_type: string         // "ndpi" | "intel" | "custom"
  alert_level: string       // "info" | "warning" | "error" | "critical"
  five_tuple: FiveTuple
  flow_hash: number
  domain?: string
  url?: string
  details?: string
}

export interface AlertLimiterStats {
  admitted: number
  suppressed: number
  swept: number
  live: number
}

export interface StoreStats {
  pushed: number
  dropped: number
  inserted: number
  batch_ok: number
  batch_fail: number
  last_err: string
}

// Common five-tuple shape (matches model.FiveTuple in Go).
export interface FiveTuple {
  src_ip: string
  dst_ip: string
  src_port: number
  dst_port: number
  protocol: string
}

// ── 全流量存储 (full-traffic PCAP storage) ────────────────────────────────
// /pcap/stats summary of the on-disk PCAP segment ring buffer.
export interface PcapStats {
  dir: string
  enabled: boolean
  total_bytes: number
  file_count: number
  active: number       // segments currently being written (.active)
  oldest: string       // RFC3339 of oldest segment mod time ('' if none)
  newest: string       // RFC3339 of newest segment mod time ('' if none)
}

// One segment file from /pcap/files.
export interface PcapSegment {
  name: string
  bytes: number
  mod_time: string     // RFC3339
  sealed: boolean      // false = still being written
}

// Parameters for the /pcap/extract download (per-IP filter).
export interface PcapExtractQuery {
  ip: string
  since?: Date | string
  until?: Date | string
  limit_mb?: number
}

// Per-session (five-tuple) extraction via the Arkime-style offset index.
export interface PcapSessionQuery {
  src_ip: string
  dst_ip: string
  src_port?: number
  dst_port?: number
  proto?: string // TCP / UDP / ICMP / ICMPv6 or a protocol number
  bidir?: boolean // default true (match both directions)
  since?: Date | string
  until?: Date | string
  limit_mb?: number
}

// Forensic "Hunt" query: shared time/pagination + structured field filters
// over session_flows. All fields optional; omitted ones are not constrained.
export interface HuntQuery {
  since?: Date | string
  until?: Date | string
  q?: string          // free substring across ip/app_proto/master_proto/type
  ip?: string         // matches src OR dst (exact)
  port?: number       // matches src OR dst
  proto?: string      // L4: TCP/UDP/ICMP/...
  app_proto?: string  // nDPI app proto, e.g. TLS/YOUTUBE
  category?: string   // nDPI category, e.g. VPN/Malware
  process?: string    // process_name substring
  risk_bit?: number   // single NDPI_RISK bit (bitTest)
  risk_only?: boolean // only flows with any risk
  limit?: number
  offset?: number
}

// One session spec for the batch /pcap/sessions merge download.
export interface PcapSessionSpec {
  src_ip: string
  dst_ip: string
  src_port?: number
  dst_port?: number
  proto?: string
}

// model.Session — generic session record. Many fields are protocol-specific;
// only `type` is guaranteed populated and identifies which fields apply.
export interface Session {
  id: number
  timestamp: string
  five_tuple: FiveTuple
  type: 'DNS' | 'HTTP' | 'TLS' | 'ICMP' | string
  domain?: string
  query_type?: string
  response_ip?: string
  response_ips?: string[]
  method?: string
  path?: string
  status_code?: number
  host?: string
  user_agent?: string
  content_type?: string
  post_data?: string
  icmp_type?: number
  icmp_code?: number
  icmp_seq?: number
  sni?: string
  ja3?: string
  cert_sha1?: string
  // TLS deep params (M2)
  tls_version?: string
  cipher_suite?: string
  alpn?: string
  ja3s?: string
  cert_subject?: string
  cert_issuer?: string
  cert_not_before?: string
  cert_not_after?: string
  cert_self_signed?: boolean
  // Latency waterfall (M2)
  tcp_connect_ms?: number
  tls_handshake_ms?: number
  payload_size: number
  ttl: string
  process_pid?: number
  process_name?: string
  process_exe?: string
  direction?: 'inbound' | 'outbound' | 'internal' | 'unknown'
}

// Uplink per-table stats
export interface TableStat {
  table: string
  rows_pushed: number
  rows_sent: number
  rows_failed: number
  flush_success: number
  flush_failed: number
  bytes_sent: number
  pending: number
  last_error?: string
  last_flush_at?: string
}

// Uplink status — GET /api/uplink/status
export interface UplinkStatus {
  connected: boolean
  enabled: boolean
  server_url: string
  api_key_masked: string
  agent_id: number
  probe_id: string
  org_id: number
  sent_batches: number
  failed_batches: number
  last_heartbeat?: string
  heartbeat_error?: string
  heartbeat_interval_s: number
  batch_rows: number
  flush_interval_s: number
  gzip: boolean
  error?: string
  upload_policy?: Record<string, string>
  aggregator_buckets?: number
  aggregator_window_s?: number
  total_bytes_sent?: number
  table_stats?: TableStat[]
}

// Uplink connect request — POST /api/uplink/connect
export interface UplinkConnectRequest {
  server_url: string
  api_key: string
  org_id?: number
  batch_rows?: number
  flush_interval_s?: number
  heartbeat_interval_s?: number
  gzip?: boolean
}

// Causal chain — GET /causal/chain?tx_id=...&depth=...
export interface CausalChainNode {
  tx_id: number
  tx_type: string
  ts: string
  session_id: number
  depth: number
  rule_id?: string
  confidence?: number
}

export interface CausalChainEdge {
  cause_tx_id: number
  effect_tx_id: number
  rule_id: string
  confidence: number
}

export interface CausalChain {
  root_tx_id: number
  nodes: CausalChainNode[]
  edges: CausalChainEdge[]
}

// ── VPN Detection ──────────────────────────────────────────────────

export interface VpnDetection {
  timestamp: string
  flow_hash: number
  src_ip: string
  dst_ip: string
  src_port: number
  dst_port: number
  protocol: string
  proto_name: string
  type: 'vpn' | 'anon' | 'proxy'
  confidence: 'high' | 'medium' | 'low'
  signals: string[]
  host?: string
  bytes_count: number
  packet_count: number
  duration_ms: number
}

export interface VpnDetectionStats {
  total_detections: number
  vpn_flows: number
  anon_flows: number
  proxy_flows: number
  high_conf: number
  medium_conf: number
  low_conf: number
}

// ── IP Lookup ──────────────────────────────────────────────────────

export interface IPInfo {
  ip: string
  country: string
  country_code: string
  region: string
  city: string
  lat: number
  lon: number
  isp: string
  org: string
  as: string
  as_name: string
  reverse: string
  is_private: boolean
  timezone: string
  cached: boolean
}
