<script setup lang='ts'>
import { computed, onMounted, reactive, ref } from 'vue';
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
import Corners from '@/components/base/Corners.vue';
import DateField from '@/components/top-up/DateField.vue';
import BottomSheet from '@/components/top-up/BottomSheet.vue';
import HelpTooltip from '@/components/top-up/HelpTooltip.vue';
import { formatGold, useGoldTotals } from '@/composables/useGoldTotals';
import { formatShortDate } from '@/utils/isoDate';

const TOP_UP_HINT = 'Голда, отримана за фактичні поповнення.'
const BONUS_HINT = 'Додаткова голда за акціями. Не враховується при розрахунку кланового кешбеку.'

const { data, loading, error, accountNames, load } = useGoldTotals()

// Чернетка періоду в полях і період, для якого показані дані
const draft = reactive({ from: '', to: '' })
const applied = reactive({ from: '', to: '' })
const periodSheetShowed = ref(false)

const hasPeriod = computed(() => !!(applied.from || applied.to))

const periodText = computed(() => {
    if (!hasPeriod.value) return 'За весь час'
    if (applied.from && applied.to) return `${formatShortDate(applied.from)} — ${formatShortDate(applied.to)}`
    return applied.from ? `З ${formatShortDate(applied.from)}` : `По ${formatShortDate(applied.to)}`
})

const apply = () => {
    applied.from = draft.from
    applied.to = draft.to
    periodSheetShowed.value = false
    load(applied)
}

const reset = () => {
    draft.from = draft.to = ''
    apply()
}

const openPeriodSheet = () => {
    draft.from = applied.from
    draft.to = applied.to
    periodSheetShowed.value = true
}

const retry = () => load(applied)

onMounted(() => load())
</script>
<template>
    <Header />
    <div class="top-up">
        <picture class="top-up__bg">
            <source media="(max-width: 767px)" srcset="@/assets/images/top-up/bg-mobile.png">
            <img src="@/assets/images/top-up/bg-desktop.png" alt="">
        </picture>

        <div class="top-up__content">
            <section class="top-up__hero">
                <h1 class="top-up__title">{{ hasPeriod ? 'Поповнено за період' : 'Поповнено за весь час' }}</h1>
                <div class="top-up__total" :class="{ 'top-up__total--loading': loading }">
                    <img src="@/assets/images/clan-bonus/3-gold.svg" alt="" class="top-up__total-icon">
                    <span>{{ data ? formatGold(data.total.adjustedGold) : '—' }}</span>
                </div>
                <p v-if="data && data.total.bonusGold > 0" class="top-up__bonus">
                    +{{ formatGold(data.total.bonusGold) }} бонусної голди
                </p>
            </section>

            <!-- Фільтр періоду: десктоп -->
            <form class="top-up__filter" @submit.prevent="apply">
                <Corners />
                <span class="top-up__filter-label">Період:</span>
                <DateField v-model="draft.from" :max="draft.to || undefined" aria-label="Дата від" class="top-up__date" />
                <span class="top-up__filter-dash">—</span>
                <DateField v-model="draft.to" :min="draft.from || undefined" aria-label="Дата до" class="top-up__date" />
                <button type="submit" class="fantasy-btn small thin top-up__apply" :disabled="loading">
                    <span>Застосувати</span>
                </button>
                <button type="button" class="top-up__reset" :disabled="loading" @click="reset">Скинути</button>
            </form>

            <!-- Фільтр періоду: мобільний -->
            <button type="button" class="top-up__period" @click="openPeriodSheet">
                <Corners />
                <span>{{ periodText }}</span>
                <img src="@/assets/images/top-up/calendar.svg" alt="" width="24" height="24">
            </button>

            <section class="top-up__accounts">
                <Corners />
                <div class="top-up__accounts-header">
                    <h2 class="top-up__accounts-title">Поповнення за акаунтами</h2>
                    <p class="top-up__note">
                        <img src="@/assets/images/top-up/exclamation.svg" alt="">
                        <span>Бонусна голда не враховується при розрахунку кланового кешбеку.</span>
                    </p>
                </div>

                <div v-if="loading && !data" class="top-up__state">Завантаження...</div>
                <div v-else-if="error" class="top-up__state top-up__state--error">
                    <p>{{ error }}</p>
                    <button type="button" class="top-up__reset" @click="retry">Спробувати ще раз</button>
                </div>
                <div v-else-if="data && !data.accounts.length" class="top-up__state">
                    У вас немає активних ігрових акаунтів
                </div>
                <div v-else-if="data" class="top-up__table" :class="{ 'top-up__table--loading': loading }">
                    <div class="top-up__row top-up__row--head">
                        <p>№</p>
                        <p class="top-up__cell-login">Логін</p>
                        <p>Поповнено <HelpTooltip :text="TOP_UP_HINT" /></p>
                        <p>Бонусна голда <HelpTooltip :text="BONUS_HINT" /></p>
                        <p>Трансакції</p>
                    </div>
                    <div v-for="(acc, index) of data.accounts" :key="acc.game_id" class="top-up__row">
                        <p class="top-up__cell-index">{{ index + 1 }}</p>
                        <p class="top-up__cell-login" data-label="Логін:">{{ accountNames.get(acc.game_id) ?? `#${acc.game_id}` }}</p>
                        <p data-label="Поповнено:">{{ formatGold(acc.adjustedGold) }}</p>
                        <p data-label="Бонусна голда:">{{ acc.bonusGold > 0 ? formatGold(acc.bonusGold) : '-' }}</p>
                        <p data-label="Трансакції:">{{ acc.transactions }}</p>
                    </div>
                </div>
            </section>
        </div>
    </div>
    <Footer />

    <BottomSheet v-model:showed="periodSheetShowed">
        <form class="period-sheet" @submit.prevent="apply">
            <h2 class="period-sheet__title">Обрати період</h2>
            <label class="period-sheet__row">
                <span>З:</span>
                <DateField v-model="draft.from" :max="draft.to || undefined" aria-label="Дата від" />
            </label>
            <label class="period-sheet__row">
                <span>По:</span>
                <DateField v-model="draft.to" :min="draft.from || undefined" aria-label="Дата до" />
            </label>
            <button type="submit" class="fantasy-btn period-sheet__apply" :disabled="loading">
                <span>Застосувати</span>
            </button>
            <button type="button" class="top-up__reset period-sheet__reset" :disabled="loading" @click="reset">Скинути</button>
        </form>
    </BottomSheet>
