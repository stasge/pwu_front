<script setup lang='ts'>
import Modal from '@/components/base/modal.vue'
import { useAsyncCallWrapper } from '@/composables/useAsyncCallWrapper';
import { useUserStore } from '@/stores/userStore';
import { fetchPost } from '@/utils/fetchApi';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';
import Select from 'primevue/select';


const { t } = useI18n()
const toast = useToast();
const { wrapAsyncCall } = useAsyncCallWrapper()
const showed = ref(false)
const userStore = useUserStore()

function showDia() {
    showed.value = true
}

function getRewardTooltip(level: number): string {
    if (level === 1) {
        return `Розважливий (29+)

                Небесний камінь - 5
                Підземний камінь - 5
                Камінь безсмертн. - 10
                Репутація - 50`;
    }
    if (level === 2) {
        return `Злий (59+)

                Небесний камінь - 10
                Підземний камінь - 10
                Камінь безсмертн. - 20
                Репутація - 100`;
    }
    if (level === 3) {
        return `Бездоган./Демон (89+)

                Небесний камінь - 20
                Підземний камінь - 20
                Камінь безсмертн. - 40
                Репутація - 150`;
    }
    return '';
}

function getCultivationName(num: number): string {
  switch (num) {
    case 0: return 'Стійкий';
    case 1: return 'Допитливий';
    case 2: return 'Досвідчений';
    case 3: return 'Розважливий';
    case 4: return 'Загадковий';
    case 5: return 'Жорстокий';
    case 6: return 'Злий';
    case 7: return 'Відчужений';
    case 8: return 'Благочестивий';
    case 20: return 'Бездоганний';
    case 30: return 'Демон';
    default: return '';
  }
}

// --- State for reward modal ---
const rewardModalVisible = ref(false)
const accounts = ref<AccountWithRoles[]>([])
const selectedAccount = ref<AccountWithRoles | null>(null)
const selectedRole = ref<Role | null>(null)
const loadingReward = ref(false)
let rewardParams: {id_ref: number, lvl: number} | null = null

// Типи для акаунта і персонажа
interface Role {
    id: number;
    name: string;
    exp: number;
    reputation: number;
    sp: number;
    lvl: number;
    mp: number;
    race: number;
}
interface AccountWithRoles {
    id: number;
    username: string;
    pass: string;
    roles: Role[];
    // email?: string; // якщо з'явиться в API
}

async function checkRef(id: number, lvl: number) {
    wrapAsyncCall(async () => {
        const res = await fetchPost('user/checkRef', {id_ref: id, lvl})
        if (res?.data && Array.isArray(res.data)) {
            accounts.value = res.data.map((acc: any) => ({
                id: acc.id,
                username: acc.username,
                pass: acc.pass,
                roles: acc.roles?.map((r: any) => ({
                    id: r.id,
                    name: r.name,
                    exp: r.exp,
                    reputation: r.reputation,
                    sp: r.sp,
                    lvl: r.level,
                    mp: r.mp,
                    race: r.race
                })) || []
            }))
            rewardParams = {id_ref: id, lvl}
            selectedAccount.value = null
            selectedRole.value = null
            rewardModalVisible.value = true
        }
    });
}

async function confirmReward() {
    if (!selectedAccount.value || !selectedRole.value || !rewardParams) return;
    loadingReward.value = true
    try {
        await wrapAsyncCall(async () => {
            await fetchPost('user/useRef', {
                id_ref: rewardParams?.id_ref,
                lvl: rewardParams?.lvl,
                id_role: selectedRole.value
            })
            rewardModalVisible.value = false
            toast.success('Нагороду відправлено!')
            userStore.loadUser && userStore.loadUser()
        })
    } finally {
        loadingReward.value = false
    }
}

defineExpose({ showDia })

const refers = computed(() => userStore.user?.refers || []);

const getStatusClass = (val: number) => {
    if (val === 2) return 'checkpoint-done';
    if (val === 1) return 'checkpoint-active';
    return 'checkpoint-inactive';
};

// PrimeVue Select item templates for custom rendering
function accountItemTemplate(account: any) {
    return account?.username || '';
}
function roleItemTemplate(role: any) {
    return role?.name || '';
}

// Мапа для визначення прогресу між чекпоінтами (культиваціями)
const cultivationSteps = [0, 3, 6, 9, 20, 30]; // межі для lvl1, lvl2, lvl3
const cultivationMap = [0, 1, 2, 3, 4, 5, 6, 7, 8, 20, 30];

