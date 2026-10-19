<script setup lang='ts'>
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { voterDisplayName, type PollOption, type PollVoter } from '@/models/poll';
import { ukPlural } from '@/utils/dateUtils';

const showed = ref(false)
const option = ref<PollOption | null>(null)
const voters = ref<PollVoter[]>([])
const totalVotes = ref(0)
const isMyOption = ref(false)
const currentUserId = ref<number | null>(null)
const search = ref('')

function showDia(params: {
    option: PollOption
    voters: PollVoter[]
    totalVotes: number
    isMyOption?: boolean
    currentUserId?: number | null
}) {
    option.value = params.option
    voters.value = params.voters
    totalVotes.value = params.totalVotes
    isMyOption.value = !!params.isMyOption
    currentUserId.value = params.currentUserId ?? null
    search.value = ''
    showed.value = true
}

const close = () => { showed.value = false }

defineExpose({ showDia })

const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close()
}

watch(showed, value => {
    if (value) document.addEventListener('keydown', onKeydown)
    else document.removeEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))

/** Порядковий номер голосу зберігаємо до фільтрації, щоб пошук його не змінював */
const numberedVoters = computed(() => voters.value.map((voter, index) => ({ voter, position: index + 1 })))

const filteredVoters = computed(() => {
    const query = search.value.trim().toLowerCase()
    if (!query) return numberedVoters.value
    return numberedVoters.value.filter(({ voter }) =>
        voterDisplayName(voter).toLowerCase().includes(query) || voter.username.toLowerCase().includes(query)
    )
})

const percent = computed(() => {
    const value = option.value?.percentage ?? 0
    const rounded = Math.round(value * 10) / 10
    return Number.isInteger(rounded) ? rounded : Number(rounded.toFixed(1))
})

const votesLabel = (count: number) => `${count} ${ukPlural(count, 'голос', 'голоси', 'голосів')}`

const initial = (name: string) => name.trim().charAt(0).toUpperCase() || '?'

const isMe = (voter: PollVoter) => currentUserId.value != null && voter.userId === currentUserId.value

const RING_RADIUS = 34
const RING_LENGTH = 2 * Math.PI * RING_RADIUS
</script>
<template>
    <Teleport to="body">
        <Transition name="pv-fade">
            <div v-if="showed && option" class="pv-mask" @click.self="close">
                <div class="pv" :class="{ 'pv--mine': isMyOption }" role="dialog" aria-modal="true" :aria-label="`Хто обрав: ${option.text}`">
                    <div class="pv__corner pv__corner--top-left"></div>
                    <div class="pv__corner pv__corner--top-right"></div>
                    <div class="pv__corner pv__corner--bottom-left"></div>
                    <div class="pv__corner pv__corner--bottom-right"></div>

                    <button type="button" class="pv__close" aria-label="Закрити" @click="close">
                        <i class="pi pi-times"></i>
                    </button>

                    <div class="pv__head">
                        <span class="pv__ring">
                            <svg viewBox="0 0 80 80" width="80" height="80">
                                <circle class="pv__ring-bg" cx="40" cy="40" :r="RING_RADIUS" />
                                <circle
                                    class="pv__ring-fill"
                                    cx="40" cy="40" :r="RING_RADIUS"
                                    :stroke-dasharray="RING_LENGTH"
                                    :stroke-dashoffset="RING_LENGTH * (1 - percent / 100)"
                                />
                            </svg>
                            <span class="pv__ring-text">{{ percent }}%</span>
                        </span>
                        <div class="pv__head-info">
                            <p class="pv__label">Хто обрав варіант</p>
                            <h2 class="pv__name">{{ option.text }}</h2>
                            <span v-if="isMyOption" class="pv__badge"><i class="pi pi-check"></i> Ваш вибір</span>
                        </div>
                    </div>

                    <div class="pv__stats">
                        <div class="pv__stat">
                            <span class="pv__stat-label">За цей варіант</span>
                            <span class="pv__stat-value">{{ voters.length }}</span>
                        </div>
                        <div class="pv__stat">
                            <span class="pv__stat-label">Частка</span>
                            <span class="pv__stat-value">{{ percent }}<small>%</small></span>
                        </div>
                        <div class="pv__stat">
                            <span class="pv__stat-label">Усього голосів</span>
                            <span class="pv__stat-value">{{ totalVotes }}</span>
                        </div>
                    </div>

                    <div class="pv__divider"></div>

                    <label class="pv__search">
                        <i class="pi pi-search"></i>
                        <input v-model="search" type="text" placeholder="Пошук за іменем" autocomplete="off">
                        <button v-if="search" type="button" class="pv__search-clear" aria-label="Очистити пошук" @click="search = ''">
                            <i class="pi pi-times"></i>
                        </button>
                    </label>

                    <div class="pv__body">
                        <h3 class="pv__section-title">
                            {{ search ? 'Знайдено' : 'Проголосували' }} <span>{{ filteredVoters.length }}</span>
                        </h3>

                        <ul v-if="filteredVoters.length" class="pv__list">
                            <li
                                v-for="{ voter, position } in filteredVoters"
                                :key="voter.userId"
                                class="pv-item"
                                :class="{ 'pv-item--me': isMe(voter) }"
                            >
                                <span class="pv-item__avatar">{{ initial(voterDisplayName(voter)) }}</span>
                                <span class="pv-item__name" :title="voterDisplayName(voter)">{{ voterDisplayName(voter) }}</span>
                                <span v-if="isMe(voter)" class="pv-item__me">Ви</span>
                                <span class="pv-item__position">#{{ position }}</span>
                            </li>
                        </ul>
                        <p v-else class="pv__empty">
                            Серед {{ votesLabel(voters.length) }} нікого з таким іменем немає
                        </p>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
