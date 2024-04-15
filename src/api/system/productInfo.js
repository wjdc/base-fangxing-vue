import request from "@/utils/request";

// 查询项目列表
export function getProductInfo(orgCode) {
  return request({
    url: "/system/productInfo/getProductInfoByOrgCode",
    method: "get",
    params:{
      orgCode
    }
  });
}

// 查询岗位详细
export function getDeviceSnInfo(productId) {
  return request({
    url: "/system/productInfo/getDeviceSnInfoByProductId/" + productId,
    method: "get",
  });
}


