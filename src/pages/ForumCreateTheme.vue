<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import { fetchPost } from '@/utils/fetchApi';
import { useAsyncCallWrapper } from '@/composables/useAsyncCallWrapper';
import { useRoute, useRouter } from 'vue-router';
import InputText from 'primevue/inputtext';
import ForumHeader from '@/components/ForumHeader.vue';
import Footer from '@/components/Footer.vue';
// Додаємо ImageResize, ImageStyle, ImageToolbar
import { ClassicEditor } from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';
import { editorConfig } from '@/utils/ckeditorConfig';

const { wrapAsyncCall } = useAsyncCallWrapper();
const route = useRoute();
const router = useRouter();

const form = reactive({
    id: null,
    id_main: null,
    name: '',
    text: ''
});

onMounted(() => {
    if (route.params.id) {
        wrapAsyncCall(async () => {
           const {data} = await fetchPost('/forum/getTheme', {id: route.params.id});
           form.name = data.name;
           form.text = data.text;
           form.id = data.id;
        });
    }
});

const handleSubmit = () => {
    const methodName = route.params.id ? '/forum/updateTheme' : '/forum/addTheme';
    wrapAsyncCall(async () => {
        const {data: id} = await fetchPost(methodName, {...form, id_main: route.params.id_main, id: route.params.id});
        if (!route.params.id) {
            router.push({name: 'theme-creation', params: {id}})
        }
        
    }, null, route.params.id ? 'Тему успішно редаговано' : 'Тему успішно додано');
};
</script>

<template>
    <div class="create-theme w-full">
        <ForumHeader />
        <div class="create-theme__inner">
            <div class="create-theme__container w-full">
                <h2 v-if="!route.params.id">Створення теми</h2>
                <h2 v-else>Рудагування теми</h2>
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

                    <button type="submit" class="fantasy-btn btn-sm mt-3"><span>Зберегти</span></button>
                </form>
            </div>
        </div>
        <Footer />
    </div>
</template>

<style scoped lang="scss">
.create-theme {
    display: flex;
    flex-direction: column;
    color: #fff;
    min-height: 100vh;
    background: url('@/assets/images/forum-bg.jpg') no-repeat center / cover;
    padding-top: 120px;

    @media (max-width: 1024px) {
        padding-top: 100px;
    }

    @media (max-width: 768px) {
        padding-top: 90px;
    }

    @media (max-width: 480px) {
        padding-top: 80px;
    }

    &__inner {
        padding: 40px clamp(20px, 5vw, 80px);
        flex: 1;

        @media (max-width: 768px) {
            padding: 24px clamp(16px, 4vw, 40px);
        }

        @media (max-width: 480px) {
            padding: 20px 0;
        }
    }

    &__container {
        max-width: 1400px;
        margin: 0 auto;
        border-radius: 10px;
        text-shadow: none;

        @media (max-width: 768px) {
            padding: 20px 30px;
        }

        @media (max-width: 480px) {
            padding: 20px;
        }
    }
    
    form {
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        ::v-deep(a) {
            color: blue;
        }
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

    .fantasy-btn {
        left: -20px;
    }
}

:deep(.footer) {
    background: transparent !important;
}
</style>
