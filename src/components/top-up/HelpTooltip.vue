<script setup lang='ts'>
import { onBeforeUnmount, onMounted, ref } from 'vue';

defineProps<{
    text: string
}>()

// Відкриття по кліку — для пристроїв без hover
const opened = ref(false)
const close = () => {
    opened.value = false
}

onMounted(() => document.addEventListener('click', close))
onBeforeUnmount(() => document.removeEventListener('click', close))
</script>
<template>
    <span class="help" :class="{ 'help--open': opened }">
        <button type="button" class="help__btn" :aria-label="text" @click.stop="opened = !opened">
            <img src="@/assets/images/top-up/question.svg" alt="" width="16" height="16">
        </button>
        <span class="help__bubble" role="tooltip">{{ text }}</span>
    </span>
</template>
<style scoped lang='scss'>
.help {
    position: relative;
    display: inline-flex;
    vertical-align: middle;

    &__btn {
        display: flex;
        padding: 0;
        border: none;
        background: none;
        transition: opacity 0.2s ease;

        &:hover { opacity: 0.7; }
    }

    &__bubble {
        position: absolute;
        top: calc(100% + 6px);
        right: -4px;
        z-index: 10;
        width: max-content;
        max-width: 220px;
        padding: 8px 10px;
        border: 1px solid rgba(248, 248, 248, 0.2);
        border-radius: 5px;
        background: #1c1c1c;
        color: #f8f8f8;
        font-family: "Candara", sans-serif;
        font-size: 13px;
        line-height: 1.2;
        letter-spacing: normal;
        text-align: left;
        text-transform: none;
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transition: opacity 0.2s ease, visibility 0.2s ease;
    }

    &:hover,
    &:focus-within,
    &--open {
        .help__bubble {
            opacity: 1;
            visibility: visible;
        }
    }
}
</style>
