<script setup lang='ts'>
import { onMounted, ref, computed, watch, nextTick } from 'vue';
import { useAsyncCallWrapper } from '@/composables/useAsyncCallWrapper'
import {fetchGet} from '@/utils/fetchApi'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import type { News } from '@/models/news';
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';

const route = useRoute()
const {wrapAsyncCall} = useAsyncCallWrapper()
const toast = useToast()
const singleNews = ref<News>()
const allNews = ref<News[]>([])
const baseURL = import.meta.env.VITE_BASE_URL

// Функція для розбиття заголовка на дві половини
const splitTitle = (title: string) => {
    if (!title) return { firstHalf: '', secondHalf: '' }
    
    const words = title.split(' ')
    
    // Якщо 2 або менше слів, не розбиваємо
    if (words.length <= 2) {
        return {
            firstHalf: title,
            secondHalf: ''
        }
    }
    
    const midPoint = Math.ceil(words.length / 2)
    
    return {
        firstHalf: words.slice(0, midPoint).join(' '),
        secondHalf: words.slice(midPoint).join(' ')
    }
}

// Отримуємо три останні новини (окрім поточної)
const relatedNews = computed(() => {
    const filteredNews = allNews.value.filter(n => !n.isHidden && n.id !== singleNews.value?.id)
    return filteredNews.slice(0, 3)
})

// Функція для завантаження даних новини
const loadNewsData = async () => {
    wrapAsyncCall(async () => {
        const {data} = await fetchGet('getNews')
        allNews.value = data
        singleNews.value = data.find((news: News) => news.id === +route.params.id)
    })
}

// Функція для копіювання посилання в буфер обміну
const copyLinkToClipboard = async () => {
    try {
        const currentUrl = window.location.href
        await navigator.clipboard.writeText(currentUrl)
        toast.success('Посилання скопійовано в буфер обміну!')
    } catch (err) {
        console.error('Помилка при копіюванні посилання:', err)
        // Fallback для старих браузерів
        try {
            const textArea = document.createElement('textarea')
            textArea.value = window.location.href
            document.body.appendChild(textArea)
            textArea.select()
            document.execCommand('copy')
            document.body.removeChild(textArea)
            toast.success('Посилання скопійовано в буфер обміну!')
        } catch (fallbackErr) {
            toast.error('Не вдалося скопіювати посилання')
        }
    }
}


onMounted(() => {
    loadNewsData()
})

// Відстежуємо зміни в route.params.id для оновлення даних при переході між новинами
watch(() => route.params.id, () => {
    loadNewsData()
})

// Image preview like in SupportChatTheme.vue
const fullscreenImage = ref<string | null>(null)
const openImageFullscreen = (src: string) => {
    fullscreenImage.value = src
    nextTick(() => {
        const el = document.getElementById('fullscreen-image-modal')
        if (el && (el as any).requestFullscreen) {
            (el as any).requestFullscreen()
        }
    })
}
const closeImageFullscreen = () => {
    fullscreenImage.value = null
    if (document.fullscreenElement) {
        document.exitFullscreen()
    }
}

