<script setup lang="ts">

</script>

<template>
    <div class="news flex flex-column gap-8 relative">
        <div class="news__item flex gap-5">
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
        <div class="news__item flex gap-5">
            <div class="flex flex-column align-items-center relative w-max">
                <img class="news__item-img" src="@/assets/images/header-bg.jpg" alt="">
                <a href="#" class="news__item-btn btn btn-sm">Детальніше</a>
            </div>
            <div class="news__item-content flex flex-column gap-3">
                <div class="badges ">
                    <div class="badges__item"></div>
                </div>
                <h2 class="news__item-title">Старт ЗБТ</h2>
                <p class="news__item-text">На нашому сервері на вас чекає безліч марафонів, що пропонують як інтенсивні, так і поступові шляхи до успіху. Ти можеш досягти успіху в ідеальному світі та виграти грошові призи!</p>
            </div>
        </div>
        <div class="news__item flex gap-5">
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