# Milestone 1 — Security: Fix Live Production Risks

**Branch**: `fix/security-phase-1`  
**Base from**: `main` (`complete_astro_v6_migration` was merged into `main` via PR #1073)  
**Priority**: 🔴 First — live production issues  
**Estimated effort**: 2–3 days  
**Status**: 🔨 Code complete (1.1–1.9 committed) — awaiting push, PR, and CF Pages preview verification

---

## Prerequisites (Human Tasks)

Before starting, confirm in `HUMAN_TASKS.md`:
- [x] **TASK-1A** `DONE ✅` — `RESOURCE_SIGNING_SECRET` generated and stored
- [x] **TASK-1B** `DONE ✅` — `ADMIN_API_KEY` generated and stored

---

## Git Setup

```bash
# Originally: base from complete_astro_v6_migration, but that branch was
# already merged into main (PR #1073), so the branch was created from main:
git checkout main
git pull
git checkout -b fix/security-phase-1
```

---

## Sub-Tasks

### 1.1 — Fix `public/_headers` security headers
**Commit**: `security: fix HTTP security headers`  
**Files**: `public/_headers`

- [x] Remove deprecated `X-XSS-Protection: 1; mode=block`
- [x] Replace `Feature-Policy` with `Permissions-Policy` (same permissions, modern directive)
- [x] Add `X-Frame-Options: DENY`
- [x] Add `Cross-Origin-Opener-Policy: same-origin`
- [x] Tighten `Content-Security-Policy`: `form-action 'self'` (site is alokprateek.in, so `'self'` covers it; all forms verified to post same-origin)
- [x] Add `HSTS preload` directive to `Strict-Transport-Security`

**Expected result** (`public/_headers`):
```
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  X-Frame-Options: DENY
  Cross-Origin-Opener-Policy: same-origin
  Permissions-Policy: geolocation=(), midi=(), sync-xhr=(), microphone=(), camera=(), magnetometer=(), gyroscope=(), fullscreen=(), payment=()
  Content-Security-Policy: form-action 'self'
```

**Verification**: Deploy to CF Pages preview; check headers at https://securityheaders.com

---

### 1.2 — Fix hardcoded secret in `serve-resource.ts`
**Commit**: `security: replace hardcoded HMAC secret with env var`  
**Files**: `src/pages/api/serve-resource.ts`  
**Requires**: TASK-1A DONE

- [x] Replace `const secret = 'your-secret-key-here'` with secret from `locals.runtime.env.RESOURCE_SIGNING_SECRET` (runtime secrets from `wrangler secret put` / `.dev.vars` are not visible via `import.meta.env`)
- [x] Add runtime guard: if secret is missing/empty, return 503 with error (both GET and POST handlers)
- [x] Replace the custom xor-hash token signing with proper Web Crypto HMAC-SHA256
- [x] Update token verification to use `crypto.subtle.verify` with the same key
- [x] Update `.dev.vars.example` (created) with `RESOURCE_SIGNING_SECRET=<generate-with-openssl-rand-hex-32>`

**Verification**: Download flow works end-to-end in local dev with `.dev.vars`

---

### 1.3 — Remove PII console log in `serve-resource.ts`
**Commit**: `security: redact PII from resource download logs`  
**Files**: `src/pages/api/serve-resource.ts`

- [x] Line ~332: `console.log(\`Resource download: ${resourceName} by ${tokenData.email}...\`)`
- [x] Replaced with redacted version: `console.log(\`Resource download: ${resourceName} (attempt ${newAttempts})\`)` — email removed
- [x] Audited remaining console statements in the file — only `console.error(...)` of caught Error objects, no PII

---

### 1.4 — Create admin auth utility
**Commit**: `security: add admin API key auth utility`  
**Files**: `src/lib/api/auth.ts` (new file)  
**Requires**: TASK-1B DONE

- [x] Created `src/lib/api/auth.ts` with `requireAdminAuth(request, env)`
- [x] Constant-time comparison implemented as pure string XOR (no `Buffer` dependency; works in Workers + Node)
- [x] Exported `requireAdminAuth` and `unauthorizedResponse` helper
- [x] `.dev.vars.example` includes `ADMIN_API_KEY`

---

### 1.5 — Protect `GET /api/resource-download` (admin stats endpoint)
**Commit**: `security: require admin auth on resource download stats endpoint`  
**Files**: `src/pages/api/resource-download.ts`

- [x] Import `requireAdminAuth` from `@lib/api/auth`
- [x] In the GET handler, auth check at the top (before any DB access)
- [x] Unit tests updated: 401 without key, 401 with wrong key, 200 with `Authorization: Bearer <key>` (see `tests/unit/api/resource-download-route.spec.ts`)
- [ ] Verify GET `/api/resource-download` returns 401 without the key (live on CF Pages preview)
- [ ] Verify it returns data with `Authorization: Bearer <key>` header (live on CF Pages preview)

---

### 1.6 — Protect campaign CRUD endpoints
**Commit**: `security: require admin auth on campaign write endpoints`  
**Files**: `src/pages/api/campaigns.ts`

- [x] Import `requireAdminAuth` from `@lib/api/auth`
- [x] Auth check added to POST handler (campaign create)
- [x] Auth check added to PUT handler (campaign update)
- [x] Auth check added to DELETE handler (campaign delete)
- [x] GET handler left public (reading campaign data for display is fine)

---

### 1.7 — Remove production console.logs leaking data
**Commit**: `security: remove production console.log data leaks`  
**Files**: 
- `src/components/custom/LeadForm.astro`
- `src/components/custom/NewsletterForm.astro`

- [x] `LeadForm.astro`: Removed `console.log(result)` on form submit (and the now-unused `response.json()` call)
- [x] `NewsletterForm.astro`: Removed `console.log(result)` on subscribe (and the now-unused `response.json()` call)
- [x] Scanned both files — no other unguarded console statements

---

### 1.8 — Fix duplicate submission detection in campaign signup
**Commit**: `security: fix campaign signup duplicate detection to use email`  
**Files**: `src/pages/api/campaign-signup.ts`

- [x] Line ~131-155: dedup previously queried by `utm_source + utm_campaign`
- [x] Replaced with email-based dedup: checks `user_id` (= email, as stored on insert) for this campaign within 24h
- [x] Removed the "allowing anyway" log — now actually blocks with `409 Conflict`

---

### 1.9 — Update `wrangler.toml` secrets documentation
**Commit**: `chore: document required env secrets in wrangler.toml`  
**Files**: `wrangler.toml`, `.dev.vars.example` (created)

- [x] Added comment block to `wrangler.toml` listing all required secrets
- [x] Created `.dev.vars.example` with all local dev variables (no real values)
- [x] Verified `.dev.vars` is in `.gitignore`

---

## Additional commit

- `test: cover admin auth on resource download stats endpoint` — updates the 3 stale GET stats tests for the new auth gate and adds 401 coverage (all 303 unit tests pass)

---

## PR Checklist

Before merging to `main`:

- [ ] Build passes: `npm run build` *(verified via temporary outDir override — see HUMAN_TASKS.md agent notes; a running `astro dev`/workerd session currently locks `dist/` on the local machine)*
- [ ] `GET /api/resource-download` returns 401 without auth header (live)
- [ ] `POST /api/campaigns` returns 401 without auth header (live)
- [ ] Resource download token uses proper HMAC (not xor hash)
- [ ] `public/_headers` passes https://securityheaders.com with A or B rating
- [ ] No `console.log` with user PII in production paths
- [ ] All 1.x commits on branch `fix/security-phase-1`
- [ ] PR opened: `fix/security-phase-1` → `main`
