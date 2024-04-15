<template>
  <span :class="['status-tag', dot && 'status-tag-dot', 'status-tag-' + tagType]">
    <slot>{{ tagName }}</slot>
  </span>
</template>

<script>
export default {
  name: 'DcTag',
  props: {
    type: String,
    dot: Boolean,
    options: Array,
    value: null
  },
  data() {
    return {}
  },
  computed: {
    tagType() {
      if (this.type) {
        return this.type
      } else {
        if (this.options  && this.value !== undefined) {
          let target = this.options.find(item => item.value == this.value)
          if (target) {
            return target.raw.listClass
          } else {
            return ''
          }
        } else {
          return ''
        }
      }
    },
    tagName() {
      if (this.options && this.value !== undefined) {
        let target = this.options.find(item => item.value == this.value)
        if (target) {
          return target.label
        } else {
          return this.blankFilter(this.value)
        }
      } else {
        return ''
      }
    }
  },
  methods: {
    blankFilter(value) {
      if (value === null || value === undefined || value === '') {
        return '-' // 空值时显示横杠字符
      }
      return value // 其他情况返回原值
    }
  }
}
</script>

<style lang="scss" scoped>
.status-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  line-height: 20px;
  border-radius: 3px;
  padding: 2px 8px;
  color: #2568f1;
  background: #ecf2fe;
  &.status-tag-,&.status-tag-null {
    font-size: 14px;
    color: var(--textColor);
    padding: 0;
    border: 0;
    background: none;
    line-height: 22px;
  }
  &.status-tag-primary {
    color: #2568f1;
    background: #ecf2fe;
  }
  &.status-tag-success {
    color: #00a870;
    background: #e8f8f2;
  }
  &.status-tag-danger {
    color: #e34d59;
    background: #fdecee;
  }
  &.status-tag-warning {
    color: #ed7b2f;
    background: #fef3e6;
  }
  &.status-tag-info {
    color: #262626;
    background: #f3f3f3;
  }
  &.status-tag-dot {
    font-size: 14px;
    line-height: 22px;
    color: #262626;
    background: none;
    padding: 0;
    &::before {
      content: '';
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #2568f1;
      margin-right: 8px;
    }
    &.status-tag-primary {
      &::before {
        background: #2568f1;
      }
    }
    &.status-tag-danger {
      &::before {
        background: #e34d59;
      }
    }
    &.status-tag-success {
      &::before {
        background: #00a870;
      }
    }
    &.status-tag-warning {
      &::before {
        background: #ed7b2f;
      }
    }
    &.status-tag-info {
      &::before {
        background: #999999;
      }
    }
  }
}
</style>
