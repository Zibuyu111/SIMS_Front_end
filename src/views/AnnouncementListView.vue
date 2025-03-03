<template>
  <div class="announcement-list-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span class="header-title">系统公告</span>
          <div class="header-actions">
            <el-input
              v-model="searchQuery"
              placeholder="搜索公告"
              class="search-input"
              clearable
              @clear="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-select v-model="typeFilter" placeholder="公告类型" @change="handleSearch">
              <el-option label="全部" value="" />
              <el-option label="重要" value="important" />
              <el-option label="普通" value="normal" />
            </el-select>
          </div>
        </div>
      </template>
      
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="10" animated />
      </div>
      
      <div v-else>
        <el-empty v-if="filteredAnnouncements.length === 0" description="暂无公告" />
        
        <el-table v-else :data="filteredAnnouncements" style="width: 100%" @row-click="handleRowClick">
          <el-table-column width="60">
            <template #default="scope">
              <el-tag v-if="scope.row.important === 1" type="danger" effect="dark" size="small">重要</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="标题" min-width="300" />
          <el-table-column prop="createTime" label="发布时间" width="180" />
          <el-table-column fixed="right" label="操作" width="120">
            <template #default="scope">
              <el-button type="primary" link @click.stop="viewAnnouncement(scope.row.id)">
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 30, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="totalAnnouncements"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import authApi from '@/api/authApi'
import '@/assets/commonTable.css'

interface Articles {
  id: number;
  title: string;
  content: string;
  createTime?: string;
  important?: number;
}

const router = useRouter()
const searchQuery = ref('')
const typeFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(true)
const announcements = ref<Articles[]>([])

// 获取公告列表
const fetchAnnouncements = async () => {
  loading.value = true
  try {
    const response = await authApi.getAllArticles()
    // 将返回的单个文章转换为数组
    announcements.value = Array.isArray(response) ? response : [response]
  } catch (error) {
    ElMessage.error('获取公告列表失败，请稍后重试')
    console.error('Failed to fetch announcements:', error)
    announcements.value = []
  } finally {
    loading.value = false
  }
}

// 过滤公告
const filteredAnnouncements = computed(() => {
  let result = announcements.value

  // 按类型过滤
  if (typeFilter.value) {
    result = result.filter(item => 
      typeFilter.value === 'important' ? item.important === 1 : item.important !== 1
    )
  }

  // 按关键词搜索
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(item => 
      item.title.toLowerCase().includes(query)
    )
  }

  // 分页
  const startIndex = (currentPage.value - 1) * pageSize.value
  return result.slice(startIndex, startIndex + pageSize.value)
})

// 总公告数
const totalAnnouncements = computed(() => {
  let result = announcements.value

  // 按类型过滤
  if (typeFilter.value) {
    result = result.filter(item => 
      typeFilter.value === 'important' ? item.important === 1 : item.important !== 1
    )
  }

  // 按关键词搜索
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(item => 
      item.title.toLowerCase().includes(query)
    )
  }

  return result.length
})

// 查看公告详情
const viewAnnouncement = (id: number) => {
  router.push(`/home/announcement/${id}`)
}

// 行点击事件
const handleRowClick = (row: Articles) => {
  viewAnnouncement(row.id)
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
}

// 分页大小变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
}

// 当前页变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

// 初始化
onMounted(() => {
  fetchAnnouncements()
})
</script>

<style scoped>
.announcement-list-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.header-title {
  font-size: 18px;
  font-weight: bold;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.search-input {
  width: 250px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.loading-container {
  padding: 20px 0;
}

:deep(.el-table .el-table__row) {
  cursor: pointer;
}

:deep(.el-table .el-table__row:hover > td) {
  background-color: #f0f9ff !important;
}
</style> 