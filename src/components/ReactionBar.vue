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
            <svg width="64" height="63" viewBox="0 0 64 63" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M56 35C55.9932 42.077 53.3086 48.8893 48.4857 54.0684C43.6627 59.2475 37.0586 62.4098 30 62.92C29.34 62.98 28.67 63 28 63C20.5739 63 13.452 60.05 8.20101 54.799C2.94999 49.548 0 42.4261 0 35C0 27.5739 2.94999 20.452 8.20101 15.201C13.452 9.94999 20.5739 7 28 7C28.67 7 29.34 7.02 30 7.08C37.0586 7.59019 43.6627 10.7525 48.4857 15.9316C53.3086 21.1107 55.9932 27.923 56 35Z" fill="#FCB316"/>
                <path d="M30 62.9201C44.3594 62.9201 56 50.4199 56 35.0001C56 19.5803 44.3594 7.08008 30 7.08008C15.6406 7.08008 4 19.5803 4 35.0001C4 50.4199 15.6406 62.9201 30 62.9201Z" fill="#FFCB29"/>
                <path d="M28 45.5869C23.9145 45.5917 19.9124 44.4313 16.463 42.2419C16.3506 42.1722 16.2531 42.0808 16.1762 41.9731C16.0994 41.8654 16.0446 41.7436 16.0152 41.6146C15.9857 41.4856 15.9822 41.352 16.0047 41.2216C16.0273 41.0913 16.0755 40.9667 16.1466 40.8551C16.2176 40.7434 16.3101 40.647 16.4187 40.5714C16.5273 40.4958 16.6498 40.4425 16.7791 40.4146C16.9085 40.3867 17.042 40.3847 17.1721 40.4088C17.3023 40.4329 17.4263 40.4825 17.537 40.5549C20.6671 42.5366 24.2955 43.5886 28 43.5886C31.7046 43.5886 35.333 42.5366 38.463 40.5549C38.5738 40.4825 38.6978 40.4329 38.8279 40.4088C38.958 40.3847 39.0916 40.3867 39.221 40.4146C39.3503 40.4425 39.4728 40.4958 39.5814 40.5714C39.69 40.647 39.7825 40.7434 39.8535 40.8551C39.9246 40.9667 39.9728 41.0913 39.9954 41.2216C40.0179 41.352 40.0144 41.4856 39.9849 41.6146C39.9555 41.7436 39.9007 41.8654 39.8239 41.9731C39.747 42.0808 39.6495 42.1722 39.537 42.2419C36.0877 44.4313 32.0856 45.5917 28 45.5869Z" fill="#EF5451"/>
                <path d="M38 36.3979C40.2091 36.3979 42 33.7117 42 30.3979C42 27.0842 40.2091 24.3979 38 24.3979C35.7909 24.3979 34 27.0842 34 30.3979C34 33.7117 35.7909 36.3979 38 36.3979Z" fill="#455B64"/>
                <path d="M18 36.3979C20.2091 36.3979 22 33.7117 22 30.3979C22 27.0842 20.2091 24.3979 18 24.3979C15.7909 24.3979 14 27.0842 14 30.3979C14 33.7117 15.7909 36.3979 18 36.3979Z" fill="#455B64"/>
                <path d="M60.25 11.25H52.75V3.75C52.75 1.68 51.07 0 49 0C46.93 0 45.25 1.68 45.25 3.75L45.3831 11.25H37.75C35.68 11.25 34 12.93 34 15C34 17.07 35.68 18.75 37.75 18.75L45.3831 18.6169L45.25 26.25C45.25 28.32 46.93 30 49 30C51.07 30 52.75 28.32 52.75 26.25V18.6169L60.25 18.75C62.32 18.75 64 17.07 64 15C64 12.93 62.32 11.25 60.25 11.25Z" fill="#008000"/>
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
  background: none;
  border-radius: 15px;
  border: none;
  color: #fff;
  cursor: pointer;
  height: 25px;
  width: 25px;
  display: flex;
  align-items: center;
}

.picker-anchor {
  position: relative;
  display: flex;
  align-items: center;
}
</style>

