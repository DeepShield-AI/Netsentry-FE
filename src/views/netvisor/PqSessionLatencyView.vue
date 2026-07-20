<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav" role="tablist" aria-label="会话时延">
        <button type="button" class="nv-tab active" role="tab" aria-selected="true">会话时延</button>
      </div>
    </div>
    <div class="nv-tabs-body">
      <div class="tid-page pqsl-page">
        <!-- ============ 工具栏 ============ -->
        <div class="tdh-filters">
          <div class="tdh-filter-row">
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">源IP</span>
              <el-select v-model="srcIpType" size="small" style="width:90px" clearable>
                <el-option label="任意IP" value="" />
                <el-option label="等于" value="eq" />
                <el-option label="不属于" value="nin" />
              </el-select>
              <el-input v-model="srcIpValue" placeholder="任意IP" size="small" style="width:160px" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">过滤源</span>
              <el-select v-model="filterSrc" size="small" style="width:90px" clearable>
                <el-option label="否" :value="false" />
                <el-option label="是" :value="true" />
              </el-select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">源端口</span>
              <el-input v-model="srcPort" placeholder="80 / 8000-8080" size="small" style="width:160px" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">目标IP</span>
              <el-select v-model="dstIpType" size="small" style="width:90px" clearable>
                <el-option label="任意IP" value="" />
                <el-option label="等于" value="eq" />
              </el-select>
              <el-input v-model="dstIpValue" placeholder="任意IP" size="small" style="width:160px" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">过滤目标</span>
              <el-select v-model="filterDst" size="small" style="width:90px" clearable>
                <el-option label="否" :value="false" />
                <el-option label="是" :value="true" />
              </el-select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">目标端口</span>
              <el-input v-model="dstPort" placeholder="80 / 8000-8080" size="small" style="width:160px" />
            </label>
            <div class="tio-range-btns">
              <button class="tio-range-btn" :class="{ active: ipFamily === 'ipv4' }" @click="ipFamily = 'ipv4'">IPv4</button>
              <button class="tio-range-btn" :class="{ active: ipFamily === 'ipv6' }" @click="ipFamily = 'ipv6'">IPv6</button>
            </div>
          </div>

          <div class="tdh-filter-row">
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">MAC</span>
              <el-input v-model="mac" size="small" style="width:200px" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">域名</span>
              <el-select v-model="domainType" size="small" style="width:90px" clearable>
                <el-option label="任意" value="" />
                <el-option label="等于" value="eq" />
                <el-option label="不属于" value="nin" />
              </el-select>
              <el-input v-model="domainValue" size="small" style="width:160px" />
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">应用协议</span>
              <el-select v-model="appProto" size="small" style="width:160px" clearable>
                <el-option label="任意协议" value="" />
                <el-option label="HTTP" value="HTTP" />
                <el-option label="HTTPS" value="HTTPS" />
                <el-option label="DNS" value="DNS" />
                <el-option label="ICMP" value="ICMP" />
                <el-option label="SSH" value="SSH" />
                <el-option label="FTP" value="FTP" />
                <el-option label="SMTP" value="SMTP" />
                <el-option label="TELNET" value="TELNET" />
              </el-select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">客户时延&gt;=</span>
              <el-input-number v-model="clientLatency" :min="0" :step="10" size="small" style="width:90px" controls-position="right" />
              <span class="pq-unit">ms</span>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">服务时延&gt;=</span>
              <el-input-number v-model="serverLatency" :min="0" :step="10" size="small" style="width:90px" controls-position="right" />
              <span class="pq-unit">ms</span>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">应用时延&gt;=</span>
              <el-input-number v-model="appLatency" :min="0" :step="10" size="small" style="width:90px" controls-position="right" />
              <span class="pq-unit">ms</span>
            </label>
          </div>

          <div class="tdh-filter-row">
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">传输协议</span>
              <el-select v-model="transport" size="small" style="width:120px" clearable>
                <el-option label="任意" value="" />
                <el-option label="TCP" value="TCP" />
                <el-option label="UDP" value="UDP" />
                <el-option label="ICMP" value="ICMP" />
              </el-select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">连接类型</span>
              <el-select v-model="linkType" size="small" style="width:120px" clearable>
                <el-option label="所有" value="" />
                <el-option label="长连接" value="long" />
                <el-option label="短连接" value="short" />
              </el-select>
            </label>
            <label class="tdh-filter-field">
              <span class="ou-toolbar-label">条件关系</span>
              <el-select v-model="condRelation" size="small" style="width:100px" clearable>
                <el-option label="与" value="and" />
                <el-option label="或" value="or" />
              </el-select>
            </label>
            <label class="tdh-filter-field tdh-filter-time">
              <span class="ou-toolbar-label">时间范围</span>
              <el-date-picker
                v-model="dateRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                size="small"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width:340px"
              />
            </label>
            <button class="ou-search-btn" @click="doSearch"><el-icon><Search /></el-icon>&nbsp;搜索</button>
            <button class="secondary td-reset-btn" @click="doReset">重置</button>
            <button class="secondary" @click="showMore = !showMore">更多条件 {{ showMore ? '▴' : '▾' }}</button>
            <button class="link-btn" @click="doExport" style="margin-left:auto">⬇ 导出</button>
          </div>
        </div>

        <!-- ============ 表格顶部操作 ============ -->
        <div class="td-toolbar-actions pqsl-toolbar">
          <button class="td-icon-btn" title="播放" @click="doPlay"><el-icon><VideoPlay /></el-icon></button>
          <button class="td-icon-btn" title="导出" @click="doExport"><el-icon><Download /></el-icon></button>
          <button class="td-icon-btn" title="刷新" @click="doRefresh"><el-icon><Refresh /></el-icon></button>
          <button class="td-icon-btn" title="列设置" @click="columnDrawer = true"><el-icon><Setting /></el-icon></button>
        </div>

        <!-- ============ 表格 ============ -->
        <div class="ou-table-wrap pqsl-table-wrap">
          <table class="ou-table pqsl-table">
            <thead>
              <tr>
                <th class="col-check"><el-checkbox v-model="selectAll" @change="onSelectAll" /></th>
                <th v-for="c in visibleColumns" :key="c.key">
                  {{ c.label }}
                  <el-icon class="sort-icon"><Sort /></el-icon>
                </th>
                <th class="col-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, i) in pagedRows" :key="i">
                <td><el-checkbox v-model="r.checked" /></td>
                <td v-for="c in visibleColumns" :key="c.key">
                  <template v-if="c.key === 'srcIp' || c.key === 'dstIp'">
                    <span class="tid-link" @click="openIpDetail(r[c.key])">{{ r[c.key] }}</span>
                  </template>
                  <template v-else-if="c.key === 'clientLatency' || c.key === 'serverLatency' || c.key === 'appLatency'">
                    <span class="pq-latency-badge" :class="{ 'pq-latency-good': r[c.key] !== '-' && Number(r[c.key]) < 100 }">{{ r[c.key] }}</span>
                  </template>
                  <template v-else-if="c.key === 'trigger'">
                    <span v-if="r[c.key]" class="pkt-bad-badge">无应答/超时</span>
                    <span v-else style="color:#909399">—</span>
                  </template>
                  <template v-else-if="c.key === 'protocolLocation'">
                    <el-icon class="geo-flag" :color="getGeoColor(r[c.key])"><LocationFilled /></el-icon>
                    <span>{{ r[c.key] }}</span>
                  </template>
                  <template v-else>{{ r[c.key] }}</template>
                </td>
                <td class="col-actions">
                  <button class="link-btn" @click="openPacket(r)">数据包</button>
                </td>
              </tr>
              <tr v-if="pagedRows.length === 0">
                <td :colspan="visibleColumns.length + 2" class="ou-empty">无数据</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ============ 分页 ============ -->
        <div class="ou-footer">
          <div class="ou-footer-left">
            <div class="ou-pager">
              <button class="ou-page-btn" :disabled="page <= 1" @click="page > 1 && page--">‹</button>
              <button v-for="pg in pageArr" :key="pg" class="ou-page-btn" :class="{ active: pg === page }" @click="page = pg">{{ pg }}</button>
              <span v-if="totalPages > 5" class="ou-page-ellipsis">…</span>
              <button class="ou-page-btn" :disabled="page >= totalPages" @click="page < totalPages && page++">›</button>
            </div>
          </div>
          <div class="ou-footer-right">
            <label class="ou-page-goto">
              到第 <input class="ou-page-goto-input" v-model.number="gotoPage" /> 页
              <button class="ou-page-goto-btn" @click="goToPage">确定</button>
            </label>
            <span>共 {{ totalRows }} 条</span>
            <label class="ou-page-size">
              <el-select v-model="pageSize" size="small" style="width:110px">
                <el-option :value="20" label="20 条/页" />
                <el-option :value="50" label="50 条/页" />
                <el-option :value="100" label="100 条/页" />
              </el-select>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 列设置抽屉 ==================== -->
    <el-drawer v-model="columnDrawer" title="列设置" direction="rtl" size="320px">
      <div style="padding:0 16px">
        <div style="margin-bottom:8px;font-size:13px;color:#606266">勾选要显示的列</div>
        <el-checkbox-group v-model="columnChecked">
          <div v-for="c in allColumns" :key="c.key" style="padding:6px 0;border-bottom:1px solid #f0f2f5">
            <el-checkbox :value="c.key" :label="c.key">{{ c.label }}</el-checkbox>
          </div>
        </el-checkbox-group>
      </div>
    </el-drawer>

    <!-- ==================== 报文分析弹窗 ==================== -->
    <el-dialog v-model="packetVisible" width="98%" top="2vh" destroy-on-close class="pqsl-packet-dialog">
      <template #header>
        <div style="display:flex;align-items:center;justify-content:space-between;width:100%;padding-right:16px">
          <div style="display:flex;gap:18px">
            <span v-for="t in packetTabs" :key="t.key" class="pqsl-pkt-tab" :class="{ active: packetActiveTab === t.key }" @click="packetActiveTab = t.key">{{ t.label }}</span>
          </div>
          <div style="display:flex;align-items:center;gap:14px">
            <span style="font-size:13px;color:#606266">应用协议: <b style="color:#303133">{{ packetData.protocol }}</b></span>
            <button class="link-btn" @click="downloadPacket"><el-icon><Download /></el-icon>&nbsp;报文下载</button>
            <button class="link-btn" @click="downloadContent"><el-icon><Download /></el-icon>&nbsp;内容下载</button>
          </div>
        </div>
      </template>

      <!-- 报文解析 -->
      <div v-if="packetActiveTab === 'parse'">
        <div style="display:flex;gap:8px;margin-bottom:10px;align-items:center">
          <el-input v-model="packetFilterText" placeholder="报文显示过滤器" :prefix-icon="Search" style="flex:1" />
          <el-select v-model="packetTopN" size="small" style="width:120px">
            <el-option value="100" label="TOP 100" />
            <el-option value="200" label="TOP 200" />
            <el-option value="500" label="TOP 500" />
          </el-select>
        </div>
        <table class="ou-table pqsl-pkt-table">
          <thead>
            <tr>
              <th style="width:50px">序号 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th style="width:100px">时间 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th style="width:160px">源地址 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th style="width:160px">目标地址 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th style="width:100px">网络协议 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th style="width:80px">长度 <el-icon class="sort-icon"><Sort /></el-icon></th>
              <th>详情 <el-icon class="sort-icon"><Sort /></el-icon></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(pkt, i) in packetData.packets" :key="i" :style="{background: pktSelectedIdx === i ? '#e8f5e9' : 'transparent'}" @click="pktSelectedIdx = i; pktExpandedRow = i" style="cursor:pointer">
              <td>{{ i + 1 }}</td>
              <td>{{ pkt.time }}</td>
              <td>{{ pkt.src }}</td>
              <td>{{ pkt.dst }}</td>
              <td>{{ pkt.protocol }}</td>
              <td>{{ pkt.length }}</td>
              <td style="font-size:11px">{{ pkt.detail }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="pktExpandedRow >= 0" style="margin-top:10px;padding:8px 12px;background:#fff;border:1px solid #ebeef5;border-radius:4px;font-size:12px">
          <div v-for="(item, idx) in packetData.detailTree" :key="idx" style="margin-bottom:4px">
            <span class="pqsl-tree-toggle" @click="item.expanded = !item.expanded">{{ item.expanded ? '▼' : '▶' }}</span>
            <span style="margin-left:4px;color:#303133">{{ item.label }}</span>
            <div v-if="item.expanded" style="margin-left:20px;margin-top:4px">
              <div v-for="(sub, sIdx) in item.children" :key="sIdx" style="color:#606266;line-height:1.8">
                <span class="pqsl-tree-toggle" @click="sub.expanded = !sub.expanded">{{ sub.expanded ? '▼' : '▶' }}</span>
                <span style="margin-left:4px">{{ sub.label }}</span>
                <div v-if="sub.expanded && sub.detail" style="margin-left:20px;color:#909399;font-family:monospace;font-size:11px;white-space:pre">{{ sub.detail }}</div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="pktExpandedRow >= 0" style="margin-top:10px;background:#1e1e1e;color:#d4d4d4;padding:12px;border-radius:4px;font-family:monospace;font-size:12px;overflow-x:auto;line-height:1.6">
          <div v-for="(line, i) in packetData.hexDump" :key="i">{{ line }}</div>
        </div>
      </div>

      <!-- 报文交互 -->
      <div v-if="packetActiveTab === 'interaction'">
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:12px">
          <div style="padding:10px;background:#f5f7fa;border-radius:4px">
            <div style="color:#909399;font-size:12px">源IP</div>
            <div style="color:#303133;margin-top:4px;font-weight:500;font-size:13px">{{ packetData.packets[0]?.src || '-' }}</div>
          </div>
          <div style="padding:10px;background:#f5f7fa;border-radius:4px">
            <div style="color:#909399;font-size:12px">目标IP</div>
            <div style="color:#303133;margin-top:4px;font-weight:500;font-size:13px">{{ packetData.packets[0]?.dst || '-' }}</div>
          </div>
          <div style="padding:10px;background:#f5f7fa;border-radius:4px">
            <div style="color:#909399;font-size:12px">源端口</div>
            <div style="color:#303133;margin-top:4px;font-weight:500;font-size:13px">{{ packetData.srcPort }}</div>
          </div>
          <div style="padding:10px;background:#f5f7fa;border-radius:4px">
            <div style="color:#909399;font-size:12px">目标端口</div>
            <div style="color:#303133;margin-top:4px;font-weight:500;font-size:13px">{{ packetData.dstPort }}</div>
          </div>
        </div>
        <div style="margin-bottom:10px;font-size:13px;color:#303133;font-weight:500">交互过程</div>
        <div style="display:flex;gap:14px;margin-bottom:12px">
          <div style="flex:1">
            <div style="font-size:12px;color:#606266;margin-bottom:6px">Source</div>
            <div style="background:#1e1e1e;color:#d4d4d4;padding:12px;border-radius:4px;font-family:monospace;font-size:12px;overflow-x:auto;min-height:140px;line-height:1.6">
              <div v-for="(line, i) in interactionSourceBlocks" :key="i">{{ line }}</div>
            </div>
          </div>
          <div style="flex:1">
            <div style="font-size:12px;color:#606266;margin-bottom:6px">Destination</div>
            <div style="background:#1e1e1e;color:#d4d4d4;padding:12px;border-radius:4px;font-family:monospace;font-size:12px;overflow-x:auto;min-height:140px;line-height:1.6">
              <div v-for="(line, i) in interactionDstBlocks" :key="i">{{ line }}</div>
            </div>
          </div>
        </div>
        <div style="display:flex;justify-content:flex-end;align-items:center;gap:8px">
          <el-button size="small" :disabled="interactionPage <= 1" @click="interactionPage--">上一页</el-button>
          <span style="font-size:12px;color:#606266">{{ interactionPage }} / {{ interactionTotalPages }}</span>
          <el-button size="small" :disabled="interactionPage >= interactionTotalPages" @click="interactionPage++">下一页</el-button>
        </div>
      </div>

      <!-- 元数据 -->
      <div v-if="packetActiveTab === 'metadata'">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">
          <span style="font-size:13px;color:#606266">展示方式</span>
          <el-select v-model="metadataDisplayMode" size="small" style="width:120px">
            <el-option value="attr" label="按属性" />
            <el-option value="raw" label="原始" />
          </el-select>
        </div>
        <div v-if="metadataDisplayMode === 'attr'" class="pqsl-meta-table-wrap">
          <table class="ou-table" style="width:100%">
            <thead>
              <tr>
                <th style="width:30%">属性</th>
                <th>值</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(m, i) in metadataItems" :key="i">
                <td style="color:#606266">{{ m.key }}</td>
                <td style="font-family:monospace">{{ m.value }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else style="background:#1e1e1e;color:#d4d4d4;padding:14px;border-radius:4px;font-family:monospace;font-size:12px;line-height:1.6">
          <div v-for="(line, i) in metadataRaw" :key="i">{{ line }}</div>
        </div>
      </div>

      <!-- 报文播放 -->
      <div v-if="packetActiveTab === 'playback'">
        <div style="display:flex;gap:18px;align-items:center;margin-bottom:14px;flex-wrap:wrap;padding:10px;background:#f5f7fa;border-radius:4px">
          <label style="display:flex;align-items:center;gap:6px;font-size:13px;color:#606266">
            网卡
            <el-select v-model="playNic" size="small" style="width:160px">
              <el-option value="eth0" label="eth0" />
              <el-option value="lo" label="lo" />
              <el-option value="eth1" label="eth1" />
            </el-select>
          </label>
          <label style="display:flex;align-items:center;gap:6px;font-size:13px;color:#606266">
            播放次数
            <el-input-number v-model="playCount" :min="1" size="small" style="width:90px" controls-position="right" />
          </label>
          <label style="display:flex;align-items:center;gap:6px;font-size:13px;color:#606266">
            速度选择
            <el-select v-model="playSpeed" size="small" style="width:100px">
              <el-option value="0.5" label="0.5x" />
              <el-option value="1" label="1x" />
              <el-option value="2" label="2x" />
            </el-select>
          </label>
          <el-button type="primary" size="small" @click="startPacketPlayback"><el-icon><VideoPlay /></el-icon>&nbsp;开始播放</el-button>
          <el-button size="small" @click="stopPacketPlayback"><el-icon><VideoPause /></el-icon>&nbsp;停止</el-button>
        </div>
        <table class="ou-table">
          <thead>
            <tr>
              <th style="width:140px">时间</th>
              <th>源地址</th>
              <th>目标地址</th>
              <th style="width:100px">长度</th>
              <th style="width:120px">状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in playInfoItems" :key="i">
              <td>{{ item.time }}</td>
              <td>{{ item.src }}</td>
              <td>{{ item.dst }}</td>
              <td>{{ item.length }}</td>
              <td>
                <span :class="['pkt-status', `pkt-status-${item.statusType}`]">{{ item.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 时序图 -->
      <div v-if="packetActiveTab === 'timeline'">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
          <span style="font-size:13px;color:#606266">时间间隔阈值 (ms)</span>
          <el-input-number v-model="timeGapThreshold" :min="0" size="small" style="width:120px" controls-position="right" />
          <span style="font-size:12px;color:#909399">大于该阈值的相邻报文将以"时间跳跃"标记</span>
        </div>
        <table class="ou-table" style="margin-bottom:10px">
          <thead>
            <tr>
              <th style="width:50px">序号</th>
              <th style="width:140px">时间</th>
              <th>源</th>
              <th>目标</th>
              <th style="width:100px">协议</th>
              <th>信息</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in timelineData" :key="i">
              <td>{{ row.no }}</td>
              <td>{{ row.time }}</td>
              <td>{{ row.src }}</td>
              <td>{{ row.dst }}</td>
              <td>{{ row.protocol }}</td>
              <td>{{ row.info }}</td>
            </tr>
          </tbody>
        </table>
        <div style="margin-bottom:10px;padding:8px 12px;background:#fff;border:1px solid #ebeef5;border-radius:4px;font-size:12px">
          <div v-for="(node, idx) in timelineProtocolTree" :key="idx" style="margin-bottom:4px">
            <span class="pqsl-tree-toggle" @click="node.expanded = !node.expanded">{{ node.expanded ? '▼' : '▶' }}</span>
            <span style="margin-left:4px;color:#303133">{{ node.label }}</span>
            <div v-if="node.expanded" style="margin-left:20px;margin-top:4px">
              <div v-for="(child, cIdx) in node.children" :key="cIdx" style="color:#606266;line-height:1.8">
                <span class="pqsl-tree-toggle" @click="child.expanded = !child.expanded">{{ child.expanded ? '▼' : '▶' }}</span>
                <span style="margin-left:4px">{{ child.label }}</span>
              </div>
            </div>
          </div>
        </div>
        <div style="background:#1e1e1e;color:#d4d4d4;padding:12px;border-radius:4px;font-family:monospace;font-size:12px;overflow-x:auto;margin-bottom:10px;line-height:1.6">
          <div v-for="(line, i) in timelineHexDump" :key="i">{{ line }}</div>
        </div>
        <div style="display:flex;justify-content:flex-end;align-items:center;gap:8px">
          <el-button size="small" :disabled="timelinePage <= 1" @click="timelinePage--">上一页</el-button>
          <span style="font-size:12px;color:#606266">{{ timelinePage }}</span>
          <el-button size="small" @click="timelinePage++">下一页</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Sort, VideoPlay, VideoPause, Download, Refresh, Setting, LocationFilled } from '@element-plus/icons-vue'
import './nv-shared.css'

// ══════════════════════════════════════════════════════════════
// 工具栏
// ═══════════════════════════════════════════════════════════
const srcIpType = ref<string>('')
const srcIpValue = ref('')
const filterSrc = ref<boolean | ''>('')
const srcPort = ref('')
const dstIpType = ref<string>('')
const dstIpValue = ref('')
const filterDst = ref<boolean | ''>('')
const dstPort = ref('')
const ipFamily = ref<'ipv4' | 'ipv6'>('ipv4')
const mac = ref('')
const domainType = ref<string>('')
const domainValue = ref('')
const appProto = ref<string>('')
const clientLatency = ref<number>(0)
const serverLatency = ref<number>(0)
const appLatency = ref<number>(0)
const transport = ref<string>('')
const linkType = ref<string>('')
const condRelation = ref<string>('and')
const dateRange = ref<[string, string]>(['2026-07-16 15:38:39', '2026-07-16 15:53:39'])
const showMore = ref(false)

function doSearch() {
  page.value = 1
  ElMessage.success('搜索完成（Mock）')
}

function doReset() {
  srcIpType.value = ''
  srcIpValue.value = ''
  filterSrc.value = ''
  srcPort.value = ''
  dstIpType.value = ''
  dstIpValue.value = ''
  filterDst.value = ''
  dstPort.value = ''
  ipFamily.value = 'ipv4'
  mac.value = ''
  domainType.value = ''
  domainValue.value = ''
  appProto.value = ''
  clientLatency.value = 0
  serverLatency.value = 0
  appLatency.value = 0
  transport.value = ''
  linkType.value = ''
  condRelation.value = 'and'
  dateRange.value = ['2026-07-16 15:38:39', '2026-07-16 15:53:39']
}

function doPlay() { ElMessage.info('播放功能（Mock）') }
function doExport() { ElMessage.info('导出功能（Mock）') }
function doRefresh() { ElMessage.success('已刷新（Mock）') }

// ══════════════════════════════════════════════════════════════
// 表格
// ═══════════════════════════════════════════════════════════
interface SessionRow {
  checked: boolean
  linkTime: string
  mac: string
  macVendor: string
  userName: string
  srcIp: string
  dstIp: string
  protocolLocation: string
  transport: string
  terminalAddr: string
  protocolId: string
  seqPid: string
  trigger: boolean
  clientLatency: string
  serverLatency: string
  appLatency: string
  traffic: string
}

function buildRow(i: number): SessionRow {
  const baseSec = 49 - i
  const t = `2026-07-16 15:48:${baseSec.toString().padStart(2, '0')}`
  return {
    checked: false,
    linkTime: t,
    mac: '54-2b-de-6d-10-ae',
    macVendor: 'NewH3CTechno...',
    userName: 'NewH3CTechno...',
    srcIp: `123.235.38.7:${18963 - i * 3}`,
    dstIp: `101.6.9.17:${9409 - i * 5}`,
    protocolLocation: '中国|北京|BGP',
    transport: 'ICMP',
    terminalAddr: 'ICMP',
    protocolId: '34880',
    seqPid: '0',
    trigger: i === 1,
    clientLatency: '0.12',
    serverLatency: '0.18',
    appLatency: '0.24',
    traffic: `${(35 - i).toFixed(2)}MB`,
  }
}

const allRows: SessionRow[] = Array.from({ length: 30 }, (_, i) => buildRow(i))
const totalRows = ref(1313370)

const page = ref(1)
const pageSize = ref(20)
const gotoPage = ref(1)
const totalPages = computed(() => Math.max(1, Math.ceil(allRows.length / pageSize.value)))
const pageArr = computed(() => {
  const total = totalPages.value
  const cur = page.value
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  const arr: number[] = [1, 2, 3, 4, 5]
  return arr
})
const pagedRows = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return allRows.slice(start, start + pageSize.value)
})
function goToPage() {
  if (gotoPage.value >= 1 && gotoPage.value <= totalPages.value) page.value = gotoPage.value
}

const selectAll = ref(false)
function onSelectAll(v: boolean | string | number) {
  const checked = v === true
  allRows.forEach(r => r.checked = checked)
}

// 列设置
const allColumns = [
  { key: 'linkTime', label: '链路时间' },
  { key: 'mac', label: 'MAC' },
  { key: 'macVendor', label: 'MAC厂商' },
  { key: 'userName', label: '用户名称' },
  { key: 'srcIp', label: '源IP' },
  { key: 'dstIp', label: '目标IP' },
  { key: 'protocolLocation', label: '目标终端位置' },
  { key: 'transport', label: '传输协议' },
  { key: 'terminalAddr', label: '终端地址' },
  { key: 'protocolId', label: '协议ID' },
  { key: 'seqPid', label: 'SEQ/PID' },
  { key: 'trigger', label: '触发' },
  { key: 'clientLatency', label: '客户时延' },
  { key: 'serverLatency', label: '服务时延' },
  { key: 'appLatency', label: '应用时延' },
  { key: 'traffic', label: '流量' },
]
const columnChecked = ref<string[]>(allColumns.map(c => c.key))
const visibleColumns = computed(() => allColumns.filter(c => columnChecked.value.includes(c.key)))
const columnDrawer = ref(false)

function getGeoColor(location: string): string {
  if (location.includes('北京') || location.includes('上海')) return '#67c23a'
  if (location.includes('香港')) return '#409eff'
  if (location.includes('境外')) return '#f56c6c'
  return '#909399'
}

function openIpDetail(ip: string) {
  ElMessage.info(`查看IP详情：${ip}（Mock）`)
}

// ══════════════════════════════════════════════════════════════
// 报文分析弹窗
// ═══════════════════════════════════════════════════════════
interface PacketItem {
  time: string; src: string; dst: string; protocol: string; length: string; detail: string
}
interface PacketTreeItem {
  label: string; expanded: boolean; children?: PacketTreeItem[]; detail?: string
}

const packetVisible = ref(false)
const pktSelectedIdx = ref(0)
const pktExpandedRow = ref<number>(0)
const packetActiveTab = ref('parse')
const packetFilterText = ref('')
const packetTopN = ref('100')
const packetData = ref({
  protocol: 'ICMP',
  srcPort: '18963',
  dstPort: '9409',
  packets: [
    { time: '0.000000', src: '123.235.38.7', dst: '101.6.9.17', protocol: 'ICMP', length: '98', detail: 'echo (ping) request  id=0x0006, seq=0/0, ttl=52' },
    { time: '0.000095', src: '101.6.9.17', dst: '123.235.38.7', protocol: 'ICMP', length: '98', detail: 'echo (ping) reply  id=0x0006, seq=0/0, ttl=62 (request in 1)' },
    { time: '0.666599', src: '123.235.38.7', dst: '101.6.9.17', protocol: 'ICMP', length: '98', detail: 'echo (ping) request  id=0x0006, seq=1/256, ttl=52' },
    { time: '0.666789', src: '101.6.9.17', dst: '123.235.38.7', protocol: 'ICMP', length: '98', detail: 'echo (ping) reply  id=0x0006, seq=1/256, ttl=62 (request in 2)' },
    { time: '0.209114', src: '123.235.38.7', dst: '101.6.9.17', protocol: 'ICMP', length: '98', detail: 'echo (ping) request  id=0x0006, seq=8/768, ttl=52' },
    { time: '0.209209', src: '101.6.9.17', dst: '123.235.38.7', protocol: 'ICMP', length: '98', detail: 'echo (ping) reply  id=0x0006, seq=8/768, ttl=62 (request in 5)' },
  ] as PacketItem[],
  detailTree: [
    {
      label: 'Frame 1: 98 bytes on wire (784 bits), 98 bytes captured (784 bits)',
      expanded: true,
      children: [
        { label: 'Encapsulation type: Ethernet (1)', expanded: false },
        { label: 'Arrival Time: Jul 16, 2026 15:48:49.000000000', expanded: false },
      ] as PacketTreeItem[],
    },
    {
      label: 'Ethernet II, Src: 54:2b:de:6d:10:ae, Dst: 30:b9:9b:8d:90:01',
      expanded: true,
      detail: 'Destination: 30:b9:9b:8d:90:01\nSource: 54:2b:de:6d:10:ae\nType: IPv4 (0x0800)',
      children: [
        { label: 'Destination: 30:b9:9b:8d:90:01', expanded: false },
        { label: 'Source: 54:2b:de:6d:10:ae', expanded: false },
        { label: 'Type: IPv4 (0x0800)', expanded: false },
      ] as PacketTreeItem[],
    },
    {
      label: 'Internet Protocol Version 4, Src: 123.235.38.7, Dst: 101.6.9.17',
      expanded: true,
      detail: '0100 .... = Version: 4\n.... 0101 = Header Length: 20 bytes (5)\nDifferentiated Services Field: 0x00 (DSCP: CS0, ECN: Not-ECT)\nTotal Length: 84\nIdentification: 0x0006 (6)\nFlags: 0x4000, Don\'t fragment\nFragment offset: 0\nTime to live: 52\nProtocol: ICMP (1)\nHeader checksum: 0x4e0e [validation disabled]\nSource: 123.235.38.7\nDestination: 101.6.9.17',
      children: [
        { label: '0100 .... = Version: 4', expanded: false },
        { label: '.... 0101 = Header Length: 20 bytes (5)', expanded: false },
        { label: 'Time to live: 52', expanded: false },
        { label: 'Protocol: ICMP (1)', expanded: false },
        { label: 'Source: 123.235.38.7', expanded: false },
        { label: 'Destination: 101.6.9.17', expanded: false },
      ] as PacketTreeItem[],
    },
    {
      label: 'Internet Control Message Protocol',
      expanded: true,
      detail: 'Type: 8 (Echo (ping) request)\nCode: 0\nChecksum: 0x4e0e [correct]\nIdentifier (BE): 0 (0x0000)\nIdentifier (LE): 6 (0x0006)\nSequence number (BE): 0 (0x0000)\nSequence number (LE): 0 (0x0000)\nTimestamp from icmp data: Jul 16, 2026 15:48:49.000000000\n[Timestamp To Timestamp Data: 56 bytes]',
      children: [
        { label: 'Type: 8 (Echo (ping) request)', expanded: false },
        { label: 'Code: 0', expanded: false },
        { label: 'Checksum: 0x4e0e [correct]', expanded: false },
        { label: 'Identifier (BE): 0 (0x0000)', expanded: false },
        { label: 'Sequence number (BE): 0 (0x0000)', expanded: false },
      ] as PacketTreeItem[],
    },
  ] as PacketTreeItem[],
  hexDump: [
    '0000   30 b9 9b 8d 90 01 54 2b   de 6d 10 ae 08 00 45 00    0....T+.m....E.',
    '0010   00 54 22 91 40 00 34 01   4e 0e 7b eb 7b 65 65 06    .T".@.4.N.{.{ee.',
    '0020   09 11 08 00 4b fa 00 06   00 00 52 8c 6a 00 00 00    ....K.....R.j...',
    '0030   00 00 a3 35 01 00 00 00   00 10 11 10 12 13 14 15    ...5............',
    '0040   16 17 18 19 1a 1b 1c 1d   1e 1f 20 21 22 23 24 25    ........ !"#$%',
    '0050   26 27 28 29 2a 2b 2c 2d   2e 2f 30 31 32 33 34 35    &\'()*+,-./012345',
    '0060   36 37                                              67',
  ],
})

const packetTabs = [
  { key: 'parse', label: '报文解析' },
  { key: 'interaction', label: '报文交互' },
  { key: 'metadata', label: '元数据' },
  { key: 'playback', label: '报文播放' },
  { key: 'timeline', label: '时序图' },
]

function openPacket(row: SessionRow) {
  packetData.value.protocol = 'ICMP'
  pktSelectedIdx.value = 0
  pktExpandedRow.value = 0
  packetActiveTab.value = 'parse'
  packetVisible.value = true
}

function downloadPacket() { ElMessage.info('报文下载功能（Mock）') }
function downloadContent() { ElMessage.info('内容下载功能（Mock）') }

// 报文交互
const interactionSourceBlocks = ref<string[]>([
  '[2026-07-16 15:48:49.000] echo (ping) request',
  '  id=0x0006, seq=0/0, ttl=52',
  '  0000:  30 b9 9b 8d 90 01 54 2b  de 6d 10 ae 08 00 45 00',
  '  0010:  00 54 22 91 40 00 34 01  4e 0e 7b eb 7b 65 65 06',
  '',
  '[2026-07-16 15:48:49.666] echo (ping) request',
  '  id=0x0006, seq=1/256, ttl=52',
  '',
  '[2026-07-16 15:48:49.209] echo (ping) request',
  '  id=0x0006, seq=8/768, ttl=52',
  '',
  '[2026-07-16 15:48:50.014] echo (ping) request',
  '  id=0x0006, seq=9/1024, ttl=52',
  '',
  '[2026-07-16 15:48:50.153] echo (ping) request',
  '  id=0x0006, seq=10/1280, ttl=52',
])
const interactionDstBlocks = ref<string[]>([
  '[2026-07-16 15:48:49.095] echo (ping) reply',
  '  id=0x0006, seq=0/0, ttl=62 (request in 1)',
  '  0000:  30 b9 9b 8d 90 01 54 2b  de 6d 10 ae 08 00 45 00',
  '  0010:  00 54 22 91 40 00 3e 01  44 0e 65 06 09 11 7b eb',
  '',
  '[2026-07-16 15:48:49.789] echo (ping) reply',
  '  id=0x0006, seq=1/256, ttl=62 (request in 2)',
  '',
  '[2026-07-16 15:48:49.209] echo (ping) reply',
  '  id=0x0006, seq=8/768, ttl=62 (request in 5)',
  '',
  '[2026-07-16 15:48:50.110] echo (ping) reply',
  '  id=0x0006, seq=9/1024, ttl=62 (request in 4)',
  '',
  '[2026-07-16 15:48:50.218] echo (ping) reply',
  '  id=0x0006, seq=10/1280, ttl=62 (request in 5)',
])
const interactionPage = ref(1)
const interactionTotal = ref(48)
const interactionTotalPages = computed(() => Math.max(1, Math.ceil(interactionTotal.value / 20)))

// 元数据
const metadataDisplayMode = ref('attr')
const metadataItems = ref([
  { key: 'frame.encap_type', value: 'ethernet' },
  { key: 'frame.time', value: 'Jul 16, 2026 15:48:49.000000000' },
  { key: 'frame.time_epoch', value: '1763213329.000000000' },
  { key: 'frame.time_delta', value: '0.000000000' },
  { key: 'frame.time_relative', value: '0.000000000' },
  { key: 'frame.len', value: '98' },
  { key: 'frame.cap_len', value: '98' },
  { key: 'eth.src', value: '54:2b:de:6d:10:ae' },
  { key: 'eth.dst', value: '30:b9:9b:8d:90:01' },
  { key: 'eth.type', value: '0x0800' },
  { key: 'ip.src', value: '123.235.38.7' },
  { key: 'ip.dst', value: '101.6.9.17' },
  { key: 'ip.proto', value: '1 (ICMP)' },
  { key: 'ip.ttl', value: '52' },
  { key: 'ip.len', value: '84' },
  { key: 'icmp.type', value: '8 (Echo request)' },
  { key: 'icmp.code', value: '0' },
  { key: 'icmp.seq', value: '0' },
  { key: 'icmp.ident', value: '0x0006' },
])
const metadataRaw = ref([
  'Frame 1: 98 bytes on wire (784 bits), 98 bytes captured (784 bits)',
  '    Encapsulation type: Ethernet (1)',
  '    Arrival Time: Jul 16, 2026 15:48:49.000000000',
  '    Frame Number: 1',
  '    Frame Length: 98 bytes (784 bits)',
  '    Capture Length: 98 bytes (784 bits)',
  '    [Protocols in frame: eth:ip:icmp:data]',
  'Ethernet II, Src: 54:2b:de:6d:10:ae, Dst: 30:b9:9b:8d:90:01',
  'Internet Protocol Version 4, Src: 123.235.38.7, Dst: 101.6.9.17',
  'Internet Control Message Protocol',
])

// 报文播放
const playNic = ref('eth0')
const playCount = ref(1)
const playSpeed = ref('1')
const playInfoItems = ref([
  { time: '2026-07-16 15:48:49.000', src: '123.235.38.7', dst: '101.6.9.17', length: '98', status: '已播放', statusType: 'success' },
  { time: '2026-07-16 15:48:49.095', src: '101.6.9.17', dst: '123.235.38.7', length: '98', status: '已播放', statusType: 'success' },
  { time: '2026-07-16 15:48:49.666', src: '123.235.38.7', dst: '101.6.9.17', length: '98', status: '已播放', statusType: 'success' },
  { time: '2026-07-16 15:48:49.789', src: '101.6.9.17', dst: '123.235.38.7', length: '98', status: '已播放', statusType: 'success' },
  { time: '2026-07-16 15:48:50.014', src: '123.235.38.7', dst: '101.6.9.17', length: '98', status: '播放中', statusType: 'playing' },
  { time: '2026-07-16 15:48:50.110', src: '101.6.9.17', dst: '123.235.38.7', length: '98', status: '等待中', statusType: 'pending' },
  { time: '2026-07-16 15:48:50.153', src: '123.235.38.7', dst: '101.6.9.17', length: '98', status: '等待中', statusType: 'pending' },
])
function startPacketPlayback() { ElMessage.success(`开始播放：网卡 ${playNic.value}，次数 ${playCount.value}，速度 ${playSpeed.value}x（Mock）`) }
function stopPacketPlayback() { ElMessage.info('停止播放（Mock）') }

// 时序图
const timeGapThreshold = ref(500)
const timelineData = ref([
  { no: 1, time: '0.000000', src: '123.235.38.7', dst: '101.6.9.17', protocol: 'ICMP', info: 'echo request id=0x0006, seq=0/0, ttl=52' },
  { no: 2, time: '0.000095', src: '101.6.9.17', dst: '123.235.38.7', protocol: 'ICMP', info: 'echo reply id=0x0006, seq=0/0, ttl=62' },
  { no: 3, time: '0.666599', src: '123.235.38.7', dst: '101.6.9.17', protocol: 'ICMP', info: 'echo request id=0x0006, seq=1/256, ttl=52' },
  { no: 4, time: '0.666789', src: '101.6.9.17', dst: '123.235.38.7', protocol: 'ICMP', info: 'echo reply id=0x0006, seq=1/256, ttl=62' },
  { no: 5, time: '0.209114', src: '123.235.38.7', dst: '101.6.9.17', protocol: 'ICMP', info: 'echo request id=0x0006, seq=8/768, ttl=52' },
  { no: 6, time: '0.209209', src: '101.6.9.17', dst: '123.235.38.7', protocol: 'ICMP', info: 'echo reply id=0x0006, seq=8/768, ttl=62' },
])
const timelineProtocolTree = ref([
  { label: 'Internet Protocol Version 4', expanded: true, children: [
    { label: 'Source: 123.235.38.7', expanded: false },
    { label: 'Destination: 101.6.9.17', expanded: false },
    { label: 'Protocol: ICMP (1)', expanded: false },
  ]},
  { label: 'Internet Control Message Protocol', expanded: true, children: [
    { label: 'Type: 8 (Echo request)', expanded: false },
    { label: 'Code: 0', expanded: false },
  ]},
])
const timelineHexDump = ref([
  '0000   30 b9 9b 8d 90 01 54 2b   de 6d 10 ae 08 00 45 00    0....T+.m....E.',
  '0010   00 54 22 91 40 00 34 01   4e 0e 7b eb 7b 65 65 06    .T".@.4.N.{.{ee.',
  '0020   09 11 08 00 4b fa 00 06   00 00 52 8c 6a 00 00 00    ....K.....R.j...',
  '0030   00 00 a3 35 01 00 00 00   00 10 11 10 12 13 14 15    ...5............',
])
const timelinePage = ref(1)
</script>

<style scoped>
.pqsl-page { flex:1; min-height:0; display:flex; flex-direction:column; overflow:hidden; }
.pqsl-toolbar { display:flex; gap:6px; padding:6px 12px; border-bottom:1px solid #ebeef5; background:#fafbfc; justify-content:flex-end; align-items:center; }
.pqsl-table-wrap { flex:1; min-height:0; overflow:auto; }
.pqsl-table { min-width:1600px; }
.pqsl-table th, .pqsl-table td { font-size:12px; padding:6px 8px; white-space:nowrap; }
.pqsl-table td { color:#303133; }
.pq-unit { font-size:12px; color:#909399; margin-left:-4px; }
.col-check { width:40px; text-align:center; }
.col-actions { width:80px; text-align:center; }
.tid-link { color:#409eff; cursor:pointer; }
.tid-link:hover { text-decoration:underline; }
.sort-icon { font-size:10px; color:#c0c4cc; vertical-align:middle; margin-left:2px; }
.geo-flag { vertical-align:middle; margin-right:4px; }
.pq-latency-badge { display:inline-block; padding:1px 8px; border-radius:2px; font-size:11px; font-weight:600; background:#fef0f0; color:#f56c6c; font-variant-numeric:tabular-nums; }
.pq-latency-good { background:#f0f9eb; color:#67c23a; }
.pkt-bad-badge { display:inline-block; padding:1px 8px; border-radius:2px; font-size:11px; background:#fdf6ec; color:#e6a23c; }
.pqsl-pkt-tab { font-size:14px; cursor:pointer; padding-bottom:6px; border-bottom:2px solid transparent; color:#909399; }
.pqsl-pkt-tab.active { color:#409eff; border-color:#409eff; font-weight:500; }
.pqsl-pkt-table th, .pqsl-pkt-table td { font-size:12px; padding:6px 8px; }
.pqsl-pkt-table tr:hover { background:#f5f7fa; }
.pqsl-tree-toggle { color:#409eff; cursor:pointer; user-select:none; display:inline-block; width:14px; }
.pqsl-meta-table-wrap { max-height:480px; overflow:auto; border:1px solid #ebeef5; border-radius:4px; }
.pkt-status { display:inline-block; padding:1px 8px; border-radius:2px; font-size:11px; }
.pkt-status-success { background:#f0f9eb; color:#67c23a; }
.pkt-status-playing { background:#ecf5ff; color:#409eff; }
.pkt-status-pending { background:#f4f4f5; color:#909399; }
</style>
