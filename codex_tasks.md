# Codex Tasks

Codex / GPT-5.5 is the Mechanic. This file owns heavy logic, wiring, Astro component changes, and structural updates after the first-run baseline is complete.

## Active: First-Run Support

- [ ] Bootstrap the agent task files and `skills/` SOP directory on `docs/agentic-orchestration-baseline`.
- [ ] Add implementation-sensitive architecture notes without changing runtime behavior.
- [ ] Augment `README.md` with the multi-agent workflow and preservation constraints.
- [ ] Record Astro 6.2 implementation risks for future Codex work.

## Milestone 2: Astro 6.2 Compatibility Audit (Implementation Risks)

Goal: produce the implementation-side risk register that complements Claude's architecture plan. No code or dependency changes in this milestone.

Branch: `docs/astro-6-2-implementation-audit`.

- [ ] Audit `<ViewTransitions />` usage. Confirmed locations to record in `docs/astro_6_2_implementation_audit.md`:
  - Import + render in `src/components/Head.astro` (lines around 4 and 310).
  - All `astro:after-swap` listeners that depend on it: `src/components/Head.astro`, `src/components/CampaignCTA.astro`, `src/components/CampaignHero.astro`, `src/lib/resource-form.js`, `src/lib/api/utm-tracking.ts`, `src/pages/offers/[...slug].astro`, `src/pages/offers/expired.astro`.
  - Note the global helpers (`checkAnalyticsConsent`, `trackEngagementEvent`, `trackConversionEvent`, `addCopyCodeButtons`) re-bound after swap and the contract they must keep.
- [ ] Audit `entry.slug` / `entry.render()` / `entry.collection` usage and inventory every site:
  - Detail routes: `src/pages/articles/[...slug].astro`, `src/pages/notes/[...slug].astro`, `src/pages/works/[...slug].astro`, `src/pages/bibliophilediaries/[...slug].astro`, `src/pages/saasguide/[...slug].astro`, `src/pages/illustrations/[...slug].astro`, `src/pages/faqs/...`, `src/pages/tag/[...slug].astro`.
  - Index routes: `src/pages/works/index.astro`, `src/pages/saasguide/index.astro`, plus all sibling collection index pages.
  - Syndication: `src/pages/rss.xml.js` (uses `item.collection` + `item.slug`).
  - Note `getNextPost`/`getPrevPost` patterns in `[...slug]` files comparing `post.slug === Astro.params.slug`.
- [ ] Audit Cloudflare adapter wiring before any version bump:
  - `astro.config.mjs` adapter block (`platformProxy.enabled: true`, `imageService: 'passthrough'`).
  - `src/env.d.ts` `Runtime<ENV>` typing using `@cloudflare/workers-types`.
  - `wrangler.toml` `nodejs_compat`, `DB` binding, database id.
  - All seven API routes confirm `export const prerender = false` + `locals.runtime.env.DB`.
- [ ] Audit Vite/PostCSS plugin chain in `astro.config.mjs` and `postcss.config.cjs`. List each plugin (`postcss-import`, `postcss-mixins`, `postcss-nested`, `postcss-custom-media`, `postcss-preset-env`, `postcss-url`, `cssnano`) with the version known to work against Astro 6's bundled Vite.
- [ ] Audit `markdown.syntaxHighlight: 'prism'` and the remark plugins (`remarkReadingTime`, `remarkModifiedTime`) for Astro 6 compatibility; flag if Shiki is the new default.
- [ ] Audit `astro check` invocation in `package.json` (`"build": "astro check && astro build"`) against the `@astrojs/check` version required by Astro 6.
- [ ] Preserve `src/content/config.ts` and the legacy `defineCollection` shape until Claude's reviewed migration plan exists.

## Milestone 3: Cloudflare D1 And API Surface Stabilization (Implementation)

Goal: close gaps and harden the D1 surface so future framework upgrades are safe. Each task gets its own branch.

- [ ] Branch `maintenance/db-scripts-restore`: implement the missing `scripts/migrate-database.js` and `scripts/verify-database.js` to the contract Claude documents in `docs/d1_api_contract.md`.
  - Support `--local` flag to switch between remote and local D1 via Wrangler.
  - `migrate-database.js` runs every `scripts/*.sql` file in lexical order, idempotent.
  - `verify-database.js` checks tables exist (`resource_downloads`, `analytics_events`, `campaigns`, `campaign_visits`, `newsletter`, lead form table) and prints schema.
  - Wire into `npm run db:migrate`, `db:migrate:local`, `db:verify`, `db:verify:local`.
- [ ] Branch `maintenance/db-missing-migrations`: add SQL migrations for tables already in production but absent from `scripts/`.
  - `004_create_newsletter.sql` for the `newsletter` table used by `src/pages/api/newsletter.ts`.
  - `005_create_leadform.sql` (or similar) for the table used by `src/pages/api/leadform.ts`.
  - Use `CREATE TABLE IF NOT EXISTS` so reapplying is safe.
  - Do not run against remote D1; Jules verifies locally first.
