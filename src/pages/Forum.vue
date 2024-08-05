<script setup lang='ts'>
import Accordion from 'primevue/accordion';
import AccordionPanel from 'primevue/accordionpanel';
import AccordionHeader from 'primevue/accordionheader';
import AccordionContent from 'primevue/accordioncontent';
import Button from 'primevue/button';
import ForumMainCat from '@/components/modals/forumMainCat.vue'
import ForumSubCat from '@/components/modals/forumSubCat.vue'


import {onMounted, ref} from 'vue'
import {useAsyncCallWrapper} from '@/composables/useAsyncCallWrapper'
import {fetchGet, fetchPost} from '@/utils/fetchApi'
import type { IForumCategory } from '@/models/forum';
import {useUserStore} from '@/stores/userStore'
import { useConfirm } from "primevue/useconfirm";

const confirm = useConfirm();
const {wrapAsyncCall} = useAsyncCallWrapper()
const categories = ref<IForumCategory[]>()
const {isAdmin} = useUserStore()
const forumMainCatRef = ref()
const forumSubCatRef = ref()

onMounted(async () => {
    wrapAsyncCall(async () => {
        await loadSections()
    })
})

const loadSections = async () => {
    const {data: _categories} = await fetchGet('/forum/getMain')
    categories.value = _categories
}


const deleteMain = (id: number) => {
    wrapAsyncCall(async () => {
        await fetchPost('/forum/deleteMain', {id})
        await loadSections()
    })
}

const deleteSub = (id: number) => {
    wrapAsyncCall(async () => {
        await fetchPost('/forum/deleteSub', {id})
        await loadSections()
    })
}

const confirmRemoval = (event: Event, id: number, message: string, action: (id: number) => void) => {
    confirm.require({
        target: event.currentTarget as HTMLElement,
        message,
        icon: 'pi pi-exclamation-triangle',
        rejectProps: {
            label: 'Ні',
            severity: 'secondary',
            outlined: true
        },
        acceptProps: {
            label: 'Так'
        },
        accept: () => {
            action(id)
        },
    });
}
</script>
<template>
    <div class="forum w-full">
        <div class="forum__inner">
            <div class="forum__container w-full flex flex-column gap-2">
                <h1 class="forum__title mb-6 text-center">Форум</h1>
                <Button v-if="isAdmin" v-tooltip="'Створити головну категорію'" icon="pi pi-plus" @click="forumMainCatRef.showDia()" />
                <Accordion v-for="category of categories" class="forum__accordion" :value="categories">
                    <AccordionPanel>
                        <AccordionHeader>
                            <h2>{{ category.name }}</h2>
                            <Button v-if="isAdmin" v-tooltip="'Створити розділ'" class="ml-auto mr-2" icon="pi pi-plus" @click="forumSubCatRef.showDia(null, category.id)" />
                            <Button v-if="isAdmin" v-tooltip="'Редагувати головну категорію'" class="mr-2" icon="pi pi-pencil" @click="forumMainCatRef.showDia(category)" />
                            <Button v-if="isAdmin" v-tooltip="'Видалити головну категорію'" class="mr-3" icon="pi pi-trash" @click="confirmRemoval($event, category.id, 'Ви впевнені, що хочете видалити цю категорію?', deleteMain)" />
                        </AccordionHeader>
                        <AccordionContent>
                            <div v-for="t of category.topic" class="forum__unit flex justify-content-between mt-3">
                                <div>
                                    <RouterLink :to="{name: 'themes', params: {cat_id: category.id, sub_id: t.id}}" class="text-xl">{{ t.name }}</RouterLink>
                                    <div class="flex gap-3 mt-3">
                                        <span>Теми: <b>{{ t.themes }}</b></span>
                                        <span>Повідомлення: <b>{{ t.messages }}</b></span>
                                    </div>
                                </div>
                                <div class="flex align-items-center">
                                    <Button v-if="isAdmin" v-tooltip="'Редагувати розділ'" class="mr-2" icon="pi pi-pencil" @click="forumSubCatRef.showDia(t)" />
                                    <Button v-if="isAdmin" v-tooltip="'Видалити розділ'" class="mr-3" icon="pi pi-trash" @click="confirmRemoval($event, t.id, 'Ви впевнені, що хочете видалити цей розділ?', deleteSub)" />
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionPanel>
                </Accordion>
            </div>
        </div>
    </div>
    <ForumMainCat ref="forumMainCatRef" @mainCatCreated="loadSections"/>
    <ForumSubCat ref="forumSubCatRef" @subCatCreated="loadSections"/>
    
</template>
<style scoped lang='scss'>
.forum {
    color: #fff;

    &__unit {
        padding: 15px;
        border-radius: 10px;
        background: rgba(93, 119, 144, 0.1);
    }
}

.p-accordionheader {
    background: linear-gradient(87deg, #e26f0f 0%, rgba(217, 217, 217, 0) 100%), linear-gradient(270deg, #3d4c60 0%, rgba(0, 0, 0, 0) 100%) !important;
    color: #FFF !important;

    svg {
        fill: #FFF;
        stroke: #FFF;
    }
}

.p-accordioncontent-content {
    color: #FFF !important;
    padding: 10px !important;

    span {
        color: #FFF !important;
    }
}

.p-accordionpanel {
    border: none !important;
}

.p-button {
    background: #e26f0f !important;
}
</style>