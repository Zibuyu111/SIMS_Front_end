<template>
  <div class="profile-container">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="profile-card">
          <div class="avatar-container">
            <el-avatar :size="120" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
            <h2 class="admin-name">管理员</h2>
            <p class="admin-role">系统管理员</p>
          </div>
          <div class="info-stats">
            <div class="stat-item">
              <h3>上次登录</h3>
              <p>{{ lastLogin }}</p>
            </div>
            <div class="stat-item">
              <h3>账号创建</h3>
              <p>{{ createTime }}</p>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="16">
        <el-card class="info-card">
          <template #header>
            <div class="card-header">
              <span>基本信息</span>
              <el-button type="primary" @click="handleEdit">
                <el-icon><Edit /></el-icon>
                编辑信息
              </el-button>
            </div>
          </template>
          
          <el-form :model="adminInfo" label-width="100px">
            <el-form-item label="用户名">
              <el-input v-model="adminInfo.username" disabled />
            </el-form-item>
            <el-form-item label="真实姓名">
              <el-input v-model="adminInfo.realName" disabled />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="adminInfo.email" disabled />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="adminInfo.phone" disabled />
            </el-form-item>
            <el-form-item label="部门">
              <el-input v-model="adminInfo.department" disabled />
            </el-form-item>
            <el-form-item label="职位">
              <el-input v-model="adminInfo.position" disabled />
            </el-form-item>
          </el-form>
        </el-card>
        
        <el-card class="security-card">
          <template #header>
            <div class="card-header">
              <span>安全设置</span>
            </div>
          </template>
          
          <div class="security-items">
            <div class="security-item">
              <div class="security-info">
                <h4>账户密码</h4>
                <p>定期更改密码可以保护账号安全</p>
              </div>
              <el-button type="primary" @click="handleChangePassword">修改密码</el-button>
            </div>
            
            <div class="security-item">
              <div class="security-info">
                <h4>绑定手机</h4>
                <p>已绑定：{{ adminInfo.phone }}</p>
              </div>
              <el-button @click="handleChangePhone">修改</el-button>
            </div>
            
            <div class="security-item">
              <div class="security-info">
                <h4>绑定邮箱</h4>
                <p>已绑定：{{ adminInfo.email }}</p>
              </div>
              <el-button @click="handleChangeEmail">修改</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Edit } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const lastLogin = ref('2024-03-25 15:30:00')
const createTime = ref('2024-01-01')

const adminInfo = ref({
  username: 'admin',
  realName: '张三',
  email: 'admin@example.com',
  phone: '13800138000',
  department: '信息技术部',
  position: '系统管理员'
})

const handleEdit = () => {
  ElMessage.info('编辑信息功能开发中')
}

const handleChangePassword = () => {
  ElMessage.info('修改密码功能开发中')
}

const handleChangePhone = () => {
  ElMessage.info('修改手机号功能开发中')
}

const handleChangeEmail = () => {
  ElMessage.info('修改邮箱功能开发中')
}
</script>

<style scoped>
.profile-container {
  padding: 20px;
}

.profile-card {
  text-align: center;
}

.avatar-container {
  padding: 20px 0;
}

.admin-name {
  margin: 15px 0 5px;
  font-size: 20px;
}

.admin-role {
  color: #666;
  margin: 0;
}

.info-stats {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.stat-item {
  text-align: center;
}

.stat-item h3 {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.stat-item p {
  font-size: 16px;
  margin: 5px 0 0;
}

.info-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.security-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.security-item:last-child {
  border-bottom: none;
}

.security-info h4 {
  margin: 0 0 5px;
}

.security-info p {
  margin: 0;
  color: #666;
  font-size: 14px;
}
</style> 