import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  // 容器terminal测试
  {
    path: '/terminal',
    component: () => import('@/views/terminal/index'),
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  // 注册页
  {
    path: '/register',
    component: () => import('@/views/register/index'),
    hidden: true, //控制是否显示SideBar
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: '首页', icon: 'dashboard' }
    }]
  },

  // {
  //   path: '/example',
  //   component: Layout,
  //   redirect: '/example/table',
  //   name: 'Example',
  //   meta: { title: '课程页', icon: 'el-icon-s-help' },
  //   children: [
  //     {
  //       path: 'table',
  //       name: 'Table',
  //       component: () => import('@/views/table/index'),
  //       meta: { title: '课程列表', icon: 'table' }
  //     },
  //     {
  //       path: 'tree',
  //       name: 'Tree',
  //       component: () => import('@/views/tree/index'),
  //       meta: { title: 'Tree', icon: 'tree' }
  //     }
  //   ]
  // },

  // {
  //   path: '/form',
  //   component: Layout,
  //   children: [
  //     {
  //       path: 'index',
  //       name: 'Form',
  //       component: () => import('@/views/form/index'),
  //       meta: { title: 'Form', icon: 'form' }
  //     }
  //   ]
  // },

  // {
  //   path: '/nested',
  //   component: Layout,
  //   redirect: '/nested/menu1',
  //   name: 'Nested',
  //   meta: {
  //     title: '管理页',
  //     icon: 'nested'
  //   },
  //   children: [
  //     {
  //       path: 'menu1',
  //       component: () => import('@/views/nested/menu1/index'), // Parent router-view
  //       name: 'Menu1',
  //       meta: { title: 'Menu1' },
  //       children: [
  //         {
  //           path: 'menu1-1',
  //           component: () => import('@/views/nested/menu1/menu1-1'),
  //           name: 'Menu1-1',
  //           meta: { title: 'Menu1-1' }
  //         },
  //         {
  //           path: 'menu1-2',
  //           component: () => import('@/views/nested/menu1/menu1-2'),
  //           name: 'Menu1-2',
  //           meta: { title: 'Menu1-2' },
  //           children: [
  //             {
  //               path: 'menu1-2-1',
  //               component: () => import('@/views/nested/menu1/menu1-2/menu1-2-1'),
  //               name: 'Menu1-2-1',
  //               meta: { title: 'Menu1-2-1' }
  //             },
  //             {
  //               path: 'menu1-2-2',
  //               component: () => import('@/views/nested/menu1/menu1-2/menu1-2-2'),
  //               name: 'Menu1-2-2',
  //               meta: { title: 'Menu1-2-2' }
  //             }
  //           ]
  //         },
  //         {
  //           path: 'menu1-3',
  //           component: () => import('@/views/nested/menu1/menu1-3'),
  //           name: 'Menu1-3',
  //           meta: { title: 'Menu1-3' }
  //         }
  //       ]
  //     },
  //     {
  //       path: 'menu2',
  //       component: () => import('@/views/nested/menu2/index'),
  //       name: 'Menu2',
  //       meta: { title: '学生管理' }
  //     }
  //   ]
  // },
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
  // 学生查看自己加入的课程页面
  {
    path: '/course',
    component: Layout,
    redirect: '/course/index',
    meta: {
      title: '我的课程',
      icon: 'form',
      roles: ['student']
    },
    children: [
      {
        path: 'index',
        name: 'mycourse',
        component: () => import('@/views/table/index'),
        meta: { title: '我的课程', icon: 'form', roles: ['student'] ,breadcrumb: false}
      }
    ]
  },
  // 学生查看课程资源文件
  {
    path: '/s/resource',
    component: Layout,
    redirect: '/s/resource/index',
    meta: {
      title: '课程资源',
      icon: 'form',
      roles: ['student'],
      hascid: true  //必须所有级都写
    },
    children: [
      {
        path: 'index/:cid',
        name: 'student-resource',
        component: () => import('@/views/resource/student_index'),
        meta: { title: '课程资源', icon: 'form', roles: ['student'] ,breadcrumb: false, hascid: true}
      }
    ]
  },
  // 课程管理
  {
    path: '/coursemanage',
    component: Layout,
    redirect: '/coursemanage/index',
    meta: {
      title: '课程管理',
      icon: 'form',
      roles: ['teacher']
    },
    children: [
      {
        path: 'index',
        name: 'coursemanage',
        component: () => import('@/views/coursemanage/index'),
        meta: { title: '课程管理', icon: 'form', roles: ['teacher'] ,breadcrumb: false}
      }
    ]
  },
  // 教师管理学生的页面
  {
    path: '/t',
    component: Layout,
    redirect: '/t/index',
    meta: {
      title: '课程学生管理',
      icon: 'form',
      roles: ['teacher'],
      hascid: true  //必须所有级都写
    },
    children: [
      {
        path: 'index/:cid',
        name: 'studentmanage',
        component: () => import('@/views/nested/menu2/index'),
        meta: { title: '课程学生管理', icon: 'form', roles: ['teacher'] ,breadcrumb: false, hascid: true}
      }
    ]
  },
  // 教师容器管理
  {
    path: '/t/container',
    component: Layout,
    redirect: '/t/container/index',
    meta: {
      title: '课程容器管理',
      icon: 'form',
      roles: ['teacher'],
      hascid: true  //必须所有级都写
    },
    children: [
      {
        path: 'index/:cid',
        name: 'container',
        component: () => import('@/views/container/teacher_index'),
        meta: { title: '课程容器管理', icon: 'form', roles: ['teacher'] ,breadcrumb: false, hascid: true}
      }
    ]
  },
  // 教师课程资源管理
  {
    path: '/t/resource',
    component: Layout,
    redirect: '/t/resource/index',
    meta: {
      title: '课程资源管理',
      icon: 'form',
      roles: ['teacher'],
      hascid: true  //必须所有级都写
    },
    children: [
      {
        path: 'index/:cid',
        name: 'resource',
        component: () => import('@/views/resource/teacher_index'),
        meta: { title: '课程资源管理', icon: 'form', roles: ['teacher'] ,breadcrumb: false, hascid: true}
      }
    ]
  },
  // 镜像管理
  {
    path: '/t/image',
    component: Layout,
    redirect: '/t/imagem/index',
    meta: {
      title: '镜像管理',
      icon: 'form',
      roles: ['teacher'],
      hascid: true  //必须所有级都写
    },
    children: [
      {
        path: 'index/:cid',
        name: 'image',
        component: () => import('@/views/imagemanage/index'),
        meta: { title: '镜像资源管理', icon: 'form', roles: ['teacher'] ,breadcrumb: false, hascid: true}
      }
    ]
  },
  // {
  //   path: '/permission',
  //   component: Layout,
  //   redirect: '/permission/page',
  //   alwaysShow: true, // will always show the root menu
  //   name: 'Permission',
  //   meta: {
  //     title: 'Permission',
  //     icon: 'lock',
  //     roles: ['admin', 'editor'] // you can set roles in root nav
  //   },
  //   children: [
  //     {
  //       path: 'page',
  //       component: () => import('@/views/permission/page'),
  //       name: 'PagePermission',
  //       meta: {
  //         title: 'Page Permission',
  //         roles: ['admin'] // or you can only set roles in sub nav
  //       }
  //     },
  //   ],
  // },
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

// 路由配置
const createRouter = () => new Router({
    // mode: 'history', // require service support
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
