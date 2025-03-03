<template>
  <div class="activity-detail-container">
    <el-page-header @back="goBack" :title="activity?.name || '活动详情'">
      <template #extra>
        <div class="action-buttons" v-if="activity?.status === '待审批'">
          <el-button type="success" @click="handleApprove">
            <el-icon><Check /></el-icon>通过审批
          </el-button>
          <el-button type="danger" @click="handleReject">
            <el-icon><Close /></el-icon>拒绝申请
          </el-button>
        </div>
      </template>
    </el-page-header>
    
    <div class="content-container" v-if="activity">
      <el-row :gutter="20">
        <el-col :span="16">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>活动基本信息</span>
                <el-tag :type="getStatusType(activity.status)">{{ activity.status }}</el-tag>
              </div>
            </template>
            
            <el-descriptions :column="2" border>
              <el-descriptions-item label="活动ID">{{ activity.id }}</el-descriptions-item>
              <el-descriptions-item label="活动名称">{{ activity.name }}</el-descriptions-item>
              <el-descriptions-item label="组织者">{{ activity.organizer }}</el-descriptions-item>
              <el-descriptions-item label="活动类型">{{ activity.type }}</el-descriptions-item>
              <el-descriptions-item label="开始时间">{{ activity.startTime }}</el-descriptions-item>
              <el-descriptions-item label="结束时间">{{ activity.endTime }}</el-descriptions-item>
              <el-descriptions-item label="活动地点">{{ activity.location }}</el-descriptions-item>
              <el-descriptions-item label="参与人数">{{ activity.participants }}人</el-descriptions-item>
              <el-descriptions-item label="活动描述" :span="2">
                {{ activity.description }}
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
          
          <el-card class="mt-20">
            <template #header>
              <div class="card-header">
                <span>审批信息</span>
              </div>
            </template>
            
            <div v-if="activity.status === '待审批'">
              <el-empty description="该活动尚未审批" />
            </div>
            <div v-else>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="审批人">{{ activity.approver }}</el-descriptions-item>
                <el-descriptions-item label="审批时间">{{ activity.approveTime }}</el-descriptions-item>
                <el-descriptions-item v-if="activity.status === '已拒绝'" label="拒绝理由" :span="2">
                  {{ activity.rejectReason }}
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </el-card>
          
          <el-card class="mt-20">
            <template #header>
              <div class="card-header">
                <span>活动资料</span>
              </div>
            </template>
            
            <el-table :data="activityFiles" stripe style="width: 100%">
              <el-table-column prop="name" label="文件名称" />
              <el-table-column prop="size" label="文件大小" width="120" />
              <el-table-column prop="uploadTime" label="上传时间" width="180" />
              <el-table-column fixed="right" label="操作" width="120">
                <template #default="scope">
                  <el-button type="primary" link @click="downloadFile(scope.row)">
                    <el-icon><Download /></el-icon>下载
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>参与人员</span>
                <el-button type="primary" link>导出名单</el-button>
              </div>
            </template>
            
            <el-table :data="participants" stripe style="width: 100%">
              <el-table-column prop="id" label="学号" width="100" />
              <el-table-column prop="name" label="姓名" width="100" />
              <el-table-column prop="department" label="院系" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="getParticipantStatusType(scope.row.status)">
                    {{ scope.row.status }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
          
          <el-card class="mt-20">
            <template #header>
              <div class="card-header">
                <span>活动日程</span>
              </div>
            </template>
            
            <el-timeline>
              <el-timeline-item
                v-for="(activity, index) in schedule"
                :key="index"
                :timestamp="activity.time"
                :type="activity.type"
              >
                {{ activity.content }}
              </el-timeline-item>
            </el-timeline>
          </el-card>
          
          <el-card class="mt-20">
            <template #header>
              <div class="card-header">
                <span>活动反馈</span>
              </div>
            </template>
            
            <div v-if="activity.status === '已结束'">
              <el-progress 
                :percentage="85" 
                :format="() => '满意度: 85%'" 
                status="success"
              />
              <div class="feedback-stats">
                <div class="stat-item">
                  <div class="stat-value">45</div>
                  <div class="stat-label">参与人数</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">38</div>
                  <div class="stat-label">反馈数量</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">4.6</div>
                  <div class="stat-label">平均评分</div>
                </div>
              </div>
            </div>
            <el-empty v-else description="活动尚未结束，暂无反馈数据" />
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <div v-else class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Check, Close, Download } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

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

