<template>
  <div class="nvt-page">
    <div class="nvt-card">
      <div class="nvt-card-header">
        <span>在线用户</span>
        <span style="font-size: 13px; font-weight: 400; color: #909399;">
          共 {{ mockData.length }} 个在线用户
        </span>
      </div>
      <div class="nvt-card-body">
        <table class="nvt-table-wrap">
          <thead>
            <tr>
              <th>序号</th>
              <th>IP地址</th>
              <th>MAC地址</th>
              <th>用户名</th>
              <th>认证方式</th>
              <th>登录时间</th>
              <th>在线时长</th>
              <th>上行流量</th>
              <th>下行流量</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(user, index) in mockData" :key="user.key">
              <td>{{ index + 1 }}</td>
              <td>{{ user.ip }}</td>
              <td>{{ user.mac }}</td>
              <td>{{ user.user }}</td>
              <td>
                <span class="nvt-tag" :class="getAuthClass(user.authMethod)">
                  {{ user.authMethod }}
                </span>
              </td>
              <td>{{ user.loginTime }}</td>
              <td>{{ user.duration }}</td>
              <td>{{ user.upstream }}</td>
              <td>{{ user.downstream }}</td>
              <td>
                <span class="nvt-tag" :class="user.status === 'active' ? 'nvt-tag-green' : 'nvt-tag-default'">
                  {{ user.status === 'active' ? '活跃' : '空闲' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import './nv-test-shared.css'

const mockData = ref(
  Array.from({ length: 30 }, (_, i) => ({
    key: String(i + 1),
    ip: `192.168.1.${100 + i}`,
    mac: `00:1A:2B:3C:4D:${(50 + i).toString(16).toUpperCase().padStart(2, '0')}`,
    user: `用户${i + 1}`,
    authMethod: ['802.1x', 'Portal', 'MAC认证', '静态绑定'][i % 4],
    loginTime: `2026-07-06 ${String(8 + Math.floor(i / 4)).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}:00`,
    duration: `${Math.floor(Math.random() * 10) + 1}小时${Math.floor(Math.random() * 60)}分钟`,
    upstream: `${(Math.random() * 50 + 1).toFixed(1)} MB`,
    downstream: `${(Math.random() * 200 + 10).toFixed(1)} MB`,
    status: i % 7 === 0 ? 'idle' : 'active',
  }))
)

const getAuthClass = (method) => {
  const map = {
    '802.1x': 'blue',
    'Portal': 'green',
    'MAC认证': 'orange',
    '静态绑定': 'default',
  }
  return 'nvt-tag-' + (map[method] || 'default')
}
</script>
