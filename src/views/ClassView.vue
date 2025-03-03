<template>
  <div class="class-container">
    <el-row :gutter="20">
      <el-col :span="16">
        <el-card class="search-card">
          <el-input
            v-model="searchQuery"
            placeholder="输入班级编号或名称搜索"
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
          <el-table :data="filteredClasses" stripe style="width: 100%">
            <el-table-column prop="id" label="班级编号" width="120" />
            <el-table-column prop="name" label="班级名称" width="120" />
            <el-table-column prop="grade" label="年级" width="100" />
            <el-table-column prop="studentCount" label="学生人数" width="100" />
            <el-table-column prop="advisor" label="班主任" width="120" />
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
              <span>班级规模分布</span>
            </div>
          </template>
          <div ref="sizePieRef" style="height: 300px"></div>
        </el-card>

        <el-card class="mt-20">
          <template #header>
            <div class="card-header">
              <span>班级数量趋势</span>
            </div>
          </template>
          <div ref="trendLineRef" style="height: 300px"></div>
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

interface Class {
  id: string
  name: string
  grade: string
  studentCount: number
  advisor: string
}

const classes = ref<Class[]>([
  { id: 'C2021001', name: '计科1班', grade: '2021', studentCount: 35, advisor: '张老师' },
  { id: 'C2021002', name: '软工2班', grade: '2021', studentCount: 40, advisor: '李老师' },
])

const searchQuery = ref('')
const sizePieRef = ref<HTMLElement>()
const trendLineRef = ref<HTMLElement>()

const filteredClasses = computed(() => {
  if (!searchQuery.value) return classes.value
  return classes.value.filter(cls => 
    cls.id.includes(searchQuery.value) || 
    cls.name.includes(searchQuery.value)
  )
})

onMounted(() => {
  const sizePie = echarts.init(sizePieRef.value!)
  sizePie.setOption({
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [{
      type: 'pie',
      radius: '60%',
      data: [
        { value: 10, name: '30人以下' },
        { value: 25, name: '30-40人' },
        { value: 15, name: '40-50人' },
        { value: 5, name: '50人以上' }
      ]
    }]
  })

  const trendLine = echarts.init(trendLineRef.value!)
  trendLine.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['2019', '2020', '2021', '2022', '2023']
    },
    yAxis: { type: 'value' },
    series: [{
      data: [15, 18, 20, 23, 25],
      type: 'line',
      smooth: true
    }]
  })

  window.addEventListener('resize', () => {
    sizePie.resize()
    trendLine.resize()
  })
})

const handleSearch = () => {
  // 搜索逻辑已通过计算属性实现
}

const handleEdit = (row: Class) => {
  console.log('编辑:', row)
}

const handleDelete = (row: Class) => {
  console.log('删除:', row)
}
</script>

<style scoped>
.class-container {
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