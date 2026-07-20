<template>
  <div class="nv-border-card">
    <div class="nv-tabs-header om-oml-tabs-header">
      <div class="nv-tabs-nav nv-tabs-nav-wrap" role="tablist" aria-label="遥测线路">
        <button type="button" class="nv-tab" :class="{ active: tab === 'telemetry-line' }" role="tab" @click="tab = 'telemetry-line'">遥测线路</button>
        <button type="button" class="nv-tab" :class="{ active: tab === 'line-log' }" role="tab" @click="tab = 'line-log'">线路日志</button>
      </div>
      <div v-if="tab === 'telemetry-line'" class="om-oml-head-stats">
        <span>总流入：<strong>0</strong></span>
        <span>总流出：<strong>0</strong></span>
        <span>连接数：<strong>0</strong></span>
      </div>
      <div v-else class="om-oml-head-stats om-oml-head-stats-log">
        <span>总流入：<strong>0</strong></span>
        <span>总流出：<strong>0</strong></span>
        <span>连接数：<strong>0</strong></span>
      </div>
    </div>
    <div class="nv-tabs-body">
      <div class="om-oml-page">
        <!-- 遥测线路 -->
        <div class="om-oml-panel" :class="{ active: tab === 'telemetry-line' }" role="tabpanel">
          <div class="ou-toolbar om-oml-toolbar">
            <div class="om-oml-toolbar-left">
              <label class="tdh-filter-field">
                <span class="ou-toolbar-label">自动刷新</span>
                <el-select v-model="autoRefresh" size="small" style="width:90px">
                  <el-option label="关闭" :value="0" />
                  <el-option label="10 秒" :value="10000" />
                  <el-option label="30 秒" :value="30000" />
                  <el-option label="100 秒" :value="100000" />
                </el-select>
              </label>
              <label class="tdh-filter-field">
                <el-select v-model="filterType" size="small" style="width:110px">
                  <el-option label="所有类型" value="all" />
                  <el-option label="静态IP" value="static" />
                  <el-option label="DHCP" value="dhcp" />
                  <el-option label="PPPoE" value="pppoe" />
                </el-select>
              </label>
              <label class="tdh-filter-field">
                <el-select v-model="filterStatus" size="small" style="width:110px">
                  <el-option label="所有状态" value="all" />
                  <el-option label="在线" value="online" />
                  <el-option label="离线" value="offline" />
                </el-select>
              </label>
              <label class="tdh-filter-field">
                <el-select v-model="filterGroup" size="small" style="width:110px">
                  <el-option label="所有组" value="all" />
                  <el-option label="默认" value="default" />
                </el-select>
              </label>
              <el-input v-model="keyword" size="small" placeholder="关键字搜索" style="width:200px" clearable>
                <template #prefix><el-icon><Search /></el-icon></template>
              </el-input>
              <button class="ou-search-btn" @click="doSearch"><el-icon><Search /></el-icon>&nbsp;搜索</button>
            </div>
            <div class="om-oml-toolbar-right">
              <el-popover placement="bottom" :width="140" trigger="click" v-model:visible="batchPopVisible">
                <template #reference>
                  <button class="link-btn">⚙ 批量操作 ▾</button>
                </template>
                <div class="om-oml-batch-menu">
                  <div class="om-oml-batch-item" @click="batchAct('enable')">批量启用</div>
                  <div class="om-oml-batch-item" @click="batchAct('disable')">批量停用</div>
                  <div class="om-oml-batch-item" @click="batchAct('del')">批量删除</div>
                </div>
              </el-popover>
              <el-popover placement="bottom" :width="140" trigger="click" v-model:visible="addPopVisible">
                <template #reference>
                  <button class="link-btn add-btn">+ 添加</button>
                </template>
                <div class="om-oml-add-menu">
                  <div class="om-oml-add-item" @click="openSingleAdd"><el-icon><Plus /></el-icon>&nbsp;单个添加</div>
                  <div class="om-oml-add-item" @click="openBatchAdd"><el-icon><Plus /></el-icon>&nbsp;批量添加</div>
                </div>
              </el-popover>
              <button class="link-btn" @click="doImport">☁ 导入</button>
              <button class="link-btn" @click="doExport">☁ 导出</button>
              <button class="link-btn" title="列设置" @click="doColSet">☰</button>
            </div>
          </div>
          <div class="ou-table-wrap om-oml-table-wrap">
            <table class="ou-table om-oml-table">
              <thead>
                <tr>
                  <th class="col-check"><el-checkbox v-model="selectAll" @change="onSelectAll" /></th>
                  <th class="col-id">ID <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th class="col-name">名称 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th class="col-iface">网卡 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th class="col-status">状态</th>
                  <th class="col-ip">IP</th>
                  <th class="col-gw">线路网关</th>
                  <th class="col-mtu">MTU</th>
                  <th class="col-vlan">VLAN</th>
                  <th class="col-dns">DNS牵引/失败 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th class="col-rate">流入速率 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th class="col-rate">流出速率 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th class="col-conn">连接数 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th class="col-time">连接时间 <el-icon class="sort-icon"><Sort /></el-icon></th>
                  <th class="col-info">其他信息</th>
                  <th class="col-actions">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in pagedRows" :key="row.id">
                  <td class="col-check"><el-checkbox v-model="row.checked" /></td>
                  <td>{{ (page - 1) * pageSize + i + 1 }}</td>
                  <td><span class="nvt-link" @click="editRow(row)">{{ row.name }}</span></td>
                  <td>{{ row.iface }}</td>
                  <td>
                    <span class="nvt-tag" :class="row.status === '在线' ? 'nvt-tag-green' : 'nvt-tag-silver'">
                      <el-icon style="margin-right:3px;font-size:11px"><component :is="row.status === '在线' ? CircleCheck : CircleClose" /></el-icon>
                      {{ row.status }}
                    </span>
                  </td>
                  <td><span class="nvt-link" @click="openIpProfile(row.ip)">{{ row.ip }}</span></td>
                  <td>{{ row.gw }}</td>
                  <td>{{ row.mtu }}</td>
                  <td>{{ row.vlan }}</td>
                  <td>{{ row.dns }}</td>
                  <td class="ou-num">{{ row.inRate }}</td>
                  <td class="ou-num">{{ row.outRate }}</td>
                  <td class="ou-num">{{ row.conns.toLocaleString() }}</td>
                  <td>{{ row.time }}</td>
                  <td>{{ row.info }}</td>
                  <td class="col-actions">
                    <button class="link-btn" @click="editRow(row)">编辑</button>
                    <button class="link-btn" @click="delRow(row)">删除</button>
                  </td>
                </tr>
                <tr v-if="pagedRows.length === 0">
                  <td colspan="16" class="ou-empty">无数据</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="ou-footer">
            <div class="ou-footer-left">
              <div class="ou-pager">
                <button class="ou-page-btn" :disabled="page <= 1" @click="page > 1 && page--">‹</button>
                <button v-for="pg in pageArr" :key="pg" class="ou-page-btn" :class="{ active: pg === page }" @click="page = pg">{{ pg }}</button>
                <button class="ou-page-btn" :disabled="page >= totalPages" @click="page < totalPages && page++">›</button>
              </div>
              <label class="ou-page-goto">
                到第
                <input v-model.number="gotoPage" class="ou-page-goto-input" type="text" />
                页
                <button class="ou-page-goto-btn" @click="goToPage">确定</button>
              </label>
            </div>
            <div class="ou-footer-right">
              <span>共 {{ filteredRows.length }} 条</span>
              <el-select v-model="pageSize" size="small" style="width:110px">
                <el-option :value="20" label="20 条/页" />
                <el-option :value="50" label="50 条/页" />
                <el-option :value="100" label="100 条/页" />
              </el-select>
            </div>
          </div>
        </div>

        <!-- 线路日志 -->
        <div class="om-oml-panel" :class="{ active: tab === 'line-log' }" role="tabpanel">
          <div class="ou-toolbar om-oml-toolbar">
            <div class="om-oml-toolbar-left">
              <el-input v-model="logKeyword" size="small" placeholder="关键字搜索" style="width:200px" clearable>
                <template #prefix><el-icon><Search /></el-icon></template>
              </el-input>
              <button class="ou-search-btn" @click="doLogSearch"><el-icon><Search /></el-icon></button>
            </div>
            <div class="om-oml-toolbar-right">
              <button class="link-btn" @click="doExport">⬇ 导出</button>
            </div>
          </div>
          <div class="ou-table-wrap om-oml-table-wrap">
            <table class="ou-table om-oml-log-table">
              <thead>
                <tr>
                  <th class="col-idx" style="width:80px">序号</th>
                  <th class="col-time" style="min-width:200px">时间</th>
                  <th class="col-line" style="min-width:200px">线路</th>
                  <th class="col-content">内容</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in pagedLogRows" :key="i">
                  <td class="col-idx">{{ (logPage - 1) * logPageSize + i + 1 }}</td>
                  <td>{{ row.time }}</td>
                  <td>{{ row.line }}</td>
                  <td>{{ row.content }}</td>
                </tr>
                <tr v-if="pagedLogRows.length === 0">
                  <td colspan="4" class="ou-empty">无数据</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="ou-footer">
            <div class="ou-footer-left">
              <div class="ou-pager">
                <button class="ou-page-btn" :disabled="logPage <= 1" @click="logPage > 1 && logPage--">‹</button>
                <button v-for="pg in logPageArr" :key="pg" class="ou-page-btn" :class="{ active: pg === logPage }" @click="logPage = pg">{{ pg }}</button>
                <button class="ou-page-btn" :disabled="logPage >= logTotalPages" @click="logPage < logTotalPages && logPage++">›</button>
              </div>
              <label class="ou-page-goto">
                到第
                <input v-model.number="logGotoPage" class="ou-page-goto-input" type="text" />
                页
                <button class="ou-page-goto-btn" @click="goToLogPage">确定</button>
              </label>
            </div>
            <div class="ou-footer-right">
              <span>共 {{ filteredLogRows.length }} 条</span>
              <el-select v-model="logPageSize" size="small" style="width:110px">
                <el-option :value="20" label="20 条/页" />
                <el-option :value="50" label="50 条/页" />
                <el-option :value="100" label="100 条/页" />
              </el-select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 单个添加 弹窗 ==================== -->
    <el-dialog v-model="addSingleVisible" title="添加" width="640px" :close-on-click-modal="false" destroy-on-close class="om-oml-add-dialog">
      <div class="om-oml-form">
        <div class="om-oml-row">
          <div class="om-oml-lbl"><span class="req">*</span>名称</div>
          <div class="om-oml-ctrl"><el-input v-model="singleForm.name" size="small" /></div>
        </div>
        <div class="om-oml-row">
          <div class="om-oml-lbl">线路类型</div>
          <div class="om-oml-ctrl"><el-select v-model="singleForm.lineType" placeholder="请选择" size="small" style="width:100%"><el-option label="静态IP" value="static" /><el-option label="DHCP" value="dhcp" /><el-option label="PPPoE" value="pppoe" /></el-select></div>
        </div>
        <div class="om-oml-row">
          <div class="om-oml-lbl">网卡/承载线路</div>
          <div class="om-oml-ctrl"><el-select v-model="singleForm.iface" placeholder="请选择" size="small" style="width:100%"><el-option label="eth0" value="eth0" /><el-option label="eth1" value="eth1" /><el-option label="eth2" value="eth2" /></el-select></div>
        </div>
        <div class="om-oml-row">
          <div class="om-oml-lbl">备注</div>
          <div class="om-oml-ctrl"><el-input v-model="singleForm.remark" size="small" /></div>
        </div>

        <div class="om-oml-section">
          <div class="om-oml-section-title">静态IP参数</div>
        </div>
        <div class="om-oml-row">
          <div class="om-oml-lbl">IP</div>
          <div class="om-oml-ctrl"><el-input v-model="singleForm.ip" size="small" /></div>
        </div>
        <div class="om-oml-row">
          <div class="om-oml-lbl">网关类型</div>
          <div class="om-oml-ctrl om-oml-ctrl-flex">
            <el-select v-model="singleForm.gwType" size="small" style="width:140px">
              <el-option label="正常网关" value="normal" />
              <el-option label="互联地址" value="interconnect" />
            </el-select>
            <span class="om-oml-hint">当网关地址是某条用于互联的线路的地址时，请选择互联地址</span>
          </div>
        </div>
        <div class="om-oml-row">
          <div class="om-oml-lbl">网关地址</div>
          <div class="om-oml-ctrl"><el-input v-model="singleForm.gw" size="small" /></div>
        </div>
        <div class="om-oml-row">
          <div class="om-oml-lbl">DNS服务器</div>
          <div class="om-oml-ctrl"><el-input v-model="singleForm.dns" size="small" /></div>
        </div>
        <div class="om-oml-row">
          <div class="om-oml-lbl">NAT地址池</div>
          <div class="om-oml-ctrl om-oml-ctrl-stack">
            <el-input v-model="singleForm.natPool" size="small" />
            <span class="om-oml-hint">NAT时用的地址，不填或0.0.0.0则使用线路IP</span>
          </div>
        </div>

        <div class="om-oml-section" @click="advOpen = !advOpen">
          <div class="om-oml-section-title">
            高级
            <el-icon style="margin-left:4px"><component :is="advOpen ? ArrowUp : ArrowDown" /></el-icon>
          </div>
        </div>
        <template v-if="advOpen">
          <div class="om-oml-row">
            <div class="om-oml-lbl">心跳服务器1</div>
            <div class="om-oml-ctrl om-oml-ctrl-flex">
              <el-input v-model="singleForm.heartbeat1" size="small" />
              <span class="om-oml-hint">通过ping此IP来对线路做健康检查，为空表示关闭</span>
            </div>
          </div>
          <div class="om-oml-row">
            <div class="om-oml-lbl">心跳服务器2</div>
            <div class="om-oml-ctrl om-oml-ctrl-flex">
              <el-input v-model="singleForm.heartbeat2" size="small" />
              <span class="om-oml-hint">同上，任何一个IP通都表示心跳正常</span>
            </div>
          </div>
          <div class="om-oml-row">
            <div class="om-oml-lbl">最大时延</div>
            <div class="om-oml-ctrl om-oml-ctrl-flex">
              <el-input-number v-model="singleForm.maxLat" :min="0" :step="10" size="small" style="width:140px" controls-position="right" />
              <span class="om-oml-hint">心跳时延连续 5 次超出则心跳失效；0 表示忽略</span>
            </div>
          </div>
          <div class="om-oml-row">
            <div class="om-oml-lbl">MTU</div>
            <div class="om-oml-ctrl"><el-input-number v-model="singleForm.mtu" :min="0" :max="9000" size="small" controls-position="right" /></div>
          </div>
          <div class="om-oml-row">
            <div class="om-oml-lbl">外层/内层VLAN</div>
            <div class="om-oml-ctrl om-oml-ctrl-flex">
              <el-input-number v-model="singleForm.outerVlan" :min="0" :max="4095" size="small" controls-position="right" style="width:90px" />
              <span>/</span>
              <el-input-number v-model="singleForm.innerVlan" :min="0" :max="4095" size="small" controls-position="right" style="width:90px" />
              <span class="om-oml-hint">0~4095, 0 表示无VLAN</span>
            </div>
          </div>
          <div class="om-oml-row">
            <div class="om-oml-lbl">克隆MAC</div>
            <div class="om-oml-ctrl om-oml-ctrl-flex">
              <el-input v-model="singleForm.cloneMac" size="small" placeholder="00-00-00-00-00-00" />
              <span class="om-oml-hint">前4字节不能为</span>
            </div>
          </div>
        </template>
      </div>
      <template #footer>
        <el-button type="primary" size="small" @click="submitSingle">确定</el-button>
        <el-button size="small" @click="addSingleVisible = false">取消</el-button>
      </template>
    </el-dialog>

    <!-- ==================== 批量添加 弹窗 ==================== -->
    <el-dialog v-model="addBatchVisible" title="批量添加" width="640px" :close-on-click-modal="false" destroy-on-close class="om-oml-add-dialog">
      <div class="om-oml-form">
        <div class="om-oml-row">
          <div class="om-oml-lbl"><span class="req">*</span>名称</div>
          <div class="om-oml-ctrl om-oml-ctrl-flex">
            <el-input v-model="batchForm.name" size="small" />
            <span class="om-oml-hint">后缀从1开始自动递增</span>
          </div>
        </div>
        <div class="om-oml-row">
          <div class="om-oml-lbl">线路类型</div>
          <div class="om-oml-ctrl"><el-select v-model="batchForm.lineType" size="small" style="width:100%"><el-option label="静态IP" value="static" /><el-option label="DHCP" value="dhcp" /></el-select></div>
        </div>
        <div class="om-oml-row">
          <div class="om-oml-lbl">网卡</div>
          <div class="om-oml-ctrl om-oml-ctrl-flex">
            <el-select v-model="batchForm.iface" placeholder="请选择" size="small" style="width:200px"><el-option label="eth0" value="eth0" /><el-option label="eth1" value="eth1" /><el-option label="eth2" value="eth2" /></el-select>
            <span class="om-oml-hint">在"系统概况->网络接口"中，将网卡设置为接外网</span>
          </div>
        </div>
        <div class="om-oml-row">
          <div class="om-oml-lbl">名称重复时</div>
          <div class="om-oml-ctrl"><el-select v-model="batchForm.dupAction" size="small" style="width:100%"><el-option label="停止添加" value="stop" /><el-option label="覆盖" value="overwrite" /><el-option label="跳过" value="skip" /></el-select></div>
        </div>

        <div class="om-oml-section">
          <div class="om-oml-section-title">静态IP参数</div>
        </div>
        <div class="om-oml-row">
          <div class="om-oml-lbl">IP</div>
          <div class="om-oml-ctrl om-oml-ctrl-flex">
            <el-input v-model="batchForm.ip" size="small" />
            <span class="om-oml-hint">IP自动递增</span>
          </div>
        </div>
        <div class="om-oml-row">
          <div class="om-oml-lbl">网关类型</div>
          <div class="om-oml-ctrl om-oml-ctrl-flex">
            <el-select v-model="batchForm.gwType" size="small" style="width:140px">
              <el-option label="正常网关" value="normal" />
              <el-option label="互联地址" value="interconnect" />
            </el-select>
            <span class="om-oml-hint">当网关地址是某条用于互联的线路的地址时，请选择互联地址</span>
          </div>
        </div>
        <div class="om-oml-row">
          <div class="om-oml-lbl">网关地址</div>
          <div class="om-oml-ctrl"><el-input v-model="batchForm.gw" size="small" /></div>
        </div>
        <div class="om-oml-row">
          <div class="om-oml-lbl">DNS服务器</div>
          <div class="om-oml-ctrl"><el-input v-model="batchForm.dns" size="small" /></div>
        </div>
        <div class="om-oml-row">
          <div class="om-oml-lbl">添加条数</div>
          <div class="om-oml-ctrl om-oml-ctrl-flex">
            <el-input-number v-model="batchForm.count" :min="1" :max="4000" :step="1" size="small" controls-position="right" style="width:200px" />
            <span class="om-oml-hint">最大 4000</span>
          </div>
        </div>

        <div class="om-oml-section" @click="batchAdvOpen = !batchAdvOpen">
          <div class="om-oml-section-title">
            高级
            <el-icon style="margin-left:4px"><component :is="batchAdvOpen ? ArrowUp : ArrowDown" /></el-icon>
          </div>
        </div>
        <template v-if="batchAdvOpen">
          <div class="om-oml-row">
            <div class="om-oml-lbl">MTU</div>
            <div class="om-oml-ctrl"><el-input-number v-model="batchForm.mtu" :min="0" :max="9000" size="small" controls-position="right" /></div>
          </div>
          <div class="om-oml-row">
            <div class="om-oml-lbl">心跳服务器1</div>
            <div class="om-oml-ctrl om-oml-ctrl-flex">
              <el-input v-model="batchForm.heartbeat1" size="small" placeholder="0.0.0.0" />
              <span class="om-oml-hint">通过ping此IP来对线路做健康检查, 0.0.0.0 表示关闭</span>
            </div>
          </div>
          <div class="om-oml-row">
            <div class="om-oml-lbl">心跳服务器2</div>
            <div class="om-oml-ctrl om-oml-ctrl-flex">
              <el-input v-model="batchForm.heartbeat2" size="small" placeholder="0.0.0.0" />
              <span class="om-oml-hint">同上，任何一个IP通都表示心跳正常</span>
            </div>
          </div>
          <div class="om-oml-row">
            <div class="om-oml-lbl">外层VLAN</div>
            <div class="om-oml-ctrl om-oml-ctrl-flex">
              <el-input-number v-model="batchForm.outerVlan" :min="0" :max="4095" size="small" controls-position="right" style="width:200px" />
              <el-checkbox v-model="batchForm.outerVlanInc">递增</el-checkbox>
            </div>
          </div>
          <div class="om-oml-row">
            <div class="om-oml-lbl">内层VLAN</div>
            <div class="om-oml-ctrl om-oml-ctrl-flex">
              <el-input-number v-model="batchForm.innerVlan" :min="0" :max="4095" size="small" controls-position="right" style="width:200px" />
              <el-checkbox v-model="batchForm.innerVlanInc">递增</el-checkbox>
            </div>
          </div>
          <div class="om-oml-row">
            <div class="om-oml-lbl">外网Ping不应答</div>
            <div class="om-oml-ctrl">
              <el-switch v-model="batchForm.noPing" active-text="开启" inactive-text="关闭" />
            </div>
          </div>
        </template>
      </div>
      <template #footer>
        <el-button type="primary" size="small" @click="submitBatch">确定</el-button>
        <el-button size="small" @click="addBatchVisible = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Search, Sort, Plus, CircleCheck, CircleClose, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import '@/views/netvisor/nv-shared.css'

