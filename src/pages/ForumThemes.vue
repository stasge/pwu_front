<script setup lang='ts'>
import ForumHeader from '@/components/ForumHeader.vue';
import ForumSubCat from '@/components/modals/forumSubCat.vue';
import Footer from '@/components/Footer.vue';
import ForumSideCard from '@/components/ForumSideCard.vue';
import ForumThemesTable from '@/components/ForumThemesTable.vue';

import { onMounted, onBeforeUnmount, ref, computed, watch } from 'vue';
import { useAsyncCallWrapper } from '@/composables/useAsyncCallWrapper';
import { fetchGet, fetchPost } from '@/utils/fetchApi';
import type { IForumCategory, IForumSubCategory, IForumTheme } from '@/models/forum';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { useConfirmRemoval } from '@/composables/useConfirmRemoval';
import forumSideCard1 from '@/assets/images/forum-side-card-1.png'
import forumSideCard2 from '@/assets/images/forum-side-card-2.png'
import forumSideCard3 from '@/assets/images/forum-side-card-3.png'

const { confirmRemoval } = useConfirmRemoval();
const { wrapAsyncCall } = useAsyncCallWrapper();
const route = useRoute();
const router = useRouter();

const userStore = useUserStore();

const themes = ref<IForumTheme[]>([]);
const subCategory = ref<IForumSubCategory>();
const category = ref<IForumCategory>();
const total = ref(0);
const currentPage = ref(1);
const rowsPerPage = ref(6);
const forumSubCatRef = ref<InstanceType<typeof ForumSubCat> | null>(null);
const isHeaderActionsMenuOpen = ref(false)

const sideCardsByCategoryId: Record<number, { image: string; title: string; description: string }> = {
    1: {
        image: forumSideCard1,
        title: 'Офіційний розділ',
        description: 'Публікації від команди: зміни, оголошення, і загальна картина подій на сервері.'
    },
    2: {
        image: forumSideCard2,
        title: 'Розділ спільноти',
        description: 'Простір для гравців: обговорення, пропозиції, живий обмін досвідом між учасниками.'
    },
    3: {
        image: forumSideCard3,
        title: 'Ігровий розділ',
        description: 'Все про занурення в гру: практичні знання, досвід, підказки і історії з живого світу Perfect World.'
    },
}

const currentSideCard = computed(() => {
    const categoryId = Number(route.params.cat_id)
    return sideCardsByCategoryId[categoryId] || sideCardsByCategoryId[1]
})
const currentMobileSlide = ref(0)
const mobileSideCards = computed(() => [currentSideCard.value])

const mostActiveTheme = computed(() => {
    if (!themes.value.length) return null
    return themes.value.reduce((prev, current) => 
        (current.messages_count > prev.messages_count) ? current : prev
    )
})

const lastActivityTheme = computed(() => {
    if (!themes.value.length) return null
    return themes.value.reduce((prev, current) => {
        const prevDate = new Date(prev.edited_at || prev.created_at)
        const currentDate = new Date(current.edited_at || current.created_at)
        return currentDate > prevDate ? current : prev
    })
})

const totalPages = computed(() => {
    return Math.ceil(total.value / rowsPerPage.value)
})

const visiblePages = computed(() => {
    const pages: (number | string)[] = []
    const total = totalPages.value
    const current = currentPage.value
    
    if (total <= 7) {
        // Якщо сторінок мало - показуємо всі
        for (let i = 1; i <= total; i++) {
            pages.push(i)
        }
    } else {
        // Завжди показуємо першу сторінку
        pages.push(1)
        
        if (current <= 4) {
            // Поточна сторінка біля початку
            for (let i = 2; i <= 5; i++) {
                pages.push(i)
            }
            pages.push('...')
            pages.push(total)
        } else if (current >= total - 3) {
            // Поточна сторінка біля кінця
            pages.push('...')
            for (let i = total - 4; i <= total; i++) {
                pages.push(i)
            }
        } else {
            // Поточна сторінка в середині
            pages.push('...')
            pages.push(current - 1)
            pages.push(current)
            pages.push(current + 1)
            pages.push('...')
            pages.push(total)
        }
    }
    
    return pages
})

