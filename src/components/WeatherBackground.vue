<template>
  <div class="weather-background">
    <!-- 风力效果 -->
    <div class="wind-particles">
      <template v-for="n in getParticleCount" :key="n">
        <div class="particle" 
             :style="{ 
               '--d': `${Math.random() * 3}s`, 
               '--l': `${Math.random() * 100}%`,
               '--t': `${Math.random() * 100}%`,
               '--speed': getWindSpeed,
               '--angle': getWindAngle,
               '--size': `${Math.random() * 3 + 2}px`,
               '--opacity': `${Math.random() * 0.4 + 0.2}`
             }">
        </div>
      </template>
    </div>

    <!-- 雨天效果 -->
    <div v-if="weather.includes('雨')" class="rain">
      <template v-for="n in 20" :key="n">
        <div class="drop" 
             :style="{ 
               '--d': `${Math.random() * 1}s`, 
               '--l': `${Math.random() * 100}%`,
               '--angle': getWindAngle,
               '--speed': getWindSpeed
             }">
        </div>
      </template>
    </div>

    <!-- 雪天效果 -->
    <div v-if="weather.includes('雪')" class="snow">
      <template v-for="n in 50" :key="n">
        <div class="snowflake" 
             :style="{ 
               '--d': `${Math.random() * 5}s`, 
               '--l': `${Math.random() * 100}%`,
               '--angle': getWindAngle,
               '--speed': getWindSpeed
             }">
        </div>
      </template>
    </div>

    <!-- 多云效果 -->
    <div v-if="weather.includes('多云')" class="clouds">
      <template v-for="n in 5" :key="n">
        <div class="cloud" 
             :style="{ 
               '--d': `${60 / (Number(windPower) || 1)}s`, 
               '--l': `${Math.random() * 80}%`, 
               '--t': `${Math.random() * 50}%` 
             }">
        </div>
      </template>
    </div>

    <!-- 雾天效果 -->
    <div v-if="weather.includes('雾')" class="fog"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  weather: string;
  windPower?: string;
  windDirection?: string;
}>();

// 根据风力等级计算粒子数量
const getParticleCount = computed(() => {
  const power = Number(props.windPower) || 0;
  // 大幅增加基础粒子数量和每级风力增加的粒子数
  return Math.min(100 + (power * 30), 300);
});

// 根据风力等级计算动画速度
const getWindSpeed = computed(() => {
  const power = Number(props.windPower) || 0;
  // 调整基础速度和速度因子
  const baseSpeed = 8; // 降低基础速度使粒子移动更快
  const speedFactor = Math.max(0.3, 1 - (power * 0.15)); // 调整速度变化率
  return `${baseSpeed * speedFactor}s`;
});

// 根据风向计算角度
const getWindAngle = computed(() => {
  const direction = props.windDirection || '无风';
  const angleMap: { [key: string]: number } = {
    '东风': 0,
    '东南风': 45,
    '南风': 90,
    '西南风': 135,
    '西风': 180,
    '西北风': 225,
    '北风': 270,
    '东北风': 315,
    '无风': 0
  };
  return `${angleMap[direction] || 0}deg`;
});
</script>

<style scoped>
.weather-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

/* 风力粒子效果 */
.wind-particles {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 2; /* 提高层级 */
}

.particle {
  position: absolute;
  width: var(--size, 2px);
  height: var(--size, 2px);
  background: rgba(255, 255, 255, var(--opacity, 0.3));
  border-radius: 50%;
  left: var(--l);
  top: var(--t);
  animation: particle-move linear infinite;
  animation-duration: var(--speed, '5s');
  transform: rotate(var(--angle, '0deg'));
  filter: blur(1px);
  box-shadow: 0 0 4px rgba(255, 255, 255, 0.8); /* 增强发光效果 */
}

@keyframes particle-move {
  0% {
    transform: translate(0, 0);
    opacity: 0;
  }
  5% { /* 更快地显示出来 */
    opacity: var(--opacity, 0.3);
  }
  95% { /* 保持更长时间的可见性 */
    opacity: var(--opacity, 0.3);
  }
  100% {
    transform: translate(calc(cos(var(--angle)) * 120vw), calc(sin(var(--angle)) * 120vh));
    opacity: 0;
  }
}

/* 修改雨滴效果，添加风向影响 */
.drop {
  position: absolute;
  width: 2px;
  height: 100px;
  background: linear-gradient(transparent, rgba(255, 255, 255, 0.5));
  animation: rain-fall linear infinite;
  animation-duration: 0.7s;
  animation-delay: var(--d);
  left: var(--l);
  transform: rotate(calc(var(--angle) - 90deg));
}

@keyframes rain-fall {
  0% {
    transform: translateY(-120px) rotate(calc(var(--angle) - 90deg));
  }
  100% {
    transform: translateY(100vh) rotate(calc(var(--angle) - 90deg));
  }
}

/* 修改雪花效果，添加风向影响 */
.snowflake {
  position: absolute;
  width: 6px;
  height: 6px;
  background: white;
  border-radius: 50%;
  animation: snow-fall linear infinite;
  animation-duration: var(--speed, '10s');
  animation-delay: var(--d);
  left: var(--l);
  opacity: 0.8;
}

@keyframes snow-fall {
  0% {
    transform: translate(0, -10px) rotate(0deg);
  }
  100% {
    transform: translate(calc(cos(var(--angle)) * 100vw), calc(100vh + sin(var(--angle)) * 100vh)) rotate(360deg);
  }
}

/* 修改云朵效果，根据风力调整速度 */
.cloud {
  position: absolute;
  width: 200px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  animation: cloud-move linear infinite;
  animation-duration: var(--d);
  left: var(--l);
  top: var(--t);
}

.cloud::before,
.cloud::after {
  content: '';
  position: absolute;
  background: inherit;
  border-radius: 50%;
}

.cloud::before {
  width: 80px;
  height: 80px;
  top: -30px;
  left: 30px;
}

.cloud::after {
  width: 100px;
  height: 100px;
  top: -40px;
  left: 90px;
}

@keyframes cloud-move {
  0% {
    transform: translateX(-300px);
  }
  100% {
    transform: translateX(calc(100vw + 300px));
  }
}

/* 雾天效果 */
.fog {
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.2);
  animation: fog-pulse 4s ease-in-out infinite;
}

@keyframes fog-pulse {
  0%, 100% {
    opacity: 0.2;
  }
  50% {
    opacity: 0.4;
  }
}
</style> 