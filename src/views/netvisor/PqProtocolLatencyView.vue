<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav" role="tablist" aria-label="协议时延">
        <button type="button" class="nv-tab active" role="tab">协议时延</button>
      </div>
    </div>
    <div class="nv-tabs-body">
      <div class="pqpl-page">
        <aside class="pqpl-sidebar">
          <div class="pqpl-tree-head"><span class="pqpl-tree-title">应用协议</span></div>
          <ul class="pqpl-tree-list">
            <li class="pqpl-tree-item pqpl-tree-leaf active"><span class="pqpl-tree-label">任意协议</span></li>
            <li class="pqpl-tree-item pqpl-tree-leaf"><span class="pqpl-tree-label">未知应用</span></li>
            <li v-for="g in treeGroups" :key="g.name" class="pqpl-tree-item pqpl-tree-group" :class="{ expanded: g.open }">
              <span class="pqpl-tree-toggle-icon" @click="g.open = !g.open">{{ g.open ? '−' : '+' }}</span>
              <span class="pqpl-tree-label">{{ g.name }}</span>
              <ul v-show="g.open" class="pqpl-tree-children">
                <li v-for="c in g.children" :key="c" class="pqpl-tree-item pqpl-tree-leaf"><span class="pqpl-tree-label">{{ c }}</span></li>
              </ul>
            </li>
          </ul>
        </aside>
        <div class="pqpl-main">
          <div class="pqpl-filters">
            <label class="pqpl-field"><span class="ou-toolbar-label">自动刷新</span><select class="ou-toolbar-select" disabled><option value="10000" selected>10 秒</option></select></label>
            <label class="pqpl-field"><span class="ou-toolbar-label">应用协议</span><select class="ou-toolbar-select" disabled><option selected>任意协议</option></select></label>
            <label class="pqpl-field"><span class="ou-toolbar-label">平均时延&gt;=</span><input class="ou-toolbar-input" type="text" value="0" disabled /><span class="pqpl-unit">ms</span></label>
            <label class="pqpl-field"><span class="ou-toolbar-label">关键字搜索</span><input class="ou-toolbar-input" type="text" disabled /></label>
            <button type="button" class="ou-search-btn" disabled>搜索</button>
            <button type="button" class="secondary td-reset-btn" disabled>重置</button>
          </div>
          <div class="ou-table-wrap">
            <table class="ou-table">
              <thead><tr><th>序号</th><th>应用名称</th><th>最大时延</th><th>最小时延</th><th>客户时延</th><th>服务时延</th><th>应用时延</th><th>平均时延</th><th>当前在线</th><th>最近新建连</th><th>失败率</th><th>下行速率</th><th>上行速率</th></tr></thead>
              <tbody>
                <tr v-for="r in tableData" :key="r.idx"><td>{{ r.idx }}</td><td>{{ r.name }}</td><td class="ou-num">{{ r.maxLat }}</td><td class="ou-num">{{ r.minLat }}</td><td class="ou-num">{{ r.clientLat }}</td><td class="ou-num">{{ r.serverLat }}</td><td class="ou-num">{{ r.appLat }}</td><td class="ou-num">{{ r.avgLat }}</td><td class="ou-num">{{ r.online }}</td><td class="ou-num">{{ r.newConn }}</td><td class="ou-num">{{ r.failRate }}</td><td class="ou-num">{{ r.downRate }}</td><td class="ou-num">{{ r.upRate }}</td></tr>
              </tbody>
            </table>
          </div>
          <div class="ou-footer"><div class="ou-pager"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn active" disabled>1</button><button type="button" class="ou-page-btn" disabled>2</button><button type="button" class="ou-page-btn" disabled>›</button></div><span class="ou-total">共 12 条</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const treeGroups = reactive([
  { name: 'HTTP协议', open: true, children: ['HTTP下载', 'HTTP上传', 'HTTPDNS', 'HTTP代理', '常用网站', 'Web视频', 'WEB音乐', 'WebMail'] },
  { name: '常用协议', open: false, children: ['DNS', 'SSH', 'FTP', 'SMTP', 'POP3', 'IMAP', 'Telnet', 'RDP', 'ICMP', 'NTP'] },
  { name: 'P2P下载', open: false, children: ['BitTorrent', 'eMule', '迅雷下载', '百度网盘'] },
  { name: '社交', open: false, children: ['微信', 'QQ', '企业微信', '钉钉', '微博'] },
  { name: '流媒体', open: false, children: ['抖音', '快手', 'B站', '爱奇艺', '腾讯视频'] },
  { name: '金融财经', open: false, children: ['支付宝', '微信支付', '同花顺'] },
  { name: '商业系统', open: false, children: ['MySQL', 'PostgreSQL', 'Redis', 'MongoDB', 'Oracle'] },
  { name: '网络游戏', open: false, children: ['英雄联盟', '王者荣耀', '原神'] },
  { name: '其它', open: false, children: ['其它HTTPS', '其它TCP', '其它UDP', 'RTMP'] },
])