interface Participant {
  id: string
  name: string
  department: string
  status: string
}

interface ActivityFile {
  name: string
  size: string
  uploadTime: string
  url: string
}

interface ScheduleItem {
  time: string
  content: string
  type: string
}

const route = useRoute()
const router = useRouter()
const activityId = route.query.activityId as string

// 模拟从API获取活动详情
const activity = ref<Activity>({
  id: 'ACT001',
  name: '计算机科学前沿讲座',
  organizer: '计算机科学系学生会',
  type: '学术讲座',
  startTime: '2024-05-15 14:00',
  endTime: '2024-05-15 16:00',
  location: '主楼报告厅',
  participants: 120,
  description: '邀请行业专家分享计算机科学最新研究成果和技术趋势，促进学术交流。本次讲座将邀请知名企业技术专家，分享人工智能和大数据领域的最新发展和应用案例，帮助学生了解行业前沿动态和未来发展方向。',
  status: '待审批'
})

// 模拟参与人员数据
const participants = ref<Participant[]>([
  { id: '2020001', name: '张三', department: '计算机科学系', status: '已报名' },
  { id: '2020002', name: '李四', department: '软件工程系', status: '已报名' },
  { id: '2020003', name: '王五', department: '人工智能系', status: '已报名' },
  { id: '2020004', name: '赵六', department: '数据科学系', status: '待确认' },
  { id: '2020005', name: '钱七', department: '信息安全系', status: '已报名' },
  { id: '2020006', name: '孙八', department: '计算机科学系', status: '已取消' },
])

// 模拟活动资料
const activityFiles = ref<ActivityFile[]>([
  { name: '活动策划书.docx', size: '256KB', uploadTime: '2024-04-01 10:30', url: '#' },
  { name: '场地申请表.pdf', size: '128KB', uploadTime: '2024-04-02 14:20', url: '#' },
  { name: '讲座PPT模板.pptx', size: '1.2MB', uploadTime: '2024-04-05 09:15', url: '#' },
  { name: '预算明细.xlsx', size: '78KB', uploadTime: '2024-04-05 16:40', url: '#' },
])

// 模拟活动日程
const schedule = ref<ScheduleItem[]>([
  { time: '14:00 - 14:15', content: '签到入场', type: 'primary' },
  { time: '14:15 - 14:30', content: '主持人开场', type: 'primary' },
  { time: '14:30 - 15:30', content: '专家讲座', type: 'success' },
  { time: '15:30 - 15:45', content: '茶歇交流', type: 'info' },
  { time: '15:45 - 16:00', content: '问答环节', type: 'warning' },
])

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

// 获取参与者状态对应的标签类型
const getParticipantStatusType = (status: string) => {
  switch (status) {
    case '已报名': return 'success'
    case '待确认': return 'warning'
    case '已取消': return 'info'
    default: return ''
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 处理审批通过
const handleApprove = () => {
  ElMessageBox.confirm(
    `确定通过活动"${activity.value.name}"的申请吗？`,
    '审批确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success'
    }
  ).then(() => {
    // 在实际应用中，这里应该调用API进行审批
    activity.value.status = '已通过'
    activity.value.approver = '当前管理员'
    activity.value.approveTime = new Date().toLocaleString()
    ElMessage.success('审批通过成功')
  }).catch(() => {
    // 取消操作
  })
}

// 处理审批拒绝
const handleReject = () => {
  ElMessageBox.prompt(
    '请输入拒绝理由',
    `拒绝活动"${activity.value.name}"的申请`,
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
    activity.value.status = '已拒绝'
    activity.value.approver = '当前管理员'
    activity.value.approveTime = new Date().toLocaleString()
    activity.value.rejectReason = value
    ElMessage.success('已拒绝该活动申请')
  }).catch(() => {
    // 取消操作
  })
}

// 下载文件
const downloadFile = (file: ActivityFile) => {
  ElMessage.success(`开始下载文件: ${file.name}`)
  // 实际应用中这里应该调用下载API
}

// 获取活动详情
onMounted(() => {
  // 实际应用中，这里应该根据activityId从API获取活动详情
  console.log('获取活动详情:', activityId)
})
</script>

<style scoped>
.activity-detail-container {
  padding: 20px;
}

.content-container {
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

.loading-container {
  margin-top: 20px;
}

.feedback-stats {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
  text-align: center;
}

.stat-item {
  padding: 10px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin-top: 5px;
}
</style> 