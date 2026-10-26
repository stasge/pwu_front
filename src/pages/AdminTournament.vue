<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { useAsyncCallWrapper } from '@/composables/useAsyncCallWrapper'
import { adminGetTournament, adminSaveTournament, TOURNAMENT_STATUS_LABELS, type TournamentSnapshot } from '@/tournament/api'
import { CATEGORIES, createDefaultState, normalizeData } from '@/tournament/logic'
import type { TournamentData, TournamentStatus } from '@/tournament/types'
import RegistrationPanel from '@/components/tournament/RegistrationPanel.vue'
import RandomizerPanel from '@/components/tournament/RandomizerPanel.vue'
import CategoryBoard from '@/components/tournament/CategoryBoard.vue'

const SAVE_DELAY_MS = 400
const RETRY_DELAY_MS = 5000
const STATUSES: TournamentStatus[] = ['draft', 'live', 'finished']

const toast = useToast()
const { wrapAsyncCall } = useAsyncCallWrapper()

const data = ref<TournamentData>(createDefaultState())
const status = ref<TournamentStatus>('draft')
const version = ref(0)
const loaded = ref(false)
const tab = ref<'register' | 'teams' | (typeof CATEGORIES)[number]>('register')

type SaveState = 'saved' | 'pending' | 'saving' | 'error'
const saveState = ref<SaveState>('saved')
const savedAt = ref<string | null>(null)
let applying = false
let saving = false
let dirty = false
/** остання спроба збереження впала — не спамимо тостами на ретраях */
let failing = false
let saveTimer: ReturnType<typeof setTimeout> | undefined

const saveLabel = computed(() => {
    if (saveState.value === 'pending' || saveState.value === 'saving') return 'Зберігаю…'
    if (saveState.value === 'error') return '⚠ Не збережено — повторю спробу'
    return savedAt.value ? `Збережено · ${savedAt.value}` : 'Збережено'
})

const applySnapshot = async (snapshot: TournamentSnapshot) => {
    applying = true
    data.value = normalizeData(snapshot.state)
    status.value = snapshot.status
    version.value = snapshot.version
    await nextTick()
    applying = false
}

const scheduleSave = (delay = SAVE_DELAY_MS) => {
    clearTimeout(saveTimer)
    saveTimer = setTimeout(flush, delay)
}

const flush = async () => {
    if (saving || !dirty) return
    saving = true
    dirty = false
    saveState.value = 'saving'
    try {
        const saved = await adminSaveTournament(JSON.parse(JSON.stringify(data.value)), status.value, version.value)
        version.value = saved.version
        savedAt.value = new Date().toLocaleTimeString('uk-UA')
        saveState.value = 'saved'
        failing = false
    } catch (e: any) {
        if (e?.response?.status === 409 && e.data?.data) {
            toast.error('Турнір змінили в іншій вкладці — завантажено актуальну версію')
            dirty = false
            await applySnapshot(e.data.data)
            saveState.value = 'saved'
        } else {
            if (!failing) toast.error('Не вдалося зберегти турнір')
            failing = true
            dirty = true
            saveState.value = 'error'
            scheduleSave(RETRY_DELAY_MS)
        }
    } finally {
        saving = false
        if (dirty && !failing) scheduleSave()
    }
}

watch([data, status], () => {
    if (applying || !loaded.value) return
    dirty = true
    if (!failing) saveState.value = 'pending'
    scheduleSave()
}, { deep: true })

const warnUnsaved = (e: BeforeUnloadEvent) => {
    if (dirty || saving) e.preventDefault()
}

onMounted(async () => {
    window.addEventListener('beforeunload', warnUnsaved)
    const snapshot = await wrapAsyncCall<TournamentSnapshot>(adminGetTournament)
    if (!snapshot) return
    await applySnapshot(snapshot)
    loaded.value = true
})

onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', warnUnsaved)
    if (dirty) flush()
})
</script>
<template>
    <div class="admin-tournament">
        <div class="admin-tournament__header">
            <h1 class="admin-tournament__title">Керування турніром</h1>
            <router-link :to="{ name: 'tournament' }" target="_blank" class="fantasy-btn small thin px-3">
                <span>Сторінка перегляду</span>
            </router-link>
        </div>

        <div v-if="loaded" class="admin-tournament__bar">
            <div class="status-switch" role="radiogroup" aria-label="Статус турніру">
                <button
                    v-for="s in STATUSES"
                    :key="s"
                    type="button"
                    role="radio"
                    :aria-checked="status === s"
                    class="status-switch__btn"
                    :class="[`status-switch__btn--${s}`, { 'is-active': status === s }]"
                    @click="status = s"
                >{{ TOURNAMENT_STATUS_LABELS[s] }}</button>
            </div>
            <p class="admin-tournament__status-hint">
                <template v-if="status === 'draft'">Глядачі турнір не бачать.</template>
                <template v-else-if="status === 'live'">Глядачі бачать турнір наживо, на головній горить віджет.</template>
                <template v-else>Глядачі бачать підсумки, віджет на головній вимкнено.</template>
            </p>
            <span class="admin-tournament__save" :class="`is-${saveState}`">{{ saveLabel }}</span>
        </div>

        <template v-if="loaded">
            <nav class="tabs" aria-label="Розділи">
                <button type="button" :class="{ 'is-active': tab === 'register' }" @click="tab = 'register'">Реєстрація</button>
                <button type="button" :class="{ 'is-active': tab === 'teams' }" @click="tab = 'teams'">Команди</button>
                <button v-for="c in CATEGORIES" :key="c" type="button" :class="{ 'is-active': tab === c }" @click="tab = c">{{ c }}</button>
            </nav>

            <RegistrationPanel v-if="tab === 'register'" :data="data" />
            <RandomizerPanel v-else-if="tab === 'teams'" :data="data" />
            <CategoryBoard v-else :key="tab" :data="data" :cat="tab" editable />
        </template>
    </div>
</template>
<style scoped lang="scss">
.admin-tournament {
    width: 95%;
    max-width: 1400px;
    color: #f8f8f8;

    &__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 20px;
        margin-bottom: 20px;
    }

    &__title {
        margin: 0;
        font-size: clamp(26px, 3vw, 40px);
        font-weight: 400;
        letter-spacing: -0.05em;
    }

    &__bar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 12px 20px;
        margin-bottom: 20px;
        padding: 12px 16px;
        border: 1px solid rgba(93, 119, 144, 0.25);
        border-radius: 8px;
        background: rgba(23, 29, 43, 0.7);
        font-family: "Candara", sans-serif;
    }

    &__status-hint {
        flex: 1 1 220px;
        margin: 0;
        font-size: 14px;
        color: rgba(248, 248, 248, 0.6);
    }

    &__save {
        font-size: 14px;
        color: rgba(248, 248, 248, 0.6);

        &.is-error { color: #ff8a8a; }
        &.is-saved { color: #8fd19e; }
    }
}

.status-switch {
    display: flex;
    overflow: hidden;
    border: 1px solid rgba(248, 248, 248, 0.15);
    border-radius: 6px;

    &__btn {
        padding: 8px 14px;
        border: none;
        background: rgba(0, 0, 0, 0.35);
        color: rgba(248, 248, 248, 0.65);
        font-family: "Candara", sans-serif;
        font-size: 15px;

        & + & { border-left: 1px solid rgba(248, 248, 248, 0.15); }

        &.is-active { color: #0f1420; }
        &--draft.is-active { background: #b8c2d1; }
        &--live.is-active { background: #ff6b6b; color: #fff; }
        &--finished.is-active { background: #fbd298; }
    }
}

.tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 22px;
    border-bottom: 1px solid rgba(93, 119, 144, 0.3);

    button {
        padding: 10px 18px;
        border: none;
        border-bottom: 2px solid transparent;
        background: none;
        color: rgba(248, 248, 248, 0.6);
        font-family: "VollkornSC", sans-serif;
        font-size: 18px;

        &.is-active {
            border-bottom-color: #fbd298;
            color: #fbd298;
        }

        &:hover { color: #f8f8f8; }
    }
}
</style>
