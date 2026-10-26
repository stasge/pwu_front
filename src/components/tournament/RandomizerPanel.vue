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
    <div class="randomizer">
        <div class="randomizer__counters">
            <div class="counter"><strong>{{ randomizer.availableList.length }}</strong><span>гравців залишилось</span></div>
            <div class="counter"><strong>{{ randomizer.formedTeams.length }}</strong><span>команд сформовано</span></div>
        </div>

        <div class="randomizer__actions">
            <label class="field">
                <span>Формат</span>
                <select
                    :value="teamSize"
                    :disabled="animating || randomizer.formedTeams.length > 0"
                    @change="run(() => setRandomizerTeamSize(data, Number(($event.target as HTMLSelectElement).value)))"
                >
                    <option v-for="f in FORMATS" :key="f.id" :value="f.id">{{ f.label }}</option>
                </select>
            </label>
            <button type="button" class="fantasy-btn small" :disabled="!canForm" @click="formTeam"><span>Сформувати команду</span></button>
            <button
                type="button"
                class="randomizer__reset"
                :disabled="animating || (!randomizer.formedTeams.length && !randomizer.availableList.length)"
                @click="ask($event, 'Скинути пул і всі сформовані команди?', () => resetRandomizer(data))"
            >Скинути</button>
        </div>

        <div class="randomizer__import">
            <span>Додати з реєстрації (підтягне формат категорії):</span>
            <label v-for="c in CATEGORIES" :key="c" class="randomizer__radio">
                <input v-model="importCat" type="radio" :value="c">
                <span>{{ c }}</span>
            </label>
            <button type="button" class="fantasy-btn small thin" :disabled="animating" @click="addFromRegistration"><span>Додати в пул</span></button>
        </div>

        <section class="pool">
            <h2 class="randomizer__title">Пул гравців ({{ randomizer.availableList.length }})</h2>
            <div v-if="randomizer.availableList.length" class="pool__grid">
                <div
                    v-for="name in randomizer.availableList"
                    :key="name"
                    class="pool__cell"
                    :class="{ 'is-highlight': highlighted.has(name), 'is-removing': removing.has(name) }"
                >{{ name }}</div>
            </div>
            <p v-else class="randomizer__empty">Пул порожній — додай гравців з реєстрації</p>
        </section>

        <section v-if="randomizer.formedTeams.length">
            <div class="randomizer__formed-head">
                <h2 class="randomizer__title">Сформовані команди</h2>
                <button type="button" class="fantasy-btn small thin" @click="copyFormed"><span>Копіювати текстом</span></button>
            </div>
            <div class="formed">
                <div v-for="(team, index) in randomizer.formedTeams" :key="team.join('|')" class="formed__card">
                    <div class="formed__head">
                        <span>Команда {{ index + 1 }}</span>
                        <button type="button" title="Розформувати: гравці повернуться в пул" :disabled="animating" @click="disband($event, index)">✕</button>
                    </div>
                    <ul>
                        <li v-for="nick in team" :key="nick">{{ nick }}</li>
                    </ul>
                </div>
            </div>
        </section>
    </div>
</template>
<style scoped lang="scss">
.randomizer {
    display: flex;
    flex-direction: column;
    gap: 22px;
    color: #f8f8f8;
    font-family: "Candara", sans-serif;

    &__counters {
        display: flex;
        flex-wrap: wrap;
        gap: 14px;
    }

    &__actions,
    &__import {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-end;
        gap: 16px;
    }

    &__import {
        align-items: center;
        padding: 14px 16px;
        border: 1px solid rgba(93, 119, 144, 0.25);
        border-radius: 8px;
        background: rgba(23, 29, 43, 0.7);
        font-size: 14px;
    }

    &__radio {
        display: flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;

        input { accent-color: #fbd298; }
    }

    &__reset {
        padding: 8px 14px;
        border: 1px solid rgba(255, 138, 138, 0.4);
        border-radius: 5px;
        background: transparent;
        color: #ff8a8a;

        &:disabled { opacity: 0.4; }
    }

    &__title {
        margin: 0 0 12px;
        font-family: "VollkornSC", sans-serif;
        font-weight: 400;
        font-size: 22px;
    }

    &__formed-head {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
    }

    &__empty {
        margin: 0;
        color: rgba(248, 248, 248, 0.5);
    }
}

.counter {
    display: flex;
    align-items: baseline;
    gap: 8px;
    padding: 12px 18px;
    border: 1px solid rgba(93, 119, 144, 0.25);
    border-radius: 8px;
    background: #171d2b;

    strong {
        font-family: "VollkornSC", sans-serif;
        font-size: 30px;
        font-weight: 400;
        color: #fbd298;
    }

    span { color: rgba(248, 248, 248, 0.65); }
}

.field {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 13px;
    color: rgba(248, 248, 248, 0.6);

    select {
        padding: 8px 10px;
        border: 1px solid rgba(248, 248, 248, 0.15);
        border-radius: 5px;
        background: rgba(0, 0, 0, 0.45);
        color: #f8f8f8;
        font-size: 15px;
    }

    option { background: #171d2b; }
}

.pool__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 8px;
}

.pool__cell {
    padding: 10px;
    border: 1px solid rgba(93, 119, 144, 0.3);
    border-radius: 6px;
    background: #171d2b;
    text-align: center;
    overflow-wrap: anywhere;
    transition: all 0.2s ease;

    &.is-highlight {
        border-color: #fbd298;
        background: rgba(251, 210, 152, 0.2);
        color: #fbd298;
        transform: scale(1.04);
    }

    &.is-removing {
        opacity: 0;
        transform: scale(0.8);
        transition-duration: 0.5s;
    }
}

.formed {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;

    &__card {
        border: 1px solid rgba(251, 210, 152, 0.3);
        border-radius: 8px;
        background: #171d2b;
        overflow: hidden;

        ul {
            margin: 0;
            padding: 10px 14px;
            list-style: none;
        }

        li { padding: 3px 0; overflow-wrap: anywhere; }
    }

    &__head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background: rgba(251, 210, 152, 0.12);
        color: #fbd298;

        button {
            border: none;
            background: none;
            color: rgba(248, 248, 248, 0.6);

            &:hover { color: #ff8a8a; }
        }
    }
}
</style>
