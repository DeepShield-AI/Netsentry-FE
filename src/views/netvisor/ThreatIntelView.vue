<template>
  <div class="ti-container">
    <div v-if="loading" class="ti-loading-mask">
      <div class="ti-loading-spinner"></div>
      <span class="ti-loading-text">{{ loadingText }}</span>
    </div>

    <div class="ti-main">
      <div class="ti-top-toolbar">
        <div class="ti-tab-bar">
          <button v-for="tab in tabs" :key="tab.key" class="ti-tab" :class="{ active: activeTab === tab.key }" @click="activeTab = tab.key">{{ tab.label }}</button>
        </div>
        <div class="ti-action-bar">
          <button class="ti-action-btn" @click="openAlertConfigModal">告警配置</button>
          <button class="ti-action-btn" @click="openAlertNotifyModal">告警通知</button>
          <button class="ti-action-btn" @click="openIntelQueryModal">情报查询</button>
          <button class="ti-action-btn" @click="openCustomIntelModal">自定义情报</button>
          <button class="ti-action-btn ti-action-btn-primary" @click="openSyncConfirmModal">立即同步</button>
          <button class="ti-action-btn" @click="openSyncSettingsModal">同步设置</button>
        </div>
      </div>

      <div v-if="activeTab === 'overview'" class="ti-overview">
        <div class="ti-section">
          <div class="ti-section-header">
            <h3 class="ti-section-title">情报来源</h3>
            <span class="ti-section-count">共 {{ intelSources.length }} 个情报源</span>
          </div>
          <div class="ti-table-wrap">
            <table class="ti-table">
              <thead>
                <tr>
                  <th class="col-check"><input type="checkbox" v-model="selectAllSources" @change="toggleSelectAllSources" /></th>
                  <th class="col-idx">序号</th>
                  <th class="col-source">情报源</th>
                  <th class="col-info">授权信息</th>
                  <th class="col-status">加解密状态</th>
                  <th class="col-count">情报条数</th>
                  <th class="col-hit">命中次数</th>
                  <th class="col-match">匹配</th>
                  <th class="col-alert">告警</th>
                  <th class="col-auto">自动同步</th>
                  <th class="col-time">同步时间</th>
                  <th class="col-actions">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(source, index) in intelSources" :key="source.id">
                  <td class="col-check"><input type="checkbox" v-model="selectedSources" :value="source.id" /></td>
                  <td class="col-idx">{{ index + 1 }}</td>
                  <td class="col-source ti-link" @click="openSourceDetailModal(source)">{{ source.name }}</td>
                  <td class="col-info">{{ source.authInfo }}</td>
                  <td class="col-status">{{ source.encryptionStatus }}</td>
                  <td class="col-count">{{ source.count }}</td>
                  <td class="col-hit">{{ source.hitCount }}</td>
                  <td class="col-match"><el-switch v-model="source.matchEnabled" @change="saveSourceToggle(source, 'matchEnabled')" /></td>
                  <td class="col-alert"><el-switch v-model="source.alertEnabled" @change="saveSourceToggle(source, 'alertEnabled')" /></td>
                  <td class="col-auto"><el-switch v-model="source.autoSync" @change="saveSourceToggle(source, 'autoSync')" /></td>
                  <td class="col-time">{{ source.syncTime }}</td>
                  <td class="col-actions">
                    <button class="ti-table-btn">手动导入</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="ti-chart-row">
          <div class="ti-section ti-chart-section">
            <div class="ti-section-header">
              <h3 class="ti-section-title">命中趋势</h3>
              <div class="ti-time-range">
                <button class="ti-time-btn" :class="{ active: timeRange === 'day' }" @click="timeRange = 'day'">日</button>
                <button class="ti-time-btn" :class="{ active: timeRange === 'week' }" @click="timeRange = 'week'">周</button>
                <button class="ti-time-btn" :class="{ active: timeRange === 'month' }" @click="timeRange = 'month'">月</button>
              </div>
            </div>
            <v-chart class="ti-chart" :option="trendChartOption" autoresize />
          </div>
          <div class="ti-section ti-chart-section">
            <div class="ti-section-header">
              <h3 class="ti-section-title">命中分布</h3>
            </div>
            <v-chart class="ti-chart" :option="pieChartOption" autoresize />
          </div>
        </div>

        <div class="ti-bottom-row">
          <div class="ti-section">
            <div class="ti-section-header">
              <h3 class="ti-section-title">最新情报命中日志</h3>
              <button class="ti-more-btn">查看更多</button>
            </div>
            <div class="ti-table-wrap">
              <table class="ti-table ti-mini-table">
                <thead>
                  <tr>
                    <th class="col-idx">序号</th>
                    <th class="col-time">最新命中时间</th>
                    <th class="col-ip">源IP</th>
                    <th class="col-ip">目标IP</th>
                    <th class="col-proto">协议</th>
                    <th class="col-level">威胁等级</th>
                    <th class="col-ioc">IOC</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(log, index) in hitLogs" :key="log.id">
                    <td class="col-idx">{{ index + 1 }}</td>
                    <td class="col-time">{{ log.time }}</td>
                    <td class="col-ip ti-link" @click="openIpProfileModal(log.srcIp)">{{ log.srcIp }}</td>
                    <td class="col-ip ti-link" @click="openIpProfileModal(log.dstIp)">{{ log.dstIp }}</td>
                    <td class="col-proto">{{ log.proto }}</td>
                    <td class="col-level"><span class="ti-level" :class="'ti-level-' + log.level">{{ log.level }}</span></td>
                    <td class="col-ioc">{{ log.ioc }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="ti-section">
            <div class="ti-section-header">
              <h3 class="ti-section-title">TOP命中用户</h3>
              <button class="ti-more-btn">查看更多</button>
            </div>
            <div class="ti-table-wrap">
              <table class="ti-table ti-mini-table">
                <thead>
                  <tr>
                    <th class="col-idx">序号</th>
                    <th class="col-ip">IP</th>
                    <th class="col-mac">MAC</th>
                    <th class="col-name">姓名</th>
                    <th class="col-count">命中次数</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(user, index) in topUsers" :key="user.ip">
                    <td class="col-idx">{{ index + 1 }}</td>
                    <td class="col-ip ti-link" @click="openIpProfileModal(user.ip)">{{ user.ip }}</td>
                    <td class="col-mac">{{ user.mac }}</td>
                    <td class="col-name">{{ user.name }}</td>
                    <td class="col-count">{{ user.hitCount }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'realtime'" class="ti-realtime">
        <div class="ti-realtime-cards">
          <div class="ti-realtime-card">
            <div class="ti-card-num">18</div>
            <div class="ti-card-label">待处理的证书数量</div>
          </div>
          <div class="ti-realtime-card">
            <div class="ti-card-num">1</div>
            <div class="ti-card-label">已过期的证书数量</div>
          </div>
          <div class="ti-realtime-card">
            <div class="ti-card-num">45</div>
            <div class="ti-card-label">正常证书</div>
          </div>
          <div class="ti-realtime-card">
            <div class="ti-card-num">14</div>
            <div class="ti-card-label">吊销证书</div>
          </div>
          <div class="ti-realtime-card">
            <div class="ti-card-num">20</div>
            <div class="ti-card-label">异常的证书</div>
          </div>
          <div class="ti-realtime-card">
            <div class="ti-card-num">58</div>
            <div class="ti-card-label">CA证书</div>
          </div>
        </div>
        <div class="ti-realtime-grid">
          <div class="ti-realtime-section">
            <div class="ti-realtime-section-header">
              <span class="ti-realtime-section-title">待处理的证书</span>
            </div>
            <table class="ti-table ti-table-small">
              <thead>
                <tr>
                  <th class="col-idx">序号</th>
                  <th class="col-name">证书域名</th>
                  <th class="col-date">证书期限</th>
                  <th class="col-dst-ip">目标IP</th>
                  <th class="col-ca">CA证书</th>
                  <th class="col-location">地理位置</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in pendingCerts" :key="index">
                  <td class="col-idx">{{ index + 1 }}</td>
                  <td class="col-name ti-link" @click="openCertHistoryModal(item)">{{ item.name }}</td>
                  <td class="col-date">{{ item.date }}</td>
                  <td class="col-dst-ip">{{ item.dstIp }}</td>
                  <td class="col-ca">{{ item.ca }}</td>
                  <td class="col-location"><span class="ti-location-tag">{{ item.location }}</span></td>
                </tr>
              </tbody>
            </table>
            <div class="ti-realtime-pagination">
              <button class="ti-page-btn" :disabled="pendingCertPage <= 1">上一页</button>
              <button class="ti-page-btn" v-for="p in pendingCertPageList" :key="p" :class="{ active: pendingCertPage === p }" @click="pendingCertPage = p">{{ p }}</button>
              <span>到第</span>
              <input type="number" class="ti-page-input" v-model.number="pendingCertPage" min="1" />
              <span>页</span>
              <button class="ti-page-btn" @click="confirmPendingCertPage">确定</button>
              <span>共 {{ pendingCertTotal }} 条</span>
              <select class="ti-page-select" v-model="pendingCertPageSize">
                <option value="10">10条/页</option>
                <option value="20">20条/页</option>
                <option value="50">50条/页</option>
              </select>
            </div>
          </div>
          <div class="ti-realtime-section">
            <div class="ti-realtime-section-header">
              <span class="ti-realtime-section-title">已过期的证书</span>
            </div>
            <table class="ti-table ti-table-small">
              <thead>
                <tr>
                  <th class="col-idx">序号</th>
                  <th class="col-name">证书域名</th>
                  <th class="col-date">证书期限</th>
                  <th class="col-dst-ip">目标IP</th>
                  <th class="col-ca">CA证书</th>
                  <th class="col-location">地理位置</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in expiredCerts" :key="index">
                  <td class="col-idx">{{ index + 1 }}</td>
                  <td class="col-name ti-link" @click="openCertHistoryModal(item)">{{ item.name }}</td>
                  <td class="col-date">{{ item.date }}</td>
                  <td class="col-dst-ip">{{ item.dstIp }}</td>
                  <td class="col-ca">{{ item.ca }}</td>
                  <td class="col-location"><span class="ti-location-tag">{{ item.location }}</span></td>
                </tr>
              </tbody>
            </table>
            <div class="ti-realtime-pagination">
              <button class="ti-page-btn" :disabled="expiredCertPage <= 1">上一页</button>
              <button class="ti-page-btn" v-for="p in expiredCertPageList" :key="p" :class="{ active: expiredCertPage === p }" @click="expiredCertPage = p">{{ p }}</button>
              <span>到第</span>
              <input type="number" class="ti-page-input" v-model.number="expiredCertPage" min="1" />
              <span>页</span>
              <button class="ti-page-btn" @click="confirmExpiredCertPage">确定</button>
              <span>共 {{ expiredCertTotal }} 条</span>
              <select class="ti-page-select" v-model="expiredCertPageSize">
                <option value="10">10条/页</option>
                <option value="20">20条/页</option>
                <option value="50">50条/页</option>
              </select>
            </div>
          </div>
          <div class="ti-realtime-section">
            <div class="ti-realtime-section-header">
              <span class="ti-realtime-section-title">已吊销证书</span>
            </div>
            <table class="ti-table ti-table-small">
              <thead>
                <tr>
                  <th class="col-idx">序号</th>
                  <th class="col-name">证书域名</th>
                  <th class="col-date">证书期限</th>
                  <th class="col-dst-ip">目标IP</th>
                  <th class="col-ca">CA证书</th>
                  <th class="col-location">地理位置</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in revokedCerts" :key="index">
                  <td class="col-idx">{{ index + 1 }}</td>
                  <td class="col-name ti-link" @click="openCertHistoryModal(item)">{{ item.name }}</td>
                  <td class="col-date">{{ item.date }}</td>
                  <td class="col-dst-ip">{{ item.dstIp }}</td>
                  <td class="col-ca">{{ item.ca }}</td>
                  <td class="col-location"><span class="ti-location-tag">{{ item.location }}</span></td>
                </tr>
              </tbody>
            </table>
            <div class="ti-realtime-pagination">
              <button class="ti-page-btn" :disabled="revokedCertPage <= 1">上一页</button>
              <button class="ti-page-btn" v-for="p in revokedCertPageList" :key="p" :class="{ active: revokedCertPage === p }" @click="revokedCertPage = p">{{ p }}</button>
              <span>到第</span>
              <input type="number" class="ti-page-input" v-model.number="revokedCertPage" min="1" />
              <span>页</span>
              <button class="ti-page-btn" @click="confirmRevokedCertPage">确定</button>
              <span>共 {{ revokedCertTotal }} 条</span>
              <select class="ti-page-select" v-model="revokedCertPageSize">
                <option value="10">10条/页</option>
                <option value="20">20条/页</option>
                <option value="50">50条/页</option>
              </select>
            </div>
          </div>
          <div class="ti-realtime-section">
            <div class="ti-realtime-section-header">
              <span class="ti-realtime-section-title">正常证书</span>
            </div>
            <table class="ti-table ti-table-small">
              <thead>
                <tr>
                  <th class="col-idx">序号</th>
                  <th class="col-name">证书域名</th>
                  <th class="col-date">证书期限</th>
                  <th class="col-dst-ip">目标IP</th>
                  <th class="col-ca">CA证书</th>
                  <th class="col-location">地理位置</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in normalCerts" :key="index">
                  <td class="col-idx">{{ index + 1 }}</td>
                  <td class="col-name ti-link" @click="openCertHistoryModal(item)">{{ item.name }}</td>
                  <td class="col-date">{{ item.date }}</td>
                  <td class="col-dst-ip">{{ item.dstIp }}</td>
                  <td class="col-ca">{{ item.ca }}</td>
                  <td class="col-location"><span class="ti-location-tag">{{ item.location }}</span></td>
                </tr>
              </tbody>
            </table>
            <div class="ti-realtime-pagination">
              <button class="ti-page-btn" :disabled="normalCertPage <= 1">上一页</button>
              <button class="ti-page-btn" v-for="p in normalCertPageList" :key="p" :class="{ active: normalCertPage === p }" @click="normalCertPage = p">{{ p }}</button>
              <span>到第</span>
              <input type="number" class="ti-page-input" v-model.number="normalCertPage" min="1" />
              <span>页</span>
              <button class="ti-page-btn" @click="confirmNormalCertPage">确定</button>
              <span>共 {{ normalCertTotal }} 条</span>
              <select class="ti-page-select" v-model="normalCertPageSize">
                <option value="10">10条/页</option>
                <option value="20">20条/页</option>
                <option value="50">50条/页</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'cert-analysis'" class="ti-cert-analysis">
        <div class="ti-section">
          <div class="ti-section-header">
            <h3 class="ti-section-title">证书分析</h3>
            <div class="ti-cert-analysis-toolbar">
              <div class="ti-cert-analysis-filters">
                <div class="ti-cert-analysis-filter-row">
                  <input class="ti-cert-analysis-input" v-model="certAnalysisSrcIp" placeholder="源IP" />
                  <input class="ti-cert-analysis-input" v-model="certAnalysisSrcPort" placeholder="源端口" />
                  <input class="ti-cert-analysis-input" v-model="certAnalysisDstIp" placeholder="目标IP" />
                  <input class="ti-cert-analysis-input" v-model="certAnalysisDstPort" placeholder="目标端口" />
                  <input class="ti-cert-analysis-input" v-model="certAnalysisKeyword" placeholder="关键字" />
                </div>
                <div class="ti-cert-analysis-filter-row">
                  <input class="ti-cert-analysis-input" v-model="certAnalysisMac" placeholder="MAC" />
                  <input class="ti-cert-analysis-input" v-model="certAnalysisAltName" placeholder="备用名称" />
                  <input class="ti-cert-analysis-input" v-model="certAnalysisStartTime" placeholder="开始时间" />
                  <input class="ti-cert-analysis-input" v-model="certAnalysisEndTime" placeholder="结束时间" />
                  <button class="ti-cert-analysis-btn-search" @click="filterCertAnalysis">搜索</button>
                  <button class="ti-cert-analysis-btn-reset" @click="resetCertAnalysisFilters">重置</button>
                </div>
              </div>
              <div class="ti-cert-analysis-actions">
                <button class="ti-cert-analysis-btn" @click="exportCertAnalysis">导出</button>
              </div>
            </div>
          </div>
          <div class="ti-table-wrap">
            <table class="ti-table">
              <thead>
                <tr>
                  <th class="col-idx">序号</th>
                  <th class="col-name">证书域名</th>
                  <th class="col-date">证书期限</th>
                  <th class="col-fp">指纹</th>
                  <th class="col-ca">CA证书</th>
                  <th class="col-location">地理位置</th>
                  <th class="col-count">命中次数</th>
                  <th class="col-action">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in certAnalysisData" :key="item.id">
                  <td class="col-idx">{{ index + 1 }}</td>
                  <td class="col-name ti-link" @click="openCertHistoryModal(item)">{{ item.name }}</td>
                  <td class="col-date">{{ item.date }}</td>
                  <td class="col-fp">{{ item.fp }}</td>
                  <td class="col-ca">{{ item.ca }}</td>
                  <td class="col-location"><span class="ti-location-tag">{{ item.location }}</span></td>
                  <td class="col-count">{{ item.count }}</td>
                  <td class="col-action">
                    <button class="ti-cert-analysis-action-btn" @click="openCertHistoryModal(item)">历史会话</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="ti-history-pagination">
            <button class="ti-page-btn" :disabled="certAnalysisCurrentPage <= 1">上一页</button>
            <button class="ti-page-btn" v-for="page in certAnalysisPageList" :key="page" :class="{ active: certAnalysisCurrentPage === page }" @click="certAnalysisCurrentPage = page">{{ page }}</button>
            <button class="ti-page-btn" :disabled="certAnalysisCurrentPage >= Math.ceil(certAnalysisTotalCount / certAnalysisPageSize)">下一页</button>
            <span>到第</span>
            <input type="number" class="ti-page-input" v-model.number="certAnalysisCurrentPage" min="1" />
            <span>页</span>
            <button class="ti-page-btn" @click="confirmCertAnalysisPage">确定</button>
            <span>共 {{ certAnalysisTotalCount }} 条</span>
            <select class="ti-page-select" v-model="certAnalysisPageSize">
              <option value="20">20条/页</option>
              <option value="50">50条/页</option>
              <option value="100">100条/页</option>
            </select>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'hit-users'" class="ti-hit-users">
        <div class="ti-section">
          <div class="ti-section-header">
            <h3 class="ti-section-title">命中用户</h3>
            <div class="ti-hit-users-toolbar">
              <div class="ti-hit-users-filter">
                <input class="ti-hit-users-search" v-model="hitUsersKeyword" placeholder="关键字搜索" />
                <button class="ti-hit-users-btn-search" @click="filterHitUsers">搜索</button>
              </div>
            </div>
          </div>
          <div class="ti-table-wrap">
            <table class="ti-table">
              <thead>
                <tr>
                  <th class="col-idx">序号</th>
                  <th class="col-ip"><span class="ti-link" @click="sortHitUsersBy('ip')">IP</span></th>
                  <th class="col-mac">MAC</th>
                  <th class="col-account">账号</th>
                  <th class="col-hit-count"><span class="ti-link" @click="sortHitUsersBy('hitCount')">命中次数</span> <span v-if="hitUsersSortField === 'hitCount'">{{ hitUsersSortOrder === 'asc' ? '↑' : '↓' }}</span></th>
                  <th class="col-actions">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in sortedHitUsers" :key="item.id">
                  <td class="col-idx">{{ index + 1 }}</td>
                  <td class="col-ip ti-link" @click="openIpProfileModal(item.ip)">{{ item.ip }}</td>
                  <td class="col-mac">{{ item.mac }}</td>
                  <td class="col-account">{{ item.account }}</td>
                  <td class="col-hit-count">{{ item.hitCount }}</td>
                  <td class="col-actions">
                    <button class="ti-table-btn" @click="openIpProfileModal(item.ip)">📋</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="ti-hit-users-pagination">
            <button class="ti-page-btn" :disabled="hitUsersCurrentPage <= 1">上一页</button>
            <span>到第</span>
            <input type="number" class="ti-page-input" v-model.number="hitUsersCurrentPage" min="1" />
            <span>页</span>
            <button class="ti-page-btn" @click="confirmHitUsersPage">确定</button>
            <span>共 {{ hitUsersTotalCount }} 条</span>
            <select class="ti-page-select" v-model="hitUsersPageSize">
              <option value="20">20条/页</option>
              <option value="50">50条/页</option>
              <option value="100">100条/页</option>
            </select>
            <button class="ti-page-btn" :disabled="hitUsersCurrentPage >= Math.ceil(hitUsersTotalCount / hitUsersPageSize)">下一页</button>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'hit-logs'" class="ti-hit-logs">
        <div class="ti-section">
          <div class="ti-section-header">
            <h3 class="ti-section-title">命中日志</h3>
            <div class="ti-hit-logs-toolbar">
              <div class="ti-hit-logs-filters">
                <select class="ti-hit-logs-select" v-model="hitLogsSource">
                  <option value="">情报源</option>
                  <option value="奇安信威胁情报平台">奇安信威胁情报平台</option>
                  <option value="奇安信社区情报平台">奇安信社区情报平台</option>
                  <option value="免费情报">免费情报</option>
                </select>
                <select class="ti-hit-logs-select" v-model="hitLogsIntelType">
                  <option value="">情报类型</option>
                  <option value="免费情报">免费情报</option>
                  <option value="商业情报">商业情报</option>
                </select>
                <select class="ti-hit-logs-select" v-model="hitLogsThreatType">
                  <option value="">情报类型</option>
                  <option value="数字货币">数字货币</option>
                  <option value="C2节点">C2节点</option>
                  <option value="APT攻击">APT攻击</option>
                  <option value="网站后门">网站后门</option>
                  <option value="钓鱼网站">钓鱼网站</option>
                  <option value="僵尸网络">僵尸网络</option>
                  <option value="恶意软件">恶意软件</option>
                  <option value="扫描器">扫描器</option>
                  <option value="TOR节点">TOR节点</option>
                  <option value="代理和隧道">代理和隧道</option>
                  <option value="隐藏节点">隐藏节点</option>
                  <option value="恶意网站">恶意网站</option>
                  <option value="色情网站">色情网站</option>
                  <option value="赌博网站">赌博网站</option>
                  <option value="激进网站">激进网站</option>
                  <option value="可疑行为">可疑行为</option>
                </select>
                <select class="ti-hit-logs-select" v-model="hitLogsLevel">
                  <option value="">威胁等级</option>
                  <option value="高">高</option>
                  <option value="中">中</option>
                  <option value="低">低</option>
                </select>
                <input class="ti-hit-logs-search" v-model="hitLogsKeyword" placeholder="关键字搜索" />
                <button class="ti-hit-logs-btn-search" @click="filterHitLogsData">搜索</button>
                <button class="ti-hit-logs-btn-reset" @click="resetHitLogsFilters">重置</button>
              </div>
              <div class="ti-hit-logs-actions">
                <button class="ti-hit-logs-btn" @click="exportHitLogs">导出</button>
              </div>
            </div>
          </div>
          <div class="ti-table-wrap">
            <table class="ti-table">
              <thead>
                <tr>
                  <th class="col-idx">序号</th>
                  <th class="col-time">最新命中时间</th>
                  <th class="col-src-ip">源IP:端口</th>
                  <th class="col-account">账号</th>
                  <th class="col-dst-ip">目标IP:端口</th>
                  <th class="col-location">地理位置</th>
                  <th class="col-proto">协议</th>
                  <th class="col-threat-level">威胁等级</th>
                  <th class="col-intel-type">情报类型</th>
                  <th class="col-malicious-family">恶意家族</th>
                  <th class="col-ioc">IOC</th>
                  <th class="col-action">执行动作</th>
                  <th class="col-actions">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(log, index) in filteredHitLogs" :key="log.id">
                  <td class="col-idx">{{ index + 1 }}</td>
                  <td class="col-time">{{ log.time }}</td>
                  <td class="col-src-ip ti-link" @click="openIpProfileModal(log.srcIp.split(':')[0])">{{ log.srcIp }}</td>
                  <td class="col-account">{{ log.account }}</td>
                  <td class="col-dst-ip ti-link" @click="openIpProfileModal(log.dstIp.split(':')[0])">{{ log.dstIp }}</td>
                  <td class="col-location">{{ log.location }}</td>
                  <td class="col-proto">{{ log.proto }}</td>
                  <td class="col-threat-level"><span class="ti-level" :class="'ti-level-' + log.level">{{ log.level }}</span></td>
                  <td class="col-intel-type">{{ log.intelType }}</td>
                  <td class="col-malicious-family">{{ log.maliciousFamily }}</td>
                  <td class="col-ioc">{{ log.ioc }}</td>
                  <td class="col-action">{{ log.action }}</td>
                  <td class="col-actions">
                    <button class="ti-table-btn" @click="openIpProfileModal(log.srcIp.split(':')[0])">📋</button>
                  </td>
                </tr>
                <tr v-if="filteredHitLogs.length === 0">
                  <td colspan="13" class="ti-no-data">无数据</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="ti-hit-logs-pagination">
            <button class="ti-page-btn" :disabled="hitLogsCurrentPage <= 1">上一页</button>
            <span>到第</span>
            <input type="number" class="ti-page-input" v-model.number="hitLogsCurrentPage" min="1" />
            <span>页</span>
            <button class="ti-page-btn" @click="confirmHitLogsPage">确定</button>
            <span>共 {{ hitLogsTotalCount }} 条</span>
            <select class="ti-page-select" v-model="hitLogsPageSize">
              <option value="20">20条/页</option>
              <option value="50">50条/页</option>
              <option value="100">100条/页</option>
            </select>
            <button class="ti-page-btn" :disabled="hitLogsCurrentPage >= Math.ceil(hitLogsTotalCount / hitLogsPageSize)">下一页</button>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'history'" class="ti-history">
        <div class="ti-section">
          <div class="ti-section-header">
            <h3 class="ti-section-title">历史命中</h3>
            <div class="ti-history-toolbar">
              <div class="ti-history-filters">
                <input class="ti-history-input" v-model="historyMac" placeholder="MAC" />
                <input class="ti-history-input" v-model="historySrcIp" placeholder="源IP" />
                <input class="ti-history-input" v-model="historyDstIp" placeholder="目标IP" />
                <input class="ti-history-input" v-model="historyPort" placeholder="端口" />
                <input class="ti-history-input" v-model="historyProto" placeholder="协议" />
                <select class="ti-history-select" v-model="historyAction">
                  <option value="">动作类型</option>
                  <option value="阻断">阻断</option>
                  <option value="记录">记录</option>
                  <option value="监测">监测</option>
                </select>
                <input class="ti-history-input" v-model="historyIoc" placeholder="IOC" />
                <select class="ti-history-select" v-model="historyLevel">
                  <option value="">威胁等级</option>
                  <option value="高">高</option>
                  <option value="中">中</option>
                  <option value="低">低</option>
                </select>
                <input class="ti-history-input" v-model="historyIntelType" placeholder="情报类型" />
                <input class="ti-history-input" v-model="historyFamily" placeholder="恶意家族" />
                <input class="ti-history-input" v-model="historyStartTime" placeholder="开始时间" />
                <input class="ti-history-input" v-model="historyEndTime" placeholder="结束时间" />
                <button class="ti-history-btn-search" @click="filterHistoryData">搜索</button>
                <button class="ti-history-btn-reset" @click="resetHistoryFilters">重置</button>
              </div>
              <div class="ti-history-actions">
                <button class="ti-history-btn" @click="exportHistory">导出</button>
              </div>
            </div>
          </div>
          <div class="ti-table-wrap">
            <table class="ti-table">
              <thead>
                <tr>
                  <th class="col-check"><input type="checkbox" v-model="selectAllHistory" @change="toggleSelectAllHistory" /></th>
                  <th class="col-idx">序号</th>
                  <th class="col-time">最新命中时间</th>
                  <th class="col-mac">MAC</th>
                  <th class="col-mac-vendor">MAC厂商</th>
                  <th class="col-account">用户名</th>
                  <th class="col-src-ip">源IP:端口</th>
                  <th class="col-dst-ip">目标IP:端口</th>
                  <th class="col-proto">协议</th>
                  <th class="col-source">情报源</th>
                  <th class="col-block">阻断</th>
                  <th class="col-threat-level">威胁等级</th>
                  <th class="col-intel-type">情报类型</th>
                  <th class="col-malicious-family">恶意家族</th>
                  <th class="col-ioc">IOC</th>
                  <th class="col-actions">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(log, index) in filteredHistory" :key="log.id">
                  <td class="col-check"><input type="checkbox" v-model="selectedHistory" :value="log.id" /></td>
                  <td class="col-idx">{{ index + 1 }}</td>
                  <td class="col-time">{{ log.time }}</td>
                  <td class="col-mac">{{ log.mac }}</td>
                  <td class="col-mac-vendor">{{ log.macVendor }}</td>
                  <td class="col-account">{{ log.account }}</td>
                  <td class="col-src-ip ti-link" @click="openIpProfileModal(log.srcIp.split(':')[0])">{{ log.srcIp }}</td>
                  <td class="col-dst-ip ti-link" @click="openIpProfileModal(log.dstIp.split(':')[0])">{{ log.dstIp }}</td>
                  <td class="col-proto">{{ log.proto }}</td>
                  <td class="col-source">{{ log.source }}</td>
                  <td class="col-block">{{ log.block }}</td>
                  <td class="col-threat-level"><span class="ti-level" :class="'ti-level-' + log.level">{{ log.level }}</span></td>
                  <td class="col-intel-type">{{ log.intelType }}</td>
                  <td class="col-malicious-family">{{ log.maliciousFamily }}</td>
                  <td class="col-ioc">{{ log.ioc }}</td>
                  <td class="col-actions">
                    <button class="ti-table-btn" @click="openPacketAnalysisModal(log)">📋</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="ti-history-pagination">
            <button class="ti-page-btn" :disabled="historyCurrentPage <= 1">上一页</button>
            <button class="ti-page-btn" v-for="page in historyPageList" :key="page" :class="{ active: historyCurrentPage === page }" @click="historyCurrentPage = page">{{ page }}</button>
            <button class="ti-page-btn" :disabled="historyCurrentPage >= Math.ceil(historyTotalCount / historyPageSize)">下一页</button>
            <span>到第</span>
            <input type="number" class="ti-page-input" v-model.number="historyCurrentPage" min="1" />
            <span>页</span>
            <button class="ti-page-btn" @click="confirmHistoryPage">确定</button>
            <span>共 {{ historyTotalCount }} 条</span>
            <select class="ti-page-select" v-model="historyPageSize">
              <option value="20">20条/页</option>
              <option value="50">50条/页</option>
              <option value="100">100条/页</option>
            </select>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'data-diagnosis'" class="ti-data-diagnosis">
        <div class="ti-section">
          <div class="ti-section-header">
            <h3 class="ti-section-title">数据诊断</h3>
            <div class="ti-diagnosis-toolbar">
              <div class="ti-diagnosis-filters">
                <input class="ti-diagnosis-input" v-model="diagnosisMac" placeholder="MAC" />
                <input class="ti-diagnosis-input" v-model="diagnosisSrcIp" placeholder="源IP" />
                <input class="ti-diagnosis-input" v-model="diagnosisSrcPort" placeholder="源端口" />
                <input class="ti-diagnosis-input" v-model="diagnosisDstIp" placeholder="目标IP" />
                <input class="ti-diagnosis-input" v-model="diagnosisDstPort" placeholder="目标端口" />
                <div class="ti-diagnosis-ip-version">
                  <button class="ti-diagnosis-ip-btn" :class="{ active: diagnosisIpVersion === 'ipv4' }" @click="diagnosisIpVersion = 'ipv4'">IPv4</button>
                  <button class="ti-diagnosis-ip-btn" :class="{ active: diagnosisIpVersion === 'ipv6' }" @click="diagnosisIpVersion = 'ipv6'">IPv6</button>
                </div>
                <input class="ti-diagnosis-input" v-model="diagnosisKeyword" placeholder="关键字" />
                <select class="ti-diagnosis-select" v-model="diagnosisSource">
                  <option value="">情报源</option>
                  <option value="奇安信商业情报">奇安信商业情报</option>
                  <option value="奇安信免费情报">奇安信免费情报</option>
                </select>
                <select class="ti-diagnosis-select" v-model="diagnosisIntelType">
                  <option value="">情报类型</option>
                  <option value="僵尸网络">僵尸网络</option>
                  <option value="恶意软件">恶意软件</option>
                </select>
                <select class="ti-diagnosis-select" v-model="diagnosisLevel">
                  <option value="">威胁等级</option>
                  <option value="高">高</option>
                  <option value="中">中</option>
                  <option value="低">低</option>
                </select>
                <input class="ti-diagnosis-input" v-model="diagnosisAccount" placeholder="用户账号" />
                <select class="ti-diagnosis-select" v-model="diagnosisLink">
                  <option value="">链路</option>
                  <option value="链路1">链路1</option>
                  <option value="链路2">链路2</option>
                </select>
                <select class="ti-diagnosis-select" v-model="diagnosisCondition">
                  <option value="and">条件关系 与</option>
                  <option value="or">条件关系 或</option>
                </select>
                <input class="ti-diagnosis-input" v-model="diagnosisStartTime" placeholder="开始时间" />
                <input class="ti-diagnosis-input" v-model="diagnosisEndTime" placeholder="结束时间" />
                <button class="ti-diagnosis-btn-search" @click="filterDiagnosisData">搜索</button>
                <button class="ti-diagnosis-btn-reset" @click="resetDiagnosisFilters">重置</button>
              </div>
              <div class="ti-diagnosis-actions">
                <button class="ti-diagnosis-btn" @click="exportDiagnosis">导出</button>
              </div>
            </div>
          </div>
          <div class="ti-diagnosis-charts">
            <div class="ti-diagnosis-chart-left">
              <v-chart class="ti-trend-chart" :option="diagnosisTrendChartOption" autoresize />
            </div>
            <div class="ti-diagnosis-chart-right">
              <v-chart class="ti-pie-chart" :option="diagnosisPieChartOption" autoresize />
            </div>
          </div>
          <div class="ti-diagnosis-tables">
            <div class="ti-diagnosis-table-item">
              <div class="ti-table-header">
                <span class="ti-table-title">源IP排行榜</span>
              </div>
              <table class="ti-table ti-table-small">
                <thead>
                  <tr>
                    <th class="col-idx">序号</th>
                    <th class="col-src-ip">源IP</th>
                    <th class="col-count">命中次数</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in srcIpRanking" :key="index">
                    <td class="col-idx">{{ index + 1 }}</td>
                    <td class="col-src-ip ti-link" @click="openIpProfileModal(item.ip)">{{ item.ip }}</td>
                    <td class="col-count">{{ item.count }}</td>
                  </tr>
                </tbody>
              </table>
              <div class="ti-diagnosis-pagination">
                <button class="ti-page-btn" :disabled="srcIpPage <= 1">上一页</button>
                <span>共 {{ srcIpTotal }} 条</span>
                <button class="ti-page-btn" :disabled="srcIpPage >= Math.ceil(srcIpTotal / srcIpPageSize)">下一页</button>
              </div>
            </div>
            <div class="ti-diagnosis-table-item">
              <div class="ti-table-header">
                <span class="ti-table-title">目标IP排行榜</span>
              </div>
              <table class="ti-table ti-table-small">
                <thead>
                  <tr>
                    <th class="col-idx">序号</th>
                    <th class="col-dst-ip">目标IP</th>
                    <th class="col-count">命中次数</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in dstIpRanking" :key="index">
                    <td class="col-idx">{{ index + 1 }}</td>
                    <td class="col-dst-ip ti-link" @click="openIpProfileModal(item.ip)">{{ item.ip }}</td>
                    <td class="col-count">{{ item.count }}</td>
                  </tr>
                </tbody>
              </table>
              <div class="ti-diagnosis-pagination">
                <button class="ti-page-btn" :disabled="dstIpPage <= 1">上一页</button>
                <span>共 {{ dstIpTotal }} 条</span>
                <button class="ti-page-btn" :disabled="dstIpPage >= Math.ceil(dstIpTotal / dstIpPageSize)">下一页</button>
              </div>
            </div>
            <div class="ti-diagnosis-table-item">
              <div class="ti-table-header">
                <span class="ti-table-title">IOC排行榜</span>
              </div>
              <table class="ti-table ti-table-small">
                <thead>
                  <tr>
                    <th class="col-idx">序号</th>
                    <th class="col-ioc">IOC</th>
                    <th class="col-count">命中次数</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in iocRanking" :key="index">
                    <td class="col-idx">{{ index + 1 }}</td>
                    <td class="col-ioc">{{ item.ioc }}</td>
                    <td class="col-count">{{ item.count }}</td>
                  </tr>
                </tbody>
              </table>
              <div class="ti-diagnosis-pagination">
                <button class="ti-page-btn" :disabled="iocPage <= 1">上一页</button>
                <span>共 {{ iocTotal }} 条</span>
                <button class="ti-page-btn" :disabled="iocPage >= Math.ceil(iocTotal / iocPageSize)">下一页</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'ip-stats'" class="ti-ip-stats">
        <div class="ti-section">
          <div class="ti-section-header">
            <h3 class="ti-section-title">IP统计</h3>
            <div class="ti-ip-stats-toolbar">
              <div class="ti-ip-stats-filters">
                <input class="ti-ip-stats-input" v-model="ipStatsMac" placeholder="MAC" />
                <input class="ti-ip-stats-input" v-model="ipStatsSrcIp" placeholder="源IP" />
                <input class="ti-ip-stats-input" v-model="ipStatsDstIp" placeholder="目标IP" />
                <input class="ti-ip-stats-input" v-model="ipStatsSrcPort" placeholder="源端口" />
                <input class="ti-ip-stats-input" v-model="ipStatsDstPort" placeholder="目标端口" />
                <div class="ti-ip-stats-ip-version">
                  <button class="ti-ip-stats-ip-btn" :class="{ active: ipStatsIpVersion === 'ipv4' }" @click="ipStatsIpVersion = 'ipv4'">IPv4</button>
                  <button class="ti-ip-stats-ip-btn" :class="{ active: ipStatsIpVersion === 'ipv6' }" @click="ipStatsIpVersion = 'ipv6'">IPv6</button>
                </div>
                <input class="ti-ip-stats-input" v-model="ipStatsKeyword" placeholder="关键字" />
                <select class="ti-ip-stats-select" v-model="ipStatsSource">
                  <option value="">情报源</option>
                  <option value="奇安信商业情报">奇安信商业情报</option>
                  <option value="奇安信免费情报">奇安信免费情报</option>
                </select>
                <select class="ti-ip-stats-select" v-model="ipStatsIntelType">
                  <option value="">情报类型</option>
                  <option value="僵尸网络">僵尸网络</option>
                  <option value="恶意软件">恶意软件</option>
                </select>
                <select class="ti-ip-stats-select" v-model="ipStatsLevel">
                  <option value="">威胁等级</option>
                  <option value="高">高</option>
                  <option value="中">中</option>
                  <option value="低">低</option>
                </select>
                <input class="ti-ip-stats-input" v-model="ipStatsAccount" placeholder="用户账号" />
                <select class="ti-ip-stats-select" v-model="ipStatsLink">
                  <option value="">链路</option>
                  <option value="链路1">链路1</option>
                  <option value="链路2">链路2</option>
                </select>
                <select class="ti-ip-stats-select" v-model="ipStatsCondition">
                  <option value="and">条件关系 与</option>
                  <option value="or">条件关系 或</option>
                </select>
                <input class="ti-ip-stats-input" v-model="ipStatsStartTime" placeholder="开始时间" />
                <input class="ti-ip-stats-input" v-model="ipStatsEndTime" placeholder="结束时间" />
                <button class="ti-ip-stats-btn-search" @click="filterIpStats">搜索</button>
                <button class="ti-ip-stats-btn-reset" @click="resetIpStatsFilters">重置</button>
              </div>
              <div class="ti-ip-stats-actions">
                <button class="ti-ip-stats-btn" @click="exportIpStats">导出</button>
              </div>
            </div>
          </div>
          <div class="ti-table-wrap">
            <table class="ti-table">
              <thead>
                <tr>
                  <th class="col-idx">序号</th>
                  <th class="col-src-ip">源IP:端口</th>
                  <th class="col-count">命中次数</th>
                  <th class="col-account">用户账号</th>
                  <th class="col-dst-ip">目标IP:端口</th>
                  <th class="col-dst-port">目标端口</th>
                  <th class="col-source">情报源</th>
                  <th class="col-intel-type">情报类型</th>
                  <th class="col-ioc">IOC</th>
                  <th class="col-threat-level">威胁等级</th>
                  <th class="col-action">执行动作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in ipStatsData" :key="item.id">
                  <td class="col-idx">{{ index + 1 }}</td>
                  <td class="col-src-ip">
                    <span class="ti-link ti-action-trigger" @click.stop="showIpStatsMenu($event, item.srcIp)" @contextmenu.prevent="showIpStatsMenu($event, item.srcIp)">
                      {{ item.srcIp }}
                    </span>
                  </td>
                  <td class="col-count">{{ item.count }}</td>
                  <td class="col-account">{{ item.account }}</td>
                  <td class="col-dst-ip">
                    <span class="ti-link ti-action-trigger" @click.stop="showIpStatsMenu($event, item.dstIp)" @contextmenu.prevent="showIpStatsMenu($event, item.dstIp)">
                      {{ item.dstIp }}
                    </span>
                  </td>
                  <td class="col-dst-port">{{ item.dstPort }}</td>
                  <td class="col-source">{{ item.source }}</td>
                  <td class="col-intel-type"><span class="ti-type-tag">{{ item.intelType }}</span></td>
                  <td class="col-ioc">
                    <span class="ti-link ti-action-trigger" @click.stop="showIpStatsMenu($event, item.ioc)" @contextmenu.prevent="showIpStatsMenu($event, item.ioc)">
                      {{ item.ioc }}
                    </span>
                  </td>
                  <td class="col-threat-level"><span class="ti-level" :class="'ti-level-' + item.level">{{ item.level }}</span></td>
                  <td class="col-action">
                    <span class="ti-action-btn" @click.stop="showIpStatsMenu($event, item.srcIp)">🔍</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="ti-history-pagination">
            <button class="ti-page-btn" :disabled="ipStatsCurrentPage <= 1">上一页</button>
            <button class="ti-page-btn" v-for="page in ipStatsPageList" :key="page" :class="{ active: ipStatsCurrentPage === page }" @click="ipStatsCurrentPage = page">{{ page }}</button>
            <button class="ti-page-btn" :disabled="ipStatsCurrentPage >= Math.ceil(ipStatsTotalCount / ipStatsPageSize)">下一页</button>
            <span>到第</span>
            <input type="number" class="ti-page-input" v-model.number="ipStatsCurrentPage" min="1" />
            <span>页</span>
            <button class="ti-page-btn" @click="confirmIpStatsPage">确定</button>
            <span>共 {{ ipStatsTotalCount }} 条</span>
            <select class="ti-page-select" v-model="ipStatsPageSize">
              <option value="20">20条/页</option>
              <option value="50">50条/页</option>
              <option value="100">100条/页</option>
            </select>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'whitelist'" class="ti-whitelist">
        <div class="ti-section">
          <div class="ti-section-header">
            <h3 class="ti-section-title">白名单</h3>
            <div class="ti-whitelist-toolbar">
              <div class="ti-whitelist-filter">
                <input class="ti-whitelist-search" v-model="whitelistKeyword" placeholder="关键字搜索" />
                <button class="ti-whitelist-btn-search" @click="filterWhitelist">搜索</button>
              </div>
              <div class="ti-whitelist-actions">
                <button class="ti-whitelist-btn" @click="openAddWhitelistModal">+添加</button>
                <button class="ti-whitelist-btn" @click="deleteAllWhitelist">全删除</button>
                <button class="ti-whitelist-btn" @click="importWhitelist">全导入</button>
                <button class="ti-whitelist-btn" @click="exportWhitelist">全导出</button>
              </div>
            </div>
          </div>
          <div class="ti-table-wrap">
            <table class="ti-table">
              <thead>
                <tr>
                  <th class="col-check"><input type="checkbox" v-model="selectAllWhitelist" @change="toggleSelectAllWhitelist" /></th>
                  <th class="col-idx">序号</th>
                  <th class="col-object">白名单对象</th>
                  <th class="col-actions">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in whitelistItems" :key="item.id">
                  <td class="col-check"><input type="checkbox" v-model="selectedWhitelist" :value="item.id" /></td>
                  <td class="col-idx">{{ index + 1 }}</td>
                  <td class="col-object">{{ item.object }}</td>
                  <td class="col-actions">
                    <button class="ti-table-btn" @click="deleteWhitelistItem(item.id)">删除</button>
                  </td>
                </tr>
                <tr v-if="whitelistItems.length === 0">
                  <td colspan="4" class="ti-no-data">无数据</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'account-stats'" class="ti-account-stats">
        <div class="ti-section">
          <div class="ti-section-header">
            <h3 class="ti-section-title">账号统计</h3>
            <div class="ti-account-stats-toolbar">
              <div class="ti-account-stats-filters">
                <input class="ti-account-stats-input" v-model="accountStatsMac" placeholder="MAC" />
                <input class="ti-account-stats-input" v-model="accountStatsSrcIp" placeholder="源IP" />
                <input class="ti-account-stats-input" v-model="accountStatsDstIp" placeholder="目标IP" />
                <input class="ti-account-stats-input" v-model="accountStatsSrcPort" placeholder="源端口" />
                <input class="ti-account-stats-input" v-model="accountStatsDstPort" placeholder="目标端口" />
                <div class="ti-account-stats-ip-version">
                  <button class="ti-account-stats-ip-btn" :class="{ active: accountStatsIpVersion === 'ipv4' }" @click="accountStatsIpVersion = 'ipv4'">IPv4</button>
                  <button class="ti-account-stats-ip-btn" :class="{ active: accountStatsIpVersion === 'ipv6' }" @click="accountStatsIpVersion = 'ipv6'">IPv6</button>
                </div>
                <input class="ti-account-stats-input" v-model="accountStatsKeyword" placeholder="关键字" />
                <select class="ti-account-stats-select" v-model="accountStatsSource">
                  <option value="">情报源</option>
                  <option value="奇安信商业情报">奇安信商业情报</option>
                  <option value="奇安信免费情报">奇安信免费情报</option>
                </select>
                <select class="ti-account-stats-select" v-model="accountStatsIntelType">
                  <option value="">情报类型</option>
                  <option value="僵尸网络">僵尸网络</option>
                  <option value="恶意软件">恶意软件</option>
                </select>
                <select class="ti-account-stats-select" v-model="accountStatsLevel">
                  <option value="">威胁等级</option>
                  <option value="高">高</option>
                  <option value="中">中</option>
                  <option value="低">低</option>
                </select>
                <input class="ti-account-stats-input" v-model="accountStatsAccount" placeholder="用户账号" />
                <select class="ti-account-stats-select" v-model="accountStatsLink">
                  <option value="">链路</option>
                  <option value="链路1">链路1</option>
                  <option value="链路2">链路2</option>
                </select>
                <select class="ti-account-stats-select" v-model="accountStatsCondition">
                  <option value="and">条件关系 与</option>
                  <option value="or">条件关系 或</option>
                </select>
                <input class="ti-account-stats-input" v-model="accountStatsStartTime" placeholder="开始时间" />
                <input class="ti-account-stats-input" v-model="accountStatsEndTime" placeholder="结束时间" />
                <button class="ti-account-stats-btn-search" @click="filterAccountStats">搜索</button>
                <button class="ti-account-stats-btn-reset" @click="resetAccountStatsFilters">重置</button>
              </div>
              <div class="ti-account-stats-actions">
                <button class="ti-account-stats-btn" @click="exportAccountStats">导出</button>
              </div>
            </div>
          </div>
          <div class="ti-table-wrap">
            <table class="ti-table">
              <thead>
                <tr>
                  <th class="col-idx">序号</th>
                  <th class="col-account">用户账号</th>
                  <th class="col-src-ip">源IP</th>
                  <th class="col-count">命中次数</th>
                  <th class="col-dst-ip">目标IP</th>
                  <th class="col-dst-port">目标端口</th>
                  <th class="col-source">情报源</th>
                  <th class="col-intel-type">情报类型</th>
                  <th class="col-ioc">IOC</th>
                  <th class="col-threat-level">威胁等级</th>
                  <th class="col-action">执行动作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in accountStatsData" :key="item.id">
                  <td class="col-idx">{{ index + 1 }}</td>
                  <td class="col-account">{{ item.account }}</td>
                  <td class="col-src-ip">
                    <span class="ti-link ti-action-trigger" @click.stop="showAccountStatsMenu($event, item.srcIp)" @contextmenu.prevent="showAccountStatsMenu($event, item.srcIp)">
                      {{ item.srcIp }}
                    </span>
                  </td>
                  <td class="col-count">{{ item.count }}</td>
                  <td class="col-dst-ip">
                    <span class="ti-link ti-action-trigger" @click.stop="showAccountStatsMenu($event, item.dstIp)" @contextmenu.prevent="showAccountStatsMenu($event, item.dstIp)">
                      {{ item.dstIp }}
                    </span>
                  </td>
                  <td class="col-dst-port">{{ item.dstPort }}</td>
                  <td class="col-source">{{ item.source }}</td>
                  <td class="col-intel-type"><span class="ti-type-tag">{{ item.intelType }}</span></td>
                  <td class="col-ioc">
                    <span class="ti-link ti-action-trigger" @click.stop="showAccountStatsMenu($event, item.ioc)" @contextmenu.prevent="showAccountStatsMenu($event, item.ioc)">
                      {{ item.ioc }}
                    </span>
                  </td>
                  <td class="col-threat-level"><span class="ti-level" :class="'ti-level-' + item.level">{{ item.level }}</span></td>
                  <td class="col-action">
                    <span class="ti-action-btn" @click.stop="showAccountStatsMenu($event, item.srcIp)">🔍</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="ti-history-pagination">
            <button class="ti-page-btn" :disabled="accountStatsCurrentPage <= 1">上一页</button>
            <button class="ti-page-btn" v-for="page in accountStatsPageList" :key="page" :class="{ active: accountStatsCurrentPage === page }" @click="accountStatsCurrentPage = page">{{ page }}</button>
            <button class="ti-page-btn" :disabled="accountStatsCurrentPage >= Math.ceil(accountStatsTotalCount / accountStatsPageSize)">下一页</button>
            <span>到第</span>
            <input type="number" class="ti-page-input" v-model.number="accountStatsCurrentPage" min="1" />
            <span>页</span>
            <button class="ti-page-btn" @click="confirmAccountStatsPage">确定</button>
            <span>共 {{ accountStatsTotalCount }} 条</span>
            <select class="ti-page-select" v-model="accountStatsPageSize">
              <option value="20">20条/页</option>
              <option value="50">50条/页</option>
              <option value="100">100条/页</option>
            </select>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'manage'" class="ti-manage">
        <div class="ti-section">
          <div class="ti-section-header">
            <h3 class="ti-section-title">情报管理</h3>
            <div class="ti-manage-toolbar">
              <div class="ti-manage-filter">
                <select class="ti-manage-select" v-model="manageRefreshPeriod">
                  <option value="10">10秒</option>
                  <option value="30">30秒</option>
                  <option value="60">1分钟</option>
                  <option value="300">5分钟</option>
                  <option value="0">不刷新</option>
                </select>
                <select class="ti-manage-select" v-model="manageIntelType">
                  <option value="all">情报类型</option>
                  <option value="免费情报">免费情报</option>
                  <option value="商业情报">商业情报</option>
                </select>
                <input class="ti-manage-search" v-model="manageSearchKeyword" placeholder="关键字搜索" @keyup.enter="filterManageThreatTypes" />
                <button class="ti-manage-btn-search" @click="filterManageThreatTypes">搜索</button>
              </div>
              <div class="ti-manage-actions">
                <button class="ti-manage-btn" @click="openBatchSetModal">批量设置</button>
                <button class="ti-manage-btn" @click="openClearHitConfirmModal">清空命中次数</button>
              </div>
            </div>
          </div>
          <div class="ti-table-wrap">
            <table class="ti-table">
              <thead>
                <tr>
                  <th class="col-check"><input type="checkbox" v-model="selectAllManageTypes" @change="toggleSelectAllManageTypes" /></th>
                  <th class="col-idx">序号</th>
                  <th class="col-type"><span class="ti-link" @click="sortManageBy('type')">威胁类型</span></th>
                  <th class="col-count"><span class="ti-link" @click="sortManageBy('count')">成员数量</span> <span v-if="manageSortField === 'count'">{{ manageSortOrder === 'asc' ? '↑' : '↓' }}</span></th>
                  <th class="col-monitor">监测</th>
                  <th class="col-block">阻断</th>
                  <th class="col-log">记录日志</th>
                  <th class="col-hit-count">命中次数</th>
                  <th class="col-trend">最近24小时命中趋势</th>
                  <th class="col-actions">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in sortedManageThreatTypes" :key="item.id">
                  <td class="col-check"><input type="checkbox" v-model="selectedManageTypes" :value="item.id" /></td>
                  <td class="col-idx">{{ index + 1 }}</td>
                  <td class="col-type ti-link" @click="openThreatTypeDetailModal(item)">{{ item.name }}</td>
                  <td class="col-count">{{ item.memberCount }}</td>
                  <td class="col-monitor"><el-switch v-model="item.monitor" @change="saveManageToggle(item, 'monitor')" /></td>
                  <td class="col-block"><el-switch v-model="item.block" @change="saveManageToggle(item, 'block')" /></td>
                  <td class="col-log"><el-switch v-model="item.log" @change="saveManageToggle(item, 'log')" /></td>
                  <td class="col-hit-count">{{ item.hitCount }}</td>
                  <td class="col-trend"><v-chart class="ti-trend-mini" :option="getMiniTrendOption(item.trendData)" autoresize /></td>
                  <td class="col-actions">
                    <button class="ti-table-btn" @click="openThreatTypeDetailModal(item)">编辑</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="packetAnalysisModal.visible" title="报文分析" width="1000px" :close-on-click-modal="false" @close="closeAllModals">
      <div class="ti-packet-analysis">
        <div class="ti-packet-tabs">
          <button v-for="tab in packetTabs" :key="tab.key" class="ti-packet-tab" :class="{ active: packetAnalysisModal.activeTab === tab.key }" @click="packetAnalysisModal.activeTab = tab.key">{{ tab.label }}</button>
        </div>
        <div class="ti-packet-toolbar">
          <input class="ti-packet-search" placeholder="报文显示过滤器" />
          <button class="ti-packet-btn">报文下载</button>
          <button class="ti-packet-btn">内容下载</button>
          <select class="ti-packet-select">
            <option>TOP 100</option>
            <option>TOP 200</option>
            <option>TOP 500</option>
            <option>全部</option>
          </select>
        </div>
        <div v-if="packetAnalysisModal.activeTab === 'analysis'" class="ti-packet-content">
          <div class="ti-packet-list">
            <table class="ti-table">
              <thead>
                <tr>
                  <th class="col-idx">序号</th>
                  <th class="col-time">时间</th>
                  <th class="col-src">源地址</th>
                  <th class="col-dst">目标地址</th>
                  <th class="col-proto">网络协议</th>
                  <th class="col-length">长度</th>
                  <th class="col-detail">详情</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(packet, index) in packetList" :key="packet.id" :class="{ active: index === 0 }">
                  <td class="col-idx">{{ index + 1 }}</td>
                  <td class="col-time">{{ packet.time }}</td>
                  <td class="col-src">{{ packet.src }}</td>
                  <td class="col-dst">{{ packet.dst }}</td>
                  <td class="col-proto">{{ packet.proto }}</td>
                  <td class="col-length">{{ packet.length }}</td>
                  <td class="col-detail">{{ packet.detail }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="ti-packet-detail">
            <pre class="ti-packet-text">{{ packetDetail }}</pre>
          </div>
          <div class="ti-packet-hex">
            <pre class="ti-packet-hex-text">{{ packetHex }}</pre>
          </div>
        </div>
        <div v-if="packetAnalysisModal.activeTab === 'interaction'" class="ti-packet-content">
          <div class="ti-packet-no-data">无数据</div>
        </div>
        <div v-if="packetAnalysisModal.activeTab === 'metadata'" class="ti-packet-content">
          <div class="ti-packet-no-data">无数据</div>
        </div>
        <div v-if="packetAnalysisModal.activeTab === 'certificate'" class="ti-packet-content">
          <div class="ti-packet-no-data">无数据</div>
        </div>
        <div v-if="packetAnalysisModal.activeTab === 'export'" class="ti-packet-content">
          <div class="ti-packet-no-data">无数据</div>
        </div>
        <div v-if="packetAnalysisModal.activeTab === 'timeline'" class="ti-packet-content">
          <div class="ti-packet-no-data">无数据</div>
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="addWhitelistModal.visible" title="添加" width="450px" :close-on-click-modal="false" @close="closeAllModals">
      <div class="ti-add-whitelist">
        <div class="ti-add-item">
          <span class="ti-add-label">白名单对象</span>
          <input class="ti-add-input" v-model="addWhitelistModal.object" placeholder="请输入白名单对象" />
        </div>
        <div class="ti-add-checkbox">
          <input type="checkbox" v-model="addWhitelistModal.autoClose" />
          <span>执行成功后，自动关闭窗口</span>
        </div>
        <div class="ti-add-actions">
          <button class="ti-add-btn-primary" @click="confirmAddWhitelist">确定</button>
          <button class="ti-add-btn" @click="addWhitelistModal.visible = false">取消</button>
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="threatTypeDetailModal.visible" :title="threatTypeDetailModal.title || '威胁类型详情'" width="600px" :close-on-click-modal="false" @close="closeAllModals">
      <div v-if="threatTypeDetailModal.loading" class="ti-modal-loading">
        <div class="ti-loading-spinner"></div>
        <span>数据加载中...</span>
      </div>
      <div v-else class="ti-threat-detail">
        <div class="ti-detail-header">
          <h4>{{ threatTypeDetailModal.name }}</h4>
        </div>
        <div class="ti-detail-content">
          <p>{{ threatTypeDetailModal.description }}</p>
        </div>
        <div class="ti-detail-actions">
          <button class="ti-detail-btn">了解</button>
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="batchSetModal.visible" title="批量设置" width="400px" :close-on-click-modal="false" @close="closeAllModals">
      <div class="ti-batch-set">
        <div class="ti-batch-item">
          <span class="ti-batch-label">监测</span>
          <select class="ti-batch-select" v-model="batchSetModal.monitor">
            <option value="none">不设置</option>
            <option value="on">开启</option>
            <option value="off">关闭</option>
          </select>
        </div>
        <div class="ti-batch-item">
          <span class="ti-batch-label">阻断</span>
          <select class="ti-batch-select" v-model="batchSetModal.block">
            <option value="none">不设置</option>
            <option value="on">开启</option>
            <option value="off">关闭</option>
          </select>
        </div>
        <div class="ti-batch-item">
          <span class="ti-batch-label">记录日志</span>
          <select class="ti-batch-select" v-model="batchSetModal.log">
            <option value="none">不设置</option>
            <option value="on">开启</option>
            <option value="off">关闭</option>
          </select>
        </div>
        <div class="ti-batch-actions">
          <button class="ti-batch-btn-primary" @click="confirmBatchSet">确定</button>
          <button class="ti-batch-btn" @click="batchSetModal.visible = false">取消</button>
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="clearHitConfirmModal.visible" title="操作确认" width="350px" :close-on-click-modal="false" @close="closeAllModals">
      <div class="ti-clear-confirm">
        <div class="ti-clear-icon">⚠</div>
        <div class="ti-clear-text">确定要清空命中次数吗？</div>
        <div class="ti-clear-actions">
          <button class="ti-clear-btn-primary" @click="confirmClearHit">确定</button>
          <button class="ti-clear-btn" @click="clearHitConfirmModal.visible = false">取消</button>
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="manageHitLogModal.visible" :title="manageHitLogModal.title || '命中日志'" width="1000px" :close-on-click-modal="false" @close="closeAllModals">
      <div class="ti-manage-hit-log">
        <v-chart class="ti-chart" :option="manageHitLogChartOption" autoresize />
        <div class="ti-table-wrap">
          <table class="ti-table">
            <thead>
              <tr>
                <th class="col-idx">序号</th>
                <th class="col-time">最新命中时间</th>
                <th class="col-src-ip">源IP:端口</th>
                <th class="col-account">账号</th>
                <th class="col-dst-ip">目标IP:端口</th>
                <th class="col-location">地理位置</th>
                <th class="col-proto">协议</th>
                <th class="col-threat-level">威胁等级</th>
                <th class="col-intel-type">情报类型</th>
                <th class="col-malicious-family">恶意家族</th>
                <th class="col-ioc">IOC</th>
                <th class="col-action">执行动作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(log, index) in manageHitLogs" :key="log.id">
                <td class="col-idx">{{ index + 1 }}</td>
                <td class="col-time">{{ log.time }}</td>
                <td class="col-src-ip">{{ log.srcIpPort }}</td>
                <td class="col-account">{{ log.account }}</td>
                <td class="col-dst-ip">{{ log.dstIpPort }}</td>
                <td class="col-location">{{ log.location }}</td>
                <td class="col-proto">{{ log.proto }}</td>
                <td class="col-threat-level">{{ log.threatLevel }}</td>
                <td class="col-intel-type">{{ log.intelType }}</td>
                <td class="col-malicious-family">{{ log.maliciousFamily }}</td>
                <td class="col-ioc">{{ log.ioc }}</td>
                <td class="col-action">{{ log.action }}</td>
              </tr>
              <tr v-if="manageHitLogs.length === 0">
                <td colspan="12" class="ti-no-data">无数据</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="ti-manage-pagination">
          <button class="ti-page-btn" :disabled="manageCurrentPage <= 1">上一页</button>
          <span>到第</span>
          <input type="number" class="ti-page-input" v-model.number="manageCurrentPage" min="1" />
          <span>页</span>
          <button class="ti-page-btn" @click="confirmManagePage">确定</button>
          <span>共 {{ manageTotalCount }} 条</span>
          <select class="ti-page-select" v-model="managePageSize">
            <option value="20">20条/页</option>
            <option value="50">50条/页</option>
            <option value="100">100条/页</option>
          </select>
          <button class="ti-page-btn" :disabled="manageCurrentPage >= Math.ceil(manageTotalCount / managePageSize)">下一页</button>
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="sourceDetailModal.visible" title="情报源分类详情" width="900px" :close-on-click-modal="false" @close="closeAllModals">
      <div v-if="sourceDetailModal.loading" class="ti-modal-loading">
        <div class="ti-loading-spinner"></div>
        <span>数据加载中...</span>
      </div>
      <div v-else class="ti-source-detail">
        <div class="ti-source-toolbar">
          <div class="ti-source-toolbar-left">
            <span class="ti-source-label">自动刷新周期</span>
            <select class="ti-source-select" v-model="sourceDetailModal.refreshPeriod" @change="updateRefreshPeriod">
              <option value="30">30秒</option>
              <option value="60">60秒</option>
              <option value="180">3分钟</option>
              <option value="0">不刷新</option>
            </select>
            <span class="ti-source-label">情报源锁定</span>
            <select class="ti-source-select" v-model="sourceDetailModal.lockFilter">
              <option value="all">全部</option>
              <option value="locked">已锁定</option>
              <option value="unlocked">未锁定</option>
            </select>
          </div>
          <div class="ti-source-toolbar-right">
            <input class="ti-source-search" placeholder="关键字搜索" v-model="sourceDetailModal.searchKeyword" @input="filterThreatTypes" />
            <button class="ti-source-btn">批量设置</button>
          </div>
        </div>
        <div class="ti-table-wrap">
          <table class="ti-table">
            <thead>
              <tr>
                <th class="col-check"><input type="checkbox" v-model="selectAllThreatTypes" @change="toggleSelectAllThreatTypes" /></th>
                <th class="col-idx">序号</th>
                <th class="col-type">威胁类型</th>
                <th class="col-count">成员数量</th>
                <th class="col-monitor">监测</th>
                <th class="col-block">阻断</th>
                <th class="col-log">日志</th>
                <th class="col-trend">命中趋势</th>
                <th class="col-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(type, index) in filteredThreatTypes" :key="type.id">
                <td class="col-check"><input type="checkbox" v-model="selectedThreatTypes" :value="type.id" /></td>
                <td class="col-idx">{{ index + 1 }}</td>
                <td class="col-type">{{ type.name }}</td>
                <td class="col-count">{{ type.memberCount }}</td>
                <td class="col-monitor"><el-switch v-model="type.monitor" @change="saveThreatTypeToggle(type, 'monitor')" /></td>
                <td class="col-block"><el-switch v-model="type.block" @change="saveThreatTypeToggle(type, 'block')" /></td>
                <td class="col-log"><el-switch v-model="type.log" @change="saveThreatTypeToggle(type, 'log')" /></td>
                <td class="col-trend"><v-chart class="ti-trend-mini" :option="getMiniTrendOption(type.trendData)" autoresize /></td>
                <td class="col-actions"><button class="ti-table-btn">编辑</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="alertConfigModal.visible" title="告警配置" width="900px" :close-on-click-modal="false" @close="closeAllModals">
      <div class="ti-alert-config">
        <div class="ti-alert-toolbar">
          <span class="ti-alert-label">情报源</span>
          <select class="ti-alert-select" v-model="alertConfigModal.source" @change="loadAlertConfig">
            <option value="all">全部情报源</option>
            <option v-for="source in intelSources" :key="source.id" :value="source.id">{{ source.name }}</option>
          </select>
          <button class="ti-alert-btn ti-alert-btn-save" @click="saveAlertThreshold">保存阈值</button>
          <button class="ti-alert-btn" @click="batchSetAlert">批量设置</button>
        </div>
        <div class="ti-table-wrap">
          <table class="ti-table">
            <thead>
              <tr>
                <th class="col-check"><input type="checkbox" v-model="selectAllAlertItems" @change="toggleSelectAllAlertItems" /></th>
                <th class="col-idx">序号</th>
                <th class="col-type">威胁类型</th>
                <th class="col-monitor">监测</th>
                <th class="col-threshold">自定义阈值</th>
                <th class="col-hits">命中次数</th>
                <th class="col-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in alertConfigItems" :key="item.id">
                <td class="col-check"><input type="checkbox" v-model="selectedAlertItems" :value="item.id" /></td>
                <td class="col-idx">{{ index + 1 }}</td>
                <td class="col-type">{{ item.type }}</td>
                <td class="col-monitor"><el-switch v-model="item.monitor" /></td>
                <td class="col-threshold">
                  <input type="number" class="ti-threshold-input" v-model.number="item.threshold" />
                </td>
                <td class="col-hits">{{ item.hitCount }}</td>
                <td class="col-actions">
                  <button class="ti-table-btn">详情</button>
                  <button class="ti-table-btn">编辑</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="alertNotifyModal.visible" title="告警推送渠道配置" width="900px" :close-on-click-modal="false" @close="closeAllModals">
      <div class="ti-alert-notify">
        <div class="ti-notify-tabs">
          <button v-for="tab in notifyTabs" :key="tab.key" class="ti-notify-tab" :class="{ active: alertNotifyModal.activeTab === tab.key }" @click="alertNotifyModal.activeTab = tab.key">{{ tab.label }}</button>
        </div>
        <div v-if="alertNotifyModal.activeTab === 'wechat'" class="ti-notify-content">
          <div class="ti-notify-qrcode">
            <div class="ti-qrcode-placeholder"></div>
            <span>微信公众号二维码</span>
          </div>
          <div class="ti-notify-switch">
            <span>推送开关</span>
            <el-switch v-model="notifyConfig.wechat.enabled" />
          </div>
          <button class="ti-notify-btn" @click="saveNotifyConfig">提交保存</button>
        </div>
        <div v-if="alertNotifyModal.activeTab === 'wework'" class="ti-notify-content">
          <div class="ti-notify-qrcode">
            <div class="ti-qrcode-placeholder"></div>
            <span>企业微信二维码</span>
          </div>
          <div class="ti-notify-switch">
            <span>推送开关</span>
            <el-switch v-model="notifyConfig.wework.enabled" />
          </div>
          <button class="ti-notify-btn" @click="saveNotifyConfig">提交保存</button>
        </div>
        <div v-if="alertNotifyModal.activeTab === 'dingtalk'" class="ti-notify-content">
          <div class="ti-notify-qrcode">
            <div class="ti-qrcode-placeholder"></div>
            <span>钉钉二维码</span>
          </div>
          <div class="ti-notify-switch">
            <span>推送开关</span>
            <el-switch v-model="notifyConfig.dingtalk.enabled" />
          </div>
          <button class="ti-notify-btn" @click="saveNotifyConfig">提交保存</button>
        </div>
        <div v-if="alertNotifyModal.activeTab === 'feishu'" class="ti-notify-content">
          <div class="ti-notify-qrcode">
            <div class="ti-qrcode-placeholder"></div>
            <span>飞书二维码</span>
          </div>
          <div class="ti-notify-switch">
            <span>推送开关</span>
            <el-switch v-model="notifyConfig.feishu.enabled" />
          </div>
          <button class="ti-notify-btn" @click="saveNotifyConfig">提交保存</button>
        </div>
        <div v-if="alertNotifyModal.activeTab === 'email'" class="ti-notify-content">
          <div class="ti-notify-form">
            <span class="ti-notify-label">SMTP服务器</span>
            <input class="ti-notify-input" v-model="notifyConfig.email.smtpServer" />
            <span class="ti-notify-label">SMTP端口</span>
            <input class="ti-notify-input" v-model.number="notifyConfig.email.smtpPort" />
            <span class="ti-notify-label">发件人邮箱</span>
            <input class="ti-notify-input" v-model="notifyConfig.email.sender" />
            <span class="ti-notify-label">推送开关</span>
            <el-switch v-model="notifyConfig.email.enabled" />
          </div>
          <button class="ti-notify-btn" @click="saveNotifyConfig">提交保存</button>
        </div>
        <div v-if="alertNotifyModal.activeTab === 'syslog'" class="ti-notify-content">
          <div class="ti-notify-form">
            <span class="ti-notify-label">Syslog服务器</span>
            <input class="ti-notify-input" v-model="notifyConfig.syslog.server" />
            <span class="ti-notify-label">Syslog端口</span>
            <input class="ti-notify-input" v-model.number="notifyConfig.syslog.port" />
            <span class="ti-notify-label">推送开关</span>
            <el-switch v-model="notifyConfig.syslog.enabled" />
          </div>
          <button class="ti-notify-btn" @click="saveNotifyConfig">提交保存</button>
        </div>
        <div v-if="alertNotifyModal.activeTab === 'users'" class="ti-notify-content">
          <div class="ti-table-wrap">
            <table class="ti-table">
              <thead>
                <tr>
                  <th class="col-check"><input type="checkbox" v-model="selectAllNotifyUsers" @change="toggleSelectAllNotifyUsers" /></th>
                  <th class="col-idx">序号</th>
                  <th class="col-name">姓名</th>
                  <th class="col-account">账号</th>
                  <th class="col-channel">绑定渠道</th>
                  <th class="col-actions">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(user, index) in notifyUsers" :key="user.id">
                  <td class="col-check"><input type="checkbox" v-model="selectedNotifyUsers" :value="user.id" /></td>
                  <td class="col-idx">{{ index + 1 }}</td>
                  <td class="col-name">{{ user.name }}</td>
                  <td class="col-account">{{ user.account }}</td>
                  <td class="col-channel">{{ user.channel }}</td>
                  <td class="col-actions"><button class="ti-table-btn">删除</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-if="alertNotifyModal.activeTab === 'test'" class="ti-notify-content">
          <div class="ti-test-form">
            <span class="ti-notify-label">测试渠道</span>
            <select class="ti-notify-select" v-model="notifyConfig.test.channel">
              <option value="wechat">微信</option>
              <option value="wework">企业微信</option>
              <option value="dingtalk">钉钉</option>
              <option value="feishu">飞书</option>
              <option value="email">邮箱</option>
            </select>
            <span class="ti-notify-label">接收人</span>
            <input class="ti-notify-input" v-model="notifyConfig.test.recipient" />
          </div>
          <button class="ti-notify-btn" @click="testNotify">发送测试消息</button>
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="intelQueryModal.visible" title="情报查询" width="500px" :close-on-click-modal="false" @close="closeAllModals">
      <div class="ti-intel-query">
        <div class="ti-query-form">
          <span class="ti-query-label">IP/域名</span>
          <input class="ti-query-input" v-model="intelQueryModal.queryValue" placeholder="请输入IP地址或域名" />
        </div>
        <button class="ti-query-btn" @click="queryIntel">查询</button>
        <div v-if="intelQueryModal.result" class="ti-query-result">
          <div class="ti-result-title">查询结果</div>
          <div class="ti-result-item" v-for="(item, index) in intelQueryModal.result" :key="index">
            <span class="ti-result-label">{{ item.label }}:</span>
            <span class="ti-result-value">{{ item.value }}</span>
          </div>
        </div>
        <div v-if="intelQueryModal.noResult" class="ti-query-noresult">未匹配到情报</div>
      </div>
    </el-dialog>

    <el-dialog v-model="customIntelModal.visible" title="自定义情报配置" width="500px" :close-on-click-modal="false" @close="closeAllModals">
      <div class="ti-custom-intel">
        <div class="ti-custom-item">
          <span class="ti-custom-label">IP黑名单群组</span>
          <select class="ti-custom-select" v-model="customIntelModal.ipGroup">
            <option v-for="group in ipBlacklistGroups" :key="group.id" :value="group.id">{{ group.name }}</option>
          </select>
          <button class="ti-custom-btn" @click="refreshIpGroup">刷新</button>
          <button class="ti-custom-btn" @click="editIpGroup">编辑</button>
        </div>
        <div class="ti-custom-item">
          <span class="ti-custom-label">域名黑名单群组</span>
          <select class="ti-custom-select" v-model="customIntelModal.domainGroup">
            <option v-for="group in domainBlacklistGroups" :key="group.id" :value="group.id">{{ group.name }}</option>
          </select>
          <button class="ti-custom-btn" @click="refreshDomainGroup">刷新</button>
          <button class="ti-custom-btn" @click="editDomainGroup">编辑</button>
        </div>
        <div class="ti-custom-actions">
          <button class="ti-custom-btn ti-custom-btn-primary" @click="saveCustomIntel">确定</button>
          <button class="ti-custom-btn" @click="customIntelModal.visible = false">取消</button>
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="syncConfirmModal.visible" title="同步确认" width="400px" :close-on-click-modal="false" @close="closeAllModals">
      <div class="ti-sync-confirm">
        <div class="ti-sync-icon">⚠</div>
        <div class="ti-sync-text">确定要立即同步情报吗？</div>
        <div class="ti-sync-desc">同步将从云端拉取最新威胁情报数据，并刷新当前页面所有数据。</div>
        <div class="ti-sync-actions">
          <button class="ti-sync-btn" @click="syncConfirmModal.visible = false">取消</button>
          <button class="ti-sync-btn ti-sync-btn-primary" @click="confirmSync">确定</button>
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="syncSettingsModal.visible" title="定时同步配置" width="500px" :close-on-click-modal="false" @close="closeAllModals">
      <div class="ti-sync-settings">
        <div class="ti-settings-item">
          <span class="ti-settings-label">每日自动同步时间</span>
          <input type="time" class="ti-settings-input" v-model="syncSettingsModal.syncTime" />
        </div>
        <div class="ti-settings-desc">系统将在每日指定时间自动从云端同步最新威胁情报数据。</div>
        <div class="ti-settings-actions">
          <button class="ti-settings-btn" @click="syncSettingsModal.visible = false">取消</button>
          <button class="ti-settings-btn ti-settings-btn-primary" @click="saveSyncSettings">确定</button>
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="ipProfileModal.visible" :title="`IP档案 - ${ipProfileModal.ip}`" width="900px" :close-on-click-modal="false" @close="closeAllModals">
      <div class="ti-ip-profile">
        <div class="ti-ip-tabs">
          <button v-for="tab in ipProfileTabs" :key="tab.key" class="ti-ip-tab" :class="{ active: ipProfileModal.activeTab === tab.key }" @click="ipProfileModal.activeTab = tab.key">{{ tab.label }}</button>
        </div>
        <div v-if="ipProfileModal.activeTab === 'traffic'" class="ti-ip-content">
          <div class="ti-ip-cards">
            <div class="ti-ip-card">
              <div class="ti-ip-card-label">上行流量</div>
              <div class="ti-ip-card-value">{{ ipProfileData.traffic.up }}</div>
            </div>
            <div class="ti-ip-card">
              <div class="ti-ip-card-label">下行流量</div>
              <div class="ti-ip-card-value">{{ ipProfileData.traffic.down }}</div>
            </div>
            <div class="ti-ip-card">
              <div class="ti-ip-card-label">连接数</div>
              <div class="ti-ip-card-value">{{ ipProfileData.traffic.connections }}</div>
            </div>
            <div class="ti-ip-card">
              <div class="ti-ip-card-label">命中次数</div>
              <div class="ti-ip-card-value">{{ ipProfileData.traffic.hits }}</div>
            </div>
          </div>
          <div class="ti-table-wrap">
            <table class="ti-table">
              <thead>
                <tr>
                  <th class="col-idx">序号</th>
                  <th class="col-proto">应用协议</th>
                  <th class="col-up">上行流量</th>
                  <th class="col-down">下行流量</th>
                  <th class="col-ratio">占比</th>
                  <th class="col-actions">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(proto, index) in ipProfileData.protocols" :key="proto.name">
                  <td class="col-idx">{{ index + 1 }}</td>
                  <td class="col-proto">{{ proto.name }}</td>
                  <td class="col-up">{{ proto.up }}</td>
                  <td class="col-down">{{ proto.down }}</td>
                  <td class="col-ratio">{{ proto.ratio }}</td>
                  <td class="col-actions"><button class="ti-table-btn" @click="goToTrace(proto.name)">溯源</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-if="ipProfileModal.activeTab === 'connections'" class="ti-ip-content">
          <div class="ti-table-wrap">
            <table class="ti-table">
              <thead>
                <tr>
                  <th class="col-idx">序号</th>
                  <th class="col-time">连接时间</th>
                  <th class="col-dst">目标IP</th>
                  <th class="col-port">目标端口</th>
                  <th class="col-proto">协议</th>
                  <th class="col-duration">持续时间</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(conn, index) in ipProfileData.connections" :key="index">
                  <td class="col-idx">{{ index + 1 }}</td>
                  <td class="col-time">{{ conn.time }}</td>
                  <td class="col-dst ti-link" @click="openIpProfileModal(conn.dstIp)">{{ conn.dstIp }}</td>
                  <td class="col-port">{{ conn.port }}</td>
                  <td class="col-proto">{{ conn.proto }}</td>
                  <td class="col-duration">{{ conn.duration }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-if="ipProfileModal.activeTab === 'accounts'" class="ti-ip-content">
          <div class="ti-table-wrap">
            <table class="ti-table">
              <thead>
                <tr>
                  <th class="col-idx">序号</th>
                  <th class="col-name">用户账号</th>
                  <th class="col-time">登录时间</th>
                  <th class="col-status">状态</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(account, index) in ipProfileData.accounts" :key="account.name">
                  <td class="col-idx">{{ index + 1 }}</td>
                  <td class="col-name">{{ account.name }}</td>
                  <td class="col-time">{{ account.loginTime }}</td>
                  <td class="col-status">{{ account.status }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-if="ipProfileModal.activeTab === 'threat'" class="ti-ip-content">
          <div class="ti-table-wrap">
            <table class="ti-table">
              <thead>
                <tr>
                  <th class="col-idx">序号</th>
                  <th class="col-type">威胁类型</th>
                  <th class="col-level">威胁等级</th>
                  <th class="col-source">情报源</th>
                  <th class="col-time">命中时间</th>
                  <th class="col-ioc">IOC</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(threat, index) in ipProfileData.threats" :key="index">
                  <td class="col-idx">{{ index + 1 }}</td>
                  <td class="col-type">{{ threat.type }}</td>
                  <td class="col-level"><span class="ti-level" :class="'ti-level-' + threat.level">{{ threat.level }}</span></td>
                  <td class="col-source">{{ threat.source }}</td>
                  <td class="col-time">{{ threat.time }}</td>
                  <td class="col-ioc">{{ threat.ioc }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </el-dialog>

    <div v-if="ipStatsMenuVisible" class="ti-ip-stats-menu" :style="{ left: ipStatsMenuPosition.x + 'px', top: ipStatsMenuPosition.y + 'px' }" @click.stop>
      <div class="ti-ip-stats-menu-item" @click="handleIpStatsMenuAction('diagnosis')">数据诊断</div>
      <div class="ti-ip-stats-menu-item" @click="handleIpStatsMenuAction('history')">历史命中</div>
    </div>

    <div v-if="accountStatsMenuVisible" class="ti-account-stats-menu" :style="{ left: accountStatsMenuPosition.x + 'px', top: accountStatsMenuPosition.y + 'px' }" @click.stop>
      <div class="ti-account-stats-menu-item" @click="handleAccountStatsMenuAction('diagnosis')">数据诊断</div>
      <div class="ti-account-stats-menu-item" @click="handleAccountStatsMenuAction('history')">历史命中</div>
    </div>

    <el-dialog v-model="certHistoryModal.visible" :title="certHistoryModal.title" width="1200px" :close-on-click-modal="false" @close="closeAllModals">
      <div class="ti-cert-history">
        <div class="ti-cert-history-filters">
          <div class="ti-cert-history-filter-row">
            <select class="ti-cert-history-select" v-model="certHistorySrcIp">
              <option value="">源IP</option>
              <option value="任意IP">任意IP</option>
              <option value="166.111.5.220">166.111.5.220</option>
              <option value="101.6.64.201">101.6.64.201</option>
            </select>
            <input class="ti-cert-history-input" v-model="certHistorySrcPort" placeholder="源端口" />
            <select class="ti-cert-history-select" v-model="certHistoryDstIp">
              <option value="">目标IP</option>
              <option value="任意IP">任意IP</option>
              <option value="116.62.205.66">116.62.205.66</option>
              <option value="101.6.6.853">101.6.6.853</option>
            </select>
            <input class="ti-cert-history-input" v-model="certHistoryDstPort" placeholder="目标端口" />
            <input class="ti-cert-history-input" v-model="certHistoryKeyword" placeholder="关键字" />
          </div>
          <div class="ti-cert-history-filter-row">
            <input class="ti-cert-history-input" v-model="certHistoryMac" placeholder="MAC" />
            <input class="ti-cert-history-input" v-model="certHistoryAltName" placeholder="备用名称" />
            <input class="ti-cert-history-input" v-model="certHistoryStartTime" placeholder="开始时间" />
            <input class="ti-cert-history-input" v-model="certHistoryEndTime" placeholder="结束时间" />
            <button class="ti-cert-history-btn-search" @click="filterCertHistory">搜索</button>
            <button class="ti-cert-history-btn-reset" @click="resetCertHistoryFilters">重置</button>
          </div>
        </div>
        <div class="ti-table-wrap">
          <table class="ti-table">
            <thead>
              <tr>
                <th class="col-idx">序号</th>
                <th class="col-time">请求时间</th>
                <th class="col-mac">MAC</th>
                <th class="col-mac-vendor">MAC厂商</th>
                <th class="col-src-ip">源IP</th>
                <th class="col-dst-ip">目标IP</th>
                <th class="col-location">地理位置</th>
                <th class="col-cert-summary">证书摘要</th>
                <th class="col-action">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in certHistoryData" :key="item.id">
                <td class="col-idx">{{ index + 1 }}</td>
                <td class="col-time">{{ item.time }}</td>
                <td class="col-mac">{{ item.mac }}</td>
                <td class="col-mac-vendor">{{ item.vendor }}</td>
                <td class="col-src-ip">{{ item.srcIp }}</td>
                <td class="col-dst-ip">{{ item.dstIp }}</td>
                <td class="col-location"><span class="ti-location-tag">{{ item.location }}</span></td>
                <td class="col-cert-summary">
                  <div class="ti-cert-summary-content">
                    <div v-for="(line, idx) in item.summaryLines" :key="idx">{{ line }}</div>
                  </div>
                </td>
                <td class="col-action">
                  <button class="ti-cert-history-action-btn">下载</button>
                  <button class="ti-cert-history-action-btn">详情</button>
                  <button class="ti-cert-history-action-btn">数据包</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="ti-history-pagination">
          <button class="ti-page-btn" :disabled="certHistoryCurrentPage <= 1">上一页</button>
          <button class="ti-page-btn" v-for="page in certHistoryPageList" :key="page" :class="{ active: certHistoryCurrentPage === page }" @click="certHistoryCurrentPage = page">{{ page }}</button>
          <button class="ti-page-btn" :disabled="certHistoryCurrentPage >= Math.ceil(certHistoryTotalCount / certHistoryPageSize)">下一页</button>
          <span>到第</span>
          <input type="number" class="ti-page-input" v-model.number="certHistoryCurrentPage" min="1" />
          <span>页</span>
          <button class="ti-page-btn" @click="confirmCertHistoryPage">确定</button>
          <span>共 {{ certHistoryTotalCount }} 条</span>
          <select class="ti-page-select" v-model="certHistoryPageSize">
            <option value="20">20条/页</option>
            <option value="50">50条/页</option>
            <option value="100">100条/页</option>
          </select>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'
import { ElSwitch, ElDialog } from 'element-plus'

use([CanvasRenderer, LineChart, PieChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent])

const loading = ref(false)
const loadingText = ref('数据加载中...')
const activeTab = ref('overview')
const timeRange = ref('day')

const tabs = [
  { key: 'overview', label: '情报概况' },
  { key: 'realtime', label: '实时概况' },
  { key: 'cert-analysis', label: '证书分析' },
  { key: 'manage', label: '情报管理' },
  { key: 'whitelist', label: '白名单' },
  { key: 'hit-users', label: '命中用户' },
  { key: 'hit-logs', label: '命中日志' },
  { key: 'history', label: '历史命中' },
  { key: 'data-diagnosis', label: '数据诊断' },
  { key: 'ip-stats', label: 'IP统计' },
  { key: 'account-stats', label: '账号统计' },
]

const intelSources = ref([
  { id: 1, name: '奇安信威胁情报平台', authInfo: '开始2025-01-01 00:00:00 结束2030-12-05', encryptionStatus: '已加密', count: '2108660/106830', hitCount: '457676', matchEnabled: true, alertEnabled: true, autoSync: true, syncTime: '2026-07-09 03:30:25' },
  { id: 2, name: '奇安信社区情报平台', authInfo: '未授权', encryptionStatus: '未加密', count: '—', hitCount: '0', matchEnabled: false, alertEnabled: false, autoSync: false, syncTime: '—' },
  { id: 3, name: '免费情报', authInfo: '永久免费', encryptionStatus: '未加密', count: '0', hitCount: '0', matchEnabled: true, alertEnabled: false, autoSync: true, syncTime: '2026-07-08 00:00:00' },
])

const selectedSources = ref<number[]>([])
const selectAllSources = computed({
  get: () => selectedSources.value.length === intelSources.value.length,
  set: (val) => { selectedSources.value = val ? intelSources.value.map(s => s.id) : [] },
})

function toggleSelectAllSources() {}
function saveSourceToggle(source: any, field: string) {
  console.log('Save source toggle:', source.name, field, source[field])
}

const hitLogs = ref([
  { id: 1, time: '2026-07-09 10:45:32', srcIp: '192.168.1.105', dstIp: '104.16.181.15', proto: 'HTTPS', level: 'high', ioc: 'malicious.example.com' },
  { id: 2, time: '2026-07-09 10:42:18', srcIp: '192.168.1.108', dstIp: '104.16.181.16', proto: 'HTTPS', level: 'medium', ioc: 'suspicious.net' },
  { id: 3, time: '2026-07-09 10:38:45', srcIp: '192.168.1.112', dstIp: '198.51.100.20', proto: 'HTTP', level: 'low', ioc: 'adware.com' },
  { id: 4, time: '2026-07-09 10:35:22', srcIp: '192.168.1.105', dstIp: '104.16.181.15', proto: 'HTTPS', level: 'high', ioc: 'malicious.example.com' },
  { id: 5, time: '2026-07-09 10:30:15', srcIp: '192.168.1.115', dstIp: '104.16.181.17', proto: 'DNS', level: 'medium', ioc: 'suspicious-dns.net' },
])

const topUsers = ref([
  { ip: '192.168.1.105', mac: '54-2b-de-6d-10-ae', name: '张三', hitCount: 45 },
  { ip: '192.168.1.108', mac: '54-2b-de-6d-10-be', name: '李四', hitCount: 23 },
  { ip: '192.168.1.112', mac: '54-2b-de-6d-10-ce', name: '王五', hitCount: 15 },
  { ip: '192.168.1.115', mac: '54-2b-de-6d-10-de', name: '赵六', hitCount: 8 },
])

const trendXData = computed(() => {
  if (timeRange.value === 'day') return Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`)
  if (timeRange.value === 'week') return ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  return ['1日', '5日', '10日', '15日', '20日', '25日', '30日']
})

const trendChartOption = computed(() => ({
  tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#e4e7ed', borderWidth: 1, textStyle: { color: '#303133' } },
  legend: { data: ['恶意软件', '钓鱼网站', 'C&C服务器', '矿池', '垃圾邮件', '其他'], bottom: 0, textStyle: { fontSize: 12 } },
  grid: { left: '40', right: '20', top: '20', bottom: '45' },
  xAxis: { type: 'category', data: trendXData.value, axisLine: { lineStyle: { color: '#c8ccd0' } }, axisLabel: { fontSize: 11 } },
  yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: '#f0f2f5', type: 'dashed' } } },
  series: [
    { name: '恶意软件', type: 'line', smooth: true, data: [23, 18, 15, 12, 10, 8, 15, 35, 45, 52, 48, 55, 62, 58, 45, 38, 42, 55, 68, 72, 65, 58, 42, 28], lineStyle: { color: '#409eff' }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(64,158,255,0.2)' }, { offset: 1, color: 'rgba(64,158,255,0.02)' }] } } },
    { name: '钓鱼网站', type: 'line', smooth: true, data: [8, 6, 5, 4, 3, 2, 6, 12, 18, 22, 20, 24, 28, 25, 18, 14, 16, 22, 28, 32, 28, 24, 16, 10], lineStyle: { color: '#67c23a' }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(103,194,58,0.2)' }, { offset: 1, color: 'rgba(103,194,58,0.02)' }] } } },
    { name: 'C&C服务器', type: 'line', smooth: true, data: [12, 10, 8, 6, 5, 4, 8, 18, 22, 26, 24, 28, 32, 28, 22, 18, 20, 26, 32, 36, 32, 28, 20, 14], lineStyle: { color: '#f56c6c' }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(245,108,108,0.2)' }, { offset: 1, color: 'rgba(245,108,108,0.02)' }] } } },
    { name: '矿池', type: 'line', smooth: true, data: [5, 4, 3, 2, 2, 1, 4, 8, 12, 15, 14, 16, 18, 16, 12, 10, 11, 16, 20, 22, 18, 16, 12, 7], lineStyle: { color: '#e6a23c' }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(230,162,60,0.2)' }, { offset: 1, color: 'rgba(230,162,60,0.02)' }] } } },
    { name: '垃圾邮件', type: 'line', smooth: true, data: [15, 12, 10, 8, 6, 5, 10, 25, 32, 38, 35, 40, 45, 42, 35, 28, 32, 40, 48, 52, 45, 40, 30, 18], lineStyle: { color: '#909399' }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(144,147,153,0.2)' }, { offset: 1, color: 'rgba(144,147,153,0.02)' }] } } },
    { name: '其他', type: 'line', smooth: true, data: [8, 6, 5, 4, 3, 2, 6, 12, 16, 20, 18, 22, 26, 24, 18, 14, 16, 22, 28, 30, 26, 22, 16, 10], lineStyle: { color: '#9b59b6' }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(155,89,182,0.2)' }, { offset: 1, color: 'rgba(155,89,182,0.02)' }] } } },
  ],
}))

const pieChartOption = computed(() => ({
  tooltip: { trigger: 'item', formatter: '{b}: {c}次 ({d}%)' },
  legend: { orient: 'vertical', right: '5%', top: 'center', textStyle: { fontSize: 12 } },
  series: [{
    name: '命中分布', type: 'pie', radius: ['45%', '75%'], center: ['35%', '50%'],
    itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
    label: { show: true, position: 'inside', fontSize: 11, fontWeight: 600, color: '#fff', formatter: '{d}%' },
    data: [
      { name: '恶意软件', value: 42, itemStyle: { color: '#409eff' } },
      { name: '钓鱼网站', value: 18, itemStyle: { color: '#67c23a' } },
      { name: 'C&C服务器', value: 15, itemStyle: { color: '#f56c6c' } },
      { name: '矿池', value: 8, itemStyle: { color: '#e6a23c' } },
      { name: '垃圾邮件', value: 12, itemStyle: { color: '#909399' } },
      { name: '其他', value: 5, itemStyle: { color: '#9b59b6' } },
    ],
  }],
}))

function getMiniTrendOption(data: number[]) {
  return {
    grid: { left: 0, right: 0, top: 0, bottom: 0 },
    xAxis: { show: false, type: 'category', data: ['', '', '', '', ''] },
    yAxis: { show: false, type: 'value' },
    series: [{ type: 'line', smooth: true, data, lineStyle: { color: '#409eff', width: 1.5 }, areaStyle: { color: 'rgba(64,158,255,0.15)' }, symbol: 'none' }],
  }
}

const sourceDetailModal = reactive({
  visible: false,
  loading: false,
  refreshPeriod: '60',
  lockFilter: 'all',
  searchKeyword: '',
  currentSource: null as any,
})

const threatTypes = ref([
  { id: 1, name: '恶意软件', memberCount: '125,800', monitor: true, block: true, log: true, trendData: [23, 18, 15, 12, 10] },
  { id: 2, name: '钓鱼网站', memberCount: '32,000', monitor: true, block: true, log: true, trendData: [8, 6, 5, 4, 3] },
  { id: 3, name: 'C&C服务器', memberCount: '18,500', monitor: true, block: true, log: true, trendData: [12, 10, 8, 6, 5] },
  { id: 4, name: '矿池', memberCount: '8,200', monitor: true, block: false, log: true, trendData: [5, 4, 3, 2, 2] },
  { id: 5, name: '垃圾邮件', memberCount: '45,600', monitor: true, block: false, log: true, trendData: [15, 12, 10, 8, 6] },
  { id: 6, name: '勒索软件', memberCount: '5,800', monitor: true, block: true, log: true, trendData: [6, 4, 3, 2, 2] },
  { id: 7, name: 'APT攻击', memberCount: '3,200', monitor: true, block: true, log: true, trendData: [4, 3, 2, 2, 1] },
  { id: 8, name: 'DDoS攻击', memberCount: '12,400', monitor: true, block: true, log: true, trendData: [8, 6, 5, 4, 3] },
  { id: 9, name: 'Web攻击', memberCount: '28,600', monitor: true, block: true, log: true, trendData: [14, 10, 8, 6, 5] },
  { id: 10, name: '漏洞利用', memberCount: '6,800', monitor: true, block: true, log: true, trendData: [5, 4, 3, 2, 2] },
  { id: 11, name: '数据泄露', memberCount: '8,900', monitor: true, block: false, log: true, trendData: [6, 4, 3, 2, 2] },
  { id: 12, name: '其他威胁', memberCount: '15,200', monitor: true, block: false, log: true, trendData: [8, 6, 5, 4, 3] },
])

const filteredThreatTypes = computed(() => {
  if (!sourceDetailModal.searchKeyword) return threatTypes.value
  const keyword = sourceDetailModal.searchKeyword.toLowerCase()
  return threatTypes.value.filter(t => t.name.toLowerCase().includes(keyword))
})

const selectedThreatTypes = ref<number[]>([])
const selectAllThreatTypes = computed({
  get: () => selectedThreatTypes.value.length === filteredThreatTypes.value.length,
  set: (val) => { selectedThreatTypes.value = val ? filteredThreatTypes.value.map(t => t.id) : [] },
})

function toggleSelectAllThreatTypes() {}
function updateRefreshPeriod() { console.log('Update refresh period:', sourceDetailModal.refreshPeriod) }
function filterThreatTypes() {}
function saveThreatTypeToggle(type: any, field: string) { console.log('Save threat type toggle:', type.name, field, type[field]) }
function openSourceDetailModal(source: any) {
  sourceDetailModal.currentSource = source
  sourceDetailModal.visible = true
}

const whitelistKeyword = ref('')
const whitelistItems = ref([
  { id: 1, object: '192.168.1.0/24' },
  { id: 2, object: '10.0.0.0/8' },
  { id: 3, object: 'example.com' },
  { id: 4, object: '*.internal.com' },
])

const selectedWhitelist = ref<number[]>([])
const selectAllWhitelist = computed({
  get: () => selectedWhitelist.value.length === whitelistItems.value.length,
  set: (val) => { selectedWhitelist.value = val ? whitelistItems.value.map(i => i.id) : [] },
})

function toggleSelectAllWhitelist() {}
function filterWhitelist() { console.log('Filter whitelist:', whitelistKeyword.value) }
function deleteWhitelistItem(id: number) {
  whitelistItems.value = whitelistItems.value.filter(i => i.id !== id)
}
function deleteAllWhitelist() {
  if (selectedWhitelist.value.length === 0) {
    whitelistItems.value = []
  } else {
    whitelistItems.value = whitelistItems.value.filter(i => !selectedWhitelist.value.includes(i.id))
  }
  selectedWhitelist.value = []
}
function importWhitelist() { console.log('Import whitelist') }
function exportWhitelist() { console.log('Export whitelist') }

const addWhitelistModal = reactive({
  visible: false,
  object: '',
  autoClose: true,
})

function openAddWhitelistModal() {
  addWhitelistModal.object = ''
  addWhitelistModal.visible = true
}
function confirmAddWhitelist() {
  if (!addWhitelistModal.object.trim()) return
  whitelistItems.value.push({
    id: Date.now(),
    object: addWhitelistModal.object.trim(),
  })
  if (addWhitelistModal.autoClose) {
    addWhitelistModal.visible = false
  } else {
    addWhitelistModal.object = ''
  }
}

const hitLogsSource = ref('')
const hitLogsIntelType = ref('')
const hitLogsThreatType = ref('')
const hitLogsLevel = ref('')
const hitLogsKeyword = ref('')

const hitLogsData = ref([
  { id: 1, time: '2026-07-09 14:30:25', srcIp: '192.168.62.143:54321', account: 'user001', dstIp: '104.16.181.15:443', location: '美国', proto: 'HTTPS', level: '高', intelType: '恶意软件', maliciousFamily: 'Trojan', ioc: '104.16.181.15', action: '阻断' },
  { id: 2, time: '2026-07-09 14:28:18', srcIp: '172.28.8.9:51234', account: '-', dstIp: '198.51.100.25:80', location: '德国', proto: 'HTTP', level: '中', intelType: '钓鱼网站', maliciousFamily: '-', ioc: 'malicious.example.com', action: '记录' },
  { id: 3, time: '2026-07-09 14:25:42', srcIp: '10.6.5.151:58901', account: 'user002', dstIp: '203.0.113.100:443', location: '日本', proto: 'HTTPS', level: '低', intelType: 'C2节点', maliciousFamily: 'Botnet', ioc: '203.0.113.100', action: '监测' },
  { id: 4, time: '2026-07-09 14:22:15', srcIp: '172.28.11.4:56789', account: '-', dstIp: '192.0.2.50:8080', location: '中国', proto: 'HTTP', level: '高', intelType: 'APT攻击', maliciousFamily: 'APT28', ioc: '192.0.2.50', action: '阻断' },
  { id: 5, time: '2026-07-09 14:18:33', srcIp: '192.168.117.103:52100', account: 'user003', dstIp: '185.199.108.153:443', location: '美国', proto: 'HTTPS', level: '中', intelType: '网站后门', maliciousFamily: 'WebShell', ioc: '185.199.108.153', action: '记录' },
  { id: 6, time: '2026-07-09 14:15:08', srcIp: '10.6.6.204:59876', account: '-', dstIp: '173.252.110.27:443', location: '美国', proto: 'HTTPS', level: '低', intelType: '僵尸网络', maliciousFamily: 'Mirai', ioc: '173.252.110.27', action: '监测' },
  { id: 7, time: '2026-07-09 14:12:45', srcIp: '192.168.117.184:53421', account: 'user004', dstIp: '103.21.244.0:80', location: '新加坡', proto: 'HTTP', level: '高', intelType: '扫描器', maliciousFamily: '-', ioc: '103.21.244.0', action: '阻断' },
  { id: 8, time: '2026-07-09 14:10:12', srcIp: '192.168.53.128:55678', account: '-', dstIp: '199.59.243.120:443', location: '美国', proto: 'HTTPS', level: '中', intelType: 'TOR节点', maliciousFamily: '-', ioc: '199.59.243.120', action: '记录' },
])

const hitLogsCurrentPage = ref(1)
const hitLogsPageSize = ref(100)
const hitLogsTotalCount = ref(hitLogsData.value.length)

const filteredHitLogs = computed(() => {
  let list = [...hitLogsData.value]
  if (hitLogsSource.value) {
    list = list.filter(l => l.intelType === hitLogsSource.value)
  }
  if (hitLogsIntelType.value) {
    list = list.filter(l => l.intelType === hitLogsIntelType.value)
  }
  if (hitLogsThreatType.value) {
    list = list.filter(l => l.intelType === hitLogsThreatType.value)
  }
  if (hitLogsLevel.value) {
    list = list.filter(l => l.level === hitLogsLevel.value)
  }
  if (hitLogsKeyword.value) {
    const kw = hitLogsKeyword.value.toLowerCase()
    list = list.filter(l => l.srcIp.toLowerCase().includes(kw) || l.dstIp.toLowerCase().includes(kw) || l.ioc.toLowerCase().includes(kw))
  }
  hitLogsTotalCount.value = list.length
  return list
})

function filterHitLogsData() { console.log('Filter hit logs') }
function resetHitLogsFilters() {
  hitLogsSource.value = ''
  hitLogsIntelType.value = ''
  hitLogsThreatType.value = ''
  hitLogsLevel.value = ''
  hitLogsKeyword.value = ''
}
function exportHitLogs() { console.log('Export hit logs') }
function confirmHitLogsPage() { console.log('Go to page:', hitLogsCurrentPage.value) }

const historyMac = ref('')
const historySrcIp = ref('')
const historyDstIp = ref('')
const historyPort = ref('')
const historyProto = ref('')
const historyAction = ref('')
const historyIoc = ref('')
const historyLevel = ref('')
const historyIntelType = ref('')
const historyFamily = ref('')
const historyStartTime = ref('')
const historyEndTime = ref('')

const historyData = ref([
  { id: 1, time: '2026-07-09 15:55:42', mac: '54-2b-de-6d-10-ae', macVendor: 'NetChinaTechnol.6d-10-ae', account: '用户1', srcIp: '101.6.62.143:54321', dstIp: '101.6.6.6:53', proto: 'UDP', source: '奇安信威胁情报平台', block: '阻断', level: '高', intelType: '僵尸网络', maliciousFamily: 'kuai', ioc: 'cips.cips.cn' },
  { id: 2, time: '2026-07-09 15:55:34', mac: '54-2b-de-6d-10-ae', macVendor: 'NetChinaTechnol.6d-10-ae', account: '用户1', srcIp: '101.6.62.143:54321', dstIp: '101.6.6.6:53', proto: 'UDP', source: '奇安信威胁情报平台', block: '阻断', level: '高', intelType: '僵尸网络', maliciousFamily: 'kuai', ioc: 'cips.cips.cn' },
  { id: 3, time: '2026-07-09 15:55:26', mac: '54-2b-de-6d-10-ae', macVendor: 'NetChinaTechnol.6d-10-ae', account: '用户1', srcIp: '101.6.62.143:54321', dstIp: '101.6.6.6:53', proto: 'UDP', source: '奇安信威胁情报平台', block: '阻断', level: '高', intelType: '僵尸网络', maliciousFamily: 'kuai', ioc: 'cips.cips.cn' },
  { id: 4, time: '2026-07-09 15:55:18', mac: '54-2b-de-6d-10-ae', macVendor: 'NetChinaTechnol.6d-10-ae', account: '用户1', srcIp: '101.6.62.143:54321', dstIp: '101.6.6.6:53', proto: 'UDP', source: '奇安信威胁情报平台', block: '阻断', level: '高', intelType: '僵尸网络', maliciousFamily: 'kuai', ioc: 'cips.cips.cn' },
  { id: 5, time: '2026-07-09 15:55:10', mac: '54-2b-de-6d-10-ae', macVendor: 'NetChinaTechnol.6d-10-ae', account: '用户1', srcIp: '101.6.62.143:54321', dstIp: '101.6.6.6:53', proto: 'UDP', source: '奇安信威胁情报平台', block: '阻断', level: '高', intelType: '僵尸网络', maliciousFamily: 'kuai', ioc: 'cips.cips.cn' },
  { id: 6, time: '2026-07-09 15:55:02', mac: '54-2b-de-6d-10-ae', macVendor: 'NetChinaTechnol.6d-10-ae', account: '用户1', srcIp: '101.6.62.143:54321', dstIp: '101.6.6.6:53', proto: 'UDP', source: '奇安信威胁情报平台', block: '阻断', level: '高', intelType: '僵尸网络', maliciousFamily: 'kuai', ioc: 'cips.cips.cn' },
  { id: 7, time: '2026-07-09 15:54:54', mac: '54-2b-de-6d-10-ae', macVendor: 'NetChinaTechnol.6d-10-ae', account: '用户1', srcIp: '101.6.62.143:54321', dstIp: '101.6.6.6:53', proto: 'UDP', source: '奇安信威胁情报平台', block: '阻断', level: '高', intelType: '僵尸网络', maliciousFamily: 'kuai', ioc: 'cips.cips.cn' },
  { id: 8, time: '2026-07-09 15:54:46', mac: '54-2b-de-6d-10-ae', macVendor: 'NetChinaTechnol.6d-10-ae', account: '用户1', srcIp: '101.6.62.143:54321', dstIp: '101.6.6.6:53', proto: 'UDP', source: '奇安信威胁情报平台', block: '阻断', level: '高', intelType: '僵尸网络', maliciousFamily: 'kuai', ioc: 'cips.cips.cn' },
])

const historyCurrentPage = ref(1)
const historyPageSize = ref(20)
const historyTotalCount = ref(68)

const historyPageList = computed(() => {
  const total = Math.ceil(historyTotalCount.value / historyPageSize.value)
  const list: number[] = []
  for (let i = 1; i <= Math.min(7, total); i++) {
    list.push(i)
  }
  return list
})

const filteredHistory = computed(() => {
  let list = [...historyData.value]
  if (historyMac.value) {
    list = list.filter(l => l.mac.toLowerCase().includes(historyMac.value.toLowerCase()))
  }
  if (historySrcIp.value) {
    list = list.filter(l => l.srcIp.toLowerCase().includes(historySrcIp.value.toLowerCase()))
  }
  if (historyDstIp.value) {
    list = list.filter(l => l.dstIp.toLowerCase().includes(historyDstIp.value.toLowerCase()))
  }
  if (historyPort.value) {
    list = list.filter(l => l.srcIp.includes(historyPort.value) || l.dstIp.includes(historyPort.value))
  }
  if (historyProto.value) {
    list = list.filter(l => l.proto.toLowerCase().includes(historyProto.value.toLowerCase()))
  }
  if (historyAction.value) {
    list = list.filter(l => l.block === historyAction.value)
  }
  if (historyIoc.value) {
    list = list.filter(l => l.ioc.toLowerCase().includes(historyIoc.value.toLowerCase()))
  }
  if (historyLevel.value) {
    list = list.filter(l => l.level === historyLevel.value)
  }
  if (historyIntelType.value) {
    list = list.filter(l => l.intelType.toLowerCase().includes(historyIntelType.value.toLowerCase()))
  }
  if (historyFamily.value) {
    list = list.filter(l => l.maliciousFamily.toLowerCase().includes(historyFamily.value.toLowerCase()))
  }
  return list
})

const selectedHistory = ref<number[]>([])
const selectAllHistory = computed({
  get: () => selectedHistory.value.length === filteredHistory.value.length && filteredHistory.value.length > 0,
  set: (val) => { selectedHistory.value = val ? filteredHistory.value.map(h => h.id) : [] },
})

function toggleSelectAllHistory() {}
function filterHistoryData() { console.log('Filter history') }
function resetHistoryFilters() {
  historyMac.value = ''
  historySrcIp.value = ''
  historyDstIp.value = ''
  historyPort.value = ''
  historyProto.value = ''
  historyAction.value = ''
  historyIoc.value = ''
  historyLevel.value = ''
  historyIntelType.value = ''
  historyFamily.value = ''
  historyStartTime.value = ''
  historyEndTime.value = ''
}
function exportHistory() { console.log('Export history') }
function confirmHistoryPage() { console.log('Go to page:', historyCurrentPage.value) }

const diagnosisMac = ref('')
const diagnosisSrcIp = ref('')
const diagnosisSrcPort = ref('')
const diagnosisDstIp = ref('')
const diagnosisDstPort = ref('')
const diagnosisIpVersion = ref('ipv4')
const diagnosisKeyword = ref('')
const diagnosisSource = ref('')
const diagnosisIntelType = ref('')
const diagnosisLevel = ref('')
const diagnosisAccount = ref('')
const diagnosisLink = ref('')
const diagnosisCondition = ref('and')
const diagnosisStartTime = ref('')
const diagnosisEndTime = ref('')

const srcIpRanking = ref([
  { ip: '101.6.62.143', count: 1006 },
  { ip: '159.223.138.103', count: 13 },
  { ip: '113.207.13.58', count: 3 },
  { ip: '113.218.7.58', count: 3 },
  { ip: '223.94.77.103', count: 3 },
  { ip: '218.175.11.166', count: 2 },
  { ip: '101.6.6.200', count: 2 },
  { ip: '42.247.175.164', count: 2 },
  { ip: '121.225.78.142', count: 2 },
  { ip: '150.246.185.185', count: 1 },
])
const srcIpPage = ref(1)
const srcIpPageSize = ref(10)
const srcIpTotal = ref(9)

const dstIpRanking = ref([
  { ip: '101.6.6.63', count: 1000 },
  { ip: '155.118.8.28', count: 3 },
])
const dstIpPage = ref(1)
const dstIpPageSize = ref(10)
const dstIpTotal = ref(2)

const iocRanking = ref([
  { ioc: '101.6.62.143', count: 1006 },
  { ioc: 'tracker.trackerfix.com:25522/tcp', count: 13 },
  { ioc: 'tracker.trackerfix.com', count: 13 },
  { ioc: 'www.baidu.com', count: 3 },
  { ioc: 'one.newskycms.com', count: 2 },
  { ioc: '111.114.144', count: 2 },
  { ioc: 'cn.ogame.org', count: 2 },
  { ioc: 'www.wmibo.cn', count: 2 },
  { ioc: 'yashunfang.cn', count: 1 },
  { ioc: 'shenzhenbutian.com', count: 1 },
])
const iocPage = ref(1)
const iocPageSize = ref(10)
const iocTotal = ref(9)

function filterDiagnosisData() { console.log('Filter diagnosis') }
function resetDiagnosisFilters() {
  diagnosisMac.value = ''
  diagnosisSrcIp.value = ''
  diagnosisSrcPort.value = ''
  diagnosisDstIp.value = ''
  diagnosisDstPort.value = ''
  diagnosisKeyword.value = ''
  diagnosisSource.value = ''
  diagnosisIntelType.value = ''
  diagnosisLevel.value = ''
  diagnosisAccount.value = ''
  diagnosisLink.value = ''
  diagnosisCondition.value = 'and'
  diagnosisStartTime.value = ''
  diagnosisEndTime.value = ''
}
function exportDiagnosis() { console.log('Export diagnosis') }

const ipStatsMac = ref('')
const ipStatsSrcIp = ref('')
const ipStatsDstIp = ref('')
const ipStatsSrcPort = ref('')
const ipStatsDstPort = ref('')
const ipStatsIpVersion = ref('ipv4')
const ipStatsKeyword = ref('')
const ipStatsSource = ref('')
const ipStatsIntelType = ref('')
const ipStatsLevel = ref('')
const ipStatsAccount = ref('')
const ipStatsLink = ref('')
const ipStatsCondition = ref('and')
const ipStatsStartTime = ref('')
const ipStatsEndTime = ref('')

const ipStatsData = ref([
  { id: 1, srcIp: '101.6.62.143', count: 600, account: '-', dstIp: '101.6.6.63', dstPort: '63', source: '奇安信商业情报', intelType: '僵尸网络', ioc: 'elss.su6s.su', level: '高' },
  { id: 2, srcIp: '158.200.81.153', count: 19, account: '-', dstIp: '101.6.6.63', dstPort: '63', source: '奇安信商业情报', intelType: '僵尸网络', ioc: 'tracker.trackerfix:25522/tcp', level: '高' },
  { id: 3, srcIp: '113.87.06.158', count: 11, account: '-', dstIp: '101.6.6.63', dstPort: '63', source: '奇安信商业情报', intelType: '僵尸网络', ioc: 'www.torrent.com', level: '高' },
  { id: 4, srcIp: '101.6.6.200', count: 2, account: '-', dstIp: '198.111.8.28', dstPort: '63', source: '奇安信商业情报', intelType: '僵尸网络', ioc: 'albenswiss.com', level: '高' },
  { id: 5, srcIp: '101.6.6.200', count: 2, account: '-', dstIp: '198.111.8.28', dstPort: '63', source: '奇安信商业情报', intelType: '僵尸网络', ioc: 'jiskal.com', level: '高' },
  { id: 6, srcIp: '198.111.17.100', count: 2, account: '-', dstIp: '101.6.6.63', dstPort: '63', source: '奇安信商业情报', intelType: '挖矿木马', ioc: 'gphh.tel@124.gaon', level: '高' },
  { id: 7, srcIp: '121.225.78.142', count: 2, account: '-', dstIp: '101.6.6.63', dstPort: '63', source: '奇安信商业情报', intelType: '僵尸网络', ioc: 'www.wmibo.co', level: '高' },
  { id: 8, srcIp: '152.227.168.185', count: 1, account: '-', dstIp: '101.6.6.63', dstPort: '63', source: '奇安信商业情报', intelType: '僵尸网络', ioc: 'yashunfang.cn', level: '高' },
  { id: 9, srcIp: '172.28.0.6', count: 1, account: '-', dstIp: '101.6.6.63', dstPort: '63', source: '奇安信商业情报', intelType: '挖矿木马', ioc: 'jiskal.com', level: '高' },
  { id: 10, srcIp: '172.28.6.9', count: 1, account: '-', dstIp: '101.6.6.63', dstPort: '63', source: '奇安信商业情报', intelType: '挖矿木马', ioc: 'jiskal.com', level: '高' },
])

const ipStatsCurrentPage = ref(1)
const ipStatsPageSize = ref(20)
const ipStatsTotalCount = ref(9)

const ipStatsPageList = computed(() => {
  const total = Math.ceil(ipStatsTotalCount.value / ipStatsPageSize.value)
  const list: number[] = []
  for (let i = 1; i <= Math.min(7, total); i++) {
    list.push(i)
  }
  return list
})

function filterIpStats() { console.log('Filter IP stats') }
function resetIpStatsFilters() {
  ipStatsMac.value = ''
  ipStatsSrcIp.value = ''
  ipStatsDstIp.value = ''
  ipStatsSrcPort.value = ''
  ipStatsDstPort.value = ''
  ipStatsKeyword.value = ''
  ipStatsSource.value = ''
  ipStatsIntelType.value = ''
  ipStatsLevel.value = ''
  ipStatsAccount.value = ''
  ipStatsLink.value = ''
  ipStatsCondition.value = 'and'
  ipStatsStartTime.value = ''
  ipStatsEndTime.value = ''
}
function exportIpStats() { console.log('Export IP stats') }
function confirmIpStatsPage() { console.log('Go to page:', ipStatsCurrentPage.value) }

const ipStatsMenuVisible = ref(false)
const ipStatsMenuPosition = reactive({ x: 0, y: 0 })
const ipStatsMenuTarget = ref('')

function showIpStatsMenu(event: MouseEvent, target: string) {
  ipStatsMenuVisible.value = true
  ipStatsMenuPosition.x = event.clientX
  ipStatsMenuPosition.y = event.clientY
  ipStatsMenuTarget.value = target
}

function handleIpStatsMenuAction(action: string) {
  if (action === 'diagnosis') {
    activeTab.value = 'data-diagnosis'
    diagnosisSrcIp.value = ipStatsMenuTarget.value
    diagnosisKeyword.value = ipStatsMenuTarget.value
  } else if (action === 'history') {
    activeTab.value = 'history'
    historySrcIp.value = ipStatsMenuTarget.value
    historyIoc.value = ipStatsMenuTarget.value
  }
  ipStatsMenuVisible.value = false
}

const accountStatsMac = ref('')
const accountStatsSrcIp = ref('')
const accountStatsDstIp = ref('')
const accountStatsSrcPort = ref('')
const accountStatsDstPort = ref('')
const accountStatsIpVersion = ref('ipv4')
const accountStatsKeyword = ref('')
const accountStatsSource = ref('')
const accountStatsIntelType = ref('')
const accountStatsLevel = ref('')
const accountStatsAccount = ref('')
const accountStatsLink = ref('')
const accountStatsCondition = ref('and')
const accountStatsStartTime = ref('')
const accountStatsEndTime = ref('')

const accountStatsData = ref([
  { id: 1, account: 'user001', srcIp: '101.6.62.143', count: 600, dstIp: '101.6.6.63', dstPort: '63', source: '奇安信商业情报', intelType: '僵尸网络', ioc: 'elss.su6s.su', level: '高' },
  { id: 2, account: 'user002', srcIp: '158.200.81.153', count: 19, dstIp: '101.6.6.63', dstPort: '63', source: '奇安信商业情报', intelType: '僵尸网络', ioc: 'tracker.trackerfix:25522/tcp', level: '高' },
  { id: 3, account: 'user003', srcIp: '113.87.06.158', count: 11, dstIp: '101.6.6.63', dstPort: '63', source: '奇安信商业情报', intelType: '僵尸网络', ioc: 'www.torrent.com', level: '高' },
  { id: 4, account: 'user004', srcIp: '101.6.6.200', count: 2, dstIp: '198.111.8.28', dstPort: '63', source: '奇安信商业情报', intelType: '僵尸网络', ioc: 'albenswiss.com', level: '高' },
  { id: 5, account: 'user005', srcIp: '101.6.6.200', count: 2, dstIp: '198.111.8.28', dstPort: '63', source: '奇安信商业情报', intelType: '僵尸网络', ioc: 'jiskal.com', level: '高' },
  { id: 6, account: 'user006', srcIp: '198.111.17.100', count: 2, dstIp: '101.6.6.63', dstPort: '63', source: '奇安信商业情报', intelType: '挖矿木马', ioc: 'gphh.tel@124.gaon', level: '高' },
  { id: 7, account: 'user007', srcIp: '121.225.78.142', count: 2, dstIp: '101.6.6.63', dstPort: '63', source: '奇安信商业情报', intelType: '僵尸网络', ioc: 'www.wmibo.co', level: '高' },
  { id: 8, account: 'user008', srcIp: '152.227.168.185', count: 1, dstIp: '101.6.6.63', dstPort: '63', source: '奇安信商业情报', intelType: '僵尸网络', ioc: 'yashunfang.cn', level: '高' },
])

const accountStatsCurrentPage = ref(1)
const accountStatsPageSize = ref(20)
const accountStatsTotalCount = ref(8)

const accountStatsPageList = computed(() => {
  const total = Math.ceil(accountStatsTotalCount.value / accountStatsPageSize.value)
  const list: number[] = []
  for (let i = 1; i <= Math.min(7, total); i++) {
    list.push(i)
  }
  return list
})

function filterAccountStats() { console.log('Filter account stats') }
function resetAccountStatsFilters() {
  accountStatsMac.value = ''
  accountStatsSrcIp.value = ''
  accountStatsDstIp.value = ''
  accountStatsSrcPort.value = ''
  accountStatsDstPort.value = ''
  accountStatsKeyword.value = ''
  accountStatsSource.value = ''
  accountStatsIntelType.value = ''
  accountStatsLevel.value = ''
  accountStatsAccount.value = ''
  accountStatsLink.value = ''
  accountStatsCondition.value = 'and'
  accountStatsStartTime.value = ''
  accountStatsEndTime.value = ''
}
function exportAccountStats() { console.log('Export account stats') }
function confirmAccountStatsPage() { console.log('Go to page:', accountStatsCurrentPage.value) }

const accountStatsMenuVisible = ref(false)
const accountStatsMenuPosition = reactive({ x: 0, y: 0 })
const accountStatsMenuTarget = ref('')

function showAccountStatsMenu(event: MouseEvent, target: string) {
  accountStatsMenuVisible.value = true
  accountStatsMenuPosition.x = event.clientX
  accountStatsMenuPosition.y = event.clientY
  accountStatsMenuTarget.value = target
}

function handleAccountStatsMenuAction(action: string) {
  if (action === 'diagnosis') {
    activeTab.value = 'data-diagnosis'
    diagnosisSrcIp.value = accountStatsMenuTarget.value
    diagnosisKeyword.value = accountStatsMenuTarget.value
  } else if (action === 'history') {
    activeTab.value = 'history'
    historySrcIp.value = accountStatsMenuTarget.value
    historyIoc.value = accountStatsMenuTarget.value
  }
  accountStatsMenuVisible.value = false
}

const pendingCerts = ref([
  { name: '*.eagleyun.cn', date: '2025-7-08 -- 2026-7-09', dstIp: '47.96.147.121:443', ca: '是', location: '浙江杭州网易' },
  { name: '*.yunjiweiyi.com', date: '2025-9-10 -- 2026-9-10', dstIp: '109.244.173.150:443', ca: '是', location: '天津天津阿里云' },
  { name: '*.cngold.com', date: '2025-3-08 -- 2026-3-08', dstIp: '47.98.232.20:443', ca: '是', location: '天津天津阿里云' },
  { name: '*.xiaofangxiu.cn', date: '2025-3-08 -- 2026-3-08', dstIp: '118.178.92.7:443', ca: '是', location: '天津天津阿里云' },
  { name: '*.sogou.com', date: '2025-3-08 -- 2026-3-08', dstIp: '120.27.238.1:443', ca: '是', location: '天津天津阿里云' },
  { name: '*.ebay.com', date: '2025-6-02 -- 2026-7-07', dstIp: '175.27.9.128:443', ca: '是', location: '天津天津阿里云' },
  { name: '*.ksoo8.com', date: '2025-10-17 -- 2026-10-17', dstIp: '120.92.122.9:443', ca: '是', location: '北京北京IDC' },
  { name: '*.ksoo8.com', date: '2026-3-06 -- 2026-6-21', dstIp: '111.31.88.78:443', ca: '是', location: '天津天津阿里云' },
  { name: '*.carline1.com', date: '2025-7-08 -- 2026-7-09', dstIp: '119.62.150.48:443', ca: '是', location: '浙江杭州网易' },
  { name: '*.baidu.com', date: '2025-8-05 -- 2026-8-05', dstIp: '11.66.28.98.76:443', ca: '是', location: '天津天津阿里云' },
])
const pendingCertPage = ref(1)
const pendingCertPageSize = ref(10)
const pendingCertTotal = ref(10)
const pendingCertPageList = computed(() => {
  const total = Math.ceil(pendingCertTotal.value / pendingCertPageSize.value)
  const list: number[] = []
  for (let i = 1; i <= Math.min(7, total); i++) list.push(i)
  return list
})
function confirmPendingCertPage() { console.log('Go to page:', pendingCertPage.value) }

const expiredCerts = ref([
  { name: 'dns.tuna.tsinghua.edu.cn', date: '2024-11-25 -- 2025-11-25', dstIp: '101.6.6.853', ca: '是', location: '北京北京教育网' },
])
const expiredCertPage = ref(1)
const expiredCertPageSize = ref(10)
const expiredCertTotal = ref(1)
const expiredCertPageList = computed(() => {
  const total = Math.ceil(expiredCertTotal.value / expiredCertPageSize.value)
  const list: number[] = []
  for (let i = 1; i <= Math.min(7, total); i++) list.push(i)
  return list
})
function confirmExpiredCertPage() { console.log('Go to page:', expiredCertPage.value) }

const revokedCerts = ref([
  { name: 'tuna.tsinghua.edu.cn', date: '2025-4-14 -- 2026-4-15', dstIp: '101.6.15.150:443', ca: '是', location: '北京北京教育网' },
  { name: 'sp.tonyuansen.com', date: '2025-7-12 -- 2026-7-12', dstIp: '101.6.15.150:443', ca: '否', location: '北京北京教育网' },
  { name: 'tuna.tsinghua.edu.cn', date: '2025-4-12 -- 2026-4-12', dstIp: '101.6.15.150:443', ca: '是', location: '北京北京教育网' },
  { name: 'cisco.tsinghua.edu.cn', date: '2025-11-23 -- 2026-11-23', dstIp: '101.6.15.150:443', ca: '是', location: '北京北京教育网' },
  { name: 'dev1703.com', date: '2025-8-18 -- 2026-8-17', dstIp: '81.70.127.217:443', ca: '否', location: '北京北京教育网' },
  { name: '1703.com', date: '2025-6-10 -- 2026-6-10', dstIp: '184.50.189.189:443', ca: '否', location: '北京北京教育网' },
  { name: 'storage.googleapis.com', date: '2026-0-22 -- 2026-0-16', dstIp: '14.125.199.207:443', ca: '是', location: '北京北京教育网' },
  { name: 'mirrors.aliyun.com', date: '2026-6-06 -- 2026-6-07', dstIp: '47.92.301.249:443', ca: '是', location: '北京北京教育网' },
  { name: 'www.ubuntu.com', date: '2025-5-26 -- 2026-5-26', dstIp: '114.215.177.177:443', ca: '是', location: '北京北京教育网' },
])
const revokedCertPage = ref(1)
const revokedCertPageSize = ref(10)
const revokedCertTotal = ref(9)
const revokedCertPageList = computed(() => {
  const total = Math.ceil(revokedCertTotal.value / revokedCertPageSize.value)
  const list: number[] = []
  for (let i = 1; i <= Math.min(7, total); i++) list.push(i)
  return list
})
function confirmRevokedCertPage() { console.log('Go to page:', revokedCertPage.value) }

const normalCerts = ref([
  { name: 'dns.tuna.tsinghua.edu.cn', date: '2024-11-25 -- 2025-11-25', dstIp: '101.6.6.853', ca: '是', location: '北京北京教育网' },
  { name: '*.google-analytics.com', date: '2025-5-12 -- 2026-5-12', dstIp: '101.6.234.80:90', ca: '否', location: '北京北京教育网' },
  { name: '*.tmgc.edu.cn', date: '2025-6-12 -- 2026-6-12', dstIp: '111.12.28.167:443', ca: '是', location: '北京北京教育网' },
  { name: '*.jlgc.edu.cn', date: '2025-6-12 -- 2026-6-12', dstIp: '202.205.184.10:443', ca: '是', location: '北京北京教育网' },
  { name: '*.jd.com', date: '2025-8-18 -- 2026-8-18', dstIp: '42.186.194.77:443', ca: '否', location: '北京北京教育网' },
  { name: '*.qzone.qq.com', date: '2025-8-18 -- 2026-8-18', dstIp: '45.203.145.166:443', ca: '否', location: '北京北京教育网' },
  { name: '*.com', date: '2025-6-22 -- 2026-6-22', dstIp: '104.17.58.96:443', ca: '否', location: '北京北京教育网' },
  { name: '*.google-analytics.com', date: '2025-6-22 -- 2026-6-22', dstIp: '223.88.198.111:443', ca: '否', location: '北京北京教育网' },
])
const normalCertPage = ref(1)
const normalCertPageSize = ref(10)
const normalCertTotal = ref(8)
const normalCertPageList = computed(() => {
  const total = Math.ceil(normalCertTotal.value / normalCertPageSize.value)
  const list: number[] = []
  for (let i = 1; i <= Math.min(7, total); i++) list.push(i)
  return list
})
function confirmNormalCertPage() { console.log('Go to page:', normalCertPage.value) }

const certTypePieOption = computed(() => ({
  title: { text: '类型分布', left: 'left', textStyle: { fontSize: 14, fontWeight: 600, color: '#303133' } },
  tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)', backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#ebeef5', borderWidth: 1, textStyle: { color: '#303133' } },
  legend: { orient: 'vertical', right: '5%', top: 'center', textStyle: { fontSize: 12, color: '#606266' } },
  series: [{
    name: '类型分布', type: 'pie', radius: ['40%', '70%'], center: ['35%', '55%'],
    itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
    label: { show: false },
    labelLine: { show: false },
    data: [
      { value: 60, name: '正常证书', itemStyle: { color: '#67c23a' } },
      { value: 25, name: '异常证书', itemStyle: { color: '#f56c6c' } },
      { value: 15, name: '吊销证书', itemStyle: { color: '#e6a23c' } },
    ],
  }],
}))

const certAnalysisSrcIp = ref('')
const certAnalysisSrcPort = ref('')
const certAnalysisDstIp = ref('')
const certAnalysisDstPort = ref('')
const certAnalysisKeyword = ref('')
const certAnalysisMac = ref('')
const certAnalysisAltName = ref('')
const certAnalysisStartTime = ref('')
const certAnalysisEndTime = ref('')

const certAnalysisData = ref([
  { id: 1, name: '*.eagleyun.cn', date: '2025-7-08 -- 2026-7-09', fp: '47:69:47:12:13:44:43', ca: '是', location: '浙江杭州网易', count: 10 },
  { id: 2, name: 'dns.tuna.tsinghua.edu.cn', date: '2024-11-25 -- 2025-11-25', fp: '10:81:68:83', ca: '是', location: '北京北京教育网', count: 554 },
  { id: 3, name: '*.yunjiweiyi.com', date: '2025-9-10 -- 2026-9-10', fp: '22:78:23:22:84:13', ca: '是', location: '天津天津阿里云', count: 8 },
  { id: 4, name: '*.cngold.com', date: '2025-3-08 -- 2026-3-08', fp: '22:78:23:22:84:13', ca: '是', location: '天津天津阿里云', count: 5 },
  { id: 5, name: '*.xiaofangxiu.cn', date: '2025-11-06 -- 2026-11-06', fp: '11:31:80:56:77:00:43', ca: '是', location: '天津天津阿里云', count: 3 },
])

const certAnalysisCurrentPage = ref(1)
const certAnalysisPageSize = ref(20)
const certAnalysisTotalCount = ref(5)

const certAnalysisPageList = computed(() => {
  const total = Math.ceil(certAnalysisTotalCount.value / certAnalysisPageSize.value)
  const list: number[] = []
  for (let i = 1; i <= Math.min(7, total); i++) {
    list.push(i)
  }
  return list
})

function filterCertAnalysis() { console.log('Filter cert analysis') }
function resetCertAnalysisFilters() {
  certAnalysisSrcIp.value = ''
  certAnalysisSrcPort.value = ''
  certAnalysisDstIp.value = ''
  certAnalysisDstPort.value = ''
  certAnalysisKeyword.value = ''
  certAnalysisMac.value = ''
  certAnalysisAltName.value = ''
  certAnalysisStartTime.value = ''
  certAnalysisEndTime.value = ''
}
function exportCertAnalysis() { console.log('Export cert analysis') }
function confirmCertAnalysisPage() { console.log('Go to page:', certAnalysisCurrentPage.value) }

const certHistoryModal = reactive({
  visible: false,
  title: '实时概况 -> 历史会话',
  certName: '',
  altName: '',
})

function openCertHistoryModal(cert: any) {
  certHistoryModal.title = '实时概况 -> 历史会话'
  certHistoryModal.certName = cert.name
  certHistoryModal.altName = cert.name
  certHistoryAltName.value = cert.name
  certHistoryModal.visible = true
}

const certHistorySrcIp = ref('')
const certHistorySrcPort = ref('')
const certHistoryDstIp = ref('')
const certHistoryDstPort = ref('')
const certHistoryKeyword = ref('')
const certHistoryMac = ref('')
const certHistoryAltName = ref('')
const certHistoryStartTime = ref('')
const certHistoryEndTime = ref('')

const certHistoryData = ref([
  {
    id: 1, time: '2026-07-10 09:04:19', mac: '30-8b-9b-6d-90-01', vendor: 'NewH3CTechno...',
    srcIp: '166.111.5.220:62556', dstIp: '116.62.205.66:443', location: '浙江杭州网易',
    summary: '生效日期: 2025-07-17 08:00:00\n失效日期: 2026-07-17 07:59:59\n主题: /CN=*.eagleyun.cn\n发行人: /C=US/O=DigiCert Inc/OU=www.digicert.com/CN=Encryption Everywhere\n备用名称: *.eagleyun.cn',
    summaryLines: ['生效日期: 2025-07-17 08:00:00', '失效日期: 2026-07-17 07:59:59', '主题: /CN=*.eagleyun.cn', '发行人: /C=US/O=DigiCert Inc/OU=www.digicert.com/CN=Encryption Everywhere', '备用名称: *.eagleyun.cn'],
  },
  {
    id: 2, time: '2026-07-10 09:03:48', mac: '30-8b-9b-6d-90-01', vendor: 'NewH3CTechno...',
    srcIp: '166.111.5.220:62535', dstIp: '116.62.205.66:443', location: '浙江杭州网易',
    summary: '生效日期: 2025-07-17 08:00:00\n失效日期: 2026-07-17 07:59:59\n主题: /CN=*.eagleyun.cn\n发行人: /C=US/O=DigiCert Inc/OU=www.digicert.com/CN=Encryption Everywhere\n备用名称: *.eagleyun.cn',
    summaryLines: ['生效日期: 2025-07-17 08:00:00', '失效日期: 2026-07-17 07:59:59', '主题: /CN=*.eagleyun.cn', '发行人: /C=US/O=DigiCert Inc/OU=www.digicert.com/CN=Encryption Everywhere', '备用名称: *.eagleyun.cn'],
  },
  {
    id: 3, time: '2026-07-10 09:03:47', mac: '30-8b-9b-6d-90-01', vendor: 'NewH3CTechno...',
    srcIp: '166.111.5.220:62534', dstIp: '116.62.205.66:443', location: '浙江杭州网易',
    summary: '生效日期: 2025-07-17 08:00:00\n失效日期: 2026-07-17 07:59:59\n主题: /CN=*.eagleyun.cn\n发行人: /C=US/O=DigiCert Inc/OU=www.digicert.com/CN=Encryption Everywhere\n备用名称: *.eagleyun.cn',
    summaryLines: ['生效日期: 2025-07-17 08:00:00', '失效日期: 2026-07-17 07:59:59', '主题: /CN=*.eagleyun.cn', '发行人: /C=US/O=DigiCert Inc/OU=www.digicert.com/CN=Encryption Everywhere', '备用名称: *.eagleyun.cn'],
  },
  {
    id: 4, time: '2026-07-10 08:59:18', mac: '30-8b-9b-6d-90-01', vendor: 'NewH3CTechno...',
    srcIp: '166.111.5.220:62347', dstIp: '47.96.147.121:443', location: '浙江杭州网易',
    summary: '生效日期: 2025-07-17 08:00:00\n失效日期: 2026-07-17 07:59:59\n主题: /CN=*.eagleyun.cn\n发行人: /C=US/O=DigiCert Inc/OU=www.digicert.com/CN=Encryption Everywhere\n备用名称: *.eagleyun.cn',
    summaryLines: ['生效日期: 2025-07-17 08:00:00', '失效日期: 2026-07-17 07:59:59', '主题: /CN=*.eagleyun.cn', '发行人: /C=US/O=DigiCert Inc/OU=www.digicert.com/CN=Encryption Everywhere', '备用名称: *.eagleyun.cn'],
  },
  {
    id: 5, time: '2026-07-10 08:58:46', mac: '30-8b-9b-6d-90-01', vendor: 'NewH3CTechno...',
    srcIp: '166.111.5.220:62322', dstIp: '47.96.147.121:443', location: '浙江杭州网易',
    summary: '生效日期: 2025-07-17 08:00:00\n失效日期: 2026-07-17 07:59:59\n主题: /CN=*.eagleyun.cn\n发行人: /C=US/O=DigiCert Inc/OU=www.digicert.com/CN=Encryption Everywhere\n备用名称: *.eagleyun.cn',
    summaryLines: ['生效日期: 2025-07-17 08:00:00', '失效日期: 2026-07-17 07:59:59', '主题: /CN=*.eagleyun.cn', '发行人: /C=US/O=DigiCert Inc/OU=www.digicert.com/CN=Encryption Everywhere', '备用名称: *.eagleyun.cn'],
  },
  {
    id: 6, time: '2026-07-10 09:04:59', mac: '54-2b-de-6d-6d-c0', vendor: 'NewH3CTechno...',
    srcIp: '101.6.64.201:41680', dstIp: '101.6.6.853', location: '北京北京教育网',
    summary: '生效日期: 2024-11-25 08:00:00\n失效日期: 2025-11-26 07:59:59\n主题: /CN=dns.tuna.tsinghua.edu.cn\n发行人: /C=VL/Riga=O=GoGetSSL/CN=GoGetSSL RSA DV CA\n备用名称: dns.tuna.tsinghua.edu.cn',
    summaryLines: ['生效日期: 2024-11-25 08:00:00', '失效日期: 2025-11-26 07:59:59', '主题: /CN=dns.tuna.tsinghua.edu.cn', '发行人: /C=VL/Riga=O=GoGetSSL/CN=GoGetSSL RSA DV CA', '备用名称: dns.tuna.tsinghua.edu.cn'],
  },
])

const certHistoryCurrentPage = ref(1)
const certHistoryPageSize = ref(20)
const certHistoryTotalCount = ref(6)

const certHistoryPageList = computed(() => {
  const total = Math.ceil(certHistoryTotalCount.value / certHistoryPageSize.value)
  const list: number[] = []
  for (let i = 1; i <= Math.min(7, total); i++) {
    list.push(i)
  }
  return list
})

function filterCertHistory() { console.log('Filter cert history') }
function resetCertHistoryFilters() {
  certHistorySrcIp.value = ''
  certHistorySrcPort.value = ''
  certHistoryDstIp.value = ''
  certHistoryDstPort.value = ''
  certHistoryKeyword.value = ''
  certHistoryMac.value = ''
  certHistoryAltName.value = ''
  certHistoryStartTime.value = ''
  certHistoryEndTime.value = ''
}
function confirmCertHistoryPage() { console.log('Go to page:', certHistoryCurrentPage.value) }

const diagnosisTrendChartOption = computed(() => ({
  title: { text: '命中趋势', left: 'left', textStyle: { fontSize: 14, fontWeight: 600, color: '#303133' } },
  tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#ebeef5', borderWidth: 1, textStyle: { color: '#303133' } },
  legend: { data: ['命中次数', '僵尸网络', '恶意软件', '勒索软件'], bottom: 0, textStyle: { fontSize: 12, color: '#606266' } },
  grid: { left: '3%', right: '4%', bottom: '15%', top: '15%', containLabel: true },
  xAxis: { type: 'category', boundaryGap: false, data: ['7/5', '7/6', '7/7', '7/8', '7/9', '7/10'], axisLine: { lineStyle: { color: '#ebeef5' } }, axisLabel: { fontSize: 11, color: '#909399' } },
  yAxis: { type: 'value', axisLine: { show: false }, axisLabel: { fontSize: 11, color: '#909399' }, splitLine: { lineStyle: { color: '#f0f2f5' } } },
  series: [
    { name: '命中次数', type: 'line', smooth: true, data: [260, 280, 250, 290, 270, 240], lineStyle: { color: '#e6a23c', width: 2 }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(230,162,60,0.3)' }, { offset: 1, color: 'rgba(230,162,60,0.05)' }] } }, itemStyle: { color: '#e6a23c' } },
    { name: '僵尸网络', type: 'line', smooth: true, data: [200, 220, 190, 230, 210, 180], lineStyle: { color: '#f56c6c', width: 2 }, itemStyle: { color: '#f56c6c' } },
    { name: '恶意软件', type: 'line', smooth: true, data: [40, 35, 45, 30, 40, 35], lineStyle: { color: '#9b59b6', width: 2 }, itemStyle: { color: '#9b59b6' } },
    { name: '勒索软件', type: 'line', smooth: true, data: [20, 25, 15, 30, 20, 25], lineStyle: { color: '#67c23a', width: 2 }, itemStyle: { color: '#67c23a' } },
  ],
}))

const diagnosisPieChartOption = computed(() => ({
  title: { text: '威胁分布', left: 'left', textStyle: { fontSize: 14, fontWeight: 600, color: '#303133' } },
  tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)', backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#ebeef5', borderWidth: 1, textStyle: { color: '#303133' } },
  legend: { orient: 'vertical', right: '5%', top: 'center', textStyle: { fontSize: 12, color: '#606266' } },
  series: [{
    name: '威胁分布', type: 'pie', radius: ['50%', '70%'], center: ['35%', '55%'], avoidLabelOverlap: false,
    itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
    label: { show: false, position: 'center' },
    emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } },
    labelLine: { show: false },
    data: [
      { value: 60, name: '僵尸网络', itemStyle: { color: '#e6a23c' } },
      { value: 40, name: '用户威胁', itemStyle: { color: '#67c23a' } },
    ],
  }],
}))

const packetAnalysisModal = reactive({
  visible: false,
  currentLog: null as any,
  activeTab: 'analysis',
})

const packetTabs = [
  { key: 'analysis', label: '报文分析' },
  { key: 'interaction', label: '报文交互' },
  { key: 'metadata', label: '元数据' },
  { key: 'certificate', label: '证书分析' },
  { key: 'export', label: '报文播放' },
  { key: 'timeline', label: '时序图' },
]

const packetList = ref([
  { id: 1, time: '0.000000', src: '101.6.62.143', dst: '101.6.6.6', proto: 'DNS', length: 83, detail: 'Standard query 0xdea3 AAAA else.cips.cip.cn OPT' },
  { id: 2, time: '0.000184', src: '101.6.62.143', dst: '101.6.6.6', proto: 'DNS', length: 144, detail: 'Standard query response 0xdea3 No such name AAAA else.cips.cip.cn SOA a.dns.rjp.net OPT' },
])

const packetDetail = ref(`Frame 1: 83 bytes on wire (664 bits), 83 bytes captured (664 bits)
Ethernet II, Src: 54:2b:de:6d:10:ae (54:2b:de:6d:10:ae), Dst: 30:8c:9d:00:01:01 (30:8c:9d:00:01:01)
Internet Protocol Version 4, Src: 101.6.62.143, Dst: 101.6.6.6
User Datagram Protocol, Src Port: 54321, Dst Port: 53
Domain Name System (query)`)

const packetHex = ref(`0000   30 8c 9d 00 01 01 54 2b de 6d 10 ae 08 00 45 00
0010   00 45 4f 4e 00 00 3e 11 68 65 66 63 00 00 65 66
0020   00 66 67 00 00 35 00 31 00 00 00 00 00 00 00 00
0030   00 23 65 00 00 1c 00 00 00 00 00 00 00 00 00 00
0040   00 23 75 00 00 1c 00 00 00 00 00 00 00 00 00 00
0050   00 00`)

function openPacketAnalysisModal(log: any) {
  packetAnalysisModal.currentLog = log
  packetAnalysisModal.activeTab = 'analysis'
  packetAnalysisModal.visible = true
}

const hitUsersKeyword = ref('')
const hitUsersSortField = ref('')
const hitUsersSortOrder = ref<'asc' | 'desc'>('desc')

const hitUsers = ref([
  { id: 1, ip: '192.168.62.143', mac: '54-2b-de-6d-10-ae', account: '-', hitCount: 1006983 },
  { id: 2, ip: '172.28.8.9', mac: '54-2b-de-6d-10-ae', account: '-', hitCount: 428288 },
  { id: 3, ip: '172.28.8.6', mac: '54-2b-de-6d-10-ae', account: '-', hitCount: 211614 },
  { id: 4, ip: '10.6.5.151', mac: '3C:4A:92:EB:4B:C1', account: '-', hitCount: 13708 },
  { id: 5, ip: '172.28.11.4', mac: '54-2b-de-6d-10-ae', account: '-', hitCount: 11614 },
  { id: 6, ip: '192.168.117.103', mac: '54-2b-de-6d-10-ae', account: '-', hitCount: 10138 },
  { id: 7, ip: '10.6.6.204', mac: '3C:4A:92:EB:4B:C1', account: '-', hitCount: 3827 },
  { id: 8, ip: '192.168.117.184', mac: '54-2b-de-6d-10-ae', account: '-', hitCount: 1803 },
  { id: 9, ip: '192.168.53.128', mac: '54-2b-de-6d-10-ae', account: '-', hitCount: 1152 },
  { id: 10, ip: '115.37.81.129', mac: '54-2b-de-6d-10-ae', account: '-', hitCount: 1731 },
  { id: 11, ip: '172.28.8.103', mac: '54-2b-de-6d-10-ae', account: '-', hitCount: 1152 },
  { id: 12, ip: '10.6.6.10', mac: '3C:4A:92:EB:4B:C1', account: '-', hitCount: 590 },
  { id: 13, ip: '192.168.117.186', mac: '54-2b-de-6d-10-ae', account: '-', hitCount: 538 },
  { id: 14, ip: '172.28.110.163', mac: '54-2b-de-6d-10-ae', account: '-', hitCount: 513 },
  { id: 15, ip: '172.28.98.6', mac: '54-2b-de-6d-10-ae', account: '-', hitCount: 402 },
  { id: 16, ip: '172.28.71.104', mac: '54-2b-de-6d-10-ae', account: '-', hitCount: 402 },
  { id: 17, ip: '172.28.8.18', mac: '54-2b-de-6d-10-ae', account: '-', hitCount: 402 },
  { id: 18, ip: '192.168.117.194', mac: '54-2b-de-6d-10-ae', account: '-', hitCount: 180 },
  { id: 19, ip: '10.14.68.107', mac: '54-2b-de-6d-10-ae', account: '-', hitCount: 175 },
  { id: 20, ip: '192.168.53.142', mac: '54-2b-de-6d-10-ae', account: '-', hitCount: 79 },
])

const hitUsersCurrentPage = ref(1)
const hitUsersPageSize = ref(100)
const hitUsersTotalCount = ref(hitUsers.value.length)

const sortedHitUsers = computed(() => {
  const list = [...hitUsers.value]
  if (!hitUsersSortField.value) return list
  if (hitUsersSortField.value === 'hitCount') {
    list.sort((a, b) => {
      return hitUsersSortOrder.value === 'asc' ? a.hitCount - b.hitCount : b.hitCount - a.hitCount
    })
  } else if (hitUsersSortField.value === 'ip') {
    list.sort((a, b) => {
      return hitUsersSortOrder.value === 'asc' ? a.ip.localeCompare(b.ip) : b.ip.localeCompare(a.ip)
    })
  }
  return list
})

function sortHitUsersBy(field: string) {
  if (hitUsersSortField.value === field) {
    hitUsersSortOrder.value = hitUsersSortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    hitUsersSortField.value = field
    hitUsersSortOrder.value = 'desc'
  }
}
function filterHitUsers() { console.log('Filter hit users:', hitUsersKeyword.value) }
function confirmHitUsersPage() { console.log('Go to page:', hitUsersCurrentPage.value) }

const manageRefreshPeriod = ref('10')
const manageIntelType = ref('all')
const manageSearchKeyword = ref('')
const manageSortField = ref('')
const manageSortOrder = ref<'asc' | 'desc'>('desc')

const manageThreatTypes = ref([
  { id: 1, name: '数字货币', memberCount: '0', monitor: true, block: true, log: true, hitCount: 0, trendData: [0, 0, 0, 0, 0] },
  { id: 2, name: 'C2节点', memberCount: '0', monitor: true, block: true, log: true, hitCount: 0, trendData: [0, 0, 0, 0, 0] },
  { id: 3, name: 'APT攻击', memberCount: '0', monitor: true, block: true, log: true, hitCount: 0, trendData: [0, 0, 0, 0, 0] },
  { id: 4, name: '网站后门', memberCount: '0', monitor: true, block: true, log: true, hitCount: 0, trendData: [0, 0, 0, 0, 0] },
  { id: 5, name: '钓鱼网站', memberCount: '0', monitor: true, block: true, log: true, hitCount: 0, trendData: [0, 0, 0, 0, 0] },
  { id: 6, name: '僵尸网络', memberCount: '0', monitor: true, block: true, log: true, hitCount: 0, trendData: [0, 0, 0, 0, 0] },
  { id: 7, name: '恶意软件', memberCount: '0', monitor: true, block: true, log: true, hitCount: 0, trendData: [0, 0, 0, 0, 0] },
  { id: 8, name: '扫描器', memberCount: '0', monitor: true, block: true, log: true, hitCount: 0, trendData: [0, 0, 0, 0, 0] },
  { id: 9, name: 'TOR节点', memberCount: '0', monitor: true, block: true, log: true, hitCount: 0, trendData: [0, 0, 0, 0, 0] },
  { id: 10, name: '代理和隧道', memberCount: '0', monitor: true, block: true, log: true, hitCount: 0, trendData: [0, 0, 0, 0, 0] },
  { id: 11, name: '隐藏节点', memberCount: '0', monitor: true, block: true, log: true, hitCount: 0, trendData: [0, 0, 0, 0, 0] },
  { id: 12, name: '恶意网站', memberCount: '0', monitor: true, block: true, log: true, hitCount: 0, trendData: [0, 0, 0, 0, 0] },
  { id: 13, name: '色情网站', memberCount: '0', monitor: true, block: true, log: true, hitCount: 0, trendData: [0, 0, 0, 0, 0] },
  { id: 14, name: '赌博网站', memberCount: '0', monitor: true, block: true, log: true, hitCount: 0, trendData: [0, 0, 0, 0, 0] },
  { id: 15, name: '激进网站', memberCount: '0', monitor: true, block: true, log: true, hitCount: 0, trendData: [0, 0, 0, 0, 0] },
  { id: 16, name: '可疑行为', memberCount: '0', monitor: true, block: true, log: true, hitCount: 0, trendData: [0, 0, 0, 0, 0] },
])

const selectedManageTypes = ref<number[]>([])
const selectAllManageTypes = computed({
  get: () => selectedManageTypes.value.length === manageThreatTypes.value.length,
  set: (val) => { selectedManageTypes.value = val ? manageThreatTypes.value.map(t => t.id) : [] },
})

const sortedManageThreatTypes = computed(() => {
  const list = [...manageThreatTypes.value]
  if (!manageSortField.value) return list
  if (manageSortField.value === 'count') {
    list.sort((a, b) => {
      const numA = parseInt(a.memberCount.replace(/,/g, '')) || 0
      const numB = parseInt(b.memberCount.replace(/,/g, '')) || 0
      return manageSortOrder.value === 'asc' ? numA - numB : numB - numA
    })
  } else if (manageSortField.value === 'type') {
    list.sort((a, b) => {
      return manageSortOrder.value === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    })
  }
  return list
})

function toggleSelectAllManageTypes() {}
function sortManageBy(field: string) {
  if (manageSortField.value === field) {
    manageSortOrder.value = manageSortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    manageSortField.value = field
    manageSortOrder.value = 'desc'
  }
}
function filterManageThreatTypes() { console.log('Filter manage threat types:', manageSearchKeyword.value) }
function saveManageToggle(item: any, field: string) { console.log('Save manage toggle:', item.name, field, item[field]) }

const threatTypeDetailModal = reactive({
  visible: false,
  loading: false,
  title: '',
  name: '',
  description: '',
})

const threatTypeDescriptions: Record<string, string> = {
  '数字货币': '数字货币是一种基于节点网络和数字加密算法的虚拟货币，包括全球十多种数字货币的相关信息，具体包括矿池地址、矿池域名和IP信息，防护软件的hash编号。',
  'C2节点': 'C2节点是攻击者用于控制受感染主机的命令与控制服务器，能够接收攻击者发出的指令并执行恶意操作。',
  'APT攻击': '高级持续性威胁(APT)是一种复杂的、长期的攻击方式，攻击者通常拥有强大的资源和动机，旨在窃取敏感信息或破坏关键系统。',
  '网站后门': '网站后门是攻击者在入侵网站后留下的隐蔽入口，允许攻击者在没有正常身份验证的情况下访问和控制网站。',
  '钓鱼网站': '钓鱼网站是伪装成合法网站的恶意网站，旨在欺骗用户泄露敏感信息，如用户名、密码、银行卡信息等。',
  '僵尸网络': '僵尸网络是由大量被恶意软件感染的计算机组成的网络，受攻击者控制，可用于发起DDoS攻击、发送垃圾邮件等恶意活动。',
  '恶意软件': '恶意软件是指故意设计用来损害计算机系统、窃取数据或执行其他恶意行为的软件，包括病毒、蠕虫、木马等。',
  '扫描器': '扫描器是用于探测网络服务、端口和漏洞的工具，攻击者常用来寻找目标系统的弱点。',
  'TOR节点': 'TOR节点是TOR匿名网络的组成部分，可用于隐藏网络流量的来源和目的地。',
  '代理和隧道': '代理服务器和隧道技术可用于绕过网络限制和隐藏真实IP地址，常被用于恶意活动。',
  '隐藏节点': '隐藏节点是指在网络中不易被发现的主机或服务，常被攻击者用于保持持久访问。',
  '恶意网站': '恶意网站是指包含恶意代码或用于传播恶意软件的网站。',
  '色情网站': '色情网站是指包含色情内容的网站。',
  '赌博网站': '赌博网站是指提供在线赌博服务的网站。',
  '激进网站': '激进网站是指传播极端思想或煽动暴力的网站。',
  '可疑行为': '可疑行为是指不符合正常网络活动模式的行为，可能表明存在安全威胁。',
}

function openThreatTypeDetailModal(item: any) {
  threatTypeDetailModal.title = item.name
  threatTypeDetailModal.name = item.name
  threatTypeDetailModal.description = threatTypeDescriptions[item.name] || ''
  threatTypeDetailModal.visible = true
}

const batchSetModal = reactive({
  visible: false,
  monitor: 'none',
  block: 'none',
  log: 'none',
})

function openBatchSetModal() { batchSetModal.visible = true }
function confirmBatchSet() {
  console.log('Batch set:', batchSetModal)
  batchSetModal.visible = false
}

const clearHitConfirmModal = reactive({ visible: false })
function openClearHitConfirmModal() { clearHitConfirmModal.visible = true }
function confirmClearHit() {
  manageThreatTypes.value.forEach(t => { t.hitCount = 0 })
  clearHitConfirmModal.visible = false
}

const manageHitLogModal = reactive({
  visible: false,
  title: '',
})

const manageHitLogs = ref([
  { id: 1, time: '2026-07-09 14:30:15', srcIpPort: '192.168.1.105:45678', account: 'user001', dstIpPort: '104.16.181.15:443', location: '美国', proto: 'HTTPS', threatLevel: '高', intelType: 'C2节点', maliciousFamily: 'Emotet', ioc: '104.16.181.15', action: '阻断' },
  { id: 2, time: '2026-07-09 14:28:22', srcIpPort: '192.168.1.108:51234', account: 'user002', dstIpPort: '198.51.100.20:80', location: '未知', proto: 'HTTP', threatLevel: '中', intelType: '钓鱼网站', maliciousFamily: '-', ioc: 'phishing.example.com', action: '监测' },
])

const manageCurrentPage = ref(1)
const managePageSize = ref(100)
const manageTotalCount = ref(0)

const manageHitLogChartOption = computed(() => ({
  tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#e4e7ed', borderWidth: 1, textStyle: { color: '#303133' } },
  grid: { left: '40', right: '20', top: '20', bottom: '45' },
  xAxis: { type: 'category', data: ['16:00', '18:00', '20:00', '22:00', '9.Jul', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00'], axisLine: { lineStyle: { color: '#c8ccd0' } }, axisLabel: { fontSize: 11 } },
  yAxis: { type: 'value', name: '命中次数', axisLine: { show: false }, splitLine: { lineStyle: { color: '#f0f2f5', type: 'dashed' } } },
  series: [{
    name: '命中次数', type: 'line', smooth: false,
    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    lineStyle: { color: '#f56c6c', width: 2 },
    itemStyle: { color: '#f56c6c' },
    symbol: 'circle', symbolSize: 6,
  }],
}))

function confirmManagePage() { console.log('Go to page:', manageCurrentPage.value) }

const alertConfigModal = reactive({ visible: false, source: 'all' })
const alertConfigItems = ref([
  { id: 1, type: '恶意软件', monitor: true, threshold: 5, hitCount: 128 },
  { id: 2, type: '钓鱼网站', monitor: true, threshold: 3, hitCount: 86 },
  { id: 3, type: 'C&C服务器', monitor: true, threshold: 1, hitCount: 45 },
  { id: 4, type: '矿池', monitor: true, threshold: 10, hitCount: 23 },
  { id: 5, type: '垃圾邮件', monitor: true, threshold: 20, hitCount: 156 },
  { id: 6, type: '勒索软件', monitor: true, threshold: 1, hitCount: 12 },
  { id: 7, type: 'APT攻击', monitor: true, threshold: 1, hitCount: 8 },
  { id: 8, type: 'DDoS攻击', monitor: true, threshold: 50, hitCount: 67 },
])

const selectedAlertItems = ref<number[]>([])
const selectAllAlertItems = computed({
  get: () => selectedAlertItems.value.length === alertConfigItems.value.length,
  set: (val) => { selectedAlertItems.value = val ? alertConfigItems.value.map(i => i.id) : [] },
})

function toggleSelectAllAlertItems() {}
function openAlertConfigModal() { alertConfigModal.visible = true }
function loadAlertConfig() { console.log('Load alert config for source:', alertConfigModal.source) }
function saveAlertThreshold() { console.log('Save alert threshold') }
function batchSetAlert() { console.log('Batch set alert') }

const alertNotifyModal = reactive({ visible: false, activeTab: 'wechat' })
const notifyTabs = [
  { key: 'wechat', label: '微信' },
  { key: 'wework', label: '企业微信' },
  { key: 'dingtalk', label: '钉钉' },
  { key: 'feishu', label: '飞书' },
  { key: 'email', label: '邮箱' },
  { key: 'syslog', label: 'Syslog' },
  { key: 'users', label: '接收用户' },
  { key: 'test', label: '消息测试' },
]

const notifyConfig = reactive({
  wechat: { enabled: true },
  wework: { enabled: false },
  dingtalk: { enabled: true },
  feishu: { enabled: false },
  email: { enabled: true, smtpServer: 'smtp.example.com', smtpPort: 587, sender: 'alert@example.com' },
  syslog: { enabled: false, server: '', port: 514 },
  test: { channel: 'wechat', recipient: '' },
})

const notifyUsers = ref([
  { id: 1, name: '张三', account: 'user001', channel: '企业微信' },
  { id: 2, name: '李四', account: 'user002', channel: '钉钉' },
  { id: 3, name: '王五', account: 'user003', channel: '飞书' },
])

const selectedNotifyUsers = ref<number[]>([])
const selectAllNotifyUsers = computed({
  get: () => selectedNotifyUsers.value.length === notifyUsers.value.length,
  set: (val) => { selectedNotifyUsers.value = val ? notifyUsers.value.map(u => u.id) : [] },
})

function toggleSelectAllNotifyUsers() {}
function openAlertNotifyModal() { alertNotifyModal.visible = true }
function saveNotifyConfig() { console.log('Save notify config') }
function testNotify() { console.log('Test notify') }

const intelQueryModal = reactive({
  visible: false,
  queryValue: '',
  result: null as any[] | null,
  noResult: false,
})

function openIntelQueryModal() { intelQueryModal.visible = true }
function queryIntel() {
  if (!intelQueryModal.queryValue) return
  intelQueryModal.noResult = false
  intelQueryModal.result = [
    { label: '情报类型', value: 'IP黑名单' },
    { label: '威胁等级', value: '高' },
    { label: '情报源', value: 'Maltrail' },
    { label: '首次发现时间', value: '2026-06-01' },
    { label: '最近更新时间', value: '2026-07-09' },
  ]
}

const customIntelModal = reactive({ visible: false, ipGroup: 1, domainGroup: 1 })
const ipBlacklistGroups = ref([{ id: 1, name: '企业IP黑名单' }, { id: 2, name: '测试IP黑名单' }])
const domainBlacklistGroups = ref([{ id: 1, name: '企业域名黑名单' }, { id: 2, name: '测试域名黑名单' }])

function openCustomIntelModal() { customIntelModal.visible = true }
function refreshIpGroup() { console.log('Refresh IP group') }
function refreshDomainGroup() { console.log('Refresh domain group') }
function editIpGroup() { console.log('Edit IP group') }
function editDomainGroup() { console.log('Edit domain group') }
function saveCustomIntel() { console.log('Save custom intel') }

const syncConfirmModal = reactive({ visible: false })
function openSyncConfirmModal() { syncConfirmModal.visible = true }
function confirmSync() {
  syncConfirmModal.visible = false
  loading.value = true
  loadingText.value = '正在同步情报数据...'
  setTimeout(() => {
    loading.value = false
    loadingText.value = '数据加载中...'
  }, 3000)
}

const syncSettingsModal = reactive({ visible: false, syncTime: '03:00' })
function openSyncSettingsModal() { syncSettingsModal.visible = true }
function saveSyncSettings() { console.log('Save sync settings:', syncSettingsModal.syncTime) }

const ipProfileModal = reactive({ visible: false, ip: '', activeTab: 'traffic' })
const ipProfileTabs = [
  { key: 'traffic', label: '流量' },
  { key: 'connections', label: '连接' },
  { key: 'accounts', label: '账号' },
  { key: 'threat', label: '威胁情报' },
]

const ipProfileData = reactive({
  traffic: { up: '12.5 GB', down: '45.3 GB', connections: 128, hits: 45 },
  protocols: [
    { name: 'HTTPS', up: '8.2 GB', down: '32.1 GB', ratio: '72%' },
    { name: 'HTTP', up: '2.1 GB', down: '8.6 GB', ratio: '19%' },
    { name: 'DNS', up: '1.2 GB', down: '3.2 GB', ratio: '7%' },
    { name: '其他', up: '1.0 GB', down: '1.4 GB', ratio: '2%' },
  ],
  connections: [
    { time: '2026-07-09 10:45:32', dstIp: '104.16.181.15', port: 443, proto: 'HTTPS', duration: '5分钟' },
    { time: '2026-07-09 10:42:18', dstIp: '104.16.181.16', port: 443, proto: 'HTTPS', duration: '3分钟' },
    { time: '2026-07-09 10:38:45', dstIp: '198.51.100.20', port: 80, proto: 'HTTP', duration: '2分钟' },
  ],
  accounts: [
    { name: 'user001', loginTime: '2026-07-09 08:30:00', status: '在线' },
    { name: 'admin', loginTime: '2026-07-09 07:00:00', status: '在线' },
  ],
  threats: [
    { type: '恶意软件', level: 'high', source: 'Maltrail', time: '2026-07-09 10:45:32', ioc: '104.16.181.15' },
    { type: '钓鱼网站', level: 'medium', source: 'SSL Blacklist', time: '2026-07-09 10:42:18', ioc: 'suspicious.net' },
  ],
})

function openIpProfileModal(ip: string) {
  ipProfileModal.ip = ip
  ipProfileModal.visible = true
}
function goToTrace(proto: string) { console.log('Go to trace for:', proto) }

function closeAllModals() {
  sourceDetailModal.visible = false
  alertConfigModal.visible = false
  alertNotifyModal.visible = false
  intelQueryModal.visible = false
  customIntelModal.visible = false
  syncConfirmModal.visible = false
  syncSettingsModal.visible = false
  ipProfileModal.visible = false
  packetAnalysisModal.visible = false
  ipStatsMenuVisible.value = false
  accountStatsMenuVisible.value = false
  addWhitelistModal.visible = false
  threatTypeDetailModal.visible = false
  batchSetModal.visible = false
  clearHitConfirmModal.visible = false
  manageHitLogModal.visible = false
}
</script>

<style scoped>
.ti-container { position: relative; height: 100%; display: flex; flex-direction: column; }
.ti-loading-mask { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255,255,255,0.8); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 1000; }
.ti-loading-spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #409eff; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.ti-loading-text { margin-top: 12px; font-size: 14px; color: #606266; }

.ti-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.ti-top-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; background: #fafafa; border-bottom: 1px solid #e4e7ed; flex-shrink: 0; }
.ti-tab-bar { display: flex; gap: 0; }
.ti-tab { padding: 10px 20px; border: none; background: transparent; font-size: 14px; font-weight: 500; color: #606266; cursor: pointer; position: relative; }
.ti-tab.active { color: #409eff; }
.ti-tab.active::after { content: ''; position: absolute; bottom: -1px; left: 20px; right: 20px; height: 2px; background: #409eff; }
.ti-action-bar { display: flex; gap: 8px; }
.ti-action-btn { padding: 6px 14px; border: 1px solid #dcdfe6; border-radius: 4px; background: #fff; color: #606266; font-size: 13px; cursor: pointer; }
.ti-action-btn:hover { border-color: #409eff; color: #409eff; }
.ti-action-btn-primary { background: #409eff; color: #fff; border-color: #409eff; }
.ti-action-btn-primary:hover { background: #66b1ff; }

.ti-overview { flex: 1; overflow: auto; padding: 12px; background: #f5f7fa; }
.ti-section { background: #fff; border: 1px solid #ebeef5; border-radius: 4px; margin-bottom: 12px; }
.ti-section-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; border-bottom: 1px solid #f0f2f5; }
.ti-section-title { margin: 0; font-size: 14px; font-weight: 700; color: #303133; }
.ti-section-count { font-size: 12px; color: #909399; }
.ti-more-btn { font-size: 13px; color: #409eff; background: none; border: none; cursor: pointer; }

.ti-table-wrap { padding: 0 14px 14px; overflow: auto; }
.ti-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.ti-table th { background: #fafbfc; border-bottom: 1px solid #ebeef5; padding: 8px 10px; text-align: left; font-weight: 600; color: #606266; white-space: nowrap; font-size: 12px; }
.ti-table td { border-bottom: 1px solid #f0f2f5; padding: 8px 10px; color: #303133; }
.ti-table .col-check { width: 42px; text-align: center; }
.ti-table .col-idx { width: 52px; text-align: center; }
.ti-table .col-time { min-width: 140px; }
.ti-table .col-ip { min-width: 120px; }
.ti-table .col-ioc { min-width: 140px; }
.ti-table .col-proto { width: 70px; }
.ti-table .col-level { width: 80px; }
.ti-table .col-count { width: 100px; text-align: right; }
.ti-table .col-hit { width: 100px; text-align: right; }
.ti-table .col-match, .ti-table .col-alert, .ti-table .col-auto { width: 80px; text-align: center; }
.ti-table .col-time { width: 160px; }
.ti-table .col-actions { width: 100px; text-align: center; }
.ti-mini-table { max-height: 240px; }

.ti-link { color: #2563eb; cursor: pointer; text-decoration: underline; }
.ti-link:hover { color: #1d4ed8; text-decoration: underline; }

.ti-chart-row { display: grid; grid-template-columns: minmax(0, 1.72fr) minmax(260px, 0.88fr); gap: 12px; }
.ti-chart-section { min-height: 300px; display: flex; flex-direction: column; }
.ti-chart { flex: 1; min-height: 200px; }
.ti-time-range { display: inline-flex; gap: 0; border: 1px solid #dcdfe6; border-radius: 4px; overflow: hidden; }
.ti-time-btn { padding: 6px 12px; border: none; background: #fff; color: #303133; font-size: 12px; cursor: pointer; }
.ti-time-btn + .ti-time-btn { border-left: 1px solid #dcdfe6; }
.ti-time-btn.active { background: #409eff; color: #fff; }

.ti-bottom-row { display: grid; grid-template-columns: minmax(0, 1.72fr) minmax(260px, 0.88fr); gap: 12px; }

.ti-level { display: inline-block; padding: 2px 6px; border-radius: 3px; font-size: 11px; font-weight: 500; }
.ti-level-high { background: #fef0f0; color: #f56c6c; }
.ti-level-medium { background: #fdf6ec; color: #e6a23c; }
.ti-level-low { background: #f0f9eb; color: #67c23a; }

.ti-table-btn { padding: 4px 8px; border: 1px solid #dcdfe6; border-radius: 3px; background: #fff; color: #606266; font-size: 12px; cursor: pointer; }
.ti-table-btn:hover { border-color: #409eff; color: #409eff; }

.ti-modal-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; }

.ti-source-detail { padding: 8px; }
.ti-source-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f0f2f5; margin-bottom: 12px; }
.ti-source-toolbar-left { display: flex; align-items: center; gap: 12px; }
.ti-source-toolbar-right { display: flex; align-items: center; gap: 12px; }
.ti-source-label { font-size: 13px; color: #606266; }
.ti-source-select { height: 28px; padding: 0 6px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 13px; }
.ti-source-search { height: 28px; padding: 0 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 13px; width: 180px; }
.ti-source-btn { padding: 4px 12px; border: 1px solid #dcdfe6; border-radius: 4px; background: #fff; color: #606266; font-size: 12px; cursor: pointer; }
.ti-trend-mini { height: 40px; }

.ti-alert-config { padding: 8px; }
.ti-alert-toolbar { display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid #f0f2f5; margin-bottom: 12px; }
.ti-alert-label { font-size: 13px; color: #606266; }
.ti-alert-select { height: 28px; padding: 0 6px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 13px; min-width: 180px; }
.ti-alert-btn { padding: 4px 12px; border: 1px solid #dcdfe6; border-radius: 4px; background: #fff; color: #606266; font-size: 12px; cursor: pointer; }
.ti-alert-btn-save { background: #409eff; color: #fff; border-color: #409eff; }
.ti-threshold-input { width: 80px; height: 28px; padding: 0 6px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 13px; text-align: center; }

.ti-alert-notify { padding: 8px; }
.ti-notify-tabs { display: flex; gap: 0; border-bottom: 1px solid #ebeef5; margin-bottom: 12px; }
.ti-notify-tab { padding: 8px 16px; border: none; background: transparent; font-size: 13px; color: #606266; cursor: pointer; position: relative; }
.ti-notify-tab.active { color: #409eff; }
.ti-notify-tab.active::after { content: ''; position: absolute; bottom: -1px; left: 16px; right: 16px; height: 2px; background: #409eff; }
.ti-notify-content { padding: 12px; }
.ti-notify-qrcode { display: flex; flex-direction: column; align-items: center; margin-bottom: 16px; }
.ti-qrcode-placeholder { width: 120px; height: 120px; border: 1px dashed #dcdfe6; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #909399; font-size: 12px; }
.ti-notify-switch { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.ti-notify-form { display: flex; flex-direction: column; gap: 12px; }
.ti-notify-label { font-size: 13px; color: #606266; }
.ti-notify-input { height: 30px; padding: 0 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 13px; }
.ti-notify-select { height: 30px; padding: 0 6px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 13px; }
.ti-notify-btn { padding: 6px 20px; border: 1px solid #409eff; border-radius: 4px; background: #409eff; color: #fff; font-size: 13px; cursor: pointer; }
.ti-test-form { display: flex; flex-direction: column; gap: 12px; }

.ti-intel-query { padding: 16px; }
.ti-query-form { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.ti-query-label { font-size: 13px; color: #606266; }
.ti-query-input { flex: 1; height: 30px; padding: 0 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 13px; }
.ti-query-btn { padding: 6px 20px; border: 1px solid #409eff; border-radius: 4px; background: #409eff; color: #fff; font-size: 13px; cursor: pointer; }
.ti-query-result { border: 1px solid #e4e7ed; border-radius: 4px; padding: 12px; }
.ti-result-title { font-size: 13px; font-weight: 600; color: #303133; margin-bottom: 12px; }
.ti-result-item { display: flex; gap: 8px; padding: 6px 0; font-size: 13px; }
.ti-result-label { color: #606266; }
.ti-result-value { color: #303133; }
.ti-query-noresult { text-align: center; color: #909399; padding: 20px; }

.ti-custom-intel { padding: 16px; }
.ti-custom-item { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.ti-custom-label { font-size: 13px; color: #606266; }
.ti-custom-select { height: 30px; padding: 0 6px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 13px; min-width: 200px; }
.ti-custom-btn { padding: 4px 12px; border: 1px solid #dcdfe6; border-radius: 4px; background: #fff; color: #606266; font-size: 12px; cursor: pointer; }
.ti-custom-btn-primary { background: #409eff; color: #fff; border-color: #409eff; }
.ti-custom-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; }

.ti-sync-confirm { padding: 24px; text-align: center; }
.ti-sync-icon { font-size: 48px; color: #e6a23c; margin-bottom: 16px; }
.ti-sync-text { font-size: 16px; font-weight: 600; color: #303133; margin-bottom: 8px; }
.ti-sync-desc { font-size: 13px; color: #909399; margin-bottom: 20px; }
.ti-sync-actions { display: flex; justify-content: center; gap: 12px; }
.ti-sync-btn { padding: 6px 20px; border: 1px solid #dcdfe6; border-radius: 4px; background: #fff; color: #606266; font-size: 13px; cursor: pointer; }
.ti-sync-btn-primary { background: #409eff; color: #fff; border-color: #409eff; }

.ti-sync-settings { padding: 16px; }
.ti-settings-item { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.ti-settings-label { font-size: 13px; color: #606266; }
.ti-settings-input { height: 30px; padding: 0 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 13px; }
.ti-settings-desc { font-size: 12px; color: #909399; margin-bottom: 20px; }
.ti-settings-actions { display: flex; justify-content: flex-end; gap: 12px; }
.ti-settings-btn { padding: 6px 20px; border: 1px solid #dcdfe6; border-radius: 4px; background: #fff; color: #606266; font-size: 13px; cursor: pointer; }
.ti-settings-btn-primary { background: #409eff; color: #fff; border-color: #409eff; }

.ti-ip-profile { padding: 8px; }
.ti-ip-tabs { display: flex; gap: 0; border-bottom: 1px solid #ebeef5; margin-bottom: 12px; }
.ti-ip-tab { padding: 8px 16px; border: none; background: transparent; font-size: 13px; color: #606266; cursor: pointer; position: relative; }
.ti-ip-tab.active { color: #409eff; }
.ti-ip-tab.active::after { content: ''; position: absolute; bottom: -1px; left: 16px; right: 16px; height: 2px; background: #409eff; }
.ti-ip-content { padding: 8px; }
.ti-ip-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
.ti-ip-card { background: #f5f7fa; border-radius: 4px; padding: 12px; text-align: center; }
.ti-ip-card-label { font-size: 12px; color: #606266; margin-bottom: 4px; }
.ti-ip-card-value { font-size: 18px; font-weight: 700; color: #303133; }

.ti-history { flex: 1; overflow: auto; padding: 12px; background: #f5f7fa; }
.ti-history-toolbar { display: flex; justify-content: space-between; align-items: center; width: 100%; }
.ti-history-filters { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.ti-history-input { height: 28px; padding: 0 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 13px; min-width: 100px; }
.ti-history-select { height: 28px; padding: 0 6px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 13px; min-width: 100px; }
.ti-history-btn-search { height: 28px; padding: 0 12px; border: 1px solid #dcdfe6; border-radius: 4px; background: #fff; color: #606266; font-size: 13px; cursor: pointer; }
.ti-history-btn-search:hover { border-color: #409eff; color: #409eff; }
.ti-history-btn-reset { height: 28px; padding: 0 12px; border: 1px solid #dcdfe6; border-radius: 4px; background: #fff; color: #606266; font-size: 13px; cursor: pointer; }
.ti-history-btn-reset:hover { border-color: #409eff; color: #409eff; }
.ti-history-actions { display: flex; align-items: center; gap: 8px; }
.ti-history-btn { height: 28px; padding: 0 12px; border: 1px solid #dcdfe6; border-radius: 4px; background: #fff; color: #606266; font-size: 13px; cursor: pointer; }
.ti-history-btn:hover { border-color: #409eff; color: #409eff; }
.ti-history-pagination { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; border-top: 1px solid #f0f2f5; }
.ti-table .col-mac { min-width: 140px; }
.ti-table .col-mac-vendor { min-width: 180px; }
.ti-table .col-source { min-width: 140px; }
.ti-table .col-block { width: 80px; }

.ti-packet-analysis { padding: 8px; }
.ti-packet-tabs { display: flex; gap: 0; border-bottom: 1px solid #ebeef5; margin-bottom: 8px; }
.ti-packet-tab { padding: 6px 12px; border: none; background: transparent; font-size: 12px; color: #606266; cursor: pointer; position: relative; }
.ti-packet-tab.active { color: #409eff; }
.ti-packet-tab.active::after { content: ''; position: absolute; bottom: -1px; left: 12px; right: 12px; height: 2px; background: #409eff; }
.ti-packet-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.ti-packet-search { flex: 1; height: 26px; padding: 0 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 12px; margin-right: 8px; }
.ti-packet-btn { height: 26px; padding: 0 10px; border: 1px solid #dcdfe6; border-radius: 4px; background: #fff; color: #606266; font-size: 12px; cursor: pointer; }
.ti-packet-btn:hover { border-color: #409eff; color: #409eff; }
.ti-packet-select { height: 26px; padding: 0 6px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 12px; }
.ti-packet-content { display: flex; flex-direction: column; gap: 8px; }
.ti-packet-list { overflow: auto; }
.ti-packet-list .ti-table { font-size: 12px; }
.ti-packet-list .ti-table th { padding: 6px 8px; }
.ti-packet-list .ti-table td { padding: 6px 8px; }
.ti-packet-list .ti-table tbody tr.active { background: #ecf5ff; }
.ti-packet-list .col-idx { width: 50px; text-align: center; }
.ti-packet-list .col-time { width: 120px; }
.ti-packet-list .col-src { min-width: 100px; }
.ti-packet-list .col-dst { min-width: 100px; }
.ti-packet-list .col-proto { width: 80px; }
.ti-packet-list .col-length { width: 60px; text-align: right; }
.ti-packet-list .col-detail { flex: 1; }
.ti-packet-detail { background: #f5f7fa; border-radius: 4px; padding: 8px; max-height: 150px; overflow: auto; }
.ti-packet-text { margin: 0; font-family: monospace; font-size: 12px; line-height: 1.5; color: #303133; white-space: pre-wrap; }
.ti-packet-hex { background: #1a1a1a; border-radius: 4px; padding: 8px; max-height: 150px; overflow: auto; }
.ti-packet-hex-text { margin: 0; font-family: monospace; font-size: 12px; line-height: 1.5; color: #00ff00; }
.ti-packet-no-data { text-align: center; color: #909399; padding: 40px; }

.ti-data-diagnosis { flex: 1; overflow: auto; padding: 12px; background: #f5f7fa; }
.ti-diagnosis-toolbar { display: flex; justify-content: space-between; align-items: center; width: 100%; }
.ti-diagnosis-filters { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.ti-diagnosis-input { height: 28px; padding: 0 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 13px; min-width: 100px; }
.ti-diagnosis-select { height: 28px; padding: 0 6px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 13px; min-width: 100px; }
.ti-diagnosis-ip-version { display: flex; border: 1px solid #dcdfe6; border-radius: 4px; overflow: hidden; }
.ti-diagnosis-ip-btn { height: 28px; padding: 0 12px; border: none; background: #fff; color: #606266; font-size: 13px; cursor: pointer; }
.ti-diagnosis-ip-btn.active { background: #409eff; color: #fff; }
.ti-diagnosis-btn-search { height: 28px; padding: 0 12px; border: 1px solid #dcdfe6; border-radius: 4px; background: #fff; color: #606266; font-size: 13px; cursor: pointer; }
.ti-diagnosis-btn-search:hover { border-color: #409eff; color: #409eff; }
.ti-diagnosis-btn-reset { height: 28px; padding: 0 12px; border: 1px solid #dcdfe6; border-radius: 4px; background: #fff; color: #606266; font-size: 13px; cursor: pointer; }
.ti-diagnosis-btn-reset:hover { border-color: #409eff; color: #409eff; }
.ti-diagnosis-actions { display: flex; align-items: center; gap: 8px; }
.ti-diagnosis-btn { height: 28px; padding: 0 12px; border: 1px solid #dcdfe6; border-radius: 4px; background: #fff; color: #606266; font-size: 13px; cursor: pointer; }
.ti-diagnosis-btn:hover { border-color: #409eff; color: #409eff; }

.ti-diagnosis-charts { display: flex; gap: 12px; margin-top: 12px; }
.ti-diagnosis-chart-left { flex: 2; background: #fff; border-radius: 4px; padding: 12px; }
.ti-diagnosis-chart-right { flex: 1; background: #fff; border-radius: 4px; padding: 12px; }
.ti-trend-chart { width: 100%; height: 220px; }
.ti-pie-chart { width: 100%; height: 220px; }

.ti-diagnosis-tables { display: flex; gap: 12px; margin-top: 12px; }
.ti-diagnosis-table-item { flex: 1; background: #fff; border-radius: 4px; padding: 12px; }
.ti-table-header { margin-bottom: 8px; }
.ti-table-title { font-size: 14px; font-weight: 600; color: #303133; }
.ti-table-small { font-size: 12px; }
.ti-table-small th { padding: 6px 8px; }
.ti-table-small td { padding: 6px 8px; }
.ti-diagnosis-pagination { display: flex; align-items: center; justify-content: center; gap: 8px; padding-top: 8px; border-top: 1px solid #f0f2f5; }

.ti-ip-stats { flex: 1; overflow: auto; padding: 12px; background: #f5f7fa; }
.ti-ip-stats-toolbar { display: flex; justify-content: space-between; align-items: center; width: 100%; }
.ti-ip-stats-filters { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.ti-ip-stats-input { height: 28px; padding: 0 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 13px; min-width: 100px; }
.ti-ip-stats-select { height: 28px; padding: 0 6px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 13px; min-width: 100px; }
.ti-ip-stats-ip-version { display: flex; border: 1px solid #dcdfe6; border-radius: 4px; overflow: hidden; }
.ti-ip-stats-ip-btn { height: 28px; padding: 0 12px; border: none; background: #fff; color: #606266; font-size: 13px; cursor: pointer; }
.ti-ip-stats-ip-btn.active { background: #409eff; color: #fff; }
.ti-ip-stats-btn-search { height: 28px; padding: 0 12px; border: 1px solid #dcdfe6; border-radius: 4px; background: #fff; color: #606266; font-size: 13px; cursor: pointer; }
.ti-ip-stats-btn-search:hover { border-color: #409eff; color: #409eff; }
.ti-ip-stats-btn-reset { height: 28px; padding: 0 12px; border: 1px solid #dcdfe6; border-radius: 4px; background: #fff; color: #606266; font-size: 13px; cursor: pointer; }
.ti-ip-stats-btn-reset:hover { border-color: #409eff; color: #409eff; }
.ti-ip-stats-actions { display: flex; align-items: center; gap: 8px; }
.ti-ip-stats-btn { height: 28px; padding: 0 12px; border: 1px solid #dcdfe6; border-radius: 4px; background: #fff; color: #606266; font-size: 13px; cursor: pointer; }
.ti-ip-stats-btn:hover { border-color: #409eff; color: #409eff; }
.ti-action-trigger { cursor: pointer; }
.ti-action-btn { cursor: pointer; font-size: 14px; color: #409eff; }
.ti-action-btn:hover { color: #66b1ff; }
.ti-type-tag { display: inline-block; padding: 2px 6px; background: #fef0f0; color: #f56c6c; border-radius: 2px; font-size: 11px; }

.ti-ip-stats-menu { position: fixed; background: #fff; border: 1px solid #ebeef5; border-radius: 4px; box-shadow: 0 2px 12px rgba(0,0,0,0.1); z-index: 1000; padding: 4px 0; min-width: 120px; }
.ti-ip-stats-menu-item { padding: 6px 12px; cursor: pointer; font-size: 13px; color: #606266; }
.ti-ip-stats-menu-item:hover { background: #ecf5ff; color: #409eff; }

.ti-account-stats { flex: 1; overflow: auto; padding: 12px; background: #f5f7fa; }
.ti-account-stats-toolbar { display: flex; justify-content: space-between; align-items: center; width: 100%; }
.ti-account-stats-filters { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.ti-account-stats-input { height: 28px; padding: 0 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 13px; min-width: 100px; }
.ti-account-stats-select { height: 28px; padding: 0 6px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 13px; min-width: 100px; }
.ti-account-stats-ip-version { display: flex; border: 1px solid #dcdfe6; border-radius: 4px; overflow: hidden; }
.ti-account-stats-ip-btn { height: 28px; padding: 0 12px; border: none; background: #fff; color: #606266; font-size: 13px; cursor: pointer; }
.ti-account-stats-ip-btn.active { background: #409eff; color: #fff; }
.ti-account-stats-btn-search { height: 28px; padding: 0 12px; border: 1px solid #dcdfe6; border-radius: 4px; background: #fff; color: #606266; font-size: 13px; cursor: pointer; }
.ti-account-stats-btn-search:hover { border-color: #409eff; color: #409eff; }
.ti-account-stats-btn-reset { height: 28px; padding: 0 12px; border: 1px solid #dcdfe6; border-radius: 4px; background: #fff; color: #606266; font-size: 13px; cursor: pointer; }
.ti-account-stats-btn-reset:hover { border-color: #409eff; color: #409eff; }
.ti-account-stats-actions { display: flex; align-items: center; gap: 8px; }
.ti-account-stats-btn { height: 28px; padding: 0 12px; border: 1px solid #dcdfe6; border-radius: 4px; background: #fff; color: #606266; font-size: 13px; cursor: pointer; }
.ti-account-stats-btn:hover { border-color: #409eff; color: #409eff; }

.ti-account-stats-menu { position: fixed; background: #fff; border: 1px solid #ebeef5; border-radius: 4px; box-shadow: 0 2px 12px rgba(0,0,0,0.1); z-index: 1000; padding: 4px 0; min-width: 120px; }
.ti-account-stats-menu-item { padding: 6px 12px; cursor: pointer; font-size: 13px; color: #606266; }
.ti-account-stats-menu-item:hover { background: #ecf5ff; color: #409eff; }

.ti-realtime { flex: 1; overflow: auto; padding: 12px; background: #f5f7fa; }
.ti-realtime-cards { display: flex; gap: 12px; margin-bottom: 12px; }
.ti-realtime-card { flex: 1; background: #fff; border-radius: 4px; padding: 16px; text-align: center; border-left: 4px solid #e6a23c; }
.ti-card-num { font-size: 28px; font-weight: 700; color: #303133; }
.ti-card-label { font-size: 13px; color: #909399; margin-top: 4px; }
.ti-realtime-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.ti-realtime-section { background: #fff; border-radius: 4px; padding: 12px; }
.ti-realtime-section-header { margin-bottom: 8px; }
.ti-realtime-section-title { font-size: 14px; font-weight: 600; color: #303133; }
.ti-realtime-pagination { display: flex; align-items: center; justify-content: center; gap: 8px; padding-top: 8px; border-top: 1px solid #f0f2f5; }
.ti-cert-pie-chart { width: 100%; height: 180px; }
.ti-location-tag { display: inline-block; padding: 2px 6px; background: #fef0f0; color: #f56c6c; border-radius: 2px; font-size: 11px; }

.ti-cert-analysis { flex: 1; overflow: auto; padding: 12px; background: #f5f7fa; }
.ti-cert-analysis-toolbar { display: flex; justify-content: space-between; align-items: flex-start; width: 100%; }
.ti-cert-analysis-filters { display: flex; flex-direction: column; gap: 8px; flex: 1; }
.ti-cert-analysis-filter-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.ti-cert-analysis-input { height: 28px; padding: 0 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 13px; min-width: 100px; }
.ti-cert-analysis-btn-search { height: 28px; padding: 0 12px; border: 1px solid #dcdfe6; border-radius: 4px; background: #fff; color: #606266; font-size: 13px; cursor: pointer; }
.ti-cert-analysis-btn-search:hover { border-color: #409eff; color: #409eff; }
.ti-cert-analysis-btn-reset { height: 28px; padding: 0 12px; border: 1px solid #dcdfe6; border-radius: 4px; background: #fff; color: #606266; font-size: 13px; cursor: pointer; }
.ti-cert-analysis-btn-reset:hover { border-color: #409eff; color: #409eff; }
.ti-cert-analysis-actions { display: flex; align-items: center; gap: 8px; }
.ti-cert-analysis-btn { height: 28px; padding: 0 12px; border: 1px solid #dcdfe6; border-radius: 4px; background: #fff; color: #606266; font-size: 13px; cursor: pointer; }
.ti-cert-analysis-btn:hover { border-color: #409eff; color: #409eff; }
.ti-cert-analysis-action-btn { padding: 4px 8px; border: 1px solid #dcdfe6; border-radius: 4px; background: #fff; color: #409eff; font-size: 12px; cursor: pointer; }
.ti-cert-analysis-action-btn:hover { background: #ecf5ff; }

.ti-cert-history { padding: 8px; }
.ti-cert-history-filters { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
.ti-cert-history-filter-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.ti-cert-history-input { height: 28px; padding: 0 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 13px; min-width: 100px; }
.ti-cert-history-select { height: 28px; padding: 0 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 13px; min-width: 100px; background: #fff; }
.ti-cert-history-btn-search { height: 28px; padding: 0 12px; border: 1px solid #dcdfe6; border-radius: 4px; background: #fff; color: #606266; font-size: 13px; cursor: pointer; }
.ti-cert-history-btn-search:hover { border-color: #409eff; color: #409eff; }
.ti-cert-history-btn-reset { height: 28px; padding: 0 12px; border: 1px solid #dcdfe6; border-radius: 4px; background: #fff; color: #606266; font-size: 13px; cursor: pointer; }
.ti-cert-history-btn-reset:hover { border-color: #409eff; color: #409eff; }
.ti-cert-history-action-btn { padding: 4px 8px; border: 1px solid #dcdfe6; border-radius: 4px; background: #fff; color: #606266; font-size: 12px; cursor: pointer; margin-right: 4px; }
.ti-cert-history-action-btn:hover { border-color: #409eff; color: #409eff; }
.ti-cert-summary-content { font-size: 11px; color: #606266; line-height: 1.6; }

.ti-hit-logs { flex: 1; overflow: auto; padding: 12px; background: #f5f7fa; }
.ti-hit-logs-toolbar { display: flex; justify-content: space-between; align-items: center; width: 100%; }
.ti-hit-logs-filters { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.ti-hit-logs-select { height: 28px; padding: 0 6px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 13px; min-width: 120px; }
.ti-hit-logs-search { height: 28px; padding: 0 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 13px; width: 200px; }
.ti-hit-logs-btn-search { height: 28px; padding: 0 12px; border: 1px solid #dcdfe6; border-radius: 4px; background: #fff; color: #606266; font-size: 13px; cursor: pointer; }
.ti-hit-logs-btn-search:hover { border-color: #409eff; color: #409eff; }
.ti-hit-logs-btn-reset { height: 28px; padding: 0 12px; border: 1px solid #dcdfe6; border-radius: 4px; background: #fff; color: #606266; font-size: 13px; cursor: pointer; }
.ti-hit-logs-btn-reset:hover { border-color: #409eff; color: #409eff; }
.ti-hit-logs-actions { display: flex; align-items: center; gap: 8px; }
.ti-hit-logs-btn { height: 28px; padding: 0 12px; border: 1px solid #dcdfe6; border-radius: 4px; background: #fff; color: #606266; font-size: 13px; cursor: pointer; }
.ti-hit-logs-btn:hover { border-color: #409eff; color: #409eff; }
.ti-hit-logs-pagination { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; border-top: 1px solid #f0f2f5; }
.ti-table .col-src-ip { min-width: 160px; }
.ti-table .col-dst-ip { min-width: 160px; }
.ti-table .col-account { width: 100px; }
.ti-table .col-location { width: 100px; }
.ti-table .col-threat-level { width: 100px; }
.ti-table .col-intel-type { min-width: 100px; }
.ti-table .col-malicious-family { min-width: 100px; }
.ti-table .col-action { width: 80px; }

.ti-hit-users { flex: 1; overflow: auto; padding: 12px; background: #f5f7fa; }
.ti-hit-users-toolbar { display: flex; justify-content: flex-start; align-items: center; width: 100%; }
.ti-hit-users-filter { display: flex; align-items: center; gap: 8px; }
.ti-hit-users-search { height: 28px; padding: 0 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 13px; width: 200px; }
.ti-hit-users-btn-search { height: 28px; padding: 0 12px; border: 1px solid #dcdfe6; border-radius: 4px; background: #fff; color: #606266; font-size: 13px; cursor: pointer; }
.ti-hit-users-btn-search:hover { border-color: #409eff; color: #409eff; }
.ti-table .col-ip { min-width: 140px; }
.ti-table .col-mac { min-width: 160px; }
.ti-table .col-account { width: 100px; }
.ti-table .col-hit-count { width: 120px; text-align: right; }
.ti-hit-users-pagination { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; border-top: 1px solid #f0f2f5; }

.ti-whitelist { flex: 1; overflow: auto; padding: 12px; background: #f5f7fa; }
.ti-whitelist-toolbar { display: flex; justify-content: space-between; align-items: center; width: 100%; }
.ti-whitelist-filter { display: flex; align-items: center; gap: 8px; }
.ti-whitelist-search { height: 28px; padding: 0 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 13px; width: 200px; }
.ti-whitelist-btn-search { height: 28px; padding: 0 12px; border: 1px solid #dcdfe6; border-radius: 4px; background: #fff; color: #606266; font-size: 13px; cursor: pointer; }
.ti-whitelist-btn-search:hover { border-color: #409eff; color: #409eff; }
.ti-whitelist-actions { display: flex; gap: 8px; }
.ti-whitelist-btn { padding: 4px 12px; border: 1px solid #dcdfe6; border-radius: 4px; background: #fff; color: #606266; font-size: 12px; cursor: pointer; }
.ti-whitelist-btn:hover { border-color: #409eff; color: #409eff; }
.ti-table .col-object { flex: 1; min-width: 200px; }

.ti-add-whitelist { padding: 16px; }
.ti-add-item { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.ti-add-label { font-size: 13px; color: #606266; }
.ti-add-input { height: 32px; padding: 0 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 13px; width: 100%; box-sizing: border-box; }
.ti-add-checkbox { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; font-size: 13px; color: #606266; }
.ti-add-checkbox input[type="checkbox"] { width: 16px; height: 16px; }
.ti-add-actions { display: flex; justify-content: flex-end; gap: 12px; }
.ti-add-btn { padding: 6px 20px; border: 1px solid #dcdfe6; border-radius: 4px; background: #fff; color: #606266; font-size: 13px; cursor: pointer; }
.ti-add-btn-primary { background: #409eff; color: #fff; border-color: #409eff; }

.ti-manage { flex: 1; overflow: auto; padding: 12px; background: #f5f7fa; }
.ti-manage-toolbar { display: flex; justify-content: space-between; align-items: center; width: 100%; }
.ti-manage-filter { display: flex; align-items: center; gap: 8px; }
.ti-manage-select { height: 28px; padding: 0 6px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 13px; min-width: 100px; }
.ti-manage-search { height: 28px; padding: 0 8px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 13px; width: 180px; }
.ti-manage-btn-search { height: 28px; padding: 0 12px; border: 1px solid #dcdfe6; border-radius: 4px; background: #fff; color: #606266; font-size: 13px; cursor: pointer; }
.ti-manage-btn-search:hover { border-color: #409eff; color: #409eff; }
.ti-manage-actions { display: flex; gap: 8px; }
.ti-manage-btn { padding: 4px 12px; border: 1px solid #dcdfe6; border-radius: 4px; background: #fff; color: #606266; font-size: 12px; cursor: pointer; }
.ti-manage-btn:hover { border-color: #409eff; color: #409eff; }
.ti-table .col-type { min-width: 100px; }
.ti-table .col-monitor, .ti-table .col-block, .ti-table .col-log { width: 80px; text-align: center; }
.ti-table .col-hit-count { width: 100px; text-align: right; }
.ti-table .col-trend { width: 120px; }

.ti-threat-detail { padding: 8px; }
.ti-detail-header { padding: 8px 0; border-bottom: 1px solid #f0f2f5; margin-bottom: 12px; }
.ti-detail-header h4 { margin: 0; font-size: 16px; font-weight: 600; color: #303133; }
.ti-detail-content p { font-size: 13px; color: #606266; line-height: 1.6; margin: 0; }
.ti-detail-actions { display: flex; justify-content: flex-end; margin-top: 16px; }
.ti-detail-btn { padding: 6px 20px; border: 1px solid #409eff; border-radius: 4px; background: #409eff; color: #fff; font-size: 13px; cursor: pointer; }

.ti-batch-set { padding: 16px; }
.ti-batch-item { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.ti-batch-label { font-size: 13px; color: #606266; }
.ti-batch-select { height: 30px; padding: 0 6px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 13px; width: 200px; }
.ti-batch-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; }
.ti-batch-btn { padding: 6px 20px; border: 1px solid #dcdfe6; border-radius: 4px; background: #fff; color: #606266; font-size: 13px; cursor: pointer; }
.ti-batch-btn-primary { background: #409eff; color: #fff; border-color: #409eff; }

.ti-clear-confirm { padding: 20px; text-align: center; }
.ti-clear-icon { font-size: 40px; color: #e6a23c; margin-bottom: 12px; }
.ti-clear-text { font-size: 14px; font-weight: 600; color: #303133; }
.ti-clear-actions { display: flex; justify-content: center; gap: 12px; margin-top: 20px; }
.ti-clear-btn { padding: 6px 20px; border: 1px solid #dcdfe6; border-radius: 4px; background: #fff; color: #606266; font-size: 13px; cursor: pointer; }
.ti-clear-btn-primary { background: #409eff; color: #fff; border-color: #409eff; }

.ti-manage-hit-log { padding: 8px; }
.ti-manage-hit-log .ti-chart { height: 200px; }
.ti-table .col-src-ip, .ti-table .col-dst-ip { min-width: 140px; }
.ti-table .col-account { width: 100px; }
.ti-table .col-location { width: 80px; }
.ti-table .col-threat-level { width: 80px; }
.ti-table .col-intel-type { width: 100px; }
.ti-table .col-malicious-family { width: 100px; }
.ti-table .col-action { width: 80px; }
.ti-no-data { text-align: center; color: #909399; padding: 20px; }

.ti-manage-pagination { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; border-top: 1px solid #f0f2f5; }
.ti-page-btn { padding: 4px 12px; border: 1px solid #dcdfe6; border-radius: 4px; background: #fff; color: #606266; font-size: 12px; cursor: pointer; }
.ti-page-btn:hover:not(:disabled) { border-color: #409eff; color: #409eff; }
.ti-page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.ti-page-input { width: 50px; height: 28px; padding: 0 6px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 13px; text-align: center; }
.ti-page-select { height: 28px; padding: 0 6px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 13px; }

@media (max-width: 1200px) {
  .ti-chart-row, .ti-bottom-row { grid-template-columns: 1fr; }
  .ti-ip-cards { grid-template-columns: repeat(2, 1fr); }
}
</style>