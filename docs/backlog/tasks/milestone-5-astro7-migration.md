# Milestone 5 — Astro 7 Migration

**Branch**: `feat/astro7-migration`  
**Base from**: `complete_astro_v6_migration` (after M1 + M2 merged)  
**Priority**: 🟠 Major milestone — own branch, full regression testing  
**Estimated effort**: 1–2 weeks  
**Status**: ⏳ Waiting on M1, M2, and TASK-5A (human review of breaking changes)

> [!WARNING]
> This is a **breaking change migration**. Work is done on its own branch and never rebased onto feature branches mid-migration. All other milestones (M1-M4) must be merged to `complete_astro_v6_migration` first.

---

## Prerequisites

- [ ] M1 (security) merged and deployed — verified working on Cloudflare Pages
- [ ] M2 (IndieWeb quick wins) merged
- [ ] **TASK-5A** in `HUMAN_TASKS.md`: Human has reviewed Astro 7 breaking changes guide and created the branch

---

## Git Setup

```bash
# From the latest complete_astro_v6_migration
git checkout complete_astro_v6_migration
git pull
git checkout -b feat/astro7-migration
```

---

## Pre-Migration Research Checklist

Before writing any code, the agent will audit these breaking changes:

- [ ] Read https://docs.astro.build/en/guides/upgrade-to/v7/
- [ ] Check `@astrojs/cloudflare` v14 changelog for adapter API changes
- [ ] Check `vite-plugin-pwa` compatibility with Astro 7 + Vite 6
- [ ] Check `@astrojs/mdx` v4+ compat
- [ ] Note: Astro 7 makes hybrid rendering the default — `output: 'static'` behavior may change

---

## Sub-Tasks

### 5.1 — Upgrade core dependencies
**Commit**: `chore(astro7): bump astro and related packages to v7`  
**Files**: `package.json`

- [ ] `astro`: `^6.2.0` → `^7.3.2`
- [ ] `@astrojs/cloudflare`: `^13.2.0` → latest v14+
- [ ] `@astrojs/mdx`: latest compatible with Astro 7
- [ ] `@astrojs/rss`: latest compatible
- [ ] `@astrojs/sitemap`: latest compatible
- [ ] `@astrojs/check`: latest compatible

```bash
npm install astro@^7.3.2 @astrojs/cloudflare@latest @astrojs/mdx@latest @astrojs/rss@latest @astrojs/sitemap@latest @astrojs/check@latest
```

---

### 5.2 — Upgrade test dependencies
**Commit**: `chore(astro7): upgrade vitest v5 and happy-dom`  
**Files**: `package.json`

- [ ] `vitest`: `^3.x` → `^5.0.0`
- [ ] `@vitest/coverage-v8`: `^3.x` → `^5.0.0`
- [ ] `happy-dom`: current → `^20.14.5`
- [ ] `jsdom`: check v26+ compat

```bash
npm install -D vitest@^5.0.0 @vitest/coverage-v8@^5.0.0 happy-dom@^20.14.5
```

- [ ] Update `vitest.config.ts` for any v5 API changes (check release notes)
- [ ] Run `npm run test:unit` — fix any test failures

---

### 5.3 — Upgrade `@playform/compress` and fix build pipeline
**Commit**: `chore(astro7): upgrade @playform/compress to fix dependency vulns`  
**Files**: `package.json`, `astro.config.mjs`

- [ ] `@playform/compress`: `^0.0.13` → `^0.2.5`
- [ ] Check for API changes in `@playform/compress` v0.2.x — the integration API may have changed
- [ ] Verify `playformCompress()` still works in `astro.config.mjs` integrations array
- [ ] Run `npm run build` — verify compression still works

---

### 5.4 — Fix `output` mode for Astro 7 hybrid rendering
**Commit**: `fix(astro7): update output mode for Astro 7 hybrid rendering defaults`  
**Files**: `astro.config.mjs`

In Astro 7, hybrid rendering is the default. Review the current setup:

```js
// Current: output: "static" with per-route `export const prerender = false`
output: "static",
```

