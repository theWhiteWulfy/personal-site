# Gemini Tasks

Gemini 3 Pro is the Marathoner. This file owns long-session reviews, broad audits, and sustained iterative improvement.

## Active: Baseline Review Preparation

- [x] Review `ARCHITECTURE.md` after the first bootstrap branch is ready.
- [x] Prepare a long-form Astro 4.15 to 6.2 risk inventory.
- [x] Review content collection usage across list pages, detail pages, RSS, tags, and galleries.
- [x] Review SEO and analytics preservation risks across metadata, schema, sitemap, and RSS.

## Milestone 2: Astro 6.2 Compatibility Audit (Broad Review)

Goal: stress-test Claude's plan and Codex's implementation audit against the wider repo before any code changes land.

Branch: `docs/astro-6-2-broad-review`.

- [ ] Cross-walk every breaking change in the Astro 5.0 and 6.0 release notes against actual repo code; produce `docs/astro_6_2_breakage_matrix.md` with columns: change, affected files, severity, owner, mitigation branch.
- [ ] Sweep all `.astro`, `.ts`, `.js`, `.mjs` files for deprecated APIs:
  - `Astro.glob` (replaced by Content Layer / `import.meta.glob`).
  - `getEntryBySlug` / `getEntry` legacy signatures.
  - `Astro.cookies` and `Astro.session` shape changes.
  - `astro:transitions` named exports beyond `<ViewTransitions />`.
- [ ] Review every dependency in `package.json` for Astro 6 compatibility and pin a target version. Specifically:
  - `astro`, `@astrojs/check`, `@astrojs/mdx`, `@astrojs/rss`, `@astrojs/sitemap`, `@astrojs/cloudflare`.
  - `vite-plugin-pwa`, `@playform/compress`, `@cloudflare/workers-types`, `wrangler`.
  - PostCSS chain: `cssnano`, `postcss-custom-media`, `postcss-import`, `postcss-loader`, `postcss-mixins`, `postcss-nested`, `postcss-preset-env`, `postcss-url`.
  - Tooling: `prettier-plugin-astro`, `prettier-plugin-organize-imports`, `typescript`.
- [ ] Flag transitive risks (Vite major bump, Node engine bump) in the matrix.
- [ ] Review the Astro 5+ Content Layer migration recipes Claude proposes for each of the 8 collections; challenge any that risk URL or RSS link drift.

## Milestone 3: Cloudflare D1 And API Surface Stabilization (Review)

Goal: independently audit API route behavior, data flow, and security posture so D1 work is safe through framework changes.

Branch: `docs/d1-api-review`.

- [ ] Walk every API route end-to-end and document its data flow in `docs/api_route_review.md`:
  - `newsletter.ts`, `leadform.ts`, `resource-download.ts`, `serve-resource.ts`, `campaigns.ts`, `campaign-visit.ts`, `campaign-signup.ts`.
  - For each: input schema, validation path (`src/lib/api/validation.ts`), security checks (`src/lib/api/security.ts`), DB queries (`src/lib/api/database.ts`), response shape, error paths.
- [ ] Review the `locals?.runtime?.env?.DB` guard for inconsistencies; flag any route that diverges from the canonical pattern documented by Claude.
- [ ] Review the missing-migration risk: confirm `newsletter` and lead-form table schemas by inspecting the SQL bound in route code; propose the `CREATE TABLE` statements Codex should write into `scripts/004_*.sql` and `scripts/005_*.sql`.
- [ ] Review the missing `scripts/migrate-database.js` / `scripts/verify-database.js` interface contract from `docs/d1_api_contract.md` against industry-standard Wrangler usage; flag gaps.
- [ ] Audit rate limiting, honeypot, IP extraction (`CF-Connecting-IP`, `X-Forwarded-For`), and duplicate-prevention logic in `resource-download.ts` for regressions during adapter upgrades.
- [ ] Review UTM tracking flow (`src/lib/api/utm-tracking.ts` + `campaign-visit.ts` + `campaign-signup.ts`) for any reliance on `astro:after-swap` semantics that may shift under `<ClientRouter />`.

## Milestone 4: Content And SEO Preservation (Review)

Goal: long-form review of content shape, metadata, and analytics consistency before, during, and after upgrade slices.

Branch: `docs/seo-content-review`.

- [ ] Verify every content collection in `src/content/config.ts` has matching frontmatter on disk; report orphan fields, missing required fields, and date inconsistencies. Cover `articles/`, `notes/`, `works/`, `illustrations/`, `bibliophilediaries/`, `saasguide/`, `faqs/`, and `albums/`.
- [ ] Review `taxonomy.yml` for duplicates already noted (`illustrations` vs `illustration`, `tutorials` vs `Tutorials`) and any other drift; recommend a Codex `Content/taxonomy-cleanup` branch only if Alok approves.
- [ ] Review every `pageType` branch in `src/lib/schema-generators.ts` for completeness:
  - `WebPage` / `Article` base.
  - `BreadcrumbList`, `LocalBusiness`, `Person`, `Service`, `FAQPage`, `DigitalDocument`, `Event`.
  - Confirm `SCHEMA_CONFIG` in `src/config/system.js` still matches the current business and person facts.
- [ ] Review `src/components/Head.astro` (~889 lines) for stale resource hints, duplicate meta tags, and any DNS prefetch entries that no longer resolve.
- [ ] Review `src/pages/rss.xml.js` link template `/${item.collection}/${item.slug}/` against `_redirects` in `public/`; confirm no redirect loops are produced after URL shape stabilization.
- [ ] Review analytics consent surface in `src/lib/analytics.ts` (~1689 lines):
  - GA4Analytics, ClarityAnalytics, AnalyticsManager class boundaries.
  - Typed event interfaces.
  - DNT + opt-out cookie handling.
- [ ] After each Codex Milestone 4 prep branch lands, diff produced HTML and report any drift Jules's mechanical diff misses (e.g., attribute ordering, whitespace, comment removal).

## Milestone 5: Phased Astro 6.2 Upgrade Execution (Review)

Goal: continuous review across the full slice train; catch regressions Codex and Jules cannot see in isolation.

- [ ] After `maintenance/astro-deps-dry-run`, review the new `package.json` lockfile for unexpected major bumps in transitive deps.
- [ ] After `feature/astro-6-clientrouter`, click-through every page that registers an `astro:after-swap` listener and confirm analytics, copy-code, campaign countdown, campaign CTA, UTM tracking, and resource forms still re-attach.
- [ ] After `feature/astro-6-entry-api`, diff `dist/rss.xml`, `dist/sitemap-*.xml`, and rendered HTML for one entry per collection against the pre-upgrade snapshot Jules captured.
- [ ] After any Content Layer migration slice, sample 10% of each collection and confirm slug, body, and frontmatter render identically.
- [ ] Track regressions in `docs/astro_6_2_regression_log.md`; for each, recommend a focused follow-up branch and route it to Codex or Claude as appropriate.
- [ ] Final pass: re-run the deprecated-API sweep from Milestone 2 to confirm no legacy calls remain unless explicitly held back by an approved exception.

## Boundaries

- Do not make broad edits without an assigned branch and reviewed scope.
- Do not merge into `main`; reviews land as `docs/` artifacts only.
- Do not rewrite content collection architecture before the phased migration is approved.
- Do not run dependency upgrades; that work belongs to Codex.
- Do not run builds or previews as the primary verification path; Jules owns build verification. Gemini reviews the artifacts Jules produces.
