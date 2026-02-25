<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { useAsyncCallWrapper } from '@/composables/useAsyncCallWrapper'
import { fetchGet, fetchPost } from '@/utils/fetchApi'
import type { News } from '@/models/news';
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
import CTA from '@/components/CTA.vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { truncateText } from '@/utils/text';

const { wrapAsyncCall } = useAsyncCallWrapper()
const router = useRouter()
const userStore = useUserStore()
const allNews = ref<News[]>([])
const latestNewsItem = ref<News | null>(null)
const totalCount = ref(0)
type FilterParams = { options: 'news' | 'updates'; limit?: number; page?: number }
const selectedFilter = ref<'news' | 'updates'>('news')
const sortBy = ref('newest')
const currentPage = ref(1)
const itemsPerPage = 3
const baseURL = import.meta.env.VITE_BASE_URL

// Отримуємо останню новину для верхнього блоку
const latestNews = computed(() => {
    return latestNewsItem.value && (userStore.isAdmin || !latestNewsItem.value.isHidden) 
        ? latestNewsItem.value 
        : null
})

// Пагінація - використовуємо новини безпосередньо з API
const paginatedNews = computed(() => {
    return allNews.value.filter(n => userStore.isAdmin || !n.isHidden)
})

const totalPages = computed(() => {
    return Math.ceil(totalCount.value / itemsPerPage)
})

// Обчислюємо сторінки для відображення в пагінації
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

// Функція для завантаження останньої новини
const loadLatestNews = async () => {
    wrapAsyncCall(async () => {
        const { data } = await fetchGet('getNews', { 
            options: selectedFilter.value, 
            limit: 3,
            page: 1
        })
        // Фільтруємо приховані новини для звичайних користувачів
        const filtered = (data.news || []).filter((n: News) => userStore.isAdmin || !n.isHidden)
        // Беремо першу доступну новину
        latestNewsItem.value = filtered.length > 0 ? filtered[0] : null
    })
}

// Функція для завантаження даних новин
const loadNewsData = async (params?: FilterParams) => {
    wrapAsyncCall(async () => {
        const { data } = await fetchGet('getNews', params || {})
        allNews.value = data.news || []
        totalCount.value = data.totalCount || 0
    })
}

// Навігація по сторінках
const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
        loadNewsData({ 
            options: selectedFilter.value, 
            limit: itemsPerPage, 
            page: page 
        })
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

onMounted(() => {
    loadLatestNews()
    loadNewsData({ 
        options: selectedFilter.value, 
        limit: itemsPerPage, 
        page: currentPage.value 
    })
})

// Завантажуємо новини при зміні фільтру
watch(selectedFilter, (newFilter) => {
    currentPage.value = 1
    loadLatestNews()
    loadNewsData({ 
        options: newFilter, 
        limit: itemsPerPage, 
        page: 1 
    })
})
// Видалення новини (для адміна)
const deleteNews = async (id: number) => {
    await wrapAsyncCall(async () => {
        await fetchPost('deleteNews', { id })
        await loadLatestNews()
        await loadNewsData({ 
            options: selectedFilter.value, 
            limit: itemsPerPage, 
            page: currentPage.value 
        })
        // Якщо поточна сторінка стала більшою за доступну після видалення — зменшимо її
        if (currentPage.value > totalPages.value) {
            currentPage.value = Math.max(1, totalPages.value)
            await loadNewsData({ 
                options: selectedFilter.value, 
                limit: itemsPerPage, 
                page: currentPage.value 
            })
        }
    })
}
</script>

