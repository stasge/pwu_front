<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const items = ref([]);
const viewportHeight = window.innerHeight;
let lastScrollTop = window.scrollY || document.documentElement.scrollTop;

const isInViewport = (element: HTMLDivElement) => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    (rect.bottom - (rect.height / 2)) <= viewportHeight && 
    rect.right <= window.innerWidth
  );
};

onMounted(() => {
  items.value = Array.from(document.querySelectorAll('.news__item'));
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

const handleScroll = () => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  items.value.forEach((element: HTMLDivElement) => {
    if (isInViewport(element)) {
      element.classList.add('fade-in');
      element.classList.remove('fade-out');
    } else {
      element.classList.remove('fade-in');
      element.classList.add('fade-out');
    }
  });
  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
};
</script>

<template>
    <div class="news flex flex-column gap-8 relative z-2">
        <div v-for="item of 3" class="news__item flex gap-5">
            <div class="flex flex-column align-items-center relative w-max">
                <img class="news__item-img" src="@/assets/images/header-bg.jpg" alt="">
                <a href="#" class="news__item-btn btn btn-sm">Детальніше</a>
            </div>
            <div class="news__item-content flex flex-column gap-3">
                <div class="badges">
                    <div class="badges__item"></div>
                </div>
                <h2 class="news__item-title">Старт ЗБТ</h2>
                <p class="news__item-text">На нашому сервері на вас чекає безліч марафонів, що пропонують як інтенсивні, так і поступові шляхи до успіху. Ти можеш досягти успіху в ідеальному світі та виграти грошові призи!</p>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
    .news {
        transform: translateY(-10%);

        &__item {
            max-width: 970px;
            background: rgba(93,119,144, 0.1);
            opacity: 0;
            transition: all 0.4s ease-in-out;
            transform: translateX(-30px);

            &.fade-in {
                opacity: 1;
                transform: translateX(0px);
            }

            &-img {
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
            }

            &-title {
                font-size: 30px;
            }

            &-text {
                font-size: 20px;
                line-height: 26px;
            }
        }
    }

    .badges {

        &__item {

        }
    }
</style>