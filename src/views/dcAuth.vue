<template>
  <div v-loading="true" style="height: 100%"></div>
</template>
<script>
import { removeToken, getNextRt, removeNextRt } from '@/utils/auth'
export default {
  name: 'DcAuth',
  data() {
    return {}
  },
  created() {
    this.code = this.$route.query.code
    this.state = this.$route.query.state
    this.init()
  },
  methods: {
    init() {
      removeToken()
      if (window.$server_config.SYS_LOGIN_WAY == '1') {
        //自有登录
        this.$router.push('/').catch(() => {})
      } else if (window.$server_config.SYS_LOGIN_WAY == '2') {
        //自有登录+繁星
        if (this.code) {
          this.getToken()
        } else {
          this.getUrl()
        }
      } else {
        //繁星登录
        if (this.code) {
          this.getToken()
        } else {
          this.getUrl()
        }
      }
    },
    getUrl() {
      this.$store.dispatch('GetDcRedirect').then(res => {
        const dc_redirect = decodeURIComponent(res.oauth2Authorize)
        window.location.href = dc_redirect
      })
    },
    getToken() {
      const data = { code: this.code, state: this.state }
      this.$store.dispatch('GetDcToken', data).then(res => {
        const nextPath = getNextRt()
        this.$router.push(nextPath || '/').catch(() => {})
        removeNextRt()
      })
    }
  }
}
</script>