- [ ] Branch `maintenance/d1-locals-guard`: standardize the `locals?.runtime?.env?.DB` guard across all seven API routes; extract into a single helper in `src/lib/api/database.ts` if duplication exists, without changing return shapes or status codes.
- [ ] Hold any change to `wrangler.toml` D1 binding, database id, or `nodejs_compat` flag until Alok approves explicitly.

## Milestone 4: Content And SEO Preservation (Implementation)

Goal: prepare components and pages so Astro upgrade slices do not regress SEO, content URLs, or analytics. Implementation-only on dedicated branches.

- [ ] Branch `feature/head-clientrouter-prep`: refactor `src/components/Head.astro` so the `<ViewTransitions />` import is isolated and easy to swap.
  - Move the import + render to a single, top-of-component block.
  - Add a TODO comment referencing `docs/astro_6_2_upgrade_plan.md`.
  - Do not yet swap to `<ClientRouter />`.
- [ ] Branch `feature/after-swap-helper`: extract the repeated `astro:after-swap` re-attachment pattern into a small helper module under `src/lib/` and reuse it in `Head.astro`, `CampaignCTA.astro`, `CampaignHero.astro`, `resource-form.js`, `utm-tracking.ts`, `offers/[...slug].astro`, `offers/expired.astro`. Keep behavior identical so Jules's diff stays clean.
- [ ] Branch `feature/collection-slug-shim`: add a thin `src/lib/collection-paths.ts` exporting `entryPath(entry)` returning `/${entry.collection}/${entry.slug}/`. Wire it into `rss.xml.js` and the index pages without changing produced URLs. This isolates the future `slug` → `id` rename behind one symbol.
- [ ] Branch `feature/render-shim`: add `src/lib/render-entry.ts` exporting `renderEntry(entry)` that returns `{ Content, headings, remarkPluginFrontmatter }`. Use it from every `[...slug].astro` detail route. Same isolation rationale.
- [ ] Hold all `src/content/config.ts` rewrites until Claude's loader migration plan is approved. Treat React components as read-only.
- [ ] After each branch, instruct Jules to diff `dist/sitemap-*.xml`, `dist/rss.xml`, and one rendered page per collection against the previous build. No rendered HTML drift is acceptable beyond hashed asset filenames.

## Milestone 5: Phased Astro 6.2 Upgrade Execution (Implementation)

Goal: execute the phased upgrade slice-by-slice, only after Claude's plan is reviewed and Alok approves each slice. One branch per slice, all `feature/` or `maintenance/`.

- [ ] Branch `maintenance/astro-deps-dry-run`: bump `astro`, `@astrojs/check`, `@astrojs/mdx`, `@astrojs/rss`, `@astrojs/sitemap`, `@astrojs/cloudflare`, `vite-plugin-pwa`, `@playform/compress`, and `@cloudflare/workers-types` to Astro-6-compatible versions in `package.json` only; commit, then have Jules run `npm install` + `npm run build` and report.
- [ ] Branch `feature/astro-6-clientrouter`: replace `<ViewTransitions />` with `<ClientRouter />` from `astro:transitions` in `src/components/Head.astro`. Verify every `astro:after-swap` listener still fires (Jules runs preview + click-through on each affected page).
- [ ] Branch `feature/astro-6-entry-api`: switch `entry.slug` / `entry.render()` to whatever the upgraded Content API exposes, going through the shims from Milestone 4 (`entryPath`, `renderEntry`). Update the shims in one place; no per-page edits.
- [ ] Branch `feature/astro-6-content-loader` (only if approved): migrate `src/content/config.ts` collections to the Content Layer `loader` pattern, one collection at a time, starting with the lowest-traffic collection (`faqs`). Keep schemas byte-identical.
- [ ] Branch `maintenance/astro-6-cloudflare-adapter`: address any `@astrojs/cloudflare` runtime-typing or `locals.runtime.env` shape changes. Update `src/env.d.ts` if and only if the adapter requires it.
- [ ] Branch `maintenance/astro-6-vite-postcss`: address Vite/PostCSS plugin breakage flagged by Jules's build runs. Pin minimum versions; do not introduce new plugins.
- [ ] After every slice, hand off to Jules for build + preview + diff. Do not chain slices into a single branch.

## Boundaries

- During first-run bootstrap, do documentation only.
- Treat React components and any future comment-system React surfaces as read-only unless Alok explicitly assigns them.
- Preserve SEO metadata, schema output, RSS, sitemap, D1 bindings, and basic HTML structure across every slice.
- Do not run database migrations against remote D1 unless Alok explicitly assigns the task.
- Do not bundle multiple Milestone 5 slices into one branch; each slice is independently reviewable.
- Do not commit directly to `main`.
