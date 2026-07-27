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
];

export function latestAnnouncement(): Announcement | undefined {
  return ANNOUNCEMENTS.at(-1);
}
