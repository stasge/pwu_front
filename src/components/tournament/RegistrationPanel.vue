<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import {
    addSoloPlayer,
    addTeam,
    CATEGORIES,
    categoryByLevel,
    CLASSES,
    defaultLevelForCategory,
    FORMATS,
    formatLabel,
    isTeamReg,
    joinTeamField,
    playersPerTeam,
    removePlayer,
    removeTeam,
    setFormat,
    setTeamRegistration,
    slotCount,
    substitutePlayer,
    TEAM_FORMATS,
    TEAM_SLOTS,
    teamInTournament,
    type PlayerInput,
} from '@/tournament/logic'
import type { Category, Player, RegTeam, TournamentData } from '@/tournament/types'
import { useTournamentAction } from '@/composables/useTournamentAction'
import PvpCorners from './PvpCorners.vue'
import ScrollX from './ScrollX.vue'

const props = defineProps<{ data: TournamentData }>()

const { run, ask, copyText } = useTournamentAction()

/* ----- форма реєстрації ----- */
const bothSolo = computed(() => CATEGORIES.every((c) => !isTeamReg(props.data, c)))
const formCat = ref<Category | 'auto'>('auto')
const blankInput = (cat: Category): PlayerInput => ({ nick: '', class: CLASSES[0], level: defaultLevelForCategory(cat) })
const inputs = ref<PlayerInput[]>([blankInput('90-98')])

const resolvedCat = computed<Category>(() =>
    formCat.value === 'auto' ? categoryByLevel(inputs.value[0]?.level) : formCat.value
)
const teamMode = computed(() => isTeamReg(props.data, resolvedCat.value))
const formSize = computed(() => (teamMode.value ? playersPerTeam(props.data, resolvedCat.value) : 1))

const resetInputs = () => {
    inputs.value = Array.from({ length: formSize.value }, () => blankInput(resolvedCat.value))
}

watch(bothSolo, (solo) => {
    if (!solo && formCat.value === 'auto') formCat.value = '90-98'
}, { immediate: true })
watch(formSize, resetInputs)
watch(formCat, (cat) => {
    if (cat !== 'auto') inputs.value.forEach((i) => (i.level = defaultLevelForCategory(cat)))
})

const submit = () => {
    const cat = resolvedCat.value
    const ok = teamMode.value
        ? run(() => addTeam(props.data, cat, inputs.value), `Команду додано в ${cat}`)
        : run(() => addSoloPlayer(props.data, cat, inputs.value[0]), `Додано в ${cat}`)
    if (ok !== undefined) resetInputs()
}

/** Рядки таблиці з порожніми слотами, як у pvp-teams */
const teamSlots = (cat: Category) => Array.from({ length: TEAM_SLOTS }, (_, i) => props.data.teams[cat][i] ?? null)
const soloSlots = (cat: Category) =>
    Array.from({ length: slotCount(props.data, cat) }, (_, i): Player | null => props.data.players[cat][i] ?? null)

/* ----- заміна гравця ----- */
const sub = reactive({ cat: null as Category | null, teamId: '', outId: '', input: blankInput('90-98') })

const openSub = (cat: Category, team: RegTeam) => {
    if (sub.cat === cat && sub.teamId === team.id) {
        sub.cat = null
        return
    }
    const first = team.members[0]
    Object.assign(sub, { cat, teamId: team.id, outId: first?.id ?? '', input: { nick: '', class: first?.class ?? CLASSES[0], level: first?.level ?? defaultLevelForCategory(cat) } })
}

const onSubOutChange = (team: RegTeam) => {
    const outgoing = team.members.find((m) => m.id === sub.outId)
    if (!outgoing) return
    sub.input.class = outgoing.class
    sub.input.level = outgoing.level
}

const applySub = () => {
    if (!sub.cat) return
    const cat = sub.cat
    const inNick = sub.input.nick.trim()
    const outNick = run(
        () => substitutePlayer(props.data, cat, sub.teamId, sub.outId, sub.input),
        (out) => `Заміна: ${out} → ${inNick}`
    )
    if (outNick) sub.cat = null
}

