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
    <div class="bracket-match" :class="{ 'is-pending': !ready }">
        <div
            v-for="s in sides"
            :key="s.side"
            class="bracket-match__side"
            :class="{
                'is-winner': !!winner && winner === s.id,
                'is-bye': !s.id,
                'is-dq': isDisqualified(tour, s.id),
            }"
        >
            <span class="bracket-match__name" :title="s.name">{{ s.name }}</span>
            <div v-if="editable" class="bracket-match__scorebox">
                <button type="button" :disabled="!ready" aria-label="Менше" @click="run(() => stepBracketScore(tour, match, s.side, -1))">−</button>
                <input
                    type="text"
                    inputmode="numeric"
                    maxlength="1"
                    :value="s.score || '0'"
                    :disabled="!ready"
                    @change="onInput(s.side, $event)"
                >
                <button type="button" :disabled="!ready" aria-label="Більше" @click="run(() => stepBracketScore(tour, match, s.side, 1))">+</button>
            </div>
            <span v-else class="bracket-match__score">{{ ready ? s.score || '0' : '' }}</span>
        </div>
        <button
            v-if="editable"
            type="button"
            class="bracket-match__copy"
            title="Копіювати оголошення"
            @click="copyText(buildMatchAnnounce(data, cat, match, stage), 'Оголошення скопійовано')"
        ><i class="pi pi-copy"></i></button>
    </div>
</template>
<style scoped lang="scss">
.bracket-match {
    position: relative;
    width: 100%;
    border: 1px solid rgba(93, 119, 144, 0.35);
    border-radius: 6px;
    background: #171d2b;
    font-family: "Candara", sans-serif;
    font-size: 14px;
    color: #f8f8f8;

    &.is-pending { opacity: 0.75; }

    &__side {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        min-height: 38px;
        padding: 4px 8px 4px 10px;

        & + & { border-top: 1px solid rgba(93, 119, 144, 0.25); }

        &.is-winner {
            background: rgba(251, 210, 152, 0.1);

            .bracket-match__name,
            .bracket-match__score { color: #fbd298; }
        }

        &.is-bye .bracket-match__name { color: rgba(248, 248, 248, 0.4); }
        &.is-dq .bracket-match__name { text-decoration: line-through; opacity: 0.6; }
    }

    &__name {
        min-width: 0;
        overflow-wrap: anywhere;
    }

    &__score {
        flex-shrink: 0;
        min-width: 18px;
        text-align: right;
        font-size: 16px;
    }

    &__scorebox {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        gap: 2px;

        button, input {
            width: 26px;
            height: 26px;
            border: 1px solid rgba(248, 248, 248, 0.15);
            border-radius: 4px;
            background: rgba(0, 0, 0, 0.35);
            color: #f8f8f8;
            text-align: center;
            font-family: inherit;
            font-size: 14px;

            &:disabled { opacity: 0.35; }
        }

        button:not(:disabled):hover { color: #fbd298; }
    }

    &__copy {
        position: absolute;
        top: -11px;
        right: -11px;
        width: 24px;
        height: 24px;
        border: 1px solid rgba(248, 248, 248, 0.15);
        border-radius: 50%;
        background: #0f1420;
        color: rgba(248, 248, 248, 0.6);
        font-size: 11px;

        &:hover { color: #fbd298; }
    }
}
</style>
