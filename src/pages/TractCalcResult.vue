<script setup lang="ts">
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTractCalcData } from '@/composables/useTractCalcData';
import type { PyramidItem } from '@/types/tractCalc';
import {
  buildPyramidLevels,
  computeRemainingRequirements,
  formatTractateMeta,
  getTractateIcon,
} from '@/utils/tractCalc';
import { useTractCalcInventory } from '@/composables/useTractCalcInventory';

const route = useRoute();
const router = useRouter();
const { tractates, isDataLoaded, loadData } = useTractCalcData();
const { ownedCounts, adjustOwned, toggleOwned, clearInventory } = useTractCalcInventory();

const collapsedSections = ref<Set<string | number>>(new Set());

const tractateId = computed(() => String(route.params.id ?? ''));

const currentTractate = computed(() =>
  tractateId.value ? tractates.value[tractateId.value] : null,
);

const tractateMeta = computed(() => {
  if (!currentTractate.value) return '';
  return formatTractateMeta(
    currentTractate.value.level,
    currentTractate.value._description?.plain_text,
  );
});

const pyramidLevels = computed(() => {
  if (!tractateId.value || !currentTractate.value) return [];
  return buildPyramidLevels(
    tractates.value,
    tractateId.value,
    ownedCounts.value,
  );
});

const materialTotals = computed(() => {
  if (!tractateId.value || !currentTractate.value) {
    return { fragments: 0, pages: 0 };
  }
  return computeRemainingRequirements(
    tractates.value,
    tractateId.value,
    ownedCounts.value,
  );
});

const fullMaterialTotals = computed(() => {
  if (!tractateId.value || !currentTractate.value) {
    return { fragments: 0, pages: 0 };
  }
  return computeRemainingRequirements(tractates.value, tractateId.value);
});

const hasOwnedTractates = computed(() =>
  Object.values(ownedCounts.value).some((count) => count > 0),
);

const materialItems = computed<PyramidItem[]>(() => {
  const items: PyramidItem[] = [];

  if (materialTotals.value.fragments > 0) {
    items.push({
      id: 'fragment',
      name: 'Уривок небесної сторінки',
      count: materialTotals.value.fragments,
      totalCount: fullMaterialTotals.value.fragments,
      ownedCount: 0,
      description: '',
      icon: '/tract-calc/iconset/m/灵魂图腾.webp',
    });
  }

  if (materialTotals.value.pages > 0) {
    items.push({
      id: 'page',
      name: 'Небесна сторінка',
      count: materialTotals.value.pages,
      totalCount: fullMaterialTotals.value.pages,
      ownedCount: 0,
      description: '',
      icon: '/tract-calc/iconset/m/天书_无字天书.webp',
    });
  }

  return items;
});

const hasMaterialsRow = computed(() => materialItems.value.length > 0);

function isCollapsed(sectionKey: string | number) {
  return collapsedSections.value.has(sectionKey);
}

function toggleSection(sectionKey: string | number) {
  const next = new Set(collapsedSections.value);

  if (next.has(sectionKey)) {
    next.delete(sectionKey);
  } else {
    next.add(sectionKey);
  }

  collapsedSections.value = next;
}

function goBack() {
  router.back();
}

function selectTractate(id: string) {
  if (!tractates.value[id]) return;
  router.push({ name: 'tract-calculator-result', params: { id } });
}

function onToggleOwned(item: PyramidItem, event: Event) {
  event.stopPropagation();
  toggleOwned(item.id, item.totalCount);
}

function onAdjustOwned(item: PyramidItem, delta: number, event: Event) {
  event.stopPropagation();
  adjustOwned(item.id, delta, item.totalCount);
}

function redirectIfInvalid() {
  if (!isDataLoaded.value) return;

  if (!tractateId.value || !tractates.value[tractateId.value]) {
    router.replace({ name: 'tract-calculator' });
  }
}

onMounted(async () => {
  await loadData();
  redirectIfInvalid();
});

watch([tractateId, isDataLoaded], () => {
  redirectIfInvalid();
});
</script>

