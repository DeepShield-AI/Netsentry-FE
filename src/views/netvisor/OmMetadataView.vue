<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav" role="tablist" aria-label="元数据">
        <button type="button" class="nv-tab active" role="tab">元数据</button>
      </div>
    </div>
    <div class="nv-tabs-body">
      <div class="om-md-page">
        <!-- 左侧协议列表 -->
        <aside class="om-md-sidebar" aria-label="协议列表">
          <div class="om-md-tree-head"><span>协议列表</span></div>
          <ul class="om-md-tree-list">
            <li class="om-md-tree-item om-md-tree-group" :class="{ open: groupOpen }" @click="groupOpen = !groupOpen">
              <span class="om-md-tree-toggle">{{ groupOpen ? '−' : '+' }}</span>
              <span class="om-md-tree-icon">▣</span>
              <span class="om-md-tree-label">协议分组</span>
            </li>
            <ul v-show="groupOpen" class="om-md-tree-children">
              <li v-for="p in protocols" :key="p.key" class="om-md-tree-item om-md-tree-leaf" :class="{ active: activeProto === p.key }" @click="activeProto = p.key">
                <span class="om-md-tree-icon">{{ activeProto === p.key ? '●' : '○' }}</span>
                <span class="om-md-tree-label">{{ p.label }}</span>
              </li>
            </ul>
          </ul>
        </aside>

        <!-- 右侧主区 -->
        <div class="om-md-main">
          <div class="ou-toolbar om-md-toolbar">
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">属性状态</span>
              <el-select v-model="statusFilter" size="small" style="width:120px">
                <el-option label="所有状态" value="all" />
                <el-option label="已启用" value="on" />
                <el-option label="已停用" value="off" />
              </el-select>
            </label>
            <el-input v-model="keyword" size="small" placeholder="关键字搜索" style="width:200px" clearable>
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
            <button class="ou-search-btn" @click="doSearch"><el-icon><Search /></el-icon></button>
            <button class="secondary td-reset-btn" @click="doReset">重置</button>
          </div>

          <div class="ou-table-wrap om-md-table-wrap">
            <table class="ou-table om-md-table">
              <thead>
                <tr>
                  <th class="col-idx" style="width:60px">序号</th>
                  <th class="col-name">属性名称</th>
                  <th class="col-desc">描述</th>
                  <th class="col-enable" style="width:180px">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(r, i) in pagedRows" :key="r.name">
                  <td class="col-idx">{{ (page - 1) * pageSize + i + 1 }}</td>
                  <td class="col-name">{{ r.name }}</td>
                  <td class="col-desc">{{ r.desc }}</td>
                  <td class="col-enable">
                    <el-switch v-model="r.enabled" size="small" active-text="启用" inactive-text="停用" />
                    <button class="link-btn" @click="editRow(r)">编辑</button>
                    <button class="link-btn" @click="delRow(r)">删除</button>
                  </td>
                </tr>
                <tr v-if="pagedRows.length === 0">
                  <td colspan="4" class="ou-empty">无数据</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="ou-footer">
            <div class="ou-footer-left">
              <div class="ou-pager">
                <button class="ou-page-btn" :disabled="page <= 1" @click="page > 1 && page--">‹</button>
                <button v-for="pg in pageArr" :key="pg" class="ou-page-btn" :class="{ active: pg === page }" @click="page = pg">{{ pg }}</button>
                <button class="ou-page-btn" :disabled="page >= totalPages" @click="page < totalPages && page++">›</button>
              </div>
            </div>
            <div class="ou-footer-right">
              <span>共 {{ filteredRows.length }} 条</span>
              <el-select v-model="pageSize" size="small" style="width:110px">
                <el-option :value="20" label="20 条/页" />
                <el-option :value="50" label="50 条/页" />
                <el-option :value="100" label="100 条/页" />
              </el-select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 编辑元数据弹窗 ==================== -->
    <el-dialog v-model="editVisible" :title="`编辑属性 - ${editForm.name}`" width="500px" :close-on-click-modal="false" destroy-on-close>
      <div class="om-md-form">
        <div class="om-md-row">
          <div class="om-md-lbl">属性名称</div>
          <div class="om-md-ctrl">
            <el-input v-model="editForm.name" size="small" />
          </div>
        </div>
        <div class="om-md-row">
          <div class="om-md-lbl">描述</div>
          <div class="om-md-ctrl">
            <el-input v-model="editForm.desc" size="small" />
          </div>
        </div>
        <div class="om-md-row">
          <div class="om-md-lbl">状态</div>
          <div class="om-md-ctrl">
            <el-switch v-model="editForm.enabled" active-text="启用" inactive-text="停用" />
          </div>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" size="small" @click="submitEdit">确定</el-button>
        <el-button size="small" @click="editVisible = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import '@/views/netvisor/nv-shared.css'

