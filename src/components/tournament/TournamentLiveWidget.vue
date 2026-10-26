<script setup lang="ts">
import { useTournamentLive } from '@/composables/useTournamentLive'

const REFRESH_MS = 30000

/** Липкий віджет на головній: видно, лише поки турнір триває */
const { status } = useTournamentLive(REFRESH_MS, { withState: false })
</script>
<template>
    <Transition name="tournament-widget">
        <router-link v-if="status === 'live'" :to="{ name: 'tournament' }" class="tournament-widget">
            <span class="tournament-widget__live"><span class="tournament-widget__dot"></span>LIVE</span>
            <span class="tournament-widget__text">Турнір триває</span>
            <i class="pi pi-angle-right"></i>
        </router-link>
    </Transition>
</template>
<style scoped lang="scss">
.tournament-widget {
    position: fixed;
    left: 20px;
    bottom: 24px;
    z-index: 9998;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border: 1px solid rgba(255, 107, 107, 0.55);
    border-radius: 99px;
    background: rgba(15, 20, 32, 0.92);
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.5), 0 0 18px rgba(255, 82, 82, 0.25);
    color: #f8f8f8;
    font-family: "Candara", sans-serif;
    font-size: 16px;
    text-decoration: none;
    backdrop-filter: blur(4px);
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 28px rgba(0, 0, 0, 0.55), 0 0 24px rgba(255, 82, 82, 0.4);
    }

    &__live {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: #ff6b6b;
        font-weight: 700;
        letter-spacing: 0.08em;
    }

    &__dot {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: #ff5252;
        animation: tournament-widget-pulse 1.4s ease-in-out infinite;
    }

    i { color: #fbd298; }

    @media (max-width: 768px) {
        left: 12px;
        bottom: 16px;
        padding: 10px 14px;
        font-size: 14px;
    }
}

@keyframes tournament-widget-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(255, 82, 82, 0.7); }
    50% { box-shadow: 0 0 0 7px rgba(255, 82, 82, 0); }
}

.tournament-widget-enter-active,
.tournament-widget-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.tournament-widget-enter-from,
.tournament-widget-leave-to {
    opacity: 0;
    transform: translateY(12px);
}
</style>
