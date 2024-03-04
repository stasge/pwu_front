<script setup lang="ts">

</script>

<template>
    <div class="header flex flex-column align-items-center justify-content-center h-screen relative">
        <div class="logo flex flex-column w-max align-self-end">
            <h1>PW</h1>
            <h1>Ukraine</h1>
        </div>
        <a class="play btn z-2">Грати</a>
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
    font-size: 50px;
    transform: translateX(-50%);

    @media (max-width: 1640px) {
        transform: translateX(-20%);
    }
}

.play {
    position: relative;
    top: 7rem;

    &:hover {
        transform: translateY(-5px);
    }
}

.blur {
    filter: blur(15px);
    background: #1d202f;
    bottom: -30px;
}
</style>