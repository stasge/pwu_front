<script setup lang='ts'>
import { useUserStore } from '@/stores/userStore';
import { useAsyncCallWrapper } from '@/composables/useAsyncCallWrapper';
import { fetchPost } from '@/utils/fetchApi';
import Modal from '@/components/base/modal.vue'
import { reactive, ref } from 'vue';
import { required } from '@vuelidate/validators';
import CryptoJS from 'crypto-js';
import useVuelidate from '@vuelidate/core';
import { format } from 'date-fns';
import { useToast } from 'vue-toastification';
import {calculateTimeLeft} from '@/utils/dateUtils.ts'

const userStore = useUserStore()
const { wrapAsyncCall } = useAsyncCallWrapper()
const showed = ref(false)
const passwordHidden = ref(true)
const toast = useToast()

const form = reactive({
    username: '',
    pass: ''
})

const rules = {
    username: {required},
    pass: {required},
}
const v$ = useVuelidate(rules, form)

const addGameUser = async () => {
    if (!await v$.value.$validate()) {
        return
    }
    const data = {
        username: form.username,
        pass: hashedPass()
    }
    wrapAsyncCall(async () => {
        await fetchPost('user/addGameUser', data)
        userStore.loadUser()
        resetForm()
        showed.value = false
    },
    (e) => {
        if (e.data.status_code === 409) {
            toast.error('Акаунт з таким логіном вже існує')
        }
        return true
    }, 'Ігровий акаунт успішно створено')
}

const resetForm = () => {
    form.username = form.pass = ''
    v$.value.$reset()
}

const deleteGameAcc = async (id: number) => {
    wrapAsyncCall(async () => {
        await fetchPost('user/deleteGameUser', {id})
        userStore.loadUser()
    }, null, 'Ігровий акаунт видалено')
}
const recoverGameAcc = async (id: number) => {
    wrapAsyncCall(async () => {
        await fetchPost('user/cancelDeleteGameUser', {id})
        userStore.loadUser()
    }, null, 'Ігровий акаунт відновленно')
}

const hashedPass = () => {
    const combined = (form.username).toLowerCase() + form.pass;
    const md5hash = CryptoJS.MD5(combined);
    const pass_output = CryptoJS.enc.Base64.stringify(md5hash);

    return pass_output
};

