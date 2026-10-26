<script setup lang="ts">
import { computed } from 'vue'
import { resolveMatchWinner, teamLabel } from '@/tournament/logic'
import type { Category, Match, TournamentData } from '@/tournament/types'

/** Груповий BO1-бій: адмін клікає по команді-переможцю */
const props = defineProps<{
    data: TournamentData
    cat: Category
    match: Match
    editable?: boolean
}>()

const emit = defineEmits<{
    pick: [side: 1 | 2]
    copy: []
}>()

const winner = computed(() => resolveMatchWinner(props.match))
const played = computed(() => !!winner.value)

const sideClass = (id: string | null) => ({
    'is-winner': !!winner.value && winner.value === id,
    'is-loser': !!winner.value && winner.value !== id,
})
</script>
<template>
    <div class="match-pick">
        <component
            :is="editable ? 'button' : 'div'"
            class="match-pick__team"
            :class="sideClass(match.p1)"
            :type="editable ? 'button' : undefined"
            @click="editable && emit('pick', 1)"
        >{{ teamLabel(data, cat, match.p1) }}</component>
        <div class="match-pick__meta">
            <span class="bo-tag">BO1</span>
            <span class="match-pick__score">{{ played ? `${match.score1 || 0}:${match.score2 || 0}` : '—' }}</span>
            <span v-if="match.forfeit" class="forfeit-tag" title="Технічна перемога (дискваліфікація)">тех.</span>
        </div>
        <component
            :is="editable ? 'button' : 'div'"
            class="match-pick__team match-pick__team--right"
            :class="sideClass(match.p2)"
            :type="editable ? 'button' : undefined"
            @click="editable && emit('pick', 2)"
        >{{ teamLabel(data, cat, match.p2) }}</component>
        <button v-if="editable" type="button" class="match-pick__copy" title="Копіювати оголошення" @click="emit('copy')">
            <i class="pi pi-copy"></i>
        </button>
    </div>
</template>
<style scoped lang="scss">
.match-pick {
    display: grid;
    grid-template-columns: 1fr auto 1fr auto;
    align-items: stretch;
    gap: 6px;
    font-family: "Candara", sans-serif;
    font-size: 14px;

    &__team {
        min-width: 0;
        padding: 8px 10px;
        border: 1px solid rgba(248, 248, 248, 0.1);
        border-radius: 5px;
        background: rgba(0, 0, 0, 0.25);
        color: #f8f8f8;
        text-align: left;
        overflow-wrap: anywhere;
        transition: background 0.2s ease, border-color 0.2s ease;

        &--right { text-align: right; }

        &.is-winner {
            border-color: rgba(251, 210, 152, 0.6);
            background: rgba(251, 210, 152, 0.12);
            color: #fbd298;
        }

        &.is-loser { opacity: 0.5; }
    }

    button.match-pick__team:hover { background: rgba(248, 248, 248, 0.08); }

    &__meta {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 2px;
        min-width: 44px;
    }

    &__score { color: #fbd298; }

    &__copy {
        width: 30px;
        border: 1px solid rgba(248, 248, 248, 0.12);
        border-radius: 5px;
        background: rgba(248, 248, 248, 0.04);
        color: rgba(248, 248, 248, 0.6);

        &:hover { color: #fbd298; }
    }

    @media (max-width: 576px) {
        grid-template-columns: 1fr auto 1fr;

        &__copy { display: none; }
    }
}

.bo-tag {
    font-size: 11px;
    color: rgba(248, 248, 248, 0.45);
}

.forfeit-tag {
    font-size: 11px;
    color: #ffb74d;
}
</style>
