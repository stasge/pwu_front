<script setup lang="ts">
import { getEmotionIconUrl, getEmojiFallback } from '@/utils/emotionIcons'
interface Option { id: number; icon: string; title?: string }
const props = defineProps<{ options: Option[] }>()
const emit = defineEmits<{ (e: 'select', id: number): void }>()

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
  <div class="reaction-picker" role="dialog" aria-label="Вибір реакції">
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
  width: 200px;
  max-height: 200px;
  overflow-y: auto;

  &--right {
    left: auto;
    right: 0;
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


