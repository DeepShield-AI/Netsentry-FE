<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav nv-tabs-nav-wrap" role="tablist" aria-label="IP/MAC备注">
        <button type="button" class="nv-tab" :class="{ active: tab === 'ip-mac' }" role="tab" @click="tab = 'ip-mac'">IP/MAC备注</button>
        <button type="button" class="nv-tab" :class="{ active: tab === 'ip-range' }" role="tab" @click="tab = 'ip-range'">IP段备注</button>
      </div>
    </div>
    <div class="nv-tabs-body">
      <div class="om-remark-page">
        <!-- IP/MAC备注 -->
        <div class="om-remark-panel" :class="{ active: tab === 'ip-mac' }" role="tabpanel">
          <div class="ou-toolbar om-remark-toolbar"><div class="om-remark-toolbar-left"><input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled /><button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button></div><div class="om-remark-toolbar-right"><button type="button" class="link-btn" disabled title="暂未开放">🗑 删除</button><button type="button" class="link-btn" disabled title="暂未开放">+ 添加</button><button type="button" class="link-btn" disabled title="暂未开放">☁ 导入</button><button type="button" class="link-btn" disabled title="暂未开放">☁ 导出</button></div></div>
          <div class="ou-table-wrap"><table class="ou-table"><thead><tr><th class="col-check"><input type="checkbox" disabled aria-label="全选" /></th><th class="col-idx">序号</th><th class="col-object ou-th-sort">备注对象</th><th class="col-group">用户组</th><th class="col-remark">备注</th><th class="col-actions">操作</th></tr></thead><tbody><tr><td colspan="6" class="ou-empty">无数据</td></tr></tbody></table></div>
          <div class="ou-footer ou-footer-td om-footer"><div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn" disabled>›</button></div></div><div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页 <button type="button" class="ou-page-goto-btn" disabled>确定</button></label><span>共 0 条</span><label class="ou-page-size"><select disabled><option selected>100 条/页</option></select></label></div></div>
        </div>
        <!-- IP段备注 -->
        <div class="om-remark-panel" :class="{ active: tab === 'ip-range' }" role="tabpanel">
          <div class="ou-toolbar om-remark-toolbar"><div class="om-remark-toolbar-left"><input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled /><button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button></div><div class="om-remark-toolbar-right"><button type="button" class="link-btn" disabled title="暂未开放">🗑 删除</button><button type="button" class="link-btn" disabled title="暂未开放">+ 添加</button><button type="button" class="link-btn" disabled title="暂未开放">☁ 导入</button><button type="button" class="link-btn" disabled title="暂未开放">☁ 导出</button></div></div>
          <div class="ou-table-wrap"><table class="ou-table"><thead><tr><th class="col-check"><input type="checkbox" disabled aria-label="全选" /></th><th class="col-idx">序号</th><th class="col-ip ou-th-sort">起始IP</th><th class="col-ip ou-th-sort">结束IP</th><th class="col-remark">备注</th><th class="col-actions">操作</th></tr></thead><tbody><tr><td colspan="6" class="ou-empty">无数据</td></tr></tbody></table></div>
          <div class="ou-footer ou-footer-td om-footer"><div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn" disabled>›</button></div></div><div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页 <button type="button" class="ou-page-goto-btn" disabled>确定</button></label><span>共 0 条</span><label class="ou-page-size"><select disabled><option selected>100 条/页</option></select></label></div></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import '@/views/netvisor/nv-shared.css'
const tab = ref('ip-mac')
</script>

<style scoped>
.om-remark-page { display:flex; flex-direction:column; height:100%; }
.om-remark-panel { display:none; flex-direction:column; flex:1; min-height:0; }
.om-remark-panel.active { display:flex; }
.om-remark-toolbar { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; }
.om-remark-toolbar-left, .om-remark-toolbar-right { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
</style>
