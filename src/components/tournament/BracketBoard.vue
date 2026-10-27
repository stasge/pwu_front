<script setup lang="ts">
import { computed } from 'vue'
import { announceRoundLabel, boLabel, playersPerTeam, roundLabel } from '@/tournament/logic'
import type { Category, Match, TournamentData } from '@/tournament/types'
import BracketMatch from './BracketMatch.vue'
import PvpCorners from './PvpCorners.vue'
import ScrollX from './ScrollX.vue'

const props = defineProps<{
    data: TournamentData
    cat: Category
    editable?: boolean
}>()

const bracket = computed(() => props.data.tournaments[props.cat].bracket)
const total = computed(() => bracket.value?.rounds.length ?? 0)
const finalMatch = computed(() => bracket.value?.rounds[total.value - 1]?.[0] ?? null)

/** Ранні раунди, розбиті на пари матчів — між парою малюється «скоба» до наступного раунду */
const earlyRounds = computed(() =>
    (bracket.value?.rounds.slice(0, -1) ?? []).map((round) => {
        const pairs: Match[][] = []
        for (let i = 0; i < round.length; i += 2) pairs.push(round.slice(i, i + 2))
        return { bestOf: round[0]?.bestOf ?? 1, pairs }
    })
)
</script>
<template>
    <div v-if="bracket && finalMatch && !earlyRounds.length" class="panel-card finals-stage">
        <PvpCorners />
        <div class="finals-stage__block finals-stage__block--final">
            <div class="finals-stage__title">Фінал <small>{{ boLabel(finalMatch.bestOf) }}</small></div>
            <BracketMatch :data="data" :cat="cat" :match="finalMatch" stage="Фінал" :editable="editable" />
        </div>
        <div class="finals-stage__block finals-stage__block--third">
            <div class="finals-stage__title">Бій за 3 місце <small>{{ boLabel(bracket.thirdPlace.bestOf) }}</small></div>
            <BracketMatch :data="data" :cat="cat" :match="bracket.thirdPlace" stage="Бій за 3 місце" :editable="editable" />
        </div>
    </div>
    <div v-else-if="bracket && finalMatch" class="bracket" :class="`bracket--size-${playersPerTeam(data, cat)}`">
        <ScrollX>
        <div class="bracket__tree">
            <div v-for="(round, ri) in earlyRounds" :key="ri" class="bracket__col">
                <div class="bracket__col-body">
                    <div v-for="(pair, pi) in round.pairs" :key="pi" class="bracket__pair" :class="{ 'bracket__pair--solo': pair.length < 2 }">
                        <div v-for="(m, mi) in pair" :key="m.id" class="bracket__slot" :class="{ 'bracket__slot--titled': pi === 0 && mi === 0 }">
                            <div v-if="pi === 0 && mi === 0" class="bracket__round-title">{{ roundLabel(ri, total) }} · {{ boLabel(round.bestOf) }}</div>
                            <BracketMatch :data="data" :cat="cat" :match="m" :stage="announceRoundLabel(ri, total)" :editable="editable" />
                        </div>
                        <template v-if="pair.length === 2">
                            <span class="bracket__pair-stem" aria-hidden="true"></span>
                            <span class="bracket__pair-arrow" aria-hidden="true"></span>
                        </template>
                    </div>
                </div>
            </div>
            <div class="bracket__col bracket__col--finals">
                <div class="bracket__col-body bracket__col-body--finals">
                    <div class="bracket__final-block">
                        <div class="bracket__round-title bracket__round-title--accent">Фінал · {{ boLabel(finalMatch.bestOf) }}</div>
                        <BracketMatch :data="data" :cat="cat" :match="finalMatch" stage="Фінал" :editable="editable" />
                    </div>
                    <div class="bracket__third-block">
                        <div class="bracket__round-title bracket__round-title--accent">Бій за 3 місце · {{ boLabel(bracket.thirdPlace.bestOf) }}</div>
                        <BracketMatch :data="data" :cat="cat" :match="bracket.thirdPlace" stage="Бій за 3 місце" :editable="editable" />
                    </div>
                </div>
            </div>
        </div>
        </ScrollX>
    </div>
    <div v-else class="empty-state">Сітка ще не сформована</div>
</template>
