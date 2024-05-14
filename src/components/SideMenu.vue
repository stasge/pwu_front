<script setup lang="ts">

</script>

<template>
    <div class="side-menu flex flex-column relative z-2 w-full" style="transform: translateY(-10%);max-width: 253px;">
        <div class="server-state flex gap-5">
            <div class="rhombus">
                <span>PWU</span>
            </div>
            <div class="server-state__content flex flex-column justify-content-center align-items-end">
                <div class="flex flex-column align-items-start w-max">
                    <h3>PW Ukraine - 1.3.6</h3>
                    <p>Статус: <span style="color: red;">Offline</span></p>
                </div>
            </div>
        </div>
        <ul class="side-menu__list flex flex-column gap-3 mt-6">
            <li class="side-menu__item">
                <a href="#">Почати гру</a>
            </li>
            <li class="side-menu__item">
                <a href="#">Про сервер</a>
            </li>
            <li class="side-menu__item">
                <a href="#">Особистий кабінет</a>
            </li>
            <li class="side-menu__item">
                <a href="#">Форум</a>
            </li>
        </ul>
    </div>
</template>

<style scoped lang="scss">
    .side-menu {

        @media (max-width: 768px) {
            display: none !important;
        }

        &__list {
            list-style: none;
            position: relative;
            z-index: 2;
        }

        &__item {
            padding: 15px 30px;
            background: rgba(93, 119, 144, 0.1);
            font-size: 137.5%; /* 22/16 */
            transition: all .3s;
            cursor: pointer;

            &:hover {
                background: rgba(93, 119, 144, 0.2);
            }
        } 
    }

    .server-state {
        color: #fff;

        &__content {
            width: 100%;
            border-bottom-left-radius: 35px;
            border-top-left-radius: 35px;
            padding: 10px 20px;
            background: linear-gradient(87deg, #e26f0f 0%, rgba(217, 217, 217, 0) 100%), linear-gradient(270deg, #3d4c60 0%, rgba(0, 0, 0, 0) 100%);
        }
    }

    .rhombus {
        position: absolute;
        z-index: 2;
        padding: 27px 20px;
        transform: rotate(45deg) translate(-8px, 2px);
        background:  linear-gradient(225deg, #e26f0f 0%, rgba(217, 217, 217, 0) 100%), linear-gradient(45deg, #3d4c60 0%, rgba(21, 26, 33, 0.34) 65.59%, rgba(0, 0, 0, 0) 100%);

        span {
            display: block;
            transform: rotate(-45deg);
            font-weight: 700;
        }
    }
</style>