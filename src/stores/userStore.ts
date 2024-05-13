import { defineStore } from 'pinia'
import { fetchPost } from '@/utils/fetchApi';

export const useUserStore = defineStore('userStore', () => {

  async function loginUser(username: string, password: string) {
    const data = await fetchPost("signin", { username, pass: password });
    localStorage.setItem("pwu_token", data.data.access_token);
  }

  function logoutUser() {
    localStorage.removeItem("access_token");
    // useMitt().emit("logout", user.value.id);
    // router.push({name: 'main'})
}

  return { loginUser, logoutUser }
})