const show = () => {
    resetForm()
    showed.value = true
}
</script>
<template>
    <div class="profile flex gap-5 justify-content-between w-full">
        <div class="profile__left">
            <h1 class="profile__title">Особистий кабінет</h1>
            <div class="flex gap-3 mt-3 align-items-center">
                <h3>Ваш email:</h3>
                <p>{{ userStore.user?.email }}</p>
            </div>
            <div class="flex gap-3 mt-3 align-items-center">
                <h3>Ваш логін:</h3>
                <p>{{ userStore.user?.username }}</p>
            </div>
            <div class="flex gap-3 mt-3 align-items-center">
                <h3>Верифікація:</h3>
                <svg v-if="userStore.user?.is_verified" width="21" height="21" viewBox="0 0 21 21" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M19.9936 8.30762L19.52 9.47029C19.3704 9.86609 19.3704 10.2866 19.52 10.6824L19.9936 11.8451C20.2678 12.5378 20.0434 13.3294 19.4202 13.7746L18.3733 14.492C18.0243 14.7394 17.7999 15.1105 17.7002 15.5063L17.4759 16.7432C17.3263 17.4853 16.7031 18.0295 15.9553 18.0543L14.6839 18.1037C14.2601 18.1285 13.8613 18.3016 13.5622 18.5985L12.6897 19.5138C12.1662 20.058 11.3436 20.1817 10.6954 19.8106L9.59862 19.1674C9.2247 18.9448 8.80092 18.8953 8.37714 18.9943L7.13075 19.2911C6.40783 19.4643 5.63507 19.118 5.28607 18.4501L4.71273 17.3121C4.51331 16.9411 4.18924 16.6442 3.7904 16.5205L2.59385 16.1247C1.87094 15.8773 1.42224 15.1847 1.49702 14.4426L1.62166 13.1809C1.67152 12.7604 1.54688 12.3399 1.27267 12.0183L0.474975 11.0288C0.00134306 10.4351 0.00134306 9.61871 0.474975 9.02501L1.27267 8.03551C1.54688 7.71392 1.67152 7.29338 1.62166 6.87284L1.49702 5.61122C1.42224 4.86909 1.87094 4.17643 2.59385 3.92906L3.7904 3.53325C4.18924 3.40957 4.51331 3.11271 4.71273 2.74165L5.28607 1.60372C5.63507 0.935801 6.38291 0.589474 7.13075 0.762637L8.37714 1.05949C8.77599 1.15844 9.2247 1.10896 9.59862 0.886325L10.6954 0.243147C11.3436 -0.127918 12.1662 -0.0289674 12.6897 0.539998L13.5622 1.45529C13.8613 1.75214 14.2601 1.95004 14.6839 1.95004L15.9553 1.99952C16.7031 2.02426 17.3512 2.56849 17.4759 3.31061L17.7002 4.5475C17.775 4.96804 18.0243 5.3391 18.3733 5.56174L19.4202 6.27913C20.0434 6.82336 20.2927 7.61497 19.9936 8.30762Z"
                        fill="#00D566" />
                    <g opacity="0.15">
                        <path
                            d="M6.00899 18.3764L5.43564 17.2384C5.23622 16.8674 4.91216 16.5705 4.51331 16.4468L3.31676 16.051C2.59385 15.8036 2.14515 15.111 2.21993 14.3689L2.34457 13.1072C2.39443 12.6867 2.26979 12.2662 1.99558 11.9446L1.19789 10.9551C0.724255 10.3614 0.724255 9.54502 1.19789 8.95132L1.99558 7.96181C2.26979 7.64022 2.39443 7.21968 2.34457 6.79914L2.21993 5.53752C2.14515 4.79539 2.59385 4.10274 3.31676 3.85536L4.51331 3.45956C4.91216 3.33587 5.23622 3.03902 5.43564 2.66795L6.00899 1.53002C6.20841 1.13422 6.5574 0.862105 6.93132 0.738417C6.25827 0.639466 5.58521 0.985793 5.28608 1.60423L4.71273 2.74217C4.51331 3.11323 4.18924 3.41008 3.7904 3.53377L2.59385 3.92957C1.87094 4.17695 1.42224 4.8696 1.49702 5.61173L1.62166 6.87335C1.67152 7.29389 1.54688 7.71443 1.27267 8.03602L0.474975 9.02553C0.00134305 9.61923 0.00134305 10.4356 0.474975 11.0293L1.27267 12.0188C1.54688 12.3404 1.67152 12.7609 1.62166 13.1815L1.49702 14.4431C1.42224 15.1852 1.87094 15.8779 2.59385 16.1252L3.7904 16.521C4.18924 16.6447 4.51331 16.9416 4.71273 17.3126L5.28608 18.4506C5.63507 19.1185 6.38291 19.4648 7.13075 19.2917L7.28031 19.2669C6.7319 19.168 6.25827 18.8711 6.00899 18.3764Z"
                            fill="black" />
                        <path
                            d="M10.2966 0.812187L11.3934 0.169008C11.4931 0.119533 11.5928 0.0700577 11.6925 0.0453201C11.3436 -0.00415521 10.9696 0.070058 10.6705 0.243222L9.57367 0.8864C9.47396 0.935875 9.37425 0.985351 9.27454 1.01009C9.62353 1.05956 9.97252 1.01009 10.2966 0.812187Z"
                            fill="black" />
                        <path
                            d="M15.3818 18.0046C15.2572 18.0046 15.1325 18.0293 15.0328 18.054L15.9302 18.0046C16.0549 18.0046 16.1546 17.9798 16.2792 17.9551L15.3818 18.0046Z"
                            fill="black" />
                        <path
                            d="M11.3934 19.7116L10.2966 19.0684C9.92266 18.8458 9.49888 18.7963 9.07511 18.8953L8.92554 18.92C9.14989 18.9447 9.34931 19.019 9.54874 19.1179L10.6456 19.7611C11.0693 20.0085 11.543 20.0332 11.9917 19.8848C11.7923 19.8848 11.5928 19.8353 11.3934 19.7116Z"
                            fill="black" />
                    </g>
                    <path d="M6.15857 8.50574L9.27457 12.0432L15.6561 6.94727" fill="#00D566" />
                    <path
                        d="M8.52672 13.8736C8.17773 13.8736 7.82874 13.7252 7.57946 13.4531L4.46346 9.91559C4.01476 9.3961 4.06461 8.62924 4.56317 8.15922C5.08666 7.71394 5.85943 7.76342 6.33306 8.25817L8.67629 10.9051L14.1355 6.55127C14.659 6.13073 15.4567 6.20495 15.8805 6.74918C16.3043 7.2934 16.2295 8.06027 15.6811 8.48081L9.29949 13.6015C9.07514 13.7747 8.80093 13.8736 8.52672 13.8736Z"
                        fill="white" />
                </svg>
                <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clip-path="url(#clip0_2099_292)">
                        <path
                            d="M10 20C15.5228 20 20 15.5228 20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20Z"
                            fill="#C93636" />
                        <path
                            d="M15.6719 14.125L11.5469 10L15.6562 5.875C15.7187 5.8125 15.7187 5.71875 15.6562 5.65625L14.3281 4.32813C14.2656 4.26563 14.1719 4.26563 14.1094 4.32813L10 8.45312L5.89063 4.34375C5.82813 4.28125 5.73437 4.28125 5.67187 4.34375L4.34375 5.67187C4.28125 5.73437 4.28125 5.82813 4.34375 5.89063L8.4375 10L4.32813 14.1094C4.26563 14.1719 4.26563 14.2656 4.32813 14.3281L5.65625 15.6562C5.71875 15.7187 5.82812 15.7187 5.875 15.6562L10 11.5469L14.1094 15.6562C14.1719 15.7187 14.2813 15.7188 14.3438 15.6719L15.6719 14.3438C15.7344 14.2813 15.7344 14.1875 15.6719 14.125Z"
                            fill="white" />
                    </g>
                    <defs>
                        <clipPath id="clip0_2099_292">
                            <rect width="20" height="20" fill="white" />
                        </clipPath>
                    </defs>
                </svg>
            </div>
            <div class="flex gap-3 mt-3 align-items-center">
                <h3>Ігрові акаунти:</h3>
                <p>{{ userStore.user?.game_user.length }}</p>
            </div>
        </div>
        <div class="profile__right flex flex-column align-items-center justify-content-between flex-grow-1">
            <div v-if="!userStore.user?.game_user.length" class="flex flex-column align-items-center justify-content-center">
                <h2>У вас ще немає жодного ігрового акаунту</h2>
            </div>
            <div v-else class="w-full">
                <div class="flex flex-column align-items-center justify-content-center">
                    <h2>Ваші ігрові акаунти</h2>
                    <div class="w-full">
                        <div class="game-acc__header">
                            <p>#</p>
                            <p>Логін</p>
                            <p>Дата створення</p>
                            <p>Час до видалення</p>
                            <p>Дія</p>
                        </div>
                        <div class="game-acc__wrapper">
                            <div v-for="(user, index) of userStore.user.game_user" class="game-acc__item">
                                <p>{{ index + 1 }}.</p>
                                <p>{{ user.username }}</p>
                                <p>{{ format(user.created_at, 'dd-MM-yyyy HH:mm') }}</p>
                                <p>{{ calculateTimeLeft(user.deletion_date) }}</p>
                                <div class="ml-auto">
                                    <svg v-if="!user.is_deleted" @click="deleteGameAcc(user.id)" class="cursor-pointer" width="16" height="16" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M16.9 8H3.09996C2.49996 8 1.99996 8.5 2.09996 9.1L3.69996 22.2C3.79996 23.2 4.69996 23.9 5.69996 23.9H14.2C15.2 23.9 16.1 23.2 16.2 22.2L17.8 9.1C17.9 8.5 17.5 8 16.9 8Z" fill="#FF0000"/>
                                        <path d="M18 2H13C13 0.9 12.1 0 11 0H9C7.9 0 7 0.9 7 2H2C0.9 2 0 2.9 0 4V5C0 5.6 0.4 6 1 6H19C19.6 6 20 5.6 20 5V4C20 2.9 19.1 2 18 2Z" fill="#FF0000"/>
                                    </svg>
                                    <svg v-else @click="recoverGameAcc(user.id)" class="cursor-pointer" width="16" height="13" viewBox="0 0 16 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M0.499984 12.625H0.902328L1.65233 11.4062C2.45311 10.1289 3.40623 8.95313 4.61327 8.41406C5.56639 7.98828 6.43748 7.67578 7.99998 7.63281V10.75L15.5 5.75L7.99998 0.75V3.88672C5.53905 3.99609 3.77733 4.69531 2.40233 6.08203C0.359359 8.14063 0.499984 10.7305 0.499984 11.3828C0.50389 11.7305 0.499984 12.2305 0.499984 12.625Z" fill="#008000"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
            </div>
                </div>
            <button class="btn btn-sm mt-3" @click="show()">Створити</button>
        </div>
    </div>
    <Modal v-model:showed="showed">
        <template #header>
            <h2 class="modal__title mb-5">Створення ігрового акаунту</h2>
        </template>
        <template #body>
            <form @submit.prevent="addGameUser" class="flex flex-column justify-content-center">
                <div class="field w-full">
                    <label for="login" class="w-full">Логін</label>
                    <input 
                        v-model="form.username" 
                        id="login" 
                        type="text" 
                        class="text-base text-color p-2 surface-overlay border-1 border-solid appearance-none outline-none focus:border-primary w-full"
                        :class="{invalid: v$.username.$error}"
                    >
                </div>
                <div class="field w-full">
                    <label for="password">Пароль</label>
                    <input 
                        v-model="form.pass" 
                        id="password" 
                        :type="passwordHidden ? 'password' : 'text'" 
                        class="text-base text-color p-2 surface-overlay border-1 border-solid appearance-none outline-none focus:border-primary w-full"
                        :class="{invalid: v$.pass.$error}"
                    >
                </div>
                <button type="submit" class="btn btn-sm mt-3 align-self-center">Створити</button>
            </form>
        </template>
    </Modal>
