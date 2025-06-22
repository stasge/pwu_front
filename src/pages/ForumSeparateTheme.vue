<script setup lang='ts'>
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import Paginator from 'primevue/paginator';

import { onMounted, reactive, ref } from 'vue';
import { useAsyncCallWrapper } from '@/composables/useAsyncCallWrapper'
import {fetchGet, fetchPost} from '@/utils/fetchApi'
import type { IForumCategory, IForumComment, IForumTheme } from '@/models/forum';
import { useRoute } from 'vue-router'
import { format } from 'date-fns'
import { useUserStore } from '@/stores/userStore'
import { useConfirm } from 'primevue/useconfirm';
import EmojiPicker from '@/components/EmojiPicker.vue';
import { useToast } from 'vue-toastification';
import type { Emoji } from '@/models/emoji';
import { ClassicEditor, Bold, Essentials, Italic, Mention, Paragraph, Undo, Heading, List, Alignment, MediaEmbed, Image, ImageUpload, Base64UploadAdapter, Link, ImageResize, ImageStyle, ImageToolbar } from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';

const {wrapAsyncCall} = useAsyncCallWrapper()
const route = useRoute()
const {getRoleName, isAdmin} = useUserStore()
const userStore = useUserStore()
const confirm = useConfirm();
const toast = useToast();
const filesBase = import.meta.env.VITE_FILES_URL

const comments = ref<IForumComment[]>([])
const theme = ref<IForumTheme>()
const category = ref<IForumCategory>()
const themeId = ref(+route.params.theme_id)
const showEmojiPicker = ref(false)
const commetsTotal = ref(0)
const commentsPage = ref(1)
const commentsLimit = ref(5)

const editorConfig = {
    plugins: [ Bold, Essentials, Italic, Mention, Paragraph, Undo, Heading, List, Alignment, MediaEmbed, Image, ImageUpload, Base64UploadAdapter, Link, ImageResize, ImageStyle, ImageToolbar ],
    toolbar: [
        'heading', 'bold', 'italic', 'alignment', '|',
        'numberedList', 'bulletedList', '|', 'link', 'undo', 'redo',
        'mediaEmbed', 'imageUpload', '|',
        'imageStyle:alignLeft', 'imageStyle:alignCenter', 'imageStyle:alignRight', 'imageStyle:inline', '|',
        'imageResize'
    ],
    mediaEmbed: {
       previewsInData: true
    },
    image: {
        resizeUnit: '%' as '%',
        toolbar: [
            'imageStyle:alignLeft', 'imageStyle:alignCenter', 'imageStyle:alignRight', 'imageStyle:inline', '|',
            'imageTextAlternative', '|', 'imageResize'
        ],
    }
};

const onPageChange = (event: { page: number, rows: number }) => {
    commentsPage.value = event.page + 1
    commentsLimit.value = event.rows
    wrapAsyncCall(() => loadComments())
}

const createCommentForm = reactive({
    text: ''
})
onMounted(() => {
    wrapAsyncCall(async () => {
        await loadComments()
        const {data: _theme} = await fetchPost('/forum/getTheme', {id: themeId.value})
        const {data: _categories} = await fetchGet('/forum/getMain')
        theme.value = _theme
        category.value = _categories.find((cat: IForumCategory) => cat.id === +route.params.cat_id)
    })
})

const loadComments = async () => {
    const {data} = await fetchPost('/forum/getMessage', {id_theme: themeId.value, page: commentsPage.value, limit: commentsLimit.value})
    commetsTotal.value = data.total
    comments.value = data.messages
}

const createComment = async () => {
    await wrapAsyncCall(async () => {
        await fetchPost('/forum/addMessage', {
            ...createCommentForm,
            id_theme: themeId.value
        })
        await loadComments()
        resetForm()
        showEmojiPicker.value = false
    },
    (err) => {
        if (err.status === 401) {
            toast.error('Потрібно авторизуватися')
        }
        return true
    }, 'Коментар успішно додано')
}

const resetForm = () => {
    createCommentForm.text = ''
}

const confirmRemoval = (event: Event, id: number, message: string, action: (id: number) => void) => {
    confirm.require({
        target: event.currentTarget as HTMLElement,
        message,
        icon: 'pi pi-exclamation-triangle',
        rejectProps: {
            label: 'Ні',
            severity: 'secondary',
            outlined: true
        },
        acceptProps: {
            label: 'Так'
        },
        accept: () => {
            action(id)
        },
    });
}

const addEmoji = (emoji: Emoji) => {
    createCommentForm.text = createCommentForm.text + emoji.i
}

const deleteComment = (id: number) => {
    wrapAsyncCall(async () => {
        await fetchPost('/forum/deleteMessage', {id})
        await loadComments()
    })
}

const toggleEmojiPicker = () => {
    showEmojiPicker.value = !showEmojiPicker.value
}

const editingCommentId = ref<number|null>(null);
const editingCommentText = ref('');

const startEditComment = (comment: IForumComment) => {
    editingCommentId.value = comment.id;
    editingCommentText.value = comment.text;
};

const cancelEditComment = () => {
    editingCommentId.value = null;
    editingCommentText.value = '';
};

