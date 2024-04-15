<template>
  <div class="auto-btn">
    <!-- 原始按钮 -->
    <div ref="defaultBtn">
      <slot></slot>
    </div>
    <!-- 显示按钮 -->
    <div class="display-btn" ref="displayBtn" />
    <!-- 更多按钮 -->
    <el-dropdown v-show="isMore">
      <el-button ref="moreBtnTxt" size="mini" type="text">更多 <i class="el-icon-arrow-down"></i></el-button>
      <el-dropdown-menu slot="dropdown">
        <div class="more-btn" ref="moreBtn" />
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
export default {
  name:'DcAutoBtn',
  data() {
    return {
      isMore: false
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.$nextTick(() => {
        const btnList = Array.from(this.$refs.defaultBtn.querySelectorAll('button'))
        if (btnList.length <= 3) {
          this.isMore = false
          this.$refs.displayBtn.append(...btnList)
        } else {
          this.isMore = true
          const displayButtons = btnList.filter((btn, index) => index < 2)
          const moreButtons = btnList.filter((btn, index) => index >= 2)
          this.$refs.displayBtn.append(...displayButtons)
          this.$refs.moreBtn.append(...moreButtons)
        }
        this.$nextTick(() => {
          if(this.$refs.moreBtnTxt?.$el){
            const displayBtns = Array.from(this.$refs.displayBtn.querySelectorAll('button'))
            const buttonWidthSum = displayBtns.reduce((prev, button) => {
              return prev + (button.clientWidth + 24)
            }, 0)
            const moreBtnWidth = this.$refs.moreBtnTxt.$el.clientWidth + 24
            let fixedColWidth = this.isMore ? buttonWidthSum + moreBtnWidth : buttonWidthSum
            this.$emit('changeWidth', fixedColWidth + 10 > 80 ? fixedColWidth + 10 : 80)
          }
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep.auto-btn {
  display: flex;
  align-items: center;
}

::v-deep .more-btn {
  display: flex;
  flex-direction: column;
  .el-button {
    padding: 6px 7px;
    margin: 0;
    color: #262626;
    border-radius: 3px;
    text-align: left;
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
