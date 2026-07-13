<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav" role="tablist" aria-label="RADIUS">
        <button type="button" class="nv-tab active" role="tab">RADIUS</button>
      </div>
    </div>
    <div class="nv-tabs-body">
      <div class="om-radius-page">
        <section class="om-radius-section">
          <h3 class="om-section-title">参数设置</h3>
          <form class="om-radius-form" onsubmit="return false">
            <label class="om-form-row"><span class="om-form-label">Radius服务</span><button type="button" class="ti-switch" disabled aria-pressed="false"><span class="ti-switch-core"><span class="ti-switch-inner">禁用</span><span class="ti-switch-action" aria-hidden="true"></span></span></button></label>
            <label class="om-form-row"><span class="om-form-label">NAS标识</span><input class="ou-toolbar-input" type="text" value="Panabit" disabled /></label>
            <label class="om-form-row"><span class="om-form-label">计费发送间隔</span><input class="ou-toolbar-input om-form-input-sm" type="text" value="300" disabled /><span class="om-form-unit">秒</span></label>
            <label class="om-form-row"><span class="om-form-label">响应等待时间</span><input class="ou-toolbar-input om-form-input-sm" type="text" value="10" disabled /><span class="om-form-hint">秒，超过此时间的RADIUS应答将被丢弃</span></label>
            <button type="button" class="primary" disabled title="暂未开放">确定</button>
          </form>
        </section>
        <section class="om-radius-section om-radius-list-section">
          <h3 class="om-section-title">服务列表</h3>
          <div class="ou-toolbar om-radius-toolbar">
            <label class="tdh-filter-field dba-refresh-field"><span class="ou-toolbar-label">自动刷新</span><select class="ou-toolbar-select" disabled><option selected>10 秒</option></select></label>
            <input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled /><button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button>
            <div class="om-radius-toolbar-right"><button type="button" class="link-btn" disabled title="暂未开放">🗑 删除</button><button type="button" class="link-btn" disabled title="暂未开放">+ 添加</button></div>
          </div>
          <div class="ou-table-wrap om-radius-table-wrap"><table class="ou-table om-radius-table"><thead><tr><th class="col-check"><input type="checkbox" disabled aria-label="全选" /></th><th class="col-id">ID</th><th class="col-name">名称</th><th class="col-ip">IP地址</th><th class="col-status">状态</th><th class="col-port">认证端口</th><th class="col-port">计费端口</th><th class="col-secret">共享密钥</th><th class="col-domain">RAAS域名</th><th class="col-route">主路由线路</th><th class="col-route">备份线路</th><th class="col-stat">认证(请求/超时/拒绝)</th><th class="col-stat">计费(请求/超时)</th><th class="col-route-num">路线</th><th class="col-actions">操作</th></tr></thead><tbody><tr><td class="col-check"><input type="checkbox" disabled /></td><td class="col-id">0</td><td class="col-name"><button type="button" class="link-btn" disabled>DefaultRadius</button></td><td class="col-ip">0.0.0.0</td><td class="col-status"><span class="om-status-bad" aria-label="异常">✕</span></td><td class="col-port">1812</td><td class="col-port">1813</td><td class="col-secret">panabit</td><td class="col-domain">0</td><td class="col-route"></td><td class="col-route"></td><td class="col-stat">0/0/0</td><td class="col-stat">0/0</td><td class="col-route-num">0</td><td class="col-actions"><button type="button" class="link-btn" disabled title="暂未开放">✎</button><button type="button" class="link-btn" disabled title="暂未开放">🗑</button></td></tr></tbody></table></div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import '@/views/netvisor/nv-shared.css'
</script>

<style scoped>
.om-radius-page { padding:15px; overflow-y:auto; }
.om-radius-section { margin-bottom:20px; }
.om-section-title { font-size:14px; font-weight:600; color:#303133; margin:0 0 12px; }
.om-radius-form { display:flex; flex-direction:column; gap:10px; max-width:500px; }
.om-form-row { display:flex; align-items:center; gap:8px; font-size:13px; color:#606266; }
.om-form-label { min-width:100px; text-align:right; flex-shrink:0; }
.om-form-input-sm { width:80px; }
.om-form-unit { font-size:12px; color:#909399; }
.om-form-hint { font-size:12px; color:#909399; }
.primary { height:30px; padding:0 16px; border:1px solid #409eff; border-radius:4px; background:#409eff; color:#fff; font-size:13px; cursor:pointer; align-self:flex-start; margin-left:108px; }
.primary:disabled { opacity:.55; cursor:not-allowed; }
.om-radius-toolbar { display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:8px; }
.om-radius-toolbar-right { margin-left:auto; display:flex; gap:8px; }
.om-status-bad { color:#f56c6c; font-weight:700; }
.ti-switch { display:inline-flex; align-items:center; height:20px; border:none; background:none; cursor:pointer; padding:0; }
.ti-switch-core { display:inline-flex; align-items:center; position:relative; width:40px; height:20px; border-radius:10px; background:#dcdfe6; transition:background .3s; }
.ti-switch-inner { font-size:11px; color:#fff; padding:0 6px; white-space:nowrap; }
.ti-switch-action { position:absolute; left:2px; top:2px; width:16px; height:16px; border-radius:50%; background:#fff; }
.ti-switch:disabled { opacity:.55; cursor:not-allowed; }
</style>
