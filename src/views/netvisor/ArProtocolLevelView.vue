<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav" role="tablist" aria-label="协议等级">
        <button type="button" class="nv-tab active" role="tab">协议等级</button>
      </div>
    </div>
    <div class="nv-tabs-body">
      <div class="ar-pl-page">
        <div class="ou-toolbar ar-pl-toolbar"><input class="ou-toolbar-input" type="search" placeholder="关键字搜索" disabled /><button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button><div class="ar-pl-toolbar-right"><button type="button" class="link-btn" disabled title="暂未开放">↻ 恢复默认</button></div></div>
        <div class="ou-table-wrap ar-pl-table-wrap"><table class="ou-table ar-pl-table"><thead><tr><th class="col-idx">序号</th><th class="col-level ou-th-sort">等级</th><th class="col-name">等级名称</th><th class="col-color">颜色</th><th class="col-desc">描述</th><th class="col-count ou-th-sort">协议数</th><th class="col-actions">操作</th></tr></thead><tbody>
          <tr v-for="(lv, i) in levels" :key="lv.name"><td class="col-idx">{{ i + 1 }}</td><td class="col-level">{{ lv.level }}</td><td class="col-name">{{ lv.name }}</td><td class="col-color"><span class="ar-pl-color-dot" :style="{ background: lv.color }"></span></td><td class="col-desc">{{ lv.desc }}</td><td class="col-count">{{ lv.count }}</td><td class="col-actions"><button type="button" class="link-btn" disabled title="暂未开放">✎</button></td></tr>
        </tbody></table></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import '@/views/netvisor/nv-shared.css'
const levels = [
  { level: 10, name: '核心业务', color: '#e6a23c', desc: '最高优先级业务协议', count: 0 },
  { level: 9, name: '关键业务', color: '#f56c6c', desc: '关键业务协议', count: 0 },
  { level: 8, name: '重要业务', color: '#409eff', desc: '重要业务协议', count: 0 },
  { level: 7, name: '普通业务', color: '#67c23a', desc: '一般业务协议', count: 0 },
  { level: 5, name: '默认', color: '#909399', desc: '默认等级', count: 0 },
  { level: 3, name: '低优先', color: '#c0c4cc', desc: '低优先级协议', count: 0 },
  { level: 1, name: '最低', color: '#dcdfe6', desc: '最低优先级', count: 0 },
]
</script>

<style scoped>
.ar-pl-page { display:flex; flex-direction:column; height:100%; }
.ar-pl-toolbar { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.ar-pl-toolbar-right { margin-left:auto; display:flex; gap:8px; }
.ar-pl-color-dot { display:inline-block; width:14px; height:14px; border-radius:2px; vertical-align:middle; }
</style>
