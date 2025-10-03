<script setup lang="ts">
import { useToast } from 'vue-toastification';
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';

const toast = useToast()


const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
        toast.success('Cкопійовано в буфер обміну!');
    }).catch(err => {
        console.error('Помилка при копіюванні тексту:', err);
    });
};
</script>
<template>
    <Header />
    <div class="support-project">
        
        <div class="support-project__hero">
            <div class="support-project__hero-content">
                <h1 class="support-project__hero-title">Підтримати Проєкт</h1>
                <p class="support-project__hero-description">Наша команда розвиває сервер із любов’ю до гри та гравців. Якщо ти бажаєш підтримати наш проєкт — ти можеш зробити добровільний внесок.</p>
                <p class="support-project__hero-description">Усі зібрані кошти використовуються на <i>оплату хостингу, підтримку розробників, захист від атак та майбутні оновлення гри!</i></p>
                <div class="support-project__hero-bonus flex">
                    <img src="@/assets/images/support-project-divider.svg" alt="Divider" class="support-project__hero-divider-image">
                    <div class="support-project__hero-bonus-content text-center flex flex-column justify-content-center align-items-center gap-3 px-3 py-2 w-full">
                        <p class="support-project__hero-bonus-text">Як знак подяки за твою підтримку, ми нараховуємо внутрішньоігровий бонус:</p>
                        <div class="support-project__hero-bonus-details">
                            <div class="flex justify-content-center gap-2">
                                <h3 class="support-project__hero-bonus-title">золота монета </h3>
                                <img src="@/assets/images/gold-coin.png" alt="Gold Coin" class="support-project__hero-bonus-image">
                                <h3 class="support-project__hero-bonus-amount">x1</h3>
                            </div>
                            <h3 class="support-project__hero-bonus-description">за кожні <span class="highlight">3 грн*</span> внеску.</h3>
                        </div>
                    </div>
                    <img src="@/assets/images/support-project-divider.svg" alt="Divider" class="support-project__hero-divider-image">
                </div>
            </div>
            <img src="@/assets/images/support-project-img.jpg" alt="Support Project" class="support-project__hero-image">
        </div>

        <div class="support-project__warning">
            <h2 class="support-project__warning-title">Реквізити для Оплати</h2>
            <div class="support-project__warning-content">
                <img src="@/assets/images/warning.svg" alt="Warning" class="support-project__warning-icon">
                <p class="support-project__warning-text">Це не продаж ігрових цінностей, а вдячність за допомогу, яку ми щиро цінуємо 🙏</p>
                <img src="@/assets/images/warning.svg" alt="Warning" class="support-project__warning-icon">
            </div>
        </div>

        <div class="support-project__payment">
            <div class="support-project__payment-requisites">
                <div class="support-project__payment-item">
                    <span class="support-project__payment-label">Найменування отримувача:</span>
                    <div class="support-project__payment-value-container">
                        <span class="support-project__payment-value">ФОП ГИЧАК ОЛЬГА ВОЛОДИМИРІВНА</span>
                        <img src="@/assets/images/copy-icon.svg" alt="Copy" class="support-project__payment-copy" @click="copyToClipboard('ФОП ГИЧАК ОЛЬГА ВОЛОДИМИРІВНА')">
                    </div>
                </div>
                
                <div class="support-project__payment-item">
                    <span class="support-project__payment-label">Рахунок отримувача (IBAN):</span>
                    <div class="support-project__payment-value-container">
                        <span class="support-project__payment-value">UA153052990000026006024927081</span>
                        <img src="@/assets/images/copy-icon.svg" alt="Copy" class="support-project__payment-copy" @click="copyToClipboard('UA153052990000026006024927081')">
                    </div>
                </div>
                
                <div class="support-project__payment-item support-project__payment-item--inline">
                    <div class="support-project__payment-item-half">
                        <span class="support-project__payment-label">Код отримувача:</span>
                        <div class="support-project__payment-value-container">
                            <span class="support-project__payment-value">3356210484</span>
                            <img src="@/assets/images/copy-icon.svg" alt="Copy" class="support-project__payment-copy" @click="copyToClipboard('3356210484')">
                        </div>
                    </div>
                    <div class="support-project__payment-item-half">
                        <span class="support-project__payment-label">Назва банку:</span>
                        <div class="support-project__payment-value-container">
                            <span class="support-project__payment-value">АТ КБ "ПРИВАТБАНК"</span>
                            <img src="@/assets/images/copy-icon.svg" alt="Copy" class="support-project__payment-copy" @click="copyToClipboard('АТ КБ &quot;ПРИВАТБАНК&quot;')">
                        </div>
                    </div>
                </div>
                
                <div class="support-project__payment-item">
                    <span class="support-project__payment-label">Призначення платежу:</span>
                    <div class="support-project__payment-value-container">
                        <span class="support-project__payment-value">"НА РОЗВИТОК СЕРВЕРУ"</span>
                        <img src="@/assets/images/copy-icon.svg" alt="Copy" class="support-project__payment-copy" @click="copyToClipboard('&quot;НА РОЗВИТОК СЕРВЕРУ&quot;')">
                    </div>
                </div>
            </div>
            
            <div class="support-project__payment-qr">
                <img src="@/assets/images/privat-qr-code.png" alt="QR Code" class="support-project__payment-qr-image">
            </div>
            
            <div class="support-project__payment-instructions">
                <h4 class="support-project__payment-instructions-title">УВАГА!</h4>
                <p class="support-project__payment-instructions-text">
                    Обов'язково завантажте <i>Квитанцію</i> та <i>Логін ІГРОВОГО Акаунту</i> (використовується для входу в гру) в приватні повідомлення discord — Oleksandr (volvan_007), щоб отримати бонус.
                </p>
                <p class="support-project__payment-instructions-link">
                    Посилання на нього можна знайти тут: 
                    <br>
                    <a href="https://discord.com/channels/1182237382695714857/1372646945889325177" target="_blank" class="support-project__payment-discord-link">OLEKSANDR (VOLVAN_007)</a>
                </p>
            </div>
        </div>

        
    </div>
    <Footer />
