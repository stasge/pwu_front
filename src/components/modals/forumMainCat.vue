<script setup lang='ts'>
import Modal from '@/components/base/modal.vue'

import {reactive, ref} from 'vue'
import {useAsyncCallWrapper} from '@/composables/useAsyncCallWrapper'
import {fetchPost} from '@/utils/fetchApi'
import { required } from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';
import type { IForumCategory } from '@/models/forum';

const {wrapAsyncCall} = useAsyncCallWrapper()
const isDiaShown = ref(false)
const emit = defineEmits(['mainCatCreated'])

interface Form {
    name: string;
    id: number | null;
    position: number;
    id_main?: number | null;
}

const form = reactive<Form>({
    name: '',
    position: 0,
    id: null
})

const rules = {
    name: { required },
}

const v$ = useVuelidate(rules, form)
const createOrUpdate = async () => {
    if (!await v$.value.$validate()) {
        return
    }
    const apiMethod = form.id ? '/forum/updateMain' : 'forum/addMain'
    const successMessage = form.id ? 'Головну категорію успішно редаговано' : 'Головну категорію успішно створено'

    wrapAsyncCall(async () => {
        await fetchPost(apiMethod, form)
        emit('mainCatCreated')
        isDiaShown.value = false
    }, null, successMessage)
}
const showDia = (category: IForumCategory | null = null) => {
    reset()
    if (category) {
        form.id = category.id
        form.name = category.name
        form.position = category.position
    }
    isDiaShown.value = true
}

const reset = () => {
    form.name = ''
    form.id = null
    v$.value.$reset()
}

defineExpose({
    showDia
})
</script>
<template>
    <Modal v-model:showed="isDiaShown" @closeDia="reset">
        <template #header>
            <h2 class="modal__title mb-5">{{ form.id ? 'Редагування категорії' : 'Створення категорії' }}</h2>
        </template>
        <template #body>
            <form @submit.prevent="createOrUpdate" class="flex flex-column justify-content-center w-full gap-3">
                <div class="flex flex-column gap-2 w-full">
                    <label for="name">Назва</label>
                    <input v-model="form.name" id="name" type="text" :class="{ invalid: v$.name.$error }"
                        class="text-base text-color p-2 surface-overlay border-1 border-solid appearance-none outline-none focus:border-primary w-full">
                </div>
                <div class="flex flex-column gap-2 w-full">
                    <label for="position">Позиція</label>
                    <input v-model="form.position" id="position" type="number" :class="{ invalid: v$.name.$error }"
                        class="text-base text-color p-2 surface-overlay border-1 border-solid appearance-none outline-none focus:border-primary w-full">
                </div>
                <button type="submit" class="btn btn-sm mt-3 align-self-center">{{ form.id ? 'Редагувати' : 'Створити' }}</button>
            </form>
        </template>
    </Modal>
</template>
<style scoped lang='scss'></style>