</template>
<style scoped lang='scss'>
$gold-gradient: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%);

.top-up {
    position: relative;
    width: 100%;
    color: #f8f8f8;
    padding: 170px 0 120px;

    @media (max-width: 767px) {
        padding: 120px 0 60px;
    }

    &__bg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 560px;
        pointer-events: none;

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center top;
        }

        &::after {
            content: '';
            position: absolute;
            inset: auto 0 0;
            height: 120px;
            background: linear-gradient(180deg, rgba(10, 10, 10, 0) 0%, #0A0A0A 100%);
        }
    }

    &__content {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        max-width: 1110px;
        margin: 0 auto;
        padding: 0 15px;
    }

    &__hero {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    &__title {
        margin: 0;
        font-size: 30px;
        font-weight: 400;
        line-height: 1.1;
        text-transform: uppercase;
        letter-spacing: -0.04em;

        @media (max-width: 767px) {
            font-size: 22px;
        }
    }

    &__total {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-top: 6px;
        transition: opacity 0.2s ease;

        span {
            font-size: 88px;
            line-height: 1;
            letter-spacing: -0.03em;
            background: $gold-gradient;
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        &--loading { opacity: 0.5; }

        @media (max-width: 767px) {
            gap: 10px;

            span { font-size: 48px; }
        }
    }

    &__total-icon {
        width: 72px;
        height: auto;

        @media (max-width: 767px) {
            width: 40px;
        }
    }

    &__bonus {
        margin: 16px 0 0;
        padding: 8px 16px;
        border-radius: 20px;
        background: rgba(248, 248, 248, 0.1);
        font-size: 18px;
        letter-spacing: -0.02em;

        @media (max-width: 767px) {
            margin-top: 10px;
            font-size: 16px;
        }
    }

    &__filter {
        position: relative;
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 40px;
        padding: 12px 30px;
        border-radius: 5px;
        background: rgba(26, 26, 26, 0.9);
        z-index: 3;

        @media (max-width: 767px) {
            display: none;
        }
    }

    &__filter-label {
        margin-right: 8px;
        font-size: 18px;
    }

    &__filter-dash {
        opacity: 0.7;
    }

    &__date {
        width: 112px;
    }

    &__apply {
        margin: 0 20px 0 30px;
        width: 92px;
        font-size: 14px !important;
    }

    &__reset {
        padding: 0;
        border: none;
        border-bottom: 1px solid rgba(248, 248, 248, 0.5);
        background: none;
        color: rgba(248, 248, 248, 0.7);
        font-family: "VollkornSC", sans-serif;
        font-size: 16px;
        line-height: 1.1;
        transition: opacity 0.2s ease;

        &:hover { opacity: 0.7; }
        &:disabled { opacity: 0.3; }
    }

    &__period {
        position: relative;
        display: none;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        margin-top: 20px;
        padding: 16px 30px;
        border: none;
        border-radius: 5px;
        background: rgba(26, 26, 26, 0.9);
        color: #f8f8f8;
        font-family: "VollkornSC", sans-serif;
        font-size: 18px;

        @media (max-width: 767px) {
            display: flex;
        }
    }

    &__accounts {
        position: relative;
        width: 100%;
        margin-top: 40px;
        padding: 30px 40px 40px;
        border-radius: 5px;
        background: rgba(26, 26, 26, 0.95);
        z-index: 1;

        @media (max-width: 767px) {
            margin-top: 20px;
            padding: 30px 10px 40px;
        }
    }

    &__accounts-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 10px 30px;
        padding-bottom: 20px;
        border-bottom: 1px solid rgba(248, 248, 248, 0.1);

        @media (max-width: 767px) {
            flex-direction: column;
            align-items: flex-start;
            padding: 0 10px 20px;
            border-bottom: none;
        }
    }

    &__accounts-title {
        margin: 0;
        font-size: 24px;
        font-weight: 400;
        letter-spacing: -0.03em;

        @media (max-width: 767px) {
            max-width: 200px;
            line-height: 1;
        }
    }

    &__note {
        display: flex;
        align-items: center;
        gap: 6px;
        margin: 0;
        font-family: "Candara", sans-serif;
        font-size: 13px;
        color: rgba(248, 248, 248, 0.5);

        img { width: 16px; height: 16px; }

        @media (max-width: 767px) {
            gap: 10px;

            img { width: 32px; height: 32px; flex-shrink: 0; }
        }
    }

    &__state {
        padding: 40px 20px 0;
        text-align: center;
        font-size: 18px;
        color: rgba(248, 248, 248, 0.7);

        p { margin: 0 0 12px; }

        &--error p { color: #ff6b6b; }
    }

    &__table {
        margin-top: 20px;
        transition: opacity 0.2s ease;

        &--loading { opacity: 0.5; pointer-events: none; }
    }

    &__row {
        display: grid;
        grid-template-columns: 50px 1.4fr 1fr 1fr 1fr;
        align-items: center;
        min-height: 54px;
        padding: 0 20px;
        border-radius: 10px;

        &:nth-child(even) {
            background: rgba(0, 0, 0, 0.4);
        }

        p {
            margin: 0;
            font-size: 14px;
            text-align: right;
            overflow-wrap: anywhere;
        }

        &--head {
            min-height: 44px;

            p {
                display: flex;
                align-items: center;
                justify-content: flex-end;
                gap: 6px;
                font-size: 16px;
            }

            p:first-child { justify-content: center; }
            .top-up__cell-login { justify-content: flex-start; }
        }
    }

    &__cell-index {
        text-align: center !important;
    }

    &__cell-login {
        padding-left: 20px;
        text-align: left !important;
        font-size: 16px !important;
    }

    @media (max-width: 767px) {
        &__table {
            margin-top: 0;
        }

        &__row {
            display: flex;
            flex-direction: column;
            gap: 20px;
            padding: 20px;

            &--head,
            .top-up__cell-index { display: none; }

            p {
                display: flex;
                justify-content: space-between;
                gap: 10px;
                width: 100%;

                &::before {
                    content: attr(data-label);
                    color: rgba(248, 248, 248, 0.3);
                    font-size: 14px;
                    text-align: left;
                }
            }
        }

        &__cell-login {
            padding-left: 0;
            font-size: 14px !important;
        }
    }
}

.period-sheet {
    display: flex;
    flex-direction: column;
    align-items: center;

    &__title {
        margin: 0 0 24px;
        font-size: 22px;
        font-weight: 400;
    }

    &__row {
        display: grid;
        grid-template-columns: 36px 1fr;
        align-items: center;
        width: 100%;
        margin-bottom: 12px;
        font-size: 16px;
    }

    &__apply {
        width: calc(100% - 40px);
        margin-top: 24px;
    }

    &__reset {
        margin-top: 24px;
    }
}
</style>
