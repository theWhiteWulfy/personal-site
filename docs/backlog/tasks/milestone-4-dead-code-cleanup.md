# Milestone 4 — Dead Code Cleanup

**Branch**: `m4` (user-named branch; replaces the plan's `chore/dead-code-cleanup`)  
**Base from**: `main`  
**Priority**: 🟢 Low — can be done anytime, independent of other milestones  
**Status**: ✅ Implemented (2026-09-16); PR pending

---

> [!IMPORTANT]
> Per ADR-002: Commented-out code from Gatsby v3 is NOT deleted — it is preserved as a migration reference.
> Only truly dead/duplicate files and clearly obsolete config are removed in this milestone.

---

## Git Setup

```bash
git checkout main
git pull
git checkout -b m4   # user-named branch, per instruction
```

---

## Sub-Tasks

### 4.1 — Remove `src/lib/analytics-testing.ts`
**Commit**: `chore: remove duplicate analytics-testing.ts (inline version in Head.astro is active)`  
**Files**: `src/lib/analytics-testing.ts` (delete)

- [x] Confirm `analytics-testing.ts` is NOT imported anywhere (re-verified on main — grep clean)
- [x] The active `AnalyticsDebugger` is the inline version in `Head.astro` (line 722, gated by `{isDevelopment && ...}` — line 709)
- [x] Delete `src/lib/analytics-testing.ts` (422 lines removed)
- [x] Run `npm run build` — no import errors

---

### 4.2 — Remove Staticman API config from `site.js`
**Commit**: `chore: remove dead staticman API config (Heroku free tier is shutdown)`  
**Files**: `src/config/site.js`

- [x] **Already satisfied on main**: the `staticmanApi` key was removed from `site.js` during the Astro v6 migration work — no separate commit needed
- [x] Verified zero `staticmanApi` / `staticman` references remain in `src/`

---

### 4.3 — Remove `githubApiToken` from `site.js` (unused)
**Commit**: `chore: remove unused githubApiToken from site config`  
**Files**: `src/config/site.js`

- [x] Confirm `githubApiToken` is not used anywhere in the codebase (re-verified on main — only the config definition itself)
- [x] Remove from `site.js`: `githubApiToken: process.env.GITHUB_API_TOKEN,` + JSDoc `@property`
- [x] Note: If GitHub API is needed in future, use `import.meta.env.GITHUB_API_TOKEN` in server-only files, not in the shared config object (kept in commit message)

---

### 4.4 — Remove empty `reCaptcha` config stub
**Commit**: `chore: remove empty reCaptcha config stub (captcha provider not yet decided)`  
**Files**: `src/config/site.js`

- [x] Remove `reCaptcha: { siteKey: '', secret: '' }` empty stub + its JSDoc `@property` block
- [x] Note in ADR log: captcha provider to be decided during Milestone 6 (comment system) — see TASK-6A in `HUMAN_TASKS.md`; already documented in `gatsby-migration-backlog.md` (Captcha Utilities section), referenced in the commit message

---

### 4.5 — Update `site.js` Clarity comment
**Commit**: `chore: correct misleading Clarity project ID comment`  
**Files**: `src/config/site.js`

- [x] Clarity comment normalized to `// Verified active project ID` (line had drifted to `// Active project ID — sw2f0ourfn`)

---

### 4.6 — Document remaining Gatsby migration backlog
**Commit**: `docs: complete gatsby-migration-backlog inventory`  
**Files**: `docs/backlog/decisions/gatsby-migration-backlog.md` (already existed on main — completed rather than duplicated)

- [x] **Already satisfied on main**: `gatsby-migration-backlog.md` existed and covered 404 "Did you mean?", comment system frontmatter, lodash slugify, lightbox TODOs, captcha utilities, `cleanupOldRecords()`
- [x] Added the two missing inventory items: services placeholder images (`/blog-placeholder-N.jpg`), CampaignHero `.visual-placeholder` (line 147 — verified current)
- [x] Fixed 5 stale worktree-absolute file links → repo-relative; corrected `src/content.config.ts` → `src/content/config.ts`

---

## PR Checklist

Before merging to `main`:

- [x] Build passes: `npm run build` (astro check 0 errors, all pages prerendered)
- [x] `analytics-testing.ts` gone — no import errors
- [x] No `staticmanApi` references remain in `src/`
- [x] No `githubApiToken` in `site.js`
- [x] Clarity comment updated
- [x] `gatsby-migration-backlog.md` inventory complete (8/8 items)
- [x] All 4.x commits on branch `m4` (user-named; replaces `chore/dead-code-cleanup`)
- [x] PR opened: `m4` → `main`
