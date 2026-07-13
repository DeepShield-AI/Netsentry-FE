<template><AuditPage title="DNS审计" :tabs="tabs" /></template>
<script setup lang="ts">
import AuditPage, { type AuditTab } from './AuditPage.vue'
const tabs: AuditTab[] = [
  { key: 'diagnosis', label: 'DNS诊断', columns: ['时间', 'MAC', '用户名称', '源IP', 'DNS服务器', '查询域名', '查询类型', 'RCODE', '响应时间(ms)', '异常', '链路'] },
  { key: 'sessions', label: 'DNS会话', columns: ['时间', 'MAC', 'MAC厂商', '用户名称', '源IP', 'DNS服务器', '查询域名', '查询类型', '响应记录', 'TTL', '响应大小', '响应时间(ms)', '链路', '操作'] },
]
</script>
