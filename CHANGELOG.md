# Changelog

## Unreleased

- Added four saved appearance presets: Dark Mode, Less Dark Mode, Not as Dark Mode, and Dark Mode Lite.
- Brightened the board, HUD, support queue, and dialogs progressively while preserving Merge Stack's dark developer-console identity.
- Made the expanded settings dialog scroll safely on small mobile screens.

## 0.8.0 — CSS Selector Lab

- Added the level-27 CSS Selector Lab and a visually distinct nine-level chain from Type Selector through Design System.
- Added seven staged CSS support tickets, including cross-chain requests that compete for HTML, JavaScript, and bug items.
- Added Cascade Operator and Pixel Authority achievements plus full Content Registry coverage.
- Added visible board-capacity warnings at five free cells and a critical state at two free cells.
- Kept the player level visible in narrow portrait HUDs and made the Content Registry safe-area-aware on installed iPhone PWAs.

## 0.7.1 — Cloud reconciliation hotfix

- Treat byte-for-byte equivalent local and cloud game states as synchronized, even when stale link metadata says both changed.
- Use the cloud save's existing last-writer device ID to safely pull or push the newer state from the same device.
- Wait for pending automatic uploads before running a foreground reconciliation check.
- Automatically open the cloud decision dialog when a genuine conflict pauses gameplay, and keep it visible until the player decides.

## 0.7.0 — Save integrity

- Added foreground, reconnect, and live Supabase reconciliation so returning web devices discover newer cloud revisions before gameplay resumes.
- Added explicit dirty-state tracking and mutation gating when cloud timelines conflict.
- Added eight rotating local recovery snapshots and automatic recovery from the newest valid snapshot.
- Requested persistent browser storage where supported and stopped treating storage-read failures as an empty new game.
- Added downloadable/importable JSON save backups and a protected recovery interface.
- Added same-origin multi-tab save notifications to prevent stale tabs from remaining silently behind.
- Added deterministic reconciliation tests and a migration that enables Realtime updates for `game_saves`.

## 0.6.0 — Retro Computing Week

- Added Retro Computing Week, active August 7–14, with a Beige Desktop Computer seasonal generator.
- Added a seven-level retro hardware chain from Punch Card through Cloud Desktop.
- Added three limited-time legacy support tickets and the Back to the Cloud event badge.
- Seasonal generators now stay hidden outside their active event window.
- Expired retro items are automatically archived for level-scaled credits.
- Added Server Rack maintenance mode and 4U storage for generators; stored generators remain inactive and do not redeploy themselves.
- Added an Idle Hints preference without changing production energy costs.

## 0.5.0 — Server Rack storage

- Added a level-18 Server Rack with 6U of included off-board storage.
- Assigned items a derived storage size: levels 1–3 use 1U, levels 4–6 use 2U, and levels 7+ use 3U.
- Added permanent +3U rack expansions at 250, 500, 1,000, and 2,000 credits, up to 18U.
- Added a responsive server-cabinet interface for inspecting and returning mounted items.
- Excluded stored items from merging, ticket delivery, and idle hints until they return to an open board cell.
- Added confirmation before storing ticket-contributing or top-level items, plus full-board guidance into the rack.
- Added schema-4 migration and cloud-compatible persistence for rack contents and expansion purchases.
- Made Tidy start at 250 credits and double with every use during an independent six-hour window.
- Added the Rack Mounted achievement and included stored seasonal items in event cash-out totals.

## 0.1.0 — Playable MVP

- Added a responsive 7×9 board, JavaScript and bug chains, and the Junior Developer Workstation.
- Added Pointer Events dragging plus keyboard/tap select-and-destination controls.
- Added moving, swapping, merging, weighted spawning, offline energy recovery, XP/levels, credit unlocks, three rotating tickets, and atomic rewards.
- Added IndexedDB persistence, accessibility preferences, developer controls, and domain tests.

Known limitation: audio has a persisted preference and interaction hooks, but no sound assets ship in this prototype. Browser-level Playwright tests are deferred; core command behavior is unit-tested.

## 0.4.0 — HTML Workbench and achievements

- Added the level-20 HTML Workbench, an eight-level markup chain, a distinct three-energy weighted drop table, warm board styling, and Content Registry integration.
- Added six HTML support-ticket templates gated behind the Workbench unlock.
- Filled permanent late-game ticket gaps across infrastructure, bugs, and JavaScript, including two uses for Cloud Regions.
- Added a schema-3 achievement model with durable timestamps, statistics, automatic save migration, cloud-sync compatibility, and a player-facing Badge Cabinet.
- Added initial progression, merge, support, infrastructure, full-board, HTML, and limited Hackathon badges.
- Added a full-board production prompt that offers the next purchasable slot or clear recovery guidance when the board is fully unlocked.
- Corrected infrastructure tickets so they cannot appear before the Infrastructure Workbench unlocks.
- Extended late-game ticket progression to support permanent merge items through level 10.

## 0.1.1 — Ticket and drag fixes

- Added varied, progression-safe starter tickets and automatic repair for duplicate tickets already stored in local saves.
- Hardened ticket resolution against repeated clicks while a ticket is closing.
- Reserved the browser scrollbar gutter so starting a drag no longer shifts the layout horizontally.
- Added the explicit Netlify adapter and continuous-deployment configuration.
- Added a reduced-motion-aware confetti celebration for player level-ups.
- Added a five-second ready countdown and gentle recurring nudge on resolvable tickets.
- Added a hidden, read-only Content Registry for inspecting merge paths, item definitions, active tickets, requirements, and reward calculations.
- Added a mobile Support Queue readiness indicator with a ready count and reduced-motion-aware green pulse.
- Hid the ticket readiness countdown while preserving its delayed pulse behavior.
- Added direct producer feedback when activation fails because energy is depleted.
- Added the level-4 Infrastructure Workbench, a seven-level server chain, distinct weighted drops and energy cost, infrastructure tickets, and automatic unlock repair for eligible saves.
- Added difficulty-scaled ticket energy rewards and a persisted six-hour emergency recharge economy with escalating prices and a full-board discount.
- Added the Supabase account and cloud-save foundation: optional browser authentication, protected Postgres schema, revision-controlled snapshot repository, future command outbox, and environment setup documentation.
- Added first-login local/cloud reconciliation, per-device revision metadata, automatic linked snapshot updates, and conflict-safe stale-revision handling.
- Added board-level reservation highlights and accessible badges for the exact item instances consumable by ready support tickets.
- Extended ticket highlighting to available partial requirements before the full ticket becomes resolvable.
- Integrated the Merge Stack logo, favicon suite, installable PWA manifest, offline application shell, social artwork, and authenticated cloud-sync status styling.
- Added PWA-friendly email OTP sign-in with a branded Supabase template and retained magic-link browser fallback.
- Made email OTP entry compatible with configurable Supabase code lengths, including eight-digit codes.
