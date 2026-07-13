<template>
  <div class="page">
    <el-tabs v-model="activeTab" type="border-card">
      <!-- ══════════════════════════════════════════════════════════════
           Tab 1: 快捷配置 — 读写 config.yaml 全部字段
           ══════════════════════════════════════════════════════════════ -->
      <el-tab-pane label="快捷配置" name="form">
        <el-alert v-if="formError" :title="formError" type="error" show-icon :closable="true" style="margin-bottom: 16px" @close="formError = ''" />
        <el-alert v-if="formSaved" title="配置已保存，系统正在重启…" type="success" show-icon :closable="true" style="margin-bottom: 12px" @close="formSaved = false" />

        <el-form v-if="f" label-width="200px" label-position="right" size="default" :disabled="formApplying">
          <!-- ── 全局 ──────────────────────────────────────────────── -->
          <div class="sec-title">全局（Global）</div>
          <el-form-item label="租户 ID"><el-input v-model="f.global.tenant_id" style="width:200px" /><span class="tip">多租户标识</span></el-form-item>
          <el-form-item label="探针 ID"><el-input v-model="f.global.probe_id" style="width:200px" /><span class="tip">留空自动生成 probe-&lt;hostname&gt;</span></el-form-item>
          <el-form-item label="日志级别">
            <el-select v-model="f.global.log_level" style="width:140px">
              <el-option v-for="l in ['debug','info','warn','error']" :key="l" :label="l" :value="l" />
            </el-select>
          </el-form-item>
          <el-form-item label="日志目录"><el-input v-model="f.global.log_dir" style="width:360px" /></el-form-item>
          <el-form-item label="数据目录"><el-input v-model="f.global.data_dir" style="width:360px" /></el-form-item>

          <!-- ── 网络 ──────────────────────────────────────────────── -->
          <div class="sec-title">网络（Network）</div>
          <el-form-item label="抓包网卡">
            <el-select v-model="f.network.iface" filterable allow-create placeholder="选择网卡" style="width:200px">
              <el-option v-for="n in ifaces" :key="n" :label="n" :value="n" />
            </el-select>
          </el-form-item>
          <el-form-item label="Agent 监听"><el-input v-model="f.network.agent_listen" style="width:200px" /><span class="tip">如 :7080</span></el-form-item>
          <el-form-item label="Watchdog 监听"><el-input v-model="f.network.watchdog_listen" style="width:200px" /></el-form-item>

          <!-- ── Capture ───────────────────────────────────────────── -->
          <div class="sec-title">Capture（Rust 抓包进程）</div>
          <el-form-item label="Snaplen"><el-input-number v-model="f.capture.snaplen" :min="64" :max="65535" :step="256" /><span class="tip">每包最大截取字节</span></el-form-item>
          <el-form-item label="Workers"><el-input v-model="f.capture.workers" style="width:200px" /><span class="tip">"auto" 或 [0,1,2,3]</span></el-form-item>
          <el-form-item label="Block 大小"><el-input-number v-model="f.capture.block_size" :min="4096" :step="1048576" /><span class="tip">字节，默认 1MB</span></el-form-item>
          <el-form-item label="Block 数量"><el-input-number v-model="f.capture.block_count" :min="4" :max="1024" /></el-form-item>
          <el-form-item label="Frame 大小"><el-input-number v-model="f.capture.frame_size" :min="256" :max="65536" :step="256" /></el-form-item>
          <el-form-item label="Block 超时（ms）"><el-input-number v-model="f.capture.block_timeout_ms" :min="1" :max="1000" /></el-form-item>
          <el-form-item label="每核流表容量"><el-input-number v-model="f.capture.flow_table_size_per_core" :min="1024" :step="8192" /></el-form-item>
          <el-form-item label="流过期时间（秒）"><el-input-number v-model="f.capture.flow_expire_seconds" :min="5" :max="3600" /></el-form-item>
          <el-form-item label="快照间隔（ms）"><el-input-number v-model="f.capture.flow_snapshot_interval_ms" :min="10" :max="10000" /></el-form-item>
          <el-form-item label="采样策略">
            <el-select v-model="f.capture.sample_strategy" style="width:160px">
              <el-option v-for="s in ['all','first_n','periodic']" :key="s" :label="s" :value="s" />
            </el-select>
          </el-form-item>
          <el-form-item label="Prometheus 端口"><el-input-number v-model="f.capture.prometheus_port" :min="0" :max="65535" /></el-form-item>

          <!-- ── IPC ───────────────────────────────────────────────── -->
          <div class="sec-title">IPC（共享内存）</div>
          <el-form-item label="SHM 目录"><el-input v-model="f.ipc.shm_dir" style="width:300px" /></el-form-item>
          <el-form-item label="Ring 槽位数"><el-input-number v-model="f.ipc.ring_capacity" :min="256" :step="1024" /><span class="tip">2 的幂</span></el-form-item>
          <el-form-item label="Ring 槽位大小"><el-input-number v-model="f.ipc.ring_slot_size" :min="512" :step="512" /></el-form-item>
          <el-form-item label="空闲轮询间隔（μs）"><el-input-number v-model="f.ipc.poll_idle_us" :min="1" :max="10000" /></el-form-item>

          <!-- ── 全流量存储 ────────────────────────────────────────── -->
          <div class="sec-title">全流量存储（PCAP）</div>
          <el-form-item label="开启"><el-switch v-model="f.pcap.enabled" /></el-form-item>
          <template v-if="f.pcap.enabled">
            <el-form-item label="存储目录"><el-input v-model="f.pcap.dir" style="width:320px" /></el-form-item>
            <el-form-item label="磁盘上限（MB）"><el-input-number v-model="f.pcap.max_disk_mb" :min="64" :step="512" /></el-form-item>
            <el-form-item label="保留时长（秒）"><el-input-number v-model="f.pcap.retention_seconds" :min="0" :step="3600" /><span class="tip">0 = 仅靠容量</span></el-form-item>
            <el-form-item label="单段大小（MB）"><el-input-number v-model="f.pcap.segment_mb" :min="1" :step="64" /></el-form-item>
            <el-form-item label="单段时长（秒）"><el-input-number v-model="f.pcap.segment_seconds" :min="1" :step="60" /></el-form-item>
            <el-form-item label="Snaplen"><el-input-number v-model="f.pcap.snaplen" :min="64" :max="262144" :step="1024" /></el-form-item>
            <el-form-item label="提取上限（MB）"><el-input-number v-model="f.pcap.max_extract_mb" :min="1" :step="50" /></el-form-item>
          </template>

          <!-- ── ClickHouse ────────────────────────────────────────── -->
          <div class="sec-title">ClickHouse</div>
          <el-form-item label="Endpoint"><el-input v-model="f.clickhouse.endpoint" style="width:360px" /><span class="tip">如 tcp://127.0.0.1:9000</span></el-form-item>
          <el-form-item label="Database"><el-input v-model="f.clickhouse.database" style="width:200px" /></el-form-item>
          <el-form-item label="Username"><el-input v-model="f.clickhouse.username" style="width:200px" /></el-form-item>
          <el-form-item label="Password"><el-input v-model="f.clickhouse.password" type="password" show-password style="width:200px" /></el-form-item>
          <el-form-item label="队列容量"><el-input-number v-model="f.clickhouse.queue_cap" :min="1024" :step="4096" /></el-form-item>
          <el-form-item label="批量行数"><el-input-number v-model="f.clickhouse.batch_rows" :min="100" :step="1000" /></el-form-item>
          <el-form-item label="刷新间隔（ms）"><el-input-number v-model="f.clickhouse.flush_interval_ms" :min="100" :step="100" /></el-form-item>
          <el-form-item label="并行连接数"><el-input-number v-model="f.clickhouse.flush_conns" :min="1" :max="32" /></el-form-item>
          <el-form-item label="连接超时（秒）"><el-input-number v-model="f.clickhouse.dial_timeout_s" :min="1" :max="60" /></el-form-item>
          <el-form-item label="持久化链路层帧"><el-switch v-model="f.clickhouse.l2_frames" /></el-form-item>

          <!-- ── ClickHouse Retention ──────────────────────────────── -->
          <div class="sec-title">ClickHouse 数据保留</div>
          <el-form-item label="自动清理"><el-switch v-model="f.clickhouse.retention.enabled" /></el-form-item>
          <template v-if="f.clickhouse.retention.enabled">
            <el-form-item label="清理间隔（秒）"><el-input-number v-model="f.clickhouse.retention.interval_seconds" :min="60" :step="60" /></el-form-item>
            <el-form-item v-for="(val, key) in f.clickhouse.retention.max_rows" :key="key" :label="'max_rows.' + key">
              <el-input-number v-model="f.clickhouse.retention.max_rows[key]" :min="0" :step="500000" />
            </el-form-item>
          </template>

          <!-- ── Agent 内部参数 ─────────────────────────────────────── -->
          <div class="sec-title">Agent 内部参数</div>
          <el-form-item label="告警抑制 TTL（秒）"><el-input-number v-model="f.agent.alert_ttl_seconds" :min="1" :max="3600" /></el-form-item>

          <div class="sec-sub">内存环容量（Cache）</div>
          <el-form-item v-for="(val, key) in f.agent.cache" :key="key" :label="'cache.' + key">
            <el-input-number v-model="f.agent.cache[key]" :min="64" :step="512" />
          </el-form-item>

          <div class="sec-sub">流写入过滤（Flow Filter）</div>
          <el-form-item label="启用过滤"><el-switch v-model="f.agent.flow_filter.enabled" /></el-form-item>
          <template v-if="f.agent.flow_filter.enabled">
            <el-form-item label="TCP 最小包数"><el-input-number v-model="f.agent.flow_filter.tcp_min_packets" :min="0" /><span class="tip">低于此值丢弃，默认 3</span></el-form-item>
            <el-form-item label="TCP 最小字节"><el-input-number v-model="f.agent.flow_filter.tcp_min_bytes" :min="0" /><span class="tip">0 = 不限</span></el-form-item>
            <el-form-item label="忽略端口列表"><el-input v-model="ignorePortsStr" style="width:360px" /><span class="tip">逗号分隔，如 7890,8080</span></el-form-item>
          </template>

          <!-- ── FlowFeat ──────────────────────────────────────────── -->
          <div class="sec-title">FlowFeat（流特征抽取）</div>
          <el-form-item label="启用"><el-switch v-model="f.flowfeat.enabled" /></el-form-item>
          <template v-if="f.flowfeat.enabled">
            <el-form-item label="间隔（秒）"><el-input-number v-model="f.flowfeat.interval_seconds" :min="10" :step="60" /></el-form-item>
            <el-form-item label="工作目录"><el-input v-model="f.flowfeat.work_dir" style="width:360px" /></el-form-item>
          </template>

          <!-- ── Zeek ──────────────────────────────────────────────── -->
          <div class="sec-title">Zeek（深度协议分析）</div>
          <el-form-item label="启用"><el-switch v-model="f.zeek.enabled" /></el-form-item>
          <template v-if="f.zeek.enabled">
            <el-form-item label="Zeek 路径"><el-input v-model="f.zeek.bin_path" style="width:360px" /></el-form-item>
            <el-form-item label="脚本目录"><el-input v-model="f.zeek.scripts_dir" style="width:360px" /></el-form-item>
            <el-form-item label="间隔（秒）"><el-input-number v-model="f.zeek.interval_seconds" :min="10" :step="60" /></el-form-item>
            <el-form-item label="工作目录"><el-input v-model="f.zeek.work_dir" style="width:360px" /></el-form-item>
            <el-form-item label="每次最多段数"><el-input-number v-model="f.zeek.max_segments_per_tick" :min="0" /><span class="tip">0 = 全部</span></el-form-item>
            <el-form-item label="日志保留天数"><el-input-number v-model="f.zeek.retain_logs_days" :min="0" /></el-form-item>
          </template>

          <!-- ── Watchdog ──────────────────────────────────────────── -->
          <div class="sec-title">Watchdog（进程监控）</div>
          <el-form-item label="检查间隔（秒）"><el-input-number v-model="f.watchdog.check_interval_s" :min="1" :max="60" /></el-form-item>
          <el-form-item label="磁盘告警阈值（GB）"><el-input-number v-model="f.watchdog.sysmon.disk_warn_gb" :min="1" :step="1" /></el-form-item>
          <el-form-item label="磁盘严重阈值（MB）"><el-input-number v-model="f.watchdog.sysmon.disk_critical_mb" :min="100" :step="100" /></el-form-item>
          <el-form-item label="Webhook URL"><el-input v-model="f.watchdog.alerting.webhook_url" style="width:450px" /><span class="tip">留空则不推送</span></el-form-item>
          <el-form-item label="告警静默时间（秒）"><el-input-number v-model="f.watchdog.alerting.silence_duration_s" :min="0" :step="30" /></el-form-item>

          <!-- ── 操作按钮 ──────────────────────────────────────────── -->
          <el-divider />
          <el-form-item>
            <el-button type="primary" :loading="formApplying" @click="applyForm">
              {{ formApplying ? '正在下发…' : '保存并重启' }}
            </el-button>
            <el-button @click="loadForm">重新加载</el-button>
          </el-form-item>
        </el-form>

        <div v-else-if="formLoading" v-loading="true" style="height: 200px" />
      </el-tab-pane>

      <!-- ══════════════════════════════════════════════════════════════
           Tab 2: 完整 YAML 配置 (config.yaml)
           ══════════════════════════════════════════════════════════════ -->
      <el-tab-pane label="完整 YAML 配置" name="yaml">
        <el-alert v-if="yamlError" :title="yamlError" type="error" show-icon :closable="true" style="margin-bottom: 12px" @close="yamlError = ''" />
        <el-alert v-if="yamlSaved" title="配置已保存，系统正在重启…" type="success" show-icon :closable="true" style="margin-bottom: 12px" @close="yamlSaved = false" />

        <div class="yaml-toolbar">
          <el-button type="primary" :loading="yamlApplying" @click="applyYAML">
            {{ yamlApplying ? '正在下发…' : '保存并重启' }}
          </el-button>
          <el-button @click="loadYAML">重新加载</el-button>
          <span class="muted" style="font-size: 12px; margin-left: 8px">
            编辑后点击"保存并重启"将覆盖 config.yaml 并重启全部组件（自动备份 .bak）
          </span>
        </div>

        <div v-if="yamlLoading" v-loading="true" style="height: 300px" />
        <el-input
          v-else
          v-model="yamlContent"
          type="textarea"
          :autosize="{ minRows: 30, maxRows: 60 }"
          class="yaml-editor"
          spellcheck="false"
        />
      </el-tab-pane>
    </el-tabs>

    <!-- 重启提示 -->
    <el-dialog v-model="restartDialog" title="配置已下发" width="440" :close-on-click-modal="false" :show-close="false">
      <el-result :icon="restartFailed ? 'warning' : 'success'" title="配置已保存" :sub-title="restartSubtitle">
        <template #extra>
          <p class="muted">系统正在重建并重启，用时通常数秒至一分钟。页面会在后端恢复后自动刷新。</p>
          <p class="muted">已等待 <b>{{ waited }}</b> 秒…</p>
          <el-progress
            :percentage="restartFailed ? 100 : Math.min(99, Math.round(waited / restartTimeout * 100))"
            :status="restartFailed ? 'warning' : undefined"
            :indeterminate="!restartFailed"
            :show-text="false"
          />
          <div v-if="restartFailed" style="margin-top: 16px">
            <el-button type="primary" @click="() => window.location.reload()">立即刷新</el-button>
          </div>
        </template>
      </el-result>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import yaml from 'js-yaml'
