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
const gameAccPassHidden = ref(true)

interface Form {
    main_pass: string;
    id_user_game: number | null;
    pass: string;
}

const form = reactive<Form>({
    main_pass: '',
    id_user_game: null,
    pass: ''
})

const rules = {
    main_pass: { required },
    pass: { required },
}

const v$ = useVuelidate(rules, form)
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
    form.main_pass = form.pass = ''
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
            <h2 class="modal__title mb-5">Зміна пароля для ігрового акаунту</h2>
        </template>
        <template #body>
            <form @submit.prevent="update" class="flex flex-column justify-content-center w-full">
                <div class="field w-full">
                    <label for="password">Пароль від основного акаунту</label>
                    <div class="relative">
                        <input 
                            v-model="form.main_pass" 
                            id="password" 
                            :type="passwordHidden ? 'password' : 'text'"
                            :class="{invalid: v$.main_pass.$error}" 
                            class="text-base text-color p-2 surface-overlay border-1 border-solid appearance-none outline-none focus:border-primary w-full"
                        >
                        <div class="absolute right-10px top-0 flex align-items-center h-full">
                            <img v-show="passwordHidden" @click="passwordHidden = !passwordHidden" src="@/assets/images/show-pass.svg" alt="">
                            <img v-show="!passwordHidden" @click="passwordHidden = !passwordHidden" src="@/assets/images/hide-pass.svg" alt="">
                        </div>
                    </div>
                </div>
                <div class="field w-full">
                    <label for="gameAccPassword">Новий пароль для ігрового акаунту</label>
                    <div class="relative">
                        <input 
                            v-model="form.pass" 
                            id="gameAccPassword" 
                            :type="gameAccPassHidden ? 'password' : 'text'"
                            :class="{invalid: v$.pass.$error}" 
                            class="text-base text-color p-2 surface-overlay border-1 border-solid appearance-none outline-none focus:border-primary w-full"
                        >
                        <div class="absolute right-10px top-0 flex align-items-center h-full">
                            <img v-show="gameAccPassHidden" @click="gameAccPassHidden = !gameAccPassHidden" src="@/assets/images/show-pass.svg" alt="">
                            <img v-show="!gameAccPassHidden" @click="gameAccPassHidden = !gameAccPassHidden" src="@/assets/images/hide-pass.svg" alt="">
                        </div>
                    </div>
                </div>
                <p class="mb-4 w-full font-bold">ВАЖЛИВО! Змінювати пароль можна раз на 3 дні.</p>
                <button type="submit" class="btn btn-sm mt-3 align-self-center">Змінити</button>
            </form>
        </template>
    </Modal>
</template>
<style scoped lang='scss'></style>