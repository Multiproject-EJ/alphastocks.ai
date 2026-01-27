# ProTools Navigation Log

Track investigations and fixes for navigation between ProTools and Board Game V3.

## Entry Template
- **Date (UTC):** YYYY-MM-DD
- **Issue:** What was observed.
- **Diagnosis:** What was inspected or reproduced.
- **Fix:** What changed (include file paths).
- **Verification:** How it was confirmed.

---

- **Date (UTC):** 2026-01-27
- **Issue:** ProTools opened from Board Game V3 briefly before returning to the board game.
- **Diagnosis:** Added runtime diagnostics to capture navigation attempts, popup behavior, and fallback overlay usage.
- **Fix:** Added diagnostics logger to Board Game V3 and workspace, plus DevTools overlay display. (`apps/investing-board-game-v3/src/lib/proToolsDiagnostics.ts`, `apps/investing-board-game-v3/src/devtools/DevToolsOverlay.tsx`, `workspace/src/lib/proToolsDiagnostics.js`, `workspace/src/App.jsx`)
- **Verification:** Capture events in DevTools overlay using `?devtools=1` and inspect `localStorage` key `protools.navigation.log.v1`.
