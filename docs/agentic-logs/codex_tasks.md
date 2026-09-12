# Codex Tasks

Codex / GPT-5.5 is the Mechanic. This file owns heavy logic, wiring, Astro component changes, and structural updates after the first-run baseline is complete.

## Active: First-Run Support

- [x] Bootstrap the agent task files and `skills/` SOP directory on `docs/agentic-orchestration-baseline`.
- [x] Add implementation-sensitive architecture notes without changing runtime behavior.
- [x] Augment `README.md` with the multi-agent workflow and preservation constraints.
- [x] Record Astro 6.2 implementation risks for future Codex work.

## Milestone 2: Astro 6.2 Compatibility Audit (Implementation Risks)

Goal: produce the implementation-side risk register that complements Claude's architecture plan. No code or dependency changes in this milestone.

Branch: `docs/astro-6-2-implementation-audit`.

- [x] Audit `<ViewTransitions />` usage. Confirmed locations to record in `docs/astro_6_2_implementation_audit.md`:
  - Import + render in `src/components/Head.astro` (lines around 4 and 310).
  - All `astro:after-swap` listeners that depend on it: `src/components/Head.astro`, `src/components/CampaignCTA.astro`, `src/components/CampaignHero.astro`, `src/lib/resource-form.js`, `src/lib/api/utm-tracking.ts`, `src/pages/offers/[...slug].astro`, `src/pages/offers/expired.astro`.
  - Note the global helpers (`checkAnalyticsConsent`, `trackEngagementEvent`, `trackConversionEvent`, `addCopyCodeButtons`) re-bound after swap and the contract they must keep.
- [x] Audit `entry.slug` / `entry.render()` / `entry.collection` usage and inventory every site:
  - Detail routes: `src/pages/articles/[...slug].astro`, `src/pages/notes/[...slug].astro`, `src/pages/works/[...slug].astro`, `src/pages/bibliophilediaries/[...slug].astro`, `src/pages/saasguide/[...slug].astro`, `src/pages/faqs/[...slug].astro`. `src/pages/illustrations/[...id].astro` is a separate `albums`-based surface and already uses `id`.
  - Index routes: `src/pages/index.astro`, `src/pages/articles/index.astro`, `src/pages/notes/index.astro`, `src/pages/works/index.astro`, `src/pages/bibliophilediaries/index.astro`, `src/pages/saasguide/index.astro`, `src/pages/faqs/index.astro`, plus `src/pages/tag/index.astro` and `src/pages/tag/[...slug].astro`.
  - Syndication: `src/pages/rss.xml.js` (uses `item.collection` + `item.slug`).
  - Note the adjacent-post dependency on `Astro.params.slug` in the `[...slug]` files and re-verify the `getAdjacentPosts` helper before runtime changes.
- [x] Audit Cloudflare adapter wiring before any version bump:
  - `astro.config.mjs` adapter block (`platformProxy.enabled: true`, `imageService: 'passthrough'`).
  - `src/env.d.ts` `Runtime<ENV>` typing using `@cloudflare/workers-types`.
  - `wrangler.toml` `nodejs_compat`, `DB` binding, database id.
  - All seven API routes confirm `export const prerender = false` + `locals.runtime.env.DB`.
- [x] Audit Vite/PostCSS plugin chain in `astro.config.mjs` and `postcss.config.cjs`. List each plugin (`postcss-import`, `postcss-mixins`, `postcss-nested`, `postcss-custom-media`, `postcss-preset-env`, `postcss-url`, `cssnano`) with the current baseline version and preserve the chain for Astro 6 validation work.
- [x] Audit `markdown.syntaxHighlight: 'prism'` and the remark plugins (`remarkReadingTime`, `remarkModifiedTime`) for Astro 6 compatibility; flag if Shiki is the new default.
- [x] Audit `astro check` invocation in `package.json` (`"build": "astro check && astro build"`) against the `@astrojs/check` version required by Astro 6.
- [x] Preserve `src/content/config.ts` and the legacy `defineCollection` shape until Claude's reviewed migration plan exists.

