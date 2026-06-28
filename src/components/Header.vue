<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import Login from '@/components/modals/login.vue';
import Register from '@/components/modals/register.vue';
import RecoverPass from '@/components/modals/RecoverPass.vue';
import RecoverPassCode from '@/components/modals/RecoverPassCode.vue';
import { useAsyncCallWrapper } from '@/composables/useAsyncCallWrapper';
import { fetchGet } from '@/utils/fetchApi';

const userStore = useUserStore()
const isBurgerOpen = ref(false)
const isToolsOpen = ref(false)
const toolsDropdownRef = ref<HTMLElement | null>(null)

const loginRef = ref<InstanceType<typeof Login> | null>(null)
const registerRef = ref<InstanceType<typeof Register> | null>(null)
const recoverRef = ref<InstanceType<typeof RecoverPass> | null>(null)
const recoverPassCodeRef = ref<InstanceType<typeof RecoverPassCode> | null>(null)

const { wrapAsyncCall } = useAsyncCallWrapper()
const serverStatusCode = ref<{ online: boolean; count_online: number } | null>(null)
const accountsCount = ref<number | null>(null)

const isServerOnline = computed(() => {
    return !!(serverStatusCode.value?.online && serverStatusCode.value?.count_online)
})

function formatStatNumber(value: number): string {
    return new Intl.NumberFormat('uk-UA').format(value).replace(/\u00a0/g, ' ')
}

const formattedAccountsCount = computed(() => {
    return accountsCount.value != null ? formatStatNumber(accountsCount.value) : '—'
})

const formattedOnlineCount = computed(() => {
    if (!serverStatusCode.value) return '—'
    if (isServerOnline.value) return formatStatNumber(serverStatusCode.value!.count_online)
    return 0
})

onMounted(async () => {
    await userStore.getOnline()
    await wrapAsyncCall(async () => {
        const { data } = await fetchGet('online')
        serverStatusCode.value = data
    })
    await wrapAsyncCall(async () => {
        const { data } = await fetchGet('allGameUsers')
        accountsCount.value = data
    })
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})

function toggleBurger() {
    isBurgerOpen.value = !isBurgerOpen.value
}

function toggleTools(event: MouseEvent) {
    event.stopPropagation()
    isToolsOpen.value = !isToolsOpen.value
}

function handleClickOutside(event: MouseEvent) {
    if (toolsDropdownRef.value && !toolsDropdownRef.value.contains(event.target as Node)) {
        isToolsOpen.value = false
    }
}
</script>

