import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type {LoginForm, WeatherData} from "@/stores/interface.ts";


export const useCounterStore = defineStore('counter', () => {

  // 初始化 LoginForm 和 WeatherData
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


  return { formData,weatherData }
})

