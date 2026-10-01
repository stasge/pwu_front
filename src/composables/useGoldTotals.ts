import { computed, ref } from 'vue';
import { fetchPost } from '@/utils/fetchApi';
import { useUserStore } from '@/stores/userStore';
import type { GoldTotalRange, GoldTotals } from '@/models/gold';

const goldFormat = new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 2 })

/** 28450 → "28 450", 1083.33 → "1 083,33" */
export const formatGold = (value: number) => goldFormat.format(value)

const errorText = (e: any) => {
    const status = e?.status ?? e?.response?.status
    switch (status) {
        case 403:
            return e?.data?.msg === 'You are banned' ? 'Ваш акаунт заблоковано' : 'Акаунт не верифіковано'
        case 400:
            return 'Перевірте вибрані дати'
        case 408:
        case 502:
        case 503:
            return 'Ігровий сервер зайнятий або недоступний. Спробуйте пізніше'
        default:
            return 'Не вдалося завантажити дані про поповнення'
    }
}

/** Суми голди по всіх активних ігрових акаунтах користувача (POST user/goldTotal). */
export function useGoldTotals() {
    const userStore = useUserStore()

    const data = ref<GoldTotals | null>(null)
    const loading = ref(false)
    const error = ref('')
    let requestSeq = 0

    const accountNames = computed(() => {
        const names = new Map<number, string>()
        for (const acc of userStore.user?.game_user ?? []) {
            names.set(acc.id_game, acc.username)
        }
        return names
    })

    const load = async (range: GoldTotalRange = {}) => {
        const body: GoldTotalRange = {}
        if (range.from) body.from = range.from
        if (range.to) body.to = range.to

        // Відповіді на попередні запити ігноруються, якщо користувач уже змінив період
        const seq = ++requestSeq
        loading.value = true
        error.value = ''
        try {
            const res = await fetchPost('user/goldTotal', body)
            if (seq !== requestSeq) return
            data.value = res.data
        } catch (e: any) {
            if (seq !== requestSeq) return
            data.value = null
            error.value = errorText(e)
        } finally {
            if (seq === requestSeq) loading.value = false
        }
    }

    return { data, loading, error, accountNames, load }
}
