<script setup lang="ts">
import Footer from '@/components/Footer.vue'
import SideMenu from '@/components/SideMenu.vue'
</script>

<template>
    <div class="wrapper">
        <div class="container">
            <div class="px-5 flex justify-content-between py-8">
                <router-view></router-view>
            </div>
        </div>
        <Footer />
    </div>
</template>