## Milestone 3: Cloudflare D1 And API Surface Stabilization (Implementation)

Goal: close gaps and harden the D1 surface so future framework upgrades are safe. Each task gets its own branch.

- [x] Branch `maintenance/db-scripts-restore`: implement the missing `scripts/migrate-database.js` and `scripts/verify-database.js` to the contract Claude documents in `docs/d1_api_contract.md`.
  - Support `--local` flag to switch between remote and local D1 via Wrangler.
  - `migrate-database.js` runs every `scripts/*.sql` file in lexical order, idempotent.
  - `verify-database.js` checks tables exist (`resource_downloads`, `analytics_events`, `campaigns`, `campaign_visits`, `newsletter`, lead form table) and prints schema.
  - Wire into `npm run db:migrate`, `db:migrate:local`, `db:verify`, `db:verify:local`.
- [x] Branch `maintenance/db-missing-migrations`: add SQL migrations for tables already in production but absent from `scripts/`.
  - `004_create_newsletter.sql` for the `newsletter` table used by `src/pages/api/newsletter.ts`.
  - `005_create_leadform.sql` (or similar) for the table used by `src/pages/api/leadform.ts`.
  - Use `CREATE TABLE IF NOT EXISTS` so reapplying is safe.
  - Do not run against remote D1; Jules verifies locally first.
- [x] Hold any change to `wrangler.toml` D1 binding, database id, or `nodejs_compat` flag until Alok approves explicitly (verified and preserved).
- [x] Pre-flight gate verification: D1 scripts and migrations verified via `npm run test:db` and `npm run db:verify:local` (all 6 tables present).

## Milestone 4: Content And SEO Preservation (Implementation)

Goal: prepare components and pages so Astro upgrade slices do not regress SEO, content URLs, or analytics. Implementation-only on dedicated branches.

- [x] Branch `feature/head-clientrouter-prep`: refactor `src/components/Head.astro` so the `<ViewTransitions />` import is isolated and easy to swap (implemented via `src/components/ClientRouterShim.astro`).
  - Move the import + render to a single, top-of-component block.
  - Add a TODO comment referencing `docs/astro_6_2_upgrade_plan.md`.
  - Do not yet swap to `<ClientRouter />`.
- [x] Branch `feature/after-swap-helper`: extract the repeated `astro:after-swap` re-attachment pattern into a helper module `src/lib/page-events.ts` exporting `onPageSwap` and reuse it in `Head.astro`, `CampaignCTA.astro`, `CampaignHero.astro`, `resource-form.js`, `utm-tracking.ts`, `offers/[...slug].astro`, `offers/expired.astro`. Keep behavior identical so Jules's diff stays clean.
- [x] Branch `feature/collection-slug-shim`: add `src/lib/content-shims.ts` exporting `getEntrySlug` and `entryPath(entry)` returning `/${entry.collection}/${entry.slug}/`. Wire it into `rss.xml.js` and the index pages without changing produced URLs. This isolates the future `slug` → `id` rename behind one symbol.
- [x] Branch `feature/render-shim`: add `src/lib/content-shims.ts` exporting `renderEntry(entry)` that returns `{ Content, headings, remarkPluginFrontmatter }`. Use it from every `[...slug].astro` detail route and `PostNavigation.astro`.
- [x] Hold all `src/content/config.ts` rewrites until Claude's loader migration plan is approved. Treat React components as read-only.
- [x] After each branch, instruct Jules to diff `dist/sitemap-*.xml`, `dist/rss.xml`, and one rendered page per collection against the previous build. No rendered HTML drift is acceptable beyond hashed asset filenames.

## Milestone 5: Phased Astro 6.2 Upgrade Execution (Implementation)

Goal: execute the phased upgrade slice-by-slice, only after Claude's plan is reviewed and Alok approves each slice. One branch per slice, all `feature/` or `maintenance/`.

