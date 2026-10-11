<script setup lang="ts">
import { useAsyncCallWrapper } from '@/composables/useAsyncCallWrapper';
import { ref, onMounted, watch } from 'vue';
import { fetchPost } from '@/utils/fetchApi';
import type { Theme } from '@/models/theme';
import CreateTheme from '@/components/modals/CreateTheme.vue';
import Corners from '@/components/base/Corners.vue';
import { formatKyivDateTime } from '@/utils/dateUtils';
import { truncateText } from '@/utils/text';
import ToggleSwitch from 'primevue/toggleswitch';
import { useUserStore } from '@/stores/userStore';
import Pagination from '@/components/base/Pagination.vue';
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

const selectState = (value: null | number) => {
    state.value = value
    page.value = 1
}

const toggleSingleState = async (id: number, newState: number) => {
    const params = {
        id,
        state: newState ? 1 : 0
    };
    wrapAsyncCall(async () => {
        await fetchPost('/support/state', params);
        // reload themes preserving currently selected filter from the `state` ref
        getThemes(state.value);
        userStore.getUnreadCount();
    });
};

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
    <div class="support">
        <div class="support__header">
            <h1 class="support__title">Підтримка</h1>
            <button type="button" class="fantasy-btn small support__create" @click="createThemeRef.showDia()">
                <span>Створити звернення</span>
            </button>
        </div>

        <div class="support__tabs">
            <button
                v-for="option in stateOptions"
                :key="String(option.value)"
                type="button"
                class="support__tab"
                :class="{ 'support__tab--active': state === option.value }"
                @click="selectState(option.value)"
            >
                {{ option.label }}
            </button>
        </div>

        <div class="support__themes">
            <div
                v-for="theme in themes"
                :key="theme.id"
                class="theme"
                :class="{ 'theme--closed': theme.state }"
            >
                <Corners />
                <router-link :to="{ name: 'support-chat-theme', params: { theme_id: theme.id } }" class="theme__link">
                    <div class="theme__head">
                        <div class="theme__title-wrap">
                            <h2 class="theme__title">{{ theme.name }}</h2>
                            <span v-if="theme.state" class="theme__badge theme__badge--closed">
                                <i class="pi pi-lock"></i> Закрита
                            </span>
                            <span v-else class="theme__badge">Відкрита</span>
                        </div>
                        <div class="theme__unread" :class="{ 'theme__unread--active': theme.is_unread }"
                            :title="theme.is_unread ? 'Непрочитані повідомлення' : 'Немає нових повідомлень'">
                            <i class="pi pi-comments"></i>
                            <span>{{ theme.is_unread }}</span>
                        </div>
                    </div>

                    <div class="theme__meta">
                        <span>Автор: <b>{{ theme.user.username }}</b></span>
                        <span>Повідомлень: <b>{{ theme.messages_count }}</b></span>
                        <span class="theme__meta-date">{{ formatKyivDateTime(theme.created_at) }}</span>
                    </div>

                    <div class="theme__text" v-html="truncateText(theme.text, 200)"></div>

                    <div v-if="theme.last" class="theme__last">
                        <div class="theme__last-head">
                            <span class="theme__last-label">Останнє повідомлення</span>
                            <span class="theme__last-date">{{ formatKyivDateTime(theme.last.created_at) }}</span>
                        </div>
                        <div class="theme__last-text">
                            <b>{{ theme.last.user.username }}:</b>
                            <span v-html="truncateText(theme.last.text, 200)"></span>
                        </div>
                    </div>
                </router-link>

                <div v-if="userStore.isAdmin" class="theme__admin">
                    <label :for="`closeTheme-${theme.id}`">Закрити тему</label>
                    <ToggleSwitch
                        :model-value="!!theme.state"
                        :input-id="`closeTheme-${theme.id}`"
                        @update:model-value="(val: any) => toggleSingleState(theme.id, val ? 1 : 0)"
                    />
                </div>
            </div>

            <div v-if="!themes.length" class="support__empty">
                <Corners />
                <i class="pi pi-inbox"></i>
                <p>Немає доступних тем.</p>
            </div>
        </div>

        <Pagination
            v-model:page="page"
            :total-pages="Math.ceil(total / limit)"
            class="support__paginator"
        />
    </div>

    <CreateTheme ref="createThemeRef" @createTheme="getThemes" />
</template>
<style scoped lang="scss">
$gold-gradient: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%);

