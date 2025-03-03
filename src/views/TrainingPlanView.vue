<template>
  <div class="training-plan-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="department-card">
          <template #header>
            <div class="card-header">
              <span>计算机学院各系</span>
            </div>
          </template>
          <el-menu
            :default-active="activeDepartment"
            class="department-menu"
            @select="handleDepartmentSelect"
          >
            <el-menu-item v-for="dept in departments" :key="dept.id" :index="dept.id">
              {{ dept.name }}
            </el-menu-item>
          </el-menu>
        </el-card>
      </el-col>
      
      <el-col :span="18">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>{{ currentDepartment.name }}培养计划</span>
              <div>
                <el-select v-model="selectedYear" placeholder="选择年级" style="margin-right: 10px;">
                  <el-option
                    v-for="year in years"
                    :key="year"
                    :label="`${year}级`"
                    :value="year"
                  />
                </el-select>
                <el-button type="primary" @click="handleEdit">
                  <el-icon><Edit /></el-icon>
                  编辑培养计划
                </el-button>
              </div>
            </div>
          </template>
          
          <div class="plan-content">
            <el-tabs v-model="activeTab" type="card">
              <el-tab-pane label="培养目标" name="goals">
                <div class="section">
                  <h3>培养目标</h3>
                  <div v-html="currentPlan.goals"></div>
                </div>
              </el-tab-pane>
              
              <el-tab-pane label="核心课程" name="coreCourses">
                <div class="section">
                  <h3>核心课程</h3>
                  <el-table :data="currentPlan.coreCourses" stripe style="width: 100%">
                    <el-table-column prop="code" label="课程代码" width="120" />
                    <el-table-column prop="name" label="课程名称" width="200" />
                    <el-table-column prop="credit" label="学分" width="80" />
                    <el-table-column prop="hours" label="学时" width="80" />
                    <el-table-column prop="semester" label="开设学期" width="100" />
                    <el-table-column prop="type" label="课程类型" />
                  </el-table>
                </div>
              </el-tab-pane>
              
              <el-tab-pane label="专业选修课" name="electiveCourses">
                <div class="section">
                  <h3>专业选修课</h3>
                  <el-table :data="currentPlan.electiveCourses" stripe style="width: 100%">
                    <el-table-column prop="code" label="课程代码" width="120" />
                    <el-table-column prop="name" label="课程名称" width="200" />
                    <el-table-column prop="credit" label="学分" width="80" />
                    <el-table-column prop="hours" label="学时" width="80" />
                    <el-table-column prop="semester" label="建议学期" width="100" />
                    <el-table-column prop="direction" label="方向" />
                  </el-table>
                </div>
              </el-tab-pane>
              
              <el-tab-pane label="毕业要求" name="requirements">
                <div class="section">
                  <h3>毕业要求</h3>
                  <div v-html="currentPlan.requirements"></div>
                </div>
              </el-tab-pane>
              
              <el-tab-pane label="课程地图" name="courseMap">
                <div class="section">
                  <h3>课程地图</h3>
                  <div ref="courseMapRef" class="course-map" style="height: 500px;"></div>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import * as echarts from 'echarts'
import { Edit } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

interface Course {
  code: string
  name: string
  credit: number
  hours: number
  semester: string
  type?: string
  direction?: string
}

interface TrainingPlan {
  id: string
  departmentId: string
  year: number
  goals: string
  requirements: string
  coreCourses: Course[]
  electiveCourses: Course[]
}

interface Department {
  id: string
  name: string
}

// 学院各系
const departments = ref<Department[]>([
  { id: 'cs', name: '计算机科学与技术系' },
  { id: 'se', name: '软件工程系' },
  { id: 'is', name: '信息安全系' },
  { id: 'ai', name: '人工智能系' },
  { id: 'ds', name: '数据科学系' }
])

// 年级列表
const years = ref([2020, 2021, 2022, 2023, 2024])

// 当前选择的系和年级
const activeDepartment = ref('cs')
const selectedYear = ref(2023)
const activeTab = ref('goals')
const courseMapRef = ref<HTMLElement>()

