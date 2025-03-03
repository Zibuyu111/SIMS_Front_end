<template>
  <div class="enrollment-container">
    <el-row :gutter="20">
      <el-col :span="16">
        <el-card class="search-card">
          <el-input
            v-model="searchQuery"
            placeholder="输入学号、姓名或课程名称搜索"
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
          <el-table :data="filteredEnrollments" stripe style="width: 100%">
            <el-table-column prop="id" label="选课ID" width="100" />
            <el-table-column prop="studentId" label="学号" width="120" />
            <el-table-column prop="studentName" label="学生姓名" width="120" />
            <el-table-column prop="courseId" label="课程编号" width="120" />
            <el-table-column prop="courseName" label="课程名称" width="150" />
            <el-table-column prop="teacher" label="授课教师" width="120" />
            <el-table-column prop="semester" label="学期" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
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
              <span>选课状态分布</span>
            </div>
          </template>
          <div ref="statusPieRef" style="height: 300px"></div>
        </el-card>

        <el-card class="mt-20">
          <template #header>
            <div class="card-header">
              <span>选课人数趋势</span>
            </div>
          </template>
          <div ref="enrollmentTrendRef" style="height: 300px"></div>
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

interface Enrollment {
  id: string
  studentId: string
  studentName: string
  courseId: string
  courseName: string
  teacher: string
  semester: string
  status: string
}

const enrollments = ref<Enrollment[]>([
  { 
    id: 'E001', 
    studentId: 'S2021001', 
    studentName: '张三', 
    courseId: 'CS101', 
    courseName: '计算机导论', 
    teacher: '王教授',
    semester: '2023-2024-1',
    status: '已选课'
  },
  { 
    id: 'E002', 
    studentId: 'S2021002', 
    studentName: '李四', 
    courseId: 'CS102', 
    courseName: '程序设计基础', 
    teacher: '李教授',
    semester: '2023-2024-1',
    status: '已完成'
  },
  { 
    id: 'E003', 
    studentId: 'S2021003', 
    studentName: '王五', 
    courseId: 'CS101', 
    courseName: '计算机导论', 
    teacher: '王教授',
    semester: '2023-2024-1',
    status: '已退课'
  },
  { 
    id: 'E004', 
    studentId: 'S2021001', 
    studentName: '张三', 
    courseId: 'CS103', 
    courseName: '数据结构', 
    teacher: '赵教授',
    semester: '2023-2024-1',
    status: '已选课'
  },
  { 
    id: 'E005', 
    studentId: 'S2021002', 
    studentName: '李四', 
    courseId: 'CS103', 
    courseName: '数据结构', 
    teacher: '赵教授',
    semester: '2023-2024-1',
    status: '待审核'
  },
])

const searchQuery = ref('')
const statusPieRef = ref<HTMLElement>()
const enrollmentTrendRef = ref<HTMLElement>()

const filteredEnrollments = computed(() => {
  if (!searchQuery.value) return enrollments.value
  const query = searchQuery.value.toLowerCase()
  return enrollments.value.filter(enrollment => 
    enrollment.studentId.toLowerCase().includes(query) || 
    enrollment.studentName.toLowerCase().includes(query) ||
    enrollment.courseName.toLowerCase().includes(query)
  )
})

const getStatusType = (status: string) => {
  switch (status) {
    case '已选课': return 'success'
    case '已完成': return ''
    case '已退课': return 'danger'
    case '待审核': return 'warning'
    default: return 'info'
  }
}

onMounted(() => {
  // 选课状态分布饼图
  const statusPie = echarts.init(statusPieRef.value!)
  statusPie.setOption({
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [{
      type: 'pie',
      radius: '60%',
      data: [
        { value: 45, name: '已选课' },
        { value: 30, name: '已完成' },
        { value: 15, name: '已退课' },
        { value: 10, name: '待审核' }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  })

  // 选课人数趋势图
  const enrollmentTrend = echarts.init(enrollmentTrendRef.value!)
  enrollmentTrend.setOption({
    tooltip: { trigger: 'axis' },
    legend: {
      data: ['选课人数', '退课人数']
    },
    xAxis: {
      type: 'category',
      data: ['2021-1', '2021-2', '2022-1', '2022-2', '2023-1', '2023-2']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '选课人数',
        type: 'line',
        smooth: true,
        data: [120, 132, 145, 160, 178, 190]
      },
      {
        name: '退课人数',
        type: 'line',
        smooth: true,
        data: [20, 18, 25, 22, 30, 25]
      }
    ]
  })

  window.addEventListener('resize', () => {
    statusPie.resize()
    enrollmentTrend.resize()
  })
})

const handleSearch = () => {
  // 搜索逻辑已通过计算属性实现
}

const handleEdit = (row: Enrollment) => {
  console.log('编辑:', row)
}

const handleDelete = (row: Enrollment) => {
  console.log('删除:', row)
}
</script>

<style scoped>
.enrollment-container {
  padding: 20px;
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