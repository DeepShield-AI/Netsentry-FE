<template><AuditPage title="FTP审计" :tabs="tabs" /></template>
<script setup lang="ts">
import AuditPage, { type AuditTab } from './AuditPage.vue'
const tabs: AuditTab[] = [
  { key: 'realtime', label: '实时查询', columns: ['时间', 'MAC', '用户名称', '源IP', 'FTP服务器', '登录账号', '模式(主动/被动)', '命令', '文件路径', '文件大小', '状态', '链路', '操作'] },
  { key: 'overview', label: 'FTP概况', type: 'overview', chartTitle: 'FTP 命令趋势', kpis: [{ label: '总会话数', value: '—' }, { label: '成功登录', value: '—' }, { label: '失败登录', value: '—' }, { label: '上传/下载', value: '—' }], miniTables: [{ title: '登录账号', columns: ['账号', '会话数'] }, { title: 'FTP服务器', columns: ['服务器', '会话数'] }, { title: '命令统计', columns: ['命令', '次数'] }] },
  { key: 'history', label: '历史查询', columns: ['时间', 'MAC', '用户名称', '源IP', 'FTP服务器', '登录账号', '命令', '文件路径', '文件大小', '状态', '链路', '操作'] },
]
</script>
