<template><AuditPage title="邮件审计" :tabs="tabs" /></template>
<script setup lang="ts">
import AuditPage, { type AuditTab } from './AuditPage.vue'

const tabs: AuditTab[] = [
  {
    key: 'overview', label: '邮件概况', type: 'overview',
    chartTitle: '邮件收发趋势',
    chartData: [420, 580, 480, 320, 680, 520, 560, 420, 620, 540, 720, 580],
    chartMax: '720',
    chartMin: '320',
    chartAvg: '520',
    kpis: [
      { label: '邮件总数', value: '12,864' },
      { label: '接收邮件', value: '8,642' },
      { label: '发送邮件', value: '4,222' },
      { label: '可疑邮件', value: '186' },
    ],
    miniTables: [
      { title: '发件人统计', columns: ['发件人', '邮件数'], rows: [
        { '发件人': 'user1@tsinghua.edu.cn', '邮件数': '2,864' },
        { '发件人': 'user2@tsinghua.edu.cn', '邮件数': '1,864' },
        { '发件人': 'user3@tsinghua.edu.cn', '邮件数': '1,286' },
        { '发件人': 'admin@company.com', '邮件数': '864' },
      ]},
      { title: '收件人统计', columns: ['收件人', '邮件数'], rows: [
        { '收件人': 'team@tsinghua.edu.cn', '邮件数': '3,864' },
        { '收件人': 'user1@tsinghua.edu.cn', '邮件数': '2,286' },
        { '收件人': 'user2@tsinghua.edu.cn', '邮件数': '1,642' },
      ]},
      { title: '主题关键词', columns: ['关键词', '匹配数'], rows: [
        { '关键词': '会议', '匹配数': '1,864' },
        { '关键词': '通知', '匹配数': '1,286' },
        { '关键词': '报告', '匹配数': '864' },
        { '关键词': '紧急', '匹配数': '428' },
      ]},
    ]
  },
  {
    key: 'receive', label: '接收邮件',
    columns: ['时间', '发件人', '收件人', '主题', '附件', '大小', '状态', '操作'],
    data: [
      { 时间: '2026-06-15 14:30:28', '发件人': 'admin@company.com', '收件人': 'team@tsinghua.edu.cn', '主题': '关于下周会议安排的通知', '附件': '会议议程.docx', '大小': '864 K', '状态': '正常', '操作': '查看' },
      { 时间: '2026-06-15 14:28:15', '发件人': 'user1@external.com', '收件人': 'user1@tsinghua.edu.cn', '主题': '项目进度报告', '附件': '—', '大小': '128 K', '状态': '正常', '操作': '查看' },
      { 时间: '2026-06-15 14:25:42', '发件人': 'unknown@malicious.com', '收件人': 'user2@tsinghua.edu.cn', '主题': '您的账户需要验证', '附件': 'verify.exe', '大小': '2.4 M', '状态': '可疑', '操作': '查看' },
    ]
  },
  {
    key: 'send', label: '发送邮件',
    columns: ['时间', '发件人', '收件人', '主题', '附件', '大小', '状态', '操作'],
    data: [
      { 时间: '2026-06-15 14:30:28', '发件人': 'user1@tsinghua.edu.cn', '收件人': 'client@partner.com', '主题': '合作方案确认', '附件': '方案.pdf', '大小': '4.2 M', '状态': '正常', '操作': '查看' },
      { 时间: '2026-06-15 14:28:15', '发件人': 'user2@tsinghua.edu.cn', '收件人': 'team@tsinghua.edu.cn', '主题': '周报汇总', '附件': '周报.xlsx', '大小': '864 K', '状态': '正常', '操作': '查看' },
    ]
  },
]
</script>
