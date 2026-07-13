<template>
  <div class="da-sp-page">
    <div class="ou-toolbar da-sp-toolbar">
      <div class="da-sp-toolbar-left">
        <label class="tdh-filter-field dba-refresh-field"><span class="ou-toolbar-label">自动刷新</span><select class="ou-toolbar-select" disabled><option value="10000" selected>10 秒</option><option value="30000">30 秒</option></select></label>
        <label class="tdh-filter-field"><span class="ou-toolbar-label">策略组</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
        <label class="tdh-filter-field"><span class="ou-toolbar-label">状态</span><select class="ou-toolbar-select" disabled><option selected>任意</option></select></label>
        <input class="ou-toolbar-input da-sp-search-input" type="search" placeholder="关键字搜索" disabled />
        <button type="button" class="ou-search-btn" disabled title="暂未开放">搜索</button>
      </div>
      <div class="da-sp-toolbar-right">
        <span class="da-sp-ip-hint">0.0.0.0</span>
        <button type="button" class="link-btn da-sp-link-btn" disabled title="暂未开放">★ 不限速IP</button>
        <button type="button" class="link-btn da-sp-link-btn" disabled title="暂未开放">ⓘ 说明</button>
        <button type="button" class="link-btn da-sp-link-btn" disabled title="暂未开放">◎ 动态限速</button>
        <button type="button" class="link-btn da-sp-link-btn" disabled title="暂未开放">+ 添加策略组</button>
        <div class="da-sp-view-toggle" role="group" aria-label="视图切换">
          <button type="button" class="da-sp-view-btn active" :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'" disabled>列表</button>
          <button type="button" class="da-sp-view-btn" :class="{ active: viewMode === 'tree' }" @click="viewMode = 'tree'" disabled>树形</button>
        </div>
      </div>
    </div>
    <div class="da-sp-body" aria-label="策略列表">
      <div v-if="viewMode === 'list'" class="da-sp-list">
        <div v-for="(group, gi) in policyGroups" :key="gi" class="da-sp-group">
          <div class="da-sp-group-head">
            <span class="da-sp-group-name">{{ group.name }}</span>
            <span class="da-sp-group-meta">共 {{ group.policies.length }} 条策略</span>
            <div class="da-sp-group-actions">
              <button type="button" class="link-btn" disabled>编辑</button>
              <button type="button" class="link-btn" disabled>删除</button>
            </div>
          </div>
          <div class="ou-table-wrap da-sp-table-wrap">
            <table class="ou-table da-sp-table">
              <thead>
                <tr>
                  <th class="col-idx">序号</th>
                  <th class="col-name ou-th-sort">策略名称</th>
                  <th class="col-ip">源IP</th>
                  <th class="col-ip">目标IP</th>
                  <th class="col-proto ou-th-sort">协议</th>
                  <th class="col-rate ou-th-sort">上行限速</th>
                  <th class="col-rate ou-th-sort">下行限速</th>
                  <th class="col-status ou-th-sort">状态</th>
                  <th class="col-actions">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in group.policies" :key="i">
                  <td class="col-idx">{{ i + 1 }}</td>
                  <td>{{ row.name }}</td>
                  <td>{{ row.srcIp }}</td>
                  <td>{{ row.dstIp }}</td>
                  <td>{{ row.proto }}</td>
                  <td class="ou-num">{{ row.upLimit }}</td>
                  <td class="ou-num">{{ row.downLimit }}</td>
                  <td><span class="nvt-tag" :class="row.status === '启用' ? 'nvt-tag-green' : 'nvt-tag-silver'">{{ row.status }}</span></td>
                  <td>
                    <button class="link-btn" disabled>编辑</button>
                    <button class="link-btn" disabled>删除</button>
                  </td>
                </tr>
                <tr v-if="group.policies.length === 0"><td colspan="9" class="ou-empty">无数据</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-if="policyGroups.length === 0" class="da-sp-empty">
          <p class="ou-empty" style="padding:48px 10px">暂无策略组，请点击"+ 添加策略组"</p>
        </div>
      </div>
      <div v-else class="da-sp-tree">
        <p class="ou-empty" style="padding:48px 10px">树形视图暂未开放</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import './nv-test-shared.css'

const viewMode = ref<'list' | 'tree'>('list')

const policyGroups = [
  {
    name: '默认策略组',
    policies: [
      { name: '办公区限速策略', srcIp: '192.168.1.0/24', dstIp: '任意', proto: '任意', upLimit: '10 Mbps', downLimit: '50 Mbps', status: '启用' },
      { name: '访客网络策略', srcIp: '192.168.100.0/24', dstIp: '任意', proto: '任意', upLimit: '2 Mbps', downLimit: '10 Mbps', status: '启用' },
      { name: '服务器区策略', srcIp: '10.0.0.0/16', dstIp: '任意', proto: 'TCP', upLimit: '不限速', downLimit: '不限速', status: '启用' },
    ],
  },
  {
    name: '重点保障策略组',
    policies: [
      { name: '视频会议保障', srcIp: '192.168.2.0/24', dstIp: '任意', proto: 'UDP', upLimit: '不限速', downLimit: '不限速', status: '启用' },
      { name: '生产业务优先', srcIp: '10.10.0.0/16', dstIp: '任意', proto: '任意', upLimit: '20 Mbps', downLimit: '100 Mbps', status: '停用' },
    ],
  },
]
</script>

