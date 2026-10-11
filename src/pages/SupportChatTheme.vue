<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { fetchPost, fetchPut, fetchDelete } from '@/utils/fetchApi';
import type { Message, Theme } from '@/models/theme';
import { required } from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';
import { formatKyivDateTime } from '@/utils/dateUtils';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { ClassicEditor } from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';
import { createEditorConfig } from '@/utils/ckeditorConfig';
import Corners from '@/components/base/Corners.vue';


const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const filesBase = import.meta.env.VITE_FILES_URL
const showEmojiPicker = ref(false)

const messages = ref<Message[]>([])
const page = ref(1)
const limit = ref(10)
const total = ref(0)
const isLoading = ref(false)
const theme = ref<Theme | null>(null)
// state === 1 — тема закрита, доступний лише перегляд
const isClosed = computed(() => !!theme.value?.state)
const editingMessageId = ref<number | string | null>(null)
const editingText = ref('')
const editingEditor = ref<any>(null)

interface Form {
    name: string;
    text: string;
}

const editorConfig = createEditorConfig();
const updateEditorConfig = createEditorConfig(['heading', 'bold', 'italic']);

const form = reactive<Form>({
    text: '',
    name: '',
})

const rules = {
    text: { required },
}

const v$ = useVuelidate(rules, form, { $stopPropagation: true })

const getMessages = async (reload = false) => {
    if (isLoading.value) return;
    isLoading.value = true;
    const prevHeight = messagesContainer.value ? messagesContainer.value.scrollHeight : 0;
    const prevScroll = messagesContainer.value ? messagesContainer.value.scrollTop : 0;
    if (reload) {
        page.value = 1;
    }
    
    try {
        // Отримати тему по id
        const { data } = await fetchPost('/support/getTheme', { id_theme: route.params.theme_id });
        theme.value = data?.theme || null;

        const { data: messagesData } = await fetchPost('/support/getMessages', { page: page.value, limit: limit.value, id_theme: route.params.theme_id });

        let loadedMessages = reload ? messagesData.messages.reverse() : [...messagesData.messages, ...messages.value];
        // Додаємо theme.text як перше повідомлення лише при reload і якщо theme існує
        if (reload && theme.value && theme.value.text) {
            loadedMessages = [
                {
                    id: 'theme-text',
                    text: theme.value.text,
                    created_at: theme.value.created_at,
                    user: theme.value.user ? { username: theme.value.user.username, avatar: theme.value.user.avatar || null } : { username: 'Тема', avatar: null },
                    is_admin: false,
                    // ...інші поля за потреби
                },
                ...loadedMessages
            ];
        }
        if (reload) {
            page.value = 1;
            messages.value = loadedMessages;
            total.value = messagesData.total || 0;
            markAsRead(messagesData.messages.map((message: Message) => message.id));
            nextTick(() => scrollToBottom());
        } else {
            messages.value = loadedMessages;
            total.value = messagesData.total || 0;
            markAsRead(messagesData.messages.map((message: Message) => message.id));
            nextTick(() => {
                if (messagesContainer.value) {
                    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight - prevHeight + prevScroll;
                }
            });
        }
    } catch (error: any) {
        // Перевіряємо чи це помилка 404 з повідомленням "Theme not found"
        if (error?.status === 404 && error?.data?.msg === 'Theme not found') {
            router.push({ name: 'support-chat' });
            return;
        }
    } finally {
        isLoading.value = false;
    }
};

const messagesContainer = ref<HTMLElement | null>(null);

const handleScroll = (e: Event) => {
    const el = e.target as HTMLElement;
    // Якщо скрол зверху і є ще повідомлення
    if (el.scrollTop <= 10 && messages.value.length < total.value && !isLoading.value) {
        page.value += 1;
        getMessages();
    }
};

const scrollToBottom = () => {
    if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
};

onMounted(() => {
    getMessages(true);
    nextTick(() => scrollToBottom());
});

const sendMessage = async () => {
    if (isClosed.value) return
    if (!await v$.value.$validate()) {
        return
    }
    await fetchPost('/support/addMessage', { ...form, id_theme: route.params.theme_id })
    form.text = ''
    await getMessages(true)
    nextTick(() => scrollToBottom())
}

