<template>
  <el-container class="layout-root" direction="vertical">
    <!-- ── Top Header (blue gradient) ─────────────────────────────────── -->
    <header class="app-header">
      <div class="header-brand">
        <img src="/favicon.svg" alt="" class="header-brand-icon" />
        <span class="header-brand-name">NetSentry 流量分析系统</span>
      </div>
      <div class="header-right">
        <span class="header-datetime">日期：{{ currentDate }}</span>
        <span class="header-datetime">时间：{{ currentTime }}</span>
      </div>
    </header>

    <!-- ── Body: Sidebar + Content ────────────────────────────────────── -->
    <el-container class="layout-body">
      <el-aside width="220px" class="sidebar">
        <el-menu
          :default-active="activeRoute"
          :default-openeds="openedMenus"
          router
          background-color="transparent"
          text-color="var(--sg-sidebar-fg)"
          active-text-color="#ffffff"
          class="nav-menu"
        >
        <!-- 1. AI Bit -->
        <el-menu-item index="/chat">
          <el-icon><ChatDotRound /></el-icon>
          <span>AI Bit</span>
        </el-menu-item>

        <!-- 2. 流量概况 -->
        <el-sub-menu index="nv-overview">
          <template #title>
            <el-icon><DataLine /></el-icon>
            <span>流量概况</span>
          </template>
          <el-menu-item index="/nv/traffic-overview">流量总览</el-menu-item>
          <el-menu-item index="/nv/system-info">系统信息</el-menu-item>
          <el-menu-item index="/nv/online-users">在线用户</el-menu-item>
          <el-menu-item index="/nv/top-apps">Top应用</el-menu-item>
          <el-menu-item index="/nv/top-connections">Top连接</el-menu-item>
          <el-menu-item index="/nv/domain-overview">域名概况</el-menu-item>
        </el-sub-menu>

        <!-- 4. 应用分析（NetVisor） -->
        <el-menu-item index="/nv/app-analysis">
          <el-icon><Monitor /></el-icon>
          <span>应用分析</span>
        </el-menu-item>

        <!-- 4. 安全态势 -->
        <el-sub-menu index="nv-security">
          <template #title>
            <el-icon><Lock /></el-icon>
            <span>安全态势</span>
          </template>
          <el-menu-item index="/nv/threat-intel">威胁情报</el-menu-item>
          <el-menu-item index="/nv/certificate-analysis">证书分析</el-menu-item>
          <el-menu-item index="/nv/sensitive-apps">敏感应用</el-menu-item>
          <el-menu-item index="/nv/cross-border-monitoring">跨境监测</el-menu-item>
          <el-menu-item index="/nv/passive-domain">被动域名</el-menu-item>
          <!-- <el-menu-item index="/nv/dns-tunnel">DNS隧道</el-menu-item> -->
          <!-- <el-menu-item index="/vpn">VPN检测</el-menu-item> -->
          <!-- <el-menu-item index="/alerts">安全告警</el-menu-item> -->
          <!-- <el-menu-item index="/nv/system-alerts">系统告警</el-menu-item> -->
          <!-- <el-menu-item index="/nv/anomaly-detection">异常检测</el-menu-item> -->
          <el-menu-item index="/nv/asset-monitor">资产监测</el-menu-item>
        </el-sub-menu>

        <!-- 5. 行为审计 -->
        <el-sub-menu index="nv-audit">
          <template #title>
            <el-icon><Notebook /></el-icon>
            <span>行为审计</span>
          </template>
          <el-menu-item index="/nv/http-audit">HTTP审计</el-menu-item>
          <el-menu-item index="/nv/https-audit">HTTPS审计</el-menu-item>
          <el-menu-item index="/nv/dns-audit">DNS审计</el-menu-item>
          <el-menu-item index="/nv/mail-audit">邮件审计</el-menu-item>
          <el-menu-item index="/nv/ftp-audit">FTP审计</el-menu-item>
          <el-menu-item index="/nv/telnet-audit">Telnet审计</el-menu-item>
          <el-menu-item index="/nv/user-auth">用户认证</el-menu-item>
          <el-menu-item index="/nv/database-audit">数据库审计</el-menu-item>
          <el-menu-item index="/nv/other-audit">其他审计</el-menu-item>
        </el-sub-menu>

        <!-- 6. 协议质量 -->
        <el-sub-menu index="nv-quality">
          <template #title>
            <el-icon><TrendCharts /></el-icon>
            <span>协议质量</span>
          </template>
          <el-menu-item index="/nv/pq-overview">质量概况</el-menu-item>
          <el-menu-item index="/nv/pq-key-protocols">重点协议</el-menu-item>
          <el-menu-item index="/nv/pq-diagnosis">质量诊断</el-menu-item>
          <el-menu-item index="/nv/pq-session-latency">会话时延</el-menu-item>
          <el-menu-item index="/nv/pq-protocol-latency">协议时延</el-menu-item>
          <el-menu-item index="/nv/pq-retransmission">协议重传</el-menu-item>
          <el-menu-item index="/nv/pq-segment-latency">分段时延</el-menu-item>
          <el-menu-item index="/nv/pq-whitelist">质量白名单</el-menu-item>
          <el-menu-item index="/nv/pq-layer-stats">分层统计</el-menu-item>
        </el-sub-menu>

        <!-- 7. 溯源分析 -->
        <el-sub-menu index="nv-trace">
          <template #title>
            <el-icon><Search /></el-icon>
            <span>溯源分析</span>
          </template>
          <el-menu-item index="/nv/ta-session-traffic">会话流量</el-menu-item>
          <el-menu-item index="/nv/ta-session-diagnosis">会话诊断</el-menu-item>
          <el-menu-item index="/nv/ta-traffic-diagnosis">流量诊断</el-menu-item>
          <el-menu-item index="/nv/ta-mac-analysis">MAC分析</el-menu-item>
          <el-menu-item index="/nv/ta-packet-search">报文搜索</el-menu-item>
          <el-menu-item index="/nv/ta-ip-profile">IP画像</el-menu-item>
          <el-menu-item index="/nv/ta-domain-profile">域名画像</el-menu-item>
          <el-menu-item index="/nv/ta-offline-analysis">离线分析</el-menu-item>
          <el-menu-item index="/nv/ta-packet-playback">报文播放</el-menu-item>
          <el-menu-item index="/nv/ta-retention-policy">数据留存策略</el-menu-item>
          <el-menu-item index="/nv/ta-sessionless-protocol">无会话协议</el-menu-item>
          <el-menu-item index="/nv/ta-nic-capture">网卡抓包</el-menu-item>
          <el-menu-item index="/nv/ta-file-restore">文件还原</el-menu-item>
        </el-sub-menu>

        <!-- 8. 定向分析 -->
        <el-sub-menu index="nv-directed">
          <template #title>
            <el-icon><Aim /></el-icon>
            <span>定向分析</span>
          </template>
          <el-menu-item index="/nv/da-virtual-link">虚拟链路</el-menu-item>
          <el-menu-item index="/nv/da-traffic-stats">流量统计</el-menu-item>
          <el-menu-item index="/nv/da-stats-policy">统计策略</el-menu-item>
        </el-sub-menu>

        <!-- 9. 对象管理 -->
        <el-sub-menu index="nv-object">
          <template #title>
            <el-icon><Files /></el-icon>
            <span>对象管理</span>
          </template>
          <el-menu-item index="/nv/om-metadata">元数据</el-menu-item>
          <el-menu-item index="/nv/om-telemetry-line">遥测线路</el-menu-item>
          <el-menu-item index="/nv/om-telemetry-service">遥测服务</el-menu-item>
          <el-menu-item index="/nv/om-account">账号管理</el-menu-item>
          <el-menu-item index="/nv/om-radius">RADIUS</el-menu-item>
          <el-menu-item index="/nv/om-file-type">文件类型</el-menu-item>
          <el-menu-item index="/nv/om-domain-group">域名群组</el-menu-item>
          <el-menu-item index="/nv/om-ip-group">IP群组</el-menu-item>
          <el-menu-item index="/nv/om-whitelist-ip">白名单IP</el-menu-item>
          <el-menu-item index="/nv/om-keyword-group">关键字群组</el-menu-item>
          <el-menu-item index="/nv/om-ip-mac-remark">IP/MAC备注</el-menu-item>
          <el-menu-item index="/nv/om-log-mgmt">日志管理</el-menu-item>
          <el-menu-item index="/nv/om-ip-geo">IP地理位置</el-menu-item>
        </el-sub-menu>

        <!-- 10. 应用识别 -->
        <el-sub-menu index="nv-apprec">
          <template #title>
            <el-icon><Cpu /></el-icon>
            <span>应用识别</span>
          </template>
          <el-menu-item index="/nv/ar-engine-params">引擎参数</el-menu-item>
          <el-menu-item index="/nv/ar-app-protocol">应用协议</el-menu-item>
          <el-menu-item index="/nv/ar-protocol-level">协议等级</el-menu-item>
          <el-menu-item index="/nv/ar-node-mgmt">节点管理</el-menu-item>
          <el-menu-item index="/nv/ar-domain-assoc">域名关联</el-menu-item>
          <el-menu-item index="/nv/ar-custom-protocol">自定义协议</el-menu-item>
          <el-menu-item index="/nv/ar-custom-protocol-group">自定义协议组</el-menu-item>
          <el-menu-item index="/nv/ar-protocol-search">协议搜索定位</el-menu-item>
        </el-sub-menu>

        <!-- 12. 全流量分析 -->
        <el-menu-item index="/traffic/forensics">
          <el-icon><VideoCamera /></el-icon>
          <span>全流量分析</span>
        </el-menu-item>

        <!-- 15. 系统维护 -->
        <el-sub-menu index="nv-sysmaint">
          <template #title>
            <el-icon><SetUp /></el-icon>
            <span>系统维护</span>
          </template>
          <el-menu-item index="/nv/sm-storage-overview">存储概况</el-menu-item>
          <el-menu-item index="/nv/sm-network-interface">网络接口</el-menu-item>
          <el-menu-item index="/nv/sm-system-settings">系统设置</el-menu-item>
          <el-menu-item index="/nv/sm-snmp">SNMP服务</el-menu-item>
          <el-menu-item index="/nv/sm-system-users">系统用户</el-menu-item>
          <el-menu-item index="/nv/sm-system-check">系统检测</el-menu-item>
          <el-menu-item index="/nv/sm-config-mgmt">配置管理</el-menu-item>
          <el-menu-item index="/nv/sm-system-log">系统日志</el-menu-item>
          <el-menu-item index="/nv/sm-system-upgrade">系统升级</el-menu-item>
          <el-menu-item index="/nv/sm-task-mgmt">任务管理</el-menu-item>
          <el-menu-item index="/nv/sm-log-settings">日志设置</el-menu-item>
        </el-sub-menu>

        <!-- 16. 运维管理 -->
        <el-sub-menu index="ops">
          <template #title>
            <el-icon><FirstAidKit /></el-icon>
            <span>运维管理</span>
          </template>
          <el-menu-item index="/status">系统状态</el-menu-item>
          <el-menu-item index="/config">系统配置</el-menu-item>
          <el-menu-item index="/ops/uplink">Server 对接</el-menu-item>
          <el-menu-item index="/ops/database">数据库健康</el-menu-item>
          <el-menu-item index="/ops/storage">全流量存储</el-menu-item>
          <el-menu-item index="/ops/token-usage">Token 用量</el-menu-item>
        </el-sub-menu>

        <!-- 17. 技术文档 -->
        <el-menu-item @click="openDocs">
          <el-icon><Document /></el-icon>
          <span>技术文档</span>
        </el-menu-item>
        </el-menu>

        <div class="sidebar-foot">
          <ConnectionBadge />
        </div>
      </el-aside>

      <!-- ── Content area ──────────────────────────────────────────── -->
      <el-main class="main-content">
        <router-view v-slot="{ Component, route: r }">
          <transition name="fade" mode="out-in">
            <component :is="Component" :key="r.path" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Document, VideoCamera, SetUp, Files, Cpu } from '@element-plus/icons-vue'
