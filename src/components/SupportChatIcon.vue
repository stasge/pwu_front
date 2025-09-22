<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import { onMounted } from 'vue';

const userStore = useUserStore()

onMounted(() => {
    userStore.getUnreadCount()
})

</script>
<template>
    <div class="support-chat-icon-container">
        <router-link :to="{name: 'support-chat'}" class="support-chat-icon fixed ">
            <div class="support-icon"></div>
        </router-link>
        <div v-if="userStore.unreadCount > 0" class="unread-indicator">
            <p class="text-white text-sm font-bold">
                {{ userStore.unreadCount }}  
            </p>
        </div>
    </div>
</template>
<style scoped lang="scss">
.support-chat-icon-container {
    cursor: pointer;
}

.support-chat-icon {
    z-index: 9999;
    bottom: 0px;
    right: 0px;
    width: 130px;
    height: 130px;
    border-radius: 100%;
    transition: all .3s ease-in-out;

    @media (max-width: 768px) {
        width: 100px;
        height: 100px;
    }
}

.support-icon {
    width: 100%;
    height: 100%;
    background-image: url('@/assets/images/support-icon-unactive.png');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    transition: background-image 0.3s ease-in-out;
}

.support-chat-icon-container:hover .support-icon {
    background-image: url('@/assets/images/support-icon-active.png');
}

// Прибрати hover ефект для мобільних пристроїв
@media (hover: none) and (pointer: coarse) {
    .support-chat-icon-container:hover .support-icon {
        background-image: url('@/assets/images/support-icon-unactive.png');
    }
}
.unread-indicator {
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    bottom: 72px;
    right: 32px;
    width: 20px;
    height: 20px;
    background-color: red;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    animation: pulse 1.2s infinite;

    @media (max-width: 768px) {
        bottom: 55px;
        right: 26px;
        width: 15px;
        height: 15px;
    }
    
    span {
        line-height: 100%;
    }
}

@keyframes pulse {
    0% {
        box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7);
    }
    70% {
        box-shadow: 0 0 0 10px rgba(255, 0, 0, 0);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(255, 0, 0, 0);
    }
}
</style>