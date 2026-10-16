<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useAsyncCallWrapper } from '@/composables/useAsyncCallWrapper';
import { useConfirmRemoval } from '@/composables/useConfirmRemoval';
import { fetchPost } from '@/utils/fetchApi';
import { formatPollDate } from '@/utils/pollDate';
import { ukPlural } from '@/utils/dateUtils';
import {
    POLL_STATUS_LABELS,
    POLL_VISIBILITY_LABELS,
    type Poll,
    type PollSummary,
    voterDisplayName,
} from '@/models/poll';
import Modal from '@/components/base/modal.vue';
import Pagination from '@/components/base/Pagination.vue';
import PollFormModal from '@/components/modals/PollFormModal.vue';

const LIMIT = 15

const { wrapAsyncCall } = useAsyncCallWrapper()
const { confirmRemoval } = useConfirmRemoval()

const polls = ref<PollSummary[]>([])
const total = ref(0)
const page = ref(1)
const search = ref('')
const appliedSearch = ref('')
const loaded = ref(false)

const formRef = ref<InstanceType<typeof PollFormModal> | null>(null)
const resultsShowed = ref(false)
const results = ref<Poll | null>(null)

const totalPages = computed(() => Math.ceil(total.value / LIMIT))

const loadPolls = async () => {
    const resp = await wrapAsyncCall(() =>
        fetchPost('admin/polls/list', { search: appliedSearch.value, page: page.value, limit: LIMIT })
    )
    polls.value = resp?.data?.polls ?? []
    total.value = resp?.data?.total ?? 0
    loaded.value = true
}

const applySearch = () => {
    appliedSearch.value = search.value.trim()
    if (page.value !== 1) page.value = 1
    else loadPolls()
}

const finishPoll = async (id: number) => {
    await wrapAsyncCall(() => fetchPost('admin/polls/finish', { id }), null, 'Опитування завершено')
    loadPolls()
}

const deletePoll = async (id: number) => {
    await wrapAsyncCall(() => fetchPost('admin/polls/delete', { id }), null, 'Опитування видалено')
    loadPolls()
}

const showResults = async (id: number) => {
    const resp = await wrapAsyncCall(() => fetchPost('admin/polls/results', { id }))
    if (!resp?.data) return
    results.value = resp.data
    resultsShowed.value = true
}

const votersFor = (optionId: number) => results.value?.voters?.filter(v => v.optionId === optionId) ?? []

const formatPercent = (value: number) => `${Math.round(value * 10) / 10}%`

watch(page, loadPolls)
onMounted(loadPolls)
</script>
<template>
    <div class="admin-polls">
        <div class="admin-polls__header">
            <h1 class="admin-polls__title">Керування опитуваннями</h1>
            <button class="fantasy-btn small admin-polls__create" @click="formRef?.showDia()">
                <img src="@/assets/images/Plus.svg" alt="">
                <span>Нове опитування</span>
            </button>
        </div>

        <form class="admin-polls__search" @submit.prevent="applySearch">
            <input v-model="search" type="text" placeholder="Пошук за назвою або описом">
            <button type="submit" class="fantasy-btn small thin"><span>Знайти</span></button>
        </form>

        <div class="admin-polls__table-wrap">
            <table class="admin-polls__table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Назва</th>
                        <th>Статус</th>
                        <th>Період</th>
                        <th>Видимість</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="poll in polls" :key="poll.id">
                        <td>{{ poll.id }}</td>
                        <td class="admin-polls__name">{{ poll.title }}</td>
                        <td><span class="poll-status" :class="`poll-status--${poll.status}`">{{ POLL_STATUS_LABELS[poll.status] }}</span></td>
                        <td class="admin-polls__dates">
                            {{ formatPollDate(poll.startsAt) }}<br>{{ formatPollDate(poll.endsAt) }}
                        </td>
                        <td class="admin-polls__muted">
                            {{ POLL_VISIBILITY_LABELS[poll.visibility] }}
                        </td>
                        <td>
                            <div class="admin-polls__actions">
                                <button title="Результати" @click="showResults(poll.id)"><i class="pi pi-chart-bar"></i></button>
                                <button title="Редагувати" @click="formRef?.showDia(poll.id)"><i class="pi pi-pencil"></i></button>
                                <button
                                    v-if="poll.status === 'active'"
                                    title="Завершити достроково"
                                    class="warning"
                                    @click="confirmRemoval($event, poll.id, 'Завершити опитування достроково? Голосувати більше буде не можна.', finishPoll)"
                                ><i class="pi pi-stop-circle"></i></button>
                                <button
                                    title="Видалити"
                                    class="danger"
                                    @click="confirmRemoval($event, poll.id, 'Видалити опитування? Користувачі більше його не побачать.', deletePoll)"
                                ><i class="pi pi-trash"></i></button>
                            </div>
                        </td>
                    </tr>
                    <tr v-if="loaded && !polls.length">
                        <td colspan="6" class="admin-polls__empty">Опитувань не знайдено</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <Pagination v-model:page="page" :total-pages="totalPages" class="mt-5" />

        <PollFormModal ref="formRef" @saved="loadPolls" />

        <Modal v-model:showed="resultsShowed">
            <template #header>
                <h2 class="modal__title">Результати</h2>
            </template>
            <template #body>
                <div v-if="results" class="poll-results">
                    <p class="poll-results__title">{{ results.title }}</p>
                    <p class="poll-results__total">
                        {{ results.totalVotes }} {{ ukPlural(results.totalVotes, 'голос', 'голоси', 'голосів') }} ·
                        {{ POLL_STATUS_LABELS[results.status] }}
                    </p>
                    <div v-for="option in results.options" :key="option.id" class="poll-results__option">
                        <div class="poll-results__row">
                            <span>{{ option.text }}</span>
                            <span class="poll-results__value">{{ option.vote_count }} · {{ formatPercent(option.percentage) }}</span>
                        </div>
                        <div class="poll-results__bar"><div :style="{ width: `${option.percentage}%` }"></div></div>
                        <div v-if="votersFor(option.id).length" class="poll-results__voters">
                            <span v-for="voter in votersFor(option.id)" :key="voter.userId">{{ voterDisplayName(voter) }} <small>{{ voterDisplayName(voter) !== voter.username ? `${voter.username} · ` : '' }}#{{ voter.userId }}</small></span>
                        </div>
                    </div>
                </div>
            </template>
        </Modal>
    </div>
