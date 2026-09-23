<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import { onMounted, ref } from 'vue';
import TopDonators from '@/components/TopDonators.vue';
import RegisterModal from '@/components/modals/register.vue';
import LoginModal from '@/components/modals/login.vue';
import RecoverPass from '@/components/modals/RecoverPass.vue';
import RecoverPassCode from '@/components/modals/RecoverPassCode.vue';
import { useRouter } from 'vue-router';
import LumaVideo from '@/components/base/LumaVideo.vue';
import fireballVideo from '@/assets/video/Fireball.webm';

const userStore = useUserStore()
const router = useRouter()
const registerModal = ref()
const loginModal = ref()
const recoverModal = ref()
const recoverCodeModal = ref()

onMounted(() => {
    userStore.getOnline()
})

const handleRegister = () => {
    registerModal.value?.showDia()
}

const handleDownload = () => {
    router.push({ name: 'download-page' })
}

</script>
<template>
    <div class="hero">
        <video class="hero__video" autoplay muted loop playsinline>
            <source src="@/assets/video/Hero_BG_New_Smoke_Fix_compressed.webm" type="video/webm">
        </video>
        <div class="hero__content flex align-items-center justify-content-between">
            <div class="hero__content-left w-full">

            </div>
            <div class="hero__content-right w-full">
                <div class="hero__content-right-logo-container">
                    <svg width="0" height="0" style="position: absolute">
                        <filter id="hero-black-to-alpha" color-interpolation-filters="sRGB">
                            <feColorMatrix type="matrix"
                                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  1.2 1.2 1.2 0 0" />
                        </filter>
                    </svg>
                    <LumaVideo class="hero__content-right-logo-video" :src="fireballVideo" type="video/webm" />
                    <img class="hero__content-right-logo" src="@/assets/images/hero-logo.png" alt="hero right">
                </div>
                <h1 class="hero__content-right-title">
                    Сервер,
                    <br>
                    Якого Ти Чекав!
                </h1>
                <TopDonators />
                <div class="hero__content-right-buttons">
                    <button class="fantasy-btn" @click="handleRegister"><span>Реєстрація</span></button>
                    <button class="fantasy-btn" @click="handleDownload">
                        <span>Завантажити </span>
                        <span class="client-text">Клієнт</span>
                    </button>
                </div>
            </div>
        </div>
        <img src="@/assets/images/hero-mask.png" class="hero__mask" alt="hero mask">
        <RegisterModal ref="registerModal" @openLogin="loginModal?.showDia()" />
        <LoginModal ref="loginModal" @openRegistration="registerModal?.showDia()"
            @openRecoverPass="recoverModal?.showDia()" />
        <RecoverPass ref="recoverModal" @openLogin="loginModal?.showDia()"
            @openRecoverPassCode="recoverCodeModal?.showDia()" />
        <RecoverPassCode ref="recoverCodeModal" />
    </div>
</template>
<style scoped lang="scss">
.hero {
    position: relative;
    width: 100%;
    height: calc(100vh - 54px);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    margin-top: 88px;

    @media (max-width: 1024px) {
        margin-top: 50px;
    }

    @media (max-width: 768px) {
        height: 100%;
    }

    @media (max-height: 768px) {
        height: 100%;
    }

    &__video {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: right center;
        z-index: 1;
    }

    &__content {
        position: relative;
        z-index: 5;
        color: white;
        text-align: center;
        width: 100%;
        height: 100%;

        @media (max-width: 768px) {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            margin-top: 88px;
        }
        @media (max-height: 768px) {
            margin-top: 88px;
        }

        &-right {
            &-logo-container {
                position: relative;
                display: inline-block;
                width: clamp(170px, 20vw, 274px);
            }

            /* фоновий статичний логотип (нормальний режим) */
            &-logo {
                position: relative;
                width: 100%;
                height: auto;
                z-index: 2;
            }

            /* вогонь у кільці дракона зліва від VALOR; чорний фон -> прозорість через svg-фільтр
               (screen тут не працює: .hero__content має власний z-index і не бачить фон) */
            &-logo-video {
                position: absolute;
                inset: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
                z-index: 1;
                pointer-events: none;
                filter: contrast(1.6) brightness(1.2) url(#hero-black-to-alpha);

                /* мобільні: альфу вже порахував LumaVideo у canvas */
                &.luma-canvas {
                    filter: contrast(1.6) brightness(1.2);
                }
            }

            &-buttons {
                @media (max-width: 768px) {
                    flex-direction: column;
                }
            }
        }
    }

    &__mask {
        position: absolute;
        bottom: -1px;
        left: -1px;
        width: 100%;
        height: 197px;
        z-index: 3;
    }

    &__content-right {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;

        @media (max-width: 768px) {
            height: auto;
            gap: 20px;
        }

        &-title {
            font-size: 52px;
            font-weight: 400;
            color: #f8f8f8;
            line-height: 100%;
            letter-spacing: -0.07em;
            text-align: center;

            @media (max-width: 768px) {
                font-size: 36px;
            }
        }

        &-buttons {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: center;
            gap: 10px 50px;
            margin-right: 20px;

            @media (max-width: 768px) {
                margin-right: 0;
            }
        }
    }
}
</style>