const tableData = [
  { idx:1, name:'SYN_ACK', maxLat:'1246.757', minLat:'0.030', clientLat:'52.786', serverLat:'18.998', appLat:'71.776', avgLat:'71.793', online:'42864', newConn:'1286', failRate:'92.18%', downRate:'3.30 M', upRate:'1.28 M' },
  { idx:2, name:'其它HTTPS', maxLat:'986.420', minLat:'0.042', clientLat:'48.642', serverLat:'22.186', appLat:'68.428', avgLat:'83.712', online:'28642', newConn:'864', failRate:'47.86%', downRate:'18.42 M', upRate:'6.28 M' },
  { idx:3, name:'WWW', maxLat:'842.186', minLat:'0.028', clientLat:'86.428', serverLat:'32.642', appLat:'118.864', avgLat:'136.413', online:'18642', newConn:'642', failRate:'12.42%', downRate:'8.64 M', upRate:'2.86 M' },
  { idx:4, name:'DNS', maxLat:'428.642', minLat:'0.018', clientLat:'28.642', serverLat:'18.428', appLat:'42.186', avgLat:'62.184', online:'12864', newConn:'428', failRate:'8.64%', downRate:'2.18 M', upRate:'864 K' },
  { idx:5, name:'Redis', maxLat:'286.428', minLat:'0.024', clientLat:'18.642', serverLat:'12.428', appLat:'28.864', avgLat:'48.642', online:'8642', newConn:'286', failRate:'2.18%', downRate:'1.28 M', upRate:'428 K' },
  { idx:6, name:'MySQL', maxLat:'642.186', minLat:'0.036', clientLat:'42.864', serverLat:'28.642', appLat:'68.428', avgLat:'98.642', online:'6428', newConn:'186', failRate:'4.28%', downRate:'4.28 M', upRate:'1.86 M' },
  { idx:7, name:'PostgreSQL', maxLat:'528.642', minLat:'0.032', clientLat:'38.428', serverLat:'24.186', appLat:'58.642', avgLat:'86.428', online:'4286', newConn:'128', failRate:'3.86%', downRate:'2.86 M', upRate:'986 K' },
  { idx:8, name:'FTP', maxLat:'386.428', minLat:'0.028', clientLat:'28.186', serverLat:'18.642', appLat:'42.864', avgLat:'72.186', online:'2864', newConn:'86', failRate:'6.42%', downRate:'6.42 M', upRate:'1.28 M' },
]
</script>

<style scoped>
.nv-border-card { display:flex; flex-direction:column; height:100%; min-height:0; border:1px solid #e4e7ed; border-radius:4px; background:#fff; overflow:hidden; }
.nv-tabs-header { flex-shrink:0; padding:0 16px; border-bottom:1px solid #e4e7ed; background:#fafafa; }
.nv-tabs-nav { display:flex; }
.nv-tab { position:relative; padding:12px 20px; border:none; background:transparent; font-size:14px; font-weight:600; color:#606266; cursor:pointer; }
.nv-tab.active { color:#409eff; }
.nv-tab.active::after { content:''; position:absolute; bottom:0; left:20px; right:20px; height:2px; background:#409eff; }
.nv-tabs-body { flex:1; min-height:0; overflow:hidden; }

.pqpl-page { display:flex; height:100%; }
.pqpl-sidebar { width:220px; min-width:220px; border-right:1px solid #ebeef5; overflow-y:auto; padding:10px 0; font-size:13px; }
.pqpl-tree-head { padding:6px 14px; font-weight:600; color:#303133; border-bottom:1px solid #ebeef5; margin-bottom:6px; }
.pqpl-tree-list { list-style:none; padding:0; margin:0; }
.pqpl-tree-item { padding:4px 14px; cursor:pointer; color:#606266; }
.pqpl-tree-item.active { background:#ecf5ff; color:#409eff; }
.pqpl-tree-group { padding:4px 14px; }
.pqpl-tree-toggle-icon { display:inline-block; width:16px; cursor:pointer; color:#909399; }
.pqpl-tree-label { font-size:13px; }
.pqpl-tree-children { list-style:none; padding-left:20px; margin:0; }

.pqpl-main { flex:1; min-width:0; display:flex; flex-direction:column; overflow:auto; }
.pqpl-filters { display:flex; align-items:center; gap:10px; padding:10px 14px; border-bottom:1px solid #ebeef5; flex-wrap:wrap; }
.pqpl-field { display:flex; align-items:center; gap:4px; }
.pqpl-unit { font-size:12px; color:#909399; }
.ou-toolbar-label { font-size:13px; color:#606266; white-space:nowrap; }
.ou-toolbar-select { height:28px; padding:0 8px; border:1px solid #dcdfe6; border-radius:4px; font-size:13px; background:#fff; }
.ou-toolbar-input { height:28px; padding:0 8px; border:1px solid #dcdfe6; border-radius:4px; font-size:13px; width:80px; }
.ou-search-btn { height:30px; padding:0 14px; border:1px solid #409eff; border-radius:4px; background:#409eff; color:#fff; font-size:13px; cursor:pointer; }
.ou-search-btn:disabled { opacity:.55; cursor:not-allowed; }
.secondary { height:30px; padding:0 14px; border:1px solid #dcdfe6; border-radius:4px; background:#fff; color:#606266; font-size:13px; cursor:pointer; }
.secondary:disabled { opacity:.55; cursor:not-allowed; }

.ou-table-wrap { flex:1; overflow:auto; padding:0 14px; }
.ou-table { width:100%; border-collapse:collapse; font-size:12px; white-space:nowrap; }
.ou-table th { background:#fafbfc; border-bottom:1px solid #ebeef5; padding:8px 10px; text-align:left; font-weight:600; color:#606266; position:sticky; top:0; }
.ou-table td { border-bottom:1px solid #f0f2f5; padding:7px 10px; color:#303133; }
.ou-num { text-align:right; font-variant-numeric:tabular-nums; }
.ou-footer { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; border-top:1px solid #ebeef5; font-size:12px; color:#606266; }
.ou-pager { display:flex; gap:4px; }
.ou-page-btn { min-width:28px; height:28px; border:1px solid #dcdfe6; border-radius:4px; background:#fff; font-size:12px; cursor:pointer; }
.ou-page-btn.active { background:#409eff; color:#fff; border-color:#409eff; }
.ou-page-btn:disabled { opacity:.55; cursor:not-allowed; }
.ou-total { color:#909399; }
</style>
