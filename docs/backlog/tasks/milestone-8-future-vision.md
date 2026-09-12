# Milestone 8 — Future Vision

**Branch**: multiple branches (per sub-feature)  
**Base from**: `complete_astro_v6_migration` (post-M5 and M6)  
**Priority**: 🔵 Long-term — no hard deadline  
**Status**: Planning only — no implementation started

---

> [!NOTE]
> This milestone is a planning document. Sub-milestones will each get their own branch and detailed task file when prioritized. For now this captures the vision and known dependencies.

---

## 8A — POSSE: Publish Own Site, Syndicate Elsewhere

**Depends on**: M5 (Astro 7) + M6 (Comment System)  
**Estimated effort**: 3–4 weeks across all platforms  
**Branch**: `feat/posse-syndication`

### Platform Priority Order (from grilling session)
1. **dev.to** — articles cross-posting (highest priority)
2. **Mastodon/Fediverse** — notes/short-form content
3. **X/Twitter** — optional, lower priority
4. **Threads** — optional, lower priority

### High-Level Implementation Plan

**Database**: New D1 table `syndication` — tracks where each post was syndicated and the resulting URL

**For each platform**:
- API credentials stored as Cloudflare secrets
- Cross-posting triggered via Cloudflare Cron Trigger (scheduled job) or manually via admin endpoint
- Syndication URL stored in D1 and displayed on original post as `u-syndication` microformat link

**dev.to Integration**:
- Uses dev.to REST API (free, no special approval)
- Converts Markdown frontmatter → dev.to article format
- Handles tags mapping (site tags → dev.to tags)
- Published articles get `canonical_url` set to the original post

**Mastodon Integration**:
- Uses Mastodon client credentials API (no Twitter-style API key approval needed)
- Short-form: posts `note` content as-is (up to 500 chars)
- Long-form: posts title + link (articles)

**Cross-posting trigger options**:
- Cloudflare Cron Trigger: runs every X minutes, checks for new/unsynced posts in D1
- Manual: `POST /api/syndicate` with admin key

### Human Tasks Needed (add to HUMAN_TASKS.md when this milestone starts)
- dev.to API key (Profile → Settings → Extensions → API Key)
- Mastodon account + app credentials (Settings → Development → New Application)
- Cloudflare Cron Trigger configuration in `wrangler.toml`

---

## 8B — Backfeed Comment Aggregation

**Depends on**: M8A (POSSE) + M6 (Comment System)  
**Estimated effort**: 2–3 weeks  
**Branch**: `feat/backfeed-aggregation`

Pulls replies/interactions from syndication platforms back as comments on the original content.

**For each platform**:
- Periodic check for replies to syndicated posts (stored in `syndication` table)
- Fetched replies inserted into `comments` D1 table with `source = 'backfeed'` and `approved = 0`
- Deduplication: check by platform post ID before inserting
- Subject to same moderation flow as direct comments

**Platform support**:
- dev.to: comments API (public endpoint, no auth needed for public articles)
- Mastodon: status replies API
- X/Twitter: limited by API tier (read tier may be restrictive)

---

## 8C — LLM-Based Semantic Search

**Depends on**: M5 (Astro 7)  
**Estimated effort**: Research first, then 2–3 weeks implementation  
**Branch**: `feat/semantic-search`

### Research Required (TASK to add when prioritizing)

Evaluate before implementing:

| Option | Cost | Complexity | Latency |
|---|---|---|---|
| **Cloudflare Workers AI** (`@cf/baai/bge-base-en-v1.5`) | ~\$0.011/1000 embeddings, free tier available | Low — native to stack | <50ms at edge |
| **OpenAI `text-embedding-3-small`** | ~\$0.02/1M tokens | Medium — external API | ~100ms |
| **Gemini `embedding-001`** | Free tier, then usage-based | Medium | ~150ms |
| **Cloudflare Vectorize** | Storage + query costs, generous free tier | Medium — needs Vectorize binding | Fast with Workers AI |
| **Fuse.js (fallback)** | Free, client-side | Very Low | ~10ms client-side |

**Recommended research approach**:
1. Check current Cloudflare AI free tier limits (Workers AI quota per day)
2. Check Vectorize free tier (dimensions, namespaces, per-query pricing)
3. Estimate index size: ~100-500 content items × 1 embedding each = very small
4. If Workers AI + Vectorize fits in free tier → use it

**Implementation sketch** (post-research):
- Build-time: Generate embeddings for all content → store in Vectorize index
- Search endpoint: `GET /api/search?q=<query>` → embed query → search Vectorize → return ranked results
- Frontend: Search input → fetch → render results list

---

## 8D — Dark Mode Refinement

**Depends on**: Nothing  
**Estimated effort**: 1 day  
**Branch**: `fix/dark-mode-refinement`

Current state: CSS custom properties set with `defaultTheme: 'light'`. JS toggle exists in `Header.astro`.

Known gap: Toggle may not be consistent across all page types (campaign pages, offer pages, service pages).

**Tasks**:
- [ ] Audit dark mode on every page type: home, article, note, works, illustrations, services, campaign, offer, about, contact, 404
- [ ] Fix any pages that don't respond correctly to the toggle
- [ ] Ensure `prefers-color-scheme` media query is respected as the default (before user toggles)
- [ ] Persist user preference in `localStorage`
- [ ] Test on Safari, Chrome, Firefox

---

## 8E — WebSub Real-Time Distribution

**Depends on**: M5 + M6  
**Estimated effort**: 1 week  
**Branch**: `feat/websub`

Enables real-time push notifications to subscribers when new content is published.

**Implementation sketch**:
- Add WebSub hub links to RSS feed
- On build/deploy: ping `hub.pubsubhubbub.com` (or self-hosted) with the feed URL
- Cloudflare Cron Trigger after deploy confirms the ping

Low priority — webmention.io already handles most IndieWeb notification needs.

---

## Decision Log for Phase 8

All decisions about Phase 8 sub-features should be recorded in `docs/backlog/decisions/architecture-decisions.md` as new ADRs when work begins.