// ══════════════════════════════════════════════════════════════
// 协议列表
// ═══════════════════════════════════════════════════════════
const groupOpen = ref(true)
const activeProto = ref('http')
const protocols = [
  { key: 'http', label: 'HTTP' },
  { key: 'smtp', label: 'SMTP' },
  { key: 'pop3', label: 'POP3' },
  { key: 'imap', label: 'IMAP' },
  { key: 'dns', label: 'DNS' },
  { key: 'sip', label: 'SIP' },
  { key: 'mysql', label: 'MYSQL' },
  { key: 'oracle', label: 'ORACLE' },
  { key: 'h323', label: 'H323' },
  { key: 'ftp', label: 'FTP' },
  { key: 'icmp', label: 'ICMP' },
  { key: 'arp', label: 'ARP' },
  { key: 'snmp', label: 'SNMP' },
  { key: 'pgsql', label: 'PGSQL' },
  { key: 'mssql', label: 'MSSQL' },
  { key: 'radius', label: 'RADIUS' },
  { key: 'telnet', label: 'TELNET' },
]

// ══════════════════════════════════════════════════════════════
// Mock 数据
// ═══════════════════════════════════════════════════════════
interface Attr { name: string; desc: string; enabled: boolean }

const allData: Record<string, Attr[]> = {
  http: [
    { name: 'x_forwarded_for', desc: 'X-Forwarded-For', enabled: true },
    { name: 'user_agent', desc: 'User-Agent', enabled: true },
    { name: 'upgrade', desc: 'Upgrade', enabled: true },
    { name: 'unknown_header', desc: 'Unknown header', enabled: true },
    { name: 'time', desc: 'Time since request', enabled: true },
    { name: 'set_cookie', desc: 'Set-Cookie', enabled: true },
    { name: 'response.code', desc: 'Status Code', enabled: true },
    { name: 'request.uri.query', desc: 'Request URI Query', enabled: true },
    { name: 'request.uri.path', desc: 'Request URI Path', enabled: true },
    { name: 'request.uri', desc: 'Request URI', enabled: true },
    { name: 'request.method', desc: 'Request Method', enabled: true },
    { name: 'request.line', desc: 'Request line', enabled: true },
    { name: 'request.full_uri', desc: 'Full request URI', enabled: true },
    { name: 'referer', desc: 'Referer', enabled: true },
    { name: 'location', desc: 'Location', enabled: true },
    { name: 'host', desc: 'Host', enabled: true },
    { name: 'date', desc: 'Date', enabled: true },
    { name: 'cookie', desc: 'Cookie', enabled: true },
    { name: 'content_type', desc: 'Content-Type', enabled: true },
    { name: 'content_length', desc: 'Content length', enabled: true },
    { name: 'content_encoding', desc: 'Content-Encoding', enabled: true },
    { name: 'bad_header_name', desc: 'Illegal characters found in header name', enabled: true },
    { name: 'accept_language', desc: 'Accept-Language', enabled: true },
    { name: 'accept_encoding', desc: 'Accept Encoding', enabled: true },
  ],
  smtp: [
    { name: 'rcp.parameter', desc: 'Response parameter', enabled: true },
    { name: 'rcp', desc: 'Response', enabled: true },
    { name: 'response.code.unexpected', desc: 'Unexpected response code in multi-line response', enabled: true },
    { name: 'response.code', desc: 'Response code', enabled: true },
    { name: 'response', desc: 'Response', enabled: true },
    { name: 'req.parameter', desc: 'Request parameter', enabled: true },
    { name: 'req.command', desc: 'Command', enabled: true },
    { name: 'res', desc: 'Request', enabled: true },
    { name: 'message', desc: 'Message', enabled: true },
    { name: 'eom', desc: 'EOM', enabled: true },
    { name: 'data.reassembled.length', desc: 'Reassembled DATA length', enabled: true },
    { name: 'data.reassembled.in', desc: 'Reassembled DATA in frame', enabled: true },
    { name: 'data.fragments', desc: 'DATA fragments', enabled: true },
    { name: 'data.fragment.too_long_fragment', desc: 'DATA fragment too long', enabled: true },
    { name: 'data.fragment.overlap.conflicts', desc: 'DATA fragment overlapping with conflicting data', enabled: true },
    { name: 'data.fragment.overlap', desc: 'DATA fragment overlap', enabled: true },
    { name: 'data.fragment.multiple_tsbs', desc: 'DATA has multiple tail fragments', enabled: true },
    { name: 'data.fragment.error', desc: 'DATA desegmentation error', enabled: true },
    { name: 'data.fragment.count', desc: 'DATA fragment count', enabled: true },
    { name: 'data.fragment', desc: 'DATA fragment', enabled: true },
    { name: 'command_line', desc: 'Command Line', enabled: true },
    { name: 'base64_decode', desc: 'base64 decode failed or is not enabled (check SMTP preferences)', enabled: true },
    { name: 'auth.username.password', desc: 'Username/Password', enabled: true },
    { name: 'auth.username', desc: 'Username', enabled: true },
  ],
  pop3: [
    { name: 'request.command', desc: 'Request command', enabled: true },
    { name: 'request', desc: 'Request', enabled: true },
    { name: 'response.indicator', desc: 'Response indicator', enabled: true },
    { name: 'response', desc: 'Response', enabled: true },
    { name: 'message', desc: 'Message', enabled: true },
    { name: 'eom', desc: 'EOM', enabled: true },
    { name: 'data.fragment', desc: 'DATA fragment', enabled: true },
    { name: 'data', desc: 'DATA', enabled: true },
    { name: 'command_line', desc: 'Command Line', enabled: true },
    { name: 'base64_decode', desc: 'base64 decode failed', enabled: true },
    { name: 'auth.username.password', desc: 'Username/Password', enabled: true },
    { name: 'auth.username', desc: 'Username', enabled: true },
    { name: 'mail', desc: 'Mail', enabled: true },
    { name: 'list', desc: 'List', enabled: true },
    { name: 'stat', desc: 'Stat', enabled: true },
    { name: 'uidl', desc: 'UIDL', enabled: true },
    { name: 'retr', desc: 'Retr', enabled: true },
    { name: 'dele', desc: 'Dele', enabled: true },
    { name: 'top', desc: 'Top', enabled: true },
    { name: 'user', desc: 'User', enabled: true },
    { name: 'pass', desc: 'Pass', enabled: true },
    { name: 'quit', desc: 'Quit', enabled: true },
    { name: 'capa', desc: 'Capa', enabled: true },
    { name: 'rset', desc: 'Rset', enabled: true },
  ],
  imap: [
    { name: 'request', desc: 'Request', enabled: true },
    { name: 'response', desc: 'Response', enabled: true },
    { name: 'command', desc: 'Command', enabled: true },
    { name: 'tag', desc: 'Tag', enabled: true },
    { name: 'uid', desc: 'UID', enabled: true },
    { name: 'mailbox', desc: 'Mailbox', enabled: true },
    { name: 'flags', desc: 'Flags', enabled: true },
    { name: 'message', desc: 'Message', enabled: true },
    { name: 'fetch', desc: 'Fetch', enabled: true },
    { name: 'search', desc: 'Search', enabled: true },
    { name: 'store', desc: 'Store', enabled: true },
    { name: 'expunge', desc: 'Expunge', enabled: true },
    { name: 'idle', desc: 'Idle', enabled: true },
    { name: 'capability', desc: 'Capability', enabled: true },
    { name: 'login', desc: 'Login', enabled: true },
    { name: 'logout', desc: 'Logout', enabled: true },
    { name: 'select', desc: 'Select', enabled: true },
    { name: 'examine', desc: 'Examine', enabled: true },
    { name: 'create', desc: 'Create', enabled: true },
    { name: 'delete', desc: 'Delete', enabled: true },
    { name: 'rename', desc: 'Rename', enabled: true },
    { name: 'subscribe', desc: 'Subscribe', enabled: true },
    { name: 'unsubscribe', desc: 'Unsubscribe', enabled: true },
    { name: 'list', desc: 'List', enabled: true },
  ],
  dns: [
    { name: 'id', desc: 'Transaction ID', enabled: true },
    { name: 'qry.name', desc: 'Query Name', enabled: true },
    { name: 'qry.type', desc: 'Query Type', enabled: true },
    { name: 'qry.class', desc: 'Query Class', enabled: true },
    { name: 'resp.name', desc: 'Response Name', enabled: true },
    { name: 'resp.type', desc: 'Response Type', enabled: true },
    { name: 'resp.class', desc: 'Response Class', enabled: true },
    { name: 'resp.ttl', desc: 'Response TTL', enabled: true },
    { name: 'resp.address', desc: 'Response Address', enabled: true },
    { name: 'flags', desc: 'Flags', enabled: true },
    { name: 'flags.response', desc: 'Response Flag', enabled: true },
    { name: 'flags.opcode', desc: 'Opcode Flag', enabled: true },
    { name: 'flags.authoritative', desc: 'Authoritative Flag', enabled: true },
    { name: 'flags.truncated', desc: 'Truncated Flag', enabled: true },
    { name: 'flags.recursion_desired', desc: 'Recursion Desired', enabled: true },
    { name: 'flags.recursion_available', desc: 'Recursion Available', enabled: true },
    { name: 'cnt.queries', desc: 'Count of Queries', enabled: true },
    { name: 'cnt.answers', desc: 'Count of Answers', enabled: true },
    { name: 'cnt.auth_rr', desc: 'Count of Authority RRs', enabled: true },
    { name: 'cnt.add_rr', desc: 'Count of Additional RRs', enabled: true },
    { name: 'time', desc: 'Time', enabled: true },
    { name: 'a', desc: 'A Record', enabled: true },
    { name: 'aaaa', desc: 'AAAA Record', enabled: true },
    { name: 'cname', desc: 'CNAME Record', enabled: true },
  ],
  sip: [
    { name: 'request.line', desc: 'Request-Line', enabled: true },
    { name: 'status.line', desc: 'Status-Line', enabled: true },
    { name: 'from', desc: 'From', enabled: true },
    { name: 'to', desc: 'To', enabled: true },
    { name: 'call.id', desc: 'Call-ID', enabled: true },
    { name: 'cseq', desc: 'CSeq', enabled: true },
    { name: 'via', desc: 'Via', enabled: true },
    { name: 'contact', desc: 'Contact', enabled: true },
    { name: 'content.type', desc: 'Content-Type', enabled: true },
    { name: 'content.length', desc: 'Content-Length', enabled: true },
    { name: 'user.agent', desc: 'User-Agent', enabled: true },
    { name: 'allow', desc: 'Allow', enabled: true },
    { name: 'supported', desc: 'Supported', enabled: true },
    { name: 'require', desc: 'Require', enabled: true },
    { name: 'routing', desc: 'Routing', enabled: true },
    { name: 'record.route', desc: 'Record-Route', enabled: true },
    { name: 'subject', desc: 'Subject', enabled: true },
    { name: 'organization', desc: 'Organization', enabled: true },
    { name: 'priority', desc: 'Priority', enabled: true },
    { name: 'expires', desc: 'Expires', enabled: true },
    { name: 'max.forwards', desc: 'Max-Forwards', enabled: true },
    { name: 'date', desc: 'Date', enabled: true },
    { name: 'mime.version', desc: 'MIME-Version', enabled: true },
    { name: 'content.encoding', desc: 'Content-Encoding', enabled: true },
  ],
  mysql: [
    { name: 'request.command', desc: 'Command', enabled: true },
    { name: 'request', desc: 'Request', enabled: true },
    { name: 'response', desc: 'Response', enabled: true },
    { name: 'connection.id', desc: 'Connection ID', enabled: true },
    { name: 'affected.rows', desc: 'Affected Rows', enabled: true },
    { name: 'table.name', desc: 'Table Name', enabled: true },
    { name: 'database', desc: 'Database', enabled: true },
    { name: 'user.name', desc: 'User Name', enabled: true },
    { name: 'host', desc: 'Host', enabled: true },
    { name: 'query', desc: 'Query', enabled: true },
    { name: 'statement', desc: 'Statement', enabled: true },
    { name: 'charset', desc: 'Character Set', enabled: true },
    { name: 'encoding', desc: 'Encoding', enabled: true },
    { name: 'time', desc: 'Time', enabled: true },
    { name: 'error.code', desc: 'Error Code', enabled: true },
    { name: 'error.message', desc: 'Error Message', enabled: true },
    { name: 'warning.count', desc: 'Warning Count', enabled: true },
    { name: 'server.status', desc: 'Server Status', enabled: true },
    { name: 'capabilities', desc: 'Capabilities', enabled: true },
    { name: 'transaction.id', desc: 'Transaction ID', enabled: true },
    { name: 'auto.commit', desc: 'Auto Commit', enabled: true },
    { name: 'sql.mode', desc: 'SQL Mode', enabled: true },
    { name: 'wait.timeout', desc: 'Wait Timeout', enabled: true },
    { name: 'thread.id', desc: 'Thread ID', enabled: true },
  ],
  oracle: [
    { name: 'sql', desc: 'SQL Statement', enabled: true },
    { name: 'table.name', desc: 'Table Name', enabled: true },
    { name: 'schema', desc: 'Schema', enabled: true },
    { name: 'user.name', desc: 'User Name', enabled: true },
    { name: 'host', desc: 'Host', enabled: true },
    { name: 'service.name', desc: 'Service Name', enabled: true },
    { name: 'sid', desc: 'SID', enabled: true },
    { name: 'instance', desc: 'Instance', enabled: true },
    { name: 'row.count', desc: 'Row Count', enabled: true },
    { name: 'affected.rows', desc: 'Affected Rows', enabled: true },
    { name: 'error.code', desc: 'Error Code', enabled: true },
    { name: 'error.message', desc: 'Error Message', enabled: true },
    { name: 'warning.count', desc: 'Warning Count', enabled: true },
    { name: 'time', desc: 'Time', enabled: true },
    { name: 'response.time', desc: 'Response Time', enabled: true },
    { name: 'client.info', desc: 'Client Info', enabled: true },
    { name: 'module', desc: 'Module', enabled: true },
    { name: 'action', desc: 'Action', enabled: true },
    { name: 'transaction.id', desc: 'Transaction ID', enabled: true },
    { name: 'commit', desc: 'Commit', enabled: true },
    { name: 'rollback', desc: 'Rollback', enabled: true },
    { name: 'bind.variable', desc: 'Bind Variable', enabled: true },
    { name: 'fetch.size', desc: 'Fetch Size', enabled: true },
    { name: 'array.size', desc: 'Array Size', enabled: true },
  ],
  h323: [
    { name: 'message.type', desc: 'Message Type', enabled: true },
    { name: 'from', desc: 'From', enabled: true },
    { name: 'to', desc: 'To', enabled: true },
    { name: 'call.id', desc: 'Call ID', enabled: true },
    { name: 'endpoint', desc: 'Endpoint', enabled: true },
    { name: 'gatekeeper', desc: 'Gatekeeper', enabled: true },
    { name: 'alias', desc: 'Alias', enabled: true },
    { name: 'ras', desc: 'RAS Message', enabled: true },
    { name: 'q931', desc: 'Q.931 Message', enabled: true },
    { name: 'h245', desc: 'H.245 Message', enabled: true },
    { name: 'h225', desc: 'H.225 Message', enabled: true },
    { name: 'cause', desc: 'Cause', enabled: true },
    { name: 'reason', desc: 'Reason', enabled: true },
    { name: 'time', desc: 'Time', enabled: true },
    { name: 'duration', desc: 'Duration', enabled: true },
    { name: 'bandwidth', desc: 'Bandwidth', enabled: true },
    { name: 'codec', desc: 'Codec', enabled: true },
    { name: 'rtp', desc: 'RTP Stream', enabled: true },
    { name: 'rtcp', desc: 'RTCP Stream', enabled: true },
    { name: 'media', desc: 'Media', enabled: true },
    { name: 'channel', desc: 'Channel', enabled: true },
    { name: 'session', desc: 'Session', enabled: true },
    { name: 'setup', desc: 'Setup', enabled: true },
    { name: 'connect', desc: 'Connect', enabled: true },
  ],
  ftp: [
    { name: 'request.command', desc: 'Request Command', enabled: true },
    { name: 'request', desc: 'Request', enabled: true },
    { name: 'response', desc: 'Response', enabled: true },
    { name: 'response.code', desc: 'Response Code', enabled: true },
    { name: 'response.arg', desc: 'Response Argument', enabled: true },
    { name: 'user', desc: 'User', enabled: true },
    { name: 'password', desc: 'Password', enabled: true },
    { name: 'filename', desc: 'Filename', enabled: true },
    { name: 'path', desc: 'Path', enabled: true },
    { name: 'data', desc: 'Data', enabled: true },
    { name: 'data.type', desc: 'Data Type', enabled: true },
    { name: 'port', desc: 'Port', enabled: true },
    { name: 'pasv', desc: 'Passive Mode', enabled: true },
    { name: 'epsv', desc: 'Extended Passive', enabled: true },
    { name: 'type', desc: 'Transfer Type', enabled: true },
    { name: 'mode', desc: 'Transfer Mode', enabled: true },
    { name: 'size', desc: 'File Size', enabled: true },
    { name: 'restart', desc: 'Restart Position', enabled: true },
    { name: 'cwd', desc: 'Current Directory', enabled: true },
    { name: 'list', desc: 'List', enabled: true },
    { name: 'retr', desc: 'Retrieve', enabled: true },
    { name: 'stor', desc: 'Store', enabled: true },
    { name: 'dele', desc: 'Delete', enabled: true },
    { name: 'quit', desc: 'Quit', enabled: true },
  ],
  icmp: [
    { name: 'type', desc: 'Type', enabled: true },
    { name: 'code', desc: 'Code', enabled: true },
    { name: 'checksum', desc: 'Checksum', enabled: true },
    { name: 'identifier', desc: 'Identifier', enabled: true },
    { name: 'sequence', desc: 'Sequence', enabled: true },
    { name: 'data', desc: 'Data', enabled: true },
    { name: 'data.length', desc: 'Data Length', enabled: true },
    { name: 'time', desc: 'Time', enabled: true },
    { name: 'response.time', desc: 'Response Time', enabled: true },
    { name: 'ttl', desc: 'TTL', enabled: true },
    { name: 'src', desc: 'Source', enabled: true },
    { name: 'dst', desc: 'Destination', enabled: true },
    { name: 'gateway', desc: 'Gateway', enabled: true },
    { name: 'fragments', desc: 'Fragments', enabled: true },
    { name: 'fragment.id', desc: 'Fragment ID', enabled: true },
    { name: 'fragment.offset', desc: 'Fragment Offset', enabled: true },
    { name: 'fragment.flags', desc: 'Fragment Flags', enabled: true },
    { name: 'mru', desc: 'MRU', enabled: true },
    { name: 'ip.src', desc: 'IP Source', enabled: true },
    { name: 'ip.dst', desc: 'IP Destination', enabled: true },
    { name: 'nat', desc: 'NAT', enabled: true },
    { name: 'redirect', desc: 'Redirect', enabled: true },
    { name: 'unreachable', desc: 'Unreachable', enabled: true },
    { name: 'echo', desc: 'Echo', enabled: true },
  ],
  arp: [
    { name: 'opcode', desc: 'Operation Code', enabled: true },
    { name: 'sender.hw', desc: 'Sender Hardware Address', enabled: true },
    { name: 'sender.proto', desc: 'Sender Protocol Address', enabled: true },
    { name: 'target.hw', desc: 'Target Hardware Address', enabled: true },
    { name: 'target.proto', desc: 'Target Protocol Address', enabled: true },
    { name: 'request', desc: 'Request', enabled: true },
    { name: 'reply', desc: 'Reply', enabled: true },
    { name: 'gratuitous', desc: 'Gratuitous ARP', enabled: true },
    { name: 'probe', desc: 'Probe', enabled: true },
    { name: 'announcement', desc: 'Announcement', enabled: true },
    { name: 'conflict', desc: 'Conflict', enabled: true },
    { name: 'src', desc: 'Source', enabled: true },
    { name: 'dst', desc: 'Destination', enabled: true },
    { name: 'time', desc: 'Time', enabled: true },
    { name: 'vendor', desc: 'Vendor', enabled: true },
    { name: 'vlan', desc: 'VLAN', enabled: true },
    { name: 'mac', desc: 'MAC Address', enabled: true },
    { name: 'ip', desc: 'IP Address', enabled: true },
    { name: 'duplicate', desc: 'Duplicate', enabled: true },
    { name: 'stale', desc: 'Stale', enabled: true },
    { name: 'incomplete', desc: 'Incomplete', enabled: true },
    { name: 'static', desc: 'Static', enabled: true },
    { name: 'dynamic', desc: 'Dynamic', enabled: true },
    { name: 'persistent', desc: 'Persistent', enabled: true },
  ],
  snmp: [
    { name: 'version', desc: 'Version', enabled: true },
    { name: 'community', desc: 'Community', enabled: true },
    { name: 'request.id', desc: 'Request ID', enabled: true },
    { name: 'request.type', desc: 'Request Type', enabled: true },
    { name: 'error.status', desc: 'Error Status', enabled: true },
    { name: 'error.index', desc: 'Error Index', enabled: true },
    { name: 'oid', desc: 'OID', enabled: true },
    { name: 'value', desc: 'Value', enabled: true },
    { name: 'type', desc: 'Type', enabled: true },
    { name: 'trap', desc: 'Trap', enabled: true },
    { name: 'inform', desc: 'Inform', enabled: true },
    { name: 'get', desc: 'Get Request', enabled: true },
    { name: 'getnext', desc: 'GetNext Request', enabled: true },
    { name: 'response', desc: 'Response', enabled: true },
    { name: 'set', desc: 'Set Request', enabled: true },
    { name: 'v1', desc: 'SNMPv1', enabled: true },
    { name: 'v2c', desc: 'SNMPv2c', enabled: true },
    { name: 'v3', desc: 'SNMPv3', enabled: true },
    { name: 'auth', desc: 'Authentication', enabled: true },
    { name: 'priv', desc: 'Privacy', enabled: true },
    { name: 'engine.id', desc: 'Engine ID', enabled: true },
    { name: 'engine.time', desc: 'Engine Time', enabled: true },
    { name: 'sysName', desc: 'System Name', enabled: true },
    { name: 'sysUpTime', desc: 'System Up Time', enabled: true },
  ],
  pgsql: [
    { name: 'query', desc: 'Query', enabled: true },
    { name: 'table.name', desc: 'Table Name', enabled: true },
    { name: 'schema', desc: 'Schema', enabled: true },
    { name: 'user.name', desc: 'User Name', enabled: true },
    { name: 'database', desc: 'Database', enabled: true },
    { name: 'host', desc: 'Host', enabled: true },
    { name: 'port', desc: 'Port', enabled: true },
    { name: 'row.count', desc: 'Row Count', enabled: true },
    { name: 'affected.rows', desc: 'Affected Rows', enabled: true },
    { name: 'error.code', desc: 'Error Code', enabled: true },
    { name: 'error.message', desc: 'Error Message', enabled: true },
    { name: 'time', desc: 'Time', enabled: true },
    { name: 'response.time', desc: 'Response Time', enabled: true },
    { name: 'transaction.id', desc: 'Transaction ID', enabled: true },
    { name: 'command', desc: 'Command', enabled: true },
    { name: 'type', desc: 'Type', enabled: true },
    { name: 'encoding', desc: 'Encoding', enabled: true },
    { name: 'client', desc: 'Client', enabled: true },
    { name: 'server', desc: 'Server', enabled: true },
    { name: 'param', desc: 'Parameter', enabled: true },
    { name: 'value', desc: 'Value', enabled: true },
    { name: 'result', desc: 'Result', enabled: true },
    { name: 'notice', desc: 'Notice', enabled: true },
    { name: 'warning', desc: 'Warning', enabled: true },
    { name: 'bind', desc: 'Bind', enabled: true },
  ],
  mssql: [
    { name: 'query', desc: 'Query', enabled: true },
    { name: 'procedure', desc: 'Stored Procedure', enabled: true },
    { name: 'table.name', desc: 'Table Name', enabled: true },
    { name: 'database', desc: 'Database', enabled: true },
    { name: 'user.name', desc: 'User Name', enabled: true },
    { name: 'host', desc: 'Host', enabled: true },
    { name: 'login', desc: 'Login', enabled: true },
    { name: 'auth.scheme', desc: 'Authentication Scheme', enabled: true },
    { name: 'row.count', desc: 'Row Count', enabled: true },
    { name: 'affected.rows', desc: 'Affected Rows', enabled: true },
    { name: 'error.code', desc: 'Error Code', enabled: true },
    { name: 'error.message', desc: 'Error Message', enabled: true },
    { name: 'time', desc: 'Time', enabled: true },
    { name: 'response.time', desc: 'Response Time', enabled: true },
    { name: 'transaction.id', desc: 'Transaction ID', enabled: true },
    { name: 'command', desc: 'Command', enabled: true },
    { name: 'spid', desc: 'SPID', enabled: true },
    { name: 'batch', desc: 'Batch', enabled: true },
    { name: 'rpc', desc: 'RPC', enabled: true },
    { name: 'isolation', desc: 'Isolation Level', enabled: true },
    { name: 'application', desc: 'Application', enabled: true },
    { name: 'client', desc: 'Client', enabled: true },
    { name: 'param', desc: 'Parameter', enabled: true },
    { name: 'value', desc: 'Value', enabled: true },
  ],
  radius: [
    { name: 'code', desc: 'Code', enabled: true },
    { name: 'identifier', desc: 'Identifier', enabled: true },
    { name: 'authenticator', desc: 'Authenticator', enabled: true },
    { name: 'attributes', desc: 'Attributes', enabled: true },
    { name: 'user.name', desc: 'User Name', enabled: true },
    { name: 'password', desc: 'Password', enabled: true },
    { name: 'nas.ip', desc: 'NAS IP', enabled: true },
    { name: 'nas.port', desc: 'NAS Port', enabled: true },
    { name: 'nas.id', desc: 'NAS ID', enabled: true },
    { name: 'service.type', desc: 'Service Type', enabled: true },
    { name: 'framed.protocol', desc: 'Framed Protocol', enabled: true },
    { name: 'framed.ip', desc: 'Framed IP', enabled: true },
    { name: 'framed.mask', desc: 'Framed Mask', enabled: true },
    { name: 'framed.mtu', desc: 'Framed MTU', enabled: true },
    { name: 'session.id', desc: 'Session ID', enabled: true },
    { name: 'session.timeout', desc: 'Session Timeout', enabled: true },
    { name: 'idle.timeout', desc: 'Idle Timeout', enabled: true },
    { name: 'calling.station.id', desc: 'Calling Station ID', enabled: true },
    { name: 'called.station.id', desc: 'Called Station ID', enabled: true },
    { name: 'acct.status.type', desc: 'Acct Status Type', enabled: true },
    { name: 'acct.session.id', desc: 'Acct Session ID', enabled: true },
    { name: 'acct.input.octets', desc: 'Acct Input Octets', enabled: true },
    { name: 'acct.output.octets', desc: 'Acct Output Octets', enabled: true },
    { name: 'reply.message', desc: 'Reply Message', enabled: true },
  ],
  telnet: [
    { name: 'command', desc: 'Command', enabled: true },
    { name: 'data', desc: 'Data', enabled: true },
    { name: 'option', desc: 'Option', enabled: true },
    { name: 'suboption', desc: 'Suboption', enabled: true },
    { name: 'will', desc: 'WILL', enabled: true },
    { name: 'wont', desc: 'WONT', enabled: true },
    { name: 'do', desc: 'DO', enabled: true },
    { name: 'dont', desc: 'DONT', enabled: true },
    { name: 'iac', desc: 'IAC', enabled: true },
    { name: 'sb', desc: 'SB', enabled: true },
    { name: 'se', desc: 'SE', enabled: true },
    { name: 'echo', desc: 'Echo', enabled: true },
    { name: 'sga', desc: 'Suppress Go Ahead', enabled: true },
    { name: 'ttype', desc: 'Terminal Type', enabled: true },
    { name: 'naws', desc: 'Window Size', enabled: true },
    { name: 'tspeed', desc: 'Terminal Speed', enabled: true },
    { name: 'xdisp', desc: 'X Display Location', enabled: true },
    { name: 'environment', desc: 'Environment Variables', enabled: true },
    { name: 'user', desc: 'User', enabled: true },
    { name: 'password', desc: 'Password', enabled: true },
    { name: 'login', desc: 'Login', enabled: true },
    { name: 'prompt', desc: 'Prompt', enabled: true },
    { name: 'response', desc: 'Response', enabled: true },
    { name: 'time', desc: 'Time', enabled: true },
  ],
}

