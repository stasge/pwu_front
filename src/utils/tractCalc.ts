import type {
  MaterialTotals,
  OwnedCounts,
  PyramidItem,
  PyramidLevel,
  SearchResult,
  Tractate,
  TractateMaterial,
} from '@/types/tractCalc';

const FRAGMENT_ITEM_ID = '17810';
const PAGE_ITEM_ID = '18185';

export function resolveIconPath(icon?: string, id?: string): string {
  if (icon) {
    if (icon.startsWith('iconset/') || icon.startsWith('images/')) {
      return `/tract-calc/${icon}`;
    }
    return icon;
  }

  if (id) {
    return `/tract-calc/images/${id}.png`;
  }

  return '';
}

export function getTractateIcon(tractate?: Tractate, id?: string): string {
  return resolveIconPath(tractate?._icons?.[0], id);
}

export function getMaterials(tractate?: Tractate): TractateMaterial[] {
  if (!tractate) return [];

  if (tractate.craft) {
    return tractate.craft.map((itemId) => ({ item_id: itemId, value: 1 }));
  }

  if (tractate._recipes?.[0]?.materials) {
    return tractate._recipes[0].materials;
  }

  return [];
}

export function countAll(
  tractates: Record<string, Tractate>,
  id: string,
): MaterialTotals {
  const tractate = tractates[id];
  if (!tractate) return { fragments: 0, pages: 0 };

  const materials = getMaterials(tractate);
  if (materials.length === 0) {
    return { fragments: 0, pages: 0 };
  }

  const result: MaterialTotals = { fragments: 0, pages: 0 };

  materials.forEach((material) => {
    const childId = material.item_id;
    const count = material.value || 1;

    if (childId === FRAGMENT_ITEM_ID) {
      result.fragments += count;
      return;
    }

    if (childId === PAGE_ITEM_ID) {
      result.pages += count;
      return;
    }

    if (tractates[childId]) {
      const childResult = countAll(tractates, childId);
      result.fragments += childResult.fragments * count;
      result.pages += childResult.pages * count;
    }
  });

  return result;
}

export function collectCounts(
  tractates: Record<string, Tractate>,
  id: string,
  counts: Record<string, number> = {},
  multiplier = 1,
): Record<string, number> {
  const tractate = tractates[id];
  if (!tractate) return counts;

  const materials = getMaterials(tractate);
  if (materials.length === 0) return counts;

  materials.forEach((material) => {
    const childId = material.item_id;
    const count = (material.value || 1) * multiplier;

    if (childId === FRAGMENT_ITEM_ID || childId === PAGE_ITEM_ID) {
      return;
    }

    counts[childId] = (counts[childId] || 0) + count;
    collectCounts(tractates, childId, counts, count);
  });

  return counts;
}

export interface RemainingRequirements {
  counts: Record<string, number>;
  fragments: number;
  pages: number;
}

function processRemainingRequirements(
  tractates: Record<string, Tractate>,
  id: string,
  inventory: OwnedCounts,
  multiplier: number,
  counts: Record<string, number>,
  totals: MaterialTotals,
): void {
  const tractate = tractates[id];
  if (!tractate) return;

  const materials = getMaterials(tractate);
  if (materials.length === 0) return;

  materials.forEach((material) => {
    const childId = material.item_id;
    const need = (material.value || 1) * multiplier;

    if (childId === FRAGMENT_ITEM_ID) {
      totals.fragments += need;
      return;
    }

    if (childId === PAGE_ITEM_ID) {
      totals.pages += need;
      return;
    }

    if (!tractates[childId]) return;

    const available = inventory[childId] || 0;
    const useOwned = Math.min(available, need);
    inventory[childId] = available - useOwned;
    const stillNeed = need - useOwned;

    if (stillNeed > 0) {
      counts[childId] = (counts[childId] || 0) + stillNeed;
      processRemainingRequirements(
        tractates,
        childId,
        inventory,
        stillNeed,
        counts,
        totals,
      );
    }
  });
}

export function computeRemainingRequirements(
  tractates: Record<string, Tractate>,
  id: string,
  ownedCounts: OwnedCounts = {},
): RemainingRequirements {
  const inventory = { ...ownedCounts };
  const counts: Record<string, number> = {};
  const totals: MaterialTotals = { fragments: 0, pages: 0 };

  processRemainingRequirements(tractates, id, inventory, 1, counts, totals);

  return { counts, ...totals };
}

function buildPyramidItemsFromCounts(
  tractates: Record<string, Tractate>,
  remainingCounts: Record<string, number>,
  totalCounts: Record<string, number>,
  ownedCounts: OwnedCounts,
): PyramidLevel[] {
  const levels: Record<number, PyramidItem[]> = {};
  const tractateIds = new Set([
    ...Object.keys(totalCounts),
    ...Object.keys(remainingCounts),
  ]);

  tractateIds.forEach((tractateId) => {
    const tractate = tractates[tractateId];
    if (!tractate) return;

    const totalCount = totalCounts[tractateId] || 0;
    const remainingCount = remainingCounts[tractateId] || 0;
    const ownedCount = Math.min(ownedCounts[tractateId] || 0, totalCount);

    if (totalCount === 0) return;

    const level = tractate.level || 0;
    if (!levels[level]) levels[level] = [];

    levels[level].push({
      id: tractateId,
      name: tractate.name,
      count: remainingCount,
      totalCount,
      ownedCount,
      description: tractate._description?.plain_text || '',
      icon: getTractateIcon(tractate, tractateId),
    });
  });

  return Object.keys(levels)
    .map(Number)
    .sort((a, b) => b - a)
    .map((level) => ({
      level,
      items: levels[level].sort((a, b) => a.name.localeCompare(b.name, 'uk')),
    }));
}

export function buildPyramidLevels(
  tractates: Record<string, Tractate>,
  id: string,
  ownedCounts: OwnedCounts = {},
): PyramidLevel[] {
  const totalCounts = collectCounts(tractates, id);
  const { counts: remainingCounts } = computeRemainingRequirements(
    tractates,
    id,
    ownedCounts,
  );

  return buildPyramidItemsFromCounts(
    tractates,
    remainingCounts,
    totalCounts,
    ownedCounts,
  );
}

export function formatTractateMeta(level?: number, plainText?: string): string {
  const parts: string[] = [];

  if (level != null) {
    parts.push(`Рівень ${level}`);
  }

  if (plainText) {
    parts.push(
      ...plainText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
    );
  }

  return parts.join(' • ');
}

export function searchTractates(
  tractates: Record<string, Tractate>,
  query: string,
): SearchResult[] {
  const normalizedQuery = query.toLowerCase();

  return Object.entries(tractates)
    .filter(([, tractate]) => {
      const nameMatch = tractate.name.toLowerCase().includes(normalizedQuery);
      const description = tractate._description?.plain_text || '';
      const descMatch = description.toLowerCase().includes(normalizedQuery);
      const levelMatch = String(tractate.level) === normalizedQuery;

      return nameMatch || descMatch || levelMatch;
    })
    .map(([id, tractate]) => {
      const description = tractate._description?.plain_text || '';

      return {
        id,
        name: tractate.name,
        level: tractate.level,
        description,
        meta: formatTractateMeta(tractate.level, description),
        icon: getTractateIcon(tractate, id),
      };
    });
}
