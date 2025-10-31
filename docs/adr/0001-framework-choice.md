# ADR 0001: Frontend Framework & Tooling Direction

- **Status:** Accepted
- **Date:** 2025-11-01
- **Context:** AlphaStocks.ai currently ships as static HTML/CSS/JS. The roadmap expects: rich dashboard interactions, offline-aware PWA shell, shared data layer, and AI-assisted workflows. We must decide whether to continue with vanilla assets or introduce a lightweight framework and bundler to support upcoming complexity while preserving fast loads and the existing design system.

## Considered Options

### 1. Stay on Vanilla JS + Incremental Modules
- **Pros:**
  - Zero new tooling; easy hosting on static CDNs.
  - No framework runtime cost, ideal for critical performance budgets.
  - Keeps onboarding trivial for designers comfortable with HTML/CSS.
- **Cons:**
  - Manual state management becomes brittle as we layer data services, offline caches, and AI task orchestration.
  - Harder to reuse UI patterns (cards, drawers, modals) without a component model.
  - Testing and bundling (ESM splits, tree-shaking) must be hand-rolled once we introduce service workers and push notifications.

### 2. Adopt SvelteKit
- **Pros:**
  - Compiler-based framework keeps runtime minimal while delivering component ergonomics.
  - Built-in routing, data loading, and PWA support via adapters.
- **Cons:**
  - Requires opinionated file-system routing that diverges from our current static site layout.
  - SSR-first approach is unnecessary for our static hosting targets and increases complexity for contributors unfamiliar with Svelte.
  - Migrating existing HTML would require significant refactors before we can deliver feature work.

### 3. Adopt Preact + Vite (Recommended)
- **Pros:**
  - Preact delivers React-like DX in ~3kb gzip, aligning with the "smooth PWA" goal without heavy runtime.
  - Vite provides an instant development server, TypeScript support, and production builds with code-splitting—critical for managing the growing codebase and service worker assets.
  - We can progressively enhance: keep marketing pages static, mount Preact islands into `index.html`/future workspace routes, and gradually port widgets (dashboard cards, check-in form, etc.).
  - Rich ecosystem compatibility (hooks, component libraries, testing tools) while staying framework-agnostic enough for contributors coming from React.
- **Cons:**
  - Introduces build tooling (Node dependency) and CI updates.
  - Requires a thin compatibility layer for existing global styles and script in `assets/main.js`.

## Decision
We will migrate the workspace application (everything under `index.html` and future authenticated views) to **Preact powered by Vite**, keeping marketing pages as plain HTML. This balances performance, developer experience, and the ability to scale complex interactions.

## Consequences & Implementation Notes
1. **Project Layout**
   - Create `app/` (Vite workspace) alongside current root. Output production assets to `dist/` and deploy via static hosting.
   - Marketing pages remain in root for now; once Vite build is wired, copy them into the output folder during deployment.
2. **Progressive Adoption**
   - Initial Vite app will hydrate inside a `<div id="app-root">` inside `index.html`. Legacy scripts will be converted into Preact components incrementally.
   - Shared styles migrate into a global stylesheet imported by Vite; keep `assets/styles.css` as the source of truth until components are ported.
3. **PWA Support**
   - Leverage Vite plugins (`@vite-pwa`) to generate manifest and service worker once baseline app structure is in place.
   - Ensure data service modules remain framework-agnostic so demo/Supabase adapters work in both static fallback and Preact components.
4. **Tooling**
   - Node 20 LTS as minimum dev environment; add `package.json` with scripts (`dev`, `build`, `preview`, `lint`).
   - Introduce ESLint + Prettier with Preact recommendations for consistent code style.
5. **Developer Enablement**
   - Document migration guide in README, including how to run Vite dev server and how to embed demo data during development.

This decision positions AlphaStocks.ai for scalable feature development while respecting the original lightweight goals.
