# Claude Tasks

Claude Opus / Anti-Gravity is the Architect. This file owns deep architecture documentation, structural analysis, and repository evaluation.

## Active: First-Run Baseline

- [x] Review the full Astro project structure and document the architectural map in `ARCHITECTURE.md`.
- [x] Document the content collection model, including `src/content/config.ts`, collection folders, and gallery data.
- [x] Document SEO, schema, RSS, sitemap, analytics, and metadata flow.
- [x] Document Cloudflare deployment shape, D1 binding `DB`, and API route database access patterns.
- [x] Record first-run findings without changing runtime code, UI, migrations, or dependencies.

## Milestone 2: Astro 6.2 Compatibility Audit (Architecture)

Goal: produce the authoritative phased upgrade plan that Codex, Gemini, and Jules will execute against. Documentation only; no code or dependency changes.

Branch: `docs/astro-6-2-architecture-plan`.

- [x] Compare `astro@^4.15.12` against the Astro 5.0 and 6.0 official upgrade guides; record breaking-change deltas in a new `docs/astro_6_2_upgrade_plan.md`.
- [x] Map current legacy collection shape in `src/content/config.ts` (8 collections: `articles`, `notes`, `works`, `illustrations`, `bibliophilediaries`, `saasguide`, `faqs`, `albums`) to the Astro 5+ Content Layer loader pattern; record a per-collection migration recipe (loader, schema, slug strategy).
- [x] Define a phased migration strategy with reviewable slices, in this order:
  1. Dependency dry-run on a throwaway branch (no code edits).
  2. Astro core + adapter + integration version bumps with legacy collection compat preserved.
  3. `<ViewTransitions />` → `<ClientRouter />` swap in `src/components/Head.astro`.
  4. `entry.slug` / `entry.render()` audit-and-replace pass.
  5. Optional Content Layer loader migration of `src/content/config.ts`.
- [x] Identify decisions that need explicit Alok approval before Codex acts (e.g., adopting `<ClientRouter />`, switching `albums` to a new loader, dropping legacy compat). List each in the upgrade plan with options + recommendation.
- [x] Document the trailing-slash and `Astro.url` behavior expected after upgrade, since canonical URLs and OpenGraph tags in `src/components/Head.astro` depend on it.
- [x] Cross-reference `docs/astro_6_2_risk_inventory.md`, `docs/content_collection_review.md`, and `docs/seo_analytics_preservation_review.md` from the new plan so Codex has one entry point.
- [x] Update `ARCHITECTURE.md` "Upgrade Risks" section with links to the new plan.

## Milestone 3: Cloudflare D1 And API Surface Stabilization (Architecture)

Goal: lock the D1/API contract so framework upgrades cannot silently break it.

Branch: `docs/d1-api-architecture`.

- [x] Author `docs/d1_api_contract.md` enumerating every API route and the D1 tables it touches:
  - `src/pages/api/newsletter.ts` → `newsletter`
  - `src/pages/api/leadform.ts` → lead form table
  - `src/pages/api/resource-download.ts` → `resource_downloads`, `analytics_events`
  - `src/pages/api/serve-resource.ts` → `resource_downloads`
  - `src/pages/api/campaigns.ts` → `campaigns`, `campaign_visits`
  - `src/pages/api/campaign-visit.ts` → `campaign_visits`
  - `src/pages/api/campaign-signup.ts` → `campaign_visits`, `analytics_events`
- [x] Document the canonical access pattern (`export const prerender = false`, `locals.runtime.env.DB`, `DB.prepare().bind().run/first/all`) and flag it as preservation-critical.
- [x] Record the missing-table gap: `newsletter` and the implied lead form table have no migration in `scripts/`. Recommend the migration ownership (Codex creates SQL, Jules verifies against local D1) without authoring SQL in this branch.
- [x] Record the missing-script gap: `package.json` references `scripts/migrate-database.js` and `scripts/verify-database.js` that do not exist. Document the expected interface (CLI flags `--local`, env binding name, table list) so Codex can implement to spec later.
- [x] Document `wrangler.toml` invariants that must be preserved through upgrades: `nodejs_compat`, binding `DB`, database name `meteoric`, database id `8380ec22-098e-4814-a56f-48d907425b35`.
- [x] Add a "Cloudflare Adapter Compatibility Matrix" section listing the `@astrojs/cloudflare` versions required for each Astro major and the `platformProxy` / `imageService` flags that must remain set.

## Milestone 4: Content And SEO Preservation (Architecture)

Goal: define the SEO/content invariants Codex must not regress and Jules must verify.

Branch: `docs/seo-content-invariants`.

- [x] Author `docs/seo_invariants.md` capturing required-stable outputs:
  - `<title>` template, `description`, canonical, `og:*`, `twitter:*` tag set produced by `src/components/Head.astro`.
  - JSON-LD schema array shape produced by `src/lib/schema-generators.ts` for each `pageType` (home, about, contact, service, article, FAQ, resource, campaign, default).
  - RSS link template `/${item.collection}/${item.slug}/` from `src/pages/rss.xml.js` and the included collection set (`articles`, `works`, `notes`, `bibliophilediaries`, `saasguide`).
  - Sitemap inclusion rules (static pages in, `/api/*` out).
- [x] Document the analytics consent + opt-out contract from `src/lib/analytics.ts` and `src/components/Head.astro`: `checkAnalyticsConsent`, `hasOptedOut`, `setAnalyticsConsent`, `setOptOutPreference`, `trackEngagementEvent`, `trackConversionEvent`. These globals must remain callable after the `<ClientRouter />` swap.
- [x] List the content-collection routes whose URL shape must not change: `/articles/`, `/notes/`, `/works/`, `/bibliophilediaries/`, `/saasguide/`, `/illustrations/`, `/faqs/`, `/tag/`, plus their `[...slug]` children.
- [x] Document the `astro:after-swap` re-attachment contract used by analytics, copy-code buttons, campaign analytics, UTM tracker, and resource forms. Enumerate the seven files holding these listeners (`Head.astro`, `CampaignCTA.astro`, `CampaignHero.astro`, `resource-form.js`, `utm-tracking.ts`, `offers/[...slug].astro`, `offers/expired.astro`).
- [x] Define the diff-driven verification protocol Jules will run: capture pre-upgrade `dist/sitemap-*.xml`, `dist/rss.xml`, and the rendered HTML of one page per content collection; diff after upgrade.

## Milestone 5: Phased Astro 6.2 Upgrade Execution (Architecture)

Goal: keep the architecture record current as Codex executes the phased plan; do not perform implementation.

Branch: `docs/astro-6-2-execution-log`.

- [x] After each Codex implementation slice merges, update `ARCHITECTURE.md` to reflect the new state (versions, removed APIs, new APIs in use).
- [x] Maintain a running ADR-style log in `docs/astro_6_2_decisions.md` capturing every reviewed decision Codex acted on, with branch name, date, and outcome.
- [x] Re-evaluate "First-Run Findings" in `ARCHITECTURE.md` after each slice; close items as resolved or restate them with new context.
- [x] At end-of-upgrade, refresh `central_milestones.md` only at milestone-completion granularity (no per-task entries).

## Boundaries

- Do not edit app logic, API routes, components, or styles.
- Do not migrate content collections or rewrite `src/content/config.ts`.
- Do not change `wrangler.toml`, D1 bindings, or any deployment config.
- Do not run `npm install`, dependency upgrades, builds, or migrations.
- Do not commit directly to `main`; one branch per milestone deliverable using only `docs/` prefix.
