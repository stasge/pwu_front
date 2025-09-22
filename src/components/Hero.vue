<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import { onMounted, ref } from 'vue';
import TopDonators from '@/components/TopDonators.vue';
import RegisterModal from '@/components/modals/register.vue';
import { useRouter } from 'vue-router';

const userStore = useUserStore()
const router = useRouter()
const registerModal = ref()

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
        <video 
            class="hero__video" 
            autoplay 
            muted 
            loop 
            playsinline
        >
            <source src="@/assets/video/Hero_BG_New_Smoke_Fix_compressed.webm" type="video/webm">
        </video>
        <div class="hero__content flex align-items-center justify-content-between">
            <div class="hero__content-left w-full">
                
            </div>
            <div class="hero__content-right w-full">
                <div class="hero__content-right-logo-container">
                    <video 
                        class="hero__content-right-logo-video" 
                        autoplay 
                        muted 
                        loop 
                        playsinline
                    >
                        <source src="@/assets/video/Fireball.webm" type="video/webm">
                    </video>
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
        <RegisterModal ref="registerModal" />
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
        height: calc(90vh - 54px);
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

        @media (max-width: 768px) {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
        }

        &-right {
            &-logo-container {
  position: relative;
  display: inline-block;
  width: clamp(170px, 20vw, 274px);
  isolation: isolate;
}

/* фоновий статичний логотип (нормальний режим) */
&-logo {
  position: relative;
  width: 100%;
  height: auto;
  z-index: 1;
}

/* відео зверху, обрізане маскою логотипа */
&-logo-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 2;
  pointer-events: none;
  mix-blend-mode: screen;

  /* маска з PNG-лого (має бути з прозорістю) */
  -webkit-mask-image: url('@/assets/images/hero-logo.png');
  mask-image: url('@/assets/images/hero-logo.png');
  -webkit-mask-size: contain;
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;

  filter: contrast(1.6) brightness(1.2);
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
        &-title {
            font-size: 52px;
            font-weight: 400;
            color: #f8f8f8;
            line-height: 100%;
            letter-spacing: -0.07em;
            text-align: center;
            margin-top: clamp(20px, 3vw, 50px);

            @media (max-width: 768px) {
                font-size: 36px;
            }
        }
        &-online {
            font-size: 24px;
            font-weight: 400;
            color: #f8f8f8;
            line-height: 100%;
            margin-top: 50px;
            &-count {
                font-size: 36px;
                font-weight: 600;
            }
        }
        &-buttons {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: center;
            gap: 10px 50px;
            margin-top: clamp(0px, 3vw, 20px);
            margin-right: 20px;

          
        }
    }
}
</style>