const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
        wrapAsyncCall(() => loadThemes(page, rowsPerPage.value))
    }
}

const goToPreviousPage = () => {
    if (currentPage.value > 1) {
        goToPage(currentPage.value - 1)
    }
}

const goToNextPage = () => {
    if (currentPage.value < totalPages.value) {
        goToPage(currentPage.value + 1)
    }
}


const canCreateTheme = computed(() => {
    // Для адмінів - завжди можна створювати
    if (userStore.isAdmin) return true
    // Для звичайних користувачів - можна створювати у всіх розділах окрім закритих (type === 1)
    if (!userStore.isLoggedIn) return false
    if (subCategory.value?.type === 1) return false // Закриті розділи
    return true
})

const syncQueryWithPagination = () => {
    router.replace({
        query: {
            ...route.query,
            page: currentPage.value,
            limit: rowsPerPage.value,
        },
    });
};

const loadThemes = async (page = 1, rowsPerPage = 6) => {
    const { data } = await fetchPost('/forum/getThemes', { id_main: +route.params.sub_id, page, limit: rowsPerPage });
    const { data: _subCategories } = await fetchPost('/forum/getSub', { id_main: +route.params.cat_id });
    const { data: _categories } = await fetchGet('/forum/getMain');
    themes.value = data.themes;
    total.value = data.total;
    subCategory.value = _subCategories.find((s: IForumSubCategory) => s.id === +route.params.sub_id);
    category.value = _categories.find((cat: IForumCategory) => cat.id === +route.params.cat_id);
    syncQueryWithPagination();
};


const deleteTheme = (id: number) => {
    wrapAsyncCall(async () => {
        await fetchPost('/forum/deleteTheme', { id });
        await loadThemes(currentPage.value, rowsPerPage.value);
    });
};

const goToEditTheme = (themeIdMain: number, themeId: number) => {
    router.push({ name: 'theme-creation', params: { id_main: themeIdMain, id: themeId } })
}

const onDeleteTheme = (event: MouseEvent, themeId: number) => {
    confirmRemoval(event, themeId, 'Ви впевнені, що хочете видалити цю тему?', deleteTheme)
}

const openSubCategoryEdit = () => {
    isHeaderActionsMenuOpen.value = false
    forumSubCatRef.value?.showDia(subCategory.value || null, +route.params.sub_id)
}

const openCreateTheme = () => {
    isHeaderActionsMenuOpen.value = false
    router.push({ name: 'theme-creation', params: { id_main: +route.params.sub_id } })
}

const toggleHeaderActionsMenu = () => {
    isHeaderActionsMenuOpen.value = !isHeaderActionsMenuOpen.value
}

const closeHeaderActionsMenu = () => {
    isHeaderActionsMenuOpen.value = false
}

const goToMobileSlide = (index: number) => {
    currentMobileSlide.value = index
}

onMounted(() => {
    // Встановлюємо значення з query при завантаженні
    if (route.query.page) currentPage.value = +route.query.page;
    if (route.query.limit) rowsPerPage.value = +route.query.limit;
    wrapAsyncCall(() => loadThemes(currentPage.value, rowsPerPage.value));
    document.addEventListener('click', closeHeaderActionsMenu)
});

onBeforeUnmount(() => {
    document.removeEventListener('click', closeHeaderActionsMenu)
})

watch(mobileSideCards, () => {
    currentMobileSlide.value = 0
})
</script>

