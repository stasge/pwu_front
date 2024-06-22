import { createRouter, createWebHistory, useRouter } from 'vue-router'
import MainView from '@/views/MainView.vue'
import MainPage from '@/pages/MainPage.vue'
import Profile from '@/components/Profile.vue'
import ProfileView from '@/views/ProfileView.vue'
import { useUserStore } from '@/stores/userStore'
import { useToast } from 'vue-toastification'

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
        },
      ]
    },
    {
      path: '/profile',
      component: ProfileView,
      children: [
        {
          path: '',
          name: 'profile',
          component: Profile,
          meta: {requiresAuth: true}
        }
      ]
    }
  ]
})

router.beforeEach(async (to, from) => {
  const userStore = useUserStore()
  const toast = useToast()
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    toast.error("Потрібно авторизуватися")
    return {name: 'home'}
  }

  await userStore.loadUser();

})

export default router
