<template>
  <div :class="{'hidden':hidden}" class="pagination-container">
    <el-pagination
      :background="background"
      :current-page.sync="currentPage"
      :page-size.sync="pageSize"
      :layout="layout"
      :page-sizes="pageSizes"
      :pager-count="pagerCount"
      :total="total"
      v-bind="$attrs"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script>
import { scrollTo } from '@/utils/scroll-to'

export default {
  name: 'Pagination',
  props: {
    total: {
      required: true,
      type: Number
    },
    page: {
      type: Number,
      default: 1
    },
    limit: {
      type: Number,
      default: 20
    },
    pageSizes: {
      type: Array,
      default() {
        return [10, 20, 30, 50]
      }
    },
    // 移动端页码按钮的数量端默认值5
    pagerCount: {
      type: Number,
      default: document.body.clientWidth < 992 ? 5 : 5
    },
    layout: {
      type: String,
      default: ' prev, pager, next, jumper,sizes,total'
    },
    background: {
      type: Boolean,
      default: true
    },
    autoScroll: {
      type: Boolean,
      default: true
    },
    hidden: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
    };
  },
  computed: {
    currentPage: {
      get() {
        return this.page
      },
      set(val) {
        this.$emit('update:page', val)
      }
    },
    pageSize: {
      get() {
        return this.limit
      },
      set(val) {
        this.$emit('update:limit', val)
      }
    }
  },
  methods: {
    handleSizeChange(val) {
      if (this.currentPage * val > this.total) {
        this.currentPage = 1
      }
      this.$emit('pagination', { page: this.currentPage, limit: val })
      if (this.autoScroll) {
        scrollTo(0, 800)
      }
    },
    handleCurrentChange(val) {
      this.$emit('pagination', { page: val, limit: this.pageSize })
      if (this.autoScroll) {
        scrollTo(0, 800)
      }
    }
  }
}
</script>

<style scoped>
/* .pagination-container {
  background: #fff;
  padding: 32px 16px;
}
.pagination-container.hidden {
  display: none;
} */
</style>
<style scoped>
.pagination-container {
  min-height: 32px;
  margin: 24px 0 0;
  position: relative;
}
.pagination-container .el-pagination {
  padding: 0;
  text-align: right;
}

.pagination-container.hidden {
  display: none;
}

::v-deep .el-pagination span:not([class*='suffix']),
.el-pagination button {
  font-size: 14px;
  color: #666666;
  height: 32px;
  line-height: 32px;
}
::v-deep .el-pagination__total {
  margin-right: 0;
}
::v-deep .el-pagination__sizes {
  margin: 0 8px;
}
.pagination-container ::v-deep .el-input__inner {
  height: 32px;
  font-size: 14px;
}
::v-deep .el-pagination__jump {
  margin-left: 14px;
}
::v-deep .el-pagination.is-background .btn-prev,
::v-deep .el-pagination.is-background .btn-next,
::v-deep .el-pagination.is-background .el-pager li {
  min-width: 32px;
  height: 32px;
  line-height: 30px;
  margin: 0 4px;
  font-size: 14px;
}
::v-deep .el-pagination.is-background .btn-prev,
::v-deep .el-pagination.is-background .btn-next,
::v-deep .el-pagination.is-background .el-pager li {
  border: 1px solid #dcdcdc;
  border-radius: 3px;
  background: transparent;
  font-weight: normal;
  color: #666;
}
::v-deep .el-pagination.is-background .btn-prev:disabled,
::v-deep .el-pagination.is-background .btn-next:disabled {
  color: #BDBDBD;
  border: 1px solid #dcdcdc;
}
::v-deep .el-pagination.is-background .el-pager li:not(.disabled).active {
  border: 1px solid var(--themeColor);
  background: transparent;
  color: var(--themeColor);
}
::v-deep .el-pagination__editor.el-input {
  width: 48px;
  margin: 0 8px 0 10px;
  height: 100%;
  padding: 0;
}
::v-deep .el-pagination.is-background .el-pager li.btn-quicknext,
::v-deep .el-pagination.is-background .el-pager li.btn-quickprev {
  border-color: transparent;
}

::v-deep  .el-pagination.is-background .el-pager li.btn-quicknext.el-icon-more,
::v-deep  .el-pagination.is-background .el-pager li.btn-quickprev.el-icon-more{
  color: #262626;
  font-size: 14px;
}

::v-deep .el-pagination__sizes{line-height: initial !important;}
</style>
