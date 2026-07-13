<template>
  <div class="page">
    <!-- ── KPI 卡片 ── -->
    <el-row :gutter="14" class="kpi-row">
      <el-col :xs="12" :sm="8" :md="4">
        <StatCard label="分类流数" :value="formatNumber(currentStat.flows)" sub="当前分类" :icon="DataLine" tone="#3b82f6" />
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <StatCard label="活跃应用" :value="formatNumber(currentStat.activeApps)" :sub="'Top: ' + appLabel(currentStat.topApp || '—')" :icon="Promotion" tone="#8b5cf6" />
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <StatCard label="总字节" :value="formatBytes(currentStat.bytes)" sub="当前分类" :icon="DataLine" tone="#22c55e" />
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <StatCard label="总包数" :value="formatNumber(currentStat.packets)" sub="当前分类" :icon="Connection" tone="#f59e0b" />
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <StatCard label="源 IP 数" :value="formatNumber(currentStat.srcIps)" sub="去重计数" :icon="Monitor" tone="#06b6d4" />
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <StatCard label="最活跃" :value="appLabel(currentStat.topApp || '—')" sub="应用名" :icon="ChromeFilled" tone="#64748b" />
      </el-col>
    </el-row>

    <!-- ── 图表 ── -->
    <el-row :gutter="12" class="cat-charts-row" v-if="currentStat.flows > 0">
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="cat-chart-card">
          <template #header><div class="section-header"><el-icon><PieChart /></el-icon><span>访问网站分布</span></div></template>
          <div class="cat-chart-canvas">
            <div v-if="chartData.length === 0" class="muted small" style="text-align:center;padding-top:80px">暂无数据</div>
            <div v-else ref="pieChartEl" style="width:100%;height:100%"></div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="cat-chart-card">
          <template #header><div class="section-header"><el-icon><Histogram /></el-icon><span>流量排行 (字节)</span></div></template>
          <div class="cat-chart-canvas">
            <div v-if="barData.length === 0" class="muted small" style="text-align:center;padding-top:80px">暂无数据</div>
            <div v-else style="width:100%;height:100%;overflow-y:auto;padding:8px 0">
              <div v-for="([name, bytes], i) in barData" :key="name" style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
                <span style="width:100px;font-size:11px;text-align:right;flex-shrink:0" class="mono">{{ appLabel(name) }}</span>
                <div style="flex:1;height:18px;background:var(--el-fill-color-light);border-radius:3px;overflow:hidden">
                  <div :style="{ width: (bytes / (barData[0]?.[1] || 1) * 100) + '%', height: '100%', background: i === 0 ? '#3b82f6' : '#93c5fd', borderRadius: '3px', transition: 'width 0.3s' }"></div>
                </div>
                <span style="width:70px;font-size:11px;flex-shrink:0" class="mono">{{ formatBytes(bytes) }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- ── 子 Tab：具体 App 筛选 ── -->
    <el-tabs v-model="activeSubTab" type="card" class="app-sub-tabs">
      <el-tab-pane name="__all__">
        <template #label><span class="tab-label">全部 <span class="muted small">({{ currentStat.flows }})</span></span></template>
      </el-tab-pane>
      <el-tab-pane v-for="appName in currentCat?.apps ?? []" :key="appName" :name="appName">
        <template #label>
          <span class="tab-label">{{ appLabel(appName) }} <span class="muted small">({{ appFlowCount(appName) }})</span></span>
        </template>
      </el-tab-pane>
    </el-tabs>

    <!-- ── 选中具体应用时的 KPI 详情 ── -->
    <div v-if="activeSubTab !== '__all__' && selectedAppKPI" class="app-detail-kpi">
      <el-row :gutter="10">
        <el-col :xs="12" :sm="8" :md="4">
          <div class="mini-kpi"><div class="mini-val">{{ selectedAppKPI.flowCount }}</div><div class="mini-label">连接数</div></div>
        </el-col>
        <el-col :xs="12" :sm="8" :md="4">
          <div class="mini-kpi"><div class="mini-val">{{ formatBytes(selectedAppKPI.totalBytes) }}</div><div class="mini-label">总流量</div></div>
        </el-col>
        <el-col :xs="12" :sm="8" :md="4">
          <div class="mini-kpi"><div class="mini-val">{{ selectedAppKPI.avgDuration }}</div><div class="mini-label">平均时长</div></div>
        </el-col>
        <el-col :xs="12" :sm="8" :md="4">
          <div class="mini-kpi"><div class="mini-val">{{ selectedAppKPI.uniqueDstIps }}</div><div class="mini-label">目标服务器</div></div>
        </el-col>
        <el-col :xs="12" :sm="8" :md="4">
          <div class="mini-kpi"><div class="mini-val">{{ selectedAppKPI.uniqueSrcIps }}</div><div class="mini-label">访问客户端</div></div>
        </el-col>
        <el-col :xs="12" :sm="8" :md="4">
          <div class="mini-kpi"><div class="mini-val">{{ selectedAppKPI.lastSeen }}</div><div class="mini-label">最近活跃</div></div>
        </el-col>
      </el-row>
      <div v-if="selectedAppKPI.topHosts.length > 0" class="app-detail-hosts">
        <span class="muted small">主要访问域名：</span>
        <el-tag v-for="h in selectedAppKPI.topHosts" :key="h" size="small" type="info" style="margin:2px 4px">{{ h }}</el-tag>
      </div>
    </div>

    <!-- ── 工具栏 ── -->
    <div class="tab-toolbar">
      <el-input v-model="appSearch" placeholder="搜索 IP / 主机名 / 应用…" clearable :prefix-icon="Search" size="small" style="width: 240px" />
      <el-button size="small" :icon="Refresh" @click="loadAllFlows">刷新</el-button>
    </div>

    <!-- ── 流表格（可展开行） ── -->
    <el-table :data="tableRows" v-loading="loading" size="small" stripe :max-height="580"
              :default-sort="{ prop: 'timestamp', order: 'descending' }" empty-text="暂无数据 — 当网络中有对应应用流量时将自动显示"
              @row-click="onRowClick" highlight-current-row row-class-name="clickable-row"
              :expand-row-keys="expandedRows" row-key="flow_hash" @expand-change="onExpandChange">
      <el-table-column type="expand">
        <template #default="{ row }">
          <div class="expand-panel" v-if="getRowMetrics(row)">
            <el-row :gutter="12">
              <!-- 连接概况 -->
              <el-col :xs="24" :md="8">
                <div class="ep-section">
                  <div class="ep-title">连接概况</div>
                  <div class="ep-item"><span class="ep-label">域名</span><span class="mono break">{{ row.host || '—' }}</span></div>
                  <div class="ep-item"><span class="ep-label">协议</span>
                    <el-tag size="small" :type="getRowMetrics(row)!.isTls ? 'success' : 'danger'" effect="plain">{{ getRowMetrics(row)!.protoVersion }}</el-tag>
                  </div>
                  <div class="ep-item"><span class="ep-label">目标</span><span class="mono">{{ row.five_tuple.dst_ip }}:{{ row.five_tuple.dst_port }}</span></div>
                  <div class="ep-item"><span class="ep-label">源端</span><span class="mono">{{ row.five_tuple.src_ip }}:{{ row.five_tuple.src_port }}</span></div>
                </div>
              </el-col>
              <!-- 安全特征 -->
              <el-col :xs="24" :md="8">
                <div class="ep-section">
                  <div class="ep-title">安全特征</div>
                  <div class="ep-item"><span class="ep-label">加密</span>
                    <el-tag :type="getRowMetrics(row)!.isTls ? 'success' : 'danger'" size="small" effect="dark">
                      {{ getRowMetrics(row)!.isTls ? '✓ HTTPS' : '✗ 明文' }}
                    </el-tag>
                  </div>
                  <div class="ep-item" v-if="getRowMetrics(row)!.isTls"><span class="ep-label">TLS</span>
                    <span class="mono">{{ getRowMetrics(row)!.tlsVersion }}</span>
                  </div>
                  <div class="ep-item"><span class="ep-label">风险</span>
                    <span v-if="getRowMetrics(row)!.riskLevel === 'safe'" style="color:#67c23a;font-weight:600">✓ 无风险</span>
                    <span v-else-if="getRowMetrics(row)!.riskLevel === 'low'" style="color:#e6a23c;font-weight:600">⚠ 低风险</span>
                    <span v-else style="color:#f56c6c;font-weight:600">✗ 高风险</span>
                  </div>
                  <div class="ep-item"><span class="ep-label">CDN</span>
                    <el-tag v-if="getRowMetrics(row)!.cdn" type="info" size="small">{{ getRowMetrics(row)!.cdn }}</el-tag>
                    <span v-else class="muted">—</span>
                  </div>
                </div>
              </el-col>
              <!-- 性能指标 -->
              <el-col :xs="24" :md="8">
                <div class="ep-section">
                  <div class="ep-title">性能指标</div>
                  <div class="ep-item"><span class="ep-label">TCP 建连</span>
                    <span class="mono" :style="{ color: latencyColor(row.tcp_connect_ms || 0) }">{{ row.tcp_connect_ms ? row.tcp_connect_ms.toFixed(1) + ' ms' : '—' }}</span>
                  </div>
                  <div class="ep-item"><span class="ep-label">页面加载</span>
                    <span class="mono" :style="{ color: latencyColor(getRowMetrics(row)!.pageLoadMs) }">{{ getRowMetrics(row)!.pageLoadTime }}</span>
                  </div>
                  <div class="ep-item"><span class="ep-label">速率</span><span class="mono">{{ getRowMetrics(row)!.throughput }}</span></div>
                  <div class="ep-item"><span class="ep-label">包大小</span><span class="mono">{{ getRowMetrics(row)!.avgPktSize }} B (avg)</span></div>
                  <div class="ep-item"><span class="ep-label">同域名</span><span class="mono">{{ getRowMetrics(row)!.sameHostFlows }} 次连接</span></div>
                </div>
              </el-col>
            </el-row>
            <!-- 行为分析（底部一行） -->
            <div class="ep-behavior">
              <el-tag size="small" effect="plain">{{ getRowMetrics(row)!.contentType }}</el-tag>
              <el-tag size="small" effect="plain" type="info">{{ getRowMetrics(row)!.trafficPattern }}</el-tag>
              <el-tag size="small" effect="plain" type="warning">{{ getRowMetrics(row)!.connPattern }}</el-tag>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="timestamp" label="时间" width="170" sortable>
        <template #default="{ row }"><span class="mono xs">{{ formatTime(row.timestamp) }}</span></template>
      </el-table-column>
      <el-table-column label="应用" width="110">
        <template #default="{ row }"><el-tag size="small" type="success" disable-transitions>{{ appLabel(getFlowAppName(row) || row.app_proto || '—') }}</el-tag></template>
      </el-table-column>
      <el-table-column label="传输" width="70" align="center">
        <template #default="{ row }"><span class="mono xs">{{ row.master_proto || row.five_tuple.protocol }}</span></template>
      </el-table-column>
      <el-table-column label="源地址" min-width="130">
        <template #default="{ row }"><span class="mono xs">{{ prettyIP(row.five_tuple.src_ip) }}<span class="port">:{{ row.five_tuple.src_port }}</span></span></template>
      </el-table-column>
      <el-table-column label="目的地址" min-width="130">
        <template #default="{ row }"><span class="mono xs">{{ prettyIP(row.five_tuple.dst_ip) }}<span class="port">:{{ row.five_tuple.dst_port }}</span></span></template>
      </el-table-column>
      <el-table-column label="主机名 / SNI" min-width="180">
        <template #default="{ row }"><span class="mono xs host-cell" :title="row.host">{{ ellipsis(row.host, 36) || '—' }}</span></template>
      </el-table-column>
      <el-table-column prop="bytes_count" label="字节" width="85" align="right" sortable>
        <template #default="{ row }">{{ formatBytes(row.bytes_count) }}</template>
      </el-table-column>
      <el-table-column prop="duration_ms" label="时长" width="80" align="right" sortable>
        <template #default="{ row }">{{ formatDurationMs(row.duration_ms) }}</template>
      </el-table-column>
      <el-table-column label="方向" width="60" align="center">
        <template #default="{ row }"><span :class="'dir dir-' + (row.direction || 'unknown')">{{ dirLabel(row.direction) }}</span></template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import * as echarts from 'echarts/core'
import { PieChart as EChartsPie } from 'echarts/charts'
import { TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import {
  ChromeFilled, Connection, DataLine, Headset, Histogram,
  Lock, Monitor, PieChart, Promotion, Refresh, Search, VideoCamera,
} from '@element-plus/icons-vue'

import StatCard from '@/components/StatCard.vue'
import { useProbeStore } from '@/stores/probe'
import { api } from '@/api/client'
import type { Flow } from '@/api/types'
import { ellipsis, formatBytes, formatDurationMs, formatNumber, formatTime, prettyIP } from '@/utils/format'

echarts.use([EChartsPie, TooltipComponent, LegendComponent, CanvasRenderer])

const route = useRoute()
const store = useProbeStore()

function dirLabel(dir?: string): string {
  if (dir === 'inbound') return '↓ 入'
  if (dir === 'outbound') return '↑ 出'
  if (dir === 'internal') return '↔ 内'
  return '?'
}

// ── 应用名中文映射 ──
const APP_LABELS: Record<string, string> = {
  // 网页浏览
  GOOGLE: '谷歌', BAIDU: '百度', BING: '必应', YAHOO: '雅虎', YANDEX: 'Yandex',
  DUCKDUCKGO: 'DuckDuckGo', WIKIPEDIA: '维基百科', ALIBABA: '阿里巴巴', TAOBAO: '淘宝',
  JD: '京东', AMAZON: '亚马逊', EBAY: 'eBay', SHOPEE: 'Shopee', PINDUODUO: '拼多多', MEITUAN: '美团',
  // 流媒体
  YOUTUBE: 'YouTube', NETFLIX: 'Netflix', TIKTOK: '抖音/TikTok', BILIBILI: 'B站',
  IQIYI: '爱奇艺', YOUKU: '优酷', HULU: 'Hulu', DISNEY_PLUS: 'Disney+',
  TWITCH: 'Twitch', VIMEO: 'Vimeo', DAILYMOTION: 'Dailymotion', PRIME_VIDEO: 'Prime Video',
  SPOTIFY: 'Spotify', APPLE_MUSIC: 'Apple Music', NETEASE_MUSIC: '网易云音乐',
  QQ_MUSIC: 'QQ音乐', KUGOU: '酷狗', SOUNDCLOUD: 'SoundCloud', DOUYU: '斗鱼', HUYA: '虎牙', KICK: 'Kick',
  // 社交通讯
  FACEBOOK: 'Facebook', TWITTER: 'X/Twitter', INSTAGRAM: 'Instagram', LINKEDIN: 'LinkedIn',
  PINTEREST: 'Pinterest', REDDIT: 'Reddit', WEIBO: '微博', SNAPCHAT: 'Snapchat',
  WECHAT: '微信', WHATSAPP: 'WhatsApp', TELEGRAM: 'Telegram', DISCORD: 'Discord',
  SLACK: 'Slack', TEAMS: 'Teams', SIGNAL: 'Signal', LINE: 'LINE', VIBER: 'Viber', QQ: 'QQ', DINGTALK: '钉钉',
  // 语音视频
  ZOOM: 'Zoom', SKYPE: 'Skype', WEBEX: 'Webex', GOOGLE_MEET: 'Google Meet',
  FACETIME: 'FaceTime', SIP: 'SIP', RTP: 'RTP', STUN: 'STUN', TURN: 'TURN',
  // 电子邮件
  GMAIL: 'Gmail', OUTLOOK: 'Outlook', YAHOO_MAIL: '雅虎邮箱', PROTONMAIL: 'ProtonMail',
  IMAP: 'IMAP', SMTP: 'SMTP', POP3: 'POP3', EXCHANGE: 'Exchange', QQ_MAIL: 'QQ邮箱', '163_MAIL': '163邮箱',
  // 云服务
  AWS: 'AWS', AZURE: 'Azure', GOOGLE_CLOUD: '谷歌云', ALIBABA_CLOUD: '阿里云',
  TENCENT_CLOUD: '腾讯云', CLOUDFLARE: 'Cloudflare', AKAMAI: 'Akamai',
  FASTLY: 'Fastly', CLOUDFRONT: 'CloudFront', ALICDN: '阿里CDN', QINIU: '七牛',
  // 文件传输
  DROPBOX: 'Dropbox', GOOGLE_DRIVE: 'Google Drive', ONEDRIVE: 'OneDrive', ICLOUD: 'iCloud',
  BOX: 'Box', WETRANSFER: 'WeTransfer', BAIDU_NETDISK: '百度网盘',
  BITTORRENT: 'BitTorrent', EMULE: 'eMule', THUNDER: '迅雷', MEGA: 'MEGA',
  SMB: 'SMB', NFS: 'NFS', WEBDAV: 'WebDAV',
  // 远程访问
  RDP: '远程桌面', VNC: 'VNC', TEAMVIEWER: 'TeamViewer', ANYDESK: 'AnyDesk',
  CITRIX: 'Citrix', XRDP: 'XRDP', NOMACHINE: 'NoMachine', PARSEC: 'Parsec', RUSTDESK: 'RustDesk',
  // 游戏
  STEAM: 'Steam', XBOX: 'Xbox', PLAYSTATION: 'PlayStation', NINTENDO: '任天堂',
  LOL: '英雄联盟', DOTA2: 'DOTA2', CSGO: 'CS2', FORTNITE: '堡垒之夜',
  MINECRAFT: '我的世界', GENSHIN: '原神', PUBG: 'PUBG', VALORANT: 'Valorant', ROBLOX: 'Roblox',
  // 办公协作
  OFFICE365: 'Office 365', GOOGLE_WORKSPACE: 'Google办公', NOTION: 'Notion',
  CONFLUENCE: 'Confluence', JIRA: 'JIRA', TRELLO: 'Trello', FEISHU: '飞书', DINGTALK_DOC: '钉钉文档', WECOM: '企业微信',
  // 开发运维
  GITHUB: 'GitHub', GITLAB: 'GitLab', BITBUCKET: 'Bitbucket', DOCKER_HUB: 'Docker Hub',
  NPM: 'NPM', PYPI: 'PyPI', MAVEN: 'Maven', JENKINS: 'Jenkins',
  GRAFANA: 'Grafana', SENTRY: 'Sentry', MYSQL: 'MySQL', POSTGRESQL: 'PostgreSQL',
  MONGODB: 'MongoDB', REDIS: 'Redis', ELASTICSEARCH: 'ES', CLICKHOUSE: 'ClickHouse', KAFKA: 'Kafka',
  // 物联网
  MQTT: 'MQTT', COAP: 'CoAP', MODBUS: 'Modbus', OPCUA: 'OPC-UA',
  BACNET: 'BACnet', DNP3_SCADA: 'DNP3', ZIGBEE: 'ZigBee', ZWAVE: 'Z-Wave', HOMEKIT: 'HomeKit', TUYA: '涂鸦',
  // 广告追踪
  GOOGLE_ADS: '谷歌广告', FACEBOOK_ADS: 'FB广告', DOUBLECLICK: 'DoubleClick',
  ADSENSE: 'AdSense', CRITEO: 'Criteo', APPSFLYER: 'AppsFlyer',
  ADJUST: 'Adjust', UMENG: '友盟', BAIDU_ANALYTICS: '百度统计', GOOGLE_ANALYTICS: 'GA',
  // 金融支付
  ALIPAY: '支付宝', WECHAT_PAY: '微信支付', PAYPAL: 'PayPal', STRIPE: 'Stripe',
  SQUARE: 'Square', APPLE_PAY: 'Apple Pay', GOOGLE_PAY: 'Google Pay',
  UNIONPAY: '银联', VISA: 'Visa', MASTERCARD: '万事达', BANKING: '网银', STOCK_TRADING: '股票交易',
  // AI 大模型
  OPENAI: 'OpenAI', CHATGPT: 'ChatGPT', CLAUDE: 'Claude', ANTHROPIC: 'Anthropic',
  GEMINI: 'Gemini', DEEPSEEK: 'DeepSeek', QWEN: '通义千问', ZHIPU: '智谱AI',
  BAICHUAN: '百川', MOONSHOT: 'Moonshot/Kimi', MINIMAX: 'MiniMax', COHERE: 'Cohere',
  MISTRAL: 'Mistral', LLAMA: 'LLaMA', HUGGINGFACE: 'HuggingFace', REPLICATE: 'Replicate', TOGETHER_AI: 'Together AI',
}

function appLabel(name: string): string {
  return APP_LABELS[name] || name
}

// ── 数据 ──
const allFlows = ref<Flow[]>([])
const loading = ref(false)
const appSearch = ref('')
const activeSubTab = ref('__all__')

async function loadAllFlows() {
  loading.value = true
  try { allFlows.value = await api.recentFlows(500) } catch { /* ignore */ } finally { loading.value = false }
}

onMounted(() => { void loadAllFlows() })

// ── 分类定义（14 类）──
interface AppCategory { key: string; label: string; icon: any; apps: string[] }
const APP_CATEGORIES: AppCategory[] = [
  { key: 'web', label: '网页浏览', icon: ChromeFilled, apps: ['GOOGLE', 'BAIDU', 'BING', 'YAHOO', 'YANDEX', 'DUCKDUCKGO', 'WIKIPEDIA', 'ALIBABA', 'TAOBAO', 'JD', 'AMAZON', 'EBAY', 'SHOPEE', 'PINDUODUO', 'MEITUAN'] },
  { key: 'streaming', label: '流媒体', icon: VideoCamera, apps: ['YOUTUBE', 'NETFLIX', 'TIKTOK', 'BILIBILI', 'IQIYI', 'YOUKU', 'HULU', 'DISNEY_PLUS', 'TWITCH', 'VIMEO', 'DAILYMOTION', 'PRIME_VIDEO', 'SPOTIFY', 'APPLE_MUSIC', 'NETEASE_MUSIC', 'QQ_MUSIC', 'KUGOU', 'SOUNDCLOUD', 'DOUYU', 'HUYA', 'KICK'] },
  { key: 'social', label: '社交通讯', icon: Promotion, apps: ['FACEBOOK', 'TWITTER', 'INSTAGRAM', 'LINKEDIN', 'PINTEREST', 'REDDIT', 'WEIBO', 'SNAPCHAT', 'WECHAT', 'WHATSAPP', 'TELEGRAM', 'DISCORD', 'SLACK', 'TEAMS', 'SIGNAL', 'LINE', 'VIBER', 'QQ', 'DINGTALK'] },
  { key: 'voip', label: '语音视频', icon: Headset, apps: ['ZOOM', 'SKYPE', 'WEBEX', 'GOOGLE_MEET', 'FACETIME', 'SIP', 'RTP', 'STUN', 'TURN'] },
  { key: 'email', label: '电子邮件', icon: Promotion, apps: ['GMAIL', 'OUTLOOK', 'YAHOO_MAIL', 'PROTONMAIL', 'IMAP', 'SMTP', 'POP3', 'EXCHANGE', 'QQ_MAIL', '163_MAIL'] },
  { key: 'cloud', label: '云服务', icon: Monitor, apps: ['AWS', 'AZURE', 'GOOGLE_CLOUD', 'ALIBABA_CLOUD', 'TENCENT_CLOUD', 'CLOUDFLARE', 'AKAMAI', 'FASTLY', 'CLOUDFRONT', 'ALICDN', 'QINIU'] },
  { key: 'file_transfer', label: '文件传输', icon: DataLine, apps: ['DROPBOX', 'GOOGLE_DRIVE', 'ONEDRIVE', 'ICLOUD', 'BOX', 'WETRANSFER', 'BAIDU_NETDISK', 'BITTORRENT', 'EMULE', 'THUNDER', 'MEGA', 'SMB', 'NFS', 'WEBDAV'] },
  { key: 'remote', label: '远程访问', icon: Monitor, apps: ['RDP', 'VNC', 'TEAMVIEWER', 'ANYDESK', 'CITRIX', 'XRDP', 'NOMACHINE', 'PARSEC', 'RUSTDESK'] },
  { key: 'game', label: '游戏', icon: VideoCamera, apps: ['STEAM', 'XBOX', 'PLAYSTATION', 'NINTENDO', 'LOL', 'DOTA2', 'CSGO', 'FORTNITE', 'MINECRAFT', 'GENSHIN', 'PUBG', 'VALORANT', 'ROBLOX'] },
  { key: 'office', label: '办公协作', icon: Histogram, apps: ['OFFICE365', 'GOOGLE_WORKSPACE', 'NOTION', 'CONFLUENCE', 'JIRA', 'TRELLO', 'FEISHU', 'DINGTALK_DOC', 'WECOM'] },
  { key: 'devops', label: '开发运维', icon: Connection, apps: ['GITHUB', 'GITLAB', 'BITBUCKET', 'DOCKER_HUB', 'NPM', 'PYPI', 'MAVEN', 'JENKINS', 'GRAFANA', 'SENTRY', 'MYSQL', 'POSTGRESQL', 'MONGODB', 'REDIS', 'ELASTICSEARCH', 'CLICKHOUSE', 'KAFKA'] },
  { key: 'iot', label: '物联网/工控', icon: Connection, apps: ['MQTT', 'COAP', 'MODBUS', 'OPCUA', 'BACNET', 'DNP3_SCADA', 'ZIGBEE', 'ZWAVE', 'HOMEKIT', 'TUYA'] },
  { key: 'ads', label: '广告追踪', icon: Promotion, apps: ['GOOGLE_ADS', 'FACEBOOK_ADS', 'DOUBLECLICK', 'ADSENSE', 'CRITEO', 'APPSFLYER', 'ADJUST', 'UMENG', 'BAIDU_ANALYTICS', 'GOOGLE_ANALYTICS'] },
  { key: 'finance', label: '金融支付', icon: DataLine, apps: ['ALIPAY', 'WECHAT_PAY', 'PAYPAL', 'STRIPE', 'SQUARE', 'APPLE_PAY', 'GOOGLE_PAY', 'UNIONPAY', 'VISA', 'MASTERCARD', 'BANKING', 'STOCK_TRADING'] },
  { key: 'ai_llm', label: 'AI 大模型', icon: Promotion, apps: ['OPENAI', 'CHATGPT', 'CLAUDE', 'ANTHROPIC', 'GEMINI', 'DEEPSEEK', 'QWEN', 'ZHIPU', 'BAICHUAN', 'MOONSHOT', 'MINIMAX', 'COHERE', 'MISTRAL', 'LLAMA', 'HUGGINGFACE', 'REPLICATE', 'TOGETHER_AI'] },
]

const catMap = Object.fromEntries(APP_CATEGORIES.map(c => [c.key, c]))

// ── 当前分类（来自路由参数）──
const currentCat = computed<AppCategory | null>(() => {
  const key = route.params.catKey as string
  return catMap[key] ?? null
})

watch(() => route.params.catKey, () => {
  activeSubTab.value = '__all__'
  appSearch.value = ''
  if (allFlows.value.length === 0) void loadAllFlows()
})

// ── 应用名提取 ──
function getFlowAppName(f: Flow): string | null {
  const BASE = ['DNS', 'HTTP', 'TLS', 'SSH', 'DTLS', 'HTTP2', 'HTTP_PROXY', 'IP_ICMP', 'IP_ICMPV6', 'IP_GRE', 'IPSEC', 'IGMP', 'SSDP', 'NTP', 'SNMP', 'LDAP']
  if (f.app_proto && !BASE.includes(f.app_proto)) return f.app_proto
  if (f.master_proto && !BASE.includes(f.master_proto)) return f.master_proto
  return null
}

// ── app → category 映射 ──
const appToCatKey = computed(() => {
  const map = new Map<string, string>()
  for (const cat of APP_CATEGORIES) {
    for (const app of cat.apps) map.set(app, cat.key)
  }
  return map
})

// AI 大模型域名匹配
const AI_HOST_PATTERNS: RegExp[] = [
  /openai\.com/i, /api\.openai/i, /chatgpt\.com/i,
  /anthropic\.com/i, /claude\.ai/i,
  /deepseek\.com/i, /api\.deepseek/i,
  /generativelanguage\.googleapis/i, /gemini/i,
  /dashscope\.aliyuncs/i, /qwen/i, /tongyi/i,
  /bigmodel\.cn/i, /zhipuai\.cn/i, /chatglm/i,
  /baichuan-ai\.com/i,
  /moonshot\.cn/i, /kimi\.ai/i, /kimi\.moonshot/i,
  /minimax\.chat/i, /api\.minimax/i,
  /cohere\.ai/i, /cohere\.com/i,
  /mistral\.ai/i,
  /huggingface\.co/i, /api-inference\.huggingface/i,
  /replicate\.com/i,
  /together\.xyz/i, /api\.together/i,
  /groq\.com/i,
  /perplexity\.ai/i,
  /01\.ai/i, /lingyiwanwu/i,
  /volcengine.*maas/i, /ark\.cn-beijing/i,
]

function flowCatKey(f: Flow): string | null {
  const appName = getFlowAppName(f)
  if (appName) {
    const key = appToCatKey.value.get(appName)
    if (key) return key
  }
  const c = (f.category || '').toUpperCase()
  switch (c) {
    case 'WEB': return 'web'
    case 'MEDIA': case 'VIDEO': case 'MUSIC': case 'STREAMING': return 'streaming'
    case 'SOCIAL_NETWORK': case 'CHAT': return 'social'
    case 'VOIP': return 'voip'
    case 'EMAIL': return 'email'
    case 'CLOUD': return 'cloud'
    case 'FILE_SHARING': case 'DOWNLOAD': case 'DATA_TRANSFER': return 'file_transfer'
    case 'REMOTE_ACCESS': return 'remote'
    case 'GAME': return 'game'
    case 'IOT_SCADA': return 'iot'
    case 'ADVERTISMENT': return 'ads'
    case 'FINANCE': case 'PAYMENT': case 'BANKING': return 'finance'
    case 'ARTIFICIAL_INTELLIGENCE': case 'AI': case 'LLM': return 'ai_llm'
  }
  // 通过域名匹配 AI 大模型
  const host = (f.host || '').toLowerCase()
  if (host && AI_HOST_PATTERNS.some(p => p.test(host))) return 'ai_llm'
  return null
}

// ── 分类过滤 ──
const currentFlows = computed(() => {
  if (!currentCat.value) return []
  let flows = allFlows.value.filter(f => flowCatKey(f) === currentCat.value!.key)
  // 网页浏览分类：仅保留有域名的流（无域名的纯 IP 连接不算网页访问）
  if (currentCat.value.key === 'web') {
    flows = flows.filter(f => !!f.host)
  }
  return flows
})

function appFlowCount(appName: string): number {
  return allFlows.value.filter(f => getFlowAppName(f) === appName).length
}

// ── 表格行 ──
const tableRows = computed(() => {
  let list = currentFlows.value
  if (activeSubTab.value && activeSubTab.value !== '__all__') {
    list = list.filter(f => getFlowAppName(f) === activeSubTab.value)
  }
  const q = appSearch.value.toLowerCase().trim()
  if (q) list = list.filter(f =>
    [f.five_tuple.src_ip, f.five_tuple.dst_ip, f.host, f.app_proto, f.master_proto, f.process_name]
      .filter(Boolean).join(' ').toLowerCase().includes(q)
  )
  return list
})

// ── 统计 ──
interface CatStatResult { flows: number; bytes: number; packets: number; activeApps: number; srcIps: number; topApp: string }
const currentStat = computed<CatStatResult>(() => {
  const flows = currentFlows.value
  let bytes = 0, packets = 0
  const srcIps = new Set<string>()
  const appCounts = new Map<string, number>()
  for (const f of flows) {
    bytes += f.bytes_count ?? 0
    packets += f.packet_count ?? 0
    srcIps.add(f.five_tuple.src_ip)
    const a = getFlowAppName(f) || '(unknown)'
    appCounts.set(a, (appCounts.get(a) ?? 0) + 1)
  }
  let topApp = '', topCount = 0
  for (const [a, c] of appCounts) { if (c > topCount) { topApp = a; topCount = c } }
  return { flows: flows.length, bytes, packets, activeApps: appCounts.size, srcIps: srcIps.size, topApp }
})

// ── 图表（按域名分组） ──
const chartData = computed(() => {
  const counts = new Map<string, number>()
  for (const f of currentFlows.value) {
    const host = f.host || f.five_tuple.dst_ip
    counts.set(host, (counts.get(host) ?? 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, value]) => ({ name, value }))
})

const barData = computed<[string, number][]>(() => {
  const sums = new Map<string, number>()
  for (const f of currentFlows.value) {
    const a = getFlowAppName(f) || f.app_proto || '(unknown)'
    sums.set(a, (sums.get(a) ?? 0) + (f.bytes_count ?? 0))
  }
  return [...sums.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)
})

// ── 饼图 ──
const pieChartEl = ref<HTMLElement | null>(null)
let pieChart: echarts.ECharts | null = null

const PIE_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316', '#14b8a6', '#6366f1', '#84cc16']

function updatePieChart() {
  if (!pieChartEl.value) return
  if (!pieChart) {
    pieChart = echarts.init(pieChartEl.value)
  }
  const data = chartData.value.map((d, i) => ({
    name: d.name,
    value: d.value,
    itemStyle: { color: PIE_COLORS[i % PIE_COLORS.length] },
  }))
  pieChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: (p: any) => `${p.name}: ${p.value} 流 (${p.percent}%)`,
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: { fontSize: 11 },
      type: 'scroll',
    },
    series: [{
      type: 'pie',
      radius: ['35%', '65%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: true,
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 12, fontWeight: 'bold' },
      },
      data,
    }],
  }, true)
}

