<script setup lang="ts">
import { ref } from 'vue';

const donators = ref([
    'Рома', 
    'PalpatinTOP',
    'Decim', 
    'POVEZLO', 
    'ECMA262', 
    'Mars',
    'Агамант', 
    'Magix', 
    'XipoMaHT',
    'AnalogowNET',
]);
</script>

<template>
    <div class="top-donators">
        <div class="top-donators__inner">
            <div class="top-donators__container relative">
                <h2 class="top-donators__title text-center">Легенди підтримки:</h2>
                <div class="top-donators__swiper">
                    <div class="donators-track">
                        <div class="donators-swiper" v-for="repeat in 3" :key="repeat">
                            <div v-for="(nick, idx) in donators" :key="`${repeat}-${idx}`" class="donator-slide">
                                <div class="donator-nick flex gap-2 align-items-center justify-content-center">
                                    <span :class="{ 'top-1-nick': idx === 0, 'top-2-nick': idx === 1, 'top-3-nick': idx === 2 }">{{ idx + 1 }}. {{ nick }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Kurale:ital,wght@0,400;1,400&display=swap');

.top-donators {
    position: relative;
    z-index: 2;
    max-width: 442px;
    margin: clamp(20px, 3vw, 50px) auto 0 auto;
    overflow: hidden;

    &__title {
        font-size: 24px;
        font-weight: 400;
        color: #f8f8f8;

        @media (max-width: 768px) {
            font-size: 18px;
        }
    }

    &__swiper {
        position: relative;
        width: 100%;
        height: 60px;
        overflow: hidden;
        -webkit-mask-image: linear-gradient(to right, transparent, black 20%, black 80%, transparent);
        -webkit-mask-repeat: no-repeat;
        -webkit-mask-size: 100% 100%;
        mask-image: linear-gradient(to right, transparent, black 20%, black 80%, transparent);
        mask-repeat: no-repeat;
        mask-size: 100% 100%;
    }

    .donators-track {
        display: flex;
        width: max-content;
        animation: scroll-donators 40s linear infinite;
    }

    .donators-swiper {
        display: flex;
        flex-shrink: 0;
    }

    .donator-slide {
        margin-right: 20px;
        flex-shrink: 0;
    }

    .donator-nick {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.3rem;
        font-weight: 400;
        color: #fff;
        padding: 10px;
        min-width: 100px;
        position: relative;
        white-space: nowrap;
        font-size: 20px;

        @media (max-width: 768px) {
            font-size: 16px;
        }
    }

    .top-1-nick {
        background: linear-gradient(180deg, #f8f8f8 0%, #ffd485 70%, #986d2f 100%);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent
    }

    .top-2-nick {
        background: linear-gradient(180deg, #f8f8f8 0%, #d4d4d4 70%, #636363 100%);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .top-3-nick {
        background: linear-gradient(180deg, #f8f8f8 0%, #e0a280 70%, #d67457 100%);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    

    

    @keyframes scroll-donators {
        0% {
            transform: translateX(0%);
        }
        100% {
            transform: translateX(-33.333%);
        }
    }
}
</style>