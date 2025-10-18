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
// old EmojiPicker removed in favor of ReactionPicker (only supported)
import ReactionPicker from '@/components/ReactionPicker.vue';
import { useToast } from 'vue-toastification';
import type { Emoji } from '@/models/emoji';
import ReactionBar from '@/components/ReactionBar.vue';
import type { Emotion } from '@/models/emotion';
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

const availableEmotions = [
    // Новий повний список PNG-іконок зі скріна (SVG видалено)
    { id: 1,  icon: '@/assets/emotions/+1.png',                              title: '+1' },
    { id: 2,  icon: '@/assets/emotions/-1.png',                              title: '-1' },
    { id: 3,  icon: '@/assets/emotions/alien.png',                           title: 'Прибулець' },
    { id: 4,  icon: '@/assets/emotions/blue_heart.png',                      title: 'Синє серце' },
    { id: 5,  icon: '@/assets/emotions/broken_heart.png',                    title: 'Розбите серце' },
    { id: 6,  icon: '@/assets/emotions/clown_face.png',                      title: 'Клоун' },
    { id: 7,  icon: '@/assets/emotions/cry.png',                             title: 'Плачу' },
    { id: 8,  icon: '@/assets/emotions/crying_cat_face.png',                 title: 'Кіт плаче' },
    { id: 9,  icon: '@/assets/emotions/exploding_head.png',                  title: 'Вибух мозку' },
    { id: 10, icon: '@/assets/emotions/expressionless.png',                  title: 'Беземоційний' },
    { id: 11, icon: '@/assets/emotions/eyes.png',                            title: 'Очі' },
    { id: 12, icon: '@/assets/emotions/face_vomiting.png',                   title: 'Нудить' },
    { id: 13, icon: '@/assets/emotions/face_with_raised_eyebrow.png',        title: 'Піднята брова' },
    { id: 14, icon: '@/assets/emotions/face_with_symbols_on_mouth.png',      title: 'Лайка' },
    { id: 15, icon: '@/assets/emotions/flag-ua.png',                          title: 'Прапор України' },
    { id: 16, icon: '@/assets/emotions/flushed.png',                         title: 'Збентеження' },
    { id: 17, icon: '@/assets/emotions/ghost.png',                           title: 'Привид' },
    { id: 18, icon: '@/assets/emotions/grin.png',                            title: 'Усмішка' },
    { id: 19, icon: '@/assets/emotions/grinning.png',                        title: 'Широка усмішка' },
    { id: 20, icon: '@/assets/emotions/handshake.png',                       title: 'Рукостискання' },
    { id: 21, icon: '@/assets/emotions/hear_no_evil.png',                    title: 'Не чую зла' },
    { id: 22, icon: '@/assets/emotions/heart.png',                           title: 'Серце' },
    { id: 23, icon: '@/assets/emotions/heart_eyes.png',                      title: 'Закоханий' },
    { id: 24, icon: '@/assets/emotions/heart_eyes_cat.png',                  title: 'Кіт закоханий' },
    { id: 25, icon: '@/assets/emotions/hugging_face.png',                    title: 'Обійми' },
    { id: 26, icon: '@/assets/emotions/joy.png',                             title: 'Радість' },
    { id: 27, icon: '@/assets/emotions/joy_cat.png',                         title: 'Кіт радіє' },
    { id: 28, icon: '@/assets/emotions/kiss.png',                            title: 'Поцілунок' },
    { id: 29, icon: '@/assets/emotions/neutral_face.png',                    title: 'Нейтральне обличчя' },
    { id: 30, icon: '@/assets/emotions/ok_hand.png',                         title: 'ОК' },
    { id: 31, icon: '@/assets/emotions/pray.png',                            title: 'Молитва' },
    { id: 32, icon: '@/assets/emotions/rage.png',                            title: 'Лють' },
    { id: 33, icon: '@/assets/emotions/relieved.png',                        title: 'Полегшення' },
    { id: 34, icon: '@/assets/emotions/rolling_on_the_floor_laughing.png',   title: 'Катаюсь від сміху' },
    { id: 35, icon: '@/assets/emotions/see_no_evil.png',                     title: 'Не бачу зла' },
    { id: 36, icon: '@/assets/emotions/smiling_imp.png',                     title: 'Усміх з ріжками' },
    { id: 37, icon: '@/assets/emotions/smirk.png',                           title: 'Самовдоволена усмішка' },
    { id: 38, icon: '@/assets/emotions/sob.png',                             title: 'Ридаю' },
    { id: 39, icon: '@/assets/emotions/speak_no_evil.png',                   title: 'Не говорю зла' },
    { id: 40, icon: '@/assets/emotions/sunglasses.png',                      title: 'Круто' },
    { id: 41, icon: '@/assets/emotions/sweat_smile.png',                     title: 'Незручний усміх' },
    { id: 42, icon: '@/assets/emotions/thinking_face.png',                   title: 'Думаю' },
    { id: 43, icon: '@/assets/emotions/wink.png',                            title: 'Підморгування' },
    { id: 44, icon: '@/assets/emotions/yellow_heart.png',                    title: 'Жовте серце' },
    { id: 45, icon: '@/assets/emotions/zany_face.png',                       title: 'Шалений' },
    { id: 46, icon: '@/assets/emotions/fire.png',                             title: 'Вогонь' },
]

