<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Login from '@/components/modals/login.vue';
import Register from '@/components/modals/register.vue';
import { useUserStore } from '@/stores/userStore';
import RecoverPass from './modals/RecoverPass.vue';
import RecoverPassCode from './modals/RecoverPassCode.vue';
import { useAsyncCallWrapper } from '@/composables/useAsyncCallWrapper';
import { fetchGet } from '@/utils/fetchApi';

const loginRef = ref<InstanceType<typeof Login> | null>(null)
const recoverRef = ref<InstanceType<typeof RecoverPass> | null>(null)
const recoverPassCodeRef = ref<InstanceType<typeof RecoverPassCode> | null>(null)
const registerRef = ref<InstanceType<typeof Register> | null>(null)
const userStore = useUserStore()

const isMenuOpen = ref(false);

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
}

function close() {
  isMenuOpen.value = false
}

const { wrapAsyncCall } = useAsyncCallWrapper()
const serverStatusCode = ref<{ online: boolean; count_online: number } | null>(null)

onMounted(async () => {
  await wrapAsyncCall(async () => {
    const { data } = await fetchGet('online')
    serverStatusCode.value = data
  })
})
</script>

<template>
  <div class="burger-menu">
    <button @click="toggleMenu" class="burger-icon">
      <i v-if="!isMenuOpen" class="pi pi-bars text-6xl text-white"></i>
      <i v-else class="pi pi-times text-6xl text-white"></i>
    </button>

    <!-- Floating server state on mobile when side menu is hidden -->
    <div v-if="!isMenuOpen" class="server-state server-state--floating flex gap-5">
      <div class="server-state__content flex justify-content-start align-items-center">
        <img width="20" src="@/assets/images/ua.png" alt="">
        <div class="flex align-items-start w-max mr-8 gap-5" style="transform: translateX(20%);">
          <h3 class="flex align-items-center gap-2">
            Valor - 1.3.6
          </h3>
          <div class="flex align-items-center gap-2">
            <div v-if="serverStatusCode && serverStatusCode.online" class="status-indicator online"></div>
            <div v-else class="status-indicator offline"></div>
            <span v-if="serverStatusCode && serverStatusCode.online" class="status-text flex align-items-center">
              <span>онлайн</span>
              <div v-if="serverStatusCode?.count_online" class="flex align-items-center gap-1">
                <span>:</span>
                <span>{{ serverStatusCode?.count_online }}</span>
              </div>
            </span>
            <span v-else class="status-text">офлайн</span>
          </div>
        </div>
      </div>
    </div>

    <nav class="menu" :class="{showed: isMenuOpen}">
      <div class="server-state flex gap-5">
        <div class="server-state__content flex justify-content-start align-items-center">
          <img width="20" src="@/assets/images/ua.png" alt="">
          <div class="flex align-items-start w-max mr-8 gap-5" style="transform: translateX(20%);">
            <h3 class="flex align-items-center gap-2">
              Valor - 1.3.6
            </h3>
            <div class="flex align-items-center gap-2">
              <div v-if="serverStatusCode && serverStatusCode.online" class="status-indicator online"></div>
              <div v-else class="status-indicator offline"></div>
              <span v-if="serverStatusCode && serverStatusCode.online" class="status-text flex align-items-center">
                <span>онлайн</span>
                <div v-if="serverStatusCode?.count_online" class="flex align-items-center gap-1">
                  <span>:</span>
                  <span>{{ serverStatusCode?.count_online }}</span>
                </div>
              </span>
              <span v-else class="status-text">офлайн</span>
            </div>
          </div>
        </div>
      </div>
      <ul  class="burger-menu__list flex flex-column gap-3 mt-6">
        <li @click="close()" class="burger-menu__item">
          <router-link :to="{ name: 'home' }">Головна</router-link>
        </li>
        <li @click="close()" class="burger-menu__item">
          <router-link :to="{name: 'separate-theme', params: {theme_id: 2, cat_id: 1}}">Про сервер</router-link>
        </li>
        <li @click="close()" class="burger-menu__item">
            <router-link :to="{name: 'leaderboard'}">Таблиця лідерів</router-link>
        </li>
        <li @click="close()" class="burger-menu__item">
            <router-link :to="{name: 'support-project'}">Підтримка проєкту</router-link>
        </li>
        <li v-if="userStore.isLoggedIn" @click="close()" class="burger-menu__item">
          <router-link :to="{ name: 'profile' }">Особистий кабінет</router-link>
        </li>
        <li v-else class="burger-menu__item" @click="loginRef?.showDia(), close()">
          <span>Вхід / Реєстрація</span>
        </li>
        <li @click="close()" class="burger-menu__item">
          <router-link :to="{ name: 'forum' }">Форум</router-link>
        </li>
        <li v-if="userStore.isLoggedIn" @click="userStore.logoutUser(), close()" class="burger-menu__item">
          <span>Вийти</span>
        </li>
      </ul>
    </nav>
  </div>
  <Login ref="loginRef" @openRegistration="registerRef?.showDia" @openRecoverPass="recoverRef?.showDia"/>
  <RecoverPass ref="recoverRef" @openLogin="loginRef?.showDia" @openRecoverPassCode="recoverPassCodeRef?.showDia"/>
  <RecoverPassCode ref="recoverPassCodeRef" />  
  <Register ref="registerRef" @openLogin="loginRef?.showDia" />
