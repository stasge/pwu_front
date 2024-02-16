<script setup lang="ts">

</script>

<template>
    <div class="join-fight mt-8">
        <h2 class="join-fight__title">Вступи в бій</h2>
        <p class="join-fight__text mt-3">Переписуючи основи</p>
    </div>
    <div class="steps mt-6 mb-8">
        <div class="steps__item">
            <h3>Реєстрація</h3>
            <p>Для подальшої гри необхідний ігровий обліковий запис</p>
        </div>
        <div class="steps__item">
            <h3>Завантаження</h3>
            <p>Завантажте ігровий клієнт зручним способом</p>
        </div>
        <div class="steps__item">
            <h3>Гра</h3>
            <p>Пориньте в захоплюючі битви нового світу</p>
        </div>
    </div>
</template>

<style scoped lang="scss">
.join-fight {
    color: #FFF;
    text-align: center;
    padding: 25px 0;
    background: linear-gradient(90deg, rgba(223, 119, 45, 0.00) 0%, rgba(93, 119, 144, 0.1) 49.60%, rgba(223, 119, 45, 0.00) 100%);
    position: relative;

    &::before {
        position: absolute;
        content: '';
        width: 100%;
        height: 1px;
        background: linear-gradient(270deg, rgba(255, 160, 229, 0) 10%, rgb(226, 111, 15) 50%, rgba(255, 160, 229, 0) 90%);
        bottom: 0;
        left: 0;
    }

    &::after {
        position: absolute;
        content: '';
        width: 100%;
        height: 1px;
        background: linear-gradient(270deg, rgba(255, 160, 229, 0) 10%, rgb(226, 111, 15) 50%, rgba(255, 160, 229, 0) 90%);
        top: 0;
        left: 0;
    }

    &__title {
        font-size: 40px;
    }

    &__text {
        font-size: 20px;
    }
}

.steps {
    display: grid;
    grid-template-columns: repeat(3, 450px);
    grid-template-rows: 188px;

    &__item {
        position: relative;
        background: url('@/assets/images/step-bg.svg') no-repeat;
        animation: steps-anim 2.5s infinite;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        color: #FFF;
        cursor: pointer;
        transition: all .3s;

        &:hover {
            transform: scale(1.05);
        }

        h3 {
            font-size: 30px;
        }
        p {
            max-width: 60%;
            margin-top: 15px;
            font-size: 18px;
        }

        &:first-child {
            left: 50px;
        }

        &:nth-child(2) {
            animation-delay: .3s;
        }

        &:last-child {
            right: 50px;
            animation-delay: .6s;
        }
    }
}

@keyframes steps-anim {
    0% {
        background: url('@/assets/images/step-bg-light.svg') no-repeat;
    }
    100% {
        background: url('@/assets/images/step-bg.svg') no-repeat;
    }
}
</style>