<script setup lang='ts'>
import Modal from '@/components/base/modal.vue'
import { useAsyncCallWrapper } from '@/composables/useAsyncCallWrapper';
import { useUserStore } from '@/stores/userStore';
import { fetchGet, fetchPost } from '@/utils/fetchApi';
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
const needVerification = ref(false)
const form = reactive({
    username: '',
    pass: ''
})

const verificationForm = reactive({
    code: ''
})

const verificationRules = {
    code: {required}
}
const verificationV$ = useVuelidate(verificationRules, verificationForm)

const rules = {
    username: {required},
    pass: {required},
}

const v$ = useVuelidate(rules, form)

function showDia() {
    resetForm()
    showed.value = true
}

const resetForm = () => {
    form.pass = form.username = ''
    passwordHidden.value = true
}

const login = async () => {
    if (!await v$.value.$validate()) {
        return
    }
    await wrapAsyncCall(async () => {
        await userStore.loginUser(form.username, form.pass)
        showed.value = false
        resetForm()
    }, 
    (e) => {
        if (e.status === 401) {
            toast.error("Невірний логін або пароль")
        }
        if (e.status === 403) {
            needVerification.value = true
        }
        return true
    }, 'Ви успішно увішли до облікого запису')
}

const verify = async () => {
    if (!await verificationV$.value.$validate()) {
        return
    }

    await wrapAsyncCall(async () => {
        await fetchPost('user/verification', {code: verificationForm.code})
    }, 
    (e) => {
        if (e.status === 401) {
            toast.error("Код верифікації застарів, натисніть 'Відправити код повторно'")
        }
        return true
    }, 
    'Ви успішно верифікували обліковий запис')
}

const sendVerificationCode = async () => {
    await wrapAsyncCall(async () => {
        await fetchGet('user/verification', {})
    }, 
    (e) => {
        if (e.status === 401) {
            toast.error("")
        }
        return true
    }, 
    'Код верифікації було відправлено повторно. Перевірте вашу електрону пошту')
}

defineExpose({showDia})
</script>
<template>
    <Modal v-model:showed="showed">
        <template #body>
            <form v-if="!needVerification" @submit.prevent="login" class="flex flex-column justify-content-center">
                <h2 class="modal__title mb-5">Увійти</h2>
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
                <div class="flex gap-1">
                    <span>Ще не зареєструвалися?</span>
                    <span @click="emit('openRegistration'), showed = false" class="underline cursor-pointer">Зареєструватися</span>
                </div>
                <button type="submit" class="btn btn-sm mt-3 align-self-center">Увійти</button>
            </form>
            <form @submit.prevent="verify" class="flex flex-column justify-content-center" v-else>
                <h2 class="text-center mb-5">На вашу пошту було відправлено код для верифікації</h2>
                <div class="field w-full">
                    <label for="login" class="w-full">Код для верифікації</label>
                    <input 
                        v-model="verificationForm.code" 
                        id="login" 
                        type="text"
                        :class="{invalid: v$.username.$error}" 
                        class="text-base text-color p-2 surface-overlay border-1 border-solid appearance-none outline-none focus:border-primary w-full"
                    >
                </div>
                <span @click="sendVerificationCode" class="underline cursor-pointer">Відправити код повторно</span>
                <button type="submit" class="btn btn-sm mt-3 align-self-center">Відправити</button>
            </form>
        </template>
    </Modal>
</template>
<style scoped lang='scss'>

</style>