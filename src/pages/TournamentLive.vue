<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTournamentLive } from '@/composables/useTournamentLive'
import { useUserStore } from '@/stores/userStore'
import { CATEGORIES, formatLabel, getEntryTeams, isTeamReg } from '@/tournament/logic'
import type { Category } from '@/tournament/types'
import CategoryBoard from '@/components/tournament/CategoryBoard.vue'

const REFRESH_MS = 5000

const userStore = useUserStore()
const { status, data, updatedAt, loaded } = useTournamentLive(REFRESH_MS)

/**
 * Категорії, де є що показати: турнір уже сформовано або є команди з командної реєстрації.
 * Команди рандомайзера не прив'язані до категорії, тож до старту їх не показуємо.
 */
const activeCategories = computed(() =>
    CATEGORIES.filter((c) => {
        if (!data.value) return false
        const tour = data.value.tournaments[c]
        if (tour.groups.length > 0 || tour.bracket) return true
        return isTeamReg(data.value, c) && getEntryTeams(data.value, c).length > 0
    })
)

const selected = ref<Category | null>(null)
const cat = computed<Category | null>(() =>
    selected.value && activeCategories.value.includes(selected.value) ? selected.value : activeCategories.value[0] ?? null
)

const updatedLabel = computed(() => {
    if (!updatedAt.value) return ''
    const date = new Date(updatedAt.value.replace(' ', 'T'))
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })
})
</script>
<template>
    <div class="tournament-live">
        <div class="tournament-live__header">
            <div>
                <h1 class="tournament-live__title">PvP-турнір</h1>
                <p v-if="data && status !== 'draft'" class="tournament-live__meta">
                    <span v-if="status === 'live'" class="live-badge"><span class="live-badge__dot"></span>LIVE</span>
                    <span v-else class="finished-badge">Завершено</span>
                    <span v-if="updatedLabel">оновлено о {{ updatedLabel }}</span>
                </p>
            </div>
            <router-link
                v-if="userStore.isAdmin"
                :to="{ name: 'admin-tournament' }"
                class="fantasy-btn small thin px-3"
            ><span>Керування</span></router-link>
        </div>

        <p v-if="loaded && (!data || status === 'draft')" class="tournament-live__empty">
            Зараз турнірів немає. Слідкуй за новинами — анонс з'явиться на головній.
        </p>

        <template v-else-if="data && cat">
            <nav v-if="activeCategories.length > 1" class="tabs" aria-label="Категорії">
                <button
                    v-for="c in activeCategories"
                    :key="c"
                    type="button"
                    :class="{ 'is-active': cat === c }"
                    @click="selected = c"
                >{{ c }} <small>{{ formatLabel(data, c) }}</small></button>
            </nav>
            <CategoryBoard :key="cat" :data="data" :cat="cat" />
        </template>

        <p v-else-if="data" class="tournament-live__empty">Реєстрація триває — команди скоро з'являться.</p>
    </div>
</template>
<style scoped lang="scss">
.tournament-live {
    width: 100%;
    max-width: 1400px;
    color: #f8f8f8;

    &__header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        flex-wrap: wrap;
        gap: 20px;
        margin-bottom: 24px;
    }

    &__title {
        margin: 0;
        font-size: clamp(32px, 4vw, 64px);
        font-weight: 400;
        letter-spacing: -0.07em;
    }

    &__meta {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 8px 0 0;
        font-family: "Candara", sans-serif;
        font-size: 14px;
        color: rgba(248, 248, 248, 0.55);
    }

    &__empty {
        margin: 40px 0;
        font-family: "Candara", sans-serif;
        font-size: 18px;
        text-align: center;
        color: rgba(248, 248, 248, 0.65);
    }
}

.live-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 10px;
    border-radius: 99px;
    background: rgba(255, 82, 82, 0.15);
    color: #ff6b6b;
    font-weight: 700;
    letter-spacing: 0.08em;

    &__dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #ff5252;
        animation: live-pulse 1.4s ease-in-out infinite;
    }
}

.finished-badge {
    padding: 3px 10px;
    border-radius: 99px;
    background: rgba(251, 210, 152, 0.15);
    color: #fbd298;
}

@keyframes live-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(255, 82, 82, 0.7); }
    50% { box-shadow: 0 0 0 6px rgba(255, 82, 82, 0); }
}

.tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 22px;
    border-bottom: 1px solid rgba(93, 119, 144, 0.3);

    button {
        padding: 10px 18px;
        border: none;
        border-bottom: 2px solid transparent;
        background: none;
        color: rgba(248, 248, 248, 0.6);
        font-family: "VollkornSC", sans-serif;
        font-size: 20px;

        small {
            font-family: "Candara", sans-serif;
            font-size: 13px;
            opacity: 0.7;
        }

        &.is-active {
            border-bottom-color: #fbd298;
            color: #fbd298;
        }
    }
}
</style>