const markAsRead = async (ids: number[]) => {
    if (!ids.length) return
    await fetchPost('/support/addView', { ids })
    userStore.getUnreadCount()
}


const fullscreenImage = ref<string | null>(null);

const openImageFullscreen = (src: string) => {
    fullscreenImage.value = src;
    // Спроба використати Fullscreen API (опціонально)
    nextTick(() => {
        const el = document.getElementById('fullscreen-image-modal');
        if (el && el.requestFullscreen) {
            el.requestFullscreen();
        }
    });
};
const closeImageFullscreen = () => {
    fullscreenImage.value = null;
    if (document.fullscreenElement) {
        document.exitFullscreen();
    }
};

const canEditMessage = (message: Message) => {
    if (!userStore.user || isClosed.value) return false;
    // Не можна редагувати перше повідомлення (текст теми)
    if (typeof message.id === 'string' && message.id === 'theme-text') return false;
    // Кожен може редагувати тільки свої повідомлення
    return message.user_id === userStore.user.id;
};

const canDeleteMessage = (message: Message) => {
    if (!userStore.user || isClosed.value) return false;
    // Не можна видаляти перше повідомлення (текст теми)
    if (typeof message.id === 'string' && message.id === 'theme-text') return false;
    // Кожен може видаляти тільки свої повідомлення
    return message.user_id === userStore.user.id;
};

const startEditing = (message: Message) => {
    editingMessageId.value = message.id;
    editingText.value = message.text;
    nextTick(() => {
        if (editingEditor.value) {
            editingEditor.value.setData(message.text);
        }
    });
};

const cancelEditing = () => {
    editingMessageId.value = null;
    editingText.value = '';
    if (editingEditor.value) {
        editingEditor.value.setData('');
    }
};

const saveEdit = async () => {
    if (!editingMessageId.value) {
        return;
    }
    const textToSave = editingEditor.value ? editingEditor.value.getData() : editingText.value;
    if (!textToSave.trim()) {
        return;
    }
    try {
        await fetchPut('/support/updateMessage', {
            id: editingMessageId.value,
            text: textToSave
        });
        cancelEditing();
        await getMessages(true);
    } catch (error) {
        console.error('Помилка при оновленні повідомлення:', error);
    }
};

const deleteMessage = async (messageId: number) => {
    try {
        await fetchDelete('/support/deleteMessage', { id: messageId });
        // Видаляємо повідомлення з локального стану
        messages.value = messages.value.filter(m => m.id !== messageId);
        total.value = Math.max(0, total.value - 1);
    } catch (error) {
        console.error('Помилка при видаленні повідомлення:', error);
    }
};

// Перше повідомлення — текст самої теми
const isTopic = (message: Message) => (message.id as number | string) === 'theme-text';

