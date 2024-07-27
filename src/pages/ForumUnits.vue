<script setup lang='ts'>
import { useUserStore } from '@/stores/userStore';
import { format } from 'date-fns';
import Paginator from 'primevue/paginator';


const userStore = useUserStore()

</script>
<template>
    <div class="units w-full">
        <div class="units__inner">
            <div class="units__container">
                <div class="flex flex-column align-items-center justify-content-center">
                    <h1>Гайди і F.A.Q</h1>
                    <div class="w-full mt-5">
                        <div class="game-acc__header">
                            <p>Заголовок</p>
                            <p>Дата створення</p>
                            <p>Відповідей</p>
                            <p>Переглядів</p>
                            <p>Оновлено</p>
                        </div>
                        <RouterLink :to="{name: 'article'}" class="game-acc__wrapper">
                            <div v-for="unit of 6" class="game-acc__item">
                                <p>Дуже цікавий заголовок для цікавої теми на цікавому форумі</p>
                                <p>20.04.1997</p>
                                <p>{{ 10 }}</p>
                                <p>{{ 33 }}</p>
                                <p>20.07.2077</p>
                            </div>
                        </RouterLink>
                    </div>
                    <Paginator 
                        :rows="10" 
                        :totalRecords="120" 
                        :rowsPerPageOptions="[10, 20, 30]" 
                        class="mt-4"
                    ></Paginator>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped lang='scss'>
.units {
    color: #fff;
}

.game-acc {

    &__wrapper {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 20px;
    }

    &__header {
        display: grid;
        grid-template-columns: 50% 15% 10% 10% 15%;
        padding: 20px;
        align-items: end;
        background: linear-gradient(225deg, #e26f0f 0%, rgba(217, 217, 217, 0) 100%), linear-gradient(45deg, #3d4c60 0%, rgba(21, 26, 33, 0.34) 65.59%, rgba(0, 0, 0, 0) 100%);
        border-radius: 10px;

        &>* {
            text-align: center;
        }
    }

    &__item {
        display: grid;
        grid-template-columns: 50% 15% 10% 10% 15%;
        padding: 20px;
        background: rgba($color: #000000, $alpha: 0.4);
        border-radius: 10px;

        &>* {
            text-align: center;
        }
    }

}

</style>