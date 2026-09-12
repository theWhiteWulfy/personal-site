# Original User Request

## 2026-09-11T21:10:50Z

Verify the completion and integrity of prior milestones (Milestones 1–3) and complete all pending tasks for the Astro 4.15 to Astro 6.2 migration across Milestone 4 (Content and SEO Preservation) and Milestone 5 (Phased Astro 6.2 Upgrade Execution), committing each task atomically on the worktree.

Working directory: C:\Users\alok9\.gemini\antigravity\worktrees\p-site-astro\complete_astro_v6_migration
Integrity mode: development

## Verification Resources
- Pre-upgrade snapshots and baseline files in `docs/baseline/` (`dist/rss.xml`, `dist/sitemap-*.xml`, rendered collection HTML pages, `api-responses.md`).
- Architecture plans and breaking change inventories in `docs/astro_6_2_upgrade_plan.md`, `docs/astro_6_2_breakage_matrix.md`, `docs/astro_6_2_decisions.md`, `docs/d1_api_contract.md`, and `docs/seo_invariants.md`.
- Task tracking files: `central_milestones.md`, `codex_tasks.md`, `claude_tasks.md`, `gemini_tasks.md`, and `jules_tasks.md`.
- Test suites & scripts: `npm run test:db`, `npm run db:verify:local`, `npm run db:migrate:local`, `npm run build`.

## Requirements

### R0. Prior Milestones Verification (Milestones 1–3 Pre-flight Gate)
- Verify the deliverables and integrity of Milestones 1, 2, and 3 before writing any new code:
  - Validate that D1 migration scripts (`scripts/migrate-database.js`, `scripts/verify-database.js`) and migrations (`004_create_newsletter.sql`, `005_create_leads.sql`) exist and pass verification tests (`npm run test:db`, `npm run db:verify:local`).
  - Confirm API route DB guards and baseline response contracts recorded in `docs/baseline/api-responses.md` match current code.
  - Verify that baseline snapshots in `docs/baseline/` are complete and available for post-upgrade regression diffing.
  - Confirm task files (`central_milestones.md`, `codex_tasks.md`, `claude_tasks.md`, `gemini_tasks.md`, `jules_tasks.md`) accurately reflect Milestones 1–3 status.

### R1. Content and SEO Preservation Shims (Milestone 4)
- Refactor `src/components/Head.astro` to isolate transition/router imports for Astro 6 readiness.
- Extract the repeated `astro:after-swap` re-attachment pattern into a shared helper module under `src/lib/`.
- Introduce collection path (`entryPath`) and entry rendering (`renderEntry`) shims to insulate page routes from the `slug` → `id` and `.render()` API transition.
- Keep output HTML, canonical URLs, OG tags, JSON-LD schemas, and RSS links byte-equivalent to the baseline.

### R2. Phased Astro 6.2 & Companion Dependency Upgrades (Milestone 5 Slices 1–2)
- Upgrade `package.json` dependencies to Astro 6.x compatibility (`astro`, `@astrojs/cloudflare`, `@astrojs/mdx`, `@astrojs/rss`, `@astrojs/sitemap`, `@astrojs/check`, and PWA integration/Vite plugins).
- Update `astro.config.mjs` (replace `output: "hybrid"` with `output: "static"`, enable `legacy.collectionsBackwardsCompat`, configure Cloudflare adapter, verify CSRF and origin checks).
- Update schema imports to `astro/zod`.
- Resolve PostCSS and Vite 7 configuration compatibility.

### R3. Client Router Migration & Event Lifecycle Stabilization (Milestone 5 Slice 3)
- Replace `<ViewTransitions />` with `<ClientRouter />` in `src/components/Head.astro`.
- Validate that all 7 post-swap event listeners (analytics consent/tracking, UTM tracking, copy-code button mounts, campaign CTA/hero interactions, resource form submission) re-bind and fire properly across client navigations.

### R4. Content Layer Loader Migration & Collection API Normalization (Milestone 5 Slices 4–5)
- Migrate all collection consumers and `getStaticPaths` routes from `entry.slug` to `entry.id` and `render(entry)` via the established shims.
- Migrate `src/content/config.ts` collections (`articles`, `notes`, `works`, `illustrations`, `bibliophilediaries`, `saasguide`, `faqs`, `albums`) to Content Layer `glob`/`file` loaders from `astro/loaders`.
- Remove `legacy.collectionsBackwardsCompat` from `astro.config.mjs` and confirm all collection data and gallery schemas load cleanly.

### R5. Atomic Worktree Commits & Milestone Task Synchronization
- Commit each distinct task / slice atomically with concise, descriptive commit messages matching project conventions.
- Keep task trackers (`central_milestones.md`, `codex_tasks.md`, `claude_tasks.md`, `gemini_tasks.md`, `jules_tasks.md`) and architectural decision records (`docs/astro_6_2_decisions.md`) synchronized as each task is completed.

## Acceptance Criteria

### Prior Milestones Verification
- [ ] Milestones 1, 2, and 3 requirements and artifacts are verified; `npm run test:db` passes cleanly before initiating Milestones 4 and 5.
- [ ] Baseline files in `docs/baseline/` are confirmed intact and accessible.

### Automated Build & Type Checking
- [ ] `npm run build` exits with code 0 without unhandled warnings or errors.
- [ ] `npx astro check` passes with 0 diagnostics/type errors.
- [ ] Database verify scripts (`npm run db:verify:local`) and test suites pass.

### Regression & Output Preservation
- [ ] Rendered HTML for sample pages from every content collection matches `docs/baseline/` structure and metadata.
- [ ] `dist/rss.xml` and `dist/sitemap-index.xml` (and shard sitemaps) emit valid URLs with identical formatting and no trailing-slash anomalies on extension endpoints.
- [ ] API routes continue to handle requests and preserve the `locals.runtime.env.DB` contract under `@astrojs/cloudflare`.

### Task Completion & History
- [ ] All check boxes in `codex_tasks.md`, `gemini_tasks.md`, `claude_tasks.md`, `jules_tasks.md`, and `central_milestones.md` for Milestones 4 and 5 are marked completed.
- [ ] Git commit history reflects clean, atomic commits for each migration slice.
