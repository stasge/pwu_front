<script setup lang="ts">
</script>
<template>
    <div class="support-project">
        <div class="support-project__inner w-full">
            <div class="support-project__container">
                <h1 class="support-project__title">Підтримати проєкт</h1>
                <div class="support-project__text">
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
                    <h3 class="my-5">Обовʼязково впишіть логін ІГРОВОГО акаунту (використовується для входу в гру) у поле "Ім'я або коментар" та після переказу <a href="https://send.monobank.ua/jar/7ZWfXKh8N3" target="_blank" rel="noopener noreferrer">за цим посиланням</a>, <b> завантажте квитанцію в приватні повідомлення discord адміністратору - Roman</b>, щоб отримати бонус.</h3>
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
        color: #e26f0f;
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
}
</style>