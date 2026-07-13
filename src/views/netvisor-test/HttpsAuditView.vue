<template><AuditPage title="HTTPS审计" :tabs="tabs" /></template>
<script setup lang="ts">
import AuditPage, { type AuditTab } from './AuditPage.vue'

const tabs: AuditTab[] = [
  {
    key: 'diagnosis', label: 'HTTPS诊断',
    columns: ['时间', 'MAC', '用户名称', '源IP', '目标IP', 'SNI域名', 'TLS版本', '密码套件', '证书主体', '证书颁发者', '有效期', '异常', '链路'],
    data: [
      { 时间: '2026-06-15 14:30:28', MAC: '54-2b-de-6d-10-ae', 用户名称: '—', 源IP: '101.6.10.23', 目标IP: '101.6.15.130', 'SNI域名': 'mirrors.tuna.tsinghua.edu.cn', 'TLS版本': 'TLSv1.3', '密码套件': 'TLS_AES_256_GCM_SHA384', '证书主体': 'CN=mirrors.tuna.tsinghua.edu.cn', '证书颁发者': 'Let\'s Encrypt', '有效期': '2026-06-01 - 2026-08-30', 异常: '—', 链路: 'xe4' },
      { 时间: '2026-06-15 14:30:26', MAC: '54-2b-de-6d-10-ae', 用户名称: '—', 源IP: '183.222.90.184', 目标IP: '101.6.6.6', 'SNI域名': 'www.qq.com', 'TLS版本': 'TLSv1.2', '密码套件': 'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384', '证书主体': 'CN=www.qq.com', '证书颁发者': 'DigiCert', '有效期': '2026-03-15 - 2027-03-15', 异常: '—', 链路: 'xe2' },
      { 时间: '2026-06-15 14:30:24', MAC: '54-2b-de-6d-10-ae', 用户名称: '—', 源IP: '119.186.228.221', 目标IP: '166.111.5.212', 'SNI域名': 'pypi.tuna.tsinghua.edu.cn', 'TLS版本': 'TLSv1.2', '密码套件': 'TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256', '证书主体': 'CN=pypi.tuna.tsinghua.edu.cn', '证书颁发者': 'Let\'s Encrypt', '有效期': '2026-05-10 - 2026-08-08', 异常: '证书即将到期', 链路: 'xe3' },
      { 时间: '2026-06-15 14:30:22', MAC: '54-2b-de-6d-10-ae', 用户名称: '—', 源IP: '36.170.12.75', 目标IP: '101.6.8.149', 'SNI域名': 'cn.bing.com', 'TLS版本': 'TLSv1.3', '密码套件': 'TLS_AES_128_GCM_SHA256', '证书主体': 'CN=cn.bing.com', '证书颁发者': 'Microsoft', '有效期': '2026-04-01 - 2026-10-01', 异常: '—', 链路: 'xe5' },
    ]
  },
  {
    key: 'overview', label: 'HTTPS概况', type: 'overview',
    chartTitle: 'HTTPS 会话趋势',
    chartData: [8560, 12420, 10580, 6280, 15640, 11260, 13420, 9860, 14820, 11860, 17280, 12860],
    chartMax: '17,280',
    chartMin: '6,280',
    chartAvg: '11,680',
    kpis: [
      { label: '总会话数', value: '896,428' },
      { label: 'TLSv1.3占比', value: '68.4%' },
      { label: '证书异常', value: '1,286' },
      { label: '平均加密强度', value: '高' },
    ],
    miniTables: [
      { title: 'SNI域名', columns: ['SNI域名', '会话数'], rows: [
        { 'SNI域名': 'work.weixin.qq.com', '会话数': '186,428' },
        { 'SNI域名': 'mirrors.tuna.tsinghua.edu.cn', '会话数': '128,642' },
        { 'SNI域名': 'www.qq.com', '会话数': '98,642' },
        { 'SNI域名': 'cn.bing.com', '会话数': '72,864' },
        { 'SNI域名': 'pypi.tuna.tsinghua.edu.cn', '会话数': '48,628' },
      ]},
      { title: 'TLS版本', columns: ['版本', '会话数', '占比'], rows: [
        { '版本': 'TLSv1.3', '会话数': '613,286', '占比': '68.4%' },
        { '版本': 'TLSv1.2', '会话数': '268,942', '占比': '30.0%' },
        { '版本': 'TLSv1.1', '会话数': '12,864', '占比': '1.4%' },
        { '版本': 'TLSv1.0', '会话数': '1,336', '占比': '0.2%' },
      ]},
      { title: '证书颁发者', columns: ['颁发者', '数量'], rows: [
        { '颁发者': 'Let\'s Encrypt', '数量': '386,428' },
        { '颁发者': 'DigiCert', '数量': '228,642' },
        { '颁发者': 'Microsoft', '数量': '128,642' },
        { '颁发者': 'GlobalSign', '数量': '72,864' },
        { '颁发者': '其他', '数量': '79,852' },
      ]},
      { title: '异常类型', columns: ['类型', '数量'], rows: [
        { '类型': '证书即将到期', '数量': '642' },
        { '类型': '证书已过期', '数量': '128' },
        { '类型': '证书不匹配', '数量': '256' },
        { '类型': '弱密码套件', '数量': '260' },
      ]},
    ]
  },
  {
    key: 'sessions', label: 'HTTPS会话',
    columns: ['时间', 'MAC', 'MAC厂商', '用户名称', '源IP', '目标IP', 'SNI域名', 'TLS版本', '密码套件', 'ALPN', '证书指纹', 'JA3', '上行流量', '下行流量', '链路', '操作'],
    data: [
      { 时间: '2026-06-15 14:30:28', MAC: '54-2b-de-6d-10-ae', 'MAC厂商': 'NewH3CTechno...', 用户名称: '—', 源IP: '101.6.10.23:52816', 目标IP: '101.6.15.130:443', 'SNI域名': 'mirrors.tuna.tsinghua.edu.cn', 'TLS版本': 'TLSv1.3', '密码套件': 'TLS_AES_256_GCM_SHA384', ALPN: 'h2', '证书指纹': 'SHA256:ABC123...', JA3: 'a1b2c3d4...', '上行流量': '1.2 K', '下行流量': '45.6 K', 链路: 'xe4', 操作: '数据包' },
      { 时间: '2026-06-15 14:30:26', MAC: '54-2b-de-6d-10-ae', 'MAC厂商': 'NewH3CTechno...', 用户名称: '—', 源IP: '183.222.90.184:49218', 目标IP: '101.6.6.6:443', 'SNI域名': 'www.qq.com', 'TLS版本': 'TLSv1.2', '密码套件': 'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384', ALPN: 'h2', '证书指纹': 'SHA256:DEF456...', JA3: 'e5f6g7h8...', '上行流量': '864 B', '下行流量': '28.4 K', 链路: 'xe2', 操作: '数据包' },
      { 时间: '2026-06-15 14:30:24', MAC: '54-2b-de-6d-10-ae', 'MAC厂商': 'NewH3CTechno...', 用户名称: '—', 源IP: '119.186.228.221:38412', 目标IP: '166.111.5.212:443', 'SNI域名': 'pypi.tuna.tsinghua.edu.cn', 'TLS版本': 'TLSv1.2', '密码套件': 'TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256', ALPN: 'http/1.1', '证书指纹': 'SHA256:GHI789...', JA3: 'i9j0k1l2...', '上行流量': '512 B', '下行流量': '12.8 K', 链路: 'xe3', 操作: '数据包' },
    ]
  },
]
</script>
