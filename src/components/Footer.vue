<script setup lang="ts">

</script>

<template>
    <div class="footer w-full flex flex-column align-items-center justify-content-center gap-2">
        <p>2024 Perfect World Ukraine - Ігровий сервер</p>
        <div class="flex gap-2">
            <span>Усі права належать правовласникам.</span>
            <router-link :to="{name: 'terms'}" class="underline">Користувацька угода</router-link>
        </div>
    </div>
</template>

<style scoped lang="scss">
    .footer {
        height: 130px;
        background: #171d2b;
        color: #FFF;
        font-size: 87.5%; /* 14/16 */
        text-transform: capitalize;
    }
</style>