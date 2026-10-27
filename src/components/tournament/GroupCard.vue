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
    pointlessGroupMatchIds,
    removeGroupMatch,
    randomizeTiebreak,
    resolveTiebreakOrder,
    teamLabel,
    teamRosterText,
    tiebreakTitle,
    undoDisqualification,
} from '@/tournament/logic'
import type { Category, Match, Tiebreak, TournamentData } from '@/tournament/types'
import { useTournamentAction } from '@/composables/useTournamentAction'
import MatchPick from './MatchPick.vue'
import PvpCorners from './PvpCorners.vue'

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
const pointless = computed(() => pointlessGroupMatchIds(tour.value, group.value))
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

const removeMatch = (event: Event, match: Match) =>
    ask(event, `Бій ${label(match.p1)} vs ${label(match.p2)} ні на що не впливає: обидві команди потраплять туди ж за будь-якого результату. Видалити його?`, () =>
        run(() => removeGroupMatch(tour.value, group.value, match.id), 'Бій видалено')
    )

const randomNote = (tb: Tiebreak) =>
    tb.randomOrder && resolveTiebreakOrder(tb).order ? describeRandomPlacement(props.data, props.cat, group.value, tb) : []
</script>
<template>
    <div class="panel-card">
        <PvpCorners />
        <h3 class="group-title">Група {{ group.name }}</h3>

        <table class="data-table standings-table">
            <thead>
                <tr>
                    <th class="col-num">#</th>
                    <th class="col-nick">команда</th>
                    <th class="col-stat" title="Перемоги">В</th>
                    <th class="col-stat" title="Поразки">П</th>
                    <th class="col-stat">бали</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(row, i) in standings" :key="row.id" :class="{ 'is-dq': row.dq }">
                    <td class="col-num">{{ row.dq ? '—' : i + 1 }}</td>
                    <td class="col-nick">
                        <span class="standings-team">
                            <span class="team-cell">
                                <button
                                    v-if="editable"
                                    type="button"
                                    class="team-copy-icon"
                                    title="Копіювати склад"
                                    @click="copyText(teamRosterText(data, cat, row.id), 'Склад скопійовано')"
                                ><i class="pi pi-copy"></i></button>
                                <span class="team-cell__name">{{ label(row.id) }}</span>
                            </span>
                            <span v-if="row.dq" class="dq-tag">дискв.</span>
                            <button
                                v-if="editable"
                                type="button"
                                class="dq-btn"
                                :title="row.dq ? 'Зняти дискваліфікацію' : 'Дискваліфікувати команду'"
                                @click="toggleDq($event, row.id, row.dq)"
                            >{{ row.dq ? '↺' : 'DQ' }}</button>
                        </span>
                    </td>
                    <td class="col-stat">{{ row.wins }}</td>
                    <td class="col-stat">{{ row.losses }}</td>
                    <td class="col-stat">{{ row.wins }}</td>
                </tr>
            </tbody>
        </table>

        <div class="group-matches">
            <MatchPick
                v-for="m in mainMatches"
                :key="m.id"
                :data="data"
                :cat="cat"
                :match="m"
                :editable="editable"
                :pointless="pointless.has(m.id)"
                @pick="(side) => run(() => pickGroupWinner(tour, group, m, side))"
                @copy="copyMatch(m, `Група ${group.name}`)"
                @remove="(event) => removeMatch(event, m)"
            />
            <div v-if="!mainMatches.length" class="empty-state">Немає матчів</div>
            <p v-if="editable && pointless.size" class="tiebreak-note pointless-note">Позначені бої «не впливає» можна не грати — їхній результат не змінить, хто куди проходить.</p>
        </div>

        <div v-for="tb in tiebreaks" :key="tb.id" class="tiebreak-card">
            <div class="tiebreak-card__head">
                <h4 class="tiebreak-card__title">{{ tiebreakTitle(tour, group, tb) }}</h4>
                <button
                    v-if="editable && resolveTiebreakOrder(tb).needsRandom"
                    type="button"
                    class="ghost-btn ghost-btn--accent"
                    @click="run(() => randomizeTiebreak(tb), 'Порядок зарандомено')"
                >Зарандомити місця</button>
            </div>
            <p v-if="!editable && resolveTiebreakOrder(tb).needsRandom" class="tiebreak-note">Місця визначаться рандомом</p>
            <div class="group-matches">
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
            <p v-if="randomNote(tb).length" class="tiebreak-note tiebreak-note--result">
                <strong>Рандом:</strong>
                <span v-for="line in randomNote(tb)" :key="line"><br>{{ line }}</span>
            </p>
        </div>
    </div>
</template>
