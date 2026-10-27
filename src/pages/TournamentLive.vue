<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTournamentLive } from '@/composables/useTournamentLive'
import { useUserStore } from '@/stores/userStore'
import { CATEGORIES, categoryFinished, formatLabel, getEntryTeams, isTeamReg, podium, teamLabel } from '@/tournament/logic'
import type { Category } from '@/tournament/types'
import CategoryBoard from '@/components/tournament/CategoryBoard.vue'
import '@/tournament/theme.scss'

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

/** Завершені категорії, крім відкритої (там подіум і так видно) — щоб результат не губився */
const finishedOthers = computed(() => {
    const d = data.value
    if (!d) return []
    return activeCategories.value
        .filter((c) => c !== cat.value && categoryFinished(d.tournaments[c]))
        .map((c) => {
            const p = podium(d.tournaments[c])!
            return { cat: c, first: teamLabel(d, c, p.first), second: teamLabel(d, c, p.second), third: teamLabel(d, c, p.third) }
        })
})

const catLabel = (c: Category) => (c === '90-98' ? '90–98' : c)

const updatedLabel = computed(() => {
    if (!updatedAt.value) return ''
    const date = new Date(updatedAt.value.replace(' ', 'T'))
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })
})
</script>
<template>
    <div class="pvp tournament-live">
        <h1 class="pvp__title">PvP Турнір</h1>

        <div v-if="data && status !== 'draft'" class="tournament-live__meta">
            <span v-if="status === 'live'" class="live-badge"><span class="live-badge__dot"></span>LIVE</span>
            <span v-else class="live-badge live-badge--finished">Завершено</span>
            <span v-if="updatedLabel" class="tournament-live__updated">оновлено о {{ updatedLabel }}</span>
            <router-link v-if="userStore.isAdmin" :to="{ name: 'admin-tournament' }" class="ghost-btn ghost-btn--accent">Керування</router-link>
        </div>

        <div v-if="loaded && (!data || status === 'draft')" class="empty-state tournament-live__empty">
            Зараз турнірів немає. Слідкуй за новинами — анонс з'явиться на головній.
        </div>

        <template v-else-if="data && cat">
            <div v-if="finishedOthers.length" class="finished-strip">
                <div v-for="f in finishedOthers" :key="f.cat" class="finished-strip__item">
                    <span class="finished-strip__title">{{ catLabel(f.cat) }} — завершено</span>
                    <span class="finished-strip__place"><b>1</b> {{ f.first }}</span>
                    <span class="finished-strip__place"><b>2</b> {{ f.second }}</span>
                    <span class="finished-strip__place"><b>3</b> {{ f.third }}</span>
                    <button type="button" class="ghost-btn ghost-btn--accent finished-strip__go" @click="selected = f.cat">Результати</button>
                </div>
            </div>
            <nav v-if="activeCategories.length > 1" class="app-nav" aria-label="Категорії">
                <button
                    v-for="c in activeCategories"
                    :key="c"
                    type="button"
                    class="app-nav__btn"
                    :class="{ 'is-active': cat === c }"
                    @click="selected = c"
                >{{ catLabel(c) }} <small>{{ categoryFinished(data.tournaments[c]) ? '🏆 завершено' : formatLabel(data, c) }}</small></button>
            </nav>
            <CategoryBoard :key="cat" :data="data" :cat="cat" />
        </template>

        <div v-else-if="data" class="empty-state tournament-live__empty">Реєстрація триває — команди скоро з'являться.</div>
    </div>
</template>
<style scoped lang="scss">
.tournament-live {
    width: 100%;
    max-width: 1200px;

    &__meta {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;
        margin: -4px 0 20px;
    }

    &__updated {
        font-family: 'Candara', sans-serif;
        font-size: 13px;
        color: rgba(248, 248, 248, 0.55);
    }

    &__empty {
        margin: 40px auto;
        max-width: 560px;
        font-size: 16px;
    }
}
</style>
