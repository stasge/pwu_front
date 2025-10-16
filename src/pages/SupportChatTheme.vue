<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue';
import { fetchPost } from '@/utils/fetchApi';
import type { Message } from '@/models/theme';
import { required } from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';
import { format } from 'date-fns';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { ClassicEditor, Bold, Essentials, Italic, Mention, Paragraph, Undo, Heading, List, Alignment, MediaEmbed, Image, ImageUpload, Base64UploadAdapter, Link, ImageResize, ImageStyle, ImageToolbar } from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';


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
const theme = ref<Message | null>(null)

interface Form {
    name: string;
    text: string;
}

const editorConfig = {
    plugins: [Bold, Essentials, Italic, Mention, Paragraph, Undo, Heading, List, Alignment, MediaEmbed, Image, ImageUpload, Base64UploadAdapter, Link, ImageResize, ImageStyle, ImageToolbar],
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

</script>
<template>
    <div class="chat-support-theme">
        <div class="chat-support-theme__inner">
            <div class="chat-support-theme__container">
                <h1 class="chat-support-theme__title">Повідомлення</h1>
                <div class="chat-support-theme__messages messages" @scroll="handleScroll" ref="messagesContainer"
                    style="max-height: 55vh; overflow-y: auto;">
                    <div v-if="messages.length" class="messages__item item" v-for="message in messages"
                        :key="message.id" :class="{ 'flex-row-reverse': message.is_admin }">
                        <div class="item__avatar flex align-items-center justify-content-center">
                            <svg v-if="!message.user?.avatar" class="writer__avatar" width="30" height="30"
                                viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M25 24.9997C29.6023 24.9997 33.3333 21.2687 33.3333 16.6663C33.3333 12.064 29.6023 8.33301 25 8.33301C20.3976 8.33301 16.6666 12.064 16.6666 16.6663C16.6666 21.2687 20.3976 24.9997 25 24.9997Z"
                                    fill="#e26f0f" />
                                <path
                                    d="M41.6667 39.583V41.6663C41.6667 42.2189 41.4472 42.7488 41.0565 43.1395C40.6658 43.5302 40.1359 43.7497 39.5834 43.7497H10.4167C9.86417 43.7497 9.33427 43.5302 8.94357 43.1395C8.55287 42.7488 8.33337 42.2189 8.33337 41.6663V39.583C8.33337 36.2678 9.65033 33.0884 11.9945 30.7442C14.3387 28.4 17.5182 27.083 20.8334 27.083H29.1667C32.4819 27.083 35.6613 28.4 38.0055 30.7442C40.3497 33.0884 41.6667 36.2678 41.6667 39.583Z"
                                    fill="#e26f0f" />
                            </svg>
                            <img v-else :src="filesBase + message.user.avatar" alt="Avatar" />
                        </div>
                        <div class="item__content">
                            <div class="item__header">
                                <span class="item__username">{{ message.user.username }}</span>
                                <span class="item__date">{{ format(new Date(message.created_at), 'dd.MM.yyyy HH:mm')
                                }}</span>
                            </div>
                            <div>
                                <svg class="item__romb" :class="{ 'reverced': message.is_admin }" width="20" height="26"
                                    viewBox="0 0 36 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M0.5 12.9999C13.9644 9.31125 21.6304 7.03946 35.5 0.5L35.5 25.1913C19.7721 16.4417 12.593 14.7101 0.5 12.9999Z"
                                        fill="white" />
                                </svg>
                                <p class="item__text" v-html="message.text" @click="(e) => {
                                    const t = e.target as HTMLElement;
                                    if (t && t.tagName === 'IMG') {
                                        openImageFullscreen((t as HTMLImageElement).src);
                                    }
                                }"></p>
                            </div>
                        </div>
                    </div>
                    <div v-else>
                        <div class="text-center my-3 text-white">
                            <span>Немає повідомлень</span>
                        </div>
                    </div>
                    <div v-if="isLoading" class="text-center text-white my-2">
                        <span>Завантаження...</span>
                    </div>
                </div>
                <div v-if="userStore.user" class="comments__textarea mt-5">
                    <form @submit.prevent="sendMessage">
                        <div class="relative">
                            <ckeditor v-model="form.text" :editor="ClassicEditor" :config="editorConfig" />
                            <!-- <button @click.prevent="toggleEmojiPicker" class="emoji-button">😊</button> -->
                            <!-- <EmojiPicker @onEmojiPicker="addEmoji" :showEmojiPicker="showEmojiPicker"
                                class="emoji" /> -->
                        </div>
                        <button class="btn btn-sm mt-2">Відправити</button>
                    </form>
                </div>
            </div>
        </div>

    </div>
    <div v-if="fullscreenImage" id="fullscreen-image-modal" class="fullscreen-image-modal"
        @click.self="closeImageFullscreen">
        <img :src="fullscreenImage" alt="image" />
        <button class="close-btn" @click="closeImageFullscreen">×</button>
    </div>
