<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import { onMounted } from 'vue';
import TopDonators from '@/components/TopDonators.vue';

const userStore = useUserStore()

onMounted(() => {
    userStore.getOnline()
})

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
            <source src="@/assets/video/Hero_Bg_Fin.webm" type="video/webm">
        </video>
        <div class="hero__content flex align-items-center justify-content-between">
            <div class="hero__content-left w-full">
                
            </div>
            <div class="hero__content-right w-full">
                <img src="@/assets/images/hero-logo.png" alt="hero right">
                <h1 class="hero__content-right-title">
                    Perfect World, 
                    <br>
                    Якого Ти Чекав!
                </h1>
                <TopDonators />
            </div>
        </div>
        <img src="@/assets/images/hero-mask.png" class="hero__mask" alt="hero mask">
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
        z-index: 2;
        color: white;
        text-align: center;
        width: 100%;
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
            margin-top: 50px;
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
    }
}
</style>