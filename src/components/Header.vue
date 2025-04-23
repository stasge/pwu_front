<script setup lang="ts">

</script>

<template>
    <div class="header flex flex-column align-items-center justify-content-center h-screen relative">
        <div class="logo flex flex-column align-self-end relative z-2">
            <img src="@/assets/images/logo.svg" alt="logo">
        </div>
        <router-link :to="{hash: '#steps'}" class="play btn z-2">Грати</router-link>
        <div class="blur w-full h-5rem absolute z-2"></div>
        <div class="header__chars absolute w-full h-full z-1"></div>
    </div>
</template>

<style scoped lang="scss">
.header {
    font-family: "IM Fell DW Pica", serif;
    font-weight: 400;
    font-style: normal;
    background: url('@/assets/images/header-bg.jpg') no-repeat left top / cover;

    &__chars {
        background: url('@/assets/images/header-without-bg.png') no-repeat left top / cover;
    }
}
.logo {
    color: #FFF;
    text-align: center;
    font-size: 312.5%; /* 50/16 */
    width: clamp(300px, 35vw, 400px);
    height: auto;
    margin-right: clamp(10px, 4vw, 50px);

    img {
        width: 100%;
        height: 100%;
    }
}

.play {
    position: relative;
    top: 4rem;
    
    &:hover {
        letter-spacing: 1px;
        top: 3.5rem;
    }
}

.blur {
    filter: blur(15px);
    background: #1d202f;
    bottom: -30px;
}
</style>