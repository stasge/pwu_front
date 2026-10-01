<!-- Декоративні кути блоку. Батьківський елемент повинен мати position: relative. -->
<template>
    <span class="corner corner--tl"></span>
    <span class="corner corner--tr"></span>
    <span class="corner corner--bl"></span>
    <span class="corner corner--br"></span>
</template>
<style scoped lang='scss'>
.corner {
    position: absolute;
    width: 10px;
    height: 10px;
    background: url('@/assets/images/profile-corner.svg') no-repeat center / contain;
    pointer-events: none;
    z-index: 1;

    &--tl { top: 0; left: 0; }
    &--tr { top: 0; right: 0; transform: rotate(90deg); }
    &--bl { bottom: 0; left: 0; transform: rotate(-90deg); }
    &--br { bottom: 0; right: 0; transform: rotate(180deg); }
}
</style>
