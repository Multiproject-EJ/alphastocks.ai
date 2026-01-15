# MarketTycoon Master Development Plan

**Version:** 1.0  
**Created:** 2026-01-15  
**Purpose:** Comprehensive guide for AI agents (Copilot/Codex) and developers implementing the MarketTycoon investing board game

---

## Table of Contents
1. [Core Principles](#core-principles)
2. [North Star Game Loop](#north-star-game-loop)
3. [Reward Hierarchy](#reward-hierarchy)
4. [Three-Layer Architecture](#three-layer-architecture)
5. [Multi-Ring Board System](#multi-ring-board-system)
6. [Portal Mechanics](#portal-mechanics)
7. [Implementation Status](#implementation-status)
8. [Visual Priority Rules](#visual-priority-rules)
9. [First 10 Minutes Constraint](#first-10-minutes-constraint)
10. [Boring Detection Check](#boring-detection-check)
11. [Hard Stop Rule for AI](#hard-stop-rule-for-ai)
12. [Self-Auditing Implementation Flow](#self-auditing-implementation-flow)
13. [Telemetry Requirements](#telemetry-requirements)
14. [Monetization Guidelines](#monetization-guidelines)
15. [Ethical Hard Line](#ethical-hard-line)
16. [Priority Roadmap](#priority-roadmap)
17. [How to Use This Document](#how-to-use-this-document)

---

## Core Principles

### 1. Fun > Realism (Non-Negotiable)
- **Entertainment First:** Every mechanic must be enjoyable before being educational
- **Instant Feedback:** Players should see immediate results from their actions
- **No Boring Waits:** Never ask players to wait for market data, real-time prices, or slow API calls
- **Progression Feel:** Even losses should feel like progress toward mastery

### 2. Casino Surface Layer
- **Visual Excitement:** Bright colors, animations, celebrations
- **Quick Wins:** Frequent small rewards (coins, stars, visual effects)
- **Juice Everything:** Dice rolls, card flips, level-ups need satisfying animations
- **Accessibility:** All ages should understand the core loop without reading documentation

### 3. Tycoon Collection Layer
- **Portfolio Building:** Players collect stocks like trading cards
- **Set Completion:** Encourage collecting all stocks in a category
- **Visual Progress:** Show portfolio growth with charts and milestones
- **Trading Mechanics:** Buy low, sell high with simplified market simulation

### 4. Insight/Investment Layer (The Depth)
- **Real Stock Data:** Use actual companies with real market scores
- **Educational Moments:** Quiz questions teach investment principles
- **Bias Training:** Interactive case studies on cognitive biases
- **Quality Signals:** Alpha scores, risk ratings, timing indicators

### 5. Ethical Guidelines
- **No Gambling Addiction Patterns:** No "near miss" manipulation
- **Educational Value:** Every mechanic should teach a real investing concept
- **Fair Monetization:** Only fast-track purchases, never pay-to-win
- **Data Privacy:** Never share portfolio or financial data without explicit consent

---

## North Star Game Loop

The **15-second core loop** that must remain intact:

```
1. Roll Dice (2s) → Visual feedback, anticipation
2. Move Token (1s) → Smooth animation across board
3. Land on Tile (1s) → Tile highlights, category reveal
4. Action Trigger (5-10s) → Buy stock / Play quiz / Casino minigame
5. Reward & Feedback (1-2s) → Stars earned, coins added, celebration effect
6. Next Turn → Repeat
```

**Critical:** Nothing should break this loop or add mandatory waiting periods.

---

## Reward Hierarchy

### Small Wins (Every 1-2 turns)
- **+10-50 coins** for completing actions
- **+1-3 stars** for landing on category tiles
- **Visual celebration** (particles, sound effect)
- **Purpose:** Keep engagement high, provide constant positive feedback

### Medium Wins (Every 5-10 turns)
- **Complete a stock category** (all 4 stocks in turnarounds, dividends, etc.)
- **Unlock achievement** (e.g., "First 10 stocks purchased")
- **Level up** (+1 to player level, unlock new features)
- **Purpose:** Provide milestone satisfaction, unlock new gameplay

### Big Wins (Every 30-60 minutes)
- **Net Worth Tier Up** ($100k → $250k → $500k → $1M)
- **Complete a City** in City Builder mode
- **Perfect Bias Quiz** (all questions correct, bonus reward)
- **Reach the Wealth Throne** (Ring 3 → Center)
- **Purpose:** Epic moments that create memorable experiences

---

## Three-Layer Architecture

### Layer 1: Casino Surface (Entry Point)
**Goal:** Hook players in first 60 seconds

**Mechanics:**
- Dice rolling with visual effects
- Coin collection from every action
- Scratchcard minigame (3-match wins)
- Lucky Wheel spin (daily bonus)
- Slot Machine (high-risk, high-reward)

**Visual Style:** Bright, colorful, animated
**Target Audience:** All ages, casual players

### Layer 2: Tycoon Collection (Retention)
**Goal:** Keep players engaged for hours

**Mechanics:**
- Stock portfolio building
- Category completion (collect all dividends, growth, etc.)
- Net Worth progression ($0 → $1M → $10M)
- City Builder (Monopoly Go-style progression)
- Stock Exchange Builder (unlock trading floors)

**Visual Style:** Modern, clean, dashboard-like
**Target Audience:** Ages 16+, strategy gamers

### Layer 3: Insight/Investment (Education)
**Goal:** Deliver real investing knowledge

**Mechanics:**
- Real company data (scores, sectors, financials)
- Quiz challenges (test knowledge, earn stars)
- Bias Sanctuary (learn about cognitive biases)
- Alpha scoring system (composite, quality, risk, timing)
- Market event simulation (interest rates, inflation, earnings)

**Visual Style:** Professional, data-rich, charts
**Target Audience:** Ages 18+, aspiring investors

---

## Multi-Ring Board System

### Overview
Transform the single-ring board into a **3-ring progressive spiral** where players advance inward toward the "Wealth Throne" at the center.

```
┌─────────────────────────────────────────┐
│           RING 1: STREET LEVEL          │
│              (27 tiles)                 │
│    ┌─────────────────────────────┐      │
│    │      RING 2: EXECUTIVE      │      │
│    │         (18 tiles)          │      │
│    │    ┌─────────────────┐      │      │
│    │    │   RING 3: ELITE │      │      │
│    │    │    (9 tiles)    │      │      │
│    │    │   ┌─────────┐   │      │      │
│    │    │   │ THRONE  │   │      │      │
│    │    │   └─────────┘   │      │      │
│    │    └─────────────────┘      │      │
│    └─────────────────────────────┘      │
└─────────────────────────────────────────┘
```

### Ring Configuration

| Ring | Name | Tiles | Multiplier | Entry | Exit |
|------|------|-------|------------|-------|------|
| 1 | Street Level | 27 | 1× | Start | Auto-ascend after 1 lap |
| 2 | Executive Floor | 18 | 3× | Complete Ring 1 | Elevator tile |
| 3 | Elite Circle | 9 | 10× | Lucky Elevator roll | Elevator to Throne or fall |

**Total:** 54 tiles (27 + 18 + 9) — Symmetrical ratio of 3:2:1

### The Elevator Mechanic 🛗

Ring 2 and Ring 3 each have an "Elevator" corner tile. When landing on it, player rolls dice:

#### Ring 2 Elevator:
| Roll | Outcome | Odds |
|------|---------|------|
| 11-12 | ASCEND to Ring 3 | ~8% |
| 5-10 | Stay on Ring 2 | ~72% |
| 2-4 | Fall back to Ring 1 | ~20% |

#### Ring 3 Elevator:
| Roll | Outcome | Odds |
|------|---------|------|
| 11-12 | REACH THE THRONE! 👑 | ~8% |
| 2-10 | Fall back to Ring 1 | ~92% |

### Ring Progression Rules

1. **Ring 1 (Street Level):**
   - All players start here
   - Complete 1 full lap to unlock Ring 2
   - Standard rewards (1× multiplier)
   - Stocks: Basic categories (turnarounds, dividends, growth, value, moats)

2. **Ring 2 (Executive Floor):**
   - Entered after completing Ring 1
   - All rewards × 3 (stars, coins, stock quality)
   - Premium versions of Ring 1 categories
   - One Elevator tile to potentially reach Ring 3

3. **Ring 3 (Elite Circle):**
   - Entered via lucky Elevator roll from Ring 2
   - All rewards × 10 (highest stakes)
   - Elite stocks only (BRK.A, LVMH, ARAMCO, TSM)
   - One Final Elevator tile leading to Throne

4. **The Wealth Throne (Center):**
   - Reached by rolling 11-12 on Ring 3 Elevator
   - Victory condition
   - Massive reward (10,000 stars + special badge)
   - Player can continue playing from Ring 1 with Throne badge

### Risk/Reward Balance

- **Ring 1:** Low risk, consistent progress
- **Ring 2:** Medium risk, elevator can send you back
- **Ring 3:** High risk (92% fall chance), massive rewards
- **Strategy:** Choose when to take Elevator risk vs. staying safe

---

## Portal Mechanics 🌀

The Start tile on each ring acts as a **portal** that determines whether players ascend, descend, or reach victory.

### Portal Rules

| Ring | Start Tile | On PASS (don't land) | On LAND EXACTLY |
|------|------------|----------------------|-----------------|
| 1 | Start / ThriftyPath | ⬆️ Portal UP to Ring 2 | ⬆️ Portal UP to Ring 2 |
| 2 | Ascension Gate | ⬇️ Portal DOWN to Ring 1 | ⬆️ Portal UP to Ring 3 |
| 3 | Inner Sanctum | ⬇️ Portal DOWN to Ring 1 | 👑 REACH THE THRONE! |

### Key Mechanics

1. **Ring 1 → Ring 2 (Easy Ascent)**
   - Complete one full lap on Ring 1
   - When you pass Start, automatically portal up
   - No precision required — just complete the lap

2. **Ring 2 → Ring 3 (Precision Required)**
   - You must land EXACTLY on Ascension Gate (tile 200)
   - If you pass it (roll too high), you fall back to Ring 1
   - This creates tension: "Will I land exactly?"
   - Probability of exact landing varies by position

3. **Ring 3 → Throne (Maximum Precision)**
   - Same rule: land EXACTLY on Inner Sanctum (tile 300)
   - If you pass it, fall all the way back to Ring 1
   - Creates high-stakes moments
   - Victory requires skill AND luck

### Portal Animations

**Portal UP (Ascending):**
- Purple/blue vortex swirl effect
- Player token rises toward center
- Celebratory particles
- Ascending sound effect
- Toast: "Welcome to [Ring Name]!"

**Portal DOWN (Falling):**
- Gray vortex with gravity effect
- Player token falls outward
- Descending whoosh sound
- Toast: "Back to Street Level — try again!"

**Throne Victory:**
- Golden explosion effect
- Crown icon animation
- Confetti + fireworks
- Epic victory fanfare
- Full-screen celebration modal

---

## Implementation Status

### ✅ Completed Systems

| System | Status | Files |
|--------|--------|-------|
| Core Game Loop | ✅ Complete | `App.tsx`, `types.ts` |
| Ring 1 Board (27 tiles) | ✅ Complete | `mockData.ts` (BOARD_TILES) |
| Ring 2 Data (18 tiles) | ✅ Complete | `mockData.ts` (RING_2_TILES) |
| Ring 3 Data (9 tiles) | ✅ Complete | `mockData.ts` (RING_3_TILES) |
| Ring Config Constants | ✅ Complete | `mockData.ts` (RING_CONFIG) |
| Elevator Odds | ✅ Complete | `mockData.ts` (ELEVATOR_ODDS) |
| Elite Stock Category | ✅ Complete | `types.ts`, `mockData.ts` |
| Dice Rolling | ✅ Complete | `App.tsx` |
| Stock Categories | ✅ Complete | 6 categories (turnarounds, dividends, growth, value, moats, elite) |
| Casino Minigames | ✅ Complete | Scratchcard, Slots |
| Quiz System | ✅ Complete | `EventModal.tsx` |
| Bias Sanctuary | ✅ Complete | `BiasSanctuaryModal.tsx` |
| City Builder | ✅ Complete | `CityBuilderModal.tsx` |
| Stock Exchange Builder | ✅ Complete | `StockExchangeBuilderModal.tsx` |
| Achievement System | ✅ Complete | `AchievementsModal.tsx` |
| Net Worth Tiers | ✅ Complete | Tier progression system |
| Thrift Path | ✅ Complete | Challenge-based financial discipline |
| Portal System | ✅ Complete | `App.tsx`, `PortalAnimation.tsx` |
| Portal Animations | ✅ Complete | `PortalAnimation.tsx` |

### 🚧 In Progress

| System | Status | Next Steps |
|--------|--------|------------|
| Multi-Ring UI | 🚧 In Progress | Render Ring 2 and Ring 3 tiles on board |
| Elevator Mechanic | 🚧 In Progress | Implement roll logic and ring transitions |
| Ring Transition Animations | 🚧 In Progress | Visual feedback when ascending/falling |
| Wealth Throne Center | 🚧 In Progress | Center tile UI and victory sequence |

### 📋 Planned

| System | Priority | Description |
|--------|----------|-------------|
| Ring Multipliers | P0 | Apply 3× and 10× reward multipliers |
| Elite Stock Mechanics | P1 | Special behaviors for elite stocks |
| Throne Victory Sequence | P1 | Epic celebration for reaching center |
| Ring-based Leaderboards | P2 | Track who reaches Ring 3 most |
| Ring History Tracking | P2 | Show player's ring progression over time |

---

## Visual Priority Rules

### Rule 1: Hierarchy of Attention
1. **Primary Action** (Dice Roll button, Buy Stock button) - Largest, brightest
2. **Current State** (Player position, cash, stars) - Always visible, medium size
3. **Feedback** (Rewards, celebrations) - Temporary, high contrast
4. **Background** (Board tiles, UI chrome) - Subtle, low contrast

### Rule 2: Color Coding
- **Green:** Positive actions (buy, gain, win)
- **Red:** Negative actions (risk, loss, warning)
- **Blue:** Informational (quiz, learn, stats)
- **Gold/Yellow:** Special events (casino, elevator, throne)
- **Purple:** Premium features (shop, boosts)

### Rule 3: Animation Budget
- **Every Roll:** Dice animation (required)
- **Every Landing:** Tile highlight + particle effect
- **Every Purchase:** Coin animation from source to destination
- **Big Moments:** Full-screen confetti + haptics
- **Background:** Subtle idle animations (breathing, floating)

### Rule 4: Accessibility
- All interactive elements must be at least 44×44px
- Color is never the only indicator (use icons + text)
- Animations respect `prefers-reduced-motion`
- Text contrast ratio minimum 4.5:1 (WCAG AA)

---

## First 10 Minutes Constraint

**Goal:** Player must experience all three layers in their first session.

### Minute 0-2: Casino Hook
- Player rolls dice immediately (no tutorial)
- Lands on Casino tile → plays Scratchcard
- Wins small reward (50 coins) → celebration effect

### Minute 2-5: Collection Loop
- Lands on category tile → sees stock with real company name
- Prompted to buy first stock (simplified, one-click)
- Portfolio shows first holding → sense of ownership

### Minute 5-10: Insight Moment
- Lands on Quiz tile → 2-question investing quiz
- Gets 1 question right, 1 wrong → sees explanation
- Realizes game is teaching real concepts
- Unlocks achievement: "First Quiz Completed"

**Result:** Player understands game has depth, not just luck.

---

## Boring Detection Check

Before implementing any feature, ask:

1. **Would a 12-year-old understand this without reading?**
   - If no → simplify or add visual tutorial

2. **Does this require waiting more than 5 seconds?**
   - If yes → remove waiting or make it optional

3. **Is this mechanic used in popular mobile games?**
   - If no → validate with playtest before building

4. **Does this teach a real investing concept?**
   - If no → consider removing or replacing

5. **Can I show this in a 10-second video?**
   - If no → too complex, break into smaller parts

---

## Hard Stop Rule for AI

**AI agents (Copilot/Codex) must STOP and ask before:**

1. **Adding real-time API calls** that could slow down gameplay
2. **Implementing complex algorithms** that affect game balance
3. **Changing reward values** (stars, coins, multipliers) without playtesting
4. **Removing existing features** that might be used elsewhere
5. **Adding monetization** without explicit approval
6. **Modifying data privacy** or user tracking code
7. **Changing core game loop** timing or flow

**When in doubt:** Implement as a feature flag, ask for review, don't merge.

---

## Self-Auditing Implementation Flow

### Step 1: Read the North Star
Before coding, re-read the [North Star Game Loop](#north-star-game-loop) section.

**Ask:** "Does my change break the 15-second loop?"

### Step 2: Check the Hierarchy
Review [Reward Hierarchy](#reward-hierarchy).

**Ask:** "Am I creating too many big wins? Not enough small wins?"

### Step 3: Test Boring Detector
Run through [Boring Detection Check](#boring-detection-check).

**Ask:** "Would I personally enjoy this feature?"

### Step 4: Verify Ethics
Review [Ethical Hard Line](#ethical-hard-line).

**Ask:** "Could this mechanic be exploitative or misleading?"

### Step 5: Commit with Context
**Good commit message:**
```
feat: Add elevator mechanic to Ring 2 transition

- Implements dice roll on Elevator tile (ID 205)
- 8% chance to ascend to Ring 3
- 20% chance to fall back to Ring 1
- Includes celebration animation for ascension

Refs: DEV_PLAN_MARKETTYCOON_MASTER.md (Multi-Ring Board System)
```

**Bad commit message:**
```
update game logic
```

---

## Telemetry Requirements

### Critical Metrics (Must Track)

1. **Retention:**
   - Day 1, Day 7, Day 30 return rate
   - Average session length
   - Sessions per user per week

2. **Engagement:**
   - Dice rolls per session
   - Stocks purchased per session
   - Quizzes completed per session
   - Casino games played per session

3. **Progression:**
   - Time to reach Ring 2
   - Time to reach Ring 3
   - % of players reaching Throne
   - Net Worth distribution (users per tier)

4. **Monetization:**
   - % of users who see shop
   - % of users who purchase
   - Average revenue per paying user (ARPPU)
   - Most popular purchases

5. **Education:**
   - Quiz accuracy rate
   - Bias case studies completed
   - Time spent on Alpha score analysis
   - Portfolio diversity score

### Privacy-First Approach
- All telemetry is **opt-in** with clear disclosure
- Anonymous user IDs only (no PII)
- Data retained for 90 days maximum
- Export/delete available on request
- No third-party sharing without consent

---

## Monetization Guidelines

### Allowed: Fast-Track Purchases

1. **Extra Dice Rolls:**
   - Small pack: 10 rolls for $0.99
   - Medium pack: 30 rolls for $1.99
   - Large pack: 100 rolls for $4.99
   - **Rationale:** Speeds up gameplay, doesn't affect outcomes

2. **Cosmetic Items:**
   - Dice skins ($0.99 - $2.99)
   - Board themes ($2.99 - $4.99)
   - Player token avatars ($0.99)
   - **Rationale:** Pure personalization, zero gameplay impact

3. **Premium Pass (Battle Pass Model):**
   - $9.99 per season (30 days)
   - Unlocks premium reward track
   - Double XP for leveling
   - Exclusive cosmetics
   - **Rationale:** Rewards engagement, still requires playing

### Forbidden: Pay-to-Win

❌ **Never allow:**
- Buying coins or stars directly
- Purchasing specific stocks
- Paying to skip quizzes
- Guaranteed good dice rolls
- Paying to avoid negative events
- Buying higher Net Worth tiers

### The Line: "Would This Work in a Paid Game?"

If a mechanic would feel unfair in a $20 premium game, it's exploitative in a F2P game.

---

## Ethical Hard Line

### Non-Negotiable Rules

1. **No Dark Patterns:**
   - ❌ Hidden costs or surprise charges
   - ❌ Confusing cancel flows
   - ❌ Fake urgency ("Only 3 left!")
   - ❌ Manipulative push notifications

2. **No Addiction Mechanics:**
   - ❌ Near-miss animations (slot machine trick)
   - ❌ Variable reward schedules designed to addict
   - ❌ FOMO timers on gameplay content
   - ❌ Punishing players for not paying

3. **Educational Integrity:**
   - ✅ All stock data must be accurate
   - ✅ Quiz answers must be correct and well-sourced
   - ✅ Bias case studies must reflect real research
   - ✅ Never simplify to the point of misinformation

4. **Age-Appropriate:**
   - ✅ No real money gambling (no cash prizes)
   - ✅ No adult content or inappropriate companies
   - ✅ Parental controls for in-app purchases
   - ✅ Educational value clearly communicated

5. **Financial Responsibility:**
   - ✅ Game is not financial advice (clear disclaimer)
   - ✅ Encourage learning, not speculating
   - ✅ No promotion of day trading or high-risk behavior
   - ✅ Teach long-term investing principles

---

## Priority Roadmap

### P0: Core Gameplay (Must Have for V1)
- [x] Ring 1 board and tiles
- [x] Dice rolling and movement
- [x] Stock purchase system
- [x] Quiz and casino mechanics
- [x] Net Worth tier progression
- [ ] Multi-ring UI rendering
- [ ] Elevator mechanic implementation
- [ ] Ring transition animations

### P1: Retention Features (Launch Week)
- [ ] Ring multipliers (3× and 10×)
- [ ] Elite stock special behaviors
- [ ] Throne victory sequence
- [ ] Daily login rewards
- [ ] Weekly challenges
- [ ] Social features (leaderboard)

### P2: Depth & Engagement (Month 1)
- [ ] Ring-based leaderboards
- [ ] Ring history tracking
- [ ] Advanced portfolio analytics
- [ ] Event system (limited-time events)
- [ ] Seasonal battle pass
- [ ] More bias case studies

### P3: Long-Term Content (Month 2+)
- [ ] New stock categories (international, crypto, etc.)
- [ ] Advanced casino games
- [ ] Co-op multiplayer features
- [ ] User-generated content (custom boards?)
- [ ] Integration with real brokerage APIs (read-only)
- [ ] AI-powered investment insights

---

## How to Use This Document

### For AI Agents (Copilot/Codex)

**When implementing a feature:**

1. **Search this document first** for relevant sections
2. **Read the Core Principles** to understand design philosophy
3. **Check Implementation Status** to see what's already done
4. **Run Boring Detection Check** before writing code
5. **Reference this doc in commit messages**

**Example workflow:**

```
1. User requests: "Add elevator mechanic"
2. Search doc for "elevator" → Find Multi-Ring Board System section
3. Check Implementation Status → See it's marked "In Progress"
4. Read Elevator Mechanic spec → Understand dice roll odds
5. Check Hard Stop Rule → No blockers apply
6. Implement feature following spec
7. Run Boring Detection Check → Confirm it's fun
8. Commit with reference to this doc
```

### For Human Developers

**When starting a new feature:**

1. Read relevant section of this doc
2. Sketch out implementation plan
3. Validate against Core Principles
4. Check for conflicts with existing systems
5. Implement with tests
6. Update Implementation Status table

**When reviewing code:**

1. Verify feature aligns with North Star Game Loop
2. Check telemetry is in place
3. Confirm ethical guidelines are met
4. Test on mobile (performance + UX)
5. Validate accessibility

### For Designers

**When creating new UI:**

1. Follow Visual Priority Rules
2. Respect First 10 Minutes Constraint
3. Design for both casual and serious players
4. Include accessibility considerations
5. Provide mockups for all states (loading, error, success)

### For Product Managers

**When prioritizing features:**

1. Check Priority Roadmap for current phase
2. Validate against Reward Hierarchy (balance small/medium/big wins)
3. Ensure monetization follows guidelines
4. Confirm educational value is maintained
5. Review telemetry requirements

---

## Document Maintenance

**This document should be updated when:**

- Core game loop changes significantly
- New major system is added (new game mode, mechanic)
- Ethical or monetization policies change
- Telemetry requirements expand
- Roadmap priorities shift

**Versioning:**
- Major changes: Increment to 2.0, 3.0, etc.
- Minor changes: Increment to 1.1, 1.2, etc.
- Update "Created" date to "Last Updated"

**Owner:** Lead Game Designer + Lead Developer
**Review Cadence:** Monthly during active development

---

## Appendix: Key Files Reference

| File | Purpose |
|------|---------|
| `apps/investing-board-game-v3/src/App.tsx` | Main game loop, state management |
| `apps/investing-board-game-v3/src/lib/types.ts` | Type definitions (GameState, Tile, Stock, etc.) |
| `apps/investing-board-game-v3/src/lib/mockData.ts` | Board tiles, stocks, events, ring configs |
| `apps/investing-board-game-v3/src/components/` | All UI components (modals, overlays) |
| `apps/investing-board-game-v3/src/hooks/` | Custom React hooks (game save, challenges, etc.) |

---

**End of Master Plan**

*This document serves as the single source of truth for MarketTycoon development. When in doubt, refer here. When this doc is wrong, update it first, then implement.*
