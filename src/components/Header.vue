<script setup lang="ts">

</script>

<template>
    <div class="header flex flex-column align-items-center justify-content-center h-screen">
        <div class="logo flex flex-column w-max align-self-end">
            <h1>PW</h1>
            <h1>Ukraine</h1>
        </div>
        <a class="play btn flex align-items-center justify-content-center">Грати</a>
    </div>
</template>

<style scoped lang="scss">
.header {
    font-family: "IM Fell DW Pica", serif;
    font-weight: 400;
    font-style: normal;
}
.logo {
    color: #FFF;
    text-align: center;
    font-size: 50px;
}

.play {
    border: none;
    background: url('@/assets/images/btn-bg.svg') no-repeat;
    color: #FFF;
    position: relative;
    width: 360px;
    height: 80px;
    font-size: 28px;
    text-transform: uppercase;
    position: relative;
    top: 10rem;
    transition: all .5s;
    cursor: pointer;

    &:hover {
        transform: translateY(-5px);
    }
}
</style>