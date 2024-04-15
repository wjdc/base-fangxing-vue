<template>
  <div class="navbar">
    <hamburger id="hamburger-container" :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb id="breadcrumb-container" class="breadcrumb-container" v-if="!topNav" />
    <top-nav id="topmenu-container" class="topmenu-container" v-if="topNav" />

    <div class="right-menu">
      <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click">
        <div class="avatar-wrapper">
          <img :src="avatar" class="user-avatar" />
          <div class="username">{{ userInfo.nickName }}</div>
        </div>
        <el-dropdown-menu slot="dropdown">
          <router-link to="/user/profile">
            <el-dropdown-item>个人中心</el-dropdown-item>
          </router-link>
          <!-- <el-dropdown-item @click.native="setting = true">
            <span>布局设置</span>
          </el-dropdown-item> -->
          <el-dropdown-item divided @click.native="logout">
            <span>退出登录</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import TopNav from '@/components/TopNav'
import Hamburger from '@/components/Hamburger'
import Screenfull from '@/components/Screenfull'
import SizeSelect from '@/components/SizeSelect'
import Search from '@/components/HeaderSearch'
import RuoYiGit from '@/components/RuoYi/Git'
import RuoYiDoc from '@/components/RuoYi/Doc'

export default {
  components: {
    Breadcrumb,
    TopNav,
    Hamburger,
    Screenfull,
    SizeSelect,
    Search,
    RuoYiGit,
    RuoYiDoc
  },
  computed: {
    ...mapGetters(['sidebar', 'avatar', 'device', 'userInfo']),
    setting: {
      get() {
        return this.$store.state.settings.showSettings
      },
      set(val) {
        this.$store.dispatch('settings/changeSetting', {
          key: 'showSettings',
          value: val
        })
      }
    },
    topNav: {
      get() {
        return this.$store.state.settings.topNav
      }
    }
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      this.$confirm('确定注销并退出系统吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$store.dispatch('LogOut').then(() => {
            const loginFrom = window.localStorage.getItem('loginFrom')
            if (loginFrom === 'dcAuth') {
              this.$store.dispatch('GetDcLogoutUrl').then(res => {
                location.href = decodeURIComponent(res.data.logoutUrl)
              })
            } else {
              location.href = process.env.VUE_APP_CONTEXT_PATH + 'index'
            }
          })
        })
        .catch(() => {})
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: var(--topHeaderHeight);
  overflow: hidden;
  position: relative;
  background: #fff;
  border-bottom: 1px solid#E8E9EB;
  .hamburger-container {
    line-height: var(--topHeaderHeight);
    margin-left: 16px;
    margin-top: 12px;
    padding: 0 8px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;
    border-radius: 3px;
    width: auto;
    float: left;
    &:hover {
      background: #f3f3f3;
    }
  }

  .breadcrumb-container {
    float: left;
    line-height: var(--topHeaderHeight);
  }

  .topmenu-container {
    position: absolute;
    left: 50px;
    border: none;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    display: flex;
    align-items: center;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;
    }

    .avatar-container {
      margin-right: 24px;

      .avatar-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        height: 32px;
        margin-top: calc((var(--topHeaderHeight) - 32px) / 2);
        padding: 0 8px;
        border-radius: 3px;
        margin-right: -8px;
        .user-avatar {
          cursor: pointer;
          width: 24px;
          height: 24px;
          border-radius: 50%;
        }
        .username {
          color: rgba(0, 0, 0, 0.9);
          font-size: 14px;
          margin-left: 8px;
        }
      }
    }
  }
}
</style>
