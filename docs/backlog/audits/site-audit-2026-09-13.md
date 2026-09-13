# Site Audit: Meteoric Teachings (alokprateek.in)
**Generated**: 2026-09-12 | **Updated with human corrections**: 2026-09-13  
**Version**: 5.0.0 (Astro 6.x) | **Branch**: complete_astro_v6_migration

---

## Human Corrections Applied

The following corrections were made after the initial audit based on owner input:

| Initial Finding | Correction |
|---|---|
| Clarity `projectId: 'sw2f0ourfn'` — "may be placeholder" | **Confirmed active.** The comment in `site.js` is misleading but the ID is correct. Comment to be updated (M4.5). |
| `staticmanApi` — "almost certainly broken" | **Confirmed dead.** Heroku free tier shutdown. Config to be removed (M4.2). |
| `StringSimilarity` — "planned feature never implemented" | **Was working in Gatsby v3** but couldn't migrate to Astro v4. Preserved as Gatsby migration reference. Re-implementation planned in M7. |
| Giscus removal — "referenced but never implemented" | **Was tried as Staticman replacement** but was not practical. Removed intentionally. |
| `public/web/experiment/` — "implies experimental files" | **Intentional.** These are browser experiments. The `external` config in `astro.config.mjs` is correct — do not bundle. |
| `analytics-testing.ts` — "dead/orphaned" | **Confirmed removable.** Duplicate of inline `Head.astro` code. Scheduled for removal in M4.1. |
| `public/blog-placeholder-*.jpg` — "likely from theme bootstrap, not referenced" | **Confirmed referenced.** Used in content markdown or frontmatter. Keep. |
| `public/avatar2.png`, `public/avatar3.jpg` — "unclear which are in use" | **Intentionally kept.** Different avatar variants are used by GitHub, LinkedIn and other services that pull from these URLs. Keep all. |
| `public/rss/` — "may conflict with dynamic `/rss.xml.js`" | **Not a conflict.** The `public/rss/` folder contains the RSS XSLT stylesheet. Serves different purpose. Keep. |
| `output: "static"` with hybrid rendering note | **Track for Astro 7 migration.** In Astro 7, hybrid rendering is the default. Address in M5. |
| VitePWA in `vite.plugins` | **Needs migration.** VitePWA config placement should be reviewed for Astro 6/7 compatibility. Address in M5. |

---

## 1. WIP Items — Code Comments, Dead Code & Incomplete Features

### 🔴 Active TODOs in Source Code

