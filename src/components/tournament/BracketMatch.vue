<script setup lang="ts">
import { computed } from 'vue'
import {
    buildMatchAnnounce,
    isDisqualified,
    resolveMatchWinner,
    setBracketScore,
    stepBracketScore,
    teamLabel,
} from '@/tournament/logic'
import type { Category, Match, TournamentData } from '@/tournament/types'
import { useTournamentAction } from '@/composables/useTournamentAction'

const props = defineProps<{
    data: TournamentData
    cat: Category
    match: Match
    /** стадія для оголошення в чат */
    stage: string
    editable?: boolean
}>()

const { run, copyText } = useTournamentAction()

const tour = computed(() => props.data.tournaments[props.cat])
const winner = computed(() => resolveMatchWinner(props.match))
const ready = computed(() => !!props.match.p1 && !!props.match.p2)

const sides = computed(() => {
    const { p1, p2 } = props.match
    return [
        { side: 1 as const, id: p1, name: p1 ? teamLabel(props.data, props.cat, p1) : p2 ? '—' : 'TBD', score: props.match.score1 },
        { side: 2 as const, id: p2, name: p2 ? teamLabel(props.data, props.cat, p2) : p1 ? 'bye' : 'TBD', score: props.match.score2 },
    ]
})

const onInput = (side: 1 | 2, event: Event) => {
    const input = event.target as HTMLInputElement
    const ok = run(() => {
        setBracketScore(tour.value, props.match, side, input.value)
        return true
    })
    if (!ok) input.value = String((side === 1 ? props.match.score1 : props.match.score2) || 0)
}
</script>
<template>
    <div class="bracket-match-wrap">
        <button
            v-if="editable"
            type="button"
            class="match-copy-btn"
            title="Копіювати оголошення"
            @click="copyText(buildMatchAnnounce(data, cat, match, stage), 'Оголошення скопійовано')"
        ><i class="pi pi-copy"></i></button>
        <div class="bracket-match">
            <div v-for="s in sides" :key="s.side" class="bracket-match__side" :class="{ 'is-winner': !!winner && winner === s.id }">
                <div
                    class="bracket-match__name"
                    :class="{
                        'is-winner': !!winner && winner === s.id,
                        'is-bye': !s.id,
                        'is-dq': isDisqualified(tour, s.id),
                    }"
                    :title="s.name"
                >{{ s.name }}</div>
                <div v-if="editable" class="bracket-match__scorebox">
                    <button type="button" class="bracket-match__step" :disabled="!ready" aria-label="Менше" @click="run(() => stepBracketScore(tour, match, s.side, -1))">−</button>
                    <input
                        class="bracket-match__score"
                        type="text"
                        inputmode="numeric"
                        maxlength="1"
                        :value="s.score || '0'"
                        :disabled="!ready"
                        @change="onInput(s.side, $event)"
                    >
                    <button type="button" class="bracket-match__step" :disabled="!ready" aria-label="Більше" @click="run(() => stepBracketScore(tour, match, s.side, 1))">+</button>
                </div>
                <div v-else class="bracket-match__scorebox bracket-match__scorebox--readonly">{{ ready ? s.score || '0' : '' }}</div>
            </div>
        </div>
    </div>
</template>
