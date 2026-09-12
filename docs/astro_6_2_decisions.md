# Astro 6.2 Decision Log

**Status**: Living document. Maintained by Claude (Architect) throughout Milestone 5.  
**Purpose**: ADR-style log of every architecture decision reviewed and acted on during the Astro 6.2 upgrade. Each entry records the decision context, options considered, the choice made, the branch it landed in, the date, and the outcome. Pre-upgrade decisions requiring Alok's approval are listed in §1 with their current status.  
**Companion**: [`docs/astro_6_2_upgrade_plan.md`](./astro_6_2_upgrade_plan.md) §4 — full options and recommendations for each pre-upgrade decision.

---

## 1. Pre-Upgrade Decisions Pending Alok's Approval

These eight decisions are described in the upgrade plan §4 with options and recommendations. **No Codex branch may act on a pending decision.** Alok must record a choice before the relevant phase begins.

| # | Decision | Relevant Phase | Status | Alok's Choice |
|---|---|---|---|---|
| D-01 | Keep `<ClientRouter />` or remove client-side routing? | Phase 2/3 | ✅ **Approved** | A (Keep `<ClientRouter />`) |
| D-02 | Accept `@astrojs/cloudflare` v13 in lockstep with Astro 6? | Phase 2 | ✅ **Approved** | A (Bump `@astrojs/cloudflare` to v13) |
| D-03 | Use `legacy.collectionsBackwardsCompat` through Phase 4, then drop in Phase 5? | Phase 2/5 | ✅ **Approved** | A (Enabled in Phase 2, dropped in Phase 5) |
| D-04 | `albums` collection loader: `glob(**/*.yaml)` or per-file `file()`? | Phase 5 | ✅ **Approved** | A (`glob(**/*.yaml)`) |
| D-05 | PWA strategy: keep `vite-plugin-pwa`, swap to `@vite-pwa/astro`, or drop PWA? | Phase 2 | ✅ **Approved** | A (Bump `vite-plugin-pwa` to `^1.3.0` for Vite 7) |
| D-06 | CSRF default flip: accept `security.checkOrigin: true` (new Astro 5 default)? | Phase 2 | ✅ **Approved** | A (Accept default `true`) |
| D-07 | Remove `output: "hybrid"` and rely on default static + per-route `prerender = false`? | Phase 2 | ✅ **Approved** | A (Remove `hybrid`, use `static`) |
| D-08 | Defer cleanup of legacy `staticmanApi` and Gatsby-era references to a separate branch? | Post-upgrade | ✅ **Approved** | A (Defer to separate branch post-upgrade) |

