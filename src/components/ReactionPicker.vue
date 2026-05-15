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
  bottom: calc(100% + 10px);
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 8px;
  padding: 12px;
  border-radius: 8px;
  background: rgba(12, 15, 21, 0.92);
  border: 1px solid rgba(250, 250, 250, 0.14);
  backdrop-filter: blur(16px);
  box-shadow: 0 16px 34px rgba(0, 0, 0, 0.45);
  z-index: 10000;
  width: min(260px, 82vw);
  max-height: 240px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: rgba(248, 248, 248, 0.38) transparent;

  &--right {
    left: auto;
    right: 0;
  }

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 8px;
  }
  &::-webkit-scrollbar-thumb {
    border-radius: 8px;
    background: linear-gradient(180deg, rgba(248, 248, 248, 0.34), rgba(146, 146, 146, 0.28));
    border: 2px solid transparent;
    background-clip: padding-box;
  }
  &:hover::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, rgba(248, 248, 248, 0.48), rgba(180, 180, 180, 0.36));
  }
  &::-webkit-scrollbar-thumb:active {
    background: linear-gradient(180deg, rgba(248, 248, 248, 0.62), rgba(210, 210, 210, 0.42));
  }
}

.picker-item {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  color: #fff;
  border: 1px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease, background 0.15s ease, border-color 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(250, 250, 250, 0.18);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
    background: rgba(226, 111, 15, 0.22);
    border-color: rgba(226, 111, 15, 0.55);
  }
}
.picker-item img {
  width: 22px;
  height: 22px;
  display: block;
}

.picker-item span {
  font-size: 20px;
  line-height: 1;
}
</style>


