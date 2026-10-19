export type ActivityRewardKind = 'exp' | 'spirit' | 'book' | 'gold' | 'reputation' | 'stone'

export interface ActivityRewardItem {
    kind: ActivityRewardKind;
    name: string;
    amount: number;
}

export interface ActivityRewardTier {
    minLevel: number;
    items: ActivityRewardItem[];
}

const exp = (amount: number): ActivityRewardItem => ({ kind: 'exp', name: 'Досвід', amount })
const spirit = (amount: number): ActivityRewardItem => ({ kind: 'spirit', name: 'Дух', amount })
const book = (amount: number): ActivityRewardItem => ({ kind: 'book', name: 'Книга +50% досвіду', amount })
const gold = (amount: number): ActivityRewardItem => ({ kind: 'gold', name: 'Голд ярмарки', amount })
const reputation = (amount: number): ActivityRewardItem => ({ kind: 'reputation', name: 'Репутація', amount })
const stone = (amount: number): ActivityRewardItem => ({ kind: 'stone', name: 'Камінь безсмертних', amount })

/** Нагороди за виконання щоденних активностей залежно від рівня персонажа (за зростанням minLevel). */
export const ACTIVITY_REWARD_TIERS: ActivityRewardTier[] = [
    { minLevel: 30, items: [exp(10000), spirit(3000), book(1), gold(2)] },
    { minLevel: 40, items: [exp(20000), spirit(5000), book(1), gold(2)] },
    { minLevel: 50, items: [exp(30000), spirit(7000), book(1), gold(2)] },
    { minLevel: 60, items: [exp(40000), spirit(9000), book(1), gold(2)] },
    { minLevel: 70, items: [exp(50000), spirit(12000), reputation(10), gold(3), stone(5)] },
    { minLevel: 80, items: [exp(60000), spirit(15000), reputation(15), gold(3), stone(8)] },
    { minLevel: 90, items: [exp(70000), spirit(20000), reputation(20), gold(4), stone(10)] },
    { minLevel: 100, items: [exp(90000), spirit(25000), reputation(30), gold(5), stone(15)] },
]

/** Найвищий рівень нагород, доступний персонажу; null — якщо рівень нижчий за мінімальний. */
export const getActivityRewardTier = (lvl: number): ActivityRewardTier | null =>
    [...ACTIVITY_REWARD_TIERS].reverse().find(tier => lvl >= tier.minLevel) ?? null
