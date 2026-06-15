<script setup lang='ts'>
import Modal from '@/components/base/modal.vue'

import {reactive, ref} from 'vue'
import {useAsyncCallWrapper} from '@/composables/useAsyncCallWrapper'
import {fetchPost} from '@/utils/fetchApi'
import { required } from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';
import { ClassicEditor } from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';
import { editorConfig } from '@/utils/ckeditorConfig';

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
            <h2 class="modal__title">Створення теми</h2>
        </template>
        <template #body>
            <form @submit.prevent="create" class="create-theme flex flex-column justify-content-center w-full">
                <div class="field w-full">
                    <label for="name" class="w-full">Назва теми</label>
                    <div class="custom-input w-full" :class="{ error: v$.name.$error }">
                        <div class="input-bg"></div>
                        <input 
                            v-model="form.name" 
                            id="name" 
                            type="text" 
                            placeholder="Введіть назву теми"
                        >
                    </div>
                </div>
                <div class="field w-full">
                    <label for="text" class="w-full">Текст теми</label>
                    <ckeditor
                        v-model="form.text"
                        :editor="ClassicEditor"
                        :config="editorConfig"
                    />
                </div>
                <button type="submit" class="fantasy-btn mt-3 align-self-center"><span>Створити</span></button>
            </form>
        </template>
    </Modal>
</template>
<style scoped lang='scss'>
.create-theme {
    ::v-deep(.ck-editor) {
        width: clamp(300px, 70vw, 887px) !important;
        max-width: 100vw;
        max-height: 70vh;
        display: flex;
        flex-direction: column;
    }
    ::v-deep(.ck-editor__main) {
        flex: 1 1 auto;
        min-height: 0;
        max-height: 50vh;
        overflow: hidden;
    }
    ::v-deep(.ck-editor__editable_inline) {
        min-height: 300px;
        max-height: 40vh;
        overflow-y: auto !important;
        width: 100% !important;
        box-sizing: border-box;
        font-size: 1rem;
        resize: vertical;
        border-radius: 8px;
        background: #fff;
        color: #222;
        word-break: break-word;
    }
}

::v-deep(.modal__body) {
    max-height: 75vh;
    overflow-y: auto;
}
</style>