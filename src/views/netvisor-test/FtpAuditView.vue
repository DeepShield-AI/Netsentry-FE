<template><AuditPage title="FTP审计" :tabs="tabs" /></template>
<script setup lang="ts">
import AuditPage, { type AuditTab } from './AuditPage.vue'

const tabs: AuditTab[] = [
  {
    key: 'overview', label: 'FTP概况', type: 'overview',
    chartTitle: 'FTP操作趋势',
    chartData: [120, 180, 150, 80, 220, 160, 190, 130, 210, 170, 240, 180],
    chartMax: '240',
    chartMin: '80',
    chartAvg: '168',
    kpis: [
      { label: '总会话数', value: '2,864' },
      { label: '上传文件', value: '864' },
      { label: '下载文件', value: '1,286' },
      { label: '失败次数', value: '186' },
    ],
    miniTables: [
      { title: '登录用户', columns: ['用户', '会话数'], rows: [
        { '用户': 'admin', '会话数': '864' },
        { '用户': 'user1', '会话数': '642' },
        { '用户': 'user2', '会话数': '428' },
      ]},
      { title: '操作类型', columns: ['操作', '次数'], rows: [
        { '操作': 'GET', '次数': '1,286' },
        { '操作': 'PUT', '次数': '864' },
        { '操作': 'LIST', '次数': '428' },
        { '操作': 'DELETE', '次数': '186' },
      ]},
    ]
  },
  {
    key: 'sessions', label: 'FTP会话',
    columns: ['时间', '用户', '源IP', '目标IP', '操作', '文件', '大小', '状态', '响应码', '链路'],
    data: [
      { 时间: '2026-06-15 14:30:28', '用户': 'admin', '源IP': '101.6.10.23', '目标IP': '101.6.15.130', '操作': 'GET', '文件': 'backup.zip', '大小': '128 M', '状态': '成功', '响应码': '226', '链路': 'xe4' },
      { 时间: '2026-06-15 14:28:15', '用户': 'user1', '源IP': '183.222.90.184', '目标IP': '101.6.6.6', '操作': 'PUT', '文件': 'report.pdf', '大小': '4.2 M', '状态': '成功', '响应码': '226', '链路': 'xe2' },
      { 时间: '2026-06-15 14:25:42', '用户': 'user2', '源IP': '119.186.228.221', '目标IP': '101.6.15.130', '操作': 'DELETE', '文件': 'old.log', '大小': '864 K', '状态': '成功', '响应码': '250', '链路': 'xe3' },
    ]
  },
]
</script>
