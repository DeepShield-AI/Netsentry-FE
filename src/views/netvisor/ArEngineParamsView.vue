<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav nv-tabs-nav-wrap" role="tablist" aria-label="引擎参数">
        <button type="button" class="nv-tab" :class="{ active: tab === 'basic' }" role="tab" @click="tab = 'basic'">基本参数</button>
        <button type="button" class="nv-tab" :class="{ active: tab === 'advanced' }" role="tab" @click="tab = 'advanced'">高级参数</button>
      </div>
    </div>
    <div class="nv-tabs-body">
      <div class="ar-ep-page">
        <!-- 基本参数 -->
        <div class="ar-ep-panel" :class="{ active: tab === 'basic' }" role="tabpanel">
          <div class="ar-ep-form-card">
            <form class="ar-ep-form" onsubmit="return false">
              <label class="ar-form-row"><span class="ar-form-label">协议识别引擎</span><button type="button" class="ti-switch is-checked" disabled aria-pressed="true"><span class="ti-switch-core"><span class="ti-switch-inner">启用</span><span class="ti-switch-action" aria-hidden="true"></span></span></button></label>
              <label class="ar-form-row"><span class="ar-form-label">TCP超时</span><input class="ou-toolbar-input ar-form-input-sm" type="text" value="1800" disabled /><span class="ar-form-unit">秒</span></label>
              <label class="ar-form-row"><span class="ar-form-label">UDP超时</span><input class="ou-toolbar-input ar-form-input-sm" type="text" value="180" disabled /><span class="ar-form-unit">秒</span></label>
              <label class="ar-form-row"><span class="ar-form-label">最大连接数</span><input class="ou-toolbar-input ar-form-input-sm" type="text" value="5000000" disabled /></label>
              <label class="ar-form-row"><span class="ar-form-label">DNS缓存条数</span><input class="ou-toolbar-input ar-form-input-sm" type="text" value="100000" disabled /></label>
              <label class="ar-form-row"><span class="ar-form-label">DNS缓存时间</span><input class="ou-toolbar-input ar-form-input-sm" type="text" value="3600" disabled /><span class="ar-form-unit">秒</span></label>
              <button type="button" class="primary" disabled title="暂未开放">确定</button>
            </form>
          </div>
        </div>
        <!-- 高级参数 -->
        <div class="ar-ep-panel" :class="{ active: tab === 'advanced' }" role="tabpanel">
          <div class="ar-ep-form-card">
            <form class="ar-ep-form" onsubmit="return false">
              <label class="ar-form-row"><span class="ar-form-label">SSL解析</span><button type="button" class="ti-switch is-checked" disabled aria-pressed="true"><span class="ti-switch-core"><span class="ti-switch-inner">启用</span><span class="ti-switch-action" aria-hidden="true"></span></span></button></label>
              <label class="ar-form-row"><span class="ar-form-label">HTTP Pipeline</span><button type="button" class="ti-switch is-checked" disabled aria-pressed="true"><span class="ti-switch-core"><span class="ti-switch-inner">启用</span><span class="ti-switch-action" aria-hidden="true"></span></span></button></label>
              <label class="ar-form-row"><span class="ar-form-label">QUIC识别</span><button type="button" class="ti-switch is-checked" disabled aria-pressed="true"><span class="ti-switch-core"><span class="ti-switch-inner">启用</span><span class="ti-switch-action" aria-hidden="true"></span></span></button></label>
              <label class="ar-form-row"><span class="ar-form-label">IPv6</span><button type="button" class="ti-switch" disabled aria-pressed="false"><span class="ti-switch-core"><span class="ti-switch-inner">禁用</span><span class="ti-switch-action" aria-hidden="true"></span></span></button></label>
              <button type="button" class="primary" disabled title="暂未开放">确定</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import '@/views/netvisor/nv-shared.css'
const tab = ref('basic')
</script>

<style scoped>
.ar-ep-page { display:flex; flex-direction:column; height:100%; }
.ar-ep-panel { display:none; flex-direction:column; flex:1; min-height:0; overflow-y:auto; }
.ar-ep-panel.active { display:flex; }
.ar-ep-form-card { padding:20px; }
.ar-ep-form { display:flex; flex-direction:column; gap:10px; max-width:480px; }
.ar-form-row { display:flex; align-items:center; gap:8px; font-size:13px; color:#606266; }
.ar-form-label { min-width:110px; text-align:right; flex-shrink:0; }
.ar-form-input-sm { width:120px; }
.ar-form-unit { font-size:12px; color:#909399; }
.primary { height:30px; padding:0 16px; border:1px solid #409eff; border-radius:4px; background:#409eff; color:#fff; font-size:13px; cursor:pointer; align-self:flex-start; margin-left:118px; }
.primary:disabled { opacity:.55; cursor:not-allowed; }
.ti-switch { display:inline-flex; align-items:center; height:20px; border:none; background:none; cursor:pointer; padding:0; }
.ti-switch-core { display:inline-flex; align-items:center; position:relative; width:40px; height:20px; border-radius:10px; background:#dcdfe6; transition:background .3s; }
.ti-switch.is-checked .ti-switch-core { background:#409eff; }
.ti-switch-inner { font-size:11px; color:#fff; padding:0 6px; white-space:nowrap; }
.ti-switch-action { position:absolute; top:2px; width:16px; height:16px; border-radius:50%; background:#fff; }
.ti-switch.is-checked .ti-switch-action { right:2px; }
.ti-switch:not(.is-checked) .ti-switch-action { left:2px; }
.ti-switch:disabled { opacity:.55; cursor:not-allowed; }
</style>
