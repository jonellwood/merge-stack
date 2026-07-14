**MERGE STACK**

AI Agent Project Specification

*A browser-based merge game about JavaScript, software development,
servers, databases, bugs, tickets, and the strange decisions made in
production environments.*

**Primary implementation target: SvelteKit + TypeScript + CSS Grid +
Pointer Events + Dexie/IndexedDB**

Version 1.0 \| July 2026

# 1. Agent Operating Instructions

**Role:** Act as the lead game engineer, product-minded technical
architect, and implementation agent for this project. Build a playable,
maintainable prototype rather than a collection of disconnected demos.

## 1.1 Non-negotiable rules

- Implement the smallest playable version first. Do not begin with
  accounts, monetization, multiplayer, guilds, live events, or a
  backend.

- Use TypeScript and data-driven catalogs. Do not encode item chains or
  ticket recipes in giant switch statements.

- Use Pointer Events for drag interactions. Do not rely solely on the
  native HTML Drag and Drop API because touch support and mobile
  behavior are inconsistent.

- Persist all meaningful state changes to IndexedDB through Dexie.

- Keep game simulation logic separate from rendering components.

- Favor deterministic, testable functions for merging, spawning, ticket
  completion, energy regeneration, and weighted drop selection.

- Do not add a dependency unless it solves a real problem better than a
  small internal implementation.

- Treat balance values as configuration, not source-code constants
  scattered throughout the application.

- At the end of each implementation phase, run tests, build the project,
  and verify the game manually in desktop and narrow mobile layouts.

- When requirements conflict, prioritize a complete playable loop, data
  integrity, accessibility, and maintainability—in that order.

## 1.2 Definition of done

The initial project is complete only when a player can:

1.  Open the game and resume a saved board.

2.  Tap a generator to spend energy and spawn items.

3.  Drag an item to an empty cell to move it.

4.  Drag two identical compatible items together to merge them into the
    next level.

5.  See three active support tickets with item requirements and rewards.

6.  Complete a ticket when the required items are present, consume those
    items, and receive rewards.

7.  Regenerate energy correctly after closing and reopening the browser.

8.  Play without corrupted board state, duplicate item IDs, lost
    rewards, or inaccessible controls.

# 2. Product Vision

**Working title:** Merge Stack

**Core fantasy:** The player is rebuilding and operating an ancient,
catastrophically undocumented software platform. They create technical
components, merge them into more advanced concepts, fulfill increasingly
absurd departmental support tickets, unlock new systems, and survive the
consequences of production.

## 2.1 Core loop

9.  Spend energy to activate a producer.

10. Receive a low-level item on the board.

11. Move and merge matching items.

12. Create higher-level items.

13. Use requested items to fulfill support tickets.

14. Earn credits and experience.

15. Unlock board space, producers, chains, chapters, and story beats.

16. Repeat with increasing complexity and strategic board pressure.

## 2.2 Tone

- Competent and affectionate satire of software development and
  public-sector or enterprise IT.

- Humor should come from recognizable situations, not from making the
  player feel stupid.

- The interface should be polished, readable, and playful rather than
  parodying broken software.

- Example escalation: Typo → Warning → Bug → Regression → Outage →
  Incident → Major Incident → Congressional Hearing.

# 3. MVP Scope

## 3.1 Included

- One 7 × 9 board containing 63 cells.

- One producer: Junior Developer Workstation.

- One primary ten-level JavaScript merge chain.

- One secondary bug chain with at least five levels.

- Three simultaneous support tickets.

- Energy, credits, experience, and player level.

- Move, merge, swap, spawn, consume, reward, and save behavior.

- Locked board cells that can be unlocked using credits or level
  progression.

- Basic sound and motion hooks, with graceful behavior when reduced
  motion is enabled.

- Responsive layout for desktop and mobile browser widths.

- Local save only.

## 3.2 Explicitly excluded from MVP

