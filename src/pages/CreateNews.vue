<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import { fetchGet, fetchPost } from '@/utils/fetchApi';
import { useAsyncCallWrapper } from '@/composables/useAsyncCallWrapper';
import InputText from 'primevue/inputtext';
import ToggleSwitch from 'primevue/toggleswitch';
import Dropdown from 'primevue/dropdown';
import { ClassicEditor } from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';
import { editorConfig } from '@/utils/ckeditorConfig';
import { useRoute } from 'vue-router';
import type { News } from '@/models/news';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';

const { wrapAsyncCall } = useAsyncCallWrapper();
const route = useRoute()
const imageUrl = ref<string | null>(null)
const previewImage = ref()
const baseUrl = import.meta.env.VITE_BASE_URL
const form = reactive({
    title: '',
    label: '',
    text: '',
    link: '',
    isHidden: false,
    type: 'news',
    image: null as File | null | string
});

const rules = {
    title: {required},
    text: {required},
    image: {required},
    type: {required},
}

const v$ = useVuelidate(rules, form)

const typeOptions = [
    { label: 'Новини', value: 'news' },
    { label: 'Оновлення', value: 'updates' }
]

onMounted(() => {
    if (route.params?.id) {
        fillForm(route.params?.id as string)
    }
})

const handleImageUpload = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
        const file = target.files[0];        
        form.image = file;
        const imagePreviewSrc = URL.createObjectURL(file);
        previewImage.value = imagePreviewSrc;
    }
};

const handleSubmit = async () => {
    if (!await v$.value.$validate()) {
        return
    }
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('label', form.type === 'updates' ? form.label : '');
    formData.append('isHidden', `${form.isHidden}`);
    formData.append('text', form.text);
    formData.append('link', form.link);
    formData.append('type', form.type);
    
    if (route.params.id) {
        formData.append('id', route.params.id as string);
    }

    if (form.image) {
        formData.append('image', form.image);  // Додаємо зображення, якщо воно є
    }
    wrapAsyncCall(async () => {
        await fetchPost(route.params.id ? 'updateNews' : 'addNews', formData);
    }, null, route.params.id ? 'Новину успішно редаговано' : 'Новину успішно додано');
};

watch(() => form.type, (newType) => {
    if (newType !== 'updates') {
        form.label = ''
    }
})

const fillForm = async (id: string) => {
    const {data} = await fetchGet('getNews')

    if (data.news.length) {
        const selected: News | undefined = data.news.find((n: News) => n.id === +id)

        if (selected) {
            form.isHidden = selected.isHidden
            form.text = selected.text
            form.title = selected.title
            form.label = selected.label || ''
            form.type = selected.type || 'news'
            form.image = selected.image
            imageUrl.value = selected.image
        }
    }
}
</script>

<template>
    <div class="create-news w-full">
        <h2>Створення новини</h2>
        <form @submit.prevent="handleSubmit" class="mt-4 flex flex-column gap-4">
            <div class="flex flex-column gap-2">
                <label for="title">Заголовок</label>
                <InputText id="title" type="text" v-model="form.title" :class="{'invalid': v$.title.$error}" />
            </div>


            <div class="flex flex-column gap-2">
                <label for="text">Контент</label>
                <ckeditor
                    v-model="form.text"
                    :editor="ClassicEditor"
                    :config="editorConfig"
                    :class="{'invalid': v$.text.$error}"
                />
            </div>

            <div class="flex flex-column gap-2">
                <label for="type">Тип</label>
                <Dropdown 
                    id="type" 
                    v-model="form.type" 
                    :options="typeOptions" 
                    optionLabel="label" 
                    optionValue="value"
                    placeholder="Оберіть тип"
                    class="w-full"
                    :class="{'invalid': v$.type.$error}"
                />
            </div>

            <div v-if="form.type === 'updates'" class="flex flex-column gap-2">
                <label for="label">Лейбл</label>
                <InputText id="label" type="text" v-model="form.label" />
            </div>

            <div class="flex gap-3">
                <ToggleSwitch v-model="form.isHidden" />
                <label for="text">Приховати для користувачів</label>
            </div>

            <div class="flex flex-column gap-3">
                <label for="image">Зображення</label>
                <input type="file" id="image" @change="handleImageUpload" class="w-max" />
                <small class="text-red" v-if="v$.image.$error">Додайте картинку</small>
                <img v-if="previewImage" style="max-width: 200px;aspect-ratio: 16/9;" :src="previewImage" alt="#">
                <img v-else-if="imageUrl" style="max-width: 200px;" :src="baseUrl + '/files/' + imageUrl" alt="#">
            </div>

            <button type="submit" class="btn btn-sm mt-3">Зберегти</button>
        </form>
    </div>
</template>

<style scoped lang="scss">
.create-news {
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
