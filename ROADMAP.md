# Merge Stack Product Roadmap

This is a living design document, not a release schedule. Levels, costs, timers, names, and rewards are starting points to validate through playtesting.

## Product direction

The later game should create interesting board-management decisions:

- More generators introduce competing merge chains.
- Board space becomes a resource, not just a container.
- Players must decide whether to merge, fulfill a ticket, recycle an item, feed a special system, or preserve an uncommon drop.
- Pressure should come from meaningful choices rather than surprise penalties or unavoidable gridlock.
- Recycling, event cash-outs, and the paid Tidy action remain escape valves when the board becomes crowded.

The target feeling is: “I can solve this board, but I need a plan.”

## Progression outline

| Tier | Working unlock | Generator | Design purpose |
| --- | ---: | --- | --- |
| Foundation | Level 1 | Junior Developer Workstation | Introduces generating, merging, tickets, energy, and bugs. |
| Operations | Level 7 | Infrastructure Workbench | Adds a distinct server chain and higher energy cost. |
| Events | Level 14 | Event Deployment Pipeline | Hosts time-limited content without changing the permanent generator identity. |
| Web Platform | Level 20 | HTML Workbench | Adds a familiar, readable content chain and increases board pressure. |
| Presentation | Level 27 | CSS Selector Lab | Adds another permanent chain with visually distinct items. |
| Advanced Systems | Level 34+ | Branching generator | Introduces two drop families and a cross-branch final recipe. |
| Endgame Economy | Level 40+ | Bounty Box | Creates a ticket-versus-investment decision and a long-cycle reward. |

Exact unlock levels should be adjusted after measuring how long current players take to reach levels 14, 20, and 30.

## HTML Workbench

Working concept: a permanent generator focused on increasingly structured HTML.

Possible merge path:

1. Angle Bracket
2. HTML Tag
3. HTML Element
4. Nested Element
5. Semantic Section
6. Accessible Page
7. Document Structure
8. Production Markup

Design notes:

- Unlock around level 20.
- Cost 2–3 energy per activation.
- Primarily drops level-one HTML items, with a small chance of level-two items and ordinary bugs.
- Ticket templates should begin requesting HTML items only after the generator is available.
- Icons and mobile colors must remain distinguishable from JavaScript items.

## CSS Selector Lab

Working concept: a permanent generator about selectors, specificity, and the cascade.

Possible merge path:

1. Type Selector
2. Class Selector
3. Attribute Selector
4. Combinator
5. Pseudo-class
6. Selector List
7. Specificity Rule
8. Cascade Layer
9. Design System

Design notes:

- Unlock around level 27.
- Cost approximately 3 energy per activation.
- Could occasionally produce a bug-chain item such as a Warning or Regression.
- Higher-level CSS tickets should pay enough to justify the additional board pressure.
- The final name may change if “Design System” is reserved for a cross-chain recipe later.

## Branching generator experiment

The current merge model is linear: two identical items become the next item in one chain. A later generator should produce two independent families with different drop rates.

### Recommended on-theme concept: Browser Engine

The Browser Engine produces two branches:

**DOM branch — common**

1. Text Node
2. DOM Node
3. Element Node
4. DOM Subtree
5. Document Tree

**CSSOM branch — uncommon**

1. Declaration
2. Style Rule
3. Rule Set
4. Style Sheet
5. CSSOM

The top-level `Document Tree` and top-level `CSSOM` can merge together into a special `Render Tree`.

This is the software equivalent of the food-and-car example: the branches do not merge with one another until their completed forms unlock a deliberate cross-branch recipe.

### Mechanical requirements

- Producers need multiple named drop families and independently configurable rarity.
- Merge recipes must support `item A + item B → item C`, not only identical-item upgrades.
- The board must clearly indicate compatible cross-branch targets.
- Drag order must not matter: `A + B` and `B + A` produce the same result.
- The Content Registry should display branching paths and cross-branch recipes.
- Tickets may request branch items, but should not request the special final item too frequently.
- The uncommon branch cannot be so rare that progress feels entirely random. A pity rule or guaranteed-drop meter may be appropriate.

