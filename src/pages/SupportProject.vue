<script setup lang="ts">
import { useToast } from 'vue-toastification';

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
    <div class="support-project">
        <div class="support-project__inner w-full">
            <div class="support-project__container">
                <h1 class="support-project__title">Підтримати проєкт</h1>
                <div class="support-project__text text">
                    <p>Наша команда розвиває сервер із любов’ю до гри та гравців. Якщо ти бажаєш підтримати наш проєкт — ти можеш зробити добровільний внесок.</p>
                    <p>💛 Усі зібрані кошти використовуються на:</p>
                    <ul>
                        <li>оплату хостингу;</li>
                        <li>захист від атак;</li>
                        <li>підтримку розробників;</li>
                        <li>майбутні оновлення гри.</li>
                    </ul>
                    <p>✨ Як знак подяки за твою підтримку, ми нараховуємо внутрішньоігровий бонус:</p>
                    <p><b>1 золота монета за кожні 3 грн внеску.</b></p>
                    <p class="mt-2"><b>Мінімальна сума для нарахування бонусу — 10 грн (через обмеження банку).</b></p>
                    <h2>Реквізити для оплати</h2>
                    <div class="text__requisites">
                        <p class="flex flex-wrap">
                            <span><b class="mr-3">Найменування отримувача: </b></span>
                            <span>ФОП Гичак Ольга Володимирівна</span>
                        </p>
                        <p class="flex flex-wrap">
                            <span><b class="mr-3">Код отримувача: </b></span>
                            <span>
                                3356210484
                                <i
                                    class="pi pi-copy text-xl cursor-pointer"
                                    v-tooltip.top="'Копіювати'"
                                    @click="copyToClipboard('3356210484')"
                                ></i>
                            </span>
                        </p>
                        <p class="flex flex-wrap">
                            <span><b class="mr-3">Рахунок отримувача: </b></span>
                            <span>
                                UA153052990000026006024927081
                                <i
                                    @click="copyToClipboard('UA153052990000026006024927081')"
                                    class="pi pi-copy text-xl cursor-pointer"
                                    v-tooltip.top="'Копіювати'"
                                ></i>
                            </span>
                        </p>
                        <p class="flex flex-wrap">
                            <span><b class="mr-3">Призначення платежу: </b></span>
                            <span>"на розвиток серверу"</span>
                        </p>
                        <p class="flex flex-wrap">
                            <span><b class="mr-3">Назва банку: </b></span>
                            <span>АТ КБ "ПРИВАТБАНК"</span>
                        </p>
                    </div>
                    <h3 class="my-2">УВАГА! Обовʼязково <b> завантажте квитанцію та логін ІГРОВОГО акаунту (використовується для входу в гру) в приватні повідомлення discord адміністратору - Roman(romanhrytsiuk)</b>, щоб отримати бонус.</h3>
                    <img class="block" src="@/assets/images/qr-bank.png" alt="" width="300">
                    <p>Це не продаж ігрових цінностей, а вдячність за допомогу, яку ми щиро цінуємо 🙏</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.support-project {
    width: 100%;
    min-height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    padding: 0 20px;

    &__inner {
        margin: 0 auto;
        background: rgba(93, 119, 144, 0.1);
        border-radius: 20px;
        padding: 14px;
        box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }
    &__title {
        text-align: center;
        font-size: 2rem;
        font-weight: bold;
        margin-bottom: 24px;
        color: #fff;
    }
    
    &__text {
        font-size: 1.1rem;
        line-height: 1.7;

        ul {
            margin: 12px 0 12px 24px;
            list-style: disc;
        }
        b {
            color: #e26f0f;
        }
        a {
            color: #e26f0f;
            text-decoration: underline;
        }
    }

    .text__requisites {
        padding: 10px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        font-size: 1rem;

        p {
            display: flex;
            align-items: center;

            i {
                margin-left: 8px;
                cursor: pointer;
                color: #e26f0f;
            }
        }

    }
    img {
        margin: 0 auto;
    }
}
</style>