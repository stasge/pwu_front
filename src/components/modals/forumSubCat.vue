<script setup lang='ts'>
import Modal from '@/components/base/modal.vue'

import {reactive, ref} from 'vue'
import {useAsyncCallWrapper} from '@/composables/useAsyncCallWrapper'
import {fetchPost} from '@/utils/fetchApi'
import { required } from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';
import type { IForumSubCategory } from '@/models/forum';

const {wrapAsyncCall} = useAsyncCallWrapper()
const isDiaShown = ref(false)
const emit = defineEmits(['subCatCreated'])

interface Form {
    name: string;
    id: number | null;
    id_main?: number | null;
}

const form = reactive<Form>({
    name: '',
    id: null,
    id_main: null
})

const rules = {
    name: {required},
}

const v$ = useVuelidate(rules, form)

const createOrUpdate = async () => {
    if (!await v$.value.$validate()) {
        return
    }
    const apiMethod = form.id_main ? '/forum/updateSub' : 'forum/addSub'
    const successMessage = form.id_main ? 'Розділ успішно редаговано' : 'Розділ успішно створено'

    wrapAsyncCall( async () => {
        await fetchPost(apiMethod, form)
        emit('subCatCreated')
        isDiaShown.value = false
    }, null, successMessage)
}

const showDia = (subCat: IForumSubCategory | null = null, id: number | null = null) => {
    reset()
    if (subCat) {
        form.id = subCat.id
        form.name = subCat.name
        form.id_main = subCat.id_main
    }

    if (id) {
        form.id = id
    }
    isDiaShown.value = true
}

const reset = () => {
    form.name = ''
    form.id = form.id_main = null
    v$.value.$reset()
}

defineExpose({
    showDia
})
</script>
<template>
    <Modal v-model:showed="isDiaShown" @closeDia="reset">
        <template #header>
            <h2 class="modal__title mb-5">{{ form.id_main ? 'Редагування розділу' : 'Створення розділу' }}</h2>
        </template>
        <template #body>
            <form @submit.prevent="createOrUpdate" class="flex flex-column justify-content-center w-full">
                <div class="flex flex-column gap-3 w-full">
                    <label for="name">Назва</label>
                    <input 
                        v-model="form.name" 
                        id="name" 
                        type="text"
                        :class="{invalid: v$.name.$error}" 
                        class="text-base text-color p-2 surface-overlay border-1 border-solid appearance-none outline-none focus:border-primary w-full"
                    >
                </div>
                <button type="submit" class="btn btn-sm mt-3 align-self-center">{{ form.id_main ? 'Редагувати' : 'Створити' }}</button>
            </form>
        </template>
    </Modal>
</template>
<style scoped lang='scss'>
</style>