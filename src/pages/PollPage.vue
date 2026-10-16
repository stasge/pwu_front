<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useI18n } from 'vue-i18n';
import { fetchPost } from '@/utils/fetchApi';
import { formatPollDate } from '@/utils/pollDate';
import { ukPlural } from '@/utils/dateUtils';
import { usePollsStore } from '@/stores/pollsStore';
import { useUserStore } from '@/stores/userStore';
import PollVotersModal from '@/components/modals/PollVotersModal.vue';
import {
    POLL_STATUS_LABELS,
    type Poll,
    type PollOption,
    type PollVoter,
    voterDisplayName,
} from '@/models/poll';

/** Скільки імен показувати в рядку варіанта, решта — у модалці */
const VOTERS_PREVIEW_LIMIT = 5

const route = useRoute()
const toast = useToast()
const { t, te } = useI18n()
const pollsStore = usePollsStore()
const userStore = useUserStore()

const poll = ref<Poll | null>(null)
const loading = ref(false)
const notFound = ref(false)
const selectedOptionId = ref<number | null>(null)
const voting = ref(false)
const voteError = ref('')

const pollId = computed(() => Number(route.params.id))

const votersByOption = computed(() => {
    const map = new Map<number, PollVoter[]>()
    for (const voter of poll.value?.voters ?? []) {
        if (!map.has(voter.optionId)) map.set(voter.optionId, [])
        map.get(voter.optionId)!.push(voter)
    }
    return map
})

const votersModalRef = ref<InstanceType<typeof PollVotersModal> | null>(null)

const votersOf = (optionId: number) => votersByOption.value.get(optionId) ?? []

const openVotersModal = (option: PollOption) => {
    if (!poll.value) return
    votersModalRef.value?.showDia({
        option,
        voters: votersOf(option.id),
        totalVotes: poll.value.totalVotes,
        isMyOption: poll.value.myOptionId === option.id,
        currentUserId: userStore.user?.id ?? null,
    })
}

const isMe = (voter: PollVoter) => voter.userId === userStore.user?.id

/** Підказка «що означає активний»: відкривається по кліку, закривається кліком поза нею або Escape */
const activeTipOpen = ref(false)
const activeTipRef = ref<HTMLElement | null>(null)

const onActiveTipOutside = (e: MouseEvent) => {
    if (activeTipRef.value && !activeTipRef.value.contains(e.target as Node)) activeTipOpen.value = false
}
const onActiveTipKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') activeTipOpen.value = false
}

watch(activeTipOpen, open => {
    if (open) {
        document.addEventListener('click', onActiveTipOutside)
        document.addEventListener('keydown', onActiveTipKeydown)
    } else {
        document.removeEventListener('click', onActiveTipOutside)
        document.removeEventListener('keydown', onActiveTipKeydown)
    }
})

onBeforeUnmount(() => {
    document.removeEventListener('click', onActiveTipOutside)
    document.removeEventListener('keydown', onActiveTipKeydown)
})

const visibilityHint = computed(() => {
    if (!poll.value) return ''
    switch (poll.value.visibility) {
        case 'anonymous':
            return 'Голосування анонімне — хто за що голосував, не показується.'
        case 'public':
            return 'Голосування публічне — список тих, хто голосував, видно всім.'
        case 'public_after_finish':
            return poll.value.status === 'finished'
                ? 'Голосування завершене — список тих, хто голосував, тепер відкритий.'
                : 'Список тих, хто голосував, стане відкритим після завершення.'
    }
})

