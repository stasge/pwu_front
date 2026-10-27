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
    padding: 12px 20px;
    border: 2px solid transparent;
    border-radius: 8px;
    background:
        linear-gradient(180deg, #17181d 0%, #1d1e22 32%, #0f1013 100%) padding-box,
        linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%) border-box;
    box-shadow: inset 0 1px 0 rgba(248, 248, 248, 0.08), 0 6px 24px rgba(0, 0, 0, 0.5);
    font-family: "VollkornSC", sans-serif;
    font-size: 18px;
    text-decoration: none;
    transition: transform 0.25s ease, box-shadow 0.25s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: inset 0 1px 0 rgba(248, 248, 248, 0.12), 0 0 16px rgba(251, 210, 152, 0.3);
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

    &__text {
        background: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    &__live {
        font-family: "Candara", sans-serif;
        font-size: 14px;
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
