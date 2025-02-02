<script setup lang='ts'>
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { computed, onMounted, ref } from 'vue';
import { useAsyncCallWrapper } from '@/composables/useAsyncCallWrapper';
import { fetchGet } from '@/utils/fetchApi';
import type { CharStats } from '@/models/rating';
import { Race } from '@/models/rating';

const RaceNames = new Map<Race, string>([
  [Race.Warrior, "Воїн"],
  [Race.Mage, "Чарівник"],
  [Race.Druid, "Друїд"],
  [Race.Werewolf, "Перевертень"],
  [Race.Archer, "Лучник"],
  [Race.Priest, "Жрець"],
]);

const leaders = ref<CharStats[]>([])
const leadersWithIndex = computed(() =>
  leaders.value.map((item, index) => ({ index, ...item }))
);

const {wrapAsyncCall} = useAsyncCallWrapper()

const getLeaderboard = async () => {
    await wrapAsyncCall(async () => {
        const {data: _leaders} = await fetchGet('/rating')
        leaders.value = _leaders
    })
}

onMounted(async () => {
    await getLeaderboard()
})
</script>
<template>
    <div class="leaderboard w-full">
        <h1 class="leaderboard__title mb-5 text-center">Таблиця лідерів</h1>
        <DataTable :value="leadersWithIndex">
            <Column header="#" style="width: 50px">
                <template #body="slotProps">
                    <div>{{ slotProps.data.index + 1 }}</div>
                </template>
            </Column>
            <Column field="race" header="Раса">
                <template #body="slotProps">
                    <div>{{ RaceNames.get(slotProps.data.race) || "Невідомо" }}
                    </div>
                </template>
            </Column>
            <Column field="name" header="Нік"></Column>
            <Column field="level" header="Рівень"></Column>
            <Column field="exp" header="Досвід"></Column>
            <template #empty>
                <p class="text-center p-2">Список лідерів пустий</p>   
            </template>
        </DataTable>
    </div>
</template>
<style scoped lang='scss'>
    .leaderboard {
        text-shadow: none;
        color: white;

        ::v-deep(.p-datatable-footer) {
            width: 95%;
            border: none;
        }

        ::v-deep(table) {
            width: 95%;

            @media (max-width: 768px) {
                width: 100%;
            }
            
            * {
                text-shadow: none;
                color: white;
            }

            tr, 
            th,
            td {
                background: #171d2b !important;
                border: 1px solid rgba(93, 119, 144, 0.1);
            }

            th {
                padding: 15px 10px;
                font-size: 22px;

                * {
                    // color: #e26f0f !important;

                }
            }

            td {
                padding: 10px;
            }
        }
    }
</style>