<script setup lang='ts'>
import { onBeforeUnmount, ref, watch } from 'vue';
import CalendarPanel from './CalendarPanel.vue';
import BottomSheet from './BottomSheet.vue';
import Corners from '@/components/base/Corners.vue';
import { useIsMobile } from '@/composables/useIsMobile';
import { formatShortDate } from '@/utils/isoDate';

const props = defineProps<{
    modelValue: string
    min?: string
    max?: string
    ariaLabel?: string
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
}>()

const isMobile = useIsMobile()
const opened = ref(false)
const root = ref<HTMLElement>()

const select = (value: string) => {
    emit('update:modelValue', value)
    opened.value = false
}

// Закриття попапа по кліку поза ним (на мобільному цим займається BottomSheet)
const onDocumentClick = (e: MouseEvent) => {
    if (!isMobile.value && root.value && !root.value.contains(e.target as Node)) {
        opened.value = false
    }
}
const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') opened.value = false
}

watch(opened, (value) => {
    if (value && !isMobile.value) {
        document.addEventListener('mousedown', onDocumentClick)
        document.addEventListener('keydown', onKeydown)
    } else {
        document.removeEventListener('mousedown', onDocumentClick)
        document.removeEventListener('keydown', onKeydown)
    }
})

onBeforeUnmount(() => {
    document.removeEventListener('mousedown', onDocumentClick)
    document.removeEventListener('keydown', onKeydown)
})
</script>
<template>
    <div ref="root" class="date-field">
        <button
            type="button"
            class="date-field__btn"
            :class="{ 'date-field__btn--active': opened }"
            :aria-label="ariaLabel"
            aria-haspopup="dialog"
            :aria-expanded="opened"
            @click="opened = !opened"
        >
            <span v-if="modelValue">{{ formatShortDate(modelValue) }}</span>
            <span v-else class="date-field__placeholder">дд.мм.рр</span>
            <img src="@/assets/images/top-up/calendar.svg" alt="" width="16" height="16">
        </button>

        <div v-if="opened && !isMobile" class="date-field__popup">
            <Corners />
            <CalendarPanel :model-value="props.modelValue" :min="min" :max="max" @update:model-value="select" />
        </div>

        <BottomSheet v-if="isMobile" v-model:showed="opened">
            <CalendarPanel :model-value="props.modelValue" :min="min" :max="max" @update:model-value="select" />
        </BottomSheet>
    </div>
</template>
<style scoped lang='scss'>
.date-field {
    position: relative;

    &__btn {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
        width: 100%;
        height: 34px;
        padding: 0 10px;
        border: none;
        background: none;
        color: #f8f8f8;
        font-family: "VollkornSC", sans-serif;
        font-size: 14px;
        line-height: 1;
        white-space: nowrap;

        // Сіра рамка: ліва частина, середина, права частина
        &::before {
            content: '';
            position: absolute;
            inset: 0;
            background:
                url('@/assets/images/gray-frame-fantasy-btn-bg-left.png') no-repeat left center / 12px 100%,
                url('@/assets/images/gray-frame-fantasy-btn-bg-right.png') no-repeat right center / 12px 100%,
                url('@/assets/images/gray-frame-fantasy-btn-bg.png') no-repeat center / calc(100% - 24px) 100%;
            pointer-events: none;
            transition: filter 0.2s ease;
        }

        &:hover::before,
        &--active::before {
            filter: sepia(1) saturate(2.5) brightness(1.1);
        }

        > * {
            position: relative;
        }

        img {
            flex-shrink: 0;
        }
    }

    &__placeholder {
        color: rgba(248, 248, 248, 0.4);
    }

    &__popup {
        position: absolute;
        top: calc(100% + 18px);
        left: 50%;
        transform: translateX(-50%);
        z-index: 20;
        width: 250px;
        padding: 16px 0 14px;
        background: #1c1c1c;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
    }

    @media (max-width: 767px) {
        &__btn {
            height: 34px;
            justify-content: center;

            img {
                position: absolute;
                right: 16px;
            }
        }
    }
}
</style>