<style scoped lang='scss'>
.pv-mask {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(3px);
}

.pv {
    --accent: #fbd298;
    --accent-soft: rgba(251, 210, 152, 0.12);

    position: relative;
    width: min(560px, 100%);
    max-height: calc(100vh - 32px);
    display: flex;
    flex-direction: column;
    padding: 30px;
    color: #f8f8f8;
    background:
        radial-gradient(120% 60% at 0% 0%, var(--accent-soft) 0%, transparent 60%),
        #111;
    border: 1px solid rgba(250, 250, 250, 0.08);
    border-radius: 5px;
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.8);

    @media (max-width: 767px) {
        padding: 22px 16px;
    }

    &--mine {
        --accent: #AEE961;
        --accent-soft: rgba(174, 233, 97, 0.1);
    }

    &__corner {
        position: absolute;
        width: 10px;
        height: 10px;
        background: url('@/assets/images/profile-corner.svg') no-repeat center / contain;
        z-index: 1;
        pointer-events: none;

        &--top-left { top: -1px; left: -1px; }
        &--top-right { top: -1px; right: -1px; transform: rotate(90deg); }
        &--bottom-left { bottom: -1px; left: -1px; transform: rotate(-90deg); }
        &--bottom-right { bottom: -1px; right: -1px; transform: rotate(180deg); }
    }

    &__close {
        position: absolute;
        top: 16px;
        right: 16px;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        border: 1px solid rgba(250, 250, 250, 0.12);
        background: rgba(0, 0, 0, 0.4);
        color: rgba(248, 248, 248, 0.7);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s ease, border-color 0.2s ease;

        &:hover {
            color: #fbd298;
            border-color: rgba(251, 210, 152, 0.5);
        }
    }

    &__head {
        display: flex;
        align-items: center;
        gap: 18px;
        padding-right: 40px;

        @media (max-width: 767px) {
            gap: 12px;
        }
    }

    &__ring {
        position: relative;
        flex-shrink: 0;
        width: 80px;
        height: 80px;

        svg {
            width: 100%;
            height: 100%;
            transform: rotate(-90deg);
        }

        @media (max-width: 767px) {
            width: 56px;
            height: 56px;
        }
    }

    &__ring-bg {
        fill: none;
        stroke: rgba(248, 248, 248, 0.08);
        stroke-width: 5;
    }

    &__ring-fill {
        fill: none;
        stroke: var(--accent);
        stroke-width: 5;
        stroke-linecap: round;
        transition: stroke-dashoffset 0.6s ease;
        filter: drop-shadow(0 0 6px var(--accent-soft));
    }

    &__ring-text {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        color: var(--accent);

        @media (max-width: 767px) {
            font-size: 14px;
        }
    }

    &__head-info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
    }

    &__label {
        margin: 0;
        font-family: "Candara", sans-serif;
        font-size: 13px;
        color: rgba(248, 248, 248, 0.5);
    }

    &__name {
        margin: 0;
        font-size: clamp(22px, 4vw, 30px);
        font-weight: 400;
        line-height: 1.1;
        letter-spacing: -0.05em;
        overflow-wrap: anywhere;
        background: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    &__badge {
        margin-top: 4px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 3px 10px;
        border-radius: 12px;
        font-family: "Candara", sans-serif;
        font-size: 12px;
        color: var(--accent);
        background: var(--accent-soft);
        border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);

        i { font-size: 10px; }
    }

    &__stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin-top: 24px;
    }

    &__stat {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 12px 14px;
        background: rgba(0, 0, 0, 0.4);
        border: 1px solid rgba(250, 250, 250, 0.06);
        border-radius: 5px;
    }

    &__stat-label {
        font-family: "Candara", sans-serif;
        font-size: 12px;
        color: rgba(248, 248, 248, 0.5);
    }

    &__stat-value {
        font-size: 22px;
        line-height: 1;
        color: #f8f8f8;

        small {
            font-size: 14px;
            color: rgba(248, 248, 248, 0.4);
        }
    }

    &__divider {
        height: 1px;
        margin: 22px 0 18px;
        background: linear-gradient(90deg, transparent 0%, rgba(251, 210, 152, 0.35) 50%, transparent 100%);
    }

    &__search {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 16px;
        padding: 0 12px;
        height: 40px;
        background: rgba(0, 0, 0, 0.4);
        border: 1px solid rgba(250, 250, 250, 0.08);
        border-radius: 5px;
        transition: border-color 0.2s ease;

        &:focus-within {
            border-color: rgba(251, 210, 152, 0.5);
        }

        > .pi {
            font-size: 13px;
            color: rgba(248, 248, 248, 0.4);
        }

        input {
            flex: 1;
            min-width: 0;
            height: 100%;
            border: none;
            outline: none;
            background: transparent;
            color: #f8f8f8;
            font-family: "Candara", sans-serif;
            font-size: 15px;

            &::placeholder { color: rgba(248, 248, 248, 0.35); }
        }
    }

    &__search-clear {
        padding: 0;
        border: none;
        background: none;
        color: rgba(248, 248, 248, 0.5);
        cursor: pointer;

        &:hover { color: #fbd298; }

        i { font-size: 11px; }
    }

    &__body {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding-right: 6px;
        margin-right: -6px;

        &::-webkit-scrollbar { width: 4px; }
        &::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.4); border-radius: 4px; }
        &::-webkit-scrollbar-thumb { background: rgba(251, 210, 152, 0.5); border-radius: 4px; }
    }

    &__section-title {
        margin: 0 0 2px;
        font-size: 16px;
        font-weight: 400;
        color: #fbd298;
        display: flex;
        align-items: center;
        gap: 8px;

        span {
            font-family: "Candara", sans-serif;
            font-size: 12px;
            min-width: 20px;
            height: 20px;
            padding: 0 6px;
            border-radius: 10px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: rgba(251, 210, 152, 0.12);
        }
    }

    &__list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 6px;

        @media (max-width: 500px) {
            grid-template-columns: 1fr;
        }
    }

    &__empty {
        margin: 0;
        padding: 16px 0;
        text-align: center;
        font-family: "Candara", sans-serif;
        color: rgba(248, 248, 248, 0.6);
    }
}

