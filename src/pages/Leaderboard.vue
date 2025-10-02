<script setup lang='ts'>
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { computed, onMounted, ref } from 'vue';
import { useAsyncCallWrapper } from '@/composables/useAsyncCallWrapper';
import { fetchGet } from '@/utils/fetchApi';
import type { CharStats } from '@/models/rating';
import { Race } from '@/models/rating';
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
import Leaderboard1stIcon from '@/assets/images/leaderboard-1st.svg';
import Leaderboard2ndIcon from '@/assets/images/leaderboard-2nd.svg';
import Leaderboard3rdIcon from '@/assets/images/leaderboard-3rd.svg';

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

const activeTab = ref<'general' | 'marathon'>('general')

const {wrapAsyncCall} = useAsyncCallWrapper()

const getLeaderboard = async (type: 'general' | 'marathon' = 'general') => {
    await wrapAsyncCall(async () => {
        const endpoint = type === 'general' ? '/rating' : '/ratingM'
        const {data: _leaders} = await fetchGet(endpoint)
        leaders.value = _leaders
    })
}

const switchTab = async (type: 'general' | 'marathon') => {
    activeTab.value = type
    await getLeaderboard(type)
}

onMounted(async () => {
    await getLeaderboard()
})
</script>
<template>
    <Header />
    <div class="leaderboard w-full">
        <img src="@/assets/images/leaderboard-main-img.jpg" alt="leaderboard-bg" class="leaderboard__bg">
        <div class="leaderboard__content">
            
            <h1 class="leaderboard__title mb-5 text-center">Таблиця лідерів</h1>
            
            <!-- Tab switcher -->
            <div class="tab-switcher mb-4">
                <button 
                    @click="switchTab('general')" 
                    :class="['tab-button', { active: activeTab === 'general' }]"
                >
                    Загальна
                </button>
                <button 
                    @click="switchTab('marathon')" 
                    :class="['tab-button', { active: activeTab === 'marathon' }]"
                >
                    Марафон прокачки
                </button>
            </div>
            
        <div class="table-wrapper">
            <!-- Corner icons -->
            <div class="corner-icon corner-tl">
                <img src="@/assets/images/Corner-TL.svg" alt="Top Left Corner" />
            </div>
            <div class="corner-icon corner-tr">
                <img src="@/assets/images/Corner-TR.svg" alt="Top Right Corner" />
            </div>
            <div class="corner-icon corner-bl">
                <img src="@/assets/images/Corner-BL.svg" alt="Bottom Left Corner" />
            </div>
            <div class="corner-icon corner-br">
                <img src="@/assets/images/Corner-BR.svg" alt="Bottom Right Corner" />
            </div>
            
            <DataTable :value="leadersWithIndex">
                <Column header="№" style="width: 50px">
                    <template #body="slotProps">
                        <div 
                            class="position-cell"
                            :class="{
                                'row-1st': slotProps.data.index === 0,
                                'row-2nd': slotProps.data.index === 1,
                                'row-3rd': slotProps.data.index === 2
                            }"
                        >
                            <img 
                                v-if="slotProps.data.index === 0" 
                                :src="Leaderboard1stIcon" 
                                alt="1st place" 
                                class="position-icon"
                            />
                            <img 
                                v-else-if="slotProps.data.index === 1" 
                                :src="Leaderboard2ndIcon" 
                                alt="2nd place" 
                                class="position-icon"
                            />
                            <img 
                                v-else-if="slotProps.data.index === 2" 
                                :src="Leaderboard3rdIcon" 
                                alt="3rd place" 
                                class="position-icon"
                            />
                            <span v-else>{{ slotProps.data.index + 1 }}</span>
                        </div>
                    </template>
                </Column>
                <Column field="race" header="Раса">
                    <template #body="slotProps">
                        <div 
                            :class="{
                                'row-1st': slotProps.data.index === 0,
                                'row-2nd': slotProps.data.index === 1,
                                'row-3rd': slotProps.data.index === 2
                            }"
                        >{{ RaceNames.get(slotProps.data.race) || "Невідомо" }}
                        </div>
                    </template>
                </Column>
                <Column field="name" header="Нік">
                    <template #body="slotProps">
                        <div 
                            :class="{
                                'row-1st': slotProps.data.index === 0,
                                'row-2nd': slotProps.data.index === 1,
                                'row-3rd': slotProps.data.index === 2
                            }"
                        >{{ slotProps.data.name }}</div>
                    </template>
                </Column>
                <Column field="level" header="Рівень">
                    <template #body="slotProps">
                        <div 
                            :class="{
                                'row-1st': slotProps.data.index === 0,
                                'row-2nd': slotProps.data.index === 1,
                                'row-3rd': slotProps.data.index === 2
                            }"
                        >{{ slotProps.data.level }}</div>
                    </template>
                </Column>
                <Column field="exp" header="Досвід">
                    <template #body="slotProps">
                        <div 
                            :class="{
                                'row-1st': slotProps.data.index === 0,
                                'row-2nd': slotProps.data.index === 1,
                                'row-3rd': slotProps.data.index === 2
                            }"
                        >{{ slotProps.data.exp }}</div>
                    </template>
                </Column>
                <template #empty>
                    <p class="text-center p-2">Список лідерів пустий</p>   
                </template>
            </DataTable>
        </div>
        </div>
    </div>
    <Footer />
