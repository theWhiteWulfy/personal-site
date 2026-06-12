# Content Collection Usage Review

**Status**: Architecture-only document. Produced by Claude (Architect) as a companion to [`docs/astro_6_2_upgrade_plan.md`](./astro_6_2_upgrade_plan.md).  
**Purpose**: Full audit of every touchpoint that depends on the legacy collection API — the complete target list Codex uses during Phase 4 of the upgrade.

---

## 1. Collection Definition (`src/content/config.ts`)

The central collection definition file. All migration changes in Phase 5 happen here and here only.

**Current shape (legacy API)**:
```ts
import { defineCollection, z } from "astro:content";  // z must move to "astro/zod" in Phase 2
```

**Eight collections**:
| Collection | Type | Phase 2 compat | Phase 5 loader | Phase 5 schema delta |
|---|---|---|---|---|
| `articles` | `content` | Add `legacy.collectionsBackwardsCompat: true` | `glob({ pattern: "**/*.{md,mdx}", base: "./src/content/articles" })` | None |
| `notes` | `content` | Same | `glob(...notes)` | None |
| `works` | `content` | Same | `glob(...works)` | None; keep `output: z.boolean().optional()` |
| `illustrations` | `content` | Same | `glob(...illustrations)` | None |
| `bibliophilediaries` | `content` | Same | `glob(...bibliophilediaries)` | None |
| `saasguide` | `content` | Same | `glob(...saasguide)` | None |
| `faqs` | `content` | Same | `glob(...faqs)` | None; keep `order: z.number()`, `excerpt` optional |
| `albums` | `data` | Same | `glob({ pattern: "**/*.yaml", base: "./src/content/albums" })` | `cover: image()` still valid via `schema: ({ image }) => z.object({...})` callback |

**Phase 2 config change** (non-breaking, Codex makes in `astro.config.mjs`):
```js
export default defineConfig({
  // ...
  legacy: {
    collectionsBackwardsCompat: true,  // keeps entry.slug / entry.render() working
  },
  // ...
});
```

---

## 2. Detail Pages (Dynamic Routes)

These 7 files each call `getCollection()`, `getStaticPaths()`, and access `entry.slug` + `entry.render()`.

**Canonical usage pattern** (applies to all 7):

```ts
// BEFORE (legacy - Phase 4 replaces these)
export async function getStaticPaths() {
  const posts = await getCollection("articles");
  return posts
    .filter((post) => !post.data.draft)
    .map((post) => ({
      params: { slug: post.slug },   // ← replace with post.id in Phase 4
      props: { post },
    }));
}
const { post } = Astro.props;
const { Content, headings, remarkPluginFrontmatter } = await post.render();  // ← Phase 4

// AFTER (Content Layer - Phase 4)
export async function getStaticPaths() {
  const posts = await getCollection("articles");
  return posts
    .filter((post) => !post.data.draft)
    .map((post) => ({
      params: { slug: post.id },   // ← changed
      props: { post },
    }));
}
const { post } = Astro.props;
import { render } from "astro:content";
const { Content, headings, remarkPluginFrontmatter } = await render(post);  // ← changed
```

**Files**:
| File | Collection | Notes |
|---|---|---|
| `src/pages/articles/[...slug].astro` | `articles` | Standard pattern |
| `src/pages/notes/[...slug].astro` | `notes` | Standard pattern |
| `src/pages/works/[...slug].astro` | `works` | Uses `output` field too |
| `src/pages/illustrations/[...slug].astro` | `illustrations` | Standard pattern |
| `src/pages/bibliophilediaries/[...slug].astro` | `bibliophilediaries` | Standard pattern |
| `src/pages/saasguide/[...slug].astro` | `saasguide` | Standard pattern |
| `src/pages/faqs/[...slug].astro` | `faqs` | Uses `order` field; may sort differently |

---

## 3. Index / List Pages

These 7 files call `getCollection()` but do **not** use `entry.slug` directly for URL generation. They access `entry.data.*` fields (date, title, excerpt, image, tags) and `entry.id` (after Phase 4) or `entry.slug` (before) for links to detail pages.

| File | Collection | Link pattern to update in Phase 4 |
|---|---|---|
| `src/pages/articles/index.astro` | `articles` | `/${entry.collection}/${entry.slug}/` → `/${entry.collection}/${entry.id}/` |
| `src/pages/notes/index.astro` | `notes` | Same |
| `src/pages/works/index.astro` | `works` | Same |
| `src/pages/illustrations/index.astro` | `illustrations` | Same |
| `src/pages/bibliophilediaries/index.astro` | `bibliophilediaries` | Same |
| `src/pages/saasguide/index.astro` | `saasguide` | Same |
| `src/pages/faqs/index.astro` | `faqs` | Faqs may be rendered inline on the page, not linked individually — verify |

**Data field access** (stable across migration): `entry.data.title`, `entry.data.date`, `entry.data.excerpt`, `entry.data.image`, `entry.data.tags`, `entry.data.draft`, `entry.data.featured`. These are schema-defined and unaffected by the API change.

---

## 4. Taxonomy and Tag Pages

**Files**:
- `src/pages/tag/[...slug].astro`
- `src/pages/tag/index.astro`