import { api } from '@/api/client'

// ── Shared ──
const activeTab = ref('form')
const restartDialog = ref(false)
const waited = ref(0)
const restartFailed = ref(false)
const restartTimeout = 120
const restartSubtitle = ref('系统正在重启，请稍候…')
const ifaces = ref<string[]>(['eth0', 'ens33', 'ens192', 'enp0s3', 'wlan0', 'bond0', 'br0'])

async function pingVersion(timeoutMs: number): Promise<boolean> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const base = (import.meta.env.VITE_AGENT_BASE as string | undefined) ?? (import.meta.env.DEV ? '/api' : '')
    const res = await fetch(`${base}/version?_=${Date.now()}`, { cache: 'no-store', headers: { Accept: 'application/json' }, signal: ctrl.signal })
    return res.ok
  } catch { return false } finally { clearTimeout(t) }
}
async function waitForRecovery() {
  await new Promise(r => setTimeout(r, 1500))
  const start = Date.now()
  const ticker = setInterval(() => { waited.value = Math.round((Date.now() - start) / 1000) }, 500)
  try {
    while ((Date.now() - start) / 1000 < restartTimeout) {
      if (await pingVersion(2000)) { clearInterval(ticker); window.location.reload(); return }
      await new Promise(r => setTimeout(r, 1000))
    }
    clearInterval(ticker)
    restartFailed.value = true
    restartSubtitle.value = '后端在预期时间内未恢复，请手动刷新'
  } finally { clearInterval(ticker) }
}
function startRecoveryDialog() {
  restartDialog.value = true
  restartFailed.value = false
  restartSubtitle.value = '系统正在重启，请稍候…'
  waited.value = 0
  void waitForRecovery()
}

