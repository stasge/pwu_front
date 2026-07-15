<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue';
import { useAsyncCallWrapper } from '@/composables/useAsyncCallWrapper';
import { fetchGet } from '@/utils/fetchApi';
import type { News } from '@/models/news';
import { useMitt } from '@/composables/useMitt';
import { truncateText } from '@/utils/text';
import ServerLifetimeCounter from '@/components/ServerLifetimeCounter.vue';

const baseURL = import.meta.env.VITE_BASE_URL
const news = ref<News[]>([])
const notifications = ref<News[]>([])
const currentSlide = ref(0)
const isAnimating = ref(false)
const notificationsListRef = ref<HTMLElement | null>(null)
const showTopFade = ref(false)
const showBottomFade = ref(false)
const showLeftFade = ref(false)
const showRightFade = ref(false)

const isHorizontalActualLayout = () => window.innerWidth <= 1100

const categoryColors: Record<string, string> = {
    'технічне': '#577EEA',
    'сповіщення': '#CD5151',
    'оновлення': '#FBD298',
}

const formatNotificationDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    return `${day}/${month}`
}

const getCategoryColor = (label: string) => {
    const key = label.toLowerCase().trim()
    return categoryColors[key] ?? categoryColors['оновлення']
}

const visibleNotifications = computed(() => {
    return notifications.value.filter(n => !n.isHidden)
})

const updateScrollFades = () => {
    const el = notificationsListRef.value
    if (!el) {
        showTopFade.value = false
        showBottomFade.value = false
        showLeftFade.value = false
        showRightFade.value = false
        return
    }

    const threshold = 4

    if (isHorizontalActualLayout()) {
        const { scrollLeft, scrollWidth, clientWidth } = el
        const canScroll = scrollWidth > clientWidth + threshold

        showLeftFade.value = canScroll && scrollLeft > threshold
        showRightFade.value = canScroll && scrollLeft + clientWidth < scrollWidth - threshold
        showTopFade.value = false
        showBottomFade.value = false
        return
    }

    const { scrollTop, scrollHeight, clientHeight } = el
    const canScroll = scrollHeight > clientHeight + threshold

    showTopFade.value = canScroll && scrollTop > threshold
    showBottomFade.value = canScroll && scrollTop + clientHeight < scrollHeight - threshold
    showLeftFade.value = false
    showRightFade.value = false
}

const syncScrollFades = async () => {
    await nextTick()
    updateScrollFades()
}

// Touch events для свайпу
const touchStartX = ref(0)
const touchStartY = ref(0)
const touchEndX = ref(0)
const touchEndY = ref(0)
const minSwipeDistance = 50 // Мінімальна відстань для визнання свайпу
const {wrapAsyncCall} = useAsyncCallWrapper()
const emitter = useMitt()

// Фільтруємо новини (API повертає вже обмежену кількість)
const visibleNews = computed(() => {
    return news.value.filter(n => !n.isHidden).slice(0, 3)
})

onMounted(async () => {
    await Promise.all([loadNews(), loadNotifications()])
    await syncScrollFades()
    
    emitter.on('login', () => {
        loadNews()
        loadNotifications()
    })

    window.addEventListener('resize', updateScrollFades)
});

onUnmounted(() => {
    window.removeEventListener('resize', updateScrollFades)
})

watch(visibleNotifications, () => {
    syncScrollFades()
})

const loadNews = async () => {
    await wrapAsyncCall( async () => {
        const {data} = await fetchGet('getNews', { limit: 5, options: 'news' })
        news.value = data.news || []
    })
}

const loadNotifications = async () => {
    await wrapAsyncCall(async () => {
        const { data } = await fetchGet('getNews', {
            options: 'notification',
            simple: true,
            limit: 1000,
        })
        notifications.value = Array.isArray(data) ? data : (data?.news || [])
    })
    await syncScrollFades()
}

const nextSlide = () => {
    if (isAnimating.value || visibleNews.value.length <= 1) return
    
    isAnimating.value = true
    const nextIndex = (currentSlide.value + 1) % visibleNews.value.length
    currentSlide.value = nextIndex
    
    setTimeout(() => {
        isAnimating.value = false
    }, 600)
}

