<script setup lang='ts'>
import Modal from '@/components/base/modal.vue'
import { ref } from 'vue';

const emit = defineEmits(['openRegistration'])
const showed = ref(false)
const passwordHidden = ref(true)

function showDia() {
    showed.value = true
}

defineExpose({showDia})
</script>
<template>
    <Modal v-model:showed="showed">
        <template #header>
            <h2 class="modal__title mb-5">Увійти</h2>
        </template>
        <template #body>
            <div class="field w-full">
                <label for="email" class="w-full">Ваш email</label>
                <input id="email" type="email" class="text-base text-color p-2 surface-overlay border-1 border-solid appearance-none outline-none focus:border-primary w-full">
            </div>
            <div class="field w-full">
                <label for="login" class="w-full">Логін</label>
                <input id="login" type="text" class="text-base text-color p-2 surface-overlay border-1 border-solid appearance-none outline-none focus:border-primary w-full">
            </div>
            <div class="field w-full">
                <label for="password">Пароль</label>
                <input id="password" :type="passwordHidden ? 'password' : 'text'" class="text-base text-color p-2 surface-overlay border-1 border-solid appearance-none outline-none focus:border-primary w-full">
            </div>
        </template>
        <template #footer>
            <div class="flex gap-1">
                <span>Ще не зареєструвалися?</span>
                <span @click="emit('openRegistration'), showed = false" class="underline cursor-pointer">Зареєструватися</span>
            </div>
            <button class="btn btn-sm mt-3">Увійти</button>
        </template>
    </Modal>
</template>
<style scoped lang='scss'>

</style>