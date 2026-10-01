<script setup lang='ts'>
import { computed, ref, watch } from 'vue';
import { parseIsoDate, toIsoDate } from '@/utils/isoDate';

const props = defineProps<{
    modelValue: string
    min?: string
    max?: string
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
}>()

const MONTHS = ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень']
const WEEK_DAYS = ['Пн.', 'Вт.', 'Ср.', 'Чт.', 'Пт.', 'Сб.', 'Нд.']

const today = toIsoDate(new Date())

const initialMonth = () => {
    const date = parseIsoDate(props.modelValue) ?? parseIsoDate(props.max ?? '') ?? new Date()
    return new Date(date.getFullYear(), date.getMonth(), 1)
}
const viewMonth = ref(initialMonth())

watch(() => props.modelValue, () => {
    viewMonth.value = initialMonth()
})

const title = computed(() => `${MONTHS[viewMonth.value.getMonth()]} ${viewMonth.value.getFullYear()}`)

const days = computed(() => {
    const year = viewMonth.value.getFullYear()
    const month = viewMonth.value.getMonth()
    const first = new Date(year, month, 1)
    const offset = (first.getDay() + 6) % 7 // тиждень починається з понеділка
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells = Math.ceil((offset + daysInMonth) / 7) * 7

    return Array.from({ length: cells }, (_, i) => {
        const date = new Date(year, month, 1 - offset + i)
        const iso = toIsoDate(date)
        return {
            iso,
            day: date.getDate(),
            outside: date.getMonth() !== month,
            disabled: (!!props.min && iso < props.min) || (!!props.max && iso > props.max),
            selected: iso === props.modelValue,
            today: iso === today,
        }
    })
})

const shiftMonth = (delta: number) => {
    viewMonth.value = new Date(viewMonth.value.getFullYear(), viewMonth.value.getMonth() + delta, 1)
}

const select = (iso: string, disabled: boolean) => {
    if (!disabled) emit('update:modelValue', iso)
}
</script>
<template>
    <div class="calendar">
        <div class="calendar__head">
            <button type="button" class="calendar__arrow" aria-label="Попередній місяць" @click="shiftMonth(-1)">
                <svg width="8" height="14" viewBox="0 0 8 14" fill="none"><path d="M7 1L1 7L7 13" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <p class="calendar__title">{{ title }}</p>
            <button type="button" class="calendar__arrow" aria-label="Наступний місяць" @click="shiftMonth(1)">
                <svg width="8" height="14" viewBox="0 0 8 14" fill="none"><path d="M1 1L7 7L1 13" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
        </div>
        <div class="calendar__week">
            <span v-for="day of WEEK_DAYS" :key="day">{{ day }}</span>
        </div>
        <div class="calendar__grid">
            <button
                v-for="cell of days"
                :key="cell.iso"
                type="button"
                class="calendar__day"
                :class="{
                    'calendar__day--outside': cell.outside,
                    'calendar__day--selected': cell.selected,
                    'calendar__day--today': cell.today,
                }"
                :disabled="cell.disabled"
                @click="select(cell.iso, cell.disabled)"
            >
                {{ cell.day }}
            </button>
        </div>
    </div>
</template>
<style scoped lang='scss'>
.calendar {
    color: #f8f8f8;
    user-select: none;

    &__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 16px;
    }

    &__title {
        margin: 0;
        font-size: 16px;
        letter-spacing: -0.03em;
    }

    &__arrow {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border: none;
        background: none;
        color: rgba(248, 248, 248, 0.5);
        transition: color 0.2s ease;

        &:hover { color: #fbd298; }
    }

    &__week {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        padding: 10px 8px 12px;
        border-bottom: 1px solid rgba(248, 248, 248, 0.1);

        span {
            text-align: center;
            font-family: "Candara", sans-serif;
            font-size: 13px;
            color: rgba(248, 248, 248, 0.5);
        }
    }

    &__grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        row-gap: 4px;
        padding: 10px 8px 0;
    }

    &__day {
        justify-self: center;
        width: 30px;
        height: 30px;
        border: none;
        border-radius: 50%;
        background: none;
        color: #f8f8f8;
        font-family: "VollkornSC", sans-serif;
        font-size: 13px;
        transition: background 0.2s ease, color 0.2s ease;

        &:hover:not(:disabled):not(&--selected) {
            background: rgba(251, 210, 152, 0.15);
        }

        &--outside { color: rgba(248, 248, 248, 0.3); }

        &--today:not(&--selected) {
            box-shadow: inset 0 0 0 1px rgba(251, 210, 152, 0.6);
        }

        &--selected {
            background: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%);
            color: #1a1a1a;
        }

        &:disabled {
            color: rgba(248, 248, 248, 0.15);
            cursor: default !important;
        }
    }

    @media (max-width: 767px) {
        &__title { font-size: 20px; }

        &__arrow { width: 32px; height: 32px; }

        &__week {
            padding: 16px 0 12px;

            span { font-size: 16px; }
        }

        &__grid {
            row-gap: 10px;
            padding: 16px 0 0;
        }

        &__day {
            width: 34px;
            height: 34px;
            font-size: 16px;
        }
    }
}
</style>
