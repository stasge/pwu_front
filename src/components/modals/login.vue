<script setup lang='ts'>
import Modal from '@/components/base/modal.vue'
import { useAsyncCallWrapper } from '@/composables/useAsyncCallWrapper';
import { useUserStore } from '@/stores/userStore';
import { fetchPost } from '@/utils/fetchApi';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { reactive, ref } from 'vue';
import { useToast } from 'vue-toastification';

const emit = defineEmits(['openRegistration'])
const toast = useToast();
const {wrapAsyncCall} = useAsyncCallWrapper()
const userStore = useUserStore()
const showed = ref(false)
const passwordHidden = ref(true)
const form = reactive({
    username: '',
    pass: ''
})
const response = ref('')
const rules = {
    username: {required},
    pass: {required},
}

const v$ = useVuelidate(rules, form)

function showDia() {
    showed.value = true
}

const login = async () => {
    if (!await v$.value.$validate()) {
        return
    }
    await wrapAsyncCall(async () => {
        await userStore.loginUser(form.username, form.pass)
        showed.value = false
    }, 
    (e) => {
        if (e.status === 401) {
            toast.error("Невірний логін або пароль")
        }
        return true
    }, 'Ви успішно увішли до облікого запису')
}

defineExpose({showDia})
</script>
<template>
    <Modal v-model:showed="showed">
        <template #header>
            <h2 class="modal__title mb-5">Увійти</h2>
        </template>
        <template #body>
            <form @submit.prevent="login" class="flex flex-column justify-content-center">
                <div class="field w-full">
                    <label for="login" class="w-full">Логін</label>
                    <input v-model="form.username" id="login" type="text" class="text-base text-color p-2 surface-overlay border-1 border-solid appearance-none outline-none focus:border-primary w-full">
                </div>
                <div class="field w-full">
                    <label for="password">Пароль</label>
                    <input v-model="form.pass" id="password" :type="passwordHidden ? 'password' : 'text'" class="text-base text-color p-2 surface-overlay border-1 border-solid appearance-none outline-none focus:border-primary w-full">
                </div>
                <div class="flex gap-1">
                    <span>Ще не зареєструвалися?</span>
                    <span @click="emit('openRegistration'), showed = false" class="underline cursor-pointer">Зареєструватися</span>
                </div>
                <button type="submit" class="btn btn-sm mt-3 align-self-center">Увійти</button>
            </form>
        </template>
    </Modal>
</template>
<style scoped lang='scss'>

</style>