import ConnectionBadge from '@/components/ConnectionBadge.vue'

const route = useRoute()

const activeRoute = computed(() => route.path)
const pageTitle = computed(() => (route.meta?.title as string) ?? '')

// Auto-expand the sub-menu that contains the current route.
const openedMenus = computed(() => {
  const p = route.path
  const opened: string[] = []
  if (p.startsWith('/protocol')) opened.push('nv-quality')
  if (p.startsWith('/app')) opened.push('app')
  if (p.startsWith('/tx')) opened.push('app')
  if (p.startsWith('/ops') || p === '/status' || p === '/config') opened.push('ops')
  // transSys groups (nested sub-menus)
  if (p.startsWith('/trans/')) {
    opened.push('trans-overview')
    if (p.startsWith('/trans/traffic-overview') || p.startsWith('/trans/system-info') || p.startsWith('/trans/online-users') || p.startsWith('/trans/top-') || p.startsWith('/trans/domain-overview')) opened.push('trans-overview-sys')
    if (p.startsWith('/trans/app-analysis')) opened.push('trans-overview-app')
    if (p.startsWith('/trans/threat') || p.startsWith('/trans/cert') || p.startsWith('/trans/sensitive') || p.startsWith('/trans/cross') || p.startsWith('/trans/passive') || p.startsWith('/trans/dns-tunnel') || p.startsWith('/trans/system-alert') || p.startsWith('/trans/anomaly')) opened.push('trans-overview-security')
    if (p.startsWith('/trans/http-') || p.startsWith('/trans/https-') || p.startsWith('/trans/dns-audit') || p.startsWith('/trans/mail-') || p.startsWith('/trans/ftp-') || p.startsWith('/trans/telnet-') || p.startsWith('/trans/user-auth') || p.startsWith('/trans/database-') || p.startsWith('/trans/other-')) opened.push('trans-overview-audit')
    if (p.startsWith('/trans/pq-')) opened.push('trans-overview-quality')
    if (p.startsWith('/trans/ta-')) opened.push('trans-overview-trace')
    if (p.startsWith('/trans/da-')) opened.push('trans-overview-directed')
    if (p.startsWith('/trans/om-')) opened.push('trans-overview-object')
    if (p.startsWith('/trans/online-users-new') || p.startsWith('/trans/traffic-stats')) opened.push('trans-overview-users')
    if (p.startsWith('/trans/ar-')) opened.push('trans-overview-apprec')
    if (p.startsWith('/trans/sm-')) opened.push('trans-overview-sysmaint')
  }
  // NetVisor groups
  if (p.startsWith('/nv/traffic-overview') || p.startsWith('/nv/system-info') || p.startsWith('/nv/online-users') || p.startsWith('/nv/top-') || p.startsWith('/nv/domain-overview')) opened.push('nv-overview')
  if (p.startsWith('/nv/threat') || p.startsWith('/nv/cert') || p.startsWith('/nv/sensitive') || p.startsWith('/nv/cross') || p.startsWith('/nv/passive') || p.startsWith('/nv/dns-tunnel') || p.startsWith('/vpn') || p.startsWith('/alerts') || p.startsWith('/nv/system-alert') || p.startsWith('/nv/anomaly') || p.startsWith('/nv/asset-monitor')) opened.push('nv-security')
  if (p.startsWith('/nv/http-') || p.startsWith('/nv/https-') || p.startsWith('/nv/dns-audit') || p.startsWith('/nv/mail-') || p.startsWith('/nv/ftp-') || p.startsWith('/nv/telnet-') || p.startsWith('/nv/user-auth') || p.startsWith('/nv/database-') || p.startsWith('/nv/other-')) opened.push('nv-audit')
  if (p.startsWith('/nv/pq-') || p.startsWith('/protocol')) opened.push('nv-quality')
  if (p.startsWith('/nv/ta-')) opened.push('nv-trace')
  if (p.startsWith('/nv/da-')) opened.push('nv-directed')
  if (p.startsWith('/nv/om-')) opened.push('nv-object')
  if (p.startsWith('/nv/ar-')) opened.push('nv-apprec')
  if (p.startsWith('/nv/sm-')) opened.push('nv-sysmaint')
  return opened
})

