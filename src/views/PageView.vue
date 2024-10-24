<script setup lang="ts">
import Footer from '@/components/Footer.vue'
import SideMenu from '@/components/SideMenu.vue'
import BurgerMenu from '@/components/BurgerMenu.vue'
</script>

<template>
    <BurgerMenu />
    <div class="wrapper">
        <div class="container">
            <div class="px-5 flex justify-content-between pb-8 pt-6 gap-5">
                <router-view></router-view>
                <SideMenu :translateY="'0'"/>
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