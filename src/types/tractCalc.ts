export interface TractateMaterial {
  item_id: string;
  value?: number;
}

export interface TractateRecipe {
  materials: TractateMaterial[];
}

export interface Tractate {
  _id: number;
  name: string;
  level?: number;
  craft?: string[];
  _description?: {
    description?: string;
    plain_text?: string;
  };
  _icons?: string[];
  _recipes?: TractateRecipe[];
  visible?: boolean;
}

export interface TractCalcData {
  tractates: Record<string, Tractate>;
}

export interface MaterialTotals {
  fragments: number;
  pages: number;
}

export interface PyramidItem {
  id: string;
  name: string;
  count: number;
  description: string;
  icon: string;
}

export interface PyramidLevel {
  level: number;
  items: PyramidItem[];
}

export interface SearchResult {
  id: string;
  name: string;
  level?: number;
  description: string;
  meta: string;
  icon: string;
}
