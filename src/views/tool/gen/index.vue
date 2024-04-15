<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" label-width="80px" @submit.native.prevent>
      <dc-search :isMoreShow.sync="isMoreShow">
        <el-form-item label="数据源：" prop="dataName">
          <el-input v-model="queryParams.dataName" placeholder="请输入" clearable @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item label="表名称：" prop="tableName">
          <el-input v-model="queryParams.tableName" placeholder="请输入" clearable @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item label="表描述：" prop="tableComment">
          <el-input v-model="queryParams.tableComment" placeholder="请输入" clearable @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item label="创建时间：">
          <el-date-picker
            v-model="dateRange"
            value-format="yyyy-MM-dd"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"></el-date-picker>
        </el-form-item>
        <template slot="opt">
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </template>
      </dc-search>
    </el-form>

    <el-row :gutter="8" class="dc-opt-row">
      <el-col :span="1.5">
        <el-button type="primary" size="small" @click="handleGenTable" v-hasPermi="['tool:gen:code']">生成</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain size="small" @click="openImportTable" v-hasPermi="['tool:gen:import']">导入</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain size="small" :disabled="single" @click="handleEditTable" v-hasPermi="['tool:gen:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain size="small" :disabled="multiple" @click="handleDelete" v-hasPermi="['tool:gen:remove']">批量删除</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="tableList" @selection-change="handleSelectionChange" ref="table" :height="autoHeight">
      <el-table-column type="selection" align="center" width="55"></el-table-column>
      <el-table-column label="序号" type="index" width="80" align="left">
        <template slot-scope="scope">
          <span>{{ (queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="表名称" align="left" prop="tableName" :show-overflow-tooltip="true" min-width="120" />
      <el-table-column label="表描述" align="left" prop="tableComment" :show-overflow-tooltip="true" min-width="170" />
      <el-table-column label="实体" align="left" prop="className" :show-overflow-tooltip="true" min-width="120" />
      <el-table-column label="创建时间" align="left" prop="createTime" width="170" />
      <el-table-column label="更新时间" align="left" prop="updateTime" width="170" />
      <el-table-column
        label="操作"
        fixed="right"
        :width="tableFixedOptWidth"
        class-name="small-padding"
        v-if="checkPermi(['tool:gen:preview', 'tool:gen:edit', 'tool:gen:remove', 'tool:gen:code'])">
        <template slot-scope="scope">
          <dc-more :buttons="buttons" :row="scope.row" @changeWidth="changeTableFixedOptWidth"></dc-more>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />
    <!-- 预览界面 -->
    <el-dialog :title="preview.title" :visible.sync="preview.open" width="80%" top="5vh" append-to-body class="scrollbar">
      <el-tabs v-model="preview.activeName">
        <el-tab-pane
          v-for="(value, key) in preview.data"
          :label="key.substring(key.lastIndexOf('/') + 1, key.indexOf('.vm'))"
          :name="key.substring(key.lastIndexOf('/') + 1, key.indexOf('.vm'))"
          :key="key">
          <el-link :underline="false" icon="el-icon-document-copy" v-clipboard:copy="value" v-clipboard:success="clipboardSuccess" style="float: right">复制</el-link>
          <pre><code class="hljs" v-html="highlightedCode(value, key)"></code></pre>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
    <import-table ref="import" @ok="handleQuery" />
  </div>
</template>

<script>
import { listTable, previewTable, delTable, genCode, synchDb } from '@/api/tool/gen'
import importTable from './importTable'
import hljs from 'highlight.js/lib/highlight'
import 'highlight.js/styles/github-gist.css'
hljs.registerLanguage('java', require('highlight.js/lib/languages/java'))
hljs.registerLanguage('xml', require('highlight.js/lib/languages/xml'))
hljs.registerLanguage('html', require('highlight.js/lib/languages/xml'))
hljs.registerLanguage('vue', require('highlight.js/lib/languages/xml'))
hljs.registerLanguage('javascript', require('highlight.js/lib/languages/javascript'))
hljs.registerLanguage('sql', require('highlight.js/lib/languages/sql'))

import { autoHeightLayout } from '@/mixins/autoHeightLayout.js'

export default {
  name: 'Gen',
  components: { importTable },
  mixins: [autoHeightLayout()],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 唯一标识符
      uniqueId: '',
      // 选中数组
      ids: [],
      // 选中表数组
      tableNames: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,

      // 总条数
      total: 0,
      // 表数据
      tableList: [],
      // 日期范围
      dateRange: '',
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        tableName: undefined,
        tableComment: undefined,
        dataName: 'master'
      },
      // 预览参数
      preview: {
        open: false,
        title: '代码预览',
        data: {},
        activeName: 'domain.java'
      },
      buttons: [
        {
          label: '预览',
          vIf: () => this.checkPermi(['tool:gen:preview']),
          handler: this.handlePreview
        },
        {
          label: '编辑',
          vIf: () => this.checkPermi(['tool:gen:edit']),
          handler: this.handleEditTable
        },
        {
          label: '删除',
          vIf: () => this.checkPermi(['tool:gen:remove']),
          handler: this.handleDelete
        },
        {
          label: '同步',
          vIf: () => this.checkPermi(['tool:gen:edit']),
          handler: this.handleSynchDb
        },
        {
          label: '生成代码',
          vIf: () => this.checkPermi(['tool:gen:code']),
          handler: this.handleGenTable
        }
      ]
    }
  },
  created() {
    localStorage.setItem('dataName', this.queryParams.dataName)
    this.getList()
  },
  activated() {
    const time = this.$route.query.t
    if (time != null && time != this.uniqueId) {
      this.uniqueId = time
      this.queryParams.pageNum = Number(this.$route.query.pageNum)
      this.getList()
    }
  },
  methods: {
    /** 查询表集合 */
    getList() {
      this.loading = true
      listTable(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.tableList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      localStorage.setItem('dataName', this.queryParams.dataName)
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 生成代码操作 */
    handleGenTable(row) {
      const tableNames = row.tableName || this.tableNames
      if (tableNames == '') {
        this.$modal.msgError('请选择要生成的数据')
        return
      }
      if (row.genType === '1') {
        genCode(row.tableName).then(response => {
          this.$modal.msgSuccess('成功生成到自定义路径：' + row.genPath)
        })
      } else {
        this.$download.zip('/code/gen/batchGenCode?tables=' + tableNames, 'ruoyi.zip')
      }
    },
    /** 同步数据库操作 */
    handleSynchDb(row) {
      const tableName = row.tableName
      this.$modal
        .confirm('确认要强制同步"' + tableName + '"表结构吗？')
        .then(function () {
          return synchDb(tableName)
        })
        .then(() => {
          this.$modal.msgSuccess('同步成功')
        })
        .catch(() => {})
    },
    /** 打开导入表弹窗 */
    openImportTable() {
      this.$refs.import.show()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = []
      this.resetForm('queryForm')
      this.handleQuery()
    },
    /** 预览按钮 */
    handlePreview(row) {
      previewTable(row.tableId).then(response => {
        this.preview.data = response.data
        this.preview.open = true
        this.preview.activeName = 'domain.java'
      })
    },
    /** 高亮显示 */
    highlightedCode(code, key) {
      const vmName = key.substring(key.lastIndexOf('/') + 1, key.indexOf('.vm'))
      var language = vmName.substring(vmName.indexOf('.') + 1, vmName.length)
      const result = hljs.highlight(language, code || '', true)
      return result.value || '&nbsp;'
    },
    /** 复制代码成功 */
    clipboardSuccess() {
      this.$modal.msgSuccess('复制成功')
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.tableId)
      this.tableNames = selection.map(item => item.tableName)
      this.single = selection.length != 1
      this.multiple = !selection.length
    },
    /** 修改按钮操作 */
    handleEditTable(row) {
      const tableId = row.tableId || this.ids[0]
      const tableName = row.tableName || this.tableNames[0]
      const params = { pageNum: this.queryParams.pageNum }
      this.$tab.openPage('修改[' + tableName + ']生成配置', '/tool/gen-edit/index/' + tableId, params)
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const tableIds = row.tableId || this.ids
      this.$modal
        .confirm('是否确认删除表编号为"' + tableIds + '"的数据项？')
        .then(function () {
          return delTable(tableIds)
        })
        .then(() => {
          this.getList()
          this.$modal.msgSuccess('删除成功')
        })
        .catch(() => {})
    }
  }
}
</script>
