<script setup lang="ts">
import News from '@/components/News.vue'
import SideMenu from '@/components/SideMenu.vue'
import Steps from '@/components/Steps.vue'
import TopDonators from '@/components/TopDonators.vue';
</script>
<template>
    <div class="content">
        <TopDonators />
        <div class="flex flex gap-5 justify-content-between">
            <News />
            <SideMenu :translateY="'-10%'"/>
        </div>
    </div>
    <Steps />
</template>

<style scoped lang="scss">
    .content {

        @media (max-height: 800px) {
            margin-top: 3rem;
        }
    }
</style>