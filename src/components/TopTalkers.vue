<template>
  <el-card v-if="topPairs.length > 0" shadow="never" class="talkers">
    <template #header>
      <div class="hdr">
        <span>Top talkers</span>
        <span class="muted small">across {{ totalRows }} loaded rows</span>
      </div>
    </template>
    <el-row :gutter="10">
      <el-col :xs="24" :md="8">
        <div class="col-title">By source IP</div>
        <ul class="rank-list">
          <li v-for="(t, i) in topSrc" :key="t.ip">
            <span class="rank">{{ i + 1 }}</span>
            <span class="mono ip">{{ prettyIP(t.ip) }}</span>
            <span class="count">{{ t.n }}</span>
          </li>
        </ul>
      </el-col>
      <el-col :xs="24" :md="8">
        <div class="col-title">By destination IP</div>
        <ul class="rank-list">
          <li v-for="(t, i) in topDst" :key="t.ip">
            <span class="rank">{{ i + 1 }}</span>
            <span class="mono ip">{{ prettyIP(t.ip) }}</span>
            <span class="count">{{ t.n }}</span>
          </li>
        </ul>
      </el-col>
      <el-col :xs="24" :md="8">
        <div class="col-title">By (src → dst)</div>
        <ul class="rank-list">
          <li v-for="(p, i) in topPairs" :key="p.key">
            <span class="rank">{{ i + 1 }}</span>
            <span class="mono pair">
              {{ prettyIP(p.src) }}
              <span class="muted">→</span>
              {{ prettyIP(p.dst) }}
            </span>
            <span class="count">{{ p.n }}</span>
          </li>
        </ul>
      </el-col>
    </el-row>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { prettyIP } from '@/utils/format'

interface Tuple {
  five_tuple: { src_ip: string; dst_ip: string }
}

const props = defineProps<{ rows: Tuple[]; topN?: number }>()

const N = computed(() => props.topN ?? 5)
const totalRows = computed(() => props.rows.length)

function topByKey<T>(items: T[], key: (t: T) => string): { key: string; n: number }[] {
  const m = new Map<string, number>()
  for (const it of items) {
    const k = key(it)
    if (!k) continue
    m.set(k, (m.get(k) ?? 0) + 1)
  }
  return [...m.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, N.value)
    .map(([key, n]) => ({ key, n }))
}

const topSrc = computed(() =>
  topByKey(props.rows, (r) => r.five_tuple.src_ip).map((e) => ({ ip: e.key, n: e.n })),
)
const topDst = computed(() =>
  topByKey(props.rows, (r) => r.five_tuple.dst_ip).map((e) => ({ ip: e.key, n: e.n })),
)
const topPairs = computed(() =>
  topByKey(props.rows, (r) => r.five_tuple.src_ip + '|' + r.five_tuple.dst_ip).map((e) => {
    const [src, dst] = e.key.split('|')
    return { key: e.key, src, dst, n: e.n }
  }),
)
</script>

<style scoped>
.talkers {
  margin-bottom: 12px;
}
.talkers :deep(.el-card__body) {
  padding: 10px 14px 12px;
}
.hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  font-size: 13px;
}
.col-title {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 6px;
}
.rank-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.rank-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 3px 0;
  font-size: 13px;
}
.rank {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  text-align: center;
  font-size: 11px;
  line-height: 18px;
  font-weight: 600;
  flex-shrink: 0;
}
.ip {
  flex: 1;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pair {
  flex: 1;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.count {
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
.small {
  font-size: 12px;
}
</style>
