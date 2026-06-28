import { ref } from 'vue';
import type { TractCalcData, Tractate } from '@/types/tractCalc';

let tractatesCache: Record<string, Tractate> | null = null;
let loadPromise: Promise<void> | null = null;

export function useTractCalcData() {
  const tractates = ref<Record<string, Tractate>>({});
  const isDataLoaded = ref(false);

  async function loadData() {
    if (tractatesCache) {
      tractates.value = tractatesCache;
      isDataLoaded.value = true;
      return;
    }

    if (!loadPromise) {
      loadPromise = (async () => {
        try {
          const response = await fetch('/tract-calc/data.json');
          if (!response.ok) throw new Error('Network response was not ok');
          const data: TractCalcData = await response.json();
          tractatesCache = data.tractates;
        } catch (error) {
          console.warn('Failed to load tract calc data:', error);
          tractatesCache = {};
        }
      })();
    }

    await loadPromise;
    tractates.value = tractatesCache ?? {};
    isDataLoaded.value = true;
  }

  return {
    tractates,
    isDataLoaded,
    loadData,
  };
}
