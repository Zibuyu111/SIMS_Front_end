<template>
  <div class="announcement-detail-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button @click="goBack" text>
              <el-icon><ArrowLeft /></el-icon> 返回列表
            </el-button>
          </div>
          <div class="header-right">
            <el-tag v-if="announcement?.important === 1" type="danger" effect="dark">重要公告</el-tag>
          </div>
        </div>
      </template>
      
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="15" animated />
      </div>
      
      <div v-else-if="!announcement" class="error-container">
        <el-empty description="公告不存在或已被删除" />
        <el-button type="primary" @click="goBack">返回列表</el-button>
      </div>
      
      <div v-else class="announcement-content">
        <h1 class="announcement-title">{{ announcement.title }}</h1>
        
        <div class="announcement-meta">
          <span>发布时间：{{ announcement.createTime || '暂无时间' }}</span>
        </div>
        
        <div class="announcement-body markdown-content" v-html="parsedContent"></div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Document, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { marked } from 'marked'
import authApi from '@/api/authApi'

interface Articles {
  id: number;
  title: string;
  content: string;
  createTime?: string;
  important?: number;
}

const router = useRouter()
const route = useRoute()
const loading = ref(true)
const announcement = ref<Articles | null>(null)
const parsedContent = ref('')

// 解析 Markdown 内容
const parseMarkdown = (content: string) => {
  try {
    return marked(content)
  } catch (error) {
    console.error('Failed to parse markdown:', error)
    return content
  }
}

// 获取公告详情
const fetchAnnouncementDetail = async () => {
  const id = Number(route.params.id)
  if (!id) {
    ElMessage.error('公告ID不能为空')
    goBack()
    return
  }

  loading.value = true
  try {
    const response = await authApi.getAllArticles()
    // 将返回的单个文章转换为数组
    const articles = Array.isArray(response) ? response : [response]
    // 查找指定ID的文章
    announcement.value = articles.find(article => article.id === id) || null
    
    if (!announcement.value) {
      ElMessage.error('公告不存在或已被删除')
    } else {
      // 解析 Markdown 内容
      parsedContent.value = parseMarkdown(announcement.value.content)
    }
  } catch (error) {
    ElMessage.error('获取公告详情失败，请稍后重试')
    console.error('Failed to fetch announcement detail:', error)
    announcement.value = null
  } finally {
    loading.value = false
  }
}

// 返回列表
const goBack = () => {
  router.push('/home/announcements')
}

// 初始化
onMounted(() => {
  fetchAnnouncementDetail()
})
</script>

<style scoped>
.announcement-detail-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.announcement-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}

.announcement-meta {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px;
  color: #666;
  margin-bottom: 30px;
  font-size: 14px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.announcement-body {
  line-height: 1.8;
  margin-bottom: 30px;
}

.loading-container, .error-container {
  padding: 30px 0;
  text-align: center;
}

.error-container .el-button {
  margin-top: 20px;
}

/* Markdown 内容样式 */
:deep(.markdown-content) {
  h1, h2, h3, h4, h5, h6 {
    margin-top: 24px;
    margin-bottom: 16px;
    font-weight: 600;
    line-height: 1.25;
  }

  h1 {
    font-size: 2em;
    padding-bottom: 0.3em;
    border-bottom: 1px solid #eaecef;
  }

  h2 {
    font-size: 1.5em;
    padding-bottom: 0.3em;
    border-bottom: 1px solid #eaecef;
  }

  p {
    margin-bottom: 16px;
  }

  ul, ol {
    padding-left: 2em;
    margin-bottom: 16px;
  }

  li {
    margin: 0.25em 0;
  }

  code {
    padding: 0.2em 0.4em;
    margin: 0;
    font-size: 85%;
    background-color: rgba(27,31,35,0.05);
    border-radius: 3px;
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
  }

  pre {
    padding: 16px;
    overflow: auto;
    font-size: 85%;
    line-height: 1.45;
    background-color: #f6f8fa;
    border-radius: 3px;
    margin-bottom: 16px;
  }

  pre code {
    padding: 0;
    margin: 0;
    background-color: transparent;
  }

  blockquote {
    padding: 0 1em;
    color: #6a737d;
    border-left: 0.25em solid #dfe2e5;
    margin: 0 0 16px 0;
  }

  table {
    display: block;
    width: 100%;
    overflow: auto;
    margin-bottom: 16px;
    border-spacing: 0;
    border-collapse: collapse;
  }

  table th {
    font-weight: 600;
  }

  table th, table td {
    padding: 6px 13px;
    border: 1px solid #dfe2e5;
  }

  table tr {
    background-color: #fff;
    border-top: 1px solid #c6cbd1;
  }

  table tr:nth-child(2n) {
    background-color: #f6f8fa;
  }

  img {
    max-width: 100%;
    box-sizing: content-box;
  }

  hr {
    height: 0.25em;
    padding: 0;
    margin: 24px 0;
    background-color: #e1e4e8;
    border: 0;
  }
}
</style> 