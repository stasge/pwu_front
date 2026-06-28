import type {
  MaterialTotals,
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

export function buildPyramidLevels(
  tractates: Record<string, Tractate>,
  id: string,
): PyramidLevel[] {
  const counts = collectCounts(tractates, id);
  const levels: Record<number, PyramidItem[]> = {};

  Object.entries(counts).forEach(([tractateId, count]) => {
    const tractate = tractates[tractateId];
    if (!tractate) return;

    const level = tractate.level || 0;
    if (!levels[level]) levels[level] = [];

    levels[level].push({
      id: tractateId,
      name: tractate.name,
      count,
      description: tractate._description?.plain_text || '',
      icon: getTractateIcon(tractate, tractateId),
    });
  });

  return Object.keys(levels)
    .map(Number)
    .sort((a, b) => b - a)
    .map((level) => ({
      level,
      items: levels[level],
    }));
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