</script>
<template>
    <Header />
    <div class="single-news">
        <div class="single-news">
            <div class="single-news__inner">
                <div class="single-news__image-container">
                    <img class="single-news__image" :src="baseURL + '/files/' + singleNews?.image" :alt="singleNews?.title"></img>
                    <img src="@/assets/images/separate-news-top-img-mask.png" class="single-news__mask-bottom" alt="news mask bottom">
                </div>
                
                <!-- Заголовок секція як на скріншоті -->
                <div class="single-news__header">
                    <div class="single-news__header-left">
                        <div class="single-news__date-news">
                            <span class="single-news__date">{{ new Date(singleNews?.created_at || '').toLocaleDateString('uk-UA') }}</span>
                            <svg width="9" height="10" viewBox="0 0 9 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7.5 4.59623V5.71237L5.05807 8.1543H3.94186L1.5 5.71244V4.59616L3.94186 2.1543H5.05807L7.5 4.59623Z" fill="#F8F8F8" />
                                <path d="M7.5 4.59623V5.71237L5.05807 8.1543H3.94186L1.5 5.71244V4.59616L3.94186 2.1543H5.05807L7.5 4.59623Z" fill="url(#paint0_linear_280_1308)" />
                                <path d="M9 4.31719V5.9914L5.33711 9.6543H3.66279L0 5.99151V4.31709L3.66279 0.654297H5.33711L9 4.31719ZM1.56977 4.96727V5.34132L4.31298 8.08453H4.68692L7.43023 5.34122V4.96738L4.68692 2.22406H4.31298L1.56977 4.96727Z" fill="url(#paint1_linear_280_1308)" />
                                <defs>
                                    <linearGradient id="paint0_linear_280_1308" x1="4.5" y1="2.58287" x2="4.5" y2="7.72573" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#17181D" />
                                    <stop offset="0.317308" stop-color="#1D1E22" />
                                    <stop offset="1" />
                                    </linearGradient>
                                    <linearGradient id="paint1_linear_280_1308" x1="7.125" y1="-8.8457" x2="7.125" y2="14.6249" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#F8F8F8" />
                                    <stop offset="0.7" stop-color="#FADFAE" />
                                    <stop offset="1" stop-color="#FBD298" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            
                        </div>
                        <h1 class="single-news__welcome-title">
                            {{ splitTitle(singleNews?.title || '').firstHalf }}
                            <br v-if="splitTitle(singleNews?.title || '').secondHalf">
                            {{ splitTitle(singleNews?.title || '').secondHalf }}
                        </h1>
                    </div>
                    <div class="single-news__header-right">
                        <button class="single-news__share-btn fantasy-btn" @click="copyLinkToClipboard">
                            <span>Поділитися</span>
                        </button>
                    </div>
                </div>
                 <div class="single-news__text-container">
                     <img src="@/assets/images/single-news-text-divider.svg" class="single-news__text-img" alt="news text img"></img>
                     <p class="single-news__text" v-html="singleNews?.text.replace(/\n/g, '<br>')" 
                        @click="(e) => { const t = e.target as HTMLElement; if (t && t.tagName === 'IMG') { openImageFullscreen((t as HTMLImageElement).src) } }"
                     ></p>
                     <img src="@/assets/images/single-news-text-divider.svg" class="single-news__text-img" alt="news text img"></img>
                 </div>
             </div>
         </div>
         
         <!-- Блок з пов'язаними новинами -->
         <div v-if="relatedNews.length > 0" class="related-news">
             <h2 class="related-news__title">Вас також може зацікавити:</h2>
             <div class="related-news__grid">
                 <div 
                     v-for="newsItem in relatedNews" 
                     :key="newsItem.id"
                     class="related-news__card"
                 >
                     <div class="related-news__image-container">
                         <img 
                             :src="baseURL + '/files/' + newsItem.image" 
                             :alt="newsItem.title"
                             class="related-news__image"
                         />
                         <!-- Маска поверх картинки -->
                         <div class="related-news__image-frame">
                             <img src="@/assets/images/slider-image-frame.png" alt="Frame" class="related-news__frame-image" />
                         </div>
                     </div>
                     <div class="related-news__content">
                         <div class="related-news__category">Новини</div>
                         <h3 class="related-news__card-title">
                             {{ newsItem.title }}
                         </h3>
                         <p class="related-news__description" v-html="newsItem.text.replace(/\n/g, '<br>').substring(0, 150) + '...'"></p>
                         <div class="related-news__meta">
                             <span class="related-news__date">{{ new Date(newsItem.created_at).toLocaleDateString('uk-UA') }}</span>
                             <router-link 
                                 :to="{name: 'single-news', params: {id: newsItem.id}}" 
                                 class="related-news__read-more"
                             >
                                 Читати Далі
                             </router-link>
                         </div>
                     </div>
                 </div>
             </div>
         </div>
     </div>
     <Footer />

    <div v-if="fullscreenImage" id="fullscreen-image-modal" class="fullscreen-image-modal" @click.self="closeImageFullscreen">
        <img :src="fullscreenImage" alt="image" />
        <button class="close-btn" @click="closeImageFullscreen">×</button>
    </div>