</template>
<style scoped lang='scss'>
    .leaderboard {
        text-shadow: none;
        color: white;
        padding-top: clamp(150px, 16vw, 300px);

        &__bg {
            width: 100%;
            height: 100%;
            position: absolute;
            top: clamp(-100px, calc(-100px + 6vw), 0px);
            left: 0;
            z-index: 0;
            object-fit: cover;
            margin-top: clamp(0px, 6vw, 100px);
        }

        &__content {
            padding: 0 15px;
        }

        .tab-switcher {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-bottom: 30px;

            .tab-button {
                font-family: 'VollkornSC', sans-serif;
                padding: 12px 24px;
                background: rgba(250, 250, 250, 0.1);
                border: 1px solid rgba(250, 250, 250, 0.2);
                border-radius: 8px;
                color: #f8f8f8;
                font-size: 16px;
                font-weight: 400;
                cursor: pointer;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);

                &:hover {
                    background: rgba(250, 250, 250, 0.2);
                    border-color: rgba(250, 250, 250, 0.4);
                }

                &.active {
                    background: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%);
                    color: #000;
                    border-color: #fbd298;
                    font-weight: 500;
                }

                @media (max-width: 768px) {
                    padding: 10px 16px;
                    font-size: 14px;
                }
            }
        }

        &__title {
            position: relative;
            font-weight: 400;
            font-size: clamp(44px, 6vw, 96px);
            line-height: 90%;
            letter-spacing: -0.07em;
            text-align: center;
            background: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.8));
        }

        .table-wrapper {
            position: relative;
            width: 100%;
            max-width: 1390px;
            margin: 0 auto;
        }

        .position-cell {
            display: flex;
            align-items: center;
            justify-content: center;
            
            .position-icon {
                width: 40px;
                height: 24px;
                object-fit: contain;

                @media (max-width: 768px) {
                    width: 30px;
                    height: auto;
                }
            }
        }

        .corner-icon {
            position: absolute;
            width: 20px;
            height: 20px;
            z-index: 10;
            pointer-events: none;

            @media (max-width: 768px) {
                width: 25px;
                height: 25px;
            }

            img {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }

            &.corner-tl {
                top: -3px;
                left: -3px;
            }

            &.corner-tr {
                top: -3px;
                right: -3px;
            }

            &.corner-bl {
                bottom: -3px;
                left: -3px;
            }

            &.corner-br {
                bottom: -3px;
                right: -3px;
            }
        }

        ::v-deep(.p-datatable-footer) {
            width: 95%;
            border: none;
        }

        ::v-deep(table) {
            width: 100%;
            max-width: 1390px;
            backdrop-filter: blur(24px);
            background: rgba(250, 250, 250, 0.15);
            border-radius: 5px;
            padding: 30px 30px 35px 30px;


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
                background: transparent !important;
                border: none;
            }

            tr {
                position: relative;
                
                // Розділювач після кожного рядка (включаючи останній)
                &::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 1px;
                    background: linear-gradient(90deg, 
                        rgba(248, 248, 248, 0) 0%, 
                        rgba(248, 248, 248, 0.5) 30%, 
                        rgba(248, 248, 248, 1) 50%, 
                        rgba(248, 248, 248, 0.5) 70%, 
                        rgba(248, 248, 248, 0) 100%
                    );
                    opacity: 0.3;
                }
            }

            th {
                padding: 15px 10px;
                font-size: 22px;

                .p-datatable-column-title {
                    font-weight: 400;
                }

                @media (max-width: 768px) {
                    font-size: 12px;
                    padding: 10px 5px;
                }
            }

            .row-1st {
                font-size: 120%;
                font-weight: 400;
                line-height: 100%;
                letter-spacing: -0.04em;
                background: linear-gradient(180deg, #f8f8f8 0%, #ffd485 70%, #986d2f 100%);
                background-clip: text;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            .row-2nd {
                font-size: 120%;
                font-weight: 400;
                line-height: 100%;
                letter-spacing: -0.04em;
                background: linear-gradient(180deg, #f8f8f8 0%, #d4d4d4 70%, #636363 100%);
                background-clip: text;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            .row-3rd {
                font-size: 120%;
                font-weight: 400;
                line-height: 100%;
                letter-spacing: -0.04em;
                background: linear-gradient(180deg, #f8f8f8 0%, #e0a280 70%, #d67457 100%);
                background-clip: text;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            td {
                padding: 10px;

                @media (max-width: 768px) {
                    padding: 5px;
                }
            }
        }
    }
</style>