<template>
    <Header />
    <div class="all-news">
        <!-- Верхній блок з останньою новиною (як news-slider) -->
        <div v-if="latestNews" class="latest-news-slider">
            <div class="latest-news-slider__container">
                <!-- Ліва панель з текстом -->
                <div class="latest-news-slider__content-container">
                    <div class="latest-news-slider__content">
                        <div class="latest-news-slider__header">
                            <span class="latest-news-slider__category">Новини та Оновлення</span>
                        </div>
                        
                        <div class="latest-news-slider__text-container">
                            <div class="latest-news-slider__text-slide">
                                <h1 class="latest-news-slider__title">{{ latestNews.title }}</h1>
                                <p class="latest-news-slider__description" v-html="truncateText(latestNews.text, 150)"></p>
                                <div class="latest-news-slider__meta">
                                    <span class="latest-news-slider__date">{{ new Date(latestNews.created_at).toLocaleDateString('uk-UA') }}</span>
                                    <router-link 
                                        :to="{name: 'single-news', params: {id: latestNews.id}}" 
                                        class="latest-news-slider__read-more-btn"
                                    >
                                        Читати Далі
                                    </router-link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Права панель з зображенням -->
                <div class="latest-news-slider__image">
                    <div class="latest-news-slider__image-slide">
                        <img 
                            :src="baseURL + '/files/' + latestNews.image" 
                            :alt="latestNews.title"
                            class="latest-news-slider__news-image"
                        />
                        <div class="latest-news-slider__image-gradient"></div>
                        <div 
                            v-if="userStore.isAdmin && latestNews.isHidden" 
                            class="latest-news-slider__hidden-badge"
                        >
                            Прихована
                        </div>
                    </div>
                    <!-- Статична рамка поверх картинки -->
                    <div class="latest-news-slider__image-frame">
                        <img src="@/assets/images/slider-image-frame.png" alt="Frame" class="latest-news-slider__frame-image" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Блок пошуку та фільтрів -->
        <div class="search-filters">
            <div class="search-filters__container">
                
                <div class="search-filters__filters">
                    <div class="search-filters__radio-group">
                        <label class="search-filters__radio">
                            <input 
                                v-model="selectedFilter" 
                                type="radio" 
                                value="news" 
                                name="filter"
                            />
                            <span>Новини</span>
                        </label>
                        
                        <label class="search-filters__radio">
                            <input 
                                v-model="selectedFilter" 
                                type="radio" 
                                value="updates" 
                                name="filter"
                            />
                            <span>Оновлення</span>
                        </label>
                       
                    </div>
                </div>
                <button 
            v-if="userStore.isAdmin" 
            class="all-news__admin-create-btn fantasy-btn"
            @click="router.push({name: 'news-creation'})"
        >
            <span>Створити Новину</span>
        </button>
            </div>
        </div>

        <!-- Блок з новинами -->
        <div v-if="paginatedNews.length > 0" class="news-grid">
            <div class="news-grid__container">
                <div 
                    v-for="newsItem in paginatedNews" 
                    :key="newsItem.id"
                    class="news-grid__card"
                >
                    <div class="news-grid__image-container">
                        <img 
                            :src="baseURL + '/files/' + newsItem.image" 
                            :alt="newsItem.title"
                            class="news-grid__image"
                        />
                        <div 
                            v-if="userStore.isAdmin && newsItem.isHidden" 
                            class="news-grid__hidden-badge"
                        >
                            Прихована
                        </div>
                        <div class="news-grid__image-frame">
                            <img src="@/assets/images/slider-image-frame.png" alt="Frame" class="news-grid__frame-image" />
                        </div>
                    </div>
                    <div class="news-grid__content">
                        <div class="news-grid__category flex justify-content-between align-items-center">
                            {{ newsItem.type === 'news' ? 'Новини' : 'Оновлення' }}
                            <!-- Адмін кнопки -->
                            <div v-if="userStore.isAdmin" class="news-grid__admin-controls">
                                <button 
                                    class="news-grid__admin-btn primary"
                                    @click="router.push({ name: 'news-creation', params: { id: newsItem.id } })"
                                >Редагувати</button>
                                <button 
                                    class="news-grid__admin-btn danger"
                                    @click="deleteNews(newsItem.id)"
                                >Видалити</button>
                            </div>
                        </div>
                        <h3 class="news-grid__card-title">
                            {{ newsItem.title }}
                        </h3>
                        <p class="news-grid__description" v-html="newsItem.text.substring(0, 150) + '...'"></p>
                        <div class="news-grid__meta">
                            <span class="news-grid__date">{{ new Date(newsItem.created_at).toLocaleDateString('uk-UA') }}</span>
                            <router-link 
                                :to="{name: 'single-news', params: {id: newsItem.id}}" 
                                class="news-grid__read-more"
                            >
                                ЧИТАТИ ДАЛІ
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Пагінація -->
        <div v-if="totalPages > 1" class="pagination">
            <button 
                @click="goToPreviousPage" 
                class="pagination__arrow"
                :disabled="currentPage === 1"
                aria-label="Previous page"
            >
                <img src="@/assets/images/arrow-prev.svg" alt="prev" class="pagination__arrow-icon" />
            </button>
            
            <div class="pagination__numbers">
                <template v-for="page in visiblePages" :key="page">
                    <button 
                        v-if="typeof page === 'number'"
                        @click="goToPage(page)"
                        class="pagination__number"
                        :class="{ 'active': page === currentPage }"
                        :aria-current="page === currentPage ? 'page' : undefined"
                    >
                        {{ page }}
                    </button>
                    <span v-else class="pagination__dots">{{ page }}</span>
                </template>
            </div>
            
            <button 
                @click="goToNextPage" 
                class="pagination__arrow"
                :disabled="currentPage === totalPages"
                aria-label="Next page"
            >
                <img src="@/assets/images/arrow-next.svg" alt="next" class="pagination__arrow-icon" />
            </button>
        </div>
        
        <!-- CTA компонент -->
        <CTA />
    </div>
    <Footer />
