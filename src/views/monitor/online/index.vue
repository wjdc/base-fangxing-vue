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
        <template slot="opt">
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </template>
      </dc-search>
    </el-form>
    <el-table v-loading="loading" :data="list.slice((pageNum - 1) * pageSize, pageNum * pageSize)" ref="table" :height="autoHeight">
      <el-table-column label="序号" width="80">
        <template slot-scope="scope">
          <span>{{ (pageNum - 1) * pageSize + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="会话编号" prop="tokenId" :show-overflow-tooltip="true" min-width="150" />
      <el-table-column label="登录名称" prop="userName" :show-overflow-tooltip="true" width="150" />
      <el-table-column label="主机" prop="ipaddr" :show-overflow-tooltip="true" width="150" />
      <el-table-column label="登录时间" prop="loginTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.loginTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" class-name="small-padding" fixed="right" width="120" v-if="checkPermi(['monitor:online:forceLogout'])">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleForceLogout(scope.row)" v-hasPermi="['monitor:online:forceLogout']">强退</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="pageNum" :limit.sync="pageSize" />
  </div>
</template>

<script>
import { list, forceLogout } from '@/api/monitor/online'
import { autoHeightLayout } from '@/mixins/autoHeightLayout.js'

export default {
  name: 'Online',
  mixins: [autoHeightLayout()],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 表格数据
      list: [],
      pageNum: 1,
      pageSize: 10,
      // 查询参数
      queryParams: {
        ipaddr: undefined,
        userName: undefined
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
      list(this.queryParams).then(response => {
        this.list = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    /** 强退按钮操作 */
    handleForceLogout(row) {
      this.$modal
        .confirm('是否确认强退名称为"' + row.userName + '"的用户？')
        .then(function () {
          return forceLogout(row.tokenId)
        })
        .then(() => {
          this.getList()
          this.$modal.msgSuccess('强退成功')
        })
        .catch(() => {})
    }
  }
}
</script>

