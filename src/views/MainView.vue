<script setup lang="ts">
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import BurgerMenu from '@/components/BurgerMenu.vue'
</script>

<template>
    <div class="wrapper">
        <BurgerMenu />
        <Header class="w-full" />
        <div class="container">
            <div class="px-5">
                <router-view></router-view>
            </div>
        </div>
        <Footer />
    </div>
</template>