const tab = ref('telemetry-line')

// ══════════════════════════════════════════════════════════════
// 遥测线路
// ═══════════════════════════════════════════════════════════
const autoRefresh = ref(100000)
const filterType = ref('all')
const filterStatus = ref('all')
const filterGroup = ref('all')
const keyword = ref('')
const page = ref(1)
const pageSize = ref(20)
const gotoPage = ref(1)
const selectAll = ref(false)
const batchPopVisible = ref(false)
const addPopVisible = ref(false)

interface LineRow {
  id: number
  name: string
  iface: string
  status: '在线' | '离线'
  ip: string
  gw: string
  mtu: number
  vlan: number
  dns: string
  inRate: string
  outRate: string
  conns: number
  time: string
  info: string
  checked: boolean
}

const lineRows = ref<LineRow[]>([
  { id: 1, name: '链路A', iface: 'eth0', status: '在线', ip: '192.168.1.1/24', gw: '192.168.1.254', mtu: 1500, vlan: 10, dns: '12864/0', inRate: '12.5 Mbps', outRate: '45.3 Mbps', conns: 4286, time: '2026-06-15 10:30:00', info: '—', checked: false },
  { id: 2, name: '链路B', iface: 'eth1', status: '在线', ip: '10.0.0.1/16', gw: '10.0.0.254', mtu: 1500, vlan: 20, dns: '8642/0', inRate: '8.2 Mbps', outRate: '32.1 Mbps', conns: 2864, time: '2026-06-15 10:30:00', info: '—', checked: false },
  { id: 3, name: '链路C', iface: 'eth2', status: '离线', ip: '172.16.0.1/12', gw: '172.16.0.254', mtu: 1500, vlan: 30, dns: '0/0', inRate: '0', outRate: '0', conns: 0, time: '—', info: '链路故障', checked: false },
])

