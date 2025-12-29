<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import Login from '@/components/modals/login.vue';
import Register from '@/components/modals/register.vue';
import RecoverPass from '@/components/modals/RecoverPass.vue';
import RecoverPassCode from '@/components/modals/RecoverPassCode.vue';
import { useAsyncCallWrapper } from '@/composables/useAsyncCallWrapper';
import { fetchGet } from '@/utils/fetchApi';

const userStore = useUserStore()
const router = useRouter()
const isBurgerOpen = ref(false)
const isScrolled = ref(false)

const loginRef = ref<InstanceType<typeof Login> | null>(null)
const registerRef = ref<InstanceType<typeof Register> | null>(null)
const recoverRef = ref<InstanceType<typeof RecoverPass> | null>(null)
const recoverPassCodeRef = ref<InstanceType<typeof RecoverPassCode> | null>(null)

const { wrapAsyncCall } = useAsyncCallWrapper()
const serverStatusCode = ref<{ online: boolean; count_online: number } | null>(null)

const handleScroll = () => {
    isScrolled.value = window.scrollY > 10
}

onMounted(async () => {
    await userStore.getOnline()
    await wrapAsyncCall(async () => {
        const { data } = await fetchGet('online')
        serverStatusCode.value = data
    })
    window.addEventListener('scroll', handleScroll)
    handleScroll() // Check initial scroll position
})

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
})

function toggleBurger() {
    isBurgerOpen.value = !isBurgerOpen.value
}

function goBack() {
    router.back()
}
</script>