- Authentication, cloud save, payments, advertisements, leaderboards,
  social features, guilds, PvP, push notifications, remote
  configuration, analytics SDKs, seasonal events, or app-store
  packaging.

- Complex narrative cinematics.

- More than two active merge chains unless required to make ticket
  generation viable.

- A backend API. Add one only after the local game loop is proven
  enjoyable.

# 4. Theme and Content Model

## 4.1 Primary JavaScript chain

| **Level** | **ID**         | **Display name** | **Concept**                                |
|-----------|----------------|------------------|--------------------------------------------|
| 1         | character      | Character        | A single symbol or fragment of source text |
| 2         | string         | String           | A usable text value                        |
| 3         | variable       | Variable         | Named state                                |
| 4         | expression     | Expression       | Values and operators producing a result    |
| 5         | function       | Function         | Reusable behavior                          |
| 6         | callback       | Callback         | Behavior passed to other behavior          |
| 7         | promise        | Promise          | A future result                            |
| 8         | async_function | Async Function   | Structured asynchronous behavior           |
| 9         | module         | Module           | Reusable code boundary                     |
| 10        | application    | Application      | A complete deliverable                     |

## 4.2 Bug chain

Typo → Warning → Bug → Regression → Outage → Incident → Major Incident →
Congressional Hearing

The bug chain can be produced as a weighted side effect of the
workstation. Tickets may occasionally request bugs or incidents as a
joke about legacy compatibility, audits, or “reproducing the issue
exactly.”

## 4.3 Future chains

| **Chain**         | **Suggested progression**                                                                                                   |
|-------------------|-----------------------------------------------------------------------------------------------------------------------------|
| Server            | Raspberry Pi → Desktop PC → Workstation → Rack Server → Server Cluster → Data Center → Cloud Region → Global Infrastructure |
| Database          | CSV File → Spreadsheet → SQLite → MySQL → SQL Server → Replicated Database → Data Warehouse → Distributed Data Platform     |
| Development tools | Notepad → Text Editor → VS Code → IDE → Build Pipeline → CI/CD Platform → DevOps Ecosystem                                  |
| Networking        | Patch Cable → Switch → Router → Firewall → WAN → SD-WAN → Backbone                                                          |
| AI                | Dataset → Model → Hallucination → Chatbot → Agent → Autonomous Agent → Agent That Deleted Production                        |

# 5. Gameplay Systems

## 5.1 Board rules

- Each cell has a stable index and may contain zero or one item.

- An item has a globally unique ID.

- Dragging to an empty unlocked cell moves the item.

- Dragging onto an identical mergeable item consumes both and creates
  one next-level item in the target cell.

- Dragging onto a non-matching movable item swaps the two items.

- Locked cells reject move and spawn operations.

- Generators occupy board cells and are items with producer behavior.

- A maximum-level item cannot merge further.

- Every board mutation must be performed through a game command or store
  action that validates invariants before committing state.

## 5.2 Producer behavior

- The Junior Developer Workstation costs one energy per activation.

- It spawns into the first available eligible cell or a selected empty
  adjacent cell if that interaction is implemented.

- If the board is full, do not spend energy.

- Weighted drops should initially favor Character items, with smaller
  chances for String, Typo, and Warning items.

- The weighted random function must accept an injectable random source
  for testing.

- Cooldown support may exist in the data model but should be disabled or
  minimal in the MVP.

const workstationDrops = \[  
{ itemId: 'character', weight: 70 },  
{ itemId: 'string', weight: 15 },  
{ itemId: 'typo', weight: 10 },  
{ itemId: 'warning', weight: 5 }  
\];

## 5.3 Energy

- Start with 100 current energy and a maximum of 100.

- Regenerate one energy every two minutes.

- Store the timestamp of the last normalized energy update.

- When loading or focusing the app, calculate offline regeneration from
  elapsed time.

- Never trust an interval timer as the source of truth; timers only
  refresh the display.

