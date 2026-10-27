<script setup lang="ts">
import { computed, ref } from 'vue'
import {
    addRegisteredToRandomizer,
    CATEGORIES,
    commitFormedTeam,
    disbandFormedTeam,
    FORMATS,
    formedTeamsUsedInTournament,
    pickRandomTeam,
    randomizerTeamSize,
    resetRandomizer,
    setRandomizerTeamSize,
} from '@/tournament/logic'
import type { Category, TournamentData } from '@/tournament/types'
import { useTournamentAction } from '@/composables/useTournamentAction'
import PvpCorners from './PvpCorners.vue'

const props = defineProps<{ data: TournamentData }>()

const { run, ask, copyText } = useTournamentAction()

const importCat = ref<Category>('90-98')
const animating = ref(false)
const highlighted = ref(new Set<string>())
const removing = ref(new Set<string>())

const randomizer = computed(() => props.data.randomizer)
const teamSize = computed(() => randomizerTeamSize(props.data))
const formatName = (size: number) => FORMATS.find((f) => f.id === size)?.label ?? `${size}×${size}`
const canForm = computed(() => !animating.value && randomizer.value.availableList.length >= teamSize.value)

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const formTeam = async () => {
    if (!canForm.value) return
    const available = [...randomizer.value.availableList]
    const chosen = pickRandomTeam(props.data, available, teamSize.value)
    if (chosen.length !== teamSize.value) return

    animating.value = true
    for (let step = 0; step < 12; step++) {
        highlighted.value = new Set(pickRandomTeam(props.data, available, teamSize.value))
        await sleep(100)
    }
    highlighted.value = new Set(chosen)
    await sleep(350)
    removing.value = new Set(chosen)
    highlighted.value = new Set()
    await sleep(500)

    commitFormedTeam(props.data, chosen)
    removing.value = new Set()
    animating.value = false
}

const addFromRegistration = () =>
    run(
        () => addRegisteredToRandomizer(props.data, importCat.value),
        (added) => (added ? `Додано ${added} · формат ${formatName(teamSize.value)}` : `Формат ${formatName(teamSize.value)}. Немає нових гравців`)
    )

const disband = (event: Event, index: number) => {
    const warning = formedTeamsUsedInTournament(props.data)
        ? ' Увага: сформовані команди вже використовуються в турнірі — сітка/групи можуть зламатися.'
        : ''
    ask(event, `Розформувати команду ${index + 1}? Гравці повернуться в пул.${warning}`, () => {
        const returned = disbandFormedTeam(props.data, index)
        highlighted.value = new Set(returned)
        setTimeout(() => {
            if (!animating.value) highlighted.value = new Set()
        }, 1200)
    })
}

const copyFormed = () =>
    copyText(
        randomizer.value.formedTeams.map((team, i) => `Команда ${i + 1}: ${team.join(' / ')}`).join('\n'),
        'Команди скопійовано'
    )
</script>
<template>
    <div>
        <div class="counters">
            <div class="counter">
                <span class="counter__value">{{ randomizer.availableList.length }}</span>
                <span class="counter__label">гравців залишилось</span>
            </div>
            <div class="counter">
                <span class="counter__value">{{ randomizer.formedTeams.length }}</span>
                <span class="counter__label">команд сформовано</span>
            </div>
        </div>

        <div class="rand-actions">
            <label class="field">
                <span class="field__label">Формат</span>
                <select
                    class="field__input"
                    :value="teamSize"
                    :disabled="animating || randomizer.formedTeams.length > 0"
                    @change="run(() => setRandomizerTeamSize(data, Number(($event.target as HTMLSelectElement).value)))"
                >
                    <option v-for="f in FORMATS" :key="f.id" :value="f.id">{{ f.label }}</option>
                </select>
            </label>
            <button type="button" class="pvp-btn" :disabled="!canForm" @click="formTeam"><span>Сформувати команду</span></button>
            <button
                type="button"
                class="reset-btn"
                :disabled="animating || (!randomizer.formedTeams.length && !randomizer.availableList.length)"
                @click="ask($event, 'Скинути пул і всі сформовані команди?', () => resetRandomizer(data))"
            >Скинути</button>
        </div>

        <div class="rand-import">
            <span class="rand-import__label">Додати з реєстрації (підтягне формат категорії):</span>
            <label v-for="c in CATEGORIES" :key="c" class="radio-check">
                <input v-model="importCat" type="radio" :value="c">
                <span>{{ c }}</span>
            </label>
            <button type="button" class="ghost-btn ghost-btn--accent" :disabled="animating" @click="addFromRegistration">Додати в пул</button>
        </div>

        <div class="pool">
            <PvpCorners />
            <div class="pool__header">Пул гравців ({{ randomizer.availableList.length }})</div>
            <div class="pool__grid">
                <div
                    v-for="name in randomizer.availableList"
                    :key="name"
                    class="pool__cell"
                    :class="{ 'pool__cell--highlight': highlighted.has(name), 'pool__cell--removing': removing.has(name) }"
                >{{ name }}</div>
            </div>
        </div>

        <section v-if="randomizer.formedTeams.length" class="tour-section">
            <div class="tour-section__head">
                <h2 class="tour-section__title">Сформовані команди</h2>
                <button type="button" class="ghost-btn" @click="copyFormed">Копіювати текстом</button>
            </div>
            <div class="teams-grid">
                <div v-for="(team, index) in randomizer.formedTeams" :key="team.join('|')" class="team-card">
                    <div class="team-card__header">
                        <span>Команда {{ index + 1 }}</span>
                        <button
                            type="button"
                            class="team-card__disband"
                            title="Розформувати: гравці повернуться в пул"
                            :disabled="animating"
                            @click="disband($event, index)"
                        >✕</button>
                    </div>
                    <ul class="team-card__list">
                        <li v-for="nick in team" :key="nick" class="team-card__item">{{ nick }}</li>
                    </ul>
                </div>
            </div>
        </section>
    </div>
</template>
