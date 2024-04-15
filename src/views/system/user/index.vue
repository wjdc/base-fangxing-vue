<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" label-width="80px" size="small" @submit.native.prevent>
      <dc-search :isMoreShow.sync="isMoreShow">
        <el-form-item label="所属机构：" prop="orgCode">
          <dc-treeselect v-model="queryParams.orgCode" :options="orgOptions" :normalizer="normalizer" placeholder="请选择" :clearable="false" @input="handleQuery" />
        </el-form-item>
        <el-form-item label="所属部门：" prop="deptId">
          <dc-treeselect v-model="queryParams.deptId" :options="deptOptions" :normalizer="normalizerDept" placeholder="请选择" @input="handleQuery" />
        </el-form-item>
        <el-form-item label="用户名称：" prop="userName">
          <el-input v-model="queryParams.userName" placeholder="请输入" clearable @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item label="手机号码：" prop="phonenumber">
          <el-input v-model="queryParams.phonenumber" placeholder="请输入" clearable @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item label="状态：" prop="status">
          <el-select v-model="queryParams.status" placeholder="请选择" clearable @change="handleQuery">
            <el-option v-for="dict in dict.type.sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间：">
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
      <el-col :span="1.5">
        <el-button type="primary" size="small" @click="handleAdd" v-hasPermi="['system:user:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain size="small" :disabled="multiple" @click="handleDelete" v-hasPermi="['system:user:remove']">批量删除</el-button>
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          size="small"
          @click="handleImport"
          v-hasPermi="['system:user:import']"
        >导入</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          size="small"
          @click="handleExport"
          v-hasPermi="['system:user:export']"
        >导出</el-button>
      </el-col> -->
    </el-row>

    <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange" ref="table" :height="autoHeight">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="所属机构" key="orgName" prop="orgName" min-width="120" show-overflow-tooltip :formatter="formatterBlank" />
      <el-table-column label="所属部门" key="deptName" prop="dept.deptName" min-width="120" show-overflow-tooltip :formatter="deptFormat" />
      <el-table-column label="用户名称" key="userName" prop="userName" min-width="120" show-overflow-tooltip />
      <el-table-column label="用户昵称" key="nickName" prop="nickName" min-width="120" show-overflow-tooltip />
      <el-table-column label="手机号码" key="phonenumber" prop="phonenumber" min-width="140" :formatter="phonenumberFormat" />
      <el-table-column label="状态" key="status" width="100">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.status" active-value="0" inactive-value="1" @change="handleStatusChange(scope.row)"></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        fixed="right"
        class-name="small-padding"
        :width="tableFixedOptWidth"
        v-if="checkPermi(['system:user:edit', 'system:user:remove', 'system:user:resetPwd'])">
        <template slot-scope="scope" v-if="scope.row.userId !== 1">
          <dc-more :buttons="buttons" :row="scope.row" @changeWidth="changeTableFixedOptWidth"></dc-more>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改用户配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="110px" size="small">
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户昵称" prop="nickName">
              <el-input v-model="form.nickName" placeholder="请输入(最多30个字符)" maxlength="30" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属机构" prop="orgCode">
              <dc-treeselect v-model="form.orgCode" :options="orgOptions" :normalizer="normalizer" placeholder="请选择" :clearable="true" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="所属部门" prop="deptId">
              <dc-treeselect v-model="form.deptId" :options="deptOptionsAdd" :normalizer="normalizerDept" placeholder="请选择" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号码" prop="phonenumber">
              <el-input v-model="form.phonenumber" placeholder="请输入(最多11个字符)" maxlength="11" clearable />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入(最多50个字符)" maxlength="50" clearable />
            </el-form-item>
          </el-col>
          <input type="text" v-if="form.userId == undefined" style="width: 0; height: 0; opacity: 0; padding: 0; border: none" />
          <input type="password" v-if="form.userId == undefined" style="width: 0; height: 0; opacity: 0; padding: 0; border: none" />
          <el-col :span="12">
            <el-form-item v-if="form.userId == undefined" label="用户名称" prop="userName">
              <el-input v-model="form.userName" placeholder="请输入(最多30个字符)" maxlength="30" clearable auto-complete="off" />
            </el-form-item>
          </el-col>
          <input type="password" v-if="form.userId == undefined" style="width: 0; height: 0; opacity: 0; padding: 0; border: none" />
          <el-col :span="12">
            <el-form-item v-if="form.userId == undefined" label="用户密码" prop="password">
              <el-input v-model="form.password" placeholder="请输入(最多20个字符)" type="password" maxlength="20" show-password clearable auto-complete="off" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用户性别">
              <el-select v-model="form.sex" placeholder="请选择" style="width: 100%" clearable>
                <el-option v-for="dict in dict.type.sys_user_sex" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in dict.type.sys_normal_disable" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色">
              <el-select v-model="form.roleIds" multiple placeholder="请选择" style="width: 100%" clearable filterable>
                <el-option v-for="item in roleOptions" :key="item.roleId" :label="item.roleName" :value="item.roleId" :disabled="item.status == 1"></el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入" maxlength="200" show-word-limit></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" type="cancel" @click="cancel">取消</el-button>
        <el-button size="small" type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>

    <!-- 用户导入对话框 -->
    <el-dialog :title="upload.title" :visible.sync="upload.open" width="400px" append-to-body>
      <el-upload
        ref="upload"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="upload.headers"
        :action="upload.url + '?updateSupport=' + upload.updateSupport"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag>
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip text-center" slot="tip">
          <div class="el-upload__tip" slot="tip"><el-checkbox v-model="upload.updateSupport" /> 是否更新已经存在的用户数据</div>
          <span>仅允许导入xls、xlsx格式文件。</span>
          <el-link type="primary" :underline="false" style="font-size: 12px; vertical-align: baseline" @click="importTemplate">下载模板</el-link>
        </div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" type="cancel" @click="upload.open = false">取消</el-button>
        <el-button size="small" type="primary" @click="submitFileForm">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listUser, getUser, delUser, addUser, updateUser, resetUserPwd, changeUserStatus, deptTreeSelect } from '@/api/system/user'
