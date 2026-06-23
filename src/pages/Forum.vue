<script setup lang='ts'>
import ForumMainCat from '@/components/modals/forumMainCat.vue'
import ForumSubCat from '@/components/modals/forumSubCat.vue'
import ForumHeader from '@/components/ForumHeader.vue'
import Footer from '@/components/Footer.vue'


import {onMounted, ref} from 'vue'
import forumCard1 from '@/assets/images/forum-card-1.jpg'
import forumCard2 from '@/assets/images/forum-card-2.jpg'
import forumCard3 from '@/assets/images/forum-card-3.jpg'
import {useAsyncCallWrapper} from '@/composables/useAsyncCallWrapper'
import {fetchGet, fetchPost} from '@/utils/fetchApi'
import type { IForumCategory } from '@/models/forum';
import {useUserStore} from '@/stores/userStore'
import {useConfirmRemoval} from '@/composables/useConfirmRemoval'
import { truncateText } from '@/utils/text';

const {confirmRemoval} = useConfirmRemoval()
const {wrapAsyncCall} = useAsyncCallWrapper()
const categories = ref<IForumCategory[]>()
const userStore = useUserStore()
const forumMainCatRef = ref()
const forumSubCatRef = ref()

onMounted(async () => {
    wrapAsyncCall(async () => {
        await loadSections()
    })
})

const loadSections = async () => {
    const {data: _categories} = await fetchGet('/forum/getMain')
    const descriptions = [
        'Публікації від команди: зміни, оголошення, і загальна картина подій на сервері.',
        'Простір для гравців: обговорення, пропозиції, живий обмін досвідом між учасниками.',
        'Все про занурення в гру: практичні знання, досвід, підказки і історії з живого світу Perfect World.'
    ]
    
    categories.value = _categories?.map((category: IForumCategory, index: number) => ({
        ...category,
        desc: descriptions[index] || ''
    }))
}


const deleteMain = (id: number) => {
    wrapAsyncCall(async () => {
        await fetchPost('/forum/deleteMain', {id})
        await loadSections()
    })
}

const deleteSub = (id: number) => {
    wrapAsyncCall(async () => {
        await fetchPost('/forum/deleteSub', {id})
        await loadSections()
    })
}

const cardImages = [forumCard1, forumCard2, forumCard3]

const getCardImage = (index: number) => {
    return cardImages[index % 3]
}

</script>
<template>
    <div class="forum w-full">
        <ForumHeader />
        <div class="forum__inner">
            <div class="forum__container w-full">
                <div class="forum__cards flex gap-4">
                    <div 
                        v-for="(category, index) of categories" 
                        :key="category.id" 
                        class="forum__card"
                        :style="{ backgroundImage: `url(${getCardImage(index)})` }"
                    >
                        <div class="forum__card-content">
                            <h2 class="forum__card-title">{{ category.name }}</h2>
                            <p v-if="category.desc" class="forum__card-description">{{ category.desc }}</p>
                            <div class="forum__card-topics">
                                <RouterLink 
                                    v-for="t of category.topic" 
                                    :key="t.id"
                                    :to="{name: 'themes', params: {cat_id: category.id, sub_id: t.id}}" 
                                    class="forum__topic-item"
                                >
                                    <div class="forum__topic-corner forum__topic-corner--top-left"></div>
                                    <div class="forum__topic-corner forum__topic-corner--top-right"></div>
                                    <div class="forum__topic-corner forum__topic-corner--bottom-left"></div>
                                    <div class="forum__topic-corner forum__topic-corner--bottom-right"></div>
                                    <div class="forum__topic-content">
                                        <span class="forum__topic-name">{{ truncateText(t.name, 26) }}</span>
                                        <div class="forum__topic-stats">
                                            <span class="forum__topic-stat-badge">Теми: <span class="forum__topic-stat-badge-value">{{ t.themes }}</span></span>
                                            <span class="forum__topic-stat-badge">Повідомлення: <span class="forum__topic-stat-badge-value">{{ t.messages }}</span></span>
                                        </div>
                                    </div>
                                    <img src="@/assets/images/arrow-next.svg" alt="arrow" class="forum__topic-arrow">
                                </RouterLink>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <Footer />
    </div>
    <ForumMainCat ref="forumMainCatRef" @mainCatCreated="loadSections"/>
    <ForumSubCat ref="forumSubCatRef" @subCatCreated="loadSections"/>
    
