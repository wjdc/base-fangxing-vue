<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" label-width="80px" size="small">
      <dc-search :isMoreShow.sync="isMoreShow">
        <el-form-item label="参数名称：" prop="configName">
          <el-input v-model="queryParams.configName" placeholder="请输入" clearable @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item label="参数键名：" prop="configKey">
          <el-input v-model="queryParams.configKey" placeholder="请输入" clearable @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item label="系统内置：" prop="configType">
          <el-select v-model="queryParams.configType" placeholder="请选择" clearable @change="handleQuery">
            <el-option v-for="dict in dict.type.sys_yes_no" :key="dict.value" :label="dict.label" :value="dict.value" />
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

    <!-- <el-row :gutter="8" class="dc-opt-row">
      <el-col :span="1.5">
        <el-button
          type="primary"
          size="small"
          @click="handleAdd"
          v-hasPermi="['system:config:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          size="small"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:config:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          size="small"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:config:remove']"
        >批量删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          size="small"
          @click="handleExport"
          v-hasPermi="['system:config:export']"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          size="small"
          @click="handleRefreshCache"
          v-hasPermi="['system:config:remove']"
        >刷新缓存</el-button>
      </el-col>
    </el-row> -->

    <el-table v-loading="loading" :data="configList" @selection-change="handleSelectionChange" ref="table" :height="autoHeight">
      <!-- <el-table-column type="selection" width="55" align="center" /> -->
      <!-- <el-table-column label="参数主键" align="center" prop="configId" /> -->
      <el-table-column label="参数名称" prop="configName" min-width="120" :show-overflow-tooltip="true" />
      <el-table-column label="参数键名" prop="configKey" min-width="120" :show-overflow-tooltip="true" />
      <el-table-column label="参数键值" prop="configValue" min-width="120" :show-overflow-tooltip="true" />
      <el-table-column label="系统内置" prop="configType" width="120">
        <template slot-scope="scope">
          <dc-tag :options="dict.type.sys_yes_no" :value="scope.row.configType" />
        </template>
      </el-table-column>
      <el-table-column label="备注" prop="remark" min-width="120" :show-overflow-tooltip="true" />
      <el-table-column label="创建时间" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" class-name="small-padding" fixed="right" width="120" v-if="checkPermi(['system:config:edit', 'system:config:remove'])">
        <template slot-scope="scope">
          <el-button size="mini" type="text" @click="handleUpdate(scope.row)" v-hasPermi="['system:config:edit']">修改</el-button>
          <!-- <el-button
            size="mini"
            type="text"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:config:remove']"
          >删除</el-button> -->
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px" size="small">
        <el-form-item label="参数名称" prop="configName">
          <el-input v-model="form.configName" placeholder="请输入(最多20个字符)" maxlength="20" clearable />
        </el-form-item>
        <el-form-item label="参数键名" prop="configKey">
          <el-input v-model="form.configKey" placeholder="请输入(最多50个字符)" maxlength="50" clearable />
        </el-form-item>
        <el-form-item label="参数键值" prop="configValue">
          <el-input v-model="form.configValue" placeholder="请输入(最多50个字符)" maxlength="50" clearable />
        </el-form-item>
        <el-form-item label="系统内置" prop="configType">
          <el-radio-group v-model="form.configType">
            <el-radio v-for="dict in dict.type.sys_yes_no" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入" maxlength="200" show-word-limit />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" type="cancel" @click="cancel">取消</el-button>
        <el-button size="small" type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listConfig, getConfig, delConfig, addConfig, updateConfig, refreshCache } from '@/api/system/config'
import { autoHeightLayout } from '@/mixins/autoHeightLayout.js'

export default {
  name: 'Config',
  dicts: ['sys_yes_no'],
  mixins: [autoHeightLayout()],
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
      // 参数表格数据
      configList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        configName: undefined,
        configKey: undefined,
        configType: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        configName: [{ required: true, message: '参数名称不能为空', trigger: 'blur' }],
        configKey: [{ required: true, message: '参数键名不能为空', trigger: 'blur' }],
        configValue: [{ required: true, message: '参数键值不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询参数列表 */
    getList() {
      this.loading = true
      listConfig(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.configList = response.rows
        this.total = response.total
        this.loading = false
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
        configId: undefined,
        configName: undefined,
        configKey: undefined,
        configValue: undefined,
        configType: 'Y',
        remark: undefined
      }
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
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '新增参数'
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.configId)
      this.single = selection.length != 1
      this.multiple = !selection.length
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const configId = row.configId || this.ids
      getConfig(configId).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改参数'
      })
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.configId != undefined) {
            updateConfig(this.form).then(response => {
              this.$modal.msgSuccess('修改成功')
              this.open = false
              this.getList()
            })
          } else {
            addConfig(this.form).then(response => {
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
      const configIds = row.configId || this.ids
      this.$modal
        .confirm('是否确认删除参数编号为"' + configIds + '"的数据项？')
        .then(function () {
          return delConfig(configIds)
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
        'system/config/export',
        {
          ...this.queryParams
        },
        `config_${new Date().getTime()}.xlsx`
      )
    },
    /** 刷新缓存按钮操作 */
    handleRefreshCache() {
      refreshCache().then(() => {
        this.$modal.msgSuccess('刷新成功')
      })
    }
  }
}
</script>
