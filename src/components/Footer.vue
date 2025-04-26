<script setup lang="ts">

</script>

<template>
    <div class="footer w-full flex flex-column align-items-center justify-content-center gap-2">
        <p>2025 Valor - Ігровий сервер</p>
        <div class="flex flex-column text-center gap-2">
            <span >Сервер є тестовим і створений для ознайомлення з грою "Perfect World", всі права належать правовласникам.</span>
            <router-link :to="{name: 'terms'}" class="underline">Користувацька угода</router-link>
        </div>
        <div class="flex align-items-center gap-3">
            <a href="https://discord.gg/zPKh4BUsKX" target="_blank">
                <i class="pi pi-discord text-2xl"></i>
            </a>
            <a href="https://t.me/valor_pw" target="_blank">
                <i class="pi pi-telegram text-2xl"></i>
            </a>
        </div>
    </div>
</template>

<style scoped lang="scss">
    .footer {
        height: 130px;
        background: #171d2b;
        color: #FFF;
        font-size: 87.5%; /* 14/16 */
    }
</style>