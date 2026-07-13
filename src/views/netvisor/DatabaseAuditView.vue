<template><AuditPage title="数据库审计" :tabs="tabs" /></template>
<script setup lang="ts">
import AuditPage, { type AuditTab } from './AuditPage.vue'
const tabs: AuditTab[] = [
  { key: 'realtime-sessions', label: '实时会话', columns: ['时间', 'MAC', '用户名称', '源IP', '数据库服务器', '端口', 'DB类型', '数据库名', '登录账号', 'SQL 语句', '影响行数', '响应时间(ms)', '状态', '链路', '操作'] },
  { key: 'realtime-overview', label: '实时概况', type: 'overview', chartTitle: 'SQL 执行趋势', kpis: [{ label: '总 SQL 数', value: '—' }, { label: '慢 SQL', value: '—' }, { label: '错误 SQL', value: '—' }, { label: '连接数', value: '—' }], miniTables: [{ title: 'Top 数据库', columns: ['数据库', 'SQL 数'] }, { title: 'Top 账号', columns: ['账号', 'SQL 数'] }, { title: 'DB 类型分布', columns: ['类型', '会话数'] }] },
  { key: 'history-sessions', label: '历史会话', columns: ['时间', 'MAC', '用户名称', '源IP', '数据库服务器', 'DB类型', '数据库名', '登录账号', 'SQL 语句', '影响行数', '响应时间(ms)', '状态', '链路', '操作'] },
  { key: 'history-overview', label: '历史概况', type: 'overview', chartTitle: '历史 SQL 趋势', kpis: [{ label: '会话总数', value: '—' }, { label: '慢 SQL', value: '—' }, { label: '错误 SQL', value: '—' }, { label: '涉及数据库', value: '—' }], miniTables: [{ title: 'Top 数据库', columns: ['数据库', 'SQL 数'] }, { title: 'Top 账号', columns: ['账号', 'SQL 数'] }] },
  { key: 'sql-analysis', label: 'SQL分析', columns: ['SQL 指纹', 'DB 类型', '数据库', '执行次数', '平均耗时(ms)', '最大耗时(ms)', '错误次数', '最近执行'] },
]
</script>
