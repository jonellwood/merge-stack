export const HACKATHON_EVENT = {
  id: 'hackathon-2026',
  name: 'Hackathon Weekend',
  startsAt: Date.parse('2026-07-23T18:00:00-04:00'),
  endsAt: Date.parse('2026-07-26T23:59:00-04:00'),
  burstCapacity: 8,
  cooldownMs: 10 * 60 * 1000,
  drops: [
    { itemId: 'energy_drink', weight: 72 },
    { itemId: 'sticky_note', weight: 17 },
    { itemId: 'typo', weight: 7 },
    { itemId: 'warning', weight: 4 }
  ]
} as const;

export const HACKATHON_REDEMPTION = {
  itemId: 'winning_hack',
  energy: 50,
  credits: 500
} as const;

export const HACKATHON_CASHOUT_CREDITS = [0,10,25,60,140,300,500] as const;
