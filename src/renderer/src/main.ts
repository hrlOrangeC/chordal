import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import VWave from 'v-wave'
import router from './router/index'
import { createPinia } from "pinia";
import '@icon-park/vue-next/styles/index.css';
import { ElMessage } from 'element-plus'

const pinia = createPinia();
const app = createApp(App)

app.use(ElementPlus)
app.use(pinia)
app.use(VWave, {
    color: 'rgb(251,60,41)'
})
app.use(router)
app.use(ElMessage)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
app.mount('#app')