</script>
<template>
    <div class="ticket">
        <router-link :to="{ name: 'support-chat' }" class="ticket__back">
            <i class="pi pi-arrow-left"></i>
            <span>До всіх тем</span>
        </router-link>

        <div class="ticket__header">
            <h1 class="ticket__title">{{ theme?.name || 'Повідомлення' }}</h1>
            <span v-if="theme" class="ticket__badge" :class="{ 'ticket__badge--closed': isClosed }">
                <i v-if="isClosed" class="pi pi-lock"></i>
                {{ isClosed ? 'Закрита' : 'Відкрита' }}
            </span>
        </div>

        <div class="ticket__panel">
            <Corners />
            <div class="ticket__messages custom-scroll" @scroll="handleScroll" ref="messagesContainer">
                <div v-if="isLoading" class="ticket__state">Завантаження...</div>

                <div v-for="message in messages" :key="message.id" class="msg"
                    :class="{ 'msg--admin': message.is_admin, 'msg--topic': isTopic(message) }">
                    <div class="msg__avatar">
                        <img v-if="message.user?.avatar" :src="filesBase + message.user.avatar" alt="Avatar" />
                        <svg v-else width="26" height="26" viewBox="0 0 50 50" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M25 24.9997C29.6023 24.9997 33.3333 21.2687 33.3333 16.6663C33.3333 12.064 29.6023 8.33301 25 8.33301C20.3976 8.33301 16.6666 12.064 16.6666 16.6663C16.6666 21.2687 20.3976 24.9997 25 24.9997Z"
                                fill="currentColor" />
                            <path
                                d="M41.6667 39.583V41.6663C41.6667 42.2189 41.4472 42.7488 41.0565 43.1395C40.6658 43.5302 40.1359 43.7497 39.5834 43.7497H10.4167C9.86417 43.7497 9.33427 43.5302 8.94357 43.1395C8.55287 42.7488 8.33337 42.2189 8.33337 41.6663V39.583C8.33337 36.2678 9.65033 33.0884 11.9945 30.7442C14.3387 28.4 17.5182 27.083 20.8334 27.083H29.1667C32.4819 27.083 35.6613 28.4 38.0055 30.7442C40.3497 33.0884 41.6667 36.2678 41.6667 39.583Z"
                                fill="currentColor" />
                        </svg>
                    </div>
                    <div class="msg__bubble">
                        <div class="msg__header">
                            <div class="msg__author">
                                <span class="msg__username">{{ message.user.username }}</span>
                                <span v-if="message.is_admin" class="msg__role">Адміністрація</span>
                                <span v-if="isTopic(message)" class="msg__role msg__role--topic">Тема</span>
                            </div>
                            <div class="msg__header-right">
                                <span class="msg__date">{{ formatKyivDateTime(message.created_at) }}</span>
                                <div v-if="canEditMessage(message) || canDeleteMessage(message)" class="msg__actions">
                                    <button v-if="canEditMessage(message)" type="button" class="msg__action"
                                        :disabled="editingMessageId !== null && editingMessageId !== message.id"
                                        title="Редагувати" @click="startEditing(message)">
                                        <i class="pi pi-pencil"></i>
                                    </button>
                                    <button v-if="canDeleteMessage(message)" type="button"
                                        class="msg__action msg__action--delete" :disabled="editingMessageId !== null"
                                        title="Видалити" @click="deleteMessage(message.id)">
                                        <i class="pi pi-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div v-if="editingMessageId === message.id" class="msg__edit">
                            <ckeditor v-model="editingText" :editor="ClassicEditor" :config="updateEditorConfig"
                                @ready="(editor: any) => {
                                    editingEditor = editor;
                                    editor.setData(message.text);
                                }" />
                            <div class="msg__edit-actions">
                                <button type="button" class="fantasy-btn small thin msg__save" @click="saveEdit">
                                    <span>Зберегти</span>
                                </button>
                                <button type="button" class="ticket__link-btn" @click="cancelEditing">Скасувати</button>
                            </div>
                        </div>
                        <div v-else class="msg__text" v-html="message.text" @click="(e) => {
                            const t = e.target as HTMLElement;
                            if (t && t.tagName === 'IMG') {
                                openImageFullscreen((t as HTMLImageElement).src);
                            }
                        }"></div>
                    </div>
                </div>

                <div v-if="!messages.length && !isLoading" class="ticket__state">Немає повідомлень</div>
            </div>
        </div>

        <div v-if="isClosed" class="ticket__closed">
            <i class="pi pi-lock"></i>
            <div>
                <p class="ticket__closed-title">Тема закрита</p>
                <p class="ticket__closed-text">Писати нові повідомлення неможливо — доступний лише перегляд.</p>
            </div>
        </div>

        <form v-else-if="userStore.user" class="ticket__reply" @submit.prevent="sendMessage">
            <Corners />
            <h2 class="ticket__reply-title">Ваша відповідь</h2>
            <ckeditor v-model="form.text" :editor="ClassicEditor" :config="editorConfig" />
            <button type="submit" class="fantasy-btn small ticket__send">
                <span>Відправити</span>
            </button>
        </form>
    </div>

    <div v-if="fullscreenImage" id="fullscreen-image-modal" class="fullscreen-image-modal"
        @click.self="closeImageFullscreen">
        <img :src="fullscreenImage" alt="image" />
        <button class="close-btn" @click="closeImageFullscreen">×</button>
    </div>
