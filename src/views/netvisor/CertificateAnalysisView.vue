<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav" role="tablist" aria-label="证书分析">
        <button v-for="tab in tabs" :key="tab.key" type="button" class="nv-tab" :class="{ active: activeTab === tab.key }" role="tab" :aria-selected="activeTab === tab.key" @click="activeTab = tab.key">{{ tab.label }}</button>
      </div>
    </div>
    <div class="nv-tabs-body">

      <!-- 实时概况 -->
      <div class="ca-panel" :class="{ active: activeTab === 'realtime' }" data-ca-panel="realtime" role="tabpanel">
        <div class="car-page">
          <div class="car-top-row">
            <div class="car-stats-grid">
              <div v-for="s in statCards" :key="s.label" class="car-stat-card">
                <div class="car-stat-icon" :class="'car-stat-icon--' + s.type" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false" v-html="s.svg"></svg>
                </div>
                <div class="car-stat-body">
                  <div class="car-stat-val">{{ s.val }}</div>
                  <div class="car-stat-label">{{ s.label }}</div>
                </div>
              </div>
            </div>
            <section class="car-pie-panel">
              <h3 class="car-pie-title">类型分布</h3>
              <v-chart class="car-pie-chart" :option="pieOption" autoresize />
            </section>
          </div>

          <div class="car-table-row">
            <section class="car-table-panel car-table-panel--expiring">
              <div class="car-table-head"><h3 class="car-table-title">待处理的证书</h3><button type="button" class="car-table-menu" title="列设置">☰</button></div>
              <div class="ou-table-wrap car-table-wrap">
                <table class="ou-table car-table">
                  <thead><tr><th class="col-idx">序号</th><th class="col-cert">证书域名</th><th class="col-period">证书期限</th><th class="col-target-ip">目标IP</th><th class="col-ca">CA证书</th><th class="col-geo">地理位置</th></tr></thead>
                  <tbody>
                    <tr v-for="(item, idx) in paginatedData(pendingCerts, pendingPage, pendingPageSize)" :key="idx">
                      <td class="col-idx">{{ (pendingPage - 1) * pendingPageSize + idx + 1 }}</td>
                      <td class="col-cert"><a class="car-cert-link" @click="openCertHistory(item)">{{ item.name }}</a></td>
                      <td class="col-period">{{ item.date }}</td>
                      <td class="col-target-ip">{{ item.dstIp }}</td>
                      <td class="col-ca">{{ item.ca }}</td>
                      <td class="col-geo"><span class="car-geo-tag">{{ item.location }}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="ou-footer car-table-footer">
                <div class="ou-footer-left"><div class="ou-pager"><button type="button" class="ou-page-btn" :disabled="pendingPage <= 1" @click="pendingPage--">‹</button><button v-for="p in getPageList(pendingPage, totalPages(pendingCerts.length, pendingPageSize))" :key="p" type="button" class="ou-page-btn" :class="{ active: pendingPage === p }" @click="pendingPage = p">{{ p }}</button><button type="button" class="ou-page-btn" :disabled="pendingPage >= totalPages(pendingCerts.length, pendingPageSize)" @click="pendingPage++">›</button></div></div>
                <div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" v-model.number="pendingPage" /> 页 <button type="button" class="ou-page-goto-btn" @click="pendingPage = Math.min(Math.max(1, pendingPage), totalPages(pendingCerts.length, pendingPageSize))">确定</button></label><span>共 {{ pendingCerts.length }} 条</span><label class="ou-page-size"><select v-model.number="pendingPageSize"><option :value="10">10条/页</option><option :value="20">20条/页</option><option :value="50">50条/页</option><option :value="100">100条/页</option></select></label></div>
              </div>
            </section>
            <section class="car-table-panel car-table-panel--expired">
              <div class="car-table-head"><h3 class="car-table-title">已过期的证书</h3><button type="button" class="car-table-menu" title="列设置">☰</button></div>
              <div class="ou-table-wrap car-table-wrap">
                <table class="ou-table car-table">
                  <thead><tr><th class="col-idx">序号</th><th class="col-cert">证书域名</th><th class="col-period">证书期限</th><th class="col-target-ip">目标IP</th><th class="col-ca">CA证书</th><th class="col-geo">地理位置</th></tr></thead>
                  <tbody>
                    <tr v-for="(item, idx) in paginatedData(expiredCerts, expiredPage, expiredPageSize)" :key="idx">
                      <td class="col-idx">{{ (expiredPage - 1) * expiredPageSize + idx + 1 }}</td>
                      <td class="col-cert"><a class="car-cert-link" @click="openCertHistory(item)">{{ item.name }}</a></td>
                      <td class="col-period">{{ item.date }}</td>
                      <td class="col-target-ip">{{ item.dstIp }}</td>
                      <td class="col-ca">{{ item.ca }}</td>
                      <td class="col-geo"><span class="car-geo-tag">{{ item.location }}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="ou-footer car-table-footer">
                <div class="ou-footer-left"><div class="ou-pager"><button type="button" class="ou-page-btn" :disabled="expiredPage <= 1" @click="expiredPage--">‹</button><button v-for="p in getPageList(expiredPage, totalPages(expiredCerts.length, expiredPageSize))" :key="p" type="button" class="ou-page-btn" :class="{ active: expiredPage === p }" @click="expiredPage = p">{{ p }}</button><button type="button" class="ou-page-btn" :disabled="expiredPage >= totalPages(expiredCerts.length, expiredPageSize)" @click="expiredPage++">›</button></div></div>
                <div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" v-model.number="expiredPage" /> 页 <button type="button" class="ou-page-goto-btn" @click="expiredPage = Math.min(Math.max(1, expiredPage), totalPages(expiredCerts.length, expiredPageSize))">确定</button></label><span>共 {{ expiredCerts.length }} 条</span><label class="ou-page-size"><select v-model.number="expiredPageSize"><option :value="10">10条/页</option><option :value="20">20条/页</option><option :value="50">50条/页</option><option :value="100">100条/页</option></select></label></div>
              </div>
            </section>
          </div>

          <div class="car-table-row">
            <section class="car-table-panel car-table-panel--temp">
              <div class="car-table-head"><h3 class="car-table-title">已吊销证书</h3><button type="button" class="car-table-menu" title="列设置">☰</button></div>
              <div class="ou-table-wrap car-table-wrap">
                <table class="ou-table car-table">
                  <thead><tr><th class="col-idx">序号</th><th class="col-cert">证书域名</th><th class="col-period">证书期限</th><th class="col-target-ip">目标IP</th><th class="col-ca">CA证书</th><th class="col-geo">地理位置</th></tr></thead>
                  <tbody>
                    <tr v-for="(item, idx) in paginatedData(revokedCerts, revokedPage, revokedPageSize)" :key="idx">
                      <td class="col-idx">{{ (revokedPage - 1) * revokedPageSize + idx + 1 }}</td>
                      <td class="col-cert"><a class="car-cert-link" @click="openCertHistory(item)">{{ item.name }}</a></td>
                      <td class="col-period">{{ item.date }}</td>
                      <td class="col-target-ip">{{ item.dstIp }}</td>
                      <td class="col-ca">{{ item.ca }}</td>
                      <td class="col-geo"><span class="car-geo-tag">{{ item.location }}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="ou-footer car-table-footer">
                <div class="ou-footer-left"><div class="ou-pager"><button type="button" class="ou-page-btn" :disabled="revokedPage <= 1" @click="revokedPage--">‹</button><button v-for="p in getPageList(revokedPage, totalPages(revokedCerts.length, revokedPageSize))" :key="p" type="button" class="ou-page-btn" :class="{ active: revokedPage === p }" @click="revokedPage = p">{{ p }}</button><button type="button" class="ou-page-btn" :disabled="revokedPage >= totalPages(revokedCerts.length, revokedPageSize)" @click="revokedPage++">›</button></div></div>
                <div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" v-model.number="revokedPage" /> 页 <button type="button" class="ou-page-goto-btn" @click="revokedPage = Math.min(Math.max(1, revokedPage), totalPages(revokedCerts.length, revokedPageSize))">确定</button></label><span>共 {{ revokedCerts.length }} 条</span><label class="ou-page-size"><select v-model.number="revokedPageSize"><option :value="10">10条/页</option><option :value="20">20条/页</option><option :value="50">50条/页</option><option :value="100">100条/页</option></select></label></div>
              </div>
            </section>
            <section class="car-table-panel car-table-panel--normal">
              <div class="car-table-head"><h3 class="car-table-title">正常证书</h3><button type="button" class="car-table-menu" title="列设置">☰</button></div>
              <div class="ou-table-wrap car-table-wrap">
                <table class="ou-table car-table">
                  <thead><tr><th class="col-idx">序号</th><th class="col-cert">证书域名</th><th class="col-period">证书期限</th><th class="col-target-ip">目标IP</th><th class="col-ca">CA证书</th><th class="col-geo">地理位置</th></tr></thead>
                  <tbody>
                    <tr v-for="(item, idx) in paginatedData(normalCerts, normalPage, normalPageSize)" :key="idx">
                      <td class="col-idx">{{ (normalPage - 1) * normalPageSize + idx + 1 }}</td>
                      <td class="col-cert"><a class="car-cert-link" @click="openCertHistory(item)">{{ item.name }}</a></td>
                      <td class="col-period">{{ item.date }}</td>
                      <td class="col-target-ip">{{ item.dstIp }}</td>
                      <td class="col-ca">{{ item.ca }}</td>
                      <td class="col-geo"><span class="car-geo-tag">{{ item.location }}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="ou-footer car-table-footer">
                <div class="ou-footer-left"><div class="ou-pager"><button type="button" class="ou-page-btn" :disabled="normalPage <= 1" @click="normalPage--">‹</button><button v-for="p in getPageList(normalPage, totalPages(normalCerts.length, normalPageSize))" :key="p" type="button" class="ou-page-btn" :class="{ active: normalPage === p }" @click="normalPage = p">{{ p }}</button><button type="button" class="ou-page-btn" :disabled="normalPage >= totalPages(normalCerts.length, normalPageSize)" @click="normalPage++">›</button></div></div>
                <div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" v-model.number="normalPage" /> 页 <button type="button" class="ou-page-goto-btn" @click="normalPage = Math.min(Math.max(1, normalPage), totalPages(normalCerts.length, normalPageSize))">确定</button></label><span>共 {{ normalCerts.length }} 条</span><label class="ou-page-size"><select v-model.number="normalPageSize"><option :value="10">10条/页</option><option :value="20">20条/页</option><option :value="50">50条/页</option><option :value="100">100条/页</option></select></label></div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <!-- 历史概况 -->
      <div class="ca-panel" :class="{ active: activeTab === 'history-overview' }" data-ca-panel="history-overview" role="tabpanel">
        <div class="car-page cah-page">
          <div class="cah-filters tdh-filters">
            <div class="tdh-filter-row tdh-filter-row-actions">
              <label class="tdh-filter-field"><select class="ou-toolbar-select"><option selected>目标IP</option></select><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="任意IP" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">目标端口</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="80 / 8000-8080" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">域名</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="" /></label>
              <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" type="text" value="2026-07-10 09:55:30 - 2026-07-10 10:10:30" /></label>
              <button type="button" class="ou-search-btn">搜索</button>
              <button type="button" class="secondary td-reset-btn">重置</button>
            </div>
          </div>

          <div class="car-top-row">
            <div class="car-stats-grid">
              <div v-for="s in historyStatCards" :key="'h-'+s.label" class="car-stat-card">
                <div class="car-stat-icon" :class="'car-stat-icon--' + s.type" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false" v-html="s.svg"></svg>
                </div>
                <div class="car-stat-body">
                  <div class="car-stat-val">{{ s.val }}</div>
                  <div class="car-stat-label">{{ s.label }}</div>
                </div>
              </div>
            </div>
            <section class="car-pie-panel">
              <h3 class="car-pie-title">类型分布</h3>
              <v-chart class="car-pie-chart" :option="historyPieOption" autoresize />
            </section>
          </div>

          <div class="car-table-row">
            <section class="car-table-panel car-table-panel--expiring">
              <div class="car-table-head"><h3 class="car-table-title">即将到期的证书数量</h3><button type="button" class="car-table-menu">☰</button></div>
              <div class="ou-table-wrap car-table-wrap">
                <table class="ou-table car-table">
                  <thead><tr><th class="col-idx">序号</th><th class="col-cert">证书域名</th><th class="col-period">证书期限</th><th class="col-target-ip">目标IP</th><th class="col-ca">CA证书</th><th class="col-geo">地理位置</th></tr></thead>
                  <tbody>
                    <tr v-for="(item, idx) in paginatedData(historyExpiringCerts, historyExpiringPage, historyExpiringPageSize)" :key="idx">
                      <td class="col-idx">{{ (historyExpiringPage - 1) * historyExpiringPageSize + idx + 1 }}</td>
                      <td class="col-cert"><a class="car-cert-link" @click="openHistoryCertHistory(item)">{{ item.name }}</a></td>
                      <td class="col-period">{{ item.date }}</td>
                      <td class="col-target-ip">{{ item.dstIp }}</td>
                      <td class="col-ca">{{ item.ca }}</td>
                      <td class="col-geo"><span class="car-geo-tag">{{ item.location }}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="ou-footer car-table-footer">
                <div class="ou-footer-left"><div class="ou-pager"><button type="button" class="ou-page-btn" :disabled="historyExpiringPage <= 1" @click="historyExpiringPage--">‹</button><button v-for="p in getPageList(historyExpiringPage, totalPages(historyExpiringCerts.length, historyExpiringPageSize))" :key="p" type="button" class="ou-page-btn" :class="{ active: historyExpiringPage === p }" @click="historyExpiringPage = p">{{ p }}</button><button type="button" class="ou-page-btn" :disabled="historyExpiringPage >= totalPages(historyExpiringCerts.length, historyExpiringPageSize)" @click="historyExpiringPage++">›</button></div></div>
                <div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" v-model.number="historyExpiringPage" /> 页 <button type="button" class="ou-page-goto-btn" @click="historyExpiringPage = Math.min(Math.max(1, historyExpiringPage), totalPages(historyExpiringCerts.length, historyExpiringPageSize))">确定</button></label><span>共 {{ historyExpiringCerts.length }} 条</span><label class="ou-page-size"><select v-model.number="historyExpiringPageSize"><option :value="10">10条/页</option><option :value="20">20条/页</option><option :value="50">50条/页</option><option :value="100">100条/页</option></select></label></div>
              </div>
            </section>
            <section class="car-table-panel car-table-panel--expired">
              <div class="car-table-head"><h3 class="car-table-title">已经到期的证书数量</h3><button type="button" class="car-table-menu">☰</button></div>
              <div class="ou-table-wrap car-table-wrap">
                <table class="ou-table car-table">
                  <thead><tr><th class="col-idx">序号</th><th class="col-cert">证书域名</th><th class="col-period">证书期限</th><th class="col-target-ip">目标IP</th><th class="col-ca">CA证书</th><th class="col-geo">地理位置</th></tr></thead>
                  <tbody>
                    <tr v-for="(item, idx) in paginatedData(historyExpiredCerts, historyExpiredPage, historyExpiredPageSize)" :key="idx">
                      <td class="col-idx">{{ (historyExpiredPage - 1) * historyExpiredPageSize + idx + 1 }}</td>
                      <td class="col-cert"><a class="car-cert-link" @click="openHistoryCertHistory(item)">{{ item.name }}</a></td>
                      <td class="col-period">{{ item.date }}</td>
                      <td class="col-target-ip">{{ item.dstIp }}</td>
                      <td class="col-ca">{{ item.ca }}</td>
                      <td class="col-geo"><span class="car-geo-tag">{{ item.location }}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="ou-footer car-table-footer">
                <div class="ou-footer-left"><div class="ou-pager"><button type="button" class="ou-page-btn" :disabled="historyExpiredPage <= 1" @click="historyExpiredPage--">‹</button><button v-for="p in getPageList(historyExpiredPage, totalPages(historyExpiredCerts.length, historyExpiredPageSize))" :key="p" type="button" class="ou-page-btn" :class="{ active: historyExpiredPage === p }" @click="historyExpiredPage = p">{{ p }}</button><button type="button" class="ou-page-btn" :disabled="historyExpiredPage >= totalPages(historyExpiredCerts.length, historyExpiredPageSize)" @click="historyExpiredPage++">›</button></div></div>
                <div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" v-model.number="historyExpiredPage" /> 页 <button type="button" class="ou-page-goto-btn" @click="historyExpiredPage = Math.min(Math.max(1, historyExpiredPage), totalPages(historyExpiredCerts.length, historyExpiredPageSize))">确定</button></label><span>共 {{ historyExpiredCerts.length }} 条</span><label class="ou-page-size"><select v-model.number="historyExpiredPageSize"><option :value="10">10条/页</option><option :value="20">20条/页</option><option :value="50">50条/页</option><option :value="100">100条/页</option></select></label></div>
              </div>
            </section>
          </div>
          <div class="car-table-row">
            <section class="car-table-panel car-table-panel--temp">
              <div class="car-table-head"><h3 class="car-table-title">临时证书</h3><button type="button" class="car-table-menu">☰</button></div>
              <div class="ou-table-wrap car-table-wrap">
                <table class="ou-table car-table">
                  <thead><tr><th class="col-idx">序号</th><th class="col-cert">证书域名</th><th class="col-period">证书期限</th><th class="col-target-ip">目标IP</th><th class="col-ca">CA证书</th><th class="col-geo">地理位置</th></tr></thead>
                  <tbody>
                    <tr v-for="(item, idx) in paginatedData(historyTempCerts, historyTempPage, historyTempPageSize)" :key="idx">
                      <td class="col-idx">{{ (historyTempPage - 1) * historyTempPageSize + idx + 1 }}</td>
                      <td class="col-cert"><a class="car-cert-link" @click="openHistoryCertHistory(item)">{{ item.name }}</a></td>
                      <td class="col-period">{{ item.date }}</td>
                      <td class="col-target-ip">{{ item.dstIp }}</td>
                      <td class="col-ca">{{ item.ca }}</td>
                      <td class="col-geo"><span class="car-geo-tag">{{ item.location }}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="ou-footer car-table-footer">
                <div class="ou-footer-left"><div class="ou-pager"><button type="button" class="ou-page-btn" :disabled="historyTempPage <= 1" @click="historyTempPage--">‹</button><button v-for="p in getPageList(historyTempPage, totalPages(historyTempCerts.length, historyTempPageSize))" :key="p" type="button" class="ou-page-btn" :class="{ active: historyTempPage === p }" @click="historyTempPage = p">{{ p }}</button><button type="button" class="ou-page-btn" :disabled="historyTempPage >= totalPages(historyTempCerts.length, historyTempPageSize)" @click="historyTempPage++">›</button></div></div>
                <div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" v-model.number="historyTempPage" /> 页 <button type="button" class="ou-page-goto-btn" @click="historyTempPage = Math.min(Math.max(1, historyTempPage), totalPages(historyTempCerts.length, historyTempPageSize))">确定</button></label><span>共 {{ historyTempCerts.length }} 条</span><label class="ou-page-size"><select v-model.number="historyTempPageSize"><option :value="10">10条/页</option><option :value="20">20条/页</option><option :value="50">50条/页</option><option :value="100">100条/页</option></select></label></div>
              </div>
            </section>
            <section class="car-table-panel car-table-panel--normal">
              <div class="car-table-head"><h3 class="car-table-title">正常证书</h3><button type="button" class="car-table-menu">☰</button></div>
              <div class="ou-table-wrap car-table-wrap">
                <table class="ou-table car-table">
                  <thead><tr><th class="col-idx">序号</th><th class="col-cert">证书域名</th><th class="col-period">证书期限</th><th class="col-target-ip">目标IP</th><th class="col-ca">CA证书</th><th class="col-geo">地理位置</th></tr></thead>
                  <tbody>
                    <tr v-for="(item, idx) in paginatedData(historyNormalCerts, historyNormalPage, historyNormalPageSize)" :key="idx">
                      <td class="col-idx">{{ (historyNormalPage - 1) * historyNormalPageSize + idx + 1 }}</td>
                      <td class="col-cert"><a class="car-cert-link" @click="openHistoryCertHistory(item)">{{ item.name }}</a></td>
                      <td class="col-period">{{ item.date }}</td>
                      <td class="col-target-ip">{{ item.dstIp }}</td>
                      <td class="col-ca">{{ item.ca }}</td>
                      <td class="col-geo"><span class="car-geo-tag">{{ item.location }}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="ou-footer car-table-footer">
                <div class="ou-footer-left"><div class="ou-pager"><button type="button" class="ou-page-btn" :disabled="historyNormalPage <= 1" @click="historyNormalPage--">‹</button><button v-for="p in getPageList(historyNormalPage, totalPages(historyNormalCerts.length, historyNormalPageSize))" :key="p" type="button" class="ou-page-btn" :class="{ active: historyNormalPage === p }" @click="historyNormalPage = p">{{ p }}</button><button type="button" class="ou-page-btn" :disabled="historyNormalPage >= totalPages(historyNormalCerts.length, historyNormalPageSize)" @click="historyNormalPage++">›</button></div></div>
                <div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" v-model.number="historyNormalPage" /> 页 <button type="button" class="ou-page-goto-btn" @click="historyNormalPage = Math.min(Math.max(1, historyNormalPage), totalPages(historyNormalCerts.length, historyNormalPageSize))">确定</button></label><span>共 {{ historyNormalCerts.length }} 条</span><label class="ou-page-size"><select v-model.number="historyNormalPageSize"><option :value="10">10条/页</option><option :value="20">20条/页</option><option :value="50">50条/页</option><option :value="100">100条/页</option></select></label></div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <!-- 历史会话 -->
      <div class="ca-panel" :class="{ active: activeTab === 'history-sessions' }" data-ca-panel="history-sessions" role="tabpanel">
        <div class="cas-page">
          <div class="tdh-filters cas-filters">
            <div class="tdh-filter-row">
              <label class="tdh-filter-field"><select class="ou-toolbar-select" v-model="hsSrcIp"><option value="">源IP</option><option value="任意IP">任意IP</option><option value="166.111.5.220">166.111.5.220</option><option value="101.6.64.201">101.6.64.201</option></select><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="任意IP" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">源端口</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="80 / 8000-8080" /></label>
              <label class="tdh-filter-field"><select class="ou-toolbar-select" v-model="hsDstIp"><option value="">目标IP</option><option value="任意IP">任意IP</option><option value="116.62.205.66">116.62.205.66</option><option value="101.6.6.853">101.6.6.853</option></select><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="任意IP" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">目标端口</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="80 / 8000-8080" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">关键字</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="" /></label>
            </div>
            <div class="tdh-filter-row tdh-filter-row-actions">
              <label class="tdh-filter-field"><span class="ou-toolbar-label">MAC</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="" /></label>
              <label class="tdh-filter-field"><span class="ou-toolbar-label">备用名称</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="" /></label>
              <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" type="text" value="2026-07-10 10:04:57 - 2026-07-10 10:19:47" /></label>
              <div class="tdh-filter-field cas-filter-actions">
                <button type="button" class="ou-search-btn">搜索</button>
                <button type="button" class="secondary td-reset-btn">重置</button>
              </div>
            </div>
          </div>

          <div class="ou-table-wrap cas-table-wrap">
            <table class="ou-table cas-table">
              <thead><tr><th class="col-idx">序号</th><th class="col-time">请求时间</th><th class="col-mac">MAC</th><th class="col-mac-vendor">MAC厂商</th><th class="col-endpoint">源IP</th><th class="col-endpoint">目标IP</th><th class="col-geo">地理位置</th><th class="col-cert-summary">证书摘要</th><th class="col-actions">操作</th></tr></thead>
              <tbody>
                <tr v-for="(item, idx) in paginatedData(historySessions, hsPage, hsPageSize)" :key="idx">
                  <td class="col-idx">{{ (hsPage - 1) * hsPageSize + idx + 1 }}</td>
                  <td class="col-time">{{ item.time }}</td>
                  <td class="col-mac">{{ item.mac }}</td>
                  <td class="col-mac-vendor">{{ item.vendor }}</td>
                  <td class="col-endpoint">{{ item.srcIp }}</td>
                  <td class="col-endpoint">{{ item.dstIp }}</td>
                  <td class="col-geo"><span class="car-geo-tag">{{ item.location }}</span></td>
                  <td class="col-cert-summary"><div class="car-cert-summary-lines"><div v-for="(line, li) in item.summaryLines" :key="li">{{ line }}</div></div></td>
                  <td class="col-actions"><a class="car-action-link" @click="openPacketModal(item)">下载</a><br><a class="car-action-link" @click="openCertDetailModal(item)">详情</a><br><a class="car-action-link" @click="openPacketModal(item)">数据包</a></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="ou-footer ou-footer-td cas-footer">
            <div class="ou-footer-left"><div class="ou-pager"><button type="button" class="ou-page-btn" :disabled="hsPage <= 1" @click="hsPage--">‹</button><button v-for="p in getPageList(hsPage, totalPages(hsTotalCount, hsPageSize))" :key="p" type="button" class="ou-page-btn" :class="{ active: hsPage === p }" @click="hsPage = p">{{ p }}</button><button type="button" class="ou-page-btn" :disabled="hsPage >= totalPages(hsTotalCount, hsPageSize)" @click="hsPage++">›</button></div></div>
            <div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" v-model.number="hsPage" /> 页 <button type="button" class="ou-page-goto-btn" @click="hsPage = Math.min(Math.max(1, hsPage), totalPages(hsTotalCount, hsPageSize))">确定</button></label><span>共 {{ hsTotalCount }} 条</span><label class="ou-page-size"><select v-model.number="hsPageSize"><option :value="20">20条/页</option><option :value="50">50条/页</option><option :value="100">100条/页</option></select></label></div>
          </div>
        </div>
      </div>

      <!-- 证书告警 -->
      <div class="ca-panel" :class="{ active: activeTab === 'cert-alerts' }" data-ca-panel="cert-alerts" role="tabpanel">
        <div class="caa-page">
          <div class="ou-toolbar caa-toolbar">
            <div class="caa-toolbar-actions">
              <button type="button" class="link-btn caa-link-btn" @click="openAlertNotifyModal">通知方式</button>
              <button type="button" class="link-btn caa-link-btn" @click="openAlertPeriodModal">告警设置</button>
              <span class="caa-toolbar-sep" aria-hidden="true"></span>
              <button type="button" class="link-btn caa-action-btn" @click="openAddCertModal">+ 添加</button>
              <button type="button" class="link-btn caa-action-btn" @click="deleteSelectedAlerts">删除选中</button>
            </div>
          </div>

          <div class="ou-table-wrap caa-table-wrap">
            <table class="ou-table caa-table">
              <thead><tr><th class="col-check"><input type="checkbox" aria-label="全选" v-model="caaSelectAll" @change="toggleSelectAll" /></th><th class="col-idx">序号</th><th class="col-domain">域名</th><th class="col-date">颁发日期</th><th class="col-date">结束日期</th><th class="col-period">使用期限</th><th class="col-usage-pct">使用占比</th><th class="col-remain">剩余天数</th><th class="col-type">类型</th><th class="col-threshold">告警阈值</th><th class="col-name">名称</th><th class="col-actions">操作</th></tr></thead>
              <tbody>
                <tr v-if="certAlerts.length === 0"><td colspan="12" class="ou-empty">无数据</td></tr>
                <tr v-for="(item, idx) in paginatedData(certAlerts, caaPage, caaPageSize)" :key="item.id">
                  <td class="col-check"><input type="checkbox" :checked="caaSelected.includes(item.id)" @change="toggleSelectOne(item.id)" /></td>
                  <td class="col-idx">{{ (caaPage - 1) * caaPageSize + idx + 1 }}</td>
                  <td class="col-domain">{{ item.domain }}</td>
                  <td class="col-date">{{ item.issueDate }}</td>
                  <td class="col-date">{{ item.endDate }}</td>
                  <td class="col-period">{{ item.period }}</td>
                  <td class="col-usage-pct">{{ item.usagePct }}</td>
                  <td class="col-remain">{{ item.remainDays }}</td>
                  <td class="col-type">{{ item.type }}</td>
                  <td class="col-threshold">{{ item.threshold }}</td>
                  <td class="col-name">{{ item.name }}</td>
                  <td class="col-actions"><a class="car-action-link" @click="openEditCertModal(item)">编辑</a> <a class="car-action-link" @click="deleteOneAlert(item.id)">删除</a></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="ou-footer ou-footer-td caa-footer">
            <div class="ou-footer-left"><div class="ou-pager"><button type="button" class="ou-page-btn" :disabled="caaPage <= 1" @click="caaPage--">‹</button><button v-for="p in getPageList(caaPage, totalPages(certAlerts.length || 1, caaPageSize))" :key="p" type="button" class="ou-page-btn" :class="{ active: caaPage === p }" @click="caaPage = p">{{ p }}</button><button type="button" class="ou-page-btn" :disabled="caaPage >= totalPages(certAlerts.length || 1, caaPageSize)" @click="caaPage++">›</button></div></div>
            <div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" v-model.number="caaPage" /> 页 <button type="button" class="ou-page-goto-btn" @click="caaPage = Math.min(Math.max(1, caaPage), totalPages(certAlerts.length || 1, caaPageSize))">确定</button></label><span>共 {{ certAlerts.length }} 条</span><label class="ou-page-size"><select v-model.number="caaPageSize"><option :value="20">20条/页</option><option :value="50">50条/页</option><option :value="100">100条/页</option></select></label></div>
          </div>
        </div>
      </div>

    </div>

    <!-- 证书历史会话弹窗 -->
    <el-dialog v-model="certHistoryVisible" :title="certHistoryTitle" width="1200px" :close-on-click-modal="false" @close="certHistoryVisible = false">
      <div class="cas-page" style="min-height: 400px;">
        <div class="tdh-filters cas-filters">
          <div class="tdh-filter-row">
            <label class="tdh-filter-field"><select class="ou-toolbar-select" v-model="chSrcIp"><option value="">源IP</option><option value="任意IP">任意IP</option><option value="166.111.5.220">166.111.5.220</option><option value="101.6.64.201">101.6.64.201</option></select><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="任意IP" /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">源端口</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="80 / 8000-8080" /></label>
            <label class="tdh-filter-field"><select class="ou-toolbar-select" v-model="chDstIp"><option value="">目标IP</option><option value="任意IP">任意IP</option><option value="116.62.205.66">116.62.205.66</option><option value="101.6.6.853">101.6.6.853</option></select><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="任意IP" /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">目标端口</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="80 / 8000-8080" /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">关键字</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="" /></label>
          </div>
          <div class="tdh-filter-row tdh-filter-row-actions">
            <label class="tdh-filter-field"><span class="ou-toolbar-label">MAC</span><input class="ou-toolbar-input tdh-filter-input" type="text" placeholder="" /></label>
            <label class="tdh-filter-field"><span class="ou-toolbar-label">备用名称</span><input class="ou-toolbar-input tdh-filter-input" type="text" v-model="chAltName" placeholder="" /></label>
            <label class="tdh-filter-field tdh-filter-time"><span class="ou-toolbar-label">时间范围</span><input class="ou-toolbar-input tdh-time-range" type="text" value="— - —" /></label>
            <div class="tdh-filter-field cas-filter-actions">
              <button type="button" class="ou-search-btn">搜索</button>
              <button type="button" class="secondary td-reset-btn">重置</button>
            </div>
          </div>
        </div>

        <div class="ou-table-wrap cas-table-wrap">
          <table class="ou-table cas-table">
            <thead><tr><th class="col-idx">序号</th><th class="col-time">请求时间</th><th class="col-mac">MAC</th><th class="col-mac-vendor">MAC厂商</th><th class="col-endpoint">源IP</th><th class="col-endpoint">目标IP</th><th class="col-geo">地理位置</th><th class="col-cert-summary">证书摘要</th><th class="col-actions">操作</th></tr></thead>
            <tbody>
              <tr v-for="(item, idx) in paginatedData(historySessions, chPage, chPageSize)" :key="idx">
                <td class="col-idx">{{ (chPage - 1) * chPageSize + idx + 1 }}</td>
                <td class="col-time">{{ item.time }}</td>
                <td class="col-mac">{{ item.mac }}</td>
                <td class="col-mac-vendor">{{ item.vendor }}</td>
                <td class="col-endpoint">{{ item.srcIp }}</td>
                <td class="col-endpoint">{{ item.dstIp }}</td>
                <td class="col-geo"><span class="car-geo-tag">{{ item.location }}</span></td>
                <td class="col-cert-summary"><div class="car-cert-summary-lines"><div v-for="(line, li) in item.summaryLines" :key="li">{{ line }}</div></div></td>
                <td class="col-actions"><a class="car-action-link">下载</a><br><a class="car-action-link">详情</a><br><a class="car-action-link">数据包</a></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="ou-footer ou-footer-td cas-footer">
          <div class="ou-footer-left"><div class="ou-pager"><button type="button" class="ou-page-btn" :disabled="chPage <= 1" @click="chPage--">‹</button><button v-for="p in getPageList(chPage, totalPages(historySessions.length, chPageSize))" :key="p" type="button" class="ou-page-btn" :class="{ active: chPage === p }" @click="chPage = p">{{ p }}</button><button type="button" class="ou-page-btn" :disabled="chPage >= totalPages(historySessions.length, chPageSize)" @click="chPage++">›</button></div></div>
          <div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" v-model.number="chPage" /> 页 <button type="button" class="ou-page-goto-btn" @click="chPage = Math.min(Math.max(1, chPage), totalPages(historySessions.length, chPageSize))">确定</button></label><span>共 {{ historySessions.length }} 条</span><label class="ou-page-size"><select v-model.number="chPageSize"><option :value="20">20条/页</option><option :value="50">50条/页</option><option :value="100">100条/页</option></select></label></div>
        </div>
      </div>
    </el-dialog>

    <!-- 证书详情弹窗 -->
    <el-dialog v-model="certDetailVisible" title="证书详情" width="900px" :close-on-click-modal="false" @close="certDetailVisible = false">
      <div class="cd-page">
        <div class="cd-tabs">
          <button type="button" class="cd-tab" :class="{ active: certDetailTab === 'raw' }" @click="certDetailTab = 'raw'">原始内容</button>
          <button type="button" class="cd-tab" :class="{ active: certDetailTab === 'detail' }" @click="certDetailTab = 'detail'">证书详情</button>
        </div>
        <div class="cd-body">
          <div v-if="certDetailTab === 'raw'" class="cd-raw">
            <pre class="cd-raw-pre">{{ certDetailRaw }}</pre>
          </div>
          <div v-if="certDetailTab === 'detail'" class="cd-detail">
            <table class="cd-detail-table">
              <tbody>
                <tr v-for="(row, ri) in certDetailRows" :key="ri">
                  <th class="cd-detail-key">{{ row.key }}</th>
                  <td class="cd-detail-val">{{ row.val }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 报文分析弹窗 -->
    <el-dialog v-model="packetVisible" title="报文分析" width="1100px" :close-on-click-modal="false" @close="packetVisible = false">
      <div class="pa-page">
        <div class="pa-tabs">
          <button type="button" class="pa-tab" :class="{ active: packetTab === 'parse' }" @click="packetTab = 'parse'">报文解析</button>
          <button type="button" class="pa-tab" :class="{ active: packetTab === 'interact' }" @click="packetTab = 'interact'">报文交互</button>
          <button type="button" class="pa-tab" :class="{ active: packetTab === 'meta' }" @click="packetTab = 'meta'">元数据</button>
        </div>
        <div class="pa-body">
          <div v-if="packetTab === 'parse'" class="pa-parse">
            <div class="ou-table-wrap pa-table-wrap">
              <table class="ou-table pa-table">
                <thead><tr><th class="col-idx">序号</th><th class="col-time">时间</th><th class="col-src">源IP</th><th class="col-dst">目标IP</th><th class="col-proto">协议</th><th class="col-len">长度</th><th class="col-info">信息</th></tr></thead>
                <tbody>
                  <tr v-for="(p, idx) in packetParseData" :key="idx">
                    <td class="col-idx">{{ idx + 1 }}</td>
                    <td class="col-time">{{ p.time }}</td>
                    <td class="col-src">{{ p.src }}</td>
                    <td class="col-dst">{{ p.dst }}</td>
                    <td class="col-proto">{{ p.proto }}</td>
                    <td class="col-len">{{ p.len }}</td>
                    <td class="col-info">{{ p.info }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div v-if="packetTab === 'interact'" class="pa-interact">
            <div class="ou-table-wrap pa-table-wrap">
              <table class="ou-table pa-table">
                <thead><tr><th class="col-idx">序号</th><th class="col-time">时间</th><th class="col-src">源IP</th><th class="col-dst">目标IP</th><th class="col-proto">协议</th><th class="col-info">交互信息</th></tr></thead>
                <tbody>
                  <tr v-for="(p, idx) in packetInteractData" :key="idx">
                    <td class="col-idx">{{ idx + 1 }}</td>
                    <td class="col-time">{{ p.time }}</td>
                    <td class="col-src">{{ p.src }}</td>
                    <td class="col-dst">{{ p.dst }}</td>
                    <td class="col-proto">{{ p.proto }}</td>
                    <td class="col-info">{{ p.info }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div v-if="packetTab === 'meta'" class="pa-meta">
            <table class="cd-detail-table">
              <tbody>
                <tr v-for="(row, ri) in packetMetaData" :key="ri">
                  <th class="cd-detail-key">{{ row.key }}</th>
                  <td class="cd-detail-val">{{ row.val }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 告警通知弹窗 -->
    <el-dialog v-model="alertNotifyVisible" title="告警通知" width="900px" :close-on-click-modal="false" @close="alertNotifyVisible = false">
      <div class="an-page">
        <div class="an-tabs">
          <button v-for="t in alertNotifyTabs" :key="t" type="button" class="an-tab" :class="{ active: alertNotifyTab === t }" @click="alertNotifyTab = t">{{ t }}</button>
        </div>
        <div class="an-body">
          <!-- 微信 -->
          <div v-if="alertNotifyTab === '微信'" class="an-panel">
            <div class="an-section">
              <h4 class="an-section-title">参数设置</h4>
              <div class="an-notice-list">
                <p class="an-notice-item">1. 关注官方公众号；<a class="an-link">查看公众号二维码</a>。</p>
                <p class="an-notice-item">2. 启用微信通知，并扫码绑定设备；<a class="an-link">查看设备二维码</a>。</p>
              </div>
              <p class="an-notice-warn"><strong>注意：</strong> 系统通知功能，需要管理口可以上网。</p>
              <div class="an-form-row">
                <label class="an-form-label">微信通知</label>
                <div class="an-switch-wrap"><button type="button" class="an-switch" :class="{ on: wechatEnabled }" @click="wechatEnabled = !wechatEnabled"><span class="an-switch-dot"></span></button><span class="an-switch-text">{{ wechatEnabled ? '开启' : '关闭' }}</span></div>
              </div>
              <div class="an-form-actions"><button type="button" class="an-submit-btn">提交</button></div>
            </div>
            <div class="an-section">
              <h4 class="an-section-title">已绑定用户</h4>
              <div class="ou-table-wrap an-table-wrap">
                <table class="ou-table an-table">
                  <thead><tr><th>用户ID</th><th>用户备注</th><th class="col-actions">操作</th></tr></thead>
                  <tbody><tr><td colspan="3" class="ou-empty">数据加载中</td></tr></tbody>
                </table>
              </div>
            </div>
          </div>
          <!-- 企业微信 -->
          <div v-if="alertNotifyTab === '企业微信'" class="an-panel">
            <div class="an-section">
              <h4 class="an-section-title">参数设置</h4>
              <div class="an-form-row"><label class="an-form-label">CorpID</label><input class="an-input" type="text" placeholder="请输入CorpID" /></div>
              <div class="an-form-row"><label class="an-form-label">AgentId</label><input class="an-input" type="text" placeholder="请输入AgentId" /></div>
              <div class="an-form-row"><label class="an-form-label">Secret</label><input class="an-input" type="text" placeholder="请输入Secret" /></div>
              <div class="an-form-actions"><button type="button" class="an-submit-btn">提交</button></div>
            </div>
          </div>
          <!-- 钉钉 -->
          <div v-if="alertNotifyTab === '钉钉'" class="an-panel">
            <div class="an-section">
              <h4 class="an-section-title">参数设置</h4>
              <div class="an-form-row"><label class="an-form-label">AppKey</label><input class="an-input" type="text" placeholder="请输入AppKey" /></div>
              <div class="an-form-row"><label class="an-form-label">AppSecret</label><input class="an-input" type="text" placeholder="请输入AppSecret" /></div>
              <div class="an-form-row"><label class="an-form-label">AgentId</label><input class="an-input" type="text" placeholder="请输入AgentId" /></div>
              <div class="an-form-actions"><button type="button" class="an-submit-btn">提交</button></div>
            </div>
          </div>
          <!-- 飞书 -->
          <div v-if="alertNotifyTab === '飞书'" class="an-panel">
            <div class="an-section">
              <h4 class="an-section-title">参数设置</h4>
              <div class="an-form-row"><label class="an-form-label">App ID</label><input class="an-input" type="text" placeholder="请输入App ID" /></div>
              <div class="an-form-row"><label class="an-form-label">App Secret</label><input class="an-input" type="text" placeholder="请输入App Secret" /></div>
              <div class="an-form-actions"><button type="button" class="an-submit-btn">提交</button></div>
            </div>
          </div>
          <!-- 邮箱 -->
          <div v-if="alertNotifyTab === '邮箱'" class="an-panel">
            <div class="an-section">
              <h4 class="an-section-title">参数设置</h4>
              <div class="an-form-row"><label class="an-form-label">SMTP服务器</label><input class="an-input" type="text" placeholder="请输入SMTP服务器地址" /></div>
              <div class="an-form-row"><label class="an-form-label">端口</label><input class="an-input" type="text" placeholder="465" /></div>
              <div class="an-form-row"><label class="an-form-label">发件人邮箱</label><input class="an-input" type="text" placeholder="请输入发件人邮箱" /></div>
              <div class="an-form-row"><label class="an-form-label">授权码</label><input class="an-input" type="password" placeholder="请输入授权码" /></div>
              <div class="an-form-row"><label class="an-form-label">收件人邮箱</label><input class="an-input" type="text" placeholder="多个邮箱用逗号分隔" /></div>
              <div class="an-form-actions"><button type="button" class="an-submit-btn">提交</button></div>
            </div>
          </div>
          <!-- SaaS -->
          <div v-if="alertNotifyTab === 'SaaS'" class="an-panel">
            <div class="an-section">
              <h4 class="an-section-title">参数设置</h4>
              <div class="an-form-row"><label class="an-form-label">API地址</label><input class="an-input" type="text" placeholder="请输入API地址" /></div>
              <div class="an-form-row"><label class="an-form-label">Token</label><input class="an-input" type="text" placeholder="请输入Token" /></div>
              <div class="an-form-actions"><button type="button" class="an-submit-btn">提交</button></div>
            </div>
          </div>
          <!-- Syslog -->
          <div v-if="alertNotifyTab === 'Syslog'" class="an-panel">
            <div class="an-section">
              <h4 class="an-section-title">参数设置</h4>
              <div class="an-form-row"><label class="an-form-label">服务器地址</label><input class="an-input" type="text" placeholder="请输入Syslog服务器地址" /></div>
              <div class="an-form-row"><label class="an-form-label">端口</label><input class="an-input" type="text" placeholder="514" /></div>
              <div class="an-form-row"><label class="an-form-label">协议</label><select class="an-input an-select"><option>UDP</option><option>TCP</option></select></div>
              <div class="an-form-actions"><button type="button" class="an-submit-btn">提交</button></div>
            </div>
          </div>
          <!-- 消息测试 -->
          <div v-if="alertNotifyTab === '消息测试'" class="an-panel">
            <div class="an-section">
              <h4 class="an-section-title">消息测试</h4>
              <p class="an-notice-item">选择通知方式后，点击发送测试消息验证配置是否正确。</p>
              <div class="an-form-actions"><button type="button" class="an-submit-btn">发送测试消息</button></div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 告警周期弹窗 -->
    <el-dialog v-model="alertPeriodVisible" title="告警周期" width="560px" :close-on-click-modal="false" @close="alertPeriodVisible = false">
      <div class="ap-page">
        <div class="ap-form-row">
          <label class="ap-form-label">通知TTL</label>
          <input class="ap-form-input" type="text" v-model="alertPeriodTTL" placeholder="0" />
          <span class="ap-form-hint">秒,通知时间间隔,0表示不通知</span>
        </div>
        <div class="ap-actions">
          <button type="button" class="ap-btn ap-btn-primary" @click="alertPeriodVisible = false">确定</button>
          <button type="button" class="ap-btn ap-btn-default" @click="alertPeriodVisible = false">取消</button>
        </div>
      </div>
    </el-dialog>

    <!-- 添加/编辑证书弹窗 -->
    <el-dialog v-model="addCertVisible" :title="addCertIsEdit ? '编辑' : '添加'" width="560px" :close-on-click-modal="false" @close="addCertVisible = false">
      <div class="ac-page">
        <div class="ac-form-row">
          <label class="ac-form-label">域名</label>
          <input class="ac-form-input" type="text" v-model="addCertForm.domain" placeholder="" />
        </div>
        <div class="ac-form-row">
          <label class="ac-form-label">名称</label>
          <input class="ac-form-input" type="text" v-model="addCertForm.name" placeholder="" />
        </div>
        <div class="ac-form-row">
          <label class="ac-form-label">告警阈值</label>
          <input class="ac-form-input" type="text" v-model="addCertForm.threshold" placeholder="" />
          <span class="ac-form-hint">天</span>
        </div>
        <div class="ac-form-row">
          <label class="ac-form-label">颁发日期</label>
          <input class="ac-form-input" type="text" v-model="addCertForm.issueDate" placeholder="可选" />
        </div>
        <div class="ac-form-row">
          <label class="ac-form-label">结束日期</label>
          <input class="ac-form-input" type="text" v-model="addCertForm.endDate" placeholder="可选" />
        </div>
        <div class="ac-actions">
          <button type="button" class="ac-btn ac-btn-primary" @click="addCertVisible = false">确定</button>
          <button type="button" class="ac-btn ac-btn-default" @click="addCertVisible = false">取消</button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import VChart from 'vue-echarts'

const activeTab = ref('realtime')
const tabs = [
  { key: 'realtime', label: '实时概况' },
  { key: 'history-overview', label: '历史概况' },
  { key: 'history-sessions', label: '历史会话' },
  { key: 'cert-alerts', label: '证书告警' },
]

// SVG icons
const SVG_EXPIRING = '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'
const SVG_EXPIRED = '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 8v5M12 16.5v.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'
const SVG_NORMAL = '<path d="M12 3 4 7v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V7l-8-4z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="m9 12 2 2 4-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'
const SVG_TEMP = '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 12h18M12 3a15 15 0 0 1 4 9 15 15 0 0 1-4 9 15 15 0 0 1-4-9 15 15 0 0 1 4-9z" fill="none" stroke="currentColor" stroke-width="1.4"/>'
const SVG_SELF = '<path d="M12 2 4 6v6c0 5.2 3.4 9.6 8 10.8C16.6 21.6 20 17.2 20 12V6l-8-4z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 12h8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'
const SVG_CA = '<path d="M12 2 4 6v6c0 5.2 3.4 9.6 8 10.8C16.6 21.6 20 17.2 20 12V6l-8-4z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="m9 12 2 2 4-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'

const statCards = [
  { type: 'expiring', label: '待处理的证书数量', val: 18, svg: SVG_EXPIRING },
  { type: 'expired', label: '已过期的证书数量', val: 1, svg: SVG_EXPIRED },
  { type: 'normal', label: '正常证书', val: 45, svg: SVG_NORMAL },
  { type: 'temp', label: '吊销证书', val: 14, svg: SVG_TEMP },
  { type: 'self', label: '异常的证书', val: 20, svg: SVG_SELF },
  { type: 'ca', label: 'CA证书', val: 58, svg: SVG_CA },
]

// Pie chart
const pieOption = computed(() => ({
  tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
  legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { fontSize: 12 } },
  series: [{
    type: 'pie', radius: ['40%', '70%'], center: ['35%', '50%'],
    label: { show: false },
    data: [
      { value: 45, name: '正常证书 (60%)', itemStyle: { color: '#67c23a' } },
      { value: 20, name: '异常证书 (25%)', itemStyle: { color: '#f56c6c' } },
      { value: 14, name: '吊销证书 (15%)', itemStyle: { color: '#e6a23c' } },
    ]
  }]
}))

// Cert data types
interface CertItem { name: string; date: string; dstIp: string; ca: string; location: string }
interface HistorySession { id: number; time: string; mac: string; vendor: string; srcIp: string; dstIp: string; location: string; summaryLines: string[] }

// Mock data
const pendingCerts: CertItem[] = [
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
]

const expiredCerts: CertItem[] = [
  { name: 'dns.tuna.tsinghua.edu.cn', date: '2024-11-25 -- 2025-11-25', dstIp: '101.6.6.853', ca: '是', location: '北京北京教育网' },
]

const revokedCerts: CertItem[] = [
  { name: 'tuna.tsinghua.edu.cn', date: '2025-4-14 -- 2026-4-15', dstIp: '101.6.15.150:443', ca: '是', location: '北京北京教育网' },
  { name: 'sp.tonyuansen.com', date: '2025-7-12 -- 2026-7-12', dstIp: '101.6.15.150:443', ca: '否', location: '北京北京教育网' },
  { name: 'tuna.tsinghua.edu.cn', date: '2025-4-12 -- 2026-4-12', dstIp: '101.6.15.150:443', ca: '是', location: '北京北京教育网' },
  { name: 'cisco.tsinghua.edu.cn', date: '2025-11-23 -- 2026-11-23', dstIp: '101.6.15.150:443', ca: '是', location: '北京北京教育网' },
  { name: 'dev1703.com', date: '2025-8-18 -- 2026-8-17', dstIp: '81.70.127.217:443', ca: '否', location: '北京北京教育网' },
  { name: '1703.com', date: '2025-6-10 -- 2026-6-10', dstIp: '184.50.189.189:443', ca: '否', location: '北京北京教育网' },
  { name: 'storage.googleapis.com', date: '2026-0-22 -- 2026-0-16', dstIp: '14.125.199.207:443', ca: '是', location: '北京北京教育网' },
  { name: 'mirrors.aliyun.com', date: '2026-6-06 -- 2026-6-07', dstIp: '47.92.301.249:443', ca: '是', location: '北京北京教育网' },
  { name: 'www.ubuntu.com', date: '2025-5-26 -- 2026-5-26', dstIp: '114.215.177.177:443', ca: '是', location: '北京北京教育网' },
]

const normalCerts: CertItem[] = [
  { name: 'dns.tuna.tsinghua.edu.cn', date: '2024-11-25 -- 2025-11-25', dstIp: '101.6.6.853', ca: '是', location: '北京北京教育网' },
  { name: '*.google-analytics.com', date: '2025-5-12 -- 2026-5-12', dstIp: '101.6.234.80:90', ca: '否', location: '北京北京教育网' },
  { name: '*.tmgc.edu.cn', date: '2025-6-12 -- 2026-6-12', dstIp: '111.12.28.167:443', ca: '是', location: '北京北京教育网' },
  { name: '*.jlgc.edu.cn', date: '2025-6-12 -- 2026-6-12', dstIp: '202.205.184.10:443', ca: '是', location: '北京北京教育网' },
  { name: '*.jd.com', date: '2025-8-18 -- 2026-8-18', dstIp: '42.186.194.77:443', ca: '否', location: '北京北京教育网' },
  { name: '*.qzone.qq.com', date: '2025-8-18 -- 2026-8-18', dstIp: '45.203.145.166:443', ca: '否', location: '北京北京教育网' },
  { name: '*.com', date: '2025-6-22 -- 2026-6-22', dstIp: '104.17.58.96:443', ca: '否', location: '北京北京教育网' },
  { name: '*.google-analytics.com', date: '2025-6-22 -- 2026-6-22', dstIp: '223.88.198.111:443', ca: '否', location: '北京北京教育网' },
]

// History overview stats (different from realtime)
const historyStatCards = [
  { type: 'expiring', label: '即将到期的证书数量', val: 10, svg: SVG_EXPIRING },
  { type: 'expired', label: '已经到期的证书数量', val: 1, svg: SVG_EXPIRED },
  { type: 'normal', label: '正常证书', val: 28, svg: SVG_NORMAL },
  { type: 'temp', label: '临时证书', val: 7, svg: SVG_TEMP },
  { type: 'self', label: '吊销证书', val: 15, svg: SVG_SELF },
  { type: 'ca', label: 'CA证书', val: 31, svg: SVG_CA },
]

const historyPieOption = computed(() => ({
  tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
  legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { fontSize: 12 } },
  series: [{
    type: 'pie', radius: ['40%', '70%'], center: ['35%', '50%'],
    label: { show: false },
    data: [
      { value: 28, name: '正常证书 (60%)', itemStyle: { color: '#67c23a' } },
      { value: 15, name: '吊销证书 (22%)', itemStyle: { color: '#f56c6c' } },
      { value: 7, name: '临时证书 (10%)', itemStyle: { color: '#e6a23c' } },
      { value: 10, name: '即将到期 (8%)', itemStyle: { color: '#409eff' } },
    ]
  }]
}))

// History overview mock data
const historyExpiringCerts: CertItem[] = [
  { name: '*.eagleyun.cn', date: '2025-07-17 08:00:00 - 2026-07-25...', dstIp: '47.96.147.121:443', ca: '是', location: '浙江杭州网易云' },
  { name: '*.battlenet.com.cn', date: '2026-03-08 08:00:00 - 2026-10-15...', dstIp: '116.62.227.204:443', ca: '是', location: '浙江杭州网易云' },
  { name: 'n8i.net', date: '2025-03-13 12:16:51 - 2026-03-28...', dstIp: '109.75.121.1:443', ca: '是', location: '-' },
  { name: '*.surlight.sony.com', date: '2026-03-23 08:00:00 - 2026-07-16...', dstIp: '47.98.204.113:443', ca: '是', location: '浙江杭州网易云' },
  { name: 'auth.battlenet.com.cn', date: '2025-03-08 08:00:00 - 2026-03-17...', dstIp: '52.80.281.123:443', ca: '是', location: '北京(amazonaws)' },
  { name: '*.flu.cn', date: '2025-06-18 08:00:00 - 2026-03-16...', dstIp: '161.11.5.220:1443', ca: '是', location: '浙江杭州网易云' },
  { name: '*.lenovoem.com', date: '2025-03-24 08:00:00 - 2026-10-08...', dstIp: '120.133.65.236:443', ca: '是', location: '-' },
  { name: '*.nankway.qq.com', date: '2025-09-22 08:00:00 - 2026-03-22...', dstIp: '175.27.9.128:443', ca: '是', location: '天津腾讯云' },
  { name: '*.result.163yun.com', date: '2025-03-17 08:00:00 - 2026-10-02...', dstIp: '111.124.203.9:443', ca: '是', location: '贵州遵义中国电信' },
  { name: '*.battlenet.com.cn', date: '2025-03-08 08:00:00 - 2026-10-15...', dstIp: '116.62.227.204:443', ca: '是', location: '浙江杭州网易云' },
]

const historyExpiredCerts: CertItem[] = [
  { name: 'dns.tuna.tsinghua.edu.cn', date: '2024-11-25 08:00:00 - 2025-11-26...', dstIp: '101.6.6.6:853', ca: '是', location: '北京教育网清华大学' },
]

const historyTempCerts: CertItem[] = [
  { name: 'tuna.tsinghua.edu.cn', date: '2026-01-14 22:19:42 - 2026-07-13...', dstIp: '101.6.15.130:443', ca: '否', location: '北京教育网清华大学' },
  { name: 'cisco1024.com', date: '2025-05-10 08:00:00 - 2026-06-16...', dstIp: '8.110.127.227:443', ca: '是', location: '北京腾讯云' },
  { name: 'sp.notify.windows.com', date: '2025-07-23 01:11:56 - 2026-06-10...', dstIp: '104.47.58.96:443', ca: '否', location: '北京腾讯云' },
  { name: 'storage.googleapis.com', date: '2025-06-22 16:41:24 - 2026-06-14...', dstIp: '173.194.43.207:443', ca: '否', location: '-' },
  { name: '*.hanghan.edu.cn', date: '2025-06-13 23:05:36 - 2026-03-16...', dstIp: '186.111.204.8:895', ca: '否', location: '北京教育网清华大学' },
  { name: 'apisat.video.google.com', date: '2025-06-22 16:37:24 - 2026-06-14...', dstIp: '220.181.174.33:443', ca: '否', location: '北京中国移动IDC' },
  { name: 'cross.tsinghua.edu.cn', date: '2026-01-12 01:11:23 - 2025-06-10...', dstIp: '101.6.14.130:443', ca: '否', location: '北京教育网清华大学' },
]

const historyNormalCerts: CertItem[] = [
  { name: 'mail.qq.com', date: '2026-04-14 08:00:00 - 2026-10-30...', dstIp: '34.45.156.138:443', ca: '是', location: '-' },
  { name: 'v.qq.com', date: '2025-12-11 08:00:00 - 2026-12-11...', dstIp: '109.244.240.33:443', ca: '是', location: '天津腾讯云国际节点' },
  { name: '*.zhidao.com', date: '2026-02-03 08:00:00 - 2027-03-07...', dstIp: '81.70.65.206:443', ca: '是', location: '北京腾讯云' },
  { name: 'b.toutiao.com', date: '2026-03-22 08:00:00 - 2026-12-07...', dstIp: '91.228.165.78:443', ca: '是', location: '-' },
  { name: '*.qgw.163.com', date: '2026-01-21 08:00:00 - 2027-02-22...', dstIp: '111.124.200.38:465', ca: '是', location: '贵州遵义中国电信' },
  { name: 'MySSL Server 8.3.36 Auto_U...', date: '2025-03-09 02:01:44 - 2026-05-08...', dstIp: '186.111.239.39:23356', ca: '否', location: '北京教育网清华大学' },
  { name: 'est.zipsec.com.cn/emailAddress...', date: '2019-10-17 13:53:08 - 2025-10-14...', dstIp: '101.6.3.229:8090', ca: '否', location: '北京教育网清华大学' },
  { name: '*.mail.weixin.com', date: '2025-04-14 11:50:19 - 2026-10-29...', dstIp: '218.6.3.229:1443', ca: '否', location: '-' },
  { name: '*.sina.com.cn', date: '2026-01-09 13:40:41 - 2027-02-10...', dstIp: '202.205.184.10:443', ca: '是', location: '北京教育网' },
  { name: 'mail.qq.com', date: '2026-04-14 08:00:00 - 2026-10-30...', dstIp: '34.45.156.138:443', ca: '是', location: '-' },
]

// Pagination state for history overview
const historyExpiringPage = ref(1); const historyExpiringPageSize = ref(10)
const historyExpiredPage = ref(1); const historyExpiredPageSize = ref(10)
const historyTempPage = ref(1); const historyTempPageSize = ref(10)
const historyNormalPage = ref(1); const historyNormalPageSize = ref(10)

// History sessions mock data (17001 total)
const hsTotalCount = 17001
const historySessions: HistorySession[] = [
  {
    id: 1, time: '2026-07-10 10:13:51', mac: '54-2b-de-6d-6c-0e', vendor: 'NewH3CTec...',
    srcIp: '69.113.225.211:32960', dstIp: '101.6.15.130:443', location: '北京(教育网...',
    summaryLines: ['生效日期: 2026-01-14 22:15:42', '失效日期: 2026-07-13 22:15:41', '主题: /CN=tuna.tsinghua.edu.cn', '发行人: /C=US/O=Let\'s Encrypt/CN=R12', '备用名称: tuna.tsinghua.edu.cn'],
  },
  {
    id: 2, time: '2026-07-10 10:13:51', mac: '30-80-9b-8d-90-01', vendor: 'NewH3CTec...',
    srcIp: '101.6.15.22:63842', dstIp: '109.244.240.64:443', location: '天津腾讯...',
    summaryLines: ['生效日期: 2025-11-19 08:00:00', '失效日期: 2026-11-19 07:59:59', '主题: /CN=*.gameooup.com.cn', '发行人: /C=US/O=DigiCert Inc/OU=www.digicert.com/CN=Encryption Every...', '备用名称: *.gameooup.com.cn'],
  },
  {
    id: 3, time: '2026-07-10 10:13:51', mac: '54-2b-de-6d-6c-0e', vendor: 'NewH3CTec...',
    srcIp: '59.66.28.93:51146', dstIp: '101.6.9.234:8090', location: '北京(教育网...',
    summaryLines: ['生效日期: 2019-10-17 13:53:50', '失效日期: 2025-10-14 13:53:50', '主题: /CN=*.kpses.com', '发行人: /C=CN/ST=Beijing/L=Beijing/O=TopSec Co., Ltd./OU=CloudCN=est.kpses.com.cn/emailAddress=cloud_sdk_edr@kpses.com.cn', '备用名称: est.kpses.com.cn/mailAddress=cloud_sdk_edr@kpses.com.cn'],
  },
  {
    id: 4, time: '2026-07-10 10:13:51', mac: '54-2b-de-6d-6c-0e', vendor: 'NewH3CTec...',
    srcIp: '101.6.210.2:39119', dstIp: '101.6.9.234:8090', location: '北京(教育网...',
    summaryLines: ['生效日期: 2019-10-17 13:53:50', '失效日期: 2025-10-14 13:53:50', '主题: /CN=*.kpses.com', '发行人: /C=CN/ST=Beijing/L=Beijing/O=TopSec Co., Ltd./OU=CloudCN=est.kpses.com.cn/emailAddress=cloud_sdk_edr@kpses.com.cn', '备用名称: est.kpses.com.cn/mailAddress=cloud_sdk_edr@kpses.com.cn'],
  },
  {
    id: 5, time: '2026-07-10 10:13:51', mac: '54-2b-de-6d-6c-0e', vendor: 'NewH3CTec...',
    srcIp: '101.6.210.2:39111', dstIp: '101.6.9.234:8090', location: '北京(教育网...',
    summaryLines: ['生效日期: 2019-10-17 13:53:50', '失效日期: 2025-10-14 13:53:50', '主题: /CN=*.kpses.com', '发行人: /C=CN/ST=Beijing/L=Beijing/O=TopSec Co., Ltd./OU=CloudCN=est.kpses.com.cn/emailAddress=cloud_sdk_edr@kpses.com.cn', '备用名称: est.kpses.com.cn/mailAddress=cloud_sdk_edr@kpses.com.cn'],
  },
  {
    id: 6, time: '2026-07-10 10:13:51', mac: '54-2b-de-6d-6c-0e', vendor: 'NewH3CTec...',
    srcIp: '101.6.210.2:39085', dstIp: '101.6.9.234:8090', location: '北京(教育网...',
    summaryLines: ['生效日期: 2019-10-17 13:53:50', '失效日期: 2025-10-14 13:53:50', '主题: /CN=*.kpses.com', '发行人: /C=CN/ST=Beijing/L=Beijing/O=TopSec Co., Ltd./OU=CloudCN=est.kpses.com.cn/emailAddress=cloud_sdk_edr@kpses.com.cn', '备用名称: est.kpses.com.cn/mailAddress=cloud_sdk_edr@kpses.com.cn'],
  },
  {
    id: 7, time: '2026-07-10 10:13:51', mac: '54-2b-de-6d-6c-0e', vendor: 'NewH3CTec...',
    srcIp: '101.6.210.2:39094', dstIp: '101.6.9.234:8090', location: '北京(教育网...',
    summaryLines: ['生效日期: 2019-10-17 13:53:50', '失效日期: 2025-10-14 13:53:50', '主题: /CN=*.kpses.com', '发行人: /C=CN/ST=Beijing/L=Beijing/O=TopSec Co., Ltd./OU=CloudCN=est.kpses.com.cn/emailAddress=cloud_sdk_edr@kpses.com.cn', '备用名称: est.kpses.com.cn/mailAddress=cloud_sdk_edr@kpses.com.cn'],
  },
  {
    id: 8, time: '2026-07-10 10:13:51', mac: '54-2b-de-6d-6c-0e', vendor: 'NewH3CTec...',
    srcIp: '101.6.210.2:39091', dstIp: '101.6.9.234:8090', location: '北京(教育网...',
    summaryLines: ['生效日期: 2019-10-17 13:53:50', '失效日期: 2025-10-14 13:53:50', '主题: /CN=*.kpses.com', '发行人: /C=CN/ST=Beijing/L=Beijing/O=TopSec Co., Ltd./OU=CloudCN=est.kpses.com.cn/emailAddress=cloud_sdk_edr@kpses.com.cn', '备用名称: est.kpses.com.cn/mailAddress=cloud_sdk_edr@kpses.com.cn'],
  },
]

// Pagination state
const pendingPage = ref(1); const pendingPageSize = ref(10)
const expiredPage = ref(1); const expiredPageSize = ref(10)
const revokedPage = ref(1); const revokedPageSize = ref(10)
const normalPage = ref(1); const normalPageSize = ref(10)
const hsPage = ref(1); const hsPageSize = ref(20)
const hsSrcIp = ref(''); const hsDstIp = ref('')

// Cert history modal
const certHistoryVisible = ref(false)
const certHistoryTitle = ref('实时概况 -> 历史会话')
const chPage = ref(1); const chPageSize = ref(20)
const chSrcIp = ref(''); const chDstIp = ref(''); const chAltName = ref('')

function openCertHistory(cert: CertItem) {
  certHistoryTitle.value = '实时概况 -> 历史会话'
  chAltName.value = cert.name
  certHistoryVisible.value = true
}

function openHistoryCertHistory(cert: CertItem) {
  certHistoryTitle.value = '历史概况 -> 历史会话'
  chAltName.value = cert.name
  certHistoryVisible.value = true
}

// Cert detail modal
const certDetailVisible = ref(false)
const certDetailTab = ref<'raw' | 'detail'>('raw')
const certDetailRaw = ref('')
const certDetailRows = ref<{ key: string; val: string }[]>([])

function openCertDetailModal(item: HistorySession) {
  certDetailTab.value = 'raw'
  certDetailRaw.value = `-----BEGIN CERTIFICATE-----
MIIFYDCCBEigAwIBAgISA6R3kEl3P1y2cZ8sZ9...
...（证书原始PEM内容）...
-----END CERTIFICATE-----

Subject: /CN=tuna.tsinghua.edu.cn
Issuer: /C=US/O=Let's Encrypt/CN=R12
Valid From: 2026-01-14 22:15:42
Valid To: 2026-07-13 22:15:41
Serial Number: 04:A1:F3:94:49:77:3F:5C:B6:71:9F:2C:67:D8...
Signature Algorithm: sha256WithRSAEncryption
Public Key Algorithm: rsaEncryption (2048 bit)
X509v3 Subject Alternative Name: DNS:tuna.tsinghua.edu.cn
X509v3 Basic Constraints: CA:FALSE
X509v3 Key Usage: Digital Signature, Key Encipherment
X509v3 Extended Key Usage: TLS Web Server Authentication, TLS Web Client Authentication`

  certDetailRows.value = [
    { key: '主题 (Subject)', val: '/CN=tuna.tsinghua.edu.cn' },
    { key: '发行人 (Issuer)', val: '/C=US/O=Let\'s Encrypt/CN=R12' },
    { key: '有效期起', val: '2026-01-14 22:15:42' },
    { key: '有效期止', val: '2026-07-13 22:15:41' },
    { key: '序列号', val: '04:A1:F3:94:49:77:3F:5C:B6:71:9F:2C:67:D8' },
    { key: '签名算法', val: 'sha256WithRSAEncryption' },
    { key: '公钥算法', val: 'rsaEncryption (2048 bit)' },
    { key: '备用名称', val: 'tuna.tsinghua.edu.cn' },
    { key: '基本约束', val: 'CA:FALSE' },
    { key: '密钥用法', val: 'Digital Signature, Key Encipherment' },
    { key: '扩展密钥用法', val: 'TLS Web Server Authentication, TLS Web Client Authentication' },
    { key: '指纹 (SHA256)', val: 'A1:B2:C3:D4:E5:F6:07:18:29:3A:4B:5C:6D:7E:8F:90:A1:B2:C3:D4' },
    { key: '指纹 (SHA1)', val: '12:34:56:78:9A:BC:DE:F0:12:34:56:78:9A:BC:DE:F0:12:34:56:78' },
  ]
  certDetailVisible.value = true
}

// Packet analysis modal
const packetVisible = ref(false)
const packetTab = ref<'parse' | 'interact' | 'meta'>('parse')

interface PacketParseItem { time: string; src: string; dst: string; proto: string; len: number; info: string }
interface PacketInteractItem { time: string; src: string; dst: string; proto: string; info: string }

const packetParseData = ref<PacketParseItem[]>([
  { time: '10:13:51.123456', src: '69.113.225.211', dst: '101.6.15.130', proto: 'TCP', len: 74, info: '32960 → 443 [SYN] Seq=0 Win=64240 Len=0 MSS=1460' },
  { time: '10:13:51.234567', src: '101.6.15.130', dst: '69.113.225.211', proto: 'TCP', len: 74, info: '443 → 32960 [SYN, ACK] Seq=0 Ack=1 Win=65535 Len=0 MSS=1460' },
  { time: '10:13:51.345678', src: '69.113.225.211', dst: '101.6.15.130', proto: 'TCP', len: 66, info: '32960 → 443 [ACK] Seq=1 Ack=1 Win=64240 Len=0' },
  { time: '10:13:51.456789', src: '69.113.225.211', dst: '101.6.15.130', proto: 'TLSv1.3', len: 583, info: 'Client Hello (SNI=tuna.tsinghua.edu.cn)' },
  { time: '10:13:51.567890', src: '101.6.15.130', dst: '69.113.225.211', proto: 'TLSv1.3', len: 1420, info: 'Server Hello, Certificate, Server Key Exchange, Server Hello Done' },
  { time: '10:13:51.678901', src: '69.113.225.211', dst: '101.6.15.130', proto: 'TLSv1.3', len: 329, info: 'Client Key Exchange, Change Cipher Spec, Finished' },
  { time: '10:13:51.789012', src: '101.6.15.130', dst: '69.113.225.211', proto: 'TLSv1.3', len: 118, info: 'New Session Ticket, Change Cipher Spec, Finished' },
  { time: '10:13:52.123456', src: '69.113.225.211', dst: '101.6.15.130', proto: 'HTTP/3', len: 256, info: 'GET /index.html HTTP/3' },
])

const packetInteractData = ref<PacketInteractItem[]>([
  { time: '10:13:51.123456', src: '69.113.225.211', dst: '101.6.15.130', proto: 'TCP', info: 'SYN → (三次握手开始)' },
  { time: '10:13:51.234567', src: '101.6.15.130', dst: '69.113.225.211', proto: 'TCP', info: 'SYN-ACK ← (服务器响应)' },
  { time: '10:13:51.345678', src: '69.113.225.211', dst: '101.6.15.130', proto: 'TCP', info: 'ACK → (握手完成)' },
  { time: '10:13:51.456789', src: '69.113.225.211', dst: '101.6.15.130', proto: 'TLSv1.3', info: 'Client Hello → (TLS握手开始)' },
  { time: '10:13:51.567890', src: '101.6.15.130', dst: '69.113.225.211', proto: 'TLSv1.3', info: 'Server Hello + Certificate ← (服务器证书下发)' },
  { time: '10:13:51.678901', src: '69.113.225.211', dst: '101.6.15.130', proto: 'TLSv1.3', info: 'Client Key Exchange + Finished → (客户端密钥交换)' },
  { time: '10:13:51.789012', src: '101.6.15.130', dst: '69.113.225.211', proto: 'TLSv1.3', info: 'New Session Ticket + Finished ← (TLS握手完成)' },
  { time: '10:13:52.123456', src: '69.113.225.211', dst: '101.6.15.130', proto: 'HTTP/3', info: 'GET /index.html → (应用层请求)' },
])

const packetMetaData = ref<{ key: string; val: string }[]>([
  { key: '抓包时间', val: '2026-07-10 10:13:51' },
  { key: '抓包时长', val: '1.005678 秒' },
  { key: '总报文数', val: '8' },
  { key: '总字节数', val: '2870' },
  { key: '源MAC', val: '54-2b-de-6d-6c-0e' },
  { key: '目的MAC', val: '00-1a-2b-3c-4d-5e' },
  { key: '源IP', val: '69.113.225.211' },
  { key: '目的IP', val: '101.6.15.130' },
  { key: '源端口', val: '32960' },
  { key: '目的端口', val: '443' },
  { key: '协议', val: 'TLSv1.3 / HTTP/3' },
  { key: 'TLS版本', val: 'TLS 1.3' },
  { key: '加密套件', val: 'TLS_AES_256_GCM_SHA384' },
  { key: '服务器名称 (SNI)', val: 'tuna.tsinghua.edu.cn' },
])

function openPacketModal(item: HistorySession) {
  packetTab.value = 'parse'
  packetVisible.value = true
}

// Cert alerts
interface CertAlertItem { id: number; domain: string; issueDate: string; endDate: string; period: string; usagePct: string; remainDays: string; type: string; threshold: string; name: string }

const certAlerts = ref<CertAlertItem[]>([
  { id: 1, domain: 'tuna.tsinghua.edu.cn', issueDate: '2026-01-14', endDate: '2026-07-13', period: '180天', usagePct: '95%', remainDays: '3', type: 'DV', threshold: '30', name: '清华镜像' },
  { id: 2, domain: '*.baidu.com', issueDate: '2025-08-05', endDate: '2026-08-05', period: '365天', usagePct: '80%', remainDays: '26', type: 'OV', threshold: '60', name: '百度' },
  { id: 3, domain: '*.jd.com', issueDate: '2025-08-18', endDate: '2026-08-18', period: '365天', usagePct: '78%', remainDays: '39', type: 'OV', threshold: '30', name: '京东' },
  { id: 4, domain: '*.qq.com', issueDate: '2025-08-18', endDate: '2026-08-18', period: '365天', usagePct: '78%', remainDays: '39', type: 'OV', threshold: '30', name: '腾讯QQ' },
  { id: 5, domain: 'mail.qq.com', issueDate: '2026-04-14', endDate: '2026-10-30', period: '199天', usagePct: '45%', remainDays: '112', type: 'DV', threshold: '30', name: 'QQ邮箱' },
  { id: 6, domain: '*.sina.com.cn', issueDate: '2026-01-09', endDate: '2027-02-10', period: '397天', usagePct: '20%', remainDays: '214', type: 'OV', threshold: '60', name: '新浪' },
  { id: 7, domain: 'v.qq.com', issueDate: '2025-12-11', endDate: '2026-12-11', period: '365天', usagePct: '58%', remainDays: '154', type: 'OV', threshold: '30', name: '腾讯视频' },
  { id: 8, domain: '*.google-analytics.com', issueDate: '2025-05-12', endDate: '2026-05-12', period: '365天', usagePct: '98%', remainDays: '-59', type: 'DV', threshold: '30', name: 'Google分析' },
])

const caaPage = ref(1); const caaPageSize = ref(100)
const caaSelected = ref<number[]>([])
const caaSelectAll = ref(false)

function toggleSelectAll() {
  if (caaSelectAll.value) {
    caaSelected.value = certAlerts.value.map(i => i.id)
  } else {
    caaSelected.value = []
  }
}
function toggleSelectOne(id: number) {
  const idx = caaSelected.value.indexOf(id)
  if (idx >= 0) caaSelected.value.splice(idx, 1)
  else caaSelected.value.push(id)
  caaSelectAll.value = caaSelected.value.length === certAlerts.value.length
}
function deleteOneAlert(id: number) {
  const idx = certAlerts.value.findIndex(i => i.id === id)
  if (idx >= 0) certAlerts.value.splice(idx, 1)
}
function deleteSelectedAlerts() {
  if (caaSelected.value.length === 0) return
  certAlerts.value = certAlerts.value.filter(i => !caaSelected.value.includes(i.id))
  caaSelected.value = []
  caaSelectAll.value = false
}

// Alert notify modal
const alertNotifyVisible = ref(false)
const alertNotifyTab = ref('微信')
const alertNotifyTabs = ['微信', '企业微信', '钉钉', '飞书', '邮箱', 'SaaS', 'Syslog', '消息测试']
const wechatEnabled = ref(false)

function openAlertNotifyModal() {
  alertNotifyTab.value = '微信'
  alertNotifyVisible.value = true
}

// Alert period modal
const alertPeriodVisible = ref(false)
const alertPeriodTTL = ref('0')

function openAlertPeriodModal() {
  alertPeriodTTL.value = '0'
  alertPeriodVisible.value = true
}

// Add/Edit cert modal
const addCertVisible = ref(false)
const addCertIsEdit = ref(false)
const addCertForm = ref({ domain: '', name: '', threshold: '', issueDate: '', endDate: '' })

function openAddCertModal() {
  addCertIsEdit.value = false
  addCertForm.value = { domain: '', name: '', threshold: '', issueDate: '', endDate: '' }
  addCertVisible.value = true
}
function openEditCertModal(item: CertAlertItem) {
  addCertIsEdit.value = true
  addCertForm.value = { domain: item.domain, name: item.name, threshold: item.threshold, issueDate: item.issueDate, endDate: item.endDate }
  addCertVisible.value = true
}

// Helpers
function totalPages(total: number, pageSize: number) { return Math.max(1, Math.ceil(total / pageSize)) }
function paginatedData<T>(data: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize
  return data.slice(start, start + pageSize)
}
function getPageList(current: number, total: number) {
  const pages: number[] = []
  const maxShow = 7
  if (total <= maxShow) { for (let i = 1; i <= total; i++) pages.push(i) }
  else {
    pages.push(1)
    let start = Math.max(2, current - 2)
    let end = Math.min(total - 1, current + 2)
    if (current <= 3) { start = 2; end = 5 }
    if (current >= total - 2) { start = total - 4; end = total - 1 }
    for (let i = start; i <= end; i++) pages.push(i)
    pages.push(total)
  }
  return pages
}
</script>

<style scoped>
/* Layout */
.nv-border-card { display:flex; flex-direction:column; height:100%; min-height:0; border:1px solid #e4e7ed; border-radius:4px; background:#fff; overflow:hidden; }
.nv-tabs-header { flex-shrink:0; padding:0 16px; border-bottom:1px solid #e4e7ed; background:#fafafa; }
.nv-tabs-nav { display:flex; gap:0; }
.nv-tab { position:relative; padding:12px 20px; border:none; background:transparent; font-size:14px; font-weight:600; color:#606266; cursor:pointer; white-space:nowrap; }
.nv-tab.active { color:#409eff; }
.nv-tab.active::after { content:''; position:absolute; bottom:0; left:20px; right:20px; height:2px; background:#409eff; border-radius:1px 1px 0 0; }
.nv-tabs-body { flex:1; min-height:0; display:flex; flex-direction:column; overflow:hidden; }

/* Panel visibility */
.ca-panel { flex:1; min-height:0; display:none; flex-direction:column; }
.ca-panel.active { display:flex; }

/* Common table/footer */
.ou-table-wrap { flex:1; min-height:0; overflow:auto; }
.ou-table { width:100%; border-collapse:collapse; font-size:13px; }
.ou-table th { background:#fafbfc; border-bottom:1px solid #ebeef5; padding:8px 10px; text-align:left; font-weight:600; color:#606266; white-space:nowrap; font-size:12px; }
.ou-table td { border-bottom:1px solid #f0f2f5; padding:8px 10px; color:#303133; }
.ou-empty { text-align:center; color:#909399; padding:32px 10px !important; }
.col-idx { width:48px; text-align:center; }
.col-check { width:40px; text-align:center; }
.ou-footer { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:8px 14px; border-top:1px solid #ebeef5; font-size:12px; color:#606266; flex-shrink:0; }
.ou-footer-td { flex-shrink:0; }
.ou-footer-left { display:flex; align-items:center; gap:10px; }
.ou-footer-right { display:flex; align-items:center; flex-wrap:wrap; gap:8px 12px; }
.ou-pager { display:inline-flex; align-items:center; gap:4px; }
.ou-page-btn { min-width:28px; height:28px; padding:0 6px; border:1px solid #dcdfe6; border-radius:3px; background:#fff; color:#303133; font-size:12px; cursor:pointer; }
.ou-page-btn.active { background:#409eff; color:#fff; border-color:#409eff; }
.ou-page-btn:disabled { opacity:.5; cursor:not-allowed; }
.ou-page-goto { display:inline-flex; align-items:center; gap:4px; font-size:12px; color:#606266; }
.ou-page-goto-input { width:36px; height:24px; text-align:center; border:1px solid #dcdfe6; border-radius:3px; font-size:12px; }
.ou-page-goto-btn { height:24px; padding:0 8px; border:1px solid #dcdfe6; border-radius:3px; background:#fff; font-size:12px; cursor:pointer; }
.ou-page-goto-btn:disabled { opacity:.5; cursor:not-allowed; }
.ou-page-size select { height:24px; border:1px solid #dcdfe6; border-radius:3px; font-size:12px; padding:0 4px; }
.link-btn { padding:0; border:none; background:none; color:#409eff; cursor:pointer; font-size:13px; font-weight:500; }
.link-btn:disabled { opacity:.55; cursor:not-allowed; }

/* Toolbar / filters common */
.ou-toolbar { display:flex; flex-wrap:wrap; align-items:center; gap:8px 12px; padding:10px 15px; border-bottom:1px solid #ebeef5; }
.ou-toolbar-label { font-size:13px; color:#606266; white-space:nowrap; }
.ou-toolbar-input { height:30px; padding:0 8px; border:1px solid #dcdfe6; border-radius:4px; font-size:13px; color:#303133; }
.ou-toolbar-select { height:30px; padding:0 6px; border:1px solid #dcdfe6; border-radius:4px; font-size:13px; color:#303133; background:#fff; }
.ou-search-btn { height:30px; padding:0 14px; border:1px solid #409eff; border-radius:4px; background:#409eff; color:#fff; font-size:13px; font-weight:500; cursor:pointer; }
.ou-search-btn:disabled { opacity:.55; cursor:not-allowed; }
.secondary { height:30px; padding:0 14px; border:1px solid #dcdfe6; border-radius:4px; background:#fff; color:#606266; font-size:13px; cursor:pointer; }
.secondary:disabled { opacity:.55; cursor:not-allowed; }
.tdh-filters { padding:10px 15px; background:#fff; border-bottom:1px solid #ebeef5; }
.tdh-filter-row { display:flex; flex-wrap:wrap; align-items:center; gap:8px 12px; margin-bottom:6px; }
.tdh-filter-row:last-child { margin-bottom:0; }
.tdh-filter-row-actions { margin-top:2px; }
.tdh-filter-field { display:inline-flex; align-items:center; gap:6px; }
.tdh-filter-input { width:140px; }
.tdh-filter-time { flex:1; min-width:200px; }
.tdh-time-range { width:100%; min-width:260px; }
.td-reset-btn { height:30px; padding:0 14px; border:1px solid #dcdfe6; border-radius:4px; background:#fff; color:#606266; font-size:13px; cursor:pointer; }
.td-reset-btn:disabled { opacity:.55; cursor:not-allowed; }

/* CAR - 实时概况 / 历史概况 */
.car-page { flex:1; min-height:0; overflow:auto; padding:12px; display:flex; flex-direction:column; gap:12px; }
.car-top-row { display:grid; grid-template-columns:1fr min(340px,34%); gap:12px; align-items:stretch; }
.car-stats-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px; }
.car-stat-card { display:flex; align-items:center; gap:8px; padding:10px 12px; background:#fff; border:1px solid #e4e7ed; border-radius:4px; box-shadow:0 1px 4px rgba(0,0,0,0.04); }
.car-stat-icon { flex-shrink:0; width:34px; height:34px; border-radius:6px; display:flex; align-items:center; justify-content:center; }
.car-stat-icon svg { width:18px; height:18px; display:block; }
.car-stat-icon--expiring { color:#e6a23c; background:linear-gradient(145deg,#fdf6ec 0%,#faecd8 100%); }
.car-stat-icon--expired { color:#909399; background:linear-gradient(145deg,#f4f4f5 0%,#e9e9eb 100%); }
.car-stat-icon--normal { color:#67c23a; background:linear-gradient(145deg,#f0f9eb 0%,#e1f3d8 100%); }
.car-stat-icon--temp { color:#f56c6c; background:linear-gradient(145deg,#fef0f0 0%,#fde2e2 100%); }
.car-stat-icon--self { color:#e6a23c; background:linear-gradient(145deg,#fdf6ec 0%,#faecd8 100%); }
.car-stat-icon--ca { color:#67c23a; background:linear-gradient(145deg,#f0f9eb 0%,#e1f3d8 100%); }
.car-stat-body { flex:1; min-width:0; display:flex; flex-direction:column; gap:4px; }
.car-stat-val { font-size:18px; font-weight:700; color:#303133; font-variant-numeric:tabular-nums; line-height:1.2; }
.car-stat-label { font-size:11px; color:#909399; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.car-pie-panel { background:#fff; border:1px solid #e4e7ed; border-radius:4px; padding:10px 8px 4px; display:flex; flex-direction:column; min-height:0; overflow:visible; }
.car-pie-title { margin:0 0 2px 4px; font-size:14px; font-weight:600; color:#303133; }
.car-pie-chart { flex:1; min-height:220px; }
.car-table-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; min-width:0; }
.car-table-panel { background:#fff; border:1px solid #e4e7ed; border-radius:4px; display:flex; flex-direction:column; min-width:0; min-height:0; }
.car-table-head { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; border-bottom:1px solid #ebeef5; position:relative; }
.car-table-head::before { content:""; position:absolute; left:0; top:50%; transform:translateY(-50%); width:3px; height:16px; border-radius:2px; background:var(--car-accent,#e6a23c); }
.car-table-panel--expiring { --car-accent:#e6a23c; }
.car-table-panel--expired { --car-accent:#909399; }
.car-table-panel--temp { --car-accent:#f56c6c; }
.car-table-panel--normal { --car-accent:#67c23a; }
.car-table-title { margin:0; font-size:14px; font-weight:600; color:#303133; }
.car-table-menu { border:none; background:transparent; color:#909399; font-size:16px; line-height:1; padding:2px 4px; cursor:pointer; }
.car-table-wrap { max-height:320px; overflow:auto; }
.car-table .col-cert { min-width:72px; max-width:100px; }
.car-table .col-period { min-width:180px; white-space:nowrap; font-size:12px; }
.car-table .col-target-ip { min-width:120px; max-width:140px; }
.car-table .col-ca { width:64px; text-align:center; }
.car-table .col-geo { min-width:72px; }
.car-table-footer { flex-shrink:0; padding:8px 12px; border-top:1px solid #ebeef5; font-size:12px; }
.car-table-footer .ou-footer-right { flex-wrap:wrap; gap:8px 12px; }
.car-cert-link { color:#409eff; cursor:pointer; text-decoration:underline; }
.car-cert-link:hover { color:#66b1ff; }
.car-geo-tag { display:inline-block; padding:2px 6px; background:#fef0f0; color:#f56c6c; border-radius:2px; font-size:11px; }
.car-cert-summary-lines { font-size:11px; color:#606266; line-height:1.6; }
.car-action-link { color:#409eff; cursor:pointer; text-decoration:none; font-size:12px; }
.car-action-link:hover { color:#66b1ff; }

/* CAH - 历史概况 filters */
.cah-filters { flex-shrink:0; margin:-4px 0 4px; }

/* CAS - 历史会话 */
.cas-page { flex:1; min-height:0; display:flex; flex-direction:column; overflow:hidden; background:#fff; }
.cas-filters .cas-filter-actions { display:flex; flex-direction:column; gap:6px; margin-left:auto; align-self:flex-end; }
.cas-table-wrap { flex:1; min-height:0; }
.cas-table { min-width:1560px; table-layout:fixed; }
.cas-table .col-idx { width:52px; }
.cas-table .col-time { width:148px; white-space:nowrap; font-size:12px; }
.cas-table .col-mac { width:128px; font-family:ui-monospace,monospace; font-size:12px; }
.cas-table .col-mac-vendor { width:120px; }
.cas-table .col-endpoint { width:142px; font-size:12px; }
.cas-table .col-geo { width:200px; }
.cas-table .col-cert-summary { width:300px; vertical-align:top; }
.cas-table .col-actions { width:72px; vertical-align:top; }
.cas-footer .ou-footer-left { display:flex; align-items:center; gap:12px; }

/* CAA - 证书告警 */
.caa-page { flex:1; min-height:0; display:flex; flex-direction:column; overflow:hidden; background:#fff; }
.caa-toolbar { justify-content:flex-end; flex-shrink:0; }
.caa-toolbar-actions { display:flex; align-items:center; flex-wrap:wrap; justify-content:flex-end; gap:4px 18px; margin-left:auto; }
.caa-link-btn, .caa-action-btn { padding:0; border:none; background:none; font-size:13px; font-weight:500; color:#409eff; cursor:pointer; white-space:nowrap; }
.caa-link-btn:disabled, .caa-action-btn:disabled { opacity:.55; cursor:not-allowed; }
.caa-toolbar-sep { width:1px; height:14px; background:#dcdfe6; margin:0 2px; }
.caa-table-wrap { flex:1; min-height:0; }
.caa-table { min-width:1320px; table-layout:fixed; }
.caa-table .col-domain { width:140px; }
.caa-table .col-date { width:108px; white-space:nowrap; font-size:12px; }
.caa-table .col-period { width:88px; text-align:center; }
.caa-table .col-usage-pct { width:88px; text-align:center; }
.caa-table .col-remain { width:80px; text-align:center; }
.caa-table .col-type { width:88px; }
.caa-table .col-threshold { width:100px; }
.caa-table .col-name { width:120px; }
.caa-table .col-actions { width:88px; text-align:center; }

/* Responsive */
@media (max-width:1100px) {
  .car-top-row { grid-template-columns:1fr; }
  .car-table-row { grid-template-columns:1fr; }
  .car-stats-grid { grid-template-columns:repeat(2,1fr); }
}

/* AN - 告警通知弹窗 */
.an-page { display:flex; flex-direction:column; min-height:400px; }
.an-tabs { display:flex; gap:0; border-bottom:1px solid #e4e7ed; margin-bottom:16px; flex-wrap:wrap; }
.an-tab { padding:10px 16px; border:none; background:transparent; font-size:14px; font-weight:500; color:#606266; cursor:pointer; border-bottom:2px solid transparent; white-space:nowrap; }
.an-tab.active { color:#409eff; border-bottom-color:#409eff; }
.an-body { flex:1; overflow:auto; }
.an-panel { padding:0; }
.an-section { margin-bottom:20px; }
.an-section-title { margin:0 0 12px 0; font-size:15px; font-weight:600; color:#303133; padding-bottom:8px; border-bottom:1px solid #ebeef5; }
.an-notice-list { margin:0 0 12px 0; padding:0; list-style:none; }
.an-notice-item { margin:0 0 8px 0; font-size:13px; color:#606266; line-height:1.6; }
.an-notice-warn { margin:12px 0; padding:10px 12px; background:#fdf6ec; border:1px solid #faecd8; border-radius:4px; font-size:13px; color:#e6a23c; }
.an-link { color:#409eff; cursor:pointer; text-decoration:underline; }
.an-link:hover { color:#66b1ff; }
.an-form-row { display:flex; align-items:center; gap:12px; margin-bottom:12px; }
.an-form-label { width:120px; text-align:right; font-size:13px; color:#606266; flex-shrink:0; }
.an-input { flex:1; height:32px; padding:0 10px; border:1px solid #dcdfe6; border-radius:4px; font-size:13px; color:#303133; }
.an-select { height:32px; }
.an-switch-wrap { display:inline-flex; align-items:center; gap:8px; }
.an-switch { position:relative; width:44px; height:22px; border-radius:11px; background:#dcdfe6; border:none; cursor:pointer; padding:0; transition:background 0.3s; }
.an-switch.on { background:#409eff; }
.an-switch-dot { position:absolute; top:2px; left:2px; width:18px; height:18px; border-radius:50%; background:#fff; transition:left 0.3s; box-shadow:0 1px 3px rgba(0,0,0,0.2); }
.an-switch.on .an-switch-dot { left:24px; }
.an-switch-text { font-size:13px; color:#606266; }
.an-form-actions { margin-top:16px; }
.an-submit-btn { height:32px; padding:0 20px; border:1px solid #409eff; border-radius:4px; background:#409eff; color:#fff; font-size:13px; font-weight:500; cursor:pointer; }
.an-submit-btn:hover { background:#66b1ff; border-color:#66b1ff; }
.an-table-wrap { max-height:200px; overflow:auto; border:1px solid #ebeef5; border-radius:4px; }
.an-table { width:100%; border-collapse:collapse; font-size:13px; }
.an-table th { background:#fafbfc; border-bottom:1px solid #ebeef5; padding:8px 10px; text-align:left; font-weight:600; color:#606266; }
.an-table td { border-bottom:1px solid #f0f2f5; padding:8px 10px; color:#303133; }

/* AP - 告警周期弹窗 */
.ap-page { padding:20px 0; }
.ap-form-row { display:flex; align-items:center; gap:12px; margin-bottom:20px; padding:0 20px; }
.ap-form-label { width:100px; text-align:right; font-size:14px; color:#606266; flex-shrink:0; }
.ap-form-input { width:200px; height:32px; padding:0 10px; border:1px solid #dcdfe6; border-radius:4px; font-size:13px; color:#303133; }
.ap-form-hint { font-size:13px; color:#909399; }
.ap-actions { display:flex; justify-content:flex-end; gap:12px; padding:0 20px; margin-top:24px; }
.ap-btn { height:32px; padding:0 20px; border-radius:4px; font-size:13px; font-weight:500; cursor:pointer; border:1px solid #dcdfe6; }
.ap-btn-primary { background:#409eff; color:#fff; border-color:#409eff; }
.ap-btn-primary:hover { background:#66b1ff; border-color:#66b1ff; }
.ap-btn-default { background:#fff; color:#606266; }
.ap-btn-default:hover { color:#409eff; border-color:#409eff; }

/* AC - 添加/编辑证书弹窗 */
.ac-page { padding:20px 0; }
.ac-form-row { display:flex; align-items:center; gap:12px; margin-bottom:16px; padding:0 20px; }
.ac-form-label { width:100px; text-align:right; font-size:14px; color:#606266; flex-shrink:0; }
.ac-form-input { flex:1; max-width:320px; height:32px; padding:0 10px; border:1px solid #dcdfe6; border-radius:4px; font-size:13px; color:#303133; }
.ac-form-hint { font-size:13px; color:#909399; }
.ac-actions { display:flex; justify-content:flex-end; gap:12px; padding:0 20px; margin-top:24px; }
.ac-btn { height:32px; padding:0 20px; border-radius:4px; font-size:13px; font-weight:500; cursor:pointer; border:1px solid #dcdfe6; }
.ac-btn-primary { background:#409eff; color:#fff; border-color:#409eff; }
.ac-btn-primary:hover { background:#66b1ff; border-color:#66b1ff; }
.ac-btn-default { background:#fff; color:#606266; }
.ac-btn-default:hover { color:#409eff; border-color:#409eff; }

/* CD - 证书详情弹窗 */
.cd-page { display:flex; flex-direction:column; min-height:400px; }
.cd-tabs { display:flex; gap:0; border-bottom:1px solid #e4e7ed; margin-bottom:16px; }
.cd-tab { padding:10px 20px; border:none; background:transparent; font-size:14px; font-weight:500; color:#606266; cursor:pointer; border-bottom:2px solid transparent; }
.cd-tab.active { color:#409eff; border-bottom-color:#409eff; }
.cd-body { flex:1; overflow:auto; }
.cd-raw { padding:0; }
.cd-raw-pre { margin:0; padding:16px; background:#f5f7fa; border:1px solid #e4e7ed; border-radius:4px; font-family:ui-monospace,monospace; font-size:13px; line-height:1.6; color:#303133; white-space:pre-wrap; word-break:break-all; max-height:500px; overflow:auto; }
.cd-detail { padding:0; }
.cd-detail-table { width:100%; border-collapse:collapse; font-size:13px; }
.cd-detail-table th { width:180px; padding:10px 12px; text-align:left; background:#fafbfc; border:1px solid #ebeef5; font-weight:600; color:#606266; vertical-align:top; }
.cd-detail-table td { padding:10px 12px; border:1px solid #ebeef5; color:#303133; word-break:break-all; }

/* PA - 报文分析弹窗 */
.pa-page { display:flex; flex-direction:column; min-height:450px; }
.pa-tabs { display:flex; gap:0; border-bottom:1px solid #e4e7ed; margin-bottom:16px; }
.pa-tab { padding:10px 20px; border:none; background:transparent; font-size:14px; font-weight:500; color:#606266; cursor:pointer; border-bottom:2px solid transparent; }
.pa-tab.active { color:#409eff; border-bottom-color:#409eff; }
.pa-body { flex:1; overflow:auto; }
.pa-parse, .pa-interact { padding:0; }
.pa-table-wrap { max-height:400px; overflow:auto; }
.pa-table { width:100%; border-collapse:collapse; font-size:13px; }
.pa-table .col-idx { width:60px; text-align:center; }
.pa-table .col-time { width:140px; white-space:nowrap; font-family:ui-monospace,monospace; font-size:12px; }
.pa-table .col-src { width:140px; font-family:ui-monospace,monospace; font-size:12px; }
.pa-table .col-dst { width:140px; font-family:ui-monospace,monospace; font-size:12px; }
.pa-table .col-proto { width:80px; text-align:center; }
.pa-table .col-len { width:80px; text-align:right; }
.pa-table .col-info { min-width:300px; }
.pa-meta { padding:0; }
</style>
