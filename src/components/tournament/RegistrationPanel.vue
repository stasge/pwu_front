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
import type { Category, RegTeam, TournamentData } from '@/tournament/types'
import { useTournamentAction } from '@/composables/useTournamentAction'

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
    <div class="registration">
        <form class="reg-form" @submit.prevent="submit">
            <div class="reg-form__top">
                <label class="field">
                    <span>Категорія</span>
                    <select v-model="formCat">
                        <option v-if="bothSolo" value="auto">Авто (за рівнем)</option>
                        <option v-for="c in CATEGORIES" :key="c" :value="c">{{ c }}{{ isTeamReg(data, c) ? ' · командна' : '' }}</option>
                    </select>
                </label>
                <p v-if="teamMode" class="reg-form__hint">
                    Командна реєстрація <strong>{{ formatLabel(data, resolvedCat) }}</strong> — {{ formSize }} гравці одразу
                </p>
            </div>
            <div v-for="(input, i) in inputs" :key="i" class="reg-form__row">
                <span v-if="teamMode" class="reg-form__member">Гравець {{ i + 1 }}</span>
                <label class="field field--nick">
                    <span>Нік</span>
                    <input v-model="input.nick" type="text" maxlength="32" autocomplete="off" required>
                </label>
                <label class="field">
                    <span>Клас</span>
                    <select v-model="input.class">
                        <option v-for="c in CLASSES" :key="c" :value="c">{{ c }}</option>
                    </select>
                </label>
                <label class="field field--level">
                    <span>Рівень</span>
                    <input v-model.number="input.level" type="number" min="1" max="200" required>
                </label>
            </div>
            <button type="submit" class="fantasy-btn small thin reg-form__submit">
                <span>{{ teamMode ? 'Додати команду' : 'Додати' }}</span>
            </button>
        </form>

        <div class="reg-columns">
            <section v-for="cat in CATEGORIES" :key="cat" class="reg-card">
                <div class="reg-card__head">
                    <h2 class="reg-card__title">
                        <template v-if="isTeamReg(data, cat)">Команди {{ cat }} ({{ data.teams[cat].length }}/{{ TEAM_SLOTS }} · {{ formatLabel(data, cat) }})</template>
                        <template v-else>Гравці {{ cat }} ({{ data.players[cat].length }}/{{ slotCount(data, cat) }})</template>
                    </h2>
                    <div class="reg-card__controls">
                        <label class="reg-card__toggle">
                            <input type="checkbox" :checked="isTeamReg(data, cat)" @change="setTeamRegistration(data, cat, ($event.target as HTMLInputElement).checked)">
                            <span>Командна</span>
                        </label>
                        <select :value="data.formats[cat]" @change="setFormat(data, cat, Number(($event.target as HTMLSelectElement).value))">
                            <option v-for="f in isTeamReg(data, cat) ? TEAM_FORMATS : FORMATS" :key="f.id" :value="f.id">
                                {{ isTeamReg(data, cat) ? f.label : `${f.label} · ${TEAM_SLOTS * f.id} слотів` }}
                            </option>
                        </select>
                    </div>
                </div>

                <div class="reg-card__table-wrap">
                    <table class="reg-table">
                        <thead>
                            <tr>
                                <th class="num">№</th>
                                <th>{{ isTeamReg(data, cat) ? 'Ніки' : 'Нік' }}</th>
                                <th>Клас</th>
                                <th class="level">Рівень</th>
                                <th class="check" title="Прийшов">✓</th>
                                <th class="actions"></th>
                            </tr>
                        </thead>
                        <tbody v-if="isTeamReg(data, cat)">
                            <template v-for="(team, i) in data.teams[cat]" :key="team.id">
                                <tr>
                                    <td class="num">{{ i + 1 }}</td>
                                    <td>
                                        <div v-for="m in team.members" :key="m.id">{{ m.nick }}</div>
                                        <div v-for="(s, si) in team.substitutions ?? []" :key="si" class="reg-table__sub">заміна: {{ s.out.nick }} → {{ s.in.nick }}</div>
                                    </td>
                                    <td><div v-for="m in team.members" :key="m.id">{{ m.class }}</div></td>
                                    <td class="level"><div v-for="m in team.members" :key="m.id">{{ m.level }}</div></td>
                                    <td class="check"><div v-for="m in team.members" :key="m.id"><input v-model="m.arrived" type="checkbox" title="Прийшов"></div></td>
                                    <td class="actions">
                                        <div class="row-actions">
                                            <button type="button" title="Копіювати склад" @click="copyText(team.members.map((m) => m.nick).join('/'), 'Склад скопійовано')"><i class="pi pi-copy"></i></button>
                                            <button type="button" title="Заміна гравця" @click="openSub(cat, team)">⇄</button>
                                            <button type="button" class="danger" title="Видалити команду" @click="confirmRemoveTeam($event, cat, team)"><i class="pi pi-trash"></i></button>
                                        </div>
                                    </td>
                                </tr>
                                <tr v-if="sub.cat === cat && sub.teamId === team.id" class="reg-table__sub-row">
                                    <td colspan="6">
                                        <div class="sub-form">
                                            <span class="sub-form__title">Заміна гравця</span>
                                            <label class="field">
                                                <span>Виходить</span>
                                                <select v-model="sub.outId" @change="onSubOutChange(team)">
                                                    <option v-for="m in team.members" :key="m.id" :value="m.id">{{ m.nick }} ({{ m.class }}, {{ m.level }})</option>
                                                </select>
                                            </label>
                                            <label class="field field--nick">
                                                <span>Новий нік</span>
                                                <input v-model="sub.input.nick" type="text" maxlength="32" autocomplete="off">
                                            </label>
                                            <label class="field">
                                                <span>Клас</span>
                                                <select v-model="sub.input.class">
                                                    <option v-for="c in CLASSES" :key="c" :value="c">{{ c }}</option>
                                                </select>
                                            </label>
                                            <label class="field field--level">
                                                <span>Рівень</span>
                                                <input v-model.number="sub.input.level" type="number" min="1">
                                            </label>
                                            <div class="sub-form__actions">
                                                <button type="button" class="fantasy-btn small thin" @click="applySub"><span>Замінити</span></button>
                                                <button type="button" class="link-btn" @click="sub.cat = null">Скасувати</button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                            <tr v-if="!data.teams[cat].length"><td colspan="6" class="reg-table__empty">Команд ще немає</td></tr>
                        </tbody>
                        <tbody v-else>
                            <tr v-for="(p, i) in data.players[cat]" :key="p.id">
                                <td class="num">{{ i + 1 }}</td>
                                <td>{{ p.nick }}</td>
                                <td>{{ p.class }}</td>
                                <td class="level">{{ p.level }}</td>
                                <td class="check"><input v-model="p.arrived" type="checkbox" title="Прийшов"></td>
                                <td class="actions">
                                    <div class="row-actions">
                                        <button type="button" class="danger" title="Видалити" @click="ask($event, `Видалити ${p.nick}?`, () => removePlayer(data, cat, p.id))"><i class="pi pi-trash"></i></button>
                                    </div>
                                </td>
                            </tr>
                            <tr v-if="!data.players[cat].length"><td colspan="6" class="reg-table__empty">Гравців ще немає</td></tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    </div>
