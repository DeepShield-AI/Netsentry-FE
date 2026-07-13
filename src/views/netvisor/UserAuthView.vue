<template><AuditPage title="用户认证" :tabs="tabs" /></template>
<script setup lang="ts">
import AuditPage, { type AuditTab } from './AuditPage.vue'
const tabs: AuditTab[] = [
  { key: 'overview', label: '实时概况', type: 'overview', chartTitle: '用户认证趋势', kpis: [{ label: '在线用户', value: '—' }, { label: '登录成功', value: '—' }, { label: '登录失败', value: '—' }, { label: '认证方式数', value: '—' }], miniTables: [{ title: 'Top 用户', columns: ['用户名称', '登录次数'] }, { title: '登录来源IP', columns: ['用户IP', '登录次数'] }, { title: '日志类型分布', columns: ['日志类型', '次数'] }] },
  { key: 'logs', label: '认证日志', columns: ['用户地址', 'MAC', 'MAC厂商', '用户名称', '日志类型', '认证方式', '结果', '链路', '操作时间'], filters: [{ label: '账号' }, { label: 'MAC' }, { label: '日志类型', kind: 'select' }, { label: '用户IP' }, { label: '链路', kind: 'select' }] },
]
</script>
