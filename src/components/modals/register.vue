<script setup lang='ts'>
import Modal from '@/components/base/modal.vue'
import { reactive, ref } from 'vue';
import { fetchPost } from '@/utils/fetchApi';
import { required, email, sameAs } from '@vuelidate/validators'
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
const repeatPasswordHidden = ref(true)
const form = reactive<RegisterData>({
    username: '',
    pass: '',
    email: '',
    repeat_pass: ''
})
const rules = {
    username: {required},
    pass: {required},
    email: {email, required},
    repeat_pass: {required, sameAs: (val: string) => val === form.pass}
}

const v$ = useVuelidate(rules, form)

function showDia() {
    resetForm()
    showed.value = true
}

const resetForm = () => {
    form.username = form.email = form.pass = form.repeat_pass = ''
    passwordHidden.value = repeatPasswordHidden.value = true
}

const register = async () => {
    if (!await v$.value.$validate()) {
        return
    }

    const body = Object.assign({...form})
    delete body.repeat_pass

    await wrapAsyncCall(async () => {
        const {data} = await fetchPost('signup', body)
        showed.value = false
        localStorage.setItem("pwu_token", data.access_token);
        localStorage.setItem("pwu_refresh_token", data.refresh_token);
        useUserStore().loadUser()
        resetForm()
        v$.value.$reset()
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
                    <input 
                        v-model="form.email" 
                        id="email" 
                        type="email" 
                        :class="{invalid: v$.email.$error}"
                        class="text-base text-color p-2 surface-overlay border-1 border-solid appearance-none outline-none focus:border-primary w-full"
                    >
                </div>
                <div class="field w-full">
                    <label for="login" class="w-full">Логін</label>
                    <input 
                        v-model="form.username" 
                        id="login" 
                        type="text" 
                        :class="{invalid: v$.username.$error}"
                        class="text-base text-color p-2 surface-overlay border-1 border-solid appearance-none outline-none focus:border-primary w-full"
                    >
                </div>
                <div class="field w-full">
                    <label for="password">Пароль</label>
                    <div class="relative">
                        <input 
                            v-model="form.pass" 
                            id="password" 
                            :type="passwordHidden ? 'password' : 'text'" 
                            :class="{invalid: v$.pass.$error}"
                            class="text-base text-color p-2 surface-overlay border-1 border-solid appearance-none outline-none focus:border-primary w-full"
                        >
                        <div class="absolute right-10px top-0 flex align-items-center h-full">
                            <img v-show="passwordHidden" @click="passwordHidden = !passwordHidden" src="@/assets/images/show-pass.svg" alt="">
                            <img v-show="!passwordHidden" @click="passwordHidden = !passwordHidden" src="@/assets/images/hide-pass.svg" alt="">
                        </div>
                    </div>
                </div>
                <div class="field w-full">
                    <label for="repeat-password">Повторіть пароль</label>
                    <div class="relative">
                        <input 
                            v-model="form.repeat_pass" 
                            id="repeat-password" 
                            :type="repeatPasswordHidden ? 'password' : 'text'" 
                            :class="{invalid: v$.repeat_pass.$error}"
                            class="text-base p-2 text-color surface-overlay border-1 border-solid appearance-none outline-none focus:border-primary w-full"
                        >
                        <div class="absolute right-10px top-0 flex align-items-center h-full">
                            <img v-show="repeatPasswordHidden" @click="repeatPasswordHidden = !repeatPasswordHidden" src="@/assets/images/show-pass.svg" alt="">
                            <img v-show="!repeatPasswordHidden" @click="repeatPasswordHidden = !repeatPasswordHidden" src="@/assets/images/hide-pass.svg" alt="">
                        </div>
                    </div>
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