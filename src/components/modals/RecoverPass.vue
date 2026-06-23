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
const emit = defineEmits(['openLogin', 'openRecoverPassCode'])
const toast = useToast();
const {wrapAsyncCall} = useAsyncCallWrapper()
const showed = ref(false)
const form = reactive({
    email: '',
})

const rules = {
    email: {required, email},
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
        await fetchPost('user/recoverPass', {email: form.email})
        showed.value = false
        emit('openRecoverPassCode')
        resetForm()
    }, 
    (e) => {
        toast.error(t(e.data.msg))
        return true
    }, 'На вашу пошту було відправлено листа з кодом підтвердження')
}

defineExpose({showDia})
</script>
<template>
    <Modal v-model:showed="showed">
        <template #header>
            <h2 class="modal__title">Відновлення паролю</h2>
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
                <div class="flex gap-1">
                    <span @click="emit('openLogin'), showed = false" class="underline cursor-pointer">Повернутися до входу</span>
                </div>
                <button type="submit" class="fantasy-btn mt-3 align-self-center"><span>Надіслати код</span></button>
            </form>
        </template>
    </Modal>
</template>
<style scoped lang='scss'>

</style>