<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Emotion } from '@/models/emotion'
import { useUserStore } from '@/stores/userStore'
import { getEmotionIconUrl, getEmojiFallback } from '@/utils/emotionIcons'
import UsersListModal from '@/components/modals/UsersListModal.vue'

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

// Watch for changes in emotions to update tooltip
watch(() => props.emotions, () => {
  updateTooltipIfVisible()
}, { deep: true })

// Tooltip state
const tooltipVisible = ref(false)
const tooltipData = ref<{
  users: { id: number; name: string }[]
  icon: string
  emotionId: number
} | null>(null)
const tooltipPosition = ref({ x: 0, y: 0 })
const isOverTooltip = ref(false)
const hideTooltipTimeout = ref<number | null>(null)

// Modal state
const usersModalVisible = ref(false)
const selectedEmotionData = ref<{
  users: { id: number; name: string }[]
  icon: string
  emotionId: number
} | null>(null)

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
  // Update tooltip if it's currently visible for this emotion
  setTimeout(() => updateTooltipIfVisible(), 0)
}

function onSelectNew(idEmotion: number) {
  emit('selectNew', { idEmotion })
  // Update tooltip if it's currently visible for this emotion
  setTimeout(() => updateTooltipIfVisible(), 0)
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

// Tooltip functions
function showTooltip(event: MouseEvent, emotionId: number) {
  // Clear any existing hide timeout
  if (hideTooltipTimeout.value) {
    clearTimeout(hideTooltipTimeout.value)
    hideTooltipTimeout.value = null
  }
  
  const emotion = props.emotions?.find(e => e.id_emotion === emotionId)
  if (!emotion || !emotion.users?.length) return

  const availableEmotion = props.availableEmotions?.find(ae => ae.id === emotionId)
  if (!availableEmotion) return

  const rect = (event.target as HTMLElement).getBoundingClientRect()
  tooltipPosition.value = {
    x: rect.left + rect.width / 2,
    y: rect.top - 20
  }

  tooltipData.value = {
    users: emotion.users,
    icon: availableEmotion.icon,
    emotionId: emotionId
  }
  
  tooltipVisible.value = true
  isOverTooltip.value = false
}

function hideTooltip() {
  // Clear any existing timeout
  if (hideTooltipTimeout.value) {
    clearTimeout(hideTooltipTimeout.value)
  }
  
  // Add a small delay to allow moving cursor to tooltip
  hideTooltipTimeout.value = window.setTimeout(() => {
    if (!isOverTooltip.value) {
      tooltipVisible.value = false
      tooltipData.value = null
    }
    hideTooltipTimeout.value = null
  }, 100)
}

function onTooltipMouseEnter() {
  isOverTooltip.value = true
}

function onTooltipMouseLeave() {
  isOverTooltip.value = false
  // Clear any existing timeout
  if (hideTooltipTimeout.value) {
    clearTimeout(hideTooltipTimeout.value)
  }
  // Hide tooltip when leaving tooltip
  hideTooltipTimeout.value = window.setTimeout(() => {
    if (!isOverTooltip.value) {
      tooltipVisible.value = false
      tooltipData.value = null
    }
    hideTooltipTimeout.value = null
  }, 100)
}

// Function to open users modal
function openUsersModal(emotionId: number) {
  // Clear any existing hide timeout
  if (hideTooltipTimeout.value) {
    clearTimeout(hideTooltipTimeout.value)
    hideTooltipTimeout.value = null
  }
  
  const emotion = props.emotions?.find(e => e.id_emotion === emotionId)
  if (!emotion || !emotion.users?.length) return

  const availableEmotion = props.availableEmotions?.find(ae => ae.id === emotionId)
  if (!availableEmotion) return

  selectedEmotionData.value = {
    users: emotion.users,
    icon: availableEmotion.icon,
    emotionId: emotionId
  }
  usersModalVisible.value = true
  // Hide tooltip after opening modal
  hideTooltip()
}

// Function to close users modal
function closeUsersModal() {
  usersModalVisible.value = false
  selectedEmotionData.value = null
}

// Function to update tooltip if it's currently visible
function updateTooltipIfVisible() {
  if (tooltipVisible.value && tooltipData.value) {
    const emotion = props.emotions?.find(e => e.id_emotion === tooltipData.value!.emotionId)
    if (emotion && emotion.users?.length) {
      const availableEmotion = props.availableEmotions?.find(ae => ae.id === tooltipData.value!.emotionId)
      if (availableEmotion) {
        tooltipData.value = {
          users: emotion.users,
          icon: availableEmotion.icon,
          emotionId: tooltipData.value.emotionId
        }
      }
    }
  }
}

// Get display names for tooltip
function getDisplayNames(users: { id: number; name: string }[], maxVisible: number = 3) {
  if (users.length <= maxVisible) {
    return { names: users.map(u => u.name).join(', '), hasMore: false }
  }
  
  const visibleUsers = users.slice(0, maxVisible)
  const remainingCount = users.length - maxVisible
  const names = visibleUsers.map(u => u.name).join(', ')
  
  return { 
    names, 
    hasMore: true, 
    moreText: `та ще ${remainingCount} ${getUkrainianWordForm(remainingCount, 'людина', 'людини', 'людей')} додали реакцію` 
  }
}

// Ukrainian word forms helper
function getUkrainianWordForm(count: number, form1: string, form2: string, form5: string): string {
  if (count % 10 === 1 && count % 100 !== 11) return form1
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return form2
  return form5
}

function getEmotionTitle(emotionId: number): string {
  const availableEmotion = props.availableEmotions?.find(ae => ae.id === emotionId)
  if (availableEmotion?.title) {
    return availableEmotion.title
  }
  return 'Реакція'
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
        @mouseenter="showTooltip($event, opt.id)"
        @mouseleave="hideTooltip"
      >
        <span class="icon">
          <img v-if="resolveIcon(opt.icon)" :src="resolveIcon(opt.icon) as string" alt="" />
          <span v-else>{{ getEmojiFallback(opt.icon) }}</span>
        </span>
        <span class="count" v-if="totalFor(opt.id)">{{ totalFor(opt.id) }}</span>
      </button>

      <div
        class="picker-anchor"
        role="button"
        tabindex="0"
        title="Додати реакцію"
        @click="emit('openPicker')"
        @keydown.enter.prevent="emit('openPicker')"
        @keydown.space.prevent="emit('openPicker')"
      >
        <button type="button" class="reaction-add" aria-label="Додати реакцію">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_1093_1226)">
              <path d="M8.00065 14.6663C4.31865 14.6663 1.33398 11.6817 1.33398 7.99967C1.33398 4.31767 4.31865 1.33301 8.00065 1.33301C11.6827 1.33301 14.6673 4.31767 14.6673 7.99967C14.6673 11.6817 11.6827 14.6663 8.00065 14.6663ZM8.00065 13.333C9.41514 13.333 10.7717 12.7711 11.7719 11.7709C12.7721 10.7707 13.334 9.41416 13.334 7.99967C13.334 6.58519 12.7721 5.22863 11.7719 4.22844C10.7717 3.22824 9.41514 2.66634 8.00065 2.66634C6.58616 2.66634 5.22961 3.22824 4.22941 4.22844C3.22922 5.22863 2.66732 6.58519 2.66732 7.99967C2.66732 9.41416 3.22922 10.7707 4.22941 11.7709C5.22961 12.7711 6.58616 13.333 8.00065 13.333V13.333ZM5.33398 8.66634H10.6673C10.6673 9.37358 10.3864 10.0519 9.88627 10.552C9.38617 11.0521 8.70789 11.333 8.00065 11.333C7.29341 11.333 6.61513 11.0521 6.11503 10.552C5.61494 10.0519 5.33398 9.37358 5.33398 8.66634V8.66634ZM5.33398 7.33301C5.06877 7.33301 4.81441 7.22765 4.62688 7.04011C4.43934 6.85258 4.33398 6.59822 4.33398 6.33301C4.33398 6.06779 4.43934 5.81344 4.62688 5.6259C4.81441 5.43836 5.06877 5.33301 5.33398 5.33301C5.5992 5.33301 5.85355 5.43836 6.04109 5.6259C6.22863 5.81344 6.33398 6.06779 6.33398 6.33301C6.33398 6.59822 6.22863 6.85258 6.04109 7.04011C5.85355 7.22765 5.5992 7.33301 5.33398 7.33301ZM10.6673 7.33301C10.4021 7.33301 10.1477 7.22765 9.96021 7.04011C9.77267 6.85258 9.66732 6.59822 9.66732 6.33301C9.66732 6.06779 9.77267 5.81344 9.96021 5.6259C10.1477 5.43836 10.4021 5.33301 10.6673 5.33301C10.9325 5.33301 11.1869 5.43836 11.3744 5.6259C11.562 5.81344 11.6673 6.06779 11.6673 6.33301C11.6673 6.59822 11.562 6.85258 11.3744 7.04011C11.1869 7.22765 10.9325 7.33301 10.6673 7.33301Z" fill="#F8F8F8" />
            </g>
            <defs>
              <clipPath id="clip0_1093_1226">
                <rect width="16" height="16" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </button>
        <slot name="picker" />
      </div>
    </div>

    <!-- Tooltip -->
    <Teleport to="body">
      <Transition name="tooltip">
        <div
          v-if="tooltipVisible && tooltipData"
          class="emotion-tooltip"
          :style="{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`
          }"
          @mouseenter="onTooltipMouseEnter"
          @mouseleave="onTooltipMouseLeave"
        >
          <div class="tooltip-content" @click.stop>
            <div class="tooltip-emoji">
              <img 
                v-if="resolveIcon(tooltipData.icon)" 
                :src="resolveIcon(tooltipData.icon) as string" 
                alt="" 
              />
              <span v-else>{{ getEmojiFallback(tooltipData.icon) }}</span>
            </div>
            <div class="tooltip-text">
              <div class="user-names">
                {{ getDisplayNames(tooltipData.users).names }}
              </div>
              <div 
                v-if="getDisplayNames(tooltipData.users).hasMore"
                class="more-users clickable"
                @click="openUsersModal(tooltipData.emotionId)"
              >
                {{ getDisplayNames(tooltipData.users).moreText }}
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Users List Modal -->
    <UsersListModal
      v-if="usersModalVisible && selectedEmotionData"
      :showed="usersModalVisible"
      :users="selectedEmotionData.users"
      :emotion-icon="selectedEmotionData.icon"
      :emotion-name="getEmotionTitle(selectedEmotionData.emotionId)"
      @update:showed="(value) => usersModalVisible = value"
      @close-dia="closeUsersModal"
    />
  </div>
  