const REACTION_ENDPOINT = '/forum/addEmotion' // backend endpoint
const REMOVE_REACTION_ENDPOINT = '/forum/removeEmotion'

const showThemeEmojiPicker = ref(false)
const openCommentPickerId = ref<number | null>(null)

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

const deleteComment = (id: number) => {
    wrapAsyncCall(async () => {
        await fetchPost('/forum/deleteMessage', {id})
        await loadComments()
    })
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

async function sendReaction(type_mess: 0 | 1, id_message: number, idEmotion: number) {
    // API expects: { id_message: Long, id_emotion: Long, type_mess: int } where 0 – коментар, 1 – тема
    await fetchPost(REACTION_ENDPOINT, { id_message, id_emotion: idEmotion, type_mess })
}

async function removeReaction(type_mess: 0 | 1, id_message: number) {
    // API expects: { id_message: Long, type_mess: int } where 0 – коментар, 1 – тема
    await fetchPost(REMOVE_REACTION_ENDPOINT, { id_message, type_mess })
}

async function onToggleTheme(idEmotion: number, isActive: boolean) {
    if (!userStore.user?.id) {
        toast.error('Потрібно авторизуватися')
        return
    }
    if (!theme.value) return
    // toggle: remove if active by me, otherwise add
    if (isActive) {
        await removeReaction(1, themeId.value)
    } else {
        await sendReaction(1, themeId.value, idEmotion)
    }
    const { data: _theme } = await fetchPost('/forum/getTheme', { id: themeId.value })
    theme.value = _theme
}

async function onSelectTheme(idEmotion: number) {
    // selecting from picker always adds
    await sendReaction(1, themeId.value, idEmotion)
    const { data: _theme } = await fetchPost('/forum/getTheme', { id: themeId.value })
    theme.value = _theme
}

async function onToggleComment(comment: IForumComment, idEmotion: number, isActive: boolean) {
    if (!userStore.user?.id) {
        toast.error('Потрібно авторизуватися')
        return
    }
    if (isActive) {
        await removeReaction(0, comment.id)
    } else {
        await sendReaction(0, comment.id, idEmotion)
    }
    await loadComments()
}

async function onSelectComment(comment: IForumComment, idEmotion: number) {
    await sendReaction(0, comment.id, idEmotion)
    await loadComments()
}

function onOpenThemePicker() {
    showThemeEmojiPicker.value = !showThemeEmojiPicker.value
}

function onOpenCommentPicker(commentId: number) {
    openCommentPickerId.value = openCommentPickerId.value === commentId ? null : commentId
}

function onThemeEmojiPicked(idEmotion: number) {
    onSelectTheme(idEmotion)
    showThemeEmojiPicker.value = false
}

function onCommentEmojiPicked(comment: IForumComment, idEmotion: number) {
    onSelectComment(comment, idEmotion)
    openCommentPickerId.value = null
}

function onCloseThemePicker() {
    showThemeEmojiPicker.value = false
}

function onCloseCommentPicker() {
    openCommentPickerId.value = null
}
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
                <div class="article__writer writer writer_main mt-5 mb-2">
                    <div class="writer__avatar">
                        <img v-if="theme.user.avatar" :src="filesBase + theme.user.avatar" alt="">
                        <svg v-else width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M25 24.9997C29.6023 24.9997 33.3333 21.2687 33.3333 16.6663C33.3333 12.064 29.6023 8.33301 25 8.33301C20.3976 8.33301 16.6666 12.064 16.6666 16.6663C16.6666 21.2687 20.3976 24.9997 25 24.9997Z" fill="#e26f0f"/>
                            <path d="M41.6667 39.583V41.6663C41.6667 42.2189 41.4472 42.7488 41.0565 43.1395C40.6658 43.5302 40.1359 43.7497 39.5834 43.7497H10.4167C9.86417 43.7497 9.33427 43.5302 8.94357 43.1395C8.55287 42.7488 8.33337 42.2189 8.33337 41.6663V39.583C8.33337 36.2678 9.65033 33.0884 11.9945 30.7442C14.3387 28.4 17.5182 27.083 20.8334 27.083H29.1667C32.4819 27.083 35.6613 28.4 38.0055 30.7442C40.3497 33.0884 41.6667 36.2678 41.6667 39.583Z" fill="#e26f0f"/>
                        </svg>
                    </div>

                    <div class="flex flex-column">
                        <h3 class="writer__name ">{{ theme.user.username }}</h3>
                        <p class="writer__position">{{ getRoleName(theme.user.role) }}</p>
                    </div>
                </div>
                <small class="text-sm block opacity-50 mb-2">Тема в розділі "{{ category?.name }}", створена користувачем {{ theme?.user.username }}, {{ format(theme?.created_at, 'dd-MM-yyyy HH:mm') }}</small>
                
                <div class="article__content flex flex-column flex-grow-1" :innerHTML="theme.text"></div>
                <div class="mt-2">
                    <ReactionBar
                        v-if="theme"
                        :emotions="theme.emotion"
                        :availableEmotions="availableEmotions"
                        @toggle="({ idEmotion, isActive }) => onToggleTheme(idEmotion, isActive)"
                        @selectNew="({ idEmotion }) => onSelectTheme(idEmotion)"
                        @openPicker="onOpenThemePicker"
                    >
                        <template #picker>
                            <ReactionPicker
                                v-if="showThemeEmojiPicker"
                                :options="availableEmotions"
                                @select="onThemeEmojiPicked"
                                @close="onCloseThemePicker"
                            />
                        </template>
                    </ReactionBar>
                </div>
                <div class="flex gap-3 justify-content-between mt-3 flex-wrap sm:flex-nowrap">
                </div>
                <div class="article__comments comments flex flex-column gap-3">
                    <h2 class="mt-6 mb-4">Коментарі</h2>
                    <div v-if="comments?.length" v-for="comment of comments">
                        <div  class="comments__item flex">
                        <div class="comments__writer writer flex flex-column align-items-center justify-content-center gap-2">
                            <div class="writer__avatar">
                                <img v-if="comment.user.avatar" :src="filesBase + comment.user.avatar" alt="">
                                <svg v-else width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M25 24.9997C29.6023 24.9997 33.3333 21.2687 33.3333 16.6663C33.3333 12.064 29.6023 8.33301 25 8.33301C20.3976 8.33301 16.6666 12.064 16.6666 16.6663C16.6666 21.2687 20.3976 24.9997 25 24.9997Z" fill="#e26f0f"/>
                                    <path d="M41.6667 39.583V41.6663C41.6667 42.2189 41.4472 42.7488 41.0565 43.1395C40.6658 43.5302 40.1359 43.7497 39.5834 43.7497H10.4167C9.86417 43.7497 9.33427 43.5302 8.94357 43.1395C8.55287 42.7488 8.33337 42.2189 8.33337 41.6663V39.583C8.33337 36.2678 9.65033 33.0884 11.9945 30.7442C14.3387 28.4 17.5182 27.083 20.8334 27.083H29.1667C32.4819 27.083 35.6613 28.4 38.0055 30.7442C40.3497 33.0884 41.6667 36.2678 41.6667 39.583Z" fill="#e26f0f"/>
                                </svg>
                            </div>
                            <h3 class="writer__name text-center">{{ comment.user.username }}</h3>
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
                                    <div class="flex gap-2 align-items-center">
                                        
                                        <Button v-if="isAdmin || userStore.user?.id === comment.user_id" icon="pi pi-pencil" class="primary" size="small" @click="startEditComment(comment)" v-tooltip="'Редагувати коментар'" />
                                        <Button v-if="isAdmin" v-tooltip="'Видалити коментар'" icon="pi pi-trash" @click="confirmRemoval($event, comment.id, 'Ви впевнені, що хочете видалити цей коментар?', deleteComment)" class="danger" />
                                    </div>
                                </div>
                            </template>
                        </div>
                        
                    </div>
                        <ReactionBar
                            :emotions="comment.emotion"
                            :availableEmotions="availableEmotions"
                            @toggle="({ idEmotion, isActive }) => onToggleComment(comment, idEmotion, isActive)"
                            @selectNew="({ idEmotion }) => onSelectComment(comment, idEmotion)"
                            @openPicker="() => onOpenCommentPicker(comment.id)"
                        >
                            <template #picker>
                                <ReactionPicker
                                    v-if="openCommentPickerId === comment.id"
                                    :options="availableEmotions"
                                    @select="(id:number) => onCommentEmojiPicked(comment, id)"
                                    @close="onCloseCommentPicker"
                                />
                            </template>
                        </ReactionBar>
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
    word-break: break-word;

    &__title {
        text-shadow: 3px 0px 7px rgba(81, 67, 21, 0.8), -3px 0px 7px rgba(81, 67, 21, 0.8), 0px 4px 7px rgba(81, 67, 21, 0.8);
    }

    &__content {
        font-family: "Candara", sans-serif;
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

        ::v-deep(:is(ul, ol)) {
            padding-left: 25px;
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
    display: flex;
    align-items: center;
    gap: 10px;
    padding-bottom: 10px;

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
        padding: 10px;
        border: 1px solid rgba(93, 119, 144, 0.1);
    }
    
    &__text {
        font-family: "Candara", sans-serif;
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