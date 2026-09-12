# Astro 4.15 → 6.2 Risk Inventory

**Status**: Architecture-only document. Produced by Claude (Architect) as a companion to [`docs/astro_6_2_upgrade_plan.md`](./astro_6_2_upgrade_plan.md).  
**Purpose**: Initial risk register for the six high-impact surfaces. The full breaking-change delta table is in the upgrade plan §1. This document provides the risk-level summary and links Codex and Jules to the surface-specific mitigations.

---

## Risk Summary Table

| # | Risk Surface | Files At Risk | Severity | Phase |
|---|---|---|---|---|
| R1 | Legacy content collections removed | `src/content/config.ts`, all `[...slug].astro`, RSS, tag pages | **High** | Phase 2 (compat flag) → Phase 5 (loader migration) |
| R2 | `entry.slug` / `entry.render()` removed | 7 detail pages, 7 index pages, `rss.xml.js`, tag pages | **High** | Phase 4 |
| R3 | `<ViewTransitions />` removed | `src/components/Head.astro` + 6 consumer files | **High** | Phase 3 |
| R4 | Cloudflare adapter v11 → v13 | `astro.config.mjs`, `src/env.d.ts`, all 7 `src/pages/api/*.ts` | **High** | Phase 2 |
| R5 | Vite 5 → 6 → 7, PostCSS, PWA | `astro.config.mjs`, `postcss.config.cjs`, `package.json` | **High** | Phase 2 |
| R6 | Schema / metadata / canonical URL regression | `src/components/Head.astro`, `src/lib/schema-generators.ts`, `src/pages/rss.xml.js` | **High** | Phase 2 + Phase 4 verification |

---

## R1 — Content Collections Legacy Compatibility

**Change**: Astro 5 moved legacy `type: "content"` / `type: "data"` collections to maintenance mode behind the `legacy.collections` flag. Astro 6 removes automatic legacy compatibility entirely; `legacy.collectionsBackwardsCompat` is the temporary migration helper, and it too will be removed in a future version.

**Surfaces in this repo**:
- `src/content/config.ts` — defines 8 collections with the legacy `defineCollection({ type: "content" | "data" })` shape.
- `import { defineCollection, z } from "astro:content"` — `z` must move to `astro/zod` (change 6-J in upgrade plan).
- Every page using `getCollection()`: 7 detail routes, 7 index routes, 2 tag routes, `rss.xml.js`, gallery pages.

**Mitigation sequence**:
1. Phase 2: add `legacy: { collectionsBackwardsCompat: true }` to `astro.config.mjs`. No content files change. Build stays green.
2. Phase 4: replace `entry.slug` → `entry.id` and `entry.render()` → `render(entry)` across all consumers.
3. Phase 5: migrate `src/content/config.ts` to Content Layer loader shape; remove the compat flag.

**Stop condition**: if URL drift is detected after Phase 5 (`entry.id` ≠ current `entry.slug` for any live entry), Claude re-baselines before continuing.

---

## R2 — `entry.slug` and `entry.render()` Replacements

**Change**: In the Content Layer API, `entry.slug` becomes `entry.id` (the file-path stem, slugified by the `glob()` loader). `entry.render()` becomes a module-level `render(entry)` import from `astro:content`.

**Surfaces in this repo** (from [`docs/content_collection_review.md`](./content_collection_review.md)):

*Detail pages (7 files)*:
- `src/pages/articles/[...slug].astro`
- `src/pages/notes/[...slug].astro`
- `src/pages/works/[...slug].astro`
- `src/pages/illustrations/[...slug].astro`
- `src/pages/bibliophilediaries/[...slug].astro`
- `src/pages/saasguide/[...slug].astro`
- `src/pages/faqs/[...slug].astro`

*Tag and taxonomy pages (2 files)*:
- `src/pages/tag/[...slug].astro`
- `src/pages/tag/index.astro`

*RSS feed (1 file)*:
- `src/pages/rss.xml.js` — uses `item.slug` in link template; must change to `item.id`.

**Mitigation**: see upgrade plan §2.3, §2.4, §2.5 for exact replacement patterns.

**Test**: after Phase 4, Jules diffs one rendered detail page per collection and the full `dist/rss.xml` output. Any URL change is a stop signal.

---

## R3 — `<ViewTransitions />` Removed

**Change**: `<ViewTransitions />` from `astro:transitions` is renamed to `<ClientRouter />` in Astro 5 (alias kept) and fully removed in Astro 6. The `astro:after-swap` event still fires with `<ClientRouter />`.

**Surfaces in this repo**:

*Primary component*:
- `src/components/Head.astro` — imports and renders `<ViewTransitions />`.

*Consumer files that depend on `astro:after-swap` re-attachment* (7 files total):
- `src/components/Head.astro` — analytics listeners, copy-code button re-attachment
- `src/components/CampaignCTA.astro` — campaign analytics re-attachment
- `src/components/CampaignHero.astro` — campaign analytics re-attachment
- `src/lib/resource-form.js` — resource form re-attachment
- `src/lib/utm-tracking.ts` — UTM parameter re-capture
- `src/pages/offers/[...slug].astro` — offer-specific listeners
- `src/pages/offers/expired.astro` — offer-specific listeners