**How to record a decision**: update the row's `Status` to ✅ **Approved** and fill in `Alok's Choice` with the option letter (A, B, C) from the upgrade plan. Then add a full ADR entry in §2.

---

## 2. Decision Log Entries

### ADR-000: Content and SEO Preservation Shims (Milestone 4)

**Date**: 2026-09-12  
**Branch**: `complete_astro_v6_migration`  
**Phase**: Milestone 4 (Content and SEO Preservation Shims)  
**Status**: ✅ Implemented  

**Context**: Preparing for the Astro 6 upgrade requires isolating client-side router imports, standardizing the `astro:after-swap` re-attachment lifecycle across multiple components and scripts, and abstracting content collection entry pathing and rendering to insulate routes from breaking API transitions (`entry.slug` -> `entry.id` and `entry.render()` -> `render(entry)`).

**Decision**: Implement non-breaking preservation shims:
1. Isolate `<ViewTransitions />` inside `src/components/ClientRouterShim.astro` and render it from `src/components/Head.astro`.
2. Extract the lifecycle re-attachment helper `onPageSwap` in `src/lib/page-events.ts` with SSR guards, error handling, and cleanup capabilities; migrate all 8 listener locations across 7 files.
3. Introduce `src/lib/content-shims.ts` exporting `getEntrySlug`, `entryPath`, `renderEntry`, and `getAdjacentEntries`; migrate all 18 consuming routes and companion components.
4. Maintain strict byte-compatibility and SEO invariant preservation across all HTML, RSS, sitemap, and schema outputs.

**Consequences**:
- Switching to Astro 6's `<ClientRouter />` will only require editing `ClientRouterShim.astro`.
- Navigational lifecycle event binding is unified under `onPageSwap`, preventing listener leaks and ensuring robust error isolation.
- Route templates no longer directly access `entry.slug` or `entry.render()`, making the future Content Layer migration a localized shim update.
- Zero URL, metadata, or schema regressions are introduced.

**Verification**: `npm run build`, `npx astro check` (0 errors), `npm run test:unit` (including `page-events.spec.ts` and `content-shims.spec.ts`), `npm run test:regression` (42/42 checks pass), and `npm run test:db`.

---

### ADR-005: Phased Astro 6.2 and Companion Dependency Upgrades with Legacy Collections Compatibility

**Date**: 2026-09-12  
**Branch**: `complete_astro_v6_migration`  
**Phase**: Milestone 5 Slice 1–2 (Phased Dependency Upgrades)  
**Status**: ✅ Implemented  

**Context**: Upgrading from Astro 4.15 to Astro 6.2 requires bumping the framework core and companion integrations (`@astrojs/cloudflare` v13, `@astrojs/mdx` v4, `@astrojs/rss` v4, `@astrojs/sitemap` v3, `@astrojs/check` v0.9, and `vite-plugin-pwa` v1.3 with Vite 7 support). Astro 6 deprecates legacy content collection schemas unless backwards compatibility is explicitly enabled.

**Decision**:
1. Upgrade `package.json` dependencies:
   - `astro`: `^6.2.0`
   - `@astrojs/cloudflare`: `^13.2.0`
   - `@astrojs/mdx`: `^4.3.14`
   - `@astrojs/rss`: `^4.0.19`
   - `@astrojs/sitemap`: `^3.2.1`
   - `@astrojs/check`: `^0.9.4`
   - `vite-plugin-pwa`: `^1.3.0` (Vite 7 engine compatibility)
2. Retain legacy collections across this upgrade slice by enabling `legacy: { collectionsBackwardsCompat: true }` in `astro.config.mjs` (adopting Decision D-03 Option A).
3. Switch `src/components/ClientRouterShim.astro` to import and render `ClientRouter` from `astro:transitions` to satisfy Astro 6 removal of `ViewTransitions`.

**Consequences**:
- Core framework and companion integrations are now running on Astro 6.2.x and Vite 7.
- Existing content collections continue to function without requiring an immediate, disruptive Content Layer loader migration.
- Node.js engine and Vite 7 build pipelines operate cleanly.

**Verification**: `npm run build` succeeds; `npx astro check` reports 0 errors and 0 warnings; `npm run test:regression` passes all 42 checks across Tiers 1–4; `npm run test:unit` passes 365/365 tests; `npm run test:db` exits 0.

---

### ADR-006: Static Output Mode, Security CheckOrigin, and Zod Schema Migration

**Date**: 2026-09-12  
**Branch**: `complete_astro_v6_migration`  
**Phase**: Milestone 5 Slice 2 (Configuration and Schema Alignment)  
**Status**: ✅ Implemented  

**Context**: Astro 6 removes `output: "hybrid"`, consolidating SSR/SSG under `output: "static"` where on-demand routes declare `export const prerender = false`. In addition, Astro 6 defaults CSRF origin protection (`security.checkOrigin: true`) and requires content collection schemas to import Zod types from `astro/zod` instead of `astro:content`.

**Decision**:
1. In `astro.config.mjs`, replace `output: "hybrid"` with `output: "static"`. All 7 Cloudflare D1 API routes already declare `export const prerender = false;` so SSR functionality is preserved (adopting Decision D-07 Option A).
2. Accept the Astro 5/6 default `security.checkOrigin: true` for CSRF protection on same-origin POST requests (adopting Decision D-06 Option A).
3. In `src/content/config.ts`, update Zod schema imports to `import { z } from "astro/zod"`, eliminating the deprecation warning while retaining `defineCollection` from `astro:content`.
4. Update `scripts/verify-baseline-diff.js` and `tests/migration/build-config.spec.ts` to recognize `dist/client` build output and assert `output: "static"` with `legacy.collectionsBackwardsCompat: true`.

**Consequences**:
- Configuration conforms strictly to Astro 6 standards.
- D1 SSR API endpoints (`/api/newsletter`, `/api/leadform`, `/api/resource-download`, `/api/serve-resource`, `/api/campaigns`, `/api/campaign-visit`, `/api/campaign-signup`) maintain their server-side contracts without behavioral deviation.
- Schema definitions adhere to Astro 6's Zod typing requirements.
- Zero URL, metadata, or schema drift against pre-upgrade baselines.

**Verification**: `npm run build` passes; `npx astro check` passes (0 errors); `npm run test:regression` passes 42/42 checks; `npm run test:unit` passes 365/365 tests.

---

### ADR-001: Client Router Migration and Post-Swap Event Lifecycle Stabilization (Decision D-01)

**Date**: 2026-09-12  
**Branch**: `complete_astro_v6_migration`  
**Phase**: Milestone 5 Slice 3 (Client Router Migration & Event Lifecycle Stabilization)  
**Status**: ✅ Implemented  

**Context**: Astro 6 completely removes the legacy `<ViewTransitions />` component in favor of `<ClientRouter />` (Decision D-01 Option A). Client navigations require that all 7 post-swap event listener systems reliably re-bind and fire across transitions without event leakage, memory leaks, or double-invocations.

**Decision**:
1. Confirm `<ClientRouter />` from `astro:transitions` is encapsulated within `src/components/ClientRouterShim.astro` and rendered from `src/components/Head.astro`, maintaining full zero-churn isolation for SEO and metadata.
2. Eliminate any remaining references or comments to `ViewTransitions` in production code.
3. Validate that all 7 post-swap event listener systems cleanly re-bind and fire across client navigations via `onPageSwap` / `astro:after-swap`:
   - Analytics consent & click tracking (`Head.astro`)
   - UTM tracking (`src/lib/api/utm-tracking.ts`)
   - Copy-code button mounts (`Head.astro`)
   - Campaign CTA interaction (`src/components/CampaignCTA.astro`)
   - Campaign Hero timer interaction (`src/components/CampaignHero.astro`) with `astro:before-swap` interval cleanup
   - Resource form submission (`src/lib/resource-form.js`)
   - Offers analytics (`src/pages/offers/[...slug].astro`, `src/pages/offers/expired.astro`)
4. Create dedicated test suite `tests/unit/components/client-router.spec.ts` covering AST isolation, the 7 lifecycle contracts, and sequential multi-step navigation simulation.

**Consequences**:
- `<ClientRouter />` is fully operational with zero residual references to `ViewTransitions`.
- All client navigation lifecycles (`astro:before-preparation`, `astro:after-preparation`, `astro:before-swap`, `astro:after-swap`, `astro:page-load`) operate cleanly.
- Error isolation and unsubscription prevent memory leaks during SPA navigation.
- Zero URL, metadata, schema, or asset regression against baseline.

**Verification**: `npm run build` succeeds (code 0); `npx astro check` passes with 0 errors and 0 warnings; `npm run test:regression` passes all 42 checks across Tiers 1–4; `npm run test:unit` passes 377/377 tests (including all 12 tests in `tests/unit/components/client-router.spec.ts`); `npm run test:db` exits 0.

---

### ADR-002: Cloudflare Adapter v13 Upgrade and Platform Proxy Integration (Decision D-02)

**Date**: 2026-09-12  
**Branch**: `complete_astro_v6_migration`  
**Phase**: Milestone 5 Slice 1–2 (Cloudflare Adapter Upgrade & Environment Integration)  
**Status**: ✅ Implemented  

**Context**: Moving to Astro 6 requires updating `@astrojs/cloudflare` to `^13.2.0` (Decision D-02 Option A). The integration must maintain support for `platformProxy.enabled` during local development, ensure passthrough image optimization, preserve `locals.runtime.env.DB` bindings across on-demand SSR endpoints, and prevent clean checkout asset storage initialization failures.

**Decision**:
1. Bump `@astrojs/cloudflare` to `^13.2.0` in `package.json`.
2. Configure `astro.config.mjs` with `adapter: cloudflare({ platformProxy: { enabled: true }, imageService: 'passthrough' })`.
3. Add a top-level prebuild / config directory guard (`fs.mkdirSync('./dist/client', { recursive: true })`) ensuring Miniflare / workerd platform proxy initializes reliably on clean checkouts.
4. Verify all 7 D1 API endpoints continue to access the Cloudflare D1 binding via `locals.runtime.env.DB`.

**Consequences**:
- Adapter runs on the modern Cloudflare v13 runtime with workerd emulation.
- Clean git checkouts and CI environments build without `assets:storage` directory errors.
- API endpoints retain full parity with D1 database operations.

**Verification**: `npm run build` succeeds on clean workspace without prior `dist/`; `npm run test:db` passes; `npx astro check` passes (0 errors); all 42 regression diff checks pass.

---

### ADR-008: Route Normalization to `id` Parameters and Entry Render Shims

**Date**: 2026-09-12  
**Branch**: `complete_astro_v6_migration`  
**Phase**: Milestone 5 Slice 4 (Route Normalization & Collection Consumer Migration)  
**Status**: ✅ Implemented  

**Context**: In Astro 6, Content Layer replaces the legacy `entry.slug` property with `entry.id` across collection entries, and deprecates the `entry.render()` method in favor of `render(entry)` from `astro:content`. Dynamic routes must normalize dynamic route patterns (`[...slug].astro` -> `[...id].astro`) and consume entries through established shims without changing public URL structures.

**Decision**:
1. Rename the 6 dynamic SSG routes (`articles`, `notes`, `works`, `bibliophilediaries`, `saasguide`, `faqs`) from `[...slug].astro` to `[...id].astro` (matching `illustrations/[...id].astro`).
2. Update `getStaticPaths()` in all 6 routes to return `params: { id: getEntrySlug(post) }`, ensuring byte-identical URLs against baseline.
3. Update route parameter reads to prioritize `Astro.params.id || Astro.params.slug` in `getAdjacentEntries`.
4. Export `render` alias for `renderEntry` in `src/lib/content-shims.ts` to support both `renderEntry(entry)` and `render(entry)` patterns seamlessly.
5. Retain `src/pages/offers/[...slug].astro` and `src/pages/tag/[...slug].astro` where slugs are database columns or taxonomies rather than collection entries.

**Consequences**:
- Eliminates direct `entry.slug` dependencies from collection routes.
- Full parity maintained with baseline URLs, sitemaps, and RSS items.
- Prepares dynamic routes cleanly for Content Layer loader schema decoupling.

**Verification**: `npm run build` succeeds; `npx astro check` passes with 0 errors; `npm run test:regression` passes all 42 checks across Tiers 1–4; `npm run test:unit` passes 379/379 tests.

---

### ADR-003: Removal of Legacy Collections Backwards Compatibility (Decision D-03)

**Date**: 2026-09-12  
**Branch**: `complete_astro_v6_migration`  
**Phase**: Milestone 5 Slice 5 (Content Layer Loader Migration & Legacy Compat Removal)  
**Status**: ✅ Implemented  

**Context**: In Milestone 5 Slices 1–2, `legacy.collectionsBackwardsCompat: true` was enabled in `astro.config.mjs` to allow incremental migration. Astro 6 requires moving away from legacy collections before future framework releases, replacing legacy collections with Content Layer loaders.

**Decision**:
1. Migrate all 8 content collections (`articles`, `notes`, `works`, `illustrations`, `bibliophilediaries`, `saasguide`, `faqs`, `albums`) in `src/content/config.ts` to Content Layer `glob()` loaders.
2. Remove `legacy: { collectionsBackwardsCompat: true }` from `astro.config.mjs`.
3. Provide `src/content.config.ts` re-exporting `collections` to satisfy Astro 6's Content Layer config discovery while maintaining backward compatibility for internal consumers.
4. Update `tests/migration/build-config.spec.ts` and `tests/migration/content-config.spec.ts` to validate Content Layer loaders and assert legacy mode is inactive.

**Consequences**:
- Site operates on native Astro 6 Content Layer architecture with zero legacy collection overhead.
- Schema validation, content querying, and frontmatter transformation execute through Content Layer stores.
- Clean separation between source loaders and routing components.

**Verification**: `npm run build` succeeds (code 0); `npx astro check` passes (0 errors); `npm run test:regression` passes 42/42 checks; `npm run test:unit` passes 379/379 tests; `npm run test:db` exits 0.

---

### ADR-004: Albums YAML Data Collection Content Layer Loader (Decision D-04)

**Date**: 2026-09-12  
**Branch**: `complete_astro_v6_migration`  
**Phase**: Milestone 5 Slice 5 (Albums Loader Selection)  
**Status**: ✅ Implemented  

**Context**: The `albums` collection is a data collection of YAML files (`cards.yaml`, `logos.yaml`, `posterscollege.yaml`, etc.) with cover images resolved via Astro's `image()` schema helper. Decision D-04 evaluated Option A (`glob({ pattern: "**/*.yaml", base: "./src/content/albums" })`) versus Option B (individual `file()` calls per album).

**Decision**: Adopt Option A:
1. Define `albums` with `loader: glob({ pattern: "**/*.yaml", base: "./src/content/albums" })`.
2. Preserve `schema: ({ image }) => z.object({ title: z.string(), description: z.string(), cover: image() })`.
3. Verify image asset optimization and gallery paths continue to resolve correctly in `src/pages/illustrations/[...id].astro` and `src/pages/illustrations/index.astro`.

**Consequences**:
- A single glob loader covers all current and future album YAML files without manual per-album loader definitions.
- `cover: image()` helper functions identically in Content Layer, producing optimized AVIF/WebP assets.
- Gallery pages (`/illustrations/`) and individual gallery views (`/illustrations/cards/`, etc.) maintain exact visual and structural parity with pre-upgrade baselines.

**Verification**: `npm run build` succeeds; `npm run test:regression` Tier 4 illustration baseline diff passes cleanly; gallery images load and optimize properly.

---

## 3. Upgrade Phase Status

Codex updates this section as each phase is started, merged, or abandoned.

| Phase | Branch | Status | Start date | Merge date | Notes |
|---|---|---|---|---|---|
| Phase 1 — Dependency dry-run | `chore/astro-6-2-dry-run` | ✅ Completed | 2026-09-12 | 2026-09-12 | Verified dependency resolution and engine compatibility |
| Phase 2 — Version bumps + legacy compat | `chore/astro-6-bump-with-legacy-compat` | ✅ Completed | 2026-09-12 | 2026-09-12 | Astro 6.2, Cloudflare v13, legacy compat flag, output: static |
| Phase 3 — `<ClientRouter />` verification | `chore/astro-6-client-router-verification` | ✅ Completed | 2026-09-12 | 2026-09-12 | `<ClientRouter />` stabilized, 7 lifecycle listeners validated, 12 unit tests added |
| Phase 4 — `entry.slug` / `entry.render()` audit | `chore/astro-6-collection-api-audit` | ✅ Completed | 2026-09-12 | 2026-09-12 | Migrated route params to id and renderEntry shims; dynamic SSG routes renamed to [...id].astro |
| Phase 5 — Content Layer loader migration | `feat/astro-6-content-layer-loaders` | ✅ Completed | 2026-09-12 | 2026-09-12 | All 8 collections migrated to glob loaders; legacy compat removed; src/content.config.ts active |

---

## 4. `ARCHITECTURE.md` Update Log

Claude updates `ARCHITECTURE.md` after each Codex phase merges. This section tracks which sections were updated and when.

| Phase | Section(s) updated | Date | Summary of change |
|---|---|---|---|
| Milestone 1 | All sections | 2026-09-12 | Initial structural baseline and first-run architecture documentation. |
| Milestone 4 | Head Component, Routing, SEO | 2026-09-12 | Documented `ClientRouterShim`, `onPageSwap` lifecycle helper, and content shims. |
| Milestone 5 | Runtime Shape, Content Collections, Cloudflare/D1, Dependencies, First-Run Findings, Post-Upgrade State | 2026-09-12 | Synchronized to Astro 6.2, `@astrojs/cloudflare` v13, Vite 7, `output: static`, native Content Layer loaders (`glob()`), resolved findings F-1 and F-2, clean checkout guard. |

---

## 5. First-Run Findings Resolution Tracker

Tracks the original eight First-Run Findings from `ARCHITECTURE.md`. Updated after each Codex phase as findings are resolved, transferred, or restated.

| Finding | Original description | Status | Resolution |
|---|---|---|---|
| F-1 | Missing `scripts/migrate-database.js` and `scripts/verify-database.js` | ✅ Resolved | Implemented and verified in Milestone 1 via `scripts/migrate-database.js`, `scripts/verify-database.js`, and automated unit tests. |
| F-2 | Missing D1 table migrations for `newsletter` and `leads` tables | ✅ Resolved | Implemented and verified in Milestone 1 via `scripts/004_create_newsletter.sql` and `scripts/005_create_leads.sql`. |
| F-3 | Empty `src/utils/` directory | ⏳ Open | No action required unless a utility is added during upgrade. |
| F-4 | Legacy Staticman API reference | ⏳ Open | Decision D-08: defer to `chore/legacy-cleanup` branch post-upgrade. |
| F-5 | Empty reCAPTCHA keys | ⏳ Open | No active code paths use them. Defer cleanup to D-08 branch. |
| F-6 | README references `gatsby develop` | ⏳ Open | Defer cleanup to D-08 branch. |
| F-7 | Duplicate taxonomy entries | ⏳ Open | Low priority; no functional impact. Defer to `chore/legacy-cleanup`. |
| F-8 | `PERFORMANCE_CONFIG` lists unused Google Fonts domains | ⏳ Open | Non-functional; `Head.astro` already excludes them. Defer to D-08 branch. |

Additional findings from Milestone 3:

| Finding | Description | Status |
|---|---|---|
| F-9 | Hardcoded signing secret in `serve-resource.ts` | ⏳ Open | Move to Cloudflare Worker secret when authorized. |
| F-10 | No dedicated campaign signups table | ⏳ Open | Tracked in `docs/d1_api_contract.md` §5.3. |
| F-11 | Unauthenticated admin endpoints (campaigns CRUD, download stats, visit records) | ⏳ Open | Authentication strategy needs Alok input before implementation. |

---

## 6. End-of-Upgrade Checklist

When Phase 5 merges, Claude performs these final steps before closing Milestone 5:

- [x] Verify all 8 pre-upgrade decisions (D-01 through D-08) are recorded as ✅ Implemented or ⚠️ Deferred.
- [x] Verify all five phase rows in §3 are ✅ Merged (or ⚠️ Deferred for Phase 5).
- [x] Update `ARCHITECTURE.md` §Runtime Shape with final Astro/adapter/Vite versions.
- [x] Update `ARCHITECTURE.md` §First-Run Findings to reflect resolved items.
- [x] Update `central_milestones.md` to mark Milestone 5 complete at milestone granularity only.
- [x] Confirm `legacy.collectionsBackwardsCompat` is removed from `astro.config.mjs` (Phase 5).
- [x] Confirm `<ViewTransitions />` import no longer exists anywhere in the codebase.
- [x] Confirm `entry.slug` does not appear in any `src/pages/` file.
- [x] Confirm `entry.render()` does not appear in any `src/pages/` file.