.pv-item {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    padding: 10px 12px;
    background: rgba(250, 250, 250, 0.04);
    border-left: 2px solid rgba(251, 210, 152, 0.6);
    border-radius: 0 5px 5px 0;

    &__avatar {
        flex-shrink: 0;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        border: 2px solid rgba(251, 210, 152, 0.55);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        line-height: 1;
        color: #fbd298;
    }

    &__name {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 15px;
        color: #f8f8f8;
    }

    &__me {
        flex-shrink: 0;
        padding: 2px 8px;
        border-radius: 10px;
        font-family: "Candara", sans-serif;
        font-size: 11px;
        color: #AEE961;
        background: rgba(174, 233, 97, 0.12);
    }

    &__position {
        flex-shrink: 0;
        font-family: "Candara", sans-serif;
        font-size: 12px;
        color: rgba(248, 248, 248, 0.35);
    }

    &--me {
        background: rgba(174, 233, 97, 0.05);
        border-left-color: #AEE961;

        .pv-item__avatar {
            border: none;
            background: #AEE961;
            color: #111;
            font-weight: 700;
        }
    }
}

.pv-fade-enter-active,
.pv-fade-leave-active {
    transition: opacity 0.2s ease;

    .pv { transition: transform 0.2s ease; }
}

.pv-fade-enter-from,
.pv-fade-leave-to {
    opacity: 0;

    .pv { transform: translateY(12px) scale(0.98); }
}
</style>
