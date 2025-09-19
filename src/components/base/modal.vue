<script setup lang='ts'>
import { ref } from 'vue';

const modalRef = ref<HTMLElement | null>(null)
const props = defineProps<{showed: boolean}>()
const emit = defineEmits(['update:showed', 'closeDia'])

function closeModal(e: Event) {
    if (modalRef.value && !modalRef.value?.contains(e.target as Node)) {
        emit('update:showed', false)
        emit('closeDia')
    }
}

</script>
<template>
    <Teleport to="body">
        <div v-if="showed" @click="closeModal" class="back-mask w-screen h-screen flex align-items-center justify-content-center cursor-pointer">
            <div ref="modalRef" class="modal flex flex-column align-items-center justify-content-between">
                <!-- Corner icons -->
                <div class="corner-icon corner-tl">
                    <img src="@/assets/images/Corner-TL.svg" alt="Top Left Corner" />
                </div>
                <div class="corner-icon corner-tr">
                    <img src="@/assets/images/Corner-TR.svg" alt="Top Right Corner" />
                </div>
                <div class="corner-icon corner-bl">
                    <img src="@/assets/images/Corner-BL.svg" alt="Bottom Left Corner" />
                </div>
                <div class="corner-icon corner-br">
                    <img src="@/assets/images/Corner-BR.svg" alt="Bottom Right Corner" />
                </div>
                
                <div class="absolute cursor-pointer" style="top: 20px;right: 20px;">
                    
                </div>
                <div class="modal__header w-full flex justify-content-between">
                    <slot name="header"></slot>
                    <svg @click="emit('update:showed', false), emit('closeDia')" width="19" height="21" viewBox="0 0 19 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0.999978 1L18 19" stroke="white" stroke-width="2"/>
                        <path d="M18.2496 1.00007L1.24963 19.5002" stroke="white" stroke-width="2"/>
                    </svg>
                </div>
                <div class="modal__body w-full flex flex-column align-items-center">
                    <slot name="body"></slot>
                </div>
                <div class="modal__footer w-full flex flex-column align-items-center">
                    <slot name="footer"></slot>
                </div>
            </div>
        </div>
    </Teleport>
</template>
<style scoped lang='scss'>
.back-mask {
    background: rgba(9, 9, 9, 0.5);
    position: fixed;
    top: 0;
    left: 0;
    z-index: 100;
}
.modal {
    background: linear-gradient(180deg, #16171b 20%, rgba(39, 50, 68, 1.51) 100%);
    position: relative;
    z-index: 101;
    color: #FFF;
    border: 1px solid #2e2e2e;
    border-radius: 10px;
    min-width: 500px;
    cursor: default;
    padding: 50px;

    @media (max-width: 550px) {
        min-width: auto;
        width: 90%;
    }
}

.corner-icon {
    position: absolute;
    width: 40px;
    height: 40px;
    z-index: 102;
    pointer-events: none;

    img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }

    &.corner-tl {
        top: -3px;
        left: -3px;
    }

    &.corner-tr {
        top: -3px;
        right: -3px;
    }

    &.corner-bl {
        bottom: -3px;
        left: -3px;
    }

    &.corner-br {
        bottom: -3px;
        right: -3px;
    }
}
</style>