<script setup lang="ts">
import { ref, provide, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import "@/assets/homeView.css"
import "@/assets/sidebar.css"
import {
  Menu as IconMenu,
  Bell,
} from '@element-plus/icons-vue'
import authApi from '@/api/authApi'

interface Articles {
  id: number;
  title: string;
  content: string;
  createTime?: string;
  important?: number;
}

interface NotificationItem {
  id: number;
  title: string;
  publishTime: string;
  important: boolean;
}

const isCollapse = ref(false)
const activeMenu = ref('1')
const router = useRouter()
const route = useRoute()

// 提供更新菜单的方法
provide('updateActiveMenu', (index: string) => {
  activeMenu.value = index
})

// 获取路由中的菜单项
const menuItems = computed(() => {
  return router.getRoutes()
    .filter(route => route.meta.menuIndex) // 只获取有menuIndex的路由
    .sort((a, b) => {
      const aIndex = Number(a.meta.menuIndex)
      const bIndex = Number(b.meta.menuIndex)
      return aIndex - bIndex
    })
})

const handleMenuSelect = (index: string) => {
  activeMenu.value = index
  const targetRoute = menuItems.value.find(item => item.meta.menuIndex === index)
  if (targetRoute) {
    router.push(targetRoute.path)
  }
}

const handleUserMenuSelect = (command: string) => {
  switch(command) {
    case 'profile':
      router.push('/home/profile')
      break
    case 'logout':
      // 清除登录状态
      localStorage.removeItem('token')
      router.replace({name:'login'})
      break
  }
}

// 通知相关
const notifications = ref<NotificationItem[]>([])
const notificationLoading = ref(false)
const unreadCount = ref(0)
const notificationVisible = ref(false)

// 获取最新通知
const fetchNotifications = async () => {
  notificationLoading.value = true
  try {
    const response = await authApi.getAllArticles()
    // 将返回的单个文章转换为数组
    const articles = Array.isArray(response) ? response : [response]
    // 只显示最新的5条通知
    notifications.value = articles.slice(0, 5).map((article: Articles) => ({
      id: article.id,
      title: article.title,
      publishTime: article.createTime || new Date().toISOString(),
      important: article.important === 1
    }))
    // 模拟未读数量，实际项目中应该从API获取
    unreadCount.value = Math.min(3, notifications.value.length)
  } catch (error) {
    console.error('Failed to fetch notifications:', error)
  } finally {
    notificationLoading.value = false
  }
}

// 查看通知详情
const viewNotification = (id: number) => {
  router.push(`/home/announcement/${id}`)
  notificationVisible.value = false
}

// 查看所有通知
const viewAllNotifications = () => {
  router.push('/home/announcements')
  notificationVisible.value = false
}

// 初始化时获取通知
onMounted(() => {
  fetchNotifications()
})
</script>

<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '200px'" class="aside">
      <div class="logo-container">
        <img src="@/assets/logo.svg" alt="Logo" v-if="!isCollapse" style="width: 100px;height: 100px"/>
        <el-icon class="toggle-button" @click="isCollapse = !isCollapse">
          <IconMenu />
        </el-icon>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical"
        :collapse="isCollapse"
        background-color="#0c1a2a"
        text-color="rgba(255, 255, 255, 0.85)"
        active-text-color="#ffffff"
        @select="handleMenuSelect"
      >
        <el-menu-item 
          v-for="item in menuItems" 
          :key="item.path" 
          :index="item.meta.menuIndex"
        >
          <el-icon><component :is="item.meta.icon" /></el-icon>
          <template #title>{{ item.meta.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <!-- 顶部导航 -->
      <el-header class="header">
        <div class="header-left">
          <span class="system-title">学生信息管理系统</span>
        </div>
        <div class="header-right">
          <el-dropdown trigger="click" v-model:visible="notificationVisible">
            <el-badge :value="unreadCount" class="notification">
              <el-icon><Bell /></el-icon>
            </el-badge>
            <template #dropdown>
              <el-dropdown-menu>
                <div class="notification-header">
                  <span style="flex: 1">系统通知</span>
                  <el-button style="flex: 1" type="primary" link @click="viewAllNotifications">查看全部</el-button>
                </div>
                
                <el-divider style="margin: 5px 0" />
                
                <div v-if="notificationLoading" class="notification-loading">
                  <el-skeleton :rows="3" animated />
                </div>
                
                <div v-else-if="notifications.length === 0" class="notification-empty">
                  暂无通知
                </div>
                
                <template v-else>
                  <el-dropdown-item v-for="item in notifications" :key="item.id" @click="viewNotification(item.id)">
                    <div class="notification-item">
                      <div class="notification-title">
                        <el-tag v-if="item.important" type="danger" size="small" effect="dark">重要</el-tag>
                        {{ item.title }}
                      </div>
                      <div class="notification-time">{{ item.publishTime }}</div>
                    </div>
                  </el-dropdown-item>
                </template>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-dropdown @command="handleUserMenuSelect">
            <span class="user-dropdown">
              <el-avatar size="small" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
              <span>管理员</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主要内容区 -->
      <el-main class="main">
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
/* 自定义样式补充 */
.logo-container {
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-container img {
  transition: all 0.3s;
}

.toggle-button {
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s;
}

.toggle-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.user-dropdown {
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s;
}

.user-dropdown:hover {
  background-color: rgba(0, 0, 0, 0.025);
}

.user-dropdown span {
  margin-left: 8px;
}

.notification {
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s;
}

.notification:hover {
  background-color: rgba(0, 0, 0, 0.025);
}

/* 确保侧边栏高度填满 */
.aside {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.el-menu {
  flex: 1;
  border-right: none !important;
}

/* Notification dropdown styles */
:deep(.el-dropdown-menu) {
  max-width: 350px;
  min-width: 300px;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 25px;
}

.notification-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100%;
  padding: 5px 0;
}

.notification-title {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
}

.notification-time {
  font-size: 12px;
  color: #909399;
}

.notification-empty {
  padding: 15px;
  text-align: center;
  color: #909399;
}

:deep(.el-dropdown-menu__item) {
  padding: 8px 16px;
  line-height: 1.5;
}

:deep(.el-dropdown-menu__item:hover) {
  background-color: #f0f9ff;
}

:deep(.el-dropdown-menu__item:focus) {
  background-color: #f0f9ff;
  color: inherit;
}
</style>