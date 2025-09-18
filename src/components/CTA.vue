<script setup lang="ts">
import { ref } from 'vue';
import RegisterModal from '@/components/modals/register.vue';
import { useRouter } from 'vue-router';

const router = useRouter()
const registerModal = ref()

const handleRegister = () => {
    registerModal.value?.showDia()
}

const handleDownload = () => {
    router.push({ name: 'download-page' })
}
</script>

<template>
    <div class="cta">
        <div class="cta__content">
            <h2 class="cta__title">
                Вступи в Бій
                <br>
                Переписуючи Основи
            </h2>
            <div class="cta__buttons">
                <button class="fantasy-btn" @click="handleRegister"><span>Реєстрація</span></button>
                <button class="fantasy-btn" @click="handleDownload">
                    <span>Завантажити </span>
                    <span class="client-text">Клієнт</span>
                </button>
            </div>
        </div>
        <!-- Заглушки для масок -->
        <img src="@/assets/images/CTA-mask.png" class="cta__mask-top" alt="cta mask top">
        <img src="@/assets/images/CTA-mask.png" class="cta__mask-bottom" alt="cta mask bottom">
        <RegisterModal ref="registerModal" />
    </div>
</template>

<style scoped lang="scss">
.cta {
    position: relative;
    width: 100%;
    min-height: 600px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: url('@/assets/images/CTA-bg.jpg') no-repeat center / cover;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        z-index: 1;
    }

    &__content {
        position: relative;
        z-index: 5;
        color: white;
        text-align: center;
        width: 100%;
        max-width: 800px;
        padding: 60px 20px;
    }

    &__title {
        font-size: 52px;
        font-weight: 400;
        color: #f8f8f8;
        line-height: 100%;
        letter-spacing: -0.07em;
        text-align: center;
        margin-bottom: 40px;

        @media (max-width: 768px) {
            font-size: 36px;
            margin-bottom: 30px;
        }
    }

    &__buttons {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 10px 50px;

        @media (max-width: 768px) {
            flex-direction: column;
            gap: 15px;
        }
    }

    &__mask-top {
        position: absolute;
        top: -1px;
        left: -1px;
        width: 100%;
        height: clamp(76px, 10vw, 197px);
        z-index: 3;
    }
    
    &__mask-bottom {
        transform: rotate(180deg);
        position: absolute;
        bottom: -1px;
        left: -1px;
        width: 100%;
        height: clamp(76px, 10vw, 197px);
        z-index: 3;
    }
}
</style>
