<script setup lang="ts">
import Button from 'primevue/button';
import { useAsyncCallWrapper } from '@/composables/useAsyncCallWrapper';
import { ref, onMounted, watch } from 'vue';
import { fetchPost } from '@/utils/fetchApi';
import type { Theme } from '@/models/theme';
import CreateTheme from '@/components/modals/CreateTheme.vue';
import { format } from 'date-fns';
import SelectButton from 'primevue/selectbutton';
import { truncateText } from '@/utils/text';
import ToggleSwitch from 'primevue/toggleswitch';
import { useUserStore } from '@/stores/userStore';
import Paginator from 'primevue/paginator';
import { useRoute, useRouter } from 'vue-router';

const { wrapAsyncCall } = useAsyncCallWrapper()
const createThemeRef = ref()
const userStore = useUserStore()
const route = useRoute();
const router = useRouter();

const themes = ref<Theme[]>([])
const state = ref<null | number>(null)
const limit = ref(10)
const total = ref(0)
const page = ref(1)

const stateOptions = [
    { label: 'Всі', value: null },
    { label: 'Відкриті', value: 0 },
    { label: 'Закриті', value: 1 },
];

const syncQueryWithPagination = () => {
    router.replace({
        query: {
            ...route.query,
            page: page.value,
            limit: limit.value,
            state: state.value !== null ? state.value : undefined,
        },
    });
};

const getThemes = async (stateParam: null | number = null) => {
    const params: any = {
        limit: limit.value,
        page: page.value,
    };
    if (stateParam != null) {
        params.state = stateParam;
    }
    const { data: themesData } = await fetchPost('/support/getThemes', params);
    themes.value = themesData.themes;
    total.value = themesData.total;
    syncQueryWithPagination();
};

const toggleSingleState = async (id: number, state: number) => {
    const params = {
        id,
        state: state ? 1 : 0
    }
    wrapAsyncCall(async () => {
        await fetchPost('/support/state', params)
        getThemes()
    })
}

const onPageChange = (event: any) => {
    page.value = event.page + 1
    limit.value = event.rows
    getThemes(state.value)
}

onMounted(() => {
    // Встановлюємо значення з query при завантаженні
    if (route.query.page) page.value = +route.query.page;
    if (route.query.limit) limit.value = +route.query.limit;
    if (route.query.state != undefined) {
        state.value = route.query.state === 'null' ? null : +route.query.state;
    }
    wrapAsyncCall(async () => {
        getThemes(state.value);
    });
});

