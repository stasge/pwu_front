<script setup lang="ts">
import Footer from '@/components/Footer.vue'
import Header from '@/components/Header.vue'
import BurgerMenu from '@/components/BurgerMenu.vue'
</script>

<template>
    <div class="wrapper">
        <Header />
        <div class="container" style="margin-top: 120px;">
            <div class="px-0 sm:px-5 flex justify-content-center pb-8 pt-6 gap-5">
                <router-view></router-view>
            </div>
        </div>
        <Footer />
    </div>
</template>

<style scoped lang="scss">

    .container {
        
        @media (max-width: 768px) {
            margin-top: 40px;
        }
    }
</style>