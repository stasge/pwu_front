<script setup lang="ts">
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
import RegisterModal from '@/components/modals/register.vue';
import { ref } from 'vue';

const registerModal = ref()

const handleDownload = () => {
    // Тут має бути посилання на завантаження
    window.open('https://valor.in.ua/files/VALOR_2.iso', '_blank');
}

const handleRegister = () => {
    registerModal.value?.showDia()
}
</script>
<template>
    <Header />
  <div class="download-page">
      <div class="download-page__inner">
        <div class="download-page__hero">
            <h1 class="download-page__hero-title">Завантаження <br>Клієнта</h1>
            <div class="download-page__hero-buttons">
                <button class="fantasy-btn" @click="handleDownload"><span>Завантажити</span></button>
            </div>
            <img src="@/assets/images/CTA-mask.png" class="download-page__hero-mask" alt="download page mask">
        </div>   
        <div class="download-page__instructions">
            <h1 class="download-page__instructions-title">Інструкції <br>з Встановлення</h1>
            
            <div class="download-page__instruction">
                <img src="@/assets/images/download-divider.svg" class="download-page__divider" alt="divider">
                <div class="download-page__instruction-content">
                    <h3 class="download-page__instruction-text">1. Після завантаження знайдіть файл VALOR_2.iso на вашому комп’ютері.</h3>
                    <div class="download-page__instruction-image">
                        <img src="@/assets/images/download-i-1.png" alt="instruction 1">
                    </div>
                </div>
                <img src="@/assets/images/download-divider.svg" class="download-page__divider" alt="divider">
            </div>

            <div class="download-page__instruction">
                <div class="download-page__instruction-content">
                    <h3 class="download-page__instruction-text">2. Натисніть на файл правою кнопкою миші та оберіть «Підключити» (Mount).</h3>
                    <div class="download-page__instruction-image">
                        <img src="@/assets/images/download-i-2.png" alt="instruction 2">
                    </div>
                </div>
            </div>

            <div class="download-page__instruction">
                <img src="@/assets/images/download-divider.svg" class="download-page__divider" alt="divider">
                <div class="download-page__instruction-content">
                    <h3 class="download-page__instruction-text">3. Після підключення ISO-файлу у «Цей комп’ютер» з’явиться віртуальний диск — відкрийте його (або він відкриється автоматично).</h3>
                </div>
                <img src="@/assets/images/download-divider.svg" class="download-page__divider" alt="divider">
            </div>

            <div class="download-page__instruction">
                <div class="download-page__instruction-content">
                    <h3 class="download-page__instruction-text">4. Запустіть файл VALOR_2.exe.</h3>
                    <div class="download-page__instruction-image">
                        <img src="@/assets/images/download-i-3.png" alt="instruction 3">
                    </div>
                </div>
            </div>

            <div class="download-page__instruction">
                <div class="download-page__instruction-content">
                    <h3 class="download-page__instruction-text">Якщо при запуску гри з'являється синє вікно з повідомленням "ОС Windows захистила цей ПК", це стандартне попередження від SmartScreen — воно з'являється при запуску файлів від невідомих видавців.</h3>
                    <div class="download-page__instruction-image">
                        <img src="@/assets/images/download-i-4.png" alt="instruction 4">
                    </div>
                </div>
            </div>

            <div class="download-page__instruction">
                <div class="download-page__instruction-content">
                    <h3 class="download-page__instruction-text">Якщо у вас Windows 11, ось інструкція, як додати папку з грою в виключення, бо вбудований захист Windows (аналог антивірусу) може блокувати гру.</h3>
                    <div class="download-page__instruction-text">
                        <strong>Як додати папку в виключення Захисника Windows (Windows Defender):</strong>
                        <ol class="download-page__steps-list">
                            <li>Відкрийте Параметри (натисніть Win + I).</li>
                            <li>Перейдіть у розділ Конфіденційність і безпека → Безпека Windows.</li>
                            <li>Натисніть Відкрити безпеку Windows.</li>
                            <li>Виберіть Захист від вірусів та загроз.</li>
                            <li>Прокрутіть вниз і натисніть Керування налаштуваннями (у розділі «Параметри захисту від вірусів та загроз»).</li>
                            <li>Прокрутіть до блоку Виключення і натисніть Додати або видалити виключення.</li>
                            <li>Натисніть Додати виключення → виберіть Папка.</li>
                            <li>Знайдіть і виберіть папку з грою, щоб додати її до виключень</li>
                        </ol>
                    </div>
                </div>
            </div>
            <div class="download-page__instruction">
                <div class="download-page__instruction-content">
                    <img src="@/assets/images/download-divider.svg" class="download-page__divider" alt="divider">
                    <h3 class="download-page__instruction-text">5. Встановіть програму у зручне для вас місце.</h3>
                    <div class="download-page__instruction-image">
                        <img src="@/assets/images/download-i-5.png" alt="instruction 4">
                    </div>
                    <div class="download-page__instruction-image">
                        <img src="@/assets/images/download-i-6.png" alt="instruction 4">
                    </div>
                    <div class="download-page__instruction-image">
                        <img src="@/assets/images/download-i-7.png" alt="instruction 4">
                    </div>
                    <div class="download-page__instruction-image">
                        <img src="@/assets/images/download-i-8.png" alt="instruction 4">
                    </div>
                </div>
                <img src="@/assets/images/download-divider.svg" class="download-page__divider" alt="divider">
            </div>

            <div class="download-page__instruction">
                <div class="download-page__instruction-content">
                    <h3 class="download-page__instruction-text">6. Вхід у лаунчер</h3>
                    <ul class="download-page__steps-list pl-5 w-full">
                        <li>Запустіть лаунчер Valor 2.0.</li>
                        <li>У полі «Логін або email» введіть дані від Особистого кабінету на сайті Valor.</li>
                        <li>У полі «Пароль» введіть пароль від Особистого кабінету на сайті Valor.</li>
                        <li>Натисніть кнопку «Увійти».</li>
                    </ul>
                    <div class="download-page__instruction-image">
                        <img src="@/assets/images/download-i-9.png" alt="instruction 4">
                    </div>
                    <ul class="download-page__steps-list pl-5 w-full">
                        <li>Після входу натисніть на Особистий кабінет у правому верхньому куті.</li>
                    </ul>
                    <div class="download-page__instruction-image w-full">
                        <img src="@/assets/images/download-i-10.png" alt="instruction 4">
                    </div>
                    <ul class="download-page__steps-list w-full pl-5">
                        <li>У меню, що відкриється, з’явиться список ваших ігрових акаунтів.</li>
                        <li>Відмітьте галочками ті акаунти, які потрібно запустити.</li>
                    </ul>
                    <div class="download-page__instruction-image">
                        <img src="@/assets/images/download-i-11.png" alt="instruction 4">
                    </div>
                    <ul class="download-page__steps-list w-full pl-5">
                        <li>Натисніть кнопку «Почати гру».</li>
                    </ul>
                    <div class="download-page__instruction-image">
                        <img src="@/assets/images/download-i-12.png" alt="instruction 4">
                    </div>
                </div>
                <img src="@/assets/images/download-divider.svg" class="download-page__divider" alt="divider">
            </div>

            <div class="download-page__instruction">
                <div class="download-page__instruction-content">
                    <h3 class="download-page__instruction-text">6. Також не забудьте заздалегідь зареєструвати свій акаунт.</h3>
                    <p>Для реєстрації на сайті натисніть кнопку знизу:</p>
                    <button class="fantasy-btn" @click="handleRegister"><span>Реєстрація</span></button>
                </div>
                <img src="@/assets/images/download-divider.svg" class="download-page__divider" alt="divider">
            </div>

            <div class="download-page__instruction">
                <div class="download-page__instruction-content">
                    <h3 class="download-page__instruction-text">7. І створити ігровий акаунт у особистому кабінеті, логін і пароль якого буде використовуватися для авторизації в грі.</h3>
                    <div class="download-page__instruction-image">
                        <img src="@/assets/images/download-i-13.png" alt="instruction 4">
                    </div>
                </div>
            </div>
            
        </div>       
         <div class="download-page__hero bottom">
             <img src="@/assets/images/CTA-mask.png" class="download-page__hero-mask-top" alt="download page mask top">
             <h1 class="download-page__hero-title">Завантаження <br>Клієнта</h1>
            <div class="download-page__hero-buttons">
                <button class="fantasy-btn" @click="handleDownload"><span>Завантажити</span></button>
            </div>
             <img src="@/assets/images/CTA-mask.png" class="download-page__hero-mask" alt="download page mask">
        </div>          
    </div>