watch(chartData, () => { nextTick(updatePieChart) }, { deep: true })

function handleResize() {
  pieChart?.resize()
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  pieChart?.dispose()
  pieChart = null
})

// 初始化：当 pieChartEl 有值时渲染
watch(pieChartEl, (el) => { if (el) nextTick(updatePieChart) })

// ── 选中应用的 KPI ──
interface AppKPI {
  flowCount: number; totalBytes: number; avgDuration: string
  uniqueDstIps: number; uniqueSrcIps: number; lastSeen: string; topHosts: string[]
}
const selectedAppKPI = computed<AppKPI | null>(() => {
  if (activeSubTab.value === '__all__') return null
  const flows = currentFlows.value.filter(f => getFlowAppName(f) === activeSubTab.value)
  if (flows.length === 0) return null
  let totalBytes = 0, totalDuration = 0
  const dstIps = new Set<string>()
  const srcIps = new Set<string>()
  const hosts = new Map<string, number>()
  let latestTs = 0
  for (const f of flows) {
    totalBytes += f.bytes_count ?? 0
    totalDuration += f.duration_ms ?? 0
    dstIps.add(f.five_tuple.dst_ip)
    srcIps.add(f.five_tuple.src_ip)
    if (f.host) hosts.set(f.host, (hosts.get(f.host) ?? 0) + 1)
    const ts = new Date(f.timestamp).getTime()
    if (ts > latestTs) latestTs = ts
  }
  const avgMs = flows.length ? totalDuration / flows.length : 0
  const avgDuration = avgMs < 1000 ? `${Math.round(avgMs)}ms` : `${(avgMs / 1000).toFixed(1)}s`
  const lastSeen = latestTs ? formatRelative(latestTs) : '—'
  const topHosts = [...hosts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([h]) => h)
  return { flowCount: flows.length, totalBytes, avgDuration, uniqueDstIps: dstIps.size, uniqueSrcIps: srcIps.size, lastSeen, topHosts }
})

