<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" label-width="80px" size="small">
      <dc-search :isMoreShow.sync="isMoreShow">
        <el-form-item label="系统模块：" prop="title">
          <el-input v-model="queryParams.title" placeholder="请输入" clearable @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item label="操作人员：" prop="operName">
          <el-input v-model="queryParams.operName" placeholder="请输入" clearable @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item label="类型：" prop="businessType">
          <el-select v-model="queryParams.businessType" placeholder="请选择" clearable filterable @change="handleQuery">
            <el-option v-for="dict in dict.type.sys_oper_type" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态：" prop="status">
          <el-select v-model="queryParams.status" placeholder="请选择" clearable @change="handleQuery">
            <el-option v-for="dict in dict.type.sys_common_status" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作时间：">
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
          v-hasPermi="['system:operlog:remove']"
        >批量删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          size="small"
          @click="handleClean"
          v-hasPermi="['system:operlog:remove']"
        >清空</el-button>
      </el-col> -->
      <!-- <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          size="small"
          @click="handleExport"
          v-hasPermi="['system:operlog:export']"
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
      <!-- <el-table-column type="selection" width="55" align="center" /> -->
      <!-- <el-table-column label="日志编号"  prop="operId" /> -->
      <el-table-column label="系统模块" prop="title" min-width="120" />
      <el-table-column label="操作类型" prop="businessType" width="120">
        <template slot-scope="scope">
          <dc-tag :options="dict.type.sys_oper_type" :value="scope.row.businessType" />
        </template>
      </el-table-column>
      <el-table-column label="请求方式" prop="requestMethod" width="120" />
      <el-table-column label="操作人员" prop="operName" :show-overflow-tooltip="true" sortable="custom" :sort-orders="['descending', 'ascending']" min-width="120" />
      <el-table-column label="主机" prop="operIp" min-width="130" :show-overflow-tooltip="true" />
      <el-table-column label="操作状态" prop="status" width="120">
        <template slot-scope="scope">
          <dc-tag :options="dict.type.sys_common_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="操作日期" prop="operTime" sortable="custom" :sort-orders="['descending', 'ascending']" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.operTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" class-name="small-padding" fixed="right" width="120" v-if="checkPermi(['system:operlog:query'])">
        <template slot-scope="scope">
          <el-button size="mini" type="text" @click="handleView(scope.row, scope.index)" v-hasPermi="['system:operlog:query']">详细</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 操作日志详细 -->
    <el-dialog title="操作日志详细" :visible.sync="open" append-to-body custom-class="des-dialog">
      <el-form ref="form" :model="form" label-width="100px" size="small">
        <el-row>
          <el-col :span="12">
            <el-form-item label="操作模块：">{{ form.title }} / {{ typeFormat(form) }}</el-form-item>
            <el-form-item label="登录信息：">{{ form.operName }} / {{ form.operIp }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="请求地址：">{{ form.operUrl }}</el-form-item>
            <el-form-item label="请求方式：">{{ form.requestMethod }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="操作方法：">{{ form.method }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="请求参数：">{{ form.operParam }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="返回参数：">{{ form.jsonResult }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="操作状态：">
              <div v-if="form.status === 0">正常</div>
              <div v-else-if="form.status === 1">失败</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="操作时间：">{{ parseTime(form.operTime) }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="异常信息：" v-if="form.status === 1">{{ form.errorMsg }}</el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <!-- <div slot="footer" class="dialog-footer">
        <el-button size="small" type="cancel" @click="open = false">关闭</el-button>
      </div> -->
    </el-dialog>
  </div>
</template>

<script>
import { list, delOperlog, cleanOperlog } from '@/api/system/operlog'
import { autoHeightLayout } from '@/mixins/autoHeightLayout.js'

export default {
  name: 'Operlog',
  dicts: ['sys_oper_type', 'sys_common_status'],
  mixins: [autoHeightLayout({ ref: 'tables' })],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非多个禁用
      multiple: true,

      // 总条数
      total: 0,
      // 表格数据
      list: [],
      // 是否显示弹出层
      open: false,
      // 日期范围
      dateRange: [],
      // 默认排序
      defaultSort: { prop: 'operTime', order: 'descending' },
      // 表单参数
      form: {},
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        title: undefined,
        operName: undefined,
        businessType: undefined,
        status: undefined
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询登录日志 */
    getList() {
      this.loading = true
      list(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.list = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 操作日志类型字典翻译
    typeFormat(row, column) {
      return this.selectDictLabel(this.dict.type.sys_oper_type, row.businessType)
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
      this.ids = selection.map(item => item.operId)
      this.multiple = !selection.length
    },
    /** 排序触发事件 */
    handleSortChange(column, prop, order) {
      this.queryParams.orderByColumn = column.prop
      this.queryParams.isAsc = column.order
      this.getList()
    },
    /** 详细按钮操作 */
    handleView(row) {
      this.open = true
      this.form = row
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const operIds = row.operId || this.ids
      this.$modal
        .confirm('是否确认删除日志编号为"' + operIds + '"的数据项？')
        .then(function () {
          return delOperlog(operIds)
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
        .confirm('是否确认清空所有操作日志数据项？')
        .then(function () {
          return cleanOperlog()
        })
        .then(() => {
          this.getList()
          this.$modal.msgSuccess('清空成功')
        })
        .catch(() => {})
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        'system/operlog/export',
        {
          ...this.queryParams
        },
        `operlog_${new Date().getTime()}.xlsx`
      )
    }
  }
}
</script>