const saveEditComment = async (comment: IForumComment) => {
    await wrapAsyncCall(async () => {
        await fetchPost('/forum/updateMessage', {
            text: editingCommentText.value,
            id: comment.id
        });
        await loadComments();
        editingCommentId.value = null;
        editingCommentText.value = '';
    }, null, 'Коментар відредаговано');
};
</script>
<template>
    <div class="article flex-grow-1	">
        <div class="article__inner">
            <div  v-if="theme" class="article__container">
                <h1 class="article__title">{{ theme?.name }}</h1>
                <nav class="breadcrumbs mt-3">
                    <router-link :to="{ name: 'forum' }">Головний розділ</router-link>
                    <span class="mx-2">/</span>
                    <router-link :to="{ name: 'themes', params: { sub_id: theme?.id_main } }">
                        {{ category?.topic.find(t => t.id === theme?.id_main)?.name }}
                    </router-link>
                    <span class="mx-2">/</span>
                    <span class="opacity-80">{{ theme?.name }}</span>
                </nav>
                <small class="text-sm mt-5 block opacity-50">Тема в розділі "{{ category?.name }}", створена користувачем {{ theme?.user.username }}, {{ format(theme?.created_at, 'dd-MM-yyyy HH:mm') }}</small>
                <div class="flex gap-3 justify-content-between mt-3 flex-wrap sm:flex-nowrap">
                    <div class="article__writer writer writer_main flex flex-column align-items-center justify-content-center gap-2 sticky align-self-start">
                        <div class="writer__avatar">
                            <img v-if="theme.user.avatar" :src="filesBase + theme.user.avatar" alt="">
                            <svg v-else width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M25 24.9997C29.6023 24.9997 33.3333 21.2687 33.3333 16.6663C33.3333 12.064 29.6023 8.33301 25 8.33301C20.3976 8.33301 16.6666 12.064 16.6666 16.6663C16.6666 21.2687 20.3976 24.9997 25 24.9997Z" fill="#e26f0f"/>
                                <path d="M41.6667 39.583V41.6663C41.6667 42.2189 41.4472 42.7488 41.0565 43.1395C40.6658 43.5302 40.1359 43.7497 39.5834 43.7497H10.4167C9.86417 43.7497 9.33427 43.5302 8.94357 43.1395C8.55287 42.7488 8.33337 42.2189 8.33337 41.6663V39.583C8.33337 36.2678 9.65033 33.0884 11.9945 30.7442C14.3387 28.4 17.5182 27.083 20.8334 27.083H29.1667C32.4819 27.083 35.6613 28.4 38.0055 30.7442C40.3497 33.0884 41.6667 36.2678 41.6667 39.583Z" fill="#e26f0f"/>
                            </svg>
                        </div>

                        <h3 class="writer__name ">{{ theme.user.username }}</h3>
                        <p class="writer__position">{{ getRoleName(theme.user.role) }}</p>
                    </div>
                    <div class="article__content flex flex-column flex-grow-1" :innerHTML="theme.text"></div>
                </div>
                <div class="article__comments comments flex flex-column gap-3">
                    <h2 class="mt-6 mb-4">Коментарі</h2>
                    <div v-if="comments?.length" v-for="comment of comments" class="comments__item flex">
                        <div class="comments__writer writer flex flex-column align-items-center justify-content-center gap-2">
                            <div class="writer__avatar">
                                <img v-if="comment.user.avatar" :src="filesBase + comment.user.avatar" alt="">
                                <svg v-else width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M25 24.9997C29.6023 24.9997 33.3333 21.2687 33.3333 16.6663C33.3333 12.064 29.6023 8.33301 25 8.33301C20.3976 8.33301 16.6666 12.064 16.6666 16.6663C16.6666 21.2687 20.3976 24.9997 25 24.9997Z" fill="#e26f0f"/>
                                    <path d="M41.6667 39.583V41.6663C41.6667 42.2189 41.4472 42.7488 41.0565 43.1395C40.6658 43.5302 40.1359 43.7497 39.5834 43.7497H10.4167C9.86417 43.7497 9.33427 43.5302 8.94357 43.1395C8.55287 42.7488 8.33337 42.2189 8.33337 41.6663V39.583C8.33337 36.2678 9.65033 33.0884 11.9945 30.7442C14.3387 28.4 17.5182 27.083 20.8334 27.083H29.1667C32.4819 27.083 35.6613 28.4 38.0055 30.7442C40.3497 33.0884 41.6667 36.2678 41.6667 39.583Z" fill="#e26f0f"/>
                                </svg>
                            </div>
                            <h3 class="writer__name ">{{ comment.user.username }}</h3>
                            <p class="writer__position">{{ getRoleName(comment.user.role) }}</p>
                        </div>
                        <div class="comments__text py-3 px-5 flex flex-column justify-content-between w-full">
                            <template v-if="editingCommentId === comment.id">
                                <ckeditor
                                    v-model="editingCommentText"
                                    :editor="ClassicEditor"
                                    :config="editorConfig"
                                />
                                <div class="flex gap-2 mt-2">
                                    <Button size="small" class="success" @click="saveEditComment(comment)">Зберегти</Button>
                                    <Button size="small" class="danger" @click="cancelEditComment">Скасувати</Button>
                                </div>
                            </template>
                            <template v-else>
                                <p v-html="comment.text"></p>
                                <div class="flex justify-content-between align-items-end">
                                    <small class="text-sm opacity-50">{{comment.user.username}}, {{format(comment.created_at, 'dd-MM-yyyy')}}</small>
                                    <div class="flex gap-2">
                                        <Button v-if="isAdmin || userStore.user?.id === comment.user_id" icon="pi pi-pencil" class="primary" size="small" @click="startEditComment(comment)" v-tooltip="'Редагувати коментар'" />
                                        <Button v-if="isAdmin" v-tooltip="'Видалити коментар'" icon="pi pi-trash" @click="confirmRemoval($event, comment.id, 'Ви впевнені, що хочете видалити цей коментар?', deleteComment)" class="danger" />
                                    </div>
                                </div>
                            </template>
                        </div>
                    </div>
                    <div v-else>
                        <p>Коментарі відсутні</p>
                    </div>
                    <Paginator 
                        v-if="commetsTotal > commentsLimit"
                        :rows="commentsLimit" 
                        :totalRecords="commetsTotal" 
                        :rowsPerPageOptions="[5, 10, 20, 30]" 
                        @page="onPageChange"
                        class="mt-4"
                    />
                    <div v-if="userStore.user" class="comments__textarea mt-5">
                        <h2 class="mb-3">Залишити коментар</h2>
                        <form @submit.prevent="createComment">
                            <div class="relative">
                                <ckeditor
                                    v-model="createCommentForm.text"
                                    :editor="ClassicEditor"
                                    :config="editorConfig"
                                />
                                <!-- <button @click.prevent="toggleEmojiPicker" class="emoji-button">😊</button> -->
                                <!-- <EmojiPicker  @onEmojiPicker="addEmoji" :showEmojiPicker="showEmojiPicker" class="emoji"/> -->
                            </div>
                            <button class="btn btn-sm mt-2">Відправити</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped lang='scss'>
