import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { getTournament, getTournamentVersion } from '@/tournament/api'
import { normalizeData } from '@/tournament/logic'
import type { TournamentData, TournamentStatus } from '@/tournament/types'

/**
 * Live-стан турніру для глядачів: раз на intervalMs питає легку версію
 * і довантажує повний стан лише коли вона змінилась.
 * withState = false — тільки статус (для віджета на головній).
 */
export function useTournamentLive(intervalMs: number, { withState = true } = {}) {
    const status = ref<TournamentStatus | null>(null)
    const data = shallowRef<TournamentData | null>(null)
    const updatedAt = ref<string | null>(null)
    const loaded = ref(false)
    let version = -1
    let timer: ReturnType<typeof setInterval> | undefined
    let busy = false

    const refresh = async (force = false) => {
        if (busy || (!force && document.hidden)) return
        busy = true
        try {
            const v = await getTournamentVersion()
            status.value = v.status
            if (withState && v.version !== version) {
                const snapshot = await getTournament()
                version = snapshot.version
                status.value = snapshot.status
                updatedAt.value = snapshot.updatedAt
                data.value = snapshot.state ? normalizeData(snapshot.state) : null
            }
        } catch {
            // мережа/бекенд недоступні — лишаємо останній відомий стан
        } finally {
            busy = false
            loaded.value = true
        }
    }

    const onVisible = () => {
        if (!document.hidden) refresh()
    }

    onMounted(() => {
        refresh(true)
        timer = setInterval(refresh, intervalMs)
        document.addEventListener('visibilitychange', onVisible)
    })

    onBeforeUnmount(() => {
        clearInterval(timer)
        document.removeEventListener('visibilitychange', onVisible)
    })

    return { status, data, updatedAt, loaded }
}
