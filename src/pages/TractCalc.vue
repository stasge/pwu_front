<script setup lang="ts">
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTractCalcData } from '@/composables/useTractCalcData';
import { searchTractates } from '@/utils/tractCalc';

const route = useRoute();
const router = useRouter();
const { tractates, loadData } = useTractCalcData();

const searchQuery = ref('');
const isResultsVisible = ref(false);

const searchResults = computed(() => {
  const query = searchQuery.value.trim();
  if (!query) return [];
  return searchTractates(tractates.value, query);
});

function handleSearchInput() {
  isResultsVisible.value = searchQuery.value.trim() !== '';
}

function handleSearchFocus() {
  if (searchQuery.value.trim() !== '') {
    isResultsVisible.value = true;
  }
}

function handleSearchSelect(id: string) {
  searchQuery.value = '';
  isResultsVisible.value = false;
  router.push({ name: 'tract-calculator-result', params: { id } });
}

function handleDocumentClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null;
  if (!target?.closest('.tract-calc__search')) {
    isResultsVisible.value = false;
  }
}

onMounted(async () => {
  document.addEventListener('click', handleDocumentClick);
  await loadData();

  const legacyId = route.query.id;
  if (typeof legacyId === 'string' && tractates.value[legacyId]) {
    router.replace({ name: 'tract-calculator-result', params: { id: legacyId } });
  }
});

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick);
});
</script>

<template>
  <Header />
  <div class="tract-calc">
    <section class="tract-calc__hero tract-calc__hero--home">
      <div class="tract-calc__hero-bg" aria-hidden="true" />
      <img
        src="@/assets/images/CTA-mask.png"
        class="tract-calc__hero-mask tract-calc__hero-mask--top"
        alt=""
      >

      <div class="tract-calc__hero-content">
        <h1 class="tract-calc__title">Калькулятор трактатів</h1>

        <p class="tract-calc__subtitle">
          Найповніша база знань для майстрів небесних трактатів.
        </p>

        <div class="tract-calc__search">
          <div class="tract-calc__search-field">
            <img
              src="@/assets/icons/tract-search-bg-left.svg"
              alt=""
              class="tract-calc__search-cap"
            >

            <div class="tract-calc__search-middle">
              <div class="tract-calc__search-inner">
                <img
                  src="@/assets/icons/tract-search-loupe.svg"
                  alt=""
                  class="tract-calc__search-loupe"
                >
                <input
                  v-model="searchQuery"
                  type="text"
                  class="tract-calc__search-input"
                  placeholder="Шукати за назвою або рівнем"
                  aria-label="Пошук трактатів"
                  @input="handleSearchInput"
                  @focus="handleSearchFocus"
                >
              </div>
            </div>

            <img
              src="@/assets/icons/tract-search-bg-right.svg"
              alt=""
              class="tract-calc__search-cap"
            >

            <img
              src="@/assets/icons/tract-search-arrow.svg"
              alt=""
              class="tract-calc__search-arrow"
            >
          </div>

          <div
            v-if="isResultsVisible"
            class="tract-calc__search-results"
            role="listbox"
          >
            <template v-if="searchResults.length > 0">
              <button
                v-for="result in searchResults"
                :key="result.id"
                type="button"
                class="tract-calc__search-item"
                @click="handleSearchSelect(result.id)"
              >
                <img
                  :src="result.icon"
                  :alt="result.name"
                  class="tract-calc__search-item-icon"
                  width="32"
                  height="32"
                >
                <div class="tract-calc__search-item-info">
                  <b class="tract-calc__search-item-name">{{ result.name }}</b>
                  <p
                    v-if="result.meta"
                    class="tract-calc__search-item-meta"
                  >
                    {{ result.meta }}
                  </p>
                </div>
              </button>
            </template>
            <div v-else class="tract-calc__search-empty">
              Нічого не знайдено
            </div>
          </div>
        </div>
      </div>

      <img
        src="@/assets/images/CTA-mask.png"
        class="tract-calc__hero-mask tract-calc__hero-mask--bottom"
        alt=""
      >
    </section>
  </div>
  <Footer />
</template>

