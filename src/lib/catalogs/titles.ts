export interface TitleTier {
  minLevel: number;
  name: string;
  shortName?: string;
  shopFlavor: string;
}

export const TITLE_TIERS: TitleTier[] = [
  { minLevel: 1, name: 'Intern', shopFlavor: 'Approved for one (1) coffee.' },
  { minLevel: 5, name: 'Code Monkey', shopFlavor: 'Banana allowance included.' },
  { minLevel: 10, name: 'Script Kiddie', shopFlavor: 'No questions asked. Yet.' },
  { minLevel: 15, name: 'Copy-Paste Engineer', shopFlavor: 'Stack Overflow premium tier.' },
  { minLevel: 20, name: 'Feature Factory', shopFlavor: 'Ship it. We will fix it later.' },
  { minLevel: 25, name: 'Sprint Survivor', shopFlavor: 'You look like you need this.' },
  { minLevel: 30, name: '10x Engineer', shopFlavor: 'Legends say they never sleep.' },
  { minLevel: 40, name: 'Tech Lead', shopFlavor: 'The team is blocked without you.' },
  { minLevel: 50, name: 'Staff Magician', shopFlavor: 'Abracadabra, availability.' },
  { minLevel: 65, name: 'Principal Wizard', shopFlavor: 'Ancient incantation: npm install.' },
  { minLevel: 80, name: 'Distinguished Hacker', shopFlavor: 'Your keyboard is smoking.' },
  { minLevel: 100, name: 'Platform Legend', shopFlavor: 'Stories are told of your uptime.' },
  { minLevel: 125, name: '10x Wizard', shopFlavor: 'Reality bends around your PRs.' },
  { minLevel: 155, name: 'Unicorn', shopFlavor: 'Valuation includes infinite energy.' },
  { minLevel: 190, name: 'CTO (Chief Tapping Officer)', shortName: 'CTO', shopFlavor: 'Chief Tapping Officer approves this budget.' },
  { minLevel: 230, name: 'Angel Investor', shopFlavor: 'Deploying capital... and caffeine.' },
  { minLevel: 275, name: 'Board Member', shopFlavor: 'The board demands peak performance.' },
  { minLevel: 325, name: 'Industry Titan', shopFlavor: 'Markets move when you merge.' },
  { minLevel: 385, name: 'Open Source Deity', shopFlavor: 'Sponsored by gratitude and GitHub stars.' },
  { minLevel: 450, name: 'Shadow CTO', shopFlavor: 'Even the servers whisper your name.' },
];

export function titleForLevel(level: number): TitleTier {
  let match = TITLE_TIERS[0];
  for (const tier of TITLE_TIERS) {
    if (level >= tier.minLevel) match = tier;
    else break;
  }
  return match;
}

export function playerTitle(level: number): string {
  return titleForLevel(level).name;
}

export function playerShortTitle(level: number): string {
  return titleForLevel(level).shortName ?? titleForLevel(level).name;
}

export function shopFlavorForLevel(level: number): string {
  return titleForLevel(level).shopFlavor;
}