<style scoped>
.da-sp-page { display:flex; flex-direction:column; height:100%; min-height:0; border:1px solid #e4e7ed; border-radius:4px; background:#fff; overflow:hidden; }

.ou-toolbar { display:flex; flex-wrap:wrap; align-items:center; gap:8px 12px; padding:10px 15px; border-bottom:1px solid #ebeef5; }
.da-sp-toolbar { justify-content:space-between; }
.da-sp-toolbar-left { display:flex; align-items:center; gap:8px 12px; flex-wrap:wrap; }
.da-sp-toolbar-right { display:flex; align-items:center; gap:12px; margin-left:auto; flex-wrap:wrap; }
.tdh-filter-field { display:inline-flex; align-items:center; gap:6px; }
.ou-toolbar-label { font-size:13px; color:#606266; white-space:nowrap; }
.ou-toolbar-select { height:30px; padding:0 6px; border:1px solid #dcdfe6; border-radius:4px; font-size:13px; color:#303133; background:#fff; }
.ou-toolbar-input { height:30px; padding:0 8px; border:1px solid #dcdfe6; border-radius:4px; font-size:13px; color:#303133; }
.ou-search-btn { height:30px; padding:0 14px; border:1px solid #409eff; border-radius:4px; background:#409eff; color:#fff; font-size:13px; font-weight:500; cursor:pointer; }
.ou-search-btn:disabled { opacity:.55; cursor:not-allowed; }
.link-btn { padding:0; border:none; background:none; color:#409eff; cursor:pointer; font-size:13px; font-weight:500; }
.link-btn:disabled { opacity:.55; cursor:not-allowed; }
.da-sp-link-btn { padding:0; border:none; background:none; color:#409eff; cursor:pointer; font-size:13px; font-weight:500; }
.da-sp-link-btn:disabled { opacity:.55; cursor:not-allowed; }
.da-sp-ip-hint { font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size:12px; color:#909399; padding:2px 8px; background:#f5f7fa; border:1px solid #ebeef5; border-radius:3px; }

.da-sp-view-toggle { display:inline-flex; border:1px solid #dcdfe6; border-radius:4px; overflow:hidden; background:#fff; }
.da-sp-view-btn { min-width:48px; padding:6px 12px; border:none; background:#fff; color:#606266; font-size:13px; font-weight:600; cursor:pointer; }
.da-sp-view-btn + .da-sp-view-btn { border-left:1px solid #dcdfe6; }
.da-sp-view-btn.active { background:#409eff; color:#fff; }
.da-sp-view-btn:disabled { opacity:.55; cursor:not-allowed; }

.da-sp-body { flex:1; min-height:0; overflow:auto; background:#f5f7fa; padding:12px; display:flex; flex-direction:column; gap:12px; }
.da-sp-list { display:flex; flex-direction:column; gap:12px; }
.da-sp-group { background:#fff; border:1px solid #ebeef5; border-radius:4px; overflow:hidden; display:flex; flex-direction:column; }
.da-sp-group-head { display:flex; align-items:center; gap:12px; padding:10px 14px; border-bottom:1px solid #ebeef5; background:#fafbfc; }
.da-sp-group-name { font-size:14px; font-weight:600; color:#303133; }
.da-sp-group-meta { font-size:12px; color:#909399; }
.da-sp-group-actions { margin-left:auto; display:flex; gap:12px; }

.ou-table-wrap { flex:1; min-height:0; overflow:auto; }
.ou-table { width:100%; border-collapse:collapse; font-size:13px; }
.ou-table th { background:#fafbfc; border-bottom:1px solid #ebeef5; padding:8px 10px; text-align:left; font-weight:600; color:#606266; white-space:nowrap; font-size:12px; }
.ou-table td { border-bottom:1px solid #f0f2f5; padding:8px 10px; color:#303133; }
.ou-empty { text-align:center; color:#909399; padding:32px 10px !important; }
.ou-num { text-align:right; font-variant-numeric:tabular-nums; }
.col-idx { width:52px; text-align:center; }
.col-name { min-width:160px; }
.col-ip { min-width:140px; }
.col-proto { width:80px; }
.col-rate { min-width:110px; text-align:right; }
.col-status { width:80px; text-align:center; }
.col-actions { width:120px; text-align:center; }
.ou-th-sort { cursor:pointer; }
.ou-th-sort:hover { color:#409eff; }

.nvt-tag { display:inline-block; padding:2px 8px; border-radius:4px; font-size:12px; font-weight:500; line-height:20px; }
.nvt-tag-green { background:#f0f9eb; color:#67c23a; border:1px solid #e1f3d8; }
.nvt-tag-silver { background:#f4f4f5; color:#909399; border:1px solid #e9e9eb; }

.da-sp-empty, .da-sp-tree { background:#fff; border:1px solid #ebeef5; border-radius:4px; flex:1; min-height:200px; display:flex; align-items:center; justify-content:center; }
</style>
