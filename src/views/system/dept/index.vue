<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" label-width="80px" size="small" @submit.native.prevent>
      <dc-search :isMoreShow.sync="isMoreShow">
        <el-form-item label="所属机构：" prop="orgCode">
          <dc-treeselect v-model="queryParams.orgCode" :options="orgOptions" :normalizer="normalizerOrg" placeholder="请选择" :clearable="false" @input="handleQuery" />
        </el-form-item>
        <el-form-item label="部门名称：" prop="deptName">
          <el-input v-model="queryParams.deptName" placeholder="请输入" clearable @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item label="状态：" prop="status">
          <el-select v-model="queryParams.status" placeholder="请选择" clearable @change="handleQuery">
            <el-option v-for="dict in dict.type.sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <template slot="opt">
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </template>
      </dc-search>
    </el-form>

    <el-row :gutter="8" class="dc-opt-row">
      <el-col :span="1.5">
        <el-button type="primary" size="small" @click="handleAddOrg" v-hasPermi="['system:dept:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain size="small" @click="toggleExpandAll">展开/折叠</el-button>
      </el-col>
    </el-row>

    <el-table
      v-if="refreshTable"
      v-loading="loading"
      :data="deptList"
      row-key="deptId"
      :default-expand-all="isExpandAll"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      ref="table"
      :height="autoHeight">
      <el-table-column prop="deptName" label="部门名称" min-width="150" show-overflow-tooltip></el-table-column>
      <el-table-column prop="orgName" label="所属机构" min-width="150" show-overflow-tooltip></el-table-column>
      <el-table-column prop="orderNum" label="排序" width="120"></el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template slot-scope="scope">
          <dc-tag :options="dict.type.sys_normal_disable" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" class-name="small-padding" fixed="right" width="200" v-if="checkPermi(['system:dept:edit', 'system:dept:add', 'system:dept:remove'])">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:dept:edit']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-plus" @click="handleAdd(scope.row)" v-hasPermi="['system:dept:add']">新增</el-button>
          <el-button v-if="scope.row.parentId != 0" size="mini" type="text" @click="handleDelete(scope.row)" v-hasPermi="['system:dept:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改部门对话框 -->
    <el-dialog :title="title" :visible.sync="open" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px" size="small">
        <el-row>
          <el-col :span="24">
            <el-form-item label="所属机构" prop="orgCode">
              <dc-treeselect v-model="form.orgCode" :options="orgOptions" :normalizer="normalizerOrg" placeholder="请选择" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="上级部门" prop="parentId">
              <dc-treeselect v-model="form.parentId" :options="deptOptions" :normalizer="normalizer" placeholder="选择上级部门" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="部门名称" prop="deptName">
              <el-input v-model="form.deptName" placeholder="请输入(最多20个字符)" maxlength="20" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="orderNum">
              <el-input-number v-model="form.orderNum" controls-position="right" :min="0" :max="2147483647" placeholder="请输入(0-2147483647)" clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="负责人" prop="leader">
              <el-input v-model="form.leader" placeholder="请输入(最多20个字符)" maxlength="20" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入(最多11个字符)" maxlength="11" clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入(最多50个字符)" maxlength="50" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门状态">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in dict.type.sys_normal_disable" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" type="cancel" @click="cancel">取消</el-button>
        <el-button size="small" type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listDept, getDept, delDept, addDept, updateDept, listDeptExcludeChild, getDeptByOrgCode } from '@/api/system/dept'
import { getOrgList } from '@/api/system/org'
import { autoHeightLayout } from '@/mixins/autoHeightLayout.js'
import Vue from 'vue'

export default {
  name: 'Dept',
  mixins: [autoHeightLayout({ hasPage: false })],
  dicts: ['sys_normal_disable'],
  data() {
    return {
      // 遮罩层
      loading: true,

      // 表格树数据
      deptList: [],
      // 部门树选项
      deptOptions: [],
      //机构选项
      orgOptions: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 是否展开，默认全部展开
      isExpandAll: false,
      // 重新渲染表格状态
      refreshTable: true,
      // 查询参数
      queryParams: {
        deptName: undefined,
        status: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        orgCode: [{ required: true, message: '所属机构不能为空', trigger: 'blur' }],
        // parentId: [
        //   { required: true, message: "上级部门不能为空", trigger: "blur" }
        // ],
        deptName: [{ required: true, message: '部门名称不能为空', trigger: 'blur' }],
        orderNum: [{ required: true, message: '显示排序不能为空', trigger: 'blur' }],
        email: [
          {
            type: 'email',
            message: '请输入正确的邮箱地址',
            trigger: ['blur', 'change']
          }
        ],
        phone: [
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: '请输入正确的手机号码',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    this.queryParams.orgCode = this.userInfo.orgCode
    this.getDept()
    this.getList()
  },
  methods: {
    getDept() {
      getOrgList().then(response => {
        this.orgOptions = this.handleTree(response.data, 'orgCode', 'parentCode')
      })
    },
    /** 查询部门列表 */
    getList() {
      this.loading = true
      listDept(this.queryParams).then(response => {
        this.deptList = this.handleTree(response.data, 'deptId')
        this.loading = false
      })
    },
    /** 转换部门数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.deptId,
        label: node.deptName,
        children: node.children
      }
    },
    /** 转换机构数据结构 */
    normalizerOrg(node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.orgCode,
        label: node.orgName,
        children: node.children
      }
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        deptId: undefined,
        parentId: undefined,
        deptName: undefined,
        orderNum: undefined,
        leader: undefined,
        phone: undefined,
        email: undefined,
        status: '0'
      }
      this.resetForm('form')
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    handleAddOrg() {
      this.reset()
      this.open = true
      this.title = '新增部门'
      this.deptOptions = []
      this.form.orgCode = this.queryParams.orgCode
    },
    /** 新增按钮操作 */
    handleAdd(row) {
      this.reset()
      if (row != undefined) {
        this.form.parentId = row.deptId
        //当对象被直接赋值后，watch钩子函数将不会被触发。所以使用Vue.set()
        Vue.set(this.form, 'orgCode', row.orgCode)
      }
      this.open = true
      this.title = '新增部门'
      this.deptOptions = []
    },
    /** 展开/折叠操作 */
    toggleExpandAll() {
      this.refreshTable = false
      this.isExpandAll = !this.isExpandAll
      this.$nextTick(() => {
        this.refreshTable = true
      })
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      getDept(row.deptId).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改部门'
        this.deptOptions = []
      })
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.deptId != undefined) {
            updateDept(this.form).then(response => {
              this.$modal.msgSuccess('修改成功')
              this.open = false
              this.getList()
            })
          } else {
            addDept(this.form).then(response => {
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
      this.$modal
        .confirm('是否确认删除名称为"' + row.deptName + '"的数据项？')
        .then(function () {
          return delDept(row.deptId)
        })
        .then(() => {
          this.getList()
          this.$modal.msgSuccess('删除成功')
        })
        .catch(() => {})
    },
    orgChange() {
      let code = this.form.orgCode
      if (code) {
        getDeptByOrgCode(code).then(response => {
          this.deptOptions = this.handleTree(response.data, 'deptId')
        })
      }
    }
  },
  watch: {
    'form.orgCode'(n, o) {
      //清空机构或者切换到另一个机构需要清空上级部门
      if (!n || (n && o)) {
        this.form.parentId = undefined
        this.deptOptions = []
      }
      if (n !== o) {
        this.orgChange()
      }
    }
  }
}
</script>
