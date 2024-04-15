<template>
  <!-- 导入表 -->
  <el-dialog title="导入表" :visible.sync="visible" width="800px" top="5vh" append-to-body>
    <el-form :model="queryParams" ref="queryForm" size="small" class="dialog-query-form">
      <el-form-item label="表名称：" prop="tableName">
        <el-input v-model="queryParams.tableName" placeholder="请输入" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="表描述：" prop="tableComment">
        <el-input v-model="queryParams.tableComment" placeholder="请输入" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item class="dialog-query-opt">
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-table @row-click="clickRow" ref="table" :data="dbTableList" @selection-change="handleSelectionChange" height="400px">
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column prop="tableName" label="表名称" min-width="120" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="tableComment" label="表描述" min-width="120" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
      <el-table-column prop="updateTime" label="更新时间" width="180"></el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />
    <div slot="footer" class="dialog-footer">
      <el-button size="small" type="cancel" @click="visible = false">取消</el-button>
      <el-button size="small" type="primary" @click="handleImportTable">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { listDbTable, importTable } from '@/api/tool/gen'
export default {
  data() {
    return {
      // 遮罩层
      visible: false,
      // 选中数组值
      tables: [],
      // 总条数
      total: 0,
      // 表数据
      dbTableList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        tableName: undefined,
        tableComment: undefined
      }
    }
  },
  methods: {
    // 显示弹框
    show() {
      this.getList()
      this.visible = true
    },
    clickRow(row) {
      this.$refs.table.toggleRowSelection(row)
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.tables = selection.map(item => item.tableName)
    },
    // 查询表数据
    getList() {
      listDbTable(this.queryParams).then(res => {
        if (res.code === 200) {
          this.dbTableList = res.rows
          this.total = res.total
        }
      })
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
    /** 导入按钮操作 */
    handleImportTable() {
      const tableNames = this.tables.join(',')
      if (tableNames == '') {
        this.$modal.msgError('请选择要导入的表')
        return
      }
      importTable({ tables: tableNames }).then(res => {
        this.$modal.msgSuccess(res.msg)
        if (res.code === 200) {
          this.visible = false
          this.$emit('ok')
        }
      })
    }
  }
}
</script>