const prevSlide = () => {
    if (isAnimating.value || visibleNews.value.length <= 1) return
    
    isAnimating.value = true
    const prevIndex = currentSlide.value === 0 ? visibleNews.value.length - 1 : currentSlide.value - 1
    currentSlide.value = prevIndex
    
    setTimeout(() => {
        isAnimating.value = false
    }, 600)
}

const goToSlide = (index: number) => {
    if (isAnimating.value || index === currentSlide.value || visibleNews.value.length <= 1) return
    
    isAnimating.value = true
    currentSlide.value = index
    
    setTimeout(() => {
        isAnimating.value = false
    }, 600)
}

// admin-only actions removed in this component

// Touch event handlers для свайпу
const handleTouchStart = (e: TouchEvent) => {
    touchStartX.value = e.touches[0].clientX
    touchStartY.value = e.touches[0].clientY
}

const handleTouchMove = (e: TouchEvent) => {
    // Запобігаємо скролу сторінки під час горизонтального свайпу
    const deltaX = Math.abs(e.touches[0].clientX - touchStartX.value)
    const deltaY = Math.abs(e.touches[0].clientY - touchStartY.value)
    
    if (deltaX > deltaY) {
        e.preventDefault()
    }
}

const handleTouchEnd = (e: TouchEvent) => {
    touchEndX.value = e.changedTouches[0].clientX
    touchEndY.value = e.changedTouches[0].clientY
    handleSwipe()
}

const handleSwipe = () => {
    // Перевіряємо, чи це мобільний пристрій
    const isMobile = window.innerWidth <= 768
    
    if (!isMobile) return // Не обробляємо свайп на десктопі
    
    const deltaX = touchEndX.value - touchStartX.value
    const deltaY = touchEndY.value - touchStartY.value
    
    // Перевіряємо, чи це горизонтальний свайп (більше горизонтального руху ніж вертикального)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0) {
            // Свайп вправо - попередній слайд
            prevSlide()
        } else {
            // Свайп вліво - наступний слайд
            nextSlide()
        }
    }
}
</script>