<template>
    <div class="forum-header flex align-items-center justify-content-between" :class="{ 'forum-header--scrolled': isScrolled }">
        <div class="forum-header-inner w-full">
        <div class="forum-header-container flex align-items-center justify-content-between">
            <div class="forum-header-left flex align-items-center">
                <a @click.prevent="goBack" class="forum-header-left__arrow cursor-pointer">
                    <img src="@/assets/images/arrow-prev.svg" alt="arrow prev">
                </a>
                <a href="/" class="forum-header-left__logo cursor-pointer">
                    <img src="@/assets/images/forum-logo.png" alt="forum-logo">
                </a>
            </div>
            <div class="forum-header-right flex align-items-center">
                <div class="forum-header-right__online flex align-items-center gap-1">
                    <img v-if="serverStatusCode && serverStatusCode.online && serverStatusCode.count_online" src="@/assets/images/online-indicator.svg" alt="online indicator">
                    <img v-else src="@/assets/images/offline-indicator.svg" alt="offline indicator">
                    <div class="forum-header-right__online-content flex align-items-center gap-1">
                        <span v-if="serverStatusCode && serverStatusCode.online && serverStatusCode.count_online">Онлайн:</span>
                        <span v-else>Офлайн</span>
                        <span v-if="serverStatusCode && serverStatusCode.online && serverStatusCode.count_online">{{ serverStatusCode?.count_online }}</span>
                        <span v-if="serverStatusCode && serverStatusCode.online && serverStatusCode.count_online" class="forum-header-right__online-content-players">гравців</span>
                    </div>
                </div>
                <svg class="forum-header-right__separator" width="2" height="20" viewBox="0 0 2 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path opacity="0.3" d="M1 0V20" stroke="#F8F8F8" />
                </svg>
                <div class="social-media flex align-items-center gap-4">
                    
                    <a href="https://discord.gg/3Ma5DaMUzQ" target="_blank" rel="noopener noreferrer">
                        <img src="@/assets/images/discord-icon.svg" alt="discord">
                    </a>
                    <a href="https://t.me/valor_pw" target="_blank" rel="noopener noreferrer">
                        <img src="@/assets/images/telegram-icon.svg" alt="telegram">
                    </a>
                </div>
                <svg class="forum-header-right__separator" width="2" height="20" viewBox="0 0 2 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path opacity="0.3" d="M1 0V20" stroke="#F8F8F8" />
                </svg>
                <div class="forum-header-right__login flex align-items-center">
                    <template v-if="!userStore.isLoggedIn">
                        <a @click="loginRef?.showDia()" class="cursor-pointer">Увійти</a>
                    </template>
                    <template v-else>
                        <router-link :to="{ name: 'profile' }" class="forum-header-right__profile flex align-items-center gap-3">
                            <span>Особистий кабінет</span>
                            <img src="@/assets/images/arrow-next.svg" alt="arrow" class="forum-header-right__profile-arrow">
                        </router-link>
                    </template>
                </div>
                <button @click="toggleBurger" class="forum-header-burger">
                    <img src="@/assets/images/burger-icon.svg" alt="menu" class="forum-header-burger-icon" :class="{ 'forum-header-burger-icon--hidden': isBurgerOpen }">
                    <img src="@/assets/images/burger-icon-close.svg" alt="close" class="forum-header-burger-icon forum-header-burger-icon--close" :class="{ 'forum-header-burger-icon--visible': isBurgerOpen }">
                </button>
            </div>
        </div>
        </div>
        
        <!-- Burger Menu Content -->
        <div class="forum-header-burger-content" :class="{ 'forum-header-burger-content--open': isBurgerOpen }">
            <div class="forum-header-burger-menu">
                <ul class="forum-header-burger-list">
                    <li class="forum-header-burger-item">
                        <router-link :to="{ name: 'about-server' }" @click="isBurgerOpen = false">Про Сервер</router-link>
                        <img src="@/assets/images/burger-menu-divider.svg" alt="divider" class="forum-header-burger-divider">
                    </li>
                    <li class="forum-header-burger-item">
                        <router-link :to="{ name: 'leaderboard' }" @click="isBurgerOpen = false">Таблиця Лідерів</router-link>
                        <img src="@/assets/images/burger-menu-divider.svg" alt="divider" class="forum-header-burger-divider">
                    </li>
                    <li class="forum-header-burger-item">
                        <router-link :to="{ name: 'support-project' }" @click="isBurgerOpen = false">Підтримка Проєкту</router-link>
                        <img src="@/assets/images/burger-menu-divider.svg" alt="divider" class="forum-header-burger-divider">
                    </li>
                    <li class="forum-header-burger-item">
                        <router-link :to="{ name: 'forum' }" @click="isBurgerOpen = false">Форум</router-link>
                        <img src="@/assets/images/burger-menu-divider.svg" alt="divider" class="forum-header-burger-divider">
                    </li>
                    <li class="forum-header-burger-item">
                        <a href="https://db.valor.in.ua/" target="_blank" rel="noopener noreferrer">База даних</a>
                        <img src="@/assets/images/burger-menu-divider.svg" alt="divider" class="forum-header-burger-divider">
                    </li>
                    <li class="forum-header-burger-item">
                        <template v-if="!userStore.isLoggedIn">
                            <span @click="loginRef?.showDia(), isBurgerOpen = false" class="cursor-pointer">Вхід / Реєстрація</span>
                        </template>
                        <template v-else>
                            <router-link :to="{ name: 'profile' }" @click="isBurgerOpen = false" class="forum-header-burger-profile flex align-items-center gap-2">
                                <span>Особистий кабінет</span>
                                <img src="@/assets/images/arrow-next.svg" alt="arrow" class="forum-header-burger-profile-arrow">
                            </router-link>
                        </template>
                    </li>
                    <li class="forum-header-burger-item flex flex-row align-items-center justify-content-center gap-5">
                        <a href="https://discord.gg/3Ma5DaMUzQ" target="_blank" rel="noopener noreferrer" @click="isBurgerOpen = false">
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
.forum-header {
    background: transparent;
    width: 100%;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 100;
    color: #f8f8f8;
    transition: all 0.3s ease;
    
    &--scrolled {
        background: rgba(10, 10, 10, 0.85);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        padding-bottom: 20px;
    }
    
    &-inner {
        padding: 20px clamp(10px, 2vw, 50px) 0 clamp(10px, 2vw, 50px);
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

        &__arrow {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 42px;
            height: 42px;
            border-radius: 50%;
            background: rgba(60, 60, 60, 0.8);
            transition: all 0.3s ease;
            cursor: pointer;

            @media (max-width: 768px) {
                width: 25px;
                height: 25px;
            }

            &:hover {
                background: rgba(80, 80, 80, 0.9);
            }

            img {
                width: 20px;
                height: 20px;

                @media (max-width: 768px) {
                    width: 15px;
                    height: 15px;
                }
            }
        }

        &__logo {
            max-width: clamp(120px, 20vw, 192px);
        }
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
                transition: all 0.3s ease;
                opacity: 1;

                &:hover {
                    opacity: 0.7;
                }
            }

            img {
                max-height: clamp(10px, 2vw, 20px);
            }
        }

        &__login {
            gap: 30px;
            
            a {
                cursor: pointer;
                transition: all 0.3s ease;
                opacity: 1;

                &:hover {
                    opacity: 0.7;
                }
            }
            
            @media (max-width: 1024px) {
                gap: 5px;
            }

            @media (max-width: 768px) {
                display: none !important;
            }
        }

        &__profile {
            transition: all 0.3s ease;
            opacity: 1;

            @media (max-width: 1024px) {
                gap: 5px !important;
            }

            span {
                font-weight: 400;
                font-size: 14px;
                line-height: 100%;
                letter-spacing: -0.09em;
                text-align: center;
                background: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%);
                background-clip: text;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;

                @media (max-width: 1024px) {
                    font-size: 10px;
                }
            }

            img {
                width: 18px;
                height: auto;

                @media (max-width: 1024px) {
                    width: 10px;
                }
            }

            &:hover {
                opacity: 0.7;
            }

            &-arrow {
                width: 20px;
                height: auto;
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

            &.forum-header-burger-icon--visible {
                opacity: 1;
            }
        }
    }

    &-burger-content {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: url('@/assets/images/forum-bg.jpg') no-repeat center / cover;
        background-attachment: fixed;
        background-position-y: -100px;
        height: 0;
        transition: 0.3s ease-out;
        z-index: 1001;
        overflow: hidden;

        @media (max-width: 1024px) {
            background-position-y: -90px;
        }

        @media (max-width: 768px) {
            background-position-y: -80px;
        }

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

    &-burger-profile {
        color: #f8f8f8;
        text-decoration: none;
        font-size: 24px;
        text-align: center;
        transition: all 0.3s ease;
        opacity: 1;

        &:hover {
            opacity: 0.7;
        }

        &-arrow {
            width: 24px;
            height: auto;
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

