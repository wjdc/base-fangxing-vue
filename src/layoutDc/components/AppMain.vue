<template>
  <section class="app-main">
    <transition name="fade-transform" mode="out-in">
      <keep-alive :include="cachedViews">
        <router-view v-if="!$route.meta.link" :key="key" />
      </keep-alive>
    </transition>
    <iframe-toggle />
  </section>
</template>

<script>
import iframeToggle from "./IframeToggle/index"

export default {
  name: 'AppMain',
  components: { iframeToggle },
  computed: {
    cachedViews() {
      return this.$store.state.tagsView.cachedViews
    },
    key() {
      return this.$route.path
    }
  }
}
</script>

<style lang="scss" scoped>
.app-main {
  min-height: calc(100vh - var(--topHeaderHeight));
  width: 100%;
  position: relative;
  overflow: hidden;
  background: var(--bg);
  padding: 24px;
}

.fixed-header + .app-main {
  padding-top: calc(var(--topHeaderHeight) + 24px);
  min-height: 100vh;
}

.hasTagsView {
  .app-main {
    min-height: calc(100vh - var(--topHeaderHeight) - var(--tagsViewHeight));
  }

  .fixed-header + .app-main {
    padding-top: calc(var(--topHeaderHeight) + var(--tagsViewHeight) + 24px);
     min-height: 100vh;
  }
}
</style>