</template>
<style scoped lang='scss'>
.forum {
    display: flex;
    flex-direction: column;
    color: #fff;
    min-height: 100vh;
    background: url('@/assets/images/forum-bg.jpg') no-repeat center / cover;
    padding-top: 120px;

    @media (max-width: 1024px) {
        padding-top: 100px;
    }

    @media (max-width: 768px) {
        padding-top: 90px;
        background: #000;
    }

    @media (max-width: 480px) {
        padding-top: 80px;
    }

    &__inner {
        padding: 40px clamp(20px, 5vw, 80px);
        flex: 1;

        @media (max-width: 768px) {
            padding: 24px clamp(16px, 4vw, 40px);
        }

        @media (max-width: 480px) {
            padding: 20px 0;
        }
    }

    &__container {
        max-width: 1400px;
        margin: 0 auto;
    }

    &__cards {
        display: flex;
        gap: 24px;
        flex-wrap: wrap;
        justify-content: center;

        @media (max-width: 1024px) {
            flex-direction: column;
            align-items: center;
            gap: 20px;
        }

        @media (max-width: 768px) {
            gap: 16px;
        }

        @media (max-width: 480px) {
            gap: 12px;
        }
    }

    &__card {
        flex: 1;
        min-height: 700px;
        height: auto;
        min-width: 425px;
        max-width: 425px;
        border-radius: 24px;
        overflow: hidden;
        position: relative;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;

        @media (max-width: 1024px) {
            width: 100%;
            max-width: 500px;
            min-width: unset;
            min-height: 600px;
        }

        @media (max-width: 768px) {
            max-width: 100%;
            min-height: 550px;
            border-radius: 20px;
        }

        @media (max-width: 480px) {
            min-height: 500px;
            border-radius: 16px;
        }
    }

    &__card-content {
        position: relative;
        padding: 30px;
        display: flex;
        flex-direction: column;

        @media (max-width: 768px) {
            padding: 24px;
        }

        @media (max-width: 480px) {
            padding: 20px;
        }
    }

    &__card-title {
        font-weight: 400;
        font-size: 40px;
        line-height: 100%;
        letter-spacing: -0.07em;
        background: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;

        @media (max-width: 768px) {
            font-size: 32px;
        }

        @media (max-width: 480px) {
            font-size: 28px;
        }
    }

    &__card-description {
        font-family: 'Candara', sans-serif;
        font-weight: 400;
        font-size: 16px;
        line-height: 150%;
        color: #f8f8f8;
        margin-bottom: 24px;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);

        @media (max-width: 768px) {
            font-size: 15px;
            margin-bottom: 20px;
        }

        @media (max-width: 480px) {
            font-size: 14px;
            margin-bottom: 16px;
        }
    }

    &__card-topics {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-top: auto;

        @media (max-width: 480px) {
            gap: 10px;
        }
    }

    &__topic-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
        backdrop-filter: blur(64px);
        background: rgba(250, 250, 250, 0.05);
        border-radius: 8px;
        text-decoration: none;
        transition: all 0.3s ease;
        position: relative;

        &:hover {
            background: rgba(250, 250, 250, 0.1);
        }

        @media (max-width: 768px) {
            padding: 14px;
        }

        @media (max-width: 480px) {
            padding: 12px;
            border-radius: 6px;
        }
    }

    &__topic-corner {
        position: absolute;
        width: 10px;
        height: 10px;
        background-image: url('@/assets/images/profile-corner.svg');
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        z-index: 1;
        pointer-events: none;

        &--top-left {
            top: 0;
            left: 0;
            transform: rotate(0deg);
        }

        &--top-right {
            top: 0;
            right: 0;
            transform: rotate(90deg);
        }

        &--bottom-left {
            bottom: 0;
            left: 0;
            transform: rotate(-90deg);
        }

        &--bottom-right {
            bottom: 0;
            right: 0;
            transform: rotate(180deg);
        }
    }

    &__topic-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;

        @media (max-width: 480px) {
            gap: 6px;
        }
    }

    &__topic-name {
        text-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.25);
        font-weight: 400;
        font-size: 20px;
        line-height: 100%;
        letter-spacing: -0.04em;
        color: #f8f8f8;

        @media (max-width: 768px) {
            font-size: 18px;
        }

        @media (max-width: 480px) {
            font-size: 16px;
        }
    }

    &__topic-stats {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;

        @media (max-width: 480px) {
            gap: 8px;
        }
    }

    &__topic-stat-badge {
        display: inline-block;
        border-radius: 30px;
        padding: 5px 10px;
        background: rgba(0, 0, 0, 0.4);
        font-size: 12px;
        color: rgba(200, 200, 200, 0.9);
        font-weight: 400;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(4px);

        @media (max-width: 480px) {
            font-size: 11px;
            padding: 4px 8px;
        }
    }

    &__topic-arrow {
        width: 20px;
        height: 20px;
        opacity: 0.7;
        transition: opacity 0.3s ease, transform 0.3s ease;
        flex-shrink: 0;

        @media (max-width: 480px) {
            width: 18px;
            height: 18px;
        }
    }

    &__topic-item:hover &__topic-arrow {
        opacity: 1;
        transform: translateX(3px);
    }

    &__topic-stat-badge-value {
        font-size: 14px;
        color: #f8f8f8;

        @media (max-width: 480px) {
            font-size: 12px;
        }
    }
}

:deep(.footer) {
    background: transparent !important;
}

</style>