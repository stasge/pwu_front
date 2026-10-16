<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAsyncCallWrapper } from '@/composables/useAsyncCallWrapper';
import { fetchPost } from '@/utils/fetchApi';
import { formatPollDate } from '@/utils/pollDate';
import { POLL_STATUS_LABELS, type PollSummary } from '@/models/poll';
import { usePollsStore } from '@/stores/pollsStore';
import { useUserStore } from '@/stores/userStore';
import Pagination from '@/components/base/Pagination.vue';

const LIMIT = 10

const route = useRoute()
const router = useRouter()
const pollsStore = usePollsStore()
const userStore = useUserStore()
const { wrapAsyncCall } = useAsyncCallWrapper()

const polls = ref<PollSummary[]>([])
const total = ref(0)
const loaded = ref(false)
const page = ref(Number(route.query.page) || 1)
const search = ref(String(route.query.search ?? ''))
const appliedSearch = ref(search.value)

const totalPages = computed(() => Math.ceil(total.value / LIMIT))

const loadPolls = async () => {
    const resp = await wrapAsyncCall(() =>
        fetchPost('polls/list', { search: appliedSearch.value, page: page.value, limit: LIMIT })
    )
    polls.value = resp?.data?.polls ?? []
    total.value = resp?.data?.total ?? 0
    loaded.value = true
}

const syncQuery = () => {
    router.replace({
        query: {
            ...route.query,
            page: page.value > 1 ? page.value : undefined,
            search: appliedSearch.value || undefined,
        },
    })
}

const applySearch = () => {
    appliedSearch.value = search.value.trim()
    page.value = 1
    syncQuery()
    loadPolls()
}

const resetSearch = () => {
    if (!appliedSearch.value && !search.value) return
    search.value = ''
    applySearch()
}

watch(page, () => {
    syncQuery()
    loadPolls()
})

onMounted(() => {
    loadPolls()
    pollsStore.loadUnreadCount()
})
</script>
<template>
    <div class="polls">
        <div class="polls__header">
            <h1 class="polls__title">Голосування</h1>
            <router-link
                v-if="userStore.isAdmin"
                :to="{ name: 'admin-polls' }"
                class="fantasy-btn small thin polls__admin-btn"
            >
                <span>Керування опитуваннями</span>
            </router-link>
        </div>

        <p v-if="pollsStore.unreadCount > 0" class="polls__notice">
            <span class="polls__notice-dot"></span>
            Нових голосувань, які ви ще не відкривали: <b>{{ pollsStore.unreadCount }}</b>
        </p>

        <form class="polls__search" @submit.prevent="applySearch">
            <div class="custom-input polls__search-input">
                <div class="input-bg"></div>
                <input v-model="search" type="text" placeholder="Пошук за назвою або описом">
            </div>
            <button type="submit" class="fantasy-btn small thin polls__search-btn"><span>Знайти</span></button>
            <button v-if="appliedSearch" type="button" class="polls__reset" @click="resetSearch">Скинути</button>
        </form>

        <div v-if="loaded && !polls.length" class="polls__empty">
            {{ appliedSearch ? 'За вашим запитом нічого не знайдено' : 'Поки що голосувань немає' }}
        </div>

        <div class="polls__list">
            <router-link
                v-for="poll in polls"
                :key="poll.id"
                :to="{ name: 'poll', params: { id: poll.id } }"
                class="poll-card"
                :class="{ 'poll-card--active': poll.status === 'active', 'poll-card--new': pollsStore.isNew(poll) }"
            >
                <div class="poll-card__top">
                    <span class="poll-card__badges">
                        <span class="poll-status" :class="`poll-status--${poll.status}`">{{ POLL_STATUS_LABELS[poll.status] }}</span>
                        <span v-if="pollsStore.isNew(poll)" class="poll-card__new">Нове</span>
                    </span>
                    <span class="poll-card__dates">{{ formatPollDate(poll.startsAt) }} — {{ formatPollDate(poll.endsAt) }}</span>
                </div>
                <h2 class="poll-card__title">{{ poll.title }}</h2>
                <p v-if="poll.description" class="poll-card__description">{{ poll.description }}</p>
                <span class="poll-card__more">{{ poll.status === 'active' ? 'Перейти до голосування' : 'Переглянути результати' }} →</span>
            </router-link>
        </div>

        <Pagination v-model:page="page" :total-pages="totalPages" class="mt-5" />
    </div>
