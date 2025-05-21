<script setup lang='ts'>
import Modal from '@/components/base/modal.vue'

import {reactive, ref} from 'vue'
import {useAsyncCallWrapper} from '@/composables/useAsyncCallWrapper'
import {fetchPost} from '@/utils/fetchApi'
import { required } from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';

const {wrapAsyncCall} = useAsyncCallWrapper()
const isDiaShown = ref(false)
const emit = defineEmits(['createTheme'])

interface Form {
    name: string;
    text: string;
}

const form = reactive<Form>({
    name: '',
    text: ''
})

const rules = {
    name: { required },
    text: { required },
}

const v$ = useVuelidate(rules, form, {$stopPropagation: true})
const create = async () => {
    if (!await v$.value.$validate()) {
        return
    }

    wrapAsyncCall(async () => {
        await fetchPost('/support/addThemes', form)
        emit('createTheme')
        reset()
        isDiaShown.value = false
    }, null, 'Тема успішно створена')
}


const showDia = () => {
    reset()
    isDiaShown.value = true
}

const reset = () => {
    form.text = form.name = ''
    v$.value.$reset()
}

defineExpose({
    showDia
})
</script>
<template>
    <Modal v-model:showed="isDiaShown" @closeDia="reset">
        <template #header>
            <h2 class="modal__title mb-5">Створення теми</h2>
        </template>
        <template #body>
            <form @submit.prevent="create" class="flex flex-column justify-content-center w-full">
                <div class="field w-full">
                    <label for="name" class="w-full">Назва теми</label>
                    <input 
                        v-model="form.name" 
                        id="name" 
                        type="text" 
                        :class="{invalid: v$.name.$error}"
                        class="text-base text-color p-2 surface-overlay border-1 border-solid appearance-none outline-none focus:border-primary w-full"
                    >
                </div>
                <div class="field w-full">
                    <label for="text" class="w-full">Текст теми</label>
                    <textarea 
                        v-model="form.text" 
                        id="text" 
                        :class="{invalid: v$.text.$error}"
                        class="text-base text-color p-2 surface-overlay border-1 border-solid appearance-none outline-none focus:border-primary w-full"
                        rows="5"
                    ></textarea>
                </div>
                <button type="submit" class="btn btn-sm mt-3 align-self-center">Створити</button>
            </form>
        </template>
    </Modal>
</template>
<style scoped lang='scss'></style>