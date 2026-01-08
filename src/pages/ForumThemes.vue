<script setup lang='ts'>
import ForumHeader from '@/components/ForumHeader.vue';
import ForumSubCat from '@/components/modals/forumSubCat.vue';
import Footer from '@/components/Footer.vue';

import { onMounted, ref, computed } from 'vue';
import { useAsyncCallWrapper } from '@/composables/useAsyncCallWrapper';
import { fetchGet, fetchPost } from '@/utils/fetchApi';
import type { IForumCategory, IForumSubCategory, IForumTheme } from '@/models/forum';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { useConfirmRemoval } from '@/composables/useConfirmRemoval';
import { format } from 'date-fns';
import forumCard1 from '@/assets/images/forum-card-1.jpg'
import forumCard2 from '@/assets/images/forum-card-2.jpg'
import forumCard3 from '@/assets/images/forum-card-3.jpg'
import themeIcon from '@/assets/icons/theme-icon.svg'
import createdIcon from '@/assets/icons/created-icon.svg'
import answersIcon from '@/assets/icons/answers-icon.svg'
import viewsIcon from '@/assets/icons/views-icon.svg'
import updatedIcon from '@/assets/icons/updated-icon.svg'

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

const descriptions = [
    'Публікації від команди: зміни, оголошення, і загальна картина подій на сервері.',
    'Простір для гравців: обговорення, пропозиції, живий обмін досвідом між учасниками.',
    'Все про занурення в гру: практичні знання, досвід, підказки і історії з живого світу Perfect World.'
]

const cardImages = [forumCard1, forumCard2, forumCard3]

const getCardImage = (index: number) => {
    return cardImages[index % 3]
}

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

onMounted(() => {
    // Встановлюємо значення з query при завантаженні
    if (route.query.page) currentPage.value = +route.query.page;
    if (route.query.limit) rowsPerPage.value = +route.query.limit;
    wrapAsyncCall(() => loadThemes(currentPage.value, rowsPerPage.value));
});
</script>

