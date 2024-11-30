<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { fetchGet, fetchPost } from '@/utils/fetchApi';
import { useAsyncCallWrapper } from '@/composables/useAsyncCallWrapper';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import ToggleSwitch from 'primevue/toggleswitch';
import { useRoute } from 'vue-router';
import type { News } from '@/models/news';

const { wrapAsyncCall } = useAsyncCallWrapper();
const route = useRoute()
const imageUrl = ref<string | null>(null)
const previewImage = ref()
const baseUrl = import.meta.env.VITE_BASE_URL
const form = reactive({
    title: '',
    text: '',
    link: '',
    isHidden: false,
    image: null as File | null
});

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

const handleSubmit = () => {
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('isHidden', `${form.isHidden}`);
    formData.append('text', form.text);
    formData.append('link', form.link);
    
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

const fillForm = async (id: string) => {
    const {data: news} = await fetchGet('getNews')

    if (news.length) {
        const selected: News | undefined = news.find((n: News) => n.id === +id)
        
        if (selected) {
            form.isHidden = selected.isHidden
            form.text = selected.text
            form.title = selected.title
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
                <InputText id="title" type="text" v-model="form.title" />
            </div>

            <div class="flex flex-column gap-2">
                <label for="text">Контент</label>
                <Textarea v-model="form.text" rows="5" class="w-full" />
            </div>

            <div class="flex gap-3">
                <ToggleSwitch v-model="form.isHidden" />
                <label for="text">Приховати для користувачів</label>
            </div>

            <div class="flex flex-column gap-3">
                <label for="image">Зображення</label>
                <input type="file" id="image" @change="handleImageUpload" />
                <img v-if="previewImage" style="max-width: 200px;aspect-ratio: 16/9;" :src="previewImage" alt="#">
                <img v-else style="max-width: 200px;" :src="baseUrl + '/files/' + imageUrl" alt="#">
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
