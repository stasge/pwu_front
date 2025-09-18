<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import { onMounted, ref } from 'vue';
import Login from '@/components/modals/login.vue';
import Register from '@/components/modals/register.vue';
import RecoverPass from '@/components/modals/RecoverPass.vue';
import RecoverPassCode from '@/components/modals/RecoverPassCode.vue';
import { useAsyncCallWrapper } from '@/composables/useAsyncCallWrapper';
import { fetchGet } from '@/utils/fetchApi';

const userStore = useUserStore()
const isBurgerOpen = ref(false)

const loginRef = ref<InstanceType<typeof Login> | null>(null)
const registerRef = ref<InstanceType<typeof Register> | null>(null)
const recoverRef = ref<InstanceType<typeof RecoverPass> | null>(null)
const recoverPassCodeRef = ref<InstanceType<typeof RecoverPassCode> | null>(null)

const { wrapAsyncCall } = useAsyncCallWrapper()
const serverStatusCode = ref<{ online: boolean; count_online: number } | null>(null)

onMounted(async () => {
    await userStore.getOnline()
    await wrapAsyncCall(async () => {
        const { data } = await fetchGet('online')
        serverStatusCode.value = data
    })
})

function toggleBurger() {
    isBurgerOpen.value = !isBurgerOpen.value
}
</script>

