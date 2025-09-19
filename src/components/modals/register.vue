<script setup lang='ts'>
import Modal from '@/components/base/modal.vue'
import VerificationForm from '@/components/VirificationForm.vue'
import { reactive, ref } from 'vue';
import { fetchPost } from '@/utils/fetchApi';
import { required, email, sameAs } from '@vuelidate/validators'
import { useVuelidate } from '@vuelidate/core'
import {type RegisterData} from '@/models/register-data'
import { useAsyncCallWrapper } from '@/composables/useAsyncCallWrapper';
import { useToast } from 'vue-toastification';
import { useUserStore } from '@/stores/userStore';
import Checkbox from 'primevue/checkbox';
import { RouterLink } from 'vue-router';
import { useI18n } from 'vue-i18n';

const {t} = useI18n()
const {wrapAsyncCall} = useAsyncCallWrapper()
const emit = defineEmits(['openLogin'])
const toast = useToast();
const showed = ref(false)
const passwordHidden = ref(true)
const repeatPasswordHidden = ref(true)
const requiredTrue = (value: boolean) => value === true
const needVerification = ref(false)
const form = reactive<RegisterData>({
    username: '',
    pass: '',
    email: '',
    repeat_pass: '',
    rules: false,
    phone: '',
    name: '',
    ref: '',
})
const rules = {
    username: {required},
    name: {required},
    phone: {required},
    pass: {required},
    email: {email, required},
    repeat_pass: {required, sameAs: (val: string) => val === form.pass},
    rules: {requiredTrue}
}

const v$ = useVuelidate(rules, form)

function showDia() {
    resetForm()
    showed.value = true
}

const resetForm = () => {
    form.username = form.email = form.pass = form.repeat_pass = form.phone = form.name = ''
    form.rules = false
    passwordHidden.value = repeatPasswordHidden.value = true
}

const register = async () => {
    if (!await v$.value.$validate()) {
        return
    }



    const body = Object.assign({...form})
    delete body.repeat_pass
    if (!body.ref) delete body.ref

    await wrapAsyncCall(async () => {
        const {data} = await fetchPost('signup', body)
        showed.value = false
        useUserStore().loadUser()
        resetForm()
        v$.value.$reset()
    }, 
    (e) => {
        if (typeof e.data?.msg === 'string' && e.data.msg.includes('Invalid character:')) {
            toast.error('Реферальний код невірний');
        } else {
            toast.error(t(e.data.msg));
        }
        if (e.status === 403) {
            needVerification.value = true
        }
        

        return true
    }, 
    'Ви успішно зареєструвалися')
}

