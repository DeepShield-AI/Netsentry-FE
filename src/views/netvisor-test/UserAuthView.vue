<template><AuditPage title="用户认证" :tabs="tabs" /></template>
<script setup lang="ts">
import AuditPage, { type AuditTab } from './AuditPage.vue'

const tabs: AuditTab[] = [
  {
    key: 'overview', label: '实时概况', type: 'overview',
    chartTitle: '用户认证趋势',
    chartData: [280, 420, 360, 180, 480, 380, 420, 280, 440, 360, 520, 400],
    chartMax: '520',
    chartMin: '180',
    chartAvg: '368',
    kpis: [
      { label: '在线用户', value: '186' },
      { label: '登录成功', value: '1,286' },
      { label: '登录失败', value: '186' },
      { label: '认证方式数', value: '4' },
    ],
    miniTables: [
      { title: 'Top 用户', columns: ['用户名称', '登录次数'], rows: [
        { '用户名称': 'user1', '登录次数': '286' },
        { '用户名称': 'user2', '登录次数': '186' },
        { '用户名称': 'user3', '登录次数': '128' },
        { '用户名称': 'admin', '登录次数': '86' },
      ]},
      { title: '登录来源IP', columns: ['用户IP', '登录次数'], rows: [
        { '用户IP': '101.6.10.23', '登录次数': '386' },
        { '用户IP': '183.222.90.184', '登录次数': '286' },
        { '用户IP': '119.186.228.221', '登录次数': '186' },
      ]},
      { title: '日志类型分布', columns: ['日志类型', '次数'], rows: [
        { '日志类型': '登录成功', '次数': '1,286' },
        { '日志类型': '登录失败', '次数': '186' },
        { '日志类型': '注销', '次数': '428' },
        { '日志类型': '超时', '次数': '86' },
      ]},
    ]
  },
  {
    key: 'logs', label: '认证日志',
    columns: ['用户地址', 'MAC', 'MAC厂商', '用户名称', '日志类型', '认证方式', '结果', '链路', '操作时间'],
    data: [
      { '用户地址': '101.6.10.23', MAC: '54-2b-de-6d-10-ae', 'MAC厂商': 'NewH3CTechno...', '用户名称': 'user1', '日志类型': '登录成功', '认证方式': '本地认证', '结果': '成功', '链路': 'xe4', '操作时间': '2026-06-15 14:30:28' },
      { '用户地址': '183.222.90.184', MAC: '54-2b-de-6d-10-ae', 'MAC厂商': 'NewH3CTechno...', '用户名称': 'user2', '日志类型': '登录失败', '认证方式': 'RADIUS', '结果': '失败', '链路': 'xe2', '操作时间': '2026-06-15 14:28:15' },
      { '用户地址': '119.186.228.221', MAC: '54-2b-de-6d-10-ae', 'MAC厂商': 'NewH3CTechno...', '用户名称': 'user3', '日志类型': '注销', '认证方式': '本地认证', '结果': '成功', '链路': 'xe3', '操作时间': '2026-06-15 14:25:42' },
    ],
    filters: [
      { label: '账号' },
      { label: 'MAC' },
      { label: '日志类型', kind: 'select' },
      { label: '用户IP' },
      { label: '链路', kind: 'select' },
    ]
  },
]
</script>
