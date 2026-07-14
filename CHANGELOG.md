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
