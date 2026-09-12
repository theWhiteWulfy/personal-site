# Architecture Decisions — Meteoric Teachings

**Recorded**: 2026-09-13 | **Method**: Grilling session (agent-led interview)

---

## Decision Log

### ADR-001: Security-First Sequencing
**Date**: 2026-09-13  
**Status**: Accepted

**Decision**: Fix security issues before adding any new features.

**Rationale**: 3 critical/high live production security issues were found during audit (hardcoded secret key, unauthenticated admin PII endpoint, unauthenticated campaign CRUD). These take priority over all feature work.

**Sequence**: Security headers → hardcoded secret + HMAC → admin auth → console log cleanup.

---

### ADR-002: Dead Code is Gatsby v3 Migration Reference — Do Not Delete
**Date**: 2026-09-13  
**Status**: Accepted

**Decision**: Commented-out code (StringSimilarity, lodash slugify, etc.) represents working features from the Gatsby v3 site that haven't been migrated to Astro. These are **preserved as migration targets**, not removed.

**Exception**: `analytics-testing.ts` (entire file) is a direct duplicate of inline code in `Head.astro` — this can be safely removed since it's not a Gatsby migration artifact.

**Exception**: `staticmanApi` config — Staticman is confirmed dead (Heroku free tier shutdown). Remove the config key from `site.js`.

---

### ADR-003: Comment System Backend — Cloudflare D1
**Date**: 2026-09-13  
**Status**: Accepted

**Decision**: Use Cloudflare D1 (already integrated) as the comment system backend. Not PocketBase.

**Rationale**: 
- D1 is already wired in with 5 existing tables and a migration system
- Zero new infrastructure required
- Works natively at the Cloudflare edge
- PocketBase would require a separate VPS, API layer, and network hop

**Implementation**: Post-Astro 7 migration. Uses `prerender = false` per-route for comment API endpoints.

---

### ADR-004: Comment Rendering Strategy — ISR / On-Demand
**Date**: 2026-09-13  
**Status**: Accepted

**Decision**: Comments will be rendered on-demand (server-side, not statically). Content pages remain static; comment sections use `prerender = false` API endpoints.

**Rationale**: Incremental static builds + ISR aligns with Astro's hybrid output model. Static pages load fast; comment data is live without a full rebuild.

---

### ADR-005: Search — LLM-Based, Deferred
**Date**: 2026-09-13  
**Status**: Deferred

**Decision**: No Pagefind (static index). Use semantic/LLM-based search. Implementation deferred pending research.

**Research needed**: Cloudflare Workers AI vs OpenAI/Gemini embeddings + Cloudflare Vectorize. Review pricing and quota before deciding.

**Fallback**: If LLM search is too complex/costly, consider Fuse.js client-side fuzzy search as an interim solution.

---

### ADR-006: Micropub Endpoint — Not Planned
**Date**: 2026-09-13  
**Status**: Rejected (for now)

**Decision**: Micropub endpoint will NOT be built. Publishing happens via git/file system workflow.

**Action**: Gate the `<link rel="micropub">` tag in `Head.astro` to only render when `site.micropubUrl` is non-empty (currently empty). This prevents the broken empty `href=""` from rendering.

---

### ADR-007: POSSE + Backfeed — Long-Term Vision (Post-Astro7, Post-Comments)
**Date**: 2026-09-13  
**Status**: Accepted (deferred)

**Decision**: POSSE cross-posting and backfeed aggregation are core to the IndieWeb vision and will be built. Priority order:

1. dev.to cross-posting (articles, highest priority)
2. Mastodon/Fediverse (notes/short-form)
3. X/Twitter and Threads (optional, lower priority)
4. Backfeed: pull social replies back as comments on original content

**Dependencies**: Requires Astro 7 migration + comment system first.

---

### ADR-008: Astro 7 Migration — Separate Branch, After Security
**Date**: 2026-09-13  
**Status**: Accepted

**Decision**: Astro 7 is a breaking change and must be done on a dedicated git branch (`feat/astro7-migration`) after security fixes are merged.

**Key areas to audit**:
- Content collection API changes
- View Transitions API
- Image service (`imageService: 'passthrough'`)  
- `@astrojs/cloudflare` adapter v13 → v14+ compat
- `vite-plugin-pwa` config migration (VitePWA placement in `vite.plugins` vs integrations needs review)
- `remark` plugin compatibility

**Also in this phase**: vitest v5, happy-dom ^20.14.5, @playform/compress ^0.2.5

---

### ADR-009: Resource File Storage — Pending Decision
**Date**: 2026-09-13  
**Status**: Pending human decision (see HUMAN_TASKS.md TASK-3A)

**Options evaluated**:
- Cloudflare R2 (recommended — secure, zero egress within CF, native binding)
- `public/resources/` (simple, but bypasses token auth)
- External URL (flexible, adds latency/dependency)

**Action required**: Human to decide and record in `HUMAN_TASKS.md`.

---

### ADR-010: Admin Auth Strategy — Static API Key (Phase 1)
**Date**: 2026-09-13  
**Status**: Accepted

**Decision**: Protect admin endpoints (`GET /api/resource-download`, campaign CRUD) with a static `ADMIN_API_KEY` env variable checked as a Bearer token. Not a full auth system.

**Rationale**: Simple, secure enough for a personal site admin, no OAuth complexity, fits Cloudflare Workers pattern.

**Future**: Can be upgraded to proper IndieAuth-based admin access if needed.

---

### ADR-011: IndieWeb Webmentions — Display First (webmention.io)
**Date**: 2026-09-13  
**Status**: Accepted

**Decision**: Use webmention.io (already configured as receiving endpoint) for webmention display. Build a `WebmentionDisplay.astro` component that fetches from the webmention.io public API at build time. No new backend required.

**Future**: Once the full IndieWeb stack (comment system + POSSE + backfeed) is built, webmention display will be merged with the comment feed.

---

### ADR-012: Clarity Project ID is Correct
**Date**: 2026-09-13  
**Status**: Accepted

**Decision**: The Microsoft Clarity project ID `sw2f0ourfn` in `site.js:120` is the correct, active ID. The comment "Replace with actual Clarity project ID" is misleading — update the comment to remove this confusion.

---

### ADR-013: Experimental JS Files in `public/web/` are Intentional
**Date**: 2026-09-13  
**Status**: Accepted

**Decision**: Files in `public/web/experiment/js/` are intentional browser experiments. They are excluded from the build bundle via `astro.config.mjs:30-34`. This is correct behavior — do not modify.

---

### ADR-014: Phase Numbering — 404 Feature is Phase 7, Future Vision is Phase 8
**Date**: 2026-09-13  
**Status**: Accepted

**Decision**: The 404 "Did You Mean?" feature is elevated to **Phase 7** (its own milestone). The POSSE/backfeed, semantic search, and other long-term features are **Phase 8**.
