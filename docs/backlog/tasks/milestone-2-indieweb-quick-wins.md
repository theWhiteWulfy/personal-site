# Milestone 2 — IndieWeb Quick Wins

**Branch**: `feat/indieweb-quick-wins`  
**Base from**: `fix/security-phase-1` (after M1 merge) or `complete_astro_v6_migration`  
**Priority**: 🟠 After Milestone 1  
**Estimated effort**: 1 day  
**Status**: ⏳ Waiting on M1 completion

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

- [ ] Find line 262: `<link rel="micropub" href={site.micropubUrl} />`
- [ ] Wrap in conditional: `{site.micropubUrl && <link rel="micropub" href={site.micropubUrl} />}`
- [ ] Verify: `micropubUrl: ''` in `site.js` → no link tag in rendered HTML
- [ ] Verify: setting a real URL in `site.js` → link tag appears

---

### 2.2 — Fix misleading Clarity comment in `site.js`
**Commit**: `chore: clarify Clarity project ID comment (ID is correct and active)`  
**Files**: `src/config/site.js`

- [ ] Line 120: Change comment from `// Replace with actual Clarity project ID` to `// Active project ID — sw2f0ourfn`
- [ ] Remove Staticman API entry:
  - Remove `staticmanApi` key (lines 142-143) — confirmed dead (Heroku free tier shutdown)
  - Remove `@property {string} staticmanApi` from JSDoc (line 49)

---

### 2.3 — Add `rel="me"` links to site head
**Commit**: `feat(indieweb): add rel=me discovery links to head`  
**Files**: `src/components/Head.astro`

- [ ] After the existing IndieWeb block (after line 262), add:
  ```astro
  <!-- IndieWeb rel=me verification links -->
  <link rel="me" href={site.githubUrl} />
  <link rel="me" href={site.linkedinUrl} />
  <link rel="me" href={site.twitterUrl} />
  <link rel="me" href={site.instagramUrl} />
  ```
- [ ] Verify: rendered `<head>` contains 4 `rel="me"` link tags with correct URLs

---

### 2.4 — Add `rel="me"` to social links in footer
**Commit**: `feat(indieweb): add rel=me attributes to footer social links`  
**Files**: `src/components/Footer.astro`

- [ ] Find each social anchor tag in Footer.astro
- [ ] Add `rel="me noopener noreferrer"` to GitHub, LinkedIn, Twitter, Instagram links
- [ ] Keep `noopener noreferrer` for security on external links

---

### 2.5 — Build `WebmentionDisplay.astro` component
**Commit**: `feat(indieweb): add webmention display component`  
**Files**: `src/components/WebmentionDisplay.astro` (new)

- [ ] Create component with props: `{ pageUrl: string }`
- [ ] Fetch from webmention.io JF2 API at build time:
  ```ts
  const res = await fetch(
    `https://webmention.io/api/mentions.jf2?target=${pageUrl}&per-page=50`
  );
  const data = await res.json();
  ```
- [ ] Group mentions by type: likes (`like-of`), reposts (`repost-of`), replies (`in-reply-to`), mentions
- [ ] Render each group with count and avatar list
- [ ] Add `h-cite` microformats to each mention
- [ ] Graceful fallback: if fetch fails or returns 0 results, render nothing (no error state shown)
- [ ] Add basic CSS for mention display (inline in component or via CSS file)

---

### 2.6 — Integrate WebmentionDisplay into article layout
**Commit**: `feat(indieweb): show webmentions on articles and notes`  
**Files**: 
- `src/pages/articles/[...id].astro`
- `src/pages/notes/[...id].astro`

- [ ] Import `WebmentionDisplay`
- [ ] Add below post content, above any future comment section:
  ```astro
  <WebmentionDisplay pageUrl={`${site.url}${Astro.url.pathname}`} />
  ```
- [ ] Verify: article pages fetch and display webmentions at build time
- [ ] Verify: if no webmentions, section is invisible (not empty box)

---

## PR Checklist

Before merging to `complete_astro_v6_migration`:

- [ ] Build passes: `npm run build`
- [ ] No `<link rel="micropub" href="">` in rendered HTML
- [ ] `rel="me"` links appear in `<head>` on all pages
- [ ] Footer social links have `rel="me noopener noreferrer"`
- [ ] WebmentionDisplay renders (or renders nothing gracefully) on article pages
- [ ] Clarity comment updated, Staticman config removed
- [ ] All 2.x commits on branch `feat/indieweb-quick-wins`
- [ ] PR opened: `feat/indieweb-quick-wins` → `complete_astro_v6_migration`
