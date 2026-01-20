# WebM FX System Dev Plan

This plan documents the proposed WebM FX overlay system and a few refinements to make it more robust, testable, and performant.

## Goal

Add a single, reusable WebM “FX player” system that can instantly play any of these animations as full-screen overlays (or optionally anchored to a UI region), using one `<video>` element and swapping `src`.

Target IDs (20 total):

1. `loading`
2. `welcome`
3. `win_cash_small`
4. `win_cash_big`
5. `smash_room`
6. `mini_game_1`
7. `mini_game_2`
8. `mini_game_3`
9. `mini_game_4`
10. `mini_game_5`
11. `shop`
12. `protools`
13. `estate`
14. `leaderboard`
15. `placeholder_1`
16. `placeholder_2`
17. `placeholder_3`
18. `placeholder_4`
19. `placeholder_5`
20. **Reserve for future** (optional: add `placeholder_6` if we want exactly 20 unique placeholders)

Also: if the repo is missing WebM files, generate demo WebMs so the system works immediately.

## Constraints

- Must feel instant on repeat plays.
- Must run well on mobile Safari/Chrome.
- Must support muted, autoplay overlay effects (user gesture safe).
- Must have fallback if an FX file is missing.
- Must not create 20 video elements (use a pool: 1 overlay player).

## Step 0 — Repo discovery (required first step)

1. Identify framework:
   - React / Next.js / Vite / plain HTML / Phaser / Pixi / other.
2. Identify public/static assets folder:
   - Next.js: `public/`
   - Vite/CRA: `public/` (or `src/assets` with bundler import rules)
3. Identify whether a Service Worker already exists (PWA):
   - Look for `service-worker.*`, `sw.js`, workbox, `vite-plugin-pwa`, `next-pwa`, etc.
4. Identify routing / screens (welcome, shop, leaderboard, etc.) so we can wire demo triggers.

Write findings in `docs/fx-video-system/NOTES.md`.

## Step 1 — Canonical folder structure

Create:

- `public/fx/` (or the equivalent static folder)
- `public/fx/manifest.json`
- `public/fx/videos/`
- `loading.webm`
- `welcome.webm`
- `win_cash_small.webm`
- `win_cash_big.webm`
- `smash_room.webm`
- `mini_game_1.webm` … `mini_game_5.webm`
- `shop.webm`
- `protools.webm`
- `estate.webm`
- `leaderboard.webm`
- `placeholder_1.webm` … `placeholder_5.webm`

If the repo’s convention uses another assets path, mirror this structure there, but keep the same runtime URLs if possible.

## Step 2 — Add FX manifest

Create `public/fx/manifest.json`:

```json
{
  "version": 1,
  "basePath": "/fx/videos",
  "items": [
    { "id": "loading", "file": "loading.webm", "loop": true, "volume": 0 },
    { "id": "welcome", "file": "welcome.webm", "loop": false, "volume": 0 },
    { "id": "win_cash_small", "file": "win_cash_small.webm", "loop": false, "volume": 0 },
    { "id": "win_cash_big", "file": "win_cash_big.webm", "loop": false, "volume": 0 },
    { "id": "smash_room", "file": "smash_room.webm", "loop": false, "volume": 0 },
    { "id": "mini_game_1", "file": "mini_game_1.webm", "loop": false, "volume": 0 },
    { "id": "mini_game_2", "file": "mini_game_2.webm", "loop": false, "volume": 0 },
    { "id": "mini_game_3", "file": "mini_game_3.webm", "loop": false, "volume": 0 },
    { "id": "mini_game_4", "file": "mini_game_4.webm", "loop": false, "volume": 0 },
    { "id": "mini_game_5", "file": "mini_game_5.webm", "loop": false, "volume": 0 },
    { "id": "shop", "file": "shop.webm", "loop": false, "volume": 0 },
    { "id": "protools", "file": "protools.webm", "loop": false, "volume": 0 },
    { "id": "estate", "file": "estate.webm", "loop": false, "volume": 0 },
    { "id": "leaderboard", "file": "leaderboard.webm", "loop": false, "volume": 0 },
    { "id": "placeholder_1", "file": "placeholder_1.webm", "loop": false, "volume": 0 },
    { "id": "placeholder_2", "file": "placeholder_2.webm", "loop": false, "volume": 0 },
    { "id": "placeholder_3", "file": "placeholder_3.webm", "loop": false, "volume": 0 },
    { "id": "placeholder_4", "file": "placeholder_4.webm", "loop": false, "volume": 0 },
    { "id": "placeholder_5", "file": "placeholder_5.webm", "loop": false, "volume": 0 }
  ]
}
```

Notes:

- `loop: true` typically only for `loading`.
- `volume: 0` by default to guarantee autoplay on mobile.

## Step 3 — Demo WebM generation (required if files missing)

### Requirement

If any required WebM file is missing, generate a demo file in the correct location so the system can be tested immediately.

### Implementation approach

Create:

- `scripts/fx/generate-demo-webm.sh` (mac/linux)
- `scripts/fx/generate-demo-webm.ps1` (windows, optional)
- `scripts/fx/verify-fx-assets.js` (node script that checks and calls generator if available)

### 3A) Node verifier script

Create `scripts/fx/verify-fx-assets.js`:

- Reads `public/fx/manifest.json`.
- For each file, checks if it exists under `public/fx/videos/`.
- If missing:
  - If `ffmpeg` exists on `PATH`, generate a demo WebM.
  - Else, create a small `.txt` marker and ensure runtime uses a fallback built-in “safe” animation (see Step 5 fallback).

### 3B) Demo WebM generator via ffmpeg

Create `scripts/fx/generate-demo-webm.sh`:

