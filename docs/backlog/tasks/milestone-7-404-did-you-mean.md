# Milestone 7 — 404 "Did You Mean?" Feature

**Branch**: `feat/404-did-you-mean`  
**Base from**: `complete_astro_v6_migration`  
**Priority**: 🟢 Independent — can be done any time after M4  
**Estimated effort**: 1 day  
**Status**: ✅ Ready to start (no human tasks required)

---

## Context

The feature was working in the Gatsby v3 site using `StringSimilarity`. The commented-out code in `src/pages/404.astro` is the **Gatsby v3 implementation** — it used JSX/GraphQL patterns that don't work in Astro.

This milestone re-implements the feature natively in Astro without the old code pattern.

---

## Git Setup

```bash
git checkout complete_astro_v6_migration
git pull
git checkout -b feat/404-did-you-mean
```

---

## Sub-Tasks

### 7.1 — Build a static slug index at build time
**Commit**: `feat(404): generate static slug index for did-you-mean suggestions`  
**Files**: `src/lib/slug-index.ts` (new)

The 404 page is static — it can't call a server. We need to embed a static JSON index of all valid slugs into the 404 page at build time.

- [ ] Create `src/lib/slug-index.ts` that collects all routes:
  ```ts
  import { getCollection } from 'astro:content';
  
  export async function buildSlugIndex(): Promise<string[]> {
    const [articles, notes, works, illustrations, bibliophile, saasguide, faqs] = await Promise.all([
      getCollection('articles'),
      getCollection('notes'),
      getCollection('works'),
      getCollection('illustrations'),
      getCollection('bibliophilediaries'),
      getCollection('saasguide'),
      getCollection('faqs'),
    ]);
    
    return [
      ...articles.map(e => `/articles/${e.id}/`),
      ...notes.map(e => `/notes/${e.id}/`),
      ...works.map(e => `/works/${e.id}/`),
      ...illustrations.map(e => `/illustrations/${e.id}/`),
      ...bibliophile.map(e => `/bibliophilediaries/${e.id}/`),
      ...saasguide.map(e => `/saasguide/${e.id}/`),
      ...faqs.map(e => `/faqs/${e.id}/`),
      // Static pages
      '/', '/about/', '/services/', '/contact/', '/articles/', '/notes/',
      '/works/', '/illustrations/', '/bibliophilediaries/', '/saasguide/', '/faqs/',
      '/support/', '/sitemap/', '/terms/',
    ];
  }
  ```

---

### 7.2 — Implement fuzzy matching without `string-similarity` package
**Commit**: `feat(404): implement client-side Levenshtein/Jaro-Winkler fuzzy matching`  
**Files**: `src/lib/fuzzy-match.ts` (new)

Instead of reintroducing the `string-similarity` npm package, implement a lightweight fuzzy matcher inline:

- [ ] Create `src/lib/fuzzy-match.ts` with a `findSimilar(input: string, candidates: string[], maxResults: number): string[]` function
- [ ] Use Jaro-Winkler distance or a simple character-overlap score — no npm dependency needed
- [ ] Score threshold: only suggest if similarity > 0.5
- [ ] Return top 3 matches sorted by similarity score
- [ ] Keep the file under ~50 lines — this should be simple

**Alternative**: If there's already a good utility in the project, use it. Otherwise, this ~30-line implementation is sufficient:
```ts
function jaroWinkler(s1: string, s2: string): number {
  // standard Jaro-Winkler implementation
  // (~20 lines of well-known algorithm)
}

export function findSimilar(input: string, candidates: string[], max = 3): string[] {
  return candidates
    .map(c => ({ path: c, score: jaroWinkler(input, c) }))
    .filter(x => x.score > 0.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map(x => x.path);
}
```

---

### 7.3 — Update `404.astro` to use the new implementation
**Commit**: `feat(404): implement did-you-mean using slug index and fuzzy matching`  
**Files**: `src/pages/404.astro`

- [ ] Remove the large commented-out Gatsby code block (lines 6-38) — it is superseded by this implementation
- [ ] In the Astro frontmatter, build the slug index and embed it:
  ```ts
  import { buildSlugIndex } from '@lib/slug-index';
  const slugIndex = await buildSlugIndex();
  const slugIndexJSON = JSON.stringify(slugIndex);
  ```
- [ ] Add a `<script>` block to do client-side matching on `window.location.pathname`:
  ```js
  // Slug index is embedded at build time
  const slugs = __SLUG_INDEX__;
  const currentPath = window.location.pathname;
  const suggestions = findSimilar(currentPath, slugs, 3);
  // Render suggestions into a container div
  ```
- [ ] Use `define:vars={{ slugIndex }}` to pass build-time data to the client script
- [ ] Add a `<div id="suggestions">` to the 404 page markup
- [ ] Populate suggestions dynamically on load
- [ ] Style suggestions to match the site's design

---

### 7.4 — Handle the 404 page correctly on Cloudflare Pages
**Commit**: `fix(404): verify 404.astro works as CF Pages custom 404`

- [ ] Verify `public/_redirects` or Cloudflare Pages handles 404 → `/404`
- [ ] Test: navigate to `/nonexistent-page-blah` and see:
  - The 404 message
  - Suggestions (if similar slugs exist)
  - No suggestions (if nothing is close)

---

## PR Checklist

Before merging to `complete_astro_v6_migration`:

- [ ] Build passes
- [ ] Visiting an invalid URL shows the 404 page
- [ ] Visiting `/articles/` (but misspelled as `/articels/`) shows a suggestion
- [ ] Visiting `/qwerty-garbage-path/` shows NO suggestions (too dissimilar)
- [ ] No `string-similarity` package added to `package.json`
- [ ] Gatsby code block removed from `404.astro`
- [ ] All 7.x commits on branch `feat/404-did-you-mean`
- [ ] PR opened: `feat/404-did-you-mean` → `complete_astro_v6_migration`