function formatRelative(ts: number): string {
  const diff = Date.now() - ts
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return `${Math.floor(diff / 86400000)}天前`
}

// ── 行展开 ──
const expandedRows = ref<(string | number)[]>([])

function onRowClick(row: Flow) {
  const key = row.flow_hash
  const idx = expandedRows.value.indexOf(key)
  if (idx >= 0) {
    expandedRows.value.splice(idx, 1)
  } else {
    expandedRows.value = [key]
  }
}

function onExpandChange(row: Flow, expanded: Flow[]) {
  expandedRows.value = expanded.map(r => r.flow_hash)
}

function latencyColor(ms: number): string {
  if (!ms) return 'var(--el-text-color-secondary)'
  if (ms < 50) return '#67c23a'
  if (ms < 200) return '#e6a23c'
  return '#f56c6c'
}

// CDN 检测 — 根据域名/IP 推断
const CDN_PATTERNS: [RegExp, string][] = [
  [/cloudflare/i, 'Cloudflare'], [/akamai/i, 'Akamai'], [/cloudfront/i, 'CloudFront'],
  [/fastly/i, 'Fastly'], [/cdn\.aliyun|alicdn/i, '阿里CDN'], [/cdn\.qq|cdnjs/i, '腾讯CDN'],
  [/googleapis|gstatic/i, 'Google CDN'], [/fbcdn/i, 'Facebook CDN'],
  [/azure(edge|cdn)/i, 'Azure CDN'], [/edgecast/i, 'Edgecast'],
]

