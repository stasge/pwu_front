<script setup lang="ts">
import { useAsyncCallWrapper } from '@/composables/useAsyncCallWrapper';
import { fetchGet } from '@/utils/fetchApi';
import { onMounted, ref } from 'vue';
import Login from '@/components/modals/login.vue';
import Register from '@/components/modals/register.vue';
import { useUserStore } from '@/stores/userStore';

const loginRef = ref<InstanceType<typeof Login> | null>(null)
const registerRef = ref<InstanceType<typeof Register> | null>(null)
const userStore = useUserStore()
const {wrapAsyncCall} = useAsyncCallWrapper()
const serverStatusCode = ref<number>()


onMounted(async () => {
    await wrapAsyncCall( async () => {
        const {status_code} = await fetchGet('online')
        serverStatusCode.value = status_code
    })
})
</script>

<template>
    <div class="side-menu flex flex-column relative z-2 w-full" style="transform: translateY(-10%);max-width: 253px;">
        <div class="server-state flex gap-5">
            <div class="rhombus">
                <span>PWU</span>
            </div>
            <div class="server-state__content flex flex-column justify-content-center align-items-end">
                <div class="flex flex-column align-items-start w-max">
                    <h3>PW Ukraine - 1.3.6</h3>
                    <p v-if="serverStatusCode === 200">Статус: <span style="color: #16db65;">Online</span></p>
                    <p v-else>Статус: <span style="color: red;">Offline</span></p>
                </div>
            </div>
        </div>
        <ul class="side-menu__list flex flex-column gap-3 mt-6">
            <li class="side-menu__item">
                <a href="#">Почати гру</a>
            </li>
            <li class="side-menu__item">
                <a href="#">Про сервер</a>
            </li>
            <li v-if="userStore.isLoggedIn" class="side-menu__item">
                <router-link :to="{name: 'profile'}">Особистий кабінет</router-link>
            </li>
            <li v-else class="side-menu__item" @click="loginRef?.showDia()">
                <span>Вхід / Реєстрація</span>
            </li>
            <li class="side-menu__item">
                <a href="#">Форум</a>
            </li>
            <li v-if="userStore.isLoggedIn" @click="userStore.logoutUser()" class="side-menu__item">
                <span>Вийти</span>
            </li>
        </ul>
    </div>
    <Login ref="loginRef" @openRegistration="registerRef?.showDia"/>
    <Register ref="registerRef" @openLogin="loginRef?.showDia"/>
</template>

<style scoped lang="scss">
    .side-menu {

        @media (max-width: 768px) {
            display: none !important;
        }

        &__list {
            list-style: none;
            position: relative;
            z-index: 2;
        }

        &__item {
            background: rgba(93, 119, 144, 0.1);
            font-size: 137.5%; /* 22/16 */
            transition: all .3s;
            color: #fff;
            cursor: pointer;

            a, 
            span {
                padding: 15px 30px;
                display: block;
                width: 100%;
                height: 100%;
            }

            &:hover {
                background: rgba(93, 119, 144, 0.2);
            }
        } 
    }

    .server-state {
        color: #fff;

        &__content {
            width: 100%;
            border-bottom-left-radius: 35px;
            border-top-left-radius: 35px;
            padding: 10px 20px;
            background: linear-gradient(87deg, #e26f0f 0%, rgba(217, 217, 217, 0) 100%), linear-gradient(270deg, #3d4c60 0%, rgba(0, 0, 0, 0) 100%);
        }
    }

    .rhombus {
        position: absolute;
        z-index: 2;
        padding: 27px 20px;
        transform: rotate(45deg) translate(-8px, 2px);
        background:  linear-gradient(225deg, #e26f0f 0%, rgba(217, 217, 217, 0) 100%), linear-gradient(45deg, #3d4c60 0%, rgba(21, 26, 33, 0.34) 65.59%, rgba(0, 0, 0, 0) 100%);

        span {
            display: block;
            transform: rotate(-45deg);
            font-weight: 700;
        }
    }
</style>