import './assets/main.scss'
import "vue-toastification/dist/index.css";
import 'primeicons/primeicons.css'
import 'vue-loading-overlay/dist/css/index.css';

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Toast from "vue-toastification";
import App from './App.vue'
import router from './router'
import PrimeVue from "primevue/config"
import Aura from '@primevue/themes/aura';
import {LoadingPlugin} from "vue-loading-overlay";
import Tooltip from 'primevue/tooltip';
import ConfirmationService from 'primevue/confirmationservice';
import {CkeditorPlugin } from '@ckeditor/ckeditor5-vue'; // Імпортуємо CKEditor плагін для Vue


const app = createApp(App)

app.use(CkeditorPlugin);
app.use(ConfirmationService);
app.directive('tooltip', Tooltip);
app.use(createPinia())
app.use(router)
app.use(Toast, {});
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            prefix: 'p',
            darkModeSelector: 'system',
            cssLayer: false
        }
    }
});
app.use(LoadingPlugin);


app.mount('#app')
