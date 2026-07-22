export const MATCHDAY_EVENT = {
  id: 'matchday-2026',
  name: 'Matchday Deployment',
  startsAt: Date.parse('2026-07-15T00:00:00-04:00'),
  endsAt: Date.parse('2026-07-20T00:00:00-04:00'),
  burstCapacity: 6,
  cooldownMs: 12 * 60 * 1000,
  drops: [
    { itemId: 'touchline_log', weight: 72 },
    { itemId: 'fixture_json', weight: 17 },
    { itemId: 'typo', weight: 7 },
    { itemId: 'warning', weight: 4 }
  ]
} as const;

export const MATCHDAY_REDEMPTION = {
  itemId: 'championship_dashboard',
  energy: 50,
  credits: 500
} as const;

export const MATCHDAY_CASHOUT_CREDITS = [0,10,25,60,140,300,500] as const;
