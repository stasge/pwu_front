<script setup lang='ts'>
import { onBeforeUnmount, watch } from 'vue';

const props = defineProps<{
    showed: boolean
}>()

const emit = defineEmits<{
    (e: 'update:showed', value: boolean): void
}>()

const close = () => emit('update:showed', false)

const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close()
}

watch(() => props.showed, (showed) => {
    if (showed) document.addEventListener('keydown', onKeydown)
    else document.removeEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>
<template>
    <Teleport to="body">
        <Transition name="sheet">
            <div v-if="showed" class="sheet" @click.self="close">
                <div class="sheet__panel" role="dialog" aria-modal="true">
                    <slot></slot>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
<style scoped lang='scss'>
.sheet {
    position: fixed;
    inset: 0;
    z-index: 10000;
    display: flex;
    align-items: flex-end;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);

    &__panel {
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        padding: 30px 20px calc(40px + env(safe-area-inset-bottom));
        border: 1px solid rgba(248, 248, 248, 0.1);
        border-bottom: none;
        border-radius: 20px 20px 0 0;
        background: radial-gradient(120% 60% at 20% 0%, #353535 0%, #1c1c1c 60%, #161616 100%);
        color: #f8f8f8;
    }
}

.sheet-enter-active,
.sheet-leave-active {
    transition: opacity 0.25s ease;

    .sheet__panel { transition: transform 0.25s ease; }
}

.sheet-enter-from,
.sheet-leave-to {
    opacity: 0;

    .sheet__panel { transform: translateY(100%); }
}
</style>