const currentDate = ref('')
const currentTime = ref('')
let tick: number | null = null

function tickClock() {
  const now = new Date()
  currentDate.value = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0')
  currentTime.value = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0') + ':' + String(now.getSeconds()).padStart(2, '0')
}

onMounted(() => {
  tickClock()
  tick = window.setInterval(tickClock, 1000)
})
onBeforeUnmount(() => {
  if (tick != null) window.clearInterval(tick)
})

const openDocs = () => {
  window.open('/site/index.html', '_blank')
}
</script>

<style scoped>
.layout-root {
  height: 100%;
}

/* ═══ Top Header (blue gradient, full-width) ═══ */
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--sg-header-height);
  padding: 0 24px;
  background: var(--sg-header-bg);
  box-shadow: 0 2px 8px rgba(42, 136, 230, 0.25);
  flex-shrink: 0;
  z-index: 100;
}
.header-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}
.header-brand-icon {
  width: 28px;
  height: 28px;
  filter: brightness(10);
}
.header-brand-name {
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.5px;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 14px;
}
.header-datetime {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 0.3px;
}

/* ═══ Body container ═══ */
.layout-body {
  flex: 1;
  min-height: 0;
}

/* ═══ Sidebar — Dark theme (Ant Design Pro style) ═══ */
.sidebar {
  background: var(--sg-sidebar-bg);
  color: var(--sg-sidebar-fg);
  display: flex;
  flex-direction: column;
  border-right: none;
  overflow-y: auto;
  overflow-x: hidden;
}

