import './assets/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import "vue-toastification/dist/index.css";
import Toast from "vue-toastification";
import App from './App.vue'
import router from './router'



const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Toast, {});

app.mount('#app')