<template>
  <Header />
  <div class="tract-result">
    <div class="tract-result__bg" aria-hidden="true" />

    <div class="tract-result__inner">
      <button
        type="button"
        class="tract-result__back"
        @click="goBack"
      >
        <img class="tract-result__back-icon" src="@/assets/icons/back-arrow.svg" alt="" width="16" height="16">
        Назад
      </button>

      <template v-if="currentTractate">
        <header class="tract-result__header">
          <img
            class="tract-result__header-icon"
            :src="getTractateIcon(currentTractate, tractateId)"
            :alt="currentTractate.name"
            width="64"
            height="64"
          >

          <div class="tract-result__header-text">
            <h1 class="tract-result__title">{{ currentTractate.name }}</h1>
            <p v-if="tractateMeta" class="tract-result__meta">
              {{ tractateMeta }}
            </p>
            <p class="tract-result__hint">
              Позначте вже готові трактати — калькулятор автоматично перерахує, скільки ще потрібно зібрати.
            </p>
          </div>
        </header>

        <div
          v-if="hasOwnedTractates"
          class="tract-result__inventory-actions"
        >
          <button
            type="button"
            class="tract-result__inventory-reset"
            @click="clearInventory"
          >
            Скинути позначені трактати
          </button>
        </div>

        <div class="tract-result__levels">
          <section
            v-for="level in pyramidLevels"
            :key="level.level"
            class="tract-result__row"
            :class="[
              `tract-result__row--level-${level.level}`,
              { 'tract-result__row--collapsed': isCollapsed(level.level) },
            ]"
          >
            <button
              type="button"
              class="tract-result__row-toggle"
              :aria-expanded="!isCollapsed(level.level)"
              @click="toggleSection(level.level)"
            >
              <span class="tract-result__row-arrow-wrap">
                <img
                  src="@/assets/icons/dropdown-arrow.svg"
                  alt=""
                  class="tract-result__row-arrow"
                  :class="{ 'tract-result__row-arrow--collapsed': isCollapsed(level.level) }"
                >
              </span>
              <span class="tract-result__row-label">Рівень {{ level.level }}:</span>
            </button>

            <div
              class="tract-result__row-collapse"
              :class="{ 'tract-result__row-collapse--collapsed': isCollapsed(level.level) }"
            >
              <div class="tract-result__row-collapse-inner">
                <div class="tract-result__row-content">
                  <article
                    v-for="item in level.items"
                    :key="item.id"
                    class="tract-result__card"
                    :class="{
                      'tract-result__card--owned': item.ownedCount > 0,
                      'tract-result__card--complete': item.count === 0,
                    }"
                  >
                    <button
                      type="button"
                      class="tract-result__card-main"
                      @click="selectTractate(item.id)"
                    >
                      <div class="tract-result__card-top">
                        <img
                          :src="item.icon"
                          :alt="item.name"
                          class="tract-result__card-icon"
                          width="40"
                          height="40"
                        >
                        <span class="tract-result__card-count">
                          <template v-if="item.count === 0">Готово</template>
                          <template v-else>x{{ item.count }}</template>
                        </span>
                      </div>
                      <span class="tract-result__card-name">{{ item.name }}</span>
                    </button>

                    <div class="tract-result__card-owned">
                      <template v-if="item.totalCount === 1">
                        <label class="tract-result__owned-toggle">
                          <input
                            type="checkbox"
                            class="tract-result__owned-checkbox"
                            :checked="item.ownedCount > 0"
                            @change="onToggleOwned(item, $event)"
                          >
                          <span class="tract-result__owned-label">Вже є</span>
                        </label>
                      </template>
                      <template v-else>
                        <span class="tract-result__owned-label">Є:</span>
                        <div class="tract-result__owned-stepper">
                          <button
                            type="button"
                            class="tract-result__owned-step"
                            :disabled="item.ownedCount <= 0"
                            aria-label="Зменшити кількість готових"
                            @click="onAdjustOwned(item, -1, $event)"
                          >
                            −
                          </button>
                          <span class="tract-result__owned-value">
                            {{ item.ownedCount }}
                          </span>
                          <button
                            type="button"
                            class="tract-result__owned-step"
                            :disabled="item.ownedCount >= item.totalCount"
                            aria-label="Збільшити кількість готових"
                            @click="onAdjustOwned(item, 1, $event)"
                          >
                            +
                          </button>
                        </div>
                      </template>
                    </div>
                  </article>
                </div>
              </div>
            </div>
          </section>

          <section
            v-if="hasMaterialsRow"
            class="tract-result__row tract-result__row--materials"
            :class="{ 'tract-result__row--collapsed': isCollapsed('materials') }"
          >
            <button
              type="button"
              class="tract-result__row-toggle"
              :aria-expanded="!isCollapsed('materials')"
              @click="toggleSection('materials')"
            >
              <span class="tract-result__row-arrow-wrap">
                <img
                  src="@/assets/icons/dropdown-arrow.svg"
                  alt=""
                  class="tract-result__row-arrow"
                  :class="{ 'tract-result__row-arrow--collapsed': isCollapsed('materials') }"
                >
              </span>
              <span class="tract-result__row-label">Сторінки:</span>
            </button>

            <div
              class="tract-result__row-collapse"
              :class="{ 'tract-result__row-collapse--collapsed': isCollapsed('materials') }"
            >
              <div class="tract-result__row-collapse-inner">
                <div class="tract-result__row-content">
                  <div
                    v-for="item in materialItems"
                    :key="item.id"
                    class="tract-result__card tract-result__card--static"
                  >
                    <div class="tract-result__card-top">
                      <img
                        :src="item.icon"
                        :alt="item.name"
                        class="tract-result__card-icon"
                        width="40"
                        height="40"
                      >
                      <span class="tract-result__card-count">x{{ item.count }}</span>
                    </div>
                    <span class="tract-result__card-name">{{ item.name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </template>
    </div>
  </div>
  <Footer />
</template>

<style scoped lang="scss">
.tract-result {
  position: relative;
  width: 100%;
  min-height: calc(100vh - 80px);
  color: #f8f8f8;
}

.tract-result__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: url('@/assets/images/tract-results-bg.jpg') no-repeat center top / cover;
}

.tract-result__inner {
  position: relative;
  z-index: 1;
  max-width: 1320px;
  margin: 0 auto;
  padding: clamp(110px, 12vw, 190px) clamp(16px, 4vw, 40px) 60px;
}

.tract-result__back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: clamp(14px, 4vw, 20px);
  padding: 0;
  border: 0;
  background: transparent;
  color: #f8f8f8;
  font-family: 'Candara', sans-serif;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  opacity: 0.85;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
}

