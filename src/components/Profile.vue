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
import AllRefersModal from './modals/AllRefersModal.vue';

const {t} = useI18n()
const changeGameAccPassRef = ref()
const changePhoneRef = ref()
const changeMainPasswordRef = ref()
const promoCodeRef = ref()
const allRefersModalRef = ref()
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

const copyReferralCode = (code: string | undefined) => {
    if (!code) {
        toast.error('Реферальний код відсутній')
        return
    }
    navigator.clipboard.writeText(code)
    toast.success('Реферальний код скопійовано')
}

const show = () => {
    resetForm()
    showed.value = true
}
</script>
<template>
    <div class="profile">
        <div class="profile__header flex justify-content-between align-items-center w-full mb-6">
            <h1 class="profile__title text-center md:text-left flex-grow-1">Особистий кабінет</h1>
            <div class="flex column-gap-6 row-gap-3 flex-wrap justify-content-center flex-grow-1 md:justify-content-end">
                <button class="profile__promo-btn fantasy-btn small" @click="promoCodeRef.showDia()">
                    <img width="20" src="@/assets/images/Jewel.svg" alt="Jewel">
                    <span>Ввести промокод</span>
                </button>
                <button class="profile__exit-btn fantasy-btn small danger mr-3" @click="userStore.logoutUser()">
                    <img width="20" src="@/assets/images/Exit.svg" alt="Exit">
                    <span>Вийти</span>
                </button>
            </div>
        </div>
        <div class="profile__container flex gap-5 justify-content-between w-full flex-wrap">
            <!-- Блок ПЕРСОНАЛЬНІ ДАНІ -->
            <div class="profile__left-block flex gap-5 flex-wrap lg:flex-nowrap w-full">
                <div class="profile__personal">
                    <div class="profile__block-corner profile__block-corner--top-left"></div>
                    <div class="profile__block-corner profile__block-corner--top-right"></div>
                    <div class="profile__block-corner profile__block-corner--bottom-left"></div>
                    <div class="profile__block-corner profile__block-corner--bottom-right"></div>
                    
                    <div class="profile__personal-header flex justify-content-between align-items-center">
                        <h2 class="profile__block-title">Персональні дані</h2>
                        <button class="profile__change-password-btn profile__change-password-btn--desktop fantasy-btn small" @click="changePass">
                            <img src="@/assets/images/feather.svg" alt="Edit">
                            <span>Змінити пароль</span>
                        </button>
                    </div>
                    
                    <div class="profile__personal-content flex gap-6">
                        <div class="profile__avatar-wrapper">
                            <div class="profile__avatar">
                                <svg v-if="!userStore.user?.avatar" class="profile__avatar-placeholder" width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M25 24.9997C29.6023 24.9997 33.3333 21.2687 33.3333 16.6663C33.3333 12.064 29.6023 8.33301 25 8.33301C20.3976 8.33301 16.6666 12.064 16.6666 16.6663C16.6666 21.2687 20.3976 24.9997 25 24.9997Z" fill="#e26f0f"/>
                                    <path d="M41.6667 39.583V41.6663C41.6667 42.2189 41.4472 42.7488 41.0565 43.1395C40.6658 43.5302 40.1359 43.7497 39.5834 43.7497H10.4167C9.86417 43.7497 9.33427 43.5302 8.94357 43.1395C8.55287 42.7488 8.33337 42.2189 8.33337 41.6663V39.583C8.33337 36.2678 9.65033 33.0884 11.9945 30.7442C14.3387 28.4 17.5182 27.083 20.8334 27.083H29.1667C32.4819 27.083 35.6613 28.4 38.0055 30.7442C40.3497 33.0884 41.6667 36.2678 41.6667 39.583Z" fill="#e26f0f"/>
                                </svg>
                                <img v-else :src="filesBase + userStore.user?.avatar" alt="Avatar">
                            </div>
                            <label for="addAvatarInput" class="profile__avatar-upload">
                                <img src="@/assets/images/load-avatar.svg" alt="Upload">
                            </label>
                            <input @change="changeAvatar" id="addAvatarInput" class="hidden" type="file" accept="image/png, image/jpeg">
                        </div>
                        
                        <div class="profile__personal-info flex flex-column gap-3">
                            <div class="profile__personal-info-row flex flex-wrap gap-3 align-items-center">
                                <span class="profile__personal-info-label">Email:</span>
                                <span>{{ userStore.user?.email }}</span>
                                <img v-if="userStore.user?.is_verified" src="@/assets/images/email-verification.svg" alt="Verified" class="profile__verification-icon">
                                <img v-else src="@/assets/images/email-verification-red.svg" alt="Verified" class="profile__verification-icon">
                                <span v-if="userStore.user?.is_verified" class="profile__verified-text">Вериф.</span>
                                <span v-else class="profile__verified-text-red">Не вериф.</span>
                            </div>
                            <div class="profile__personal-info-row flex flex-wrap gap-3 align-items-center">
                                <span class="profile__personal-info-label">Логін:</span>
                                <span>{{ userStore.user?.username }}</span>
                            </div>
                            <div class="profile__personal-info-row flex flex-wrap gap-3 align-items-center">
                                <span class="profile__game-accounts-label">Ігрові акаунти:</span>
                                <span>{{ userStore.user?.game_user.length }}</span>
                            </div>
                            <div class="profile__personal-info-row flex flex-wrap gap-3 align-items-center">
                                <span class="profile__personal-info-label">Номер телефону:</span>
                                <span v-if="userStore.user?.phone">{{ userStore.user?.phone }}</span>
                                <span v-else>Відсутній</span>
                                <img 
                                    src="@/assets/images/feather.svg" 
                                    alt="Edit" 
                                    class="profile__edit-icon cursor-pointer"
                                    @click="changePhoneRef.showDia(true, userStore.user?.phone)"
                                >
                            </div>
                        </div>
                    </div>
                    <button class="profile__change-password-btn profile__change-password-btn--mobile fantasy-btn small" @click="changePass">
                        <img src="@/assets/images/feather.svg" alt="Edit">
                        <span>Змінити пароль</span>
                    </button>
                </div>
                
                <!-- Блок РЕФЕРАЛЬНА ПРОГРАМА -->
                <div class="profile__referral">
                    <div class="profile__block-corner profile__block-corner--top-left"></div>
                    <div class="profile__block-corner profile__block-corner--top-right"></div>
                    <div class="profile__block-corner profile__block-corner--bottom-left"></div>
                    <div class="profile__block-corner profile__block-corner--bottom-right"></div>
                    
                    <h2 class="profile__block-title text-center">Реферальна програма</h2>
                    
                    <div v-if="userStore.user?.my_ref" class="profile__referral-content flex flex-column gap-4">
                        <div class="profile__referral-code-wrapper">
                            <p class="profile__referral-label">Ваш реферальний код:</p>
                            <div class="profile__referral-code-container">
                                <p class="profile__referral-code">{{ userStore.user?.my_ref }}</p>
                                <img @click="copyReferralCode(userStore.user?.my_ref)" src="@/assets/images/copy-icon.svg" alt="Copy" class="profile__copy-icon">
                            </div>
                        </div>
                        
                        <button class="profile__referral-list-btn fantasy-btn small" @click="allRefersModalRef.showDia()">
                            <img src="@/assets/images/ref-icon.svg" alt="Referrals">
                            <span>СПИСОК РЕФЕРАЛІВ</span>
                        </button>
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
            <h2 class="modal__title">Створення ігрового акаунту</h2>
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
    <AllRefersModal ref="allRefersModalRef"/>
