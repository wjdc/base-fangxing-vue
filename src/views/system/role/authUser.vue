<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" label-width="80px">
      <dc-search :isMoreShow.sync="isMoreShow">
        <el-form-item label="用户名称：" prop="userName">
          <el-input v-model="queryParams.userName" placeholder="请输入" clearable @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item label="手机号码：" prop="phonenumber">
          <el-input v-model="queryParams.phonenumber" placeholder="请输入" clearable @keyup.enter.native="handleQuery" />
        </el-form-item>
        <template slot="opt">
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </template>
      </dc-search>
    </el-form>

    <el-row :gutter="8" class="dc-opt-row">
      <el-col :span="1.5">
        <el-button type="primary" size="small" @click="openSelectUser" v-hasPermi="['system:role:add']">选择用户</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain size="small" :disabled="multiple" @click="cancelAuthUserAll" v-hasPermi="['system:role:remove']">批量取消授权</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain size="small" @click="handleClose">关闭</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange" ref="table" :height="autoHeight">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="用户名称" prop="userName" :show-overflow-tooltip="true" min-width="120" />
      <el-table-column label="用户昵称" prop="nickName" :show-overflow-tooltip="true" min-width="120" />
      <el-table-column label="邮箱" prop="email" :show-overflow-tooltip="true" min-width="140" />
      <el-table-column label="手机" prop="phonenumber" :show-overflow-tooltip="true" min-width="140" />
      <el-table-column label="状态"  prop="status" width="120">
        <template slot-scope="scope">
          <dc-tag :options="dict.type.sys_normal_disable" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间"  prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作"  class-name="small-padding" fixed="right" width="100" v-if="checkPermi(['system:role:remove'])">
        <template slot-scope="scope">
          <el-button size="mini" type="text"  @click="cancelAuthUser(scope.row)" v-hasPermi="['system:role:remove']">取消授权</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />
    <select-user ref="select" :roleId="queryParams.roleId" @ok="handleQuery" />
  </div>
</template>

<script>
import { allocatedUserList, authUserCancel, authUserCancelAll } from '@/api/system/role'
import selectUser from './selectUser'
import { autoHeightLayout } from '@/mixins/autoHeightLayout.js'

export default {
  name: 'AuthUser',
  mixins: [autoHeightLayout()],
  dicts: ['sys_normal_disable'],
  components: { selectUser },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中用户组
      userIds: [],
      // 非多个禁用
      multiple: true,

      // 总条数
      total: 0,
      // 用户表格数据
      userList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        roleId: undefined,
        userName: undefined,
        phonenumber: undefined
      }
    }
  },
  created() {
    const roleId = this.$route.params && this.$route.params.roleId
    if (roleId) {
      this.queryParams.roleId = roleId
      this.getList()
    }
  },
  methods: {
    /** 查询授权用户列表 */
    getList() {
      this.loading = true
      allocatedUserList(this.queryParams).then(response => {
        this.userList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 返回按钮
    handleClose() {
      const obj = { path: '/system/role' }
      this.$tab.closeOpenPage(obj)
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.userIds = selection.map(item => item.userId)
      this.multiple = !selection.length
    },
    /** 打开授权用户表弹窗 */
    openSelectUser() {
      this.$refs.select.show()
    },
    /** 取消授权按钮操作 */
    cancelAuthUser(row) {
      const roleId = this.queryParams.roleId
      this.$modal
        .confirm('确认要取消该用户"' + row.userName + '"角色吗？')
        .then(function () {
          return authUserCancel({ userId: row.userId, roleId: roleId })
        })
        .then(() => {
          this.getList()
          this.$modal.msgSuccess('取消授权成功')
        })
        .catch(() => {})
    },
    /** 批量取消授权按钮操作 */
    cancelAuthUserAll(row) {
      const roleId = this.queryParams.roleId
      const userIds = this.userIds.join(',')
      this.$modal
        .confirm('是否取消选中用户授权数据项？')
        .then(function () {
          return authUserCancelAll({ roleId: roleId, userIds: userIds })
        })
        .then(() => {
          this.getList()
          this.$modal.msgSuccess('取消授权成功')
        })
        .catch(() => {})
    }
  }
}
</script>