<style scoped lang="scss">
.tract-calc {
  --tract-text-muted: #888;
  --tract-border-color: #333;

  width: 100%;
  color: #e0e0e0;
  text-align: center;
}

.tract-calc__hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 520px;
  padding: clamp(120px, 14vw, 180px) 20px clamp(100px, 12vw, 160px);
  overflow: hidden;

  &--home {
    min-height: calc(100vh - 80px);
    padding-top: clamp(140px, 16vw, 200px);
    padding-bottom: clamp(120px, 14vw, 180px);
  }
}

.tract-calc__hero-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: url('@/assets/images/tract-home-bg.jpg') no-repeat center / cover;
}

.tract-calc__hero-mask {
  position: absolute;
  left: -1px;
  width: calc(100% + 2px);
  height: clamp(76px, 10vw, 197px);
  z-index: 3;
  pointer-events: none;

  &--top {
    top: -1px;
  }

  &--bottom {
    bottom: -1px;
    transform: rotate(180deg);
  }
}

.tract-calc__hero-content {
  position: relative;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  gap: clamp(16px, 2.5vw, 20px);
}

.tract-calc__title {
  margin: 0;
  font-family: 'VollkornSC', sans-serif;
  font-weight: 400;
  font-size: clamp(32px, 4vw, 52px);
  line-height: 100%;
  letter-spacing: -0.07em;
  text-align: center;
  color: #f8f8f8;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  max-width: 320px;
}

.tract-calc__subtitle {
  font-family: 'Candara', sans-serif;
  margin: 0;
  font-weight: 400;
  font-size: clamp(12px, 1.5vw, 16px);
  line-height: 160%;
  letter-spacing: -0.01em;
  text-align: center;
  color: #f8f8f8;
  text-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.7);
}

.tract-calc__search {
  position: relative;
  width: 100%;
  max-width: 642px;
  margin-top: 10px;
}

.tract-calc__search-field {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.tract-calc__search-cap {
  flex-shrink: 0;
  display: block;
  width: 12px;
  height: 34px;
}

.tract-calc__search-middle {
  flex: 1;
  min-width: 0;
  max-width: 350px;
  height: 34px;
  background: url('@/assets/icons/tract-search-bg.svg') no-repeat center / cover;
}

.tract-calc__search-inner {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 100%;
  padding: 9px 0 9px 5px;
  box-sizing: border-box;
  max-width: 350px;
}

.tract-calc__search-loupe {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
}

.tract-calc__search-input {
  flex: 1;
  min-width: 0;
  border: none;
  margin: 0;
  padding: 0;
  background: transparent;
  outline: none;
  font-family: 'Candara', sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 1;
  letter-spacing: -0.01em;
  color: #f8f8f8;

  &::placeholder {
    color: rgba(248, 248, 248, 0.55);
  }
}

.tract-calc__search-arrow {
  flex-shrink: 0;
  width: 22px;
  height: 32px;
  margin-left: 4px;
}

.tract-calc__search-results {
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  z-index: 10;
  width: 100%;
  max-width: 500px;
  max-height: 230px;
  overflow-y: auto;
  padding-right: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  backdrop-filter: blur(70px);
  background: rgba(0, 0, 0, 0.5);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  transform: translateX(-50%);
  text-align: left;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.5) rgba(248, 248, 248, 0.05);

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    margin: 8px 0;
    background: rgba(248, 248, 248, 0.05);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb {
    background: #f8f8f8;
    border-radius: 2px;

    &:hover {
      background: #f8f8f8;
    }
  }
}

.tract-calc__search-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  border: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s;

  &:last-child {
    border-bottom: 0;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
}

.tract-calc__search-item-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.tract-calc__search-item-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.tract-calc__search-item-name {
  display: block;
  color: #fff;
  font-family: 'Candara', sans-serif;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.2;
}

.tract-calc__search-item-meta {
  margin: 0;
  font-family: 'Candara', sans-serif;
  font-size: 13px;
  line-height: 150%;
  letter-spacing: -0.01em;
  color: rgba(248, 248, 248, 0.75);
}

.tract-calc__search-empty {
  padding: 16px;
  color: var(--tract-text-muted);
}
</style>
