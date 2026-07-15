# Changelog

## 0.1.0 — Playable MVP

- Added a responsive 7×9 board, JavaScript and bug chains, and the Junior Developer Workstation.
- Added Pointer Events dragging plus keyboard/tap select-and-destination controls.
- Added moving, swapping, merging, weighted spawning, offline energy recovery, XP/levels, credit unlocks, three rotating tickets, and atomic rewards.
- Added IndexedDB persistence, accessibility preferences, developer controls, and domain tests.

Known limitation: audio has a persisted preference and interaction hooks, but no sound assets ship in this prototype. Browser-level Playwright tests are deferred; core command behavior is unit-tested.

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
