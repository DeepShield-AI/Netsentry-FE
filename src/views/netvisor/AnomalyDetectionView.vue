<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header">
      <div class="nv-tabs-nav" role="tablist">
        <button type="button" class="nv-tab" :class="{ active: activeTab === 'detect' }" role="tab" @click="activeTab = 'detect'">异常检测</button>
        <button type="button" class="nv-tab" :class="{ active: activeTab === 'uploads' }" role="tab" @click="activeTab = 'uploads'">异常样本</button>
      </div>
    </div>
    <div class="nv-tabs-body">

      <!-- 异常检测 -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'detect' }">
        <div class="ou-toolbar">
          <div class="ou-toolbar-item"><span class="ou-toolbar-label">探针</span>
            <select class="ou-toolbar-select"><option>本机探针</option></select>
          </div>
          <div class="ou-toolbar-item"><span class="ou-toolbar-label">检测算法</span>
            <select class="ou-toolbar-select"><option value="siteguard" selected>SiteGuard</option></select>
          </div>
          <div class="ad-capture-ctrl">
            <span class="ad-capture-led" :class="{ on: status.enabled }" :title="status.enabled ? '采集中' : '未采集'"></span>
            <button type="button" class="ou-search-btn" @click="load">{{ status.enabled ? '停止采集' : '启动采集' }}</button>
          </div>
          <button type="button" class="ou-search-btn" @click="load">刷新列表</button>
          <span style="width:1px;height:20px;background:#dcdfe6;margin:0 4px"></span>
          <button type="button" class="ou-search-btn" disabled>开启自动检测</button>
          <button type="button" class="ou-search-btn" disabled>批量检测历史 PCAP</button>
        </div>
        <p class="ad-hint">按时间窗口切片采集流量，解析后使用 SiteGuard（探针侧 MAZU 引擎）检测；判定为攻击且开启上报时，样本会出现在「异常样本」页。</p>

        <div class="ad-kpi-row">
          <div class="ad-kpi"><div class="ad-kpi-label">引擎状态</div><div class="ad-kpi-value">{{ status.enabled ? '运行中' : '未启用' }}</div></div>
          <div class="ad-kpi"><div class="ad-kpi-label">分析窗口</div><div class="ad-kpi-value">{{ status.window || '-' }}</div></div>
          <div class="ad-kpi"><div class="ad-kpi-label">异常数</div><div class="ad-kpi-value">{{ anomalies.length }}</div></div>
          <div class="ad-kpi"><div class="ad-kpi-label">最后检测</div><div class="ad-kpi-value">{{ status.lastCheck || '-' }}</div></div>
        </div>

        <div class="ou-table-wrap">
          <table class="ou-table ad-table">
            <thead><tr><th class="col-idx">序号</th><th>级别</th><th>类型</th><th>详情</th><th>源IP</th><th>时间</th></tr></thead>
            <tbody>
              <tr v-if="!anomalies.length"><td colspan="6" class="ou-empty">{{ loading ? '加载中…' : '无数据' }}</td></tr>
              <tr v-for="(a, i) in anomalies" :key="i">
                <td class="col-idx">{{ i + 1 }}</td>
                <td><span class="ad-level" :class="'ad-level-' + a.level">{{ a.level }}</span></td>
                <td>{{ a.type }}</td>
                <td><span class="dt-ellipsis" style="max-width:320px">{{ a.message }}</span></td>
                <td>{{ a.src_ip }}</td>
                <td>{{ a.time }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="ou-footer"><div class="ou-footer-left"><span>共 {{ anomalies.length }} 条</span></div></div>
      </div>

      <!-- 异常样本 -->
      <div class="nv-tab-panel" :class="{ active: activeTab === 'uploads' }">
        <div class="ou-toolbar">
          <div class="ou-toolbar-item"><span class="ou-toolbar-label">探针</span><select class="ou-toolbar-select" disabled><option>全部探针</option></select></div>
        </div>
        <div class="ou-table-wrap">
          <table class="ou-table ad-table">
            <thead><tr><th class="col-idx">序号</th><th>上报时间</th><th>探针</th><th>PCAP 名称</th><th>判定</th><th>大小</th><th>详情</th><th class="col-actions">操作</th></tr></thead>
            <tbody><tr><td colspan="8" class="ou-empty">无数据</td></tr></tbody>
          </table>
        </div>
        <div class="ou-footer"><div class="ou-footer-left"><span>共 0 条</span></div></div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import './nv-shared.css'

const activeTab = ref('detect')
const loading = ref(false)
const status = ref<any>({ enabled: false, window: '', lastCheck: '' })
const anomalies = ref<any[]>([])

async function load() {
  loading.value = true
  try {
    const [mazu, alerts] = await Promise.all([
      fetch('/mazu/status').then(r => r.json()).catch(() => ({ enabled: false })),
      fetch('/recent/alerts?n=100').then(r => r.json()).catch(() => []),
    ])
    status.value = {
      enabled: mazu?.enabled || false,
      window: mazu?.last_summary?.window_sec ? mazu.last_summary.window_sec + 's' : '-',
      lastCheck: mazu?.last_summary?.timestamp ? new Date(mazu.last_summary.timestamp).toLocaleTimeString('zh-CN') : '-',
    }
    const arr: any[] = Array.isArray(alerts) ? alerts : []
    anomalies.value = arr.map(a => ({
      level: a.level || a.severity || 'info',
      type: a.rule_name || a.type || 'anomaly',
      message: a.message || a.detail || '',
      src_ip: a.src_ip || '',
      time: a.timestamp ? new Date(a.timestamp).toLocaleString('zh-CN') : '',
    }))
  } catch { /* silent */ } finally { loading.value = false }
}

onMounted(load)
</script>

<style scoped>
.ad-hint { padding:8px 15px; margin:0; color:#909399; font-size:12px; background:#fafbfc; border-bottom:1px solid #ebeef5; }
.ad-capture-ctrl { display:inline-flex; align-items:center; gap:6px; }
.ad-capture-led { display:inline-block; width:10px; height:10px; border-radius:50%; background:#c0c4cc; }
.ad-capture-led.on { background:#67c23a; box-shadow:0 0 6px #67c23a; }
.ad-kpi-row { display:grid; grid-template-columns:repeat(4, 1fr); gap:12px; padding:12px; background:#f5f7fa; }
.ad-kpi { background:#fff; border:1px solid #e4e7ed; border-radius:4px; padding:14px; text-align:center; }
.ad-kpi-label { font-size:12px; color:#909399; }
.ad-kpi-value { font-size:20px; font-weight:600; color:#303133; margin-top:4px; }
.ad-table th, .ad-table td { font-size:12px; }
.ad-level { display:inline-block; padding:1px 6px; border-radius:2px; font-size:11px; font-weight:600; }
.ad-level-high, .ad-level-critical, .ad-level-error { background:#fef0f0; color:#f56c6c; }
.ad-level-medium, .ad-level-warning { background:#fdf6ec; color:#e6a23c; }
.ad-level-low, .ad-level-info { background:#ecf5ff; color:#409eff; }
.dt-ellipsis { display:inline-block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; vertical-align:bottom; }
</style>
