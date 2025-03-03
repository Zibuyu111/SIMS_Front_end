import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw, NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import splash from "@/views/splash.vue"
import {
  Platform,
  User,
  Reading,
  School,
  List,
  Document,
  Collection,
  Notebook,
  Calendar,
  Notification
} from '@element-plus/icons-vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'login',
    component: splash,
    meta: {
      title: '登录'
    }
  },
  {
    path: '/home',
    name: 'home',
    component: ()=>import("@/views/HomeView.vue"),
    redirect: '/home/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: ()=>import("@/views/DashboardView.vue"),
        meta: {
          title: '首页',
          icon: Platform,
          menuIndex: '1'
        },
      },
      {
        path: 'students',
        name: 'students',
        component: ()=>import("@/views/StudentView.vue"),
        meta: {
          title: '学生管理',
          icon: User,
          menuIndex: '2'
        }
      },
      {
        path: 'teachers',
        name: 'teachers',
        component: ()=>import("@/views/TeacherView.vue"),
        meta: {
          title: '教师管理',
          icon: Reading,
          menuIndex: '3'
        }
      },
      {
        path: 'classes',
        name: 'classes',
        component: ()=>import("@/views/ClassView.vue"),
        meta: {
          title: '班级管理',
          icon: School,
          menuIndex: '4'
        }
      },
      {
        path: 'courses',
        name: 'courses',
        component: ()=>import("@/views/CourseView.vue"),
        meta: {
          title: '课程管理',
          icon: List,
          menuIndex: '5'
        }
      },
      {
        path: 'grades',
        name: 'grades',
        component: ()=>import("@/views/GradeView.vue"),
        meta: {
          title: '成绩管理',
          icon: Document,
          menuIndex: '6'
        }
      },
      {
        path: 'enrollments',
        name: 'enrollments',
        component: ()=>import("@/views/EnrollmentView.vue"),
        meta: {
          title: '选课管理',
          icon: Collection,
          menuIndex: '7'
        }
      },
      {
        path: 'profile',
        name: 'profile',
        component: ()=>import("@/views/ProfileView.vue"),
        meta: {
          title: '个人信息'
        }
      },
      {
        path: 'training-plans',
        name: 'training-plans',
        component: ()=>import("@/views/TrainingPlanView.vue"),
        meta: {
          title: '培养计划',
          icon: Notebook,
          menuIndex: '8'
        }
      },
      {
        path: 'activities',
        name: 'activities',
        component: ()=>import("@/views/ActivityView.vue"),
        meta: {
          title: '活动审批',
          icon: Calendar,
          menuIndex: '9'
        }
      },
      {
        path: 'activity-details/:id',
        name: 'activity-details',
        component: ()=>import("@/views/ActivityDetailView.vue"),
        meta:{title:"活动详情"}
      },
      {
        path: 'announcements',
        name: 'announcements',
        component: ()=>import("@/views/AnnouncementListView.vue"),
        meta: {
          title: '系统公告',
          icon: Notification,
          menuIndex: '10'
        }
      },
      {
        path: 'announcement/:id(\\d+)',
        name: 'announcement-detail',
        component: ()=>import("@/views/AnnouncementDetailView.vue"),
        meta: {
          title: '公告详情',
        }
      }
    ]
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue'),
    meta:{title:"关于"},
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 添加全局导航守卫
router.beforeEach((
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  // 获取登录状态
  const isLoggedIn = localStorage.getItem('token')

  // 如果用户未登录且访问的不是登录页面，重定向到登录页面
  if (!isLoggedIn && to.path !== '/login') {
    next({ path: '/login' })
    return
  }

  // 如果用户已登录且访问登录页面，重定向到首页
  if (isLoggedIn && to.path === '/login') {
    next({ path: '/home/dashboard' })
    return
  }

  // 其他情况正常放行
  next()
})

export default router
