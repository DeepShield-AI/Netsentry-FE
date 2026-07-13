<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav nv-tabs-nav-wrap" role="tablist" aria-label="日志管理">
        <button type="button" class="nv-tab" :class="{ active: tab === 'blacklist' }" role="tab" @click="tab = 'blacklist'">黑名单</button>
        <button type="button" class="nv-tab" :class="{ active: tab === 'whitelist' }" role="tab" @click="tab = 'whitelist'">白名单</button>
      </div>
    </div>
    <div class="nv-tabs-body">
      <div class="om-log-page">
        <!-- 黑名单 -->
        <div class="om-log-panel" :class="{ active: tab === 'blacklist' }" role="tabpanel">
          <div class="om-log-form-card">
            <form class="om-log-form" onsubmit="return false">
              <label class="om-form-row"><span class="om-form-label">黑名单功能</span><button type="button" class="ti-switch" disabled aria-pressed="false"><span class="ti-switch-core"><span class="ti-switch-inner">禁用</span><span class="ti-switch-action" aria-hidden="true"></span></span></button></label>
              <label class="om-form-row"><span class="om-form-label">日志类型</span><select class="ou-toolbar-select" disabled><option selected>全部</option></select></label>
              <label class="om-form-row"><span class="om-form-label">记录数上限</span><input class="ou-toolbar-input om-form-input-sm" type="text" value="10000" disabled /><span class="om-form-unit">条</span></label>
              <button type="button" class="primary" disabled title="暂未开放">确定</button>
            </form>
          </div>
          <div class="ou-toolbar om-log-toolbar"><input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled /><button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button><div class="om-log-toolbar-right"><button type="button" class="link-btn" disabled title="暂未开放">🗑 删除</button><button type="button" class="link-btn" disabled title="暂未开放">+ 添加</button><button type="button" class="link-btn" disabled title="暂未开放">☁ 导入</button><button type="button" class="link-btn" disabled title="暂未开放">☁ 导出</button></div></div>
          <div class="ou-table-wrap"><table class="ou-table"><thead><tr><th class="col-check"><input type="checkbox" disabled aria-label="全选" /></th><th class="col-idx">序号</th><th class="col-ip">IP/MAC地址</th><th class="col-type">类型</th><th class="col-remark">备注</th><th class="col-actions">操作</th></tr></thead><tbody><tr><td colspan="6" class="ou-empty">无数据</td></tr></tbody></table></div>
          <div class="ou-footer ou-footer-td om-footer"><div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn" disabled>›</button></div></div><div class="ou-footer-right"><span>共 0 条</span></div></div>
        </div>
        <!-- 白名单 -->
        <div class="om-log-panel" :class="{ active: tab === 'whitelist' }" role="tabpanel">
          <div class="om-log-form-card">
            <form class="om-log-form" onsubmit="return false">
              <label class="om-form-row"><span class="om-form-label">白名单功能</span><button type="button" class="ti-switch" disabled aria-pressed="false"><span class="ti-switch-core"><span class="ti-switch-inner">禁用</span><span class="ti-switch-action" aria-hidden="true"></span></span></button></label>
              <button type="button" class="primary" disabled title="暂未开放">确定</button>
            </form>
          </div>
          <div class="ou-toolbar om-log-toolbar"><input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled /><button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button><div class="om-log-toolbar-right"><button type="button" class="link-btn" disabled title="暂未开放">🗑 删除</button><button type="button" class="link-btn" disabled title="暂未开放">+ 添加</button><button type="button" class="link-btn" disabled title="暂未开放">☁ 导入</button><button type="button" class="link-btn" disabled title="暂未开放">☁ 导出</button></div></div>
          <div class="ou-table-wrap"><table class="ou-table"><thead><tr><th class="col-check"><input type="checkbox" disabled aria-label="全选" /></th><th class="col-idx">序号</th><th class="col-ip">IP/MAC地址</th><th class="col-type">类型</th><th class="col-remark">备注</th><th class="col-actions">操作</th></tr></thead><tbody><tr><td colspan="6" class="ou-empty">无数据</td></tr></tbody></table></div>
          <div class="ou-footer ou-footer-td om-footer"><div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn" disabled>›</button></div></div><div class="ou-footer-right"><span>共 0 条</span></div></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import '@/views/netvisor/nv-shared.css'
const tab = ref('blacklist')
</script>

<style scoped>
.om-log-page { display:flex; flex-direction:column; height:100%; }
.om-log-panel { display:none; flex-direction:column; flex:1; min-height:0; overflow-y:auto; }
.om-log-panel.active { display:flex; }
.om-log-form-card { padding:15px; border-bottom:1px solid #ebeef5; }
.om-log-form { display:flex; flex-direction:column; gap:10px; max-width:480px; }
.om-form-row { display:flex; align-items:center; gap:8px; font-size:13px; color:#606266; }
.om-form-label { min-width:100px; text-align:right; flex-shrink:0; }
.om-form-input-sm { width:80px; }
.om-form-unit { font-size:12px; color:#909399; }
.primary { height:30px; padding:0 16px; border:1px solid #409eff; border-radius:4px; background:#409eff; color:#fff; font-size:13px; cursor:pointer; align-self:flex-start; margin-left:108px; }
.primary:disabled { opacity:.55; cursor:not-allowed; }
.om-log-toolbar { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.om-log-toolbar-right { margin-left:auto; display:flex; gap:8px; }
.ti-switch { display:inline-flex; align-items:center; height:20px; border:none; background:none; cursor:pointer; padding:0; }
.ti-switch-core { display:inline-flex; align-items:center; position:relative; width:40px; height:20px; border-radius:10px; background:#dcdfe6; }
.ti-switch-inner { font-size:11px; color:#fff; padding:0 6px; white-space:nowrap; }
.ti-switch-action { position:absolute; left:2px; top:2px; width:16px; height:16px; border-radius:50%; background:#fff; }
.ti-switch:disabled { opacity:.55; cursor:not-allowed; }
</style>
