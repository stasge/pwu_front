import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { fetchGet, fetchPost } from '@/utils/fetchApi'
import { useUserStore } from '@/stores/userStore'
import type { PollSummary } from '@/models/poll'

const VIEWED_STORAGE_PREFIX = 'pollsViewed:'

/** Лічильник нових (ще не відкритих) активних опитувань для авторизованого користувача */
export const usePollsStore = defineStore('pollsStore', () => {
  const userStore = useUserStore()
  const unreadCount = ref(0)
  /** Опитування, відкриті на цьому пристрої (поки бекенд не віддає isViewed у списку) */
  const viewedIds = ref(new Set<number>())

  const storageKey = () => userStore.user?.id ? `${VIEWED_STORAGE_PREFIX}${userStore.user.id}` : null

  function readViewed() {
    const key = storageKey()
    let ids: number[] = []
    try {
      if (key) ids = JSON.parse(localStorage.getItem(key) ?? '[]')
    } catch {
      ids = []
    }
    viewedIds.value = new Set(Array.isArray(ids) ? ids : [])
  }

  function rememberViewed(id: number) {
    if (viewedIds.value.has(id)) return
    viewedIds.value = new Set(viewedIds.value).add(id)
    const key = storageKey()
    try {
      if (key) localStorage.setItem(key, JSON.stringify([...viewedIds.value]))
    } catch {
      // localStorage недоступний — маркер просто не збережеться між сесіями
    }
  }

  watch(() => userStore.user?.id, readViewed, { immediate: true })

  /** Чи показувати маркер «Нове» на картці опитування */
  function isNew(poll: PollSummary) {
    if (poll.status !== 'active') return false
    if (poll.isViewed !== undefined) return !poll.isViewed
    return unreadCount.value > 0 && !viewedIds.value.has(poll.id)
  }

  async function loadUnreadCount() {
    try {
      const { data } = await fetchGet('polls/unreadCount')
      unreadCount.value = Number(data) || 0
    } catch {
      // 401/403 (не авторизований, не верифікований, бан) — просто не показуємо маркер
      unreadCount.value = 0
    }
  }

  async function markViewed(id: number) {
    rememberViewed(id)
    try {
      await fetchPost('polls/view', { id })
    } finally {
      await loadUnreadCount()
    }
  }

  function reset() {
    unreadCount.value = 0
  }

  return { unreadCount, loadUnreadCount, markViewed, isNew, reset }
})
