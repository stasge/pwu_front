import { createRouter, createWebHistory } from 'vue-router'
import MainView from '@/views/MainView.vue'
import MainPage from '@/pages/MainPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: MainView,
      children: [
        {
          path: '',
          name: 'home',
          component: MainPage
        }
      ]
    }
  ]
})

export default router
