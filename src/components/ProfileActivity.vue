<script setup lang='ts'>
import { computed, onMounted, ref } from 'vue';
import RoleActivityModal from '@/components/modals/RoleActivityModal.vue';
import { roleSummary, useUserActivity } from '@/composables/useUserActivity';
import type { ActivityRole } from '@/models/activity';

const roleActivityModalRef = ref()
const { accounts, loading, loaded, error, accountNames, load } = useUserActivity()

onMounted(() => load())

const RING_RADIUS = 22
const RING_LENGTH = 2 * Math.PI * RING_RADIUS

const items = computed(() => accounts.value
    .filter(acc => acc.roles.length)
    .map(acc => ({
        id: acc.id,
        name: accountNames.value.get(acc.id) ?? `Акаунт #${acc.id}`,
        roles: acc.roles.map(role => ({ role, summary: roleSummary(role) })),
    })))

const totals = computed(() => {
    let done = 0
    let total = 0
    for (const acc of items.value) {
        for (const { summary } of acc.roles) {
            done += summary.done
            total += summary.total
        }
    }
    return { done, total }
})

const statusOf = (role: ActivityRole, summary: ReturnType<typeof roleSummary>) => {
    if (role.complete) return 'reward'
    if (!summary.total) return 'empty'
    if (summary.done === summary.total) return 'done'
    return 'progress'
}

const openRole = (role: ActivityRole, accountName: string) => {
    roleActivityModalRef.value.showDia(role, accountName)
}
</script>
<template>
    <div class="activity">
        <div class="activity__corner activity__corner--top-left"></div>
        <div class="activity__corner activity__corner--top-right"></div>
        <div class="activity__corner activity__corner--bottom-left"></div>
        <div class="activity__corner activity__corner--bottom-right"></div>

        <div class="activity__header">
            <div>
                <h2 class="activity__title">Щоденна активність</h2>
                <p class="activity__subtitle">
                    <template v-if="loaded && totals.total">Виконано {{ totals.done }} з {{ totals.total }} активностей сьогодні · </template>
                    Натисніть на персонажа, щоб побачити деталі
                </p>
            </div>
            <button
                class="activity__refresh"
                :class="{ 'activity__refresh--spinning': loading }"
                :disabled="loading"
                v-tooltip.top="'Оновити'"
                @click="load()"
            >
                <i class="pi pi-refresh"></i>
            </button>
        </div>

        <div v-if="loading && !loaded" class="activity__grid">
            <div v-for="n in 3" :key="n" class="role-card role-card--skeleton"></div>
        </div>

        <div v-else-if="error && !loaded" class="activity__state">
            <p class="activity__state-text activity__state-text--error">{{ error }}</p>
            <button class="fantasy-btn small thin" @click="load()"><span>Спробувати ще</span></button>
        </div>

        <div v-else-if="!items.length" class="activity__state">
            <p class="activity__state-text">Персонажів поки немає. Створіть персонажа в грі, щоб відстежувати активність.</p>
        </div>

        <div v-else class="activity__accounts" :class="{ 'activity__accounts--loading': loading }">
            <p v-if="error" class="activity__state-text activity__state-text--error">{{ error }}</p>
            <div v-for="acc in items" :key="acc.id" class="activity__account">
                <p class="activity__account-name">
                    <span>Акаунт:</span> {{ acc.name }}
                </p>
                <div class="activity__grid">
                    <button
                        v-for="{ role, summary } in acc.roles"
                        :key="role.id"
                        type="button"
                        class="role-card"
                        :class="`role-card--${statusOf(role, summary)}`"
                        @click="openRole(role, acc.name)"
                    >
                        <span class="role-card__ring">
                            <svg viewBox="0 0 52 52" width="52" height="52">
                                <circle class="role-card__ring-bg" cx="26" cy="26" :r="RING_RADIUS" />
                                <circle
                                    class="role-card__ring-fill"
                                    cx="26" cy="26" :r="RING_RADIUS"
                                    :stroke-dasharray="RING_LENGTH"
                                    :stroke-dashoffset="RING_LENGTH * (1 - summary.percent / 100)"
                                />
                            </svg>
                            <span class="role-card__ring-text">
                                <i v-if="statusOf(role, summary) === 'reward'" class="pi pi-gift"></i>
                                <i v-else-if="statusOf(role, summary) === 'done'" class="pi pi-check"></i>
                                <template v-else-if="summary.total">{{ summary.percent }}%</template>
                                <i v-else class="pi pi-lock"></i>
                            </span>
                        </span>
                        <span class="role-card__info">
                            <span class="role-card__name">{{ role.name }}</span>
                            <span class="role-card__lvl">{{ role.lvl }} рівень</span>
                            <span class="role-card__meta">
                                <template v-if="statusOf(role, summary) === 'reward'">Нагороду отримано</template>
                                <template v-else-if="summary.total">
                                    {{ summary.done }}/{{ summary.total }} · {{ summary.points }}/{{ summary.maxPoints }} оч.
                                </template>
                                <template v-else>Немає активностей</template>
                            </span>
                        </span>
                        <i class="pi pi-angle-right role-card__arrow"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
    <RoleActivityModal ref="roleActivityModalRef" />