// ══════════════════════════════════════════════════════════════════════
// Form config — reads/writes config.yaml via js-yaml
// ══════════════════════════════════════════════════════════════════════
// Flat reactive object mirroring config.yaml structure
const f = ref<any>(null)
const formLoading = ref(false)
const formApplying = ref(false)
const formError = ref('')
const formSaved = ref(false)

// ignore_ports: convert between array and comma-separated string
const ignorePortsStr = computed({
  get: () => (f.value?.agent?.flow_filter?.ignore_ports ?? []).join(', '),
  set: (v: string) => {
    if (!f.value?.agent?.flow_filter) return
    f.value.agent.flow_filter.ignore_ports = v.split(',').map(s => parseInt(s.trim(), 10)).filter(n => n > 0 && n <= 65535)
  },
})

function ensureDefaults(o: any): any {
  // Ensure all expected nested objects exist
  if (!o) o = {}
  o.global = { tenant_id: 'default', probe_id: '', log_level: 'info', log_dir: '/root/NetSentry/log', data_dir: '/var/lib/netsentry', ...o.global }
  o.network = { iface: 'eth0', agent_listen: ':7080', watchdog_listen: ':7090', ...o.network }
  o.capture = { snaplen: 1500, workers: 'auto', block_size: 1048576, block_count: 64, frame_size: 2048, block_timeout_ms: 10, flow_table_size_per_core: 65536, flow_expire_seconds: 300, flow_snapshot_interval_ms: 100, sample_strategy: 'all', prometheus_port: 9201, ...o.capture }
  o.ipc = { shm_dir: '/dev/shm/netsentry', ring_capacity: 4096, ring_slot_size: 2048, poll_idle_us: 100, ...o.ipc }
  o.pcap = { enabled: false, dir: '/var/lib/netsentry/pcap', max_disk_mb: 4096, retention_seconds: 0, segment_mb: 256, segment_seconds: 300, snaplen: 65535, max_extract_mb: 200, ...o.pcap }
  o.clickhouse = { endpoint: 'tcp://127.0.0.1:9000', database: 'netsentry', username: 'default', password: '', queue_cap: 16384, batch_rows: 10000, flush_interval_ms: 500, flush_conns: 4, dial_timeout_s: 5, l2_frames: false, ...o.clickhouse }
  o.clickhouse.retention = { enabled: true, interval_seconds: 300, ...o.clickhouse.retention }
  o.clickhouse.retention.max_rows = { session_flows: 5000000, flow_features: 5000000, l2_frames: 2000000, dns_sessions: 2000000, http_sessions: 2000000, tls_sessions: 1000000, icmp_sessions: 500000, dns_transactions: 2000000, http_transactions: 2000000, alert_logs: 1000000, zeek_conn: 5000000, zeek_dns: 3000000, zeek_http: 3000000, zeek_ssl: 2000000, zeek_files: 2000000, ...o.clickhouse.retention.max_rows }
  o.agent = { alert_ttl_seconds: 60, ...o.agent }
  o.agent.cache = { dns: 2048, http: 2048, icmp: 1024, tls: 2048, alerts: 1024, flows: 4096, l2_events: 512, dns_tx: 2048, http_tx: 2048, ...o.agent.cache }
  o.agent.flow_filter = { enabled: true, tcp_min_packets: 3, tcp_min_bytes: 0, ignore_ports: [], ...o.agent.flow_filter }
  o.flowfeat = { enabled: false, bin_path: '', interval_seconds: 300, work_dir: '/var/lib/netsentry/flowfeat', ...o.flowfeat }
  o.zeek = { enabled: false, bin_path: '/opt/zeek/bin/zeek', scripts_dir: '', interval_seconds: 300, work_dir: '/var/lib/netsentry/zeek', max_segments_per_tick: 5, retain_logs_days: 7, ...o.zeek }
  o.watchdog = { check_interval_s: 5, ...o.watchdog }
  o.watchdog.sysmon = { disk_warn_gb: 2, disk_critical_mb: 512, ...o.watchdog.sysmon }
  o.watchdog.alerting = { webhook_url: '', silence_duration_s: 60, ...o.watchdog.alerting }
  return o
}

