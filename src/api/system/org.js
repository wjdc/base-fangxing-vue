import request from '@/utils/request'

// 查询org列表
export function getTreeList(query) {
  return request({
    url: '/system/org/treeList',
    method: 'get',
    params: query
  })
}

// 查询org列表
export function getOrgList(query) {
  return request({
    url: '/system/org/getOrgList',
    method: 'get',
    params: query
  })
}

// 查询org详细
export function getOrg(id) {
  return request({
    url: '/system/org/' + id,
    method: 'get'
  })
}

// 新增org
export function addOrg(data) {
  return request({
    url: '/system/org',
    method: 'post',
    data: data
  })
}

// 修改org
export function updateOrg(data) {
  return request({
    url: '/system/org',
    method: 'put',
    data: data
  })
}

// 删除org
export function delOrg(id) {
  return request({
    url: '/system/org/' + id,
    method: 'delete'
  })
}

// 上传图片
export function upload(data, orgCode) {
  return request({
    url: '/system/org/upload/' + orgCode,
    method: 'post',
    data: data
  })
}

// 校验机构编码
export function checkOrgCode(data) {
  return request({
    url: '/system/org/checkOrgCode/',
    method: 'post',
    data: data
  })
}
