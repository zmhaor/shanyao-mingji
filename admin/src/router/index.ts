import type { RouteRecordRaw } from "vue-router"
import { createRouter } from "vue-router"
import { routerConfig } from "@/router/config"
import { registerNavigationGuard } from "@/router/guard"
import { flatMultiLevelRoutes } from "./helper"

const Layouts = () => import("@/layouts/index.vue")

/**
 * @name 常驻路由
 * @description 除了 redirect/403/404/login 等隐藏页面，其他页面建议设置唯一的 Name 属性
 */
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: "/redirect",
    component: Layouts,
    meta: {
      hidden: true
    },
    children: [
      {
        path: ":path(.*)",
        component: () => import("@/pages/redirect/index.vue")
      }
    ]
  },
  {
    path: "/403",
    component: () => import("@/pages/error/403.vue"),
    meta: {
      hidden: true
    }
  },
  {
    path: "/404",
    component: () => import("@/pages/error/404.vue"),
    meta: {
      hidden: true
    },
    alias: "/:pathMatch(.*)*"
  },
  {
    path: "/login",
    component: () => import("@/pages/login/index.vue"),
    meta: {
      hidden: true
    }
  },
  {
    path: "/",
    component: Layouts,
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        component: () => import("@/pages/dashboard/index.vue"),
        name: "Dashboard",
        meta: {
          title: "首页",
          svgIcon: "dashboard",
          affix: true
        }
      }
    ]
  },

  {
    path: "/users",
    component: Layouts,
    redirect: "/users",
    name: "AdminUsers",
    meta: {
      title: "用户管理",
      elIcon: "User",
      roles: ["admin"]
    },
    children: [
      {
        path: "",
        component: () => import("@/pages/admin/users/index.vue"),
        name: "AdminUsersIndex",
        meta: {
          title: "用户管理"
        }
      }
    ]
  },
  {
    path: "/tools",
    component: Layouts,
    redirect: "/tools",
    name: "AdminTools",
    meta: {
      title: "工具管理",
      elIcon: "Tools",
      roles: ["admin"]
    },
    children: [
      {
        path: "",
        component: () => import("@/pages/admin/tools/index.vue"),
        name: "AdminToolsIndex",
        meta: {
          title: "工具管理"
        }
      }
    ]
  },
  {
    path: "/categories",
    component: Layouts,
    redirect: "/categories",
    name: "AdminCategories",
    meta: {
      title: "分类管理",
      elIcon: "CollectionTag",
      roles: ["admin"]
    },
    children: [
      {
        path: "",
        component: () => import("@/pages/admin/categories/index.vue"),
        name: "AdminCategoriesIndex",
        meta: {
          title: "分类管理"
        }
      }
    ]
  },
  {
    path: "/shop",
    component: Layouts,
    redirect: "/shop",
    name: "AdminShop",
    meta: {
      title: "商城管理",
      elIcon: "ShoppingCart",
      roles: ["admin"]
    },
    children: [
      {
        path: "",
        component: () => import("@/pages/admin/shop/index.vue"),
        name: "AdminShopIndex",
        meta: {
          title: "商城管理"
        }
      }
    ]
  },
  {
    path: "/materials",
    component: Layouts,
    redirect: "/materials",
    name: "AdminMaterials",
    meta: {
      title: "资料管理",
      elIcon: "FolderOpened",
      roles: ["admin"]
    },
    children: [
      {
        path: "",
        component: () => import("@/pages/admin/materials/index.vue"),
        name: "AdminMaterialsIndex",
        meta: {
          title: "资料管理"
        }
      }
    ]
  },
  {
    path: "/content",
    component: Layouts,
    redirect: "/content",
    name: "AdminContent",
    meta: {
      title: "内容库管理",
      elIcon: "Reading",
      roles: ["admin"]
    },
    children: [
      {
        path: "",
        component: () => import("@/pages/admin/content/index.vue"),
        name: "AdminContentIndex",
        meta: {
          title: "内容库管理"
        }
      }
    ]
  },
  {
    path: "/feedback",
    component: Layouts,
    redirect: "/feedback",
    name: "AdminFeedback",
    meta: {
      title: "用户反馈",
      elIcon: "ChatLineRound",
      roles: ["admin"]
    },
    children: [
      {
        path: "",
        component: () => import("@/pages/admin/feedback/index.vue"),
        name: "AdminFeedbackIndex",
        meta: {
          title: "用户反馈"
        }
      }
    ]
  },
  {
    path: "/notices",
    component: Layouts,
    redirect: "/notices",
    name: "AdminNotices",
    meta: {
      title: "公告管理",
      elIcon: "Notification",
      roles: ["admin"]
    },
    children: [
      {
        path: "",
        component: () => import("@/pages/admin/notices/index.vue"),
        name: "AdminNoticesIndex",
        meta: {
          title: "公告管理"
        }
      }
    ]
  },

  {
    path: "/config",
    component: Layouts,
    redirect: "/config",
    name: "AdminConfig",
    meta: {
      title: "系统配置",
      elIcon: "Setting",
      roles: ["admin"]
    },
    children: [
      {
        path: "",
        component: () => import("@/pages/admin/config/index.vue"),
        name: "AdminConfigIndex",
        meta: {
          title: "系统配置"
        }
      }
    ]
  },
  {
    path: "/profile",
    component: Layouts,
    redirect: "/profile",
    name: "AdminProfile",
    meta: {
      title: "个人设置",
      elIcon: "Avatar",
      roles: ["admin"]
    },
    children: [
      {
        path: "",
        component: () => import("@/pages/admin/profile/index.vue"),
        name: "AdminProfileIndex",
        meta: {
          title: "个人设置"
        }
      }
    ]
  }
]

/**
 * @name 动态路由
 * @description 用来放置有权限 (Roles 属性) 的路由
 * @description 必须带有唯一的 Name 属性
 */
export const dynamicRoutes: RouteRecordRaw[] = []

/** 路由实例 */
export const router = createRouter({
  history: routerConfig.history,
  routes: routerConfig.thirdLevelRouteCache ? flatMultiLevelRoutes(constantRoutes) : constantRoutes
})

/** 重置路由 */
export function resetRouter() {
  try {
    // 注意：所有动态路由路由必须带有 Name 属性，否则可能会不能完全重置干净
    router.getRoutes().forEach((route) => {
      const { name, meta } = route
      if (name && meta.roles?.length) {
        router.hasRoute(name) && router.removeRoute(name)
      }
    })
  } catch {
    // 强制刷新浏览器也行，只是交互体验不是很好
    location.reload()
  }
}

// 注册路由导航守卫
registerNavigationGuard(router)
