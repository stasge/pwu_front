<script setup lang="ts">
import ClanBonusHero from '@/components/clan-bonus/ClanBonusHero.vue';
import ClanBonusNote from '@/components/clan-bonus/ClanBonusNote.vue';
import heroImage from '@/assets/images/clan-bonus/cashback.jpg';
import coinIcon from '@/assets/images/clan-bonus/coin.svg';
import uahIcon from '@/assets/images/clan-bonus/coin-2.svg';
import goldIcon from '@/assets/images/clan-bonus/gold.svg';
import bagIcon from '@/assets/images/clan-bonus/bag.svg';

const tiers = [
    { percent: '10%', text: 'Кланам, у яких є щонайменше 30 гравців 70+ рівня' },
    { percent: '15%', text: 'кланам, які володіють хоча б однією територією' },
    { percent: '20%', text: 'кланам, які володіють трьома або більше територіями' },
    { percent: '30%', text: 'клану, який завоював та утримує більшу частину карти - 23 території і більше' },
]

const payoutOptions = [
    { icon: uahIcon, text: 'У гривнях' },
    { icon: goldIcon, text: 'У голді — у такому разі до суми голди додається ще +20% бонусом' },
    { icon: bagIcon, text: 'Або частково гривнями та частково голдою' },
]
</script>

<template>
    <div class="clan-panel">
        <ClanBonusHero :image="heroImage" :icon="coinIcon" title="Клановий" accent="Кешбек - до 30%">
            Вводимо нову бонусну систему для кланів - кешбек від усіх донатів учасників клану,
            який щомісяця нараховуватиметься Майстру клану.
        </ClanBonusHero>

        <section class="clan-section">
            <h3 class="clan-heading">Розмір кешбеку залежатиме від розвитку та успіхів клану:</h3>
            <ul class="tiers">
                <li v-for="tier in tiers" :key="tier.percent" class="tiers__item">
                    <span class="tiers__percent gold-text">{{ tier.percent }}</span>
                    <span class="clan-text tiers__text">{{ tier.text }}</span>
                </li>
            </ul>
        </section>

        <section class="clan-section">
            <ClanBonusNote>
                <h3 class="clan-heading">Майстер клану сам обирає варіант отримання кешбеку:</h3>
                <ul class="payouts">
                    <li v-for="option in payoutOptions" :key="option.text" class="payouts__item">
                        <span class="payouts__icon"><img :src="option.icon" alt=""></span>
                        <span class="clan-text">{{ option.text }}</span>
                    </li>
                </ul>
            </ClanBonusNote>
        </section>

        <section class="clan-section">
            <h3 class="clan-heading clan-heading--sm">Як зарахувати свій донат до кешбеку клану?</h3>
            <div class="clan-section__body">
                <p class="clan-text">
                    Все просто: під час надсилання квитанції та ігрового логіна додатково напишіть Олександру
                    назву свого клану.
                </p>
                <p class="clan-text">
                    Після цього ваш донат буде врахований при розрахунку місячного бонусу клану.
                </p>
            </div>
        </section>

        <section class="clan-section">
            <h3 class="clan-heading clan-heading--sm">Щодо автоматизації</h3>
            <div class="clan-section__body">
                <p class="clan-text">
                    Одразу відповідаємо на питання щодо автоматизації донатів та нарахування кланових бонусів -
                    це вже є в наших планах.
                </p>
                <p class="clan-text">
                    Але реалізація повноцінної автоматичної системи потребує трохи більше часу, а ми хочемо, щоб вже з 1 жовтня почався облік донатів для нарахування бонусу.
                </p>
                <p class="clan-text">
                    Тобто всі донати учасників клану, здійснені починаючи з 1 жовтня, вже враховуватимуться при розрахунку бонусу, а перше нарахування за жовтень відбудеться 1 листопада.
                </p>
                <p class="clan-text">
                    Тому перший час облік донатів та нарахування кешбеку відбуватиметься в ручному режимі.
                </p>
            </div>
        </section>

        <section class="clan-section">
            <p class="clan-outro gold-text">
                Розвивайте клан, захоплюйте території та отримуйте більше бонусів за підтримку проєкту!
            </p>
        </section>
    </div>
</template>

<style scoped lang="scss">
@use './clan-bonus';

.clan-section__body {
    margin-top: 20px;
}

.tiers {
    list-style: none;
    margin-top: 24px;
    display: flex;
    flex-direction: column;
    gap: 22px;

    &__item {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    &__percent {
        flex-shrink: 0;
        width: 80px;
        font-family: "VollkornSC", sans-serif;
        font-size: 44px;
        line-height: 1;
        letter-spacing: -0.05em;

        @media (max-width: 768px) {
            width: 70px;
            font-size: 40px;
        }
    }

    &__text {
        max-width: 270px;
    }
}

.payouts {
    list-style: none;
    margin-top: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;

    &__item {
        display: flex;
        align-items: center;
        gap: 22px;
    }

    &__icon {
        flex-shrink: 0;
        width: 34px;
        display: flex;
        justify-content: center;

        img {
            max-width: 34px;
            max-height: 32px;
        }
    }
}

.clan-outro {
    font-family: "VollkornSC", sans-serif;
    font-size: 26px;
    line-height: 1;
    letter-spacing: -0.05em;
}
</style>
