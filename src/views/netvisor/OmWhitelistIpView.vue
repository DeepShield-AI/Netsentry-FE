<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav nv-tabs-nav-wrap" role="tablist" aria-label="白名单IP">
        <button type="button" class="nv-tab" :class="{ active: tab === 'params' }" role="tab" @click="tab = 'params'">参数设置</button>
        <button type="button" class="nv-tab" :class="{ active: tab === 'overview' }" role="tab" @click="tab = 'overview'">概览</button>
        <button type="button" class="nv-tab" :class="{ active: tab === 'illegal' }" role="tab" @click="tab = 'illegal'">非法连接</button>
      </div>
    </div>
    <div class="nv-tabs-body">
      <div class="om-omw-page">
        <!-- 参数设置 -->
        <div class="om-omw-panel" :class="{ active: tab === 'params' }" role="tabpanel">
          <div class="om-omw-params-card">
            <form class="om-omw-params-form" onsubmit="return false">
              <label class="om-form-row"><span class="om-form-label">白名单功能</span><button type="button" class="ti-switch" disabled aria-pressed="false"><span class="ti-switch-core"><span class="ti-switch-inner">禁用</span><span class="ti-switch-action" aria-hidden="true"></span></span></button></label>
              <label class="om-form-row"><span class="om-form-label">白名单模式</span><select class="ou-toolbar-select" disabled><option selected>禁止非白名单IP通信</option></select></label>
              <label class="om-form-row"><span class="om-form-label">自动添加</span><button type="button" class="ti-switch" disabled aria-pressed="false"><span class="ti-switch-core"><span class="ti-switch-inner">禁用</span><span class="ti-switch-action" aria-hidden="true"></span></span></button></label>
              <label class="om-form-row"><span class="om-form-label">子网掩码</span><select class="ou-toolbar-select" disabled><option selected>32 (单个地址)</option></select></label>
              <button type="button" class="primary" disabled title="暂未开放">确定</button>
            </form>
            <div class="om-omw-ip-manage">
              <h3 class="om-section-title">IP列表管理</h3>
              <div class="ou-toolbar om-omw-ip-toolbar"><input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled /><button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button><div class="om-omw-ip-actions"><button type="button" class="link-btn" disabled title="暂未开放">🗑 删除</button><button type="button" class="link-btn" disabled title="暂未开放">+ 添加</button><button type="button" class="link-btn" disabled title="暂未开放">☁ 导入</button><button type="button" class="link-btn" disabled title="暂未开放">☁ 导出</button></div></div>
              <div class="ou-table-wrap"><table class="ou-table"><thead><tr><th class="col-check"><input type="checkbox" disabled aria-label="全选" /></th><th class="col-idx">序号</th><th class="col-ip">起始IP</th><th class="col-ip">结束IP</th><th class="col-remark">备注</th><th class="col-actions">操作</th></tr></thead><tbody><tr><td colspan="6" class="ou-empty">无数据</td></tr></tbody></table></div>
              <div class="ou-footer ou-footer-td om-footer"><div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn" disabled>›</button></div></div><div class="ou-footer-right"><span>共 0 条</span></div></div>
            </div>
          </div>
        </div>
        <!-- 概览 -->
        <div class="om-omw-panel" :class="{ active: tab === 'overview' }" role="tabpanel">
          <div class="om-omw-overview-card">
            <div class="om-omw-stats-row">
              <div class="om-omw-stat-card"><span class="om-omw-stat-label">白名单IP数</span><strong class="om-omw-stat-val">0</strong></div>
              <div class="om-omw-stat-card"><span class="om-omw-stat-label">非法连接数</span><strong class="om-omw-stat-val">0</strong></div>
              <div class="om-omw-stat-card"><span class="om-omw-stat-label">最近非法IP</span><strong class="om-omw-stat-val">—</strong></div>
            </div>
            <div class="om-omw-trend-card">
              <div class="om-omw-trend-head"><h3 class="om-section-title">最近趋势</h3><div class="om-omw-range-toggle" role="group"><button type="button" class="om-omw-range-btn active" disabled>最近三天</button><button type="button" class="om-omw-range-btn" disabled>最近一月</button></div></div>
              <div class="om-omw-trend-plot"><svg class="om-omw-trend-svg" viewBox="0 0 960 180" preserveAspectRatio="none" aria-hidden="true"><line x1="48" y1="150" x2="920" y2="150" stroke="#e4e7ed"/><text x="48" y="170" font-size="11" fill="#909399">无数据</text></svg></div>
            </div>
          </div>
        </div>
        <!-- 非法连接 -->
        <div class="om-omw-panel" :class="{ active: tab === 'illegal' }" role="tabpanel">
          <div class="ou-toolbar om-omw-toolbar"><label class="tdh-filter-field dba-refresh-field"><span class="ou-toolbar-label">自动刷新</span><select class="ou-toolbar-select" disabled><option selected>10 秒</option></select></label><input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled /><button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button></div>
          <div class="ou-table-wrap"><table class="ou-table"><thead><tr><th class="col-idx">序号</th><th class="col-ip ou-th-sort">IP地址</th><th class="col-mac ou-th-sort">MAC地址</th><th class="col-rate ou-th-sort">流入bps</th><th class="col-rate ou-th-sort">流出bps</th><th class="col-conn ou-th-sort">连接数</th><th class="col-time">首次出现</th><th class="col-time">最后出现</th><th class="col-actions">操作</th></tr></thead><tbody><tr><td colspan="9" class="ou-empty">无数据</td></tr></tbody></table></div>
          <div class="ou-footer ou-footer-td om-footer"><div class="ou-footer-left"><div class="ou-pager ou-pager-static"><button type="button" class="ou-page-btn" disabled>‹</button><button type="button" class="ou-page-btn" disabled>›</button></div></div><div class="ou-footer-right"><label class="ou-page-goto">到第 <input type="text" class="ou-page-goto-input" value="1" disabled /> 页 <button type="button" class="ou-page-goto-btn" disabled>确定</button></label><span>共 0 条</span><label class="ou-page-size"><select disabled><option selected>100 条/页</option></select></label></div></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import '@/views/netvisor/nv-shared.css'