</template>
<style scoped lang='scss'>
.profile {
    color: #fff;
    text-shadow: 3px 0px 7px rgba(81, 67, 21, 0.8), -3px 0px 7px rgba(81, 67, 21, 0.8), 0px 4px 7px rgba(81, 67, 21, 0.8);

    &__left,
    &__right {
        padding: 40px;
        background: rgba(93, 119, 144, 0.2);
        border-radius: 10px;
    }
}

.game-acc {

    &__wrapper {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 20px;
        max-height: 240px;
        overflow-y: auto;
        padding-right: 10px;
        position: relative;
        left: 10px;
    }

    &__header {
        display: grid;
        grid-template-columns: 5% 30% 30% 30% 5%;
        padding: 20px 20px 0 20px;
        align-items: end;

        & > * {
            text-align: center;
        }
    }
    
    &__item {
        display: grid;
        grid-template-columns: 5% 30% 30% 30% 5%;
        padding: 20px;
        background: rgba($color: #000000, $alpha: 0.4);
        border-radius: 10px;

        & > * {
            text-align: center;
        }
    }

}
::-webkit-scrollbar {
   width: 6px;
}

/* Track */
::-webkit-scrollbar-track {
    border-radius: 10px;
    background: #3d4c60;
}

/* Handle */
::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background: #e26f0f;
}
</style>