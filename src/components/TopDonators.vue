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
    'Інкогніто',
    'AnalogowNET',
]);
</script>
<template>
    <div class="top-donators mb-6">
        <div class="top-donators__inner">
            <div class="top-donators__container relative">
                <h2 class="top-donators__title text-center">Легенди підтримки</h2>
                <div class="top-donators__swiper">
                    <div class="donators-track">
                        <div class="donators-swiper" v-for="repeat in 2" :key="repeat">
                            <div v-for="(nick, idx) in donators" :key="`${repeat}-${idx}`" class="donator-slide">
                                <div class="donator-nick flex gap-2 align-items-center justify-content-center">
                                    <span>{{ idx + 1 }}. </span>
                                    <img v-if="idx === 0" src="@/assets/images/crown.png" alt="crown" width="24">
                                    <img v-if="idx === 1" src="@/assets/images/silver-crown.png" alt="crown" width="24">
                                    <img v-if="idx === 2" src="@/assets/images/bronze-crown.png" alt="crown" width="24">
                                    <span :class="{ 'top-1-nick': idx === 0 }">{{ nick }}</span>
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
    padding: 10px 0;
    height: 120px;

    &__title {
        font-size: 2rem;
        font-weight: 700;
        color: #fff;
    }

    &__block-top {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 20px;
        margin-bottom: 20px;
    }

    .item {
        display: flex;
        align-items: center;
        color: white;
        background: linear-gradient(180deg, #1b1f27 0%, #62708d 100%);
        border: 1px solid #ff7d00;
        border-radius: 500px;
        max-width: 275px;
        min-width: 220px;
        padding: 5px;
        font-family: 'Kurale', serif;
        font-size: 24px;

        &_1 {
            background: linear-gradient(180deg, #1b1f27 0%, #62708d 100%);

            &-img {
                max-width: 50px !important;
                max-height: 50px !important;
            }
        }

        &__img {
            max-width: 40px;
            max-height: 40px;
        }
    }

    .donators-swiper {
        position: relative;
        margin-top: 30px;
        max-height: 48px;
        left: 0;
        transform: translateX(-30%);
    }

    .donator-nick {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.3rem;
        font-weight: bold;
        color: #fff;
        padding: 10px 0;
        width: 240px !important;
        position: relative;

        &:before {
            position: absolute;
            content: "";
            width: 100%;
            height: 1px;
            background: linear-gradient(270deg, #ffa0e500 10%, #e26f0f, #ffa0e500 90%);
            bottom: 0;
            left: 0;
        }

        &::after {
            position: absolute;
            content: "";
            width: 100%;
            height: 1px;
            background: linear-gradient(270deg, rgba(255, 160, 229, 0) 10%, rgb(226, 111, 15) 50%, rgba(255, 160, 229, 0) 90%);
            top: 0;
            left: 0;
        }
    }

    .donator-slide {
        margin-right: 15px;
    }

    .donator-slide:last-child {
        margin-right: 0;
    }

    .top-1-nick {
        background: linear-gradient(90deg, #f6d365 0%, #fda085 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .donators-track {
        display: flex;
        width: max-content;
        animation: scroll-donators 30s linear infinite;
    }

    .donators-swiper {
        display: flex;
    }

    @keyframes scroll-donators {
        0% {
            transform: translateX(0%);
        }

        100% {
            transform: translateX(-50%);
        }
    }

}
</style>