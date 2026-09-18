# Gatsby v3 Migration Backlog

**Purpose**: Tracks features that were working in the Gatsby v3 site and are preserved as commented-out code (migration references) in the current Astro site.

> [!IMPORTANT]
> Do NOT delete these code sections. They are intentionally preserved as implementation references.

---

## Preserved Features

### Feature: "Did You Mean?" on 404 Page

**Location**: [`src/pages/404.astro:6-38`](../../../src/pages/404.astro#L6)

**History**:
- Was working in Gatsby v3 using `string-similarity` npm package + GraphQL page list
- Attempted migration to Astro v4 — failed (JSX/GraphQL patterns incompatible)
- Code commented out and preserved as reference

**Astro Migration Plan**: Milestone 7 — re-implement natively without `string-similarity`:
- Use `getCollection()` to build a static slug index at build time
- Implement lightweight Jaro-Winkler fuzzy matching inline (~30 lines)
- Inject slug index into client script via `define:vars`
- See: [`docs/backlog/tasks/milestone-7-404-did-you-mean.md`](../tasks/milestone-7-404-did-you-mean.md)

---

### Feature: Comment System

**History**:
- Gatsby v3: Used Staticman API (now dead — Heroku free tier shutdown)
- Astro v4: Giscus tried as replacement — not practical for the use case
- Current: `comments` and `comments_locked` frontmatter fields defined and set in 20+ content files, but no UI renders them

**Code locations**:
- `comments: true` / `comments_locked: false` frontmatter in articles, notes, works, bibliophile, saasguide
- Schema definitions: `src/content/config.ts` (comment fields in each collection schema)

**Astro Migration Plan**: Milestone 6 — custom D1-backed comment system
- See: [`docs/backlog/tasks/milestone-6-comment-system.md`](../tasks/milestone-6-comment-system.md)

---

### Feature: Lodash Slugify

**Location**: [`src/lib/slugify.mjs:1-5`](../../../src/lib/slugify.mjs#L1-L5)

**History**: Gatsby v3 used lodash for deburring Unicode characters in slugs. Current implementation is a simple regex-based slug without deburring.

**Current impact**: Content with Unicode characters (accents, etc.) in titles may generate different slugs than in Gatsby. Monitor for broken links if non-ASCII titles exist.

**Migration plan**: Low priority. If Unicode slug issues are discovered, implement `deburr` inline (it's a small function) rather than importing all of lodash.

---

### Feature: Lightbox Theming API

**Location**: [`src/pages/illustrations/[...id].astro:134,155`](../../../src/pages/illustrations)

```js
/* TODO: map color to API */
/* TODO: map speed to API */
```

**History**: Gatsby v3 had a theming API that the lightbox overlay read from. Not implemented in Astro.

**Migration plan**: Medium priority. Wire overlay color to CSS custom property (site theme color) and speed to a site config value.

---

### Feature: Captcha Utilities

**Location**: [`src/lib/api/security.ts`](../../../src/lib/api/security.ts) — `generateCaptcha()` and `verifyCaptcha()`

**History**: Scaffolded for comment form anti-spam. Never wired to a captcha provider.

**Current state**: Functions are exported but never called. Intentionally preserved.

**Migration plan**: Milestone 6 — wire to chosen captcha provider (see HUMAN_TASKS.md TASK-6A).

---

### Feature: Database Cleanup Maintenance

**Location**: [`src/lib/api/database.ts`](../../../src/lib/api/database.ts) — `cleanupOldRecords()`

**History**: Scaffolded for periodic database maintenance (pruning old analytics events, etc.).

**Current state**: Exported but never called. No Cloudflare Cron Trigger set up.

**Migration plan**: Milestone 6 or later — invoke via Cloudflare Cron Trigger.

---

### Feature: Services Page Images

**Location**: [`src/pages/services/*.astro`](../../../src/pages/services/) — hero and item `image` fields referencing `/blog-placeholder-N.jpg`

**History**: Gatsby v3 used the same placeholder assets; real service imagery was never produced.

**Current state**: Service pages render with generic blog placeholders.

**Migration plan**: Content task — produce and wire real service images (no code change).

---

### Feature: Campaign Hero Visual

**Location**: [`src/components/CampaignHero.astro:147`](../../../src/components/CampaignHero.astro) — `.visual-placeholder` div

**History**: Placeholder stand-in for a hero illustration on campaign landing pages.

**Current state**: Styled placeholder div rendered in place of artwork.

**Migration plan**: Content task — supply hero illustration (no code change).
