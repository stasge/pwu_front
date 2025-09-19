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
                <div class="modal__header w-full flex justify-content-between align-items-center md:mb-5 mb-1">
                    <slot name="header"></slot>
                    
                    <img width="36" class="cursor-pointer" @click="emit('update:showed', false), emit('closeDia')" src="@/assets/images/burger-icon-close.svg" alt="close" />
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
    background: url('@/assets/images/modal-bg.jpg') no-repeat center / cover;
    position: relative;
    z-index: 101;
    color: #FFF;
    border: 1px solid #2e2e2e;
    border-radius: 10px;
    max-width: 800px;
    cursor: default;
    padding: 50px;

    ::v-deep(.modal__title)  {
        font-weight: 400;
        font-size: 40px;        
        line-height: 100%;
        letter-spacing: -0.07em;
        text-align: center;
        color: #f8f8f8;

        @media (max-width: 768px) {
            font-size: 30px;
        }
    }
    @media (max-width: 768px) {
        padding: 30px;
    }

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