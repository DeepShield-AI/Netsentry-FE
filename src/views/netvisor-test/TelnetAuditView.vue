<template><AuditPage title="Telnet审计" :tabs="tabs" /></template>
<script setup lang="ts">
import AuditPage, { type AuditTab } from './AuditPage.vue'

const tabs: AuditTab[] = [
  {
    key: 'overview', label: 'Telnet概况', type: 'overview',
    chartTitle: 'Telnet连接趋势',
    chartData: [40, 60, 50, 28, 72, 56, 64, 44, 68, 58, 78, 62],
    chartMax: '78',
    chartMin: '28',
    chartAvg: '54',
    kpis: [
      { label: '总会话数', value: '864' },
      { label: '活跃会话', value: '24' },
      { label: '失败次数', value: '42' },
      { label: '平均时长', value: '12分钟' },
    ],
    miniTables: [
      { title: '登录用户', columns: ['用户', '会话数'], rows: [
        { '用户': 'root', '会话数': '286' },
        { '用户': 'admin', '会话数': '186' },
        { '用户': 'operator', '会话数': '128' },
      ]},
      { title: '目标主机', columns: ['主机', '会话数'], rows: [
        { '主机': '101.6.15.130', '会话数': '386' },
        { '主机': '101.6.6.6', '会话数': '286' },
        { '主机': '101.6.10.23', '会话数': '128' },
      ]},
    ]
  },
  {
    key: 'sessions', label: 'Telnet会话',
    columns: ['时间', '用户', '源IP', '目标IP', '端口', '时长', '状态', '操作'],
    data: [
      { 时间: '2026-06-15 14:30:28', '用户': 'root', '源IP': '101.6.10.23', '目标IP': '101.6.15.130', '端口': '23', '时长': '15分钟', '状态': '活跃', '操作': '断开' },
      { 时间: '2026-06-15 14:28:15', '用户': 'admin', '源IP': '183.222.90.184', '目标IP': '101.6.6.6', '端口': '23', '时长': '8分钟', '状态': '活跃', '操作': '断开' },
      { 时间: '2026-06-15 14:25:42', '用户': 'operator', '源IP': '119.186.228.221', '目标IP': '101.6.15.130', '端口': '23', '时长': '3分钟', '状态': '已断开', '操作': '—' },
    ]
  },
]
</script>