</template>
<style scoped lang='scss'>
.profile {
    color: #fff;
    max-width: 1080px;

    &__container {
        padding: 0;
    }

    &__header {
        margin-bottom: 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 20px;
    }

    &__title {
        font-size: clamp(32px, 4vw, 64px);
        margin: 0;
    }

    &__exit-btn,
    &__promo-btn {
        margin-left: 15px;
    }

    &__left-block {
        @media (max-width: 767px) {
            flex-direction: column;
            gap: 15px;
        }
    }

    &__personal,
    &__referral {
        position: relative;
        padding: clamp(20px, 3vw, 30px);
        background: rgba(250, 250, 250, 0.05);
        border-radius: 5px;
        width: 100%;
    }

    &__personal {
        max-width: 717px;

        @media (max-width: 991px) {
            max-width: 100%;
        }
    }

    &__referral {
        max-width: 343px;

        @media (max-width: 991px) {
            max-width: 100%;
        }
    }

    &__block-corner {
        position: absolute;
        width: 10px;
        height: 10px;
        background-image: url('@/assets/images/profile-corner.svg');
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        z-index: 1;

        &--top-left {
            top: 0;
            left: 0;
            transform: rotate(0deg);
        }

        &--top-right {
            top: 0;
            right: 0;
            transform: rotate(90deg);
        }

        &--bottom-left {
            bottom: 0;
            left: 0;
            transform: rotate(-90deg);
        }

        &--bottom-right {
            bottom: 0;
            right: 0;
            transform: rotate(180deg);
        }
    }

    &__personal-header {
        margin-bottom: 20px;
        flex-wrap: wrap;
        gap: 15px;

        @media (max-width: 767px) {
            flex-direction: column;
            align-items: center;
            gap: 15px;
        }
    }

    &__block-title {
        font-size: clamp(16px, 2vw, 20px);
        margin: 0;
        color: #fff;
        font-weight: 400;
    }

    &__avatar-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    &__avatar {
        width: 150px;
        height: 150px;
        border-radius: 50%;
        background: rgba(93, 119, 144, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;

        @media (max-width: 767px) {
            width: 120px;
            height: 120px;
        }

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        &-placeholder {
            border-radius: 50%;
        }
    }

    &__avatar-upload {
        position: absolute;
        bottom: 13px;
        right: 13px;
        cursor: pointer;
        z-index: 2;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    &__personal-content {
        margin-bottom: 20px;

        @media (max-width: 767px) {
            flex-direction: column;
            align-items: center;
            gap: 20px;
        }
    }

    &__personal-info {
        flex: 1;
        font-size: 16px;
        font-family: "Candara", sans-serif;
        justify-content: space-evenly;

        @media (max-width: 767px) {
            width: 100%;
            align-items: center;
            font-size: 14px;
        }

        span {
            color: #fff;
        }
    }

    &__personal-info-row {
        @media (max-width: 767px) {
            justify-content: center;
            gap: 5px;
            width: 100%;
        }
    }

    &__game-accounts-label,
    &__personal-info-label {
        color: #f8f8f8;
        font-size: 16px;
        opacity: 0.5;
    }

    &__verification-icon {
        width: 20px;
        height: 20px;
    }

    &__verified-text {
        color: #AEE961 !important;
        font-size: 12px;

        &-red {
            color: #FF0000 !important;
        }
    }

    &__game-accounts {
        margin-left: 30px;
        color: #fff;

        @media (max-width: 767px) {
            margin-left: 0;
            margin-top: 5px;
            display: block;
            width: 100%;
            text-align: center;
        }
    }

    &__edit-icon {
        width: 20px;
        height: 20px;
        margin-left: 5px;
    }

    &__change-password-btn {
        margin: 0;

        &--mobile {
            display: none;
            width: 100%;
            justify-content: center;
            margin-top: 20px;
            max-width: 200px;
            margin: 0 auto;

            @media (max-width: 767px) {
                display: flex;
            }
        }

        &--desktop {
            @media (max-width: 767px) {
                display: none;
            }
        }
    }

    &__referral-content {
        align-items: center;
    }

    &__referral-code-wrapper {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 20px 0 0 0;
    }

    &__referral-label {
        color: #f8f8f8;
        font-size: 16px;
        margin: 0;
        opacity: 0.5;
    }

    &__referral-code-container {
        position: relative;
        display: flex;
        align-items: center;
        gap: 10px;
    }

    &__referral-code {
        font-weight: 400;
        font-size: 42px;
        line-height: 120%;
        letter-spacing: -0.04em;
        background: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    &__copy-icon {
        font-size: 20px;
        color: #FBD298;
        cursor: pointer;
        
        &:hover {
            color: #e26f0f;
        }
    }

    &__referral-list-btn {
        align-self: center;
        margin-top: 20px;
    }

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