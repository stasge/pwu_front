import { defineStore } from 'pinia'
import { fetchGet, fetchPost } from '@/utils/fetchApi';
import type { User } from '@/models/user';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

export const useUserStore = defineStore('userStore', () => {

  const user = ref<User | null>(null)
  const router = useRouter()

  const isLoggedIn = computed(() => !!user.value)
  
  async  function loadUser() {
      try {
        const resp = await fetchGet('user/getUser')
        user.value = resp?.data
      } catch (error) {
        user.value = null
      }
  }
  
  async function loginUser(username: string, password: string) {
    const resp = await fetchPost("signin", { username, pass: password });
    localStorage.setItem("pwu_token", resp?.data.access_token);
    localStorage.setItem("pwu_refresh_token", resp?.data.refresh_token);
    user.value = resp?.data?.user
  }

  function logoutUser() {
    localStorage.removeItem("pwu_token");
    localStorage.removeItem("pwu_refresh_token");
    user.value = null
    router.push({name: 'home'})
  }

  return { 
    loginUser, 
    logoutUser, 
    loadUser, 
    isLoggedIn,
    user
  }
})