</template>
<style scoped lang='scss'>
.activity {
    position: relative;
    width: 100%;
    padding: clamp(15px, 3vw, 30px);
    background: rgba(250, 250, 250, 0.05);
    border-radius: 5px;
    color: #fff;

    &__corner {
        position: absolute;
        width: 10px;
        height: 10px;
        background: url('@/assets/images/profile-corner.svg') no-repeat center / contain;
        z-index: 1;

        &--top-left { top: 0; left: 0; }
        &--top-right { top: 0; right: 0; transform: rotate(90deg); }
        &--bottom-left { bottom: 0; left: 0; transform: rotate(-90deg); }
        &--bottom-right { bottom: 0; right: 0; transform: rotate(180deg); }
    }

    &__header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 15px;
        margin-bottom: 20px;
    }

    &__title {
        margin: 0;
        font-size: 24px;
        font-weight: 400;
        color: #fff;
    }

    &__subtitle {
        margin: 6px 0 0;
        font-family: "Candara", sans-serif;
        font-size: 14px;
        color: rgba(248, 248, 248, 0.5);
    }

    &__refresh {
        flex-shrink: 0;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 1px solid rgba(251, 210, 152, 0.3);
        background: rgba(0, 0, 0, 0.3);
        color: #fbd298;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: border-color 0.2s ease, background 0.2s ease;

        &:hover:not(:disabled) {
            border-color: #fbd298;
            background: rgba(251, 210, 152, 0.1);
        }

        &:disabled { cursor: default; opacity: 0.7; }

        &--spinning i { animation: activity-spin 1s linear infinite; }
    }

    &__accounts {
        display: flex;
        flex-direction: column;
        gap: 24px;
        transition: opacity 0.2s ease;

        &--loading { opacity: 0.5; pointer-events: none; }
    }

    &__account-name {
        margin: 0 0 12px;
        font-size: 16px;
        color: #f8f8f8;

        span {
            font-family: "Candara", sans-serif;
            opacity: 0.5;
        }
    }

    &__grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 12px;
    }

    &__state {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        padding: 20px;
        text-align: center;
    }

    &__state-text {
        margin: 0;
        font-family: "Candara", sans-serif;
        font-size: 16px;
        color: rgba(255, 255, 255, 0.7);

        &--error { color: #ff6b6b; }
    }
}

.role-card {
    --accent: #fbd298;

    display: flex;
    align-items: center;
    gap: 14px;
    width: 100%;
    padding: 12px 14px;
    text-align: left;
    color: inherit;
    font: inherit;
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(250, 250, 250, 0.08);
    border-radius: 8px;
    cursor: pointer;
    transition: border-color 0.2s ease, transform 0.2s ease, background 0.2s ease;

    &:hover {
        border-color: rgba(251, 210, 152, 0.5);
        background: rgba(0, 0, 0, 0.55);
        transform: translateY(-2px);

        .role-card__arrow { opacity: 1; transform: translateX(2px); }
    }

    &--done,
    &--reward {
        --accent: #AEE961;
        border-color: rgba(174, 233, 97, 0.25);
    }

    &--empty {
        --accent: rgba(248, 248, 248, 0.4);
        opacity: 0.6;
    }

    &--skeleton {
        height: 78px;
        cursor: default;
        background: linear-gradient(90deg, rgba(0, 0, 0, 0.4) 0%, rgba(250, 250, 250, 0.06) 50%, rgba(0, 0, 0, 0.4) 100%);
        background-size: 200% 100%;
        animation: activity-shimmer 1.4s ease-in-out infinite;

        &:hover { transform: none; border-color: rgba(250, 250, 250, 0.08); }
    }

    &__ring {
        position: relative;
        flex-shrink: 0;
        width: 52px;
        height: 52px;

        svg { transform: rotate(-90deg); }
    }

    &__ring-bg {
        fill: none;
        stroke: rgba(248, 248, 248, 0.1);
        stroke-width: 4;
    }

    &__ring-fill {
        fill: none;
        stroke: var(--accent);
        stroke-width: 4;
        stroke-linecap: round;
        transition: stroke-dashoffset 0.6s ease;
    }

    &__ring-text {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: "Candara", sans-serif;
        font-size: 13px;
        color: var(--accent);

        i { font-size: 16px; }
    }

    &__info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    &__name {
        font-size: 17px;
        color: #f8f8f8;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    &__lvl,
    &__meta {
        font-family: "Candara", sans-serif;
        font-size: 13px;
    }

    &__lvl { color: rgba(248, 248, 248, 0.5); }

    &__meta { color: var(--accent); }

    &__arrow {
        color: rgba(248, 248, 248, 0.5);
        opacity: 0.5;
        transition: opacity 0.2s ease, transform 0.2s ease;
    }
}

@keyframes activity-spin {
    to { transform: rotate(360deg); }
}

@keyframes activity-shimmer {
    0% { background-position: 100% 0; }
    100% { background-position: -100% 0; }
}
</style>
