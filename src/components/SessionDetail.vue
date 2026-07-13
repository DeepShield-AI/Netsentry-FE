<template>
  <el-drawer
    v-model="open"
    :title="title"
    direction="rtl"
    size="520px"
    :destroy-on-close="false"
  >
    <div v-if="session" class="detail">
      <!-- ── header summary ─────────────────────────────────────────── -->
      <div class="head">
        <el-tag :type="typeTone" effect="dark" round>{{ session.type }}</el-tag>
        <span class="ts mono">{{ formatStamp(session.timestamp) }}</span>
      </div>

      <!-- ── 5-tuple block ──────────────────────────────────────────── -->
      <section>
        <div class="sec-title">Connection</div>
        <el-descriptions :column="1" size="small" border>
          <el-descriptions-item label="Source">
            <span class="mono">{{ prettyIP(session.five_tuple.src_ip) }}:{{ session.five_tuple.src_port }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="Destination">
            <span class="mono">{{ prettyIP(session.five_tuple.dst_ip) }}:{{ session.five_tuple.dst_port }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="Protocol">{{ session.five_tuple.protocol }}</el-descriptions-item>
          <el-descriptions-item label="Payload bytes">{{ session.payload_size ?? 0 }}</el-descriptions-item>
        </el-descriptions>
        <div class="pcap-actions">
          <el-button
            type="primary"
            size="small"
            tag="a"
            :href="pcapUrl"
            target="_blank"
            :icon="Download"
          >
            下载本会话 PCAP
          </el-button>
          <span class="muted small">从全流量存储按五元组（双向）提取；需已开启全流量存储</span>
        </div>
      </section>

      <!-- ── DNS-specific ──────────────────────────────────────────── -->
      <section v-if="session.type === 'DNS'">
        <div class="sec-title">DNS</div>
        <el-descriptions :column="1" size="small" border>
          <el-descriptions-item label="Domain">
            <span class="mono">{{ session.domain }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="Query type">{{ session.query_type ?? '—' }}</el-descriptions-item>
          <el-descriptions-item label="Answers">
            <div v-if="dnsIPs.length === 0" class="muted small">— query only</div>
            <ul v-else class="ip-list">
              <li v-for="ip in dnsIPs" :key="ip" class="mono small">{{ prettyIP(ip) }}</li>
            </ul>
          </el-descriptions-item>
        </el-descriptions>
      </section>

      <!-- ── HTTP-specific ──────────────────────────────────────────── -->
      <section v-else-if="session.type === 'HTTP'">
        <div class="sec-title">HTTP</div>
        <el-descriptions :column="1" size="small" border>
          <el-descriptions-item label="Method">
            <el-tag size="small">{{ session.method ?? '—' }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="Status">
            <el-tag v-if="session.status_code" :type="statusTone(session.status_code)" size="small">
              {{ session.status_code }}
            </el-tag>
            <span v-else class="muted small">—</span>
          </el-descriptions-item>
          <el-descriptions-item label="Host">
            <span class="mono">{{ session.host || '—' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="Path">
            <span class="mono break">{{ session.path || '—' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="Content-Type">
            <span class="mono">{{ session.content_type || '—' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="User-Agent">
            <span class="mono small break">{{ session.user_agent || '—' }}</span>
          </el-descriptions-item>
          <el-descriptions-item v-if="session.post_data" label="POST data">
            <pre class="codeblock">{{ session.post_data }}</pre>
          </el-descriptions-item>
        </el-descriptions>
      </section>

      <!-- ── TLS-specific ──────────────────────────────────────────── -->
      <section v-else-if="session.type === 'TLS'">
        <div class="sec-title">TLS handshake</div>
        <el-descriptions :column="1" size="small" border>
          <el-descriptions-item label="SNI">
            <span class="mono">{{ session.sni || '—' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="TLS Version">
            <el-tag v-if="session.tls_version" size="small" :type="tlsVerTone(session.tls_version)">
              {{ session.tls_version }}
            </el-tag>
            <span v-else class="muted small">—</span>
          </el-descriptions-item>
          <el-descriptions-item label="Cipher Suite">
            <span class="mono small">{{ session.cipher_suite || '—' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="ALPN">
            <el-tag v-if="session.alpn" size="small" effect="plain">{{ session.alpn }}</el-tag>
            <span v-else class="muted small">—</span>
          </el-descriptions-item>
          <el-descriptions-item label="JA3">
            <span class="mono small break">{{ session.ja3 || '—' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="JA3S">
            <span class="mono small break">{{ session.ja3s || '—' }}</span>
          </el-descriptions-item>
        </el-descriptions>

        <!-- Latency waterfall — visual bar chart -->
        <div v-if="session.tcp_connect_ms || session.tls_handshake_ms" style="margin-top: 12px">
          <div class="sec-title">Latency Waterfall</div>
          <div class="waterfall">
            <div v-if="session.tcp_connect_ms" class="wf-row">
              <span class="wf-label">TCP</span>
              <div class="wf-track">
                <div class="wf-bar wf-tcp" :style="{ width: wfPct(session.tcp_connect_ms) + '%' }"></div>
              </div>
              <span class="wf-val mono" :class="latencyClass(session.tcp_connect_ms)">
                {{ session.tcp_connect_ms.toFixed(1) }} ms
              </span>
            </div>
            <div v-if="session.tls_handshake_ms" class="wf-row">
              <span class="wf-label">TLS</span>
              <div class="wf-track">
                <div
                  class="wf-bar wf-tls"
                  :style="{ width: wfPct(session.tls_handshake_ms) + '%', marginLeft: wfPct(session.tcp_connect_ms || 0) + '%' }"
                ></div>
              </div>
              <span class="wf-val mono" :class="latencyClass(session.tls_handshake_ms)">
                {{ session.tls_handshake_ms.toFixed(1) }} ms
              </span>
            </div>
            <div v-if="session.tcp_connect_ms && session.tls_handshake_ms" class="wf-row wf-total">
              <span class="wf-label">Total</span>
              <div class="wf-track"></div>
              <span class="wf-val mono" :class="latencyClass(totalMs)">
                {{ totalMs.toFixed(1) }} ms
              </span>
            </div>
          </div>
        </div>
        <div v-else style="margin-top: 12px">
          <div class="sec-title">Latency Waterfall</div>
          <span class="muted small">— SYN/Server Hello 未捕获</span>
        </div>

        <!-- Certificate details -->
        <div v-if="session.cert_sha1 || session.cert_subject" style="margin-top: 12px">
          <div class="sec-title">
            Certificate
            <el-tag v-if="session.cert_self_signed" type="danger" size="small" style="margin-left: 8px">自签名</el-tag>
            <el-tag v-if="certExpired" type="danger" size="small" style="margin-left: 4px">已过期</el-tag>
            <el-tag v-else-if="certExpiringSoon" type="warning" size="small" style="margin-left: 4px">即将过期</el-tag>
          </div>
          <el-descriptions :column="1" size="small" border>
            <el-descriptions-item label="Subject">
              <span class="mono small">{{ session.cert_subject || '—' }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="Issuer">
              <span class="mono small">{{ session.cert_issuer || '—' }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="Valid">
              <span class="mono small" :class="{ 'cert-expired': certExpired, 'cert-expiring': certExpiringSoon && !certExpired }">
                {{ session.cert_not_before ? formatDate(session.cert_not_before) : '—' }} — {{ session.cert_not_after ? formatDate(session.cert_not_after) : '—' }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="SHA1">
              <span class="mono small break">{{ session.cert_sha1 || '—' }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </section>

      <!-- ── ICMP-specific ─────────────────────────────────────────── -->
      <section v-else-if="session.type === 'ICMP'">
        <div class="sec-title">ICMP</div>
        <el-descriptions :column="1" size="small" border>
          <el-descriptions-item label="Type">
            {{ session.icmp_type ?? '—' }}
            <span v-if="session.icmp_type !== undefined" class="muted small">
              · {{ icmpTypeName(session.icmp_type) }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="Code">
            {{ session.icmp_code ?? '—' }}
            <span v-if="session.icmp_code !== undefined" class="muted small">
              · {{ icmpCodeLabel(session.icmp_type, session.icmp_code) }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="Sequence">{{ session.icmp_seq ?? '—' }}</el-descriptions-item>
        </el-descriptions>
      </section>

      <!-- ── process (optional) ─────────────────────────────────────── -->
      <section v-if="session.process_name || session.process_pid">
        <div class="sec-title">Process</div>
        <el-descriptions :column="1" size="small" border>
          <el-descriptions-item label="PID">{{ session.process_pid ?? '—' }}</el-descriptions-item>
          <el-descriptions-item label="Name">
            <span class="mono">{{ session.process_name || '—' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="Executable">
            <span class="mono small break">{{ session.process_exe || '—' }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </section>

      <!-- ── raw JSON ───────────────────────────────────────────────── -->
      <section>
        <el-collapse>
          <el-collapse-item title="Raw JSON" name="json">
            <pre class="codeblock">{{ pretty }}</pre>
          </el-collapse-item>
        </el-collapse>
      </section>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Download } from '@element-plus/icons-vue'
import { api } from '@/api/client'
import type { Session } from '@/api/types'
import { prettyIP } from '@/utils/format'
import { icmpCodeLabel, icmpTypeName } from '@/utils/icmp'

const props = defineProps<{
  modelValue: boolean
  session: Session | null
}>()
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()

const open = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const title = computed(() => {
  if (!props.session) return 'Session'
  return `${props.session.type} · ${prettyIP(props.session.five_tuple.dst_ip)}`
})

const typeTone = computed<'success' | 'info' | 'warning' | 'danger'>(() => {
  switch (props.session?.type) {
    case 'DNS':
      return 'info'
    case 'HTTP':
      return 'warning'
    case 'TLS':
      return 'success'
    case 'ICMP':
      return 'danger'
    default:
      return 'info'
  }
})

const pretty = computed(() => JSON.stringify(props.session ?? {}, null, 2))

// Per-session PCAP download URL (Arkime-style offset index, both directions).
// A ±5min window around the session timestamp keeps the scan bounded.
const pcapUrl = computed(() => {
  const s = props.session
  if (!s) return '#'
  const ft = s.five_tuple
  const t = new Date(s.timestamp).getTime()
  const win = 5 * 60 * 1000
  return api.pcapSessionUrl({
    src_ip: ft.src_ip,
    dst_ip: ft.dst_ip,
    src_port: ft.src_port,
    dst_port: ft.dst_port,
    proto: ft.protocol,
    since: new Date(t - win),
    until: new Date(t + win),
  })
})

// All DNS answer IPs (handle both new response_ips and legacy response_ip).
const dnsIPs = computed<string[]>(() => {
  const s = props.session
  if (!s) return []
  if (s.response_ips && s.response_ips.length > 0) return s.response_ips
  if (s.response_ip) return [s.response_ip]
  return []
})

// ── Latency waterfall helpers ──────────────────────────────────────────

const totalMs = computed(() => (props.session?.tcp_connect_ms ?? 0) + (props.session?.tls_handshake_ms ?? 0))

// Scale bar widths relative to the larger of the two latencies (max bar = 80%)
function wfPct(ms: number): number {
  const max = Math.max(props.session?.tcp_connect_ms ?? 0, props.session?.tls_handshake_ms ?? 0, 1)
  return Math.min((ms / max) * 80, 80)
}

function latencyClass(ms: number): string {
  if (ms < 50) return 'lat-good'
  if (ms < 200) return 'lat-ok'
  return 'lat-slow'
}

// ── TLS version color coding ──────────────────────────────────────────
function tlsVerTone(ver: string): 'success' | 'warning' | 'danger' | 'info' {
  if (ver.includes('1.3')) return 'success'
  if (ver.includes('1.2')) return 'info'
  if (ver.includes('1.1') || ver.includes('1.0') || ver.includes('SSL')) return 'danger'
  return 'info'
}

// ── Certificate health ────────────────────────────────────────────────
const certExpired = computed(() => {
  const s = props.session
  if (!s?.cert_not_after) return false
  return new Date(s.cert_not_after).getTime() < Date.now()
})
const certExpiringSoon = computed(() => {
  const s = props.session
  if (!s?.cert_not_after) return false
  const expiry = new Date(s.cert_not_after).getTime()
  const thirtyDays = 30 * 24 * 60 * 60 * 1000
  return expiry < Date.now() + thirtyDays
})

// ── Formatting ────────────────────────────────────────────────────────

function formatStamp(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString()
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function statusTone(code: number): 'success' | 'warning' | 'danger' | 'info' {
  if (code < 300) return 'success'
  if (code < 400) return 'info'
  if (code < 500) return 'warning'
  return 'danger'
}
</script>

<style scoped>
.pcap-actions {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.detail {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 0 4px;
}
.head {
  display: flex;
  align-items: center;
  gap: 10px;
}
.ts {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
.sec-title {
  font-weight: 600;
  font-size: 13px;
  color: var(--el-text-color-primary);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
section {
  display: flex;
  flex-direction: column;
}
.break {
  word-break: break-all;
  white-space: normal;
}
.small {
  font-size: 12px;
}
.ip-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.codeblock {
  background: var(--el-fill-color-light);
  border-radius: 4px;
  padding: 10px;
  font-size: 12px;
  line-height: 1.5;
  overflow: auto;
  max-height: 300px;
  white-space: pre-wrap;
  word-break: break-all;
}
/* ── Latency waterfall ────────────────────────────────────────────── */
.waterfall {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 0;
}
.wf-row {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 22px;
}
.wf-label {
  width: 36px;
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  text-align: right;
  flex-shrink: 0;
}
.wf-track {
  flex: 1;
  height: 14px;
  background: var(--el-fill-color-lighter);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
}
.wf-bar {
  height: 100%;
  border-radius: 3px;
  min-width: 3px;
  transition: width 0.3s ease;
}
.wf-tcp { background: linear-gradient(90deg, #409eff, #66b1ff); }
.wf-tls { background: linear-gradient(90deg, #67c23a, #95d475); }
.wf-val {
  width: 72px;
  text-align: right;
  font-size: 12px;
  flex-shrink: 0;
}
.wf-total {
  border-top: 1px dashed var(--el-border-color-lighter);
  padding-top: 4px;
  margin-top: 2px;
}
.wf-total .wf-label { font-weight: 700; color: var(--el-text-color-primary); }
/* ── Latency severity colors ──────────────────────────────────────── */
.lat-good { color: #67c23a; }
.lat-ok   { color: #e6a23c; }
.lat-slow { color: #f56c6c; font-weight: 600; }
/* ── Certificate expiry ───────────────────────────────────────────── */
.cert-expired  { color: #f56c6c; font-weight: 600; text-decoration: line-through; }
.cert-expiring { color: #e6a23c; font-weight: 600; }
</style>
