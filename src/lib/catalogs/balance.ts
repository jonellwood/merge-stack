export const BALANCE = {
  columns: 7, rows: 9, initialUnlocked: 42, startingEnergy: 100, maxEnergy: 100,
  startingCredits: 100, energyRegenMs: 120_000, mergeXpMultiplier: 2,
  xpPerLevel: 100, activeTickets: 3,
  energyShopBaseCost: 200, energyShopWindowMs: 6*60*60*1000, energyShopBoardDiscount: 0.5,
  tidyBoardCost: 250
} as const;
