<script setup lang='ts'>
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import ForumHeader from '@/components/ForumHeader.vue';
import ForumSideCard from '@/components/ForumSideCard.vue';

import { computed, onMounted, reactive, ref, watch } from 'vue';
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
import { ClassicEditor } from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';
import { editorConfig } from '@/utils/ckeditorConfig';
import forumSideCard1 from '@/assets/images/forum-side-card-1.png'
import forumSideCard2 from '@/assets/images/forum-side-card-2.png'
import forumSideCard3 from '@/assets/images/forum-side-card-3.png'
import featherIcon from '@/assets/images/feather.svg'
import removeIcon from '@/assets/icons/remove.svg'

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
const isQuickCommentEditorOpen = ref(false)
const openReplyEditorCommentId = ref<number | null>(null)
const sideCardsByCategoryId: Record<number, { image: string; title: string; description: string }> = {
    1: {
        image: forumSideCard1,
        title: 'Офіційний розділ',
        description: 'Публікації від команди: зміни, оголошення, і загальна картина подій на сервері.'
    },
    2: {
        image: forumSideCard2,
        title: 'Розділ спільноти',
        description: 'Простір для гравців: обговорення, пропозиції, живий обмін досвідом між учасниками.'
    },
    3: {
        image: forumSideCard3,
        title: 'Ігровий розділ',
        description: 'Все про занурення в гру: практичні знання, досвід, підказки і історії з живого світу Perfect World.'
    },
}
const currentSideCard = computed(() => {
    const categoryId = Number(route.params.cat_id)
    return sideCardsByCategoryId[categoryId] || sideCardsByCategoryId[1]
})

const commentsTotalPages = computed(() => Math.ceil(commetsTotal.value / commentsLimit.value))

const commentsVisiblePages = computed(() => {
    const pages: (number | string)[] = []
    const total = commentsTotalPages.value
    const current = commentsPage.value

    if (total <= 7) {
        for (let i = 1; i <= total; i++) {
            pages.push(i)
        }
    } else {
        pages.push(1)

        if (current <= 4) {
            for (let i = 2; i <= 5; i++) {
                pages.push(i)
            }
            pages.push('...')
            pages.push(total)
        } else if (current >= total - 3) {
            pages.push('...')
            for (let i = total - 4; i <= total; i++) {
                pages.push(i)
            }
        } else {
            pages.push('...')
            pages.push(current - 1)
            pages.push(current)
            pages.push(current + 1)
            pages.push('...')
            pages.push(total)
        }
    }

    return pages
})

const goToCommentsPage = (page: number) => {
    if (page >= 1 && page <= commentsTotalPages.value) {
        commentsPage.value = page
        wrapAsyncCall(() => loadComments())
    }
}

const goToCommentsPreviousPage = () => {
    if (commentsPage.value > 1) {
        goToCommentsPage(commentsPage.value - 1)
    }
}

const goToCommentsNextPage = () => {
    if (commentsPage.value < commentsTotalPages.value) {
        goToCommentsPage(commentsPage.value + 1)
    }
}

const createCommentForm = reactive({
    text: ''
})
const replyCommentForm = reactive({
    text: ''
})
const loadThemeData = async () => {
    await wrapAsyncCall(async () => {
        await loadComments()
        const {data: _theme} = await fetchPost('/forum/getTheme', {id: themeId.value})
        const {data: _categories} = await fetchGet('/forum/getMain')
        theme.value = _theme
        category.value = _categories.find((cat: IForumCategory) => cat.id === +route.params.cat_id)
    })
}

onMounted(() => {
    loadThemeData()
})

