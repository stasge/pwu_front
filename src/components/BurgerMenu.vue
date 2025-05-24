<script setup lang="ts">
import { ref } from 'vue';
import Login from '@/components/modals/login.vue';
import Register from '@/components/modals/register.vue';
import { useUserStore } from '@/stores/userStore';
import RecoverPass from './modals/RecoverPass.vue';
import RecoverPassCode from './modals/RecoverPassCode.vue';

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
</script>

<template>
  <div class="burger-menu">
    <button @click="toggleMenu" class="burger-icon">
      <i v-if="!isMenuOpen" class="pi pi-bars text-6xl text-white"></i>
      <i v-else class="pi pi-times text-6xl text-white"></i>
    </button>

    <nav class="menu" :class="{showed: isMenuOpen}">
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
</style>