import { getToken } from '@/utils/auth'
import { getOrgList } from '@/api/system/org'
import { getDeptByOrgCode } from '@/api/system/dept'
import { autoHeightLayout } from '@/mixins/autoHeightLayout.js'

export default {
  name: 'User',
  mixins: [autoHeightLayout()],
  dicts: ['sys_normal_disable', 'sys_user_sex'],
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
      // 总条数
      total: 0,
      // 用户表格数据
      userList: null,
      // 弹出层标题
      title: '',
      // 部门树选项
      deptOptions: [],
      // 新增查询部门树选项
      deptOptionsAdd: undefined,
      // 是否显示弹出层
      open: false,
      // 部门名称
      deptName: undefined,
      // 默认密码
      initPassword: undefined,
      // 日期范围
      dateRange: [],
      // 岗位选项
      postOptions: [],
      //机构选项
      orgOptions: [],
      // 角色选项
      roleOptions: [],
      // 表单参数
      form: {},
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      // 用户导入参数
      upload: {
        // 是否显示弹出层（用户导入）
        open: false,
        // 弹出层标题（用户导入）
        title: '',
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的用户数据
        updateSupport: 0,
        // 设置上传的请求头部
        headers: { Authorization: 'Bearer ' + getToken() },
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + '/system/user/importData'
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userName: undefined,
        phonenumber: undefined,
        status: undefined,
        orgCode: undefined,
        deptId: undefined
      },
      // 列信息
      columns: [
        { key: 0, label: `所属机构`, visible: true },
        { key: 1, label: `所属部门`, visible: true },
        { key: 2, label: `用户名称`, visible: true },
        { key: 3, label: `用户昵称`, visible: true },
        { key: 4, label: `手机号码`, visible: true },
        { key: 5, label: `状态`, visible: true },
        { key: 6, label: `创建时间`, visible: true }
      ],
      // 表单校验
      rules: {
        orgCode: [{ required: true, message: '所属机构不能为空', trigger: 'blur' }],
        // deptId: [
        //   { required: true, message: "所属部门不能为空", trigger: "blur" }
        // ],
        userName: [
          { required: true, message: '用户名称不能为空', trigger: 'blur' },
          { min: 2, max: 20, message: '用户名称长度必须介于 2 和 20 之间', trigger: 'blur' }
        ],
        nickName: [{ required: true, message: '用户昵称不能为空', trigger: 'blur' }],
        password: [
          { required: true, message: '用户密码不能为空', trigger: 'blur' },
          { min: 5, max: 20, message: '用户密码长度必须介于 5 和 20 之间', trigger: 'blur' }
        ],
        email: [
          {
            type: 'email',
            message: '请输入正确的邮箱地址',
            trigger: ['blur', 'change']
          }
        ],
        phonenumber: [
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: '请输入正确的手机号码',
            trigger: 'blur'
          }
        ]
      },

      buttons: [
        {
          label: '修改',
          vIf: () => this.checkPermi(['system:user:edit']),
          handler: this.handleUpdate
        },
        {
          label: '删除',
          vIf: () => this.checkPermi(['system:user:remove']),
          handler: this.handleDelete
        },
        {
          label: '重置密码',
          vIf: () => this.checkPermi(['system:user:resetPwd']),
          handler: this.handleResetPwd
        },
        {
          label: '分配角色',
          vIf: () => this.checkPermi(['system:user:edit']),
          handler: this.handleAuthRole
        }
      ]
    }
  },
  watch: {
    // 根据名称筛选部门树
    deptName(val) {
      this.$refs.tree.filter(val)
    },
    'form.orgCode'(n, o) {
      //清空机构或者切换到另一个机构需要清空部门
      if (!n || (n && o)) {
        this.form.deptId = undefined
        this.deptOptionsAdd = []
      }
      if (n !== o) {
        this.orgChange()
      }
    },
    'queryParams.orgCode'(n, o) {
      //清空机构或者切换到另一个机构需要清空部门
      if (!n || (n && o)) {
        this.queryParams.deptId = undefined
        this.deptOptions = []
      }
      if (n !== o) {
        this.orgChange4Query()
      }
    }
  },
  created() {
    this.queryParams.orgCode = this.userInfo.orgCode
    this.getList()
    this.getOrgList()
    this.getConfigKey('sys.user.initPassword').then(response => {
      this.initPassword = response.msg
    })
  },
  methods: {
    getOrgList() {
      getOrgList().then(response => {
        this.orgOptions = this.handleTree(response.data, 'orgCode', 'parentCode')
      })
    },
    /** 查询用户列表 */
    getList() {
      this.loading = true
      listUser(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.userList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 筛选节点
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    // 节点单击事件
    handleNodeClick(data) {
      this.queryParams.deptId = data.id
      this.handleQuery()
    },
    // 用户状态修改
    handleStatusChange(row) {
      let text = row.status === '0' ? '启用' : '停用'
      this.$modal
        .confirm('确认要"' + text + '""' + row.userName + '"用户吗？')
        .then(function () {
          return changeUserStatus(row.userId, row.status)
        })
        .then(() => {
          this.$modal.msgSuccess(text + '成功')
        })
        .catch(function () {
          row.status = row.status === '0' ? '1' : '0'
        })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        orgCode: undefined,
        userId: undefined,
        deptId: undefined,
        userName: undefined,
        nickName: undefined,
        password: undefined,
        phonenumber: undefined,
        email: undefined,
        sex: undefined,
        status: '0',
        remark: undefined,
        postIds: [],
        roleIds: []
      }
      this.deptOptionsAdd = []
      this.resetForm('form')
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
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.userId)
      this.single = selection.length != 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      getUser().then(response => {
        this.postOptions = response.data.posts
        this.roleOptions = response.data.roles
        this.open = true
        this.title = '新增用户'
        this.form.password = this.initPassword
        this.form.orgCode = this.queryParams.orgCode
      })
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const userId = row.userId || this.ids
      getUser(userId).then(response => {
        this.form = response.data.user
        this.postOptions = response.data.posts
        this.roleOptions = response.data.roles
        this.$set(this.form, 'postIds', response.data.postIds)
        this.$set(this.form, 'roleIds', response.data.roleIds)
        this.open = true
        this.title = '修改用户'
        this.form.password = ''
      })
    },
    /** 重置密码按钮操作 */
    handleResetPwd(row) {
      this.$prompt('请输入"' + row.userName + '"的新密码', '重置密码', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        closeOnClickModal: false,
        cancelButtonClass: 'el-button--cancel',
        inputPattern: /^.{5,20}$/,
        inputErrorMessage: '用户密码长度必须介于 5 和 20 之间',
        inputPlaceholder: '请输入(最多20个字符)'
      })
        .then(({ value }) => {
          resetUserPwd(row.userId, value).then(response => {
            this.$modal.msgSuccess('修改成功，新密码是：' + value)
          })
        })
        .catch(() => {})
    },
    /** 分配角色操作 */
    handleAuthRole: function (row) {
      const userId = row.userId
      this.$router.push('/system/user-auth/role/' + userId)
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.userId != undefined) {
            updateUser(this.form).then(response => {
              this.$modal.msgSuccess('修改成功')
              this.open = false
              this.getList()
            })
          } else {
            addUser(this.form).then(response => {
              this.$modal.msgSuccess('新增成功')
              this.open = false
              this.getList()
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const userIds = row.userId || this.ids
      this.$modal
        .confirm('是否确认删除用户编号为"' + userIds + '"的数据项？')
        .then(function () {
          return delUser(userIds)
        })
        .then(() => {
          this.getList()
          this.$modal.msgSuccess('删除成功')
        })
        .catch(() => {})
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        'system/user/export',
        {
          ...this.queryParams
        },
        `user_${new Date().getTime()}.xlsx`
      )
    },
    /** 导入按钮操作 */
    handleImport() {
      this.upload.title = '用户导入'
      this.upload.open = true
    },
    /** 下载模板操作 */
    importTemplate() {
      this.download('system/user/importTemplate', {}, `user_template_${new Date().getTime()}.xlsx`)
    },
    // 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true
    },
    // 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      this.upload.open = false
      this.upload.isUploading = false
      this.$refs.upload.clearFiles()
      this.$alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + '</div>', '导入结果', {
        dangerouslyUseHTMLString: true
      })
      this.getList()
    },
    // 提交上传文件
    submitFileForm() {
      this.$refs.upload.submit()
    },
    /** 转换机构数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.orgCode,
        label: node.orgName,
        children: node.children
      }
    },
    /** 转换部门数据结构 */
    normalizerDept(node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.deptId,
        label: node.deptName,
        children: node.children
      }
    },
    orgChange() {
      let code = this.form.orgCode
      if (code) {
        getDeptByOrgCode(code).then(response => {
          this.deptOptionsAdd = this.handleTree(response.data, 'deptId')
        })
      }
    },
    orgChange4Query() {
      let code = this.queryParams.orgCode
      if (code) {
        getDeptByOrgCode(code).then(response => {
          this.deptOptions = this.handleTree(response.data, 'deptId')
        })
      }
    },
    // 列格式化
    deptFormat(row, column) {
      if (row.dept && row.dept.deptName) {
        return row.dept.deptName
      }
      return '-'
    },
    phonenumberFormat(row, column) {
      if (row.phonenumber) {
        return row.phonenumber
      }
      return '-'
    }
  }
}
</script>