</template>
<style scoped lang='scss'>
.single-news {
    position: relative;
    color: #f8f8f8;

    &__image-container {
        width: 100%;
        max-height: 600px;
        height: 100%;
        overflow: hidden;
        position: relative;

        @media (max-width: 768px) {
            height: 50dvh;
        }

        &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(
                180deg,
                rgba(0, 0, 0, 0) 0%,
                rgba(0, 0, 0, 0.2) 30%,
                rgba(0, 0, 0, 0.3) 70%,
                rgba(0, 0, 0, 0.7) 100%
            );
            z-index: 2;
        }
    }

    &__image {
        width: 100%;
        object-fit: cover;
        height: 100%;
        object-position: center;
    }

    &__mask-bottom {
        position: absolute;
        bottom: -1px;
        left: -1px;
        width: 100%;
        height: clamp(150px, 11vw, 200px);
        z-index: 3;
    }

    &__header {
        display: flex;
        justify-content: space-between;
        align-items: end;
        padding: 0 15px;
        position: relative;
        z-index: 4;
        max-width: 1110px;
        margin: 0 auto;
        top: -70px;

        @media (max-width: 768px) {
            flex-direction: column;
            gap: 20px;
            top: -50px;
            align-items: flex-start;
        }
    }

    &__share-btn {
        position: relative;
        right: 20px;

        @media (max-width: 768px) {
            right: -20px;
        }
    }

    &__header-left {
        flex: 1;
    }

    &__header-right {
        display: flex;
        align-items: center;
    }

    &__date-news {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 20px;
        font-size: 14px;
        color: #f8f8f8;
    }

    &__date {
        font-weight: 400;
        font-size: 16px;
        line-height: 100%;
        letter-spacing: -0.07em;
        background: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    &__separator {
        color: #f8f8f8;
        font-size: 12px;
    }

    &__news-label {
        font-weight: 400;
    }

    &__welcome-title {
        font-weight: 400;
        font-size: clamp(32px, 4vw, 64px);
        line-height: 90%;
        letter-spacing: -0.06em;
        color: #f8f8f8;
    }

    &__text-container {
        padding: 0 15px;
        max-width: 630px;
        margin: 0 auto;
        font-family: 'Candara', sans-serif;
    }

     &__text {
         font-size: clamp(12px, 2vw, 16px);
         line-height: 170%;
         letter-spacing: -0.01em;
         color: #f8f8f8;
         padding: 50px 0;

         &-img {
            width: 100%;
         }

         ::v-deep img {
            max-width: 100%;
            height: auto;
            cursor: zoom-in;
         }

         ::v-deep ul,
         ::v-deep ol {
            padding-left: 15px;
         }

         ::v-deep figure {
            width: 100% !important;
         }

         ::v-deep figure img {
            border-radius: 10px;
         }
     }
}

.related-news {
    padding: 80px 15px;
    max-width: 1110px;
    margin: 0 auto;

    @media (max-width: 768px) {
        padding: 40px 15px;
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

    &__grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 30px;

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

.fullscreen-image-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    cursor: zoom-out;
    transition: background 0.2s;

    img {
        width: auto;
        max-width: 95vw;
        max-height: 90vh;
        border-radius: 10px;
        box-shadow: 0 0 20px #000a;
        background: #fff;
        cursor: default;
    }

    .close-btn {
        position: absolute;
        top: 30px;
        right: 40px;
        font-size: 2.5rem;
        color: #fff;
        background: none;
        border: none;
        cursor: pointer;
        z-index: 10001;
        transition: color 0.2s;
    }

    .close-btn:hover {
        color: #e26f0f;
    }
}
</style>