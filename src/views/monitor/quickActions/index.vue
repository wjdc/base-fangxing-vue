<template>
  <div class="app-container">
    <el-card>
    <el-form :model="queryParams" ref="queryForm" label-width="80px" size="small">
        <el-row>
          <el-button type="primary" v-hasPermi="['monitor:pushMenu:list']" @click="pushExceptionDetails">A-1：向繁星平台推送菜单</el-button>
        </el-row>
    </el-form>
  </el-card>
  </div>
</template>

<script>
import { pushCommand } from '@/api/monitor/quickActions'

export default {
  name: 'QuickActions',
  data() {
    return {
      // 遮罩层
      loading: true
    }
  },
  created() {
  },
  methods: {
    /** 查询登录日志列表 */
    getList() {
      this.loading = true
      pushCommand().then(response => {
        if(response.code == 200){
          this.$message.success(response.msg);
          this.loading = false
        }else{
          this.$message.error(response.msg);
          that.loading = false;
        }
        this.total = response.total
       
      })
    },
    /** 指令按钮操作 */
    pushExceptionDetails() {
      this.getList()
    }
  }
}
</script>

