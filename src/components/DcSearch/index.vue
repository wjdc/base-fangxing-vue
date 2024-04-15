<template>
  <div type="flex" :class="['dc-search-row ', isMoreShow ? 'more-show' : '', hasMore ? 'has-more' : 'no-more']">
    <slot></slot>
    <div class="dc-search-control" v-if="hasOpt">
      <el-form-item>
        <slot name="opt"></slot>
        <el-button type="text" @click="toggleMoreShow" size="small" class="dc-search-control-more"> {{ isMoreShow ? '收起' : '展开' }} <i class="el-icon-"></i> </el-button>
      </el-form-item>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DcSearch',
  data() {
    return {
      hasMore: true
    }
  },
  props: {
    isMoreShow: {
      type: Boolean,
      default: false
    },
    hasOpt:{
      type: Boolean,
      default: true
    }
  },

  mounted() {
    this.hasMoreGet()
  },
  methods: {
    toggleMoreShow() {
      this.$emit('update:isMoreShow', !this.isMoreShow)
    },
    hasMoreGet() {
      const itemCount = this.$slots.default.filter(item=>item.tag!==undefined).length
      this.hasMore = itemCount > 3
    }
  }
}
</script>

<style lang="scss">
// dc通用搜索区
.dc-search-row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -12px;
  &.has-more {
    & > .el-form-item:nth-child(n + 4) {
      display: none;
    }
    .dc-search-control-more {
      display: inline-block;
    }
  }
  &.has-more.more-show {
    & > .el-form-item:nth-child(n + 2) {
      display: block !important;
    }
  }
  .dc-search-control {
    width: auto;
    margin-left: auto;
    .el-form-item__content {
      margin-left: 0 !important;
    }
  }
  .dc-search-control-more {
    display: none;
    margin-left: 15px;
  }
  .el-icon-:before {
    content: '\e6df';
  }
  &.more-show .el-icon- {
    transform: rotateZ(-180deg);
  }
  .el-select,
  .el-date-editor {
    width: 100%;
  }
  .el-form-item__label {
    padding: 0 4px 0 0;
  }
  .el-form-item {
    padding: 0 12px;
  }
  .el-form-item--small.el-form-item {
    margin-bottom: 24px;
  }
}
@media only screen and (max-width: 767px) {
  .dc-search-row {
    .el-form-item__label {
      text-align: left;
      width: auto !important;
    }
    .el-form-item__content {
      margin-left: 0 !important;
    }
    & > .el-form-item {
      flex: 0 0 100%;
      max-width: 100%;
    }
    &.has-more > .el-form-item:nth-child(2) {
      display: none;
    }
    &.has-more > .el-form-item:nth-child(3) {
      display: none;
    }
  }
}
@media only screen and (min-width: 768px) {
  .dc-search-row {
    & > .el-form-item {
      flex: 0 0 50%;
      max-width: 50%;
    }
    &.has-more > .el-form-item:nth-child(2) {
      display: none;
    }
    &.has-more > .el-form-item:nth-child(3) {
      display: none;
    }
  }
}

@media only screen and (min-width: 1200px) {
  .dc-search-row {
    & > .el-form-item {
      flex: 0 0 33.33333333%;
      max-width: 33.33333333%;
    }
    &.has-more > .el-form-item:nth-child(2) {
      display: block;
    }
  }
}
@media only screen and (min-width: 1440px) {
  .dc-search-row {
    & > .el-form-item {
      flex: 0 0 25%;
      max-width: 25%;
    }
    &.has-more > .el-form-item:nth-child(3) {
      display: block;
    }
  }
}
@media only screen and (min-width: 1440px) {
  .dc-search-row {
    & > .el-form-item {
      flex: 0 0 25%;
      max-width: 25%;
    }
    &.has-more > .el-form-item:nth-child(3) {
      display: block;
    }
    &.has-more > .el-form-item:nth-child(3) {
      display: block;
    }
    &.no-more .el-date-editor--daterange{
      min-width: 240px;
    }
  }
}

</style>
