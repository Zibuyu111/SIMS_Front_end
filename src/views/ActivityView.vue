<template>
  <div class="activity-container">
    <el-row :gutter="20">
      <el-col :span="16">
        <el-card class="search-card">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-input
                v-model="searchQuery"
                placeholder="输入活动名称或组织者搜索"
                class="search-input"
                clearable
                @clear="handleSearch"
              >
                <template #append>
                  <el-button @click="handleSearch">搜索</el-button>
                </template>
              </el-input>
            </el-col>
            <el-col :span="12">
              <el-select v-model="statusFilter" placeholder="活动状态" style="width: 150px" @change="handleSearch">
                <el-option label="全部" value="" />
                <el-option label="待审批" value="待审批" />
                <el-option label="已通过" value="已通过" />
                <el-option label="已拒绝" value="已拒绝" />
                <el-option label="已结束" value="已结束" />
              </el-select>
              <el-select v-model="typeFilter" placeholder="活动类型" style="width: 150px; margin-left: 10px" @change="handleSearch">
                <el-option label="全部" value="" />
                <el-option label="学术讲座" value="学术讲座" />
                <el-option label="文体活动" value="文体活动" />
                <el-option label="志愿服务" value="志愿服务" />
                <el-option label="竞赛活动" value="竞赛活动" />
                <el-option label="实践活动" value="实践活动" />
              </el-select>
            </el-col>
          </el-row>
        </el-card>
        
        <el-card class="table-card">
          <el-table :data="filteredActivities" stripe style="width: 100%">
            <el-table-column prop="id" label="活动ID" width="100" />
            <el-table-column prop="name" label="活动名称" width="180" />
            <el-table-column prop="organizer" label="组织者" width="120" />
            <el-table-column prop="type" label="活动类型" width="100" />
            <el-table-column prop="startTime" label="开始时间" width="160" />
            <el-table-column prop="location" label="活动地点" width="120" />
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
                    @click="viewActivityDetails(scope.row)"
                  >
                    <el-icon><View /></el-icon>查看
                  </el-button>
                  <el-button 
                    v-if="scope.row.status === '待审批'"
                    type="success" 
                    size="small" 
                    @click="handleApprove(scope.row)"
                  >
                    <el-icon><Check /></el-icon>通过
                  </el-button>
                  <el-button 
                    v-if="scope.row.status === '待审批'"
                    type="danger" 
                    size="small" 
                    @click="handleReject(scope.row)"
                  >
                    <el-icon><Close /></el-icon>拒绝
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 30, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="filteredActivities.length"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>活动状态分布</span>
            </div>
          </template>
          <div ref="statusPieRef" style="height: 300px"></div>
        </el-card>
        
        <el-card class="mt-20">
          <template #header>
            <div class="card-header">
              <span>活动类型分布</span>
            </div>
          </template>
          <div ref="typePieRef" style="height: 300px"></div>
        </el-card>
        
        <el-card class="mt-20">
          <template #header>
            <div class="card-header">
              <span>活动申请趋势</span>
            </div>
          </template>
          <div ref="trendLineRef" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { View, Check, Close } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import '@/assets/commonTable.css'

interface Activity {
  id: string
  name: string
  organizer: string
  type: string
  startTime: string
  endTime: string
  location: string
  participants: number
  description: string
  status: string
  approver?: string
  approveTime?: string
  rejectReason?: string
}

