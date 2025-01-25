<script setup lang='ts'>
import Modal from '@/components/base/modal.vue'

import {reactive, ref} from 'vue'
import {useAsyncCallWrapper} from '@/composables/useAsyncCallWrapper'
import {fetchPost} from '@/utils/fetchApi'
import { required } from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';

const {wrapAsyncCall} = useAsyncCallWrapper()
const isDiaShown = ref(false)
const passwordHidden = ref(true)

interface Form {
    pass: string;
    code: string;
}

const form = reactive<Form>({
    pass: '',
    code: '',
})

const rules = {
    pass: { required },
    code: { required },
}

const v$ = useVuelidate(rules, form, {$stopPropagation: true})
const update = async () => {
    if (!await v$.value.$validate()) {
        return
    }

    wrapAsyncCall(async () => {
        await fetchPost('user/changePassCode', form)
        isDiaShown.value = false
    }, null, 'Пароль для основного акаунту успішно змінено')
}
const showDia = () => {
    reset()
    isDiaShown.value = true
}

const reset = () => {
    form.code = form.pass = ''
    v$.value.$reset()
}

defineExpose({
    showDia
})
</script>
<template>
    <Modal v-model:showed="isDiaShown" @closeDia="reset">
        <template #header>
            <h2 class="modal__title mb-5">Зміна пароля</h2>
        </template>
        <template #body>
            <form @submit.prevent="update" class="flex flex-column justify-content-center w-full">
                <div class="field w-full">
                    <label for="password">Код</label>
                    <div class="relative">
                        <input 
                            v-model="form.code" 
                            type="text"
                            :class="{invalid: v$.code.$error}" 
                            class="text-base text-color p-2 surface-overlay border-1 border-solid appearance-none outline-none focus:border-primary w-full"
                        >
                    </div>
                </div>
                <div class="field w-full">
                    <label for="password">Новий пароль</label>
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
                <!-- <p class="mb-4 w-full font-bold">ВАЖЛИВО! Змінювати пароль можна раз на 3 дні.</p> -->
                <button type="submit" class="btn btn-sm mt-3 align-self-center">Змінити</button>
            </form>
        </template>
    </Modal>
</template>
<style scoped lang='scss'></style>