// 培养计划数据
const trainingPlans = ref<TrainingPlan[]>([
  {
    id: 'cs-2023',
    departmentId: 'cs',
    year: 2023,
    goals: `
      <p>本专业培养具有良好的科学素养，系统地、较好地掌握计算机科学与技术包括计算机硬件、软件与应用的基本理论、基本知识和基本技能与方法，能在科研部门、教育单位、企业、事业、技术和行政管理部门等单位从事计算机教学、科学研究和应用的计算机科学与技术学科的高级科学技术人才。</p>
      <p>毕业生应获得以下几方面的知识、能力和素质：</p>
      <ol>
        <li>掌握计算机科学与技术的基本理论、基本知识；</li>
        <li>掌握计算机系统的分析和设计的基本方法；</li>
        <li>具有研究开发计算机软硬件的基本能力；</li>
        <li>了解计算机科学与技术的前沿发展现状和趋势；</li>
        <li>掌握资料查询、文献检索及运用现代信息技术获取相关信息的基本方法；</li>
        <li>具有一定的创新意识和独立获取新知识的能力。</li>
      </ol>
    `,
    requirements: `
      <p>学生需要完成以下要求方可毕业：</p>
      <ol>
        <li>总学分不少于160学分；</li>
        <li>必修课程全部合格；</li>
        <li>专业选修课不少于30学分；</li>
        <li>公共选修课不少于10学分；</li>
        <li>完成毕业设计（论文）并通过答辩；</li>
        <li>英语达到学校规定的要求；</li>
        <li>计算机等级考试达到二级或以上。</li>
      </ol>
    `,
    coreCourses: [
      { code: 'CS101', name: '计算机导论', credit: 3, hours: 48, semester: '第1学期', type: '专业基础课' },
      { code: 'CS102', name: '程序设计基础(C语言)', credit: 4, hours: 64, semester: '第1学期', type: '专业基础课' },
      { code: 'CS103', name: '数据结构', credit: 4, hours: 64, semester: '第2学期', type: '专业基础课' },
      { code: 'CS201', name: '离散数学', credit: 3, hours: 48, semester: '第2学期', type: '专业基础课' },
      { code: 'CS202', name: '计算机组成原理', credit: 4, hours: 64, semester: '第3学期', type: '专业核心课' },
      { code: 'CS203', name: '操作系统', credit: 4, hours: 64, semester: '第4学期', type: '专业核心课' },
      { code: 'CS204', name: '计算机网络', credit: 3, hours: 48, semester: '第4学期', type: '专业核心课' },
      { code: 'CS301', name: '数据库系统', credit: 4, hours: 64, semester: '第5学期', type: '专业核心课' },
      { code: 'CS302', name: '软件工程', credit: 3, hours: 48, semester: '第5学期', type: '专业核心课' },
      { code: 'CS303', name: '编译原理', credit: 3, hours: 48, semester: '第6学期', type: '专业核心课' }
    ],
    electiveCourses: [
      { code: 'CS401', name: '人工智能导论', credit: 3, hours: 48, semester: '第5-6学期', direction: '智能计算' },
      { code: 'CS402', name: '机器学习', credit: 3, hours: 48, semester: '第6-7学期', direction: '智能计算' },
      { code: 'CS403', name: '计算机图形学', credit: 3, hours: 48, semester: '第5-6学期', direction: '图形图像' },
      { code: 'CS404', name: '数字图像处理', credit: 3, hours: 48, semester: '第6-7学期', direction: '图形图像' },
      { code: 'CS405', name: '大数据技术', credit: 3, hours: 48, semester: '第6-7学期', direction: '数据科学' },
      { code: 'CS406', name: '云计算技术', credit: 3, hours: 48, semester: '第6-7学期', direction: '系统架构' },
      { code: 'CS407', name: '物联网技术', credit: 3, hours: 48, semester: '第6-7学期', direction: '物联网' },
      { code: 'CS408', name: '区块链技术', credit: 3, hours: 48, semester: '第7-8学期', direction: '前沿技术' }
    ]
  },
  {
    id: 'se-2023',
    departmentId: 'se',
    year: 2023,
    goals: `
      <p>本专业培养具有良好的科学素养，掌握扎实的计算机科学与技术和软件工程的基础知识、基本理论和基本技能，具备从事软件分析、设计、开发、维护等工作的高级专门人才。</p>
      <p>毕业生应获得以下几方面的知识、能力和素质：</p>
      <ol>
        <li>掌握软件工程的基本理论、基本知识；</li>
        <li>掌握软件开发方法与技术；</li>
        <li>具有软件项目管理和团队协作能力；</li>
        <li>了解软件工程领域的前沿发展现状和趋势；</li>
        <li>具有较强的工程实践能力和创新能力。</li>
      </ol>
    `,
    requirements: `
      <p>学生需要完成以下要求方可毕业：</p>
      <ol>
        <li>总学分不少于165学分；</li>
        <li>必修课程全部合格；</li>
        <li>专业选修课不少于35学分；</li>
        <li>公共选修课不少于10学分；</li>
        <li>完成毕业设计（论文）并通过答辩；</li>
        <li>英语达到学校规定的要求；</li>
        <li>至少参与一个完整的软件项目开发。</li>
      </ol>
    `,
    coreCourses: [
      { code: 'SE101', name: '软件工程导论', credit: 3, hours: 48, semester: '第1学期', type: '专业基础课' },
      { code: 'SE102', name: '程序设计基础(Java)', credit: 4, hours: 64, semester: '第1学期', type: '专业基础课' },
      { code: 'SE103', name: '数据结构', credit: 4, hours: 64, semester: '第2学期', type: '专业基础课' },
      { code: 'SE201', name: '面向对象程序设计', credit: 3, hours: 48, semester: '第3学期', type: '专业核心课' },
      { code: 'SE202', name: '数据库系统', credit: 4, hours: 64, semester: '第3学期', type: '专业核心课' },
      { code: 'SE203', name: '软件需求分析', credit: 3, hours: 48, semester: '第4学期', type: '专业核心课' },
      { code: 'SE204', name: '软件设计与体系结构', credit: 3, hours: 48, semester: '第4学期', type: '专业核心课' },
      { code: 'SE301', name: '软件测试与质量保证', credit: 3, hours: 48, semester: '第5学期', type: '专业核心课' },
      { code: 'SE302', name: '软件项目管理', credit: 3, hours: 48, semester: '第5学期', type: '专业核心课' },
      { code: 'SE303', name: '软件工程实践', credit: 4, hours: 64, semester: '第6学期', type: '专业核心课' }
    ],
    electiveCourses: [
      { code: 'SE401', name: 'Web前端开发技术', credit: 3, hours: 48, semester: '第5-6学期', direction: '前端开发' },
      { code: 'SE402', name: '移动应用开发', credit: 3, hours: 48, semester: '第5-6学期', direction: '移动开发' },
      { code: 'SE403', name: '企业级应用开发', credit: 3, hours: 48, semester: '第6-7学期', direction: '企业应用' },
      { code: 'SE404', name: '微服务架构', credit: 3, hours: 48, semester: '第6-7学期', direction: '系统架构' },
      { code: 'SE405', name: 'DevOps实践', credit: 3, hours: 48, semester: '第6-7学期', direction: '运维开发' },
      { code: 'SE406', name: '软件安全', credit: 3, hours: 48, semester: '第6-7学期', direction: '软件安全' },
      { code: 'SE407', name: '用户体验设计', credit: 3, hours: 48, semester: '第5-6学期', direction: '用户体验' },
      { code: 'SE408', name: '敏捷开发方法', credit: 3, hours: 48, semester: '第7-8学期', direction: '项目管理' }
    ]
  },
  {
    id: 'ai-2023',
    departmentId: 'ai',
    year: 2023,
    goals: `
      <p>本专业培养具有扎实的数学基础和计算机科学基础，系统掌握人工智能基本理论、方法与技术，能够从事人工智能相关领域的科学研究、技术开发和应用的高级专门人才。</p>
      <p>毕业生应获得以下几方面的知识、能力和素质：</p>
      <ol>
        <li>掌握人工智能的基本理论、基本知识；</li>
        <li>掌握机器学习、深度学习等人工智能核心技术；</li>
        <li>具有解决复杂问题的能力和创新思维；</li>
        <li>了解人工智能领域的前沿发展现状和趋势；</li>
        <li>具有较强的工程实践能力和团队协作能力。</li>
      </ol>
    `,
    requirements: `
      <p>学生需要完成以下要求方可毕业：</p>
      <ol>
        <li>总学分不少于170学分；</li>
        <li>必修课程全部合格；</li>
        <li>专业选修课不少于35学分；</li>
        <li>公共选修课不少于10学分；</li>
        <li>完成毕业设计（论文）并通过答辩；</li>
        <li>英语达到学校规定的要求；</li>
        <li>至少完成一个人工智能应用项目。</li>
      </ol>
    `,
    coreCourses: [
      { code: 'AI101', name: '人工智能导论', credit: 3, hours: 48, semester: '第1学期', type: '专业基础课' },
      { code: 'AI102', name: '程序设计基础(Python)', credit: 4, hours: 64, semester: '第1学期', type: '专业基础课' },
      { code: 'AI103', name: '数据结构', credit: 4, hours: 64, semester: '第2学期', type: '专业基础课' },
      { code: 'AI201', name: '概率论与数理统计', credit: 4, hours: 64, semester: '第2学期', type: '专业基础课' },
      { code: 'AI202', name: '机器学习基础', credit: 4, hours: 64, semester: '第3学期', type: '专业核心课' },
      { code: 'AI203', name: '深度学习', credit: 4, hours: 64, semester: '第4学期', type: '专业核心课' },
      { code: 'AI204', name: '计算机视觉', credit: 3, hours: 48, semester: '第5学期', type: '专业核心课' },
      { code: 'AI301', name: '自然语言处理', credit: 3, hours: 48, semester: '第5学期', type: '专业核心课' },
      { code: 'AI302', name: '知识表示与推理', credit: 3, hours: 48, semester: '第6学期', type: '专业核心课' },
      { code: 'AI303', name: '人工智能实践', credit: 4, hours: 64, semester: '第6学期', type: '专业核心课' }
    ],
    electiveCourses: [
      { code: 'AI401', name: '强化学习', credit: 3, hours: 48, semester: '第6-7学期', direction: '智能决策' },
      { code: 'AI402', name: '生成对抗网络', credit: 3, hours: 48, semester: '第6-7学期', direction: '生成模型' },
      { code: 'AI403', name: '大规模机器学习', credit: 3, hours: 48, semester: '第7-8学期', direction: '大规模计算' },
      { code: 'AI404', name: '图神经网络', credit: 3, hours: 48, semester: '第7-8学期', direction: '图数据分析' },
      { code: 'AI405', name: '多模态学习', credit: 3, hours: 48, semester: '第7-8学期', direction: '多模态' },
      { code: 'AI406', name: '智能机器人', credit: 3, hours: 48, semester: '第7-8学期', direction: '机器人' },
      { code: 'AI407', name: '人工智能伦理', credit: 2, hours: 32, semester: '第7-8学期', direction: '伦理与社会' },
      { code: 'AI408', name: '大模型技术', credit: 3, hours: 48, semester: '第7-8学期', direction: '前沿技术' }
    ]
  }
])

