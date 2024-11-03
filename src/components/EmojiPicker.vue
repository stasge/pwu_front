<script setup lang="ts">
import { ref } from 'vue';
import EmojiPicker, { type EmojiExt } from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'

const emit = defineEmits(['onEmojiPicker'])
let {showEmojiPicker = false} = defineProps<{showEmojiPicker: boolean}>()

function onSelectEmoji(emoji: EmojiExt) {
    emit('onEmojiPicker', emoji)
}
</script>

<template>
    <div class="emoji-textarea">
        <EmojiPicker 
        v-if="showEmojiPicker" 
            :native="true" 
            @select="onSelectEmoji"  
            class="emoji-menu absolute"
        />
    </div>
</template>

<style scoped lang="scss">
.emoji-menu  {
    right: 40px;
    transform: translateY(-100%);

    * {
        text-shadow: none !important;
    }
}

.emoji-textarea {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: start;
}

textarea {
    width: 100%;
    height: 100px;
    margin-bottom: 8px;
}

.emoji-picker-container {
    position: absolute;
    top: 60px;
    left: 0;
    z-index: 10;
    background: white;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>