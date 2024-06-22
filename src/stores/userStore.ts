import { defineStore } from 'pinia'
import { fetchGet, fetchPost } from '@/utils/fetchApi';
import type { User } from '@/models/user';
import { ref } from 'vue';

export const useUserStore = defineStore('userStore', () => {

  const user = ref<User | null>(null)
  
  async  function loadUser() {
    const {data: userData} = await fetchGet('user/getUser')
    user.value = userData
  }
  
  async function loginUser(username: string, password: string) {
    const data = await fetchPost("signin", { username, pass: password });
    localStorage.setItem("pwu_token", data.data.access_token);
    localStorage.setItem("pwu_refresh_token", data.data.refresh_token);
  }

  function logoutUser() {
    localStorage.removeItem("pwu_token");
    localStorage.removeItem("pwu_refresh_token");
    user.value = null
  }

  async function refresh() {
    const {data: token} = await fetchGet('refresh')

    if (token) {
      localStorage.setItem('pwu_token', token)
    }
  }

  return { loginUser, logoutUser, refresh, loadUser }
})
