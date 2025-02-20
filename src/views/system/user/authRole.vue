<template>
  <div class="app-container has-fixed-bottom-opt">
    <h4 class="form-header h4">基本信息</h4>
    <el-form ref="form" :model="form" label-width="80px" size="small">
      <el-row>
        <el-col :span="8" :offset="2">
          <el-form-item label="用户昵称" prop="nickName">
            <el-input v-model="form.nickName" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="8" :offset="2">
          <el-form-item label="登录账号" prop="userName">
            <el-input v-model="form.userName" disabled />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <h4 class="form-header h4">角色信息</h4>
    <el-table
      v-loading="loading"
      :row-key="getRowKey"
      @row-click="clickRow"
      ref="table"
      @selection-change="handleSelectionChange"
      :data="roles.slice((pageNum - 1) * pageSize, pageNum * pageSize)"
      :height="autoHeight">
      <el-table-column type="selection" :reserve-selection="true" width="55" align="center"></el-table-column>
      <el-table-column label="序号" type="index" width="70">
        <template slot-scope="scope">
          <span>{{ (pageNum - 1) * pageSize + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="角色编号" prop="roleId" min-width="120" show-overflow-tooltip />
      <el-table-column label="角色名称" prop="roleName" min-width="120" show-overflow-tooltip />
      <el-table-column label="权限字符" prop="roleKey" min-width="120" show-overflow-tooltip />
      <el-table-column label="创建时间" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="pageNum" :limit.sync="pageSize" />

    <div class="fixed-bottom-opt">
      <el-button size="small" type="cancel" @click="close()">返回</el-button>
      <el-button size="small" type="primary" @click="submitForm()">提交</el-button>
    </div>
  </div>
</template>

<script>
import { getAuthRole, updateAuthRole } from '@/api/system/user'
import { autoHeightLayout } from '@/mixins/autoHeightLayout.js'

export default {
  name: 'AuthRole',
  mixins: [autoHeightLayout()],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 分页信息
      total: 0,
      pageNum: 1,
      pageSize: 10,
      // 选中角色编号
      roleIds: [],
      // 角色信息
      roles: [],
      // 用户信息
      form: {}
    }
  },
  created() {
    const userId = this.$route.params && this.$route.params.userId
    if (userId) {
      this.loading = true
      getAuthRole(userId).then(response => {
        this.form = response.data.user
        this.roles = response.data.roles
        this.total = this.roles.length
        this.$nextTick(() => {
          this.roles.forEach(row => {
            if (row.flag) {
              this.$refs.table.toggleRowSelection(row)
            }
          })
        })
        this.loading = false
      })
    }
  },
  methods: {
    /** 单击选中行数据 */
    clickRow(row) {
      this.$refs.table.toggleRowSelection(row)
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.roleIds = selection.map(item => item.roleId)
    },
    // 保存选中的数据编号
    getRowKey(row) {
      return row.roleId
    },
    /** 提交按钮 */
    submitForm() {
      const userId = this.form.userId
      const roleIds = this.roleIds.join(',')
      updateAuthRole({ userId: userId, roleIds: roleIds }).then(response => {
        this.$modal.msgSuccess('授权成功')
        this.close()
      })
    },
    /** 关闭按钮 */
    close() {
      const obj = { path: '/system/user' }
      this.$tab.closeOpenPage(obj)
    }
  }
}
</script>
