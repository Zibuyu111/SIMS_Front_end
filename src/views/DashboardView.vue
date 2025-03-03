<template>
  <el-row :gutter="20">
    <el-col :span="6">
      <el-card shadow="hover" class="stat-card">
        <template #header>
          <div class="card-header">
            <span>在校学生</span>
            <el-tag type="success">实时</el-tag>
          </div>
        </template>
        <div class="stat-number">2,458</div>
        <div class="stat-footer">
          <span>较昨日</span>
          <el-tag type="success" size="small">+12</el-tag>
        </div>
      </el-card>
    </el-col>
    <el-col :span="6">
      <el-card shadow="hover" class="stat-card">
        <template #header>
          <div class="card-header">
            <span>教师人数</span>
            <el-tag type="warning">实时</el-tag>
          </div>
        </template>
        <div class="stat-number">186</div>
        <div class="stat-footer">
          <span>较昨日</span>
          <el-tag type="info" size="small">+0</el-tag>
        </div>
      </el-card>
    </el-col>
    <el-col :span="6">
      <el-card shadow="hover" class="stat-card">
        <template #header>
          <div class="card-header">
            <span>课程数量</span>
            <el-tag type="info">统计</el-tag>
          </div>
        </template>
        <div class="stat-number">342</div>
        <div class="stat-footer">
          <span>本学期</span>
          <el-tag type="warning" size="small">+28</el-tag>
        </div>
      </el-card>
    </el-col>
    <el-col :span="6">
      <el-card shadow="hover" class="stat-card">
        <template #header>
          <div class="card-header">
            <span>班级数量</span>
            <el-tag type="info">统计</el-tag>
          </div>
        </template>
        <div class="stat-number">68</div>
        <div class="stat-footer">
          <span>本学期</span>
          <el-tag type="primary" size="small">+4</el-tag>
        </div>
      </el-card>
    </el-col>
  </el-row>

  <el-row :gutter="20" class="mt-20">
    <el-col :span="12">
      <el-card shadow="hover">
        <template #header>
          <div class="card-header">
            <span>各专业学生分布</span>
          </div>
        </template>
        <div ref="pieChartRef" style="height: 300px"></div>
      </el-card>
    </el-col>
    <el-col :span="12">
      <el-card shadow="hover">
        <template #header>
          <div class="card-header">
            <span>教师职称分布</span>
          </div>
        </template>
        <div ref="teacherPieRef" style="height: 300px"></div>
      </el-card>
    </el-col>
  </el-row>

  <el-row :gutter="20" class="mt-20">
    <el-col :span="24">
      <el-card shadow="hover">
        <template #header>
          <div class="card-header">
            <span>近六个月课程开设趋势</span>
          </div>
        </template>
        <div ref="lineChartRef" style="height: 350px"></div>
      </el-card>
    </el-col>
  </el-row>

  <el-row :gutter="20" class="mt-20">
    <el-col :span="16">
      <el-card shadow="hover">
        <template #header>
          <div class="card-header">
            <span>系统公告</span>
            <el-button type="primary" link @click="router.push('/home/announcements')">查看更多</el-button>
          </div>
        </template>
        <el-timeline>
          <el-timeline-item
            v-for="(announcement, index) in recentAnnouncements"
            :key="announcement.id"
            :timestamp="2026"
            placement="top"
          >
            <el-card @click="viewAnnouncement(announcement.id)" class="clickable-card">
              <div class="announcement-header">
                <h4>{{ announcement.title }}</h4>
                <el-tag v-if="announcement.important" type="danger" size="small">重要</el-tag>
              </div>
              <p>{{ marked(announcement.content.slice(0,50)).replace(/<[^>]*>/g, '')}}</p>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </el-card>
    </el-col>
    <el-col :span="8">
      <el-card shadow="hover">
        <template #header>
          <div class="card-header">
            <span>快捷操作</span>
          </div>
        </template>
        <div class="quick-actions">
          <el-button type="primary" plain>添加学生</el-button>
          <el-button type="success" plain>添加教师</el-button>
          <el-button type="warning" plain>课程管理</el-button>
          <el-button type="info" plain>成绩录入</el-button>
        </div>
      </el-card>
    </el-col>
  </el-row>


</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { useRouter } from 'vue-router'
import authApi from '@/api/authApi'
import {marked} from "marked";

interface Articles {
  id: number;
  title: string;
  content: string;
  createTime?: string;
  important?: number;
}

const pieChartRef = ref<HTMLElement>()
const teacherPieRef = ref<HTMLElement>()
const lineChartRef = ref<HTMLElement>()
const router = useRouter()


const recentAnnouncements = ref<Articles[]>([])
const announcementLoading = ref(false)

const fetchRecentAnnouncements = async () => {
  announcementLoading.value = true
  try {
    const response = await authApi.getAllArticles()
    // 将返回的单个文章转换为数组
    const articles = Array.isArray(response) ? response : [response]
    // 只显示最新的5条公告
    recentAnnouncements.value = articles.slice(0, 5)
  } catch (error) {
    console.error('Failed to fetch announcements:', error)
  } finally {
    announcementLoading.value = false
  }
}

const viewAnnouncement = (id: number) => {
  router.push(`/home/announcement/${id}`)
}

const viewAllAnnouncements = () => {
  router.push('/home/announcements')
}

onMounted(() => {
  // 学生专业分布图
  const pieChart = echarts.init(pieChartRef.value!)
  pieChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '专业分布',
        type: 'pie',
        radius: '60%',
        data: [
          { value: 1048, name: '计算机科学' },
          { value: 735, name: '软件工程' },
          { value: 580, name: '网络工程' },
          { value: 484, name: '人工智能' },
          { value: 300, name: '数据科学' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  })

  // 教师职称分布图
  const teacherPie = echarts.init(teacherPieRef.value!)
  teacherPie.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '职称分布',
        type: 'pie',
        radius: '60%',
        data: [
          { value: 25, name: '教授' },
          { value: 45, name: '副教授' },
          { value: 65, name: '讲师' },
          { value: 35, name: '助教' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  })

  // 课程趋势图
  const lineChart = echarts.init(lineChartRef.value!)
  lineChart.setOption({
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['总课程数', '新增课程']
    },
    xAxis: {
      type: 'category',
      data: ['10月', '11月', '12月', '1月', '2月', '3月']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '总课程数',
        type: 'line',
        smooth: true,
        data: [320, 332, 341, 334, 350, 360]
      },
      {
        name: '新增课程',
        type: 'line',
        smooth: true,
        data: [12, 13, 9, 13, 16, 10]
      }
    ]
  })

  // 监听窗口大小变化，调整图表大小
  window.addEventListener('resize', () => {
    pieChart.resize()
    teacherPie.resize()
    lineChart.resize()
  })

  fetchRecentAnnouncements()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin: 10px 0;
}

.stat-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #909399;
}

.mt-20 {
  margin-top: 20px;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.clickable-card {
  cursor: pointer;
}

.announcement-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 