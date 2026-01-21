<script setup lang='ts'>
import Modal from '@/components/base/modal.vue'

import {reactive, ref} from 'vue'
import {useAsyncCallWrapper} from '@/composables/useAsyncCallWrapper'
import {fetchPost} from '@/utils/fetchApi'
import { required, sameAs, maxLength } from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';

const {wrapAsyncCall} = useAsyncCallWrapper()
const isDiaShown = ref(false)
const passwordHidden = ref(true)
const gameAccPassHidden = ref(true)
const repeatPasswordHidden = ref(true)

interface Form {
    main_pass: string;
    id_user_game: number | null;
    pass: string;
    repeat_pass: string;
}

const form = reactive<Form>({
    main_pass: '',
    id_user_game: null,
    pass: '',
    repeat_pass: ''
})

const rules = {
    main_pass: { required },
    pass: { required, maxLength: maxLength(20) },
    repeat_pass: { required, sameAs: (val: string) => val === form.pass, maxLength: maxLength(20) }
}

const v$ = useVuelidate(rules, form, {$stopPropagation: true})
const update = async () => {
    if (!await v$.value.$validate()) {
        return
    }

    wrapAsyncCall(async () => {
        await fetchPost('user/changeGamePass', form)
        isDiaShown.value = false
    }, null, 'Пароль для ігрового акаунту успішно змінено')
}
const showDia = (id: number) => {
    reset()
    form.id_user_game = id
    isDiaShown.value = true
}

const reset = () => {
    form.main_pass = form.pass = form.repeat_pass = ''
    form.id_user_game = null
    v$.value.$reset()
}

defineExpose({
    showDia
})
</script>
<template>
    <Modal v-model:showed="isDiaShown" @closeDia="reset">
        <template #header>
            <h2 class="modal__title">Зміна пароля для ігрового акаунту</h2>
        </template>
        <template #body>
            <form @submit.prevent="update" class="flex flex-column justify-content-center w-full">
                <div class="field w-full">
                    <label for="password">Пароль від основного акаунту</label>
                    <div class="custom-input w-full relative" :class="{ error: v$.main_pass.$error }">
                        <div class="input-bg"></div>
                        <input 
                            v-model="form.main_pass" 
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
                    <label for="gameAccPassword">Новий пароль для ігрового акаунту</label>
                    <div class="custom-input w-full relative" :class="{ error: v$.pass.$error }">
                        <div class="input-bg"></div>
                        <input 
                            v-model="form.pass" 
                            id="gameAccPassword" 
                            :type="gameAccPassHidden ? 'password' : 'text'"
                            placeholder="Введіть новий пароль"
                            maxlength="20"
                        >
                        <div class="absolute right-10px top-0 flex align-items-center h-full" style="z-index: 3;">
                            <img v-show="gameAccPassHidden" @click="gameAccPassHidden = !gameAccPassHidden" src="@/assets/images/show-pass.svg" alt="" class="cursor-pointer">
                            <img v-show="!gameAccPassHidden" @click="gameAccPassHidden = !gameAccPassHidden" src="@/assets/images/hide-pass.svg" alt="" class="cursor-pointer">
                        </div>
                    </div>
                </div>
                <div class="field w-full">
                    <label for="repeat-password">Повторіть пароль</label>
                    <div class="custom-input w-full relative" :class="{ error: v$.repeat_pass.$error }">
                        <div class="input-bg"></div>
                        <input 
                            v-model="form.repeat_pass" 
                            id="repeat-password" 
                            :type="repeatPasswordHidden ? 'password' : 'text'"
                            placeholder="Повторіть пароль"
                            maxlength="20"
                        >
                        <div class="absolute right-10px top-0 flex align-items-center h-full" style="z-index: 3;">
                            <img v-show="repeatPasswordHidden" @click="repeatPasswordHidden = !repeatPasswordHidden" src="@/assets/images/show-pass.svg" alt="" class="cursor-pointer">
                            <img v-show="!repeatPasswordHidden" @click="repeatPasswordHidden = !repeatPasswordHidden" src="@/assets/images/hide-pass.svg" alt="" class="cursor-pointer">
                        </div>
                    </div>
                </div>
                <p class="mb-4 w-full font-bold">ВАЖЛИВО! Змінювати пароль можна раз на 3 дні.</p>
                <button type="submit" class="fantasy-btn mt-3 align-self-center"><span>Змінити</span></button>
            </form>
        </template>
    </Modal>
</template>
<style scoped lang='scss'></style>