const formatPercent = (value: number) => {
    const rounded = Math.round(value * 10) / 10
    return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}%`
}

const votesLabel = (count: number) => `${count} ${ukPlural(count, 'голос', 'голоси', 'голосів')}`

/** Повідомлення з бекенду: англійські перекладаємо, українські (від ігрового сервера) показуємо як є */
const errorMessage = (e: any, fallback: string) => {
    const msg: string | undefined = e?.data?.msg
    if (msg && te(msg)) return t(msg)
    if (msg && /[а-яіїєґ]/i.test(msg)) return msg
    return fallback
}

const loadPoll = async () => {
    loading.value = true
    try {
        const { data } = await fetchPost('polls/get', { id: pollId.value })
        poll.value = data
        notFound.value = false
    } catch (e: any) {
        poll.value = null
        if (e?.data?.status_code === 404) {
            notFound.value = true
        } else {
            toast.error(errorMessage(e, 'Не вдалося завантажити опитування'))
        }
    } finally {
        loading.value = false
    }
}

const open = async () => {
    selectedOptionId.value = null
    voteError.value = ''
    await loadPoll()
    if (poll.value) {
        pollsStore.markViewed(poll.value.id).catch(() => {})
    }
}

const vote = async () => {
    if (!poll.value || selectedOptionId.value == null || voting.value) return
    voting.value = true
    voteError.value = ''
    try {
        await fetchPost('polls/vote', { id: poll.value.id, optionId: selectedOptionId.value })
        toast.success('Ваш голос зараховано')
        selectedOptionId.value = null
        await loadPoll()
    } catch (e: any) {
        voteError.value = errorMessage(e, 'Не вдалося проголосувати, спробуйте пізніше')
        // Стан міг змінитися (вже голосував / опитування завершилось) — оновлюємо
        if ([404, 409].includes(e?.data?.status_code)) await loadPoll()
    } finally {
        voting.value = false
    }
}

watch(pollId, (id) => {
    if (id) open()
}, { immediate: true })
</script>
<template>
    <div class="poll-page">
        <router-link :to="{ name: 'polls' }" class="poll-page__back">
            <img src="@/assets/icons/back-arrow.svg" alt="">
            <span>Усі голосування</span>
        </router-link>

        <div v-if="notFound" class="poll-page__empty">Опитування не знайдено або його видалено</div>

        <div v-else-if="poll" class="poll-page__card">
            <div class="poll-page__corner poll-page__corner--tl"></div>
            <div class="poll-page__corner poll-page__corner--tr"></div>
            <div class="poll-page__corner poll-page__corner--bl"></div>
            <div class="poll-page__corner poll-page__corner--br"></div>

            <div class="poll-page__meta">
                <span class="poll-status" :class="`poll-status--${poll.status}`">{{ POLL_STATUS_LABELS[poll.status] }}</span>
                <span>{{ formatPollDate(poll.startsAt) }} — {{ formatPollDate(poll.endsAt) }}</span>
            </div>

            <h1 class="poll-page__title">{{ poll.title }}</h1>
            <p v-if="poll.description" class="poll-page__description">{{ poll.description }}</p>

            <ul class="poll-page__info">
                <li>Хто може голосувати: гравці, у яких хоча б один персонаж <b>60+ рівня</b> і був
                    <span ref="activeTipRef" class="active-tip">
                        <button
                            type="button"
                            class="active-tip__term"
                            :aria-expanded="activeTipOpen"
                            aria-controls="active-tip-text"
                            @click="activeTipOpen = !activeTipOpen"
                        >активний</button>
                        <Transition name="active-tip">
                            <span v-if="activeTipOpen" id="active-tip-text" class="active-tip__bubble" role="tooltip">
                                <b>Активний</b> — щодня виконує щонайменше <b>50%</b> щоденної активності персонажа
                            </span>
                        </Transition>
                    </span>
                    за <b>останні 2 дні</b></li>
                <li>{{ visibilityHint }}</li>
                <li v-if="poll.canVote">Голос не можна змінити або відкликати.</li>
            </ul>

            <div class="poll-page__options" :class="{ 'poll-page__options--selectable': poll.canVote }">
                <component
                    :is="poll.canVote ? 'button' : 'div'"
                    v-for="option in poll.options"
                    :key="option.id"
                    type="button"
                    class="poll-option"
                    :class="{
                        'poll-option--selected': selectedOptionId === option.id,
                        'poll-option--mine': poll.myOptionId === option.id,
                    }"
                    :disabled="poll.canVote ? voting : undefined"
                    @click="poll.canVote && (selectedOptionId = option.id)"
                >
                    <div class="poll-option__bar" :style="{ width: `${option.percentage}%` }"></div>
                    <div class="poll-option__content">
                        <span v-if="poll.canVote" class="poll-option__radio"></span>
                        <span class="poll-option__text">{{ option.text }}</span>
                        <span v-if="poll.myOptionId === option.id" class="poll-option__mine">Ваш вибір</span>
                        <span class="poll-option__stats">
                            <span class="poll-option__percent">{{ formatPercent(option.percentage) }}</span>
                            <span class="poll-option__count">{{ votesLabel(option.vote_count) }}</span>
                        </span>
                    </div>
                </component>
            </div>

            <div class="poll-page__footer">
                <span class="poll-page__total">Усього: {{ votesLabel(poll.totalVotes) }}</span>
                <button
                    v-if="poll.canVote"
                    class="fantasy-btn small poll-page__vote-btn"
                    :disabled="selectedOptionId == null || voting"
                    @click="vote"
                >
                    <span>{{ voting ? 'Перевіряємо право голосу…' : 'Проголосувати' }}</span>
                </button>
                <span v-else-if="poll.hasVoted" class="poll-page__voted">Ви вже проголосували</span>
            </div>

            <p v-if="voting" class="poll-page__hint">Перевірка на ігровому сервері може тривати до 30 секунд. Не закривайте сторінку.</p>
            <p v-if="voteError" class="poll-page__error">{{ voteError }}</p>

            <div v-if="poll.voters" class="poll-page__voters">
                <h2 class="poll-page__subtitle">Хто як проголосував</h2>
                <p v-if="!poll.voters.length" class="poll-page__muted">Ще ніхто не проголосував</p>
                <template v-for="option in poll.options" :key="option.id">
                    <div v-if="votersOf(option.id).length" class="poll-voters">
                        <div class="poll-voters__head">
                            <span class="poll-voters__option" :title="option.text">{{ option.text }}</span>
                            <span class="poll-voters__count">{{ votersOf(option.id).length }}</span>
                        </div>
                        <div class="poll-voters__list">
                            <span
                                v-for="voter in votersOf(option.id).slice(0, VOTERS_PREVIEW_LIMIT)"
                                :key="voter.userId"
                                class="poll-voters__name"
                                :class="{ 'poll-voters__name--me': isMe(voter) }"
                                :title="voterDisplayName(voter)"
                            >{{ voterDisplayName(voter) }}</span>
                            <button
                                v-if="votersOf(option.id).length > VOTERS_PREVIEW_LIMIT"
                                type="button"
                                class="poll-voters__more"
                                title="Показати всіх, хто обрав цей варіант"
                                @click="openVotersModal(option)"
                            >
                                Ще +{{ votersOf(option.id).length - VOTERS_PREVIEW_LIMIT }}
                            </button>
                        </div>
                    </div>
                </template>
            </div>
        </div>

        <div v-else-if="loading" class="poll-page__empty">Завантаження…</div>

        <PollVotersModal ref="votersModalRef" />
    </div>
</template>
<style scoped lang="scss">
.poll-page {
    color: #f8f8f8;
    width: 100%;
    max-width: 860px;

    &__back {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 20px;
        font-family: "Candara", sans-serif;
        color: rgba(248, 248, 248, 0.7);
        transition: opacity 0.2s ease;

        &:hover { opacity: 0.7; }

        img { width: 18px; height: 18px; }
    }

    &__empty {
        padding: 40px 20px;
        text-align: center;
        font-size: 18px;
        color: rgba(248, 248, 248, 0.7);
        background: rgba(250, 250, 250, 0.05);
        border-radius: 5px;
    }

    &__card {
        position: relative;
        padding: clamp(20px, 4vw, 40px);
        background: rgba(250, 250, 250, 0.05);
        border-radius: 5px;
    }

    &__corner {
        position: absolute;
        width: 10px;
        height: 10px;
        background: url('@/assets/images/profile-corner.svg') no-repeat center / contain;

        &--tl { top: 0; left: 0; }
        &--tr { top: 0; right: 0; transform: rotate(90deg); }
        &--bl { bottom: 0; left: 0; transform: rotate(-90deg); }
        &--br { bottom: 0; right: 0; transform: rotate(180deg); }
    }

    &__meta {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;
        font-family: "Candara", sans-serif;
        font-size: 14px;
        color: rgba(248, 248, 248, 0.5);
    }

    &__title {
        margin: 16px 0 0;
        font-size: clamp(26px, 3.4vw, 40px);
        font-weight: 400;
        letter-spacing: -0.05em;
        line-height: 1.1;
    }

    &__description {
        margin: 12px 0 0;
        font-family: "Candara", sans-serif;
        font-size: 16px;
        line-height: 1.4;
        color: rgba(248, 248, 248, 0.8);
        white-space: pre-line;
    }

    &__info {
        margin: 20px 0 0;
        padding: 0 0 0 18px;
        font-family: "Candara", sans-serif;
        font-size: 14px;
        line-height: 1.5;
        color: rgba(248, 248, 248, 0.6);

        b { color: #fbd298; font-weight: 400; }

        li { position: relative; }
    }

    &__options {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 28px;
    }

    &__footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 20px;
        margin-top: 24px;
        min-height: 44px;
    }

    &__total,
    &__voted,
    &__muted {
        font-family: "Candara", sans-serif;
        font-size: 15px;
        color: rgba(248, 248, 248, 0.6);
    }

    &__voted { color: #aee961; }

    &__vote-btn {
        min-width: 220px;
        margin-right: 18px;

        @media (max-width: 768px) {
            margin-left: 15px;
        }

        &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }
    }

    &__hint {
        margin: 14px 0 0;
        font-family: "Candara", sans-serif;
        font-size: 14px;
        color: #fbd298;
    }

    &__error {
        margin: 14px 0 0;
        padding: 12px 16px;
        border-radius: 5px;
        background: rgba(255, 82, 82, 0.1);
        border: 1px solid rgba(255, 82, 82, 0.3);
        font-family: "Candara", sans-serif;
        font-size: 15px;
        color: #ff8a8a;
    }

    &__voters {
        margin-top: 32px;
        padding-top: 24px;
        border-top: 1px solid rgba(248, 248, 248, 0.1);
    }

    &__subtitle {
        margin: 0 0 16px;
        font-size: 22px;
        font-weight: 400;
    }
}

.active-tip {
    position: relative;
    display: inline-block;

    &__term {
        padding: 0;
        border: none;
        background: none;
        font: inherit;
        color: #fbd298;
        text-decoration: underline dashed rgba(251, 210, 152, 0.7);
        text-underline-offset: 3px;
        cursor: help;
        transition: color 0.2s ease;

        &:hover,
        &[aria-expanded="true"] {
            color: #fadfae;
            text-decoration-style: solid;
        }
    }

    &__bubble {
        position: absolute;
        top: calc(100% + 10px);
        left: 50%;
        z-index: 20;
        width: max-content;
        max-width: min(280px, 80vw);
        padding: 12px 14px;
        transform: translateX(-50%);
        background: #0b0b0b;
        border: 1px solid rgba(251, 210, 152, 0.3);
        border-radius: 5px;
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.85);
        font-family: "Candara", sans-serif;
        font-size: 14px;
        line-height: 1.4;
        color: rgba(248, 248, 248, 0.85);
        text-align: left;
        white-space: normal;

        b { color: #fbd298; font-weight: 400; }

        &::before {
            content: '';
            position: absolute;
            top: -6px;
            left: 50%;
            width: 10px;
            height: 10px;
            background: #0b0b0b;
            border-left: 1px solid rgba(251, 210, 152, 0.3);
            border-top: 1px solid rgba(251, 210, 152, 0.3);
            transform: translateX(-50%) rotate(45deg);
        }

        // На вузьких екранах слово може бути біля правого краю — розтягуємо підказку на весь рядок списку
        @media (max-width: 600px) {
            left: 0;
            right: 0;
            width: auto;
            max-width: none;
            transform: none;

            &::before {
                display: none;
            }
        }
    }

    @media (max-width: 600px) {
        position: static;
    }
}

.active-tip-enter-active,
.active-tip-leave-active {
    transition: opacity 0.15s ease;
}

.active-tip-enter-from,
.active-tip-leave-to {
    opacity: 0;
}

.poll-option {
    position: relative;
    overflow: hidden;
    width: 100%;
    padding: 0;
    border: 1px solid rgba(248, 248, 248, 0.12);
    border-radius: 5px;
    background: rgba(0, 0, 0, 0.3);
    color: inherit;
    font: inherit;
    text-align: left;

    &__bar {
        position: absolute;
        inset: 0 auto 0 0;
        background: linear-gradient(90deg, rgba(251, 210, 152, 0.12), rgba(251, 210, 152, 0.22));
        transition: width 0.5s ease;
    }

    &__content {
        position: relative;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
    }

    &__radio {
        flex-shrink: 0;
        width: 18px;
        height: 18px;
        border: 1px solid rgba(251, 210, 152, 0.6);
        border-radius: 50%;
        transition: box-shadow 0.2s ease, background 0.2s ease;
    }

    &__text {
        flex: 1;
        font-family: "Candara", sans-serif;
        font-size: 16px;
        word-break: break-word;
    }

    &__mine {
        flex-shrink: 0;
        padding: 3px 8px;
        border-radius: 99px;
        background: rgba(174, 233, 97, 0.15);
        color: #aee961;
        font-family: "Candara", sans-serif;
        font-size: 12px;
    }

    &__stats {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        flex-shrink: 0;
        min-width: 70px;
    }

    &__percent {
        font-size: 18px;
        line-height: 1.1;
        color: #fbd298;
    }

    &__count {
        font-family: "Candara", sans-serif;
        font-size: 12px;
        color: rgba(248, 248, 248, 0.5);
    }

    &--mine {
        border-color: rgba(174, 233, 97, 0.5);
    }

    &--selected {
        border-color: #fbd298;

        .poll-option__radio {
            background: #fbd298;
            box-shadow: inset 0 0 0 3px #1a1a1a;
        }
    }
}

.poll-page__options--selectable .poll-option {
    cursor: pointer;
    transition: border-color 0.2s ease;

    &:hover:not(:disabled) { border-color: rgba(251, 210, 152, 0.6); }
    &:disabled { cursor: progress; }
}

.poll-voters {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 14px 0;
    border-bottom: 1px solid rgba(248, 248, 248, 0.06);

    &:last-child {
        border-bottom: none;
    }

    &__head {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
    }

    &__option {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-family: "Candara", sans-serif;
        font-size: 15px;
        color: #fbd298;
    }

    &__count {
        flex-shrink: 0;
        min-width: 22px;
        padding: 2px 7px;
        border-radius: 99px;
        background: rgba(251, 210, 152, 0.12);
        color: #fbd298;
        font-family: "Candara", sans-serif;
        font-size: 12px;
        text-align: center;
    }

    &__list {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px;
        min-width: 0;
    }

    &__name {
        max-width: 140px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding: 5px 12px;
        border: 1px solid rgba(248, 248, 248, 0.08);
        border-radius: 99px;
        background: rgba(248, 248, 248, 0.06);
        font-family: "Candara", sans-serif;
        font-size: 14px;
        line-height: 1.2;

        &--me {
            border-color: rgba(174, 233, 97, 0.5);
            background: rgba(174, 233, 97, 0.12);
            color: #aee961;
        }
    }

    &__more {
        padding: 5px 12px;
        border: 1px dashed rgba(251, 210, 152, 0.5);
        border-radius: 99px;
        background: transparent;
        color: #fbd298;
        font-family: "Candara", sans-serif;
        font-size: 14px;
        line-height: 1.2;
        white-space: nowrap;
        transition: background 0.2s ease;

        &:hover {
            background: rgba(251, 210, 152, 0.1);
        }
    }
}

</style>