<template>
    <div class="forum-themes w-full">
        <ForumHeader />
        <div class="forum-themes__inner">
            <div class="forum-themes__container">

                <!-- Main Content -->
                <div class="forum-themes__content">
                    <!-- Left Column - Themes List -->
                    <div class="forum-themes__main w-full">
                        <!-- Section Header -->
                        <div class="forum-themes__section-header">
                            <div class="forum-themes__corner forum-themes__corner--top-left"></div>
                            <div class="forum-themes__corner forum-themes__corner--top-right"></div>
                            <div class="forum-themes__corner forum-themes__corner--bottom-left"></div>
                            <div class="forum-themes__corner forum-themes__corner--bottom-right"></div>
                            <div class="forum-themes__section-title">
                                <h1>{{ subCategory?.name }}</h1>
                                <div class="forum-themes__section-stats">
                                    <span class="forum-themes__section-stats-item">Теми: <span class="forum-themes__section-stats-value">{{ subCategory?.themes || 0 }}</span></span>
                                    <span class="forum-themes__section-stats-item">Повідомлення: <span class="forum-themes__section-stats-value">{{ subCategory?.messages || 0 }}</span></span>
                                </div>
                            </div>
                            <div class="forum-themes__header-actions">
                                <button
                                    v-if="userStore.isAdmin"
                                    @click="openSubCategoryEdit"
                                    class="forum-themes__create-btn"
                                >
                                    <img src="@/assets/icons/forum-edit.svg" alt="edit" class="forum-themes__create-btn-icon">
                                </button>
                                <button
                                    v-if="canCreateTheme"
                                    @click="openCreateTheme"
                                    class="forum-themes__create-btn"
                                >
                                    <span>Створити Тему</span>
                                    <img src="@/assets/icons/forum-plus.svg" alt="plus" class="forum-themes__create-btn-icon">
                                </button>
                            </div>

                            <div
                                v-if="userStore.isAdmin || canCreateTheme"
                                class="forum-themes__header-actions-mobile"
                                @click.stop
                            >
                                <button
                                    class="forum-themes__header-actions-trigger"
                                    title="Дії"
                                    @click.stop="toggleHeaderActionsMenu"
                                >
                                    ⋮
                                </button>

                                <div v-if="isHeaderActionsMenuOpen" class="forum-themes__header-actions-menu">
                                    <button
                                        v-if="userStore.isAdmin"
                                        class="forum-themes__header-actions-menu-item"
                                        @click.stop="openSubCategoryEdit"
                                    >
                                        <span>Редагувати підрозділ</span>
                                        <img src="@/assets/icons/forum-edit.svg" alt="edit">
                                    </button>
                                    <button
                                        v-if="canCreateTheme"
                                        class="forum-themes__header-actions-menu-item"
                                        @click.stop="openCreateTheme"
                                    >
                                        <span>Створити тему</span>
                                        <img src="@/assets/icons/forum-plus.svg" alt="plus">
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="forum-themes__meta-row flex justify-content-between align-items-center flex-wrap gap-4">
                            <!-- Breadcrumbs -->
                            <nav class="forum-themes__breadcrumb">
                                <RouterLink :to="{ name: 'forum' }">{{ category?.name || 'Головний розділ' }}</RouterLink>
                                <span> > </span>
                                <span>{{ subCategory?.name }}</span>
                            </nav>
                            <!-- Pagination Info -->
                            <div class="forum-themes__pagination-info">
                                Показано <span class="forum-themes__pagination-info-number">{{ (currentPage - 1) * rowsPerPage + 1 }}-{{ Math.min(currentPage * rowsPerPage, total) }}</span> з <span class="forum-themes__pagination-info-number">{{ total }}</span>
                            </div>
                        </div>

                        <div class="forum-themes__themes-table-slot">
                            <ForumThemesTable
                                :themes="themes"
                                :cat-id="+route.params.cat_id"
                                :is-admin="userStore.isAdmin"
                                :current-user-id="userStore.user?.id"
                                @edit="goToEditTheme"
                                @delete="onDeleteTheme"
                            />
                        </div>

                        <!-- Pagination -->
                        <div v-if="totalPages > 1" class="forum-themes__pagination">
                            <div class="forum-themes__pagination-info forum-themes__pagination-info--mobile">
                                Показано <span class="forum-themes__pagination-info-number">{{ (currentPage - 1) * rowsPerPage + 1 }}-{{ Math.min(currentPage * rowsPerPage, total) }}</span> з <span class="forum-themes__pagination-info-number">{{ total }}</span>
                            </div>
                            <button 
                                @click="goToPreviousPage" 
                                class="forum-themes__pagination-arrow"
                                :disabled="currentPage === 1"
                                aria-label="Previous page"
                            >
                                <img src="@/assets/images/arrow-prev.svg" alt="prev" class="forum-themes__pagination-arrow-icon" />
                            </button>
                            
                            <div class="forum-themes__pagination-numbers">
                                <template v-for="page in visiblePages" :key="page">
                                    <button 
                                        v-if="typeof page === 'number'"
                                        @click="goToPage(page)"
                                        class="forum-themes__pagination-number"
                                        :class="{ 'active': page === currentPage }"
                                        :aria-current="page === currentPage ? 'page' : undefined"
                                    >
                                        {{ page }}
                                    </button>
                                    <span v-else class="forum-themes__pagination-dots">{{ page }}</span>
                                </template>
                            </div>
                            
                            <button 
                                @click="goToNextPage" 
                                class="forum-themes__pagination-arrow"
                                :disabled="currentPage === totalPages"
                                aria-label="Next page"
                            >
                                <img src="@/assets/images/arrow-next.svg" alt="next" class="forum-themes__pagination-arrow-icon" />
                            </button>
                        </div>

                        <div v-if="mobileSideCards.length" class="forum-themes__mobile-side-slider">
                            <div
                                class="forum-themes__mobile-side-slider-track"
                                :style="{ transform: `translateX(-${currentMobileSlide * 100}%)` }"
                            >
                                <div
                                    v-for="(card, index) in mobileSideCards"
                                    :key="`${card.title}-${index}`"
                                    class="forum-themes__mobile-side-slider-slide"
                                >
                                    <ForumSideCard
                                        :image="card.image"
                                        :title="card.title"
                                        :description="card.description"
                                    />
                                </div>
                            </div>

                            <div class="forum-themes__mobile-side-slider-dots">
                                <button
                                    v-for="(_, index) in mobileSideCards"
                                    :key="index"
                                    class="forum-themes__mobile-side-slider-dot"
                                    :class="{ active: currentMobileSlide === index }"
                                    @click="goToMobileSlide(index)"
                                    :aria-label="`Перейти до слайда ${index + 1}`"
                                ></button>
                            </div>
                        </div>
                    </div>

                    <ForumSideCard
                        v-if="currentSideCard"
                        class="forum-themes__side-card"
                        :image="currentSideCard.image"
                        :title="currentSideCard.title"
                        :description="currentSideCard.description"
                    />
                </div>
            </div>
        </div>
        <Footer />
    </div>
    <ForumSubCat ref="forumSubCatRef" @subCatCreated="loadThemes(currentPage, rowsPerPage)"/>
