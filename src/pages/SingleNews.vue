<script setup lang='ts'>
import { onMounted, ref } from 'vue';
import { useAsyncCallWrapper } from '@/composables/useAsyncCallWrapper'
import {fetchGet} from '@/utils/fetchApi'
import { useRoute } from 'vue-router'
import type { News } from '@/models/news';

const route = useRoute()
const {wrapAsyncCall} = useAsyncCallWrapper()
const singleNews = ref<News>()
const baseURL = import.meta.env.VITE_BASE_URL


onMounted(() => {
    wrapAsyncCall(async () => {
        const {data} = await fetchGet('getNews')
        singleNews.value = data.find((news: News) => news.id === +route.params.id)
    })
})

</script>
<template>
    <div class="single-news">
        <div class="single-news__container">
            <div class="single-news__inner">
                <h2 class="single-news__title mb-6 text-center">{{singleNews?.title}}</h2>
                <img class="single-news__image w-full" :src="baseURL + '/files/' + singleNews?.image" :alt="singleNews?.title">
                <p class="single-news__text mt-5" v-html="singleNews?.text"></p>
            </div>
        </div>
    </div>
</template>
<style scoped lang='scss'>
.single-news {
    color: #fff;

    &__title {
        font-size: 200%; /* 20/16 */
    }

    &__text {
        
    }
}
</style>