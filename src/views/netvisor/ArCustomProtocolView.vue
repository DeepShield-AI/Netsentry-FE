<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav nv-tabs-nav-wrap" role="tablist" aria-label="自定义协议">
        <button type="button" class="nv-tab" :class="{ active: tab === 'ip-proto' }" role="tab" @click="tab = 'ip-proto'">IP协议</button>
        <button type="button" class="nv-tab" :class="{ active: tab === 'port-proto' }" role="tab" @click="tab = 'port-proto'">端口协议</button>
        <button type="button" class="nv-tab" :class="{ active: tab === 'feature-proto' }" role="tab" @click="tab = 'feature-proto'">特征协议</button>
      </div>
    </div>
    <div class="nv-tabs-body">
      <div class="ar-cp-page">
        <!-- IP协议 -->
        <div class="ar-cp-panel" :class="{ active: tab === 'ip-proto' }" role="tabpanel">
          <div class="ou-toolbar ar-cp-toolbar"><div class="ar-cp-toolbar-left"><input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled /><button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button></div><div class="ar-cp-toolbar-right"><button type="button" class="link-btn" disabled title="暂未开放">🗑 删除</button><button type="button" class="link-btn" disabled title="暂未开放">+ 添加</button><button type="button" class="link-btn" disabled title="暂未开放">☁ 导入</button><button type="button" class="link-btn" disabled title="暂未开放">☁ 导出</button></div></div>
          <div class="ou-table-wrap"><table class="ou-table"><thead><tr><th class="col-check"><input type="checkbox" disabled aria-label="全选" /></th><th class="col-idx">序号</th><th class="col-name ou-th-sort">协议名称</th><th class="col-ip ou-th-sort">起始IP</th><th class="col-ip ou-th-sort">结束IP</th><th class="col-level ou-th-sort">等级</th><th class="col-remark">备注</th><th class="col-actions">操作</th></tr></thead><tbody><tr><td colspan="8" class="ou-empty">无数据</td></tr></tbody></table></div>
          <div class="ou-footer ou-footer-td"><div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn" disabled>›</button></div></div><div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页 <button type="button" class="ou-page-goto-btn" disabled>确定</button></label><span>共 0 条</span><label class="ou-page-size"><select disabled><option selected>100 条/页</option></select></label></div></div>
        </div>
        <!-- 端口协议 -->
        <div class="ar-cp-panel" :class="{ active: tab === 'port-proto' }" role="tabpanel">
          <div class="ou-toolbar ar-cp-toolbar"><div class="ar-cp-toolbar-left"><input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled /><button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button></div><div class="ar-cp-toolbar-right"><button type="button" class="link-btn" disabled title="暂未开放">🗑 删除</button><button type="button" class="link-btn" disabled title="暂未开放">+ 添加</button><button type="button" class="link-btn" disabled title="暂未开放">☁ 导入</button><button type="button" class="link-btn" disabled title="暂未开放">☁ 导出</button></div></div>
          <div class="ou-table-wrap"><table class="ou-table"><thead><tr><th class="col-check"><input type="checkbox" disabled aria-label="全选" /></th><th class="col-idx">序号</th><th class="col-name ou-th-sort">协议名称</th><th class="col-transport ou-th-sort">传输协议</th><th class="col-port ou-th-sort">起始端口</th><th class="col-port ou-th-sort">结束端口</th><th class="col-level ou-th-sort">等级</th><th class="col-remark">备注</th><th class="col-actions">操作</th></tr></thead><tbody><tr><td colspan="9" class="ou-empty">无数据</td></tr></tbody></table></div>
          <div class="ou-footer ou-footer-td"><div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn" disabled>›</button></div></div><div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页 <button type="button" class="ou-page-goto-btn" disabled>确定</button></label><span>共 0 条</span><label class="ou-page-size"><select disabled><option selected>100 条/页</option></select></label></div></div>
        </div>
        <!-- 特征协议 -->
        <div class="ar-cp-panel" :class="{ active: tab === 'feature-proto' }" role="tabpanel">
          <div class="ou-toolbar ar-cp-toolbar"><div class="ar-cp-toolbar-left"><input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled /><button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button></div><div class="ar-cp-toolbar-right"><button type="button" class="link-btn" disabled title="暂未开放">🗑 删除</button><button type="button" class="link-btn" disabled title="暂未开放">+ 添加</button><button type="button" class="link-btn" disabled title="暂未开放">☁ 导入</button><button type="button" class="link-btn" disabled title="暂未开放">☁ 导出</button></div></div>
          <div class="ou-table-wrap"><table class="ou-table"><thead><tr><th class="col-check"><input type="checkbox" disabled aria-label="全选" /></th><th class="col-idx">序号</th><th class="col-name ou-th-sort">协议名称</th><th class="col-transport ou-th-sort">传输协议</th><th class="col-port ou-th-sort">端口</th><th class="col-feature">特征</th><th class="col-level ou-th-sort">等级</th><th class="col-remark">备注</th><th class="col-actions">操作</th></tr></thead><tbody><tr><td colspan="9" class="ou-empty">无数据</td></tr></tbody></table></div>
          <div class="ou-footer ou-footer-td"><div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn" disabled>›</button></div></div><div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页 <button type="button" class="ou-page-goto-btn" disabled>确定</button></label><span>共 0 条</span><label class="ou-page-size"><select disabled><option selected>100 条/页</option></select></label></div></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import '@/views/netvisor/nv-shared.css'
const tab = ref('ip-proto')
</script>

<style scoped>
.ar-cp-page { display:flex; flex-direction:column; height:100%; }
.ar-cp-panel { display:none; flex-direction:column; flex:1; min-height:0; }
.ar-cp-panel.active { display:flex; }
.ar-cp-toolbar { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; }
.ar-cp-toolbar-left, .ar-cp-toolbar-right { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
</style>
