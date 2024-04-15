import router from "./router";
import store from "./store";
import { Message } from "element-ui";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { getToken,setNextRt } from "@/utils/auth";
import { isRelogin } from "@/utils/request";

NProgress.configure({ showSpinner: false });

const whiteList = ["/login", "/register", "/codeLogin"];

router.beforeEach((to, from, next) => {
  NProgress.start();
  if (getToken()) {
    to.meta.title && store.dispatch("settings/setTitle", to.meta.title);
    /* has token*/
    if (to.path === "/login" || to.path === "/codeLogin") {
      next({ path: "/" });
      NProgress.done();
    } else {
      if (store.getters.roles.length === 0) {
        isRelogin.show = true;
        // 判断当前用户是否已拉取完user_info信息
        store
          .dispatch("GetInfo")
          .then(() => {
            isRelogin.show = false;
            store.dispatch("GenerateRoutes").then((accessRoutes) => {
              // 根据roles权限生成可访问的路由表
              router.addRoutes(accessRoutes); // 动态添加可访问路由表
              next({ ...to, replace: true }); // hack方法 确保addRoutes已完成
            });
          })
          .catch((err) => {
            store.dispatch("LogOut").then(() => {
              Message.error(err);
              const loginFrom = window.localStorage.getItem("loginFrom");
              if (loginFrom === "dcAuth") {
                store.dispatch("GetDcLogoutUrl").then((res) => {
                  location.href = decodeURIComponent(res.data.logoutUrl);
                });
              } else {
                next({ path: "/" });
              }
            });
          });
      } else {
        next();
      }
    }
  } else {
    // 没有token
    if (whiteList.indexOf(to.path) !== -1) {
      // 在免登录白名单，直接进入
      next();
    } else {
      next(`/login?redirect=${to.fullPath}`); // 否则全部重定向到登录页
      setNextRt(to.fullPath)
      NProgress.done();
    }
  }
});

router.afterEach(() => {
  NProgress.done();
});
