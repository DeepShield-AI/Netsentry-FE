<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav nv-tabs-nav-wrap" role="tablist" aria-label="遥测服务">
        <button type="button" class="nv-tab" :class="{ active: tab === 'service-list' }" role="tab" @click="tab = 'service-list'">服务列表</button>
        <button type="button" class="nv-tab" :class="{ active: tab === 'service-map' }" role="tab" @click="tab = 'service-map'">服务映射</button>
        <button type="button" class="nv-tab" :class="{ active: tab === 'online-users' }" role="tab" @click="tab = 'online-users'">在线用户</button>
        <button type="button" class="nv-tab" :class="{ active: tab === 'service-log' }" role="tab" @click="tab = 'service-log'">服务日志</button>
      </div>
    </div>
    <div class="nv-tabs-body">
      <div class="om-oms-page">
        <!-- 服务列表 -->
        <div class="om-oms-panel" :class="{ active: tab === 'service-list' }" role="tabpanel">
          <div class="ou-toolbar om-oms-toolbar"><div class="om-oms-toolbar-left"><label class="tdh-filter-field dba-refresh-field"><span class="ou-toolbar-label">自动刷新</span><select class="ou-toolbar-select" disabled><option selected>10 秒</option></select></label><input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled /><button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button></div><div class="om-oms-toolbar-right"><button type="button" class="link-btn" disabled title="暂未开放">⏸ 禁用</button><button type="button" class="link-btn" disabled title="暂未开放">▶ 启用</button><button type="button" class="link-btn" disabled title="暂未开放">删除</button><button type="button" class="link-btn" disabled title="暂未开放">+ 添加</button><button type="button" class="link-btn" disabled title="暂未开放" aria-label="筛选">☰</button></div></div>
          <div class="ou-table-wrap"><table class="ou-table"><thead><tr><th class="col-check"><input type="checkbox" disabled aria-label="全选" /></th><th class="col-idx">序号</th><th class="col-name">名称</th><th class="col-gw">服务网关</th><th class="col-dns">DNS</th><th class="col-mtu">MTU</th><th class="col-group">用户组</th><th class="col-auth">认证方式</th><th class="col-radius">RADIUS</th><th class="col-online">在线用户</th><th class="col-rate">流入速率</th><th class="col-rate">流出速率</th><th class="col-lines">可访问线路</th><th class="col-actions">操作</th></tr></thead><tbody><tr><td colspan="14" class="ou-empty">无数据</td></tr></tbody></table></div>
          <div class="ou-footer ou-footer-td om-footer"><div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn" disabled>›</button></div></div><div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页 <button type="button" class="ou-page-goto-btn" disabled>确定</button></label><span>共 0 条</span><label class="ou-page-size"><select disabled><option selected>100 条/页</option></select></label></div></div>
        </div>
        <!-- 服务映射 -->
        <div class="om-oms-panel" :class="{ active: tab === 'service-map' }" role="tabpanel">
          <div class="om-oms-map-card"><div class="ou-table-wrap"><table class="ou-table om-oms-map-table"><thead><tr><th class="col-line">映射线路</th><th class="col-port">映射端口</th><th class="col-svc">iWAN服务</th><th class="col-count">访问次数</th><th class="col-actions">操作</th></tr></thead><tbody><tr><td><select class="ou-toolbar-select" disabled><option selected>请选择</option></select></td><td><input class="ou-toolbar-input" type="text" value="8000" disabled /></td><td><select class="ou-toolbar-select" disabled><option selected>请选择</option></select></td><td>—</td><td class="col-actions"><button type="button" class="link-btn" disabled title="暂未开放">添加</button></td></tr></tbody></table></div></div>
        </div>
        <!-- 在线用户 -->
        <div class="om-oms-panel" :class="{ active: tab === 'online-users' }" role="tabpanel">
          <div class="ou-toolbar om-oms-toolbar"><div class="om-oms-toolbar-left"><label class="tdh-filter-field dba-refresh-field"><span class="ou-toolbar-label">自动刷新</span><select class="ou-toolbar-select" disabled><option selected>10 秒</option></select></label><label class="tdh-filter-field"><span class="ou-toolbar-label">iWAN服务</span><select class="ou-toolbar-select" disabled><option selected>所有服务</option></select></label><input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled /><button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button></div><div class="om-oms-toolbar-right"><button type="button" class="link-btn" disabled title="暂未开放">⏻ 强制下线</button><button type="button" class="link-btn" disabled title="暂未开放" aria-label="筛选">☰</button></div></div>
          <div class="ou-table-wrap"><table class="ou-table"><thead><tr><th class="col-check"><input type="checkbox" disabled aria-label="全选" /></th><th class="col-idx">序号</th><th class="col-svc">iWAN服务</th><th class="col-account">账号</th><th class="col-ip">IP</th><th class="col-status">状态</th><th class="col-mtu">MTU</th><th class="col-gw">网关地址</th><th class="col-conn-info">连接信息</th><th class="col-conn ou-th-sort">连接数</th><th class="col-rate ou-th-sort">上行速率</th><th class="col-rate ou-th-sort">下行速率</th><th class="col-latency ou-th-sort">时延 <span class="om-th-info" title="时延">ⓘ</span></th><th class="col-duration ou-th-sort">在线时长</th><th class="col-adv">高级信息</th><th class="col-actions">操作</th></tr></thead><tbody><tr><td colspan="16" class="ou-empty">数据加载中</td></tr></tbody></table></div>
          <div class="ou-footer ou-footer-td om-footer"><div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn" disabled>›</button></div></div><div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页 <button type="button" class="ou-page-goto-btn" disabled>确定</button></label><span>共 0 条</span><label class="ou-page-size"><select disabled><option selected>100 条/页</option></select></label></div></div>
        </div>
        <!-- 服务日志 -->
        <div class="om-oms-panel" :class="{ active: tab === 'service-log' }" role="tabpanel">
          <div class="ou-toolbar om-oms-toolbar"><input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled /><button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button></div>
          <div class="ou-table-wrap"><table class="ou-table"><thead><tr><th class="col-idx">序号</th><th class="col-time">时间</th><th class="col-account">账号</th><th class="col-content">内容</th></tr></thead><tbody><tr><td colspan="4" class="ou-empty">无数据</td></tr></tbody></table></div>
          <div class="ou-footer ou-footer-td om-footer"><div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn" disabled>›</button></div></div><div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页 <button type="button" class="ou-page-goto-btn" disabled>确定</button></label><span>共 0 条</span><label class="ou-page-size"><select disabled><option selected>100 条/页</option></select></label></div></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import '@/views/netvisor/nv-shared.css'
const tab = ref('service-list')
</script>

<style scoped>
.om-oms-page { display:flex; flex-direction:column; height:100%; }
.om-oms-panel { display:none; flex-direction:column; flex:1; min-height:0; }
.om-oms-panel.active { display:flex; }
.om-oms-toolbar { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; }
.om-oms-toolbar-left, .om-oms-toolbar-right { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.om-oms-map-card { padding:15px; }
.om-th-info { color:#909399; cursor:help; }
</style>
