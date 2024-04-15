import { checkPermi } from "@/utils/permission";
import { mapGetters } from 'vuex'
import { getOrgList } from '@/api/system/org'
import { getProductInfo } from '@/api/system/productInfo.js'
export default {
  data(){
    return {
      tableFixedOptWidth:0,
      isShowTooltip: false,
      orgOptions: [],
      proOptions: [],
      proOptionsInit: [],
      proOptionsInDialog: [],
      proOptionsInDialogInit: [],
      firstProIdDefault: undefined
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
    firstOrgCode() {
      return this.orgOptions.length > 0 ? this.orgOptions[0].orgCode : undefined
    },
    firstProId() {
      return this.proOptions.length > 0 ? this.proOptions[0].productId : undefined
    }
  },
  methods: {
    checkPermi,
    formatterBlank(row, column, cellValue) {
      if (cellValue === null || cellValue === undefined || cellValue === "") {
        return "-"; // 空值时显示横杠字符
      }
      return cellValue; // 其他情况返回原值
    },
    //前端常量options表格格式化：值转化成名称value=>label
    constFormatterGet(options) {
      return (row, column, cellValue, index) =>
        this.constFormatter(row, column, cellValue, index, options);
    },
    constFormatter(row, column, cellValue, index, options) {
      if (cellValue === null || cellValue === undefined || cellValue === "") {
        return "-"; // 空值时显示横杠字符
      }
      const target = options.find((item) => item.value === cellValue);
      if (target) {
        return target.label;
      } else {
        return cellValue;
      }
    },
    cascaderDataFormatter(data) {
      if (data == undefined) {
        return;
      }
      for (var i = 0; i < data.length; i++) {
        if (data[i].children?.length < 1) {
          data[i].children = undefined;
        } else {
          this.cascaderDataFormatter(data[i].children);
        }
      }
      return data;
    },
    changeTableFixedOptWidth(width) {
      this.tableFixedOptWidth = width;
    },
    /** 获取机构 */
    async getOrg() {
      try {
        const response = await getOrgList()
        this.orgOptionsInit = response.data.map(item => ({ ...item }))
        this.orgOptions = this.handleTree(response.data, 'orgCode', 'parentCode')
      } catch (error) {
        console.error('Error:机构接口有误', error)
      }
    },
    /** 转换机构数据结构 */
    normalizerOrg(node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.orgCode,
        label: node.orgName,
        children: node.children
      }
    },
    /** 获取项目 */
    async getPro() {
      this.proOptionsInit = []
      this.proOptions = []
      try {
        const response = await getProductInfo(this.queryParams.orgCode)
        this.proOptionsInit = response.data.map(item => ({ ...item }))
        this.proOptions = this.handleTree(response.data, 'productId', 'parentId')
        if (this.queryParams.orgCode === this.firstOrgCode) {
          this.firstProIdDefault = this.proOptions.length > 0 ? this.proOptions[0].productId : undefined
        }
      } catch (error) {
        console.error('Error:项目接口有误', error)
      }
    },
    /** 转换项目数据结构 */
    normalizerPro(node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.productId,
        label: node.productName,
        children: node.children
      }
    },
    /** 新增编辑弹窗获取项目 */
    async getProInDialog() {
      this.proOptionsInDialog = []
      this.proOptionsInDialogInit = []
      try {
        const response = await getProductInfo(this.form.orgCode)
        this.proOptionsInDialogInit = response.data.map(item => ({ ...item }))
        this.proOptionsInDialog = this.handleTree(response.data, 'productId', 'parentId')
      } catch (error) {
        console.error('Error:项目接口有误', error)
      }
    },
    scrollTree() {
      this.isShowTooltip = false
    },
    onMouseOverTooltip(ref) {
      this.isShowTooltip = false
      let scrollWidth = 0,
        offsetWidth = 0,
        targetDom = this.$refs[ref]
      if (targetDom) {
        scrollWidth = targetDom.scrollWidth
        offsetWidth = targetDom.offsetWidth
      }
      let isOverflow = scrollWidth > offsetWidth
      this.isShowTooltip = isOverflow
    }
  },
};
