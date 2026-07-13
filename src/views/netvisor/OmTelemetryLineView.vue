<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header om-oml-tabs-header">
      <div class="nv-tabs-nav nv-tabs-nav-wrap" role="tablist" aria-label="遥测线路">
        <button type="button" class="nv-tab" :class="{ active: tab === 'telemetry-line' }" role="tab" @click="tab = 'telemetry-line'">遥测线路</button>
        <button type="button" class="nv-tab" :class="{ active: tab === 'line-log' }" role="tab" @click="tab = 'line-log'">线路日志</button>
      </div>
      <div v-if="tab === 'telemetry-line'" class="om-oml-head-stats"><span>总流入：<strong>0</strong></span><span>总流出：<strong>0</strong></span><span>连接数：<strong>0</strong></span></div>
    </div>
    <div class="nv-tabs-body">
      <div class="om-oml-page">
        <!-- 遥测线路 -->
        <div class="om-oml-panel" :class="{ active: tab === 'telemetry-line' }" role="tabpanel">
          <div class="ou-toolbar om-oml-toolbar">
            <div class="om-oml-toolbar-left">
              <label class="tdh-filter-field dba-refresh-field"><span class="ou-toolbar-label">自动刷新</span><select class="ou-toolbar-select" disabled><option selected>10 秒</option></select></label>
              <label class="tdh-filter-field"><select class="ou-toolbar-select" disabled><option selected>所有类型</option></select></label>
              <label class="tdh-filter-field"><select class="ou-toolbar-select" disabled><option selected>所有状态</option></select></label>
              <label class="tdh-filter-field"><select class="ou-toolbar-select" disabled><option selected>所有组</option></select></label>
              <input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled /><button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button>
            </div>
            <div class="om-oml-toolbar-right">
              <button type="button" class="link-btn" disabled title="暂未开放">⚙ 批量操作 ▾</button>
              <button type="button" class="link-btn" disabled title="暂未开放">+ 添加</button>
              <button type="button" class="link-btn" disabled title="暂未开放">☁ 导入</button>
              <button type="button" class="link-btn" disabled title="暂未开放">☁ 导出</button>
              <button type="button" class="link-btn" disabled title="暂未开放" aria-label="筛选">☰</button>
            </div>
          </div>
          <div class="ou-table-wrap om-oml-table-wrap"><table class="ou-table om-oml-table"><thead><tr><th class="col-check"><input type="checkbox" disabled aria-label="全选" /></th><th class="col-id ou-th-sort">ID</th><th class="col-name ou-th-sort">名称</th><th class="col-iface ou-th-sort">网卡</th><th class="col-status ou-th-sort">状态</th><th class="col-ip">IP</th><th class="col-gw">线路网关</th><th class="col-mtu">MTU</th><th class="col-vlan">VLAN</th><th class="col-dns ou-th-sort">DNS牵引/失败</th><th class="col-rate ou-th-sort">流入速率</th><th class="col-rate ou-th-sort">流出速率</th><th class="col-conn ou-th-sort">连接数</th><th class="col-time ou-th-sort">连接时间</th><th class="col-info">其他信息</th><th class="col-actions">操作</th></tr></thead><tbody><tr><td colspan="16" class="ou-empty">无数据</td></tr></tbody></table></div>
          <div class="ou-footer ou-footer-td om-footer"><div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled aria-label="上一页">‹</button><button type="button" class="ou-page-btn" disabled aria-label="下一页">›</button></div></div><div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页 <button type="button" class="ou-page-goto-btn" disabled>确定</button></label><span>共 0 条</span><label class="ou-page-size"><select disabled><option selected>100 条/页</option></select></label></div></div>
        </div>
        <!-- 线路日志 -->
        <div class="om-oml-panel" :class="{ active: tab === 'line-log' }" role="tabpanel">
          <div class="ou-toolbar om-oml-toolbar">
            <input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled /><button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button>
            <div class="om-oml-toolbar-right"><button type="button" class="link-btn" disabled title="暂未开放">☁ 导出</button></div>
          </div>
          <div class="ou-table-wrap om-oml-table-wrap"><table class="ou-table om-oml-log-table"><thead><tr><th class="col-idx">序号</th><th class="col-time">时间</th><th class="col-line">线路</th><th class="col-content">内容</th></tr></thead><tbody><tr><td colspan="4" class="ou-empty">无数据</td></tr></tbody></table></div>
          <div class="ou-footer ou-footer-td om-footer"><div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled aria-label="上一页">‹</button><button type="button" class="ou-page-btn" disabled aria-label="下一页">›</button></div></div><div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页 <button type="button" class="ou-page-goto-btn" disabled>确定</button></label><span>共 0 条</span><label class="ou-page-size"><select disabled><option selected>100 条/页</option></select></label></div></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import '@/views/netvisor/nv-shared.css'
const tab = ref('telemetry-line')
</script>

<style scoped>
.om-oml-tabs-header { display:flex; align-items:center; justify-content:space-between; }
.om-oml-head-stats { display:flex; gap:16px; padding-right:16px; font-size:13px; color:#606266; }
.om-oml-page { display:flex; flex-direction:column; height:100%; }
.om-oml-panel { display:none; flex-direction:column; flex:1; min-height:0; }
.om-oml-panel.active { display:flex; }
.om-oml-toolbar { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; }
.om-oml-toolbar-left, .om-oml-toolbar-right { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
</style>
