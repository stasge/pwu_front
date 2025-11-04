<script setup lang="ts">
import Footer from '@/components/Footer.vue'
import Header from '@/components/Header.vue'
</script>

<template>
    <div class="wrapper">
        <Header />
        <div class="container">
            <div class="px-3 sm:px-5 flex justify-content-center pb-8 pt-0 md:pt-6 gap-5">
                <router-view></router-view>
            </div>
        </div>
        <Footer />
    </div>
</template>

<style scoped lang="scss">

    .container {
        margin-top: 120px;
        
        @media (max-width: 768px) {
            margin-top: 100px;
        }
    }
</style>