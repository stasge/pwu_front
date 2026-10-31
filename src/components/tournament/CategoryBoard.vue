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
    teamMembers,
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

const { run, ask, copyImage, imageBusy } = useTournamentAction()

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
const isDq = (id: string) => tour.value.disqualified.some((d) => d.id === id)

const label = (id: string | null) => teamLabel(props.data, props.cat, id)

const setup = (event: Event) => {
    const action = () => run(() => setupTournament(props.data, props.cat), (msg) => msg)
    if (started.value) ask(event, 'Сформувати турнір заново? Поточні групи, сітка й результати буде втрачено.', action)
    else action()
}
</script>
<template>
    <div>
        <div v-if="editable" class="tour-setup">
            <button type="button" class="ghost-btn ghost-btn--accent" @click="setup">Сформувати турнір</button>
            <button
                v-if="canBuildFromGroups(tour)"
                type="button"
                class="ghost-btn ghost-btn--accent"
                @click="run(() => buildBracketFromGroups(data, cat), (msg) => msg)"
            >Побудувати сітку з груп</button>
            <button
                v-if="started"
                type="button"
                class="ghost-btn ghost-btn--danger"
                @click="ask($event, `Очистити турнір ${cat}?`, () => run(() => clearTournament(data, cat), 'Турнір очищено'))"
            >Очистити турнір</button>
            <p class="tour-setup__hint">
                Команд: <strong>{{ nextEntries.length }}</strong> ({{ sourceLabel }}). {{ describePlan(nextEntries.length) }}.<br>
                Формат серій: чвертьфінал BO1 · півфінал BO3 · 3 місце BO3 · фінал BO5. У групі 1 перемога = 1 бал.
                <template v-if="hasPendingTiebreaks">
                    <br><span class="tour-setup__warn">Є нічиї за очками — заверши перегравання або зарандом місця.</span>
                </template>
            </p>
        </div>

        <section v-if="winners" class="podium">
            <div class="podium__place podium__place--1">
                <span class="podium__num">1</span>
                <div><div class="podium__label">Переможці</div><div class="podium__name">{{ label(winners.first) }}</div></div>
            </div>
            <div v-if="winners.second" class="podium__place">
                <span class="podium__num">2</span>
                <div><div class="podium__label">Фіналісти</div><div class="podium__name">{{ label(winners.second) }}</div></div>
            </div>
            <div v-if="winners.third" class="podium__place">
                <span class="podium__num">3</span>
                <div><div class="podium__label">Третє місце</div><div class="podium__name">{{ label(winners.third) }}</div></div>
            </div>
        </section>

        <section v-if="!editable" class="tour-section">
            <div class="tour-section__head">
                <h2 class="tour-section__title">Команди {{ cat }} · {{ formatLabel(data, cat) }}</h2>
            </div>
            <div v-if="teams.length" class="teams-grid">
                <div v-for="(team, i) in teams" :key="team.id" class="team-card" :class="{ 'is-dq': isDq(team.id) }">
                    <div class="team-card__header">
                        <span>Команда {{ i + 1 }}</span>
                        <span v-if="isDq(team.id)" class="dq-tag">дискв.</span>
                    </div>
                    <ul class="team-card__list">
                        <li v-for="m in teamMembers(data, cat, team)" :key="m.nick" class="team-card__item member-row">
                            <span>{{ m.nick }}</span>
                            <span v-if="m.class" class="member-row__meta">{{ m.class }} · <b>{{ m.level }}</b></span>
                        </li>
                    </ul>
                </div>
            </div>
            <div v-else class="empty-state">Команди ще формуються</div>
        </section>

        <section v-if="tour.groups.length || editable" class="tour-section">
            <div class="tour-section__head">
                <h2 class="tour-section__title">Групи {{ cat }}</h2>
                <button v-if="editable" type="button" class="ghost-btn" :disabled="imageBusy || !tour.groups.length" @click="copyImage((e) => e.groupsExport(data, cat))">Копіювати картинкою</button>
            </div>
            <div v-if="tour.groups.length" class="groups-grid">
                <GroupCard v-for="(g, gi) in tour.groups" :key="g.name" :data="data" :cat="cat" :group-index="gi" :editable="editable" />
            </div>
            <div v-else class="empty-state">Групи ще не сформовані</div>
        </section>

        <section v-if="tour.bracket || editable" class="tour-section">
            <div class="tour-section__head">
                <h2 class="tour-section__title">Сітка {{ cat }}</h2>
                <button v-if="editable" type="button" class="ghost-btn" :disabled="imageBusy || !tour.bracket" @click="copyImage((e) => e.bracketExport(data, cat))">Копіювати картинкою</button>
            </div>
            <BracketBoard :data="data" :cat="cat" :editable="editable" />
        </section>
    </div>
</template>
