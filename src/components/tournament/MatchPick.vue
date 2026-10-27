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
    <div class="match-pick" :class="{ 'match-pick--readonly': !editable }">
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
        <button v-if="editable" type="button" class="match-copy-btn" title="Копіювати оголошення" @click="emit('copy')">
            <i class="pi pi-copy"></i>
        </button>
    </div>
</template>
