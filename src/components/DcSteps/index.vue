<template>
  <div class="dc-steps">
    <slot></slot>
  </div>
</template>

<script>
import Migrating from 'element-ui/src/mixins/migrating'

export default {
  name: 'DcSteps',
  mixins: [Migrating],
  props: {
    space: [Number, String],
    active: Number,
    direction: {
      type: String,
      default: 'horizontal'
    },
    alignCenter: Boolean,
    simple: Boolean,
    finishStatus: {
      type: String,
      default: 'success'
    },
    processStatus: {
      type: String,
      default: 'process'
    }
  },

  data() {
    return {
      steps: [],
      stepOffset: 0
    }
  },

  methods: {
    getMigratingConfig() {
      return {
        props: {
          center: 'center is removed.'
        }
      }
    }
  },

  watch: {
    active(newVal, oldVal) {
      this.$emit('change', newVal, oldVal)
    },

    steps(steps) {
      steps.forEach((child, index) => {
        child.index = index
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.dc-steps {
  display: flex;
}
</style>
