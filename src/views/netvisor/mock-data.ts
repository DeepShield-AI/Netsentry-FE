import type { AgentStats } from '@/api/types'

// ── 工具函数：基于时间的种子随机数生成器 ──
// 确保同一时刻调用返回相同结果，实现数据源共享一致性
function seededRandom(seed: number): () => number {
  let s = seed | 0
  return () => {
    s = (s + 0x6D2B79F5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// 基于时间窗口的种子，每 5 秒变化一次
function timeSeed(offset = 0): number {
  return Math.floor(Date.now() / 5000) + offset
}

// ── 工具函数：生成时间序列 ──
function timeSeries(count: number, intervalSec = 5): string[] {
  const now = Date.now()
  const result: string[] = []
  for (let i = count - 1; i >= 0; i--) {
    result.push(new Date(now - i * intervalSec * 1000).toISOString())
  }
  return result
}

// ── 1. 带宽样本 (trafficBandwidth) ──
// GET /traffic/bandwidth?seconds=300
// 每 5 秒一个点，共 60 个时间点
export function mockTrafficBandwidth(): Array<{
  ts: string
  bytes_in: number
  bytes_out: number
  pkts_in: number
  pkts_out: number
}> {
  const tsList = timeSeries(60, 5)
  return tsList.map((ts, i) => {
    const seed = timeSeed(i * 7)
    const rng = seededRandom(seed)
    const baseIn = 400_000 + Math.sin((i + timeSeed()) * 0.3) * 120_000 + rng() * 60_000
    const baseOut = 800_000 + Math.cos((i + timeSeed()) * 0.25) * 200_000 + rng() * 80_000
    return {
      ts,
      bytes_in: Math.round(baseIn),
      bytes_out: Math.round(baseOut),
      pkts_in: Math.round(baseIn / 800 + rng() * 100),
      pkts_out: Math.round(baseOut / 800 + rng() * 100),
    }
  })
}

// ── 2. 探针统计 (AgentStats) ──
// GET /stats
export function mockStats(): AgentStats & {
  tcp_packets: number
  udp_packets: number
  icmp_packets: number
  syn_count: number
  synack_count: number
  loss_rate: number
  avg_latency: number
  retrans_rate: number
} {
  const rng = seededRandom(timeSeed(100))
  const jitter = (base: number, pct: number) => Math.round(base * (1 + (rng() - 0.5) * pct))
  return {
    packets: jitter(12_580_000, 0.1),
    bytes: jitter(9_500_000_000, 0.08),
    flows: jitter(184_500, 0.05),
    heartbeats: jitter(3_600, 0.02),
    dns_parsed: jitter(88_200, 0.04),
    http_parsed: jitter(52_400, 0.05),
    icmp_parsed: jitter(12_800, 0.03),
    tls_parsed: jitter(38_600, 0.04),
    parse_errors: jitter(42, 0.3),
    dns_tx_paired: jitter(86_000, 0.03),
    dns_tx_timeout: jitter(2_200, 0.1),
    http_tx_paired: jitter(51_000, 0.04),
    http_tx_timeout: jitter(1_400, 0.1),
    ndpi_classified: jitter(178_000, 0.03),
    ndpi_final: jitter(176_500, 0.03),
    ndpi_risk_flagged: jitter(1_240, 0.08),
    alerts_emitted: jitter(320, 0.15),
    alerts_suppressed: jitter(18, 0.2),
    last_hb_worker_id: 3,
    last_hb_rx_packets: jitter(15_600, 0.05),
    capture_rx_packets: jitter(12_580_000, 0.06),
    capture_rx_bytes: jitter(9_500_000_000, 0.06),
    capture_ipc_pushed: jitter(12_580_000, 0.06),
    capture_ipc_drops: 0,
    capture_flow_count: jitter(1_850, 0.08),
    ipc_drop_rate: 0,
    tcp_packets: jitter(8_500_000, 0.06),
    udp_packets: jitter(3_200_000, 0.06),
    icmp_packets: jitter(880_000, 0.06),
    syn_count: jitter(42_000, 0.08),
    synack_count: jitter(38_500, 0.08),
    loss_rate: +(0.0015 * (1 + (rng() - 0.5) * 0.4)).toFixed(4),
    avg_latency: +(12.35 * (1 + (rng() - 0.5) * 0.3)).toFixed(2),
    retrans_rate: +(0.028 * (1 + (rng() - 0.5) * 0.5)).toFixed(4),
  }
}

// ── 3. 近期流 (recentFlows) ──
// GET /recent/flows?n=500
export function mockRecentFlows(): Array<{
  timestamp: string
  five_tuple: any
  flow_hash: number
  packet_count: number
  bytes_count: number
  duration_ms: number
  session_type: string
  master_proto: string
  app_proto: string
  category: string
  ndpi_risk: number
  ndpi_final: boolean
  host: string
  process_name: string
  direction: string
  src_mac: string
  dst_mac: string
}> {
  const apps = [
    { app_proto: 'TLS', master_proto: 'TLS', category: 'WEB', host: 'www.google.com' },
    { app_proto: 'HTTP', master_proto: 'HTTP', category: 'WEB', host: 'www.baidu.com' },
    { app_proto: 'DNS', master_proto: 'DNS', category: 'NETWORK', host: 'dns.google' },
    { app_proto: 'GOOGLE', master_proto: 'TLS', category: 'WEB', host: 'www.google.com' },
    { app_proto: 'FACEBOOK', master_proto: 'TLS', category: 'SOCIAL', host: 'www.facebook.com' },
    { app_proto: 'YOUTUBE', master_proto: 'TLS', category: 'MEDIA', host: 'www.youtube.com' },
    { app_proto: 'WECHAT', master_proto: 'TLS', category: 'SOCIAL', host: 'wx.qq.com' },
    { app_proto: 'GITHUB', master_proto: 'TLS', category: 'WEB', host: 'github.com' },
    { app_proto: 'SSH', master_proto: 'SSH', category: 'NETWORK', host: '' },
    { app_proto: 'FTP', master_proto: 'FTP', category: 'NETWORK', host: '' },
    { app_proto: 'SMTP', master_proto: 'SMTP', category: 'EMAIL', host: 'smtp.gmail.com' },
    { app_proto: 'IMAP', master_proto: 'IMAP', category: 'EMAIL', host: 'imap.gmail.com' },
    { app_proto: 'DOUYIN', master_proto: 'TLS', category: 'MEDIA', host: 'www.douyin.com' },
    { app_proto: 'MICROSOFT', master_proto: 'TLS', category: 'WEB', host: 'www.microsoft.com' },
    { app_proto: 'AMAZON', master_proto: 'TLS', category: 'WEB', host: 'www.amazon.com' },
    { app_proto: 'NETFLIX', master_proto: 'TLS', category: 'MEDIA', host: 'www.netflix.com' },
    { app_proto: 'QQ', master_proto: 'TLS', category: 'SOCIAL', host: 'qq.com' },
    { app_proto: 'BAIDU', master_proto: 'HTTP', category: 'WEB', host: 'www.baidu.com' },
    { app_proto: 'TAOBAO', master_proto: 'TLS', category: 'WEB', host: 'www.taobao.com' },
    { app_proto: 'JD', master_proto: 'TLS', category: 'WEB', host: 'www.jd.com' },
  ]

  return Array.from({ length: 500 }, (_, i) => {
    const app = apps[i % apps.length]
    const srcIp = `192.168.${Math.floor(i / 256) + 1}.${(i % 254) + 1}`
    const dstIp = `10.${Math.floor(i / 256)}.${i % 256}.${Math.floor(Math.random() * 254) + 1}`
    return {
      timestamp: new Date(Date.now() - Math.random() * 300_000).toISOString(),
      five_tuple: { src_ip: srcIp, dst_ip: dstIp, src_port: 40000 + (i % 20000), dst_port: [80, 443, 53, 22, 8080, 8443, 25, 993, 3306, 6379][i % 10], proto: 'TCP' },
      flow_hash: 1000000 + i,
      packet_count: Math.floor(Math.random() * 500 + 10),
      bytes_count: Math.floor(Math.random() * 500_000 + 1_000),
      duration_ms: Math.floor(Math.random() * 60_000 + 100),
      session_type: app.master_proto,
      master_proto: app.master_proto,
      app_proto: app.app_proto,
      category: app.category,
      ndpi_risk: i % 20 === 0 ? 1 : 0,
      ndpi_final: true,
      host: app.host,
      process_name: '',
      direction: 'outbound',
      src_mac: `00:1A:${(i % 256).toString(16).padStart(2, '0').toUpperCase()}:${Math.floor(i / 256).toString(16).padStart(2, '0').toUpperCase()}:4D:5E`,
      dst_mac: '00:1B:2C:3D:4E:5F',
    }
  })
}

// ── 4. 按类别带宽 (trafficBandwidthByCategory) ──
// GET /traffic/bandwidth-by-category?seconds=300
export function mockTrafficBandwidthByCategory(): {
  categories: Array<{ key: string; label: string; color: string }>
  series: Record<string, Array<{ ts: string; value: number }>>
  pkt_series: Record<string, Array<{ ts: string; value: number }>>
  conn_series: Record<string, Array<{ ts: string; value: number }>>
} {
  const categories = [
    { key: 'web', label: 'Web', color: '#5470c6' },
    { key: 'media', label: '流媒体', color: '#91cc75' },
    { key: 'social', label: '社交', color: '#fac858' },
    { key: 'email', label: '邮件', color: '#ee6666' },
    { key: 'network', label: '网络服务', color: '#73c0de' },
    { key: 'other', label: '其他', color: '#fc8452' },
  ]

  const tsList = timeSeries(60, 5)
  const series: Record<string, Array<{ ts: string; value: number }>> = {}
  const pkt_series: Record<string, Array<{ ts: string; value: number }>> = {}
  const conn_series: Record<string, Array<{ ts: string; value: number }>> = {}

  const baseValues: Record<string, { bps: number; pps: number; conn: number }> = {
    web: { bps: 2_800_000, pps: 3_500, conn: 420 },
    media: { bps: 1_800_000, pps: 2_200, conn: 280 },
    social: { bps: 1_200_000, pps: 1_600, conn: 200 },
    email: { bps: 400_000, pps: 500, conn: 60 },
    network: { bps: 800_000, pps: 1_000, conn: 120 },
    other: { bps: 600_000, pps: 800, conn: 90 },
  }

  for (const cat of categories) {
    const base = baseValues[cat.key]
    const catSeed = timeSeed(cat.key.length * 13)
    series[cat.key] = tsList.map((ts, i) => {
      const rng = seededRandom(catSeed + i)
      return {
        ts,
        value: Math.round(base.bps + Math.sin((i + timeSeed()) * 0.3 + cat.key.length) * base.bps * 0.3 + rng() * base.bps * 0.15),
      }
    })
    pkt_series[cat.key] = tsList.map((ts, i) => {
      const rng = seededRandom(catSeed + i + 1000)
      return {
        ts,
        value: Math.round(base.pps + Math.cos((i + timeSeed()) * 0.25 + cat.key.length) * base.pps * 0.25 + rng() * base.pps * 0.1),
      }
    })
    conn_series[cat.key] = tsList.map((ts, i) => {
      const rng = seededRandom(catSeed + i + 2000)
      return {
        ts,
        value: Math.round(base.conn + Math.sin((i + timeSeed()) * 0.2) * base.conn * 0.2 + rng() * base.conn * 0.1),
      }
    })
  }

  return { categories, series, pkt_series, conn_series }
}

// ── 5. 在线用户 (trafficOnlineUsers) ──
// GET /traffic/online-users
export function mockTrafficOnlineUsers(): Array<{
  ip: string
  mac: string
  bytes: number
  packets: number
  sessions: number
  first_seen: string
  last_seen: string
  auth_method: string
  hostname: string
}> {
  const now = Date.now()
  const authMethods = ['802.1x', 'Portal', 'MAC', 'Mirror']
  const hostnames = ['james', 'lisa', 'tom', 'admin', 'guest', 'devops', 'sarah', 'mike', 'anna', 'root']
  return Array.from({ length: 84 }, (_, i) => {
    const firstSeen = new Date(now - Math.random() * 3600_000)
    const idle = Math.random() < 0.2
    const lastSeen = new Date(now - (idle ? Math.random() * 300_000 + 60_000 : Math.random() * 60_000))
    return {
      ip: `192.168.${Math.floor(i / 256) + 1}.${(i % 254) + 2}`,
      mac: `00:1A:2B:${(i % 256).toString(16).padStart(2, '0').toUpperCase()}:${((i * 3) % 256).toString(16).padStart(2, '0').toUpperCase()}:${((i * 7) % 256).toString(16).padStart(2, '0').toUpperCase()}`,
      bytes: Math.floor(Math.random() * 500_000_000 + 10_000_000),
      packets: Math.floor(Math.random() * 500_000 + 1_000),
      sessions: Math.floor(Math.random() * 50 + 1),
      first_seen: firstSeen.toISOString(),
      last_seen: lastSeen.toISOString(),
      auth_method: authMethods[i % authMethods.length],
      hostname: hostnames[i % hostnames.length],
    }
  })
}

// ── 6. 系统信息 (systemInfo) ──
// GET /system-info
export function mockSystemInfo(): {
  system_time: string
  uptime_seconds: number
  version: string
  go_version: string
  os: string
  arch: string
  num_cpu: number
  hostname: string
  cpu_usage: number
  mem_total: number
  mem_used: number
  mem_usage: number
  disk_total: number
  disk_used: number
  disk_usage: number
  interfaces: Array<{ name: string; status: string; ip: string; mac: string; rx_bytes: number; tx_bytes: number }>
  load_avg_1: number
  load_avg_5: number
  load_avg_15: number
} {
  return {
    system_time: new Date().toISOString(),
    uptime_seconds: 1_320_000,
    version: 'NetSentry v2.5.1',
    go_version: 'go1.22.3',
    os: 'linux',
    arch: 'amd64',
    num_cpu: 8,
    hostname: 'netsentry-probe-01',
    cpu_usage: 45,
    mem_total: 16_777_216_000,
    mem_used: 10_400_000_000,
    mem_usage: 62,
    disk_total: 500_000_000_000,
    disk_used: 190_000_000_000,
    disk_usage: 38,
    interfaces: [
      { name: 'eth0', status: 'up', ip: '192.168.1.100', mac: '00:1A:2B:3C:4D:5E', rx_bytes: 8_500_000_000, tx_bytes: 3_200_000_000 },
      { name: 'eth1', status: 'up', ip: '10.0.0.1', mac: '00:1A:2B:3C:4D:5F', rx_bytes: 2_100_000_000, tx_bytes: 1_500_000_000 },
      { name: 'eth2', status: 'down', ip: '', mac: '00:1A:2B:3C:4D:60', rx_bytes: 0, tx_bytes: 0 },
    ],
    load_avg_1: 0.85,
    load_avg_5: 0.72,
    load_avg_15: 0.65,
  }
}

// ── 7. Top应用 (top-apps) ──
// GET /traffic/top-apps?n=50
export function mockTopApps(): Array<{
  key: string
  sessions: number
  bytes: number
  bytes_in: number
  bytes_out: number
  packets: number
}> {
  const apps = [
    { key: 'HTTP', sessions: 452, bytes: 850_000_000, bytes_in: 600_000_000, bytes_out: 250_000_000, packets: 680_000 },
    { key: 'HTTPS', sessions: 386, bytes: 1_200_000_000, bytes_in: 880_000_000, bytes_out: 320_000_000, packets: 920_000 },
    { key: 'TLS', sessions: 320, bytes: 980_000_000, bytes_in: 720_000_000, bytes_out: 260_000_000, packets: 780_000 },
    { key: 'DNS', sessions: 125, bytes: 45_000_000, bytes_in: 20_000_000, bytes_out: 25_000_000, packets: 180_000 },
    { key: 'GOOGLE', sessions: 95, bytes: 520_000_000, bytes_in: 380_000_000, bytes_out: 140_000_000, packets: 420_000 },
    { key: 'YOUTUBE', sessions: 88, bytes: 680_000_000, bytes_in: 580_000_000, bytes_out: 100_000_000, packets: 550_000 },
    { key: 'WECHAT', sessions: 76, bytes: 320_000_000, bytes_in: 200_000_000, bytes_out: 120_000_000, packets: 260_000 },
    { key: 'GITHUB', sessions: 65, bytes: 180_000_000, bytes_in: 120_000_000, bytes_out: 60_000_000, packets: 150_000 },
    { key: 'SSH', sessions: 52, bytes: 28_000_000, bytes_in: 12_000_000, bytes_out: 16_000_000, packets: 45_000 },
    { key: 'DOUYIN', sessions: 48, bytes: 420_000_000, bytes_in: 380_000_000, bytes_out: 40_000_000, packets: 340_000 },
    { key: 'FACEBOOK', sessions: 42, bytes: 180_000_000, bytes_in: 130_000_000, bytes_out: 50_000_000, packets: 150_000 },
    { key: 'FTP', sessions: 38, bytes: 95_000_000, bytes_in: 25_000_000, bytes_out: 70_000_000, packets: 80_000 },
    { key: 'BAIDU', sessions: 35, bytes: 120_000_000, bytes_in: 90_000_000, bytes_out: 30_000_000, packets: 100_000 },
    { key: 'TAOBAO', sessions: 32, bytes: 85_000_000, bytes_in: 60_000_000, bytes_out: 25_000_000, packets: 72_000 },
    { key: 'QQ', sessions: 30, bytes: 160_000_000, bytes_in: 100_000_000, bytes_out: 60_000_000, packets: 130_000 },
    { key: 'AMAZON', sessions: 28, bytes: 75_000_000, bytes_in: 55_000_000, bytes_out: 20_000_000, packets: 62_000 },
    { key: 'NETFLIX', sessions: 25, bytes: 350_000_000, bytes_in: 320_000_000, bytes_out: 30_000_000, packets: 280_000 },
    { key: 'MICROSOFT', sessions: 22, bytes: 65_000_000, bytes_in: 45_000_000, bytes_out: 20_000_000, packets: 55_000 },
    { key: 'SMTP', sessions: 20, bytes: 18_000_000, bytes_in: 6_000_000, bytes_out: 12_000_000, packets: 28_000 },
    { key: 'JD', sessions: 18, bytes: 42_000_000, bytes_in: 30_000_000, bytes_out: 12_000_000, packets: 36_000 },
    { key: 'BILIBILI', sessions: 16, bytes: 280_000_000, bytes_in: 250_000_000, bytes_out: 30_000_000, packets: 220_000 },
    { key: 'IMAP', sessions: 15, bytes: 12_000_000, bytes_in: 8_000_000, bytes_out: 4_000_000, packets: 18_000 },
    { key: 'SPOTIFY', sessions: 14, bytes: 180_000_000, bytes_in: 160_000_000, bytes_out: 20_000_000, packets: 145_000 },
    { key: 'REDIS', sessions: 12, bytes: 8_000_000, bytes_in: 3_000_000, bytes_out: 5_000_000, packets: 12_000 },
    { key: 'MYSQL', sessions: 10, bytes: 15_000_000, bytes_in: 5_000_000, bytes_out: 10_000_000, packets: 20_000 },
    { key: 'DROPBOX', sessions: 8, bytes: 55_000_000, bytes_in: 40_000_000, bytes_out: 15_000_000, packets: 45_000 },
    { key: 'SLACK', sessions: 7, bytes: 22_000_000, bytes_in: 14_000_000, bytes_out: 8_000_000, packets: 18_000 },
    { key: 'ZOOM', sessions: 6, bytes: 120_000_000, bytes_in: 80_000_000, bytes_out: 40_000_000, packets: 95_000 },
    { key: 'TELNET', sessions: 5, bytes: 3_000_000, bytes_in: 1_000_000, bytes_out: 2_000_000, packets: 5_000 },
    { key: 'NTP', sessions: 4, bytes: 1_200_000, bytes_in: 600_000, bytes_out: 600_000, packets: 2_500 },
    { key: 'SNMP', sessions: 3, bytes: 800_000, bytes_in: 400_000, bytes_out: 400_000, packets: 1_800 },
    { key: 'DHCP', sessions: 2, bytes: 500_000, bytes_in: 200_000, bytes_out: 300_000, packets: 1_200 },
    { key: 'RDP', sessions: 2, bytes: 6_000_000, bytes_in: 2_000_000, bytes_out: 4_000_000, packets: 8_000 },
    { key: 'KUBERNETES', sessions: 2, bytes: 18_000_000, bytes_in: 10_000_000, bytes_out: 8_000_000, packets: 14_000 },
    { key: 'ICMP', sessions: 12, bytes: 2_400_000, bytes_in: 1_200_000, bytes_out: 1_200_000, packets: 3_600 },
    { key: 'QUIC', sessions: 8, bytes: 320_000_000, bytes_in: 280_000_000, bytes_out: 40_000_000, packets: 260_000 },
    { key: 'SMB', sessions: 5, bytes: 28_000_000, bytes_in: 10_000_000, bytes_out: 18_000_000, packets: 22_000 },
    { key: 'LDAP', sessions: 3, bytes: 5_000_000, bytes_in: 2_000_000, bytes_out: 3_000_000, packets: 6_000 },
    { key: 'POSTGRES', sessions: 2, bytes: 8_000_000, bytes_in: 3_000_000, bytes_out: 5_000_000, packets: 10_000 },
    { key: 'MQTT', sessions: 2, bytes: 1_500_000, bytes_in: 800_000, bytes_out: 700_000, packets: 2_200 },
    { key: 'GRPC', sessions: 4, bytes: 12_000_000, bytes_in: 6_000_000, bytes_out: 6_000_000, packets: 9_000 },
    { key: 'WEIBO', sessions: 15, bytes: 65_000_000, bytes_in: 48_000_000, bytes_out: 17_000_000, packets: 52_000 },
    { key: 'ZHIHU', sessions: 12, bytes: 38_000_000, bytes_in: 28_000_000, bytes_out: 10_000_000, packets: 30_000 },
    { key: 'KUAISHOU', sessions: 10, bytes: 180_000_000, bytes_in: 160_000_000, bytes_out: 20_000_000, packets: 145_000 },
    { key: 'CSDN', sessions: 8, bytes: 22_000_000, bytes_in: 16_000_000, bytes_out: 6_000_000, packets: 18_000 },
    { key: 'IQIYI', sessions: 7, bytes: 250_000_000, bytes_in: 230_000_000, bytes_out: 20_000_000, packets: 200_000 },
    { key: 'TENCENT_VIDEO', sessions: 6, bytes: 220_000_000, bytes_in: 200_000_000, bytes_out: 20_000_000, packets: 175_000 },
    { key: 'HONOR_OF_KINGS', sessions: 5, bytes: 45_000_000, bytes_in: 20_000_000, bytes_out: 25_000_000, packets: 36_000 },
    { key: 'DINGTALK', sessions: 8, bytes: 28_000_000, bytes_in: 16_000_000, bytes_out: 12_000_000, packets: 22_000 },
    { key: 'WEWORK', sessions: 6, bytes: 22_000_000, bytes_in: 12_000_000, bytes_out: 10_000_000, packets: 18_000 },
  ]
  return apps
}

// ── 8. Top连接 (top-connections) ──
// GET /traffic/top-connections?n=50
export function mockTopConnections(): Array<{
  key: string
  sessions: number
  bytes: number
  bytes_out: number
  bytes_in: number
  packets: number
  first_seen: string
  last_seen: string
}> {
  const now = Date.now()
  const conns = [
    { key: '192.168.1.100:52341→142.250.80.110:443', sessions: 850, bytes: 520_000_000, bytes_out: 180_000_000, bytes_in: 340_000_000, packets: 420_000 },
    { key: '192.168.1.101:49876→180.101.49.11:443', sessions: 720, bytes: 380_000_000, bytes_out: 120_000_000, bytes_in: 260_000_000, packets: 310_000 },
    { key: '192.168.1.100:52342→8.8.8.8:53', sessions: 680, bytes: 18_000_000, bytes_out: 8_000_000, bytes_in: 10_000_000, packets: 36_000 },
    { key: '192.168.1.102:55123→14.215.177.38:80', sessions: 560, bytes: 280_000_000, bytes_out: 90_000_000, bytes_in: 190_000_000, packets: 230_000 },
    { key: '192.168.1.103:60123→110.242.68.3:443', sessions: 480, bytes: 350_000_000, bytes_out: 110_000_000, bytes_in: 240_000_000, packets: 280_000 },
    { key: '192.168.1.100:52345→20.205.243.166:443', sessions: 420, bytes: 180_000_000, bytes_out: 60_000_000, bytes_in: 120_000_000, packets: 145_000 },
    { key: '192.168.1.104:62345→106.11.68.13:53', sessions: 380, bytes: 12_000_000, bytes_out: 5_000_000, bytes_in: 7_000_000, packets: 24_000 },
    { key: '192.168.1.101:49880→220.181.38.148:8080', sessions: 350, bytes: 220_000_000, bytes_out: 70_000_000, bytes_in: 150_000_000, packets: 180_000 },
    { key: '192.168.1.105:45210→31.13.24.35:443', sessions: 320, bytes: 160_000_000, bytes_out: 55_000_000, bytes_in: 105_000_000, packets: 130_000 },
    { key: '192.168.1.100:52350→74.125.200.94:443', sessions: 290, bytes: 240_000_000, bytes_out: 80_000_000, bytes_in: 160_000_000, packets: 195_000 },
    { key: '192.168.1.106:33128→52.84.132.65:443', sessions: 260, bytes: 130_000_000, bytes_out: 45_000_000, bytes_in: 85_000_000, packets: 105_000 },
    { key: '192.168.1.102:55125→13.107.42.14:443', sessions: 240, bytes: 110_000_000, bytes_out: 38_000_000, bytes_in: 72_000_000, packets: 90_000 },
    { key: '192.168.1.107:54210→93.184.216.34:80', sessions: 220, bytes: 95_000_000, bytes_out: 32_000_000, bytes_in: 63_000_000, packets: 78_000 },
    { key: '192.168.1.103:60125→151.101.1.140:443', sessions: 200, bytes: 85_000_000, bytes_out: 30_000_000, bytes_in: 55_000_000, packets: 68_000 },
    { key: '192.168.1.100:52355→17.253.144.10:443', sessions: 185, bytes: 140_000_000, bytes_out: 48_000_000, bytes_in: 92_000_000, packets: 115_000 },
    { key: '192.168.1.108:42156→23.32.0.162:443', sessions: 170, bytes: 120_000_000, bytes_out: 42_000_000, bytes_in: 78_000_000, packets: 98_000 },
    { key: '192.168.1.104:62350→119.75.217.109:443', sessions: 155, bytes: 78_000_000, bytes_out: 26_000_000, bytes_in: 52_000_000, packets: 62_000 },
    { key: '192.168.1.109:38765→54.239.28.85:443', sessions: 140, bytes: 65_000_000, bytes_out: 22_000_000, bytes_in: 43_000_000, packets: 52_000 },
    { key: '192.168.1.101:49882→192.168.1.200:22', sessions: 130, bytes: 15_000_000, bytes_out: 5_000_000, bytes_in: 10_000_000, packets: 24_000 },
    { key: '192.168.1.110:52134→104.244.42.65:443', sessions: 120, bytes: 55_000_000, bytes_out: 18_000_000, bytes_in: 37_000_000, packets: 44_000 },
    { key: '192.168.1.102:55130→192.168.1.250:3306', sessions: 115, bytes: 8_000_000, bytes_out: 3_000_000, bytes_in: 5_000_000, packets: 12_000 },
    { key: '192.168.1.100:52360→216.58.200.202:443', sessions: 110, bytes: 48_000_000, bytes_out: 16_000_000, bytes_in: 32_000_000, packets: 38_000 },
    { key: '192.168.1.111:43210→185.60.216.35:443', sessions: 105, bytes: 42_000_000, bytes_out: 15_000_000, bytes_in: 27_000_000, packets: 34_000 },
    { key: '192.168.1.105:45215→173.194.67.95:443', sessions: 100, bytes: 38_000_000, bytes_out: 13_000_000, bytes_in: 25_000_000, packets: 30_000 },
    { key: '192.168.1.112:39876→52.85.132.82:443', sessions: 95, bytes: 35_000_000, bytes_out: 12_000_000, bytes_in: 23_000_000, packets: 28_000 },
    { key: '192.168.1.103:60130→192.168.1.201:6379', sessions: 90, bytes: 5_000_000, bytes_out: 2_000_000, bytes_in: 3_000_000, packets: 8_000 },
    { key: '192.168.1.113:56789→13.224.161.60:443', sessions: 85, bytes: 32_000_000, bytes_out: 11_000_000, bytes_in: 21_000_000, packets: 26_000 },
    { key: '192.168.1.106:33130→192.168.1.202:25', sessions: 80, bytes: 6_000_000, bytes_out: 2_000_000, bytes_in: 4_000_000, packets: 10_000 },
    { key: '192.168.1.114:45678→103.235.46.40:443', sessions: 75, bytes: 28_000_000, bytes_out: 10_000_000, bytes_in: 18_000_000, packets: 22_000 },
    { key: '192.168.1.100:52365→52.219.40.100:443', sessions: 70, bytes: 25_000_000, bytes_out: 9_000_000, bytes_in: 16_000_000, packets: 20_000 },
    { key: '192.168.1.115:32145→18.165.183.95:443', sessions: 68, bytes: 22_000_000, bytes_out: 8_000_000, bytes_in: 14_000_000, packets: 18_000 },
    { key: '192.168.1.107:54215→192.168.1.203:8080', sessions: 65, bytes: 18_000_000, bytes_out: 6_000_000, bytes_in: 12_000_000, packets: 14_000 },
    { key: '192.168.1.116:38901→13.33.243.70:443', sessions: 62, bytes: 20_000_000, bytes_out: 7_000_000, bytes_in: 13_000_000, packets: 16_000 },
    { key: '192.168.1.108:42160→52.95.84.35:443', sessions: 58, bytes: 16_000_000, bytes_out: 5_500_000, bytes_in: 10_500_000, packets: 13_000 },
    { key: '192.168.1.117:47654→99.84.178.65:443', sessions: 55, bytes: 15_000_000, bytes_out: 5_000_000, bytes_in: 10_000_000, packets: 12_000 },
    { key: '192.168.1.109:38770→192.168.1.204:21', sessions: 52, bytes: 28_000_000, bytes_out: 8_000_000, bytes_in: 20_000_000, packets: 22_000 },
    { key: '192.168.1.118:52198→143.204.98.88:443', sessions: 50, bytes: 14_000_000, bytes_out: 5_000_000, bytes_in: 9_000_000, packets: 11_000 },
    { key: '192.168.1.110:52138→18.154.144.30:443', sessions: 48, bytes: 13_000_000, bytes_out: 4_500_000, bytes_in: 8_500_000, packets: 10_000 },
    { key: '192.168.1.100:52370→192.168.1.205:5432', sessions: 45, bytes: 6_000_000, bytes_out: 2_000_000, bytes_in: 4_000_000, packets: 8_000 },
    { key: '192.168.1.119:65432→13.226.225.55:443', sessions: 42, bytes: 12_000_000, bytes_out: 4_000_000, bytes_in: 8_000_000, packets: 10_000 },
    { key: '192.168.1.111:43215→52.85.49.102:443', sessions: 40, bytes: 11_000_000, bytes_out: 3_800_000, bytes_in: 7_200_000, packets: 9_000 },
    { key: '192.168.1.120:30987→18.66.122.108:443', sessions: 38, bytes: 10_000_000, bytes_out: 3_500_000, bytes_in: 6_500_000, packets: 8_000 },
    { key: '192.168.1.112:39880→192.168.1.206:8443', sessions: 35, bytes: 9_000_000, bytes_out: 3_000_000, bytes_in: 6_000_000, packets: 7_000 },
    { key: '192.168.1.121:56723→13.35.102.33:443', sessions: 32, bytes: 8_500_000, bytes_out: 2_800_000, bytes_in: 5_700_000, packets: 7_000 },
    { key: '192.168.1.113:56792→54.192.147.25:443', sessions: 30, bytes: 8_000_000, bytes_out: 2_500_000, bytes_in: 5_500_000, packets: 6_500 },
    { key: '192.168.1.122:49987→18.244.60.38:443', sessions: 28, bytes: 7_500_000, bytes_out: 2_500_000, bytes_in: 5_000_000, packets: 6_000 },
    { key: '192.168.1.114:45682→192.168.1.207:9090', sessions: 25, bytes: 5_500_000, bytes_out: 2_000_000, bytes_in: 3_500_000, packets: 4_500 },
    { key: '192.168.1.123:34567→13.224.103.105:443', sessions: 22, bytes: 6_000_000, bytes_out: 2_000_000, bytes_in: 4_000_000, packets: 5_000 },
    { key: '192.168.1.115:32150→52.222.149.10:443', sessions: 20, bytes: 5_000_000, bytes_out: 1_800_000, bytes_in: 3_200_000, packets: 4_000 },
    { key: '192.168.1.124:41234→18.245.60.98:443', sessions: 18, bytes: 4_500_000, bytes_out: 1_500_000, bytes_in: 3_000_000, packets: 3_500 },
  ]

  return conns.map(c => ({
    ...c,
    packets: c.packets || Math.round(c.bytes / 1200),
    first_seen: new Date(now - Math.random() * 3600_000).toISOString(),
    last_seen: new Date(now - Math.random() * 60_000).toISOString(),
  }))
}

// ── 9. Top域名 (top-domains) ──
// GET /traffic/top-domains?n=30
export function mockTopDomains(): Array<{
  key: string
  sessions: number
  bytes: number
  packets: number
}> {
  const domains = [
    { key: 'www.baidu.com', sessions: 12500, bytes: 380_000_000, packets: 520_000 },
    { key: 'www.google.com', sessions: 10800, bytes: 420_000_000, packets: 580_000 },
    { key: 'www.taobao.com', sessions: 8500, bytes: 260_000_000, packets: 350_000 },
    { key: 'www.jd.com', sessions: 7200, bytes: 220_000_000, packets: 300_000 },
    { key: 'www.qq.com', sessions: 6800, bytes: 180_000_000, packets: 250_000 },
    { key: 'www.bilibili.com', sessions: 6200, bytes: 320_000_000, packets: 420_000 },
    { key: 'www.douyin.com', sessions: 5800, bytes: 350_000_000, packets: 460_000 },
    { key: 'www.weibo.com', sessions: 5200, bytes: 160_000_000, packets: 220_000 },
    { key: 'www.zhihu.com', sessions: 4800, bytes: 140_000_000, packets: 190_000 },
    { key: 'www.tmall.com', sessions: 4500, bytes: 200_000_000, packets: 270_000 },
    { key: 'github.com', sessions: 4200, bytes: 180_000_000, packets: 240_000 },
    { key: 'www.youtube.com', sessions: 3800, bytes: 280_000_000, packets: 380_000 },
    { key: 'www.amazon.com', sessions: 3500, bytes: 120_000_000, packets: 160_000 },
    { key: 'www.netflix.com', sessions: 3200, bytes: 250_000_000, packets: 340_000 },
    { key: 'www.microsoft.com', sessions: 2900, bytes: 90_000_000, packets: 120_000 },
    { key: 'www.apple.com', sessions: 2600, bytes: 80_000_000, packets: 110_000 },
    { key: 'www.163.com', sessions: 2400, bytes: 75_000_000, packets: 100_000 },
    { key: 'www.sohu.com', sessions: 2200, bytes: 65_000_000, packets: 88_000 },
    { key: 'www.sina.com.cn', sessions: 2000, bytes: 60_000_000, packets: 82_000 },
    { key: 'www.csdn.net', sessions: 1800, bytes: 55_000_000, packets: 75_000 },
    { key: 'www.kuaishou.com', sessions: 1600, bytes: 200_000_000, packets: 270_000 },
    { key: 'stackoverflow.com', sessions: 1400, bytes: 45_000_000, packets: 62_000 },
    { key: 'www.facebook.com', sessions: 1300, bytes: 60_000_000, packets: 82_000 },
    { key: 'www.twitter.com', sessions: 1200, bytes: 50_000_000, packets: 68_000 },
    { key: 'www.linkedin.com', sessions: 1100, bytes: 40_000_000, packets: 55_000 },
    { key: 'www.instagram.com', sessions: 1000, bytes: 45_000_000, packets: 62_000 },
    { key: 'www.reddit.com', sessions: 900, bytes: 35_000_000, packets: 48_000 },
    { key: 'www.twitch.tv', sessions: 800, bytes: 180_000_000, packets: 250_000 },
    { key: 'www.spotify.com', sessions: 700, bytes: 150_000_000, packets: 200_000 },
    { key: 'www.dropbox.com', sessions: 600, bytes: 50_000_000, packets: 68_000 },
  ]
  return domains
}