// 当前选中的系
const currentDepartment = computed(() => {
  return departments.value.find(dept => dept.id === activeDepartment.value) || departments.value[0]
})

// 当前选中的培养计划
const currentPlan = computed(() => {
  const plan = trainingPlans.value.find(
    plan => plan.departmentId === activeDepartment.value && plan.year === selectedYear.value
  )
  
  // 如果没有找到完全匹配的计划，返回该系最新的计划
  if (!plan) {
    const deptPlans = trainingPlans.value.filter(p => p.departmentId === activeDepartment.value)
    return deptPlans.sort((a, b) => b.year - a.year)[0] || trainingPlans.value[0]
  }
  
  return plan
})

// 处理系选择
const handleDepartmentSelect = (index: string) => {
  activeDepartment.value = index
}

// 处理编辑
const handleEdit = () => {
  ElMessage.info('培养计划编辑功能开发中')
}

// 绘制课程地图
const drawCourseMap = () => {
  if (!courseMapRef.value) return
  
  const courseMap = echarts.init(courseMapRef.value)
  
  // 准备节点和边的数据
  const nodes: any[] = []
  const links: any[] = []
  const categories = [
    { name: '专业基础课' },
    { name: '专业核心课' },
    { name: '专业选修课' }
  ]
  
  // 添加核心课程节点
  currentPlan.value.coreCourses.forEach((course, index) => {
    const categoryIndex = course.type === '专业基础课' ? 0 : 1
    nodes.push({
      id: course.code,
      name: course.name,
      symbolSize: course.credit * 8,
      category: categoryIndex,
      value: course.credit
    })
    
    // 添加课程之间的依赖关系（简化处理，假设前一门课是后一门课的先修课）
    if (index > 0) {
      links.push({
        source: currentPlan.value.coreCourses[index - 1].code,
        target: course.code
      })
    }
  })
  
  // 添加选修课程节点
  currentPlan.value.electiveCourses.forEach((course, index) => {
    nodes.push({
      id: course.code,
      name: course.name,
      symbolSize: course.credit * 7,
      category: 2,
      value: course.credit
    })
    
    // 为选修课添加一些依赖关系（根据方向和学期简单处理）
    const possiblePrerequisites = currentPlan.value.coreCourses.filter(
      c => parseInt(c.semester.replace(/[^0-9]/g, '')) < parseInt(course.semester.split('-')[0].replace(/[^0-9]/g, ''))
    )
    
    if (possiblePrerequisites.length > 0) {
      // 随机选择一个先修课
      const prerequisite = possiblePrerequisites[Math.floor(Math.random() * possiblePrerequisites.length)]
      links.push({
        source: prerequisite.code,
        target: course.code
      })
    }
  })
  
  const option = {
    title: {
      text: `${currentDepartment.value.name} ${selectedYear.value}级课程地图`,
      top: 'bottom',
      left: 'right'
    },
    tooltip: {
      formatter: function(params: any) {
        if (params.dataType === 'node') {
          const course = [...currentPlan.value.coreCourses, ...currentPlan.value.electiveCourses]
            .find(c => c.code === params.data.id)
          if (course) {
            return `${course.code}: ${course.name}<br/>学分: ${course.credit}<br/>学时: ${course.hours}<br/>学期: ${course.semester}`
          }
        }
        return params.name
      }
    },
    legend: [{
      data: categories.map(a => a.name)
    }],
    animationDuration: 1500,
    series: [
      {
        name: '课程地图',
        type: 'graph',
        layout: 'force',
        data: nodes,
        links: links,
        categories: categories,
        roam: true,
        label: {
          show: true,
          position: 'right',
          formatter: '{b}'
        },
        force: {
          repulsion: 100,
          edgeLength: [80, 200]
        },
        lineStyle: {
          color: 'source',
          curveness: 0.3
        },
        emphasis: {
          focus: 'adjacency',
          lineStyle: {
            width: 4
          }
        }
      }
    ]
  }
  
  courseMap.setOption(option)
  
  window.addEventListener('resize', () => {
    courseMap.resize()
  })
}

// 监听选项变化，重绘课程地图
watch([activeDepartment, selectedYear, activeTab], () => {
  if (activeTab.value === 'courseMap') {
    setTimeout(drawCourseMap, 100)
  }
})

onMounted(() => {
  if (activeTab.value === 'courseMap') {
    setTimeout(drawCourseMap, 100)
  }
})
</script>

<style scoped>
.training-plan-container {
  padding: 20px;
}

.department-card {
  margin-bottom: 20px;
}

.department-menu {
  border-right: none;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.plan-content {
  padding: 10px;
}

.section {
  margin-bottom: 20px;
}

.section h3 {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

:deep(.el-tabs__header) {
  margin-bottom: 20px;
}

:deep(ol), :deep(ul) {
  padding-left: 20px;
  line-height: 1.8;
}

:deep(p) {
  line-height: 1.8;
  margin-bottom: 15px;
}

.course-map {
  border: 1px solid #eee;
  border-radius: 4px;
}
</style> 