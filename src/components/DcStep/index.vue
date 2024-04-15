<template>
  <div
    class="step-item"
    :style="style"
    :class="[
      `is-${currentStatus}`,
      isLast &&  !isCenter && 'is-flex',
    ]">
    <div class="step-icon">
      <svg-icon icon-class="check" v-if="currentStatus === 'success'" />
      <span v-else>{{ index + 1 }}</span>
    </div>
    <div class="step-name">{{ title }}</div>
    <div class="step-line" v-if="!isLast"></div>
  </div>
</template>

<script>
export default {
  name: 'DcStep',
  props: {
    title: String,
    icon: String,
    description: String,
    status: String
  },
  data() {
    return {
      index: -1,
      internalStatus: ''
    }
  },
  beforeCreate() {
    this.$parent.steps.push(this)
  },

  beforeDestroy() {
    const steps = this.$parent.steps
    const index = steps.indexOf(this)
    if (index >= 0) {
      steps.splice(index, 1)
    }
  },
  computed: {
    currentStatus() {
      return this.status || this.internalStatus
    },
    prevStatus() {
      const prevStep = this.$parent.steps[this.index - 1]
      return prevStep ? prevStep.currentStatus : 'wait'
    },
    isCenter() {
      return this.$parent.alignCenter
    },
    isVertical() {
      return this.$parent.direction === 'vertical'
    },
    isSimple() {
      return this.$parent.simple
    },
    isLast() {
      const parent = this.$parent
      return parent.steps[parent.steps.length - 1] === this
    },
    stepsCount() {
      return this.$parent.steps.length
    },
    style: function () {
      const style = {}
      const parent = this.$parent
      const len = parent.steps.length

      const space = typeof this.space === 'number' ? this.space + 'px' : this.space ? this.space : 100 / (len - (this.isCenter ? 0 : 1)) + '%'
      style.flexBasis = space
      if (this.isVertical) return style
      if (this.isLast) {
        style.maxWidth = 100 / this.stepsCount + '%'
      } else {
        style.marginRight = -this.$parent.stepOffset + 'px'
      }

      return style
    }
  },
  methods: {
    updateStatus(val) {
      // const prevChild = this.$parent.$children[this.index - 1]

      if (val > this.index) {
        this.internalStatus = this.$parent.finishStatus
      } else if (val === this.index && this.prevStatus !== 'error') {
        this.internalStatus = this.$parent.processStatus
      } else {
        this.internalStatus = 'wait'
      }

      // if (prevChild) prevChild.calcProgress(this.internalStatus)
    }
  },
  mounted() {
    const unwatch = this.$watch('index', val => {
      this.$watch('$parent.active', this.updateStatus, { immediate: true })
      this.$watch(
        '$parent.processStatus',
        () => {
          const activeIndex = this.$parent.active
          this.updateStatus(activeIndex)
        },
        { immediate: true }
      )
      unwatch()
    })
  }
}
</script>

<style lang="scss" scoped>
.step-item {
  display: flex;
  align-items: center;
  color: #000000;
}
.step-icon {
  border: 1px solid #2568f1;
  border-radius: 50%;
  height: 24px;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
}
.step-name {
  margin: 0 16px;
}
.step-line {
  height: 1px;
  background: #999999;
  margin-right: 16px;
  flex: 1;
  margin-left: auto;
}
.is-success {
  .step-icon {
    color: #2568f1;
  }
  .step-line {
    height: 2px;
    background: #2568f1;
  }
}
.is-process {
  .step-icon {
    color: #fff;
    background: #2568f1;
  }
  .step-name {
    font-weight: bold;
    color: #2568f1;
  }
}
.is-wait {
  .step-icon {
    border-color: #999999;
  }
  color: #999999;
}

.step-item:last-of-type.is-flex {
  -ms-flex-preferred-size: auto !important;
  flex-basis: auto !important;
  -ms-flex-negative: 0;
  flex-shrink: 0;
  -webkit-box-flex: 0;
  -ms-flex-positive: 0;
  flex-grow: 0;
  .step-name{margin-right: 0;}
}
</style>
