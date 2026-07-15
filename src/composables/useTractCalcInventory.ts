import type { OwnedCounts } from '@/types/tractCalc';
import { ref, watch } from 'vue';

const STORAGE_KEY = 'tract-calc-owned-inventory';

function loadInventory(): OwnedCounts {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};

    return Object.fromEntries(
      Object.entries(parsed).filter(
        ([, value]) => typeof value === 'number' && value > 0,
      ),
    );
  } catch {
    return {};
  }
}

function saveInventory(inventory: OwnedCounts) {
  if (typeof window === 'undefined') return;

  const normalized = Object.fromEntries(
    Object.entries(inventory).filter(([, value]) => value > 0),
  );

  if (Object.keys(normalized).length === 0) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
}

const ownedCounts = ref<OwnedCounts>(loadInventory());

let isInitialized = false;

function ensureInitialized() {
  if (isInitialized) return;
  isInitialized = true;

  watch(
    ownedCounts,
    (value) => {
      saveInventory(value);
    },
    { deep: true },
  );
}

export function useTractCalcInventory() {
  ensureInitialized();

  function getOwned(id: string): number {
    return ownedCounts.value[id] || 0;
  }

  function setOwned(id: string, count: number) {
    const next = { ...ownedCounts.value };

    if (count <= 0) {
      delete next[id];
    } else {
      next[id] = count;
    }

    ownedCounts.value = next;
  }

  function adjustOwned(id: string, delta: number, max = Number.POSITIVE_INFINITY) {
    const current = getOwned(id);
    const next = Math.min(Math.max(0, current + delta), max);
    setOwned(id, next);
  }

  function toggleOwned(id: string, max: number) {
    const current = getOwned(id);
    setOwned(id, current > 0 ? 0 : Math.min(1, max));
  }

  function clearInventory() {
    ownedCounts.value = {};
  }

  return {
    ownedCounts,
    getOwned,
    setOwned,
    adjustOwned,
    toggleOwned,
    clearInventory,
  };
}