</template>

<style scoped lang="scss">
.reaction-bar {
  display: flex;
  align-items: center;
  margin-top: 10px;
  position: relative;
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
  border: none;
  color: #fff;
  cursor: pointer;
  border-radius: 30px;
  padding: 5px 20px 5px 15px;
  background: rgba(0, 0, 0, 0.4);
  
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transition: background .15s;
      background: rgba($color: #000000, $alpha: 0.4);
    }
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
  justify-content: center;

  @media (max-width: 1200px) {
    height: 15px;
    width: 15px;
  }
}

.picker-anchor {
  position: relative;
  display: flex;
  align-items: center;
  border-radius: 30px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.4);
}

// Tooltip styles
.emotion-tooltip {
  position: fixed;
  z-index: 1000;
  transform: translate(-25px, -100%);
  pointer-events: auto;
  margin-bottom: 8px;
}

.tooltip-content {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #2a2a2a;
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  max-width: 300px;
}

.tooltip-emoji {
  flex-shrink: 0;
  
  img, span {
    width: 22px;
    height: 22px;
    display: block;
    font-size: 32px;
    line-height: 1;
  }
}

.tooltip-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.user-names {
  color: #ffffff;
  font-size: 80%;
  font-weight: 500;
  line-height: 1.4;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.more-users {
  color: #4a9eff;
  font-size: 80%;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s ease;
  
  &:hover {
    color: #6b46c1;
    text-decoration: underline;
  }
}

.reaction-text {
  color: #b0b0b0;
  font-size: 12px;
  line-height: 1.3;
  
  .highlight {
    color: #4a9eff;
    font-weight: 500;
  }
}


// Tooltip animations
.tooltip-enter-active,
.tooltip-leave-active {
  transition: all 0.2s ease;
}

.tooltip-enter-from {
  opacity: 0;
  transform: translate(-25px, -100%);
}

.tooltip-leave-to {
  opacity: 0;
  transform: translate(-25px, -100%);
}

.tooltip-enter-to,
.tooltip-leave-from {
  opacity: 1;
  transform: translate(-25px, -100%);
}
</style>