const confirmRemoveTeam = (event: Event, cat: Category, team: RegTeam) => {
    const message = teamInTournament(props.data, cat, team.id)
        ? `Команда ${joinTeamField(team.members, 'nick')} уже грає в турнірі. Видалити її? Щоб замінити гравця, натисни ⇄.`
        : `Видалити команду ${joinTeamField(team.members, 'nick')}?`
    ask(event, message, () => run(() => removeTeam(props.data, cat, team.id)))
}
</script>
<template>
    <div>
        <form class="reg-form" @submit.prevent="submit">
            <template v-if="teamMode">
                <div class="reg-form__top">
                    <label class="field field--auto">
                        <span class="field__label">Категорія</span>
                        <select v-model="formCat" class="field__input">
                            <option v-for="c in CATEGORIES" :key="c" :value="c">{{ c }}{{ isTeamReg(data, c) ? ' · командна' : '' }}</option>
                        </select>
                    </label>
                    <p class="reg-form__hint">
                        Командна реєстрація <strong>{{ formatLabel(data, resolvedCat) }}</strong> — {{ formSize }} гравці одразу
                    </p>
                </div>
                <div v-for="(input, i) in inputs" :key="i" class="reg-member">
                    <div class="reg-member__label">Гравець {{ i + 1 }}</div>
                    <div class="reg-form__row">
                        <label class="field field--nick">
                            <span class="field__label">Нік</span>
                            <input v-model="input.nick" class="field__input" type="text" maxlength="32" autocomplete="off" required>
                        </label>
                        <label class="field field--class">
                            <span class="field__label">Клас</span>
                            <select v-model="input.class" class="field__input">
                                <option v-for="c in CLASSES" :key="c" :value="c">{{ c }}</option>
                            </select>
                        </label>
                        <label class="field field--level">
                            <span class="field__label">Рівень</span>
                            <input v-model.number="input.level" class="field__input" type="number" min="1" max="200" required>
                        </label>
                    </div>
                </div>
            </template>
            <div v-else class="reg-form__row">
                <label class="field field--nick">
                    <span class="field__label">Нік</span>
                    <input v-model="inputs[0].nick" class="field__input" type="text" maxlength="32" autocomplete="off" required>
                </label>
                <label class="field field--class">
                    <span class="field__label">Клас</span>
                    <select v-model="inputs[0].class" class="field__input">
                        <option v-for="c in CLASSES" :key="c" :value="c">{{ c }}</option>
                    </select>
                </label>
                <label class="field field--level">
                    <span class="field__label">Рівень</span>
                    <input v-model.number="inputs[0].level" class="field__input" type="number" min="1" max="200" required>
                </label>
                <label class="field">
                    <span class="field__label">Категорія</span>
                    <select v-model="formCat" class="field__input">
                        <option v-if="bothSolo" value="auto">Авто (за рівнем)</option>
                        <option v-for="c in CATEGORIES" :key="c" :value="c">{{ c }}{{ isTeamReg(data, c) ? ' · командна' : '' }}</option>
                    </select>
                </label>
            </div>
            <div class="reg-form__actions">
                <button type="submit" class="pvp-btn pvp-btn--sm"><span>{{ teamMode ? 'Додати команду' : 'Додати' }}</span></button>
            </div>
        </form>

        <div class="reg-columns__grid">
            <div v-for="cat in CATEGORIES" :key="cat" class="panel-card">
                <PvpCorners />
                <div class="panel-card__head">
                    <h2 class="panel-card__title">
                        <template v-if="isTeamReg(data, cat)">Зареєстровані {{ cat }} ({{ data.teams[cat].length }}/{{ TEAM_SLOTS }} · {{ formatLabel(data, cat) }})</template>
                        <template v-else>Зареєстровані гравці {{ cat }} ({{ data.players[cat].length }}/{{ slotCount(data, cat) }})</template>
                    </h2>
                    <div class="panel-card__actions">
                        <label class="reg-toggle">
                            <input type="checkbox" :checked="isTeamReg(data, cat)" @change="setTeamRegistration(data, cat, ($event.target as HTMLInputElement).checked)">
                            <span>Командна</span>
                        </label>
                        <label class="field field--auto">
                            <span class="field__label">{{ isTeamReg(data, cat) ? 'Формат' : 'Формат (8 команд)' }}</span>
                            <select class="field__input" :value="data.formats[cat]" @change="setFormat(data, cat, Number(($event.target as HTMLSelectElement).value))">
                                <option v-for="f in isTeamReg(data, cat) ? TEAM_FORMATS : FORMATS" :key="f.id" :value="f.id">
                                    {{ isTeamReg(data, cat) ? f.label : `${f.label} · ${TEAM_SLOTS * f.id} слотів` }}
                                </option>
                            </select>
                        </label>
                    </div>
                </div>

                <ScrollX>
                    <table v-if="isTeamReg(data, cat)" class="data-table data-table--teams">
                        <thead>
                            <tr>
                                <th class="col-num">№</th>
                                <th class="col-nick">ніки</th>
                                <th class="col-class">клас</th>
                                <th class="col-level">рівень</th>
                                <th class="col-check" title="Прийшов">✓</th>
                                <th class="col-actions"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for="(team, i) in teamSlots(cat)" :key="team?.id ?? `empty-${i}`">
                                <tr v-if="team">
                                    <td class="col-num">{{ i + 1 }}</td>
                                    <td class="col-nick">
                                        <span class="team-cell">
                                            <button type="button" class="team-copy-icon" title="Копіювати склад" @click="copyText(team.members.map((m) => m.nick).join('/'), 'Склад скопійовано')"><i class="pi pi-copy"></i></button>
                                            <span class="team-cell__name">
                                                <span class="team-stack"><span v-for="m in team.members" :key="m.id">{{ m.nick }}</span></span>
                                                <span v-if="team.substitutions?.length" class="team-subs">
                                                    <span v-for="(s, si) in team.substitutions" :key="si">заміна: {{ s.out.nick }} → {{ s.in.nick }}<br></span>
                                                </span>
                                            </span>
                                        </span>
                                    </td>
                                    <td class="col-class"><span class="team-stack"><span v-for="m in team.members" :key="m.id">{{ m.class }}</span></span></td>
                                    <td class="col-level"><span class="team-stack"><span v-for="m in team.members" :key="m.id">{{ m.level }}</span></span></td>
                                    <td class="col-check">
                                        <div class="team-stack team-stack--check">
                                            <div v-for="m in team.members" :key="m.id"><input v-model="m.arrived" class="reg-arrived" type="checkbox" title="Прийшов"></div>
                                        </div>
                                    </td>
                                    <td class="col-actions">
                                        <div class="row-actions">
                                            <button type="button" class="data-table__btn data-table__btn--sub" title="Заміна гравця" @click="openSub(cat, team)">⇄</button>
                                            <button type="button" class="data-table__btn" title="Видалити команду" @click="confirmRemoveTeam($event, cat, team)">✕</button>
                                        </div>
                                    </td>
                                </tr>
                                <tr v-else class="data-table__slot-empty">
                                    <td class="col-num">{{ i + 1 }}</td>
                                    <td colspan="5">&nbsp;</td>
                                </tr>
                                <tr v-if="team && sub.cat === cat && sub.teamId === team.id" class="sub-editor-row">
                                    <td colspan="6">
                                        <div class="sub-form">
                                            <span class="sub-form__title">Заміна гравця</span>
                                            <label class="field">
                                                <span class="field__label">Виходить</span>
                                                <select v-model="sub.outId" class="field__input" @change="onSubOutChange(team)">
                                                    <option v-for="m in team.members" :key="m.id" :value="m.id">{{ m.nick }} ({{ m.class }}, {{ m.level }})</option>
                                                </select>
                                            </label>
                                            <label class="field">
                                                <span class="field__label">Новий нік</span>
                                                <input v-model="sub.input.nick" class="field__input" type="text" maxlength="32" autocomplete="off">
                                            </label>
                                            <label class="field">
                                                <span class="field__label">Клас</span>
                                                <select v-model="sub.input.class" class="field__input">
                                                    <option v-for="c in CLASSES" :key="c" :value="c">{{ c }}</option>
                                                </select>
                                            </label>
                                            <label class="field field--level">
                                                <span class="field__label">Рівень</span>
                                                <input v-model.number="sub.input.level" class="field__input" type="number" min="1">
                                            </label>
                                            <div class="sub-form__actions">
                                                <button type="button" class="ghost-btn ghost-btn--accent" @click="applySub">Замінити</button>
                                                <button type="button" class="ghost-btn" @click="sub.cat = null">Скасувати</button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </tbody>
                    </table>

                    <table v-else class="data-table">
                        <thead>
                            <tr>
                                <th class="col-num">№</th>
                                <th class="col-nick">нік</th>
                                <th class="col-class">клас</th>
                                <th class="col-level">рівень</th>
                                <th class="col-check" title="Прийшов">✓</th>
                                <th class="col-actions"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for="(p, i) in soloSlots(cat)" :key="p?.id ?? `empty-${i}`">
                                <tr v-if="p">
                                    <td class="col-num">{{ i + 1 }}</td>
                                    <td class="col-nick">{{ p.nick }}</td>
                                    <td class="col-class">{{ p.class }}</td>
                                    <td class="col-level">{{ p.level }}</td>
                                    <td class="col-check"><input v-model="p.arrived" class="reg-arrived" type="checkbox" title="Прийшов"></td>
                                    <td class="col-actions">
                                        <button type="button" class="data-table__btn" title="Видалити" @click="ask($event, `Видалити ${p.nick}?`, () => removePlayer(data, cat, p.id))">✕</button>
                                    </td>
                                </tr>
                                <tr v-else class="data-table__slot-empty">
                                    <td class="col-num">{{ i + 1 }}</td>
                                    <td colspan="5">&nbsp;</td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </ScrollX>
            </div>
        </div>
    </div>
</template>
