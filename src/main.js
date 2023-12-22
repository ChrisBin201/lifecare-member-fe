import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router'
import PrimeVue from 'primevue/config';
import "primeflex/primeflex.css";
import "primevue/resources/themes/lara-light-green/theme.css";
import "primeicons/primeicons.css";
import "@/index.css"

import store from '@/store';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
createApp(App)
    .use(router)
    .use(store)
    .use(ToastService)
    .use(ConfirmationService)
    .use(PrimeVue, { ripple: true  })
    .mount('#app')
