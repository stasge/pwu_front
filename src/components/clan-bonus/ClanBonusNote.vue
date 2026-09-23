<template>
    <div class="clan-note">
        <img src="@/assets/images/Corner-TL.svg" alt="" class="corner corner-tl">
        <img src="@/assets/images/Corner-TR.svg" alt="" class="corner corner-tr">
        <img src="@/assets/images/Corner-BL.svg" alt="" class="corner corner-bl">
        <img src="@/assets/images/Corner-BR.svg" alt="" class="corner corner-br">
        <slot />
    </div>
</template>

<style scoped lang="scss">
.clan-note {
    position: relative;
    padding: 30px;
    border-radius: 5px;
    background: rgba(250, 250, 250, 0.1);
    box-shadow: 0 0 30px 0 rgba(248, 248, 248, 0.08);

    @media (max-width: 768px) {
        padding: 24px 20px;
    }
}

.corner {
    position: absolute;
    width: 20px;
    height: 20px;
    pointer-events: none;
}

.corner-tl {
    top: -1px;
    left: -1px;
}

.corner-tr {
    top: -1px;
    right: -1px;
}

.corner-bl {
    bottom: -1px;
    left: -1px;
}

.corner-br {
    bottom: -1px;
    right: -1px;
}
</style>
