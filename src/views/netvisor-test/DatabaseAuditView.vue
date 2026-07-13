<template><AuditPage title="数据库审计" :tabs="tabs" /></template>
<script setup lang="ts">
import AuditPage, { type AuditTab } from './AuditPage.vue'

const tabs: AuditTab[] = [
  {
    key: 'overview', label: '数据库概况', type: 'overview',
    chartTitle: '数据库操作趋势',
    kpis: [
      { label: '查询总数', value: '128,642' },
      { label: '更新数', value: '28,642' },
      { label: '插入数', value: '18,642' },
      { label: '删除数', value: '8,642' },
    ],
    miniTables: [
      { title: '数据库类型', columns: ['类型', '查询数'], rows: [
        { '类型': 'MySQL', '查询数': '68,642' },
        { '类型': 'PostgreSQL', '查询数': '38,642' },
        { '类型': 'Oracle', '查询数': '12,864' },
        { '类型': 'SQL Server', '查询数': '8,494' },
      ]},
      { title: '操作类型', columns: ['操作', '次数'], rows: [
        { '操作': 'SELECT', '次数': '98,642' },
        { '操作': 'UPDATE', '次数': '18,642' },
        { '操作': 'INSERT', '次数': '8,642' },
        { '操作': 'DELETE', '次数': '2,716' },
      ]},
    ]
  },
  {
    key: 'sessions', label: '数据库会话',
    columns: ['时间', '用户', '源IP', '数据库', '操作', 'SQL', '响应时间(ms)', '状态', '链路'],
    data: [
      { 时间: '2026-06-15 14:30:28', '用户': 'db_user', '源IP': '101.6.10.23', '数据库': 'mysql://101.6.15.130:3306', '操作': 'SELECT', 'SQL': 'SELECT * FROM users WHERE id=1', '响应时间(ms)': '12', '状态': '成功', '链路': 'xe4' },
      { 时间: '2026-06-15 14:28:15', '用户': 'db_admin', '源IP': '183.222.90.184', '数据库': 'postgres://101.6.6.6:5432', '操作': 'UPDATE', 'SQL': 'UPDATE orders SET status=1 WHERE id=123', '响应时间(ms)': '45', '状态': '成功', '链路': 'xe2' },
      { 时间: '2026-06-15 14:25:42', '用户': 'db_user', '源IP': '119.186.228.221', '数据库': 'mysql://101.6.15.130:3306', '操作': 'INSERT', 'SQL': 'INSERT INTO logs (msg) VALUES (?)', '响应时间(ms)': '28', '状态': '成功', '链路': 'xe3' },
    ]
  },
]
</script>