// 为每个协议深拷贝数据，避免引用问题
const protoData = reactive<Record<string, Attr[]>>({})
for (const key in allData) {
  protoData[key] = allData[key].map(a => ({ ...a }))
}

// ══════════════════════════════════════════════════════════════
// 表格筛选与分页
// ═══════════════════════════════════════════════════════════
const statusFilter = ref('all')
const keyword = ref('')
const page = ref(1)
const pageSize = ref(100)

function doSearch() { page.value = 1 }
function doReset() {
  statusFilter.value = 'all'
  keyword.value = ''
  page.value = 1
}

const filteredRows = computed(() => {
  return (protoData[activeProto.value] || []).filter(r => {
    if (statusFilter.value === 'on' && !r.enabled) return false
    if (statusFilter.value === 'off' && r.enabled) return false
    if (keyword.value) {
      const k = keyword.value.toLowerCase()
      if (!r.name.toLowerCase().includes(k) && !r.desc.toLowerCase().includes(k)) return false
    }
    return true
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / pageSize.value)))
const pageArr = computed(() => {
  const t = totalPages.value
  if (t <= 5) return Array.from({ length: t }, (_, i) => i + 1)
  const arr: number[] = []
  const cur = page.value
  if (cur <= 3) arr.push(1, 2, 3, 4, 5)
  else if (cur >= t - 2) arr.push(t - 4, t - 3, t - 2, t - 1, t)
  else arr.push(cur - 2, cur - 1, cur, cur + 1, cur + 2)
  return arr
})
const pagedRows = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredRows.value.slice(start, start + pageSize.value)
})