const tab = ref('params')
</script>

<style scoped>
.om-omw-page { display:flex; flex-direction:column; height:100%; }
.om-omw-panel { display:none; flex-direction:column; flex:1; min-height:0; overflow-y:auto; }
.om-omw-panel.active { display:flex; }
.om-omw-params-card { padding:15px; }
.om-omw-params-form { display:flex; flex-direction:column; gap:10px; max-width:480px; margin-bottom:20px; }
.om-form-row { display:flex; align-items:center; gap:8px; font-size:13px; color:#606266; }
.om-form-label { min-width:100px; text-align:right; flex-shrink:0; }
.primary { height:30px; padding:0 16px; border:1px solid #409eff; border-radius:4px; background:#409eff; color:#fff; font-size:13px; cursor:pointer; align-self:flex-start; margin-left:108px; }
.primary:disabled { opacity:.55; cursor:not-allowed; }
.om-section-title { font-size:14px; font-weight:600; color:#303133; margin:0 0 8px; }
.om-omw-ip-manage { margin-top:16px; }
.om-omw-ip-toolbar { display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:8px; padding:0; border:none; }
.om-omw-ip-actions { margin-left:auto; display:flex; gap:8px; }
.om-omw-overview-card { padding:15px; }
.om-omw-stats-row { display:flex; gap:12px; margin-bottom:16px; }
.om-omw-stat-card { flex:1; padding:16px; background:#f5f7fa; border-radius:4px; border:1px solid #ebeef5; text-align:center; }
.om-omw-stat-label { display:block; font-size:12px; color:#909399; margin-bottom:4px; }
.om-omw-stat-val { display:block; font-size:20px; color:#303133; }
.om-omw-trend-card { border:1px solid #ebeef5; border-radius:4px; }
.om-omw-trend-head { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; border-bottom:1px solid #ebeef5; }
.om-omw-range-toggle { display:inline-flex; border:1px solid #dcdfe6; border-radius:3px; overflow:hidden; }
.om-omw-range-btn { padding:4px 10px; border:none; background:#fff; color:#606266; font-size:12px; cursor:pointer; border-right:1px solid #dcdfe6; }
.om-omw-range-btn:last-child { border-right:none; }
.om-omw-range-btn.active { background:#ecf5ff; color:#409eff; }
.om-omw-range-btn:disabled { opacity:.55; cursor:not-allowed; }
.om-omw-trend-plot { padding:12px; min-height:180px; }
.om-omw-trend-svg { width:100%; height:180px; }
.om-omw-toolbar { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.ti-switch { display:inline-flex; align-items:center; height:20px; border:none; background:none; cursor:pointer; padding:0; }
.ti-switch-core { display:inline-flex; align-items:center; position:relative; width:40px; height:20px; border-radius:10px; background:#dcdfe6; }
.ti-switch-inner { font-size:11px; color:#fff; padding:0 6px; white-space:nowrap; }
.ti-switch-action { position:absolute; left:2px; top:2px; width:16px; height:16px; border-radius:50%; background:#fff; }
.ti-switch:disabled { opacity:.55; cursor:not-allowed; }
</style>
