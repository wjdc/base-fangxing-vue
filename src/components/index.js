import Vue from 'vue'
// dc 搜索组件
import DcSearch from "@/components/DcSearch";
// dc treeselect
import DcTreeselect from "@/components/DcTreeselect";
// dc 表格更多按钮
import DcAutoBtn from "@/components/DcAutoBtn";
// dc 表格更多按钮方式2
import DcMore from "@/components/DcMore";
// dc 省市区街道
import DcAddress from "@/components/DcAddress";
// dc 步骤条
import DcSteps from "@/components/DcSteps";
import DcStep from "@/components/DcStep";
import DcTag from "@/components/DcTag";

// dc el-table文字多浮层
import DcTableTooltip from "@/components/DcTableTooltip";

const components = [
  DcSearch,
  DcTreeselect,
  DcAutoBtn,
  DcMore,
  DcAddress,
  DcSteps,
  DcStep,
  DcTag,
  DcTableTooltip
];

const componentsPlugins = {
  install() {
    components.forEach((component) => {
      if(component.name){
        Vue.component(component.name, component);
      }else{
        console.error(`此组件未定义对应的name属性,请检查`, component);
      }
    });
  },
};


export default componentsPlugins
