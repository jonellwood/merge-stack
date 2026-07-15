# Merge Stack

A local-first JavaScript-themed merge game built with SvelteKit, TypeScript, CSS Grid, Pointer Events, and Dexie/IndexedDB.

## Run

```bash
npm install
npm run dev
```

Tap the workstation to spend energy and create an item. Drag matching items together to merge, move to an empty cell, or swap unlike items. For keyboard or touch, select an item and then its destination. Resolve support tickets for credits and XP; select locked cells to buy board space.

## Quality checks

```bash
npm test
npm run check
npm run build
```

## Content and architecture

Merge chains live in `src/lib/catalogs/items.ts`, and balance values in `src/lib/catalogs/balance.ts`. Domain commands in `src/lib/domain/game.ts` return new state without partially mutating failed inputs. Successful commands save immediately to the `merge-stack` IndexedDB database.

Saves carry `schemaVersion: 1`; future migrations should increment the Dexie schema and transform snapshots sequentially before validation. Development builds expose reset-save and restore-energy controls in Settings, and these are removed from production builds.

The MVP is fully local and deliberately excludes accounts, backend services, monetization, multiplayer, and analytics.

## Optional Supabase cloud foundation

The migration enables Row Level Security and creates revision-controlled saves plus a future command outbox.

On first connection, the account dialog asks whether local or cloud progress should win. Linked devices then save successful changes automatically using optimistic revisions; stale or independently changed saves stop for an explicit reconciliation choice.

## Deploy to Netlify

The repository includes the Netlify adapter and `netlify.toml`. In Netlify, choose **Add new project → Import an existing project**, connect GitHub, and select `jonellwood/merge-stack`. The checked-in configuration supplies:

- Build command: `npm run build`
- Publish directory: `build`
- Node.js: 22

Netlify will build every pushed commit and create deploy previews for pull requests. Game saves remain local to each browser through IndexedDB, so deployments do not overwrite player progress.