- [x] Branch `maintenance/astro-deps-dry-run` & `chore/astro-6-bump-with-legacy-compat` (Milestone 5 Slices 1–2):
  - Bumped `astro` (^6.2.0), `@astrojs/cloudflare` (^13.2.0), `@astrojs/mdx` (^4.3.14), `@astrojs/rss` (^4.0.19), `@astrojs/sitemap` (^3.2.1), `@astrojs/check` (^0.9.4), and `vite-plugin-pwa` (^1.3.0) in `package.json`.
  - Updated `astro.config.mjs` with `output: "static"` and `legacy: { collectionsBackwardsCompat: true }`.
  - Updated `src/content/config.ts` to import `z` from `astro/zod`.
  - Updated `src/components/ClientRouterShim.astro` to import and render `<ClientRouter />` from `astro:transitions`.
- [x] Branch `feature/astro-6-clientrouter` (Milestone 5 Slice 3):
  - Validated `<ClientRouter />` encapsulation via `src/components/ClientRouterShim.astro` rendered from `src/components/Head.astro`.
  - Confirmed complete elimination of `<ViewTransitions />` across the entire codebase.
  - Validated all 7 post-swap event listener contracts across navigations (analytics consent/click tracking, UTM tracking, copy-code button mounts, campaign CTA, campaign hero timer, resource forms, offers analytics).
  - Added dedicated test suite `tests/unit/components/client-router.spec.ts` (12/12 passing).
  - Full suite verified: `npm run build`, `npx astro check` (0 errors), `npm run test:regression` (42/42 checks pass), `npm run test:unit` (377/377 pass), `npm run test:db`.
- [x] Branch `feature/astro-6-entry-api` (Milestone 5 Slice 4):
  - Migrated route params and collection consumers from `entry.slug` to `entry.id` and `render(entry)` via `src/lib/content-shims.ts`.
  - Renamed 6 dynamic SSG routes to `[...id].astro` matching Astro 6 conventions and `PROJECT.md`.
  - Added `render` export alias in `src/lib/content-shims.ts` and added unit test coverage (379/379 tests passing).
- [x] Branch `feature/astro-6-content-loader` (Milestone 5 Slice 5):
  - Migrated all 8 collections in `src/content/config.ts` (`articles`, `notes`, `works`, `illustrations`, `bibliophilediaries`, `saasguide`, `faqs`, `albums`) to Content Layer loaders using `glob()` from `astro/loaders`.
  - Created `src/content.config.ts` to satisfy Astro 6 Content Layer config discovery.
  - Removed `legacy: { collectionsBackwardsCompat: true }` from `astro.config.mjs`.
  - Updated `tests/migration/build-config.spec.ts` and `tests/migration/content-config.spec.ts` for Content Layer.
  - Verified full verification suite: `npm run build` (0 errors), `npx astro check` (0 diagnostics), `npm run test:regression` (42/42 checks pass), `npm run test:unit` (379/379 pass), `npm run test:db` (exits 0).
- [x] Branch `maintenance/astro-6-cloudflare-adapter`: verified `@astrojs/cloudflare` v13 SSR runtime typing and `locals.runtime.env.DB` contract across all 7 D1 API routes.
- [x] Branch `maintenance/astro-6-vite-postcss`: verified PostCSS 7-plugin chain and Vite 7 asset pipeline with zero CSS/style regressions.
- [x] After every slice, verified clean build, test suites, and regression diff against pre-upgrade baseline.

## Boundaries

- During first-run bootstrap, do documentation only.
- Treat React components and any future comment-system React surfaces as read-only unless Alok explicitly assigns them.
- Preserve SEO metadata, schema output, RSS, sitemap, D1 bindings, and basic HTML structure across every slice.
- Do not run database migrations against remote D1 unless Alok explicitly assigns the task.
- Do not bundle multiple Milestone 5 slices into one branch; each slice is independently reviewable.
- Do not commit directly to `main`.