// Відстежуємо зміни параметрів маршруту для оновлення даних при переході між темами
watch(() => route.params.theme_id, (newThemeId) => {
    if (newThemeId) {
        themeId.value = +newThemeId
        commentsPage.value = 1
        loadThemeData()
    }
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
        isQuickCommentEditorOpen.value = false
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

const openQuickCommentEditor = () => {
    if (!userStore.user) {
        toast.error('Потрібно авторизуватися')
        return
    }
    isQuickCommentEditorOpen.value = true
}

const closeQuickCommentEditor = () => {
    isQuickCommentEditorOpen.value = false
}

const openReplyEditor = (comment: IForumComment) => {
    if (!userStore.user) {
        toast.error('Потрібно авторизуватися')
        return
    }

    openReplyEditorCommentId.value = openReplyEditorCommentId.value === comment.id ? null : comment.id
    if (!openReplyEditorCommentId.value) {
        replyCommentForm.text = ''
    }
}

const closeReplyEditor = () => {
    openReplyEditorCommentId.value = null
    replyCommentForm.text = ''
}

const createReplyComment = async () => {
    await wrapAsyncCall(async () => {
        await fetchPost('/forum/addMessage', {
            text: replyCommentForm.text,
            id_theme: themeId.value
        })
        await loadComments()
        closeReplyEditor()
    },
    (err) => {
        if (err.status === 401) {
            toast.error('Потрібно авторизуватися')
        }
        return true
    }, 'Коментар успішно додано')
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
        <ForumHeader />
        <div class="article__inner">
            <div  v-if="theme" class="article__container">
                <div class="article__layout">
                    <div class="article__top-layout">
                        <aside class="article__author writer writer_main">
                            <div class="article__corner article__corner--top-left"></div>
                            <div class="article__corner article__corner--top-right"></div>
                            <div class="article__corner article__corner--bottom-left"></div>
                            <div class="article__corner article__corner--bottom-right"></div>
                            <div class="writer__avatar">
                                <img v-if="theme.user.avatar" :src="filesBase + theme.user.avatar" alt="">
                                <svg v-else width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M25 24.9997C29.6023 24.9997 33.3333 21.2687 33.3333 16.6663C33.3333 12.064 29.6023 8.33301 25 8.33301C20.3976 8.33301 16.6666 12.064 16.6666 16.6663C16.6666 21.2687 20.3976 24.9997 25 24.9997Z" fill="#e26f0f"/>
                                    <path d="M41.6667 39.583V41.6663C41.6667 42.2189 41.4472 42.7488 41.0565 43.1395C40.6658 43.5302 40.1359 43.7497 39.5834 43.7497H10.4167C9.86417 43.7497 9.33427 43.5302 8.94357 43.1395C8.55287 42.7488 8.33337 42.2189 8.33337 41.6663V39.583C8.33337 36.2678 9.65033 33.0884 11.9945 30.7442C14.3387 28.4 17.5182 27.083 20.8334 27.083H29.1667C32.4819 27.083 35.6613 28.4 38.0055 30.7442C40.3497 33.0884 41.6667 36.2678 41.6667 39.583Z" fill="#e26f0f"/>
                                </svg>
                            </div>
                            <div class="writer__name-container flex flex-column align-items-center">
                                <h3 class="writer__name">{{ theme.user.username }}</h3>
                                <p class="writer__position">{{ getRoleName(theme.user.role) }}</p>
                            </div>
                        </aside>

                        <div class="article__main-card">
                            <div class="article__corner article__corner--top-left"></div>
                            <div class="article__corner article__corner--top-right"></div>
                            <div class="article__corner article__corner--bottom-left"></div>
                            <div class="article__corner article__corner--bottom-right"></div>

                            <h1 class="article__title">{{ theme?.name }}</h1>
                            <!--
                            <nav class="breadcrumbs mt-3">
                                <router-link :to="{ name: 'forum' }">Головний розділ</router-link>
                                <span class="mx-2">/</span>
                                <router-link :to="{ name: 'themes', params: { sub_id: theme?.id_main } }">
                                    {{ category?.topic.find(t => t.id === theme?.id_main)?.name }}
                                </router-link>
                                <span class="mx-2">/</span>
                                <span class="opacity-80">{{ theme?.name }}</span>
                            </nav>
                            -->
                            <small class="text-sm block opacity-30 mt-2 mb-3">Тема в розділі "{{ category?.name }}", створена користувачем {{ theme?.user.username }}, {{ format(theme?.created_at, 'dd-MM-yyyy HH:mm') }}</small>
                            <div class="article__content flex flex-column flex-grow-1" :innerHTML="theme.text"></div>
                            <div class="mt-3">
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
                            <div class="article__quick-comment mt-4">
                                <button
                                    v-if="!isQuickCommentEditorOpen"
                                    type="button"
                                    class="article__quick-comment-trigger"
                                    @click="openQuickCommentEditor"
                                >
                                    Поділися думками...
                                </button>

                                <form
                                    v-else
                                    class="article__quick-comment-form"
                                    @submit.prevent="createComment"
                                >
                                    <ckeditor
                                        v-model="createCommentForm.text"
                                        :editor="ClassicEditor"
                                        :config="editorConfig"
                                    />
                                    <div class="article__quick-comment-actions">
                                        <button type="submit" class="fantasy-btn small ml-4"><span>Відправити</span></button>
                                        <button
                                            type="button"
                                            size="small"
                                            class="fantasy-btn small danger ml-4"
                                            @click="closeQuickCommentEditor"
                                        >
                                            <span>Скасувати</span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <ForumSideCard
                            v-if="currentSideCard"
                            class="article__side-card"
                            :image="currentSideCard.image"
                            :title="currentSideCard.title"
                            :description="currentSideCard.description"
                        />
                    </div>
                    <section class="article__main">
                        <div class="article__comments comments flex flex-column gap-3">
                    <div v-if="comments?.length" v-for="comment of comments" :key="comment.id" class="comments__entry">
                        <div class="comments__item">
                        <div class="comments__writer writer flex flex-column align-items-center justify-content-center gap-2">
                            <div class="article__corner article__corner--top-left"></div>
                            <div class="article__corner article__corner--top-right"></div>
                            <div class="article__corner article__corner--bottom-left"></div>
                            <div class="article__corner article__corner--bottom-right"></div>
                            <div class="writer__avatar">
                                <img v-if="comment.user.avatar" :src="filesBase + comment.user.avatar" alt="">
                                <svg v-else width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M25 24.9997C29.6023 24.9997 33.3333 21.2687 33.3333 16.6663C33.3333 12.064 29.6023 8.33301 25 8.33301C20.3976 8.33301 16.6666 12.064 16.6666 16.6663C16.6666 21.2687 20.3976 24.9997 25 24.9997Z" fill="#e26f0f"/>
                                    <path d="M41.6667 39.583V41.6663C41.6667 42.2189 41.4472 42.7488 41.0565 43.1395C40.6658 43.5302 40.1359 43.7497 39.5834 43.7497H10.4167C9.86417 43.7497 9.33427 43.5302 8.94357 43.1395C8.55287 42.7488 8.33337 42.2189 8.33337 41.6663V39.583C8.33337 36.2678 9.65033 33.0884 11.9945 30.7442C14.3387 28.4 17.5182 27.083 20.8334 27.083H29.1667C32.4819 27.083 35.6613 28.4 38.0055 30.7442C40.3497 33.0884 41.6667 36.2678 41.6667 39.583Z" fill="#e26f0f"/>
                                </svg>
                            </div>
                            <div class="writer__name-container flex flex-column align-items-center">
                                <h3 class="writer__name">{{ comment.user.username }}</h3>
                                <p class="writer__position">{{ getRoleName(comment.user.role) }}</p>
                            </div>
                        </div>
                        <div class="comments__body">
                            <div class="article__corner article__corner--top-left"></div>
                            <div class="article__corner article__corner--top-right"></div>
                            <div class="article__corner article__corner--bottom-left"></div>
                            <div class="article__corner article__corner--bottom-right"></div>
                            <div class="comments__text flex flex-column justify-content-between w-full">
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
                                </template>
                            </div>
                            <div class="comments__actions">
                                <button
                                    v-if="false"
                                    type="button"
                                    class="comments__reply-btn"
                                    @click="openReplyEditor(comment)"
                                >
                                    <i class="pi pi-comment"></i>
                                    <span>Відповісти</span>
                                </button>
                                <ReactionBar class="comments__reactions"
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
                                <div v-if="editingCommentId !== comment.id" class="comments__meta">
                                    <div class="comments__meta-actions">
                                        <button
                                            v-if="isAdmin || userStore.user?.id === comment.user_id"
                                            type="button"
                                            class="comments__icon-btn comments__icon-btn--edit"
                                            @click="startEditComment(comment)"
                                            v-tooltip="'Редагувати коментар'"
                                        >
                                            <img :src="featherIcon" alt="edit">
                                        </button>
                                        <button
                                            v-if="isAdmin"
                                            type="button"
                                            class="comments__icon-btn comments__icon-btn--delete"
                                            v-tooltip="'Видалити коментар'"
                                            @click="confirmRemoval($event, comment.id, 'Ви впевнені, що хочете видалити цей коментар?', deleteComment)"
                                        >
                                            <img :src="removeIcon" alt="delete">
                                        </button>
                                    </div>
                                    <small class="comments__meta-info">{{comment.user.username}}, {{format(comment.created_at, 'dd-MM-yyyy')}}</small>
                                </div>
                            </div>
                        </div>
                    </div>
                    <form
                        v-if="openReplyEditorCommentId === comment.id"
                        class="comments__reply-form"
                        @submit.prevent="createReplyComment"
                    >
                        <ckeditor
                            v-model="replyCommentForm.text"
                            :editor="ClassicEditor"
                            :config="editorConfig"
                        />
                        <div class="comments__reply-actions">
                            <button type="submit" class="fantasy-btn small ml-4"><span>Відправити</span></button>
                            <button
                                type="button"
                                class="fantasy-btn small danger ml-4"
                                @click="closeReplyEditor"
                            >
                                <span>Скасувати</span>
                            </button>
                        </div>
                    </form>
                    </div>
                    
                    <div v-else>
                        <p>Коментарі відсутні</p>
                    </div>
                    <div v-if="commentsTotalPages > 1" class="forum-themes__pagination">
                        <button
                            type="button"
                            @click="goToCommentsPreviousPage"
                            class="forum-themes__pagination-arrow"
                            :disabled="commentsPage === 1"
                            aria-label="Previous page"
                        >
                            <img src="@/assets/images/arrow-prev.svg" alt="prev" class="forum-themes__pagination-arrow-icon" />
                        </button>

                        <div class="forum-themes__pagination-numbers">
                            <template v-for="page in commentsVisiblePages" :key="page">
                                <button
                                    v-if="typeof page === 'number'"
                                    type="button"
                                    @click="goToCommentsPage(page)"
                                    class="forum-themes__pagination-number"
                                    :class="{ active: page === commentsPage }"
                                    :aria-current="page === commentsPage ? 'page' : undefined"
                                >
                                    {{ page }}
                                </button>
                                <span v-else class="forum-themes__pagination-dots">{{ page }}</span>
                            </template>
                        </div>

                        <button
                            type="button"
                            @click="goToCommentsNextPage"
                            class="forum-themes__pagination-arrow"
                            :disabled="commentsPage === commentsTotalPages"
                            aria-label="Next page"
                        >
                            <img src="@/assets/images/arrow-next.svg" alt="next" class="forum-themes__pagination-arrow-icon" />
                        </button>
                    </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped lang='scss'>
.article {
    color: #FFF;
    word-break: break-word;
    padding-top: 50px;
    min-height: 100vh;

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
        padding: 90px 0;

        @media (max-width: 1024px) {
            padding: 0;
        }
    }

    &__container {
        max-width: 1400px;
        margin: 0 auto;
    }

    &__layout {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    &__top-layout {
        display: grid;
        grid-template-columns: clamp(150px, 14vw, 150px) minmax(0, 1fr) clamp(180px, 17vw, 300px);
        align-items: start;
        gap: 20px;
        padding-top: 1px;

        @media (max-width: 1200px) {
            grid-template-columns: 1fr;
        }
    }

    &__main {
        min-width: 0;
    }

    &__main-card {
        position: relative;
        padding: 20px;
        border-radius: 5px;
        background: rgba(250, 250, 250, 0.05);
        backdrop-filter: blur(64px);
        min-width: 0;
    }

    &__author {
        position: relative;
        top: 140px;
        padding: 16px 12px;
        border-radius: 5px;
        background: rgba(250, 250, 250, 0.05);
        backdrop-filter: blur(64px);
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 12px;
        position: sticky;
        align-self: start;
        @media (max-width: 1200px) {
            flex-direction: row;
            justify-content: flex-start;
            text-align: left;
            align-items: center;
            padding: 14px 16px;
            position: relative;
            top: auto;
        }
    }

    &__side-card {
        position: sticky;
        top: 140px;
        align-self: start;
        @media (max-width: 1200px) {
            display: none;
            position: static;
        }
    }

    &__comments {
        width: 100%;

        @media (max-width: 1200px) {
            width: 100%;
        }
    }

    &__corner {
        position: absolute;
        width: 10px;
        height: 10px;
        background-image: url('@/assets/images/profile-corner.svg');
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        z-index: 2;
        pointer-events: none;

        &--top-left {
            top: -1px;
            left: -1px;
            transform: rotate(0deg);
        }

        &--top-right {
            top: -1px;
            right: -1px;
            transform: rotate(90deg);
        }

        &--bottom-left {
            bottom: -1px;
            left: -1px;
            transform: rotate(-90deg);
        }

        &--bottom-right {
            bottom: -1px;
            right: -1px;
            transform: rotate(180deg);
        }
    }

    &__title {
        margin-bottom: 20px;
        font-weight: 400;
        font-size: 40px;
        line-height: 100%;
        letter-spacing: -0.07em;
        background: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.7);
    }

    &__content {
        font-family: "Candara", sans-serif;
        color: #f8f8f8;
        
        * {
            text-shadow: none !important;
            height: auto;
            max-width: 100%;
            color: inherit;
        }

        ::v-deep(a) {
            text-decoration-skip-ink: none;
            text-align: center;
            background: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        ::v-deep(:is(ul, ol)) {
            padding-left: 25px;
        }

        ::v-deep(img, figure, iframe, video) {
            margin: 0 0;
        }
    }

    &__quick-comment {
        width: 100%;
    }

    &__quick-comment-trigger {
        width: 100%;
        height: 42px;
        border-radius: 999px;
        backdrop-filter: blur(70px);
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #f8f8f8;
        opacity: 0.5;
        font-size: 16px;
        line-height: 1;
        text-align: left;
        padding: 12px 24px;
        cursor: pointer;
        transition: all .3s ease;

        &:hover {
            background: rgba(255, 255, 255, 0.12);
            border: 1px solid rgba(255, 255, 255, 0.12);
            opacity: 1;
        }
    }

    &__quick-comment-form {
        display: flex;
        flex-direction: column;
        gap: 10px;

        ::v-deep(.ck-editor) {
            width: 100% !important;
        }

        ::v-deep(.ck-editor__editable) {
            min-height: 170px;
        }
    }

    &__quick-comment-actions {
        display: flex;
        gap: 20px;
        align-items: center;
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

    @media (max-width: 1024px) {
        min-width: auto;
    }

    &__avatar {
        width: 75px;
        height: 75px;
        border-radius: 100%;
        overflow: hidden;
        
        @media (max-width: 1200px) {
            display: flex;
            align-items: center;
            justify-content: start;
            width: 45px;
            height: 45px;
        }

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }

    &__name-container {
        
        @media (max-width: 1200px) {
            flex-direction: column;
            align-items: flex-start !important;
        }
    }

    &__name {
        margin: 0;
    }

    &__position {
        margin: 0;
        margin-top: 5px;
        opacity: 0.8;
        font-size: 14px;
        line-height: 100%;
        letter-spacing: -0.04em;
        text-align: center;
        background: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.25);
    }
}

.comments {
    &__entry {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    &__item {
        display: grid;
        grid-template-columns: clamp(150px, 14vw, 150px) minmax(0, 1fr) clamp(180px, 17vw, 300px);
        align-items: stretch;
        gap: 20px;

        @media (max-width: 1200px) {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 12px;
        }
    }
    
    &__writer {
        position: relative;
        padding: 16px 12px;
        border-radius: 5px;
        background: rgba(250, 250, 250, 0.05);
        backdrop-filter: blur(64px);
        text-align: center;
        max-width: 150px;
        max-height: 168px;
        grid-column: 1;

        @media (max-width: 1200px) {
            max-width: 100%;
            flex-direction: row !important;
            justify-content: flex-start !important;
            text-align: left;
            padding: 14px 16px;
            max-height: 75px;
        }
    }
    
    &__text {
        font-family: "Candara", sans-serif;
        word-break: break-word;
        padding: 0;

        * {
            text-shadow: none !important;
            height: auto;
            max-width: 100%;
        }
    }

    &__body {
        position: relative;
        border-radius: 5px;
        background: rgba(250, 250, 250, 0.05);
        border: none;
        backdrop-filter: blur(64px);
        grid-column: 2;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 8px;
        padding: 20px;
    }

    &__reactions {
        width: 100%;
        margin-top: 0;

        @media (max-width: 1200px) {
            margin-left: 0;
        }
    }

    &__actions {
        display: flex;
        align-items: end;
        gap: 8px;

        @media (max-width: 768px) {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
        }
    }

    &__meta {
        margin-left: auto;
        display: flex;
        flex-direction: column;
        align-items: end;
        gap: 10px;

        @media (max-width: 1200px) {
            margin-left: 0;
            width: 100%;
            justify-content: space-between;
        }
    }

    &__meta-info {
        font-size: 12px;
        opacity: .5;
        white-space: nowrap;
    }

    &__meta-actions {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    &__icon-btn {
        width: 25px;
        height: 25px;
        border: none;
        border-radius: 8px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        background: none;

        img {
            width: 25px;
            height: 25px;
            display: block;
        }

        &:hover {
            transform: translateY(-1px);
        }
    }

    &__reply-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        border: none;
        border-radius: 30px;
        padding: 14px 15px;
        background: rgba(0, 0, 0, 0.4);
        color: #f8f8f8;
        cursor: pointer;
        transition: background .15s ease;
        font-size: 16px;
        line-height: 1;
        width: 100%;
        max-width: 120px;

        i {
            font-size: 15px;
            opacity: .9;
        }

        span {
            font-family: "Candara", sans-serif;
            font-size: 14px;
            line-height: 1;
            letter-spacing: -0.02em;
        }

        @media (hover: hover) and (pointer: fine) {
            &:hover {
                background: rgba(0, 0, 0, 0.55);
            }
        }
    }

    &__reply-form {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-left: calc(clamp(150px, 14vw, 150px) + 20px);
        width: calc(100% - (clamp(150px, 14vw, 150px) + 20px));
        max-width: 880px;

        @media (max-width: 1200px) {
            margin-left: 0;
            width: 100%;
        }

        ::v-deep(.ck-editor) {
            width: 100% !important;
            max-width: 100% !important;
        }

        ::v-deep(.ck-editor__editable) {
            min-height: 170px;
        }
    }

    &__reply-actions {
        display: flex;
        gap: 10px;
        align-items: center;
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

.forum-themes__pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 24px;
    padding: 0 40px;
    margin-top: 20px;

    @media (max-width: 768px) {
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding: 0 0 22px;
        gap: 16px;
        flex-wrap: wrap;
    }
}

.forum-themes__pagination-arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
    transition: opacity 0.2s ease;

    &:hover:not(:disabled) {
        opacity: 0.8;
    }

    &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
    }
}

.forum-themes__pagination-arrow-icon {
    width: 36px;
    height: 36px;

    @media (max-width: 768px) {
        width: 28px;
        height: 28px;
    }
}

.forum-themes__pagination-numbers {
    display: flex;
    align-items: baseline;
    gap: 20px;

    @media (max-width: 768px) {
        gap: 12px;
    }
}

.forum-themes__pagination-number {
    font-family: "Vollkorn", serif;
    background: transparent;
    border: none;
    color: #f8f8f8;
    cursor: pointer;
    transition: transform 0.2s ease, opacity 0.2s ease, color 0.2s ease;
    font-size: 20px;
    line-height: 1;
    padding: 0;
    opacity: 0.5;

    &.active {
        font-size: 30px;
        font-weight: 900;
        background: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        opacity: 1;
    }

    @media (max-width: 768px) {
        font-size: 16px;

        &.active {
            font-size: 24px;
        }
    }
}

.forum-themes__pagination-dots {
    color: #f8f8f8;
    font-size: 20px;

    @media (max-width: 768px) {
        font-size: 16px;
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