const filteredRows = computed(() => {
  return lineRows.value.filter(r => {
    if (filterStatus.value === 'online' && r.status !== '在线') return false
    if (filterStatus.value === 'offline' && r.status !== '离线') return false
    if (keyword.value) {
      const k = keyword.value.toLowerCase()
      if (!r.name.toLowerCase().includes(k) && !r.ip.toLowerCase().includes(k) && !r.gw.toLowerCase().includes(k)) return false
    }
    return true
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / pageSize.value)))
const pageArr = computed(() => {
  const t = totalPages.value
  if (t <= 5) return Array.from({ length: t }, (_, i) => i + 1)
  const arr: number[] = []
  const cur = page.value
  if (cur <= 3) arr.push(1, 2, 3, 4, 5)
  else if (cur >= t - 2) arr.push(t - 4, t - 3, t - 2, t - 1, t)
  else arr.push(cur - 2, cur - 1, cur, cur + 1, cur + 2)
  return arr
})
const pagedRows = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredRows.value.slice(start, start + pageSize.value)
})

function doSearch() { page.value = 1 }
function onSelectAll(v: boolean) { lineRows.value.forEach(r => r.checked = v) }
function goToPage() {
  const p = Number(gotoPage.value)
  if (p >= 1 && p <= totalPages.value) page.value = p
}
function batchAct(act: string) {
  batchPopVisible.value = false
  const cnt = lineRows.value.filter(r => r.checked).length
  if (cnt === 0) { ElMessage.warning('请先勾选条目'); return }
  if (act === 'del') {
    ElMessageBox.confirm(`确定删除已选中的 ${cnt} 条线路吗？`, '提示', { type: 'warning' })
      .then(() => {
        for (let i = lineRows.value.length - 1; i >= 0; i--) {
          if (lineRows.value[i].checked) lineRows.value.splice(i, 1)
        }
        ElMessage.success('已删除（Mock）')
      }).catch(() => {})
  } else {
    ElMessage.success(`已对 ${cnt} 条线路执行${act === 'enable' ? '启用' : '停用'}（Mock）`)
  }
}
function doImport() { ElMessage.info('导入（Mock）') }
function doExport() { ElMessage.info('导出（Mock）') }
function doColSet() { ElMessage.info('列设置（Mock）') }
function openIpProfile(ip: string) { ElMessage.info(`打开IP画像：${ip}（Mock）`) }
function editRow(r: LineRow) {
  addSingleVisible.value = true
  Object.assign(singleForm, {
    name: r.name, lineType: 'static', iface: r.iface, remark: r.info,
    ip: r.ip, gwType: 'normal', gw: r.gw, dns: r.dns, natPool: '0.0.0.0',
    heartbeat1: '', heartbeat2: '', maxLat: 0, mtu: r.mtu, outerVlan: r.vlan, innerVlan: 0, cloneMac: '00-00-00-00-00-00',
  })
}
function delRow(r: LineRow) {
  ElMessageBox.confirm(`确定删除线路 ${r.name} 吗？`, '提示', { type: 'warning' })
    .then(() => {
      const i = lineRows.value.findIndex(x => x.id === r.id)
      if (i > -1) lineRows.value.splice(i, 1)
      ElMessage.success('已删除（Mock）')
    }).catch(() => {})
}

