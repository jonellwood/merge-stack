export const BALANCE = {
  columns: 7, rows: 9, initialUnlocked: 42, startingEnergy: 100, maxEnergy: 100,
  startingCredits: 100, energyRegenMs: 120_000, producerCost: 1, mergeXpMultiplier: 2,
  xpPerLevel: 100, activeTickets: 3,
  drops: [{ itemId:'character', weight:70 }, { itemId:'string', weight:15 }, { itemId:'typo', weight:10 }, { itemId:'warning', weight:5 }]
} as const;
