<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import { ref, onMounted, onUnmounted, computed } from 'vue';
import Button from 'primevue/button';
import { useAsyncCallWrapper } from '@/composables/useAsyncCallWrapper';
import { fetchGet, fetchPost } from '@/utils/fetchApi';
import type { News } from '@/models/news';
import { useRouter } from 'vue-router';
import { useMitt } from '@/composables/useMitt';

const baseURL = import.meta.env.VITE_BASE_URL
const news = ref<News[]>([])
const currentSlide = ref(0)
const isAnimating = ref(false)
const userStore = useUserStore()

// Touch events для свайпу
const touchStartX = ref(0)
const touchStartY = ref(0)
const touchEndX = ref(0)
const touchEndY = ref(0)
const minSwipeDistance = 50 // Мінімальна відстань для визнання свайпу
const {wrapAsyncCall} = useAsyncCallWrapper()
const router = useRouter()
const emitter = useMitt()

// Обмежуємо кількість слайдів до 3
const visibleNews = computed(() => {
    const filteredNews = news.value
    return filteredNews.slice(0, 3)
})

onMounted(async () => {
    await loadNews()
    
    emitter.on('login', () => {
        loadNews()
    })
});

const loadNews = async () => {
    await wrapAsyncCall( async () => {
        const {data} = await fetchGet('getNews')
        news.value = data
    })
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

const deleteNews = async (id: number) => {
    await wrapAsyncCall(async () => {
        await fetchPost('deleteNews', {id})
        const {data} = await fetchGet('getNews')
        news.value = data
        // Скидаємо поточний слайд якщо він більше не існує
        if (currentSlide.value >= visibleNews.value.length) {
            currentSlide.value = 0
        }
    })
}

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
        <Button 
            v-if="userStore.isAdmin" 
            v-tooltip="'Створити нову новину'" 
            icon="pi pi-plus" 
            @click="router.push({name: 'news-creation'})" 
            class="success admin-btn"
        />
        
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
                        <p class="news-description" v-html="item.text.replace(/\n/g, '<br>')"></p>
                        <div class="news-meta">
                            <span class="news-date">{{ new Date(item.created_at).toLocaleDateString('uk-UA') }}</span>
                            <router-link 
                                :to="{name: 'single-news', params: {id: item.id}}" 
                                class="read-more-btn"
                            >
                                Читати Далі
                            </router-link>
                        </div>
                        
                        <!-- Адмін кнопки -->
                        <div v-if="userStore.isAdmin" class="admin-controls">
                            <Button 
                                v-tooltip="'Редагувати новину'" 
                                icon="pi pi-pencil" 
                                @click="router.push({name: 'news-creation', params: {id: item.id}})" 
                                class="primary"
                                size="small"
                            />
                            <Button 
                                v-tooltip="'Видалити новину'" 
                                icon="pi pi-trash" 
                                @click="deleteNews(item.id)" 
                                class="danger"
                                size="small"
                            />
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
                <router-link :to="{name: 'all-news'}" class="fantasy-btn">
                    <span>Всі Новини</span>
                </router-link>
             </div>
         </div>
    </div>
</template>

<style scoped lang="scss">
.news-slider {
    position: relative;
    width: 100%;
    min-height: 500px;
    max-width: 1110px;
    padding: 0 15px 50px 15px;
    margin: 0 auto;
    padding-top: 50px;

    @media (max-width: 768px) {
        padding-top: 0;
    }
    
    .admin-btn {
        position: absolute;
        top: -60px;
        right: 0;
        z-index: 10;
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
            gap: 50px;
            height: 600px;
        }
    }

    .slider-content-container {
        width: 100%;
        max-width: 240px;
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
        line-height: 110%;
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
    
    .admin-controls {
        display: flex;
        gap: 10px;
        margin-top: 20px;
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
                
                @media (max-width: 768px) {
                    width: 40px;
                    height: 40px;
                }
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
        gap: 8px;

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
            width: 18px;
            height: 18px;
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
        max-height: 610px;
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
         background: linear-gradient(to right, #0A0A0A 0%, transparent 100%);
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