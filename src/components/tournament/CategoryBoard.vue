<script setup lang="ts">
import { computed } from 'vue'
import {
    allGroupsPlacementReady,
    buildBracketFromGroups,
    canBuildFromGroups,
    clearTournament,
    describePlan,
    formatLabel,
    getEntryTeams,
    podium,
    setupTournament,
    teamLabel,
} from '@/tournament/logic'
import type { Category, TournamentData } from '@/tournament/types'
import { useTournamentAction } from '@/composables/useTournamentAction'
import GroupCard from './GroupCard.vue'
import BracketBoard from './BracketBoard.vue'

/** Турнір однієї категорії: групи + сітка. editable — адмінка */
const props = defineProps<{
    data: TournamentData
    cat: Category
    editable?: boolean
}>()

const { run, ask } = useTournamentAction()

const tour = computed(() => props.data.tournaments[props.cat])
const started = computed(() => tour.value.groups.length > 0 || !!tour.value.bracket)
const nextEntries = computed(() => getEntryTeams(props.data, props.cat))
const teams = computed(() => (started.value ? tour.value.entries : nextEntries.value))
const sourceLabel = computed(() => {
    const source = nextEntries.value[0]?.source
    if (source === 'registration') return 'з реєстрації'
    if (source === 'randomizer') return 'з рандомайзера'
    return 'немає команд'
})
const hasPendingTiebreaks = computed(
    () => tour.value.groups.some((g) => g.tiebreaks.length) && !allGroupsPlacementReady(tour.value)
)
const winners = computed(() => podium(tour.value))

const label = (id: string | null) => teamLabel(props.data, props.cat, id)

const setup = (event: Event) => {
    const action = () => run(() => setupTournament(props.data, props.cat), (msg) => msg)
    if (started.value) ask(event, 'Сформувати турнір заново? Поточні групи, сітка й результати буде втрачено.', action)
    else action()
}
</script>
<template>
    <div class="category-board">
        <div v-if="editable" class="category-board__setup">
            <div class="category-board__buttons">
                <button type="button" class="fantasy-btn small thin" @click="setup"><span>Сформувати турнір</span></button>
                <button
                    v-if="canBuildFromGroups(tour)"
                    type="button"
                    class="fantasy-btn small thin"
                    @click="run(() => buildBracketFromGroups(data, cat), (msg) => msg)"
                ><span>Побудувати сітку з груп</span></button>
                <button
                    v-if="started"
                    type="button"
                    class="category-board__danger"
                    @click="ask($event, `Очистити турнір ${cat}?`, () => run(() => clearTournament(data, cat), 'Турнір очищено'))"
                >Очистити турнір</button>
            </div>
            <p class="category-board__hint">
                Команд: <strong>{{ nextEntries.length }}</strong> ({{ sourceLabel }}). {{ describePlan(nextEntries.length) }}.<br>
                Серії: чвертьфінал BO1 · півфінал BO3 · 3 місце BO3 · фінал BO5. У групі 1 перемога = 1 бал.
                <template v-if="hasPendingTiebreaks">
                    <br><span class="category-board__warn">Є нічиї за очками — заверши перегравання або зарандом місця.</span>
                </template>
            </p>
        </div>

        <section v-if="winners" class="podium">
            <div class="podium__place podium__place--1"><span>1</span>{{ label(winners.first) }}</div>
            <div v-if="winners.second" class="podium__place podium__place--2"><span>2</span>{{ label(winners.second) }}</div>
            <div v-if="winners.third" class="podium__place podium__place--3"><span>3</span>{{ label(winners.third) }}</div>
        </section>

        <section v-if="!editable" class="category-board__section">
            <h2 class="category-board__title">Команди · {{ formatLabel(data, cat) }}</h2>
            <div v-if="teams.length" class="teams-grid">
                <div v-for="(team, i) in teams" :key="team.id" class="teams-grid__item" :class="{ 'is-dq': tour.disqualified.some((d) => d.id === team.id) }">
                    <span class="teams-grid__num">{{ i + 1 }}</span>
                    <span>{{ team.label }}</span>
                </div>
            </div>
            <p v-else class="category-board__empty">Команди ще формуються</p>
        </section>

        <section v-if="tour.groups.length" class="category-board__section">
            <h2 class="category-board__title">Групи</h2>
            <div class="groups-grid">
                <GroupCard v-for="(g, gi) in tour.groups" :key="g.name" :data="data" :cat="cat" :group-index="gi" :editable="editable" />
            </div>
        </section>

        <section v-if="tour.bracket || (editable && started)" class="category-board__section">
            <h2 class="category-board__title">Сітка</h2>
            <BracketBoard :data="data" :cat="cat" :editable="editable" />
        </section>
    </div>
</template>
<style scoped lang="scss">
.category-board {
    display: flex;
    flex-direction: column;
    gap: 28px;
    color: #f8f8f8;
    font-family: "Candara", sans-serif;

    &__setup {
        padding: 16px 18px;
        border: 1px solid rgba(93, 119, 144, 0.25);
        border-radius: 8px;
        background: rgba(23, 29, 43, 0.7);
    }

    &__buttons {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 14px;
    }

    &__danger {
        padding: 7px 12px;
        border: 1px solid rgba(255, 138, 138, 0.4);
        border-radius: 5px;
        background: transparent;
        color: #ff8a8a;

        &:hover { background: rgba(255, 138, 138, 0.1); }
    }

    &__hint {
        margin: 12px 0 0;
        font-size: 14px;
        line-height: 1.5;
        color: rgba(248, 248, 248, 0.65);
    }

    &__warn { color: #ffb74d; }

    &__title {
        margin: 0 0 14px;
        font-family: "VollkornSC", sans-serif;
        font-weight: 400;
        font-size: clamp(22px, 2.4vw, 30px);
    }

    &__empty {
        margin: 0;
        color: rgba(248, 248, 248, 0.5);
    }
}

.groups-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 440px), 1fr));
    gap: 18px;
}

.teams-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 240px), 1fr));
    gap: 10px;

    &__item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border: 1px solid rgba(93, 119, 144, 0.25);
        border-radius: 6px;
        background: #171d2b;
        overflow-wrap: anywhere;

        &.is-dq {
            opacity: 0.45;
            text-decoration: line-through;
        }
    }

    &__num {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: rgba(251, 210, 152, 0.15);
        color: #fbd298;
        line-height: 24px;
        text-align: center;
        font-size: 13px;
    }
}

.podium {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
    gap: 12px;

    &__place {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
        border: 1px solid rgba(251, 210, 152, 0.3);
        border-radius: 8px;
        background: linear-gradient(135deg, rgba(251, 210, 152, 0.14), rgba(23, 29, 43, 0.9));
        font-size: 16px;
        overflow-wrap: anywhere;

        span {
            flex-shrink: 0;
            font-family: "VollkornSC", sans-serif;
            font-size: 28px;
            color: #fbd298;
        }

        &--2 { border-color: rgba(220, 220, 230, 0.3); }
        &--2 span { color: #dcdce6; }
        &--3 { border-color: rgba(205, 127, 50, 0.35); }
        &--3 span { color: #d9965b; }
    }
}
</style>
