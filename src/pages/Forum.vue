<script setup lang='ts'>
import Accordion from 'primevue/accordion';
import AccordionPanel from 'primevue/accordionpanel';
import AccordionHeader from 'primevue/accordionheader';
import AccordionContent from 'primevue/accordioncontent';
import {onMounted, ref} from 'vue'
import {useAsyncCallWrapper} from '@/composables/useAsyncCallWrapper'
import {fetchGet} from '@/utils/fetchApi'

const {wrapAsyncCall} = useAsyncCallWrapper()
const mainSections = ref<IForumMainSection | null>(null)

onMounted(() => {
    wrapAsyncCall(async () => {
        const {data: _sections}= await fetchGet('/forum/getMain')
        mainSections.value = _sections
    })
})
</script>
<template>
    <div class="forum w-full">
        <div class="forum__inner">
            <div class="forum__container w-full flex flex-column gap-2">
                <h1 class="forum__title mb-6 text-center">Форум</h1>
                <Accordion v-for="section of mainSections" class="forum__accordion" :value="mainSections">
                    <AccordionPanel>
                        <AccordionHeader><h2>{{ section.name }}</h2></AccordionHeader>
                        <AccordionContent>
                            <div v-for="t of section.topic" class="forum__unit mt-3">
                                <RouterLink :to="{name: 'units'}" class="text-xl">{{ t.name }}</RouterLink>
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