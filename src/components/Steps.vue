<script setup lang="ts">
import { ref } from 'vue';
import Register from '@/components/modals/register.vue';
import Login from '@/components/modals/login.vue';

const registerRef = ref<InstanceType<typeof Register> | null>(null)
const loginRef = ref<InstanceType<typeof Login> | null>(null)

</script>

<template>
    <div class="join-fight mt-8">
        <h2 class="join-fight__title">Вступи в бій</h2>
        <p class="join-fight__text mt-3">Переписуючи основи</p>
    </div>
    <div class="steps mt-6 mb-8">
        <div class="steps__item" @click="registerRef?.showDia">
            <h3>Реєстрація</h3>
            <p>Для подальшої гри необхідний ігровий обліковий запис</p>
        </div>
        <div class="steps__item">
            <h3>Завантаження</h3>
            <p>Завантажте ігровий клієнт зручним способом</p>
        </div>
        <div class="steps__item">
            <h3>Гра</h3>
            <p>Пориньте в захоплюючі битви нового світу</p>
        </div>
    </div>
    <Register ref="registerRef" @openLogin="loginRef?.showDia"/>
    <Login ref="loginRef" @openRegistration="registerRef?.showDia"/>
</template>

<style scoped lang="scss">
.join-fight {
    color: #FFF;
    text-align: center;
    padding: 25px 0;
    background: linear-gradient(90deg, rgba(223, 119, 45, 0.00) 0%, rgba(93, 119, 144, 0.1) 49.60%, rgba(223, 119, 45, 0.00) 100%);
    position: relative;

    &::before {
        position: absolute;
        content: '';
        width: 100%;
        height: 1px;
        background: linear-gradient(270deg, rgba(255, 160, 229, 0) 10%, rgb(226, 111, 15) 50%, rgba(255, 160, 229, 0) 90%);
        bottom: 0;
        left: 0;
    }

    &::after {
        position: absolute;
        content: '';
        width: 100%;
        height: 1px;
        background: linear-gradient(270deg, rgba(255, 160, 229, 0) 10%, rgb(226, 111, 15) 50%, rgba(255, 160, 229, 0) 90%);
        top: 0;
        left: 0;
    }

    &__title {
        font-size: 250%; /* 40/16 */
    }

    &__text {
        font-size: 125%; /* 20/16 */
    }
}

.steps {
    display: flex;
    justify-content: center;
    row-gap: clamp(10px, 3vw, 20px);

    @media (max-width: 1024px) {
        flex-wrap: wrap;
    }

    &__item {
        position: relative;
        background: url('@/assets/images/step-bg.svg') no-repeat center / contain;
        animation: steps-anim 2.5s infinite;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: clamp(120px, 12vw, 188px);
        text-align: center;
        color: #FFF;
        cursor: pointer;
        transition: all .3s;
        width: clamp(300px, 28vw , 450px);
        min-width: 300px;
        min-height: 120px;

        @media (max-width: 768px) {
            animation: none;
        }

        &:hover {
            transform: scale(1.05);
        }

        h3 {
            font-size: 187.5%; /* 30/16 */
        }
        p {
            max-width: 60%;
            margin-top: 15px;
            font-size: 112.5%; /* 18/16 */
        }

        &:nth-child(2) {
            animation-delay: .3s;
        }

        &:last-child {
            animation-delay: .6s;
        }
    }
}

@keyframes steps-anim {
    0% {
        background: url('@/assets/images/step-bg-light.svg') no-repeat center / contain;
    }
    100% {
        background: url('@/assets/images/step-bg.svg') no-repeat center / contain;
    }
}
</style>