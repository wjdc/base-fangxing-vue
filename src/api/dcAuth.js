import request from '@/utils/request'

// 获取统一认证地址
export function getDcRedirect() {
  return request({
    url: '/ims-auth/oauth2/authorize',
    method: 'get'
  })
}

// 获取token
export function getDcToken(data) {
  return request({
    url: '/ims-auth/codeLogin',
    method: 'get',
    params:data
  })
}

// 获取统一认证中心退出地址
export function getDcLogOutUrl() {
  return request({
    url: '/ims-auth/getAuthCenterLogoutUrl',
    method: 'get',
  })
}
