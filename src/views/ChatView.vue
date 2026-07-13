<template>
  <div class="chat-layout">
    <!-- Session sidebar -->
    <div class="session-sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <span v-if="!sidebarCollapsed" class="sidebar-title">对话列表</span>
        <el-button v-if="!sidebarCollapsed" size="small" type="primary" text @click="newSession">+ 新对话</el-button>
        <el-button class="collapse-btn" size="small" text @click="sidebarCollapsed = !sidebarCollapsed">
          {{ sidebarCollapsed ? '▶' : '◀' }}
        </el-button>
      </div>
      <div v-if="!sidebarCollapsed" class="session-list">
        <div
          v-for="s in sessions"
          :key="s.id"
          class="session-item"
          :class="{ active: s.id === currentSessionId }"
          @click="switchSession(s.id)"
        >
          <span class="session-title">{{ s.title || '新对话' }}</span>
          <el-button
            v-if="sessions.length > 1"
            class="session-delete"
            size="small"
            text
            @click.stop="deleteSession(s.id)"
          >✕</el-button>
        </div>
      </div>
    </div>

    <!-- Main chat area -->
    <div class="chat-view">
    <!-- Messages area -->
    <div ref="messagesContainer" class="messages-container">
      <div v-if="messages.length === 0" class="empty-state">
        <el-icon :size="48" class="empty-icon"><ChatDotRound /></el-icon>
        <h3>NetSentry AI Bit</h3>
        <p class="empty-desc">使用自然语言查询网络流量、告警、协议分布等数据，AI 将调用分析工具为您解答。</p>

        <div class="suggestion-groups">
          <div v-for="group in suggestionGroups" :key="group.title" class="suggestion-group">
            <div class="group-header">
              <el-icon :size="16"><component :is="group.icon" /></el-icon>
              <span>{{ group.title }}</span>
            </div>
            <div class="group-cards">
              <div
                v-for="s in group.items"
                :key="s.text"
                class="suggestion-card"
                @click="sendSuggestion(s.text)"
              >
                <span class="card-label">{{ s.label }}</span>
                <span class="card-text">{{ s.text }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-for="(msg, i) in messages" :key="i" class="message" :class="msg.role">
        <div class="message-avatar">
          <el-icon v-if="msg.role === 'user'" :size="20"><User /></el-icon>
          <el-icon v-else :size="20"><Monitor /></el-icon>
        </div>
        <div class="message-body">
          <!-- Live thinking stream (shown during processing) -->
          <div v-if="msg.role === 'assistant' && msg.thinkingLive && msg.thinkingSteps && msg.thinkingSteps.length > 0" class="thinking-live">
            <div v-for="(step, si) in msg.thinkingSteps" :key="si" class="thinking-step" :class="step.type">
              <span class="step-icon">{{ step.type === 'thinking' ? '💭' : step.type === 'thought' ? '💡' : '🔧' }}</span>
              <span class="step-text">{{ step.text }}</span>
            </div>
          </div>
          <!-- Collapsed thinking (shown after completion) -->
          <div v-if="msg.role === 'assistant' && !msg.thinkingLive && msg.thinkingSteps && msg.thinkingSteps.length > 0" class="thinking-process">
            <div class="thinking-toggle" @click="msg.thinkingExpanded = !msg.thinkingExpanded">
              <span class="thinking-icon">{{ msg.thinkingExpanded ? '▼' : '▶' }}</span>
              <span class="thinking-label">思考过程 ({{ msg.thinkingSteps.length }} 步)</span>
            </div>
            <div v-if="msg.thinkingExpanded" class="thinking-steps">
              <div v-for="(step, si) in msg.thinkingSteps" :key="si" class="thinking-step" :class="step.type">
                <span class="step-icon">{{ step.type === 'thinking' ? '💭' : step.type === 'thought' ? '💡' : '🔧' }}</span>
                <span class="step-text">{{ step.text }}</span>
              </div>
            </div>
          </div>
          <div v-if="msg.toolStatus" class="tool-status">{{ msg.toolStatus }}</div>
          <div v-if="msg.role === 'assistant'" class="markdown-body" v-html="renderMarkdown(msg.content)"></div>
          <div v-else class="user-text">{{ msg.content }}</div>
          <!-- Inline charts -->
          <div v-if="msg.charts && msg.charts.length > 0" class="chart-container">
            <div v-for="(chart, ci) in msg.charts" :key="ci" class="chart-item" :ref="el => mountChart(el as HTMLElement, chart)"></div>
          </div>
          <!-- Token usage -->
          <div v-if="msg.tokenUsage" class="token-usage">
            <span class="token-badge">Tokens: {{ msg.tokenUsage.total_tokens.toLocaleString() }}</span>
            <span class="token-detail">输入 {{ msg.tokenUsage.prompt_tokens.toLocaleString() }} · 输出 {{ msg.tokenUsage.completion_tokens.toLocaleString() }}</span>
          </div>
        </div>
      </div>

      <div v-if="loading && !streamStarted" class="message assistant">
        <div class="message-avatar">
          <el-icon :size="20"><Monitor /></el-icon>
        </div>
        <div class="message-body">
          <div class="thinking">
            <span class="dot"></span><span class="dot"></span><span class="dot"></span>
            正在分析...
          </div>
        </div>
      </div>
    </div>

    <!-- Input area -->
    <div class="input-area">
      <el-input
        v-model="input"
        :placeholder="loading ? '等待响应中...' : '输入分析问题，如：最近一小时有哪些告警？'"
        :disabled="loading"
        size="large"
        @keydown.enter.exact.prevent="send"
      >
        <template #append>
          <el-button :icon="Promotion" :loading="loading" @click="send" />
        </template>
      </el-input>
      <div class="input-hints">
        <span class="hint-text">支持查询：流量会话 · DNS/HTTP 历史 · 安全告警 · Top 排名 · 协议分布 · 风险流量</span>
        <el-button v-if="messages.length > 0" text size="small" @click="clearChat">清空对话</el-button>
      </div>
    </div>
    </div><!-- /chat-view -->
  </div><!-- /chat-layout -->
</template>

<script setup lang="ts">
import { ref, nextTick, watch, onMounted } from 'vue'
import { ChatDotRound, User, Monitor, Promotion } from '@element-plus/icons-vue'
import { api, type ChatStreamEvent } from '@/api/client'
import * as echarts from 'echarts/core'
import { BarChart, LineChart, PieChart, ScatterChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([BarChart, LineChart, PieChart, ScatterChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer])

interface ThinkingStep {
  text: string
  type: 'thinking' | 'thought' | 'tool'
  timestamp?: number
  elapsed?: number
}

interface ChartConfig {
  title: string
  chart_type: 'bar' | 'line' | 'pie' | 'scatter'
  x_data?: string[]
  series: { name: string; data: number[] }[]
  y_label?: string
}

interface TokenUsage {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  toolStatus?: string
  thinkingSteps?: ThinkingStep[]
  thinkingExpanded?: boolean
  thinkingLive?: boolean
  charts?: ChartConfig[]
  tokenUsage?: TokenUsage
}

const USERNAME_KEY = 'sg-chat-username'

interface Session {
  id: string
  title: string
  messages: Message[]
  updated: number
}

const messages = ref<Message[]>([])
const input = ref('')
const loading = ref(false)
const streamStarted = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)
const username = ref(localStorage.getItem(USERNAME_KEY) || 'default')
const sessions = ref<Session[]>([])
const currentSessionId = ref('')
const sidebarCollapsed = ref(false)
let syncTimer: ReturnType<typeof setTimeout> | null = null

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

// Load all sessions from server
onMounted(async () => {
  try {
    const resp = await api.chatHistoryLoad(username.value)
    if (resp && resp.sessions && resp.sessions.length > 0) {
      sessions.value = resp.sessions.map((s: any) => ({
        id: s.id || generateId(),
        title: s.title || '新对话',
        messages: s.messages || [],
        updated: s.updated || Date.now(),
      }))
      // Load the latest session
      const latest = sessions.value[sessions.value.length - 1]
      currentSessionId.value = latest.id
      messages.value = latest.messages
    } else {
      // Create a default session
      const id = generateId()
      sessions.value = [{ id, title: '新对话', messages: [], updated: Date.now() }]
      currentSessionId.value = id
    }
  } catch {
    const id = generateId()
    sessions.value = [{ id, title: '新对话', messages: [], updated: Date.now() }]
    currentSessionId.value = id
  }
})

function currentSession(): Session | undefined {
  return sessions.value.find(s => s.id === currentSessionId.value)
}

function syncHistory() {
  const session = currentSession()
  if (!session) return
  // Update current session's messages and title
  session.messages = messages.value.filter(m => m.content)
  const firstUser = session.messages.find(m => m.role === 'user')
  if (firstUser) session.title = (firstUser.content || '').slice(0, 30) || '新对话'
  session.updated = Date.now()
  // Debounce server sync
  if (syncTimer) clearTimeout(syncTimer)
  syncTimer = setTimeout(() => {
    const toSave = sessions.value.map(s => ({
      id: s.id,
      title: s.title,
      messages: s.messages.map(m => ({ role: m.role, content: m.content, thinkingSteps: m.thinkingSteps, tokenUsage: m.tokenUsage })),
      updated: s.updated,
    }))
    api.chatHistorySave(username.value, toSave).catch(() => {})
  }, 2000)
}

watch(messages, () => syncHistory(), { deep: true })

function newSession() {
  // Save current messages first
  syncHistory()
  const id = generateId()
  sessions.value.push({ id, title: '新对话', messages: [], updated: Date.now() })
  currentSessionId.value = id
  messages.value = []
}

function switchSession(id: string) {
  if (id === currentSessionId.value) return
  // Save current to session
  const cur = currentSession()
  if (cur) cur.messages = [...messages.value]
  // Switch
  currentSessionId.value = id
  const target = sessions.value.find(s => s.id === id)
  messages.value = target ? [...target.messages] : []
}

function deleteSession(id: string) {
  if (sessions.value.length <= 1) return
  sessions.value = sessions.value.filter(s => s.id !== id)
  if (currentSessionId.value === id) {
    const last = sessions.value[sessions.value.length - 1]
    currentSessionId.value = last.id
    messages.value = [...last.messages]
  }
  // Sync deletion to server
  api.chatHistoryClear(username.value, id).catch(() => {})
  syncHistory()
}

const suggestionGroups: { title: string; icon: any; items: { label: string; text: string }[] }[] = []

function renderMarkdown(text: string): string {
  if (!text) return ''
  // Simple markdown rendering: bold, code blocks, inline code, tables, headers, lists
  let html = text
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="lang-$1">$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Headers
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // Tables (simple)
    .replace(/^\|(.+)\|$/gm, (match) => {
      const cells = match.split('|').filter(c => c.trim() !== '')
      if (cells.every(c => /^[\s-:]+$/.test(c))) {
        return '' // separator row
      }
      const tds = cells.map(c => `<td>${c.trim()}</td>`).join('')
      return `<tr>${tds}</tr>`
    })
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')

  // Wrap table rows
  html = html.replace(/(<tr>.*?<\/tr>(\s*<br>)?)+/g, (m) => {
    const cleaned = m.replace(/<br>/g, '')
    return `<table class="md-table">${cleaned}</table>`
  })
  // Wrap list items
  html = html.replace(/(<li>.*?<\/li>(\s*<br>)?)+/g, (m) => {
    const cleaned = m.replace(/<br>/g, '')
    return `<ul>${cleaned}</ul>`
  })

  return `<p>${html}</p>`
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

function mountChart(el: HTMLElement | null, cfg: ChartConfig) {
  if (!el || el.dataset.rendered) return
  el.dataset.rendered = '1'
  nextTick(() => {
    const chart = echarts.init(el)
    const option: any = {
      title: { text: cfg.title, left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { trigger: cfg.chart_type === 'pie' ? 'item' : 'axis' },
      grid: { left: 60, right: 20, bottom: 40, top: 50 },
    }
    if (cfg.chart_type === 'pie') {
      option.series = cfg.series.map(s => ({
        type: 'pie',
        radius: '60%',
        data: s.data.map((v, i) => ({ value: v, name: cfg.x_data?.[i] || `${i}` })),
      }))
      option.legend = { bottom: 0 }
    } else {
      option.xAxis = { type: 'category', data: cfg.x_data || [], axisLabel: { rotate: cfg.x_data && cfg.x_data.length > 8 ? 30 : 0 } }
      option.yAxis = { type: 'value', name: cfg.y_label || '' }
      option.series = cfg.series.map(s => ({
        name: s.name,
        type: cfg.chart_type,
        data: s.data,
        smooth: cfg.chart_type === 'line',
      }))
      if (cfg.series.length > 1) option.legend = { top: 25 }
    }
    chart.setOption(option)
  })
}

async function send() {
  const text = input.value.trim()
  if (!text || loading.value) return

  messages.value.push({ role: 'user', content: text })
  input.value = ''
  loading.value = true
  streamStarted.value = false
  scrollToBottom()

  // Add a placeholder assistant message for progressive rendering
  const assistantIdx = messages.value.length
  messages.value.push({ role: 'assistant', content: '', toolStatus: '', thinkingLive: true })

  try {
    const history = messages.value
      .slice(0, assistantIdx)
      .filter(m => m.role === 'user' || (m.role === 'assistant' && m.content))
      .slice(-20)

    await api.chatStream(history, (ev: ChatStreamEvent) => {
      streamStarted.value = true
      const msg = messages.value[assistantIdx]
      if (!msg.thinkingSteps) msg.thinkingSteps = []
      switch (ev.type) {
        case 'thinking':
          msg.toolStatus = `💭 ${ev.content}`
          msg.thinkingSteps.push({ text: ev.content, type: 'thinking' })
          scrollToBottom()
          break
        case 'thought':
          msg.thinkingSteps.push({ text: ev.content, type: 'thought' })
          scrollToBottom()
          break
        case 'tool_start': {
          const desc = ev.desc || `调用 ${ev.tool}`
          msg.toolStatus = `🔧 ${desc}`
          let detail = desc
          if (ev.args && ev.args !== '{}' && ev.tool !== 'render_chart') {
            try {
              const parsed = JSON.parse(ev.args)
              if (parsed.sql) detail += `\n  SQL: ${parsed.sql}`
            } catch { /* skip */ }
          }
          msg.thinkingSteps.push({ text: detail, type: 'tool' })
          scrollToBottom()
          break
        }
        case 'tool_done': {
          msg.toolStatus = `✓ ${ev.tool} 完成`
          if (ev.preview && ev.tool !== 'render_chart') {
            const shortPreview = ev.preview.length > 300 ? ev.preview.slice(0, 300) + '...' : ev.preview
            msg.thinkingSteps.push({ text: `返回结果: ${shortPreview}`, type: 'thinking' })
          }
          scrollToBottom()
          break
        }
        case 'chart': {
          try {
            const cfg = JSON.parse(ev.config) as ChartConfig
            if (!msg.charts) msg.charts = []
            msg.charts.push(cfg)
          } catch { /* skip malformed chart */ }
          scrollToBottom()
          break
        }
        case 'delta':
          // Switch from live thinking to collapsed on first content
          if (msg.thinkingLive) msg.thinkingLive = false
          msg.toolStatus = ''
          msg.content += ev.content
          scrollToBottom()
          break
        case 'done':
          msg.thinkingLive = false
          msg.toolStatus = ''
          if (ev.total_tokens) {
            msg.tokenUsage = {
              prompt_tokens: ev.prompt_tokens || 0,
              completion_tokens: ev.completion_tokens || 0,
              total_tokens: ev.total_tokens || 0,
            }
          }
          break
        case 'error':
          msg.thinkingLive = false
          msg.content = `**错误**: ${ev.message}`
          msg.toolStatus = ''
          break
      }
    })

    // If still empty after stream ends
    if (!messages.value[assistantIdx].content) {
      messages.value[assistantIdx].content = '（无响应内容）'
    }
  } catch (err: any) {
    const errMsg = err?.message || String(err)
    messages.value[assistantIdx].content = `**错误**: ${errMsg}\n\n请检查 LLM 配置（config.yaml → llm 段）是否正确设置。`
    messages.value[assistantIdx].toolStatus = ''
  } finally {
    loading.value = false
    scrollToBottom()
  }
}

function sendSuggestion(text: string) {
  input.value = text
  send()
}

function clearChat() {
  messages.value = []
  const session = currentSession()
  if (session) {
    session.messages = []
    session.title = '新对话'
  }
  syncHistory()
}

async function onUsernameChange() {
  localStorage.setItem(USERNAME_KEY, username.value)
  try {
    const resp = await api.chatHistoryLoad(username.value)
    if (resp && resp.sessions && resp.sessions.length > 0) {
      sessions.value = resp.sessions.map((s: any) => ({
        id: s.id || generateId(),
        title: s.title || '新对话',
        messages: s.messages || [],
        updated: s.updated || Date.now(),
      }))
      const latest = sessions.value[sessions.value.length - 1]
      currentSessionId.value = latest.id
      messages.value = [...latest.messages]
    } else {
      const id = generateId()
      sessions.value = [{ id, title: '新对话', messages: [], updated: Date.now() }]
      currentSessionId.value = id
      messages.value = []
    }
  } catch {
    const id = generateId()
    sessions.value = [{ id, title: '新对话', messages: [], updated: Date.now() }]
    currentSessionId.value = id
    messages.value = []
  }
}
</script>

<style scoped>
.chat-layout {
  display: flex;
  height: calc(100vh - 120px);
  gap: 0;
}
.session-sidebar {
  width: 200px;
  min-width: 200px;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  background: #fafbfc;
  transition: width 0.2s, min-width 0.2s;
}
.session-sidebar.collapsed {
  width: 36px;
  min-width: 36px;
}
.collapse-btn {
  padding: 4px 6px !important;
  font-size: 10px;
  color: #999;
}
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 12px 8px;
  border-bottom: 1px solid var(--sg-card-border, #e2e8f0);
}
.sidebar-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--sg-text, #1e293b);
}
.session-list {
  flex: 1;
  overflow-y: auto;
  padding: 6px;
}
.session-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 2px;
  transition: background 0.15s;
}
.session-item:hover {
  background: var(--sg-brand-bg, #e6f4ff);
}
.session-item.active {
  background: var(--sg-brand-bg, #e6f4ff);
  font-weight: 500;
  border-left: 2px solid var(--sg-brand, #1677ff);
}
.session-title {
  font-size: 12px;
  color: var(--sg-text, #1e293b);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}
.session-delete {
  opacity: 0;
  font-size: 12px;
  color: #999;
  padding: 0 4px;
}
.session-item:hover .session-delete {
  opacity: 1;
}
.chat-view {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  color: var(--sg-text, #1e293b);
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  scroll-behavior: smooth;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--sg-text-secondary, #475569);
  text-align: center;
}
.empty-icon {
  color: var(--el-color-primary);
  margin-bottom: 12px;
}
.empty-state h3 {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 700;
  color: var(--sg-text, #1e293b);
  letter-spacing: -0.01em;
}
.empty-desc {
  max-width: 420px;
  line-height: 1.6;
  color: var(--sg-text-muted, #94a3b8);
  margin-bottom: 24px;
  font-size: 14px;
}
.suggestion-groups {
  width: 100%;
  max-width: 840px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 4px;
}
.suggestion-group {
  text-align: left;
}
.group-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--sg-text-secondary, #475569);
  margin-bottom: 8px;
  padding-left: 2px;
}
.group-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
@media (max-width: 768px) {
  .group-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}
.suggestion-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
  border: 1px solid var(--sg-card-border, #e2e8f0);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--sg-card-bg, #ffffff);
}
.suggestion-card:hover {
  border-color: var(--sg-brand, #1677ff);
  background: var(--sg-brand-bg, #e6f4ff);
  box-shadow: 0 4px 12px rgba(22, 119, 255, 0.08);
  transform: translateY(-1px);
}
.card-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-color-primary);
}
.card-text {
  font-size: 12px;
  color: #888;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.message {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  animation: fadeIn 0.2s ease;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
.message-avatar {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.message.user .message-avatar {
  background: var(--el-color-primary-light-7);
  color: var(--el-color-primary);
}
.message.assistant .message-avatar {
  background: #e8f5e9;
  color: #43a047;
}
.message-body {
  flex: 1;
  min-width: 0;
}
.user-text {
  background: var(--el-color-primary-light-9);
  padding: 10px 14px;
  border-radius: 12px;
  border-top-left-radius: 2px;
  display: inline-block;
  max-width: 100%;
  font-size: 14px;
  line-height: 1.6;
}
.message.assistant .message-body {
  background: #f9f9f9;
  padding: 12px 16px;
  border-radius: 12px;
  border-top-left-radius: 2px;
  font-size: 14px;
  line-height: 1.7;
}

.thinking-live {
  margin-bottom: 8px;
  padding: 10px 12px;
  background: linear-gradient(135deg, #f0f9ff 0%, #f5f3ff 100%);
  border: 1px solid #e0e7ff;
  border-radius: 8px;
  max-height: 300px;
  overflow-y: auto;
  animation: fadeIn 0.3s ease;
}
.thinking-live .thinking-step {
  animation: slideIn 0.3s ease;
}
@keyframes slideIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
.chart-container {
  margin-top: 12px;
}
.chart-item {
  width: 100%;
  height: 320px;
  margin-bottom: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
}
.thinking-process {
  margin-bottom: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}
.thinking-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: #f9fafb;
  cursor: pointer;
  user-select: none;
  font-size: 12px;
  color: #6b7280;
}
.thinking-toggle:hover {
  background: #f3f4f6;
}
.thinking-icon {
  font-size: 10px;
}
.thinking-label {
  font-weight: 500;
}
.thinking-steps {
  padding: 8px 10px;
  background: #fafafa;
  border-top: 1px solid #e5e7eb;
}
.thinking-step {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 3px 0;
  font-size: 12px;
  color: #4b5563;
  line-height: 1.5;
}
.thinking-step.thought {
  color: #7c3aed;
  font-style: italic;
}
.thinking-step.tool {
  color: #0369a1;
}
.step-icon {
  flex-shrink: 0;
}
.step-text {
  white-space: pre-wrap;
  word-break: break-all;
  font-family: 'SF Mono', 'Menlo', 'Monaco', monospace;
}
.tool-status {
  font-size: 12px;
  color: #8b5cf6;
  margin-bottom: 6px;
  padding: 4px 8px;
  background: #f5f3ff;
  border-radius: 4px;
  display: inline-block;
  animation: fadeIn 0.2s ease;
}
.thinking {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #999;
  font-size: 13px;
}
.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #999;
  animation: bounce 1.4s infinite ease-in-out;
}
.dot:nth-child(1) { animation-delay: 0s; }
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.input-area {
  border-top: 1px solid var(--sg-card-border, #e2e8f0);
  padding: 16px 24px;
  background: #ffffff;
}
.input-hints {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
}
.hint-text {
  font-size: 12px;
  color: var(--sg-text-muted, #94a3b8);
}

/* Markdown body styles */
:deep(.markdown-body) {
  word-break: break-word;
}
:deep(.markdown-body h2) {
  font-size: 16px;
  margin: 12px 0 6px;
  font-weight: 600;
}
:deep(.markdown-body h3) {
  font-size: 15px;
  margin: 10px 0 4px;
  font-weight: 600;
}
:deep(.markdown-body h4) {
  font-size: 14px;
  margin: 8px 0 4px;
  font-weight: 600;
}
:deep(.markdown-body pre) {
  background: #1e1e1e;
  color: #d4d4d4;
  border-radius: 6px;
  padding: 12px;
  overflow-x: auto;
  font-size: 12px;
  margin: 8px 0;
}
:deep(.markdown-body code) {
  background: #f0f0f0;
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 12px;
}
:deep(.markdown-body pre code) {
  background: none;
  padding: 0;
}
:deep(.markdown-body .md-table) {
  border-collapse: collapse;
  width: 100%;
  margin: 8px 0;
  font-size: 13px;
}
:deep(.markdown-body .md-table td) {
  border: 1px solid #e0e0e0;
  padding: 6px 10px;
}
:deep(.markdown-body .md-table tr:first-child td) {
  background: #f5f5f5;
  font-weight: 600;
}
:deep(.markdown-body ul) {
  padding-left: 20px;
  margin: 6px 0;
}
:deep(.markdown-body li) {
  margin-bottom: 3px;
}
:deep(.markdown-body strong) {
  font-weight: 600;
}
.token-usage {
  margin-top: 8px;
  padding-top: 6px;
  border-top: 1px dashed #e8e8e8;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: #999;
}
.token-badge {
  background: #f0f7ff;
  color: #4a90d9;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
  font-size: 11px;
}
.token-detail {
  color: #aaa;
  font-size: 11px;
}
</style>