### Questions to test

- Should the uncommon branch drop roughly 20%, 15%, or 10% of the time?
- Should completing the common branch improve the odds of uncommon drops?
- Is the special final item used for a premium ticket, permanent achievement, or large one-time redemption?
- Can branch items be recycled using the originating generator’s normal salvage currency?

## “Beast Box” reward system

Working title: **Mr. Byte’s Beast Box** or **Beast Mode Bounty Box**.

The joke should be recognizable without using a real creator’s name, likeness, logo, typography, or exact branding. Final naming and art should receive an IP/trademark review before release.

### Core loop

The box pays out in two ways:

1. A long passive timer eventually unlocks a free randomized reward.
2. Players can feed eligible high-level merge items into the box to accelerate the timer or fill a contribution meter.

This creates an intentional decision:

- Use a valuable item to close a support ticket now.
- Keep it for a future merge.
- Recycle it for a predictable reward.
- Feed it to the box for faster access to a larger uncertain reward.

### Starting balance proposal

- Unlock around level 40.
- Base timer: 12 hours.
- The box occupies one permanent board cell.
- Eligible contributions begin at item level 5 or 6.
- Each item contributes points based on its level and generator.
- Filling the meter immediately triggers a payout and restarts the long timer.
- Passive time and contributions work together; feeding never resets passive progress.

Example reward table:

| Reward | Weight |
| --- | ---: |
| 25 energy | 35% |
| 50 energy | 20% |
| 150 credits | 25% |
| 300 credits | 15% |
| 50 energy + 250 credits | 5% |

These are gameplay rewards only. If real-money purchases are ever introduced, the random-reward design will require a separate platform-policy and legal review.

### Fairness safeguards

- Show the possible reward range before a player contributes.
- Never allow a zero-value payout.
- Use a minimum guaranteed value comparable to deterministic recycling.
- Consider a streak guarantee so several small payouts lead to a larger one.
- Require confirmation before consuming a high-level or ticket-reserved item.
- Make the timer and contribution progress visible and persistent.
- Do not create urgency through fake scarcity or misleading odds.

## Board-space strategy

Additional generators should increase pressure gradually.

## Server Rack storage

Working concept: replace the generic game “backpack” with a visual server rack that stores items off-board.

The rack is measured in rack units (`U`) rather than slots:

- Low-level items occupy `1U`.
- Mid-level items occupy `2U`.
- High and top-level items occupy `3U`.
- A stored generator chassis could occupy `4U`, or generators could use a separate deployment bay if mixing both systems becomes confusing.

Starting capacity should be approximately `6U`. Players can purchase additional rack space in small increments, such as `+3U` per expansion, with sharply increasing credit costs.

Example expansion curve:

| Capacity | Upgrade | Starting cost |
| --- | ---: | ---: |
| 6U | Included | — |
| 9U | +3U | 250 credits |
| 12U | +3U | 500 credits |
| 15U | +3U | 1,000 credits |
| 18U | +3U | 2,000 credits |

The exact curve should be balanced against board-cell purchases and the Tidy fee. Rack expansion should be desirable, but it should not eliminate board pressure.

### Rack interaction

- Present the storage UI as a vertical server cabinet with numbered U positions.
- Render stored items as equipment mounted across one, two, or three rack rows.
- Drag an item to an open compatible region or select an item and choose `Rack`.
- Stored items cannot merge, satisfy tickets, or receive idle merge hints.
- Players must return an item to an unlocked board cell before using it.
- Recycling directly from the rack may be allowed as a convenience.
- Ticket requirements can indicate that a matching item exists in storage without counting it as delivered.
- The rack must never accept an item unless enough contiguous U space exists.

Contiguous space creates a small packing puzzle: a rack may have three free units but still lack a continuous `3U` opening. If testing shows this feels tedious, capacity can remain U-based while automatically compacting stored items.

### Rack safeguards

- Require confirmation before storing a ticket-reserved or top-level item.
- Show the item’s U size before it is moved.
- Preserve rack contents through save migrations exactly like board contents.
- Never charge for an expansion unless the capacity increase succeeds.
- Provide a compact/sort control, potentially free inside the rack.
- Do not allow purchased capacity to shrink while occupied.

