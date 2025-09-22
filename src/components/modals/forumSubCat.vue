<script setup lang='ts'>
import Modal from '@/components/base/modal.vue'

import {reactive, ref} from 'vue'
import {useAsyncCallWrapper} from '@/composables/useAsyncCallWrapper'
import {fetchPost} from '@/utils/fetchApi'
import { required } from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';
import type { IForumSubCategory } from '@/models/forum';
import Dropdown from 'primevue/dropdown'

const {wrapAsyncCall} = useAsyncCallWrapper()
const isDiaShown = ref(false)
const emit = defineEmits(['subCatCreated'])

interface Form {
    name: string;
    position: number;
    type: number;
    id: number | null;
    id_main?: number | null;
}

const form = reactive<Form>({
    name: '',
    position: 0,
    type: 0,
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
        form.position = subCat.position
        form.id_main = subCat.id_main
        form.type = subCat.type
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
            <h2 class="modal__title">{{ form.id_main ? 'Редагування розділу' : 'Створення розділу' }}</h2>
        </template>
        <template #body>
            <form @submit.prevent="createOrUpdate" class="change-sub flex flex-column justify-content-center w-full gap-3">
                <div class="flex flex-column gap-2 w-full">
                    <label for="name">Назва</label>
                    <input 
                        v-model="form.name" 
                        id="name" 
                        type="text"
                        :class="{invalid: v$.name.$error}" 
                        class="text-base text-color p-2 surface-overlay border-1 border-solid appearance-none outline-none focus:border-primary w-full"
                    >
                </div>
                <div class="flex flex-column gap-2 w-full">
                    <label for="position">Позиція</label>
                    <input 
                        v-model="form.position" 
                        id="position" 
                        type="number"
                        :class="{invalid: v$.name.$error}" 
                        class="text-base text-color p-2 surface-overlay border-1 border-solid appearance-none outline-none focus:border-primary w-full"
                    >
                </div>
                <div class="flex flex-column gap-2 w-full">
                    <label for="type">Тип</label>
                    <Dropdown
                        v-model="form.type"
                        :options="[
                            { label: 'Звичайний', value: 0 },
                            { label: 'Закритий', value: 1 }
                        ]"
                        option-label="label"
                        option-value="value"
                        id="type"
                        :class="{invalid: v$.name.$error}"
                        class="w-full"
                        placeholder="Оберіть тип"
                    />
                </div>
                <button type="submit" class="fantasy-btn mt-3 align-self-center"><span>{{ form.id_main ? 'Редагувати' : 'Створити' }}</span></button>
            </form>
        </template>
    </Modal>
</template>
<style scoped lang='scss'>
.change-sub {
    ::v-deep(.p-select) {
        background-color: var(--surface-overlay) !important;
    }
}
</style>