</template>
<style scoped lang="scss">
.polls {
    color: #f8f8f8;
    width: 100%;
    max-width: 1080px;

    &__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 20px;
        margin-bottom: 24px;
    }

    &__title {
        font-size: clamp(32px, 4vw, 64px);
        margin: 0;
        font-weight: 400;
        letter-spacing: -0.07em;
    }

    &__admin-btn {
        margin: 0 12px;
        padding: 0 16px !important;
        text-decoration: none;
    }

    &__notice {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 0 0 20px;
        font-family: "Candara", sans-serif;
        font-size: 16px;

        b {
            color: #fbd298;
        }
    }

    &__notice-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #e53935;
        animation: poll-pulse 1.2s infinite;
    }

    &__search {
        display: flex;
        align-items: center;
        gap: 24px;
        margin-bottom: 24px;
        flex-wrap: wrap;
    }

    &__search-input {
        max-width: 420px;
        background: rgba(250, 250, 250, 0.05);
        border-radius: 13px;
    }

    &__search-btn {
        @media (max-width: 768px) {
            margin-left: 15px;
        }
    }

    &__reset {
        background: none;
        border: none;
        color: rgba(248, 248, 248, 0.6);
        text-decoration: underline;
        font-family: "Candara", sans-serif;
        font-size: 15px;
    }

    &__empty {
        padding: 40px 20px;
        text-align: center;
        font-size: 18px;
        color: rgba(248, 248, 248, 0.7);
        background: rgba(250, 250, 250, 0.05);
        border-radius: 5px;
    }

    &__list {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }
}

.poll-card {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: clamp(16px, 3vw, 24px) clamp(16px, 3vw, 30px);
    background: rgba(250, 250, 250, 0.05);
    border: 1px solid transparent;
    border-radius: 5px;
    color: #f8f8f8;
    text-decoration: none;
    transition: border-color 0.2s ease, background 0.2s ease;

    &:hover {
        border-color: rgba(251, 210, 152, 0.4);
        background: rgba(250, 250, 250, 0.08);
    }

    &--active {
        border-color: rgba(251, 210, 152, 0.25);
    }

    &--new {
        border-color: rgba(229, 57, 53, 0.55);
        box-shadow: inset 3px 0 0 #e53935;
    }

    &__badges {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    &__new {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 99px;
        background: #e53935;
        color: #fff;
        font-family: "Candara", sans-serif;
        font-size: 13px;
        font-weight: 700;
        line-height: 1;

        &::before {
            content: "";
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #fff;
            animation: poll-pulse 1.2s infinite;
        }
    }

    &__top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        flex-wrap: wrap;
    }

    &__dates {
        font-family: "Candara", sans-serif;
        font-size: 14px;
        color: rgba(248, 248, 248, 0.5);
    }

    &__title {
        margin: 0;
        font-size: clamp(20px, 2.4vw, 26px);
        font-weight: 400;
        letter-spacing: -0.03em;
    }

    &__description {
        margin: 0;
        font-family: "Candara", sans-serif;
        font-size: 15px;
        color: rgba(248, 248, 248, 0.7);
        white-space: pre-line;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    &__more {
        font-family: "VollkornSC", sans-serif;
        font-size: 15px;
        background: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        align-self: flex-start;
    }
}

@keyframes poll-pulse {
    0% { box-shadow: 0 0 0 0 rgba(229, 57, 53, 0.7); }
    70% { box-shadow: 0 0 0 8px rgba(229, 57, 53, 0); }
    100% { box-shadow: 0 0 0 0 rgba(229, 57, 53, 0); }
}
</style>
