<script setup lang="ts">
const currentYear = new Date().getFullYear();
</script>

<template>
    <div
        class="footer w-full flex flex-column align-items-center justify-content-center gap-4"
        data-nosnippet
    >
        <img src="@/assets/images/header-logo.png" alt="footer-logo">
        <div class="flex flex-column text-center gap-2">
            <p>Ігровий сервер {{ currentYear }} Valor  © {{ currentYear }} </p>
            <span >Сервер є тестовим і створений для ознайомлення з грою "Perfect World", всі права належать правовласникам.</span>
        </div>
        <router-link :to="{name: 'terms'}" class="underline">Користувацька Угода</router-link>
    </div>
</template>

<style scoped lang="scss">
    .footer {
        background: #0A0A0A;
        color: #f8f8f8;
        padding: 50px;
        font-size: 12px;
        
        a {
            font-weight: 400;
            font-size: 14px;
            line-height: 60%;
            letter-spacing: -0.09em;
            text-decoration-skip-ink: none;
            text-align: center;
            background: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-transform: capitalize;
            width: fit-content;
            margin: 0 auto;
            padding: 4px 0;
            border-bottom: 1px solid #f8f8f8;
        }
    }
</style>