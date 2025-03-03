export interface LoginForm {
    account:String,
    password:String,
}

export interface WeatherData {
    city: string;
    temperature: string;
    weather: string;
    windDirection: string;
    windPower: string;
    humidity: string;
}

export interface Student {
    id: number
    name: string
    birthday: Date
    gender: string
    phone: string
    address: string
}