<template>
    <div class="news-slider">
        <ServerLifetimeCounter />

        <div class="news-layout">
        <aside v-if="visibleNotifications.length > 0" class="news-actual">
            <h2 class="news-actual__title">Актуальне</h2>
            <div class="news-actual__list-wrap">
                <div
                    class="news-actual__fade news-actual__fade--top"
                    :class="{ 'is-visible': showTopFade }"
                />
                <div
                    class="news-actual__fade news-actual__fade--bottom"
                    :class="{ 'is-visible': showBottomFade }"
                />
                <div
                    class="news-actual__fade news-actual__fade--left"
                    :class="{ 'is-visible': showLeftFade }"
                />
                <div
                    class="news-actual__fade news-actual__fade--right"
                    :class="{ 'is-visible': showRightFade }"
                />
                    <div
                    ref="notificationsListRef"
                    class="news-actual__list"
                    @scroll="updateScrollFades"
                >
                    <div
                        v-for="item in visibleNotifications"
                        :key="item.id"
                        class="news-actual__item"
                    >
                        <div class="news-actual__meta">
                            <span class="news-actual__date">{{ formatNotificationDate(item.created_at) }}</span>
                            <span
                                v-if="item.label"
                                class="news-actual__tag"
                                :style="{ color: getCategoryColor(item.label) }"
                            >[{{ item.label }}]</span>
                        </div>
                        <p class="news-actual__text">{{ item.title }}</p>
                    </div>
                </div>
            </div>
        </aside>

        <div class="news-main">
        <div 
            v-if="visibleNews.length > 0" 
            class="slider-container"
            @touchstart="handleTouchStart"
            @touchmove="handleTouchMove"
            @touchend="handleTouchEnd"
        >
            <!-- Ліва панель з текстом -->
            <div class="slider-content-container">
                <div class="slider-content">
                <div class="news-header">
                    <span class="news-category">Новини та Оновлення</span>
                </div>
                
                <div class="news-text-container">
                    <div 
                        v-for="(item, index) in visibleNews" 
                        :key="item.id"
                        class="news-text-slide"
                        :class="{
                            'active': index === currentSlide
                        }"
                    >
                        <h1 class="news-title">{{ item.title }}</h1>
                        <p class="news-description" v-html="truncateText(item.text, 150)"></p>
                        <div class="news-meta">
                            <span class="news-date">{{ new Date(item.created_at).toLocaleDateString('uk-UA') }}</span>
                            <router-link 
                                :to="{name: 'single-news', params: {id: item.id}}" 
                                class="read-more-btn"
                            >
                                Читати Далі
                            </router-link>
                        </div>
                        
                        
                    </div>
                </div>
                
            </div>
            </div>
            
            <!-- Права панель з зображенням -->
            <div class="slider-image">
                 <div 
                     v-for="(item, index) in visibleNews" 
                     :key="item.id"
                     class="image-slide"
                     :class="{
                         'active': index === currentSlide
                     }"
                 >
                     <img 
                         :src="baseURL + '/files/' + item.image" 
                         :alt="item.title"
                         class="news-image"
                     />
                     <div class="image-gradient"></div>
                 </div>
                <!-- Статична рамка поверх картинки -->
                <div class="slider-image-frame">
                    <img src="@/assets/images/slider-image-frame.png" alt="Frame" class="frame-image" />
                </div>
            </div>
            
         </div>
         
         <!-- Навігація під слайдером -->
         <div class="slider-bottom-navigation">
             <!-- Навігаційні стрілки -->
             <div class="slider-navigation">
                 <button 
                     @click="prevSlide" 
                     class="nav-arrow prev"
                     :disabled="visibleNews.length <= 1"
                 >
                     <img src="/src/assets/images/arrow-prev.svg" alt="Previous" />
                 </button>
                 <div class="slider-pagination mobile">
                    <button 
                        v-for="(item, index) in visibleNews" 
                        :key="index"
                        @click="goToSlide(index)"
                        class="pagination-dot"
                        :class="{ 'active': index === currentSlide }"
                    >
                        <img src="/src/assets/images/slider-radiobutton.svg" alt="Slide" />
                    </button>
                </div>
                 <button 
                     @click="nextSlide" 
                     class="nav-arrow next"
                     :disabled="visibleNews.length <= 1"
                 >
                     <img src="/src/assets/images/arrow-next.svg" alt="Next" />
                 </button>
             </div>
             
             <!-- Пагінація -->
             <div class="slider-pagination desktop">
                 <button 
                     v-for="(item, index) in visibleNews" 
                     :key="index"
                     @click="goToSlide(index)"
                     class="pagination-dot"
                     :class="{ 'active': index === currentSlide }"
                 >
                     <img src="/src/assets/images/slider-radiobutton.svg" alt="Slide" />
                 </button>
             </div>
             
             <!-- Кнопка "ВСІ НОВИНИ" -->
             <div>
                <router-link :to="{name: 'all-news'}" class="fantasy-btn medium">
                    <span>Всі Новини</span>
                </router-link>
             </div>
         </div>
        </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.news-slider {
    position: relative;
    width: 100%;
    min-height: 485px;
    max-width: 1080px;
    padding: 0 15px 50px 15px;
    margin: 0 auto;
    padding-top: 50px;

    @media (max-width: 768px) {
        padding-top: 0;
    }

    .news-layout {
        display: flex;
        gap: 0;
        align-items: flex-start;

        @media (max-width: 1100px) {
            flex-direction: column;
            align-items: stretch;
        }
    }

    .news-main {
        flex: 1;
        min-width: 0;
        max-width: 1110px;
        order: 1;

        @media (max-width: 1100px) {
            max-width: 100%;
            order: 2;
        }
    }

    .news-actual {
        width: 240px;
        flex-shrink: 0;
        padding: 40px 0 0 30px;
        margin-left: 30px;
        align-self: stretch;
        position: relative;
        order: 2;

        &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 1px;
            background: linear-gradient(
                to bottom,
                transparent 3%,
                rgba(248, 248, 248, 0.15) 44%,
                rgba(248, 248, 248, 0.15) 38%,
                transparent 100%
            );
            pointer-events: none;
        }

        @media (max-width: 1100px) {
            order: 1;
            width: 100%;
            max-width: 100%;
            margin: 40px 0 30px;
            padding: 0;

            @media (max-width: 768px) {
                margin: 50px 0 50px 0;
            }

            &::before {
                display: none;
            }
        }

        &__title {
            font-family: "VollkornSC", sans-serif;
            font-weight: 400;
            font-size: 20px;
            line-height: 100%;
            letter-spacing: -0.07em;
            background: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin: 0 0 24px;

            @media (max-width: 1100px) {
                display: none;
            }
        }

        &__list-wrap {
            position: relative;

            @media (max-width: 1100px) {
                width: 100%;
            }
        }

        &__fade {
            position: absolute;
            pointer-events: none;
            z-index: 2;
            opacity: 0;
            transition: opacity 0.3s ease;

            &.is-visible {
                opacity: 1;
            }

            &--top,
            &--bottom {
                left: 0;
                right: 0;
                height: 56px;

                @media (max-width: 1100px) {
                    display: none;
                }
            }

            &--top {
                top: 0;
                background: linear-gradient(to bottom, #0a0a0a 0%, transparent 100%);
            }

            &--bottom {
                bottom: 0;
                background: linear-gradient(to top, #0a0a0a 0%, transparent 100%);
            }

            &--left,
            &--right {
                top: 0;
                bottom: 0;
                width: 48px;
                display: none;

                @media (max-width: 1100px) {
                    display: block;
                }
            }

            &--left {
                left: 0;
                background: linear-gradient(to right, #0a0a0a 0%, transparent 100%);
            }

            &--right {
                right: 0;
                background: linear-gradient(to left, #0a0a0a 0%, transparent 100%);
            }
        }

        &__list {
            position: relative;
            max-height: 480px;
            overflow-y: auto;
            overflow-x: hidden;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            -ms-overflow-style: none;

            &::-webkit-scrollbar {
                display: none;
            }

            @media (max-width: 1100px) {
                display: flex;
                flex-direction: row;
                align-items: stretch;
                max-height: none;
                overflow-x: auto;
                overflow-y: hidden;
                width: 100%;
                padding: 0;
            }
        }

        &__item {
            margin-bottom: 24px;

            &:last-child {
                margin-bottom: 0;
            }

            @media (max-width: 1100px) {
                position: relative;
                flex: 0 0 auto;
                margin-bottom: 0;
                padding: 0 24px;
                box-sizing: border-box;

                &:first-child {
                    padding-left: 0;
                }

                &:not(:first-child)::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 1px;
                    background: linear-gradient(
                        to bottom,
                        transparent 0%,
                        rgba(248, 248, 248, 0.15) 12%,
                        rgba(248, 248, 248, 0.15) 88%,
                        transparent 100%
                    );
                    pointer-events: none;
                }
            }

            @media (hover: none) and (pointer: coarse) {
                &:hover {
                    opacity: 1;
                }
            }
        }

        &__meta {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 6px;
        }

        &__date {
            font-weight: 400;
            font-size: 14px;
            line-height: 100%;
            color: rgba(248, 248, 248, 0.5);
        }

        &__tag {
            font-weight: 400;
            font-size: 14px;
            line-height: 100%;
        }

        &__text {
            font-family: "Candara", sans-serif;
            font-weight: 400;
            font-size: 14px;
            line-height: 150%;
            letter-spacing: -0.01em;
            color: #f8f8f8;
            margin: 0;

            @media (max-width: 1100px) {
                font-size: 15px;
            }
        }
    }
    
    
    .slider-container {
        display: flex;
        height: 500px;
        border-radius: 12px;
        overflow: hidden;
        position: relative;
        user-select: none; // Запобігає виділенню тексту при свайпі
        -webkit-user-select: none;
        -webkit-touch-callout: none; // Відключає контекстне меню на iOS
        
        @media (max-width: 768px) {
            flex-direction: column;
            gap: 0px;
            height: 500px;
        }
    }

    .slider-content-container {
        width: 100%;
        max-width: 140px;
        position: relative;
        @media (max-width: 768px) {
            max-width: 100%;
            height: 100%;
        }
    }
    
    .slider-content {
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
            transform: translateY(0);
        }
        
    }
    
    .news-header {
        margin-bottom: 20px;
        
        .news-category {
            font-weight: 400;
            font-size: 20px;
            line-height: 100%;
            letter-spacing: -0.07em;
            background: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
    }
    
    .news-text-container {
        flex: 1;
        position: relative;
        overflow: hidden;
    }
    
    .news-text-slide {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        opacity: 0;
        transform: translateY(80px);
        z-index: -1;
        &.active {
            z-index: 1;
            transition: all 1s ease;
            opacity: 1;
            transform: translateY(0px);
        }
    }
    
    .news-title {
        font-weight: 400;
        font-size: 40px;
        line-height: 120%;
        letter-spacing: -0.07em;
        color: #f8f8f8;
        
    }
    
    .news-description {
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
    
    .news-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        margin-bottom: 20px;
        position: relative;
        
        .news-date {
            font-weight: 400;
            font-size: 16px;
            line-height: 60%;
            text-align: center;
            color: #f8f8f8;
        }
        
        .read-more-btn {
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
    }
    
    
    
    .slider-bottom-navigation {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: clamp(20px, 2vw, 40px);
        padding: 0 20px;
        
        @media (max-width: 768px) {
            gap: 30px;
            flex-direction: column;
            align-items: center;
        }
    }
    
    .slider-navigation {
        display: flex;
        gap: 30px;

        @media (max-width: 768px) {
            align-items: center;
            justify-content: space-between;
            width: 100%;
        }
        
        .nav-arrow {
            border: none;
            background: transparent;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;

            img {
                width: 36px;
                height: 36px;
            }

            &:active {
                transform: scale(0.8);
            }
            
            &:hover:not(:disabled) {
                opacity: 0.5;
            }
            
            // Прибрати hover ефект для мобільних пристроїв
            @media (hover: none) and (pointer: coarse) {
                &:hover:not(:disabled) {
                    opacity: 1;
                }
            }
            
            &:disabled {
                opacity: 0.3;
                cursor: not-allowed;
            }
        }
    }
    
    .slider-pagination {
        display: flex;
        gap: 20px;

        &.desktop {

            @media (max-width: 768px) {
                display: none;
            }
        }

        &.mobile {
            display: none;

            @media (max-width: 768px) {
                display: flex;
            }
        }
        
        .pagination-dot {
            width: 14px;
            height: 14px;
            border: none;
            background: transparent;
            cursor: pointer;
            transition: all 0.3s ease;
            
            &:disabled {
                cursor: not-allowed;
            }
            
            img {
                opacity: 0.5;
                width: 100%;
                height: 100%;
                transition: all 0.3s ease;
            }
            
            &.active img {
                opacity: 1;
            }
            
            &:hover:not(.active) img {
                transform: scale(1.1);
            }
            
            // Прибрати hover ефект для мобільних пристроїв
            @media (hover: none) and (pointer: coarse) {
                &:hover:not(.active) img {
                    transform: scale(1);
                }
            }
        }
    }

    .slider-image-frame {
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
        
        .frame-image {
            width: 100%;
            height: 100%;
            object-position: center;
        }
    }
    
    .slider-image {
        max-width: 850px;
        max-height: 485px;
        width: 100%;
        height: 100%;
        position: relative;
        overflow: hidden;

        @media (max-width: 768px) {
            min-height: 235px;
        }
    }
    
    .image-slide {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        opacity: 0;
        transition: opacity 0.6s ease-in-out;
        
        img {
            border-radius: 16px;
        }
        
        &.active {
            opacity: 1;
        }
    }
    
     .news-image {
         width: 100%;
         height: 100%;
         object-fit: cover;
         object-position: center;
     }
     
     .image-gradient {
         position: absolute;
         top: 0;
         left: 0;
         width: 50%;
         bottom: 0;
         background: linear-gradient(to right, #0A0A0A 6%, transparent 100%);
         pointer-events: none;
         z-index: 1;
     }
    
     .all-news-btn {
         padding: 12px 24px;
         background: rgba(0, 0, 0, 0.7);
         color: #fff;
         text-decoration: none;
         border: 1px solid #444;
         border-radius: 6px;
         font-weight: 600;
         font-size: 14px;
         text-transform: uppercase;
         letter-spacing: 1px;
         transition: all 0.3s ease;
         
         &:hover {
             background: rgba(255, 215, 0, 0.1);
             border-color: #ffd700;
             color: #ffd700;
         }
         
         // Прибрати hover ефект для мобільних пристроїв
         @media (hover: none) and (pointer: coarse) {
             &:hover {
                 background: rgba(0, 0, 0, 0.7);
                 border-color: #444;
                 color: #fff;
             }
         }
     }
    
    .no-news {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 300px;
        background: rgba(93, 119, 144, 0.1);
        border-radius: 12px;
        
        p {
            color: #888;
            font-size: 1.2rem;
        }
    }
}

</style>