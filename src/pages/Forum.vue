<script setup lang='ts'>
import Accordion from 'primevue/accordion';
import AccordionPanel from 'primevue/accordionpanel';
import AccordionHeader from 'primevue/accordionheader';
import AccordionContent from 'primevue/accordioncontent';
</script>
<template>
    <div class="forum w-full">
        <div class="forum__inner">
            <div class="forum__container w-full">
                <h1 class="forum__title mb-6 text-center">Форум</h1>
                <Accordion value="0" class="forum__accordion">
                    <AccordionPanel value="0">
                        <AccordionHeader><h2>Головний розділ</h2></AccordionHeader>
                        <AccordionContent>
                            <div class="forum__unit mt-3">
                                <RouterLink :to="{name: 'units'}" class="text-xl">Гайди і F.A.Q</RouterLink>
                                <div class="flex gap-3 mt-3">
                                    <span>Теми: <b>135</b></span>
                                    <span>Повідомлення: <b>3010</b></span>
                                </div>
                            </div>
                            <div class="forum__unit mt-3">
                                <RouterLink :to="{}" class="text-xl">Гайди і F.A.Q</RouterLink>
                                <div class="flex gap-3 mt-3">
                                    <span>Теми: <b>135</b></span>
                                    <span>Повідомлення: <b>3010</b></span>
                                </div>
                            </div>
                            <div class="forum__unit mt-3">
                                <RouterLink :to="{}" class="text-xl">Гайди і F.A.Q</RouterLink>
                                <div class="flex gap-3 mt-3">
                                    <span>Теми: <b>135</b></span>
                                    <span>Повідомлення: <b>3010</b></span>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionPanel>
                </Accordion>
                <Accordion value="1" class="forum__accordion mt-2">
                    <AccordionPanel value="0">
                        <AccordionHeader><h2>Ігровий розділ</h2></AccordionHeader>
                        <AccordionContent>
                            <div class="forum__unit mt-3">
                                <RouterLink :to="{}" class="text-xl">Гайди і F.A.Q</RouterLink>
                                <div class="flex gap-3 mt-3">
                                    <span>Теми: <b>135</b></span>
                                    <span>Повідомлення: <b>3010</b></span>
                                </div>
                            </div>
                            <div class="forum__unit mt-3">
                                <RouterLink :to="{}" class="text-xl">Гайди і F.A.Q</RouterLink>
                                <div class="flex gap-3 mt-3">
                                    <span>Теми: <b>135</b></span>
                                    <span>Повідомлення: <b>3010</b></span>
                                </div>
                            </div>
                            <div class="forum__unit mt-3">
                                <RouterLink :to="{}" class="text-xl">Гайди і F.A.Q</RouterLink>
                                <div class="flex gap-3 mt-3">
                                    <span>Теми: <b>135</b></span>
                                    <span>Повідомлення: <b>3010</b></span>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionPanel>
                </Accordion>
                <Accordion value="2" class="forum__accordion mt-2">
                    <AccordionPanel value="0">
                        <AccordionHeader><h2>Розділ заявок</h2></AccordionHeader>
                        <AccordionContent>
                            <div class="forum__unit mt-3">
                                <RouterLink :to="{}" class="text-xl">Гайди і F.A.Q</RouterLink>
                                <div class="flex gap-3 mt-3">
                                    <span>Теми: <b>135</b></span>
                                    <span>Повідомлення: <b>3010</b></span>
                                </div>
                            </div>
                            <div class="forum__unit mt-3">
                                <RouterLink :to="{}" class="text-xl">Гайди і F.A.Q</RouterLink>
                                <div class="flex gap-3 mt-3">
                                    <span>Теми: <b>135</b></span>
                                    <span>Повідомлення: <b>3010</b></span>
                                </div>
                            </div>
                            <div class="forum__unit mt-3">
                                <RouterLink :to="{}" class="text-xl">Гайди і F.A.Q</RouterLink>
                                <div class="flex gap-3 mt-3">
                                    <span>Теми: <b>135</b></span>
                                    <span>Повідомлення: <b>3010</b></span>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionPanel>
                </Accordion>
                <Accordion value="3" class="forum__accordion mt-2">
                    <AccordionPanel value="0">
                        <AccordionHeader><h2>Ще якийсь розділ</h2></AccordionHeader>
                        <AccordionContent>
                            <div class="forum__unit mt-3">
                                <RouterLink :to="{}" class="text-xl">Гайди і F.A.Q</RouterLink>
                                <div class="flex gap-3 mt-3">
                                    <span>Теми: <b>135</b></span>
                                    <span>Повідомлення: <b>3010</b></span>
                                </div>
                            </div>
                            <div class="forum__unit mt-3">
                                <RouterLink :to="{}" class="text-xl">Гайди і F.A.Q</RouterLink>
                                <div class="flex gap-3 mt-3">
                                    <span>Теми: <b>135</b></span>
                                    <span>Повідомлення: <b>3010</b></span>
                                </div>
                            </div>
                            <div class="forum__unit mt-3">
                                <RouterLink :to="{}" class="text-xl">Гайди і F.A.Q</RouterLink>
                                <div class="flex gap-3 mt-3">
                                    <span>Теми: <b>135</b></span>
                                    <span>Повідомлення: <b>3010</b></span>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionPanel>
                </Accordion>
                <Accordion value="4" class="forum__accordion mt-2">
                    <AccordionPanel value="0">
                        <AccordionHeader><h2>Розділ для Романа</h2></AccordionHeader>
                        <AccordionContent>
                            <div class="forum__unit mt-3">
                                <RouterLink :to="{}" class="text-xl">Гайди і F.A.Q</RouterLink>
                                <div class="flex gap-3 mt-3">
                                    <span>Теми: <b>135</b></span>
                                    <span>Повідомлення: <b>3010</b></span>
                                </div>
                            </div>
                            <div class="forum__unit mt-3">
                                <RouterLink :to="{}" class="text-xl">Гайди і F.A.Q</RouterLink>
                                <div class="flex gap-3 mt-3">
                                    <span>Теми: <b>135</b></span>
                                    <span>Повідомлення: <b>3010</b></span>
                                </div>
                            </div>
                            <div class="forum__unit mt-3">
                                <RouterLink :to="{}" class="text-xl">Гайди і F.A.Q</RouterLink>
                                <div class="flex gap-3 mt-3">
                                    <span>Теми: <b>135</b></span>
                                    <span>Повідомлення: <b>3010</b></span>
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