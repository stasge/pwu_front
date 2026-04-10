<script setup lang="ts">
interface IProps {
    image: string
    title: string
    description: string
}

defineProps<IProps>()
</script>

<template>
    <aside class="forum-side-card">
        <div class="forum-side-card__corner forum-side-card__corner--top-left"></div>
        <div class="forum-side-card__corner forum-side-card__corner--top-right"></div>
        <div class="forum-side-card__corner forum-side-card__corner--bottom-left"></div>
        <div class="forum-side-card__corner forum-side-card__corner--bottom-right"></div>

        <div class="forum-side-card__image" :style="{ backgroundImage: `url(${image})` }"></div>

        <div class="forum-side-card__content">
            <h3>{{ title }}</h3>
            <p>{{ description }}</p>
        </div>
    </aside>
</template>

<style scoped lang="scss">
.forum-side-card {
    width: 100%;
    border-radius: 5px;
    min-height: 200px;
    position: relative;

    &__image {
        position: absolute;
        inset: 0;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        border-radius: 5px;
    }

    &__content {
        position: relative;
        z-index: 1;
        min-height: 200px;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        align-items: center;
        text-align: center;
        padding: clamp(10px, 1vw, 20px);

        h3 {
            font-weight: 400;
            font-size: clamp(16px, 1.5vw, 28px);
            line-height: 100%;
            letter-spacing: -0.07em;
            margin-bottom: 10px;
            background: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;

            @media (max-width: 1024px) {
                font-size: 28px;
            }
        }

        p {
            color: #f8f8f8;
            font-family: 'Candara', sans-serif;
            font-weight: 400;
            font-size: clamp(12px, 1vw, 14px);
            line-height: 150%;
            letter-spacing: -0.02em;
            text-align: center;
            text-shadow: 0 1px 6px rgba(0, 0, 0, 0.65);

            @media (max-width: 1024px) {
                font-size: 14px;
            }
        }
    }

    &__corner {
        position: absolute;
        width: 10px;
        height: 10px;
        background-image: url('@/assets/images/profile-corner.svg');
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        z-index: 2;
        pointer-events: none;

        &--top-left {
            top: -1px;
            left: -1px;
            transform: rotate(0deg);
        }

        &--top-right {
            top: -1px;
            right: -1px;
            transform: rotate(90deg);
        }

        &--bottom-left {
            bottom: -1px;
            left: -1px;
            transform: rotate(-90deg);
        }

        &--bottom-right {
            bottom: -1px;
            right: -1px;
            transform: rotate(180deg);
        }
    }
}
</style>