<template>
    <div class="header flex align-items-center justify-content-between">
        <div class="header-inner w-full">
        <div class="header-container flex align-items-center justify-content-between">
            <div class="header-left flex align-items-center">
                <router-link :to="{ name: 'home' }">
                    <img class="header-left__logo" src="@/assets/images/header-logo.png" alt="header-logo">
                </router-link>
                <nav class="header-menu">
                    <ul class="header-menu__list flex align-items-center">
                        <li class="header-menu__item">
                            <router-link :to="{ name: 'about-server' }">Про Сервер</router-link>
                        </li>
                        <li class="header-menu__item">
                            <router-link :to="{ name: 'leaderboard' }">Лідери</router-link>
                        </li>
                        <li class="header-menu__item">
                            <router-link :to="{ name: 'support-project' }">Підтримка проєкту</router-link>
                        </li>
                        <li class="header-menu__item">
                            <router-link :to="{ name: 'forum' }">Форум</router-link>
                        </li>
                        <li class="header-menu__item">
                            <a href="https://db.valor.in.ua/" target="_blank" rel="noopener noreferrer">База даних</a>
                        </li>
                        <li
                            ref="toolsDropdownRef"
                            class="header-menu__item header-menu__item--dropdown"
                            :class="{ 'header-menu__item--open': isToolsOpen }"
                        >
                            <button type="button" class="header-menu__dropdown-trigger flex align-items-center" @click="toggleTools">
                                <span>Інструменти</span>
                                <img
                                    src="@/assets/icons/dropdown-arrow.svg"
                                    alt=""
                                    class="header-menu__dropdown-arrow"
                                >
                            </button>
                            <Transition name="header-dropdown">
                                <div v-show="isToolsOpen" class="header-menu__dropdown">
                                    <router-link
                                        :to="{ name: 'tract-calc' }"
                                        class="header-menu__dropdown-item flex align-items-center"
                                        @click="isToolsOpen = false"
                                    >
                                        <img src="@/assets/icons/book-icon.svg" alt="" class="header-menu__dropdown-item-icon">
                                        <span>Калькулятор трактатів</span>
                                    </router-link>
                                </div>
                            </Transition>
                        </li>
                    </ul>
                </nav>
            </div>
            <div class="header-right flex align-items-center">
                <div class="header-right__stats flex align-items-center">
                    <div class="header-right__stat">
                        <span class="header-right__stat-label">Акаунтів</span>
                        <div class="header-right__stat-row flex align-items-center">
                            <img src="@/assets/icons/all-users-icon.svg" alt="accounts" class="header-right__stat-icon header-right__stat-icon--accounts">
                            <span class="header-right__stat-value">{{ formattedAccountsCount }}</span>
                        </div>
                    </div>
                    <div class="header-right__stat">
                        <span class="header-right__stat-label">Онлайн</span>
                        <div class="header-right__stat-row header-right__stat-row--online flex align-items-center">
                            <img
                                v-if="isServerOnline"
                                src="@/assets/icons/online-indicator.png"
                                alt="online indicator"
                                class="header-right__stat-icon header-right__stat-icon--online"
                            >
                            <img
                                v-else
                                src="@/assets/icons/offline-indicator.png"
                                alt="offline indicator"
                                class="header-right__stat-icon header-right__stat-icon--online"
                            >
                            <span class="header-right__stat-value" :class="{ 'header-right__stat-value--offline': !isServerOnline && serverStatusCode }">
                                {{ formattedOnlineCount }}
                            </span>
                        </div>
                    </div>
                </div>
                <svg class="header-right__separator" width="2" height="20" viewBox="0 0 2 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path opacity="0.3" d="M1 0V20" stroke="#F8F8F8" />
                </svg>
                <div class="social-media flex align-items-center">
                    
                    <a href="https://discord.gg/3Ma5DaMUzQ" target="_blank" rel="noopener noreferrer">
                        <img src="@/assets/images/discord-icon.svg" alt="discord">
                    </a>
                    <a href="https://t.me/+ezWwek1xldA3NzA6" target="_blank" rel="noopener noreferrer">
                        <img src="@/assets/images/telegram-icon.svg" alt="telegram">
                    </a>
                </div>
                <svg class="header-right__separator" width="2" height="20" viewBox="0 0 2 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path opacity="0.3" d="M1 0V20" stroke="#F8F8F8" />
                </svg>
                <div class="header-right__login flex align-items-center">
                    <template v-if="!userStore.isLoggedIn">
                        <a @click="loginRef?.showDia()" class="header-right__auth flex align-items-center gap-3 cursor-pointer">
                            <span class="header-right__auth-icon">
                                <img src="@/assets/icons/login-icon.svg" alt="login">
                            </span>
                        </a>
                    </template>
                    <template v-else>
                        <router-link :to="{ name: 'profile' }" class="header-right__auth flex align-items-center gap-3">
                            <span class="header-right__auth-icon">
                                <img src="@/assets/icons/profile-icon.svg" alt="profile">
                            </span>
                        </router-link>
                    </template>
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
                        <router-link :to="{ name: 'about-server' }" @click="isBurgerOpen = false">Про Сервер</router-link>
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
                        <a href="https://db.valor.in.ua/" target="_blank" rel="noopener noreferrer">База даних</a>
                        <img src="@/assets/images/burger-menu-divider.svg" alt="divider" class="header-burger-divider">
                    </li>
                    <li class="header-burger-item">
                        <router-link :to="{ name: 'tract-calc' }" @click="isBurgerOpen = false">Калькулятор трактатів</router-link>
                        <img src="@/assets/images/burger-menu-divider.svg" alt="divider" class="header-burger-divider">
                    </li>
                    <li class="header-burger-item">
                        <template v-if="!userStore.isLoggedIn">
                            <span @click="loginRef?.showDia(), isBurgerOpen = false" class="cursor-pointer">Вхід / Реєстрація</span>
                        </template>
                        <template v-else>
                            <router-link :to="{ name: 'profile' }" @click="isBurgerOpen = false" class="header-burger-profile flex align-items-center gap-2">
                                <span>Особистий кабінет</span>
                                <img src="@/assets/images/arrow-next.svg" alt="arrow" class="header-burger-profile-arrow">
                            </router-link>
                        </template>
                    </li>
                    <li class="header-burger-item flex flex-row align-items-center justify-content-center gap-5">
                        <a href="https://discord.gg/3Ma5DaMUzQ" target="_blank" rel="noopener noreferrer" @click="isBurgerOpen = false">
                            <img width="40" src="@/assets/images/discord-icon.svg" alt="discord">
                        </a>
                        <a href="https://t.me/+ezWwek1xldA3NzA6" target="_blank" rel="noopener noreferrer" @click="isBurgerOpen = false">
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
            max-width: clamp(80px, 6vw, 112px);
        }
    }

    &-menu {
        margin-left: clamp(1px, 2vw, 30px);

        @media (max-width: 768px) {
            display: none;
        }

        &__list {
            list-style: none;
            display: flex;
            gap: clamp(10px, 2vw, 30px);

            @media (max-width: 1024px) {
                gap: 5px;
            }
        }

        &__item {
            width: fit-content;
            transition: all 0.3s ease;
            opacity: 1;

            &:hover {
                opacity: 0.7;
            }

            &--dropdown {
                position: relative;

                &:hover {
                    opacity: 1;
                }

                &.header-menu__item--open .header-menu__dropdown-trigger {
                    opacity: 0.7;
                }
            }
        }

        &__dropdown-trigger {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 0;
            border: none;
            background: none;
            color: inherit;
            font: inherit;
            cursor: pointer;
            transition: opacity 0.3s ease;

            &:hover {
                opacity: 0.7;
            }
        }

        &__dropdown-arrow {
            width: 12px;
            height: 12px;
            flex-shrink: 0;
            transition: transform 0.3s ease;
            transform: rotate(180deg);
        }

        &__item--open &__dropdown-arrow {
            transform: rotate(0deg);
        }

        &__dropdown {
            position: absolute;
            top: calc(100% + 12px);
            left: 0;
            z-index: 110;
            display: flex;
            flex-direction: column;
            justify-content: center;
            width: fit-content;
            height: 85px;
            padding: 15px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            backdrop-filter: blur(70px);
            -webkit-backdrop-filter: blur(70px);
            background:
                linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)),
                rgba(0, 0, 0, 0.8);
            transform-origin: top center;
        }

        &__dropdown-item {
            gap: 10px;
            color: #f8f8f8;
            text-decoration: none;
            font-size: 14px;
            line-height: 1.2;
            transition: opacity 0.3s ease;
            white-space: nowrap;

            &:hover {
                opacity: 0.7;
            }

            &-icon {
                width: 18px;
                height: 15px;
                flex-shrink: 0;
            }
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
        gap: clamp(8px, 2vw, 25px);

        @media (max-width: 1024px) {
            gap: 8px;
        }

        &__stats {
            gap: clamp(25px, 2vw, 45px);
        }

        &__stat {
            display: flex;
            flex-direction: column;
            align-items: center;

            &-label {
                font-family: "VollkornSC", sans-serif;
                font-weight: 400;
                font-size: clamp(10px, 1.2vw, 12px);
                line-height: 1;
                letter-spacing: -0.04em;
                color: rgba(248, 248, 248, 0.7);
                white-space: nowrap;
            }

            &-row {
                display: inline-flex;
                align-items: center;
                gap: clamp(4px, 0.8vw, 8px);

                &--online {
                    position: relative;
                    gap: 0;
                }
            }

            &-icon {
                flex-shrink: 0;

                &--accounts {
                    width: clamp(14px, 1.5vw, 20px);
                    height: clamp(14px, 1.5vw, 20px);
                }

                &--online, &--offline {
                    position: absolute;
                    right: calc(100% + clamp(8px, 2vw, 13px));
                    top: 50%;
                    transform: translate(50%, -50%);
                    width: clamp(40px, 5vw, 60px);
                    height: clamp(40px, 5vw, 60px);
                }
            }

            &-value {
                font-family: "VollkornSC", sans-serif;
                font-weight: 400;
                font-size: clamp(14px, 2vw, 24px);
                letter-spacing: -0.04em;
                color: #f8f8f8;
                white-space: nowrap;
                line-height: 1;
            }
        }

        .social-media {
            gap: clamp(10px, 1vw, 25px);
            
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

            @media (max-width: 1024px) {
                gap: 5px;
            }

            @media (max-width: 768px) {
                display: none !important;
            }
        }

        &__auth {
            cursor: pointer;
            transition: all 0.3s ease;
            opacity: 1;
            text-decoration: none;
            background: rgba(248, 248, 248, 0.1);
            border-radius: 99px;

            @media (max-width: 1024px) {
                gap: 5px !important;
            }

            &:hover {
                opacity: 0.7;
            }

            &-icon {
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                width: clamp(28px, 3vw, 32px);
                height: clamp(28px, 3vw, 32px);

                img {
                    width: clamp(18px, 2vw, 20px);
                    height: clamp(18px, 2vw, 20px);
                    object-fit: contain;
                }
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
            font-size: 18px;
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

.header-dropdown-enter-active,
.header-dropdown-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.header-dropdown-enter-from,
.header-dropdown-leave-to {
    opacity: 0;
    transform: translateY(-8px) scale(0.98);
}

.header-dropdown-enter-to,
.header-dropdown-leave-from {
    opacity: 1;
    transform: translateY(0) scale(1);
}


</style>