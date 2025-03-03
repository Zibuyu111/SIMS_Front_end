<template>
  <div class="teacher-container">
    <el-row :gutter="20">
      <el-col :span="16">
        <el-card class="search-card">
          <el-input
            v-model="searchQuery"
            placeholder="输入工号或姓名搜索"
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
          <el-table :data="filteredTeachers" stripe style="width: 100%">
            <el-table-column prop="id" label="工号" width="120" />
            <el-table-column prop="name" label="姓名" width="120" />
            <el-table-column prop="title" label="职称" width="120" />
            <el-table-column prop="department" label="所属院系" />
            <el-table-column prop="courses" label="授课数量" width="120" />
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
              <span>教师职称分布</span>
            </div>
          </template>
          <div ref="titlePieRef" style="height: 300px"></div>
        </el-card>
        
        <el-card class="mt-20">
          <template #header>
            <div class="card-header">
              <span>院系教师分布</span>
            </div>
          </template>
          <div ref="deptPieRef" style="height: 300px"></div>
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

interface Teacher {
  id: string
  name: string
  title: string
  department: string
  courses: number
}

const teachers = ref<Teacher[]>([
  { id: 'T2021001', name: '张教授', title: '教授', department: '计算机系', courses: 3 },
  { id: 'T2021002', name: '李副教授', title: '副教授', department: '软件工程系', courses: 4 },
])

const searchQuery = ref('')
const titlePieRef = ref<HTMLElement>()
const deptPieRef = ref<HTMLElement>()

const filteredTeachers = computed(() => {
  if (!searchQuery.value) return teachers.value
  return teachers.value.filter(teacher => 
    teacher.id.includes(searchQuery.value) || 
    teacher.name.includes(searchQuery.value)
  )
})

onMounted(() => {
  const titlePie = echarts.init(titlePieRef.value!)
  titlePie.setOption({
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [{
      type: 'pie',
      radius: '60%',
      data: [
        { value: 20, name: '教授' },
        { value: 30, name: '副教授' },
        { value: 40, name: '讲师' },
        { value: 10, name: '助教' }
      ]
    }]
  })

  const deptPie = echarts.init(deptPieRef.value!)
  deptPie.setOption({
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [{
      type: 'pie',
      radius: '60%',
      data: [
        { value: 30, name: '计算机系' },
        { value: 25, name: '软件工程系' },
        { value: 20, name: '网络工程系' },
        { value: 15, name: '人工智能系' }
      ]
    }]
  })

  window.addEventListener('resize', () => {
    titlePie.resize()
    deptPie.resize()
  })
})

const handleSearch = () => {
  // 搜索逻辑已通过计算属性实现
}

const handleEdit = (row: Teacher) => {
  console.log('编辑:', row)
}

const handleDelete = (row: Teacher) => {
  console.log('删除:', row)
}
</script>

<style scoped>
.teacher-container {
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