const router = useRouter()
const activities = ref<Activity[]>([
  { 
    id: 'ACT001', 
    name: '计算机科学前沿讲座', 
    organizer: '计算机科学系学生会', 
    type: '学术讲座', 
    startTime: '2024-05-15 14:00', 
    endTime: '2024-05-15 16:00', 
    location: '主楼报告厅', 
    participants: 120, 
    description: '邀请行业专家分享计算机科学最新研究成果和技术趋势，促进学术交流。',
    status: '待审批'
  },
  { 
    id: 'ACT002', 
    name: '软件工程实践工作坊', 
    organizer: '软件工程系', 
    type: '实践活动', 
    startTime: '2024-05-20 09:00', 
    endTime: '2024-05-20 17:00', 
    location: '实验楼B201', 
    participants: 50, 
    description: '通过实际项目案例，帮助学生掌握软件开发流程和团队协作技能。',
    status: '已通过',
    approver: '张主任',
    approveTime: '2024-04-10 10:30'
  },
  { 
    id: 'ACT003', 
    name: '人工智能挑战赛', 
    organizer: '人工智能系', 
    type: '竞赛活动', 
    startTime: '2024-06-01 08:30', 
    endTime: '2024-06-02 18:00', 
    location: '创新中心', 
    participants: 80, 
    description: '面向全院学生的AI算法竞赛，旨在培养学生的创新能力和实践能力。',
    status: '已通过',
    approver: '李院长',
    approveTime: '2024-04-15 14:20'
  },
  { 
    id: 'ACT004', 
    name: '数据科学与社会责任论坛', 
    organizer: '数据科学系', 
    type: '学术讲座', 
    startTime: '2024-05-25 13:30', 
    endTime: '2024-05-25 16:30', 
    location: '图书馆报告厅', 
    participants: 100, 
    description: '探讨数据科学的伦理问题和社会责任，邀请多位专家学者参与讨论。',
    status: '已拒绝',
    approver: '王副院长',
    approveTime: '2024-04-12 09:45',
    rejectReason: '与已安排的院级活动时间冲突'
  },
  { 
    id: 'ACT005', 
    name: '计算机学院篮球赛', 
    organizer: '计算机学院学生会', 
    type: '文体活动', 
    startTime: '2024-05-10 14:00', 
    endTime: '2024-05-12 18:00', 
    location: '校体育馆', 
    participants: 150, 
    description: '计算机学院各系之间的篮球友谊赛，增进系际交流和学生体育锻炼。',
    status: '已结束'
  },
  { 
    id: 'ACT006', 
    name: '信息安全技术沙龙', 
    organizer: '信息安全系', 
    type: '学术讲座', 
    startTime: '2024-05-18 15:00', 
    endTime: '2024-05-18 17:00', 
    location: '实验楼A305', 
    participants: 60, 
    description: '分享最新网络安全技术和防护措施，提高学生的安全意识和技术能力。',
    status: '待审批'
  },
  { 
    id: 'ACT007', 
    name: '校园环保志愿服务', 
    organizer: '计算机学院青年志愿者协会', 
    type: '志愿服务', 
    startTime: '2024-05-22 09:00', 
    endTime: '2024-05-22 12:00', 
    location: '校园各区域', 
    participants: 50, 
    description: '组织学生参与校园环境清洁和绿化维护，培养环保意识和社会责任感。',
    status: '待审批'
  },
])

const searchQuery = ref('')
const statusFilter = ref('')
const typeFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const statusPieRef = ref<HTMLElement>()
const typePieRef = ref<HTMLElement>()
const trendLineRef = ref<HTMLElement>()

// 根据搜索条件和筛选条件过滤活动
const filteredActivities = computed(() => {
  let result = activities.value
  
  // 应用搜索查询
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(activity => 
      activity.name.toLowerCase().includes(query) || 
      activity.organizer.toLowerCase().includes(query)
    )
  }
  
  // 应用状态筛选
  if (statusFilter.value) {
    result = result.filter(activity => activity.status === statusFilter.value)
  }
  
  // 应用类型筛选
  if (typeFilter.value) {
    result = result.filter(activity => activity.type === typeFilter.value)
  }
  
  return result
})

// 获取状态对应的标签类型
const getStatusType = (status: string) => {
  switch (status) {
    case '待审批': return 'warning'
    case '已通过': return 'success'
    case '已拒绝': return 'danger'
    case '已结束': return 'info'
    default: return ''
  }
}

