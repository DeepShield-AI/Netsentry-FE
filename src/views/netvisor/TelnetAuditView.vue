<template><AuditPage title="Telnet审计" :tabs="tabs" /></template>
<script setup lang="ts">
import AuditPage, { type AuditTab } from './AuditPage.vue'
const tabs: AuditTab[] = [
  { key: 'realtime', label: '实时查询', columns: ['时间', 'MAC', '用户名称', '源IP', 'Telnet服务器', '登录账号', '协议等级', '执行命令', '响应', '会话时长', '状态', '链路', '操作'] },
  { key: 'overview', label: 'Telnet概况', type: 'overview', chartTitle: 'Telnet 会话趋势', kpis: [{ label: '总会话数', value: '—' }, { label: '成功登录', value: '—' }, { label: '失败登录', value: '—' }, { label: '异常命令', value: '—' }], miniTables: [{ title: '登录账号', columns: ['账号', '会话数'] }, { title: 'Telnet服务器', columns: ['服务器', '会话数'] }, { title: '命令统计', columns: ['命令', '次数'] }] },
  { key: 'history', label: '历史查询', columns: ['时间', 'MAC', '用户名称', '源IP', 'Telnet服务器', '登录账号', '执行命令', '协议等级', '状态', '链路', '操作'] },
]
</script>
