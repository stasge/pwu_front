<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { getCalendarElapsed, ukPlural } from '@/utils/dateUtils';

const serverStartDate = new Date(2025, 4, 23, 19, 0, 0);
const now = ref(new Date());
let timerId: number | undefined;

const updateNow = () => {
    now.value = new Date();
};

onMounted(() => {
    updateNow();
    timerId = window.setInterval(updateNow, 1000 * 30);
});

onUnmounted(() => {
    if (timerId !== undefined) {
        window.clearInterval(timerId);
    }
});

const elapsedParts = computed(() => {
    const elapsed = getCalendarElapsed(serverStartDate, now.value);

    if (elapsed.years > 0) {
        return [
            { value: String(elapsed.years), label: ukPlural(elapsed.years, 'рік', 'роки', 'років') },
            { value: String(elapsed.months), label: ukPlural(elapsed.months, 'місяць', 'місяці', 'місяців') },
            { value: String(elapsed.days), label: ukPlural(elapsed.days, 'день', 'дні', 'днів') },
        ];
    }

    const diffMs = Math.max(0, now.value.getTime() - serverStartDate.getTime());
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const totalDays = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;

    return [
        { value: String(totalDays), label: ukPlural(totalDays, 'день', 'дні', 'днів') },
        { value: String(hours).padStart(2, '0'), label: ukPlural(hours, 'година', 'години', 'годин') },
        { value: String(minutes).padStart(2, '0'), label: ukPlural(minutes, 'хвилина', 'хвилини', 'хвилин') },
    ];
});
</script>

<template>
    <section class="server-lifetime">
        <img src="@/assets/images/Corner-TL.svg" alt="" class="corner corner-tl" />
        <img src="@/assets/images/Corner-TR.svg" alt="" class="corner corner-tr" />
        <img src="@/assets/images/Corner-BL.svg" alt="" class="corner corner-bl" />
        <img src="@/assets/images/Corner-BR.svg" alt="" class="corner corner-br" />

        <p class="lifetime-title">Разом з вами створюємо історію сервера уже:</p>

        <div class="time-list" aria-label="Час існування сервера">
            <div v-for="(part, index) in elapsedParts" :key="part.label" class="time-group">
                <div class="time-item">
                    <span class="time-value">{{ part.value }}</span>
                    <span class="time-label">{{ part.label }}</span>
                </div>
                <span v-if="index < elapsedParts.length - 1" class="time-separator">:</span>
            </div>
        </div>
    </section>
</template>

<style scoped lang="scss">
.server-lifetime {
    position: relative;
    width: 100%;
    max-width: 1080px;
    min-height: 130px;
    border-radius: 5px;
    padding: 20px;
    margin: 0 auto 45px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 30px;
    backdrop-filter: blur(40px);
    -webkit-backdrop-filter: blur(40px);
    box-shadow: 0 0 30px 0 rgba(248, 248, 248, 0.15);
    background: rgba(250, 250, 250, 0.1);
}

.corner {
    position: absolute;
    width: 20px;
    height: 20px;
    pointer-events: none;
}

.corner-tl {
    top: -1px;
    left: -1px;
}

.corner-tr {
    top: -1px;
    right: -1px;
}

.corner-bl {
    bottom: -1px;
    left: -1px;
}

.corner-br {
    bottom: -1px;
    right: -1px;
}

.lifetime-title {
    max-width: 460px;
    font-family: "VollkornSC", sans-serif;
    font-weight: 400;
    font-size: clamp(18px, 3vw, 32px);
    line-height: 1;
    letter-spacing: -0.04em;
    text-align: center;
    color: #f8f8f8;
}

.time-list {
    display: flex;
    align-items: center;
    gap: 12px;
}

.time-group {
    display: flex;
    align-items: center;
    gap: 12px;
}

.time-item {
    min-width: 140px;
    background: rgba(10, 10, 10, 0.3);
    border-radius: 20px;
    padding: 25px 10px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.time-value {
    font-family: "VollkornSC", sans-serif;
    font-weight: 400;
    font-size: clamp(36px, 5vw, 64px);
    line-height: 0.6;
    letter-spacing: -0.04em;
    text-align: center;
    background: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.time-label {
    font-family: "VollkornSC", sans-serif;
    font-weight: 400;
    font-size: clamp(16px, 2vw, 20px);
    line-height: 1;
    letter-spacing: -0.07em;
    text-align: center;
    background: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.time-separator {
    font-family: "VollkornSC", sans-serif;
    font-weight: 400;
    font-size: 52px;
    line-height: 1;
    color: #f8f8f8;
    transform: translateY(-8px);
}

@media (max-width: 1100px) {
    .server-lifetime {
        margin-bottom: 32px;
    }

    .time-item {
        min-width: 120px;
    }
}

@media (max-width: 768px) {
    .server-lifetime {
        margin-top: 40px;
        margin-bottom: 0;
        padding: 15px 10px 10px 10px;
        min-height: auto;
        gap: 16px;
        flex-direction: column;
        justify-content: center;
        box-shadow: 0 0 10px 0 rgba(248, 248, 248, 0.15);
    }

    .lifetime-title {
        max-width: 100%;
    }

    .time-list {
        gap: 8px;
    }

    .time-item {
        min-width: 94px;
        padding: 10px 8px 10px;
    }

    .time-separator {
        font-size: 42px;
        transform: translateY(-5px);
    }
}

@media (max-width: 480px) {
    .time-item {
        min-width: 82px;
        border-radius: 16px;
    }
}
</style>