**Mitigation**: mechanical rename in `Head.astro` (Phase 2/Phase 3 boundary); verified in Phase 3 by the analytics smoke test listed in upgrade plan §3 Phase 3.

**Decision required** (Alok, §4.1 of upgrade plan): keep `<ClientRouter />` or remove client-side routing entirely?

---

## R4 — Cloudflare Adapter v11 → v13

**Change**: `@astrojs/cloudflare` v12 (Astro 5) and v13 (Astro 6) include significant changes to adapter API internals. The public-facing `locals.runtime.env.DB` access pattern is preserved in the CHANGELOG, but the runtime type shape and `platformProxy` behavior must be re-verified.

**Surfaces in this repo**:
- `astro.config.mjs` — adapter import and config (`platformProxy.enabled`, `imageService: 'passthrough'`).
- `src/env.d.ts` — runtime type declaration (`type Runtime = import("@astrojs/cloudflare").Runtime<ENV>`).
- All 7 `src/pages/api/*.ts` routes — access `locals.runtime.env.DB`.

**Invariants that must be preserved** (from `wrangler.toml`):
- Binding name: `DB`
- Database name: `meteoric`
- Database id: `8380ec22-098e-4814-a56f-48d907425b35`
- Compatibility flag: `nodejs_compat`

**Mitigation**: after Phase 2 build passes, run `npm run cfpreview` against `./dist` and POST to each API route with a test email payload. Confirm D1 write succeeds. See upgrade plan §4.2.

---

## R5 — Vite / PostCSS / PWA Ecosystem

**Change**: Astro 5 requires Vite 6; Astro 6 requires Vite 7. This affects `vite-plugin-pwa` compatibility, the PostCSS loader integration, and `@playform/compress`.

**Surfaces in this repo**:
- `astro.config.mjs` — Vite plugin config (`VitePWA`, rollupOptions with external exclusions).
- `postcss.config.cjs` — PostCSS plugin chain.
- `package.json` — `vite-plugin-pwa ^0.16.4`, `@playform/compress ^0.0.13`.

**Specific risks**:
- `vite-plugin-pwa ^0.16.4` is Vite 5 era. Vite 7 likely needs v0.20.x or the `@vite-pwa/astro` Astro integration. Decision required (Alok, §4.5 of upgrade plan).
- `@playform/compress ^0.0.13` is a pre-release package with no guarantees. Verify against Vite 7.
- PostCSS chain (`postcss-custom-media`, `postcss-import`, `postcss-loader`, `postcss-mixins`, `postcss-nested`, `postcss-preset-env`, `cssnano`) — generally Vite-version-agnostic via PostCSS config, but `postcss-loader` coupling via the Vite plugin needs verification.

**Mitigation**: Phase 1 dry-run captures the build error log without fixing anything. Codex addresses in Phase 2 after reading the dry-run output.

---

## R6 — Schema / Metadata / Canonical URL Regression

**Change**: any drift in `Astro.url.pathname`, trailing-slash handling, or script execution order could produce SEO-impacting changes to canonical URLs, OG tags, and JSON-LD output.

**Surfaces in this repo**:
- `src/components/Head.astro` — canonical URL (`new URL(Astro.url.pathname, Astro.site)`), OG `og:url`, Twitter `twitter:url`, RSS alternate link.
- `src/lib/schema-generators.ts` — generates JSON-LD using `site.url + path`; paths come from `Astro.url.pathname`.
- `src/pages/rss.xml.js` — link template `/${item.collection}/${item.slug}/`.
- `public/_redirects` — any rule pointing to file-extension endpoints with a trailing slash (6-K risk).

**Specific sub-risks**:
- Astro 6 change 6-K: `/rss.xml/` (trailing slash on file-extension endpoint) will 404. Verify `site.feedUrl` in `src/config/site.js` and the RSS `<link rel="alternate">` href in `Head.astro` do not include a trailing slash.
- Astro 6 change 6-R: `<script>` and `<style>` render in source order (was reversed). The 13 inline scripts in `Head.astro` depend on load order (analytics init before consent management). Audit and document expected order.
- Script hoisting behavior (5-H): `<script>` tags no longer auto-hoisted. All `is:inline` scripts in `Head.astro` are already explicitly placed, so this should be N/A — but must be verified.

**Mitigation**: Jules captures pre-upgrade snapshots per the verification protocol in [`docs/seo_analytics_preservation_review.md`](./seo_analytics_preservation_review.md). Codex and Claude diff after each phase.

---

## Risk Severity Legend

| Severity | Meaning |
|---|---|
| **High** | Build failure or data loss if not addressed before merge |
| **Medium** | Silent regression risk; requires diff verification |
| **Low** | Informational; unlikely to impact production without additional changes |
