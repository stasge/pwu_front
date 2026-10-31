<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * Горизонтальна прокрутка для широких таблиць і сітки: тонкий золотий скролбар
 * і затемнення по краях, поки є що гортати (на телефонах скролбар часто прихований).
 */
const inner = ref<HTMLElement | null>(null)
const canLeft = ref(false)
const canRight = ref(false)

const update = () => {
    const el = inner.value
    if (!el) return
    canLeft.value = el.scrollLeft > 2
    canRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 2
}

let observer: ResizeObserver | undefined

onMounted(() => {
    update()
    observer = new ResizeObserver(update)
    if (inner.value) {
        observer.observe(inner.value)
        if (inner.value.firstElementChild) observer.observe(inner.value.firstElementChild)
    }
})

onBeforeUnmount(() => observer?.disconnect())
</script>
<template>
    <div class="scroll-x" :class="{ 'scroll-x--left': canLeft, 'scroll-x--right': canRight }">
        <div ref="inner" class="scroll-x__inner" @scroll.passive="update">
            <slot />
        </div>
        <span v-if="canRight && !canLeft" class="scroll-x__hint" aria-hidden="true"><i class="pi pi-angle-double-right"></i></span>
    </div>
</template>