- Clamp energy to the configured maximum.

## 5.4 Tickets

Tickets replace restaurant-style customer orders. Each ticket contains a
requester, short description, one or more item requirements, rewards,
status, and generation metadata.

interface Ticket {  
id: string;  
requesterId: string;  
title: string;  
description: string;  
requirements: Array\<{ itemId: string; quantity: number }\>;  
rewards: { credits: number; xp: number };  
status: 'active' \| 'completed' \| 'expired';  
createdAt: number;  
}

- Maintain exactly three active tickets after initial setup and after
  each completion.

- A ticket is completable only when all required quantities exist among
  consumable board items and inventory items, if inventory is later
  added.

- Do not count producers or locked items unless explicitly requested by
  a future ticket type.

- Completion must be atomic: either all required items are consumed and
  all rewards granted, or nothing changes.

- Prefer consuming the lowest-created or lowest-cell-index matching
  items to make behavior deterministic.

- Ticket generation must avoid requesting unobtainable items or
  combinations wildly above the player’s unlocked progression.

## 5.5 Progression and unlocks

- Credits are spent to unlock selected board cells and later may
  purchase convenience upgrades.

- Experience increases player level.

- Level gates determine the highest ticket item level and future
  producer availability.

- The MVP should unlock a few cells and gradually expand the ticket
  difficulty ceiling.

- Progression values must live in configuration files.

# 6. Technical Architecture

## 6.1 Stack

| **Area**    | **Technology**                     | **Purpose**                                        |
|-------------|------------------------------------|----------------------------------------------------|
| Application | SvelteKit + TypeScript             | UI, routing, state integration, build system       |
| Rendering   | CSS Grid + Svelte components       | Board and responsive interface                     |
| Input       | Pointer Events                     | Mouse, pen, and touch dragging                     |
| Persistence | Dexie + IndexedDB                  | Local durable save data                            |
| Validation  | Zod or focused internal validators | Runtime validation of catalogs and save migrations |
| Testing     | Vitest + Playwright                | Unit, integration, and browser interaction tests   |
| Formatting  | ESLint + Prettier                  | Consistent source quality                          |

## 6.2 Architectural boundaries

- Catalog layer: static item, producer, ticket, chapter, reward, and
  balance definitions.

- Domain layer: pure functions and commands for game rules.

- Persistence layer: Dexie repositories, migrations, serialization, and
  load recovery.

- State layer: Svelte stores or runes that expose current game state and
  dispatch domain commands.

- Presentation layer: board, item, HUD, ticket panel, dialogs, effects,
  and accessibility controls.

- Do not place merge rules, reward calculations, or save logic directly
  inside visual components.

## 6.3 Suggested project structure

src/  
lib/  
catalogs/  
items.ts  
producers.ts  
tickets.ts  
progression.ts  
balance.ts  
domain/  
board.ts  
merge.ts  
movement.ts  
spawning.ts  
tickets.ts  
energy.ts  
rewards.ts  
invariants.ts  
types.ts  
persistence/  
db.ts  
repositories.ts  
migrations.ts  
save-manager.ts  
state/  
game-store.svelte.ts  
ui-store.svelte.ts  
components/  
board/  
tickets/  
hud/  
dialogs/  
utils/  
random.ts  
ids.ts  
time.ts  
routes/  
+page.svelte  
tests/  
unit/  
integration/  
e2e/

# 7. Domain Data Model

type ItemKind = 'mergeable' \| 'producer' \| 'reward' \| 'obstacle';  
  
interface ItemDefinition {  
id: string;  
name: string;  
description: string;  
chainId?: string;  
level?: number;  
nextItemId?: string;  
kind: ItemKind;  
icon: string;  
mergeable: boolean;  
tags: string\[\];  
}  
  
interface BoardItem {  
instanceId: string;  
definitionId: string;  
cellIndex: number;  
createdAt: number;  
state?: Record\<string, unknown\>;  
}  
  
