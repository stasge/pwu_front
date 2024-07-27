<script setup lang='ts'>
import Textarea from 'primevue/textarea';

</script>
<template>
    <div class="article">
        <div class="article__inner">
            <div class="article__container">
                <h1 class="article__title">Дуже цікавий заголовок для цікавої теми на цікавому форумі</h1>
                <small class="text-sm mt-2 block opacity-50">Тема в розділі "Головний", створена користувачем Роман, 20.04.1997</small>
                <div class="flex gap-3 justify-content-between mt-6">
                    <div class="article__writer writer flex flex-column align-items-center justify-content-center gap-2">
                        <svg class="writer__avatar" width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M25 24.9997C29.6023 24.9997 33.3333 21.2687 33.3333 16.6663C33.3333 12.064 29.6023 8.33301 25 8.33301C20.3976 8.33301 16.6666 12.064 16.6666 16.6663C16.6666 21.2687 20.3976 24.9997 25 24.9997Z" fill="#e26f0f"/>
                            <path d="M41.6667 39.583V41.6663C41.6667 42.2189 41.4472 42.7488 41.0565 43.1395C40.6658 43.5302 40.1359 43.7497 39.5834 43.7497H10.4167C9.86417 43.7497 9.33427 43.5302 8.94357 43.1395C8.55287 42.7488 8.33337 42.2189 8.33337 41.6663V39.583C8.33337 36.2678 9.65033 33.0884 11.9945 30.7442C14.3387 28.4 17.5182 27.083 20.8334 27.083H29.1667C32.4819 27.083 35.6613 28.4 38.0055 30.7442C40.3497 33.0884 41.6667 36.2678 41.6667 39.583Z" fill="#e26f0f"/>
                        </svg>

                        <h3 class="writer__name ">Roman</h3>
                        <p class="writer__position">Administrator</p>
                    </div>
                    <div class="article__content flex flex-column align-items-center gap-4 text-center">
                        <img class="w-full h-10rem" style="object-fit: cover;" src="@/assets/images/test-article-banner.jpg" alt="">
                        <h2 class="mb-3">Шановні гравці</h2>
                        <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Vero quia illo nihil dolores facere porro aperiam ipsam commodi ab, atque eveniet veniam perferendis quidem officiis nulla fugiat quisquam repudiandae eaque.</p>
                        <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Vero quia illo nihil dolores facere porro aperiam ipsam commodi ab, atque eveniet veniam perferendis quidem officiis nulla fugiat quisquam repudiandae eaque.</p>
                        <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Vero quia illo nihil dolores facere porro aperiam ipsam commodi ab, atque eveniet veniam perferendis quidem officiis nulla fugiat quisquam repudiandae eaque.</p>
                    </div>
                </div>
                <div class="article__comments comments flex flex-column gap-3">
                    <h2 class="mt-6 mb-4">Коментарі</h2>
                    <div v-for="item of 3" class="comments__item flex">
                        <div class="comments__writer writer flex flex-column align-items-center justify-content-center gap-2">
                            <svg class="writer__avatar" width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M25 24.9997C29.6023 24.9997 33.3333 21.2687 33.3333 16.6663C33.3333 12.064 29.6023 8.33301 25 8.33301C20.3976 8.33301 16.6666 12.064 16.6666 16.6663C16.6666 21.2687 20.3976 24.9997 25 24.9997Z" fill="#e26f0f"/>
                                <path d="M41.6667 39.583V41.6663C41.6667 42.2189 41.4472 42.7488 41.0565 43.1395C40.6658 43.5302 40.1359 43.7497 39.5834 43.7497H10.4167C9.86417 43.7497 9.33427 43.5302 8.94357 43.1395C8.55287 42.7488 8.33337 42.2189 8.33337 41.6663V39.583C8.33337 36.2678 9.65033 33.0884 11.9945 30.7442C14.3387 28.4 17.5182 27.083 20.8334 27.083H29.1667C32.4819 27.083 35.6613 28.4 38.0055 30.7442C40.3497 33.0884 41.6667 36.2678 41.6667 39.583Z" fill="#e26f0f"/>
                            </svg>

                            <h3 class="writer__name ">Нагібатор2008</h3>
                            <p class="writer__position">Administrator</p>
                        </div>
                        <div class="comments__text py-3 px-5 flex flex-column justify-content-between w-full">
                            <p>Класно написав Роман!</p>
                            <small class="text-sm opacity-50">Нагібатор2008, 20.05.2010</small>
                        </div>
                    </div>
                    <div class="comments__textarea mt-5">
                        <h2 class="mb-3">Залишити коментар</h2>
                        <Textarea  rows="5" class="w-full" />
                        <button class="btn btn-sm mt-2">Відправити</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped lang='scss'>
.article {
    color: #FFF;

    &__title {
        text-shadow: 3px 0px 7px rgba(81, 67, 21, 0.8), -3px 0px 7px rgba(81, 67, 21, 0.8), 0px 4px 7px rgba(81, 67, 21, 0.8);
    }

    &__content {
        padding: 20px;
        border-radius: 10px;
        background: rgba(93, 119, 144, 0.1);
        border: 1px solid #e26f0f;
    }
}

.writer {
    width: fit-content;
    height: fit-content;
    min-width: 150px;
    background: rgba(93, 119, 144, 0.1);
    padding: 20px;
    border-radius: 10px;
    border: 1px solid #e26f0f;

    @media (max-width: 1024px) {
        min-width: auto;
    }
}

.comments {

    &__item {
        background: rgba(93, 119, 144, 0.1);
        border: 1px solid rgba(93, 119, 144, 0.1);
        border-radius: 10px 0 0 10px;
    }

    &__writer {
        border: 1px solid rgba(93, 119, 144, 0.1);
    }
}
</style>