</template>

<style scoped lang="scss">
.support-project {
    width: 100%;
    min-height: 60vh;
    color: #fff;
    padding: 0 20px;
    padding-top: clamp(30px, 2vw, 100px);

    @media (max-width: 768px) {
        padding-top: 0;
    }

    &__hero {
        display: flex;
        position: relative;
        max-width: 1110px;
        margin: 0 auto 40px;
        width: 100%;

        @media (max-width: 768px) {
            flex-direction: column-reverse;
            align-items: center;
            text-align: center;
        }

        &-image {
            width: 100%;
            height: auto;
            display: block;
            max-width: 961px;
            margin-left: auto;

            @media (max-width: 768px) {
                position: relative;
                top: -50px;
            }
        }

        &-content {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            max-width: 420px;

            @media (max-width: 768px) {
                position: relative;
                transform: none;
                max-width: 100%;
                top: -20px;
            }
        }

        &-title {
            font-weight: 400;
            font-size: clamp(30px, 3vw, 40px);
            line-height: 100%;
            letter-spacing: -0.07em;
            text-align: center;
            background: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: clamp(12px, 5vw, 50px);
        }

        &-description {
            font-family: "Candara", sans-serif;
            font-weight: 400;
            font-size: clamp(12px, 2vw, 16px);
            line-height: 150%;
            text-align: center;
            color: #f8f8f8;
            margin-bottom: clamp(12px, 2vw, 30px);
        }

        &-bonus {
            

            &-content {
                font-family: "Candara", sans-serif;
            }

            &-details {
                font-weight: 400;
                font-size: clamp(18px, 2vw, 32px);
                line-height: 100%;
                letter-spacing: -0.05em;
                background: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%);
                background-clip: text;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                text-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.5);
                font-family: "VollkornSC", sans-serif;
            }

            &-image {
                width: clamp(22px, 2vw, 32px);
                height: clamp(22px, 2vw, 32px);
            }
            
            &-text {
                font-weight: 400;
                font-size: clamp(14px, 2vw, 18px);
                text-align: center;
                color: #f8f8f8;
            }


            &-description {
                font-weight: 400;
                font-size: clamp(14px, 2vw, 24px);
            }

            .highlight {
                
                font-size: clamp(18px, 2vw, 32px);
            }
        }
    }

    &__warning {
        max-width: 727px;
        margin: 0 auto 40px;
        text-align: center;

        &-title {
            font-weight: 400;
            font-size: clamp(30px, 3vw, 40px);
            line-height: 100%;
            letter-spacing: -0.07em;
            text-align: center;
            background: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: clamp(12px, 5vw, 50px);
        }

        &-content {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            flex-wrap: wrap;

            @media (max-width: 768px) {
                gap: 8px;
            }
        }

        &-icon {
            width: 24px;
            height: 24px;
            flex-shrink: 0;

            @media (max-width: 768px) {
                width: 20px;
                height: 20px;
            }
        }

        &-text {
            font-family: "Candara", sans-serif;
            font-weight: 400;
            font-size: clamp(12px, 2vw, 18px);
            line-height: 170%;
            letter-spacing: -0.01em;
            color: #f8f8f8;
            margin: 0;
            flex: 1;
            min-width: 0;

            @media (max-width: 768px) {
                font-size: 16px;
            }
        }
    }

    &__payment {
        max-width: 1205px;
        margin: clamp(20px, 5vw, 100px) auto clamp(20px, 5vw, 50px);
        display: flex;
        gap: clamp(5px, 5vw, 20px);

        @media (max-width: 1024px) {
            flex-wrap: wrap;
            gap: 30px;
        }

        &-requisites {
            display: flex;
            flex-direction: column;
            gap: clamp(5px, 1vw, 20px);
            width: 100%;

            @media (max-width: 1024px) {
                flex: 1;
            }
        }

        &-item {
            display: flex;
            flex-direction: column;
            gap: 8px;

            &--inline {
                flex-direction: row;
                gap: 20px;

                @media (max-width: 768px) {
                    flex-direction: column;
                    gap: 8px;
                }
            }
        }

        &-item-half {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        &-label {
            font-family: "Candara", sans-serif;
            font-weight: 400;
            font-size: clamp(12px, 2vw, 16px);
            line-height: 190%;
            letter-spacing: -0.01em;
            color: #f8f8f8;
        }

        &-value-container {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        &-value {
            font-weight: 400;
            font-size: clamp(14px, 1vw, 20px);
            line-height: 120%;
            letter-spacing: -0.04em;
            background: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        &-copy {
            width: clamp(16px, 2vw, 20px);
            height: clamp(16px, 2vw, 20px);
            cursor: pointer;
            transition: opacity 0.2s ease;
            flex-shrink: 0;
            transition: all 0.2s ease;

            &:hover {
                opacity: 0.7;
            }

            &:active {
                transform: scale(0.9);
            }
        }

        &-qr {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            width: 100%;

            @media (max-width: 1024px) {
                flex: 1;
            }
        }

        &-qr-image {
           width: clamp(200px, 14vw, 251px);

           @media (max-width: 1024px) {
                width: 251px;
           }
        }

        &-instructions {
            display: flex;
            flex-direction: column;
            gap: clamp(10px, 2vw, 30px);
            text-align: left;
            max-width: 100%;
            width: 100%;

            @media (max-width: 1024px) {
                margin-top: 20px;
            }
        }

        &-instructions-title {
            font-weight: 400;
            font-size: clamp(24px, 2vw, 40px);
            line-height: 100%;
            letter-spacing: -0.07em;
            background: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        &-instructions-text {
            font-family: "Candara", sans-serif;
            font-weight: 400;
            font-size: clamp(12px, 1vw, 18px);
            line-height: 170%;
            letter-spacing: -0.01em;
            color: #f8f8f8;
        }

        &-instructions-link {
            font-family: "Candara", sans-serif;
            font-weight: 400;
            font-size: clamp(14px, 1vw, 20px);
            line-height: 150%;
            color: #f8f8f8;
            margin: 0;
        }

        &-discord-link {
            color: #fadfae;
            text-decoration: underline;
            transition: color 0.2s ease;

            &:hover {
                color: #fbd298;
            }
        }
    }

    
}
</style>