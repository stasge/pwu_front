<script setup lang="ts">
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import { ref, computed, onMounted } from 'vue';
import { useAsyncCallWrapper } from '@/composables/useAsyncCallWrapper'
import { fetchGet } from '@/utils/fetchApi'
import type { News } from '@/models/news';

const openQuestions = ref<Set<number>>(new Set());

const faqData = [
    {
        question: "Коли День Народження сервера?",
        answer: "23.05.2025 в 19:00"
    },
    {
        question: "Чи буде оновлюватись версія?",
        answer: "Використовуємо обрізану версію 1.4.2. В подальшому плануємо оновлюватись на більш нові версії. Але це буде поступово і всі глобальні введення будуть виноситись на голосування гравців."
    },
    {
        question: "Чому старт з 1.3.6?",
        answer: "Не будемо приховувати, що велику роль зіграв Ностальджі ефект. Так, багато кому цікаві більш новіші версії... Але в Ds, нас вже 1676 (на момент написання цього тексту), а отже є і поціновувачі давнини."
    },
    {
        question: "Чи є клановий бонус за перехід?",
        answer: "Ні, такого бонусу не буде. Наразі працює реферальна програма."
    },
    {
        question: "Чи призиваються літаючі пети дру у данжах?",
        answer: "Ні, налаштування петів канонічні і мають стандартний розподіл на земних, повітряних і водяних."
    },
    {
        question: "Чи будуть гіпери чи кланові бафи на отримання досвіду?",
        answer: "Для збільшення отримання доступу в шопі є Секретна книга (+50% досвіду). Паті/клан бафу в цій версії не буде. Гіпери найближчим часом також вводитись не будуть."
    },
    {
        question: "Шари в шопі.",
        answer: "Відсутні."
    }
];

function toggleQuestion(index: number) {
    if (openQuestions.value.has(index)) {
        openQuestions.value.delete(index);
    } else {
        openQuestions.value.add(index);
    }
}

function isQuestionOpen(index: number): boolean {
    return openQuestions.value.has(index);
}

const leftColumnQuestions = computed(() => {
    return faqData.slice(0, Math.ceil(faqData.length / 2));
});

const rightColumnQuestions = computed(() => {
    return faqData.slice(Math.ceil(faqData.length / 2));
});

// Updates-only news grid under promo
const { wrapAsyncCall } = useAsyncCallWrapper()
const baseURL = import.meta.env.VITE_BASE_URL
const updatesNews = ref<News[]>([])
const currentUpdatesPage = ref(1)
const updatesPerPage = 3 // one row, 3 items

const filteredUpdates = computed(() => {
    return updatesNews.value.filter(n => !n.isHidden)
})

const paginatedUpdates = computed(() => {
    const start = (currentUpdatesPage.value - 1) * updatesPerPage
    const end = start + updatesPerPage
    return filteredUpdates.value.slice(start, end)
})

const totalUpdatesPages = computed(() => {
    return Math.ceil(filteredUpdates.value.length / updatesPerPage)
})

const goToUpdatesPage = (page: number) => {
    if (page >= 1 && page <= totalUpdatesPages.value) {
        currentUpdatesPage.value = page 
    }
}

const prevUpdatesPage = () => {
    if (currentUpdatesPage.value > 1) {
        goToUpdatesPage(currentUpdatesPage.value - 1)
    }
}

const nextUpdatesPage = () => {
    if (currentUpdatesPage.value < totalUpdatesPages.value) {
        goToUpdatesPage(currentUpdatesPage.value + 1)
    }
}

const loadUpdates = async () => {
    await wrapAsyncCall(async () => {
        const { data } = await fetchGet('getNews', { options: 'updates' })
        updatesNews.value = data.news || []
    })
}