<template>
    <div class="header flex align-items-center justify-content-between">
        <div class="header-inner w-full">
        <div class="header-container flex align-items-center justify-content-between">
            <div class="header-left flex align-items-center">
                <img class="header-left__logo" src="@/assets/images/header-logo.png" alt="header-logo">
                <nav class="header-menu">
                    <ul class="header-menu__list flex align-items-center">
                        <li class="header-menu__item">
                            <router-link :to="{ name: 'separate-theme', params: { theme_id: 2, cat_id: 1 } }">Про Сервер</router-link>
                        </li>
                        <li class="header-menu__item">
                            <router-link :to="{ name: 'leaderboard' }">Таблиця Лідерів</router-link>
                        </li>
                        <li class="header-menu__item">
                            <router-link :to="{ name: 'support-project' }">Підтримка Проєкту</router-link>
                        </li>
                        <li class="header-menu__item">
                            <router-link :to="{ name: 'forum' }">Форум</router-link>
                        </li>
                    </ul>
                </nav>
            </div>
            <div class="header-right flex align-items-center">
                <div class="header-right__online flex align-items-center gap-1">
                    <img v-if="serverStatusCode && serverStatusCode.online" src="@/assets/images/online-indicator.svg" alt="online indicator">
                    <img v-else src="@/assets/images/offline-indicator.svg" alt="offline indicator">
                    <div class="header-right__online-content flex align-items-center gap-1">
                        <span v-if="serverStatusCode && serverStatusCode.online">Онлайн:</span>
                        <span v-else>Офлайн</span>
                        <span v-if="serverStatusCode && serverStatusCode.online">{{ serverStatusCode?.count_online }}</span>
                        <span v-if="serverStatusCode && serverStatusCode.online" class="header-right__online-content-players">гравців</span>
                    </div>
                </div>
                <svg class="header-right__separator" width="2" height="20" viewBox="0 0 2 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path opacity="0.3" d="M1 0V20" stroke="#F8F8F8" />
                </svg>
                <div class="social-media flex align-items-center gap-4">
                    
                    <a href="https://discord.gg/zPKh4BUskKX" target="_blank" rel="noopener noreferrer">
                        <img src="@/assets/images/discord-icon.svg" alt="discord">
                    </a>
                    <a href="https://t.me/valor_pw" target="_blank" rel="noopener noreferrer">
                        <img src="@/assets/images/telegram-icon.svg" alt="telegram">
                    </a>
                </div>
                <svg class="header-right__separator" width="2" height="20" viewBox="0 0 2 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path opacity="0.3" d="M1 0V20" stroke="#F8F8F8" />
                </svg>
                <div class="header-right__login flex align-items-center">
                    <a @click="loginRef?.showDia()" class="cursor-pointer">Увійти</a>
                    <a @click="registerRef?.showDia()" class="cursor-pointer">Реєстрація</a>
                </div>
                <button @click="toggleBurger" class="header-burger">
                    <img src="@/assets/images/burger-icon.svg" alt="menu" class="header-burger-icon" :class="{ 'header-burger-icon--hidden': isBurgerOpen }">
                    <img src="@/assets/images/burger-icon-close.svg" alt="close" class="header-burger-icon header-burger-icon--close" :class="{ 'header-burger-icon--visible': isBurgerOpen }">
                </button>
            </div>
        </div>
            <img class="header-mask" src="@/assets/images/header-mask.png" alt="header-bg">
        </div>
        
        <!-- Burger Menu Content -->
        <div class="header-burger-content" :class="{ 'header-burger-content--open': isBurgerOpen }">
            <div class="header-burger-menu">
                <ul class="header-burger-list">
                    <li class="header-burger-item">
                        <router-link :to="{ name: 'separate-theme', params: { theme_id: 2, cat_id: 1 } }" @click="isBurgerOpen = false">Про Сервер</router-link>
                        <img src="@/assets/images/burger-menu-divider.svg" alt="divider" class="header-burger-divider">
                    </li>
                    <li class="header-burger-item">
                        <router-link :to="{ name: 'leaderboard' }" @click="isBurgerOpen = false">Таблиця Лідерів</router-link>
                        <img src="@/assets/images/burger-menu-divider.svg" alt="divider" class="header-burger-divider">
                    </li>
                    <li class="header-burger-item">
                        <router-link :to="{ name: 'support-project' }" @click="isBurgerOpen = false">Підтримка Проєкту</router-link>
                        <img src="@/assets/images/burger-menu-divider.svg" alt="divider" class="header-burger-divider">
                    </li>
                    <li class="header-burger-item">
                        <router-link :to="{ name: 'forum' }" @click="isBurgerOpen = false">Форум</router-link>
                        <img src="@/assets/images/burger-menu-divider.svg" alt="divider" class="header-burger-divider">
                    </li>
                    <li class="header-burger-item">
                        <span @click="loginRef?.showDia(), isBurgerOpen = false" class="cursor-pointer">Вхід / Реєстрація</span>
                        <img src="@/assets/images/burger-menu-divider.svg" alt="divider" class="header-burger-divider">
                    </li>
                    <li class="header-burger-item flex flex-row align-items-center justify-content-center gap-5">
                        <a href="https://discord.gg/zPKh4BUskKX" target="_blank" rel="noopener noreferrer" @click="isBurgerOpen = false">
                            <img width="40" src="@/assets/images/discord-icon.svg" alt="discord">
                        </a>
                        <a href="https://t.me/valor_pw" target="_blank" rel="noopener noreferrer" @click="isBurgerOpen = false">
                            <img width="35" src="@/assets/images/telegram-icon.svg" alt="telegram">
                        </a>
                    </li>
                </ul>
            </div>
            
        </div>
    </div>
    
    <!-- Modal Components -->
    <Login ref="loginRef" @openRegistration="registerRef?.showDia" @openRecoverPass="recoverRef?.showDia"/>
    <Register ref="registerRef" @openLogin="loginRef?.showDia" />
    <RecoverPass ref="recoverRef" @openLogin="loginRef?.showDia" @openRecoverPassCode="recoverPassCodeRef?.showDia"/>
    <RecoverPassCode ref="recoverPassCodeRef" />
</template>

