<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav nv-tabs-nav-wrap" role="tablist" aria-label="账号管理">
        <button type="button" class="nv-tab" :class="{ active: topTab === 'account' }" role="tab" @click="topTab = 'account'">账号管理</button>
        <button type="button" class="nv-tab" :class="{ active: topTab === 'user-group' }" role="tab" @click="topTab = 'user-group'">用户组</button>
      </div>
    </div>
    <div class="nv-tabs-body">
      <div class="om-account-page">
        <!-- 账号管理 top panel -->
        <div class="om-account-top-panel" :class="{ active: topTab === 'account' }" role="tabpanel">
          <div class="om-account-subpage">
            <div class="om-account-inner-tabs">
              <div class="nv-tabs-nav nv-tabs-nav-wrap" role="tablist" aria-label="账号管理">
                <button type="button" class="nv-tab" :class="{ active: innerTab === 'local' }" role="tab" @click="innerTab = 'local'">本地账号</button>
                <button type="button" class="nv-tab" :class="{ active: innerTab === 'proxy' }" role="tab" @click="innerTab = 'proxy'">代理账号</button>
                <button type="button" class="nv-tab" :class="{ active: innerTab === 'remark' }" role="tab" @click="innerTab = 'remark'">IP/MAC备注</button>
                <button type="button" class="nv-tab" :class="{ active: innerTab === 'online' }" role="tab" @click="innerTab = 'online'">在线用户</button>
              </div>
            </div>
            <div class="om-account-inner-panels">
              <!-- 本地账号 -->
              <div class="om-account-inner-panel" :class="{ active: innerTab === 'local' }" role="tabpanel">
                <div class="ou-toolbar om-account-toolbar"><div class="om-account-toolbar-left"><label class="tdh-filter-field"><span class="ou-toolbar-label">账号状态</span><select class="ou-toolbar-select" disabled><option selected>所有</option></select></label><label class="tdh-filter-field"><span class="ou-toolbar-label">账号期限</span><select class="ou-toolbar-select" disabled><option selected>所有</option></select></label><input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled /><button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button></div><div class="om-account-toolbar-right"><button type="button" class="link-btn" disabled title="暂未开放">⚙ 批量操作 ▾</button><button type="button" class="link-btn" disabled title="暂未开放">+ 添加</button><button type="button" class="link-btn" disabled title="暂未开放">☁ 导入</button><button type="button" class="link-btn" disabled title="暂未开放">☁ 导出</button><button type="button" class="link-btn" disabled title="暂未开放" aria-label="筛选">☰</button></div></div>
                <div class="ou-table-wrap"><table class="ou-table"><thead><tr><th class="col-check"><input type="checkbox" disabled aria-label="全选" /></th><th class="col-idx">序号</th><th class="col-group ou-th-sort">用户组</th><th class="col-account ou-th-sort">用户账号</th><th class="col-name">姓名</th><th class="col-mac ou-th-sort">绑定MAC</th><th class="col-ip ou-th-sort">绑定IP</th><th class="col-vlan ou-th-sort">绑定VLAN</th><th class="col-online-ip ou-th-sort">在线IP</th><th class="col-online-user ou-th-sort">在线用户</th><th class="col-date ou-th-sort">起始日期</th><th class="col-date ou-th-sort">截止日期</th><th class="col-date ou-th-sort">最后下线</th><th class="col-info">其他信息 <span class="om-th-info" title="其他信息">ⓘ</span></th><th class="col-actions">操作</th></tr></thead><tbody><tr><td colspan="15" class="ou-empty">无数据</td></tr></tbody></table></div>
                <div class="ou-footer ou-footer-td om-footer"><div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn" disabled>›</button></div></div><div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页 <button type="button" class="ou-page-goto-btn" disabled>确定</button></label><span>共 0 条</span><label class="ou-page-size"><select disabled><option selected>100 条/页</option></select></label></div></div>
              </div>
              <!-- 代理账号 -->
              <div class="om-account-inner-panel" :class="{ active: innerTab === 'proxy' }" role="tabpanel">
                <div class="ou-toolbar om-account-toolbar"><div class="om-account-toolbar-left"><label class="tdh-filter-field"><span class="ou-toolbar-label">账号状态</span><select class="ou-toolbar-select" disabled><option selected>所有</option></select></label><input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled /><button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button></div><div class="om-account-toolbar-right"><button type="button" class="link-btn" disabled title="暂未开放">⚙ 批量操作 ▾</button><button type="button" class="link-btn" disabled title="暂未开放">+ 添加</button><button type="button" class="link-btn" disabled title="暂未开放" aria-label="筛选">☰</button></div></div>
                <div class="ou-table-wrap"><table class="ou-table"><thead><tr><th class="col-check"><input type="checkbox" disabled aria-label="全选" /></th><th class="col-idx ou-th-sort">序号</th><th class="col-group ou-th-sort">用户组</th><th class="col-account ou-th-sort">用户账号</th><th class="col-mac ou-th-sort">在线MAC</th><th class="col-ip ou-th-sort">在线IP</th><th class="col-date ou-th-sort">开始日期</th><th class="col-date ou-th-sort">截止日期</th><th class="col-iface ou-th-sort">网络接口</th><th class="col-vlan ou-th-sort">外出VLAN</th><th class="col-date ou-th-sort">最后下线</th><th class="col-info">其他信息 <span class="om-th-info" title="其他信息">ⓘ</span></th><th class="col-actions">操作</th></tr></thead><tbody><tr><td colspan="13" class="ou-empty">无数据</td></tr></tbody></table></div>
                <div class="ou-footer ou-footer-td om-footer"><div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn" disabled>›</button></div></div><div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页 <button type="button" class="ou-page-goto-btn" disabled>确定</button></label><span>共 0 条</span><label class="ou-page-size"><select disabled><option selected>100 条/页</option></select></label></div></div>
              </div>
              <!-- IP/MAC备注 -->
              <div class="om-account-inner-panel" :class="{ active: innerTab === 'remark' }" role="tabpanel">
                <div class="ou-table-wrap"><table class="ou-table"><thead><tr><th class="col-check"><input type="checkbox" disabled aria-label="全选" /></th><th class="col-idx">序号</th><th class="col-object">备注对象</th><th class="col-group">用户组</th><th class="col-remark">备注</th><th class="col-actions">操作</th></tr></thead><tbody><tr><td colspan="6" class="ou-empty">无数据</td></tr></tbody></table></div>
                <div class="ou-footer ou-footer-td om-footer"><div class="ou-footer-right"><span>共 0 条</span></div></div>
              </div>
              <!-- 在线用户 -->
              <div class="om-account-inner-panel" :class="{ active: innerTab === 'online' }" role="tabpanel">
                <div class="ou-table-wrap"><table class="ou-table"><thead><tr><th class="col-idx">序号</th><th class="col-account">用户账号</th><th class="col-ip">在线IP</th><th class="col-mac">在线MAC</th><th class="col-time">上线时间</th><th class="col-actions">操作</th></tr></thead><tbody><tr><td colspan="6" class="ou-empty">无数据</td></tr></tbody></table></div>
                <div class="ou-footer ou-footer-td om-footer"><div class="ou-footer-right"><span>共 0 条</span></div></div>
              </div>
            </div>
          </div>
        </div>
        <!-- 用户组 top panel -->
        <div class="om-account-top-panel" :class="{ active: topTab === 'user-group' }" role="tabpanel">
          <div class="ou-toolbar om-account-toolbar"><input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled /><button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button><div class="om-account-toolbar-right"><button type="button" class="link-btn" disabled title="暂未开放">🗑 清空</button><button type="button" class="link-btn" disabled title="暂未开放">+ 添加用户组</button></div></div>
          <div class="ou-table-wrap"><table class="ou-table"><thead><tr><th class="col-name">名称</th><th class="col-ipv4">IPV4地址</th><th class="col-ipv6">IPV6地址</th><th class="col-rate ou-th-sort">上行速率</th><th class="col-rate ou-th-sort">下行速率</th><th class="col-dns">DNS</th><th class="col-count ou-th-sort">用户账号#</th><th class="col-count ou-th-sort">可分配IP#</th><th class="col-time">在线时间</th><th class="col-expired">过期用户</th><th class="col-iface">代拨接口</th><th class="col-vlan">代拨VLAN</th><th class="col-actions">操作</th></tr></thead><tbody><tr><td colspan="13" class="ou-empty">暂无数据</td></tr></tbody></table></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import '@/views/netvisor/nv-shared.css'
const topTab = ref('account')
const innerTab = ref('local')
</script>

<style scoped>
.om-account-page { display:flex; flex-direction:column; height:100%; }
.om-account-top-panel { display:none; flex-direction:column; flex:1; min-height:0; }
.om-account-top-panel.active { display:flex; }
.om-account-subpage { display:flex; flex-direction:column; flex:1; min-height:0; }
.om-account-inner-tabs { border-bottom:1px solid #ebeef5; padding:0 16px; background:#f5f7fa; }
.om-account-inner-panels { display:flex; flex-direction:column; flex:1; min-height:0; }
.om-account-inner-panel { display:none; flex-direction:column; flex:1; min-height:0; }
.om-account-inner-panel.active { display:flex; }
.om-account-toolbar { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; }
.om-account-toolbar-left, .om-account-toolbar-right { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.om-th-info { color:#909399; cursor:help; }
</style>
