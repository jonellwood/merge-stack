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
];

export function latestAnnouncement(): Announcement | undefined {
  return ANNOUNCEMENTS.at(-1);
}
