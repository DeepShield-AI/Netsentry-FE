<template>
  <el-drawer v-model="open" :title="title" direction="rtl" size="640px" :destroy-on-close="true">
    <div v-if="dns" class="detail">
      <!-- ── DNS transaction ────────────────────────────────────────── -->
      <section>
        <div class="sec-title">基本信息</div>
        <el-descriptions :column="1" size="small" border>
          <el-descriptions-item label="状态">
            <el-tag v-if="dns.timeout" type="warning">超时（无应答）</el-tag>
            <el-tag v-else-if="dns.latency_ms" :type="latencyTone(dns.latency_ms)">
              已配对 · {{ dns.latency_ms.toFixed(2) }} ms
            </el-tag>
            <el-tag v-else type="info">仅有应答（缺查询）</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="查询时间">
            <span class="mono">{{ formatFull(dns.query_ts) }}</span>
          </el-descriptions-item>
          <el-descriptions-item v-if="dns.response_ts && !dns.timeout" label="应答时间">
            <span class="mono">{{ formatFull(dns.response_ts) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="域名">
            <span class="mono break">{{ dns.domain }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="查询类型">
            <el-tag size="small" effect="plain">{{ dns.query_type }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item v-if="dns.rcode_text" label="应答码（Rcode）">
            <el-tag size="small" :type="rcodeTone(dns.rcode ?? 0)">
              {{ dns.rcode_text }} ({{ dns.rcode ?? 0 }})
            </el-tag>
            <span class="muted small" style="margin-left: 8px">{{ rcodeMeaning(dns.rcode ?? 0) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="事务 ID（TxID）">
            <span class="mono">0x{{ dns.txid.toString(16).padStart(4, '0') }} ({{ dns.txid }})</span>
          </el-descriptions-item>
          <el-descriptions-item label="方向">
            <el-tag size="small" :type="dirTone(dns.direction)">{{ dirLabel(dns.direction) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="查询字节数">
            <span class="mono">{{ dns.request_size ?? '—' }} B</span>
          </el-descriptions-item>
          <el-descriptions-item label="应答字节数">
            <span class="mono">{{ dns.response_size ?? '—' }} B</span>
          </el-descriptions-item>
        </el-descriptions>
      </section>

      <section>
        <div class="sec-title">网络</div>
        <el-descriptions :column="1" size="small" border>
          <el-descriptions-item label="客户端">
            <span class="mono">{{ prettyIP(dns.client_ip) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="DNS 服务器">
            <span class="mono">{{ prettyIP(dns.server_ip) }}:{{ dns.server_port }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="应答 IP 列表">
            <div v-if="dns.response_ips && dns.response_ips.length">
              <div v-for="(ip, i) in dns.response_ips" :key="i" class="mono small">{{ prettyIP(ip) }}</div>
            </div>
            <span v-else class="muted small">— 无（{{ dns.timeout ? '查询超时' : '查询类型未返回 A/AAAA' }}）</span>
          </el-descriptions-item>
        </el-descriptions>
      </section>

      <section v-if="dns.process_name || dns.process_pid">
        <div class="sec-title">进程</div>
        <el-descriptions :column="1" size="small" border>
          <el-descriptions-item label="进程名">{{ dns.process_name || '—' }}</el-descriptions-item>
          <el-descriptions-item label="PID">{{ dns.process_pid || '—' }}</el-descriptions-item>
        </el-descriptions>
      </section>
    </div>

    <div v-else-if="http" class="detail">
      <!-- ── HTTP transaction ───────────────────────────────────────── -->
      <section>
        <div class="sec-title">基本信息</div>
        <el-descriptions :column="1" size="small" border>
          <el-descriptions-item label="状态">
            <el-tag v-if="http.timeout" type="warning">超时（无应答）</el-tag>
            <el-tag v-else-if="http.latency_ms" :type="latencyTone(http.latency_ms)">
              已配对 · {{ http.latency_ms.toFixed(2) }} ms
            </el-tag>
            <el-tag v-else type="info">仅有应答（缺请求）</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="请求时间">
            <span class="mono">{{ formatFull(http.request_ts) }}</span>
          </el-descriptions-item>
          <el-descriptions-item v-if="http.response_ts && !http.timeout" label="应答时间">
            <span class="mono">{{ formatFull(http.response_ts) }}</span>
          </el-descriptions-item>
          <el-descriptions-item v-if="http.method" label="方法">
            <el-tag size="small" :type="methodTone(http.method)">{{ http.method }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item v-if="http.status_code" label="状态码">
            <el-tag size="small" :type="statusTone(http.status_code)">{{ http.status_code }}</el-tag>
            <span class="muted small" style="margin-left: 8px">{{ statusMeaning(http.status_code) }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </section>

      <section>
        <div class="sec-title">HTTP 内容</div>
        <el-descriptions :column="1" size="small" border>
          <el-descriptions-item label="Host">
            <span class="mono break">{{ http.host || '—' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="Path">
            <span class="mono break">{{ http.path || '—' }}</span>
          </el-descriptions-item>
          <el-descriptions-item v-if="http.user_agent" label="User-Agent">
            <span class="mono break">{{ http.user_agent }}</span>
          </el-descriptions-item>
          <el-descriptions-item v-if="http.response_content_type" label="应答 Content-Type">
            <span class="mono">{{ http.response_content_type }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="请求大小">
            <span class="mono">{{ formatNumber(http.request_size || 0) }} B</span>
          </el-descriptions-item>
          <el-descriptions-item label="应答大小">
            <span class="mono">{{ formatNumber(http.response_size || 0) }} B</span>
          </el-descriptions-item>
          <el-descriptions-item label="持续时间">
            <span class="mono">{{ http.latency_ms?.toFixed(2) ?? '—' }} ms</span>
          </el-descriptions-item>
          <el-descriptions-item label="方向">
            <el-tag size="small" :type="dirTone(http.direction)">{{ dirLabel(http.direction) }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </section>

      <section>
        <div class="sec-title">网络</div>
        <el-descriptions :column="1" size="small" border>
          <el-descriptions-item label="客户端">
            <span class="mono">{{ prettyIP(http.client_ip) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="服务器">
            <span class="mono">{{ prettyIP(http.server_ip) }}:{{ http.server_port }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </section>

      <section v-if="http.process_name || http.process_pid">
        <div class="sec-title">进程</div>
        <el-descriptions :column="1" size="small" border>
          <el-descriptions-item label="进程名">{{ http.process_name || '—' }}</el-descriptions-item>
          <el-descriptions-item label="PID">{{ http.process_pid || '—' }}</el-descriptions-item>
        </el-descriptions>
      </section>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DNSTransaction, HTTPTransaction } from '@/api/types'
import { formatNumber, prettyIP } from '@/utils/format'

const props = defineProps<{
  modelValue: boolean
  dns?: DNSTransaction | null
  http?: HTTPTransaction | null
}>()
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()

const open = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const title = computed(() => {
  if (props.dns) return `DNS 事务详情 · ${props.dns.domain}`
  if (props.http)
    return `HTTP 事务详情 · ${props.http.host || prettyIP(props.http.server_ip)}`
  return '事务详情'
})

function formatFull(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('zh-CN', { hour12: false }) +
    '.' + d.getMilliseconds().toString().padStart(3, '0')
}

function latencyTone(ms: number): 'success' | 'warning' | 'danger' | 'info' {
  if (ms < 5) return 'success'
  if (ms < 50) return 'info'
  if (ms < 500) return 'warning'
  return 'danger'
}

function rcodeTone(code: number): 'success' | 'warning' | 'danger' | 'info' {
  if (code === 0) return 'success'
  if (code === 3) return 'warning'
  if (code === 2 || code === 5) return 'danger'
  return 'info'
}

function rcodeMeaning(code: number): string {
  return {
    0: '无错误',
    1: '格式错误',
    2: '服务器失败',
    3: '域名不存在',
    4: '功能未实现',
    5: '查询被拒绝',
  }[code] ?? '其他'
}

function statusTone(code: number): 'success' | 'warning' | 'danger' | 'info' {
  if (code < 300) return 'success'
  if (code < 400) return 'info'
  if (code < 500) return 'warning'
  return 'danger'
}

function statusMeaning(code: number): string {
  if (code < 200) return '信息'
  if (code < 300) return '成功'
  if (code < 400) return '重定向'
  if (code < 500) return '客户端错误'
  return '服务端错误'
}

function methodTone(m: string): 'success' | 'warning' | 'danger' | 'info' {
  switch (m) {
    case 'GET':
    case 'HEAD':
      return 'info'
    case 'POST':
    case 'PUT':
    case 'PATCH':
      return 'warning'
    case 'DELETE':
      return 'danger'
    default:
      return 'success'
  }
}

// Direction helpers
function dirLabel(d?: string): string {
  switch (d) {
    case 'inbound': return '入站'
    case 'outbound': return '出站'
    case 'internal': return '内部'
    default: return '未知'
  }
}
function dirTone(d?: string): 'success' | 'warning' | 'info' | '' {
  switch (d) {
    case 'inbound': return 'warning'
    case 'outbound': return 'success'
    case 'internal': return 'info'
    default: return ''
  }
}
</script>

<style scoped>
.detail {
  padding: 0 8px;
}
.sec-title {
  font-weight: 600;
  margin: 16px 0 8px;
  color: var(--el-text-color-primary);
  border-left: 3px solid var(--el-color-primary);
  padding-left: 8px;
}
.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}
.break {
  word-break: break-all;
}
.small {
  font-size: 12px;
}
.muted {
  color: var(--el-text-color-placeholder);
}
</style>
