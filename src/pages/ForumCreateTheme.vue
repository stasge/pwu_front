<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import { fetchPost } from '@/utils/fetchApi';
import { useAsyncCallWrapper } from '@/composables/useAsyncCallWrapper';
import { useRoute, useRouter } from 'vue-router';
import InputText from 'primevue/inputtext';
import { ClassicEditor, Bold, Essentials, Italic, Mention, Paragraph, Undo, Heading, List, Alignment, MediaEmbed, Image, ImageUpload, Base64UploadAdapter   } from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';

const { wrapAsyncCall } = useAsyncCallWrapper();
const route = useRoute();
const router = useRouter();

const form = reactive({
    id: null,
    id_main: null,
    name: '',
    text: ''
});

const editorConfig = {
    plugins: [ Bold, Essentials, Italic, Mention, Paragraph, Undo, Heading, List, Alignment, MediaEmbed, Image, ImageUpload, Base64UploadAdapter  ],
    toolbar: [ 'heading', 'bold', 'italic', 'alignment',  '|','numberedList', 'bulletedList', '|', 'undo', 'redo', 'mediaEmbed', 'imageUpload' ],
    mediaEmbed: {
       previewsInData: true
    }
}

onMounted(() => {
    if (route.params.id) {
        wrapAsyncCall(async () => {
           const {data} = await fetchPost('/forum/getTheme', {id: route.params.id})
           form.name = data.name
           form.text = data.text
           form.id = data.id
        })
    }
})

const handleSubmit = () => {
    const methodName = route.params.id ? '/forum/updateTheme' : '/forum/addTheme'
    wrapAsyncCall(async () => {
        await fetchPost(methodName, {...form, id_main: route.params.id_main});
        form.name = form.text = ''
        form.id_main = form.id = null
        router.push({name: 'theme-creation'})
    }, null, route.params.id ? 'Тему успішно редаговано' : 'Тему успішно додано');
};
</script>

<template>
    <div class="create-theme w-full">
        <h2>Створення теми</h2>
        <form @submit.prevent="handleSubmit" class="mt-4 flex flex-column gap-4">
            <div class="flex flex-column gap-2">
                <label for="name">Назва</label>
                <InputText id="name" type="text" v-model="form.name" />
            </div>

            <div class="flex flex-column gap-2">
                <label for="editor">Контент</label>
                <ckeditor
                    v-model="form.text"
                    :editor="ClassicEditor"
                    :config="editorConfig"
                />
            </div>

            <button type="submit" class="btn btn-sm mt-3">Зберегти</button>
        </form>
    </div>
</template>

<style scoped lang="scss">
.create-theme {
    padding: 20px 50px;
    border-radius: 10px;
    background: rgba(93, 119, 144, 0.2);
    color: #FFF;
    text-shadow: none;
    height: 100%;
    
    form {
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    button {
        align-self: flex-end;
    }

    .p-inputtext  {
        border: 1px solid gray;
        &:focus {
            border: 1px solid #e26f0f;
        }

        &:hover {
            border: 1px solid #e26f0f;
        }
    }

}
</style>