// ══════════════════════════════════════════════════════════════
// 线路日志
// ═══════════════════════════════════════════════════════════
const logKeyword = ref('')
const logPage = ref(1)
const logPageSize = ref(20)

const logRows = ref([
  { time: '2026-06-15 14:30:28', line: '链路A', content: 'DNS牵引成功，IP: 192.168.1.100' },
  { time: '2026-06-15 14:30:15', line: '链路B', content: 'DNS牵引成功，IP: 10.0.0.100' },
  { time: '2026-06-15 14:28:42', line: '链路C', content: '链路断开，原因: 端口故障' },
  { time: '2026-06-15 14:25:00', line: '链路A', content: '流量超过阈值，当前速率: 50.2 Mbps' },
  { time: '2026-06-15 14:20:00', line: '链路B', content: '心跳检测成功' },
  { time: '2026-06-15 14:15:00', line: '链路A', content: '线路状态变更：离线 -> 在线' },
  { time: '2026-06-15 14:10:00', line: '链路C', content: '线路状态变更：在线 -> 离线' },
])

const filteredLogRows = computed(() => {
  if (!logKeyword.value) return logRows.value
  const k = logKeyword.value.toLowerCase()
  return logRows.value.filter(r => r.line.toLowerCase().includes(k) || r.content.toLowerCase().includes(k))
})
const logTotalPages = computed(() => Math.max(1, Math.ceil(filteredLogRows.value.length / logPageSize.value)))
const logPageArr = computed(() => {
  const t = logTotalPages.value
  if (t <= 5) return Array.from({ length: t }, (_, i) => i + 1)
  const arr: number[] = []
  const cur = logPage.value
  if (cur <= 3) arr.push(1, 2, 3, 4, 5)
  else if (cur >= t - 2) arr.push(t - 4, t - 3, t - 2, t - 1, t)
  else arr.push(cur - 2, cur - 1, cur, cur + 1, cur + 2)
  return arr
})
const pagedLogRows = computed(() => {
  const start = (logPage.value - 1) * logPageSize.value
  return filteredLogRows.value.slice(start, start + logPageSize.value)
})
function doLogSearch() { logPage.value = 1 }