## Movable generators

Recommendation: generators should become **movable but protected**, rather than permanently fixed to one cell.

They should:

- Move only to unlocked, empty board cells.
- Never merge, recycle, swap with ordinary items, or satisfy tickets.
- Retain cooldowns, event state, and activation counts when moved.
- Remain in place when Tidy compacts ordinary items.
- Optionally dock in the Server Rack later at a meaningful U cost.

A normal drag gesture conflicts with tapping a generator to activate it. Use one of these safer interactions:

1. A board “Rearrange” mode where generator activation is temporarily disabled.
2. A long press followed by drag, with a clear lift animation.
3. A `Move` action in the generator detail panel.

The recommended first implementation is a generator detail-panel `Move` action. It is discoverable, accessible, and much less likely to cause accidental repositioning during rapid production.

### Principles

- Never spawn an item when no unlocked cell is available.
- Never consume energy on a failed spawn.
- Newly unlocked generators should arrive with at least one usable cell.
- Players must always retain a deterministic way to remove ordinary items.
- Ticket-required highlighting must remain visible when the board is crowded.
- The game should warn at low free-space thresholds, for example five cells and two cells.
- Tidy remains costly convenience, not a requirement for recovering from an impossible state.

### Possible later systems

- Server Rack storage with U-based item capacity.
- Generator docking in the rack, possibly using `4U` per inactive generator.
- A deployment cost or cooldown when returning a stored generator to the board.
- Bonus rack units earned through achievements in addition to purchased expansions.
- Tickets that accept one of several equivalent items.
- Board expansions that become progressively more expensive rather than ending at the current grid.

The Server Rack should arrive before or alongside the fifth permanent generator. It gives players agency over space without removing the intended late-game constraint.

## Suggested implementation sequence

### Phase 1 — Content expansion

- Add the HTML Workbench and chain.
- Add HTML ticket templates and registry content.
- Playtest progression timing and board occupancy.
- Add the CSS Selector Lab only after HTML balance is stable.

### Phase 2 — Board-pressure tuning

- Track free-cell count and show low-space warnings.
- Review generator unlock placement and energy costs.
- Measure recycling, Tidy usage, failed spawns, and abandoned sessions.
- Prototype movable-but-protected generators.
- Implement the first `6U` Server Rack and one purchasable expansion.
- Decide whether generators share rack capacity with ordinary items or use dedicated bays.

### Phase 3 — Recipe engine

- Replace the assumption that every merge uses two identical definitions.
- Add declarative merge recipes.
- Implement the Browser Engine branches and Render Tree recipe.
- Add branch visualization to the Content Registry.
- Add deterministic tests for rarity, reverse-order merging, and save compatibility.

### Phase 4 — Bounty Box

- Prototype the passive timer without item feeding.
- Add contribution values and confirmation.
- Playtest ticket-versus-box decisions.
- Tune the reward table and fairness guarantees.
- Finalize a legally distinct player-facing name and visual identity.

## Success signals

- Later-level players regularly operate with limited space but can recover without resetting.
- Recycling and Tidy are useful without becoming mandatory after every session.
- New generators change player decisions rather than simply adding longer versions of existing chains.
- Players understand branching compatibility without consulting documentation.
- The Bounty Box produces genuine tradeoffs instead of becoming an automatic best choice.
- Support tickets, merging, and special systems all remain viable uses for high-level items.

## Open decisions

- Final unlock levels for HTML, CSS, branching, and the Bounty Box.
- Whether all permanent generators occupy the board simultaneously.
- Whether stored generators consume ordinary rack units or dedicated deployment bays.
- Whether rack items require contiguous U space or auto-compact.
- Final rack expansion costs and maximum capacity.
- Which generator currencies apply to HTML, CSS, and branching salvage.
- Whether Render Tree is redeemable, ticketable, or retained as an achievement.
- Whether the Bounty Box accelerates a timer, fills a separate meter, or combines both.
- Whether generator deployment from the rack costs credits, energy, time, or nothing.
