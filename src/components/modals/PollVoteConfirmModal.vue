<script setup lang='ts'>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue';

const emit = defineEmits<{ (e: 'confirm'): void }>()

const showed = ref(false)
const pollTitle = ref('')
const optionText = ref('')
const confirmBtnRef = ref<HTMLButtonElement | null>(null)

function showDia(params: { pollTitle: string; optionText: string }) {
    pollTitle.value = params.pollTitle
    optionText.value = params.optionText
    showed.value = true
}

const close = () => { showed.value = false }

const confirm = () => {
    showed.value = false
    emit('confirm')
}

defineExpose({ showDia })

const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close()
}

watch(showed, async value => {
    if (value) {
        document.addEventListener('keydown', onKeydown)
        await nextTick()
        confirmBtnRef.value?.focus()
    } else {
        document.removeEventListener('keydown', onKeydown)
    }
})

onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>
<template>
    <Teleport to="body">
        <Transition name="pvc-fade">
            <div v-if="showed" class="pvc-mask" @click.self="close">
                <div class="pvc" role="alertdialog" aria-modal="true" aria-labelledby="pvc-title" aria-describedby="pvc-warning">
                    <div class="pvc__corner pvc__corner--top-left"></div>
                    <div class="pvc__corner pvc__corner--top-right"></div>
                    <div class="pvc__corner pvc__corner--bottom-left"></div>
                    <div class="pvc__corner pvc__corner--bottom-right"></div>

                    <button type="button" class="pvc__close" aria-label="Закрити" @click="close">
                        <i class="pi pi-times"></i>
                    </button>

                    <h2 id="pvc-title" class="pvc__title">Підтвердіть голос</h2>
                    <p class="pvc__poll">{{ pollTitle }}</p>

                    <div class="pvc__choice">
                        <span class="pvc__choice-label">Ваш вибір</span>
                        <span class="pvc__choice-text">{{ optionText }}</span>
                    </div>

                    <p id="pvc-warning" class="pvc__warning">
                        <i class="pi pi-exclamation-triangle"></i>
                        Голос не можна буде змінити або відкликати.
                    </p>

                    <div class="pvc__actions">
                        <button type="button" class="pvc__cancel" @click="close">Скасувати</button>
                        <button ref="confirmBtnRef" type="button" class="fantasy-btn small pvc__confirm" @click="confirm">
                            <span>Проголосувати</span>
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
<style scoped lang='scss'>
.pvc-mask {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(3px);
}

.pvc {
    position: relative;
    width: min(440px, 100%);
    display: flex;
    flex-direction: column;
    padding: 30px;
    color: #f8f8f8;
    background:
        radial-gradient(120% 60% at 0% 0%, rgba(251, 210, 152, 0.12) 0%, transparent 60%),
        #111;
    border: 1px solid rgba(250, 250, 250, 0.08);
    border-radius: 5px;
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.8);

    @media (max-width: 767px) {
        padding: 22px 16px;
    }

    &__corner {
        position: absolute;
        width: 10px;
        height: 10px;
        background: url('@/assets/images/profile-corner.svg') no-repeat center / contain;
        z-index: 1;
        pointer-events: none;

        &--top-left { top: -1px; left: -1px; }
        &--top-right { top: -1px; right: -1px; transform: rotate(90deg); }
        &--bottom-left { bottom: -1px; left: -1px; transform: rotate(-90deg); }
        &--bottom-right { bottom: -1px; right: -1px; transform: rotate(180deg); }
    }

    &__close {
        position: absolute;
        top: 16px;
        right: 16px;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        border: 1px solid rgba(250, 250, 250, 0.12);
        background: rgba(0, 0, 0, 0.4);
        color: rgba(248, 248, 248, 0.7);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s ease, border-color 0.2s ease;

        &:hover {
            color: #fbd298;
            border-color: rgba(251, 210, 152, 0.5);
        }
    }

    &__title {
        margin: 0;
        padding-right: 40px;
        font-size: clamp(24px, 4vw, 30px);
        font-weight: 400;
        line-height: 1.1;
        letter-spacing: -0.05em;
        background: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    &__poll {
        margin: 8px 0 0;
        padding-right: 40px;
        font-family: "Candara", sans-serif;
        font-size: 14px;
        color: rgba(248, 248, 248, 0.5);
        overflow-wrap: anywhere;
    }

    &__choice {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-top: 20px;
        padding: 14px 16px;
        background: rgba(251, 210, 152, 0.06);
        border-left: 2px solid #fbd298;
        border-radius: 0 5px 5px 0;
    }

    &__choice-label {
        font-family: "Candara", sans-serif;
        font-size: 12px;
        color: rgba(248, 248, 248, 0.5);
    }

    &__choice-text {
        font-size: 18px;
        line-height: 1.2;
        color: #fbd298;
        overflow-wrap: anywhere;
    }

    &__warning {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        margin: 16px 0 0;
        font-family: "Candara", sans-serif;
        font-size: 14px;
        line-height: 1.4;
        color: rgba(248, 248, 248, 0.7);

        i {
            margin-top: 2px;
            font-size: 13px;
            color: #ffb74d;
        }
    }

    &__actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        flex-wrap: wrap;
        gap: 28px;
        margin-top: 26px;

        @media (max-width: 480px) {
            flex-direction: column-reverse;
            gap: 14px;
        }
    }

    &__cancel {
        padding: 6px 0;
        border: none;
        background: none;
        color: rgba(248, 248, 248, 0.6);
        font-family: "Candara", sans-serif;
        font-size: 15px;
        text-decoration: underline;
        text-underline-offset: 3px;
        cursor: pointer;
        transition: color 0.2s ease;

        &:hover { color: #f8f8f8; }
    }

    &__confirm {
        min-width: 180px;
        margin-right: 18px;

        @media (max-width: 480px) {
            margin: 0 18px;
        }
    }
}

.pvc-fade-enter-active,
.pvc-fade-leave-active {
    transition: opacity 0.2s ease;

    .pvc { transition: transform 0.2s ease; }
}

.pvc-fade-enter-from,
.pvc-fade-leave-to {
    opacity: 0;

    .pvc { transform: translateY(12px) scale(0.98); }
}
</style>
