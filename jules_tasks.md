# Jules Tasks

Jules is the Observer & Maintainer. This file owns low-priority background maintenance, builds, tests, and site integrity verification after task branches are ready.

## Active: Baseline Verification

- [ ] Run `npm run build` after documentation-only bootstrap changes.
- [ ] Confirm generated docs changes do not alter runtime code.
- [ ] Record build failures with exact command output and suspected ownership area.
- [ ] Verify `git status --short --branch` before handoff.

## Milestone 2: Astro 6.2 Compatibility Audit (Verification)

Goal: ensure documentation-only audit branches do not change runtime output and produce a clean baseline snapshot for later diffs.

Branch: `maintenance/astro-6-2-baseline-snapshot`.

- [ ] On the current Astro 4.15 baseline, run `npm install` followed by `npm run build` and capture the full log to `docs/baseline/build-astro-4-15.log` (do not commit logs to `main`; keep them on the branch).
- [ ] Capture and commit a snapshot of:
  - `dist/rss.xml`
  - `dist/sitemap-index.xml` and any `dist/sitemap-*.xml` shards
  - One representative rendered HTML page per collection (`articles`, `notes`, `works`, `illustrations`, `bibliophilediaries`, `saasguide`, `faqs`) plus home and a tag page
  - One API route preview if `npm run cfpreview` is available locally
- [ ] Store snapshots under `docs/baseline/` so Gemini can diff against post-upgrade outputs.
- [ ] Run `astro check` standalone and capture warnings; record any pre-existing type errors so they are not blamed on upgrade work.
- [ ] Verify Claude's, Codex's, and Gemini's Milestone 2 doc branches change zero files outside `docs/`, `central_milestones.md`, `claude_tasks.md`, `codex_tasks.md`, `gemini_tasks.md`, `jules_tasks.md`, `README.md`, and `ARCHITECTURE.md`.

## Milestone 3: Cloudflare D1 And API Surface Stabilization (Verification)

Goal: validate D1 scripts and API behavior locally before anything touches remote D1.

- [ ] After Codex's `maintenance/db-scripts-restore` branch, run:
  - `npm run db:verify:local` against a fresh local D1.
  - `npm run db:migrate:local` to apply `scripts/*.sql`.
  - `npm run db:verify:local` again; confirm every expected table exists.
- [ ] After Codex's `maintenance/db-missing-migrations` branch, run the new SQL through the local migrator and confirm the schemas match what the API code expects (introspect with `wrangler d1 execute meteoric --local --command "SELECT sql FROM sqlite_master"`).
- [ ] Run `npm run cfpreview` and exercise each API route with a sample payload:
  - POST `/api/newsletter`
  - POST `/api/leadform`
  - POST `/api/resource-download`
  - GET `/api/resource-download`
  - POST `/api/serve-resource`
  - GET `/api/campaigns`, POST, PUT
  - POST `/api/campaign-visit`, GET
  - POST `/api/campaign-signup`
- [ ] Capture each response status and body to `docs/baseline/api-responses.md` (sanitize emails). These become the regression baseline.
- [ ] Do not run any migration against remote D1 (database id `8380ec22-098e-4814-a56f-48d907425b35`) without explicit Alok approval.

## Milestone 4: Content And SEO Preservation (Verification)

Goal: prove Codex's preservation prep branches keep build output stable.

- [ ] After `feature/head-clientrouter-prep`: run `npm run build`; diff `dist/` HTML for home, one article, RSS, and sitemap against the Milestone 2 baseline. Expect zero meaningful drift.
- [ ] After `feature/after-swap-helper`: run `npm run build` and `npm run preview`; in DevTools, manually navigate between two pages and confirm:
  - Phone/email click tracking re-attaches.
  - Copy-code buttons re-mount on prose pages.
  - Campaign countdown timer continues on `offers/[...slug]`.
  - Campaign CTA bindings re-attach.
  - UTM tracker re-runs.
  - Resource form bindings re-attach on resource pages.
- [ ] After `feature/collection-slug-shim` and `feature/render-shim`: build, then diff `dist/rss.xml` and one `[...slug]` page per collection against the baseline. Any URL or HTML drift blocks the merge.
- [ ] Run `astro check` on each of these branches and report any new diagnostics.
- [ ] Keep `git status --short --branch` clean before handing the branch back to Alok for review.

## Milestone 5: Phased Astro 6.2 Upgrade Execution (Verification)

Goal: be the single source of truth on whether an upgrade slice is safe to merge. Verify, snapshot, diff, report.

- [ ] After `maintenance/astro-deps-dry-run`:
  - Delete `node_modules` and `package-lock.json`, run `npm install`.
  - Run `npm run build`; capture the log.
  - If the build fails, do not retry blindly; record the first error class and route the branch back to Codex with the failing log.
- [ ] After `feature/astro-6-clientrouter`:
  - Build + preview.
  - Click-through every page in the Milestone 2 snapshot set; record any console error.
  - Confirm `<ClientRouter />` is rendered in HTML head and `<ViewTransitions />` is gone.
- [ ] After `feature/astro-6-entry-api`:
  - Build + diff produced HTML for every snapshotted page.
  - Diff `dist/rss.xml` and `dist/sitemap-*.xml` byte-for-byte against the Milestone 2 snapshot, allowing only hashed asset filename changes.
- [ ] After `feature/astro-6-content-loader` (per collection, if approved):
  - Build + diff that collection's index page and one entry detail page.
  - Confirm tag aggregation pages still list the migrated collection's entries.
- [ ] After `maintenance/astro-6-cloudflare-adapter`:
  - Run `npm run cfpreview` and re-exercise every API route.
  - Compare responses against `docs/baseline/api-responses.md`; report any deviation.
- [ ] After `maintenance/astro-6-vite-postcss`:
  - Build, then diff one `*.module.css`-heavy page (e.g., archive index) and the global stylesheet for class-name and selector drift.
- [ ] At end of Milestone 5: run `npm run build` once more, run `astro check`, and verify the final state passes both. Hand the green build over to Alok for review.

## Boundaries

- Do not commit directly to `main`.
- Do not change app logic, styles, or content while verifying. If a fix is needed, route the branch back to Codex.
- Do not run database migrations against remote D1 unless Alok explicitly assigns the task.
- Do not chase dependency upgrades; only run the install/build the assigned branch declares.
- Do not skip diff capture; the diffs are the deliverable, not just a green build.
