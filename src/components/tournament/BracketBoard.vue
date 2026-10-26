<script setup lang="ts">
import { computed } from 'vue'
import { announceRoundLabel, boLabel, roundLabel } from '@/tournament/logic'
import type { Category, TournamentData } from '@/tournament/types'
import BracketMatch from './BracketMatch.vue'

const props = defineProps<{
    data: TournamentData
    cat: Category
    editable?: boolean
}>()

const bracket = computed(() => props.data.tournaments[props.cat].bracket)
const total = computed(() => bracket.value?.rounds.length ?? 0)
const earlyRounds = computed(() => bracket.value?.rounds.slice(0, -1) ?? [])
const finalMatch = computed(() => bracket.value?.rounds[total.value - 1]?.[0] ?? null)
</script>
<template>
    <div v-if="bracket && finalMatch" class="bracket">
        <div class="bracket__tree">
            <div v-for="(round, ri) in earlyRounds" :key="ri" class="bracket__col">
                <div class="bracket__title">{{ roundLabel(ri, total) }} · {{ boLabel(round[0]?.bestOf) }}</div>
                <div class="bracket__col-body">
                    <BracketMatch
                        v-for="m in round"
                        :key="m.id"
                        :data="data"
                        :cat="cat"
                        :match="m"
                        :stage="announceRoundLabel(ri, total)"
                        :editable="editable"
                    />
                </div>
            </div>
            <div class="bracket__col bracket__col--finals">
                <div class="bracket__title bracket__title--accent">Фінал · {{ boLabel(finalMatch.bestOf) }}</div>
                <div class="bracket__col-body bracket__col-body--finals">
                    <BracketMatch :data="data" :cat="cat" :match="finalMatch" stage="Фінал" :editable="editable" />
                    <div class="bracket__title bracket__title--accent bracket__title--third">
                        Бій за 3 місце · {{ boLabel(bracket.thirdPlace.bestOf) }}
                    </div>
                    <BracketMatch :data="data" :cat="cat" :match="bracket.thirdPlace" stage="Бій за 3 місце" :editable="editable" />
                </div>
            </div>
        </div>
    </div>
    <p v-else class="bracket-empty">Сітка ще не сформована</p>
</template>
<style scoped lang="scss">
.bracket {
    overflow-x: auto;
    padding: 12px 12px 8px 0;

    &__tree {
        display: flex;
        gap: 36px;
        min-width: max-content;
    }

    &__col {
        display: flex;
        flex-direction: column;
        width: 250px;
    }

    &__col-body {
        display: flex;
        flex: 1;
        flex-direction: column;
        justify-content: space-around;
        gap: 18px;

        &--finals { justify-content: center; }
    }

    &__title {
        margin-bottom: 10px;
        font-family: "VollkornSC", sans-serif;
        font-size: 16px;
        color: rgba(248, 248, 248, 0.65);

        &--accent { color: #fbd298; }
        &--third { margin: 16px 0 0; }
    }
}

.bracket-empty {
    margin: 0;
    color: rgba(248, 248, 248, 0.5);
    font-family: "Candara", sans-serif;
}
</style>
