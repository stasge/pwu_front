<script setup lang='ts'>
import Modal from '@/components/base/modal.vue'
import { useAsyncCallWrapper } from '@/composables/useAsyncCallWrapper';
import { fetchPost } from '@/utils/fetchApi';
import useVuelidate from '@vuelidate/core';
import { email, required } from '@vuelidate/validators';
import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';


const {t} = useI18n()
const emit = defineEmits(['openLogin'])
const toast = useToast();
const {wrapAsyncCall} = useAsyncCallWrapper()
const showed = ref(false)
const form = reactive({
    email: '',
    pass: '',
    code: '',
})

const rules = {
    email: {required, email},
    pass: {required},
    code: {required},
}

const v$ = useVuelidate(rules, form)

function showDia() {
    resetForm()
    showed.value = true
}

const resetForm = () => {
    form.email = ''
}

const recover = async () => {
    if (!await v$.value.$validate()) {
        return
    }
    await wrapAsyncCall(async () => {
        await fetchPost('user/recoverPassCode', {...form})
        showed.value = false
        resetForm()
    }, 
    (e) => {
        toast.error(t(e.data.msg))
        return true
    }, 'Пароль успішно змінено')
}

defineExpose({showDia})
</script>
<template>
    <Modal v-model:showed="showed">
        <template #header>
            <h2 class="modal__title">Зміна пароля</h2>
        </template>
        <template #body>
            <form @submit.prevent="recover" class="flex flex-column justify-content-center w-full">
                <div class="field w-full">
                    <label for="email" class="w-full">Email</label>
                    <div class="custom-input w-full" :class="{ error: v$.email.$error }">
                        <div class="input-bg"></div>
                        <input 
                            v-model="form.email" 
                            id="email" 
                            type="text"
                            placeholder="Введіть email"
                        >
                    </div>
                </div>
                <div class="field w-full">
                    <label for="pass" class="w-full">Новий пароль</label>
                    <div class="custom-input w-full" :class="{ error: v$.pass.$error }">
                        <div class="input-bg"></div>
                        <input 
                            v-model="form.pass" 
                            id="pass" 
                            type="text"
                            placeholder="Введіть новий пароль"
                        >
                    </div>
                </div>
                <div class="field w-full">
                    <label for="code" class="w-full">Код підтвердження</label>
                    <div class="custom-input w-full" :class="{ error: v$.code.$error }">
                        <div class="input-bg"></div>
                        <input 
                            v-model="form.code" 
                            id="code" 
                            type="text"
                            placeholder="Введіть код підтвердження"
                        >
                    </div>
                </div>
                <button type="submit" class="fantasy-btn mt-3 align-self-center"><span>Змінити</span></button>
            </form>
        </template>
    </Modal>
</template>
<style scoped lang='scss'>

</style>