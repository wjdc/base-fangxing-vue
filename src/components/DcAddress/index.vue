
<template>
  <div>
    <el-cascader v-model="areaCodes" :options="options" :props="{ label: 'name', value: 'areaCode' }" style="width: 100%" clearable filterable></el-cascader>
    <el-input type="textarea" v-model="address" placeholder="请输入详细地址" maxlength="50" show-word-limit style="margin-top: 10px"></el-input>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'DcAddress',
  props: {
    value: {
      type: Object,
      required: true,
      default: function () {
        return {
          address: '',
          areaCodes: []
        }
      }
    }
  },
  data() {
    return {
      options: []
    }
  },
  computed: {
    ...mapGetters([
      'constData',
    ]),
    address: {
      get() {
        return this.value.address
      },
      set(newValue) {
        this.value.address = newValue
        this.$emit('input', { areaCodes: this.areaCodes, address: newValue })
      }
    },
    areaCodes: {
      get() {
        return this.value.areaCodes
      },
      set(newValue) {
        this.value.areaCodes = newValue
        this.$emit('input', { areaCodes: newValue, address: this.address })
      }
    }
  },
  created() {
    this.getOptions()
  },
  methods: {
    getOptions() {
      const data=this.constData?.AREA_POSITION?this.constData.AREA_POSITION:[]
      this.options = this.cascaderDataFormatter(data)
    },
  }
}
</script>
<style lang="scss" scoped>
</style>
