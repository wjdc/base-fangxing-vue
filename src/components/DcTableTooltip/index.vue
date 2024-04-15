<template>
  <div>
    <el-popover :key="offsetWidth" placement="bottom" trigger="hover" v-if="row[prop + 'PopShow']" :width="widthNew" popper-class="dc-table-ellipsis-popover dark">
      <el-scrollbar style="height: 100%">
        <div style="max-height: 400px; padding-right: 15px">
          {{ row[prop] }}
        </div>
      </el-scrollbar>
      <div class="dc-table-cell-ellipsis" slot="reference" @mouseenter="popoverShow(row[refId], prop)" :ref="row[refId] + prop">{{ row[prop] }}</div>
    </el-popover>
    <div class="dc-table-cell-ellipsis" v-else @mouseenter="popoverShow(row[refId], prop)" :ref="row[refId] + prop">{{ row[prop] | blankFilter}}</div>
  </div>
</template>
<script>
export default {
  name: 'DcTableTooltip',
  data() {
    return {
      offsetWidth: 0
    }
  },
  props: {
    width: {
      type: [String, Number]
    },
    tableList: {
      type: Array,
      default: []
    },
    row: {
      type: Object,
      default: {}
    },
    prop: {
      type: String
    },
    refId: {
      type: String
    }
  },
  watch: {
    tableList: {
      handler(n) {
        n.map(m => {
          if (m[this.prop + 'PopShow'] === undefined) {
            this.$set(m, this.prop + 'PopShow', false)
          }
          return m
        })
      },
      immediate: true
    }
  },
  computed: {
    widthNew() {
      return this.width ? this.width : this.offsetWidth
    }
  },
  methods: {
    popoverShow(id, key) {
      const cell = this.$refs[id + key]
      this.offsetWidth = cell.offsetWidth
      if (cell.scrollWidth > cell.offsetWidth) {
        this.tableList.map(m => {
          id === m[this.refId] ? (m[key + 'PopShow'] = true) : (m[key + 'PopShow'] = false)
          return m
        })
      } else {
        this.tableList.map(m => {
          m[key + 'PopShow'] = false
          return m
        })
      }
    }
  }
}
</script>
<style lang="scss" scoped >
.dc-table-cell-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
<style lang="scss">
.el-popper.dc-table-ellipsis-popover {
  min-width: 300px;
  font-size: 14px;
  padding: 10px 0px 10px 15px;
  &[x-placement^='top'] {
    margin-bottom: 20px;
  }
  &[x-placement^='bottom'] {
    margin-top: 20px;
    .popper__arrow{
      top: -13px;
    }
  }
  &.dark {
    background: #303133;
    color: #fff;
    border: none;
    box-shadow: none;
    &[x-placement^='top'] .popper__arrow::after {
      border-top-color: #303133;
      border-width: 6px;
      bottom: -12px;
    }
    &[x-placement^='bottom'] .popper__arrow::after {
      border-bottom-color: #303133;
      border-width: 6px;
      bottom: -12px;
    }
    .el-scrollbar__thumb {
      background-color: rgba(255, 255, 255, 0.3);
    }
  }
}
</style>
