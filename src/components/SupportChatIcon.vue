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
        <router-link :to="{name: 'support-chat'}" class="support-chat-icon fixed " v-tooltip.top="'Підтримка'">
            <svg width="55" height="55" viewBox="0 0 69 69" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M34.5 66.8438C52.363 66.8438 66.8438 52.363 66.8438 34.5C66.8438 16.637 52.363 2.15625 34.5 2.15625C16.637 2.15625 2.15625 16.637 2.15625 34.5C2.15625 52.363 16.637 66.8438 34.5 66.8438Z" fill="#FF7D00"/>
                <path d="M31.864 41.0711C31.8245 40.8268 31.8047 40.5914 31.8047 40.365C31.8047 40.1386 31.8047 39.9014 31.8047 39.6534C31.7754 38.4608 31.9938 37.275 32.4462 36.1711C32.8411 35.2395 33.3875 34.3797 34.0634 33.6267C34.7106 32.9237 35.4338 32.2945 36.2196 31.7508C36.9815 31.2153 37.7002 30.6762 38.3759 30.1336C38.9787 29.6501 39.5216 29.0963 39.993 28.484C40.4284 27.8955 40.6543 27.1782 40.6345 26.4464C40.646 25.9419 40.5306 25.4425 40.2989 24.9942C40.0672 24.5458 39.7267 24.1629 39.3084 23.8804C38.4208 23.2408 37.0462 22.9209 35.1846 22.9209C34.2981 22.9108 33.4162 23.0492 32.5755 23.3306C31.8137 23.5912 31.0775 23.9215 30.3762 24.3171C29.7517 24.6678 29.1552 25.0661 28.5919 25.5084C28.0708 25.9217 27.6126 26.2649 27.2173 26.538L24.2578 22.7053C25.0003 21.9031 25.8385 21.1952 26.7537 20.5976C27.6812 19.9897 28.6716 19.4836 29.7077 19.0882C30.7468 18.691 31.8206 18.3914 32.9152 18.1933C33.9824 17.999 35.0648 17.8998 36.1495 17.8969C39.4773 17.8969 42.0648 18.5922 43.912 19.983C44.7981 20.62 45.5142 21.4648 45.9973 22.4433C46.4804 23.4217 46.7158 24.5039 46.6828 25.5947C46.7267 26.921 46.484 28.2411 45.9712 29.4651C45.5447 30.4347 44.9456 31.3187 44.2031 32.0742C43.4744 32.7794 42.6781 33.4114 41.8259 33.9609C41.0082 34.4941 40.2283 35.0831 39.4917 35.7236C38.7767 36.3411 38.1652 37.069 37.6805 37.8799C37.1567 38.8479 36.9034 39.9391 36.9473 41.0388L31.864 41.0711ZM30.9476 47.5776C30.9241 47.1061 31.0019 46.6351 31.1758 46.1962C31.3497 45.7573 31.6156 45.3607 31.9556 45.0333C32.6853 44.3861 33.6389 44.0496 34.6132 44.0953C35.6166 44.0397 36.6023 44.376 37.3624 45.0333C37.7022 45.361 37.9679 45.7575 38.1417 46.1964C38.3156 46.6352 38.3936 47.1062 38.3705 47.5776C38.3907 48.0504 38.3114 48.5221 38.1377 48.9622C37.9641 49.4024 37.6999 49.8012 37.3624 50.1328C36.6088 50.8034 35.6204 51.1484 34.6132 51.0923C34.1289 51.115 33.6449 51.0419 33.1889 50.8772C32.7328 50.7126 32.3138 50.4596 31.9556 50.1328C31.6191 49.8007 31.356 49.4017 31.1832 48.9616C31.0105 48.5214 30.9321 48.05 30.953 47.5776H30.9476Z" fill="white"/>
            </svg>
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
.support-chat-icon-container:hover .support-chat-icon {
    transform: scale(1.05);
    box-shadow: rgba(0, 0, 0, 0.6) 6px 6px 12px;
    cursor: pointer;
}
.support-chat-icon {
    z-index: 9999;
    bottom: 30px;
    right: 30px;
    width: 55px;
    border-radius: 100%;
    height: 55px;
    box-shadow: rgba(0, 0, 0, 0.6) 6px 6px 24px;
    transition: all .3s ease-in-out;

}
.unread-indicator {
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    bottom: 65px;
    right: 25px;
    width: 20px;
    height: 20px;
    background-color: red;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    animation: pulse 1.2s infinite;
    
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