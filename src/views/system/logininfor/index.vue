<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" label-width="80px" size="small">
      <dc-search :isMoreShow.sync="isMoreShow">
        <el-form-item label="登录地址：" prop="ipaddr">
          <el-input v-model="queryParams.ipaddr" placeholder="请输入" clearable @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item label="用户名称：" prop="userName">
          <el-input v-model="queryParams.userName" placeholder="请输入" clearable @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item label="状态：" prop="status">
          <el-select v-model="queryParams.status" placeholder="请选择" clearable @change="handleQuery">
            <el-option v-for="dict in dict.type.sys_common_status" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="登录时间：">
          <el-date-picker
            v-model="dateRange"
            value-format="yyyy-MM-dd HH:mm:ss"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :default-time="['00:00:00', '23:59:59']"
            @change="handleQuery"></el-date-picker>
        </el-form-item>
        <template slot="opt">
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </template>
      </dc-search>
    </el-form>

    <el-row :gutter="8" class="dc-opt-row">
      <!-- <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          size="small"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:logininfor:remove']"
        >批量删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          size="small"
          @click="handleClean"
          v-hasPermi="['system:logininfor:remove']"
        >清空</el-button>
      </el-col> -->
      <el-col :span="1.5">
        <el-button type="primary" plain size="small" :disabled="single" @click="handleUnlock" v-hasPermi="['system:logininfor:unlock']">解锁</el-button>
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          size="small"
          @click="handleExport"
          v-hasPermi="['system:logininfor:export']"
        >导出</el-button>
      </el-col> -->
    </el-row>

    <el-table
      ref="tables"
      v-loading="loading"
      :data="list"
      @selection-change="handleSelectionChange"
      :default-sort="defaultSort"
      @sort-change="handleSortChange"
      :height="autoHeight">
      <el-table-column type="selection" width="55" align="center" />
      <!-- <el-table-column label="访问编号" prop="infoId" /> -->
      <el-table-column label="用户名称" prop="userName" :show-overflow-tooltip="true" sortable="custom" :sort-orders="['descending', 'ascending']" min-width="150" />
      <el-table-column label="登录地址" prop="ipaddr" :show-overflow-tooltip="true" min-width="150" />
      <el-table-column label="登录地点" prop="loginLocation" :show-overflow-tooltip="true" width="120" />
      <el-table-column label="浏览器" prop="browser" :show-overflow-tooltip="true" width="120" />
      <el-table-column label="操作系统" prop="os" min-width="150" show-overflow-tooltip />
      <el-table-column label="登录状态" prop="status" width="120">
        <template slot-scope="scope">
          <dc-tag :options="dict.type.sys_common_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="描述"  prop="msg" min-width="150" show-overflow-tooltip  />
      <el-table-column label="访问时间" prop="loginTime" sortable="custom" :sort-orders="['descending', 'ascending']" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.loginTime) }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />
  </div>
</template>

<script>
import { list, delLogininfor, cleanLogininfor, unlockLogininfor } from '@/api/system/logininfor'
import { autoHeightLayout } from '@/mixins/autoHeightLayout.js'

export default {
  name: 'Logininfor',
  dicts: ['sys_common_status'],
  mixins: [autoHeightLayout({ ref: 'tables' })],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 选择用户名
      selectName: '',

      // 总条数
      total: 0,
      // 表格数据
      list: [],
      // 日期范围
      dateRange: [],
      // 默认排序
      defaultSort: { prop: 'loginTime', order: 'descending' },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        ipaddr: undefined,
        userName: undefined,
        status: undefined
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询登录日志列表 */
    getList() {
      this.loading = true
      list(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.list = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = []
      this.resetForm('queryForm')
      this.queryParams.pageNum = 1
      this.$refs.tables.sort(this.defaultSort.prop, this.defaultSort.order)
    },
    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.infoId)
      this.single = selection.length != 1
      this.multiple = !selection.length
      this.selectName = selection.map(item => item.userName)
    },
    /** 排序触发事件 */
    handleSortChange(column, prop, order) {
      this.queryParams.orderByColumn = column.prop
      this.queryParams.isAsc = column.order
      this.getList()
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const infoIds = row.infoId || this.ids
      this.$modal
        .confirm('是否确认删除访问编号为"' + infoIds + '"的数据项？')
        .then(function () {
          return delLogininfor(infoIds)
        })
        .then(() => {
          this.getList()
          this.$modal.msgSuccess('删除成功')
        })
        .catch(() => {})
    },
    /** 清空按钮操作 */
    handleClean() {
      this.$modal
        .confirm('是否确认清空所有登录日志数据项？')
        .then(function () {
          return cleanLogininfor()
        })
        .then(() => {
          this.getList()
          this.$modal.msgSuccess('清空成功')
        })
        .catch(() => {})
    },
    /** 解锁按钮操作 */
    handleUnlock() {
      const username = this.selectName
      this.$modal
        .confirm('是否确认解锁用户"' + username + '"数据项?')
        .then(function () {
          return unlockLogininfor(username)
        })
        .then(() => {
          this.$modal.msgSuccess('用户' + username + '解锁成功')
        })
        .catch(() => {})
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        'system/logininfor/export',
        {
          ...this.queryParams
        },
        `logininfor_${new Date().getTime()}.xlsx`
      )
    }
  }
}
</script>