.tract-result__back-icon {
  font-size: 18px;
  line-height: 1;
}

.tract-result__header {
  display: flex;
  align-items: flex-start;
  gap: clamp(16px, 3vw, 28px);
  margin-bottom: clamp(18px, 5vw, 30px);
  text-align: left;
}

.tract-result__header-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.tract-result__header-text {
  min-width: 0;
}

.tract-result__title {
  margin: 0 0 10px;
  font-family: 'VollkornSC', sans-serif;
  font-weight: 400;
  font-size: 40px;
  line-height: 1;
  letter-spacing: -0.07em;
  background: linear-gradient(180deg, #f8f8f8 0%, #fadfae 70%, #fbd298 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.7);
}

.tract-result__meta {
  margin: 0;
  font-family: 'Candara', sans-serif;
  font-size: clamp(14px, 1.6vw, 18px);
  line-height: 150%;
  letter-spacing: -0.01em;
  color: rgba(248, 248, 248, 0.85);
}

.tract-result__hint {
  margin: 10px 0 0;
  max-width: 720px;
  font-family: 'Candara', sans-serif;
  font-size: 14px;
  line-height: 150%;
  color: rgba(248, 248, 248, 0.65);
}

.tract-result__inventory-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.tract-result__inventory-reset {
  padding: 8px 14px;
  border: 1px solid rgba(248, 248, 248, 0.25);
  border-radius: 8px;
  background: rgba(248, 248, 248, 0.08);
  color: rgba(248, 248, 248, 0.85);
  font-family: 'Candara', sans-serif;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;

  &:hover {
    background: rgba(248, 248, 248, 0.14);
    border-color: rgba(248, 248, 248, 0.4);
  }
}

.tract-result__levels {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.tract-result__row {
  width: 100%;
  padding: 15px clamp(12px, 3vw, 20px) 15px;
  text-align: left;

  &--level-5 {
    background: linear-gradient(to top, rgba(253, 220, 103, 0.15), transparent);
    border-bottom: 1px solid #fddc67;
  }

  &--level-4 {
    background: linear-gradient(to top, rgba(176, 108, 255, 0.15), transparent);
    border-bottom: 1px solid #b06cff;
  }

  &--level-3 {
    background: linear-gradient(to top, rgba(77, 166, 255, 0.15), transparent);
    border-bottom: 1px solid #4da6ff;
  }

  &--level-2 {
    background: linear-gradient(to top, rgba(99, 209, 110, 0.15), transparent);
    border-bottom: 1px solid #63d16e;
  }

  &--level-1 {
    background: linear-gradient(to top, rgba(167, 167, 167, 0.15), transparent);
    border-bottom: 1px solid #a7a7a7;
  }

  &--materials {
    background: linear-gradient(to top, rgba(248, 248, 248, 0.08), transparent);
    border-bottom: 1px solid rgba(248, 248, 248, 0.25);
  }
}

.tract-result__row-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  margin-bottom: 15px;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  text-align: left;
  transition: margin-bottom 0.35s ease;
}

.tract-result__row--collapsed .tract-result__row-toggle {
  margin-bottom: 0;
}

.tract-result__row-arrow-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 99px;
  background: rgba(248, 248, 248, 0.1);
  box-sizing: content-box;
}

