<script setup lang="ts">
import Hero from '@/components/Hero.vue'
import News from '@/components/News.vue'
import Steps from '@/components/Steps.vue'
import TopDonators from '@/components/TopDonators.vue';
import ClanBonusTabs from '@/components/clan-bonus/ClanBonusTabs.vue';
import TournamentLiveWidget from '@/components/tournament/TournamentLiveWidget.vue';
</script>
<template>
    <div class="content">
        <Hero />
        <News />
        <ClanBonusTabs />
        <TournamentLiveWidget />
    </div>
</template>

<style scoped lang="scss">
    .content {

        @media (max-height: 800px) {
            margin-top: 3rem;
        }
    }
</style>