.article {
    color: #FFF;

    &__title {
        text-shadow: 3px 0px 7px rgba(81, 67, 21, 0.8), -3px 0px 7px rgba(81, 67, 21, 0.8), 0px 4px 7px rgba(81, 67, 21, 0.8);
    }

    &__content {
        padding: 20px;
        border-radius: 10px;
        background: #fff;
        border: 1px solid #e26f0f;
        color: black;
        
        * {
            text-shadow: none;
            height: auto;
            max-width: 100%;
            color: inherit;
        }

        ::v-deep(a) {
            color: blue;
            text-decoration: none;
        }

        ::v-deep(ul, ol) {
            padding-left: 20px;
        }
    }

    ::deep(
        img,
        iframe,
        video
    ) {
        height: auto;
    }
}


.emoji {
    position: absolute;
    top: 5px;
    right: 10px;
    z-index: 1000;
}

.emoji-button {
    position: absolute;
    top: 5px;
    right: 10px;
    z-index: 1000;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    margin-bottom: 8px;
}

.writer {
    width: fit-content;
    height: fit-content;
    min-width: 150px;
    background: rgba(93, 119, 144, 0.1);
    padding: 20px;
    border-radius: 10px;
    border: 1px solid #e26f0f;  
    top: -5px;
    z-index: 1;
    text-align: center;
    max-width: 140px;

    @media (max-width: 1024px) {
        min-width: auto;
    }

    &_main {
        @media (max-width: 576px) {
            width: 100%;
            background: linear-gradient(180deg, #16171b 20%, rgb(39, 50, 68) 100%);
        }
    }

    &__avatar {
        width: 50px;
        height: 50px;
        border-radius: 100%;
        overflow: hidden;

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }
}

.comments {

    &__item {
        background: rgba(93, 119, 144, 0.1);
        border: 1px solid rgba(93, 119, 144, 0.1);
        border-radius: 10px 0 0 10px;
    }
    
    &__writer {
        border: 1px solid rgba(93, 119, 144, 0.1);
    }
    
    &__text {
        word-break: break-all;

        * {
            text-shadow: none !important;
            height: auto;
            max-width: 100%;
        }
    }

    ol, ul {
        padding-left: 20px !important;
    }

    ::v-deep(.ck-editor) {
        width: clamp(300px, 70vw, 887px) !important;

        @media (min-width: 1080px) {
            width: 100% !important;
        }
        
        @media (max-width: 768px) {
            width: 90vw !important;
        }
    }

    ::v-deep(.ck-editor__editable) {
        min-height: 200px;
    }

    ::v-deep(a) {
        color: #e26f0f;
        text-decoration: none;
    }
}

.breadcrumbs {
    display: flex;
    align-items: left;
    gap: 5px;
    font-size: 14px;
    color: #fff;
    margin-top: 10px;
    width: 100%;

    * {
        text-shadow: none;
    }

    a {
        color: #fff;
        text-decoration: none;
        transition: all .3s ease-in-out;

        &:hover {
            text-decoration: underline;
        }
    }
}
</style>