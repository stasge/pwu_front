<script setup lang='ts'>
import Modal from '@/components/base/modal.vue'

import {reactive, ref} from 'vue'
import {useAsyncCallWrapper} from '@/composables/useAsyncCallWrapper'
import {fetchPost} from '@/utils/fetchApi'
import { required } from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';
import { useUserStore } from '@/stores/userStore';

const {wrapAsyncCall} = useAsyncCallWrapper()
const isDiaShown = ref(false)
const passwordHidden = ref(true)
const isEdit = ref(false)
const userStore = useUserStore()

interface Form {
    phone: string;
    pass: string;
}

const form = reactive<Form>({
    phone: '',
    pass: ''
})

const rules = {
    phone: { required },
    pass: { required },
}

const v$ = useVuelidate(rules, form, {$stopPropagation: true})
const update = async () => {
    if (!await v$.value.$validate()) {
        return
    }

    wrapAsyncCall(async () => {
        await fetchPost('user/changePhone', form)
        userStore.loadUser()
        isDiaShown.value = false
    }, null, 'Номер телефону успішно змінено')
}
const showDia = (edit: boolean = false, phone?: string) => {
    isEdit.value = edit
    reset()
    if (phone) {
        form.phone = phone
    }
    isDiaShown.value = true
}

const reset = () => {
    form.phone = form.pass = ''
    v$.value.$reset()
}

defineExpose({
    showDia
})
</script>
<template>
    <Modal v-model:showed="isDiaShown" @closeDia="reset">
        <template #header>
            <h2 class="modal__title">{{ isEdit ? 'Зміна номера телефону' : 'Додавання номера телефону' }}</h2>
        </template>
        <template #body>
            <form @submit.prevent="update" class="flex flex-column justify-content-center w-full">
                <div class="field w-full">
                    <label for="phone" class="w-full">Новий номер телефону</label>
                    <div class="custom-input w-full" :class="{ error: v$.phone.$error }">
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
                    <label for="password">Пароль від основного акаунту</label>
                    <div class="custom-input w-full relative" :class="{ error: v$.pass.$error }">
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
                <button type="submit" class="fantasy-btn mt-3 align-self-center"><span>Змінити</span></button>
            </form>
        </template>
    </Modal>
</template>
<style scoped lang='scss'></style>