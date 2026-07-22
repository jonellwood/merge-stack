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

Saves carry an explicit schema version; future migrations should increment it and transform snapshots sequentially before validation. Development builds expose reset-save and restore-energy controls in Settings, and these are removed from production builds.

The game remains local-first and deliberately excludes monetization, multiplayer, and analytics. Optional accounts add cross-device snapshot synchronization through Supabase.

## Optional Supabase cloud foundation

The migration enables Row Level Security and creates revision-controlled saves plus a future command outbox.

On first connection, the account dialog asks whether local or cloud progress should win. Linked devices then save successful changes automatically using optimistic revisions; stale or independently changed saves stop for an explicit reconciliation choice.

For installed PWA sign-in, paste `supabase/email-templates/magic-link.html` into **Supabase → Authentication → Email Templates → Magic Link**. It includes both `{{ .Token }}` for entering the verification code directly inside the PWA and `{{ .ConfirmationURL }}` as a browser fallback. The client accepts Supabase OTP lengths from 6–10 digits.

## Deploy to Netlify

The repository includes the Netlify adapter and `netlify.toml`. In Netlify, choose **Add new project → Import an existing project**, connect GitHub, and select `jonellwood/merge-stack`. The checked-in configuration supplies:

- Build command: `npm run build`
- Publish directory: `build`
- Node.js: 22

Netlify will build every pushed commit and create deploy previews for pull requests. Game saves remain local to each browser through IndexedDB, so deployments do not overwrite player progress.

## Run the iOS app

The Capacitor project lives in `ios/` and uses the bundle identifier `com.jonellwood.mergestack`. The native build bundles a static SvelteKit build; the regular `npm run build` command continues to use the Netlify adapter.

Requirements: macOS, a complete Xcode installation, and an iOS Simulator runtime installed through Xcode.

```bash
npm install
npm run ios:sync
npm run ios:open
```

In Xcode, select the **App** scheme and an iPhone simulator, then press Run. After changing web code, run `npm run ios:sync` again before rebuilding in Xcode. `npm run ios:run` can also build and launch from the command line once Xcode and a simulator are configured.

The Supabase public URL and publishable key are compiled from the local `.env` during `build:ios`, just as they are for the web build. Never put a Supabase service-role key in this file or in the app.

The current iOS build is intentionally local-only: it does not initialize Supabase or display account and social-login controls. Game snapshots are stored through Capacitor Preferences with IndexedDB retained as a recovery copy. If an earlier simulator build has only an IndexedDB save, the first native load migrates that snapshot automatically.