.nav-menu {
  flex: 1;
  border-right: none;
  padding: 8px 0;
}

/* Menu items */
.nav-menu :deep(.el-menu-item) {
  height: 40px;
  line-height: 40px;
  margin: 2px 8px;
  border-radius: 4px;
  border-left: none;
  font-size: 14px;
  font-weight: 400;
  color: var(--sg-sidebar-fg);
  transition: all 0.2s ease;
}
.nav-menu :deep(.el-menu-item:hover) {
  background-color: var(--sg-sidebar-hover) !important;
  color: #fff;
}
.nav-menu :deep(.el-menu-item.is-active) {
  background: var(--sg-sidebar-active) !important;
  color: #fff !important;
  font-weight: 500;
}
.nav-menu :deep(.el-menu-item .el-icon) {
  font-size: 16px;
  margin-right: 8px;
  color: var(--sg-sidebar-fg-muted);
}
.nav-menu :deep(.el-menu-item.is-active .el-icon) {
  color: #fff;
}

/* Sub-menu titles */
.nav-menu :deep(.el-sub-menu__title) {
  height: 40px;
  line-height: 40px;
  margin: 2px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  color: var(--sg-sidebar-fg) !important;
  transition: all 0.2s ease;
}
.nav-menu :deep(.el-sub-menu__title:hover) {
  background-color: var(--sg-sidebar-hover) !important;
  color: #fff !important;
}
.nav-menu :deep(.el-sub-menu__title .el-icon) {
  font-size: 16px;
  margin-right: 8px;
  color: var(--sg-sidebar-fg-muted);
}

