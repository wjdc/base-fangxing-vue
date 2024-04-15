<script>
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
export default {
  name: 'DcTreeselect',
  extends: Treeselect,
  props: {
    noResultsText: {
      default: function () {
        return '无匹配数据'
      }
    },
    noOptionsText: {
      default: function () {
        return '无数据'
      }
    },
    appendToBody:{
      default:true
    },
    zIndex:{
      default:'999999'
    }
  },
  watch: {
    internalValue(o) {
      if (this.$parent?.isRequired) {
        if (o.length > 0) {
          this.$parent.validateState = ''
        }
      }
    }
  }
}
</script>
<style lang="scss">
// treeselect全局样式
body {
  .vue-treeselect__placeholder,
  .vue-treeselect__single-value {
    line-height: 30px;
    font-size: 14px;
  }
  .vue-treeselect__placeholder {
    color: #999;
  }
  .vue-treeselect__option--highlight {
    background-color: var(--hoverBg);
  }

  .vue-treeselect__control {
    .vue-treeselect__control-arrow {
      display: none;
    }
    .vue-treeselect__x {
      display: none;
    }
    .vue-treeselect__x-container:before {
      display: none;
    }
    .vue-treeselect__x-container:hover:before {
      color: #666;
    }
    &:hover {
      .vue-treeselect__x-container:before {
        display: inline-block;
      }
    }
  }

  .vue-treeselect {
    font-size: 14px;
    .vue-treeselect__control {
      height: 32px;
      border-radius: 3px;
      padding: 0 7px 0 3px;
      border: 1px solid var(--borderColor);
      transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
    }
    .vue-treeselect__control:hover {
      border-color: #c0c4cc;
    }
    .vue-treeselect__input-container {
      line-height: 30px;
    }
    .vue-treeselect__option {
      line-height: 28px;
      border-radius: 3px;
    }
    .vue-treeselect__label {
      font-weight: normal;
    }
    .vue-treeselect__option--highlight {
      background: var(--hoverBg);
    }
    .vue-treeselect__single-value {
      color: #11151a;
    }
    &:not(.vue-treeselect--disabled):not(.vue-treeselect--focused) .vue-treeselect__control:hover {
      border-color: var(--themeColor);
    }
  }
  .is-error .vue-treeselect{
    .vue-treeselect__control{
      border-color:var(--errorColor);
    }
    &:not(.vue-treeselect--disabled):not(.vue-treeselect--focused) .vue-treeselect__control:hover {
      border-color:var(--errorColor);
    }
  }
  .el-form-item--medium .vue-treeselect{
    .vue-treeselect__control {
      height: 36px;
      line-height:36px
    }
    .vue-treeselect__placeholder,.vue-treeselect__single-value{line-height: 34px;}
  }
  .vue-treeselect--focused {
    .vue-treeselect__control {
      border-color:var(--themeColor) !important;
    }
    &:not(.vue-treeselect--open) .vue-treeselect__control {
      border-color: var(--themeColor);
      box-shadow: none;
    }
  }

  .vue-treeselect--disabled {
    cursor: not-allowed;
    .vue-treeselect__control {
      background-color: #eee;
    }
    .vue-treeselect__control:hover {
      border-color: var(--borderColor);
    }
    .vue-treeselect__single-value {
      color: #B0B0B0;
    }
  }

  .vue-treeselect--single {
    .vue-treeselect__option--selected {
      background: inherit;
    }
    .vue-treeselect__option--selected:hover {
      background: var(--hoverBg);
    }
    .vue-treeselect__option--selected .vue-treeselect__label {
      color: var(--themeColor);
    }
    .vue-treeselect__input {
      cursor: pointer;
    }
  }
  .vue-treeselect__tip-text {
    color: #999;
    font-size: 14px;
    text-align: center;
  }
  .vue-treeselect__tip .vue-treeselect__icon-container {
    display: none;
  }
  .vue-treeselect--open {
    &.vue-treeselect--open-below {
      .vue-treeselect__menu {
        margin-top: 12px !important;
        padding: 6px;
        color: var(--textColor);
        border-radius: 3px;
        border:0.5px solid var(--borderColor);
        box-shadow: var(--popperShadow);
        &::-webkit-scrollbar {
          width: 6px;
          height: 4px;
          background: transparent;
        }

        &::-webkit-scrollbar-thumb {
          width: 6px;
          transform: rotate(90deg);
          background: rgba(144, 147, 153, 0.3);
          border-radius: 4px;
        }
      }

      .vue-treeselect__menu-container {
        z-index: 2001 !important;
        &::before {
          content: ' ';
          border-width: 6px;
          position: absolute;
          display: block;
          width: 0;
          height: 0;
          border-color: transparent;
          border-style: solid;
          border-width: 6px;
          top: 7px;
          left: 35px;
          margin-right: 3px;
          border-top-width: 0;
          border-bottom-color: #e6ebf5;
          filter: drop-shadow(0 2px 12px rgba(0, 0, 0, 0.03));
          display: none;
        }
        &::after {
          position: absolute;
          display: block;
          width: 0;
          height: 0;
          border-color: transparent;
          border-style: solid;
          content: ' ';
          border-width: 6px;
          top: 8px;
          left: 35px;
          border-top-width: 0;
          border-bottom-color: #ffffff;
          display: none;
        }
      }
      .vue-treeselect__control {
        border-bottom-left-radius: 4px !important;
        border-bottom-right-radius: 4px !important;
      }
    }
    .vue-treeselect__control-arrow-container:before {
      transform: rotateZ(0deg);
    }
  }

  .vue-treeselect__x-container:before {
    font-family: 'element-icons' !important;
    speak: none;
    font-style: normal;
    font-weight: normal;
    font-variant: normal;
    text-transform: none;
    line-height: 1;
    vertical-align: baseline;
    display: inline-block;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    content: '\e79d';
    color: #666;
  }

  .vue-treeselect--has-value:not(.vue-treeselect--disabled) .vue-treeselect__control:hover .vue-treeselect__x-container+.vue-treeselect__control-arrow-container {
    display: none;
  }
  .vue-treeselect--has-value .vue-treeselect__input {
    vertical-align: initial;
  }
  .vue-treeselect__control-arrow-container:before {
    font-family: 'element-icons' !important;
    speak: none;
    font-style: normal;
    font-weight: normal;
    font-variant: normal;
    text-transform: none;
    line-height: 1;
    vertical-align: baseline;
    display: inline-block;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    content: '\E6E1';
    transition: transform 0.3s, -webkit-transform 0.3s;
    transform: rotateZ(180deg);
    color: #666;
  }
}
</style>
