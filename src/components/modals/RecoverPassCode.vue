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
                    <input 
                        v-model="form.email" 
                        id="email" 
                        type="text"
                        :class="{invalid: v$.email.$error}" 
                        class="text-base text-color p-2 surface-overlay border-1 border-solid appearance-none outline-none focus:border-primary w-full"
                    >
                </div>
                <div class="field w-full">
                    <label for="pass" class="w-full">Новий пароль</label>
                    <input 
                        v-model="form.pass" 
                        id="pass" 
                        type="text"
                        :class="{invalid: v$.pass.$error}" 
                        class="text-base text-color p-2 surface-overlay border-1 border-solid appearance-none outline-none focus:border-primary w-full"
                    >
                </div>
                <div class="field w-full">
                    <label for="code" class="w-full">Код підтвердження</label>
                    <input 
                        v-model="form.code" 
                        id="code" 
                        type="text"
                        :class="{invalid: v$.code.$error}" 
                        class="text-base text-color p-2 surface-overlay border-1 border-solid appearance-none outline-none focus:border-primary w-full"
                    >
                </div>
                <button type="submit" class="fantasy-btn mt-3 align-self-center"><span>Змінити</span></button>
            </form>
        </template>
    </Modal>
</template>
<style scoped lang='scss'>

</style>