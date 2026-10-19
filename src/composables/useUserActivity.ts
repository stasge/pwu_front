import { computed, ref } from 'vue';
import { fetchGet } from '@/utils/fetchApi';
import { useUserStore } from '@/stores/userStore';
import type { ActivityAccount, ActivityProgress, ActivityRole } from '@/models/activity';

const errorText = (e: any) => {
    const status = e?.status ?? e?.response?.status
    switch (status) {
        case 403:
            return e?.data?.msg === 'You are banned' ? 'Ваш акаунт заблоковано' : 'Акаунт не верифіковано'
        case 408:
        case 502:
        case 503:
            return 'Ігровий сервер тимчасово недоступний. Спробуйте пізніше'
        default:
            return 'Не вдалося завантажити активність'
    }
}

export const isActivityDone = (p: ActivityProgress) => p.required > 0 && p.completed >= p.required

/** Підсумок по персонажу: очки та кількість виконаних активностей (тільки доступні активності). */
export const roleSummary = (role: ActivityRole) => {
    const available = role.progress.filter(p => p.available)
    const points = available.reduce((sum, p) => sum + p.points, 0)
    const maxPoints = available.reduce((sum, p) => sum + p.maxPoints, 0)
    const done = available.filter(isActivityDone).length
    return {
        points,
        maxPoints,
        done,
        total: available.length,
        percent: maxPoints > 0 ? Math.min(100, Math.round((points / maxPoints) * 100)) : 0,
    }
}

/** Нагорода відправляється автоматично, тож усе виконано = нагороду отримано. */
export const isRewardReceived = (role: ActivityRole) => {
    const { done, total } = roleSummary(role)
    return !!role.complete || (total > 0 && done === total)
}

/** Щоденна активність персонажів на всіх ігрових акаунтах (GET user/activity). */
export function useUserActivity() {
    const userStore = useUserStore()

    const accounts = ref<ActivityAccount[]>([])
    const loading = ref(false)
    const loaded = ref(false)
    const error = ref('')
    let requestSeq = 0

    const accountNames = computed(() => {
        const names = new Map<number, string>()
        for (const acc of userStore.user?.game_user ?? []) {
            names.set(acc.id_game, acc.username)
        }
        return names
    })

    const load = async () => {
        const seq = ++requestSeq
        loading.value = true
        error.value = ''
        try {
            const res = await fetchGet('user/activity')
            if (seq !== requestSeq) return
            accounts.value = res?.data?.accounts ?? []
            loaded.value = true
        } catch (e: any) {
            if (seq !== requestSeq) return
            error.value = errorText(e)
        } finally {
            if (seq === requestSeq) loading.value = false
        }
    }

    return { accounts, loading, loaded, error, accountNames, load }
}