// 切换协议时重置分页
function switchProto(key: string) {
  activeProto.value = key
  page.value = 1
}

// ══════════════════════════════════════════════════════════════
// 编辑弹窗
// ═══════════════════════════════════════════════════════════
const editVisible = ref(false)
const editForm = reactive({ name: '', desc: '', enabled: true })
let editOrigName = ''

function editRow(r: Attr) {
  editOrigName = r.name
  Object.assign(editForm, { name: r.name, desc: r.desc, enabled: r.enabled })
  editVisible.value = true
}

function submitEdit() {
  const list = protoData[activeProto.value]
  const r = list.find(x => x.name === editOrigName)
  if (r) {
    r.name = editForm.name
    r.desc = editForm.desc
    r.enabled = editForm.enabled
  }
  ElMessage.success('已保存（Mock）')
  editVisible.value = false
}

function delRow(r: Attr) {
  ElMessageBox.confirm(`确定删除属性 ${r.name} 吗？`, '提示', { type: 'warning' })
    .then(() => {
      const list = protoData[activeProto.value]
      const i = list.findIndex(x => x.name === r.name)
      if (i > -1) list.splice(i, 1)
      ElMessage.success('已删除（Mock）')
    }).catch(() => {})
}
</script>

<style scoped>
.nv-border-card { display:flex; flex-direction:column; height:100%; min-height:0; border:1px solid #e4e7ed; border-radius:4px; background:#fff; overflow:hidden; }
.nv-tabs-header { flex-shrink:0; padding:0 16px; border-bottom:1px solid #e4e7ed; background:#fafafa; }
.nv-tabs-nav { display:flex; }
.nv-tab { position:relative; padding:12px 20px; border:none; background:transparent; font-size:14px; font-weight:600; color:#606266; cursor:pointer; }
.nv-tab.active { color:#409eff; }
.nv-tab.active::after { content:''; position:absolute; bottom:0; left:20px; right:20px; height:2px; background:#409eff; }
.nv-tabs-body { flex:1; min-height:0; overflow:hidden; }

.om-md-page { display:flex; height:100%; }
.om-md-sidebar { width:200px; min-width:200px; border-right:1px solid #ebeef5; background:#fafbfc; display:flex; flex-direction:column; flex-shrink:0; }
.om-md-tree-head { padding:10px 14px; border-bottom:1px solid #ebeef5; font-weight:600; font-size:13px; color:#303133; }
.om-md-tree-list { list-style:none; margin:0; padding:6px 0; overflow-y:auto; flex:1; }
.om-md-tree-item { display:flex; align-items:center; gap:6px; padding:7px 14px; cursor:pointer; font-size:13px; color:#606266; user-select:none; }
.om-md-tree-item:hover { background:#ecf5ff; }
.om-md-tree-group { font-weight:500; color:#303133; }
.om-md-tree-group.open { color:#409eff; }
.om-md-tree-toggle { width:14px; font-size:12px; color:#909399; }
.om-md-tree-icon { font-size:12px; width:14px; text-align:center; }
.om-md-tree-leaf { padding-left:32px; }
.om-md-tree-leaf.active { background:#ecf5ff; color:#409eff; font-weight:600; }
.om-md-tree-leaf.active .om-md-tree-icon { color:#409eff; }
.om-md-tree-children { list-style:none; margin:0; padding:0; }

.om-md-main { flex:1; min-width:0; display:flex; flex-direction:column; }
.om-md-toolbar { display:flex; align-items:center; gap:10px; padding:10px 14px; border-bottom:1px solid #ebeef5; flex-wrap:wrap; }

.ou-table-wrap { flex:1; overflow:auto; }
.ou-table { width:100%; border-collapse:collapse; font-size:12px; }
.ou-table th { background:#fafbfc; border-bottom:1px solid #ebeef5; padding:8px 10px; text-align:left; font-weight:600; color:#606266; white-space:nowrap; }
.ou-table td { border-bottom:1px solid #f0f2f5; padding:7px 10px; color:#303133; }
.ou-empty { text-align:center; color:#909399; padding:24px 10px !important; }

.col-idx { width:60px; text-align:center; }
.col-name { min-width:200px; }
.col-desc { min-width:200px; }
.col-enable { white-space:nowrap; }

.ou-footer { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; border-top:1px solid #ebeef5; font-size:12px; color:#606266; flex-wrap:wrap; gap:8px; }
.ou-footer-left, .ou-footer-right { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.ou-pager { display:flex; gap:4px; }
.ou-page-btn { min-width:28px; height:28px; border:1px solid #dcdfe6; border-radius:4px; background:#fff; font-size:12px; cursor:pointer; }
.ou-page-btn.active { background:#409eff; color:#fff; border-color:#409eff; }
.ou-page-btn:disabled { opacity:.55; cursor:not-allowed; }

.ou-search-btn { height:30px; padding:0 14px; border:1px solid #409eff; border-radius:4px; background:#409eff; color:#fff; font-size:13px; cursor:pointer; display:inline-flex; align-items:center; }
.secondary { height:30px; padding:0 14px; border:1px solid #dcdfe6; border-radius:4px; background:#fff; color:#606266; font-size:13px; cursor:pointer; }
.link-btn { border:none; background:transparent; color:#409eff; font-size:13px; cursor:pointer; padding:4px 6px; }
.ou-toolbar-label { font-size:13px; color:#606266; white-space:nowrap; }

/* 编辑弹窗 */
.om-md-form { padding:4px 4px; }
.om-md-row { display:flex; align-items:center; gap:14px; padding:8px 0; }
.om-md-lbl { width:80px; text-align:right; color:#606266; font-size:13px; flex-shrink:0; }
.om-md-ctrl { flex:1; }
</style>
