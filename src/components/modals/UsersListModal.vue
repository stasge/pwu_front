<script setup lang="ts">
import Modal from '@/components/base/modal.vue'
import { computed } from 'vue'
import { getEmotionIconUrl, getEmojiFallback } from '@/utils/emotionIcons'

interface Props {
  showed: boolean
  users: { id: number; name: string }[]
  emotionIcon: string
  emotionName: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:showed', value: boolean): void
  (e: 'closeDia'): void
}>()

function closeModal() {
  emit('update:showed', false)
  emit('closeDia')
}

// Get emotion name without extension
const displayEmotionName = computed(() => {
  return props.emotionName.replace(/\.(png|svg|jpg|jpeg)$/, '')
})

// Resolve emotion icon
function resolveEmotionIcon(icon: string): string | null {
  const resolved = getEmotionIconUrl(icon)
  if (resolved) return resolved
  const normalized = icon.replace(/^@\//, '/src/')
  if (/^https?:\/\//.test(normalized) || normalized.startsWith('/assets/') || normalized.startsWith('/src/')) {
    return normalized
  }
  return null
}
</script>

<template>
  <Modal :showed="showed" @update:showed="(value) => emit('update:showed', value)" @closeDia="closeModal">
    <template #header>
      <div class="modal-header">
        <div class="emotion-info">
          <div class="emotion-icon">
            <img 
              v-if="resolveEmotionIcon(emotionIcon)" 
              :src="resolveEmotionIcon(emotionIcon) || ''" 
              alt="" 
            />
            <span v-else>{{ getEmojiFallback(emotionIcon) }}</span>
          </div>
        </div>
      </div>
    </template>

    <template #body>
      <div class="users-list">
        <div v-if="users.length === 0" class="no-users">
          Немає користувачів з цією реакцією
        </div>
        <div v-else class="users-grid">
          <div 
            v-for="user in users" 
            :key="user.id" 
            class="user-item"
          >
            <div class="user-name">
              {{ user.name }}
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="modal-footer">
        <button @click="closeModal" class="close-btn">
          Закрити
        </button>
      </div>
    </template>
  </Modal>
</template>

<style scoped lang="scss">
.modal-header {
  text-align: center;
  margin-bottom: 20px;
}

.emotion-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.emotion-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  
  img {
    width: 32px;
    height: 32px;
    object-fit: contain;
  }
  
  span {
    font-size: 24px;
    line-height: 1;
  }
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
}

.user-count {
  font-size: 14px;
  color: #b0b0b0;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.1);
  padding: 6px 12px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.users-list {
  width: 100%;
  max-height: 50vh; // Use viewport height instead of fixed pixels
  max-width: 500px;
  overflow-y: auto;
  padding-right: 8px; // Add padding for scrollbar
  
  // Custom scrollbar styling
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    
    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
  
  // Firefox scrollbar
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05);
}

.no-users {
  text-align: center;
  color: #b0b0b0;
  font-style: italic;
  padding: 40px 20px;
}

.users-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px; // Further reduce gap
  padding: 16px 0;
  
  // Responsive adjustments
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 8px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr; // Single column on very small screens
    gap: 8px;
  }
}

.user-item {
  display: flex;
  align-items: center;
  gap: 8px; // Further reduce gap
  padding: 8px; // Further reduce padding
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px; // Slightly smaller radius
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }
  
  // Responsive adjustments
  @media (max-width: 480px) {
    padding: 10px;
    gap: 10px;
  }
}

.user-avatar {
  width: 36px; // Slightly smaller avatar
  height: 36px;
  background: linear-gradient(135deg, #4a9eff, #6b46c1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px; // Smaller font
  flex-shrink: 0;
}

.user-name {
  color: #ffffff;
  font-weight: 500;
  font-size: 13px; // Slightly smaller font
  line-height: 1.2;
  word-break: break-word; // Handle long names
}

.modal-footer {
  margin-top: 20px;
  text-align: center;
}

.close-btn {
  background: linear-gradient(135deg, #4a9eff, #6b46c1);
  border: none;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(74, 158, 255, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
}
</style>

