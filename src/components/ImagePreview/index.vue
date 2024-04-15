<template>
  <el-image
    :src="`${realSrc}`"
    fit="cover"
    :style="`width:${realWidth};height:${realHeight};`"
    :preview-src-list="realSrcList"
  >
    <div slot="error" class="image-slot">
      <i class="el-icon-picture-outline"></i>
    </div>
  </el-image>
</template>

<script>
export default {
  name: "ImagePreview",
  props: {
    src: {
      type: String,
      default: ""
    },
    width: {
      type: [Number, String],
      default: ""
    },
    height: {
      type: [Number, String],
      default: ""
    },
    previewSrc:{
      type: String,
      default: ""
    }
  },
  computed: {
    realSrc() {
      if (!this.src) {
        return;
      }
      let real_src = this.src.indexOf(",") > 0 ? this.src.split(",")[0] : this.src;
      return real_src;
    },
    realSrcList() {
      if (this.previewSrc){
        return  this.previewSrc.indexOf(",") > 0 ? this.previewSrc.split(",") : [this.previewSrc];
      }
      if (!this.src) {
        return;
      }
      return this.src.indexOf(",") > 0 ? this.src.split(",") : [this.src];
    },
    realWidth() {
      return typeof this.width == "string" ? this.width : `${this.width}px`;
    },
    realHeight() {
      return typeof this.height == "string" ? this.height : `${this.height}px`;
    }
  },
};
</script>

<style lang="scss" scoped>
.el-image {
  background-color: #f3f3f3;
  ::v-deep .el-image__inner {
    transition: all 0.3s;
    cursor: pointer;
    &:hover {
      transform: scale(1.2);
    }
  }
  ::v-deep .image-slot {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    color: #909399;
    font-size: 30px;
  }
}
</style>
