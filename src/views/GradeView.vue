<template>
  <div class="grade-container">
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
          <el-table :data="filteredGrades" stripe style="width: 100%">
            <el-table-column prop="id" label="成绩ID" width="100" />
            <el-table-column prop="studentId" label="学号" width="120" />
            <el-table-column prop="studentName" label="学生姓名" width="120" />
            <el-table-column prop="courseId" label="课程编号" width="120" />
            <el-table-column prop="courseName" label="课程名称" width="150" />
            <el-table-column prop="score" label="分数" width="80">
              <template #default="scope">
                <span :class="getScoreClass(scope.row.score)">{{ scope.row.score }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="semester" label="学期" width="120" />
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
              <span>成绩分布</span>
            </div>
          </template>
          <div ref="scoreDistributionRef" style="height: 300px"></div>
        </el-card>

        <el-card class="mt-20">
          <template #header>
            <div class="card-header">
              <span>平均分趋势</span>
            </div>
          </template>
          <div ref="averageScoreRef" style="height: 300px"></div>
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

interface Grade {
  id: string
  studentId: string
  studentName: string
  courseId: string
  courseName: string
  score: number
  semester: string
}

const grades = ref<Grade[]>([
  { 
    id: 'G001', 
    studentId: 'S2021001', 
    studentName: '张三', 
    courseId: 'CS101', 
    courseName: '计算机导论', 
    score: 85, 
    semester: '2023-2024-1' 
  },
  { 
    id: 'G002', 
    studentId: 'S2021002', 
    studentName: '李四', 
    courseId: 'CS102', 
    courseName: '程序设计基础', 
    score: 92, 
    semester: '2023-2024-1' 
  },
  { 
    id: 'G003', 
    studentId: 'S2021003', 
    studentName: '王五', 
    courseId: 'CS101', 
    courseName: '计算机导论', 
    score: 78, 
    semester: '2023-2024-1' 
  },
  { 
    id: 'G004', 
    studentId: 'S2021001', 
    studentName: '张三', 
    courseId: 'CS103', 
    courseName: '数据结构', 
    score: 65, 
    semester: '2023-2024-1' 
  },
  { 
    id: 'G005', 
    studentId: 'S2021002', 
    studentName: '李四', 
    courseId: 'CS103', 
    courseName: '数据结构', 
    score: 88, 
    semester: '2023-2024-1' 
  },
])

const searchQuery = ref('')
const scoreDistributionRef = ref<HTMLElement>()
const averageScoreRef = ref<HTMLElement>()

const filteredGrades = computed(() => {
  if (!searchQuery.value) return grades.value
  const query = searchQuery.value.toLowerCase()
  return grades.value.filter(grade => 
    grade.studentId.toLowerCase().includes(query) || 
    grade.studentName.toLowerCase().includes(query) ||
    grade.courseName.toLowerCase().includes(query)
  )
})

const getScoreClass = (score: number) => {
  if (score >= 90) return 'score-excellent'
  if (score >= 80) return 'score-good'
  if (score >= 70) return 'score-average'
  if (score >= 60) return 'score-pass'
  return 'score-fail'
}

onMounted(() => {
  // 成绩分布饼图
  const scoreDistribution = echarts.init(scoreDistributionRef.value!)
  scoreDistribution.setOption({
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [{
      type: 'pie',
      radius: '60%',
      data: [
        { value: 15, name: '优秀(90-100)' },
        { value: 30, name: '良好(80-89)' },
        { value: 25, name: '中等(70-79)' },
        { value: 20, name: '及格(60-69)' },
        { value: 10, name: '不及格(<60)' }
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

  // 平均分趋势图
  const averageScore = echarts.init(averageScoreRef.value!)
  averageScore.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['2021-1', '2021-2', '2022-1', '2022-2', '2023-1', '2023-2']
    },
    yAxis: {
      type: 'value',
      min: 60,
      max: 100
    },
    series: [{
      name: '平均分',
      type: 'line',
      smooth: true,
      data: [75, 78, 82, 79, 85, 83],
      markLine: {
        data: [{ type: 'average', name: '平均值' }]
      }
    }]
  })

  window.addEventListener('resize', () => {
    scoreDistribution.resize()
    averageScore.resize()
  })
})

const handleSearch = () => {
  // 搜索逻辑已通过计算属性实现
}

const handleEdit = (row: Grade) => {
  console.log('编辑:', row)
}

const handleDelete = (row: Grade) => {
  console.log('删除:', row)
}
</script>

<style scoped>
.grade-container {
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

/* 成绩颜色样式 */
.score-excellent {
  color: #67c23a;
  font-weight: bold;
}

.score-good {
  color: #409eff;
  font-weight: bold;
}

.score-average {
  color: #e6a23c;
}

.score-pass {
  color: #f56c6c;
}

.score-fail {
  color: #f56c6c;
  font-weight: bold;
}
</style> 