</template>

<style scoped lang="scss">
.all-news {
    position: relative;
    color: #f8f8f8;
    min-height: 100vh;

    &__admin-create-btn {
        position: relative;
        right: 20px;
        z-index: 20;
    }
}

.latest-news-slider {
    position: relative;
    width: 100%;
    max-width: 1110px;
    padding: 120px 15px 0 15px;
    margin: 0 auto;

    @media (max-width: 768px) {

        padding-top: 50px;
    }
    
    &__container {
        display: flex;
        height: 500px;
        border-radius: 12px;
        overflow: hidden;
        position: relative;
        padding: 0;
        
        @media (max-width: 768px) {
            flex-direction: column;
            gap: 50px;
            height: 600px;
        }
    }

    &__content-container {
        width: 100%;
        max-width: 240px;
        position: relative;
        @media (max-width: 768px) {
            max-width: 100%;
            height: 100%;
        }
    }
    
    &__content {
        position: absolute;
        width: 370px;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        z-index: 11;
        transform: translateY(25%);
        
        @media (max-width: 768px) {
            position: static;
            width: 100%;
            height: 100%;
        }
    }
    
    &__header {
        margin-bottom: 20px;
    }
    
    &__category {
        font-weight: 400;
        font-size: 20px;
        line-height: 100%;
        letter-spacing: -0.07em;
        background: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    
    &__text-container {
        flex: 1;
        position: relative;
        overflow: hidden;
    }
    
    &__text-slide {
        position: relative;
        width: 100%;
        height: 100%;
        opacity: 1;
        z-index: 1;
    }
    
    &__title {
        font-weight: 400;
        font-size: 40px;
        line-height: 110%;
        letter-spacing: -0.07em;
        color: #f8f8f8;
        
        @media (max-width: 768px) {
            font-size: 32px;
        }
    }
    
    &__description {
        font-family: "Candara", sans-serif;
        font-weight: 400;
        font-size: 16px;
        line-height: 170%;
        letter-spacing: -0.01em;
        color: #f8f8f8;
        margin: 20px 0 30px 0;
        max-height: 120px;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        line-clamp: 3;
        -webkit-box-orient: vertical;
        
        @media (max-width: 768px) {
            font-size: 1.1rem;
            max-height: 100px;
            -webkit-line-clamp: 3;
            line-clamp: 3;
        }
    }
    
    &__meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        margin-bottom: 20px;
        position: relative;
    }
    
    &__date {
        font-weight: 400;
        font-size: 16px;
        line-height: 60%;
        text-align: center;
        color: #f8f8f8;
    }
    
    &__read-more-btn {
        font-weight: 400;
        font-size: 20px;
        line-height: 60%;
        letter-spacing: -0.09em;
        text-align: center;
        background: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        transition: all 0.3s ease;
        position: relative;
        z-index: 100;
        
        &:hover {
            opacity: 0.8;
        }
        
        // Прибрати hover ефект для мобільних пристроїв
        @media (hover: none) and (pointer: coarse) {
            &:hover {
                opacity: 1;
            }
        }
    }
    
    &__image-frame {
        position: absolute;
        top: -15px;
        left: -15px;
        right: -15px;
        bottom: -15px;
        z-index: 10;
        pointer-events: none;
        display: flex;
        align-items: center;
        justify-content: center;

        @media (max-width: 768px) {
            top: -5px;
            left: -5px;
            right: -5px;
            bottom: -5px;
        }
    }
    
    &__frame-image {
        width: 100%;
        height: 100%;
        object-position: center;
    }
    
    &__image {
        max-width: 850px;
        max-height: 610px;
        width: 100%;
        height: 100%;
        position: relative;
        overflow: hidden;

        @media (max-width: 768px) {
            min-height: 235px;
        }
    }
    
    &__image-slide {
        position: relative;
        width: 100%;
        height: 100%;
        opacity: 1;
    }
    
    &__news-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        border-radius: 16px;
    }
    
    &__image-gradient {
        position: absolute;
        top: 0;
        left: 0;
        width: 50%;
        bottom: 0;
        background: linear-gradient(to right, #0A0A0A 0%, transparent 100%);
        pointer-events: none;
        z-index: 1;
    }

    &__hidden-badge {
        position: absolute;
        top: 30px;
        left: 30px;
        z-index: 12;
        padding: 6px 10px;
        font-size: 12px;
        color: #0a0a0a;
        background: #ffd966;
        border: 1px solid rgba(248, 248, 248, 0.3);
        border-radius: 6px;
        text-transform: uppercase;
        letter-spacing: 0.03em;
        font-weight: 700;
    }
}