</template>
<style scoped lang="scss">
.admin-polls {
    width: 95%;
    max-width: 1200px;
    color: #f8f8f8;

    &__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 20px;
        margin-bottom: 24px;
    }

    &__title {
        margin: 0;
        font-size: clamp(26px, 3vw, 40px);
        font-weight: 400;
        letter-spacing: -0.05em;
    }

    &__create {
        margin: 0 20px;
        padding-left: 12px;
        padding-right: 12px;

        img { position: relative; z-index: 2; width: 18px; }
    }

    &__search {
        display: flex;
        gap: 24px;
        align-items: center;
        margin-bottom: 20px;

        input {
            width: 100%;
            max-width: 360px;
            padding: 9px 12px;
            border: 1px solid rgba(248, 248, 248, 0.15);
            border-radius: 5px;
            background: rgba(0, 0, 0, 0.45);
            color: #f8f8f8;
            font-family: "Candara", sans-serif;
            font-size: 15px;
            outline: none;
        }
    }

    &__table-wrap {
        overflow-x: auto;
    }

    &__table {
        width: 100%;
        border-collapse: collapse;
        font-family: "Candara", sans-serif;
        font-size: 14px;

        th, td {
            padding: 12px 10px;
            border: 1px solid rgba(93, 119, 144, 0.15);
            background: #171d2b;
            text-align: left;
            vertical-align: middle;
        }

        th {
            font-family: "VollkornSC", sans-serif;
            font-weight: 400;
            font-size: 16px;
            color: rgba(248, 248, 248, 0.7);
        }
    }

    &__name {
        min-width: 220px;
        font-size: 15px;
    }

    &__dates,
    &__muted {
        white-space: nowrap;
        color: rgba(248, 248, 248, 0.6);
    }

    &__empty {
        text-align: center !important;
        padding: 30px !important;
        color: rgba(248, 248, 248, 0.6);
    }

    &__actions {
        display: flex;
        gap: 6px;
        justify-content: flex-end;

        button {
            width: 34px;
            height: 34px;
            border: 1px solid rgba(248, 248, 248, 0.15);
            border-radius: 5px;
            background: rgba(248, 248, 248, 0.05);
            color: #fbd298;
            transition: background 0.2s ease;

            &:hover { background: rgba(248, 248, 248, 0.12); }
            &.warning { color: #ffb74d; }
            &.danger { color: #ff8a8a; }
        }
    }
}

.poll-results {
    width: min(560px, 80vw);
    max-height: 65vh;
    overflow-y: auto;
    font-family: "Candara", sans-serif;

    &__title {
        margin: 0 0 4px;
        font-size: 18px;
    }

    &__total {
        margin: 0 0 20px;
        font-size: 14px;
        color: rgba(248, 248, 248, 0.6);
    }

    &__option {
        margin-bottom: 18px;
    }

    &__row {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 6px;
    }

    &__value {
        flex-shrink: 0;
        color: #fbd298;
    }

    &__bar {
        height: 6px;
        border-radius: 99px;
        background: rgba(248, 248, 248, 0.1);
        overflow: hidden;

        div {
            height: 100%;
            background: #fbd298;
        }
    }

    &__voters {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 8px;

        span {
            padding: 3px 8px;
            border-radius: 99px;
            background: rgba(248, 248, 248, 0.08);
            font-size: 13px;
        }

        small { opacity: 0.5; }
    }
}
</style>
