import axios from "axios";

const http = axios.create({
    baseURL: 'http://localhost:1234',
    timeout: 100000,
})

//请求拦截器
http.interceptors.request.use(
    (config) => {
        console.log("请求发送前")
        config.headers["content-type"] = "application/json; charset=utf-8"
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
    )
//响应拦截器
http.interceptors.response.use(
    (res) => {
        return res.data;//返回数据部分
    },
    (error) => {
        if (error.response){
            console.error('Error response', error.response)
            return Promise.reject(error.response.data)
        }else if (error.request) {
            // 请求没有收到响应
            console.error('Error request:', error.request);
            return Promise.reject('No response received');
        } else {
            // 其他错误
            console.error('General Error:', error.message);
            return Promise.reject(error.message);
        }
    }
)

export default http;