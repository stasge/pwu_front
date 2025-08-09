<script setup lang="ts">
import { computed } from 'vue'
import type { Emotion } from '@/models/emotion'
import { useUserStore } from '@/stores/userStore'
import { getEmotionIconUrl, getEmojiFallback } from '@/utils/emotionIcons'

interface Props {
  emotions?: Emotion[]
  availableEmotions?: { id: number; icon: string; title?: string }[]
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  emotions: () => [],
  availableEmotions: () => [],
  compact: false,
})

const emit = defineEmits<{
  (e: 'toggle', payload: { idEmotion: number; isActive: boolean }): void
  (e: 'selectNew', payload: { idEmotion: number }): void
  (e: 'openPicker'): void
}>()

const userStore = useUserStore()

const myUserId = computed(() => userStore.user?.id)

function isActiveByMe(idEmotion: number): boolean {
  if (!myUserId.value) return false
  const item = props.emotions?.find(e => e.id_emotion === idEmotion)
  return !!item?.users?.some(u => u.id === myUserId.value)
}

function totalFor(idEmotion: number): number {
  const item = props.emotions?.find(e => e.id_emotion === idEmotion)
  return item?.users?.length || 0
}

function onClickExisting(idEmotion: number) {
  emit('toggle', { idEmotion, isActive: isActiveByMe(idEmotion) })
}

function onSelectNew(idEmotion: number) {
  emit('selectNew', { idEmotion })
}

const visibleOptions = computed(() => {
  return (props.availableEmotions || []).filter(opt => totalFor(opt.id) > 0)
})

function resolveIcon(icon: string): string | null {
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
  <div class="reaction-bar" :class="{ compact }">
    <div class="reaction-list">
      <button
        v-for="opt in visibleOptions"
        :key="opt.id"
        type="button"
        class="reaction-chip"
        :class="{ active: isActiveByMe(opt.id) }"
        @click="onClickExisting(opt.id)"
        :title="opt.title"
      >
        <span class="icon">
          <img v-if="resolveIcon(opt.icon)" :src="resolveIcon(opt.icon) as string" alt="" />
          <span v-else>{{ getEmojiFallback(opt.icon) }}</span>
        </span>
        <span class="count" v-if="totalFor(opt.id)">{{ totalFor(opt.id) }}</span>
      </button>

      <div class="picker-anchor">
        <button type="button" class="reaction-add" @click="emit('openPicker')" title="Додати реакцію">
            <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M48.1695 15.5897C46.9103 12.4877 45.0614 9.70516 42.6781 7.32187C40.2948 4.93857 37.5123 3.08968 34.4103 1.83047C31.4128 0.614251 28.2432 0 25 0C21.7568 0 18.5872 0.614251 15.5897 1.83047C12.4877 3.08968 9.70516 4.93857 7.32187 7.32187C4.93243 9.70516 3.08968 12.4939 1.83047 15.5897C0.614251 18.5872 0 21.7506 0 25C0 28.2432 0.614251 31.4128 1.83047 34.4042C3.08968 37.5061 4.93857 40.2887 7.32187 42.672C9.70516 45.0614 12.4877 46.9042 15.5897 48.1634C18.5872 49.3857 21.7568 50 25 50C28.2432 50 31.4128 49.3857 34.4103 48.1695C37.5123 46.9103 40.2948 45.0614 42.6781 42.6781C45.0676 40.2948 46.9103 37.5123 48.1695 34.4103C49.3857 31.4128 50 28.2432 50 25C50 21.7506 49.3857 18.5872 48.1695 15.5897ZM33.7715 14.6315C35.6327 14.6315 37.1499 16.1486 37.1499 18.0098C37.1499 19.871 35.6327 21.3882 33.7715 21.3882C31.9103 21.3882 30.3931 19.871 30.3931 18.0098C30.3931 16.1486 31.9103 14.6315 33.7715 14.6315ZM16.2285 14.5147C18.0897 14.5147 19.6069 16.0319 19.6069 17.8931C19.6069 19.7543 18.0897 21.2715 16.2285 21.2715C14.3673 21.2715 12.8501 19.7543 12.8501 17.8931C12.8501 16.0319 14.3673 14.5147 16.2285 14.5147ZM35.3071 35.3747C32.5553 38.1265 28.8943 39.6437 25 39.6437C21.1057 39.6437 17.4447 38.1265 14.6929 35.3747C13.6241 34.3059 12.7334 33.0897 12.0455 31.7568L14.2322 30.6327C14.8034 31.7383 15.5405 32.7457 16.4312 33.6364C18.7224 35.9275 21.7629 37.1867 25 37.1867C28.2371 37.1867 31.2776 35.9275 33.5688 33.6364C34.4595 32.7457 35.1966 31.7322 35.7678 30.6327L37.9545 31.7568C37.2666 33.0897 36.3759 34.3059 35.3071 35.3747Z" fill="#E26F0F"/>
            </svg>



        </button>
        <slot name="picker" />
      </div>
    </div>
  </div>
  
</template>

<style scoped lang="scss">
.reaction-bar {
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.reaction-list {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.reaction-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 10px;
  
  &:hover {
      transition: background .15s;
    background: rgba($color: #000000, $alpha: 0.4);
  }
}

.reaction-chip.active {
   
  background: rgba($color: #000000, $alpha: 0.4);
  border: none;
}

.reaction-chip .icon { line-height: 1; }
.reaction-chip .icon img { width: 20px; height: 20px; display: block; }
.reaction-chip .count { font-size: 16px; opacity: .9; }

.reaction-add {
  background: rgba($color: #000000, $alpha: 0.3);
  border-radius: 15px;
  border: none;
  color: #fff;
  cursor: pointer;
  height: 30px;
  width: 30px;
  display: flex;
  align-items: center;
  padding: 6px;
}

.picker-anchor {
  position: relative;
  display: flex;
  align-items: center;
}
</style>

