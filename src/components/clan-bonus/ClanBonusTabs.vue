<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import ClanCashback from '@/components/clan-bonus/ClanCashback.vue';
import ClanTransfer from '@/components/clan-bonus/ClanTransfer.vue';
import LumaVideo from '@/components/base/LumaVideo.vue';
import flamesVideo from '@/assets/video/Flames_Backdrop.mp4';
import tabCashback from '@/assets/images/clan-bonus/tab-cashback.png';
import tabCashbackHover from '@/assets/images/clan-bonus/tab-cashback-hover.png';
import tabTransfer from '@/assets/images/clan-bonus/tab-transfer.png';
import tabTransferHover from '@/assets/images/clan-bonus/tab-transfer-hover.png';

type PanelId = 'cashback' | 'transfer'

const tabs = [
    { id: 'cashback', title: 'Клановий кешбек', img: tabCashback, imgHover: tabCashbackHover, component: ClanCashback },
    { id: 'transfer', title: 'Бонус за перехід клану', img: tabTransfer, imgHover: tabTransferHover, component: ClanTransfer },
] as const

const opened = ref<PanelId | null>(null)
const activeTab = computed(() => tabs.find(tab => tab.id === opened.value))

const open = (id: PanelId) => {
    opened.value = id
}

const close = () => {
    opened.value = null
}

const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close()
}

const setScrollLock = (locked: boolean) => {
    // без цього зникає скролбар, сторінка стає ширшою і hero-відео смикається
    document.documentElement.style.scrollbarGutter = locked ? 'stable' : ''
    document.documentElement.classList.toggle('overflow-hidden', locked)
    document.body.classList.toggle('overflow-hidden', locked)
    document.body.classList.toggle('clan-drawer-open', locked)
}

watch(opened, (value) => {
    setScrollLock(!!value)
    if (value) {
        window.addEventListener('keydown', onKeydown)
    } else {
        window.removeEventListener('keydown', onKeydown)
    }
})

onBeforeUnmount(() => {
    setScrollLock(false)
    window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
    <div class="clan-tabs">
        <svg width="0" height="0" style="position: absolute">
            <filter id="clan-tabs-black-to-alpha" color-interpolation-filters="sRGB">
                <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  1.2 1.2 1.2 0 0" />
            </filter>
        </svg>
        <LumaVideo class="clan-tabs__flames" :src="flamesVideo" />
        <button v-for="tab in tabs" :key="tab.id" class="clan-tabs__tab" :aria-label="tab.title" @click="open(tab.id)">
            <img :src="tab.img" alt="" class="clan-tabs__tab-img">
            <img :src="tab.imgHover" alt="" class="clan-tabs__tab-img clan-tabs__tab-img--hover">
        </button>
    </div>

    <Teleport to="body">
        <Transition name="clan-drawer-fade">
            <div v-if="activeTab" class="clan-drawer-mask" @click="close"></div>
        </Transition>
        <Transition name="clan-drawer-slide">
            <aside v-if="activeTab" class="clan-drawer" role="dialog" aria-modal="true" :aria-label="activeTab.title">
                <div class="clan-drawer__header">
                    <span class="clan-drawer__header-title">{{ activeTab.title }}</span>
                    <button class="clan-drawer__close" aria-label="Закрити" @click="close">
                        <img src="@/assets/images/burger-icon-close.svg" alt="">
                    </button>
                </div>
                <div class="clan-drawer__body">
                    <component :is="activeTab.component" />
                </div>
            </aside>
        </Transition>
    </Teleport>
</template>

<style scoped lang="scss">
.clan-tabs {
    position: fixed;
    top: 19dvh;
    right: 0;
    z-index: 90;
    display: flex;
    flex-direction: column;
    gap: 8px;

    @media (max-width: 768px) {
        top: 15dvh;
        gap: 6px;
    }

    /* вогонь центрований між табами; mp4 без альфи — чорний фон прибирає svg-фільтр
       (screen не спрацює: fixed-контейнер ізолює змішування) */
    &__flames {
        position: absolute;
        top: 50%;
        right: -7dvw;
        z-index: -1;
        height: clamp(320px, 55vw, 800px);
        width: auto;
        transform: translateY(-50%);
        pointer-events: none;
        filter: url(#clan-tabs-black-to-alpha);

        /* мобільні: альфу вже порахував LumaVideo у canvas */
        &.luma-canvas {
            filter: none;
        }
    }

    &__tab {
        position: relative;
        display: block;
        width: 101px;
        padding: 0;
        border: none;
        background: none;
        transform: translateX(15px);
        transition: transform 0.2s ease;

        &:hover {
            transform: translateX(0);

            .clan-tabs__tab-img--hover {
                opacity: 1;
            }
        }

        @media (max-width: 768px) {
            width: 68px;
        }
    }

    &__tab-img {
        display: block;
        width: 100%;
        height: auto;

        &--hover {
            position: absolute;
            inset: 0;
            opacity: 0;
            transition: opacity 0.2s ease;
        }
    }
}

.clan-drawer-mask {
    position: fixed;
    inset: 0;
    z-index: 1100;
    background: rgba(9, 9, 9, 0.5);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
}

.clan-drawer {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 1101;
    width: 500px;
    max-width: 100%;
    display: flex;
    flex-direction: column;
    background: #0a0a0a;
    border-left: 1px solid rgba(248, 248, 248, 0.15);
    color: #f8f8f8;

    @media (max-width: 768px) {
        width: 100%;
        border-left: none;
    }

    &__header {
        display: none;

        @media (max-width: 768px) {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-shrink: 0;
            height: 56px;
            padding: 0 16px 0 20px;
            border-bottom: 1px solid rgba(248, 248, 248, 0.15);
        }
    }

    &__header-title {
        font-family: "VollkornSC", sans-serif;
        font-size: 18px;
        letter-spacing: -0.04em;
    }

    &__close {
        display: flex;
        padding: 0;
        border: none;
        background: none;

        img {
            width: 36px;
            height: 36px;
        }
    }

    &__body {
        flex: 1;
        overflow-y: auto;
        overscroll-behavior: contain;
    }
}

.clan-drawer-fade-enter-active,
.clan-drawer-fade-leave-active {
    transition: opacity 0.3s ease;
}

.clan-drawer-fade-enter-from,
.clan-drawer-fade-leave-to {
    opacity: 0;
}

.clan-drawer-slide-enter-active,
.clan-drawer-slide-leave-active {
    transition: transform 0.3s ease;
}

.clan-drawer-slide-enter-from,
.clan-drawer-slide-leave-to {
    transform: translateX(100%);
}
</style>

<style lang="scss">
/* чат підтримки (z-index 9999) перекриває сайдбар */
body.clan-drawer-open .support-chat-icon-container {
    display: none;
}
</style>
