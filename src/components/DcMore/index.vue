<template>
  <div ref="tableMore" class="table-opt-more">
    <div v-for="(button, index) in visibleBtns" :key="index">
      <el-button v-if="!button.vIf || button.vIf(row)" type="text" size="small" :disabled="isButtonDisabled(button, row)" @click="button.handler(row)">
        {{ button.label }}
      </el-button>
    </div>
    <div v-if="hiddenBtns.length > 1">
      <el-dropdown>
        <el-button size="mini" type="text">更多 <i class="el-icon-arrow-down"></i></el-button>
        <el-dropdown-menu slot="dropdown">
          <div class="btn-box" v-for="(button, index) in hiddenBtns" :key="index">
            <el-button v-if="!button.vIf || button.vIf(row)" type="text" size="small" :disabled="isButtonDisabled(button, row)" @click="button.handler(row)">
              {{ button.label }}
            </el-button>
          </div>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DcMore',
  props: {
    buttons: {
      type: Array,
      required: true
    },
    maxVisibleButtons: {
      type: Number,
      default: 3
    },
    row: {
      type: Object
    }
  },
  computed: {
    allBtns() {
      return this.buttons.filter(button => !button.vIf || button.vIf(this.row))
    },
    visibleBtns() {
      const buttons = this.allBtns
      if (buttons.length <= this.maxVisibleButtons) {
        return buttons
      } else {
        return buttons.slice(0, this.maxVisibleButtons - 1)
      }
    },
    hiddenBtns() {
      const buttons = this.allBtns
      if (buttons.length > this.maxVisibleButtons) {
        return buttons.slice(this.maxVisibleButtons - 1)
      } else {
        return []
      }
    }
  },
  mounted() {
    this.allWidthGet()
  },
  methods: {
    isButtonDisabled(button, row) {
      if (typeof button.disabled === 'function') {
        return button.disabled(row)
      } else {
        return Boolean(button.disabled)
      }
    },
    allWidthGet() {
      this.$nextTick(() => {
        let fixedColWidth = this.$refs.tableMore.clientWidth
        this.$emit('changeWidth', fixedColWidth + 10 > 80 ? fixedColWidth + 10 : 80)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.table-opt-more {
  display: inline-flex;
  flex-wrap: nowrap;
  & > div {
    flex-grow: 0;
    flex-shrink: 0;
  }
}
::v-deep .btn-box {
  display: flex;
  flex-direction: column;
  .el-button {
    padding: 6px 7px;
    margin: 0;
    color: #262626;
    border-radius: 3px;
    text-align: left;
    min-width: 72px;
    font-size: 14px;
    & + .el-button {
      margin-top: 2px;
    }

    & > [class^='el-icon-'] {
      display: none;
    }
    & > [class*='el-icon-'] + span {
      margin-left: 0;
    }
  }

  .el-button:hover {
    background-color: #f3f3f3;
  }

  .is-disabled {
    color: #999 !important;
  }

  .is-disabled:hover {
    background-color: transparent !important;
  }
}
</style>