interface WebMetrics {
  isTls: boolean; protoVersion: string; tlsVersion: string; riskLevel: 'safe' | 'low' | 'high'
  cdn: string; throughput: string; avgPktSize: number; contentType: string
  trafficPattern: string; connPattern: string; sameHostFlows: number
  pageLoadTime: string; pageLoadMs: number
}

function getRowMetrics(f: Flow): WebMetrics | null {
  if (!f) return null

  const port = f.five_tuple.dst_port
  const isTls = f.master_proto === 'TLS' || port === 443
  const protoVersion = isTls ? 'HTTPS' : (port === 80 ? 'HTTP' : `TCP:${port}`)
  const tlsVersion = isTls ? (f.master_proto === 'TLS' ? 'TLS 1.2+' : 'TLS') : ''

  // Risk
  const risk = f.ndpi_risk ?? 0
  const riskLevel: 'safe' | 'low' | 'high' = risk === 0 ? 'safe' : risk < 16 ? 'low' : 'high'

  // CDN
  let cdn = ''
  const host = (f.host || '').toLowerCase()
  for (const [pat, name] of CDN_PATTERNS) {
    if (pat.test(host) || pat.test(f.five_tuple.dst_ip)) { cdn = name; break }
  }

  // Throughput
  const durationS = (f.duration_ms || 1) / 1000
  const bps = f.bytes_count / durationS
  const throughput = durationS > 0.01 ? formatBytes(Math.round(bps)) + '/s' : '—'

  // Avg packet size
  const avgPktSize = f.packet_count > 0 ? Math.round(f.bytes_count / f.packet_count) : 0

  // Content type inference based on patterns
  let contentType = '网页文档'
  if (avgPktSize > 1200 && f.bytes_count > 100000) contentType = '大文件/流媒体'
  else if (avgPktSize < 200 && f.packet_count > 20) contentType = 'API 交互/AJAX'
  else if (f.bytes_count < 2000) contentType = '轻量请求 (favicon/ping)'
  else if (avgPktSize > 800) contentType = '页面资源 (JS/CSS/图片)'

  // Traffic pattern
  const dir = f.direction
  let trafficPattern = '双向交互'
  if (dir === 'outbound' && avgPktSize < 300) trafficPattern = '以请求为主 (上行多)'
  else if (dir === 'inbound' || f.bytes_count > 50000) trafficPattern = '以响应为主 (下载数据)'

  // Connection pattern
  let connPattern = '短连接 (单次请求)'
  if (f.duration_ms > 30000) connPattern = '长连接 (Keep-Alive / WebSocket)'
  else if (f.duration_ms > 5000) connPattern = '中等连接 (多次请求复用)'
  else if (f.packet_count > 50) connPattern = '高频交互 (可能 polling)'

  // Same host flows
  const sameHostFlows = f.host
    ? currentFlows.value.filter(ff => ff.host === f.host).length
    : 0

  // 页面加载时间估算：TCP建连 + TLS握手(约2×RTT) + 首字节等待 + 内容传输
  // 近似: tcp_connect_ms(1 RTT) + TLS(2 RTT) + server processing(~1 RTT) + transfer
  const rtt = f.tcp_connect_ms || 0
  const tlsHandshake = isTls ? rtt * 2 : 0 // TLS 1.2 = 2RTT, TLS 1.3 = 1RTT (conservative)
  const serverWait = rtt // 至少 1 RTT 等服务器响应
  const transferTime = f.duration_ms > 0 ? Math.min(f.duration_ms, f.duration_ms - rtt * 3) : 0
  const pageLoadMs = rtt > 0 ? Math.max(rtt + tlsHandshake + serverWait, f.duration_ms || 0) : (f.duration_ms || 0)
  let pageLoadTime = '—'
  if (pageLoadMs > 0) {
    pageLoadTime = pageLoadMs < 1000 ? `${Math.round(pageLoadMs)} ms` : `${(pageLoadMs / 1000).toFixed(2)} s`
  }

  return { isTls, protoVersion, tlsVersion, riskLevel, cdn, throughput, avgPktSize, contentType, trafficPattern, connPattern, sameHostFlows, pageLoadTime, pageLoadMs }
}
</script>

