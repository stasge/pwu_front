<script setup lang="ts">
import { computed } from 'vue'
import {
    buildMatchAnnounce,
    describeRandomPlacement,
    disqualifyTeam,
    groupStandings,
    mainGroupFullyPlayed,
    pickGroupWinner,
    pickTiebreakWinner,
    randomizeTiebreak,
    resolveTiebreakOrder,
    teamLabel,
    tiebreakTitle,
    undoDisqualification,
} from '@/tournament/logic'
import type { Category, Match, Tiebreak, TournamentData } from '@/tournament/types'
import { useTournamentAction } from '@/composables/useTournamentAction'
import MatchPick from './MatchPick.vue'

const props = defineProps<{
    data: TournamentData
    cat: Category
    groupIndex: number
    editable?: boolean
}>()

const { run, ask, copyText } = useTournamentAction()

const tour = computed(() => props.data.tournaments[props.cat])
const group = computed(() => tour.value.groups[props.groupIndex])
const standings = computed(() => groupStandings(tour.value, group.value, { includeTiebreaks: true }))
const mainMatches = computed(() => group.value.matches.filter((m) => !m.tiebreak))
const tiebreaks = computed(() => (mainGroupFullyPlayed(group.value) ? group.value.tiebreaks : []))

const label = (id: string | null) => teamLabel(props.data, props.cat, id)

const copyMatch = (match: Match, stage: string) =>
    copyText(buildMatchAnnounce(props.data, props.cat, match, stage), 'Оголошення скопійовано')

const toggleDq = (event: Event, id: string, dq?: boolean) => {
    if (dq) {
        ask(event, `Зняти дискваліфікацію з ${label(id)}? Технічні результати за її участі буде скинуто — ці бої треба буде зіграти.`, () =>
            run(() => undoDisqualification(tour.value, id), `Дискваліфікацію з ${label(id)} знято`)
        )
        return
    }
    ask(event, `Дискваліфікувати ${label(id)}? Зіграні результати лишаться, незіграні бої стануть технічними перемогами суперників.`, () =>
        run(
            () => disqualifyTeam(tour.value, id),
            (forfeits) => `${label(id)} дискваліфіковано${forfeits ? ` · техн. перемог у групі: ${forfeits}` : ''}`
        )
    )
}

const randomNote = (tb: Tiebreak) =>
    tb.randomOrder && resolveTiebreakOrder(tb).order ? describeRandomPlacement(props.data, props.cat, group.value, tb) : []
</script>
<template>
    <div class="group-card">
        <h3 class="group-card__title">Група {{ group.name }}</h3>

        <div class="group-card__table-wrap">
            <table class="group-card__table">
                <thead>
                    <tr>
                        <th class="num">#</th>
                        <th>Команда</th>
                        <th class="stat" title="Перемоги">В</th>
                        <th class="stat" title="Поразки">П</th>
                        <th class="stat">Бали</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, i) in standings" :key="row.id" :class="{ 'is-dq': row.dq }">
                        <td class="num">{{ row.dq ? '—' : i + 1 }}</td>
                        <td>
                            <div class="group-card__team">
                                <span>{{ label(row.id) }}</span>
                                <span v-if="row.dq" class="dq-tag">дискв.</span>
                                <button
                                    v-if="editable"
                                    type="button"
                                    class="dq-btn"
                                    :title="row.dq ? 'Зняти дискваліфікацію' : 'Дискваліфікувати команду'"
                                    @click="toggleDq($event, row.id, row.dq)"
                                >{{ row.dq ? '↺' : 'DQ' }}</button>
                            </div>
                        </td>
                        <td class="stat">{{ row.wins }}</td>
                        <td class="stat">{{ row.losses }}</td>
                        <td class="stat stat--accent">{{ row.wins }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="group-card__matches">
            <MatchPick
                v-for="m in mainMatches"
                :key="m.id"
                :data="data"
                :cat="cat"
                :match="m"
                :editable="editable"
                @pick="(side) => run(() => pickGroupWinner(tour, group, m, side))"
                @copy="copyMatch(m, `Група ${group.name}`)"
            />
            <p v-if="!mainMatches.length" class="group-card__empty">Немає матчів</p>
        </div>

        <div v-for="tb in tiebreaks" :key="tb.id" class="tiebreak">
            <div class="tiebreak__head">
                <h4 class="tiebreak__title">{{ tiebreakTitle(tour, group, tb) }}</h4>
                <button
                    v-if="editable && resolveTiebreakOrder(tb).needsRandom"
                    type="button"
                    class="fantasy-btn small thin"
                    @click="run(() => randomizeTiebreak(tb), 'Порядок зарандомено')"
                ><span>Зарандомити місця</span></button>
            </div>
            <p v-if="!editable && resolveTiebreakOrder(tb).needsRandom" class="tiebreak__note">Місця визначаться рандомом</p>
            <div class="group-card__matches">
                <MatchPick
                    v-for="m in tb.matches"
                    :key="m.id"
                    :data="data"
                    :cat="cat"
                    :match="m"
                    :editable="editable"
                    @pick="(side) => run(() => pickTiebreakWinner(tb, m, side))"
                    @copy="copyMatch(m, 'Перегравання')"
                />
            </div>
            <p v-if="randomNote(tb).length" class="tiebreak__note">
                <strong>Рандом:</strong>
                <span v-for="line in randomNote(tb)" :key="line"><br>{{ line }}</span>
            </p>
        </div>
    </div>
</template>
<style scoped lang="scss">
.group-card {
    padding: 18px;
    border: 1px solid rgba(93, 119, 144, 0.25);
    border-radius: 8px;
    background: #171d2b;
    color: #f8f8f8;
    font-family: "Candara", sans-serif;

    &__title {
        margin: 0 0 12px;
        font-family: "VollkornSC", sans-serif;
        font-weight: 400;
        font-size: 22px;
        color: #fbd298;
    }

    &__table-wrap { overflow-x: auto; }

    &__table {
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;

        th, td {
            padding: 8px;
            border-bottom: 1px solid rgba(93, 119, 144, 0.2);
            text-align: left;
        }

        th {
            font-weight: 400;
            color: rgba(248, 248, 248, 0.55);
        }

        .num { width: 32px; }
        .stat { width: 48px; text-align: center; }
        .stat--accent { color: #fbd298; }

        tr.is-dq td { opacity: 0.45; }
    }

    &__team {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 6px;
        overflow-wrap: anywhere;
    }

    &__matches {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-top: 14px;
    }

    &__empty {
        margin: 0;
        color: rgba(248, 248, 248, 0.5);
    }
}

.dq-tag {
    padding: 1px 6px;
    border-radius: 99px;
    background: rgba(255, 138, 138, 0.15);
    color: #ff8a8a;
    font-size: 11px;
}

.dq-btn {
    margin-left: auto;
    padding: 2px 6px;
    border: 1px solid rgba(255, 138, 138, 0.35);
    border-radius: 4px;
    background: transparent;
    color: #ff8a8a;
    font-size: 11px;
    opacity: 1 !important;

    &:hover { background: rgba(255, 138, 138, 0.12); }
}

.tiebreak {
    margin-top: 18px;
    padding-top: 14px;
    border-top: 1px dashed rgba(251, 210, 152, 0.3);

    &__head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
    }

    &__title {
        margin: 0;
        font-weight: 400;
        font-size: 16px;
        color: #ffb74d;
    }

    &__note {
        margin: 10px 0 0;
        font-size: 13px;
        color: rgba(248, 248, 248, 0.7);
    }
}
</style>
