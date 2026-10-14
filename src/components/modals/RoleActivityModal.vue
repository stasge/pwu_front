<script setup lang='ts'>
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import type { ActivityProgress, ActivityRole } from '@/models/activity';
import { isActivityDone, roleSummary } from '@/composables/useUserActivity';

const showed = ref(false)
const role = ref<ActivityRole | null>(null)
const accountName = ref('')

function showDia(r: ActivityRole, account = '') {
    role.value = r
    accountName.value = account
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

const summary = computed(() => role.value ? roleSummary(role.value) : null)

const pending = computed(() => role.value?.progress.filter(p => p.available && !isActivityDone(p)) ?? [])
const done = computed(() => role.value?.progress.filter(p => p.available && isActivityDone(p)) ?? [])
const locked = computed(() => role.value?.progress.filter(p => !p.available) ?? [])

const status = computed(() => {
    if (!role.value || !summary.value) return 'empty'
    if (role.value.complete) return 'reward'
    if (!summary.value.total) return 'empty'
    if (summary.value.done === summary.value.total) return 'done'
    return 'progress'
})

const statusText = computed(() => ({
    reward: 'Нагороду отримано',
    done: 'Усе виконано',
    progress: 'В процесі',
    empty: 'Немає активностей',
})[status.value])

const RING_RADIUS = 34
const RING_LENGTH = 2 * Math.PI * RING_RADIUS

const percent = (p: ActivityProgress) => p.required > 0 ? Math.min(100, Math.round((p.completed / p.required) * 100)) : 0
</script>
<template>
    <Teleport to="body">
        <Transition name="ra-fade">
            <div v-if="showed && role && summary" class="ra-mask" @click.self="close">
                <div class="ra" :class="`ra--${status}`" role="dialog" aria-modal="true" :aria-label="`Активність ${role.name}`">
                    <div class="ra__corner ra__corner--top-left"></div>
                    <div class="ra__corner ra__corner--top-right"></div>
                    <div class="ra__corner ra__corner--bottom-left"></div>
                    <div class="ra__corner ra__corner--bottom-right"></div>

                    <button type="button" class="ra__close" aria-label="Закрити" @click="close">
                        <i class="pi pi-times"></i>
                    </button>

                    <div class="ra__head">
                        <span class="ra__ring">
                            <svg viewBox="0 0 80 80" width="80" height="80">
                                <circle class="ra__ring-bg" cx="40" cy="40" :r="RING_RADIUS" />
                                <circle
                                    class="ra__ring-fill"
                                    cx="40" cy="40" :r="RING_RADIUS"
                                    :stroke-dasharray="RING_LENGTH"
                                    :stroke-dashoffset="RING_LENGTH * (1 - summary.percent / 100)"
                                />
                            </svg>
                            <span class="ra__ring-text">
                                <i v-if="status === 'reward'" class="pi pi-gift"></i>
                                <i v-else-if="status === 'done'" class="pi pi-check"></i>
                                <i v-else-if="status === 'empty'" class="pi pi-lock"></i>
                                <template v-else>{{ summary.percent }}%</template>
                            </span>
                        </span>
                        <div class="ra__head-info">
                            <h2 class="ra__name">{{ role.name }}</h2>
                            <p class="ra__sub">
                                {{ role.lvl }} рівень<template v-if="accountName"> · {{ accountName }}</template>
                            </p>
                            <span class="ra__badge">{{ statusText }}</span>
                        </div>
                    </div>

                    <div class="ra__stats">
                        <div class="ra__stat">
                            <span class="ra__stat-label">Очки</span>
                            <span class="ra__stat-value">{{ summary.points }}<small>/{{ summary.maxPoints }}</small></span>
                        </div>
                        <div class="ra__stat">
                            <span class="ra__stat-label">Виконано</span>
                            <span class="ra__stat-value">{{ summary.done }}<small>/{{ summary.total }}</small></span>
                        </div>
                        <div class="ra__stat">
                            <span class="ra__stat-label">Недоступно</span>
                            <span class="ra__stat-value">{{ locked.length }}</span>
                        </div>
                    </div>

                    <div class="ra__divider"></div>

                    <div class="ra__body">
                        <p v-if="!role.progress.length" class="ra__empty">
                            Для цього персонажа поки немає доступних активностей.
                        </p>

                        <section v-if="pending.length" class="ra__section">
                            <h3 class="ra__section-title">Ще не виконано <span>{{ pending.length }}</span></h3>
                            <ul class="ra__list">
                                <li v-for="item in pending" :key="item.name" class="ra-item">
                                    <span class="ra-item__icon"></span>
                                    <div class="ra-item__body">
                                        <div class="ra-item__top">
                                            <span class="ra-item__name">{{ item.name }}</span>
                                            <span class="ra-item__count">{{ item.completed }}/{{ item.required }}</span>
                                        </div>
                                        <div class="ra-bar">
                                            <span class="ra-bar__fill" :style="{ width: percent(item) + '%' }"></span>
                                        </div>
                                    </div>
                                    <span class="ra-item__points">{{ item.points }}/{{ item.maxPoints }} оч.</span>
                                </li>
                            </ul>
                        </section>

                        <section v-if="done.length" class="ra__section">
                            <h3 class="ra__section-title ra__section-title--done">Виконано <span>{{ done.length }}</span></h3>
                            <ul class="ra__list">
                                <li v-for="item in done" :key="item.name" class="ra-item ra-item--done">
                                    <span class="ra-item__icon"><i class="pi pi-check"></i></span>
                                    <div class="ra-item__body">
                                        <div class="ra-item__top">
                                            <span class="ra-item__name">{{ item.name }}</span>
                                            <span class="ra-item__count">{{ item.completed }}/{{ item.required }}</span>
                                        </div>
                                    </div>
                                    <span class="ra-item__points">{{ item.points }}/{{ item.maxPoints }} оч.</span>
                                </li>
                            </ul>
                        </section>

                        <section v-if="locked.length" class="ra__section">
                            <h3 class="ra__section-title ra__section-title--locked">Недоступно <span>{{ locked.length }}</span></h3>
                            <ul class="ra__list">
                                <li v-for="item in locked" :key="item.name" class="ra-item ra-item--locked">
                                    <span class="ra-item__icon"><i class="pi pi-lock"></i></span>
                                    <div class="ra-item__body">
                                        <span class="ra-item__name">{{ item.name }}</span>
                                        <span class="ra-item__hint">Доступно з {{ item.minLevel }} рівня</span>
                                    </div>
                                    <span class="ra-item__points">{{ item.maxPoints }} оч.</span>
                                </li>
                            </ul>
                        </section>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
<style scoped lang='scss'>
.ra-mask {
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

.ra {
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

    &--done,
    &--reward {
        --accent: #AEE961;
        --accent-soft: rgba(174, 233, 97, 0.1);
    }

    &--empty {
        --accent: rgba(248, 248, 248, 0.5);
        --accent-soft: rgba(248, 248, 248, 0.05);
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
    }

    &__ring {
        position: relative;
        flex-shrink: 0;
        width: 80px;
        height: 80px;

        svg { transform: rotate(-90deg); }
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

        i { font-size: 24px; }
    }

    &__head-info {
        min-width: 0;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
    }

    &__name {
        margin: 0;
        font-size: clamp(24px, 4vw, 32px);
        font-weight: 400;
        line-height: 1.1;
        letter-spacing: -0.05em;
        overflow-wrap: anywhere;
        background: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    &__sub {
        margin: 0;
        font-family: "Candara", sans-serif;
        font-size: 14px;
        color: rgba(248, 248, 248, 0.5);
    }

    &__badge {
        margin-top: 4px;
        padding: 3px 10px;
        border-radius: 12px;
        font-family: "Candara", sans-serif;
        font-size: 12px;
        color: var(--accent);
        background: var(--accent-soft);
        border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
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

    &__body {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 20px;
        padding-right: 6px;
        margin-right: -6px;

        &::-webkit-scrollbar { width: 4px; }
        &::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.4); border-radius: 4px; }
        &::-webkit-scrollbar-thumb { background: rgba(251, 210, 152, 0.5); border-radius: 4px; }
    }

    &__empty {
        margin: 0;
        padding: 10px 0;
        text-align: center;
        font-family: "Candara", sans-serif;
        color: rgba(248, 248, 248, 0.6);
    }

    &__section {
        display: flex;
        flex-direction: column;
        gap: 8px;
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

        &--done {
            color: #AEE961;
            span { background: rgba(174, 233, 97, 0.12); }
        }

        &--locked {
            color: rgba(248, 248, 248, 0.45);
            span { background: rgba(248, 248, 248, 0.08); }
        }
    }

    &__list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 6px;
    }
}

.ra-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 14px;
    background: rgba(250, 250, 250, 0.04);
    border-left: 2px solid rgba(251, 210, 152, 0.6);
    border-radius: 0 5px 5px 0;

    &__icon {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid rgba(251, 210, 152, 0.55);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
    }

    &__body {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    &__top {
        display: flex;
        justify-content: space-between;
        gap: 10px;
    }

    &__name {
        font-size: 16px;
        color: #f8f8f8;
    }

    &__count,
    &__hint {
        font-family: "Candara", sans-serif;
        font-size: 13px;
        color: rgba(248, 248, 248, 0.5);
    }

    &__points {
        flex-shrink: 0;
        font-family: "Candara", sans-serif;
        font-size: 13px;
        color: #fbd298;
        white-space: nowrap;
    }

    &--done {
        background: rgba(174, 233, 97, 0.05);
        border-left-color: #AEE961;

        .ra-item__icon {
            border: none;
            background: #AEE961;
            color: #111;
            font-weight: 700;
        }

        .ra-item__name { color: rgba(248, 248, 248, 0.75); }
        .ra-item__points { color: #AEE961; }
    }

    &--locked {
        opacity: 0.5;
        border-left-color: rgba(248, 248, 248, 0.25);

        .ra-item__icon {
            border: none;
            background: rgba(248, 248, 248, 0.1);
            color: rgba(248, 248, 248, 0.7);
        }

        .ra-item__points { color: rgba(248, 248, 248, 0.5); }
    }
}

.ra-bar {
    position: relative;
    height: 4px;
    border-radius: 2px;
    background: rgba(248, 248, 248, 0.08);
    overflow: hidden;

    &__fill {
        position: absolute;
        inset: 0 auto 0 0;
        border-radius: inherit;
        background: linear-gradient(90deg, #e26f0f 0%, #fbd298 100%);
        transition: width 0.4s ease;
    }
}

.ra-fade-enter-active,
.ra-fade-leave-active {
    transition: opacity 0.2s ease;

    .ra { transition: transform 0.2s ease; }
}

.ra-fade-enter-from,
.ra-fade-leave-to {
    opacity: 0;

    .ra { transform: translateY(12px) scale(0.98); }
}
</style>
