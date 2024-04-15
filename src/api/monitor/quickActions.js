import request from '@/utils/request'

// 向繁星平台推送菜单
export function pushCommand() {
  return request({
    url: '/system/menuPush/pushCommand',
    method: 'get'
  })
}
