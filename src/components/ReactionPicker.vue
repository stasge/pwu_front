<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { getEmotionIconUrl, getEmojiFallback } from '@/utils/emotionIcons'
interface Option { id: number; icon: string; title?: string }
const props = defineProps<{ options: Option[] }>()
const emit = defineEmits<{ (e: 'select', id: number): void; (e: 'close'): void }>()

const rootEl = ref<HTMLElement | null>(null)

function resolveIcon(icon: string): string | null {
  const resolved = getEmotionIconUrl(icon)
  if (resolved) return resolved
  const normalized = icon.replace(/^@\//, '/src/')
  if (/^https?:\/\//.test(normalized) || normalized.startsWith('/assets/') || normalized.startsWith('/src/')) {
    return normalized
  }
  return null
}

function handleDocumentClick(event: MouseEvent) {
  const target = event.target as Node | null
  if (!rootEl.value || !target) return
  if (!rootEl.value.contains(target)) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleDocumentClick, { passive: true })
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleDocumentClick)
})
</script>

<template>
  <div class="reaction-picker" role="dialog" aria-label="Вибір реакції" ref="rootEl">
    <button
      v-for="opt in props.options"
      :key="opt.id"
      type="button"
      class="picker-item"
      :title="opt.title"
      @click="emit('select', opt.id)"
    >
      <img v-if="resolveIcon(opt.icon)" :src="resolveIcon(opt.icon) as string" alt="" />
      <span v-else>{{ getEmojiFallback(opt.icon) }}</span>
    </button>
  </div>
</template>

<style scoped lang="scss">
.reaction-picker {
  position: absolute;
  left: 0;
  bottom: calc(100% + 6px);
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 12px;
  background: #12161d;
  border: 1px solid rgba(255,255,255,0.15);
  box-shadow: 0 8px 24px rgba(0,0,0,0.35);
  z-index: 1000;
  width: 172px;
  max-height: 200px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin; /* Firefox */
  scrollbar-color: rgba(226, 111, 15, 0.6) transparent; /* Firefox */

  &--right {
    left: auto;
    right: 0;
  }

  /* WebKit */
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 8px;
  }
  &::-webkit-scrollbar-thumb {
    border-radius: 8px;
    background: linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0.12));
    border: 2px solid transparent;
    background-clip: padding-box;
  }
  &:hover::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, rgba(226,111,15,0.85), rgba(226,111,15,0.55));
  }
  &::-webkit-scrollbar-thumb:active {
    background: linear-gradient(180deg, rgba(226,111,15,1), rgba(226,111,15,0.75));
  }
}

.picker-item {
  border-radius: 999px;
  background: none;
  color: #fff;
  border: none;
  cursor: pointer;
}
.picker-item img { width: 20px; height: 20px; display: block; }
</style>