interface BoardCell {  
index: number;  
locked: boolean;  
unlockCost?: number;  
}  
  
interface PlayerState {  
id: 'local-player';  
credits: number;  
xp: number;  
level: number;  
energy: number;  
maxEnergy: number;  
energyUpdatedAt: number;  
}  
  
interface GameSave {  
schemaVersion: number;  
player: PlayerState;  
cells: BoardCell\[\];  
items: BoardItem\[\];  
tickets: Ticket\[\];  
settings: GameSettings;  
updatedAt: number;  
}

## 7.1 Required invariants

- Every item instance ID is unique.

- No two items occupy the same cell.

- Every item references a known catalog definition.

- Every occupied cell exists and is unlocked unless the item is a
  deliberate obstacle or producer placed during initialization.

- Energy, credits, XP, and level are finite non-negative numbers.

- Every active ticket references obtainable catalog items.

- The save schema version is present and migrations are applied
  sequentially.

- A failed command must not partially mutate persistent or in-memory
  state.

# 8. Core Command Contracts

## 8.1 Move or merge

type MoveResult =  
\| { ok: true; action: 'move' \| 'swap' \| 'merge'; changedItemIds:
string\[\] }  
\| { ok: false; reason: 'locked' \| 'invalid-cell' \| 'same-cell' \|
'not-found' };  
  
function moveOrMerge(  
state: GameState,  
sourceInstanceId: string,  
targetCellIndex: number  
): MoveResult;

- Validate the source item and target cell.

- If target is empty, move.

- If target contains a matching item with the same definition and a
  configured next item, merge.

- Otherwise swap if both items are movable.

- A merge removes both input instances and creates one new instance in
  the target cell.

- Award merge XP only after a successful merge.

## 8.2 Producer activation

function activateProducer(  
state: GameState,  
producerInstanceId: string,  
random: () =\> number,  
now: number  
): CommandResult;

- Normalize energy first.

- Reject when the producer is unavailable, cooling down, the board is
  full, or energy is insufficient.

- Choose a weighted drop.

- Create the item, place it, spend energy, update timestamps, and save
  as one transaction.

## 8.3 Ticket completion

function completeTicket(  
state: GameState,  
ticketId: string,  
now: number  
): CommandResult;

- Compute the exact item instances to consume before mutating state.

- Reject if any requirement is missing.

- Consume required items, grant rewards, mark the ticket complete, and
  generate a valid replacement.

- Persist the resulting state once.

# 9. Persistence

- Use one Dexie database named merge-stack.

- A simple MVP may store normalized tables or one validated snapshot.
  Prefer normalized tables if it does not materially delay
  implementation.

- Save after every successful command and important settings change.

- Debounce cosmetic UI state only; never debounce currency, merges,
  ticket completion, or producer activation in a way that risks loss.

- Maintain schemaVersion and migration functions from day one.

- On load failure, preserve the corrupt payload for debugging,
  initialize a safe new save, and notify the user without exposing a raw
  stack trace.

- Provide a development-only reset-save action.

# 10. Interface Requirements

## 10.1 Desktop layout

- Top HUD: player level, XP progress, energy, credits, and settings.

- Center: 7 × 9 merge board, sized to remain fully visible when
  practical.

- Right panel: three tickets and their completion state.

- Bottom or side utility area: item information, future inventory entry
  point, and reset/debug controls in development mode.

## 10.2 Mobile layout

- Keep the board as the primary viewport content.

- Move tickets into a collapsible drawer or bottom sheet.

- Use touch targets of at least 44 CSS pixels where practical.

- Do not require hover.

- Prevent page scrolling while an active board drag is in progress, but
  restore normal scrolling immediately afterward.

## 10.3 Drag feedback

- Lift and slightly scale the dragged item.

- Highlight valid merge targets distinctly from ordinary move targets.

- Show an invalid target state without punishing the player.

