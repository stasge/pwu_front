<script setup lang='ts'>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { useToast } from 'vue-toastification';
import { useUserStore } from '@/stores/userStore';
import { fetchPost } from '@/utils/fetchApi';
import type { GoldTotalRange, GoldTotals } from '@/models/gold';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

const userStore = useUserStore()
const toast = useToast()

const filter = reactive({
    from: '',
    to: ''
})
const data = ref<GoldTotals | null>(null)
const loading = ref(false)
const error = ref('')
let requestSeq = 0

const goldFormat = new Intl.NumberFormat('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const formatGold = (value: number) => goldFormat.format(value)

const accountNames = computed(() => {
    const names = new Map<number, string>()
    for (const acc of userStore.user?.game_user ?? []) {
        names.set(acc.id_game, acc.username)
    }
    return names
})

const isValidDate = (value: string) => {
    if (!DATE_REGEX.test(value)) return false
    const date = new Date(`${value}T00:00:00Z`)
    return !isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

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
            return 'Не вдалося завантажити дані про голду'
    }
}

const load = async () => {
    const range: GoldTotalRange = {}
    if (filter.from) range.from = filter.from
    if (filter.to) range.to = filter.to

    if ((range.from && !isValidDate(range.from)) || (range.to && !isValidDate(range.to))) {
        toast.error('Дата має бути у форматі рррр-мм-дд')
        return
    }
    if (range.from && range.to && range.from > range.to) {
        toast.error('Дата "від" не може бути пізніше дати "до"')
        return
    }

    const seq = ++requestSeq
    loading.value = true
    error.value = ''
    try {
        const res = await fetchPost('user/goldTotal', range)
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

const reset = () => {
    filter.from = filter.to = ''
    load()
}

const BONUS_HINT = 'Під час бонусних періодів (наприклад, +20% до поповнення) гра нараховує більше голди, ніж було оплачено. '
    + 'Цю надбавку ми не враховуємо: у «Голда» показано лише оплачену голду, а тут — скільки бонусної голди виключено.'

// Відкриття підказки по кліку (для пристроїв без hover)
const hintOpened = ref(false)
const closeHint = () => {
    hintOpened.value = false
}

onMounted(() => {
    load()
    document.addEventListener('click', closeHint)
})
onBeforeUnmount(() => {
    document.removeEventListener('click', closeHint)
})

// Перезавантажуємо, коли змінюється набір активних ігрових акаунтів (видалення / відновлення / створення)
watch(
    () => (userStore.user?.game_user ?? []).map(acc => `${acc.id_game}:${acc.is_deleted}`).join(','),
    (value, oldValue) => {
        if (value !== oldValue) load()
    }
)
</script>
<template>
    <div class="gold">
        <div class="gold__corner gold__corner--top-left"></div>
        <div class="gold__corner gold__corner--top-right"></div>
        <div class="gold__corner gold__corner--bottom-left"></div>
        <div class="gold__corner gold__corner--bottom-right"></div>

        <div class="gold__header">
            <h2 class="gold__title">Голда</h2>
            <form class="gold__filter" @submit.prevent="load">
                <label class="gold__field">
                    <span>Від</span>
                    <div class="custom-input">
                        <div class="input-bg"></div>
                        <input v-model="filter.from" type="date" :max="filter.to || undefined">
                    </div>
                </label>
                <label class="gold__field">
                    <span>До</span>
                    <div class="custom-input">
                        <div class="input-bg"></div>
                        <input v-model="filter.to" type="date" :min="filter.from || undefined">
                    </div>
                </label>
                <div class="gold__filter-actions">
                    <button type="submit" class="fantasy-btn small" :disabled="loading">
                        <span>Показати</span>
                    </button>
                    <button type="button" class="gold__reset-btn" :disabled="loading || (!filter.from && !filter.to)" @click="reset">
                        Скинути
                    </button>
                </div>
            </form>
        </div>

        <div v-if="loading && !data" class="gold__state">Завантаження...</div>
        <div v-else-if="error" class="gold__state gold__state--error">
            <p>{{ error }}</p>
            <button class="gold__reset-btn" @click="load">Спробувати ще раз</button>
        </div>
        <div v-else-if="data" class="gold__content" :class="{ 'gold__content--loading': loading }">
            <div class="gold__total">
                <p class="gold__total-label">
                    Загалом
                    <template v-if="data.from || data.to">
                        <template v-if="data.from"> з {{ data.from }}</template>
                        <template v-if="data.to"> по {{ data.to }}</template>
                    </template>
                    <template v-else> за весь час</template>
                </p>
                <p class="gold__total-value">{{ formatGold(data.total.adjustedGold) }}</p>
                <p class="gold__total-hint">
                    Транзакцій: {{ data.total.transactions }}
                    <template v-if="data.total.bonusGold > 0">
                        · бонусна голда не врахована: {{ formatGold(data.total.bonusGold) }}
                    </template>
                </p>
            </div>

            <div v-if="!data.accounts.length" class="gold__state">
                У вас немає активних ігрових акаунтів
            </div>
            <div v-else class="gold__table">
                <div class="gold__row gold__row--head">
                    <p>Логін</p>
                    <p>Голда</p>
                    <p>
                        Бонус (не врах.)
                        <span class="gold__help" :class="{ 'gold__help--open': hintOpened }">
                            <button type="button" class="gold__help-btn" aria-label="Що таке бонусна голда?" @click.stop="hintOpened = !hintOpened">?</button>
                            <span class="gold__help-bubble" role="tooltip">{{ BONUS_HINT }}</span>
                        </span>
                    </p>
                    <p>Транзакцій</p>
                </div>
                <div
                    v-for="(acc, index) of data.accounts"
                    :key="acc.game_id"
                    class="gold__row"
                    :style="{ background: index % 2 === 0 ? 'rgba(0, 0, 0, 0.4)' : 'transparent' }"
                >
                    <p data-label="Логін:">{{ accountNames.get(acc.game_id) ?? `#${acc.game_id}` }}</p>
                    <p data-label="Голда:" class="gold__value">{{ formatGold(acc.adjustedGold) }}</p>
                    <p data-label="Бонус (не врах.):">{{ formatGold(acc.bonusGold) }}</p>
                    <p data-label="Транзакцій:">{{ acc.transactions }}</p>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped lang='scss'>
.gold {
    position: relative;
    padding: clamp(10px, 3vw, 30px);
    background: rgba(250, 250, 250, 0.05);
    border-radius: 5px;
    width: 100%;
    color: #fff;

    &__corner {
        position: absolute;
        width: 10px;
        height: 10px;
        background-image: url('@/assets/images/profile-corner.svg');
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        z-index: 1;

        &--top-left { top: 0; left: 0; }
        &--top-right { top: 0; right: 0; transform: rotate(90deg); }
        &--bottom-left { bottom: 0; left: 0; transform: rotate(-90deg); }
        &--bottom-right { bottom: 0; right: 0; transform: rotate(180deg); }
    }

    &__header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        flex-wrap: wrap;
        gap: 15px;
        margin-bottom: 20px;
    }

    &__title {
        font-size: 24px;
        margin: 0;
        font-weight: 400;
    }

    &__filter {
        display: flex;
        align-items: flex-end;
        flex-wrap: wrap;
        gap: 15px;

        @media (max-width: 767px) {
            width: 100%;
        }
    }

    &__field {
        display: flex;
        flex-direction: column;
        gap: 6px;
        width: 170px;
        font-family: "Candara", sans-serif;

        span {
            font-size: 14px;
            opacity: 0.5;
        }

        input {
            color-scheme: dark;
            opacity: 0.9 !important;
        }

        @media (max-width: 767px) {
            flex: 1 1 140px;
            width: auto;
        }
    }

    &__filter-actions {
        display: flex;
        align-items: center;
        gap: 15px;

        @media (max-width: 767px) {
            width: 100%;
            justify-content: space-between;
        }
    }

    &__reset-btn {
        font-family: "VollkornSC", sans-serif;
        border: none;
        background: none;
        font-size: 16px;
        letter-spacing: -0.09em;
        text-decoration: underline;
        color: #fadfae;
        cursor: pointer;
        transition: opacity 0.2s ease;

        &:hover { opacity: 0.7; }
        &:disabled { opacity: 0.3; cursor: default; }
    }

    &__state {
        padding: 20px;
        text-align: center;
        font-size: 18px;
        color: rgba(255, 255, 255, 0.7);

        p { margin: 0 0 10px; }

        &--error p { color: #ff6b6b; }
    }

    &__content {
        transition: opacity 0.2s ease;

        &--loading { opacity: 0.5; pointer-events: none; }
    }

    &__total {
        text-align: center;
        margin-bottom: 20px;

        p { margin: 0; }
    }

    &__total-label {
        font-size: 16px;
        opacity: 0.5;
        font-family: "Candara", sans-serif;
    }

    &__total-value {
        font-size: 42px;
        line-height: 120%;
        letter-spacing: -0.04em;
        background: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    &__total-hint {
        font-size: 14px;
        opacity: 0.5;
        font-family: "Candara", sans-serif;
    }

    &__row {
        display: grid;
        grid-template-columns: 1.5fr 1fr 1fr 1fr;
        padding: 15px;
        border-radius: 10px;
        align-items: center;

        p {
            margin: 0;
            text-align: center;
            font-size: 14px;
            overflow-wrap: anywhere;
        }

        &--head {
            padding-top: 0;

            p {
                font-size: 16px;
                color: rgba(255, 255, 255, 0.7);
            }
        }
    }

    &__value {
        color: #fbd298;
    }

    &__help {
        position: relative;
        display: inline-flex;
        vertical-align: middle;
        margin-left: 4px;

        &:hover,
        &:focus-within,
        &--open {
            .gold__help-bubble {
                opacity: 1;
                visibility: visible;
            }
        }
    }

    &__help-btn {
        width: 18px;
        height: 18px;
        padding: 0;
        border: 1px solid #fbd298;
        border-radius: 50%;
        background: transparent;
        color: #fbd298;
        font-size: 12px;
        line-height: 16px;
        font-family: "Candara", sans-serif;
        cursor: pointer;
        transition: opacity 0.2s ease;

        &:hover { opacity: 0.7; }
    }

    &__help-bubble {
        position: absolute;
        bottom: calc(100% + 8px);
        left: 50%;
        transform: translateX(-50%);
        width: min(280px, 80vw);
        padding: 10px 12px;
        background: rgba(20, 16, 12, 0.97);
        border: 1px solid rgba(251, 210, 152, 0.4);
        border-radius: 5px;
        color: #f8f8f8;
        font-family: "Candara", sans-serif;
        font-size: 13px;
        line-height: 1.4;
        text-align: left;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.2s ease, visibility 0.2s ease;
        z-index: 10;
        pointer-events: none;
    }

    @media (max-width: 767px) {
        &__row {
            display: flex;
            flex-direction: column;
            gap: 10px;

            &--head { display: none; }

            p {
                display: flex;
                justify-content: space-between;
                gap: 10px;
                width: 100%;

                &::before {
                    content: attr(data-label);
                    opacity: 0.3;
                    color: #f8f8f8;
                }
            }
        }
    }
}
</style>
