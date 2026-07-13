<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav nv-tabs-nav-wrap" role="tablist" aria-label="虚拟链路">
        <button type="button" class="nv-tab" :class="{ active: tab === 'ip-group' }" role="tab" @click="tab = 'ip-group'">IP群组链路 <span class="da-new-badge">NEW</span></button>
        <button type="button" class="nv-tab" :class="{ active: tab === 'virtual-link' }" role="tab" @click="tab = 'virtual-link'">虚拟链路</button>
      </div>
    </div>
    <div class="nv-tabs-body">
      <div class="da-vl-page">
        <!-- 虚拟链路 panel -->
        <div class="da-vl-panel" :class="{ active: tab === 'virtual-link' }" role="tabpanel">
          <div class="ou-toolbar da-vl-toolbar">
            <div class="da-vl-toolbar-left">
              <label class="tdh-filter-field dba-refresh-field"><span class="ou-toolbar-label">自动刷新</span><select class="ou-toolbar-select" disabled><option value="10000" selected>10 秒</option><option value="30000">30 秒</option></select></label>
              <button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button>
            </div>
            <div class="da-vl-toolbar-right">
              <button type="button" class="link-btn da-vl-action-btn" disabled title="暂未开放">🗑 删除</button>
              <button type="button" class="link-btn da-vl-action-btn" disabled title="暂未开放">+ 添加</button>
            </div>
          </div>
          <div class="ou-table-wrap da-vl-table-wrap"><table class="ou-table da-vl-table"><thead><tr><th class="col-check"><input type="checkbox" disabled aria-label="全选" /></th><th class="col-idx">序号</th><th class="col-name">链路名称</th><th class="col-iface">流入接口</th><th class="col-ip">内网地址</th><th class="col-ip">外网地址</th><th class="col-rate ou-th-sort">上行速率(bps)</th><th class="col-rate ou-th-sort">下行速率(bps)</th><th class="col-actions">操作</th></tr></thead><tbody><tr><td colspan="9" class="ou-empty">无数据</td></tr></tbody></table></div>
          <div class="ou-footer ou-footer-td da-vl-footer"><div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled aria-label="上一页">‹</button><button type="button" class="ou-page-btn" disabled aria-label="下一页">›</button></div></div></div>
        </div>
        <!-- IP群组链路 panel -->
        <div class="da-vl-panel" :class="{ active: tab === 'ip-group' }" role="tabpanel">
          <div class="ou-toolbar da-vl-toolbar">
            <div class="da-vl-toolbar-left">
              <label class="tdh-filter-field dba-refresh-field"><span class="ou-toolbar-label">自动刷新</span><select class="ou-toolbar-select" disabled><option value="10000" selected>10 秒</option><option value="30000">30 秒</option></select></label>
              <input class="ou-toolbar-input da-vl-search-input" type="search" placeholder="关键字搜索" disabled /><button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button>
            </div>
            <div class="da-vl-toolbar-right">
              <button type="button" class="link-btn da-vl-action-btn" disabled title="暂未开放">🗑 删除</button>
              <button type="button" class="link-btn da-vl-action-btn" disabled title="暂未开放">+ 添加</button>
            </div>
          </div>
          <div class="ou-table-wrap da-vl-table-wrap"><table class="ou-table da-vl-table da-vl-ipgroup-table"><thead><tr><th class="col-check"><input type="checkbox" disabled aria-label="全选" /></th><th class="col-idx">序号</th><th class="col-name">链路名称</th><th class="col-group">IP群组</th><th class="col-iface">网卡</th><th class="col-rate ou-th-sort">流入bps</th><th class="col-rate ou-th-sort">流出bps</th><th class="col-traffic ou-th-sort">流入总流量</th><th class="col-traffic ou-th-sort">流出总流量</th><th class="col-actions">操作</th></tr></thead><tbody><tr><td colspan="10" class="ou-empty">无数据</td></tr></tbody></table></div>
          <div class="ou-footer ou-footer-td da-vl-footer"><div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled aria-label="上一页">‹</button><button type="button" class="ou-page-btn" disabled aria-label="下一页">›</button></div></div></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import '@/views/netvisor/nv-shared.css'
const tab = ref('virtual-link')
</script>

<style scoped>
.da-new-badge { display:inline-block; padding:1px 5px; border-radius:3px; background:#f56c6c; color:#fff; font-size:10px; font-weight:700; margin-left:4px; vertical-align:middle; line-height:1.4; }
.da-vl-page { display:flex; flex-direction:column; height:100%; }
.da-vl-panel { display:none; flex-direction:column; flex:1; min-height:0; }
.da-vl-panel.active { display:flex; }
.da-vl-toolbar { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; padding:10px 15px; border-bottom:1px solid #ebeef5; }
.da-vl-toolbar-left, .da-vl-toolbar-right { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.da-vl-search-input { width:180px; }
</style>
