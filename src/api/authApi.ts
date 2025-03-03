import http from "@/services/http.ts"
import axios from "axios";

interface LoginForm {
    account: String,
    password: String,
}

interface Student {
    id: number;
    name: string
    birthday: Date
    gender: string
    phone: string
    address: string
}

interface Articles {
    id: number;
    title: string;
    content: string;
}

const authApi = {
    //登录验证
    async login(loginForm: LoginForm): Promise<Boolean> {
        try {
            const response:Boolean = await http.post("/user/login", loginForm)
            return response
        }catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || "Something went wrong");
            }
            throw new Error("Something went wrong");
        }
    },

    //得到所有学生信息
    async fetchStuApi(): Promise<Student>{
        try{
            const response:Student = await http.get("/student/all");
            return response
        }catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || "Something went wrong");
            }
            throw new Error("Something went wrong");
        }
    },

    //删除学生信息
    async deleteStudent(studentId: number): Promise<Boolean|null> {
        try {
            const response:Boolean = await http.delete(`/student/${studentId}`);
            return response
        }catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || "Something went wrong");
            }
            return null
        }
    },

    //添加学生信息
    async addStudent(student: Student): Promise<Boolean|null> {
        try {
            const response:Boolean = await http.post("/student/list", student);
            return response
        }catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || "Something went wrong");
            }
            return null
        }
    },

    //更新学生信息
    async updateStudent(student: Student): Promise<Boolean|null> {
        try {
            console.log(student);
            const response:Boolean = await http.put("/student/update", student);
            return response
        }catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || "Something went wrong");
            }
            return null
        }
    },

    //搜索学生信息通过id
    async getStudentById(studentId: number): Promise<Student[]|null> {
        try{
            const response:Student[] = await http.get(`/student/${studentId}`);
            return response
        }catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || "Something went wrong");
            }
            return null
        }
    },

    //得到公告
    async getAllArticles(): Promise<Articles> {
        try{
            const response:Articles = await http.get("/articles/list");
            console.log(response);
            return response
        }catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || "Something went wrong");
            }
            throw new Error("Something went wrong");
        }

    },
    //搜索学生信息通过性别
    async getStudentByGender(gender:string): Promise<Student[]|null> {
        try{
            const response:Student[] = await http.get(`/student/byGender/${gender}`);
            console.log(response);
            return response
        }catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.message || "请求发送错误");
            }
            throw new Error("Something went wrong");
        }
    }

}





export default authApi;