<style scoped>
.kpi-row { margin-bottom: 14px; }
.section-header { display: flex; align-items: center; gap: 8px; font-weight: 600; flex-wrap: wrap; }
.tab-label { display: inline-flex; align-items: center; gap: 6px; }
.tab-toolbar { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.small { font-size: 12px; }
.xs { font-size: 11px; }
.muted { color: var(--el-text-color-secondary); }
.port { color: var(--el-text-color-secondary); }
.host-cell { word-break: break-all; }
.dir { font-size: 12px; font-weight: 600; }
.dir-inbound { color: #3b82f6; }
.dir-outbound { color: #22c55e; }
.dir-internal { color: #a855f7; }
.dir-unknown { color: var(--el-text-color-placeholder); }
.cat-charts-row { margin-bottom: 14px; }
.cat-chart-card :deep(.el-card__body) { padding: 10px; }
.cat-chart-canvas { width: 100%; height: 200px; }
.app-sub-tabs { margin-bottom: 10px; }
.app-sub-tabs :deep(.el-tabs__header) { margin-bottom: 8px; }
.app-sub-tabs :deep(.el-tabs__item) { height: 30px; line-height: 30px; font-size: 12px; padding: 0 12px; }
.app-sub-tabs :deep(.el-tabs__nav-wrap) { overflow: visible !important; }
.app-sub-tabs :deep(.el-tabs__nav-scroll) { overflow: visible !important; }
.app-sub-tabs :deep(.el-tabs__nav) { flex-wrap: wrap !important; display: flex !important; white-space: normal !important; }
.app-sub-tabs :deep(.el-tabs__nav-next), .app-sub-tabs :deep(.el-tabs__nav-prev) { display: none !important; }
.app-sub-tabs :deep(.el-tabs__content) { display: none; }
.app-detail-kpi { margin-bottom: 14px; padding: 12px 14px; background: var(--el-fill-color-lighter); border-radius: 8px; border: 1px solid var(--el-border-color-light); }
.mini-kpi { text-align: center; padding: 6px 0; }
.mini-val { font-size: 18px; font-weight: 700; color: var(--el-color-primary); line-height: 1.3; }
.mini-label { font-size: 11px; color: var(--el-text-color-secondary); margin-top: 2px; }
.app-detail-hosts { margin-top: 8px; padding-top: 8px; border-top: 1px dashed var(--el-border-color-lighter); }
.clickable-row { cursor: pointer; }
.clickable-row:hover td { background: var(--el-fill-color-light) !important; }
.expand-panel { padding: 12px 16px; background: var(--el-fill-color-lighter); border-radius: 6px; margin: 4px 0; }
.ep-section { margin-bottom: 8px; }
.ep-title { font-weight: 600; font-size: 12px; color: var(--el-color-primary); margin-bottom: 6px; border-left: 3px solid var(--el-color-primary); padding-left: 6px; }
.ep-item { display: flex; align-items: center; gap: 6px; font-size: 12px; margin-bottom: 4px; }
.ep-label { color: var(--el-text-color-secondary); min-width: 52px; flex-shrink: 0; }
.ep-behavior { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; padding-top: 8px; border-top: 1px dashed var(--el-border-color-lighter); }
.break { word-break: break-all; }
</style>
