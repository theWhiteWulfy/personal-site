# Jules Tasks

Jules is the Observer & Maintainer. This file owns low-priority background maintenance, builds, tests, and site integrity verification after task branches are ready.

## Active: Baseline Verification

- [ ] Run `npm run build` after documentation-only bootstrap changes.
- [ ] Confirm generated docs changes do not alter runtime code.
- [ ] Record build failures with exact command output and suspected ownership area.
- [ ] Verify `git status --short --branch` before handoff.

## Upcoming: Maintenance Verification

- [ ] Run `npm run build` after each Astro upgrade slice.
- [ ] Run Cloudflare preview checks only when a branch explicitly requires deployment validation.
- [ ] Verify RSS, sitemap, API routes, and key static pages after framework changes.
- [ ] Check D1-related scripts once missing migration and verification script files are restored or replaced.

## Boundaries

- Do not commit directly to `main`.
- Do not change app logic while verifying.
- Do not run database migrations unless Alok explicitly assigns the task.