</template>
<style scoped lang="scss">
.chat-support-theme {
    width: 100%;
    color: #fff;

    :deep(a) {
        color: #e26f0f !important;
        text-decoration: underline;
    }

    &__title {
        font-weight: bold;
        color: #fff;
        text-align: center;
        margin-bottom: 10px;
    }

    .messages {
        font-family: "Candara", sans-serif;
        color: black;
        display: flex;
        flex-direction: column;
        gap: 10px;
        background-color: rgba(93, 119, 144, 0.1);
        border-radius: 20px;
        padding: 20px;
        margin-top: 20px;

        @media (max-width: 768px) {
            padding: 10px;
        }

        scrollbar-width: thin;
        scrollbar-color: #e26f0f rgba(93, 119, 144, 0.1);

        &::-webkit-scrollbar {
            width: 8px;
            background: rgba(93, 119, 144, 0.1);
            border-radius: 8px;
        }

        &::-webkit-scrollbar-thumb {
            background: #e26f0f;
            border-radius: 8px;
        }

        &::-webkit-scrollbar-thumb:hover {
            background: #ff9800;
        }
    }

    .item {
        display: flex;
        gap: 30px;

        @media (max-width: 768px) {
            gap: 20px;
        }


        &__avatar {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            overflow: hidden;
            background-color: rgba(93, 119, 144, 0.2);

            @media (max-width: 768px) {
                width: 35px;
                height: 35px;
            }

            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
        }

        &__content {
            background: #fff;
            padding: 10px;
            border-radius: 10px;
            max-width: 80%;
            position: relative;

            * {
                max-width: 100%;
                height: auto;
            }

            ::v-deep(:is(ol, ul)) {
                margin: 0;
                padding-left: 15px;
            }

            ::v-deep(img) {
                cursor: zoom-in;
            }

            @media (max-width: 768px) {
                padding: 6px;
            }

        }

        &__header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            gap: 20px;

        }

        &__username {
            font-weight: bold;
            color: #333;
        }

        &__date {
            font-size: 0.8rem;

        }

        &__text {
            font-size: 0.9rem;
            color: #333;
            word-break: break-all;
            overflow-wrap: anywhere;
            max-width: 100%;
        }

        &__romb {
            position: absolute;
            top: 0;
            left: -16px;

            &.reverced {
                left: auto;
                right: -16px;
                transform: rotate(180deg);
            }
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

    ::v-deep(.ck-editor) {
        width: clamp(300px, 70vw, 887px) !important;

        @media (min-width: 1080px) {
            width: 100% !important;
        }

        @media (max-width: 768px) {
            width: 90vw !important;
        }
    }

    ::v-deep(.ck-editor__editable_inline) {
        word-break: break-word;
        min-height: 200px;
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
    transition: background 0.2s;

    img {
        width: auto;
        max-width: 95vw;
        max-height: 90vh;
        border-radius: 10px;
        box-shadow: 0 0 20px #000a;
        background: #fff;
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
        z-index: 10001;
        transition: color 0.2s;
    }

    .close-btn:hover {
        color: #e26f0f;
    }
}
</style>