- For each missing file, generate a short 0.7–1.0s WebM with:
  - resolution 720p (fullscreen) or 1080p if the app is heavy on large screens (prefer 720p for performance)
  - simple animated pattern + big center label (if label text requires unavailable fonts, use color bars + motion)
- Recommended encoding:
  - VP9, CRF 34–38, 30fps, short duration

Keep demos small. Target <= 300–800 KB each for fullscreen 1s.

### 3C) Add package script hook

In `package.json`:

- Add `"fx:verify": "node scripts/fx/verify-fx-assets.js"`.
- Run it in CI and/or `postinstall` (optional). If `ffmpeg` missing, do not fail builds—warn instead.

## Step 4 — Build the FX Player (single video element “pool”)

### What it does

- Loads manifest.
- Exposes `playFx(id, options)`.
- Uses one overlay `<video>` element.
- Swaps `src` to the chosen WebM.
- Starts on first frame as fast as possible.
- Supports:
  - `loop`, `onEnd`, `durationCapMs`, `zIndex`, `opacity`, `blendMode` (optional)

### Files to create

If React/Next:

- `src/fx/FxManifest.ts`
- `src/fx/FxController.ts`
- `src/fx/FxOverlay.tsx`
- `src/fx/fx.css`

If vanilla:

- `src/fx/fx-manifest.js`
- `src/fx/fx-controller.js`
- `src/fx/fx-overlay.js`
- `src/fx/fx.css`

### Core rules

- Must set: `muted`, `playsInline`, `preload="metadata"`.
- Avoid multiple `<video>` tags for each effect.
- Use one overlay video + swap its `src`.

## Step 5 — Runtime fallback rules (must never break UX)

If an FX file is missing or fails to load:

1. Try `placeholder_1` (or `loading`) if available.
2. If that also fails:
   - Show a lightweight CSS animation overlay (pure CSS) for 300–600ms.
   - Continue app flow (never block).

This guarantees “instant” even on missing assets.

## Step 6 — Preload strategy for “instant”

Define 3 tiers:

- **Hot**: always preload soon (after first user interaction)
  - `loading`, `welcome`, `win_cash_small`, `shop`, `protools` (tweak as desired)
- **Warm**: prefetch based on proximity/state
  - minigames and big win effects when user is near those states
- **Cold**: load on demand
  - placeholders, rarely used effects

Implement prefetch:

- Create `prefetchFx(ids: string[])`.
- Use `requestIdleCallback` where available, fallback to `setTimeout`.
- Use `fetch()` to warm Cache Storage (best when Service Worker exists).
- If SW doesn’t exist, rely on browser cache; still helps.

## Step 7 — (If PWA) Service Worker caching

If a SW already exists:

- Add runtime caching rule for `/fx/videos/*.webm`.
- `CacheFirst` for repeat instant playback.
- Limit cache size (e.g., 30 entries).

If no SW exists:

- Don’t create a brand-new PWA unless the repo already intends it.
- Still implement prefetch; it will use HTTP cache.

## Step 8 — Wire it into screens and game events

Add calls like:

- On app start / route enter:
  - `playFx("loading", { loop: true })`
  - then stop when content ready
- On first visit:
  - `playFx("welcome")`
- On reward:
  - small: `playFx("win_cash_small")`
  - big: `playFx("win_cash_big")`
- On entering a screen:
  - shop: `playFx("shop")`
  - leaderboard: `playFx("leaderboard")`
  - protools: `playFx("protools")`
  - estate: `playFx("estate")`
- On smash room:
  - `playFx("smash_room")`
- On launching minigame N:
  - `playFx("mini_game_N")`

Also add a hidden “FX Test Panel” in dev mode:

- Buttons for each FX id
- Shows load success/failure
- Shows timing to first frame (rough measurement)

## Step 9 — Acceptance criteria

- App does not create 20+ video elements.
- All 20 IDs resolve via manifest.
- If videos are missing, demo WebMs are generated (or CSS fallback used).
- `loading` can loop without stutter.
- Replaying the same FX is instant after first play.
- Mobile Safari: video plays muted + inline without fullscreen hijack.
- No hard failures if any FX is missing.

## Step 10 — Commit plan

1. `chore(fx): add fx folder structure + manifest`
2. `chore(fx): add demo generator + verifier scripts`
3. `feat(fx): implement single overlay FX player + API`
4. `feat(fx): add preload + (optional) SW caching rule`
5. `feat(fx): wire events + add dev test panel`

## Optional: second video pool (future)

If you later want “tile-anchored” effects (not full-screen), add:

- `FxBoardAnchor` with a second video element sized 128–256px
- Same manifest, different renderer

Not required for this milestone.

## Refinements to improve the plan

These refinements keep the spirit of the plan while increasing safety, predictability, and performance.

1. **Manifest schema validation**
   - Add a small JSON schema or runtime validation in the FX loader to surface missing IDs early in dev.
2. **Explicit caching budget**
   - Define a max total MB budget for FX assets to avoid bloating caches on mobile.
3. **Startup behavior guard**
   - Ensure `playFx("loading")` doesn’t block time-to-interactive; automatically stop after a max duration if app is ready.
4. **Analytics hooks**
   - Emit optional events for FX play success/failure, time-to-first-frame, and fallback usage.
5. **Device capability checks**
   - Allow a fast opt-out for low-memory devices (skip heavy FX or downscale by serving smaller WebMs).
6. **Accessibility consideration**
   - Respect `prefers-reduced-motion`; if enabled, skip video and use the CSS fallback animation with reduced intensity.
7. **Layering policy**
   - Define overlay z-index scale for FX to avoid accidental overlap with modals or system UI.