// ══════════════════════════════════════════════════════════════
// 单个添加 弹窗
// ═══════════════════════════════════════════════════════════
const addSingleVisible = ref(false)
const advOpen = ref(true)
const singleForm = reactive({
  name: '',
  lineType: '',
  iface: '',
  remark: '',
  ip: '',
  gwType: 'normal',
  gw: '',
  dns: '',
  natPool: '0.0.0.0',
  heartbeat1: '',
  heartbeat2: '',
  maxLat: 0,
  mtu: 1500,
  outerVlan: 0,
  innerVlan: 0,
  cloneMac: '00-00-00-00-00-00',
})

function openSingleAdd() {
  addPopVisible.value = false
  Object.assign(singleForm, {
    name: '', lineType: '', iface: '', remark: '',
    ip: '', gwType: 'normal', gw: '', dns: '', natPool: '0.0.0.0',
    heartbeat1: '', heartbeat2: '', maxLat: 0, mtu: 1500, outerVlan: 0, innerVlan: 0, cloneMac: '00-00-00-00-00-00',
  })
  addSingleVisible.value = true
}
function submitSingle() {
  if (!singleForm.name) { ElMessage.warning('请输入名称'); return }
  lineRows.value.unshift({
    id: Date.now(), name: singleForm.name, iface: singleForm.iface || 'eth0',
    status: '在线', ip: singleForm.ip || '0.0.0.0/24', gw: singleForm.gw || '0.0.0.0',
    mtu: singleForm.mtu, vlan: singleForm.outerVlan || singleForm.innerVlan,
    dns: '0/0', inRate: '0', outRate: '0', conns: 0,
    time: new Date().toISOString().replace('T', ' ').slice(0, 19),
    info: singleForm.remark || '—', checked: false,
  })
  ElMessage.success('已添加（Mock）')
  addSingleVisible.value = false
}

