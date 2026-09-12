# Milestone 4 — Dead Code Cleanup

**Branch**: `chore/dead-code-cleanup`  
**Base from**: `complete_astro_v6_migration`  
**Priority**: 🟢 Low — can be done anytime, independent of other milestones  
**Estimated effort**: 0.5 days  
**Status**: ✅ Ready to start (no human tasks required)

---

> [!IMPORTANT]
> Per ADR-002: Commented-out code from Gatsby v3 is NOT deleted — it is preserved as a migration reference.
> Only truly dead/duplicate files and clearly obsolete config are removed in this milestone.

---

## Git Setup

```bash
git checkout complete_astro_v6_migration
git pull
git checkout -b chore/dead-code-cleanup
```

---

## Sub-Tasks

### 4.1 — Remove `src/lib/analytics-testing.ts`
**Commit**: `chore: remove duplicate analytics-testing.ts (inline version in Head.astro is active)`  
**Files**: `src/lib/analytics-testing.ts` (delete)

- [ ] Confirm `analytics-testing.ts` is NOT imported anywhere (it isn't — confirmed in audit)
- [ ] The active `AnalyticsDebugger` is the inline version in `Head.astro` (lines 716–906), gated by `{isDevelopment && ...}`
- [ ] Delete `src/lib/analytics-testing.ts`
- [ ] Run `npm run build` — confirm no import errors

---

### 4.2 — Remove Staticman API config from `site.js`
**Commit**: `chore: remove dead staticman API config (Heroku free tier is shutdown)`  
**Files**: `src/config/site.js`

- [ ] Remove the `staticmanApi` key and value (lines 142-143):
  ```js
  // REMOVE THIS:
  staticmanApi:
    'https://meteoric-teachings.herokuapp.com/v2/entry/theWhiteWulfy/personal-site/master/comments',
  ```
- [ ] Remove `@property {string} staticmanApi` from the JSDoc block (line 49)
- [ ] Search all `.astro`/`.ts`/`.js` files for `staticmanApi` usage — confirm none exist
- [ ] Run `npm run build` — confirm no reference errors

---

### 4.3 — Remove `githubApiToken` from `site.js` (unused)
**Commit**: `chore: remove unused githubApiToken from site config`  
**Files**: `src/config/site.js`

- [ ] Confirm `githubApiToken` is not used anywhere in the codebase (confirmed in audit)
- [ ] Remove from `site.js` line 157: `githubApiToken: process.env.GITHUB_API_TOKEN,`
- [ ] Remove `@property {string} githubApiToken` from JSDoc
- [ ] Note: If GitHub API is needed in future, use `import.meta.env.GITHUB_API_TOKEN` in server-only files, not in the shared config object

---

### 4.4 — Remove empty `reCaptcha` config stub
**Commit**: `chore: remove empty reCaptcha config stub (captcha provider not yet decided)`  
**Files**: `src/config/site.js`

- [ ] Lines 158-163: `reCaptcha: { siteKey: '', secret: '' }` — remove this empty stub
- [ ] Remove from JSDoc (`@property {object} reCaptcha`, etc.)
- [ ] Note in ADR log: captcha provider to be decided during Milestone 6 (comment system) — see TASK-6A in `HUMAN_TASKS.md`

---

### 4.5 — Update `site.js` Clarity comment
**Commit**: `chore: correct misleading Clarity project ID comment`  
**Files**: `src/config/site.js`

- [ ] Line 120: Change `// Replace with actual Clarity project ID` to `// Verified active project ID`

---

### 4.6 — Document remaining Gatsby migration backlog
**Commit**: `docs: add gatsby-migration-backlog.md with preserved dead code inventory`  
**Files**: `docs/backlog/decisions/gatsby-migration-backlog.md` (new)

- [ ] Create a document listing all preserved (not deleted) Gatsby v3 features awaiting migration:

| Item | File | Feature | Migrate in |
|---|---|---|---|
| `StringSimilarity` import | `src/pages/404.astro:6-38` | "Did you mean?" on 404 | Milestone 7 |
| Lodash slugify | `src/lib/slugify.mjs:1-5` | Alternate slug strategy | Low priority |
| `generateCaptcha()`/`verifyCaptcha()` | `src/lib/api/security.ts` | Captcha for comments | Milestone 6 |
| `cleanupOldRecords()` | `src/lib/api/database.ts` | DB maintenance | Milestone 6 |
| `comments`/`comments_locked` frontmatter | 20+ content files | Comment visibility per post | Milestone 6 |
| Illustrations lightbox TODOs | `src/pages/illustrations/[...id].astro:134,155` | Color/speed API | TBD |
| Placeholder images in services | Service page `.astro` files | Real service images | Content task |
| Visual placeholder div | `CampaignHero.astro:147` | Hero illustration | Content task |

---

## PR Checklist

Before merging to `complete_astro_v6_migration`:

- [ ] Build passes: `npm run build`
- [ ] `analytics-testing.ts` gone — no import errors
- [ ] No `staticmanApi` references remain in `src/`
- [ ] No `githubApiToken` in `site.js`
- [ ] Clarity comment updated
- [ ] `gatsby-migration-backlog.md` created
- [ ] All 4.x commits on branch `chore/dead-code-cleanup`
- [ ] PR opened: `chore/dead-code-cleanup` → `complete_astro_v6_migration`