- [ ] Check if Astro 7 changes require explicit `output: 'hybrid'` or if `static` + per-route override still works
- [ ] Update `astro.config.mjs` based on Astro 7 docs
- [ ] Verify all 7 API routes (`src/pages/api/*.ts`) still have `export const prerender = false` and work correctly

---

### 5.5 — Fix VitePWA configuration for Astro 7 + Vite 6
**Commit**: `fix(astro7): migrate VitePWA config to Astro 7 compatible setup`  
**Files**: `astro.config.mjs`

Current setup puts `VitePWA()` in `vite.plugins` which may conflict with Astro 7's Vite 6 upgrade:

```js
vite: {
  plugins: [VitePWA({ ... })]  // ← potentially needs to move
}
```

- [ ] Check `vite-plugin-pwa` docs for Astro 7 / Vite 6 integration method
- [ ] If it needs to move to `integrations:`, update accordingly
- [ ] Verify PWA manifest and workbox config still work after migration
- [ ] Test: build → verify service worker is generated → verify PWA installability

---

### 5.6 — Fix content collection API changes (if any)
**Commit**: `fix(astro7): update content collection API for Astro 7`  
**Files**: `src/content.config.ts`, `src/lib/content-shims.ts`, all `src/pages/*/[...id].astro`

- [ ] Check if `defineCollection` API changed between Astro 6 and 7
- [ ] Check if `getCollection`, `getEntry` return types changed
- [ ] Check if `render()` function (used in `content-shims.ts` as `renderEntry`) changed
- [ ] Fix TypeScript errors in `src/lib/content-shims.ts` if any
- [ ] Run `npm run build` to catch type errors

---

### 5.7 — Fix image service configuration
**Commit**: `fix(astro7): update image service config for Astro 7 cloudflare adapter`  
**Files**: `astro.config.mjs`

Current: `imageService: 'passthrough'`

- [ ] Check if Cloudflare adapter v14+ still uses `imageService: 'passthrough'` or if there's a new value
- [ ] Verify `<AstroImage>` component still works in pages
- [ ] Test: build → verify images render correctly

---

### 5.8 — Fix remark plugin compatibility
**Commit**: `fix(astro7): verify remark plugins compatible with Astro 7`  
**Files**: `src/lib/remark-reading-time.mjs`, `src/lib/remark-modified-time.mjs`

- [ ] Verify `remarkReadingTime` and `remarkModifiedTime` still work with Astro 7's unified/remark version
- [ ] Check if `mdast-util-to-string` version is compatible
- [ ] Test: build an article page and verify `readingTime` and `lastModified` frontmatter are populated

---

### 5.9 — Full regression test run
**Commit**: `test(astro7): regression test results — all passing`  
**Files**: `docs/backlog/tasks/milestone-5-astro7-migration.md` (update results)

- [ ] `npm run build` — clean build ✅
- [ ] `npm run test:unit` — all unit tests pass ✅
- [ ] `npm run test:e2e` — all E2E tests pass ✅
- [ ] `npm run test:regression` — baseline diff within acceptable range ✅
- [ ] Manual check: home page, article, note, works, illustrations, services, 404
- [ ] Manual check: resource download flow
- [ ] Manual check: newsletter/lead form submission
- [ ] Manual check: campaign pages

---

### 5.10 — Update `docs/backlog/decisions/architecture-decisions.md`
**Commit**: `docs: update ADR log with Astro 7 migration outcomes`

- [ ] Record any decisions made during migration (API changes, workarounds)
- [ ] Update dependency table with actual versions used

---

## PR Checklist

Before merging `feat/astro7-migration` → `complete_astro_v6_migration` (or new main branch):

- [ ] Clean build with zero TypeScript errors
- [ ] All unit tests pass
- [ ] All E2E tests pass
- [ ] Regression baseline diff acceptable
- [ ] PWA still works (service worker generated, installable)
- [ ] All 7 API routes functional
- [ ] Cloudflare Pages preview deploy tested
- [ ] Security headers still correct (not overridden by adapter changes)
- [ ] All 5.x commits on branch `feat/astro7-migration`
