<script setup lang="ts">
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import CTA from '@/components/CTA.vue'
</script>

<template>
    <div class="wrapper">
        <Header />
        <div class="container">
            <router-view></router-view>
        </div>
        <CTA />
        <Footer />
    </div>
</template>