onMounted(() => {
    loadUpdates()
})
</script>
<template>
    <Header />
    <div class="about">
        <div class="about__inner">
            <div class="about__top">
                <img class="about__top-img w-full" src="@/assets/images/about-main-img.jpg" alt="About Server">
                <img class="about__top-mask" src="@/assets/images/hero-mask.png" alt="about-mask">
            </div>
            
            <div class="about__content">
                <div class="about__content-left">
                    <h2 class="about__content-title">
                        <span>Загальна</span> 
                        <span>інформація</span> 
                        <span>про клієнт</span>
                    </h2>
                </div>
                
                <div class="about__content-right">
                    <div class="about__content-section">
                        <h3 class="about__content-section-title">Інформація про сервер:</h3>
                        <div class="about__content-list">
                            <div class="about__content-item">
                                <span class="about__content-label">Версія:</span>
                                <span class="about__content-value">1.3.6</span>
                            </div>
                            <div class="about__content-item">
                                <span class="about__content-label">Кільк. рас:</span>
                                <span class="about__content-value">3 раси / 6 класів</span>
                            </div>
                            <div class="about__content-item">
                                <span class="about__content-label">Рейти:</span>
                                <span class="about__content-value">X1</span>
                            </div>
                            <div class="about__content-item">
                                <span class="about__content-label">Макс. рівень:</span>
                                <span class="about__content-value">105</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="about__content-section">
                        <h3 class="about__content-section-title">Особливості проєкту:</h3>
                        <div class="about__content-features">
                            <div class="about__content-feature">Україномовний контент</div>
                            <div class="about__content-feature">Власна база даних - <a href="https://db.valor.in.ua/" target="_blank">https://db.valor.in.ua/</a></div>
                            <div class="about__content-feature">Спрощена система реєстрації для декількох акаунтів</div>
                            <div class="about__content-feature">Змінена нагорода для щомісячних перегонів</div>
                            <div class="about__content-feature">Автошлях, 109 данж відсутній</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="about__promo">
                <img class="about__promo-img w-full" src="@/assets/images/about-promo-img.jpg" alt="promo">
                <div class="about__promo-content">
                    <h3 class="about__promo-title">Промокод для Нових Гравців:</h3>
                    <div class="about__promo-main">
                        <span class="about__promo-start">Start_23.05.2025</span>
                    </div>
                    <div class="about__promo-separator">
                        <svg width="360" height="9" viewBox="0 0 360 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M182.666 4.3122V5.30433L180.496 7.47494L179.504 7.47494L177.333 5.30439V4.31214L179.504 2.1416H180.496L182.666 4.3122Z" fill="url(#paint0_linear_282_1898)" />
                            <path d="M184 4.0645V5.55269L180.744 8.80859H179.256L176 5.55278V4.06441L179.256 0.808594L180.744 0.808594L184 4.0645ZM177.395 4.64235V4.97484L179.834 7.41325H180.166L182.605 4.97475V4.64244L180.166 2.20394H179.834L177.395 4.64235Z" fill="url(#paint1_linear_282_1898)" />
                            <path d="M0.673746 2.80858C4.09209 2.80858 173.87 4.05892 174 4.05892V5.55913C173.87 5.55913 4.08817 6.80858 0.669819 6.80858C-0.225822 5.44426 -0.222024 4.17264 0.673746 2.80858Z" fill="url(#paint2_linear_282_1898)" />
                            <path d="M359.326 2.8086C355.908 2.8086 186.13 4.05892 186 4.05892V5.55913C186.13 5.55913 355.912 5.8086 359.33 5.8086C360.226 4.44428 360.222 4.17266 359.326 2.8086Z" fill="url(#paint3_linear_282_1898)" />
                            <defs>
                                <linearGradient id="paint0_linear_282_1898" x1="180" y1="2.52255" x2="180" y2="7.09398" gradientUnits="userSpaceOnUse">
                                <stop stop-color="#17181D" />
                                <stop offset="0.317308" stop-color="#1D1E22" />
                                <stop offset="1" />
                                </linearGradient>
                                <linearGradient id="paint1_linear_282_1898" x1="169.793" y1="-5.1914" x2="169.793" y2="11.5733" gradientUnits="userSpaceOnUse">
                                <stop stop-color="#F8F8F8" />
                                <stop offset="0.7" stop-color="#FADFAE" />
                                <stop offset="1" stop-color="#FBD298" />
                                </linearGradient>
                                <linearGradient id="paint2_linear_282_1898" x1="169.793" y1="-5.1914" x2="169.793" y2="11.5733" gradientUnits="userSpaceOnUse">
                                <stop stop-color="#F8F8F8" />
                                <stop offset="0.7" stop-color="#FADFAE" />
                                <stop offset="1" stop-color="#FBD298" />
                                </linearGradient>
                                <linearGradient id="paint3_linear_282_1898" x1="169.793" y1="-5.1914" x2="169.793" y2="11.5733" gradientUnits="userSpaceOnUse">
                                <stop stop-color="#F8F8F8" />
                                <stop offset="0.7" stop-color="#FADFAE" />
                                <stop offset="1" stop-color="#FBD298" />
                                </linearGradient>
                            </defs>
                            </svg>
                    </div>
                    <div class="about__promo-rewards">
                        <div class="about__promo-reward">
                            <img src="@/assets/images/hp-amulet.png" alt="Золотий Амулет" class="about__promo-reward-icon">
                            <span class="about__promo-reward-text">Золотий Амулет</span>
                        </div>
                        <div class="about__promo-reward">
                            <img src="@/assets/images/mp-amulet.png" alt="Золотий Ідол" class="about__promo-reward-icon">
                            <span class="about__promo-reward-text">Золотий Ідол</span>
                        </div>
                        <div class="about__promo-reward">
                            <img src="@/assets/images/rupor.png" alt="Рупор x5" class="about__promo-reward-icon">
                            <span class="about__promo-reward-text">Рупор x5</span>
                        </div>
                    </div>
                </div>
                <img src="@/assets/images/CTA-mask.png" class="about__promo-mask-top" alt="promo mask top">
                <img src="@/assets/images/CTA-mask.png" class="about__promo-mask-bottom" alt="promo mask bottom">
            </div>
            
            <!-- Updates grid under promo -->
            <div v-if="paginatedUpdates.length > 0" class="about-news-grid">
                <div class="about-news-grid__header">
                    <h2 class="about-news-grid__title">Оновлення на Сервері:</h2>
                </div>
                <div v-if="paginatedUpdates.length > 0" class="about-news-grid__container">
                    <div 
                        v-for="newsItem in paginatedUpdates" 
                        :key="newsItem.id"
                        class="about-news-grid__card"
                    >
                        <div class="about-news-grid__image-container">
                            <img 
                                :src="baseURL + '/files/' + newsItem.image" 
                                :alt="newsItem.title"
                                class="about-news-grid__image"
                            />
                            <div class="about-news-grid__image-frame">
                                <img src="@/assets/images/slider-image-frame.png" alt="Frame" class="about-news-grid__frame-image" />
                            </div>
                        </div>
                        <div class="about-news-grid__content">
                            <div class="about-news-grid__category">Оновлення</div>
                            <h3 class="about-news-grid__card-title">
                                {{ newsItem.title }}
                            </h3>
                            <p class="about-news-grid__description" v-html="newsItem.text.replace(/\n/g, '<br>').substring(0, 150) + '...'"></p>
                            <div class="about-news-grid__meta">
                                <span class="about-news-grid__date">{{ new Date(newsItem.created_at).toLocaleDateString('uk-UA') }}</span>
                                <router-link 
                                    :to="{name: 'single-news', params: {id: newsItem.id}}" 
                                    class="about-news-grid__read-more"
                                >
                                    Читати Далі
                                </router-link>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Pagination -->
                <div v-if="totalUpdatesPages > 1" class="about-pagination">
                    <button 
                        @click="prevUpdatesPage" 
                        class="about-pagination__arrow"
                        :disabled="currentUpdatesPage === 1"
                        aria-label="Previous page"
                    >
                        <img src="@/assets/images/arrow-prev.svg" alt="prev" class="about-pagination__arrow-icon" />
                    </button>
                    <div class="about-pagination__numbers">
                        <button 
                            v-for="page in Math.min(5, totalUpdatesPages)" 
                            :key="page"
                            @click="goToUpdatesPage(page)"
                            class="about-pagination__number"
                            :class="{ 'active': page === currentUpdatesPage }"
                            :aria-current="page === currentUpdatesPage ? 'page' : undefined"
                        >
                            {{ page }}
                        </button>
                        <span v-if="totalUpdatesPages > 5" class="about-pagination__dots">...</span>
                        <button 
                            v-if="totalUpdatesPages > 5"
                            @click="goToUpdatesPage(totalUpdatesPages)"
                            class="about-pagination__number"
                            :class="{ 'active': totalUpdatesPages === currentUpdatesPage }"
                            :aria-current="totalUpdatesPages === currentUpdatesPage ? 'page' : undefined"
                        >
                            {{ totalUpdatesPages }}
                        </button>
                    </div>
                    <button 
                        @click="nextUpdatesPage" 
                        class="about-pagination__arrow"
                        :disabled="currentUpdatesPage === totalUpdatesPages"
                        aria-label="Next page"
                    >
                        <img src="@/assets/images/arrow-next.svg" alt="next" class="about-pagination__arrow-icon" />
                    </button>
                </div>
            </div>

            <div class="about__faq">
                <h2 class="about__faq-title"><span>Часті</span> <span>запитання:</span></h2>
                <div class="about__faq-list">
                    <div class="about__faq-column">
                        <div 
                            v-for="(item, index) in leftColumnQuestions" 
                            :key="index" 
                            class="about__faq-item"
                            :class="{ 'about__faq-item--open': isQuestionOpen(index) }"
                        >
                            <img v-if="index === 0" src="@/assets/images/faq-divider.svg" alt="divider" class="about__faq-divider about__faq-divider--top">
                            <button 
                                class="about__faq-question" 
                                @click="toggleQuestion(index)"
                            >
                                <span class="about__faq-question-text">{{ item.question }}</span>
                                <svg class="about__faq-icon" width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M23.586 7.8802C22.609 7.75046 20.4811 7.7062 19.785 8.56705C19.6002 8.79554 19.3526 9.21794 19.0326 9.76378C14.161 18.0744 9.83857 18.0745 4.96692 9.76379C4.64695 9.21794 4.39934 8.79554 4.21458 8.56705C3.51849 7.7062 1.39054 7.75046 0.413574 7.8802L10.9923 19.8086H13.0073L23.586 7.8802Z" fill="url(#paint0_linear_283_1914)" />
                                    <defs>
                                        <linearGradient id="paint0_linear_283_1914" x1="23.586" y1="9.98101" x2="4.16205" y2="9.98101" gradientUnits="userSpaceOnUse">
                                        <stop stop-color="#F8F8F8" />
                                        <stop offset="0.7" stop-color="#FADFAE" />
                                        <stop offset="1" stop-color="#FBD298" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </button>
                            <div class="about__faq-answer">
                                <div class="about__faq-answer-content">
                                    {{ item.answer }}
                                </div>
                            </div>
                            <img src="@/assets/images/faq-divider.svg" alt="divider" class="about__faq-divider about__faq-divider--bottom">
                        </div>
                    </div>
                    <div class="about__faq-column">
                        <div 
                            v-for="(item, index) in rightColumnQuestions" 
                            :key="index + leftColumnQuestions.length" 
                            class="about__faq-item"
                            :class="{ 'about__faq-item--open': isQuestionOpen(index + leftColumnQuestions.length) }"
                        >
                            <img v-if="index === 0" src="@/assets/images/faq-divider.svg" alt="divider" class="about__faq-divider about__faq-divider--top">
                            <button 
                                class="about__faq-question" 
                                @click="toggleQuestion(index + leftColumnQuestions.length)"
                            >
                                <span class="about__faq-question-text">{{ item.question }}</span>
                                <svg class="about__faq-icon" width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M23.586 7.8802C22.609 7.75046 20.4811 7.7062 19.785 8.56705C19.6002 8.79554 19.3526 9.21794 19.0326 9.76378C14.161 18.0744 9.83857 18.0745 4.96692 9.76379C4.64695 9.21794 4.39934 8.79554 4.21458 8.56705C3.51849 7.7062 1.39054 7.75046 0.413574 7.8802L10.9923 19.8086H13.0073L23.586 7.8802Z" fill="url(#paint0_linear_283_1914)" />
                                    <defs>
                                        <linearGradient id="paint0_linear_283_1914" x1="23.586" y1="9.98101" x2="4.16205" y2="9.98101" gradientUnits="userSpaceOnUse">
                                        <stop stop-color="#F8F8F8" />
                                        <stop offset="0.7" stop-color="#FADFAE" />
                                        <stop offset="1" stop-color="#FBD298" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </button>
                            <div class="about__faq-answer">
                                <div class="about__faq-answer-content">
                                    {{ item.answer }}
                                </div>
                            </div>
                            <img src="@/assets/images/faq-divider.svg" alt="divider" class="about__faq-divider about__faq-divider--bottom">
                        </div>
                    </div>
                </div>
            </div>

            
        </div>
    </div>
    <Footer />
</template>
<style scoped lang="scss">
.about {
    color: #f8f8f8;

    br {

        @media (max-width: 768px) {
            display: none;
        }
    }
    

    &__top {
        position: relative;
        height: 70dvh;

        @media (max-width: 768px) {
            height: 50dvh;
        }
        
        &-mask {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
        }

        &-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }

    /* Updates grid copied/adapted from AllNews */
    .about-news-grid {
        padding: 0 15px 0px 15px;
        max-width: 1110px;
        margin: 0 auto;

        &__header {
            margin-bottom: 30px;
        }

        &__title {
            font-family: 'Vollkorn SC', serif;
            font-weight: 400;
            font-size: clamp(28px, 4vw, 48px);
            line-height: 90%;
            color: #f8f8f8;
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

        &__card { border-radius: 8px; overflow: hidden; position: relative; }

        &__image-container { position: relative; width: 100%; height: 200px; overflow: hidden; }
        &__image { width: 100%; height: 100%; object-fit: cover; object-position: center; border-radius: 16px; }
        &__image-frame { position: absolute; top: -5px; left: -5px; right: -5px; bottom: -5px; z-index: 10; pointer-events: none; display: flex; align-items: center; justify-content: center; }
        &__frame-image { width: 100%; height: 100%; object-position: center; }

        &__content { margin-top: 30px; }
        &__category { font-weight: 400; font-size: 14px; background: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 20px; }
        &__card-title { font-weight: 400; font-size: 32px; line-height: 110%; letter-spacing: -0.07em; color: #f8f8f8; margin-bottom: 15px; }
        &__description { font-weight: 400; font-size: 16px; letter-spacing: -0.01em; color: #f8f8f8; font-family: 'Candara', sans-serif;max-height: 64px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; line-clamp: 3; -webkit-box-orient: vertical; }
        &__meta { display: flex; justify-content: space-between; align-items: center; margin-top: clamp(20px, 2vw, 40px); }
        &__date { font-size: clamp(14px, 2vw, 16px); color: #f8f8f8; font-weight: 400; }
        &__read-more { font-weight: 400; font-size: clamp(16px, 2vw, 20px); background: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
    }

    .about-pagination {
        display: flex; justify-content: center; align-items: center; gap: 24px; padding: 40px 15px; max-width: 1110px; margin: 0 auto;
        &__arrow { display: flex; align-items: center; justify-content: center; background: transparent; border: none; padding: 0; cursor: pointer; transition: opacity 0.2s ease; }
        &__arrow:hover:not(:disabled) { opacity: 0.8; }
        &__arrow:disabled { opacity: 0.3; cursor: not-allowed; }
        &__arrow-icon { width: 36px; height: 36px; }
        &__numbers { display: flex; align-items: baseline; gap: 20px; }
        &__number { font-family: "Vollkorn", serif; background: transparent; border: none; color: #f8f8f8; cursor: pointer; transition: transform 0.2s ease, opacity 0.2s ease, color 0.2s ease; font-size: 20px; line-height: 1; padding: 0; opacity: 0.5; }
        &__number.active { font-size: 30px; font-weight: 900; background: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; opacity: 1; }
        &__dots { color: #f8f8f8; font-size: 20px; }
    }

    &__content {
        display: flex;
        gap: clamp(20px, 5vw, 80px);
        padding: 50px 15px;
        align-items: flex-start;
        max-width: 1110px;
        margin: 0 auto;

        @media (max-width: 1024px) {
            flex-direction: column;
            gap: 40px;
        }
    }

    &__content-left {
        flex: 1;
        max-width: 400px;
    }

    &__content-title {
        font-family: 'Vollkorn SC', serif;
        font-size: clamp(28px, 4vw, 64px);
        font-weight: 400;
        line-height: 90%;
        color: #f8f8f8;
        display: flex;
        flex-direction: column;
        white-space: nowrap;
        
        @media (max-width: 1024px) {
            flex-direction: row;
            gap: 10px;
        }
        
        @media (max-width: 768px) {
            flex-wrap: wrap;
        }
    }

    &__content-right {
        flex: 2;
        display: flex;
        gap: clamp(20px, 4vw, 60px);

        @media (max-width: 1024px) {
            flex-direction: column;
            gap: 40px;
            width: 100%;
        }
    }

    &__content-section {
        width: 100%;
    }

    &__content-section-title {
        font-family: 'Vollkorn SC', serif;
        font-size: clamp(18px, 2vw, 24px);
        font-weight: 400;
        background: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    &__content-list {
        display: flex;
        flex-direction: column;
        gap: 0;
        margin-top: 15px;
    }

    &__content-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid rgba(248, 248, 248, 0.1);

        &:last-child {
            border-bottom: none;
        }
    }

    &__content-label {
        font-family: 'Candara', serif;
        font-size: 16px;
        color: #f8f8f8;
        font-weight: 400;
        opacity: 0.7;
    }

    &__content-value {
        font-family: 'Candara', serif;
        font-size: 16px;
        color: #f8f8f8;
        font-weight: 400;
    }

    &__content-features {
        font-family: 'Candara', serif;
        display: flex;
        flex-direction: column;
        gap: 5px;
        margin-top: 20px;
    }

    &__content-feature {
        font-size: 16px;
        color: #f8f8f8;
        font-weight: 400;
        line-height: 1.4;

        a {
            color: #fbd298;
            transition: opacity 0.3s ease;

            &:hover {
                opacity: 0.8;
            }
        }
    }

    &__faq {
        padding: 80px 15px;
        max-width: 1110px;
        margin: 0 auto;

        @media (max-width: 768px) {
            padding: 30px 15px;
        }
    }

    &__faq-title {
        font-weight: 400;
        font-size: clamp(28px, 4vw, 64px);
        line-height: 90%;
        letter-spacing: -0.07em;
        color: #f8f8f8;
        display: flex;
        flex-direction: column;
        white-space: nowrap;
        margin-bottom: clamp(20px, 5vw, 50px);

        @media (max-width: 1024px) {
            flex-direction: row;
            gap: 10px;
        }
    }

    &__faq-list {
        display: flex;
        gap: clamp(20px, 5vw, 100px);
        align-items: flex-start;

        @media (max-width: 1024px) {
            flex-direction: column;
            gap: 0;
        }
    }

    &__faq-column {
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    &__faq-item {
        position: relative;

        &:last-child {
            border-bottom: none;
        }

        &--open {
            .about__faq-answer {
                max-height: 300px;
                opacity: 1;
                padding: 15px 0 25px 0;
            }

            .about__faq-icon {
                transform: rotate(180deg);
            }
        }
    }

    &__faq-divider {
        width: 100%;
        height: auto;
        display: block;
        margin: 0;

        @media (max-width: 1024px) {
            display: none;
        }

    }

    &__faq-question {
        width: 100%;
        background: none;
        border: none;
        padding: 20px 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        transition: all 0.3s ease;
        text-align: left;
        font-weight: 400;
        font-size: 20px;
        line-height: 120%;
        background: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;

        &:hover {
            opacity: 0.8;
        }

        @media (max-width: 1024px) {
            justify-content: start;
            gap: 10px;
        }

        @media (max-width: 768px) {
            padding: 20px 0;
        }
    }

    &__faq-question-text {
        font-family: 'Vollkorn SC', serif;
        color: #f8f8f8;
        font-weight: 400;
        line-height: 1.4;
        flex: 1;
        margin-right: 20px;

        @media (max-width: 768px) {
            font-size: 14px;
            margin-right: 15px;
        }
    }

    &__faq-icon {
        color: #fbd298;
        transition: transform 0.3s ease;
        flex-shrink: 0;

        @media (max-width: 1024px) {
            width: 20px;
            height: 20px;
        }
    }

    &__faq-answer {
        max-height: 0;
        opacity: 0;
        overflow: hidden;
        transition: all 0.4s ease;
        padding: 0;
    }

    &__faq-answer-content {
        font-family: 'Candara', sans-serif;
        font-size: 16px;
        color: #f8f8f8;
        font-weight: 400;
        opacity: 0.8;

        @media (max-width: 768px) {
            font-size: 13px;
        }
    }

    &__promo {
        position: relative;
        width: 100%;
        overflow: hidden;
        height: 70dvh;

        @media (max-width: 768px) {
            height: 70dvh;
        }

        &-img {
            width: 100%;
            height: 100%;
            display: block;
            object-fit: cover;
        }

        &-content {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 5;
            text-align: center;
            color: #f8f8f8;
            max-width: 600px;
            width: 100%;
            padding: 0 20px;

            @media (max-width: 768px) {
                max-width: 400px;
                padding: 0 15px;
            }
        }

        &-title {
            font-weight: 400;
            font-size: clamp(20px, 3vw, 32px);
            line-height: 140%;
            letter-spacing: -0.05em;
            text-align: center;
            color: #f8f8f8;

            @media (max-width: 768px) {
                margin-bottom: 15px;
            }
        }

        &-main {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
            margin-bottom: 20px;

            @media (max-width: 768px) {
                flex-direction: column;
                gap: 10px;
                margin-bottom: 15px;
            }
        }

        &-start {
            font-family: 'Vollkorn SC', serif;
            font-weight: 400;
            font-size: clamp(40px, 8vw, 96px);
            line-height: 110%;
            text-align: center;
            background: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        

        &-separator {
            display: flex;
            align-items: center;
            justify-content: center;
            margin: clamp(20px, 5vw, 50px) auto;
            opacity: 0.8;
            width: 100%;
            
            svg {
                max-width: 360px;
                width: 60%;
            }

            @media (max-width: 768px) {
                margin: 15px 0;
            }
        }

        &-line {
            height: 1px;
            background: linear-gradient(90deg, transparent 0%, #fbd298 50%, transparent 100%);
            flex: 1;
            max-width: 80px;
        }

        &-dot {
            width: 6px;
            height: 6px;
            background: #fbd298;
            border-radius: 50%;
            margin: 0 15px;
            box-shadow: 0 0 10px rgba(251, 210, 152, 0.5);
        }

        &-rewards {
            display: flex;
            justify-content: center;
            gap: clamp(20px, 4vw, 40px);
            flex-wrap: wrap;

            @media (max-width: 768px) {
                flex-direction: column;
                gap: 15px;
                max-width: 285px;
                margin: 0 auto;
            }
        }

        &-reward {
            display: flex;
            align-items: center;
            gap: 8px;
            min-width: 80px;

            @media (max-width: 768px) {
                min-width: 70px;
                gap: 6px;
            }
        }

        &-reward-icon {
            object-fit: contain;
            filter: drop-shadow(0 0 8px rgba(251, 210, 152, 0.3));

            @media (max-width: 768px) {
                width: 35px;
                height: 35px;
            }
        }

        &-reward-text {
            font-family: 'Candara', sans-serif;
            font-size: 32px;
            font-weight: 400;
            color: #f8f8f8;
            text-align: center;
            line-height: 1.2;
            opacity: 0.9
        }

        &-mask-top {
            position: absolute;
            top: -1px;
            left: -1px;
            width: 100%;
            height: clamp(76px, 10vw, 197px);
            z-index: 3;
        }
        
        &-mask-bottom {
            transform: rotate(180deg);
            position: absolute;
            bottom: -1px;
            left: -1px;
            width: 100%;
            height: clamp(76px, 10vw, 197px);
            z-index: 3;
        }
    }
}
</style>