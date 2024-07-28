import { createRouter, createWebHistory, useRouter } from 'vue-router'
import MainView from '@/views/MainView.vue'
import MainPage from '@/pages/MainPage.vue'
import Profile from '@/components/Profile.vue'
import PageView from '@/views/PageView.vue'
import { useUserStore } from '@/stores/userStore'
import { useToast } from 'vue-toastification'
import Terms from '@/pages/Terms.vue'
import Forum from '@/pages/Forum.vue'
import ForumUnits from '@/pages/ForumUnits.vue'
import ForumArticle from '@/pages/ForumArticle.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior (to, from, savedPosition) {
    return {top: 0}
  },
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
      path: '/page',
      component: PageView,
      children: [
        {
          path: '/page/profile',
          name: 'profile',
          component: Profile,
          meta: {requiresAuth: true}
        },
        {
          path: '/page/forum',
          name: 'forum',
          component: Forum
        },
        {
          path: '/page/topics/:topic_id',
          name: 'topics',
          component: ForumUnits
        },
        {
          path: '/page/article',
          name: 'article',
          component: ForumArticle
        },
      ]
    },
    {
      path: '/terms',
      component: Terms,
      name: 'terms'
    }
  ]
})

router.beforeEach(async (to, from) => {
  const userStore = useUserStore()
  const toast = useToast()
  await userStore.loadUser();
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    toast.error("Потрібно авторизуватися")
    return {name: 'home'}
  }
})

export default router