async function loadForm() {
  formLoading.value = true
  formError.value = ''
  formSaved.value = false
  try {
    const raw = await api.getYAMLConfig()
    const parsed = yaml.load(raw) as any
    f.value = ensureDefaults(parsed)
  } catch (err: any) {
    formError.value = '加载配置失败: ' + (err?.message || err)
  } finally {
    formLoading.value = false
  }
}

async function applyForm() {
  if (!f.value) return
  formApplying.value = true
  formError.value = ''
  formSaved.value = false
  try {
    const text = yaml.dump(f.value, { indent: 2, lineWidth: 120, noRefs: true, sortKeys: false })
    await api.postYAMLConfig(text)
    formSaved.value = true
    startRecoveryDialog()
  } catch (err: any) {
    formError.value = '下发配置失败: ' + (err?.message || err)
  } finally {
    formApplying.value = false
  }
}

// ══════════════════════════════════════════════════════════════════════
// YAML config (raw editor)
// ══════════════════════════════════════════════════════════════════════
const yamlContent = ref('')
const yamlLoading = ref(false)
const yamlApplying = ref(false)
const yamlError = ref('')
const yamlSaved = ref(false)

async function loadYAML() {
  yamlLoading.value = true
  yamlError.value = ''
  yamlSaved.value = false
  try { yamlContent.value = await api.getYAMLConfig() }
  catch (err: any) { yamlError.value = '加载 YAML 失败: ' + (err?.message || err) }
  finally { yamlLoading.value = false }
}

