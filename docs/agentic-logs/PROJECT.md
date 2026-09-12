# Project: Astro 4.15 to Astro 6.2 Complete Migration

## Architecture
- **Framework**: Astro 4.15 -> Astro 6.2 (Static output mode with `@astrojs/cloudflare` SSR for API routes).
- **Runtime**: Cloudflare Workers / Pages with Cloudflare D1 SQL database binding (`locals.runtime.env.DB`).
- **Routing**: Static content page generation with SSG dynamic routes (`[...slug].astro` -> `[...id].astro`) and API endpoints (`prerender = false`).
- **Client Router**: Transition from `astro:transitions` `<ViewTransitions />` to `astro:transitions/client` `<ClientRouter />` with event lifecycle handler shims (`onPageSwap`).
- **Content Layer**: Migration from legacy `astro:content` (`defineCollection` with implicit schema/file loading) to Content Layer API (`glob`/`file` loaders from `astro/loaders`, `astro/zod`).
- **Preservation Shims**: `src/lib/content-shims.ts` (`entryPath`, `renderEntry`) and `src/lib/page-events.ts` (`onPageSwap`).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | R0 Pre-flight Gate Verification | Verify D1 migration scripts, verify tables in local SQLite, confirm baseline files in docs/baseline/, verify package scripts | M0 | ORIGINAL_REQUEST §R0 |
| 2 | R1 Head Router Isolation | Isolate transition/router import in `src/components/Head.astro` via `ClientRouterShim.astro` or dedicated shim | M1 | ORIGINAL_REQUEST §R1 |
| 3 | R1 Lifecycle Event Helper | Centralize 8 `astro:after-swap` listener points into `src/lib/page-events.ts` (`onPageSwap`) | M1 | ORIGINAL_REQUEST §R1 |
| 4 | R1 Content Shims | Implement `entryPath` and `renderEntry` in `src/lib/content-shims.ts` and apply to page routes | M1 | ORIGINAL_REQUEST §R1 |
| 5 | R1 Output Baseline Preservation | Ensure HTML, canonical URLs, OG tags, JSON-LD, RSS remain byte/structure equivalent to baseline | M1 | ORIGINAL_REQUEST §R1 |
| 6 | R2 Dependency Upgrades | Upgrade `package.json` to Astro 6.2.x and compatible companion plugins | M2 | ORIGINAL_REQUEST §R2 |
| 7 | R2 Config & Vite 7 Update | Update `astro.config.mjs` (`output: "static"`, `legacy.collectionsBackwardsCompat: true`, Cloudflare adapter, Vite 7 / PostCSS) | M2 | ORIGINAL_REQUEST §R2 |
| 8 | R2 Schema Imports | Update `src/content/config.ts` to use `z` from `astro/zod` | M2 | ORIGINAL_REQUEST §R2 |
| 9 | R3 ClientRouter Component | Replace `<ViewTransitions />` with `<ClientRouter />` in `Head.astro` / shim | M3 | ORIGINAL_REQUEST §R3 |
| 10 | R3 Event Lifecycle Validation | Validate all post-swap event listeners re-bind and fire properly across navigations | M3 | ORIGINAL_REQUEST §R3 |
| 11 | R4 Route Normalization | Migrate route params and queries from `entry.slug` to `entry.id` and `render(entry)` via shims | M4 | ORIGINAL_REQUEST §R4 |
| 12 | R4 Content Layer Loaders | Migrate all 8 collections in `src/content/config.ts` to `glob()`/`file()` loaders | M4 | ORIGINAL_REQUEST §R4 |
| 13 | R4 Legacy Mode Removal | Remove `legacy.collectionsBackwardsCompat: true` from `astro.config.mjs` and verify clean build | M4 | ORIGINAL_REQUEST §R4 |
| 14 | R5 Atomic Git Commits | Ensure atomic conventional commit for each slice on the worktree | Continuous | ORIGINAL_REQUEST §R5 |
| 15 | R5 Task Sync & ADR | Keep `central_milestones.md`, `codex_tasks.md`, `claude_tasks.md`, `gemini_tasks.md`, `jules_tasks.md`, and `docs/astro_6_2_decisions.md` synchronized | Continuous | ORIGINAL_REQUEST §R5 |
| 16 | E2E Regression Verification | Automated verification of baseline HTML, RSS, sitemaps, API contracts, build, and astro check | M_FINAL | ORIGINAL_REQUEST §Acceptance Criteria |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M0 | Pre-flight Verification Gate | Verify D1 schema, DB scripts, baseline artifacts, add `"test:db"` to package.json | none | DONE |
| M_E2E | E2E Regression Test Suite | Build automated baseline diff and contract test runner; emit TEST_READY.md | M0 | DONE |
| M1 | Content & SEO Preservation Shims | Implement router isolation, `onPageSwap` helper, `entryPath`/`renderEntry` shims, test against baseline (Milestone 4) | M0 | DONE |
| M2 | Phased Astro 6.2 Dependencies & Config | Upgrade dependencies, update `astro.config.mjs`, update `astro/zod` (Milestone 5 Slices 1–2) | M1 | DONE |
| M3 | Client Router Migration & Event Stabilization | Switch to `<ClientRouter />`, verify all 8 swap event listeners (Milestone 5 Slice 3) | M2 | DONE |
| M4 | Content Layer Loaders & API Normalization | Migrate routes to `id`, convert collections to loaders, remove legacy compat (Milestone 5 Slices 4–5) | M3 | DONE |
| M_FINAL | Full E2E Pass & Adversarial Hardening | 100% pass on E2E test suite (Tiers 1–4) + Tier 5 adversarial stress testing | M4, M_E2E | DONE |

## Interface Contracts
### Preservation Shims ↔ Page Routes
- `entryPath(collection: string, entry: { id?: string; slug?: string }): string`
  - Returns canonical path URL string (e.g. `/articles/${slug_or_id}`).
- `renderEntry(entry: any): Promise<{ Content: any; headings: any[]; remarkPluginFrontmatter: Record<string, any> }>`
  - Handles both Astro 4 `entry.render()` and Astro 6 `render(entry)`.
- `onPageSwap(callback: () => void): () => void`
  - Registers lifecycle listener on `astro:after-swap` (and runs on initial DOM ready if specified), returning unsubscribe function.

### Database API Contract
- `getDatabase(locals: APIContext['locals']): { DB: D1Database; errorResponse?: Response }`
  - Validates `locals?.runtime?.env?.DB`. If missing or invalid, returns `{ DB: null, errorResponse: Response (500) }`.

## Code Layout
- `src/lib/content-shims.ts` — `entryPath`, `renderEntry`, `getAdjacentEntries` shims
- `src/lib/page-events.ts` — Centralized client router event lifecycle helper (`onPageSwap`)
- `src/components/ClientRouterShim.astro` or `src/components/Head.astro` — Isolated router component
- `src/content/config.ts` — Content Layer collection schemas with `glob()`/`file()` loaders
- `src/pages/api/` — 7 Cloudflare D1 API routes (`prerender = false`)
- `scripts/verify-baseline-diff.js` — Automated regression diff runner against `docs/baseline/`
- `tests/` — Vitest unit & regression suites
