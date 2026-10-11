<!-- Пагінація у стилі форуму: стрілки + номери сторінок з "..." -->
<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    page: number;
    totalPages: number;
}>()

const emit = defineEmits<{ (e: 'update:page', page: number): void }>()

const visiblePages = computed(() => {
    const pages: (number | string)[] = []
    const total = props.totalPages
    const current = props.page

    if (total <= 7) {
        for (let i = 1; i <= total; i++) pages.push(i)
    } else if (current <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', total)
    } else if (current >= total - 3) {
        pages.push(1, '...')
        for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
        pages.push(1, '...', current - 1, current, current + 1, '...', total)
    }

    return pages
})

const goTo = (page: number) => {
    if (page >= 1 && page <= props.totalPages && page !== props.page) {
        emit('update:page', page)
    }
}
</script>
<template>
    <div v-if="totalPages > 1" class="pagination">
        <button type="button" class="pagination__arrow" :disabled="page === 1" aria-label="Previous page"
            @click="goTo(page - 1)">
            <img src="@/assets/images/arrow-prev.svg" alt="prev" class="pagination__arrow-icon" />
        </button>

        <div class="pagination__numbers">
            <template v-for="(item, index) in visiblePages" :key="`${item}-${index}`">
                <button v-if="typeof item === 'number'" type="button" class="pagination__number"
                    :class="{ active: item === page }" :aria-current="item === page ? 'page' : undefined"
                    @click="goTo(item)">
                    {{ item }}
                </button>
                <span v-else class="pagination__dots">{{ item }}</span>
            </template>
        </div>

        <button type="button" class="pagination__arrow" :disabled="page === totalPages" aria-label="Next page"
            @click="goTo(page + 1)">
            <img src="@/assets/images/arrow-next.svg" alt="next" class="pagination__arrow-icon" />
        </button>
    </div>
</template>
<style scoped lang="scss">
.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 24px;
    padding: 0 40px;

    @media (max-width: 768px) {
        padding: 0;
        gap: 16px;
        flex-wrap: wrap;
    }

    &__arrow {
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        padding: 0;
        transition: opacity 0.2s ease;

        &:hover:not(:disabled) {
            opacity: 0.8;
        }

        &:disabled {
            opacity: 0.3;
            cursor: not-allowed;
        }
    }

    &__arrow-icon {
        width: 36px;
        height: 36px;

        @media (max-width: 768px) {
            width: 28px;
            height: 28px;
        }
    }

    &__numbers {
        display: flex;
        align-items: baseline;
        gap: 20px;

        @media (max-width: 768px) {
            gap: 12px;
        }
    }

    &__number {
        font-family: "Vollkorn", serif;
        background: transparent;
        border: none;
        color: #f8f8f8;
        transition: transform 0.2s ease, opacity 0.2s ease, color 0.2s ease;
        font-size: 20px;
        line-height: 1;
        padding: 0;
        opacity: 0.5;

        &.active {
            font-size: 30px;
            font-weight: 900;
            background: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            opacity: 1;
        }

        @media (max-width: 768px) {
            font-size: 16px;

            &.active {
                font-size: 24px;
            }
        }
    }

    &__dots {
        color: #f8f8f8;
        font-size: 20px;

        @media (max-width: 768px) {
            font-size: 16px;
        }
    }
}
</style>
