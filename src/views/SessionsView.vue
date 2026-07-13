<template>
  <div class="page">
    <el-tabs v-model="active" class="sess-tabs" @tab-change="onTabChange">
      <el-tab-pane :label="`全部 (${allCount})`" name="all" />
      <el-tab-pane :label="`DNS (${counts.dns})`" name="dns" />
      <el-tab-pane :label="`HTTP (${counts.http})`" name="http" />
      <el-tab-pane :label="`TLS (${counts.tls})`" name="tls" />
      <el-tab-pane :label="`ICMP (${counts.icmp})`" name="icmp" />
      <el-tab-pane :label="`流类型 (${counts.flows}) — nDPI`" name="flows" />
    </el-tabs>

    <!-- ── top talkers (5-tuple aggregate) ─────────────────────────── -->
    <TopTalkers :rows="topTalkerRows" />

    <!-- ── 数据源切换：实时 (进程内环) / 历史 (ClickHouse) ─────────── -->
    <div class="mode-bar">
      <el-radio-group v-model="mode" size="small" @change="onModeChange">
        <el-radio-button value="live">实时</el-radio-button>
        <el-radio-button value="history" :disabled="chDisabled">历史（ClickHouse）</el-radio-button>
      </el-radio-group>
      <template v-if="mode === 'history' && !chDisabled">
        <el-date-picker
          v-model="range"
          type="datetimerange"
          size="small"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          :shortcuts="rangeShortcuts"
          value-format="YYYY-MM-DDTHH:mm:ss.SSSZ"
          @change="onRangeChange"
        />
        <el-tag size="small" type="success" effect="light">历史（已持久化）</el-tag>
      </template>
      <el-tag v-else-if="!chDisabled" size="small" type="info" effect="light">实时（启动以来）</el-tag>
      <span v-if="chDisabled" class="muted small">未配置 ClickHouse — 仅有实时进程内环可用</span>
    </div>

    <!-- ── toolbar ─────────────────────────────────────────────────── -->
    <div class="toolbar">
      <el-input
        v-model="filter"
        size="small"
        :placeholder="filterHint"
        clearable
        style="width: 320px"
        :prefix-icon="Search"
      />
      <el-button size="small" :icon="Refresh" :loading="loading" @click="loadActive">
        重载
      </el-button>
      <span class="muted small">
        显示 {{ filteredCount }} / 共 {{ rowCount }} 条 · 点击行查看详情
        <template v-if="mode === 'history'"> · 服务端匹配 {{ historyTotal.toLocaleString() }} 行</template>
        <template v-else> · 每 5 秒自动刷新</template>
      </span>
    </div>

    <!-- 全部 table -->
    <el-table
      v-if="active === 'all'"
      :data="filteredAll"
      v-loading="loading"
      stripe
      size="small"
      class="sess-table"
      highlight-current-row
      empty-text="暂无会话数据 — capture 还在预热"
      @row-click="openAllRow"
    >
      <el-table-column label="#" type="index" width="60" align="right" />
      <el-table-column label="时间" width="180">
        <template #default="{ row }">{{ formatTime(row.ts) }}</template>
      </el-table-column>
      <el-table-column label="方向" width="70">
        <template #default="{ row }">
          <el-tag size="small" :type="dirTone(row.raw?.direction)" effect="light">{{ dirLabel(row.raw?.direction) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="类型" width="80">
        <template #default="{ row }">
          <el-tag size="small" :type="kindTone(row.kind)">{{ row.kind }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="源" min-width="140">
        <template #default="{ row }">
          <span class="mono small">{{ prettyIP(row.src) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="目的" min-width="140">
        <template #default="{ row }">
          <span class="mono small">{{ prettyIP(row.dst) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="摘要" min-width="320">
        <template #default="{ row }">
          <span class="mono small">{{ ellipsis(row.summary, 80) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="包数" width="70" align="right">
        <template #default="{ row }">{{ row.kind === 'Flow' ? row.raw?.packet_count || 0 : 1 }}</template>
      </el-table-column>
      <el-table-column label="平均包长" width="90" align="right">
        <template #default="{ row }">{{ row.kind === 'Flow' ? (row.raw ? Math.round(row.raw.bytes_count / (row.raw.packet_count || 1)) : 0) : row.bytes }}</template>
      </el-table-column>
      <el-table-column label="异常" width="60" align="center">
        <template #default="{ row }">
          <el-icon v-if="isAnomaly(row.raw, row.kind)" color="#f56c6c"><WarningFilled /></el-icon>
          <span v-else class="muted">—</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- DNS table -->
    <el-table
      v-else-if="active === 'dns'"
      :data="filteredSessions"
      v-loading="loading"
      stripe
      size="small"
      class="sess-table"
      highlight-current-row
      empty-text="暂无 DNS 会话"
      @row-click="openSessionDetail"
    >
      <el-table-column label="#" type="index" width="60" align="right" />
      <el-table-column prop="timestamp" label="时间" width="180">
        <template #default="{ row }">{{ formatTime(row.timestamp) }}</template>
      </el-table-column>
      <el-table-column label="方向" width="70">
        <template #default="{ row }">
          <el-tag size="small" :type="dirTone(row.direction)" effect="light">{{ dirLabel(row.direction) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="客户端" min-width="140">
        <template #default="{ row }">
          <span class="mono small">{{ prettyIP(row.five_tuple.src_ip) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="服务器" min-width="140">
        <template #default="{ row }">
          <span class="mono small">{{ prettyIP(row.five_tuple.dst_ip) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类型" width="70">
        <template #default="{ row }">
          <el-tag size="small" effect="plain">{{ row.query_type || '?' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="域名" min-width="200">
        <template #default="{ row }">
          <span class="mono">{{ ellipsis(row.domain, 60) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="应答 IP" min-width="200">
        <template #default="{ row }">
          <span v-if="dnsAnswerCount(row) === 0" class="muted small">— 仅有查询</span>
          <span v-else-if="dnsAnswerCount(row) === 1" class="mono small">
            {{ prettyIP(row.response_ips ? row.response_ips[0] : row.response_ip) }}
          </span>
          <el-tooltip v-else :content="dnsAllIPs(row)" placement="top">
            <span class="mono small">
              {{ prettyIP(row.response_ips ? row.response_ips[0] : row.response_ip) }}
              <span class="muted">+{{ dnsAnswerCount(row) - 1 }}</span>
            </span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="包数" width="70" align="right">
        <template #default>1</template>
      </el-table-column>
      <el-table-column label="平均包长" width="90" align="right">
        <template #default="{ row }">{{ row.payload_size }}</template>
      </el-table-column>
      <el-table-column label="异常" width="60" align="center">
        <template #default="{ row }">
          <el-icon v-if="isAnomaly(row, 'dns')" color="#f56c6c"><WarningFilled /></el-icon>
          <span v-else class="muted">—</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- HTTP table -->
    <el-table
      v-else-if="active === 'http'"
      :data="filteredSessions"
      v-loading="loading"
      stripe
      size="small"
      class="sess-table"
      highlight-current-row
      empty-text="暂无 HTTP 会话"
      @row-click="openSessionDetail"
    >
      <el-table-column label="#" type="index" width="60" align="right" />
      <el-table-column prop="timestamp" label="时间" width="180">
        <template #default="{ row }">{{ formatTime(row.timestamp) }}</template>
      </el-table-column>
      <el-table-column label="方向" width="70">
        <template #default="{ row }">
          <el-tag size="small" :type="dirTone(row.direction)" effect="light">{{ dirLabel(row.direction) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="客户端" min-width="120">
        <template #default="{ row }">
          <span class="mono small">{{ prettyIP(row.five_tuple.src_ip) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="方法" width="70">
        <template #default="{ row }">
          <el-tag size="small" :type="methodTone(row.method)">{{ row.method || '?' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态码" width="80">
        <template #default="{ row }">
          <el-tag v-if="row.status_code" :type="statusTone(row.status_code)" size="small">
            {{ row.status_code }}
          </el-tag>
          <span v-else class="muted small">—</span>
        </template>
      </el-table-column>
      <el-table-column label="主机" min-width="160">
        <template #default="{ row }">{{ ellipsis(row.host, 40) }}</template>
      </el-table-column>
      <el-table-column label="路径" min-width="220">
        <template #default="{ row }">
          <span class="mono small">{{ ellipsis(row.path, 80) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="内容类型" min-width="140">
        <template #default="{ row }">
          <span class="mono small">{{ ellipsis(row.content_type, 30) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="包数" width="70" align="right">
        <template #default>1</template>
      </el-table-column>
      <el-table-column label="平均包长" width="90" align="right">
        <template #default="{ row }">{{ row.payload_size }}</template>
      </el-table-column>
      <el-table-column label="异常" width="60" align="center">
        <template #default="{ row }">
          <el-icon v-if="isAnomaly(row, 'http')" color="#f56c6c"><WarningFilled /></el-icon>
          <span v-else class="muted">—</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- TLS table -->
    <el-table
      v-else-if="active === 'tls'"
      :data="filteredSessions"
      v-loading="loading"
      stripe
      size="small"
      class="sess-table"
      highlight-current-row
      empty-text="暂无 TLS 握手"
      @row-click="openSessionDetail"
    >
      <el-table-column label="#" type="index" width="60" align="right" />
      <el-table-column prop="timestamp" label="时间" width="180">
        <template #default="{ row }">{{ formatTime(row.timestamp) }}</template>
      </el-table-column>
      <el-table-column label="方向" width="70">
        <template #default="{ row }">
          <el-tag size="small" :type="dirTone(row.direction)" effect="light">{{ dirLabel(row.direction) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="客户端" min-width="120">
        <template #default="{ row }">
          <span class="mono small">{{ prettyIP(row.five_tuple.src_ip) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="服务器" min-width="150">
        <template #default="{ row }">
          <span class="mono small">{{ prettyIP(row.five_tuple.dst_ip) }}:{{ row.five_tuple.dst_port }}</span>
        </template>
      </el-table-column>
      <el-table-column label="SNI" min-width="240">
        <template #default="{ row }">
          <span class="mono">{{ ellipsis(row.sni, 60) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="JA3" min-width="180">
        <template #default="{ row }">
          <el-tooltip v-if="row.ja3" :content="row.ja3" placement="top">
            <span class="mono small">{{ row.ja3.slice(0, 10) }}…</span>
          </el-tooltip>
          <span v-else class="muted small">—</span>
        </template>
      </el-table-column>
      <el-table-column label="证书 SHA1" min-width="140">
        <template #default="{ row }">
          <el-tooltip v-if="row.cert_sha1" :content="row.cert_sha1" placement="top">
            <span class="mono small">{{ row.cert_sha1.slice(0, 12) }}…</span>
          </el-tooltip>
          <span v-else class="muted small">—</span>
        </template>
      </el-table-column>
      <el-table-column label="TLS版本" width="100">
        <template #default="{ row }">
          <el-tag v-if="row.tls_version" size="small" :type="tlsVerTone(row.tls_version)">{{ row.tls_version }}</el-tag>
          <span v-else class="muted small">—</span>
        </template>
      </el-table-column>
      <el-table-column label="TCP时延" width="90" align="right" sortable :sort-method="(a: any, b: any) => (a.tcp_connect_ms || 0) - (b.tcp_connect_ms || 0)">
        <template #default="{ row }">
          <span v-if="row.tcp_connect_ms" class="mono small" :style="{ color: latencyColor(row.tcp_connect_ms) }">{{ row.tcp_connect_ms.toFixed(1) }}ms</span>
          <span v-else class="muted small">—</span>
        </template>
      </el-table-column>
      <el-table-column label="TLS时延" width="90" align="right" sortable :sort-method="(a: any, b: any) => (a.tls_handshake_ms || 0) - (b.tls_handshake_ms || 0)">
        <template #default="{ row }">
          <span v-if="row.tls_handshake_ms" class="mono small" :style="{ color: latencyColor(row.tls_handshake_ms) }">{{ row.tls_handshake_ms.toFixed(1) }}ms</span>
          <span v-else class="muted small">—</span>
        </template>
      </el-table-column>
      <el-table-column label="自签" width="60" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.cert_self_signed" type="danger" size="small" effect="dark">自签</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="包数" width="70" align="right">
        <template #default>1</template>
      </el-table-column>
      <el-table-column label="平均包长" width="90" align="right">
        <template #default="{ row }">{{ row.payload_size }}</template>
      </el-table-column>
      <el-table-column label="异常" width="60" align="center">
        <template #default="{ row }">
          <el-icon v-if="isAnomaly(row, 'tls')" color="#f56c6c"><WarningFilled /></el-icon>
          <span v-else class="muted">—</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- ICMP table -->
    <el-table
      v-else-if="active === 'icmp'"
      :data="filteredSessions"
      v-loading="loading"
      stripe
      size="small"
      class="sess-table"
      highlight-current-row
      empty-text="暂无 ICMP 流量"
      @row-click="openSessionDetail"
    >
      <el-table-column label="#" type="index" width="60" align="right" />
      <el-table-column prop="timestamp" label="时间" width="180">
        <template #default="{ row }">{{ formatTime(row.timestamp) }}</template>
      </el-table-column>
      <el-table-column label="方向" width="70">
        <template #default="{ row }">
          <el-tag size="small" :type="dirTone(row.direction)" effect="light">{{ dirLabel(row.direction) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="源" min-width="120">
        <template #default="{ row }">
          <span class="mono small">{{ prettyIP(row.five_tuple.src_ip) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="目的" min-width="120">
        <template #default="{ row }">
          <span class="mono small">{{ prettyIP(row.five_tuple.dst_ip) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类型" min-width="220">
        <template #default="{ row }">
          <el-tag size="small" :type="icmpTone(row.icmp_type)">
            {{ icmpLabel(row.icmp_type, row.icmp_code) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="类型/代码" width="100">
        <template #default="{ row }">
          <span class="mono small">{{ row.icmp_type }}/{{ row.icmp_code }}</span>
        </template>
      </el-table-column>
      <el-table-column label="序号" width="90" align="right" prop="icmp_seq" />
      <el-table-column label="包数" width="70" align="right">
        <template #default>1</template>
      </el-table-column>
      <el-table-column label="平均包长" width="90" align="right">
        <template #default="{ row }">{{ row.payload_size }}</template>
      </el-table-column>
      <el-table-column label="异常" width="60" align="center">
        <template #default="{ row }">
          <el-icon v-if="isAnomaly(row, 'icmp')" color="#f56c6c"><WarningFilled /></el-icon>
          <span v-else class="muted">—</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- Flows table (nDPI long-tail) -->
    <el-table
      v-else
      :data="filteredFlows"
      v-loading="loading"
      stripe
      size="small"
      class="sess-table"
      highlight-current-row
      empty-text="暂无已分类流 — nDPI 还在预热"
      @row-click="openFlowDetail"
    >
      <el-table-column label="#" type="index" width="60" align="right" />
      <el-table-column prop="timestamp" label="时间" width="180">
        <template #default="{ row }">{{ formatTime(row.timestamp) }}</template>
      </el-table-column>
      <el-table-column label="方向" width="70">
        <template #default="{ row }">
          <el-tag size="small" :type="dirTone(row.direction)" effect="light">{{ dirLabel(row.direction) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="源地址" min-width="150">
        <template #default="{ row }">
          <span class="mono small">{{ prettyIP(row.five_tuple.src_ip) }}:{{ row.five_tuple.src_port }}</span>
        </template>
      </el-table-column>
      <el-table-column label="目的地址" min-width="150">
        <template #default="{ row }">
          <span class="mono small">{{ prettyIP(row.five_tuple.dst_ip) }}:{{ row.five_tuple.dst_port }}</span>
        </template>
      </el-table-column>
      <el-table-column label="协议" min-width="160">
        <template #default="{ row }">
          <el-tag size="small" type="info">{{ row.app_proto || row.master_proto || '?' }}</el-tag>
          <span v-if="row.master_proto && row.app_proto && row.master_proto !== row.app_proto"
                class="muted small mono"
                style="margin-left: 6px"
          >
            via {{ row.master_proto }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="主机" min-width="220">
        <template #default="{ row }">
          <el-tooltip v-if="row.host && row.host.length > 38" :content="row.host" placement="top">
            <span class="mono small">{{ ellipsis(row.host, 38) }}</span>
          </el-tooltip>
          <span v-else-if="row.host" class="mono small">{{ row.host }}</span>
          <span v-else class="muted small">—</span>
        </template>
      </el-table-column>
      <el-table-column label="分类" width="120">
        <template #default="{ row }">
          <el-tag v-if="row.category" size="small" effect="plain" :type="categoryTone(row.category)">
            {{ row.category }}
          </el-tag>
          <span v-else class="muted small">—</span>
        </template>
      </el-table-column>
      <el-table-column label="L4" width="60">
        <template #default="{ row }">{{ row.five_tuple.protocol }}</template>
      </el-table-column>
      <el-table-column label="包数" width="80" align="right">
        <template #default="{ row }">{{ formatNumber(row.packet_count) }}</template>
      </el-table-column>
      <el-table-column label="流量" width="100" align="right">
        <template #default="{ row }">{{ formatBytes(row.bytes_count, 1) }}</template>
      </el-table-column>
      <el-table-column label="时长" width="100" align="right">
        <template #default="{ row }">{{ formatDurationMs(row.duration_ms) }}</template>
      </el-table-column>
      <el-table-column label="平均包长" width="90" align="right">
        <template #default="{ row }">{{ row.packet_count ? Math.round(row.bytes_count / row.packet_count) : 0 }}</template>
      </el-table-column>
      <el-table-column label="风险" width="70" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.ndpi_risk && row.ndpi_risk > 0" size="small" type="warning">
            {{ riskCount(row.ndpi_risk) }}
          </el-tag>
          <span v-else class="muted small">—</span>
        </template>
      </el-table-column>
      <el-table-column label="异常" width="60" align="center">
        <template #default="{ row }">
          <el-icon v-if="isAnomaly(row, 'flow')" color="#f56c6c"><WarningFilled /></el-icon>
          <span v-else class="muted">—</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- ─ 历史模式下的服务端分页 ─ -->
    <div v-if="mode === 'history'" class="pager">
      <el-pagination
        size="small"
        layout="total, sizes, prev, pager, next, jumper"
        :total="historyTotal"
        :page-sizes="[50, 100, 200, 500]"
        :page-size="pageSize"
        :current-page="page"
        @size-change="onPageSizeChange"
        @current-change="onPageChange"
      />
    </div>

    <!-- detail drawers -->
    <SessionDetail v-model="sessionDrawerOpen" :session="selectedSession" />
    <FlowDetail v-model="flowDrawerOpen" :flow="selectedFlow" />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Refresh, Search, WarningFilled } from '@element-plus/icons-vue'
import { api } from '@/api/client'
import type { Flow, HistoryQuery, Session } from '@/api/types'
import {
  ellipsis,
  formatBytes,
  formatDurationMs,
  formatNumber,
  formatTime,
  prettyIP,
} from '@/utils/format'
import { icmpLabel } from '@/utils/icmp'
import SessionDetail from '@/components/SessionDetail.vue'
import FlowDetail from '@/components/FlowDetail.vue'
import TopTalkers from '@/components/TopTalkers.vue'

type SessKind = 'all' | 'dns' | 'http' | 'tls' | 'icmp' | 'flows'
type Mode = 'live' | 'history'
const active = ref<SessKind>('all')

// ── 数据源模式：live = 进程内环（启动以来）；history = ClickHouse（跨重启）──
const mode = ref<Mode>('live')
const chDisabled = ref(false)
const range = ref<[string, string] | null>(null)
const page = ref(1)
const pageSize = ref(100)
const historyTotal = ref(0)

const rangeShortcuts = [
  { text: '最近 5 分钟', value: () => rangeFromMin(5) },
  { text: '最近 30 分钟', value: () => rangeFromMin(30) },
  { text: '最近 1 小时', value: () => rangeFromMin(60) },
  { text: '最近 24 小时', value: () => rangeFromMin(60 * 24) },
  { text: '最近 7 天', value: () => rangeFromMin(60 * 24 * 7) },
]
function rangeFromMin(min: number): [Date, Date] {
  const end = new Date()
  const start = new Date(end.getTime() - min * 60 * 1000)
  return [start, end]
}

// 全部 tab 上用的合并行：把 DNS/HTTP/TLS/ICMP 三十多个字段统一在 5 列内展示。
type AllRow = {
  ts: string
  kind: 'DNS' | 'HTTP' | 'TLS' | 'ICMP'
  src: string
  dst: string
  summary: string
  bytes: number
  raw: Session
}
const allRows = ref<AllRow[]>([])
const sessionRows = ref<Session[]>([])
const flowRows = ref<Flow[]>([])
const loading = ref(false)
const filter = ref('')

// Per-tab counts.
const counts = ref({ dns: 0, http: 0, tls: 0, icmp: 0, flows: 0 })

// Detail drawers.
const sessionDrawerOpen = ref(false)
const selectedSession = ref<Session | null>(null)
const flowDrawerOpen = ref(false)
const selectedFlow = ref<Flow | null>(null)

const filterHint = computed(() => {
  if (active.value === 'flows') return '按应用协议 / 分类 / IP 过滤…'
  if (active.value === 'all') return '按任意字段（域名 / SNI / IP）过滤…'
  return '按 Host / SNI / IP / 域名 过滤…'
})

function summariseSession(s: Session): string {
  switch (s.type) {
    case 'DNS':
      return `${s.query_type ?? '?'}  ${s.domain ?? ''}` + (s.response_ip ? ` → ${s.response_ip}` : '')
    case 'HTTP':
      return `${s.method ?? '?'}  ${s.host ?? ''}${s.path ?? ''}` + (s.status_code ? ` → ${s.status_code}` : '')
    case 'TLS': {
      let parts = [`SNI ${s.sni ?? '—'}`]
      if (s.tls_version) parts.push(s.tls_version)
      if (s.tcp_connect_ms) parts.push(`TCP ${s.tcp_connect_ms.toFixed(0)}ms`)
      if (s.tls_handshake_ms) parts.push(`TLS ${s.tls_handshake_ms.toFixed(0)}ms`)
      if (s.cert_self_signed) parts.push('自签')
      return parts.join(' · ')
    }
    case 'ICMP':
      return icmpLabel(s.icmp_type, s.icmp_code)
    default:
      return s.type
  }
}

function toAllRow(s: Session, kind: AllRow['kind']): AllRow {
  return {
    ts: s.timestamp,
    kind,
    src: s.five_tuple.src_ip,
    dst: s.five_tuple.dst_ip,
    summary: summariseSession(s),
    bytes: s.payload_size,
    raw: s,
  }
}

async function loadActive() {
  loading.value = true
  try {
    if (mode.value === 'history') {
      await loadHistory()
    } else {
      await loadLive()
    }
  } catch (err) {
    console.warn('sessions fetch failed', err)
    sessionRows.value = []
    flowRows.value = []
    allRows.value = []
  } finally {
    loading.value = false
  }
}

// loadLive reads the in-memory rings (data captured since agent boot).
async function loadLive() {
  historyTotal.value = 0
  if (active.value === 'flows') {
    const items = await api.recentFlows(500)
    flowRows.value = items.slice().reverse()
    counts.value.flows = items.length
  } else if (active.value === 'all') {
    const [dns, http, tls, icmp] = await Promise.all([
      api.recentDNS(200),
      api.recentHTTP(200),
      api.recentTLS(200),
      api.recentICMP(200),
    ])
    const merged: AllRow[] = [
      ...dns.map((s) => toAllRow(s, 'DNS')),
      ...http.map((s) => toAllRow(s, 'HTTP')),
      ...tls.map((s) => toAllRow(s, 'TLS')),
      ...icmp.map((s) => toAllRow(s, 'ICMP')),
    ]
    merged.sort((a, b) => (a.ts < b.ts ? 1 : a.ts > b.ts ? -1 : 0))
    allRows.value = merged
    counts.value.dns = dns.length
    counts.value.http = http.length
    counts.value.tls = tls.length
    counts.value.icmp = icmp.length
  } else {
    const fetchers: Record<Exclude<SessKind, 'flows' | 'all'>, () => Promise<Session[]>> = {
      dns: () => api.recentDNS(200),
      http: () => api.recentHTTP(200),
      tls: () => api.recentTLS(200),
      icmp: () => api.recentICMP(200),
    }
    const items = await fetchers[active.value]()
    sessionRows.value = items.slice().reverse()
    counts.value[active.value] = items.length
  }
}

// loadHistory reads ClickHouse with server-side pagination. The "全部" tab
// fans out to the four session tables on the same page window and merges
// (approximate deep-paging, exact for the first pages — good enough for an
// overview). Falls back to live mode if ClickHouse is not configured.
async function loadHistory() {
  const params: HistoryQuery = {
    since: range.value?.[0],
    until: range.value?.[1],
    q: filter.value.trim() || undefined,
    limit: pageSize.value,
    offset: (page.value - 1) * pageSize.value,
  }
  // Any disabled response → revert to live.
  const disabledFallback = () => {
    chDisabled.value = true
    mode.value = 'live'
  }

  if (active.value === 'flows') {
    const env = await api.historyFlows(params)
    if (env.disabled) { disabledFallback(); return loadLive() }
    flowRows.value = env.items
    historyTotal.value = env.total
    return
  }
  if (active.value === 'all') {
    const [d, h, t, i] = await Promise.all([
      api.historyDNS(params), api.historyHTTP(params),
      api.historyTLS(params), api.historyICMP(params),
    ])
    if (d.disabled || h.disabled || t.disabled || i.disabled) { disabledFallback(); return loadLive() }
    const merged: AllRow[] = [
      ...d.items.map((s) => toAllRow(s, 'DNS')),
      ...h.items.map((s) => toAllRow(s, 'HTTP')),
      ...t.items.map((s) => toAllRow(s, 'TLS')),
      ...i.items.map((s) => toAllRow(s, 'ICMP')),
    ]
    merged.sort((a, b) => (a.ts < b.ts ? 1 : a.ts > b.ts ? -1 : 0))
    allRows.value = merged
    counts.value.dns = d.total
    counts.value.http = h.total
    counts.value.tls = t.total
    counts.value.icmp = i.total
    historyTotal.value = d.total + h.total + t.total + i.total
    return
  }
  const histFetchers: Record<Exclude<SessKind, 'flows' | 'all'>, (p: HistoryQuery) => Promise<{ items: Session[]; total: number; disabled?: boolean }>> = {
    dns: api.historyDNS,
    http: api.historyHTTP,
    tls: api.historyTLS,
    icmp: api.historyICMP,
  }
  const env = await histFetchers[active.value](params)
  if (env.disabled) { disabledFallback(); return loadLive() }
  sessionRows.value = env.items
  counts.value[active.value] = env.total
  historyTotal.value = env.total
}

function onTabChange() {
  // Reset filter so a flow-specific search doesn't carry to the DNS tab.
  filter.value = ''
  page.value = 1
  void loadActive()
}

function onModeChange() {
  page.value = 1
  filter.value = ''
  if (mode.value === 'history' && !range.value) {
    const [s, e] = rangeFromMin(60)
    range.value = [s.toISOString(), e.toISOString()]
  }
  void loadActive()
}
function onRangeChange() {
  page.value = 1
  void loadActive()
}
function onPageChange(p: number) {
  page.value = p
  void loadActive()
}
function onPageSizeChange(s: number) {
  pageSize.value = s
  page.value = 1
  void loadActive()
}

async function refreshCounts() {
  try {
    counts.value = await api.sessionTotals()
  } catch {
    /* ignore */
  }
}

// ── filtering ─────────────────────────────────────────────────────────
const filteredSessions = computed(() => {
  const f = filter.value.trim().toLowerCase()
  if (!f) return sessionRows.value
  return sessionRows.value.filter((s) => {
    const ips = s.response_ips ? s.response_ips.join(' ') : ''
    const haystack = [
      s.domain,
      s.host,
      s.sni,
      s.path,
      s.five_tuple.src_ip,
      s.five_tuple.dst_ip,
      s.response_ip,
      ips,
      s.user_agent,
      s.process_name,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return haystack.includes(f)
  })
})

const filteredFlows = computed(() => {
  const f = filter.value.trim().toLowerCase()
  if (!f) return flowRows.value
  return flowRows.value.filter((fl) => {
    const haystack = [
      fl.master_proto,
      fl.app_proto,
      fl.category,
      fl.host,
      fl.five_tuple.src_ip,
      fl.five_tuple.dst_ip,
      fl.process_name,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return haystack.includes(f)
  })
})

// 全部 tab 的过滤
const filteredAll = computed(() => {
  const f = filter.value.trim().toLowerCase()
  if (!f) return allRows.value
  return allRows.value.filter((r) =>
    [r.kind, r.src, r.dst, r.summary].join(' ').toLowerCase().includes(f),
  )
})

const allCount = computed(() => counts.value.dns + counts.value.http + counts.value.tls + counts.value.icmp)

const rowCount = computed(() => {
  if (mode.value === 'history') return historyTotal.value
  if (active.value === 'flows') return flowRows.value.length
  if (active.value === 'all') return allRows.value.length
  return sessionRows.value.length
})
const filteredCount = computed(() => {
  if (active.value === 'flows') return filteredFlows.value.length
  if (active.value === 'all') return filteredAll.value.length
  return filteredSessions.value.length
})

// What we feed Top talkers — depends on the active tab.
const topTalkerRows = computed(() => {
  if (active.value === 'flows') return filteredFlows.value
  if (active.value === 'all') return filteredAll.value.map((r) => r.raw)
  return filteredSessions.value
})

// ── DNS helpers ───────────────────────────────────────────────────────
function dnsAnswerCount(row: Session): number {
  if (row.response_ips && row.response_ips.length > 0) return row.response_ips.length
  if (row.response_ip) return 1
  return 0
}
function dnsAllIPs(row: Session): string {
  return (row.response_ips ?? (row.response_ip ? [row.response_ip] : [])).join(', ')
}

// ── tone helpers ──────────────────────────────────────────────────────
function statusTone(code: number): 'success' | 'warning' | 'danger' | 'info' {
  if (code < 300) return 'success'
  if (code < 400) return 'info'
  if (code < 500) return 'warning'
  return 'danger'
}
function methodTone(m: string | undefined): 'success' | 'warning' | 'danger' | 'info' {
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
function icmpTone(t: number | undefined): 'success' | 'warning' | 'danger' | 'info' {
  if (t === 0 || t === 8) return 'info'
  if (t === 3) return 'danger'
  if (t === 11) return 'warning'
  return 'info'
}
function categoryTone(c: string): 'success' | 'warning' | 'danger' | 'info' {
  switch (c) {
    case 'WEB':
    case 'MEDIA':
    case 'CLOUD':
      return 'success'
    case 'CHAT':
    case 'NETWORK':
    case 'COLLABORATIVE':
      return 'info'
    case 'MALWARE':
    case 'MINING':
      return 'danger'
    case 'VPN':
    case 'CYBERSECURITY':
    case 'REMOTE_ACCESS':
      return 'warning'
    default:
      return 'info'
  }
}
function riskCount(mask: number): number {
  // Count bits set in the (possibly large) bitmap. JS numbers lose
  // precision past 2^53, but in practice no flow has more than ~5 risks
  // set so the low 32 bits are enough.
  let n = 0
  let m = mask >>> 0
  while (m) {
    n += m & 1
    m >>>= 1
  }
  // Also count high 32 bits (best effort).
  let high = Math.floor(mask / 0x100000000)
  while (high) {
    n += high & 1
    high >>>= 1
  }
  return n
}

function openSessionDetail(row: Session) {
  selectedSession.value = row
  sessionDrawerOpen.value = true
}
function openFlowDetail(row: Flow) {
  selectedFlow.value = row
  flowDrawerOpen.value = true
}
function openAllRow(row: AllRow) {
  // 复用 SessionDetail 抽屉
  selectedSession.value = row.raw
  sessionDrawerOpen.value = true
}

function kindTone(k: 'DNS' | 'HTTP' | 'TLS' | 'ICMP'): 'success' | 'warning' | 'danger' | 'info' {
  switch (k) {
    case 'DNS': return 'info'
    case 'HTTP': return 'success'
    case 'TLS': return 'warning'
    case 'ICMP': return 'danger'
  }
}

// Direction helpers: label and tag color
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

// TLS version color coding (shared with SessionDetail)
function tlsVerTone(ver: string): 'success' | 'warning' | 'danger' | 'info' {
  if (ver.includes('1.3')) return 'success'
  if (ver.includes('1.2')) return 'info'
  if (ver.includes('1.1') || ver.includes('1.0') || ver.includes('SSL')) return 'danger'
  return 'info'
}

// Latency color: green < 50ms, amber < 200ms, red ≥ 200ms
function latencyColor(ms: number): string {
  if (ms < 50) return '#67c23a'
  if (ms < 200) return '#e6a23c'
  return '#f56c6c'
}

// Anomaly detection per protocol type
// DNS: timeout or rcode ≠ 0
// HTTP: status_code ≥ 400 or timeout
// TLS: incomplete (no ja3/cert)
// ICMP: destination unreachable
// Flow: ndpi_risk > 0
function isAnomaly(row: any, kind: string): boolean {
  if (!row) return false
  switch (kind) {
    case 'dns': return !!row.timeout || (row.rcode !== undefined && row.rcode !== 0)
    case 'http': return !!row.timeout || (row.status_code !== undefined && row.status_code >= 400)
    case 'tls': return !row.ja3 && !row.cert_sha1 || !!row.cert_self_signed
    case 'icmp': return row.icmp_type === 3 // Destination Unreachable
    case 'flow': return (row.ndpi_risk ?? 0) > 0
    default: return false
  }
}

let timer: number | null = null
// Auto-refresh only in live mode; history mode is paged and a periodic
// re-query would fight the user's pagination + re-hit ClickHouse.
function startTimer() {
  if (timer != null) window.clearInterval(timer)
  if (mode.value === 'live') {
    timer = window.setInterval(() => {
      void loadActive()
      void refreshCounts()
    }, 5000)
  }
}
onMounted(() => {
  void loadActive()
  void refreshCounts()
  startTimer()
})
onBeforeUnmount(() => {
  if (timer != null) window.clearInterval(timer)
})
watch(mode, startTimer)
</script>

<style scoped>
.sess-tabs {
  margin-bottom: 12px;
}
.sess-tabs :deep(.el-tabs__header) {
  margin: 0;
}
.sess-tabs :deep(.el-tabs__item) {
  font-weight: 500;
  font-size: 13px;
}
.sess-tabs :deep(.el-tabs__active-bar) {
  height: 2.5px;
  border-radius: 2px;
}
.mode-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}
.pager {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.small {
  font-size: 12px;
  color: var(--sg-text-muted, #94a3b8);
}
.sess-table {
  background: var(--sg-card-bg, #ffffff);
  border-radius: var(--sg-card-radius, 10px);
  border: 1px solid var(--sg-card-border, #e2e8f0);
  overflow: hidden;
  cursor: pointer;
}
.sess-table :deep(.el-table__row:hover) {
  background: var(--sg-brand-bg, #e6f4ff) !important;
}
.ok {
  color: var(--sg-success, #10b981);
  font-size: 16px;
}
</style>
