<script setup lang='ts'>
import Modal from '@/components/base/modal.vue'
import { ref } from 'vue';

const emit = defineEmits(['openLogin'])
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
            <h2 class="modal__title mb-5">Реєстрація</h2>
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
            <div class="field w-full">
                <label for="repeat-password">Повторіть пароль</label>
                <input id="repeat-password" :type="passwordHidden ? 'password' : 'text'" class="text-base p-2 text-color surface-overlay border-1 border-solid appearance-none outline-none focus:border-primary w-full">
            </div>
        </template>
        <template #footer>
            <div class="flex gap-1">
                <span>Вже зареєструвалися?</span>
                <span @click="emit('openLogin'), showed = false" class="underline cursor-pointer">Увійти</span>
            </div>
            <button class="btn btn-sm mt-3">Зареєструватися</button>
        </template>
    </Modal>
</template>
<style scoped lang='scss'>
 
</style>