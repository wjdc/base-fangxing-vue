export default {
  // 属性类型
  ATTR_TYPE: [
    { label: "销售属性", value: 0 },
    { label: "通用属性", value: 1 },
    { label: "通用或销售属性", value: 2 },
  ],
  // 选择值类型
  VALUE_TYPE: [
    { label: "单选", value: 0 },
    { label: "多选", value: 1 },
  ],
  // 输入类型
  INPUT_TYPE: [
    { label: "选择", value: "1" },
    { label: "输入", value: "2" },
  ],
  // spu商品上架状态
  LISTING_STATUS: [
    { label: "初始状态", value: 0, type: "warning" },
    { label: "上架", value: 1, type: "success" },
    { label: "下架", value: 2, type: "info" },
  ],
};
