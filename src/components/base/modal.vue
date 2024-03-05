<script setup lang='ts'>
import { ref } from 'vue';

const modalRef = ref<HTMLElement | null>(null)
const props = defineProps<{showed: boolean}>()
const emit = defineEmits(['update:showed'])

function closeModal(e: Event) {
    if (!modalRef.value?.contains(e.target as Node)) {
        emit('update:showed', false)
    }
}

</script>
<template>
    <Teleport to="body">
        <div v-if="showed" @click="closeModal" class="back-mask w-screen h-screen flex align-items-center justify-content-center cursor-pointer">
            <div ref="modalRef" class="modal py-5 px-6 flex flex-column align-items-center justify-content-between">
                <div class="absolute cursor-pointer" style="top: 20px;right: 20px;">
                    <svg @click="emit('update:showed', false)" width="19" height="21" viewBox="0 0 19 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0.999978 1L18 19" stroke="white" stroke-width="2"/>
                        <path d="M18.2496 1.00007L1.24963 19.5002" stroke="white" stroke-width="2"/>
                    </svg>
                </div>
                <div class="modal__header w-full flex justify-content-center">
                    <slot name="header"></slot>
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
    text-shadow: 3px 0px 7px rgba(81, 67, 21, 0.8), -3px 0px 7px rgba(81, 67, 21, 0.8), 0px 4px 7px rgba(81, 67, 21, 0.8);
    border: 1px solid #2e2e2e;
    border-radius: 10px;
    width: 500px;
    cursor: default;

    @media (max-width: 550px) {
        width: 90%;
    }
}
</style>