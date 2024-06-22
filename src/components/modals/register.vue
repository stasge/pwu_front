<script setup lang='ts'>
import Modal from '@/components/base/modal.vue'
import { reactive, ref } from 'vue';
import { fetchPost } from '@/utils/fetchApi';
import { required, email } from '@vuelidate/validators'
import { useVuelidate } from '@vuelidate/core'
import {type RegisterData} from '@/models/register-data'
import { useAsyncCallWrapper } from '@/composables/useAsyncCallWrapper';
import { useToast } from 'vue-toastification';
import { useUserStore } from '@/stores/userStore';

const {wrapAsyncCall} = useAsyncCallWrapper()
const emit = defineEmits(['openLogin'])
const toast = useToast();
const showed = ref(false)
const passwordHidden = ref(true)
const form = reactive<RegisterData>({
    username: '',
    pass: '',
    email: ''
})
const rules = {
    username: {required},
    pass: {required},
    email: {email, required}
}

const v$ = useVuelidate(rules, form)

function showDia() {
    showed.value = true
}

const register = async () => {
    if (!await v$.value.$validate()) {
        return
    }

    await wrapAsyncCall(async () => {
        const {data} = await fetchPost('signup', form)
        showed.value = false
        form.username = form.email = form.pass = ''
        localStorage.setItem("pwu_token", data.access_token);
        localStorage.setItem("pwu_refresh_token", data.refresh_token);
        useUserStore().loadUser()
    }, 
    (e) => {
        if (e.status === 409) {
            toast.error("Користувач з таким email вже існує")
        }
        return true
    }, 
    'Ви успішно зареєструвалися')
}
defineExpose({showDia})
</script>
<template>
    <Modal v-model:showed="showed">
        <template #header>
            <h2 class="modal__title mb-5">Реєстрація</h2>
        </template>
        <template #body>
            <form @submit.prevent="register" class="flex flex-column align-items-center">
                <div class="field w-full">
                    <label for="email" class="w-full">Ваш email</label>
                    <input v-model="form.email" id="email" type="email" class="text-base text-color p-2 surface-overlay border-1 border-solid appearance-none outline-none focus:border-primary w-full">
                </div>
                <div class="field w-full">
                    <label for="login" class="w-full">Логін</label>
                    <input v-model="form.username" id="login" type="text" class="text-base text-color p-2 surface-overlay border-1 border-solid appearance-none outline-none focus:border-primary w-full">
                </div>
                <div class="field w-full">
                    <label for="password">Пароль</label>
                    <input v-model="form.pass" id="password" :type="passwordHidden ? 'password' : 'text'" class="text-base text-color p-2 surface-overlay border-1 border-solid appearance-none outline-none focus:border-primary w-full">
                </div>
                <div class="field w-full">
                    <label for="repeat-password">Повторіть пароль</label>
                    <input id="repeat-password" :type="passwordHidden ? 'password' : 'text'" class="text-base p-2 text-color surface-overlay border-1 border-solid appearance-none outline-none focus:border-primary w-full">
                </div>
                <div class="flex gap-1">
                    <span>Вже зареєструвалися?</span>
                    <span @click="emit('openLogin'), showed = false" class="underline cursor-pointer">Увійти</span>
                </div>
                <button type="submit" class="btn btn-sm mt-3">Зареєструватися</button>
            </form>
        </template>
    </Modal>
</template>
<style scoped lang='scss'>
 
</style>