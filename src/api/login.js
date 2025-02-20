import request from '@/utils/request'
import { encrypt } from '@/utils/jsencrypt'

// 登录方法
export function login(username, password, code, uuid) {
  password = encrypt(password);
  return request({
    url: '/ims-auth/login',
    headers: {
      isToken: false
    },
    method: 'post',
    data: { username, password, code, uuid }
  })
}

// 注册方法
export function register(data) {
  return request({
    url: '/ims-auth/register',
    headers: {
      isToken: false
    },
    method: 'post',
    data: data
  })
}

// 刷新方法
export function refreshToken() {
  return request({
    url: '/ims-auth/refresh',
    method: 'post'
  })
}

// 获取用户详细信息
export function getInfo() {
  return request({
    url: '/system/user/getInfo',
    method: 'get'
  })
}

// 退出方法
export function logout() {
  return request({
    url: '/ims-auth/logout',
    method: 'delete'
  })
}

// 获取验证码
export function getCodeImg() {
  return request({
    url: '/ims-auth/code',
    headers: {
      isToken: false
    },
    method: 'get',
    timeout: 20000
  })
}
