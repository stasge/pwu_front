<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue';
import { fetchPost } from '@/utils/fetchApi';
import type { Message } from '@/models/theme';
import { required } from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';
import { format } from 'date-fns';
import { useRoute } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import Textarea from 'primevue/textarea';
import EmojiPicker from '@/components/EmojiPicker.vue';
import type { Emoji } from '@/models/emoji';


const userStore = useUserStore()
const route = useRoute()
const filesBase = import.meta.env.VITE_FILES_URL
const showEmojiPicker = ref(false)

const messages = ref<Message[]>([])
const page = ref(1)
const limit = ref(10)
const total = ref(0)
const isLoading = ref(false)

interface Form {
    name: string;
    text: string;
}

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
    const { data: messagesData } = await fetchPost('/support/getMessages', { page: page.value, limit: limit.value, id_theme: route.params.theme_id });
    
    if (reload) {
        page.value = 1;
        messages.value = messagesData.messages.reverse();
        total.value = messagesData.total || 0;
        markAsRead(messagesData.messages.map((message: Message) => message.id));
        nextTick(() => scrollToBottom());
    } else {
        // Додаємо старі повідомлення на початок
        messages.value = [...messagesData.messages, ...messages.value];
        total.value = messagesData.total || 0;
        markAsRead(messagesData.messages.map((message: Message) => message.id));
        nextTick(() => {
            if (messagesContainer.value) {
                messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight - prevHeight + prevScroll;
            }
        });
    }
    isLoading.value = false;
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

const toggleEmojiPicker = () => {
    showEmojiPicker.value = !showEmojiPicker.value
}

const addEmoji = (emoji: Emoji) => {
    form.text = form.text + emoji.i
}

</script>
<template>
    <div class="chat-support-theme">
        <div class="chat-support-theme__inner">
            <div class="chat-support-theme__container">
                <h1 class="chat-support-theme__title">Повідомлення</h1>
                <div
                    class="chat-support-theme__messages messages"
                    @scroll="handleScroll"
                    ref="messagesContainer"
                    style="max-height: 55vh; overflow-y: auto;"
                >
                    <div 
                        v-if="messages.length"
                        class="messages__item item" 
                        v-for="message in messages" 
                        :key="message.id"
                        :class="{ 'flex-row-reverse': message.is_admin }"
                    >
                        <div class="item__avatar flex align-items-center justify-content-center">
                            <svg v-if="!message.user?.avatar" class="writer__avatar" width="30" height="30" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M25 24.9997C29.6023 24.9997 33.3333 21.2687 33.3333 16.6663C33.3333 12.064 29.6023 8.33301 25 8.33301C20.3976 8.33301 16.6666 12.064 16.6666 16.6663C16.6666 21.2687 20.3976 24.9997 25 24.9997Z" fill="#e26f0f"/>
                                <path d="M41.6667 39.583V41.6663C41.6667 42.2189 41.4472 42.7488 41.0565 43.1395C40.6658 43.5302 40.1359 43.7497 39.5834 43.7497H10.4167C9.86417 43.7497 9.33427 43.5302 8.94357 43.1395C8.55287 42.7488 8.33337 42.2189 8.33337 41.6663V39.583C8.33337 36.2678 9.65033 33.0884 11.9945 30.7442C14.3387 28.4 17.5182 27.083 20.8334 27.083H29.1667C32.4819 27.083 35.6613 28.4 38.0055 30.7442C40.3497 33.0884 41.6667 36.2678 41.6667 39.583Z" fill="#e26f0f"/>
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
                                <p class="item__text">{{ message.text }}</p>
                            </div>
                        </div>
                    </div>
                    <div v-else>
                        <div class="text-center my-3 text-white">
                            <span>Немає повідомлень</span>
                        </div>
                    </div>
                    <div v-if="isLoading" class="text-center my-2">
                        <span>Завантаження...</span>
                    </div>
                </div>
                <div v-if="userStore.user" class="comments__textarea mt-5">
                    <form @submit.prevent="sendMessage">
                        <div class="relative">
                            <Textarea v-model="form.text" rows="5" class="w-full" />
                            <button @click.prevent="toggleEmojiPicker" class="emoji-button">😊</button>
                            <EmojiPicker @onEmojiPicker="addEmoji" :showEmojiPicker="showEmojiPicker"
                                class="emoji" />
                        </div>
                        <button class="btn btn-sm mt-2">Відправити</button>
                    </form>
                </div>
            </div>
        </div>

    </div>
</template>
<style scoped lang="scss">
.chat-support-theme {
    width: 100%;
    color: #fff;

    &__title {
        font-weight: bold;
        color: #fff;
        text-align: center;
        margin-bottom: 10px;
    }

    .messages {
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
}
</style>