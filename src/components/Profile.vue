<script setup lang='ts'>
import { useUserStore } from '@/stores/userStore';
import { useAsyncCallWrapper } from '@/composables/useAsyncCallWrapper';
import { fetchGet, fetchPost } from '@/utils/fetchApi';
import Modal from '@/components/base/modal.vue'
import Button from 'primevue/button';
import { reactive, ref } from 'vue';
import { maxLength, required } from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';
import { format } from 'date-fns';
import { useToast } from 'vue-toastification';
import {calculateTimeLeft} from '@/utils/dateUtils.ts'
import ChangeGameAccPass from '@/components/modals/ChangeGameAccPass.vue';
import ChangePhone from './modals/ChangePhone.vue';
import ChangeMainPassword from './modals/ChangeMainPassword.vue';
import PromoCode from './modals/PromoCode.vue';
import { useI18n } from 'vue-i18n'

const {t} = useI18n()
const changeGameAccPassRef = ref()
const changePhoneRef = ref()
const changeMainPasswordRef = ref()
const promoCodeRef = ref()
const filesBase = import.meta.env.VITE_FILES_URL

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
    username: {required, maxLength: maxLength(20)},
    pass: {required},
}
const v$ = useVuelidate(rules, form)

const addGameUser = async () => {
    if (!await v$.value.$validate()) {
        return
    }
    const data = {
        username: form.username,
        pass: form.pass
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
        } else {
            console.error(e)
            toast.error(t(e.data.msg))
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

const changeAvatar = async (event: any) => {
    const image = event.target.files[0]
    const formData = new FormData()
    formData.append('image', image)
    if (image) {
        const {data: user} = await fetchPost('user/changeAvatar', formData)
        userStore.loadUser(user)
    }
}

const changePass = async () => {
    await wrapAsyncCall(async () => {
        await fetchGet('user/changePass')
        changeMainPasswordRef.value.showDia()
    }, null, 'На вашу пошту було надіслано лист з кодом для зміни паролю')
}

const removeReadonly = (event: any) => {
    event.target.removeAttribute('readonly');
}

const show = () => {
    resetForm()
    showed.value = true
}
</script>
<template>
    <div class="profile">
        <div class="profile__container flex gap-5 justify-content-between w-full flex-wrap">
            <div class="profile__left w-full">
                <h1 class="profile__title">Особистий кабінет</h1>
                <div class="flex flex-wrap gap-6 mt-6">
                    <div class="relative">
                        <div class="profile__writer writer flex flex-column align-items-center justify-content-center gap-2">
                            <svg v-if="!userStore.user?.avatar" class="writer__avatar" width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M25 24.9997C29.6023 24.9997 33.3333 21.2687 33.3333 16.6663C33.3333 12.064 29.6023 8.33301 25 8.33301C20.3976 8.33301 16.6666 12.064 16.6666 16.6663C16.6666 21.2687 20.3976 24.9997 25 24.9997Z" fill="#e26f0f"/>
                                <path d="M41.6667 39.583V41.6663C41.6667 42.2189 41.4472 42.7488 41.0565 43.1395C40.6658 43.5302 40.1359 43.7497 39.5834 43.7497H10.4167C9.86417 43.7497 9.33427 43.5302 8.94357 43.1395C8.55287 42.7488 8.33337 42.2189 8.33337 41.6663V39.583C8.33337 36.2678 9.65033 33.0884 11.9945 30.7442C14.3387 28.4 17.5182 27.083 20.8334 27.083H29.1667C32.4819 27.083 35.6613 28.4 38.0055 30.7442C40.3497 33.0884 41.6667 36.2678 41.6667 39.583Z" fill="#e26f0f"/>
                            </svg>
                            <img v-else :src="filesBase + userStore.user?.avatar" alt="#">
                            <div class="writer__add-btn">
                                <label for="addAvatarInput">
                                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="11" cy="11" r="11" fill="white"/>
                                        <path d="M11 0C4.9 0 0 4.9 0 11C0 17.1 4.9 22 11 22C17.1 22 22 17.1 22 11C22 4.9 17.1 0 11 0ZM16 13H13V16C13 17.1 12.1 18 11 18C9.9 18 9 17.1 9 16V13H6C4.9 13 4 12.1 4 11C4 9.9 4.9 9 6 9H9V6C9 4.9 9.9 4 11 4C12.1 4 13 4.9 13 6V9H16C17.1 9 18 9.9 18 11C18 12.1 17.1 13 16 13Z" fill="#E26F0F"/>
                                    </svg>
                                </label>
                                <input @change="changeAvatar" id="addAvatarInput" class="hidden" type="file">
                            </div>
                        </div>
                    </div>
                    <div class="flex gap-6">
                        <div>
                            <div class="flex gap-3 align-items-center">
                                <h3>Ваш email:</h3>
                                <p>{{ userStore.user?.email }}</p>
                            </div>
                            <div class="flex gap-3 mt-3 align-items-center">
                                <h3>Ваш логін:</h3>
                                <p>{{ userStore.user?.username }}</p>
                            </div>
                            <div class="flex gap-3 mt-3 align-items-center">
                                <h3>Ваш номер телефону:</h3>
                                <p>
                                    <div v-if="userStore.user?.phone" class="flex align-items-center gap-3">
                                        <span >{{ userStore.user?.phone }}</span>
                                        <Button 
                                            v-tooltip="'Змінити номер телефону'" 
                                            icon="pi pi-pencil" 
                                            @click="changePhoneRef.showDia(true, userStore.user?.phone)" 
                                            class="primary"
                                        />
                                    </div>
                                    <div v-else class="flex align-items-center gap-3">
                                        <span>Відсутній</span>
                                        <Button 
                                            v-tooltip="'Додати номер телефону'" 
                                            icon="pi pi-plus" 
                                            @click="changePhoneRef.showDia(true, userStore.user?.phone)" 
                                            class="success"
                                        />
                                    </div>
                                </p>
                            </div>
                            <Button  
                                icon="pi pi-pencil" 
                                @click="changePass" 
                                class="primary mt-3"
                                label="Змінити пароль"
                            />
                        </div> 
                        <div>
                            <div class="flex gap-3 align-items-center">
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
                            <div class="flex gap-3 mt-3 align-items-center">
                                <Button 
                                    label="Ввести промокод" 
                                    icon="pi pi-ticket" 
                                    class="primary" 
                                    @click="promoCodeRef.showDia()" 
                                />
                            </div>
                        </div>
                    </div>
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
                                    <div class="ml-auto flex gap-3 align-items-center">
                                        <div v-tooltip.top="'Змінити пароль ігрового акаунту'" >
                                            <svg 
                                                @click="changeGameAccPassRef.showDia(user.id)" 
                                                class="cursor-pointer"
                                                width="18" 
                                                height="18" 
                                                viewBox="0 0 16 16" 
                                                fill="none" 
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <g clip-path="url(#clip0_45_2)">
                                                    <path d="M14.5135 4.61062C14.4753 4.53841 14.4101 4.48425 14.3321 4.45994C14.2542 4.43563 14.1697 4.44315 14.0973 4.48087C14.0248 4.51859 13.9702 4.58343 13.9454 4.66125C13.9206 4.73908 13.9275 4.82356 13.9648 4.89626C14.6287 6.1635 14.8692 7.61006 14.6512 9.02396C14.4332 10.4379 13.768 11.7448 12.7533 12.7531C10.1327 15.3734 5.86839 15.3742 3.24678 12.7529C3.20352 12.7096 3.1484 12.6802 3.08839 12.6682C3.02838 12.6563 2.96619 12.6625 2.90967 12.6859C2.85316 12.7093 2.80487 12.749 2.77091 12.7999C2.73695 12.8508 2.71884 12.9106 2.71889 12.9718V14.7499C2.71889 14.8319 2.75147 14.9106 2.80947 14.9686C2.86747 15.0266 2.94613 15.0592 3.02815 15.0592C3.11018 15.0592 3.18884 15.0266 3.24684 14.9686C3.30484 14.9106 3.33742 14.8319 3.33742 14.7499V13.6702C4.64454 14.7445 6.2826 15.3344 7.97455 15.3401C9.6665 15.3459 11.3085 14.7671 12.6229 13.7016C13.9372 12.6362 14.8433 11.1495 15.1878 9.49294C15.5323 7.83642 15.2941 6.11176 14.5135 4.61062Z" fill="white"/>
                                                    <path d="M3.24677 3.24697C5.86811 0.625905 10.1324 0.62618 12.7532 3.24669C12.7965 3.29001 12.8516 3.31953 12.9116 3.3315C12.9716 3.34348 13.0338 3.33737 13.0903 3.31396C13.1468 3.29055 13.1952 3.25088 13.2291 3.19998C13.2631 3.14909 13.2812 3.08925 13.2811 3.02806V1.24994C13.2811 1.16792 13.2485 1.08925 13.1905 1.03126C13.1325 0.973257 13.0539 0.940674 12.9719 0.940674C12.8898 0.940674 12.8112 0.973257 12.7532 1.03126C12.6952 1.08925 12.6626 1.16792 12.6626 1.24994V2.32963C9.78198 -0.0423383 5.50171 0.11724 2.80951 2.80944C1.70124 3.91054 0.974826 5.33769 0.736734 6.8817C0.498642 8.42572 0.761396 10.0054 1.48648 11.3892C1.52468 11.4614 1.58988 11.5156 1.66787 11.5399C1.74585 11.5642 1.83028 11.5567 1.90274 11.519C1.9752 11.4812 2.0298 11.4164 2.05462 11.3386C2.07944 11.2608 2.07247 11.1763 2.03523 11.1036C1.37133 9.83638 1.13076 8.38986 1.34878 6.976C1.56681 5.56214 2.23196 4.25529 3.24677 3.24697Z" fill="white"/>
                                                    <path d="M3.95003 7.9549V11.3749C3.95069 11.5985 4.03979 11.8127 4.19788 11.9708C4.35598 12.1289 4.5702 12.218 4.79378 12.2186H11.2062C11.4298 12.218 11.644 12.1289 11.8021 11.9708C11.9602 11.8127 12.0493 11.5985 12.05 11.3749V7.9549C12.0493 7.73132 11.9602 7.51708 11.8021 7.35898C11.644 7.20089 11.4298 7.11179 11.2062 7.11115H4.79378C4.5702 7.11181 4.35598 7.20092 4.19789 7.35901C4.0398 7.5171 3.95069 7.73132 3.95003 7.9549ZM10.25 9.0041C10.3807 9.0041 10.5085 9.04286 10.6171 9.11547C10.7258 9.18808 10.8105 9.29129 10.8605 9.41204C10.9105 9.53279 10.9236 9.66566 10.8981 9.79385C10.8726 9.92204 10.8097 10.0398 10.7173 10.1322C10.6249 10.2246 10.5071 10.2876 10.3789 10.3131C10.2507 10.3386 10.1179 10.3255 9.99711 10.2755C9.87636 10.2254 9.77315 10.1407 9.70054 10.0321C9.62793 9.92339 9.58917 9.79562 9.58917 9.66492C9.58934 9.48971 9.65902 9.32173 9.78291 9.19783C9.9068 9.07394 10.0748 9.00427 10.25 9.0041ZM8 9.0041C8.1307 9.0041 8.25846 9.04286 8.36714 9.11547C8.47581 9.18808 8.56051 9.29129 8.61053 9.41204C8.66054 9.53279 8.67363 9.66566 8.64813 9.79385C8.62263 9.92204 8.55969 10.0398 8.46727 10.1322C8.37485 10.2246 8.25711 10.2876 8.12892 10.3131C8.00073 10.3386 7.86786 10.3255 7.74711 10.2755C7.62636 10.2254 7.52315 10.1407 7.45054 10.0321C7.37793 9.92339 7.33917 9.79562 7.33917 9.66492C7.33934 9.48971 7.40902 9.32173 7.53291 9.19783C7.6568 9.07394 7.82479 9.00427 8 9.0041ZM5.75 9.0041C5.8807 9.0041 6.00846 9.04286 6.11714 9.11547C6.22581 9.18808 6.31051 9.29129 6.36053 9.41204C6.41054 9.53279 6.42363 9.66566 6.39813 9.79385C6.37263 9.92204 6.30969 10.0398 6.21727 10.1322C6.12486 10.2246 6.00711 10.2876 5.87892 10.3131C5.75073 10.3386 5.61786 10.3255 5.49711 10.2755C5.37636 10.2254 5.27315 10.1407 5.20054 10.0321C5.12793 9.92339 5.08917 9.79562 5.08917 9.66492C5.08934 9.48971 5.15902 9.32173 5.28291 9.19783C5.4068 9.07394 5.57479 9.00427 5.75 9.0041Z" fill="white"/>
                                                    <path d="M10.7392 6.49241V5.36734C10.7392 4.64087 10.4506 3.94415 9.93688 3.43046C9.42319 2.91676 8.72647 2.62817 8 2.62817C7.27353 2.62817 6.57681 2.91676 6.06312 3.43046C5.54942 3.94415 5.26083 4.64087 5.26083 5.36734V6.49241H5.87937V5.36734C5.87937 4.80491 6.1028 4.26552 6.50049 3.86782C6.89819 3.47013 7.43758 3.2467 8.00001 3.2467C8.56244 3.2467 9.10183 3.47013 9.49953 3.86782C9.89723 4.26552 10.1206 4.80491 10.1206 5.36734V6.49241H10.7392Z" fill="white"/>
                                                </g>
                                                <defs>
                                                    <clipPath id="clip0_45_2">
                                                        <rect width="16" height="16" fill="white"/>
                                                    </clipPath>
                                                </defs>
                                            </svg>
                                        </div>
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
    </div>
    <Modal v-model:showed="showed">
        <template #header>
            <h2 class="modal__title mb-5">Створення ігрового акаунту</h2>
        </template>
        <template #body>
            <form @submit.prevent="addGameUser" class="flex flex-column justify-content-center w-full" autocomplete="off">
                <div class="field w-full">
                    <label for="gameAccL" class="w-full">Логін</label>
                    <input 
                        v-model="form.username" 
                        id="gameAccL" 
                        type="text" 
                        class="text-base text-color p-2 surface-overlay border-1 border-solid appearance-none outline-none focus:border-primary w-full"
                        :class="{invalid: v$.username.$error}"
                        autocomplete="off"
                        readonly
                        @focus="removeReadonly($event)"
                    >
                    <small class="text-right block" :class="{'text-red': form.username.length > 20}">{{ form.username.length }}/20</small>
                </div>
                <div class="field w-full">
                    <label for="gameAccP">Пароль</label>
                    <input 
                        v-model="form.pass" 
                        id="gameAccP" 
                        :type="passwordHidden ? 'password' : 'text'" 
                        class="text-base text-color p-2 surface-overlay border-1 border-solid appearance-none outline-none focus:border-primary w-full"
                        :class="{invalid: v$.pass.$error}"
                        autocomplete="off"
                    >
                </div>
                <button type="submit" class="btn btn-sm mt-3 align-self-center">Створити</button>
            </form>
        </template>
    </Modal>
    <ChangeGameAccPass ref="changeGameAccPassRef"/>
    <ChangePhone ref="changePhoneRef"/>
    <ChangeMainPassword  ref="changeMainPasswordRef"/>
    <PromoCode ref="promoCodeRef"/>
</template>
<style scoped lang='scss'>
.profile {
    color: #fff;
    text-shadow: 3px 0px 7px rgba(81, 67, 21, 0.8), -3px 0px 7px rgba(81, 67, 21, 0.8), 0px 4px 7px rgba(81, 67, 21, 0.8);

    &__left,
    &__right {
        padding: clamp(0px, 5vw, 40px);
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
        grid-template-columns: 5% 30% 30% 20% 15%;
        padding: 20px 20px 0 20px;
        align-items: end;

        & > * {
            text-align: center;
        }
    }
    
    &__item {
        display: grid;
        grid-template-columns: 5% 30% 30% 20% 15%;
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

.writer {
    width: 100px;
    height: 100px;
    background: rgba(93, 119, 144, 0.1);
    border-radius: 100%; 
    z-index: 1;
    position: relative;
    
    &__avatar {
        border-radius: 100%;
    }

    img {
        position: absolute;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: top;
        border-radius: 100%;
    }
    
    &__add-btn {
        position: absolute;
        bottom: -10px;
        left: 79%;
        transform: translateY(-55%);
        z-index: 1;

        svg {
            cursor: pointer;
        }
    }
}
</style>