async function applyYAML() {
  if (!yamlContent.value.trim()) { yamlError.value = 'YAML 内容不能为空'; return }
  yamlApplying.value = true
  yamlError.value = ''
  yamlSaved.value = false
  try {
    await api.postYAMLConfig(yamlContent.value)
    yamlSaved.value = true
    startRecoveryDialog()
  } catch (err: any) {
    yamlError.value = '下发失败: ' + (err?.message || err)
  } finally {
    yamlApplying.value = false
  }
}

// Lazy-load tabs
watch(activeTab, (tab) => {
  if (tab === 'yaml' && !yamlContent.value && !yamlLoading.value) void loadYAML()
  if (tab === 'form' && !f.value && !formLoading.value) void loadForm()
})

onMounted(() => { void loadForm() })
</script>

<style scoped>
.sec-title {
  font-weight: 600; margin: 24px 0 12px;
  color: var(--sg-text, #303133);
  border-left: 3px solid var(--sg-brand, #409eff);
  padding-left: 8px; font-size: 15px;
}
.sec-title:first-child { margin-top: 0; }
.sec-sub {
  font-weight: 600; margin: 14px 0 8px;
  color: var(--sg-text-secondary, #606266);
  font-size: 13px; padding-left: 4px;
}
.tip { font-size: 12px; color: var(--sg-text-muted, #909399); margin-left: 12px; }
.muted { color: var(--sg-text-muted, #909399); font-size: 14px; }
.yaml-toolbar { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
.yaml-editor :deep(textarea) {
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 13px; line-height: 1.6; tab-size: 2; background: #fafafa; color: var(--sg-text, #303133);
}
</style>