</template>
<style scoped lang="scss">
.registration {
    display: flex;
    flex-direction: column;
    gap: 24px;
    color: #f8f8f8;
    font-family: "Candara", sans-serif;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 13px;
    color: rgba(248, 248, 248, 0.6);

    &--nick { flex: 1 1 180px; }
    &--level { width: 90px; }
}

input[type="text"],
input[type="number"],
select {
    padding: 8px 10px;
    border: 1px solid rgba(248, 248, 248, 0.15);
    border-radius: 5px;
    background: rgba(0, 0, 0, 0.45);
    color: #f8f8f8;
    font-family: "Candara", sans-serif;
    font-size: 15px;
    outline: none;

    &:focus { border-color: rgba(251, 210, 152, 0.6); }
}

option { background: #171d2b; }

input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: #fbd298;
}

.reg-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 18px;
    border: 1px solid rgba(93, 119, 144, 0.25);
    border-radius: 8px;
    background: rgba(23, 29, 43, 0.7);

    &__top {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-end;
        gap: 16px;
    }

    &__hint {
        margin: 0 0 8px;
        font-size: 14px;
        color: rgba(248, 248, 248, 0.7);
    }

    &__row {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-end;
        gap: 12px;
    }

    &__member {
        width: 100%;
        font-size: 13px;
        color: #fbd298;
    }

    &__submit { align-self: flex-start; margin-top: 4px; }
}

.reg-columns {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 520px), 1fr));
    gap: 18px;
}

.reg-card {
    min-width: 0;
    padding: 18px;
    border: 1px solid rgba(93, 119, 144, 0.25);
    border-radius: 8px;
    background: #171d2b;

    &__head {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
    }

    &__title {
        margin: 0;
        font-family: "VollkornSC", sans-serif;
        font-weight: 400;
        font-size: 20px;
    }

    &__controls {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    &__toggle {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
        cursor: pointer;
    }

    &__table-wrap { overflow-x: auto; }
}

.reg-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;

    th, td {
        padding: 8px 6px;
        border-bottom: 1px solid rgba(93, 119, 144, 0.2);
        text-align: left;
        vertical-align: top;
    }

    th {
        font-weight: 400;
        color: rgba(248, 248, 248, 0.55);
    }

    td > div { min-height: 22px; }

    .num { width: 32px; }
    .level { width: 60px; }
    .check { width: 32px; text-align: center; }
    .actions { width: 1%; }

    &__sub {
        font-size: 12px;
        color: #ffb74d;
    }

    &__sub-row td { background: rgba(0, 0, 0, 0.25); }

    &__empty {
        text-align: center !important;
        color: rgba(248, 248, 248, 0.5);
    }
}

.row-actions {
    display: flex;
    gap: 4px;

    button {
        width: 30px;
        height: 30px;
        border: 1px solid rgba(248, 248, 248, 0.15);
        border-radius: 5px;
        background: rgba(248, 248, 248, 0.05);
        color: #fbd298;

        &:hover { background: rgba(248, 248, 248, 0.12); }
        &.danger { color: #ff8a8a; }
    }
}

.sub-form {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 10px;

    &__title {
        width: 100%;
        color: #fbd298;
    }

    &__actions {
        display: flex;
        align-items: center;
        gap: 14px;
    }
}

.link-btn {
    border: none;
    background: none;
    color: rgba(248, 248, 248, 0.6);
    text-decoration: underline;
}
</style>
