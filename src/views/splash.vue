<script setup lang="ts">
import {ref, onMounted} from "vue";
import authApi from "@/api/authApi.ts"
import weatherApi from "@/api/weatherApi.ts"
import {useRouter} from "vue-router";
import { ElMessage } from 'element-plus';
import WeatherBackground from '@/components/WeatherBackground.vue';
import type { LoginForm, WeatherData } from "@/stores/interface";
import {Message} from "@element-plus/icons-vue";

const router = useRouter();

const formData = ref<LoginForm>({
  account: "",
  password: ""
})

const weatherData = ref<WeatherData>({
  city: "绵阳",
  temperature: "--",
  weather: "加载中...",
  windDirection: "--",
  windPower: "--",
  humidity: "--"
});

const passwordVisible = ref(false)
const currentDate = ref('')
const currentTime = ref('')

// 更新时间的函数
const updateDateTime = () => {
  const now = new Date()
  currentDate.value = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
  currentTime.value = now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取天气信息
const fetchWeatherData = async () => {
  try {
    // 显示加载状态
    weatherData.value = {
      city: "加载中...",
      temperature: "--",
      weather: "加载中...",
      windDirection: "--",
      windPower: "--",
      humidity: "--"
    };

    // 获取天气数据
    const data = await weatherApi.getWeather();
    weatherData.value = data;
  } catch (error) {
    console.error('Failed to fetch weather data:', error);
    ElMessage.error('获取天气信息失败');
  }
};

onMounted(() => {
  updateDateTime()
  setInterval(updateDateTime, 1000)
  fetchWeatherData() // 获取天气数据
  setInterval(fetchWeatherData, 1800000) // 每30分钟更新一次天气
})

async function handleLogin(formData: LoginForm):Promise<Boolean>{
  try {
    const res = await authApi.login(formData)
    if(res){
      // 登录成功，存储 token
      localStorage.setItem('token', 'your-token-value') // 实际项目中这里应该使用后端返回的真实 token
      ElMessage({
        type: 'success',
        message: '登录成功'
      })
      await router.replace('/home/dashboard')
      return true
    } else {
      ElMessage({
        type: 'error',
        message: '账号或密码错误'
      })
      return false
    }
  } catch (error){
    ElMessage({
      type: 'error',
      message: '登录失败'
    })
    console.error(error)
    return false
  }
}
</script>

<template>
  <div class="login-container">
    <WeatherBackground 
      :weather="weatherData.weather" 
      :wind-power="weatherData.windPower"
      :wind-direction="weatherData.windDirection"
    />
    <div class="login-panel">
      <!-- 左侧天气面板 -->
      <div class="weather-section">
        <div class="weather-content">
          <div class="weather-icon">
            <i class="fas" :class="{'fa-sun': weatherData.weather.includes('晴'),
                                  'fa-cloud': weatherData.weather.includes('多云'),
                                  'fa-cloud-rain': weatherData.weather.includes('雨'),
                                  'fa-snowflake': weatherData.weather.includes('雪'),
                                  'fa-smog': weatherData.weather.includes('雾')}"></i>
          </div>
          <div class="weather-info">
            <h2>{{ weatherData.city }}</h2>
            <div class="temperature">{{ weatherData.temperature }}°C</div>
            <div class="weather-desc">{{ weatherData.weather }}</div>
            <div class="weather-details">
              <span>湿度: {{ weatherData.humidity }}%</span>
              <span>风向: {{ weatherData.windDirection }}</span>
              <span>风力: {{ weatherData.windPower }}</span>
            </div>
            <div class="date-time">
              <div class="date">{{ currentDate }}</div>
              <div class="time">{{ currentTime }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧登录面板 -->
      <div class="login-section">
        <div class="login-box">
          <div class="system-title">
            <div class="icon">
              <i class="fas fa-graduation-cap"></i>
            </div>
            <h2>学生信息管理系统4.0.1</h2>
            <p class="subtitle">Student Information Management System</p>
          </div>
          <form @submit.prevent="()=>handleLogin(formData)">
            <div class="input-group">
              <label>
                <i class="fas fa-user"></i>
              </label>
              <input placeholder="请输入账号" v-model="formData.account" type="text"/>
            </div>
            <div class="input-group">
              <label>
                <i class="fas fa-lock"></i>
              </label>
              <input 
                :type="passwordVisible ? 'text' : 'password'"
                placeholder="请输入密码" 
                v-model="formData.password"
              />
              <i 
                class="password-toggle fas"
                :class="passwordVisible ? 'fa-eye-slash' : 'fa-eye'"
                @click="passwordVisible = !passwordVisible"
              ></i>
            </div>
            <button type="submit">登 录</button>
          </form>
        </div>
      </div>
    </div>
    <footer class="system-footer">
      © 2026 学生信息管理系统4.0.1 | 技术支持 ELEMENTPLUS CURSOR SPRINGBOOT VUE3.0 TYPESCRIPT KOTLIN MYBATIES MYBATIESPLUS MYSQL
    </footer>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #1a2980 0%, #26d0ce 100%);
  position: relative;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

.login-panel {
  position: relative;
  z-index: 2;
  display: flex;
  width: 900px;
  height: 500px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.weather-section {
  flex: 1;
  padding: 40px;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.weather-content {
  color: white;
  text-align: center;
}

.weather-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.weather-info h2 {
  margin: 0;
  font-size: 24px;
}

.temperature {
  font-size: 48px;
  margin: 20px 0;
}

.weather-desc {
  font-size: 20px;
  margin-bottom: 20px;
}

.date-time {
  font-size: 16px;
  opacity: 0.8;
}

.login-section {
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-box {
  width: 100%;
}

.input-group {
  margin-bottom: 25px;
  position: relative;
  width: 100%;
  box-sizing: border-box;
}

input {
  width: 100%;
  padding: 15px 45px;
  border: none;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  color: white;
  font-size: 16px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.input-group label {
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.8);
  font-size: 18px;
}

input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.2);
}

/* 确保图标在输入框上层 */
.input-group i {
  z-index: 2;
}

/* 调整输入框内边距，为图标留出空间 */
.input-group input {
  padding-right: 45px;
}

.password-toggle {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: rgba(255, 255, 255, 0.7);
  font-size: 18px;
  z-index: 2;
  padding: 5px;
  transition: all 0.3s ease;
}

button {
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #00c6fb 0%, #005bea 100%);
  color: white;
  font-size: 17px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 4px;
  margin-top: 10px;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.system-title {
  text-align: center;
  margin-bottom: 40px;
  color: white;
}

.icon {
  font-size: 3em;
  margin-bottom: 15px;
}

.system-title h2 {
  font-size: 1.8em;
  margin: 10px 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.subtitle {
  font-size: 1em;
  opacity: 0.8;
  margin-top: 5px;
}

.system-footer {
  position: fixed;
  bottom: 20px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9em;
}

/* 响应式设计 */
@media (max-width: 960px) {
  .login-panel {
    width: 90%;
    flex-direction: column;
    height: auto;
  }
  
  .weather-section {
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }
}

.weather-details {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin: 10px 0;
  font-size: 14px;
  opacity: 0.9;
}

.weather-details span {
  display: block;
}
</style>