| File | Line | Item | Action |
|---|---|---|---|
| [`site.js`](file:///C:/Users/alok9/.gemini/antigravity/worktrees/p-site-astro/complete_astro_v6_migration/src/config/site.js#L141) | 141 | `micropubUrl: ''` — empty, renders broken `<link>` tag | Fix in M2.1 (gate tag on non-empty) |
| [`site.js:119`](file:///C:/Users/alok9/.gemini/antigravity/worktrees/p-site-astro/complete_astro_v6_migration/src/config/site.js#L119) | 120 | Comment "Replace with actual Clarity project ID" — ID is actually correct | Update comment in M4.5 |
| [`illustrations/[...id].astro`](file:///C:/Users/alok9/.gemini/antigravity/worktrees/p-site-astro/complete_astro_v6_migration/src/pages/illustrations) | 134, 155 | `/* TODO: map color/speed to API */` — lightbox not wired to theming API | Gatsby migration backlog |

### 🟡 Preserved Gatsby v3 Dead Code (Migration Reference — Do Not Delete)

| File | Lines | Original Feature | Migrate in |
|---|---|---|---|
| [`404.astro`](file:///C:/Users/alok9/.gemini/antigravity/worktrees/p-site-astro/complete_astro_v6_migration/src/pages/404.astro#L6) | 6–38 | `StringSimilarity` "did you mean?" — worked in Gatsby, failed in Astro v4 | **M7** (re-implement natively) |
| [`slugify.mjs`](file:///C:/Users/alok9/.gemini/antigravity/worktrees/p-site-astro/complete_astro_v6_migration/src/lib/slugify.mjs#L1-L5) | 1–5 | Lodash-based slugify | Low priority |
| `comments`/`comments_locked` fields | 20+ content files | Comment visibility per post | **M6** (comment system) |

### 🗑️ Confirmed Removable Dead Code

| File | Reason | Remove in |
|---|---|---|
| [`src/lib/analytics-testing.ts`](file:///C:/Users/alok9/.gemini/antigravity/worktrees/p-site-astro/complete_astro_v6_migration/src/lib/analytics-testing.ts) | Exact duplicate of inline `AnalyticsDebugger` in `Head.astro`. Module never imported. | **M4.1** |
| `site.js:142` (`staticmanApi`) | Heroku free tier dead. Confirmed by owner. | **M4.2** |
| `site.js:157` (`githubApiToken`) | Never used in any API call. | **M4.3** |
| `site.js:158–163` (`reCaptcha` stub) | Empty keys, no captcha wired. Remove stub; captcha provider decided in M6. | **M4.4** |

### 🟡 Incomplete Feature Implementations

| Feature | Status | Planned Milestone |
|---|---|---|
| Comment system | ❌ None operational | **M6** |
| Webmention display | ❌ Not built | **M2** |
| rel-me social verification | ❌ Not implemented | **M2** |
| 404 "did you mean?" | ❌ Gatsby version commented out | **M7** |
| Micropub endpoint | ❌ Not planned (ADR-006) | Not planned |
| POSSE cross-posting | ❌ Not started | **M8A** |
| Backfeed aggregation | ❌ Not started | **M8B** |
| WebSub | ❌ Not started | **M8E** |
| Semantic search | ❌ Research needed | **M8C** |
| Bookmark system | ❌ Not started | Not prioritized |
| Dark mode refinement | ⚠️ Toggle exists, coverage gaps | **M8D** |
| h-card author markup | ⚠️ Partial | M6 (complete during comment system) |
| IndieAuth discovery links | ❌ Not started | Deferred (Micropub not planned) |

---

## 2. Security Issues

### 🔴 CRITICAL & HIGH — Fix in Milestone 1

| # | Issue | File | Severity | Action |
|---|---|---|---|---|
| N1 | **Hardcoded HMAC secret** `'your-secret-key-here'` for download token signing | [`serve-resource.ts:71`](file:///C:/Users/alok9/.gemini/antigravity/worktrees/p-site-astro/complete_astro_v6_migration/src/pages/api/serve-resource.ts#L71) | 🔴 CRITICAL | **M1.2** — replace with env var + crypto.subtle |
| N2 | **Mock PDF stub** served as real resource — download flow is fake in prod | [`serve-resource.ts:160-214`](file:///C:/Users/alok9/.gemini/antigravity/worktrees/p-site-astro/complete_astro_v6_migration/src/pages/api/serve-resource.ts#L160) | 🔴 HIGH | **M3** — real file storage |
| N3 | **No auth on admin stats endpoint** `GET /api/resource-download` — exposes all user PII | [`resource-download.ts:184`](file:///C:/Users/alok9/.gemini/antigravity/worktrees/p-site-astro/complete_astro_v6_migration/src/pages/api/resource-download.ts#L184) | 🔴 HIGH | **M1.5** — admin key auth |
| N4 | **No auth on campaign CRUD** `POST/PUT/DELETE /api/campaigns` — fully public | [`campaigns.ts:159`](file:///C:/Users/alok9/.gemini/antigravity/worktrees/p-site-astro/complete_astro_v6_migration/src/pages/api/campaigns.ts#L159) | 🔴 HIGH | **M1.6** — admin key auth |
| 1 | **Missing `X-Frame-Options`** — clickjacking | [`public/_headers`](file:///C:/Users/alok9/.gemini/antigravity/worktrees/p-site-astro/complete_astro_v6_migration/public/_headers) | 🔴 HIGH | **M1.1** |
| 2 | **CSP `form-action https:`** too permissive | `public/_headers:4` | 🔴 HIGH | **M1.1** |
| N5 | **PII email in server console log** on every download | [`serve-resource.ts:332`](file:///C:/Users/alok9/.gemini/antigravity/worktrees/p-site-astro/complete_astro_v6_migration/src/pages/api/serve-resource.ts#L332) | 🟡 MEDIUM | **M1.3** |
| N6 | **`console.log(result)`** in LeadForm + NewsletterForm (raw API response) | [`LeadForm.astro:119`](file:///C:/Users/alok9/.gemini/antigravity/worktrees/p-site-astro/complete_astro_v6_migration/src/components/custom/LeadForm.astro#L119) | 🟡 MEDIUM | **M1.7** |
| N7 | **Duplicate detection bypass** — dedup by utm_source not email | [`campaign-signup.ts:150`](file:///C:/Users/alok9/.gemini/antigravity/worktrees/p-site-astro/complete_astro_v6_migration/src/pages/api/campaign-signup.ts#L150) | 🟡 MEDIUM | **M1.8** |
| 3 | **`X-XSS-Protection`** deprecated header | `public/_headers:2` | 🟡 MEDIUM | **M1.1** |
| 4 | **`Feature-Policy`** deprecated | `public/_headers:7` | 🟡 MEDIUM | **M1.1** |
| 5 | **Empty `<link rel="micropub" href="">`** in every page head | [`Head.astro:262`](file:///C:/Users/alok9/.gemini/antigravity/worktrees/p-site-astro/complete_astro_v6_migration/src/components/Head.astro#L262) | 🟡 MEDIUM | **M2.1** |

### 🔴 Accepted Risk (Dependency CVEs — Fix in M5)

| Package | CVE | Action |
|---|---|---|
| Astro ≤7.2.7 | XSS, RCE, auth bypass | Upgrade to Astro 7 in **M5** |
| happy-dom ≤20.8.8 | VM context escape, RCE (test-only) | Upgrade to `^20.14.5` in **M5** |
| vitest / @vitest/mocker | Path traversal (test-only) | Upgrade to vitest v5 in **M5** |
| @playform/compress deps | deepmerge-ts, sharp, svgo | Upgrade compress plugin in **M5** |

### 🟢 Clean (Confirmed in Prior Audit)

- No hardcoded API keys or passwords in source (except N1 above)
- Cloudflare D1 database ID in `wrangler.toml` is safe to commit
- All 7 API routes use `getDatabase()` guard — no direct env DB access

---

## 3. IndieWeb & Comment Systems

| System | Status | Notes |
|---|---|---|
| Webmention link in `<head>` | ✅ Active | → `webmention.io` (external service) |
| Pingback link in `<head>` | ✅ Active | → `webmention.io/xmlrpc` |
| Micropub link | ⚠️ Broken empty tag | Fix in M2.1 |
| h-entry microformats | ⚠️ Partial | Basic markup done; complete in M6 |
| h-card markup | ⚠️ Partial | Some exists; complete in M6 |
| rel-me links | ❌ None | Add in M2.3–2.4 |
| Webmention display | ❌ None | Build in M2.5–2.6 |
| Comment system | ❌ None operational | Build in M6 |
| Giscus | 🗑️ Removed | Was tried, not practical |
| Staticman | ❌ Dead | Config to be removed in M4.2 |

---

## 4. Summary

| Category | Count | Milestone |
|---|---|---|
| 🔴 CRITICAL security (live) | 2 | M1 |
| 🔴 HIGH security (live) | 4 | M1 |
| 🟡 MEDIUM security | 5 | M1 + M2 |
| 🔴 Accepted CVEs (deps) | 4 packages | M5 |
| Dead code to remove | 4 confirmed items | M4 |
| Gatsby migration artifacts (keep) | 4 items | M7, M6 |
| Incomplete features | 12 | M2–M8 |