- Animate successful merges with a short pop or pulse.

- Respect prefers-reduced-motion by replacing motion with opacity or
  outline changes.

## 10.4 Accessibility

- Every item must have a meaningful accessible name including its
  display name and level.

- Provide a keyboard interaction mode: select an item, move focus among
  cells, then move, swap, or merge.

- Do not rely on color alone to communicate merge eligibility, energy
  errors, or ticket readiness.

- Use live regions sparingly for successful merges, ticket completion,
  and important errors.

- Persist sound, music, reduced motion, and contrast preferences.

# 11. Ticket Content Examples

| **Requester**      | **Title**                | **Requirements**                    | **Reward**          | **Flavor**                                            |
|--------------------|--------------------------|-------------------------------------|---------------------|-------------------------------------------------------|
| Human Resources    | Export the Employee List | 2 × Variable, 1 × Function          | 80 credits, 20 XP   | Needs to be in Excel, PDF, and somehow “interactive.” |
| Finance            | Monthly Report Failure   | 1 × Promise, 1 × Warning            | 120 credits, 30 XP  | It worked last month. No one knows what changed.      |
| Public Information | Website Update           | 1 × Module, 1 × String              | 150 credits, 35 XP  | Make the button more modern, but exactly the same.    |
| Legacy Systems     | Compatibility Patch      | 1 × Regression, 1 × Callback        | 200 credits, 50 XP  | The bug is now part of the approved workflow.         |
| Executive Office   | Strategic Dashboard      | 1 × Application, 1 × Major Incident | 500 credits, 120 XP | Must be delivered before the requirements meeting.    |

# 12. Balance Defaults

| **Setting**              | **Initial value**        | **Notes**                            |
|--------------------------|--------------------------|--------------------------------------|
| Board size               | 7 × 9                    | 63 cells                             |
| Initially unlocked cells | 35–42                    | Tune during playtesting              |
| Starting energy          | 100                      | Same as maximum                      |
| Energy regeneration      | 1 per 2 minutes          | Timestamp-based                      |
| Producer cost            | 1 energy                 | No cooldown initially                |
| Active tickets           | 3                        | Replace immediately after completion |
| Starting credits         | 100                      | Enough for one early unlock          |
| Merge XP                 | Level × 2                | Configuration-driven                 |
| Ticket item ceiling      | Player progression based | Never request impossible items       |

# 13. Implementation Plan

## Phase 0 — Project foundation

- Create SvelteKit TypeScript project.

- Configure linting, formatting, Vitest, and Playwright.

- Create catalogs, domain, persistence, state, and component folders.

- Define shared domain types and validation utilities.

- Add a minimal application shell and responsive CSS tokens.

## Phase 1 — Static board and catalog

- Create the 63 board cells and initial lock pattern.

- Create item definitions for the JavaScript chain, bug chain, and
  producer.

- Render items from catalog metadata.

- Add an item details panel or tooltip.

- Add unit tests validating catalog chain continuity and unique IDs.

## Phase 2 — Movement and merging

- Implement Pointer Events drag state.

- Implement move, swap, and merge domain commands.

- Add valid-target feedback and merge animation.

- Add keyboard move and merge flow.

- Add unit and browser tests for all move outcomes.

## Phase 3 — Producer and energy

- Implement weighted drop selection.

- Implement producer activation and full-board rejection.

- Implement timestamp-based energy normalization.

- Add HUD values and energy countdown display.

- Test offline regeneration and maximum clamping.

## Phase 4 — Tickets and rewards

- Create ticket templates and progression filters.

- Generate three active tickets.

- Compute ticket readiness.

- Atomically consume items and award credits and XP.

- Generate replacement tickets and test impossible-request prevention.

## Phase 5 — Persistence and recovery

- Add Dexie schema and save manager.

- Persist every successful game command.

- Restore the game at startup and normalize energy.

- Add schema versioning, an initial migration, and a safe reset option.

