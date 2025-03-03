<template>
  <div class="course-container">
    <el-row :gutter="20">
      <el-col :span="16">
        <el-card class="search-card">
          <el-input
            v-model="searchQuery"
            placeholder="输入课程编号或名称搜索"
            class="search-input"
            clearable
            @clear="handleSearch"
          >
            <template #append>
              <el-button @click="handleSearch">搜索</el-button>
            </template>
          </el-input>
        </el-card>

        <el-card class="table-card">
          <el-table :data="filteredCourses" stripe style="width: 100%">
            <el-table-column prop="id" label="课程编号" width="120" />
            <el-table-column prop="name" label="课程名称" width="150" />
            <el-table-column prop="teacher" label="授课教师" width="120" />
            <el-table-column prop="credit" label="学分" width="80" />
            <el-table-column prop="studentCount" label="选课人数" width="100" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.status === '进行中' ? 'success' : 'info'">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="180">
              <template #default="scope">
                <div class="operation-buttons">
                  <el-button 
                    type="primary" 
                    size="small" 
                    @click="handleEdit(scope.row)"
                  >
                    <el-icon><Edit /></el-icon>编辑
                  </el-button>
                  <el-button 
                    type="danger" 
                    size="small" 
                    @click="handleDelete(scope.row)"
                  >
                    <el-icon><Delete /></el-icon>删除
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>课程类型分布</span>
            </div>
          </template>
          <div ref="typePieRef" style="height: 300px"></div>
        </el-card>

        <el-card class="mt-20">
          <template #header>
            <div class="card-header">
              <span>选课人数趋势</span>
            </div>
          </template>
          <div ref="enrollmentLineRef" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import * as echarts from 'echarts'
import { Edit, Delete } from '@element-plus/icons-vue'
import '@/assets/commonTable.css'

interface Course {
  id: string
  name: string
  teacher: string
  credit: number
  studentCount: number
  status: string
}

const courses = ref<Course[]>([
  { 
    id: 'CS101', 
    name: '计算机导论', 
    teacher: '张教授', 
    credit: 3, 
    studentCount: 120, 
    status: '进行中'
  },
  { 
    id: 'CS102', 
    name: '程序设计基础', 
    teacher: '李教授', 
    credit: 4, 
    studentCount: 150, 
    status: '已结束'
  },
])

const searchQuery = ref('')
const typePieRef = ref<HTMLElement>()
const enrollmentLineRef = ref<HTMLElement>()

const filteredCourses = computed(() => {
  if (!searchQuery.value) return courses.value
  return courses.value.filter(course => 
    course.id.includes(searchQuery.value) || 
    course.name.includes(searchQuery.value)
  )
})

onMounted(() => {
  const typePie = echarts.init(typePieRef.value!)
  typePie.setOption({
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [{
      type: 'pie',
      radius: '60%',
      data: [
        { value: 35, name: '专业必修' },
        { value: 25, name: '专业选修' },
        { value: 20, name: '公共必修' },
        { value: 15, name: '公共选修' }
      ]
    }]
  })

  const enrollmentLine = echarts.init(enrollmentLineRef.value!)
  enrollmentLine.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五']
    },
    yAxis: { type: 'value' },
    series: [{
      name: '选课人数',
      type: 'line',
      smooth: true,
      data: [120, 132, 101, 134, 90]
    }]
  })

  window.addEventListener('resize', () => {
    typePie.resize()
    enrollmentLine.resize()
  })
})

const handleSearch = () => {
  // 搜索逻辑已通过计算属性实现
}

const handleEdit = (row: Course) => {
  console.log('编辑:', row)
}

const handleDelete = (row: Course) => {
  console.log('删除:', row)
}
</script>

<style scoped>
.course-container {
  padding: 20px;
}
.search-input {
  max-width: 300px;
}
.table-card {
  margin-top: 20px;
}
.mt-20 {
  margin-top: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 