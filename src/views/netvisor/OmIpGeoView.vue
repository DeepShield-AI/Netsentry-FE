<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav nv-tabs-nav-wrap" role="tablist" aria-label="IP地理位置">
        <button type="button" class="nv-tab" :class="{ active: tab === 'system' }" role="tab" @click="tab = 'system'">系统库</button>
        <button type="button" class="nv-tab" :class="{ active: tab === 'custom' }" role="tab" @click="tab = 'custom'">自定义</button>
      </div>
    </div>
    <div class="nv-tabs-body">
      <div class="om-geo-page">
        <!-- 系统库 -->
        <div class="om-geo-panel" :class="{ active: tab === 'system' }" role="tabpanel">
          <div class="om-geo-sys-card">
            <div class="om-geo-sys-row"><span class="om-geo-sys-label">当前版本</span><span class="om-geo-sys-val">—</span></div>
            <div class="om-geo-sys-row"><span class="om-geo-sys-label">更新时间</span><span class="om-geo-sys-val">—</span></div>
            <div class="om-geo-sys-actions">
              <button type="button" class="primary" disabled title="暂未开放">☁ 上传新版本</button>
              <button type="button" class="secondary" disabled title="暂未开放">恢复默认库</button>
            </div>
          </div>
        </div>
        <!-- 自定义 -->
        <div class="om-geo-panel" :class="{ active: tab === 'custom' }" role="tabpanel">
          <div class="ou-toolbar om-geo-toolbar"><input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled /><button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button><div class="om-geo-toolbar-right"><button type="button" class="link-btn" disabled title="暂未开放">🗑 删除</button><button type="button" class="link-btn" disabled title="暂未开放">+ 添加</button><button type="button" class="link-btn" disabled title="暂未开放">☁ 导入</button><button type="button" class="link-btn" disabled title="暂未开放">☁ 导出</button></div></div>
          <div class="ou-table-wrap"><table class="ou-table"><thead><tr><th class="col-check"><input type="checkbox" disabled aria-label="全选" /></th><th class="col-idx">序号</th><th class="col-ip">起始IP</th><th class="col-ip">结束IP</th><th class="col-country">国家</th><th class="col-province">省份</th><th class="col-city">城市</th><th class="col-isp">运营商</th><th class="col-actions">操作</th></tr></thead><tbody><tr><td colspan="9" class="ou-empty">无数据</td></tr></tbody></table></div>
          <div class="ou-footer ou-footer-td om-footer"><div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn" disabled>›</button></div></div><div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页 <button type="button" class="ou-page-goto-btn" disabled>确定</button></label><span>共 0 条</span><label class="ou-page-size"><select disabled><option selected>100 条/页</option></select></label></div></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import '@/views/netvisor/nv-shared.css'
const tab = ref('system')
</script>

<style scoped>
.om-geo-page { display:flex; flex-direction:column; height:100%; }
.om-geo-panel { display:none; flex-direction:column; flex:1; min-height:0; }
.om-geo-panel.active { display:flex; }
.om-geo-sys-card { padding:20px; max-width:480px; }
.om-geo-sys-row { display:flex; align-items:center; gap:8px; margin-bottom:10px; font-size:13px; }
.om-geo-sys-label { min-width:80px; color:#606266; }
.om-geo-sys-val { color:#303133; font-weight:500; }
.om-geo-sys-actions { display:flex; gap:8px; margin-top:16px; }
.primary { height:30px; padding:0 16px; border:1px solid #409eff; border-radius:4px; background:#409eff; color:#fff; font-size:13px; cursor:pointer; }
.primary:disabled { opacity:.55; cursor:not-allowed; }
.secondary { height:30px; padding:0 14px; border:1px solid #dcdfe6; border-radius:4px; background:#fff; color:#606266; font-size:13px; cursor:pointer; }
.secondary:disabled { opacity:.55; cursor:not-allowed; }
.om-geo-toolbar { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.om-geo-toolbar-right { margin-left:auto; display:flex; gap:8px; }
</style>
