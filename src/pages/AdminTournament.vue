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
import '@/tournament/theme.scss'

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
    <div class="pvp admin-tournament">
        <h1 class="pvp__title">Керування турніром</h1>

        <template v-if="loaded">
            <div class="persist-bar">
                <div class="app-nav admin-tournament__status" role="radiogroup" aria-label="Статус турніру">
                    <button
                        v-for="s in STATUSES"
                        :key="s"
                        type="button"
                        role="radio"
                        :aria-checked="status === s"
                        class="app-nav__btn"
                        :class="{ 'is-active': status === s, 'app-nav__btn--live': s === 'live' }"
                        @click="status = s"
                    >{{ TOURNAMENT_STATUS_LABELS[s] }}</button>
                </div>
                <span class="persist-bar__status">
                    <template v-if="status === 'draft'">Глядачі турнір не бачать</template>
                    <template v-else-if="status === 'live'">Глядачі бачать турнір наживо, на головній горить віджет</template>
                    <template v-else>Глядачі бачать підсумки, віджет вимкнено</template>
                </span>
                <span class="persist-bar__status" :class="{ 'persist-bar__status--warn': saveState === 'error' }">{{ saveLabel }}</span>
                <router-link :to="{ name: 'tournament' }" target="_blank" class="ghost-btn ghost-btn--accent">Сторінка перегляду ↗</router-link>
            </div>

            <nav class="app-nav" aria-label="Розділи">
                <button type="button" class="app-nav__btn" :class="{ 'is-active': tab === 'register' }" @click="tab = 'register'">Реєстрація</button>
                <button type="button" class="app-nav__btn" :class="{ 'is-active': tab === 'teams' }" @click="tab = 'teams'">Команди</button>
                <button v-for="c in CATEGORIES" :key="c" type="button" class="app-nav__btn" :class="{ 'is-active': tab === c }" @click="tab = c">{{ c === '90-98' ? '90–98' : c }}</button>
            </nav>

            <RegistrationPanel v-if="tab === 'register'" :data="data" />
            <RandomizerPanel v-else-if="tab === 'teams'" :data="data" />
            <CategoryBoard v-else :key="tab" :data="data" :cat="tab" editable />
        </template>
    </div>
</template>
<style scoped lang="scss">
.admin-tournament {
    width: 100%;
    max-width: 1200px;

    &__status {
        margin-bottom: 0;
    }
}
</style>
