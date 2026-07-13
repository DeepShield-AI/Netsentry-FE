<template><AuditPage title="邮件审计" :tabs="tabs" /></template>
<script setup lang="ts">
import AuditPage, { type AuditTab } from './AuditPage.vue'
const tabs: AuditTab[] = [
  { key: 'realtime', label: '实时查询', columns: ['时间', 'MAC', '用户名称', '源IP', '邮件服务器', '协议', '发件人', '收件人', '主题', '大小', '附件数', '状态', '链路', '操作'] },
  { key: 'overview', label: '邮件概况', type: 'overview', chartTitle: '邮件收发趋势', kpis: [{ label: '总邮件数', value: '—' }, { label: '发件数', value: '—' }, { label: '收件数', value: '—' }, { label: '带附件邮件', value: '—' }], miniTables: [{ title: '发件人', columns: ['发件人', '邮件数'] }, { title: '收件人', columns: ['收件人', '邮件数'] }, { title: '邮件服务器', columns: ['服务器', '邮件数'] }] },
  { key: 'history', label: '历史查询', columns: ['时间', 'MAC', '用户名称', '源IP', '邮件服务器', '协议', '发件人', '收件人', '主题', '大小', '附件数', '状态', '链路', '操作'] },
]
</script>
