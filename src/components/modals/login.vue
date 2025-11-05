<script setup lang='ts'>
import Modal from '@/components/base/modal.vue'
import VerificationForm from '@/components/VirificationForm.vue'
import { useAsyncCallWrapper } from '@/composables/useAsyncCallWrapper';
import { useUserStore } from '@/stores/userStore';
import { fetchGet, fetchPost } from '@/utils/fetchApi';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';

const {t} = useI18n()
const emit = defineEmits(['openRegistration', 'openRecoverPass'])
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
            toast.error('Невірний логін або пароль')
        } else {
            toast.error(t(e.data.msg))
        }
        if (e.status === 403) {
            needVerification.value = true
        }
        return true
    }, 'Ви успішно увішли до облікого запису')
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
            <h2 class="modal__title">Вхід</h2>
        </template>
        <template #body>
            <form v-if="!needVerification" @submit.prevent="login" class="flex flex-column justify-content-center w-full">
                <div class="field w-full">
                    <label for="login" class="w-full">Логін або email</label>
                    <div class="custom-input w-full" :class="{error: v$.username.$error}">
                        <div class="input-bg"></div>
                        <input 
                            v-model="form.username" 
                            id="login" 
                            type="text"
                            placeholder="Введіть логін або email"
                        >
                    </div>
                </div>
                <div class="field w-full">
                    <label for="password">Пароль</label>
                    <div class="custom-input w-full" :class="{error: v$.pass.$error}">
                        <div class="input-bg"></div>
                        <input 
                            v-model="form.pass" 
                            id="password" 
                            :type="passwordHidden ? 'password' : 'text'"
                            placeholder="Введіть пароль"
                        >
                        <div class="password-toggle flex align-items-center" style="z-index: 3;">
                            <img v-show="passwordHidden" @click="passwordHidden = !passwordHidden" src="@/assets/images/show-pass.svg" alt="" class="cursor-pointer">
                            <img v-show="!passwordHidden" @click="passwordHidden = !passwordHidden" src="@/assets/images/hide-pass.svg" alt="" class="cursor-pointer">
                        </div>
                    </div>
                </div>
                <div class="flex gap-1">
                    <span>Ще не зареєструвалися?</span>
                    <a @click="emit('openRegistration'), showed = false" class="underline cursor-pointer">Зареєструватися</a>
                </div>
                <div class="flex gap-1 mt-2">
                    <span>Забули пароль?</span>
                    <a @click="emit('openRecoverPass'), showed = false" class="underline cursor-pointer">Відновити пароль</a>
                </div>
                <button type="submit" class="fantasy-btn mt-3 align-self-center"><span>Увійти</span></button>
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