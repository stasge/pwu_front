<script setup lang="ts">
import Footer from '@/components/Footer.vue'
import SideMenu from '@/components/SideMenu.vue'
</script>

<template>
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