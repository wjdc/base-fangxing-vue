<template>
  <div class="sidebar-logo-container" :class="{ collapse: collapse }">
    <transition name="sidebarLogoFade">
      <router-link v-if="collapse" key="collapse" class="sidebar-logo-link" to="/">
        <img v-if="logo" :src="logo" class="sidebar-logo" />
        <h1 v-else class="sidebar-title">{{ title }}</h1>
      </router-link>
      <router-link v-else key="expand" class="sidebar-logo-link" to="/">
        <img v-if="logo" :src="logo" class="sidebar-logo" />
        <h1 class="sidebar-title">{{ title }}</h1>
      </router-link>
    </transition>
  </div>
</template>

<script>
import logoImg from '@/assets/logo/logo.svg'

export default {
  name: 'SidebarLogo',
  props: {
    collapse: {
      type: Boolean,
      required: true
    }
  },
  computed: {
    sideTheme() {
      return this.$store.state.settings.sideTheme
    }
  },
  data() {
    return {
      title: '',
      logo: logoImg
    }
  }
}
</script>

<style lang="scss" scoped>
.sidebarLogoFade-enter-active {
  transition: opacity 1.5s;
}

.sidebarLogoFade-enter,
.sidebarLogoFade-leave-to {
  opacity: 0;
}

#app .sidebar-logo-container {
  position: relative;
  width: 100%;
  height: var(--topHeaderHeight);
  line-height: var(--topHeaderHeight);
  overflow: hidden;
  border-bottom: 1px solid var(--topLogoBorderColor);
  padding-left: 24px;

  & .sidebar-logo-link {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    & .sidebar-logo {
      margin-right: 8px;
      width: 40px;
    }

    & .sidebar-title {
      display: inline-block;
      margin: 0;
      color: var(--logoTitColor);
      vertical-align: middle;
      font-size: 18px;
      font-weight: 600;
      white-space: nowrap;
      line-height: 1;
    }
  }

  &.collapse {
    text-align: center;
    padding-left: calc((var(--sideBarMiniWidth) - 40px) / 2);
    .sidebar-logo {
      margin-right: 0px;
    }
  }
}
</style>