**Usage pattern**:
```ts
// getStaticPaths aggregates tags across multiple collections
const allEntries = [
  ...(await getCollection("articles")),
  ...(await getCollection("notes")),
  ...(await getCollection("works")),
  // etc.
];
const uniqueTags = [...new Set(allEntries.flatMap((e) => e.data.tags ?? []))];
// paths: { slug: slugify(tag) }
```

**Risk**: the tag page links to individual entries by collection and slug. After Phase 4, any link template using `entry.slug` must use `entry.id`. The `slugify()` utility from `src/lib/slugify.mjs` operates on tag strings, not on entry identifiers, so it is unaffected.

**Also uses**: `src/config/taxonomy.yml` via a direct import (not through `getCollection()`). This is unaffected by the Content Layer migration.

---

## 5. RSS Feed (`src/pages/rss.xml.js`)

**Current usage**:
```js
link: `/${item.collection}/${item.slug}/`
```

**Phase 4 replacement**:
```js
link: `/${item.collection}/${item.id}/`
```

**Other stable fields**: `item.data.title`, `item.data.excerpt` (as description), `item.data.date` (as pubDate via dayjs).

**Collections included** (stable, no change): `articles`, `works`, `notes`, `bibliophilediaries`, `saasguide`.  
**Collections excluded** (stable, intentional): `faqs`, `illustrations`.

**Trailing-slash note**: the link template already has a trailing slash (`/${item.id}/`), which is correct for content routes. The 6-K rule (file-extension endpoints) does not apply to these pretty URLs.

---

## 6. Gallery Pages (`albums` data collection)

**Current usage**: `getCollection("albums")` returns YAML-backed entries. Each entry's `data.cover` is an Astro image object resolved at build time via the `image()` schema helper.

**Phase 5 migration for `albums`**:
```ts
// Before (legacy data collection)
const albums = defineCollection({
  type: "data",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      cover: image(),
    }),
});

// After (Content Layer, Phase 5)
import { glob } from "astro/loaders";
const albums = defineCollection({
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/albums" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      cover: image(),
    }),
});
```

**Risk**: image resolution via the `image()` helper in YAML data files must be tested end-to-end after Phase 5. The gallery pages key on the YAML filename stem (e.g. `cards`, `logos`) — `entry.id` matches this, so no slug/id drift expected.

**Gallery content** (`src/content/albums/`): `cards`, `logos`, `posterscollege`, `postersschool`, `sketches`, `wallpapers`.

---

## 7. Campaign and Offer Pages

The campaign system uses D1 database–backed data (not Astro collections) for dynamic content. The only collection involvement is indirect through layout and `Head.astro` metadata.

**Files**:
- `src/pages/offers/[...slug].astro` — fetches campaign from D1 via `src/pages/api/campaigns.ts`; does not use `getCollection()`. Unaffected by the Content Layer migration.
- `src/pages/offers/expired.astro` — static page; no collection usage.

Both files do use `astro:after-swap` event listeners for analytics/UTM tracking — this is the `<ClientRouter />` risk (R3), not a collection risk.

---

## 8. Complete Touchpoint Summary

| Touchpoint | `entry.slug` used | `entry.render()` used | `item.slug` in link | Phase to fix |
|---|---|---|---|---|
| `articles/[...slug].astro` | ✅ | ✅ | ✅ (params) | 4 |
| `notes/[...slug].astro` | ✅ | ✅ | ✅ | 4 |
| `works/[...slug].astro` | ✅ | ✅ | ✅ | 4 |
| `illustrations/[...slug].astro` | ✅ | ✅ | ✅ | 4 |
| `bibliophilediaries/[...slug].astro` | ✅ | ✅ | ✅ | 4 |
| `saasguide/[...slug].astro` | ✅ | ✅ | ✅ | 4 |
| `faqs/[...slug].astro` | ✅ | ✅ | ✅ | 4 |
| `tag/[...slug].astro` | possibly | ❌ | ✅ (entry links) | 4 |
| `tag/index.astro` | possibly | ❌ | ✅ (entry links) | 4 |
| `articles/index.astro` | ❌ | ❌ | ✅ (card links) | 4 |
| `notes/index.astro` | ❌ | ❌ | ✅ | 4 |
| `works/index.astro` | ❌ | ❌ | ✅ | 4 |
| `illustrations/index.astro` | ❌ | ❌ | ✅ | 4 |
| `bibliophilediaries/index.astro` | ❌ | ❌ | ✅ | 4 |
| `saasguide/index.astro` | ❌ | ❌ | ✅ | 4 |
| `faqs/index.astro` | ❌ | ❌ | verify | 4 |
| `rss.xml.js` | ❌ | ❌ | ✅ (`item.slug`) | 4 |
| `src/content/config.ts` | N/A | N/A | N/A | 2 (z import), 5 (loaders) |
| `astro.config.mjs` | N/A | N/A | N/A | 2 (compat flag), 5 (remove flag) |

**Total files requiring Phase 4 edits**: 17 (detail pages: 7, index pages: 7, tag pages: 2, RSS: 1).  
**Total files requiring Phase 5 edits**: 2 (`src/content/config.ts`, `astro.config.mjs`).
