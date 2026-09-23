<script setup lang="ts">
defineProps<{
    image: string
    icon: string
    title: string
    accent: string
}>()
</script>

<template>
    <section class="clan-hero">
        <img :src="image" alt="" class="clan-hero__bg">
        <div class="clan-hero__content">
            <img :src="icon" alt="" class="clan-hero__icon">
            <h2 class="clan-hero__title">
                {{ title }}
                <br>
                <span class="gold-text">{{ accent }}</span>
            </h2>
            <p class="clan-hero__text">
                <slot />
            </p>
        </div>
    </section>
</template>

<style scoped lang="scss">
.clan-hero {
    position: relative;
    min-height: 280px;
    padding: 50px 32px 24px;
    display: flex;
    align-items: flex-end;
    overflow: hidden;

    @media (max-width: 768px) {
        padding: 70px 20px 24px;
    }

    &::after {
        content: '';
        position: absolute;
        inset: 0;
        background:
            linear-gradient(180deg, rgba(10, 10, 10, 0) 55%, #0a0a0a 100%),
            linear-gradient(90deg, rgba(10, 10, 10, 0.85) 0%, rgba(10, 10, 10, 0.4) 55%, rgba(10, 10, 10, 0) 80%);
    }

    &__bg {
        position: absolute;
        top: 0;
        right: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: right center;
    }

    &__content {
        position: relative;
        z-index: 1;
        max-width: 300px;
    }

    &__icon {
        display: block;
        height: 30px;
        width: auto;
        margin-bottom: 14px;
    }

    &__title {
        font-family: "VollkornSC", sans-serif;
        font-weight: 400;
        font-size: 36px;
        line-height: 0.9;
        letter-spacing: -0.05em;
        color: #f8f8f8;
        margin-bottom: 12px;

        @media (max-width: 768px) {
            font-size: 32px;
        }
    }

    &__text {
        font-family: "Candara", sans-serif;
        font-size: 15px;
        line-height: 1.2;
        color: #f8f8f8;
        max-width: 290px;
    }
}

.gold-text {
    background: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}
</style>