</template>
<style scoped lang="scss">
$gold-gradient: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%);

.ticket {
    width: 100%;
    max-width: 1110px;
    color: #f8f8f8;

    &__back {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: rgba(248, 248, 248, 0.6);
        font-size: 16px;
        transition: color 0.2s ease;

        i {
            font-size: 13px;
        }

        &:hover {
            color: #fadfae;
        }
    }

    &__header {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px 16px;
        margin-top: 12px;
    }

    &__title {
        margin: 0;
        min-width: 0;
        font-size: clamp(28px, 3vw, 48px);
        font-weight: 400;
        line-height: 1.1;
        letter-spacing: -0.05em;
        overflow-wrap: anywhere;
        background: $gold-gradient;
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    &__badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 12px;
        border-radius: 20px;
        background: rgba(17, 175, 25, 0.15);
        color: #7ee083;
        font-family: "Candara", sans-serif;
        font-size: 14px;

        i {
            font-size: 12px;
        }

        &--closed {
            background: rgba(214, 40, 40, 0.2);
            color: #ff8a8a;
        }
    }

    &__panel {
        position: relative;
        margin-top: 24px;
        padding: 10px;
        border-radius: 5px;
        background: rgba(26, 26, 26, 0.95);
    }

    &__messages {
        display: flex;
        flex-direction: column;
        gap: 18px;
        max-height: 60vh;
        overflow-y: auto;
        padding: 20px 20px 20px 10px;

        @media (max-width: 767px) {
            padding: 10px 6px 10px 0;
            gap: 14px;
        }
    }

    &__state {
        padding: 20px;
        text-align: center;
        color: rgba(248, 248, 248, 0.5);
        font-size: 16px;
    }

    &__closed {
        position: relative;
        display: flex;
        align-items: center;
        gap: 16px;
        margin-top: 20px;
        padding: 20px 30px;
        border-radius: 5px;
        border-left: 3px solid #d62828;
        background: rgba(214, 40, 40, 0.1);

        > i {
            font-size: 24px;
            color: #ff8a8a;
        }

        p {
            margin: 0;
        }
    }

    &__closed-title {
        font-size: 20px;
        color: #ff8a8a;
    }

    &__closed-text {
        margin-top: 4px !important;
        font-family: "Candara", sans-serif;
        font-size: 15px;
        color: rgba(248, 248, 248, 0.7);
    }

    &__reply {
        position: relative;
        display: flex;
        flex-direction: column;
        margin-top: 20px;
        padding: clamp(20px, 3vw, 30px);
        border-radius: 5px;
        background: rgba(250, 250, 250, 0.05);

        :deep(.ck-editor) {
            width: 100% !important;
        }

        :deep(.ck-editor__editable_inline) {
            min-height: 160px;
            word-break: break-word;
        }

        :deep(.ck-content) {
            min-height: 160px;
        }
    }

    &__reply-title {
        margin: 0 0 16px;
        font-size: 22px;
        font-weight: 400;
        letter-spacing: -0.03em;
    }

    &__send {
        align-self: flex-end;
        margin: 20px 20px 0;
        padding-left: 20px !important;
        padding-right: 20px !important;
    }

    &__link-btn {
        padding: 0;
        border: none;
        border-bottom: 1px solid rgba(248, 248, 248, 0.5);
        background: none;
        color: rgba(248, 248, 248, 0.7);
        font-family: "VollkornSC", sans-serif;
        font-size: 15px;
        line-height: 1.1;
        transition: opacity 0.2s ease;

        &:hover {
            opacity: 0.7;
        }
    }
}

