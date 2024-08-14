import axios from 'axios'
// axios.defaults.withCredentials = true;

const ajax = axios.create({
    method: "POST",
    // baseURL: "https://api.xwzkj.top",
    // baseURL: 'http://localhost:3000',
    // withCredentials: true
})
ajax.interceptors.request.use((config) => {
    if (localStorage.getItem("cookie")) {
        config.data = {
            cookie: localStorage.getItem("cookie"), 
            // ...config.params 
        }
    }
    return config
})
export default ajax;