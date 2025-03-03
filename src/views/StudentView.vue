<template>
  <div class="student-container">
    <el-card class="search-card">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input
            v-model="searchId"
            placeholder="请输入学号搜索"
            class="search-input"
            clearable
            @clear="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="2">
          <el-button type="primary" @click="handleSearch" class="operation-button">
            <el-icon><Search /></el-icon>搜索
          </el-button>
        </el-col>
        <el-col :span="2">
          <el-button type="info" @click="handleReset" class="operation-button">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
        </el-col>
        <el-col :span="3">
          <el-button type="success" @click="handleAdd" class="operation-button">
            <el-icon><Plus /></el-icon>新增
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="table-card">
      <el-table :data="filteredStudents" stripe style="width: 100%">
        <el-table-column prop="id" label="学号" width="120" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="gender" label="性别" width="80" />
        <el-table-column prop="birthday" label="出生日期" width="120" />
        <el-table-column prop="phone" label="联系电话" width="120" />
        <el-table-column prop="address" label="地址" />
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

    <!-- 编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="50%"
      :before-close="handleClose"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="edit-form"
      >
        <el-form-item label="学号" prop="id">
          <el-input 
            v-model="form.id" 
            placeholder="请输入学号"
            :disabled="isEdit"
          />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select v-model="form.gender" placeholder="请选择性别" style="width: 100%">
            <el-option label="男" value="男" />
            <el-option label="女" value="女" />
          </el-select>
        </el-form-item>
        <el-form-item label="出生日期" prop="birthday">
          <el-date-picker
            v-model="form.birthday"
            type="date"
            placeholder="请选择出生日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input
            v-model="form.address"
            type="textarea"
            placeholder="请输入地址"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="handleSubmit">
            {{ isEdit ? '保存' : '添加' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {Search, Edit, Delete, Plus, Refresh, Operation} from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import authApi from '@/api/authApi'
import type {Student} from "@/stores/interface.ts";
import "@/assets/studentView.css"



const searchId = ref('')
const students = ref<Student[]>([])

const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const formRef = ref<FormInstance>()

const form = ref<Student>({
  id: 0,
  name: '',
  gender: '',
  birthday: new Date(),
  phone: '',
  address: ''
})

const rules: FormRules = {
  id: [
    { required: true, message: '请输入学号', trigger: 'blur' },
    { type: 'number', message: '学号必须为数字', trigger: 'blur', transform(value) { return Number(value) } }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  birthday: [
    { required: true, message: '请选择出生日期', trigger: 'change' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    // { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入地址', trigger: 'blur' }
  ]
}

onMounted(async () => {
  try {
    const fetchedStudents = await authApi.fetchStuApi()
    if (Array.isArray(fetchedStudents)) {
      students.value = fetchedStudents
    }
  } catch (error) {
    console.error('Failed to fetch students:', error)
    students.value = []
  }
})

const filteredStudents = computed(() => {
  return students.value
})

const handleSearch = async () => {
  try {
    // 如果输入了学号，进行搜索
    if (searchId.value) {
      // 通过学号搜索学生
      const student = await authApi.getStudentById(Number(searchId.value));
      console.log("搜索返回的student类型:", typeof student)
      console.log("搜索返回的student数据:", student)
      const studentExist = student && Object.keys(student).length > 0;
      console.log(studentExist);
      
      if (studentExist) {
        console.log(student)
        students.value = student;
        console.log(students.value)
      } else {
        students.value = [];
        ElMessage({
          type: 'warning',
          message: '未找到相关学生',
        });
      }
    } else {
      // 如果没有输入学号，不进行搜索
      students.value = [];
      console.log("3", students.value); // 打印 students 数组为空的情况
    }
  } catch (error) {
    console.error('搜索失败:', error);
    ElMessage({
      type: 'error',
      message: '搜索失败',
    });
  }
};

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增学生信息'
  dialogVisible.value = true
  form.value = {
    id: 0,
    name: '',
    gender: '',
    birthday: new Date(),
    phone: '',
    address: ''
  }
}

const handleEdit = (row: Student) => {
  isEdit.value = true
  dialogTitle.value = '编辑学生信息'
  dialogVisible.value = true
  form.value = { ...row }
}

const handleClose = () => {
  dialogVisible.value = false
  formRef.value?.resetFields()
  isEdit.value = false
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid, fields) => {
    if (valid) {
      try {
        if (isEdit.value) {
          // 调用编辑 API
          // await authApi.updateStudent(form.value)
          console.log(form.value)
          const success = await authApi.updateStudent(form.value)
          if (success) {
            ElMessage({
              type: 'success',
              message: '更新成功'
            })
            //重新加载数据
            const fetchedStudents = await authApi.fetchStuApi()
            if (Array.isArray(fetchedStudents)) {
              students.value = fetchedStudents
            }
          }else {
            ElMessage({
              type: 'error',
              message: '更新失败'
            })
          }

        } else {
          // 调用新增 API
          // await authApi.addStudent(form.value)
          const made =await authApi.addStudent(form.value)
          if (made) {
            ElMessage({
              type: 'success',
              message: '添加成功'

            })
          }else
          {
            ElMessage({
              type: 'error',
              message: '添加失败'
            })
          }

        }
        dialogVisible.value = false
        //重新加载数据
        const fetchedStudents = await authApi.fetchStuApi()
        if (Array.isArray(fetchedStudents)) {
          students.value = fetchedStudents
        }
      } catch (error) {
        ElMessage({
          type: 'error',
          message: isEdit.value ? '更新失败' : '添加失败'
        })
      }
    } else {
      console.log('验证失败', fields)
    }
  })
}

const handleDelete = (row: Student) => {
  ElMessageBox.confirm(
    '确定要删除该学生信息吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      try {
        const made = await authApi.deleteStudent(row.id)
        if (made) {
          ElMessage({
            type: 'success',
            message: '删除成功'
          })
          //重新加载数据
          const fetchedStudents = await authApi.fetchStuApi()
          if (Array.isArray(fetchedStudents)) {
            students.value = fetchedStudents
          }

        }else {
          ElMessage({
            type: 'error',
            message: '删除失败'
          })
        }

      } catch (error) {
        ElMessage({
          type: 'error',
          message: '删除失败'
        })
      }
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '已取消删除'
      })
    })
}

const handleReset = async () => {
  searchId.value = ''
  // 重新获取所有学生数据
  try {
    const fetchedStudents = await authApi.fetchStuApi()
    if (Array.isArray(fetchedStudents)) {
      students.value = fetchedStudents
    }
  } catch (error) {
    console.error('获取数据失败:', error)
    ElMessage({
      type: 'error',
      message: '重置失败'
    })
  }
}
</script>

<style scoped>

</style> 