.msg {
    display: flex;
    align-items: flex-start;
    gap: 14px;

    @media (max-width: 767px) {
        gap: 8px;
    }

    &--admin {
        flex-direction: row-reverse;

        .msg__bubble {
            background: rgba(226, 111, 15, 0.12);
            border-color: rgba(226, 111, 15, 0.35);
        }

        .msg__avatar {
            color: #e26f0f;
            border-color: rgba(226, 111, 15, 0.5);
        }
    }

    &--topic .msg__bubble {
        max-width: 100%;
        background: rgba(250, 250, 250, 0.08);
        border-color: rgba(250, 223, 174, 0.3);
    }

    &__avatar {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: 44px;
        height: 44px;
        border: 1px solid rgba(248, 248, 248, 0.15);
        border-radius: 50%;
        overflow: hidden;
        background: rgba(0, 0, 0, 0.4);
        color: rgba(248, 248, 248, 0.5);

        @media (max-width: 767px) {
            width: 34px;
            height: 34px;
        }

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }

    &__bubble {
        min-width: 0;
        max-width: 80%;
        padding: 12px 16px;
        border: 1px solid rgba(248, 248, 248, 0.08);
        border-radius: 5px;
        background: rgba(250, 250, 250, 0.05);

        @media (max-width: 767px) {
            max-width: calc(100% - 42px);
            padding: 10px 12px;
        }
    }

    &__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 4px 20px;
        margin-bottom: 8px;
    }

    &__author {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
    }

    &__username {
        font-size: 16px;
        color: #fadfae;
        overflow-wrap: anywhere;
    }

    &__role {
        padding: 1px 8px;
        border-radius: 10px;
        background: rgba(226, 111, 15, 0.25);
        color: #fbd298;
        font-family: "Candara", sans-serif;
        font-size: 12px;

        &--topic {
            background: rgba(248, 248, 248, 0.1);
            color: rgba(248, 248, 248, 0.7);
        }
    }

    &__header-right {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-left: auto;
    }

    &__date {
        font-family: "Candara", sans-serif;
        font-size: 13px;
        color: rgba(248, 248, 248, 0.4);
    }

    &__actions {
        display: flex;
        gap: 2px;
    }

    &__action {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 26px;
        height: 26px;
        padding: 0;
        border: none;
        border-radius: 3px;
        background: none;
        color: rgba(248, 248, 248, 0.5);
        font-size: 13px;
        transition: color 0.2s ease, background-color 0.2s ease;

        &:hover:not(:disabled) {
            color: #fadfae;
            background: rgba(226, 111, 15, 0.15);
        }

        &--delete:hover:not(:disabled) {
            color: #ff8a8a;
            background: rgba(214, 40, 40, 0.15);
        }

        &:disabled {
            opacity: 0.3;
            cursor: not-allowed;
        }
    }

    &__text {
        font-family: "Candara", sans-serif;
        font-size: 15px;
        line-height: 1.45;
        color: rgba(248, 248, 248, 0.9);
        overflow-wrap: anywhere;

        :deep(p) {
            margin: 0 0 6px;

            &:last-child {
                margin-bottom: 0;
            }
        }

        :deep(:is(ol, ul)) {
            margin: 0 0 6px;
            padding-left: 20px;
        }

        :deep(img) {
            max-width: 100%;
            height: auto;
            border-radius: 3px;
            cursor: zoom-in;
        }

        :deep(a) {
            color: #e26f0f;
            text-decoration: underline;
        }
    }

    &__edit {
        :deep(.ck-editor) {
            width: 100% !important;
        }

        :deep(.ck-editor__editable_inline),
        :deep(.ck-content) {
            min-height: 140px;
        }
    }

    &__edit-actions {
        display: flex;
        align-items: center;
        gap: 30px;
        margin-top: 12px;
        padding-left: 14px;
    }

    &__save {
        padding: 0 12px !important;
    }
}

.fullscreen-image-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    cursor: zoom-out;

    img {
        width: auto;
        max-width: 95vw;
        max-height: 90vh;
        border-radius: 5px;
        box-shadow: 0 0 20px #000a;
        cursor: default;
    }

    .close-btn {
        position: absolute;
        top: 30px;
        right: 40px;
        font-size: 2.5rem;
        color: #fff;
        background: none;
        border: none;
        cursor: pointer;
        transition: color 0.2s;

        &:hover {
            color: #e26f0f;
        }
    }
}
</style>
