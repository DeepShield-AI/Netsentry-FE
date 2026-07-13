<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav nv-tabs-nav-wrap" role="tablist" aria-label="应用协议">
        <button type="button" class="nv-tab" :class="{ active: tab === 'protocol' }" role="tab" @click="tab = 'protocol'">应用协议</button>
        <button type="button" class="nv-tab" :class="{ active: tab === 'url-class' }" role="tab" @click="tab = 'url-class'">URL分类</button>
      </div>
    </div>
    <div class="nv-tabs-body">
      <div class="ar-ap-page">
        <!-- 应用协议 -->
        <div class="ar-ap-panel" :class="{ active: tab === 'protocol' }" role="tabpanel">
          <div class="ar-ap-split">
            <aside class="ar-ap-sidebar" aria-label="协议分类树">
              <div class="ar-ap-tree-head"><span class="ar-ap-tree-title">协议分类</span></div>
              <ul class="ar-ap-tree-list">
                <li v-for="c in categories" :key="c.key" class="ar-ap-tree-item" :class="{ active: activeCat === c.key }" @click="activeCat = c.key">
                  <span class="ar-ap-tree-icon">{{ activeCat === c.key ? '▾' : '▸' }}</span><span class="ar-ap-tree-label">{{ c.label }}</span><span class="ar-ap-tree-count">({{ c.count }})</span>
                </li>
              </ul>
            </aside>
            <div class="ar-ap-main">
              <div class="ou-toolbar ar-ap-toolbar"><div class="ar-ap-toolbar-left"><label class="tdh-filter-field"><span class="ou-toolbar-label">状态</span><select class="ou-toolbar-select" disabled><option selected>所有</option></select></label><input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled /><button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button></div><div class="ar-ap-toolbar-right"><button type="button" class="link-btn" disabled title="暂未开放" aria-label="筛选">☰</button></div></div>
              <div class="ou-table-wrap ar-ap-table-wrap"><table class="ou-table ar-ap-table"><thead><tr><th class="col-check"><input type="checkbox" disabled aria-label="全选" /></th><th class="col-idx">序号</th><th class="col-name ou-th-sort">协议名称</th><th class="col-cat ou-th-sort">分类</th><th class="col-level ou-th-sort">等级</th><th class="col-status ou-th-sort">状态</th><th class="col-actions">操作</th></tr></thead><tbody><tr><td colspan="7" class="ou-empty">无数据</td></tr></tbody></table></div>
              <div class="ou-footer ou-footer-td"><div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn" disabled>›</button></div></div><div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页 <button type="button" class="ou-page-goto-btn" disabled>确定</button></label><span>共 0 条</span><label class="ou-page-size"><select disabled><option selected>100 条/页</option></select></label></div></div>
            </div>
          </div>
        </div>
        <!-- URL分类 -->
        <div class="ar-ap-panel" :class="{ active: tab === 'url-class' }" role="tabpanel">
          <div class="ou-toolbar ar-ap-toolbar"><input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled /><button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button></div>
          <div class="ou-table-wrap ar-ap-table-wrap"><table class="ou-table ar-ap-table"><thead><tr><th class="col-idx">序号</th><th class="col-name ou-th-sort">分类名称</th><th class="col-count ou-th-sort">URL数</th><th class="col-actions">操作</th></tr></thead><tbody><tr><td colspan="4" class="ou-empty">无数据</td></tr></tbody></table></div>
          <div class="ou-footer ou-footer-td"><div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn" disabled>›</button></div></div><div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页 <button type="button" class="ou-page-goto-btn" disabled>确定</button></label><span>共 0 条</span><label class="ou-page-size"><select disabled><option selected>100 条/页</option></select></label></div></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import '@/views/netvisor/nv-shared.css'
const tab = ref('protocol')
const activeCat = ref('all')
const categories = [
  { key: 'all', label: '全部', count: 0 },
  { key: 'im', label: '即时通讯', count: 0 },
  { key: 'streaming', label: '流媒体', count: 0 },
  { key: 'p2p', label: 'P2P', count: 0 },
  { key: 'game', label: '游戏', count: 0 },
  { key: 'email', label: '邮件', count: 0 },
  { key: 'web', label: 'Web应用', count: 0 },
  { key: 'cloud', label: '云服务', count: 0 },
  { key: 'network', label: '网络协议', count: 0 },
  { key: 'vpn', label: 'VPN/代理', count: 0 },
  { key: 'finance', label: '金融', count: 0 },
  { key: 'other', label: '其他', count: 0 },
]
</script>

<style scoped>
.ar-ap-page { display:flex; flex-direction:column; height:100%; }
.ar-ap-panel { display:none; flex-direction:column; flex:1; min-height:0; }
.ar-ap-panel.active { display:flex; }
.ar-ap-split { display:flex; flex:1; min-height:0; }
.ar-ap-sidebar { width:180px; min-width:160px; border-right:1px solid #ebeef5; background:#fafbfc; display:flex; flex-direction:column; }
.ar-ap-tree-head { padding:10px 14px; border-bottom:1px solid #ebeef5; font-weight:600; font-size:13px; color:#303133; }
.ar-ap-tree-list { list-style:none; margin:0; padding:0; overflow-y:auto; flex:1; }
.ar-ap-tree-item { display:flex; align-items:center; gap:4px; padding:7px 14px; cursor:pointer; font-size:13px; color:#606266; border-bottom:1px solid #f5f7fa; }
.ar-ap-tree-item:hover { background:#ecf5ff; }
.ar-ap-tree-item.active { background:#ecf5ff; color:#409eff; font-weight:600; }
.ar-ap-tree-icon { font-size:10px; width:12px; }
.ar-ap-tree-count { font-size:11px; color:#909399; margin-left:auto; }
.ar-ap-main { flex:1; min-width:0; display:flex; flex-direction:column; }
.ar-ap-toolbar { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; }
.ar-ap-toolbar-left, .ar-ap-toolbar-right { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
</style>
