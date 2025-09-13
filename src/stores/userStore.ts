import { defineStore } from 'pinia'
import { fetchGet, fetchPost } from '@/utils/fetchApi';
import type { User } from '@/models/user';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useMitt } from '@/composables/useMitt';

export const useUserStore = defineStore('userStore', () => {
  const roles = [
    {
      id: 0,
      role: 'Користувач'
    },
    {
      id: 1,
      role: 'Адміністратор'
    },
    {
      id: 6,
      role: 'Бан форума'
    },
    {
      id: 7,
      role: 'Лиходій, що прикидається адміном'
    },
    {
      id: 8,
      role: 'Повний бан'
    }
  ]

  const user = ref<User | null>(null)
  const unreadCount = ref(0)
  const router = useRouter()
  const serverStatusCode = ref<{ online: boolean, count_online: number } | null>(null)
  const isAdmin = computed(() => user.value?.role === 1)
  const isLoggedIn = computed(() => !!user.value)

  async function loadUser(userData: User | null = null) {
    if (userData) {
      user.value = userData
      return 
    }
    try {
      const resp = await fetchGet('user/getUser')
      user.value = resp?.data
    } catch (error) {
      user.value = null
    }
  }

  async function getOnline() {
      const {data} = await fetchGet('online')
      serverStatusCode.value = data
  }

  async function loginUser(username: string, password: string) {
    const resp = await fetchPost("signin", { username, pass: password });
    user.value = resp?.data
    getUnreadCount()

    useMitt().emit('login')
  }

  async function logoutUser() {
    await fetchGet('user/logout')
    user.value = null
    unreadCount.value = 0
    router.push({ name: 'home' })
  }

  const getRoleName = (rid: number) => {
    return roles.find(r => r.id === rid)?.role
  }

  const getUnreadCount = async () => {
      const { data } = await fetchGet('/support/getUnread')
      unreadCount.value = data
  }

  return {
    loginUser,
    logoutUser,
    loadUser,
    getRoleName,
    isLoggedIn,
    user,
    isAdmin,
    getUnreadCount,
    unreadCount,
    serverStatusCode,
    getOnline
  }
})
