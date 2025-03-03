import axios, {type InternalAxiosRequestConfig} from "axios";

axios.interceptors.request.use(
    (config:InternalAxiosRequestConfig) => {

        console.log("请求发送前")
        config.headers = config.headers ?? {};
        config.headers["Content-Type"] = "application/json";
        return config
},
    (error) => {
        return Promise.reject(error);})

axios.interceptors.response.use(response =>{
        console.log('响应成功');
        return response;
    },error => {
            if (error.response) {
                    // 服务器响应了非 2xx 的状态码
                    console.error('服务器错误：', error.response.status);
            } else if (error.request) {
                    // 请求发出了，但没有收到响应
                    console.error('网络错误');
            } else {
                    // 其他错误
                    console.error('错误', error.message);
            }
            return Promise.reject(error);
}

)