<style scoped lang="scss">
.header {
    background: #0a0a0a;
    width: 100%;
    position: relative;
    z-index: 100;
    color: #f8f8f8;
    position: fixed;
    
    
    &-inner {
        padding: 30px clamp(10px, 2vw, 50px) 0 clamp(10px, 2vw, 50px);
        position: relative;

        @media (max-width: 1024px) {
            padding: 20px 8px 10px 8px;
        }

        @media (max-width: 768px) {
            padding: 20px 20px 10px 20px;
        }
    }

    &-container {
        max-width: 1390px;
        width: 100%;
        margin: 0 auto;
        position: relative;
        z-index: 101;
        gap: clamp(5px, 1vw, 30px);
    }
    
    &-left {
        gap: clamp(5px, 1vw, 30px);

        &__logo {
            max-width: clamp(80px, 1vw, 112px);
        }
    }

    &-menu {

        @media (max-width: 768px) {
            display: none;
        }

        &__list {
            list-style: none;
            display: flex;
            gap: clamp(5px, 3vw, 30px);

            @media (max-width: 1024px) {
                gap: 5px;
            }
        }

        &__item {
            width: fit-content;
        }
    }

    &-mask {
        position: absolute;
        top: 95%;
        left: 0;
        width: 100%;
        height: clamp(50px, 6vw, 113px);
    }

    &-right {
        gap: clamp(8px, 2vw, 30px);

        @media (max-width: 1024px) {
            gap: 8px;
        }

        &__online {
            font-weight: 400;
            font-size: clamp(10px, 4vw, 14px);
            line-height: 108%;
            text-align: center;
            color: #f8f8f8;

            @media (max-width: 1024px) {
                font-size: 12px;
            }
            @media (max-width: 768px) {
                line-height: 1;
            }

            img {
                max-height: clamp(30px, 4vw, 58px);
                position: relative;
                left: clamp(5px, 4vw, 15px);

                @media (max-width: 1024px) {
                    max-height: 30px;
                    left: 10px;
                }
            }
            
        }

        .social-media {
            
            a {
                max-height: clamp(15px, 2vw, 20px);
            }

            img {
                max-height: clamp(15px, 2vw, 20px);
            }
        }

        &__login {
            gap: 30px;
            
            a {
                cursor: pointer;
            }
            
            @media (max-width: 1024px) {
                gap: 5px;
            }

            @media (max-width: 768px) {
                display: none !important;
            }
        }

        &__online-content-players {
            @media (max-width: 768px) {
                display: none;
            }
        }

        &__separator {
            @media (max-width: 768px) {
                display: none;
            }
        }

        .social-media {
            @media (max-width: 768px) {
                display: none !important;
            }
        }
    }

    &-burger {
        display: none;
        background: none;
        border: none;
        cursor: pointer;
        padding: 8px;
        margin-left: 16px;
        z-index: 1002;
        position: relative;

        @media (max-width: 768px) {
            display: block;
        }
    }

    &-burger-icon {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        transition: opacity 0.3s ease;

        &--hidden {
            opacity: 0;
        }

        &--close {
            opacity: 0;

            &.header-burger-icon--visible {
                opacity: 1;
            }
        }
    }

    &-burger-content {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: #0a0a0a;
        height: 0;
        transition: 0.3s ease-out;
        z-index: 1001;
        overflow: hidden;

        &--open {
            height: 100vh;
        }
    }

    &-burger-menu {
        padding: 20px;
        display: flex;
        justify-content: center;
        position: relative;
        z-index: 2;
    }

    &-burger-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0;
        width: 100%;
        max-width: 400px;
    }

    &-burger-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        padding: 20px 0 0 0;

        a {
            color: #f8f8f8;
            text-decoration: none;
            font-size: 24px;
            text-align: center;
        }

        span {
            color: #f8f8f8;
            font-size: 24px;
            text-align: center;
        }
    }

    &-burger-divider {
        margin-top: 20px;
    }

    &-burger-background {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 40%;
        z-index: 0;
        overflow: hidden;
    }

    &-burger-bg-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: bottom;
        opacity: 0.3;
    }
}


</style>