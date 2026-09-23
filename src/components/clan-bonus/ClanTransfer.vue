<script setup lang="ts">
import ClanBonusHero from '@/components/clan-bonus/ClanBonusHero.vue';
import ClanBonusNote from '@/components/clan-bonus/ClanBonusNote.vue';
import heroImage from '@/assets/images/clan-bonus/transfer.jpg';
import bladesIcon from '@/assets/images/clan-bonus/blades.svg';
import goldIcon from '@/assets/images/clan-bonus/gold.svg';
import gold2Icon from '@/assets/images/clan-bonus/2-gold.svg';
import gold3Icon from '@/assets/images/clan-bonus/3-gold.svg';

const tiers = [
    { amount: '2к', text: 'щомісяця для кланів з 20+ активних гравців', icon: goldIcon },
    { amount: '3.5к', text: 'голди щомісяця для кланів з 30+ активних гравців', icon: gold2Icon },
    { amount: '5к', text: 'голди щомісяця для кланів з 40+ активних гравців', icon: gold3Icon },
]
</script>

<template>
    <div class="clan-panel">
        <ClanBonusHero :image="heroImage" :icon="bladesIcon" title="Бонус за" accent="перехід клану">
            Переходьте на Valor усім кланом та отримуйте щомісячну підтримку для швидкого старту й розвитку.
        </ClanBonusHero>

        <section class="clan-section">
            <h3 class="clan-heading clan-heading--center">Розмір бонусу залежить від кількості гравців клану:</h3>
            <ul class="tiers">
                <li v-for="tier in tiers" :key="tier.amount" class="tiers__item">
                    <span class="tiers__amount gold-text">
                        {{ tier.amount }}
                        <span class="tiers__unit">голди</span>
                    </span>
                    <span class="clan-text tiers__text">{{ tier.text }}</span>
                    <img :src="tier.icon" alt="" class="tiers__icon">
                </li>
            </ul>
        </section>

        <section class="clan-section">
            <ClanBonusNote class="note">
                <h3 class="clan-heading clan-heading--center">
                    Бонус нараховується щомісяця
                    <br>
                    <span class="gold-text">протягом 4 місяців після переходу</span>
                </h3>
                <p class="clan-text note__text">
                    Таким чином, за весь період програми клан може отримати
                    <span class="note__accent">до 20 000 голди</span>
                    на розвиток, щоб швидше освоїтися на Valor та скоротити відставання від старожилів.
                </p>
            </ClanBonusNote>
        </section>
    </div>
</template>

<style scoped lang="scss">
@import './clan-bonus.scss';

.tiers {
    list-style: none;
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    &__item {
        display: flex;
        align-items: center;
        gap: 14px;
        min-height: 104px;
        padding: 16px 28px 16px 20px;
        border-radius: 60px;
        background: rgba(250, 250, 250, 0.05);

        @media (max-width: 768px) {
            min-height: 88px;
            padding: 14px 20px 14px 16px;
        }
    }

    &__amount {
        flex-shrink: 0;
        width: 90px;
        display: flex;
        flex-direction: column;
        align-items: center;
        font-family: "VollkornSC", sans-serif;
        font-size: 44px;
        line-height: 0.85;
        letter-spacing: -0.05em;

        @media (max-width: 768px) {
            width: 76px;
            font-size: 36px;
        }
    }

    &__unit {
        font-size: 20px;
        letter-spacing: -0.03em;

        @media (max-width: 768px) {
            font-size: 16px;
        }
    }

    &__text {
        flex: 1;
        max-width: 190px;
    }

    &__icon {
        flex-shrink: 0;
        width: 56px;
        height: auto;

        @media (max-width: 768px) {
            width: 40px;
        }
    }
}

.note {
    text-align: center;
    padding-left: 20px;
    padding-right: 20px;

    .clan-heading {
        max-width: none;
        font-size: 22px;

        @media (max-width: 768px) {
            font-size: 20px;
        }
    }

    &__text {
        margin-top: 16px;
    }

    &__accent {
        color: #fbd298;
    }
}
</style>
