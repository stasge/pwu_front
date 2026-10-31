<script setup lang="ts">
import cornerTL from '@/assets/images/tournament/Corner-TL.svg'
import cornerTR from '@/assets/images/tournament/Corner-TR.svg'
import cornerBL from '@/assets/images/tournament/Corner-BL.svg'
import cornerBR from '@/assets/images/tournament/Corner-BR.svg'

/** Золоті кутові орнаменти для .panel-card (як у pvp-teams) */
const corners = [
    { cls: 'corner-tl', src: cornerTL },
    { cls: 'corner-tr', src: cornerTR },
    { cls: 'corner-bl', src: cornerBL },
    { cls: 'corner-br', src: cornerBR },
]
</script>
<template>
    <div v-for="c in corners" :key="c.cls" class="corner-icon" :class="c.cls" aria-hidden="true"><img :src="c.src" alt=""></div>
</template>