.search-filters {
    padding: 40px 15px;
    max-width: 1110px;
    margin: 0 auto;

    &__container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 30px;
        flex-wrap: wrap;
        padding: 0;

        @media (max-width: 768px) {
            flex-direction: column;
            gap: 20px;
        }
    }

    &__search {
        position: relative;
        flex: 1;
        min-width: 300px;

        @media (max-width: 768px) {
            min-width: 100%;
        }
    }

    &__search-icon {
        position: absolute;
        left: 15px;
        top: 50%;
        transform: translateY(-50%);
        z-index: 1;
    }

    &__input {
        width: 100%;
        padding: 15px 15px 15px 50px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(248, 248, 248, 0.3);
        border-radius: 8px;
        color: #f8f8f8;
        font-size: 16px;
        outline: none;
        transition: border-color 0.3s ease;

        &::placeholder {
            color: rgba(248, 248, 248, 0.6);
        }

        &:focus {
            border-color: rgba(248, 248, 248, 0.6);
        }
    }

    &__filters {
        display: flex;
        align-items: center;
        gap: 30px;

        @media (max-width: 768px) {
            width: 100%;
            justify-content: space-between;
        }
    }

    &__radio-group {
        display: flex;
        gap: 20px;
    }

    &__radio {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        color: #f8f8f8;
        font-size: 16px;

        input[type="radio"] {
            appearance: none;
            width: 20px;
            height: 20px;
            background-image: url('@/assets/images/checkbox-false.svg');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            cursor: pointer;
            border: none;
            outline: none;

            &:checked {
                background-image: url('@/assets/images/checkbox-true.svg');
            }
        }
    }

    &__sort {
        position: relative;
    }

    &__select {
        padding: 10px 15px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(248, 248, 248, 0.3);
        border-radius: 8px;
        color: #f8f8f8;
        font-size: 16px;
        outline: none;
        cursor: pointer;
        appearance: none;
        padding-right: 40px;
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23f8f8f8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
        background-position: right 12px center;
        background-repeat: no-repeat;
        background-size: 16px;

        &:focus {
            border-color: rgba(248, 248, 248, 0.6);
        }
    }
}