/* Sub-menu items container */
.nav-menu :deep(.el-sub-menu .el-menu) {
  background-color: #000c17 !important;
}
.nav-menu :deep(.el-sub-menu .el-menu .el-menu-item) {
  padding-left: 48px !important;
  font-size: 13px;
  font-weight: 400;
  height: 36px;
  line-height: 36px;
  color: var(--sg-sidebar-fg);
}
.nav-menu :deep(.el-sub-menu .el-menu .el-menu-item:hover) {
  color: #fff;
  background: var(--sg-sidebar-hover) !important;
}
.nav-menu :deep(.el-sub-menu .el-menu .el-menu-item.is-active) {
  color: #fff !important;
  background: var(--sg-sidebar-active) !important;
  font-weight: 500;
}

/* Arrow icon */
.nav-menu :deep(.el-sub-menu__icon-arrow) {
  color: var(--sg-sidebar-fg-muted) !important;
  font-size: 11px;
}

.sidebar-foot {
  border-top: 1px solid var(--sg-sidebar-border);
  padding: 12px 16px;
  margin-top: auto;
}

/* ═══ Main Content ═══ */
.main-content {
  background: var(--sg-content-bg);
  padding: 16px;
  overflow: auto;
}

/* ═══ Transitions ═══ */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(3px);
}
.fade-leave-to {
  opacity: 0;
}
</style>
