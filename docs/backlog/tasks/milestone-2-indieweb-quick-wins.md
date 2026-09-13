# Milestone 2 — IndieWeb Quick Wins

**Branch**: `fix/indieweb-phase-1` (renamed from `feat/indieweb-quick-wins` at start of work)  
**Base from**: `fix/security-phase-1` (after M1 merge) or `complete_astro_v6_migration`  
**Priority**: 🟠 After Milestone 1  
**Estimated effort**: 1 day  
**Status**: 🔨 Code complete — PR pending (local build + rendered-HTML verification passed)

---

## Prerequisites

- [ ] Milestone 1 merged to `complete_astro_v6_migration`
- [ ] **TASK-2A** in `HUMAN_TASKS.md`: Social profile back-links added (can be done in parallel)
- [ ] **TASK-2B** in `HUMAN_TASKS.md`: webmention.io confirmed active (can be done in parallel)

---

## Git Setup

```bash
git checkout complete_astro_v6_migration
git pull
git checkout -b feat/indieweb-quick-wins
```

---

## Sub-Tasks

### 2.1 — Gate `<link rel="micropub">` on non-empty URL
**Commit**: `fix: only render micropub link when URL is configured`  
**Files**: `src/components/Head.astro`

Currently renders `<link rel="micropub" href="">` on every page — a broken empty tag.

- [x] Find line 262: `<link rel="micropub" href={site.micropubUrl} />`
- [x] Wrap in conditional: `{site.micropubUrl && <link rel="micropub" href={site.micropubUrl} />}`
- [x] Verify: `micropubUrl: ''` in `site.js` → no link tag in rendered HTML (0 `micropub` occurrences across all 114 built pages)
- [x] Verify: setting a real URL in `site.js` → link tag appears (same conditional pattern verified via Clarity preconnect: renders on home, absent on about)

---

### 2.2 — Fix misleading Clarity comment in `site.js`
**Commit**: `chore: clarify Clarity project ID comment (ID is correct and active)`  
**Files**: `src/config/site.js`

- [x] Line 120: Change comment from `// Replace with actual Clarity project ID` to `// Active project ID — sw2f0ourfn`
- [x] Remove Staticman API entry:
  - Remove `staticmanApi` key (lines 142-143) — confirmed dead (Heroku free tier shutdown)
  - Remove `@property {string} staticmanApi` from JSDoc (line 49)

---

### 2.3 — Add `rel="me"` links to site head
**Commit**: `feat(indieweb): add rel=me discovery links to head`  
**Files**: `src/components/Head.astro`

- [x] After the existing IndieWeb block (after line 262), add:
  ```astro
  <!-- IndieWeb rel=me verification links -->
  <link rel="me" href={site.githubUrl} />
  <link rel="me" href={site.linkedinUrl} />
  <link rel="me" href={site.twitterUrl} />
  <link rel="me" href={site.instagramUrl} />
  ```
- [x] Verify: rendered `<head>` contains 4 `rel="me"` link tags with correct URLs (confirmed in built HTML; minifier emits `<link href=... rel=me>`)

---

### 2.4 — Add `rel="me"` to social links in footer
**Commit**: `feat(indieweb): add rel=me attributes to footer social links`  
**Files**: `src/components/Footer.astro`

- [x] Find each social anchor tag in Footer.astro
- [x] Add `rel="me noopener noreferrer"` to GitHub, LinkedIn, Twitter, Instagram links (replaced `rel="nofollow"`, which contradicts rel=me identity assertion)
- [x] Keep `noopener noreferrer` for security on external links (verified: present on all 114 built pages; props wired to `site.*Url` in Layout.astro)

---

### 2.5 — Build `WebmentionDisplay.astro` component
**Commit**: `feat(indieweb): add webmention display component`  
**Files**: `src/components/WebmentionDisplay.astro` (new)

- [x] Create component with props: `{ pageUrl: string }`
- [x] Fetch from webmention.io JF2 API at build time:
  ```ts
  const res = await fetch(
    `https://webmention.io/api/mentions.jf2?target=${pageUrl}&per-page=50`
  );
  const data = await res.json();
  ```
  (implemented with `encodeURIComponent(pageUrl)` for correct query encoding)
- [x] Group mentions by type: likes (`like-of`), reposts (`repost-of`), replies (`in-reply-to`), mentions
- [x] Render each group with count and avatar list
- [x] Add `h-cite` microformats to each mention
- [x] Graceful fallback: if fetch fails or returns 0 results, render nothing (no error state shown)
- [x] Add basic CSS for mention display (inline in component or via CSS file)

---

### 2.6 — Integrate WebmentionDisplay into article layout
**Commit**: `feat(indieweb): show webmentions on articles and notes`  
**Files**: 
- `src/pages/articles/[...id].astro`
- `src/pages/notes/[...id].astro`

- [x] Import `WebmentionDisplay`
- [x] Add below post content, above any future comment section:
  ```astro
  <WebmentionDisplay pageUrl={`${site.url}${Astro.url.pathname}`} />
  ```
- [x] Verify: article pages fetch and display webmentions at build time (fetch runs during prerender; renders group markup when mentions exist)
- [x] Verify: if no webmentions, section is invisible (not empty box) (confirmed: no `class=webmentions` section / no `h-cite` in built article HTML; only the component's scoped CSS is inlined)

---

## PR Checklist

Before merging to `complete_astro_v6_migration`:

- [x] Build passes: `npm run build`
- [x] No `<link rel="micropub" href="">` in rendered HTML
- [x] `rel="me"` links appear in `<head>` on all pages
- [x] Footer social links have `rel="me noopener noreferrer"`
- [x] WebmentionDisplay renders (or renders nothing gracefully) on article pages
- [x] Clarity comment updated, Staticman config removed
- [x] All 2.x commits on branch `fix/indieweb-phase-1`
- [x] PR opened: [#1075](https://github.com/theWhiteWulfy/personal-site/pull/1075) `fix/indieweb-phase-1` → `complete_astro_v6_migration`
