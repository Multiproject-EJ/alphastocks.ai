# MarketTycoon Master Development Plan

**Version:** 2.0  
**Last Updated:** 2026-01-16  
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
18. [Stock Modal Redesign](#stock-modal-redesign)
19. [Quick Reward Tiles](#quick-reward-tiles)
20. [Currency Economy System](#currency-economy-system)
21. [Celebration System](#celebration-system)
22. [Recent Implementation Log](#recent-implementation-log)

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
| Ring Multipliers (3×, 10×) | ✅ Complete | `rewardMultiplier.ts`, `App.tsx` |
| Mini-Games Catalog | ✅ Complete | `DEV_PLAN_MARKETTYCOON_MASTER.md` |
| Event Calendar Integration | ✅ Complete | `miniGameSchedule.ts`, `useMiniGames.ts` |
| Focus Mechanics | ✅ Complete | `useMiniGames.ts` |
| Stock Modal Redesign | ✅ Complete | `StockModal.tsx` |
| Quick Reward Tiles | ✅ Complete | `quickRewardTiles.ts`, `QuickRewardTile.tsx` |
| Currency Economy | ✅ Complete | `currencyConfig.ts`, `mysteryBox.ts`, `029_currency_economy.sql` |
| Currency Exchange UI | ✅ Complete | `CurrencyExchange.tsx` |
| Epic Celebration | ✅ Complete | `EpicCelebration.tsx`, `useCelebration.ts` |
| Shop Items (Coins) | ✅ Complete | `shop_items` table |
| Shop Items (Stars) | ✅ Complete | `shop_items` table |
| Shop Items (Cash) | ✅ Complete | `shop_items` table |
| Mystery Box System | ✅ Complete | `mysteryBox.ts` |

### 🚧 In Progress

| System | Status | Next Steps |
|--------|--------|------------|
| Multi-Ring UI | 🚧 In Progress | Render Ring 2 and Ring 3 tiles on board |
| Elevator Mechanic | 🚧 In Progress | Implement roll logic and ring transitions |
| Ring Transition Animations | 🚧 In Progress | Visual feedback when ascending/falling |
| Wealth Throne Center | 🚧 In Progress | Center tile UI and victory sequence |
| Portal Animation | 🚧 In Progress | Glow → Fade → Materialize |
| Ring 3 Implementation | 🚧 In Progress | $20K rewards, Black Swan |

### 📋 Planned

| System | Priority | Description |
|--------|----------|-------------|
| Wheel of Fortune | P1 | Happy Hour mini-game |
| Stock Rush | P1 | Timed discount event |
| Elite Stock Mechanics | P1 | Special behaviors for elite stocks |
| Throne Victory Sequence | P1 | Epic celebration for reaching center |
| Vault Heist | P2 | Weekly special event |
| Sound Effects | P2 | Audio for all actions |
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

## Mini-Games Catalog

This section documents all mini-games in MarketTycoon, their availability, and rotation schedule. The goal is to create **focused engagement** rather than overwhelming players with options.

### Design Principles

1. **Scarcity Creates Value**: Not all games available all the time
2. **Focus Over Breadth**: Max 3-4 active event games at once
3. **Return Motivation**: "Come back at 6pm for Happy Hour!"
4. **Daily Limits**: Prevent burnout and addiction patterns
5. **Event Windows**: Create urgency without manipulation

### Game Categories

#### 🟢 Always Available (Core Games)
These games are always accessible but have daily limits to prevent abuse.

| Game | Description | Daily Limit | Cooldown | Rewards |
|------|-------------|-------------|----------|---------|
| **Scratchcard** | 3-match instant win game | 3 plays | 1 hour | 50-500 coins |
| **Quiz Challenge** | Investment knowledge questions | 5 plays | None | 25-100 stars + XP |
| **Bias Sanctuary** | Cognitive bias case studies | 3 studies | None | 50 stars + insight |
| **Stock Purchase** | Buy stocks on category tiles | Unlimited | None | Portfolio growth |
| **Daily Dividends** | 7-day collection streak | 1 per day | 24 hours | Dice rolls, cash |

#### 🟡 Scheduled Events (Rotating)
These games appear on a predictable schedule, creating anticipation.

| Game | Schedule | Duration | Rewards | Status |
|------|----------|----------|---------|--------|
| **Happy Hour Wheel** | Daily 6-9pm | 3 hours | Random prizes | 🚧 Planned |
| **Stock Rush** | 9am, 1pm, 6pm | 2 hours each | Discounted stocks | 🚧 Planned |
| **Double XP** | Weekends | 48 hours | 2× XP on all actions | ✅ Exists |
| **Casino Happy Hour** | Fridays 6pm | 3 hours | Guaranteed scratchcard win | ✅ Exists |
| **Thrifty Thursday** | Thursdays | 24 hours | 2× Thrifty Path stars | ✅ Exists |
| **Roll Fest Sunday** | Sundays | 24 hours | +5 bonus dice rolls | ✅ Exists |

#### 🔴 Special Events (Rare)
These are limited-time events that create excitement and FOMO.

| Game | Schedule | Duration | Rewards | Status |
|------|----------|----------|---------|--------|
| **Vault Heist** | Saturdays 2pm | 1 hour | Big coin prizes | 🚧 Planned |
| **Mega Jackpot** | Monthly (1st Saturday) | 24 hours | Massive star pool | 🚧 Planned |
| **Market Mayhem** | Random (2-3x/month) | 4 hours | Rapid trading bonuses | 🚧 Planned |
| **Holiday Events** | Seasonal | 3-7 days | Themed rewards | 🚧 Planned |
| **New Year Celebration** | Jan 1 | 24 hours | 3× stars and XP | ✅ Exists |

### Planned Mini-Games (Specs)

#### 1. Wheel of Fortune 🎡
**Type:** Scheduled Event (Happy Hour)
**Availability:** Daily 6-9pm
**Mechanic:**
- Player spins a wheel with 8-12 segments
- Segments contain: Stars, Coins, Dice Rolls, Stock Discounts, Bonus XP, "Spin Again", and one "Jackpot"
- One free spin per Happy Hour, additional spins cost 50 coins
- Ring multiplier applies to wheel prizes

**UI:**
- Full-screen wheel with physics-based spin
- Anticipation: Wheel slows down dramatically near prizes
- Celebration: Confetti on jackpot

#### 2. Stock Rush 📈
**Type:** Scheduled Event (3x daily)
**Availability:** 9am, 1pm, 6pm — 2 hours each
**Mechanic:**
- During Stock Rush, all stocks are 20% cheaper
- Limited stock available (first come, first served feel)
- Countdown timer creates urgency
- Bonus stars for buying during rush

**UI:**
- Flashing "RUSH" indicator on stock tiles
- Countdown timer in corner
- "X stocks claimed" social proof

#### 3. Vault Heist 🏦
**Type:** Special Event (Weekly)
**Availability:** Saturdays 2pm — 1 hour only
**Mechanic:**
- Player attempts to "crack" 3 vault doors
- Each door: Mini-game (pattern match, quick math, memory)
- Success: Advance to next vault (bigger prizes)
- Failure: Keep current winnings and exit
- Risk/reward: Go for Vault 3 or take safe Vault 1 prize?

**UI:**
- Bank vault aesthetic
- Tension music
- Dramatic door opening animations
- Vault 3: Epic celebration with massive confetti

#### 4. Market Mayhem 📊
**Type:** Special Event (Random)
**Availability:** 2-3 times per month, 4 hours
**Mechanic:**
- Rapid-fire buy/sell decisions
- Stocks flash with temporary bonuses/penalties
- Player must decide quickly (5 second timer per stock)
- Good decisions: Bonus stars
- Bad decisions: Lose coins (small amount)

**UI:**
- Trading floor aesthetic
- Ticker tape animations
- Quick decision UI (big Buy/Sell/Skip buttons)
- Leaderboard: Who made best decisions?

#### 5. Portfolio Poker 🃏
**Type:** Scheduled Event (Future)
**Availability:** TBD
**Mechanic:**
- Card game where cards represent stocks
- Build "hands" based on stock categories (e.g., "Dividend Flush", "Growth Straight")
- Play against AI opponents
- Win: Earn actual stocks for your portfolio

**UI:**
- Classic poker table
- Cards show stock logos and scores
- Hand rankings based on investing concepts

#### 6. Dividend Derby 🏇
**Type:** Special Event (Future)
**Availability:** Monthly
**Mechanic:**
- Pick 3 stocks from your portfolio
- Stocks "race" based on real simulated performance
- Winning stock earns bonus dividends
- Encourages diversified portfolio

**UI:**
- Horse racing aesthetic but with stock logos
- Commentary: "AAPL is pulling ahead!"
- Photo finish moments

### Focus Mechanics

#### Maximum Active Games
At any given time, players see a **focused selection** of games:

| Category | Max Visible | Notes |
|----------|-------------|-------|
| Always Available | All 5 | Core gameplay, always shown |
| Scheduled Events | 2-3 | Only currently active or "starting soon" |
| Special Events | 1 | Rare, high visibility when active |

#### Event Queue Display

Show players what's coming:

```
NOW PLAYING:
🟢 Quiz Challenge (always)
🟢 Scratchcard (2 left today)
🟡 Happy Hour Wheel (ends in 47 min)

COMING UP:
⏰ Stock Rush — starts in 2h 15m
⏰ Vault Heist — Saturday 2pm

ENDED TODAY:
⬛ Morning Stock Rush — ended 3h ago
```

#### Notification Strategy

| Trigger | Notification |
|---------|--------------|
| Event starting in 15 min | Push: "Happy Hour Wheel starts soon!" |
| Event just started | In-app banner + sound |
| Event ending in 5 min | Banner: "5 minutes left!" |
| Daily limit reached | Toast: "Come back tomorrow for more!" |
| New special event announced | Push + in-app modal |

### Mini-Game Implementation Status

| Game | Status | Priority | Files |
|------|--------|----------|-------|
| Scratchcard | ✅ Complete | — | `ScratchcardModal.tsx` |
| Quiz Challenge | ✅ Complete | — | `EventModal.tsx` |
| Bias Sanctuary | ✅ Complete | — | `BiasSanctuaryModal.tsx` |
| Daily Dividends | ✅ Complete | — | `DailyDividendsModal.tsx` |
| Slot Machine | ✅ Complete | — | `CasinoModal.tsx` |
| Wheel of Fortune | 🚧 Planned | P1 | — |
| Stock Rush | 🚧 Planned | P1 | — |
| Vault Heist | 🚧 Planned | P2 | — |
| Market Mayhem | 🚧 Planned | P2 | — |
| Portfolio Poker | 🚧 Planned | P3 | — |
| Dividend Derby | 🚧 Planned | P3 | — |

---

## Stock Modal Redesign

### Problem
The original stock modal showed too much information, making decisions slow. Players want quick, snappy interactions.

### Solution: Compact Info + HUGE Buttons

#### New Layout

```
┌─────────────────────────────────────┐
│  🍎 AAPL                    8.5 ⭐  │  ← Logo + Ticker + Score
│  Apple Inc.                 $185    │  ← Name + Price  
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  "Tech giant with unmatched moat"   │  ← One-line hook
│                                     │
│  Quality ████████░░ 8.2             │  ← Mini progress bars
│  Value   ██████░░░░ 6.5             │
│  Growth  █████████░ 9.1             │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────┐  ┌───────────────┐ │
│  │             │  │               │ │
│  │    PASS     │  │     BUY!      │ │  ← HUGE buttons
│  │     👋      │  │    💰🚀       │ │
│  │             │  │   $1,250      │ │
│  │             │  │               │ │
│  └─────────────┘  └───────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

#### Features

| Feature | Description |
|---------|-------------|
| Compact Header | Logo + Ticker + Score in one glance |
| One-Line Hook | Catchy summary per stock category |
| Mini Score Bars | Visual Quality/Value/Growth indicators |
| HUGE BUY Button | 1.5× larger than Pass, green glow, pulsing |
| Particle Burst | 20 emojis explode on buy click |
| Haptic Feedback | Phone vibrates on button press |
| Swipe to Dismiss | Swipe down = Pass (mobile friendly) |
| Ring Multiplier Badge | Shows "3× Rewards!" on Ring 2/3 |

#### Stock Hook Categories

```typescript
const hooks = {
  growth: ["Rocket ship ready for liftoff", "Growth machine that keeps delivering"],
  value: ["Hidden gem at a discount", "Wall Street's sleeping on this one"],
  dividends: ["Passive income on autopilot", "Cash flow that never sleeps"],
  moats: ["Competition can't touch this", "Fortress business model"],
  turnarounds: ["Comeback story in progress", "The phoenix is rising"],
  elite: ["The crown jewel of investing", "Legendary wealth builder"],
}
```

#### Implementation Files
- `apps/investing-board-game-v3/src/components/StockModal.tsx`
- `apps/investing-board-game-v3/src/index.css` (button animations)

---

## Quick Reward Tiles

### Problem
Too many stock tiles (65%+) made gameplay slow and decision-heavy. Players wanted faster, more varied rewards.

### Solution: Replace 65% of Stock Tiles

#### New Tile Distribution

| Ring 1 (35 tiles) | Count | Percentage |
|-------------------|-------|------------|
| 💰⭐🪙🎲⚡🎁🔄 Quick Reward | 16 | 46% |
| 📈 Stock Tiles | 7 | 20% |
| 📰 Event Tiles | 6 | 17% |
| 🏠 Corner Tiles | 4 | 11% |
| ✨ Special | 2 | 6% |

| Ring 2 (24 tiles) | Count | Percentage |
|-------------------|-------|------------|
| Quick Reward | 11 | 46% |
| Stock Tiles | 5 | 21% |
| Event Tiles | 4 | 17% |
| Corner Tiles | 3 | 12% |
| Special | 1 | 4% |

#### Quick Reward Tile Types

| Type | Emoji | Base Reward | Ring 2 (3×) | Ring 3 (10×) | Rarity |
|------|-------|-------------|-------------|--------------|--------|
| Coin Drop | 🪙 | 10-50 | 30-150 | 100-500 | Common |
| Star Shower | ⭐ | 5-20 | 15-60 | 50-200 | Common |
| Cash Bonus | 💰 | $500-$2000 | $1.5K-$6K | $5K-$20K | Uncommon |
| XP Boost | ⚡ | 15-50 | 45-150 | 150-500 | Common |
| Bonus Roll | 🎲 | +1-2 rolls | +1-2 rolls | +1-2 rolls | Rare |
| Mystery Box | 🎁 | Random! | Random ×3 | Random ×10 | Uncommon |
| Chameleon | 🔄 | Changes each lap | — | — | Uncommon |

#### Auto-Collection Flow (NO POPUPS!)

```
Land on tile → Burst animation (30 emojis) → "+Amount" floats up 
→ Balance updates → Brief toast → Ready for next roll (~0.8s total)
```

#### Mobile-First Design
- 44px minimum touch targets
- Large readable emojis (3xl-4xl)
- Compact labels
- Haptic feedback on collection
- No text selection on rapid taps
- Smooth 60fps animations

#### Implementation Files
- `apps/investing-board-game-v3/src/lib/quickRewardTiles.ts`
- `apps/investing-board-game-v3/src/components/QuickRewardTile.tsx`
- `apps/investing-board-game-v3/src/lib/mockData.ts` (updated tile distribution)

---

## Currency Economy System

### Currency Hierarchy (Exponential Value)

```
🪙 Coins (1×)  →  ⭐ Stars (10×)  →  💵 Cash (100×)

100 Coins = 10 Stars = $1,000 Cash
```

| Currency | Emoji | Base Value | Primary Use |
|----------|-------|------------|-------------|
| Coins | 🪙 | 1 (base) | Convenience items, rerolls, skips |
| Stars | ⭐ | 10 | Cosmetics, themes, trails, dice skins |
| Cash | 💵 | 100 | Stocks, premium items, VIP status |
| XP | ⚡ | N/A | Leveling (not exchangeable) |

### Exchange System

#### Exchange Rates (5% fee on all exchanges)

| From | To | Rate | Minimum |
|------|----|------|---------|
| 100 🪙 Coins | 10 ⭐ Stars | 10:1 | 100 coins |
| 100 ⭐ Stars | $10,000 💵 | 100:1 | 10 stars |
| $1,000 💵 | 100 ⭐ Stars | 1:10 | $1,000 |
| $1,000 💵 | 100 🪙 Coins | 1:100 | $1,000 |

### Shop Categories

#### 🪙 Coins Shop (Convenience Items)

| Item | Price | Effect |
|------|-------|--------|
| Dice Reroll | 100 🪙 | Reroll dice once |
| Event Skip | 150 🪙 | Skip unwanted event |
| Peek Ahead | 75 🪙 | See next 3 tiles |
| Extra Roll | 200 🪙 | +1 daily roll |
| Star Boost (1hr) | 300 🪙 | 2× stars for 1 hour |
| Shield | 250 🪙 | Block 1 negative event |
| Lucky Charm | 400 🪙 | +10% rewards for 30 min |
| Teleport Token | 500 🪙 | Move to any tile on ring |

#### ⭐ Stars Shop (Cosmetics)

| Item | Price | Effect |
|------|-------|--------|
| Golden Dice | 500 ⭐ | Dice skin |
| Diamond Dice | 1000 ⭐ | Dice skin |
| Sparkle Trail | 300 ⭐ | Movement trail |
| Rainbow Trail | 600 ⭐ | Movement trail |
| Dark Theme | 400 ⭐ | Board theme |
| Neon Theme | 600 ⭐ | Board theme |
| Gold Avatar Frame | 800 ⭐ | Profile decoration |
| Diamond Avatar Frame | 2000 ⭐ | Profile decoration |

#### 💵 Cash Shop (Premium)

| Item | Price | Effect |
|------|-------|--------|
| Premium Season Pass | $50,000 | Unlock premium rewards |
| Ring Skip Ticket | $25,000 | Jump to Ring 2 |
| Starter Stock Pack | $10,000 | 3 random stocks (6+ score) |
| VIP Status (30 days) | $100,000 | +50% all rewards |

### Mystery Box Rewards

| Rarity | Chance | Reward | Ring Multiplier |
|--------|--------|--------|-----------------|
| ⚪ Common | 60% | 50-200 🪙 Coins | Yes |
| 🟢 Uncommon | 25% | 20-50 ⭐ Stars | Yes |
| 🔵 Rare | 12% | $1,000-$5,000 💵 | Yes |
| 🟣 Epic | 2.5% | Random Shop Item | No |
| 🌟 LEGENDARY | 0.5% | JACKPOT! All currencies + Premium item | Yes |

### Database Tables

```sql
-- Currency exchange history
currency_exchanges (id, profile_id, from_currency, to_currency, from_amount, to_amount, exchange_rate, created_at)

-- Shop items catalog
shop_items (id, name, description, category, currency, price, rarity, is_consumable, icon, effect_data, is_active)

-- Mystery box history
mystery_box_history (id, profile_id, box_type, rarity_rolled, reward_type, reward_amount, reward_item_id, ring_multiplier)

-- Added to board_game_profiles:
lifetime_cash_earned, lifetime_stars_earned, lifetime_coins_earned, lifetime_xp_earned, mystery_boxes_opened, legendary_items_found
```

#### Implementation Files
- `supabase/patches/029_currency_economy.sql`
- `apps/investing-board-game-v3/src/lib/currencyConfig.ts`
- `apps/investing-board-game-v3/src/lib/mysteryBox.ts`
- `apps/investing-board-game-v3/src/components/CurrencyExchange.tsx`

---

## Celebration System

### Epic 200-Emoji Fireworks

When collecting rewards, a satisfying multi-phase animation plays.

#### Animation Sequence (1.5s total)

```
PHASE 1: BURST (0.4s)
- 200 emojis explode outward from tile
- 360° spread with varied distances (30-150px)
- Staggered delays for wave effect
- Amount text pops up (+150 🪙)

PHASE 2: SWIRL (0.6s)
- Emojis spiral inward
- Quarter rotation creates vortex effect
- Emojis cluster together

PHASE 3: FLOW (0.5s)
- Emojis stream toward currency counter (top-left)
- Bezier curve path for natural motion
- Emojis fade as they approach target

PHASE 4: PULSE
- Counter glows and scales (1.15×)
- Number increments with animation
- Ring ripple effect expands outward
- Haptic feedback on mobile
```

#### Celebration Configuration

| Reward Type | Emoji | Particle Count | Burst Radius |
|-------------|-------|----------------|--------------|
| Coins | 🪙 | 200 | 150px |
| Stars | ⭐ | 200 | 150px |
| Cash | 💵 | 200 | 150px |
| XP | ⚡ | 150 | 120px |
| Mystery Box | 🎁✨🌟 | 250 | 180px |
| Legendary | 🌟💎👑 | 300 | 200px |

#### Counter Animation

```typescript
// Counter pulse effect on reward collection
{
  scale: [1, 1.15, 1.05, 1],
  boxShadow: ['0 0 0px', '0 0 30px gold', '0 0 15px gold', '0 0 0px'],
}
```

#### Performance Considerations
- Use CSS transforms (GPU accelerated)
- Limit to 60fps with requestAnimationFrame
- Reduce particles on low-end devices
- Respect `prefers-reduced-motion`

#### Implementation Files
- `apps/investing-board-game-v3/src/components/EpicCelebration.tsx`
- `apps/investing-board-game-v3/src/components/CurrencyCounter.tsx`
- `apps/investing-board-game-v3/src/hooks/useCelebration.ts`

---

## Recent Implementation Log

### Sprint: January 2026

| PR | Title | Status | Description |
|----|-------|--------|-------------|
| PR 1 | Stock Modal Redesign | ✅ Submitted | Compact info + HUGE buttons |
| PR 2 | Quick Reward Tiles | ✅ Submitted | 65% less stocks, fast rewards |
| PR 2.5 | Currency Economy | ✅ Merged | Exchange, shops, mystery box |
| PR 3 | Epic Celebration | ✅ Submitted | 200-emoji fireworks + flow |

### SQL Migrations Applied

| Patch | Description | Date Applied |
|-------|-------------|--------------|
| 029_currency_economy.sql | Currency exchange, shop items, mystery box | 2026-01-16 |

### Upcoming PRs (Planned)

| Priority | Feature | Description |
|----------|---------|-------------|
| P0 | Portal Animation | Glow → Fade → Materialize sequence |
| P0 | Ring 3 Victory Lap | $20K rewards, Black Swan danger |
| P1 | Wheel of Fortune | First mini-game implementation |
| P1 | Ring Transition Polish | Smooth ascend/descend animations |
| P2 | Throne Victory | Epic final celebration sequence |
| P2 | Sound Effects | Audio feedback for all actions |

---

## Priority Roadmap

### P0: Core Gameplay (Must Have for V1)
- [x] Ring 1 board and tiles
- [x] Dice rolling and movement
- [x] Stock purchase system
- [x] Quiz and casino mechanics
- [x] Net Worth tier progression
- [x] **Stock Modal Redesign**
- [x] **Quick Reward Tiles**
- [x] **Currency Economy System**
- [x] **Epic Celebration System**
- [ ] Multi-ring UI rendering
- [ ] Portal animation polish
- [ ] Ring transition animations

### P1: Retention Features (Launch Week)
- [x] Ring multipliers (3× and 10×)
- [x] **Currency Exchange**
- [x] **Mystery Box System**
- [x] **Shop Items**
- [ ] Wheel of Fortune mini-game
- [ ] Elite stock special behaviors
- [ ] Throne victory sequence
- [x] Daily login rewards
- [x] Weekly challenges
- [ ] Social features (leaderboard)

### P2: Depth & Engagement (Month 1)
- [ ] Ring-based leaderboards
- [ ] Ring history tracking
- [ ] Sound effects system
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