.tract-result__row-arrow {
  display: block;
  width: 12px;
  height: 12px;
  transition: transform 0.35s ease;

  &--collapsed {
    transform: rotate(180deg);
  }
}

.tract-result__row-collapse {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows 0.35s ease;

  &--collapsed {
    grid-template-rows: 0fr;
  }
}

.tract-result__row-collapse-inner {
  overflow: hidden;
  min-height: 0;
}

.tract-result__row-label {
  font-family: 'Candara', sans-serif;
  font-size: clamp(16px, 1.8vw, 20px);
  font-weight: 400;
  line-height: 1.2;
  color: #f8f8f8;
}

.tract-result__row-content {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.tract-result__card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border: 1px solid transparent;
  border-radius: 10px;
  backdrop-filter: blur(10px);
  background: rgba(248, 248, 248, 0.2);
  color: inherit;
  text-align: left;
  transition: background 0.2s ease, border-color 0.2s ease;
  box-sizing: border-box;
  width: 130px;
  max-width: 130px;
  min-width: 0;
  overflow: hidden;

  &--owned {
    border-color: rgba(99, 209, 110, 0.45);
    background: rgba(99, 209, 110, 0.12);
  }

  &--complete {
    opacity: 0.72;
  }

  &--static {
    cursor: default;

    &:hover {
      transform: none;
    }
  }
}

.tract-result__card-main {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  text-align: left;

  &:hover {
    opacity: 0.9;
  }
}

.tract-result__card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.tract-result__card-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.tract-result__card-count {
  font-family: 'Candara', sans-serif;
  font-size: 14px;
  line-height: 1;
  color: rgba(248, 248, 248, 0.9);
  white-space: nowrap;
}

.tract-result__card-name {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  font-family: 'Candara', sans-serif;
  font-size: 13px;
  line-height: 1.3;
  color: rgba(248, 248, 248, 0.85);
  word-break: break-all;
}

.tract-result__card-owned {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 22px;
}

.tract-result__owned-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
}

.tract-result__owned-checkbox {
  width: 14px;
  height: 14px;
  margin: 0;
  accent-color: #63d16e;
  cursor: pointer;
}

.tract-result__owned-label {
  font-family: 'Candara', sans-serif;
  font-size: 12px;
  line-height: 1;
  color: rgba(248, 248, 248, 0.75);
}

.tract-result__owned-stepper {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.tract-result__owned-step {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  border: 1px solid rgba(248, 248, 248, 0.25);
  border-radius: 4px;
  background: rgba(248, 248, 248, 0.08);
  color: rgba(248, 248, 248, 0.9);
  font-family: 'Candara', sans-serif;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    background: rgba(248, 248, 248, 0.16);
  }
}

.tract-result__owned-value {
  min-width: 20px;
  font-family: 'Candara', sans-serif;
  font-size: 12px;
  line-height: 1;
  text-align: center;
  color: rgba(248, 248, 248, 0.85);
}
</style>
