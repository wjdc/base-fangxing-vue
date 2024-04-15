import { getDcRedirect,getDcToken,getDcLogOutUrl} from '@/api/dcAuth'
import { getToken, setToken } from '@/utils/auth'
const dc_redirect=localStorage.getItem('dc_redirect')
const dc_logout_url=localStorage.getItem('dc_logout_url')

const dcAuth = {
  state: {
    token: getToken(),
    dc_redirect:dc_redirect,
    dc_logout_url:dc_logout_url
  },

  mutations: {
    SET_REDIRECT: (state, dc_redirect) => {
      state.dc_redirect = dc_redirect
    },
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_LOGOUTURL: (state, dc_logout_url) => {
      state.dc_logout_url = dc_logout_url
    },
  },

  actions: {
    //获取统一认证中心地址
    GetDcRedirect({commit}){
      return new Promise((resolve, reject)=>{
        getDcRedirect().then(res=>{
          // console.log(res)
          const dc_redirect=decodeURIComponent(res.oauth2Authorize)
          localStorage.setItem('dc_redirect',dc_redirect)
          commit('SET_REDIRECT',dc_redirect)
          resolve(res)
        }).catch(error => {
          reject(error)
        })
      })
    },
    //获取token
    GetDcToken({commit},code){
      return new Promise((resolve, reject)=>{
        getDcToken(code).then(res=>{
          // console.log(res)
          setToken(res.data.token)
          window.localStorage.setItem('loginFrom','dcAuth')
          commit('SET_TOKEN', res.data.token)
          resolve(res)
        }).catch(error => {
          reject(error)
        })
      })
    },
    //获取统一认证中心退出地址
    GetDcLogoutUrl({commit}){
      return new Promise((resolve, reject)=>{
        getDcLogOutUrl().then(res=>{
          // console.log(res)
          const dc_logout_url=decodeURIComponent(res.data.logoutUrl)
          localStorage.setItem('dc_logout_url',dc_logout_url)
          commit('SET_LOGOUTURL',dc_logout_url )
          resolve(res)
        }).catch(error => {
          reject(error)
        })
      })
    }
  }
}

export default dcAuth
