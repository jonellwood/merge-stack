export interface Announcement {
  id: string;
  version: string;
  date: string;
  headline: string;
  body: string;
  icon?: string;
  tag?: string;
}

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'titles-promotion',
    version: '0.2.0',
    date: '2026-07-22',
    headline: 'Job Titles & Promotions',
    body: 'You now earn a startup job title as you level up. Cross a title threshold and you get promoted with a full energy refill! How high can you climb?',
    icon: '🚀',
    tag: 'NEW FEATURE',
  },
  {
    id: 'idle-assist-contrast',
    version: '0.3.0',
    date: '2026-07-23',
    headline: 'A Smarter, Brighter Board',
    body: 'Step away for five seconds and Merge Stack will surface a ready support ticket—or gently pulse a pair that can be merged. Mobile items are also brighter, color-coded by chain, and labeled for much faster scanning.',
    icon: '💡',
    tag: 'QUALITY OF LIFE',
  },
  {
    id: 'html-workbench-badges',
    version: '0.4.0',
    date: '2026-07-27',
    headline: 'Markup, Milestones & More Tickets',
    body: 'Level 20 now deploys the HTML Workbench and an eight-level markup chain with new support requests. Every permanent chain item has a ticket use, the Badge Cabinet records your achievements, and full-board production now points directly to available capacity.',
    icon: '🏅',
    tag: 'CONTENT EXPANSION',
  },
  {
    id: 'server-rack-storage',
    version: '0.5.0',
    date: '2026-08-05',
    headline: 'Rack It, Stack It',
    body: 'Level 18 now unlocks a 6U Server Rack for safe off-board storage, with permanent credit-funded expansions up to 18U. Tidy service fees now double with each use and reset after six hours.',
    icon: '🗄️',
    tag: 'BOARD MANAGEMENT',
  },
  {
    id: 'retro-computing-week',
    version: '0.6.0',
    date: '2026-08-07',
    headline: 'Booting Retro Computing Week',
    body: 'The Beige Desktop Computer is online through Friday, August 14, with seven generations of delightfully obsolete hardware and three limited-time support tickets. Server Rack maintenance mode can now mount generators in 4U bays, inactive seasonal generators stay hidden, and idle hints can be disabled in Settings.',
    icon: '💾',
    tag: 'LIMITED EVENT',
  },
  {
    id: 'save-integrity-sync',
    version: '0.7.0',
    date: '2026-08-14',
    headline: 'Your Progress, Reinforced',
    body: 'Merge Stack now checks for newer cloud progress whenever you return, responds to saves from another active device, and pauses safely when two timelines conflict. Local play also gains persistent-storage protection, rotating recovery snapshots, multi-tab awareness, and portable save backups.',
    icon: '🛡️',
    tag: 'SAVE INTEGRITY',
  },
];

export function latestAnnouncement(): Announcement | undefined {
  return ANNOUNCEMENTS.at(-1);
}
