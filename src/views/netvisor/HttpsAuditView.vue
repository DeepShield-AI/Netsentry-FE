<template><AuditPage title="HTTPS审计" :tabs="tabs" /></template>
<script setup lang="ts">
import AuditPage, { type AuditTab } from './AuditPage.vue'
const tabs: AuditTab[] = [
  { key: 'diagnosis', label: 'HTTPS诊断', columns: ['时间', 'MAC', '用户名称', '源IP', '目标IP', 'SNI域名', 'TLS版本', '密码套件', '证书主体', '证书颁发者', '有效期', '异常', '链路'] },
  { key: 'sessions', label: 'HTTPS会话', columns: ['时间', 'MAC', 'MAC厂商', '用户名称', '源IP', '目标IP', 'SNI域名', 'TLS版本', '密码套件', 'ALPN', '证书指纹', 'JA3', '上行流量', '下行流量', '链路', '操作'] },
]
</script>