.support {
    width: 100%;
    max-width: 1110px;
    color: #f8f8f8;

    &__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 20px;
    }

    &__title {
        margin: 0;
        font-size: clamp(32px, 4vw, 64px);
        font-weight: 400;
        letter-spacing: -0.07em;
        background: $gold-gradient;
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    &__create {
        margin: 0 20px;
        padding-left: 16px !important;
        padding-right: 16px !important;
    }

    &__tabs {
        position: relative;
        display: inline-flex;
        gap: 6px;
        margin-top: 30px;
        padding: 8px;
        border-radius: 5px;
        background: rgba(26, 26, 26, 0.9);

        @media (max-width: 767px) {
            display: flex;
            width: 100%;
        }
    }

    &__tab {
        padding: 8px 22px;
        border: none;
        border-radius: 3px;
        background: none;
        color: rgba(248, 248, 248, 0.6);
        font-family: "VollkornSC", sans-serif;
        font-size: 16px;
        transition: background-color 0.2s ease, color 0.2s ease;

        @media (max-width: 767px) {
            flex: 1;
            padding: 8px 10px;
        }

        &:hover {
            color: #f8f8f8;
        }

        &--active {
            background: rgba(226, 111, 15, 0.2);
            color: #fadfae;
        }
    }

    &__themes {
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin-top: 20px;
        min-height: 40vh;
    }

    &__empty {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 60px 20px;
        border-radius: 5px;
        background: rgba(250, 250, 250, 0.05);
        color: rgba(248, 248, 248, 0.5);
        font-size: 18px;

        i {
            font-size: 32px;
        }
    }

    &__paginator {
        margin-top: 30px;
    }
}

.theme {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: clamp(20px, 3vw, 30px);
    border-radius: 5px;
    background: rgba(250, 250, 250, 0.05);
    color: #f8f8f8;
    transition: background-color 0.3s ease;

    &:hover {
        background: rgba(250, 250, 250, 0.09);
    }

    &__link {
        display: flex;
        flex-direction: column;
        gap: 14px;
        color: inherit;
    }

    &--closed {
        background: rgba(250, 250, 250, 0.025);

        .theme__title,
        .theme__text,
        .theme__last {
            opacity: 0.6;
        }
    }

    &__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
    }

    &__title-wrap {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 0;

        @media (max-width: 767px) {
            flex-wrap: wrap;
            gap: 6px 10px;
        }
    }

    &__title {
        margin: 0;
        font-size: 22px;
        font-weight: 400;
        letter-spacing: -0.03em;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        @media (max-width: 767px) {
            font-size: 18px;
            white-space: normal;
            overflow-wrap: anywhere;
        }
    }

    &__badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        flex-shrink: 0;
        padding: 3px 10px;
        border-radius: 20px;
        background: rgba(17, 175, 25, 0.15);
        color: #7ee083;
        font-family: "Candara", sans-serif;
        font-size: 13px;

        i {
            font-size: 11px;
        }

        &--closed {
            background: rgba(214, 40, 40, 0.2);
            color: #ff8a8a;
        }
    }

    &__unread {
        position: relative;
        display: flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
        color: rgba(248, 248, 248, 0.4);
        font-size: 18px;

        i {
            font-size: 20px;
        }

        &--active {
            color: #fadfae;

            &::after {
                content: '';
                position: absolute;
                top: -3px;
                left: 14px;
                width: 9px;
                height: 9px;
                border-radius: 50%;
                background: #e26f0f;
                box-shadow: 0 0 8px #e26f0f;
            }
        }
    }

    &__meta {
        display: flex;
        flex-wrap: wrap;
        gap: 6px 24px;
        font-family: "Candara", sans-serif;
        font-size: 14px;
        color: rgba(248, 248, 248, 0.5);

        b {
            font-weight: 400;
            color: #f8f8f8;
        }
    }

    &__meta-date {
        margin-left: auto;

        @media (max-width: 767px) {
            margin-left: 0;
        }
    }

    &__text {
        font-family: "Candara", sans-serif;
        font-size: 15px;
        line-height: 1.4;
        color: rgba(248, 248, 248, 0.85);
        overflow-wrap: anywhere;

        :deep(*) {
            margin: 0;
        }

        :deep(img) {
            display: none;
        }
    }

    &__last {
        padding: 12px 16px;
        border-left: 2px solid #e26f0f;
        border-radius: 0 5px 5px 0;
        background: rgba(0, 0, 0, 0.4);
        font-family: "Candara", sans-serif;
    }

    &__last-head {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 6px;
        font-size: 13px;
        color: rgba(248, 248, 248, 0.5);
    }

    &__last-text {
        font-size: 15px;
        color: rgba(248, 248, 248, 0.85);
        overflow-wrap: anywhere;

        b {
            font-weight: 400;
            color: #fadfae;
            margin-right: 4px;
        }

        :deep(*) {
            display: inline;
            margin: 0;
        }

        :deep(img) {
            display: none;
        }
    }

    &__admin {
        display: flex;
        align-items: center;
        gap: 10px;
        align-self: flex-start;
        padding-top: 14px;
        width: 100%;
        border-top: 1px solid rgba(248, 248, 248, 0.1);
        font-size: 15px;
        label {
            cursor: pointer;
        }
    }

    &__text :deep(a),
    &__last-text :deep(a) {
        color: #e26f0f;
    }

    :deep(.p-toggleswitch-slider) {
        background: rgba(248, 248, 248, 0.15);
        border: none;
    }

    :deep(.p-toggleswitch.p-toggleswitch-checked .p-toggleswitch-slider) {
        background: #e26f0f;
    }

    :deep(.p-toggleswitch-handle) {
        background: #f8f8f8 !important;
    }
}
</style>