</template>

<style scoped lang='scss'>
.forum-themes {
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
        padding-top: 60px;
    }

    &__inner {
        padding: 40px clamp(20px, 5vw, 80px);
        flex: 1;

        @media (max-width: 768px) {
            padding: 24px clamp(16px, 4vw, 40px);
        }

        @media (max-width: 480px) {
            padding: 20px 16px;
        }
    }

    &__container {
        max-width: 1400px;
        margin: 0 auto;

        @media (max-width: 768px) {
            padding: 0;
        }
    }

    &__breadcrumb {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
        white-space: nowrap;

        a {
            text-decoration: none;
            transition: all 0.3s ease-in-out;
            font-weight: 400;
            font-size: 16px;
            letter-spacing: -0.09em;
            background: linear-gradient(180deg, #f8f8f8 0%, #929292 100%);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;

            @media (max-width: 768px) {
                font-size: 14px;
            }

            &:hover {
                text-decoration: underline;
            }
        }

        span {
            font-weight: 400;
            font-size: 16px;
            letter-spacing: -0.09em;
            background: linear-gradient(180deg, #f8f8f8 0%, #929292 100%);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            opacity: 0.7;

            @media (max-width: 768px) {
                font-size: 14px;
            }
        }
    }

    &__content {
        display: grid;
        grid-template-columns: minmax(0, 1fr) clamp(180px, 17vw, 300px);
        align-items: start;
        gap: 20px;

        @media (max-width: 1024px) {
            grid-template-columns: 1fr;
            display: flex;
            flex-direction: column;
        }
    }

    &__main {
        display: flex;
        flex-direction: column;
        gap: 32px;

        @media (max-width: 768px) {
            gap: 10px;
        }
    }

    &__meta-row {
        @media (max-width: 768px) {
            order: 1;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            padding: 10px 0;
        }
    }

    &__themes-table-slot {
        @media (max-width: 768px) {
            order: 3;
            margin-top: 20px;
        }
    }

    &__side-card {
        @media (max-width: 1024px) {
            display: none;
        }
    }

    &__mobile-side-slider {
        display: none;
        max-width: 300px;
        margin: 0 auto;
        padding: 1px;

        @media (max-width: 1024px) {
            order: 5;
            display: block;
            overflow: hidden;
            margin-top: 8px;
        }
    }

    &__mobile-side-slider-track {
        display: flex;
        transition: transform 0.3s ease;
    }

    &__mobile-side-slider-slide {
        flex: 0 0 100%;
        min-width: 100%;
    }

    &__mobile-side-slider-dots {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 10px;
        margin-top: 14px;
    }

    &__mobile-side-slider-dot {
        width: 10px;
        height: 10px;
        border: none;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.35);
        cursor: pointer;
        transition: background 0.2s ease;

        &.active {
            background: #f8f8f8;
        }
    }

    &__section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 20px;
        padding: 24px;
        background: linear-gradient(90deg, rgba(23, 58, 92, 0.5) 0%, rgba(0, 26, 51, 0.5) 100%);
        backdrop-filter: blur(64px);
        border-radius: 5px;
        position: relative;

        @media (max-width: 768px) {
            order: 2;
            padding: 15px;
            align-items: flex-start;
        }
    }

    &__section-title {
        flex: 1;

        h1 {
            font-weight: 400;
            font-size: 32px;
            line-height: 100%;
            letter-spacing: -0.07em;
            background: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 12px;

            @media (max-width: 768px) {
                font-size: 24px;
            }
        }
    }

    &__section-stats {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;

        &-item {
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

        &-value {
            font-size: 14px;
            color: #f8f8f8;

            @media (max-width: 480px) {
                font-size: 11px;
            }
        }
    }

    &__create-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        white-space: nowrap;
        padding: 12px 24px;
        font-size: 14px;
        backdrop-filter: blur(70px);
        background: rgba(255, 255, 255, 0.1);
        max-width: fit-content;
        
        border: none;
        border-radius: 999px;
        cursor: pointer;
        transition: all 0.3s ease;

        span {
            font-family: 'VollkornSC', sans-serif;
            font-weight: 400;
            font-size: 16px;
            letter-spacing: -0.09em;
            background: linear-gradient(180deg, #f8f8f8 0%, #929292 100%);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
        }

        @media (max-width: 768px) {
            width: 100%;
        }
    }

    &__header-actions {
        display: flex;
        gap: 12px;
        align-items: center;

        @media (max-width: 768px) {
            display: none;
        }
    }

    &__header-actions-mobile {
        display: none;
        position: relative;

        @media (max-width: 768px) {
            display: flex;
        }
    }

    &__header-actions-trigger {
        width: 32px;
        height: 32px;
        border: none;
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.85);
        font-size: 22px;
        line-height: 1;
        border-radius: 50%;
        cursor: pointer;

        @media (max-width: 768px) {
            width: 24px;
            height: 24px;
            font-size: 14px;
        }
    }

    &__header-actions-menu {
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        width: min(290px, 88vw);
        overflow: hidden;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        backdrop-filter: blur(70px);
        background: rgba(15, 15, 20, 1);
        z-index: 20;
    }

    &__header-actions-menu-item {
        width: 100%;
        border: none;
        background: transparent;
        color: #f8f8f8;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 14px 16px;
        cursor: pointer;
        background: rgba(255, 255, 255, 0.04);

        @media (max-width: 768px) {
            padding: 10px 12px;
        }

        &:not(:last-child) {
            border-bottom: 1px solid rgba(255, 255, 255, 0.12);
        }

        span {
            font-family: 'VollkornSC', sans-serif;
            font-size: 14px;
            letter-spacing: -0.04em;
            text-align: left;
        }

        img {
            width: 22px;
            height: 22px;
            flex-shrink: 0;
        }
    }

    &__corner {
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
            top: 0px;
            left: 0px;
            transform: rotate(0deg);
        }

        &--top-right {
            top: 0px;
            right: 0px;
            transform: rotate(90deg);
        }

        &--bottom-left {
            bottom: 0px;
            left: 0px;
            transform: rotate(-90deg);
        }

        &--bottom-right {
            bottom: 0px;
            right: 0px;
            transform: rotate(180deg);
        }
    }

    &__pagination-info {
        display: flex;
        gap: 6px;
        font-weight: 400;
        font-size: 14px;
        line-height: 90%;
        letter-spacing: -0.09em;
        background: linear-gradient(180deg, #f8f8f8 0%, #929292 100%);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;

        @media (max-width: 768px) {
            display: none;
            
        }

        &-number {
            font-size: 20px;
        }

        &--mobile {
            display: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            padding: 20px 0;

            @media (max-width: 768px) {
                display: flex;
                width: 100%;
                justify-content: center;
                margin-bottom: 6px;
                font-size: 14px;
            }
        }
    }

    &__pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 24px;
        padding: 0 40px 0;
        margin-top: 20px;

        @media (max-width: 768px) {
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            order: 4;
            padding: 0 0 22px 0;
            gap: 16px;
            flex-wrap: wrap;
        }
    }

    &__pagination-arrow {
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        padding: 0;
        cursor: pointer;
        transition: opacity 0.2s ease;

        &:hover:not(:disabled) {
            opacity: 0.8;
        }

        &:disabled {
            opacity: 0.3;
            cursor: not-allowed;
        }
    }

    &__pagination-arrow-icon {
        width: 36px;
        height: 36px;

        @media (max-width: 768px) {
            width: 28px;
            height: 28px;
        }
    }

    &__pagination-numbers {
        display: flex;
        align-items: baseline;
        gap: 20px;

        @media (max-width: 768px) {
            gap: 12px;
        }
    }

    &__pagination-number {
        font-family: "Vollkorn", serif;
        background: transparent;
        border: none;
        color: #f8f8f8;
        cursor: pointer;
        transition: transform 0.2s ease, opacity 0.2s ease, color 0.2s ease;
        font-size: 20px;
        line-height: 1;
        padding: 0;
        opacity: 0.5;

        &.active {
            font-size: 30px;
            font-weight: 900;
            background: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            opacity: 1;
        }

        @media (max-width: 768px) {
            font-size: 16px;

            &.active {
                font-size: 24px;
            }
        }
    }

    &__pagination-dots {
        color: #f8f8f8;
        font-size: 20px;

        @media (max-width: 768px) {
            font-size: 16px;
        }
    }

    &__sidebar {
        display: flex;
        flex-direction: column;
        gap: 20px;

        @media (max-width: 1024px) {
            order: -1;
            margin-bottom: 20px;
        }
    }

    &__sidebar-card {
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(10px);
        border-radius: 5px;
        padding: 20px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        position: relative;
    }

    &__sidebar-title {
        font-size: 14px;
        font-weight: 600;
        color: #f8f8f8;
        margin-bottom: 16px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    &__category-card {
        padding: 0;
        background-size: 110% auto;
        background-position: top;
        background-repeat: no-repeat;
        position: relative;
        min-height: 200px;
        display: flex;
        align-items: flex-end;
        justify-content: center;
    }

    &__category-content {
        padding: 20px;
        position: relative;
        z-index: 1;
        text-align: center;

        h3 {
            font-size: 28px;
            font-weight: 500;
            background: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        p {
            font-size: 14px;
            line-height: 150%;
            color: rgba(255, 255, 255, 0.8);
            font-family: 'Candara', sans-serif;
        }
    }

    &__active-theme {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    &__active-theme-link {
        color: #f8f8f8;
        text-decoration: none;
        font-size: 16px;
        font-weight: 500;
        transition: color 0.3s ease;

        &:hover {
            color: #fadfae;
        }
    }

    &__active-theme-stats {
        display: flex;
        flex-direction: column;
        gap: 8px;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.7);

        strong {
            color: #f8f8f8;
            font-weight: 500;
        }
    }

    &__last-activity {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    &__last-activity-user {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    &__last-activity-name {
        font-size: 14px;
        font-weight: 500;
        color: #f8f8f8;
    }

    &__last-activity-time {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.6);
    }

    &__last-activity-link {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.7);
        text-decoration: none;
        transition: color 0.3s ease;

        &:hover {
            color: #fadfae;
        }
    }

}

:deep(.footer) {
    background: transparent !important;
}

</style>