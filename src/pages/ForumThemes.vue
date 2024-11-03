<script setup lang='ts'>
import Paginator from 'primevue/paginator';
import Button from 'primevue/button';

import { onMounted, ref } from 'vue';
import { useAsyncCallWrapper } from '@/composables/useAsyncCallWrapper'
import {fetchPost} from '@/utils/fetchApi'
import type { IForumSubCategory, IForumTheme } from '@/models/forum';
import { useRoute, useRouter } from 'vue-router'
import {useUserStore} from '@/stores/userStore'
import {useConfirmRemoval} from '@/composables/useConfirmRemoval'

const {confirmRemoval} = useConfirmRemoval()
const {wrapAsyncCall} = useAsyncCallWrapper()
const route = useRoute()
const router = useRouter()
const {isAdmin} = useUserStore()

const themes = ref<IForumTheme[]>()
const subCategory = ref<IForumSubCategory>()
onMounted(() => {
    wrapAsyncCall(async () => {
        await loadThemes()
    })
})

const deleteTheme = (id: number) => {
    wrapAsyncCall(async () => {
        await fetchPost('/forum/deleteTheme', {id})
        await loadThemes()
    })
}

const loadThemes = async () => {
    const {data} = await fetchPost('/forum/getThemes', {id_main: +route.params.sub_id, page: 1, limit: 10})
    const {data: _subCategories} = await fetchPost('/forum/getSub', {id_main: +route.params.cat_id})
    themes.value = data.themes
    subCategory.value = _subCategories.find((s: IForumSubCategory) => s.id === +route.params.sub_id)
}

</script>
<template>
    <div class="units w-full">
        <div class="units__inner">
            <div class="units__container">
                <div class="flex flex-column align-items-center justify-content-center">
                    <h1>{{ subCategory?.name }}</h1>
                    <div class="w-full mt-5">
                        <div class="game-acc__header">
                            <p>Заголовок</p>
                            <p>Дата створення</p>
                            <p>Відповідей</p>
                            <p>Переглядів</p>
                            <p>Оновлено</p>
                            <p>Дії</p>
                        </div>
                        <div v-for="theme of themes" class="game-acc__wrapper">
                            <div class="game-acc__item">
                                <RouterLink :to="{name: 'separate-theme', params: {theme_id: theme.id, cat_id: route.params.cat_id}}" class="text-trim" v-tooltip.top="theme.name">{{ theme.name }}</RouterLink>
                                <p>{{ theme.created_at }}</p>
                                <p>{{ theme.messages_count }}</p>
                                <p>{{ theme.views_count }}</p>
                                <p>{{ theme.edited_at }}</p>
                                <div class="flex justify-content-end gap-2">
                                    <Button 
                                        v-if="isAdmin" 
                                        v-tooltip="'Редагувати тему'" 
                                        class="primary" 
                                        icon="pi pi-pencil"
                                        @click="router.push({name: 'theme-creation', params: {id_main: theme.id_main, id: theme.id}})"
                                    />
                                    <Button 
                                        v-if="isAdmin" 
                                        v-tooltip="'Видалити тему'" 
                                        class="danger" 
                                        icon="pi pi-trash" 
                                        @click="confirmRemoval($event, theme.id, 'Ви впевнені, що хочете видалити цю тему?', deleteTheme)"
                                    />
                                </div>
                            </div>
                        </div>
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
        grid-template-columns: 35% 15% 10% 10% 15% 15%;
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
        grid-template-columns: 35% 15% 10% 10% 15% 15%;
        padding: 20px;
        background: rgba($color: #000000, $alpha: 0.4);
        border-radius: 10px;

        &>* {
            text-align: center;
            max-width: 330px;
        }
    }

}

</style>