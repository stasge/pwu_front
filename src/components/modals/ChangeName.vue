<script setup lang='ts'>
import Modal from '@/components/base/modal.vue'

import {reactive, ref} from 'vue'
import {useAsyncCallWrapper} from '@/composables/useAsyncCallWrapper'
import {fetchPost} from '@/utils/fetchApi'
import { maxLength, required } from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';
import { useUserStore } from '@/stores/userStore';

const NAME_MAX_LENGTH = 20

const {wrapAsyncCall} = useAsyncCallWrapper()
const isDiaShown = ref(false)
const passwordHidden = ref(true)
const isEdit = ref(false)
const userStore = useUserStore()

interface Form {
    name: string;
    pass: string;
}

const form = reactive<Form>({
    name: '',
    pass: ''
})

const notBlank = (value: string) => !!value?.trim()

const rules = {
    name: { required, notBlank, maxLength: maxLength(NAME_MAX_LENGTH) },
    pass: { required },
}

const v$ = useVuelidate(rules, form, {$stopPropagation: true})
const update = async () => {
    if (!await v$.value.$validate()) {
        return
    }

    wrapAsyncCall(async () => {
        const resp = await fetchPost('user/changeName', { name: form.name.trim(), pass: form.pass })
        await userStore.loadUser(resp?.data ?? null)
        isDiaShown.value = false
    }, null, isEdit.value ? "Ім'я успішно змінено" : "Ім'я успішно додано")
}
const showDia = (edit: boolean = false, name?: string) => {
    isEdit.value = edit
    reset()
    if (name) {
        form.name = name.slice(0, NAME_MAX_LENGTH)
    }
    isDiaShown.value = true
}

const reset = () => {
    form.name = form.pass = ''
    v$.value.$reset()
}

defineExpose({
    showDia
})
</script>
<template>
    <Modal v-model:showed="isDiaShown" @closeDia="reset">
        <template #header>
            <h2 class="modal__title">{{ isEdit ? 'Зміна імені' : 'Додавання імені' }}</h2>
        </template>
        <template #body>
            <form @submit.prevent="update" class="flex flex-column justify-content-center w-full" autocomplete="off">
                <div class="field w-full">
                    <label for="name" class="w-full">Нове ім'я</label>
                    <div class="custom-input w-full" :class="{ error: v$.name.$error }">
                        <div class="input-bg"></div>
                        <input
                            v-model="form.name"
                            id="name"
                            type="text"
                            placeholder="Введіть ім'я"
                            :maxlength="NAME_MAX_LENGTH"
                            autocomplete="off"
                        >
                    </div>
                    <small class="text-right block" :class="{ 'text-red': form.name.length >= NAME_MAX_LENGTH }">
                        {{ form.name.length }}/{{ NAME_MAX_LENGTH }}
                    </small>
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
                            autocomplete="current-password"
                        >
                        <div class="absolute right-10px top-0 flex align-items-center h-full" style="z-index: 3;">
                            <img v-show="passwordHidden" @click="passwordHidden = !passwordHidden" src="@/assets/images/show-pass.svg" alt="" class="cursor-pointer">
                            <img v-show="!passwordHidden" @click="passwordHidden = !passwordHidden" src="@/assets/images/hide-pass.svg" alt="" class="cursor-pointer">
                        </div>
                    </div>
                </div>
                <p class="change-name__hint">Ім'я показується замість логіна, наприклад у списку тих, хто проголосував.</p>
                <button type="submit" class="fantasy-btn mt-3 align-self-center"><span>{{ isEdit ? 'Змінити' : 'Додати' }}</span></button>
            </form>
        </template>
    </Modal>
</template>
<style scoped lang='scss'>
.change-name__hint {
    margin: 0;
    max-width: 360px;
    align-self: center;
    text-align: center;
    font-family: "Candara", sans-serif;
    font-size: 13px;
    color: rgba(248, 248, 248, 0.5);
}
</style>
