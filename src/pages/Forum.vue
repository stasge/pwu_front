<script setup lang='ts'>
import Accordion from 'primevue/accordion';
import AccordionPanel from 'primevue/accordionpanel';
import AccordionHeader from 'primevue/accordionheader';
import AccordionContent from 'primevue/accordioncontent';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';

import {onMounted, reactive, ref} from 'vue'
import {useAsyncCallWrapper} from '@/composables/useAsyncCallWrapper'
import {fetchGet, fetchPost} from '@/utils/fetchApi'
import { required } from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';



const {wrapAsyncCall} = useAsyncCallWrapper()
const mainSections = ref<IForumMainSection | null>(null)
const isCreateDiaShown = ref(false)

const createForm = reactive({
    name: ''
})

const rules = {
    name: {required},
}

const v$ = useVuelidate(rules, createForm)

onMounted(async () => {
    wrapAsyncCall(async () => {
        await loadSections()
    })
})

const loadSections = async () => {
    const {data: _sections} = await fetchGet('/forum/getMain')
    mainSections.value = _sections
}

const createMainSection = async () => {
    if (!await v$.value.$validate()) {
        return
    }
    wrapAsyncCall( async () => {
        await fetchPost('forum/addMain', createForm)
        await loadSections()
        isCreateDiaShown.value = false
    }, null, 'Розділ успішно створено')
}
</script>
<template>
    <div class="forum w-full">
        <div class="forum__inner">
            <div class="forum__container w-full flex flex-column gap-2">
                <h1 class="forum__title mb-6 text-center">Форум</h1>
                <Button icon="pi pi-plus" aria-label="Save" @click="isCreateDiaShown = true" />
                <Accordion v-for="section of mainSections" class="forum__accordion" :value="mainSections">
                    <AccordionPanel>
                        <AccordionHeader><h2>{{ section.name }}</h2></AccordionHeader>
                        <AccordionContent>
                            <div v-for="t of section.topic" class="forum__unit mt-3">
                                <RouterLink :to="{name: 'topics', params: {topic_id: t.id}}" class="text-xl">{{ t.name }}</RouterLink>
                                <div class="flex gap-3 mt-3">
                                    <span>Теми: <b>{{ t.themes }}</b></span>
                                    <span>Повідомлення: <b>{{ t.messages }}</b></span>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionPanel>
                </Accordion>
            </div>
        </div>
    </div>
    <Dialog v-model:visible="isCreateDiaShown" modal header="Створення основного розділу">
        <div class="flex flex-column items-center gap-4 mb-4">
            <label for="username" class="font-semibold w-24">Назва</label>
            <InputText 
                id="username" 
                class="flex-auto" 
                :invalid="v$.name.$error"            
                v-model="createForm.name" 
            />
        </div>
        <div class="flex justify-end gap-2">
            <Button type="button" label="Відмінити" severity="secondary" @click="isCreateDiaShown = false"></Button>
            <Button type="button" label="Зберегти" @click="createMainSection"></Button>
        </div>
    </Dialog>
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
</style>