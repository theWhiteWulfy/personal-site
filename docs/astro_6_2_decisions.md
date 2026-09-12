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
| D-03 | Use `legacy.collectionsBackwardsCompat` through Phase 4, then drop in Phase 5? | Phase 2 | ✅ **Approved** | A (Enable compat flag in Phase 2) |
| D-04 | `albums` collection loader: `glob(**/*.yaml)` or per-file `file()`? | Phase 5 | ⏳ **Pending** | — |
| D-05 | PWA strategy: keep `vite-plugin-pwa`, swap to `@vite-pwa/astro`, or drop PWA? | Phase 2 | ✅ **Approved** | A (Bump `vite-plugin-pwa` to `^1.3.0` for Vite 7) |
| D-06 | CSRF default flip: accept `security.checkOrigin: true` (new Astro 5 default)? | Phase 2 | ✅ **Approved** | A (Accept default `true`) |
| D-07 | Remove `output: "hybrid"` and rely on default static + per-route `prerender = false`? | Phase 2 | ✅ **Approved** | A (Remove `hybrid`, use `static`) |
| D-08 | Defer cleanup of legacy `staticmanApi` and Gatsby-era references to a separate branch? | Post-upgrade | ⏳ **Pending** | — |

**How to record a decision**: update the row's `Status` to ✅ **Approved** and fill in `Alok's Choice` with the option letter (A, B, C) from the upgrade plan. Then add a full ADR entry in §2.

---

## 2. Decision Log Entries

### ADR-004: Content and SEO Preservation Shims

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

### Entry template

```
### ADR-NNN: <Decision title>

**Date**: YYYY-MM-DD  
**Branch**: `<branch-name>`  
**Phase**: Phase N  
**Status**: ✅ Implemented | ⚠️ Deferred | ❌ Reversed

**Context**: 1–2 sentences describing the situation that forced this decision.

**Decision**: Which option was chosen and why.

**Consequences**:
- What changed in the codebase.
- Any follow-up tasks created.
- Any risks introduced or mitigated.

**Verification**: What Jules confirmed (build green / tests passing / diff clean).
```

---

## 3. Upgrade Phase Status

Codex updates this section as each phase is started, merged, or abandoned.

| Phase | Branch | Status | Start date | Merge date | Notes |
|---|---|---|---|---|---|
| Phase 1 — Dependency dry-run | `chore/astro-6-2-dry-run` | ✅ Completed | 2026-09-12 | 2026-09-12 | Verified dependency resolution and engine compatibility |
| Phase 2 — Version bumps + legacy compat | `chore/astro-6-bump-with-legacy-compat` | ✅ Completed | 2026-09-12 | 2026-09-12 | Astro 6.2, Cloudflare v13, legacy compat flag, output: static |
| Phase 3 — `<ClientRouter />` verification | `chore/astro-6-client-router-verification` | ⏳ Next | — | — | Requires Phase 2 merged |
| Phase 4 — `entry.slug` / `entry.render()` audit | `chore/astro-6-collection-api-audit` | ⏳ Not started | — | — | Requires Phase 3 merged |
| Phase 5 — Content Layer loader migration | `feat/astro-6-content-layer-loaders` | ⏳ Not started | — | — | Optional; requires Phase 4 merged |

---

## 4. `ARCHITECTURE.md` Update Log

Claude updates `ARCHITECTURE.md` after each Codex phase merges. This section tracks which sections were updated and when.

| Phase | Section(s) updated | Date | Summary of change |
|---|---|---|---|
| — | — | — | *No updates yet. Pre-upgrade state documented in Milestone 1.* |

After Phase 2 merges, the following sections must be updated in `ARCHITECTURE.md`:
- **Runtime Shape**: bump Astro version, adapter version, remove `output: "hybrid"`.
- **Content Collections**: note `legacy.collectionsBackwardsCompat: true` is active.
- **Head Component**: note `<ClientRouter />` is now in use.
- **Dependencies**: update all version numbers.
- **Upgrade Risks**: mark resolved items from the First-Run Findings.

After Phase 4 merges:
- **Collection Usage Patterns**: change `entry.slug → entry.id`, `entry.render() → render(entry)`.
- **RSS Feed**: change link template to `/${item.collection}/${item.id}/`.

After Phase 5 merges:
- **Content Collections**: document Content Layer loader shape; note compat flag removed.
- **First-Run Findings**: close the Astro upgrade risk items.

---

## 5. First-Run Findings Resolution Tracker

Tracks the original eight First-Run Findings from `ARCHITECTURE.md`. Updated after each Codex phase as findings are resolved, transferred, or restated.

| Finding | Original description | Status | Resolution |
|---|---|---|---|
| F-1 | Missing `scripts/migrate-database.js` and `scripts/verify-database.js` | ⏳ Open | Spec documented in `docs/d1_api_contract.md` §5.2. Codex implements when authorized. |
| F-2 | Missing D1 table migrations for `newsletter` and `leads` tables | ⏳ Open | Spec documented in `docs/d1_api_contract.md` §5.1. Codex creates SQL; Jules verifies. |
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

- [ ] Verify all 8 pre-upgrade decisions (D-01 through D-08) are recorded as ✅ Implemented or ⚠️ Deferred.
- [ ] Verify all five phase rows in §3 are ✅ Merged (or ⚠️ Deferred for Phase 5).
- [ ] Update `ARCHITECTURE.md` §Runtime Shape with final Astro/adapter/Vite versions.
- [ ] Update `ARCHITECTURE.md` §First-Run Findings to reflect resolved items.
- [ ] Update `central_milestones.md` to mark Milestone 5 complete at milestone granularity only.
- [ ] Confirm `legacy.collectionsBackwardsCompat` is removed from `astro.config.mjs` (Phase 5).
- [ ] Confirm `<ViewTransitions />` import no longer exists anywhere in the codebase.
- [ ] Confirm `entry.slug` does not appear in any `src/pages/` file.
- [ ] Confirm `entry.render()` does not appear in any `src/pages/` file.