- Test reloads during normal play and after ticket completion.

## Phase 6 — Progression and polish

- Add player levels and cell unlocks.

- Improve animation, sound hooks, responsive layout, empty states, and
  errors.

- Add reduced-motion and audio preferences.

- Run accessibility checks and keyboard-only playtesting.

- Conduct a 15–20 minute balance playtest and adjust configuration only.

# 14. Testing Requirements

## 14.1 Unit tests

- Catalog IDs are unique and every nextItemId exists.

- Maximum-level items have no next item.

- Merge succeeds only for identical compatible definitions.

- Move and swap preserve unique occupancy.

- Weighted selection handles boundaries and zero or invalid weights
  safely.

- Energy normalization is correct before, during, and after full
  capacity.

- Ticket readiness counts quantities correctly.

- Ticket completion is atomic and deterministic.

- Save migrations transform old versions without losing valid state.

- Invariant checks detect duplicate IDs, duplicate cell occupancy, and
  unknown item definitions.

## 14.2 Browser tests

- Start a new game and spawn an item.

- Drag an item to an empty cell.

- Merge two matching items.

- Swap non-matching items.

- Attempt to move into a locked cell.

- Fill a ticket and complete it.

- Reload and verify board, currency, tickets, and energy persist.

- Use the board without a mouse.

- Verify narrow viewport behavior.

# 15. Acceptance Criteria

| **Area**        | **Pass condition**                                                                                              |
|-----------------|-----------------------------------------------------------------------------------------------------------------|
| Playable loop   | A new player can understand how to generate, move, merge, and submit ticket items without developer assistance. |
| State safety    | Repeated dragging, rapid tapping, reloads, and ticket completion do not duplicate or lose items or rewards.     |
| Persistence     | Closing and reopening the browser restores the last committed state and accurately regenerates energy.          |
| Responsiveness  | The game is usable at common desktop widths and at approximately 390 CSS pixels wide.                           |
| Accessibility   | All primary actions can be completed using keyboard controls, and status is not conveyed by color alone.        |
| Maintainability | Adding a new merge chain primarily requires catalog entries and assets, not rewriting the merge engine.         |
| Quality gate    | Lint, unit tests, browser tests, and production build all pass.                                                 |

# 16. Future Architecture

After the local MVP is demonstrably fun, add a backend only for features
that truly require one:

- Accounts and cloud saves.

- Daily rewards and server-authoritative event timing.

- Remote balance configuration and content rollout.

- Leaderboards or social features.

- Purchase receipt validation.

- Anti-cheat controls for competitive or monetized systems.

- Telemetry focused on progression stalls, board pressure, ticket
  completion, and session length.

**Recommended backend direction:** A small TypeScript/Node API is the
most natural fit, but PHP with MySQL or SQL Server is entirely viable.
The client domain model must not depend on a specific backend
implementation.

# 17. Agent Delivery Checklist

- Provide a concise README with install, run, test, and build commands.

- Document the catalog format and how to add a merge chain.

- Document the save schema and migration process.

- Include development-only controls for resetting the save and adding
  energy or test items.

- Do not ship debug controls in production builds unless explicitly
  enabled.

- Keep a CHANGELOG or implementation log summarizing completed phases
  and known limitations.

- Before declaring completion, run the production build and the full
  automated test suite.

- Report any intentionally deferred requirements and why they were
  deferred.

# 18. Final Guidance to the Agent

**Build the game, not the framework for every game that might exist
someday.** The merge engine should be reusable, but the first objective
is a charming, stable, playable JavaScript-themed loop. Prefer one
polished producer, two coherent chains, and three satisfying tickets
over twenty unfinished systems. The code is not the hardest part;
progression, pacing, board pressure, clarity, and content are. Keep all
of those adjustable without rewriting the engine.

*The consultant expansion can wait. It would only produce PowerPoint
files and consume three times the energy anyway.*
