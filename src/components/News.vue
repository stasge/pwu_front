<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import { ref, onMounted, onUnmounted, watch } from 'vue';
import Button from 'primevue/button';
import { useAsyncCallWrapper } from '@/composables/useAsyncCallWrapper';
import { fetchGet, fetchPost } from '@/utils/fetchApi';
import type { News } from '@/models/news';
import { useRouter } from 'vue-router';
import { useMitt } from '@/composables/useMitt';

const baseURL = import.meta.env.VITE_BASE_URL
const items = ref([]);
const news = ref<News[]>([])
const userStore = useUserStore()
const {wrapAsyncCall} = useAsyncCallWrapper()
const viewportHeight = window.innerHeight;
let lastScrollTop = window.scrollY || document.documentElement.scrollTop;
const router = useRouter()
const emitter = useMitt()

const isInViewport = (element: HTMLDivElement) => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    (rect.bottom - (rect.height - 100)) <= viewportHeight && 
    rect.right <= window.innerWidth
  );
};

onMounted(async () => {
    await loadNews()
    items.value = Array.from(document.querySelectorAll('.news__item'));
    window.addEventListener('scroll', handleScroll);

    emitter.on('login', () => {
        setTimeout(() => {
            items.value = Array.from(document.querySelectorAll('.news__item'));
            items.value.forEach((element: HTMLDivElement) => {
                element.classList.add('fade-in');
            });
        }, 0)
    })
});

const loadNews = async () => {
    await wrapAsyncCall( async () => {
        const {data} = await fetchGet('getNews')
        news.value = data
    })
}

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

const deleteNews = async (id: number) => {
    await wrapAsyncCall(async () => {
        await fetchPost('deleteNews', {id})
        const {data} = await fetchGet('getNews')
        news.value = data
    })
}

const handleScroll = () => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  items.value.forEach((element: HTMLDivElement) => {
    if (isInViewport(element)) {
      element.classList.add('fade-in');
    }
  });
  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
};
</script>

<template>
    <div class="news flex flex-column gap-8 relative z-2">
        <Button 
            v-if="userStore.isAdmin" 
            v-tooltip="'Створити нову новину'" 
            icon="pi pi-plus" 
            @click="router.push({name: 'news-creation'})" 
            class="success"
        />
        <div v-for="item of userStore.isAdmin ? news : [...news.filter(n => !n.isHidden).slice(0, 3)]" class="news__item  flex gap-5" :class="{'hidden': item.isHidden}">
            <div class="flex flex-column align-items-center justify-content-end relative w-max">
                <img class="news__item-img" :src="baseURL + '/files/' + item.image" alt="">
                <router-link  :to="{name: 'single-news', params: {id: item.id}}" class="news__item-btn btn btn-sm">Детальніше</router-link>
            </div>
            <div class="news__item-content flex flex-column gap-3 pr-3">
                <div class="badges">
                    <div class="badges__item"></div>
                </div>
                <h2 class="news__item-title">{{ item.title }}</h2>
                <p class="news__item-text" v-html="item.text.replace(/\n/g, '<br>')"></p>
                <div class="flex gap-3">
                    <Button 
                        v-if="userStore.isAdmin" 
                        v-tooltip="'Редагувати новину'" 
                        icon="pi pi-pencil" 
                        @click="router.push({name: 'news-creation', params: {id: item.id}})" 
                        class="primary"
                    />
                    <Button 
                        v-if="userStore.isAdmin" 
                        v-tooltip="'Видалити новину'" 
                        icon="pi pi-trash" 
                        @click="deleteNews(item.id)" 
                        class="danger"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
    .news {
        transform: translateY(-10%);

        &__item {
            max-width: 970px;
            opacity: 0;
            transition: all 0.4s ease-in-out;
            background: rgba(93,119,144, 0.1);

            @media (max-width: 1024px) {
                background: none;
                flex-wrap: wrap;
                justify-content: center;
            }
            // transform: translateX(-30px);

            &.hidden {
                opacity: 0.5 !important;
            }

            &.fade-in {
                opacity: 1;
                transform: translateX(0px);
            }

            &-img {
                aspect-ratio: 16/9;
                max-width: 288px;
                box-shadow: rgba(0, 0, 0, 0.35) 0px 54px 55px, rgba(0, 0, 0, 0.42) 0px -12px 30px, rgba(0, 0, 0, 0.42) 0px 4px 6px, rgba(0, 0, 0, 0.57) 0px 12px 13px, rgba(0, 0, 0, 0.59) 0px -3px 5px;
            }

            &-btn {
                transform: translateY(50%);
                position: absolute;
                bottom: 0;
                
                &:hover {
                    letter-spacing: 1px;
                }
            }

            &-content {
                color: #fff;

                @media (max-width: 1024px) {
                    max-width: 288px;
                }
            }

            &-title {
                font-size: 187.5%; /* 30/16 */
                display: -webkit-box;
                -webkit-line-clamp: 1;
                -webkit-box-orient: vertical;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            &-text {
                font-size: 125%; /* 20/16 */
                line-height: 26px;
                display: -webkit-box;
                -webkit-line-clamp: 3;
                -webkit-box-orient: vertical;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        }
    }
</style>