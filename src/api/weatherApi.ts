import http from "@/services/http.ts";

interface WeatherResponse {
    city: string;
    temperature: string;
    weather: string;
    windDirection: string;
    windPower: string;
    humidity: string;
}

interface ApiResponse {
    precipitation: number;
    temperature: number;
    pressure: number;
    humidity: number;
    windDirection: string;
    windDirectionDegree: number;
    windSpeed: number;
    windScale: string;
    code: number;
    place: string;
    weather1: string;
    weather2: string;
}

const weatherApi = {
    // 获取天气信息
    async getWeather(province: string = '四川', city: string = '德阳'): Promise<WeatherResponse> {
        try {
            // 不使用泛型，因为响应直接就是数据
            const response = await http.get(
                `https://cn.apihz.cn/api/tianqi/tqyb.php?id=88888888&key=88888888&sheng=${encodeURIComponent(province)}&place=${encodeURIComponent(city)}`
            ) as unknown as ApiResponse;
            
            console.log('API Response:', response);
            
            // response 直接就是数据对象
            if (!response || typeof response !== 'object') {
                throw new Error('Invalid response format');
            }

            return {
                city: province+city, // 直接使用传入的城市名
                temperature: response.temperature.toString(),
                weather: response.weather1,
                windDirection: response.windDirection,
                windPower: response.windScale,
                humidity: response.humidity.toString()
            };
        } catch (error) {
            console.error('Failed to fetch weather data:', error);
            if (error instanceof Error) {
                console.error('Error details:', error.message);
            }
            throw error;
        }
    }
};

export default weatherApi; 