const onVerificationDone = () => {
    showed.value = false
    needVerification.value = false
}
defineExpose({showDia})
</script>
<template>
    <Modal v-model:showed="showed" @closeDia="needVerification = false">
        <template #header>
            <h2 class="modal__title">Реєстрація</h2>
        </template>
        <template #body>
            <form v-if="!needVerification" @submit.prevent="register" class="flex flex-column align-items-center w-full">
                <div class="field w-full">
                    <label for="email" class="w-full">Ваш email</label>
                    <div class="custom-input w-full" :class="{error: v$.email.$error}">
                        <div class="input-bg"></div>
                        <input 
                            v-model="form.email" 
                            id="email" 
                            type="email" 
                            placeholder="Введіть email"
                        >
                    </div>
                </div>
                <div class="field w-full">
                    <label for="login" class="w-full">Логін</label>
                    <div class="custom-input w-full" :class="{error: v$.username.$error}">
                        <div class="input-bg"></div>
                        <input 
                            v-model="form.username" 
                            id="login" 
                            type="text" 
                            placeholder="Введіть логін"
                        >
                    </div>
                </div>
                <div class="field w-full">
                    <label for="name" class="w-full">Ім'я для форуму</label>
                    <div class="custom-input w-full" :class="{error: v$.name.$error}">
                        <div class="input-bg"></div>
                        <input 
                            v-model="form.name" 
                            id="name" 
                            type="text" 
                            placeholder="Введіть ім'я для форуму"
                        >
                    </div>
                </div>
                <div class="field w-full">
                    <label for="ref" class="w-full">Реферальний код (необов'язково)</label>
                    <div class="custom-input w-full">
                        <div class="input-bg"></div>
                        <input 
                            v-model="form.ref" 
                            id="ref" 
                            type="text" 
                            placeholder="Введіть реферальний код"
                        >
                    </div>
                </div>
                <div class="field w-full">
                    <label for="phone" class="w-full">Номер телефону</label>
                    <div class="custom-input w-full" :class="{error: v$.phone.$error}">
                        <div class="input-bg"></div>
                        <input 
                            v-model="form.phone" 
                            id="phone" 
                            type="text" 
                            placeholder="Введіть номер телефону"
                        >
                    </div>
                </div>
                <div class="field w-full">
                    <label for="password" class="w-full">Пароль</label>
                    <div class="custom-input w-full" :class="{error: v$.pass.$error}">
                        <div class="input-bg"></div>
                        <input 
                            v-model="form.pass" 
                            id="password" 
                            :type="passwordHidden ? 'password' : 'text'" 
                            placeholder="Введіть пароль"
                        >
                        <div class="absolute right-10px top-0 flex align-items-center h-full" style="z-index: 3;">
                            <img v-show="passwordHidden" @click="passwordHidden = !passwordHidden" src="@/assets/images/show-pass.svg" alt="" class="cursor-pointer">
                            <img v-show="!passwordHidden" @click="passwordHidden = !passwordHidden" src="@/assets/images/hide-pass.svg" alt="" class="cursor-pointer">
                        </div>
                    </div>
                </div>
                <div class="field w-full">
                    <label for="repeat-password">Повторіть пароль</label>
                    <div class="custom-input w-full" :class="{error: v$.repeat_pass.$error}">
                        <div class="input-bg"></div>
                        <input 
                            v-model="form.repeat_pass" 
                            id="repeat-password" 
                            :type="repeatPasswordHidden ? 'password' : 'text'" 
                            placeholder="Повторіть пароль"
                        >
                        <div class="absolute right-10px top-0 flex align-items-center h-full" style="z-index: 3;">
                            <img v-show="repeatPasswordHidden" @click="repeatPasswordHidden = !repeatPasswordHidden" src="@/assets/images/show-pass.svg" alt="" class="cursor-pointer">
                            <img v-show="!repeatPasswordHidden" @click="repeatPasswordHidden = !repeatPasswordHidden" src="@/assets/images/hide-pass.svg" alt="" class="cursor-pointer">
                        </div>
                    </div>
                </div>
                <div class="field w-full">
                    <Checkbox v-model="form.rules" :binary="true" :invalid="v$.rules.$error" />
                    <span class="ml-2">Погоджуюсь з </span>
                    <router-link :to="{name: 'terms'}" class="underline">користувацькою угодою</router-link>
                </div>
                <div class="flex gap-1">
                    <span>Вже зареєструвалися?</span>
                    <span @click="emit('openLogin'), showed = false" class="underline cursor-pointer">Увійти</span>
                </div>
                <button type="submit" class="btn btn-sm mt-3">Зареєструватися</button>
            </form>
            <VerificationForm v-else  @verificationDone="onVerificationDone"/>
        </template>
    </Modal>
</template>
<style scoped lang='scss'>
.custom-input {
  position: relative;
  
  .absolute {
    position: absolute;
    right: 10px;
    top: 0;
    display: flex;
    align-items: center;
    height: 100%;
    z-index: 3;
    
    img {
      cursor: pointer;
      width: 20px;
      height: 20px;
      opacity: 0.7;
      transition: opacity 0.3s ease;
      
      &:hover {
        opacity: 1;
      }
    }
  }
}
</style>