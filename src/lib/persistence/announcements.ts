import { ANNOUNCEMENTS, type Announcement } from '$lib/catalogs/announcements';

const STORAGE_KEY = 'merge-stack:seen-announcements';

function readSeen(): Set<string> {
  if (typeof localStorage === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return new Set(parsed.filter((id) => typeof id === 'string'));
  } catch {
    // Ignore corrupt storage
  }
  return new Set();
}

function writeSeen(seen: Set<string>) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...seen]));
  } catch {
    // Ignore storage errors
  }
}

export function getUnseenAnnouncements(): Announcement[] {
  const seen = readSeen();
  return ANNOUNCEMENTS.filter((announcement) => !seen.has(announcement.id));
}

export function markAnnouncementSeen(id: string) {
  const seen = readSeen();
  seen.add(id);
  writeSeen(seen);
}

export function markAllAnnouncementsSeen() {
  writeSeen(new Set(ANNOUNCEMENTS.map((a) => a.id)));
}

export function hasUnseenAnnouncements(): boolean {
  return getUnseenAnnouncements().length > 0;
}
