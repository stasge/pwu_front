<script setup lang="ts">

</script>

<template>
    <div class="header flex align-items-center justify-content-between">
        
        <div class="header-container">
            <div class="header-left flex align-items-center gap-5">
                <img src="@/assets/images/header-logo.png" alt="header-logo">
                <nav class="header-menu">
                    <ul class="header-menu__list flex align-items-center gap-5">
                        <li class="header-menu__item">
                            <router-link to="/">Про сервер</router-link>
                        </li>
                        <li class="header-menu__item">
                            <router-link to="/">Таблиця лідерів</router-link>
                        </li>
                        <li class="header-menu__item">
                            <router-link to="/">Підтримка проєкту</router-link>
                        </li>
                        <li class="header-menu__item">
                            <router-link to="/">Форум</router-link>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
        <img class="header-mask" src="@/assets/images/header-mask.png" alt="header-bg">
    </div>
</template>

<style scoped lang="scss">
.header {
    background: #0a0a0a;
    padding: 30px 50px 0 50px;
    width: 100%;
    position: relative;
    z-index: 100;

    &-container {
        max-width: 1390px;
        width: 100%;
        margin: 0 auto;
        position: relative;
        z-index: 101;
    }

    &-mask {
        position: absolute;
        bottom: -185%;
        left: 0;
        width: 100%;
        height: 113px;
    }
}

</style>