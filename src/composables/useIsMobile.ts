import { onBeforeUnmount, onMounted, ref } from 'vue';

/** true, коли ширина вікна менша за 768px (мобільна верстка). */
export function useIsMobile() {
    const query = window.matchMedia('(max-width: 767px)')
    const isMobile = ref(query.matches)
    const update = (e: MediaQueryListEvent) => {
        isMobile.value = e.matches
    }

    onMounted(() => query.addEventListener('change', update))
    onBeforeUnmount(() => query.removeEventListener('change', update))

    return isMobile
}
