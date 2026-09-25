export interface GoldTotalsSummary {
  rawGold: number;
  bonusGold: number;
  adjustedGold: number;
  transactions: number;
  bonusTransactions: number;
}

export interface GoldAccountTotal extends GoldTotalsSummary {
  game_id: number;
}

export interface GoldTotals {
  from?: string;
  to?: string;
  accounts: GoldAccountTotal[];
  total: GoldTotalsSummary;
}

export interface GoldTotalRange {
  from?: string;
  to?: string;
}
