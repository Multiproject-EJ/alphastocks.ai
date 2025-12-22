# ValueBot Add-On Engine (Module 7) — Notes

## Current Deep-Dive Flow (Modules 0–6)
- Server worker entrypoint: `api-lib/valuebot/runDeepDiveForConfig.js` (front-end mirror in `workspace/src/features/valuebot/runDeepDiveForConfig.ts`).
- The worker chains Module 0–6 prompts via `/api/stock-analysis`, then derives score labels with `/api/valuebot?action=meta-summary`.
- Deep-dive outputs are saved to `valuebot_deep_dives`; `investment_universe` is upserted with the latest risk/quality/timing labels, composite score, and model snapshot.
- Queue orchestration: `api-lib/valuebot/runQueueWorker.js` loads `valuebot_analysis_queue` rows and runs `runDeepDiveForConfigServer` per job.

## Module 7 Hook (Add-On Engine)
- Module 7 runs **after** Module 6 and the score summary.
- Inputs: the freshly produced Module 0–6 markdown, the master meta (risk/quality/timing/composite), and the existing `investment_universe` row for the ticker.
- Controller step: Add-On Assessment prompt decides which specialised modules to run.
- First concrete module: **High Debt Stress Test**.
- Outputs: optional refined scores, add-on flags, and a concise `addon_summary` persisted back to `investment_universe` alongside `last_addon_run_at`.
- Feature flag: controlled via `ENABLE_ADDON_ENGINE`; when disabled the deep-dive flow is unchanged.

## Data Model Touchpoints
- `investment_universe` stores latest ValueBot signals; new add-on fields are appended via Supabase patch 012.
- Deep-dive storage remains in `valuebot_deep_dives` (modules 0–6 markdown only). Add-on deltas update the universe row but do **not** rewrite the deep-dive artifact.

## Usage
- Workers should call `runAddOnEngineForTicker` (from `api-lib/valuebot/addons/module7AddOnEngine.js`) after the Module 6 summary when `ENABLE_ADDON_ENGINE` is truthy.
- The orchestrator handles assessment selection, runs module handlers, merges score/flag deltas, and persists the universe update.
