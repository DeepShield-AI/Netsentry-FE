<template>
  <el-drawer
    v-model="open"
    :title="title"
    direction="rtl"
    size="520px"
    :destroy-on-close="false"
  >
    <div v-if="flow" class="detail">
      <div class="head">
        <el-tag type="info" effect="dark" round>
          {{ flow.app_proto || flow.master_proto || 'unknown' }}
        </el-tag>
        <el-tag v-if="flow.category" effect="plain">{{ flow.category }}</el-tag>
        <el-tag v-if="flow.ndpi_final" type="success" effect="plain" size="small">finalised</el-tag>
        <span class="ts mono">{{ formatStamp(flow.timestamp) }}</span>
      </div>

      <section>
        <div class="sec-title">Connection</div>
        <el-descriptions :column="1" size="small" border>
          <el-descriptions-item label="Source">
            <span class="mono">{{ prettyIP(flow.five_tuple.src_ip) }}:{{ flow.five_tuple.src_port }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="Destination">
            <span class="mono">{{ prettyIP(flow.five_tuple.dst_ip) }}:{{ flow.five_tuple.dst_port }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="L4 Protocol">{{ flow.five_tuple.protocol }}</el-descriptions-item>
          <el-descriptions-item label="PCAP">
            <el-button type="primary" size="small" tag="a" :href="pcapUrl" target="_blank" :icon="Download">
              下载本会话 PCAP
            </el-button>
          </el-descriptions-item>
          <el-descriptions-item label="Flow hash">
            <span class="mono small">{{ flow.flow_hash }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </section>

      <section>
        <div class="sec-title">nDPI classification</div>
        <el-descriptions :column="1" size="small" border>
          <el-descriptions-item label="Master proto">{{ flow.master_proto || '—' }}</el-descriptions-item>
          <el-descriptions-item label="Application proto">{{ flow.app_proto || '—' }}</el-descriptions-item>
          <el-descriptions-item label="Category">{{ flow.category || '—' }}</el-descriptions-item>
          <el-descriptions-item label="Host / SNI">
            <span v-if="flow.host" class="mono break">{{ flow.host }}</span>
            <span v-else class="muted small">— (nDPI hasn't seen one yet)</span>
          </el-descriptions-item>
          <el-descriptions-item label="Finalised">{{ flow.ndpi_final ? 'yes' : 'no (still classifying)' }}</el-descriptions-item>
          <el-descriptions-item label="Risk bitmap">
            <span class="mono small">0x{{ riskHex }}</span>
            <span v-if="riskHex !== '0'" class="muted small" style="margin-left: 6px">
              ({{ riskBits }} bit{{ riskBits === 1 ? '' : 's' }} set)
            </span>
          </el-descriptions-item>
        </el-descriptions>
      </section>

      <section>
        <div class="sec-title">Volumetrics</div>
        <el-descriptions :column="1" size="small" border>
          <el-descriptions-item label="Packets">{{ formatNumber(flow.packet_count) }}</el-descriptions-item>
          <el-descriptions-item label="Bytes">
            {{ formatBytes(flow.bytes_count) }}
            <span class="muted small mono">({{ formatNumber(flow.bytes_count) }} B)</span>
          </el-descriptions-item>
          <el-descriptions-item label="Duration">{{ formatDurationMs(flow.duration_ms) }}</el-descriptions-item>
          <el-descriptions-item label="Avg packet size">
            {{ flow.packet_count > 0 ? Math.round(flow.bytes_count / flow.packet_count) : 0 }} B
          </el-descriptions-item>
        </el-descriptions>
      </section>

      <section v-if="flow.src_mac || flow.dst_mac || flow.arp_op">
        <div class="sec-title">
          Link Layer
          <el-tag v-if="flow.is_broadcast" type="warning" size="small" effect="plain" style="margin-left: 6px">Broadcast</el-tag>
          <el-tag v-else-if="flow.is_multicast" type="info" size="small" effect="plain" style="margin-left: 6px">Multicast</el-tag>
          <el-tag v-if="flow.media && flow.media !== 'ethernet'" size="small" effect="plain" style="margin-left: 4px">{{ flow.media }}</el-tag>
        </div>
        <el-descriptions :column="1" size="small" border>
          <el-descriptions-item v-if="flow.src_mac" label="Src MAC">
            <span class="mono small mac">{{ flow.src_mac }}</span>
          </el-descriptions-item>
          <el-descriptions-item v-if="flow.dst_mac" label="Dst MAC">
            <span class="mono small mac">{{ flow.dst_mac }}</span>
          </el-descriptions-item>
          <el-descriptions-item v-if="flow.ether_type" label="EtherType">
            <span class="mono small">0x{{ flow.ether_type.toString(16).padStart(4, '0') }}</span>
            <span class="muted small" style="margin-left: 4px">{{ etherTypeName(flow.ether_type) }}</span>
          </el-descriptions-item>
          <el-descriptions-item v-if="flow.vlan_id" label="VLAN ID">
            <el-tag size="small" effect="plain">{{ flow.vlan_id }}</el-tag>
            <span v-if="flow.vlan_depth && flow.vlan_depth > 1" class="muted small" style="margin-left: 4px">({{ flow.vlan_depth }} layers)</span>
          </el-descriptions-item>
          <el-descriptions-item v-if="flow.arp_op" label="ARP Op">
            <el-tag size="small" :type="arpOpTone(flow.arp_op)">{{ arpOpLabel(flow.arp_op) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item v-if="flow.arp_sender_ip" label="ARP Sender">
            <span class="mono small">{{ prettyIP(flow.arp_sender_ip) }}</span>
            <span v-if="flow.src_mac" class="muted small" style="margin-left: 4px">@ {{ flow.src_mac }}</span>
          </el-descriptions-item>
          <el-descriptions-item v-if="flow.arp_target_ip" label="ARP Target">
            <span class="mono small">{{ prettyIP(flow.arp_target_ip) }}</span>
          </el-descriptions-item>
          <el-descriptions-item v-if="flow.tcp_connect_ms" label="TCP Connect">
            <span class="mono small" :style="{ color: latencyColor(flow.tcp_connect_ms) }">{{ flow.tcp_connect_ms.toFixed(1) }} ms</span>
          </el-descriptions-item>
        </el-descriptions>
      </section>

      <section v-if="flow.process_name || flow.process_pid">
        <div class="sec-title">Process</div>
        <el-descriptions :column="1" size="small" border>
          <el-descriptions-item label="PID">{{ flow.process_pid ?? '—' }}</el-descriptions-item>
          <el-descriptions-item label="Name">
            <span class="mono">{{ flow.process_name || '—' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="Executable">
            <span class="mono small break">{{ flow.process_exe || '—' }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </section>

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
import type { Flow } from '@/api/types'
import {
  formatBytes,
  formatDurationMs,
  formatNumber,
  prettyIP,
} from '@/utils/format'

const props = defineProps<{
  modelValue: boolean
  flow: Flow | null
}>()
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()

const open = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const title = computed(() => {
  if (!props.flow) return 'Flow'
  const proto = props.flow.app_proto || props.flow.master_proto || 'flow'
  return `${proto} · ${prettyIP(props.flow.five_tuple.dst_ip)}:${props.flow.five_tuple.dst_port}`
})

// Per-session PCAP download URL (offset index, both directions). Window the
// scan to the flow's lifetime (timestamp .. +duration), padded ±30s.
const pcapUrl = computed(() => {
  const f = props.flow
  if (!f) return '#'
  const ft = f.five_tuple
  const start = new Date(f.timestamp).getTime()
  const end = start + (f.duration_ms || 0)
  const pad = 30 * 1000
  return api.pcapSessionUrl({
    src_ip: ft.src_ip,
    dst_ip: ft.dst_ip,
    src_port: ft.src_port,
    dst_port: ft.dst_port,
    proto: ft.protocol,
    since: new Date(start - pad),
    until: new Date(end + pad),
  })
})

const riskHex = computed(() => {
  const r = props.flow?.ndpi_risk ?? 0
  return r.toString(16)
})

const riskBits = computed(() => {
  const r = props.flow?.ndpi_risk ?? 0
  let n = 0
  let m = r >>> 0
  while (m) {
    n += m & 1
    m >>>= 1
  }
  let high = Math.floor(r / 0x100000000)
  while (high) {
    n += high & 1
    high >>>= 1
  }
  return n
})

const pretty = computed(() => JSON.stringify(props.flow ?? {}, null, 2))

function arpOpLabel(op: number): string {
  switch (op) {
    case 1: return 'Request'
    case 2: return 'Reply'
    case 3: return 'RARP Request'
    case 4: return 'RARP Reply'
    default: return `op=${op}`
  }
}

function arpOpTone(op: number): 'success' | 'info' | 'warning' | '' {
  switch (op) {
    case 1: return 'info'     // Request — query
    case 2: return 'success'  // Reply — response
    case 3: return 'warning'  // RARP
    case 4: return 'warning'
    default: return ''
  }
}

function etherTypeName(et: number): string {
  switch (et) {
    case 0x0800: return 'IPv4'
    case 0x86dd: return 'IPv6'
    case 0x0806: return 'ARP'
    case 0x8100: return 'VLAN'
    case 0x88cc: return 'LLDP'
    case 0x8035: return 'RARP'
    case 0x88a8: return 'QinQ'
    case 0x8847: return 'MPLS'
    case 0x88e1: return 'HomePlug'
    default: return ''
  }
}

function latencyColor(ms: number): string {
  if (ms < 50) return '#67c23a'
  if (ms < 200) return '#e6a23c'
  return '#f56c6c'
}

function formatStamp(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString()
}
</script>

<style scoped>
.detail {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 0 4px;
}
.head {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.ts {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  margin-left: auto;
}
.sec-title {
  font-weight: 600;
  font-size: 13px;
  color: var(--el-text-color-primary);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.break {
  word-break: break-all;
  white-space: normal;
}
.small {
  font-size: 12px;
}
.mac {
  letter-spacing: 0.5px;
  color: var(--el-color-primary);
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
</style>