// 初始化图表
onMounted(() => {
  // 活动状态分布饼图
  const statusPie = echarts.init(statusPieRef.value!)
  statusPie.setOption({
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left', top: 'center' },
    series: [{
      type: 'pie',
      radius: '60%',
      center: ['60%', '50%'],
      data: [
        { value: activities.value.filter(a => a.status === '待审批').length, name: '待审批' },
        { value: activities.value.filter(a => a.status === '已通过').length, name: '已通过' },
        { value: activities.value.filter(a => a.status === '已拒绝').length, name: '已拒绝' },
        { value: activities.value.filter(a => a.status === '已结束').length, name: '已结束' }
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

  // 活动类型分布饼图
  const typePie = echarts.init(typePieRef.value!)
  typePie.setOption({
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left', top: 'center' },
    series: [{
      type: 'pie',
      radius: '60%',
      center: ['60%', '50%'],
      data: [
        { value: activities.value.filter(a => a.type === '学术讲座').length, name: '学术讲座' },
        { value: activities.value.filter(a => a.type === '文体活动').length, name: '文体活动' },
        { value: activities.value.filter(a => a.type === '志愿服务').length, name: '志愿服务' },
        { value: activities.value.filter(a => a.type === '竞赛活动').length, name: '竞赛活动' },
        { value: activities.value.filter(a => a.type === '实践活动').length, name: '实践活动' }
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

  // 活动申请趋势图
  const trendLine = echarts.init(trendLineRef.value!)
  trendLine.setOption({
    tooltip: { trigger: 'axis' },
    legend: {
      data: ['申请数量', '通过数量']
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '申请数量',
        type: 'line',
        smooth: true,
        data: [5, 8, 12, 15, 20, 18]
      },
      {
        name: '通过数量',
        type: 'line',
        smooth: true,
        data: [3, 5, 10, 12, 15, 14]
      }
    ]
  })

  // 监听窗口大小变化，调整图表大小
  window.addEventListener('resize', () => {
    statusPie.resize()
    typePie.resize()
    trendLine.resize()
  })
})

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1 // 重置到第一页
}

// 处理分页大小变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
}

// 处理当前页变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

// 查看活动详情
const viewActivityDetails = (activity: Activity) => {
  router.push({
    path: `/home/activity-details/${activity.id}`,
    query: { activityId: activity.id }
  })
}

// 处理审批通过
const handleApprove = (activity: Activity) => {
  ElMessageBox.confirm(
    `确定通过活动"${activity.name}"的申请吗？`,
    '审批确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success'
    }
  ).then(() => {
    // 在实际应用中，这里应该调用API进行审批
    const index = activities.value.findIndex(a => a.id === activity.id)
    if (index !== -1) {
      activities.value[index].status = '已通过'
      activities.value[index].approver = '当前管理员'
      activities.value[index].approveTime = new Date().toLocaleString()
      ElMessage.success('审批通过成功')
    }
  }).catch(() => {
    // 取消操作
  })
}

// 处理审批拒绝
const handleReject = (activity: Activity) => {
  ElMessageBox.prompt(
    '请输入拒绝理由',
    `拒绝活动"${activity.name}"的申请`,
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPlaceholder: '请输入拒绝理由',
      inputValidator: (value) => {
        if (!value) {
          return '拒绝理由不能为空'
        }
        return true
      },
      type: 'warning'
    }
  ).then(({ value }) => {
    // 在实际应用中，这里应该调用API进行拒绝操作
    const index = activities.value.findIndex(a => a.id === activity.id)
    if (index !== -1) {
      activities.value[index].status = '已拒绝'
      activities.value[index].approver = '当前管理员'
      activities.value[index].approveTime = new Date().toLocaleString()
      activities.value[index].rejectReason = value
      ElMessage.success('已拒绝该活动申请')
    }
  }).catch(() => {
    // 取消操作
  })
}
</script>

<style scoped>
.activity-container {
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

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 确保操作按钮在一行显示 */
.operation-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
</style> 