<template>
    <div class="forum-themes w-full">
        <ForumHeader />
        <div class="forum-themes__inner">
            <div class="forum-themes__container">

                <!-- Main Content -->
                <div class="forum-themes__content">
                    <!-- Left Column - Themes List -->
                    <div class="forum-themes__main">
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
                            <button 
                                v-if="userStore.isAdmin"
                                @click="forumSubCatRef?.showDia(subCategory || null, +route.params.sub_id)"
                                class="forum-themes__create-btn"
                            >
                                <img src="@/assets/icons/forum-edit.svg" alt="edit" class="forum-themes__create-btn-icon">
                            </button>
                            <button 
                                v-if="canCreateTheme"
                                @click="router.push({name: 'theme-creation', params: {id_main: +route.params.sub_id}})"
                                class="forum-themes__create-btn"
                            >
                                <span>Створити Тему</span>
                                <img src="@/assets/icons/forum-plus.svg" alt="plus" class="forum-themes__create-btn-icon">
                            </button>
                        </div>

                        <div class="flex justify-content-between align-items-center flex-wrap gap-4">
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

                        <!-- Themes Table -->
                        <div class="forum-themes__table">
                            <div class="forum-themes__corner forum-themes__corner--top-left"></div>
                            <div class="forum-themes__corner forum-themes__corner--top-right"></div>
                            <div class="forum-themes__corner forum-themes__corner--bottom-left"></div>
                            <div class="forum-themes__corner forum-themes__corner--bottom-right"></div>
                            <div class="forum-themes__table-header">
                                <div class="forum-themes__table-col forum-themes__table-col--topic">
                                    <img :src="themeIcon" alt="theme" class="forum-themes__table-header-icon" />
                                    <span>Тема</span>
                                </div>
                                <div class="forum-themes__table-col forum-themes__table-col--created">
                                    <img :src="createdIcon" alt="created" class="forum-themes__table-header-icon" />
                                    <span>Створено</span>
                                </div>
                                <div class="forum-themes__table-col forum-themes__table-col--replies">
                                    <img :src="answersIcon" alt="answers" class="forum-themes__table-header-icon" />
                                    <span>Відповіді</span>
                                </div>
                                <div class="forum-themes__table-col forum-themes__table-col--views">
                                    <img :src="viewsIcon" alt="views" class="forum-themes__table-header-icon" />
                                    <span>Перегляди</span>
                                </div>
                                <div class="forum-themes__table-col forum-themes__table-col--updated">
                                    <img :src="updatedIcon" alt="updated" class="forum-themes__table-header-icon" />
                                    <span>Оновлено</span>
                                </div>
                                <div v-if="userStore.isAdmin" class="forum-themes__table-col forum-themes__table-col--actions">Дії</div>
                            </div>
                            <div class="forum-themes__table-body">
                                <div v-for="theme of themes" :key="theme.id" class="forum-themes__table-row">
                                    <div class="forum-themes__table-col forum-themes__table-col--topic">
                                        <RouterLink 
                                            :to="{name: 'separate-theme', params: {theme_id: theme.id, cat_id: route.params.cat_id}}"
                                            class="forum-themes__theme-link"
                                        >
                                            {{ theme.name }}
                                        </RouterLink>
                                    </div>
                                    <div class="forum-themes__table-col forum-themes__table-col--created" data-label="Створено:">
                                        {{ format(new Date(theme.created_at), 'dd.MM.yyyy HH:mm') }}
                                    </div>
                                    <div class="forum-themes__table-col forum-themes__table-col--replies" data-label="Відповіді:">
                                        {{ theme.messages_count }}
                                    </div>
                                    <div class="forum-themes__table-col forum-themes__table-col--views" data-label="Перегляди:">
                                        {{ theme.views_count }}
                                    </div>
                                    <div class="forum-themes__table-col forum-themes__table-col--updated" data-label="Оновлено:">
                                        {{ format(new Date(theme.edited_at || theme.created_at), 'dd.MM.yyyy HH:mm') }}
                                    </div>
                                    <div v-if="userStore.isAdmin || userStore.user?.id === theme.user_id" class="forum-themes__table-col forum-themes__table-col--actions">
                                        <div class="forum-themes__actions flex gap-2">
                                            <button 
                                                v-if="userStore.isAdmin || userStore.user?.id === theme.user_id"
                                                class="forum-themes__edit-btn"
                                                title="Редагувати тему"
                                                @click="router.push({name: 'theme-creation', params: {id_main: theme.id_main, id: theme.id}})"
                                            >
                                                <img width="20" height="20" src="@/assets/images/feather.svg" alt="Edit">
                                            </button>
                                            <button
                                                v-if="userStore.isAdmin"
                                                class="forum-themes__delete-btn"
                                                title="Видалити тему"
                                                @click="confirmRemoval($event, theme.id, 'Ви впевнені, що хочете видалити цю тему?', deleteTheme)"
                                            >
                                                <img src="@/assets/images/Boom.svg" alt="Trash">
                                            </button>
                                        </div>
                                    </div>
                                    <div v-if="userStore.isAdmin || userStore.user?.id === theme.user_id" class="forum-themes__mobile-actions">
                                        <div class="forum-themes__actions flex gap-2">
                                            <button 
                                                v-if="userStore.isAdmin || userStore.user?.id === theme.user_id"
                                                class="forum-themes__edit-btn"
                                                title="Редагувати тему"
                                                @click="router.push({name: 'theme-creation', params: {id_main: theme.id_main, id: theme.id}})"
                                            >
                                                <img width="20" height="20" src="@/assets/images/feather.svg" alt="Edit">
                                            </button>
                                            <button
                                                v-if="userStore.isAdmin"
                                                class="forum-themes__delete-btn"
                                                title="Видалити тему"
                                                @click="confirmRemoval($event, theme.id, 'Ви впевнені, що хочете видалити цю тему?', deleteTheme)"
                                            >
                                                <img src="@/assets/images/Boom.svg" alt="Trash">
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Pagination -->
                        <div v-if="totalPages > 1" class="forum-themes__pagination">
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
                    </div>
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
        padding-top: 90px;
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
            padding: 20px 16px;
        }
    }

    &__container {
        max-width: 1400px;
        margin: 0 auto;
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
        grid-template-columns: 1fr;
        gap: 24px;

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
            flex-direction: column;
            padding: 20px;
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

    &__table {
        backdrop-filter: blur(64px);
        background: rgba(250, 250, 250, 0.05);
        border-radius: 5px;
        border: none;
        position: relative;
        padding: 20px 10px;
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

    &__table-header {
        display: grid;
        grid-template-columns: 2fr 1fr 0.8fr 0.8fr 1fr 0.5fr;
        gap: 16px;
        padding: 0px 20px 14px 20px;
        background: none;
        font-weight: 400;
        font-size: 14px;
        color: #fff;

        @media (max-width: 768px) {
            grid-template-columns: 1fr;
            display: none;
        }
    }

    &__table-header-icon {
        width: 16px;
        height: 16px;
        margin-right: 8px;
        display: inline-block;
        vertical-align: middle;
    }

    &__table-col {
        display: flex;
        align-items: center;

        &--topic {
            font-weight: 400;
            font-size: 16px;
        }

        &--created,
        &--replies,
        &--views,
        &--updated {
            justify-content: center;
            text-align: center;
        }

        &--actions {
            justify-content: flex-end;

            @media (max-width: 768px) {
                display: none;
            }
        }

        @media (max-width: 768px) {
            &--created,
            &--replies,
            &--views,
            &--updated {
                display: flex;
                justify-content: space-between;
                font-size: 12px;
                color: rgba(255, 255, 255, 0.7);
                padding: 4px 0;

                &::before {
                    content: attr(data-label);
                    font-weight: 500;
                    color: rgba(255, 255, 255, 0.9);
                    margin-right: 8px;
                }
            }
        }
    }

    &__table-body {
        display: flex;
        flex-direction: column;
    }

    &__table-row {
        display: grid;
        grid-template-columns: 2fr 1fr 0.8fr 0.8fr 1fr 0.5fr;
        gap: 16px;
        padding: 14px 20px;
        transition: background 0.3s ease;

        @media (max-width: 768px) {
            gap: 0px !important;
        }

        &:nth-child(odd) {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 10px;
        }

        &:last-child {
            border-bottom: none;
        }

        @media (max-width: 768px) {
            grid-template-columns: 1fr;
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding: 16px;
        }
    }

    &__theme-link {
        color: #f8f8f8;
        text-decoration: none;
        font-size: 16px;
        transition: color 0.3s ease;
        font-weight: 500;

        &:hover {
            color: #fadfae;
        }

        @media (max-width: 768px) {
            font-size: 14px;
            margin-bottom: 15px;
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
            font-size: 14px;
        }

        &-number {
            font-size: 20px;
        }
    }

    &__pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 24px;
        padding: 0 040px 0;
        margin-top: 20px;

        @media (max-width: 768px) {
            padding: 30px 0;
            gap: 16px;
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

    &__mobile-actions {
        display: none;
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);

        @media (max-width: 768px) {
            display: block;
        }
    }

    &__actions {
        display: flex;
        gap: 20px;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;

        @media (max-width: 768px) {
            width: 100%;
            justify-content: space-between;
        }
    }

    &__edit-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        background: none;
        cursor: pointer;
        padding: 4px;
        transition: opacity 0.2s ease;

        img {
            width: 20px;
            height: 20px;
        }

        &:hover {
            opacity: 0.7;
        }

        &:active {
            opacity: 0.6;
        }
    }

    &__delete-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        background: none;
        cursor: pointer;
        padding: 4px;
        transition: opacity 0.2s ease;

        img {
            width: 20px;
            height: 20px;
        }

        &:hover {
            opacity: 0.7;
        }

        &:active {
            opacity: 0.6;
        }
    }
}

:deep(.footer) {
    background: transparent !important;
}

</style>