.news-grid {
    padding: 0 15px 80px 15px;
    max-width: 1110px;
    margin: 0 auto;

    @media (max-width: 768px) {
        padding: 0 15px 40px 15px;
    }

    &__title {
        font-weight: 400;
        font-size: 48px;
        line-height: 90%;
        letter-spacing: -0.07em;
        color: #f8f8f8;
        margin-bottom: 50px;

        @media (max-width: 768px) {
            font-size: 32px;
            margin-bottom: 40px;
        }
    }

    &__container {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 30px;
        padding: 0;

        @media (max-width: 768px) {
            grid-template-columns: 1fr;
            gap: 20px;
        }
    }

    &__card {
        border-radius: 8px;
        overflow: hidden;
        position: relative;
    }

    &__image-container {
        position: relative;
        width: 100%;
        height: 200px;
        overflow: hidden;
    }

    &__hidden-badge {
        position: absolute;
        top: 10px;
        left: 10px;
        z-index: 12;
        padding: 6px 10px;
        font-size: 12px;
        color: #0a0a0a;
        background: #ffd966;
        border: 1px solid rgba(248, 248, 248, 0.3);
        border-radius: 6px;
        text-transform: uppercase;
        letter-spacing: 0.03em;
        font-weight: 700;
    }

    &__image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        border-radius: 16px;
    }

    &__image-frame {
        position: absolute;
        top: -5px;
        left: -5px;
        right: -5px;
        bottom: -5px;
        z-index: 10;
        pointer-events: none;
        display: flex;
        align-items: center;
        justify-content: center;

        @media (max-width: 768px) {
            top: -5px;
            left: -5px;
            right: -5px;
            bottom: -5px;
        }
    }

    &__frame-image {
        width: 100%;
        height: 100%;
        object-position: center;
    }

    &__content {
        margin-top: 30px;
    }

    &__admin-controls {
        display: flex;
        gap: 10px;
    }

    &__admin-btn {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(248, 248, 248, 0.3);
        border-radius: 6px;
        padding: 6px 10px;
        color: #f8f8f8;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s ease;

        &.primary {
            border-color: rgba(248, 248, 248, 0.6);
        }

        &.danger {
            border-color: rgba(255, 77, 77, 0.6);
        }

        &:hover {
            background: rgba(255, 255, 255, 0.2);
        }
    }

    &__category {
        font-weight: 400;
        font-size: 14px;
        line-height: 100%;
        letter-spacing: -0.07em;
        background: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 20px;
    }

    &__card-title {
        font-weight: 400;
        font-size: 32px;
        line-height: 110%;
        letter-spacing: -0.07em;
        color: #f8f8f8;
        margin-bottom: 15px;

        @media (max-width: 768px) {
            font-size: 20px;
        }
    }

    &__description {
        font-weight: 400;
        font-size: 16px;
        line-height: 100%;
        letter-spacing: -0.01em;
        color: #f8f8f8;
        font-family: 'Candara', sans-serif;
        max-height: 64px; 
        overflow: hidden;
    }

    &__meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: clamp(20px, 2vw, 40px);
    }

    &__date {
        font-size: clamp(14px, 2vw, 16px);
        color: #f8f8f8;
        font-weight: 400;
    }

    &__read-more {
        font-weight: 400;
        font-size: clamp(16px, 2vw, 20px);
        line-height: 100%;
        letter-spacing: -0.07em;
        background: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        transition: color 0.3s ease;

        &:hover {
            color: #D4AF37;
        }
    }
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 24px;
    padding: 40px 15px;
    max-width: 1110px;
    margin: 0 auto;

    &__arrow {
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

    &__arrow-icon {
        width: 36px;
        height: 36px;
    }

    &__numbers {
        display: flex;
        align-items: baseline;
        gap: 20px;
    }

    &__number {
        font-family: "Vollkorn", serif;
        background: transparent;
        border: none;
        color: #f8f8f8; // inactive color
        cursor: pointer;
        transition: transform 0.2s ease, opacity 0.2s ease, color 0.2s ease;
        font-size: 20px; // inactive size
        line-height: 1;
        padding: 0;
        opacity: 0.5;

        &.active {
            font-size: 30px; // active size
            font-weight: 900;
            background: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            opacity: 1;
        }
    }

    &__dots {
        color: #f8f8f8;
        font-size: 20px;
    }
}
</style>
