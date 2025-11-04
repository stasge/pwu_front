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
                            <span>Список рефералів</span>
                        </button>
                    </div>
                </div>
            </div>
            <div class="profile__right">
                <div class="profile__block-corner profile__block-corner--top-left"></div>
                <div class="profile__block-corner profile__block-corner--top-right"></div>
                <div class="profile__block-corner profile__block-corner--bottom-left"></div>
                <div class="profile__block-corner profile__block-corner--bottom-right"></div>
                
                <div class="profile__right-header flex justify-content-between align-items-center mb-4">
                    <h2 class="profile__right-title text-center md:text-left flex-grow-1">Ігрові акаунти</h2>
                    <button class="fantasy-btn small profile__create-btn profile__create-btn--desktop" @click="show()">
                        <img src="@/assets/images/Plus.svg" alt="Plus">
                        <span>Створити</span>
                    </button>
                </div>
                <div v-if="!userStore.user?.game_user.length" class="profile__empty-state flex flex-column align-items-center justify-content-center">
                    <p>У вас ще немає жодного ігрового акаунту</p>
                </div>
                <div v-else class="profile__game-accounts-table">
                    <div class="game-acc__header">
                        <p>№</p>
                        <p>Логін</p>
                        <p>Дата створення</p>
                        <p>Дата видалення</p>
                        <p>Дія</p>
                    </div>
                    <div class="game-acc__wrapper">
                        <div v-for="(user, index) of userStore.user.game_user" :key="user.id" class="game-acc__item" :style="{ background: index % 2 === 0 ? 'rgba(0, 0, 0, 0.4)' : 'transparent' }">
                            <p data-label="№">{{ index + 1 }}</p>
                            <p data-label="Логін:">{{ user.username }}</p>
                            <p data-label="Дата створення:">{{ format(user.created_at, 'dd/MM/yyyy') }}</p>
                            <p data-label="Час до видалення:">{{ user.deletion_date ? calculateTimeLeft(user.deletion_date) : '-' }}</p>
                            <div class="game-acc__actions flex gap-2">
                                <button class="game-acc__change-password-btn" @click="changeGameAccPassRef.showDia(user.id)">
                                    <img width="20" height="20" src="@/assets/images/feather.svg" alt="Edit">
                                    <span>Змінити пароль</span>
                                </button>
                                <button v-if="!user.is_deleted" class="game-acc__delete-btn" @click="deleteGameAcc(user.id)">
                                    <img src="@/assets/images/Boom.svg" alt="Trash">
                                    <span>Видалити</span>
                                </button>
                                <button v-else class="game-acc__cancel-delete-btn" @click="recoverGameAcc(user.id)">
                                    <span>Не видаляти</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <button class="fantasy-btn small profile__create-btn profile__create-btn--mobile" @click="show()">
                    <img src="@/assets/images/Plus.svg" alt="Plus">
                    <span>Створити</span>
                </button>
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

    &__right {
        position: relative;
        padding: clamp(10px, 3vw, 30px);
        background: rgba(250, 250, 250, 0.05);
        border-radius: 5px;
        width: 100%;
    }

    &__right-header {
        margin-bottom: 20px;
        flex-wrap: wrap;
        gap: 15px;
    }

    &__right-title {
        font-size: 24px;
        margin: 0;
        color: #fff;
        font-weight: 400;
    }

    &__empty-state {
        padding: 20px;
        text-align: center;

        p {
            font-size: 18px;
            color: rgba(255, 255, 255, 0.7);
            margin: 0;
            text-align: center;
        }
    }

    &__game-accounts-table {
        width: 100%;
    }

    &__create-btn {
        &--desktop {
            @media (max-width: 767px) {
                display: none;
            }
        }

        &--mobile {
            display: none;
            justify-content: center;
            margin-top: 20px !important;
            margin: 0 auto;
            width: 210px;

            @media (max-width: 767px) {
                display: flex;
            }
        }
    }
}

.game-acc {

    &__wrapper {
        display: flex;
        flex-direction: column;
        margin-top: 20px;
    }

    &__header {
        display: grid;
        grid-template-columns: 5% 20% 20% 20% 30%;
        align-items: end;

        p {
            font-size: 16px;
            color: rgba(255, 255, 255, 0.7);
            margin: 0;
            text-align: center;
        }
    }
    
    &__item {
        display: grid;
        grid-template-columns: 5% 20% 20% 20% 30%;
        padding: 15px;
        background: transparent;
        border-radius: 10px;
        align-items: center;

        p {
            margin: 0;
            text-align: center;
            color: #fff;
            font-size: 14px;
        }
    }

    &__actions {
        display: flex;
        gap: 20px !important;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;

        @media (max-width: 767px) {
            width: 100%;
            justify-content: space-between;
        }
    }

    &__change-password-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        font-family: "VollkornSC", sans-serif;
        border: none;
        background: none;
        font-weight: 400;
        font-size: 16px;
        letter-spacing: -0.09em;
        text-align: center;
        background: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        cursor: pointer;
        transition: opacity 0.2s ease;

        &:hover {
            opacity: 0.7;
        }

        &:active {
            opacity: 0.6;
        }
    }

    &__delete-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        font-family: "VollkornSC", sans-serif;
        border: none;
        background: none;
        font-weight: 400;
        font-size: 16px;
        letter-spacing: -0.09em;
        text-align: center;
        background: linear-gradient(180deg, #f69090 30%, #97292a 100%);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        cursor: pointer;
        transition: opacity 0.2s ease;

        &:hover {
            opacity: 0.7;
        }

        &:active {
            opacity: 0.6;
        }
    }

    &__cancel-delete-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        font-family: "VollkornSC", sans-serif;
        border: none;
        border-bottom: 1px solid #929292;
        background: none;
        font-weight: 400;
        font-size: 16px;
        line-height: 100%;
        letter-spacing: -0.09em;
        text-decoration: underline;
        text-decoration-skip-ink: none;
        background: linear-gradient(180deg, #f8f8f8 0%, #929292 100%);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        cursor: pointer;
        transition: opacity 0.2s ease;

        &:hover {
            opacity: 0.7;
        }

        &:active {
            opacity: 0.6;
        }
    }

    @media (max-width: 767px) {
        &__header {
            display: none;
        }

        &__item {
            display: flex;
            flex-direction: column;
            gap: 10px;
            align-items: flex-start;

            p {
                display: flex;
                gap: 10px;
                justify-content: space-between;
                width: 100%;
                
                &::before {
                    content: attr(data-label);
                    text-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.25);
                    opacity: 0.3;
                    color: #f8f8f8;
                }
            }
        }

    }

}
::-webkit-scrollbar {
   width: 6px;
}

/* Track */
::-webkit-scrollbar-track {
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.4);
}

/* Handle */
::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background: #fadfae;
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