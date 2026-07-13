<template><AuditPage title="HTTP审计" :tabs="tabs" /></template>
<script setup lang="ts">
import AuditPage, { type AuditTab } from './AuditPage.vue'
const tabs: AuditTab[] = [
  { key: 'diagnosis', label: 'HTTP诊断', columns: ['时间', 'MAC', '用户名称', '源IP', '目标IP', '域名', 'URL', '方法', '状态码', '错误类型', '响应时间(ms)', '链路'] },
  { key: 'overview', label: 'HTTP概况', type: 'overview', chartTitle: 'HTTP 请求趋势', kpis: [{ label: '总请求数', value: '—' }, { label: '成功率', value: '—' }, { label: '平均响应', value: '—' }, { label: '错误请求', value: '—' }], miniTables: [{ title: '源IP', columns: ['源IP', '总请求数'] }, { title: '目标IP', columns: ['目标IP', '总请求数'] }, { title: '域名', columns: ['域名', '请求数'] }, { title: '状态码', columns: ['状态码', '次数'] }] },
  { key: 'sessions', label: 'HTTP会话', columns: ['时间', 'MAC', 'MAC厂商', '用户名称', '源IP', '目标IP', '域名', 'URL', '方法', '状态码', '请求大小', '响应大小', '响应时间(ms)', 'User-Agent', 'Referer', '链路', '操作'] },
  { key: 'url-stats', label: 'URL统计', columns: ['URL', '域名', '方法', '请求数', '成功数', '失败数', '总流量', '平均响应(ms)', '最近访问'] },
]
</script>
