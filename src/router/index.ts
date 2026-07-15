﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿import { createRouter, createWebHashHistory } from 'vue-router'

// Routes are lazy-loaded so the initial bundle stays small.
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    // ── 1. 首页重定向到 NetVisor 流量总览 ───────────────────────────
    {
      path: '/',
      redirect: '/nv/traffic-overview',
    },

    // ── 2. 分层统计（原协议解析，现在是 tab 页） ───────────────────────
    {
      path: '/nv/pq-layer-stats',
      name: 'layer-stats',
      component: () => import('@/views/protocol/LayerStatsView.vue'),
      meta: { title: '分层统计' },
    },
    // 旧路由重定向到 tab 页
    { path: '/protocol/link', redirect: '/nv/pq-layer-stats?layer=link' },
    { path: '/protocol/network', redirect: '/nv/pq-layer-stats?layer=network' },
    { path: '/protocol/transport', redirect: '/nv/pq-layer-stats?layer=transport' },
    { path: '/protocol/application', redirect: '/nv/pq-layer-stats?layer=application' },

    // ── 3. 事务查看 → 已合并到应用分析，保留重定向 ──────────────────
    { path: '/tx/video', redirect: '/app/cat/streaming' },
    { path: '/tx/social', redirect: '/app/cat/social' },
    { path: '/tx/email', redirect: '/app/cat/email' },
    { path: '/tx/file', redirect: '/app/cat/file_transfer' },
    { path: '/tx/shopping', redirect: '/app/cat/web' },
    { path: '/tx/game', redirect: '/app/cat/game' },
    { path: '/tx/cloud', redirect: '/app/cat/cloud' },
    { path: '/tx/finance', redirect: '/app/cat/finance' },
    { path: '/tx/dns', redirect: '/nv/pq-layer-stats?layer=application' },
    { path: '/tx/http', redirect: '/nv/pq-layer-stats?layer=application' },
    { path: '/tx/https', redirect: '/nv/pq-layer-stats?layer=application' },
    { path: '/tx/ssh', redirect: '/nv/pq-layer-stats?layer=application' },
    { path: '/tx/mail', redirect: '/nv/pq-layer-stats?layer=application' },
    { path: '/tx/database', redirect: '/nv/pq-layer-stats?layer=application' },

    // ── 4. VPN 检测 ──────────────────────────────────────────────────
    {
      path: '/vpn',
      name: 'vpn',
      component: () => import('@/views/VpnView.vue'),
      meta: { title: 'VPN 检测' },
    },

    // ── 5. 会话分析 ──────────────────────────────────────────────────
    {
      path: '/traffic',
      name: 'traffic',
      component: () => import('@/views/SessionsView.vue'),
      meta: { title: '会话分析' },
    },
    {
      path: '/traffic/forensics',
      name: 'traffic-forensics',
      component: () => import('@/views/ForensicsView.vue'),
      meta: { title: '全流量分析' },
    },
    {
      path: '/traffic/flow-features',
      name: 'traffic-flow-features',
      component: () => import('@/views/FlowFeaturesView.vue'),
      meta: { title: '流特征 · lzprobe' },
    },
    {
      path: '/traffic/zeek',
      name: 'traffic-zeek',
      component: () => import('@/views/zeek/ZeekOverview.vue'),
      meta: { title: 'Zeek 协议分析' },
    },
    {
      path: '/traffic/zeek/conn',
      name: 'zeek-conn',
      component: () => import('@/views/zeek/ZeekConnView.vue'),
      meta: { title: 'Zeek — 连接日志' },
    },
    {
      path: '/traffic/zeek/dns',
      name: 'zeek-dns',
      component: () => import('@/views/zeek/ZeekDnsView.vue'),
      meta: { title: 'Zeek — DNS' },
    },
    {
      path: '/traffic/zeek/http',
      name: 'zeek-http',
      component: () => import('@/views/zeek/ZeekHttpView.vue'),
      meta: { title: 'Zeek — HTTP' },
    },
    {
      path: '/traffic/zeek/ssl',
      name: 'zeek-ssl',
      component: () => import('@/views/zeek/ZeekSslView.vue'),
      meta: { title: 'Zeek — TLS/SSL' },
    },
    {
      path: '/traffic/zeek/files',
      name: 'zeek-files',
      component: () => import('@/views/zeek/ZeekFilesView.vue'),
      meta: { title: 'Zeek — 文件传输' },
    },
    // Legacy paths merged into the tabbed forensics page.
    { path: '/traffic/hunt', redirect: '/traffic/forensics' },
    { path: '/traffic/storage', redirect: { path: '/traffic/forensics', query: { tab: 'storage' } } },

    // ── 5. 应用分析（合并原应用观测+事务查看）────────────────────────
    {
      path: '/app/cat/:catKey',
      name: 'app-cat',
      component: () => import('@/views/app/AppObserveView.vue'),
      meta: { title: '应用分析' },
    },
    { path: '/app/observe', redirect: '/app/cat/web' },
    { path: '/app/file-transfer', redirect: '/app/cat/file_transfer' },
    { path: '/app/video', redirect: '/app/cat/streaming' },
    { path: '/app/chat', redirect: '/app/cat/social' },

    // ── 6. 威胁告警 ──────────────────────────────────────────────────
    {
      path: '/alerts',
      name: 'alerts',
      component: () => import('@/views/AlertsView.vue'),
      meta: { title: '威胁告警' },
    },

    // ── 6b. 因果链分析 ──────────────────────────────────────────────
    {
      path: '/causal',
      name: 'causal-chain',
      component: () => import('@/views/CausalChainView.vue'),
      meta: { title: '因果链分析' },
    },

    // ── 7. 系统状态 ──────────────────────────────────────────────────
    {
      path: '/status',
      name: 'status',
      component: () => import('@/views/StatusView.vue'),
      meta: { title: '系统状态' },
    },

    // ── 8. 运维管理 ──────────────────────────────────────────────────
    {
      path: '/ops/uplink',
      name: 'ops-uplink',
      component: () => import('@/views/UplinkView.vue'),
      meta: { title: '运维管理 — Server 对接' },
    },
    {
      path: '/ops/database',
      name: 'ops-database',
      component: () => import('@/views/OpsDbHealthView.vue'),
      meta: { title: '运维管理 — 数据库健康' },
    },
    {
      path: '/ops/storage',
      name: 'ops-storage',
      component: () => import('@/views/OpsStorageHealthView.vue'),
      meta: { title: '运维管理 — 全流量存储' },
    },
    {
      path: '/ops/token-usage',
      name: 'ops-token-usage',
      component: () => import('@/views/OpsTokenUsageView.vue'),
      meta: { title: '运维管理 — Token 用量' },
    },

    // ── 9. AI 分析 ──────────────────────────────────────────────────
    {
      path: '/chat',
      name: 'chat',
      component: () => import('@/views/ChatView.vue'),
      meta: { title: 'AI 分析助手' },
    },

    // ── 10. 系统配置 ─────────────────────────────────────────────────
    {
      path: '/config',
      name: 'config',
      component: () => import('@/views/ConfigView.vue'),
      meta: { title: '系统配置' },
    },

    // ── 11. NetVisor 集成（原生 Vue 组件）─────────────────────────────
    // 系统概况
    { path: '/nv/traffic-overview', name: 'nv-traffic-overview', component: () => import('@/views/netvisor/TrafficOverviewView.vue'), meta: { title: 'NetVisor — 流量概况' } },
    { path: '/nv/protocol-group-status', name: 'nv-protocol-group-status', component: () => import('@/views/netvisor/ProtocolGroupStatusView.vue'), meta: { title: 'NetVisor — 系统协议组状态', standalone: true } },
    { path: '/nv/system-info', name: 'nv-system-info', component: () => import('@/views/netvisor/SystemInfoView.vue'), meta: { title: 'NetVisor — 系统信息' } },
    { path: '/nv/online-users', name: 'nv-online-users', component: () => import('@/views/netvisor/OnlineUsersView.vue'), meta: { title: 'NetVisor — 在线用户' } },
    { path: '/nv/top-apps', name: 'nv-top-apps', component: () => import('@/views/netvisor/TopAppsView.vue'), meta: { title: 'NetVisor — Top应用' } },
    { path: '/nv/top-connections', name: 'nv-top-connections', component: () => import('@/views/netvisor/TopConnectionsView.vue'), meta: { title: 'NetVisor — Top连接' } },
    { path: '/nv/domain-overview', name: 'nv-domain-overview', component: () => import('@/views/netvisor/DomainOverviewView.vue'), meta: { title: 'NetVisor — 域名概况' } },
    // 应用分析
    { path: '/nv/app-analysis', name: 'nv-app-analysis', component: () => import('@/views/netvisor/AppAnalysisView.vue'), meta: { title: 'NetVisor — 应用分析' } },
    // 安全态势
    { path: '/nv/threat-intel', name: 'nv-threat-intel', component: () => import('@/views/netvisor/ThreatIntelView.vue'), meta: { title: 'NetVisor — 威胁情报' } },
    { path: '/nv/certificate-analysis', name: 'nv-certificate-analysis', component: () => import('@/views/netvisor/CertificateAnalysisView.vue'), meta: { title: 'NetVisor — 证书分析' } },
    { path: '/nv/sensitive-apps', name: 'nv-sensitive-apps', component: () => import('@/views/netvisor/SensitiveAppsView.vue'), meta: { title: 'NetVisor — 敏感应用' } },
    { path: '/nv/cross-border-monitoring', name: 'nv-cross-border', component: () => import('@/views/netvisor/CrossBorderView.vue'), meta: { title: 'NetVisor — 跨境监测' } },
    { path: '/nv/passive-domain', name: 'nv-passive-domain', component: () => import('@/views/netvisor/PassiveDomainView.vue'), meta: { title: 'NetVisor — 被动域名' } },
    { path: '/nv/dns-tunnel', name: 'nv-dns-tunnel', component: () => import('@/views/netvisor/DnsTunnelView.vue'), meta: { title: 'NetVisor — DNS隧道' } },
    { path: '/nv/system-alerts', name: 'nv-system-alerts', component: () => import('@/views/netvisor/SystemAlertsView.vue'), meta: { title: 'NetVisor — 系统告警' } },
    { path: '/nv/anomaly-detection', name: 'nv-anomaly-detection', component: () => import('@/views/netvisor/AnomalyDetectionView.vue'), meta: { title: 'NetVisor — 异常检测' } },
    { path: '/nv/asset-monitor', name: 'nv-asset-monitor', component: () => import('@/views/netvisor/AssetMonitorView.vue'), meta: { title: 'NetVisor — 资产监测' } },
    // 行为审计
    { path: '/nv/http-audit', name: 'nv-http-audit', component: () => import('@/views/netvisor/HttpAuditView.vue'), meta: { title: 'NetVisor — HTTP审计' } },
    { path: '/nv/https-audit', name: 'nv-https-audit', component: () => import('@/views/netvisor/HttpsAuditView.vue'), meta: { title: 'NetVisor — HTTPS审计' } },
    { path: '/nv/dns-audit', name: 'nv-dns-audit', component: () => import('@/views/netvisor/DnsAuditView.vue'), meta: { title: 'NetVisor — DNS审计' } },
    { path: '/nv/mail-audit', name: 'nv-mail-audit', component: () => import('@/views/netvisor/MailAuditView.vue'), meta: { title: 'NetVisor — 邮件审计' } },
    { path: '/nv/ftp-audit', name: 'nv-ftp-audit', component: () => import('@/views/netvisor/FtpAuditView.vue'), meta: { title: 'NetVisor — FTP审计' } },
    { path: '/nv/telnet-audit', name: 'nv-telnet-audit', component: () => import('@/views/netvisor/TelnetAuditView.vue'), meta: { title: 'NetVisor — Telnet审计' } },
    { path: '/nv/user-auth', name: 'nv-user-auth', component: () => import('@/views/netvisor/UserAuthView.vue'), meta: { title: 'NetVisor — 用户认证' } },
    { path: '/nv/database-audit', name: 'nv-database-audit', component: () => import('@/views/netvisor/DatabaseAuditView.vue'), meta: { title: 'NetVisor — 数据库审计' } },
    { path: '/nv/other-audit', name: 'nv-other-audit', component: () => import('@/views/netvisor/OtherAuditView.vue'), meta: { title: 'NetVisor — 其他审计' } },
    // 协议质量
    { path: '/nv/pq-overview', name: 'nv-pq-overview', component: () => import('@/views/netvisor/PqOverviewView.vue'), meta: { title: 'NetVisor — 质量概况' } },
    { path: '/nv/pq-key-protocols', name: 'nv-pq-key-protocols', component: () => import('@/views/netvisor/PqKeyProtocolsView.vue'), meta: { title: 'NetVisor — 重点协议' } },
    { path: '/nv/pq-diagnosis', name: 'nv-pq-diagnosis', component: () => import('@/views/netvisor/PqDiagnosisView.vue'), meta: { title: 'NetVisor — 质量诊断' } },
    { path: '/nv/pq-session-latency', name: 'nv-pq-session-latency', component: () => import('@/views/netvisor/PqSessionLatencyView.vue'), meta: { title: 'NetVisor — 会话时延' } },
    { path: '/nv/pq-protocol-latency', name: 'nv-pq-protocol-latency', component: () => import('@/views/netvisor/PqProtocolLatencyView.vue'), meta: { title: 'NetVisor — 协议时延' } },
    { path: '/nv/pq-retransmission', name: 'nv-pq-retransmission', component: () => import('@/views/netvisor/PqRetransmissionView.vue'), meta: { title: 'NetVisor — 协议重传' } },
    { path: '/nv/pq-segment-latency', name: 'nv-pq-segment-latency', component: () => import('@/views/netvisor/PqSegmentLatencyView.vue'), meta: { title: 'NetVisor — 分段时延' } },
    { path: '/nv/pq-whitelist', name: 'nv-pq-whitelist', component: () => import('@/views/netvisor/PqWhitelistView.vue'), meta: { title: 'NetVisor — 质量白名单' } },
    // 流量分析
    { path: '/nv/ta-session-traffic', name: 'nv-ta-session-traffic', component: () => import('@/views/netvisor/TaSessionTrafficView.vue'), meta: { title: 'NetVisor — 会话流量' } },
    { path: '/nv/ta-session-diagnosis', name: 'nv-ta-session-diagnosis', component: () => import('@/views/netvisor/TaSessionDiagnosisView.vue'), meta: { title: 'NetVisor — 会话诊断' } },
    { path: '/nv/ta-traffic-diagnosis', name: 'nv-ta-traffic-diagnosis', component: () => import('@/views/netvisor/TaTrafficDiagnosisView.vue'), meta: { title: 'NetVisor — 流量诊断' } },
    { path: '/nv/ta-mac-analysis', name: 'nv-ta-mac-analysis', component: () => import('@/views/netvisor/TaMacAnalysisView.vue'), meta: { title: 'NetVisor — MAC分析' } },
    { path: '/nv/ta-packet-search', name: 'nv-ta-packet-search', component: () => import('@/views/netvisor/TaPacketSearchView.vue'), meta: { title: 'NetVisor — 报文搜索' } },
    { path: '/nv/ta-ip-profile', name: 'nv-ta-ip-profile', component: () => import('@/views/netvisor/TaIpProfileView.vue'), meta: { title: 'NetVisor — IP画像' } },
    { path: '/nv/ta-domain-profile', name: 'nv-ta-domain-profile', component: () => import('@/views/netvisor/TaDomainProfileView.vue'), meta: { title: 'NetVisor — 域名画像' } },
    { path: '/nv/ta-offline-analysis', name: 'nv-ta-offline-analysis', component: () => import('@/views/netvisor/TaOfflineAnalysisView.vue'), meta: { title: 'NetVisor — 离线分析' } },
    { path: '/nv/ta-packet-playback', name: 'nv-ta-packet-playback', component: () => import('@/views/netvisor/TaPacketPlaybackView.vue'), meta: { title: 'NetVisor — 报文播放' } },
    { path: '/nv/ta-retention-policy', name: 'nv-ta-retention-policy', component: () => import('@/views/netvisor/TaRetentionPolicyView.vue'), meta: { title: 'NetVisor — 数据留存策略' } },
    { path: '/nv/ta-sessionless-protocol', name: 'nv-ta-sessionless', component: () => import('@/views/netvisor/TaSessionlessProtocolView.vue'), meta: { title: 'NetVisor — 无会话协议' } },
    { path: '/nv/ta-nic-capture', name: 'nv-ta-nic-capture', component: () => import('@/views/netvisor/TaNicCaptureView.vue'), meta: { title: 'NetVisor — 网卡抓包' } },
    { path: '/nv/ta-file-restore', name: 'nv-ta-file-restore', component: () => import('@/views/netvisor/TaFileRestoreView.vue'), meta: { title: 'NetVisor — 文件还原' } },
    // 定向分析
    { path: '/nv/da-virtual-link', name: 'nv-da-virtual-link', component: () => import('@/views/netvisor/DaVirtualLinkView.vue'), meta: { title: 'NetVisor — 虚拟链路' } },
    { path: '/nv/da-traffic-stats', name: 'nv-da-traffic-stats', component: () => import('@/views/netvisor/DaTrafficStatsView.vue'), meta: { title: 'NetVisor — 流量统计' } },
    { path: '/nv/da-stats-policy', name: 'nv-da-stats-policy', component: () => import('@/views/netvisor/DaStatsPolicyView.vue'), meta: { title: 'NetVisor — 统计策略' } },
    // 对象管理
    { path: '/nv/om-metadata', name: 'nv-om-metadata', component: () => import('@/views/netvisor/OmMetadataView.vue'), meta: { title: 'NetVisor — 元数据' } },
    { path: '/nv/om-telemetry-line', name: 'nv-om-telemetry-line', component: () => import('@/views/netvisor/OmTelemetryLineView.vue'), meta: { title: 'NetVisor — 遥测线路' } },
    { path: '/nv/om-telemetry-service', name: 'nv-om-telemetry-service', component: () => import('@/views/netvisor/OmTelemetryServiceView.vue'), meta: { title: 'NetVisor — 遥测服务' } },
    { path: '/nv/om-account', name: 'nv-om-account', component: () => import('@/views/netvisor/OmAccountView.vue'), meta: { title: 'NetVisor — 账号管理' } },
    { path: '/nv/om-radius', name: 'nv-om-radius', component: () => import('@/views/netvisor/OmRadiusView.vue'), meta: { title: 'NetVisor — RADIUS' } },
    { path: '/nv/om-file-type', name: 'nv-om-file-type', component: () => import('@/views/netvisor/OmFileTypeView.vue'), meta: { title: 'NetVisor — 文件类型' } },
    { path: '/nv/om-domain-group', name: 'nv-om-domain-group', component: () => import('@/views/netvisor/OmDomainGroupView.vue'), meta: { title: 'NetVisor — 域名群组' } },
    { path: '/nv/om-ip-group', name: 'nv-om-ip-group', component: () => import('@/views/netvisor/OmIpGroupView.vue'), meta: { title: 'NetVisor — IP群组' } },
    { path: '/nv/om-whitelist-ip', name: 'nv-om-whitelist-ip', component: () => import('@/views/netvisor/OmWhitelistIpView.vue'), meta: { title: 'NetVisor — 白名单IP' } },
    { path: '/nv/om-keyword-group', name: 'nv-om-keyword-group', component: () => import('@/views/netvisor/OmKeywordGroupView.vue'), meta: { title: 'NetVisor — 关键字群组' } },
    { path: '/nv/om-ip-mac-remark', name: 'nv-om-ip-mac-remark', component: () => import('@/views/netvisor/OmIpMacRemarkView.vue'), meta: { title: 'NetVisor — IP/MAC备注' } },
    { path: '/nv/om-log-mgmt', name: 'nv-om-log-mgmt', component: () => import('@/views/netvisor/OmLogMgmtView.vue'), meta: { title: 'NetVisor — 日志管理' } },
    { path: '/nv/om-ip-geo', name: 'nv-om-ip-geo', component: () => import('@/views/netvisor/OmIpGeoView.vue'), meta: { title: 'NetVisor — IP地理位置' } },
    // 应用识别
    { path: '/nv/ar-engine-params', name: 'nv-ar-engine-params', component: () => import('@/views/netvisor/ArEngineParamsView.vue'), meta: { title: 'NetVisor — 引擎参数' } },
    { path: '/nv/ar-app-protocol', name: 'nv-ar-app-protocol', component: () => import('@/views/netvisor/ArAppProtocolView.vue'), meta: { title: 'NetVisor — 应用协议' } },
    { path: '/nv/ar-protocol-level', name: 'nv-ar-protocol-level', component: () => import('@/views/netvisor/ArProtocolLevelView.vue'), meta: { title: 'NetVisor — 协议等级' } },
    { path: '/nv/ar-node-mgmt', name: 'nv-ar-node-mgmt', component: () => import('@/views/netvisor/ArNodeMgmtView.vue'), meta: { title: 'NetVisor — 节点管理' } },
    { path: '/nv/ar-domain-assoc', name: 'nv-ar-domain-assoc', component: () => import('@/views/netvisor/ArDomainAssocView.vue'), meta: { title: 'NetVisor — 域名关联' } },
    { path: '/nv/ar-custom-protocol', name: 'nv-ar-custom-protocol', component: () => import('@/views/netvisor/ArCustomProtocolView.vue'), meta: { title: 'NetVisor — 自定义协议' } },
    { path: '/nv/ar-custom-protocol-group', name: 'nv-ar-custom-protocol-group', component: () => import('@/views/netvisor/ArCustomProtocolGroupView.vue'), meta: { title: 'NetVisor — 自定义协议组' } },
    { path: '/nv/ar-protocol-search', name: 'nv-ar-protocol-search', component: () => import('@/views/netvisor/ArProtocolSearchView.vue'), meta: { title: 'NetVisor — 协议搜索定位' } },
    // 系统维护
    { path: '/nv/sm-storage-overview', name: 'nv-sm-storage', component: () => import('@/views/netvisor/SmStorageOverviewView.vue'), meta: { title: 'NetVisor — 存储概况' } },
    { path: '/nv/sm-network-interface', name: 'nv-sm-network', component: () => import('@/views/netvisor/SmNetworkInterfaceView.vue'), meta: { title: 'NetVisor — 网络接口' } },
    { path: '/nv/sm-system-settings', name: 'nv-sm-settings', component: () => import('@/views/netvisor/SmSystemSettingsView.vue'), meta: { title: 'NetVisor — 系统设置' } },
    { path: '/nv/sm-snmp', name: 'nv-sm-snmp', component: () => import('@/views/netvisor/SmSnmpView.vue'), meta: { title: 'NetVisor — SNMP服务' } },
    { path: '/nv/sm-system-users', name: 'nv-sm-system-users', component: () => import('@/views/netvisor/SmSystemUsersView.vue'), meta: { title: 'NetVisor — 系统用户' } },
    { path: '/nv/sm-system-check', name: 'nv-sm-system-check', component: () => import('@/views/netvisor/SmSystemCheckView.vue'), meta: { title: 'NetVisor — 系统检测' } },
    { path: '/nv/sm-config-mgmt', name: 'nv-sm-config-mgmt', component: () => import('@/views/netvisor/SmConfigMgmtView.vue'), meta: { title: 'NetVisor — 配置管理' } },
    { path: '/nv/sm-system-log', name: 'nv-sm-system-log', component: () => import('@/views/netvisor/SmSystemLogView.vue'), meta: { title: 'NetVisor — 系统日志' } },
    { path: '/nv/sm-system-upgrade', name: 'nv-sm-system-upgrade', component: () => import('@/views/netvisor/SmSystemUpgradeView.vue'), meta: { title: 'NetVisor — 系统升级' } },
    { path: '/nv/sm-task-mgmt', name: 'nv-sm-task-mgmt', component: () => import('@/views/netvisor/SmTaskMgmtView.vue'), meta: { title: 'NetVisor — 任务管理' } },
    { path: '/nv/sm-log-settings', name: 'nv-sm-log-settings', component: () => import('@/views/netvisor/SmLogSettingsView.vue'), meta: { title: 'NetVisor — 日志设置' } },

    // ── 12. NetVisor-test (完整 NetVisor 菜单迁移) ─────────────────────
    // 系统概况（已有组件）
    { path: '/trans/traffic-overview', name: 'trans-traffic-overview', component: () => import('@/views/netvisor-test/TrafficOverviewTest.vue'), meta: { title: 'transSys — 流量概况' } },
    { path: '/trans/system-info', name: 'trans-system-info', component: () => import('@/views/netvisor-test/SystemInfoTest.vue'), meta: { title: 'transSys — 系统信息' } },
    { path: '/trans/online-users', name: 'trans-online-users', component: () => import('@/views/netvisor-test/OnlineUsersTest.vue'), meta: { title: 'transSys — 在线用户' } },
    { path: '/trans/top-apps', name: 'trans-top-apps', component: () => import('@/views/netvisor-test/TopAppsTest.vue'), meta: { title: 'transSys — Top应用' } },
    { path: '/trans/top-connections', name: 'trans-top-connections', component: () => import('@/views/netvisor-test/TopConnectionsTest.vue'), meta: { title: 'transSys — Top连接' } },
    { path: '/trans/domain-overview', name: 'trans-domain-overview', component: () => import('@/views/netvisor-test/DomainOverviewTest.vue'), meta: { title: 'transSys — 域名概况' } },
    // 应用分析
    { path: '/trans/app-analysis', name: 'trans-app-analysis', component: () => import('@/views/netvisor-test/AppAnalysisView.vue'), meta: { title: 'transSys — 应用分析' } },
    // 安全态势
    { path: '/trans/threat-intel', name: 'trans-threat-intel', component: () => import('@/views/netvisor-test/ThreatIntelView.vue'), meta: { title: 'transSys — 威胁情报' } },
    { path: '/trans/certificate-analysis', name: 'trans-certificate-analysis', component: () => import('@/views/netvisor-test/CertificateAnalysisView.vue'), meta: { title: 'transSys — 证书分析' } },
    { path: '/trans/sensitive-apps', name: 'trans-sensitive-apps', component: () => import('@/views/netvisor-test/SensitiveAppsView.vue'), meta: { title: 'transSys — 敏感应用' } },
    { path: '/trans/cross-border-monitoring', name: 'trans-cross-border-monitoring', component: () => import('@/views/netvisor-test/CrossBorderView.vue'), meta: { title: 'transSys — 跨境监测' } },
    { path: '/trans/passive-domain', name: 'trans-passive-domain', component: () => import('@/views/netvisor-test/PassiveDomainView.vue'), meta: { title: 'transSys — 被动域名' } },
    { path: '/trans/dns-tunnel', name: 'trans-dns-tunnel', component: () => import('@/views/netvisor-test/DnsTunnelView.vue'), meta: { title: 'transSys — DNS隧道' } },
    { path: '/trans/system-alerts', name: 'trans-system-alerts', component: () => import('@/views/netvisor-test/SystemAlertsView.vue'), meta: { title: 'transSys — 系统告警' } },
    { path: '/trans/anomaly-detection', name: 'trans-anomaly-detection', component: () => import('@/views/netvisor-test/AnomalyDetectionView.vue'), meta: { title: 'transSys — 异常检测' } },
    // 行为审计
    { path: '/trans/http-audit', name: 'trans-http-audit', component: () => import('@/views/netvisor-test/HttpAuditView.vue'), meta: { title: 'transSys — HTTP审计' } },
    { path: '/trans/https-audit', name: 'trans-https-audit', component: () => import('@/views/netvisor-test/HttpsAuditView.vue'), meta: { title: 'transSys — HTTPS审计' } },
    { path: '/trans/dns-audit', name: 'trans-dns-audit', component: () => import('@/views/netvisor-test/DnsAuditView.vue'), meta: { title: 'transSys — DNS审计' } },
    { path: '/trans/mail-audit', name: 'trans-mail-audit', component: () => import('@/views/netvisor-test/MailAuditView.vue'), meta: { title: 'transSys — 邮件审计' } },
    { path: '/trans/ftp-audit', name: 'trans-ftp-audit', component: () => import('@/views/netvisor-test/FtpAuditView.vue'), meta: { title: 'transSys — FTP审计' } },
    { path: '/trans/telnet-audit', name: 'trans-telnet-audit', component: () => import('@/views/netvisor-test/TelnetAuditView.vue'), meta: { title: 'transSys — Telnet审计' } },
    { path: '/trans/user-auth', name: 'trans-user-auth', component: () => import('@/views/netvisor-test/UserAuthView.vue'), meta: { title: 'transSys — 用户认证' } },
    { path: '/trans/database-audit', name: 'trans-database-audit', component: () => import('@/views/netvisor-test/DatabaseAuditView.vue'), meta: { title: 'transSys — 数据库审计' } },
    { path: '/trans/other-audit', name: 'trans-other-audit', component: () => import('@/views/netvisor-test/OtherAuditView.vue'), meta: { title: 'transSys — 其他审计' } },
    // 协议质量
    { path: '/trans/pq-overview', name: 'trans-pq-overview', component: () => import('@/views/netvisor-test/PqOverviewView.vue'), meta: { title: 'transSys — 质量概况' } },
    { path: '/trans/pq-key-protocols', name: 'trans-pq-key-protocols', component: () => import('@/views/netvisor-test/PqKeyProtocolsView.vue'), meta: { title: 'transSys — 重点协议' } },
    { path: '/trans/pq-diagnosis', name: 'trans-pq-diagnosis', component: () => import('@/views/netvisor-test/PqDiagnosisView.vue'), meta: { title: 'transSys — 质量诊断' } },
    { path: '/trans/pq-session-latency', name: 'trans-pq-session-latency', component: () => import('@/views/netvisor-test/PqSessionLatencyView.vue'), meta: { title: 'transSys — 会话时延' } },
    { path: '/trans/pq-protocol-latency', name: 'trans-pq-protocol-latency', component: () => import('@/views/netvisor-test/PqProtocolLatencyView.vue'), meta: { title: 'transSys — 协议时延' } },
    { path: '/trans/pq-retransmission', name: 'trans-pq-retransmission', component: () => import('@/views/netvisor-test/PqRetransmissionView.vue'), meta: { title: 'transSys — 协议重传' } },
    { path: '/trans/pq-segment-latency', name: 'trans-pq-segment-latency', component: () => import('@/views/netvisor-test/PqSegmentLatencyView.vue'), meta: { title: 'transSys — 分段时延' } },
    { path: '/trans/pq-whitelist', name: 'trans-pq-whitelist', component: () => import('@/views/netvisor-test/PqWhitelistView.vue'), meta: { title: 'transSys — 质量白名单' } },
    // 溯源分析
    { path: '/trans/ta-session-traffic', name: 'trans-ta-session-traffic', component: () => import('@/views/netvisor-test/TaSessionTrafficView.vue'), meta: { title: 'transSys — 会话流量' } },
    { path: '/trans/ta-session-diagnosis', name: 'trans-ta-session-diagnosis', component: () => import('@/views/netvisor-test/TaSessionDiagnosisView.vue'), meta: { title: 'transSys — 会话诊断' } },
    { path: '/trans/ta-traffic-diagnosis', name: 'trans-ta-traffic-diagnosis', component: () => import('@/views/netvisor-test/TaTrafficDiagnosisView.vue'), meta: { title: 'transSys — 流量诊断' } },
    { path: '/trans/ta-mac-analysis', name: 'trans-ta-mac-analysis', component: () => import('@/views/netvisor-test/TaMacAnalysisView.vue'), meta: { title: 'transSys — MAC分析' } },
    { path: '/trans/ta-packet-search', name: 'trans-ta-packet-search', component: () => import('@/views/netvisor-test/TaPacketSearchView.vue'), meta: { title: 'transSys — 报文搜索' } },
    { path: '/trans/ta-ip-profile', name: 'trans-ta-ip-profile', component: () => import('@/views/netvisor-test/TaIpProfileView.vue'), meta: { title: 'transSys — IP画像' } },
    { path: '/trans/ta-domain-profile', name: 'trans-ta-domain-profile', component: () => import('@/views/netvisor-test/TaDomainProfileView.vue'), meta: { title: 'transSys — 域名画像' } },
    { path: '/trans/ta-offline-analysis', name: 'trans-ta-offline-analysis', component: () => import('@/views/netvisor-test/TaOfflineAnalysisView.vue'), meta: { title: 'transSys — 离线分析' } },
    { path: '/trans/ta-packet-playback', name: 'trans-ta-packet-playback', component: () => import('@/views/netvisor-test/TaPacketPlaybackView.vue'), meta: { title: 'transSys — 报文播放' } },
    { path: '/trans/ta-retention-policy', name: 'trans-ta-retention-policy', component: () => import('@/views/netvisor-test/TaRetentionPolicyView.vue'), meta: { title: 'transSys — 数据留存策略' } },
    { path: '/trans/ta-sessionless-protocol', name: 'trans-ta-sessionless-protocol', component: () => import('@/views/netvisor-test/TaSessionlessProtocolView.vue'), meta: { title: 'transSys — 无会话协议' } },
    { path: '/trans/ta-nic-capture', name: 'trans-ta-nic-capture', component: () => import('@/views/netvisor-test/TaNicCaptureView.vue'), meta: { title: 'transSys — 网卡抓包' } },
    { path: '/trans/ta-file-restore', name: 'trans-ta-file-restore', component: () => import('@/views/netvisor-test/TaFileRestoreView.vue'), meta: { title: 'transSys — 文件还原' } },
    // 定向分析
    { path: '/trans/da-virtual-link', name: 'trans-da-virtual-link', component: () => import('@/views/netvisor-test/DaVirtualLinkView.vue'), meta: { title: 'transSys — 虚拟链路' } },
    { path: '/trans/da-traffic-stats', name: 'trans-da-traffic-stats', component: () => import('@/views/netvisor-test/DaTrafficStatsView.vue'), meta: { title: 'transSys — 流量统计' } },
    { path: '/trans/da-stats-policy', name: 'trans-da-stats-policy', component: () => import('@/views/netvisor-test/DaStatsPolicyView.vue'), meta: { title: 'transSys — 统计策略' } },
    // 对象管理
    { path: '/trans/om-metadata', name: 'trans-om-metadata', component: () => import('@/views/netvisor-test/OmMetadataView.vue'), meta: { title: 'transSys — 元数据' } },
    { path: '/trans/om-telemetry-line', name: 'trans-om-telemetry-line', component: () => import('@/views/netvisor-test/OmTelemetryLineView.vue'), meta: { title: 'transSys — 遥测线路' } },
    { path: '/trans/om-telemetry-service', name: 'trans-om-telemetry-service', component: () => import('@/views/netvisor-test/OmTelemetryServiceView.vue'), meta: { title: 'transSys — 遥测服务' } },
    { path: '/trans/om-account', name: 'trans-om-account', component: () => import('@/views/netvisor-test/OmAccountView.vue'), meta: { title: 'transSys — 账号管理' } },
    { path: '/trans/om-radius', name: 'trans-om-radius', component: () => import('@/views/netvisor-test/OmRadiusView.vue'), meta: { title: 'transSys — RADIUS' } },
    { path: '/trans/om-file-type', name: 'trans-om-file-type', component: () => import('@/views/netvisor-test/OmFileTypeView.vue'), meta: { title: 'transSys — 文件类型' } },
    { path: '/trans/om-domain-group', name: 'trans-om-domain-group', component: () => import('@/views/netvisor-test/OmDomainGroupView.vue'), meta: { title: 'transSys — 域名群组' } },
    { path: '/trans/om-ip-group', name: 'trans-om-ip-group', component: () => import('@/views/netvisor-test/OmIpGroupView.vue'), meta: { title: 'transSys — IP群组' } },
    { path: '/trans/om-whitelist-ip', name: 'trans-om-whitelist-ip', component: () => import('@/views/netvisor-test/OmWhitelistIpView.vue'), meta: { title: 'transSys — 白名单IP' } },
    { path: '/trans/om-keyword-group', name: 'trans-om-keyword-group', component: () => import('@/views/netvisor-test/OmKeywordGroupView.vue'), meta: { title: 'transSys — 关键字群组' } },
    { path: '/trans/om-ip-mac-remark', name: 'trans-om-ip-mac-remark', component: () => import('@/views/netvisor-test/OmIpMacRemarkView.vue'), meta: { title: 'transSys — IP/MAC备注' } },
    { path: '/trans/om-log-mgmt', name: 'trans-om-log-mgmt', component: () => import('@/views/netvisor-test/OmLogMgmtView.vue'), meta: { title: 'transSys — 日志管理' } },
    { path: '/trans/om-ip-geo', name: 'trans-om-ip-geo', component: () => import('@/views/netvisor-test/OmIpGeoView.vue'), meta: { title: 'transSys — IP地理位置' } },
    // 在线用户
    { path: '/trans/online-users-new', name: 'trans-online-users-new', component: () => import('@/views/netvisor-test/OnlineUsersView.vue'), meta: { title: 'transSys — 在线用户' } },
    // 应用识别
    { path: '/trans/ar-engine-params', name: 'trans-ar-engine-params', component: () => import('@/views/netvisor-test/ArEngineParamsView.vue'), meta: { title: 'transSys — 引擎参数' } },
    { path: '/trans/ar-app-protocol', name: 'trans-ar-app-protocol', component: () => import('@/views/netvisor-test/ArAppProtocolView.vue'), meta: { title: 'transSys — 应用协议' } },
    { path: '/trans/ar-protocol-level', name: 'trans-ar-protocol-level', component: () => import('@/views/netvisor-test/ArProtocolLevelView.vue'), meta: { title: 'transSys — 协议等级' } },
    { path: '/trans/ar-node-mgmt', name: 'trans-ar-node-mgmt', component: () => import('@/views/netvisor-test/ArNodeMgmtView.vue'), meta: { title: 'transSys — 节点管理' } },
    { path: '/trans/ar-domain-assoc', name: 'trans-ar-domain-assoc', component: () => import('@/views/netvisor-test/ArDomainAssocView.vue'), meta: { title: 'transSys — 域名关联' } },
    { path: '/trans/ar-custom-protocol', name: 'trans-ar-custom-protocol', component: () => import('@/views/netvisor-test/ArCustomProtocolView.vue'), meta: { title: 'transSys — 自定义协议' } },
    { path: '/trans/ar-custom-protocol-group', name: 'trans-ar-custom-protocol-group', component: () => import('@/views/netvisor-test/ArCustomProtocolGroupView.vue'), meta: { title: 'transSys — 自定义协议组' } },
    { path: '/trans/ar-protocol-search', name: 'trans-ar-protocol-search', component: () => import('@/views/netvisor-test/ArProtocolSearchView.vue'), meta: { title: 'transSys — 协议搜索定位' } },
    // 系统维护
    { path: '/trans/sm-storage-overview', name: 'trans-sm-storage-overview', component: () => import('@/views/netvisor-test/SmStorageOverviewView.vue'), meta: { title: 'transSys — 存储概况' } },
    { path: '/trans/sm-network-interface', name: 'trans-sm-network-interface', component: () => import('@/views/netvisor-test/SmNetworkInterfaceView.vue'), meta: { title: 'transSys — 网络接口' } },
    { path: '/trans/sm-system-settings', name: 'trans-sm-system-settings', component: () => import('@/views/netvisor-test/SmSystemSettingsView.vue'), meta: { title: 'transSys — 系统设置' } },
    { path: '/trans/sm-snmp', name: 'trans-sm-snmp', component: () => import('@/views/netvisor-test/SmSnmpView.vue'), meta: { title: 'transSys — SNMP服务' } },
    { path: '/trans/sm-system-users', name: 'trans-sm-system-users', component: () => import('@/views/netvisor-test/SmSystemUsersView.vue'), meta: { title: 'transSys — 系统用户' } },
    { path: '/trans/sm-system-check', name: 'trans-sm-system-check', component: () => import('@/views/netvisor-test/SmSystemCheckView.vue'), meta: { title: 'transSys — 系统检测' } },
    { path: '/trans/sm-config-mgmt', name: 'trans-sm-config-mgmt', component: () => import('@/views/netvisor-test/SmConfigMgmtView.vue'), meta: { title: 'transSys — 配置管理' } },
    { path: '/trans/sm-system-log', name: 'trans-sm-system-log', component: () => import('@/views/netvisor-test/SmSystemLogView.vue'), meta: { title: 'transSys — 系统日志' } },
    { path: '/trans/sm-system-upgrade', name: 'trans-sm-system-upgrade', component: () => import('@/views/netvisor-test/SmSystemUpgradeView.vue'), meta: { title: 'transSys — 系统升级' } },
    { path: '/trans/sm-task-mgmt', name: 'trans-sm-task-mgmt', component: () => import('@/views/netvisor-test/SmTaskMgmtView.vue'), meta: { title: 'transSys — 任务管理' } },
    { path: '/trans/sm-log-settings', name: 'trans-sm-log-settings', component: () => import('@/views/netvisor-test/SmLogSettingsView.vue'), meta: { title: 'transSys — 日志设置' } },

    // ── legacy redirects ─────────────────────────────────────────────
    { path: '/sessions', redirect: '/traffic' },
    { path: '/transactions', redirect: '/tx/video' },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

export default router