</template>

<style scoped lang="scss">
.burger-menu {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  display: none;

  @media (max-width: 768px) {
    display: block;
  }

  &__list {
    list-style: none;
    position: relative;
    z-index: 2;
  }

  &__item {
    background: rgba(93, 119, 144, 0.1);
    font-size: 137.5%; /* 22/16 */
    transition: all .3s;
    color: #fff;
    cursor: pointer;

    a,
    span {
      padding: 15px 30px;
      display: block;
      width: 100%;
      height: 100%;
    }

    &:hover {
      background: rgba(93, 119, 144, 0.2);
    }
  }
}

.burger-icon {
  position: relative;
  top: 20px;
  left: 20px;
  cursor: pointer;
  background: none;
  border: none;
  z-index: 1001;
}

.menu {
  position: absolute;
  top: 0;
  left: -100vw;
  background: linear-gradient(180deg, #16171b 20%, rgb(39, 50, 68) 100%);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100vw;
  height: 100vh;
  padding: 40px 20px;
  transition: all .3s;

  &.showed {
    left: 0;
  }
}

.server-state--floating {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 1001;
  margin-top: 0 !important;

  .server-state__content {
    width: auto;
    border-radius: 999px;
    padding: 8px 14px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
  }
}

.server-state {
  color: #fff;
  margin-bottom: 16px;
  margin-top: 24px;

  &__content {
    width: 100%;
    border-bottom-left-radius: 35px;
    border-top-left-radius: 35px;
    padding: 10px 20px;
    background: linear-gradient(87deg, #e26f0f 0%, rgba(217, 217, 217, 0) 100%), linear-gradient(270deg, #3d4c60 0%, rgba(0, 0, 0, 0) 100%);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
  }
}

.rhombus {
  position: absolute;
  z-index: 2;
  padding: 16px 22px;
  transform: rotate(45deg) translate(-8px, 2px);
  background: linear-gradient(225deg, #e26f0f 0%, rgba(217, 217, 217, 0) 100%), linear-gradient(45deg, #3d4c60 0%, rgba(21, 26, 33, 0.34) 65.59%, rgba(0, 0, 0, 0) 100%);

  span {
    display: block;
    transform: rotate(-45deg);
    font-weight: 700;
    line-height: 0;
  }
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;

  &.online {
    background-color: #16db65;
    animation: pulse-green 1.2s infinite;
  }

  &.offline {
    background-color: red;
    animation: pulse-red 1.2s infinite;
  }
}

.status-text {
  color: #fff;
  font-size: 87.5%; /* 14/16 */
  font-weight: 400;
}

@keyframes pulse-green {
  0% {
    box-shadow: 0 0 0 0 rgba(22, 219, 101, 0.7);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(22, 219, 101, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(22, 219, 101, 0);
  }
}

@keyframes pulse-red {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(255, 0, 0, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 0, 0, 0);
  }
}
</style>