</div>
<Footer />
<RegisterModal ref="registerModal" />
  </template>
<style scoped lang="scss">
.download-page {
    &__inner {
        width: 100%;
    }

    &__hero {
        position: relative;
        width: 100%;
        min-height: 600px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: url('@/assets/images/download-main.jpg') no-repeat center / cover;
        overflow: hidden;

        @media (max-width: 768px) {
            min-height: 400px;
        }
    }

    &__hero-title {
        font-weight: 400;
        font-size: 52px;
        line-height: 100%;
        letter-spacing: -0.07em;
        text-align: center;
        color: #f8f8f8;
        margin-bottom: 30px;

        @media (max-width: 768px) {
            font-size: 36px;
            margin-bottom: 10px;
        }
    }

    &__instructions {
        color: #f8f8f8;
        padding: 80px 20px;
        background: #0a0a0a;
        max-width: 640px;
        margin: 0 auto;

        @media (max-width: 768px) {
            padding: 40px 20px;
        }
        
        &-title {
            font-weight: 400;
            font-size: 52px;
            line-height: 100%;
            letter-spacing: -0.07em;
            text-align: center;
            color: #f8f8f8;
            margin-bottom: 60px;

            @media (max-width: 768px) {
                font-size: 36px;
                margin-bottom: 40px;
            }
        }
    }

    &__instruction {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 30px;
        margin-bottom: 30px;
        width: 100%;

        &:last-child {
            margin-bottom: 0;
        }
    }

    &__divider {
        width: 100%;
        max-width: 600px;
        height: auto;
    }

    &__instruction-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 30px;
        width: 100%;
        max-width: 800px;
    }

    &__instruction-text {
        font-family: "Candara", sans-serif;
        font-weight: 400;
        font-size: 24px;
        line-height: 130%;
        letter-spacing: -0.03em;
        color: #f8f8f8;
        margin: 0;
        width: 100%;

        @media (max-width: 768px) {
            font-size: 20px;
        }
    }

    &__instruction-image {
        width: 100%;
        max-width: 600px;
        
        img {
            width: 100%;
            height: auto;
            border-radius: 8px;
        }
    }

    &__steps-list {
        margin: 20px 0;
        padding-left: 20px;
        color: #f8f8f8;
        font-family: "Candara", sans-serif;
        font-weight: 400;
        font-size: 20px;
        line-height: 140%;
        letter-spacing: -0.03em;

        @media (max-width: 768px) {
            font-size: 18px;
            padding-left: 15px;
        }

        li {
            margin-bottom: 10px;
            
            &:last-child {
                margin-bottom: 0;
            }
        }
    }

    &__hero-buttons {
        position: relative;
        z-index: 5;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 10px 50px;

        @media (max-width: 768px) {
            flex-direction: column;
            gap: 15px;
        }
    }

    &__hero-button {
        /* Використовуємо клас fantasy-btn для стилізації */
        border: none;
        background: transparent;
    }

    &__hero-mask {
        transform: rotate(180deg);
        position: absolute;
        bottom: -1px;
        left: -1px;
        width: 100%;
        height: clamp(76px, 10vw, 197px);
        z-index: 3;
    }

    &__hero-mask-top {
        position: absolute;
        top: -1px;
        left: -1px;
        width: 100%;
        height: clamp(76px, 10vw, 197px);
        z-index: 3;
    }

    &.bottom {
        margin-top: 0;
    }
}
</style>