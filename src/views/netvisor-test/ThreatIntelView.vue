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
    </div>

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
  { key: 'manage', label: '情报管理' },
  { key: 'whitelist', label: '白名单' },
  { key: 'hit-users', label: '命中用户' },
  { key: 'hit-logs', label: '命中日志' },
  { key: 'history', label: '历史命中' },
  { key: 'data-diagnosis', label: '数据诊断' },
  { key: 'ip-stats', label: 'IP统计' },
  { key: 'export', label: '情报导出' },
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
  result: null as any[],
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

.ti-link { color: #409eff; cursor: pointer; }
.ti-link:hover { text-decoration: underline; }

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

@media (max-width: 1200px) {
  .ti-chart-row, .ti-bottom-row { grid-template-columns: 1fr; }
  .ti-ip-cards { grid-template-columns: repeat(2, 1fr); }
}
</style>