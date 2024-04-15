import { mapGetters } from "vuex";

// 右侧table,iframe或者其他高度自适应
export const autoHeightLayout = function ({
  ref: refName = "table",
  hasPage = true,
} = {}) {
  return {
    data() {
      return {
        isMoreShow: false,
        minAutoHeight: 300,
        autoHeight: 300,
      };
    },
    beforeDestroy() {
      window.removeEventListener("resize", this.listenResize);
    },
    mounted() {
      this.listenResize();
      window.addEventListener("resize", this.listenResize);
    },
    activated() {
      this.listenResize();
    },
    computed: {
      ...mapGetters(["sidebar"]),
      needDoLayout() {
        return [this.total, this.isMoreShow];
      },
      bottomOffset() {
        let bottom = 48;
        if (hasPage) {
          bottom = this.total > 0 ? 104 : 48;
        }
        return bottom;
      },
    },
    watch: {
      needDoLayout: {
        deep: true,
        immediate: true,
        handler(n, o) {
          if (n !== o) {
            this.listenResize();
          }
        },
      },
      "sidebar.opened"(n, o) {
        if (n !== o) {
          this.sidebarOpenedStartTime = performance.now();
          if (this.requestId) {
            cancelAnimationFrame(this.requestId);
          }
          this.requestId = requestAnimationFrame(this.leftSidebarAnimate);
        }
      },
    },
    methods: {
      leftSidebarAnimate() {
        //左侧菜单收起展开导致变化
        const elapsedTime = performance.now() - this.sidebarOpenedStartTime;
        this.listenResize();
        if (elapsedTime < 280) {
          this.requestId = requestAnimationFrame(this.leftSidebarAnimate);
        } else {
          if (this.requestId) {
            cancelAnimationFrame(this.requestId);
          }
        }
      },
      listenResize() {
        const bottom = this.bottomOffset;
        document.body.style.overflow = 'hidden';
        this.$nextTick(() => {
          const element = this.$refs[refName]; // 使用传递的 ref 元素
          if (element) {
            let dom = element.$el ? element.$el : element;
            let rect = dom.getBoundingClientRect();
            // console.log(rect.top)
            const heightReal = window.innerHeight - rect.top - bottom;
            this.autoHeight =
              heightReal > this.minAutoHeight ? heightReal : this.minAutoHeight;
          }
          setTimeout(() => {
            if (element) {
              if (element.doLayout) {
                // element.doLayout();
                element.debouncedUpdateLayout&&element.debouncedUpdateLayout();
              } else {
                let dom = element.$el ? element.$el : element;
                dom.style.height = this.autoHeight + "px";
                dom.style.overflow = "auto";
              }
            }
            document.body.style.overflow = '';
          }, 0);
        });
      },
    },
  };
};