// ══════════════════════════════════════════════════════════════
// 批量添加 弹窗
// ═══════════════════════════════════════════════════════════
const addBatchVisible = ref(false)
const batchAdvOpen = ref(true)
const batchForm = reactive({
  name: 'wan_',
  lineType: 'static',
  iface: '',
  dupAction: 'stop',
  ip: '',
  gwType: 'normal',
  gw: '',
  dns: '',
  count: 100,
  mtu: 1500,
  heartbeat1: '0.0.0.0',
  heartbeat2: '0.0.0.0',
  outerVlan: 0,
  innerVlan: 0,
  outerVlanInc: false,
  innerVlanInc: false,
  noPing: false,
})

function openBatchAdd() {
  addPopVisible.value = false
  Object.assign(batchForm, {
    name: 'wan_', lineType: 'static', iface: '', dupAction: 'stop',
    ip: '', gwType: 'normal', gw: '', dns: '', count: 100,
    mtu: 1500, heartbeat1: '0.0.0.0', heartbeat2: '0.0.0.0',
    outerVlan: 0, innerVlan: 0, outerVlanInc: false, innerVlanInc: false, noPing: false,
  })
  addBatchVisible.value = true
}
function submitBatch() {
  if (!batchForm.name) { ElMessage.warning('请输入名称前缀'); return }
  if (!batchForm.iface) { ElMessage.warning('请选择网卡'); return }
  const n = Math.max(1, Math.min(4000, batchForm.count || 1))
  for (let i = 0; i < n; i++) {
    const suffix = i + 1
    lineRows.value.unshift({
      id: Date.now() + i,
      name: `${batchForm.name}${suffix}`,
      iface: batchForm.iface,
      status: '在线',
      ip: batchForm.ip ? batchForm.ip.replace(/\d+$/, String(Number(batchForm.ip.match(/\d+$/)?.[0] || 0) + i)) : `10.0.${i / 256 | 0}.${i % 256}/24`,
      gw: batchForm.gw || '0.0.0.0',
      mtu: batchForm.mtu,
      vlan: batchForm.outerVlanInc ? batchForm.outerVlan + i : batchForm.outerVlan,
      dns: '0/0',
      inRate: '0', outRate: '0', conns: 0,
      time: new Date().toISOString().replace('T', ' ').slice(0, 19),
      info: '批量添加', checked: false,
    })
  }
  ElMessage.success(`已批量添加 ${n} 条线路（Mock）`)
  addBatchVisible.value = false
}
</script>