watch([state, page, limit], ([newState]) => {
    getThemes(newState);
});
</script>
<template>
    <div class="chat-support">
        <div class="chat-support__inner">
            <div class="chat-support__container">
                <h1 class="chat-support__title">Підтримка</h1>
                <div class="flex align-items-center justify-content-between gap-2">
                    <Button label="Створити нову тему" icon="pi pi-plus" @click="createThemeRef.showDia()"
                        class="success" />
                    <div class="mb-3 flex justify-content-center">
                        <SelectButton v-model="state" :options="stateOptions" optionLabel="label" optionValue="value"
                            class="state-select" />
                    </div>
                </div>
                <div class="chat-support__themes">
                    <router-link 
                        v-if="themes.length" 
                        v-for="theme in themes" 
                        :key="theme.id"
                        :to="{ name: 'support-chat-theme', params: { theme_id: theme.id } }"
                    >
                        <div class="theme chat-support__theme" :class="{ active: !theme.state }">
                            <div class="flex align-items-center justify-content-between gap-2">
                                <h2 class="theme__title">{{ theme.name }}</h2>
                                <div class="theme__messages flex align-items-center gap-1 relative">
                                    <span class="text-xl">{{ theme.is_unread }}</span>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M4.99995 23.2H3.74995L4.49995 22.15C5.04995 21.35 5.44995 20.4 5.64995 19.15C2.09995 17.55 0.199951 14.5501 0.199951 10.6001C0.199951 4.55005 4.74996 0.800049 12.1 0.800049C19.45 0.800049 24 4.55005 24 10.6001C24 16.7001 19.55 20.4 12.1 20.4C11.95 20.4 11.75 20.4 11.6 20.4C10.4 21.7 8.39995 23.2 4.99995 23.2ZM12 2.10005C5.34995 2.10005 1.39995 5.25005 1.39995 10.6001C1.39995 15.1501 4.19995 17.2 6.49995 18.15L6.94995 18.3501L6.89995 18.8501C6.74995 20.0001 6.49996 21.0001 6.09996 21.8501C8.49996 21.5501 9.89995 20.3501 10.6499 19.3501L10.85 19.1001H11.3C11.5 19.1001 11.75 19.1001 11.95 19.1001C21.5 19.1001 22.55 13.1501 22.55 10.6001C22.6 5.30005 18.65 2.10005 12 2.10005Z"
                                            fill="#fff" />
                                    </svg>
                                    <div v-if="theme.is_unread" class="unread-indicator"></div>
                                </div>
                            </div>
                            <div class="flex gap-2 mt-2">
                                <span class="text-sm">Створено: </span>
                                <span class="text-sm font-bold">{{ theme.user.username }}</span>
                                <span class="text-sm ml-auto">Всього повідомлень: {{ theme.messages_count }}</span>
                            </div>
                            <div class="flex flex-column gap-2 mt-2">
                                <span>Текст:</span>
                                <div class="theme__text" v-html="truncateText(theme.text, 200)"></div>
                            </div>
                            <div v-if="theme.last" class="theme__last flex flex-column gap-2 justify-content-between mt-2">
                                <span>Останнє повідомлення: </span>
                                <div class="flex relative w-full">
                                    <svg class="theme__last-romb" width="20" height="26" viewBox="0 0 36 26" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M0.5 12.9999C13.9644 9.31125 21.6304 7.03946 35.5 0.5L35.5 25.1913C19.7721 16.4417 12.593 14.7101 0.5 12.9999Z"
                                            fill="white" />
                                    </svg>
                                    <div class="theme__last-text w-full">
                                        <div>
                                            <span class="text-base font-bold">{{ theme.last.user.username + ': '
                                                }}</span>
                                            <span class="text-base" v-html="truncateText(theme.last.text)"></span>
                                        </div>
                                        <div v-if="theme.last" class="flex justify-content-end mt-2">
                                            <span class="text-xs">{{ format(theme.last.created_at, 'dd-MM-yyyy hh:mm')
                                                }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div v-if="userStore.isAdmin" class="flex justify-content-between mt-2">
                                <div @click.stop class="flex align-items-center gap-2">
                                    <label for="closeTheme">Закрити тему</label>
                                    <ToggleSwitch 
                                        :model-value="!!theme.state" 
                                        id="closeTheme"
                                        @update:model-value="(val: any) => toggleSingleState(theme.id, val ? 1 : 0)" 
                                    />
                                </div>
                                <span class="text-sm ml-auto"> {{ format(theme.created_at, 'dd-MM-yyyy hh:mm') }}</span>
                            </div>
                        </div>
                    </router-link>
                    <div v-else class="chat-support__no-themes">
                        <p>Немає доступних тем.</p>
                    </div>
                </div>
                <Paginator
                    v-if="total > limit"
                    :rows="limit"
                    :totalRecords="total"
                    :rowsPerPageOptions="[5, 10, 20, 30]"
                    class="mt-4"
                    @page="onPageChange"
                />
            </div>
        </div>

    </div>

    <CreateTheme ref="createThemeRef" @createTheme="getThemes" />
</template>
<style scoped lang="scss">
.chat-support {
    width: 100%;
    color: #fff;

    &__title {
        color: #fff;
        margin-bottom: 20px;
        text-align: center;
    }

    &__themes {
        display: flex;
        flex-direction: column;
        gap: 20px;
        margin-top: 20px;
        min-height: 55vh;

        .chat-support__theme {
            display: flex;
            flex-direction: column;
            gap: 5px;
            background-color: rgba(93, 119, 144, 0.1);
            padding: 20px;
            border-radius: 10px;
            color: #fff;
            cursor: pointer;
            transition: 0.3s;
            width: 100%;

            &:hover {
                background-color: rgba(93, 119, 144, 0.2);
            }
        }
    }

    .unread-indicator {
        width: 12px;
        height: 12px;
        background-color: #ff0000;
        border-radius: 50%;
        position: absolute;
        right: -5px;
        top: -2px;
    }

    .theme {
        opacity: 0.5;

        &__title {
            font-size: 1.2rem;
            color: #fff;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 350px;
        }

        &.active {
            opacity: 1;
        }

        &__text {
            font-family: "Candara", sans-serif;
            padding: 10px;
            background-color: rgba(93, 119, 144, 0.2);
            border-radius: 5px;
        }

        &__last {
            display: flex;
            gap: 5px;
            height: 100%;

        }

        &__last-romb {
            position: relative;
            top: 24px;
            left: 5px;
            transform: translateY(-100%);
        }

        &__last-text {
            font-family: "Candara", sans-serif;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            position: relative;
            background-color: #fff;
            color: black;
            padding: 10px;
            border-radius: 9px;
            word-break: break-all;
            overflow-wrap: anywhere;
            max-width: 100%;
            overflow: hidden;

            span {
                font-size: 16px;
                line-height: 130%;
            }
        }
    }

    ::v-deep(.p-togglebutton) {
        background-color: rgba(93, 119, 144, 0.1);
        border: none;
        color: #fff;
    }

    ::v-deep(.p-togglebutton:not(:disabled):not(.p-togglebutton-checked):hover) {
        background-color: rgba(93, 119, 144, 0.1);
    }

    ::v-deep(.p-togglebutton.p-togglebutton-checked::before) {
        background-color: rgba(93, 119, 144, 0.2);
    }
    
}
</style>