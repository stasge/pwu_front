<script setup lang="ts">
import { useAsyncCallWrapper } from '@/composables/useAsyncCallWrapper';
import { ref, onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import { fetchPost } from '@/utils/fetchApi';
import Paginator from 'primevue/paginator';
import type { User } from '@/models/user';
import { useUserStore } from '@/stores/userStore';
import { format } from 'date-fns';
import Button from 'primevue/button';
const { wrapAsyncCall } = useAsyncCallWrapper();

const users = ref<User[]>([]);
const userStore = useUserStore();

const page = ref(1);
const limit = ref(10);
const total = ref(0);
const ifSearch = ref(false);

const getUsers = async () => {
    const { data: usersData } = await wrapAsyncCall(() =>
        fetchPost('admin/getUsers', { page: page.value, limit: limit.value })
    );
    if (usersData) {
        total.value = usersData.total;
        users.value = usersData.users;
    }
};

const searchUsername = ref('');

const searchUsers = async () => {
    if (searchUsername.value === '') {
        return;
    }
    page.value = 1;
    ifSearch.value = true;
    const { data: usersData } = await wrapAsyncCall(() =>
        fetchPost('admin/searchUsers', {
            username: searchUsername.value,
            page: page.value,
            limit: limit.value
        })
    );
    if (usersData) {
        total.value = usersData.total;
        users.value = usersData.users;
    }
};

const banUser = async (userId: number) => {
    await wrapAsyncCall(async () => {
        await fetchPost('admin/setBan', { id_user: userId });
        getUsers();
    }, null, 'Користувача було заблоковано на форумі');
};
const unbanUser = async (userId: number) => {
    await wrapAsyncCall(async () => {
        await fetchPost('admin/setUnBan', { id_user: userId });
        getUsers();
    }, null, 'Користувача було розблоковано');
};
const fullBanUser = async (userId: number) => {
    await wrapAsyncCall(async () => {
        await fetchPost('admin/setFullBan', { id_user: userId });
        getUsers();
    }, null, 'Користувача було повністю заблоковано');
};

const reset = () => {
    if (searchUsername.value === '') {
        return;
    }
    searchUsername.value = '';
    getUsers();
};

const onPageChange = (event: { page: number, rows: number }) => {
    page.value = event.page + 1;
    limit.value = event.rows;
    if (ifSearch.value) {
        ifSearch.value = false;
    } else {
        getUsers();
    }
};

onMounted(() => {
    getUsers();
});

</script>
<template>
    <div class="users">
        <div class="users__inner">
            <div class="users__container">
                <h1 class="users__title mb-5 text-center">Користувачі</h1>
                <div class="flex justify-content-start align-items-center mb-3">
                    <InputText v-model="searchUsername" placeholder="Пошук користувача" class="w-full" style="max-width: 300px"
                        @keyup.enter="searchUsers" />
                    <Button icon="pi pi-search" class="ml-2 success" @click="searchUsers" v-tooltip="'Пошук'" />
                    <Button icon="pi pi-times" class="ml-2 danger" @click="reset" v-tooltip="'Скинути фільтр'" />
                </div>
                <DataTable :value="users">
                    <Column header="#" style="width: 50px">
                        <template #body="slotProps">
                            <div>{{ slotProps.index + 1 }}</div>
                        </template>
                    </Column>
                    <Column field="id" header="ID"></Column>
                    <Column field="email" header="Email"></Column>
                    <Column field="username" header="Ім'я"></Column>
                    <Column field="role" header="Роль">
                        <template #body="slotProps">
                            <div>{{ userStore.getRoleName(slotProps.data.role) }}</div>
                        </template>
                    </Column>
                    <Column field="createdAt" header="Дата реєстрації">
                        <template #body="slotProps">
                            <div>{{ format(slotProps.data.created_at, 'dd-MM-yyyy') }}</div>
                        </template>
                    </Column>
                    <Column header="Дія" style="width: 120px">
                        <template #body="slotProps">
                            <div class="flex justify-content-center align-items-center gap-1">
                                <Button 
                                    v-if="[6, 7, 8].includes(slotProps.data.role)" 
                                    icon="pi pi-unlock" 
                                    class="mr-2 success-green"
                                    @click="unbanUser(slotProps.data.id)" 
                                    v-tooltip.top="'Розблокувати користувача'" 
                                />
                                <Button 
                                    v-if="slotProps.data.role !== 6"
                                    icon="pi pi-ban" 
                                    class="mr-2 warning" 
                                    @click="banUser(slotProps.data.id)"
                                    v-tooltip.top="'Заблокувати користувача на форумі'" 
                                />
                                <Button 
                                    v-if="slotProps.data.role !== 8"
                                    icon="pi pi-times" 
                                    class="danger" 
                                    @click="fullBanUser(slotProps.data.id)"
                                    v-tooltip.top="'Повне блокування користувача'" 
                                />
                            </div>
                        </template>
                    </Column>
                    <template #empty>
                        <div class="text-center p-4">
                            Немає результатів пошуку.
                        </div>
                    </template>
                </DataTable>
                <Paginator
                    :rows="limit"
                    :totalRecords="total"
                    :rowsPerPageOptions="[5, 10, 20, 30]"
                    class="mt-4"
                    @page="onPageChange"
                />
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.users {
    width: 95%;

    &__title {
        font-size: 30px;
        margin-bottom: 20px;
        color: #fff;
    }

    ::v-deep(.p-datatable-footer) {
        width: 95%;
        border: none;
    }

    ::v-deep(table) {
        width: 100%;

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