<style scoped>
.nv-border-card { display:flex; flex-direction:column; height:100%; min-height:0; border:1px solid #e4e7ed; border-radius:4px; background:#fff; overflow:hidden; }
.nv-tabs-header { flex-shrink:0; padding:0 16px; border-bottom:1px solid #e4e7ed; background:#fafafa; }
.om-oml-tabs-header { display:flex; align-items:center; justify-content:space-between; }
.nv-tabs-nav { display:flex; }
.nv-tab { position:relative; padding:12px 20px; border:none; background:transparent; font-size:14px; font-weight:600; color:#606266; cursor:pointer; }
.nv-tab.active { color:#409eff; }
.nv-tab.active::after { content:''; position:absolute; bottom:0; left:20px; right:20px; height:2px; background:#409eff; }
.om-oml-head-stats { display:flex; gap:16px; padding-right:16px; font-size:13px; color:#606266; }
.om-oml-head-stats strong { color:#303133; font-weight:600; margin:0 4px; }
.om-oml-head-stats-log { padding-right:120px; }
.nv-tabs-body { flex:1; min-height:0; overflow:hidden; }

.om-oml-page { display:flex; flex-direction:column; height:100%; }
.om-oml-panel { display:none; flex-direction:column; flex:1; min-height:0; }
.om-oml-panel.active { display:flex; }
.om-oml-toolbar { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; padding:10px 14px; border-bottom:1px solid #ebeef5; }
.om-oml-toolbar-left, .om-oml-toolbar-right { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.om-oml-toolbar-right { margin-left:auto; }

.ou-table-wrap { flex:1; overflow:auto; }
.ou-table { width:100%; border-collapse:collapse; font-size:12px; }
.ou-table th { background:#fafbfc; border-bottom:1px solid #ebeef5; padding:8px 10px; text-align:left; font-weight:600; color:#606266; white-space:nowrap; }
.ou-table td { border-bottom:1px solid #f0f2f5; padding:7px 10px; color:#303133; }
.ou-table .ou-num { text-align:right; }
.sort-icon { font-size:11px; color:#c0c4cc; margin-left:2px; vertical-align:middle; }
.ou-empty { text-align:center; color:#909399; padding:24px 10px !important; }
.ou-table-wrap { flex:1; min-height:0; }

.col-check { width:40px; text-align:center; }
.col-id { width:60px; }
.col-status { width:80px; }
.col-mtu, .col-vlan { width:60px; text-align:right; }
.col-info { min-width:120px; }
.col-actions { width:110px; white-space:nowrap; text-align:center; }
.col-idx { width:60px; text-align:center; }
.col-time { min-width:140px; }
.col-line { min-width:120px; }
.col-content { min-width:300px; }

.nvt-link { color:#409eff; cursor:pointer; text-decoration:underline; }
.nvt-tag { display:inline-flex; align-items:center; padding:2px 8px; font-size:11px; border-radius:3px; font-weight:500; }
.nvt-tag-green { background:#f0f9eb; color:#67c23a; border:1px solid #b3e19d; }
.nvt-tag-silver { background:#f4f4f5; color:#909399; border:1px solid #d3d4d6; }

.ou-footer { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; border-top:1px solid #ebeef5; font-size:12px; color:#606266; gap:8px; flex-wrap:wrap; }
.ou-footer-left { display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
.ou-footer-right { display:flex; align-items:center; gap:10px; }
.ou-pager { display:flex; gap:4px; }
.ou-page-btn { min-width:28px; height:28px; border:1px solid #dcdfe6; border-radius:4px; background:#fff; font-size:12px; cursor:pointer; }
.ou-page-btn.active { background:#409eff; color:#fff; border-color:#409eff; }
.ou-page-btn:disabled { opacity:.55; cursor:not-allowed; }
.ou-page-goto { display:inline-flex; align-items:center; gap:4px; }
.ou-page-goto-input { width:40px; height:24px; text-align:center; border:1px solid #dcdfe6; border-radius:3px; font-size:12px; }
.ou-page-goto-btn { height:24px; padding:0 8px; border:1px solid #dcdfe6; border-radius:3px; background:#fff; font-size:12px; cursor:pointer; }

.ou-search-btn { height:30px; padding:0 14px; border:1px solid #409eff; border-radius:4px; background:#409eff; color:#fff; font-size:13px; cursor:pointer; display:inline-flex; align-items:center; }
.secondary { height:30px; padding:0 14px; border:1px solid #dcdfe6; border-radius:4px; background:#fff; color:#606266; font-size:13px; cursor:pointer; }
.link-btn { border:none; background:transparent; color:#409eff; font-size:13px; cursor:pointer; padding:4px 6px; display:inline-flex; align-items:center; }
.link-btn.add-btn { color:#f56c6c; font-weight:500; }

/* 弹窗表单 */
.om-oml-form { padding:4px 8px; max-height:60vh; overflow-y:auto; }
.om-oml-row { display:flex; align-items:center; gap:14px; padding:7px 0; }
.om-oml-lbl { width:110px; text-align:right; color:#606266; font-size:13px; flex-shrink:0; }
.om-oml-ctrl { flex:1; }
.om-oml-ctrl-flex { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.om-oml-ctrl-stack { display:flex; flex-direction:column; gap:4px; }
.om-oml-hint { color:#909399; font-size:12px; }
.req { color:#f56c6c; margin-right:2px; }

.om-oml-section { display:flex; align-items:center; margin:14px 0 8px; cursor:pointer; }
.om-oml-section-title { display:inline-flex; align-items:center; padding:4px 14px; color:#409eff; font-size:13px; font-weight:500; position:relative; }
.om-oml-section-title::before, .om-oml-section-title::after { content:''; flex:1; height:1px; background:linear-gradient(to right, transparent, #dcdfe6); margin:0 8px; }
.om-oml-section::before, .om-oml-section::after { content:''; flex:1; height:1px; background:#ebeef5; }

/* 下拉菜单 */
.om-oml-batch-menu, .om-oml-add-menu { padding:4px 0; }
.om-oml-batch-item, .om-oml-add-item { padding:8px 14px; font-size:13px; color:#303133; cursor:pointer; }
.om-oml-batch-item:hover, .om-oml-add-item:hover { background:#f5f7fa; color:#409eff; }
</style>
