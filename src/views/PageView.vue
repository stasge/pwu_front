<script setup lang="ts">
import Footer from '@/components/Footer.vue'
import Header from '@/components/Header.vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

const isForumRoute = computed(() => {
    const forumRoutes = ['themes', 'separate-theme', 'theme-creation']
    return forumRoutes.includes(route.name as string)
})
</script>

<template>
    <div class="wrapper">
        <Header v-if="!isForumRoute" />
        <div class="container" :class="{ 'container--no-header': isForumRoute }">
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

        &--no-header {
            margin-top: 0;
        }
    }
</style>