function getProgressPercent(lvl: number, checkpoint: number): number {
    // checkpoint: 1 (lvl1), 2 (lvl2), 3 (lvl3)
    // lvl - поточний рівень культивації реферала
    // Для кожного чекпоінта визначаємо межі
    let min = 0, max = 0;
    if (checkpoint === 1) {
        min = 0; max = 3;
    } else if (checkpoint === 2) {
        min = 3; max = 6;
    } else if (checkpoint === 3) {
        min = 6; max = 9;
    }
    if (lvl < min) return 0;
    if (lvl >= max) return 100;
    return Math.round(((lvl - min) / (max - min)) * 100);
}
</script>
<template>
    <Modal v-model:showed="showed">
        <template #header>
            <h2 class="modal__title">Всі реферали</h2>
        </template>
        <template #body>
            <div class="flex flex-column justify-content-center w-full">
                <div class="ref-table-wrapper">
                    <table class="ref-table">
                        <thead>
                            <tr>
                                <th>№</th>
                                <th>Ім'я</th>
                                <th>
                                    <div class="flex gap-1 align-items-center justify-content-center">
                                        <span>Культивація</span>
                                        <i class="pi pi-question-circle" v-tooltip.top="`Стійкий (0+)
                                            Допитливий (9+)
                                            Досвідчений (19+)
                                            Розважливий (29+)
                                            Загадковий (39+)
                                            Жорстокий (49+)
                                            Злий (59+)
                                            Відчужений (69+)
                                            Благочестивий (79+)
                                            Бездоган./Демон (89+)
                                        `"></i>
                                    </div>
                                </th>
                                <th>
                                    <div class="flex gap-1 align-items-center justify-content-center">
                                        <span>Прогрес</span>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(ref, idx) in refers" :key="ref.id">
                                <td>{{ idx + 1 }}</td>
                                <td>{{ ref.name }}</td>
                                <td>{{ getCultivationName(ref.lvl) }}</td>
                                <td>
                                    <div class="progressbar-inline">
                                        <img src="@/assets/images/start-ref.png" width="35"  alt="start">
                                        <div class="relative">
                                            <span class="progress-line-mini-bg"></span>
                                            <span class="progress-line-mini checkpoint-active" :style="{width: getProgressPercent(ref.lvl, 1) + '%'}"></span>
                                        </div>
                                        <span class="checkpoint-mini" :class="getStatusClass(ref.lvl1)">
                                            <img 
                                                v-if="ref.lvl1 === 0"  
                                                src="@/assets/images/chest-closed.png" 
                                                width="35"
                                                v-tooltip.top="getRewardTooltip(1)"
                                            >
                                            <img 
                                                v-else-if="ref.lvl1 === 1" 
                                                src="@/assets/images/chest-opened.png" 
                                                width="35"
                                                v-tooltip.top="getRewardTooltip(1)"
                                                class="cursor-pointer"
                                                @click="checkRef(ref.id, 3)"
                                            >
                                            <img v-else v-tooltip.top="'Нагороду отримано'" src="@/assets/images/chest-empty.png" width="35" alt="">
                                        </span>
                                        <div class="relative">
                                            <span class="progress-line-mini-bg"></span>
                                            <span class="progress-line-mini checkpoint-active" :style="{width: getProgressPercent(ref.lvl, 2) + '%'}"></span>
                                        </div>
                                        <span class="checkpoint-mini" :class="getStatusClass(ref.lvl2)">
                                            <img 
                                                v-if="ref.lvl2 === 0" 
                                                src="@/assets/images/chest-closed.png" 
                                                width="35"
                                                v-tooltip.top="getRewardTooltip(2)"
                                            >
                                            <img 
                                                v-else-if="ref.lvl2 === 1" 
                                                src="@/assets/images/chest-opened.png"
                                                width="35" 
                                                v-tooltip.top="getRewardTooltip(2)"
                                                class="cursor-pointer"
                                                @click="checkRef(ref.id, 6)"
                                            >
                                            <img v-else v-tooltip.top="'Нагороду отримано'" src="@/assets/images/chest-empty.png" width="35">
                                        </span>
                                        <div class="relative">
                                            <span class="progress-line-mini-bg"></span>
                                            <span class="progress-line-mini checkpoint-active" :style="{width: getProgressPercent(ref.lvl, 3) + '%'}"></span>
                                        </div>
                                        <span class="checkpoint-mini" :class="getStatusClass(ref.lvl3)">
                                            <img 
                                                v-if="ref.lvl3 === 0" 
                                                src="@/assets/images/chest-closed.png" 
                                                width="35"
                                                v-tooltip.top="getRewardTooltip(3)"
                                            >
                                            <img 
                                                v-else-if="ref.lvl3 === 1" 
                                                src="@/assets/images/chest-opened.png"
                                                width="35"
                                                v-tooltip.top="getRewardTooltip(3)"
                                                class="cursor-pointer"
                                                @click="checkRef(ref.id, 9)"
                                            >
                                            <img v-else v-tooltip.top="'Нагороду отримано'" src="@/assets/images/chest-empty.png" width="35">
                                        </span>
                                    </div>
                                </td>
                            </tr>
                            <tr v-if="refers.length === 0">
                                <td colspan="4" class="text-left">
                                    <p class="text-center">Список рефералів пустий.</p><br>
                                    За кожну людину, яка зареєструється з вашим реферальним кодом <br> і досягне відповідного статусу культивації, ви отримаєте нагороду.
                                    <div class="flex align-items-center gap-2">
                                        <span>Розважливий (29+): </span>
                                        <img  
                                            src="@/assets/images/chest-closed.png" 
                                            width="35"
                                            v-tooltip.top="getRewardTooltip(1)"
                                        >
                                    </div>
                                    <div class="flex align-items-center gap-2">
                                        <span>Злий (59+): </span>
                                        <img 
                                            src="@/assets/images/chest-closed.png" 
                                            width="35"
                                            v-tooltip.top="getRewardTooltip(2)"
                                        >
                                    </div>
                                    <div class="flex align-items-center gap-2">
                                        <span>Бездоганний/Демон (89+): </span>
                                        <img  
                                            src="@/assets/images/chest-closed.png" 
                                            width="35"
                                            v-tooltip.top="getRewardTooltip(3)"
                                        >
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </template>
    </Modal>

    <!-- Reward Selection Modal -->
    <Modal v-model:showed="rewardModalVisible">
        <template #header>
            <h2 class="modal__title">Вибір акаунта та персонажа</h2>
        </template>
        <template #body>
            <div class="select-acc-modal flex flex-column justify-content-center w-full">
                <div v-if="accounts.length === 0" class="text-center text-secondary">
                    Немає доступних акаунтів для вибору.
                </div>
                <div v-else>
                    <div class="mb-4">
                        <Select
                            v-model="selectedAccount"
                            :options="accounts"
                            optionLabel="username"
                            placeholder="Оберіть акаунт"
                            class="w-full md:w-20rem"
                            :itemTemplate="accountItemTemplate"
                        />
                    </div>
                    <div v-if="selectedAccount" class="mb-4">
                        <div class="font-semibold">Доступні персонажі:</div>
                        <Select
                            v-model="selectedRole"
                            :options="selectedAccount.roles"
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Оберіть персонажа"
                            class="w-full md:w-20rem mt-2"
                            :itemTemplate="roleItemTemplate"
                        />
                    </div>
                </div>
                <div class="flex justify-content-center gap-2">
                    <button
                        class="fantasy-btn"
                        @click="confirmReward"
                        :disabled="loadingReward || !selectedAccount || !selectedRole"
                    >
                        <span v-if="loadingReward" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        <span>Відправити</span>
                    </button>
                </div>
            </div>
        </template>
    </Modal>
</template>

<style scoped lang='scss'>
.ref-table-wrapper {
    max-height: 420px;
    overflow-y: auto;
    margin-bottom: 1rem;
}

.ref-table {
    color: black;
    width: 100%;
    border-collapse: collapse;
    background: #fff;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 2px 8px #0001;

    th,
    td {
        padding: 10px 8px;
        text-align: center;
        border-bottom: 1px solid #eee;
    }

    th {
        background: #f7f7f7;
        font-weight: bold;
        font-size: 1rem;
    }

    tr:last-child td {
        border-bottom: none;
    }
}

.progressbar-inline {
    display: flex;
    align-items: center;
    gap: 4px;
    justify-content: center;
}

.checkpoint-mini {
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 0.95rem;
    color: rgb(35, 35, 83);
    transition: background 0.2s;
}

.checkpoint-active {
    
    img {
        position: relative;
        background: #fffbe6;
        z-index: 1;
        animation: chest-flicker 1.2s infinite alternate;

        @keyframes chest-flicker {
            0% {
            opacity: 1;
            filter: none;
            }
            20% {
            opacity: 0.7;
            filter: brightness(1.2);
            }
            40% {
            opacity: 0.9;
            filter: brightness(1);
            }
            60% {
            opacity: 0.8;
            filter: brightness(1.3);
            }
            80% {
            opacity: 1;
            filter: brightness(1);
            }
            100% {
            opacity: 1;
            filter: none;
            }
        }
    }
}


.progress-line-mini {
    width: 25px;
    height: 5px;
    border-radius: 2px;
    background: #ccc;
    transition: background 0.2s;
    position: absolute;
    left: 0;
    bottom: 3px;
}
.progress-line-mini-bg {
    display: inline-block;
    width: 25px;
    height: 5px;
    border-radius: 2px;
    background: #e0e0e0;
    position: relative;
}

.progress-line-mini.checkpoint-active {
    background: #4caf50;
}

.progress-line-mini.checkpoint-done {
    background: #4caf50;
}

.account-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 10px;
    cursor: pointer;
    transition: border-color 0.2s;

    &--selected {
        border-color: #4caf50;
        background: #f9f9f9;
    }

    &__info {
        .font-semibold {
            color: #333;
        }

        .text-secondary {
            color: #777;
        }
    }
}

.role-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 8px 12px;
    cursor: pointer;
    transition: border-color 0.2s;

    &--selected {
        border-color: #4caf50;
        background: #f9f9f9;
    }
}

.select-acc-modal {
    
    ::v-deep(.p-select) {
        width: 100% !important;

        border: rgba(0, 0, 0, 1);
    }

    ::v-deep(.p-select-list) {
        background: rgba(0, 0, 0, 1) !important;
    }
}
</style>